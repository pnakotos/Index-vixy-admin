<?php
require_once __DIR__ . '/includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'payments',
    'id',
    [
        'id', 'type', 'entity_id', 'entity_name', 'entity_phone', 'category',
        'reference_number', 'payment_method', 'bank_origin', 'amount_ves', 'amount_usd',
        'bcv_rate_used', 'receipt_image_url', 'status', 'verified_by', 'verified_at',
        'notes', 'created_at',
    ],
    'pay'
);

$handler->handle();
