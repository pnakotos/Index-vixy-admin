<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'audit_logs',
    'id',
    ['id', 'admin_user', 'admin_role', 'action', 'module', 'details', 'ip_address', 'timestamp'],
    'log'
);

// La bitácora de auditoría es de solo lectura vía API (no se permite editar/borrar).
if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'PATCH', 'DELETE'], true)) {
    Response::error('La bitácora de auditoría no permite modificaciones', 405);
}

$handler->handle();
