-- =====================================================================
-- CRUD complementario (get / list / update / delete) por tabla
-- Complementa los procedimientos create* del equipo.
-- Lecturas  = FUNCIONES (devuelven filas).
-- Escrituras= PROCEDIMIENTOS (mismo estilo que create*).
-- Sincronizado con el create.sql actual.
-- =====================================================================


-- ========================= LUGAR =========================
CREATE OR REPLACE PROCEDURE insert_estados(varchar(50)[]) AS $$
DECLARE
    x varchar(50);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (lug_nombre, lug_tipo, fk_lug_id)
VALUES (x, 'ESTADO', NULL);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Municipios --
CREATE OR REPLACE PROCEDURE insert_municipios(varchar(50)[], text) AS $$
DECLARE
    fid integer = (SELECT lug_id FROM Lugar WHERE lug_nombre = $2 AND lug_tipo = 'ESTADO' LIMIT 1);
    x varchar(50);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (lug_nombre, lug_tipo, fk_lug_id)
VALUES (x, 'MUNICIPIO', fid);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Parroquias --
CREATE OR REPLACE PROCEDURE insert_parroquias(varchar(50)[], text) AS $$
DECLARE
    fid integer = (SELECT lug_id FROM Lugar WHERE lug_nombre = $2 AND lug_tipo = 'MUNICIPIO' LIMIT 1);
    x varchar(40);
BEGIN
    FOREACH x IN ARRAY $1
    LOOP
    INSERT INTO Lugar (lug_nombre, lug_tipo, fk_lug_id)
VALUES (x, 'PARROQUIA', fid);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

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
    IF EXISTS (SELECT 1 FROM COLOR_PRODUCTO WHERE fk_col_id = colId) THEN
        RAISE EXCEPTION 'No se puede eliminar el color %: esta en uso por uno o mas productos.', colId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM JUGUETE WHERE fk_tipcue_id = tipcueId) THEN
        RAISE EXCEPTION 'No se puede eliminar el tipo de cuerpo %: esta en uso por uno o mas juguetes.', tipcueId;
    END IF;
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
-- Alta de personaje con un molde de rostro asociado (un personaje siempre tiene
-- al menos un molde). Devuelve el id del personaje.
CREATE OR REPLACE FUNCTION crear_personaje (
    pNombre VARCHAR(100), pMoldeNombre VARCHAR(100), pMoldePatente VARCHAR(100), pMoldeAno INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    vPer INT;
BEGIN
    INSERT INTO PERSONAJE (per_nombre) VALUES (pNombre) RETURNING per_id INTO vPer;
    INSERT INTO MOLDE_ROSTRO (molros_nombre, molros_patente, molros_anopatente, fk_per_id)
    VALUES (pMoldeNombre, pMoldePatente, pMoldeAno, vPer);
    RETURN vPer;
END
$$;

-- Borrado en cascada de un personaje: sus vinculos y sus moldes. Se bloquea si
-- alguno de sus moldes esta en uso por un juguete (romperia productos).
CREATE OR REPLACE PROCEDURE deletePersonaje (
    perId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM JUGUETE j JOIN MOLDE_ROSTRO m ON m.molros_id = j.fk_molros_id
        WHERE m.fk_per_id = perId
    ) THEN
        RAISE EXCEPTION 'No se puede eliminar el personaje %: uno de sus moldes de rostro esta en uso por juguetes.', perId;
    END IF;
    DELETE FROM VINCULO_PERSONAJE WHERE fk_personaje1 = perId OR fk_personaje2 = perId;
    DELETE FROM MOLDE_ROSTRO WHERE fk_per_id = perId;
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
    fkPerId INT,
    anoPatente INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE MOLDE_ROSTRO
    SET molros_nombre = molrosNombre,
        molros_patente = molrosPatente,
        fk_per_id = fkPerId,
        molros_anopatente = anoPatente
    WHERE molros_id = molrosId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteMoldeRostro (
    molrosId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM JUGUETE WHERE fk_molros_id = molrosId) THEN
        RAISE EXCEPTION 'No se puede eliminar el molde de rostro %: esta en uso por uno o mas juguetes.', molrosId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM JUGUETE WHERE fk_erahis_id = erahisId) THEN
        RAISE EXCEPTION 'No se puede eliminar la era %: esta en uso por uno o mas juguetes.', erahisId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM MATERIAL_PRODUCTO WHERE fk_mat_id = matId) THEN
        RAISE EXCEPTION 'No se puede eliminar el material %: esta en uso por una o mas recetas.', matId;
    END IF;
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
    disPatentecod VARCHAR(50),
    fkEmpId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE DISENO
    SET dis_patentecod = disPatentecod,
        fk_emp_id = fkEmpId
    WHERE dis_id = disId;
