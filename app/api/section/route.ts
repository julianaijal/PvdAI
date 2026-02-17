import { getStructure, findSection } from "@/lib/structure";
import { SectionRequestSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = SectionRequestSchema.safeParse({ id: searchParams.get("id") ?? undefined });

  if (!parsed.success) {
    return Response.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const id = parsed.data.id;

  const structure = getStructure();
  const section = findSection(structure, id);

  if (!section) {
    return Response.json({ error: "Section not found" }, { status: 404 });
  }

  return Response.json(section, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
