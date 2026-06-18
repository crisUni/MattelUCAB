import type { DiversidadFila } from "../../../data/types";
import { getDiversidad } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { ReportFrame } from "./ReportFrame";
import { Badge, Skeleton, fmtNum } from "../../ui/primitives";
import { IconWarn } from "../../ui/icons";

const UMBRAL = 5; // % mínimo de producción anual

export function DiversidadReport() {
  const { data, loading } = useAsyncData<DiversidadFila[]>(getDiversidad);
  const tono = (data ?? []).filter((d) => d.dimension === "TONO_PIEL");
  const cuerpo = (data ?? []).filter((d) => d.dimension === "TIPO_CUERPO");
  const enRiesgo = (data ?? []).filter((d) => d.producidasPct < UMBRAL);

  return (
    <ReportFrame
      codigo="RPT-DIV-02"
      titulo="Índice de Diversidad"
      subtitulo="Matriz de Representación Demográfica"
      meta={`Se resalta en rojo toda categoría con producción inferior al ${UMBRAL}% del total anual.`}
    >
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
      ) : (
        <>
          {enRiesgo.length > 0 && (
            <div className="mb-5 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <IconWarn className="mt-0.5 h-4 w-4 shrink-0" />
              <p><b>{enRiesgo.length} categoría(s)</b> por debajo del umbral del {UMBRAL}%: {enRiesgo.map((e) => e.categoria).join(", ")}. Requiere revisión de la planificación de producción.</p>
            </div>
          )}

          <DimTable titulo="Por Tono de Piel" filas={tono} />
          <div className="mt-7" />
          <DimTable titulo="Por Tipo de Cuerpo" filas={cuerpo} />
        </>
      )}
    </ReportFrame>
  );
}

function DimTable({ titulo, filas }: { titulo: string; filas: DiversidadFila[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-navy-700">{titulo}</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2">Categoría</th>
            <th className="py-2 pr-2 text-right">Producidas</th>
            <th className="py-2 pr-2 text-right">Vendidas</th>
            <th className="py-2 pr-2 text-right">Unidades</th>
            <th className="py-2 pr-2">Distribución (prod. vs vend.)</th>
            <th className="py-2 pr-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => {
            const riesgo = f.producidasPct < UMBRAL;
            return (
              <tr key={f.categoria} className={`border-b border-slate-100 ${riesgo ? "bg-rose-50/70" : ""}`}>
                <td className={`py-2.5 pr-2 font-semibold ${riesgo ? "text-rose-700" : "text-navy-700"}`}>{f.categoria}</td>
                <td className={`py-2.5 pr-2 text-right font-bold ${riesgo ? "text-rose-600" : "text-navy-700"}`}>{f.producidasPct}%</td>
                <td className="py-2.5 pr-2 text-right text-slate-500">{f.vendidasPct}%</td>
                <td className="py-2.5 pr-2 text-right text-slate-500">{fmtNum(f.unidadesProducidas)}</td>
                <td className="py-2.5 pr-2">
                  <div className="space-y-1">
                    <Bar pct={f.producidasPct} tone={riesgo ? "bg-rose-500" : "bg-brand-500"} />
                    <Bar pct={f.vendidasPct} tone="bg-navy-400" />
                  </div>
                </td>
                <td className="py-2.5 pr-2 text-center">
                  {riesgo ? <Badge tone="red">&lt; {UMBRAL}%</Badge> : <Badge tone="green">OK</Badge>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ pct, tone }: { pct: number; tone: string }) {
  return (
    <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${tone} transition-all duration-700`} style={{ width: `${Math.min(100, pct * 1.5)}%` }} />
    </div>
  );
}
