import { openai } from "@/lib/openai";
import { findRelevantChunks } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const SYSTEM_PROMPT = `Je bent een behulpzame assistent die vragen beantwoordt over de statuten en reglementen van de Partij van de Arbeid (PvdA).

Regels:
- Leg uit in je eigen woorden, in begrijpelijke taal. Kopieer NIET letterlijk uit het document.
- Schrijf alsof je het uitlegt aan iemand die geen juridische achtergrond heeft.
- Houd het kort: maximaal 3-5 zinnen voor een simpele vraag.
- Verwijs aan het einde naar het relevante artikel (bijv. "Zie Artikel 4, lid 7") zodat de lezer het zelf kan nalezen.
- Citeer NIET uit het document. De lezer kan via de verwijzing zelf de brontekst bekijken.
- Als het antwoord niet in de context staat, zeg dat eerlijk.
- Antwoord in de taal waarin de vraag gesteld wordt.`;

export async function POST(req: Request) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return Response.json(
      {
        error:
          "Je hebt het maximum aantal vragen voor vandaag bereikt. Probeer het morgen opnieuw.",
      },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const question = body.question?.trim();

  if (!question) {
    return Response.json({ error: "Geen vraag opgegeven." }, { status: 400 });
  }

  try {
    // Generate embedding for the question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(queryEmbedding, 8);
    const context = relevantChunks
      .map((c) => `[${c.sectionTitle}]\n${c.text}`)
      .join("\n\n---\n\n");

    // Ask GPT
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      instructions: SYSTEM_PROMPT,
      input: `Context uit de statuten en reglementen:\n\n${context}\n\n---\n\nVraag: ${question}`,
    });

    return Response.json(
      { answer: response.output_text },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return Response.json(
      { error: "Er is een fout opgetreden bij het verwerken van je vraag." },
      { status: 500 }
    );
  }
}
