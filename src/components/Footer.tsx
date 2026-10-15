import Image from "next/image";
import { site } from "@/lib/site";

const social = Object.entries(site.social);

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-mist/10">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-3xl font-semibold uppercase tracking-tight sm:text-5xl">¿Hablamos?</h2>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-full bg-lime px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90">
            <Image src="/brand/web/icono-contacto.png" alt="" width={256} height={256} className="h-6 w-6 brightness-0" />
            Escribinos por WhatsApp
          </a>
          <a href={site.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-mist/70 underline-offset-4 transition-colors hover:text-lime hover:underline">
            <Image src="/brand/web/icono-ubicacion.png" alt="" width={256} height={256} className="h-6 w-6" />
            {site.location}
          </a>
        </div>
        <div className="flex flex-col justify-between gap-8 md:items-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
            {social.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize text-mist/70 transition-colors hover:text-lime">
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-mist/50">© {site.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
