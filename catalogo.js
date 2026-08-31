const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroMarca = document.getElementById('filtroMarca');
const chipsCategorias = document.getElementById('chipsCategorias');
const grilla = document.getElementById('grilla');
const contador = document.getElementById('contador');
const estadoVacio = document.getElementById('estadoVacio');
const btnCargarMas = document.getElementById('btnCargarMas');
const pieFecha = document.getElementById('pieFecha');
const header = document.querySelector('header');
const btnVolverArriba = document.getElementById('btnVolverArriba');
const modalOverlay = document.getElementById('modalOverlay');
const modalContenido = document.getElementById('modalContenido');
const modalCerrar = document.getElementById('modalCerrar');
const btnCarrito = document.getElementById('btnCarrito');
const carritoContador = document.getElementById('carritoContador');
const carritoOverlay = document.getElementById('carritoOverlay');
const carritoCerrar = document.getElementById('carritoCerrar');
const carritoLista = document.getElementById('carritoLista');
const carritoAcciones = document.getElementById('carritoAcciones');

const TAMANO_PAGINA = 30;
let paginaActual = 1;

const formatoMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

let catalogo = { productos: [], whatsapp_numero: '', mostrar_precios: false, generado: null };
let productosActuales = [];

function precioHtml(producto, clase) {
    return catalogo.mostrar_precios && producto.precio_venta !== null
        ? `<p class="${clase}">${formatoMoneda.format(producto.precio_venta)}</p>`
        : '';
}

function whatsappHtml(producto, clase) {
    return catalogo.whatsapp_numero
        ? `<a class="${clase}" target="_blank" rel="noopener"
             href="https://wa.me/${esc(catalogo.whatsapp_numero)}?text=${encodeURIComponent(`Hola! Consulto por: ${producto.nombre}`)}">
             Consultar por WhatsApp
           </a>`
        : '';
}

// Carrito "ficticio": no hay compra ni stock real todavia, es solo una lista
// para juntar productos y mandar UNA consulta de WhatsApp con todos en vez de
// una por uno. Vive en localStorage del visitante, nada de esto toca el
// sistema interno ni requiere backend.
const CARRITO_CLAVE = 'gbd_carrito';

function leerCarrito() {
    try {
        const datos = JSON.parse(localStorage.getItem(CARRITO_CLAVE));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

let carrito = leerCarrito();

function guardarCarrito() {
    try {
        localStorage.setItem(CARRITO_CLAVE, JSON.stringify(carrito));
    } catch {
        // Storage lleno o bloqueado (modo privado, etc.) -- el carrito sigue
        // funcionando en memoria durante la visita, solo no persiste.
    }
}

function estaEnCarrito(id) {
    return carrito.some((item) => item.id === id);
}

function actualizarContadorCarrito() {
    carritoContador.textContent = carrito.length;
    carritoContador.hidden = carrito.length === 0;
}

function agregarAlCarrito(producto) {
    if (estaEnCarrito(producto.id)) return;
    carrito.push({ id: producto.id, nombre: producto.nombre });
    guardarCarrito();
    actualizarContadorCarrito();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter((item) => item.id !== id);
    guardarCarrito();
    actualizarContadorCarrito();
    if (!carritoOverlay.hidden) renderizarCarrito();
}

function mensajeWhatsappCarrito() {
    const lista = carrito.map((item) => `- ${item.nombre}`).join('\n');
    return `Hola! Quiero consultar disponibilidad de estos productos:\n${lista}`;
}

function renderizarCarrito() {
    if (carrito.length === 0) {
        carritoLista.innerHTML = '<p class="carrito-vacio">Todavía no agregaste ningún producto.</p>';
        carritoAcciones.innerHTML = '';
        return;
    }

    carritoLista.innerHTML = carrito.map((item) => `
        <div class="carrito-item">
            <span class="carrito-item-nombre">${esc(item.nombre)}</span>
            <button type="button" class="carrito-item-quitar" data-id="${item.id}" aria-label="Quitar">&times;</button>
        </div>
    `).join('');

    carritoAcciones.innerHTML = catalogo.whatsapp_numero
        ? `<a class="boton-whatsapp" target="_blank" rel="noopener"
             href="https://wa.me/${esc(catalogo.whatsapp_numero)}?text=${encodeURIComponent(mensajeWhatsappCarrito())}">
             Consultar disponibilidad
           </a>`
        : '<p class="carrito-vacio">La consulta por WhatsApp todavía no está habilitada.</p>';
}

function abrirCarrito() {
    renderizarCarrito();
    carritoOverlay.hidden = false;
}

function cerrarCarrito() {
    carritoOverlay.hidden = true;
}

function tarjetaProducto(producto, idx) {
    const imagen = producto.imagen
        ? `<img class="tarjeta-producto-imagen" src="${esc(producto.imagen)}" alt="" loading="lazy">`
        : '<div class="tarjeta-producto-imagen-vacia">Sin imagen</div>';

    return `
        <article class="tarjeta-producto" data-idx="${idx}">
            ${imagen}
            <div class="tarjeta-producto-cuerpo">
                ${producto.categoria ? `<span class="tarjeta-producto-categoria">${esc(producto.categoria)}</span>` : ''}
                <h2 class="tarjeta-producto-nombre">${esc(producto.nombre)}</h2>
                ${producto.marca ? `<span class="tarjeta-producto-marca">${esc(producto.marca)}</span>` : ''}
                ${precioHtml(producto, 'tarjeta-producto-precio')}
                <button type="button" class="boton-ver-detalles">Ver detalles</button>
            </div>
        </article>
    `;
}

function botonCarritoModalHtml(producto) {
    const enCarrito = estaEnCarrito(producto.id);
    return `<button type="button" class="boton-carrito-agregar${enCarrito ? ' en-carrito' : ''}" data-id="${producto.id}">
        ${enCarrito ? '✓ En tu consulta (sacar)' : '+ Agregar a la consulta'}
    </button>`;
}

function abrirModal(producto) {
    const imagen = producto.imagen
        ? `<img class="modal-imagen" src="${esc(producto.imagen)}" alt="">`
        : '<div class="modal-imagen modal-imagen-vacia">Sin imagen</div>';

    modalContenido.innerHTML = `
        ${imagen}
        <div class="modal-cuerpo">
            ${producto.categoria ? `<span class="tarjeta-producto-categoria">${esc(producto.categoria)}</span>` : ''}
            <h2 class="modal-nombre">${esc(producto.nombre)}</h2>
            ${producto.marca ? `<p class="tarjeta-producto-marca">${esc(producto.marca)}</p>` : ''}
            ${precioHtml(producto, 'modal-precio')}
            <div class="modal-acciones" data-id="${producto.id}">
                ${whatsappHtml(producto, 'boton-whatsapp boton-whatsapp-modal')}
                ${botonCarritoModalHtml(producto)}
            </div>
        </div>
    `;
    modalOverlay.hidden = false;
}

function cerrarModal() {
    modalOverlay.hidden = true;
    modalContenido.innerHTML = '';
}

grilla.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.tarjeta-producto');
    if (!tarjeta) return;
    abrirModal(productosActuales[Number(tarjeta.dataset.idx)]);
});

