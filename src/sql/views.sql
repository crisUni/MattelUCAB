-- =====================================================================
-- vistas.sql  -  Vistas de uso general para la base Mattel / UCAB
-- Solo lectura. Ejecutar despues de create.sql (y de cargar los datos).
-- Resuelven claves foraneas a nombres, unifican supertipo/subtipo y
-- agregan los totales que la aplicacion y los reportes suelen necesitar.
-- =====================================================================


-- 1. CLIENTE unificado (natural + juridica en una sola fila)
CREATE OR REPLACE VIEW vista_cliente_completo AS
SELECT
    c.cli_id,
    CASE
        WHEN pn.fk_cli_id IS NOT NULL THEN 'NATURAL'
        WHEN pj.fk_cli_id IS NOT NULL THEN 'JURIDICA'
        ELSE 'SIN_TIPO'
    END AS tipo_cliente,
    COALESCE(pj.perjur_razonsocial, pn.pernat_pnombre || ' ' || pn.pernat_papellido) AS nombre_completo,
    COALESCE(pn.pernat_cedula, pj.perjur_rif) AS documento,
    c.cli_fecharegis,
    c.fk_lug_id
FROM CLIENTE c
LEFT JOIN PERSONA_NATURAL  pn ON pn.fk_cli_id = c.cli_id
LEFT JOIN PERSONA_JURIDICA pj ON pj.fk_cli_id = c.cli_id;


-- 2. METODO_PAGO con su tipo concreto (resuelve el subtipo)
CREATE OR REPLACE VIEW vista_metodo_pago AS
SELECT
    m.metpag_id,
    CASE
        WHEN e.fk_metpag_id  IS NOT NULL THEN 'EFECTIVO'
        WHEN t.fk_metpag_id  IS NOT NULL THEN 'TARJETA'
        WHEN ch.fk_metpag_id IS NOT NULL THEN 'CHEQUE'
        WHEN dp.fk_metpag_id IS NOT NULL THEN 'DEPOSITO'
        WHEN tr.fk_metpag_id IS NOT NULL THEN 'TRANSFERENCIA'
        WHEN cr.fk_metpag_id IS NOT NULL THEN 'CRIPTOMONEDA'
        WHEN bd.fk_metpag_id IS NOT NULL THEN 'BILLETERA'
        ELSE 'SIN_DETALLE'
    END AS tipo
FROM METODO_PAGO m
LEFT JOIN EFECTIVO          e  ON e.fk_metpag_id  = m.metpag_id
LEFT JOIN TARJETA           t  ON t.fk_metpag_id  = m.metpag_id
LEFT JOIN CHEQUE            ch ON ch.fk_metpag_id = m.metpag_id
LEFT JOIN DEPOSITO_BANCARIO dp ON dp.fk_metpag_id = m.metpag_id
LEFT JOIN TRANSFERENCIA     tr ON tr.fk_metpag_id = m.metpag_id
LEFT JOIN CRIPTOMONEDA      cr ON cr.fk_metpag_id = m.metpag_id
LEFT JOIN BILLETERA_DIGITAL bd ON bd.fk_metpag_id = m.metpag_id;


-- 3. PRODUCTO con categoria, edicion, exclusividad y datos del juguete
CREATE OR REPLACE VIEW vista_producto_detalle AS
SELECT
    p.pro_id,
    p.pro_sku,
    p.pro_nombre,
    p.pro_preciobase,
    p.pro_tipo,
    p.pro_lanzamientofecha,
    cat.catpro_descripcion AS categoria,
    edi.edi_nombre         AS edicion,
    exc.exc_nombre         AS exclusividad,
    j.jug_adn,
    tc.tipcue_nombre       AS tipo_cuerpo,
    per.per_nombre         AS personaje
