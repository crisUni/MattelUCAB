-- =====================================================================
-- trigger.sql  -  Reglas de negocio procedurales (TRIGGERS)
-- Modulos cubiertos en esta entrega:
--    A) Diseno "Genoma Barbie"  (taxonomia, color, compatibilidad,
--       vinculos, era, profesiones, ediciones exclusivas)
--    B) Seguridad / Gestion de Usuarios y Roles
--
-- Solo se implementan aqui las reglas que NO pueden expresarse con un
-- CHECK / UNIQUE / FK declarativo (constraints.sql), es decir, reglas
-- que cruzan varias filas o varias tablas.
--
-- ORDEN DE EJECUCION (pgAdmin / psql):
--    drop.sql -> create.sql -> constraints.sql -> procedures.sql
--    -> insert.sql -> [ESTE ARCHIVO] -> views.sql
-- IMPORTANTE: aplicar DESPUES de insert.sql. Los triggers validan las
-- operaciones nuevas (CRUD de la aplicacion), no la carga inicial de
-- datos semilla. (Ademas insert.sql carga USUARIO antes que PERMISO_ROL,
-- por lo que el trigger trg_usuario_rol_con_permisos solo es coherente
-- una vez cargado todo insert.sql.)
--
-- NOTA DE DISENO (hermeticidad de roles): el enunciado pide segregar
-- roles internos (empleado) de externos (cliente). El ER define ROL solo
-- con nombre (sin "ambito"), y los datos semilla asignan clientes a todos
-- los roles. Por tanto la segregacion interno/externo por TIPO de rol se
-- resuelve en la capa de aplicacion (SessionContext), no por trigger.
-- Lo que SI se garantiza aqui es la integridad estructural del modulo de
-- seguridad (anti-bloqueo de administracion, inmutabilidad de identidad y
-- que todo rol asignado tenga permisos).
-- =====================================================================


-- #####################################################################
-- ##  MODULO A: DISENO "GENOMA BARBIE"
-- #####################################################################

-- ---------------------------------------------------------------------
-- A1. Unicidad del genoma (JUGUETE)
-- Objetivo #1 del enunciado: "identificar de manera unica a cada muneca
-- producida" por su taxonomia. No puede existir otro JUGUETE con la misma
-- combinacion de molde de rostro + tipo de cuerpo + era + diseno.
-- (Comparacion NULL-aware: dos atributos NULL se consideran iguales.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_juguete_genoma_unico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM JUGUETE j
        WHERE j.jug_id <> COALESCE(NEW.jug_id, -1)
          AND j.fk_molros_id IS NOT DISTINCT FROM NEW.fk_molros_id
          AND j.fk_tipcue_id IS NOT DISTINCT FROM NEW.fk_tipcue_id
          AND j.fk_erahis_id IS NOT DISTINCT FROM NEW.fk_erahis_id
          AND j.fk_dis_id    IS NOT DISTINCT FROM NEW.fk_dis_id
    ) THEN
        RAISE EXCEPTION 'Genoma duplicado: ya existe un JUGUETE con el mismo molde de rostro, tipo de cuerpo, era y diseno (el ADN debe ser unico).';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_juguete_genoma_unico ON JUGUETE;
CREATE TRIGGER trg_juguete_genoma_unico
    BEFORE INSERT OR UPDATE ON JUGUETE
    FOR EACH ROW EXECUTE FUNCTION fn_juguete_genoma_unico();


-- ---------------------------------------------------------------------
-- A2. Un solo color por zona de aplicacion (COLOR_PRODUCTO)
-- Objetivo #1: un juguete tiene UN tono de piel, UN color de ojos, etc.
-- La PK (fk_col_id, fk_jug_id) no impide que un mismo juguete reciba dos
-- colores distintos en la misma zona; este trigger lo prohibe.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_color_zona_unica()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM COLOR_PRODUCTO cp
        WHERE cp.fk_jug_id = NEW.fk_jug_id
          AND cp.colpro_zonaaplicacion = NEW.colpro_zonaaplicacion
          AND cp.fk_col_id <> NEW.fk_col_id
    ) THEN
        RAISE EXCEPTION 'El juguete % ya tiene un color asignado en la zona "%": cada zona admite un unico color.',
            NEW.fk_jug_id, NEW.colpro_zonaaplicacion;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_color_zona_unica ON COLOR_PRODUCTO;
CREATE TRIGGER trg_color_zona_unica
    BEFORE INSERT OR UPDATE ON COLOR_PRODUCTO
    FOR EACH ROW EXECUTE FUNCTION fn_color_zona_unica();


-- ---------------------------------------------------------------------
-- A3. Compatibilidad simetrica sin duplicado inverso (COMPATIBILIDAD_JUGUETE)
-- El ER define "Combina" como auto-relacion mutua entre juguetes. Si ya
-- existe (A,B), insertar (B,A) es un duplicado logico y queda prohibido.
-- (El CHECK chk_comp_distinct ya impide A=A.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_compat_simetrica()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM COMPATIBILIDAD_JUGUETE c
        WHERE c.fk_juguete1 = NEW.fk_juguete2
          AND c.fk_juguete2 = NEW.fk_juguete1
    ) THEN
        RAISE EXCEPTION 'La compatibilidad entre los juguetes % y % ya esta registrada (la relacion es simetrica).',
            NEW.fk_juguete1, NEW.fk_juguete2;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compat_simetrica ON COMPATIBILIDAD_JUGUETE;
