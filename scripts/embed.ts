import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import OpenAI from "openai";
import "dotenv/config";

const DATA_DIR = join(process.cwd(), "data");
const CHUNKS_PATH = join(DATA_DIR, "chunks.json");
const EMBEDDINGS_PATH = join(DATA_DIR, "embeddings.json");
const META_PATH = join(DATA_DIR, "embeddings.meta.json");
const VECTORS_PATH = join(DATA_DIR, "embeddings.bin");

interface Chunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
}

interface ChunkWithEmbedding extends Chunk {
  embedding: number[];
}

const EMBEDDING_DIM = 1536;

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
  // Skip if binary format already exists
  if (existsSync(VECTORS_PATH) && existsSync(META_PATH)) {
    console.log("Binary embeddings already exist, skipping generation.");
    return;
  }

  // Also accept legacy JSON format as "already generated"
  if (existsSync(EMBEDDINGS_PATH)) {
    console.log("Found embeddings.json, converting to binary format...");
    const raw: ChunkWithEmbedding[] = JSON.parse(readFileSync(EMBEDDINGS_PATH, "utf-8"));
    writeBinaryFormat(raw);
    console.log("Done! Binary embeddings written.");
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

  console.log("3. Writing binary embeddings...");
  writeBinaryFormat(chunksWithEmbeddings);

  // Also write legacy JSON for backward compatibility during transition
  console.log("4. Writing embeddings.json (legacy)...");
  writeFileSync(EMBEDDINGS_PATH, JSON.stringify(chunksWithEmbeddings));

  console.log("Done!");
}

function writeBinaryFormat(chunks: ChunkWithEmbedding[]) {
  // Metadata: chunk info without embeddings
  const meta = chunks.map((c) => ({
    id: c.id,
    text: c.text,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
  }));
  writeFileSync(META_PATH, JSON.stringify(meta));

  // Vectors: flat Float32Array buffer
  const buffer = new Float32Array(chunks.length * EMBEDDING_DIM);
  for (let i = 0; i < chunks.length; i++) {
    buffer.set(chunks[i].embedding, i * EMBEDDING_DIM);
  }
  writeFileSync(VECTORS_PATH, Buffer.from(buffer.buffer));

  const metaSize = (readFileSync(META_PATH).length / 1024).toFixed(0);
  const binSize = (buffer.byteLength / 1024 / 1024).toFixed(1);
  console.log(`   Meta: ${metaSize}KB, Vectors: ${binSize}MB (was ~24MB JSON)`);
}

main().catch(console.error);
