import type { Job } from "./indicators.types.ts";

/** Invented data for local development, without branch (like the real history today) (INDICATORS_SOURCE=sample). Not real customers or amounts. */
export const SAMPLE_JOBS: Job[] = [
  { fecha: "2025-08-04", tipo: "Mantenimiento", dispositivo: "pc", monto: 50000, medioPago: "transferencia", estado: "completada", atendidoPor: "Persona A", sucursal: null },
  { fecha: "2025-08-19", tipo: "Diagnóstico", dispositivo: "notebook", monto: 12000, medioPago: "efectivo", estado: "completada", atendidoPor: "Persona B", sucursal: null },
  { fecha: "2025-09-02", tipo: "Instalación de Sistemas Operativos", dispositivo: "pc", monto: 35000, medioPago: "transferencia", estado: "completada", atendidoPor: "Persona A", sucursal: null },
  { fecha: "2025-09-15", tipo: "Ensamble de Componentes", dispositivo: "pc", monto: 30000, medioPago: null, estado: "en-curso", atendidoPor: "Persona B", sucursal: null },
  { fecha: "2025-09-28", tipo: "Sin especificar", dispositivo: null, monto: 15000, medioPago: "efectivo", estado: "completada", atendidoPor: null, sucursal: null },
  { fecha: "2026-03-10", tipo: "Mantenimiento", dispositivo: "notebook", monto: 24000, medioPago: "transferencia", estado: "completada", atendidoPor: "Persona A", sucursal: null },
  { fecha: "2026-03-22", tipo: "Diagnóstico", dispositivo: "pc", monto: 12000, medioPago: null, estado: "omitida", atendidoPor: "Persona B", sucursal: null },
];
