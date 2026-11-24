"use client";

import { useQuote } from "./QuoteProvider";

export default function AddButton({ id, name }: { id: string; name: string }) {
  const { isSelected, toggle } = useQuote();
  const on = isSelected(id);
  return (
    <button
      type="button"
      className="add-btn"
      aria-pressed={on}
      aria-label={`${on ? "Sacar" : "Sumar"} ${name} ${on ? "del" : "al"} presupuesto`}
      onClick={() => toggle(id)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}
