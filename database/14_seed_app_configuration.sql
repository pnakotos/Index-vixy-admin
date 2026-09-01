-- =====================================================================
-- Vixy - Datos de configuración para mostrar en las aplicaciones
-- Generado automáticamente. Ejecutar DESPUÉS de:
--   01_schema.sql, 12_add_extended_payment_and_config_tables.sql, 13_add_client_auth.sql
--
-- Contiene: tarifas por estado (taxi/mototaxi/delivery), tarifas universitarias
-- por estado, y las filas únicas de configuración del sistema.
-- Usa INSERT ... ON DUPLICATE KEY UPDATE: es seguro ejecutarlo varias veces.
-- NO contiene conductores, clientes, viajes ni reseñas de ejemplo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Filas únicas de configuración (si aún no existen)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `system_config` (`id`, `admin_email`) VALUES (1, '');
INSERT IGNORE INTO `branding_media` (`id`) VALUES (1);
INSERT IGNORE INTO `api_interconnection_config` (`id`, `production_mode`) VALUES (1, 1);
INSERT IGNORE INTO `contact_social_config` (`id`) VALUES (1);

-- ---------------------------------------------------------------------
-- Tarifas normales por estado y tipo de servicio
-- ---------------------------------------------------------------------
INSERT INTO `state_service_rates`
  (`state`, `service_type`, `base_fare_usd`, `base_distance_km`, `additional_km_rate_usd`)
