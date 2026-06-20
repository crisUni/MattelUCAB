import {sql} from "bun";
import { CORS_HEADERS, callProcedure, fetchAll } from "./CorsHeaders";

type Usuario = {
    usu_id: number
    usu_nombre: string
    usu_clave: string
    usu_correo: string
    fk_rol_id: number
    fk_emp_id: number | null
    fk_cli_id: number | null
}

type PermisoRol = {
    fk_rol_id: number | null
    fk_per_id: number | null
}

class UsuarioService{
    routes = {
        "/api/usuario": {
            GET: async (_: Bun.BunRequest<"/api/usuario">) => fetchAll<Usuario>("usuario"),
            POST: async (req: Bun.BunRequest<"/api/usuario">) => {
                const body = await req.json();
                if (!body.usu_nombre || !body.usu_clave || !body.usu_correo || body.fk_rol_id === undefined)
                    return new Response('usu_nombre, usu_clave, usu_correo, fk_rol_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createUsuario", [body.usu_nombre, body.usu_clave, body.usu_correo, body.fk_rol_id, body.fk_emp_id, body.fk_cli_id])
            }
        },
        "/api/permiso_rol": {
            GET: async (_: Bun.BunRequest<"/api/permiso_rol">) => fetchAll<PermisoRol>("permiso_rol"),
            POST: async (req: Bun.BunRequest<"/api/permiso_rol">) => {
                const body = await req.json();
                return callProcedure("createPermisoRol", [body.fk_rol_id, body.fk_per_id]);
            }
        }
    }
}

export default new UsuarioService()
