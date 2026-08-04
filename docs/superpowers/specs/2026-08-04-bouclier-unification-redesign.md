# Bouclier — unificación, rediseño y reserva con depósito

## Objetivo

Convertir `bouclier-clinique.com` en la única web pública de Bouclier, integrando el contenido clínico de `bouclier-dermatologia.com` sin copiar la tienda, la farmacia ni el ecommerce. La experiencia debe sentirse médica, moderna y exclusiva; los tratamientos se navegan dentro del mismo dominio y la reserva termina con un depósito de Stripe del 30 %.

La entrega se divide en dos fases:

1. Web pública, contenidos clínicos, reserva y pago.
2. Aplicación de los mismos tokens y patrones al portal del paciente, dashboard y apps Expo.

## Dirección visual aprobada

La referencia definitiva es `C:/Users/Usuario/Downloads/Imagen de Codex 4 ago 2026, 01_34_08 p.m..png`.

- Hero editorial dividido en dos columnas: contenido blanco/gris a la izquierda y fotografía clínica natural a la derecha.
- Titular principal en `DrukWide-Medium.woff`, mayúsculas, negro, gran escala y saltos controlados. Druk se limita a títulos, cifras y etiquetas cortas; el cuerpo mantiene Inter o una sans equivalente.
- Paleta estricta: negro, carbón, grafito, gris piedra, gris claro y blanco. Se elimina el dorado de componentes, iconos, focos, botones y estados activos.
- Botón primario negro con texto blanco; secundario como enlace subrayado o botón de contorno. El header mantiene `AGENDAR CITA` como CTA visible.
- Fotografía realista y diversa de pacientes y personal clínico, con textura de piel natural, distintas edades y tonos de piel. No se reutiliza una misma imagen como solución genérica para tratamientos distintos.
- Sin gradientes decorativos, glassmorphism, iconos ornamentales, imágenes de cosmética ni señales visuales de tienda.

## Arquitectura de información y contenido

### Navegación pública

El header unificado contiene: `CLÍNICA`, `TRATAMIENTOS`, `MÉTODO`, `DRA. GISSEL`, `MI PORTAL` y `AGENDAR CITA`.

- `CLÍNICA` agrupa inicio, equipo, ubicaciones, contacto y preguntas frecuentes.
- `TRATAMIENTOS` abre un mega menú accesible y enlaza a `/tratamientos` y categorías internas.
- Ningún enlace de tratamientos abre otra pestaña ni redirige al dominio de dermatología.
- Se eliminan `Farmacia`, búsqueda de productos, cuenta Shopify, carrito, cantidad, stock, precio de venta y checkout de tienda.

### Rutas y páginas

- Conservar y rediseñar las rutas existentes: `/`, `/quienes-somos`, `/metodo-bouclier`, `/manchas`, `/blefaroplastia`, `/citas`, `/descargar` y `/paciente/*`.
- Añadir `/tratamientos`, `/tratamientos/:slug`, `/dra-gissel`, `/contacto`, `/preguntas-frecuentes`, `/aviso-privacidad` y `/terminos-condiciones`.
- Migrar el contenido clínico de las fichas Shopify a páginas de tratamiento propias. Aunque las rutas de origen sean `/products/*`, se conservan solo nombre, categoría, explicación clínica, indicaciones, tecnología e imágenes pertinentes; se descartan todos los elementos de compra.
- Incluir, como mínimo: Hydrafacial, Diamond Glow, OxyGeneo, Liftage, Exion Facial/Micropunción, Red Touch, Hollywood Peel, Natura Peel, Láser Duoglide, Accent Prime, Endermologie, depilación láser y masajes. Manchas/melasma y blefaroplastia mantienen el contenido ya creado y se integran en el catálogo.
- Organizar el catálogo por necesidades entendibles: limpieza y calidad de piel, firmeza/rejuvenecimiento, láser y pigmentación, corporal, bienestar, celulitis/estrías y depilación.
- Cada detalle incluye objetivo, para quién está indicado, qué esperar, tecnología, preguntas frecuentes y CTA de valoración. No muestra precio de tienda; el precio operativo solo aparece dentro del flujo de reserva cuando corresponda.

### Inicio

- Reproducir fielmente la composición de la referencia aprobada.
- Debajo del hero: introducción a tratamientos, categorías, Método Bouclier, casos/resultados con consentimiento, Dra. Gissel/equipo, prueba social verificable, ubicaciones y CTA final.
- Eliminar el bloque testimonial duplicado y evitar afirmaciones absolutas no verificadas como “eliminar definitivamente” o “#1” sin fuente.
- Corregir direcciones y datos inconsistentes usando una única fuente de contenido.

