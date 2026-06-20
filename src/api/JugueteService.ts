import { CORS_HEADERS, callProcedure, listAll } from "./CorsHeaders";

type Color = {
    col_id: number
    col_nombre: string
    col_codhex: string | null
}

type TipoCuerpo = {
    tipcue_id: number
    tipcue_nombre: string
}

type Material = {
    mat_id: number
    mat_nombre: string
    mat_tipo: string
    mat_unidad: string
}

type EraHistorico = {
    erahis_id: number
    erahis_nombre: string
    erahis_fechaini: string
    erahis_fechafin: string
}

type Diseno = {
    dis_id: number
    dis_patentecod: string
}

type Personaje = {
    per_id: number
    per_nombre: string
}

type MoldeRostro = {
    molros_id: number
    molros_nombre: string
    molros_patente: string
    fk_per_id: number
}

type Juguete = {
    jug_id: number
    jug_adn: string
    fk_molros_id: number | null
    fk_tipcue_id: number | null
    fk_erahis_id: number | null
    fk_dis_id: number | null
}

type VinculoPersonaje = {
    fk_personaje1: number
    fk_personaje2: number
    vinper_tipo_relacion: string
}

type CompatibilidadJuguete = {
    fk_juguete1: number
    fk_juguete2: number
}

type ColorProducto = {
    fk_col_id: number | null
    fk_jug_id: number | null
    colpro_zonaaplicacion: string
}

type MaterialProducto = {
    fk_mat_id: number | null
    fk_jug_id: number | null
    matpro_cantidad: number
}

class JugueteService{
    routes = {
        "/api/color": {
            GET: async (_: Bun.BunRequest<"/api/color">) => listAll<Color>("listColor"),
            POST: async (req: Bun.BunRequest<"/api/color">) => {
                const body = await req.json();
                if (!body.col_nombre)
                    return new Response('col_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createColor", [body.col_nombre, body.col_codhex])
            }
        },
        "/api/tipo_cuerpo": {
            GET: async (_: Bun.BunRequest<"/api/tipo_cuerpo">) => listAll<TipoCuerpo>("listTipoCuerpo"),
            POST: async (req: Bun.BunRequest<"/api/tipo_cuerpo">) => {
                const body = await req.json();
                if (!body.tipcue_nombre)
                    return new Response('tipcue_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createTipoCuerpo", [body.tipcue_nombre])
            }
        },
        "/api/material": {
            GET: async (_: Bun.BunRequest<"/api/material">) => listAll<Material>("listMaterial"),
            POST: async (req: Bun.BunRequest<"/api/material">) => {
                const body = await req.json();
                if (!body.mat_nombre || !body.mat_tipo || !body.mat_unidad || body.mat_costo === undefined)
                    return new Response('mat_nombre, mat_tipo, mat_unidad, mat_costo are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createMaterial", [body.mat_nombre, body.mat_tipo, body.mat_unidad, body.mat_costo])
            }
        },
        "/api/era_historico": {
            GET: async (_: Bun.BunRequest<"/api/era_historico">) => listAll<EraHistorico>("listEraHistorico"),
            POST: async (req: Bun.BunRequest<"/api/era_historico">) => {
                const body = await req.json();
                if (!body.erahis_nombre || !body.erahis_fechaini || !body.erahis_fechafin)
                    return new Response('erahis_nombre, erahis_fechaini, erahis_fechafin are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEraHistorico", [body.erahis_nombre, body.erahis_fechaini, body.erahis_fechafin])
            }
        },
        "/api/diseno": {
            GET: async (_: Bun.BunRequest<"/api/diseno">) => listAll<Diseno>("listDiseno"),
            POST: async (req: Bun.BunRequest<"/api/diseno">) => {
                const body = await req.json();
                if (!body.dis_patentecod)
                    return new Response('dis_patentecod is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDiseno", [body.dis_patentecod])
            }
        },
        "/api/personaje": {
            GET: async (_: Bun.BunRequest<"/api/personaje">) => listAll<Personaje>("listPersonaje"),
            POST: async (req: Bun.BunRequest<"/api/personaje">) => {
                const body = await req.json();
                if (!body.per_nombre)
                    return new Response('per_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPersonaje", [body.per_nombre])
            }
        },
        "/api/molde_rostro": {
            GET: async (_: Bun.BunRequest<"/api/molde_rostro">) => listAll<MoldeRostro>("listMoldeRostro"),
            POST: async (req: Bun.BunRequest<"/api/molde_rostro">) => {
                const body = await req.json();
                if (!body.molros_nombre || !body.molros_patente || body.fk_per_id === undefined)
                    return new Response('molros_nombre, molros_patente, fk_per_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createMoldeRostro", [body.molros_nombre, body.molros_patente, body.fk_per_id])
            }
        },
        "/api/juguete": {
            GET: async (_: Bun.BunRequest<"/api/juguete">) => listAll<Juguete>("listJuguete"),
            POST: async (req: Bun.BunRequest<"/api/juguete">) => {
                const body = await req.json();
                if (!body.jug_adn)
                    return new Response('jug_adn is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createJuguete", [body.jug_adn, body.fk_molros_id, body.fk_tipcue_id, body.fk_erahis_id, body.fk_dis_id])
            }
        },
        "/api/vinculo_personaje": {
            GET: async (_: Bun.BunRequest<"/api/vinculo_personaje">) => listAll<VinculoPersonaje>("listVinculoPersonaje"),
            POST: async (req: Bun.BunRequest<"/api/vinculo_personaje">) => {
                const body = await req.json();
                if (body.fk_personaje1 === undefined || body.fk_personaje2 === undefined || !body.vinper_tipo_relacion)
                    return new Response('fk_personaje1, fk_personaje2, vinper_tipo_relacion are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createVinculoPersonaje", [body.fk_personaje1, body.fk_personaje2, body.vinper_tipo_relacion])
            }
        },
        "/api/compatibilidad_juguete": {
            GET: async (_: Bun.BunRequest<"/api/compatibilidad_juguete">) => listAll<CompatibilidadJuguete>("listCompatibilidadJuguete"),
            POST: async (req: Bun.BunRequest<"/api/compatibilidad_juguete">) => {
                const body = await req.json();
                if (body.fk_juguete1 === undefined || body.fk_juguete2 === undefined)
                    return new Response('fk_juguete1, fk_juguete2 are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCompatibilidadJuguete", [body.fk_juguete1, body.fk_juguete2])
            }
        },
        "/api/color_producto": {
            GET: async (_: Bun.BunRequest<"/api/color_producto">) => listAll<ColorProducto>("listColorProducto"),
            POST: async (req: Bun.BunRequest<"/api/color_producto">) => {
                const body = await req.json();
                if (!body.colpro_zonaaplicacion)
                    return new Response('colpro_zonaaplicacion is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createColorProducto", [body.fk_col_id, body.fk_jug_id, body.colpro_zonaaplicacion])
            }
        },
        "/api/material_producto": {
            GET: async (_: Bun.BunRequest<"/api/material_producto">) => listAll<MaterialProducto>("listMaterialProducto"),
            POST: async (req: Bun.BunRequest<"/api/material_producto">) => {
                const body = await req.json();
                if (body.matpro_cantidad === undefined)
                    return new Response('matpro_cantidad is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createMaterialProducto", [body.fk_mat_id, body.fk_jug_id, body.matpro_cantidad])
            }
        }
    }
}

export default new JugueteService()