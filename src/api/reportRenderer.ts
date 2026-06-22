import jsreport from "@jsreport/jsreport-core";
import chromePdf from "@jsreport/jsreport-chrome-pdf";
import handlebars from "@jsreport/jsreport-handlebars";

type Col = { key: string; label: string; tipo?: "texto" | "numero" | "dinero" | "pct" };
export type ReportePayload = { titulo: string; descripcion: string; columnas: Col[]; filas: Record<string, unknown>[] };

let instancePromise: Promise<any> | null = null;

/** jsreport se inicializa una sola vez (singleton) y usa el Chromium del sistema. */
function getInstance(): Promise<any> {
  if (!instancePromise) {
    const r = (jsreport as any)({
      discover: false,
      store: { provider: "memory" },
      logger: { console: { transport: "console", level: "error" } },
    });
    r.use((chromePdf as any)({
      launchOptions: {
        executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      },
    }));
    r.use((handlebars as any)());
    instancePromise = r.init().then(() => r);
  }
  return instancePromise!;
}

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function fmt(val: unknown, tipo?: Col["tipo"]): string {
  if (val == null || val === "") return "—";
  if (tipo === "dinero") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(val));
  if (tipo === "pct") return `${Number(val).toFixed(2)}%`;
  if (tipo === "numero") return Number(val).toLocaleString("en-US");
  return esc(val);
}

function buildHtml(r: ReportePayload): string {
  const fecha = new Date().toLocaleString("es-VE");
  const ths = r.columnas
    .map((c, i) => `<th style="text-align:${i === 0 ? "left" : "right"}">${esc(c.label)}</th>`)
    .join("");
  const rows = r.filas.length === 0
    ? `<tr><td colspan="${r.columnas.length}" style="text-align:center;color:#888;padding:18px">Sin datos</td></tr>`
    : r.filas
        .map((row) => `<tr>${r.columnas
          .map((c, i) => `<td style="text-align:${i === 0 ? "left" : "right"}">${fmt(row[c.key], c.tipo)}</td>`)
          .join("")}</tr>`)
        .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{font-family:Arial,Helvetica,sans-serif}
    body{color:#1f2a44;margin:0}
    .head{background:#e2237c;color:#fff;padding:18px 24px}
    .head h1{margin:0;font-size:18px}
    .head p{margin:2px 0 0;font-size:11px;opacity:.9}
    .meta{padding:6px 24px;font-size:11px;color:#666}
    .desc{padding:0 24px 8px;font-size:12px;color:#444}
    table{width:calc(100% - 48px);margin:0 24px;border-collapse:collapse;font-size:12px}
    th{background:#f4f4f7;color:#555;padding:8px;border-bottom:2px solid #e2237c;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
    td{padding:7px 8px;border-bottom:1px solid #eee}
    tr:nth-child(even) td{background:#fafafa}
  </style></head><body>
    <div class="head"><h1>MattelUCAB · ${esc(r.titulo)}</h1><p>Sistema Dream Legacy — Reporte</p></div>
    <div class="meta">Generado: ${esc(fecha)}</div>
    <div class="desc">${esc(r.descripcion)}</div>
    <table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
}

/** Renderiza un reporte a PDF con jsreport (recipe chrome-pdf). */
export async function renderReportePdf(r: ReportePayload): Promise<Buffer> {
  const inst = await getInstance();
  const out = await inst.render({
    template: {
      content: buildHtml(r),
      engine: "handlebars",
      recipe: "chrome-pdf",
      chrome: { marginTop: "1cm", marginBottom: "1cm", marginLeft: "0.6cm", marginRight: "0.6cm", printBackground: true },
    },
  });
  return out.content as Buffer;
}
