import type { Personaje, TipoVinculo } from "../../../data/types";
import { getPersonajes } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Skeleton } from "../../ui/primitives";
import { IconUsers, IconLink } from "../../ui/icons";

const vinculoTone: Record<TipoVinculo, string> = {
  PAREJA: "brand", HERMANA: "navy", AMIGA: "green", RIVAL: "red", MASCOTA: "amber",
};
const vinculoLabel: Record<TipoVinculo, string> = {
  PAREJA: "Pareja", HERMANA: "Hermana", AMIGA: "Amiga", RIVAL: "Rival", MASCOTA: "Mascota",
};

export function PersonajesTab() {
  const { data: personajes, loading } = useAsyncData<Personaje[]>(getPersonajes);
  const nombre = (id: string) => personajes?.find((p) => p.id === id)?.nombre ?? id;

  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconUsers className="h-5 w-5" />} title="Personajes y Vínculos" subtitle="La familia y el círculo de Barbie: parejas, hermanas, amigas, rivales y mascotas." />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(personajes ?? []).map((p, i) => (
            <Card key={p.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in overflow-hidden p-0">
              <div className="flex items-center gap-3 bg-gradient-to-r from-brand-500 to-grape-500 p-4 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-lg font-extrabold backdrop-blur">{p.nombre[0]}</span>
                <div className="leading-tight">
                  <p className="text-lg font-bold">{p.nombre}</p>
                  <p className="text-xs text-white/80">{p.vinculos.length} vínculo{p.vinculos.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><IconLink className="h-3.5 w-3.5" />Vínculos</p>
                <div className="space-y-1.5">
                  {p.vinculos.length === 0 && <p className="text-xs text-slate-400">Sin vínculos.</p>}
                  {p.vinculos.map((v) => (
                    <div key={v.personajeId + v.tipo} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                      <span className="text-sm text-navy-700">{nombre(v.personajeId)}</span>
                      <Badge tone={vinculoTone[v.tipo]}>{vinculoLabel[v.tipo]}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
