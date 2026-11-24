import { cacheLife } from "next/cache";
import { parsePricesCsv } from "./prices.parse.ts";
import { FALLBACK_CATALOG, GROUP_META } from "./services.fallback.ts";
import type { PriceCatalog } from "./services.types.ts";
import { readSheetCsv } from "./sheets.ts";

/**
 * Service prices from the published Google Sheet (CSV in PRICES_CSV_URL).
 * Falls back to the bundled catalog when the URL is missing, the request fails or the CSV is invalid.
 */
export async function getPrices(): Promise<PriceCatalog> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  const url = process.env.PRICES_CSV_URL;
  const sheetId = process.env.PRICES_SHEET_ID;
  const gid = process.env.PRICES_SHEET_GID;
  if (!url && !(sheetId && gid)) return FALLBACK_CATALOG;
  try {
    if (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000), cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parsePricesCsv(await res.text(), GROUP_META);
    }
    return parsePricesCsv(await readSheetCsv(sheetId!, gid!), GROUP_META);
  } catch (error) {
    console.error("[prices] no se pudo actualizar; usando catálogo de respaldo", error instanceof Error ? error.name : "Error");
    return FALLBACK_CATALOG;
  }
}
