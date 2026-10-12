/* ============================================================
   PAREJA-SISTEMA.JS — SunAdventures
   Sistema integral de Pareja vs Grupo:
   - Sincronización en la nube de fotos y notas al tener pareja
   - Cuidado compartido de mascota flotante
   - Modo RPG Cooperativo con tu pareja
   - Sistema de chat enriquecido (reacciones rápidas, stickers y estados)
   ============================================================ */

(function () {
  "use strict";

  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const sb = () => window._supabase;
  const getUserId = () => window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
  const alertar = o => window.SunModal ? window.SunModal.alert(o) : (alert(o.message || o.title), Promise.resolve());
  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.message || o.title));

  const KEY_PAREJA = () => `sunad_pareja_${getUserId()}`;

  // Estado reactivo de pareja
  let parejaActual = null; // { id, username, avatar_url, fecha, sincronizado }
  let canalParejaRealtime = null;

  function cargarParejaLocal() {
    try {
      const raw = localStorage.getItem(KEY_PAREJA());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function guardarParejaLocal(p) {
    parejaActual = p;
    try {
      if (p) localStorage.setItem(KEY_PAREJA(), JSON.stringify(p));
      else localStorage.removeItem(KEY_PAREJA());
    } catch {}
    actualizarUIPareja();
    window.dispatchEvent(new CustomEvent("sunad:pareja-cambiada", { detail: p }));
  }

  /* ------------------------------------------------------------
     1. SINCRONIZACIÓN AUTOMÁTICA EN LA NUBE (Fotos & Notas)
     ------------------------------------------------------------ */
  async function sincronizarNubePareja() {
    if (!sb() || !parejaActual?.id) return;
    try {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) return;
      const grupoActivo = window._getGrupoActivo?.();
      if (!grupoActivo) return;

      // Asegurar que las fotos y notas personales se sincronicen con el grupo de pareja
      const updates = [
        sb().from("fotos").update({ grupo_id: grupoActivo.id }).eq("user_id", session.user.id).is("grupo_id", null),
        sb().from("notas").update({ grupo_id: grupoActivo.id }).eq("user_id", session.user.id).is("grupo_id", null)
      ];
      await Promise.allSettled(updates);

      // Notificar recarga de fotos y notas si están visibles
      window.dispatchEvent(new Event("sunad:fotos-recargar"));
      window.dispatchEvent(new Event("sunad:notas-recargar"));
    } catch (e) {
      console.warn("sincronizarNubePareja:", e);
    }
  }

  /* ------------------------------------------------------------
     2. GESTIÓN DE INVITACIÓN Y VÍNCULO DE PAREJA
     ------------------------------------------------------------ */
  async function vincularPareja(perfilPareja, confirmada = true) {
    const parejaObj = {
      id: perfilPareja.id,
      username: perfilPareja.username,
      avatar_url: perfilPareja.avatar_url || null,
      fecha: new Date().toISOString(),
      activa: true
    };
    guardarParejaLocal(parejaObj);
    await sincronizarNubePareja();

    // Notificación en mascota
    try {
      window.decirMascota?.(`¡Qué lindo! Ahora compartimos todo con @${perfilPareja.username} 💕`, 4000);
    } catch {}

    alertar({
      title: "💕 ¡Vínculo de pareja creado!",
      message: `Has establecido tu vínculo con <strong>@${perfilPareja.username}</strong>.<br><br>✨ Sus fotos, notas, mascota y batallas RPG ahora están conectadas y sincronizadas.`,
      variant: "success",
      icon: "💖"
    });
  }

  async function desvincularPareja() {
    if (!parejaActual) return;
    const ok = await confirmar({
      title: "Desvincular pareja",
      message: `¿Estás seguro de pausar el vínculo con @${parejaActual.username}? Podrás volver a vincularte cuando quieras.`,
      variant: "danger",
      confirmText: "Desvincular",
      cancelText: "Cancelar"
    });
    if (!ok) return;
    guardarParejaLocal(null);
    alertar({
      title: "Vínculo pausado",
      message: "Has desvinculado la pareja. Tus fotos y notas permanecen a salvo.",
      variant: "warning"
    });
  }

  /* ------------------------------------------------------------
     3. CUIDADO COMPARTIDO DE LA MASCOTA
     ------------------------------------------------------------ */
  function conectarCuidadoCompartidoMascota() {
    window.addEventListener("sunad:mascota-accion", async (ev) => {
      if (!parejaActual?.id || !sb()) return;
      const accion = ev.detail; // { tipo: 'alimentar'|'mimar'|'dormir', mascota, stats }
      try {
        const { data: { session } } = await sb().auth.getSession();
        if (!session) return;
        const grupo = window._getGrupoActivo?.();
        if (!grupo) return;

        // Enviar mensaje invisible o de evento al chat de pareja para sincronizar
        await sb().from("mensajes").insert({
          room_id: grupo.id,
          grupo_id: grupo.id,
          user_id: session.user.id,
          destinatario_id: parejaActual.id,
          contenido: `🐾_MASCOTA_SYNC_:${JSON.stringify(accion)}`
        });
      } catch (err) {
        console.warn("sync mascota:", err);
      }
    });
  }

  /* ------------------------------------------------------------
     4. MODO RPG COOPERATIVO CON TU PAREJA
     ------------------------------------------------------------ */
  function inyectarBotonRpgCoop() {
    // Si estamos en combate RPG y hay pareja, habilitar ataque cooperativo
    const accionesEl = $("rpg-acciones");
    if (!accionesEl || $("btn-rpg-coop")) return;
    if (!parejaActual?.id) return;

    const btnCoop = document.createElement("button");
    btnCoop.type = "button";
    btnCoop.id = "btn-rpg-coop";
    btnCoop.className = "rpg-btn btn-pareja";
    btnCoop.style.marginTop = "0.4rem";
    btnCoop.innerHTML = `💕 Ataque en Pareja`;
    btnCoop.title = `Invoca a @${parejaActual.username} para un ataque doble con crítico garantizado y curación`;
    btnCoop.addEventListener("click", ejecutarAtaqueCoopRpg);

    accionesEl.appendChild(btnCoop);
  }

  function ejecutarAtaqueCoopRpg() {
    if (!parejaActual) {
      alertar({ title: "Sin pareja vinculada", message: "Vincula a tu pareja desde el menú superior para usar el ataque cooperativo." });
      return;
    }
    const rpg = window.Rpg;
    if (!rpg) return;
    const enemigo = rpg.enemigo?.();
    const state = rpg.state?.();
    if (!enemigo || !state) return;

    // Daño cooperativo masivo + curación
    const danio = Math.round((state.statsBase?.atk || 25) * 2.2 + 20);
    const cura = Math.round(15 + (state.nivel || 1) * 6);

    enemigo.hp = Math.max(0, enemigo.hp - danio);
    state.hp = Math.min(100 + (state.nivel || 1) * 20, state.hp + cura);

    const logEl = $("rpg-log");
    if (logEl) {
      const d = document.createElement("div");
      d.className = "rpg-log-item critico";
      d.style.color = "#ff6ba8";
      d.innerHTML = `💖 <strong>¡Ataque de Pareja con @${parejaActual.username}!</strong> Daño demoledor de <strong>${danio}</strong> y curación de <strong>+${cura} HP</strong>.`;
      logEl.appendChild(d);
      logEl.scrollTop = logEl.scrollHeight;
    }

    try {
      window.dispatchEvent(new CustomEvent("rpg:fx", {
        detail: { tipo: "attack", target: "enemy", valor: danio, fxKey: "slash" }
      }));
      window._snd?.("victoria");
    } catch {}

    const he = $("hp-enemigo");
    if (he) he.textContent = `${Math.max(0, enemigo.hp)} HP`;

    // Efecto visual de corazón flotante
    const spriteEnemigo = $("sprite-enemigo");
    if (spriteEnemigo) {
      const f = document.createElement("span");
      f.className = "rpg-float curar";
      f.style.color = "#ff6ba8";
      f.textContent = `-${danio} 💕`;
      spriteEnemigo.appendChild(f);
      setTimeout(() => f.remove(), 1200);
    }

    // Deshabilitar botón durante el turno
    const btn = $("btn-rpg-coop");
    if (btn) btn.disabled = true;
    setTimeout(() => { if (btn) btn.disabled = false; }, 4000);
  }

  const SVG_CORAZON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="#ff6ba8" style="vertical-align:middle;display:inline-block;" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const SVG_CORAZON_BLANCO = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:middle;display:inline-block;" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const SVG_SOBRE_CORAZON = `<svg viewBox="0 0 48 48" width="46" height="46" fill="none" style="display:inline-block;" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="6" fill="rgba(255,107,168,0.18)" stroke="#ff6ba8" stroke-width="2.5"/><path d="M4 14l20 14 20-14" stroke="#ff6ba8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 29l-1.2-1.1C18 24 15 21.5 15 18.5c0-2.4 1.9-4.3 4.3-4.3 1.4 0 2.7.6 3.5 1.7.8-1.1 2.1-1.7 3.5-1.7 2.4 0 4.3 1.9 4.3 4.3 0 3-3 5.5-7.8 9.4L24 29z" fill="#ff3366"/></svg>`;

  /* ------------------------------------------------------------
     5. RENDER Y UI DEL MODAL DE PAREJA
     ------------------------------------------------------------ */
  function actualizarUIPareja() {
    const card = $("pareja-estado-container");
    if (!card) return;

    if (!parejaActual) {
      card.innerHTML = `
        <div class="pareja-status-card" style="text-align:center;padding:1.4rem 1rem;">
          <div style="margin-bottom:.4rem;display:flex;align-items:center;justify-content:center;">${SVG_SOBRE_CORAZON}</div>
          <h4 style="margin:0 0 .4rem;font-size:1.1rem;color:#ff6ba8;">Invita a tu pareja</h4>
          <p style="font-size:.84rem;opacity:.8;margin:0 0 1rem;line-height:1.4;">
            Al invitar a tu persona especial se compartirán las fotos y notas en la nube, podrán cuidar a la mascota juntos y apoyarse en el modo RPG.
          </p>
          <button type="button" class="btn-pareja" id="btn-invitar-pareja-trigger">
            ${SVG_CORAZON_BLANCO} Invitar a mi pareja
          </button>
        </div>
      `;
      $("btn-invitar-pareja-trigger")?.addEventListener("click", () => {
        const inp = $("pareja-search-input");
        if (inp) inp.focus();
      });
    } else {
      card.innerHTML = `
        <div class="pareja-status-card">
          <div class="pareja-header">
            <div class="pareja-titulo">
              <span>${SVG_CORAZON}</span>
              <span>En pareja con @${parejaActual.username}</span>
            </div>
            <button type="button" class="btn-pareja-sec" id="btn-desvincular-pareja" style="padding:.3rem .6rem;font-size:.75rem;">
              Desvincular
            </button>
          </div>
          <div class="pareja-beneficios-grid">
            <div class="pareja-beneficio">☁️ Fotos y notas sincronizadas</div>
            <div class="pareja-beneficio">🐾 Mascota compartida</div>
            <div class="pareja-beneficio">⚔️ Ataque dúo en RPG</div>
            <div class="pareja-beneficio">💬 Chat íntimo directo</div>
          </div>
          <div class="pareja-coop-actions">
            <button type="button" class="btn-pareja" id="btn-abrir-chat-pareja">
              💬 Abrir chat privado
            </button>
            <button type="button" class="btn-pareja-sec" id="btn-cuidar-mascota-pareja">
              🐾 Cuidar mascota
            </button>
          </div>
        </div>
      `;
      $("btn-desvincular-pareja")?.addEventListener("click", desvincularPareja);
      $("btn-abrir-chat-pareja")?.addEventListener("click", () => {
        cerrarModalPareja();
        location.hash = "#chat";
        setTimeout(() => {
          const tabPareja = qs('[data-chat-tab="pareja"]') || qs('[data-chat-tab="privado"]');
          tabPareja?.click();
        }, 300);
      });
      $("btn-cuidar-mascota-pareja")?.addEventListener("click", () => {
        cerrarModalPareja();
        window._abrirMascotaModal?.();
      });
    }
  }

  function abrirModalPareja() {
    const m = $("pareja-modal");
    if (!m) return;
    m.classList.add("active");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    actualizarUIPareja();
    cargarListaAmigosParaPareja();
  }

  function cerrarModalPareja() {
    const m = $("pareja-modal");
    if (!m) return;
    m.classList.remove("active");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function cargarListaAmigosParaPareja() {
    const contenedor = $("pareja-candidatos-lista");
    if (!contenedor || !sb()) return;
    try {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) {
        contenedor.innerHTML = `<p style="font-size:.82rem;opacity:.7;">Inicia sesión para vincular a tu pareja.</p>`;
        return;
      }
      const grupo = window._getGrupoActivo?.();
      if (!grupo) return;

      const { data: miembros } = await sb().from("grupo_miembros").select("user_id").eq("grupo_id", grupo.id).neq("user_id", session.user.id);
      const ids = (miembros || []).map(m => m.user_id);
      if (!ids.length) {
        contenedor.innerHTML = `<p style="font-size:.82rem;opacity:.7;padding:.6rem 0;">Añade primero a tu pareja como amigo en tu grupo o búscala por su usuario abajo.</p>`;
        return;
      }
      const { data: perfiles } = await sb().from("perfiles").select("id,username,avatar_url").in("id", ids);

      contenedor.innerHTML = "";
      (perfiles || []).forEach(p => {
        const esMiPareja = parejaActual?.id === p.id;
        const row = document.createElement("div");
        row.className = "friend-row";
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.justifyContent = "space-between";
        row.style.padding = ".55rem .75rem";
        row.style.marginBottom = ".4rem";
        row.style.borderRadius = "12px";
        row.style.background = "rgba(255,255,255,.05)";

        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:.6rem;">
            <span>${SVG_CORAZON}</span>
            <strong>@${p.username}</strong>
          </div>
          <button type="button" class="${esMiPareja ? 'btn-pareja-sec' : 'btn-pareja'}" style="padding:.35rem .75rem;font-size:.78rem;">
            ${esMiMiembroPareja(p.id) ? 'Pareja actual' : 'Vincular'}
          </button>
        `;
        const btn = row.querySelector("button");
        if (!esMiPareja) {
          btn.addEventListener("click", () => vincularPareja(p));
        }
        contenedor.appendChild(row);
      });
    } catch (e) {
      console.warn("cargarListaAmigosParaPareja:", e);
    }
  }

  const esMiMiembroPareja = id => parejaActual?.id === id;

  /* ------------------------------------------------------------
     6. CHAT MEJORADO: STICKERS, REACCIONES RÁPIDAS Y TAB PAREJA
     ------------------------------------------------------------ */
  function mejorarChatUI() {
    const chatSection = $("chat");
    if (!chatSection) return;

    // Asegurar tab de Pareja en las tabs
    const tabsCont = qs(".chat-tabs", chatSection);
    if (tabsCont && !qs('[data-chat-tab="pareja"]', tabsCont)) {
      const btnParejaTab = document.createElement("button");
      btnParejaTab.type = "button";
      btnParejaTab.className = "chat-tab chat-tab-pareja";
      btnParejaTab.dataset.chatTab = "pareja";
      btnParejaTab.innerHTML = `${SVG_CORAZON} Pareja`;
      tabsCont.appendChild(btnParejaTab);

      btnParejaTab.addEventListener("click", () => {
        qsa(".chat-tab", tabsCont).forEach(t => t.classList.toggle("active", t === btnParejaTab));
        const sel = $("chat-privado-selector");
        if (sel) sel.hidden = true;

        if (!parejaActual) {
          const msgs = $("chat-messages");
          if (msgs) {
            msgs.innerHTML = `
              <div class="chat-vacio">
                <div style="margin-bottom:.5rem;display:flex;justify-content:center;">${SVG_SOBRE_CORAZON}</div>
                <h3 style="color:#ff6ba8;margin:0 0 .4rem;">Aún no tienes pareja vinculada</h3>
                <p style="opacity:.8;font-size:.88rem;margin:0 0 1rem;">Vincula a tu persona especial para chatear íntimamente y compartir recuerdos.</p>
                <button type="button" class="btn-pareja" id="btn-vincular-desde-chat">${SVG_CORAZON_BLANCO} Vincular pareja ahora</button>
              </div>
            `;
            $("btn-vincular-desde-chat")?.addEventListener("click", abrirModalPareja);
          }
        } else {
          // Asignar el destinatario privado a la pareja automáticamente
          const selDest = $("chat-privado-destinatario");
          if (selDest) selDest.value = parejaActual.id;
          window._setChatDestinatario?.(parejaActual.id);
          window._recargarChat?.();
        }
      });
    }

    // Eliminar barra de reacciones si existiera previamente
    const prevQR = $("chat-quick-reactions");
    if (prevQR) prevQR.remove();
  }

  /* ------------------------------------------------------------
     7. INICIALIZACIÓN
     ------------------------------------------------------------ */
  function init() {
    parejaActual = cargarParejaLocal();
    conectarCuidadoCompartidoMascota();

    // Vincular botón en el dropdown
    const btnParejaDropdown = qs('[data-action="pareja"]');
    if (btnParejaDropdown) {
      btnParejaDropdown.addEventListener("click", abrirModalPareja);
    }

    // Modal cierre
    qsa("[data-close-pareja]").forEach(el => el.addEventListener("click", cerrarModalPareja));

    // Búsqueda en modal de pareja
    const searchForm = $("pareja-search-form");
    const searchInput = $("pareja-search-input");
    const resultsContainer = $("pareja-search-results");

    searchForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const term = searchInput?.value.trim().toLowerCase();
      if (!term || !sb()) return;
      try {
        const { data: { session } } = await sb().auth.getSession();
        const { data: perfiles } = await sb().from("perfiles").select("id,username,avatar_url").ilike("username", `%${term}%`).limit(8);
        if (!resultsContainer) return;
        resultsContainer.innerHTML = "";
        const filtrados = (perfiles || []).filter(p => p.id !== session?.user?.id);
        if (!filtrados.length) {
          resultsContainer.innerHTML = `<p style="font-size:.82rem;opacity:.7;padding:.5rem;">No se encontraron usuarios.</p>`;
          return;
        }
        filtrados.forEach(p => {
          const row = document.createElement("div");
          row.className = "friend-row";
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.justifyContent = "space-between";
          row.style.padding = ".55rem .75rem";
          row.style.marginBottom = ".4rem";
          row.style.borderRadius = "12px";
          row.style.background = "rgba(255,255,255,.05)";
          row.innerHTML = `
            <div style="display:flex;align-items:center;gap:.6rem;">
              <span>${SVG_CORAZON}</span>
              <strong>@${p.username}</strong>
            </div>
            <button type="button" class="btn-pareja" style="padding:.35rem .75rem;font-size:.78rem;">Vincular como Pareja</button>
          `;
          row.querySelector("button").addEventListener("click", () => vincularPareja(p));
          resultsContainer.appendChild(row);
        });
      } catch (err) {
        console.warn("buscar pareja error:", err);
      }
    });

    // Mejoras de chat y botón RPG cada vez que se navega o carga
    mejorarChatUI();
    setInterval(inyectarBotonRpgCoop, 1500);

    // Sincronización automática de fotos/notas de pareja al arrancar o cambiar usuario/grupo
    parejaActual = cargarParejaLocal();
    actualizarUIPareja();
    sincronizarNubePareja();

    window.addEventListener("sunad:user-ready", () => {
      parejaActual = cargarParejaLocal();
      actualizarUIPareja();
      sincronizarNubePareja();
    });
    window.addEventListener("sunad:group-ready", () => {
      parejaActual = cargarParejaLocal();
      actualizarUIPareja();
      sincronizarNubePareja();
    });
  }

  // API Global
  window.ParejaSistema = {
    getPareja: () => parejaActual,
    vincular: vincularPareja,
    desvincular: desvincularPareja,
    abrirModal: abrirModalPareja,
    cerrarModal: cerrarModalPareja,
    sincronizar: sincronizarNubePareja
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
  setTimeout(init, 600);
})();
