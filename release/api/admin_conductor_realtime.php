<?php
/** Adaptador de lectura entre las tablas vixy_* y el panel administrativo. */
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, true);
$limit = isset($_GET['limit']) ? min(max((int) $_GET['limit'], 1), 200) : 100;
$tableExists = static function (PDO $conn, string $table): bool {
    $stmt = $conn->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?');
    $stmt->execute([$table]);
    return (int) $stmt->fetchColumn() > 0;
};
foreach (['vixy_drivers', 'vixy_trips', 'vixy_wallet_transactions', 'vixy_driver_locations', 'vixy_emergency_alerts', 'vixy_trip_events', 'vixy_sync_logs'] as $table) {
    if (!$tableExists($conn, $table)) {
        Response::success(['available' => false, 'drivers' => [], 'clients' => [], 'payments' => [], 'emergencies' => [], 'completedServices' => [], 'rides' => [], 'activity' => [], 'rideEvents' => []]);
    }
}
$query = static function (PDO $conn, string $sql, int $limit): array {
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
};
$drivers = $query($conn, "SELECT CONCAT('vixy-driver-', d.id) AS id, d.full_name AS name, COALESCE(d.email, '') AS email, d.phone, COALESCE((SELECT service_type FROM vixy_driver_vehicles v WHERE v.driver_id = d.id ORDER BY v.id LIMIT 1), 'taxi') AS category, CASE WHEN d.is_approved = 1 THEN 'activo' ELSE 'pendiente' END AS status, COALESCE((SELECT SUM(w.amount_usd) FROM vixy_wallet_transactions w WHERE w.driver_id = d.id AND w.status = 'completed'), 0) AS balance_usd, d.rating, d.total_trips AS completed_trips, d.last_lat AS lat, d.last_lng AS lng, d.city AS location_name, DATE(d.created_at) AS registered_at, d.last_seen_at AS last_active, d.is_active_online AS is_online, d.plate_number AS doc_plate_number, d.cedula AS doc_cedula_number FROM vixy_drivers d ORDER BY d.updated_at DESC LIMIT :limit", $limit);
$clients = $query($conn, "SELECT CONCAT('vixy-client-', id) AS id, passenger_uid AS name, '' AS email, COALESCE(phone, '') AS phone, 0 AS balance_usd, total_trips, rating, 0 AS is_blocked, NULL AS block_reason, DATE(created_at) AS registered_at, photo_url AS avatar_url FROM vixy_passengers ORDER BY updated_at DESC LIMIT :limit", $limit);
$payments = $query($conn, "SELECT CONCAT('vixy-wallet-', w.id) AS id, 'driver_commission' AS type, CONCAT('vixy-driver-', w.driver_id) AS entity_id, d.full_name AS entity_name, d.phone AS entity_phone, 'taxi' AS category, COALESCE(w.reference_number, '') AS reference_number, COALESCE(w.method, 'system') AS payment_method, COALESCE(w.amount_ves, 0) AS amount_ves, w.amount_usd, COALESCE(w.bcv_rate_used, 0) AS bcv_rate_used, '' AS receipt_image_url, CASE w.status WHEN 'completed' THEN 'verificado' ELSE w.status END AS status, NULL AS verified_by, CASE WHEN w.status = 'completed' THEN w.updated_at ELSE NULL END AS verified_at, w.description AS notes, w.created_at FROM vixy_wallet_transactions w INNER JOIN vixy_drivers d ON d.id = w.driver_id ORDER BY w.created_at DESC LIMIT :limit", $limit);
$emergencies = $query($conn, "SELECT CONCAT('vixy-emergency-', e.id) AS id, e.type, 'conductor' AS reporter_type, CONCAT('vixy-driver-', e.driver_id) AS reporter_id, d.full_name AS reporter_name, d.phone AS reporter_phone, 'taxi' AS category, d.plate_number AS plate_number, d.city AS location_name, e.lat, e.lng, CASE e.status WHEN 'pending' THEN 'pendiente' WHEN 'in_progress' THEN 'en_proceso' WHEN 'resolved' THEN 'resuelto' ELSE 'falsa_alarma' END AS status, e.notes, NULL AS resolved_by, e.created_at AS timestamp FROM vixy_emergency_alerts e INNER JOIN vixy_drivers d ON d.id = e.driver_id ORDER BY e.created_at DESC LIMIT :limit", $limit);
$rides = $query($conn, "SELECT r.*, CONCAT('vixy-driver-', r.driver_id) AS assigned_driver_id FROM vixy_trips r ORDER BY r.updated_at DESC LIMIT :limit", $limit);
$completedServices = $query($conn, "SELECT CONCAT('vixy-service-', r.id) AS id, DATE(r.completed_at) AS service_date, TIME(r.completed_at) AS service_time, CONCAT('vixy-driver-', r.driver_id) AS driver_id, d.full_name AS driver_name, 'taxi' AS driver_category, CONCAT('vixy-passenger-', r.passenger_id) AS client_id, COALESCE(r.passenger_name_snapshot, '') AS client_name, '' AS client_phone, r.pickup_address AS origin, r.dropoff_address AS destination, r.fare_usd, r.fare_ves, CASE WHEN r.fare_usd > 0 THEN ROUND(r.commission_fee_usd * 100 / r.fare_usd, 2) ELSE 0 END AS commission_percent, r.commission_fee_usd AS commission_usd, ROUND(r.commission_fee_usd * r.fare_ves / NULLIF(r.fare_usd, 0), 2) AS commission_ves, r.driver_net_earnings_usd AS driver_earnings_usd, 'Efectivo' AS payment_method, 'completado' AS status FROM vixy_trips r INNER JOIN vixy_drivers d ON d.id = r.driver_id WHERE r.status = 'completed' ORDER BY r.completed_at DESC LIMIT :limit", $limit);
$activity = $query($conn, "SELECT CONCAT('vixy-sync-', id) AS id, 'Conductor' AS driver_name, action, endpoint AS module, details, NULL AS ip_address, created_at FROM vixy_sync_logs ORDER BY created_at DESC LIMIT :limit", $limit);
$rideEvents = $query($conn, 'SELECT * FROM vixy_trip_events ORDER BY created_at DESC LIMIT :limit', $limit);
Response::success(compact('drivers', 'clients', 'payments', 'emergencies', 'completedServices', 'rides', 'activity', 'rideEvents') + ['available' => true]);
