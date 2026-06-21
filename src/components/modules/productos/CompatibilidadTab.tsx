import type { ReglaCompatibilidad } from "../../../data/types";
import { getReglasCompatibilidad } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Skeleton } from "../../ui/primitives";
import { IconCheck, IconLink } from "../../ui/icons";

export function CompatibilidadTab() {
  const { data: reglas, loading } = useAsyncData<ReglaCompatibilidad[]>(getReglasCompatibilidad);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconLink className="h-5 w-5" />}
        title="Compatibilidad de Juguetes"
        subtitle="Pares de juguetes (genomas) registrados como compatibles entre sí en la base de datos (Compatibilidad_juguete)."
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (reglas ?? []).length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">No hay compatibilidades registradas.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(reglas ?? []).map((r, i) => (
            <Card key={r.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in flex items-center gap-3 p-4 ring-1 ring-emerald-200">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white"><IconCheck className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-navy-700">{r.origen} ↔ {r.destino}</p>
                <p className="text-xs text-slate-400">Juguetes compatibles</p>
              </div>
              <Badge tone="green">Compatible</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