CREATE TRIGGER trg_compat_simetrica
    BEFORE INSERT OR UPDATE ON COMPATIBILIDAD_JUGUETE
    FOR EACH ROW EXECUTE FUNCTION fn_compat_simetrica();


-- ---------------------------------------------------------------------
-- A4. Vinculo de personajes simetrico sin duplicado inverso (VINCULO_PERSONAJE)
-- "vinculo entre munecas (pareja, hermana, amiga, rival)" es mutuo: si
-- existe (A,B) no debe registrarse (B,A). (chk_vinc_distinct impide A=A.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_vinculo_simetrico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM VINCULO_PERSONAJE v
        WHERE v.fk_personaje1 = NEW.fk_personaje2
          AND v.fk_personaje2 = NEW.fk_personaje1
    ) THEN
        RAISE EXCEPTION 'El vinculo entre los personajes % y % ya esta registrado (la relacion es simetrica).',
            NEW.fk_personaje1, NEW.fk_personaje2;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vinculo_simetrico ON VINCULO_PERSONAJE;
CREATE TRIGGER trg_vinculo_simetrico
    BEFORE INSERT OR UPDATE ON VINCULO_PERSONAJE
    FOR EACH ROW EXECUTE FUNCTION fn_vinculo_simetrico();


-- ---------------------------------------------------------------------
-- A5. Coherencia temporal lanzamiento / era (PRODUCTO vs ERA_HISTORICO)
-- La era es la clasificacion historica del juguete. Un PRODUCTO no puede
-- lanzarse ANTES del inicio de la era de su juguete. (Solo cota inferior:
-- la produccion de una era puede continuar despues de su fecha fin.)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_producto_era_coherente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_fechaini DATE;
BEGIN
    SELECT e.erahis_fechaini
      INTO v_fechaini
      FROM JUGUETE j
      JOIN ERA_HISTORICO e ON e.erahis_id = j.fk_erahis_id
     WHERE j.jug_id = NEW.fk_jug_id;

    IF v_fechaini IS NOT NULL AND NEW.pro_lanzamientofecha < v_fechaini THEN
        RAISE EXCEPTION 'La fecha de lanzamiento (%) es anterior al inicio de la era historica del juguete (%).',
            NEW.pro_lanzamientofecha, v_fechaini;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_producto_era_coherente ON PRODUCTO;
CREATE TRIGGER trg_producto_era_coherente
    BEFORE INSERT OR UPDATE ON PRODUCTO
    FOR EACH ROW EXECUTE FUNCTION fn_producto_era_coherente();


-- ---------------------------------------------------------------------
-- A6. Cronologia del multiverso laboral (HISTORICO_PROFESION)
-- Objetivo #4: carrera cronologica de la muneca. El ano de asignacion
-- debe ser un ano valido de 4 digitos, no futuro, y no anterior al inicio
-- de la era del juguete del producto.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_historico_profesion_crono()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_ano       INT;
    v_eraini    INT;
BEGIN
    IF NEW.hispro_anoasignacion !~ '^[0-9]{4}$' THEN
        RAISE EXCEPTION 'El ano de asignacion "%" debe ser un ano de 4 digitos.', NEW.hispro_anoasignacion;
    END IF;

    v_ano := NEW.hispro_anoasignacion::INT;

    IF v_ano > EXTRACT(YEAR FROM CURRENT_DATE) THEN
        RAISE EXCEPTION 'El ano de asignacion (%) no puede ser un ano futuro.', v_ano;
    END IF;

    SELECT EXTRACT(YEAR FROM e.erahis_fechaini)::INT
      INTO v_eraini
      FROM PRODUCTO p
      JOIN JUGUETE j        ON j.jug_id     = p.fk_jug_id
      JOIN ERA_HISTORICO e  ON e.erahis_id  = j.fk_erahis_id
     WHERE p.pro_id = NEW.fk_pro_id;

    IF v_eraini IS NOT NULL AND v_ano < v_eraini THEN
        RAISE EXCEPTION 'La profesion no puede asignarse en el ano % (anterior al inicio de la era del juguete, %).',
            v_ano, v_eraini;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_historico_profesion_crono ON HISTORICO_PROFESION;
CREATE TRIGGER trg_historico_profesion_crono
    BEFORE INSERT OR UPDATE ON HISTORICO_PROFESION
    FOR EACH ROW EXECUTE FUNCTION fn_historico_profesion_crono();


-- ---------------------------------------------------------------------
-- A7. Limite de edicion exclusiva (PRODUCTO vs EXCLUSIVIDAD)
-- Objetivo #1: ediciones limitadas (Gold < 25.000, Platinum < 1.000).
-- El numero de productos (SKU) asignados a una exclusividad no puede
-- superar su exc_limiteproducto.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_exclusividad_limite()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_limite INT;
    v_actual INT;
