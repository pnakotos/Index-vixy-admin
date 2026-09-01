-- Ejecutar en instalaciones existentes (después de `12_add_extended_payment_and_config_tables.sql`).
-- Agrega autenticación propia para la app pasajero (Vixy Pasajero), con el
-- mismo patrón usado para conductores en `08_add_driver_auth_and_activity_logs.sql`:
-- login/registro propio con token de sesión, sin depender del panel admin.
--
-- Este script es SEGURO de ejecutar varias veces (por ejemplo si una corrida
-- anterior falló a medias): cada columna e índice solo se agrega si todavía no existe.

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

CALL vixy_tmp_add_column_if_missing('clients', 'username', "`username` VARCHAR(80) DEFAULT NULL AFTER `name`");
CALL vixy_tmp_add_column_if_missing('clients', 'password_hash', "`password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app pasajero' AFTER `avatar_url`");
CALL vixy_tmp_add_column_if_missing('clients', 'auth_token', "`auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token de sesión activo de la app pasajero' AFTER `password_hash`");
CALL vixy_tmp_add_column_if_missing('clients', 'device_token', "`device_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del pasajero' AFTER `auth_token`");
CALL vixy_tmp_add_column_if_missing('clients', 'cedula', "`cedula` VARCHAR(20) DEFAULT NULL AFTER `device_token`");
CALL vixy_tmp_add_column_if_missing('clients', 'emergency_contact', "`emergency_contact` VARCHAR(150) DEFAULT NULL AFTER `cedula`");
CALL vixy_tmp_add_column_if_missing('clients', 'emergency_phone', "`emergency_phone` VARCHAR(30) DEFAULT NULL AFTER `emergency_contact`");
CALL vixy_tmp_add_column_if_missing('clients', 'last_login_at', "`last_login_at` DATETIME DEFAULT NULL AFTER `emergency_phone`");

-- Rellena `username` para clientes existentes con el prefijo del correo. Si dos
-- clientes comparten el mismo prefijo (ej. carlos@gmail.com y carlos@hotmail.com),
-- se les agrega un sufijo numérico (carlos, carlos2, carlos3...) para garantizar
-- que la columna pueda volverse única sin chocar con datos reales existentes.
SET @rn := 0;
SET @prev := NULL;

UPDATE `clients` c
JOIN (
  SELECT id, base_username,
         @rn := IF(@prev IS NOT NULL AND @prev = base_username, @rn + 1, 0) AS rn,
         @prev := base_username
  FROM (
    SELECT id, LOWER(SUBSTRING_INDEX(email, '@', 1)) AS base_username
    FROM `clients`
    WHERE username IS NULL OR username = ''
    ORDER BY base_username, id
  ) ordered
) ranked ON ranked.id = c.id
SET c.username = IF(ranked.rn = 0, ranked.base_username, CONCAT(ranked.base_username, ranked.rn + 1))
WHERE c.username IS NULL OR c.username = '';

ALTER TABLE `clients`
  MODIFY COLUMN `username` VARCHAR(80) NOT NULL;

CALL vixy_tmp_add_unique_key_if_missing('clients', 'uq_clients_username', '`username`');
CALL vixy_tmp_add_unique_key_if_missing('clients', 'uq_clients_auth_token', '`auth_token`');

DROP PROCEDURE IF EXISTS `vixy_tmp_add_column_if_missing`;
DROP PROCEDURE IF EXISTS `vixy_tmp_add_unique_key_if_missing`;
