import type { ActividadSospechosa } from "../../../data/types";
import { getActividadSospechosa } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { ReportFrame } from "./ReportFrame";
import { Badge, Skeleton } from "../../ui/primitives";
import { IconBan, IconClock, IconBox } from "../../ui/icons";

const riesgoTone: Record<string, string> = { ALTO: "red", MEDIO: "amber", BAJO: "slate" };

export function ScalpersReport() {
  const { data, loading } = useAsyncData<ActividadSospechosa[]>(getActividadSospechosa);
  const filas = data ?? [];
  const acap = filas.filter((f) => f.patron === "ACAPARAMIENTO").length;
  const vel = filas.filter((f) => f.patron === "VELOCIDAD").length;
  const alto = filas.filter((f) => f.riesgo === "ALTO").length;

  return (
    <ReportFrame
      codigo="RPT-SEC-03"
      titulo="Monitor de Actividad Sospechosa"
      subtitulo="Detección de scalpers"
      meta="Patrones: acaparamiento (>3 unidades Platinum con distintas tarjetas y misma dirección) y velocidad de compra (checkout < 2 s desde el lanzamiento)."
    >
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <KPI label="Riesgo alto" value={alto} icon={<IconBan className="h-5 w-5" />} tone="from-rose-500 to-red-600" />
            <KPI label="Acaparamiento" value={acap} icon={<IconBox className="h-5 w-5" />} tone="from-amber-500 to-orange-600" />
            <KPI label="Velocidad (bots)" value={vel} icon={<IconClock className="h-5 w-5" />} tone="from-navy-600 to-navy-400" />
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-2">Usuario</th>
                <th className="py-2 pr-2">Patrón</th>
                <th className="py-2 pr-2">Referencia</th>
                <th className="py-2 pr-2">Detalle</th>
                <th className="py-2 pr-2 text-center">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2.5 pr-2 font-mono text-xs font-semibold text-navy-700">{f.usuario}</td>
                  <td className="py-2.5 pr-2">
                    <Badge tone={f.patron === "ACAPARAMIENTO" ? "amber" : "navy"}>
                      {f.patron === "ACAPARAMIENTO" ? "Acaparamiento" : "Velocidad"}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-2 text-slate-600">{f.referencia}</td>
                  <td className="py-2.5 pr-2 text-slate-500">{f.detalle}</td>
                  <td className="py-2.5 pr-2 text-center"><Badge tone={riesgoTone[f.riesgo]}>{f.riesgo}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </ReportFrame>
  );
}

function KPI({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl bg-gradient-to-br ${tone} p-4 text-white`}>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">{icon}</span>
    </div>
  );
}
