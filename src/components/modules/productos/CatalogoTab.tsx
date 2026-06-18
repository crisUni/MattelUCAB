import { useMemo, useState } from "react";
import type {
  Producto, MoldeRostro, TipoCuerpo, TonoPiel, ColorMaestro, Era, Exclusividad, Material, Personaje, TipoProducto,
} from "../../../data/types";
import {
  getProductos, getMoldesRostro, getTiposCuerpo, getTonosPiel, getColores,
  getEras, getExclusividades, getMateriales, getPersonajes, guardar, eliminar, nuevoId,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import {
  Badge, Button, Field, TextInput, Select, SectionHeader, LabelChip, fmtUsd, fmtFecha,
} from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconDna, IconLock, IconBox } from "../../ui/icons";
import { BarbieConfetti } from "../../ui/Decor";

const tipoLabel: Record<TipoProducto, string> = {
  MUNECA: "Muñeca", ACCESORIO: "Accesorio", INMUEBLE: "Inmueble", VEHICULO: "Vehículo", PACK: "Pack",
};

export function CatalogoTab() {
  const { puedeVerSensible } = useSession();
  const { data: productos, setData, loading } = useAsyncData<Producto[]>(getProductos);
  const { data: moldes } = useAsyncData<MoldeRostro[]>(getMoldesRostro);
  const { data: cuerpos } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);
  const { data: tonos } = useAsyncData<TonoPiel[]>(getTonosPiel);
  const { data: colores } = useAsyncData<ColorMaestro[]>(getColores);
  const { data: eras } = useAsyncData<Era[]>(getEras);
  const { data: excl } = useAsyncData<Exclusividad[]>(getExclusividades);
  const { data: materiales } = useAsyncData<Material[]>(getMateriales);
  const { data: personajes } = useAsyncData<Personaje[]>(getPersonajes);

  const [detail, setDetail] = useState<Producto | null>(null);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [confirm, setConfirm] = useState<Producto | null>(null);

  const lookups = useMemo(() => ({
    molde: (id?: string) => moldes?.find((m) => m.id === id),
    cuerpo: (id?: string) => cuerpos?.find((c) => c.id === id),
    tono: (id?: string) => tonos?.find((t) => t.id === id),
    color: (id?: string) => colores?.find((c) => c.id === id),
    era: (id?: string) => eras?.find((e) => e.id === id),
    excl: (id?: string) => excl?.find((e) => e.id === id),
    material: (id?: string) => materiales?.find((m) => m.id === id),
    personaje: (id?: string) => personajes?.find((p) => p.id === id),
  }), [moldes, cuerpos, tonos, colores, eras, excl, materiales, personajes]);

  async function handleSave(p: Producto) {
    const isNew = !p.id;
    const saved = await guardar({ ...p, id: p.id || nuevoId("prod") });
    setData((prev) => { const l = prev ?? []; return isNew ? [saved, ...l] : l.map((x) => x.id === saved.id ? saved : x); });
    setEditing(null);
  }
  async function handleDelete(p: Producto) {
    await eliminar(p.id);
    setData((prev) => (prev ?? []).filter((x) => x.id !== p.id));
    setConfirm(null);
  }

  const columns: Column<Producto>[] = [
    { key: "sku", header: "SKU", sortValue: (p) => p.sku, searchValue: (p) => `${p.sku} ${p.nombre}`, cell: (p) => <span className="font-mono text-xs font-semibold text-brand-600">{p.sku}</span> },
    {
      key: "nombre", header: "Producto", sortValue: (p) => p.nombre,
      cell: (p) => (
        <div className="leading-tight">
          <p className="font-semibold text-navy-700">{p.nombre}</p>
          <p className="text-xs text-slate-400">{tipoLabel[p.tipo]}{lookups.molde(p.moldeRostroId) ? ` · ${lookups.molde(p.moldeRostroId)!.nombre} ${lookups.molde(p.moldeRostroId)!.anioPatente}` : ""}</p>
        </div>
      ),
    },
    { key: "label", header: "Label", sortValue: (p) => lookups.excl(p.exclusividadId)?.codigo ?? "", cell: (p) => lookups.excl(p.exclusividadId) ? <LabelChip codigo={lookups.excl(p.exclusividadId)!.codigo} /> : <span className="text-slate-300">—</span> },
    { key: "precio", header: "Precio", align: "right", sortValue: (p) => p.precioBaseUsd, cell: (p) => <span className="font-semibold text-navy-700">{fmtUsd(p.precioBaseUsd)}</span> },
    {
      key: "costo", header: "Costo prod.", align: "right", hidden: !puedeVerSensible, sortValue: (p) => p.costoProduccionUsd,
      cell: (p) => <span className="font-mono text-sm text-rose-600">{fmtUsd(p.costoProduccionUsd)}</span>,
    },
    { key: "stock", header: "Stock", align: "right", sortValue: (p) => p.stock, cell: (p) => <span className={p.stock < 10 ? "font-bold text-amber-600" : "text-slate-500"}>{p.stock}</span> },
    {
      key: "acc", header: "", align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button title="Editar" onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>
          <button title="Eliminar" onClick={() => setConfirm(p)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconDna className="h-5 w-5" />}
        title="Catálogo de Productos · Genoma Barbie"
        subtitle="Cada SKU es la variante mínima e indivisible. Haz clic en una fila para ver su ficha de ADN completa."
        action={<Button onClick={() => setEditing(blankProducto())}><IconPlus className="h-4 w-4" />Nuevo producto</Button>}
      />
      {!puedeVerSensible && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <IconLock className="h-4 w-4" /> El costo de producción está oculto para tu rol actual (dato sensible).
        </div>
      )}
      <DataTable columns={columns} rows={productos ?? []} rowKey={(p) => p.id} loading={loading} onRowClick={(p) => setDetail(p)} searchPlaceholder="Buscar por SKU o nombre…" emptyTitle="No hay productos" pageSize={8} />

      {detail && <FichaADN producto={detail} lookups={lookups} puedeVerSensible={puedeVerSensible} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); }} />}
      {editing && <ProductoForm producto={editing} moldes={moldes ?? []} cuerpos={cuerpos ?? []} tonos={tonos ?? []} colores={colores ?? []} eras={eras ?? []} excl={excl ?? []} personajes={personajes ?? []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar producto" message={`¿Eliminar ${confirm?.nombre} (${confirm?.sku})?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
    </div>
  );
}

