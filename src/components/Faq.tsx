import { formatMoney } from "@/lib/format";
import { branches } from "@/lib/branches";
import { findItem } from "@/lib/quote";
import type { PriceCatalog } from "@/lib/services.types";

/** Price or range for a service id, or null when the sheet no longer lists it. */
function money(catalog: PriceCatalog, id: string): string | null {
  const item = findItem(catalog, id);
  if (!item || item.min === undefined) return null;
  const lo = formatMoney(item.min, item.currency);
  return item.max !== undefined && item.max !== item.min ? `${lo} a ${formatMoney(item.max, item.currency)}` : lo;
}

function buildFaq(catalog: PriceCatalog): [string, string][] {
  // TODO(RAD-3): confirmar precio vigente de limpieza de GPU (Sheet: 27.500 a 35.000).
  const gpuRange = money(catalog, "gpu");
  const asm = money(catalog, "asm");
  const asmp = money(catalog, "asmp");
  const used = money(catalog, "used");

  return [
    [
      "¿Qué incluye el mantenimiento completo?",
      "Limpieza del gabinete completo, orden de cables y cambio de pasta térmica Arctic MX-4 en el procesador. Incluye la placa de video. Si preferís el básico, queda afuera la placa de video.",
    ],
    [
      "¿Por qué la limpieza de GPU tiene distintos precios?",
      `El valor cambia según la generación de la placa${gpuRange ? `: va de ${gpuRange}` : ""}. Si necesita cambio de thermal pads, esos se cotizan aparte.`,
    ],
    ["¿Con qué pasta térmica trabajan?", "Con Arctic MX-4 o ID-Cooling Frost X25, según el servicio."],
    [
      "¿Puedo llevar mis componentes para que me armen la PC?",
      `Sí.${asm ? ` El ensamblaje con componentes ya comprados cuesta ${asm}.` : ""}${asmp ? ` Si además cambiamos la pasta de fábrica por Arctic MX-4, son ${asmp}.` : ""} Consultanos por WhatsApp y lo confirmamos.`,
    ],
    [
      "¿Me ayudan a comprar componentes usados?",
      `Sí. Te acompañamos en la compra de CPU, placa de video, RAM y más.${used ? ` El valor va de ${used}.` : ""} Se confirma por WhatsApp.`,
    ],
    [
      "¿Cómo pido un presupuesto?",
      "Armalo en la sección Presupuesto y abrí WhatsApp con tu selección, o contanos qué le pasa a tu equipo desde el formulario de contacto.",
    ],
    [
      "¿Dónde los encuentro?",
      `En ${branches[0].street} y en ${branches[1].street} (Zona Norte), en Salta. Las dos sucursales figuran en Google con 5,0 estrellas.`,
    ],
  ];
}

export default function Faq({ catalog }: { catalog: PriceCatalog }) {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 className="display mt-4 text-3xl sm:text-5xl">Antes de escribirnos.</h2>
      </div>
      <div className="faq">
        {buildFaq(catalog).map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
