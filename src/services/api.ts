/**
 * Capa de acceso a datos de "Dream Legacy".
 *
 * AHORA: cada función hace `fetch` a la API real (Bun + PostgreSQL) y adapta las
 * filas crudas (snake_case, ids numéricos) al modelo de dominio del front
 * (camelCase, ids string). La firma pública NO cambió para las lecturas, así que
 * los componentes siguen llamando getX() igual que antes.
 *
 * Los reportes se calculan en la base de datos (ver ReportesService / reports.sql).
 *
 * Mutaciones: guardar(recurso, entidad) / eliminar(recurso, id) despachan al
 * endpoint correcto por recurso. Algunos formularios no recogen todas las FK que
 * exige el esquema (ver notas en cada writer): en esos casos la edición preserva
 * las FK existentes de la fila y la creación puede estar limitada.
 */
import type {
  Usuario, Rol, Permiso,
  Producto, MoldeRostro, TipoCuerpo, Color, Material, Era, Exclusividad, TipoMaterial,
  ReglaCompatibilidad, Pack, Personaje, Profesion, ZonaColor, TipoVinculo, ColorAplicado, BomItem,
  LabelExclusividad, AccionPermiso, Lote, DefectoLote,
} from "../data/types";

/** URL base de la API (mismo origen que el front, servido por Bun). */
export const API_URL =
  (typeof process !== "undefined" && process.env?.BUN_PUBLIC_API_URL) || "/api";

/* ===================================================================== *
 * Helpers HTTP                                                          *
 * ===================================================================== */

/** GET de una colección. El backend responde 404 cuando la tabla está vacía → []. */
async function getList<T = any>(path: string): Promise<T[]> {
  const res = await fetch(`${API_URL}${path}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return (await res.json()) as T[];
}

async function send(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.text();
    // Se relanza para que el handler del componente no aplique el cambio optimista.
    throw new Error(`${method} ${path} → ${res.status} ${detail}`);
  }
}

/* ===================================================================== *
 * Helpers de mapeo                                                      *
 * ===================================================================== */

const sid = (n: number | null | undefined): string => (n == null ? "" : String(n));
const num = (s: string | null | undefined): number | null =>
  s == null || s === "" ? null : Number(s);
const yearOf = (iso: string | null): number =>
  iso ? new Date(iso).getUTCFullYear() : 0;
const withHash = (hex: string | null): string =>
  !hex ? "#cccccc" : hex.startsWith("#") ? hex : `#${hex}`;
const noHash = (hex: string): string => hex.replace(/^#/, "");

/** Deriva la etiqueta Pink/Black/Gold/Platinum desde el límite de producción. */
function labelExclusividad(limite: number | null): LabelExclusividad {
  if (limite == null) return "PINK";
  if (limite <= 1000) return "PLATINUM";
  if (limite <= 25000) return "GOLD";
  return "BLACK";
}

/** Normaliza la zona de aplicación del color (texto libre en BD) al enum del front. */
function zonaColor(texto: string): ZonaColor {
  const t = (texto || "").toLowerCase();
  if (t.includes("piel")) return "PIEL";
  if (t.includes("ojo")) return "OJOS";
  if (t.includes("cabello") || t.includes("pelo")) return "CABELLO";
  if (t.includes("labio")) return "LABIOS";
  return "VESTUARIO";
}

/** Normaliza el tipo de vínculo (texto libre en BD) al enum del front. */
function tipoVinculo(texto: string): TipoVinculo {
  const t = (texto || "").toLowerCase();
  if (t.includes("pareja")) return "PAREJA";
  if (t.includes("herman")) return "HERMANA";
  if (t.includes("rival")) return "RIVAL";
  if (t.includes("mascota")) return "MASCOTA";
  return "AMIGA";
}

const tipoProducto = (pro_tipo: string): Producto["tipo"] =>
  pro_tipo === "SET" ? "SET" : "INDIVIDUAL";

/* ===================================================================== *
 * LECTURAS — Seguridad / Usuarios                                       *
 * ===================================================================== */

export async function getUsuarios(): Promise<Usuario[]> {
  const rows = await getList("/usuario");
  return rows.map((u: any): Usuario => ({
    id: sid(u.usu_id),
    nombre: u.usu_nombre,
    username: u.usu_nombre,
    email: u.usu_correo,
    passwordHash: u.usu_clave ?? "",
    rolesIds: u.fk_rol_id != null ? [sid(u.fk_rol_id)] : [],
    fechaRegistro: "",
    empleadoId: u.fk_emp_id != null ? sid(u.fk_emp_id) : undefined,
    clienteId: u.fk_cli_id != null ? sid(u.fk_cli_id) : undefined,
  }));
}

export async function getRoles(): Promise<Rol[]> {
  const [roles, permisoRol] = await Promise.all([
    getList("/rol"),
    getList("/permiso_rol"),
  ]);
  return roles.map((r: any): Rol => ({
    id: sid(r.rol_id),
    nombre: r.rol_nombre,
    ambito: r.rol_ambito === "EXTERNO" ? "EXTERNO" : "INTERNO",
    permisosIds: permisoRol
      .filter((pr: any) => pr.fk_rol_id === r.rol_id)
      .map((pr: any) => sid(pr.fk_perm_id)),
    esSistema: false,
  }));
}

export async function getPermisos(): Promise<Permiso[]> {
  const rows = await getList("/permiso");
  return rows.map((p: any): Permiso => ({
    id: sid(p.perm_id),
    recurso: p.perm_recurso,
    accion: p.perm_accion,
  }));
}

/* ----------------------------- Autenticación ----------------------------- */

export interface PermisoSesion { recurso: string; accion: AccionPermiso }
export interface ResultadoLogin {
  usuario: { id: string; nombre: string };
  rol: { id: string; nombre: string };
  permisos: PermisoSesion[];
}

/** Valida credenciales contra la BD (POST /api/login). Devuelve null si no coinciden. */
export async function login(usuario: string, clave: string): Promise<ResultadoLogin | null> {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, clave }),
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`login → ${res.status} ${await res.text()}`);
  const d = await res.json();
  return {
    usuario: { id: String(d.usuario.id), nombre: d.usuario.nombre },
    rol: { id: String(d.rol.id), nombre: d.rol.nombre },
    permisos: d.permisos as PermisoSesion[],
  };
}

/** Permisos (recurso, accion) de un rol por nombre — usado para la sesión de invitado. */
export async function getPermisosDeRol(rolNombre: string): Promise<PermisoSesion[]> {
  const roles = await getList("/rol");
  const rol = roles.find((r: any) => String(r.rol_nombre).toLowerCase() === rolNombre.toLowerCase());
  if (!rol) return [];
  const rows = await getList(`/rol/${rol.rol_id}`);
  return rows.map((p: any) => ({ recurso: p.perm_recurso, accion: p.perm_accion as AccionPermiso }));
}

/* ===================================================================== *
 * LECTURAS — Catálogos maestros                                         *
 * ===================================================================== */

export async function getMoldesRostro(): Promise<MoldeRostro[]> {
  const rows = await getList("/molde_rostro");
  return rows.map((m: any): MoldeRostro => ({
    id: sid(m.molros_id),
    nombre: m.molros_nombre,
    anioPatente: m.molros_anopatente ?? 0,
    patente: m.molros_patente,
    personajeId: sid(m.fk_per_id),
    descripcion: "",
  }));
}

export async function getTiposCuerpo(): Promise<TipoCuerpo[]> {
  const rows = await getList("/tipo_cuerpo");
  return rows.map((c: any): TipoCuerpo => ({
    id: sid(c.tipcue_id),
    nombre: c.tipcue_nombre,
    descripcion: "",
    formaPie: "PLANO",   // no existe en el ER; placeholder neutro
    articulado: false,    // idem
  }));
}

