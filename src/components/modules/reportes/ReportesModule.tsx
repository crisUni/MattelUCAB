import { useState } from "react";
import { getReporte, reportePdfUrl, type ReporteData, type ReporteColumna } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { SubTabs, type SubTab, SectionHeader, Button, fmtUsd } from "../../ui/primitives";
import { DataTable, type Column } from "../../ui/DataTable";
import { IconReport, IconBox, IconDna, IconScale } from "../../ui/icons";

const TABS: SubTab[] = [
  { id: "sueltas", label: "Unidades sueltas por Hub", icon: <IconBox className="h-4 w-4" /> },
  { id: "sculpts", label: "Top Face Sculpts", icon: <IconReport className="h-4 w-4" /> },
  { id: "agotado", label: "Subensamblaje agotado", icon: <IconReport className="h-4 w-4" /> },
  { id: "rentabilidad", label: "Rentabilidad por ADN", icon: <IconDna className="h-4 w-4" /> },
  { id: "diversidad", label: "Índice de diversidad", icon: <IconScale className="h-4 w-4" /> },
];

export function ReportesModule() {
  const [tab, setTab] = useState("sueltas");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      <ReporteView id={tab} key={tab} />
    </div>
  );
}

type Fila = Record<string, unknown>;

function fmtCelda(val: unknown, tipo?: ReporteColumna["tipo"]): string {
  if (val == null || val === "") return "—";
  if (tipo === "dinero") return fmtUsd(Number(val));
  if (tipo === "pct") return `${Number(val).toFixed(2)}%`;
  if (tipo === "numero") return Number(val).toLocaleString();
  return String(val);
}

function ReporteView({ id }: { id: string }) {
  const { data, loading } = useAsyncData<ReporteData>(() => getReporte(id), [id]);

  const columns: Column<Fila>[] = (data?.columnas ?? []).map((c, idx) => ({
    key: c.key,
    header: c.label,
    align: idx === 0 ? "left" : "right",
    sortValue: (r) => (c.tipo && c.tipo !== "texto" ? Number(r[c.key]) : String(r[c.key] ?? "")),
    searchValue: (r) => String(r[c.key] ?? ""),
    cell: (r) => <span className={idx === 0 ? "font-semibold text-navy-700" : "text-slate-600"}>{fmtCelda(r[c.key], c.tipo)}</span>,
  }));

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconReport className="h-5 w-5" />}
        title={data?.titulo ?? "Reporte"}
        subtitle={data?.descripcion ?? "Generando…"}
        action={
          <a href={reportePdfUrl(id)} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost"><IconReport className="h-4 w-4" />Descargar PDF</Button>
          </a>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.filas ?? []}
        rowKey={(r) => Object.values(r).join("|")}
        loading={loading}
        searchPlaceholder="Buscar en el reporte…"
        emptyTitle="Sin datos para este reporte"
        pageSize={10}
      />
      <p className="mt-3 text-xs text-slate-400">Reporte generado con jsreport · cálculo en la base de datos.</p>
    </div>
  );
}
