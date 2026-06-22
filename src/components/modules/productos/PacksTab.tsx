import { useState } from "react";
import type { Pack, Producto } from "../../../data/types";
import {
  getPacks, getProductos, crearSet, eliminarSet,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { Card, Badge, Button, Field, TextInput, Select, SectionHeader, Skeleton, fmtUsd } from "../../ui/primitives";
import { IconEdit, IconBox, IconPlus, IconTrash } from "../../ui/icons";

export function PacksTab() {
  const { puede } = useSession();
  const puedeCrear = puede("PRODUCTO", "CREAR");
  const puedeEditar = puede("PRODUCTO", "EDITAR");
  const puedeEliminar = puede("PRODUCTO", "ELIMINAR");
  const { data: packs, setData, loading } = useAsyncData<Pack[]>(getPacks);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const [formOpen, setFormOpen] = useState<{ pack?: Pack } | null>(null);
  const [confirm, setConfirm] = useState<Pack | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prod = (id: string) => productos?.find((p) => p.id === id);
  const recargar = async () => setData(await getPacks());

  async function borrar(pk: Pack) {
    setError(null);
    try {
      const pairs = pk._proPairs ?? [[pk.productosIds[0], pk.productosIds[1]]];
      await Promise.all(pairs.map(([p1, p2]) => eliminarSet(p1, p2)));
      setConfirm(null);
      await recargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setConfirm(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconBox className="h-5 w-5" />} title="Packs / Sets de Regalo"
        subtitle="Agrupan varios productos (ej. 1 Barbie + 1 Ken + 1 Auto) bajo un único SKU."
        action={puedeCrear ? <Button onClick={() => setFormOpen({})}><IconPlus className="h-4 w-4" />Nuevo pack</Button> : undefined}
      />
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(packs ?? []).map((pk) => {
            const items = pk.productosIds.map(prod).filter(Boolean) as Producto[];
            const suma = items.reduce((s, p) => s + p.precioBaseUsd, 0);
            return (
              <Card key={pk.id} className="overflow-hidden">
                <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-brand-500 to-grape-500 p-4 text-white">
                  <p className="text-lg font-bold">{pk.nombre}</p>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold">{fmtUsd(pk.precioUsd)}</p>
                    <p className="text-xs text-white/80">suma de productos</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-1.5">
                    {items.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 text-navy-700"><span className="font-mono text-xs text-brand-600">{p.sku}</span>{p.nombre}</span>
                        <span className="text-slate-500">{fmtUsd(p.precioBaseUsd)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <Badge tone="navy">{items.length} productos</Badge>
                    <span className="text-slate-400">Suma individual: <span className="font-semibold text-navy-700">{fmtUsd(suma)}</span></span>
                  </div>
                  {(puedeEditar || puedeEliminar) && (
                    <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3">
                      {puedeEditar && <button title="Editar" onClick={() => setFormOpen({ pack: pk })} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy-700"><IconEdit className="h-4 w-4" /></button>}
                      {puedeEliminar && <button title="Eliminar" onClick={() => setConfirm(pk)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><IconTrash className="h-4 w-4" /></button>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <PackForm
          pack={formOpen.pack}
          productos={productos ?? []}
          onCancel={() => setFormOpen(null)}
          onSaved={async () => { setFormOpen(null); await recargar(); }}
        />
      )}
      <ConfirmDialog open={!!confirm} title="Eliminar pack" message={`¿Eliminar el pack "${confirm?.nombre}"?`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && borrar(confirm)} />
    </div>
  );
}

function PackForm({ pack, productos, onCancel, onSaved }: { pack?: Pack; productos: Producto[]; onCancel: () => void; onSaved: () => void }) {
  const esNuevo = !pack;
  const [nombre, setNombre] = useState(pack?.nombre ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initPairs = esNuevo
    ? [["", ""] as [string, string]]
    : (pack!._proPairs ?? [[pack!.productosIds[0], pack!.productosIds[1]] as [string, string]]);
  const [pairs, setPairs] = useState<[string, string][]>(initPairs);

  function setPair(i: number, slot: 0 | 1, v: string) {
    setPairs((prev) => {
      const n = [...prev];
      n[i] = [...n[i]] as [string, string];
      n[i][slot] = v;
      return n;
    });
  }

  function addPair() {
    setPairs((prev) => [...prev, ["", ""] as [string, string]]);
  }

  function removePair(i: number) {
    setPairs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function prodOpc(p: Producto) {
    return { id: p.id, label: `${p.sku} — ${p.nombre}` };
  }

  async function submit() {
    setError(null);
    if (!nombre.trim()) { setError("El nombre del pack es obligatorio."); return; }
    const filled = pairs.flat();
    if (filled.length < 2 || filled.filter(Boolean).length < 2) { setError("Completa al menos un par de productos."); return; }
    if (filled.some((p) => !p)) { setError("Todos los productos deben estar seleccionados."); return; }
    for (const [a, b] of pairs) {
      if (a === b) { setError(`El par "${a}" tiene productos repetidos.`); return; }
    }
    setGuardando(true);
    try {
      if (esNuevo) {
        await Promise.all(pairs.map(([a, b]) => crearSet(nombre.trim(), a, b)));
      } else {
        const oldPairs = pack!._proPairs ?? [[pack!.productosIds[0], pack!.productosIds[1]] as [string, string]];
        await Promise.all(oldPairs.map(([a, b]) => eliminarSet(a, b)));
        await Promise.all(pairs.map(([a, b]) => crearSet(nombre.trim(), a, b)));
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} title={esNuevo ? "Nuevo pack" : "Editar pack"}
      subtitle="Cada par de productos forma un set de regalo."
      footer={<>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={submit} disabled={guardando}>{guardando ? "Guardando…" : esNuevo ? "Crear" : "Guardar"}</Button>
      </>}
    >
      <div className="grid gap-4">
        <Field label="Nombre del pack"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Barbie & Ken Set" /></Field>
        {pairs.map(([a, b], i) => (
          <Field key={i} label={`Par ${i + 1}`}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={a} onChange={(e) => setPair(i, 0, e.target.value)}>
                  <option value="">— Producto 1 —</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{prodOpc(p).label}</option>)}
                </Select>
              </div>
              <span className="text-slate-300">+</span>
              <div className="flex-1">
                <Select value={b} onChange={(e) => setPair(i, 1, e.target.value)}>
                  <option value="">— Producto 2 —</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{prodOpc(p).label}</option>)}
                </Select>
              </div>
              {pairs.length > 1 && (
                <button title="Quitar par" onClick={() => removePair(i)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                  <IconTrash className="h-4 w-4" />
                </button>
              )}
            </div>
          </Field>
        ))}
        <Button variant="ghost" onClick={addPair}><IconPlus className="h-4 w-4" />Añadir par</Button>
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
