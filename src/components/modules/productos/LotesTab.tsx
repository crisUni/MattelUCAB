import { useState } from "react";
import type { Lote, Producto, DefectoLote } from "../../../data/types";
import {
  getLotes, getProductos, getDefectosLote, getEmpleadosOpc,
  getDefectos, getDefectosLoteRaw, crearLote, actualizarLote,
  eliminarLote, getInspecciones, actualizarInspeccion, eliminarInspeccion,
  registrarInspeccion, crearDefecto, actualizarDefecto,
  eliminarDefecto, crearDefectoLote, actualizarDefectoLote,
  eliminarDefectoLote, type Opcion, type DefectoLoteRaw, type InspeccionRow,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { SectionHeader, Badge, Button, Field, TextInput, Select, fmtFecha } from "../../ui/primitives";
import { IconEdit, IconTrash, IconLayers, IconPlus, IconCheck, IconWarn, IconBox } from "../../ui/icons";

export function LotesTab() {
  const { puede } = useSession();
  const { data: lotes, setData, loading } = useAsyncData<Lote[]>(getLotes);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const { data: defectos } = useAsyncData<DefectoLote[]>(getDefectosLote);
  const [detalle, setDetalle] = useState<Lote | null>(null);
  const [formLote, setFormLote] = useState<Lote | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lote | null>(null);

  const puedeCrear = puede("LOTE", "CREAR");
  const puedeEditar = puede("LOTE", "EDITAR");
  const puedeEliminar = puede("LOTE", "ELIMINAR");
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
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (l: Lote) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setFormLote(l)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirmDelete(l)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconLayers className="h-5 w-5" />}
        title="Lotes de Producción & Calidad"
        subtitle="Cada lote de manufactura, su inspección de calidad (QA), los defectos detectados y las muñecas producidas en él."
        action={puedeCrear ? <Button onClick={() => setFormLote("new")}><IconPlus className="h-4 w-4" />Nuevo lote</Button> : undefined}
      />
      <DataTable columns={columns} rows={lotes ?? []} rowKey={(l) => l.id} loading={loading} onRowClick={(l) => setDetalle(l)} searchPlaceholder="Buscar lote o inspector…" emptyTitle="No hay lotes" pageSize={8} />

      {detalle && (
        <LoteDetalle
          lote={detalle}
          productos={(productos ?? []).filter((p) => p.loteId === detalle.id)}
          defectos={(defectos ?? []).filter((d) => d.loteId === detalle.id)}
          puedeQA={puedeQA}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          onClose={() => setDetalle(null)}
          onSaved={async () => { setDetalle(null); await recargar(); }}
          onEditLote={() => { const l = detalle; setDetalle(null); setFormLote(l); }}
        />
      )}
      {formLote && (
        <LoteForm
          lote={formLote === "new" ? null : formLote}
          onCancel={() => setFormLote(null)}
          onSaved={async () => { setFormLote(null); await recargar(); }}
        />
      )}
      <ConfirmDialog open={!!confirmDelete} title="Eliminar lote" message={`¿Eliminar el lote #${confirmDelete?.id}?`} onCancel={() => setConfirmDelete(null)} onConfirm={async () => { if (!confirmDelete) return; try { await eliminarLote(confirmDelete.id); setConfirmDelete(null); await recargar(); } catch {} }} />
    </div>
  );
}

function LoteForm({ lote, onCancel, onSaved }: { lote: Lote | null; onCancel: () => void; onSaved: () => void }) {
  const esNuevo = !lote;
  const [inicio, setInicio] = useState((lote?.fechaInicio ?? new Date().toISOString()).slice(0, 10));
  const [fin, setFin] = useState((lote?.fechaFin ?? "").slice(0, 10));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    setGuardando(true);
    try {
      if (esNuevo) { await crearLote(inicio, fin || null); }
      else { await actualizarLote(lote!.id, inicio, fin || null); }
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setGuardando(false); }
  }

  return (
    <Modal open onClose={onCancel} title={esNuevo ? "Nuevo lote de producción" : "Editar lote de producción"}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : esNuevo ? "Crear lote" : "Guardar"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha de inicio"><TextInput type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></Field>
        <Field label="Fecha de fin (opcional)"><TextInput type="date" value={fin} onChange={(e) => setFin(e.target.value)} /></Field>
      </div>
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}

