/**
 * CRUD genérico, dirigido por esquema, para catálogos maestros.
 * Evita reescribir un formulario por cada entidad simple.
 */
import { useState, type Dispatch, type SetStateAction } from "react";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Button, Field, TextInput, NumberInput, Select } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash } from "../../ui/icons";
import { guardar, eliminar, nuevoId, type Recurso } from "../../../services/api";
import { useSession } from "../../../context/SessionContext";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "number" | "color" | "select";
  options?: { value: string; label: string }[];
  hint?: string;
}

interface Props<T extends { id: string }> {
  rows: T[];
  loading?: boolean;
  setRows: Dispatch<SetStateAction<T[] | null>>;
  columns: Column<T>[];
  fields: FieldDef[];
  idPrefix: string;
  /** Recurso de la API al que persisten las altas/ediciones/bajas. */
  resource: Recurso;
  /** Recurso de permisos (mayúsculas) para gatear los botones. */
  permRecurso: string;
  blank: () => T;
  searchPlaceholder?: string;
  title: string;
}

export function MasterCrud<T extends { id: string }>({
  rows, loading, setRows, columns, fields, idPrefix, resource, permRecurso, blank, searchPlaceholder, title,
}: Props<T>) {
  const { puede } = useSession();
  const puedeCrear = puede(permRecurso, "CREAR");
  const puedeEditar = puede(permRecurso, "EDITAR");
  const puedeEliminar = puede(permRecurso, "ELIMINAR");
  const [editing, setEditing] = useState<T | null>(null);
  const [confirm, setConfirm] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(item: T) {
    setError(null);
    try {
      const isNew = !item.id;
      const saved = await guardar(resource, { ...item, id: item.id || nuevoId(idPrefix) });
      setRows((prev) => { const l = prev ?? []; return isNew ? [saved, ...l] : l.map((x) => x.id === saved.id ? saved : x); });
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? limpiarError(e.message) : String(e));
    }
  }
  async function handleDelete(item: T) {
    setError(null);
    try {
      await eliminar(resource, item.id);
      setRows((prev) => (prev ?? []).filter((x) => x.id !== item.id));
      setConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? limpiarError(e.message) : String(e));
      setConfirm(null);
    }
  }

  function limpiarError(msg: string): string {
    return msg.replace(/^PostgresError:\s*/i, "");
  }

  const cols: Column<T>[] = [
    ...columns,
    ...(puedeEditar || puedeEliminar ? [{
      key: "__acc", header: "", align: "right" as const,
      cell: (row: T) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setEditing(row)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(row)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div>
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {puedeCrear && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setEditing(blank())}><IconPlus className="h-4 w-4" />Nuevo</Button>
        </div>
      )}
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} loading={loading} onRowClick={puedeEditar ? (r) => setEditing(r) : undefined} searchPlaceholder={searchPlaceholder ?? "Buscar…"} emptyTitle={`No hay registros`} pageSize={6} />

      {editing && (
        <GenericForm item={editing} fields={fields} title={`${editing.id ? "Editar" : "Nuevo"} · ${title}`} onCancel={() => setEditing(null)} onSave={handleSave} />
      )}
      <ConfirmDialog open={!!confirm} title="Eliminar registro" message="¿Eliminar este registro del catálogo maestro?" onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

function GenericForm<T extends { id: string }>({ item, fields, title, onCancel, onSave }: {
  item: T; fields: FieldDef[]; title: string; onCancel: () => void; onSave: (item: T) => void;
}) {
  const [form, setForm] = useState<T>(item);
  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <Modal open onClose={onCancel} title={title}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={() => onSave(form)}>Guardar</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const value = (form as Record<string, unknown>)[f.key];
          return (
            <Field key={f.key} label={f.label} hint={f.hint}>
              {f.type === "select" ? (
                <Select value={String(value ?? "")} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              ) : f.type === "color" ? (
                <div className="flex items-center gap-2">
                  <input type="color" value={String(value ?? "#e2237c")} onChange={(e) => set(f.key, e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200" />
                  <TextInput value={String(value ?? "")} onChange={(e) => set(f.key, e.target.value)} className="font-mono" />
                </div>
              ) : f.type === "number" ? (
                <NumberInput value={Number(value ?? 0)} onChange={(n) => set(f.key, n)} />
              ) : (
                <TextInput value={String(value ?? "")} onChange={(e) => set(f.key, e.target.value)} />
              )}
            </Field>
          );
        })}
      </div>
    </Modal>
  );
}
