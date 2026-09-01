<?php
/**
 * Tarifa universitaria especial por estado de Venezuela.
 * GET devuelve todas las filas. PUT/PATCH reemplaza (upsert) las filas enviadas.
 */
require_once __DIR__ . '/includes/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `state_university_rates` ORDER BY `state`');
    Response::success($stmt->fetchAll());
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $rows = Response::getJsonBody();

    if (empty($rows)) {
        Response::error('No se enviaron tarifas universitarias para guardar', 422);
    }

    $stmt = $conn->prepare(
        'INSERT INTO `state_university_rates`
            (`state`, `enabled`, `notes`, `allowed_universities`, `require_student_verification`,
             `taxi_base_fare_usd`, `taxi_base_distance_km`, `taxi_additional_km_rate_usd`,
             `mototaxi_base_fare_usd`, `mototaxi_base_distance_km`, `mototaxi_additional_km_rate_usd`,
             `delivery_base_fare_usd`, `delivery_base_distance_km`, `delivery_additional_km_rate_usd`)
         VALUES
            (:state, :enabled, :notes, :allowed_universities, :require_student_verification,
             :taxi_base_fare_usd, :taxi_base_distance_km, :taxi_additional_km_rate_usd,
             :mototaxi_base_fare_usd, :mototaxi_base_distance_km, :mototaxi_additional_km_rate_usd,
             :delivery_base_fare_usd, :delivery_base_distance_km, :delivery_additional_km_rate_usd)
         ON DUPLICATE KEY UPDATE
            `enabled` = VALUES(`enabled`), `notes` = VALUES(`notes`),
            `allowed_universities` = VALUES(`allowed_universities`),
            `require_student_verification` = VALUES(`require_student_verification`),
            `taxi_base_fare_usd` = VALUES(`taxi_base_fare_usd`),
            `taxi_base_distance_km` = VALUES(`taxi_base_distance_km`),
            `taxi_additional_km_rate_usd` = VALUES(`taxi_additional_km_rate_usd`),
            `mototaxi_base_fare_usd` = VALUES(`mototaxi_base_fare_usd`),
            `mototaxi_base_distance_km` = VALUES(`mototaxi_base_distance_km`),
            `mototaxi_additional_km_rate_usd` = VALUES(`mototaxi_additional_km_rate_usd`),
            `delivery_base_fare_usd` = VALUES(`delivery_base_fare_usd`),
            `delivery_base_distance_km` = VALUES(`delivery_base_distance_km`),
            `delivery_additional_km_rate_usd` = VALUES(`delivery_additional_km_rate_usd`)'
    );

    $conn->beginTransaction();
    try {
        foreach ($rows as $row) {
            if (empty($row['state'])) {
                continue;
            }
            $allowedUniversities = $row['allowed_universities'] ?? null;
            if (is_array($allowedUniversities)) {
                $allowedUniversities = json_encode($allowedUniversities, JSON_UNESCAPED_UNICODE);
            }
            $stmt->execute([
                ':state' => $row['state'],
                ':enabled' => !empty($row['enabled']) ? 1 : 0,
                ':notes' => $row['notes'] ?? null,
                ':allowed_universities' => $allowedUniversities,
                ':require_student_verification' => !empty($row['require_student_verification']) ? 1 : 0,
                ':taxi_base_fare_usd' => $row['taxi_base_fare_usd'] ?? null,
                ':taxi_base_distance_km' => $row['taxi_base_distance_km'] ?? null,
                ':taxi_additional_km_rate_usd' => $row['taxi_additional_km_rate_usd'] ?? null,
                ':mototaxi_base_fare_usd' => $row['mototaxi_base_fare_usd'] ?? null,
                ':mototaxi_base_distance_km' => $row['mototaxi_base_distance_km'] ?? null,
                ':mototaxi_additional_km_rate_usd' => $row['mototaxi_additional_km_rate_usd'] ?? null,
                ':delivery_base_fare_usd' => $row['delivery_base_fare_usd'] ?? null,
                ':delivery_base_distance_km' => $row['delivery_base_distance_km'] ?? null,
                ':delivery_additional_km_rate_usd' => $row['delivery_additional_km_rate_usd'] ?? null,
            ]);
        }
        $conn->commit();
    } catch (PDOException $e) {
        $conn->rollBack();
        Response::error('No se pudieron guardar las tarifas universitarias', 500);
    }

    $stmt = $conn->query('SELECT * FROM `state_university_rates` ORDER BY `state`');
    Response::success($stmt->fetchAll());
} else {
    Response::error('Método no permitido', 405);
}
