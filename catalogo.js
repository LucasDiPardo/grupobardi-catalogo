const buscador = document.getElementById('buscador');
const filtroCategoria = document.getElementById('filtroCategoria');
const chipsCategorias = document.getElementById('chipsCategorias');
const grilla = document.getElementById('grilla');
const contador = document.getElementById('contador');
const estadoVacio = document.getElementById('estadoVacio');
const btnCargarMas = document.getElementById('btnCargarMas');
const pieFecha = document.getElementById('pieFecha');
const modalOverlay = document.getElementById('modalOverlay');
const modalContenido = document.getElementById('modalContenido');
const modalCerrar = document.getElementById('modalCerrar');

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
                ${whatsappHtml(producto, 'boton-whatsapp')}
            </div>
        </article>
    `;
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
            ${whatsappHtml(producto, 'boton-whatsapp boton-whatsapp-modal')}
        </div>
    `;
    modalOverlay.hidden = false;
}

function cerrarModal() {
    modalOverlay.hidden = true;
    modalContenido.innerHTML = '';
}

grilla.addEventListener('click', (e) => {
    if (e.target.closest('.boton-whatsapp')) return;
    const tarjeta = e.target.closest('.tarjeta-producto');
    if (!tarjeta) return;
    abrirModal(productosActuales[Number(tarjeta.dataset.idx)]);
});

modalCerrar.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) cerrarModal();
});

// Estado del filtro de categoria separado del <select>: su .value solo puede
// ser una de sus <option> (rutas completas "Padre > Hijo"), pero los chips
// filtran por categoria madre a secas ("Sonido") — asignarle esa string al
// <select> no tiene efecto (el navegador la ignora en silencio si no matchea
// ninguna opcion) y quedaba desincronizado.
let categoriaActiva = '';

function productosFiltrados() {
    const q = buscador.value.trim().toLowerCase();
    return catalogo.productos.filter((p) => {
        if (categoriaActiva) {
            const coincide = p.categoria === categoriaActiva || (p.categoria && p.categoria.startsWith(`${categoriaActiva} > `));
            if (!coincide) return false;
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
btnCargarMas.addEventListener('click', () => {
    paginaActual += 1;
    renderizar();
});

async function iniciar() {
    catalogo = await fetch('productos.json').then((r) => r.json());
    poblarCategorias();
    poblarChipsCategorias();

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
