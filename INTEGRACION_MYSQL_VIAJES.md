# Integracion de viajes con MySQL

La sincronizacion entre `vixy-pasajero`, la app del conductor y el panel se realiza por HTTP contra `php-api/api/rides.php`. Firebase ya no participa en este flujo.

## 1. Importacion en phpMyAdmin

1. Importa `database/01_schema.sql` en phpMyAdmin.
2. No importes ningún seed: la base de producción debe iniciar sin registros ficticios.
3. Copia `php-api/config/config.example.php` a `php-api/config/config.local.php` y configura MySQL, `api_key` y los origenes reales.
4. Publica `php-api` en HTTPS. Nunca uses la clave de API por HTTP.

El esquema crea `rides`, `ride_dispatch_attempts`, `ride_status_history` y `driver_notifications`, ademas de reutilizar `drivers.lat`, `drivers.lng`, `drivers.status` e `is_online`.

## 2. Crear una solicitud desde vixy-pasajero

Reemplaza la escritura de `/rides/{rideId}` en Firestore por esta llamada. El `id` puede ser el mismo UUID que ya genera la app para que los reintentos sean idempotentes. La ruta compatible es `/api/admin/sync-ride`.

```ts
const response = await fetch(`${API_URL}/api/admin/sync-ride`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
  body: JSON.stringify({
    id: ride.id,
    userId: user.uid,
    clientId: profile.clientId,
    category: ride.category,
    pickupAddress: ride.pickupAddress,
    dropoffAddress: ride.dropoffAddress,
    pickupCoords: ride.pickupCoords,
    dropoffCoords: ride.dropoffCoords,
    distanceKm: ride.distanceKm,
    durationMins: ride.durationMins,
    priceUsd: ride.priceUsd,
    priceVes: ride.priceVes,
    paymentMethod: ride.paymentMethod,
    paymentReference: ride.paymentReference,
    notes: ride.notes,
  }),
});
const { success, data, error } = await response.json();
if (!success) throw new Error(error);
```

La respuesta contiene el viaje y, si existe un conductor elegible, `assigned_driver_id`, `driver_name`, `driver_lat`, `driver_lng` y `status: driver_assigned`. Si no hay conductores en linea, permanece en `searching`.

## 3. Entrega de la oferta al conductor

La app del conductor debe enviar la posicion cada pocos segundos:

```ts
await fetch(`${API_URL}/api/rides.php?action=location`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
  body: JSON.stringify({ driverId, lat, lng, isOnline: true }),
});
```

Luego consulta las ofertas pendientes con polling (por ejemplo, cada 3 segundos):

```ts
const response = await fetch(
  `${API_URL}/api/rides.php?action=notifications&driver_id=${encodeURIComponent(driverId)}`,
  { headers: { 'X-Api-Key': API_KEY } },
);
const { data: offers } = await response.json();
```

El backend selecciona el conductor `activo`, `is_online = 1`, de la categoria correspondiente (`moto` -> `mototaxi`, `auto` -> `taxi`, `delivery` -> `delivery`) con menor distancia Haversine al punto de recogida.

## 4. Aceptar o rechazar

```ts
await fetch(`${API_URL}/api/rides.php?action=respond`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
  body: JSON.stringify({
    rideId: offer.rideId,
    driverId,
    response: 'accepted', // o 'rejected'
    reason: 'No puedo llegar a tiempo',
  }),
});
```

La respuesta se escribe de forma atomica en `ride_dispatch_attempts` y `ride_status_history`. Si es rechazada, el backend libera el viaje, conserva el rechazo y ofrece el viaje al siguiente conductor disponible. Si es aceptada, las respuestas concurrentes posteriores reciben `409` porque la oferta deja de estar disponible.

## 5. Actualizacion del viaje

Para reflejar llegada, inicio, finalizacion o cancelacion, la app debe usar un endpoint autenticado de estados que actualice `rides.status` y agregue una fila a `ride_status_history`. Los estados soportados son:

