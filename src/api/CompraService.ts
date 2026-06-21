import { CORS_HEADERS, callProcedure, callDelete, callUpdate, listAll } from "./CorsHeaders";

type AcuerdoComercial = {
    acucom_id: number
    acucom_limitecredito: number
    acucom_plazopago: number
    acucom_descuentomayorista: number
    fk_perjur_id: number
}

type Transportista = {
    tra_id: number
    tra_empresa: string
}

type Compra = {
    com_id: number
    com_fechahor: string
    com_numfactura: number
    com_subtotal: number
    com_total: number
    fk_tra_id: number
    fk_acucom_id: number | null
    fk_usu_id: number
    fk_lug_id: number
}

type EstatusCompra = {
    estcom_id: number
    estcom_nom: string
    estcom_fechahoracierre: string
}

type HistoricoEstatus = {
    hisest_fechahora: string
    fk_estcom_id: number | null
    fk_com_id: number | null
}

type DescuentoCompra = {
    fk_des_id: number | null
    fk_com_id: number | null
}

type HistoricoTasaCambio = {
    histascam_id: number
    histascam_monedaoriginal: string
    histascam_monedaconvertida: string
    histascam_fecha: string
}

type Pago = {
    pag_id: number
    pag_monto: number
    pag_fecha: string
    fk_com_id: number | null
    fk_metpag_id: number | null
}

type DetalleCompra = {
    detcom_cantidad: number
    fk_com_id: number | null
    fk_pro_id: number | null
    fk_alm_id: number | null
}

