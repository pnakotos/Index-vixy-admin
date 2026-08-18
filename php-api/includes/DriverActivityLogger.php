<?php
/**
 * Bitácora de actividad del conductor: registra en la base de datos cada
 * acción realizada desde la app conductor (login, online/offline, viajes,
 * emergencias), para que el panel admin tenga trazabilidad completa.
 */

class DriverActivityLogger
{
    public static function log(
        PDO $conn,
        string $driverId,
        string $driverName,
        string $action,
        string $module = 'App Conductor',
        ?string $details = null,
        ?string $rideId = null,
        ?float $lat = null,
        ?float $lng = null
    ): void {
        $stmt = $conn->prepare(
            'INSERT INTO driver_activity_logs
                (driver_id, driver_name, action, module, ride_id, details, lat, lng, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $driverId,
            $driverName,
            $action,
            $module,
            $rideId,
            $details,
            $lat,
            $lng,
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    }
}