export async function getColores(): Promise<Color[]> {
  const rows = await getList("/color");
  return rows.map((c: any): Color => ({
    id: sid(c.col_id),
    nombre: c.col_nombre,
    hex: withHash(c.col_codhex),
  }));
}

export async function getMateriales(): Promise<Material[]> {
  const rows = await getList("/material");
  return rows.map((m: any): Material => ({
    id: sid(m.mat_id),
    nombre: m.mat_nombre,
    tipo: String(m.mat_tipo).toUpperCase() as TipoMaterial,
    unidad: m.mat_unidad,
    costoUnitarioUsd: m.mat_costo ?? 0,
  }));
}

export async function getEras(): Promise<Era[]> {
  const rows = await getList("/era_historico");
  return rows.map((e: any): Era => ({
    id: sid(e.erahis_id),
    nombre: e.erahis_nombre,
    fechaInicio: yearOf(e.erahis_fechaini),
    fechaFin: yearOf(e.erahis_fechafin) || null,
    descripcion: "",
  }));
}

export async function getExclusividades(): Promise<Exclusividad[]> {
  const rows = await getList("/exclusividad");
  return rows.map((x: any): Exclusividad => ({
    id: sid(x.exc_id),
    codigo: labelExclusividad(x.exc_limiteproducto),
    nombre: x.exc_nombre ?? "",
    tiradaMax: x.exc_limiteproducto ?? null,
  }));
}

/* ===================================================================== *
 * LECTURAS — Personajes, profesiones, packs, compatibilidad            *
 * ===================================================================== */

export async function getPersonajes(): Promise<Personaje[]> {
  const [personajes, vinculos] = await Promise.all([
    getList("/personaje"),
    getList("/vinculo_personaje"),
  ]);
  return personajes.map((p: any): Personaje => {
    const vins = vinculos
      .filter((v: any) => v.fk_personaje1 === p.per_id || v.fk_personaje2 === p.per_id)
      .map((v: any) => ({
        personajeId: sid(v.fk_personaje1 === p.per_id ? v.fk_personaje2 : v.fk_personaje1),
        tipo: tipoVinculo(v.vinper_tipo_relacion),
      }));
    return {
      id: sid(p.per_id),
      nombre: p.per_nombre,
      nombreCompleto: p.per_nombre,
      rol: "Personaje",
      debut: 0,
      vinculos: vins,
    };
  });
}

export interface NuevoPersonaje {
  nombre: string; moldeNombre: string; moldePatente: string; moldeAno?: number;
  vinculos: { personajeId: string; tipo: string }[];
}

/** Alta de personaje + su molde de rostro, y sus vínculos con personajes existentes. */
export async function crearPersonaje(p: NuevoPersonaje): Promise<void> {
  await send("POST", "/personaje_full", {
    nombre: p.nombre, moldeNombre: p.moldeNombre, moldePatente: p.moldePatente, moldeAno: p.moldeAno ?? null,
  });
  const pers = await getList("/personaje");
  const nuevoId = pers.reduce((m: number, r: any) => Math.max(m, Number(r.per_id) || 0), 0);
  for (const v of p.vinculos) {
    if (v.personajeId) await send("POST", "/vinculo_personaje", { fk_personaje1: nuevoId, fk_personaje2: Number(v.personajeId), vinper_tipo_relacion: v.tipo });
  }
}

/** Elimina un personaje en cascada (vínculos + moldes; bloquea si un molde está en uso). */
export async function eliminarPersonaje(id: string): Promise<void> {
  await send("DELETE", `/personaje/${id}`);
}

export async function getProfesiones(): Promise<Profesion[]> {
  const [historico, profesiones, productos, juguetes, moldes] = await Promise.all([
    getList("/historico_profesion"),
    getList("/profesion"),
    getList("/producto"),
    getList("/juguete"),
    getList("/molde_rostro"),
  ]);
  const profName = (id: number) =>
    profesiones.find((p: any) => p.prof_id === id)?.prof_nombre ?? `Profesión ${id}`;
  // producto → juguete → molde → personaje: a qué muñeca pertenece la profesión.
  const personajeDeProducto = (proId: number): string => {
    const prod = productos.find((p: any) => p.pro_id === proId);
    if (!prod) return "";
    const jug = juguetes.find((j: any) => j.jug_id === prod.fk_jug_id);
    if (!jug) return "";
    const molde = moldes.find((m: any) => m.molros_id === jug.fk_molros_id);
    return sid(molde?.fk_per_id);
  };
  return historico.map((h: any): Profesion => ({
    id: `${h.fk_pro_id}-${h.fk_prof_id}`,
    personajeId: personajeDeProducto(h.fk_pro_id),
    titulo: profName(h.fk_prof_id),
    anio: Number(h.hispro_anoasignacion) || 0,
    descripcion: "",
  }));
}

export async function getReglasCompatibilidad(): Promise<ReglaCompatibilidad[]> {
  const [compat, juguetes, productos] = await Promise.all([
    getList("/compatibilidad_juguete"),
    getList("/juguete"),
    getList("/producto"),
  ]);
  // Mostrar el nombre del producto en lugar del código ADN (más legible).
  const label = (id: number) => {
    const pro = productos.find((p: any) => p.fk_jug_id === id);
    if (pro) return pro.pro_nombre as string;
    return juguetes.find((j: any) => j.jug_id === id)?.jug_adn ?? `Juguete ${id}`;
  };
  return compat.map((c: any): ReglaCompatibilidad => ({
    id: `${c.fk_juguete1}-${c.fk_juguete2}`,
    nombre: `Compatibilidad ${label(c.fk_juguete1)} ↔ ${label(c.fk_juguete2)}`,
    origen: label(c.fk_juguete1),
    destino: label(c.fk_juguete2),
    resultado: "COMPATIBLE",
    motivo: "Juguetes registrados como compatibles entre sí.",
  }));
}

/** Opciones de juguete (genoma) etiquetadas por el nombre del producto, no por su ADN. */
export async function getJuguetesConProductoOpc(): Promise<Opcion[]> {
  const [juguetes, productos] = await Promise.all([getList("/juguete"), getList("/producto")]);
  return juguetes.map((j: any) => {
    const pro = productos.find((p: any) => p.fk_jug_id === j.jug_id);
    return { id: sid(j.jug_id), nombre: pro ? `${pro.pro_nombre} · ${j.jug_adn}` : j.jug_adn };
  });
}

/** Registra un par de juguetes (genomas) como compatibles entre sí. */
export async function crearCompatibilidad(jug1: string, jug2: string): Promise<void> {
  await send("POST", "/compatibilidad_juguete", { fk_juguete1: Number(jug1), fk_juguete2: Number(jug2) });
}

/** Pares de juguetes compatibles (ids), para filtrar las opciones de un set nuevo. */
export async function getCompatibilidadesRaw(): Promise<{ jug1: string; jug2: string }[]> {
  const rows = await getList("/compatibilidad_juguete");
  return rows.map((c: any) => ({ jug1: sid(c.fk_juguete1), jug2: sid(c.fk_juguete2) }));
}

