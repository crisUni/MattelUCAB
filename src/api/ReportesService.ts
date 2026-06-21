import { sql } from "bun";
import { CORS_HEADERS } from "./CorsHeaders";
import { renderReportePdf } from "./reportRenderer";

type Col = { key: string; label: string; tipo?: "texto" | "numero" | "dinero" | "pct" };

/** Catálogo de reportes. La lógica vive en funciones SQL (reports.sql). */
const REPORTES: Record<string, { fn: string; titulo: string; descripcion: string; columnas: Col[] }> = {
  sueltas: {
    fn: "reporte_unidades_sueltas",
    titulo: "Costo de unidades sueltas por Hub",
    descripcion: "Costo total de las unidades individuales que quedaron fuera de una Caja Máster (resto módulo 12), por Hub logístico.",
    columnas: [
      { key: "hub", label: "Hub logístico", tipo: "texto" },
      { key: "unidades_sueltas", label: "Unidades sueltas", tipo: "numero" },
      { key: "costo_total", label: "Costo total", tipo: "dinero" },
    ],
  },
  sculpts: {
    fn: "reporte_top_face_sculpts",
    titulo: "Top 3 Face Sculpts por inventario físico",
    descripcion: "Los 3 moldes de rostro con mayor inventario físico actual (que en conjunto superan el 40% del total), con su porcentaje y costo.",
    columnas: [
      { key: "molde", label: "Face Sculpt", tipo: "texto" },
      { key: "patente", label: "Patente", tipo: "texto" },
      { key: "unidades", label: "Unidades", tipo: "numero" },
      { key: "porcentaje", label: "% del total", tipo: "pct" },
      { key: "costo_total", label: "Costo total", tipo: "dinero" },
    ],
  },
  agotado: {
    fn: "reporte_subensamblaje_agotado",
    titulo: "Subensamblaje en SKUs agotados",
    descripcion: "Material/subensamblaje presente en la mayor cantidad de SKUs que actualmente tienen inventario en cero.",
    columnas: [
      { key: "material", label: "Subensamblaje", tipo: "texto" },
      { key: "tipo", label: "Tipo", tipo: "texto" },
      { key: "skus_agotados", label: "SKUs agotados", tipo: "numero" },
    ],
  },
};

class ReportesService {
  routes = {
    "/api/reportes": {
      GET: async (_: Bun.BunRequest<"/api/reportes">) =>
        Response.json(
          Object.entries(REPORTES).map(([id, r]) => ({ id, titulo: r.titulo, descripcion: r.descripcion })),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        ),
    },
    "/api/reportes/:id": {
      GET: async (req: Bun.BunRequest<"/api/reportes/:id">) => {
        const r = REPORTES[req.params.id];
        if (!r) return new Response("Reporte no encontrado", { status: 404, headers: CORS_HEADERS });
        try {
          const filas = await sql.unsafe(`SELECT * FROM ${r.fn}()`) as Record<string, unknown>[];
          return Response.json(
            { id: req.params.id, titulo: r.titulo, descripcion: r.descripcion, columnas: r.columnas, filas },
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        } catch (e) {
          return new Response(String(e), { status: 500, headers: CORS_HEADERS });
        }
      },
    },
    "/api/reportes/:id/pdf": {
      GET: async (req: Bun.BunRequest<"/api/reportes/:id/pdf">) => {
        const r = REPORTES[req.params.id];
        if (!r) return new Response("Reporte no encontrado", { status: 404, headers: CORS_HEADERS });
        try {
          const filas = await sql.unsafe(`SELECT * FROM ${r.fn}()`) as Record<string, unknown>[];
          const pdf = await renderReportePdf({ titulo: r.titulo, descripcion: r.descripcion, columnas: r.columnas, filas });
          return new Response(pdf, {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="reporte-${req.params.id}.pdf"` },
          });
        } catch (e) {
          return new Response(String(e), { status: 500, headers: CORS_HEADERS });
        }
      },
    },
  };
}

export default new ReportesService();
