import { Card, SectionHeader, Badge } from "../../ui/primitives";
import { IconReport, IconPlus } from "../../ui/icons";

/**
 * Placeholder para los reportes específicos asignados a tu equipo.
 * SUSTITUIR por los reportes reales que les asignaron en clase.
 */
export function GrupoReport() {
  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconReport className="h-5 w-5" />}
        title="Reportes del Grupo [N]"
        subtitle="Espacio reservado para los reportes específicos de tu equipo. Sustituir por los asignados en clase."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((n) => (
          <Card key={n} className="border-2 border-dashed border-brand-200 bg-brand-50/30 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-400 ring-1 ring-brand-200"><IconPlus className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-navy-700">Reporte del Grupo · #{n}</p>
                <Badge tone="brand">pendiente de asignación</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Reemplaza este bloque por el visor del reporte asignado. Reutiliza
              <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono text-xs text-brand-600">&lt;ReportFrame&gt;</code>
              y una función <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono text-xs text-brand-600">getXxx()</code> en
              <code className="mx-1 rounded bg-white px-1.5 py-0.5 font-mono text-xs text-brand-600">services/api.ts</code>.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