export async function getPacks(): Promise<Pack[]> {
  const [sets, productos] = await Promise.all([
    getList("/detalle_set"),
    getList("/producto"),
  ]);
  const precio = (id: number) =>
    productos.find((p: any) => p.pro_id === id)?.pro_preciobase ?? 0;
  const byName = new Map<string, { pairs: [number, number][]; proIds: Set<number> }>();
  for (const s of sets as any[]) {
    const name = s.detset_nombre;
    if (!byName.has(name)) byName.set(name, { pairs: [], proIds: new Set() });
    const g = byName.get(name)!;
    g.pairs.push([s.fk_pro1, s.fk_pro2]);
    g.proIds.add(s.fk_pro1);
    g.proIds.add(s.fk_pro2);
  }
  return [...byName.entries()].map(([name, g]) => {
    const proIds = [...g.proIds];
    const prodIds = proIds.map(sid);
    const total = proIds.reduce((s, id) => s + precio(id), 0);
    return {
      id: `group-${encodeURIComponent(name)}`,
      sku: `SET-${proIds.join("-")}`,
      nombre: name,
      precioUsd: total,
      productosIds: prodIds,
      descripcion: "Set de regalo que agrupa varios productos bajo un SKU.",
      _proPairs: g.pairs.map(([a, b]) => [sid(a), sid(b)]),
    };
  });
}

/* ===================================================================== *
 * LECTURAS — Catálogo de productos (con taxonomía/colores/BOM/stock)    *
 * ===================================================================== */

export async function getProductos(): Promise<Producto[]> {
  // La vista VW_PRODUCTO_ADN resuelve en la BD las uniones, el stock y el costo.
  // El front sólo agrupa colores/BOM (datos 1:N) por juguete.
  const [rows, colorProd, matProd] = await Promise.all([
    getList("/producto_adn"),
    getList("/color_producto"),
    getList("/material_producto"),
  ]);

  return rows.map((p: any): Producto => {
    const colores: ColorAplicado[] = colorProd
      .filter((cp: any) => cp.fk_jug_id === p.fk_jug_id)
      .map((cp: any) => ({ colorId: sid(cp.fk_col_id), zona: zonaColor(cp.colpro_zonaaplicacion) }));

    const bom: BomItem[] = matProd
      .filter((mp: any) => mp.fk_jug_id === p.fk_jug_id)
      .map((mp: any) => ({ materialId: sid(mp.fk_mat_id), cantidad: mp.matpro_cantidad }));

    return {
      id: sid(p.pro_id),
      sku: String(p.pro_sku),
      nombre: p.pro_nombre,
      precioBaseUsd: Number(p.pro_preciobase ?? 0),
      costoProduccionUsd: Number(p.costo_produccion ?? 0),
      fechaLanzamiento: p.pro_lanzamientofecha ?? "",
      tipo: tipoProducto(p.pro_tipo),
      moldeRostroId: sid(p.fk_molros_id) || undefined,
      tipoCuerpoId: sid(p.fk_tipcue_id) || undefined,
      eraId: sid(p.fk_erahis_id) || undefined,
      exclusividadId: sid(p.fk_exc_id) || undefined,
      personajeId: sid(p.personaje_id) || undefined,
      colores,
      bom,
      stock: Number(p.stock ?? 0),
      adn: p.jug_adn ?? undefined,
      disenoPatente: p.diseno_patente ?? undefined,
      disenadorId: sid(p.disenador_id) || undefined,
      disenador: p.disenador ?? undefined,
      jugueteId: sid(p.fk_jug_id) || undefined,
      loteId: sid(p.fk_lotpro_id) || undefined,
      categoriaId: sid(p.fk_catpro_id) || undefined,
      edicionId: sid(p.fk_edi_id) || undefined,
    };
  });
}

/* ===================================================================== *
 * LECTURAS / ESCRITURAS — Manufactura (lotes, calidad, defectos)        *
 * ===================================================================== */

export async function getLotes(): Promise<Lote[]> {
  const rows = await getList("/lote_resumen");
  return rows.map((l: any): Lote => ({
    id: sid(l.lotpro_id),
    fechaInicio: l.lotpro_fechaini ?? "",
    fechaFin: l.lotpro_fechafin ?? null,
    resultado: l.inscal_resultado ?? null,
    fechaInspeccion: l.inscal_fecha ?? null,
    inspector: l.inspector ?? null,
    numProductos: Number(l.num_productos ?? 0),
    numDefectos: Number(l.num_defectos ?? 0),
    unidadesAfectadas: Number(l.unidades_afectadas ?? 0),
  }));
}

export async function getDefectosLote(): Promise<DefectoLote[]> {
  const [dl, defectos] = await Promise.all([getList("/defecto_lote"), getList("/defecto")]);
  const nombre = (id: number) => defectos.find((d: any) => d.def_id === id)?.def_nombre ?? `Defecto ${id}`;
  return dl.map((x: any): DefectoLote => ({
    loteId: sid(x.fk_lotpro_id),
    defecto: nombre(x.fk_def_id),
    cantidad: Number(x.deflot_cantidadafectada ?? 0),
  }));
}

/** Crea un nuevo lote de producción. */
export async function crearLote(fechaInicio: string, fechaFin: string | null): Promise<void> {
  await send("POST", "/lote_produccion", {
    lotpro_fechaini: (fechaInicio || "").slice(0, 10),
    lotpro_fechafin: fechaFin ? fechaFin.slice(0, 10) : null,
  });
}

/** Registra una inspección de calidad (QA) para un lote. */
export async function registrarInspeccion(loteId: string, resultado: string, empleadoId: string, fecha: string): Promise<void> {
  await send("POST", "/inspeccion_calidad", {
    inscal_fecha: (fecha || "").slice(0, 10),
    inscal_resultado: resultado,
    fk_lotpro_id: Number(loteId),
    fk_emp_id: Number(empleadoId),
  });
}

export interface InspeccionRow {
  inscal_id: number;
  inscal_fecha: string;
  inscal_resultado: string;
  fk_lotpro_id: number;
  fk_emp_id: number;
}

/** Obtiene todas las inspecciones de calidad. */
export async function getInspecciones(): Promise<InspeccionRow[]> {
  return getList("/inspeccion_calidad");
}

/** Actualiza una inspección de calidad. */
export async function actualizarInspeccion(id: string, fecha: string, resultado: string, loteId: string): Promise<void> {
  await send("PUT", `/inspeccion_calidad/${id}`, {
    inscal_fecha: (fecha || "").slice(0, 10),
    inscal_resultado: resultado,
    fk_lotpro_id: Number(loteId),
  });
}

/** Elimina una inspección de calidad. */
export async function eliminarInspeccion(id: string): Promise<void> {
  await send("DELETE", `/inspeccion_calidad/${id}`);
}

/** Actualiza un lote de producción (fechas). */
export async function actualizarLote(id: string, fechaInicio: string, fechaFin: string | null): Promise<void> {
  await send("PUT", `/lote_produccion/${id}`, {
    lotpro_fechaini: (fechaInicio || "").slice(0, 10),
    lotpro_fechafin: fechaFin ? fechaFin.slice(0, 10) : null,
  });
}

/** Elimina un lote de producción. */
export async function eliminarLote(id: string): Promise<void> {
  await send("DELETE", `/lote_produccion/${id}`);
}

/** Lista todos los tipos de defecto. */
export async function getDefectos(): Promise<{ id: string; nombre: string }[]> {
  const rows = await getList("/defecto");
  return rows.map((d: any) => ({ id: sid(d.def_id), nombre: d.def_nombre }));
}

/** Crea un nuevo tipo de defecto. */
export async function crearDefecto(nombre: string): Promise<void> {
  await send("POST", "/defecto", { def_nombre: nombre });
}

/** Actualiza un tipo de defecto. */
export async function actualizarDefecto(id: string, nombre: string): Promise<void> {
  await send("PUT", `/defecto/${id}`, { def_nombre: nombre });
}

/** Elimina un tipo de defecto. */
export async function eliminarDefecto(id: string): Promise<void> {
  await send("DELETE", `/defecto/${id}`);
}

/** Datos crudos de defecto_lote (con fk_def_id numérico). */
export interface DefectoLoteRaw {
  fk_def_id: number;
  fk_lotpro_id: number;
  deflot_cantidadafectada: number;
}

