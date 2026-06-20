import { CORS_HEADERS, callProcedure, callUpdate, listAll, insertOne } from "./CorsHeaders";

type Efectivo = {
    fk_metpag_id: number
    efe_denominacion: string
}

type Tarjeta = {
    fk_metpag_id: number
    tar_numero: number
    tar_cvv: number
    tar_banco: string
    tar_emisor: string
    tar_fechaven: string
    tar_titular: string
    tar_tipo: string
}

type Cheque = {
    fk_metpag_id: number
    che_codigocuenta: number
    che_monto: number
    che_banco: string
    che_emisor: string
    che_fechaemision: string
}

type DepositoBancario = {
    fk_metpag_id: number
    depban_cuentadestino: number
    depban_bancodestino: number
    depban_fecha: string
    depban_numref: number
    depban_monto: number
}

type Transferencia = {
    fk_metpag_id: number
    tra_numref: number
    tra_fecha: string
    tra_monto: number
}

type Criptomoneda = {
    fk_metpag_id: number
    cri_idtransaccion: number
    cri_fecha: string
    cri_monto: number
    cri_direcciondestino: string
    cri_monedanombre: string
}

type BilleteraDigital = {
    fk_metpag_id: number
    bildig_codigoreferencia: string
    bildig_fecha: string
    bildig_monto: number
}

type MetodoPago = {
    metpag_id: number
}

