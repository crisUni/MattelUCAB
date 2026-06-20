/**
 * Simulador de sesión por rol. Permite "iniciar sesión como" cualquier rol
 * para demostrar cómo cambian menús, columnas de costo y acciones.
 */
import { useEffect, useRef, useState } from "react";
import { useSession } from "../../context/SessionContext";
import { IconChevronDown, IconSpark } from "../ui/icons";

export function RoleSelector() {
  const { roles, rolActual, setRolActualId } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2 pl-2.5 pr-3 text-sm shadow-soft transition hover:border-brand-300"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-grape-500 text-white">
          <IconSpark className="h-4 w-4" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sesión simulada como</span>
          <span className="block font-bold text-navy-700">{rolActual.nombre}</span>
        </span>
        <IconChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white px-4 py-3">
            <p className="text-sm font-bold text-navy-700">Simulador de sesión</p>
            <p className="text-xs text-slate-500">Cambia de rol para ver cómo se adapta el sistema.</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {roles.map((r) => (
              <RoleRow key={r.id} active={r.id === rolActual.id} name={r.nombre} count={r.permisosIds.length}
                onClick={() => { setRolActualId(r.id); setOpen(false); }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleRow({ active, name, count, onClick }: { active: boolean; name: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50"}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-brand-500" : "bg-slate-300"}`} />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy-700">{name}</span>
        <span className="shrink-0 text-[10px] text-slate-400">{count} permisos</span>
      </span>
    </button>
  );
}
