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

/**
 * En el ER, `Usuario` sólo tiene username + hash + email. El resto son extensiones:
 * - `nombre` se obtiene del `Empleado` asociado al integrar la API.
 * - `fechaRegistro` es solo-frontend. El usuario no tiene estado/bloqueo en el ER.
 */
export interface Usuario {
  id: string;
  nombre: string;        // ← del Empleado en el ER
  username: string;      // ER: Usuario_Username
  email: string;         // ER: Usuario_Email
  passwordHash: string;  // ER: Usuario_HashPassword
  rolesIds: string[];          // ER: junction Usuario↔Rol
  fechaRegistro: string;       // solo-frontend (ISO)
  /** Vínculo de identidad — un usuario es interno (empleado) XOR externo (cliente). Requerido al crear. */
  empleadoId?: string;
  clienteId?: string;
  /** Contraseña en claro sólo al crear/editar (no se devuelve en lecturas). */
  password?: string;
}

/**
 * ER: `Rol` sólo tiene nombre. `esSistema` es solo-frontend (evita borrar roles base).
 * No tiene `descripcion` ni `ambito` (la distinción interno/externo se desprende, en el
 * ER, de si el usuario viene de `Empleado` o de `Cliente`, no de una columna en Rol).
 */
export interface Rol {
  id: string;
  nombre: string;              // ER: Rol_Nombre
  /** Ids de permisos concedidos a este rol (ER: Permiso_Rol). */
  permisosIds: string[];
  /** Roles del sistema no se pueden eliminar. Solo-frontend. */
  esSistema?: boolean;
}

export type AccionPermiso = "VER" | "CREAR" | "EDITAR" | "ELIMINAR";

/**
 * Permiso granular = (recurso, accion). Define un privilegio concreto, p.ej.
 * { recurso: "PRODUCTO", accion: "CREAR" }. Un rol se compone de varios permisos
 * y el front filtra pantallas/botones según ellos (ver `puede()` en SessionContext).
 */
export interface Permiso {
  id: string;
  recurso: string;
  accion: AccionPermiso;
}

/* ------------------------------------------------------------------ */
/* Módulo 2 — Catálogo / "Genoma Barbie"                              */
/* ------------------------------------------------------------------ */

/**
 * Etiqueta visual de exclusividad. NOTA: es solo-frontend — el ER no tiene un código
 * enumerado en Exclusividad (sólo nombre + límite). Se conserva para el sistema de
 * "labels" (Pink/Black/Gold/Platinum) y debe derivarse del nombre al integrar la API.
 */
export type LabelExclusividad =
  | "PINK"
  | "BLACK"
  | "GOLD"
  | "PLATINUM";

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
  /** Código de patente real (ER: Molde_Patente). Se muestra en lugar del año cuando existe. */
  patente?: string;
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

/**
 * Color maestro. En el ER es la entidad única `Color` (Color_id, Color_codhex,
 * Color_nombre): NO tiene zona propia ni existe un "tono de piel" aparte. La zona
 * de aplicación (piel, ojos, cabello…) vive en la relación Color↔Producto, no aquí.
 */
export interface Color {
  id: string;
  nombre: string;
  hex: string;
}

export type ZonaColor = "PIEL" | "OJOS" | "CABELLO" | "LABIOS" | "VESTUARIO";

/** Aplicación de un color a un producto en una zona concreta (junction Color_Producto · Zona_aplicacion). */
export interface ColorAplicado {
  colorId: string;
  zona: ZonaColor;
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
  nombre: string;
  /** Año de inicio (EraHisto_FechaInici). */
  fechaInicio: number;
  /** Año de fin; null = en curso (EraHisto_FechaFin). */
  fechaFin: number | null;
  /** Solo-frontend: el ER no almacena descripción de la era. */
  descripcion?: string;
}

export interface Exclusividad {
  id: string;
  codigo: LabelExclusividad;
  nombre: string;
  tiradaMax: number | null; // null = masiva (ER: Exclu_LimitProduc)
}

