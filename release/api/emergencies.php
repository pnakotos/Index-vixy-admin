<?php
require_once __DIR__ . '/../includes/bootstrap.php';

$allowedColumns = [
    'id', 'type', 'reporter_type', 'reporter_id', 'reporter_name', 'reporter_phone',
    'category', 'vehicle_info', 'plate_number', 'location_name', 'lat', 'lng',
    'status', 'notes', 'resolved_by', 'timestamp',
];

// La app conductor/pasajero reporta emergencias con la API key de interconexión
// (sin sesión admin); listar, editar o resolver alertas sí requiere el panel.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    Response::requireApiKey();

    $body = Response::getJsonBody();
    foreach (['type', 'reporter_type', 'reporter_id', 'reporter_name', 'reporter_phone', 'lat', 'lng'] as $field) {
        if (!array_key_exists($field, $body) || $body[$field] === '') {
            Response::error('Falta el campo requerido: ' . $field, 422);
        }
    }
    if (!in_array($body['type'], ['robo', 'accidente', 'sos', 'mecanico'], true)) {
        Response::error('Tipo de emergencia inválido', 422);
    }
    if (!in_array($body['reporter_type'], ['conductor', 'cliente'], true)) {
        Response::error('reporter_type inválido', 422);
    }

    $id = 'emg-' . bin2hex(random_bytes(8));
    $stmt = $conn->prepare(
        'INSERT INTO emergency_alerts
            (id, type, reporter_type, reporter_id, reporter_name, reporter_phone, category,
             vehicle_info, plate_number, location_name, lat, lng, status, notes, timestamp)
         VALUES (:id, :type, :reporter_type, :reporter_id, :reporter_name, :reporter_phone, :category,
             :vehicle_info, :plate_number, :location_name, :lat, :lng, \'pendiente\', :notes, NOW())'
    );
    $stmt->execute([
        ':id' => $id,
        ':type' => $body['type'],
        ':reporter_type' => $body['reporter_type'],
        ':reporter_id' => (string) $body['reporter_id'],
        ':reporter_name' => (string) $body['reporter_name'],
        ':reporter_phone' => (string) $body['reporter_phone'],
        ':category' => $body['category'] ?? null,
        ':vehicle_info' => $body['vehicle_info'] ?? null,
        ':plate_number' => $body['plate_number'] ?? null,
        ':location_name' => $body['location_name'] ?? null,
        ':lat' => (float) $body['lat'],
        ':lng' => (float) $body['lng'],
        ':notes' => $body['notes'] ?? null,
    ]);

    if ($body['reporter_type'] === 'conductor') {
        DriverActivityLogger::log(
            $conn,
            (string) $body['reporter_id'],
            (string) $body['reporter_name'],
            'emergency_' . $body['type'],
            'Emergencias',
            'Alerta de emergencia (' . $body['type'] . ') activada por el conductor',
            null,
            (float) $body['lat'],
            (float) $body['lng']
        );
    }

    $stmt = $conn->prepare('SELECT * FROM emergency_alerts WHERE id = ?');
    $stmt->execute([$id]);
    Response::success($stmt->fetch(), 201);
}

Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler($conn, 'emergency_alerts', 'id', $allowedColumns, 'emg');

$handler->handle();
