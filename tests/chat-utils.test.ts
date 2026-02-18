import { describe, it, expect } from "vitest";
import { hasArticleRefs } from "@/lib/chat-utils";

describe("hasArticleRefs", () => {
  it("returns true when content contains 'Artikel N'", () => {
    expect(hasArticleRefs("Zie Artikel 5 voor meer info.")).toBe(true);
  });

  it("returns true for decimal article numbers", () => {
    expect(hasArticleRefs("Artikel 1.12 regelt dit.")).toBe(true);
  });

  it("returns true for plural 'Artikelen'", () => {
    expect(hasArticleRefs("Artikelen 3 en 5 zijn van toepassing.")).toBe(true);
  });

  it("returns false when no article refs present", () => {
    expect(hasArticleRefs("Er zijn geen specifieke regels.")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasArticleRefs("")).toBe(false);
  });
});
