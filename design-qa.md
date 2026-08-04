# Design QA — Bouclier Dermatología, fase 1

## Resultado final

`passed`

La implementación reproduce la dirección visual aprobada con una composición editorial 53/47, tipografía Druk Wide para títulos, paleta monocromática y jerarquía equivalente. La fotografía es deliberadamente distinta para cumplir la solicitud de diversificación de imágenes.

## Fuentes comparadas

- Referencia aprobada: `C:\Users\Usuario\Downloads\Imagen de Codex 4 ago 2026, 01_34_08 p.m..png`
- Implementación: `src/pages/Home.jsx`, `src/components/Header.jsx` y `src/styles/global.css`
- Imagen clínica generada para la implementación: `public/assets/img/hero-clinical-editorial.webp`
- Comparación conjunta final: `qa/screenshots/comparison-home-final-pass.png`

## Condiciones de captura

- Referencia: 1487 × 1058 px.
- Vista principal de implementación: 1440 × 1024 CSS px, DPR 1.
- Vistas responsivas verificadas: 390, 768, 1024 y 1440 px de ancho, todas a 1024 px de alto.
- Estados adicionales: menú de tratamientos abierto, catálogo, detalle, selección de cita, pago embebido sin clave local y conflicto de horario simulado.

## Historial de comparación

1. Primera comparación: se detectó que el contenido principal del hero estaba aproximadamente 15–20 px bajo y que aparecía una línea de marca ausente en la referencia. El encabezado de la introducción a tratamientos también ocupaba tres líneas en lugar de dos.
2. Segunda comparación: se ocultó la línea extra, se corrigió el espaciado vertical del hero y se redujo el título introductorio.
3. Comparación final: sin diferencias accionables P0, P1 o P2.

## Hallazgos finales

- P0: ninguno.
- P1: ninguno.
- P2: ninguno.
- P3 aceptado: el salto de línea del título de tratamientos no coincide palabra por palabra con la referencia, pero conserva jerarquía, ancho y contenido visible sobre el pliegue.
- P3 aceptado: la fotografía no replica a la misma modelo; conserva la dirección clínica, el encuadre editorial y el tratamiento monocromático solicitado.

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
- `qa/screenshots/treatment-detail-1440x1024.png`
- `qa/screenshots/booking-treatment-1440x1024.png`
- `qa/screenshots/booking-payment-1440x1024.png`
- `qa/screenshots/booking-conflict-1440x1024.png`

## Consola y límites

- Errores de consola durante la pasada de navegador: ninguno.
- Desbordamiento horizontal en las cuatro vistas responsivas: ninguno.
- El estado de pago se comprobó con respuestas de API simuladas. No se efectuó ningún cargo real ni se conectó una cuenta live de Stripe.
