import { z } from "zod";

const HistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

export const AskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Geen vraag opgegeven.")
    .max(500, "Vraag mag maximaal 500 tekens zijn."),
  history: z.array(HistoryMessageSchema).max(6).optional(),
});

export const SectionRequestSchema = z.object({
  id: z.string().min(1, "Missing id parameter").max(200).regex(/^[a-z0-9-]+$/),
});
