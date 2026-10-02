/* ============================================================
   PARCHES-V2.JS v3 — Fixes + Snake
   ============================================================ */
(function () {
  "use strict";
  const $   = id => document.getElementById(String(id).replace(/^#/,""));
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const getUser = () => window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.message || o.title));
  const alertar   = o => window.SunModal ? window.SunModal.alert(o)   : (alert(o.message || o.title), Promise.resolve());
  const snd = t => { try { window._snd?.(t); } catch {} };
  const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

  /* ============================================================
     1) 🗺️ ZONAS — desbloqueo permisivo
     ============================================================ */
  function patchZonas() {
    if (!window.Rpg) return false;
    const zonas = window.Rpg.zonas;
    if (!zonas?.length) return false;
    window._rpgZonaDesbloqueada = function(id) {
      const z = zonas.find(x => x.id === id);
      if (!z) return false;
      if (z.orden === 1) return true;
      const st = window.Rpg.state();
      const nivel = st.nivel || 1;
      const derr  = st.enemigosDerrotados || 0;
      return nivel >= z.nivel - 3 || derr >= z.nivel * 2;
    };
    return true;
  }
  let _t=0; const _i=setInterval(()=>{ if (patchZonas() || ++_t>50) clearInterval(_i); }, 300);

  /* ============================================================
     2) 🛡️ ESCUDO — barra morada
     ============================================================ */
  const getEsc = () => { try { return window.Rpg?.state?.()?.escudo || 0; } catch { return 0; } };
  function setEsc(v) {
    try {
      const st = window.Rpg?.state?.(); if (!st) return;
      st.escudo = Math.max(0, v);
      localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st));
    } catch {}
  }
  function pintarEsc() {
    const hero = document.querySelector("#rpg-batalla .rpg-hero-info");
    if (!hero) return;
    const v = getEsc();
    let wrap = hero.querySelector(".rpg-shield-wrap");
    if (v <= 0) { wrap?.remove(); return; }
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "rpg-shield-wrap";
      wrap.innerHTML = `<span>🛡️</span><div class="rpg-shield-bar"><span></span></div><strong class="rpg-shield-val">0</strong>`;
      hero.appendChild(wrap);
    }
    wrap.querySelector(".rpg-shield-bar > span").style.width = Math.min(100, (v/100)*100) + "%";
    wrap.querySelector(".rpg-shield-val").textContent = v;
  }
  new MutationObserver((muts) => muts.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    const t = n.textContent || "";
    if (/escudo|blinda|🛡️/i.test(t)) {
      const match = t.match(/(\d+)/);
      if (match) setEsc(parseInt(match[1], 10));
    }
  }))).observe(document.body, { childList: true, subtree: true });
  setInterval(pintarEsc, 800);

  /* ============================================================
     3) 👆 LONG PRESS → tooltip habilidades
     ============================================================ */
  let _lpTimer = null, _lpEl = null;
  function cerrarTip() { _lpEl?.remove(); _lpEl = null; }
  function mostrarTip(btn) {
    const desc = btn.getAttribute("title") || "";
    const nombre = btn.querySelector(".rpg-hab-nombre")?.textContent || "";
    const lv = btn.querySelector(".rpg-hab-lv")?.textContent || "";
    const tipo = (btn.className.match(/rpg-hab-(\S+)/)?.[1] || "daño");
    if (!desc && !nombre) return;
    cerrarTip();
    _lpEl = document.createElement("div");
    _lpEl.className = "rpg-hab-tooltip";
    _lpEl.innerHTML = `<strong>${nombre} ${lv ? "· "+lv : ""}</strong><span class="rpg-hab-tooltip-tipo ${tipo}">${tipo.replace(/_/g," ")}</span><div>${desc || "Sin descripción"}</div>`;
    document.body.appendChild(_lpEl);
    const r = btn.getBoundingClientRect(), tr = _lpEl.getBoundingClientRect();
    let l = r.left + r.width/2 - tr.width/2;
    let t = r.top - tr.height - 10;
    if (l < 8) l = 8;
    if (l + tr.width > innerWidth - 8) l = innerWidth - tr.width - 8;
    if (t < 8) t = r.bottom + 10;
    _lpEl.style.left = l + "px"; _lpEl.style.top = t + "px";
    try { navigator.vibrate?.(15); } catch {}
  }
  function bindLP(btn) {
    if (btn._lp) return; btn._lp = true;
    const start = () => { clearTimeout(_lpTimer); _lpTimer = setTimeout(() => mostrarTip(btn), 450); };
    const end = () => { clearTimeout(_lpTimer); cerrarTip(); };
    btn.addEventListener("mousedown", start);
    btn.addEventListener("mouseup", end);
    btn.addEventListener("mouseleave", end);
    btn.addEventListener("touchstart", start, { passive: true });
    btn.addEventListener("touchend", end);
    btn.addEventListener("touchcancel", end);
    btn.addEventListener("click", (e) => { if (_lpEl) { e.stopPropagation(); e.preventDefault(); cerrarTip(); } }, true);
  }
  setInterval(() => qsa(".rpg-hab").forEach(bindLP), 700);

  /* ============================================================
     4) 🐾 MASCOTA oculta en RPG
     ============================================================ */
  function checkMascota() {
    const enRpg = location.hash === "#rpg" || document.querySelector('[data-view="rpg"].active');
    const w = $("mascota-wrapper"), sb = $("shop-bubble");
    if (w) { w.style.opacity = enRpg ? "0" : "1"; w.style.pointerEvents = enRpg ? "none" : ""; w.style.transition = "opacity .3s"; }
    if (sb) { sb.style.opacity = enRpg ? "0" : "1"; sb.style.pointerEvents = enRpg ? "none" : ""; sb.style.transition = "opacity .3s"; }
  }
  window.addEventListener("hashchange", checkMascota);
  setInterval(checkMascota, 500);

  /* ============================================================
     5) 🎨 TEMA CLARO comprable (500 🪙)
     ============================================================ */
  function addTemaClaro() {
    const T = window._TiendaAPI?.TIENDA_ITEMS;
    if (!T?.fondos) return false;
    if (T.fondos.claro) return true;
    T.fondos.claro = { nombre:"Modo Claro", precio:500, icono:"sol", sheet:"tienda", sprite:[3,5], desc:"Cambia toda la web", bonus:{ tipo:"tema_claro", val:1, desc:"Tema claro luminoso y cálido" } };
    return true;
  }
  let _tc=0; const _tci=setInterval(()=>{ if (addTemaClaro() || ++_tc>40) clearInterval(_tci); }, 300);

  const _origTema = window._aplicarTemaFondo;
  window._aplicarTemaFondo = function () {
    try { _origTema?.(); } catch {}
    try {
      const u = getUser(), m = localStorage.getItem("mascota_actual") || "mapache";
      const eq = JSON.parse(localStorage.getItem(`mascota_skins_eq_${u}_${m}`) || "{}");
      document.body.classList.toggle("light", eq.fondos === "claro");
      document.body.classList.toggle("tema-claro", eq.fondos === "claro");
    } catch {}
  };

  /* ============================================================
     6) 🎁 RECOMPENSA DIARIA
     ============================================================ */
  const DREC = [
    { monedas:25,  xp:10,  icono:"🪙" },
    { monedas:35,  xp:15,  icono:"🪙" },
    { monedas:50,  xp:25,  icono:"💎" },
    { monedas:70,  xp:40,  icono:"💎" },
    { monedas:100, xp:60,  icono:"🌟" },
    { monedas:150, xp:100, icono:"🌟" },
    { monedas:250, xp:150, icono:"👑" }
  ];
  const DK = () => `sa_diario_${getUser()}`;
  const cargarD = () => { try { return JSON.parse(localStorage.getItem(DK()) || '{"ultimo":"","racha":0}'); } catch { return { ultimo:"", racha:0 }; } };
  const guardarD = d => { try { localStorage.setItem(DK(), JSON.stringify(d)); } catch {} };

  function modalDiario(rec, racha) {
    const card = document.createElement("div");
    card.className = "daily-reward-overlay";
    card.innerHTML = `<div class="daily-reward-card">
      <div class="daily-reward-icon">${rec.icono}</div>
      <h2>¡Recompensa diaria!</h2>
      <p class="daily-reward-streak">Racha: <strong>${racha} día${racha===1?"":"s"}</strong></p>
      <div class="daily-reward-prizes">
        <span>🪙 +${rec.monedas} SunCoins</span>
        <span>✨ +${rec.xp} XP</span>
      </div>
      <button class="btn-primary" id="daily-claim">¡Recoger!</button>
    </div>`;
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add("active"));
    card.querySelector("#daily-claim").addEventListener("click", () => {
      card.classList.remove("active");
      setTimeout(() => card.remove(), 250);
      try { window._setMonedas?.((window._getMonedas?.() || 0) + rec.monedas); } catch {}
      try {
        const u = getUser(), k = `sa_experiencia_extra_${u}`;
        localStorage.setItem(k, String(Number(localStorage.getItem(k) || 0) + rec.xp));
        window._experienciaActual = (window._experienciaActual || 0) + rec.xp;
      } catch {}
      try { window._darPremio?.(0, 5, "¡Recompensa diaria!"); } catch {}
      snd("victoria");
    });
  }
  function checkDiario() {
    if (!localStorage.getItem("sunadventures_uid")) return;
    const d = cargarD();
    const hoy = new Date().toISOString().slice(0,10);
    if (d.ultimo === hoy) return;
    const ayer = new Date(); ayer.setDate(ayer.getDate()-1);
    const ayerISO = ayer.toISOString().slice(0,10);
    let r = d.ultimo === ayerISO ? d.racha + 1 : 1;
    if (r > 7) r = 1;
    guardarD({ ultimo: hoy, racha: r });
    setTimeout(() => modalDiario(DREC[r-1], r), 1500);
  }
  window.addEventListener("sunadventures:user-ready", () => setTimeout(checkDiario, 2000));
  setTimeout(() => { if (localStorage.getItem("sunadventures_uid")) checkDiario(); }, 3500);

  /* ============================================================
     7) ✏️ CAMBIAR NOMBRE
     ============================================================ */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('[data-action="cambiar-nombre"]');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const actual = localStorage.getItem("sunadventures_username") || "usuario";
    const nuevo = prompt("Nuevo nombre (3-20 caracteres):", actual);
    if (!nuevo) return;
    const limpio = nuevo.trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,20}$/.test(limpio)) return alertar({ title:"Nombre inválido", message:"3-20 caracteres: letras, números, _ o -", variant:"danger", icon:"⚠️" });
    try {
      const sb = window._supabase;
      if (sb) {
        const { data:{ session } } = await sb.auth.getSession();
        if (session) {
          const { error } = await sb.from("perfiles").update({ username: limpio }).eq("id", session.user.id);
          if (error) throw error;
        }
      }
      localStorage.setItem("sunadventures_username", limpio);
      const ue = $("user-email"); if (ue) ue.textContent = limpio;
      const udn = $("user-dropdown-name"); if (udn) udn.textContent = limpio;
      alertar({ title:"¡Listo!", message:`Ahora te llamas @${limpio}`, variant:"success", icon:"✨" });
    } catch (err) { alertar({ title:"Error", message: err.message || "No se pudo cambiar", variant:"danger", icon:"❌" }); }
  }, true);

  /* ============================================================
     8) 🛒 BURBUJA TIENDA
     ============================================================ */
  const sb = $("shop-bubble");
  if (sb && !sb._p) {
    sb._p = true;
    sb.addEventListener("click", (e) => {
      e.preventDefault();
      const modal = $("mascota-modal");
      if (modal?.classList.contains("active")) {
        const tab = document.querySelector('[data-mm-tab="tienda"]'); if (tab) tab.click();
        const embed = $("tienda-embed"); if (embed) window.Tienda?.montar?.(embed);
      } else window.Tienda?.abrir?.();
    }, true);
  }

  /* ============================================================
     9) 💤 DESCANSAR RPG
     ============================================================ */
  const costeRest = () => { const st = window.Rpg?.state?.() || {nivel:1}; return Math.round(30 + st.nivel*15 + Math.pow(st.nivel,1.4)*3); };
  function inyectarRest() {
    const panel = document.querySelector('[data-rpg-panel="zonas"]');
    if (!panel || panel.querySelector('[data-rpg-accion="descansar"]')) return;
    const w = document.createElement("div");
    w.style.cssText = "display:flex;justify-content:center;margin:1rem 0;";
    w.innerHTML = `<button type="button" class="rpg-btn huir" data-rpg-accion="descansar" style="max-width:300px;padding:.8rem 1.4rem;">💤 Descansar <span id="rpg-rest-cost" style="margin-left:.4rem;opacity:.85;">${costeRest()} 🪙</span></button>`;
    panel.appendChild(w);
  }
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('[data-rpg-accion="descansar"]'); if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const st = window.Rpg?.state?.(); if (!st) return;
    const hpMax = 80 + st.nivel*20, cost = costeRest();
    if (st.hp >= hpMax) return alertar({ title:"Ya estás al máximo", message:"No necesitas descansar.", icon:"💚" });
    if (window._getMonedas() < cost) return alertar({ title:"Sin monedas", message:`Necesitas ${cost} 🪙.`, variant:"warning", icon:"🪙" });
    const ok = await confirmar({ title:"💤 Descansar", message:`Recuperarás toda tu vida por <strong>${cost} 🪙</strong>.`, variant:"success", icon:"🔥", confirmText:`Pagar ${cost}`, cancelText:"Cancelar" });
    if (!ok) return;
    window._setMonedas(window._getMonedas() - cost);
    st.hp = hpMax;
    try { localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st)); } catch {}
    alertar({ title:"¡Descansado!", message:"Vida restaurada.", variant:"success", icon:"💚" });
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }, true);
  setInterval(() => { inyectarRest(); const c = $("rpg-rest-cost"); if (c) c.textContent = `${costeRest()} 🪙`; }, 1200);

  /* ============================================================
     10) 🎁 RECOMPENSA DIARIA RPG
     ============================================================ */
  const RK = () => `sa_rpg_diario_${getUser()}`;
  function rpgDiario() {
    if (!localStorage.getItem("sunadventures_uid")) return;
    const hoy = new Date().toISOString().slice(0,10);
    if (localStorage.getItem(RK()) === hoy) return;
    localStorage.setItem(RK(), hoy);
    const st = window.Rpg?.state?.(), nivel = st?.nivel || 1;
    const mon = Math.round(15 + nivel*2), xp = Math.round(20 + nivel*5);
    window._setMonedas(window._getMonedas() + mon);
    if (st) { st.xp += xp; try { localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st)); } catch {} }
    alertar({ title:"🎁 Recompensa de aventura", message:`+<strong>${mon} 🪙</strong> · +<strong>${xp} XP</strong>`, variant:"success", icon:"⚔️" });
  }
  window.addEventListener("sunadventures:user-ready", () => setTimeout(rpgDiario, 4000));
  setTimeout(() => { if (localStorage.getItem("sunadventures_uid")) rpgDiario(); }, 6000);

  /* ============================================================
     11) 🗑️ QUITAR duplicados (por si acaso)
     ============================================================ */
  function quitarDup() {
    const bs = qsa(".btn-minijuego");
    const vistas = new Set();
    bs.forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if (vistas.has(t)) b.remove();
      else vistas.add(t);
    });
    // Eliminar "Poción mágica" completamente
    bs.forEach(b => { if (/poción mágica/i.test(b.textContent)) b.remove(); });
  }
  setInterval(quitarDup, 1500);

  /* ============================================================
     12) 🐍 SNAKE — Minijuego
     ============================================================ */
  function crearOverlaySnake() {
    document.getElementById("snake-overlay")?.remove();
    const o = document.createElement("div");
    o.id = "snake-overlay";
    o.className = "minijuego-overlay";
    o.innerHTML = `
      <div class="minijuego-panel">
        <button class="minijuego-cerrar" data-close-snake>×</button>
        <h2 class="minijuego-titulo">Serpiente del Jardín</h2>
        <p class="minijuego-desc">Come girasoles 🌻 · Crece · ¡No choques!</p>
        <div class="snake-hud">
          <div class="jm-hud-card"><span class="jm-hud-icon">🌻</span><div class="jm-hud-info"><span class="jm-hud-label">Comidos</span><strong id="snk-puntos">0</strong></div></div>
          <div class="jm-hud-card"><span class="jm-hud-icon">📏</span><div class="jm-hud-info"><span class="jm-hud-label">Largo</span><strong id="snk-largo">3</strong></div></div>
          <div class="jm-hud-card jm-hud-time"><span class="jm-hud-icon">⚡</span><div class="jm-hud-info"><span class="jm-hud-label">Velocidad</span><strong id="snk-vel">1</strong></div></div>
        </div>
        <div class="snake-wrap">
          <canvas id="snk-canvas" class="snake-canvas" width="420" height="420"></canvas>
          <div class="snake-controles">
            <button class="snake-btn arriba" data-dir="up">▲</button>
            <button class="snake-btn izq" data-dir="left">◀</button>
            <button class="snake-btn abajo" data-dir="down">▼</button>
            <button class="snake-btn der" data-dir="right">▶</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(o);
    o.classList.add("active");
    o.addEventListener("click", (e) => {
      if (e.target === o || e.target.hasAttribute("data-close-snake")) {
        clearInterval(o._tk);
        o.classList.remove("active");
        setTimeout(() => o.remove(), 250);
        document.removeEventListener("keydown", o._onKey);
      }
    });
    return o;
  }

  function juegoSnake() {
    const o = crearOverlaySnake();
    const cv = o.querySelector("#snk-canvas");
    const ctx = cv.getContext("2d");
    const E = o.querySelector("#snk-puntos");
    const L = o.querySelector("#snk-largo");
    const V = o.querySelector("#snk-vel");

    const GRID = 21;
    const CELL = cv.width / GRID;

    let snake = [{x:10, y:10}, {x:9, y:10}, {x:8, y:10}];
    let dir = {x:1, y:0}, nextDir = {x:1, y:0};
    let comida = null, puntos = 0, activo = true;
    let velocidad = 160;
    let intervalo = null;

    function nuevaComida() {
      let tries = 0;
      do {
        comida = { x: rnd(0, GRID-1), y: rnd(0, GRID-1) };
        tries++;
      } while (snake.some(s => s.x === comida.x && s.y === comida.y) && tries < 100);
    }

    function draw() {
      // Fondo
      ctx.fillStyle = "rgba(8,20,12,.85)";
      ctx.fillRect(0, 0, cv.width, cv.height);

      // Rejilla
      ctx.strokeStyle = "rgba(77,212,142,.07)";
      ctx.lineWidth = 1;
      for (let i = 1; i < GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i*CELL, 0); ctx.lineTo(i*CELL, cv.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*CELL); ctx.lineTo(cv.width, i*CELL); ctx.stroke();
      }

      // Comida (girasol)
      if (comida) {
        const cx = comida.x*CELL + CELL/2, cy = comida.y*CELL + CELL/2;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL);
        g.addColorStop(0, "#ffe066");
        g.addColorStop(1, "rgba(255,180,30,0)");
        ctx.fillStyle = g;
        ctx.fillRect(comida.x*CELL - 4, comida.y*CELL - 4, CELL + 8, CELL + 8);
        ctx.font = `${CELL-2}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("🌻", cx, cy + 1);
      }

      // Serpiente
      snake.forEach((s, i) => {
        const head = i === 0;
        const x = s.x*CELL, y = s.y*CELL;
        const grad = ctx.createLinearGradient(x, y, x+CELL, y+CELL);
        if (head) { grad.addColorStop(0, "#a8f0b8"); grad.addColorStop(1, "#4dd48e"); }
        else { grad.addColorStop(0, "#4dd48e"); grad.addColorStop(1, "#2a8a4a"); }
        ctx.fillStyle = grad;
        const pad = head ? 1 : 2;
        roundRect(ctx, x+pad, y+pad, CELL-pad*2, CELL-pad*2, head ? 8 : 6);
        ctx.fill();
        if (head) {
          ctx.fillStyle = "#0b2e1a";
          const ex = dir.x, ey = dir.y;
          const cx = x + CELL/2, cy = y + CELL/2;
          ctx.beginPath();
          ctx.arc(cx + ex*3 - ey*3, cy + ey*3 - ex*3, 1.8, 0, Math.PI*2);
          ctx.arc(cx + ex*3 + ey*3, cy + ey*3 + ex*3, 1.8, 0, Math.PI*2);
          ctx.fill();
        }
      });
    }

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x+r, y);
      c.arcTo(x+w, y, x+w, y+h, r);
      c.arcTo(x+w, y+h, x, y+h, r);
      c.arcTo(x, y+h, x, y, r);
      c.arcTo(x, y, x+w, y, r);
      c.closePath();
    }

    function tick() {
      if (!activo) return;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Pared
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) return terminar(false);
      // Autocolisión
      if (snake.some(s => s.x === head.x && s.y === head.y)) return terminar(false);

      snake.unshift(head);

      if (comida && head.x === comida.x && head.y === comida.y) {
        puntos++;
        E.textContent = puntos;
        L.textContent = snake.length;
        snd("moneda");
        // Acelerar cada 3 comidas
        if (puntos % 3 === 0 && velocidad > 70) {
          velocidad -= 12;
          V.textContent = Math.round((160 - velocidad) / 12) + 1;
          clearInterval(intervalo);
          intervalo = setInterval(tick, velocidad);
        }
        nuevaComida();
      } else {
        snake.pop();
      }
      draw();
    }

    function terminar(gano) {
      activo = false;
      clearInterval(intervalo);
      const m = Math.max(1, puntos * 4);
      try { window._darPremio?.(m, Math.min(20, puntos * 2), `¡${puntos} girasoles! +${m}`); } catch {}
      snd("derrota");

      const panel = o.querySelector(".minijuego-panel");
      const r = document.createElement("div");
      r.className = "minijuego-mensaje";
      r.innerHTML = `
        <div style="font-size:3.5rem;">${puntos >= 20 ? "🏆" : puntos >= 10 ? "🌟" : "🐍"}</div>
        <h2>${puntos >= 20 ? "¡Maestro serpiente!" : puntos >= 10 ? "¡Buen bocado!" : "¡Ups!"}</h2>
        <p>Comiste</p>
        <span class="minijuego-mensaje-num">${puntos}</span>
        <p>girasoles</p>
        <p style="color:#4dd48e;font-weight:bold;">+${m} 🪙</p>
        <div class="minijuego-botones">
          <button type="button" class="btn-primary" id="snk-otra">Otra vez</button>
        </div>`;
      panel.appendChild(r);
      r.querySelector("#snk-otra").addEventListener("click", () => { o.remove(); setTimeout(juegoSnake, 100); });
    }

    function setDir(d) {
      const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const nd = map[d]; if (!nd) return;
      if (nd.x === -dir.x && nd.y === -dir.y) return; // no reversa
      nextDir = nd;
    }

    qsa(".snake-btn", o).forEach(b => b.addEventListener("click", () => setDir(b.dataset.dir)));

    o._onKey = (e) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w") { e.preventDefault(); setDir("up"); }
      else if (k === "ArrowDown" || k === "s") { e.preventDefault(); setDir("down"); }
      else if (k === "ArrowLeft" || k === "a") { e.preventDefault(); setDir("left"); }
      else if (k === "ArrowRight" || k === "d") { e.preventDefault(); setDir("right"); }
    };
    document.addEventListener("keydown", o._onKey);

    // Swipe táctil
    let tsx = 0, tsy = 0;
    cv.addEventListener("touchstart", (e) => { tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - tsx;
      const dy = e.changedTouches[0].clientY - tsy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
      else setDir(dy > 0 ? "down" : "up");
    });

    nuevaComida();
    draw();
    intervalo = setInterval(tick, velocidad);
    o._tk = intervalo;
  }

  // Inyectar botón "Snake" en el menú de minijuegos
  function inyectarBotonSnake() {
    const menu = document.querySelector(".minijuegos-menu");
    if (!menu || menu.querySelector('[data-juego="snake"]')) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-minijuego";
    b.dataset.juego = "snake";
    b.innerHTML = `<span class="btn-minijuego-icon" style="font-size:1.6rem;">🐍</span><span class="btn-minijuego-text">Serpiente</span>`;
    b.addEventListener("click", juegoSnake);
    menu.appendChild(b);
  }
  window.addEventListener("hashchange", () => setTimeout(inyectarBotonSnake, 400));
  setInterval(inyectarBotonSnake, 1200);
  /* ============================================================
   🛡️ ANTI-FOUC — Evita que se vean botones duplicados al recargar
   Se ejecuta ANTES de que juegos.js inyecte nada.
   ============================================================ */
