# Hostinger, Supabase y Stripe: despliegue seguro

## Estado de esta entrega

La migracion `202608040005_stripe_variant_catalog.sql` y el catalogo Stripe se entregan como codigo, pero no se han aplicado a servicios externos. La conexion Supabase del controlador no esta disponible y Stripe live no se debe mutar hasta rotar la credencial expuesta anteriormente.

`PAYMENTS_ENABLED=false` es el valor seguro por defecto. En ese modo:

- la API arranca sin variables Stripe;
- `GET /api/booking/options` devuelve `paymentsEnabled: false`;
- agenda, retenciones y la salida por WhatsApp siguen disponibles;
- `POST /api/booking/checkout-session` devuelve JSON `503 payments_disabled`;
- health puede estar `ok` aunque `payments.ready` sea `false`.

## Arquitectura Hostinger

Hay dos configuraciones soportadas:

1. Mismo origen: publicar `dist/` y montar la aplicacion Node de `server/` en `/api`. `VITE_API_BASE_URL` queda vacio.
2. Subdominio: publicar la SPA en el dominio principal y Node en un origen HTTPS como `https://api.bouclier-clinique.com`. Definir ese origen, sin barra final, en `VITE_API_BASE_URL`; definir el origen de la web en `API_ALLOWED_ORIGIN`.

`public/.htaccess`, copiado a `dist/.htaccess` por Vite, excluye `/api` del fallback SPA. En el modo de mismo origen, la regla/proxy Hostinger que entrega `/api/*` a Node debe ejecutarse antes del sitio estatico. Una respuesta HTML `200` desde `/api/*` indica routing incorrecto.

Aplicacion Node:

- directorio: `server`;
- instalacion: `npm ci --omit=dev`;
- inicio: `npm start`;
- runtime: Node.js 20 o superior;
- health check: `GET /api/health`.

## Variables de entorno

Servidor Node, siempre:

- `PAYMENTS_ENABLED=false` al primer despliegue;
- `SUPABASE_URL`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- `PUBLIC_WEB_URL=https://bouclier-clinique.com`;
- `API_ALLOWED_ORIGIN=https://bouclier-clinique.com`;
- `NODE_ENV=production`;
- `PORT`, asignado por Hostinger cuando corresponda.

Servidor Node, solo al activar pagos:

- `STRIPE_SECRET_KEY` (`sk_test_...` durante verificacion; una nueva `sk_live_...` despues de rotar);
- `STRIPE_WEBHOOK_SECRET` (`whsec_...` del endpoint exacto);
- `STRIPE_PUBLISHABLE_KEY` del mismo modo test/live que la clave secreta.
- `STRIPE_CREDENTIAL_ROTATED=true` es obligatorio para arrancar con claves live; test no requiere esta confirmacion.

La API rechaza credenciales con espacios, prefijos vacios, cuerpos cortos o modos secret/publishable distintos. La confirmacion de rotacion no corrige una clave invalida ni sustituye su revocacion real.

Build SPA:

- `VITE_API_BASE_URL` segun la arquitectura anterior;
- `VITE_STRIPE_PUBLISHABLE_KEY` del mismo modo que el servidor cuando Checkout este activo;
- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

Solo los valores `VITE_` llegan al navegador. Nunca usar ese prefijo con `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` o `SUPABASE_SERVICE_ROLE_KEY`.

## Migraciones Supabase

Proyecto esperado: `tmcxgiqmmjpgxqrivbod`.

Inspeccionar y aplicar desde una sesion autorizada:

```powershell
supabase link --project-ref tmcxgiqmmjpgxqrivbod
supabase migration list --linked
supabase db push --dry-run
supabase db push
```

Las migraciones de esta rama son `202608040001` a `202608040005`. `003` y `004` definen variantes autoritativas, compatibilidad de `type_id`, holds atomicos y pago idempotente. `005` agrega IDs Stripe, restricciones e indices, el lease de sincronizacion, persistencia compare-and-set ligada al lease y la expiracion idempotente del hold. No ejecutar `db push` si el diff incluye cambios ajenos.

Pruebas SQL para una base local preparada:

