import { sql } from "bun";
import { CORS_HEADERS, callProcedure, callDelete, callUpdate, listAll } from "./CorsHeaders";

type Cliente = {
    cli_id: number
    cli_fecharegis: string
    fk_lug_id: number
}

type PersonaNatural = {
    fk_cli_id: number
    pernat_cedula: number
    pernat_pnombre: string
    pernat_snombre: string | null
    pernat_papellido: string
    pernat_sapellido: string
    pernat_fechanac: string
    pernat_direccion: string
}

type PersonaJuridica = {
    fk_cli_id: number
    perjur_rif: number
    perjur_razonsocial: string
    perjur_reprelegal: string
}

type Membresia = {
    mem_id: number
    mem_nombre: string
    mem_descuento: number
}

type HistoricoMembresia = {
    hismem_fechaini: string
    hismem_fechafin: string | null
    fk_mem_id: number | null
    fk_cli_id: number | null
}

class ClienteService{
    routes = {
        // Lugares (estados/municipios/parroquias) para el lugar de registro del cliente.
        "/api/lugar": {
            GET: async (_: Bun.BunRequest<"/api/lugar">) => listAll("listLugar"),
        },
        // Alta de cliente completo (CLIENTE + persona natural o juridica) en la BD.
        "/api/cliente_full": {
            POST: async (req: Bun.BunRequest<"/api/cliente_full">) => {
                const b = await req.json();
                if (!b.tipo || b.lug === undefined)
                    return new Response('tipo y lug son requeridos', { status: 400, headers: CORS_HEADERS })
                if (b.tipo === 'JURIDICA') {
                    if (!b.rif || !b.razon || !b.repre)
                        return new Response('rif, razon y repre son requeridos para persona juridica', { status: 400, headers: CORS_HEADERS })
                } else {
                    if (!b.cedula || !b.pnombre || !b.papellido || !b.fechanac || !b.direccion)
                        return new Response('cedula, pnombre, papellido, fechanac y direccion son requeridos para persona natural', { status: 400, headers: CORS_HEADERS })
                }
                try {
                    const rows = await sql.unsafe(
                        `SELECT crear_cliente($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) AS cli_id`,
                        [b.tipo, b.lug, b.cedula ?? '', b.pnombre ?? '', b.snombre ?? '', b.papellido ?? '', b.sapellido ?? '', b.fechanac ?? null, b.direccion ?? '', b.rif ?? '', b.razon ?? '', b.repre ?? '']
                    ) as any[];
                    return Response.json({ cli_id: rows[0].cli_id }, { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } })
                } catch (e) {
                    return new Response(String(e), { status: 500, headers: CORS_HEADERS });
                }
            }
        },
        "/api/cliente": {
            GET: async (_: Bun.BunRequest<"/api/cliente">) => listAll<Cliente>("listCliente"),
            POST: async (req: Bun.BunRequest<"/api/cliente">) => {
                const body = await req.json();
                if (!body.cli_fecharegis || body.fk_lug_id === undefined)
                    return new Response('cli_fecharegis, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCliente", [body.cli_fecharegis, body.fk_lug_id])
            }
        },
        "/api/cliente/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/cliente/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteCliente", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/cliente/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateCliente", [id, body.cli_fecharegis, body.fk_lug_id])
            }
        },
        "/api/persona_natural": {
            GET: async (_: Bun.BunRequest<"/api/persona_natural">) => listAll<PersonaNatural>("listPersonaNatural"),
            POST: async (req: Bun.BunRequest<"/api/persona_natural">) => {
                const body = await req.json();
                if (!body.pernat_cedula || !body.pernat_pnombre || !body.pernat_papellido || !body.pernat_sapellido || !body.pernat_fechanac || !body.pernat_direccion)
                    return new Response('pernat_cedula, pernat_pnombre, pernat_papellido, pernat_sapellido, pernat_fechanac, pernat_direccion are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPersonaNatural", [body.fk_cli_id, body.pernat_cedula, body.pernat_pnombre, body.pernat_snombre, body.pernat_papellido, body.pernat_sapellido, body.pernat_fechanac, body.pernat_direccion])
            },
            PUT: async (req: Bun.BunRequest<"/api/persona_natural">) => {
                const body = await req.json();
                return callUpdate("updatePersonaNatural", [body.fk_cli_id, body.pernat_cedula, body.pernat_pnombre, body.pernat_snombre, body.pernat_papellido, body.pernat_sapellido, body.pernat_fechanac, body.pernat_direccion])
            },
            DELETE: async (req: Bun.BunRequest<"/api/persona_natural">) => {
                const body = await req.json();
                return callDelete("deletePersonaNatural", [body.fk_cli_id])
            }
        },
        "/api/persona_juridica": {
            GET: async (_: Bun.BunRequest<"/api/persona_juridica">) => listAll<PersonaJuridica>("listPersonaJuridica"),
            POST: async (req: Bun.BunRequest<"/api/persona_juridica">) => {
                const body = await req.json();
                if (!body.perjur_rif || !body.perjur_razonsocial || !body.perjur_reprelegal)
                    return new Response('perjur_rif, perjur_razonsocial, perjur_reprelegal are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPersonaJuridica", [body.fk_cli_id, body.perjur_rif, body.perjur_razonsocial, body.perjur_reprelegal])
            },
            PUT: async (req: Bun.BunRequest<"/api/persona_juridica">) => {
                const body = await req.json();
                return callUpdate("updatePersonaJuridica", [body.fk_cli_id, body.perjur_rif, body.perjur_razonsocial, body.perjur_reprelegal])
            },
            DELETE: async (req: Bun.BunRequest<"/api/persona_juridica">) => {
                const body = await req.json();
                return callDelete("deletePersonaJuridica", [body.fk_cli_id])
            }
        },
        "/api/membresia": {
            GET: async (_: Bun.BunRequest<"/api/membresia">) => listAll<Membresia>("listMembresia"),
            POST: async (req: Bun.BunRequest<"/api/membresia">) => {
                const body = await req.json();
                if (!body.mem_nombre || body.mem_descuento === undefined)
                    return new Response('mem_nombre, mem_descuento are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createMembresia", [body.mem_nombre, body.mem_descuento])
            }
        },
        "/api/membresia/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/membresia/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteMembresia", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/membresia/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateMembresia", [id, body.mem_nombre, body.mem_descuento])
            }
        },
        "/api/historico_membresia": {
            GET: async (_: Bun.BunRequest<"/api/historico_membresia">) => listAll<HistoricoMembresia>("listHistoricoMembresia"),
            POST: async (req: Bun.BunRequest<"/api/historico_membresia">) => {
                const body = await req.json();
                if (!body.hismem_fechaini)
                    return new Response('hismem_fechaini is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHistoricoMembresia", [body.hismem_fechaini, body.hismem_fechafin, body.fk_mem_id, body.fk_cli_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/historico_membresia">) => {
                const body = await req.json();
                return callUpdate("updateHistoricoMembresia", [body.fk_mem_id, body.fk_cli_id, body.hismem_fechaini, body.hismem_fechafin])
            },
            DELETE: async (req: Bun.BunRequest<"/api/historico_membresia">) => {
                const body = await req.json();
                return callDelete("deleteHistoricoMembresia", [body.fk_mem_id, body.fk_cli_id])
            }
        }
    }
}

export default new ClienteService()
