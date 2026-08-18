<?php
/**
 * Autenticación del panel admin: login / logout / sesión actual.
 * Usa sesiones PHP (cookie httponly + secure) en vez de exponer tokens al JS.
 */
$bootstrap = __DIR__ . '/includes/bootstrap.php';
if (!is_file($bootstrap)) {
    $bootstrap = __DIR__ . '/../includes/bootstrap.php';
}
require_once $bootstrap;

const SAFE_COLUMNS = 'id, name, username, email, role, avatar_url, is_active, must_change_password,
    password_expiration_days, password_created_at, created_at, last_login,
    perm_dashboard, perm_drivers, perm_clients, perm_payments, perm_map, perm_emergencies,
    perm_finances_config, perm_earnings_audit, perm_notifications, perm_reviews,
    perm_user_management, perm_audit_logs';

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

$action = $_GET['action'] ?? 'login';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'login' && $method === 'POST') {
    $body = Response::getJsonBody();
    $login = strtolower(trim($body['email'] ?? $body['username'] ?? ''));
    $password = $body['password'] ?? '';

    if ($login === '' || $password === '') {
        Response::error('Usuario/correo y contraseña son obligatorios', 422);
    }

    $stmt = $conn->prepare('SELECT * FROM `backend_users` WHERE LOWER(`email`) = :email OR LOWER(`username`) = :username LIMIT 1');
    $stmt->execute([':email' => $login, ':username' => $login]);
    $user = $stmt->fetch();

    // Mensaje genérico para no revelar si el correo existe o no.
    if (!$user || !password_verify($password, $user['password_hash'])) {
        Response::error('Credenciales inválidas', 401);
    }

    if ((int) $user['is_active'] !== 1) {
        Response::error('Usuario inactivo, contacte al administrador', 403);
    }

    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];

    $update = $conn->prepare('UPDATE `backend_users` SET `last_login` = :now WHERE `id` = :id');
    $update->execute([':now' => date('Y-m-d H:i:s'), ':id' => $user['id']]);

    unset($user['password_hash']);
    Response::success($user);
} elseif ($action === 'logout' && $method === 'POST') {
    $_SESSION = [];
    session_destroy();
    Response::success(['loggedOut' => true]);
} elseif ($action === 'change_password' && $method === 'POST') {
    if (empty($_SESSION['user_id'])) {
        Response::error('No autenticado', 401);
    }
    $body = Response::getJsonBody();
    $currentPassword = (string) ($body['currentPassword'] ?? '');
    $newPassword = (string) ($body['newPassword'] ?? '');
    if ($currentPassword === '' || strlen($newPassword) < 6) {
        Response::error('La contraseña actual es obligatoria y la nueva debe tener al menos 6 caracteres', 422);
    }
    $stmt = $conn->prepare('SELECT password_hash FROM `backend_users` WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        Response::error('La contraseña actual no coincide', 422);
    }
    $update = $conn->prepare(
        'UPDATE `backend_users` SET password_hash = ?, must_change_password = 0, password_created_at = ? WHERE id = ?'
    );
    $update->execute([password_hash($newPassword, PASSWORD_DEFAULT), date('Y-m-d'), $_SESSION['user_id']]);
    Response::success(['passwordChanged' => true]);
} elseif ($action === 'me' && $method === 'GET') {
    if (empty($_SESSION['user_id'])) {
        Response::error('No autenticado', 401);
    }

    $stmt = $conn->prepare('SELECT ' . SAFE_COLUMNS . ' FROM `backend_users` WHERE `id` = :id LIMIT 1');
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    $user ? Response::success($user) : Response::error('Usuario no encontrado', 404);
} else {
    Response::error('Acción o método no soportado', 405);
}
