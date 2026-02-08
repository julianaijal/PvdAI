import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import OpenAI from "openai";
import "dotenv/config";

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

interface Chunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
  embedding: number[];
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

    // Match main document sections (Statuten, Toelichting, Reglementen)
    if (/^(Statuten|Toelichting bij statuten|Reglementen)\s*$/.test(trimmed)) {
      flushBuffer();
      currentArticle = null;
      currentChapter = null;
      const baseId = trimmed.toLowerCase().replace(/\s+/g, "-");
      sectionCount[baseId] = (sectionCount[baseId] || 0) + 1;
      const id = sectionCount[baseId] > 1 ? `${baseId}-${sectionCount[baseId]}` : baseId;
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

    // Match "Hoofdstuk X:" or "Deel X" patterns
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

    // Match "Artikel X." patterns
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
      // Chunk the content
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

async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const batchSize = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(
      `  Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}...`
    );
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    for (const item of response.data) {
      embeddings.push(item.embedding);
    }
  }

  return embeddings;
}

async function main() {
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
  console.log(`   Created ${rawChunks.length} chunks`);

  console.log("4. Generating embeddings...");
  const embeddings = await generateEmbeddings(rawChunks.map((c) => c.text));

  const chunks: Chunk[] = rawChunks.map((c, i) => ({
    id: i,
    text: c.text,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
    embedding: embeddings[i],
  }));

  console.log("5. Writing output files...");
  mkdirSync(DATA_DIR, { recursive: true });

  writeFileSync(
    join(DATA_DIR, "structure.json"),
    JSON.stringify(structure, null, 2)
  );

  writeFileSync(join(DATA_DIR, "embeddings.json"), JSON.stringify(chunks));

  console.log("Done!");
  console.log(`   structure.json: ${structure.length} sections`);
  console.log(`   embeddings.json: ${chunks.length} chunks`);
}

main().catch(console.error);
