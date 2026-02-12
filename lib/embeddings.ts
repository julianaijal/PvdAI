import { readFileSync, existsSync } from "fs";
import { join } from "path";

const EMBEDDING_DIM = 1536;

interface ChunkMeta {
  id: number;
  text: string;
  sectionId: string;
  sectionTitle: string;
}

interface RawChunk extends ChunkMeta {
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

function computeNorm(emb: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < emb.length; i++) {
    sum += emb[i] * emb[i];
  }
  return Math.sqrt(sum);
}

function loadBinary(): Chunk[] {
  const metaPath = join(process.cwd(), "data", "embeddings.meta.json");
  const binPath = join(process.cwd(), "data", "embeddings.bin");
  const meta: ChunkMeta[] = JSON.parse(readFileSync(metaPath, "utf-8"));
  const raw = readFileSync(binPath);
  const vectors = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);

  return meta.map((c, i) => {
    const emb = vectors.subarray(i * EMBEDDING_DIM, (i + 1) * EMBEDDING_DIM);
    return {
      id: c.id,
      text: c.text,
      sectionId: c.sectionId,
      sectionTitle: c.sectionTitle,
      embedding: emb,
      norm: computeNorm(emb),
    };
  });
}

function loadJson(): Chunk[] {
  const data = readFileSync(
    join(process.cwd(), "data", "embeddings.json"),
    "utf-8"
  );
  const raw: RawChunk[] = JSON.parse(data);
  return raw.map((c) => {
    const emb = new Float32Array(c.embedding);
    return {
      id: c.id,
      text: c.text,
      sectionId: c.sectionId,
      sectionTitle: c.sectionTitle,
      embedding: emb,
      norm: computeNorm(emb),
    };
  });
}

export function getChunks(): Chunk[] {
  if (!chunks) {
    const binPath = join(process.cwd(), "data", "embeddings.bin");
    chunks = existsSync(binPath) ? loadBinary() : loadJson();
  }
  return chunks!;
}

export function findRelevantChunks(
  queryEmbedding: number[],
  topK: number = 5
): Chunk[] {
  const allChunks = getChunks();
  const q = new Float32Array(queryEmbedding);
  const qNorm = computeNorm(q);

  // Min-heap for top-K selection: O(n log k) instead of O(n log n) full sort
  const heap: { chunk: Chunk; score: number }[] = [];

  const dim = q.length;

  for (const chunk of allChunks) {
    let dot = 0;
    const emb = chunk.embedding;
    for (let i = 0; i < dim; i++) {
      dot += q[i] * emb[i];
    }
    const score = dot / (qNorm * chunk.norm);

    if (heap.length < topK) {
      heap.push({ chunk, score });
      // Bubble up to maintain min-heap
      let idx = heap.length - 1;
      while (idx > 0) {
        const parent = (idx - 1) >> 1;
        if (heap[idx].score < heap[parent].score) {
          [heap[idx], heap[parent]] = [heap[parent], heap[idx]];
          idx = parent;
        } else break;
      }
    } else if (score > heap[0].score) {
      // Replace min element and sift down
      heap[0] = { chunk, score };
      let idx = 0;
      while (true) {
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        let smallest = idx;
        if (left < topK && heap[left].score < heap[smallest].score) smallest = left;
        if (right < topK && heap[right].score < heap[smallest].score) smallest = right;
        if (smallest === idx) break;
        [heap[idx], heap[smallest]] = [heap[smallest], heap[idx]];
        idx = smallest;
      }
    }
  }

  // Sort the small heap (size k) in descending order — O(k log k), negligible
  heap.sort((a, b) => b.score - a.score);
  return heap.map((s) => s.chunk);
}
