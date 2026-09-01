<?php
/**
 * Billetera (wallet) independiente por conductor: aplica un movimiento de
 * saldo y dejar el historial en `driver_wallet_transactions`, manteniendo
 * `drivers.balance_usd` siempre consistente con la suma de sus movimientos.
 */

class WalletLedger
{
    public static function applyTransaction(
        PDO $conn,
        string $driverId,
        string $type,
        float $amountUsd,
        ?string $description = null,
        ?string $rideId = null,
        ?string $paymentId = null,
        ?float $amountVes = null,
        ?float $bcvRate = null,
        ?string $method = null,
        ?string $referenceNumber = null
    ): float {
        $driverStmt = $conn->prepare('SELECT balance_usd FROM drivers WHERE id = ? FOR UPDATE');
        $driverStmt->execute([$driverId]);
        $driver = $driverStmt->fetch();
        if (!$driver) {
            throw new RuntimeException('Conductor no encontrado para aplicar movimiento de billetera');
        }

        $newBalance = round((float) $driver['balance_usd'] + $amountUsd, 2);
        $conn->prepare('UPDATE drivers SET balance_usd = ? WHERE id = ?')->execute([$newBalance, $driverId]);

        $id = 'wtx-' . bin2hex(random_bytes(10));
        $stmt = $conn->prepare(
            'INSERT INTO driver_wallet_transactions
                (id, driver_id, type, amount_usd, amount_ves, bcv_rate_used, method,
                 reference_number, ride_id, payment_id, description, status, balance_after_usd)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'completed\', ?)'
        );
        $stmt->execute([
            $id, $driverId, $type, $amountUsd, $amountVes, $bcvRate, $method,
            $referenceNumber, $rideId, $paymentId, $description, $newBalance,
        ]);

        return $newBalance;
    }
}