class PagoService{
    routes = {
        "/api/efectivo": {
            GET: async (_: Bun.BunRequest<"/api/efectivo">) => listAll<Efectivo>("listEfectivo"),
            POST: async (req: Bun.BunRequest<"/api/efectivo">) => {
                const body = await req.json();
                if (!body.efe_denominacion)
                    return new Response('efe_denominacion is required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createEfectivo", [body.fk_metpag_id, body.efe_denominacion])
            },
            PUT: async (req: Bun.BunRequest<"/api/efectivo">) => {
                const body = await req.json();
                return callUpdate("updateEfectivo", [body.fk_metpag_id, body.efe_denominacion])
            }
        },
        "/api/tarjeta": {
            GET: async (_: Bun.BunRequest<"/api/tarjeta">) => listAll<Tarjeta>("listTarjeta"),
            POST: async (req: Bun.BunRequest<"/api/tarjeta">) => {
                const body = await req.json();
                if (!body.tar_numero || !body.tar_cvv || !body.tar_banco || !body.tar_emisor || !body.tar_fechaven || !body.tar_titular || !body.tar_tipo)
                    return new Response('tar_numero, tar_cvv, tar_banco, tar_emisor, tar_fechaven, tar_titular, tar_tipo are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createTarjeta", [body.fk_metpag_id, body.tar_numero, body.tar_cvv, body.tar_banco, body.tar_emisor, body.tar_fechaven, body.tar_titular, body.tar_tipo])
            },
            PUT: async (req: Bun.BunRequest<"/api/tarjeta">) => {
                const body = await req.json();
                return callUpdate("updateTarjeta", [body.fk_metpag_id, body.tar_numero, body.tar_cvv, body.tar_banco, body.tar_emisor, body.tar_fechaven, body.tar_titular, body.tar_tipo])
            }
        },
        "/api/cheque": {
            GET: async (_: Bun.BunRequest<"/api/cheque">) => listAll<Cheque>("listCheque"),
            POST: async (req: Bun.BunRequest<"/api/cheque">) => {
                const body = await req.json();
                if (body.che_codigocuenta === undefined || body.che_monto === undefined || !body.che_banco || !body.che_emisor || !body.che_fechaemision)
                    return new Response('che_codigocuenta, che_monto, che_banco, che_emisor, che_fechaemision are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCheque", [body.fk_metpag_id, body.che_codigocuenta, body.che_monto, body.che_banco, body.che_emisor, body.che_fechaemision])
            },
            PUT: async (req: Bun.BunRequest<"/api/cheque">) => {
                const body = await req.json();
                return callUpdate("updateCheque", [body.fk_metpag_id, body.che_codigocuenta, body.che_numero, body.che_titular, body.che_monto, body.che_banco, body.che_fechaemision])
            }
        },
        "/api/deposito_bancario": {
            GET: async (_: Bun.BunRequest<"/api/deposito_bancario">) => listAll<DepositoBancario>("listDepositoBancario"),
            POST: async (req: Bun.BunRequest<"/api/deposito_bancario">) => {
                const body = await req.json();
                if (body.depban_cuentadestino === undefined || body.depban_bancodestino === undefined || !body.depban_fecha || body.depban_numref === undefined || body.depban_monto === undefined)
                    return new Response('depban_cuentadestino, depban_bancodestino, depban_fecha, depban_numref, depban_monto are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createDepositoBancario", [body.fk_metpag_id, body.depban_cuentadestino, body.depban_bancodestino, body.depban_fecha, body.depban_numref, body.depban_monto])
            },
            PUT: async (req: Bun.BunRequest<"/api/deposito_bancario">) => {
                const body = await req.json();
                return callUpdate("updateDepositoBancario", [body.fk_metpag_id, body.depban_cuentadestino, body.depban_bancodestino, body.depban_fecha, body.depban_numref, body.depban_monto])
            }
        },
        "/api/transferencia": {
            GET: async (_: Bun.BunRequest<"/api/transferencia">) => listAll<Transferencia>("listTransferencia"),
            POST: async (req: Bun.BunRequest<"/api/transferencia">) => {
                const body = await req.json();
                if (body.tra_numref === undefined || !body.tra_fecha || body.tra_monto === undefined)
                    return new Response('tra_numref, tra_fecha, tra_monto are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createTransferencia", [body.fk_metpag_id, body.tra_numref, body.tra_fecha, body.tra_monto])
            },
            PUT: async (req: Bun.BunRequest<"/api/transferencia">) => {
                const body = await req.json();
                return callUpdate("updateTransferencia", [body.fk_metpag_id, body.tran_numref, body.tran_fecha, body.tran_monto])
            }
        },
        "/api/criptomoneda": {
            GET: async (_: Bun.BunRequest<"/api/criptomoneda">) => listAll<Criptomoneda>("listCriptomoneda"),
            POST: async (req: Bun.BunRequest<"/api/criptomoneda">) => {
                const body = await req.json();
                if (body.cri_idtransaccion === undefined || !body.cri_fecha || body.cri_monto === undefined || !body.cri_direcciondestino || !body.cri_monedanombre)
                    return new Response('cri_idtransaccion, cri_fecha, cri_monto, cri_direcciondestino, cri_monedanombre are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createCriptomoneda", [body.fk_metpag_id, body.cri_idtransaccion, body.cri_fecha, body.cri_monto, body.cri_direcciondestino, body.cri_monedanombre])
            },
            PUT: async (req: Bun.BunRequest<"/api/criptomoneda">) => {
                const body = await req.json();
                return callUpdate("updateCriptomoneda", [body.fk_metpag_id, body.cri_idtransaccion, body.cri_fecha, body.cri_monto, body.cri_direcciondestino, body.cri_monedanombre])
            }
        },
        "/api/billetera_digital": {
            GET: async (_: Bun.BunRequest<"/api/billetera_digital">) => listAll<BilleteraDigital>("listBilleteraDigital"),
            POST: async (req: Bun.BunRequest<"/api/billetera_digital">) => {
                const body = await req.json();
                if (!body.bildig_codigoreferencia || !body.bildig_fecha || body.bildig_monto === undefined)
                    return new Response('bildig_codigoreferencia, bildig_fecha, bildig_monto are required', { status: 400, headers: CORS_HEADERS })
                return callProcedure("createBilleteraDigital", [body.fk_metpag_id, body.bildig_codigoreferencia, body.bildig_fecha, body.bildig_monto])
            },
            PUT: async (req: Bun.BunRequest<"/api/billetera_digital">) => {
                const body = await req.json();
                return callUpdate("updateBilleteraDigital", [body.fk_metpag_id, body.bildig_codigoreferencia, body.bildig_fecha, body.bildig_monto])
            }
        },
        "/api/metodo_pago": {
            GET: async (_: Bun.BunRequest<"/api/metodo_pago">) => listAll<MetodoPago>("listMetodoPago"),
            POST: async (_: Bun.BunRequest<"/api/metodo_pago">) => insertOne("metodo_pago", {})
        }
    }
}

export default new PagoService()
