<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$handler = new CrudHandler(
    $conn,
    'drivers',
    'id',
    [
        'id', 'name', 'email', 'phone', 'category', 'status', 'balance_usd', 'rating',
        'completed_trips', 'lat', 'lng', 'location_name', 'registered_at', 'last_active',
        'is_online', 'rejection_reason', 'block_reason',
        'doc_cedula_url', 'doc_cedula_number', 'doc_licencia_url', 'doc_licencia_number',
        'doc_certificado_medico_url', 'doc_rcv_url', 'doc_foto_vehiculo_url',
        'doc_plate_number', 'doc_vehicle_model', 'doc_vehicle_year', 'doc_vehicle_color',
    ],
    'drv',
    ['password_hash', 'auth_token', 'device_token']
);

$handler->handle();
