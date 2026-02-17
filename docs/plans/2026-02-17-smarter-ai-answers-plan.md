# Smarter AI Answers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve RAG answer quality through re-ranking, source highlighting, and better context handling.

**Architecture:** Widen retrieval to 10 chunks, re-rank with gpt-4.1-nano, filter by relevance threshold, stream sources metadata after answer, and highlight source passages in the document browser.

**Tech Stack:** OpenAI Responses API (gpt-4.1-nano for re-ranking), SSE streaming, React state, CSS mark highlighting.

---

### Task 1: Return similarity scores from findRelevantChunks

**Files:**
- Modify: `lib/embeddings.ts:93-171`
- Modify: `tests/embeddings.test.ts`

**Step 1: Update the return type to include scores**

In `lib/embeddings.ts`, add a `score` field to the return type:

```typescript
export interface ChunkWithScore extends Chunk {
  score: number;
}
```

Change `findRelevantChunks` return type from `Chunk[]` to `ChunkWithScore[]`:

```typescript
export function findRelevantChunks(
  queryEmbedding: number[],
  topK: number = 5
): ChunkWithScore[] {
```

In the return statement (line ~167), include the score:

```typescript
return indices.map((entry) => ({
  ...meta![entry.idx],
  embedding: mat.subarray(entry.idx * d, (entry.idx + 1) * d),
  score: entry.score,
}));
```

**Step 2: Update tests**

In `tests/embeddings.test.ts`, verify scores are returned:

```typescript
it("returns scores with chunks", () => {
  const results = findRelevantChunks(queryEmbedding, 2);
  expect(results[0]).toHaveProperty("score");
  expect(typeof results[0].score).toBe("number");
  expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
});
```

**Step 3: Run tests**

Run: `npm test`
Expected: All pass.

**Step 4: Commit**

```bash
git add lib/embeddings.ts tests/embeddings.test.ts
git commit -m "return similarity scores from findRelevantChunks"
```

---

### Task 2: Add re-ranking function

**Files:**
- Modify: `app/api/ask/route.ts`

**Step 1: Add rerankChunks function**

Add after the `rewriteQuery` function (~line 93):

```typescript
async function rerankChunks(
  question: string,
  chunks: { text: string; sectionTitle: string; sectionId: string }[]
): Promise<number[]> {
  const numbered = chunks
    .map((c, i) => `[${i}] ${c.sectionTitle}: ${c.text.slice(0, 200)}`)
    .join("\n\n");

  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    instructions:
      "Je krijgt een vraag en genummerde tekstfragmenten. Geef de nummers terug van de 5 meest relevante fragmenten, gesorteerd op relevantie. Antwoord ALLEEN met komma-gescheiden nummers, bijv: 3,0,7,2,5",
    input: `Vraag: ${question}\n\nFragmenten:\n${numbered}`,
    max_output_tokens: 30,
    store: false,
  });

  const text = response.output_text?.trim() || "";
  const indices = text
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n < chunks.length);

  return indices.length > 0 ? indices.slice(0, 5) : [0, 1, 2, 3, 4];
}
```

**Step 2: Commit**

```bash
git add app/api/ask/route.ts
git commit -m "add rerankChunks function using gpt-4.1-nano"
```

---

### Task 3: Wire up re-ranking and relevance threshold in the ask route

**Files:**
- Modify: `app/api/ask/route.ts:130-136`

**Step 1: Update retrieval pipeline**

Replace the current chunk retrieval block:

```typescript
// Find relevant chunks
const relevantChunks = findRelevantChunks(queryEmbedding, 5);
const context = relevantChunks
  .map((c) => `[${c.sectionTitle}]\n${c.text}`)
  .join("\n\n---\n\n");
```

With:

```typescript
// Find top 10 candidates, filter by relevance, then re-rank to top 5
const candidates = findRelevantChunks(queryEmbedding, 10);
const relevant = candidates.filter((c) => c.score >= 0.3);

let relevantChunks;
if (relevant.length <= 5) {
  relevantChunks = relevant;
} else {
  const rankedIndices = await rerankChunks(searchQuery, relevant);
  relevantChunks = rankedIndices.map((i) => relevant[i]);
}

const context = relevantChunks
  .map((c) => `[${c.sectionTitle} | ${c.sectionId}]\n${c.text}`)
  .join("\n\n---\n\n");
```

