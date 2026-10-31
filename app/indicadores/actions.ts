"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, authConfigured, passwordMatches, usernameMatches, sessionToken, SESSION_SECONDS } from "@/lib/indicators.auth";
import {
  clientKey,
  decodeCookie,
  encodeCookie,
  getAttempts,
  recordFailure,
  recordSuccess,
  secondsLeft,
  strictest,
} from "@/lib/indicators.ratelimit";

export type LoginState = { error: string | null };

const FAILS_COOKIE = "indicators_fails";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "El acceso de administradores todavía no está configurado." };
  const jar = await cookies();
  const key = clientKey(await headers());
  const now = Date.now();
  const known = strictest(getAttempts(key), decodeCookie(jar.get(FAILS_COOKIE)?.value));

  const wait = secondsLeft(known, now);
  if (wait > 0) return { error: `Demasiados intentos. Esperá ${wait} s antes de volver a probar.` };

  const validPassword = await passwordMatches(String(formData.get("password") ?? ""));
  if (!usernameMatches(String(formData.get("username") ?? "")) || !validPassword) {
    const next = recordFailure(key, known, now);
    jar.set(FAILS_COOKIE, encodeCookie(next), cookieOptions(60 * 60));
    const left = secondsLeft(next, now);
    return { error: left > 0 ? `Datos incorrectos. Esperá ${left} s para el próximo intento.` : "Usuario o contraseña incorrectos." };
  }

  recordSuccess(key);
  jar.delete({ name: FAILS_COOKIE, path: "/" });
  jar.set(AUTH_COOKIE, sessionToken(), cookieOptions(SESSION_SECONDS));
  redirect("/indicadores");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: AUTH_COOKIE, path: "/" });
  redirect("/admin/login");
}
