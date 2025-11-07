import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5-nano",
    input: "hallo alles goed?"
});

console.log(response.output_text);
