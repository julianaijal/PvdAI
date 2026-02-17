import { createClient } from "redis";

const LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const WINDOW_S = 24 * 60 * 60; // 24 hours in seconds

// In-memory fallback for local dev (no Redis configured)
const store = new Map<string, { count: number; resetAt: number }>();

function pruneExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

// Clean up expired entries every hour
if (typeof setInterval !== "undefined") {
  setInterval(pruneExpiredEntries, 60 * 60 * 1000);
}

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

let redis: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();
  }
  return redis;
}

async function checkRateLimitRedis(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const client = await getRedis();
  const key = `ratelimit:${ip}`;
  const count = await client.incr(key);

  // Set TTL on first request (when count is 1)
  if (count === 1) {
    await client.expire(key, WINDOW_S);
  }

  if (count > LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: LIMIT - count };
}

const useRedis = !!process.env.REDIS_URL;

if (!useRedis && process.env.NODE_ENV === "production") {
  console.warn("[ratelimit] REDIS_URL not configured — using in-memory rate limiting which does not persist across serverless invocations");
}

export function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (useRedis) {
    return checkRateLimitRedis(ip);
  }
  return Promise.resolve(checkRateLimitMemory(ip));
}
