// Run with: node scripts/verify-prices.mts
import assert from "node:assert/strict";
import { computeQuote, buildQuoteMessage } from "../src/lib/quote.ts";
import { parsePricesCsv, slugify } from "../src/lib/prices.parse.ts";
import { FALLBACK_CATALOG, GROUP_META } from "../src/lib/services.fallback.ts";
import { priceLabel } from "../src/lib/format.ts";

const csv = [
  "id,grupo,nombre,descripcion,precio_min,precio_max,moneda,desde,consultar,orden,visible",
  'mfull,Mantenimiento y limpieza,Mantenimiento completo,"Limpieza, cables y pasta",77500,85000,ARS,no,sí,2,sí',
  "diag,Mantenimiento y limpieza,Revisión y diagnóstico,,12000,,ARS,no,no,1,sí",
  "gpu,Mantenimiento y limpieza,Limpieza de GPU,,27500,35000,ARS,no,sí,3,sí",
  "oem10,Sistemas operativos y software,Licencia OEM,Se cotiza,20,,USD,no,sí,4,sí",
  "hidden,Sistemas operativos y software,Oculto,,1,,ARS,no,no,5,no",
].join("\r\n");

const cat = parsePricesCsv(csv, GROUP_META);
assert.equal(cat.groups.length, 2);
assert.deepEqual(cat.groups[0].items.map((i) => i.id), ["diag", "mfull", "gpu"]);
assert.equal(cat.groups[0].items[1].description, "Limpieza, cables y pasta");
assert.equal(cat.groups[0].items[1].ask, true);
assert.equal(cat.groups[0].blurb, GROUP_META["mantenimiento-y-limpieza"].blurb);
assert.equal(cat.groups[1].items.length, 1, "hidden row must be skipped");
assert.equal(cat.groups[1].items[0].currency, "USD");
assert.equal(cat.groups[0].items[2].max, 35000);
assert.equal(slugify("Ｍａｎｔｅｎｉｍｉｅｎｔｏ 🛠 y limpieza"), "mantenimiento-y-limpieza");
assert.throws(() => parsePricesCsv("id,grupo\n", GROUP_META));
assert.throws(() => parsePricesCsv("a,b\n1,2", GROUP_META));

// Quote math against the bundled catalog
const q = computeQuote(FALLBACK_CATALOG, ["mbasic", "mfull", "gpu", "mnote", "oem10", "custom"]);
assert.equal(q.lo, 50000 + 77500 + 27500 + 50000);
assert.equal(q.hi, 50000 + 85000 + 35000 + 50000);
assert.equal(q.open, true);
assert.equal(q.usd, 20);
assert.match(q.rangeText, /o más$/);
const msg = buildQuoteMessage(q);
assert.ok(msg.includes(q.rangeText.replace(/^Desde/, "desde")));
assert.ok(msg.includes("Limpieza de GPU"));
assert.equal(priceLabel(FALLBACK_CATALOG.groups[1].items.at(-1)!).value, "Consultar");

console.log("verify-prices: ok");
