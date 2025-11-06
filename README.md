# PvdAI

Minimal Next.js playground using Next.js 16, React 19, and the OpenAI JavaScript SDK (Responses API).

## Overview

Use this repo to prototype small AI features (chat, summarization, Q&A, transformations) and iterate quickly. A starter API route is included at `/api/chat` that calls `gpt-4o` via `openai.responses.create`.

## Setup

1) Create an OpenAI API key and set it locally:

```
echo "OPENAI_API_KEY=YOUR_KEY_HERE" > .env.local
```

2) Install dependencies:

```
npm install
```

3) Start the dev server:

```
npm run dev
```

## API

- Endpoint: `POST /api/chat`
- Request body:

```json
{ "input": "Hello there" }
```

- Response body:

```json
{ "output_text": "...model response text..." }
```

- cURL example:

```bash
curl -sX POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"input":"Say hi in one sentence"}'
```

## Where to build

- UI: `app/page.tsx`
- Styles: `app/globals.css`
- Server endpoints (when needed): create handlers under `app/api/*/route.ts`
- OpenAI client: `lib/openai.ts`

## Scripts

```
npm run dev     # start dev server
npm run build   # production build
npm run start   # start production server
npm run lint    # run eslint
```

## Notes

- Set `OPENAI_API_KEY` in your deployment environment as well.
- Defaults to model `gpt-4o` via the Responses API.
