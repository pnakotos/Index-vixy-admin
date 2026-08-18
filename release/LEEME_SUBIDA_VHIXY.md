# Publicacion en www.vhixy.site

## Frontend

Descomprime `vhixy-site-frontend.zip` directamente dentro de `public_html/`.
No dejes una carpeta `frontend` intermedia.

## API

Crea `public_html/api/` y descomprime `vhixy-site-api.zip` dentro de esa carpeta.
Los endpoints deben quedar directamente en `public_html/api/`, por ejemplo:

`public_html/api/rides.php`

La URL publica sera:

`https://www.vhixy.site/api/rides.php`

## Configuracion obligatoria

Crea manualmente `public_html/api/config/config.local.php` usando `config.example.php` como plantilla. Completa usuario, password, nombre de base de datos, API key y origenes permitidos. La API no usa credenciales de ejemplo: si falta este archivo responde HTTP 500.

## Base de datos

Importa únicamente `01_schema.sql` en phpMyAdmin. La base queda deliberadamente sin registros ficticios.

## Comprobaciones

1. `https://www.vhixy.site/` debe mostrar el panel.
2. `https://www.vhixy.site/api/` debe devolver JSON con estado `ok`.
3. Una llamada a `rides.php` debe devolver JSON, nunca `index.html`.
4. Revisa que PHP tenga `pdo_mysql` habilitado.

5. Abre `https://www.vhixy.site/api/version.php`. Debe indicar PHP 8.1 o superior,
   `compatible: true` y `pdo_mysql: true`.

## Primer administrador

Con la tabla `backend_users` vacía, ejecuta por SSH:

`cd public_html/api/tools && php create_admin.php admin@vhixy.site "Administrador principal"`

El comando solicita una contraseña de mínimo 12 caracteres y solo funciona si todavía no existe un administrador.

Sin SSH: selecciona la base en phpMyAdmin e importa `04_create_vixyman_admin.sql`.
Después inicia sesión con `vixyman@vhixy.site` y la clave temporal `123456`.

Si el login devuelve `Credenciales inválidas`, selecciona la base correcta en
phpMyAdmin e importa `05_reset_vixyman_password.sql`. Luego usa `vixyman` o
`vixyman@vhixy.site` con la clave temporal `123456` y cambia la contraseña al entrar.

El panel administrativo actual conserva parte de su estado local en el navegador. El endpoint PHP de viajes esta preparado para la integracion con las apps pasajero/conductor, pero el panel completo requiere conectar sus acciones CRUD a los endpoints antes de considerarlo una consola multiusuario de produccion.
