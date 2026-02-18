# Friendlier First-Time Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce first-time confusion by adding a how-it-works guide to the welcome screen, a dismissible inline hint when article links first appear, and a panel-pulse animation when the document updates.

**Architecture:** Three independent UI changes in `Chat.tsx` / `Chat.module.scss` and `MainLayout.tsx` / `MainLayout.module.scss`. No API changes. No new files (except one test file). All new state is local React state + localStorage.

**Tech Stack:** React 19, SCSS Modules, Vitest (for pure logic test), localStorage (for hint persistence)

---

## Context: Key code locations

- Welcome screen JSX: `app/components/Chat/Chat.tsx:569-607` — the `messages.length === 0` block inside `.messages`
- `handleArticleClick` in MainLayout: `app/components/MainLayout/MainLayout.tsx:65-74`
- `.browserPanel` section: `app/components/MainLayout/MainLayout.tsx:127-150`
- Panel box-shadow definition: `app/components/MainLayout/MainLayout.module.scss:157` (`.browserPanel`)
- Chat state declarations: `app/components/Chat/Chat.tsx:349-360`
- Article ref pattern: `app/components/Chat/Chat.tsx:144` — `/Artikel\s+\d+(?:\.\d+)?/gi`

---

## Task 1: Extract and test the article-detection helper

This task extracts a pure function so it can be unit tested before using it in the component.

**Files:**
- Create: `lib/chat-utils.ts`
- Create: `tests/chat-utils.test.ts`

**Step 1: Write the failing test**

Create `tests/chat-utils.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run tests/chat-utils.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/chat-utils'`

**Step 3: Write minimal implementation**

Create `lib/chat-utils.ts`:

```typescript
const ARTICLE_PATTERN = /Artikel(?:en)?\s+\d+(?:\.\d+)?/i;

export function hasArticleRefs(content: string): boolean {
  return ARTICLE_PATTERN.test(content);
}
```

**Step 4: Run test to verify it passes**

```bash
npx vitest run tests/chat-utils.test.ts
```

Expected: 5 passing

**Step 5: Commit**

```bash
git add lib/chat-utils.ts tests/chat-utils.test.ts
git commit -m "add hasArticleRefs utility with tests"
```

---

## Task 2: Welcome screen — "Hoe het werkt" mini-guide

Replace the single description paragraph in the chat welcome screen with a 3-step ordered list.

**Files:**
- Modify: `app/components/Chat/Chat.tsx` (replace welcomeText paragraph)
- Modify: `app/components/Chat/Chat.module.scss` (add `.howItWorks`, `.howItWorksStep`, `.howItWorksIcon`; remove `.welcomeText`, `.pdfLink` or keep if used elsewhere)

**Step 1: Verify current welcome JSX**

Read `app/components/Chat/Chat.tsx`, lines 569–607. Confirm the block looks like:

```jsx
<div className={styles.welcome}>
  <div className={styles.welcomeIcon} ...>...</div>
  <h2 className={styles.welcomeTitle}>Stel een vraag</h2>
  <p className={styles.welcomeText}>
    Vraag iets over de statuten en reglementen van de PvdA.
    {" "}
    <a href="..." className={styles.pdfLink}>Bekijk het originele document (PDF)</a>
  </p>
  <div className={styles.starters} ...>...</div>
</div>
```

**Step 2: Replace the welcomeText paragraph**

In `app/components/Chat/Chat.tsx`, replace the `<p className={styles.welcomeText}>...</p>` block (approximately lines 577–588) with:

```jsx
<ol className={styles.howItWorks} aria-label="Hoe het werkt">
  <li className={styles.howItWorksStep}>
    <span className={styles.howItWorksIcon} aria-hidden="true">💬</span>
    <span>Stel een vraag over de statuten of reglementen</span>
  </li>
  <li className={styles.howItWorksStep}>
    <span className={styles.howItWorksIcon} aria-hidden="true">📎</span>
    <span>Ik verwijs je naar de relevante artikelen</span>
  </li>
  <li className={styles.howItWorksStep}>
    <span className={styles.howItWorksIcon} aria-hidden="true">📄</span>
    <span>Klik een artikel om het te lezen in de documentbrowser</span>
  </li>
</ol>
```

