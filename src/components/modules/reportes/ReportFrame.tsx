/** Marco tipo documento (estilo JasperReports) con exportación PDF simulada. */
import { useState, type ReactNode } from "react";
import { Button } from "../../ui/primitives";
import { IconDownload, IconCheck, IconReport } from "../../ui/icons";

export function ReportFrame({
  codigo, titulo, subtitulo, filtros, children, meta,
}: {
  codigo: string;
  titulo: string;
  subtitulo?: string;
  filtros?: ReactNode;
  children: ReactNode;
  meta?: ReactNode;
}) {
  const [estado, setEstado] = useState<"idle" | "gen" | "ok">("idle");

  function exportar() {
    setEstado("gen");
    // Simula la generación en backend (JasperReports). Reemplazar por la llamada real.
    setTimeout(() => {
      setEstado("ok");
      setTimeout(() => setEstado("idle"), 2200);
    }, 1200);
  }

  return (
    <div className="animate-fade-in">
      {/* Barra de control */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-grape-500 text-white shadow-brand"><IconReport className="h-5 w-5" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-500">{codigo}</p>
            <h2 className="text-xl font-bold text-navy-700">{titulo}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filtros}
          <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
          <Button onClick={exportar} disabled={estado === "gen"}>
            {estado === "gen" ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Generando…</>)
              : estado === "ok" ? (<><IconCheck className="h-4 w-4" />PDF listo</>)
              : (<><IconDownload className="h-4 w-4" />Exportar PDF</>)}
          </Button>
        </div>
      </div>

      {/* Hoja del documento */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b-2 border-brand-500 bg-gradient-to-r from-brand-50 to-white px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-grape-500 font-display text-base text-white">MU</span>
            <div className="leading-tight">
              <p className="font-bold text-navy-700">MattelUCAB · Dream Legacy</p>
              <p className="text-xs text-slate-400">{titulo}{subtitulo ? ` — ${subtitulo}` : ""}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Reporte {codigo}</p>
            <p>Emitido {new Date().toLocaleDateString("es-VE")}</p>
          </div>
        </div>
        <div className="px-8 py-6">{children}</div>
        {meta && <div className="border-t border-slate-100 bg-slate-50/60 px-8 py-3 text-xs text-slate-400">{meta}</div>}
      </div>
    </div>
  );
}
