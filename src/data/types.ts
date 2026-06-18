/**
 * Modelo de datos del sistema "Dream Legacy" (MattelUCAB).
 *
 * Estos tipos están pensados para mapear 1:1 con las entidades del backend.
 * La capa de acceso (src/services/api.ts) hoy devuelve mock y mañana hará fetch,
 * por lo que los componentes nunca dependen del origen de los datos.
 */

/* ------------------------------------------------------------------ */
/* Módulo 1 — Usuarios, Roles y Privilegios                           */
/* ------------------------------------------------------------------ */

export type Ambito = "BACK_OFFICE" | "FRONT_OFFICE";

export type EstadoUsuario = "ACTIVO" | "BLOQUEADO" | "INACTIVO";

export interface Usuario {
  id: string;
  nombre: string;
  username: string;
  email: string;
  passwordHash: string;
  estado: EstadoUsuario;
  rolesIds: string[];
  fechaRegistro: string; // ISO
  /** Fin del bloqueo temporal (ISO) si aplica. */
  bloqueadoHasta?: string | null;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  ambito: Ambito;
  /** Ids de permisos concedidos a este rol. */
  permisosIds: string[];
  /** Roles del sistema no se pueden eliminar. */
  esSistema?: boolean;
}

export type AccionPermiso = "VER" | "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";

export interface Permiso {
  id: string;
  nombre: string;
  /** Módulo de acceso: Inventario, Productos, Ventas, Costos, Subastas, ... */
  modulo: string;
  descripcion: string;
  /** Marca datos sensibles (costos, márgenes) para el filtrado por rol. */
  sensible?: boolean;
}

/* ------------------------------------------------------------------ */
/* Módulo 2 — Catálogo / "Genoma Barbie"                              */
/* ------------------------------------------------------------------ */

export type LabelExclusividad =
  | "PINK"
  | "BLACK"
  | "GOLD"
  | "PLATINUM";

export type EraHistorica =
  | "VINTAGE"
  | "MOD"
  | "SUPERSTAR"
  | "MODERN";

export type TipoProducto =
  | "MUNECA"
  | "ACCESORIO"
  | "INMUEBLE"
  | "VEHICULO"
  | "PACK";

export interface MoldeRostro {
  id: string;
  nombre: string;
  anioPatente: number;
  descripcion: string;
}

export interface TipoCuerpo {
  id: string;
  nombre: string; // Original, Curvy, Petite, Tall, Made-to-Move
  descripcion: string;
  /** Forma del pie para la lógica de fits. */
  formaPie: "PLANO" | "ARQUEADO";
  articulado: boolean;
}

export interface TonoPiel {
  id: string;
  nombre: string; // Claro, Medio, Bronceado, Oscuro, Fantasía
  hex: string;
}

export interface ColorMaestro {
  id: string;
  nombre: string;
  hex: string;
  /** Zona de aplicación típica: Ojos, Cabello, Labios, Vestuario, ... */
  zona: string;
}

export type TipoMaterial = "POLIMERO" | "TEXTIL" | "MECANISMO" | "PINTURA" | "METAL";

export interface Material {
  id: string;
  nombre: string;
  tipo: TipoMaterial;
  unidad: string; // g, cm², unidad, ml
  costoUnitarioUsd: number;
}

export interface Era {
  id: string;
  codigo: EraHistorica;
  nombre: string;
  rango: string; // "1959–1966"
  descripcion: string;
}

export interface Exclusividad {
  id: string;
  codigo: LabelExclusividad;
  nombre: string;
  tiradaMax: number | null; // null = masiva
  descripcion: string;
}

/** Renglón de la "receta" (BOM) de un producto. */
export interface BomItem {
  materialId: string;
  cantidad: number;
}

export type CondicionActivo = "NRFB" | "MINT" | "RESTORATION";

export interface Valoracion {
  condicion: CondicionActivo;
  precioLanzamientoUsd: number;
  anioLanzamiento: number;
  valorMercadoUsd: number;
  anioValoracion: number;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  precioBaseUsd: number;
  /** Costo de producción — dato sensible, sólo visible con permiso. */
  costoProduccionUsd: number;
  fechaLanzamiento: string; // ISO
  tipo: TipoProducto;
  // Taxonomía / ADN
  moldeRostroId?: string;
  tipoCuerpoId?: string;
  tonoPielId?: string;
  colorOjosId?: string;
  eraId?: string;
  exclusividadId?: string;
  personajeId?: string;
  bom: BomItem[];
  imagen?: string;
  stock: number;
  valoracion?: Valoracion;
}

export type ResultadoFit = "COMPATIBLE" | "ADVERTENCIA" | "INCOMPATIBLE";

export interface ReglaCompatibilidad {
  id: string;
  nombre: string;
  /** Producto/atributo base. */
  origen: string;
  /** Producto/atributo destino. */
  destino: string;
  resultado: ResultadoFit;
  motivo: string;
}

export type TipoVinculo = "PAREJA" | "HERMANA" | "AMIGA" | "RIVAL" | "MASCOTA";

export interface Vinculo {
  personajeId: string;
  tipo: TipoVinculo;
}

export interface Personaje {
  id: string;
  nombre: string;
  nombreCompleto: string;
  rol: string; // Protagonista, Pareja, Hermana, Mascota...
  debut: number;
  vinculos: Vinculo[];
}

/** Multiverso laboral: una profesión del personaje en un año concreto. */
export interface Profesion {
  id: string;
  personajeId: string;
  titulo: string;
  anio: number;
  descripcion: string;
}

export interface MobiliarioItem {
  id: string;
  nombre: string;
  usaBaterias: boolean;
}

export interface Ambiente {
  id: string;
  nombre: string; // Cocina, Dormitorio, Piscina...
  mobiliario: MobiliarioItem[];
}

export interface Dreamhouse {
  id: string;
  nombre: string;
  anio: number;
  ambientes: Ambiente[];
  /** Modelos de vehículo compatibles con el garaje. */
  vehiculosCompatibles: string[];
}

export interface Pack {
  id: string;
  sku: string;
  nombre: string;
  precioUsd: number;
  productosIds: string[];
  descripcion: string;
}

/* ------------------------------------------------------------------ */
/* Módulo 3 — Reportes                                                */
/* ------------------------------------------------------------------ */

export interface RentabilidadADN {
  moldeId: string;
  molde: string;
  anioPatente: number;
  unidadesVendidas: number;
  ingresoUsd: number;
  costoUsd: number;
  margenUsd: number;
  margenPct: number;
}

export interface DiversidadFila {
  categoria: string;
  dimension: "TONO_PIEL" | "TIPO_CUERPO";
  producidasPct: number;
  vendidasPct: number;
  unidadesProducidas: number;
}

export interface ActividadSospechosa {
  id: string;
  usuario: string;
  patron: "ACAPARAMIENTO" | "VELOCIDAD";
  referencia: string;
  detalle: string;
  riesgo: "ALTO" | "MEDIO" | "BAJO";
  fecha: string;
}

export interface Moneda {
  codigo: string;
  nombre: string;
  simbolo: string;
  /** Cuántas unidades de esta moneda equivalen a 1 USD. */
  tasaPorUsd: number;
}
