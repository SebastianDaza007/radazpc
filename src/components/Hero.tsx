import Image from "next/image";
import { branches, RATINGS_DATE, totalReviews } from "@/lib/branches";
import { site } from "@/lib/site";

/** Review-weighted average rating across branches, es-AR formatted ("5,0"). */
function averageRating(): string {
  const toNumber = (r: string) => Number(r.replace(",", "."));
  const avg = branches.reduce((sum, b) => sum + toNumber(b.rating) * b.reviewCount, 0) / totalReviews;
  return avg.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_40%,#304538_0%,transparent_70%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-28">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">{site.location}</p>
          <h1 className="display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">{site.tagline}</h1>
          <p className="max-w-md text-lg text-mist/70">Armado a medida y mantenimiento de PC en Salta Capital. Con precios a la vista y presupuesto armado en minutos.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#presupuesto" className="btn-lime">
              Armar mi presupuesto
            </a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Escribinos por WhatsApp
            </a>
          </div>
          <div className="text-sm text-mist/70">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="stars" role="img" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.8 21.4l1.5-7.1L1.9 9.4l7.2-.8z" />
                  </svg>
                ))}
              </span>
              <span>
                <strong className="text-mist">{averageRating()}</strong> en Google · <strong className="text-mist">{totalReviews}</strong> opiniones en {branches.length === 2 ? "dos" : branches.length} sucursales
              </span>
            </p>
            <p className="mt-1 text-xs text-mist/50">Valoraciones al {RATINGS_DATE}</p>
          </div>
        </div>
        <div className="hero-photo">
          <Image
            src="/brand/artefacto/img04.webp"
            alt="Placa de video Sapphire Nitro durante un cambio de pasta térmica, con un monitor encendido detrás"
            width={1400}
            height={1283}
            sizes="(max-width: 768px) 100vw, 560px"
            priority
          />
          <p className="hero-tag">
            <small>Trabajo real en el taller</small>
            Cambio de pasta térmica
          </p>
        </div>
      </div>
    </section>
  );
}
