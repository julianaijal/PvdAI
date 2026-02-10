import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock redis so the module doesn't try to connect
vi.mock("redis", () => ({ createClient: vi.fn() }));

let checkRateLimit: typeof import("@/lib/ratelimit").checkRateLimit;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("@/lib/ratelimit");
  checkRateLimit = mod.checkRateLimit;
});

describe("checkRateLimit", () => {
  it("allows first request and returns remaining count", async () => {
    const result = await checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("decrements remaining on each request", async () => {
    await checkRateLimit("1.2.3.4");
    const result = await checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(18);
  });

  it("blocks after 20 requests", async () => {
    for (let i = 0; i < 20; i++) {
      await checkRateLimit("1.2.3.4");
    }
    const result = await checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks IPs independently", async () => {
    for (let i = 0; i < 20; i++) {
      await checkRateLimit("1.2.3.4");
    }
    const result = await checkRateLimit("5.6.7.8");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("resets after window expires", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 20; i++) {
      await checkRateLimit("1.2.3.4");
    }
    expect((await checkRateLimit("1.2.3.4")).allowed).toBe(false);

    // Advance past 24-hour window
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    const result = await checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
    vi.useRealTimers();
  });
});
