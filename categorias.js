// Orden de categorias madre compartido entre catalogo.js y home.js:
// Sonido e Iluminacion primero (lo mas vendido), el resto alfabetico despues.
const PRIORIDAD_CATEGORIAS = ['Sonido', 'Iluminación'];

function compararCategoriasPrincipales(a, b) {
    const ia = PRIORIDAD_CATEGORIAS.indexOf(a);
    const ib = PRIORIDAD_CATEGORIAS.indexOf(b);
    if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    }
    return a.localeCompare(b, 'es');
}
