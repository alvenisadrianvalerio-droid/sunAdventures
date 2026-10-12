/* ============================================================
   RPG-MINIMAP.JS — Mini-mapa integrado como pestaña del RPG
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. CSS autoinyectado ---------- */
  const CSS = `
    .rpg-mm-btn-floating{
      display:none !important;
    }

    .rpg-mm-container{
      display:flex;
      flex-direction:column;
      gap:.75rem;
      width:100%;
    }

    .rpg-mm-panel{
      position:relative;
      width:100%;
      padding:1.1rem;
      border-radius:20px;
      border:1px solid rgba(255,217,61,.35);
      background:linear-gradient(150deg,rgba(21,28,49,.95),rgba(7,11,23,.97));
      box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 24px rgba(255,217,61,.08);
      display:flex;flex-direction:column;gap:.75rem;
      box-sizing:border-box;
    }

    .rpg-mm-titulo{
      display:flex;
      flex-direction:column;
      gap:.25rem;
      padding:.2rem .2rem .75rem .2rem;
      border-bottom:1px solid rgba(255,255,255,.12);
    }
    .rpg-mm-titulo span{font-size:1.15rem;font-weight:950;color:#fff;letter-spacing:.06em;text-transform:uppercase}
    .rpg-mm-titulo small{font-size:.78rem;color:rgba(235,240,255,.75);font-weight:700}

    .rpg-mm-svg-wrap{
      display:flex;flex-direction:column;gap:.75rem;padding:.2rem 0;
    }
    .rpg-mm-region{
      --mm-acento:#ffd93d;
      position:relative;overflow:hidden;flex:none;
      padding:.75rem;border:1px solid color-mix(in srgb,var(--mm-acento) 40%,transparent);
      border-radius:16px;background:linear-gradient(110deg,rgba(8,12,24,.92),rgba(12,18,34,.88)),var(--mm-bioma) center 48%/cover;
      box-shadow:inset 3px 0 var(--mm-acento),0 8px 20px rgba(0,0,0,.2);
      box-sizing:border-box;
    }
    .rpg-mm-region.actual{border-color:var(--mm-acento);box-shadow:inset 3px 0 var(--mm-acento),0 0 22px color-mix(in srgb,var(--mm-acento) 24%,transparent)}
    .rpg-mm-region-head{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin:0 0 .6rem;padding:0 .2rem}
    .rpg-mm-region-title{display:flex;align-items:center;gap:.65rem;min-width:0}
    .rpg-mm-region-title img{width:42px;height:42px;flex:none;object-fit:cover;border-radius:10px;border:1px solid color-mix(in srgb,var(--mm-acento) 65%,white);image-rendering:pixelated}
    .rpg-mm-region-title span{display:flex;flex-direction:column;gap:.12rem;min-width:0}
    .rpg-mm-region-title strong{overflow:hidden;color:#fff;font-size:.85rem;font-weight:950;text-overflow:ellipsis;white-space:nowrap}
    .rpg-mm-region-title small{color:var(--mm-acento);font-size:.62rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .rpg-mm-region-progress{flex:none;color:rgba(235,240,255,.75);font-size:.66rem;font-weight:800}
    .rpg-mm-zones{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.4rem}
    .rpg-mm-zone{
      min-width:0;min-height:42px;display:flex;align-items:center;justify-content:center;gap:.3rem;
      padding:.35rem .25rem;border:1px solid rgba(255,255,255,.16);border-radius:10px;
      background:rgba(9,14,28,.78);color:#f5f6ff;font:inherit;font-size:.68rem;font-weight:900;
      cursor:pointer;transition:transform .15s,border-color .15s,background .15s,box-shadow .15s;
      box-sizing:border-box;
    }
    .rpg-mm-zone:hover:not(:disabled),.rpg-mm-zone:focus-visible{transform:translateY(-2px);border-color:var(--mm-acento);background:rgba(18,27,48,.96);box-shadow:0 5px 15px color-mix(in srgb,var(--mm-acento) 22%,transparent)}
    .rpg-mm-zone.conquistada{border-color:rgba(255,217,61,.65);color:#ffe27a}
    .rpg-mm-zone.minijefe{border-color:rgba(184,154,255,.7);color:#d4beff}
    .rpg-mm-zone.jefe{border-color:rgba(255,112,139,.7);color:#ff9bad}
    .rpg-mm-zone.bloqueada{opacity:.4;filter:saturate(.5);cursor:not-allowed}
    .rpg-mm-zone:disabled{cursor:not-allowed}
    .rpg-mm-zone-icon{font-size:.8rem}
    .rpg-mm-leyenda{
      display:flex;justify-content:center;flex-wrap:wrap;gap:.85rem;
      padding-top:.75rem;border-top:1px solid rgba(255,255,255,.12);
      color:rgba(235,240,255,.75);font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;
    }
    .rpg-mm-leyenda span{display:inline-flex;align-items:center;gap:.3rem}
    .rpg-mm-leyenda i{display:inline-block;width:9px;height:9px;border-radius:50%;border:1px solid currentColor;background:#fff4d4}
    .rpg-mm-leyenda .dot-normal{background:#ffe066}
    .rpg-mm-leyenda .dot-mini{background:#b58cff}
    .rpg-mm-leyenda .dot-jefe{background:#ff6f8e}
    .rpg-mm-leyenda .dot-lock{background:#8a7a5a;opacity:.55}

    @media(max-width:520px){
      .rpg-mm-panel{padding:.8rem;border-radius:16px}
      .rpg-mm-region{padding:.55rem}
      .rpg-mm-zones{grid-template-columns:repeat(2,minmax(0,1fr))}
      .rpg-mm-zone{min-height:38px}
      .rpg-mm-region-progress{font-size:.58rem}
    }
  `;
  const styleEl = document.createElement("style");
  styleEl.id = "rpg-mm-styles";
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- 2. Inyección de Tab y Panel si no existen ---------- */
  function inyectarTabMapa() {
    const tabs = document.querySelector(".rpg-tabs");
    if (!tabs || tabs.querySelector('[data-rpg-tab="mapa"]')) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rpg-tab";
    b.dataset.rpgTab = "mapa";
    b.innerHTML = `<span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/mapa.png" alt=""></span><span class="rpg-tab-text">Mapa</span>`;

    // Insertar después de 'zonas' si existe, o al principio
    const zonasTab = tabs.querySelector('[data-rpg-tab="zonas"]');
    if (zonasTab && zonasTab.nextSibling) {
      tabs.insertBefore(b, zonasTab.nextSibling);
    } else {
      tabs.appendChild(b);
    }
  }

  function inyectarPanelMapa() {
    const content = document.getElementById("rpg-content");
    if (!content || content.querySelector('[data-rpg-panel="mapa"]')) return;
    const p = document.createElement("div");
    p.className = "rpg-panel";
    p.dataset.rpgPanel = "mapa";
    p.id = "rpg-panel-mapa";
    content.appendChild(p);
  }

  function syncTabMapa() {
    inyectarTabMapa();
    inyectarPanelMapa();
  }

  /* ---------- 3. Renderizado del mapa en el panel ---------- */
  function renderMiniMapa(targetContainer) {
    const container = targetContainer || document.getElementById("rpg-panel-mapa");
    if (!container) return;

    let c = container.querySelector("#rpg-mm-content");
    if (!c) {
      container.innerHTML = `
        <div class="rpg-mm-panel">
          <div class="rpg-mm-titulo">
            <span>Ruta de expedición</span>
            <small id="rpg-mm-progreso"></small>
          </div>
          <div class="rpg-mm-svg-wrap" id="rpg-mm-content"></div>
          <div class="rpg-mm-leyenda">
            <span><i class="dot-normal"></i>Zona conquistada</span>
            <span><i class="dot-mini"></i>Mini-jefe</span>
            <span><i class="dot-jefe"></i>Jefe</span>
            <span><i class="dot-lock"></i>Bloqueada</span>
          </div>
        </div>`;
      c = container.querySelector("#rpg-mm-content");
    }

    const grupos = window.Rpg?.grupos || [];
    const st    = window.Rpg?.state?.() || {};
    if (!grupos.length) {
      c.innerHTML = `<div style="padding:2rem;text-align:center;color:#fff;font-weight:900;">Cargando zonas…</div>`;
      return;
    }

    const zonas = grupos.flatMap(g => g.zonas || []);
    const jefes = zonas.filter(z => z.jefe);
    const jefesDerrotados = jefes.filter(z => (st.jefesDerrotados || []).includes(z.id)).length;
    const zonasGanadas = new Set(st.zonasConquistadas || []);
    const escapar = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[ch]);
    const desbloqueada = z => window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : (z.orden === 1 || zonasGanadas.has(zonas.find(x => x.orden === z.orden - 1)?.id));
    const gruposHtml = grupos.map((g, gi) => {
      const bioma = g.bioma || {};
      const imagen = bioma.imagen || "";
      const ganadas = (g.zonas || []).filter(z => zonasGanadas.has(z.id)).length;
      const esActual = (g.zonas || []).some(z => z.id === st.zonaActual);
      const botonZonas = (g.zonas || []).map(z => {
        const abierta = desbloqueada(z);
        const classes = ["rpg-mm-zone"];
        if (z.jefe) classes.push("jefe");
        else if (z.miniJefe) classes.push("minijefe");
        if (!abierta) classes.push("bloqueada");
        if (zonasGanadas.has(z.id)) classes.push("conquistada");
        const icono = z.jefe ? "👑" : z.miniJefe ? "★" : "●";
        const etiqueta = z.jefe ? "Jefe" : z.miniJefe ? "Mini-jefe" : `Zona ${z.nivel}`;
        return `<button type="button" class="${classes.join(" ")}" data-zona="${escapar(z.id)}" title="${escapar(z.nombre)} · Nv ${z.nivel}" aria-label="${etiqueta}: ${escapar(z.nombre)}, nivel ${z.nivel}${abierta ? "" : ", bloqueada"}" ${abierta ? "" : "disabled"}>
          <span class="rpg-mm-zone-icon" aria-hidden="true">${escapar(icono)}</span><span>${String(z.nivel).padStart(2, "0")}</span>
        </button>`;
      }).join("");
      return `<section class="rpg-mm-region${esActual ? " actual" : ""}" style="--mm-bioma:url('${escapar(imagen)}');--mm-acento:${escapar(bioma.acento || "#ffd93d")}">
        <div class="rpg-mm-region-head">
          <div class="rpg-mm-region-title">
            ${imagen ? `<img src="${escapar(imagen)}" alt="" loading="lazy">` : ""}
            <span><small>Región ${String(gi + 1).padStart(2, "0")} · Niveles ${g.nivelMin}–${g.nivelMax}</small><strong>${escapar(g.nombre)}</strong></span>
          </div>
          <span class="rpg-mm-region-progress">${ganadas}/10 conquistadas</span>
        </div>
        <div class="rpg-mm-zones">${botonZonas}</div>
      </section>`;
    }).join("");
    c.innerHTML = gruposHtml;

    const prog = container.querySelector("#rpg-mm-progreso");
    if (prog) prog.textContent = `${jefesDerrotados}/${jefes.length} jefes derrotados · ${st.enemigosDerrotados || 0} enemigos · Nivel ${st.nivel || 1}`;

    c.querySelectorAll(".rpg-mm-zone:not(:disabled)").forEach(button => {
      button.addEventListener("click", () => {
        const zid = button.dataset.zona;
        const z = zonas.find(x => x.id === zid);
        if (!z || !desbloqueada(z)) return;

        // Llamar al hook expuesto por rpg.js
        if (typeof window._rpgEntrarZona === "function") {
          window._rpgEntrarZona(zid);
          return;
        }
        // Fallback: clic sintético en la carta real
        const btn = document.querySelector(`[data-zona="${zid}"]:not(.rpg-mm-dot)`);
        if (btn) btn.click();
      });
    });
  }

  // Escuchar cambio de pestañas en el RPG
  window.addEventListener("sunad:rpg-tab", (e) => {
    syncTabMapa();
    if (e.detail?.tab === "mapa") {
      renderMiniMapa();
    }
  });

  // Delegación de click para la tab Mapa
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-rpg-tab="mapa"]');
    if (!t) return;
    const content = document.getElementById("rpg-content");
    if (!content) return;
    window.RpgRoguelike?.cerrar?.();
    const rlPanel = document.getElementById("rpg-roguelike-panel");
    if (rlPanel) rlPanel.style.display = "none";
    content.dataset.tabActiva = "mapa";
    content.querySelectorAll(".rpg-tab").forEach(x => x.classList.toggle("active", x === t));
    content.querySelectorAll(".rpg-panel").forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === "mapa"));
    renderMiniMapa();
  }, true);

  /* ---------- 4. Init ---------- */
  let tries = 0;
  function init() {
    // Si quedó algún botón flotante residual, eliminarlo
    const oldBtn = document.getElementById("btn-abrir-minimapa");
    if (oldBtn) oldBtn.remove();
    const oldOverlay = document.getElementById("rpg-minimapa");
    if (oldOverlay) oldOverlay.remove();

    if (window.Rpg && document.querySelector('[data-view="rpg"]')) {
      syncTabMapa();
      const panel = document.getElementById("rpg-panel-mapa");
      if (panel && panel.classList.contains("active")) {
        renderMiniMapa(panel);
      }
      return;
    }
    if (++tries > 60) return;
    setTimeout(init, 400);
  }

  document.addEventListener("DOMContentLoaded", () => setTimeout(init, 100));
  if (document.readyState !== "loading") setTimeout(init, 100);

  // Exponer API
  window.abrirMiniMapaRPG = () => {
    const tabMapa = document.querySelector('[data-rpg-tab="mapa"]');
    if (tabMapa) tabMapa.click();
  };
  window.renderMiniMapa = renderMiniMapa;

  console.log("✅ rpg-minimap.js integrado como pestaña listo");
})();