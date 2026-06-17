import {sql} from "bun";
import { CORS_HEADERS } from "./CorsHeaders";

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
    per_id: number
}

class RolService{
    routes = {
        "/api/rol": {
            GET: async (_: Bun.BunRequest<"/api/form/rol">) => {
                let found: Rol[]

                try {
                    found = await sql`SELECT * FROM rol`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            }
        },

        "/api/rol/:id": {
			GET: async (req: Bun.BunRequest<"/api/persona/:id/donations">) => {
				let found: Permiso_Rol[]

				if (!Number.isInteger(Number(req.params.id)))
					return new Response("Id of rol must be valid integer", { status: 400 })

                // TODO - TEST THIS!!!
				try {
					found = await sql`SELECT * FROM Permiso p, Permiso_Rol pr WHERE pr.fk_rol_id = ${req.params.id} AND pr.fk_per_id = p.per_id`
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}

				if (!found.length)
					return new Response('No resources found', { status: 404 })
				return Response.json(found, { status: 200 , headers: { ...CORS_HEADERS, "Content-Type": "application/json"}})
			}
        },

        "/api/permiso": {
            GET: async (_: Bun.BunRequest<"/api/form/permiso">) => {
                let found: Rol[]

                try {
                    found = await sql`SELECT * FROM permiso`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            }
        }
    }
}

export default new RolService()