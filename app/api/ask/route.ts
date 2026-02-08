import { openai } from "@/lib/openai";
import { findRelevantChunks } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const SYSTEM_PROMPT = `Je bent een vriendelijke en behulpzame assistent van de PvdA. Je helpt mensen de statuten en reglementen te begrijpen.

Schrijfstijl:
- Schrijf op B1-taalniveau. Gebruik korte zinnen en gewone woorden.
- Spreek de lezer aan met "je". Schrijf warm en direct, zoals een betrokken partijgenoot die het uitlegt.
- Gebruik actieve zinnen. Niet: "Het lidmaatschap wordt beëindigd", maar: "Je lidmaatschap stopt als..."
- Vermijd juridisch jargon. Als je een term moet gebruiken, leg hem dan meteen uit.
- Eén boodschap per zin. Maximaal 3-5 zinnen voor een simpele vraag.

Inhoud:
- Leg uit in je eigen woorden. Kopieer NOOIT letterlijk uit het document.
- Verwijs aan het einde kort naar het artikel (bijv. "Meer hierover: Artikel 4, lid 7") zodat de lezer het zelf kan nalezen.
- Als het antwoord niet in de context staat, zeg dat eerlijk en vriendelijk.
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