function blankProducto(): Producto {
  return {
    id: "", sku: "", nombre: "", precioBaseUsd: 0, costoProduccionUsd: 0,
    fechaLanzamiento: new Date().toISOString(), tipo: "MUNECA", bom: [], stock: 0,
  };
}

/* ------------------------------ Ficha ADN ------------------------------ */
function FichaADN({ producto, lookups, puedeVerSensible, onClose, onEdit }: {
  producto: Producto; lookups: any; puedeVerSensible: boolean; onClose: () => void; onEdit: () => void;
}) {
  const molde = lookups.molde(producto.moldeRostroId);
  const cuerpo = lookups.cuerpo(producto.tipoCuerpoId);
  const tono = lookups.tono(producto.tonoPielId);
  const ojos = lookups.color(producto.colorOjosId);
  const era = lookups.era(producto.eraId);
  const exclusividad = lookups.excl(producto.exclusividadId);
  const personaje = lookups.personaje(producto.personajeId);

  return (
    <Modal open onClose={onClose} size="lg"
      title="Ficha de ADN del producto"
      subtitle={`${producto.sku} · taxonomía completa`}
      footer={<><Button variant="ghost" onClick={onClose}>Cerrar</Button><Button onClick={onEdit}><IconEdit className="h-4 w-4" />Editar</Button></>}
    >
      {/* Encabezado tipo ficha de personaje */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-grape-600 p-5 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 right-1/4 h-32 w-32 rotate-12 bg-white/5" style={{ clipPath: "polygon(0 0,100% 0,100% 100%)" }} />
        <BarbieConfetti tone="light" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{tipoLabel[producto.tipo]}{personaje ? ` · ${personaje.nombre}` : ""}</p>
            <h3 className="mt-0.5 text-2xl font-extrabold">{producto.nombre}</h3>
            <p className="font-mono text-sm text-white/80">{producto.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">{fmtUsd(producto.precioBaseUsd)}</p>
            <p className="text-xs text-white/70">Lanzamiento {fmtFecha(producto.fechaLanzamiento)}</p>
          </div>
        </div>
        {exclusividad && <div className="relative mt-3"><LabelChip codigo={exclusividad.codigo} /></div>}
      </div>

      {/* Cromosomas / atributos */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Chromo label="Molde de Rostro (Face Sculpt)" value={molde ? `${molde.nombre} (${molde.anioPatente})` : "—"} hint={molde?.descripcion} />
        <Chromo label="Tipo de Cuerpo" value={cuerpo ? cuerpo.nombre : "—"} hint={cuerpo ? `Pie ${cuerpo.formaPie.toLowerCase()}${cuerpo.articulado ? " · articulado" : ""}` : undefined} />
        <Chromo label="Tono de Piel" value={tono?.nombre ?? "—"} swatch={tono?.hex} />
        <Chromo label="Color de Ojos" value={ojos?.nombre ?? "—"} swatch={ojos?.hex} />
        <Chromo label="Era Histórica" value={era ? `${era.nombre} (${era.rango})` : "—"} hint={era?.descripcion} />
        <Chromo label="Exclusividad / Label" value={exclusividad ? exclusividad.nombre : "—"} hint={exclusividad?.descripcion} />
      </div>

      {/* BOM / receta */}
      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-700"><IconBox className="h-4 w-4 text-brand-500" />Receta de materiales (BOM)</p>
        {producto.bom.length === 0 ? (
          <p className="text-sm text-slate-400">Sin materiales registrados.</p>
        ) : (
          <div className="space-y-1.5">
            {producto.bom.map((b) => {
              const m = lookups.material(b.materialId);
              const costo = m ? m.costoUnitarioUsd * b.cantidad : 0;
              return (
                <div key={b.materialId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-navy-700">{m?.nombre ?? b.materialId}</span>
                  <span className="flex items-center gap-3 text-slate-500">
                    <span>{b.cantidad} {m?.unidad}</span>
                    {puedeVerSensible && <span className="font-mono text-xs text-rose-600">{fmtUsd(costo)}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
          <span className="font-semibold text-navy-700">Stock disponible</span>
          <span className="font-bold text-navy-700">{producto.stock} u.</span>
        </div>
        {puedeVerSensible ? (
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-navy-700">Costo de producción</span>
            <span className="font-mono font-bold text-rose-600">{fmtUsd(producto.costoProduccionUsd)}</span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600"><IconLock className="h-3.5 w-3.5" />Costo de producción oculto para tu rol.</div>
        )}
      </div>
    </Modal>
  );
}

function Chromo({ label, value, hint, swatch }: { label: string; value: string; hint?: string; swatch?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {swatch && <span className="h-5 w-5 shrink-0 rounded-full ring-1 ring-slate-200" style={{ background: swatch }} />}
        <p className="font-semibold text-navy-700">{value}</p>
      </div>
      {hint && <p className="mt-1 text-[11px] leading-snug text-slate-400">{hint}</p>}
    </div>
  );
}

/* ----------------------------- Formulario ------------------------------ */
function ProductoForm({ producto, moldes, cuerpos, tonos, colores, eras, excl, personajes, onCancel, onSave }: {
  producto: Producto; moldes: MoldeRostro[]; cuerpos: TipoCuerpo[]; tonos: TonoPiel[]; colores: ColorMaestro[];
  eras: Era[]; excl: Exclusividad[]; personajes: Personaje[]; onCancel: () => void; onSave: (p: Producto) => void;
}) {
  const [form, setForm] = useState<Producto>(producto);
  const set = (p: Partial<Producto>) => setForm((f) => ({ ...f, ...p }));
  const opt = (id?: string) => id ?? "";

  return (
    <Modal open onClose={onCancel} size="lg"
      title={producto.id ? "Editar producto" : "Nuevo producto"}
      subtitle="Define la taxonomía (ADN). Si cambia el color de los zapatos, debe ser un SKU nuevo."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={() => onSave(form)}>Guardar producto</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU"><TextInput value={form.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="BRB-AAAA-XXX" /></Field>
        <Field label="Nombre comercial"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
        <Field label="Precio base (USD)"><TextInput type="number" value={form.precioBaseUsd} onChange={(e) => set({ precioBaseUsd: +e.target.value })} /></Field>
        <Field label="Costo de producción (USD)" hint="Dato sensible"><TextInput type="number" value={form.costoProduccionUsd} onChange={(e) => set({ costoProduccionUsd: +e.target.value })} /></Field>
        <Field label="Fecha de lanzamiento"><TextInput type="date" value={form.fechaLanzamiento.slice(0, 10)} onChange={(e) => set({ fechaLanzamiento: new Date(e.target.value).toISOString() })} /></Field>
        <Field label="Tipo">
          <Select value={form.tipo} onChange={(e) => set({ tipo: e.target.value as TipoProducto })}>
            {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Stock"><TextInput type="number" value={form.stock} onChange={(e) => set({ stock: +e.target.value })} /></Field>
        <Field label="Personaje">
          <Select value={opt(form.personajeId)} onChange={(e) => set({ personajeId: e.target.value || undefined })}>
            <option value="">— Ninguno —</option>
            {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </Field>
      </div>

      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-brand-600">Taxonomía / ADN</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Molde de rostro">
          <Select value={opt(form.moldeRostroId)} onChange={(e) => set({ moldeRostroId: e.target.value || undefined })}>
            <option value="">—</option>{moldes.map((m) => <option key={m.id} value={m.id}>{m.nombre} ({m.anioPatente})</option>)}
          </Select>
        </Field>
        <Field label="Tipo de cuerpo">
          <Select value={opt(form.tipoCuerpoId)} onChange={(e) => set({ tipoCuerpoId: e.target.value || undefined })}>
            <option value="">—</option>{cuerpos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Tono de piel">
          <Select value={opt(form.tonoPielId)} onChange={(e) => set({ tonoPielId: e.target.value || undefined })}>
            <option value="">—</option>{tonos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Color de ojos">
          <Select value={opt(form.colorOjosId)} onChange={(e) => set({ colorOjosId: e.target.value || undefined })}>
            <option value="">—</option>{colores.filter((c) => c.zona === "Ojos").map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Era histórica">
          <Select value={opt(form.eraId)} onChange={(e) => set({ eraId: e.target.value || undefined })}>
            <option value="">—</option>{eras.map((e2) => <option key={e2.id} value={e2.id}>{e2.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Exclusividad / Label">
          <Select value={opt(form.exclusividadId)} onChange={(e) => set({ exclusividadId: e.target.value || undefined })}>
            <option value="">—</option>{excl.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
