const ARTICLE_PATTERN = /Artikel(?:en)?\s+\d+(?:\.\d+)?/i;

export function hasArticleRefs(content: string): boolean {
  return ARTICLE_PATTERN.test(content);
}
