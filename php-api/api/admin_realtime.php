<?php
/** Estado operativo del panel: datos actuales y eventos recientes desde MySQL. */
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, true);

$limit = isset($_GET['limit']) ? min(max((int) $_GET['limit'], 1), 200) : 100;

$fetch = static function (PDO $conn, string $sql, int $limit): array {
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
};

$drivers = $fetch($conn, 'SELECT * FROM drivers ORDER BY updated_at DESC LIMIT :limit', $limit);
$clients = $fetch($conn, 'SELECT * FROM clients ORDER BY updated_at DESC LIMIT :limit', $limit);
$payments = $fetch($conn, 'SELECT * FROM payments ORDER BY created_at DESC LIMIT :limit', $limit);
$emergencies = $fetch($conn, 'SELECT * FROM emergency_alerts ORDER BY timestamp DESC LIMIT :limit', $limit);
$completedServices = $fetch($conn, 'SELECT * FROM completed_services ORDER BY service_date DESC, service_time DESC LIMIT :limit', $limit);
$rides = $fetch($conn, 'SELECT * FROM rides ORDER BY updated_at DESC LIMIT :limit', $limit);
$activity = $fetch($conn, 'SELECT * FROM driver_activity_logs ORDER BY created_at DESC LIMIT :limit', $limit);
$rideEvents = $fetch($conn, 'SELECT * FROM ride_status_history ORDER BY created_at DESC LIMIT :limit', $limit);

$statsStmt = $conn->query(
    "SELECT
        (SELECT COUNT(*) FROM drivers) AS drivers_total,
        (SELECT COUNT(*) FROM drivers WHERE is_online = 1 AND status = 'activo') AS drivers_online,
        (SELECT COUNT(*) FROM clients) AS clients_total,
        (SELECT COUNT(*) FROM rides WHERE status NOT IN ('completed', 'cancelled')) AS active_rides,
        (SELECT COUNT(*) FROM payments WHERE status = 'pendiente') AS pending_payments,
        (SELECT COUNT(*) FROM emergency_alerts WHERE status = 'pendiente') AS pending_emergencies,
        (SELECT COALESCE(SUM(amount_usd), 0) FROM payments WHERE status = 'verificado') AS verified_payments_usd,
        (SELECT COALESCE(SUM(commission_usd), 0) FROM completed_services) AS commissions_usd"
);

Response::success([
    'drivers' => $drivers,
    'clients' => $clients,
    'payments' => $payments,
    'emergencies' => $emergencies,
    'completedServices' => $completedServices,
    'rides' => $rides,
    'activity' => $activity,
    'rideEvents' => $rideEvents,
    'stats' => $statsStmt->fetch() ?: [],
    'serverTime' => date(DATE_ATOM),
]);