FROM PRODUCTO p
JOIN CATEGORIA_PRODUCTO cat ON cat.catpro_id = p.fk_catpro_id
JOIN EDICION            edi ON edi.edi_id    = p.fk_edi_id
JOIN EXCLUSIVIDAD       exc ON exc.exc_id    = p.fk_exc_id
JOIN JUGUETE            j   ON j.jug_id      = p.fk_jug_id
LEFT JOIN TIPO_CUERPO   tc  ON tc.tipcue_id  = j.fk_tipcue_id
LEFT JOIN MOLDE_ROSTRO  mr  ON mr.molros_id  = j.fk_molros_id
LEFT JOIN PERSONAJE     per ON per.per_id    = mr.fk_per_id;


-- 4. INVENTARIO con nombres de producto, almacen, hub y lugar
CREATE OR REPLACE VIEW vista_inventario_almacen AS
SELECT
    inv.fk_pro_id,
    p.pro_nombre,
    inv.fk_alm_id,
    a.alm_tipoinstalacion,
    h.hubreg_nombre,
    l.lug_nombre AS ubicacion_almacen,
    inv.inv_stockdisponible,
    inv.inv_cantidad,
    inv.inv_fecha_actualizacion
FROM INVENTARIO inv
JOIN PRODUCTO     p ON p.pro_id     = inv.fk_pro_id
JOIN ALMACEN      a ON a.alm_id     = inv.fk_alm_id
JOIN HUB_REGIONAL h ON h.hubreg_id  = a.fk_hubreg_id
LEFT JOIN LUGAR   l ON l.lug_id     = a.fk_lug_id;


-- 5. Alerta de stock bajo (umbral 100; ajustar a gusto)
CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT *
FROM vista_inventario_almacen
WHERE inv_stockdisponible < 100;


-- 6. EMPLEADO con su departamento y cargo vigentes (fecha_fin NULL)
CREATE OR REPLACE VIEW vista_empleado_actual AS
SELECT
    e.emp_id,
    e.emp_pnombre || ' ' || e.emp_papellido AS nombre_completo,
    d.dep_nombre   AS departamento,
    car.car_nombre AS cargo,
    car.car_sueldobase
FROM EMPLEADO e
LEFT JOIN DEP_EMP de  ON de.fk_emp_id = e.emp_id AND de.depemp_fechafin IS NULL
LEFT JOIN DEPARTAMENTO d ON d.dep_id  = de.fk_dep_id
LEFT JOIN CAR_EMP ce  ON ce.fk_emp_id = e.emp_id AND ce.caremp_fechafin IS NULL
LEFT JOIN CARGO car   ON car.car_id   = ce.fk_car_id;


-- 7. COMPRA con comprador y transportista
CREATE OR REPLACE VIEW vista_compra_resumen AS
SELECT
    co.com_id,
    co.com_fechahor,
    co.com_numfactura,
    vc.nombre_completo AS cliente,
    vc.tipo_cliente,
    tr.tra_empresa     AS transportista,
    co.com_subtotal,
    co.com_total
FROM COMPRA co
JOIN USUARIO u             ON u.usu_id  = co.fk_usu_id
LEFT JOIN vista_cliente_completo vc ON vc.cli_id = u.fk_cli_id
JOIN TRANSPORTISTA tr      ON tr.tra_id = co.fk_tra_id;


-- 8. Lineas de cada compra con producto y subtotal de linea
CREATE OR REPLACE VIEW vista_detalle_compra AS
SELECT
    d.fk_com_id,
    d.fk_pro_id,
    p.pro_nombre,
    d.fk_alm_id,
    d.detcom_cantidad,
    p.pro_preciobase                          AS precio_unitario,
    d.detcom_cantidad * p.pro_preciobase      AS subtotal_linea
FROM DETALLE_COMPRA d
JOIN PRODUCTO p ON p.pro_id = d.fk_pro_id;


-- 9. Ventas acumuladas por cliente
CREATE OR REPLACE VIEW vista_ventas_por_cliente AS
SELECT
    vc.cli_id,
    vc.nombre_completo,
    vc.tipo_cliente,
    COUNT(co.com_id)                AS num_compras,
    COALESCE(SUM(co.com_total), 0)  AS total_gastado