/** Renglón de la "receta" (BOM) de un producto. */
export interface BomItem {
  materialId: string;
  cantidad: number;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  precioBaseUsd: number;
  /**
   * Costo de producción CONGELADO al fabricar el producto (snapshot histórico).
   * NO se recalcula cuando cambian los precios de los materiales: así la rentabilidad
   * histórica permanece correcta. En el ER real este snapshot se captura por
   * `Lote producción`. El costo *vigente* (con precios actuales de material) se obtiene
   * aparte con `costoVigente()` en src/data/costing.ts.
   */
  costoProduccionUsd: number;
  fechaLanzamiento: string; // ISO
  tipo: TipoProducto;
  // Taxonomía / ADN
  moldeRostroId?: string;
  tipoCuerpoId?: string;
  eraId?: string;
  exclusividadId?: string;
  personajeId?: string;
  /**
   * Colores aplicados por zona (piel, ojos, cabello…). Sustituye a los antiguos
   * `tonoPielId`/`colorOjosId`: en el ER el color se aplica vía la junction
   * Color_Producto, y un mismo color puede usarse en cualquier zona.
   */
  colores: ColorAplicado[];
  bom: BomItem[];
  imagen?: string;
  stock: number;
  /**
   * FK estructurales necesarias para CREAR un producto (el ER liga el producto a un
   * juguete/genoma + categoría + lote + edición). Sólo se usan en el formulario de alta;
   * en lecturas la taxonomía ya viene resuelta en moldeRostroId/tipoCuerpoId/eraId.
   */
  jugueteId?: string;
  categoriaId?: string;
  loteId?: string;
  edicionId?: string;
}

/**
 * Nota de costos (dos capas, sin redundancia):
 * 1. `Producto.costoProduccionUsd` — SNAPSHOT histórico congelado en producción.
 *    Es la fuente de verdad para reportes históricos (Rentabilidad).
 * 2. `costoVigente(producto, materiales)` en src/data/costing.ts — costo recalculado
 *    con los precios ACTUALES de los materiales (Σ Material.costoUnitarioUsd × cantidad).
 *    Sirve para comparar contra el snapshot y detectar deriva de costos.
 * El costo unitario del Material es una extensión de esquema acordada (no está en el ER).
 */

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

/**
 * ER: `Personaje` sólo tiene `Perso_nombre`. `nombreCompleto`/`rol`/`debut` son
 * solo-frontend (enriquecen las fichas). Los vínculos sí existen (ER: Vinculo_Personaje
 * · Tipo_Relacion).
 */
export interface Personaje {
  id: string;
  nombre: string;            // ER: Perso_nombre
  nombreCompleto: string;    // solo-frontend
  rol: string;               // solo-frontend (Protagonista, Pareja, Hermana, …)
  debut: number;             // solo-frontend
  vinculos: Vinculo[];       // ER: Vinculo_Personaje
}

/**
 * Multiverso laboral. En el ER esto se reparte: `Profesion` es el catálogo (Profe_nombre)
 * y el año vive en `Historico_profesion` (Año_asignacion). Aquí se aplanan en un objeto;
 * `anio` mapea a Historico_profesion.Año_asignacion y `descripcion` es solo-frontend.
 */
export interface Profesion {
  id: string;
  personajeId: string;
  titulo: string;
  anio: number;
  descripcion: string;
}

// Nota: las "Dreamhouses" no son una entidad propia en el ER — son Productos de
// `tipo: INMUEBLE` dentro del catálogo. La antigua estructura anidada
// Dreamhouse → Ambiente → Mobiliario se retiró por no existir en el esquema.

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

/**
 * Monitor de scalpers. En el ER el sujeto es el `Cliente` (vía `Compra`/`Puja_Subasta`),
 * no el `Usuario`. `usuario` aquí es una etiqueta de presentación; al integrar la API
 * debe resolverse desde Cliente + sus compras/pujas.
 */
export interface ActividadSospechosa {
  id: string;
  usuario: string;
  patron: "ACAPARAMIENTO" | "VELOCIDAD";
  referencia: string;
  detalle: string;
  riesgo: "ALTO" | "MEDIO" | "BAJO";
  fecha: string;
}

/**
 * Moneda con tasa fija respecto al USD. En el ER esto es `Historico_Tasa_Cambio`
 * (pares moneda-origen / moneda-destino con fecha): `tasaPorUsd` es la última tasa
 * conocida y deberá leerse del histórico al integrar la API.
 */
export interface Moneda {
  codigo: string;
  nombre: string;
  simbolo: string;
  /** Cuántas unidades de esta moneda equivalen a 1 USD (última tasa del histórico). */
  tasaPorUsd: number;
}
