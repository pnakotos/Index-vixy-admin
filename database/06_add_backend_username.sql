-- Ejecutar una sola vez en instalaciones existentes antes de publicar la API nueva.
-- Agrega el identificador independiente del nombre completo para el login administrativo.

ALTER TABLE `backend_users`
  ADD COLUMN `username` VARCHAR(80) NULL AFTER `name`;

UPDATE `backend_users`
SET `username` = LOWER(SUBSTRING_INDEX(`email`, '@', 1))
WHERE `username` IS NULL OR `username` = '';

ALTER TABLE `backend_users`
  MODIFY COLUMN `username` VARCHAR(80) NOT NULL,
  ADD UNIQUE KEY `uq_backend_users_username` (`username`);