<?php
require_once __DIR__ . '/../includes/bootstrap.php';
Response::requireApiKey();

$action = $_GET['action'] ?? 'get';

function rideId(): string
{
    return 'ride-' . bin2hex(random_bytes(10));
}

function requireFields(array $body, array $fields): void
{
    foreach ($fields as $field) {
        if (!array_key_exists($field, $body) || $body[$field] === '') {
            Response::error('Falta el campo requerido: ' . $field, 422);
        }
    }
}

function passengerCategory(string $category): string
{
    $allowed = ['moto', 'auto', 'delivery'];
    if (!in_array($category, $allowed, true)) {
        Response::error('Categoría de viaje inválida', 422);
    }
    return $category;
}

function driverCategory(string $category): string
{
    return $category === 'moto' ? 'mototaxi' : ($category === 'auto' ? 'taxi' : 'delivery');
}

function addRideHistory(PDO $conn, string $rideId, string $status, string $actorType, ?string $actorId, ?string $details = null): void
{
    $stmt = $conn->prepare(
        'INSERT INTO ride_status_history (ride_id, status, actor_type, actor_id, details) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->execute([$rideId, $status, $actorType, $actorId, $details]);
}

function dispatchNextDriver(PDO $conn, string $rideId): ?array
{
    $rideStmt = $conn->prepare('SELECT * FROM rides WHERE id = ? FOR UPDATE');
    $rideStmt->execute([$rideId]);
    $ride = $rideStmt->fetch();
    if (!$ride || in_array($ride['status'], ['cancelled', 'completed'], true)) {
        return null;
    }

    $category = driverCategory($ride['category']);
    $driverStmt = $conn->prepare(
        "SELECT d.id, d.name, d.phone, d.category, d.lat, d.lng,
            (6371 * 2 * ASIN(SQRT(
                POW(SIN(RADIANS(d.lat - ?) / 2), 2) +
                COS(RADIANS(?)) * COS(RADIANS(d.lat)) *
                POW(SIN(RADIANS(d.lng - ?) / 2), 2)
            ))) AS distance_km
         FROM drivers d
         INNER JOIN driver_services ds ON ds.driver_id = d.id AND ds.service_type = ?
         WHERE d.status = 'activo' AND d.is_online = 1
           AND NOT EXISTS (
             SELECT 1 FROM ride_dispatch_attempts a
             WHERE a.ride_id = ? AND a.driver_id = d.id
           )
         ORDER BY distance_km ASC
         LIMIT 1
         FOR UPDATE"
    );
    $driverStmt->execute([
        $ride['pickup_lat'],
        $ride['pickup_lat'],
        $ride['pickup_lng'],
        $category,
        $rideId,
    ]);
    $driver = $driverStmt->fetch();
    if (!$driver) {
        $conn->prepare("UPDATE rides SET status = 'searching', assigned_driver_id = NULL, assigned_at = NULL WHERE id = ?")
            ->execute([$rideId]);
        return null;
    }

    $attemptStmt = $conn->prepare(
        'INSERT INTO ride_dispatch_attempts (ride_id, driver_id, distance_km) VALUES (?, ?, ?)'
    );
    $attemptStmt->execute([$rideId, $driver['id'], $driver['distance_km']]);

    $conn->prepare(
        "UPDATE rides SET status = 'driver_assigned', assigned_driver_id = ?, assigned_at = NOW() WHERE id = ?"
    )->execute([$driver['id'], $rideId]);

    $payload = json_encode([
        'rideId' => $rideId,
        'category' => $ride['category'],
        'pickupAddress' => $ride['pickup_address'],
        'dropoffAddress' => $ride['dropoff_address'],
        'pickupCoords' => [(float) $ride['pickup_lat'], (float) $ride['pickup_lng']],
        'dropoffCoords' => [(float) $ride['dropoff_lat'], (float) $ride['dropoff_lng']],
        'priceUsd' => (float) $ride['price_usd'],
        'priceVes' => (float) $ride['price_ves'],
        'distanceKm' => (float) $ride['distance_km'],
        'durationMins' => (float) $ride['duration_mins'],
    ], JSON_UNESCAPED_UNICODE);
    $conn->prepare(
        'INSERT INTO driver_notifications (driver_id, ride_id, payload) VALUES (?, ?, ?)'
    )->execute([$driver['id'], $rideId, $payload]);

    return $driver;
}

function driverName(PDO $conn, string $driverId): string
{
    $stmt = $conn->prepare('SELECT name FROM drivers WHERE id = ? LIMIT 1');
    $stmt->execute([$driverId]);
    $row = $stmt->fetch();
    return $row['name'] ?? $driverId;
}

function completeRideFinancials(PDO $conn, array $ride): void
{
    if (empty($ride['assigned_driver_id'])) {
        return;
    }

    $driverStmt = $conn->prepare('SELECT * FROM drivers WHERE id = ? FOR UPDATE');
    $driverStmt->execute([$ride['assigned_driver_id']]);
    $driver = $driverStmt->fetch();
    if (!$driver) {
        return;
    }

    $configStmt = $conn->query('SELECT commission_percent FROM system_config WHERE id = 1 LIMIT 1');
    $commissionPercent = (float) ($configStmt->fetch()['commission_percent'] ?? 0);

    $fareUsd = (float) $ride['price_usd'];
    $fareVes = (float) $ride['price_ves'];
    $commissionUsd = round($fareUsd * $commissionPercent / 100, 2);
    $commissionVes = round($fareVes * $commissionPercent / 100, 2);
    $driverEarningsUsd = round($fareUsd - $commissionUsd, 2);

    $clientName = $ride['passenger_user_id'];
    $clientPhone = '';
    if (!empty($ride['client_id'])) {
        $clientStmt = $conn->prepare('SELECT name, phone FROM clients WHERE id = ? LIMIT 1');
        $clientStmt->execute([$ride['client_id']]);
        $client = $clientStmt->fetch();
        if ($client) {
            $clientName = $client['name'];
            $clientPhone = $client['phone'];
        }
    }

    $paymentMethodMap = [
        'efectivo' => 'Efectivo', 'pago_movil' => 'Pago Móvil', 'zelle' => 'Zelle', 'saldo_vixy' => 'Saldo Vixy',
    ];
    $paymentMethod = $paymentMethodMap[strtolower((string) $ride['payment_method'])] ?? 'Efectivo';

    $conn->prepare(
        'INSERT INTO completed_services
            (id, service_date, service_time, driver_id, driver_name, driver_category,
             client_id, client_name, client_phone, origin, destination, fare_usd, fare_ves,
             commission_percent, commission_usd, commission_ves, driver_earnings_usd, payment_method, status)
         VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'completado\')'
    )->execute([
        'srv-' . bin2hex(random_bytes(8)),
        $driver['id'], $driver['name'], $driver['category'],
        $ride['client_id'] ?: $ride['passenger_user_id'], $clientName, $clientPhone,
        $ride['pickup_address'], $ride['dropoff_address'], $fareUsd, $fareVes,
        $commissionPercent, $commissionUsd, $commissionVes, $driverEarningsUsd, $paymentMethod,
    ]);

    $conn->prepare('UPDATE drivers SET completed_trips = completed_trips + 1 WHERE id = ?')
        ->execute([$driver['id']]);

    if ($commissionUsd > 0) {
        WalletLedger::applyTransaction(
            $conn,
            $driver['id'],
            'commission_fee',
            -$commissionUsd,
            'Comisión (' . $commissionPercent . '%) del viaje ' . $ride['id'],
            $ride['id'],
            null,
            -$commissionVes,
            null,
            'system'
        );
    }
}

function getRide(PDO $conn, string $rideId): void
{
    $stmt = $conn->prepare(
        'SELECT r.*, d.name AS driver_name, d.phone AS driver_phone, d.category AS driver_category,
            d.lat AS driver_lat, d.lng AS driver_lng
         FROM rides r LEFT JOIN drivers d ON d.id = r.assigned_driver_id WHERE r.id = ?'
    );
    $stmt->execute([$rideId]);
    $ride = $stmt->fetch();
    $ride ? Response::success($ride) : Response::error('Viaje no encontrado', 404);
}

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = Response::getJsonBody();
    requireFields($body, [
        'userId', 'category', 'pickupAddress', 'dropoffAddress', 'pickupCoords', 'dropoffCoords',
        'priceUsd', 'priceVes', 'paymentMethod',
    ]);
    if (!is_array($body['pickupCoords']) || count($body['pickupCoords']) !== 2 ||
        !is_array($body['dropoffCoords']) || count($body['dropoffCoords']) !== 2) {
        Response::error('Las coordenadas deben ser [latitud, longitud]', 422);
    }

    $rideId = $body['id'] ?? rideId();
    $category = passengerCategory((string) $body['category']);
    $conn->beginTransaction();
    try {
        $stmt = $conn->prepare(
            'INSERT INTO rides
            (id, passenger_user_id, client_id, category, pickup_address, dropoff_address,
             pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, distance_km, duration_mins,
             price_usd, price_ves, payment_method, payment_reference, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'searching\')'
        );
        $stmt->execute([
            $rideId, (string) $body['userId'], $body['clientId'] ?? null, $category,
            (string) $body['pickupAddress'], (string) $body['dropoffAddress'],
            (float) $body['pickupCoords'][0], (float) $body['pickupCoords'][1],
            (float) $body['dropoffCoords'][0], (float) $body['dropoffCoords'][1],
            (float) ($body['distanceKm'] ?? 0), (float) ($body['durationMins'] ?? 0),
            (float) $body['priceUsd'], (float) $body['priceVes'], (string) $body['paymentMethod'],
            $body['paymentReference'] ?? null, $body['notes'] ?? null,
        ]);
        addRideHistory($conn, $rideId, 'searching', 'passenger', (string) $body['userId']);
        $driver = dispatchNextDriver($conn, $rideId);
        if ($driver) {
            addRideHistory($conn, $rideId, 'driver_assigned', 'system', $driver['id'], 'Oferta enviada al conductor más cercano');
        }
        $conn->commit();
    } catch (Throwable $error) {
        if ($conn->inTransaction()) $conn->rollBack();
        Response::error('No se pudo registrar la solicitud de viaje', 500);
    }
    getRide($conn, $rideId);
}

if ($action === 'respond' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = Response::getJsonBody();
    requireFields($body, ['rideId', 'driverId', 'response']);
    if (!in_array($body['response'], ['accepted', 'rejected'], true)) {
        Response::error('La respuesta debe ser accepted o rejected', 422);
    }

    $conn->beginTransaction();
    try {
        $attemptStmt = $conn->prepare(
            'SELECT a.*, r.status AS ride_status FROM ride_dispatch_attempts a
             INNER JOIN rides r ON r.id = a.ride_id
             WHERE a.ride_id = ? AND a.driver_id = ? FOR UPDATE'
        );
        $attemptStmt->execute([(string) $body['rideId'], (string) $body['driverId']]);
        $attempt = $attemptStmt->fetch();
        if (!$attempt || $attempt['status'] !== 'offered') {
            $conn->rollBack();
            Response::error('La oferta ya no está disponible', 409);
        }

        $newStatus = $body['response'] === 'accepted' ? 'accepted' : 'rejected';
        $conn->prepare(
            'UPDATE ride_dispatch_attempts SET status = ?, rejection_reason = ?, responded_at = NOW() WHERE id = ?'
        )->execute([$newStatus, $body['reason'] ?? null, $attempt['id']]);

        if ($newStatus === 'accepted') {
            $assignment = $conn->prepare(
                "UPDATE rides SET status = 'driver_assigned', assigned_driver_id = ?, assigned_at = NOW() WHERE id = ? AND status = 'driver_assigned' AND assigned_driver_id = ?"
            );
            $assignment->execute([$body['driverId'], $body['rideId'], $body['driverId']]);
            if ($assignment->rowCount() !== 1) {
                $conn->rollBack();
                Response::error('El viaje ya fue aceptado por otro conductor', 409);
            }
            $conn->prepare(
                "UPDATE ride_dispatch_attempts SET status = 'expired', responded_at = NOW(), rejection_reason = 'Viaje asignado a otro conductor' WHERE ride_id = ? AND status = 'offered' AND driver_id <> ?"
            )->execute([$body['rideId'], $body['driverId']]);
            addRideHistory($conn, (string) $body['rideId'], 'driver_assigned', 'driver', (string) $body['driverId'], 'Oferta aceptada');
        } else {
            $conn->prepare("UPDATE rides SET status = 'searching', assigned_driver_id = NULL, assigned_at = NULL WHERE id = ?")
                ->execute([(string) $body['rideId']]);
            addRideHistory($conn, (string) $body['rideId'], 'searching', 'driver', (string) $body['driverId'], 'Oferta rechazada: ' . ($body['reason'] ?? 'Sin motivo'));
            dispatchNextDriver($conn, (string) $body['rideId']);
        }
        $conn->commit();
    } catch (Throwable $error) {
        if ($conn->inTransaction()) $conn->rollBack();
        Response::error('No se pudo registrar la respuesta del conductor', 500);
    }
    DriverActivityLogger::log(
        $conn,
        (string) $body['driverId'],
        driverName($conn, (string) $body['driverId']),
        $newStatus === 'accepted' ? 'ride_accepted' : 'ride_rejected',
        'Viajes',
        $newStatus === 'accepted' ? 'Viaje aceptado' : ('Viaje rechazado: ' . ($body['reason'] ?? 'Sin motivo')),
        (string) $body['rideId']
    );
    getRide($conn, (string) $body['rideId']);
}

if ($action === 'notifications' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $driverId = $_GET['driver_id'] ?? '';
    if ($driverId === '') Response::error('Falta driver_id', 422);
    $stmt = $conn->prepare(
        'SELECT n.id, n.ride_id, n.payload, n.created_at FROM driver_notifications n
         INNER JOIN ride_dispatch_attempts a ON a.ride_id = n.ride_id AND a.driver_id = n.driver_id
         WHERE n.driver_id = ? AND n.read_at IS NULL AND a.status = \'offered\'
         ORDER BY n.created_at ASC LIMIT 20'
    );
    $stmt->execute([$driverId]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) $row['payload'] = json_decode($row['payload'], true);
    Response::success($rows);
}

if ($action === 'acknowledge' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = Response::getJsonBody();
    requireFields($body, ['notificationId', 'driverId']);
    $stmt = $conn->prepare(
        'UPDATE driver_notifications SET read_at = NOW() WHERE id = ? AND driver_id = ?'
    );
    $stmt->execute([(int) $body['notificationId'], (string) $body['driverId']]);
    Response::success(['acknowledged' => $stmt->rowCount() > 0]);
}

if ($action === 'status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = Response::getJsonBody();
    requireFields($body, ['rideId', 'status', 'actorType']);
    $allowedStatuses = ['driver_arriving', 'in_trip', 'completed', 'cancelled'];
    $allowedActors = ['passenger', 'driver', 'admin', 'system'];
    if (!in_array($body['status'], $allowedStatuses, true) || !in_array($body['actorType'], $allowedActors, true)) {
        Response::error('Estado o actor inválido', 422);
    }

    $conn->beginTransaction();
    try {
        $rideStmt = $conn->prepare('SELECT * FROM rides WHERE id = ? FOR UPDATE');
        $rideStmt->execute([(string) $body['rideId']]);
        $ride = $rideStmt->fetch();
        if (!$ride) {
            $conn->rollBack();
            Response::error('Viaje no encontrado', 404);
        }
        $timestamps = $body['status'] === 'completed'
            ? ', completed_at = NOW()'
            : ($body['status'] === 'cancelled' ? ', cancelled_at = NOW()' : '');
        $conn->prepare("UPDATE rides SET status = ?, updated_at = NOW(){$timestamps} WHERE id = ?")
            ->execute([$body['status'], (string) $body['rideId']]);
        addRideHistory(
            $conn,
            (string) $body['rideId'],
            (string) $body['status'],
            (string) $body['actorType'],
            isset($body['actorId']) ? (string) $body['actorId'] : null,
            isset($body['details']) ? (string) $body['details'] : null
        );
        if ($body['status'] === 'completed' && $ride['status'] !== 'completed') {
            completeRideFinancials($conn, $ride);
        }
        $conn->commit();
    } catch (Throwable $error) {
        if ($conn->inTransaction()) $conn->rollBack();
        Response::error('No se pudo actualizar el estado del viaje', 500);
    }
    if ($body['actorType'] === 'driver' && !empty($body['actorId'])) {
        DriverActivityLogger::log(
            $conn,
            (string) $body['actorId'],
            driverName($conn, (string) $body['actorId']),
            'ride_status_' . $body['status'],
            'Viajes',
            isset($body['details']) ? (string) $body['details'] : null,
            (string) $body['rideId']
        );
    }
    getRide($conn, (string) $body['rideId']);
}

if ($action === 'location' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = Response::getJsonBody();
    requireFields($body, ['driverId', 'lat', 'lng']);

    $onlineChanged = false;
    if (array_key_exists('isOnline', $body) && $body['isOnline'] !== null) {
        $current = $conn->prepare('SELECT is_online FROM drivers WHERE id = ? LIMIT 1');
        $current->execute([(string) $body['driverId']]);
        $row = $current->fetch();
        $onlineChanged = $row && (int) $row['is_online'] !== (int) (bool) $body['isOnline'];
    }

    $stmt = $conn->prepare(
        "UPDATE drivers SET lat = ?, lng = ?, is_online = COALESCE(?, is_online), last_active = NOW() WHERE id = ?"
    );
    $stmt->execute([(float) $body['lat'], (float) $body['lng'], $body['isOnline'] ?? null, (string) $body['driverId']]);

    $conn->prepare(
        'INSERT INTO driver_location_history
            (driver_id, lat, lng, location_name, is_online, ride_id)
         VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([
        (string) $body['driverId'], (float) $body['lat'], (float) $body['lng'],
        $body['locationName'] ?? null,
        array_key_exists('isOnline', $body) ? (int) (bool) $body['isOnline'] : null,
        $body['rideId'] ?? null,
    ]);

    DriverActivityLogger::log(
        $conn, (string) $body['driverId'], driverName($conn, (string) $body['driverId']),
        'location_update', 'GPS', 'Posición GPS actualizada', $body['rideId'] ?? null,
        (float) $body['lat'], (float) $body['lng']
    );

    if ($onlineChanged) {
        DriverActivityLogger::log(
            $conn,
            (string) $body['driverId'],
            driverName($conn, (string) $body['driverId']),
            !empty($body['isOnline']) ? 'online' : 'offline',
            'Sesión',
            null,
            null,
            (float) $body['lat'],
            (float) $body['lng']
        );
    }

    Response::success(['driverId' => $body['driverId'], 'updated' => $stmt->rowCount() > 0]);
}

if ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $rideId = $_GET['id'] ?? '';
    if ($rideId === '') Response::error('Falta id', 422);
    getRide($conn, $rideId);
}

Response::error('Acción o método no permitido', 405);
