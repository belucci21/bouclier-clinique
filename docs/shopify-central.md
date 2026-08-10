# Bouclier Central — configuración de la app Shopify

## Objetivo y límites

`Bouclier-app` será el panel central para productos, tratamientos y contenido compartido.

- Shopify sigue siendo la fuente canónica de comercio para `bouclier-dermatologia.com`.
- `bouclier-clinique.com` recibe tratamientos y contenido editorial marcado para Clinique.
- Los productos físicos, inventario, carrito y checkout no se publican en Clinique.
- Un contenido puede dirigirse a `dermatologia`, `clinique` o ambos mediante campos de publicación.

## Arquitectura

1. La app embebida escribe productos con `productSet`, archivos con `fileCreate` y contenido estructurado con metaobjetos.
2. Shopify actualiza la tienda de Dermatología de forma nativa.
3. Los webhooks de producto notifican a la app central cuando se crea, actualiza o elimina contenido.
4. La app normaliza el catálogo y publica una API de solo lectura para Clinique.
5. Clinique consume únicamente registros `content_kind=treatment` y `publish_clinique=true`.
6. Cada webhook se valida por HMAC y se procesa una sola vez mediante `X-Shopify-Webhook-Id`.

## Campos recomendados

### Metafields de producto

- `bouclier.content_kind`: `retail` o `treatment`.
- `bouclier.publish_dermatologia`: booleano.
- `bouclier.publish_clinique`: booleano.
- `bouclier.clinique_slug`: ruta estable para Clinique.
- `bouclier.summary`: resumen editorial.
- `bouclier.indications`: indicaciones clínicas.
- `bouclier.expectations`: resultados esperables.
- `bouclier.technology`: tecnología utilizada.

### Metaobjeto compartido

Tipo `$app:shared_content` con:

- `key`
- `title`
- `body`
- `image`
- `target_sites`
- `status`
- `updated_at`

El acceso del administrador será `merchant_read_write`. El contenido publicado podrá exponerse como `public_read` cuando corresponda.

## Configuración exacta en Shopify

### Nombre y URLs

- Nombre: `Bouclier-app`.
- App embebida en Shopify Admin: activada.
- URL durante desarrollo: dejar que `shopify app dev` gestione el túnel.
- URL de producción propuesta: `https://central.bouclier-dermatologia.com`.
- URL de preferencias: dejar vacía inicialmente; después usar `https://central.bouclier-dermatologia.com/app/settings`.
- Redirección de producción: `https://central.bouclier-dermatologia.com/auth/callback`.

`https://example.com` no debe permanecer al instalar la versión real.

### Permisos mínimos iniciales

```text
write_products,write_files,write_metaobjects,write_metaobject_definitions,write_publications
```

Los permisos de escritura incluyen la lectura necesaria para esos recursos. No habilitar pedidos, clientes, pagos, descuentos, temas, informes, POS ni Customer Account API.

Si más adelante la central administra existencias, añadir entonces `read_locations,write_inventory`. No solicitar esos permisos antes de implementar esa función.

### Opciones restantes

- Alcances opcionales: vacíos inicialmente.
- Flujo de instalación heredado: desactivado.
- API de webhooks: `2026-07`.
- Shopify POS: desactivado.
- App proxy: dejar sin configurar inicialmente. Solo hace falta si el storefront de Shopify debe renderizar una ruta servida por la app.

## Webhooks de la primera versión

```toml
[webhooks]
api_version = "2026-07"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/webhooks/app/uninstalled"

[[webhooks.subscriptions]]
topics = ["app/scopes_update"]
uri = "/webhooks/app/scopes_update"

[[webhooks.subscriptions]]
topics = ["products/create", "products/update", "products/delete"]
uri = "/webhooks/products"
```

## Flujo local

1. Instalar Shopify CLI: `npm install -g @shopify/cli@latest`.
2. Inicializar el template React Router y seleccionar la app existente `Bouclier-app`.
3. Dentro del proyecto ejecutar `shopify app config link` si el archivo TOML no quedó vinculado.
4. Revisar que `client_id` corresponda a `Bouclier-app`.
5. Colocar los permisos mínimos en `shopify.app.toml`.
6. Ejecutar `shopify app dev`, elegir una tienda de desarrollo e instalar la app.
7. Probar creación/edición de un tratamiento de prueba y la recepción del webhook.
8. Desplegar el servidor Node y su base de sesiones.
9. Configurar `SHOPIFY_APP_URL`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` y la base de datos como secretos del hosting.
10. Cambiar las URLs del TOML al dominio estable y ejecutar `shopify app deploy`.
11. Instalar o actualizar la app en `bouclier-dermatologia.com` y aprobar solo los permisos mostrados.

## Comprobación del catálogo Clinique

Desde `bouclier-web`:

```bash
npm run audit:shopify
```

La auditoría compara los 15 tratamientos públicos: título, descripción clínica sin llamadas comerciales, imágenes, variantes, precios y disponibilidad. Devuelve error si Shopify y Clinique dejan de coincidir.

## Referencias oficiales

- Shopify CLI: https://shopify.dev/docs/apps/build/cli-for-apps
- Configuración TOML: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
- Permisos: https://shopify.dev/docs/api/usage/access-scopes
- Webhooks: https://shopify.dev/docs/apps/build/webhooks/subscribe
- Metaobjetos: https://shopify.dev/docs/apps/build/metaobjects
- Despliegue: https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service
