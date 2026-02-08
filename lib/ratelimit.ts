const LIMIT = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
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
