import {sql} from "bun";
import { CORS_HEADERS, callProcedure, fetchAll } from "./CorsHeaders";

type CondicionSubasta = {
    consub_id: number
    consub_nombre: string
}

type Subasta = {
    sub_id: number
    sub_fechaini: string
    sub_fechafin: string
    sub_estado: string
    sub_montoini: number
    fk_pro_id: number
    fk_consub_id: number
}

type PujaSubasta = {
    pujsub_id: number
    pujsub_monto: number
    pujsub_fechahor: string
    fk_usu_id: number
    fk_sub_id: number
}

class SubastaService{
    routes = {
        "/api/condicion_subasta": {
            GET: async (_: Bun.BunRequest<"/api/condicion_subasta">) => fetchAll<CondicionSubasta>("condicion_subasta"),
            POST: async (req: Bun.BunRequest<"/api/condicion_subasta">) => {
                const body = await req.json();
                if (!body.consub_nombre)
                    return new Response('consub_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCondicionSubasta", [body.consub_nombre])
            }
        },
        "/api/subasta": {
            GET: async (_: Bun.BunRequest<"/api/subasta">) => fetchAll<Subasta>("subasta"),
            POST: async (req: Bun.BunRequest<"/api/subasta">) => {
                const body = await req.json();
                if (!body.sub_fechaini || !body.sub_fechafin || !body.sub_estado || body.sub_montoini === undefined || body.fk_pro_id === undefined || body.fk_consub_id === undefined)
                    return new Response('sub_fechaini, sub_fechafin, sub_estado, sub_montoini, fk_pro_id, fk_consub_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createSubasta", [body.sub_fechaini, body.sub_fechafin, body.sub_estado, body.sub_montoini, body.fk_pro_id, body.fk_consub_id])
            }
        },
        "/api/puja_subasta": {
            GET: async (_: Bun.BunRequest<"/api/puja_subasta">) => fetchAll<PujaSubasta>("puja_subasta"),
            POST: async (req: Bun.BunRequest<"/api/puja_subasta">) => {
                const body = await req.json();
                if (body.pujsub_monto === undefined || !body.pujsub_fechahor || body.fk_usu_id === undefined || body.fk_sub_id === undefined)
                    return new Response('pujsub_monto, pujsub_fechahor, fk_usu_id, fk_sub_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPujaSubasta", [body.pujsub_monto, body.pujsub_fechahor, body.fk_usu_id, body.fk_sub_id])
            }
        }
    }
}

export default new SubastaService()