```powershell
psql $env:LOCAL_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/legacy_appointment_type_compatibility.sql
psql $env:LOCAL_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/complete_booking_payment_integrity.sql
psql $env:LOCAL_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/expire_booking_hold_integrity.sql
psql $env:LOCAL_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/stripe_variant_catalog_integrity.sql
```

## Sincronizacion del catalogo Stripe

El comando es solo de servidor. Usa Stripe API `2026-02-25.clover`, crea un Product por tratamiento fuente y un Price MXN inmutable por variante activa con el anticipo exacto del 30%. Descubre todo el catalogo Bouclier con paginacion y metadata estable, recupera mapeos perdidos, desactiva duplicados/stale/inactivos y persiste el objeto canonico. Un ID guardado en la base no concede propiedad: un objeto Stripe sin el marcador y la identidad Bouclier exactos nunca se adopta, actualiza ni desactiva. La base repara ese mapeo a un objeto administrado. Un lease renovable en Supabase impide dos sincronizaciones simultaneas y la persistencia compare-and-set rechaza una variante eliminada o modificada concurrentemente; errores de red/autorizacion detienen el proceso y nunca se interpretan como objetos ausentes.

Primero ejecutar contra Stripe test. Cargar variables mediante el gestor seguro del entorno, no en Git ni en el historial del shell:

```powershell
npm --prefix server ci
npm --prefix server run sync:stripe-catalog
```

El comando exige `PAYMENTS_ENABLED=true` y el conjunto completo de variables Stripe. Para live tambien exige:

```text
STRIPE_CATALOG_ALLOW_LIVE=true
STRIPE_CREDENTIAL_ROTATED=true
```

Estas confirmaciones no sustituyen la rotacion: primero revocar la clave expuesta, crear una nueva credencial y comprobar la cuenta comercial correcta. No reutilizar secretos pegados en conversaciones anteriores.

## Checkout y webhook

Checkout usa sesiones embebidas y metodos de pago dinamicos. Antes de crear cada sesion, la API recupera el Price persistido y valida que este activo, sea `one_time`, pertenezca al Product persistido, use `mxn` y tenga exactamente el anticipo autoritativo. El navegador nunca crea ni envia importes.

Endpoint:

```text
https://<origen-api>/api/stripe/webhook
```

Eventos requeridos:

- `checkout.session.completed`;
- `checkout.session.expired`.

Copiar el signing secret del endpoint exacto a `STRIPE_WEBHOOK_SECRET`. Los reintentos son idempotentes y un pago no agendable queda como `manual_review`.

## Secuencia de activacion

1. Desplegar con `PAYMENTS_ENABLED=false`.
2. Inspeccionar y aplicar `202608040005` en Supabase.
3. Rotar credenciales y sincronizar primero Stripe test.
4. Construir la SPA con la clave publicable correspondiente.
5. Configurar webhook test y completar una reserva.
6. Repetir sync: el resumen debe mostrar cero Products/Prices creados o reemplazados.
7. Solo entonces configurar live con credenciales rotadas, sincronizar, cambiar `PAYMENTS_ENABLED=true` y reiniciar Node.

## Verificacion

```powershell
npm test
npm run lint
npm run build
npm --prefix server test
curl.exe -i https://<origen-api>/api/health
curl.exe -i https://<origen-api>/api/booking/options
curl.exe -i -X POST https://<origen-api>/api/booking/checkout-session -H "Content-Type: application/json" -d '{"holdId":"missing"}'
```

Con pagos desactivados, health debe mostrar Supabase listo y pagos desactivados; options debe informar `false`; checkout debe devolver `503 payments_disabled`. Una ruta SPA debe devolver HTML, mientras `/api/ruta-inexistente` debe devolver 404 y nunca `index.html`.

Con pagos activos, health solo queda `ok` cuando todas las variantes activas tienen IDs persistidos y los Products/Prices reales de Stripe estan activos, administrados por Bouclier y coinciden con Product, variante, MXN y 30% autoritativo. La verificacion real se comparte entre llamadas concurrentes y usa un cache conservador de TTL acotado para que el endpoint publico no amplifique llamadas Stripe; la respuesta nunca incluye errores ni secretos. En Stripe test confirmar el 30% exacto, metodos dinamicos, una sola cita ante replay, reintento de expiracion despues de fallo transitorio, liberacion del hold expirado y ausencia de secretos/datos clinicos en logs.
