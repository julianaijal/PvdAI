# PvdAI — Statuten Browser & AI Q&A

## Summary

A web app where people can browse and ask questions about the PvdA articles of association (Statuten en reglementen, 188 pages). Hybrid interface: document browser on the left, AI chat on the right. Fully open with rate limiting.

## Architecture

### Data Pipeline (one-time build script)

1. Extract text from `public/Statuten-en-reglementen-PvdA-2023.pdf` using `pdftotext`
2. Parse into structured sections (Hoofdstuk > Artikel > Lid) using regex
3. Chunk text (~800 chars, 200 char overlap) for embedding
4. Generate embeddings via OpenAI `text-embedding-3-small`
5. Output:
   - `data/structure.json` — document tree for browse panel
   - `data/embeddings.json` — chunks with vectors for search

### Q&A Flow

1. Embed user query via OpenAI embeddings API
2. Find top 5-10 most relevant chunks via in-memory cosine similarity
3. Send chunks + question to `gpt-5-nano` with system prompt to answer in the user's language and reference specific articles
4. Return answer with clickable article references

### Rate Limiting

- IP-based, in-memory
- 20 questions per day per IP
- No database needed

## UI Design

### Layout

Two-panel split screen (desktop: 60/40, mobile: stacked with toggle).

### Left Panel — Document Browser (60%)

- Collapsible table of contents (Statuten, Toelichting, Reglementen)
- Scrollable article text below
- TOC click scrolls to section
- Each article/lid has an anchor ID for deep linking from chat

### Right Panel — AI Chat (40%)

- Chat interface with text input at bottom
- Conversation history
- AI responses include clickable article references (e.g., "Zie Artikel 5, lid 4") that scroll the left panel
- Starter questions: "Hoe word ik lid?", "Wat doet het congres?", "Hoe werkt royement?"

### Mobile

- Panels stack vertically
- Toggle between browse and chat view

### Header

- "PvdAI" name
- Tagline: "Stel vragen over de statuten en reglementen van de PvdA"

## Branding (PvdA Landelijk)

- **Primary red:** `#E30613`
- **White:** `#FFFFFF`
- **Dark text:** `#1D1D1B`
- **Light grey background:** `#F2F2F2`
- **Font:** Arial (bold for headings, regular for body)
- **Style:** clean, text-driven, generous white space, activist tone

## Tech Stack

- Next.js 16 (already set up)
- OpenAI API (text-embedding-3-small + gpt-5-nano)
- CSS Modules for styling
- No database — JSON files for embeddings and structure
- Deploy on Vercel

## Implementation Steps

### Step 1: Setup & Tooling

- Add `.env` to `.gitignore` (ensure API keys never in git)
- Set up project structure: `scripts/`, `data/`, `lib/`, `app/`

### Step 2: Data Pipeline Script

- Create `scripts/seed.ts` that:
  - Reads PDF via `pdftotext` (child_process)
  - Parses text into structured chapters/articles
  - Chunks text for embeddings
  - Calls OpenAI embeddings API
  - Writes `data/structure.json` and `data/embeddings.json`

### Step 3: Document Browser Component

- Build TOC component from `structure.json`
- Build article viewer with scroll-to-anchor support
- Style with PvdA branding using CSS Modules

### Step 4: AI Chat Component

- Chat UI with message history
- Input field with submit
- Starter question chips
- Clickable article references in responses

### Step 5: API Route for Q&A

- `POST /api/ask` — receives question, returns AI answer
- Loads embeddings from JSON, does cosine similarity
- Sends relevant chunks to gpt-5-nano
- Returns answer with article references
- IP-based rate limiting

### Step 6: Wire It Together

- Connect chat to API route
- Connect article references to browser scroll
- Responsive layout (desktop split, mobile toggle)

### Step 7: Polish & Deploy

- Test with real questions
- Fine-tune system prompt for accurate answers
- Add meta tags, favicon
- Deploy to Vercel

## Security

- API keys in `.env` only, never committed
- `.env` in `.gitignore`
- Rate limiting on API routes
- No user data stored
