/* ============================================================
   TIENDA.JS — Tienda de SunAdventures
   · Se monta como pestaña embebida (Tienda.montar)
   · Y como overlay clásico (Tienda.abrir)
   · Auto-refresco al comprar, equipar o abrir el modal
   · Soporta sprites pixel-art (item.sprite = [col, row])
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const intentar = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 50) return console.warn("tienda.js: _TiendaAPI nunca llegó");
      setTimeout(intentar, 100);
    };
    window.addEventListener("sunadventures:api-ready", () => boot(), { once: true });
    setTimeout(intentar, 100);
    return;
  }

  const {
    ICONO, TIENDA_ITEMS,
    getMonedas, setMonedas,
    getSkinsC, setSkinsC, getSkinsE, setSkinsE,
    cargarInv, guardarInv,
    notifMascota, aplicarSkins, getUserId
  } = API;

  const $   = (id) => document.getElementById(String(id).replace(/^#/, ""));
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  const FAV_KEY  = () => `tienda_favs_${getUserId()}`;
  const HIST_KEY = () => `tienda_hist_${getUserId()}`;
  const getFavs  = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY()) || "[]"); } catch { return []; } };
  const setFavs  = (a) => { try { localStorage.setItem(FAV_KEY(), JSON.stringify(a)); } catch {} };
  const getHist  = () => { try { return JSON.parse(localStorage.getItem(HIST_KEY()) || "[]"); } catch { return []; } };
  const pushHist = (item) => {
    const h = getHist();
    h.unshift({ ...item, ts: Date.now() });
    if (h.length > 30) h.length = 30;
    try { localStorage.setItem(HIST_KEY(), JSON.stringify(h)); } catch {}
  };
  const getMascotaActual = () => localStorage.getItem("mascota_actual") || "mapache";

  let categoriaActiva = "comida";
  let filtroActivo    = "todos";
  let busqueda        = "";
  let container       = null;
  let overlay         = null;

  function labelCat(c) {
    const map = { comida: "Comida", cabeza: "Cabeza", cuello: "Cuello", ojos: "Ojos", fondos: "Fondos", efectos: "Efectos" };
    return map[c] || (c[0].toUpperCase() + c.slice(1));
  }

  /* ============================================================
     SPRITE SHEET DE COMIDA
     ------------------------------------------------------------
     La hoja tiene 5 columnas x 5 filas.
     El item define: sprite: [col, row]  (0-indexado)
     · background-size: 500% 500%
     · background-position: (col * 25)% (row * 25)%
     ============================================================ */
  const SPRITE_SHEET = {
    url: "img/tienda/comida-sheet.png",
    cols: 5,
    rows: 5
  };

  function construirPreview(item, esComida) {
    const iconoSVG = ICONO[item.icono] || ICONO.estrella || "";

    // Si es comida y tiene coordenadas de sprite → usamos el PNG
    if (esComida && Array.isArray(item.sprite) && item.sprite.length === 2) {
      const [col, row] = item.sprite;
      const posX = (col / (SPRITE_SHEET.cols - 1)) * 100;
      const posY = (row / (SPRITE_SHEET.rows - 1)) * 100;
      return `<div class="tienda-item-preview"><div class="tienda-item-sprite" style="background-position:${posX}% ${posY}%"></div></div>`;
    }

    // Fallback: SVG dorado de siempre
    return `<div class="tienda-item-preview">${iconoSVG}</div>`;
  }

  /* ---------- HTML interno (sin overlay) ---------- */
  function htmlTienda() {
    return `
      <div class="tienda-header">
        <h2 class="tienda-titulo">Tienda</h2>
        <span class="tienda-monedero">${ICONO.moneda || ""} <span class="tienda-monedas">0</span></span>
      </div>

      <div class="tienda-buscador">
        <input type="text" class="tienda-buscar" placeholder="Buscar objeto..." autocomplete="off">
        <div class="tienda-filtros">
          <button type="button" class="tienda-filtro active" data-filtro="todos">Todos</button>
          <button type="button" class="tienda-filtro" data-filtro="nuevos">Nuevos</button>
          <button type="button" class="tienda-filtro" data-filtro="comprados">Comprados</button>
          <button type="button" class="tienda-filtro" data-filtro="favoritos">★ Favoritos</button>
        </div>
      </div>

      <div class="tienda-categorias" role="tablist">
        ${Object.keys(TIENDA_ITEMS).map((c, i) => `
          <button type="button" class="tienda-categoria ${i === 0 ? "active" : ""}" data-cat="${c}">
            ${labelCat(c)}
          </button>
        `).join("")}
      </div>

      <div class="tienda-grid"></div>
      <div class="tienda-hist"></div>
    `;
  }

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
      overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrar(); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay?.classList.contains("active")) cerrar();
      });
    }
    overlay.innerHTML = `<div class="tienda-panel">${htmlTienda()}</div>`;
    activar(qs(".tienda-panel", overlay));
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cerrar() {
    overlay?.classList.remove("active");
    overlay?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ---------- Render ---------- */
  function render() {
    if (!container || !document.body.contains(container)) return;
    const g = qs(".tienda-grid", container);
    if (!g) return;
    g.innerHTML = "";

    const items    = TIENDA_ITEMS[categoriaActiva] || {};
    const esComida = categoriaActiva === "comida";
    const co   = getSkinsC();
    const eq   = getSkinsE(getMascotaActual());
    const favs = getFavs();
    const hist = getHist();
    const histIds = new Set(hist.slice(0, 20).map(h => h.id));

    let lista = Object.entries(items);
    if (busqueda) lista = lista.filter(([_, it]) => it.nombre.toLowerCase().includes(busqueda));
    if (filtroActivo === "comprados") lista = lista.filter(([id]) => esComida ? false : co.includes(id));
    if (filtroActivo === "nuevos")    lista = lista.filter(([id]) => !histIds.has(id));
    if (filtroActivo === "favoritos") lista = lista.filter(([id]) => favs.includes(id));

    if (!lista.length) {
      g.innerHTML = `<div class="tienda-vacio">Sin resultados.</div>`;
    } else {
      lista.forEach(([id, item]) => g.appendChild(crearItem(id, item, esComida, co, eq, favs)));
    }

    actualizarMonedero();
    renderHist();
    if (typeof window.hidratarIconos === "function") window.hidratarIconos(g);
  }

  function crearItem(id, item, esComida, co, eq, favs) {
    const it = document.createElement("article");
    it.className = "tienda-item";
    const comprado = !esComida && co.includes(id);
    const equipado = !esComida && eq[categoriaActiva] === id;
    const puede    = getMonedas() >= item.precio;
    const esFav    = favs.includes(id);
    if (comprado) it.classList.add("comprado");
    if (equipado) it.classList.add("equipado");

    const previewHTML = construirPreview(item, esComida);

    const desc = esComida
      ? `<span class="tienda-item-desc">+${item.efecto.hambre} <span data-icono="comida"></span> +${item.efecto.felicidad} <span data-icono="corazon"></span></span>`
      : `<span class="tienda-item-desc">${item.desc || "Adorno"}</span>`;

    it.innerHTML = `
      <button type="button" class="tienda-fav ${esFav ? "activo" : ""}" title="Favorito">★</button>
      ${previewHTML}
      <span class="tienda-item-nombre">${item.nombre}</span>
      ${desc}
      <span class="tienda-item-precio ${puede ? "" : "no-alcanza"}">${ICONO.moneda || ""} ${item.precio}</span>
    `;

    qs(".tienda-fav", it).addEventListener("click", (e) => {
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
    const cont = qs(".tienda-hist", container);
    if (!cont) return;
    const h = getHist().slice(0, 3);
    if (!h.length) { cont.innerHTML = ""; return; }
    cont.innerHTML = `<span class="tienda-hist-titulo">Recientes:</span>` +
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
    if (typeof window._snd === "function") window._snd("moneda");
    notifMascota?.("¡Comprado!", `${item.nombre} (+1)`);
    pushHist({ id, nombre: item.nombre, cat: "comida" });
    window.dispatchEvent(new Event("sunadventures:tienda-compra"));
    render();
    window.dispatchEvent(new Event("sunadventures:inventario-refresh"));
  }

  function comprarSkin(id, item) {
    if (getMonedas() < item.precio) return;
    setMonedas(getMonedas() - item.precio);
    const c = getSkinsC();
    if (!c.includes(id)) c.push(id);
    setSkinsC(c);
    if (typeof window._snd === "function") window._snd("compra");
    notifMascota?.("¡Comprado!", item.nombre);
    pushHist({ id, nombre: item.nombre, cat: categoriaActiva });
    window.dispatchEvent(new Event("sunadventures:tienda-compra"));
    render();
  }

  function equipar(id, zona) {
    const e = getSkinsE(getMascotaActual());
    if (e[zona] === id) delete e[zona];
    else e[zona] = id;
    setSkinsE(getMascotaActual(), e);
    aplicarSkins?.();
    if (typeof window._snd === "function") window._snd("blip");
    render();
  }

  /* ---------- API pública ---------- */
  window.Tienda = { abrir, cerrar, render, montar };
  window.dispatchEvent(new Event("sunadventures:tienda-ready"));
  console.log("✅ tienda.js listo");
})();