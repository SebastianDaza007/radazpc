import Image from "next/image";

const services = [
  { title: "Armado a medida", text: "Elegimos los componentes junto con vos según el uso y el presupuesto, y armamos la PC completa.", icon: "/brand/web/icono-pc.png" },
  { title: "Mantenimiento", text: "Limpieza interna, revisión de temperaturas y puesta a punto para que el equipo rinda como el primer día.", icon: "/brand/web/icono-tools.png" },
  { title: "Actualización", text: "Sumamos o reemplazamos componentes para mejorar tu equipo sin empezar de cero.", icon: "/brand/web/icono-grafica.png" },
];

export default function Services() {
  return (
    <section id="servicios" className="mx-auto w-full max-w-6xl px-6 py-24">
      <h2 className="mb-12 text-3xl font-semibold uppercase tracking-tight sm:text-5xl">Servicios</h2>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-mist/10 bg-mist/10 md:grid-cols-3">
        {services.map((service, i) => (
          <article key={service.title} className="flex flex-col gap-4 bg-ink p-8 transition-colors hover:bg-moss/40">
            <div className="flex items-center justify-between">
              <Image src={service.icon} alt="" width={256} height={256} className="h-14 w-14" />
              <span className="font-mono text-sm text-lime">0{i + 1}</span>
            </div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="text-mist/70">{service.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
