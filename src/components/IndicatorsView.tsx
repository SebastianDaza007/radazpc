"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { FILTER_LABELS, type BranchFilter, type Breakdown, type GroupTotal, type IndicatorsData } from "@/lib/indicators.types";

const FILTERS = Object.keys(FILTER_LABELS) as BranchFilter[];

function Bars({ title, rows }: { title: string; rows: GroupTotal[] }) {
  const peak = Math.max(1, ...rows.map((r) => r.revenue));
  return (
    <div>
      <h2 className="display text-lg">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-mist/60">Sin datos.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {rows.map((r) => (
            <li key={r.name} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate text-mist/80" title={r.name}>
                {r.name}
              </span>
              <span className="h-3 rounded bg-moss-deep" aria-hidden="true">
                <span className="block h-3 rounded bg-lime" style={{ width: `${(r.revenue / peak) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums">
                {formatMoney(r.revenue)} · {r.jobs}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Receives aggregates only. Never pass raw sheet rows into this component. */
export default function IndicatorsView({ data }: { data: IndicatorsData | null }) {
  const [filter, setFilter] = useState<BranchFilter>("todas");
  const [month, setMonth] = useState(data?.summaries.todas.byMonth.at(-1)?.month ?? "todos");

  if (!data) {
    return (
      <p className="mt-10 rounded-lg border border-dashed border-mist/20 p-6 text-mist/70">
        Sin datos: falta configurar la fuente (INDICATORS_SHEET_ID) o no se pudo leer.
      </p>
    );
  }

  const summary = data.summaries[filter];
  const months = summary.byMonth.filter((p) => p.jobs > 0).map((p) => p.month);
  const view: Breakdown = month !== "todos" && summary.perMonth[month] ? summary.perMonth[month] : summary;
  const peak = Math.max(1, ...summary.byMonth.map((p) => p.revenue));
  const kpis = [
    { label: "Ingresos (completadas)", value: formatMoney(view.revenue) },
    { label: "Trabajos completados", value: String(view.completedJobs) },
    { label: "Ticket promedio", value: view.avgTicket === null ? "—" : formatMoney(view.avgTicket) },
    { label: "Transferencia vs efectivo", value: view.transferPct === null ? "—" : `${view.transferPct}% / ${100 - view.transferPct}%` },
  ];

  return (
    <div className="mt-8 grid gap-8">
      {!data.hasBranchData && (
        <p role="status" className="border-l-4 border-lime bg-moss-deep p-4 text-sm">
          Los trabajos anteriores no tienen sucursal cargada. Filas sin asignar: {data.unassignedJobs}.
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        <div className="field-row w-full max-w-sm">
          <label htmlFor="ind-branch" className="text-sm font-bold">
            Sucursal
          </label>
          <select
            id="ind-branch"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as BranchFilter);
              setMonth("todos");
            }}
            className="min-h-[46px] rounded border-2 border-mist/15 bg-ink px-3 text-mist"
          >
            {FILTERS.map((f) => (
              <option key={f} value={f} disabled={!data.hasBranchData && f !== "todas" && f !== "sin-asignar"}>
                {FILTER_LABELS[f]}
                {f === "sin-asignar" ? ` (${data.unassignedJobs})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row w-full max-w-xs">
          <label htmlFor="ind-month" className="text-sm font-bold">
            Mes
          </label>
          <select
            id="ind-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="min-h-[46px] rounded border-2 border-mist/15 bg-ink px-3 text-mist"
          >
            <option value="todos">Todos</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-mist/60">Importes de trabajos completados, agrupados por fecha de inicio. No representan ganancia neta. Los cambios de la planilla se consultan automáticamente al renovar los datos (cada 15 minutos, según las visitas).</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="rounded-lg border border-mist/10 bg-ink-2 p-6">
            <p className="text-sm text-mist/60">{k.label}</p>
            <p className="display mt-2 text-2xl text-lime">{k.value}</p>
          </li>
        ))}
      </ul>
      <div>
        <h2 className="display text-lg">Ingresos por mes</h2>
        {summary.byMonth.length === 0 ? (
          <p className="mt-3 text-sm text-mist/60">Sin datos para este filtro.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {summary.byMonth.map((p) => (
              <li key={p.month} className="grid grid-cols-[5rem_1fr_8rem] items-center gap-3 text-sm">
                <span className="tabular-nums text-mist/70">{p.month}</span>
                <span className="h-3 rounded bg-moss-deep" aria-hidden="true">
                  <span className="block h-3 rounded bg-lime" style={{ width: `${(p.revenue / peak) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{p.jobs ? formatMoney(p.revenue) : "Sin registros"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Bars title="Trabajos por tipo" rows={view.byTipo} />
        <Bars title="Notebook vs PC" rows={view.byDispositivo} />
        <Bars title="Medio de pago" rows={view.byMedioPago} />
        <Bars title="Atendido por" rows={view.byAtendidoPor} />
      </div>
    </div>
  );
}
