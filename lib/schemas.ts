import { z } from "zod";

export const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Geen vraag opgegeven.")
    .max(500, "Vraag mag maximaal 500 tekens zijn."),
});

export const SectionRequestSchema = z.object({
  id: z.string().min(1, "Missing id parameter"),
});
