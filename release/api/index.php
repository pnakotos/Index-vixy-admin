<?php
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'name' => 'Vixy Admin API',
    'status' => 'ok',
    'endpoints' => [
        '/api/auth.php?action=login', '/api/auth.php?action=logout', '/api/auth.php?action=me',
        '/api/drivers.php', '/api/clients.php', '/api/payments.php', '/api/emergencies.php',
        '/api/notifications.php', '/api/reviews.php', '/api/audit_logs.php',
        '/api/completed_services.php', '/api/users.php', '/api/system_config.php',
        '/api/branding_media.php', '/api/api_config.php', '/api/rides.php', '/api/version.php',
        '/api/driver_auth.php?action=register', '/api/driver_auth.php?action=login',
        '/api/driver_auth.php?action=me', '/api/driver_auth.php?action=logout',
        '/api/driver_auth.php?action=update_device_token', '/api/driver_activity_logs.php',
        '/api/wallet.php?action=summary', '/api/wallet.php?action=recharge',
    ],
]);