/** Lista defecto_lote con ids numéricos. */
export async function getDefectosLoteRaw(): Promise<DefectoLoteRaw[]> {
  return getList("/defecto_lote");
}

/** Asocia un defecto a un lote (o actualiza la cantidad). */
export async function crearDefectoLote(cantidad: number, defId: string, loteId: string): Promise<void> {
  await send("POST", "/defecto_lote", {
    deflot_cantidadafectada: cantidad,
    fk_def_id: Number(defId),
    fk_lotpro_id: Number(loteId),
  });
}

/** Actualiza la cantidad de un defecto en un lote. */
export async function actualizarDefectoLote(defId: string, loteId: string, cantidad: number): Promise<void> {
  await send("PUT", "/defecto_lote", {
    fk_def_id: Number(defId),
    fk_lotpro_id: Number(loteId),
    deflot_cantidadafectada: cantidad,
  });
}

/** Elimina un defecto de un lote. */
export async function eliminarDefectoLote(defId: string, loteId: string): Promise<void> {
  await send("DELETE", "/defecto_lote", {
    fk_def_id: Number(defId),
    fk_lotpro_id: Number(loteId),
  });
}

/* ===================================================================== *
 * LECTURAS — Listas de opciones para formularios de alta               *
 * ===================================================================== */

/** Opción genérica {id, nombre} para selects. */
export type Opcion = { id: string; nombre: string };

export async function getEmpleadosOpc(): Promise<Opcion[]> {
  const rows = await getList("/empleado");
  return rows.map((e: any) => ({ id: sid(e.emp_id), nombre: `${e.emp_pnombre} ${e.emp_papellido}` }));
}

/* ------------------------------ Empleados ------------------------------ */

export interface Empleado {
  id: string; nombre: string; departamento: string; cargo: string; direccion: string;
  pnombre: string; snombre: string; papellido: string; sapellido: string; depId: string; cargoId: string;
}

/** Empleados con su departamento y cargo actuales (vía DEP_EMP). */
export async function getEmpleados(): Promise<Empleado[]> {
  const [emps, depEmp, deps, cargos] = await Promise.all([
    getList("/empleado"), getList("/dep_emp"), getList("/departamento"), getList("/cargo"),
  ]);
  return emps.map((e: any): Empleado => {
    const de = depEmp.find((x: any) => x.fk_emp_id === e.emp_id);
    const dep = de && deps.find((d: any) => d.dep_id === de.fk_dep_id);
    const car = de && cargos.find((c: any) => c.car_id === de.fk_car_id);
    return {
      id: sid(e.emp_id),
      nombre: [e.emp_pnombre, e.emp_papellido].filter(Boolean).join(" "),
      departamento: dep?.dep_nombre ?? "—",
      cargo: car?.car_nombre ?? "—",
      direccion: e.emp_direccion ?? "",
      pnombre: e.emp_pnombre ?? "", snombre: e.emp_snombre ?? "",
      papellido: e.emp_papellido ?? "", sapellido: e.emp_sapellido ?? "",
      depId: de ? sid(de.fk_dep_id) : "", cargoId: de ? sid(de.fk_car_id) : "",
    };
  });
}

export interface NuevoEmpleado { pnombre: string; snombre?: string; papellido: string; sapellido: string; direccion: string; dep: string; car: string }

/** Alta de empleado + adscripción (departamento y cargo) en la BD. */
export async function crearEmpleado(e: NuevoEmpleado): Promise<void> {
  await send("POST", "/empleado_full", {
    pnombre: e.pnombre, snombre: e.snombre ?? "", papellido: e.papellido, sapellido: e.sapellido,
    direccion: e.direccion, dep: Number(e.dep), car: Number(e.car),
  });
}

/** Edita un empleado (datos + departamento/cargo). */
export async function actualizarEmpleado(id: string, e: NuevoEmpleado): Promise<void> {
  await send("PUT", `/empleado_full/${id}`, {
    pnombre: e.pnombre, snombre: e.snombre ?? "", papellido: e.papellido, sapellido: e.sapellido,
    direccion: e.direccion, dep: Number(e.dep), car: Number(e.car),
  });
}

/** Elimina un empleado (cascada de sus turnos/adscripción; bloquea si está vinculado). */
export async function eliminarEmpleado(id: string): Promise<void> {
  await send("DELETE", `/empleado/${id}`);
}

export async function getDepartamentosOpc(): Promise<Opcion[]> {
  const rows = await getList("/departamento");
  return rows.map((d: any) => ({ id: sid(d.dep_id), nombre: d.dep_nombre }));
}

export async function getCargosOpc(): Promise<Opcion[]> {
  const rows = await getList("/cargo");
  return rows.map((c: any) => ({ id: sid(c.car_id), nombre: c.car_nombre }));
}

/* ------------------------------ Clientes ------------------------------ */

export interface ClienteRow { id: string; nombre: string; tipo: "NATURAL" | "JURIDICA"; documento: string; lugar: string; registro: string }

/** Clientes (persona natural o jurídica) con su documento y lugar de registro. */
export async function getClientes(): Promise<ClienteRow[]> {
  const [clientes, naturales, juridicas, lugares] = await Promise.all([
    getList("/cliente"), getList("/persona_natural"), getList("/persona_juridica"), getList("/lugar"),
  ]);
  return clientes.map((c: any): ClienteRow => {
    const n = naturales.find((x: any) => x.fk_cli_id === c.cli_id);
    const j = juridicas.find((x: any) => x.fk_cli_id === c.cli_id);
    const lugar = lugares.find((l: any) => l.lug_id === c.fk_lug_id)?.lug_nombre ?? "—";
    const registro = (c.cli_fecharegis || "").slice(0, 10);
    if (j) return { id: sid(c.cli_id), nombre: j.perjur_razonsocial, tipo: "JURIDICA", documento: `RIF ${j.perjur_rif}`, lugar, registro };
    if (n) return { id: sid(c.cli_id), nombre: `${n.pernat_pnombre} ${n.pernat_papellido}`, tipo: "NATURAL", documento: `CI ${n.pernat_cedula}`, lugar, registro };
    return { id: sid(c.cli_id), nombre: `Cliente #${c.cli_id}`, tipo: "NATURAL", documento: "—", lugar, registro };
  });
}

export interface NuevoCliente {
  tipo: "NATURAL" | "JURIDICA"; lug: string;
  cedula?: string; pnombre?: string; snombre?: string; papellido?: string; sapellido?: string; fechanac?: string; direccion?: string;
  rif?: string; razon?: string; repre?: string;
}

/** Alta de cliente (persona natural o jurídica) en la BD. */
export async function crearCliente(c: NuevoCliente): Promise<void> {
  await send("POST", "/cliente_full", {
    tipo: c.tipo, lug: Number(c.lug),
    cedula: c.cedula ?? "", pnombre: c.pnombre ?? "", snombre: c.snombre ?? "", papellido: c.papellido ?? "", sapellido: c.sapellido ?? "",
    fechanac: c.fechanac || null, direccion: c.direccion ?? "",
    rif: c.rif ?? "", razon: c.razon ?? "", repre: c.repre ?? "",
  });
}

export interface ClienteDetalle {
  cli_id: number; cli_fecharegis: string; fk_lug_id: number;
  natural: { pernat_cedula: string; pernat_pnombre: string; pernat_snombre: string | null; pernat_papellido: string; pernat_sapellido: string | null; pernat_fechanac: string; pernat_direccion: string } | null;
  juridica: { perjur_rif: string; perjur_razonsocial: string; perjur_reprelegal: string } | null;
}

