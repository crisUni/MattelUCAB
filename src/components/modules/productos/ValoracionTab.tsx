import { useState } from "react";
import type { Producto, Moneda, CondicionActivo } from "../../../data/types";
import { getProductos, getMonedas } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Card, Badge, SectionHeader, Select, Skeleton } from "../../ui/primitives";
import { IconCoin, IconScale } from "../../ui/icons";

const condicion: Record<CondicionActivo, { tone: string; label: string }> = {
  NRFB: { tone: "green", label: "NRFB · sin abrir" },
  MINT: { tone: "navy", label: "Mint · impecable" },
  RESTORATION: { tone: "amber", label: "Restoration · requiere arreglo" },
};

export function ValoracionTab() {
  const { data: productos, loading } = useAsyncData<Producto[]>(getProductos);
  const { data: monedas } = useAsyncData<Moneda[]>(getMonedas);
  const [cur, setCur] = useState("USD");

  const moneda = (monedas ?? []).find((m) => m.codigo === cur) ?? { codigo: "USD", simbolo: "$", tasaPorUsd: 1, nombre: "USD" };
  const conv = (usd: number) => `${moneda.simbolo} ${(usd * moneda.tasaPorUsd).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const valorados = (productos ?? []).filter((p) => p.valoracion).sort((a, b) => (b.valoracion!.valorMercadoUsd) - (a.valoracion!.valorMercadoUsd));

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconScale className="h-5 w-5" />}
        title="Valoración · Mercado Secundario"
        subtitle="Condición del activo y valoración dinámica: precio original de lanzamiento vs valor actual de mercado."
        action={
          <div className="flex items-center gap-2">
            <IconCoin className="h-5 w-5 text-brand-500" />
            <div className="w-44">
              <Select value={cur} onChange={(e) => setCur(e.target.value)}>
                {(monedas ?? []).map((m) => <option key={m.codigo} value={m.codigo}>{m.codigo} · {m.nombre}</option>)}
              </Select>
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valorados.map((p) => {
            const v = p.valoracion!;
            const mult = v.valorMercadoUsd / v.precioLanzamientoUsd;
            return (
              <Card key={p.id} className="overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1">
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="leading-tight">
                      <p className="font-semibold text-navy-700">{p.nombre}</p>
                      <p className="font-mono text-xs text-brand-600">{p.sku}</p>
                    </div>
                    <Badge tone={condicion[v.condicion].tone}>{v.condicion}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Lanzamiento {v.anioLanzamiento}</p>
                    <p className="mt-1 text-lg font-bold text-slate-500">{conv(v.precioLanzamientoUsd)}</p>
                  </div>
                  <div className="bg-brand-50/50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-500">Mercado {v.anioValoracion}</p>
                    <p className="mt-1 text-lg font-extrabold text-brand-600">{conv(v.valorMercadoUsd)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 text-xs">
                  <span className="text-slate-400">{condicion[v.condicion].label}</span>
                  <Badge tone={mult >= 100 ? "brand" : mult >= 10 ? "navy" : "slate"}>×{mult >= 100 ? Math.round(mult).toLocaleString() : mult.toFixed(1)}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">Tasas simuladas — USD base · VES (BCV) · BarbieCoins · Cripto (USDT). Al conectar la API, sustituir por tasas reales.</p>
    </div>
  );
}
