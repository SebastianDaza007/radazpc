"use client";

import { useEffect, useRef, useState } from "react";
import { branches, whatsappUrl } from "@/lib/branches";
import { formatMoney } from "@/lib/format";
import { buildQuoteMessage } from "@/lib/quote";
import { useQuote } from "./QuoteProvider";

/** Animates the displayed amount towards `target`; jumps straight there with reduced motion. */
function useTween(target: number): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    const from = shownRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from === target) {
      shownRef.current = target;
      const id = requestAnimationFrame(() => setShown(target));
      return () => cancelAnimationFrame(id);
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 380);
      const value = from + (target - from) * (1 - Math.pow(1 - k, 3));
      shownRef.current = value;
      setShown(value);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return shown;
}

export default function Quote() {
  const { quote, toggle, branchIndex, setBranchIndex, branch } = useQuote();
  const animated = useTween(quote.hi);
  const isRange = quote.lo !== quote.hi || quote.open;
  const message = buildQuoteMessage(quote);

  return (
    <>
      <section id="presupuesto" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow">Presupuesto</p>
          <h2 className="display mt-4 text-3xl sm:text-5xl">Armá tu presupuesto y mandalo por WhatsApp.</h2>
          <p className="mt-4 text-mist/70">Es una estimación. El precio final lo confirmamos cuando vemos tu equipo.</p>
        </div>

        <div className="quote">
          <div className="quote-list">
            <h3 className="display text-xl">Tu selección</h3>
            {quote.lines.length === 0 ? (
              <p className="quote-empty">Todavía no elegiste servicios. Tocá el + en la lista de arriba.</p>
            ) : (
              <ul className="picked">
                {quote.lines.map(({ item, label }) => (
                  <li key={item.id}>
                    <div>
                      <div className="nm">{item.name}</div>
                    </div>
                    <div className="pr">{label}</div>
                    <button type="button" className="rm" aria-label={`Sacar ${item.name}`} onClick={() => toggle(item.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="quote-total">
            <span className="lbl">Total estimado</span>
            <div className="big" aria-hidden="true">
              {isRange ? quote.rangeText : formatMoney(animated)}
            </div>
            <p className="sr-only" aria-live="polite">
              {quote.lines.length ? `Total estimado: ${quote.rangeText}` : "Sin servicios elegidos"}
            </p>
            <div className="usd">{quote.usd ? `+ US$ ${quote.usd} de licencias OEM (a confirmar)` : ""}</div>
            <div className="field">
              <label htmlFor="quote-branch">Sucursal para enviar la consulta</label>
              <select id="quote-branch" value={branchIndex} onChange={(e) => setBranchIndex(Number(e.target.value))}>
                {branches.map((b, k) => (
                  <option key={b.id} value={k}>
                    {b.name} ({b.street})
                  </option>
                ))}
              </select>
            </div>
            <a className="btn-dark" href={whatsappUrl(branch, message)} target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp con mi presupuesto
            </a>
            <p className="fine">Se abre WhatsApp con el mensaje ya escrito. Lo enviás vos.</p>
          </div>
        </div>
      </section>

      {quote.lines.length > 0 && (
        <a className="minibar" href="#presupuesto">
          <span>
            {quote.lines.length} {quote.lines.length === 1 ? "servicio elegido" : "servicios elegidos"}
          </span>
          <b>{quote.rangeText}</b>
        </a>
      )}
    </>
  );
}
