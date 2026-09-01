<?php
/**
 * Configuración de contacto y redes sociales (fila única, id = 1).
 */
require_once __DIR__ . '/includes/bootstrap.php';

$allowed = [
    'whatsapp_number', 'whatsapp_message', 'telegram_user_or_link', 'telegram_channel_or_group',
    'support_email', 'corporate_email', 'tiktok_url_or_user', 'instagram_url_or_user',
    'facebook_url_or_page', 'youtube_url', 'x_twitter_url', 'dispatch_phone', 'emergency_phone',
    'driver_support_phone', 'office_address', 'support_hours', 'coverage_text',
    'active_drivers_count', 'satisfied_trips_count',
];
$method = $_SERVER['REQUEST_METHOD'];
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    $stmt = $conn->query('SELECT * FROM `contact_social_config` WHERE `id` = 1 LIMIT 1');
    $row = $stmt->fetch();
    $row ? Response::success($row) : Response::error('Configuración no encontrada', 404);
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    $body = array_intersect_key(Response::getJsonBody(), array_flip($allowed));

    if (empty($body)) {
        Response::error('No se enviaron campos válidos', 422);
    }

    $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($body)));
    $stmt = $conn->prepare("UPDATE `contact_social_config` SET {$setClause} WHERE `id` = 1");
    foreach ($body as $col => $val) {
        $stmt->bindValue(':' . $col, $val);
    }
    $stmt->execute();

    $stmt = $conn->query('SELECT * FROM `contact_social_config` WHERE `id` = 1 LIMIT 1');
    Response::success($stmt->fetch());
} else {
    Response::error('Método no permitido', 405);
}
