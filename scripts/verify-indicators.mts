// Run with: node scripts/verify-indicators.mts. All sample data below is invented.
import assert from "node:assert/strict";
import {
  buildIndicators,
  candidateTabs,
  collectTabs,
  mergeTabs,
  normHeader,
  resolveTabs,
  normalizeBranch,
  normalizeDispositivo,
  normalizeMedioPago,
  normalizeStatus,
  normalizeTipo,
  parseAmount,
  parseJobsCsv,
  parseMonth,
} from "../src/lib/indicators.parse.ts";
import {
  decodeCookie,
  encodeCookie,
  getAttempts,
  recordFailure,
  recordSuccess,
  secondsLeft,
  strictest,
  waitAfter,
} from "../src/lib/indicators.ratelimit.ts";
import { SAMPLE_JOBS } from "../src/lib/indicators.sample.ts";

// Amounts
assert.equal(parseAmount("$24.500,00"), 24500);
assert.equal(parseAmount("$5.000"), 5000);
assert.equal(parseAmount("90000"), 90000);
assert.equal(parseAmount("$ 50,000"), 50000);
assert.equal(parseAmount("1.234.567"), 1234567);
assert.equal(parseAmount("12,5"), 12.5);
assert.equal(parseAmount(""), null);
assert.equal(parseAmount("-"), null);

// Dates
assert.equal(parseMonth("30/09/24"), "2024-09");
assert.equal(parseMonth("9/3/25"), "2025-03");
assert.equal(parseMonth("6/5/26"), "2026-05");
assert.equal(parseMonth("15/08/2024"), "2024-08");
assert.equal(parseMonth("31/13/25"), null);
assert.equal(parseMonth("Total del Mes"), null);

// Branch, status, type, device, payment
for (const v of ["sur", "Zona Sur", "AGUARAY", " zona  sur "]) assert.equal(normalizeBranch(v), "sur", v);
for (const v of ["norte", "ZONA NORTE", "Universidad Católica", "barrio univ", "Barrio Universidad Catolica"]) {
  assert.equal(normalizeBranch(v), "norte", v);
}
for (const v of ["", undefined, "centro", "otra"]) assert.equal(normalizeBranch(v), null);
assert.equal(normalizeStatus("Completada"), "completada");
assert.equal(normalizeStatus("en curso"), "en-curso");
assert.equal(normalizeStatus("Sin empezar"), "sin-empezar");
assert.equal(normalizeStatus("Omitida"), "omitida");
assert.equal(normalizeStatus("???"), "otro");
for (const v of ["Varios", "no especificado", "", "  "]) assert.equal(normalizeTipo(v), "Sin especificar", v);
assert.equal(normalizeTipo(" Mantenimiento "), "Mantenimiento");
assert.equal(normalizeDispositivo("NOTEBOOK"), "notebook");
assert.equal(normalizeDispositivo("PC ESCRITORIO"), "pc");
assert.equal(normalizeDispositivo(""), null);
assert.equal(normalizeMedioPago("Transferencia"), "transferencia");
assert.equal(normalizeMedioPago("Efectivo"), "efectivo");
assert.equal(normalizeMedioPago(""), null);

// Old tab: no branch/device columns. Contains a blank row, device-only row, Total row and a Sin empezar job.
const sep24 = [
  "Trabajo/s,Descripción,Estado,Nombre Cliente,Monto,Medio de Pago,Fecha de inicio,Fecha de entrega,MES",
  'Mantenimiento,x,Completada,Cliente Falso Uno,"$24.500,00",Transferencia,30/09/24,,SEP',
  "Varios,x,Completada,Cliente Falso Dos,90000,Efectivo,15/09/24,,SEP",
  ",,,,,,,,",
  "NOTEBOOK,,,,,,,,",
  'Diagnóstico,x,Omitida,Cliente Falso Tres,"$ 50,000",,2/9/24,,SEP',
  'Total del Mes,,,,"$164.500,00",,,,',
].join("\n");
// Repeats September 2024, columns in another order, plus new rows with the newer columns
const rp1024 = [
  "Fecha de inicio,Estado,Monto,Nombre Cliente,Trabajo/s,Medio de Pago,Atendido Por,Dispositivo,Sucursal",
  "30/09/24,Completada,24500,Cliente Falso Uno,Mantenimiento,Transferencia,,,",
  "15/09/24,Completada,90000,Cliente Falso Dos,Varios,Efectivo,,,",
  "2/9/24,Omitida,50000,Cliente Falso Tres,Diagnóstico,,,,",
  "5/10/24,En curso,15000,Cliente Falso Cuatro,Ensamble,,Persona B,PC ESCRITORIO,Zona Norte",
  "6/10/24,Completada,10000,Cliente Falso Cinco,Diagnóstico,Efectivo,Persona A,NOTEBOOK,aguaray",
].join("\n");
// A month whose sheet total is inconsistent: only rows count
const rp326 = [
  "Fecha de inicio,Estado,Monto,Trabajo/s",
  "3/3/26,Completada,10000,Mantenimiento",
  "9/3/26,Completada,5000,Diagnóstico",
  "Total del Mes,,24000,",
].join("\n");

