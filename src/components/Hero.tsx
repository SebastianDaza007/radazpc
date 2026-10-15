import Image from "next/image";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_40%,#304538_0%,transparent_70%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-36">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-lime">{site.location}</p>
          <h1 className="text-5xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-7xl">{site.tagline}</h1>
          <p className="max-w-md text-lg text-mist/70">Armado a medida y mantenimiento de PC en Salta Capital.</p>
          <div className="flex flex-wrap gap-4">
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-lime px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90">
              Escribinos por WhatsApp
            </a>
            <a href="#servicios" className="rounded-full border border-mist/25 px-6 py-3 font-medium transition-colors hover:border-lime hover:text-lime">
              Ver servicios
            </a>
          </div>
        </div>
        <Image src="/brand/web/isologotipo-oscuro.png" alt="" width={1809} height={960} className="mx-auto w-full max-w-md" priority />
      </div>
    </section>
  );
}