**Step 2: Commit**

```bash
git add app/api/ask/route.ts
git commit -m "wire up re-ranking and relevance threshold"
```

---

### Task 4: Increase max output tokens and send sources after stream

**Files:**
- Modify: `app/api/ask/route.ts:149,168`

**Step 1: Increase max_output_tokens**

Change line 149 from `max_output_tokens: 512` to `max_output_tokens: 800`.

**Step 2: Send sources metadata before [DONE]**

After the streaming for-await loop completes (after line 167), add:

```typescript
// Send source chunks metadata
const sources = relevantChunks.map((c) => ({
  sectionId: c.sectionId,
  sectionTitle: c.sectionTitle,
  text: c.text.slice(0, 150),
}));
controller.enqueue(
  encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`)
);
```

Note: `relevantChunks` needs to be accessible inside the ReadableStream closure. Move it to be declared before the `new ReadableStream` or capture it in the closure scope (it already is since it's in the same `try` block).

**Step 3: Commit**

```bash
git add app/api/ask/route.ts
git commit -m "increase max tokens to 800 and send source metadata after stream"
```

---

### Task 5: Handle sources in Chat client

**Files:**
- Modify: `app/components/Chat/Chat.tsx:9-13,487-501`

**Step 1: Add sources to Message interface**

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  sources?: { sectionId: string; sectionTitle: string; text: string }[];
}
```

**Step 2: Handle sources SSE event**

In the SSE parsing loop (after the `parsed.delta` block, ~line 497), add:

```typescript
if (parsed.sources) {
  setMessages((prev) => {
    const updated = [...prev];
    const last = updated[updated.length - 1];
    updated[updated.length - 1] = {
      ...last,
      sources: parsed.sources,
    };
    return updated;
  });
}
```

**Step 3: Commit**

```bash
git add app/components/Chat/Chat.tsx
git commit -m "handle source metadata from SSE stream in Chat"
```

---

### Task 6: Pass source highlight text to DocumentBrowser

**Files:**
- Modify: `app/components/Chat/Chat.tsx` (ChatProps, onArticleClick)
- Modify: `app/components/MainLayout/MainLayout.tsx`
- Modify: `app/components/DocumentBrowser/DocumentBrowser.tsx`

**Step 1: Extend onArticleClick to include source text**

In `Chat.tsx`, update the `ChatProps` interface:

```typescript
interface ChatProps {
  onArticleClick?: (articleId: string, sourceText?: string) => void;
  toc?: TocItem[];
}
```

When rendering article ref buttons from source-backed messages, pass the matching source text. In `makeArticleButton`, the `onClick` already calls `onClick(tocId)`. To pass source text, the Chat component needs to find the source matching the clicked article.

In `ChatMessage`, update the `onArticleClick` call to search message sources:

This requires threading sources through the markdown components. The simplest approach: in `useMarkdownComponents`, accept an optional `sources` array and pass it to `processChildren`. When `makeArticleButton` is called and a source matches the article's sectionId, include the source text.

Update `makeArticleButton`:

```typescript
function makeArticleButton(
  text: string,
  key: string,
  index: number | string,
  onClick?: (id: string, sourceText?: string) => void,
  articleLookup?: Map<string, string>,
  sources?: { sectionId: string; text: string }[]
): React.ReactElement {
  const tocId = articleLookup?.get(key);
  if (tocId && onClick) {
    const source = sources?.find((s) => s.sectionId === tocId);
    return (
      <button
        key={index}
        className={styles.articleRef}
        onClick={() => onClick(tocId, source?.text)}
        aria-label={`Ga naar Artikel ${key} in documentbrowser`}
      >
        {text}
      </button>
    );
  }
  return <span key={index}>{text}</span>;
}
```

**Step 2: Update MainLayout handleArticleClick**

