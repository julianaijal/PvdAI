# PvdAI

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=nextdotjs) ![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white) ![OpenAI SDK](https://img.shields.io/badge/OpenAI%20SDK-6.x-412991?logo=openai&logoColor=white)

Browse en stel vragen over de statuten en reglementen van de Partij van de Arbeid (PvdA).

## Wat is dit?

PvdAI maakt de 188 pagina's statuten en reglementen van de PvdA toegankelijk via een split-screen interface:

- **Links**: een doorzoekbare documentbrowser met inhoudsopgave
- **Rechts**: een AI-chat waar je vragen kunt stellen in gewone taal

De AI beantwoordt vragen op B1-taalniveau en verwijst naar de relevante artikelen, zodat je het zelf kunt nalezen.

## Stack

- **Next.js** 16.0.1 (App Router)
- **React** 19.2.0
- **TypeScript** ^5
- **OpenAI** SDK ^6 (Embeddings + Responses API)
- **SCSS** Modules
- **Geen database** — embeddings en documentstructuur als JSON

## Setup

1. Maak een OpenAI API key aan en stel deze in:

```
echo "OPENAI_API_KEY=YOUR_KEY_HERE" > .env.local
```

2. Installeer dependencies:

```
npm install
```

3. Genereer de documentdata (eenmalig):

```
npx tsx scripts/seed.ts
```

Dit leest de PDF, splitst het document op in chunks, en genereert embeddings. Output: `data/structure.json` en `data/embeddings.json`.

4. Start de dev server:

```
npm run dev
```

## Projectstructuur

```
app/
  page.tsx                  # hoofdpagina (server component)
  globals.scss              # PvdA branding
  api/
    ask/route.ts            # AI Q&A endpoint
    chat/route.ts           # basis chat endpoint
  components/
    MainLayout/             # split-screen layout
    DocumentBrowser/         # inhoudsopgave + artikelviewer
    Chat/                   # chatinterface
lib/
  openai.ts                 # OpenAI client
  embeddings.ts             # cosine similarity search
  ratelimit.ts              # IP-based rate limiting
scripts/
  seed.ts                   # PDF parser + embedding generator
data/                       # gegenereerde JSON (niet in git)
```

## API

### POST /api/ask

Stel een vraag over de statuten.

```json
{ "question": "Hoe word ik lid van de PvdA?" }
```

Antwoord:

```json
{ "answer": "Je kunt lid worden als je 16 jaar of ouder bent..." }
```

Rate limit: 20 vragen per dag per IP.

## Scripts

```
npm run dev           # start dev server
npm run build         # production build
npm run start         # start production server
npx tsx scripts/seed.ts  # genereer embeddings (eenmalig)
```
