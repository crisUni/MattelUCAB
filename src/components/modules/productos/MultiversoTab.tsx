import { useEffect, useMemo, useState } from "react";
import type { Personaje, Profesion } from "../../../data/types";
import { getPersonajes, getProfesiones } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { SectionHeader, Select, Card, Badge, Skeleton } from "../../ui/primitives";
import { IconBriefcase } from "../../ui/icons";

export function MultiversoTab() {
  const { data: personajes } = useAsyncData<Personaje[]>(getPersonajes);
  const { data: profesiones, loading } = useAsyncData<Profesion[]>(getProfesiones);
  const [charId, setCharId] = useState("");

  const carrera = useMemo(
    () => (profesiones ?? []).filter((p) => p.personajeId === charId).sort((a, b) => a.anio - b.anio),
    [profesiones, charId]
  );
  const conProfesiones = useMemo(() => {
    const ids = new Set((profesiones ?? []).map((p) => p.personajeId));
    return (personajes ?? []).filter((p) => ids.has(p.id));
  }, [personajes, profesiones]);

  // Por defecto muestra a Barbie en la primera carga (o el primer personaje con carrera).
  useEffect(() => {
    if (!conProfesiones.length) return;
    if (!conProfesiones.some((p) => p.id === charId)) {
      const barbie = conProfesiones.find((p) => p.nombre.toLowerCase() === "barbie") ?? conProfesiones[0]!;
      setCharId(barbie.id);
    }
  }, [conProfesiones, charId]);

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconBriefcase className="h-5 w-5" />}
        title="Multiverso Laboral"
        subtitle="Una misma muñeca acumula múltiples profesiones a lo largo del tiempo. Su currículum es una línea de tiempo."
        action={
          <div className="w-56">
            <Select value={charId} onChange={(e) => setCharId(e.target.value)}>
              {conProfesiones.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : carrera.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">Este personaje no tiene profesiones registradas.</Card>
      ) : (
        <div className="relative pl-8">
          {/* Línea vertical */}
          <div className="absolute bottom-2 left-3 top-2 w-0.5 bg-gradient-to-b from-brand-400 via-grape-400 to-navy-300" />
          {carrera.map((p, i) => (
            <div key={p.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-in-right relative mb-5 last:mb-0">
              <span className="absolute -left-[22px] top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white ring-2 ring-brand-400">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-brand-500 to-grape-500" />
              </span>
              <Card className="p-4 transition-transform duration-300 hover:translate-x-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-navy-700">{p.titulo}</p>
                  <Badge tone="brand">{p.anio}</Badge>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