modalContenido.addEventListener('click', (e) => {
    const boton = e.target.closest('.boton-carrito-agregar');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    const producto = catalogo.productos.find((p) => p.id === id);
    if (!producto) return;
    if (estaEnCarrito(id)) quitarDelCarrito(id);
    else agregarAlCarrito(producto);
    boton.outerHTML = botonCarritoModalHtml(producto);
});

btnCarrito.addEventListener('click', abrirCarrito);
carritoCerrar.addEventListener('click', cerrarCarrito);
carritoOverlay.addEventListener('click', (e) => {
    if (e.target === carritoOverlay) cerrarCarrito();
});
carritoLista.addEventListener('click', (e) => {
    const boton = e.target.closest('.carrito-item-quitar');
    if (!boton) return;
    quitarDelCarrito(Number(boton.dataset.id));
});

modalCerrar.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modalOverlay.hidden) cerrarModal();
    if (!carritoOverlay.hidden) cerrarCarrito();
});

// Estado del filtro de categoria separado del <select>: su .value solo puede
// ser una de sus <option> (rutas completas "Padre > Hijo"), pero los chips
// filtran por categoria madre a secas ("Sonido") — asignarle esa string al
// <select> no tiene efecto (el navegador la ignora en silencio si no matchea
// ninguna opcion) y quedaba desincronizado.
let categoriaActiva = '';

// Sentinel para el filtro "Sin marca asignada" -- distinto de "" (que
// significa "todas las marcas"), asi el <select> puede distinguir ambos casos.
const SIN_MARCA = '__sin_marca__';
let marcaActiva = '';

function productosFiltrados() {
    const q = buscador.value.trim().toLowerCase();
    return catalogo.productos.filter((p) => {
        if (categoriaActiva) {
            const coincide = p.categoria === categoriaActiva || (p.categoria && p.categoria.startsWith(`${categoriaActiva} > `));
            if (!coincide) return false;
        }
        if (marcaActiva === SIN_MARCA) {
            if (p.marca) return false;
        } else if (marcaActiva) {
            if (p.marca !== marcaActiva) return false;
        }
        if (!q) return true;
        return p.nombre.toLowerCase().includes(q) || (p.marca && p.marca.toLowerCase().includes(q));
    });
}

