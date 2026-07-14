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

## Deploy (ya hecho, 2026-07-14 — queda documentado por si hay que tocarlo)

**Publicado con GitHub Pages**, dominio propio `www.grupobardi.com.ar` (y
`grupobardi.com.ar` sin `www`, que redirige automático al de `www`).

- Repo: `https://github.com/LucasDiPardo/grupobardi-catalogo` (público — obligatorio
  para usar GitHub Pages gratis, por eso este repo está separado del proyecto
  interno "Sistema Stock DJ", que tiene datos reales y queda privado/local).
- GitHub → Settings → Pages → Source: `main` branch, `/ (root)`. Custom domain:
  `www.grupobardi.com.ar`, con "Enforce HTTPS" tildado.
- Archivo `CNAME` en la raíz del repo (contiene `www.grupobardi.com.ar`) — GitHub lo
  necesita para no perder la config del dominio en cada deploy. No borrar.

**DNS**: el dominio se compró en NIC Argentina (nic.ar), pero NIC.ar **no permite
cargar registros A/CNAME directo en su panel** — hay que delegar a un proveedor de
DNS externo. Se usó **Cloudflare** (plan Free):

1. Dominio agregado en Cloudflare (`dash.cloudflare.com`), cuenta
   `lucasdipardo1994@gmail.com`.
2. En NIC.ar → "Trámites a Distancia" → dominio `grupobardi.com.ar` → "Delegaciones"
   → se reemplazaron los nameservers por los 2 que dio Cloudflare:
   `damian.ns.cloudflare.com` y `gloria.ns.cloudflare.com`.
3. Registros DNS cargados en Cloudflare (todos en modo **"DNS only"**, nube gris —
   NO proxied/naranja, para que GitHub pueda emitir el certificado HTTPS sin que
   Cloudflare se meta en el medio):

   | Tipo | Nombre | Contenido |
   |---|---|---|
   | CNAME | `www` | `lucasdipardo.github.io` |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

Si el sitio deja de andar algún día, revisar en ese orden: ¿el repo sigue siendo
público? ¿el archivo `CNAME` sigue en la raíz? ¿los 5 registros DNS de Cloudflare
siguen ahí tal cual? ¿"Enforce HTTPS" sigue tildado en GitHub Pages?