VALUES
  ('Distrito Capital', 'taxi', 3.00, 3.00, 0.70),
  ('Distrito Capital', 'mototaxi', 1.80, 2.50, 0.45),
  ('Distrito Capital', 'delivery', 2.00, 2.00, 0.50),
  ('Anzoátegui', 'taxi', 2.50, 3.00, 0.60),
  ('Anzoátegui', 'mototaxi', 1.50, 2.50, 0.40),
  ('Anzoátegui', 'delivery', 1.80, 2.00, 0.45),
  ('Apure', 'taxi', 2.50, 3.00, 0.60),
  ('Apure', 'mototaxi', 1.50, 2.50, 0.40),
  ('Apure', 'delivery', 1.80, 2.00, 0.45),
  ('Aragua', 'taxi', 2.80, 3.00, 0.65),
  ('Aragua', 'mototaxi', 1.60, 2.50, 0.42),
  ('Aragua', 'delivery', 1.80, 2.00, 0.48),
  ('Barinas', 'taxi', 2.50, 3.00, 0.60),
  ('Barinas', 'mototaxi', 1.50, 2.50, 0.40),
  ('Barinas', 'delivery', 1.80, 2.00, 0.45),
  ('Bolívar', 'taxi', 3.20, 3.00, 0.75),
  ('Bolívar', 'mototaxi', 2.00, 2.50, 0.50),
  ('Bolívar', 'delivery', 2.20, 2.00, 0.55),
  ('Carabobo', 'taxi', 2.80, 3.00, 0.65),
  ('Carabobo', 'mototaxi', 1.60, 2.50, 0.42),
  ('Carabobo', 'delivery', 1.80, 2.00, 0.48),
  ('Cojedes', 'taxi', 2.50, 3.00, 0.60),
  ('Cojedes', 'mototaxi', 1.50, 2.50, 0.40),
  ('Cojedes', 'delivery', 1.80, 2.00, 0.45),
  ('Delta Amacuro', 'taxi', 2.50, 3.00, 0.60),
  ('Delta Amacuro', 'mototaxi', 1.50, 2.50, 0.40),
  ('Delta Amacuro', 'delivery', 1.80, 2.00, 0.45),
  ('Falcón', 'taxi', 2.50, 3.00, 0.60),
  ('Falcón', 'mototaxi', 1.50, 2.50, 0.40),
  ('Falcón', 'delivery', 1.80, 2.00, 0.45),
  ('Guárico', 'taxi', 2.50, 3.00, 0.60),
  ('Guárico', 'mototaxi', 1.50, 2.50, 0.40),
  ('Guárico', 'delivery', 1.80, 2.00, 0.45),
  ('Lara', 'taxi', 2.80, 3.00, 0.65),
  ('Lara', 'mototaxi', 1.60, 2.50, 0.42),
  ('Lara', 'delivery', 1.80, 2.00, 0.48),
  ('Mérida', 'taxi', 2.50, 3.00, 0.60),
  ('Mérida', 'mototaxi', 1.50, 2.50, 0.40),
  ('Mérida', 'delivery', 1.80, 2.00, 0.45),
  ('Miranda', 'taxi', 3.00, 3.00, 0.70),
  ('Miranda', 'mototaxi', 1.80, 2.50, 0.45),
  ('Miranda', 'delivery', 2.00, 2.00, 0.50),
  ('Monagas', 'taxi', 2.50, 3.00, 0.60),
  ('Monagas', 'mototaxi', 1.50, 2.50, 0.40),
  ('Monagas', 'delivery', 1.80, 2.00, 0.45),
  ('Nueva Esparta', 'taxi', 3.20, 3.00, 0.75),
  ('Nueva Esparta', 'mototaxi', 2.00, 2.50, 0.50),
  ('Nueva Esparta', 'delivery', 2.20, 2.00, 0.55),
  ('Portuguesa', 'taxi', 2.50, 3.00, 0.60),
  ('Portuguesa', 'mototaxi', 1.50, 2.50, 0.40),
  ('Portuguesa', 'delivery', 1.80, 2.00, 0.45),
  ('Sucre', 'taxi', 2.50, 3.00, 0.60),
  ('Sucre', 'mototaxi', 1.50, 2.50, 0.40),
  ('Sucre', 'delivery', 1.80, 2.00, 0.45),
  ('Táchira', 'taxi', 3.20, 3.00, 0.75),
  ('Táchira', 'mototaxi', 2.00, 2.50, 0.50),
  ('Táchira', 'delivery', 2.20, 2.00, 0.55),
  ('Trujillo', 'taxi', 2.50, 3.00, 0.60),
  ('Trujillo', 'mototaxi', 1.50, 2.50, 0.40),
  ('Trujillo', 'delivery', 1.80, 2.00, 0.45),
  ('La Guaira', 'taxi', 3.00, 3.00, 0.70),
  ('La Guaira', 'mototaxi', 1.80, 2.50, 0.45),
  ('La Guaira', 'delivery', 2.00, 2.00, 0.50),
  ('Yaracuy', 'taxi', 2.50, 3.00, 0.60),
  ('Yaracuy', 'mototaxi', 1.50, 2.50, 0.40),
  ('Yaracuy', 'delivery', 1.80, 2.00, 0.45),
  ('Zulia', 'taxi', 2.80, 3.00, 0.65),
  ('Zulia', 'mototaxi', 1.60, 2.50, 0.42),
  ('Zulia', 'delivery', 1.80, 2.00, 0.48),
  ('Amazonas', 'taxi', 2.50, 3.00, 0.60),
  ('Amazonas', 'mototaxi', 1.50, 2.50, 0.40),
  ('Amazonas', 'delivery', 1.80, 2.00, 0.45)
ON DUPLICATE KEY UPDATE
  `base_fare_usd` = VALUES(`base_fare_usd`),
  `base_distance_km` = VALUES(`base_distance_km`),
  `additional_km_rate_usd` = VALUES(`additional_km_rate_usd`);

-- ---------------------------------------------------------------------
-- Tarifas universitarias por estado (25% de descuento sobre la tarifa normal)
-- ---------------------------------------------------------------------
INSERT INTO `state_university_rates`
  (`state`, `enabled`, `notes`, `allowed_universities`, `require_student_verification`,
   `taxi_base_fare_usd`, `taxi_base_distance_km`, `taxi_additional_km_rate_usd`,
   `mototaxi_base_fare_usd`, `mototaxi_base_distance_km`, `mototaxi_additional_km_rate_usd`,
   `delivery_base_fare_usd`, `delivery_base_distance_km`, `delivery_additional_km_rate_usd`)
