<?php
require_once __DIR__ . '/includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'completed_services',
    'id',
    [
        'id', 'service_date', 'service_time', 'driver_id', 'driver_name', 'driver_category',
        'client_id', 'client_name', 'client_phone', 'origin', 'destination', 'fare_usd',
        'fare_ves', 'commission_percent', 'commission_usd', 'commission_ves',
        'driver_earnings_usd', 'payment_method', 'status',
    ],
    'srv'
);

$handler->handle();
