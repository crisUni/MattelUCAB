-- =====================================================================
-- reports.sql  -  Consultas de los reportes (lógica en la BD).
-- Aplicar DESPUES de create.sql (las funciones consultan las tablas).
-- Orden sugerido: ... procedures.sql -> reports.sql -> insert.sql -> trigger.sql
-- =====================================================================

-- Reporte 1: costo total de las unidades INDIVIDUALES "sueltas" (el resto que
-- queda fuera de una Caja Máster de 12 u.) en cada Hub logístico.
-- Costo unitario = Σ (costo material × cantidad) del BOM del producto.
CREATE OR REPLACE FUNCTION reporte_unidades_sueltas()
RETURNS TABLE (hub VARCHAR, unidades_sueltas BIGINT, costo_total NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH costo_unit AS (
        SELECT p.pro_id, COALESCE(SUM(m.mat_costo * mp.matpro_cantidad), 0)::NUMERIC AS costo
        FROM PRODUCTO p
        LEFT JOIN MATERIAL_PRODUCTO mp ON mp.fk_jug_id = p.fk_jug_id
        LEFT JOIN MATERIAL m ON m.mat_id = mp.fk_mat_id
        GROUP BY p.pro_id
    ),
    sueltas AS (
        SELECT a.fk_hubreg_id, i.fk_pro_id, (i.inv_stockdisponible % 12) AS sueltas
        FROM INVENTARIO i
        JOIN ALMACEN a ON a.alm_id = i.fk_alm_id
    )
    SELECT h.hubreg_nombre,
           SUM(s.sueltas)::BIGINT,
           ROUND(SUM(s.sueltas * c.costo), 2)
    FROM sueltas s
    JOIN HUB_REGIONAL h ON h.hubreg_id = s.fk_hubreg_id
    JOIN costo_unit c ON c.pro_id = s.fk_pro_id
    GROUP BY h.hubreg_nombre
    ORDER BY 3 DESC;
END
$$;

-- Reporte 2: top 3 Face Sculpts (moldes) por inventario físico actual, con su
-- porcentaje del total y su costo. Resaltar los que superan el 40%.
CREATE OR REPLACE FUNCTION reporte_top_face_sculpts()
RETURNS TABLE (molde VARCHAR, patente VARCHAR, unidades BIGINT, porcentaje NUMERIC, costo_total NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    total BIGINT;
BEGIN
    SELECT COALESCE(SUM(inv_stockdisponible), 0) INTO total FROM INVENTARIO;
    IF total = 0 THEN total := 1; END IF;
    RETURN QUERY
    WITH costo_unit AS (
        SELECT p.pro_id, p.fk_jug_id, COALESCE(SUM(m.mat_costo * mp.matpro_cantidad), 0)::NUMERIC AS costo
        FROM PRODUCTO p
        LEFT JOIN MATERIAL_PRODUCTO mp ON mp.fk_jug_id = p.fk_jug_id
        LEFT JOIN MATERIAL m ON m.mat_id = mp.fk_mat_id
        GROUP BY p.pro_id, p.fk_jug_id
    ),
    inv_molde AS (
        SELECT j.fk_molros_id,
               SUM(i.inv_stockdisponible) AS unidades,
               SUM(i.inv_stockdisponible * c.costo) AS costo
        FROM INVENTARIO i
        JOIN PRODUCTO p ON p.pro_id = i.fk_pro_id
        JOIN JUGUETE j ON j.jug_id = p.fk_jug_id
        JOIN costo_unit c ON c.pro_id = p.pro_id
        GROUP BY j.fk_molros_id
    )
    SELECT mr.molros_nombre, mr.molros_patente,
           im.unidades::BIGINT,
           ROUND(100.0 * im.unidades / total, 2),
           ROUND(im.costo, 2)
    FROM inv_molde im
    JOIN MOLDE_ROSTRO mr ON mr.molros_id = im.fk_molros_id
    ORDER BY im.unidades DESC
    LIMIT 3;
END
$$;

-- Reporte 3: subensamblaje (material) presente en la MAYOR cantidad de SKUs que
-- actualmente tienen inventario en cero (agotados).
CREATE OR REPLACE FUNCTION reporte_subensamblaje_agotado()
RETURNS TABLE (material VARCHAR, tipo VARCHAR, skus_agotados BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH stock AS (
        SELECT p.pro_id, p.fk_jug_id, COALESCE(SUM(i.inv_stockdisponible), 0) AS total
        FROM PRODUCTO p
        LEFT JOIN INVENTARIO i ON i.fk_pro_id = p.pro_id
        GROUP BY p.pro_id, p.fk_jug_id
    ),
    agotados AS (
        SELECT pro_id, fk_jug_id FROM stock WHERE total = 0
    )
    SELECT m.mat_nombre, m.mat_tipo, COUNT(DISTINCT a.pro_id)::BIGINT
    FROM agotados a
    JOIN MATERIAL_PRODUCTO mp ON mp.fk_jug_id = a.fk_jug_id
    JOIN MATERIAL m ON m.mat_id = mp.fk_mat_id
    GROUP BY m.mat_nombre, m.mat_tipo
    ORDER BY 3 DESC, m.mat_nombre;
END
$$;
