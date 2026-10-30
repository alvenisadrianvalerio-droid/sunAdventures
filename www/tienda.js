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
    notifMascota, aplicarSkins,
    comprarMascota, esComprable, desbloqueada, getMascotasCompradas, DESBLOQUEO, MASCOTAS,
    getUserId
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
    tienda: { url: "img/tienda/tienda-sheet.png", cols: 5, rows: 5 },
    loot1:  { url: "img/rpg/loot-2.png", cols: 8, rows: 9 }
  };

  function construirPreview(item, esComida, id, cat) {
    if (cat === "mascotas") {
      const srcImg = item.imagen || (MASCOTAS?.[id]?.imagen) || "img/mapache.png";
      return `<div class="tienda-item-preview tienda-item-preview-mascota"><img src="${srcImg}" alt="${item.nombre}" style="width:58px;height:58px;object-fit:contain;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png';"></div>`;
    }
    if (cat === "fondos") {
      const clsFondo = `tienda-preview-fondo-${id}`;
      return `<div class="tienda-item-preview tienda-item-preview-fondo ${clsFondo}"><img src="img/fondos/${id}.svg" alt="${item.nombre}" style="width:68px;height:68px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.45));" loading="lazy" decoding="async" onerror="this.style.display='none'"></div>`;
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

  /* ---------- Items Míticos / Reliquias Míticas ---------- */
  const ITEMS_MITICOS = {
    "item-6-0": { nombre: "Espada Fauna", precio: 2500, sprite: [6, 0], sheet: "loot1", rar: "mitico", desc: "Drena el alma enemiga. +10 ATK, +10 Lifesteal, +50 HP, +10 Veneno." },
    "item-7-0": { nombre: "Espada Girasol", precio: 4500, sprite: [7, 0], sheet: "loot1", rar: "mitico", desc: "El poder absoluto sobre todo lo vivo. +20 ATK, +20 DEF, +50 HP, Regen, Lifesteal, Thorns." },
    "item-7-1": { nombre: "Rebanadora", precio: 2200, sprite: [7, 1], sheet: "loot1", rar: "mitico", desc: "Rebana el viento a gran velocidad. +10 ATK, +10 Esq, +100 Regen, +100 HP." },
    "item-5-2": { nombre: "Naturaleza", precio: 2800, sprite: [5, 2], sheet: "loot1", rar: "mitico", desc: "Hace temblar el suelo. +10 ATK, +100 Veneno, +100 Thorns, +200 HP." },
    "item-6-2": { nombre: "Astrología", precio: 3200, sprite: [6, 2], sheet: "loot1", rar: "mitico", desc: "Poder cósmico ancestral. +20 ATK, +20 Crit, +20 Esq, +200 HP." },
    "item-0-4": { nombre: "Colgante de Escudo", precio: 2400, sprite: [0, 4], sheet: "loot1", rar: "mitico", desc: "Lágrima de girasol encapsulada. +50 DEF y genera 300 escudo por turno." },
    "item-1-4": { nombre: "Estrella Encapsulada", precio: 3000, sprite: [1, 4], sheet: "loot1", rar: "mitico", desc: "Energía astronómica incontrolable. +20 ATK, +20 XP, +10 Lifesteal." },
    "item-2-4": { nombre: "Colmillo Ancestral", precio: 2800, sprite: [2, 4], sheet: "loot1", rar: "mitico", desc: "Colmillo de vampiro milenario. +50 Lifesteal y robo de vida masivo." },
    "item-3-4": { nombre: "Calavera Encapsulada", precio: 2600, sprite: [3, 4], sheet: "loot1", rar: "mitico", desc: "Aura de putrefacción letal. +500 Veneno y reduce ataque del rival." },
    "item-4-4": { nombre: "Pergamino de Escudo", precio: 2900, sprite: [4, 4], sheet: "loot1", rar: "mitico", desc: "Conocimiento arcano de defensa. +100 DEF, +40 XP y esquiva." },
    "item-7-5": { nombre: "Oda a la Incertidumbre", precio: 3200, sprite: [7, 5], sheet: "loot1", rar: "mitico", desc: "Compañera de la guerra. +300 HP, +50 DEF, +300 Thorns, +20 Esq." },
    "item-3-6": { nombre: "Zapatos de Mago", precio: 2700, sprite: [3, 6], sheet: "loot1", rar: "mitico", desc: "Pasos mágicos imperceptibles. +50 Esq, +50 DEF, +100 HP." },
    "item-2-7": { nombre: "Oda a la Miseria", precio: 3400, sprite: [2, 7], sheet: "loot1", rar: "mitico", desc: "Daño indirecto demoledor. +40 Esq, +200 Thorns, +100 Veneno, +10 Lifesteal." },
    "item-4-7": { nombre: "Mano de Mono", precio: 2500, sprite: [4, 7], sheet: "loot1", rar: "mitico", desc: "Fortuna y tesoros sin fin. +100% Oro droppeado." },
    "item-1-8": { nombre: "Queso para Dragones", precio: 2000, sprite: [1, 8], sheet: "loot1", rar: "mitico", desc: "Manjar divino para bestias. +500 HP, +25 ATK." }
  };

  /* ---------- HTML interno ---------- */
  function htmlTienda() {
    const cats = ["mascotas", "miticos", ...Object.keys(TIENDA_ITEMS)];
    return `
      <div class="tienda-header">
        <h2 class="tienda-titulo">Tienda</h2>
        <div class="tienda-header-acciones">
          <span class="tienda-monedero">${ICONO.moneda || ""} <span class="tienda-monedas">0</span></span>
          <button type="button" class="tienda-cerrar-btn" aria-label="Cerrar tienda" title="Cerrar">✕</button>
        </div>
      </div>
      <div class="tienda-buscador">
        <input type="text" class="tienda-buscar" placeholder="Buscar objeto o mascota..." autocomplete="off" value="${busqueda || ""}">
        <div class="tienda-filtros">
          <button type="button" class="tienda-filtro ${filtroActivo === "todos" ? "active" : ""}" data-filtro="todos">Todos</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "nuevos" ? "active" : ""}" data-filtro="nuevos">Nuevos</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "comprados" ? "active" : ""}" data-filtro="comprados">Comprados</button>
          <button type="button" class="tienda-filtro ${filtroActivo === "favoritos" ? "active" : ""}" data-filtro="favoritos">★ Favoritos</button>
        </div>
      </div>
      <div class="tienda-categorias" role="tablist">
        ${cats.map((c) => `
          <button type="button" class="tienda-categoria ${c === categoriaActiva ? "active" : ""}" data-cat="${c}">${labelCat(c)}</button>
        `).join("")}
      </div>
      <div class="tienda-grid"></div>
      <div class="tienda-hist"></div>
    `;
  }

  const labelCat = c => ({
    mascotas:"🐾 Mascotas",
    miticos:"🔮 Míticos",
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

    const esMascotas = categoriaActiva === "mascotas";
    const esComida = categoriaActiva === "comida";
    const esMiticos = categoriaActiva === "miticos";
    let items = {};
    if (esMascotas) {
      Object.keys(MASCOTAS || {}).forEach(id => {
        const d = DESBLOQUEO?.[id] || { tipo:"compra", precio:1000 };
        const m = MASCOTAS[id];
        items[id] = {
          nombre: m.nombre,
          precio: d.precio || 1000,
          reqNivel: d.reqNivel || 1,
          tipo: d.tipo,
          imagen: m.imagen,
          desc: `Mascota compañera (${m.favorita ? "le gusta " + m.favorita : "fiel"})`
        };
      });
    } else if (esMiticos) {
      items = ITEMS_MITICOS;
    } else {
      items = TIENDA_ITEMS[categoriaActiva] || {};
    }

    const co   = getSkinsC();
    const eq   = getSkinsE(getMascota());
    const favs = getFavs();
    const hist = getHist();
    const histIds = new Set(hist.slice(0, 20).map(h => h.id));
    const compMascotas = getMascotasCompradas?.() || [];
    const rpgLoot = window.RpgLoot?.cargarLoot?.() || {};

    let lista = Object.entries(items);
    if (busqueda) lista = lista.filter(([_, it]) => it.nombre.toLowerCase().includes(busqueda));
    if (filtroActivo === "comprados") {
      lista = lista.filter(([id, it]) => {
        if (esMascotas) return it.tipo === "inicial" || compMascotas.includes(id);
        if (esComida) return false;
        if (esMiticos) return (Number(rpgLoot[id]) || 0) > 0;
        return co.includes(id);
      });
    }
    if (filtroActivo === "nuevos")    lista = lista.filter(([id]) => !histIds.has(id));
    if (filtroActivo === "favoritos") lista = lista.filter(([id]) => favs.includes(id));

    const frag = document.createDocumentFragment();
    if (!lista.length) {
      const v = document.createElement("div");
      v.className = "tienda-vacio";
      v.textContent = "Sin resultados.";
      frag.appendChild(v);
    } else {
      lista.forEach(([id, item]) => frag.appendChild(crearItem(id, item, esComida, esMascotas, co, eq, favs, compMascotas, esMiticos, rpgLoot)));
    }
    g.innerHTML = "";
    g.appendChild(frag);

    actualizarMonedero();
    renderHist();
    window.hidratarIconos?.(g);
  }

  function crearItem(id, item, esComida, esMascotas, co, eq, favs, compMascotas = [], esMiticos = false, rpgLoot = {}) {
    const it = document.createElement("article");
    it.className = "tienda-item";
    const mascComprada = esMascotas && (item.tipo === "inicial" || compMascotas.includes(id));
    const mascEnUso    = esMascotas && (getMascota() === id);
    const cantLoot     = esMiticos ? (Number(rpgLoot[id]) || 0) : 0;
    const comprado     = esMascotas ? mascComprada : esMiticos ? false : (!esComida && co.includes(id));
    const equipado     = esMascotas ? mascEnUso : (!esComida && !esMiticos && eq[categoriaActiva] === id);
    const esFav        = favs.includes(id);
    const precio       = (esComida || esMascotas || esMiticos) ? item.precio : precioConDescuento(item, esComida);
    const puede        = getMonedas() >= precio;

    if (comprado) it.classList.add("comprado");
    if (equipado) it.classList.add("equipado");
    if (esMiticos) it.classList.add("tienda-item-mitico");

    let desc = "";
    if (esMascotas) {
      desc = `<span class="tienda-item-desc">${mascEnUso ? "⭐ En uso actual" : item.desc}</span>`;
    } else if (esComida) {
      desc = `<span class="tienda-item-desc">+${item.efecto?.hambre || 10} <span data-icono="comida"></span> +${item.efecto?.felicidad || 10} <span data-icono="corazon"></span></span>`;
    } else if (esMiticos) {
      desc = `<span class="tienda-item-desc" style="color:#ffb3cc;">${item.desc}${cantLoot > 0 ? ` <strong style="color:var(--accent);display:inline-block;margin-top:2px;">(Posees: x${cantLoot})</strong>` : ""}</span>`;
    } else {
      desc = `<span class="tienda-item-desc">${item.desc || "Adorno"}</span>`;
    }

    const precioHtml = (!comprado && item.tipo !== "inicial")
      ? (precio < item.precio
          ? `<span class="tienda-item-precio ${puede ? "" : "no-alcanza"}">${ICONO.moneda || ""} <s style="opacity:.5;font-size:.8em">${item.precio}</s> ${precio}</span>`
          : `<span class="tienda-item-precio ${puede ? "" : "no-alcanza"}">${ICONO.moneda || ""} ${item.precio}</span>`)
      : `<span class="tienda-item-precio" style="color:var(--accent);">✓ Desbloqueada</span>`;

    const bonusBadge = esMiticos
      ? `<span class="tienda-item-efecto" style="background:rgba(255,107,157,0.15);border:1px solid rgba(255,107,157,0.4);color:#ff6b9d;">✨ Reliquia Mítica</span>`
      : (!esComida && !esMascotas && item.bonus?.desc)
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

    if (esMascotas) {
      if (mascEnUso) {
        btn.textContent = "En uso";
        btn.classList.add("equipado");
        btn.disabled = true;
      } else if (mascComprada) {
        btn.textContent = "Acompañar";
        btn.addEventListener("click", () => {
          localStorage.setItem("mascota_actual", id);
          window._snd?.("blip");
          window.dispatchEvent(new Event("sunad:mascota-cambiada"));
          window.dispatchEvent(new Event("sunad:progress"));
          render();
        });
      } else {
        btn.textContent = puede ? "Comprar" : "No alcanza";
        if (!puede) { btn.disabled = true; btn.classList.add("no-alcanza"); }
        btn.addEventListener("click", () => {
          if (comprarMascota(id)) {
            pushHist({ id, nombre: item.nombre, cat: "mascotas" });
            render();
          }
        });
      }
    } else if (esMiticos) {
      btn.textContent = puede ? "Comprar Mítico" : "No alcanza";
      if (!puede) { btn.disabled = true; btn.classList.add("no-alcanza"); }
      btn.addEventListener("click", () => comprarMitico(id, item));
    } else if (esComida) {
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
  function comprarMitico(id, item) {
    if (getMonedas() < item.precio) return;
    setMonedas(getMonedas() - item.precio);

    if (window.RpgLoot?.cargarLoot && window.RpgLoot?.guardarLoot) {
      const loot = window.RpgLoot.cargarLoot();
      loot[id] = (loot[id] || 0) + 1;
      window.RpgLoot.guardarLoot(loot);
      try {
        const pool = window.RpgLoot.POOL || [];
        const poolItem = pool.find(p => p.id === id);
        if (poolItem && typeof window.RpgLoot.aplicarBonus === "function") {
          window.RpgLoot.aplicarBonus(poolItem);
        }
      } catch {}
      window.RpgLoot.renderColeccion?.();
    }

    window._snd?.("victoria");
    notifMascota?.("¡Reliquia Mítica Adquirida!", `${item.nombre}`);
    pushHist({ id, nombre: item.nombre, cat: "miticos" });
    window.dispatchEvent(new CustomEvent("rpg:item-obtenido", { detail: { id, rar: "mitico" } }));
    window.dispatchEvent(new Event("sunad:tienda-compra"));
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
    render();
  }

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