import { cacheLife } from "next/cache";
import { parsePricesCsv } from "./prices.parse.ts";
import { FALLBACK_CATALOG, GROUP_META } from "./services.fallback.ts";
import type { PriceCatalog } from "./services.types.ts";

/**
 * Service prices from the published Google Sheet (CSV in PRICES_CSV_URL).
 * Falls back to the bundled catalog when the URL is missing, the request fails or the CSV is invalid.
 */
export async function getPrices(): Promise<PriceCatalog> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  const url = process.env.PRICES_CSV_URL;
  if (!url) return FALLBACK_CATALOG;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parsePricesCsv(await res.text(), GROUP_META);
  } catch (error) {
    console.error("[prices] usando precios de respaldo:", error);
    return FALLBACK_CATALOG;
  }
}
