-- Compatible con phpMyAdmin y hosting compartido. Motor InnoDB, charset utf8mb4.
-- Crea previamente la base desde cPanel/phpMyAdmin, selecciónala y luego importa este archivo.
-- =====================================================================

SET NAMES utf8mb4;
-- Crea la base de datos manualmente antes de importar este archivo.

-- ---------------------------------------------------------------------
-- Tabla: drivers (conductores: taxi, mototaxi, delivery)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` VARCHAR(40) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `category` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `status` ENUM('activo','bloqueado','pendiente','rechazado') NOT NULL DEFAULT 'pendiente',
  `balance_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `completed_trips` INT UNSIGNED NOT NULL DEFAULT 0,
  `lat` DECIMAL(10,6) NOT NULL DEFAULT 0,
  `lng` DECIMAL(10,6) NOT NULL DEFAULT 0,
  `location_name` VARCHAR(200) DEFAULT NULL,
  `registered_at` DATE NOT NULL,
  `last_active` VARCHAR(50) DEFAULT NULL,
  `is_online` TINYINT(1) NOT NULL DEFAULT 0,
  `rejection_reason` TEXT DEFAULT NULL,
  `block_reason` TEXT DEFAULT NULL,
  -- Documentos y datos del vehículo (relación 1:1, aplanada por simplicidad)
  `doc_cedula_url` VARCHAR(500) DEFAULT NULL,
  `doc_cedula_number` VARCHAR(50) DEFAULT NULL,
  `doc_licencia_url` VARCHAR(500) DEFAULT NULL,
  `doc_licencia_number` VARCHAR(50) DEFAULT NULL,
  `doc_certificado_medico_url` VARCHAR(500) DEFAULT NULL,
  `doc_rcv_url` VARCHAR(500) DEFAULT NULL,
  `doc_foto_vehiculo_url` VARCHAR(500) DEFAULT NULL,
  `doc_plate_number` VARCHAR(20) DEFAULT NULL,
  `doc_vehicle_model` VARCHAR(100) DEFAULT NULL,
  `doc_vehicle_year` VARCHAR(10) DEFAULT NULL,
  `doc_vehicle_color` VARCHAR(50) DEFAULT NULL,
  -- Autenticación propia de la app conductor (independiente del panel admin)
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app conductor',
  `auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token de sesión activo de la app conductor',
  `device_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del conductor',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_drivers_email` (`email`),
  UNIQUE KEY `uq_drivers_username` (`username`),
  UNIQUE KEY `uq_drivers_auth_token` (`auth_token`),
  KEY `idx_drivers_category` (`category`),
  KEY `idx_drivers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: clients (pasajeros)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(40) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `balance_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_trips` INT UNSIGNED NOT NULL DEFAULT 0,
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `is_blocked` TINYINT(1) NOT NULL DEFAULT 0,
  `block_reason` TEXT DEFAULT NULL,
  `registered_at` DATE NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: payments (pagos/recargas de conductores y clientes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(40) NOT NULL,
  `type` ENUM('driver_commission','client_payment') NOT NULL,
  `entity_id` VARCHAR(40) NOT NULL COMMENT 'ID de driver o client (polimórfico, sin FK estricta)',
  `entity_name` VARCHAR(150) NOT NULL,
  `entity_phone` VARCHAR(30) NOT NULL,
  `category` ENUM('taxi','mototaxi','delivery','cliente') DEFAULT NULL,
  `reference_number` VARCHAR(100) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `bank_origin` VARCHAR(100) DEFAULT NULL,
  `amount_ves` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `amount_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `bcv_rate_used` DECIMAL(10,4) NOT NULL DEFAULT 0.00,
  `receipt_image_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('pendiente','verificado','rechazado') NOT NULL DEFAULT 'pendiente',
  `verified_by` VARCHAR(150) DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payments_entity` (`entity_id`),
  KEY `idx_payments_type` (`type`),
  KEY `idx_payments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: emergency_alerts (alertas SOS/robo/accidente/mecánico)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `emergency_alerts` (
  `id` VARCHAR(40) NOT NULL,
  `type` ENUM('robo','accidente','sos','mecanico') NOT NULL,
  `reporter_type` ENUM('conductor','cliente') NOT NULL,
  `reporter_id` VARCHAR(40) NOT NULL,
  `reporter_name` VARCHAR(150) NOT NULL,
  `reporter_phone` VARCHAR(30) NOT NULL,
  `category` ENUM('taxi','mototaxi','delivery','cliente') DEFAULT NULL,
  `vehicle_info` VARCHAR(200) DEFAULT NULL,
  `plate_number` VARCHAR(20) DEFAULT NULL,
  `location_name` VARCHAR(200) DEFAULT NULL,
  `lat` DECIMAL(10,6) NOT NULL DEFAULT 0,
  `lng` DECIMAL(10,6) NOT NULL DEFAULT 0,
  `status` ENUM('pendiente','en_proceso','resuelto','falsa_alarma') NOT NULL DEFAULT 'pendiente',
  `notes` TEXT DEFAULT NULL,
  `resolved_by` VARCHAR(150) DEFAULT NULL,
  `timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_emergencies_reporter` (`reporter_id`),
  KEY `idx_emergencies_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: push_notifications (notificaciones enviadas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `push_notifications` (
  `id` VARCHAR(40) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `target_group` ENUM('todos','conductores','taxis','mototaxis','delivery','clientes','individual') NOT NULL,
  `recipient_id` VARCHAR(40) DEFAULT NULL,
  `recipient_name` VARCHAR(150) DEFAULT NULL,
  `sent_by` VARCHAR(150) NOT NULL,
  `sent_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: reviews (calificaciones de clientes a conductores)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(40) NOT NULL,
  `driver_id` VARCHAR(40) NOT NULL,
  `driver_name` VARCHAR(150) NOT NULL,
  `driver_category` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `client_id` VARCHAR(40) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL COMMENT '1 a 5',
  `comment` TEXT DEFAULT NULL,
  `is_flagged` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_driver` (`driver_id`),
  KEY `idx_reviews_client` (`client_id`),
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: audit_logs (bitácora de acciones administrativas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(40) NOT NULL,
  `admin_user` VARCHAR(150) NOT NULL,
  `admin_role` ENUM('Super Admin','Finanzas','Despacho y Soporte','Verificador') NOT NULL,
  `action` VARCHAR(200) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `timestamp` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_module` (`module`),
  KEY `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: completed_services (viajes/servicios finalizados, auditoría de ganancias)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `completed_services` (
  `id` VARCHAR(40) NOT NULL,
  `service_date` DATE NOT NULL,
  `service_time` TIME NOT NULL,
  `driver_id` VARCHAR(40) NOT NULL,
  `driver_name` VARCHAR(150) NOT NULL,
  `driver_category` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `client_id` VARCHAR(40) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `client_phone` VARCHAR(30) NOT NULL,
  `origin` VARCHAR(200) NOT NULL,
  `destination` VARCHAR(200) NOT NULL,
  `fare_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `fare_ves` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `commission_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `commission_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `commission_ves` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `driver_earnings_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('Efectivo','Pago Móvil','Zelle','Saldo Vixy') NOT NULL,
  `status` ENUM('completado') NOT NULL DEFAULT 'completado',
  PRIMARY KEY (`id`),
  KEY `idx_services_driver` (`driver_id`),
  KEY `idx_services_client` (`client_id`),
  KEY `idx_services_date` (`service_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: backend_users (usuarios del panel administrativo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `backend_users` (
  `id` VARCHAR(40) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `role` ENUM('Super Admin','Finanzas','Despacho y Soporte','Verificador') NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Hash (bcrypt/argon2) generado por la capa de aplicación, nunca texto plano',
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `password_expiration_days` TINYINT UNSIGNED DEFAULT NULL COMMENT '30 o 90',
  `password_created_at` DATE DEFAULT NULL,
  `created_at` DATE NOT NULL,
  `last_login` VARCHAR(50) DEFAULT NULL,
  -- Permisos por módulo (1:1 con el usuario)
  `perm_dashboard` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_drivers` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_clients` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_payments` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_map` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_emergencies` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_finances_config` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_earnings_audit` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_notifications` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_reviews` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_user_management` TINYINT(1) NOT NULL DEFAULT 0,
  `perm_audit_logs` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_backend_users_username` (`username`),
  UNIQUE KEY `uq_backend_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: system_config (configuración financiera y de tarifas, fila única)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `bcv_rate` DECIMAL(10,4) NOT NULL DEFAULT 0.00,
  `commission_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `negative_balance_threshold` DECIMAL(10,2) NOT NULL DEFAULT -0.50,
  `admin_email` VARCHAR(150) NOT NULL,
  `base_fare_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `base_distance_km` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  `additional_km_rate_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  -- Configuración de Pago Móvil
  `pago_movil_bank_name` VARCHAR(100) DEFAULT NULL,
  `pago_movil_bank_code` VARCHAR(10) DEFAULT NULL,
  `pago_movil_cif` VARCHAR(30) DEFAULT NULL,
  `pago_movil_phone` VARCHAR(30) DEFAULT NULL,
  `pago_movil_holder_name` VARCHAR(150) DEFAULT NULL,
  -- Pasarelas de pago habilitadas
  `gateway_pago_movil` TINYINT(1) NOT NULL DEFAULT 1,
  `gateway_zelle` TINYINT(1) NOT NULL DEFAULT 0,
  `gateway_binance_pay` TINYINT(1) NOT NULL DEFAULT 0,
  `gateway_efectivo` TINYINT(1) NOT NULL DEFAULT 1,
  `gateway_tarjeta` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_system_config_single_row` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: branding_media (imágenes/video de presentación, fila única)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branding_media` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `background_image_url` VARCHAR(500) DEFAULT NULL,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `video_title` VARCHAR(200) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_branding_media_single_row` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: api_interconnection_config (config. API/apps móviles, fila única)
-- Nota: los secretos (api keys, webhook secret, fcm key) deben resguardarse
-- fuera del control de versiones y con acceso restringido en producción.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `api_interconnection_config` (
  `id` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `backend_api_url` VARCHAR(300) DEFAULT NULL,
  `prod_api_key` VARCHAR(255) DEFAULT NULL,
  `google_maps_api_key` VARCHAR(255) DEFAULT NULL,
  `payment_webhook_secret` VARCHAR(255) DEFAULT NULL,
  `driver_app_sync_endpoint` VARCHAR(300) DEFAULT NULL,
  `passenger_app_sync_endpoint` VARCHAR(300) DEFAULT NULL,
  `fcm_server_key` VARCHAR(255) DEFAULT NULL,
  `production_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_api_config_single_row` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rides` (
  `id` VARCHAR(64) NOT NULL,
  `passenger_user_id` VARCHAR(64) NOT NULL,
  `client_id` VARCHAR(40) DEFAULT NULL,
  `category` ENUM('moto','auto','delivery') NOT NULL,
  `pickup_address` VARCHAR(255) NOT NULL,
  `dropoff_address` VARCHAR(255) NOT NULL,
  `pickup_lat` DECIMAL(10,7) NOT NULL,
  `pickup_lng` DECIMAL(10,7) NOT NULL,
  `dropoff_lat` DECIMAL(10,7) NOT NULL,
  `dropoff_lng` DECIMAL(10,7) NOT NULL,
  `distance_km` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `duration_mins` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `price_usd` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `price_ves` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(40) NOT NULL,
  `payment_reference` VARCHAR(120) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('idle','selecting_destination','searching','driver_assigned','driver_arriving','in_trip','completed','cancelled') NOT NULL DEFAULT 'searching',
  `assigned_driver_id` VARCHAR(40) DEFAULT NULL,
  `assigned_at` DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `cancelled_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rides_passenger` (`passenger_user_id`),
  KEY `idx_rides_status` (`status`),
  KEY `idx_rides_driver_status` (`assigned_driver_id`, `status`),
  CONSTRAINT `fk_rides_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rides_driver` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ride_dispatch_attempts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ride_id` VARCHAR(64) NOT NULL,
  `driver_id` VARCHAR(40) NOT NULL,
  `distance_km` DECIMAL(8,3) NOT NULL,
  `status` ENUM('offered','accepted','rejected','expired','cancelled') NOT NULL DEFAULT 'offered',
  `rejection_reason` VARCHAR(255) DEFAULT NULL,
  `offered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ride_driver_attempt` (`ride_id`, `driver_id`),
  KEY `idx_dispatch_driver` (`driver_id`, `status`),
  KEY `idx_dispatch_ride` (`ride_id`, `status`),
  CONSTRAINT `fk_dispatch_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dispatch_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ride_status_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ride_id` VARCHAR(64) NOT NULL,
  `status` VARCHAR(40) NOT NULL,
  `actor_type` ENUM('passenger','driver','admin','system') NOT NULL,
  `actor_id` VARCHAR(64) DEFAULT NULL,
  `details` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ride_history` (`ride_id`, `created_at`),
  CONSTRAINT `fk_ride_history_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `driver_notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` VARCHAR(40) NOT NULL,
  `ride_id` VARCHAR(64) NOT NULL,
  `type` ENUM('ride_offer','ride_update') NOT NULL DEFAULT 'ride_offer',
  `payload` JSON NOT NULL,
  `read_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver_notifications` (`driver_id`, `read_at`, `created_at`),
  CONSTRAINT `fk_driver_notifications_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_driver_notifications_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: driver_services (servicios que ofrece cada conductor: puede tener varios)
-- `drivers.category` se conserva como categoría principal/heredada para
-- compatibilidad, pero el despacho de viajes usa esta tabla.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `driver_services` (
  `driver_id` VARCHAR(40) NOT NULL,
  `service_type` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`, `service_type`),
  CONSTRAINT `fk_driver_services_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: driver_wallet_transactions (billetera independiente por conductor)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `driver_wallet_transactions` (
  `id` VARCHAR(60) NOT NULL,
  `driver_id` VARCHAR(40) NOT NULL,
  `type` ENUM('recharge','commission_fee','trip_earning','bonus','adjustment') NOT NULL,
  `amount_usd` DECIMAL(10,2) NOT NULL COMMENT 'Positivo = abono, negativo = cargo',
  `amount_ves` DECIMAL(12,2) DEFAULT NULL,
  `bcv_rate_used` DECIMAL(10,4) DEFAULT NULL,
  `method` ENUM('pago_movil','zelle','zinli','binance','paypal','efectivo','system') DEFAULT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `ride_id` VARCHAR(64) DEFAULT NULL,
  `payment_id` VARCHAR(40) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('completed','pending','rejected') NOT NULL DEFAULT 'completed',
  `balance_after_usd` DECIMAL(10,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_driver` (`driver_id`, `created_at`),
  KEY `idx_wallet_ride` (`ride_id`),
  CONSTRAINT `fk_wallet_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Tabla: driver_activity_logs (bitácora de cada acción del conductor en la app)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `driver_activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` VARCHAR(40) NOT NULL,
  `driver_name` VARCHAR(150) NOT NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'login, logout, online, offline, ride_accepted, ride_rejected, ride_status, emergency, register, etc.',
  `module` VARCHAR(100) NOT NULL DEFAULT 'App Conductor',
  `ride_id` VARCHAR(64) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `lat` DECIMAL(10,6) DEFAULT NULL,
  `lng` DECIMAL(10,6) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver_activity_driver` (`driver_id`, `created_at`),
  KEY `idx_driver_activity_action` (`action`),
  CONSTRAINT `fk_driver_activity_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `system_config` (`id`, `admin_email`)
VALUES (1, '');

INSERT IGNORE INTO `branding_media` (`id`)
VALUES (1);

INSERT IGNORE INTO `api_interconnection_config` (`id`, `production_mode`)
VALUES (1, 1);

SET FOREIGN_KEY_CHECKS = 1;
