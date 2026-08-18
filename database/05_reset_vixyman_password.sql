-- Restablece la clave temporal del superusuario vixyman.
-- Ejecutar en phpMyAdmin con la base correcta seleccionada.
-- Login: vixyman o vixyman@vhixy.site
-- Clave temporal: 123456

UPDATE `backend_users`
SET
  `name` = 'vixyman',
  `username` = 'vixyman',
  `email` = 'vixyman@vhixy.site',
  `role` = 'Super Admin',
  `is_active` = 1,
  `password_hash` = '$2y$12$jRII1CLhwFKZpT1f5BQru.19m.DNhWvOtGRCzQCE5A6RwT1EPQ1Iu',
  `must_change_password` = 1,
  `password_expiration_days` = 90,
  `password_created_at` = CURDATE()
WHERE `email` = 'vixyman@vhixy.site' OR `name` = 'vixyman';

SELECT `id`, `name`, `email`, `role`, `is_active`, `must_change_password`
FROM `backend_users`
WHERE `email` = 'vixyman@vhixy.site' OR `name` = 'vixyman';
