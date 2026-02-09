import { readFileSync } from "fs";
import { join } from "path";

let structureCache: unknown = null;

export async function GET() {
  if (!structureCache) {
    const data = readFileSync(
      join(process.cwd(), "data", "structure.json"),
      "utf-8"
    );
    structureCache = JSON.parse(data);
  }

  return Response.json(structureCache, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
