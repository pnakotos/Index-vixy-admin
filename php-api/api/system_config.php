<?php
/**
 * Configuración financiera del sistema (fila única, id = 1).
 */
require_once __DIR__ . '/../includes/bootstrap.php';

$allowed = [
    'bcv_rate', 'commission_percent', 'negative_balance_threshold', 'admin_email',
    'base_fare_usd', 'base_distance_km', 'additional_km_rate_usd',
    'pago_movil_bank_name', 'pago_movil_bank_code', 'pago_movil_cif',
    'pago_movil_phone', 'pago_movil_holder_name',
    'gateway_pago_movil', 'gateway_zelle', 'gateway_binance_pay',
    'gateway_efectivo', 'gateway_tarjeta',
];

$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `system_config` WHERE `id` = 1 LIMIT 1');
    $row = $stmt->fetch();
    $row ? Response::success($row) : Response::error('Configuración no encontrada', 404);
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $body = array_intersect_key(Response::getJsonBody(), array_flip($allowed));

    if (empty($body)) {
        Response::error('No se enviaron campos válidos', 422);
    }

    $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($body)));
    $stmt = $conn->prepare("UPDATE `system_config` SET {$setClause} WHERE `id` = 1");
    foreach ($body as $col => $val) {
        $stmt->bindValue(':' . $col, $val);
    }
    $stmt->execute();

    $stmt = $conn->query('SELECT * FROM `system_config` WHERE `id` = 1 LIMIT 1');
    Response::success($stmt->fetch());
} else {
    Response::error('Método no permitido', 405);
}
