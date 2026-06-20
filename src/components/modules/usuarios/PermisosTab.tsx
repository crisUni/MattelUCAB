import { useState } from "react";
import type { Permiso } from "../../../data/types";
import { getPermisos, guardar, eliminar, nuevoId } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconKey } from "../../ui/icons";

const formVacio: Permiso = { id: "", nombre: "", modulo: "", descripcion: "" };

export function PermisosTab() {
  const { data: permisos, setData, loading } = useAsyncData<Permiso[]>(getPermisos);
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [confirm, setConfirm] = useState<Permiso | null>(null);

  async function handleSave(p: Permiso) {
    const isNew = !p.id;
    const saved = await guardar({ ...p, id: p.id || nuevoId("perm") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }
  async function handleDelete(p: Permiso) {
    await eliminar(p.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== p.id));
    setConfirm(null);
  }

  const columns: Column<Permiso>[] = [
    { key: "nombre", header: "Permiso", sortValue: (p) => p.nombre, searchValue: (p) => `${p.nombre} ${p.modulo} ${p.descripcion}`, cell: (p) => <span className="font-semibold text-navy-700">{p.nombre}</span> },
    { key: "modulo", header: "Módulo de acceso", sortValue: (p) => p.modulo, cell: (p) => <Badge tone="navy">{p.modulo}</Badge> },
    { key: "desc", header: "Descripción", cell: (p) => <span className="text-sm text-slate-500">{p.descripcion}</span> },
    {
      key: "acc", header: "", align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button title="Editar" onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>
          <button title="Eliminar" onClick={() => setConfirm(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconKey className="h-5 w-5" />}
        title="Permisos"
        subtitle="Cada permiso define un módulo de acceso (Inventario, Productos, Ventas, Costos, Subastas, Reportes, Usuarios…)."
        action={<Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo permiso</Button>}
      />
      <DataTable columns={columns} rows={permisos ?? []} rowKey={(p) => p.id} loading={loading} onRowClick={(p) => setEditing(p)} searchPlaceholder="Buscar permiso o módulo…" emptyTitle="No hay permisos" />

      {editing && <PermisoForm permiso={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar permiso" message={`¿Eliminar el permiso "${confirm?.nombre}"?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

function PermisoForm({ permiso, onCancel, onSave }: { permiso: Permiso; onCancel: () => void; onSave: (p: Permiso) => void }) {
  const [form, setForm] = useState<Permiso>(permiso);
  const set = (p: Partial<Permiso>) => setForm((f) => ({ ...f, ...p }));
  return (
    <Modal open onClose={onCancel}
      title={permiso.id ? "Editar permiso" : "Nuevo permiso"}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={() => onSave(form)}>Guardar</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
        <Field label="Módulo de acceso"><TextInput value={form.modulo} onChange={(e) => set({ modulo: e.target.value })} placeholder="Inventario, Ventas…" /></Field>
        <div className="sm:col-span-2"><Field label="Descripción"><TextInput value={form.descripcion} onChange={(e) => set({ descripcion: e.target.value })} /></Field></div>
      </div>
    </Modal>
  );
}
