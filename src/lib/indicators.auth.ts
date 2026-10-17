import { createHash, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "indicators_auth";

/** Fail closed: no INDICATORS_PASSWORD means the indicators are disabled and show no data. */
export function authConfigured(): boolean {
  return Boolean(process.env.INDICATORS_PASSWORD);
}

function digest(value: string): Buffer {
  return createHash("sha256").update(`radaz-indicators:${value}`).digest();
}

/** Cookie value for a valid session: derived from the password, so changing it logs everyone out. */
export function sessionToken(): string {
  return digest(process.env.INDICATORS_PASSWORD ?? "").toString("hex");
}

export function passwordMatches(candidate: string): boolean {
  const expected = process.env.INDICATORS_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(digest(candidate), digest(expected));
}

export function tokenMatches(token: string | undefined): boolean {
  if (!authConfigured() || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