In `MainLayout.tsx`, update the callback:

```typescript
const [highlightText, setHighlightText] = useState<string | null>(null);

const handleArticleClick = useCallback((articleId: string, sourceText?: string) => {
  setHighlightId(articleId);
  setHighlightText(sourceText || null);
  setActivePanel("browser");
  setTimeout(() => {
    const el = document.getElementById(articleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}, []);
```

Pass `highlightText` to DocumentBrowser:

```tsx
<DocumentBrowser
  toc={toc}
  highlightId={highlightId}
  highlightText={highlightText}
/>
```

**Step 3: Commit**

```bash
git add app/components/Chat/Chat.tsx app/components/MainLayout/MainLayout.tsx
git commit -m "pass source text through article click handler"
```

---

### Task 7: Highlight source text in DocumentBrowser

**Files:**
- Modify: `app/components/DocumentBrowser/DocumentBrowser.tsx` (DocumentBrowserProps, SectionContent)
- Modify: `app/components/DocumentBrowser/DocumentBrowser.module.scss`

**Step 1: Accept highlightText prop**

```typescript
interface DocumentBrowserProps {
  toc: TocItem[];
  highlightId?: string | null;
  highlightText?: string | null;
}
```

**Step 2: Highlight matching text in SectionContent**

Update `SectionContent` to accept and use `highlightText`:

```typescript
const SectionContent = memo(function SectionContent({
  section,
  highlightText,
}: {
  section: Section;
  highlightText?: string | null;
}) {
```

In the paragraph rendering, if `highlightText` is provided, search for a matching substring and wrap it in `<mark>`:

```typescript
{section.content.split("\n").map((line, i) => (
  <p key={i} className={styles.paragraph}>
    {highlightText ? highlightLine(line, highlightText) : line}
  </p>
))}
```

Add a `highlightLine` helper:

```typescript
function highlightLine(line: string, query: string): React.ReactNode {
  // Match on a meaningful substring (first 60 chars of source, trimmed)
  const searchStr = query.slice(0, 60).trim();
  if (!searchStr) return line;
  const idx = line.toLowerCase().indexOf(searchStr.toLowerCase());
  if (idx === -1) return line;
  return (
    <>
      {line.slice(0, idx)}
      <mark className={styles.sourceHighlight}>{line.slice(idx, idx + searchStr.length)}</mark>
      {line.slice(idx + searchStr.length)}
    </>
  );
}
```

**Step 3: Add CSS for sourceHighlight**

In `DocumentBrowser.module.scss`:

```scss
.sourceHighlight {
  background: var(--pvda-red-light);
  border-radius: 2px;
  padding: 1px 2px;
  animation: highlightFade 5s ease forwards;
}

@keyframes highlightFade {
  0%, 80% { background: var(--pvda-red-light); }
  100% { background: transparent; }
}
```

**Step 4: Thread highlightText through component tree**

In `DocumentBrowser`, pass `highlightText` to `SectionContent`:

```tsx
{activeSectionId && loadedSections[activeSectionId] && (
  <SectionContent
    section={loadedSections[activeSectionId]}
    highlightText={highlightText}
  />
)}
```

**Step 5: Commit**

```bash
git add app/components/DocumentBrowser/DocumentBrowser.tsx app/components/DocumentBrowser/DocumentBrowser.module.scss
git commit -m "highlight source text passages in document browser"
```

---

### Task 8: Integration test and final verification

**Step 1: Run all tests**

Run: `npm test`
Expected: All pass.

**Step 2: Run lint and type check**

Run: `npm run lint && npx tsc --noEmit`
Expected: Clean.

**Step 3: Manual smoke test**

Run: `npm run dev`

Test these scenarios:
1. Ask "Hoe word ik lid?" — verify answer is complete, cites articles
2. Click an article reference — verify it scrolls AND highlights text
3. Verify highlight fades after 5 seconds
4. Ask a vague question — verify low-relevance chunks are filtered out
5. Ask a multi-article question — verify answer is not truncated (800 tokens)

**Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "final adjustments from smoke test"
```
