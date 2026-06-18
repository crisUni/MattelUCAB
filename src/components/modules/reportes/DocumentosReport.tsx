import { useState } from "react";
import { ReportFrame } from "./ReportFrame";
import { Badge, fmtUsd } from "../../ui/primitives";

const UNIDADES_POR_CAJA = 12; // 1 caja máster = 12 muñecas

const DOCS = [
  { id: "b2b", label: "Orden de Compra B2B" },
  { id: "b2c", label: "Factura Comercial B2C" },
  { id: "inv", label: "Movimientos de Inventario" },
];

export function DocumentosReport() {
  const [doc, setDoc] = useState("b2b");
  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap gap-2">
        {DOCS.map((d) => (
          <button key={d.id} onClick={() => setDoc(d.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${doc === d.id ? "bg-navy-700 text-white shadow-soft" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-700"}`}>
            {d.label}
          </button>
        ))}
      </div>
      {doc === "b2b" && <OrdenB2B />}
      {doc === "b2c" && <FacturaB2C />}
      {doc === "inv" && <Inventario />}
    </div>
  );
}

/* ----------------------------- Orden B2B ----------------------------- */
function OrdenB2B() {
  const items = [
    { sku: "BRB-2015-FA", nombre: "Fashionistas Curvy", cajas: 40, precioCaja: 124.7 },
    { sku: "BRB-2024-DATA", nombre: "Científica de Datos", cajas: 25, precioCaja: 163.1 },
    { sku: "BRB-2018-MTM", nombre: "Made-to-Move Yoga", cajas: 15, precioCaja: 143.9 },
  ];
  const subtotal = items.reduce((s, i) => s + i.cajas * i.precioCaja, 0);
  return (
    <ReportFrame codigo="DOC-B2B-01" titulo="Orden de Compra B2B" subtitulo="Mayorista corporativo" meta={`1 caja máster = ${UNIDADES_POR_CAJA} unidades · términos de crédito Net-30.`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <DocBlock title="Cliente mayorista">
          <p className="font-semibold text-navy-700">Jugueterías El Mundo, C.A.</p>
          <p className="text-sm text-slate-500">RIF: J-30456789-0</p>
          <p className="text-sm text-slate-500">Av. Libertador, Caracas</p>
          <p className="text-sm text-slate-500">Ejecutivo: Carlos Pérez</p>
        </DocBlock>
        <DocBlock title="Términos comerciales">
          <Row k="Condición de pago" v="Net-30 (crédito 30 días)" />
          <Row k="Incoterm" v="FOB Almacén Caracas" />
          <Row k="N° de orden" v="OC-2026-0481" />
          <Row k="Validez" v="15 días" />
        </DocBlock>
      </div>

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2">SKU</th><th className="py-2 pr-2">Producto</th>
            <th className="py-2 pr-2 text-right">Cajas máster</th>
            <th className="py-2 pr-2 text-right">Unidades</th>
            <th className="py-2 pr-2 text-right">Precio/caja</th>
            <th className="py-2 pr-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.sku} className="border-b border-slate-100">
              <td className="py-2.5 pr-2 font-mono text-xs text-brand-600">{i.sku}</td>
              <td className="py-2.5 pr-2 text-navy-700">{i.nombre}</td>
              <td className="py-2.5 pr-2 text-right">{i.cajas}</td>
              <td className="py-2.5 pr-2 text-right text-slate-500">{i.cajas * UNIDADES_POR_CAJA}</td>
              <td className="py-2.5 pr-2 text-right text-slate-500">{fmtUsd(i.precioCaja)}</td>
              <td className="py-2.5 pr-2 text-right font-semibold text-navy-700">{fmtUsd(i.cajas * i.precioCaja)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Totales filas={[["Subtotal", subtotal], ["Descuento volumen (8%)", -subtotal * 0.08], ["Total a crédito", subtotal * 0.92]]} />
    </ReportFrame>
  );
}

/* ---------------------------- Factura B2C ---------------------------- */
function FacturaB2C() {
  const items = [
    { sku: "BRB-2024-DATA", nombre: "Científica de Datos", cant: 1, precio: 16.99 },
    { sku: "ACC-VES-CUR-01", nombre: "Vestido de gala (Curvy)", cant: 2, precio: 6.99 },
    { sku: "VEH-CONV-2020", nombre: "Convertible Rosa 2020", cant: 1, precio: 24.99 },
  ];
  const subtotal = items.reduce((s, i) => s + i.cant * i.precio, 0);
  const descMembresia = subtotal * 0.1; // Coleccionista Gold 10%
  const base = subtotal - descMembresia;
  const iva = base * 0.16;
  const envio = 5.99;
  const total = base + iva + envio;
  return (
    <ReportFrame codigo="DOC-B2C-02" titulo="Factura Comercial B2C" subtitulo="Cliente minorista" meta="Incluye IVA (16%), descuento por membresía y costo de envío.">
      <div className="grid gap-4 sm:grid-cols-2">
        <DocBlock title="Cliente">
          <p className="font-semibold text-navy-700">Valentina Ruiz</p>
          <p className="text-sm text-slate-500">C.I.: V-25.789.123</p>
          <p className="text-sm text-slate-500">Membresía: <Badge tone="gold">Coleccionista Gold</Badge></p>
        </DocBlock>
        <DocBlock title="Factura">
          <Row k="N° factura" v="F-2026-118245" />
          <Row k="Fecha" v={new Date().toLocaleDateString("es-VE")} />
          <Row k="Forma de pago" v="Tarjeta de crédito" />
        </DocBlock>
      </div>

      <table className="mt-5 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2">Producto</th><th className="py-2 pr-2 text-right">Cant.</th>
            <th className="py-2 pr-2 text-right">P. unit.</th><th className="py-2 pr-2 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.sku} className="border-b border-slate-100">
              <td className="py-2.5 pr-2"><span className="text-navy-700">{i.nombre}</span><span className="ml-2 font-mono text-xs text-slate-400">{i.sku}</span></td>
              <td className="py-2.5 pr-2 text-right">{i.cant}</td>
              <td className="py-2.5 pr-2 text-right text-slate-500">{fmtUsd(i.precio)}</td>
              <td className="py-2.5 pr-2 text-right font-semibold text-navy-700">{fmtUsd(i.cant * i.precio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Totales filas={[["Subtotal", subtotal], ["Descuento membresía Gold (10%)", -descMembresia], ["IVA (16%)", iva], ["Envío", envio], ["Total a pagar", total]]} />
    </ReportFrame>
  );
}

/* -------------------------- Inventario ------------------------------- */
function Inventario() {
  const movs = [
    { fecha: "2026-06-01", tipo: "ENTRADA", sku: "BRB-2024-DATA", cajas: 50, motivo: "Producción lote #4471" },
    { fecha: "2026-06-03", tipo: "SALIDA", sku: "BRB-2024-DATA", cajas: -12, motivo: "Despacho OC-2026-0481" },
    { fecha: "2026-06-05", tipo: "ENTRADA", sku: "BRB-2015-FA", cajas: 80, motivo: "Producción lote #4472" },
    { fecha: "2026-06-08", tipo: "SALIDA", sku: "BRB-2015-FA", cajas: -40, motivo: "Venta mayorista" },
    { fecha: "2026-06-10", tipo: "AJUSTE", sku: "VEH-CONV-2020", cajas: -2, motivo: "Merma por daño" },
  ];
  return (
    <ReportFrame codigo="DOC-INV-03" titulo="Reporte de Inventario" subtitulo="Entradas, salidas y conversión" meta={`Factor de conversión: 1 caja máster = ${UNIDADES_POR_CAJA} muñecas.`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2">Fecha</th><th className="py-2 pr-2">Movimiento</th>
            <th className="py-2 pr-2">SKU</th>
            <th className="py-2 pr-2 text-right">Cajas</th>
            <th className="py-2 pr-2 text-right">Unidades</th>
            <th className="py-2 pr-2">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movs.map((m, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-2.5 pr-2 text-slate-500">{m.fecha}</td>
              <td className="py-2.5 pr-2"><Badge tone={m.tipo === "ENTRADA" ? "green" : m.tipo === "SALIDA" ? "navy" : "amber"}>{m.tipo}</Badge></td>
              <td className="py-2.5 pr-2 font-mono text-xs text-brand-600">{m.sku}</td>
              <td className={`py-2.5 pr-2 text-right font-semibold ${m.cajas < 0 ? "text-rose-600" : "text-emerald-600"}`}>{m.cajas > 0 ? "+" : ""}{m.cajas}</td>
              <td className={`py-2.5 pr-2 text-right ${m.cajas < 0 ? "text-rose-500" : "text-emerald-500"}`}>{m.cajas > 0 ? "+" : ""}{m.cajas * UNIDADES_POR_CAJA}</td>
              <td className="py-2.5 pr-2 text-slate-500">{m.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportFrame>
  );
}

/* ------------------------------ Helpers ------------------------------ */
function DocBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 py-0.5 text-sm"><span className="text-slate-400">{k}</span><span className="font-medium text-navy-700">{v}</span></div>;
}
function Totales({ filas }: { filas: [string, number][] }) {
  return (
    <div className="mt-4 flex justify-end">
      <div className="w-full max-w-xs space-y-1">
        {filas.map(([k, v], i) => {
          const last = i === filas.length - 1;
          return (
            <div key={k} className={`flex justify-between ${last ? "border-t border-slate-200 pt-2 text-base font-extrabold text-navy-700" : "text-sm text-slate-500"}`}>
              <span>{k}</span>
              <span className={v < 0 ? "text-rose-600" : ""}>{fmtUsd(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
