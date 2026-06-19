import {sql} from "bun";
import { CORS_HEADERS, fetchAll, insertOne } from "./CorsHeaders";

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
            GET: async (_: Bun.BunRequest<"/api/hub_regional">) => fetchAll<HubRegional>("hub_regional"),
            POST: async (req: Bun.BunRequest<"/api/hub_regional">) => {
                const body = await req.json();
                if (!body.hubreg_nombre || body.fk_lug_id === undefined)
                    return new Response('hubreg_nombre, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return insertOne("hub_regional", body)
            }
        },
        "/api/almacen": {
            GET: async (_: Bun.BunRequest<"/api/almacen">) => fetchAll<Almacen>("almacen"),
            POST: async (req: Bun.BunRequest<"/api/almacen">) => {
                const body = await req.json();
                if (!body.alm_tipoinstalacion || body.fk_hubreg_id === undefined || body.fk_lug_id === undefined)
                    return new Response('alm_tipoinstalacion, fk_hubreg_id, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return insertOne("almacen", body)
            }
        },
        "/api/inventario": {
            GET: async (_: Bun.BunRequest<"/api/inventario">) => fetchAll<Inventario>("inventario"),
            POST: async (req: Bun.BunRequest<"/api/inventario">) => {
                const body = await req.json();
                if (body.fk_pro_id === undefined || body.fk_alm_id === undefined || body.inv_stockdisponible === undefined || body.inv_cantidad === undefined || !body.inv_fecha_actualizacion)
                    return new Response('fk_pro_id, fk_alm_id, inv_stockdisponible, inv_cantidad, inv_fecha_actualizacion are required', { status: 400, headers: CORS_HEADERS })
                return insertOne("inventario", body)
            }
        }
    }
}

export default new AlmacenService()
