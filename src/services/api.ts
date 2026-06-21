/**
 * Capa de acceso a datos de "Dream Legacy".
 *
 * AHORA: cada función hace `fetch` a la API real (Bun + PostgreSQL) y adapta las
 * filas crudas (snake_case, ids numéricos) al modelo de dominio del front
 * (camelCase, ids string). La firma pública NO cambió para las lecturas, así que
 * los componentes siguen llamando getX() igual que antes.
 *
 * Fuera de alcance (siguen en mock): Reportes y Monedas.
 *
 * Mutaciones: guardar(recurso, entidad) / eliminar(recurso, id) despachan al
 * endpoint correcto por recurso. Algunos formularios no recogen todas las FK que
 * exige el esquema (ver notas en cada writer): en esos casos la edición preserva
 * las FK existentes de la fila y la creación puede estar limitada.
 */
import type {
  Usuario, Rol, Permiso,
  Producto, MoldeRostro, TipoCuerpo, Color, Material, Era, Exclusividad, TipoMaterial,
  ReglaCompatibilidad, Pack, Personaje, Profesion, Moneda, ZonaColor, TipoVinculo, ColorAplicado, BomItem,
  LabelExclusividad, AccionPermiso,
  RentabilidadADN, DiversidadFila, ActividadSospechosa,
} from "../data/types";

import { monedas } from "../data/mock/catalogosMaestros";
import { rentabilidadADN, diversidad, actividadSospechosa } from "../data/mock/reportes";

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
  pro_tipo === "SET" ? "PACK" : "MUNECA";

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
  const [compat, juguetes] = await Promise.all([
    getList("/compatibilidad_juguete"),
    getList("/juguete"),
  ]);
  const adn = (id: number) =>
    juguetes.find((j: any) => j.jug_id === id)?.jug_adn ?? `Juguete ${id}`;
  return compat.map((c: any): ReglaCompatibilidad => ({
    id: `${c.fk_juguete1}-${c.fk_juguete2}`,
    nombre: `Compatibilidad ${adn(c.fk_juguete1)} ↔ ${adn(c.fk_juguete2)}`,
    origen: adn(c.fk_juguete1),
    destino: adn(c.fk_juguete2),
    resultado: "COMPATIBLE",
    motivo: "Juguetes registrados como compatibles entre sí.",
  }));
}

export async function getPacks(): Promise<Pack[]> {
  const [sets, productos] = await Promise.all([
    getList("/detalle_set"),
    getList("/producto"),
  ]);
  const precio = (id: number) =>
    productos.find((p: any) => p.pro_id === id)?.pro_preciobase ?? 0;
  return sets.map((s: any): Pack => ({
    id: `${s.fk_pro1}-${s.fk_pro2}`,
    sku: `SET-${s.fk_pro1}-${s.fk_pro2}`,
    nombre: s.detset_nombre,
    precioUsd: precio(s.fk_pro1) + precio(s.fk_pro2),
    productosIds: [sid(s.fk_pro1), sid(s.fk_pro2)],
    descripcion: "Set de regalo que agrupa varios productos bajo un SKU.",
  }));
}

/* ===================================================================== *
 * LECTURAS — Catálogo de productos (con taxonomía/colores/BOM/stock)    *
 * ===================================================================== */

