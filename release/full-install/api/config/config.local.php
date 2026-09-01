<?php
/**
 * Configuración real de producción (base de datos, API key, CORS).
 * Este archivo NO debe subirse a git ni compartirse públicamente.
 *
 * INSTRUCCIONES:
 * 1. Reemplaza db_name, db_user y db_pass con los datos de tu base MySQL
 *    (los mismos que usaste al crear la base en cPanel > Bases de datos MySQL).
 * 2. La api_key de abajo ya viene generada aleatoriamente; puedes dejarla tal cual
 *    o generar otra tú mismo. Debe ser la MISMA que configures en el panel admin
 *    (sección "Claves de API e interconexión").
 * 3. Ajusta allowed_origins si usas otro dominio/subdominio para el panel.
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'TU_BASE_MYSQL',
    'db_user' => 'TU_USUARIO_MYSQL',
    'db_pass' => 'TU_PASSWORD_MYSQL',

    // Clave que el frontend/admin debe enviar en el header "X-Api-Key"
    'api_key' => '93565e81dc5f02c2cd52bfc8022fb72eb4ac34cf8bff5e1466e3f46e6fe7c90d',

    // Orígenes permitidos para CORS (dominio de tu panel admin)
    'allowed_origins' => [
        'https://www.vhixy.site',
        'https://vhixy.site',
    ],
];
