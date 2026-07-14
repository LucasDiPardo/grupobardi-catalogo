# Grupo Bardi — Catálogo web

Sitio público estático (sin backend) del catálogo de Grupo Bardi. Se genera
automáticamente desde el sistema interno de stock y se sube acá a mano cada
vez que cambian precios, stock o la configuración del catálogo público.

## Estructura

- `index.html` / `home.js` — Home (hero, categorías destacadas, quiénes somos)
- `catalogo.html` / `catalogo.js` — catálogo con búsqueda, filtros y modal de detalle
- `contacto.html` — datos de contacto
- `categorias.js` — orden de categorías compartido entre Home y Catálogo
- `estilo.css` — paleta e identidad visual (Poppins, violeta/azul)
- `productos.json` — datos generados (no editar a mano)
- `imagenes/` — imágenes propias subidas por el sistema interno (si las hay)

## Cómo actualizarlo

Desde el sistema interno (Sistema Stock DJ, proyecto separado — no vive acá):

1. `catalogo-web-admin.html` → botón "Generar catálogo web ahora" (o
   `node scripts/generar-catalogo-web.js` desde ese proyecto).
2. Copiar el contenido de esa carpeta `catalogo-web/` acá encima.
3. `git add -A && git commit -m "Actualizar catálogo" && git push`.

Publicado con GitHub Pages.
