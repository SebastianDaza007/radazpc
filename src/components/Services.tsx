import Image from "next/image";
import { isQuoteOnly, priceLabel } from "@/lib/format";
import type { PriceCatalog } from "@/lib/services.types";
import AddButton from "./AddButton";

const ICONS = {
  pc: "/brand/artefacto/img06.webp",
  gpu: "/brand/artefacto/img07.webp",
} as const;

export default function Services({ catalog }: { catalog: PriceCatalog }) {
  return (
    <section id="servicios" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Servicios y precios</p>
        <h2 className="display mt-4 text-3xl sm:text-5xl">Todo lo que le hacemos a tu PC, con el precio al lado.</h2>
        <p className="mt-4 max-w-[60ch] text-mist/70">
          Tocá el botón + de cualquier servicio para sumarlo a tu presupuesto. Los precios están en pesos argentinos y los
          que dicen &quot;consultar&quot; se confirman por WhatsApp.
        </p>
      </div>
      <div>
        {catalog.groups.map((group) => (
          <div key={group.id} className="svc">
            <aside className="svc-card">
              <Image src={ICONS[group.icon]} alt="" width={88} height={88} className="svc-card-icon" />
              <h3 className="display text-xl sm:text-2xl">{group.title}</h3>
              {group.blurb && <p>{group.blurb}</p>}
              <span className="count">
                {group.items.length} {group.items.length === 1 ? "servicio" : "servicios"}
              </span>
            </aside>
            <div className="rows">
              {group.items.map((item) => {
                const price = priceLabel(item);
                const quoteOnly = isQuoteOnly(item);
                return (
                  <div key={item.id} className={`row${quoteOnly ? " row-static" : ""}`}>
                    <div>
                      <h4>{item.name}</h4>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <div className="price">
                      {price.value}
                      {price.note && <small>{price.note}</small>}
                    </div>
                    {!quoteOnly && <AddButton id={item.id} name={item.name} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
