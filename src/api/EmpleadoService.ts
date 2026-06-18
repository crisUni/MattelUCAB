import {sql} from "bun";
import { CORS_HEADERS } from "./CorsHeaders";

type Departamento = {
    id: number
    nombre: string
    descripcion: string
}

type Cargo = {
    id: number
    nombre: string
    sueldoBase: number
}

type Turno = {
    id: number
    fecha: string
    horaini: string
    horafin: string
}



class RolService{
    routes = {
        "/api/departamento": {
            GET: async (_: Bun.BunRequest<"/api/form/departamento">) => {
                let found: Departamento[]

                try {
                    found = await sql`SELECT * FROM departamento`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            }
        },

        // TODO - return every employee and their role in the given department
        "/api/departamento/:id": {
            GET: async (req: Bun.BunRequest<"/api/form/departamento">) => {
                let found: []

                if (!Number.isInteger(Number(req.params.id)))
                    return new Response("Id of departamento must be valid integer", { status: 400 })

                // TODO - TEST THIS!!!
                try {
                    found = await sql`
                    SELECT e.emp_pnombre, e.emp_papellido, c.car_nombre 
                    FROM Empleado e, Dep_emp de
                    WHERE de.fk_dep_id = ${req.params.id} AND e.emp_id = p.fk_emp_id`
                } catch (e) {
                    return new Response(String(e), { status: 500 });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404 })
                return Response.json(found, { status: 200 , headers: { ...CORS_HEADERS, "Content-Type": "application/json"}})
            }
        },

        //NOTE - change so that you can see what department and role the employee has
        "/api/empleado/:id": {
            GET: async (req: Bun.BunRequest<"/api/persona/:id">) => {
                let found: []

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

        "/api/cargo": {
            GET: async (_: Bun.BunRequest<"/api/form/cargo">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM cargo`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            }
        },

        "/api/empleado": {
            GET: async (_: Bun.BunRequest<"/api/form/cargo">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM empleado`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            }
        },

        //TODO - make this work
        "/api/empleado/:id/turnos": {
            GET: async (req: Bun.BunRequest<"/api/persona/:id/turnos">) => {
                let found: []

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
        "/api/turno": {
            GET: async (_: Bun.BunRequest<"/api/form/cargo">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM turno`;
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