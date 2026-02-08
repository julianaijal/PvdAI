# PvdAI

AI-powered document browser for the articles of association of the Dutch Labour Party (PvdA).

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![SCSS](https://img.shields.io/badge/SCSS-CC6699?logo=sass&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)

![Vercel Status](https://img.shields.io/github/deployments/julianaijal/PvdAI/production?label=Vercel&logo=vercel) ![Last Commit](https://img.shields.io/github/last-commit/julianaijal/PvdAI)

Browse and ask questions about the articles of association (statuten en reglementen) of the Dutch Labour Party (PvdA).

Based on the [Statuten en reglementen PvdA 2023](https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf) (version 2023).

## What is this?

PvdAI makes the 188-page PvdA articles of association accessible through a split-screen interface:

- **Left panel**: a document browser with collapsible table of contents and on-demand content loading
- **Right panel**: an AI chat where you can ask questions in plain language

The AI answers at B1 reading level and references specific articles, so you can verify the source yourself.

## Stack

- **Next.js** 16.0.1 (App Router)
- **React** 19.2.0
- **TypeScript** ^5
- **OpenAI** SDK ^6 (Embeddings + Responses API)
- **SCSS** Modules
- **No database** — embeddings and document structure stored as JSON

## Performance

- Lightweight TOC (84KB) served on initial load instead of full document structure (599KB)
- Section content loaded on demand via `/api/section` with 24h cache headers
- Chat component dynamically imported (code-split)
- Memoized TOC tree to minimize re-renders
- Dark mode toggle with localStorage persistence

## Setup

1. Create an OpenAI API key and set it locally:

```
echo "OPENAI_API_KEY=YOUR_KEY_HERE" > .env.local
```

2. Install dependencies:

```
npm install
```

3. Parse the PDF (one-time, requires `pdftotext`):

```
npx tsx scripts/parse.ts
```

This reads the PDF and generates structured data. Output: `data/structure.json`, `data/toc.json`, and `data/chunks.json`.

4. Generate embeddings (one-time):

```
npx tsx scripts/embed.ts
```

This generates vector embeddings for semantic search. Output: `data/embeddings.json`.

5. Start the dev server:

```
npm run dev
```

## Project structure

```
app/
  page.tsx                  # main page (server component, loads toc.json)
  globals.scss              # PvdA branding + dark mode
  api/
    ask/route.ts            # AI Q&A endpoint (RAG with embeddings)
    section/route.ts        # on-demand section content endpoint
  components/
    MainLayout/             # split-screen layout with mobile nav
    DocumentBrowser/        # collapsible TOC + on-demand article viewer
    Chat/                   # chat interface with starter questions
    ThemeToggle/            # dark mode toggle
lib/
  openai.ts                 # OpenAI client
  embeddings.ts             # cosine similarity search
  ratelimit.ts              # IP-based rate limiting (20/day)
scripts/
  parse.ts                  # PDF parser (requires pdftotext)
  embed.ts                  # embedding generator (runs on Vercel prebuild)
data/                       # generated JSON (embeddings.json not in git)
```

## 🔒 Privacy

Your questions are **not stored or used for AI training**. The OpenAI API is called with `store: false`, meaning your data is not retained by OpenAI beyond the immediate request.

## API

### POST /api/ask

Ask a question about the articles of association.

```json
{ "question": "Hoe word ik lid van de PvdA?" }
```

Response:

```json
{ "answer": "Je kunt lid worden als je 16 jaar of ouder bent..." }
```

Rate limit: 20 questions per day per IP.

### GET /api/section?id=\<section-id\>

Load section content on demand. Returns the full section with nested children. Cached for 24 hours.

## Scripts

```
npm run dev               # start dev server
npm run build             # production build (runs embed.ts as prebuild)
npm run start             # start production server
npx tsx scripts/parse.ts  # parse PDF into chunks (one-time, local)
npx tsx scripts/embed.ts  # generate embeddings (one-time, or at build)
```
