import { useState } from "react";
import {
  getEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado,
  getDepartamentosOpc, getCargosOpc, type Empleado, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, Select, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconUsers } from "../../ui/icons";

export function EmpleadosTab() {
  const { puede } = useSession();
  const puedeCrear = puede("EMPLEADO", "CREAR");
  const puedeEditar = puede("EMPLEADO", "EDITAR");
  const puedeEliminar = puede("EMPLEADO", "ELIMINAR");
  const { data: empleados, setData, loading } = useAsyncData<Empleado[]>(getEmpleados);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [confirm, setConfirm] = useState<Empleado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = async () => setData(await getEmpleados());

  async function borrar(e: Empleado) {
    setError(null);
    try { await eliminarEmpleado(e.id); setConfirm(null); await recargar(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); setConfirm(null); }
  }

  const columns: Column<Empleado>[] = [
    {
      key: "nombre", header: "Empleado",
      sortValue: (e) => e.nombre, searchValue: (e) => `${e.nombre} ${e.departamento} ${e.cargo}`,
      cell: (e) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-navy-400 to-brand-500 text-xs font-bold text-white">
            {e.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <p className="font-semibold text-navy-700">{e.nombre}</p>
        </div>
      ),
    },
    { key: "departamento", header: "Departamento", sortValue: (e) => e.departamento, cell: (e) => <Badge tone="brand">{e.departamento}</Badge> },
    { key: "cargo", header: "Cargo", sortValue: (e) => e.cargo, cell: (e) => <span className="text-slate-500">{e.cargo}</span> },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (e: Empleado) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setEditando(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(e)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconUsers className="h-5 w-5" />}
        title="Empleados"
        subtitle="Personal de Mattel: cada empleado pertenece a un departamento con un cargo. Los de Diseño firman patentes; los de Calidad, inspecciones."
        action={puedeCrear ? <Button onClick={() => setCreando(true)}><IconPlus className="h-4 w-4" />Nuevo empleado</Button> : undefined}
      />
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <DataTable
        columns={columns} rows={empleados ?? []} rowKey={(e) => e.id} loading={loading}
        onRowClick={puedeEditar ? (e) => setEditando(e) : undefined}
        searchPlaceholder="Buscar por nombre, departamento o cargo…" emptyTitle="No hay empleados"
      />

      {creando && <EmpleadoForm onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
      {editando && <EmpleadoForm empleado={editando} onCancel={() => setEditando(null)} onSaved={async () => { setEditando(null); await recargar(); }} />}
      <ConfirmDialog open={!!confirm} title="Eliminar empleado" message={`¿Eliminar a ${confirm?.nombre}?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && borrar(confirm)} />
    </div>
  );
}

function EmpleadoForm({ empleado, onCancel, onSaved }: { empleado?: Empleado; onCancel: () => void; onSaved: () => void }) {
  const { data: deps } = useAsyncData<Opcion[]>(getDepartamentosOpc);
  const { data: cargos } = useAsyncData<Opcion[]>(getCargosOpc);
  const [pnombre, setPnombre] = useState(empleado?.pnombre ?? "");
  const [snombre, setSnombre] = useState(empleado?.snombre ?? "");
  const [papellido, setPapellido] = useState(empleado?.papellido ?? "");
  const [sapellido, setSapellido] = useState(empleado?.sapellido ?? "");
  const [direccion, setDireccion] = useState(empleado?.direccion ?? "");
  const [dep, setDep] = useState(empleado?.depId ?? "");
  const [car, setCar] = useState(empleado?.cargoId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const esEdicion = !!empleado;

  async function submit() {
    setError(null);
    if (!pnombre.trim() || !papellido.trim() || !sapellido.trim()) { setError("Nombre y apellidos son obligatorios."); return; }
    if (!direccion.trim()) { setError("Indica la dirección."); return; }
    if (!dep || !car) { setError("Selecciona departamento y cargo."); return; }
    setGuardando(true);
    const datos = { pnombre: pnombre.trim(), snombre: snombre.trim(), papellido: papellido.trim(), sapellido: sapellido.trim(), direccion: direccion.trim(), dep, car };
    try {
      if (esEdicion) await actualizarEmpleado(empleado!.id, datos);
      else await crearEmpleado(datos);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="lg"
      title={esEdicion ? "Editar empleado" : "Nuevo empleado"}
      subtitle="Datos del personal y su adscripción (departamento + cargo)."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear"}</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primer nombre"><TextInput value={pnombre} onChange={(e) => setPnombre(e.target.value)} /></Field>
        <Field label="Segundo nombre" hint="Opcional"><TextInput value={snombre} onChange={(e) => setSnombre(e.target.value)} /></Field>
        <Field label="Primer apellido"><TextInput value={papellido} onChange={(e) => setPapellido(e.target.value)} /></Field>
        <Field label="Segundo apellido"><TextInput value={sapellido} onChange={(e) => setSapellido(e.target.value)} /></Field>
        <Field label="Dirección"><TextInput value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ciudad, calle…" /></Field>
        <div />
        <Field label="Departamento">
          <Select value={dep} onChange={(e) => setDep(e.target.value)}>
            <option value="">— Selecciona —</option>
            {(deps ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Cargo">
          <Select value={car} onChange={(e) => setCar(e.target.value)}>
            <option value="">— Selecciona —</option>
            {(cargos ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
