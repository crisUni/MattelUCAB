/**
 * Tabla de datos genérica y reutilizable.
 * Incluye los tres requisitos de la materia: buscador, ordenamiento por
 * columna y paginación. Totalmente desacoplada del dominio.
 */
import { useMemo, useState, type ReactNode } from "react";
import { IconSearch, IconChevron } from "./icons";
import { TableSkeleton, EmptyState } from "./primitives";

export interface Column<T> {
  key: string;
  header: string;
  /** Render de la celda. */
  cell: (row: T) => ReactNode;
  /** Valor usado para ordenar (si la columna es ordenable). */
  sortValue?: (row: T) => string | number;
  /** Texto usado para el buscador. */
  searchValue?: (row: T) => string;
  align?: "left" | "right" | "center";
  className?: string;
  /** Oculta la columna (p.ej. dato sensible según rol). */
  hidden?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  columns, rows, rowKey, loading, pageSize = 8,
  searchPlaceholder = "Buscar…", onRowClick, emptyTitle = "Sin resultados", toolbar,
}: Props<T>) {
  const cols = columns.filter((c) => !c.hidden);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      cols.some((c) => {
        const v = c.searchValue?.(r) ?? (typeof c.sortValue?.(r) === "string" ? String(c.sortValue?.(r)) : "");
        return v.toLowerCase().includes(q);
      })
    );
  }, [rows, query, cols]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir, cols]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {toolbar}
      </div>

      {/* Tabla */}
      {loading ? (
        <TableSkeleton rows={pageSize} />
      ) : sorted.length === 0 ? (
        <EmptyState title={emptyTitle} hint="Ajusta el buscador o agrega un nuevo registro." icon={<IconSearch />} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left">
                {cols.map((c) => {
                  const sortable = !!c.sortValue;
                  const on = sortKey === c.key;
                  return (
                    <th
                      key={c.key}
                      onClick={() => toggleSort(c)}
                      className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 ${sortable ? "cursor-pointer select-none hover:text-brand-600" : ""} ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"}`}
                    >
                      <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                        {c.header}
                        {sortable && (
                          <IconChevron className={`h-3 w-3 transition-transform duration-200 ${on ? "text-brand-500" : "text-slate-300"} ${on && sortDir === "asc" ? "-rotate-90" : on && sortDir === "desc" ? "rotate-90" : "rotate-90 opacity-40"}`} />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr
                  key={rowKey(r)}
                  onClick={() => onRowClick?.(r)}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={`animate-fade-in border-t border-slate-100 transition-colors ${onRowClick ? "cursor-pointer hover:bg-brand-50/50" : "hover:bg-slate-50"}`}
                >
                  {cols.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-navy-700 ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""} ${c.className ?? ""}`}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
          <p className="text-slate-400">
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} de <span className="font-semibold text-navy-700">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-40"
            >
              <IconChevron className="h-4 w-4 rotate-180" />
            </button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
              const n = idx + 1;
              const on = n === safePage;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition ${on ? "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {n}
                </button>
              );
            })}
            {totalPages > 7 && <span className="px-1 text-slate-400">…</span>}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-40"
            >
              <IconChevron className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
