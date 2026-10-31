import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Página no encontrada · ${site.name}`,
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16 sm:py-24">
      <p className="eyebrow">Error 404</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Esta página no existe.</h1>
      <p className="mt-4 text-mist/70">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className="btn-lime">
          Volver al inicio
        </Link>
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Escribinos por WhatsApp
        </a>
      </div>
    </main>
  );
}
