/* ============================================================
   RPG-MINIMAP.JS — Mini-mapa popup independiente
   Autoinyecta botón + overlay + CSS. No depende de render().
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. CSS autoinyectado ---------- */
  const CSS = `
    .rpg-mm-btn-floating{
      position:fixed;
      top: 5.5rem;
      right: 1.2rem;
      z-index: 9000;
      display:none;
      align-items:center;gap:.5rem;
      padding:.7rem 1.1rem;
      border-radius:999px;
      border:2px solid rgba(255,217,61,.6);
      background:linear-gradient(135deg, rgba(255,217,61,.25), rgba(255,217,61,.08));
      color:#ffd93d;
      font-family:inherit;font-size:.85rem;font-weight:900;
      cursor:pointer;
      box-shadow:0 6px 20px rgba(255,217,61,.35);
      transition:transform .2s, box-shadow .2s, background .2s;
      backdrop-filter:blur(8px);
      letter-spacing:.05em;
      text-transform:uppercase;
    }
    .rpg-mm-btn-floating.visible{display:inline-flex}
    .rpg-mm-btn-floating:hover{transform:translateY(-2px);background:linear-gradient(135deg, rgba(255,217,61,.4), rgba(255,217,61,.15));box-shadow:0 8px 26px rgba(255,217,61,.5)}
    .rpg-mm-btn-floating img{width:1.1rem;height:1.1rem;object-fit:contain;image-rendering:auto}
    .rpg-mm-btn-floating .badge{background:rgba(0,0,0,.35);padding:.1rem .45rem;border-radius:999px;font-size:.7rem}

    .rpg-mm-overlay{
      position:fixed;inset:0;z-index:9600;
      display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.78);
      backdrop-filter:blur(6px);
      padding:1rem;
    }
    .rpg-mm-overlay.active{display:flex}

    .rpg-mm-panel{
      position:relative;
      width:min(820px,94vw);
      max-height:92vh;
      padding:1rem;
      border-radius:24px;
      border:1px solid rgba(255,217,61,.48);
      background:linear-gradient(150deg,rgba(21,28,49,.99),rgba(7,11,23,.99));
      box-shadow:0 28px 90px rgba(0,0,0,.75),0 0 40px rgba(255,217,61,.12);
      display:flex;flex-direction:column;gap:.75rem;
      animation:mmIn .3s cubic-bezier(.2,.8,.2,1);
    }
    @keyframes mmIn{from{opacity:0;transform:scale(.97) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}

    .rpg-mm-close{
      position:absolute;top:.75rem;right:.75rem;
      width:36px;height:36px;border-radius:50%;
      border:1px solid rgba(255,255,255,.32);background:rgba(8,12,24,.8);color:#fff;
      font-size:1.35rem;line-height:1;cursor:pointer;
      display:grid;place-items:center;
      transition:transform .2s,background .2s;z-index:2;font-weight:900;
    }
    .rpg-mm-close:hover{transform:rotate(90deg);background:#ff6b9d;color:#fff}

    .rpg-mm-titulo{display:flex;flex-direction:column;gap:.25rem;padding:.2rem 3.2rem .75rem .2rem;border-bottom:1px solid rgba(255,255,255,.12)}
    .rpg-mm-titulo span{font-size:1.15rem;font-weight:950;color:#fff;letter-spacing:.06em;text-transform:uppercase}
    .rpg-mm-titulo small{font-size:.72rem;color:rgba(235,240,255,.68)}

    .rpg-mm-svg-wrap{
      flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;
      display:flex;flex-direction:column;gap:.7rem;padding:.15rem .2rem .4rem;
    }
    .rpg-mm-region{
      --mm-acento:#ffd93d;
      position:relative;overflow:hidden;flex:none;
      padding:.65rem;border:1px solid color-mix(in srgb,var(--mm-acento) 40%,transparent);
      border-radius:17px;background:linear-gradient(110deg,rgba(8,12,24,.92),rgba(12,18,34,.88)),var(--mm-bioma) center 48%/cover;
      box-shadow:inset 3px 0 var(--mm-acento),0 8px 20px rgba(0,0,0,.2);
    }
    .rpg-mm-region.actual{border-color:var(--mm-acento);box-shadow:inset 3px 0 var(--mm-acento),0 0 22px color-mix(in srgb,var(--mm-acento) 24%,transparent)}
    .rpg-mm-region-head{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin:0 0 .55rem;padding:0 .2rem}
    .rpg-mm-region-title{display:flex;align-items:center;gap:.55rem;min-width:0}
    .rpg-mm-region-title img{width:42px;height:42px;flex:none;object-fit:cover;border-radius:10px;border:1px solid color-mix(in srgb,var(--mm-acento) 65%,white);image-rendering:pixelated}
    .rpg-mm-region-title span{display:flex;flex-direction:column;gap:.12rem;min-width:0}
    .rpg-mm-region-title strong{overflow:hidden;color:#fff;font-size:.82rem;font-weight:950;text-overflow:ellipsis;white-space:nowrap}
    .rpg-mm-region-title small{color:var(--mm-acento);font-size:.59rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
    .rpg-mm-region-progress{flex:none;color:rgba(235,240,255,.7);font-size:.62rem;font-weight:800}
    .rpg-mm-zones{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem}
    .rpg-mm-zone{
      min-width:0;min-height:41px;display:flex;align-items:center;justify-content:center;gap:.3rem;
      padding:.35rem .25rem;border:1px solid rgba(255,255,255,.16);border-radius:10px;
      background:rgba(9,14,28,.78);color:#f5f6ff;font:inherit;font-size:.66rem;font-weight:900;
      cursor:pointer;transition:transform .15s,border-color .15s,background .15s,box-shadow .15s;
    }
    .rpg-mm-zone:hover:not(:disabled),.rpg-mm-zone:focus-visible{transform:translateY(-2px);border-color:var(--mm-acento);background:rgba(18,27,48,.96);box-shadow:0 5px 15px color-mix(in srgb,var(--mm-acento) 22%,transparent)}
    .rpg-mm-zone.conquistada{border-color:rgba(255,217,61,.65);color:#ffe27a}
    .rpg-mm-zone.minijefe{border-color:rgba(184,154,255,.7);color:#d4beff}
    .rpg-mm-zone.jefe{border-color:rgba(255,112,139,.7);color:#ff9bad}
    .rpg-mm-zone.bloqueada{opacity:.4;filter:saturate(.5);cursor:not-allowed}
    .rpg-mm-zone:disabled{cursor:not-allowed}
    .rpg-mm-zone-icon{font-size:.8rem}
    .rpg-mm-leyenda{
      display:flex;justify-content:center;flex-wrap:wrap;gap:.8rem;
      padding-top:.65rem;border-top:1px solid rgba(255,255,255,.12);
      color:rgba(235,240,255,.72);font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;
    }
    .rpg-mm-leyenda span{display:inline-flex;align-items:center;gap:.3rem}
    .rpg-mm-leyenda i{display:inline-block;width:9px;height:9px;border-radius:50%;border:1px solid currentColor;background:#fff4d4}
    .rpg-mm-leyenda .dot-normal{background:#ffe066}
    .rpg-mm-leyenda .dot-mini{background:#b58cff}
    .rpg-mm-leyenda .dot-jefe{background:#ff6f8e}
    .rpg-mm-leyenda .dot-lock{background:#8a7a5a;opacity:.55}

    @media(max-width:520px){
      .rpg-mm-overlay{padding:.5rem}
      .rpg-mm-panel{width:96vw;max-height:94vh;padding:.7rem;border-radius:18px}
      .rpg-mm-region{padding:.5rem}
      .rpg-mm-zones{grid-template-columns:repeat(2,minmax(0,1fr))}
      .rpg-mm-zone{min-height:38px}
      .rpg-mm-region-progress{font-size:.55rem}
    }
  `;
  const styleEl = document.createElement("style");
  styleEl.id = "rpg-mm-styles";
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ---------- 2. Botón flotante ---------- */
  function crearBoton() {
    if (document.getElementById("btn-abrir-minimapa")) return;
    const btn = document.createElement("button");
    btn.id = "btn-abrir-minimapa";
    btn.type = "button";
    btn.className = "rpg-mm-btn-floating";
    btn.innerHTML = `<img src="img/items%20de%20aventura/mapa.png" alt="" aria-hidden="true"><span>Mapa</span><span class="badge" id="rpg-mm-btn-badge">0/0</span>`;
    btn.addEventListener("click", abrirMiniMapa);
    document.body.appendChild(btn);
  }

  function actualizarVisibilidadBoton() {
    const btn = document.getElementById("btn-abrir-minimapa");
    if (!btn) return;
    const rpgActivo = location.hash === "#rpg"
      || document.querySelector('[data-view="rpg"].active');
    btn.classList.toggle("visible", !!rpgActivo);
    if (rpgActivo) actualizarBadge();
  }

  function actualizarBadge() {
    const badge = document.getElementById("rpg-mm-btn-badge");
    if (!badge) return;
    const zonas = window.Rpg?.zonas || [];
    const st    = window.Rpg?.state?.() || {};
    const jefes = zonas.filter(z => z.jefe);
    const conquistadas = jefes.filter(z => (st.jefesDerrotados || []).includes(z.id)).length;
    badge.textContent = `${conquistadas}/${jefes.length}`;
  }

  /* ---------- 3. Overlay + SVG ---------- */
  function abrirMiniMapa() {
    let m = document.getElementById("rpg-minimapa");
    if (!m) {
      m = document.createElement("div");
      m.id = "rpg-minimapa";
      m.className = "rpg-mm-overlay";
      m.innerHTML = `
        <div class="rpg-mm-panel">
          <button class="rpg-mm-close" aria-label="Cerrar">×</button>
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
      document.body.appendChild(m);
      m.addEventListener("click", e => {
        if (e.target === m || e.target.classList.contains("rpg-mm-close"))
          m.classList.remove("active");
      });
      document.addEventListener("keydown", e => {
        if (e.key === "Escape") m.classList.remove("active");
      });
    }
    renderMiniMapa();
    m.classList.add("active");
  }

  function renderMiniMapa() {
    const c = document.getElementById("rpg-mm-content");
    if (!c) return;

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
    const desbloqueada = z => window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : ((st.nivel || 1) >= z.nivel - 2 || (st.enemigosDerrotados || 0) >= z.nivel * 5);
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

    const prog = document.getElementById("rpg-mm-progreso");
    if (prog) prog.textContent = `${jefesDerrotados}/${jefes.length} jefes derrotados · ${st.enemigosDerrotados || 0} enemigos · Nivel ${st.nivel || 1}`;

    c.querySelectorAll(".rpg-mm-zone:not(:disabled)").forEach(button => {
      button.addEventListener("click", () => {
        const zid = button.dataset.zona;
        const z = zonas.find(x => x.id === zid);
        if (!z || !desbloqueada(z)) return;

        document.getElementById("rpg-minimapa")?.classList.remove("active");

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

  /* ---------- 4. Init: esperar a que exista el RPG ---------- */
  let tries = 0;
  function init() {
    if (window.Rpg && document.querySelector('[data-view="rpg"]')) {
      crearBoton();
      actualizarVisibilidadBoton();
      // Repinta el badge cuando cambien los datos
      setInterval(actualizarBadge, 3000);
      return;
    }
    if (++tries > 60) return; // ~24s máx
    setTimeout(init, 400);
  }

  window.addEventListener("hashchange", actualizarVisibilidadBoton);
  document.addEventListener("DOMContentLoaded", () => setTimeout(init, 100));
  if (document.readyState !== "loading") setTimeout(init, 100);

  // Observar cambios de vista activa
  const obs = new MutationObserver(actualizarVisibilidadBoton);
  setTimeout(() => {
    const body = document.body;
    if (body) obs.observe(body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }, 500);

  // Exponer por si quieres abrirlo desde otro sitio
  window.abrirMiniMapaRPG = abrirMiniMapa;

  console.log("✅ rpg-minimap.js listo");
})();