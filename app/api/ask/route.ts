import { openai } from "@/lib/openai";
import { findRelevantChunks } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/ratelimit";
import { AskRequestSchema } from "@/lib/schemas";
import { headers } from "next/headers";

const SYSTEM_PROMPT = `Je bent een vriendelijke assistent die de statuten en reglementen van de PvdA uitlegt. Iedereen in Nederland moet je antwoord kunnen begrijpen — ook mensen die Nederlands als tweede taal spreken.

# Taalniveau: B1

Regels:
- Maximaal 12 woorden per zin. Splits lange zinnen op.
- Gebruik alledaagse woorden. Schrijf "stoppen" in plaats van "beëindigen", "kiezen" in plaats van "verkiezen", "regels" in plaats van "bepalingen".
- Geen lijdende vorm. Schrijf "Het bestuur beslist" in plaats van "Er wordt besloten door het bestuur".
- Spreek de lezer aan met "je" en "jij".
- Geen afkortingen zonder uitleg. Schrijf de eerste keer het hele woord.

# Structuur

- Begin met 1 zin die de vraag direct beantwoordt.
- Geef daarna een korte uitleg in 2-4 zinnen.
- Gebruik opsommingstekens als er meerdere punten zijn.
- Eindig met een bronverwijzing. Noem elk artikel apart: "Bron: Artikel 1.12, Artikel 5.7, Artikel 6.7." Gebruik nooit "Artikelen" als verzamelnaam.

# Woordenlijst (gebruik altijd het simpele woord)

- beëindigen → stoppen
- verkiesbaar stellen → je opgeven als kandidaat
- beraadslaging → overleg of bespreking
- geleding → onderdeel van de partij
- vertegenwoordigend lichaam → gemeenteraad, provinciale staten, of Tweede Kamer
- ingezetene → iemand die in Nederland woont
- contributies → het geld dat je als lid betaalt
- royement → uit de partij gezet worden
- congres → de grote vergadering van alle PvdA-leden
- statuten → de belangrijkste regels van de partij
- reglementen → de uitgewerkte regels over hoe dingen gaan

# Voorbeeldantwoord

Vraag: "Hoe word ik lid?"
Antwoord: "Je kunt lid worden als je 16 jaar of ouder bent en in Nederland woont. Je meldt je aan bij de partij. Het bestuur beslist of je lid mag worden. Als je jonger bent dan 16 maar ouder dan 12, kun je jeugdlid worden. Dat is gratis. Bron: Artikel 4, lid 1."

# Belangrijk

- Leg alles uit in je eigen woorden. Kopieer nooit letterlijk uit het document.
- Als je het antwoord niet weet, zeg dat eerlijk. Verzin niets.
- Als iemand in het Engels vraagt, antwoord dan in het Engels op dezelfde manier.`;

async function rewriteQuery(
  question: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const historyText = history
    .map((m) => `${m.role === "user" ? "Vraag" : "Antwoord"}: ${m.content}`)
    .join("\n");

  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    instructions:
      "Herschrijf de laatste vraag van de gebruiker als een zelfstandige vraag in het Nederlands. Gebruik de gespreksgeschiedenis als context. Geef alleen de herschreven vraag terug, zonder uitleg.",
    input: `Gesprek:\n${historyText}\n\nLaatste vraag: ${question}`,
    max_output_tokens: 80,
    store: false,
  });

  const text = response.output_text?.trim();
  return text || question;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = AskRequestSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Ongeldige vraag.";
    return Response.json({ error: message }, { status: 400 });
  }

  const question = parsed.data.question;

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

  try {
    const history = parsed.data.history || [];

    // Run rewrite + embedding in parallel when possible
    let queryEmbedding: number[];
    if (history.length > 0) {
      // Start both in parallel: rewrite the query AND embed the original
      const [searchQuery, originalEmbedding] = await Promise.all([
        rewriteQuery(question, history),
        openai.embeddings.create({ model: "text-embedding-3-small", input: question }),
      ]);

      // If rewrite changed the query, re-embed; otherwise use original
      if (searchQuery !== question) {
        const rewrittenEmbedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: searchQuery,
        });
        queryEmbedding = rewrittenEmbedding.data[0].embedding;
      } else {
        queryEmbedding = originalEmbedding.data[0].embedding;
      }
    } else {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
      });
      queryEmbedding = embeddingResponse.data[0].embedding;
    }

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(queryEmbedding, 5);
    const context = relevantChunks
      .map((c) => `[${c.sectionTitle}]\n${c.text}`)
      .join("\n\n---\n\n");

    // Build conversation context for the LLM
    const historyPrompt =
      history.length > 0
        ? `\n\nEerdere berichten:\n${history.map((m) => `${m.role === "user" ? "Gebruiker" : "Assistent"}: ${m.content}`).join("\n")}\n\n`
        : "";

    // Stream the response
    const stream = openai.responses.stream({
      model: "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: `Context uit de statuten en reglementen:\n\n${context}\n\n---${historyPrompt}\nVraag: ${question}`,
      max_output_tokens: 512,
      store: false,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "response.output_text.delta" &&
              "delta" in event
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: event.delta })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Er is een fout opgetreden." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return Response.json(
      { error: "Er is een fout opgetreden bij het verwerken van je vraag." },
      { status: 500 }
    );
  }
}
