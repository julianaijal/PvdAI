# Smarter AI Answers

## Overview

Improve the RAG pipeline across three areas: retrieval quality, source highlighting, and answer quality.

## 1. Better Retrieval (Re-ranking)

Retrieve top 10 chunks by cosine similarity, then re-rank with `gpt-4.1-nano` to pick the best 5.

- `findRelevantChunks(queryEmbedding, 10)` casts a wider net
- Send 10 chunk texts + question to nano with scoring prompt
- Take top 5 by re-ranked score
- Cost: ~0.001 cents extra per question, ~200ms latency

## 2. Source Highlighting

Return retrieved chunk metadata alongside the streamed answer so the document browser can highlight the actual source passages.

- After stream completes, send final SSE event: `data: {"sources": [{"sectionId": "...", "text": "..."}]}`
- Store sources on the message object in Chat state
- On article click, pass source text to DocumentBrowser for `<mark>` highlighting
- Highlight auto-clears after 5 seconds or on scroll

## 3. Answer Quality

Three targeted changes:

1. **Max output tokens 512 -> 800** to prevent truncation on multi-article questions
2. **Relevance score threshold (0.3)** to exclude low-relevance chunks from context
3. **Include section IDs in context format** (`[Title | artikel-id]`) for more accurate citations
