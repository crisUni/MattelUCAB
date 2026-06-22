import { useMemo, useState, type ReactNode } from "react";
import type { Rol, Permiso, AccionPermiso } from "../../../data/types";
import { getRoles, getPermisos, guardar, eliminar, nuevoId } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Badge, Button, Field, TextInput, SectionHeader } from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconShield } from "../../ui/icons";

const ACCIONES: AccionPermiso[] = ["VER", "CREAR", "EDITAR", "ELIMINAR"];
const formVacio: Rol = { id: "", nombre: "", ambito: "INTERNO", permisosIds: [] };

export function RolesTab() {
  const { puede } = useSession();
  const { data: roles, setData, loading } = useAsyncData<Rol[]>(getRoles);
  const { data: permisos } = useAsyncData<Permiso[]>(getPermisos);
  const [editing, setEditing] = useState<Rol | null>(null);
  const [confirm, setConfirm] = useState<Rol | null>(null);

  const puedeCrear = puede("ROL", "CREAR");
  const puedeEditar = puede("ROL", "EDITAR");
  const puedeEliminar = puede("ROL", "ELIMINAR");

  async function handleSave(r: Rol) {
    const isNew = !r.id;
    const saved = await guardar("rol", { ...r, id: r.id || nuevoId("rol") });
    setData((prev) => {
      const list = prev ?? [];
      return isNew ? [saved, ...list] : list.map((x) => (x.id === saved.id ? saved : x));
    });
    setEditing(null);
  }
  async function handleDelete(r: Rol) {
    await eliminar("rol", r.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== r.id));
    setConfirm(null);
  }

  const columns: Column<Rol>[] = [
    { key: "nombre", header: "Rol", sortValue: (r) => r.nombre, searchValue: (r) => r.nombre, cell: (r) => <p className="font-semibold text-navy-700">{r.nombre}</p> },
    { key: "ambito", header: "Ámbito", sortValue: (r) => r.ambito, cell: (r) => <Badge tone={r.ambito === "EXTERNO" ? "amber" : "brand"}>{r.ambito === "EXTERNO" ? "Externo · cliente" : "Interno · empleado"}</Badge> },
    { key: "permisos", header: "Permisos", align: "center", sortValue: (r) => r.permisosIds.length, cell: (r) => <Badge tone="brand">{r.permisosIds.length}</Badge> },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (r: Rol) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setEditing(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconShield className="h-5 w-5" />}
        title="Roles"
        subtitle="Compón cada rol marcando exactamente qué puede Ver / Crear / Editar / Eliminar sobre cada recurso."
        action={puedeCrear ? <Button onClick={() => setEditing({ ...formVacio })}><IconPlus className="h-4 w-4" />Nuevo rol</Button> : undefined}
      />
      <DataTable columns={columns} rows={roles ?? []} rowKey={(r) => r.id} loading={loading} onRowClick={puedeEditar ? (r) => setEditing(r) : undefined} searchPlaceholder="Buscar rol…" emptyTitle="No hay roles" />

      {editing && <RolForm rol={editing} permisos={permisos ?? []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar rol" message={`¿Eliminar el rol "${confirm?.nombre}"?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

const GRUPOS: { titulo: string; recursos: string[] }[] = [
  { titulo: "Seguridad", recursos: ["USUARIO", "ROL"] },
  { titulo: "Genoma Barbie", recursos: ["PRODUCTO", "MOLDE_ROSTRO", "TIPO_CUERPO", "COLOR", "MATERIAL", "ERA", "EXCLUSIVIDAD", "PERSONAJE", "PROFESION", "COMPATIBILIDAD", "PACK"] },
  { titulo: "Manufactura y calidad", recursos: ["LOTE", "CALIDAD"] },
  { titulo: "Reportes y costos", recursos: ["REPORTE", "COSTO"] },
];
const LABEL: Record<string, string> = {
  USUARIO: "Usuario", ROL: "Rol", PERMISO: "Permiso", PRODUCTO: "Producto",
  MOLDE_ROSTRO: "Molde de rostro", TIPO_CUERPO: "Tipo de cuerpo", COLOR: "Color",
  MATERIAL: "Material", ERA: "Era", EXCLUSIVIDAD: "Exclusividad", PERSONAJE: "Personaje",
  PROFESION: "Profesión", COMPATIBILIDAD: "Compatibilidad", PACK: "Pack",
  LOTE: "Lote de producción", CALIDAD: "Calidad / inspección",
  REPORTE: "Reporte", COSTO: "Costos / márgenes",
};
const ACC_META: Record<AccionPermiso, { letra: string; on: string }> = {
  VER: { letra: "V", on: "bg-emerald-500" },
  CREAR: { letra: "C", on: "bg-brand-500" },
  EDITAR: { letra: "E", on: "bg-amber-500" },
  ELIMINAR: { letra: "D", on: "bg-rose-500" },
};
const label = (r: string) => LABEL[r] ?? r;

function Preset({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200">{children}</button>;
}

function RolForm({ rol, permisos, onCancel, onSave }: { rol: Rol; permisos: Permiso[]; onCancel: () => void; onSave: (r: Rol) => void }) {
  const [form, setForm] = useState<Rol>(rol);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const set = (p: Partial<Rol>) => setForm((f) => ({ ...f, ...p }));

  const { idDe, presentes } = useMemo(() => {
    const idDe = new Map<string, string>();
    const presentes = new Set<string>();
    for (const p of permisos) { idDe.set(`${p.recurso}:${p.accion}`, p.id); presentes.add(p.recurso); }
    return { idDe, presentes };
  }, [permisos]);

  const seleccion = useMemo(() => new Set(form.permisosIds), [form.permisosIds]);
  const tiene = (recurso: string, accion: AccionPermiso) => {
    const id = idDe.get(`${recurso}:${accion}`);
    return !!id && seleccion.has(id);
  };
  const idsDe = (recursos: string[], acciones: AccionPermiso[] = ACCIONES) =>
    recursos.flatMap((r) => acciones.map((a) => idDe.get(`${r}:${a}`)).filter(Boolean) as string[]);
  const aplicar = (ids: string[], on: boolean) =>
    set({ permisosIds: on ? Array.from(new Set([...form.permisosIds, ...ids])) : form.permisosIds.filter((x) => !ids.includes(x)) });
  const toggleCelda = (recurso: string, accion: AccionPermiso) => {
    const id = idDe.get(`${recurso}:${accion}`);
    if (id) aplicar([id], !seleccion.has(id));
  };
  const toggleConjunto = (ids: string[]) => aplicar(ids, !ids.every((id) => seleccion.has(id)));

  // Recursos por grupo, filtrados por búsqueda.
  const f = filtro.trim().toLowerCase();
  const coincide = (r: string) => !f || label(r).toLowerCase().includes(f) || r.toLowerCase().includes(f);
  const grupos = GRUPOS
    .map((g) => ({ ...g, recursos: g.recursos.filter((r) => presentes.has(r) && coincide(r)) }))
    .filter((g) => g.recursos.length);
  const conocidos = new Set(GRUPOS.flatMap((g) => g.recursos));
  const otros = [...presentes].filter((r) => !conocidos.has(r) && coincide(r));
  if (otros.length) grupos.push({ titulo: "Otros", recursos: otros });
  const visibles = grupos.flatMap((g) => g.recursos);

  async function submit() {
    setError(null);
    try { await onSave(form); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  return (
    <Modal open onClose={onCancel} size="lg"
      title={rol.id ? "Editar rol" : "Nuevo rol"}
      subtitle="Marca qué puede hacer este rol. La interfaz mostrará a sus usuarios sólo lo permitido."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit}>Guardar rol</Button></>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre del rol"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
        <Field label="Buscar recurso"><TextInput value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="ej. producto, color…" /></Field>
      </div>
      <div className="mt-3">
        <Field label="Ámbito del rol" hint="Define si sus usuarios son personal interno (empleado) o externo (cliente)">
          <div className="flex gap-2">
            {(["INTERNO", "EXTERNO"] as const).map((a) => (
              <button key={a} onClick={() => set({ ambito: a })}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${form.ambito === a ? "bg-navy-700 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-700"}`}>
                {a === "INTERNO" ? "Interno (empleado)" : "Externo (cliente)"}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Preset onClick={() => aplicar(idsDe([...presentes]), true)}>Marcar todo</Preset>
          <Preset onClick={() => set({ permisosIds: idsDe([...presentes], ["VER"]) })}>Solo lectura</Preset>
          <Preset onClick={() => set({ permisosIds: [] })}>Limpiar</Preset>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">{seleccion.size} permisos · V·Ver C·Crear E·Editar D·Eliminar</span>
      </div>

      <div className="mt-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
          <span className="flex-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Recurso</span>
          {ACCIONES.map((a) => (
            <button key={a} title={`Alternar ${a} en todo lo visible`} onClick={() => toggleConjunto(idsDe(visibles, [a]))}
              className="h-6 w-7 rounded text-[10px] font-bold text-slate-500 hover:bg-slate-200">{ACC_META[a].letra}</button>
          ))}
        </div>

        <div className="max-h-[46vh] overflow-y-auto">
          {grupos.length === 0 && <p className="px-3 py-4 text-center text-sm text-slate-400">Sin coincidencias.</p>}
          {grupos.map((g) => {
            const idsGrupo = idsDe(g.recursos);
            const todos = idsGrupo.length > 0 && idsGrupo.every((id) => seleccion.has(id));
            return (
              <div key={g.titulo}>
                <div className="flex items-center gap-2 bg-slate-50/60 px-3 py-1">
                  <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-brand-600">{g.titulo}</span>
                  <button onClick={() => toggleConjunto(idsGrupo)} className="text-[10px] font-semibold text-slate-400 hover:text-brand-600">
                    {todos ? "Quitar todo" : "Marcar todo"}
                  </button>
                </div>
                {g.recursos.map((recurso) => (
                  <div key={recurso} className="flex items-center gap-1 border-t border-slate-50 px-3 py-1 hover:bg-slate-50/60">
                    <button onClick={() => toggleConjunto(idsDe([recurso]))} className="flex-1 truncate text-left text-xs font-medium text-navy-700 hover:text-brand-600" title="Alternar todas las acciones de este recurso">
                      {label(recurso)}
                    </button>
                    {ACCIONES.map((a) => {
                      const existe = idDe.has(`${recurso}:${a}`);
                      const on = tiene(recurso, a);
                      return existe ? (
                        <button key={a} onClick={() => toggleCelda(recurso, a)} aria-pressed={on} title={`${a} · ${label(recurso)}`}
                          className={`h-6 w-7 rounded text-[10px] font-bold transition ${on ? `${ACC_META[a].on} text-white` : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}>
                          {ACC_META[a].letra}
                        </button>
                      ) : <span key={a} className="grid h-6 w-7 place-items-center text-slate-200">·</span>;
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