const a = parseJobsCsv(sep24);
assert.equal(a.jobs.length, 3, "blank, device-only and total rows skipped");
assert.equal(a.jobs[1].tipo, "Sin especificar");
assert.equal(a.jobs[0].medioPago, "transferencia");
const b = parseJobsCsv(rp1024);
assert.equal(b.jobs.length, 5);
assert.equal(b.jobs[3].sucursal, "norte");
assert.equal(b.jobs[3].dispositivo, "pc");
assert.equal(b.jobs[3].atendidoPor, "Persona B");

const merged = mergeTabs([a, b, parseJobsCsv(rp326)]);
assert.equal(merged.length, 7, "september repeated in RP-10-24 is dropped");

const data = buildIndicators(merged);
const all = data.summaries.todas;
assert.equal(data.hasBranchData, true);
assert.equal(data.unassignedJobs, 5);
assert.equal(all.revenue, 24500 + 90000 + 10000 + 10000 + 5000, "only Completada counts; sheet total ignored");
assert.equal(all.completedJobs, 5);
assert.equal(all.avgTicket, Math.round(139500 / 5));
assert.equal(data.summaries.sur.revenue, 10000);
assert.equal(data.summaries.norte.revenue, 0, "En curso is not revenue");
// transfer 24500 vs cash 90000 + 10000
assert.equal(all.transferPct, Math.round((24500 / (24500 + 100000)) * 100));
assert.equal(all.perMonth["2024-09"].revenue, 114500);
assert.equal(all.byTipo[0].name, "Sin especificar");
assert.deepEqual(all.byMonth.map((m) => m.month).slice(0, 2), ["2024-09", "2024-10"]);
assert.equal(all.byMonth.at(-1)?.month, "2026-03");
assert.equal(all.byMonth.length, 19, "months without data are zero-filled");
assert.equal(all.byMonth[5].jobs, 0);

// The browser payload must hold aggregates only
const payload = JSON.stringify(data);
assert.ok(!payload.includes("Cliente Falso"), "no customer names in the aggregates");

// Gaps / empty / headerless input never throw
const empty = buildIndicators(mergeTabs([parseJobsCsv(""), parseJobsCsv("a,b\n1,2")]));
assert.equal(empty.summaries.todas.totalJobs, 0);
assert.equal(empty.summaries.todas.avgTicket, null);
assert.equal(empty.summaries.todas.transferPct, null);
assert.deepEqual(empty.summaries.todas.byMonth, []);
assert.equal(buildIndicators(SAMPLE_JOBS).summaries.todas.totalJobs, SAMPLE_JOBS.length);

// Real structure (invented data): merged title above the headers, header row shifted down,
// combined "Nombre Cliente/ Telefono", Dispositivo / Atendido Por / Sucursal, device-only and total rows
const shifted = [
  "REGISTRO DE PAGOS - RADAZPC,,,,,,,,,,",
  ",,,,,,,,,,",
  ",,,,,,,,,,",
  "Trabajo/s,Descripción,Dispositivo,Estado,Nombre Cliente/ Telefono,Monto,Medio de Pago,Fecha de inicio,Fecha de entrega,Atendido Por,MES,Sucursal",
  "NOTEBOOK,,,,,,,,,,,",
  "Mantenimiento,x,PC ESCRITORIO,Completada,Cliente Falso Seis 3870000000,\"$20.000,00\",Transferencia,6/5/25,8/5/25,Persona A,MAY,Aguaray",
  "Diagnóstico,x,NOTEBOOK,Completada,Cliente Falso Siete 3870000001,12000,Efectivo,9/5/25,,Persona B,MAY,Zona Norte",
  "Varios,x,,Sin empezar,Cliente Falso Ocho 3870000002,8000,,10/5/25,,Persona B,MAY,",
  "Total del Mes,,,,,40000,,,,,,",
].join("\n");
const sh = parseJobsCsv(shifted);
assert.equal(sh.jobs.length, 3);
assert.equal(sh.jobs[0].sucursal, "sur");
assert.equal(sh.jobs[1].sucursal, "norte");
assert.equal(sh.jobs[2].sucursal, null);
assert.equal(sh.jobs[0].monto, 20000);
assert.equal(sh.jobs[0].fecha, "2025-05-06");
assert.ok(!JSON.stringify(buildIndicators(sh.jobs)).includes("3870000"), "no phones in aggregates");
assert.equal(normHeader("Nombre Cliente / Telefono"), "nombre cliente/telefono");
assert.equal(normHeader(" Teléfono "), "telefono");
assert.equal(normHeader("Medio  de   Pago"), "medio de pago");

