import { useMemo } from "react";
import type { RentabilidadADN } from "../../../data/types";
import { getRentabilidadADN } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { ReportFrame } from "./ReportFrame";
import { Badge, Skeleton, fmtUsd, fmtNum } from "../../ui/primitives";

export function RentabilidadReport() {
  const { data, loading } = useAsyncData<RentabilidadADN[]>(getRentabilidadADN);
  const ranking = useMemo(() => [...(data ?? [])].sort((a, b) => b.margenUsd - a.margenUsd).slice(0, 10), [data]);
  const maxMargen = ranking[0]?.margenUsd ?? 1;

  return (
    <ReportFrame
      codigo="RPT-ADN-01"
      titulo="Análisis de Rentabilidad por ADN"
      subtitulo="Top 10 moldes de rostro · año fiscal"
      meta="Ranking por margen bruto (ingreso − costo de producción). Comparativa de moldes clásicos vs modernos."
    >
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
      ) : (
        <>
          {/* Comparativa destacada */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {ranking.slice(0, 2).map((r, i) => (
              <div key={r.moldeId} className={`rounded-2xl p-4 text-white ${i === 0 ? "bg-gradient-to-br from-brand-500 to-grape-600" : "bg-gradient-to-br from-navy-700 to-navy-500"}`}>
                <p className="text-xs uppercase tracking-wide text-white/70">#{i + 1} más rentable</p>
                <p className="text-xl font-extrabold">{r.molde} {r.anioPatente}</p>
                <p className="mt-1 text-sm text-white/80">Margen {fmtUsd(r.margenUsd)} · {r.margenPct.toFixed(1)}%</p>
              </div>
            ))}
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">Molde (año patente)</th>
                <th className="py-2 pr-2 text-right">Unidades</th>
                <th className="py-2 pr-2 text-right">Ingreso</th>
                <th className="py-2 pr-2 text-right">Costo</th>
                <th className="py-2 pr-2 text-right">Margen</th>
                <th className="hidden py-2 pr-2 md:table-cell">Participación</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.moldeId} className="border-b border-slate-100">
                  <td className="py-2.5 pr-2 font-bold text-slate-400">{i + 1}</td>
                  <td className="py-2.5 pr-2">
                    <span className="font-semibold text-navy-700">{r.molde}</span>
                    <span className="ml-1.5 text-xs text-slate-400">{r.anioPatente}</span>
                  </td>
                  <td className="py-2.5 pr-2 text-right text-slate-500">{fmtNum(r.unidadesVendidas)}</td>
                  <td className="py-2.5 pr-2 text-right text-slate-600">{fmtUsd(r.ingresoUsd)}</td>
                  <td className="py-2.5 pr-2 text-right font-mono text-rose-600">{fmtUsd(r.costoUsd)}</td>
                  <td className="py-2.5 pr-2 text-right">
                    <span className="font-bold text-emerald-600">{fmtUsd(r.margenUsd)}</span>
                    <Badge tone="green" className="ml-2">{r.margenPct.toFixed(0)}%</Badge>
                  </td>
                  <td className="hidden py-2.5 pr-2 md:table-cell">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-grape-500 transition-all duration-700" style={{ width: `${(r.margenUsd / maxMargen) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </ReportFrame>
  );
}
