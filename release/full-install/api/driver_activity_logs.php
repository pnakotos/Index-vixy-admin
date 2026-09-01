<?php
/**
 * Bitácora de actividad de la app conductor (solo lectura desde el panel admin).
 */
require_once __DIR__ . '/includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('La bitácora de actividad del conductor no permite modificaciones', 405);
}

$id = $_GET['id'] ?? null;
if ($id) {
    $stmt = $conn->prepare('SELECT * FROM driver_activity_logs WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    $row ? Response::success($row) : Response::error('Registro no encontrado', 404);
}

$limit = isset($_GET['limit']) ? min((int) $_GET['limit'], 200) : 100;
$offset = isset($_GET['offset']) ? max((int) $_GET['offset'], 0) : 0;
$driverId = $_GET['driver_id'] ?? null;

if ($driverId) {
    $stmt = $conn->prepare(
        'SELECT * FROM driver_activity_logs WHERE driver_id = ? ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
    );
    $stmt->bindValue(1, $driverId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
} else {
    $stmt = $conn->prepare(
        'SELECT * FROM driver_activity_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
    );
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
}

Response::success($stmt->fetchAll());
