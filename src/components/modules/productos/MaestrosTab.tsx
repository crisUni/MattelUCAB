import { useState } from "react";
import type {
  MoldeRostro, TipoCuerpo, Color, Material, Era, Exclusividad,
} from "../../../data/types";
import {
  getMoldesRostro, getTiposCuerpo, getColores, getMateriales, getEras, getExclusividades,
  getCategoriasOpc, getEdicionesOpc, getProfesionesOpc,
  type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { MasterCrud, type FieldDef } from "./MasterCrud";
import { SectionHeader, Badge } from "../../ui/primitives";
import { IconLayers } from "../../ui/icons";

const SUBS = [
  { id: "moldes", label: "Moldes de rostro" },
  { id: "cuerpos", label: "Tipos de cuerpo" },
  { id: "colores", label: "Colores" },
  { id: "materiales", label: "Materiales (BOM)" },
  { id: "eras", label: "Eras" },
  { id: "categorias", label: "Categorías" },
  { id: "ediciones", label: "Ediciones" },
  { id: "exclusividades", label: "Exclusividades" },
  { id: "profesiones", label: "Profesiones" },
];

export function MaestrosTab() {
  const [sub, setSub] = useState("moldes");
  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconLayers className="h-5 w-5" />} title="Catálogos Maestros" subtitle="Las piezas reutilizables del genoma: moldes, cuerpos, colores, materiales, eras y exclusividades." />
      <div className="mb-5 flex flex-wrap gap-2">
        {SUBS.map((s) => (
          <button key={s.id} onClick={() => setSub(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${sub === s.id ? "bg-navy-700 text-white shadow-soft" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-700"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {sub === "moldes" && <Moldes />}
      {sub === "cuerpos" && <Cuerpos />}
      {sub === "colores" && <Colores />}
      {sub === "materiales" && <Materiales />}
      {sub === "eras" && <Eras />}
      {sub === "categorias" && <Categorias />}
      {sub === "ediciones" && <Ediciones />}
      {sub === "exclusividades" && <Exclusividades />}
      {sub === "profesiones" && <Profesiones />}
    </div>
  );
}

function Categorias() {
  const { data, setData, loading } = useAsyncData<Opcion[]>(getCategoriasOpc);
  const fields: FieldDef[] = [{ key: "nombre", label: "Descripción" }];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Categoría" idPrefix="cat" resource="categoria_producto" permRecurso="PRODUCTO" blank={(): Opcion => ({ id: "", nombre: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Categoría", sortValue: (c) => c.nombre, searchValue: (c) => c.nombre, cell: (c) => <span className="font-semibold text-navy-700">{c.nombre}</span> },
    ]} />;
}

function Ediciones() {
  const { data, setData, loading } = useAsyncData<Opcion[]>(getEdicionesOpc);
  const fields: FieldDef[] = [{ key: "nombre", label: "Nombre de la edición" }];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Edición" idPrefix="edi" resource="edicion" permRecurso="PRODUCTO" blank={(): Opcion => ({ id: "", nombre: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Edición", sortValue: (e) => e.nombre, searchValue: (e) => e.nombre, cell: (e) => <span className="font-semibold text-navy-700">{e.nombre}</span> },
    ]} />;
}

function Profesiones() {
  const { data, setData, loading } = useAsyncData<Opcion[]>(getProfesionesOpc);
  const fields: FieldDef[] = [{ key: "nombre", label: "Nombre de la profesión" }];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Profesión" idPrefix="prof" resource="profesion" permRecurso="PROFESION" blank={(): Opcion => ({ id: "", nombre: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Profesión", sortValue: (p) => p.nombre, searchValue: (p) => p.nombre, cell: (p) => <span className="font-semibold text-navy-700">{p.nombre}</span> },
    ]} />;
}

function Moldes() {
  const { data, setData, loading } = useAsyncData<MoldeRostro[]>(getMoldesRostro);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "patente", label: "Código de patente", hint: "ER: Molde_Patente (ej. PAT-MOL-001)" },
    { key: "anioPatente", label: "Año de patente", type: "number", hint: "Ej. 1991 (Mackie)" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Molde de rostro" idPrefix="mold" resource="molde_rostro" permRecurso="MOLDE_ROSTRO" blank={() => ({ id: "", nombre: "", anioPatente: new Date().getFullYear(), patente: "", descripcion: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Molde", sortValue: (m) => m.nombre, searchValue: (m) => `${m.nombre} ${m.patente ?? ""}`, cell: (m) => <span className="font-semibold text-navy-700">{m.nombre}</span> },
      { key: "patente", header: "Patente", align: "center", sortValue: (m) => m.patente ?? "", cell: (m) => <Badge tone="navy">{m.patente ?? "—"}</Badge> },
      { key: "anio", header: "Año", align: "center", sortValue: (m) => m.anioPatente, cell: (m) => <span className="text-slate-500">{m.anioPatente || "—"}</span> },
    ]} />;
}

