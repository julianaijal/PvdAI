import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const { input } = await req.json().catch(() => ({} as { input?: string }));
  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: input || "Hello",
  });
  return Response.json({ output_text: response.output_text });
}