function LoteDetalle({ lote, productos, defectos, puedeQA, puedeEditar, puedeEliminar, onClose, onSaved, onEditLote }: {
  lote: Lote; productos: Producto[]; defectos: DefectoLote[]; puedeQA: boolean;
  puedeEditar: boolean; puedeEliminar: boolean; onClose: () => void; onSaved: () => void; onEditLote: () => void;
}) {
  const { data: empleados } = useAsyncData<Opcion[]>(getEmpleadosOpc);
  const { data: defectTypes, setData: setDefectTypes } = useAsyncData<{ id: string; nombre: string }[]>(getDefectos);
  const { data: defectosRaw, setData: setDefectosRaw } = useAsyncData<DefectoLoteRaw[]>(getDefectosLoteRaw);
  const { data: inspecciones, setData: setInspecciones } = useAsyncData<InspeccionRow[]>(getInspecciones);
  const [resultado, setResultado] = useState("APROBADO");
  const [inspectorId, setInspectorId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [qaOpen, setQaOpen] = useState(false);

  const mia = (inspecciones ?? []).find((i) => String(i.fk_lotpro_id) === lote.id);
  const [defectoForm, setDefectoForm] = useState<{ defId: string; cantidad: string } | null>(null);
  const [editingDefectoId, setEditingDefectoId] = useState<string | null>(null);
  const [newDefectType, setNewDefectType] = useState("");
  const [editingDefectType, setEditingDefectType] = useState<string | null>(null);
  const [renameDefectType, setRenameDefectType] = useState("");

  const lotesDefectosRaw = (defectosRaw ?? []).filter((d) => String(d.fk_lotpro_id) === lote.id);

  async function recargar() {
    setDefectTypes(await getDefectos());
    setDefectosRaw(await getDefectosLoteRaw());
    setInspecciones(await getInspecciones());
  }

  async function guardarQA() {
    setError(null);
    if (!inspectorId) { setError("Selecciona un inspector."); return; }
    try { await registrarInspeccion(lote.id, resultado, inspectorId, fecha); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function editarQA() {
    if (!mia) return;
    setError(null);
    if (!inspectorId) { setError("Selecciona un inspector."); return; }
    try { await actualizarInspeccion(String(mia.inscal_id), fecha, resultado, lote.id); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function eliminarQA() {
    if (!mia) return;
    try { await eliminarInspeccion(String(mia.inscal_id)); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function guardarDefectoLote() {
    if (!defectoForm) return;
    setError(null);
    const cant = Number(defectoForm.cantidad);
    if (!cant || cant < 1) { setError("Cantidad debe ser mayor a 0."); return; }
    try {
      await crearDefectoLote(cant, defectoForm.defId, lote.id);
      setDefectoForm(null);
      await recargar();
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function actualizarDefectoLoteCant(defId: string, cantidad: string) {
    setError(null);
    const cant = Number(cantidad);
    if (!cant || cant < 1) { setError("Cantidad debe ser mayor a 0."); return; }
    try {
      await actualizarDefectoLote(defId, lote.id, cant);
      setEditingDefectoId(null);
      await recargar();
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function eliminarDefectoLoteHandler(defId: string) {
    try {
      await eliminarDefectoLote(defId, lote.id);
      await recargar();
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function crearTipoDefecto() {
    if (!newDefectType.trim()) return;
    setError(null);
    try {
      await crearDefecto(newDefectType.trim());
      setNewDefectType("");
      await recargar();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function renombrarTipoDefecto(id: string) {
    if (!renameDefectType.trim()) return;
    setError(null);
    try {
      await actualizarDefecto(id, renameDefectType.trim());
      setEditingDefectType(null);
      setRenameDefectType("");
      await recargar();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  async function eliminarTipoDefecto(id: string) {
    try {
      await eliminarDefecto(id);
      await recargar();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal open onClose={onClose} size="lg" title={`Lote #${lote.id}`} subtitle="Trazabilidad de producción y calidad"
      footer={<>
        {puedeEditar && <Button variant="ghost" onClick={() => { onEditLote(); }}>Editar fechas</Button>}
        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      </>}>
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

      <p className="mb-2 mt-5 flex items-center gap-1.5 text-sm font-bold text-navy-700"><IconWarn className="h-4 w-4 text-amber-500" />Defectos detectados en este lote</p>
      {lotesDefectosRaw.length === 0 ? <p className="text-sm text-slate-400">Sin defectos registrados.</p> : (
        <div className="space-y-1.5">
          {lotesDefectosRaw.map((d) => {
            const dt = (defectTypes ?? []).find((t) => t.id === String(d.fk_def_id));
            const editing = editingDefectoId === String(d.fk_def_id);
            return (
              <div key={d.fk_def_id} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm">
                <span className="text-navy-700">{dt?.nombre ?? `Defecto #${d.fk_def_id}`}</span>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <TextInput type="number" min="1" className="w-20" defaultValue={d.deflot_cantidadafectada}
                      onKeyDown={(e) => { if (e.key === "Enter") actualizarDefectoLoteCant(String(d.fk_def_id), (e.target as HTMLInputElement).value); }}
                      onBlur={(e) => actualizarDefectoLoteCant(String(d.fk_def_id), e.target.value)} />
                    <button onClick={() => setEditingDefectoId(null)} className="text-xs text-slate-400 hover:text-navy-700">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-rose-600">{d.deflot_cantidadafectada} u.</span>
                    <button title="Editar cantidad" onClick={() => setEditingDefectoId(String(d.fk_def_id))}
                      className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"><IconEdit className="h-3.5 w-3.5" /></button>
                    <button title="Quitar defecto" onClick={() => eliminarDefectoLoteHandler(String(d.fk_def_id))}
                      className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"><IconTrash className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {defectoForm ? (
        <div className="mt-3 flex items-end gap-2 rounded-xl border border-slate-200 p-3">
          <Field label="Tipo de defecto" className="flex-1">
            <Select value={defectoForm.defId} onChange={(e) => setDefectoForm({ ...defectoForm, defId: e.target.value })}>
              <option value="">— Selecciona —</option>
              {(defectTypes ?? []).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad" className="w-24">
            <TextInput type="number" min="1" value={defectoForm.cantidad} onChange={(e) => setDefectoForm({ ...defectoForm, cantidad: e.target.value })} />
          </Field>
          <Button onClick={guardarDefectoLote} disabled={!defectoForm.defId || !defectoForm.cantidad}>Agregar</Button>
          <Button variant="ghost" onClick={() => setDefectoForm(null)}>Cancelar</Button>
        </div>
      ) : (
        <Button variant="ghost" className="mt-2" onClick={() => setDefectoForm({ defId: "", cantidad: "1" })}><IconPlus className="h-4 w-4" />Agregar defecto</Button>
      )}

      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <p className="mb-3 text-sm font-bold text-navy-700">Tipos de defecto (catálogo global)</p>
        <div className="mb-3 space-y-1.5">
          {(defectTypes ?? []).map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              {editingDefectType === t.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <TextInput value={renameDefectType} onChange={(e) => setRenameDefectType(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") renombrarTipoDefecto(t.id); }} className="flex-1" />
                  <button onClick={() => renombrarTipoDefecto(t.id)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Guardar</button>
                  <button onClick={() => { setEditingDefectType(null); setRenameDefectType(""); }} className="text-xs text-slate-400 hover:text-navy-700">Cancelar</button>
                </div>
              ) : (
                <>
                  <span className="text-navy-700">{t.nombre}</span>
                  <div className="flex items-center gap-1">
                    <button title="Renombrar" onClick={() => { setEditingDefectType(t.id); setRenameDefectType(t.nombre); }}
                      className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-navy-700"><IconEdit className="h-3.5 w-3.5" /></button>
                    <button title="Eliminar tipo" onClick={() => eliminarTipoDefecto(t.id)}
                      className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-rose-100 hover:text-rose-500"><IconTrash className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <TextInput value={newDefectType} onChange={(e) => setNewDefectType(e.target.value)} placeholder="Nuevo tipo de defecto…"
            onKeyDown={(e) => { if (e.key === "Enter") crearTipoDefecto(); }} className="flex-1" />
          <Button onClick={crearTipoDefecto} disabled={!newDefectType.trim()}>Crear</Button>
        </div>
      </div>

      {puedeQA && (
        <div className="mt-5 rounded-2xl border border-slate-200 p-4">
          {!qaOpen ? (
            <div className="flex items-center gap-2">
              {mia ? (
                <>
                  <Button variant="ghost" onClick={() => { setResultado(mia.inscal_resultado); setFecha(mia.inscal_fecha.slice(0, 10)); setInspectorId(String(mia.fk_emp_id)); setQaOpen(true); }}><IconEdit className="h-4 w-4" />Editar inspección</Button>
                  <Button variant="ghost" onClick={eliminarQA}><IconTrash className="h-4 w-4" />Eliminar inspección</Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setQaOpen(true)}><IconCheck className="h-4 w-4" />Registrar inspección de calidad</Button>
              )}
            </div>
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
              <div className="sm:col-span-3 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setQaOpen(false)}>Cancelar</Button>
                <Button onClick={mia ? editarQA : guardarQA}>{mia ? "Guardar cambios" : "Guardar inspección"}</Button>
              </div>
            </div>
          )}
          {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </div>
      )}
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
