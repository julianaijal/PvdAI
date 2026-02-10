import { readFileSync } from "fs";
import { join } from "path";

interface RawChunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
  embedding: number[];
}

interface Chunk {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
  embedding: Float32Array;
  norm: number;
}

let chunks: Chunk[] | null = null;

export function getChunks(): Chunk[] {
  if (!chunks) {
    const data = readFileSync(
      join(process.cwd(), "data", "embeddings.json"),
      "utf-8"
    );
    const raw: RawChunk[] = JSON.parse(data);
    chunks = raw.map((c) => {
      const emb = new Float32Array(c.embedding);
      let norm = 0;
      for (let i = 0; i < emb.length; i++) {
        norm += emb[i] * emb[i];
      }
      return {
        id: c.id,
        text: c.text,
        sectionId: c.sectionId,
        sectionTitle: c.sectionTitle,
        embedding: emb,
        norm: Math.sqrt(norm),
      };
    });
  }
  return chunks!;
}

export function findRelevantChunks(
  queryEmbedding: number[],
  topK: number = 5
): Chunk[] {
  const allChunks = getChunks();
  const q = new Float32Array(queryEmbedding);
  let qNorm = 0;
  for (let i = 0; i < q.length; i++) {
    qNorm += q[i] * q[i];
  }
  qNorm = Math.sqrt(qNorm);

  const scored = allChunks.map((chunk) => {
    let dot = 0;
    const emb = chunk.embedding;
    for (let i = 0; i < q.length; i++) {
      dot += q[i] * emb[i];
    }
    return { chunk, score: dot / (qNorm * chunk.norm) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}
