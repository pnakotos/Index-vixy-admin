<?php
require_once __DIR__ . '/includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'custom_payment_methods',
    'id',
    ['id', 'name', 'currency', 'identifier', 'holder_name', 'details', 'instructions', 'enabled', 'created_at'],
    'cpm'
);

$handler->handle();
