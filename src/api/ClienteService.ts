import {sql} from "bun";
import { CORS_HEADERS, callProcedure, fetchAll } from "./CorsHeaders";

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
        "/api/cliente": {
            GET: async (_: Bun.BunRequest<"/api/cliente">) => fetchAll<Cliente>("cliente"),
            POST: async (req: Bun.BunRequest<"/api/cliente">) => {
                const body = await req.json();
                if (!body.cli_fecharegis || body.fk_lug_id === undefined)
                    return new Response('cli_fecharegis, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCliente", [body.cli_fecharegis, body.fk_lug_id])
            }
        },
        "/api/persona_natural": {
            GET: async (_: Bun.BunRequest<"/api/persona_natural">) => fetchAll<PersonaNatural>("persona_natural"),
            POST: async (req: Bun.BunRequest<"/api/persona_natural">) => {
                const body = await req.json();
                if (!body.pernat_cedula || !body.pernat_pnombre || !body.pernat_papellido || !body.pernat_sapellido || !body.pernat_fechanac || !body.pernat_direccion)
                    return new Response('pernat_cedula, pernat_pnombre, pernat_papellido, pernat_sapellido, pernat_fechanac, pernat_direccion are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPersonaNatural", [body.fk_cli_id, body.pernat_cedula, body.pernat_pnombre, body.pernat_snombre, body.pernat_papellido, body.pernat_sapellido, body.pernat_fechanac, body.pernat_direccion])
            }
        },
        "/api/persona_juridica": {
            GET: async (_: Bun.BunRequest<"/api/persona_juridica">) => fetchAll<PersonaJuridica>("persona_juridica"),
            POST: async (req: Bun.BunRequest<"/api/persona_juridica">) => {
                const body = await req.json();
                if (!body.perjur_rif || !body.perjur_razonsocial || !body.perjur_reprelegal)
                    return new Response('perjur_rif, perjur_razonsocial, perjur_reprelegal are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPersonaJuridica", [body.fk_cli_id, body.perjur_rif, body.perjur_razonsocial, body.perjur_reprelegal])
            }
        },
        "/api/membresia": {
            GET: async (_: Bun.BunRequest<"/api/membresia">) => fetchAll<Membresia>("membresia"),
            POST: async (req: Bun.BunRequest<"/api/membresia">) => {
                const body = await req.json();
                if (!body.mem_nombre || body.mem_descuento === undefined)
                    return new Response('mem_nombre, mem_descuento are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createMembresia", [body.mem_nombre, body.mem_descuento])
            }
        },
        "/api/historico_membresia": {
            GET: async (_: Bun.BunRequest<"/api/historico_membresia">) => fetchAll<HistoricoMembresia>("historico_membresia"),
            POST: async (req: Bun.BunRequest<"/api/historico_membresia">) => {
                const body = await req.json();
                if (!body.hismem_fechaini)
                    return new Response('hismem_fechaini is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHistoricoMembresia", [body.hismem_fechaini, body.hismem_fechafin, body.fk_mem_id, body.fk_cli_id])
            }
        }
    }
}

export default new ClienteService()
