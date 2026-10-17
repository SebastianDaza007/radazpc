import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import IndicatorsLogin from "@/components/IndicatorsLogin";
import IndicatorsView from "@/components/IndicatorsView";
import { getIndicators } from "@/lib/indicators";
import { AUTH_COOKIE, authConfigured, tokenMatches } from "@/lib/indicators.auth";
import { logout } from "./actions";

// Internal page: not indexable, excluded in robots.ts, and there is no sitemap.
export const metadata: Metadata = {
  title: "Indicadores · Radaz PC",
  robots: { index: false, follow: false },
};

async function Gate() {
  // GUARD (fail closed): without INDICATORS_PASSWORD no data is ever rendered.
  if (!authConfigured()) {
    return (
      <p className="mt-10 rounded-lg border border-dashed border-mist/20 p-6 text-mist/70">
        Indicadores deshabilitados: falta definir INDICATORS_PASSWORD en el servidor.
      </p>
    );
  }
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!tokenMatches(token)) return <IndicatorsLogin />;

  const data = await getIndicators();
  return (
    <>
      <form action={logout} className="mt-4">
        <button type="submit" className="text-sm text-mist/60 underline underline-offset-4 hover:text-lime">
          Cerrar sesión
        </button>
      </form>
      <IndicatorsView data={data} />
    </>
  );
}

export default function IndicatorsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <p className="eyebrow">Uso interno</p>
      <h1 className="display mt-4 text-3xl sm:text-5xl">Indicadores por sucursal</h1>
      <Suspense fallback={<p className="mt-10 text-mist/60">Cargando…</p>}>
        <Gate />
      </Suspense>
    </main>
  );
}
