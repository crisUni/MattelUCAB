import { useState } from "react";
import {
  getClientes, crearCliente, eliminarCliente, getLugaresOpc,
  type ClienteRow, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, Select, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconTrash, IconUsers } from "../../ui/icons";

const HOY = new Date().toISOString().slice(0, 10);

export function ClientesTab() {
  const { puede } = useSession();
  const puedeCrear = puede("CLIENTE", "CREAR");
  const puedeEliminar = puede("CLIENTE", "ELIMINAR");
  const { data: clientes, setData, loading } = useAsyncData<ClienteRow[]>(getClientes);
  const [creando, setCreando] = useState(false);
  const [confirm, setConfirm] = useState<ClienteRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = async () => setData(await getClientes());

  async function borrar(c: ClienteRow) {
    setError(null);
    try { await eliminarCliente(c.id); setConfirm(null); await recargar(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); setConfirm(null); }
  }

  const columns: Column<ClienteRow>[] = [
    { key: "nombre", header: "Cliente", sortValue: (c) => c.nombre, searchValue: (c) => `${c.nombre} ${c.documento}`, cell: (c) => <p className="font-semibold text-navy-700">{c.nombre}</p> },
    { key: "tipo", header: "Tipo", sortValue: (c) => c.tipo, cell: (c) => <Badge tone={c.tipo === "JURIDICA" ? "amber" : "brand"}>{c.tipo === "JURIDICA" ? "Jurídica" : "Natural"}</Badge> },
    { key: "documento", header: "Documento", cell: (c) => <span className="font-mono text-xs text-slate-500">{c.documento}</span> },
    { key: "lugar", header: "Lugar", cell: (c) => <span className="text-slate-500">{c.lugar}</span> },
    { key: "registro", header: "Registro", cell: (c) => <span className="text-xs text-slate-400">{c.registro}</span> },
    ...(puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (c: ClienteRow) => (
        <div className="flex justify-end" onClick={(ev) => ev.stopPropagation()}>
          <button title="Eliminar" onClick={() => setConfirm(c)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconUsers className="h-5 w-5" />}
        title="Clientes"
        subtitle="Compradores de Mattel: personas naturales (cédula) o jurídicas (RIF / razón social)."
        action={puedeCrear ? <Button onClick={() => setCreando(true)}><IconPlus className="h-4 w-4" />Nuevo cliente</Button> : undefined}
      />
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <DataTable
        columns={columns} rows={clientes ?? []} rowKey={(c) => c.id} loading={loading}
        searchPlaceholder="Buscar por nombre o documento…" emptyTitle="No hay clientes"
      />

      {creando && <ClienteForm onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
      <ConfirmDialog open={!!confirm} title="Eliminar cliente" message={`¿Eliminar a ${confirm?.nombre}?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && borrar(confirm)} />
    </div>
  );
}

function ClienteForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const { data: lugares } = useAsyncData<Opcion[]>(getLugaresOpc);
  const [tipo, setTipo] = useState<"NATURAL" | "JURIDICA">("NATURAL");
  const [lug, setLug] = useState("");
  // natural
  const [cedula, setCedula] = useState("");
  const [pnombre, setPnombre] = useState("");
  const [snombre, setSnombre] = useState("");
  const [papellido, setPapellido] = useState("");
  const [sapellido, setSapellido] = useState("");
  const [fechanac, setFechanac] = useState("2000-01-01");
  const [direccion, setDireccion] = useState("");
  // juridica
  const [rif, setRif] = useState("");
  const [razon, setRazon] = useState("");
  const [repre, setRepre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function submit() {
    setError(null);
    if (!lug) { setError("Selecciona el estado de registro."); return; }
    if (tipo === "NATURAL") {
      if (!cedula.trim() || !pnombre.trim() || !papellido.trim() || !direccion.trim()) { setError("Cédula, nombre, apellido y dirección son obligatorios."); return; }
    } else {
      if (!rif.trim() || !razon.trim() || !repre.trim()) { setError("RIF, razón social y representante son obligatorios."); return; }
    }
    setGuardando(true);
    try {
      await crearCliente({
        tipo, lug,
        cedula, pnombre, snombre, papellido, sapellido, fechanac, direccion,
        rif, razon, repre,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="lg"
      title="Nuevo cliente"
      subtitle="Registra una persona natural o una empresa (persona jurídica)."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Creando…" : "Crear"}</Button></>}
    >
      <div className="mb-4 flex gap-2">
        {(["NATURAL", "JURIDICA"] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tipo === t ? "bg-navy-700 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-700"}`}>
            {t === "NATURAL" ? "Persona natural" : "Persona jurídica"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estado de registro">
          <Select value={lug} onChange={(e) => setLug(e.target.value)}>
            <option value="">— Selecciona —</option>
            {(lugares ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
        <div />
      </div>

      {tipo === "NATURAL" ? (
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field label="Cédula"><TextInput value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-12345678" /></Field>
          <Field label="Fecha de nacimiento"><TextInput type="date" max={HOY} value={fechanac} onChange={(e) => setFechanac(e.target.value)} /></Field>
          <Field label="Primer nombre"><TextInput value={pnombre} onChange={(e) => setPnombre(e.target.value)} /></Field>
          <Field label="Segundo nombre" hint="Opcional"><TextInput value={snombre} onChange={(e) => setSnombre(e.target.value)} /></Field>
          <Field label="Primer apellido"><TextInput value={papellido} onChange={(e) => setPapellido(e.target.value)} /></Field>
          <Field label="Segundo apellido"><TextInput value={sapellido} onChange={(e) => setSapellido(e.target.value)} /></Field>
          <Field label="Dirección"><TextInput value={direccion} onChange={(e) => setDireccion(e.target.value)} /></Field>
        </div>
      ) : (
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field label="RIF"><TextInput value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-12345678-9" /></Field>
          <Field label="Razón social"><TextInput value={razon} onChange={(e) => setRazon(e.target.value)} /></Field>
          <Field label="Representante legal"><TextInput value={repre} onChange={(e) => setRepre(e.target.value)} /></Field>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
