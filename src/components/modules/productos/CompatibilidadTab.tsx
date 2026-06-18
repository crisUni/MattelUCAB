import { useMemo, useState } from "react";
import type { ReglaCompatibilidad, ResultadoFit, Producto, TipoCuerpo } from "../../../data/types";
import { getReglasCompatibilidad, getProductos, getTiposCuerpo } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Select, Field, Skeleton } from "../../ui/primitives";
import { IconCheck, IconWarn, IconClose, IconLink } from "../../ui/icons";

const fit: Record<ResultadoFit, { tone: string; label: string; icon: React.ReactNode; ring: string; bg: string }> = {
  COMPATIBLE: { tone: "green", label: "Compatible", icon: <IconCheck className="h-4 w-4" />, ring: "ring-emerald-200", bg: "bg-emerald-50" },
  ADVERTENCIA: { tone: "amber", label: "Advertencia", icon: <IconWarn className="h-4 w-4" />, ring: "ring-amber-200", bg: "bg-amber-50" },
  INCOMPATIBLE: { tone: "red", label: "Incompatible", icon: <IconClose className="h-4 w-4" />, ring: "ring-rose-200", bg: "bg-rose-50" },
};

export function CompatibilidadTab() {
  const { data: reglas, loading } = useAsyncData<ReglaCompatibilidad[]>(getReglasCompatibilidad);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const { data: cuerpos } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);

  // Validador interactivo: zapato (accesorio) × cuerpo de muñeca.
  const zapatos = (productos ?? []).filter((p) => p.sku.startsWith("ACC-ZAP"));
  const [zapId, setZapId] = useState("");
  const [cuerpoId, setCuerpoId] = useState("");

  const resultado = useMemo<{ r: ResultadoFit; motivo: string } | null>(() => {
    if (!zapId || !cuerpoId) return null;
    const zap = zapatos.find((z) => z.id === zapId);
    const cuerpo = cuerpos?.find((c) => c.id === cuerpoId);
    if (!zap || !cuerpo) return null;
    const zapArqueado = zap.sku.includes("ARQ");
    const pieArqueado = cuerpo.formaPie === "ARQUEADO";
    if (zapArqueado === pieArqueado) return { r: "COMPATIBLE", motivo: `Ambos usan pie ${pieArqueado ? "arqueado" : "plano"}. Ajuste correcto.` };
    return { r: "INCOMPATIBLE", motivo: `El zapato es para pie ${zapArqueado ? "arqueado" : "plano"} y el cuerpo es de pie ${pieArqueado ? "arqueado" : "plano"}.` };
  }, [zapId, cuerpoId, zapatos, cuerpos]);

  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconLink className="h-5 w-5" />} title="Reglas de Compatibilidad · Lógica de Fits" subtitle="Un zapato de pie arqueado no calza en una muñeca de pie plano; un vestido Curvy no entra en un pack Petite sin advertencia." />

      {/* Validador interactivo */}
      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-bold text-navy-700">Validador de combinación</p>
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Zapato / accesorio">
            <Select value={zapId} onChange={(e) => setZapId(e.target.value)}>
              <option value="">Selecciona…</option>
              {zapatos.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Cuerpo de la muñeca">
            <Select value={cuerpoId} onChange={(e) => setCuerpoId(e.target.value)}>
              <option value="">Selecciona…</option>
              {(cuerpos ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre} · pie {c.formaPie.toLowerCase()}</option>)}
            </Select>
          </Field>
          <div className="min-w-[160px]">
            {resultado ? (
              <div className={`flex animate-scale-in items-center gap-2 rounded-xl px-4 py-3 ring-1 ${fit[resultado.r].bg} ${fit[resultado.r].ring}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-lg text-white ${resultado.r === "COMPATIBLE" ? "bg-emerald-500" : resultado.r === "ADVERTENCIA" ? "bg-amber-500" : "bg-rose-500"}`}>{fit[resultado.r].icon}</span>
                <span className="text-sm font-bold text-navy-700">{fit[resultado.r].label}</span>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">Elige ambos para validar</div>
            )}
          </div>
        </div>
        {resultado && <p className="mt-3 text-sm text-slate-500">{resultado.motivo}</p>}
      </Card>

      {/* Reglas registradas */}
      <p className="mb-3 text-sm font-bold text-navy-700">Reglas registradas</p>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(reglas ?? []).map((r, i) => (
            <Card key={r.id} style={{ animationDelay: `${i * 40}ms` }} className={`animate-fade-in p-4 ring-1 ${fit[r.resultado].ring}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${r.resultado === "COMPATIBLE" ? "bg-emerald-500" : r.resultado === "ADVERTENCIA" ? "bg-amber-500" : "bg-rose-500"}`}>{fit[r.resultado].icon}</span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-navy-700">{r.origen}</p>
                    <p className="text-xs text-slate-400">→ {r.destino}</p>
                  </div>
                </div>
                <Badge tone={fit[r.resultado].tone}>{fit[r.resultado].label}</Badge>
              </div>
              <p className="mt-2.5 text-sm leading-snug text-slate-500">{r.motivo}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
