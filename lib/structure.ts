import { readFileSync } from "fs";
import { join } from "path";
import type { Section } from "./types";

export type { Section };

let cache: Section[] | null = null;

export function getStructure(): Section[] {
  if (!cache) {
    const data = readFileSync(
      join(process.cwd(), "data", "structure.json"),
      "utf-8"
    );
    cache = JSON.parse(data);
  }
  return cache!;
}

export function findSection(sections: Section[], id: string): Section | null {
  for (const section of sections) {
    if (section.id === id) return section;
    const found = findSection(section.children, id);
    if (found) return found;
  }
  return null;
}
