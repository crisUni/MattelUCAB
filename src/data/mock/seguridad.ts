import type { Permiso, Rol, Usuario } from "../types";

/** Cada permiso representa un módulo de acceso del sistema. */
export const permisos: Permiso[] = [
  { id: "perm-inv-ver", nombre: "Ver Inventario", modulo: "Inventario", descripcion: "Consultar stock y movimientos." },
  { id: "perm-inv-edit", nombre: "Modificar Stock", modulo: "Inventario", descripcion: "Ajustar existencias y entradas/salidas." },
  { id: "perm-prod-ver", nombre: "Ver Productos", modulo: "Productos", descripcion: "Consultar catálogo y fichas ADN." },
  { id: "perm-prod-edit", nombre: "Diseñar Productos", modulo: "Productos", descripcion: "Crear y editar el genoma de productos." },
  { id: "perm-ventas-ver", nombre: "Ver Ventas", modulo: "Ventas", descripcion: "Precios de lista y disponibilidad." },
  { id: "perm-ventas-edit", nombre: "Registrar Ventas", modulo: "Ventas", descripcion: "Emitir órdenes y facturas." },
  { id: "perm-costos-ver", nombre: "Ver Costos y Márgenes", modulo: "Costos", descripcion: "Costos de producción y márgenes.", sensible: true },
  { id: "perm-subastas-ver", nombre: "Acceder a Subastas", modulo: "Subastas", descripcion: "Participar en subastas exclusivas Platinum." },
  { id: "perm-reportes-ver", nombre: "Ver Reportes", modulo: "Reportes", descripcion: "Generar y exportar reportes." },
  { id: "perm-usuarios-admin", nombre: "Administrar Usuarios", modulo: "Usuarios", descripcion: "Gestión de usuarios, roles y permisos." },
];

export const roles: Rol[] = [
  // ---- Back-Office (internos) ----
  { id: "rol-admin", nombre: "Administrador", descripcion: "Control total del sistema.", ambito: "BACK_OFFICE", esSistema: true,
    permisosIds: permisos.map((p) => p.id) },
  { id: "rol-gerente-inv", nombre: "Gerente de Inventario", descripcion: "Ve costos de producción y modifica stock.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-inv-ver", "perm-inv-edit", "perm-prod-ver", "perm-costos-ver", "perm-reportes-ver"] },
  { id: "rol-vendedor", nombre: "Vendedor", descripcion: "Sólo precios de lista y disponibilidad. NO ve costos.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-ventas-ver", "perm-ventas-edit", "perm-inv-ver"] },
  { id: "rol-disenador", nombre: "Diseñador / Escultor I+D", descripcion: "Diseña el genoma de los productos.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-prod-edit"] },
  { id: "rol-manufactura", nombre: "Operador de Manufactura", descripcion: "Ejecuta órdenes de producción.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-inv-ver"] },
  { id: "rol-almacen", nombre: "Personal de Almacén / Logística", descripcion: "Gestiona entradas y salidas físicas.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-inv-ver", "perm-inv-edit"] },
  { id: "rol-ejecutivo", nombre: "Ejecutivo de Cuenta Corporativa", descripcion: "Atiende clientes mayoristas B2B.", ambito: "BACK_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-ventas-ver", "perm-ventas-edit", "perm-reportes-ver"] },
  // ---- Front-Office (externos) ----
  { id: "rol-b2c", nombre: "Cliente B2C", descripcion: "Comprador minorista del portal.", ambito: "FRONT_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-ventas-ver"] },
  { id: "rol-gold", nombre: "Coleccionista Gold", descripcion: "Acceso a líneas Gold Label.", ambito: "FRONT_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-ventas-ver"] },
  { id: "rol-platinum", nombre: "Coleccionista Platinum", descripcion: "Subastas exclusivas e historial propio. Nunca ve márgenes ni datos de otros clientes.", ambito: "FRONT_OFFICE",
    permisosIds: ["perm-prod-ver", "perm-ventas-ver", "perm-subastas-ver"] },
];

const nombres = [
  "Margaret Roberts", "Carlos Pérez", "Lucía Fernández", "Andrés Gómez", "Valentina Ruiz",
  "Diego Martínez", "Sofía Herrera", "Javier Castro", "Camila Torres", "Mateo Rojas",
  "Isabella Díaz", "Sebastián Vargas", "Daniela Mendoza", "Nicolás Silva", "Gabriela Ortiz",
  "Tomás Navarro", "Antonella Reyes", "Emilio Cruz", "Renata Flores", "Maximiliano Peña",
  "Paula Romero", "Ricardo Aguilar", "Fernanda Campos", "Hugo Salazar", "Valeria Núñez",
];

const rolPool = [
  "rol-admin", "rol-gerente-inv", "rol-vendedor", "rol-disenador", "rol-manufactura",
  "rol-almacen", "rol-ejecutivo", "rol-b2c", "rol-gold", "rol-platinum",
];

function slug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".");
}

export const usuarios: Usuario[] = nombres.map((nombre, i) => {
  const estado: Usuario["estado"] = i % 9 === 4 ? "BLOQUEADO" : i % 11 === 7 ? "INACTIVO" : "ACTIVO";
  const rol = rolPool[i % rolPool.length]!;
  return {
    id: `user-${i + 1}`,
    nombre,
    username: slug(nombre),
    email: `${slug(nombre)}@mattelucab.com`,
    passwordHash: "$2b$10$" + "x".repeat(22) + (i * 7).toString(36).padEnd(8, "0"),
    estado,
    rolesIds: i === 0 ? ["rol-admin"] : [rol],
    fechaRegistro: new Date(2021, i % 12, ((i * 3) % 27) + 1).toISOString(),
    bloqueadoHasta: estado === "BLOQUEADO" ? new Date(2026, 8, 1).toISOString() : null,
  };
});
