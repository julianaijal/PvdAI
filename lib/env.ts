/**
 * Validates required environment variables at module load time.
 * Fails loudly at startup rather than with a cryptic error mid-request.
 */
const missing: string[] = [];

if (!process.env.OPENAI_API_KEY_PVDAI && !process.env.OPENAI_API_KEY) {
  missing.push("OPENAI_API_KEY");
}

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}\n` +
    `Copy .env.example to .env.local and fill in the values.`
  );
}
