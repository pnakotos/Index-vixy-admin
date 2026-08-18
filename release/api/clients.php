<?php
require_once __DIR__ . '/includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'clients',
    'id',
    [
        'id', 'name', 'email', 'phone', 'balance_usd', 'total_trips', 'rating',
        'is_blocked', 'block_reason', 'registered_at', 'avatar_url',
    ],
    'cli'
);

$handler->handle();
