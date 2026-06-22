import type { Producto } from "../../../data/types";
import { getProductos } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { DataTable, type Column } from "../../ui/DataTable";
import { SectionHeader, Badge } from "../../ui/primitives";
import { IconUsers } from "../../ui/icons";

/** Trazabilidad de diseño: del producto al empleado de I+D que diseñó su ADN. */
export function TrazabilidadTab() {
  const { data: productos, loading } = useAsyncData<Producto[]>(getProductos);

  const columns: Column<Producto>[] = [
    { key: "sku", header: "SKU", sortValue: (p) => p.sku, searchValue: (p) => `${p.sku} ${p.nombre}`, cell: (p) => <span className="font-mono text-xs font-semibold text-brand-600">{p.sku}</span> },
    { key: "nombre", header: "Producto", sortValue: (p) => p.nombre, cell: (p) => <span className="font-semibold text-navy-700">{p.nombre}</span> },
    { key: "adn", header: "ADN (juguete)", sortValue: (p) => p.adn ?? "", cell: (p) => <span className="font-mono text-xs text-slate-500">{p.adn ?? "—"}</span> },
    { key: "patente", header: "Diseño · patente", sortValue: (p) => p.disenoPatente ?? "", cell: (p) => <span className="text-sm text-slate-500">{p.disenoPatente ?? "—"}</span> },
    { key: "disenador", header: "Diseñador (I+D)", sortValue: (p) => p.disenador ?? "", searchValue: (p) => p.disenador ?? "", cell: (p) => p.disenador ? <Badge tone="brand">{p.disenador}</Badge> : <span className="text-slate-300">—</span> },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconUsers className="h-5 w-5" />}
        title="Trazabilidad de Diseño"
        subtitle="Quién diseñó cada producto: del SKU al ADN del juguete, su diseño (patente) y el empleado de I+D responsable."
      />
      <DataTable
        columns={columns}
        rows={productos ?? []}
        rowKey={(p) => p.id}
        loading={loading}
        searchPlaceholder="Buscar por producto, SKU o diseñador…"
        emptyTitle="Sin datos de trazabilidad"
        pageSize={8}
      />
    </div>
  );
}
