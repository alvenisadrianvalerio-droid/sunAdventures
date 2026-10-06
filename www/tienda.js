/* ============================================================
   TIENDA.JS — Tienda de SunAd
   · Pestaña embebida (Tienda.montar) + overlay (Tienda.abrir)
   · Soporta sprite sheets con fallback automático a SVG
   · Auto-refresco al comprar / equipar / abrir
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const it = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 100) return console.warn("tienda.js: _TiendaAPI no llegó tras 10s");
      setTimeout(it, 100);
    };
    // ✅ Escuchar el evento Y hacer polling
    window.addEventListener("sunad:api-ready", () => {
      if (window._TiendaAPI) boot();
    }, { once: true });
    return setTimeout(it, 100);
  }

  const {
    ICONO, TIENDA_ITEMS,
    getMonedas, setMonedas,
    getSkinsC, setSkinsC, getSkinsE, setSkinsE,
    cargarInv, guardarInv,
    notifMascota, aplicarSkins, getUserId
  } = API;

  const $   = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Favoritos / historial ---------- */
  const FAV_KEY  = () => `tienda_favs_${getUserId()}`;
  const HIST_KEY = () => `tienda_hist_${getUserId()}`;
  const getFavs  = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY()) || "[]"); } catch { return []; } };
  const setFavs  = a => { try { localStorage.setItem(FAV_KEY(), JSON.stringify(a)); } catch {} };
  const getHist  = () => { try { return JSON.parse(localStorage.getItem(HIST_KEY()) || "[]"); } catch { return []; } };
  const pushHist = item => {
    const h = getHist();
    h.unshift({ ...item, ts: Date.now() });
    if (h.length > 30) h.length = 30;
    try { localStorage.setItem(HIST_KEY(), JSON.stringify(h)); } catch {}
  };
  const getMascota = () => localStorage.getItem("mascota_actual") || "mapache";

  /* ---------- Sprite sheets ---------- */
  const SHEETS = {
    main: {
      url:  window.SPRITE_SHEET?.url  || "img/tienda/admurin-items.png",
      cols: window.SPRITE_SHEET?.cols || 30,
      rows: window.SPRITE_SHEET?.rows || 110
    },
    comida: { url: "img/tienda/comida-sheet.png", cols: 5, rows: 5 },
    tienda: { url: "img/tienda/tienda-sheet.png", cols: 5, rows: 5 }
  };

  function construirPreview(item, esComida, id, cat) {
    if (cat === "fondos") {
      const clsFondo = `tienda-preview-fondo-${id}`;
      return `<div class="tienda-item-preview tienda-item-preview-fondo ${clsFondo}">${ICONO[item.icono] || ICONO.estrella || ""}</div>`;
    }
    if (item.spriteFile) {
      return `<div class="tienda-item-preview tienda-item-preview-fondo"><img class="tienda-item-sprite-custom" src="${item.spriteFile}" alt="${item.nombre}" loading="lazy" decoding="async"></div>`;
    }
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      const key = item.sheet || (esComida ? "comida" : "tienda");
      const s = SHEETS[key] || SHEETS.tienda;
      const [col, row] = item.sprite;
      if (Number.isInteger(col) && Number.isInteger(row) && col >= 0 && col < s.cols && row >= 0 && row < s.rows) {
        const px = s.cols > 1 ? (col / (s.cols - 1)) * 100 : 50;
        const py = s.rows > 1 ? (row / (s.rows - 1)) * 100 : 50;
        return `<div class="tienda-item-preview"><div class="tienda-item-sprite" style="background-image:url('${s.url}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${px}% ${py}%"></div></div>`;
      }
    }
    return `<div class="tienda-item-preview">${ICONO[item.icono] || ICONO.estrella || ""}</div>`;
  }

  /* ---------- HTML interno ---------- */
  function htmlTienda() {
    return `
      <div class="tienda-header">
        <h2 class="tienda-titulo">Tienda</h2>
        <div class="tienda-header-acciones">
          <span class="tienda-monedero">${ICONO.moneda || ""} <span class="tienda-monedas">0</span></span>
          <button type="button" class="tienda-cerrar-btn" aria-label="Cerrar tienda" title="Cerrar">✕</button>
        </div>
      </div>
      <div class="tienda-buscador">
        <input type="text" class="tienda-buscar" placeholder="Buscar objeto..." autocomplete="off" value="${busqueda || ""}">
        <div class="tienda-filtros">
          <button type="button" class="tienda-filtro ${filtroActivo === "todos" ? "active" : ""}" data-filtro="todos">Todos</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "nuevos" ? "active" : ""}" data-filtro="nuevos">Nuevos</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "comprados" ? "active" : ""}" data-filtro="comprados">Comprados</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "favoritos" ? "active" : ""}" data-filtro="favoritos">★ Favoritos</button>
        </div>
      </div>
      <div class="tienda-categorias" role="tablist">
        ${Object.keys(TIENDA_ITEMS).map((c) => `
          <button type="button" class="tienda-categoria ${c === categoriaActiva ? "active" : ""}" data-cat="${c}">${labelCat(c)}</button>
        `).join("")}
      </div>
      <div class="tienda-grid"></div>
      <div class="tienda-hist"></div>
    `;
  }

  const labelCat = c => ({
    comida:"Comida", cabeza:"Cabeza", cuello:"Cuello",
    ojos:"Ojos", fondos:"Fondos", efectos:"Efectos"
  })[c] || (c[0].toUpperCase() + c.slice(1));

  let categoriaActiva = "comida";
  let filtroActivo    = "todos";
  let busqueda        = "";
  let container       = null;
  let overlay         = null;

  /* ---------- Bind ---------- */
  function bind() {
    if (!container) return;
    qsa(".tienda-categoria", container).forEach(b => b.addEventListener("click", () => {
      qsa(".tienda-categoria", container).forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      categoriaActiva = b.dataset.cat;
      render();
    }));
    qsa(".tienda-filtro", container).forEach(b => b.addEventListener("click", () => {
      qsa(".tienda-filtro", container).forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      filtroActivo = b.dataset.filtro;
      render();
    }));
    const buscador = qs(".tienda-buscar", container);
    buscador?.addEventListener("input", () => {
      busqueda = buscador.value.trim().toLowerCase();
      render();
    });
    const btnCerrar = qs(".tienda-cerrar-btn", container);
    btnCerrar?.addEventListener("click", () => {
      cerrar();
    });
  }

  function activar(nuevoContainer) {
    if (!nuevoContainer) return;
    container = nuevoContainer;
    container.innerHTML = htmlTienda();
    bind();
    render();
  }

  /* ---------- API pública ---------- */
  function montar(nuevoContainer) {
    if (!nuevoContainer) return;
    if (!qs(".tienda-grid", nuevoContainer)) activar(nuevoContainer);
    else { container = nuevoContainer; render(); }
  }

  function abrir() {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "tienda-overlay";
      overlay.className = "tienda-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
      overlay.addEventListener("click", e => { if (e.target === overlay) cerrar(); });
      // Detener propagación de eventos táctiles, clicks y scroll para que no afecten a la pantalla principal
      ["touchstart", "touchmove", "touchend", "pointerdown", "pointerup", "pointermove", "click", "dblclick", "contextmenu"].forEach(evtName => {
        overlay.addEventListener(evtName, e => {
          e.stopPropagation();
          // Si el gesto ocurre en el fondo/backdrop fuera del panel de la tienda, prevenir acciones por defecto
          if (e.target === overlay && (evtName === "touchmove" || evtName === "wheel")) {
            e.preventDefault();
          }
        }, { passive: false });
      });
      // Prevenir rebote de scroll al llegar al borde del panel de la tienda
      overlay.addEventListener("wheel", e => {
        if (e.target === overlay) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: false });
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && overlay?.classList.contains("active")) cerrar();
      });
    }
    overlay.innerHTML = `<div class="tienda-panel">${htmlTienda()}</div>`;
    activar(qs(".tienda-panel", overlay));
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }

  function cerrar() {
    overlay?.classList.remove("active");
    overlay?.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }

  /* ---------- Precio con descuento ---------- */
  function precioConDescuento(item, esComida) {
    if (esComida) return item.precio;
    try {
      const b = window._getBonusActivos?.() || [];
      if (b.some(x => x.tipo === "descuento_tienda")) return Math.round(item.precio * 0.85);
    } catch {}
    return item.precio;
  }

  /* ---------- Render ---------- */
  function render() {
    if (!container || !document.body.contains(container)) return;
    const g = qs(".tienda-grid", container);
    if (!g) return;

    const items    = TIENDA_ITEMS[categoriaActiva] || {};
    const esComida = categoriaActiva === "comida";
    const co   = getSkinsC();
    const eq   = getSkinsE(getMascota());
    const favs = getFavs();
    const hist = getHist();
    const histIds = new Set(hist.slice(0, 20).map(h => h.id));

    let lista = Object.entries(items);
    if (busqueda) lista = lista.filter(([_, it]) => it.nombre.toLowerCase().includes(busqueda));
    if (filtroActivo === "comprados") lista = lista.filter(([id]) => esComida ? false : co.includes(id));
    if (filtroActivo === "nuevos")    lista = lista.filter(([id]) => !histIds.has(id));
    if (filtroActivo === "favoritos") lista = lista.filter(([id]) => favs.includes(id));

    const frag = document.createDocumentFragment();
    if (!lista.length) {
      const v = document.createElement("div");
      v.className = "tienda-vacio";
      v.textContent = "Sin resultados.";
      frag.appendChild(v);
    } else {
      lista.forEach(([id, item]) => frag.appendChild(crearItem(id, item, esComida, co, eq, favs)));
    }
    g.innerHTML = "";
    g.appendChild(frag);

    actualizarMonedero();
    renderHist();
    window.hidratarIconos?.(g);
  }

  function crearItem(id, item, esComida, co, eq, favs) {
    const it = document.createElement("article");
    it.className = "tienda-item";
    const comprado = !esComida && co.includes(id);
    const equipado = !esComida && eq[categoriaActiva] === id;
    const esFav    = favs.includes(id);
    const precio   = precioConDescuento(item, esComida);
    const puede    = getMonedas() >= precio;

    if (comprado) it.classList.add("comprado");
    if (equipado) it.classList.add("equipado");

    const desc = esComida
      ? `<span class="tienda-item-desc">+${item.efecto.hambre} <span data-icono="comida"></span> +${item.efecto.felicidad} <span data-icono="corazon"></span></span>`
      : `<span class="tienda-item-desc">${item.desc || "Adorno"}</span>`;

    const precioHtml = precio < item.precio
      ? `<span class="tienda-item-precio ${puede ? "" : "no-alcanza"}">${ICONO.moneda || ""} <s style="opacity:.5;font-size:.8em">${item.precio}</s> ${precio}</span>`
      : `<span class="tienda-item-precio ${puede ? "" : "no-alcanza"}">${ICONO.moneda || ""} ${item.precio}</span>`;

    const bonusBadge = (!esComida && item.bonus?.desc)
      ? `<span class="tienda-item-efecto">⚡ ${item.bonus.desc}</span>`
      : "";

    it.innerHTML = `
      <button type="button" class="tienda-fav ${esFav ? "activo" : ""}" title="Favorito">★</button>
      ${construirPreview(item, esComida, id, categoriaActiva)}
      <span class="tienda-item-nombre">${item.nombre}</span>
      ${desc}
      ${bonusBadge}
      ${precioHtml}
    `;

    qs(".tienda-fav", it).addEventListener("click", e => {
      e.stopPropagation();
      const f = getFavs();
      const idx = f.indexOf(id);
      if (idx === -1) f.push(id); else f.splice(idx, 1);
      setFavs(f);
      render();
    });

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tienda-item-btn";
    if (esComida) {
      btn.textContent = puede ? "Comprar x1" : "No alcanza";
      if (!puede) { btn.disabled = true; btn.classList.add("no-alcanza"); }
      btn.addEventListener("click", () => comprarComida(id, item));
    } else if (comprado) {
      btn.textContent = equipado ? "Quitar" : "Equipar";
      if (equipado) btn.classList.add("equipado");
      btn.addEventListener("click", () => equipar(id, categoriaActiva));
    } else {
      btn.textContent = puede ? "Comprar" : "No alcanza";
      if (!puede) { btn.disabled = true; btn.classList.add("no-alcanza"); }
      btn.addEventListener("click", () => comprarSkin(id, item));
    }
    it.appendChild(btn);
    return it;
  }

  function renderHist() {
    const c = qs(".tienda-hist", container);
    if (!c) return;
    const h = getHist().slice(0, 3);
    if (!h.length) { c.innerHTML = ""; return; }
    c.innerHTML = `<span class="tienda-hist-titulo">Recientes:</span>` +
      h.map(x => `<span class="tienda-hist-item">${x.nombre}</span>`).join("");
  }

  function actualizarMonedero() {
    if (!container) return;
    const m = qs(".tienda-monedas", container);
    if (m) m.textContent = getMonedas();
    const m2 = $("mm-monedas");
    if (m2) m2.textContent = getMonedas();
  }

  /* ---------- Acciones ---------- */
  function comprarComida(id, item) {
    if (getMonedas() < item.precio) return;
    setMonedas(getMonedas() - item.precio);
    const inv = cargarInv();
    inv[id] = (inv[id] || 0) + 1;
    guardarInv(inv);
    window._snd?.("moneda");
    notifMascota?.("¡Comprado!", `${item.nombre} (+1)`);
    pushHist({ id, nombre: item.nombre, cat: "comida" });
    window.dispatchEvent(new Event("sunad:tienda-compra"));
    render();
    window.dispatchEvent(new Event("sunad:inventario-refresh"));
  }

  function comprarSkin(id, item) {
    const precio = precioConDescuento(item, false);
    if (getMonedas() < precio) return;
    setMonedas(getMonedas() - precio);
    const c = getSkinsC();
    if (!c.includes(id)) c.push(id);
    setSkinsC(c);
    window._snd?.("compra");
    notifMascota?.("¡Comprado!", item.nombre);
    pushHist({ id, nombre: item.nombre, cat: categoriaActiva });
    window.dispatchEvent(new Event("sunad:tienda-compra"));
    render();
  }

  function equipar(id, zona) {
    const e = getSkinsE(getMascota());
    if (e[zona] === id) delete e[zona];
    else e[zona] = id;
    setSkinsE(getMascota(), e);
    aplicarSkins?.();
    window._snd?.("blip");
    render();
  }

  /* ---------- Listeners globales ---------- */
  window.addEventListener("sunad:tienda-compra", () => { if (container) render(); });
  window.addEventListener("sunad:mascota-cambiada", () => { if (container) render(); });

  /* ---------- API pública ---------- */
  window.Tienda = { abrir, cerrar, render, montar };
  window.dispatchEvent(new Event("sunad:tienda-ready"));
  console.log("✅ tienda.js listo");
})();