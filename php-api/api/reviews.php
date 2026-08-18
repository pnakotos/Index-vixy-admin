<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'reviews',
    'id',
    [
        'id', 'driver_id', 'driver_name', 'driver_category', 'client_id', 'client_name',
        'rating', 'comment', 'is_flagged', 'created_at',
    ],
    'rev'
);

$handler->handle();
