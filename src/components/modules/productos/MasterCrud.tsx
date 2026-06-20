/**
 * CRUD genérico, dirigido por esquema, para catálogos maestros.
 * Evita reescribir un formulario por cada entidad simple.
 */
import { useState, type Dispatch, type SetStateAction } from "react";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Button, Field, TextInput, Select } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash } from "../../ui/icons";
import { guardar, eliminar, nuevoId } from "../../../services/api";

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
  blank: () => T;
  searchPlaceholder?: string;
  title: string;
}

export function MasterCrud<T extends { id: string }>({
  rows, loading, setRows, columns, fields, idPrefix, blank, searchPlaceholder, title,
}: Props<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [confirm, setConfirm] = useState<T | null>(null);

  async function handleSave(item: T) {
    const isNew = !item.id;
    const saved = await guardar({ ...item, id: item.id || nuevoId(idPrefix) });
    setRows((prev) => { const l = prev ?? []; return isNew ? [saved, ...l] : l.map((x) => x.id === saved.id ? saved : x); });
    setEditing(null);
  }
  async function handleDelete(item: T) {
    await eliminar(item.id);
    setRows((prev) => (prev ?? []).filter((x) => x.id !== item.id));
    setConfirm(null);
  }

  const cols: Column<T>[] = [
    ...columns,
    {
      key: "__acc", header: "", align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button title="Editar" onClick={() => setEditing(row)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>
          <button title="Eliminar" onClick={() => setConfirm(row)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button onClick={() => setEditing(blank())}><IconPlus className="h-4 w-4" />Nuevo</Button>
      </div>
      <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} loading={loading} onRowClick={(r) => setEditing(r)} searchPlaceholder={searchPlaceholder ?? "Buscar…"} emptyTitle={`No hay registros`} pageSize={6} />

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
              ) : (
                <TextInput
                  type={f.type === "number" ? "number" : "text"}
                  value={String(value ?? "")}
                  onChange={(e) => set(f.key, f.type === "number" ? +e.target.value : e.target.value)}
                />
              )}
            </Field>
          );
        })}
      </div>
    </Modal>
  );
}
