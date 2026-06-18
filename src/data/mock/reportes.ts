import type {
  RentabilidadADN,
  DiversidadFila,
  ActividadSospechosa,
} from "../types";

/** Reporte 1 — Ranking de moldes de rostro más rentables del año fiscal. */
export const rentabilidadADN: RentabilidadADN[] = [
  { moldeId: "mold-millie", molde: "Millie", anioPatente: 2015, unidadesVendidas: 482000, ingresoUsd: 8190000, costoUsd: 1975000, margenUsd: 6215000, margenPct: 75.9 },
  { moldeId: "mold-superstar", molde: "Superstar", anioPatente: 1977, unidadesVendidas: 311000, ingresoUsd: 2643000, costoUsd: 653000, margenUsd: 1990000, margenPct: 75.3 },
  { moldeId: "mold-mackie", molde: "Mackie", anioPatente: 1991, unidadesVendidas: 14500, ingresoUsd: 2102000, costoUsd: 406000, margenUsd: 1696000, margenPct: 80.7 },
  { moldeId: "mold-lea", molde: "Lea", anioPatente: 2010, unidadesVendidas: 198000, ingresoUsd: 3360000, costoUsd: 1881000, margenUsd: 1479000, margenPct: 44.0 },
  { moldeId: "mold-goddess", molde: "Goddess", anioPatente: 1999, unidadesVendidas: 9200, ingresoUsd: 690000, costoUsd: 165600, margenUsd: 524400, margenPct: 76.0 },
  { moldeId: "mold-steffie", molde: "Steffie", anioPatente: 1972, unidadesVendidas: 42000, ingresoUsd: 252000, costoUsd: 67200, margenUsd: 184800, margenPct: 73.3 },
  { moldeId: "mold-vintage", molde: "Vintage Ponytail", anioPatente: 1959, unidadesVendidas: 5200, ingresoUsd: 187000, costoUsd: 46800, margenUsd: 140200, margenPct: 75.0 },
];

/** Reporte 2 — Matriz de representación demográfica (% producidas vs vendidas). */
export const diversidad: DiversidadFila[] = [
  // Tono de piel
  { categoria: "Claro", dimension: "TONO_PIEL", producidasPct: 38, vendidasPct: 33, unidadesProducidas: 532000 },
  { categoria: "Medio", dimension: "TONO_PIEL", producidasPct: 24, vendidasPct: 26, unidadesProducidas: 336000 },
  { categoria: "Bronceado", dimension: "TONO_PIEL", producidasPct: 18, vendidasPct: 20, unidadesProducidas: 252000 },
  { categoria: "Oscuro", dimension: "TONO_PIEL", producidasPct: 16, vendidasPct: 18, unidadesProducidas: 224000 },
  { categoria: "Fantasía", dimension: "TONO_PIEL", producidasPct: 4, vendidasPct: 3, unidadesProducidas: 56000 },
  // Tipo de cuerpo
  { categoria: "Original", dimension: "TIPO_CUERPO", producidasPct: 61, vendidasPct: 58, unidadesProducidas: 854000 },
  { categoria: "Curvy", dimension: "TIPO_CUERPO", producidasPct: 17, vendidasPct: 19, unidadesProducidas: 238000 },
  { categoria: "Tall", dimension: "TIPO_CUERPO", producidasPct: 12, vendidasPct: 13, unidadesProducidas: 168000 },
  { categoria: "Petite", dimension: "TIPO_CUERPO", producidasPct: 7, vendidasPct: 7, unidadesProducidas: 98000 },
  { categoria: "Made-to-Move", dimension: "TIPO_CUERPO", producidasPct: 3, vendidasPct: 3, unidadesProducidas: 42000 },
];

/** Reporte 3 — Monitor de actividad sospechosa (scalpers). */
export const actividadSospechosa: ActividadSospechosa[] = [
  { id: "sus-1", usuario: "reseller_x99", patron: "ACAPARAMIENTO", referencia: "BRB-1991-MK (Platinum)", detalle: "5 unidades · 5 tarjetas distintas · misma dirección de envío", riesgo: "ALTO", fecha: "2026-05-12T09:01:00Z" },
  { id: "sus-2", usuario: "fast_buyer_07", patron: "VELOCIDAD", referencia: "BRB-1999-GOD (Platinum)", detalle: "Checkout en 1.2 s desde el lanzamiento (posible bot)", riesgo: "ALTO", fecha: "2026-05-12T10:00:01Z" },
  { id: "sus-3", usuario: "collector.maria", patron: "ACAPARAMIENTO", referencia: "BRB-1991-MK (Platinum)", detalle: "4 unidades · 3 tarjetas · misma dirección", riesgo: "MEDIO", fecha: "2026-05-13T14:22:00Z" },
  { id: "sus-4", usuario: "bot_runner_42", patron: "VELOCIDAD", referencia: "BRB-2000-PRES (Gold)", detalle: "Checkout en 0.8 s (patrón de bot confirmado)", riesgo: "ALTO", fecha: "2026-05-14T08:00:00Z" },
  { id: "sus-5", usuario: "anon_collector", patron: "ACAPARAMIENTO", referencia: "BRB-1999-GOD (Platinum)", detalle: "6 unidades · 6 tarjetas · misma dirección", riesgo: "ALTO", fecha: "2026-05-15T11:45:00Z" },
  { id: "sus-6", usuario: "quickhands", patron: "VELOCIDAD", referencia: "BRB-1991-MK (Platinum)", detalle: "Checkout en 1.9 s (límite de sospecha)", riesgo: "BAJO", fecha: "2026-05-15T12:03:00Z" },
];
