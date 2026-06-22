import { useMemo, useState } from "react";
import type { Rol, Permiso } from "../../../data/types";
import { getRoles, getPermisos, guardar } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Card, SectionHeader, TableSkeleton, Button } from "../../ui/primitives";
import { IconGrid, IconCheck, IconClose } from "../../ui/icons";

export function MatrizTab() {
  const { puede } = useSession();
  const puedeEditar = puede("ROL", "EDITAR");
  const { data: rolesData, setData, loading } = useAsyncData<Rol[]>(getRoles);
  const { data: permisos } = useAsyncData<Permiso[]>(getPermisos);
  // Estado local editable de la matriz (en memoria) hasta guardar.
  const [roles, setRoles] = useState<Rol[] | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = roles ?? rolesData;

  // Roles cuyos permisos difieren del original cargado.
  const dirty = useMemo(() => {
    if (!roles || !rolesData) return [] as Rol[];
    const orig = new Map(rolesData.map((r) => [r.id, [...r.permisosIds].sort().join(",")]));
    return roles.filter((r) => orig.get(r.id) !== [...r.permisosIds].sort().join(","));
  }, [roles, rolesData]);

  function toggle(rolId: string, permId: string) {
    if (!puedeEditar) return;
    setRoles((prev) => {
      const base = prev ?? rolesData ?? [];
      return base.map((r) => {
        if (r.id !== rolId) return r;
        const has = r.permisosIds.includes(permId);
        return { ...r, permisosIds: has ? r.permisosIds.filter((p) => p !== permId) : [...r.permisosIds, permId] };
      });
    });
  }

  async function guardarCambios() {
    if (!roles || dirty.length === 0) return;
    setError(null); setGuardando(true);
    try {
      for (const r of dirty) await guardar("rol", r);
      setData(roles);   // los cambios pasan a ser el nuevo estado base
      setRoles(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  if (loading || !current || !permisos) {
    return <Card className="p-2"><TableSkeleton rows={8} /></Card>;
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconGrid className="h-5 w-5" />}
        title="Matriz de Permisos"
        subtitle={puedeEditar ? "Toca una celda para conceder o quitar el permiso, luego guarda los cambios." : "Vista de los permisos por rol (sin permiso para editar)."}
        action={puedeEditar ? (
          <div className="flex items-center gap-2">
            {roles && <Button variant="ghost" onClick={() => { setRoles(null); setError(null); }} disabled={guardando}>Descartar</Button>}
            <Button onClick={guardarCambios} disabled={guardando || dirty.length === 0}>
              {guardando ? "Guardando…" : dirty.length ? `Guardar (${dirty.length})` : "Guardar"}
            </Button>
          </div>
        ) : undefined}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Permiso \ Rol</th>
                {current.map((r) => (
                  <th key={r.id} className="min-w-[92px] bg-slate-50 px-2 py-3 text-center">
                    <div className="mx-auto flex w-20 flex-col items-center gap-1">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-[10px] font-bold text-white">{r.nombre.slice(0, 2).toUpperCase()}</span>
                      <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-navy-700">{r.nombre}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permisos.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5">
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-navy-700">{p.recurso}</p>
                      <p className="text-[11px] text-slate-400">{p.accion}</p>
                    </div>
                  </td>
                  {current.map((r) => {
                    const on = r.permisosIds.includes(p.id);
                    return (
                      <td key={r.id} className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => toggle(r.id, p.id)}
                          disabled={!puedeEditar}
                          aria-pressed={on}
                          className={`mx-auto grid h-8 w-8 place-items-center rounded-lg transition-all duration-200 active:scale-90 ${on ? "bg-gradient-to-br from-brand-500 to-grape-500 text-white shadow-brand" : "bg-white text-slate-300 ring-1 ring-slate-200 hover:ring-brand-300"} ${puedeEditar ? "" : "cursor-not-allowed opacity-80"}`}
                        >
                          {on ? <IconCheck className="h-4 w-4" /> : <IconClose className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="mt-4 text-xs text-slate-500">
        El acceso al módulo <b>Costos</b> habilita ver los costos de producción.
      </div>
    </div>
  );
}
