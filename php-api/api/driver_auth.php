<?php
/**
 * Autenticación de la app Vixy Driver (independiente del panel admin).
 * Usa un token de sesión propio por conductor (columna auth_token en
 * `drivers`) en vez de sesiones PHP, para que la app móvil/web pueda
 * llamar estos endpoints con la API key de interconexión.
 *
 * Acciones: register, login, logout, me, update_device_token.
 */
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireApiKey();

const DRIVER_SAFE_COLUMNS = 'id, name, username, email, phone, category, status, balance_usd, rating,
    completed_trips, lat, lng, location_name, registered_at, last_active, is_online,
    rejection_reason, block_reason,
    doc_cedula_url, doc_cedula_number, doc_licencia_url, doc_licencia_number,
    doc_certificado_medico_url, doc_rcv_url, doc_foto_vehiculo_url,
    doc_plate_number, doc_vehicle_model, doc_vehicle_year, doc_vehicle_color,
    last_login_at, created_at, updated_at';

function driverIdGen(): string
{
    return 'drv-' . bin2hex(random_bytes(8));
}

function findDriverByLogin(PDO $conn, string $login): ?array
{
    $stmt = $conn->prepare(
        'SELECT * FROM `drivers` WHERE LOWER(`email`) = :login OR LOWER(`username`) = :login LIMIT 1'
    );
    $stmt->execute([':login' => strtolower($login)]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function driverServices(PDO $conn, string $driverId): array
{
    $stmt = $conn->prepare('SELECT service_type FROM driver_services WHERE driver_id = ?');
    $stmt->execute([$driverId]);
    return array_column($stmt->fetchAll(), 'service_type');
}

function setDriverServices(PDO $conn, string $driverId, array $services): array
{
    $allowed = ['taxi', 'mototaxi', 'delivery'];
    $services = array_values(array_unique(array_intersect($services, $allowed)));
    if (empty($services)) {
        Response::error('Debes seleccionar al menos un servicio válido (taxi, mototaxi, delivery)', 422);
    }

    $conn->prepare('DELETE FROM driver_services WHERE driver_id = ?')->execute([$driverId]);
    $stmt = $conn->prepare('INSERT INTO driver_services (driver_id, service_type) VALUES (?, ?)');
    foreach ($services as $service) {
        $stmt->execute([$driverId, $service]);
    }
    // La categoría principal (heredada) queda como el primer servicio seleccionado.
    $conn->prepare('UPDATE drivers SET category = ? WHERE id = ?')->execute([$services[0], $driverId]);

    return $services;
}

function driverWithServices(PDO $conn, string $driverId): array
{
    $stmt = $conn->prepare('SELECT ' . DRIVER_SAFE_COLUMNS . ' FROM `drivers` WHERE id = ?');
    $stmt->execute([$driverId]);
    $driver = $stmt->fetch();
    if ($driver) {
        $driver['services'] = driverServices($conn, $driverId);
    }
    return $driver;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'register' && $method === 'POST') {
    $body = Response::getJsonBody();
    foreach (['name', 'username', 'email', 'phone', 'password'] as $field) {
        if (empty($body[$field])) {
            Response::error('Falta el campo requerido: ' . $field, 422);
        }
    }
    $services = is_array($body['services'] ?? null) ? $body['services'] : (isset($body['category']) ? [$body['category']] : []);
    $services = array_values(array_unique(array_intersect($services, ['taxi', 'mototaxi', 'delivery'])));
    if (empty($services)) {
        Response::error('Debes seleccionar al menos un servicio válido (taxi, mototaxi, delivery)', 422);
    }
    if (strlen((string) $body['password']) < 6) {
        Response::error('La contraseña debe tener al menos 6 caracteres', 422);
    }

    $id = driverIdGen();
    $stmt = $conn->prepare(
        'INSERT INTO `drivers`
            (id, name, username, email, phone, category, status, registered_at, password_hash,
             doc_cedula_number, doc_plate_number, doc_vehicle_model, doc_vehicle_year, doc_vehicle_color,
             lat, lng, location_name)
         VALUES (:id, :name, :username, :email, :phone, :category, \'pendiente\', CURDATE(), :password_hash,
             :doc_cedula_number, :doc_plate_number, :doc_vehicle_model, :doc_vehicle_year, :doc_vehicle_color,
             :lat, :lng, :location_name)'
    );
    try {
        $conn->beginTransaction();
        $stmt->execute([
            ':id' => $id,
            ':name' => (string) $body['name'],
            ':username' => strtolower(trim((string) $body['username'])),
            ':email' => strtolower(trim((string) $body['email'])),
            ':phone' => (string) $body['phone'],
            ':category' => $services[0],
            ':password_hash' => password_hash((string) $body['password'], PASSWORD_DEFAULT),
            ':doc_cedula_number' => $body['cedulaNumber'] ?? null,
            ':doc_plate_number' => $body['plateNumber'] ?? null,
            ':doc_vehicle_model' => $body['vehicleModel'] ?? null,
            ':doc_vehicle_year' => $body['vehicleYear'] ?? null,
            ':doc_vehicle_color' => $body['vehicleColor'] ?? null,
            ':lat' => (float) ($body['lat'] ?? 0),
            ':lng' => (float) ($body['lng'] ?? 0),
            ':location_name' => $body['locationName'] ?? null,
        ]);
        setDriverServices($conn, $id, $services);
        $conn->commit();
    } catch (PDOException $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        Response::error('El correo o usuario ya está registrado', 409);
    }

    DriverActivityLogger::log($conn, $id, (string) $body['name'], 'register', 'Registro', 'Nueva solicitud de conductor pendiente de verificación (' . implode(', ', $services) . ')');

    Response::success(driverWithServices($conn, $id), 201);
}

if ($action === 'login' && $method === 'POST') {
    $body = Response::getJsonBody();
    $login = trim((string) ($body['email'] ?? $body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    if ($login === '' || $password === '') {
        Response::error('Usuario/correo y contraseña son obligatorios', 422);
    }

    $driver = findDriverByLogin($conn, $login);
    if (!$driver || empty($driver['password_hash']) || !password_verify($password, $driver['password_hash'])) {
        Response::error('Credenciales inválidas', 401);
    }
    if ($driver['status'] === 'bloqueado') {
        Response::error('Tu cuenta está bloqueada. Contacta al soporte de Vixy.', 403);
    }
    if ($driver['status'] === 'rechazado') {
        Response::error('Tu solicitud fue rechazada. Contacta al soporte de Vixy.', 403);
    }

    $token = bin2hex(random_bytes(32));
    $conn->prepare(
        'UPDATE `drivers` SET auth_token = ?, last_login_at = NOW(), last_active = NOW() WHERE id = ?'
    )->execute([$token, $driver['id']]);

    DriverActivityLogger::log($conn, $driver['id'], $driver['name'], 'login', 'Sesión');

    $stmt = $conn->prepare('SELECT ' . DRIVER_SAFE_COLUMNS . ', auth_token FROM `drivers` WHERE id = ?');
    $stmt->execute([$driver['id']]);
    $result = $stmt->fetch();
    $result['services'] = driverServices($conn, $driver['id']);
    Response::success($result);
}

if ($action === 'me' && $method === 'GET') {
    $token = $_GET['token'] ?? '';
    if ($token === '') {
        Response::error('Falta el token de sesión', 422);
    }
    $stmt = $conn->prepare('SELECT id FROM `drivers` WHERE auth_token = ? LIMIT 1');
    $stmt->execute([$token]);
    $driver = $stmt->fetch();
    $driver ? Response::success(driverWithServices($conn, $driver['id'])) : Response::error('Sesión inválida o expirada', 401);
}

if ($action === 'logout' && $method === 'POST') {
    $body = Response::getJsonBody();
    $driverId = (string) ($body['driverId'] ?? '');
    if ($driverId === '') {
        Response::error('Falta driverId', 422);
    }
    $stmt = $conn->prepare('SELECT name FROM `drivers` WHERE id = ? LIMIT 1');
    $stmt->execute([$driverId]);
    $driver = $stmt->fetch();
    if ($driver) {
        $conn->prepare('UPDATE `drivers` SET auth_token = NULL, is_online = 0 WHERE id = ?')->execute([$driverId]);
        DriverActivityLogger::log($conn, $driverId, $driver['name'], 'logout', 'Sesión');
    }
    Response::success(['loggedOut' => true]);
}

if ($action === 'update_device_token' && $method === 'POST') {
    $body = Response::getJsonBody();
    $driverId = (string) ($body['driverId'] ?? '');
    $deviceToken = (string) ($body['deviceToken'] ?? '');
    if ($driverId === '' || $deviceToken === '') {
        Response::error('Faltan driverId o deviceToken', 422);
    }
    $stmt = $conn->prepare('UPDATE `drivers` SET device_token = ? WHERE id = ?');
    $stmt->execute([$deviceToken, $driverId]);
    Response::success(['updated' => $stmt->rowCount() > 0]);
}

if ($action === 'update_services' && $method === 'POST') {
    $body = Response::getJsonBody();
    $driverId = (string) ($body['driverId'] ?? '');
    if ($driverId === '' || !is_array($body['services'] ?? null)) {
        Response::error('Faltan driverId o services', 422);
    }
    $stmt = $conn->prepare('SELECT name FROM `drivers` WHERE id = ? LIMIT 1');
    $stmt->execute([$driverId]);
    $driver = $stmt->fetch();
    if (!$driver) {
        Response::error('Conductor no encontrado', 404);
    }
    $services = setDriverServices($conn, $driverId, $body['services']);
    DriverActivityLogger::log($conn, $driverId, $driver['name'], 'update_services', 'Perfil', 'Servicios actualizados: ' . implode(', ', $services));
    Response::success(driverWithServices($conn, $driverId));
}

Response::error('Acción o método no soportado', 405);
