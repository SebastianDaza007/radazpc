import { cacheLife } from "next/cache";
import { buildIndicators, collectTabs, mergeTabs, resolveTabs } from "./indicators.parse.ts";
import { SAMPLE_JOBS } from "./indicators.sample.ts";
import type { IndicatorsData, IndicatorSource } from "./indicators.types.ts";

/**
 * Internal indicators. SERVER ONLY, and only after the password gate (see app/indicadores).
 *
 * The source is swappable (INDICATORS_SOURCE):
 *  - "sheets" (default when INDICATORS_SHEET_ID is set): reads the payments log from Google Sheets.
 *  - "sample": invented data, for local development.
 * Raw rows never leave this module: callers get aggregates only. Never copy the sheet into the repo or public/.
 *
 * INDICATORS_SHEET_ID: spreadsheet id (kept out of the repo, it is public).
 * INDICATORS_SHEET_TABS: comma-separated tab names, OLDEST FIRST (rows repeated in later tabs are dropped).
 *   When unset, tabs are generated as RP-MM-AA (and RP-M-AA) from 08-24 up to the current month.
 *   Tabs that don't exist are skipped; "Trabajos" is always excluded. See collectTabs in indicators.parse.ts.
 */
function tabUrl(sheetId: string, tab: string): string {
  // headers=0: the sheet has a merged title above the header row, so we locate the header ourselves.
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(tab)}`;
}

export function sheetsSource(sheetId: string, tabs: string[]): IndicatorSource {
  return {
    async load() {
      const parsed = await collectTabs(async (tab) => {
        const res = await fetch(tabUrl(sheetId, tab), { signal: AbortSignal.timeout(10000) });
        return res.ok ? res.text() : null;
      }, tabs);
      return mergeTabs(parsed);
    },
  };
}

export const sampleSource: IndicatorSource = { async load() { return SAMPLE_JOBS; } };

function configuredSource(): IndicatorSource | null {
  if (process.env.INDICATORS_SOURCE === "sample") return sampleSource;
  const sheetId = process.env.INDICATORS_SHEET_ID;
  if (!sheetId) return null;
  return sheetsSource(sheetId, resolveTabs(process.env.INDICATORS_SHEET_TABS, new Date()));
}

export async function getIndicators(): Promise<IndicatorsData | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });

  const source = configuredSource();
  if (!source) return null;
  try {
    return buildIndicators(await source.load());
  } catch (error) {
    console.error("[indicators] no se pudo leer la fuente:", error instanceof Error ? error.message : error);
    return null;
  }
}
