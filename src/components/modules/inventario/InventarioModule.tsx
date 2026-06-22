import { useEffect, useMemo, useState } from "react";
import {
  getInventario, getProductosOpc, getAlmacenesDetalle, getHubsOpc,
  crearInventario, actualizarInventario, eliminarInventario,
  type InventarioRow, type AlmacenOpcion, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import {
  Badge, Button, Card, Field, NumberInput, Select, SectionHeader, StatCard, fmtNum,
} from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconBox, IconHome } from "../../ui/icons";

/**
 * Módulo de Inventario: muestra, para cada hub regional, dónde reside el stock
 * de cada producto (en qué almacén y cuántas unidades). CRUD completo de las
 * existencias, controlado por el permiso INVENTARIO (VER/CREAR/EDITAR/ELIMINAR).
 */
export function InventarioModule() {
  const { puede } = useSession();
  const puedeCrear = puede("INVENTARIO", "CREAR");
  const puedeEditar = puede("INVENTARIO", "EDITAR");
  const puedeEliminar = puede("INVENTARIO", "ELIMINAR");

  const { data: inventario, setData, loading } = useAsyncData<InventarioRow[]>(getInventario);
  const { data: productos } = useAsyncData<Opcion[]>(getProductosOpc);
  const { data: almacenes } = useAsyncData<AlmacenOpcion[]>(getAlmacenesDetalle);
  const { data: hubs } = useAsyncData<Opcion[]>(getHubsOpc);

  const [hubFiltro, setHubFiltro] = useState("");
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<InventarioRow | null>(null);
  const [confirm, setConfirm] = useState<InventarioRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = inventario ?? [];
  const recargar = async () => setData(await getInventario());

  // Resumen de existencias por hub regional (sobre todo el inventario, no el filtrado).
  const porHub = useMemo(() => {
    const map = new Map<string, { hub: string; disponible: number; total: number; skus: Set<string> }>();
    for (const r of rows) {
      const e = map.get(r.hubId) ?? { hub: r.hub, disponible: 0, total: 0, skus: new Set<string>() };
      e.disponible += r.disponible;
      e.total += r.cantidad;
      e.skus.add(r.proId);
      map.set(r.hubId, e);
    }
    return Array.from(map.entries())
      .map(([hubId, e]) => ({ hubId, hub: e.hub, disponible: e.disponible, total: e.total, skus: e.skus.size }))
      .sort((a, b) => b.disponible - a.disponible);
  }, [rows]);

  const filtradas = useMemo(
    () => (hubFiltro ? rows.filter((r) => r.hubId === hubFiltro) : rows),
    [rows, hubFiltro],
  );

  // Totales globales (o del hub seleccionado) para las tarjetas superiores.
  const totales = useMemo(() => {
    const disponible = filtradas.reduce((s, r) => s + r.disponible, 0);
    const total = filtradas.reduce((s, r) => s + r.cantidad, 0);
    const skus = new Set(filtradas.map((r) => r.proId)).size;
    return { disponible, total, reservado: total - disponible, skus, existencias: filtradas.length };
  }, [filtradas]);

  async function borrar(r: InventarioRow) {
    setError(null);
    try { await eliminarInventario(r.proId, r.almId); setConfirm(null); await recargar(); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); setConfirm(null); }
  }

  const columns: Column<InventarioRow>[] = [
    { key: "sku", header: "SKU", sortValue: (r) => r.sku, searchValue: (r) => `${r.sku} ${r.producto}`, cell: (r) => <span className="font-mono text-xs font-semibold text-brand-600">{r.sku}</span> },
    {
      key: "producto", header: "Producto", sortValue: (r) => r.producto,
      cell: (r) => <p className="font-semibold text-navy-700">{r.producto}</p>,
    },
    {
      key: "hub", header: "Hub regional", sortValue: (r) => r.hub, searchValue: (r) => r.hub,
      cell: (r) => <Badge tone="brand">{r.hub}</Badge>,
    },
    {
      key: "almacen", header: "Almacén", sortValue: (r) => r.almacenTipo,
      cell: (r) => (
        <div className="leading-tight">
          <p className="text-sm text-navy-700">{r.almacenTipo} <span className="text-slate-400">#{r.almId}</span></p>
          <p className="text-xs text-slate-400">{r.ubicacion}</p>
        </div>
      ),
    },
    { key: "disponible", header: "Disponible", align: "right", sortValue: (r) => r.disponible, cell: (r) => <span className={r.disponible < 50 ? "font-bold text-amber-600" : "font-semibold text-navy-700"}>{fmtNum(r.disponible)}</span> },
    { key: "cantidad", header: "Total", align: "right", sortValue: (r) => r.cantidad, cell: (r) => <span className="text-slate-500">{fmtNum(r.cantidad)}</span> },
    { key: "reservado", header: "Reservado", align: "right", sortValue: (r) => r.reservado, cell: (r) => <span className="text-slate-400">{fmtNum(r.reservado)}</span> },
    { key: "actualizado", header: "Actualizado", sortValue: (r) => r.actualizado, cell: (r) => <span className="text-xs text-slate-400">{r.actualizado || "—"}</span> },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (r: InventarioRow) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {puedeEditar && <button title="Editar" onClick={() => setEditando(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
          {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(r)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconBox className="h-5 w-5" />}
        title="Inventario por Hub Regional"
        subtitle="Existencias de cada producto distribuidas por almacén y hub. El catálogo suma el stock disponible de todos los hubs."
        action={puedeCrear ? <Button onClick={() => { setError(null); setCreando(true); }}><IconPlus className="h-4 w-4" />Nueva existencia</Button> : undefined}
      />

      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {/* Totales (globales o del hub seleccionado) */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Unidades disponibles" value={fmtNum(totales.disponible)} tone="brand" icon={<IconBox className="h-5 w-5" />} hint={hubFiltro ? "En el hub seleccionado" : "En todos los hubs"} />
        <StatCard label="Unidades totales" value={fmtNum(totales.total)} tone="navy" hint={`${fmtNum(totales.reservado)} reservadas`} />
        <StatCard label="Productos (SKU)" value={fmtNum(totales.skus)} tone="green" hint={`${fmtNum(totales.existencias)} existencias`} />
        <StatCard label="Hubs activos" value={fmtNum(porHub.length)} tone="amber" icon={<IconHome className="h-5 w-5" />} hint="Con stock registrado" />
      </div>

      {/* Resumen por hub: clic para filtrar la tabla por ese hub. */}
      {porHub.length > 0 && (
        <Card className="mb-5 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-600">Stock disponible por hub</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHubFiltro("")}
              className={`rounded-xl px-3 py-2 text-left text-sm transition ${hubFiltro === "" ? "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand" : "bg-slate-50 text-navy-700 ring-1 ring-slate-200 hover:ring-brand-300"}`}
            >
              <span className="block font-semibold">Todos</span>
              <span className={`block text-xs ${hubFiltro === "" ? "text-white/80" : "text-slate-400"}`}>{fmtNum(rows.reduce((s, r) => s + r.disponible, 0))} u.</span>
            </button>
            {porHub.map((h) => (
              <button
                key={h.hubId}
                onClick={() => setHubFiltro(h.hubId)}
                className={`rounded-xl px-3 py-2 text-left text-sm transition ${hubFiltro === h.hubId ? "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand" : "bg-slate-50 text-navy-700 ring-1 ring-slate-200 hover:ring-brand-300"}`}
              >
                <span className="block font-semibold">{h.hub}</span>
                <span className={`block text-xs ${hubFiltro === h.hubId ? "text-white/80" : "text-slate-400"}`}>{fmtNum(h.disponible)} u. · {h.skus} SKU</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <DataTable
        columns={columns} rows={filtradas} rowKey={(r) => r.id} loading={loading}
        searchPlaceholder="Buscar por SKU, producto o hub…"
        emptyTitle={hubFiltro ? "Este hub no tiene existencias" : "No hay inventario registrado"}
        pageSize={10}
      />

      {creando && (
        <InventarioForm
          productos={productos ?? []} almacenes={almacenes ?? []} existentes={rows}
          onCancel={() => setCreando(false)}
          onSaved={async () => { setCreando(false); await recargar(); }}
        />
      )}
      {editando && (
        <InventarioForm
          editar={editando} productos={productos ?? []} almacenes={almacenes ?? []} existentes={rows}
          onCancel={() => setEditando(null)}
          onSaved={async () => { setEditando(null); await recargar(); }}
        />
      )}
      <ConfirmDialog
        open={!!confirm} title="Eliminar existencia"
        message={`¿Eliminar el stock de "${confirm?.producto}" en ${confirm?.hub} (${confirm?.almacenTipo} #${confirm?.almId})?`}
        onCancel={() => setConfirm(null)} onConfirm={() => confirm && borrar(confirm)}
      />
    </div>
  );
}

/* ----------------------------- Formulario ------------------------------ */
function InventarioForm({
  editar, productos, almacenes, existentes, onCancel, onSaved,
}: {
  editar?: InventarioRow;
  productos: Opcion[]; almacenes: AlmacenOpcion[]; existentes: InventarioRow[];
  onCancel: () => void; onSaved: () => void;
}) {
  const esEdicion = !!editar;
  const [proId, setProId] = useState(editar?.proId ?? "");
  const [almId, setAlmId] = useState(editar?.almId ?? "");
  const [cantidad, setCantidad] = useState(editar?.cantidad ?? 0);
  const [disponible, setDisponible] = useState(editar?.disponible ?? 0);
  // Mientras el usuario no edite manualmente el disponible, lo igualamos a la cantidad.
  const [dispTocado, setDispTocado] = useState(esEdicion);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Al crear: los almacenes que ya tienen una existencia de este producto no se
  // pueden reutilizar (la clave es producto+almacén); se ocultan del select.
  const almacenesUsados = useMemo(
    () => new Set(existentes.filter((e) => e.proId === proId).map((e) => e.almId)),
    [existentes, proId],
  );
  const almacenesDisponibles = useMemo(
    () => (esEdicion ? almacenes : almacenes.filter((a) => !almacenesUsados.has(a.id))),
    [almacenes, almacenesUsados, esEdicion],
  );

  useEffect(() => {
    if (!dispTocado) setDisponible(cantidad);
  }, [cantidad, dispTocado]);

  async function submit() {
    setError(null);
    if (!proId) { setError("Selecciona el producto."); return; }
    if (!almId) { setError("Selecciona el almacén."); return; }
    if (cantidad <= 0) { setError("La cantidad total debe ser mayor que cero."); return; }
    if (disponible < 0) { setError("El stock disponible no puede ser negativo."); return; }
    if (disponible > cantidad) { setError("El stock disponible no puede superar la cantidad total."); return; }
    setGuardando(true);
    try {
      const payload = { proId, almId, disponible, cantidad };
      if (esEdicion) await actualizarInventario(payload);
      else await crearInventario(payload);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="md"
      title={esEdicion ? "Editar existencia" : "Nueva existencia"}
      subtitle={esEdicion ? "Ajusta las unidades de este producto en este almacén." : "Registra el stock de un producto en un almacén (hub regional)."}
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear"}</Button></>}
    >
      {esEdicion ? (
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="font-semibold text-navy-700">{editar!.producto}</p>
          <p className="text-sm text-slate-500">{editar!.hub} · {editar!.almacenTipo} #{editar!.almId}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Producto">
            <Select value={proId} onChange={(e) => { setProId(e.target.value); setAlmId(""); }}>
              <option value="">— Selecciona —</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Almacén (hub · tipo)" hint={proId && almacenesDisponibles.length === 0 ? "Este producto ya tiene stock en todos los almacenes" : "Cada almacén pertenece a un hub regional"}>
            <Select value={almId} onChange={(e) => setAlmId(e.target.value)} disabled={!proId}>
              <option value="">— Selecciona —</option>
              {almacenesDisponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </Select>
          </Field>
        </div>
      )}

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <Field label="Cantidad total" hint="Unidades físicas en el almacén">
          <NumberInput min={0} value={cantidad} onChange={setCantidad} />
        </Field>
        <Field label="Stock disponible" hint="No reservado (≤ cantidad total)">
          <NumberInput min={0} value={disponible} onChange={(n) => { setDispTocado(true); setDisponible(n); }} />
        </Field>
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
