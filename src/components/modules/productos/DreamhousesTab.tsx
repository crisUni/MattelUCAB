import { useState } from "react";
import type { Dreamhouse } from "../../../data/types";
import { getDreamhouses } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Skeleton } from "../../ui/primitives";
import { IconHome, IconChevron, IconCar, IconSpark } from "../../ui/icons";

export function DreamhousesTab() {
  const { data: casas, loading } = useAsyncData<Dreamhouse[]>(getDreamhouses);
  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconHome className="h-5 w-5" />} title="Bienes Raíces · Dreamhouses" subtitle="Estructura jerárquica: Dreamhouse → ambientes → mobiliario. Con compatibilidad de vehículos y mobiliario interactivo." />
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <div className="space-y-5">
          {(casas ?? []).map((c) => <DreamhouseCard key={c.id} casa={c} />)}
        </div>
      )}
    </div>
  );
}

function DreamhouseCard({ casa }: { casa: Dreamhouse }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-navy-700 to-grape-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"><IconHome className="h-6 w-6" /></span>
          <div>
            <p className="text-lg font-bold">{casa.nombre}</p>
            <p className="text-xs text-white/70">{casa.ambientes.length} ambientes · año {casa.anio}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs backdrop-blur"><IconCar className="h-4 w-4" />{casa.vehiculosCompatibles.join(", ")}</span>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {casa.ambientes.map((amb) => (
          <div key={amb.id} className="rounded-2xl border border-slate-200 p-4">
            <p className="mb-2 flex items-center gap-2 font-semibold text-navy-700"><IconChevron className="h-4 w-4 text-brand-500" />{amb.nombre}</p>
            <div className="space-y-1.5">
              {amb.mobiliario.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                  <span className="text-navy-700">{m.nombre}</span>
                  {m.usaBaterias && <Badge tone="amber"><IconSpark className="h-3 w-3" />baterías</Badge>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
