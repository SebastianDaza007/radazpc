import assert from "node:assert/strict";
import { authConfigured, hashPassword, passwordMatches, sessionToken, tokenMatches, usernameMatches, SESSION_SECONDS } from "../src/lib/indicators.auth.ts";

// Invented credentials, used in this process only.
const saved = { ...process.env };
try {
  delete process.env.ADMIN_PASSWORD_HASH;
  assert.equal(authConfigured(), false);
  assert.equal(tokenMatches("fake"), false);
  const password = "invented-test-password-123";
  process.env.ADMIN_USERNAME = "admin-test";
  process.env.ADMIN_PASSWORD_HASH = await hashPassword(password);
  process.env.ADMIN_SESSION_SECRET = "test-only-secret".repeat(6);
  assert.equal(authConfigured(), true);
  assert.equal(await passwordMatches(password), true);
  assert.equal(await passwordMatches("wrong"), false);
  assert.equal(await passwordMatches("x".repeat(1025)), false);
  assert.equal(usernameMatches("admin-test"), true);
  assert.equal(usernameMatches("other"), false);
  assert.notEqual(await hashPassword(password), process.env.ADMIN_PASSWORD_HASH, "fresh salt per password");
  const now = 1800000000000;
  const token = sessionToken(now);
  assert.equal(tokenMatches(token, now), true);
  assert.notEqual(token, sessionToken(now), "fresh session nonce");
  assert.equal(tokenMatches(token + "invalid", now), false);
  assert.equal(tokenMatches(token, now + SESSION_SECONDS * 1000), false);
  process.env.ADMIN_PASSWORD_HASH = await hashPassword("changed-password");
  assert.equal(tokenMatches(token, now), false, "password rotation revokes existing sessions");
  const nextToken = sessionToken(now);
  process.env.ADMIN_SESSION_SECRET = "rotated-test-secret".repeat(6);
  assert.equal(tokenMatches(nextToken, now), false);
} finally {
  for (const key of ["ADMIN_USERNAME", "ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"]) {
    if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
  }
}
console.log("verify-auth: ok");
