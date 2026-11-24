import type { Currency, GroupMeta, PriceCatalog, ServiceGroup, ServiceItem } from "./services.types.ts";
import { FALLBACK_CATALOG } from "./services.fallback.ts";

/**
 * Parser for the `WEB` tab of the prices sheet, published as CSV.
 * Columns: id, grupo, nombre, descripcion, precio_min, precio_max, moneda, desde, consultar, orden, visible
 */

export function slugify(text: string): string {
  return text
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

const YES = new Set(["si", "sí", "s", "true", "1", "x", "yes"]);
const isYes = (v: string) => YES.has(v.trim().toLowerCase());

function parseAmount(v: string): number | undefined {
  let value = v.replace(/[^\d.,]/g, "");
  if (!value) return undefined;
  const last = Math.max(value.lastIndexOf(","), value.lastIndexOf("."));
  if (last >= 0 && value.length - last - 1 !== 3) {
    value = value.slice(0, last).replace(/[.,]/g, "") + "." + value.slice(last + 1);
  } else value = value.replace(/[.,]/g, "");
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}

const HEADERS = ["id", "grupo", "nombre", "descripcion", "precio_min", "precio_max", "moneda", "desde", "consultar", "orden", "visible"];

export function parsePricesCsv(csv: string, groupMeta: Record<string, GroupMeta>): PriceCatalog {
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error("CSV vacío");
  const head = rows[0].map((h) => slugify(h).replace(/-/g, "_"));
  if (!head.includes("id")) return parseServiceList(rows, groupMeta);
  const col = Object.fromEntries(HEADERS.map((h) => [h, head.indexOf(h)]));
  for (const h of ["id", "grupo", "nombre", "precio_min"]) {
    if (col[h] < 0) throw new Error(`Falta la columna ${h}`);
  }
  const get = (r: string[], h: string) => (col[h] >= 0 ? (r[col[h]] ?? "").trim() : "");

  type Entry = { order: number; seq: number; groupTitle: string; item: ServiceItem };
  const entries: Entry[] = [];

  rows.slice(1).forEach((r, seq) => {
    const visible = get(r, "visible");
    if (visible !== "" && !isYes(visible)) return;
    const name = get(r, "nombre");
    const group = get(r, "grupo");
    if (!name || !group) return;
    const order = Number(get(r, "orden")) || 1000 + seq;
    const min = parseAmount(get(r, "precio_min"));
    const id = get(r, "id") || `${slugify(group)}-${seq}`;
    const max = parseAmount(get(r, "precio_max"));
    const currency: Currency = get(r, "moneda").toUpperCase() === "USD" ? "USD" : "ARS";
    entries.push({
      order,
      seq,
      groupTitle: group,
      item: {
        id,
        name,
        description: get(r, "descripcion"),
        min,
        max: max !== undefined && max !== min ? max : undefined,
        currency,
        from: isYes(get(r, "desde")),
        ask: isYes(get(r, "consultar")),
      },
    });
  });

  if (!entries.length) throw new Error("Sin servicios visibles");

  entries.sort((a, b) => a.order - b.order || a.seq - b.seq);
  const groups = new Map<string, ServiceGroup>();
  for (const e of entries) {
    const id = slugify(e.groupTitle);
    let g = groups.get(id);
    if (!g) {
      const meta = groupMeta[id] ?? { blurb: "", icon: "pc" as const };
      g = { id, title: e.groupTitle, blurb: meta.blurb, icon: meta.icon, items: [] };
      groups.set(id, g);
    }
    g.items.push(e.item);
  }
  return { groups: [...groups.values()] };
}

// Stable IDs keep the quote and FAQ tied to the same service when a price changes.
const SERVICE_IDS: [RegExp, string][] = [
  [/revision.*diagnostico/, "diag"], [/mantenimiento.*completo/, "mfull"],
  [/mantenimiento.*basica/, "mbasic"], [/mantenimiento.*notebook/, "mnote"],
  [/^cambio-de-pasta/, "paste"], [/limpieza-de-gpu/, "gpu"],
  [/programas-personalizados/, "custom"], [/combo-edicion/, "edit"], [/pack-adobe/, "adobe"],
  [/autocad/, "acad"], [/instalacion-de-office/, "office"],
  [/windows.*office/, "w11o"], [/windows-10-ltsc/, "w11"],
  [/licencia.*digital/, "lic"], [/licencia.*windows-10.*oem/, "oem10"],
  [/licencia.*windows-11.*oem/, "oem11"], [/widows-8|windows-8/, "w8"], [/windows-7/, "w7"],
  [/^optimizacion/, "opt"], [/actualizacion-bios/, "bios"], [/actualizacion-de-drivers/, "drv"],
  [/recuperacion-de-datos/, "data"], [/verificacion-de-integridad/, "disk"],
  [/ensamblaje.*reemplazo/, "asmp"], [/ensamblaje/, "asm"], [/compra-de-componentes-usados/, "used"],
  [/^oc-undervolt-cpu/, "ocuvc"], [/^oc-undervolt-gpu/, "ocuvg"],
  [/^overclock-cpu/, "occ"], [/^undervolt-cpu/, "uvc"], [/^undervolt-gpu/, "uvg"], [/curva-de-ventilacion/, "fan"],
];

/** Current PRECIOS_RADAZPC: description in A, price/range/Desde/USD in B. */
function parseServiceList(rows: string[][], meta: Record<string, GroupMeta>): PriceCatalog {
  const groups = new Map<string, ServiceGroup>();
  const ids = new Set<string>();
  let groupId = "";
  const titles: Record<string, string> = {
    "mantenimiento-y-limpieza": "Mantenimiento y limpieza",
    "sistemas-operativos-y-software": "Sistemas operativos y software",
    "ensamble-overclock-y-undervolt": "Ensamble, overclock y undervolt",
  };
  for (const row of rows) {
    const description = (row[0] ?? "").trim();
    const key = slugify(description);
    if (!key) continue;
    const rawPrice = (row[1] ?? "").trim();
    if (!rawPrice) {
      if (key === "revision-y-diagnostico" || key === "mantenimiento-y-limpieza") {
        groupId = "mantenimiento-y-limpieza"; continue;
      }
      if (key === "sistemas-operativos-y-software") { groupId = key; continue; }
      if (key.startsWith("ensambles-de-componentes")) { groupId = "ensamble-overclock-y-undervolt"; continue; }
    }
    if (!groupId) continue;
    const id = SERVICE_IDS.find(([pattern]) => pattern.test(key))?.[1] ?? key;
    if (ids.has(id)) throw new Error("Servicio duplicado en la planilla de precios");
    ids.add(id);
    const values = rawPrice.match(/\d[\d.,]*/g)?.map(parseAmount) ?? [];
    if (values.length > 2 || values.some((v) => v === undefined)) throw new Error("Precio no válido");
    if (!values.length && rawPrice && rawPrice !== "-" && !/consult|cotiz/.test(slugify(rawPrice))) throw new Error("Precio no reconocido");
    const [min, max] = values;
    if (min !== undefined && max !== undefined && max < min) throw new Error("Rango de precios invertido");
    const known = FALLBACK_CATALOG.groups.flatMap((g) => g.items).find((item) => item.id === id);
    let group = groups.get(groupId);
    if (!group) {
      group = { id: groupId, title: titles[groupId], ...(meta[groupId] ?? { blurb: "", icon: "pc" as const }), items: [] };
      groups.set(groupId, group);
    }
    group.items.push({
      id, name: known?.name ?? description, description,
      min, max: max !== min ? max : undefined,
      currency: /USD|US\$/i.test(rawPrice) ? "USD" : "ARS",
      from: /desde/i.test(rawPrice),
      ask: min === undefined || /consult|cotiza/i.test(description),
    });
  }
  if (!ids.size) throw new Error("Sin servicios en PRECIOS_RADAZPC");
  return { groups: [...groups.values()] };
}