END
$$;
CREATE OR REPLACE PROCEDURE deleteDiseno (
    disId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM JUGUETE WHERE fk_dis_id = disId) THEN
        RAISE EXCEPTION 'No se puede eliminar la patente/diseno %: esta en uso por uno o mas juguetes.', disId;
    END IF;
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
-- Borra un empleado en cascada de sus registros propios (turnos, adscripcion).
-- Bloquea con mensaje claro si esta vinculado a datos compartidos (usuario,
-- patentes o inspecciones) que se romperian al borrarlo.
CREATE OR REPLACE PROCEDURE deleteEmpleado (
    empId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM USUARIO WHERE fk_emp_id = empId) THEN
        RAISE EXCEPTION 'No se puede eliminar el empleado %: tiene una cuenta de usuario. Elimina ese usuario primero.', empId;
    END IF;
    IF EXISTS (SELECT 1 FROM DISENO WHERE fk_emp_id = empId) THEN
        RAISE EXCEPTION 'No se puede eliminar el empleado %: es disenador de una o mas patentes. Reasigna esas patentes primero.', empId;
    END IF;
    IF EXISTS (SELECT 1 FROM INSPECCION_CALIDAD WHERE fk_emp_id = empId) THEN
        RAISE EXCEPTION 'No se puede eliminar el empleado %: firmo una o mas inspecciones de calidad.', empId;
    END IF;
    DELETE FROM EMP_TURNO WHERE fk_emp_id = empId;
    DELETE FROM DEP_EMP WHERE fk_emp_id = empId;
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
    IF EXISTS (SELECT 1 FROM PRODUCTO WHERE fk_catpro_id = catproId) THEN
        RAISE EXCEPTION 'No se puede eliminar la categoria %: esta en uso por uno o mas productos.', catproId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM PRODUCTO WHERE fk_edi_id = ediId) THEN
        RAISE EXCEPTION 'No se puede eliminar la edicion %: esta en uso por uno o mas productos.', ediId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM HISTORICO_PROFESION WHERE fk_prof_id = profId) THEN
        RAISE EXCEPTION 'No se puede eliminar la profesion %: esta asignada en el multiverso de uno o mas productos.', profId;
    END IF;
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
    IF EXISTS (SELECT 1 FROM PRODUCTO WHERE fk_exc_id = excId) THEN
        RAISE EXCEPTION 'No se puede eliminar la exclusividad %: esta en uso por uno o mas productos.', excId;
    END IF;
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
-- Borrado en cascada total de un producto: elimina todo lo que lo referencia
-- (subastas + pujas, lineas de compra, inventario, sets, profesiones) y, si el
-- genoma (juguete) no lo usa otro producto, tambien el juguete y sus colores/
-- materiales/compatibilidades.
CREATE OR REPLACE PROCEDURE deleteProducto (
    proId INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    vJug INT;
BEGIN
    SELECT fk_jug_id INTO vJug FROM PRODUCTO WHERE pro_id = proId;

    -- Subastas del producto y sus pujas.
    DELETE FROM PUJA_SUBASTA WHERE fk_sub_id IN (SELECT sub_id FROM SUBASTA WHERE fk_pro_id = proId);
    DELETE FROM SUBASTA WHERE fk_pro_id = proId;

    -- Historial de ventas e inventario del producto.
    DELETE FROM DETALLE_COMPRA WHERE fk_pro_id = proId;
    DELETE FROM INVENTARIO WHERE fk_pro_id = proId;

    -- Sets que lo incluyen y profesiones del multiverso.
    DELETE FROM DETALLE_SET WHERE fk_pro1 = proId OR fk_pro2 = proId;
    DELETE FROM HISTORICO_PROFESION WHERE fk_pro_id = proId;

    DELETE FROM PRODUCTO WHERE pro_id = proId;

    -- El genoma (juguete) solo se borra si ningun otro producto lo usa.
    IF vJug IS NOT NULL AND NOT EXISTS (SELECT 1 FROM PRODUCTO WHERE fk_jug_id = vJug) THEN
        DELETE FROM COLOR_PRODUCTO WHERE fk_jug_id = vJug;
        DELETE FROM MATERIAL_PRODUCTO WHERE fk_jug_id = vJug;
        DELETE FROM COMPATIBILIDAD_JUGUETE WHERE fk_juguete1 = vJug OR fk_juguete2 = vJug;
        DELETE FROM JUGUETE WHERE jug_id = vJug;
    END IF;
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
    IF NOT EXISTS (SELECT 1 FROM INVENTARIO WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId) THEN
        RAISE EXCEPTION 'No existe inventario del producto % en el almacen %.', fkProId, fkAlmId;
    END IF;
    IF invStockdisponible < 0 OR invCantidad < 0 THEN
        RAISE EXCEPTION 'El stock disponible y la cantidad no pueden ser negativos.';
    END IF;
    IF invStockdisponible > invCantidad THEN
        RAISE EXCEPTION 'El stock disponible (%) no puede superar la cantidad total (%).', invStockdisponible, invCantidad;
    END IF;
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
    -- DETALLE_COMPRA referencia (producto, almacen) del inventario: no se puede
    -- borrar una existencia que ya tiene ventas/lineas de compra asociadas.
    IF EXISTS (SELECT 1 FROM DETALLE_COMPRA WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId) THEN
        RAISE EXCEPTION 'No se puede eliminar el inventario del producto % en el almacen %: tiene lineas de compra asociadas.', fkProId, fkAlmId;
    END IF;
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
-- Alta de cliente (CLIENTE + su persona natural o juridica) en una transaccion.
CREATE OR REPLACE FUNCTION crear_cliente (
    pTipo VARCHAR, pLug INT,
    pCedula VARCHAR(20), pPnombre VARCHAR(50), pSnombre VARCHAR(50), pPapellido VARCHAR(50), pSapellido VARCHAR(50), pFechanac DATE, pDireccion TEXT,
    pRif VARCHAR(20), pRazon VARCHAR(100), pRepre VARCHAR(100)
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    vCli INT;
BEGIN
    INSERT INTO CLIENTE (cli_fecharegis, fk_lug_id) VALUES (CURRENT_DATE, pLug) RETURNING cli_id INTO vCli;
    IF pTipo = 'JURIDICA' THEN
        INSERT INTO PERSONA_JURIDICA (fk_cli_id, perjur_rif, perjur_razonsocial, perjur_reprelegal)
        VALUES (vCli, pRif, pRazon, pRepre);
    ELSE
        INSERT INTO PERSONA_NATURAL (fk_cli_id, pernat_cedula, pernat_pnombre, pernat_snombre, pernat_papellido, pernat_sapellido, pernat_fechanac, pernat_direccion)
        VALUES (vCli, pCedula, pPnombre, NULLIF(pSnombre, ''), pPapellido, NULLIF(pSapellido, ''), pFechanac, pDireccion);
    END IF;
    RETURN vCli;
END
$$;

-- Actualiza un cliente completo (CLIENTE + su persona natural o juridica).
CREATE OR REPLACE FUNCTION actualizar_cliente (
    pCliId INT,
    pLug INT,
    pTipo VARCHAR,
    pCedula VARCHAR(20), pPnombre VARCHAR(50), pSnombre VARCHAR(50), pPapellido VARCHAR(50), pSapellido VARCHAR(50), pFechanac DATE, pDireccion TEXT,
    pRif VARCHAR(20), pRazon VARCHAR(100), pRepre VARCHAR(100)
)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE CLIENTE SET fk_lug_id = pLug WHERE cli_id = pCliId;
    DELETE FROM PERSONA_NATURAL WHERE fk_cli_id = pCliId;
    DELETE FROM PERSONA_JURIDICA WHERE fk_cli_id = pCliId;
    IF pTipo = 'JURIDICA' THEN
        INSERT INTO PERSONA_JURIDICA (fk_cli_id, perjur_rif, perjur_razonsocial, perjur_reprelegal)
        VALUES (pCliId, pRif, pRazon, pRepre);
    ELSE
        INSERT INTO PERSONA_NATURAL (fk_cli_id, pernat_cedula, pernat_pnombre, pernat_snombre, pernat_papellido, pernat_sapellido, pernat_fechanac, pernat_direccion)
        VALUES (pCliId, pCedula, pPnombre, NULLIF(pSnombre, ''), pPapellido, NULLIF(pSapellido, ''), pFechanac, pDireccion);
    END IF;
    RETURN pCliId;
END
$$;

-- Borra un cliente en cascada (su persona y membresias). Bloquea si tiene
-- una cuenta de usuario (eliminarla aparte preserva su historial de compras).
CREATE OR REPLACE PROCEDURE deleteCliente (
    cliId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM USUARIO WHERE fk_cli_id = cliId) THEN
        RAISE EXCEPTION 'No se puede eliminar el cliente %: tiene una cuenta de usuario. Elimina ese usuario primero.', cliId;
    END IF;
    DELETE FROM HISTORICO_MEMBRESIA WHERE fk_cli_id = cliId;
    DELETE FROM PERSONA_NATURAL WHERE fk_cli_id = cliId;
    DELETE FROM PERSONA_JURIDICA WHERE fk_cli_id = cliId;
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
    permRecurso VARCHAR(50),
    permAccion VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE PERMISO
    SET perm_recurso = permRecurso,
        perm_accion = permAccion
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
    rolNombre VARCHAR(50),
    ambitoRol VARCHAR(10) DEFAULT 'INTERNO'
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE ROL
    SET rol_nombre = rolNombre, rol_ambito = ambitoRol
    WHERE rol_id = rolId;
END
$$;
-- Borra un rol y sus permisos (PERMISO_ROL). Si tiene usuarios asignados se
-- bloquea con un mensaje claro: dejarlos sin rol violaria la integridad.
CREATE OR REPLACE PROCEDURE deleteRol (
    rolId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM USUARIO WHERE fk_rol_id = rolId) THEN
        RAISE EXCEPTION 'No se puede eliminar el rol %: tiene usuarios asignados. Reasigna esos usuarios a otro rol antes de borrarlo.', rolId;
    END IF;
    DELETE FROM PERMISO_ROL WHERE fk_rol_id = rolId;
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
        usu_correo = CASE WHEN usu_correo <> usuCorreo THEN usuCorreo ELSE usu_correo END,
        fk_rol_id = fkRolId,
        fk_emp_id = fkEmpId,
        fk_cli_id = fkCliId
    WHERE usu_id = usuId;
END
$$;
-- Borrado en cascada total de un usuario: elimina sus pujas y todas sus compras
-- con sus dependientes (detalle, pagos, descuentos, historial de estatus).
CREATE OR REPLACE PROCEDURE deleteUsuario (
    usuId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Pujas del usuario en subastas.
    DELETE FROM PUJA_SUBASTA WHERE fk_usu_id = usuId;

    -- Compras del usuario y todo lo que cuelga de cada compra.
    DELETE FROM HISTORICO_ESTATUS WHERE fk_com_id IN (SELECT com_id FROM COMPRA WHERE fk_usu_id = usuId);
    DELETE FROM DESCUENTO_COMPRA WHERE fk_com_id IN (SELECT com_id FROM COMPRA WHERE fk_usu_id = usuId);
    DELETE FROM PAGO WHERE fk_com_id IN (SELECT com_id FROM COMPRA WHERE fk_usu_id = usuId);
    DELETE FROM DETALLE_COMPRA WHERE fk_com_id IN (SELECT com_id FROM COMPRA WHERE fk_usu_id = usuId);
    DELETE FROM COMPRA WHERE fk_usu_id = usuId;

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

CREATE OR REPLACE PROCEDURE createColor (
    nombreColor VARCHAR(100),
    codHexColor VARCHAR(6)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO COLOR (col_nombre, col_codhex)
    VALUES (nombreColor, codHexColor);
END
$$;

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
    fkPerId INT,
    anoPatente INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MOLDE_ROSTRO (molros_nombre, molros_patente, fk_per_id, molros_anopatente)
    VALUES (nombreMolde, patenteMolde, fkPerId, anoPatente);
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
    unidadMaterial VARCHAR(10),
    costoMaterial FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO MATERIAL (mat_nombre, mat_tipo, mat_unidad, mat_costo)
    VALUES (nombreMaterial, tipoMaterial, unidadMaterial, costoMaterial);
END
$$;

CREATE OR REPLACE PROCEDURE createDiseno (
    patenteCodDiseno VARCHAR(50),
    fkEmpId INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO DISENO (dis_patentecod, fk_emp_id)
    VALUES (patenteCodDiseno, fkEmpId);
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
    IF fkJuguete1 = fkJuguete2 THEN
        RAISE EXCEPTION 'Un juguete no puede ser compatible consigo mismo.';
    END IF;
    -- Evita duplicados en cualquier sentido (la compatibilidad es simetrica).
    IF EXISTS (
        SELECT 1 FROM COMPATIBILIDAD_JUGUETE
        WHERE (fk_juguete1 = fkJuguete1 AND fk_juguete2 = fkJuguete2)
           OR (fk_juguete1 = fkJuguete2 AND fk_juguete2 = fkJuguete1)
    ) THEN
        RAISE EXCEPTION 'Estos juguetes ya estan registrados como compatibles.';
    END IF;
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

-- Alta de un empleado y su adscripcion (departamento + cargo) en una transaccion.
CREATE OR REPLACE FUNCTION crear_empleado (
    pPnombre VARCHAR(50), pSnombre VARCHAR(50), pPapellido VARCHAR(50), pSapellido VARCHAR(50),
    pDireccion VARCHAR(100), pDep INT, pCar INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    vEmp INT;
BEGIN
    INSERT INTO EMPLEADO (emp_pnombre, emp_snombre, emp_papellido, emp_sapellido, emp_direccion)
    VALUES (pPnombre, NULLIF(pSnombre, ''), pPapellido, pSapellido, pDireccion)
    RETURNING emp_id INTO vEmp;

    INSERT INTO DEP_EMP (depemp_fechaini, depemp_fechafin, fk_dep_id, fk_emp_id, fk_car_id)
    VALUES (CURRENT_DATE, NULL, pDep, vEmp, pCar);

    RETURN vEmp;
END
$$;

-- Edita un empleado y reemplaza su adscripcion (departamento + cargo).
CREATE OR REPLACE FUNCTION actualizar_empleado (
    pEmp INT, pPnombre VARCHAR(50), pSnombre VARCHAR(50), pPapellido VARCHAR(50), pSapellido VARCHAR(50),
    pDireccion VARCHAR(100), pDep INT, pCar INT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE EMPLEADO
       SET emp_pnombre = pPnombre, emp_snombre = NULLIF(pSnombre, ''),
           emp_papellido = pPapellido, emp_sapellido = pSapellido, emp_direccion = pDireccion
     WHERE emp_id = pEmp;
    -- DEP_EMP tiene PK por (departamento, empleado); para cambiar de depto se reemplaza la fila.
    DELETE FROM DEP_EMP WHERE fk_emp_id = pEmp;
    INSERT INTO DEP_EMP (depemp_fechaini, depemp_fechafin, fk_dep_id, fk_emp_id, fk_car_id)
    VALUES (CURRENT_DATE, NULL, pDep, pEmp, pCar);
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
    fkLotproId INT,
    fkEmpId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO INSPECCION_CALIDAD (inscal_fecha, inscal_resultado, fk_lotpro_id, fk_emp_id)
    VALUES (fechaInspeccion, resultadoInspeccion, fkLotproId, fkEmpId);
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

-- CORREGIDO: pro_id se omite del INSERT para que lo genere el SERIAL
-- (antes exigía recibir un id explícito, impidiendo crear productos nuevos).
CREATE OR REPLACE PROCEDURE createProducto (
    fkJugId INT,
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
        fk_jug_id, pro_sku, pro_nombre, pro_preciobase,
        pro_lanzamientofecha, pro_tipo, fk_catpro_id, fk_lotpro_id,
        fk_edi_id, fk_exc_id
    )
    VALUES (
        fkJugId, proSku, proNombre, proPrecioBase,
        proLanzamientoFecha, proTipo, fkCatproId, fkLotproId,
        fkEdiId, fkExcId
    );
END
$$;

-- ===================== ALTA COMPLETA DE UNA MUÑECA =====================
-- Crea, en una sola transacción: el JUGUETE (genoma) con ADN autogenerado,
-- sus colores por zona, el PRODUCTO con SKU autogenerado y (opcional) su
-- profesión en el multiverso. Devuelve el id del producto creado.
-- Se elimina la firma anterior (15 args) para que la nueva no quede como
-- una sobrecarga separada al recrearla.
DROP FUNCTION IF EXISTS crear_muneca(VARCHAR, FLOAT, DATE, INT, INT, INT, INT, INT, INT, INT, INT, INT[], VARCHAR[], INT, VARCHAR);
CREATE OR REPLACE FUNCTION crear_muneca (
    pNombre VARCHAR(100), pPrecio FLOAT, pFecha DATE,
    pMolros INT, pTipcue INT, pEra INT, pDis INT,
    pCat INT, pEdi INT, pLote INT, pExc INT,
    pColIds INT[], pZonas VARCHAR[],
    pMatIds INT[], pMatCants INT[],
    pStock INT DEFAULT 0, pAlm INT DEFAULT NULL,
    pProf INT DEFAULT NULL, pProfAno VARCHAR(4) DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    vJug INT;
    vPro INT;
    vAdn VARCHAR(50);
    vSku INT;
    i INT;
BEGIN
    -- ADN autogenerado a partir del personaje + molde
    SELECT 'ADN-' || UPPER(LEFT(REPLACE(COALESCE(per.per_nombre, 'GEN'), ' ', ''), 12)) || '-' || UPPER(LEFT(REPLACE(COALESCE(mr.molros_nombre, 'X'), ' ', ''), 14))
      INTO vAdn
      FROM MOLDE_ROSTRO mr LEFT JOIN PERSONAJE per ON per.per_id = mr.fk_per_id
     WHERE mr.molros_id = pMolros;
    vAdn := COALESCE(vAdn, 'ADN-GEN-' || pMolros);

    INSERT INTO JUGUETE (jug_adn, fk_molros_id, fk_tipcue_id, fk_erahis_id, fk_dis_id)
    VALUES (vAdn, pMolros, pTipcue, pEra, pDis)
    RETURNING jug_id INTO vJug;

    IF pColIds IS NOT NULL THEN
        FOR i IN 1 .. COALESCE(array_length(pColIds, 1), 0) LOOP
            IF pColIds[i] IS NOT NULL THEN
                INSERT INTO COLOR_PRODUCTO (fk_col_id, fk_jug_id, colpro_zonaaplicacion)
                VALUES (pColIds[i], vJug, pZonas[i]);
            END IF;
        END LOOP;
    END IF;

    -- Receta de materiales (BOM): material + cantidad por genoma.
    IF pMatIds IS NOT NULL THEN
        FOR i IN 1 .. COALESCE(array_length(pMatIds, 1), 0) LOOP
            IF pMatIds[i] IS NOT NULL THEN
                INSERT INTO MATERIAL_PRODUCTO (fk_mat_id, fk_jug_id, matpro_cantidad)
                VALUES (pMatIds[i], vJug, COALESCE(pMatCants[i], 1));
            END IF;
        END LOOP;
    END IF;

    SELECT COALESCE(MAX(pro_sku), 100000) + 1 INTO vSku FROM PRODUCTO;

    INSERT INTO PRODUCTO (fk_jug_id, pro_sku, pro_nombre, pro_preciobase, pro_lanzamientofecha,
                          pro_tipo, fk_catpro_id, fk_lotpro_id, fk_edi_id, fk_exc_id)
    VALUES (vJug, vSku, pNombre, pPrecio, pFecha, 'INDIVIDUAL', pCat, pLote, pEdi, pExc)
    RETURNING pro_id INTO vPro;

    -- Stock inicial en un almacen (INVENTARIO), si se indico.
    IF pStock IS NOT NULL AND pStock > 0 AND pAlm IS NOT NULL THEN
        INSERT INTO INVENTARIO (fk_pro_id, fk_alm_id, inv_stockdisponible, inv_cantidad, inv_fecha_actualizacion)
        VALUES (vPro, pAlm, pStock, pStock, CURRENT_DATE);
    END IF;

    IF pProf IS NOT NULL THEN
        INSERT INTO HISTORICO_PROFESION (hispro_anoasignacion, fk_prof_id, fk_pro_id)
        VALUES (COALESCE(pProfAno, EXTRACT(YEAR FROM CURRENT_DATE)::TEXT), pProf, vPro);
    END IF;

    RETURN vPro;
END
$$;

-- Edita el genoma (ADN) de un producto: molde, cuerpo, era y colores por zona.
-- Actualiza el JUGUETE (regenerando el ADN) y reemplaza sus colores.
CREATE OR REPLACE FUNCTION actualizar_genoma (
    pPro INT, pMolros INT, pTipcue INT, pEra INT,
    pColIds INT[], pZonas VARCHAR[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    vJug INT;
    vAdn VARCHAR(50);
    i INT;
BEGIN
    SELECT fk_jug_id INTO vJug FROM PRODUCTO WHERE pro_id = pPro;
    IF vJug IS NULL THEN
        RAISE EXCEPTION 'El producto % no tiene genoma (juguete) editable.', pPro;
    END IF;

    SELECT 'ADN-' || UPPER(LEFT(REPLACE(COALESCE(per.per_nombre, 'GEN'), ' ', ''), 12)) || '-' || UPPER(LEFT(REPLACE(COALESCE(mr.molros_nombre, 'X'), ' ', ''), 14))
      INTO vAdn
      FROM MOLDE_ROSTRO mr LEFT JOIN PERSONAJE per ON per.per_id = mr.fk_per_id
     WHERE mr.molros_id = pMolros;

    UPDATE JUGUETE
       SET fk_molros_id = pMolros, fk_tipcue_id = pTipcue, fk_erahis_id = pEra,
           jug_adn = COALESCE(vAdn, jug_adn)
     WHERE jug_id = vJug;

    -- Reemplaza los colores del genoma con el conjunto recibido.
    IF pColIds IS NOT NULL THEN
        DELETE FROM COLOR_PRODUCTO WHERE fk_jug_id = vJug;
        FOR i IN 1 .. COALESCE(array_length(pColIds, 1), 0) LOOP
            IF pColIds[i] IS NOT NULL THEN
                INSERT INTO COLOR_PRODUCTO (fk_col_id, fk_jug_id, colpro_zonaaplicacion)
                VALUES (pColIds[i], vJug, pZonas[i]);
            END IF;
        END LOOP;
    END IF;
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
    IF EXISTS (SELECT 1 FROM INVENTARIO WHERE fk_pro_id = fkProId AND fk_alm_id = fkAlmId) THEN
        RAISE EXCEPTION 'Ya existe inventario del producto % en el almacen %: editalo en lugar de crear uno nuevo.', fkProId, fkAlmId;
    END IF;
    IF stockDisponible < 0 OR cantidad < 0 THEN
        RAISE EXCEPTION 'El stock disponible y la cantidad no pueden ser negativos.';
    END IF;
    IF stockDisponible > cantidad THEN
        RAISE EXCEPTION 'El stock disponible (%) no puede superar la cantidad total (%).', stockDisponible, cantidad;
    END IF;
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
    permRecurso VARCHAR(50),
    permAccion VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERMISO (perm_recurso, perm_accion)
    VALUES (permRecurso, permAccion);
END
$$;

-- ===================== AUTENTICACIÓN / PERMISOS =====================
-- Valida credenciales contra la BD (la comparación vive aquí, no en el front).
CREATE OR REPLACE FUNCTION validar_login (
    pUsuario VARCHAR(50),
    pClave VARCHAR(50)
)
RETURNS TABLE (usu_id INT, usu_nombre VARCHAR(50), rol_id INT, rol_nombre VARCHAR(50))
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT u.usu_id, u.usu_nombre, r.rol_id, r.rol_nombre
    FROM USUARIO u
    JOIN ROL r ON r.rol_id = u.fk_rol_id
    -- Usuario sin distinción de mayúsculas/minúsculas; la clave sí es exacta.
    WHERE LOWER(u.usu_nombre) = LOWER(pUsuario) AND u.usu_clave = pClave;
END
$$;

-- Devuelve la lista (recurso, accion) que concede un rol.
CREATE OR REPLACE FUNCTION permisos_de_rol (
    pRolId INT
)
RETURNS TABLE (perm_recurso VARCHAR(50), perm_accion VARCHAR(20))
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT p.perm_recurso, p.perm_accion
    FROM PERMISO_ROL pr
    JOIN PERMISO p ON p.perm_id = pr.fk_perm_id
    WHERE pr.fk_rol_id = pRolId;
END
$$;


CREATE OR REPLACE PROCEDURE createRol (
    nombreRol VARCHAR(50),
    ambitoRol VARCHAR(10) DEFAULT 'INTERNO'
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO ROL (rol_nombre, rol_ambito)
    VALUES (nombreRol, ambitoRol);
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
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RAISE EXCEPTION 'El correo "%" ya está registrado', correoUsuario;
END
$$;
CREATE OR REPLACE PROCEDURE createPermisoRol (
    fkRolId INT,
    fkPerId INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO PERMISO_ROL (fk_rol_id, fk_perm_id)
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