Also add the PDF link after the starters `<div>` (still inside `.welcome`), as a small subtle link:

```jsx
<a
  href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className={styles.pdfLink}
>
  Bekijk het originele document (PDF)
</a>
```

**Step 3: Add styles to Chat.module.scss**

Add after the `.pdfLink` block (around line 102):

```scss
.howItWorks {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
  max-width: 300px;
  text-align: left;
}

.howItWorksStep {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--pvda-text-secondary);
  line-height: 1.4;
}

.howItWorksIcon {
  font-size: 15px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}
```

Update `.pdfLink` — it's now outside `.welcomeText`, so if `.welcomeText` is removed, update `.pdfLink` margin-top to `16px` and keep it as-is. Also remove `.welcomeText` from the SCSS if it's no longer referenced.

**Step 4: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Confirm:
- Welcome screen shows 3 numbered emoji steps instead of the old description paragraph
- PDF link appears below the starter questions
- Layout is centered and text is muted

**Step 5: Commit**

```bash
git add app/components/Chat/Chat.tsx app/components/Chat/Chat.module.scss
git commit -m "add how-it-works mini-guide to chat welcome screen"
```

---

## Task 3: First-use article hint

Show a one-time dismissible banner when the AI first returns a response with article links.

**Files:**
- Modify: `app/components/Chat/Chat.tsx` (add state, useEffect, handler, JSX)
- Modify: `app/components/Chat/Chat.module.scss` (add `.articleHint`, `.articleHintDismiss`)

**Step 1: Import the new utility**

At the top of `app/components/Chat/Chat.tsx`, add the import:

```typescript
import { hasArticleRefs } from "@/lib/chat-utils";
```

**Step 2: Add state for the hint**

Inside the `Chat` component, after the existing `useState` declarations (around line 360), add:

```typescript
const [showArticleHint, setShowArticleHint] = useState(false);
const [articleHintDismissed, setArticleHintDismissed] = useState(() =>
  typeof window !== "undefined"
    ? localStorage.getItem("pvdai_article_hint_dismissed") === "1"
    : false
);
```

**Step 3: Add the useEffect to detect article refs**

After the existing `useEffect` for scroll (around line 378), add:

```typescript
useEffect(() => {
  if (articleHintDismissed) return;
  const hasAny = messages.some(
    (m) => m.role === "assistant" && !m.isError && hasArticleRefs(m.content)
  );
  if (hasAny) setShowArticleHint(true);
}, [messages, articleHintDismissed]);
```

**Step 4: Add the dismiss handler**

After the `handleScroll` callback (around line 395), add:

```typescript
const handleDismissArticleHint = useCallback(() => {
  setShowArticleHint(false);
  setArticleHintDismissed(true);
  localStorage.setItem("pvdai_article_hint_dismissed", "1");
}, []);
```

**Step 5: Also dismiss when an article link is clicked**

The `onArticleClick` prop is passed in from `MainLayout`. Wrap the click handler at the point where article buttons call `onClick(tocId)` in `makeArticleButton`. The cleanest place: pass `handleDismissArticleHint` into `useMarkdownComponents`.

In `useMarkdownComponents`, add an `onDismissHint` parameter:

```typescript
function useMarkdownComponents(
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>,
  onDismissHint?: () => void
): Components {
```

And in `makeArticleButton`, update the `onClick` call to also dismiss:

```typescript
onClick={() => {
  onClick(tocId);
  onDismissHint?.();
}}
```

Update the call site in `Chat` (around line 361):

```typescript
const markdownComponents = useMarkdownComponents(onArticleClick, articleLookup, handleDismissArticleHint);
```

**Step 6: Add the hint JSX**

In the messages container, just before `<div ref={messagesEndRef} />` (around line 635), add:

```jsx
{showArticleHint && (
  <div className={styles.articleHint} role="note" aria-live="polite">
    <span>💡 Klik op een artikel om het te lezen in de documentbrowser</span>
    <button
      className={styles.articleHintDismiss}
      onClick={handleDismissArticleHint}
      aria-label="Sluit tip"
    >
      ×
    </button>
  </div>
)}
```

**Step 7: Add styles to Chat.module.scss**