FROM vista_cliente_completo vc
LEFT JOIN USUARIO u ON u.fk_cli_id = vc.cli_id
LEFT JOIN COMPRA  co ON co.fk_usu_id = u.usu_id
GROUP BY vc.cli_id, vc.nombre_completo, vc.tipo_cliente;


-- 10. Unidades e ingresos por producto
CREATE OR REPLACE VIEW vista_ventas_por_producto AS
SELECT
    p.pro_id,
    p.pro_nombre,
    COALESCE(SUM(d.detcom_cantidad), 0)                      AS unidades_vendidas,
    COALESCE(SUM(d.detcom_cantidad * p.pro_preciobase), 0)   AS ingreso_total
FROM PRODUCTO p
LEFT JOIN DETALLE_COMPRA d ON d.fk_pro_id = p.pro_id
GROUP BY p.pro_id, p.pro_nombre;


-- 11. Resumen de cada subasta (numero de pujas, postores, puja mas alta)
CREATE OR REPLACE VIEW vista_subasta_resumen AS
SELECT
    s.sub_id,
    p.pro_nombre               AS producto,
    cs.consub_nombre           AS condicion,
    s.sub_estado,
    s.sub_montoini,
    s.sub_fechaini,
    s.sub_fechafin,
    COUNT(pu.pujsub_id)                  AS num_pujas,
    COUNT(DISTINCT pu.fk_usu_id)         AS num_postores,
    COALESCE(MAX(pu.pujsub_monto), s.sub_montoini) AS puja_actual
FROM SUBASTA s
JOIN PRODUCTO p          ON p.pro_id     = s.fk_pro_id
JOIN CONDICION_SUBASTA cs ON cs.consub_id = s.fk_consub_id
LEFT JOIN PUJA_SUBASTA pu ON pu.fk_sub_id = s.sub_id
GROUP BY s.sub_id, p.pro_nombre, cs.consub_nombre, s.sub_estado,
         s.sub_montoini, s.sub_fechaini, s.sub_fechafin;


-- 12. Puja lider (mas alta) por subasta, con el postor
CREATE OR REPLACE VIEW vista_puja_maxima AS
SELECT
    x.fk_sub_id,
    x.fk_usu_id,
    vc.nombre_completo AS postor,
    x.pujsub_monto,
    x.pujsub_fechahor
FROM (
    SELECT pu.*,
           ROW_NUMBER() OVER (PARTITION BY pu.fk_sub_id
                              ORDER BY pu.pujsub_monto DESC, pu.pujsub_fechahor ASC) AS rn
    FROM PUJA_SUBASTA pu
) x
JOIN USUARIO u ON u.usu_id = x.fk_usu_id
LEFT JOIN vista_cliente_completo vc ON vc.cli_id = u.fk_cli_id
WHERE x.rn = 1;


-- 13. Pagos con su metodo y la compra asociada
CREATE OR REPLACE VIEW vista_pago_detalle AS
SELECT
    pg.pag_id,
    pg.fk_com_id,
    pg.pag_monto,
    pg.pag_fecha,
    vm.tipo AS metodo_pago
FROM PAGO pg
JOIN vista_metodo_pago vm ON vm.metpag_id = pg.fk_metpag_id;


-- 14. Resumen de inspecciones por lote (con conteo de defectos)
CREATE OR REPLACE VIEW vista_inspeccion_resumen AS
SELECT
    ic.inscal_id,
    ic.inscal_fecha,
    ic.inscal_resultado,
    l.lotpro_id,
    l.lotpro_fechaini,
    COUNT(dl.fk_def_id)                          AS num_tipos_defecto,
    COALESCE(SUM(dl.deflot_cantidadafectada), 0) AS total_afectado
FROM INSPECCION_CALIDAD ic
LEFT JOIN LOTE_PRODUCCION l ON l.lotpro_id = ic.fk_lotpro_id
LEFT JOIN DEFECTO_LOTE   dl ON dl.fk_lotpro_id = l.lotpro_id
GROUP BY ic.inscal_id, ic.inscal_fecha, ic.inscal_resultado,
         l.lotpro_id, l.lotpro_fechaini;