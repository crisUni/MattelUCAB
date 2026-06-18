CREATE TABLE IF NOT EXISTS LUGAR (
    lug_id SERIAL PRIMARY KEY,
    lug_nombre VARCHAR(100) NOT NULL,
    lug_tipo VARCHAR(50) NOT NULL CHECK (lug_tipo IN ('ESTADO', 'MUNICIPIO', 'PARROQUIA')),
    fk_lug_id INT,
    FOREIGN KEY (fk_lug_id) REFERENCES LUGAR (lug_id)
);

#SECTION - PRODUCCION DE JUGUETES
CREATE TABLE IF NOT EXISTS COLOR (
    col_id SERIAL PRIMARY KEY,
    col_nombre VARCHAR(100) NOT NULL,
    col_codhex VARCHAR(6)
);

CREATE TABLE IF NOT EXISTS TIPO_CUERPO (
  tipcue_id SERIAL PRIMARY KEY,
  tipcue_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS PERSONAJE (
    per_id SERIAL PRIMARY KEY,
    per_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS VINCULO_PERSONAJE (
    fk_personaje1 INT NOT NULL,
    fk_personaje2 INT NOT NULL,
    vinper_tipo_relacion VARCHAR(100) NOT NULL,

    PRIMARY KEY (fk_personaje1, fk_personaje2),
    FOREIGN KEY (fk_personaje1) REFERENCES PERSONAJE (per_id),
    FOREIGN KEY (fk_personaje2) REFERENCES PERSONAJE (per_id)
)

CREATE TABLE IF NOT EXISTS MOLDE_ROSTRO (
    molros_id SERIAL PRIMARY KEY,
    molros_nombre VARCHAR(100) NOT NULL,
    molros_patente VARCHAR(100) NOT NULL,
    fk_per_id INT NOT NULL,
    FOREIGN KEY (fk_per_id) REFERENCES PERSONAJE (per_id)
)

CREATE TABLE IF NOT EXISTS ERA_HISTORICO (
    erahis_id SERIAL PRIMARY KEY,
    erahis_nombre VARCHAR(100) NOT NULL,
    erahis_fechaini DATE NOT NULL,
    erahis_fechafin DATE NOT NULL
)

CREATE TABLE IF NOT EXISTS MATERIAL (
    mat_id SERIAL PRIMARY KEY,
    mat_nombre VARCHAR(100) NOT NULL,
    mat_tipo VARCHAR(100) NOT NULL,
    mat_unidad VARCHAR(10) NOT NULL
)

CREATE TABLE IF NOT EXISTS DISENO (
    dis_id SERIAL PRIMARY KEY,
    dis_patentecod VARCHAR(50) NOT NULL
)

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
)

CREATE TABLE IF NOT EXISTS COMPATIBILIDAD_JUGUETE(
    fk_juguete1 INT NOT NULL,
    fk_juguete2 INT NOT NULL,

    PRIMARY KEY (fk_juguete1, fk_juguete2),
    FOREIGN KEY (fk_juguete1) REFERENCES PERSONAJE (per_id),
    FOREIGN KEY (fk_juguete2) REFERENCES PERSONAJE (per_id)
)

CREATE TABLE IF NOT EXISTS COLOR_PRODUCTO(
    fk_col_id INT,
    fk_jug_id INT,
    colpro_zonaaplicacion VARCHAR(50) NOT NULL,

    PRIMARY KEY(fk_col_id, fk_jug_id),
    FOREIGN KEY (fk_col_id) REFERENCES COLOR (col_id),
    FOREIGN KEY (fk_jug_id) REFERENCES JUGUETE (jug_id)
)

CREATE TABLE IF NOT EXISTS MATERIAL_PRODUCTO(
    fk_mat_id INT,
    fk_jug_id INT,
    matpro_cantidad INT NOT NULL,

    PRIMARY KEY(fk_mat_id, fk_jug_id),
    FOREIGN KEY (fk_mat_id) REFERENCES MATERIAL (mat_id),
    FOREIGN KEY (fk_jug_id) REFERENCES JUGUETE (jug_id)    
)

#!SECTION
#SECTION EMPLEADOS
CREATE TABLE IF NOT EXISTS DEPARTAMENTO(
    dep_id SERIAL PRIMARY KEY,
    dep_nombre VARCHAR(100) NOT NULL,
    dep_descripcion TEXT
)

CREATE TABLE IF NOT EXISTS CARGO (
    car_id SERIAL PRIMARY KEY,
    car_nombre VARCHAR(100) NOT NULL,
    car_sueldobase FLOAT NOT NULL   
)

CREATE TABLE IF NOT EXISTS TURNO (
    tur_id SERIAL PRIMARY KEY,
    tur_fecha VARCHAR(3) NOT NULL CHECK (tur_fecha IN ('LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM')),
    tur_horaini INT NOT NULL,
    tur_horafin INT NOT NULL
)

CREATE TABLE IF NOT EXISTS EMPLEADO (
    emp_id SERIAL PRIMARY KEY,
    emp_pnombre VARCHAR(50) NOT NULL,
    emp_snombre VARCHAR(50),
    emp_papellido VARCHAR(50) NOT NULL,
    emp_sapellido VARCHAR(50) NOT NULL,
    emp_direccion VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS DEP_EMP(
    depemp_fechaini DATE NOT NULL,
    depemp_fechafin DATE,
    fk_dep_id INT,
    fk_emp_id INT,
    fk_car_id INT,

    PRIMARY KEY(fk_dep_id, fk_emp_id),
    FOREIGN KEY(fk_dep_id) REFERENCES DEPARTAMENTO (dep_id),
    FOREIGN KEY(fk_emp_id) REFERENCES EMPLEADO (emp_id),
    FOREIGN KEY(fk_car_id) REFERENCES CARGO (car_id)
)

CREATE TABLE IF NOT EXISTS EMP_TURNO(
    fk_emp_id INT,
    fk_tur_id INT,

    PRIMARY KEY(fk_emp_id, fk_tur_id),
    FOREIGN KEY(fk_emp_id) REFERENCES EMPLEADO (emp_id),
    FOREIGN KEY(fk_tur_id) REFERENCES TURNO (tur_id)
)

#!SECTION
#SECTION - INSPECCION
CREATE TABLE IF NOT EXISTS LOTE_PRODUCCION(
    lotpro_id SERIAL PRIMARY KEY,
    lotpro_fechaini DATE NOT NULL,
    lotpro_fechafin DATE
)

CREATE TABLE IF NOT EXISTS INSPECCION_CALIDAD(
    inscal_id SERIAL PRIMARY KEY,
    inscal_fecha DATE NOT NULL,
    inscal_resultado VARCHAR(50),
    fk_lotpro_id INT,
    FOREIGN KEY (fk_lotpro_id) REFERENCES LOTE_PRODUCCION(lotpro_id)
)

CREATE TABLE IF NOT EXISTS DEFECTO (
    def_id SERIAL PRIMARY KEY,
    def_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS DEFECTO_LOTE (
    deflot_cantidadafectada INT NOT NULL,
    fk_def_id INT,
    fk_lotpro_id INT,

    PRIMARY KEY (fk_def_id, fk_lotpro_id),
    Foreign Key (fk_def_id) REFERENCES DEFECTO (def_id),
    Foreign Key (fk_lotpro_id) REFERENCES LOTE_PRODUCCION (lotpro_id)
)

#!SECTION
#SECTION - PRODUCTO

CREATE TABLE IF NOT EXISTS CATEGORIA_PRODUCTO(
    catpro_id SERIAL PRIMARY KEY,
    catpro_descripcion TEXT NOT NULL
)

CREATE TABLE IF NOT EXISTS EDICION (
    edi_id SERIAL PRIMARY KEY,
    edi_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS PROFESION(
    prof_id SERIAL PRIMARY KEY,
    prof_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS EXCLUSIVIDAD(
    exc_id SERIAL PRIMARY KEY,
    exc_nombre VARCHAR(100),
    exc_limiteproducto INT
)

#TODO - ADD CHECK FOR TIPO PRODUCTO
CREATE TABLE IF NOT EXISTS PRODUCTO (
    fk_jug_id INT NOT NULL,
    pro_id INT PRIMARY KEY,
    pro_sku INT NOT NULL,
    pro_nombre VARCHAR(100) NOT NULL,
    pro_preciobase FLOAT NOT NULL,
    pro_lanzamientofecha DATE NOT NULL,
    pro_tipo VARCHAR(100) NOT NULL,
    fk_catpro_id INT NOT NULL,
    fk_lotpro_id INT NOT NULL,
    fk_edi_id INT NOT NULL,
    fk_exc_id INT NOT NULL,

    Foreign Key (fk_jug_id) REFERENCES JUGUETE(jug_id),
    Foreign Key (fk_catpro_id) REFERENCES CATEGORIA_PRODUCTO(catpro_id),
    Foreign Key (fk_lotpro_id) REFERENCES LOTE_PRODUCCION(lotpro_id),
    Foreign Key (fk_edi_id) REFERENCES EDICION(edi_id),
    Foreign Key (fk_exc_id) REFERENCES EXCLUSIVIDAD(exc_id)
)

CREATE TABLE IF NOT EXISTS DETALLE_SET(
    fk_pro1 INT,
    fk_pro2 INT,
    detset_nombre VARCHAR(100) NOT NULL,

    PRIMARY KEY(fk_pro1, fk_pro2),
    Foreign Key (fk_pro1) REFERENCES PRODUCTO(pro_id),
    Foreign Key (fk_pro2) REFERENCES PRODUCTO(pro_id)
)

CREATE TABLE IF NOT EXISTS HISTORICO_PROFESION(
    hispro_anoasignacion VARCHAR(4) NOT NULL,
    fk_prof_id INT,
    fk_pro_id INT,

    PRIMARY KEY(fk_pro_id, fk_prof_id),
    Foreign Key (fk_pro_id) REFERENCES PRODUCTO (pro_id),
    Foreign Key (fk_prof_id) REFERENCES PROFESION(prof_id)
)

#!SECTION
#SECTION - ALMACEN
CREATE TABLE IF NOT EXISTS HUB_REGIONAL(
    hubreg_id SERIAL PRIMARY KEY,
    hubreg_nombre VARCHAR(100) NOT NULL,
    fk_lug_id INT NOT NULL,
    Foreign Key (fk_lug_id) REFERENCES LUGAR(lug_id)
)

#TODO - ADD CHECK FOR TIPO DE INSTALACION
CREATE TABLE IF NOT EXISTS ALMACEN (
    alm_id SERIAL PRIMARY KEY,
    alm_tipoinstalacion VARCHAR(100) NOT NULL,
    fk_hubreg_id INT NOT NULL,
    fk_lug_id INT NOT NULL,

    Foreign Key (fk_hubreg_id) REFERENCES HUB_REGIONAL(hubreg_id),
    Foreign Key (fk_lug_id) REFERENCES LUGAR(lug_id)
)

CREATE TABLE IF NOT EXISTS INVENTARIO(
    fk_pro_id INT NOT NULL,
    fk_alm_id INT NOT NULL,
    inv_stockdisponible INT NOT NULL,
    inv_cantidad INT NOT NULL,
    inv_fecha_actualizacion DATE NOT NULL,

    PRIMARY KEY (fk_pro_id, fk_alm_id),
    FOREIGN KEY (fk_pro_id) REFERENCES PRODUCTO(pro_id),
    FOREIGN KEY (fk_alm_id) REFERENCES ALMACEN(alm_id)
)

#!SECTION
#SECTION - PAGO
CREATE TABLE IF NOT EXISTS METODO_PAGO(
    metpag_id SERIAL PRIMARY KEY
)

CREATE TABLE IF NOT EXISTS EFECTIVO(
    fk_metpag_id SERIAL PRIMARY KEY,
    efe_denominacion VARCHAR(50) NOT NULL,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id)
)

#emisor es el payment procesor
CREATE TABLE IF NOT EXISTS TARJETA (
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    tar_numero INT NOT NULL,
    tar_cvv INT NOT NULL,
    tar_banco VARCHAR(100) NOT NULL,
    tar_emisor VARCHAR(100) NOT NULL,
    tar_fechaven DATE NOT NULL,
    tar_titular VARCHAR(100) NOT NULL,
    tar_tipo VARCHAR(7) NOT NULL CHECK(tar_tipo IN ('DEBITO', 'CREDITO'))
)

CREATE TABLE IF NOT EXISTS CHEQUE (
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    che_codigocuenta INT NOT NULL,
    che_monto FLOAT NOT NULL,
    che_banco VARCHAR(100) NOT NULL,
    che_emisor VARCHAR(100) NOT NULL,
    che_fechaemision DATE NOT NULL
)

CREATE TABLE IF NOT EXISTS DEPOSITO_BANCARIO (
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    depban_cuentadestino INT NOT NULL,
    depban_bancodestino INT NOT NULL,
    depban_fecha DATE NOT NULL,
    depban_numref INT NOT NULL,
    depban_monto FLOAT NOT NULL
)

CREATE TABLE IF NOT EXISTS TRANSFERENCIA(
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    tra_numref INT NOT NULL,
    tra_fecha DATE NOT NULL,
    tra_monto FLOAT NOT NULL
)

CREATE TABLE IF NOT EXISTS CRIPTOMONEDA(
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    cri_idtransaccion INT NOT NULL,
    cri_fecha DATE NOT NULL,
    cri_monto FLOAT NOT NULL,
    cri_direcciondestino VARCHAR(100) NOT NULL,
    cri_monedanombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS BILLETERA_DIGITAL(
    fk_metpag_id INT PRIMARY KEY,
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id),
    bildig_codigoreferencia VARCHAR(50) NOT NULL,
    bildig_fecha DATE NOT NULL,
    bildig_monto FLOAT NOT NULL
)

#!SECTION
#SECTION - CLIENTE 
CREATE TABLE IF NOT EXISTS CLIENTE(
    cli_id SERIAL PRIMARY KEY,
    cli_fecharegis DATE NOT NULL,
    fk_lug_id INT NOT NULL,
    Foreign Key (fk_lug_id) REFERENCES LUGAR(lug_id)
)

CREATE TABLE IF NOT EXISTS PERSONA_NATURAL(
    fk_cli_id INT PRIMARY KEY,
    Foreign Key (fk_cli_id) REFERENCES CLIENTE(cli_id),
    pernat_cedula INT NOT NULL,
    pernat_pnombre VARCHAR (50) NOT NULL,
    pernat_snombre VARCHAR (50),
    pernat_papellido VARCHAR (50) NOT NULL,
    pernat_sapellido VARCHAR (50) NOT NULL,
    pernat_fechanac DATE NOT NULL,
    pernat_direccion TEXT NOT NULL
)

CREATE TABLE IF NOT EXISTS PERSONA_JURIDICA(
    fk_cli_id INT PRIMARY KEY,
    Foreign Key (fk_cli_id) REFERENCES CLIENTE(cli_id),
    perjur_rif INT NOT NULL,
    perjur_razonsocial VARCHAR(100) NOT NULL,
    perjur_reprelegal VARCHAR(100) NOT NULL    
)

#!SECTION
#SECTION - USUARIOS
CREATE TABLE IF NOT EXISTS PERMISO (
    per_id SERIAL PRIMARY KEY,
    per_moduloacceso VARCHAR(50) NOT NULL
)

CREATE TABLE IF NOT EXISTS ROL(
    rol_id SERIAL PRIMARY KEY,
    rol_nombre VARCHAR(50) NOT NULL    
)

CREATE TABLE IF NOT EXISTS USUARIO(
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(50) NOT NULL,
    usu_clave VARCHAR(50) NOT NULL,
    usu_correo VARCHAR(50) NOT NULL,
    fk_rol_id INT NOT NULL,
    fk_emp_id INT,
    fk_cli_id INT,

    Foreign Key (fk_rol_id) REFERENCES ROL(rol_id),
    Foreign Key (fk_emp_id) REFERENCES EMPLEADO(emp_id),
    Foreign Key (fk_cli_id) REFERENCES CLIENTE(cli_id),
    CONSTRAINT con_partial_empcli CHECK((fk_emp_id != NULL) OR (fk_cli_id != NULL))
)

#!SECTION
#SECTION - SUBASTA
CREATE TABLE IF NOT EXISTS PERMISO_ROL(
    fk_rol_id INT,
    fk_per_id INT,
    PRIMARY KEY (fk_rol_id, fk_per_id),
    Foreign Key (fk_rol_id) REFERENCES ROL(rol_id),
    Foreign Key (fk_per_id) REFERENCES PERMISO(per_id)
)

CREATE TABLE IF NOT EXISTS CONDICION_SUBASTA (
    consub_id SERIAL PRIMARY KEY,
    consub_nombre VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS SUBASTA (
    sub_id SERIAL PRIMARY KEY,
    sub_fechaini DATE NOT NULL,
    sub_fechafin DATE NOT NULL,
    sub_estado VARCHAR(100) NOT NULL,
    sub_montoini FLOAT NOT NULL,
    fk_pro_id INT NOT NULL,
    fk_consub_id INT NOT NULL,

    Foreign Key (fk_pro_id) REFERENCES PRODUCTO(pro_id),
    Foreign Key (fk_consub_id) REFERENCES CONDICION_SUBASTA(consub_id)
)

CREATE TABLE IF NOT EXISTS PUJA_SUBASTA (
    pujsub_id SERIAL PRIMARY KEY,
    pujsub_monto FLOAT NOT NULL,
    pujsub_fechahor DATE NOT NULL,
    fk_usu_id INT NOT NULL,
    fk_sub_id INT NOT NULL,
    Foreign Key (fk_usu_id) REFERENCES USUARIO(usu_id),
    Foreign Key (fk_sub_id) REFERENCES SUBASTA(sub_id)
)

#!SECTION
#SECTION - COMPRA  
#NOTE - wtf is plazo pago???
CREATE TABLE IF NOT EXISTS ACUERDO_COMERCIAL (
    acucom_id SERIAL PRIMARY KEY,
    acucom_limitecredito INT NOT NULL,
    acucom_plazopago INT NOT NULL,
    acucom_descuentomayorista INT NOT NULL,
    fk_perjur_id INT NOT NULL,
    Foreign Key (fk_perjur_id) REFERENCES PERSONA_JURIDICA(fk_cli_id)
)

CREATE TABLE IF NOT EXISTS TRANSPORTISTA (
    tra_id SERIAL PRIMARY KEY,
    tra_empresa VARCHAR(100) NOT NULL
)

CREATE TABLE IF NOT EXISTS COMPRA(
    com_id SERIAL PRIMARY KEY,
    com_fechahor DATE NOT NULL,
    com_numfactura INT NOT NULL,
    com_subtotal FLOAT NOT NULL,
    com_total FLOAT NOT NULL,
    fk_tra_id INT NOT NULL,
    fk_acucom_id INT NOT NULL,
    fk_usu_id INT NOT NULL,
    fk_lug_id INT NOT NULL,

    Foreign Key (fk_tra_id) REFERENCES TRANSPORTISTA(tra_id),
    Foreign Key (fk_acucom_id) REFERENCES ACUERDO_COMERCIAL(acucom_id),
    Foreign Key (fk_usu_id) REFERENCES USUARIO(usu_id),
    Foreign Key (fk_lug_id) REFERENCES LUGAR(lug_id)
)

CREATE TABLE IF NOT EXISTS ESTATUS_COMPRA(
    estcom_id SERIAL PRIMARY KEY,
    estcom_nom VARCHAR(100) NOT NULL,
    estcom_fechahoracierre DATE NOT NULL
)

CREATE TABLE IF NOT EXISTS HISTORIO_ESTATUS (
    hisest_fechahora DATE NOT NULL,
    fk_estcom_id INT,
    fk_com_id INT,
    PRIMARY KEY(fk_estcom_id, fk_com_id),
    Foreign Key (fk_estcom_id) REFERENCES ESTATUS_COMPRA(estcom_id),
    Foreign Key (fk_com_id) REFERENCES COMPRA(com_id)
)

CREATE TABLE IF NOT EXISTS DESCUENTO(
    des_id SERIAL PRIMARY KEY,
    des_nombre VARCHAR(100) NOT NULL,
    des_porcentaje FLOAT NOT NULL,
    des_fechaven DATE
)

CREATE TABLE IF NOT EXISTS DESCUENTO_COMPRA(
    fk_des_id INT,
    fk_com_id INT,
    PRIMARY KEY(fk_des_id, fk_com_id),
    Foreign Key (fk_des_id) REFERENCES DESCUENTO(des_id),
    Foreign Key (fk_com_id) REFERENCES COMPRA(com_id)
)

CREATE TABLE IF NOT EXISTS HISTORICO_TASA_CAMBIO(
    histascam_id SERIAL PRIMARY KEY,
    histascam_monedaoriginal VARCHAR(100) NOT NULL,
    histascam_monedaconvertida VARCHAR(100) NOT NULL,
    histascam_fecha DATE NOT NULL
)

CREATE TABLE IF NOT EXISTS PAGO(
    pag_id INT,
    pag_monto FLOAT NOT NULL,
    pag_fecha DATE NOT NULL,
    fk_com_id INT,
    fk_metpag_id INT,
    PRIMARY KEY(pag_id,fk_com_id, fk_metpag_id),
    Foreign Key (fk_com_id) REFERENCES COMPRA(com_id),
    Foreign Key (fk_metpag_id) REFERENCES METODO_PAGO(metpag_id)
)

CREATE TABLE IF NOT EXISTS DETALLE_COMPRA(
    detcom_cantidad INT NOT NULL,
    fk_com_id INT,
    fk_pro_id INT,
    fk_alm_id INT,
    Foreign Key (fk_com_id) REFERENCES COMPRA(com_id),
    FOREIGN KEY (fk_pro_id, fk_alm_id) REFERENCES INVENTARIO(fk_pro_id, fk_alm_id)
)


CREATE TABLE IF NOT EXISTS MEMBRESIA(
    mem_id SERIAL PRIMARY KEY,
    mem_nombre VARCHAR(100) NOT NULL,
    mem_descuento FLOAT NOT NULL
)

CREATE TABLE IF NOT EXISTS HISTORICO_MEMBRESIA(
    hismem_fechaini DATE NOT NULL,
    hismem_fechafin DATE,
    fk_mem_id INT,
    fk_cli_id INT,
    PRIMARY KEY(fk_mem_id, fk_cli_id),
    Foreign Key (fk_mem_id) REFERENCES MEMBRESIA(mem_id),
    FOREIGN KEY (fk_cli_id) REFERENCES CLIENTE(cli_id)
)