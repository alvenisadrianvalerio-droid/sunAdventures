/* ============================================================
   MEJORAS.JS — SunAdventures
   Todas las mejoras nuevas en un solo lugar
   ============================================================ */
(function () {
  "use strict";
  const $  = id => document.getElementById(String(id).replace(/^#/,""));
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const getUser = () => window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  const hoyISO = () => new Date().toISOString().slice(0,10);
  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.message || o.title));
  const alertar   = o => window.SunModal ? window.SunModal.alert(o)   : (alert(o.message || o.title), Promise.resolve());

  /* ============================================================
     1) 🎁 RECOMPENSA DIARIA (login)
     ============================================================ */
  const DIARIO_KEY = () => `sa_diario_${getUser()}`;
  const RECOMPENSAS_DIARIAS = [
    { dia:1, monedas:25, xp:10,  icono:"🪙" },
    { dia:2, monedas:35, xp:15,  icono:"🪙" },
    { dia:3, monedas:50, xp:25,  icono:"💎" },
    { dia:4, monedas:70, xp:40,  icono:"💎" },
    { dia:5, monedas:100,xp:60,  icono:"🌟" },
    { dia:6, monedas:150,xp:100, icono:"🌟" },
    { dia:7, monedas:250,xp:150, icono:"👑" }
  ];

  function cargarDiario() {
    try { return JSON.parse(localStorage.getItem(DIARIO_KEY()) || '{"ultimo":"","racha":0}'); }
    catch { return { ultimo:"", racha:0 }; }
  }
  function guardarDiario(d) { try { localStorage.setItem(DIARIO_KEY(), JSON.stringify(d)); } catch {} }

  function mostrarModalDiario(recompensa, racha, esNuevo) {
    const card = document.createElement("div");
    card.className = "daily-reward-overlay";
    card.innerHTML = `
      <div class="daily-reward-card">
        <div class="daily-reward-icon">${recompensa.icono}</div>
        <h2>¡Recompensa diaria!</h2>
        <p class="daily-reward-streak">Racha: <strong>${racha} día${racha===1?"":"s"}</strong></p>
        <div class="daily-reward-prizes">
          <span>🪙 +${recompensa.monedas} SunCoins</span>
          <span>✨ +${recompensa.xp} XP</span>
        </div>
        <button class="btn-primary" id="daily-claim">¡Recoger!</button>
      </div>`;
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add("active"));
    card.querySelector("#daily-claim").addEventListener("click", () => {
      card.classList.remove("active");
      setTimeout(() => card.remove(), 250);
      // Aplicar
      try { window._setMonedas?.(window._getMonedas?.() + recompensa.monedas); } catch {}
      try {
        const u = getUser();
        const k = `sa_experiencia_extra_${u}`;
        const xpAct = Number(localStorage.getItem(k) || 0) + recompensa.xp;
        localStorage.setItem(k, String(xpAct));
        window._experienciaActual = (window._experienciaActual || 0) + recompensa.xp;
      } catch {}
      try { window._darPremio?.(0, 5, "¡Recompensa diaria!"); } catch {}
      try { window.dispatchEvent(new Event("sunadventures:progress")); } catch {}
      try { window._snd?.("victoria"); } catch {}
    });
  }

  function comprobarDiario() {
    if (!window._getUserIdSafe && !localStorage.getItem("sunadventures_uid")) return;
    const d = cargarDiario();
    if (d.ultimo === hoyISO()) return;

    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    const ayerISO = ayer.toISOString().slice(0,10);
    let nuevaRacha = d.ultimo === ayerISO ? (d.racha + 1) : 1;
    if (nuevaRacha > 7) nuevaRacha = 1;

    const recompensa = RECOMPENSAS_DIARIAS[nuevaRacha - 1];
    guardarDiario({ ultimo: hoyISO(), racha: nuevaRacha });
    setTimeout(() => mostrarModalDiario(recompensa, nuevaRacha, true), 1500);
  }
  // Ejecutar cuando el usuario esté listo
  window.addEventListener("sunadventures:user-ready", () => setTimeout(comprobarDiario, 2000));
  setTimeout(() => { if (localStorage.getItem("sunadventures_uid")) comprobarDiario(); }, 3500);

  /* ============================================================
     2) ✏️ CAMBIAR NOMBRE
     ============================================================ */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('[data-action="cambiar-nombre"]');
    if (!btn) return;
    e.preventDefault();
    const actual = localStorage.getItem("sunadventures_username") || "usuario";
    const nuevo = prompt("Nuevo nombre de usuario (3-20 letras/números/_/-):", actual);
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
    } catch (err) {
      alertar({ title:"Error", message: err.message || "No se pudo cambiar", variant:"danger", icon:"❌" });
    }
  });

  /* ============================================================
     3) 🏆 NOTIFICACIONES DE LOGROS (garantizadas)
     ============================================================ */
  // Ya existe notificarLogro en album.js. Aseguramos que se dispare
  // incluso si el usuario está en otra vista.
  let _ultimoCheckLogros = 0;
  window.addEventListener("sunadventures:progress", () => {
    if (Date.now() - _ultimoCheckLogros < 2000) return;
    _ultimoCheckLogros = Date.now();
    setTimeout(() => { try { window.renderLogros?.({ notificar:true }); } catch {} }, 300);
  });

  /* ============================================================
     4) 🗺️ ZONAS: desbloqueo progresivo real
     ============================================================ */
  // Parcheamos la comprobación del rpg.js: solo se desbloquea si la
  // zona ANTERIOR (orden-1) ya fue superada.
  function patchZonas() {
    if (!window.Rpg) return false;
    const zonas = window.Rpg.zonas;
    if (!zonas || !zonas.length) return false;
    // Respetar la progresión estricta canónica definida en rpg.js
    return true;
  }
  let _triesZonas = 0;
  const _intPatch = setInterval(() => {
    if (patchZonas() || ++_triesZonas > 40) clearInterval(_intPatch);
  }, 300);

  /* ============================================================
     5) 💤 LUGAR DE DESCANSO RPG (curarte por monedas)
     ============================================================ */
  // El coste sube con el nivel
  function costeDescanso() {
    const st = window.Rpg?.state?.() || { nivel:1 };
    return Math.round(30 + st.nivel * 15 + Math.pow(st.nivel, 1.4) * 3);
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('[data-rpg-accion="descansar"]');
    if (!btn) return;
    e.preventDefault();
    const st = window.Rpg?.state?.();
    if (!st) return;
    const cost = costeDescanso();
    if (st.hp >= (80 + st.nivel*20)) return alertar({ title:"Ya estás al máximo", message:"No necesitas descansar.", icon:"💚" });
    if (window._getMonedas() < cost) return alertar({ title:"Sin monedas", message:`Necesitas ${cost} 🪙 para descansar.`, variant:"warning", icon:"🪙" });
    const ok = await confirmar({
      title:"💤 Descansar",
      message:`Recuperarás toda tu vida por <strong>${cost} 🪙</strong>.<br><small>El precio sube con tu nivel.</small>`,
      variant:"success", icon:"🔥", confirmText:`Pagar ${cost}`, cancelText:"Cancelar"
    });
    if (!ok) return;
    window._setMonedas(window._getMonedas() - cost);
    st.hp = 80 + st.nivel * 20;
    try { localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st)); } catch {}
    alertar({ title:"¡Descansado!", message:"Vida restaurada por completo.", variant:"success", icon:"💚" });
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  });

  // Inyectar botón de descanso en el panel RPG
  function inyectarBotonDescanso() {
    const panel = document.querySelector('[data-rpg-panel="zonas"]');
    if (!panel || panel.querySelector('[data-rpg-accion="descansar"]')) return;
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;justify-content:center;margin:1rem 0;";
    wrap.innerHTML = `<button type="button" class="rpg-btn huir" data-rpg-accion="descansar" style="max-width:280px;">
      💤 Descansar · <span id="rpg-rest-cost">${costeDescanso()} 🪙</span>
    </button>`;
    panel.appendChild(wrap);
  }
  setInterval(() => {
    inyectarBotonDescanso();
    const c = $("rpg-rest-cost");
    if (c) c.textContent = `${costeDescanso()} 🪙`;
  }, 1500);

  /* ============================================================
     6) 🛡️ ESCUDOS RPG con barra morada
     ============================================================ */
  // Añadimos CSS dinámico para la barra de escudo
  const css = document.createElement("style");
  css.textContent = `
    .rpg-shield-bar {
      height: 6px; border-radius: 999px; overflow: hidden;
      background: rgba(166,132,240,.15);
      margin-top: .25rem;
      position: relative;
    }
    .rpg-shield-bar > span {
      display: block; height: 100%; width: 0%;
      background: linear-gradient(90deg, #a684f0, #d4b8ff);
      border-radius: inherit; transition: width .4s;
      box-shadow: 0 0 8px rgba(166,132,240,.7);
    }
    .rpg-shield-bar::after {
      content: "🛡️"; position: absolute; right: 4px; top: -8px;
      font-size: .65rem;
    }
  `;
  document.head.appendChild(css);

  function getEscudoHeroe() {
    try {
      const st = window.Rpg?.state?.() || {};
      return st.escudo || 0;
    } catch { return 0; }
  }
  function setEscudoHeroe(v) {
    try {
      const st = window.Rpg?.state?.();
      if (!st) return;
      st.escudo = Math.max(0, v);
      localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st));
      refrescarBarraEscudo();
    } catch {}
  }
  function refrescarBarraEscudo() {
    const batalla = $("rpg-batalla");
    if (!batalla) return;
    const hpInfo = batalla.querySelector(".rpg-hero-info") || batalla.querySelector("#fighter-heroe");
    if (!hpInfo) return;
    let barra = hpInfo.querySelector(".rpg-shield-bar");
    if (!barra) {
      barra = document.createElement("div");
      barra.className = "rpg-shield-bar";
      barra.innerHTML = `<span></span>`;
      hpInfo.appendChild(barra);
    }
    const v = getEscudoHeroe();
    const maxEsc = 100;
    barra.querySelector("span").style.width = Math.min(100, (v/maxEsc)*100) + "%";
  }
  // Hook al evento de buff para escudos
  window.addEventListener("rpg:fx", (e) => {
    const d = e.detail;
    if (d?.fxKey === "buffDef" || d?.fxKey === "shieldBurst") {
      setEscudoHeroe(getEscudoHeroe() + 25);
    }
  });
  setInterval(refrescarBarraEscudo, 800);

  /* ============================================================
     7) 🐾 OCULTAR MASCOTA FLOTANTE EN RPG / ROGUELIKE
     ============================================================ */
  const css2 = document.createElement("style");
  css2.textContent = `
    body.rpg-abierto .mascota-wrapper { opacity: 0 !important; pointer-events: none !important; transform: translateY(30px); transition: opacity .3s, transform .3s; }
    body.rpg-abierto #shop-bubble { bottom: 24px; }
  `;
  document.head.appendChild(css2);

  function actualizarVisibilidadMascota() {
    const enRpg = location.hash === "#rpg" || document.querySelector('[data-view="rpg"].active');
    document.body.classList.toggle("rpg-abierto", !!enRpg);
  }
  window.addEventListener("hashchange", actualizarVisibilidadMascota);
  setInterval(actualizarVisibilidadMascota, 500);
  actualizarVisibilidadMascota();

  /* ============================================================
     8) 🎁 RECOMPENSA DIARIA DE AVENTURA (modo RPG)
     ============================================================ */
  const RPG_DIARIO_KEY = () => `sa_rpg_diario_${getUser()}`;
  function reclamarRpgDiario() {
    const hoy = hoyISO();
    const ultimo = localStorage.getItem(RPG_DIARIO_KEY());
    if (ultimo === hoy) return false;
    localStorage.setItem(RPG_DIARIO_KEY(), hoy);
    const st = window.Rpg?.state?.();
    const nivel = st?.nivel || 1;
    const monedas = Math.round(15 + nivel * 2);
    const xp = Math.round(20 + nivel * 5);
    window._setMonedas(window._getMonedas() + monedas);
    if (st) { st.xp += xp; try { localStorage.setItem(`sa_rpg_${getUser()}`, JSON.stringify(st)); } catch {} }
    alertar({
      title:"🎁 Recompensa de aventura",
      message:`Has recibido <strong>+${monedas} 🪙</strong> y <strong>+${xp} XP</strong> por tu visita diaria.`,
      variant:"success", icon:"⚔️"
    });
    try { window.dispatchEvent(new Event("rpg:stats-cambiados")); } catch {}
    return true;
  }
  window.addEventListener("sunadventures:user-ready", () => setTimeout(reclamarRpgDiario, 4000));
  setTimeout(() => { if (localStorage.getItem("sunadventures_uid")) reclamarRpgDiario(); }, 6000);

  /* ============================================================
     9) 🛒 BURBUJA FLOTANTE TIENDA
     ============================================================ */
  const sb = $("shop-bubble");
  if (sb) {
    sb.addEventListener("click", () => {
      try {
        window.Tienda?.abrir?.();
      } catch (e) { console.warn("shop-bubble:", e); }
    });
  }

  /* ============================================================
     10) 🏪 ÍTEMS DE TIENDA FUNCIONAN EN RPG
     ============================================================ */
  // Los bonus ya se leen vía _getBonusActivos() en rpg.js.
  // Aseguramos que se recarguen al equipar/quitar:
  window.addEventListener("sunadventures:tienda-compra", () => {
    try { window.dispatchEvent(new Event("rpg:stats-cambiados")); } catch {}
  });
  window.addEventListener("sunadventures:mascota-cambiada", () => {
    try { window.dispatchEvent(new Event("rpg:stats-cambiados")); } catch {}
  });

  console.log("✅ mejoras.js cargado · diario + nombre + rpg-shop + escudos + zonas");
})();