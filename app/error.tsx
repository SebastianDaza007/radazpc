"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16 sm:py-24">
      <p className="eyebrow">Algo salió mal</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">No pudimos cargar esta parte del sitio.</h1>
      <p className="mt-4 text-mist/70">Probá de nuevo en unos segundos. Si sigue fallando, escribinos y te pasamos precios por WhatsApp.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={() => retry()} className="btn-lime">
          Reintentar
        </button>
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Escribinos por WhatsApp
        </a>
      </div>
      {digest && <p className="mt-8 text-xs text-mist/40">Código de referencia: {digest}</p>}
    </main>
  );
}
