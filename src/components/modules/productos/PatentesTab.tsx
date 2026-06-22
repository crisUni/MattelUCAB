import { useState } from "react";
import {
  getPatentes, crearPatente, getEmpleadosOpc, type Patente, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Card, SectionHeader, Skeleton, Button, Field, TextInput, Select } from "../../ui/primitives";
import { Modal } from "../../ui/Modal";
import { IconReport, IconPlus } from "../../ui/icons";

export function PatentesTab() {
  const { puede } = useSession();
  const puedeCrear = puede("PATENTE", "CREAR");
  const { data: patentes, setData, loading } = useAsyncData<Patente[]>(getPatentes);
  const [creando, setCreando] = useState(false);

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
            <Card key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in p-4">
              <p className="font-mono text-sm font-bold text-navy-700">{p.codigo}</p>
              <p className="mt-1 text-xs text-slate-400">Diseñador: {p.disenador}</p>
            </Card>
          ))}
        </div>
      )}

      {creando && <NuevaPatenteForm onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
    </div>
  );
}

function NuevaPatenteForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const { data: empleados } = useAsyncData<Opcion[]>(getEmpleadosOpc);
  const [codigo, setCodigo] = useState("");
  const [empId, setEmpId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function submit() {
    setError(null);
    if (!codigo.trim()) { setError("Indica el código de patente."); return; }
    setGuardando(true);
    try {
      await crearPatente(codigo.trim(), empId || undefined);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="md"
      title="Nueva patente"
      subtitle="Registra un código de patente y, opcionalmente, el empleado de I+D que diseñó el ADN."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Creando…" : "Crear"}</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código de patente"><TextInput value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="US-D-123456" /></Field>
        <Field label="Diseñador (opcional)">
          <Select value={empId} onChange={(e) => setEmpId(e.target.value)}>
            <option value="">— Sin asignar —</option>
            {(empleados ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
