-- Ejecutar una sola vez en instalaciones existentes.
-- Agrega autenticación propia para la app conductor (login/registro/token de
-- sesión/token push) y la bitácora de actividad del conductor, para que cada
-- acción de la app (login, online/offline, viajes, emergencias) quede
-- registrada en la base de datos en lugar de depender de almacenamiento local.

ALTER TABLE `drivers`
  ADD COLUMN `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app conductor' AFTER `doc_vehicle_color`,
  ADD COLUMN `auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token de sesión activo de la app conductor' AFTER `password_hash`,
  ADD COLUMN `device_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del conductor' AFTER `auth_token`,
  ADD COLUMN `last_login_at` DATETIME DEFAULT NULL AFTER `device_token`;

ALTER TABLE `drivers`
  ADD UNIQUE KEY `uq_drivers_username` (`username`),
  ADD UNIQUE KEY `uq_drivers_auth_token` (`auth_token`);

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
