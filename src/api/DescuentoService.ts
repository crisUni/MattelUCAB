import { CORS_HEADERS, callProcedure, callUpdate, listAll } from "./CorsHeaders";

type Descuento = {
    id: number
    nombre: string
    porcentaje: number
}

class DescuentoService{
    routes = {
        "/api/descuento": {
            GET: async (_: Bun.BunRequest<"/api/descuento">) => listAll<Descuento>("listDescuento"),
            POST: async (req: Bun.BunRequest<"/api/descuento">) => {
                const body = await req.json();
                if (!body.des_nombre || body.des_porcentaje === undefined)
                    return new Response('des_nombre and des_porcentaje are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDescuento", [body.des_nombre, body.des_porcentaje, body.des_fechaven])
            }
        },
        "/api/descuento/:id": {
            PUT: async (req: Bun.BunRequest<"/api/descuento/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateDescuento", [id, body.des_nombre, body.des_porcentaje, body.des_fechaven])
            }
        }
    }
}

export default new DescuentoService()