import { getStructure } from "@/lib/structure";

export async function GET() {
  return Response.json(getStructure(), {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
