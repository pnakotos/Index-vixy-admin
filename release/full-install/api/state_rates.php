<?php
/**
 * Tarifas normales por estado de Venezuela y tipo de servicio (taxi/mototaxi/delivery).
 * GET devuelve todas las filas. PUT/PATCH reemplaza (upsert) las filas enviadas.
 */
require_once __DIR__ . '/includes/bootstrap.php';

$allowedServiceTypes = ['taxi', 'mototaxi', 'delivery'];
$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `state_service_rates` ORDER BY `state`, `service_type`');
    Response::success($stmt->fetchAll());
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $rows = Response::getJsonBody();

    if (empty($rows)) {
        Response::error('No se enviaron tarifas para guardar', 422);
    }

    $stmt = $conn->prepare(
        'INSERT INTO `state_service_rates` (`state`, `service_type`, `base_fare_usd`, `base_distance_km`, `additional_km_rate_usd`)
         VALUES (:state, :service_type, :base_fare_usd, :base_distance_km, :additional_km_rate_usd)
         ON DUPLICATE KEY UPDATE
           `base_fare_usd` = VALUES(`base_fare_usd`),
           `base_distance_km` = VALUES(`base_distance_km`),
           `additional_km_rate_usd` = VALUES(`additional_km_rate_usd`)'
    );

    $conn->beginTransaction();
    try {
        foreach ($rows as $row) {
            if (empty($row['state']) || !in_array($row['service_type'] ?? '', $allowedServiceTypes, true)) {
                continue;
            }
            $stmt->execute([
                ':state' => $row['state'],
                ':service_type' => $row['service_type'],
                ':base_fare_usd' => (float) ($row['base_fare_usd'] ?? 0),
                ':base_distance_km' => (float) ($row['base_distance_km'] ?? 0),
                ':additional_km_rate_usd' => (float) ($row['additional_km_rate_usd'] ?? 0),
            ]);
        }
        $conn->commit();
    } catch (PDOException $e) {
        $conn->rollBack();
        Response::error('No se pudieron guardar las tarifas por estado', 500);
    }

    $stmt = $conn->query('SELECT * FROM `state_service_rates` ORDER BY `state`, `service_type`');
    Response::success($stmt->fetchAll());
} else {
    Response::error('Método no permitido', 405);
}
