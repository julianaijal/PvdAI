# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PvdAI is an AI-powered document browser for the Dutch Labour Party (PvdA) articles of association ("Statuten & Reglementen"). It provides a split-screen interface with a document browser and an AI chat that answers questions using RAG (Retrieval-Augmented Generation). All UI text is in Dutch.

Live at https://pvdai.tech. Deployed on Vercel.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Run prebuild (embeddings) + Next.js build
npm run lint         # ESLint (flat config, v9)
npm run content-update   # After PDF change: parse + embed + notify search engines (IndexNow)
npm run indexnow         # Manually ping search engines without re-parsing
```

No test framework is configured.

## Environment

Requires `OPENAI_API_KEY` (or `OPENAI_API_KEY_PVDAI`) in `.env.local`.

## Architecture

**Framework**: Next.js 16 (App Router), React 19, TypeScript, SCSS Modules.

**Path alias**: `@/*` maps to project root.

### Server vs Client Components

- `app/page.tsx` — Server component; reads `data/toc.json` at build time and passes it to the client.
- All interactive components (`MainLayout`, `DocumentBrowser`, `Chat`, `ThemeToggle`) are client components (`"use client"`).
- `Chat` is dynamically imported for code splitting.

### API Routes (`app/api/`)

- **POST `/api/ask`** — Main RAG endpoint. Embeds the question with `text-embedding-3-small`, finds top 8 chunks via cosine similarity (`lib/embeddings.ts`), then calls OpenAI responses API with a Dutch B1-level system prompt. Rate limited to 20 req/day/IP (`lib/ratelimit.ts`, in-memory).
- **GET `/api/section?id=<id>`** — Returns section content from `data/structure.json`. Cached 24h via `Cache-Control`.
- **POST `/api/chat`** — Basic chat endpoint (minimal use).

### Data Pipeline

No database. All data is static JSON:
1. `scripts/parse.ts` — Parses PvdA PDF into `data/structure.json` (599KB) and `data/toc.json` (84KB)
2. `scripts/embed.ts` — Generates `data/chunks.json` and `data/embeddings.json` (~25MB, gitignored)
3. `prebuild` script runs `embed.ts` before each production build

### Component Structure (`app/components/`)

- **MainLayout** — Split-screen: document panel (left) + chat panel (right). On mobile, toggle between panels. Manages article highlighting and scrolling.
- **DocumentBrowser** — Collapsible TOC tree + on-demand section loading. Uses `React.memo` on TOCItem.
- **Chat** — Message history, starter questions, article reference parsing ("Artikel X" → clickable links), loading states.
- **ThemeToggle** — Dark/light mode with localStorage persistence. Dark is default.

### Styling

SCSS Modules with CSS variables defined in `app/globals.scss`. PvdA brand colors (`--pvda-red`), dark/light themes via `[data-theme]` attribute on `<html>`.

## Git Workflow

- Always make small, focused commits — one logical change per commit.
- Do not batch unrelated changes into a single commit.

## Autonomy

- Do not ask for permission or confirmation before taking actions. Just do it.
- This includes file edits, running commands, committing, pushing, and any other operations.
- Only ask questions when genuinely ambiguous requirements need clarification.
