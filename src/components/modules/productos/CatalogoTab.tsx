import { useMemo, useState } from "react";
import type {
  Producto, MoldeRostro, TipoCuerpo, Color, ZonaColor, Era, Exclusividad, Material, Personaje, TipoProducto,
} from "../../../data/types";
import {
  getProductos, getMoldesRostro, getTiposCuerpo, getColores,
  getEras, getExclusividades, getMateriales, getPersonajes, guardar, eliminar, nuevoId,
} from "../../../services/api";
import { NuevoProductoForm } from "./NuevoProductoForm";
import { costoVigente } from "../../../data/costing";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { DataTable, type Column } from "../../ui/DataTable";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import {
  Button, Field, TextInput, Select, SectionHeader, fmtUsd, fmtFecha,
} from "../../ui/primitives";
import { IconPlus, IconEdit, IconTrash, IconDna, IconLock, IconBox } from "../../ui/icons";
import { BarbieConfetti } from "../../ui/Decor";

const tipoLabel: Record<TipoProducto, string> = {
  INDIVIDUAL: "Individual", SET: "Set",
};

const zonaLabel: Record<ZonaColor, string> = {
  PIEL: "Piel", OJOS: "Ojos", CABELLO: "Cabello", LABIOS: "Labios", VESTUARIO: "Vestuario",
};