/** Datos completos de un cliente (con su persona natural o jurídica). */
export async function getClienteDetalle(id: string): Promise<ClienteDetalle> {
  const res = await fetch(`${API_URL}/cliente/${id}`);
  if (!res.ok) throw new Error(`Cliente ${id} → ${res.status} ${await res.text()}`);
  return res.json();
}

/** Actualiza un cliente completo (persona natural o jurídica). */
export async function actualizarCliente(id: string, c: NuevoCliente): Promise<void> {
  await send("PUT", `/cliente_full/${id}`, {
    tipo: c.tipo, lug: Number(c.lug),
    cedula: c.cedula ?? "", pnombre: c.pnombre ?? "", snombre: c.snombre ?? "", papellido: c.papellido ?? "", sapellido: c.sapellido ?? "",
    fechanac: c.fechanac || null, direccion: c.direccion ?? "",
    rif: c.rif ?? "", razon: c.razon ?? "", repre: c.repre ?? "",
  });
}

/** Elimina un cliente (cascada de su persona y membresías; bloquea si tiene usuario). */
export async function eliminarCliente(id: string): Promise<void> {
  await send("DELETE", `/cliente/${id}`);
}

/** Parroquias de Venezuela para el lugar de registro del cliente, mostrando también el estado al que pertenecen. */
export async function getLugaresOpc(): Promise<Opcion[]> {
  const rows: any[] = await getList("/lugar");
  const map = new Map<number, any>(rows.map((r) => [r.lug_id, r]));
  return rows
    .filter((l: any) => l.lug_tipo === "PARROQUIA")
    .map((l: any) => {
      const mun = map.get(l.fk_lug_id);
      const est = mun ? map.get(mun.fk_lug_id) : null;
      const estado = est?.lug_nombre ?? "";
      return { id: sid(l.lug_id), nombre: estado ? `${l.lug_nombre} (${estado})` : l.lug_nombre };
    });
}

/** Solo empleados adscritos al departamento de Diseño (I+D) — diseñadores de ADN/patentes. */
export async function getDisenadoresOpc(): Promise<Opcion[]> {
  const [empleados, depEmp, departamentos] = await Promise.all([
    getList("/empleado"), getList("/dep_emp"), getList("/departamento"),
  ]);
  const deptDiseno = new Set(
    departamentos.filter((d: any) => /dise/i.test(d.dep_nombre)).map((d: any) => d.dep_id),
  );
  const empDiseno = new Set(
    depEmp.filter((de: any) => deptDiseno.has(de.fk_dep_id)).map((de: any) => de.fk_emp_id),
  );
  return empleados
    .filter((e: any) => empDiseno.has(e.emp_id))
    .map((e: any) => ({ id: sid(e.emp_id), nombre: `${e.emp_pnombre} ${e.emp_papellido}` }));
}

export async function getClientesOpc(): Promise<Opcion[]> {
  const [clientes, naturales, juridicas] = await Promise.all([
    getList("/cliente"), getList("/persona_natural"), getList("/persona_juridica"),
  ]);
  return clientes.map((c: any) => {
    const n = naturales.find((x: any) => x.fk_cli_id === c.cli_id);
    const j = juridicas.find((x: any) => x.fk_cli_id === c.cli_id);
    const nombre = n ? `${n.pernat_pnombre} ${n.pernat_papellido}` : j ? j.perjur_razonsocial : `Cliente #${c.cli_id}`;
    return { id: sid(c.cli_id), nombre };
  });
}

export async function getJuguetesOpc(): Promise<Opcion[]> {
  const rows = await getList("/juguete");
  return rows.map((j: any) => ({ id: sid(j.jug_id), nombre: j.jug_adn }));
}

export async function getCategoriasOpc(): Promise<Opcion[]> {
  const rows = await getList("/categoria_producto");
  return rows.map((c: any) => ({ id: sid(c.catpro_id), nombre: c.catpro_descripcion }));
}

export async function getLotesOpc(): Promise<Opcion[]> {
  const rows = await getList("/lote_produccion");
  return rows.map((l: any) => ({ id: sid(l.lotpro_id), nombre: `Lote ${l.lotpro_id} · ${(l.lotpro_fechaini || "").slice(0, 10)}` }));
}

export async function getEdicionesOpc(): Promise<Opcion[]> {
  const rows = await getList("/edicion");
  return rows.map((e: any) => ({ id: sid(e.edi_id), nombre: e.edi_nombre }));
}

export async function getDisenosOpc(): Promise<Opcion[]> {
  const [disenos, empleados] = await Promise.all([getList("/diseno"), getList("/empleado")]);
  return disenos.map((d: any) => {
    const e = empleados.find((x: any) => x.emp_id === d.fk_emp_id);
    return { id: sid(d.dis_id), nombre: `${d.dis_patentecod}${e ? ` · ${e.emp_pnombre} ${e.emp_papellido}` : ""}` };
  });
}

export async function getProfesionesOpc(): Promise<Opcion[]> {
  const rows = await getList("/profesion");
  return rows.map((p: any) => ({ id: sid(p.prof_id), nombre: p.prof_nombre }));
}

/** Alta completa de una muñeca (genoma + colores + receta + stock + profesión), todo en la BD. */
export interface NuevaMuneca {
  nombre: string; precio: number; fecha: string;
  molros: string; tipcue: string; era: string; dis: string;
  cat: string; edi: string; lote: string; exc: string;
  colores: { colId: string; zona: string }[];
  materiales: { matId: string; cantidad: number }[];
  /** Stock inicial repartido por almacén (cada almacén pertenece a un hub regional). */
  inventario?: { almId: string; cantidad: number }[];
  profId?: string; profAno?: string;
}
export async function crearMuneca(m: NuevaMuneca): Promise<void> {
  // El genoma + producto + profesión se crean en una transacción (crear_muneca);
  // el stock inicial NO se pasa aquí porque una muñeca puede tener existencias en
  // varios almacenes: se insertan después como filas de INVENTARIO.
  const res = await fetch(`${API_URL}/muneca`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: m.nombre, precio: m.precio, fecha: (m.fecha || "").slice(0, 10),
      molros: Number(m.molros), tipcue: Number(m.tipcue), era: Number(m.era), dis: Number(m.dis),
      cat: Number(m.cat), edi: Number(m.edi), lote: Number(m.lote), exc: Number(m.exc),
      colIds: m.colores.map((c) => Number(c.colId)), zonas: m.colores.map((c) => c.zona),
      matIds: m.materiales.map((x) => Number(x.matId)), matCants: m.materiales.map((x) => Number(x.cantidad)),
      stock: 0, alm: null,
      prof: m.profId ? Number(m.profId) : null, profAno: m.profAno || null,
    }),
  });
  if (!res.ok) throw new Error(`POST /muneca → ${res.status} ${await res.text()}`);
  const { pro_id } = await res.json();
  const hoy = new Date().toISOString().slice(0, 10);
  for (const inv of m.inventario ?? []) {
    if (inv.almId && inv.cantidad > 0) {
      await send("POST", "/inventario", {
        fk_pro_id: pro_id, fk_alm_id: Number(inv.almId),
        inv_stockdisponible: inv.cantidad, inv_cantidad: inv.cantidad,
        inv_fecha_actualizacion: hoy,
      });
    }
  }
}

/** Mapea la zona de color del front (enum) al texto que guarda la BD. */
const ZONA_DB: Record<string, string> = { PIEL: "Piel", OJOS: "Ojos", CABELLO: "Cabello", LABIOS: "Labios", VESTUARIO: "Vestuario" };

