# Design: Friendlier First-Time Experience

**Date:** 2026-02-18
**Status:** Approved

## Problem

New visitors don't understand:
1. Where to start — which panel to use first
2. What kinds of questions they can ask the AI
3. How the chat and document panels connect to each other

## Solution

Three targeted, non-intrusive changes that teach the full flow without adding modals or friction.

---

## Change 1: Welcome screen — "Hoe het werkt" mini-guide

### Current state

The chat welcome screen shows:
- Gradient icon
- Title: "Stel een vraag"
- A single description sentence
- 4 random starter questions

### New state

Replace the single description with a 3-step mini-guide that explains the full dual-panel flow:

```
[icon]
Stel een vraag

① 💬  Stel een vraag over de statuten of reglementen
② 📎  Ik verwijs je naar de relevante artikelen
③ 📄  Klik een artikel om het te lezen in de documentbrowser

[starter questions]
```

Each step is a small icon + one-line text, laid out as a simple numbered list. Style matches the existing welcome screen: muted text, same font size as the current description, no borders or cards.

The starter questions remain below, unchanged.

---

## Change 2: First-use article hint

### Trigger

The first time an AI response contains an article link (i.e., the regex that creates article buttons fires), show a small inline tip.

### Placement

Displayed once, **above the article buttons** inside the assistant message, as a dismissible banner:

```
💡 Klik op een artikel om het te lezen in de documentbrowser    [×]
```

### Behavior

- Persisted in `localStorage` with key `pvdai_article_hint_dismissed`
- Dismissed by:
  - Clicking the × button
  - Clicking any article link
- Once dismissed, never shown again
- Subtle styling: muted background (`--pvda-surface`), small font (12px), no shadow

---

## Change 3: Document panel feedback pulse

### Trigger

When the user clicks an article link in chat and the document browser loads the article.

### Effect

Brief animation on the document panel header: a soft red glow that fades out in 300ms (ease-out).

### Implementation

- CSS keyframe animation: `box-shadow` from `0 0 0 0 rgba(var(--pvda-red-rgb), 0.4)` to transparent
- Applied via a short-lived CSS class toggled in `MainLayout` when `onArticleClick` fires
- Class removed after 400ms via `setTimeout`
- Desktop only — on mobile the panel switch is already obvious

---

## Scope

| File | Change |
|------|--------|
| `app/components/Chat/Chat.tsx` | Add 3-step guide to welcome screen; add first-use article hint logic |
| `app/components/Chat/Chat.module.scss` | Styles for mini-guide and hint banner |
| `app/components/MainLayout/MainLayout.tsx` | Trigger panel pulse on article click |
| `app/components/MainLayout/MainLayout.module.scss` | Pulse keyframe animation |
| `app/globals.scss` | Add `--pvda-red-rgb` variable if not present |

---

## Out of scope

- No onboarding modals
- No changes to TOC or document panel layout
- No changes to the AI endpoint or response format
- No changes to mobile panel-switching behavior
