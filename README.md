<p align="center">
  <strong>Pvd<em>AI</em></strong>
</p>

<p align="center">
  AI-powered document browser for the articles of association of the Dutch Labour Party (PvdA).
</p>

<p align="center">
  <a href="https://pvdai.tech"><strong>pvdai.tech</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/deployments/julianaijal/PvdAI/production?label=deploy&logo=vercel" alt="Deploy status" />
  <img src="https://img.shields.io/github/last-commit/julianaijal/PvdAI" alt="Last commit" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white" alt="OpenAI" />
</p>

---

PvdAI makes the 188-page [Statuten en reglementen PvdA 2023](https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf) accessible through a split-screen interface: a **document browser** on the left and an **AI chat** on the right. Ask questions in plain language and get answers at B1 reading level with references to specific articles.

## Features

- **RAG-powered Q&A** — answers grounded in the actual document via semantic search over embeddings
- **Conversational context** — follow-up questions use conversation history with automatic query rewriting
- **Interactive document browser** — collapsible table of contents with on-demand section loading
- **Document search** — full-text search with text snippet previews and highlighted matches
- **Clickable article references** — AI responses link directly to referenced articles in the browser (including plural "Artikelen X, Y, Z" references)
- **Copy & share** — copy or share AI responses directly from the chat
- **Shareable questions** — link to a question via URL query parameter for auto-submission on load
- **Dark/light mode** — system-aware with manual toggle
- **Mobile-first** — responsive panel switching with accessible touch targets
- **Accessible** — WCAG AA contrast compliance, 44px touch targets, `prefers-reduced-motion` support, `aria-live` announcements, focus-visible styles, and `inert` attribute on hidden panels
- **SEO-friendly** — server-rendered summary, sitemap, and robots.txt
- **Privacy-first** — questions are not stored or used for training (`store: false`)
- **Rate limiting** — 20 questions/day per IP with remaining count shown to users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | [React](https://react.dev) 19, SCSS Modules |
| AI | [OpenAI](https://platform.openai.com) SDK — `text-embedding-3-small` + Responses API |
| Language | TypeScript 5 |
| Hosting | [Vercel](https://vercel.com) |
| Database | None — static JSON files |

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- `pdftotext` from [Poppler](https://poppler.freedesktop.org/) (for PDF parsing only)

  ```sh
  # macOS
  brew install poppler
  ```

### Installation

```sh
git clone https://github.com/julianaijal/PvdAI.git
cd PvdAI
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=sk-...
```

### Data Pipeline

The project uses static JSON instead of a database. Run these once:

```sh
# 1. Parse the PDF into structured data
npx tsx scripts/parse.ts
# Output: data/structure.json, data/toc.json, data/chunks.json

# 2. Generate vector embeddings for semantic search
npx tsx scripts/embed.ts
# Output: data/embeddings.json (~25MB, gitignored)
```

### Development

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```sh
npm run build   # runs embed.ts as prebuild step, then next build
npm run start
```

## Architecture

```
app/
├── page.tsx                     Server component — reads toc.json at build time
├── layout.tsx                   Root layout with metadata and theme setup
├── globals.scss                 CSS variables, PvdA branding, dark/light themes
├── api/
│   ├── ask/route.ts             POST — RAG endpoint (embed → search → respond)
│   └── section/route.ts         GET  — on-demand section content (24h cache)
├── components/
│   ├── MainLayout/              Split-screen layout, mobile panel toggle
│   ├── DocumentBrowser/         Collapsible TOC tree + article viewer
│   ├── Chat/                    Message history, starter questions, article links
│   └── ThemeToggle/             Dark/light mode switch
lib/
├── openai.ts                    OpenAI client singleton
├── embeddings.ts                Cosine similarity search over precomputed vectors
└── ratelimit.ts                 In-memory IP-based rate limiter (20/day)
scripts/
├── parse.ts                     PDF → structured JSON (requires pdftotext)
└── embed.ts                     Chunks → vector embeddings (runs at build time)
data/                            Generated JSON files (embeddings.json gitignored)
```

### How RAG Works

1. User question is embedded with `text-embedding-3-small`
2. Top 8 chunks found via cosine similarity against precomputed embeddings
3. Chunks + question sent to OpenAI Responses API with a Dutch B1-level system prompt
4. Response includes article references that become clickable links in the UI

## API Reference

### `POST /api/ask`

Ask a question about the articles of association.

**Request:**
```json
{ "question": "Hoe word ik lid van de PvdA?" }
```

**Response:**
```json
{ "answer": "Je kunt lid worden als je 16 jaar of ouder bent..." }
```

**Headers:** `X-RateLimit-Remaining` — questions left today.

**Rate limit:** 20 requests/day per IP. Returns `429` when exceeded.

### `GET /api/section?id=<section-id>`

Load section content on demand.

**Response:** Full section object with nested children. Cached for 24 hours via `Cache-Control`.

## Privacy

- Questions are **not stored** and **not used for AI training**
- OpenAI API called with `store: false` — data is not retained beyond the request
- No personal data is collected or stored
- Anonymous usage analytics via [Google Analytics](https://marketingplatform.google.com/about/analytics/) (page views, session data)

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the [MIT License](LICENSE).

## Disclaimer

PvdAI is an independent open-source project. It is not affiliated with, endorsed by, or an official product of the Partij van de Arbeid (PvdA). AI-generated answers may contain inaccuracies. Always consult the [official document](https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf) for authoritative information.
