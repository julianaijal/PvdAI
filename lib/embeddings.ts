import { readFileSync } from "fs";
import { join } from "path";

interface Chunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
  embedding: number[];
}

let chunks: Chunk[] | null = null;

export function getChunks(): Chunk[] {
  if (!chunks) {
    const data = readFileSync(
      join(process.cwd(), "data", "embeddings.json"),
      "utf-8"
    );
    chunks = JSON.parse(data);
  }
  return chunks!;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findRelevantChunks(
  queryEmbedding: number[],
  topK: number = 8
): Chunk[] {
  const allChunks = getChunks();
  const scored = allChunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}
