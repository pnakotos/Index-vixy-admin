<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'php_version' => PHP_VERSION,
    'php_version_id' => PHP_VERSION_ID,
    'required_php_version' => '8.1.0',
    'compatible' => PHP_VERSION_ID >= 80100,
    'pdo_mysql' => extension_loaded('pdo_mysql'),
], JSON_UNESCAPED_UNICODE);
