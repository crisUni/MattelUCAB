/**
 * Costeo en dos capas:
 *
 *  - SNAPSHOT histórico: `Producto.costoProduccionUsd`, congelado al fabricar. Es lo que
 *    usan los reportes históricos (Rentabilidad) — no cambia si suben los materiales.
 *  - VIGENTE: `costoVigente()`, recalculado con los precios ACTUALES de los materiales
 *    a partir de la receta (BOM). Sirve para comparar contra el snapshot y ver la deriva.
 *
 * MAÑANA (API real): el snapshot se capturaría por `Lote producción`; el vigente puede
 * calcularse en SQL (SUM(Material.costo * Material_Producto.Cantidad)) o con esta función.
 */
import type { Producto, Material } from "./types";

/** Costo de producción VIGENTE = Σ (costo unitario actual del material × cantidad en el BOM). */
export function costoVigente(producto: Producto, materiales: Material[]): number {
  return producto.bom.reduce((total, item) => {
    const material = materiales.find((m) => m.id === item.materialId);
    return total + (material ? material.costoUnitarioUsd * item.cantidad : 0);
  }, 0);
}
