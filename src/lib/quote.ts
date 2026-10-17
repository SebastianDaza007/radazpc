import { formatMoney, isQuoteOnly, priceLabel } from "./format.ts";
import type { PriceCatalog, ServiceItem } from "./services.types.ts";

export type QuoteLine = { item: ServiceItem; label: string; amount: number };

export type Quote = {
  lines: QuoteLine[];
  lo: number;
  hi: number;
  /** Some selected price is "Desde": the real total can be higher. */
  open: boolean;
  /** Sum of USD-priced items, kept apart from ARS. */
  usd: number;
  /** Text for the total, e.g. "$ 10 a $ 20" or "Desde $ 50.000". */
  rangeText: string;
};

export function findItem(catalog: PriceCatalog, id: string): ServiceItem | undefined {
  for (const g of catalog.groups) {
    const found = g.items.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

export function computeQuote(catalog: PriceCatalog, selected: string[]): Quote {
  const lines: QuoteLine[] = [];
  let lo = 0;
  let hi = 0;
  let usd = 0;
  let open = false;

  for (const id of selected) {
    const item = findItem(catalog, id);
    if (!item) continue;
    const label = priceLabel(item).value;
    if (isQuoteOnly(item)) {
      lines.push({ item, label, amount: 0 });
      continue;
    }
    const min = item.min ?? 0;
    const max = item.max ?? min;
    if (item.currency === "USD") usd += min;
    else {
      lo += min;
      hi += max;
      if (item.from) open = true;
    }
    lines.push({ item, label, amount: min });
  }

  const rangeText =
    lo === hi
      ? `${open ? "Desde " : ""}${formatMoney(hi)}`
      : `${formatMoney(lo)} a ${formatMoney(hi)}${open ? " o más" : ""}`;
  return { lines, lo, hi, open, usd, rangeText };
}

export function buildQuoteMessage(quote: Quote): string {
  const lines = quote.lines.map(({ item, label }) => `- ${item.name}: ${label}`);
  const total = quote.rangeText.replace(/^Desde/, "desde");
  return [
    "Hola RaDaz PC, quiero este presupuesto:",
    lines.join("\n") || "(sin servicios elegidos)",
    "",
    `Total estimado: ${total}${quote.usd ? ` + US$ ${quote.usd}` : ""}`,
    "¿Me confirman el valor y cuándo puedo llevar el equipo?",
  ].join("\n");
}
