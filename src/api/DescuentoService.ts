import { CORS_HEADERS, callProcedure, listAll } from "./CorsHeaders";

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
        }
    }
}

export default new DescuentoService()