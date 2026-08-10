# Bouclier Dermatología

Frontend público de `bouclier-clinique.com`. Reúne la web clínica, los 15 tratamientos verificados de Shopify, los protocolos clínicos adicionales, el portal de pacientes y la agenda. La tienda, promociones, productos físicos, carrito e inventario quedan fuera de este repositorio y de Clinique.

## Arquitectura

- Frontend: React 19, React Router, Vite, Framer Motion y CSS editorial propio.
- Catálogo: `src/data/treatments.js`, auditado contra la colección pública de tratamientos de Shopify.
- Agenda: `src/booking` consume la API clínica y conserva un fallback accionable por WhatsApp.
- API, Stripe, Supabase, dashboard y migraciones: repositorio privado [`belucci21/bouclier-clinic-system`](https://github.com/belucci21/bouclier-clinic-system).
- Portal de paciente: rutas internas bajo `/paciente/*`, sin abrir otra web.

## Desarrollo

```bash
npm install
npm run dev
```

Define `VITE_API_BASE_URL` para apuntar al origen HTTPS de la API clínica. Ninguna clave secreta debe usar el prefijo `VITE_` ni quedar versionada.

## Verificación

```bash
npm test
npm run audit:shopify
npm run lint
npm run build
```

La evidencia visual y el registro de revisión están en `design-qa.md` y `qa/screenshots/`.
