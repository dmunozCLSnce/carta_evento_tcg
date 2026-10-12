/*
 * Precios en vivo desde el POS del evento.
 *
 * El POS publica precios.json en este repo cada vez que aplica o quita un remate
 * (GitHub Pages republica solo). Este script lo lee y, para cada precio marcado
 * con data-p="<nombre del producto en el POS>", muestra el precio vigente.
 *
 * Marcadores del JSON:
 *   - hayRemate (general): muestra u oculta el aviso de remate.
 *   - productos[nombre].enRemate: true = precio original tachado + rebajado +
 *     etiqueta (-20%); false = solo el precio, sin tachado.
 * Al volver a los precios originales el POS publica todo en false, y la carta
 * quita los tachados en la siguiente lectura (máximo un minuto).
 *
 * Si el archivo no existe o no carga, la carta queda con los precios del HTML.
 */
(function () {
  var aviso = document.getElementById('remate-aviso');
  var marcados = document.querySelectorAll('[data-p]');
  if (!marcados.length) return;

  function clp(n) {
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  function nodo(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    el.textContent = texto;
    return el;
  }

  function aplicar(datos) {
    var productos = (datos && datos.productos) || {};

    marcados.forEach(function (el) {
      // El precio original del HTML, para volver a él si el producto sale del JSON.
      if (!el.dataset.base) el.dataset.base = el.textContent;
      var p = productos[el.dataset.p];
      el.classList.remove('oferta');
      el.textContent = '';

      if (!p) {
        el.textContent = el.dataset.base;
      } else if (p.enRemate) {
        el.classList.add('oferta');
        el.appendChild(nodo('s', '', clp(p.precioLista)));
        el.appendChild(nodo('span', 'ahora', clp(p.precio)));
        if (p.remate) el.appendChild(nodo('em', '', p.remate));
      } else {
        el.textContent = clp(p.precio);
      }
    });

    if (aviso) aviso.hidden = !datos.hayRemate;
  }

  function cargar() {
    fetch('precios.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (datos) { if (datos) aplicar(datos); })
      .catch(function () {});
  }

  cargar();
  // La carta queda abierta en el celular: se refresca sola cada minuto y al volver a ella.
  setInterval(cargar, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) cargar();
  });
})();
