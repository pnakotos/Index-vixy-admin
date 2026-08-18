# API PHP - Vixy Admin (para subir por FTP)

API REST en PHP puro (PDO + MySQL) que conecta con la base de datos MySQL creada en cPanel
creada en la carpeta [`database/`](../database). Compatible con hosting compartido
estándar (Apache + PHP 8.1.x + MySQL/MariaDB). PHP 8.1 es la versión objetivo del backend.

## Estructura

```
php-api/
  config/
    config.example.php   # plantilla de credenciales (copiar y renombrar)
    config.php            # exige config.local.php en el servidor
    database.php           # conexión PDO
    .htaccess              # bloquea acceso web directo a esta carpeta
  includes/
    Response.php           # helpers JSON, CORS y verificación de API key
    CrudHandler.php        # CRUD genérico reutilizado por los endpoints
    DriverActivityLogger.php # bitácora de cada acción de la app conductor
    bootstrap.php           # arranque común (errores, CORS, conexión)
  api/
    auth.php                # login / logout / sesión actual (backend_users)
    driver_auth.php          # login / registro / sesión propia de la app conductor (API key)
    drivers.php               # CRUD conductores (panel admin)
    clients.php                # CRUD clientes
    payments.php                 # CRUD pagos
    emergencies.php                # alertas de emergencia (POST con API key, resto con sesión admin)
    notifications.php               # CRUD notificaciones push
    reviews.php                       # CRUD reseñas
    audit_logs.php                     # solo lectura (bitácora admin)
    driver_activity_logs.php             # solo lectura (bitácora de la app conductor)
    completed_services.php                 # CRUD servicios/carreras completadas
    users.php                                # gestión de usuarios del panel
    system_config.php                         # configuración financiera (fila única)
    branding_media.php                          # branding/multimedia (fila única)
    api_config.php                               # interconexión con apps móviles (fila única)
    rides.php                                     # solicitudes, despacho y estados de viajes
  index.php                                         # health-check
  tools/create_admin.php                    # bootstrap CLI del primer administrador
  .htaccess
```

## Pasos para desplegar por FTP

1. **Crea la base desde cPanel** y asígnala al usuario MySQL. Selecciona esa base
  en phpMyAdmin e importa únicamente `database/01_schema.sql`. El archivo no intenta
  ejecutar `CREATE DATABASE` ni `USE`, porque el nombre real suele llevar un prefijo
  del hosting. La base queda deliberadamente sin registros ni perfiles de demostración.
2. Copia `php-api/config/config.example.php` a `php-api/config/config.local.php`
   y coloca allí:
   - Usuario/contraseña reales de tu base de datos MySQL del hosting.
   - Una `api_key` aleatoria y larga (por ejemplo generada con `openssl rand -hex 32`).
   - Los dominios permitidos en `allowed_origins` (el dominio donde vive tu panel admin).
3. Sube por FTP el contenido de `php-api/` a `public_html/api/`. Crea
  `public_html/api/config/config.local.php` directamente en el servidor; este
  archivo nunca debe ir a git.
4. Verifica que `php-api/config/` tenga el `.htaccess` con `Require all denied`
   subido correctamente (protege las credenciales de acceso web directo).
5. Prueba abriendo `https://www.vhixy.site/api/` — debe responder un JSON con
   `"status": "ok"`.
6. Selecciona PHP **8.1.x** en **MultiPHP Manager**. La API rechaza versiones
  anteriores a PHP 8.1 y responde con un JSON explicativo.
7. Desde el frontend, todas las peticiones a `/api/*.php` (excepto `auth.php`)
   deben incluir el header `X-Api-Key: <la clave configurada>`.

Después de seleccionar PHP 8.1, abre `https://www.vhixy.site/api/version.php`.
Debe mostrar `compatible: true`, `php_version_id` 80100 o superior y `pdo_mysql: true`.

## Autenticación

  → valida contra `backend_users` con `password_verify()` y crea una sesión PHP
  (cookie `httponly` + `secure`, requiere HTTPS).
  (bcrypt), nunca en texto plano.

## Notas de seguridad

  conectarse usando las credenciales de ejemplo.

## Crear el primer administrador

Con `backend_users` vacío, ejecuta en SSH o terminal del servidor, nunca desde el
navegador:

```bash
cd public_html/api/tools
php create_admin.php admin@vhixy.site "Administrador principal"
```

El script solicita una contraseña de mínimo 12 caracteres, genera el hash con
`password_hash()` y se detiene si ya existe cualquier administrador.

## Diagnóstico despues de subir

```bash
curl -i https://www.vhixy.site/api/
curl -i -H 'Origin: https://www.vhixy.site' \
  -H 'X-Api-Key: CLAVE_REAL' \
  'https://www.vhixy.site/api/rides.php?action=get&id=ride-inexistente'
```

Resultados esperados:

- `/api/` devuelve JSON con `"status":"ok"`.
- `rides.php` devuelve JSON, incluso si el viaje no existe.
- HTML en vez de JSON indica una regla de Apache o una ubicación incorrecta.
- `401` indica una API key ausente o distinta.
- `500` indica `config.local.php`, PDO/MySQL o el esquema pendiente.

Si aparece `No se pudo conectar a la base de datos`, revisa en cPanel **Bases de datos
MySQL** el nombre completo de la base y del usuario. En `config.local.php` deben ser
exactamente los valores prefijados por cPanel, por ejemplo:

```php
'db_host' => 'localhost',
'db_name' => 'cpses_vhav72uuuz_vixy',
'db_user' => 'cpses_vhav72uuuz',
'db_pass' => 'LA_CONTRASENA_DEL_USUARIO_MYSQL',
```

El usuario debe estar asignado a la base con **Todos los privilegios**. Comprueba
también que `config.local.php` esté exactamente en `public_html/api/config/`, que
`pdo_mysql` esté habilitado y que hayas importado `01_schema.sql` seleccionando esa
misma base. La causa detallada se escribe en el `error_log` de PHP del hosting sin
mostrarse al navegador.
