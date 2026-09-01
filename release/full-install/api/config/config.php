<?php
/**
 * Carga la configuración de producción desde config.local.php (no versionado).
 */

$localConfigFile = __DIR__ . '/config.local.php';
$exampleConfigFile = __DIR__ . '/config.example.php';

if (file_exists($localConfigFile)) {
    $config = require $localConfigFile;
} else {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'error' => 'Falta configurar php-api/config/config.local.php',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

return $config;