export async function getProductos(): Promise<Producto[]> {
  const [productos, juguetes, moldes, colorProd, matProd, inventario, materiales] = await Promise.all([
    getList("/producto"),
    getList("/juguete"),
    getList("/molde_rostro"),
    getList("/color_producto"),
    getList("/material_producto"),
    getList("/inventario"),
    getList("/material"),
  ]);

  // Costo unitario por material, para derivar el costo de producción desde el BOM.
  const costoMaterial = new Map<number, number>(
    materiales.map((m: any) => [m.mat_id, m.mat_costo ?? 0])
  );

  return productos.map((p: any): Producto => {
    const jug = juguetes.find((j: any) => j.jug_id === p.fk_jug_id);
    const molde = jug ? moldes.find((m: any) => m.molros_id === jug.fk_molros_id) : undefined;

    const colores: ColorAplicado[] = jug
      ? colorProd
          .filter((cp: any) => cp.fk_jug_id === jug.jug_id)
          .map((cp: any) => ({ colorId: sid(cp.fk_col_id), zona: zonaColor(cp.colpro_zonaaplicacion) }))
      : [];

    const bomRaw = jug ? matProd.filter((mp: any) => mp.fk_jug_id === jug.jug_id) : [];
    const bom: BomItem[] = bomRaw.map((mp: any) => ({ materialId: sid(mp.fk_mat_id), cantidad: mp.matpro_cantidad }));
    // Costo de producción derivado del BOM (Σ costo material × cantidad), usado como
    // snapshot cuando la BD no tiene un valor congelado (pro_costoproduccion NULL).
    const costoBom = bomRaw.reduce((s: number, mp: any) => s + (costoMaterial.get(mp.fk_mat_id) ?? 0) * mp.matpro_cantidad, 0);

    const stock = inventario
      .filter((inv: any) => inv.fk_pro_id === p.pro_id)
      .reduce((s: number, inv: any) => s + (inv.inv_stockdisponible ?? 0), 0);

    return {
      id: sid(p.pro_id),
      sku: String(p.pro_sku),
      nombre: p.pro_nombre,
      precioBaseUsd: p.pro_preciobase ?? 0,
      costoProduccionUsd: p.pro_costoproduccion ?? costoBom,
      fechaLanzamiento: p.pro_lanzamientofecha ?? "",
      tipo: tipoProducto(p.pro_tipo),
      moldeRostroId: sid(jug?.fk_molros_id) || undefined,
      tipoCuerpoId: sid(jug?.fk_tipcue_id) || undefined,
      eraId: sid(jug?.fk_erahis_id) || undefined,
      exclusividadId: sid(p.fk_exc_id) || undefined,
      personajeId: sid(molde?.fk_per_id) || undefined,
      colores,
      bom,
      stock,
    };
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

/* ===================================================================== *
 * LECTURAS — Fuera de alcance (mock): Monedas y Reportes               *
 * ===================================================================== */

const clone = <T>(d: T): T => structuredClone(d);
export const getMonedas = async (): Promise<Moneda[]> => clone(monedas);
export const getRentabilidadADN = async (): Promise<RentabilidadADN[]> => clone(rentabilidadADN);
export const getDiversidad = async (): Promise<DiversidadFila[]> => clone(diversidad);
export const getActividadSospechosa = async (): Promise<ActividadSospechosa[]> => clone(actividadSospechosa);

/* ===================================================================== *
 * MUTACIONES                                                            *
 * ===================================================================== */

export type Recurso =
  | "usuario" | "rol" | "permiso"
  | "producto" | "molde_rostro" | "tipo_cuerpo" | "color"
  | "material" | "era_historico" | "exclusividad";

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
        usu_nombre: u.username || u.nombre,
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
        usu_nombre: u.username || u.nombre,
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
      await send("POST", "/rol", { rol_nombre: r.nombre });
      // Recupera el id del rol recién creado para sincronizar sus permisos.
      const roles = await getList("/rol");
      const nuevoRolId = roles
        .filter((x: any) => x.rol_nombre === r.nombre)
        .map((x: any) => x.rol_id as number)
        .sort((a, b) => b - a)[0];
      if (nuevoRolId && r.permisosIds.length) await syncPermisosRol(String(nuevoRolId), r.permisosIds);
    },
    update: async (r: Rol) => {
      await send("PUT", `/rol/${r.id}`, { rol_nombre: r.nombre });
      await syncPermisosRol(r.id, r.permisosIds);
    },
    remove: (id) => send("DELETE", `/rol/${id}`),
  },

  permiso: {
    create: (p: Permiso) => send("POST", "/permiso", { perm_recurso: p.recurso, perm_accion: p.accion }),
    update: (p: Permiso) => send("PUT", `/permiso/${p.id}`, { perm_recurso: p.recurso, perm_accion: p.accion }),
    remove: (id) => send("DELETE", `/permiso/${id}`),
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
        pro_tipo: p.tipo === "PACK" ? "SET" : "INDIVIDUAL",
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
        pro_tipo: p.tipo === "PACK" ? "SET" : "INDIVIDUAL",
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
};

/** Id temporal en memoria para filas recién creadas (se reconcilia al recargar). */
export function nuevoId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Crea (si el id es temporal/vacío) o actualiza una entidad del recurso indicado. */
export async function guardar<T extends { id: string }>(recurso: Recurso, entidad: T): Promise<T> {
  const writer = writers[recurso];
  const esNuevo = !entidad.id || /-[a-z0-9]{6}$/.test(entidad.id) && !/^\d+$/.test(entidad.id);
  if (esNuevo) await writer.create(entidad);
  else await writer.update(entidad);
  return entidad;
}

/** Elimina una entidad del recurso indicado por id. */
export async function eliminar(recurso: Recurso, id: string): Promise<{ ok: true; id: string }> {
  await writers[recurso].remove(id);
  return { ok: true, id };
}
