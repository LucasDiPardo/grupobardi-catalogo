function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

async function iniciar() {
    const catalogo = await fetch('productos.json').then((r) => r.json());

    if (catalogo.whatsapp_numero) {
        const link = document.getElementById('linkWhatsappHero');
        link.href = `https://wa.me/${esc(catalogo.whatsapp_numero)}?text=${encodeURIComponent('Hola! Quiero hacer una consulta.')}`;
        link.hidden = false;
    }

    const conteo = new Map();
    for (const p of catalogo.productos) {
        if (!p.categoria) continue;
        const principal = p.categoria.split(' > ')[0];
        conteo.set(principal, (conteo.get(principal) || 0) + 1);
    }

    const categorias = [...conteo.entries()].sort((a, b) => compararCategoriasPrincipales(a[0], b[0]));
    document.getElementById('categoriasDestacadas').innerHTML = categorias.map(([nombre, cantidad]) => `
        <a class="tarjeta-categoria" href="catalogo.html?categoria=${encodeURIComponent(nombre)}">
            <span class="tarjeta-categoria-nombre">${esc(nombre)}</span>
            <span class="tarjeta-categoria-cantidad">${cantidad} producto${cantidad === 1 ? '' : 's'}</span>
        </a>
    `).join('');
}

iniciar();
