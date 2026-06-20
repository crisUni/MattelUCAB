import { CORS_HEADERS, callProcedure, listAll } from "./CorsHeaders";

type HubRegional = {
    hubreg_id: number
    hubreg_nombre: string
    fk_lug_id: number
}

type Almacen = {
    alm_id: number
    alm_tipoinstalacion: string
    fk_hubreg_id: number
    fk_lug_id: number
}

type Inventario = {
    fk_pro_id: number
    fk_alm_id: number
    inv_stockdisponible: number
    inv_cantidad: number
    inv_fecha_actualizacion: string
}

class AlmacenService{
    routes = {
        "/api/hub_regional": {
            GET: async (_: Bun.BunRequest<"/api/hub_regional">) => listAll<HubRegional>("listHubRegional"),
            POST: async (req: Bun.BunRequest<"/api/hub_regional">) => {
                const body = await req.json();
                if (!body.hubreg_nombre || body.fk_lug_id === undefined)
                    return new Response('hubreg_nombre, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHubRegional", [body.hubreg_nombre, body.fk_lug_id])
            }
        },
        "/api/almacen": {
            GET: async (_: Bun.BunRequest<"/api/almacen">) => listAll<Almacen>("listAlmacen"),
            POST: async (req: Bun.BunRequest<"/api/almacen">) => {
                const body = await req.json();
                if (!body.alm_tipoinstalacion || body.fk_hubreg_id === undefined || body.fk_lug_id === undefined)
                    return new Response('alm_tipoinstalacion, fk_hubreg_id, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createAlmacen", [body.alm_tipoinstalacion, body.fk_hubreg_id, body.fk_lug_id])
            }
        },
        "/api/inventario": {
            GET: async (_: Bun.BunRequest<"/api/inventario">) => listAll<Inventario>("listInventario"),
            POST: async (req: Bun.BunRequest<"/api/inventario">) => {
                const body = await req.json();
                if (body.fk_pro_id === undefined || body.fk_alm_id === undefined || body.inv_stockdisponible === undefined || body.inv_cantidad === undefined || !body.inv_fecha_actualizacion)
                    return new Response('fk_pro_id, fk_alm_id, inv_stockdisponible, inv_cantidad, inv_fecha_actualizacion are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createInventario", [body.fk_pro_id, body.fk_alm_id, body.inv_stockdisponible, body.inv_cantidad, body.inv_fecha_actualizacion])
            }
        }
    }
}

export default new AlmacenService()
