import { sql } from "bun";
import { CORS_HEADERS } from "./CorsHeaders";

/**
 * Autenticación contra la base de datos. Toda la lógica (comparación de
 * credenciales y resolución de permisos) vive en funciones SQL:
 *   - validar_login(usuario, clave) → usuario + rol si coincide
 *   - permisos_de_rol(rol_id)       → lista (recurso, accion) del rol
 */
class AuthService {
  routes = {
    "/api/login": {
      POST: async (req: Bun.BunRequest<"/api/login">) => {
        const body = await req.json();
        if (!body.usuario || !body.clave)
          return new Response("usuario and clave are required", { status: 400, headers: CORS_HEADERS });
        try {
          const rows = await sql`SELECT * FROM validar_login(${body.usuario}, ${body.clave})` as any[];
          if (!rows.length)
            return new Response("Usuario o contraseña incorrectos", { status: 401, headers: CORS_HEADERS });
          const u = rows[0];
          const permisos = await sql`SELECT * FROM permisos_de_rol(${u.rol_id})` as any[];
          return Response.json(
            {
              usuario: { id: u.usu_id, nombre: u.usu_nombre },
              rol: { id: u.rol_id, nombre: u.rol_nombre },
              permisos: permisos.map((p) => ({ recurso: p.perm_recurso, accion: p.perm_accion })),
            },
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        } catch (e) {
          return new Response(String(e), { status: 500, headers: CORS_HEADERS });
        }
      },
    },
  };
}

export default new AuthService();
