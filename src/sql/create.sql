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
    car_sueldobase INT NOT NULL   
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
    
)
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS
