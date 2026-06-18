/**
 * Capa de acceso a datos centralizada de "Dream Legacy".
 *
 * HOY: cada función devuelve mock data (con latencia simulada) desde src/data/mock.
 * MAÑANA: reemplazar el cuerpo de cada función por un `fetch(...)` a la API real.
 *         La firma pública NO cambia, así que ningún componente se ve afectado.
 *
 * Ejemplo de migración:
 *
 *   export async function getProductos(): Promise<Producto[]> {
 *     const res = await fetch(`${API_URL}/productos`);
 *     return res.json();
 *   }
 */
import type {
  Usuario, Rol, Permiso,
  Producto, MoldeRostro, TipoCuerpo, TonoPiel, ColorMaestro, Material, Era, Exclusividad,
  ReglaCompatibilidad, Dreamhouse, Pack, Personaje, Profesion, Moneda,
  RentabilidadADN, DiversidadFila, ActividadSospechosa,
} from "../data/types";

import { usuarios, roles, permisos } from "../data/mock/seguridad";
import {
  moldesRostro, tiposCuerpo, tonosPiel, coloresMaestros, materiales, eras, exclusividades, monedas,
} from "../data/mock/catalogosMaestros";
import { productos } from "../data/mock/productos";
import { reglasCompatibilidad, dreamhouses, packs } from "../data/mock/catalogoExtra";
import { personajes, profesiones } from "../data/mock/personajes";
import { rentabilidadADN, diversidad, actividadSospechosa } from "../data/mock/reportes";

/** URL base de la API real (configurar vía BUN_PUBLIC_API_URL al conectar el backend). */
export const API_URL =
  (typeof process !== "undefined" && process.env?.BUN_PUBLIC_API_URL) || "/api";

/** Simula la latencia de red para que skeletons y loaders sean visibles. */
const LATENCY_MS = 350;
function delay<T>(data: T, ms = LATENCY_MS): Promise<T> {
  // Se clona para emular una respuesta de red (los componentes no mutan el mock).
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data)), ms)
  );
}

/* ----------------------------- Seguridad ----------------------------- */
export const getUsuarios = () => delay(usuarios);
export const getRoles = () => delay(roles);
export const getPermisos = () => delay(permisos);

/* ------------------------------ Catálogo ----------------------------- */
export const getProductos = () => delay(productos);
export const getMoldesRostro = () => delay(moldesRostro);
export const getTiposCuerpo = () => delay(tiposCuerpo);
export const getTonosPiel = () => delay(tonosPiel);
export const getColores = () => delay(coloresMaestros);
export const getMateriales = () => delay(materiales);
export const getEras = () => delay(eras);
export const getExclusividades = () => delay(exclusividades);
export const getMonedas = () => delay(monedas);

/* --------------------------- Catálogo extra -------------------------- */
export const getReglasCompatibilidad = () => delay(reglasCompatibilidad);
export const getDreamhouses = () => delay(dreamhouses);
export const getPacks = () => delay(packs);
export const getPersonajes = () => delay(personajes);
export const getProfesiones = () => delay(profesiones);

/* ------------------------------ Reportes ----------------------------- */
export const getRentabilidadADN = () => delay(rentabilidadADN);
export const getDiversidad = () => delay(diversidad);
export const getActividadSospechosa = () => delay(actividadSospechosa);

/* --------------------------------------------------------------------- *
 * Mutaciones simuladas (sin persistencia real).                          *
 * Devuelven el registro como lo haría el backend tras crear/editar.      *
 * Al conectar la API, sustituir por POST/PUT/DELETE.                     *
 * --------------------------------------------------------------------- */
export type Entidad =
  | Usuario | Rol | Permiso | Producto | MoldeRostro | TipoCuerpo
  | TonoPiel | ColorMaestro | Material | Era | Exclusividad
  | ReglaCompatibilidad | Dreamhouse | Pack | Personaje | Profesion
  | RentabilidadADN | DiversidadFila | ActividadSospechosa;

export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function guardar<T extends { id: string }>(
  entidad: T
): Promise<T> {
  return delay(entidad, 250);
}

export async function eliminar(id: string): Promise<{ ok: true; id: string }> {
  return delay({ ok: true as const, id }, 250);
}
