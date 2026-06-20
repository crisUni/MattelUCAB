import { useState } from "react";
import type { Usuario, Rol } from "../../../data/types";
import { getUsuarios, getRoles, guardar, eliminar, nuevoId } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import {
  Badge, Button, Field, TextInput, Toggle, SectionHeader, fmtFecha,
} from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconUsers, IconLock } from "../../ui/icons";

const formVacio: Usuario = {
  id: "", nombre: "", username: "", email: "", passwordHash: "$2b$10$••••••••••••••••",
  rolesIds: [], fechaRegistro: new Date().toISOString(),
};

export function UsuariosTab() {
  const { data: usuarios, setData, loading } = useAsyncData<Usuario[]>(getUsuarios);
  const { data: roles } = useAsyncData<Rol[]>(getRoles);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [confirm, setConfirm] = useState<Usuario | null>(null);

  const rolNombre = (id: string) => roles?.find((r) => r.id === id)?.nombre ?? id;

  async function handleSave(u: Usuario) {
    const isNew = !u.id;
    const saved = await guardar({ ...u, id: u.id || nuevoId("user") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }

  async function handleDelete(u: Usuario) {
    await eliminar(u.id);
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
            <p className="text-xs text-slate-400">@{u.username}</p>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Email", sortValue: (u) => u.email, searchValue: (u) => u.email, cell: (u) => <span className="text-slate-500">{u.email}</span> },
    {
      key: "pass", header: "Contraseña",
      cell: () => <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400"><IconLock className="h-3.5 w-3.5" />••••••••</span>,
    },
    {
      key: "roles", header: "Rol(es)",
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.rolesIds.map((r) => <Badge key={r} tone="brand">{rolNombre(r)}</Badge>)}
        </div>
      ),
    },
    { key: "fecha", header: "Registro", align: "right", sortValue: (u) => u.fechaRegistro, cell: (u) => <span className="text-xs text-slate-400">{fmtFecha(u.fechaRegistro)}</span> },
    {
      key: "acc", header: "", align: "right",
      cell: (u) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconBtn title="Editar" onClick={() => setEditing(u)}><IconEdit className="h-4 w-4" /></IconBtn>
          <IconBtn title="Eliminar" onClick={() => setConfirm(u)} tone="red"><IconTrash className="h-4 w-4" /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconUsers className="h-5 w-5" />}
        title="Usuarios"
        subtitle="Gestión de cuentas, estados y roles asignados. El bloqueo temporal permite sancionar a scalpers y morosos."
        action={<Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo usuario</Button>}
      />
      <DataTable
        columns={columns} rows={usuarios ?? []} rowKey={(u) => u.id} loading={loading}
        searchPlaceholder="Buscar por nombre, usuario o email…"
        onRowClick={(u) => setEditing(u)} emptyTitle="No hay usuarios"
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
  const set = (patch: Partial<Usuario>) => setForm((f) => ({ ...f, ...patch }));
  const toggleRol = (id: string) =>
    set({ rolesIds: form.rolesIds.includes(id) ? form.rolesIds.filter((r) => r !== id) : [...form.rolesIds, id] });

  return (
    <Modal
      open onClose={onCancel}
      title={usuario.id ? "Editar usuario" : "Nuevo usuario"}
      subtitle="Los datos sensibles (hash de contraseña) se muestran enmascarados."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={() => onSave(form)}>Guardar</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Nombre y apellido" /></Field>
        <Field label="Username"><TextInput value={form.username} onChange={(e) => set({ username: e.target.value })} placeholder="usuario.demo" /></Field>
        <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="correo@mattelucab.com" /></Field>
        <Field label="Hash de contraseña" hint="Sólo lectura · gestionado por el backend">
          <TextInput value="$2b$10$••••••••••••••••••••••" disabled className="font-mono opacity-70" />
        </Field>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Roles asignados</p>
        <RolGroup title="Roles disponibles" roles={roles} selected={form.rolesIds} onToggle={toggleRol} />
      </div>
    </Modal>
  );
}

function RolGroup({ title, roles, selected, onToggle }: { title: string; roles: Rol[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="space-y-2">
        {roles.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2">
            <span className="text-sm text-navy-700">{r.nombre}</span>
            <Toggle checked={selected.includes(r.id)} onChange={() => onToggle(r.id)} label={r.nombre} />
          </div>
        ))}
      </div>
    </div>
  );
}
