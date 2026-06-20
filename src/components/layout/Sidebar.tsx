/** Sidebar colapsable con navegación por módulo, sensible al rol. */
import type { ReactNode } from "react";
import { IconChevron } from "../ui/icons";
import { useSession } from "../../context/SessionContext";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** Ámbito al que pertenece (para etiquetar Back/Front office). */
  scope: "BACK_OFFICE" | "FRONT_OFFICE" | "AMBOS";
}

export function Sidebar({
  items, active, onSelect, collapsed, onToggle,
}: {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { rolActual } = useSession();

  return (
    <aside
      className={`relative z-30 flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${collapsed ? "w-[76px]" : "w-64"}`}
    >
      {/* Encabezado del sidebar */}
      <div className="flex h-16 items-center border-b border-slate-100 px-4">
        {!collapsed && (
          <div className="animate-fade-in-fast overflow-hidden leading-tight">
            <p className="whitespace-nowrap font-bold text-navy-700">Dream Legacy</p>
            <p className="whitespace-nowrap text-[11px] text-slate-400">Sistema PLM</p>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">Módulos</p>
        )}
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              title={collapsed ? it.label : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${on ? "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand" : "text-slate-500 hover:bg-slate-100 hover:text-navy-700"}`}
            >
              <span className={`shrink-0 transition-transform duration-200 ${on ? "" : "group-hover:scale-110"}`}>{it.icon}</span>
              {!collapsed && <span className="animate-fade-in-fast whitespace-nowrap">{it.label}</span>}
              {on && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />}
            </button>
          );
        })}
      </nav>

      {/* Pie: rol activo */}
      <div className="border-t border-slate-100 p-3">
        <div className={`flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 ${collapsed ? "justify-center" : ""}`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-xs font-bold text-white">
            {rolActual.nombre.slice(0, 2).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="animate-fade-in-fast min-w-0 leading-tight">
              <p className="truncate text-xs font-bold text-navy-700">{rolActual.nombre}</p>
              <p className="text-[10px] text-slate-400">Rol activo</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón colapsar */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className="absolute -right-3 top-20 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 shadow transition hover:text-brand-600"
      >
        <IconChevron className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
      </button>
    </aside>
  );
}