/** Edita el genoma (ADN) de un producto: molde, cuerpo, era y colores por zona. */
export async function actualizarGenoma(
  proId: string, molros: string, tipcue: string, era: string, colores: { colorId: string; zona: string }[],
): Promise<void> {
  await send("POST", "/genoma", {
    pro: Number(proId), molros: Number(molros), tipcue: Number(tipcue), era: Number(era),
    colIds: colores.filter((c) => c.colorId).map((c) => Number(c.colorId)),
    zonas: colores.filter((c) => c.colorId).map((c) => ZONA_DB[c.zona] ?? c.zona),
  });
}

/** Almacenes para asignar stock inicial (etiquetados por tipo de instalación). */
export async function getAlmacenesOpc(): Promise<Opcion[]> {
  const rows = await getList("/almacen");
  return rows.map((a: any) => ({ id: sid(a.alm_id), nombre: `${a.alm_tipoinstalacion} #${a.alm_id}` }));
}

/* ===================================================================== *
 * INVENTARIO — stock de cada producto por almacén / hub regional        *
 * ===================================================================== */

export interface InventarioRow {
  /** Clave compuesta producto+almacén (no hay id propio en la tabla puente). */
  id: string;
  proId: string; almId: string;
  sku: string; producto: string;
  hubId: string; hub: string;
  almacenTipo: string; ubicacion: string;
  disponible: number; cantidad: number; reservado: number;
  actualizado: string;
}

/** Inventario resuelto (vista VW_INVENTARIO): dónde reside el stock de cada producto. */
export async function getInventario(): Promise<InventarioRow[]> {
  const rows = await getList("/inventario_detalle");
  return rows.map((r: any): InventarioRow => ({
    id: `${r.fk_pro_id}-${r.fk_alm_id}`,
    proId: sid(r.fk_pro_id), almId: sid(r.fk_alm_id),
    sku: String(r.pro_sku ?? ""), producto: r.pro_nombre ?? `Producto ${r.fk_pro_id}`,
    hubId: sid(r.fk_hubreg_id), hub: r.hubreg_nombre ?? "—",
    almacenTipo: r.alm_tipoinstalacion ?? "—", ubicacion: r.ubicacion ?? "—",
    disponible: Number(r.inv_stockdisponible ?? 0),
    cantidad: Number(r.inv_cantidad ?? 0),
    reservado: Number(r.inv_reservado ?? 0),
    actualizado: (r.inv_fecha_actualizacion ?? "").slice(0, 10),
  }));
}

/** Hubs regionales como opciones {id, nombre} para filtros y selects. */
export async function getHubsOpc(): Promise<Opcion[]> {
  const rows = await getList("/hub_regional");
  return rows.map((h: any) => ({ id: sid(h.hubreg_id), nombre: h.hubreg_nombre }));
}

export interface AlmacenOpcion { id: string; nombre: string; hubId: string; hubNombre: string; tipo: string }

/** Almacenes con su hub regional resuelto, para elegir dónde colocar el stock. */
export async function getAlmacenesDetalle(): Promise<AlmacenOpcion[]> {
  const [alm, hubs] = await Promise.all([getList("/almacen"), getList("/hub_regional")]);
  return alm.map((a: any): AlmacenOpcion => {
    const h = hubs.find((x: any) => x.hubreg_id === a.fk_hubreg_id);
    const hubNombre = h?.hubreg_nombre ?? `Hub ${a.fk_hubreg_id}`;
    return {
      id: sid(a.alm_id), tipo: a.alm_tipoinstalacion,
      hubId: sid(a.fk_hubreg_id), hubNombre,
      nombre: `${hubNombre} · ${a.alm_tipoinstalacion} #${a.alm_id}`,
    };
  });
}

/** Productos como opciones {id, nombre} (SKU · nombre) para el alta de inventario. */
export async function getProductosOpc(): Promise<Opcion[]> {
  const rows = await getList("/producto");
  return rows.map((p: any) => ({ id: sid(p.pro_id), nombre: `${p.pro_sku} · ${p.pro_nombre}` }));
}

export interface NuevoInventario { proId: string; almId: string; disponible: number; cantidad: number }

/** Crea una existencia (producto en un almacén). La fecha se fija a hoy. */
export async function crearInventario(n: NuevoInventario): Promise<void> {
  await send("POST", "/inventario", {
    fk_pro_id: Number(n.proId), fk_alm_id: Number(n.almId),
    inv_stockdisponible: n.disponible, inv_cantidad: n.cantidad,
    inv_fecha_actualizacion: new Date().toISOString().slice(0, 10),
  });
}

/** Actualiza el stock de una existencia (clave producto+almacén inmutable). */
export async function actualizarInventario(n: NuevoInventario): Promise<void> {
  await send("PUT", "/inventario", {
    fk_pro_id: Number(n.proId), fk_alm_id: Number(n.almId),
    inv_stockdisponible: n.disponible, inv_cantidad: n.cantidad,
    inv_fecha_actualizacion: new Date().toISOString().slice(0, 10),
  });
}

/** Elimina una existencia (producto en un almacén). */
export async function eliminarInventario(proId: string, almId: string): Promise<void> {
  await send("DELETE", "/inventario", { fk_pro_id: Number(proId), fk_alm_id: Number(almId) });
}

/* ----------------------------- Hubs regionales ----------------------------- */

export interface HubRow { id: string; nombre: string; lugar: string; fkLugId: string }

/** Hubs regionales con su lugar resuelto. */
export async function getHubsDetalle(): Promise<HubRow[]> {
  const [hubs, lugares] = await Promise.all([getList("/hub_regional"), getList("/lugar")]);
  return hubs.map((h: any): HubRow => {
    const l = lugares.find((x: any) => x.lug_id === h.fk_lug_id);
    return { id: sid(h.hubreg_id), nombre: h.hubreg_nombre, lugar: l?.lug_nombre ?? "—", fkLugId: sid(h.fk_lug_id) };
  });
}

/** Crea un hub regional. */
export async function crearHub(nombre: string, lugarId: string): Promise<void> {
  await send("POST", "/hub_regional", { hubreg_nombre: nombre, fk_lug_id: Number(lugarId) });
}

/** Actualiza un hub regional. */
export async function actualizarHub(id: string, nombre: string, lugarId: string): Promise<void> {
  await send("PUT", `/hub_regional/${id}`, { hubreg_nombre: nombre, fk_lug_id: Number(lugarId) });
}

/** Elimina un hub regional. */
export async function eliminarHub(id: string): Promise<void> {
  await send("DELETE", `/hub_regional/${id}`);
}

/* ----------------------------- Almacenes ----------------------------- */

export interface AlmacenRow { id: string; tipo: string; hubId: string; hubNombre: string; lugar: string; fkLugId: string }

/** Almacenes con su hub y lugar resueltos. */
export async function getAlmacenesDetalleFull(): Promise<AlmacenRow[]> {
  const [alm, hubs, lugares] = await Promise.all([getList("/almacen"), getList("/hub_regional"), getList("/lugar")]);
  return alm.map((a: any): AlmacenRow => {
    const h = hubs.find((x: any) => x.hubreg_id === a.fk_hubreg_id);
    const l = lugares.find((x: any) => x.lug_id === a.fk_lug_id);
    return {
      id: sid(a.alm_id), tipo: a.alm_tipoinstalacion,
      hubId: sid(a.fk_hubreg_id), hubNombre: h?.hubreg_nombre ?? `Hub ${a.fk_hubreg_id}`,
      lugar: l?.lug_nombre ?? "—", fkLugId: sid(a.fk_lug_id),
    };
  });
}

/** Crea un almacén. */
export async function crearAlmacen(tipo: string, hubId: string, lugarId: string): Promise<void> {
  await send("POST", "/almacen", { alm_tipoinstalacion: tipo, fk_hubreg_id: Number(hubId), fk_lug_id: Number(lugarId) });
}

