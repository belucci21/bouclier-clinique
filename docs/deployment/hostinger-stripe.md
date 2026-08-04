# Despliegue Hostinger + Supabase + Stripe

## Estado previo obligatorio

1. Revocar y rotar la clave secreta live de Stripe compartida durante el desarrollo.
2. Reautenticar la conexión de Stripe y verificar que la cuenta correcta muestre el nombre comercial **Bouclier Dermatología**.
3. No reutilizar en producción ninguna credencial que haya aparecido en chat, documentación o historial de terminal.
4. Confirmar el esquema real de `appointments` antes de ejecutar la función de confirmación incluida en la segunda migración; los repositorios legacy usan tanto `type_id` como `appointment_type_id`.

## Supabase

Ejecutar, en orden, desde el panel SQL o la CLI autorizada:

1. `supabase/migrations/202608040001_booking_deposits.sql`
2. `supabase/migrations/202608040002_stripe_webhooks.sql`

Después, asignar `price_mxn_minor` a cada tipo de cita activo. El valor es un entero en centavos de MXN; por ejemplo, 100000 representa MXN 1,000.00. La web no envía importes: la API lee este campo y calcula el anticipo del 30%.

Las tablas de retenciones, pagos y eventos no exponen políticas de escritura pública. La API debe utilizar exclusivamente la service role en el servidor.

## API Node en Hostinger

Directorio de aplicación: `server`

- Instalación: `npm ci --omit=dev`
- Inicio: `npm start`
- Versión recomendada: Node.js 20 o superior
- Health/runtime: supervisar el proceso desde el panel de Hostinger

Variables requeridas, cuyos valores se cargan en el panel de Hostinger y nunca en Git:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_WEB_URL`
- `PORT`

La API se niega a iniciar si falta una variable. El ejemplo seguro está en `server/.env.example`.

## Web pública

Construir desde la raíz con `npm ci && npm run build`. Publicar el contenido de `dist` y configurar fallback SPA hacia `index.html`.

Variables de build:

- `VITE_API_BASE_URL`: vacío si `/api` comparte dominio; URL HTTPS de la API si usa subdominio.
- `VITE_STRIPE_PUBLISHABLE_KEY`: clave publicable rotada/verificada.
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Solo variables con prefijo `VITE_` llegan al navegador. Nunca utilizar ese prefijo con la clave secreta de Stripe ni la service role de Supabase.

## Stripe

Crear un endpoint webhook HTTPS hacia:

`https://<dominio-api>/api/stripe/webhook`

Eventos mínimos:

- `checkout.session.completed`
- `checkout.session.expired`

Copiar el signing secret generado por ese endpoint a `STRIPE_WEBHOOK_SECRET`. Checkout usa modo embebido y métodos de pago dinámicos; no se crean precios fijos en el navegador.

## Verificación antes de publicar

1. Ejecutar `npm test`, `npm run lint`, `npm run build` y `npm --prefix server test`.
2. Realizar una reserva con credenciales de prueba de Stripe, nunca live.
3. Confirmar que un pago completado crea una sola cita aunque Stripe reintente el webhook.
4. Confirmar que una sesión expirada libera el horario.
5. Confirmar que el anticipo visible y cobrado equivale al 30% del precio almacenado.
6. Verificar móvil, escritorio, email de confirmación y registros de Hostinger/Stripe sin datos sensibles.

### Nota de auditoría de dependencias

La auditoría del 4 de agosto de 2026 reporta `GHSA-qwww-vcr4-c8h2` en React Router 7.18.2. El aviso afecta el procesamiento de acciones en modo React Server Components (RSC). Esta aplicación se construye como SPA estática con Vite, `BrowserRouter` y una API Express independiente; no habilita RSC ni acciones de React Router en el servidor, por lo que la ruta vulnerable no está expuesta en la arquitectura actual. No aplicar el downgrade automático a 7.11.0: esa versión reintroduce avisos de XSS, redirección abierta y DoS. Reevaluar al publicarse una versión corregida posterior a 7.18.2.
