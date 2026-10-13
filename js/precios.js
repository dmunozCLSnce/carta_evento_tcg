/*
 * Carta dinámica desde el POS del evento.
 *
 * El POS publica precios.json en este repo cada vez que cambia el catálogo o un
 * remate (GitHub Pages republica solo). Con él, este script redibuja la carta:
 * categorías, productos activos, descripciones, precios y remates.
 *
 * Resguardo: el HTML de index.html es la carta completa sin remates. Si
 * precios.json no existe, no carga o no trae categorías, la carta se queda tal
 * cual. Del HTML se toman también los títulos de sección, los anclas de la barra
 * y las fotos (por nombre de producto), así un producto conocido conserva todo.
 *
 * Marcadores del JSON:
 *   - hayRemate: muestra u oculta la franja de remate.
 *   - enRemate (por producto): precio original tachado + rebajado + etiqueta.
 */
(function () {
  var main = document.querySelector('main');
  var nav = document.getElementById('catnav');
  var aviso = document.getElementById('remate-aviso');
  if (!main || !nav) return;

  // --- Lo que aporta el HTML estático -------------------------------------
  var original = main.innerHTML;
  var originalNav = nav.innerHTML;

  /** Por nombre de categoría (texto de la barra): id de la sección y su título. */
  var secciones = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var h2 = document.querySelector('#' + id + ' h2');
    secciones[a.textContent.trim()] = { id: id, titulo: h2 ? h2.textContent : a.textContent.trim() };
  });

  /** Por nombre de producto: la foto que ya tiene la carta. */
  var fotos = {};
  main.querySelectorAll('li.item img[alt]').forEach(function (img) {
    fotos[img.getAttribute('alt')] = img.getAttribute('src');
  });

  // --- Utilidades -----------------------------------------------------------
  function clp(n) {
    return '$' + Math.round(n).toLocaleString('es-CL');
  }

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function slug(texto) {
    return 'cat-' + texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /** Precio con o sin remate, dentro del elemento dado (span.price o dd). */
  function precio(contenedor, p) {
    contenedor.setAttribute('data-p', p.nombre);
    if (p.enRemate) {
      contenedor.classList.add('oferta');
      contenedor.appendChild(el('s', '', clp(p.precioLista)));
      contenedor.appendChild(el('span', 'ahora', clp(p.precio)));
      if (p.remate) contenedor.appendChild(el('em', '', p.remate));
    } else {
      contenedor.textContent = clp(p.precio);
    }
    return contenedor;
  }

  // --- Dibujo ------------------------------------------------------------------
  function item(p) {
    var li = el('li', 'item');
    var foto = fotos[p.nombre];
    if (foto) {
      var img = el('img');
      img.src = foto;
      img.alt = p.nombre;
      img.width = 88;
      img.height = 88;
      li.appendChild(img);
    } else {
      li.classList.add('sin-foto');
    }
    var info = el('div', 'info');
    var fila = el('div', 'row');
    fila.appendChild(el('h3', '', p.nombre));
    fila.appendChild(precio(el('span', 'price'), p));
    info.appendChild(fila);
    if (p.descripcion) info.appendChild(el('p', '', p.descripcion));
    li.appendChild(info);
    return li;
  }

  /** Productos con grupo: una tarjeta por grupo, como los combos. */
  function grupos(productos) {
    var ul = el('ul', 'clist');
    var porGrupo = {};
    var orden = [];
    productos.forEach(function (p) {
      if (!porGrupo[p.grupo]) {
        porGrupo[p.grupo] = [];
        orden.push(p.grupo);
      }
      porGrupo[p.grupo].push(p);
    });
    orden.forEach(function (g) {
      var li = el('li');
      li.appendChild(el('b', '', g));
      var dl = el('dl');
      porGrupo[g].forEach(function (p) {
        var div = el('div');
        var dt = el('dt', '', p.nombreEnGrupo || p.nombre);
        if (p.descripcion) dt.appendChild(el('small', '', p.descripcion));
        div.appendChild(dt);
        div.appendChild(precio(el('dd'), p));
        dl.appendChild(div);
      });
      li.appendChild(dl);
      ul.appendChild(li);
    });
    return ul;
  }

  function dibujar(categorias) {
    var nuevaNav = document.createDocumentFragment();
    var nuevoMain = document.createDocumentFragment();

    categorias.forEach(function (c) {
      if (!c.productos || !c.productos.length) return;
      var conocida = secciones[c.nombre];
      var id = conocida ? conocida.id : slug(c.nombre);

      var a = el('a', '', c.nombre);
      a.href = '#' + id;
      a.addEventListener('click', function () {
        a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      });
      nuevaNav.appendChild(a);

      var section = el('section');
      section.id = id;
      section.appendChild(el('h2', '', conocida ? conocida.titulo : c.nombre));
      var sueltos = c.productos.filter(function (p) { return !p.grupo; });
      var agrupados = c.productos.filter(function (p) { return p.grupo; });
      if (sueltos.length) {
        var ul = el('ul');
        sueltos.forEach(function (p) { ul.appendChild(item(p)); });
        section.appendChild(ul);
      }
      if (agrupados.length) section.appendChild(grupos(agrupados));
      nuevoMain.appendChild(section);
    });

    nav.replaceChildren(nuevaNav);
    main.replaceChildren(nuevoMain);
    // Las flechas de la barra (menu.js) se recalculan con el contenido nuevo.
    nav.dispatchEvent(new Event('scroll'));
  }

  function resguardo() {
    main.innerHTML = original;
    nav.innerHTML = originalNav;
    if (aviso) aviso.hidden = true;
  }

  function aplicar(datos) {
    var categorias = datos && Array.isArray(datos.categorias) ? datos.categorias : null;
    var conProductos = categorias && categorias.some(function (c) { return c.productos && c.productos.length; });
    if (!conProductos) return resguardo();
    try {
      dibujar(categorias);
      if (aviso) aviso.hidden = !datos.hayRemate;
    } catch (e) {
      resguardo();
    }
  }

  // --- Carga ---------------------------------------------------------------------
  var ultima = '';
  function cargar() {
    fetch('precios.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : null; })
      .then(function (texto) {
        if (texto === null) return resguardo();
        if (texto === ultima) return; // sin cambios: no redibuja (no mueve el scroll)
        ultima = texto;
        aplicar(JSON.parse(texto));
      })
      .catch(function () { /* sin red: se queda lo que se ve */ });
  }

  cargar();
  // La carta queda abierta en el celular: se refresca sola cada minuto y al volver a ella.
  setInterval(cargar, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) cargar();
  });
})();
