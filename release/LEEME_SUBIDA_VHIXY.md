# Publicacion en www.vhixy.site

## Opcion rapida: instalacion completa desde cero (recomendada si public_html quedo vacio)

Descomprime `vhixy-site-completo.zip` directamente dentro de `public_html/`. Ya trae
la estructura final correcta en un solo paso:

```
public_html/index.html
public_html/assets/...
public_html/.htaccess, _redirects, vercel.json
public_html/api/*.php
public_html/api/config/config.local.php   <- YA CREADO, solo edítalo (ver abajo)
public_html/api/config/, includes/, tools/, admin/
```

No dejes ninguna carpeta `frontend/` o `api/api/` intermedia: el contenido del zip
va directo dentro de `public_html/`.

Después de extraer, **edita `public_html/api/config/config.local.php`** y reemplaza
`db_name`, `db_user`, `db_pass` con los datos reales de tu base MySQL (creada en
cPanel > Bases de datos MySQL). El archivo ya trae una `api_key` aleatoria generada
y los orígenes CORS de `vhixy.site` precargados; solo cambia si usas otro dominio.

Si prefieres subir cada parte por separado, usa las opciones de abajo.

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
(Si usaste `vhixy-site-completo.zip`, este archivo ya viene creado — solo edítalo.)

## Base de datos

Importa `01_schema.sql` en phpMyAdmin, y luego `12_add_extended_payment_and_config_tables.sql`
(agrega tablas de métodos de pago adicionales, contacto/redes y tarifas por estado). La base
queda deliberadamente sin registros ficticios.

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
