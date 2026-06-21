import { CORS_HEADERS, callProcedure, callUpdate, listAll, fetchAll } from "./CorsHeaders";

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
        // Resumen de lotes (vista): QA, inspector, # productos, defectos. Trazabilidad.
        "/api/lote_resumen": {
            GET: async (_: Bun.BunRequest<"/api/lote_resumen">) => fetchAll("vw_lote_resumen"),
        },
        "/api/lote_produccion": {
            GET: async (_: Bun.BunRequest<"/api/lote_produccion">) => listAll<LoteProduccion>("listLoteProduccion"),
            POST: async (req: Bun.BunRequest<"/api/lote_produccion">) => {
                const body = await req.json();
                if (!body.lotpro_fechaini)
                    return new Response('lotpro_fechaini is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createLoteProduccion", [body.lotpro_fechaini, body.lotpro_fechafin])
            }
        },
        "/api/lote_produccion/:id": {
            PUT: async (req: Bun.BunRequest<"/api/lote_produccion/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateLoteProduccion", [id, body.lotpro_fechaini, body.lotpro_fechafin])
            }
        },
        "/api/inspeccion_calidad": {
            GET: async (_: Bun.BunRequest<"/api/inspeccion_calidad">) => listAll<InspeccionCalidad>("listInspeccionCalidad"),
            POST: async (req: Bun.BunRequest<"/api/inspeccion_calidad">) => {
                const body = await req.json();
                if (!body.inscal_fecha || !body.inscal_resultado || body.fk_lotpro_id === undefined || body.fk_emp_id === undefined)
                    return new Response('inscal_fecha, inscal_resultado, fk_lotpro_id, fk_emp_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createInspeccionCalidad", [body.inscal_fecha, body.inscal_resultado, body.fk_lotpro_id, body.fk_emp_id])
            }
        },
        "/api/inspeccion_calidad/:id": {
            PUT: async (req: Bun.BunRequest<"/api/inspeccion_calidad/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateInspeccionCalidad", [id, body.inscal_fecha, body.inscal_resultado, body.fk_lotpro_id])
            }
        },
        "/api/defecto": {
            GET: async (_: Bun.BunRequest<"/api/defecto">) => listAll<Defecto>("listDefecto"),
            POST: async (req: Bun.BunRequest<"/api/defecto">) => {
                const body = await req.json();
                if (!body.def_nombre)
                    return new Response('def_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDefecto", [body.def_nombre])
            }
        },
        "/api/defecto/:id": {
            PUT: async (req: Bun.BunRequest<"/api/defecto/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateDefecto", [id, body.def_nombre])
            }
        },
        "/api/defecto_lote": {
            GET: async (_: Bun.BunRequest<"/api/defecto_lote">) => listAll<DefectoLote>("listDefectoLote"),
            POST: async (req: Bun.BunRequest<"/api/defecto_lote">) => {
                const body = await req.json();
                if (body.deflot_cantidadafectada === undefined)
                    return new Response('deflot_cantidadafectada is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDefectoLote", [body.deflot_cantidadafectada, body.fk_def_id, body.fk_lotpro_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/defecto_lote">) => {
                const body = await req.json();
                return callUpdate("updateDefectoLote", [body.fk_def_id, body.fk_lotpro_id, body.deflot_cantidadafectada])
            }
        }
    }
}

export default new InspeccionService()
