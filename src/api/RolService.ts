import {sql} from "bun";
import { CORS_HEADERS, callProcedure, listAll } from "./CorsHeaders";

type Rol = {
    id: number
    nombre: string
}

type Permiso = {
    id: number
    nombre: string
}

type Permiso_Rol = {
    rol_id: number
    perm_id: number
}

class RolService{
    routes = {
        "/api/rol": {
            GET: async (_: Bun.BunRequest<"/api/rol">) => listAll<Rol>("listRol"),
            POST: async (req: Bun.BunRequest<"/api/rol">) => {
                const body = await req.json();
                if (!body.rol_nombre)
                    return new Response('rol_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createRol", [body.rol_nombre])
            }
        },

        "/api/rol/:id": {
			GET: async (req: Bun.BunRequest<"/api/rol/:id">) => {
				let found: Permiso_Rol[]

				if (!Number.isInteger(Number(req.params.id)))
					return new Response("Id of rol must be valid integer", { status: 400 })

                // TODO - TEST THIS!!!
				try {
					found = await sql`SELECT * FROM Permiso p, Permiso_Rol pr WHERE pr.fk_rol_id = ${req.params.id} AND pr.fk_perm_id = p.perm_id`
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}

				if (!found.length)
					return new Response('No resources found', { status: 404 })
				return Response.json(found, { status: 200 , headers: { ...CORS_HEADERS, "Content-Type": "application/json"}})
			}
        },

        "/api/permiso": {
            GET: async (_: Bun.BunRequest<"/api/permiso">) => listAll<Rol>("listPermiso"),
            POST: async (req: Bun.BunRequest<"/api/permiso">) => {
                const body = await req.json();
                if (!body.perm_moduloacceso)
                    return new Response('perm_moduloacceso is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPermiso", [body.perm_moduloacceso])
            }
        }
    }
}

export default new RolService()