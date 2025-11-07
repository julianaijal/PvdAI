import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: "hallo alles goed?"
});

console.log(response.output_text);
