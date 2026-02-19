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

export interface Chunk extends ChunkMeta {
  embedding: Float32Array;
}

// Singleton state: metadata array + contiguous vector matrix
let meta: ChunkMeta[] | null = null;
let matrix: Float32Array | null = null; // n × d row-major
let dim: number = EMBEDDING_DIM;        // actual embedding dimension

function loadBinary(): { meta: ChunkMeta[]; matrix: Float32Array; dim: number } {
  const metaPath = join(process.cwd(), "data", "embeddings.meta.json");
  const binPath = join(process.cwd(), "data", "embeddings.bin");
  const m: ChunkMeta[] = JSON.parse(readFileSync(metaPath, "utf-8"));
  const raw = readFileSync(binPath);
  // Vectors are already L2-normalized at build time
  const mat = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const d = m.length > 0 ? mat.length / m.length : EMBEDDING_DIM;
  return { meta: m, matrix: mat, dim: d };
}

function loadJson(): { meta: ChunkMeta[]; matrix: Float32Array; dim: number } {
  const data = readFileSync(
    join(process.cwd(), "data", "embeddings.json"),
    "utf-8"
  );
  const raw: RawChunk[] = JSON.parse(data);
  const d = raw[0]?.embedding.length || EMBEDDING_DIM;
  const m = raw.map((c) => ({
    id: c.id,
    text: c.text,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
  }));
  // Build contiguous matrix and normalize
  const mat = new Float32Array(raw.length * d);
  for (let i = 0; i < raw.length; i++) {
    const offset = i * d;
    const emb = raw[i].embedding;
    let norm2 = 0;
    for (let j = 0; j < d; j++) norm2 += emb[j] * emb[j];
    const invNorm = 1 / Math.sqrt(norm2);
    for (let j = 0; j < d; j++) mat[offset + j] = emb[j] * invNorm;
  }
  return { meta: m, matrix: mat, dim: d };
}

function ensureLoaded() {
  if (!meta) {
    const binPath = join(process.cwd(), "data", "embeddings.bin");
    const loaded = existsSync(binPath) ? loadBinary() : loadJson();
    meta = loaded.meta;
    matrix = loaded.matrix;
    dim = loaded.dim;
  }
}

export function getChunks(): Chunk[] {
  ensureLoaded();
  return meta!.map((c, i) => ({
    ...c,
    embedding: matrix!.subarray(i * dim, (i + 1) * dim),
  }));
}

/**
 * Find the top-K most relevant chunks by cosine similarity.
 *
 * Mathematical optimizations:
 * 1. All vectors are L2-normalized at build time, so cos(q, v) = q · v.
 *    No norm computation or division at query time.
 * 2. Dot products computed directly over the contiguous Float32Array matrix
 *    for optimal CPU cache line utilization (sequential memory access).
 * 3. Inner loop 4-way unrolled — reduces branch overhead and enables
 *    instruction-level parallelism. 1536 % 4 = 0, so no remainder handling.
 * 4. Min-heap of size k for O(n log k) selection instead of O(n log n) sort.
 */
export function findRelevantChunks(
  queryEmbedding: number[],
  topK: number = 5,
  minScore: number = 0
): Chunk[] {
  ensureLoaded();
  const n = meta!.length;
  const mat = matrix!;

  // Normalize the query vector (OpenAI returns unit vectors,
  // but defensive normalization costs ~1μs for 1536 dims)
  const d = dim;
  const q = new Float32Array(queryEmbedding);
  let qNorm2 = 0;
  for (let i = 0; i < d; i++) qNorm2 += q[i] * q[i];
  if (Math.abs(qNorm2 - 1.0) > 1e-6) {
    const invNorm = 1 / Math.sqrt(qNorm2);
    for (let i = 0; i < d; i++) q[i] *= invNorm;
  }

  // Min-heap for top-K: stores (chunkIndex, score) pairs
  const heapIdx: number[] = [];
  const heapScore: number[] = [];

  for (let ci = 0; ci < n; ci++) {
    // Dot product: q · mat[ci] via 4-way unrolled loop over contiguous memory
    const base = ci * d;
    let dot = 0;
    let i = 0;
    for (; i + 3 < d; i += 4) {
      dot +=
        q[i]     * mat[base + i] +
        q[i + 1] * mat[base + i + 1] +
        q[i + 2] * mat[base + i + 2] +
        q[i + 3] * mat[base + i + 3];
    }
    for (; i < d; i++) dot += q[i] * mat[base + i];

    // Min-heap insertion
    if (heapIdx.length < topK) {
      heapIdx.push(ci);
      heapScore.push(dot);
      // Bubble up
      let k = heapIdx.length - 1;
      while (k > 0) {
        const parent = (k - 1) >> 1;
        if (heapScore[k] < heapScore[parent]) {
          [heapIdx[k], heapIdx[parent]] = [heapIdx[parent], heapIdx[k]];
          [heapScore[k], heapScore[parent]] = [heapScore[parent], heapScore[k]];
          k = parent;
        } else break;
      }
    } else if (dot > heapScore[0]) {
      heapIdx[0] = ci;
      heapScore[0] = dot;
      // Sift down
      let k = 0;
      while (true) {
        const left = 2 * k + 1;
        const right = 2 * k + 2;
        let smallest = k;
        if (left < topK && heapScore[left] < heapScore[smallest]) smallest = left;
        if (right < topK && heapScore[right] < heapScore[smallest]) smallest = right;
        if (smallest === k) break;
        [heapIdx[k], heapIdx[smallest]] = [heapIdx[smallest], heapIdx[k]];
        [heapScore[k], heapScore[smallest]] = [heapScore[smallest], heapScore[k]];
        k = smallest;
      }
    }
  }

  // Sort the small heap (size ≤ k) by descending score, then apply threshold
  const indices = heapIdx.map((idx, i) => ({ idx, score: heapScore[i] }));
  indices.sort((a, b) => b.score - a.score);

  return indices
    .filter((entry) => entry.score >= minScore)
    .map((entry) => ({
      ...meta![entry.idx],
      embedding: mat.subarray(entry.idx * d, (entry.idx + 1) * d),
    }));
}
