/* ============================================================
   SPRITES-CONFIG.JS — Configuración central de sprites pixel-art
   Único punto donde se define el sheet y sus coordenadas.
   ============================================================ */
(function () {
  /* ---------- HOJA PRINCIPAL ---------- */
  // ⚠️ Ajusta estas 3 cosas según tu archivo real:
  window.SPRITE_SHEET = {
    url:  "img/tienda/admurin-items.png",   // ← ruta de tu sprite sheet
    cols: 30,                                 // ← nº de columnas (ajústalo)
    rows: 110                                 // ← nº de filas (ajústalo)
  };

  /* ---------- RENDER HELPER ---------- */
  // Devuelve un <div> con el sprite recortado, listo para inyectar.
  window.renderSprite = function (col, row, size = 48, opts = {}) {
    const S = window.SPRITE_SHEET;
    if (!S) return "";
    const posX = S.cols > 1 ? (col / (S.cols - 1)) * 100 : 50;
    const posY = S.rows > 1 ? (row / (S.rows - 1)) * 100 : 50;
    const cls = "sprite-item" + (opts.className ? " " + opts.className : "");
    const style = `width:${size}px;height:${size}px;background-image:url('${S.url}');background-size:${S.cols * 100}% ${S.rows * 100}%;background-position:${posX}% ${posY}%`;
    return `<div class="${cls}" style="${style}"></div>`;
  };

  /* ---------- MAPA DE SPRITES ----------
     Cada clave es un ID de item, cada valor es [col, row].
     Aquí pegas las coordenadas que elijas del sheet.
     Los IDs que NO estén aquí usarán su SVG de fallback. */

  // — Comida —
  window.SPRITE_MAP_COMIDA = {
    // manzana:     [3, 5],
    // tomate:      [4, 5],
    // ... etc
  };

  // — Cosméticos: cabeza —
  window.SPRITE_MAP_CABEZA = {
    // corona:      [10, 2],
    // gorro:       [11, 2],
    // ...
  };

  // — Cosméticos: cuello —
  window.SPRITE_MAP_CUELLO = {};

  // — Cosméticos: ojos —
  window.SPRITE_MAP_OJOS = {};

  // — Cosméticos: fondos —
  window.SPRITE_MAP_FONDOS = {};

  // — Cosméticos: efectos —
  window.SPRITE_MAP_EFECTOS = {};

  // — Botín RPG: cualquier item del POOL —
  window.SPRITE_MAP_RPG = {
    // "hoja-verde":   [0, 30],
    // "flor-roja":    [1, 30],
    // ...
  };

  /* ---------- APLICADOR AUTOMÁTICO ----------
     Recorre TIENDA_ITEMS y POOL aplicando sprites si existen en los mapas. */
    window._aplicarSpritesAutomaticos = function () {
    const mapas = {
      comida:  window.SPRITE_MAP_COMIDA,
      cabeza:  window.SPRITE_MAP_CABEZA,
      cuello:  window.SPRITE_MAP_CUELLO,
      ojos:    window.SPRITE_MAP_OJOS,
      fondos:  window.SPRITE_MAP_FONDOS,
      efectos: window.SPRITE_MAP_EFECTOS
    };

    // Tienda → siempre hoja principal
    try {
      const T = window._TiendaAPI?.TIENDA_ITEMS;
      if (T) {
        Object.entries(mapas).forEach(([cat, mapa]) => {
          if (!T[cat]) return;
          Object.entries(mapa || {}).forEach(([id, coords]) => {
            if (T[cat][id] && Array.isArray(coords) && coords.length === 2) {
              T[cat][id].sprite = coords;
              T[cat][id].sheet  = "main";
            }
          });
        });
      }
    } catch (e) { console.warn("aplicarSprites tienda:", e); }

    // RPG Loot → solo si están mapeados explícitamente
    try {
      const pool = window.RpgLoot?.POOL;
      const mapa = window.SPRITE_MAP_RPG || {};
      if (Array.isArray(pool)) {
        pool.forEach(it => {
          const coords = mapa[it.id];
          if (Array.isArray(coords) && coords.length === 2) {
            it.sprite = coords;
            it.sheet  = "main";
          }
          // ⚡ Si NO está mapeado: no tocamos su sprite ni su sheet
          //    → sigue usando el sheet RPG pequeño original
        });
      }
    } catch (e) { console.warn("aplicarSprites rpg:", e); }
  };
  /* ---------- AUTO-APLICAR ---------- */
  window.addEventListener("sunadventures:api-ready", () => {
    setTimeout(window._aplicarSpritesAutomaticos, 50);
  });

  // Failsafe por si el evento ya pasó
  setTimeout(() => {
    if (window._TiendaAPI) window._aplicarSpritesAutomaticos();
  }, 500);
  setTimeout(window._aplicarSpritesAutomaticos, 1500);

  console.log("✅ sprites-config.js listo · sheet:", window.SPRITE_SHEET.url);
})();