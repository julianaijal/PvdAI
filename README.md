# PvdAI

Minimal Next.js playground for experimenting with the OpenAI API.

## Overview

Use this repo to prototype small AI features (chat, summarization, Q&A, transformations) and iterate quickly.

## Setup

1) Create an OpenAI API key and set it locally:

```
echo "OPENAI_API_KEY=YOUR_KEY_HERE" > .env.local
```

2) Install the SDK:

```
npm install openai
```

3) Start the dev server:

```
npm run dev
```

## Where to build

- UI: `app/page.tsx`
- Styles: `app/globals.css`
- Server endpoints (when needed): create handlers under `app/api/*/route.ts`

## Scripts

```
npm run dev     # start dev server
npm run build   # production build
npm run start   # start production server
npm run lint    # run eslint
```
