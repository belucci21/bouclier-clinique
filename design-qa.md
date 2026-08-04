# Design QA — Bouclier Dermatología, fase 1

## Resultado final

`passed`

La implementación reproduce la dirección visual aprobada con una composición editorial 53/47, tipografía Druk Wide para títulos, paleta monocromática y jerarquía equivalente. La fotografía es deliberadamente distinta para cumplir la solicitud de diversificación de imágenes. La revisión profunda posterior amplió el inventario a 24 tratamientos, 16 motivos clínicos y 12 recursos visuales diferentes.

## Fuentes comparadas

- Referencia aprobada: `C:\Users\Usuario\Downloads\Imagen de Codex 4 ago 2026, 01_34_08 p.m..png`
- Implementación: `src/pages/Home.jsx`, `src/components/Header.jsx` y `src/styles/global.css`
- Imagen clínica generada para la implementación: `public/assets/img/hero-clinical-editorial.webp`
- La comparación conjunta conserva la pasada anterior como referencia histórica; las capturas actuales son `home-1440x1024-final-pass.png`, `home-390x1024-final.png` y `treatments-390x1024-final.png`.

## Condiciones de captura

- Referencia: 1487 × 1058 px.
- Vista principal de implementación: 1440 × 1024 CSS px, DPR 1.
- Vistas responsivas verificadas: 390, 768, 1024 y 1440 px de ancho, todas a 1024 px de alto.
- Estados adicionales: menú de tratamientos abierto, catálogo, detalle, selección de cita, pago embebido sin clave local y conflicto de horario simulado.

## Historial de comparación

1. Primera comparación: se detectó que el contenido principal del hero estaba aproximadamente 15–20 px bajo y que aparecía una línea de marca ausente en la referencia. El encabezado de la introducción a tratamientos también ocupaba tres líneas en lugar de dos.
2. Segunda comparación: se ocultó la línea extra, se corrigió el espaciado vertical del hero y se redujo el título introductorio.
3. Revisión profunda: se detectó que la imagen derecha no comenzaba detrás del encabezado, faltaban siete tratamientos, la marca anterior y valores dorados persistían en el portal y en páginas auxiliares, y el viewport móvil se desbordaba en tratamientos y citas.
4. Comparación final: todos esos hallazgos fueron corregidos; 35 rutas de escritorio y las cinco superficies móviles principales quedaron sin desbordamiento ni imágenes rotas.

## Hallazgos finales

- P0: ninguno.
- P1: ninguno.
- P2: ninguno.
- P3 aceptado: la fotografía no replica a la misma modelo; conserva la dirección clínica, el encuadre editorial y el tratamiento monocromático solicitado.
- Dependencia externa: Stripe live no está conectado; el conector solicita reautenticación y no se efectuó ningún cargo.

## Interacciones verificadas

- Navegación principal y menú de tratamientos.
- Catálogo y páginas internas de tratamiento, sin abrir un sitio externo.
- Botones “Agendar cita” y “Ver tratamientos”.
- Flujo de reserva desde tratamiento hasta anticipo.
- Recuperación ante conflicto de horario HTTP 409.
- Estado seguro cuando falta la clave publicable de Stripe.
- Páginas institucionales y navegación móvil.

## Evidencia

- `qa/screenshots/home-1440x1024-final-pass.png`
- `qa/screenshots/home-390x1024-final.png`
- `qa/screenshots/home-768x1024-final.png`
- `qa/screenshots/home-1024x1024-final.png`
- `qa/screenshots/home-menu-open-1440x1024.png`
- `qa/screenshots/treatments-1440x1024.png`
- `qa/screenshots/treatments-390x1024-final.png`
- `qa/screenshots/treatment-detail-1440x1024.png`
- `qa/screenshots/booking-treatment-1440x1024.png`
- `qa/screenshots/booking-payment-1440x1024.png`
- `qa/screenshots/booking-conflict-1440x1024.png`
- `qa/screenshots/booking-fallback-390x1024.png`

## Consola y límites

- Errores de aplicación durante la pasada de 35 rutas: ninguno. Sin la API local activa, `/citas` registra el 502 esperado del proxy y muestra la recuperación por WhatsApp.
- Desbordamiento horizontal: ninguno en escritorio ni en la verificación real de 390 px.
- El estado de pago se comprobó con respuestas de API simuladas. No se efectuó ningún cargo real ni se conectó una cuenta live de Stripe.
- `npm audit` del frontend mantiene dos avisos altos heredados de React Router 7.18.2 para APIs RSC inestables. Esta SPA no usa RSC y `react-router-dom` aún no publica la rama 8.3 corregida; forzar una versión incompatible no es una mitigación segura. La API de reservas sí registra 0 vulnerabilidades.
