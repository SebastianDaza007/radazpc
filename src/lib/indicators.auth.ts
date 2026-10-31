import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "radaz_admin";
export const SESSION_SECONDS = 8 * 60 * 60;
const HASH_PATTERN = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/;

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  // Colons avoid dotenv's variable expansion of "$" in local and hosting configuration.
  return `scrypt:${salt}:${(await derive(password, salt)).toString("hex")}`;
}

export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME?.trim() && HASH_PATTERN.test(process.env.ADMIN_PASSWORD_HASH ?? "") &&
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 64);
}

export async function passwordMatches(candidate: string): Promise<boolean> {
  if (!authConfigured() || !candidate || Buffer.byteLength(candidate) > 1024) return false;
  const match = HASH_PATTERN.exec(process.env.ADMIN_PASSWORD_HASH!)!;
  return timingSafeEqual(await derive(candidate, match[1]), Buffer.from(match[2], "hex"));
}

export function usernameMatches(candidate: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return authConfigured() && timingSafeEqual(digest(candidate), digest(process.env.ADMIN_USERNAME!));
}

function credentialsVersion(): string {
  return createHash("sha256").update(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD_HASH}`).digest("hex");
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
}

export function sessionToken(now = Date.now()): string {
  if (!authConfigured()) throw new Error("Acceso de administradores sin configurar");
  const payload = Buffer.from(JSON.stringify({
    user: process.env.ADMIN_USERNAME, exp: Math.floor(now / 1000) + SESSION_SECONDS,
    nonce: randomBytes(16).toString("hex"), version: credentialsVersion(),
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function tokenMatches(token: string | undefined, now = Date.now()): boolean {
  if (!authConfigured() || !token || token.length > 2048) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    const actual = Buffer.from(signature, "base64url");
    const expected = Buffer.from(sign(payload), "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    const seconds = Math.floor(now / 1000);
    return session.user === process.env.ADMIN_USERNAME && session.version === credentialsVersion() &&
      Number.isInteger(session.exp) && session.exp > seconds && session.exp <= seconds + SESSION_SECONDS;
  } catch { return false; }
}
