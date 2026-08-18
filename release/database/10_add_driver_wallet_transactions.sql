-- Ejecutar una sola vez en instalaciones existentes.
-- Billetera (wallet) independiente por conductor: cada movimiento de saldo
-- (recarga, comisión, ganancia, bono, ajuste) queda registrado con el saldo
-- resultante, para que cada conductor tenga su propio historial en la BD.

CREATE TABLE IF NOT EXISTS `driver_wallet_transactions` (
  `id` VARCHAR(60) NOT NULL,
  `driver_id` VARCHAR(40) NOT NULL,
  `type` ENUM('recharge','commission_fee','trip_earning','bonus','adjustment') NOT NULL,
  `amount_usd` DECIMAL(10,2) NOT NULL COMMENT 'Positivo = abono, negativo = cargo',
  `amount_ves` DECIMAL(12,2) DEFAULT NULL,
  `bcv_rate_used` DECIMAL(10,4) DEFAULT NULL,
  `method` ENUM('pago_movil','zelle','zinli','binance','paypal','efectivo','system') DEFAULT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `ride_id` VARCHAR(64) DEFAULT NULL,
  `payment_id` VARCHAR(40) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('completed','pending','rejected') NOT NULL DEFAULT 'completed',
  `balance_after_usd` DECIMAL(10,2) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_driver` (`driver_id`, `created_at`),
  KEY `idx_wallet_ride` (`ride_id`),
  CONSTRAINT `fk_wallet_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
