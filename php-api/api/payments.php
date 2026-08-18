<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireAdminSession($conn, $_SERVER['REQUEST_METHOD'] === 'GET');

$allowedColumns = [
    'id', 'type', 'entity_id', 'entity_name', 'entity_phone', 'category',
    'reference_number', 'payment_method', 'bank_origin', 'amount_ves', 'amount_usd',
    'bcv_rate_used', 'receipt_image_url', 'status', 'verified_by', 'verified_at',
    'notes', 'created_at',
];

// Verificar una recarga de conductor abona su billetera de forma atómica;
// el resto de las transiciones (rechazo, edición) usan el CRUD genérico.
if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'PATCH'], true)) {
    $id = $_GET['id'] ?? null;
    $body = Response::getJsonBody();

    if ($id && ($body['status'] ?? null) === 'verificado') {
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare('SELECT * FROM payments WHERE id = ? FOR UPDATE');
            $stmt->execute([$id]);
            $payment = $stmt->fetch();
            if (!$payment) {
                $conn->rollBack();
                Response::error('Pago no encontrado', 404);
            }
            if ($payment['status'] !== 'verificado') {
                $conn->prepare(
                    'UPDATE payments SET status = \'verificado\', verified_by = ?, verified_at = NOW(),
                        notes = COALESCE(?, notes) WHERE id = ?'
                )->execute([$body['verified_by'] ?? null, $body['notes'] ?? null, $id]);

                if ($payment['type'] === 'driver_commission') {
                    WalletLedger::applyTransaction(
                        $conn,
                        $payment['entity_id'],
                        'recharge',
                        (float) $payment['amount_usd'],
                        'Recarga verificada (Ref: ' . $payment['reference_number'] . ')',
                        null,
                        $id,
                        (float) $payment['amount_ves'],
                        (float) $payment['bcv_rate_used'],
                        $payment['payment_method'],
                        $payment['reference_number']
                    );
                    DriverActivityLogger::log(
                        $conn,
                        $payment['entity_id'],
                        $payment['entity_name'],
                        'wallet_recharge_verified',
                        'Billetera',
                        'Recarga de $' . $payment['amount_usd'] . ' verificada por el panel admin'
                    );
                }
            }
            $conn->commit();
        } catch (Throwable $error) {
            if ($conn->inTransaction()) $conn->rollBack();
            Response::error('No se pudo verificar el pago', 500);
        }

        $stmt = $conn->prepare('SELECT * FROM payments WHERE id = ?');
        $stmt->execute([$id]);
        Response::success($stmt->fetch());
    }
}

$handler = new CrudHandler($conn, 'payments', 'id', $allowedColumns, 'pay');

$handler->handle();
