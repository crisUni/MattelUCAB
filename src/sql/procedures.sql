-- =====================================================================
-- CRUD complementario (get / list / update / delete) por tabla
-- Complementa los procedimientos create* del equipo.
-- Lecturas  = FUNCIONES (devuelven filas).
-- Escrituras= PROCEDIMIENTOS (mismo estilo que create*).
-- Sincronizado con el create.sql actual.
-- =====================================================================


-- ========================= LUGAR =========================
CREATE OR REPLACE FUNCTION getLugar (
    lugId INT
)
RETURNS SETOF LUGAR
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM LUGAR WHERE lug_id = lugId;
END
$$;
CREATE OR REPLACE FUNCTION listLugar ()
RETURNS SETOF LUGAR
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM LUGAR;
END
$$;
CREATE OR REPLACE PROCEDURE updateLugar (
    lugId INT,
    lugNombre VARCHAR(100),
    lugTipo VARCHAR(50),
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE LUGAR
    SET lug_nombre = lugNombre,
        lug_tipo = lugTipo,
        fk_lug_id = fkLugId
    WHERE lug_id = lugId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteLugar (
    lugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM LUGAR WHERE lug_id = lugId;
END
$$;


-- ========================= COLOR =========================
CREATE OR REPLACE FUNCTION getColor (
    colId INT
)
RETURNS SETOF COLOR
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COLOR WHERE col_id = colId;
END
$$;
CREATE OR REPLACE FUNCTION listColor ()
RETURNS SETOF COLOR
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COLOR;
END
$$;
CREATE OR REPLACE PROCEDURE updateColor (
    colId INT,
    colNombre VARCHAR(100),
    colCodhex VARCHAR(6)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE COLOR
    SET col_nombre = colNombre,
        col_codhex = colCodhex
    WHERE col_id = colId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteColor (
    colId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM COLOR WHERE col_id = colId;
END
$$;


-- ========================= TIPO_CUERPO =========================
CREATE OR REPLACE FUNCTION getTipoCuerpo (
    tipcueId INT
)
RETURNS SETOF TIPO_CUERPO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TIPO_CUERPO WHERE tipcue_id = tipcueId;
END
$$;
CREATE OR REPLACE FUNCTION listTipoCuerpo ()
RETURNS SETOF TIPO_CUERPO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TIPO_CUERPO;
END
$$;
CREATE OR REPLACE PROCEDURE updateTipoCuerpo (
    tipcueId INT,
    tipcueNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE TIPO_CUERPO
    SET tipcue_nombre = tipcueNombre
    WHERE tipcue_id = tipcueId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteTipoCuerpo (
    tipcueId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM TIPO_CUERPO WHERE tipcue_id = tipcueId;
END
$$;


-- ========================= PERSONAJE =========================
CREATE OR REPLACE FUNCTION getPersonaje (
    perId INT
)
RETURNS SETOF PERSONAJE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONAJE WHERE per_id = perId;
END
$$;
CREATE OR REPLACE FUNCTION listPersonaje ()
RETURNS SETOF PERSONAJE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONAJE;
END
$$;
CREATE OR REPLACE PROCEDURE updatePersonaje (
    perId INT,
    perNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PERSONAJE
    SET per_nombre = perNombre
    WHERE per_id = perId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePersonaje (
    perId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PERSONAJE WHERE per_id = perId;
END
$$;


-- ========================= VINCULO_PERSONAJE =========================
CREATE OR REPLACE FUNCTION getVinculoPersonaje (
    fkPersonaje1 INT,
    fkPersonaje2 INT
)
RETURNS SETOF VINCULO_PERSONAJE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM VINCULO_PERSONAJE WHERE fk_personaje1 = fkPersonaje1 AND fk_personaje2 = fkPersonaje2;
END
$$;
CREATE OR REPLACE FUNCTION listVinculoPersonaje ()
RETURNS SETOF VINCULO_PERSONAJE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM VINCULO_PERSONAJE;
END
$$;
CREATE OR REPLACE PROCEDURE updateVinculoPersonaje (
    fkPersonaje1 INT,
    fkPersonaje2 INT,
    vinperTipoRelacion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE VINCULO_PERSONAJE
    SET vinper_tipo_relacion = vinperTipoRelacion
    WHERE fk_personaje1 = fkPersonaje1 AND fk_personaje2 = fkPersonaje2;
END
$$;
CREATE OR REPLACE PROCEDURE deleteVinculoPersonaje (
    fkPersonaje1 INT,
    fkPersonaje2 INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM VINCULO_PERSONAJE WHERE fk_personaje1 = fkPersonaje1 AND fk_personaje2 = fkPersonaje2;
END
$$;


-- ========================= MOLDE_ROSTRO =========================
CREATE OR REPLACE FUNCTION getMoldeRostro (
    molrosId INT
)
RETURNS SETOF MOLDE_ROSTRO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MOLDE_ROSTRO WHERE molros_id = molrosId;
END
$$;
CREATE OR REPLACE FUNCTION listMoldeRostro ()
RETURNS SETOF MOLDE_ROSTRO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MOLDE_ROSTRO;
END
$$;
CREATE OR REPLACE PROCEDURE updateMoldeRostro (
    molrosId INT,
    molrosNombre VARCHAR(100),
    molrosPatente VARCHAR(100),
    fkPerId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE MOLDE_ROSTRO
    SET molros_nombre = molrosNombre,
        molros_patente = molrosPatente,
        fk_per_id = fkPerId
    WHERE molros_id = molrosId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteMoldeRostro (
    molrosId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM MOLDE_ROSTRO WHERE molros_id = molrosId;
END
$$;


-- ========================= ERA_HISTORICO =========================
CREATE OR REPLACE FUNCTION getEraHistorico (
    erahisId INT
)
RETURNS SETOF ERA_HISTORICO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ERA_HISTORICO WHERE erahis_id = erahisId;
END
$$;
CREATE OR REPLACE FUNCTION listEraHistorico ()
RETURNS SETOF ERA_HISTORICO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ERA_HISTORICO;
END
$$;
CREATE OR REPLACE PROCEDURE updateEraHistorico (
    erahisId INT,
    erahisNombre VARCHAR(100),
    erahisFechaini DATE,
    erahisFechafin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ERA_HISTORICO
    SET erahis_nombre = erahisNombre,
        erahis_fechaini = erahisFechaini,
        erahis_fechafin = erahisFechafin
    WHERE erahis_id = erahisId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteEraHistorico (
    erahisId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ERA_HISTORICO WHERE erahis_id = erahisId;
END
$$;


-- ========================= MATERIAL =========================
CREATE OR REPLACE FUNCTION getMaterial (
    matId INT
)
RETURNS SETOF MATERIAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MATERIAL WHERE mat_id = matId;
END
$$;
CREATE OR REPLACE FUNCTION listMaterial ()
RETURNS SETOF MATERIAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MATERIAL;
END
$$;
CREATE OR REPLACE PROCEDURE updateMaterial (
    matId INT,
    matNombre VARCHAR(100),
    matTipo VARCHAR(100),
    matUnidad VARCHAR(10),
    matCosto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE MATERIAL
    SET mat_nombre = matNombre,
        mat_tipo = matTipo,
        mat_unidad = matUnidad,
        mat_costo = matCosto
    WHERE mat_id = matId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteMaterial (
    matId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM MATERIAL WHERE mat_id = matId;
END
$$;


-- ========================= DISENO =========================
CREATE OR REPLACE FUNCTION getDiseno (
    disId INT
)
RETURNS SETOF DISENO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DISENO WHERE dis_id = disId;
END
$$;
CREATE OR REPLACE FUNCTION listDiseno ()
RETURNS SETOF DISENO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DISENO;
END
$$;
CREATE OR REPLACE PROCEDURE updateDiseno (
    disId INT,
    disPatentecod VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DISENO
    SET dis_patentecod = disPatentecod
    WHERE dis_id = disId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDiseno (
    disId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DISENO WHERE dis_id = disId;
END
$$;


-- ========================= JUGUETE =========================
CREATE OR REPLACE FUNCTION getJuguete (
    jugId INT
)
RETURNS SETOF JUGUETE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM JUGUETE WHERE jug_id = jugId;
END
$$;
CREATE OR REPLACE FUNCTION listJuguete ()
RETURNS SETOF JUGUETE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM JUGUETE;
END
$$;
CREATE OR REPLACE PROCEDURE updateJuguete (
    jugId INT,
    jugAdn VARCHAR(50),
    fkMolrosId INT,
    fkTipcueId INT,
    fkErahisId INT,
    fkDisId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE JUGUETE
    SET jug_adn = jugAdn,
        fk_molros_id = fkMolrosId,
        fk_tipcue_id = fkTipcueId,
        fk_erahis_id = fkErahisId,
        fk_dis_id = fkDisId
    WHERE jug_id = jugId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteJuguete (
    jugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM JUGUETE WHERE jug_id = jugId;
END
$$;


-- ========================= COMPATIBILIDAD_JUGUETE =========================
CREATE OR REPLACE FUNCTION getCompatibilidadJuguete (
    fkJuguete1 INT,
    fkJuguete2 INT
)
RETURNS SETOF COMPATIBILIDAD_JUGUETE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COMPATIBILIDAD_JUGUETE WHERE fk_juguete1 = fkJuguete1 AND fk_juguete2 = fkJuguete2;
END
$$;
CREATE OR REPLACE FUNCTION listCompatibilidadJuguete ()
RETURNS SETOF COMPATIBILIDAD_JUGUETE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COMPATIBILIDAD_JUGUETE;
END
$$;
-- updateCompatibilidadJuguete: omitido (tabla puente sin columnas no-clave que actualizar)
CREATE OR REPLACE PROCEDURE deleteCompatibilidadJuguete (
    fkJuguete1 INT,
    fkJuguete2 INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM COMPATIBILIDAD_JUGUETE WHERE fk_juguete1 = fkJuguete1 AND fk_juguete2 = fkJuguete2;
END
$$;


-- ========================= COLOR_PRODUCTO =========================
CREATE OR REPLACE FUNCTION getColorProducto (
    fkColId INT,
    fkJugId INT
)
RETURNS SETOF COLOR_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COLOR_PRODUCTO WHERE fk_col_id = fkColId AND fk_jug_id = fkJugId;
END
$$;
CREATE OR REPLACE FUNCTION listColorProducto ()
RETURNS SETOF COLOR_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COLOR_PRODUCTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateColorProducto (
    fkColId INT,
    fkJugId INT,
    colproZonaaplicacion VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE COLOR_PRODUCTO
    SET colpro_zonaaplicacion = colproZonaaplicacion
    WHERE fk_col_id = fkColId AND fk_jug_id = fkJugId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteColorProducto (
    fkColId INT,
    fkJugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM COLOR_PRODUCTO WHERE fk_col_id = fkColId AND fk_jug_id = fkJugId;
END
$$;


-- ========================= MATERIAL_PRODUCTO =========================
CREATE OR REPLACE FUNCTION getMaterialProducto (
    fkMatId INT,
    fkJugId INT
)
RETURNS SETOF MATERIAL_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MATERIAL_PRODUCTO WHERE fk_mat_id = fkMatId AND fk_jug_id = fkJugId;
END
$$;
CREATE OR REPLACE FUNCTION listMaterialProducto ()
RETURNS SETOF MATERIAL_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MATERIAL_PRODUCTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateMaterialProducto (
    fkMatId INT,
    fkJugId INT,
    matproCantidad INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE MATERIAL_PRODUCTO
    SET matpro_cantidad = matproCantidad
    WHERE fk_mat_id = fkMatId AND fk_jug_id = fkJugId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteMaterialProducto (
    fkMatId INT,
    fkJugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM MATERIAL_PRODUCTO WHERE fk_mat_id = fkMatId AND fk_jug_id = fkJugId;
END
$$;


-- ========================= DEPARTAMENTO =========================
CREATE OR REPLACE FUNCTION getDepartamento (
    depId INT
)
RETURNS SETOF DEPARTAMENTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEPARTAMENTO WHERE dep_id = depId;
END
$$;
CREATE OR REPLACE FUNCTION listDepartamento ()
RETURNS SETOF DEPARTAMENTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEPARTAMENTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateDepartamento (
    depId INT,
    depNombre VARCHAR(100),
    depDescripcion TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DEPARTAMENTO
    SET dep_nombre = depNombre,
        dep_descripcion = depDescripcion
    WHERE dep_id = depId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDepartamento (
    depId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DEPARTAMENTO WHERE dep_id = depId;
END
$$;


-- ========================= CARGO =========================
CREATE OR REPLACE FUNCTION getCargo (
    carId INT
)
RETURNS SETOF CARGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CARGO WHERE car_id = carId;
END
$$;
CREATE OR REPLACE FUNCTION listCargo ()
RETURNS SETOF CARGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CARGO;
END
$$;
CREATE OR REPLACE PROCEDURE updateCargo (
    carId INT,
    carNombre VARCHAR(100),
    carSueldobase FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CARGO
    SET car_nombre = carNombre,
        car_sueldobase = carSueldobase
    WHERE car_id = carId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCargo (
    carId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CARGO WHERE car_id = carId;
END
$$;


-- ========================= TURNO =========================
CREATE OR REPLACE FUNCTION getTurno (
    turId INT
)
RETURNS SETOF TURNO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TURNO WHERE tur_id = turId;
END
$$;
CREATE OR REPLACE FUNCTION listTurno ()
RETURNS SETOF TURNO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TURNO;
END
$$;
CREATE OR REPLACE PROCEDURE updateTurno (
    turId INT,
    turFecha VARCHAR(3),
    turHoraini INT,
    turHorafin INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE TURNO
    SET tur_fecha = turFecha,
        tur_horaini = turHoraini,
        tur_horafin = turHorafin
    WHERE tur_id = turId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteTurno (
    turId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM TURNO WHERE tur_id = turId;
END
$$;


-- ========================= EMPLEADO =========================
CREATE OR REPLACE FUNCTION getEmpleado (
    empId INT
)
RETURNS SETOF EMPLEADO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EMPLEADO WHERE emp_id = empId;
END
$$;
CREATE OR REPLACE FUNCTION listEmpleado ()
RETURNS SETOF EMPLEADO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EMPLEADO;
END
$$;
CREATE OR REPLACE PROCEDURE updateEmpleado (
    empId INT,
    empPnombre VARCHAR(50),
    empSnombre VARCHAR(50),
    empPapellido VARCHAR(50),
    empSapellido VARCHAR(50),
    empDireccion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EMPLEADO
    SET emp_pnombre = empPnombre,
        emp_snombre = empSnombre,
        emp_papellido = empPapellido,
        emp_sapellido = empSapellido,
        emp_direccion = empDireccion
    WHERE emp_id = empId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteEmpleado (
    empId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM EMPLEADO WHERE emp_id = empId;
END
$$;


-- ========================= DEP_EMP =========================
CREATE OR REPLACE FUNCTION getDepEmp (
    fkDepId INT,
    fkEmpId INT
)
RETURNS SETOF DEP_EMP
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEP_EMP WHERE fk_dep_id = fkDepId AND fk_emp_id = fkEmpId;
END
$$;
CREATE OR REPLACE FUNCTION listDepEmp ()
RETURNS SETOF DEP_EMP
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEP_EMP;
END
$$;
CREATE OR REPLACE PROCEDURE updateDepEmp (
    fkDepId INT,
    fkEmpId INT,
    depempFechaini DATE,
    depempFechafin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DEP_EMP
    SET depemp_fechaini = depempFechaini,
        depemp_fechafin = depempFechafin
    WHERE fk_dep_id = fkDepId AND fk_emp_id = fkEmpId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDepEmp (
    fkDepId INT,
    fkEmpId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DEP_EMP WHERE fk_dep_id = fkDepId AND fk_emp_id = fkEmpId;
END
$$;


-- ========================= CAR_EMP =========================
CREATE OR REPLACE FUNCTION getCarEmp (
    fkCarId INT,
    fkEmpId INT
)
RETURNS SETOF CAR_EMP
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CAR_EMP WHERE fk_car_id = fkCarId AND fk_emp_id = fkEmpId;
END
$$;
CREATE OR REPLACE FUNCTION listCarEmp ()
RETURNS SETOF CAR_EMP
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CAR_EMP;
END
$$;
CREATE OR REPLACE PROCEDURE updateCarEmp (
    fkCarId INT,
    fkEmpId INT,
    carempFechaini DATE,
    carempFechafin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CAR_EMP
    SET caremp_fechaini = carempFechaini,
        caremp_fechafin = carempFechafin
    WHERE fk_car_id = fkCarId AND fk_emp_id = fkEmpId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCarEmp (
    fkCarId INT,
    fkEmpId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CAR_EMP WHERE fk_car_id = fkCarId AND fk_emp_id = fkEmpId;
END
$$;


-- ========================= EMP_TURNO =========================
CREATE OR REPLACE FUNCTION getEmpTurno (
    fkEmpId INT,
    fkTurId INT
)
RETURNS SETOF EMP_TURNO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EMP_TURNO WHERE fk_emp_id = fkEmpId AND fk_tur_id = fkTurId;
END
$$;
CREATE OR REPLACE FUNCTION listEmpTurno ()
RETURNS SETOF EMP_TURNO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EMP_TURNO;
END
$$;
-- updateEmpTurno: omitido (tabla puente sin columnas no-clave que actualizar)
CREATE OR REPLACE PROCEDURE deleteEmpTurno (
    fkEmpId INT,
    fkTurId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM EMP_TURNO WHERE fk_emp_id = fkEmpId AND fk_tur_id = fkTurId;
END
$$;


-- ========================= LOTE_PRODUCCION =========================
CREATE OR REPLACE FUNCTION getLoteProduccion (
    lotproId INT
)
RETURNS SETOF LOTE_PRODUCCION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM LOTE_PRODUCCION WHERE lotpro_id = lotproId;
END
$$;
CREATE OR REPLACE FUNCTION listLoteProduccion ()
RETURNS SETOF LOTE_PRODUCCION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM LOTE_PRODUCCION;
END
$$;
CREATE OR REPLACE PROCEDURE updateLoteProduccion (
    lotproId INT,
    lotproFechaini DATE,
    lotproFechafin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE LOTE_PRODUCCION
    SET lotpro_fechaini = lotproFechaini,
        lotpro_fechafin = lotproFechafin
    WHERE lotpro_id = lotproId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteLoteProduccion (
    lotproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM LOTE_PRODUCCION WHERE lotpro_id = lotproId;
END
$$;


-- ========================= INSPECCION_CALIDAD =========================
CREATE OR REPLACE FUNCTION getInspeccionCalidad (
    inscalId INT
)
RETURNS SETOF INSPECCION_CALIDAD
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM INSPECCION_CALIDAD WHERE inscal_id = inscalId;
END
$$;
CREATE OR REPLACE FUNCTION listInspeccionCalidad ()
RETURNS SETOF INSPECCION_CALIDAD
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM INSPECCION_CALIDAD;
END
$$;
CREATE OR REPLACE PROCEDURE updateInspeccionCalidad (
    inscalId INT,
    inscalFecha DATE,
    inscalResultado VARCHAR(50),
    fkLotproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE INSPECCION_CALIDAD
    SET inscal_fecha = inscalFecha,
        inscal_resultado = inscalResultado,
        fk_lotpro_id = fkLotproId
    WHERE inscal_id = inscalId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteInspeccionCalidad (
    inscalId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM INSPECCION_CALIDAD WHERE inscal_id = inscalId;
END
$$;


-- ========================= DEFECTO =========================
CREATE OR REPLACE FUNCTION getDefecto (
    defId INT
)
RETURNS SETOF DEFECTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEFECTO WHERE def_id = defId;
END
$$;
CREATE OR REPLACE FUNCTION listDefecto ()
RETURNS SETOF DEFECTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEFECTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateDefecto (
    defId INT,
    defNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DEFECTO
    SET def_nombre = defNombre
    WHERE def_id = defId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDefecto (
    defId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DEFECTO WHERE def_id = defId;
END
$$;


-- ========================= DEFECTO_LOTE =========================
CREATE OR REPLACE FUNCTION getDefectoLote (
    fkDefId INT,
    fkLotproId INT
)
RETURNS SETOF DEFECTO_LOTE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEFECTO_LOTE WHERE fk_def_id = fkDefId AND fk_lotpro_id = fkLotproId;
END
$$;
CREATE OR REPLACE FUNCTION listDefectoLote ()
RETURNS SETOF DEFECTO_LOTE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEFECTO_LOTE;
END
$$;
CREATE OR REPLACE PROCEDURE updateDefectoLote (
    fkDefId INT,
    fkLotproId INT,
    deflotCantidadafectada INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DEFECTO_LOTE
    SET deflot_cantidadafectada = deflotCantidadafectada
    WHERE fk_def_id = fkDefId AND fk_lotpro_id = fkLotproId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDefectoLote (
    fkDefId INT,
    fkLotproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DEFECTO_LOTE WHERE fk_def_id = fkDefId AND fk_lotpro_id = fkLotproId;
END
$$;


-- ========================= CATEGORIA_PRODUCTO =========================
CREATE OR REPLACE FUNCTION getCategoriaProducto (
    catproId INT
)
RETURNS SETOF CATEGORIA_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CATEGORIA_PRODUCTO WHERE catpro_id = catproId;
END
$$;
CREATE OR REPLACE FUNCTION listCategoriaProducto ()
RETURNS SETOF CATEGORIA_PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CATEGORIA_PRODUCTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateCategoriaProducto (
    catproId INT,
    catproDescripcion TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CATEGORIA_PRODUCTO
    SET catpro_descripcion = catproDescripcion
    WHERE catpro_id = catproId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCategoriaProducto (
    catproId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CATEGORIA_PRODUCTO WHERE catpro_id = catproId;
END
$$;


-- ========================= EDICION =========================
CREATE OR REPLACE FUNCTION getEdicion (
    ediId INT
)
RETURNS SETOF EDICION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EDICION WHERE edi_id = ediId;
END
$$;
CREATE OR REPLACE FUNCTION listEdicion ()
RETURNS SETOF EDICION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EDICION;
END
$$;
CREATE OR REPLACE PROCEDURE updateEdicion (
    ediId INT,
    ediNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EDICION
    SET edi_nombre = ediNombre
    WHERE edi_id = ediId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteEdicion (
    ediId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM EDICION WHERE edi_id = ediId;
END
$$;


-- ========================= PROFESION =========================
CREATE OR REPLACE FUNCTION getProfesion (
    profId INT
)
RETURNS SETOF PROFESION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PROFESION WHERE prof_id = profId;
END
$$;
CREATE OR REPLACE FUNCTION listProfesion ()
RETURNS SETOF PROFESION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PROFESION;
END
$$;
CREATE OR REPLACE PROCEDURE updateProfesion (
    profId INT,
    profNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PROFESION
    SET prof_nombre = profNombre
    WHERE prof_id = profId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteProfesion (
    profId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PROFESION WHERE prof_id = profId;
END
$$;


-- ========================= EXCLUSIVIDAD =========================
CREATE OR REPLACE FUNCTION getExclusividad (
    excId INT
)
RETURNS SETOF EXCLUSIVIDAD
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EXCLUSIVIDAD WHERE exc_id = excId;
END
$$;
CREATE OR REPLACE FUNCTION listExclusividad ()
RETURNS SETOF EXCLUSIVIDAD
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EXCLUSIVIDAD;
END
$$;
CREATE OR REPLACE PROCEDURE updateExclusividad (
    excId INT,
    excNombre VARCHAR(100),
    excLimiteproducto INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EXCLUSIVIDAD
    SET exc_nombre = excNombre,
        exc_limiteproducto = excLimiteproducto
    WHERE exc_id = excId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteExclusividad (
    excId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM EXCLUSIVIDAD WHERE exc_id = excId;
END
$$;


-- ========================= PRODUCTO =========================
CREATE OR REPLACE FUNCTION getProducto (
    proId INT
)
RETURNS SETOF PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PRODUCTO WHERE pro_id = proId;
END
$$;
CREATE OR REPLACE FUNCTION listProducto ()
RETURNS SETOF PRODUCTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PRODUCTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateProducto (
    proId INT,
    proSku INT,
    proNombre VARCHAR(100),
    proPreciobase FLOAT,
    proLanzamientofecha DATE,
    proTipo VARCHAR(100),
    fkJugId INT,
    fkCatproId INT,
    fkLotproId INT,
    fkEdiId INT,
    fkExcId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PRODUCTO
    SET pro_sku = proSku,
        pro_nombre = proNombre,
        pro_preciobase = proPreciobase,
        pro_lanzamientofecha = proLanzamientofecha,
        pro_tipo = proTipo,
        fk_jug_id = fkJugId,
        fk_catpro_id = fkCatproId,
        fk_lotpro_id = fkLotproId,
        fk_edi_id = fkEdiId,
        fk_exc_id = fkExcId
    WHERE pro_id = proId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteProducto (
    proId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PRODUCTO WHERE pro_id = proId;
END
$$;


-- ========================= DETALLE_SET =========================
CREATE OR REPLACE FUNCTION getDetalleSet (
    fkPro1 INT,
    fkPro2 INT
)
RETURNS SETOF DETALLE_SET
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DETALLE_SET WHERE fk_pro1 = fkPro1 AND fk_pro2 = fkPro2;
END
$$;
CREATE OR REPLACE FUNCTION listDetalleSet ()
RETURNS SETOF DETALLE_SET
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DETALLE_SET;
END
$$;
CREATE OR REPLACE PROCEDURE updateDetalleSet (
    fkPro1 INT,
    fkPro2 INT,
    detsetNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DETALLE_SET
    SET detset_nombre = detsetNombre
    WHERE fk_pro1 = fkPro1 AND fk_pro2 = fkPro2;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDetalleSet (
    fkPro1 INT,
    fkPro2 INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DETALLE_SET WHERE fk_pro1 = fkPro1 AND fk_pro2 = fkPro2;
END
$$;


-- ========================= HISTORICO_PROFESION =========================
CREATE OR REPLACE FUNCTION getHistoricoProfesion (
    fkProId INT,
    fkProfId INT
)
RETURNS SETOF HISTORICO_PROFESION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_PROFESION WHERE fk_pro_id = fkProId AND fk_prof_id = fkProfId;
END
$$;
CREATE OR REPLACE FUNCTION listHistoricoProfesion ()
RETURNS SETOF HISTORICO_PROFESION
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_PROFESION;
END
$$;
CREATE OR REPLACE PROCEDURE updateHistoricoProfesion (
    fkProId INT,
    fkProfId INT,
    hisproAnoasignacion VARCHAR(4)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE HISTORICO_PROFESION
    SET hispro_anoasignacion = hisproAnoasignacion
    WHERE fk_pro_id = fkProId AND fk_prof_id = fkProfId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteHistoricoProfesion (
    fkProId INT,
    fkProfId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM HISTORICO_PROFESION WHERE fk_pro_id = fkProId AND fk_prof_id = fkProfId;
END
$$;


-- ========================= HUB_REGIONAL =========================
CREATE OR REPLACE FUNCTION getHubRegional (
    hubregId INT
)
RETURNS SETOF HUB_REGIONAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HUB_REGIONAL WHERE hubreg_id = hubregId;
END
$$;
CREATE OR REPLACE FUNCTION listHubRegional ()
RETURNS SETOF HUB_REGIONAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HUB_REGIONAL;
END
$$;
CREATE OR REPLACE PROCEDURE updateHubRegional (
    hubregId INT,
    hubregNombre VARCHAR(100),
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE HUB_REGIONAL
    SET hubreg_nombre = hubregNombre,
        fk_lug_id = fkLugId
    WHERE hubreg_id = hubregId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteHubRegional (
    hubregId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM HUB_REGIONAL WHERE hubreg_id = hubregId;
END
$$;


-- ========================= ALMACEN =========================
CREATE OR REPLACE FUNCTION getAlmacen (
    almId INT
)
RETURNS SETOF ALMACEN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ALMACEN WHERE alm_id = almId;
END
$$;
CREATE OR REPLACE FUNCTION listAlmacen ()
RETURNS SETOF ALMACEN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ALMACEN;
END
$$;
CREATE OR REPLACE PROCEDURE updateAlmacen (
    almId INT,
    almTipoinstalacion VARCHAR(100),
    fkHubregId INT,
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ALMACEN
    SET alm_tipoinstalacion = almTipoinstalacion,
        fk_hubreg_id = fkHubregId,
        fk_lug_id = fkLugId
    WHERE alm_id = almId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteAlmacen (
    almId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ALMACEN WHERE alm_id = almId;
END
$$;


-- ========================= INVENTARIO =========================
CREATE OR REPLACE FUNCTION getInventario (
    fkProId INT,
    fkAlmId INT
)
RETURNS SETOF INVENTARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM INVENTARIO WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;
CREATE OR REPLACE FUNCTION listInventario ()
RETURNS SETOF INVENTARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM INVENTARIO;
END
$$;
CREATE OR REPLACE PROCEDURE updateInventario (
    fkProId INT,
    fkAlmId INT,
    invStockdisponible INT,
    invCantidad INT,
    invFechaActualizacion DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE INVENTARIO
    SET inv_stockdisponible = invStockdisponible,
        inv_cantidad = invCantidad,
        inv_fecha_actualizacion = invFechaActualizacion
    WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteInventario (
    fkProId INT,
    fkAlmId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM INVENTARIO WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;


-- ========================= METODO_PAGO =========================
CREATE OR REPLACE FUNCTION getMetodoPago (
    metpagId INT
)
RETURNS SETOF METODO_PAGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM METODO_PAGO WHERE metpag_id = metpagId;
END
$$;
CREATE OR REPLACE FUNCTION listMetodoPago ()
RETURNS SETOF METODO_PAGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM METODO_PAGO;
END
$$;
-- updateMetodoPago: omitido (tabla puente sin columnas no-clave que actualizar)
CREATE OR REPLACE PROCEDURE deleteMetodoPago (
    metpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM METODO_PAGO WHERE metpag_id = metpagId;
END
$$;


-- ========================= EFECTIVO =========================
CREATE OR REPLACE FUNCTION getEfectivo (
    fkMetpagId INT
)
RETURNS SETOF EFECTIVO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EFECTIVO WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listEfectivo ()
RETURNS SETOF EFECTIVO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM EFECTIVO;
END
$$;
CREATE OR REPLACE PROCEDURE updateEfectivo (
    fkMetpagId INT,
    efeDenominacion VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EFECTIVO
    SET efe_denominacion = efeDenominacion
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteEfectivo (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM EFECTIVO WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= TARJETA =========================
CREATE OR REPLACE FUNCTION getTarjeta (
    fkMetpagId INT
)
RETURNS SETOF TARJETA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TARJETA WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listTarjeta ()
RETURNS SETOF TARJETA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TARJETA;
END
$$;
CREATE OR REPLACE PROCEDURE updateTarjeta (
    fkMetpagId INT,
    tarNumero VARCHAR(19),
    tarCvv VARCHAR(4),
    tarBanco VARCHAR(100),
    tarEmisor VARCHAR(100),
    tarFechaven DATE,
    tarTitular VARCHAR(100),
    tarTipo VARCHAR(7)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE TARJETA
    SET tar_numero = tarNumero,
        tar_cvv = tarCvv,
        tar_banco = tarBanco,
        tar_emisor = tarEmisor,
        tar_fechaven = tarFechaven,
        tar_titular = tarTitular,
        tar_tipo = tarTipo
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteTarjeta (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM TARJETA WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= CHEQUE =========================
CREATE OR REPLACE FUNCTION getCheque (
    fkMetpagId INT
)
RETURNS SETOF CHEQUE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CHEQUE WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listCheque ()
RETURNS SETOF CHEQUE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CHEQUE;
END
$$;
CREATE OR REPLACE PROCEDURE updateCheque (
    fkMetpagId INT,
    cheCodigocuenta VARCHAR(20),
    cheNumero VARCHAR(20),
    cheTitular VARCHAR(100),
    cheMonto FLOAT,
    cheBanco VARCHAR(100),
    cheFechaemision DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CHEQUE
    SET che_codigocuenta = cheCodigocuenta,
        che_numero = cheNumero,
        che_titular = cheTitular,
        che_monto = cheMonto,
        che_banco = cheBanco,
        che_fechaemision = cheFechaemision
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCheque (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CHEQUE WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= DEPOSITO_BANCARIO =========================
CREATE OR REPLACE FUNCTION getDepositoBancario (
    fkMetpagId INT
)
RETURNS SETOF DEPOSITO_BANCARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEPOSITO_BANCARIO WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listDepositoBancario ()
RETURNS SETOF DEPOSITO_BANCARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DEPOSITO_BANCARIO;
END
$$;
CREATE OR REPLACE PROCEDURE updateDepositoBancario (
    fkMetpagId INT,
    depbanCuentadestino VARCHAR(20),
    depbanBancodestino VARCHAR(100),
    depbanFecha DATE,
    depbanNumref VARCHAR(30),
    depbanMonto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DEPOSITO_BANCARIO
    SET depban_cuentadestino = depbanCuentadestino,
        depban_bancodestino = depbanBancodestino,
        depban_fecha = depbanFecha,
        depban_numref = depbanNumref,
        depban_monto = depbanMonto
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDepositoBancario (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DEPOSITO_BANCARIO WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= TRANSFERENCIA =========================
CREATE OR REPLACE FUNCTION getTransferencia (
    fkMetpagId INT
)
RETURNS SETOF TRANSFERENCIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TRANSFERENCIA WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listTransferencia ()
RETURNS SETOF TRANSFERENCIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TRANSFERENCIA;
END
$$;
CREATE OR REPLACE PROCEDURE updateTransferencia (
    fkMetpagId INT,
    tranNumref VARCHAR(30),
    tranFecha DATE,
    tranMonto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE TRANSFERENCIA
    SET tran_numref = tranNumref,
        tran_fecha = tranFecha,
        tran_monto = tranMonto
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteTransferencia (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM TRANSFERENCIA WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= CRIPTOMONEDA =========================
CREATE OR REPLACE FUNCTION getCriptomoneda (
    fkMetpagId INT
)
RETURNS SETOF CRIPTOMONEDA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CRIPTOMONEDA WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listCriptomoneda ()
RETURNS SETOF CRIPTOMONEDA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CRIPTOMONEDA;
END
$$;
CREATE OR REPLACE PROCEDURE updateCriptomoneda (
    fkMetpagId INT,
    criIdtransaccion VARCHAR(100),
    criFecha DATE,
    criMonto FLOAT,
    criDirecciondestino VARCHAR(100),
    criMonedanombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CRIPTOMONEDA
    SET cri_idtransaccion = criIdtransaccion,
        cri_fecha = criFecha,
        cri_monto = criMonto,
        cri_direcciondestino = criDirecciondestino,
        cri_monedanombre = criMonedanombre
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCriptomoneda (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CRIPTOMONEDA WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= BILLETERA_DIGITAL =========================
CREATE OR REPLACE FUNCTION getBilleteraDigital (
    fkMetpagId INT
)
RETURNS SETOF BILLETERA_DIGITAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM BILLETERA_DIGITAL WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listBilleteraDigital ()
RETURNS SETOF BILLETERA_DIGITAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM BILLETERA_DIGITAL;
END
$$;
CREATE OR REPLACE PROCEDURE updateBilleteraDigital (
    fkMetpagId INT,
    bildigCodigoreferencia VARCHAR(50),
    bildigFecha DATE,
    bildigMonto FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE BILLETERA_DIGITAL
    SET bildig_codigoreferencia = bildigCodigoreferencia,
        bildig_fecha = bildigFecha,
        bildig_monto = bildigMonto
    WHERE fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteBilleteraDigital (
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM BILLETERA_DIGITAL WHERE fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= CLIENTE =========================
CREATE OR REPLACE FUNCTION getCliente (
    cliId INT
)
RETURNS SETOF CLIENTE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CLIENTE WHERE cli_id = cliId;
END
$$;
CREATE OR REPLACE FUNCTION listCliente ()
RETURNS SETOF CLIENTE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CLIENTE;
END
$$;
CREATE OR REPLACE PROCEDURE updateCliente (
    cliId INT,
    cliFecharegis DATE,
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CLIENTE
    SET cli_fecharegis = cliFecharegis,
        fk_lug_id = fkLugId
    WHERE cli_id = cliId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCliente (
    cliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CLIENTE WHERE cli_id = cliId;
END
$$;


-- ========================= PERSONA_NATURAL =========================
CREATE OR REPLACE FUNCTION getPersonaNatural (
    fkCliId INT
)
RETURNS SETOF PERSONA_NATURAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONA_NATURAL WHERE fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE FUNCTION listPersonaNatural ()
RETURNS SETOF PERSONA_NATURAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONA_NATURAL;
END
$$;
CREATE OR REPLACE PROCEDURE updatePersonaNatural (
    fkCliId INT,
    pernatCedula VARCHAR(20),
    pernatPnombre VARCHAR(50),
    pernatSnombre VARCHAR(50),
    pernatPapellido VARCHAR(50),
    pernatSapellido VARCHAR(50),
    pernatFechanac DATE,
    pernatDireccion TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PERSONA_NATURAL
    SET pernat_cedula = pernatCedula,
        pernat_pnombre = pernatPnombre,
        pernat_snombre = pernatSnombre,
        pernat_papellido = pernatPapellido,
        pernat_sapellido = pernatSapellido,
        pernat_fechanac = pernatFechanac,
        pernat_direccion = pernatDireccion
    WHERE fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePersonaNatural (
    fkCliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PERSONA_NATURAL WHERE fk_cli_id = fkCliId;
END
$$;


-- ========================= PERSONA_JURIDICA =========================
CREATE OR REPLACE FUNCTION getPersonaJuridica (
    fkCliId INT
)
RETURNS SETOF PERSONA_JURIDICA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONA_JURIDICA WHERE fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE FUNCTION listPersonaJuridica ()
RETURNS SETOF PERSONA_JURIDICA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERSONA_JURIDICA;
END
$$;
CREATE OR REPLACE PROCEDURE updatePersonaJuridica (
    fkCliId INT,
    perjurRif VARCHAR(20),
    perjurRazonsocial VARCHAR(100),
    perjurReprelegal VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PERSONA_JURIDICA
    SET perjur_rif = perjurRif,
        perjur_razonsocial = perjurRazonsocial,
        perjur_reprelegal = perjurReprelegal
    WHERE fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePersonaJuridica (
    fkCliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PERSONA_JURIDICA WHERE fk_cli_id = fkCliId;
END
$$;


-- ========================= PERMISO =========================
CREATE OR REPLACE FUNCTION getPermiso (
    permId INT
)
RETURNS SETOF PERMISO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERMISO WHERE perm_id = permId;
END
$$;
CREATE OR REPLACE FUNCTION listPermiso ()
RETURNS SETOF PERMISO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERMISO;
END
$$;
CREATE OR REPLACE PROCEDURE updatePermiso (
    permId INT,
    permModuloacceso VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PERMISO
    SET perm_moduloacceso = permModuloacceso
    WHERE perm_id = permId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePermiso (
    permId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PERMISO WHERE perm_id = permId;
END
$$;


-- ========================= ROL =========================
CREATE OR REPLACE FUNCTION getRol (
    rolId INT
)
RETURNS SETOF ROL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ROL WHERE rol_id = rolId;
END
$$;
CREATE OR REPLACE FUNCTION listRol ()
RETURNS SETOF ROL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ROL;
END
$$;
CREATE OR REPLACE PROCEDURE updateRol (
    rolId INT,
    rolNombre VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ROL
    SET rol_nombre = rolNombre
    WHERE rol_id = rolId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteRol (
    rolId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ROL WHERE rol_id = rolId;
END
$$;


-- ========================= USUARIO =========================
CREATE OR REPLACE FUNCTION getUsuario (
    usuId INT
)
RETURNS SETOF USUARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM USUARIO WHERE usu_id = usuId;
END
$$;
CREATE OR REPLACE FUNCTION listUsuario ()
RETURNS SETOF USUARIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM USUARIO;
END
$$;
CREATE OR REPLACE PROCEDURE updateUsuario (
    usuId INT,
    usuNombre VARCHAR(50),
    usuClave VARCHAR(50),
    usuCorreo VARCHAR(50),
    fkRolId INT,
    fkEmpId INT,
    fkCliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE USUARIO
    SET usu_nombre = usuNombre,
        usu_clave = usuClave,
        usu_correo = usuCorreo,
        fk_rol_id = fkRolId,
        fk_emp_id = fkEmpId,
        fk_cli_id = fkCliId
    WHERE usu_id = usuId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteUsuario (
    usuId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM USUARIO WHERE usu_id = usuId;
END
$$;


-- ========================= PERMISO_ROL =========================
CREATE OR REPLACE FUNCTION getPermisoRol (
    fkRolId INT,
    fkPermId INT
)
RETURNS SETOF PERMISO_ROL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERMISO_ROL WHERE fk_rol_id = fkRolId AND fk_perm_id = fkPermId;
END
$$;
CREATE OR REPLACE FUNCTION listPermisoRol ()
RETURNS SETOF PERMISO_ROL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PERMISO_ROL;
END
$$;
-- updatePermisoRol: omitido (tabla puente sin columnas no-clave que actualizar)
CREATE OR REPLACE PROCEDURE deletePermisoRol (
    fkRolId INT,
    fkPermId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PERMISO_ROL WHERE fk_rol_id = fkRolId AND fk_perm_id = fkPermId;
END
$$;


-- ========================= CONDICION_SUBASTA =========================
CREATE OR REPLACE FUNCTION getCondicionSubasta (
    consubId INT
)
RETURNS SETOF CONDICION_SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CONDICION_SUBASTA WHERE consub_id = consubId;
END
$$;
CREATE OR REPLACE FUNCTION listCondicionSubasta ()
RETURNS SETOF CONDICION_SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM CONDICION_SUBASTA;
END
$$;
CREATE OR REPLACE PROCEDURE updateCondicionSubasta (
    consubId INT,
    consubNombre VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CONDICION_SUBASTA
    SET consub_nombre = consubNombre
    WHERE consub_id = consubId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCondicionSubasta (
    consubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM CONDICION_SUBASTA WHERE consub_id = consubId;
END
$$;


-- ========================= SUBASTA =========================
CREATE OR REPLACE FUNCTION getSubasta (
    subId INT
)
RETURNS SETOF SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM SUBASTA WHERE sub_id = subId;
END
$$;
CREATE OR REPLACE FUNCTION listSubasta ()
RETURNS SETOF SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM SUBASTA;
END
$$;
CREATE OR REPLACE PROCEDURE updateSubasta (
    subId INT,
    subFechaini DATE,
    subFechafin DATE,
    subEstado VARCHAR(100),
    subMontoini FLOAT,
    fkProId INT,
    fkConsubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE SUBASTA
    SET sub_fechaini = subFechaini,
        sub_fechafin = subFechafin,
        sub_estado = subEstado,
        sub_montoini = subMontoini,
        fk_pro_id = fkProId,
        fk_consub_id = fkConsubId
    WHERE sub_id = subId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteSubasta (
    subId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM SUBASTA WHERE sub_id = subId;
END
$$;


-- ========================= PUJA_SUBASTA =========================
CREATE OR REPLACE FUNCTION getPujaSubasta (
    pujsubId INT
)
RETURNS SETOF PUJA_SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PUJA_SUBASTA WHERE pujsub_id = pujsubId;
END
$$;
CREATE OR REPLACE FUNCTION listPujaSubasta ()
RETURNS SETOF PUJA_SUBASTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PUJA_SUBASTA;
END
$$;
CREATE OR REPLACE PROCEDURE updatePujaSubasta (
    pujsubId INT,
    pujsubMonto FLOAT,
    pujsubFechahor TIMESTAMP,
    fkUsuId INT,
    fkSubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PUJA_SUBASTA
    SET pujsub_monto = pujsubMonto,
        pujsub_fechahor = pujsubFechahor,
        fk_usu_id = fkUsuId,
        fk_sub_id = fkSubId
    WHERE pujsub_id = pujsubId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePujaSubasta (
    pujsubId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PUJA_SUBASTA WHERE pujsub_id = pujsubId;
END
$$;


-- ========================= ACUERDO_COMERCIAL =========================
CREATE OR REPLACE FUNCTION getAcuerdoComercial (
    acucomId INT
)
RETURNS SETOF ACUERDO_COMERCIAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ACUERDO_COMERCIAL WHERE acucom_id = acucomId;
END
$$;
CREATE OR REPLACE FUNCTION listAcuerdoComercial ()
RETURNS SETOF ACUERDO_COMERCIAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ACUERDO_COMERCIAL;
END
$$;
CREATE OR REPLACE PROCEDURE updateAcuerdoComercial (
    acucomId INT,
    acucomLimitecredito INT,
    acucomPlazopago INT,
    acucomDescuentomayorista INT,
    fkPerjurId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ACUERDO_COMERCIAL
    SET acucom_limitecredito = acucomLimitecredito,
        acucom_plazopago = acucomPlazopago,
        acucom_descuentomayorista = acucomDescuentomayorista,
        fk_perjur_id = fkPerjurId
    WHERE acucom_id = acucomId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteAcuerdoComercial (
    acucomId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ACUERDO_COMERCIAL WHERE acucom_id = acucomId;
END
$$;


-- ========================= TRANSPORTISTA =========================
CREATE OR REPLACE FUNCTION getTransportista (
    traId INT
)
RETURNS SETOF TRANSPORTISTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TRANSPORTISTA WHERE tra_id = traId;
END
$$;
CREATE OR REPLACE FUNCTION listTransportista ()
RETURNS SETOF TRANSPORTISTA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM TRANSPORTISTA;
END
$$;
CREATE OR REPLACE PROCEDURE updateTransportista (
    traId INT,
    traEmpresa VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE TRANSPORTISTA
    SET tra_empresa = traEmpresa
    WHERE tra_id = traId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteTransportista (
    traId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM TRANSPORTISTA WHERE tra_id = traId;
END
$$;


-- ========================= COMPRA =========================
CREATE OR REPLACE FUNCTION getCompra (
    comId INT
)
RETURNS SETOF COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COMPRA WHERE com_id = comId;
END
$$;
CREATE OR REPLACE FUNCTION listCompra ()
RETURNS SETOF COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM COMPRA;
END
$$;
CREATE OR REPLACE PROCEDURE updateCompra (
    comId INT,
    comFechahor TIMESTAMP,
    comNumfactura INT,
    comSubtotal FLOAT,
    comTotal FLOAT,
    fkTraId INT,
    fkAcucomId INT,
    fkUsuId INT,
    fkLugId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE COMPRA
    SET com_fechahor = comFechahor,
        com_numfactura = comNumfactura,
        com_subtotal = comSubtotal,
        com_total = comTotal,
        fk_tra_id = fkTraId,
        fk_acucom_id = fkAcucomId,
        fk_usu_id = fkUsuId,
        fk_lug_id = fkLugId
    WHERE com_id = comId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteCompra (
    comId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM COMPRA WHERE com_id = comId;
END
$$;


-- ========================= ESTATUS_COMPRA =========================
CREATE OR REPLACE FUNCTION getEstatusCompra (
    estcomId INT
)
RETURNS SETOF ESTATUS_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ESTATUS_COMPRA WHERE estcom_id = estcomId;
END
$$;
CREATE OR REPLACE FUNCTION listEstatusCompra ()
RETURNS SETOF ESTATUS_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM ESTATUS_COMPRA;
END
$$;
CREATE OR REPLACE PROCEDURE updateEstatusCompra (
    estcomId INT,
    estcomNom VARCHAR(100),
    estcomFechahoracierre TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ESTATUS_COMPRA
    SET estcom_nom = estcomNom,
        estcom_fechahoracierre = estcomFechahoracierre
    WHERE estcom_id = estcomId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteEstatusCompra (
    estcomId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ESTATUS_COMPRA WHERE estcom_id = estcomId;
END
$$;


-- ========================= HISTORICO_ESTATUS =========================
CREATE OR REPLACE FUNCTION getHistoricoEstatus (
    fkEstcomId INT,
    fkComId INT
)
RETURNS SETOF HISTORICO_ESTATUS
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_ESTATUS WHERE fk_estcom_id = fkEstcomId AND fk_com_id = fkComId;
END
$$;
CREATE OR REPLACE FUNCTION listHistoricoEstatus ()
RETURNS SETOF HISTORICO_ESTATUS
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_ESTATUS;
END
$$;
CREATE OR REPLACE PROCEDURE updateHistoricoEstatus (
    fkEstcomId INT,
    fkComId INT,
    hisestFechahora TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE HISTORICO_ESTATUS
    SET hisest_fechahora = hisestFechahora
    WHERE fk_estcom_id = fkEstcomId AND fk_com_id = fkComId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteHistoricoEstatus (
    fkEstcomId INT,
    fkComId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM HISTORICO_ESTATUS WHERE fk_estcom_id = fkEstcomId AND fk_com_id = fkComId;
END
$$;


-- ========================= DESCUENTO =========================
CREATE OR REPLACE FUNCTION getDescuento (
    desId INT
)
RETURNS SETOF DESCUENTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DESCUENTO WHERE des_id = desId;
END
$$;
CREATE OR REPLACE FUNCTION listDescuento ()
RETURNS SETOF DESCUENTO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DESCUENTO;
END
$$;
CREATE OR REPLACE PROCEDURE updateDescuento (
    desId INT,
    desNombre VARCHAR(100),
    desPorcentaje FLOAT,
    desFechaven DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DESCUENTO
    SET des_nombre = desNombre,
        des_porcentaje = desPorcentaje,
        des_fechaven = desFechaven
    WHERE des_id = desId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDescuento (
    desId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DESCUENTO WHERE des_id = desId;
END
$$;


-- ========================= DESCUENTO_COMPRA =========================
CREATE OR REPLACE FUNCTION getDescuentoCompra (
    fkDesId INT,
    fkComId INT
)
RETURNS SETOF DESCUENTO_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DESCUENTO_COMPRA WHERE fk_des_id = fkDesId AND fk_com_id = fkComId;
END
$$;
CREATE OR REPLACE FUNCTION listDescuentoCompra ()
RETURNS SETOF DESCUENTO_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DESCUENTO_COMPRA;
END
$$;
-- updateDescuentoCompra: omitido (tabla puente sin columnas no-clave que actualizar)
CREATE OR REPLACE PROCEDURE deleteDescuentoCompra (
    fkDesId INT,
    fkComId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DESCUENTO_COMPRA WHERE fk_des_id = fkDesId AND fk_com_id = fkComId;
END
$$;


-- ========================= HISTORICO_TASA_CAMBIO =========================
CREATE OR REPLACE FUNCTION getHistoricoTasaCambio (
    histascamId INT
)
RETURNS SETOF HISTORICO_TASA_CAMBIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_TASA_CAMBIO WHERE histascam_id = histascamId;
END
$$;
CREATE OR REPLACE FUNCTION listHistoricoTasaCambio ()
RETURNS SETOF HISTORICO_TASA_CAMBIO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_TASA_CAMBIO;
END
$$;
CREATE OR REPLACE PROCEDURE updateHistoricoTasaCambio (
    histascamId INT,
    histascamMonedaoriginal VARCHAR(100),
    histascamMonedaconvertida VARCHAR(100),
    histascamTasa FLOAT,
    histascamFecha DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE HISTORICO_TASA_CAMBIO
    SET histascam_monedaoriginal = histascamMonedaoriginal,
        histascam_monedaconvertida = histascamMonedaconvertida,
        histascam_tasa = histascamTasa,
        histascam_fecha = histascamFecha
    WHERE histascam_id = histascamId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteHistoricoTasaCambio (
    histascamId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM HISTORICO_TASA_CAMBIO WHERE histascam_id = histascamId;
END
$$;


-- ========================= PAGO =========================
CREATE OR REPLACE FUNCTION getPago (
    pagId INT,
    fkComId INT,
    fkMetpagId INT
)
RETURNS SETOF PAGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PAGO WHERE pag_id = pagId AND fk_com_id = fkComId AND fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE FUNCTION listPago ()
RETURNS SETOF PAGO
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM PAGO;
END
$$;
CREATE OR REPLACE PROCEDURE updatePago (
    pagId INT,
    fkComId INT,
    fkMetpagId INT,
    pagMonto FLOAT,
    pagFecha DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PAGO
    SET pag_monto = pagMonto,
        pag_fecha = pagFecha
    WHERE pag_id = pagId AND fk_com_id = fkComId AND fk_metpag_id = fkMetpagId;
END
$$;
CREATE OR REPLACE PROCEDURE deletePago (
    pagId INT,
    fkComId INT,
    fkMetpagId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM PAGO WHERE pag_id = pagId AND fk_com_id = fkComId AND fk_metpag_id = fkMetpagId;
END
$$;


-- ========================= DETALLE_COMPRA =========================
CREATE OR REPLACE FUNCTION getDetalleCompra (
    fkComId INT,
    fkProId INT,
    fkAlmId INT
)
RETURNS SETOF DETALLE_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DETALLE_COMPRA WHERE fk_com_id = fkComId AND fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;
CREATE OR REPLACE FUNCTION listDetalleCompra ()
RETURNS SETOF DETALLE_COMPRA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM DETALLE_COMPRA;
END
$$;
CREATE OR REPLACE PROCEDURE updateDetalleCompra (
    fkComId INT,
    fkProId INT,
    fkAlmId INT,
    detcomCantidad INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DETALLE_COMPRA
    SET detcom_cantidad = detcomCantidad
    WHERE fk_com_id = fkComId AND fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDetalleCompra (
    fkComId INT,
    fkProId INT,
    fkAlmId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM DETALLE_COMPRA WHERE fk_com_id = fkComId AND fk_pro_id = fkProId AND fk_alm_id = fkAlmId;
END
$$;


-- ========================= MEMBRESIA =========================
CREATE OR REPLACE FUNCTION getMembresia (
    memId INT
)
RETURNS SETOF MEMBRESIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MEMBRESIA WHERE mem_id = memId;
END
$$;
CREATE OR REPLACE FUNCTION listMembresia ()
RETURNS SETOF MEMBRESIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM MEMBRESIA;
END
$$;
CREATE OR REPLACE PROCEDURE updateMembresia (
    memId INT,
    memNombre VARCHAR(100),
    memDescuento FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE MEMBRESIA
    SET mem_nombre = memNombre,
        mem_descuento = memDescuento
    WHERE mem_id = memId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteMembresia (
    memId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM MEMBRESIA WHERE mem_id = memId;
END
$$;


-- ========================= HISTORICO_MEMBRESIA =========================
CREATE OR REPLACE FUNCTION getHistoricoMembresia (
    fkMemId INT,
    fkCliId INT
)
RETURNS SETOF HISTORICO_MEMBRESIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_MEMBRESIA WHERE fk_mem_id = fkMemId AND fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE FUNCTION listHistoricoMembresia ()
RETURNS SETOF HISTORICO_MEMBRESIA
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY SELECT * FROM HISTORICO_MEMBRESIA;
END
$$;
CREATE OR REPLACE PROCEDURE updateHistoricoMembresia (
    fkMemId INT,
    fkCliId INT,
    hismemFechaini DATE,
    hismemFechafin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE HISTORICO_MEMBRESIA
    SET hismem_fechaini = hismemFechaini,
        hismem_fechafin = hismemFechafin
    WHERE fk_mem_id = fkMemId AND fk_cli_id = fkCliId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteHistoricoMembresia (
    fkMemId INT,
    fkCliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM HISTORICO_MEMBRESIA WHERE fk_mem_id = fkMemId AND fk_cli_id = fkCliId;
END
$$;