/** Actualiza un almacén. */
export async function actualizarAlmacen(id: string, tipo: string, hubId: string, lugarId: string): Promise<void> {
  await send("PUT", `/almacen/${id}`, { alm_tipoinstalacion: tipo, fk_hubreg_id: Number(hubId), fk_lug_id: Number(lugarId) });
}

/** Elimina un almacén. */
export async function eliminarAlmacen(id: string): Promise<void> {
  await send("DELETE", `/almacen/${id}`);
}

/* ----------------------------- Patentes (Diseño) ----------------------------- */

export interface Patente { id: string; codigo: string; disenadorId?: string; disenador: string }

/** Lista de patentes (DISEÑO) con el empleado de I+D que la registró. */
export async function getPatentes(): Promise<Patente[]> {
  const [disenos, empleados] = await Promise.all([getList("/diseno"), getList("/empleado")]);
  return disenos.map((d: any): Patente => {
    const e = empleados.find((x: any) => x.emp_id === d.fk_emp_id);
    return {
      id: sid(d.dis_id),
      codigo: d.dis_patentecod,
      disenadorId: d.fk_emp_id != null ? sid(d.fk_emp_id) : undefined,
      disenador: e ? `${e.emp_pnombre} ${e.emp_papellido}` : "—",
    };
  });
}

/** Registra una nueva patente/diseño (código + empleado diseñador de I+D, obligatorio). */
export async function crearPatente(codigo: string, empId: string): Promise<void> {
  await send("POST", "/diseno", { dis_patentecod: codigo, fk_emp_id: Number(empId) });
}

/** Edita una patente/diseño existente (código + diseñador). */
export async function actualizarPatente(id: string, codigo: string, empId: string): Promise<void> {
  await send("PUT", `/diseno/${id}`, { dis_patentecod: codigo, fk_emp_id: Number(empId) });
}

/** Crea un set/pack (par de productos compatibles) — aparece en la pestaña de Sets. */
export async function crearSet(nombre: string, pro1: string, pro2: string): Promise<void> {
  await send("POST", "/detalle_set", { fk_pro1: Number(pro1), fk_pro2: Number(pro2), detset_nombre: nombre });
}

/** Actualiza el nombre de un set/pack. */
export async function actualizarSet(pro1: string, pro2: string, nombre: string): Promise<void> {
  await send("PUT", "/detalle_set", { fk_pro1: Number(pro1), fk_pro2: Number(pro2), detset_nombre: nombre });
}

/** Elimina un set/pack. */
export async function eliminarSet(pro1: string, pro2: string): Promise<void> {
  await send("DELETE", "/detalle_set", { fk_pro1: Number(pro1), fk_pro2: Number(pro2) });
}

/* --------------------- Reportes analíticos (lógica en la BD) --------------------- */
export interface ReporteColumna { key: string; label: string; tipo?: "texto" | "numero" | "dinero" | "pct" }
export interface ReporteResumen { id: string; titulo: string; descripcion: string }
export interface ReporteData extends ReporteResumen { columnas: ReporteColumna[]; filas: Record<string, unknown>[] }

export async function getReportes(): Promise<ReporteResumen[]> {
  return getList("/reportes");
}
export async function getReporte(id: string): Promise<ReporteData> {
  const res = await fetch(`${API_URL}/reportes/${id}`);
  if (!res.ok) throw new Error(`Reporte ${id} → ${res.status} ${await res.text()}`);
  return res.json();
}
/** URL del PDF (jsreport) de un reporte. */
export function reportePdfUrl(id: string): string {
  return `${API_URL}/reportes/${id}/pdf`;
}

/* ===================================================================== *
 * MUTACIONES                                                            *
 * ===================================================================== */

export type Recurso =
  | "usuario" | "rol"
  | "producto" | "molde_rostro" | "tipo_cuerpo" | "color"
  | "material" | "era_historico" | "exclusividad" | "profesion"
  | "categoria_producto" | "edicion";

/** Devuelve la fila cruda de una colección por id numérico (para preservar FKs en edición). */
async function rawById(path: string, idField: string, id: string): Promise<any | undefined> {
  const rows = await getList(path);
  return rows.find((r: any) => String(r[idField]) === id);
}

