-- ▗▖   ▗▖ ▗▖ ▗▄▄▖ ▗▄▖ ▗▄▄▖ 
-- ▐▌   ▐▌ ▐▌▐▌   ▐▌ ▐▌▐▌ ▐▌
-- ▐▌   ▐▌ ▐▌▐▌▝▜▌▐▛▀▜▌▐▛▀▚▖
-- ▐▙▄▄▖▝▚▄▞▘▝▚▄▞▘▐▌ ▐▌▐▌ ▐▌

-- FUNCTIONS --
-- Insert Estados --
CREATE OR REPLACE PROCEDURE insert_estados(varchar(50)[]) AS $$
DECLARE
    x varchar(50);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (nombre, tipo, fk_lugar)
VALUES (x, 'ESTADO', NULL);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Municipios --
CREATE OR REPLACE PROCEDURE insert_municipios(varchar(50)[], text) AS $$
DECLARE
    fid integer = (SELECT eid FROM Lugar WHERE nombre = $2 AND tipo = 'ESTADO' LIMIT 1);
    x varchar(50);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (nombre, tipo, fk_lugar)
VALUES (x, 'MUNICIPIO', fid);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Parroquias --
CREATE OR REPLACE PROCEDURE insert_parroquias(varchar(50)[], text) AS $$
DECLARE
    fid integer = (SELECT eid FROM Lugar WHERE nombre = $2 AND tipo = 'MUNICIPIO' LIMIT 1);
    x varchar(40);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (nombre, tipo, fk_lugar)
