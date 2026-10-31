import type { Currency, ServiceItem } from "./services.types.ts";

export function formatMoney(n: number, currency: Currency = "ARS"): string {
  const prefix = currency === "USD" ? "US$ " : "$ ";
  return prefix + Math.round(n).toLocaleString("es-AR");
}

/** True when the item has no listed price at all (quote only). */
export function isQuoteOnly(item: ServiceItem): boolean {
  return item.min === undefined;
}

export function priceLabel(item: ServiceItem): { value: string; note: string } {
  if (isQuoteOnly(item)) return { value: "Consultar", note: "" };
  const min = item.min ?? 0;
  const value =
    item.max !== undefined && item.max !== min
      ? `${formatMoney(min, item.currency)} a ${formatMoney(item.max, item.currency)}`
      : `${item.from ? "Desde " : ""}${formatMoney(min, item.currency)}`;
  return { value, note: item.ask ? "Consultar cotización" : "" };
}
