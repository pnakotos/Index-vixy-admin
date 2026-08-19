-- Ejecutar una sola vez en instalaciones existentes.
CREATE TABLE IF NOT EXISTS `driver_location_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id` VARCHAR(40) NOT NULL,
  `lat` DECIMAL(10,6) NOT NULL,
  `lng` DECIMAL(10,6) NOT NULL,
  `location_name` VARCHAR(200) DEFAULT NULL,
  `is_online` TINYINT(1) DEFAULT NULL,
  `ride_id` VARCHAR(64) DEFAULT NULL,
  `recorded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location_driver_time` (`driver_id`, `recorded_at`),
  KEY `idx_location_time` (`recorded_at`),
  CONSTRAINT `fk_location_history_driver`
    FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_location_history_ride`
    FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;