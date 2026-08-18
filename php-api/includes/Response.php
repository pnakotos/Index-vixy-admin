<?php
/**
 * Helpers de respuesta JSON, CORS y verificación de API key.
 */

class Response
{
    public static function applyCors(): void
    {
        $config = require __DIR__ . '/../config/config.php';
        $allowedOrigins = $config['allowed_origins'] ?? [];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }

        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public static function requireApiKey(): void
    {
        $config = require __DIR__ . '/../config/config.php';
        $expected = $config['api_key'] ?? '';
        $provided = $_SERVER['HTTP_X_API_KEY'] ?? '';

        if ($expected === '' || !hash_equals($expected, $provided)) {
            self::error('No autorizado', 401);
        }
    }

    public static function requireAdminSession(PDO $conn, bool $allowReadOnly = false): array
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
                'httponly' => true,
                'samesite' => 'Strict',
            ]);
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? '';
        if ($userId === '') {
            self::error('Sesión administrativa requerida', 401);
        }

        $stmt = $conn->prepare('SELECT id, role, is_active FROM `backend_users` WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        if (!$user || (int) $user['is_active'] !== 1) {
            self::error('Sesión administrativa inválida', 401);
        }

        if (!$allowReadOnly && $user['role'] !== 'Super Admin') {
            self::error('No tienes permisos para gestionar usuarios', 403);
        }

        return $user;
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, int $status = 200): void
    {
        self::json(['success' => true, 'data' => $data], $status);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['success' => false, 'error' => $message], $status);
    }

    public static function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }
}