VALUES
  ('Distrito Capital', 1, 'Modalidad Tarifa Universitaria activa para Distrito Capital. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.25, 3.00, 0.52, 1.35, 2.50, 0.34, 1.50, 2.00, 0.38),
  ('Anzoátegui', 1, 'Modalidad Tarifa Universitaria activa para Anzoátegui. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Apure', 1, 'Modalidad Tarifa Universitaria activa para Apure. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Aragua', 1, 'Modalidad Tarifa Universitaria activa para Aragua. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.10, 3.00, 0.49, 1.20, 2.50, 0.32, 1.35, 2.00, 0.36),
  ('Barinas', 1, 'Modalidad Tarifa Universitaria activa para Barinas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Bolívar', 1, 'Modalidad Tarifa Universitaria activa para Bolívar. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.40, 3.00, 0.56, 1.50, 2.50, 0.38, 1.65, 2.00, 0.41),
  ('Carabobo', 1, 'Modalidad Tarifa Universitaria activa para Carabobo. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.10, 3.00, 0.49, 1.20, 2.50, 0.32, 1.35, 2.00, 0.36),
  ('Cojedes', 1, 'Modalidad Tarifa Universitaria activa para Cojedes. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Delta Amacuro', 1, 'Modalidad Tarifa Universitaria activa para Delta Amacuro. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Falcón', 1, 'Modalidad Tarifa Universitaria activa para Falcón. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Guárico', 1, 'Modalidad Tarifa Universitaria activa para Guárico. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Lara', 1, 'Modalidad Tarifa Universitaria activa para Lara. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.10, 3.00, 0.49, 1.20, 2.50, 0.32, 1.35, 2.00, 0.36),
  ('Mérida', 1, 'Modalidad Tarifa Universitaria activa para Mérida. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Miranda', 1, 'Modalidad Tarifa Universitaria activa para Miranda. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.25, 3.00, 0.52, 1.35, 2.50, 0.34, 1.50, 2.00, 0.38),
  ('Monagas', 1, 'Modalidad Tarifa Universitaria activa para Monagas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Nueva Esparta', 1, 'Modalidad Tarifa Universitaria activa para Nueva Esparta. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.40, 3.00, 0.56, 1.50, 2.50, 0.38, 1.65, 2.00, 0.41),
  ('Portuguesa', 1, 'Modalidad Tarifa Universitaria activa para Portuguesa. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Sucre', 1, 'Modalidad Tarifa Universitaria activa para Sucre. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Táchira', 1, 'Modalidad Tarifa Universitaria activa para Táchira. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.40, 3.00, 0.56, 1.50, 2.50, 0.38, 1.65, 2.00, 0.41),
  ('Trujillo', 1, 'Modalidad Tarifa Universitaria activa para Trujillo. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('La Guaira', 1, 'Modalidad Tarifa Universitaria activa para La Guaira. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.25, 3.00, 0.52, 1.35, 2.50, 0.34, 1.50, 2.00, 0.38),
  ('Yaracuy', 1, 'Modalidad Tarifa Universitaria activa para Yaracuy. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34),
  ('Zulia', 1, 'Modalidad Tarifa Universitaria activa para Zulia. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 2.10, 3.00, 0.49, 1.20, 2.50, 0.32, 1.35, 2.00, 0.36),
  ('Amazonas', 1, 'Modalidad Tarifa Universitaria activa para Amazonas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.', '["UCV","USB","UCAB","UNIMET","UC","LUZ","ULA","UDO","UNEFA","UBV"]', 1, 1.88, 3.00, 0.45, 1.13, 2.50, 0.30, 1.35, 2.00, 0.34)
ON DUPLICATE KEY UPDATE
  `enabled` = VALUES(`enabled`),
  `notes` = VALUES(`notes`),
  `allowed_universities` = VALUES(`allowed_universities`),
  `require_student_verification` = VALUES(`require_student_verification`),
  `taxi_base_fare_usd` = VALUES(`taxi_base_fare_usd`),
  `taxi_base_distance_km` = VALUES(`taxi_base_distance_km`),
  `taxi_additional_km_rate_usd` = VALUES(`taxi_additional_km_rate_usd`),
  `mototaxi_base_fare_usd` = VALUES(`mototaxi_base_fare_usd`),
  `mototaxi_base_distance_km` = VALUES(`mototaxi_base_distance_km`),
  `mototaxi_additional_km_rate_usd` = VALUES(`mototaxi_additional_km_rate_usd`),
  `delivery_base_fare_usd` = VALUES(`delivery_base_fare_usd`),
  `delivery_base_distance_km` = VALUES(`delivery_base_distance_km`),
  `delivery_additional_km_rate_usd` = VALUES(`delivery_additional_km_rate_usd`);