function Cuerpos() {
  const { data, setData, loading } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);
  const fields: FieldDef[] = [{ key: "nombre", label: "Nombre" }];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Tipo de cuerpo" idPrefix="body" resource="tipo_cuerpo" permRecurso="TIPO_CUERPO" blank={(): TipoCuerpo => ({ id: "", nombre: "", descripcion: "", formaPie: "PLANO", articulado: false })} fields={fields}
    columns={[
      { key: "nombre", header: "Tipo de cuerpo", sortValue: (c) => c.nombre, searchValue: (c) => c.nombre, cell: (c) => <span className="font-semibold text-navy-700">{c.nombre}</span> },
    ]} />;
}

function Colores() {
  const { data, setData, loading } = useAsyncData<Color[]>(getColores);
  // La zona de aplicación NO vive en el color: se asigna al producto (Producto.colores).
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" }, { key: "hex", label: "Color", type: "color" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Color" idPrefix="col" resource="color" permRecurso="COLOR" blank={() => ({ id: "", nombre: "", hex: "#e2237c" })} fields={fields}
    columns={[
      { key: "nombre", header: "Color", sortValue: (c) => c.nombre, searchValue: (c) => c.nombre, cell: (c) => <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-full ring-1 ring-slate-200" style={{ background: c.hex }} /><span className="font-semibold text-navy-700">{c.nombre}</span></span> },
      { key: "hex", header: "Hex", align: "right", cell: (c) => <span className="font-mono text-xs text-slate-400">{c.hex}</span> },
    ]} />;
}

function Materiales() {
  const { data, setData, loading } = useAsyncData<Material[]>(getMateriales);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "tipo", label: "Tipo", type: "select", options: ["POLIMERO", "TEXTIL", "MECANISMO", "PINTURA", "METAL"].map((t) => ({ value: t, label: t })) },
    { key: "unidad", label: "Unidad", hint: "g, cm², ml, unidad" },
    { key: "costoUnitarioUsd", label: "Costo unitario (USD)", type: "number" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Material" idPrefix="mat" resource="material" permRecurso="MATERIAL" blank={(): Material => ({ id: "", nombre: "", tipo: "POLIMERO", unidad: "g", costoUnitarioUsd: 0 })} fields={fields}
    columns={[
      { key: "nombre", header: "Material", sortValue: (m) => m.nombre, searchValue: (m) => `${m.nombre} ${m.tipo}`, cell: (m) => <span className="font-semibold text-navy-700">{m.nombre}</span> },
      { key: "tipo", header: "Tipo", sortValue: (m) => m.tipo, cell: (m) => <Badge tone="navy">{m.tipo}</Badge> },
      { key: "unidad", header: "Unidad", align: "center", cell: (m) => <span className="text-slate-500">{m.unidad}</span> },
      { key: "costo", header: "Costo unit.", align: "right", sortValue: (m) => m.costoUnitarioUsd, cell: (m) => <span className="font-mono text-sm text-rose-600">${m.costoUnitarioUsd.toFixed(3)}</span> },
    ]} />;
}

function Eras() {
  const { data, setData, loading } = useAsyncData<Era[]>(getEras);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "fechaInicio", label: "Año de inicio", type: "number" },
    { key: "fechaFin", label: "Año de fin (vacío = en curso)", type: "number" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Era" idPrefix="era" resource="era_historico" permRecurso="ERA" blank={(): Era => ({ id: "", nombre: "", fechaInicio: new Date().getFullYear(), fechaFin: null, descripcion: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Era", sortValue: (e) => e.nombre, searchValue: (e) => e.nombre, cell: (e) => <span className="font-semibold text-navy-700">{e.nombre}</span> },
      { key: "inicio", header: "Inicio", align: "center", sortValue: (e) => e.fechaInicio, cell: (e) => <span className="text-slate-600">{e.fechaInicio}</span> },
      { key: "fin", header: "Fin", align: "center", sortValue: (e) => e.fechaFin ?? Infinity, cell: (e) => <span className="text-slate-600">{e.fechaFin ?? "en curso"}</span> },
    ]} />;
}

function Exclusividades() {
  const { data, setData, loading } = useAsyncData<Exclusividad[]>(getExclusividades);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" }, { key: "tiradaMax", label: "Tirada máxima (vacío = masiva)", type: "number" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Exclusividad" idPrefix="exc" resource="exclusividad" permRecurso="EXCLUSIVIDAD" blank={(): Exclusividad => ({ id: "", codigo: "PINK", nombre: "", tiradaMax: null })} fields={fields}
    columns={[
      { key: "nombre", header: "Exclusividad", sortValue: (e) => e.nombre, searchValue: (e) => e.nombre, cell: (e) => <span className="font-semibold text-navy-700">{e.nombre}</span> },
      { key: "tirada", header: "Límite de producción", align: "right", sortValue: (e) => e.tiradaMax ?? Infinity, cell: (e) => e.tiradaMax ? <span className="font-semibold text-navy-700">{e.tiradaMax.toLocaleString()}</span> : <Badge tone="green">Masiva</Badge> },
    ]} />;
}