export function CatalogoTab() {
  const { puedeVerCostos, puede } = useSession();
  const puedeCrear = puede("PRODUCTO", "CREAR");
  const puedeEditar = puede("PRODUCTO", "EDITAR");
  const puedeEliminar = puede("PRODUCTO", "ELIMINAR");
  const { data: productos, setData, loading } = useAsyncData<Producto[]>(getProductos);
  const { data: moldes } = useAsyncData<MoldeRostro[]>(getMoldesRostro);
  const { data: cuerpos } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);
  const { data: colores } = useAsyncData<Color[]>(getColores);
  const { data: eras } = useAsyncData<Era[]>(getEras);
  const { data: excl } = useAsyncData<Exclusividad[]>(getExclusividades);
  const { data: materiales } = useAsyncData<Material[]>(getMateriales);
  const { data: personajes } = useAsyncData<Personaje[]>(getPersonajes);

  const [detail, setDetail] = useState<Producto | null>(null);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [confirm, setConfirm] = useState<Producto | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const lookups = useMemo(() => ({
    molde: (id?: string) => moldes?.find((m) => m.id === id),
    cuerpo: (id?: string) => cuerpos?.find((c) => c.id === id),
    color: (id?: string) => colores?.find((c) => c.id === id),
    era: (id?: string) => eras?.find((e) => e.id === id),
    excl: (id?: string) => excl?.find((e) => e.id === id),
    material: (id?: string) => materiales?.find((m) => m.id === id),
    personaje: (id?: string) => personajes?.find((p) => p.id === id),
  }), [moldes, cuerpos, colores, eras, excl, materiales, personajes]);

  async function handleSave(p: Producto) {
    const isNew = !p.id;
    const saved = await guardar("producto", { ...p, id: p.id || nuevoId("prod") });
    setData((prev) => { const l = prev ?? []; return isNew ? [saved, ...l] : l.map((x) => x.id === saved.id ? saved : x); });
    setEditing(null);
  }
  async function handleDelete(p: Producto) {
    await eliminar("producto", p.id);
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
          <p className="text-xs text-slate-400">{tipoLabel[p.tipo]}{lookups.molde(p.moldeRostroId) ? ` · ${lookups.molde(p.moldeRostroId)!.nombre} ${lookups.molde(p.moldeRostroId)!.patente ?? lookups.molde(p.moldeRostroId)!.anioPatente}` : ""}</p>
        </div>
      ),
    },
    { key: "exclusividad", header: "Exclusividad", sortValue: (p) => lookups.excl(p.exclusividadId)?.nombre ?? "", cell: (p) => <span className="text-sm text-navy-700">{lookups.excl(p.exclusividadId)?.nombre ?? "—"}</span> },
    { key: "disenador", header: "Diseñador", sortValue: (p) => p.disenador ?? "", searchValue: (p) => p.disenador ?? "", cell: (p) => <span className="text-sm text-slate-500">{p.disenador ?? "—"}</span> },
    {
      key: "colores", header: "Colores",
      cell: (p) => p.colores.length === 0 ? <span className="text-slate-300">—</span> : (
        <div className="flex items-center gap-1">
          {p.colores.map((c) => {
            const col = lookups.color(c.colorId);
            return <span key={c.zona + c.colorId} title={`${col?.nombre ?? c.colorId} · ${zonaLabel[c.zona]}`} className="h-4 w-4 rounded-full ring-1 ring-slate-200" style={{ background: col?.hex ?? "#ccc" }} />;
          })}
        </div>
      ),
    },
    { key: "precio", header: "Precio", align: "right", sortValue: (p) => p.precioBaseUsd, cell: (p) => <span className="font-semibold text-navy-700">{fmtUsd(p.precioBaseUsd)}</span> },
    {
      key: "costo", header: "Costo prod.", align: "right", hidden: !puedeVerCostos,
      sortValue: (p) => p.costoProduccionUsd,
      cell: (p) => <span className="font-mono text-sm text-rose-600">{fmtUsd(p.costoProduccionUsd)}</span>,
    },
    { key: "stock", header: "Stock", align: "right", sortValue: (p) => p.stock, cell: (p) => <span className={p.stock < 10 ? "font-bold text-amber-600" : "text-slate-500"}>{p.stock}</span> },
    ...(puedeEditar || puedeEliminar ? [{
      key: "acc", header: "", align: "right" as const,
      cell: (p: Producto) => (
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
        icon={<IconDna className="h-5 w-5" />}
        title="Catálogo de Productos · Genoma Barbie"
        subtitle="Cada SKU es la variante mínima e indivisible. Haz clic en una fila para ver su ficha de ADN completa."
        action={puedeCrear ? <Button onClick={() => setNuevo(true)}><IconPlus className="h-4 w-4" />Nuevo producto</Button> : undefined}
      />
      {!puedeVerCostos && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <IconLock className="h-4 w-4" /> El costo de producción está oculto para tu rol actual (requiere acceso al módulo de Costos).
        </div>
      )}
      <DataTable columns={columns} rows={productos ?? []} rowKey={(p) => p.id} loading={loading} onRowClick={(p) => setDetail(p)} searchPlaceholder="Buscar por SKU o nombre…" emptyTitle="No hay productos" pageSize={8} />

      {detail && <FichaADN producto={detail} lookups={lookups} materiales={materiales ?? []} puedeVerCostos={puedeVerCostos} puedeEditar={puedeEditar} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); }} />}
      {editing && <ProductoForm producto={editing} moldes={moldes ?? []} cuerpos={cuerpos ?? []} colores={colores ?? []} eras={eras ?? []} excl={excl ?? []} personajes={personajes ?? []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <ConfirmDialog open={!!confirm} title="Eliminar producto" message={`¿Eliminar ${confirm?.nombre} (${confirm?.sku})?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && handleDelete(confirm)} />
      {nuevo && <NuevoProductoForm onCancel={() => setNuevo(false)} onSaved={async () => { setNuevo(false); setData(await getProductos()); }} />}
    </div>
  );
}

/* ------------------------------ Ficha ADN ------------------------------ */
function FichaADN({ producto, lookups, materiales, puedeVerCostos, puedeEditar, onClose, onEdit }: {
  producto: Producto; lookups: any; materiales: Material[]; puedeVerCostos: boolean; puedeEditar: boolean; onClose: () => void; onEdit: () => void;
}) {
  const colorEnZona = (z: ZonaColor) => {
    const aplicado = producto.colores.find((c) => c.zona === z);
    return aplicado ? lookups.color(aplicado.colorId) : undefined;
  };
  const molde = lookups.molde(producto.moldeRostroId);
  const cuerpo = lookups.cuerpo(producto.tipoCuerpoId);
  const tono = colorEnZona("PIEL");
  const ojos = colorEnZona("OJOS");
  const era = lookups.era(producto.eraId);
  const exclusividad = lookups.excl(producto.exclusividadId);
  const personaje = lookups.personaje(producto.personajeId);
  const costoVigenteUsd = costoVigente(producto, materiales);
  const deriva = costoVigenteUsd - producto.costoProduccionUsd;

  return (
    <Modal open onClose={onClose} size="lg"
      title="Ficha de ADN del producto"
      subtitle={`${producto.sku} · taxonomía completa`}
      footer={<><Button variant="ghost" onClick={onClose}>Cerrar</Button>{puedeEditar && <Button onClick={onEdit}><IconEdit className="h-4 w-4" />Editar</Button>}</>}
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
        {exclusividad && <div className="relative mt-3"><span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">{exclusividad.nombre}</span></div>}
      </div>

      {/* Cromosomas / atributos */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Chromo label="Molde de Rostro (Face Sculpt)" value={molde ? `${molde.nombre} (${molde.patente ?? molde.anioPatente})` : "—"} />
        <Chromo label="Tipo de Cuerpo" value={cuerpo ? cuerpo.nombre : "—"} />
        <Chromo label="Tono de Piel" value={tono?.nombre ?? "—"} swatch={tono?.hex} />
        <Chromo label="Color de Ojos" value={ojos?.nombre ?? "—"} swatch={ojos?.hex} />
        <Chromo label="Era Histórica" value={era ? `${era.nombre} (${era.fechaInicio}–${era.fechaFin ?? "hoy"})` : "—"} />
        <Chromo label="Exclusividad / Label" value={exclusividad ? exclusividad.nombre : "—"} />
        <Chromo label="Diseño · Patente" value={producto.disenoPatente ?? "—"} />
        <Chromo label="Diseñador (I+D)" value={producto.disenador ?? "—"} hint={producto.adn ? `ADN ${producto.adn}` : undefined} />
      </div>

      {/* Paleta de colores aplicada (todas las zonas) */}
      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
        <p className="mb-3 text-sm font-bold text-navy-700">Colores aplicados (por zona)</p>
        {producto.colores.length === 0 ? (
          <p className="text-sm text-slate-400">Sin colores registrados.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {producto.colores.map((c) => {
              const col = lookups.color(c.colorId);
              return (
                <span key={c.zona + c.colorId} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                  <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-slate-200" style={{ background: col?.hex ?? "#ccc" }} />
                  <span className="text-navy-700">{col?.nombre ?? c.colorId}</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">{zonaLabel[c.zona]}</span>
                </span>
              );
            })}
          </div>
        )}
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
                    {puedeVerCostos && <span className="font-mono text-xs text-rose-600">{fmtUsd(costo)}</span>}
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
        {puedeVerCostos ? (
          <>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-navy-700">Costo de producción <span className="font-normal text-slate-400">(snapshot histórico)</span></span>
              <span className="font-mono font-bold text-rose-600">{fmtUsd(producto.costoProduccionUsd)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">Recalculado a hoy (materiales actuales)</span>
              <span className="font-mono text-slate-500">
                {fmtUsd(costoVigenteUsd)}
                {Math.abs(deriva) > 0.005 && (
                  <span className="ml-1 text-amber-600">· deriva {deriva > 0 ? "+" : ""}{fmtUsd(deriva)}</span>
                )}
              </span>
            </div>
          </>
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
function ProductoForm({ producto, moldes, cuerpos, colores, eras, excl, personajes, onCancel, onSave }: {
  producto: Producto; moldes: MoldeRostro[]; cuerpos: TipoCuerpo[]; colores: Color[];
  eras: Era[]; excl: Exclusividad[]; personajes: Personaje[]; onCancel: () => void; onSave: (p: Producto) => void;
}) {
  const [form, setForm] = useState<Producto>(producto);
  const set = (p: Partial<Producto>) => setForm((f) => ({ ...f, ...p }));
  const opt = (id?: string) => id ?? "";
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try { await onSave(form); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  // El color se aplica por zona (junction Color_Producto). Estos helpers leen/escriben
  // la entrada de `colores` correspondiente a una zona, dejando el resto intacto.
  const colorEnZona = (z: ZonaColor) => form.colores.find((c) => c.zona === z)?.colorId ?? "";
  const setColorZona = (z: ZonaColor, colorId: string) =>
    setForm((f) => {
      const resto = f.colores.filter((c) => c.zona !== z);
      return { ...f, colores: colorId ? [...resto, { colorId, zona: z }] : resto };
    });

  return (
    <Modal open onClose={onCancel} size="lg"
      title="Editar producto"
      subtitle="Edita los datos comerciales. El genoma (ADN) —molde, cuerpo, era, colores— es fijo: cambiarlo implica crear un SKU nuevo."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit}>Guardar cambios</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU"><TextInput value={form.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="BRB-AAAA-XXX" /></Field>
        <Field label="Nombre comercial"><TextInput value={form.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
        <Field label="Precio base (USD)"><TextInput type="number" value={form.precioBaseUsd} onChange={(e) => set({ precioBaseUsd: +e.target.value })} /></Field>
        <Field label="Costo de producción" hint="Calculado desde la receta de materiales"><TextInput type="number" value={form.costoProduccionUsd} disabled /></Field>
        <Field label="Fecha de lanzamiento"><TextInput type="date" value={form.fechaLanzamiento.slice(0, 10)} onChange={(e) => set({ fechaLanzamiento: new Date(e.target.value).toISOString() })} /></Field>
        <Field label="Tipo">
          <Select value={form.tipo} onChange={(e) => set({ tipo: e.target.value as TipoProducto })}>
            {Object.entries(tipoLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Stock" hint="Gestionado por inventario y lotes"><TextInput type="number" value={form.stock} disabled /></Field>
        <Field label="Personaje" hint="Derivado del molde">
          <Select value={opt(form.personajeId)} disabled>
            <option value="">— Ninguno —</option>
            {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </Field>
      </div>

      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-brand-600">
        Taxonomía / ADN <span className="font-normal normal-case text-slate-400">— fijo, solo lectura</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Molde de rostro">
          <Select value={opt(form.moldeRostroId)} disabled>
            <option value="">—</option>{moldes.map((m) => <option key={m.id} value={m.id}>{m.nombre} ({m.patente ?? m.anioPatente})</option>)}
          </Select>
        </Field>
        <Field label="Tipo de cuerpo">
          <Select value={opt(form.tipoCuerpoId)} disabled>
            <option value="">—</option>{cuerpos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Color de piel" hint="Zona PIEL">
          <Select value={colorEnZona("PIEL")} disabled>
            <option value="">—</option>{colores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Color de ojos" hint="Zona OJOS">
          <Select value={colorEnZona("OJOS")} disabled>
            <option value="">—</option>{colores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Era histórica">
          <Select value={opt(form.eraId)} disabled>
            <option value="">—</option>{eras.map((e2) => <option key={e2.id} value={e2.id}>{e2.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Exclusividad / Label">
          <Select value={opt(form.exclusividadId)} onChange={(e) => set({ exclusividadId: e.target.value || undefined })}>
            <option value="">—</option>{excl.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </Select>
        </Field>
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
