-- Ejecutar una sola vez en instalaciones existentes (después de
-- `08_add_driver_auth_and_activity_logs.sql`).
-- Permite que un conductor ofrezca varios servicios a la vez (moto/taxi/
-- delivery) en lugar de una sola categoría fija. `drivers.category` se
-- conserva como categoría principal/heredada; el despacho de viajes
-- (`rides.php`) ahora usa `driver_services` para elegir conductores.

CREATE TABLE IF NOT EXISTS `driver_services` (
  `driver_id` VARCHAR(40) NOT NULL,
  `service_type` ENUM('taxi','mototaxi','delivery') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`, `service_type`),
  CONSTRAINT `fk_driver_services_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migra los conductores existentes: su categoría actual pasa a ser su único servicio.
INSERT IGNORE INTO `driver_services` (`driver_id`, `service_type`)
SELECT `id`, `category` FROM `drivers`;
