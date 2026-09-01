-- =====================================================================
-- VIXY - BASE DE DATOS COMPLETA (ARCHIVO ÚNICO)
-- =====================================================================
-- Este archivo contiene TODO lo necesario para una instalación nueva:
--   * Estructura completa de las 24 tablas
--   * Autenticación de conductores (app Vixy Driver)
--   * Autenticación de pasajeros (app Vixy Pasajero)
--   * Billetera, rastreo GPS y servicios por conductor
--   * Métodos de pago extendidos, contacto/redes sociales
--   * Tarifas por estado y tarifas universitarias (24 estados, precargadas)
--
-- Equivale a ejecutar en orden: 01, 08, 09, 10, 11, 12, 13 y 14.
-- Si usas ESTE archivo, NO necesitas ejecutar ningún otro .sql.
--
-- NO contiene conductores, clientes, viajes, pagos ni reseñas de ejemplo.
--
-- CÓMO IMPORTAR:
--   1. En cPanel crea la base de datos y su usuario MySQL.
--   2. En phpMyAdmin selecciona la base y ve a "Importar".
--   3. Selecciona este archivo y pulsa "Continuar".
--   4. Después crea el primer administrador importando
--      `04_create_vixyman_admin.sql` (usuario vixyman / clave temporal 123456).
--
-- ADVERTENCIA: este archivo elimina y recrea las tablas (DROP TABLE).
-- Si ya tienes datos en producción, NO lo uses: aplica las migraciones
-- individuales (12, 13, 14) en su lugar.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `api_interconnection_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_interconnection_config` (
  `id` tinyint unsigned NOT NULL DEFAULT '1',
  `backend_api_url` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prod_api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_maps_api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_webhook_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_app_sync_endpoint` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passenger_app_sync_endpoint` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fcm_server_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `production_mode` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_api_config_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `api_interconnection_config` DISABLE KEYS */;
INSERT INTO `api_interconnection_config` (`id`, `backend_api_url`, `prod_api_key`, `google_maps_api_key`, `payment_webhook_secret`, `driver_app_sync_endpoint`, `passenger_app_sync_endpoint`, `fcm_server_key`, `production_mode`, `updated_at`) VALUES (1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-09-01 16:07:56');
/*!40000 ALTER TABLE `api_interconnection_config` ENABLE KEYS */;
DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_user` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_role` enum('Super Admin','Finanzas','Despacho y Soporte','Verificador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_module` (`module`),
  KEY `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
DROP TABLE IF EXISTS `backend_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backend_users` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Super Admin','Finanzas','Despacho y Soporte','Verificador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Hash (bcrypt/argon2) generado por la capa de aplicación, nunca texto plano',
  `must_change_password` tinyint(1) NOT NULL DEFAULT '1',
  `password_expiration_days` tinyint unsigned DEFAULT NULL COMMENT '30 o 90',
  `password_created_at` date DEFAULT NULL,
  `created_at` date NOT NULL,
  `last_login` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perm_dashboard` tinyint(1) NOT NULL DEFAULT '0',
  `perm_drivers` tinyint(1) NOT NULL DEFAULT '0',
  `perm_clients` tinyint(1) NOT NULL DEFAULT '0',
  `perm_payments` tinyint(1) NOT NULL DEFAULT '0',
  `perm_map` tinyint(1) NOT NULL DEFAULT '0',
  `perm_emergencies` tinyint(1) NOT NULL DEFAULT '0',
  `perm_finances_config` tinyint(1) NOT NULL DEFAULT '0',
  `perm_earnings_audit` tinyint(1) NOT NULL DEFAULT '0',
  `perm_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `perm_reviews` tinyint(1) NOT NULL DEFAULT '0',
  `perm_user_management` tinyint(1) NOT NULL DEFAULT '0',
  `perm_audit_logs` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_backend_users_username` (`username`),
  UNIQUE KEY `uq_backend_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `backend_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `backend_users` ENABLE KEYS */;
DROP TABLE IF EXISTS `branding_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branding_media` (
  `id` tinyint unsigned NOT NULL DEFAULT '1',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_branding_media_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `branding_media` DISABLE KEYS */;
INSERT INTO `branding_media` (`id`, `image_url`, `background_image_url`, `video_url`, `video_title`, `updated_at`) VALUES (1,NULL,NULL,NULL,NULL,'2026-09-01 16:07:56');
/*!40000 ALTER TABLE `branding_media` ENABLE KEYS */;
DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_trips` int unsigned NOT NULL DEFAULT '0',
  `rating` decimal(3,2) NOT NULL DEFAULT '5.00',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `block_reason` text COLLATE utf8mb4_unicode_ci,
  `registered_at` date NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app pasajero',
  `auth_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token de sesión activo de la app pasajero',
  `device_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del pasajero',
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clients_email` (`email`),
  UNIQUE KEY `uq_clients_username` (`username`),
  UNIQUE KEY `uq_clients_auth_token` (`auth_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
DROP TABLE IF EXISTS `completed_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `completed_services` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_date` date NOT NULL,
  `service_time` time NOT NULL,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_category` enum('taxi','mototaxi','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `origin` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fare_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fare_ves` decimal(12,2) NOT NULL DEFAULT '0.00',
  `commission_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `commission_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `commission_ves` decimal(12,2) NOT NULL DEFAULT '0.00',
  `driver_earnings_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('Efectivo','Pago Móvil','Zelle','Saldo Vixy') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('completado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completado',
  PRIMARY KEY (`id`),
  KEY `idx_services_driver` (`driver_id`),
  KEY `idx_services_client` (`client_id`),
  KEY `idx_services_date` (`service_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `completed_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `completed_services` ENABLE KEYS */;
DROP TABLE IF EXISTS `contact_social_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_social_config` (
  `id` tinyint unsigned NOT NULL DEFAULT '1',
  `whatsapp_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_message` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_user_or_link` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_channel_or_group` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `corporate_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiktok_url_or_user` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram_url_or_user` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook_url_or_page` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `x_twitter_url` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dispatch_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_support_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `office_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `support_hours` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coverage_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active_drivers_count` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `satisfied_trips_count` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_contact_social_config_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `contact_social_config` DISABLE KEYS */;
INSERT INTO `contact_social_config` (`id`, `whatsapp_number`, `whatsapp_message`, `telegram_user_or_link`, `telegram_channel_or_group`, `support_email`, `corporate_email`, `tiktok_url_or_user`, `instagram_url_or_user`, `facebook_url_or_page`, `youtube_url`, `x_twitter_url`, `dispatch_phone`, `emergency_phone`, `driver_support_phone`, `office_address`, `support_hours`, `coverage_text`, `active_drivers_count`, `satisfied_trips_count`, `updated_at`) VALUES (1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-01 16:07:57');
/*!40000 ALTER TABLE `contact_social_config` ENABLE KEYS */;
DROP TABLE IF EXISTS `custom_payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_payment_methods` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` enum('VES','USD','EUR','USDT','OTRA') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `holder_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `custom_payment_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_payment_methods` ENABLE KEYS */;
DROP TABLE IF EXISTS `driver_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'login, logout, online, offline, ride_accepted, ride_rejected, ride_status, emergency, register, etc.',
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'App Conductor',
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `lat` decimal(10,6) DEFAULT NULL,
  `lng` decimal(10,6) DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver_activity_driver` (`driver_id`,`created_at`),
  KEY `idx_driver_activity_action` (`action`),
  CONSTRAINT `fk_driver_activity_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `driver_activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_activity_logs` ENABLE KEYS */;
DROP TABLE IF EXISTS `driver_location_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_location_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` decimal(10,6) NOT NULL,
  `lng` decimal(10,6) NOT NULL,
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT NULL,
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location_driver_time` (`driver_id`,`recorded_at`),
  KEY `idx_location_time` (`recorded_at`),
  KEY `fk_location_history_ride` (`ride_id`),
  CONSTRAINT `fk_location_history_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_location_history_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `driver_location_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_location_history` ENABLE KEYS */;
DROP TABLE IF EXISTS `driver_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ride_offer','ride_update') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ride_offer',
  `payload` json NOT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_driver_notifications` (`driver_id`,`read_at`,`created_at`),
  KEY `fk_driver_notifications_ride` (`ride_id`),
  CONSTRAINT `fk_driver_notifications_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_driver_notifications_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `driver_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_notifications` ENABLE KEYS */;
DROP TABLE IF EXISTS `driver_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_services` (
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('taxi','mototaxi','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`,`service_type`),
  CONSTRAINT `fk_driver_services_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `driver_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_services` ENABLE KEYS */;
DROP TABLE IF EXISTS `driver_wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_wallet_transactions` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('recharge','commission_fee','trip_earning','bonus','adjustment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_usd` decimal(10,2) NOT NULL COMMENT 'Positivo = abono, negativo = cargo',
  `amount_ves` decimal(12,2) DEFAULT NULL,
  `bcv_rate_used` decimal(10,4) DEFAULT NULL,
  `method` enum('pago_movil','zelle','zinli','binance','paypal','efectivo','system') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('completed','pending','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `balance_after_usd` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wallet_driver` (`driver_id`,`created_at`),
  KEY `idx_wallet_ride` (`ride_id`),
  CONSTRAINT `fk_wallet_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `driver_wallet_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_wallet_transactions` ENABLE KEYS */;
DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('taxi','mototaxi','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('activo','bloqueado','pendiente','rechazado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `balance_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rating` decimal(3,2) NOT NULL DEFAULT '5.00',
  `completed_trips` int unsigned NOT NULL DEFAULT '0',
  `lat` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `lng` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registered_at` date NOT NULL,
  `last_active` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `block_reason` text COLLATE utf8mb4_unicode_ci,
  `doc_cedula_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_cedula_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_licencia_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_licencia_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_certificado_medico_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_rcv_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_foto_vehiculo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_plate_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_vehicle_model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_vehicle_year` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_vehicle_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash bcrypt/argon2 para login desde la app conductor',
  `auth_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token de sesión activo de la app conductor',
  `device_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token push (FCM) del dispositivo del conductor',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_drivers_email` (`email`),
  UNIQUE KEY `uq_drivers_username` (`username`),
  UNIQUE KEY `uq_drivers_auth_token` (`auth_token`),
  KEY `idx_drivers_category` (`category`),
  KEY `idx_drivers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
DROP TABLE IF EXISTS `emergency_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_alerts` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('robo','accidente','sos','mecanico') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_type` enum('conductor','cliente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('taxi','mototaxi','delivery','cliente') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plate_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lat` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `lng` decimal(10,6) NOT NULL DEFAULT '0.000000',
  `status` enum('pendiente','en_proceso','resuelto','falsa_alarma') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `resolved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_emergencies_reporter` (`reporter_id`),
  KEY `idx_emergencies_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `emergency_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `emergency_alerts` ENABLE KEYS */;
DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('driver_commission','client_payment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID de driver o client (polimórfico, sin FK estricta)',
  `entity_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('taxi','mototaxi','delivery','cliente') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_origin` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount_ves` decimal(12,2) NOT NULL DEFAULT '0.00',
  `amount_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `bcv_rate_used` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `receipt_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pendiente','verificado','rechazado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `verified_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payments_entity` (`entity_id`),
  KEY `idx_payments_type` (`type`),
  KEY `idx_payments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
DROP TABLE IF EXISTS `push_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_notifications` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_group` enum('todos','conductores','taxis','mototaxis','delivery','clientes','individual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_by` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `push_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_notifications` ENABLE KEYS */;
DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_category` enum('taxi','mototaxi','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint unsigned NOT NULL COMMENT '1 a 5',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_flagged` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_driver` (`driver_id`),
  KEY `idx_reviews_client` (`client_id`),
  CONSTRAINT `chk_reviews_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
DROP TABLE IF EXISTS `ride_dispatch_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_dispatch_attempts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance_km` decimal(8,3) NOT NULL,
  `status` enum('offered','accepted','rejected','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'offered',
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `offered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ride_driver_attempt` (`ride_id`,`driver_id`),
  KEY `idx_dispatch_driver` (`driver_id`,`status`),
  KEY `idx_dispatch_ride` (`ride_id`,`status`),
  CONSTRAINT `fk_dispatch_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dispatch_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `ride_dispatch_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `ride_dispatch_attempts` ENABLE KEYS */;
DROP TABLE IF EXISTS `ride_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_status_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ride_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_type` enum('passenger','driver','admin','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ride_history` (`ride_id`,`created_at`),
  CONSTRAINT `fk_ride_history_ride` FOREIGN KEY (`ride_id`) REFERENCES `rides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `ride_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `ride_status_history` ENABLE KEYS */;
DROP TABLE IF EXISTS `rides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rides` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passenger_user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('moto','auto','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropoff_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_lat` decimal(10,7) NOT NULL,
  `pickup_lng` decimal(10,7) NOT NULL,
  `dropoff_lat` decimal(10,7) NOT NULL,
  `dropoff_lng` decimal(10,7) NOT NULL,
  `distance_km` decimal(8,2) NOT NULL DEFAULT '0.00',
  `duration_mins` decimal(8,2) NOT NULL DEFAULT '0.00',
  `price_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `price_ves` decimal(12,2) NOT NULL DEFAULT '0.00',
  `payment_method` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('idle','selecting_destination','searching','driver_assigned','driver_arriving','in_trip','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'searching',
  `assigned_driver_id` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rides_passenger` (`passenger_user_id`),
  KEY `idx_rides_status` (`status`),
  KEY `idx_rides_driver_status` (`assigned_driver_id`,`status`),
  KEY `fk_rides_client` (`client_id`),
  CONSTRAINT `fk_rides_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rides_driver` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `rides` DISABLE KEYS */;
/*!40000 ALTER TABLE `rides` ENABLE KEYS */;
DROP TABLE IF EXISTS `state_service_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `state_service_rates` (
  `state` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type` enum('taxi','mototaxi','delivery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_fare_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `base_distance_km` decimal(6,2) NOT NULL DEFAULT '0.00',
  `additional_km_rate_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state`,`service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `state_service_rates` DISABLE KEYS */;
INSERT INTO `state_service_rates` (`state`, `service_type`, `base_fare_usd`, `base_distance_km`, `additional_km_rate_usd`, `updated_at`) VALUES ('Amazonas','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Amazonas','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Amazonas','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Anzoátegui','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Anzoátegui','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Anzoátegui','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Apure','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Apure','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Apure','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Aragua','taxi',2.80,3.00,0.65,'2026-09-01 16:07:58'),('Aragua','mototaxi',1.60,2.50,0.42,'2026-09-01 16:07:58'),('Aragua','delivery',1.80,2.00,0.48,'2026-09-01 16:07:58'),('Barinas','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Barinas','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Barinas','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Bolívar','taxi',3.20,3.00,0.75,'2026-09-01 16:07:58'),('Bolívar','mototaxi',2.00,2.50,0.50,'2026-09-01 16:07:58'),('Bolívar','delivery',2.20,2.00,0.55,'2026-09-01 16:07:58'),('Carabobo','taxi',2.80,3.00,0.65,'2026-09-01 16:07:58'),('Carabobo','mototaxi',1.60,2.50,0.42,'2026-09-01 16:07:58'),('Carabobo','delivery',1.80,2.00,0.48,'2026-09-01 16:07:58'),('Cojedes','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Cojedes','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Cojedes','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Delta Amacuro','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Delta Amacuro','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Delta Amacuro','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Distrito Capital','taxi',3.00,3.00,0.70,'2026-09-01 16:07:58'),('Distrito Capital','mototaxi',1.80,2.50,0.45,'2026-09-01 16:07:58'),('Distrito Capital','delivery',2.00,2.00,0.50,'2026-09-01 16:07:58'),('Falcón','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Falcón','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Falcón','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Guárico','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Guárico','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Guárico','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('La Guaira','taxi',3.00,3.00,0.70,'2026-09-01 16:07:58'),('La Guaira','mototaxi',1.80,2.50,0.45,'2026-09-01 16:07:58'),('La Guaira','delivery',2.00,2.00,0.50,'2026-09-01 16:07:58'),('Lara','taxi',2.80,3.00,0.65,'2026-09-01 16:07:58'),('Lara','mototaxi',1.60,2.50,0.42,'2026-09-01 16:07:58'),('Lara','delivery',1.80,2.00,0.48,'2026-09-01 16:07:58'),('Mérida','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Mérida','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Mérida','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Miranda','taxi',3.00,3.00,0.70,'2026-09-01 16:07:58'),('Miranda','mototaxi',1.80,2.50,0.45,'2026-09-01 16:07:58'),('Miranda','delivery',2.00,2.00,0.50,'2026-09-01 16:07:58'),('Monagas','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Monagas','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Monagas','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Nueva Esparta','taxi',3.20,3.00,0.75,'2026-09-01 16:07:58'),('Nueva Esparta','mototaxi',2.00,2.50,0.50,'2026-09-01 16:07:58'),('Nueva Esparta','delivery',2.20,2.00,0.55,'2026-09-01 16:07:58'),('Portuguesa','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Portuguesa','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Portuguesa','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Sucre','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Sucre','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Sucre','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Táchira','taxi',3.20,3.00,0.75,'2026-09-01 16:07:58'),('Táchira','mototaxi',2.00,2.50,0.50,'2026-09-01 16:07:58'),('Táchira','delivery',2.20,2.00,0.55,'2026-09-01 16:07:58'),('Trujillo','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Trujillo','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Trujillo','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Yaracuy','taxi',2.50,3.00,0.60,'2026-09-01 16:07:58'),('Yaracuy','mototaxi',1.50,2.50,0.40,'2026-09-01 16:07:58'),('Yaracuy','delivery',1.80,2.00,0.45,'2026-09-01 16:07:58'),('Zulia','taxi',2.80,3.00,0.65,'2026-09-01 16:07:58'),('Zulia','mototaxi',1.60,2.50,0.42,'2026-09-01 16:07:58'),('Zulia','delivery',1.80,2.00,0.48,'2026-09-01 16:07:58');
/*!40000 ALTER TABLE `state_service_rates` ENABLE KEYS */;
DROP TABLE IF EXISTS `state_university_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `state_university_rates` (
  `state` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `allowed_universities` text COLLATE utf8mb4_unicode_ci COMMENT 'Lista JSON de nombres de universidades, ej. ["UCV","USB"]',
  `require_student_verification` tinyint(1) NOT NULL DEFAULT '0',
  `taxi_base_fare_usd` decimal(10,2) DEFAULT NULL,
  `taxi_base_distance_km` decimal(6,2) DEFAULT NULL,
  `taxi_additional_km_rate_usd` decimal(10,2) DEFAULT NULL,
  `mototaxi_base_fare_usd` decimal(10,2) DEFAULT NULL,
  `mototaxi_base_distance_km` decimal(6,2) DEFAULT NULL,
  `mototaxi_additional_km_rate_usd` decimal(10,2) DEFAULT NULL,
  `delivery_base_fare_usd` decimal(10,2) DEFAULT NULL,
  `delivery_base_distance_km` decimal(6,2) DEFAULT NULL,
  `delivery_additional_km_rate_usd` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `state_university_rates` DISABLE KEYS */;
INSERT INTO `state_university_rates` (`state`, `enabled`, `notes`, `allowed_universities`, `require_student_verification`, `taxi_base_fare_usd`, `taxi_base_distance_km`, `taxi_additional_km_rate_usd`, `mototaxi_base_fare_usd`, `mototaxi_base_distance_km`, `mototaxi_additional_km_rate_usd`, `delivery_base_fare_usd`, `delivery_base_distance_km`, `delivery_additional_km_rate_usd`, `updated_at`) VALUES ('Amazonas',1,'Modalidad Tarifa Universitaria activa para Amazonas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Anzoátegui',1,'Modalidad Tarifa Universitaria activa para Anzoátegui. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Apure',1,'Modalidad Tarifa Universitaria activa para Apure. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Aragua',1,'Modalidad Tarifa Universitaria activa para Aragua. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.10,3.00,0.49,1.20,2.50,0.32,1.35,2.00,0.36,'2026-09-01 16:07:58'),('Barinas',1,'Modalidad Tarifa Universitaria activa para Barinas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Bolívar',1,'Modalidad Tarifa Universitaria activa para Bolívar. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.40,3.00,0.56,1.50,2.50,0.38,1.65,2.00,0.41,'2026-09-01 16:07:58'),('Carabobo',1,'Modalidad Tarifa Universitaria activa para Carabobo. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.10,3.00,0.49,1.20,2.50,0.32,1.35,2.00,0.36,'2026-09-01 16:07:58'),('Cojedes',1,'Modalidad Tarifa Universitaria activa para Cojedes. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Delta Amacuro',1,'Modalidad Tarifa Universitaria activa para Delta Amacuro. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Distrito Capital',1,'Modalidad Tarifa Universitaria activa para Distrito Capital. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.25,3.00,0.52,1.35,2.50,0.34,1.50,2.00,0.38,'2026-09-01 16:07:58'),('Falcón',1,'Modalidad Tarifa Universitaria activa para Falcón. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Guárico',1,'Modalidad Tarifa Universitaria activa para Guárico. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('La Guaira',1,'Modalidad Tarifa Universitaria activa para La Guaira. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.25,3.00,0.52,1.35,2.50,0.34,1.50,2.00,0.38,'2026-09-01 16:07:58'),('Lara',1,'Modalidad Tarifa Universitaria activa para Lara. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.10,3.00,0.49,1.20,2.50,0.32,1.35,2.00,0.36,'2026-09-01 16:07:58'),('Mérida',1,'Modalidad Tarifa Universitaria activa para Mérida. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Miranda',1,'Modalidad Tarifa Universitaria activa para Miranda. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.25,3.00,0.52,1.35,2.50,0.34,1.50,2.00,0.38,'2026-09-01 16:07:58'),('Monagas',1,'Modalidad Tarifa Universitaria activa para Monagas. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Nueva Esparta',1,'Modalidad Tarifa Universitaria activa para Nueva Esparta. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.40,3.00,0.56,1.50,2.50,0.38,1.65,2.00,0.41,'2026-09-01 16:07:58'),('Portuguesa',1,'Modalidad Tarifa Universitaria activa para Portuguesa. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Sucre',1,'Modalidad Tarifa Universitaria activa para Sucre. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Táchira',1,'Modalidad Tarifa Universitaria activa para Táchira. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.40,3.00,0.56,1.50,2.50,0.38,1.65,2.00,0.41,'2026-09-01 16:07:58'),('Trujillo',1,'Modalidad Tarifa Universitaria activa para Trujillo. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Yaracuy',1,'Modalidad Tarifa Universitaria activa para Yaracuy. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,1.88,3.00,0.45,1.13,2.50,0.30,1.35,2.00,0.34,'2026-09-01 16:07:58'),('Zulia',1,'Modalidad Tarifa Universitaria activa para Zulia. Aplica exclusivamente a viajes cuyo origen o destino sea un campus universitario o centro académico registrado.','[\"UCV\",\"USB\",\"UCAB\",\"UNIMET\",\"UC\",\"LUZ\",\"ULA\",\"UDO\",\"UNEFA\",\"UBV\"]',1,2.10,3.00,0.49,1.20,2.50,0.32,1.35,2.00,0.36,'2026-09-01 16:07:58');
/*!40000 ALTER TABLE `state_university_rates` ENABLE KEYS */;
DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` tinyint unsigned NOT NULL DEFAULT '1',
  `bcv_rate` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `commission_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `negative_balance_threshold` decimal(10,2) NOT NULL DEFAULT '-0.50',
  `admin_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_fare_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `base_distance_km` decimal(6,2) NOT NULL DEFAULT '0.00',
  `additional_km_rate_usd` decimal(10,2) NOT NULL DEFAULT '0.00',
  `university_national_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `pago_movil_bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pago_movil_bank_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pago_movil_cif` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pago_movil_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pago_movil_holder_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gateway_pago_movil` tinyint(1) NOT NULL DEFAULT '1',
  `gateway_zelle` tinyint(1) NOT NULL DEFAULT '0',
  `gateway_binance_pay` tinyint(1) NOT NULL DEFAULT '0',
  `gateway_efectivo` tinyint(1) NOT NULL DEFAULT '1',
  `gateway_tarjeta` tinyint(1) NOT NULL DEFAULT '0',
  `gateway_bank_transfer` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `zelle_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zelle_holder_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zelle_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zelle_memo_requirement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zelle_instructions` text COLLATE utf8mb4_unicode_ci,
  `binance_pay_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_supported_networks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_wallet_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_qr_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `binance_instructions` text COLLATE utf8mb4_unicode_ci,
  `bank_transfer_bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_bank_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_account_number` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_account_type` enum('corriente','ahorro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_cif` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_holder_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_transfer_instructions` text COLLATE utf8mb4_unicode_ci,
  `cash_payment_accepted_currencies` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lista separada por comas, ej. USD,VES,EUR',
  `cash_payment_max_bill_denomination` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cash_payment_instructions` text COLLATE utf8mb4_unicode_ci,
  `card_pos_processor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_pos_terminal_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_pos_surcharge_percent` decimal(5,2) DEFAULT NULL,
  `card_pos_instructions` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_system_config_single_row` CHECK ((`id` = 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` (`id`, `bcv_rate`, `commission_percent`, `negative_balance_threshold`, `admin_email`, `base_fare_usd`, `base_distance_km`, `additional_km_rate_usd`, `university_national_enabled`, `pago_movil_bank_name`, `pago_movil_bank_code`, `pago_movil_cif`, `pago_movil_phone`, `pago_movil_holder_name`, `gateway_pago_movil`, `gateway_zelle`, `gateway_binance_pay`, `gateway_efectivo`, `gateway_tarjeta`, `gateway_bank_transfer`, `updated_at`, `zelle_email`, `zelle_holder_name`, `zelle_phone`, `zelle_memo_requirement`, `zelle_instructions`, `binance_pay_id`, `binance_email`, `binance_nickname`, `binance_supported_networks`, `binance_wallet_address`, `binance_qr_image_url`, `binance_instructions`, `bank_transfer_bank_name`, `bank_transfer_bank_code`, `bank_transfer_account_number`, `bank_transfer_account_type`, `bank_transfer_cif`, `bank_transfer_holder_name`, `bank_transfer_instructions`, `cash_payment_accepted_currencies`, `cash_payment_max_bill_denomination`, `cash_payment_instructions`, `card_pos_processor_name`, `card_pos_terminal_id`, `card_pos_surcharge_percent`, `card_pos_instructions`) VALUES (1,0.0000,0.00,-0.50,'',0.00,0.00,0.00,0,NULL,NULL,NULL,NULL,NULL,1,0,0,1,0,0,'2026-09-01 16:07:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


SET FOREIGN_KEY_CHECKS = 1;
