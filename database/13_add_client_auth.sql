-- Ejecutar una sola vez en instalaciones existentes (después de `12_add_extended_payment_and_config_tables.sql`).
-- Agrega autenticación propia para la app pasajero (Vixy Pasajero), con el
-- mismo patrón usado para conductores en `08_add_driver_auth_and_activity_logs.sql`:
-- login/registro propio con token de sesión, sin depender del panel admin.

ALTER TABLE `clients`
  ADD COLUMN `username` VARCHAR(80) DEFAULT NULL AFTER `name`,
  ADD COLUMN `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app pasajero' AFTER `avatar_url`,
  ADD COLUMN `auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token de sesión activo de la app pasajero' AFTER `password_hash`,
  ADD COLUMN `device_token` VARCHAR(255) DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del pasajero' AFTER `auth_token`,
  ADD COLUMN `cedula` VARCHAR(20) DEFAULT NULL AFTER `device_token`,
  ADD COLUMN `emergency_contact` VARCHAR(150) DEFAULT NULL AFTER `cedula`,
  ADD COLUMN `emergency_phone` VARCHAR(30) DEFAULT NULL AFTER `emergency_contact`,
  ADD COLUMN `last_login_at` DATETIME DEFAULT NULL AFTER `emergency_phone`;

-- Rellena `username` para clientes existentes con el prefijo del correo, para que la
-- columna pueda volverse única sin romper filas ya insertadas.
UPDATE `clients`
SET `username` = LOWER(SUBSTRING_INDEX(`email`, '@', 1))
WHERE `username` IS NULL OR `username` = '';

ALTER TABLE `clients`
  MODIFY COLUMN `username` VARCHAR(80) NOT NULL,
  ADD UNIQUE KEY `uq_clients_username` (`username`),
  ADD UNIQUE KEY `uq_clients_auth_token` (`auth_token`);
