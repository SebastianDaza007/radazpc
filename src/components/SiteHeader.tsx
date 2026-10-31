import Image from "next/image";
import { site } from "@/lib/site";
import MobileNav from "./MobileNav";

const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#presupuesto", label: "Presupuesto" },
  { href: "#sucursales", label: "Sucursales" },
  { href: "#faq", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-mist/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 min-[360px]:px-6">
        <a href="#" aria-label={site.name} className="shrink-0">
          <Image src="/brand/web/logotipo-oscuro.png" alt={site.name} width={1619} height={330} className="h-6 w-auto min-[360px]:h-7 sm:h-8" priority />
        </a>
        <nav aria-label="Principal" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider sm:gap-3 lg:gap-8">
          <div className="hidden gap-6 lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="text-mist/70 transition-colors hover:text-lime">
                {item.label}
              </a>
            ))}
          </div>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-lime px-3 py-2 text-ink sm:px-4 transition-opacity hover:opacity-90">
            WhatsApp
          </a>
          <MobileNav items={nav} />
        </nav>
      </div>
    </header>
  );
}
