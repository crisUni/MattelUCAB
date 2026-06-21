import { useState } from "react";
import type { Lote, Producto, DefectoLote } from "../../../data/types";
import {
  getLotes, getProductos, getDefectosLote, getEmpleadosOpc,
  crearLote, registrarInspeccion, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal } from "../../ui/Modal";
import { SectionHeader, Badge, Button, Field, TextInput, Select, fmtFecha } from "../../ui/primitives";
import { IconLayers, IconPlus, IconCheck, IconWarn, IconBox } from "../../ui/icons";

export function LotesTab() {
  const { puede } = useSession();
  const { data: lotes, setData, loading } = useAsyncData<Lote[]>(getLotes);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const { data: defectos } = useAsyncData<DefectoLote[]>(getDefectosLote);
  const [detalle, setDetalle] = useState<Lote | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const puedeCrear = puede("LOTE", "CREAR");
  const puedeQA = puede("CALIDAD", "CREAR");

  async function recargar() { setData(await getLotes()); }

  const columns: Column<Lote>[] = [
    { key: "id", header: "Lote", sortValue: (l) => +l.id, cell: (l) => <span className="font-mono text-xs font-semibold text-brand-600">#{l.id}</span> },
    { key: "fechas", header: "Producción", sortValue: (l) => l.fechaInicio, cell: (l) => <span className="text-sm text-slate-500">{fmtFecha(l.fechaInicio)}{l.fechaFin ? ` – ${fmtFecha(l.fechaFin)}` : ""}</span> },
    { key: "qa", header: "QA", sortValue: (l) => l.resultado ?? "", cell: (l) => l.resultado ? <Badge tone={l.resultado === "APROBADO" ? "green" : "red"}>{l.resultado}</Badge> : <Badge tone="slate">Sin inspección</Badge> },
    { key: "inspector", header: "Inspector", searchValue: (l) => l.inspector ?? "", cell: (l) => <span className="text-sm text-slate-500">{l.inspector ?? "—"}</span> },
    { key: "prod", header: "Producidos", align: "center", sortValue: (l) => l.numProductos, cell: (l) => <span className="font-semibold text-navy-700">{l.numProductos}</span> },
    { key: "def", header: "Defectos", align: "center", sortValue: (l) => l.unidadesAfectadas, cell: (l) => l.unidadesAfectadas > 0 ? <span className="font-semibold text-rose-600">{l.unidadesAfectadas} u. ({l.numDefectos})</span> : <span className="text-slate-400">—</span> },
    { key: "estado", header: "Estado", cell: (l) => l.unidadesAfectadas > 0 ? <Badge tone="amber"><IconWarn className="h-3 w-3" />Con defectos</Badge> : <Badge tone="green"><IconCheck className="h-3 w-3" />OK</Badge> },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconLayers className="h-5 w-5" />}
        title="Lotes de Producción & Calidad"
        subtitle="Cada lote de manufactura, su inspección de calidad (QA), los defectos detectados y las muñecas producidas en él."
        action={puedeCrear ? <Button onClick={() => setNuevo(true)}><IconPlus className="h-4 w-4" />Nuevo lote</Button> : undefined}
      />
      <DataTable columns={columns} rows={lotes ?? []} rowKey={(l) => l.id} loading={loading} onRowClick={(l) => setDetalle(l)} searchPlaceholder="Buscar lote o inspector…" emptyTitle="No hay lotes" pageSize={8} />

      {detalle && (
        <LoteDetalle
          lote={detalle}
          productos={(productos ?? []).filter((p) => p.loteId === detalle.id)}
          defectos={(defectos ?? []).filter((d) => d.loteId === detalle.id)}
          puedeQA={puedeQA && !detalle.resultado}
          onClose={() => setDetalle(null)}
          onQA={async () => { setDetalle(null); await recargar(); }}
        />
      )}
      {nuevo && <NuevoLote onCancel={() => setNuevo(false)} onSaved={async () => { setNuevo(false); await recargar(); }} />}
    </div>
  );
}

function LoteDetalle({ lote, productos, defectos, puedeQA, onClose, onQA }: {
  lote: Lote; productos: Producto[]; defectos: DefectoLote[]; puedeQA: boolean; onClose: () => void; onQA: () => void;
}) {
  const { data: empleados } = useAsyncData<Opcion[]>(getEmpleadosOpc);
  const [resultado, setResultado] = useState("APROBADO");
  const [inspectorId, setInspectorId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [qaOpen, setQaOpen] = useState(false);

  async function guardarQA() {
    setError(null);
    if (!inspectorId) { setError("Selecciona un inspector."); return; }
    try { await registrarInspeccion(lote.id, resultado, inspectorId, fecha); onQA(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal open onClose={onClose} size="lg" title={`Lote #${lote.id}`} subtitle="Trazabilidad de producción y calidad"
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="Producción" value={`${fmtFecha(lote.fechaInicio)}${lote.fechaFin ? ` – ${fmtFecha(lote.fechaFin)}` : ""}`} />
        <Info label="Inspección QA" value={lote.resultado ?? "Sin inspección"} tone={lote.resultado === "RECHAZADO" ? "red" : lote.resultado ? "green" : "slate"} />
        <Info label="Inspector" value={lote.inspector ?? "—"} />
      </div>

      <p className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-bold text-navy-700"><IconBox className="h-4 w-4 text-brand-500" />Muñecas producidas en este lote ({productos.length})</p>
      {productos.length === 0 ? <p className="text-sm text-slate-400">Ningún producto registrado en este lote.</p> : (
        <div className="space-y-1.5">
          {productos.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-navy-700"><span className="font-mono text-xs text-brand-600">{p.sku}</span>{p.nombre}</span>
              {p.adn && <span className="font-mono text-[11px] text-slate-400">{p.adn}</span>}
            </div>
          ))}
        </div>
      )}

      <p className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-bold text-navy-700"><IconWarn className="h-4 w-4 text-amber-500" />Defectos detectados</p>
      {defectos.length === 0 ? <p className="text-sm text-slate-400">Sin defectos registrados.</p> : (
        <div className="space-y-1.5">
          {defectos.map((d, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm">
              <span className="text-navy-700">{d.defecto}</span>
              <span className="font-semibold text-rose-600">{d.cantidad} u. afectadas</span>
            </div>
          ))}
        </div>
      )}

      {puedeQA && (
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          {!qaOpen ? (
            <Button variant="ghost" onClick={() => setQaOpen(true)}><IconCheck className="h-4 w-4" />Registrar inspección de calidad</Button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Resultado">
                <Select value={resultado} onChange={(e) => setResultado(e.target.value)}>
                  <option value="APROBADO">APROBADO</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                </Select>
              </Field>
              <Field label="Inspector">
                <Select value={inspectorId} onChange={(e) => setInspectorId(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {(empleados ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Fecha"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
              <div className="sm:col-span-3 flex justify-end"><Button onClick={guardarQA}>Guardar inspección</Button></div>
            </div>
          )}
          {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

function NuevoLote({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [inicio, setInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try { await crearLote(inicio, fin || null); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal open onClose={onCancel} title="Nuevo lote de producción"
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={guardar}>Crear lote</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha de inicio"><TextInput type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></Field>
        <Field label="Fecha de fin (opcional)"><TextInput type="date" value={fin} onChange={(e) => setFin(e.target.value)} /></Field>
      </div>
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}

function Info({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" | "slate" }) {
  const c = tone === "red" ? "text-rose-600" : tone === "green" ? "text-emerald-600" : "text-navy-700";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold ${c}`}>{value}</p>
    </div>
  );
}
