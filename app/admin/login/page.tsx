import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import IndicatorsLogin from "@/components/IndicatorsLogin";
import { AUTH_COOKIE, authConfigured, tokenMatches } from "@/lib/indicators.auth";

export const metadata: Metadata = {
  title: "Administración · Radaz PC",
  robots: { index: false, follow: false },
};

async function Login() {
  if (!authConfigured()) return <p className="mt-8 text-mist/70">El acceso de administradores todavía no está configurado.</p>;
  if (tokenMatches((await cookies()).get(AUTH_COOKIE)?.value)) redirect("/indicadores");
  return <IndicatorsLogin />;
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16 sm:py-24">
      <Link href="/" className="text-sm text-mist/70 underline underline-offset-4">Volver a Radaz PC</Link>
      <p className="eyebrow mt-12">Administración</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Acceso de administradores</h1>
      <p className="mt-4 text-mist/70">Ingresá para consultar los indicadores mensuales del taller.</p>
      <Suspense fallback={<p className="mt-8 text-mist/70">Cargando…</p>}><Login /></Suspense>
    </main>
  );
}
