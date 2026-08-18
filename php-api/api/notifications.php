<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'push_notifications',
    'id',
    ['id', 'title', 'body', 'target_group', 'recipient_id', 'recipient_name', 'sent_by', 'sent_at'],
    'ntf'
);

$handler->handle();
