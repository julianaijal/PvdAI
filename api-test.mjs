import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

try {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: "hallo alles goed?",
  });

  console.log(response.output_text);
} catch (error) {
  console.error("OpenAI Error", {
    status: error.status,
    message: error.message,
  });
}
