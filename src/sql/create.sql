-- =====================================================================
-- Base de datos Mattel / UCAB - script corregido (PostgreSQL)
-- Correcciones de validez SQL y de consistencia con el diagrama ER.
-- Las líneas marcadas con "CORREGIDO", "AÑADIDO" o "NOTA" indican cambios.
-- =====================================================================

-- ---------------------------------------------------------------------
-- LUGAR (jerarquía Estado / Municipio / Parroquia, auto-relación)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LUGAR (
    lug_id SERIAL PRIMARY KEY,
    lug_nombre VARCHAR(100) NOT NULL,
    lug_tipo VARCHAR(50) NOT NULL CHECK (lug_tipo IN ('ESTADO', 'MUNICIPIO', 'PARROQUIA')),
    fk_lug_id INT,
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

-- =====================================================================
-- SECCIÓN: PRODUCCIÓN DE JUGUETES
-- =====================================================================
CREATE TABLE IF NOT EXISTS COLOR (
    col_id SERIAL PRIMARY KEY,
    col_nombre VARCHAR(100) NOT NULL,
    col_codhex VARCHAR(6)
);

CREATE TABLE IF NOT EXISTS TIPO_CUERPO (
    tipcue_id SERIAL PRIMARY KEY,
    tipcue_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PERSONAJE (
    per_id SERIAL PRIMARY KEY,
    per_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS VINCULO_PERSONAJE (
    fk_personaje1 INT NOT NULL,
    fk_personaje2 INT NOT NULL,
    vinper_tipo_relacion VARCHAR(100) NOT NULL,
    PRIMARY KEY (fk_personaje1, fk_personaje2),
    FOREIGN KEY (fk_personaje1) REFERENCES PERSONAJE (per_id),
    FOREIGN KEY (fk_personaje2) REFERENCES PERSONAJE (per_id)
);

CREATE TABLE IF NOT EXISTS MOLDE_ROSTRO (
    molros_id SERIAL PRIMARY KEY,
    molros_nombre VARCHAR(100) NOT NULL,
    molros_patente VARCHAR(100) NOT NULL,
    molros_anopatente INT,                  -- AÑADIDO: año de patente del molde (ej. Mackie 1991)
    fk_per_id INT NOT NULL,
    FOREIGN KEY (fk_per_id) REFERENCES PERSONAJE (per_id)
);

CREATE TABLE IF NOT EXISTS ERA_HISTORICO (
    erahis_id SERIAL PRIMARY KEY,
    erahis_nombre VARCHAR(100) NOT NULL,
    erahis_fechaini DATE NOT NULL,
    erahis_fechafin DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS MATERIAL (
    mat_id SERIAL PRIMARY KEY,
    mat_nombre VARCHAR(100) NOT NULL,
    mat_tipo VARCHAR(100) NOT NULL,
    mat_unidad VARCHAR(10) NOT NULL,
    mat_costo FLOAT NOT NULL                -- AÑADIDO: costo del material
);

CREATE TABLE IF NOT EXISTS DISENO (
    dis_id SERIAL PRIMARY KEY,
    dis_patentecod VARCHAR(50) NOT NULL,
    fk_emp_id INT                           -- AÑADIDO: empleado (I+D) que diseñó el ADN (FK en constraints.sql)
);

CREATE TABLE IF NOT EXISTS JUGUETE (
    jug_id SERIAL PRIMARY KEY,
    jug_adn VARCHAR(50) NOT NULL,
    fk_molros_id INT,
    fk_tipcue_id INT,
    fk_erahis_id INT,
    fk_dis_id INT,
    FOREIGN KEY (fk_molros_id) REFERENCES MOLDE_ROSTRO (molros_id),
    FOREIGN KEY (fk_tipcue_id) REFERENCES TIPO_CUERPO (tipcue_id),
    FOREIGN KEY (fk_erahis_id) REFERENCES ERA_HISTORICO (erahis_id),
    FOREIGN KEY (fk_dis_id) REFERENCES DISENO (dis_id)
);

-- CORREGIDO: las FK apuntaban a PERSONAJE. El ER define "Combina" como
-- auto-relación sobre JUGUETE, por lo que deben referenciar JUGUETE.
CREATE TABLE IF NOT EXISTS COMPATIBILIDAD_JUGUETE (
    fk_juguete1 INT NOT NULL,
    fk_juguete2 INT NOT NULL,
    PRIMARY KEY (fk_juguete1, fk_juguete2),
    FOREIGN KEY (fk_juguete1) REFERENCES JUGUETE (jug_id),
    FOREIGN KEY (fk_juguete2) REFERENCES JUGUETE (jug_id)
);

-- NOTA DE DISEÑO: el ER nombra estas relaciones "Color_Producto" y
-- "Material_Producto", pero color y material son propiedades físicas del
-- JUGUETE, por lo que se mantiene el enlace a JUGUETE (como en el script
-- original). Para conformidad estricta con el ER, cambiar fk_jug_id por
-- una FK a PRODUCTO(pro_id).
-- PK por (juguete, zona): cada zona admite un unico color, pero un mismo color
-- puede repetirse en varias zonas (p.ej. piel y labios rosados). La PK anterior
-- (fk_col_id, fk_jug_id) impedia reutilizar un color en otra zona.
CREATE TABLE IF NOT EXISTS COLOR_PRODUCTO (
    fk_col_id INT NOT NULL,
    fk_jug_id INT,
    colpro_zonaaplicacion VARCHAR(50) NOT NULL,
    PRIMARY KEY (fk_jug_id, colpro_zonaaplicacion),
    FOREIGN KEY (fk_col_id) REFERENCES COLOR (col_id),
    FOREIGN KEY (fk_jug_id) REFERENCES JUGUETE (jug_id)
);

CREATE TABLE IF NOT EXISTS MATERIAL_PRODUCTO (
    fk_mat_id INT,
    fk_jug_id INT,
    matpro_cantidad INT NOT NULL,
    PRIMARY KEY (fk_mat_id, fk_jug_id),
    FOREIGN KEY (fk_mat_id) REFERENCES MATERIAL (mat_id),
    FOREIGN KEY (fk_jug_id) REFERENCES JUGUETE (jug_id)
);

-- =====================================================================
-- SECCIÓN: EMPLEADOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS DEPARTAMENTO (
    dep_id SERIAL PRIMARY KEY,
    dep_nombre VARCHAR(100) NOT NULL,
    dep_descripcion TEXT
);

CREATE TABLE IF NOT EXISTS CARGO (
    car_id SERIAL PRIMARY KEY,
    car_nombre VARCHAR(100) NOT NULL,
    car_sueldobase FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS TURNO (
    tur_id SERIAL PRIMARY KEY,
    tur_fecha VARCHAR(3) NOT NULL CHECK (tur_fecha IN ('LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM')),
    tur_horaini INT NOT NULL,
    tur_horafin INT                 -- CORREGIDO: opcional (°) según el ER
);

CREATE TABLE IF NOT EXISTS EMPLEADO (
    emp_id SERIAL PRIMARY KEY,
    emp_pnombre VARCHAR(50) NOT NULL,
    emp_snombre VARCHAR(50),
    emp_papellido VARCHAR(50) NOT NULL,
    emp_sapellido VARCHAR(50) NOT NULL,
    emp_direccion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS DEP_EMP (
    depemp_fechaini DATE NOT NULL,
    depemp_fechafin DATE,
    fk_dep_id INT,
    fk_emp_id INT,
    fk_car_id INT NOT NULL,
    PRIMARY KEY (fk_dep_id, fk_emp_id),
    FOREIGN KEY (fk_dep_id) REFERENCES DEPARTAMENTO (dep_id),
    FOREIGN KEY (fk_emp_id) REFERENCES EMPLEADO (emp_id),
    Foreign Key (fk_car_id) REFERENCES CARGO (car_id)
);


CREATE TABLE IF NOT EXISTS EMP_TURNO (
    fk_emp_id INT,
    fk_tur_id INT,
    PRIMARY KEY (fk_emp_id, fk_tur_id),
    FOREIGN KEY (fk_emp_id) REFERENCES EMPLEADO (emp_id),
    FOREIGN KEY (fk_tur_id) REFERENCES TURNO (tur_id)
);

-- =====================================================================
-- SECCIÓN: INSPECCIÓN
-- =====================================================================
CREATE TABLE IF NOT EXISTS LOTE_PRODUCCION (
    lotpro_id SERIAL PRIMARY KEY,
    lotpro_fechaini DATE NOT NULL,
    lotpro_fechafin DATE
);

CREATE TABLE IF NOT EXISTS INSPECCION_CALIDAD (
    inscal_id SERIAL PRIMARY KEY,
    inscal_fecha DATE NOT NULL,
    inscal_resultado VARCHAR(50) NOT NULL,  -- CORREGIDO: obligatorio (*) según el ER
    fk_lotpro_id INT,
    fk_emp_id INT NOT NULL,
    FOREIGN KEY (fk_lotpro_id) REFERENCES LOTE_PRODUCCION(lotpro_id),
    Foreign Key (fk_emp_id) REFERENCES EMPLEADO(emp_id)
);

CREATE TABLE IF NOT EXISTS DEFECTO (
    def_id SERIAL PRIMARY KEY,
    def_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS DEFECTO_LOTE (
    deflot_cantidadafectada INT NOT NULL,
    fk_def_id INT,
    fk_lotpro_id INT,
    PRIMARY KEY (fk_def_id, fk_lotpro_id),
    FOREIGN KEY (fk_def_id) REFERENCES DEFECTO (def_id),
    FOREIGN KEY (fk_lotpro_id) REFERENCES LOTE_PRODUCCION (lotpro_id)
);

-- =====================================================================
-- SECCIÓN: PRODUCTO
-- =====================================================================
CREATE TABLE IF NOT EXISTS CATEGORIA_PRODUCTO (
    catpro_id SERIAL PRIMARY KEY,
    catpro_descripcion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS EDICION (
    edi_id SERIAL PRIMARY KEY,
    edi_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PROFESION (
    prof_id SERIAL PRIMARY KEY,
    prof_nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS EXCLUSIVIDAD (
    exc_id SERIAL PRIMARY KEY,
    exc_nombre VARCHAR(100) NOT NULL,       -- CORREGIDO: obligatorio (*) según el ER
    exc_limiteproducto INT NOT NULL         -- CORREGIDO: obligatorio (*) según el ER
);

-- CORREGIDO: pro_id pasa a SERIAL para ser consistente con el resto.
CREATE TABLE IF NOT EXISTS PRODUCTO (
    pro_id SERIAL PRIMARY KEY,
    pro_sku INT NOT NULL,
    pro_nombre VARCHAR(100) NOT NULL,
    pro_preciobase FLOAT NOT NULL,
    pro_costoproduccion FLOAT,              -- AÑADIDO: snapshot histórico del costo de producción (front: costoProduccionUsd). Nullable para no romper insert.sql.
    pro_lanzamientofecha DATE NOT NULL,
    pro_tipo VARCHAR(100) NOT NULL,
    fk_jug_id INT NOT NULL,
    fk_catpro_id INT NOT NULL,
    fk_lotpro_id INT NOT NULL,
    fk_edi_id INT NOT NULL,
    fk_exc_id INT NOT NULL,
    FOREIGN KEY (fk_jug_id) REFERENCES JUGUETE (jug_id),
    FOREIGN KEY (fk_catpro_id) REFERENCES CATEGORIA_PRODUCTO (catpro_id),
    FOREIGN KEY (fk_lotpro_id) REFERENCES LOTE_PRODUCCION (lotpro_id),
    FOREIGN KEY (fk_edi_id) REFERENCES EDICION (edi_id),
    FOREIGN KEY (fk_exc_id) REFERENCES EXCLUSIVIDAD (exc_id)
);

CREATE TABLE IF NOT EXISTS DETALLE_SET (
    fk_pro1 INT,
    fk_pro2 INT,
    detset_nombre VARCHAR(100) NOT NULL,
    PRIMARY KEY (fk_pro1, fk_pro2),
    FOREIGN KEY (fk_pro1) REFERENCES PRODUCTO (pro_id),
    FOREIGN KEY (fk_pro2) REFERENCES PRODUCTO (pro_id)
);

CREATE TABLE IF NOT EXISTS HISTORICO_PROFESION (
    hispro_anoasignacion VARCHAR(4) NOT NULL,
    fk_prof_id INT,
    fk_pro_id INT,
    PRIMARY KEY (fk_pro_id, fk_prof_id),
    FOREIGN KEY (fk_pro_id) REFERENCES PRODUCTO (pro_id),
    FOREIGN KEY (fk_prof_id) REFERENCES PROFESION (prof_id)
);

-- =====================================================================
-- SECCIÓN: ALMACÉN
-- =====================================================================
CREATE TABLE IF NOT EXISTS HUB_REGIONAL (
    hubreg_id SERIAL PRIMARY KEY,
    hubreg_nombre VARCHAR(100) NOT NULL,
    fk_lug_id INT NOT NULL,
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

CREATE TABLE IF NOT EXISTS ALMACEN (
    alm_id SERIAL PRIMARY KEY,
    alm_tipoinstalacion VARCHAR(100) NOT NULL,
    fk_hubreg_id INT NOT NULL,
    fk_lug_id INT NOT NULL,
    FOREIGN KEY (fk_hubreg_id) REFERENCES HUB_REGIONAL (hubreg_id),
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

CREATE TABLE IF NOT EXISTS INVENTARIO (
    fk_pro_id INT NOT NULL,
    fk_alm_id INT NOT NULL,
    inv_stockdisponible INT NOT NULL,
    inv_cantidad INT NOT NULL,
    inv_fecha_actualizacion DATE NOT NULL,
    PRIMARY KEY (fk_pro_id, fk_alm_id),
    FOREIGN KEY (fk_pro_id) REFERENCES PRODUCTO (pro_id),
    FOREIGN KEY (fk_alm_id) REFERENCES ALMACEN (alm_id)
);

-- =====================================================================
-- SECCIÓN: MÉTODOS DE PAGO (subtipos de METODO_PAGO)
-- =====================================================================
CREATE TABLE IF NOT EXISTS METODO_PAGO (
    metpag_id SERIAL PRIMARY KEY
);

-- CORREGIDO: fk_metpag_id era SERIAL (generaba su propia secuencia);
-- debe ser INT como FK al supertipo.
CREATE TABLE IF NOT EXISTS EFECTIVO (
    fk_metpag_id INT PRIMARY KEY,
    efe_denominacion VARCHAR(50) NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

CREATE TABLE IF NOT EXISTS TARJETA (
    fk_metpag_id INT PRIMARY KEY,
    tar_numero BIGINT NOT NULL,    
    tar_cvv INT NOT NULL,    
    tar_banco VARCHAR(100) NOT NULL,
    tar_emisor VARCHAR(100) NOT NULL,
    tar_fechaven DATE NOT NULL,
    tar_titular VARCHAR(100) NOT NULL,
    tar_tipo VARCHAR(7) NOT NULL CHECK (tar_tipo IN ('DEBITO', 'CREDITO')),
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

-- CORREGIDO: se añadieron che_numero y che_titular (presentes en el ER);
-- se eliminó che_emisor (redundante con che_banco = banco emisor).
CREATE TABLE IF NOT EXISTS CHEQUE (
    fk_metpag_id INT PRIMARY KEY,
    che_codigocuenta BIGINT NOT NULL,  -- CORREGIDO: cuenta como texto (20 díg.)
    che_numero VARCHAR(20) NOT NULL,        -- AÑADIDO (ER: chequ_numero)
    che_titular VARCHAR(100) NOT NULL,      -- AÑADIDO (ER: chequ_nombre_titular)
    che_monto FLOAT NOT NULL,
    che_banco VARCHAR(100) NOT NULL,
    che_fechaemision DATE NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

CREATE TABLE IF NOT EXISTS DEPOSITO_BANCARIO (
    fk_metpag_id INT PRIMARY KEY,
    depban_cuentadestino VARCHAR(20) NOT NULL,  -- CORREGIDO: cuenta como texto
    depban_bancodestino VARCHAR(100) NOT NULL,  -- CORREGIDO: banco como texto
    depban_fecha DATE NOT NULL,
    depban_numref VARCHAR(30) NOT NULL,         -- CORREGIDO: referencia como texto
    depban_monto FLOAT NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

-- CORREGIDO: prefijo tran_ para evitar choque con TRANSPORTISTA (tra_).
CREATE TABLE IF NOT EXISTS TRANSFERENCIA (
    fk_metpag_id INT PRIMARY KEY,
    tran_numref VARCHAR(30) NOT NULL,
    tran_fecha DATE NOT NULL,
    tran_monto FLOAT NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

CREATE TABLE IF NOT EXISTS CRIPTOMONEDA (
    fk_metpag_id INT PRIMARY KEY,
    cri_idtransaccion VARCHAR(100) NOT NULL,    -- CORREGIDO: hash de transacción (texto largo)
    cri_fecha DATE NOT NULL,
    cri_monto FLOAT NOT NULL,
    cri_direcciondestino VARCHAR(100) NOT NULL,
    cri_monedanombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

CREATE TABLE IF NOT EXISTS BILLETERA_DIGITAL (
    fk_metpag_id INT PRIMARY KEY,
    bildig_codigoreferencia VARCHAR(50) NOT NULL,
    bildig_fecha DATE NOT NULL,
    bildig_monto FLOAT NOT NULL,
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

-- =====================================================================
-- SECCIÓN: CLIENTE
-- =====================================================================
CREATE TABLE IF NOT EXISTS CLIENTE (
    cli_id SERIAL PRIMARY KEY,
    cli_fecharegis DATE NOT NULL,
    fk_lug_id INT NOT NULL,
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

CREATE TABLE IF NOT EXISTS PERSONA_NATURAL (
    fk_cli_id INT PRIMARY KEY,
    pernat_cedula VARCHAR(20) NOT NULL,     -- CORREGIDO: cédula como texto
    pernat_pnombre VARCHAR(50) NOT NULL,
    pernat_snombre VARCHAR(50),
    pernat_papellido VARCHAR(50) NOT NULL,
    pernat_sapellido VARCHAR(50),           
    pernat_fechanac DATE NOT NULL,
    pernat_direccion TEXT NOT NULL,
    FOREIGN KEY (fk_cli_id) REFERENCES CLIENTE (cli_id)
);

CREATE TABLE IF NOT EXISTS PERSONA_JURIDICA (
    fk_cli_id INT PRIMARY KEY,
    perjur_rif VARCHAR(20) NOT NULL,        -- CORREGIDO: RIF como texto (prefijo J-, etc.)
    perjur_razonsocial VARCHAR(100) NOT NULL,
    perjur_reprelegal VARCHAR(100) NOT NULL,
    FOREIGN KEY (fk_cli_id) REFERENCES CLIENTE (cli_id)
);

-- =====================================================================
-- SECCIÓN: USUARIOS / SEGURIDAD
-- =====================================================================
-- CORREGIDO: prefijo perm_ para evitar choque con PERSONAJE (per_).
-- Permiso granular = (recurso, accion). Cada par define un privilegio concreto
-- (ej. PRODUCTO/CREAR). Los roles se componen asignando varios permisos.
CREATE TABLE IF NOT EXISTS PERMISO (
    perm_id SERIAL PRIMARY KEY,
    perm_recurso VARCHAR(50) NOT NULL,
    perm_accion VARCHAR(20) NOT NULL CHECK (perm_accion IN ('VER', 'CREAR', 'EDITAR', 'ELIMINAR')),
    UNIQUE (perm_recurso, perm_accion)
);

CREATE TABLE IF NOT EXISTS ROL (
    rol_id SERIAL PRIMARY KEY,
    rol_nombre VARCHAR(50) NOT NULL,
    -- Ambito del rol: INTERNO (empleado) o EXTERNO (cliente). Determina si el
    -- usuario con ese rol se vincula a un empleado o a un cliente.
    rol_ambito VARCHAR(10) NOT NULL DEFAULT 'INTERNO' CHECK (rol_ambito IN ('INTERNO', 'EXTERNO'))
);

CREATE TABLE IF NOT EXISTS USUARIO (
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(50) NOT NULL,
    usu_clave VARCHAR(50) NOT NULL,
    usu_correo VARCHAR(50) NOT NULL,
    fk_rol_id INT NOT NULL,
    fk_emp_id INT,
    fk_cli_id INT,
    FOREIGN KEY (fk_rol_id) REFERENCES ROL (rol_id),
    FOREIGN KEY (fk_emp_id) REFERENCES EMPLEADO (emp_id),
    FOREIGN KEY (fk_cli_id) REFERENCES CLIENTE (cli_id),
    -- CORREGIDO: '!= NULL' nunca es verdadero; debe usarse IS NOT NULL.
    CONSTRAINT con_partial_empcli CHECK (fk_emp_id IS NOT NULL OR fk_cli_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS PERMISO_ROL (
    fk_rol_id INT,
    fk_perm_id INT,
    PRIMARY KEY (fk_rol_id, fk_perm_id),
    FOREIGN KEY (fk_rol_id) REFERENCES ROL (rol_id),
    FOREIGN KEY (fk_perm_id) REFERENCES PERMISO (perm_id)
);

-- =====================================================================
-- SECCIÓN: SUBASTA
-- =====================================================================
CREATE TABLE IF NOT EXISTS CONDICION_SUBASTA (
    consub_id SERIAL PRIMARY KEY,
    consub_nombre VARCHAR(100) NOT NULL
);

-- NOTA: sub_fechafin y sub_montoini no aparecen en el ER (que solo lista
-- Evento_Fecha y Evento_Estado); se conservan por ser útiles. Eliminar
-- si se requiere conformidad estricta con el ER.
CREATE TABLE IF NOT EXISTS SUBASTA (
    sub_id SERIAL PRIMARY KEY,
    sub_fechaini DATE NOT NULL,
    sub_fechafin DATE NOT NULL,
    sub_estado VARCHAR(100) NOT NULL,
    sub_montoini FLOAT NOT NULL,
    fk_pro_id INT NOT NULL,
    fk_consub_id INT NOT NULL,
    FOREIGN KEY (fk_pro_id) REFERENCES PRODUCTO (pro_id),
    FOREIGN KEY (fk_consub_id) REFERENCES CONDICION_SUBASTA (consub_id)
);

CREATE TABLE IF NOT EXISTS PUJA_SUBASTA (
    pujsub_id SERIAL PRIMARY KEY,
    pujsub_monto FLOAT NOT NULL,
    pujsub_fechahor TIMESTAMP NOT NULL,     -- CORREGIDO: 'tiempo' de la puja como fecha-hora
    fk_usu_id INT NOT NULL,
    fk_sub_id INT NOT NULL,
    FOREIGN KEY (fk_usu_id) REFERENCES USUARIO (usu_id),
    FOREIGN KEY (fk_sub_id) REFERENCES SUBASTA (sub_id)
);

-- =====================================================================
-- SECCIÓN: COMPRA
-- =====================================================================
CREATE TABLE IF NOT EXISTS ACUERDO_COMERCIAL (
    acucom_id SERIAL PRIMARY KEY,
    acucom_limitecredito INT NOT NULL,
    acucom_plazopago INT NOT NULL,          -- plazo de pago en días
    acucom_descuentomayorista INT NOT NULL,
    fk_perjur_id INT NOT NULL,
    FOREIGN KEY (fk_perjur_id) REFERENCES PERSONA_JURIDICA (fk_cli_id)
);

CREATE TABLE IF NOT EXISTS TRANSPORTISTA (
    tra_id SERIAL PRIMARY KEY,
    tra_empresa VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS COMPRA (
    com_id SERIAL PRIMARY KEY,
    com_fechahor TIMESTAMP NOT NULL,        -- CORREGIDO: fecha_hora como TIMESTAMP
    com_numfactura INT NOT NULL,
    com_subtotal FLOAT NOT NULL,
    com_total FLOAT NOT NULL,
    fk_tra_id INT NOT NULL,
    fk_acucom_id INT,
    fk_usu_id INT NOT NULL,
    fk_lug_id INT NOT NULL,
    FOREIGN KEY (fk_tra_id) REFERENCES TRANSPORTISTA (tra_id),
    FOREIGN KEY (fk_acucom_id) REFERENCES ACUERDO_COMERCIAL (acucom_id),
    FOREIGN KEY (fk_usu_id) REFERENCES USUARIO (usu_id),
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

CREATE TABLE IF NOT EXISTS ESTATUS_COMPRA (
    estcom_id SERIAL PRIMARY KEY,
    estcom_nom VARCHAR(100) NOT NULL,
    estcom_fechahoracierre TIMESTAMP NOT NULL   -- CORREGIDO: fecha_hora como TIMESTAMP
);

-- CORREGIDO: nombre de tabla (antes HISTORIO_ESTATUS, faltaba la 'C').
CREATE TABLE IF NOT EXISTS HISTORICO_ESTATUS (
    hisest_fechahora TIMESTAMP NOT NULL,
    fk_estcom_id INT,
    fk_com_id INT,
    PRIMARY KEY (fk_estcom_id, fk_com_id),
    FOREIGN KEY (fk_estcom_id) REFERENCES ESTATUS_COMPRA (estcom_id),
    FOREIGN KEY (fk_com_id) REFERENCES COMPRA (com_id)
);

CREATE TABLE IF NOT EXISTS DESCUENTO (
    des_id SERIAL PRIMARY KEY,
    des_nombre VARCHAR(100) NOT NULL,
    des_porcentaje FLOAT NOT NULL,
    des_fechaven DATE
);

CREATE TABLE IF NOT EXISTS DESCUENTO_COMPRA (
    fk_des_id INT,
    fk_com_id INT,
    PRIMARY KEY (fk_des_id, fk_com_id),
    FOREIGN KEY (fk_des_id) REFERENCES DESCUENTO (des_id),
    FOREIGN KEY (fk_com_id) REFERENCES COMPRA (com_id)
);

-- AÑADIDO histascam_tasa: el ER no almacenaba el valor de la tasa, sin el
-- cual la tabla no cumple su función. Se incluye el factor de conversión.
CREATE TABLE IF NOT EXISTS HISTORICO_TASA_CAMBIO (
    histascam_id SERIAL PRIMARY KEY,
    histascam_monedaoriginal VARCHAR(100) NOT NULL,
    histascam_monedaconvertida VARCHAR(100) NOT NULL,
    histascam_tasa FLOAT NOT NULL,
    histascam_fecha DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS PAGO (
    pag_id INT,
    pag_monto FLOAT NOT NULL,
    pag_fecha DATE NOT NULL,
    fk_com_id INT,
    fk_metpag_id INT,
    PRIMARY KEY (pag_id, fk_com_id, fk_metpag_id),
    FOREIGN KEY (fk_com_id) REFERENCES COMPRA (com_id),
    FOREIGN KEY (fk_metpag_id) REFERENCES METODO_PAGO (metpag_id)
);

-- CORREGIDO: se añadió clave primaria compuesta (antes la tabla no tenía PK)
-- y se marcaron las FK como NOT NULL.
CREATE TABLE IF NOT EXISTS DETALLE_COMPRA (
    detcom_cantidad INT NOT NULL,
    fk_com_id INT NOT NULL,
    fk_pro_id INT NOT NULL,
    fk_alm_id INT NOT NULL,
    PRIMARY KEY (fk_com_id, fk_pro_id, fk_alm_id),
    FOREIGN KEY (fk_com_id) REFERENCES COMPRA (com_id),
    FOREIGN KEY (fk_pro_id, fk_alm_id) REFERENCES INVENTARIO (fk_pro_id, fk_alm_id)
);

CREATE TABLE IF NOT EXISTS MEMBRESIA (
    mem_id SERIAL PRIMARY KEY,
    mem_nombre VARCHAR(100) NOT NULL,
    mem_descuento FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS HISTORICO_MEMBRESIA (
    hismem_fechaini DATE NOT NULL,
    hismem_fechafin DATE,
    fk_mem_id INT,
    fk_cli_id INT,
    PRIMARY KEY (fk_mem_id, fk_cli_id),
    FOREIGN KEY (fk_mem_id) REFERENCES MEMBRESIA (mem_id),
    FOREIGN KEY (fk_cli_id) REFERENCES CLIENTE (cli_id)
);

-- ---------------------------------------------------------------------
-- VISTA: catálogo de productos resuelto (ADN). Resuelve en la BD las
-- uniones (juguete → molde → diseño → empleado), el stock total y el
-- COSTO de producción (Σ costo material × cantidad del BOM), para que el
-- front no calcule nada: sólo lee la vista.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_PRODUCTO_ADN AS
SELECT
    p.pro_id,
    p.pro_sku,
    p.pro_nombre,
    p.pro_preciobase,
    p.pro_lanzamientofecha,
    p.pro_tipo,
    p.fk_exc_id,
    p.fk_jug_id,
    p.fk_lotpro_id,
    p.fk_catpro_id,
    p.fk_edi_id,
    j.jug_adn,
    j.fk_molros_id,
    j.fk_tipcue_id,
    j.fk_erahis_id,
    mr.fk_per_id AS personaje_id,
    d.dis_patentecod AS diseno_patente,
    d.fk_emp_id AS disenador_id,
    CASE WHEN e.emp_id IS NULL THEN NULL
         ELSE e.emp_pnombre || ' ' || e.emp_papellido END AS disenador,
    COALESCE((SELECT SUM(i.inv_stockdisponible) FROM INVENTARIO i WHERE i.fk_pro_id = p.pro_id), 0) AS stock,
    COALESCE(p.pro_costoproduccion,
             (SELECT SUM(m.mat_costo * mp.matpro_cantidad)
                FROM MATERIAL_PRODUCTO mp JOIN MATERIAL m ON m.mat_id = mp.fk_mat_id
               WHERE mp.fk_jug_id = p.fk_jug_id),
             0) AS costo_produccion
FROM PRODUCTO p
LEFT JOIN JUGUETE j      ON j.jug_id    = p.fk_jug_id
LEFT JOIN MOLDE_ROSTRO mr ON mr.molros_id = j.fk_molros_id
LEFT JOIN DISENO d       ON d.dis_id    = j.fk_dis_id
LEFT JOIN EMPLEADO e     ON e.emp_id    = d.fk_emp_id;

-- ---------------------------------------------------------------------
-- VISTA: resumen de lote de produccion. Cruza el lote con su inspeccion
-- de calidad (resultado + inspector), el numero de productos fabricados
-- y los defectos detectados, para la trazabilidad de manufactura.
-- (En los datos hay 1 inspeccion por lote.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW VW_LOTE_RESUMEN AS
SELECT
    l.lotpro_id,
    l.lotpro_fechaini,
    l.lotpro_fechafin,
    ic.inscal_resultado,
    ic.inscal_fecha,
    CASE WHEN e.emp_id IS NULL THEN NULL
         ELSE e.emp_pnombre || ' ' || e.emp_papellido END AS inspector,
    (SELECT COUNT(*) FROM PRODUCTO p WHERE p.fk_lotpro_id = l.lotpro_id) AS num_productos,
    (SELECT COUNT(*) FROM DEFECTO_LOTE dl WHERE dl.fk_lotpro_id = l.lotpro_id) AS num_defectos,
    COALESCE((SELECT SUM(dl.deflot_cantidadafectada) FROM DEFECTO_LOTE dl WHERE dl.fk_lotpro_id = l.lotpro_id), 0) AS unidades_afectadas
FROM LOTE_PRODUCCION l
LEFT JOIN INSPECCION_CALIDAD ic ON ic.fk_lotpro_id = l.lotpro_id
LEFT JOIN EMPLEADO e            ON e.emp_id        = ic.fk_emp_id;