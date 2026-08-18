<?php
/**
 * Configuración de branding/multimedia (fila única, id = 1).
 */
require_once __DIR__ . '/includes/bootstrap.php';

$allowed = ['image_url', 'background_image_url', 'video_url', 'video_title'];
$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `branding_media` WHERE `id` = 1 LIMIT 1');
    $row = $stmt->fetch();
    $row ? Response::success($row) : Response::error('Configuración no encontrada', 404);
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $body = array_intersect_key(Response::getJsonBody(), array_flip($allowed));

    if (empty($body)) {
        Response::error('No se enviaron campos válidos', 422);
    }

    $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($body)));
    $stmt = $conn->prepare("UPDATE `branding_media` SET {$setClause} WHERE `id` = 1");
    foreach ($body as $col => $val) {
        $stmt->bindValue(':' . $col, $val);
    }
    $stmt->execute();

    $stmt = $conn->query('SELECT * FROM `branding_media` WHERE `id` = 1 LIMIT 1');
    Response::success($stmt->fetch());
} else {
    Response::error('Método no permitido', 405);
}
