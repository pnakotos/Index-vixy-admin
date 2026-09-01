-- Ejecutar en instalaciones existentes. Si tu base es nueva y usaste el
-- `01_schema.sql` actual, la tabla `drivers` ya incluye estas columnas — este
-- script es seguro de ejecutar de todos modos (no falla si ya existen).
-- Agrega autenticación propia para la app conductor (login/registro/token de
-- sesión/token push) y la bitácora de actividad del conductor, para que cada
-- acción de la app (login, online/offline, viajes, emergencias) quede
-- registrada en la base de datos en lugar de depender de almacenamiento local.

DELIMITER $$

DROP PROCEDURE IF EXISTS `vixy_tmp_add_column_if_missing`$$
CREATE PROCEDURE `vixy_tmp_add_column_if_missing`(
  IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = p_table AND column_name = p_column
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN ', p_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS `vixy_tmp_add_unique_key_if_missing`$$
CREATE PROCEDURE `vixy_tmp_add_unique_key_if_missing`(
  IN p_table VARCHAR(64), IN p_key_name VARCHAR(64), IN p_columns VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = p_table AND index_name = p_key_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD UNIQUE KEY `', p_key_name, '` (', p_columns, ')');
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL vixy_tmp_add_column_if_missing('drivers', 'password_hash', "`password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app conductor' AFTER `doc_vehicle_color`");
CALL vixy_tmp_add_column_if_missing('drivers', 'auth_token', "`auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token de sesión activo de la app conductor' AFTER `password_hash`");
CALL vixy_tmp_add_column_if_missing('drivers', 'device_token', "`device_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del conductor' AFTER `auth_token`");
CALL vixy_tmp_add_column_if_missing('drivers', 'last_login_at', "`last_login_at` DATETIME DEFAULT NULL AFTER `device_token`");

CALL vixy_tmp_add_unique_key_if_missing('drivers', 'uq_drivers_username', '`username`');
CALL vixy_tmp_add_unique_key_if_missing('drivers', 'uq_drivers_auth_token', '`auth_token`');

DROP PROCEDURE IF EXISTS `vixy_tmp_add_column_if_missing`;
DROP PROCEDURE IF EXISTS `vixy_tmp_add_unique_key_if_missing`;

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
