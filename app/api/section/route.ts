import { readFileSync } from "fs";
import { join } from "path";
import { SectionRequestSchema } from "@/lib/schemas";

interface Section {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Section[];
}

let structureCache: Section[] | null = null;

function getStructure(): Section[] {
  if (!structureCache) {
    const data = readFileSync(
      join(process.cwd(), "data", "structure.json"),
      "utf-8"
    );
    structureCache = JSON.parse(data);
  }
  return structureCache!;
}

function findSection(sections: Section[], id: string): Section | null {
  for (const section of sections) {
    if (section.id === id) return section;
    const found = findSection(section.children, id);
    if (found) return found;
  }
  return null;
}

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
