import { useState } from "react";
import {
  getPatentes, crearPatente, actualizarPatente, getDisenadoresOpc, type Patente, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Card, SectionHeader, Skeleton, Button, Field, TextInput, Select } from "../../ui/primitives";
import { Modal } from "../../ui/Modal";
import { IconReport, IconPlus, IconEdit } from "../../ui/icons";

export function PatentesTab() {
  const { puede } = useSession();
  const puedeCrear = puede("PATENTE", "CREAR");
  const puedeEditar = puede("PATENTE", "EDITAR");
  const { data: patentes, setData, loading } = useAsyncData<Patente[]>(getPatentes);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Patente | null>(null);

  const recargar = async () => setData(await getPatentes());

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconReport className="h-5 w-5" />}
        title="Patentes de diseño"
        subtitle="Registro de patentes (DISEÑO): el código de patente del ADN y el empleado de I+D que lo diseñó."
        action={puedeCrear ? <Button onClick={() => setCreando(true)}><IconPlus className="h-4 w-4" />Nueva patente</Button> : undefined}
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (patentes ?? []).length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">No hay patentes registradas.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(patentes ?? []).map((p, i) => (
            <Card key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in flex items-start justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-bold text-navy-700">{p.codigo}</p>
                <p className="mt-1 text-xs text-slate-400">Diseñador: {p.disenador}</p>
              </div>
              {puedeEditar && (
                <button title="Editar" onClick={() => setEditando(p)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700">
                  <IconEdit className="h-4 w-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {creando && <PatenteForm onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
      {editando && <PatenteForm patente={editando} onCancel={() => setEditando(null)} onSaved={async () => { setEditando(null); await recargar(); }} />}
    </div>
  );
}

function PatenteForm({ patente, onCancel, onSaved }: { patente?: Patente; onCancel: () => void; onSaved: () => void }) {
  const { data: disenadores } = useAsyncData<Opcion[]>(getDisenadoresOpc);
  const [codigo, setCodigo] = useState(patente?.codigo ?? "");
  const [empId, setEmpId] = useState(patente?.disenadorId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const esEdicion = !!patente;

  async function submit() {
    setError(null);
    if (!codigo.trim()) { setError("Indica el código de patente."); return; }
    if (!empId) { setError("Selecciona el diseñador responsable."); return; }
    setGuardando(true);
    try {
      if (esEdicion) await actualizarPatente(patente!.id, codigo.trim(), empId);
      else await crearPatente(codigo.trim(), empId);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="md"
      title={esEdicion ? "Editar patente" : "Nueva patente"}
      subtitle="Código de patente y empleado del departamento de Diseño (I+D) que diseñó el ADN."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear"}</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código de patente"><TextInput value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="US-D-123456" /></Field>
        <Field label="Diseñador" hint="Personal del departamento de Diseño">
          <Select value={empId} onChange={(e) => setEmpId(e.target.value)}>
            <option value="">— Selecciona —</option>
            {(disenadores ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
