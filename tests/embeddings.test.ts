import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs to avoid loading real embeddings file
vi.mock("fs", () => ({
  readFileSync: vi.fn(() =>
    JSON.stringify([
      { id: 0, text: "chunk A", sectionId: "s1", sectionTitle: "Section 1", embedding: [1, 0, 0] },
      { id: 1, text: "chunk B", sectionId: "s2", sectionTitle: "Section 2", embedding: [0, 1, 0] },
      { id: 2, text: "chunk C", sectionId: "s3", sectionTitle: "Section 3", embedding: [0, 0, 1] },
      { id: 3, text: "chunk D", sectionId: "s4", sectionTitle: "Section 4", embedding: [0.7, 0.7, 0] },
    ])
  ),
  existsSync: vi.fn(() => false),
}));

let findRelevantChunks: typeof import("@/lib/embeddings").findRelevantChunks;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("@/lib/embeddings");
  findRelevantChunks = mod.findRelevantChunks;
});

describe("findRelevantChunks", () => {
  it("returns the most similar chunk first", () => {
    // Query vector [1, 0, 0] should match chunk A exactly
    const results = findRelevantChunks([1, 0, 0], 1);
    expect(results).toHaveLength(1);
    expect(results[0].text).toBe("chunk A");
  });

  it("respects topK parameter", () => {
    const results = findRelevantChunks([1, 0, 0], 2);
    expect(results).toHaveLength(2);
  });

  it("ranks by cosine similarity", () => {
    // Query [0.7, 0.7, 0] should match chunk D best, then A and B equally
    const results = findRelevantChunks([0.7, 0.7, 0], 4);
    expect(results[0].text).toBe("chunk D");
  });

  it("returns all chunks when topK exceeds count", () => {
    const results = findRelevantChunks([1, 0, 0], 100);
    expect(results).toHaveLength(4);
  });

  it("handles orthogonal vectors with zero similarity", () => {
    // [1, 0, 0] has zero similarity with [0, 0, 1]
    const results = findRelevantChunks([1, 0, 0], 4);
    const lastChunk = results[results.length - 1];
    expect(lastChunk.text).toBe("chunk C");
  });
});
