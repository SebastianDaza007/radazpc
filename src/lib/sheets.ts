/** Google CSV exports preserve mixed text/numeric columns (gviz silently drops some values). */
export function sheetCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${encodeURIComponent(gid)}`;
}

export type SheetTab = { name: string; gid: string };

/** Read tab metadata only; do not return or persist the page's customer cells. */
export function parseSheetTabs(html: string): SheetTab[] {
  const tabs = new Map<string, SheetTab>();
  for (const match of html.matchAll(/\[21350203,("(?:\\.|[^"\\])*")\]/g)) {
    try {
      const snapshot = JSON.parse(JSON.parse(match[1]));
      const gid = snapshot[2];
      const name = snapshot[3]?.[0]?.["1"]?.[0]?.[2];
      if (typeof gid === "string" && /^\d+$/.test(gid) && typeof name === "string") {
        tabs.set(gid, { name, gid });
      }
    } catch {
      // Ignore unrelated or incomplete Google metadata records.
    }
  }
  if (!tabs.size) throw new Error("No se pudieron identificar las pestañas de la planilla");
  return [...tabs.values()];
}

export async function readSheetTabs(sheetId: string): Promise<SheetTab[]> {
  const response = await fetch(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit`, {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);
  return parseSheetTabs(await response.text());
}

export async function readSheetCsv(sheetId: string, gid: string): Promise<string> {
  const response = await fetch(sheetCsvUrl(sheetId, gid), {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);
  const csv = await response.text();
  if (csv.trimStart().startsWith("<")) throw new Error("La planilla no devolvió CSV");
  return csv;
}
