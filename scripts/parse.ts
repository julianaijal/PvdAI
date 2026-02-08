import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PDF_PATH = join(
  process.cwd(),
  "public",
  "Statuten-en-reglementen-PvdA-2023.pdf"
);
const DATA_DIR = join(process.cwd(), "data");
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

interface Section {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Section[];
}

function extractText(): string {
  return execSync(`pdftotext "${PDF_PATH}" -`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

/**
 * The PDF has this structure (each appearing multiple times due to
 * title pages, TOC pages, and then actual content):
 *
 *   Statuten                          (title page)
 *   Statuten                          (TOC — lists chapters + page numbers)
 *   Statuten                          (actual content with articles)
 *   Toelichting bij statuten          (TOC)
 *   Toelichting bij statuten          (actual content)
 *   Reglementen                       (title page)
 *   Reglementen                       (TOC)
 *   Reglementen                       (actual content — uses "Deel" + "Hoofdstuk")
 *   Toelichting bij/op de reglementen (TOC)
 *   Toelichting bij reglementen       (actual content)
 *
 * Strategy: parse everything, then keep only the LAST occurrence of each
 * main section (which is the one with actual article content).
 */

const MAIN_SECTION_RE =
  /^(Statuten|Toelichting bij statuten|Toelichting op de reglementen|Toelichting bij reglementen|Reglementen)\s*$/;

const CHAPTER_RE =
  /^(Hoofdstuk\s+[\d.]+[.:]\s*.+|Deel\s+\d+[.:]\s*.+)$/i;

const ARTICLE_RE = /^(Artikel\s+[\d.]+[a-z]?\.?\s*.*)$/i;

/** Lines that are just a page number (stray from pdftotext) */
const PAGE_NUMBER_RE = /^\d{1,3}$/;

function makeId(prefix: string, text: string): string {
  return (
    prefix +
    text
      .toLowerCase()
      .replace(/[.:,;'"()]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 80)
  );
}

function parseStructure(text: string): Section[] {
  const lines = text.split("\n");
  const allSections: Section[] = [];

  let currentMain: Section | null = null;
  let currentChapter: Section | null = null;
  let currentArticle: Section | null = null;
  let buffer: string[] = [];

  function flushBuffer() {
    const content = buffer
      .filter((l) => !PAGE_NUMBER_RE.test(l.trim()))
      .join("\n")
      .trim();

    if (!content) {
      buffer = [];
      return;
    }

    if (currentArticle) {
      currentArticle.content +=
        (currentArticle.content ? "\n" : "") + content;
    } else if (currentChapter) {
      currentChapter.content +=
        (currentChapter.content ? "\n" : "") + content;
    } else if (currentMain) {
      currentMain.content += (currentMain.content ? "\n" : "") + content;
    }
    buffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines — accumulate them as paragraph breaks
    if (!trimmed) {
      if (buffer.length > 0) buffer.push("");
      continue;
    }

    // Main section header
    if (MAIN_SECTION_RE.test(trimmed)) {
      flushBuffer();
      currentArticle = null;
      currentChapter = null;
      currentMain = {
        id: "", // assigned later
        title: trimmed,
        level: 0,
        content: "",
        children: [],
      };
      allSections.push(currentMain);
      continue;
    }

    // Chapter / Deel header
    if (CHAPTER_RE.test(trimmed) && currentMain) {
      flushBuffer();
      currentArticle = null;
      const prefix = currentMain.title.toLowerCase().replace(/\s+/g, "-") + "--";
      currentChapter = {
        id: makeId(prefix, trimmed),
        title: trimmed,
        level: 1,
        content: "",
        children: [],
      };
      currentMain.children.push(currentChapter);
      continue;
    }

    // Article header
    if (ARTICLE_RE.test(trimmed)) {
      flushBuffer();
      const parentPrefix = currentChapter
        ? currentChapter.id + "--"
        : currentMain
          ? currentMain.title.toLowerCase().replace(/\s+/g, "-") + "--"
          : "";
      currentArticle = {
        id: makeId(parentPrefix, trimmed),
        title: trimmed,
        level: 2,
        content: "",
        children: [],
      };
      const parent = currentChapter || currentMain;
      if (parent) parent.children.push(currentArticle);
      continue;
    }

    buffer.push(trimmed);
  }

  flushBuffer();

  // --- Deduplicate: keep only the LAST occurrence of each main section title,
  // which is the one with actual content (articles), not the TOC/title page. ---
  const lastByTitle = new Map<string, Section>();
  for (const s of allSections) {
    lastByTitle.set(s.title, s);
  }

  // Merge "Toelichting op de reglementen" into "Toelichting bij reglementen"
  // if both exist (they refer to the same thing in different pages)
  const toeOp = lastByTitle.get("Toelichting op de reglementen");
  const toeBij = lastByTitle.get("Toelichting bij reglementen");
  if (toeOp && toeBij) {
    // Keep whichever has more content
    if (toeOp.children.length > toeBij.children.length) {
      lastByTitle.delete("Toelichting bij reglementen");
    } else {
      lastByTitle.delete("Toelichting op de reglementen");
    }
  }

  // Assign stable IDs
  const idCounts: Record<string, number> = {};
  const result: Section[] = [];
  for (const s of lastByTitle.values()) {
    const baseId = s.title.toLowerCase().replace(/\s+/g, "-");
    idCounts[baseId] = (idCounts[baseId] || 0) + 1;
    s.id = idCounts[baseId] > 1 ? `${baseId}-${idCounts[baseId]}` : baseId;
    result.push(s);
  }

  return result;
}

/** Remove "Inhoudsopgave" and following TOC-like lines from section content */
function cleanTocFromContent(sections: Section[]) {
  for (const s of sections) {
    // Remove leading metadata (dates, "Inhoudsopgave", page-number-only lines)
    const lines = s.content.split("\n");
    const cleaned: string[] = [];
    let pastPreamble = false;

    for (const line of lines) {
      const t = line.trim();
      if (!pastPreamble) {
        // Skip preamble lines: dates, "Februari 2023", "Vastgesteld...", "Gewijzigd...",
        // "Inhoudsopgave", and bare page numbers
        if (
          /^(Februari|Maart|Januari|April|Mei|Juni|Juli|Augustus|September|Oktober|November|December)\s+\d{4}$/.test(t) ||
          /^(Vastgesteld|Gewijzigd)\s+op\s+/.test(t) ||
          t === "Inhoudsopgave" ||
          PAGE_NUMBER_RE.test(t) ||
          t === ""
        ) {
          continue;
        }
        pastPreamble = true;
      }
      cleaned.push(line);
    }
    s.content = cleaned.join("\n").trim();

    cleanTocFromContent(s.children);
  }
}

function chunkText(
  sections: Section[]
): { text: string; sectionId: string; sectionTitle: string }[] {
  const chunks: { text: string; sectionId: string; sectionTitle: string }[] = [];

  function processSection(section: Section) {
    const fullText = section.content.trim();
    if (fullText.length > 0) {
      // Split on paragraph boundaries instead of mid-word
      const paragraphs = fullText.split(/\n\s*\n/);
      let current = "";

      for (const para of paragraphs) {
        const candidate = current
          ? current + "\n\n" + para
          : para;

        if (candidate.length > CHUNK_SIZE && current.length > 50) {
          chunks.push({
            text: `${section.title}\n\n${current}`,
            sectionId: section.id,
            sectionTitle: section.title,
          });
          // Overlap: keep the last paragraph as context for the next chunk
          current = para;
        } else {
          current = candidate;
        }
      }

      if (current.trim().length > 50) {
        chunks.push({
          text: `${section.title}\n\n${current}`,
          sectionId: section.id,
          sectionTitle: section.title,
        });
      }
    }
    for (const child of section.children) {
      processSection(child);
    }
  }

  for (const section of sections) {
    processSection(section);
  }
  return chunks;
}

function main() {
  console.log("1. Extracting text from PDF...");
  const text = extractText();
  console.log(`   Extracted ${text.length} characters`);

  console.log("2. Parsing document structure...");
  const structure = parseStructure(text);
  cleanTocFromContent(structure);

  let totalChapters = 0;
  let totalArticles = 0;
  for (const s of structure) {
    totalChapters += s.children.length;
    for (const c of s.children) {
      totalArticles += c.children.length;
    }
  }
  console.log(
    `   Found ${structure.length} main sections, ${totalChapters} chapters, ${totalArticles} articles`
  );

  console.log("3. Chunking text...");
  const rawChunks = chunkText(structure);
  const chunks = rawChunks.map((c, i) => ({
    id: i,
    text: c.text,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
  }));
  console.log(`   Created ${chunks.length} chunks`);

  console.log("4. Generating TOC...");
  function buildToc(
    sections: Section[]
  ): { id: string; title: string; level: number; children: ReturnType<typeof buildToc> }[] {
    return sections.map((s) => ({
      id: s.id,
      title: s.title,
      level: s.level,
      children: buildToc(s.children),
    }));
  }
  const toc = buildToc(structure);

  console.log("5. Writing output files...");
  mkdirSync(DATA_DIR, { recursive: true });

  writeFileSync(
    join(DATA_DIR, "structure.json"),
    JSON.stringify(structure, null, 2)
  );

  writeFileSync(join(DATA_DIR, "toc.json"), JSON.stringify(toc, null, 2));

  writeFileSync(
    join(DATA_DIR, "chunks.json"),
    JSON.stringify(chunks, null, 2)
  );

  console.log("Done!");
  console.log(`   structure.json: ${structure.length} main sections`);
  console.log(`   toc.json: lightweight TOC`);
  console.log(`   chunks.json: ${chunks.length} chunks`);
}

main();