function renderizar() {
    productosActuales = productosFiltrados();
    const visibles = productosActuales.slice(0, paginaActual * TAMANO_PAGINA);
    grilla.innerHTML = visibles.map(tarjetaProducto).join('');
    estadoVacio.hidden = productosActuales.length > 0;
    contador.textContent = `${productosActuales.length} producto${productosActuales.length === 1 ? '' : 's'}`;
    btnCargarMas.hidden = visibles.length >= productosActuales.length;
}

function filtrarDesdeCero() {
    paginaActual = 1;
    renderizar();
}

function poblarCategorias() {
    const categorias = [...new Set(catalogo.productos.map((p) => p.categoria).filter(Boolean))].sort((a, b) => {
        const prioridad = compararCategoriasPrincipales(a.split(' > ')[0], b.split(' > ')[0]);
        return prioridad !== 0 ? prioridad : a.localeCompare(b, 'es');
    });
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>'
        + categorias.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

function poblarMarcas() {
    const marcas = [...new Set(catalogo.productos.map((p) => p.marca).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    const hayProductosSinMarca = catalogo.productos.some((p) => !p.marca);
    filtroMarca.innerHTML = '<option value="">Todas las marcas</option>'
        + marcas.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join('')
        + (hayProductosSinMarca ? `<option value="${SIN_MARCA}">Sin marca asignada</option>` : '');
}

function poblarChipsCategorias() {
    const principales = [...new Set(
        catalogo.productos.map((p) => (p.categoria ? p.categoria.split(' > ')[0] : null)).filter(Boolean),
    )].sort(compararCategoriasPrincipales);

    chipsCategorias.innerHTML = ['Todos', ...principales].map((nombre) => {
        const valor = nombre === 'Todos' ? '' : nombre;
        return `<button type="button" class="chip-categoria" data-valor="${esc(valor)}">${esc(nombre)}</button>`;
    }).join('');
}

function actualizarChipActivo() {
    chipsCategorias.querySelectorAll('.chip-categoria').forEach((chip) => {
        chip.classList.toggle('chip-categoria-activo', chip.dataset.valor === categoriaActiva);
    });
}

chipsCategorias.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-categoria');
    if (!chip) return;
    categoriaActiva = chip.dataset.valor;
    filtroCategoria.value = '';
    actualizarChipActivo();
    filtrarDesdeCero();
});

let debounce;
buscador.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(filtrarDesdeCero, 150);
});
filtroCategoria.addEventListener('change', () => {
    categoriaActiva = filtroCategoria.value;
    actualizarChipActivo();
    filtrarDesdeCero();
});
filtroMarca.addEventListener('change', () => {
    marcaActiva = filtroMarca.value;
    filtrarDesdeCero();
});
btnCargarMas.addEventListener('click', () => {
    paginaActual += 1;
    renderizar();
});

// En celular el header (logo + buscador + filtros + chips) ocupa buena
// parte de la pantalla y quedaba fijo arriba todo el tiempo (position:
// sticky) -- se esconde al bajar y reaparece al subir, patron habitual de
// sitios con buscador arriba (mismo lugar donde se recupera con el boton
// "volver arriba").
let ultimoScrollY = window.scrollY;
let tickeando = false;

function actualizarPorScroll() {
    const actual = window.scrollY;
    if (actual > ultimoScrollY && actual > 80) {
        header.classList.add('header-oculto');
    } else {
        header.classList.remove('header-oculto');
    }
    btnVolverArriba.hidden = actual < 400;
    ultimoScrollY = actual;
    tickeando = false;
}

window.addEventListener('scroll', () => {
    if (tickeando) return;
    tickeando = true;
    requestAnimationFrame(actualizarPorScroll);
}, { passive: true });

btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    header.classList.remove('header-oculto');
});

async function iniciar() {
    // cache: 'no-store' evita que el navegador se quede con una copia vieja de
    // productos.json despues de regenerar el catalogo (paso 3+ dias de cache).
    catalogo = await fetch('productos.json', { cache: 'no-store' }).then((r) => r.json());
    poblarCategorias();
    poblarChipsCategorias();
    poblarMarcas();
    actualizarContadorCarrito();

    // Permite linkear desde otra pagina a una categoria puntual, ej. las
    // tarjetas de "categorias destacadas" del Home (catalogo.html?categoria=Sonido).
    const categoriaDesdeUrl = new URLSearchParams(location.search).get('categoria');
    if (categoriaDesdeUrl) categoriaActiva = categoriaDesdeUrl;

    actualizarChipActivo();
    renderizar();
    if (catalogo.generado) {
        const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(catalogo.generado));
        pieFecha.textContent = `Catálogo actualizado: ${fecha}`;
    }
}

iniciar();