Add after the `.articleRef` block (around line 319):

```scss
.articleHint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: var(--pvda-surface);
  border: 1px solid var(--pvda-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--pvda-text-secondary);
  margin-bottom: 8px;
  animation: slideUp 200ms ease both;
}

.articleHintDismiss {
  background: none;
  border: none;
  color: var(--pvda-text-secondary);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
  flex-shrink: 0;
  font-family: inherit;

  &:hover {
    color: var(--pvda-text);
  }
}
```

**Step 8: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Ask a question that returns article references (e.g., "Hoe word ik lid van de PvdA?"). Confirm:
- The hint banner appears below the response
- Clicking × dismisses it
- Clicking an article link also dismisses it
- Refreshing the page does NOT show the hint again (localStorage check)

To reset for re-testing: open browser console and run `localStorage.removeItem('pvdai_article_hint_dismissed')` then refresh.

**Step 9: Commit**

```bash
git add app/components/Chat/Chat.tsx app/components/Chat/Chat.module.scss lib/chat-utils.ts
git commit -m "add first-use article hint that dismisses to localStorage"
```

---

## Task 4: Document panel pulse animation

When an article link is clicked, briefly animate the browser panel border to confirm the panels are connected.

**Files:**
- Modify: `app/components/MainLayout/MainLayout.tsx` (add pulse state, update handleArticleClick, apply class)
- Modify: `app/components/MainLayout/MainLayout.module.scss` (add keyframe + `.browserPanelPulse` class)

**Step 1: Add pulse state to MainLayout**

In `app/components/MainLayout/MainLayout.tsx`, after the `highlightId` state declaration (line 22), add:

```typescript
const [isBrowserPulsing, setIsBrowserPulsing] = useState(false);
```

**Step 2: Trigger pulse in handleArticleClick**

Replace the existing `handleArticleClick` (lines 65–74) with:

```typescript
const handleArticleClick = useCallback((articleId: string) => {
  setHighlightId(articleId);
  setActivePanel("browser");
  if (!isMobile) {
    setIsBrowserPulsing(true);
    setTimeout(() => setIsBrowserPulsing(false), 400);
  }
  setTimeout(() => {
    const el = document.getElementById(articleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}, [isMobile]);
```

**Step 3: Apply the pulse class to the browser panel section**

In the `<section>` for `browserPanel` (line 127), update the `className` to:

```jsx
className={`${styles.browserPanel} ${activePanel === "browser" ? styles.panelActive : ""} ${isBrowserPulsing ? styles.browserPanelPulse : ""}`}
```

**Step 4: Add the keyframe and class to MainLayout.module.scss**

Add after the `.panelActive` block (after line 209):

```scss
@keyframes panelPulse {
  0%, 100% {
    border-color: color-mix(in srgb, var(--pvda-border) 60%, transparent);
  }
  35% {
    border-color: var(--pvda-red);
    box-shadow: var(--shadow-md), 0 0 0 1px color-mix(in srgb, var(--pvda-border) 20%, transparent), 0 0 12px var(--pvda-red-subtle);
  }
}

.browserPanelPulse {
  @media (min-width: 769px) {
    animation: panelPulse 400ms ease-out;
  }
}
```

**Step 5: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Ask a question that returns an article link and click it. Confirm:
- On desktop: the left document panel briefly flashes a red border before returning to normal
- On mobile: no animation occurs (panel switch is already obvious)

**Step 6: Run the full test suite to confirm nothing broke**

```bash
npm test
```

Expected: all tests pass (the new `chat-utils.test.ts` and existing tests)

**Step 7: Commit**

```bash
git add app/components/MainLayout/MainLayout.tsx app/components/MainLayout/MainLayout.module.scss
git commit -m "add document panel pulse animation on article click"
```

---

## Done

All three changes are independent. They can be implemented in any order. The test in Task 1 must come before Task 3 (since Task 3 imports `hasArticleRefs`).

Manual verification checklist:
- [ ] Welcome screen shows 3-step guide instead of old description
- [ ] Article hint appears after first article response, dismissed by × or article click, not shown again after refresh
- [ ] Desktop panel pulse fires on article click, no animation on mobile
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