BEGIN
    SELECT exc_limiteproducto
      INTO v_limite
      FROM EXCLUSIVIDAD
     WHERE exc_id = NEW.fk_exc_id;

    SELECT COUNT(*)
      INTO v_actual
      FROM PRODUCTO
     WHERE fk_exc_id = NEW.fk_exc_id
       AND pro_id <> COALESCE(NEW.pro_id, -1);

    IF v_limite IS NOT NULL AND v_actual + 1 > v_limite THEN
        RAISE EXCEPTION 'Se excede el limite de la edicion exclusiva: % productos para un maximo de % permitidos.',
            v_actual + 1, v_limite;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exclusividad_limite ON PRODUCTO;
CREATE TRIGGER trg_exclusividad_limite
    BEFORE INSERT OR UPDATE ON PRODUCTO
    FOR EACH ROW EXECUTE FUNCTION fn_exclusividad_limite();


-- #####################################################################
-- ##  MODULO B: SEGURIDAD / GESTION DE USUARIOS Y ROLES
-- #####################################################################

-- ---------------------------------------------------------------------
-- B1. Anti-bloqueo de la administracion (PERMISO_ROL)
-- Robustez del modulo de seguridad: el sistema siempre debe conservar al
-- menos un ROL con permiso de EDITAR el recurso ROL (capacidad de administrar
-- la seguridad). Se impide eliminar la ultima asignacion que lo otorga.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_antilockout_usuarios()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_recurso    VARCHAR(50);
    v_accion     VARCHAR(20);
    v_restantes  INT;
BEGIN
    SELECT perm_recurso, perm_accion
      INTO v_recurso, v_accion
      FROM PERMISO
     WHERE perm_id = OLD.fk_perm_id;

    IF v_recurso = 'ROL' AND v_accion = 'EDITAR' THEN
        SELECT COUNT(*)
          INTO v_restantes
          FROM PERMISO_ROL pr
          JOIN PERMISO p ON p.perm_id = pr.fk_perm_id
         WHERE p.perm_recurso = 'ROL' AND p.perm_accion = 'EDITAR'
           AND NOT (pr.fk_rol_id = OLD.fk_rol_id AND pr.fk_perm_id = OLD.fk_perm_id);

        IF v_restantes = 0 THEN
            RAISE EXCEPTION 'No se puede quitar el ultimo permiso EDITAR sobre ROL: el sistema quedaria sin forma de administrar la seguridad.';
        END IF;
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_antilockout_usuarios ON PERMISO_ROL;
CREATE TRIGGER trg_antilockout_usuarios
    BEFORE DELETE ON PERMISO_ROL
    FOR EACH ROW EXECUTE FUNCTION fn_antilockout_usuarios();


-- ---------------------------------------------------------------------
-- B2. Inmutabilidad de identidad del usuario (USUARIO)
-- Seguridad: un usuario no puede cambiar la persona a la que esta
-- vinculado ni migrar entre los dominios cliente (externo) y empleado
-- (interno) despues de creado. Esto evita la confusion/escalada de
-- privilegios al reutilizar una cuenta.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_usuario_identidad_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.fk_cli_id IS NOT NULL AND NEW.fk_cli_id IS DISTINCT FROM OLD.fk_cli_id THEN
        RAISE EXCEPTION 'No se puede cambiar el cliente asociado de un usuario ya creado (inmutabilidad de identidad).';
    END IF;

    IF OLD.fk_emp_id IS NOT NULL AND NEW.fk_emp_id IS DISTINCT FROM OLD.fk_emp_id THEN
        RAISE EXCEPTION 'No se puede cambiar el empleado asociado de un usuario ya creado (inmutabilidad de identidad).';
    END IF;

    IF (OLD.fk_cli_id IS NOT NULL AND NEW.fk_emp_id IS NOT NULL)
       OR (OLD.fk_emp_id IS NOT NULL AND NEW.fk_cli_id IS NOT NULL) THEN
        RAISE EXCEPTION 'No se puede convertir un usuario entre los dominios cliente y empleado.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuario_identidad_inmutable ON USUARIO;
CREATE TRIGGER trg_usuario_identidad_inmutable
    BEFORE UPDATE ON USUARIO
    FOR EACH ROW EXECUTE FUNCTION fn_usuario_identidad_inmutable();


-- ---------------------------------------------------------------------
-- B3. Todo rol asignado debe tener permisos (USUARIO)
-- No se puede asignar a un usuario un rol sin ningun permiso (rol vacio):
-- seria una cuenta sin privilegios definidos / posible error de config.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_usuario_rol_con_permisos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM PERMISO_ROL WHERE fk_rol_id = NEW.fk_rol_id
    ) THEN
        RAISE EXCEPTION 'El rol % no posee permisos asignados; no puede asignarse a un usuario.', NEW.fk_rol_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuario_rol_con_permisos ON USUARIO;
CREATE TRIGGER trg_usuario_rol_con_permisos
    BEFORE INSERT OR UPDATE ON USUARIO
    FOR EACH ROW EXECUTE FUNCTION fn_usuario_rol_con_permisos();
