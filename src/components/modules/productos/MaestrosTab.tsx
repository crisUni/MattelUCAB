import { useState } from "react";
import type {
  MoldeRostro, TipoCuerpo, TonoPiel, ColorMaestro, Material, Era, Exclusividad,
} from "../../../data/types";
import {
  getMoldesRostro, getTiposCuerpo, getTonosPiel, getColores, getMateriales, getEras, getExclusividades,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { MasterCrud, type FieldDef } from "./MasterCrud";
import { SectionHeader, Badge, LabelChip } from "../../ui/primitives";
import { IconLayers } from "../../ui/icons";

const SUBS = [
  { id: "moldes", label: "Moldes de rostro" },
  { id: "cuerpos", label: "Tipos de cuerpo" },
  { id: "tonos", label: "Tonos de piel" },
  { id: "colores", label: "Colores" },
  { id: "materiales", label: "Materiales (BOM)" },
  { id: "eras", label: "Eras" },
  { id: "exclusividades", label: "Exclusividades" },
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
      {sub === "tonos" && <Tonos />}
      {sub === "colores" && <Colores />}
      {sub === "materiales" && <Materiales />}
      {sub === "eras" && <Eras />}
      {sub === "exclusividades" && <Exclusividades />}
    </div>
  );
}

function Moldes() {
  const { data, setData, loading } = useAsyncData<MoldeRostro[]>(getMoldesRostro);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "anioPatente", label: "Año de patente", type: "number" },
    { key: "descripcion", label: "Descripción" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Molde de rostro" idPrefix="mold" blank={() => ({ id: "", nombre: "", anioPatente: 2024, descripcion: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Molde", sortValue: (m) => m.nombre, searchValue: (m) => m.nombre, cell: (m) => <span className="font-semibold text-navy-700">{m.nombre}</span> },
      { key: "anio", header: "Año patente", align: "center", sortValue: (m) => m.anioPatente, cell: (m) => <Badge tone="navy">{m.anioPatente}</Badge> },
      { key: "desc", header: "Descripción", cell: (m) => <span className="text-sm text-slate-500">{m.descripcion}</span> },
    ]} />;
}

function Cuerpos() {
  const { data, setData, loading } = useAsyncData<TipoCuerpo[]>(getTiposCuerpo);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "formaPie", label: "Forma del pie", type: "select", options: [{ value: "ARQUEADO", label: "Arqueado" }, { value: "PLANO", label: "Plano" }] },
    { key: "articulado", label: "Articulado (true/false)", hint: "Escribe true o false" },
    { key: "descripcion", label: "Descripción" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Tipo de cuerpo" idPrefix="body" blank={(): TipoCuerpo => ({ id: "", nombre: "", descripcion: "", formaPie: "PLANO", articulado: false })} fields={fields}
    columns={[
      { key: "nombre", header: "Cuerpo", sortValue: (c) => c.nombre, searchValue: (c) => c.nombre, cell: (c) => <span className="font-semibold text-navy-700">{c.nombre}</span> },
      { key: "pie", header: "Pie", align: "center", sortValue: (c) => c.formaPie, cell: (c) => <Badge tone={c.formaPie === "ARQUEADO" ? "amber" : "green"}>{c.formaPie === "ARQUEADO" ? "Arqueado" : "Plano"}</Badge> },
      { key: "art", header: "Articulado", align: "center", cell: (c) => c.articulado ? <Badge tone="brand">Sí</Badge> : <span className="text-slate-300">—</span> },
      { key: "desc", header: "Descripción", cell: (c) => <span className="text-sm text-slate-500">{c.descripcion}</span> },
    ]} />;
}

function Tonos() {
  const { data, setData, loading } = useAsyncData<TonoPiel[]>(getTonosPiel);
  const fields: FieldDef[] = [{ key: "nombre", label: "Nombre" }, { key: "hex", label: "Color", type: "color" }];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Tono de piel" idPrefix="skin" blank={() => ({ id: "", nombre: "", hex: "#e0ac90" })} fields={fields}
    columns={[
      { key: "nombre", header: "Tono", sortValue: (t) => t.nombre, searchValue: (t) => t.nombre, cell: (t) => <span className="font-semibold text-navy-700">{t.nombre}</span> },
      { key: "hex", header: "Muestra", cell: (t) => <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-full ring-1 ring-slate-200" style={{ background: t.hex }} /><span className="font-mono text-xs text-slate-400">{t.hex}</span></span> },
    ]} />;
}

function Colores() {
  const { data, setData, loading } = useAsyncData<ColorMaestro[]>(getColores);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" }, { key: "hex", label: "Color", type: "color" },
    { key: "zona", label: "Zona de aplicación", type: "select", options: ["Ojos", "Cabello", "Labios", "Vestuario"].map((z) => ({ value: z, label: z })) },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Color" idPrefix="col" blank={() => ({ id: "", nombre: "", hex: "#e2237c", zona: "Vestuario" })} fields={fields}
    columns={[
      { key: "nombre", header: "Color", sortValue: (c) => c.nombre, searchValue: (c) => `${c.nombre} ${c.zona}`, cell: (c) => <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-full ring-1 ring-slate-200" style={{ background: c.hex }} /><span className="font-semibold text-navy-700">{c.nombre}</span></span> },
      { key: "zona", header: "Zona", sortValue: (c) => c.zona, cell: (c) => <Badge tone="slate">{c.zona}</Badge> },
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
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Material" idPrefix="mat" blank={(): Material => ({ id: "", nombre: "", tipo: "POLIMERO", unidad: "g", costoUnitarioUsd: 0 })} fields={fields}
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
    { key: "nombre", label: "Nombre" }, { key: "rango", label: "Rango de años" }, { key: "descripcion", label: "Descripción" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Era" idPrefix="era" blank={(): Era => ({ id: "", codigo: "MODERN", nombre: "", rango: "", descripcion: "" })} fields={fields}
    columns={[
      { key: "nombre", header: "Era", sortValue: (e) => e.nombre, searchValue: (e) => e.nombre, cell: (e) => <span className="font-semibold text-navy-700">{e.nombre}</span> },
      { key: "rango", header: "Rango", align: "center", cell: (e) => <Badge tone="navy">{e.rango}</Badge> },
      { key: "desc", header: "Descripción", cell: (e) => <span className="text-sm text-slate-500">{e.descripcion}</span> },
    ]} />;
}

function Exclusividades() {
  const { data, setData, loading } = useAsyncData<Exclusividad[]>(getExclusividades);
  const fields: FieldDef[] = [
    { key: "nombre", label: "Nombre" }, { key: "tiradaMax", label: "Tirada máxima (vacío = masiva)", type: "number" }, { key: "descripcion", label: "Descripción" },
  ];
  return <MasterCrud rows={data ?? []} loading={loading} setRows={setData} title="Exclusividad" idPrefix="exc" blank={(): Exclusividad => ({ id: "", codigo: "PINK", nombre: "", tiradaMax: null, descripcion: "" })} fields={fields}
    columns={[
      { key: "label", header: "Label", sortValue: (e) => e.codigo, searchValue: (e) => e.nombre, cell: (e) => <LabelChip codigo={e.codigo} /> },
      { key: "tirada", header: "Tirada máx.", align: "right", sortValue: (e) => e.tiradaMax ?? Infinity, cell: (e) => e.tiradaMax ? <span className="font-semibold text-navy-700">{e.tiradaMax.toLocaleString()}</span> : <Badge tone="green">Masiva</Badge> },
      { key: "desc", header: "Descripción", cell: (e) => <span className="text-sm text-slate-500">{e.descripcion}</span> },
    ]} />;
}
