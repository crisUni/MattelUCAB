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

-- Reporte 4: Rentabilidad por "ADN" (molde de rostro). Ranking de los moldes mas
-- rentables cruzando ventas (DETALLE_COMPRA) con el costo de produccion (BOM).
CREATE OR REPLACE FUNCTION reporte_rentabilidad_adn()
RETURNS TABLE (molde VARCHAR, patente VARCHAR, unidades_vendidas BIGINT, ingreso NUMERIC, costo NUMERIC, margen NUMERIC, margen_pct NUMERIC)
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
    ventas AS (
        SELECT dc.fk_pro_id, SUM(dc.detcom_cantidad) AS vendidas
        FROM DETALLE_COMPRA dc
        GROUP BY dc.fk_pro_id
    ),
    por_molde AS (
        SELECT j.fk_molros_id,
               SUM(v.vendidas) AS vendidas,
               SUM(v.vendidas * p.pro_preciobase)::NUMERIC AS ingreso,
               SUM(v.vendidas * c.costo)::NUMERIC AS costo
        FROM ventas v
        JOIN PRODUCTO p   ON p.pro_id = v.fk_pro_id
        JOIN JUGUETE j    ON j.jug_id = p.fk_jug_id
        JOIN costo_unit c ON c.pro_id = p.pro_id
        GROUP BY j.fk_molros_id
    )
    SELECT mr.molros_nombre, mr.molros_patente,
           pm.vendidas::BIGINT,
           ROUND(pm.ingreso, 2),
           ROUND(pm.costo, 2),
           ROUND(pm.ingreso - pm.costo, 2),
           ROUND(CASE WHEN pm.ingreso = 0 THEN 0 ELSE 100.0 * (pm.ingreso - pm.costo) / pm.ingreso END, 2)
    FROM por_molde pm
    JOIN MOLDE_ROSTRO mr ON mr.molros_id = pm.fk_molros_id
    ORDER BY (pm.ingreso - pm.costo) DESC
    LIMIT 10;
END
$$;

-- Reporte 5: Indice de Diversidad. Matriz de representacion: % producidas vs
-- vendidas por Tipo de cuerpo y por Tono de piel. Alerta si producidas < 5%.
CREATE OR REPLACE FUNCTION reporte_indice_diversidad()
RETURNS TABLE (dimension VARCHAR, categoria VARCHAR, producidas BIGINT, pct_producidas NUMERIC, vendidas BIGINT, pct_vendidas NUMERIC, alerta VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ps AS (
        SELECT p.pro_id, p.fk_jug_id,
               COALESCE((SELECT SUM(i.inv_cantidad) FROM INVENTARIO i WHERE i.fk_pro_id = p.pro_id), 0) AS producidas,
               COALESCE((SELECT SUM(dc.detcom_cantidad) FROM DETALLE_COMPRA dc WHERE dc.fk_pro_id = p.pro_id), 0) AS vendidas
        FROM PRODUCTO p
    ),
    tot AS (SELECT GREATEST(SUM(ps.producidas), 1) AS tp, GREATEST(SUM(ps.vendidas), 1) AS tv FROM ps)
    SELECT 'Tipo de cuerpo'::VARCHAR, tc.tipcue_nombre,
           SUM(ps.producidas)::BIGINT, ROUND(100.0 * SUM(ps.producidas) / (SELECT tp FROM tot), 2),
           SUM(ps.vendidas)::BIGINT, ROUND(100.0 * SUM(ps.vendidas) / (SELECT tv FROM tot), 2),
           (CASE WHEN 100.0 * SUM(ps.producidas) / (SELECT tp FROM tot) < 5 THEN 'Baja inclusion' ELSE 'OK' END)::VARCHAR
    FROM ps
    JOIN JUGUETE j     ON j.jug_id = ps.fk_jug_id
    JOIN TIPO_CUERPO tc ON tc.tipcue_id = j.fk_tipcue_id
    GROUP BY tc.tipcue_nombre
    UNION ALL
    SELECT 'Tono de piel'::VARCHAR, co.col_nombre,
           SUM(ps.producidas)::BIGINT, ROUND(100.0 * SUM(ps.producidas) / (SELECT tp FROM tot), 2),
           SUM(ps.vendidas)::BIGINT, ROUND(100.0 * SUM(ps.vendidas) / (SELECT tv FROM tot), 2),
           (CASE WHEN 100.0 * SUM(ps.producidas) / (SELECT tp FROM tot) < 5 THEN 'Baja inclusion' ELSE 'OK' END)::VARCHAR
    FROM ps
    JOIN COLOR_PRODUCTO cp ON cp.fk_jug_id = ps.fk_jug_id AND cp.colpro_zonaaplicacion = 'Piel'
    JOIN COLOR co ON co.col_id = cp.fk_col_id
    GROUP BY co.col_nombre
    ORDER BY 1, 4 DESC;
END
$$;
