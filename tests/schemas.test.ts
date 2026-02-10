import { describe, it, expect } from "vitest";
import { AskRequestSchema, SectionRequestSchema } from "@/lib/schemas";

describe("AskRequestSchema", () => {
  it("accepts a valid question", () => {
    const result = AskRequestSchema.safeParse({ question: "Hoe word ik lid?" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = AskRequestSchema.safeParse({ question: "  Hoe word ik lid?  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe("Hoe word ik lid?");
    }
  });

  it("rejects empty question", () => {
    const result = AskRequestSchema.safeParse({ question: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only question", () => {
    const result = AskRequestSchema.safeParse({ question: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects question over 500 chars", () => {
    const result = AskRequestSchema.safeParse({ question: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("accepts question with valid history", () => {
    const result = AskRequestSchema.safeParse({
      question: "Vraag",
      history: [
        { role: "user", content: "Eerste vraag" },
        { role: "assistant", content: "Antwoord" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects history with more than 6 messages", () => {
    const history = Array.from({ length: 7 }, (_, i) => ({
      role: i % 2 === 0 ? "user" as const : "assistant" as const,
      content: "msg",
    }));
    const result = AskRequestSchema.safeParse({ question: "Vraag", history });
    expect(result.success).toBe(false);
  });

  it("rejects history with invalid role", () => {
    const result = AskRequestSchema.safeParse({
      question: "Vraag",
      history: [{ role: "system", content: "hack" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts question without history", () => {
    const result = AskRequestSchema.safeParse({ question: "Vraag" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history).toBeUndefined();
    }
  });
});

describe("SectionRequestSchema", () => {
  it("accepts a valid id", () => {
    const result = SectionRequestSchema.safeParse({ id: "artikel-4" });
    expect(result.success).toBe(true);
  });

  it("rejects empty id", () => {
    const result = SectionRequestSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = SectionRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
