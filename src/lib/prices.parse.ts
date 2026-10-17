import type { Currency, GroupMeta, PriceCatalog, ServiceGroup, ServiceItem } from "./services.types.ts";

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
  const digits = v.replace(/[^\d]/g, "");
  return digits ? Number(digits) : undefined;
}

const HEADERS = ["id", "grupo", "nombre", "descripcion", "precio_min", "precio_max", "moneda", "desde", "consultar", "orden", "visible"];

export function parsePricesCsv(csv: string, groupMeta: Record<string, GroupMeta>): PriceCatalog {
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new Error("CSV vacío");
  const head = rows[0].map((h) => slugify(h).replace(/-/g, "_"));
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
