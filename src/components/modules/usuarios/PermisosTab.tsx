import { useState } from "react";
import type { Permiso, AccionPermiso } from "../../../data/types";
import { getPermisos, guardar, eliminar, nuevoId } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, Select, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconKey } from "../../ui/icons";

const ACCIONES: AccionPermiso[] = ["VER", "CREAR", "EDITAR", "ELIMINAR"];
const accTone: Record<AccionPermiso, "green" | "brand" | "amber" | "red"> = {
  VER: "green", CREAR: "brand", EDITAR: "amber", ELIMINAR: "red",
};

const formVacio: Permiso = { id: "", recurso: "", accion: "VER" };

export function PermisosTab() {
  const { puede } = useSession();
  const { data: permisos, setData, loading } = useAsyncData<Permiso[]>(getPermisos);
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [confirm, setConfirm] = useState<Permiso | null>(null);

  const puedeCrear = puede("PERMISO", "CREAR");
  const puedeEditar = puede("PERMISO", "EDITAR");
  const puedeEliminar = puede("PERMISO", "ELIMINAR");

  async function handleSave(p: Permiso) {
    const isNew = !p.id;
    const saved = await guardar("permiso", { ...p, id: p.id || nuevoId("perm") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }
  async function handleDelete(p: Permiso) {
    await eliminar("permiso", p.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== p.id));
    setConfirm(null);
  }

  const columns: Column<Permiso>[] = [
    { key: "recurso", header: "Recurso", sortValue: (p) => p.recurso, searchValue: (p) => `${p.recurso} ${p.accion}`, cell: (p) => <span className="font-semibold text-navy-700">{p.recurso}</span> },
    { key: "accion", header: "Acción", sortValue: (p) => p.accion, cell: (p) => <Badge tone={accTone[p.accion]}>{p.accion}</Badge> },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (p: Permiso) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconKey className="h-5 w-5" />}
        title="Permisos"
        subtitle="Catálogo de privilegios granulares: una acción (Ver/Crear/Editar/Eliminar) sobre un recurso. Los roles se componen asignando estos permisos."
        action={puedeCrear ? <Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo permiso</Button> : undefined}
      />
      <DataTable columns={columns} rows={permisos ?? []} rowKey={(p) => p.id} loading={loading} onRowClick={puedeEditar ? (p) => setEditing(p) : undefined} searchPlaceholder="Buscar por recurso o acción…" emptyTitle="No hay permisos" pageSize={12} />

      {editing && <PermisoForm permiso={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar permiso" message={`¿Eliminar el permiso ${confirm?.recurso} · ${confirm?.accion}?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

function PermisoForm({ permiso, onCancel, onSave }: { permiso: Permiso; onCancel: () => void; onSave: (p: Permiso) => void }) {
  const [form, setForm] = useState<Permiso>(permiso);
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<Permiso>) => setForm((f) => ({ ...f, ...p }));

  async function submit() {
    setError(null);
    try { await onSave(form); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal open onClose={onCancel}
      title={permiso.id ? "Editar permiso" : "Nuevo permiso"}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit}>Guardar</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recurso" hint="Ej. PRODUCTO, USUARIO, COLOR"><TextInput value={form.recurso} onChange={(e) => set({ recurso: e.target.value.toUpperCase() })} /></Field>
        <Field label="Acción">
          <Select value={form.accion} onChange={(e) => set({ accion: e.target.value as AccionPermiso })}>
            {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
