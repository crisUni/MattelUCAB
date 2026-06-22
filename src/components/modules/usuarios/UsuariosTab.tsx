import { useState } from "react";
import type { Usuario, Rol } from "../../../data/types";
import {
  getUsuarios, getRoles, getEmpleadosOpc, getClientesOpc, guardar, eliminar, nuevoId, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import {
  Badge, Button, Field, TextInput, Select, SectionHeader,
} from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconUsers } from "../../ui/icons";

const formVacio: Usuario = {
  id: "", nombre: "", username: "", email: "", passwordHash: "",
  rolesIds: [], fechaRegistro: "", empleadoId: undefined, clienteId: undefined, password: "",
};

export function UsuariosTab() {
  const { puede } = useSession();
  const puedeCrear = puede("USUARIO", "CREAR");
  const puedeEditar = puede("USUARIO", "EDITAR");
  const puedeEliminar = puede("USUARIO", "ELIMINAR");
  const { data: usuarios, setData, loading } = useAsyncData<Usuario[]>(getUsuarios);
  const { data: roles } = useAsyncData<Rol[]>(getRoles);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [confirm, setConfirm] = useState<Usuario | null>(null);

  const rolNombre = (id: string) => roles?.find((r) => r.id === id)?.nombre ?? id;

  async function handleSave(u: Usuario) {
    const isNew = !u.id;
    const saved = await guardar("usuario", { ...u, id: u.id || nuevoId("user") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }

  async function handleDelete(u: Usuario) {
    await eliminar("usuario", u.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== u.id));
    setConfirm(null);
  }

  const columns: Column<Usuario>[] = [
    {
      key: "nombre", header: "Usuario",
      sortValue: (u) => u.nombre, searchValue: (u) => `${u.nombre} ${u.username} ${u.email}`,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-grape-500 text-xs font-bold text-white">
            {u.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-navy-700">{u.nombre}</p>
            <p className="text-xs text-slate-400">{u.empleadoId ? "Interno · empleado" : u.clienteId ? "Externo · cliente" : "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Email", sortValue: (u) => u.email, searchValue: (u) => u.email, cell: (u) => <span className="text-slate-500">{u.email}</span> },
    {
      key: "roles", header: "Rol(es)",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.rolesIds.map((r) => <Badge key={r} tone="brand">{rolNombre(r)}</Badge>)}
        </div>
      ),
    },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (u: Usuario) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <IconBtn title="Editar" onClick={() => setEditing(u)}><IconEdit className="h-4 w-4" /></IconBtn>}
          {puedeEliminar && <IconBtn title="Eliminar" onClick={() => setConfirm(u)} tone="red"><IconTrash className="h-4 w-4" /></IconBtn>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconUsers className="h-5 w-5" />}
        title="Usuarios"
        subtitle="Gestión de cuentas y roles asignados. Cada usuario es interno (empleado) o externo (cliente)."
        action={puedeCrear ? <Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo usuario</Button> : undefined}
      />
      <DataTable
        columns={columns} rows={usuarios ?? []} rowKey={(u) => u.id} loading={loading}
        searchPlaceholder="Buscar por nombre, usuario o email…"
        onRowClick={puedeEditar ? (u) => setEditing(u) : undefined} emptyTitle="No hay usuarios"
      />

      {editing && (
        <UsuarioForm
          usuario={editing} roles={roles ?? []}
          onCancel={() => setEditing(null)} onSave={handleSave}
        />
      )}
      <ConfirmDialog
        open={!!confirm} title="Eliminar usuario"
        message={`¿Eliminar a ${confirm?.nombre}? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)}
      />
    </div>
  );
}

function IconBtn({ children, onClick, title, tone = "slate" }: { children: React.ReactNode; onClick: () => void; title: string; tone?: "slate" | "red" | "amber" }) {
  const tones = { slate: "text-slate-400 hover:bg-slate-100 hover:text-navy-700", red: "text-slate-400 hover:bg-rose-50 hover:text-rose-500", amber: "text-amber-500 hover:bg-amber-50" };
  return <button title={title} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-lg transition ${tones[tone]}`}>{children}</button>;
}

function UsuarioForm({ usuario, roles, onCancel, onSave }: { usuario: Usuario; roles: Rol[]; onCancel: () => void; onSave: (u: Usuario) => void }) {
  const [form, setForm] = useState<Usuario>(usuario);
  const [tipo, setTipo] = useState<"EMPLEADO" | "CLIENTE">(usuario.clienteId ? "CLIENTE" : "EMPLEADO");
  const [error, setError] = useState<string | null>(null);
  const { data: empleados } = useAsyncData<Opcion[]>(getEmpleadosOpc);
  const { data: clientes } = useAsyncData<Opcion[]>(getClientesOpc);
  const esNuevo = !usuario.id;
  const set = (patch: Partial<Usuario>) => setForm((f) => ({ ...f, ...patch }));

  // El tipo (interno/externo) lo determina el ámbito del rol elegido.
  function elegirRol(rid: string) {
    const rol = roles.find((r) => r.id === rid);
    const t: "EMPLEADO" | "CLIENTE" = rol?.ambito === "EXTERNO" ? "CLIENTE" : "EMPLEADO";
    setTipo(t);
    setForm((f) => ({ ...f, rolesIds: rid ? [rid] : [], ...(t === "EMPLEADO" ? { clienteId: undefined } : { empleadoId: undefined }) }));
  }

  async function submit() {
    setError(null);
    try { await onSave(form); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal
      open onClose={onCancel}
      title={esNuevo ? "Nuevo usuario" : "Editar usuario"}
      subtitle="Un usuario es interno (empleado) o externo (cliente), con un rol del sistema."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit}>Guardar</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Nombre y apellido" /></Field>
        <Field label="Username"><TextInput value={form.username} onChange={(e) => set({ username: e.target.value })} placeholder="usuario.demo" /></Field>
        <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="correo@mattelucab.com" /></Field>
        <Field label="Contraseña" hint={esNuevo ? "Requerida" : "Dejar en blanco para no cambiarla"}>
          <TextInput type="password" value={form.password ?? ""} onChange={(e) => set({ password: e.target.value })} placeholder="••••••••" />
        </Field>
        <Field label="Rol" hint="Su ámbito define si el usuario es empleado o cliente">
          <Select value={form.rolesIds[0] ?? ""} onChange={(e) => elegirRol(e.target.value)}>
            <option value="">— Selecciona —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre} · {r.ambito === "EXTERNO" ? "externo" : "interno"}</option>)}
          </Select>
        </Field>
      </div>

      {esNuevo ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de usuario" hint="Derivado del ámbito del rol">
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-navy-700">
              {tipo === "EMPLEADO" ? "Interno · empleado" : "Externo · cliente"}
            </div>
          </Field>
          {tipo === "EMPLEADO" ? (
            <Field label="Empleado vinculado">
              <Select value={form.empleadoId ?? ""} onChange={(e) => set({ empleadoId: e.target.value || undefined })}>
                <option value="">— Selecciona —</option>
                {(empleados ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </Select>
            </Field>
          ) : (
            <Field label="Cliente vinculado">
              <Select value={form.clienteId ?? ""} onChange={(e) => set({ clienteId: e.target.value || undefined })}>
                <option value="">— Selecciona —</option>
                {(clientes ?? []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </Select>
            </Field>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          El vínculo de identidad (empleado/cliente) es inmutable y no puede cambiarse tras crear el usuario.
        </p>
      )}

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