## Reserva, calendario y Stripe

### Fuente de verdad

- Supabase mantiene tipos de cita, duración, precio total en MXN, profesionales, disponibilidad, bloqueos, citas y estado de pago.
- Añadir a `appointment_types` un precio entero en centavos (`price_mxn_minor`) y la configuración de depósito. La regla inicial es global: 30 % redondeado al centavo.
- El navegador nunca envía ni decide el importe cobrable; el servidor vuelve a leer el precio y calcula el depósito.

### Flujo

1. Paciente elige tratamiento/tipo de cita, profesional, fecha y hora.
2. El servidor valida la disponibilidad y crea una retención temporal del slot con expiración.
3. El servidor crea una Stripe Checkout Session de pago único y devuelve el secreto necesario para Checkout embebido.
4. El pago se muestra dentro del flujo de reserva, sin nueva pestaña.
5. El webhook firmado de Stripe marca el depósito como pagado y confirma la cita de forma idempotente.
6. Si la sesión expira o falla, se libera la retención. La pantalla de retorno consulta al servidor; no confía solo en parámetros de URL.

### Backend e interfaces

El backend Node desplegable en Hostinger expone:

- `POST /api/booking/hold`: valida datos y retiene el slot.
- `POST /api/booking/checkout-session`: crea la sesión a partir del hold y del precio leído en Supabase.
- `GET /api/booking/session/:id`: devuelve el estado seguro para la pantalla final.
- `POST /api/stripe/webhook`: verifica la firma y procesa eventos de pago/expiración de forma idempotente.

Variables de servidor: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, credenciales de Supabase de servidor y URL pública. La clave publicable puede exponerse mediante configuración de frontend; ninguna clave secreta se escribe en el repositorio, HTML, bundle, logs o base de datos.

La conexión Stripe de Codex debe reautenticarse para inspeccionar o modificar la cuenta. Las claves `live` compartidas en chat se rotan antes de usarse en producción.

## Sistema visual compartido y calidad

- Crear tokens semánticos comunes para color, tipografía, espaciado, radios, bordes, estados, foco y movimiento. En fase 2 se traducen a CSS/Tailwind y a módulos de tema de React Native.
- Respetar `prefers-reduced-motion`, foco visible, navegación por teclado, contraste AA, objetivos táctiles y reflow móvil.
- Reducir el bundle público con lazy loading por ruta y optimización de vídeo/imágenes. Objetivo inicial: eliminar el chunk principal superior a 500 kB.
- Sustituir datos, enlaces y documentos de ejemplo. Rotar credenciales de prueba expuestas, retirar contraseñas de documentación versionada y arreglar los enlaces legales/sociales actualmente vacíos o genéricos.
- Corregir el lint del sistema clínico con configuración ESLint 9, las dependencias faltantes de hooks y la versión incompatible de AsyncStorage en la app clínica.
- No modificar los cambios locales preexistentes de `app.json` en las dos apps Expo.

## Verificación y aceptación

- Comparación visual a 1440 × 1024 contra la referencia; después verificación a 390, 768, 1024 y 1440 px.
- Header, menú de tratamientos, rutas, CTAs y cierre del menú móvil funcionan con ratón, teclado y táctil.
- Todos los tratamientos migrados son internos y no existe ningún acceso público a farmacia, productos o carrito.
- Reserva probada en modos éxito, cancelación, pago rechazado, sesión expirada, doble clic, webhook repetido y slot tomado por otra persona.
- El importe del depósito equivale siempre al 30 % del precio leído en servidor y se registra junto a moneda, PaymentIntent/Session y estado.
- `npm run lint` y `npm run build` pasan en web y dashboard; Expo Doctor pasa en ambas apps al completar la fase 2.
- Design QA compara referencia y captura de la implementación en el mismo viewport y termina con `final result: passed` antes del handoff.

## Supuestos cerrados

- El dominio canónico final es `bouclier-clinique.com`; `bouclier-dermatologia.com` se conservará temporalmente solo para redirecciones SEO 301 de contenido clínico.
- La tienda y los productos cosméticos no se migran. Las fichas Shopify que representan servicios sí se convierten en contenido clínico sin compra.
- La moneda es MXN y el depósito inicial es 30 %.
- El pago se realiza mediante Checkout Sessions embebido; no se guardan tarjetas para cobros futuros en esta fase.
- Reembolsos, cancelaciones tardías y excepciones se gestionan manualmente desde Stripe/sistema clínico hasta que exista una política comercial aprobada.
