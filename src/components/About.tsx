import Image from "next/image";
import { site } from "@/lib/site";

const values = ["Confianza", "Experticia", "Transparencia", "Compromiso con el aprendizaje"];

export default function About() {
  return (
    <section id="nosotros" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div className="about-fig">
          <Image
            src="/brand/artefacto/img05.webp"
            alt={`El Sabio, personaje de la marca: un mago sentado con una placa de video como cabeza y el isotipo de ${site.name} en la pantalla`}
            width={735}
            height={1000}
            sizes="(max-width: 768px) 250px, 440px"
          />
        </div>
        <div>
          <p className="eyebrow">Quiénes somos</p>
          <h2 className="display mt-4 text-3xl sm:text-5xl">El aliado técnico de tu PC.</h2>
          <p className="mt-4 max-w-[58ch] text-mist/75">
            {site.name} ofrece servicios personalizados y de alta calidad en mantenimiento y personalización de PC. Buscamos
            que cada cliente se lleve su equipo funcionando mejor y entienda qué se le hizo.
          </p>
          <p className="mt-4 max-w-[58ch] text-mist/75">
            Combinamos conocimiento técnico con transparencia: te explicamos el problema en palabras simples, te pasamos el
            precio antes de empezar y te contamos el resultado.
          </p>
          <ul className="values">
            {values.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="display mt-6 text-xl text-lime sm:text-2xl">{site.tagline}.</p>
        </div>
      </div>
    </section>
  );
}