`searching`, `driver_assigned`, `driver_arriving`, `in_trip`, `completed`, `cancelled`.

La finalizacion debe crear tambien la fila correspondiente en `completed_services` para el modulo de ganancias del panel.

## 6. Sesion propia del conductor (sin depender de localStorage/Firestore)

`drivers` ahora tiene `password_hash`, `auth_token`, `device_token` y `last_login_at`. La app conductor debe dejar de guardar el perfil "de verdad" en `localStorage`/Firestore y usar `php-api/api/driver_auth.php` (requiere `X-Api-Key`, no sesion de panel):

- `POST ?action=register` — crea el conductor con `status = 'pendiente'` (queda a la espera de verificacion del panel) y devuelve el perfil. Acepta `services: ("taxi"|"mototaxi"|"delivery")[]` para que un conductor ofrezca varios servicios a la vez (se guardan en `driver_services`; `drivers.category` queda como el primero, por compatibilidad).
- `POST ?action=login` — valida `email`/`username` + `password`, genera un `auth_token` nuevo y lo persiste en la fila del conductor. Devuelve tambien `services`.
- `GET ?action=me&token=...` — recarga el perfil (incluido `services`) desde la base de datos usando el `auth_token`; usalo al iniciar la app para que "al recargar" los datos vengan siempre del servidor.
- `POST ?action=logout` — invalida el `auth_token` y marca al conductor `is_online = 0`.
- `POST ?action=update_device_token` — guarda el token push (FCM) del dispositivo.
- `POST ?action=update_services` — reemplaza la lista de servicios (`services: string[]`) que ofrece el conductor.

El despacho de viajes (`rides.php`) ya no compara `drivers.category`: hace `INNER JOIN driver_services` filtrando por el tipo de servicio del viaje, así que un conductor con varios servicios activos recibe ofertas de todos ellos.

En el cliente, guarda unicamente `{ driverId, token }` en `localStorage` como cache de sesion; el resto del perfil (saldo, servicios, estado, calificacion, etc.) debe pedirse siempre a `?action=me` para evitar desincronizaciones.

## 7. Emergencias (boton de panico)

`php-api/api/emergencies.php` acepta `POST` con `X-Api-Key` (sin sesion admin) para que la app conductor o pasajero reporte una alerta real en `emergency_alerts`:

```ts
await fetch(`${API_URL}/api/emergencies.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
  body: JSON.stringify({
    type: 'robo', // robo | accidente | sos | mecanico
    reporter_type: 'conductor',
    reporter_id: driverId,
    reporter_name: driverName,
    reporter_phone: driverPhone,
    category: 'taxi',
    lat, lng,
    location_name: 'Av. Principal, Caracas',
  }),
});
```

Esto crea el registro que el panel ve en el modulo "Emergencias" y, si `reporter_type` es `conductor`, agrega una entrada en `driver_activity_logs`. Listar, editar o resolver alertas sigue requiriendo sesion de administrador.

## 8. Bitacora de actividad del conductor

Cada accion relevante (registro, login, logout, online/offline, aceptar/rechazar viaje, cambios de estado del viaje, emergencias) queda registrada automaticamente en `driver_activity_logs` por el backend (no requiere nada adicional desde la app). El panel puede consultarla de solo lectura en `php-api/api/driver_activity_logs.php` (sesion admin), opcionalmente filtrando por `driver_id`.

## Seguridad y produccion

- No incrustes una clave administrativa de larga duracion en una app movil distribuida. Usa un proxy del backend, tokens de corta duracion por usuario o una clave restringida por gateway.
- Cambia `api_key`, limita `allowed_origins` a los dominios reales y sirve todo por HTTPS.
- Las posiciones y las respuestas se validan en el servidor; no confies en el estado enviado por el cliente.
- Este contenedor no incluye cliente MySQL/MariaDB, por lo que la importacion debe verificarse en phpMyAdmin o CI con una instancia MariaDB.