VALUES (x, 'PARROQUIA', fid);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE createTipoCuerpo (
    nombreTipoCuerpo VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TIPO_CUERPO (tipcue_nombre)
    VALUES (nombreTipoCuerpo);
END
$$;
 
CREATE OR REPLACE PROCEDURE createPersonaje (
    nombrePersonaje VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERSONAJE (per_nombre)
    VALUES (nombrePersonaje);
END
$$;

CREATE OR REPLACE PROCEDURE createVinculoPersonaje (
    fkPersonaje1 INT,
    fkPersonaje2 INT,
    tipoRelacion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO VINCULO_PERSONAJE (fk_personaje1, fk_personaje2, vinper_tipo_relacion)
    VALUES (fkPersonaje1, fkPersonaje2, tipoRelacion);
END
$$;

CREATE OR REPLACE PROCEDURE createMoldeRostro (
    nombreMolde VARCHAR(100),
    patenteMolde VARCHAR(100),
    fkPerId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MOLDE_ROSTRO (molros_nombre, molros_patente, fk_per_id)
    VALUES (nombreMolde, patenteMolde, fkPerId);
END
$$;

CREATE OR REPLACE PROCEDURE createEraHistorico (
    nombreEra VARCHAR(100),
    fechaIni DATE,
    fechaFin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ERA_HISTORICO (erahis_nombre, erahis_fechaini, erahis_fechafin)
    VALUES (nombreEra, fechaIni, fechaFin);
END
$$;

CREATE OR REPLACE PROCEDURE createMaterial (
    nombreMaterial VARCHAR(100),
    tipoMaterial VARCHAR(100),
    unidadMaterial VARCHAR(10)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MATERIAL (mat_nombre, mat_tipo, mat_unidad)
    VALUES (nombreMaterial, tipoMaterial, unidadMaterial);
END
$$;

CREATE OR REPLACE PROCEDURE createDiseno (
    patenteCodDiseno VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DISENO (dis_patentecod)
    VALUES (patenteCodDiseno);
END
$$;

CREATE OR REPLACE PROCEDURE createJuguete (
    adnJuguete VARCHAR(50),
    fkMolrosId INT,
    fkTipcueId INT,
    fkErahisId INT,
    fkDisId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO JUGUETE (jug_adn, fk_molros_id, fk_tipcue_id, fk_erahis_id, fk_dis_id)
    VALUES (adnJuguete, fkMolrosId, fkTipcueId, fkErahisId, fkDisId);
END
$$;

CREATE OR REPLACE PROCEDURE createCompatibilidadJuguete (
    fkJuguete1 INT,
    fkJuguete2 INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO COMPATIBILIDAD_JUGUETE (fk_juguete1, fk_juguete2)
    VALUES (fkJuguete1, fkJuguete2);
END
$$;

CREATE OR REPLACE PROCEDURE createColorProducto (
    fkColId INT,
    fkJugId INT,
    zonaAplicacion VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO COLOR_PRODUCTO (fk_col_id, fk_jug_id, colpro_zonaaplicacion)
    VALUES (fkColId, fkJugId, zonaAplicacion);
END
$$;

CREATE OR REPLACE PROCEDURE createMaterialProducto (
    fkMatId INT,
    fkJugId INT,
    cantidadMaterial INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MATERIAL_PRODUCTO (fk_mat_id, fk_jug_id, matpro_cantidad)
    VALUES (fkMatId, fkJugId, cantidadMaterial);
END
$$;

CREATE OR REPLACE PROCEDURE createDepartamento (
    nombreDepartamento VARCHAR(100),
    descripcionDepartamento TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DEPARTAMENTO (dep_nombre, dep_descripcion)
    VALUES (nombreDepartamento, descripcionDepartamento);
END
$$;

CREATE OR REPLACE PROCEDURE createCargo (
    nombreCargo VARCHAR(100),
    sueldoBaseCargo FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CARGO (car_nombre, car_sueldobase)
    VALUES (nombreCargo, sueldoBaseCargo);
END
$$;

CREATE OR REPLACE PROCEDURE createTurno (
    fechaTurno VARCHAR(3),
    horaIniTurno INT,
    horaFinTurno INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TURNO (tur_fecha, tur_horaini, tur_horafin)
    VALUES (fechaTurno, horaIniTurno, horaFinTurno);
END
$$;

CREATE OR REPLACE PROCEDURE createEmpleado (
    primerNombre VARCHAR(50),
    segundoNombre VARCHAR(50),
    primerApellido VARCHAR(50),
    segundoApellido VARCHAR(50),
    direccion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO EMPLEADO (emp_pnombre, emp_snombre, emp_papellido, emp_sapellido, emp_direccion)
    VALUES (primerNombre, segundoNombre, primerApellido, segundoApellido, direccion);
END
$$;

CREATE OR REPLACE PROCEDURE createDepEmp (
    fechaIni DATE,
    fechaFin DATE,
    fkDepId INT,
    fkEmpId INT,
    fkCarId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DEP_EMP (depemp_fechaini, depemp_fechafin, fk_dep_id, fk_emp_id, fk_car_id)
    VALUES (fechaIni, fechaFin, fkDepId, fkEmpId, fkCarId);
END
$$;

CREATE OR REPLACE PROCEDURE createEmpTurno (
    fkEmpId INT,
    fkTurId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO EMP_TURNO (fk_emp_id, fk_tur_id)
    VALUES (fkEmpId, fkTurId);
END
$$;
 
CREATE OR REPLACE PROCEDURE createLoteProduccion (
    fechaIniLote DATE,
    fechaFinLote DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO LOTE_PRODUCCION (lotpro_fechaini, lotpro_fechafin)
    VALUES (fechaIniLote, fechaFinLote);
END
$$;

CREATE OR REPLACE PROCEDURE createInspeccionCalidad (
    fechaInspeccion DATE,
    resultadoInspeccion VARCHAR(50),
    fkLotproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO INSPECCION_CALIDAD (inscal_fecha, inscal_resultado, fk_lotpro_id)
    VALUES (fechaInspeccion, resultadoInspeccion, fkLotproId);
END
$$;

CREATE OR REPLACE PROCEDURE createDefecto (
    nombreDefecto VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DEFECTO (def_nombre)
    VALUES (nombreDefecto);
END
$$;

CREATE OR REPLACE PROCEDURE createDefectoLote (
    cantidadAfectada INT,
    fkDefId INT,
    fkLotproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DEFECTO_LOTE (deflot_cantidadafectada, fk_def_id, fk_lotpro_id)
    VALUES (cantidadAfectada, fkDefId, fkLotproId);
END
$$;

CREATE OR REPLACE PROCEDURE createCategoriaProducto (
    descripcionCategoria TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CATEGORIA_PRODUCTO (catpro_descripcion)
    VALUES (descripcionCategoria);
END
$$;

CREATE OR REPLACE PROCEDURE createEdicion (
    nombreEdicion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO EDICION (edi_nombre)
    VALUES (nombreEdicion);
END
$$;

CREATE OR REPLACE PROCEDURE createProfesion (
    nombreProfesion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PROFESION (prof_nombre)
    VALUES (nombreProfesion);
END
$$;

CREATE OR REPLACE PROCEDURE createExclusividad (
    nombreExclusividad VARCHAR(100),
    limiteProducto INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO EXCLUSIVIDAD (exc_nombre, exc_limiteproducto)
    VALUES (nombreExclusividad, limiteProducto);
END
$$;

CREATE OR REPLACE PROCEDURE createDetalleSet (
    fkPro1 INT,
    fkPro2 INT,
    nombreSet VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DETALLE_SET (fk_pro1, fk_pro2, detset_nombre)
    VALUES (fkPro1, fkPro2, nombreSet);
END
$$;

CREATE OR REPLACE PROCEDURE createProducto (
    fkJugId INT,
    proId INT,
    proSku INT,
    proNombre VARCHAR(100),
    proPrecioBase FLOAT,
    proLanzamientoFecha DATE,
    proTipo VARCHAR(100),
    fkCatproId INT,
    fkLotproId INT,
    fkEdiId INT,
    fkExcId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PRODUCTO (
        fk_jug_id, pro_id, pro_sku, pro_nombre, pro_preciobase, 
        pro_lanzamientofecha, pro_tipo, fk_catpro_id, fk_lotpro_id, 
        fk_edi_id, fk_exc_id
    )
    VALUES (
        fkJugId, proId, proSku, proNombre, proPrecioBase, 
        proLanzamientoFecha, proTipo, fkCatproId, fkLotproId, 
        fkEdiId, fkExcId
    );
END
$$;

CREATE OR REPLACE PROCEDURE createHistoricoProfesion (
    anoAsignacion VARCHAR(4),
    fkProfId INT,
    fkProId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO HISTORICO_PROFESION (hispro_anoasignacion, fk_prof_id, fk_pro_id)
    VALUES (anoAsignacion, fkProfId, fkProId);
END
$$;

CREATE OR REPLACE PROCEDURE createHubRegional (
    nombreHub VARCHAR(100),
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO HUB_REGIONAL (hubreg_nombre, fk_lug_id)
    VALUES (nombreHub, fkLugId);
END
$$;

CREATE OR REPLACE PROCEDURE createAlmacen (
    tipoInstalacion VARCHAR(100),
    fkHubRegId INT,
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ALMACEN (alm_tipoinstalacion, fk_hubreg_id, fk_lug_id)
    VALUES (tipoInstalacion, fkHubRegId, fkLugId);
END
$$;

CREATE OR REPLACE PROCEDURE createInventario (
    fkProId INT,
    fkAlmId INT,
    stockDisponible INT,
    cantidad INT,
    fechaActualizacion DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO INVENTARIO (fk_pro_id, fk_alm_id, inv_stockdisponible, inv_cantidad, inv_fecha_actualizacion)
    VALUES (fkProId, fkAlmId, stockDisponible, cantidad, fechaActualizacion);
END
$$;

CREATE OR REPLACE PROCEDURE createEfectivo (
    fkMetpagId INT,
    denominacion VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO EFECTIVO (fk_metpag_id, efe_denominacion)
    VALUES (fkMetpagId, denominacion);
END
$$;

CREATE OR REPLACE PROCEDURE createTarjeta (
    fkMetpagId INT,
    numero INT,
    cvv INT,
    banco VARCHAR(100),
    emisor VARCHAR(100),
    fechaVen DATE,
    titular VARCHAR(100),
    tipo VARCHAR(7)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TARJETA (
        fk_metpag_id, tar_numero, tar_cvv, tar_banco, 
        tar_emisor, tar_fechaven, tar_titular, tar_tipo
    )
    VALUES (
        fkMetpagId, numero, cvv, banco, 
        emisor, fechaVen, titular, tipo
    );
END
$$;

CREATE OR REPLACE PROCEDURE createCheque (
    fkMetpagId INT,
    codigoCuenta INT,
    monto FLOAT,
    banco VARCHAR(100),
    emisor VARCHAR(100),
    fechaEmision DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CHEQUE (
        fk_metpag_id, che_codigocuenta, che_monto, 
        che_banco, che_emisor, che_fechaemision
    )
    VALUES (
        fkMetpagId, codigoCuenta, monto, 
        banco, emisor, fechaEmision
    );
END
$$;

CREATE OR REPLACE PROCEDURE createDepositoBancario (
    fkMetpagId INT,
    cuentaDestino INT,
    bancoDestino INT,
    fecha DATE,
    numRef INT,
    monto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DEPOSITO_BANCARIO (
        fk_metpag_id, depban_cuentadestino, depban_bancodestino, 
        depban_fecha, depban_numref, depban_monto
    )
    VALUES (
        fkMetpagId, cuentaDestino, bancoDestino, 
        fecha, numRef, monto
    );
END
$$;

CREATE OR REPLACE PROCEDURE createTransferencia (
    fkMetpagId INT,
    numRef INT,
    fecha DATE,
    monto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TRANSFERENCIA (fk_metpag_id, tra_numref, tra_fecha, tra_monto)
    VALUES (fkMetpagId, numRef, fecha, monto);
END
$$;

CREATE OR REPLACE PROCEDURE createCriptomoneda (
    fkMetpagId INT,
    idTransaccion INT,
    fecha DATE,
    monto FLOAT,
    direccionDestino VARCHAR(100),
    monedaNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CRIPTOMONEDA (
        fk_metpag_id, cri_idtransaccion, cri_fecha, 
        cri_monto, cri_direcciondestino, cri_monedanombre
    )
    VALUES (
        fkMetpagId, idTransaccion, fecha, 
        monto, direccionDestino, monedaNombre
    );
END
$$;

CREATE OR REPLACE PROCEDURE createBilleteraDigital (
    fkMetpagId INT,
    codigoReferencia VARCHAR(50),
    fecha DATE,
    monto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO BILLETERA_DIGITAL (fk_metpag_id, bildig_codigoreferencia, bildig_fecha, bildig_monto)
    VALUES (fkMetpagId, codigoReferencia, fecha, monto);
END
$$;

CREATE OR REPLACE PROCEDURE createCliente (
    fechaRegistro DATE,
    fkLugarId INT,
    INOUT nuevoCliId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CLIENTE (cli_fecharegis, fk_lug_id)
    VALUES (fechaRegistro, fkLugarId)
    RETURNING cli_id INTO nuevoCliId;
END
$$;

CREATE OR REPLACE PROCEDURE createPersonaNatural (
    fkCliId INT,
    cedula INT,
    primerNombre VARCHAR(50),
    segundoNombre VARCHAR(50),
    primerApellido VARCHAR(50),
    segundoApellido VARCHAR(50),
    fechaNac DATE,
    direccion TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERSONA_NATURAL (
        fk_cli_id, pernat_cedula, pernat_pnombre, pernat_snombre, 
        pernat_papellido, pernat_sapellido, pernat_fechanac, pernat_direccion
    )
    VALUES (
        fkCliId, cedula, primerNombre, segundoNombre, 
        primerApellido, segundoApellido, fechaNac, direccion
    );
END
$$;

CREATE OR REPLACE PROCEDURE createPersonaJuridica (
    fkCliId INT,
    rif INT,
    razonSocial VARCHAR(100),
    repreLegal VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERSONA_JURIDICA (fk_cli_id, perjur_rif, perjur_razonsocial, perjur_reprelegal)
    VALUES (fkCliId, rif, razonSocial, repreLegal);
END
$$;

CREATE OR REPLACE PROCEDURE createPermiso (
    moduloAcceso VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERMISO (per_moduloacceso)
    VALUES (moduloAcceso);
END
$$;

CREATE OR REPLACE PROCEDURE createRol (
    nombreRol VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ROL (rol_nombre)
    VALUES (nombreRol);
END
$$;

CREATE OR REPLACE PROCEDURE createUsuario (
    nombreUsuario VARCHAR(50),
    claveUsuario VARCHAR(50),
    correoUsuario VARCHAR(50),
    fkRolId INT,
    fkEmpId INT DEFAULT NULL,
    fkCliId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO USUARIO (
        usu_nombre, usu_clave, usu_correo, 
        fk_rol_id, fk_emp_id, fk_cli_id
    )
    VALUES (
        nombreUsuario, claveUsuario, correoUsuario, 
        fkRolId, fkEmpId, fkCliId
    );
END
$$;
CREATE OR REPLACE PROCEDURE createPermisoRol (
    fkRolId INT,
    fkPerId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERMISO_ROL (fk_rol_id, fk_per_id)
    VALUES (fkRolId, fkPerId);
END
$$;

CREATE OR REPLACE PROCEDURE createCondicionSubasta (
    nombreCondicion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO CONDICION_SUBASTA (consub_nombre)
    VALUES (nombreCondicion);
END
$$;

CREATE OR REPLACE PROCEDURE createSubasta (
    fechaIni DATE,
    fechaFin DATE,
    estado VARCHAR(100),
    montoIni FLOAT,
    fkProId INT,
    fkConsubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO SUBASTA (
        sub_fechaini, sub_fechafin, sub_estado, 
        sub_montoini, fk_pro_id, fk_consub_id
    )
    VALUES (
        fechaIni, fechaFin, estado, 
        montoIni, fkProId, fkConsubId
    );
END
$$;

CREATE OR REPLACE PROCEDURE createPujaSubasta (
    monto FLOAT,
    fechaHora DATE,
    fkUsuId INT,
    fkSubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PUJA_SUBASTA (pujsub_monto, pujsub_fechahor, fk_usu_id, fk_sub_id)
    VALUES (monto, fechaHora, fkUsuId, fkSubId);
END
$$;

CREATE OR REPLACE PROCEDURE createAcuerdoComercial (
    limiteCredito INT,
    plazoPago INT,
    descuentoMayorista INT,
    fkPerjurId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ACUERDO_COMERCIAL (acucom_limitecredito, acucom_plazopago, acucom_descuentomayorista, fk_perjur_id)
    VALUES (limiteCredito, plazoPago, descuentoMayorista, fkPerjurId);
END
$$;

CREATE OR REPLACE PROCEDURE createTransportista (
    empresa VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TRANSPORTISTA (tra_empresa)
    VALUES (empresa);
END
$$;

CREATE OR REPLACE PROCEDURE createCompra (
    fechaHor DATE,
    numFactura INT,
    subtotal FLOAT,
    total FLOAT,
    fkTraId INT,
    fkAcucomId INT,
    fkUsuId INT,
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO COMPRA (com_fechahor, com_numfactura, com_subtotal, com_total, fk_tra_id, fk_acucom_id, fk_usu_id, fk_lug_id)
    VALUES (fechaHor, numFactura, subtotal, total, fkTraId, fkAcucomId, fkUsuId, fkLugId);
END
$$;

CREATE OR REPLACE PROCEDURE createEstatusCompra (
    nomEstatus VARCHAR(100),
    fechaHoraCierre DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ESTATUS_COMPRA (estcom_nom, estcom_fechahoracierre)
    VALUES (nomEstatus, fechaHoraCierre);
END
$$;

CREATE OR REPLACE PROCEDURE createHistorioEstatus (
    fechaHora DATE,
    fkEstcomId INT,
    fkComId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO HISTORIO_ESTATUS (hisest_fechahora, fk_estcom_id, fk_com_id)
    VALUES (fechaHora, fkEstcomId, fkComId);
END
$$;

CREATE OR REPLACE PROCEDURE createDescuento (
    nombre VARCHAR(100),
    porcentaje FLOAT,
    fechaVen DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DESCUENTO (des_nombre, des_porcentaje, des_fechaven)
    VALUES (nombre, porcentaje, fechaVen);
END
$$;

CREATE OR REPLACE PROCEDURE createDescuentoCompra (
    fkDesId INT,
    fkComId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DESCUENTO_COMPRA (fk_des_id, fk_com_id)
    VALUES (fkDesId, fkComId);
END
$$;

CREATE OR REPLACE PROCEDURE createHistoricoTasaCambio (
    monedaOriginal VARCHAR(100),
    monedaConvertida VARCHAR(100),
    fecha DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO HISTORICO_TASA_CAMBIO (histascam_monedaoriginal, histascam_monedaconvertida, histascam_fecha)
    VALUES (monedaOriginal, monedaConvertida, fecha);
END
$$;

CREATE OR REPLACE PROCEDURE createPago (
    pagId INT,
    monto FLOAT,
    fecha DATE,
    fkComId INT,
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PAGO (pag_id, pag_monto, pag_fecha, fk_com_id, fk_metpag_id)
    VALUES (pagId, monto, fecha, fkComId, fkMetpagId);
END
$$;

CREATE OR REPLACE PROCEDURE createDetalleCompra (
    cantidad INT,
    fkComId INT,
    fkProId INT,
    fkAlmId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DETALLE_COMPRA (detcom_cantidad, fk_com_id, fk_pro_id, fk_alm_id)
    VALUES (cantidad, fkComId, fkProId, fkAlmId);
END
$$;

CREATE OR REPLACE PROCEDURE createMembresia (
    nombre VARCHAR(100),
    descuento FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MEMBRESIA (mem_nombre, mem_descuento)
    VALUES (nombre, descuento);
END
$$;

CREATE OR REPLACE PROCEDURE createHistoricoMembresia (
    fechaIni DATE,
    fechaFin DATE,
    fkMemId INT,
    fkCliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO HISTORICO_MEMBRESIA (hismem_fechaini, hismem_fechafin, fk_mem_id, fk_cli_id)
    VALUES (fechaIni, fechaFin, fkMemId, fkCliId);
END
$$;
