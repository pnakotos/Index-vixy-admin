-- Ejecutar una sola vez en instalaciones existentes.
-- Garantiza las filas únicas que reciben la configuración desde el panel.

INSERT IGNORE INTO `system_config` (`id`, `admin_email`)
VALUES (1, '');

INSERT IGNORE INTO `branding_media` (`id`)
VALUES (1);

INSERT IGNORE INTO `api_interconnection_config` (`id`, `production_mode`)
VALUES (1, 1);