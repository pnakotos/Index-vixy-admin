<?php
/**
 * Gestión de usuarios del panel (backend_users). Nunca expone password_hash.
 */
require_once __DIR__ . '/includes/bootstrap.php';

const SAFE_COLUMNS = 'id, name, username, email, role, avatar_url, is_active, must_change_password,
    password_expiration_days, password_created_at, created_at, last_login,
    perm_dashboard, perm_drivers, perm_clients, perm_payments, perm_map, perm_emergencies,
    perm_finances_config, perm_earnings_audit, perm_notifications, perm_reviews,
    perm_user_management, perm_audit_logs';

$allowedUpdate = [
    'name', 'email', 'role', 'avatar_url', 'is_active', 'must_change_password',
    'password_expiration_days', 'perm_dashboard', 'perm_drivers', 'perm_clients',
    'perm_payments', 'perm_map', 'perm_emergencies', 'perm_finances_config',
    'perm_earnings_audit', 'perm_notifications', 'perm_reviews',
    'perm_user_management', 'perm_audit_logs',
];

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
Response::requireAdminSession($conn, $method === 'GET');

if ($method === 'GET') {
    if ($id) {
        $stmt = $conn->prepare('SELECT ' . SAFE_COLUMNS . ' FROM `backend_users` WHERE `id` = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        $row ? Response::success($row) : Response::error('Usuario no encontrado', 404);
    } else {
        $stmt = $conn->query('SELECT ' . SAFE_COLUMNS . ' FROM `backend_users` ORDER BY `created_at` DESC');
        Response::success($stmt->fetchAll());
    }
} elseif ($method === 'POST') {
    $body = Response::getJsonBody();

    if (empty($body['email']) || empty($body['username']) || empty($body['name']) || empty($body['password']) || empty($body['role'])) {
        Response::error('Faltan campos obligatorios (name, username, email, password, role)', 422);
    }

    $newId = 'usr-' . bin2hex(random_bytes(4));
    $passwordHash = password_hash($body['password'], PASSWORD_BCRYPT);

    $stmt = $conn->prepare(
        'INSERT INTO `backend_users`
        (`id`, `name`, `username`, `email`, `role`, `avatar_url`, `is_active`, `password_hash`,
         `must_change_password`, `password_expiration_days`, `password_created_at`, `created_at`,
         `perm_dashboard`, `perm_drivers`, `perm_clients`, `perm_payments`, `perm_map`, `perm_emergencies`,
         `perm_finances_config`, `perm_earnings_audit`, `perm_notifications`, `perm_reviews`,
         `perm_user_management`, `perm_audit_logs`)
        VALUES (:id, :name, :username, :email, :role, :avatar_url, 1, :password_hash, 1, :exp_days, CURDATE(), CURDATE(),
         :perm_dashboard, :perm_drivers, :perm_clients, :perm_payments, :perm_map, :perm_emergencies,
         :perm_finances_config, :perm_earnings_audit, :perm_notifications, :perm_reviews,
         :perm_user_management, :perm_audit_logs)'
    );

    try {
        $stmt->execute([
            ':id' => $newId,
            ':name' => $body['name'],
            ':username' => strtolower(trim($body['username'])),
            ':email' => $body['email'],
            ':role' => $body['role'],
            ':avatar_url' => $body['avatarUrl'] ?? $body['avatar_url'] ?? null,
            ':password_hash' => $passwordHash,
            ':exp_days' => $body['passwordExpirationDays'] ?? 90,
            ':perm_dashboard' => (int) ($body['perm_dashboard'] ?? 0),
            ':perm_drivers' => (int) ($body['perm_drivers'] ?? 0),
            ':perm_clients' => (int) ($body['perm_clients'] ?? 0),
            ':perm_payments' => (int) ($body['perm_payments'] ?? 0),
            ':perm_map' => (int) ($body['perm_map'] ?? 0),
            ':perm_emergencies' => (int) ($body['perm_emergencies'] ?? 0),
            ':perm_finances_config' => (int) ($body['perm_finances_config'] ?? 0),
            ':perm_earnings_audit' => (int) ($body['perm_earnings_audit'] ?? 0),
            ':perm_notifications' => (int) ($body['perm_notifications'] ?? 0),
            ':perm_reviews' => (int) ($body['perm_reviews'] ?? 0),
            ':perm_user_management' => (int) ($body['perm_user_management'] ?? 0),
            ':perm_audit_logs' => (int) ($body['perm_audit_logs'] ?? 0),
        ]);
    } catch (PDOException $e) {
        Response::error('No se pudo crear el usuario (correo posiblemente duplicado)', 409);
    }

    $stmt = $conn->prepare('SELECT ' . SAFE_COLUMNS . ' FROM `backend_users` WHERE `id` = :id');
    $stmt->execute([':id' => $newId]);
    Response::success($stmt->fetch(), 201);
} elseif (in_array($method, ['PUT', 'PATCH'], true)) {
    if (!$id) {
        Response::error('Falta el parámetro id', 400);
    }

    $body = Response::getJsonBody();
    $fields = array_intersect_key($body, array_flip($allowedUpdate));

    // Cambio de contraseña manejado aparte, siempre con hash seguro.
    if (!empty($body['password'])) {
        $fields['password_hash'] = password_hash($body['password'], PASSWORD_BCRYPT);
        $fields['password_created_at'] = date('Y-m-d');
    }

    if (empty($fields)) {
        Response::error('No se enviaron campos válidos para actualizar', 422);
    }

    $setClause = implode(', ', array_map(fn($c) => "`{$c}` = :{$c}", array_keys($fields)));
    $stmt = $conn->prepare("UPDATE `backend_users` SET {$setClause} WHERE `id` = :__id");
    foreach ($fields as $col => $val) {
        $stmt->bindValue(':' . $col, $val);
    }
    $stmt->bindValue(':__id', $id);
    $stmt->execute();

    $stmt = $conn->prepare('SELECT ' . SAFE_COLUMNS . ' FROM `backend_users` WHERE `id` = :id');
    $stmt->execute([':id' => $id]);
    Response::success($stmt->fetch());
} elseif ($method === 'DELETE') {
    if (!$id) {
        Response::error('Falta el parámetro id', 400);
    }
    $stmt = $conn->prepare('DELETE FROM `backend_users` WHERE `id` = :id');
    $stmt->execute([':id' => $id]);
    $stmt->rowCount() > 0
        ? Response::success(['deleted' => $id])
        : Response::error('Usuario no encontrado', 404);
} else {
    Response::error('Método no permitido', 405);
}
