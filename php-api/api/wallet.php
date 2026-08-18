<?php
/**
 * Billetera del conductor (independiente por driver_id). Acciones:
 * - GET  ?action=summary&driver_id=...  -> saldo actual + historial
 * - POST ?action=recharge               -> registra un comprobante de recarga
 *   pendiente de verificación (queda en `payments`, igual que el flujo web).
 * Requiere X-Api-Key (app conductor), no sesión de panel admin.
 */
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireApiKey();

$action = $_GET['action'] ?? 'summary';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'summary' && $method === 'GET') {
    $driverId = $_GET['driver_id'] ?? '';
    if ($driverId === '') {
        Response::error('Falta driver_id', 422);
    }

    $driverStmt = $conn->prepare('SELECT id, name, phone, balance_usd FROM drivers WHERE id = ? LIMIT 1');
    $driverStmt->execute([$driverId]);
    $driver = $driverStmt->fetch();
    if (!$driver) {
        Response::error('Conductor no encontrado', 404);
    }

    $limit = isset($_GET['limit']) ? min((int) $_GET['limit'], 200) : 50;
    $stmt = $conn->prepare(
        'SELECT * FROM driver_wallet_transactions WHERE driver_id = ? ORDER BY created_at DESC LIMIT :limit'
    );
    $stmt->bindValue(1, $driverId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    Response::success([
        'driverId' => $driver['id'],
        'balanceUsd' => (float) $driver['balance_usd'],
        'transactions' => $stmt->fetchAll(),
    ]);
}

if ($action === 'recharge' && $method === 'POST') {
    $body = Response::getJsonBody();
    foreach (['driverId', 'referenceNumber', 'paymentMethod', 'amountUsd', 'amountVes'] as $field) {
        if (!array_key_exists($field, $body) || $body[$field] === '') {
            Response::error('Falta el campo requerido: ' . $field, 422);
        }
    }

    $driverStmt = $conn->prepare('SELECT id, name, phone, category FROM drivers WHERE id = ? LIMIT 1');
    $driverStmt->execute([(string) $body['driverId']]);
    $driver = $driverStmt->fetch();
    if (!$driver) {
        Response::error('Conductor no encontrado', 404);
    }

    $id = 'pay-' . bin2hex(random_bytes(8));
    $stmt = $conn->prepare(
        'INSERT INTO payments
            (id, type, entity_id, entity_name, entity_phone, category, reference_number,
             payment_method, bank_origin, amount_ves, amount_usd, bcv_rate_used,
             receipt_image_url, status, notes, created_at)
         VALUES (:id, \'driver_commission\', :entity_id, :entity_name, :entity_phone, :category,
             :reference_number, :payment_method, :bank_origin, :amount_ves, :amount_usd, :bcv_rate_used,
             :receipt_image_url, \'pendiente\', :notes, NOW())'
    );
    $stmt->execute([
        ':id' => $id,
        ':entity_id' => $driver['id'],
        ':entity_name' => $driver['name'],
        ':entity_phone' => $driver['phone'],
        ':category' => $driver['category'],
        ':reference_number' => (string) $body['referenceNumber'],
        ':payment_method' => (string) $body['paymentMethod'],
        ':bank_origin' => $body['bankOrigin'] ?? null,
        ':amount_ves' => (float) $body['amountVes'],
        ':amount_usd' => (float) $body['amountUsd'],
        ':bcv_rate_used' => (float) ($body['bcvRate'] ?? 0),
        ':receipt_image_url' => $body['receiptImageUrl'] ?? null,
        ':notes' => $body['notes'] ?? null,
    ]);

    DriverActivityLogger::log(
        $conn,
        $driver['id'],
        $driver['name'],
        'recharge_requested',
        'Billetera',
        'Comprobante de recarga enviado, pendiente de verificación (Ref: ' . $body['referenceNumber'] . ')'
    );

    // La recarga se abona a la billetera solo cuando el admin la verifica en payments.php.
    Response::success(['paymentId' => $id, 'status' => 'pendiente'], 201);
}

Response::error('Acción o método no soportado', 405);