interface Writer {
  create: (e: any) => Promise<void>;
  update: (e: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Sincroniza los permisos de un rol (junction PERMISO_ROL) con la lista deseada. */
async function syncPermisosRol(rolId: string, deseados: string[]): Promise<void> {
  const actuales = (await getList("/permiso_rol"))
    .filter((pr: any) => String(pr.fk_rol_id) === rolId)
    .map((pr: any) => String(pr.fk_perm_id));
  const aAgregar = deseados.filter((p) => !actuales.includes(p));
  const aQuitar = actuales.filter((p) => !deseados.includes(p));
  for (const permId of aAgregar)
    await send("POST", "/permiso_rol", { fk_rol_id: Number(rolId), fk_per_id: Number(permId) });
  for (const permId of aQuitar)
    await send("DELETE", `/permiso_rol/${rolId}/${permId}`);
}

const writers: Record<Recurso, Writer> = {
  usuario: {
    create: async (u: Usuario) => {
      if (!u.rolesIds[0]) throw new Error("Selecciona un rol para el usuario.");
      if (!u.empleadoId && !u.clienteId)
        throw new Error("Un usuario debe vincularse a un empleado (interno) o a un cliente (externo).");
      await send("POST", "/usuario", {
        usu_nombre: u.nombre || u.username,
        usu_clave: u.password || "cambiar123",
        usu_correo: u.email,
        fk_rol_id: Number(u.rolesIds[0]),
        fk_emp_id: u.empleadoId ? Number(u.empleadoId) : null,
        fk_cli_id: u.clienteId ? Number(u.clienteId) : null,
      });
    },
    // La edición preserva fk_emp_id / fk_cli_id existentes (identidad inmutable por trigger).
    update: async (u: Usuario) => {
      const row = await rawById("/usuario", "usu_id", u.id);
      await send("PUT", `/usuario/${u.id}`, {
        usu_nombre: u.nombre || u.username,
        usu_clave: u.password || row?.usu_clave || "hash",
        usu_correo: u.email,
        fk_rol_id: Number(u.rolesIds[0] ?? row?.fk_rol_id),
        fk_emp_id: row?.fk_emp_id ?? null,
        fk_cli_id: row?.fk_cli_id ?? null,
      });
    },
    remove: (id) => send("DELETE", `/usuario/${id}`),
  },

  rol: {
    create: async (r: Rol) => {
      await send("POST", "/rol", { rol_nombre: r.nombre, rol_ambito: r.ambito });
      // Recupera el id del rol recién creado para sincronizar sus permisos.
      const roles = await getList("/rol");
      const nuevoRolId = roles
        .filter((x: any) => x.rol_nombre === r.nombre)
        .map((x: any) => x.rol_id as number)
        .sort((a, b) => b - a)[0];
      if (nuevoRolId && r.permisosIds.length) await syncPermisosRol(String(nuevoRolId), r.permisosIds);
    },
    update: async (r: Rol) => {
      await send("PUT", `/rol/${r.id}`, { rol_nombre: r.nombre, rol_ambito: r.ambito });
      await syncPermisosRol(r.id, r.permisosIds);
    },
    remove: (id) => send("DELETE", `/rol/${id}`),
  },


  producto: {
    create: async (p: Producto) => {
      if (!p.jugueteId || !p.categoriaId || !p.loteId || !p.edicionId || !p.exclusividadId)
        throw new Error("Un producto nuevo requiere juguete (genoma), categoría, lote, edición y exclusividad.");
      await send("POST", "/producto", {
        pro_sku: Number(p.sku),
        pro_nombre: p.nombre,
        pro_preciobase: p.precioBaseUsd,
        pro_lanzamientofecha: (p.fechaLanzamiento || "").slice(0, 10),
        pro_tipo: p.tipo,
        fk_jug_id: Number(p.jugueteId),
        fk_catpro_id: Number(p.categoriaId),
        fk_lotpro_id: Number(p.loteId),
        fk_edi_id: Number(p.edicionId),
        fk_exc_id: Number(p.exclusividadId),
      });
    },
    // La edición preserva las FK estructurales (juguete, categoría, lote, edición).
    update: async (p: Producto) => {
      const row = await rawById("/producto", "pro_id", p.id);
      await send("PUT", `/producto/${p.id}`, {
        pro_sku: Number(p.sku) || row?.pro_sku,
        pro_nombre: p.nombre,
        pro_preciobase: p.precioBaseUsd,
        pro_lanzamientofecha: (p.fechaLanzamiento || "").slice(0, 10),
        pro_tipo: p.tipo,
        fk_jug_id: row?.fk_jug_id,
        fk_catpro_id: row?.fk_catpro_id,
        fk_lotpro_id: row?.fk_lotpro_id,
        fk_edi_id: row?.fk_edi_id,
        fk_exc_id: Number(p.exclusividadId ?? row?.fk_exc_id),
      });
    },
    remove: (id) => send("DELETE", `/producto/${id}`),
  },

  molde_rostro: {
    create: (m: MoldeRostro) =>
      send("POST", "/molde_rostro", {
        molros_nombre: m.nombre,
        molros_patente: m.patente || `PAT-${Date.now()}`,
        fk_per_id: 1,
        molros_anopatente: m.anioPatente || null,
      }),
    update: async (m: MoldeRostro) => {
      const row = await rawById("/molde_rostro", "molros_id", m.id);
      await send("PUT", `/molde_rostro/${m.id}`, {
        molros_nombre: m.nombre,
        molros_patente: m.patente || row?.molros_patente,
        fk_per_id: row?.fk_per_id ?? 1,
        molros_anopatente: m.anioPatente || null,
      });
    },
    remove: (id) => send("DELETE", `/molde_rostro/${id}`),
  },

  tipo_cuerpo: {
    create: (c: TipoCuerpo) => send("POST", "/tipo_cuerpo", { tipcue_nombre: c.nombre }),
    update: (c: TipoCuerpo) => send("PUT", `/tipo_cuerpo/${c.id}`, { tipcue_nombre: c.nombre }),
    remove: (id) => send("DELETE", `/tipo_cuerpo/${id}`),
  },

  color: {
    create: (c: Color) => send("POST", "/color", { col_nombre: c.nombre, col_codhex: noHash(c.hex) }),
    update: (c: Color) => send("PUT", `/color/${c.id}`, { col_nombre: c.nombre, col_codhex: noHash(c.hex) }),
    remove: (id) => send("DELETE", `/color/${id}`),
  },

  material: {
    create: (m: Material) =>
      send("POST", "/material", { mat_nombre: m.nombre, mat_tipo: m.tipo, mat_unidad: m.unidad, mat_costo: m.costoUnitarioUsd }),
    update: (m: Material) =>
      send("PUT", `/material/${m.id}`, { mat_nombre: m.nombre, mat_tipo: m.tipo, mat_unidad: m.unidad, mat_costo: m.costoUnitarioUsd }),
    remove: (id) => send("DELETE", `/material/${id}`),
  },

  era_historico: {
    create: (e: Era) =>
      send("POST", "/era_historico", {
        erahis_nombre: e.nombre,
        erahis_fechaini: `${e.fechaInicio}-01-01`,
        erahis_fechafin: `${e.fechaFin ?? e.fechaInicio}-12-31`,
      }),
    update: (e: Era) =>
      send("PUT", `/era_historico/${e.id}`, {
        erahis_nombre: e.nombre,
        erahis_fechaini: `${e.fechaInicio}-01-01`,
        erahis_fechafin: `${e.fechaFin ?? e.fechaInicio}-12-31`,
      }),
    remove: (id) => send("DELETE", `/era_historico/${id}`),
  },

  exclusividad: {
    create: (x: Exclusividad) =>
      send("POST", "/exclusividad", { exc_nombre: x.nombre, exc_limiteproducto: x.tiradaMax }),
    update: (x: Exclusividad) =>
      send("PUT", `/exclusividad/${x.id}`, { exc_nombre: x.nombre, exc_limiteproducto: x.tiradaMax }),
    remove: (id) => send("DELETE", `/exclusividad/${id}`),
  },

  profesion: {
    create: (p: { id: string; nombre: string }) => send("POST", "/profesion", { prof_nombre: p.nombre }),
    update: (p: { id: string; nombre: string }) => send("PUT", `/profesion/${p.id}`, { prof_nombre: p.nombre }),
    remove: (id) => send("DELETE", `/profesion/${id}`),
  },

  categoria_producto: {
    create: (c: { id: string; nombre: string }) => send("POST", "/categoria_producto", { catpro_descripcion: c.nombre }),
    update: (c: { id: string; nombre: string }) => send("PUT", `/categoria_producto/${c.id}`, { catpro_descripcion: c.nombre }),
    remove: (id) => send("DELETE", `/categoria_producto/${id}`),
  },

  edicion: {
    create: (e: { id: string; nombre: string }) => send("POST", "/edicion", { edi_nombre: e.nombre }),
    update: (e: { id: string; nombre: string }) => send("PUT", `/edicion/${e.id}`, { edi_nombre: e.nombre }),
    remove: (id) => send("DELETE", `/edicion/${id}`),
  },
};

/** Id temporal en memoria para filas recién creadas (se reconcilia al recargar). */
export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Por recurso: endpoint de listado + campo id, para resolver el id real tras crear. */
const idLookup: Record<Recurso, { path: string; idField: string }> = {
  usuario: { path: "/usuario", idField: "usu_id" },
  rol: { path: "/rol", idField: "rol_id" },
  producto: { path: "/producto", idField: "pro_id" },
  molde_rostro: { path: "/molde_rostro", idField: "molros_id" },
  tipo_cuerpo: { path: "/tipo_cuerpo", idField: "tipcue_id" },
  color: { path: "/color", idField: "col_id" },
  material: { path: "/material", idField: "mat_id" },
  era_historico: { path: "/era_historico", idField: "erahis_id" },
  exclusividad: { path: "/exclusividad", idField: "exc_id" },
  profesion: { path: "/profesion", idField: "prof_id" },
  categoria_producto: { path: "/categoria_producto", idField: "catpro_id" },
  edicion: { path: "/edicion", idField: "edi_id" },
};

/** Crea (si el id es temporal/vacío) o actualiza una entidad del recurso indicado. */
export async function guardar<T extends { id: string }>(recurso: Recurso, entidad: T): Promise<T> {
  const writer = writers[recurso];
  const esNuevo = !entidad.id || /-[a-z0-9]{6}$/.test(entidad.id) && !/^\d+$/.test(entidad.id);
  if (!esNuevo) {
    await writer.update(entidad);
    return entidad;
  }
  await writer.create(entidad);
  // Resolver el id real asignado por la BD para que la UI no quede con un id
  // temporal (que rompería un borrado/edición posterior antes de recargar).
  const lk = idLookup[recurso];
  const rows = await getList(lk.path);
  const maxId = rows.reduce((m: number, r: any) => Math.max(m, Number(r[lk.idField]) || 0), 0);
  return { ...entidad, id: maxId ? String(maxId) : entidad.id };
}

/** Elimina una entidad del recurso indicado por id. */
export async function eliminar(recurso: Recurso, id: string): Promise<{ ok: true; id: string }> {
  await writers[recurso].remove(id);
  return { ok: true, id };
}