class CompraService{
    routes = {
        "/api/acuerdo_comercial": {
            GET: async (_: Bun.BunRequest<"/api/acuerdo_comercial">) => listAll<AcuerdoComercial>("listAcuerdoComercial"),
            POST: async (req: Bun.BunRequest<"/api/acuerdo_comercial">) => {
                const body = await req.json();
                if (body.acucom_limitecredito === undefined || body.acucom_plazopago === undefined || body.acucom_descuentomayorista === undefined || body.fk_perjur_id === undefined)
                    return new Response('acucom_limitecredito, acucom_plazopago, acucom_descuentomayorista, fk_perjur_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createAcuerdoComercial", [body.acucom_limitecredito, body.acucom_plazopago, body.acucom_descuentomayorista, body.fk_perjur_id])
            }
        },
        "/api/acuerdo_comercial/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/acuerdo_comercial/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteAcuerdoComercial", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/acuerdo_comercial/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateAcuerdoComercial", [id, body.acucom_limitecredito, body.acucom_plazopago, body.acucom_descuentomayorista, body.fk_perjur_id])
            }
        },
        "/api/transportista": {
            GET: async (_: Bun.BunRequest<"/api/transportista">) => listAll<Transportista>("listTransportista"),
            POST: async (req: Bun.BunRequest<"/api/transportista">) => {
                const body = await req.json();
                if (!body.tra_empresa)
                    return new Response('tra_empresa is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createTransportista", [body.tra_empresa])
            }
        },
        "/api/transportista/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/transportista/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteTransportista", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/transportista/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateTransportista", [id, body.tra_empresa])
            }
        },
        "/api/compra": {
            GET: async (_: Bun.BunRequest<"/api/compra">) => listAll<Compra>("listCompra"),
            POST: async (req: Bun.BunRequest<"/api/compra">) => {
                const body = await req.json();
                if (!body.com_fechahor || body.com_numfactura === undefined || body.com_subtotal === undefined || body.com_total === undefined || body.fk_tra_id === undefined || body.fk_usu_id === undefined || body.fk_lug_id === undefined)
                    return new Response('com_fechahor, com_numfactura, com_subtotal, com_total, fk_tra_id, fk_usu_id, fk_lug_id are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCompra", [body.com_fechahor, body.com_numfactura, body.com_subtotal, body.com_total, body.fk_tra_id, body.fk_acucom_id, body.fk_usu_id, body.fk_lug_id])
            }
        },
        "/api/compra/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/compra/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteCompra", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/compra/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateCompra", [id, body.com_fechahor, body.com_numfactura, body.com_subtotal, body.com_total, body.fk_tra_id, body.fk_acucom_id, body.fk_usu_id, body.fk_lug_id])
            }
        },
        "/api/estatus_compra": {
            GET: async (_: Bun.BunRequest<"/api/estatus_compra">) => listAll<EstatusCompra>("listEstatusCompra"),
            POST: async (req: Bun.BunRequest<"/api/estatus_compra">) => {
                const body = await req.json();
                if (!body.estcom_nom || !body.estcom_fechahoracierre)
                    return new Response('estcom_nom, estcom_fechahoracierre are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEstatusCompra", [body.estcom_nom, body.estcom_fechahoracierre])
            }
        },
        "/api/estatus_compra/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/estatus_compra/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteEstatusCompra", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/estatus_compra/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateEstatusCompra", [id, body.estcom_nom, body.estcom_fechahoracierre])
            }
        },
        "/api/historico_estatus": {
            GET: async (_: Bun.BunRequest<"/api/historico_estatus">) => listAll<HistoricoEstatus>("listHistoricoEstatus"),
            POST: async (req: Bun.BunRequest<"/api/historico_estatus">) => {
                const body = await req.json();
                if (!body.hisest_fechahora)
                    return new Response('hisest_fechahora is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHistorioEstatus", [body.hisest_fechahora, body.fk_estcom_id, body.fk_com_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/historico_estatus">) => {
                const body = await req.json();
                return callUpdate("updateHistoricoEstatus", [body.fk_estcom_id, body.fk_com_id, body.hisest_fechahora])
            },
            DELETE: async (req: Bun.BunRequest<"/api/historico_estatus">) => {
                const body = await req.json();
                return callDelete("deleteHistoricoEstatus", [body.fk_estcom_id, body.fk_com_id])
            }
        },
        "/api/descuento_compra": {
            GET: async (_: Bun.BunRequest<"/api/descuento_compra">) => listAll<DescuentoCompra>("listDescuentoCompra"),
            POST: async (req: Bun.BunRequest<"/api/descuento_compra">) => {
                const body = await req.json();
                return callProcedure("createDescuentoCompra", [body.fk_des_id, body.fk_com_id]);
            },
            DELETE: async (req: Bun.BunRequest<"/api/descuento_compra">) => {
                const body = await req.json();
                return callDelete("deleteDescuentoCompra", [body.fk_des_id, body.fk_com_id])
            }
        },
        "/api/historico_tasa_cambio": {
            GET: async (_: Bun.BunRequest<"/api/historico_tasa_cambio">) => listAll<HistoricoTasaCambio>("listHistoricoTasaCambio"),
            POST: async (req: Bun.BunRequest<"/api/historico_tasa_cambio">) => {
                const body = await req.json();
                if (!body.histascam_monedaoriginal || !body.histascam_monedaconvertida || !body.histascam_fecha)
                    return new Response('histascam_monedaoriginal, histascam_monedaconvertida, histascam_fecha are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createHistoricoTasaCambio", [body.histascam_monedaoriginal, body.histascam_monedaconvertida, body.histascam_fecha])
            }
        },
        "/api/historico_tasa_cambio/:id": {
            DELETE: async (req: Bun.BunRequest<"/api/historico_tasa_cambio/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                return callDelete("deleteHistoricoTasaCambio", [id])
            },
            PUT: async (req: Bun.BunRequest<"/api/historico_tasa_cambio/:id">) => {
                const id = Number(req.params.id);
                if (!Number.isInteger(id))
                    return new Response("Id must be a valid integer", { status: 400, headers: CORS_HEADERS })
                const body = await req.json();
                return callUpdate("updateHistoricoTasaCambio", [id, body.histascam_monedaoriginal, body.histascam_monedaconvertida, body.histascam_tasa, body.histascam_fecha])
            }
        },
        "/api/pago": {
            GET: async (_: Bun.BunRequest<"/api/pago">) => listAll<Pago>("listPago"),
            POST: async (req: Bun.BunRequest<"/api/pago">) => {
                const body = await req.json();
                if (body.pag_id === undefined || body.pag_monto === undefined || !body.pag_fecha)
                    return new Response('pag_id, pag_monto, pag_fecha are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createPago", [body.pag_id, body.pag_monto, body.pag_fecha, body.fk_com_id, body.fk_metpag_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/pago">) => {
                const body = await req.json();
                return callUpdate("updatePago", [body.pag_id, body.fk_com_id, body.fk_metpag_id, body.pag_monto, body.pag_fecha])
            },
            DELETE: async (req: Bun.BunRequest<"/api/pago">) => {
                const body = await req.json();
                return callDelete("deletePago", [body.pag_id, body.fk_com_id, body.fk_metpag_id])
            }
        },
        "/api/detalle_compra": {
            GET: async (_: Bun.BunRequest<"/api/detalle_compra">) => listAll<DetalleCompra>("listDetalleCompra"),
            POST: async (req: Bun.BunRequest<"/api/detalle_compra">) => {
                const body = await req.json();
                if (body.detcom_cantidad === undefined)
                    return new Response('detcom_cantidad is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDetalleCompra", [body.detcom_cantidad, body.fk_com_id, body.fk_pro_id, body.fk_alm_id])
            },
            PUT: async (req: Bun.BunRequest<"/api/detalle_compra">) => {
                const body = await req.json();
                return callUpdate("updateDetalleCompra", [body.fk_com_id, body.fk_pro_id, body.fk_alm_id, body.detcom_cantidad])
            },
            DELETE: async (req: Bun.BunRequest<"/api/detalle_compra">) => {
                const body = await req.json();
                return callDelete("deleteDetalleCompra", [body.fk_com_id, body.fk_pro_id, body.fk_alm_id])
            }
        }
    }
}

export default new CompraService()
