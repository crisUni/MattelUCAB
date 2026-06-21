import type { Pack, Producto } from "../../../data/types";
import { getPacks, getProductos } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Skeleton, fmtUsd } from "../../ui/primitives";
import { IconBox } from "../../ui/icons";

export function PacksTab() {
  const { data: packs, loading } = useAsyncData<Pack[]>(getPacks);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const prod = (id: string) => productos?.find((p) => p.id === id);

  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconBox className="h-5 w-5" />} title="Packs / Sets de Regalo" subtitle="Agrupan varios productos (ej. 1 Barbie + 1 Ken + 1 Auto) bajo un único SKU." />
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(packs ?? []).map((pk) => {
            const items = pk.productosIds.map(prod).filter(Boolean) as Producto[];
            const suma = items.reduce((s, p) => s + p.precioBaseUsd, 0);
            const ahorro = suma - pk.precioUsd;
            return (
              <Card key={pk.id} className="overflow-hidden">
                <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-brand-500 to-grape-500 p-4 text-white">
                  <p className="text-lg font-bold">{pk.nombre}</p>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold">{fmtUsd(pk.precioUsd)}</p>
                    <p className="text-xs text-white/80">suma de productos</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-1.5">
                    {items.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 text-navy-700"><span className="font-mono text-xs text-brand-600">{p.sku}</span>{p.nombre}</span>
                        <span className="text-slate-500">{fmtUsd(p.precioBaseUsd)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <Badge tone="navy">{items.length} productos</Badge>
                    <span className="text-slate-400">Suma individual: <span className="font-semibold text-navy-700">{fmtUsd(suma)}</span></span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
