# Implementacion Vixy Conductor + Admin

## 1. Orden de despliegue

Usar la misma base de datos MySQL para el panel y la app conductor.

1. Respaldar la base de datos.
2. Importar `database/01_schema.sql` del repositorio admin si es una instalacion nueva.
3. Ejecutar `database/11_add_realtime_tracking.sql` del admin.
4. Importar `database/schema.sql` del repositorio `vixy-conductor`.
5. Ejecutar `database/02_add_realtime_driver_state.sql` del repositorio `vixy-conductor`.
6. Verificar que existan las tablas `drivers`, `rides`, `driver_location_history`, `vixy_drivers`, `vixy_trips`, `vixy_wallet_transactions`, `vixy_driver_locations`, `vixy_emergency_alerts` y `vixy_trip_events`.

No ejecutar una migracion destructiva ni borrar datos existentes.

## 2. Configuracion PHP

En el servidor crear `php-api/config/config.local.php` a partir de `php-api/config/config.example.php` y completar:

- `db_host`
- `db_name`
- `db_user`
- `db_pass`
- `api_key`
- `allowed_origins`

En el repositorio conductor, crear `php-api/.env` a partir de `php-api/.env.example` y completar:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `VIXY_INTERCONNECTION_KEY`
- `VIXY_ALLOWED_ORIGINS`

La clave de interconexion debe ser la misma para la app conductor y el backend conductor. No subir estos archivos a Git.

## 3. Prueba backend

Desde una maquina con acceso al servidor:

```bash
curl -i https://www.vhixy.site/php-api/api/health.php
```

Crear un conductor desde la app y comprobar:

```sql
SELECT id, cedula, full_name, is_approved, created_at
FROM vixy_drivers
ORDER BY id DESC
LIMIT 1;
```

Aprobarlo desde el panel y verificar que `is_approved = 1`.

## 4. Prueba de GPS

Con el conductor autenticado y conectado:

```sql
SELECT driver_id, lat, lng, is_online, recorded_at
FROM vixy_driver_locations
ORDER BY recorded_at DESC
LIMIT 10;
```

El panel debe reflejar la posicion en un maximo aproximado de 3 segundos por ciclo de polling.

## 5. Prueba de viajes

Verificar el flujo completo:

1. La app pasajero crea una fila en `vixy_trips` con `status = 'offered'`.
2. La app conductor recibe la oferta mediante polling de 3 segundos.
3. Aceptar y comprobar `driver_id`, `status = 'accepted'` y `accepted_at`.
4. Cambiar cada estado desde la app.
5. Confirmar los estados en `vixy_trips`.
6. Confirmar eventos de rechazo o cancelacion en `vixy_trip_events`.
7. Al completar, comprobar `completed_at`, comision y ledger.

## 6. Prueba de wallet y pagos

1. Enviar una recarga desde la app.
2. Confirmar que aparezca como `pending` en `vixy_wallet_transactions`.
3. Verificarla desde el flujo administrativo correspondiente.
4. Confirmar que el saldo solo incluya transacciones `completed`.
5. Completar un viaje y comprobar el movimiento `commission_fee`.

## 7. Prueba de emergencia

Activar SOS, robo o accidente desde la app y verificar:

```sql
SELECT id, driver_id, type, lat, lng, status, created_at
FROM vixy_emergency_alerts
ORDER BY created_at DESC
LIMIT 10;
```

La alerta debe aparecer en el panel mediante `admin_conductor_realtime.php`.

## 8. Validacion local antes de subir

En `Index-vixy-admin`:

```bash
npm install
npm run lint
npm run build
php -l php-api/api/admin_conductor_realtime.php
php -l php-api/api/admin_realtime.php
php -l php-api/api/admin_wallet.php
```

En `vixy-conductor`:

```bash
npm install
npm run lint
npm run build
npm run android:sync
php -l php-api/api/drivers/auth.php
php -l php-api/api/drivers/location.php
php -l php-api/api/emergencies/create.php
php -l php-api/api/trips/reject.php
php -l php-api/api/wallet/summary.php
```

## 9. Commit y push

Revisar primero `git status` y no agregar secretos:

```bash
cd /workspaces/Index-vixy-admin
git add database php-api release src IMPLEMENTACION_CONDUCTOR_ADMIN.md
git diff --cached --check
git commit -m "feat: integrar registros reales de conductor y admin"
git push origin main

cd /workspaces/vixy-conductor
git add android/app/src/main/AndroidManifest.xml database php-api src package-lock.json
git diff --cached --check
git commit -m "feat: persistir operaciones reales del conductor"
git push origin main
```

## 10. APK/AAB

El contenedor actual no tiene Android SDK. En una maquina con Android SDK y Java 21:

```bash
cd /workspaces/vixy-conductor
export JAVA_HOME=/ruta/a/java-21
export ANDROID_HOME=/ruta/al/android-sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
npm run lint
npm run build
npm run android:sync
npm run android:release:apk
npm run android:release:aab
```

Antes del release firmado configurar el archivo de firma indicado por el script:

```text
/home/codespace/.config/vixy-conductor/android-signing/keystore.properties
```

No publicar el APK hasta comprobar registro, aprobacion, GPS, viaje, pagos, wallet y emergencias contra la base de datos real.