// Tab discovery
const tabs = candidateTabs(new Date(2026, 2, 15));
assert.equal(tabs[0], "RP-08-24");
assert.ok(tabs.includes("RP-09-24") && tabs.includes("RP-5-25") && tabs.includes("RP-05-25"));
assert.ok(tabs.includes("RP-3-26") && tabs.includes("RP-03-26"));
assert.ok(!tabs.includes("RP-04-26"), "stops at the current month");
assert.ok(!tabs.includes("RP-8-24") || tabs.includes("RP-08-24"));
assert.ok(tabs.every((t) => /^RP-\d{1,2}-\d{2}$/.test(t)));
assert.deepEqual(resolveTabs("RP-08-24, Trabajos ,RP-5-25", new Date()), ["RP-08-24", "RP-5-25"]);
assert.ok(!resolveTabs(undefined, new Date(2026, 2, 1)).includes("Trabajos"));

// gviz returns the first tab for a missing sheet name: only existing tabs are used, once
const catalog = "Tipo,Descripción\nDiagnóstico,x\nMantenimiento,y";
const existing: Record<string, string> = { "RP-09-24": sep24, "RP-5-25": shifted };
const fetched: string[] = [];
const parsedTabs = await collectTabs(async (name) => {
  fetched.push(name);
  if (name === "RP-05-24") return null; // HTTP error
  if (name === "RP-06-24") return "<!DOCTYPE html><html>error</html>";
  return existing[name] ?? catalog; // missing tab → default (first) sheet
}, ["RP-08-24", "RP-05-24", "RP-06-24", "RP-09-24", "RP-9-24", "RP-5-25", "RP-05-25"]);
assert.equal(fetched.length, 7);
const fromTabs = mergeTabs(parsedTabs);
assert.equal(fromTabs.length, 3 + 3, "catalog fallback adds no jobs; existing tabs once");
// If the default tab IS a job tab, missing names must not multiply it
const dup = mergeTabs(await collectTabs(async () => sep24, ["RP-A", "RP-B", "RP-C"]));
assert.equal(dup.length, 3);

// Login throttling
assert.equal(waitAfter(1), 0);
assert.equal(waitAfter(3), 0);
assert.equal(waitAfter(4), 5000);
assert.equal(waitAfter(5), 10000);
assert.equal(waitAfter(40), 15 * 60_000);
let at = getAttempts("ip-test");
for (let i = 0; i < 4; i++) at = recordFailure("ip-test", getAttempts("ip-test"), 1_000);
assert.equal(getAttempts("ip-test").fails, 4);
assert.equal(secondsLeft(getAttempts("ip-test"), 1_000), 5);
assert.equal(secondsLeft(getAttempts("ip-test"), 7_000), 0);
assert.deepEqual(decodeCookie(encodeCookie(at)), at);
assert.deepEqual(decodeCookie("garbage"), { fails: 0, until: 0 });
assert.equal(strictest({ fails: 1, until: 9 }, { fails: 4, until: 2 }).fails, 4);
recordSuccess("ip-test");
assert.equal(getAttempts("ip-test").fails, 0);

console.log("verify-indicators: ok");

const sameDay = [
  "Fecha de inicio,Estado,Monto,Nombre Cliente,Trabajo/s",
  "1/5/26,Completada,10000,Cliente Inventado A,Diagnóstico",
  "1/5/26,Completada,10000,Cliente Inventado B,Diagnóstico",
].join("\n");
const first = parseJobsCsv(sameDay);
const second = parseJobsCsv(sameDay + "\n1/5/26,Completada,10000,Cliente Inventado C,Diagnóstico");
assert.equal(mergeTabs([first, second]).length, 3, "different customers on the same day are preserved");
const repeated = parseJobsCsv(sameDay + "\n1/5/26,Completada,10000,Cliente Inventado A,Diagnóstico");
assert.equal(mergeTabs([first, repeated]).length, 3, "identical row multiplicity is preserved");
assert.ok(!JSON.stringify(first).includes("Cliente Inventado"), "customer identity only survives as server hash");
