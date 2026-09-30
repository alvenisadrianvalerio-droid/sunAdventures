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
    .rpg-mm-btn-floating svg{width:1.1rem;height:1.1rem}
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
      width:min(340px,92vw);
      max-height:92vh;
      padding:1rem .9rem .8rem;
      border-radius:16px;
      border:3px solid #8b5a2b;
      background:linear-gradient(180deg,#e8d5a8 0%,#d9c08a 100%);
      box-shadow:
        0 20px 60px rgba(0,0,0,.7),
        0 0 0 4px rgba(60,40,20,.6),
        inset 0 0 0 2px rgba(255,255,255,.25);
      display:flex;flex-direction:column;gap:.5rem;
      animation:mmIn .3s cubic-bezier(.34,1.56,.64,1);
      image-rendering:pixelated;
    }
    @keyframes mmIn{from{opacity:0;transform:scale(.85) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}

    .rpg-mm-close{
      position:absolute;top:.55rem;right:.55rem;
      width:30px;height:30px;border-radius:50%;
      border:2px solid #5a3a1a;background:#d4b078;color:#3a2410;
      font-size:1.2rem;line-height:1;cursor:pointer;
      display:grid;place-items:center;
      transition:transform .2s,background .2s;z-index:2;font-weight:900;
    }
    .rpg-mm-close:hover{transform:rotate(90deg);background:#ff6b9d;color:#fff}

    .rpg-mm-titulo{display:flex;flex-direction:column;align-items:center;gap:.1rem;padding-bottom:.4rem;border-bottom:2px dashed rgba(90,58,26,.4)}
    .rpg-mm-titulo span{font-size:.95rem;font-weight:900;color:#5a3a1a;letter-spacing:.04em;text-transform:uppercase}
    .rpg-mm-titulo small{font-size:.65rem;color:#7a5a2a;font-style:italic}

    .rpg-mm-svg-wrap{
      flex:1;min-height:0;
      background:#f0e2bf;border-radius:8px;padding:.3rem;
      border:2px solid rgba(90,58,26,.5);
      overflow:hidden;display:flex;align-items:center;justify-content:center;
    }
    .rpg-mm-svg{width:100%;height:100%;max-height:70vh;display:block}

    .rpg-mm-path{fill:none;stroke:#8b5a2b;stroke-width:1.6;stroke-dasharray:3 3.2;stroke-linecap:round;opacity:.85}

    .rpg-mm-dot{cursor:pointer;transition:transform .15s,filter .15s;stroke:#5a3a1a;stroke-width:1.3;transform-origin:center}
    .rpg-mm-dot:hover{filter:brightness(1.2)}
    .rpg-mm-dot:not(.jefe):not(.minijefe){fill:#fff4d4}
    .rpg-mm-dot:not(.jefe):not(.minijefe):hover{fill:#ffe89a}
    .rpg-mm-dot.minijefe{fill:#b58cff;stroke:#4a1e8b;stroke-width:1.6}
    .rpg-mm-dot.minijefe:hover{fill:#cdb0ff}
    .rpg-mm-dot.jefe{fill:#ff3366;stroke:#7a0028;stroke-width:2}
    .rpg-mm-dot.jefe:hover{fill:#ff5588}
    .rpg-mm-dot.conquistada{filter:drop-shadow(0 0 5px rgba(255,215,0,.9))}
    .rpg-mm-dot.conquistada:not(.jefe):not(.minijefe){fill:#ffe066}
    .rpg-mm-dot.bloqueada{fill:#8a7a5a;stroke:#4a3a1a;opacity:.55;cursor:not-allowed}
    .rpg-mm-dot.bloqueada:hover{filter:none}
    .rpg-mm-dot.actual{filter:drop-shadow(0 0 6px rgba(255,217,61,.95))}

    .rpg-mm-pulse{fill:none;stroke:#ffd93d;stroke-width:2;opacity:.9;pointer-events:none;transform-origin:center;animation:mmPulse 1.6s ease-out infinite}
    @keyframes mmPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(2.4);opacity:0}}

    .rpg-mm-leyenda{
      display:flex;justify-content:space-around;flex-wrap:wrap;gap:.3rem;
      font-size:.6rem;font-weight:900;color:#5a3a1a;text-transform:uppercase;
      letter-spacing:.04em;padding-top:.3rem;border-top:2px dashed rgba(90,58,26,.4);
    }
    .rpg-mm-leyenda span{display:inline-flex;align-items:center;gap:.25rem}
    .rpg-mm-leyenda i{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid #5a3a1a;background:#fff4d4}
    .rpg-mm-leyenda .dot-mini{background:#b58cff;border-color:#4a1e8b}
    .rpg-mm-leyenda .dot-jefe{background:#ff3366;border-color:#7a0028}
    .rpg-mm-leyenda .dot-lock{background:#8a7a5a;opacity:.55}
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
    btn.innerHTML = `<span>🗺️</span><span>Mapa</span><span class="badge" id="rpg-mm-btn-badge">0/0</span>`;
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
            <span>Camino de Aventuras</span>
            <small id="rpg-mm-progreso"></small>
          </div>
          <div class="rpg-mm-svg-wrap" id="rpg-mm-content"></div>
          <div class="rpg-mm-leyenda">
            <span><i class="dot-normal"></i>Zona</span>
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

    const zonas = window.Rpg?.zonas || [];
    const st    = window.Rpg?.state?.() || {};
    if (!zonas.length) {
      c.innerHTML = `<div style="padding:2rem;text-align:center;color:#5a3a1a;font-weight:900;">Cargando zonas…</div>`;
      return;
    }

    const W = 240, H = 500;
    const MARGEN_X = 42;
    const ANCHO = W - MARGEN_X * 2;
    const N = zonas.length;

    /* Puntos serpenteando */
    const puntos = [];
    for (let i = 0; i < N; i++) {
      const t = i / Math.max(1, N - 1);
      const onda = Math.sin(i * 0.68) * 0.5 + Math.sin(i * 0.21) * 0.18;
      const x = MARGEN_X + (onda * 0.5 + 0.5) * ANCHO;
      const y = H - 28 - t * (H - 56);
      puntos.push({ x: +x.toFixed(1), y: +y.toFixed(1) });
    }

    let pathD = "";
    puntos.forEach((p, i) => { pathD += (i === 0 ? "M " : " L ") + p.x + " " + p.y; });

    const idxActual = st.zonaActual ? zonas.findIndex(z => z.id === st.zonaActual) : -1;
    const conquistadas = zonas.filter(z => z.jefe && (st.jefesDerrotados || []).includes(z.id)).length;
    const totalJefes = zonas.filter(z => z.jefe).length;

    let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="rpg-mm-svg">`;
    svg += `<defs>
      <pattern id="mm-grid" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(120,80,30,.14)" stroke-width="0.5"/>
      </pattern>
    </defs>`;
    svg += `<rect width="${W}" height="${H}" fill="url(#mm-grid)"/>`;
    svg += `<path d="${pathD}" class="rpg-mm-path"/>`;

    puntos.forEach((p, i) => {
      const z = zonas[i];
      const desbloqueada = (st.nivel || 1) >= z.nivel - 2 || (st.enemigosDerrotados || 0) >= z.nivel * 5;
      const conquistada = z.jefe && (st.jefesDerrotados || []).includes(z.id);
      let cls = "rpg-mm-dot";
      if (z.jefe) cls += " jefe";
      else if (z.miniJefe) cls += " minijefe";
      if (!desbloqueada) cls += " bloqueada";
      if (i === idxActual) cls += " actual";
      if (conquistada) cls += " conquistada";
      const r = z.jefe ? 6 : z.miniJefe ? 4.4 : 3.4;
      svg += `<circle cx="${p.x}" cy="${p.y}" r="${r}" class="${cls}" data-zona="${z.id}" data-i="${i}">
        <title>${z.nombre} · Nv ${z.nivel}</title>
      </circle>`;
    });

    if (idxActual >= 0 && idxActual < puntos.length) {
      const p = puntos[idxActual];
      svg += `<circle cx="${p.x}" cy="${p.y}" r="10" class="rpg-mm-pulse"/>`;
    }
    svg += `</svg>`;
    c.innerHTML = svg;

    const prog = document.getElementById("rpg-mm-progreso");
    if (prog) prog.textContent = `${conquistadas} / ${totalJefes} jefes · ${st.enemigosDerrotados || 0} enemigos · Nv ${st.nivel || 1}`;

    c.querySelectorAll(".rpg-mm-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        const zid = dot.dataset.zona;
        const z = zonas.find(x => x.id === zid);
        if (!z) return;
        const desbloqueada = (st.nivel || 1) >= z.nivel - 2 || (st.enemigosDerrotados || 0) >= z.nivel * 5;
        if (!desbloqueada) return;

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