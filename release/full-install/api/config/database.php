<?php
/**
 * Conexión PDO a MySQL/MariaDB. En cPanel el nombre suele incluir un prefijo.
 */

class Database
{
    private static $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $config = require __DIR__ . '/config.php';

        if (!extension_loaded('pdo_mysql')) {
            error_log('Vixy DB: la extensión pdo_mysql no está habilitada');
            self::fail('La extensión pdo_mysql no está habilitada en PHP');
        }

        foreach (['db_host', 'db_name', 'db_user', 'db_pass'] as $key) {
            if (!array_key_exists($key, $config) || $config[$key] === '') {
                error_log('Vixy DB: falta la configuración ' . $key);
                self::fail('Falta configuración de conexión MySQL: ' . $key);
            }
        }

        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            $config['db_host'],
            $config['db_name']
        );

        try {
            self::$instance = new PDO($dsn, $config['db_user'], $config['db_pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log(sprintf(
                'Vixy DB connection failed: host=%s db=%s user=%s error=%s',
                $config['db_host'],
                $config['db_name'],
                $config['db_user'],
                $e->getMessage()
            ));
            self::fail('No se pudo conectar a MySQL. Revisa db_name, db_user y db_pass');
        }

        return self::$instance;
    }

    private static function fail(string $message): void
    {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => $message]);
        exit;
    }
}
