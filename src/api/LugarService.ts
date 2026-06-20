import {sql} from "bun";
import { CORS_HEADERS, fetchAll, insertOne } from "./CorsHeaders";

type Lugar = {
    lug_id: number
    lug_nombre: string
    lug_tipo: string
    fk_lug_id: number | null
}

class LugarService{
    routes = {
        "/api/lugar": {
            GET: async (_: Bun.BunRequest<"/api/lugar">) => fetchAll<Lugar>("lugar"),
            POST: async (req: Bun.BunRequest<"/api/lugar">) => {
                const body = await req.json();
                if (!body.lug_nombre || !body.lug_tipo)
                    return new Response('lug_nombre, lug_tipo are required', { status: 400, headers: CORS_HEADERS })
                return insertOne("lugar", body)
            }
        }
    }
}

export default new LugarService()
