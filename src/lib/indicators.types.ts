/** Normalized branch of a job. `null` means the sheet row has no (or an unknown) branch. */
export type Sucursal = "sur" | "norte" | null;

export type JobStatus = "completada" | "en-curso" | "sin-empezar" | "omitida" | "otro";
export type Dispositivo = "pc" | "notebook" | null;
export type MedioPago = "transferencia" | "efectivo" | "otro" | null;

/** Label for jobs whose type is "Varios", "no especificado" or empty. */
export const TIPO_SIN_ESPECIFICAR = "Sin especificar";

/**
 * One row of the payments log. SERVER ONLY. Customer names and phones are never included in this
 * model, and the model itself is never serialized to the browser: only `IndicatorsData` is.
 */
export type Job = {
  /** YYYY-MM-DD */
  fecha: string;
  tipo: string;
  dispositivo: Dispositivo;
  /** ARS; 0 when the row has no amount. */
  monto: number;
  medioPago: MedioPago;
  estado: JobStatus;
  atendidoPor: string | null;
  sucursal: Sucursal;
};

export interface IndicatorSource {
  load(): Promise<Job[]>;
}

export type BranchFilter = "todas" | "sur" | "norte" | "sin-asignar";

export const FILTER_LABELS: Record<BranchFilter, string> = {
  todas: "Todas",
  sur: "Zona Sur · Aguaray",
  norte: "Zona Norte · Barrio Universidad Católica",
  "sin-asignar": "Sin asignar",
};

export type MonthPoint = { month: string; jobs: number; revenue: number };
export type GroupTotal = { name: string; jobs: number; revenue: number };

/** Aggregates only: no names, phones or free text from customers. Safe for the browser. */
export type Breakdown = {
  totalJobs: number;
  completedJobs: number;
  /** Revenue of "Completada" jobs only. */
  revenue: number;
  avgTicket: number | null;
  byStatus: Record<JobStatus, number>;
  /** Share of transfer revenue over transfer + cash revenue (completed jobs). Null without data. */
  transferPct: number | null;
  byTipo: GroupTotal[];
  byDispositivo: GroupTotal[];
  byMedioPago: GroupTotal[];
  byAtendidoPor: GroupTotal[];
};

export type IndicatorSummary = Breakdown & {
  /** Continuous month range, zero-filled. */
  byMonth: MonthPoint[];
  /** Same aggregates restricted to one month (YYYY-MM). */
  perMonth: Record<string, Breakdown>;
};

export type IndicatorsData = {
  summaries: Record<BranchFilter, IndicatorSummary>;
  /** True when at least one job has a branch. */
  hasBranchData: boolean;
  /** Rows without branch, across all tabs. */
  unassignedJobs: number;
};
