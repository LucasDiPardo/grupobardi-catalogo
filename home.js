function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

// Banners armados a mano (no generados) — si se agrega una categoria madre
// nueva, no aparece sola en el carrusel, hay que armarle su banner y sumarla
// aca.
const CATEGORIAS_CARRUSEL = [
    { categoria: 'Sonido', imagen: 'imagenes/banners/banner-sonido.png' },
    { categoria: 'Iluminación', imagen: 'imagenes/banners/banner-iluminacion.png' },
    { categoria: 'Gabinetes / Cajas Vacías', imagen: 'imagenes/banners/banner-gabinetes.png' },
    { categoria: 'Instrumentos', imagen: 'imagenes/banners/banner-instrumentos.png' },
];

function iniciarCarrusel() {
    const carrusel = document.getElementById('carrusel');
    const track = document.getElementById('carruselTrack');
    const dotsCont = document.getElementById('carruselDots');

    track.innerHTML = CATEGORIAS_CARRUSEL.map(({ categoria, imagen }) => `
        <a class="carrusel-slide" href="catalogo.html?categoria=${encodeURIComponent(categoria)}">
            <img src="${imagen}" alt="Categoría ${esc(categoria)}" loading="lazy">
        </a>
    `).join('');
    dotsCont.innerHTML = CATEGORIAS_CARRUSEL.map((_, i) => `
        <button class="carrusel-dot" data-idx="${i}" aria-label="Ir al slide ${i + 1}"></button>
    `).join('');

    const dots = [...dotsCont.querySelectorAll('.carrusel-dot')];
    let indice = 0;
    let intervalo;

    function irA(i) {
        indice = (i + CATEGORIAS_CARRUSEL.length) % CATEGORIAS_CARRUSEL.length;
        track.style.transform = `translateX(-${indice * 100}%)`;
        dots.forEach((d, j) => d.classList.toggle('carrusel-dot-activo', j === indice));
    }

    function reiniciarAuto() {
        clearInterval(intervalo);
        intervalo = setInterval(() => irA(indice + 1), 6000);
    }

    document.getElementById('carruselSiguiente').addEventListener('click', () => { irA(indice + 1); reiniciarAuto(); });
    document.getElementById('carruselAnterior').addEventListener('click', () => { irA(indice - 1); reiniciarAuto(); });
    dots.forEach((d) => d.addEventListener('click', () => { irA(Number(d.dataset.idx)); reiniciarAuto(); }));
    carrusel.addEventListener('mouseenter', () => clearInterval(intervalo));
    carrusel.addEventListener('mouseleave', reiniciarAuto);

    irA(0);
    reiniciarAuto();
}

async function iniciar() {
    iniciarCarrusel();

    // cache: 'no-store' evita que el navegador se quede con una copia vieja de
    // productos.json despues de regenerar el catalogo (paso 3+ dias de cache).
    const catalogo = await fetch('productos.json', { cache: 'no-store' }).then((r) => r.json());

    if (catalogo.whatsapp_numero) {
        const link = document.getElementById('linkWhatsappHero');
        link.href = `https://wa.me/${esc(catalogo.whatsapp_numero)}?text=${encodeURIComponent('Hola! Quiero hacer una consulta.')}`;
        link.hidden = false;
    }
}

iniciar();
