<?php
/**
 * Bootstrap seguro del primer administrador. Ejecutar solo por CLI en el servidor.
 * Uso: php create_admin.php correo nombre
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$email = strtolower(trim($argv[1] ?? ''));
$name = trim($argv[2] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '') {
    fwrite(STDERR, "Uso: php create_admin.php correo nombre\n");
    exit(1);
}

$password = trim((string) readline('Contraseña (mínimo 12 caracteres): '));
if (strlen($password) < 12) {
    fwrite(STDERR, "La contraseña debe tener al menos 12 caracteres.\n");
    exit(1);
}

$conn = Database::getConnection();
$count = (int) $conn->query('SELECT COUNT(*) FROM backend_users')->fetchColumn();
if ($count > 0) {
    fwrite(STDERR, "El bootstrap está cerrado: ya existe un administrador.\n");
    exit(1);
}

$permissions = [
    'dashboard', 'drivers', 'clients', 'payments', 'map', 'emergencies',
    'finances_config', 'earnings_audit', 'notifications', 'reviews',
    'user_management', 'audit_logs',
];
$columns = ['id', 'name', 'email', 'role', 'is_active', 'password_hash', 'must_change_password', 'password_created_at', 'created_at'];
$values = ['admin-' . bin2hex(random_bytes(8)), $name, $email, 'Super Admin', 1, password_hash($password, PASSWORD_DEFAULT), 0, date('Y-m-d'), date('Y-m-d')];
foreach ($permissions as $permission) {
    $columns[] = 'perm_' . $permission;
    $values[] = 1;
}
$placeholders = implode(', ', array_fill(0, count($columns), '?'));
$sql = 'INSERT INTO backend_users (`' . implode('`, `', $columns) . '`) VALUES (' . $placeholders . ')';
$stmt = $conn->prepare($sql);
$stmt->execute($values);
fwrite(STDOUT, "Administrador creado: {$email}\n");