(function antiFouc() {
  const BLOCK = [/poción mágica/i, /pocion magica/i];
  const CLEAN_STYLE = `
    .minijuegos-menu:not(.mjs-ready) .btn-minijuego { visibility: hidden !important; }
    .minijuegos-menu.mjs-ready .btn-minijuego { visibility: visible !important; }
  `;
  // Inyectar CSS lo antes posible (head puede no existir aún)
  const injectStyle = () => {
    if (document.getElementById("mjs-anti-fouc")) return;
    const s = document.createElement("style");
    s.id = "mjs-anti-fouc";
    s.textContent = CLEAN_STYLE;
    (document.head || document.documentElement).appendChild(s);
  };
  injectStyle();

  function clean(menu) {
    if (!menu) return false;
    const vistos = new Set();
    let cambio = false;
    [...menu.querySelectorAll(".btn-minijuego")].forEach(b => {
      const t = (b.textContent || "").trim().toLowerCase();
      // 1) Bloquear "Poción mágica" (y similares)
      if (BLOCK.some(r => r.test(t))) { b.remove(); cambio = true; return; }
      // 2) Bloquear duplicados (primer botón con ese texto gana)
      if (vistos.has(t)) { b.remove(); cambio = true; return; }
      vistos.add(t);
    });
    return cambio;
  }

  function marcarListo(menu) {
    if (!menu) return;
    clean(menu);
    menu.classList.add("mjs-ready");
  }

  // Observer que limpia SÍNCRONAMENTE cada vez que aparezca un botón
  const obs = new MutationObserver(() => {
    const menu = document.querySelector(".minijuegos-menu");
    if (!menu) return;
    clean(menu);
    clearTimeout(menu._mjsTimer);
    menu._mjsTimer = setTimeout(() => menu.classList.add("mjs-ready"), 250);
  });

  function start() {
    if (!document.body) return;
    obs.observe(document.body, { childList: true, subtree: true });
    // Si ya existe el menú al arrancar, limpiar y marcar tras un tick
    const menu = document.querySelector(".minijuegos-menu");
    if (menu) setTimeout(() => marcarListo(menu), 400);
    // Failsafe: pase lo que pase, revelar el menú a los 1.2s y 2.5s
    setTimeout(() => marcarListo(document.querySelector(".minijuegos-menu")), 1200);
    setTimeout(() => marcarListo(document.querySelector(".minijuegos-menu")), 2500);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });

  // Exponer por si algún día se necesita forzar
  window._limpiarMenuJuegos = () => marcarListo(document.querySelector(".minijuegos-menu"));
})();
  // Exponer
  window.abrirSnake = juegoSnake;

  console.log("✅ parches-v2.js v3 cargado — zonas, escudo, snake, diario, temas, fixes");
})();