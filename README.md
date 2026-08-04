# Bouclier Dermatología

Sitio unificado de Bouclier Dermatología para `bouclier-clinique.com`. Reúne la web clínica, el directorio de tratamientos, el portal de pacientes y el flujo de reserva con anticipo. La tienda, productos, carrito y farmacia quedan expresamente fuera del alcance.

## Arquitectura

- Frontend: React 19, React Router, Vite, Framer Motion y CSS editorial propio.
- Datos clínicos: `src/data/treatments.js` contiene 24 tratamientos y 16 motivos de consulta.
- Reservas: `src/booking` consume la API de `server/` y calcula un anticipo del 30% en el servidor.
- Pagos: Stripe Checkout embebido; las claves secretas solo se leen en el servidor.
- Persistencia: Supabase/Postgres mediante las migraciones de `supabase/migrations`.
- Portal de paciente: rutas internas bajo `/paciente/*`, sin abrir otra web.

## Desarrollo

```bash
npm install
npm run dev
```

Para la API:

```bash
npm --prefix server install
npm --prefix server run dev
```

Copia los ejemplos de entorno correspondientes y configura valores reales solo fuera de Git. Nunca pongas `STRIPE_SECRET_KEY` en variables `VITE_*` ni en archivos versionados.

## Verificación

```bash
npm test
npm run lint
npm run build
npm --prefix server test
npm --prefix server audit --audit-level=high
```

La evidencia visual y el registro de revisión están en `design-qa.md` y `qa/screenshots/`.
