import { CORS_HEADERS, callProcedure, callDelete, callUpdate, listAll } from "./CorsHeaders";

type CategoriaProducto = {
    catpro_id: number
    catpro_descripcion: string
}

type Edicion = {
    edi_id: number
    edi_nombre: string
}

type Profesion = {
    prof_id: number
    prof_nombre: string
}

type Exclusividad = {
    exc_id: number
    exc_nombre: string | null
    exc_limiteproducto: number | null
}

type Producto = {
    fk_jug_id: number
    pro_id: number
    pro_sku: number
    pro_nombre: string
    pro_preciobase: number
    pro_lanzamientofecha: string
    pro_tipo: string
    fk_catpro_id: number
    fk_lotpro_id: number
    fk_edi_id: number
    fk_exc_id: number
}

type DetalleSet = {
    fk_pro1: number
    fk_pro2: number
    detset_nombre: string
}

type HistoricoProfesion = {
    hispro_anoasignacion: string
    fk_prof_id: number
    fk_pro_id: number
}

class ProductoService{
    routes = {
        "/api/categoria_producto": {
            GET: async (_: Bun.BunRequest<"/api/categoria_producto">) => listAll<CategoriaProducto>("listCategoriaProducto"),
            POST: async (req: Bun.BunRequest<"/api/categoria_producto">) => {
                const body = await req.json();
                if (!body.catpro_descripcion)
                    return new Response('catpro_descripcion is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCategoriaProducto", [body.catpro_descripcion])
            }
        },
        "/api/categoria_producto/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/categoria_producto/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteCategoriaProducto", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/categoria_producto/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateCategoriaProducto", [id, body.catpro_descripcion])
            }
        },
        "/api/edicion": {
            GET: async (_: Bun.BunRequest<"/api/edicion">) => listAll<Edicion>("listEdicion"),
            POST: async (req: Bun.BunRequest<"/api/edicion">) => {
                const body = await req.json();
                if (!body.edi_nombre)
                    return new Response('edi_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEdicion", [body.edi_nombre])
            }
        },
        "/api/edicion/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/edicion/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteEdicion", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/edicion/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateEdicion", [id, body.edi_nombre])
            }
        },
        "/api/profesion": {
            GET: async (_: Bun.BunRequest<"/api/profesion">) => listAll<Profesion>("listProfesion"),
            POST: async (req: Bun.BunRequest<"/api/profesion">) => {
                const body = await req.json();
                if (!body.prof_nombre)
                    return new Response('prof_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createProfesion", [body.prof_nombre])
            }
        },
        "/api/profesion/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/profesion/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteProfesion", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/profesion/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateProfesion", [id, body.prof_nombre])
            }
        },
        "/api/exclusividad": {
            GET: async (_: Bun.BunRequest<"/api/exclusividad">) => listAll<Exclusividad>("listExclusividad"),
            POST: async (req: Bun.BunRequest<"/api/exclusividad">) => {
                const body = await req.json();
                return callProcedure("createExclusividad", [body.exc_nombre, body.exc_limiteproducto]);
            }
        },
        "/api/exclusividad/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/exclusividad/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteExclusividad", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/exclusividad/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateExclusividad", [id, body.exc_nombre, body.exc_limiteproducto])
            }
        },
        "/api/producto": {
            GET: async (_: Bun.BunRequest<"/api/producto">) => listAll<Producto>("listProducto"),
            POST: async (req: Bun.BunRequest<"/api/producto">) => {
                const body = await req.json();
                if (!body.pro_nombre || body.pro_preciobase === undefined || !body.pro_lanzamientofecha || !body.pro_tipo || body.fk_jug_id === undefined || body.fk_catpro_id === undefined || body.fk_lotpro_id === undefined || body.fk_edi_id === undefined || body.fk_exc_id === undefined)
                    return new Response('pro_nombre, pro_preciobase, pro_lanzamientofecha, pro_tipo, fk_jug_id, fk_catpro_id, fk_lotpro_id, fk_edi_id, fk_exc_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createProducto", [body.fk_jug_id, body.pro_id, body.pro_sku, body.pro_nombre, body.pro_preciobase, body.pro_lanzamientofecha, body.pro_tipo, body.fk_catpro_id, body.fk_lotpro_id, body.fk_edi_id, body.fk_exc_id])
            }
        },
        "/api/producto/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/producto/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteProducto", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/producto/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateProducto", [id, body.pro_sku, body.pro_nombre, body.pro_preciobase, body.pro_lanzamientofecha, body.pro_tipo, body.fk_jug_id, body.fk_catpro_id, body.fk_lotpro_id, body.fk_edi_id, body.fk_exc_id])
            }
        },
        "/api/detalle_set": {
            GET: async (_: Bun.BunRequest<"/api/detalle_set">) => listAll<DetalleSet>("listDetalleSet"),
            POST: async (req: Bun.BunRequest<"/api/detalle_set">) => {
                const body = await req.json();
                if (!body.detset_nombre)
                    return new Response('detset_nombre is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDetalleSet", [body.fk_pro1, body.fk_pro2, body.detset_nombre])
            },
            PUT: async (req: Bun.BunRequest<"/api/detalle_set">) => {
                const body = await req.json();
                return callUpdate("updateDetalleSet", [body.fk_pro1, body.fk_pro2, body.detset_nombre])
            },
            DELETE: async (req: Bun.BunRequest<"/api/detalle_set">) => {
                const body = await req.json();
                return callDelete("deleteDetalleSet", [body.fk_pro1, body.fk_pro2])
            }
        },
        "/api/historico_profesion": {
            GET: async (_: Bun.BunRequest<"/api/historico_profesion">) => listAll<HistoricoProfesion>("listHistoricoProfesion"),
            POST: async (req: Bun.BunRequest<"/api/historico_profesion">) => {
                const body = await req.json();
                if (!body.hispro_anoasignacion)
                    return new Response('hispro_anoasignacion is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHistoricoProfesion", [body.hispro_anoasignacion, body.fk_prof_id, body.fk_pro_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/historico_profesion">) => {
                const body = await req.json();
                return callUpdate("updateHistoricoProfesion", [body.fk_pro_id, body.fk_prof_id, body.hispro_anoasignacion])
            },
            DELETE: async (req: Bun.BunRequest<"/api/historico_profesion">) => {
                const body = await req.json();
                return callDelete("deleteHistoricoProfesion", [body.fk_pro_id, body.fk_prof_id])
            }
        }
    }
}

export default new ProductoService()
