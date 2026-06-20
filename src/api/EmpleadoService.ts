import {sql} from "bun";
import { CORS_HEADERS, callProcedure, fetchAll } from "./CorsHeaders";

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

type DepEmp = {
    depemp_fechaini: string
    depemp_fechafin: string | null
    fk_dep_id: number | null
    fk_emp_id: number | null
    fk_car_id: number | null
}

type EmpTurno = {
    fk_emp_id: number | null
    fk_tur_id: number | null
}

class RolService{
    routes = {
        "/api/departamento": {
            GET: async (_: Bun.BunRequest<"/api/departamento">) => {
                let found: Departamento[]

                try {
                    found = await sql`SELECT * FROM departamento`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            },
            POST: async (req: Bun.BunRequest<"/api/departamento">) => {
                const body = await req.json();
                if (!body.dep_nombre)
                    return new Response('dep_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDepartamento", [body.dep_nombre, body.dep_descripcion])
            }
        },

        // TODO - return every employee and their role in the given department
        "/api/departamento/:id": {
            GET: async (req: Bun.BunRequest<"/api/departamento/:id">) => {
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
            GET: async (req: Bun.BunRequest<"/api/empleado/:id">) => {
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
            GET: async (_: Bun.BunRequest<"/api/cargo">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM cargo`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            },
            POST: async (req: Bun.BunRequest<"/api/cargo">) => {
                const body = await req.json();
                if (!body.car_nombre || body.car_sueldobase === undefined)
                    return new Response('car_nombre and car_sueldobase are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCargo", [body.car_nombre, body.car_sueldobase])
            }
        },

        "/api/empleado": {
            GET: async (_: Bun.BunRequest<"/api/empleado">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM empleado`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            },
            POST: async (req: Bun.BunRequest<"/api/empleado">) => {
                const body = await req.json();
                if (!body.emp_pnombre || !body.emp_papellido || !body.emp_sapellido || !body.emp_direccion)
                    return new Response('emp_pnombre, emp_papellido, emp_sapellido, emp_direccion are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEmpleado", [body.emp_pnombre, body.emp_snombre, body.emp_papellido, body.emp_sapellido, body.emp_direccion])
            }
        },

        //TODO - make this work
        "/api/empleado/:id/turnos": {
            GET: async (req: Bun.BunRequest<"/api/empleado/:id/turnos">) => {
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
            GET: async (_: Bun.BunRequest<"/api/turno">) => {
                let found: Cargo[]

                try {
                    found = await sql`SELECT * FROM turno`;
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
                }

                if (!found.length)
                    return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
                return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
            },
            POST: async (req: Bun.BunRequest<"/api/turno">) => {
                const body = await req.json();
                if (!body.tur_fecha || body.tur_horaini === undefined || body.tur_horafin === undefined)
                    return new Response('tur_fecha, tur_horaini, tur_horafin are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createTurno", [body.tur_fecha, body.tur_horaini, body.tur_horafin])
            }
        },
        "/api/dep_emp": {
            GET: async (_: Bun.BunRequest<"/api/dep_emp">) => fetchAll<DepEmp>("dep_emp"),
            POST: async (req: Bun.BunRequest<"/api/dep_emp">) => {
                const body = await req.json();
                if (!body.depemp_fechaini || body.fk_dep_id === undefined || body.fk_emp_id === undefined || body.fk_car_id === undefined)
                    return new Response('depemp_fechaini, fk_dep_id, fk_emp_id, fk_car_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDepEmp", [body.depemp_fechaini, body.depemp_fechafin, body.fk_dep_id, body.fk_emp_id, body.fk_car_id])
            }
        },
        "/api/emp_turno": {
            GET: async (_: Bun.BunRequest<"/api/emp_turno">) => fetchAll<EmpTurno>("emp_turno"),
            POST: async (req: Bun.BunRequest<"/api/emp_turno">) => {
                const body = await req.json();
                if (body.fk_emp_id === undefined || body.fk_tur_id === undefined)
                    return new Response('fk_emp_id, fk_tur_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEmpTurno", [body.fk_emp_id, body.fk_tur_id])
            }
        }

    }
}

export default new RolService()