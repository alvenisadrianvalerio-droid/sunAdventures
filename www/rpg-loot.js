/* ============================================================
   RPG-LOOT.JS — Sistema de botín con sprites SVG + PNG Admurin
   · Escucha "rpg:victoria" y suelta items con bonus reales
   · Sistema híbrido: usa sprite PNG si tiene coords válidas,
     si no, cae a SVG dorado automáticamente
   · Guarda colección por usuario en localStorage
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const intentar = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 50) return console.warn("rpg-loot.js: _TiendaAPI nunca llegó");
      setTimeout(intentar, 100);
    };
    setTimeout(intentar, 100);
    return;
  }

  /* ---------- Dependencias ---------- */
  const { notifMascota, getUserId } = API;

  const $   = (id) => document.getElementById(String(id).replace(/^#/, ""));
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SND = (t) => { try { window._snd?.(t); } catch {} };

  /* ============================================================
     CONFIGURACIÓN DEL SPRITE SHEET
     Ajusta cols/rows según tu hoja de Admurin
     ============================================================ */
  const SHEET = {
    url:  "img/tienda/admurin-items.png",
    cols: 10,   // ← ancho en número de sprites
    rows: 100   // ← alto en número de sprites
  };

  /* ============================================================
     RENDER DE ICONO — sprite si tiene coords, SVG si no
     ============================================================ */
  function renderIcono(item, size = null) {
    // Caso 1: tiene coords válidas → sprite PNG
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      const [col, row] = item.sprite;
      if (col >= 0 && col < SHEET.cols && row >= 0 && row < SHEET.rows) {
        const posX = SHEET.cols > 1 ? (col / (SHEET.cols - 1)) * 100 : 50;
        const posY = SHEET.rows > 1 ? (row / (SHEET.rows - 1)) * 100 : 50;
        const sizeStyle = size ? `width:${size};height:${size};` : "";
        return `<div class="loot-sprite" style="
          ${sizeStyle}
          background-image:url('${SHEET.url}');
          background-size:${SHEET.cols * 100}% ${SHEET.rows * 100}%;
          background-position:${posX}% ${posY}%;
        "></div>`;
      }
    }
    // Caso 2: fallback → SVG con color de rareza
    return `<span class="loot-icono" data-icono="${item.icono || "estrella"}"></span>`;
  }

  /* ============================================================
     PERSISTENCIA
     ============================================================ */
  const KEY_LOOT  = () => `sa_rpg_loot_${getUserId()}`;
  const KEY_STATS = () => `sa_rpg_stats_${getUserId()}`;

  const cargarLoot = () => {
    try { return JSON.parse(localStorage.getItem(KEY_LOOT()) || "{}"); }
    catch { return {}; }
  };
  const guardarLoot = (o) => {
    try { localStorage.setItem(KEY_LOOT(), JSON.stringify(o)); } catch {}
  };

  const cargarStats = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY_STATS()) ||
        '{"atkBonus":0,"defBonus":0,"hpBonus":0}');
    } catch { return { atkBonus: 0, defBonus: 0, hpBonus: 0 }; }
  };
  const guardarStats = (o) => {
    try { localStorage.setItem(KEY_STATS(), JSON.stringify(o)); } catch {}
  };

  /* ============================================================
     CATÁLOGO DE OBJETOS
     - `icono`: clave de ICONO (SVG de respaldo)
     - `sprite`: [col, row] opcional → si está, pinta el PNG
     - `tipo`: hp | atk | def  ·  `val`: valor del bonus
     - `rar`:  comun | raro | epico | legendario
     ============================================================ */
  const POOL = [
    /* --- Hierbas / plantas --- */
    { id:"hoja-verde",    nombre:"Hoja de rocío",   icono:"raiz",       tipo:"hp",  val:5,  rar:"comun"     /*, sprite:[0,0]*/ },
    { id:"flor-roja",     nombre:"Flor de brasa",   icono:"girasol",    tipo:"hp",  val:8,  rar:"comun"     /*, sprite:[1,0]*/ },
    { id:"hongo",         nombre:"Hongo lunar",     icono:"girasol",    tipo:"hp",  val:10, rar:"raro"      /*, sprite:[2,0]*/ },

    /* --- Pociones --- */
    { id:"pocion-roja",   nombre:"Poción menor",    icono:"pocion",     tipo:"hp",  val:20, rar:"comun"     /*, sprite:[0,5]*/ },
    { id:"pocion-azul",   nombre:"Poción de maná",  icono:"pocion",     tipo:"atk", val:2,  rar:"raro"      /*, sprite:[1,5]*/ },
    { id:"pocion-morada", nombre:"Elixir arcano",   icono:"pocionAmor", tipo:"atk", val:3,  rar:"epico"     /*, sprite:[2,5]*/ },
    { id:"pocion-dorada", nombre:"Elixir de héroe", icono:"pocion",     tipo:"hp",  val:35, rar:"epico"     /*, sprite:[3,5]*/ },

    /* --- Tomos / pergaminos --- */
    { id:"libro-verde",   nombre:"Tomo olvidado",   icono:"pergamino",  tipo:"atk", val:2,  rar:"raro"      /*, sprite:[0,8]*/ },
    { id:"libro-rojo",    nombre:"Grimorio ígneo",  icono:"pergamino",  tipo:"atk", val:3,  rar:"epico"     /*, sprite:[1,8]*/ },
    { id:"libro-azul",    nombre:"Códice de hielo", icono:"pergamino",  tipo:"def", val:2,  rar:"epico"     /*, sprite:[2,8]*/ },

    /* --- Gemas --- */
    { id:"gema-verde",    nombre:"Jade menuda",     icono:"gema",       tipo:"def", val:1,  rar:"comun"     /*, sprite:[0,20]*/ },
    { id:"gema-azul",     nombre:"Zafiro",          icono:"gema",       tipo:"def", val:2,  rar:"raro"      /*, sprite:[1,20]*/ },
    { id:"gema-roja",     nombre:"Rubí",            icono:"gema",       tipo:"atk", val:2,  rar:"raro"      /*, sprite:[2,20]*/ },
    { id:"gema-morada",   nombre:"Amatista",        icono:"gema",       tipo:"atk", val:3,  rar:"epico"     /*, sprite:[3,20]*/ },
    { id:"gema-dorada",   nombre:"Topacio real",    icono:"gema",       tipo:"hp",  val:30, rar:"epico"     /*, sprite:[4,20]*/ },

    /* --- Armas --- */
    { id:"daga",          nombre:"Daga oxidada",    icono:"espada",     tipo:"atk", val:1,  rar:"comun"     /*, sprite:[0,30]*/ },
    { id:"espada",        nombre:"Espada de acero", icono:"espada",     tipo:"atk", val:3,  rar:"raro"      /*, sprite:[1,30]*/ },
    { id:"hacha",         nombre:"Hacha doble",     icono:"espada",     tipo:"atk", val:4,  rar:"epico"     /*, sprite:[2,30]*/ },
    { id:"baston",        nombre:"Bastón antiguo",  icono:"varita",     tipo:"atk", val:5,  rar:"epico"     /*, sprite:[3,30]*/ },
    { id:"espada-legend", nombre:"Filo del alba",   icono:"espada",     tipo:"atk", val:8,  rar:"legendario"/*, sprite:[4,30]*/ },

    /* --- Cofres / monedas --- */
    { id:"moneda-oro",    nombre:"Moneda antigua",  icono:"moneda",     tipo:"hp",  val:15, rar:"comun"     /*, sprite:[0,40]*/ },
    { id:"cofre-madera",  nombre:"Cofre pequeño",   icono:"cofre",      tipo:"hp",  val:25, rar:"raro"      /*, sprite:[1,40]*/ },
    { id:"cofre-dorado",  nombre:"Cofre del alba",  icono:"cofre",      tipo:"hp",  val:50, rar:"legendario"/*, sprite:[2,40]*/ },

    /* --- Coronas / reliquias --- */
    { id:"corona-plata",  nombre:"Corona de plata", icono:"corona",     tipo:"def", val:3,  rar:"epico"     /*, sprite:[0,50]*/ },
    { id:"corona-oro",    nombre:"Corona dorada",   icono:"corona",     tipo:"def", val:5,  rar:"legendario"/*, sprite:[1,50]*/ },
    { id:"llave-antigua", nombre:"Llave antigua",   icono:"llaveDorada",tipo:"hp",  val:20, rar:"raro"      /*, sprite:[0,60]*/ },
    { id:"reliquia",      nombre:"Reliquia perdida",icono:"medalla",    tipo:"def", val:4,  rar:"legendario"/*, sprite:[1,60]*/ }
  ];

  /* ============================================================
     RAREZAS
     ============================================================ */
  const RAREZAS = {
    comun:      { prob: 0.70, label: "Común"      },
    raro:       { prob: 0.20, label: "Raro"       },
    epico:      { prob: 0.08, label: "Épico"      },
    legendario: { prob: 0.02, label: "Legendario" }
  };

  /* ============================================================
     SORTEO DE ITEM
     ============================================================ */
  function sortearRareza(jefe) {
    const r = Math.random();
    if (jefe) {
      if (r < 0.10) return "legendario";
      if (r < 0.40) return "epico";
      if (r < 0.80) return "raro";
      return "comun";
    }
    let acc = 0;
    for (const [k, v] of Object.entries(RAREZAS)) {
      acc += v.prob;
      if (r <= acc) return k;
    }
    return "comun";
  }

  function sortearItem(jefe = false) {
    const rar = sortearRareza(jefe);
    const candidatos = POOL.filter(p => p.rar === rar);
    return candidatos[rnd(0, candidatos.length - 1)] || POOL[0];
  }

  /* ============================================================
     APLICAR BONUS AL HÉROE
     ============================================================ */
  function aplicarBonus(item) {
    const stats = cargarStats();
    if (item.tipo === "atk") stats.atkBonus += item.val;
    if (item.tipo === "def") stats.defBonus += item.val;
    if (item.tipo === "hp")  stats.hpBonus  += item.val;
    guardarStats(stats);
    // Avisar al RPG para que recalcule HP máx y re-clampee
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }

  /* ============================================================
     POPUP (toast arriba-derecha)
     ============================================================ */
  function mostrarPopup(item) {
    let cont = $("loot-popup");
    if (!cont) {
      cont = document.createElement("div");
      cont.id = "loot-popup";
      cont.className = "loot-popup";
      document.body.appendChild(cont);
    }

    const card = document.createElement("div");
    card.className = "loot-card rar-" + item.rar;
    card.innerHTML = `
      <div class="loot-card-icon">${renderIcono(item, "44px")}</div>
      <div class="loot-card-copy">
        <span class="loot-card-rarity">${RAREZAS[item.rar].label}</span>
        <span class="loot-card-name">${item.nombre}</span>
        <span class="loot-card-bonus">+${item.val} ${item.tipo.toUpperCase()}</span>
      </div>
    `;
    cont.appendChild(card);

    if (typeof window.hidratarIconos === "function") window.hidratarIconos(card);

    setTimeout(() => card.remove(), 3600);
  }

  /* ============================================================
     HOOK: escuchar victorias del RPG
     ============================================================ */
  window.addEventListener("rpg:victoria", (e) => {
    const enemigo = e.detail?.enemigo;
    if (!enemigo) return;

    // Probabilidad de drop: jefe 100%, normal 45%
    const prob = enemigo.jefe ? 1 : 0.45;
    if (Math.random() > prob) return;

    const item = sortearItem(!!enemigo.jefe);

    // Guardar en el inventario de botín
    const loot = cargarLoot();
    loot[item.id] = (loot[item.id] || 0) + 1;
    guardarLoot(loot);

    // Aplicar bonus permanente
    aplicarBonus(item);

    // Sonido según rareza
    if (item.rar === "legendario") SND("victoria");
    else if (item.rar === "epico")  SND("sparkle");
    else                            SND("moneda");

    // Popup + notificación
    mostrarPopup(item);
    try { notifMascota?.("¡Botín!", `${RAREZAS[item.rar].label}: ${item.nombre}`); } catch {}

    // Refrescar panel de colección si está visible
    renderColeccion();
  });

  /* ============================================================
     PANEL DE COLECCIÓN
     ============================================================ */
  function renderColeccion() {
    const cont = $("rpg-coleccion");
    if (!cont) return;

    const loot  = cargarLoot();
    const total = Object.values(loot).reduce((a, b) => a + b, 0);
    const unicos = Object.keys(loot).length;

    cont.innerHTML = `
      <div class="rpg-coleccion-header">
        <span class="rpg-coleccion-titulo">🎒 Colección</span>
        <span class="rpg-coleccion-count">${unicos} / ${POOL.length} · ${total} objetos</span>
      </div>
      <div class="rpg-coleccion-grid">
        ${POOL.map(p => {
          const tiene = loot[p.id] || 0;
          return `
            <div class="rpg-coleccion-item rar-${p.rar} ${tiene ? "" : "bloqueado"}"
                 title="${tiene ? p.nombre : "???"} (${RAREZAS[p.rar].label})">
              ${renderIcono(p)}
              ${tiene ? `<span class="rpg-coleccion-cant">×${tiene}</span>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;

    if (typeof window.hidratarIconos === "function") window.hidratarIconos(cont);
  }

  /* ============================================================
     INYECTAR PANEL EN EL RPG
     ============================================================ */
  function inyectarPanel() {
    const cont = $("rpg-content");
    if (!cont || $("rpg-coleccion")) return;
    const panel = document.createElement("div");
    panel.id = "rpg-coleccion";
    panel.className = "rpg-coleccion";
    cont.appendChild(panel);
    renderColeccion();
  }

  // Observar cambios en el DOM para reinyectar cuando el RPG se renderice
  const obs = new MutationObserver(() => {
    if ($("rpg-content") && !$("rpg-coleccion")) inyectarPanel();
  });
  obs.observe(document.body, { childList: true, subtree: true });

  // Failsafe por si ya está montado
  setTimeout(inyectarPanel, 800);
  setTimeout(inyectarPanel, 2000);

  /* ============================================================
     REFRESCAR COLECCIÓN AL CAMBIAR DE VISTA
     ============================================================ */
  window.addEventListener("hashchange", () => {
    if (location.hash === "#rpg") setTimeout(renderColeccion, 100);
  });

  /* ============================================================
     API PÚBLICA (para debug y otros módulos)
     ============================================================ */
  window.RpgLoot = {
    sortearItem:  () => sortearItem(false),
    sortearJefe:  () => sortearItem(true),
    cargarLoot,
    guardarLoot,
    cargarStats,
    guardarStats,
    POOL,
    SHEET,
    // Simula una victoria sin tener que pelear
    simular: (jefe = false) => {
      const item = sortearItem(jefe);
      const loot = cargarLoot();
      loot[item.id] = (loot[item.id] || 0) + 1;
      guardarLoot(loot);
      aplicarBonus(item);
      mostrarPopup(item);
      renderColeccion();
      return item;
    },
    // Resetear todo el botín y stats
    reset: () => {
      if (!confirm("¿Borrar TODO tu botín y bonus?")) return;
      localStorage.removeItem(KEY_LOOT());
      localStorage.removeItem(KEY_STATS());
      renderColeccion();
      window.dispatchEvent(new Event("rpg:stats-cambiados"));
    }
  };

  console.log(`✅ rpg-loot.js listo · ${POOL.length} objetos en el catálogo · sheet ${SHEET.cols}×${SHEET.rows}`);
})();