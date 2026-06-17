import {sql} from "bun";
import { CORS_HEADERS } from "./CorsHeaders";

type Descuento = {
    id: number
    nombre: string
    porcentaje: number
}

class DescuentoService{
    routes = {
        "/api/descuento": {
			GET: async (_: Bun.BunRequest<"/api/form/descuento">) => {
				let found: Descuento[]

				try {
					found = await sql`SELECT * FROM Descuento`;
				} catch (e) {
					return new Response(String(e), { status: 500, headers: CORS_HEADERS  });
				}

				if (!found.length)
					return new Response('No resources found', { status: 404, headers: CORS_HEADERS  })
				return Response.json(found, { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json"} })
			}
        }
    }
}

export default new DescuentoService()