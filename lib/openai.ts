import OpenAI from "openai";
import "@/lib/env";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PVDAI || process.env.OPENAI_API_KEY,
});
