import { kv } from "@vercel/kv";

const LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const WINDOW_S = 24 * 60 * 60; // 24 hours in seconds

// In-memory fallback for local dev (no KV configured)
const store = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitMemory(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

async function checkRateLimitKV(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${ip}`;
  const count = await kv.incr(key);

  // Set TTL on first request (when count is 1)
  if (count === 1) {
    await kv.expire(key, WINDOW_S);
  }

  if (count > LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: LIMIT - count };
}

const useKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (useKV) {
    return checkRateLimitKV(ip);
  }
  return Promise.resolve(checkRateLimitMemory(ip));
}
