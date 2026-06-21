import { useMemo, useState } from "react";
import type { MoldeRostro, TipoCuerpo, Era, Exclusividad, Color, Producto } from "../../../data/types";
import {
  getMoldesRostro, getTiposCuerpo, getEras, getExclusividades, getColores,
  getCategoriasOpc, getEdicionesOpc, getLotesOpc, getDisenosOpc, getProfesionesOpc,
  getProductos, crearMuneca, crearSet, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { Modal } from "../../ui/Modal";
import { Button, Field, TextInput, Select } from "../../ui/primitives";

/** Zonas de color válidas según la categoría del producto. */
const ZONAS_POR_CATEGORIA: Record<string, string[]> = {
  "Munecas": ["Piel", "Ojos", "Cabello", "Labios", "Pies"],
  "Vehiculos": ["Carroceria", "Interior", "Ruedas"],
  "Casas (Dreamhouse)": ["Exterior", "Interior", "Techo"],
  "Accesorios": ["Principal", "Detalle"],
  "Ropa y moda": ["Tela", "Detalle"],
  "Mascotas": ["Pelaje", "Ojos"],
  "Coleccionables": ["Acabado"],
  "Juegos": ["Caja"],
  "Figuras": ["Cuerpo", "Base"],
};
const HOY = new Date().toISOString().slice(0, 10);

export function NuevoProductoForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [modo, setModo] = useState<"MUNECA" | "SET">("MUNECA");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [fecha, setFecha] = useState(HOY);

  // genoma + clasificación (muñeca)
  const [molros, setMolros] = useState("");
  const [tipcue, setTipcue] = useState("");
  const [era, setEra] = useState("");
  const [dis, setDis] = useState("");
  const [cat, setCat] = useState("");
  const [edi, setEdi] = useState("");
  const [lote, setLote] = useState("");
  const [exc, setExc] = useState("");
  const [prof, setProf] = useState("");
  const [profAno, setProfAno] = useState(String(new Date().getFullYear()));
  const [colores, setColores] = useState<Record<string, string>>({});

  // set
  const [pro1, setPro1] = useState("");
  const [pro2, setPro2] = useState("");

  const { data: moldes } = useAsyncData<MoldeRostro[]>(getMoldesRostro);
  const { data: cuerpos } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);
  const { data: eras } = useAsyncData<Era[]>(getEras);
  const { data: excl } = useAsyncData<Exclusividad[]>(getExclusividades);
  const { data: cols } = useAsyncData<Color[]>(getColores);
  const { data: categorias } = useAsyncData<Opcion[]>(getCategoriasOpc);
  const { data: ediciones } = useAsyncData<Opcion[]>(getEdicionesOpc);
  const { data: lotes } = useAsyncData<Opcion[]>(getLotesOpc);
  const { data: disenos } = useAsyncData<Opcion[]>(getDisenosOpc);
  const { data: profesiones } = useAsyncData<Opcion[]>(getProfesionesOpc);
  const { data: productos } = useAsyncData<Producto[]>(getProductos);

  const catNombre = useMemo(() => categorias?.find((c) => c.id === cat)?.nombre ?? "", [categorias, cat]);
  const zonas = ZONAS_POR_CATEGORIA[catNombre] ?? ["Principal"];

  async function submit() {
    setError(null);
    try {
      if (!nombre.trim()) throw new Error("Pon un nombre al producto.");
      if (modo === "MUNECA") {
        if (!molros || !tipcue || !era || !dis) throw new Error("Completa el genoma (molde, cuerpo, era y diseño).");
        if (!cat || !edi || !lote || !exc) throw new Error("Completa la clasificación (categoría, exclusividad, edición y lote).");
        setGuardando(true);
        await crearMuneca({
          nombre, precio, fecha, molros, tipcue, era, dis, cat, edi, lote, exc,
          colores: zonas.map((z) => ({ colId: colores[z] ?? "", zona: z })).filter((c) => c.colId),
          profId: prof || undefined, profAno: profAno || undefined,
        });
      } else {
        if (!pro1 || !pro2) throw new Error("Selecciona los dos productos del set.");
        if (pro1 === pro2) throw new Error("El set debe combinar dos productos distintos.");
        setGuardando(true);
        await crearSet(nombre, pro1, pro2);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="lg"
      title="Nuevo producto"
      subtitle="Crea una muñeca (define su genoma, colores y profesión) o un set que agrupe productos compatibles. El SKU y el ADN se generan automáticamente."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Creando…" : "Crear"}</Button></>}
    >
      <div className="mb-4 flex gap-2">
        {(["MUNECA", "SET"] as const).map((m) => (
          <button key={m} onClick={() => setModo(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${modo === m ? "bg-navy-700 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-700"}`}>
            {m === "MUNECA" ? "Muñeca" : "Set / Pack"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={modo === "MUNECA" ? "Barbie Astronauta" : "Set Aventuras"} /></Field>
        <Field label="Precio base (USD)"><TextInput type="number" value={precio} onChange={(e) => setPrecio(+e.target.value)} /></Field>
      </div>

      {modo === "MUNECA" ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de lanzamiento"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
          </div>

          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Genoma (ADN) — molde, cuerpo, era y diseño</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Molde de rostro"><Sel value={molros} set={setMolros} opts={(moldes ?? []).map((m) => ({ id: m.id, nombre: m.nombre }))} /></Field>
            <Field label="Tipo de cuerpo"><Sel value={tipcue} set={setTipcue} opts={(cuerpos ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))} /></Field>
            <Field label="Era histórica"><Sel value={era} set={setEra} opts={(eras ?? []).map((e) => ({ id: e.id, nombre: e.nombre }))} /></Field>
            <Field label="Diseño (patente · diseñador)"><Sel value={dis} set={setDis} opts={disenos ?? []} /></Field>
          </div>

          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Clasificación</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoría" hint="Define las zonas de color"><Sel value={cat} set={setCat} opts={categorias ?? []} /></Field>
            <Field label="Exclusividad"><Sel value={exc} set={setExc} opts={(excl ?? []).map((x) => ({ id: x.id, nombre: x.nombre }))} /></Field>
            <Field label="Edición"><Sel value={edi} set={setEdi} opts={ediciones ?? []} /></Field>
            <Field label="Lote de producción"><Sel value={lote} set={setLote} opts={lotes ?? []} /></Field>
          </div>

          {cat && (
            <>
              <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Colores por zona · {catNombre}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {zonas.map((z) => (
                  <Field key={z} label={z}>
                    <Select value={colores[z] ?? ""} onChange={(e) => setColores((c) => ({ ...c, [z]: e.target.value }))}>
                      <option value="">— Sin color —</option>
                      {(cols ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Select>
                  </Field>
                ))}
              </div>
            </>
          )}

          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Multiverso laboral (opcional)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profesión"><Sel value={prof} set={setProf} opts={profesiones ?? []} placeholder="— Ninguna —" /></Field>
            <Field label="Año de la profesión"><TextInput value={profAno} onChange={(e) => setProfAno(e.target.value)} /></Field>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Productos del set (deben ser compatibles entre sí)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Producto 1"><Sel value={pro1} set={setPro1} opts={(productos ?? []).map((p) => ({ id: p.id, nombre: `${p.sku} · ${p.nombre}` }))} /></Field>
            <Field label="Producto 2"><Sel value={pro2} set={setPro2} opts={(productos ?? []).map((p) => ({ id: p.id, nombre: `${p.sku} · ${p.nombre}` }))} /></Field>
          </div>
        </>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}

function Sel({ value, set, opts, placeholder }: { value: string; set: (v: string) => void; opts: Opcion[]; placeholder?: string }) {
  return (
    <Select value={value} onChange={(e) => set(e.target.value)}>
      <option value="">{placeholder ?? "— Selecciona —"}</option>
      {opts.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
    </Select>
  );
}
