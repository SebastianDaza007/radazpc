/**
 * Login throttling with growing waits. In-memory only: on serverless/multi-instance hosting each
 * instance keeps its own counters and they reset on cold start, so this slows down guessing but is
 * not a hard guarantee. A backup cookie (`indicators_fails`) carries the same counters per browser.
 */
export type Attempts = { fails: number; until: number };

const FREE_ATTEMPTS = 3;
const BASE_WAIT_MS = 5_000;
const MAX_WAIT_MS = 15 * 60_000;

const store = new Map<string, Attempts>();

/** Wait after the Nth consecutive failure: free for the first few, then 5s, 10s, 20s… up to 15 min. */
export function waitAfter(fails: number): number {
  if (fails <= FREE_ATTEMPTS) return 0;
  return Math.min(MAX_WAIT_MS, BASE_WAIT_MS * 2 ** (fails - FREE_ATTEMPTS - 1));
}

export function getAttempts(key: string): Attempts {
  return store.get(key) ?? { fails: 0, until: 0 };
}

/** Merges counters from several sources (memory by IP, cookie): the strictest wins. */
export function strictest(...all: Attempts[]): Attempts {
  return all.reduce((a, b) => ({ fails: Math.max(a.fails, b.fails), until: Math.max(a.until, b.until) }), { fails: 0, until: 0 });
}

export function secondsLeft(a: Attempts, now: number): number {
  return Math.max(0, Math.ceil((a.until - now) / 1000));
}

export function recordFailure(key: string, base: Attempts, now: number): Attempts {
  const fails = base.fails + 1;
  const next = { fails, until: now + waitAfter(fails) };
  store.set(key, next);
  return next;
}

export function recordSuccess(key: string): void {
  store.delete(key);
}

export function encodeCookie(a: Attempts): string {
  return `${a.fails}:${a.until}`;
}

export function decodeCookie(value: string | undefined): Attempts {
  const m = /^(\d{1,4}):(\d{1,15})$/.exec(value ?? "");
  return m ? { fails: Number(m[1]), until: Number(m[2]) } : { fails: 0, until: 0 };
}

export function clientKey(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
