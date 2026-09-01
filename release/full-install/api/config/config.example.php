<?php
/**
 * Plantilla de configuración. Copia este archivo como "config.local.php"
 * en el mismo directorio y coloca allí tus credenciales reales.
 * "config.local.php" NO debe subirse a git ni compartirse públicamente.
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'TU_BASE_MYSQL',
    'db_user' => 'TU_USUARIO_MYSQL',
    'db_pass' => 'TU_PASSWORD_MYSQL',

    // Clave que el frontend/admin debe enviar en el header "X-Api-Key"
    'api_key' => 'CAMBIA_ESTA_CLAVE_POR_UNA_ALEATORIA_LARGA',

    // Orígenes permitidos para CORS (dominio de tu panel admin)
    'allowed_origins' => [
        'https://www.vhixy.site',
        'https://admin.vhixy.site',
        'https://vixy-pasajero.example.com',
    ],
];
