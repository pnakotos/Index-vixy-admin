<?php
/**
 * Autenticación de la app Vixy Pasajero (independiente del panel admin).
 * Usa un token de sesión propio por cliente (columna auth_token en
 * `clients`), igual que `driver_auth.php` para la app conductor, para que
 * la app móvil/web pueda llamar estos endpoints con la API key de interconexión.
 *
 * Acciones: register, login, me, logout, update_device_token.
 */
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireApiKey();

const CLIENT_SAFE_COLUMNS = 'id, name, username, email, phone, balance_usd, total_trips, rating,
    is_blocked, block_reason, registered_at, avatar_url, cedula, emergency_contact,
    emergency_phone, last_login_at, created_at, updated_at';

function clientIdGen(): string
{
    return 'cli-' . bin2hex(random_bytes(8));
}

function findClientByLogin(PDO $conn, string $login): ?array
{
    $stmt = $conn->prepare(
        'SELECT * FROM `clients` WHERE LOWER(`email`) = :login OR LOWER(`username`) = :login LIMIT 1'
    );
    $stmt->execute([':login' => strtolower($login)]);
    $row = $stmt->fetch();
    return $row ?: null;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'register' && $method === 'POST') {
    $body = Response::getJsonBody();
    foreach (['name', 'email', 'phone', 'password'] as $field) {
        if (empty($body[$field])) {
            Response::error('Falta el campo requerido: ' . $field, 422);
        }
    }
    if (strlen((string) $body['password']) < 6) {
        Response::error('La contraseña debe tener al menos 6 caracteres', 422);
    }
    $username = !empty($body['username'])
        ? strtolower(trim((string) $body['username']))
        : strtolower(explode('@', (string) $body['email'])[0]);

    $id = clientIdGen();
    $stmt = $conn->prepare(
        'INSERT INTO `clients`
            (id, name, username, email, phone, password_hash, registered_at,
             cedula, emergency_contact, emergency_phone, rating)
         VALUES (:id, :name, :username, :email, :phone, :password_hash, CURDATE(),
             :cedula, :emergency_contact, :emergency_phone, 5.00)'
    );
    try {
        $stmt->execute([
            ':id' => $id,
            ':name' => (string) $body['name'],
            ':username' => $username,
            ':email' => strtolower(trim((string) $body['email'])),
            ':phone' => (string) $body['phone'],
            ':password_hash' => password_hash((string) $body['password'], PASSWORD_DEFAULT),
            ':cedula' => $body['cedula'] ?? null,
            ':emergency_contact' => $body['emergencyContact'] ?? null,
            ':emergency_phone' => $body['emergencyPhone'] ?? null,
        ]);
    } catch (PDOException $e) {
        Response::error('El correo o usuario ya está registrado', 409);
    }

    $token = bin2hex(random_bytes(32));
    $conn->prepare('UPDATE `clients` SET auth_token = ?, last_login_at = NOW() WHERE id = ?')->execute([$token, $id]);

    $stmt = $conn->prepare('SELECT ' . CLIENT_SAFE_COLUMNS . ', auth_token FROM `clients` WHERE id = ?');
    $stmt->execute([$id]);
    Response::success($stmt->fetch(), 201);
}

if ($action === 'login' && $method === 'POST') {
    $body = Response::getJsonBody();
    $login = trim((string) ($body['email'] ?? $body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    if ($login === '' || $password === '') {
        Response::error('Usuario/correo y contraseña son obligatorios', 422);
    }

    $client = findClientByLogin($conn, $login);
    if (!$client || empty($client['password_hash']) || !password_verify($password, $client['password_hash'])) {
        Response::error('Credenciales inválidas', 401);
    }
    if ((int) $client['is_blocked'] === 1) {
        Response::error('Tu cuenta está bloqueada. Contacta al soporte de Vixy.', 403);
    }

    $token = bin2hex(random_bytes(32));
    $conn->prepare('UPDATE `clients` SET auth_token = ?, last_login_at = NOW() WHERE id = ?')->execute([$token, $client['id']]);

    $stmt = $conn->prepare('SELECT ' . CLIENT_SAFE_COLUMNS . ', auth_token FROM `clients` WHERE id = ?');
    $stmt->execute([$client['id']]);
    Response::success($stmt->fetch());
}

if ($action === 'me' && $method === 'GET') {
    $token = $_GET['token'] ?? '';
    if ($token === '') {
        Response::error('Falta el token de sesión', 422);
    }
    $stmt = $conn->prepare('SELECT ' . CLIENT_SAFE_COLUMNS . ' FROM `clients` WHERE auth_token = ? LIMIT 1');
    $stmt->execute([$token]);
    $client = $stmt->fetch();
    $client ? Response::success($client) : Response::error('Sesión inválida o expirada', 401);
}

if ($action === 'logout' && $method === 'POST') {
    $body = Response::getJsonBody();
    $clientId = (string) ($body['clientId'] ?? '');
    if ($clientId === '') {
        Response::error('Falta clientId', 422);
    }
    $conn->prepare('UPDATE `clients` SET auth_token = NULL WHERE id = ?')->execute([$clientId]);
    Response::success(['loggedOut' => true]);
}

if ($action === 'update_device_token' && $method === 'POST') {
    $body = Response::getJsonBody();
    $clientId = (string) ($body['clientId'] ?? '');
    $deviceToken = (string) ($body['deviceToken'] ?? '');
    if ($clientId === '' || $deviceToken === '') {
        Response::error('Faltan clientId o deviceToken', 422);
    }
    $stmt = $conn->prepare('UPDATE `clients` SET device_token = ? WHERE id = ?');
    $stmt->execute([$deviceToken, $clientId]);
    Response::success(['updated' => $stmt->rowCount() > 0]);
}
