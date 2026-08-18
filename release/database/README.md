# Base de Datos Vixy Admin (MySQL / phpMyAdmin)

Archivos SQL listos para importar en phpMyAdmin u otro gestor MySQL/MariaDB.

## Archivos

- `01_schema.sql` — Estructura vacía de la base.
- `03_remove_demo_records.sql` — Limpieza de registros demo heredados.
- `04_create_vixyman_admin.sql` — Crea el superusuario inicial `vixyman@vhixy.site`.
- `05_reset_vixyman_password.sql` — Restablece su clave temporal si el login devuelve 401.
- `06_add_backend_username.sql` — Agrega el usuario independiente del correo para el login del panel.
- `07_seed_single_row_config.sql` — Crea las filas únicas de configuración si faltan.
- `08_add_driver_auth_and_activity_logs.sql` — Agrega login propio de la app conductor (`password_hash`, `auth_token`, `device_token`) y la bitácora `driver_activity_logs`. Ejecutar una sola vez en instalaciones existentes; ya viene incluido en `01_schema.sql` para instalaciones nuevas.
- `09_add_driver_services.sql` — Agrega `driver_services` para que un conductor ofrezca varios servicios (moto/taxi/delivery) a la vez, migrando su `category` actual como servicio inicial. Ejecutar una sola vez en instalaciones existentes; ya viene incluido en `01_schema.sql` para instalaciones nuevas.
- `10_add_driver_wallet_transactions.sql` — Agrega `driver_wallet_transactions`, la billetera independiente por conductor (recargas, comisiones, ganancias, bonos) sincronizada con `drivers.balance_usd`. Ejecutar una sola vez en instalaciones existentes; ya viene incluido en `01_schema.sql` para instalaciones nuevas.


## Cómo importar en phpMyAdmin

1. En cPanel abre **Bases de datos MySQL** y crea una base con el prefijo que asigna tu hosting, por ejemplo `cpses_vhav72uuuz_vixy`.
2. Asígnale el usuario MySQL `cpses_vhav72uuuz` con todos los privilegios.
3. Entra a phpMyAdmin y selecciona esa base en el panel izquierdo.
4. Ve a **Importar**, selecciona `01_schema.sql` y pulsa **Continuar/Ir**.
5. La base queda deliberadamente sin perfiles, pagos, viajes, logs ni usuarios ficticios. Asegúrate de crear la base de datos manualmente.
6. Si ya importaste una versión anterior con datos de prueba, ejecuta `03_remove_demo_records.sql` una sola vez.
7. Verificado conceptualmente para MySQL 5.7+/8.0 y MariaDB 10.x; valida la importacion en tu servidor antes de produccion.

Si no tienes SSH, importa `04_create_vixyman_admin.sql` después del esquema. El usuario
será `vixyman@vhixy.site`, la clave temporal será `123456` y el cambio será obligatorio.

## Tablas incluidas

`drivers`, `driver_services`, `clients`, `payments`, `emergency_alerts`, `push_notifications`, `reviews`, `audit_logs`, `completed_services`, `backend_users`, `system_config`, `branding_media`, `api_interconnection_config`, `rides`, `ride_dispatch_attempts`, `ride_status_history`, `driver_notifications`, `driver_activity_logs`, `driver_wallet_transactions`.

## Notas de seguridad

