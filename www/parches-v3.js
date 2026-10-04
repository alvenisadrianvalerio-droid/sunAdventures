/* ============================================================
   PARCHES-V3.JS — Fixes visuales y de comportamiento
   ============================================================ */
(function () {
  "use strict";
  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  /* ============================================================
     1) 🚫 ELIMINAR "Aventura RPG" DEL DROPDOWN
     ============================================================ */
  function limpiarDropdownRpg() {
    const dd = $("user-dropdown");
    if (!dd) return;
    // Eliminar links que apunten a #rpg dentro del dropdown
    dd.querySelectorAll('[data-view-link="rpg"]').forEach(el => el.remove());
    // Eliminar por texto también (por si acaso)
    [...dd.children].forEach(el => {
      if (el.textContent && /aventura\s*rpg/i.test(el.textContent) && el.tagName === "A") el.remove();
    });
  }
  /* ============================================================
     2) 🎁 VICTORIA RPG — modal con estilos bonitos
     ============================================================ */
  // Interceptamos la función mostrarRecompensa si existe
  function estilizarModalRecompensa() {
    qsa(".rpg-rl-recompensa").forEach(card => {
      if (card._v3Styled) return;
      card._v3Styled = true;
      const inner = card.querySelector(".rpg-rl-recompensa-card");
      if (!inner) return;
      // Añadir icono decorativo
      const h2 = inner.querySelector("h2");
      if (h2 && !h2.querySelector(".v3-icon")) {
        const ico = document.createElement("span");
        ico.className = "v3-icon";
        ico.style.cssText = "display:inline-block;font-size:2.6rem;margin-bottom:.4rem;";
        const txt = h2.textContent || "";
        ico.textContent = /caído|muerto|derrota/i.test(txt) ? "💀" : /victoria/i.test(txt) ? "🏆" : /recompensa/i.test(txt) ? "🎁" : "✨";
        h2.prepend(document.createElement("br"), ico, document.createElement("br"));
      }
      // Estilizar lista
      const ul = inner.querySelector("ul");
      if (ul) ul.classList.add("v3-reward-list");
    });
  }
  /* ============================================================
     4) 🔔 BOTÓN "Activar notificaciones" — styling bonito
     ============================================================ */
  function estilizarPushBtn() {
    qsa(".chat-push-btn").forEach(b => {
      if (b._v3Styled) return;
      b._v3Styled = true;
      b.classList.add("v3-push-btn");
      // Añadir icono campana
      if (!b.querySelector(".v3-push-icon")) {
        const ico = document.createElement("span");
        ico.className = "v3-push-icon";
        ico.style.cssText = "display:inline-flex;width:1.1rem;height:1.1rem;margin-right:.45rem;vertical-align:middle;";
        ico.innerHTML = window.ICONO?.campana || "🔔";
        b.prepend(ico);
      }
    });
  }
  /* ============================================================
     5) 🧹 LIMPIAR ESPACIO VACÍO DE BUFFS EN BATALLA
     ============================================================ */
  function limpiarBuffsVacios() {
    qsa("#buffs-heroe, #buffs-enemigo, .rpg-buffs").forEach(el => {
      if (!el.children.length) {
        el.style.display = "none";
        el.style.minHeight = "0";
        el.style.marginTop = "0";
      } else {
        el.style.display = "";
        el.style.minHeight = "";
        el.style.marginTop = "";
      }
    });
  }
  /* ============================================================
     6) 🛡️ ESCUDO — eliminar rastros vacíos en #fighter-heroe
     ============================================================ */
  function limpiarEscudoVacio() {
    qsa("#fighter-heroe, #fighter-enemigo").forEach(f => {
      const wrap = f.querySelector(".rpg-shield-wrap");
      if (wrap && (!wrap.querySelector(".rpg-shield-val") || wrap.querySelector(".rpg-shield-val").textContent === "0")) {
        wrap.remove();
      }
    });
  }
  /* ============================================================
     7) 💬 CHAT — botón push más visible al inicio
     ============================================================ */
  function ocultarPushSiYaActivo() {
    const b = $("btn-enable-push");
    if (!b) return;
    try {
      if (Notification.permission === "granted" && b.textContent.includes("Activadas")) {
        b.classList.add("v3-push-ok");
      }
    } catch { }
  }
  /* ============================================================
   8) 🔧 FORZAR ancho del dropdown en runtime (anti-cualquier-cosa)
   ============================================================ */
  function forzarDropdown() {
    const dd = document.getElementById("user-dropdown");
    if (!dd) return;
    const W = window.innerWidth < 600 ? "250px" : "290px";

    dd.style.setProperty("display", "grid", "important");
    dd.style.setProperty("grid-template-columns", "minmax(0, 1fr)", "important");
    dd.style.setProperty("width", W, "important");
    dd.style.setProperty("min-width", W, "important");
    dd.style.setProperty("max-width", W, "important");
    dd.style.setProperty("overflow", "hidden", "important");
    dd.style.setProperty("box-sizing", "border-box", "important");

    dd.querySelectorAll(".user-dropdown-item, .user-dropdown-header, .user-dropdown-divider").forEach(el => {
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("max-width", "100%", "important");
      el.style.setProperty("min-width", "0", "important");
      el.style.setProperty("box-sizing", "border-box", "important");
    });
    dd.querySelectorAll(".user-dropdown-icon").forEach(el => {
      el.style.setProperty("flex", "0 0 20px", "important");
      el.style.setProperty("width", "20px", "important");
      el.style.setProperty("height", "20px", "important");
    });
  }

  /* ============================================================
     9) 🧹 LIMPIAR "Cambiar nombre" — todo vive en "Mi perfil"
     ============================================================ */
  function limpiarBotonCambiarNombre() {
    // 1) Quitar del NAV superior (junto a "Aventura")
    document.querySelectorAll('.nav-links [data-action="cambiar-nombre"], .nav-links button, .nav-links a').forEach(el => {
      const t = (el.textContent || "").trim().toLowerCase();
      if (t === "cambiar nombre") el.remove();
    });

    // 2) Quitar del DROPDOWN de usuario
    const dd = document.getElementById("user-dropdown");
    if (dd) {
      dd.querySelectorAll('[data-action="cambiar-nombre"]').forEach(el => el.remove());
      [...dd.children].forEach(el => {
        const t = (el.textContent || "").trim().toLowerCase();
        if (t === "cambiar nombre") el.remove();
      });
    }
  }

  /* ============================================================
     10) 🎒 INVENTARIO DE EQUIPO EN MODO AVENTURA
          Muestra los cosméticos equipados (ya no bajo la mascota)
     ============================================================ */
  (function equipoRpg() {
    const $ = id => document.getElementById(String(id).replace(/^#/, ""));
    const getUser = () => window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";

    // Asegurar que el CSS oculta los skins bajo la mascota
    if (!document.getElementById("hide-skins-css")) {
      const s = document.createElement("style");
      s.id = "hide-skins-css";
      s.textContent = ".mascota-skin{display:none !important}";
      document.head.appendChild(s);
    }

    const ZONAS = [
      { id: "cabeza", label: "Cabeza" },
      { id: "cuello", label: "Cuello" },
      { id: "ojos", label: "Ojos" },
      { id: "fondos", label: "Fondo" },
      { id: "efectos", label: "Efecto" }
    ];
    const SHEETS = {
      main: {
        url: window.SPRITE_SHEET?.url || "img/tienda/admurin-items.png",
        cols: window.SPRITE_SHEET?.cols || 30,
        rows: window.SPRITE_SHEET?.rows || 110
      },
      comida: { url: "img/tienda/comida-sheet.png", cols: 5, rows: 5 },
      tienda: { url: "img/tienda/tienda-sheet.png", cols: 5, rows: 5 }
    };

    function renderItemIcono(it, iconos) {
      const sheet = SHEETS[it.sheet] || SHEETS.tienda;
      if (Array.isArray(it.sprite) && it.sprite.length === 2) {
        const [col, row] = it.sprite;
        if (Number.isInteger(col) && Number.isInteger(row) &&
          col >= 0 && col < sheet.cols && row >= 0 && row < sheet.rows) {
          const x = sheet.cols > 1 ? col / (sheet.cols - 1) * 100 : 50;
          const y = sheet.rows > 1 ? row / (sheet.rows - 1) * 100 : 50;
          return `<span aria-hidden="true" style="width:80%;height:80%;background-image:url('${sheet.url}');background-size:${sheet.cols * 100}% ${sheet.rows * 100}%;background-position:${x}% ${y}%;background-repeat:no-repeat;image-rendering:pixelated"></span>`;
        }
      }
      return iconos[it.icono] || "✨";
    }

    function getEquipo() {
      try {
        const u = getUser();
        const m = localStorage.getItem("mascota_actual") || "mapache";
        return JSON.parse(localStorage.getItem(`mascota_skins_eq_${u}_${m}`) || "{}");
      } catch { return {}; }
    }

    function render() {
      const c = document.querySelector('[data-rpg-panel="equipo"]');
      if (!c) return;
      const eq = getEquipo();
      const T = window._TiendaAPI?.TIENDA_ITEMS || {};
      const IC = window.ICONO || {};
      const equippedCount = ZONAS.filter(z => eq[z.id] && T[z.id]?.[eq[z.id]]).length;

      let totalBonus = 0;
      let html = `<div class="rpg-equipo-header">
      <span class="rpg-equipo-titulo">🎒 Equipo activo</span>
      <span class="rpg-equipo-count">${equippedCount} / 5 slots</span>
    </div>
    <div class="rpg-equipo-grid">`;

      ZONAS.forEach(z => {
        const idSkin = eq[z.id];
        const cat = T[z.id] || {};
        const it = idSkin ? cat[idSkin] : null;
        if (!it) {
          html += `<div class="rpg-equipo-slot vacio">
          <span class="rpg-equipo-zona">${z.label}</span>
          <div class="rpg-equipo-icono" style="opacity:.35;">${IC.candado || "?"}</div>
          <span class="rpg-equipo-nombre" style="opacity:.55;">Vacío</span>
        </div>`;
          return;
        }
        const icono = renderItemIcono(it, IC);
        const bonusTxt = it.bonus?.desc || "Sin bonus";
        // Bonus cuantificable
        if (it.bonus?.val) totalBonus += it.bonus.val;
        html += `<div class="rpg-equipo-slot">
        <span class="rpg-equipo-zona">${z.label}</span>
        <div class="rpg-equipo-icono">${icono}</div>
        <span class="rpg-equipo-nombre">${it.nombre}</span>
        <span class="rpg-equipo-bonus">⚡ ${bonusTxt}</span>
      </div>`;
      });

      if (totalBonus > 0) {
        html += `<div class="rpg-equipo-total">Suma de valores de bonus: <strong>+${totalBonus}</strong></div>`;
      }
      html += `</div>`;
      c.innerHTML = html;
      if (window.hidratarIconos) window.hidratarIconos(c);
    }

    function inyectarTab() {
      const tabs = document.querySelector(".rpg-tabs");
      if (!tabs || tabs.querySelector('[data-rpg-tab="equipo"]')) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rpg-tab";
      b.dataset.rpgTab = "equipo";
      // ✅ DESPUÉS
      b.innerHTML = `<span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/espada.png" alt=""></span><span class="rpg-tab-text">Equipo</span>`;
      tabs.appendChild(b);
    }

    function inyectarPanel() {
      const content = document.getElementById("rpg-content");
      if (!content || content.querySelector('[data-rpg-panel="equipo"]')) return;
      const p = document.createElement("div");
      p.className = "rpg-panel";
      p.dataset.rpgPanel = "equipo";
      content.appendChild(p);
      render();
    }

    // Manejar el click en la tab (independiente de rpg.js)
    document.addEventListener("click", (e) => {
      const t = e.target.closest('[data-rpg-tab="equipo"]');
      if (!t) return;
      const content = document.getElementById("rpg-content");
      if (!content) return;
      content.querySelectorAll(".rpg-tab").forEach(x => x.classList.toggle("active", x === t));
      content.querySelectorAll(".rpg-panel").forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === "equipo"));
      render();
    }, true);

    // Mantener sincronizado
    window._v3SyncEquipo = () => { inyectarTab(); inyectarPanel(); };
    window._v3SyncEquipo();
    window.addEventListener("sunadventures:tienda-compra", () => setTimeout(render, 100));
    window.addEventListener("sunadventures:mascota-cambiada", () => setTimeout(render, 100));
    window.addEventListener("sunadventures:perfil-actualizado", () => setTimeout(render, 100));
  })();

  function limpiarArtefactosMascota() {
    const m = document.getElementById("mascota");
    if (!m) return;
    // Remover cualquier span con clase mascota-skin o variantes
    m.querySelectorAll('[class*="mascota-skin"], .mascota-fondo, .mascota-efecto').forEach(el => el.remove());
  }

  /* ============================================================
     11) 🧨 ELIMINACIÓN AGRESIVA "Cambiar nombre" — v2
     ============================================================ */
  (function killCambiarNombre() {
    function matar() {
      // 1) Por atributo data-action
      document.querySelectorAll('[data-action="cambiar-nombre"]').forEach(el => el.remove());

      // 2) Por texto, en cualquier contenedor de navegación
      const contenedores = [
        ".nav-links",
        "#user-dropdown",
        ".user-dropdown",
        ".nav-actions",
        ".lobby-menu"
      ];
      contenedores.forEach(sel => {
        document.querySelectorAll(sel).forEach(cont => {
          [...cont.children].forEach(el => {
            const txt = (el.textContent || "").trim().toLowerCase();
            // Coincidencia exacta (para no eliminar "Mi perfil" que también tiene texto)
            if (txt === "cambiar nombre") el.remove();
          });
        });
      });
    }

    // Ejecutar ya
    matar();

    window._v3LimpiarNombre = matar;
  })();

  /* ============================================================
     12) 🎨 Override de alert/confirm nativos → SunModal
     ============================================================ */
  (function overrideDialogs() {
    if (!window.SunModal) {
      setTimeout(overrideDialogs, 500);
      return;
    }
    if (window._dialogsOverrided) return;
    window._dialogsOverrided = true;

    const _alertOriginal = window.alert;
    window.alert = function (msg) {
      if (typeof msg === "string" && /usuario inválido|cambiado|guardado|error/i.test(msg)) {
        const isErr = /inválido|error|fallo|no se pudo/i.test(msg);
        return window.SunModal.alert({
          title: isErr ? "Aviso" : "¡Listo!",
          message: String(msg).replace(/\n/g, "<br>"),
          variant: isErr ? "warning" : "success",
          icon: isErr ? "⚠️" : "✨",
          confirmText: "Entendido"
        });
      }
      return _alertOriginal.call(window, msg);
    };
  })();

  let refreshTimer = null;
  function actualizarElementosDinamicos() {
    limpiarDropdownRpg();
    estilizarModalRecompensa();
    estilizarPushBtn();
    limpiarBuffsVacios();
    limpiarEscudoVacio();
    ocultarPushSiYaActivo();
    forzarDropdown();
    limpiarBotonCambiarNombre();
    window._v3LimpiarNombre?.();
    window._v3SyncEquipo?.();
    limpiarArtefactosMascota();
  }

  const cambiosDOM = new MutationObserver(() => {
    if (refreshTimer !== null) return;
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      actualizarElementosDinamicos();
    }, 100);
  });
  cambiosDOM.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", forzarDropdown, { passive: true });
  actualizarElementosDinamicos();

  /* ============================================================
   13) 🪙 MONEDA PIXEL-ART — reemplaza SVG viejos
   ============================================================ */
  (function coinUpgrade() {
    function reemplazar() {
      // Buscar cualquier [data-icono="moneda"] que aún tenga SVG dentro
      document.querySelectorAll('[data-icono="moneda"]').forEach(el => {
        if (el.querySelector("img.coin-icon")) return; // ya está
        if (el.querySelector("svg")) {
          // Reemplazar SVG por la nueva imagen
          el.innerHTML = `<img src="img/items%20de%20aventura/icon.png" alt="SunCoin" class="coin-icon">`;
        }
      });

      // Sustituir cualquier texto "🪙" en monederos/precios por la imagen
      document.querySelectorAll(
        ".tienda-monedero, .mm-monedero, .rpg-coins, .tienda-item-precio, .rpg-cofre-precio, .daily-reward-prizes"
      ).forEach(el => {
        el.querySelectorAll("svg").forEach(svg => {
          // Solo si el SVG parece ser una moneda (tiene fill dorado)
          const html = svg.outerHTML;
          if (html.includes("ffd93d") || html.includes("moneda")) {
            const img = document.createElement("img");
            img.src = "img/items%20de%20aventura/icon.png";
            img.alt = "SunCoin";
            img.className = "coin-icon";
            svg.replaceWith(img);
          }
        });
      });
    }
    reemplazar();
    setInterval(reemplazar, 800);
  })();

  console.log("✅ parches-v3.js cargado — dropdown, tienda, victoria, push, buffs");
})();