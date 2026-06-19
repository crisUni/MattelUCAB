import {sql} from "bun";
import { CORS_HEADERS, fetchAll, insertOne } from "./CorsHeaders";

type LoteProduccion = {
    lotpro_id: number
    lotpro_fechaini: string
    lotpro_fechafin: string | null
}

type InspeccionCalidad = {
    inscal_id: number
    inscal_fecha: string
    inscal_resultado: string | null
    fk_lotpro_id: number | null
    fk_emp_id: number
}

type Defecto = {
    def_id: number
    def_nombre: string
}

type DefectoLote = {
    deflot_cantidadafectada: number
    fk_def_id: number | null
    fk_lotpro_id: number | null
}

class InspeccionService{
    routes = {
        "/api/lote_produccion": {
            GET: async (_: Bun.BunRequest<"/api/lote_produccion">) => fetchAll<LoteProduccion>("lote_produccion"),
            POST: async (req: Bun.BunRequest<"/api/lote_produccion">) => {
                const body = await req.json();
                if (!body.lotpro_fechaini)
                    return new Response('lotpro_fechaini is required', { status: 400, headers: CORS_HEADERS })
                return insertOne("lote_produccion", body)
            }
        },
        "/api/inspeccion_calidad": {
            GET: async (_: Bun.BunRequest<"/api/inspeccion_calidad">) => fetchAll<InspeccionCalidad>("inspeccion_calidad"),
            POST: async (req: Bun.BunRequest<"/api/inspeccion_calidad">) => {
                const body = await req.json();
                if (!body.inscal_fecha || body.fk_emp_id === undefined)
                    return new Response('inscal_fecha, fk_emp_id are required', { status: 400, headers: CORS_HEADERS })
                return insertOne("inspeccion_calidad", body)
            }
        },
        "/api/defecto": {
            GET: async (_: Bun.BunRequest<"/api/defecto">) => fetchAll<Defecto>("defecto"),
            POST: async (req: Bun.BunRequest<"/api/defecto">) => {
                const body = await req.json();
                if (!body.def_nombre)
                    return new Response('def_nombre is required', { status: 400, headers: CORS_HEADERS })
                return insertOne("defecto", body)
            }
        },
        "/api/defecto_lote": {
            GET: async (_: Bun.BunRequest<"/api/defecto_lote">) => fetchAll<DefectoLote>("defecto_lote"),
            POST: async (req: Bun.BunRequest<"/api/defecto_lote">) => {
                const body = await req.json();
                if (body.deflot_cantidadafectada === undefined)
                    return new Response('deflot_cantidadafectada is required', { status: 400, headers: CORS_HEADERS })
                return insertOne("defecto_lote", body)
            }
        }
    }
}

export default new InspeccionService()
