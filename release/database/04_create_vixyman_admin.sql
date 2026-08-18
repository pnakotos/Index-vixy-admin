-- Crear el primer superusuario desde phpMyAdmin.
-- Selecciona previamente la base creada en cPanel.
-- Login: vixyman@vhixy.site
-- Clave temporal: 123456 (debe cambiarse en el primer inicio).
-- Este script no duplica el usuario si el correo ya existe.

INSERT INTO `backend_users` (
  `id`, `name`, `username`, `email`, `role`, `is_active`, `password_hash`,
  `must_change_password`, `password_expiration_days`, `password_created_at`, `created_at`,
  `perm_dashboard`, `perm_drivers`, `perm_clients`, `perm_payments`, `perm_map`,
  `perm_emergencies`, `perm_finances_config`, `perm_earnings_audit`, `perm_notifications`,
  `perm_reviews`, `perm_user_management`, `perm_audit_logs`
)
SELECT
  'admin-vixyman', 'vixyman', 'vixyman', 'vixyman@vhixy.site', 'Super Admin', 1,
  '$2y$12$jRII1CLhwFKZpT1f5BQru.19m.DNhWvOtGRCzQCE5A6RwT1EPQ1Iu',
  1, 90, CURDATE(), CURDATE(),
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
WHERE NOT EXISTS (
  SELECT 1 FROM `backend_users` WHERE `email` = 'vixyman@vhixy.site'
);
