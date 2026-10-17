import { parseCsv } from "./prices.parse.ts";
import {
  TIPO_SIN_ESPECIFICAR,
  type BranchFilter,
  type Breakdown,
  type Dispositivo,
  type GroupTotal,
  type IndicatorsData,
  type IndicatorSummary,
  type Job,
  type JobStatus,
  type MedioPago,
  type MonthPoint,
  type Sucursal,
} from "./indicators.types.ts";

/** Lowercase, no accents, single spaces. */
export function norm(text: string): string {
  return text
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeBranch(raw: string | undefined): Sucursal {
  const v = norm(raw ?? "");
  if (!v) return null;
  if (v === "sur" || v === "zona sur" || v.includes("aguaray")) return "sur";
  if (v === "norte" || v === "zona norte" || v.includes("universidad catolica") || v.startsWith("barrio univ")) {
    return "norte";
  }
  return null;
}

export function normalizeStatus(raw: string | undefined): JobStatus {
  const v = norm(raw ?? "");
  if (v.startsWith("completad")) return "completada";
  if (v.startsWith("en curso")) return "en-curso";
  if (v.startsWith("sin empezar")) return "sin-empezar";
  if (v.startsWith("omitid")) return "omitida";
  return "otro";
}

export function normalizeTipo(raw: string | undefined): string {
  const t = (raw ?? "").replace(/\s+/g, " ").trim();
  const v = norm(t);
  if (!v || v === "varios" || v === "no especificado" || v === "-") return TIPO_SIN_ESPECIFICAR;
  return t;
}

export function normalizeDispositivo(raw: string | undefined): Dispositivo {
  const v = norm(raw ?? "");
  if (v.includes("notebook") || v.includes("laptop")) return "notebook";
  if (v.includes("pc")) return "pc";
  return null;
}

export function normalizeMedioPago(raw: string | undefined): MedioPago {
  const v = norm(raw ?? "");
  if (!v || v === "-") return null;
  if (v.includes("transfer")) return "transferencia";
  if (v.includes("efectivo")) return "efectivo";
  return "otro";
}

/** "$24.500,00", "90000", "$ 50,000" → number. Unparseable → null. */
export function parseAmount(raw: string | undefined): number | null {
  let v = (raw ?? "").replace(/[^\d.,-]/g, "");
  if (!/\d/.test(v)) return null;
  const lastDot = v.lastIndexOf(".");
  const lastComma = v.lastIndexOf(",");
  if (lastDot >= 0 && lastComma >= 0) {
    const dec = lastDot > lastComma ? "." : ",";
    const thousands = dec === "." ? "," : ".";
    v = v.split(thousands).join("").replace(dec, ".");
  } else if (lastComma >= 0 || lastDot >= 0) {
    const sep = lastComma >= 0 ? "," : ".";
    const parts = v.split(sep);
    const last = parts[parts.length - 1];
    // "50,000" / "24.500": groups of 3 digits are thousands. Anything else is a decimal.
    v = parts.length > 2 || last.length === 3 ? parts.join("") : `${parts[0]}.${last}`;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** dd/mm/yy or dd/mm/yyyy → "YYYY-MM-DD". Two-digit years are 20xx. */
export function parseDay(raw: string | undefined): string | null {
  const m = /^\s*(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})\s*$/.exec(raw ?? "");
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** dd/mm/yy or dd/mm/yyyy → "YYYY-MM". */
export function parseMonth(raw: string | undefined): string | null {
  return parseDay(raw)?.slice(0, 7) ?? null;
}

const ALIASES = {
  fecha: ["fecha de inicio", "fecha inicio", "fecha"],
  monto: ["monto", "importe"],
  estado: ["estado", "estatus"],
  tipo: ["trabajo/s", "trabajos", "trabajo", "tipo de trabajo", "tipo"],
  dispositivo: ["dispositivo"],
  medioPago: ["medio de pago", "medio pago"],
  atendidoPor: ["atendido por"],
  sucursal: ["sucursal", "zona"],
} as const;

type Column = keyof typeof ALIASES;

/** Header cell → comparable text: no accents/case, no punctuation but "/", tidy spaces around "/". */
export function normHeader(text: string): string {
  return norm(text)
    .replace(/[^a-z0-9/ ]/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function findColumns(header: string[]): Partial<Record<Column, number>> {
  const cells = header.map(normHeader);
  const out: Partial<Record<Column, number>> = {};
  for (const col of Object.keys(ALIASES) as Column[]) {
    for (const alias of ALIASES[col]) {
      const i = cells.indexOf(alias);
      if (i >= 0) {
        out[col] = i;
        break;
      }
    }
  }
  return out;
}

export type ParsedTab = { jobs: Job[]; keys: string[] };

/**
 * Parses one tab. Columns are located by header NAME, so the title block above the headers
 * ("REGISTRO DE PAGOS - RADAZPC" in merged cells), shifted header rows and column order don't matter.
 * Customer name and phone columns ("Nombre Cliente/ Telefono", "Telefono") are never read. Skips blank rows, device-only rows
 * ("NOTEBOOK"), "Total del Mes" rows and rows without a valid date, so sheet totals are ignored:
 * every figure is computed from the job rows.
 * `keys` are date|status|amount fingerprints used to drop rows repeated across tabs.
 */
export function parseJobsCsv(csv: string): ParsedTab {
  const rows = parseCsv(csv);
  const headerAt = rows.findIndex((r) => {
    const c = findColumns(r);
    return c.fecha !== undefined && (c.monto !== undefined || c.estado !== undefined);
  });
  if (headerAt < 0) return { jobs: [], keys: [] };
  const col = findColumns(rows[headerAt]);
  const cell = (r: string[], c: Column) => (col[c] !== undefined ? r[col[c]!] : undefined);
  const jobs: Job[] = [];
  const keys: string[] = [];

  for (const r of rows.slice(headerAt + 1)) {
    if (r.every((c) => c.trim() === "")) continue;
    if (r.some((c) => norm(c).startsWith("total"))) continue;
    const fecha = parseDay(cell(r, "fecha"));
    if (!fecha) continue;
    const monto = parseAmount(cell(r, "monto")) ?? 0;
    const estado = col.estado !== undefined ? normalizeStatus(cell(r, "estado")) : "otro";
    const atendido = (cell(r, "atendidoPor") ?? "").trim();
    jobs.push({
      fecha,
      tipo: normalizeTipo(cell(r, "tipo")),
      dispositivo: normalizeDispositivo(cell(r, "dispositivo")),
      monto,
      medioPago: normalizeMedioPago(cell(r, "medioPago")),
      estado,
      atendidoPor: atendido || null,
      sucursal: normalizeBranch(cell(r, "sucursal")),
    });
    // Date + status + amount: stable across tabs with different column order.
    keys.push(`${fecha}|${estado}|${monto}`);
  }
  return { jobs, keys };
}

/**
 * Merges tabs in order. A row whose fingerprint already appeared in an EARLIER tab is dropped
 * (e.g. a "RP-10-24" tab that repeats September 2024). Repeats inside one tab are kept.
 */
export function mergeTabs(tabs: ParsedTab[]): Job[] {
  const seen = new Set<string>();
  const all: Job[] = [];
  for (const tab of tabs) {
    const fresh: string[] = [];
    tab.jobs.forEach((job, i) => {
      if (seen.has(tab.keys[i])) return;
      fresh.push(tab.keys[i]);
      all.push(job);
    });
    fresh.forEach((k) => seen.add(k));
  }
  return all;
}

function nextMonth(m: string): string {
  const [y, mo] = m.split("-").map(Number);
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
}

function group(jobs: Job[], key: (j: Job) => string): GroupTotal[] {
  const map = new Map<string, GroupTotal>();
  for (const j of jobs) {
    const name = key(j);
    const g = map.get(name) ?? { name, jobs: 0, revenue: 0 };
    g.jobs++;
    if (j.estado === "completada") g.revenue += j.monto;
    map.set(name, g);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue || b.jobs - a.jobs || a.name.localeCompare(b.name));
}

const DISPOSITIVO_LABEL = { pc: "PC de escritorio", notebook: "Notebook" } as const;
const MEDIO_LABEL = { transferencia: "Transferencia", efectivo: "Efectivo", otro: "Otro" } as const;

export function breakdown(jobs: Job[]): Breakdown {
  const byStatus: Record<JobStatus, number> = { completada: 0, "en-curso": 0, "sin-empezar": 0, omitida: 0, otro: 0 };
  let revenue = 0;
  let transfer = 0;
  let cash = 0;
  for (const j of jobs) {
    byStatus[j.estado]++;
    if (j.estado !== "completada") continue;
    revenue += j.monto;
    if (j.medioPago === "transferencia") transfer += j.monto;
    if (j.medioPago === "efectivo") cash += j.monto;
  }
  const completedJobs = byStatus.completada;
  return {
    totalJobs: jobs.length,
    completedJobs,
    revenue,
    avgTicket: completedJobs ? Math.round(revenue / completedJobs) : null,
    byStatus,
    transferPct: transfer + cash > 0 ? Math.round((transfer / (transfer + cash)) * 100) : null,
    byTipo: group(jobs, (j) => j.tipo),
    byDispositivo: group(jobs, (j) => (j.dispositivo ? DISPOSITIVO_LABEL[j.dispositivo] : "Sin dato")),
    byMedioPago: group(jobs, (j) => (j.medioPago ? MEDIO_LABEL[j.medioPago] : "Sin dato")),
    byAtendidoPor: group(jobs, (j) => j.atendidoPor ?? "Sin dato"),
  };
}

export function summarize(jobs: Job[]): IndicatorSummary {
  const perMonthJobs = new Map<string, Job[]>();
  for (const j of jobs) {
    const m = j.fecha.slice(0, 7);
    perMonthJobs.set(m, [...(perMonthJobs.get(m) ?? []), j]);
  }
  const perMonth: Record<string, Breakdown> = {};
  for (const [m, list] of perMonthJobs) perMonth[m] = breakdown(list);

  const keys = [...perMonthJobs.keys()].sort();
  const byMonth: MonthPoint[] = [];
  if (keys.length) {
    for (let m = keys[0]; m <= keys[keys.length - 1]; m = nextMonth(m)) {
      const b = perMonth[m];
      byMonth.push({ month: m, jobs: b?.totalJobs ?? 0, revenue: b?.revenue ?? 0 });
    }
  }
  return { ...breakdown(jobs), byMonth, perMonth };
}

export function buildIndicators(jobs: Job[]): IndicatorsData {
  const pick: Record<BranchFilter, (j: Job) => boolean> = {
    todas: () => true,
    sur: (j) => j.sucursal === "sur",
    norte: (j) => j.sucursal === "norte",
    "sin-asignar": (j) => j.sucursal === null,
  };
  const summaries = Object.fromEntries(
    (Object.keys(pick) as BranchFilter[]).map((f) => [f, summarize(jobs.filter(pick[f]))]),
  ) as Record<BranchFilter, IndicatorSummary>;
  return {
    summaries,
    hasBranchData: jobs.some((j) => j.sucursal !== null),
    unassignedJobs: summaries["sin-asignar"].totalJobs,
  };
}

// ---------------------------------------------------------------------------------------------
// Tab discovery

/** Tabs that are never payment logs. */
const EXCLUDED_TABS = new Set(["trabajos"]);

export const FIRST_TAB: { year: number; month: number } = { year: 2024, month: 8 };

/**
 * Candidate tab names, oldest first: RP-MM-AA from 08-24 to `now`. Names exist both with and
 * without the leading zero (RP-08-24 / RP-5-25 / RP-3-26), so both variants are tried per month.
 */
export function candidateTabs(now: Date): string[] {
  const names: string[] = [];
  let y = FIRST_TAB.year;
  let m = FIRST_TAB.month;
  while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1)) {
    const yy = String(y % 100).padStart(2, "0");
    const padded = `RP-${String(m).padStart(2, "0")}-${yy}`;
    names.push(padded);
    if (m < 10) names.push(`RP-${m}-${yy}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return names;
}

/** INDICATORS_SHEET_TABS (comma list) or generated candidates. "Trabajos" is always excluded. */
export function resolveTabs(configured: string | undefined, now: Date): string[] {
  const list = (configured ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  return (list.length ? list : candidateTabs(now)).filter((t) => !EXCLUDED_TABS.has(norm(t)));
}

/**
 * Loads every existing tab, oldest first. `fetchTab(name)` returns the CSV text, or null when the
 * request failed (HTTP error, HTML error page). gviz answers a request for a MISSING tab with the
 * sheet's default (first) tab, so many missing names return the same text: a text already seen is
 * never used twice, which collapses all those fallbacks into at most one copy of the first tab (and
 * if that is the "Trabajos" catalog it has no job rows). Missing tabs are skipped silently.
 */
export async function collectTabs(
  fetchTab: (name: string) => Promise<string | null>,
  tabs: string[],
  concurrency = 6,
): Promise<ParsedTab[]> {
  const texts: (string | null)[] = new Array(tabs.length).fill(null);
  for (let i = 0; i < tabs.length; i += concurrency) {
    const batch = tabs.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((t) => fetchTab(t).catch(() => null)));
    results.forEach((r, k) => (texts[i + k] = r));
  }
  const seen = new Set<string>();
  const parsed: ParsedTab[] = [];
  for (const text of texts) {
    if (!text || text.trimStart().startsWith("<") || seen.has(text)) continue;
    seen.add(text);
    parsed.push(parseJobsCsv(text));
  }
  return parsed;
}
