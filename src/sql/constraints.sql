-- =====================================================================
-- constraints.sql  -  Reglas de negocio declarativas (CHECK / UNIQUE)
-- Se aplican con ALTER TABLE para no tocar create.sql.
-- Ejecutar despues de create.sql. Compatible con los datos de insert.sql.
-- =====================================================================

-- PRODUCTO
ALTER TABLE PRODUCTO ADD CONSTRAINT chk_pro_precio_pos CHECK (pro_preciobase > 0);
ALTER TABLE PRODUCTO ADD CONSTRAINT chk_pro_sku_pos CHECK (pro_sku > 0);

-- CARGO
ALTER TABLE CARGO ADD CONSTRAINT chk_car_sueldo_pos CHECK (car_sueldobase > 0);

-- MATERIAL
ALTER TABLE MATERIAL ADD CONSTRAINT chk_mat_costo_pos CHECK (mat_costo > 0);

-- EXCLUSIVIDAD
ALTER TABLE EXCLUSIVIDAD ADD CONSTRAINT chk_exc_limite_pos CHECK (exc_limiteproducto > 0);

-- INVENTARIO
ALTER TABLE INVENTARIO ADD CONSTRAINT chk_inv_stock_nonneg CHECK (inv_stockdisponible >= 0);
ALTER TABLE INVENTARIO ADD CONSTRAINT chk_inv_cant_nonneg CHECK (inv_cantidad >= 0);

-- DETALLE_COMPRA
ALTER TABLE DETALLE_COMPRA ADD CONSTRAINT chk_detcom_cant_pos CHECK (detcom_cantidad > 0);

-- MATERIAL_PRODUCTO
ALTER TABLE MATERIAL_PRODUCTO ADD CONSTRAINT chk_matpro_cant_pos CHECK (matpro_cantidad > 0);

-- DEFECTO_LOTE
ALTER TABLE DEFECTO_LOTE ADD CONSTRAINT chk_deflot_cant_pos CHECK (deflot_cantidadafectada > 0);

-- PUJA_SUBASTA
ALTER TABLE PUJA_SUBASTA ADD CONSTRAINT chk_puja_monto_pos CHECK (pujsub_monto > 0);

-- SUBASTA
ALTER TABLE SUBASTA ADD CONSTRAINT chk_sub_monto_nonneg CHECK (sub_montoini >= 0);

-- COMPRA
ALTER TABLE COMPRA ADD CONSTRAINT chk_com_subtotal_nonneg CHECK (com_subtotal >= 0);
ALTER TABLE COMPRA ADD CONSTRAINT chk_com_total_nonneg CHECK (com_total >= 0);
ALTER TABLE COMPRA ADD CONSTRAINT chk_com_total_ge_subtotal CHECK (com_total >= com_subtotal);

-- PAGO
ALTER TABLE PAGO ADD CONSTRAINT chk_pago_monto_pos CHECK (pag_monto > 0);

-- CHEQUE
ALTER TABLE CHEQUE ADD CONSTRAINT chk_che_monto_pos CHECK (che_monto > 0);

-- DEPOSITO_BANCARIO
ALTER TABLE DEPOSITO_BANCARIO ADD CONSTRAINT chk_depban_monto_pos CHECK (depban_monto > 0);

-- TRANSFERENCIA
ALTER TABLE TRANSFERENCIA ADD CONSTRAINT chk_tran_monto_pos CHECK (tran_monto > 0);

-- CRIPTOMONEDA
ALTER TABLE CRIPTOMONEDA ADD CONSTRAINT chk_cri_monto_pos CHECK (cri_monto > 0);

-- BILLETERA_DIGITAL
ALTER TABLE BILLETERA_DIGITAL ADD CONSTRAINT chk_bildig_monto_pos CHECK (bildig_monto > 0);

-- HISTORICO_TASA_CAMBIO
ALTER TABLE HISTORICO_TASA_CAMBIO ADD CONSTRAINT chk_htc_tasa_pos CHECK (histascam_tasa > 0);

-- ACUERDO_COMERCIAL
ALTER TABLE ACUERDO_COMERCIAL ADD CONSTRAINT chk_acu_credito_nonneg CHECK (acucom_limitecredito >= 0);
ALTER TABLE ACUERDO_COMERCIAL ADD CONSTRAINT chk_acu_plazo_pos CHECK (acucom_plazopago > 0);
ALTER TABLE ACUERDO_COMERCIAL ADD CONSTRAINT chk_acu_descmay_pct CHECK (acucom_descuentomayorista BETWEEN 0 AND 100);

-- DESCUENTO
ALTER TABLE DESCUENTO ADD CONSTRAINT chk_des_pct CHECK (des_porcentaje BETWEEN 0 AND 100);

-- MEMBRESIA
ALTER TABLE MEMBRESIA ADD CONSTRAINT chk_mem_desc_nonneg CHECK (mem_descuento >= 0);

