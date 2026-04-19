import { createClient } from "redis";
import { createHmac } from "crypto";

const LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const WINDOW_S = 24 * 60 * 60; // 24 hours in seconds

const HASH_SECRET = process.env.IP_HASH_SECRET;

if (!HASH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[ratelimit] IP_HASH_SECRET not set — IP hashing is insecure");
}

// Hash IP with HMAC-SHA256 keyed on the secret + today's date.
// - Without the secret, stored hashes are computationally irreversible.
// - The daily component means hashes from different days cannot be linked,
//   and they expire from Redis (24h TTL) at roughly the same time as they rotate.
function hashIp(ip: string): string {
  const date = new Date().toISOString().split("T")[0];
  const key = HASH_SECRET ? `${HASH_SECRET}:${date}` : date;
  return createHmac("sha256", key).update(ip).digest("hex");
}

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
  const entry = store.get(hashIp(ip));

  const key = hashIp(ip);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
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
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    redis = client;
  }
  return redis;
}

async function checkRateLimitRedis(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const client = await getRedis();
    const key = `ratelimit:${hashIp(ip)}`;
    const count = await client.incr(key);

    // Set TTL on first request (when count is 1)
    if (count === 1) {
      await client.expire(key, WINDOW_S);
    }

    if (count > LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: LIMIT - count };
  } catch (err) {
    // Redis unavailable — reset so the next request retries, fall back to in-memory
    redis = null;
    console.warn("[ratelimit] Redis error, falling back to in-memory:", String(err));
    return checkRateLimitMemory(ip);
  }
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
