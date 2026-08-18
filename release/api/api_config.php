<?php
/**
 * Configuración de interconexión con apps móviles (fila única, id = 1).
 * Contiene secretos sensibles: solo accesible con API key válida.
 */
require_once __DIR__ . '/includes/bootstrap.php';

$allowed = [
    'backend_api_url', 'prod_api_key', 'google_maps_api_key', 'payment_webhook_secret',
    'driver_app_sync_endpoint', 'passenger_app_sync_endpoint', 'fcm_server_key', 'production_mode',
];

$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `api_interconnection_config` WHERE `id` = 1 LIMIT 1');
    $row = $stmt->fetch();
    $row ? Response::success($row) : Response::error('Configuración no encontrada', 404);
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $body = array_intersect_key(Response::getJsonBody(), array_flip($allowed));

    if (empty($body)) {
        Response::error('No se enviaron campos válidos', 422);
    }

    $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($body)));
    $stmt = $conn->prepare("UPDATE `api_interconnection_config` SET {$setClause} WHERE `id` = 1");
    foreach ($body as $col => $val) {
        $stmt->bindValue(':' . $col, $val);
    }
    $stmt->execute();

    $stmt = $conn->query('SELECT * FROM `api_interconnection_config` WHERE `id` = 1 LIMIT 1');
    Response::success($stmt->fetch());
} else {
    Response::error('Método no permitido', 405);
}
