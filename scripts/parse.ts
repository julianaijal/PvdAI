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
  const output = execSync(`pdftotext "${PDF_PATH}" -`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return output;
}

function parseStructure(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentMainSection: Section | null = null;
  let currentChapter: Section | null = null;
  let currentArticle: Section | null = null;
  let buffer: string[] = [];

  function flushBuffer() {
    const content = buffer.join("\n").trim();
    if (currentArticle) {
      currentArticle.content += (currentArticle.content ? "\n" : "") + content;
    } else if (currentChapter) {
      currentChapter.content += (currentChapter.content ? "\n" : "") + content;
    } else if (currentMainSection) {
      currentMainSection.content +=
        (currentMainSection.content ? "\n" : "") + content;
    }
    buffer = [];
  }

  const sectionCount: Record<string, number> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^(Statuten|Toelichting bij statuten|Reglementen)\s*$/.test(trimmed)) {
      flushBuffer();
      currentArticle = null;
      currentChapter = null;
      const baseId = trimmed.toLowerCase().replace(/\s+/g, "-");
      sectionCount[baseId] = (sectionCount[baseId] || 0) + 1;
      const id =
        sectionCount[baseId] > 1
          ? `${baseId}-${sectionCount[baseId]}`
          : baseId;
      currentMainSection = {
        id,
        title: trimmed,
        level: 0,
        content: "",
        children: [],
      };
      sections.push(currentMainSection);
      continue;
    }

    const chapterMatch = trimmed.match(
      /^(Hoofdstuk\s+\d+[.:]\s*.+|Deel\s+\d+[.:]\s*.+)$/i
    );
    if (chapterMatch && currentMainSection) {
      flushBuffer();
      currentArticle = null;
      currentChapter = {
        id: trimmed
          .toLowerCase()
          .replace(/[.:]/g, "")
          .replace(/\s+/g, "-"),
        title: trimmed,
        level: 1,
        content: "",
        children: [],
      };
      currentMainSection.children.push(currentChapter);
      continue;
    }

    const articleMatch = trimmed.match(/^(Artikel\s+\d+[\w.]*\.?\s*.*)$/i);
    if (articleMatch) {
      flushBuffer();
      const parent = currentChapter || currentMainSection;
      currentArticle = {
        id: trimmed
          .toLowerCase()
          .replace(/[.]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 60),
        title: trimmed,
        level: 2,
        content: "",
        children: [],
      };
      if (parent) {
        parent.children.push(currentArticle);
      }
      continue;
    }

    buffer.push(trimmed);
  }

  flushBuffer();
  return sections;
}

function chunkText(
  sections: Section[]
): { text: string; sectionId: string; sectionTitle: string }[] {
  const chunks: { text: string; sectionId: string; sectionTitle: string }[] =
    [];

  function processSection(section: Section) {
    const fullText = section.content.trim();
    if (fullText.length > 0) {
      for (let i = 0; i < fullText.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        const chunk = fullText.substring(i, i + CHUNK_SIZE);
        if (chunk.trim().length > 50) {
          chunks.push({
            text: `${section.title}\n\n${chunk}`,
            sectionId: section.id,
            sectionTitle: section.title,
          });
        }
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
  console.log(
    `   Found ${structure.length} main sections with ${structure.reduce((acc, s) => acc + s.children.length, 0)} chapters`
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
  function buildToc(sections: Section[]): { id: string; title: string; level: number; children: ReturnType<typeof buildToc> }[] {
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

  writeFileSync(
    join(DATA_DIR, "toc.json"),
    JSON.stringify(toc, null, 2)
  );

  writeFileSync(
    join(DATA_DIR, "chunks.json"),
    JSON.stringify(chunks, null, 2)
  );

  console.log("Done!");
  console.log(`   structure.json: ${structure.length} sections`);
  console.log(`   toc.json: ${toc.length} sections (lightweight)`);
  console.log(`   chunks.json: ${chunks.length} chunks`);
}

main();
