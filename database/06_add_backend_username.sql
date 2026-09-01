-- Ejecutar una sola vez en instalaciones EXISTENTES creadas antes de esta corrección.
-- Si tu base es nueva y usaste el `01_schema.sql` actual, la columna `username`
-- ya viene incluida en la tabla `backend_users` — NO ejecutes este script (fallaría
-- con "Duplicate column name 'username'").
-- Agrega el identificador independiente del nombre completo para el login administrativo.

ALTER TABLE `backend_users`
  ADD COLUMN `username` VARCHAR(80) NULL AFTER `name`;

-- Si dos usuarios comparten el mismo prefijo de correo (ej. carlos@gmail.com y
-- carlos@hotmail.com), se agrega un sufijo numérico para evitar choques de duplicados.
SET @rn := 0;
SET @prev := NULL;

UPDATE `backend_users` u
JOIN (
  SELECT id, base_username,
         @rn := IF(@prev IS NOT NULL AND @prev = base_username, @rn + 1, 0) AS rn,
         @prev := base_username
  FROM (
    SELECT id, LOWER(SUBSTRING_INDEX(email, '@', 1)) AS base_username
    FROM `backend_users`
    WHERE username IS NULL OR username = ''
    ORDER BY base_username, id
  ) ordered
) ranked ON ranked.id = u.id
SET u.username = IF(ranked.rn = 0, ranked.base_username, CONCAT(ranked.base_username, ranked.rn + 1))
WHERE u.username IS NULL OR u.username = '';

ALTER TABLE `backend_users`
  MODIFY COLUMN `username` VARCHAR(80) NOT NULL,
  ADD UNIQUE KEY `uq_backend_users_username` (`username`);