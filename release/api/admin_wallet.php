<?php
require_once __DIR__ . '/../includes/bootstrap.php';
$admin = Response::requireAdminSession($conn, false);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') Response::error('Método no permitido', 405);
$body = Response::getJsonBody();
$driverId = (string) ($body['driverId'] ?? '');
$amountUsd = (float) ($body['amountUsd'] ?? 0);
if ($driverId === '' || $amountUsd == 0.0) Response::error('driverId y amountUsd son obligatorios', 422);
$conn->beginTransaction();
try {
    $balance = WalletLedger::applyTransaction(
        $conn, $driverId, 'adjustment', $amountUsd,
        (string) ($body['description'] ?? 'Ajuste administrativo de wallet'),
        null, null, null, null, 'system', null
    );
    $conn->commit();
} catch (Throwable $error) {
    if ($conn->inTransaction()) $conn->rollBack();
    Response::error('No se pudo aplicar el ajuste de wallet', 422);
}
Response::success(['driverId' => $driverId, 'balanceUsd' => $balance, 'adminId' => $admin['id']]);