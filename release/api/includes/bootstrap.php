<?php
/**
 * Arranque común para todos los endpoints: errores, CORS y conexión a BD.
 */

declare(strict_types=1);

if (PHP_VERSION_ID < 80100) {
	http_response_code(500);
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode([
		'success' => false,
		'error' => 'Esta API requiere PHP 8.1 o superior. Version actual: ' . PHP_VERSION,
	], JSON_UNESCAPED_UNICODE);
	exit;
}

error_reporting(E_ALL);
ini_set('display_errors', '0'); // nunca mostrar errores PHP crudos al cliente

register_shutdown_function(static function (): void {
	$error = error_get_last();
	if (!$error || !in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE], true)) {
		return;
	}

	error_log(sprintf('Vixy PHP fatal: %s in %s:%d', $error['message'], $error['file'], $error['line']));
	if (!headers_sent()) {
		http_response_code(500);
		header('Content-Type: application/json; charset=utf-8');
	}
	echo json_encode(['success' => false, 'error' => 'Error interno del servidor. Revisa el error_log de PHP.']);
});

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/CrudHandler.php';
require_once __DIR__ . '/DriverActivityLogger.php';

Response::applyCors();

require_once __DIR__ . '/../config/database.php';

$conn = Database::getConnection();
