import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import OpenAI from "openai";
import "dotenv/config";

const DATA_DIR = join(process.cwd(), "data");
const CHUNKS_PATH = join(DATA_DIR, "chunks.json");
const EMBEDDINGS_PATH = join(DATA_DIR, "embeddings.json");

interface Chunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
}

interface ChunkWithEmbedding extends Chunk {
  embedding: number[];
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_PVDAI || process.env.OPENAI_API_KEY });
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
  if (existsSync(EMBEDDINGS_PATH)) {
    console.log("embeddings.json already exists, skipping generation.");
    return;
  }

  if (!existsSync(CHUNKS_PATH)) {
    console.error("chunks.json not found. Run parse.ts first.");
    process.exit(1);
  }

  console.log("1. Loading chunks...");
  const chunks: Chunk[] = JSON.parse(readFileSync(CHUNKS_PATH, "utf-8"));
  console.log(`   Loaded ${chunks.length} chunks`);

  console.log("2. Generating embeddings...");
  const embeddings = await generateEmbeddings(chunks.map((c) => c.text));

  const chunksWithEmbeddings: ChunkWithEmbedding[] = chunks.map((c, i) => ({
    ...c,
    embedding: embeddings[i],
  }));

  console.log("3. Writing embeddings.json...");
  writeFileSync(EMBEDDINGS_PATH, JSON.stringify(chunksWithEmbeddings));

  console.log("Done!");
}

main().catch(console.error);
