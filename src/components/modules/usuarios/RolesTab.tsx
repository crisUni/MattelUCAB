import { useState } from "react";
import type { Rol, Permiso, Ambito } from "../../../data/types";
import { getRoles, getPermisos, guardar, eliminar, nuevoId } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, Select, Toggle, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconShield } from "../../ui/icons";

const formVacio: Rol = { id: "", nombre: "", descripcion: "", ambito: "BACK_OFFICE", permisosIds: [] };

export function RolesTab() {
  const { data: roles, setData, loading } = useAsyncData<Rol[]>(getRoles);
  const { data: permisos } = useAsyncData<Permiso[]>(getPermisos);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [confirm, setConfirm] = useState<Rol | null>(null);

  async function handleSave(r: Rol) {
    const isNew = !r.id;
    const saved = await guardar({ ...r, id: r.id || nuevoId("rol") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }
  async function handleDelete(r: Rol) {
    await eliminar(r.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== r.id));
    setConfirm(null);
  }

  const columns: Column<Rol>[] = [
    {
      key: "nombre", header: "Rol", sortValue: (r) => r.nombre, searchValue: (r) => `${r.nombre} ${r.descripcion}`,
      cell: (r) => (
        <div className="leading-tight">
          <p className="flex items-center gap-2 font-semibold text-navy-700">{r.nombre}{r.esSistema && <Badge tone="amber">sistema</Badge>}</p>
          <p className="max-w-md truncate text-xs text-slate-400">{r.descripcion}</p>
        </div>
      ),
    },
    { key: "ambito", header: "Ámbito", sortValue: (r) => r.ambito, cell: (r) => <Badge tone={r.ambito === "BACK_OFFICE" ? "navy" : "brand"}>{r.ambito === "BACK_OFFICE" ? "Back-Office" : "Front-Office"}</Badge> },
    { key: "permisos", header: "Permisos", align: "center", sortValue: (r) => r.permisosIds.length, cell: (r) => <span className="font-bold text-navy-700">{r.permisosIds.length}</span> },
    {
      key: "acc", header: "", align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button title="Editar" onClick={() => setEditing(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>
          <button title="Eliminar" disabled={r.esSistema} onClick={() => setConfirm(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:hover:bg-transparent"><IconTrash className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconShield className="h-5 w-5" />}
        title="Roles"
        subtitle="Define perfiles internos (Back-Office) y externos (Front-Office) y los permisos que concede cada uno."
        action={<Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo rol</Button>}
      />
      <DataTable columns={columns} rows={roles ?? []} rowKey={(r) => r.id} loading={loading} onRowClick={(r) => setEditing(r)} searchPlaceholder="Buscar rol…" emptyTitle="No hay roles" />

      {editing && <RolForm rol={editing} permisos={permisos ?? []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar rol" message={`¿Eliminar el rol "${confirm?.nombre}"?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

function RolForm({ rol, permisos, onCancel, onSave }: { rol: Rol; permisos: Permiso[]; onCancel: () => void; onSave: (r: Rol) => void }) {
  const [form, setForm] = useState<Rol>(rol);
  const set = (p: Partial<Rol>) => setForm((f) => ({ ...f, ...p }));
  const toggle = (id: string) => set({ permisosIds: form.permisosIds.includes(id) ? form.permisosIds.filter((x) => x !== id) : [...form.permisosIds, id] });

  const porModulo = permisos.reduce<Record<string, Permiso[]>>((acc, p) => {
    (acc[p.modulo] ??= []).push(p);
    return acc;
  }, {});

  return (
    <Modal open onClose={onCancel} size="lg"
      title={rol.id ? "Editar rol" : "Nuevo rol"}
      subtitle="Activa los permisos por módulo. Los permisos sensibles aparecen marcados."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={() => onSave(form)}>Guardar rol</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nombre del rol"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
        <Field label="Ámbito">
          <Select value={form.ambito} onChange={(e) => set({ ambito: e.target.value as Ambito })}>
            <option value="BACK_OFFICE">Back-Office (Interno)</option>
            <option value="FRONT_OFFICE">Front-Office (Externo)</option>
          </Select>
        </Field>
        <Field label="Descripción"><TextInput value={form.descripcion} onChange={(e) => set({ descripcion: e.target.value })} /></Field>
      </div>

      <div className="mt-5 space-y-3">
        {Object.entries(porModulo).map(([modulo, lista]) => (
          <div key={modulo} className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-600">{modulo}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {lista.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="leading-tight">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-navy-700">{p.nombre}{p.sensible && <Badge tone="red">sensible</Badge>}</p>
                    <p className="text-[11px] text-slate-400">{p.descripcion}</p>
                  </div>
                  <Toggle checked={form.permisosIds.includes(p.id)} onChange={() => toggle(p.id)} label={p.nombre} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
