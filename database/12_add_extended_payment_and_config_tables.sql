-- Ejecutar una sola vez en instalaciones existentes (después de
-- `07_seed_single_row_config.sql`).
-- Agrega soporte de base de datos para los campos de configuración que
-- hasta ahora solo vivían en el navegador (localStorage): métodos de pago
-- adicionales (Zelle, Binance Pay, Transferencia, Efectivo, POS), métodos
-- de pago personalizados, contacto/redes sociales, y tarifas por estado
-- (normales y universitarias).

-- ---------------------------------------------------------------------
-- system_config: nuevas columnas de pasarelas de pago y switch universitario
-- ---------------------------------------------------------------------
ALTER TABLE `system_config`
  ADD COLUMN `university_national_enabled` TINYINT(1) NOT NULL DEFAULT 0 AFTER `additional_km_rate_usd`,
  ADD COLUMN `gateway_bank_transfer` TINYINT(1) NOT NULL DEFAULT 0 AFTER `gateway_tarjeta`,
  ADD COLUMN `zelle_email` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN `zelle_holder_name` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN `zelle_phone` VARCHAR(30) DEFAULT NULL,
  ADD COLUMN `zelle_memo_requirement` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `zelle_instructions` TEXT DEFAULT NULL,
  ADD COLUMN `binance_pay_id` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `binance_email` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN `binance_nickname` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `binance_supported_networks` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `binance_wallet_address` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `binance_qr_image_url` VARCHAR(500) DEFAULT NULL,
  ADD COLUMN `binance_instructions` TEXT DEFAULT NULL,
  ADD COLUMN `bank_transfer_bank_name` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `bank_transfer_bank_code` VARCHAR(10) DEFAULT NULL,
  ADD COLUMN `bank_transfer_account_number` VARCHAR(30) DEFAULT NULL,
  ADD COLUMN `bank_transfer_account_type` ENUM('corriente','ahorro') DEFAULT NULL,
  ADD COLUMN `bank_transfer_cif` VARCHAR(30) DEFAULT NULL,
  ADD COLUMN `bank_transfer_holder_name` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN `bank_transfer_instructions` TEXT DEFAULT NULL,
  ADD COLUMN `cash_payment_accepted_currencies` VARCHAR(255) DEFAULT NULL COMMENT 'Lista separada por comas, ej. USD,VES,EUR',
  ADD COLUMN `cash_payment_max_bill_denomination` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `cash_payment_instructions` TEXT DEFAULT NULL,
  ADD COLUMN `card_pos_processor_name` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `card_pos_terminal_id` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `card_pos_surcharge_percent` DECIMAL(5,2) DEFAULT NULL,
  ADD COLUMN `card_pos_instructions` TEXT DEFAULT NULL;

-- ---------------------------------------------------------------------
-- Tabla: contact_social_config (contacto y redes sociales, fila única)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_social_config` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `whatsapp_number` VARCHAR(30) DEFAULT NULL,
  `whatsapp_message` VARCHAR(255) DEFAULT NULL,
  `telegram_user_or_link` VARCHAR(150) DEFAULT NULL,
  `telegram_channel_or_group` VARCHAR(200) DEFAULT NULL,
  `support_email` VARCHAR(150) DEFAULT NULL,
  `corporate_email` VARCHAR(150) DEFAULT NULL,
  `tiktok_url_or_user` VARCHAR(150) DEFAULT NULL,
  `instagram_url_or_user` VARCHAR(150) DEFAULT NULL,
  `facebook_url_or_page` VARCHAR(255) DEFAULT NULL,
  `youtube_url` VARCHAR(255) DEFAULT NULL,
  `x_twitter_url` VARCHAR(150) DEFAULT NULL,
  `dispatch_phone` VARCHAR(50) DEFAULT NULL,
  `emergency_phone` VARCHAR(50) DEFAULT NULL,
  `driver_support_phone` VARCHAR(50) DEFAULT NULL,
  `office_address` VARCHAR(255) DEFAULT NULL,
  `support_hours` VARCHAR(100) DEFAULT NULL,
  `coverage_text` VARCHAR(100) DEFAULT NULL,
  `active_drivers_count` VARCHAR(30) DEFAULT NULL,
  `satisfied_trips_count` VARCHAR(30) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_contact_social_config_single_row` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `contact_social_config` (`id`) VALUES (1);

-- ---------------------------------------------------------------------
-- Tabla: custom_payment_methods (métodos de pago adicionales definidos por el admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `custom_payment_methods` (
  `id` VARCHAR(40) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `currency` ENUM('VES','USD','EUR','USDT','OTRA') NOT NULL DEFAULT 'USD',
  `identifier` VARCHAR(255) DEFAULT NULL,
  `holder_name` VARCHAR(150) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `instructions` TEXT DEFAULT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: state_service_rates (tarifas por estado de Venezuela y tipo de servicio)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `state_service_rates` (
  `state` VARCHAR(60) NOT NULL,
  `service_type` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `base_fare_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `base_distance_km` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `additional_km_rate_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state`, `service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: state_university_rates (tarifa universitaria especial por estado)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `state_university_rates` (
  `state` VARCHAR(60) NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `allowed_universities` TEXT DEFAULT NULL COMMENT 'Lista JSON de nombres de universidades, ej. ["UCV","USB"]',
  `require_student_verification` TINYINT(1) NOT NULL DEFAULT 0,
  `taxi_base_fare_usd` DECIMAL(10,2) DEFAULT NULL,
  `taxi_base_distance_km` DECIMAL(6,2) DEFAULT NULL,
  `taxi_additional_km_rate_usd` DECIMAL(10,2) DEFAULT NULL,
  `mototaxi_base_fare_usd` DECIMAL(10,2) DEFAULT NULL,
  `mototaxi_base_distance_km` DECIMAL(6,2) DEFAULT NULL,
  `mototaxi_additional_km_rate_usd` DECIMAL(10,2) DEFAULT NULL,
  `delivery_base_fare_usd` DECIMAL(10,2) DEFAULT NULL,
  `delivery_base_distance_km` DECIMAL(6,2) DEFAULT NULL,
  `delivery_additional_km_rate_usd` DECIMAL(10,2) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
