import Image from "next/image";
import { RATINGS_DATE } from "@/lib/branches";
import { site } from "@/lib/site";

const social = Object.entries(site.social);

export default function Footer() {
  return (
    <footer className="border-t border-mist/10 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <a href={site.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-mist/70 underline-offset-4 transition-colors hover:text-lime hover:underline">
            <Image src="/brand/web/icono-ubicacion.png" alt="" width={256} height={256} className="h-6 w-6" />
            {site.location}
          </a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-mist/70 underline-offset-4 transition-colors hover:text-lime hover:underline">
            <Image src="/brand/web/icono-contacto.png" alt="" width={256} height={256} className="h-6 w-6" />
            Escribinos por WhatsApp
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
      <p className="mx-auto max-w-6xl px-6 pb-10 text-xs text-mist/40">
        Precios en pesos argentinos, sujetos a cambio. Valoraciones y cantidad de opiniones según las fichas de Google de cada sucursal al {RATINGS_DATE}.
      </p>
    </footer>
  );
}