-- TURNO
ALTER TABLE TURNO ADD CONSTRAINT chk_tur_horaini_rango CHECK (tur_horaini BETWEEN 0 AND 23);
ALTER TABLE TURNO ADD CONSTRAINT chk_tur_horafin_rango CHECK (tur_horafin BETWEEN 0 AND 23);
ALTER TABLE TURNO ADD CONSTRAINT chk_tur_horas_orden CHECK (tur_horafin > tur_horaini);

-- ERA_HISTORICO
ALTER TABLE ERA_HISTORICO ADD CONSTRAINT chk_era_fechas CHECK (erahis_fechafin >= erahis_fechaini);

-- LOTE_PRODUCCION
ALTER TABLE LOTE_PRODUCCION ADD CONSTRAINT chk_lote_fechas CHECK (lotpro_fechafin >= lotpro_fechaini);

-- SUBASTA
ALTER TABLE SUBASTA ADD CONSTRAINT chk_sub_fechas CHECK (sub_fechafin >= sub_fechaini);

-- DEP_EMP
ALTER TABLE DEP_EMP ADD CONSTRAINT chk_depemp_fechas CHECK (depemp_fechafin >= depemp_fechaini);

-- HISTORICO_MEMBRESIA
ALTER TABLE HISTORICO_MEMBRESIA ADD CONSTRAINT chk_hismem_fechas CHECK (hismem_fechafin >= hismem_fechaini);

-- VINCULO_PERSONAJE
ALTER TABLE VINCULO_PERSONAJE ADD CONSTRAINT chk_vinc_distinct CHECK (fk_personaje1 <> fk_personaje2);

-- COMPATIBILIDAD_JUGUETE
ALTER TABLE COMPATIBILIDAD_JUGUETE ADD CONSTRAINT chk_comp_distinct CHECK (fk_juguete1 <> fk_juguete2);

-- DETALLE_SET
ALTER TABLE DETALLE_SET ADD CONSTRAINT chk_detset_distinct CHECK (fk_pro1 <> fk_pro2);

-- LUGAR
ALTER TABLE LUGAR ADD CONSTRAINT chk_lugar_no_self CHECK (fk_lug_id <> lug_id);

-- SUBASTA
ALTER TABLE SUBASTA ADD CONSTRAINT chk_sub_estado CHECK (sub_estado IN ('ABIERTA','CERRADA','FINALIZADA'));

-- INSPECCION_CALIDAD
ALTER TABLE INSPECCION_CALIDAD ADD CONSTRAINT chk_inscal_resultado CHECK (inscal_resultado IN ('APROBADO','RECHAZADO'));

-- ALMACEN
ALTER TABLE ALMACEN ADD CONSTRAINT chk_alm_tipo CHECK (alm_tipoinstalacion IN ('CENTRAL','REGIONAL'));

-- PRODUCTO
ALTER TABLE PRODUCTO ADD CONSTRAINT chk_pro_tipo CHECK (pro_tipo IN ('INDIVIDUAL','SET'));

-- COLOR
ALTER TABLE COLOR ADD CONSTRAINT chk_col_codhex_fmt CHECK (col_codhex ~ '^[0-9A-Fa-f]{6}$');

-- PERSONA_NATURAL
ALTER TABLE PERSONA_NATURAL ADD CONSTRAINT chk_pernat_nac CHECK (pernat_fechanac >= DATE '1900-01-01');

-- USUARIO
ALTER TABLE USUARIO ADD CONSTRAINT chk_usu_un_tipo CHECK (NOT (fk_emp_id IS NOT NULL AND fk_cli_id IS NOT NULL));

-- PRODUCTO
ALTER TABLE PRODUCTO ADD CONSTRAINT uq_pro_sku UNIQUE (pro_sku);

-- USUARIO
ALTER TABLE USUARIO ADD CONSTRAINT uq_usu_nombre UNIQUE (usu_nombre);
ALTER TABLE USUARIO ADD CONSTRAINT uq_usu_correo UNIQUE (usu_correo);

-- PERSONA_NATURAL
ALTER TABLE PERSONA_NATURAL ADD CONSTRAINT uq_pernat_cedula UNIQUE (pernat_cedula);

-- PERSONA_JURIDICA
ALTER TABLE PERSONA_JURIDICA ADD CONSTRAINT uq_perjur_rif UNIQUE (perjur_rif);

-- MOLDE_ROSTRO
ALTER TABLE MOLDE_ROSTRO ADD CONSTRAINT uq_molros_patente UNIQUE (molros_patente);

-- DISENO
ALTER TABLE DISENO ADD CONSTRAINT uq_dis_patente UNIQUE (dis_patentecod);

-- TARJETA
ALTER TABLE TARJETA ADD CONSTRAINT uq_tar_numero UNIQUE (tar_numero);

-- COMPRA
ALTER TABLE COMPRA ADD CONSTRAINT uq_com_factura UNIQUE (com_numfactura);

-- COLOR
ALTER TABLE COLOR ADD CONSTRAINT uq_col_codhex UNIQUE (col_codhex);

-- DISENO -> EMPLEADO (diseñador). Se añade aquí porque DISENO se crea antes que EMPLEADO.
ALTER TABLE DISENO ADD CONSTRAINT fk_diseno_empleado FOREIGN KEY (fk_emp_id) REFERENCES EMPLEADO (emp_id);