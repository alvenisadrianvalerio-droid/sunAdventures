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
  const esc = str => String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const KEY_PAREJA = () => `sunad_pareja_${getUserId()}`;

  // Estado reactivo de pareja
  let parejaActual = null; // { id, username, avatar_url, fecha, fecha_inicio_relacion, sincronizado }
  let canalParejaRealtime = null;

  function parseFechaLocal(str) {
    if (!str) return null;
    const partes = String(str).slice(0, 10).split("-");
    if (partes.length === 3) {
      const y = parseInt(partes[0], 10);
      const m = parseInt(partes[1], 10) - 1;
      const d = parseInt(partes[2], 10);
      const dt = new Date(y, m, d, 0, 0, 0, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  function calcularTiempoPareja(fechaStr) {
    if (!fechaStr) return null;
    try {
      const inicio = parseFechaLocal(fechaStr);
      if (!inicio) return null;
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      // Diferencia en días totales
      const diffMs = hoy.getTime() - inicio.getTime();
      const diasJuntos = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      
      // Próximo aniversario anual (mismo mes y día)
      const añoActual = hoy.getFullYear();
      let prox = new Date(añoActual, inicio.getMonth(), inicio.getDate(), 0, 0, 0, 0);
      if (prox < hoy) {
        prox = new Date(añoActual + 1, inicio.getMonth(), inicio.getDate(), 0, 0, 0, 0);
      }
      const diasParaAniversario = Math.max(0, Math.ceil((prox.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Aniversario de meses (próximo día del mes)
      let proxMes = new Date(añoActual, hoy.getMonth(), inicio.getDate(), 0, 0, 0, 0);
      if (proxMes < hoy) {
        proxMes = new Date(añoActual, hoy.getMonth() + 1, inicio.getDate(), 0, 0, 0, 0);
      }
      const diasParaCumpleMes = Math.max(0, Math.ceil((proxMes.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        diasJuntos,
        diasParaAniversario,
        diasParaCumpleMes,
        fechaInicioFormateada: inicio.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
        fechaValida: true
      };
    } catch {
      return null;
    }
  }

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
     3. CUIDADO COMPARTIDO DE LA MASCOTA, AMOR EN VIVO Y CÁPSULAS
     ------------------------------------------------------------ */
  function lluviaCorazonesPareja(cantidad = 18) {
    try {
      const cont = document.createElement("div");
      cont.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;";
      document.body.appendChild(cont);

      const colores = ["#ff3366", "#ff6ba8", "#fb7185", "#f43f5e", "#ffd93d"];
      for (let i = 0; i < cantidad; i++) {
        const h = document.createElement("div");
        const size = 18 + Math.round(Math.random() * 20);
        const left = 8 + Math.random() * 84;
        const dur = 1.6 + Math.random() * 1.4;
        const delay = Math.random() * 0.55;
        const col = colores[i % colores.length];
        h.style.cssText = `position:absolute;bottom:-40px;left:${left}%;width:${size}px;height:${size}px;opacity:0;transform:translateY(0) scale(0.6);transition:transform ${dur}s cubic-bezier(.2,.8,.3,1) ${delay}s, opacity ${dur}s ease ${delay}s;filter:drop-shadow(0 3px 8px rgba(255,51,102,0.45));`;
        h.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${col}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        cont.appendChild(h);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const drift = (Math.random() - 0.5) * 110;
            h.style.opacity = "0.95";
            h.style.transform = `translate(${drift}px, -${window.innerHeight + 120}px) scale(1.15) rotate(${Math.round((Math.random() - 0.5) * 45)}deg)`;
          });
        });
      }
      setTimeout(() => cont.remove(), 3600);
    } catch {}
  }

  function suscribirCanalParejaRealtime() {
    if (!sb()) return;
    const grupo = window._getGrupoActivo?.();
    if (!grupo?.id) return;

    if (canalParejaRealtime) {
      try { sb().removeChannel(canalParejaRealtime); } catch {}
      canalParejaRealtime = null;
    }

    try {
      canalParejaRealtime = sb()
        .channel(`pareja_sync_${grupo.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mensajes", filter: `grupo_id=eq.${grupo.id}` },
          (payload) => {
            const msg = payload?.new;
            if (!msg || !msg.contenido) return;
            const myId = getUserId();
            if (msg.user_id === myId) return;

            if (msg.contenido.startsWith("💖_AMOR_SYNC_:")) {
              try {
                const data = JSON.parse(msg.contenido.slice("💖_AMOR_SYNC_:".length));
                const u = getUserId();
                const k = `sa_amor_pareja_${u}`;
                const actual = Math.max(0, Number(localStorage.getItem(k)) || 0);
                const nuevo = Math.max(actual + (Number(data.delta) || 15), Number(data.total) || 0);
                localStorage.setItem(k, String(nuevo));
                lluviaCorazonesPareja(22);
                try { window._snd?.("victoria") || window._snd?.("pop"); } catch {}
                try {
                  window.decirMascota?.(`💕 ¡@${data.from || parejaActual?.username || "Tu pareja"} te envió una lluvia de amor! (+${data.delta || 15} Amor XP)`, 4500);
                  window._TiendaAPI?.notifMascota?.("💖 ¡Amor recibido!", `@${data.from || parejaActual?.username || "Tu pareja"} te envió cariño (+${data.delta || 15} Amor XP)`);
                } catch {}
                window.dispatchEvent(new Event("sunad:progress"));
              } catch (e) { console.warn("AMOR_SYNC parse:", e); }
            } else if (msg.contenido.startsWith("⏳_CAPSULA_SYNC_:")) {
              try {
                const remotas = JSON.parse(msg.contenido.slice("⏳_CAPSULA_SYNC_:".length));
                if (remotas && typeof remotas === "object") {
                  window.SunCapsulaTiempo?.sincronizarRemotas?.(remotas);
                }
              } catch (e) { console.warn("CAPSULA_SYNC parse:", e); }
            } else if (msg.contenido.startsWith("🐾_MASCOTA_SYNC_:")) {
              try {
                const acc = JSON.parse(msg.contenido.slice("🐾_MASCOTA_SYNC_:".length));
                window.decirMascota?.(`🐾 ¡@${parejaActual?.username || "Tu pareja"} acaba de ${acc.tipo || "cuidar"} a la mascota!`, 4000);
              } catch {}
            } else if (msg.contenido.startsWith("📅_EVENTO_SYNC_:")) {
              try {
                const data = JSON.parse(msg.contenido.slice("📅_EVENTO_SYNC_:".length));
                window.AlbumApp?.modules?.eventos?.recibirEventoRemoto?.(data);
                const verb = data.action === "reaccion" ? "le dio ❤️ al plan" : "agendó un nuevo plan";
                window.decirMascota?.(`📅 ¡@${parejaActual?.username || "Tu pareja"} ${verb}: "${data.evento?.titulo || ""}"!`, 4200);
              } catch {}
            } else if (msg.contenido.startsWith("📖_LEXICO_SYNC_:")) {
              try {
                const data = JSON.parse(msg.contenido.slice("📖_LEXICO_SYNC_:".length));
                if (Array.isArray(data.lista)) {
                  window.SunDiccionario?.sincronizarLexicoRemoto?.(data.lista);
                  window.decirMascota?.(`📖 ¡@${parejaActual?.username || "Tu pareja"} actualizó Nuestro Léxico!`, 3800);
                }
              } catch {}
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("suscribirCanalParejaRealtime:", e);
    }
  }

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

    window.addEventListener("sunad:amor-enviado", async (ev) => {
      lluviaCorazonesPareja(16);
      if (!sb()) return;
      try {
        const { data: { session } } = await sb().auth.getSession();
        if (!session) return;
        const grupo = window._getGrupoActivo?.();
        if (!grupo) return;
        const payload = {
          from: session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Tu pareja",
          delta: ev.detail?.delta || 15,
          total: ev.detail?.total || 0,
          ts: Date.now()
        };
        await sb().from("mensajes").insert({
          room_id: grupo.id,
          grupo_id: grupo.id,
          user_id: session.user.id,
          destinatario_id: parejaActual?.id || null,
          contenido: `💖_AMOR_SYNC_:${JSON.stringify(payload)}`
        });
      } catch (err) {
        console.warn("sync amor:", err);
      }
    });

    window.addEventListener("sunad:evento-sync", async (ev) => {
      if (!sb()) return;
      try {
        const { data: { session } } = await sb().auth.getSession();
        if (!session) return;
        const grupo = window._getGrupoActivo?.();
        if (!grupo) return;
        await sb().from("mensajes").insert({
          room_id: grupo.id,
          grupo_id: grupo.id,
          user_id: session.user.id,
          destinatario_id: parejaActual?.id || null,
          contenido: `📅_EVENTO_SYNC_:${JSON.stringify(ev.detail || {})}`
        });
      } catch {}
    });

    window.addEventListener("sunad:lexico-sync", async (ev) => {
      if (!sb()) return;
      try {
        const { data: { session } } = await sb().auth.getSession();
        if (!session) return;
        const grupo = window._getGrupoActivo?.();
        if (!grupo) return;
        await sb().from("mensajes").insert({
          room_id: grupo.id,
          grupo_id: grupo.id,
          user_id: session.user.id,
          destinatario_id: parejaActual?.id || null,
          contenido: `📖_LEXICO_SYNC_:${JSON.stringify(ev.detail || {})}`
        });
      } catch {}
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
      const infoTiempo = calcularTiempoPareja(parejaActual.fecha_inicio_relacion);
      const fechaValInput = parejaActual.fecha_inicio_relacion ? parejaActual.fecha_inicio_relacion.slice(0, 10) : "";

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

          <!-- CONTADOR DE DÍAS Y ANIVERSARIO -->
          <div class="pareja-aniversario-banner" style="background:rgba(255,107,168,0.12);border:1px solid rgba(255,107,168,0.35);border-radius:14px;padding:0.9rem;text-align:center;">
            ${infoTiempo ? `
              <div style="font-size:0.85rem;color:#ff6ba8;text-transform:uppercase;letter-spacing:0.04em;font-weight:700;margin-bottom:0.25rem;">
                💕 Nuestra Historia de Amor
              </div>
              <div style="font-size:1.7rem;font-weight:900;color:#fff;line-height:1.2;margin-bottom:0.3rem;">
                <span style="color:#ff6ba8;">${infoTiempo.diasJuntos}</span> Días Juntos
              </div>
              <div style="font-size:0.82rem;opacity:0.88;color:#ffd93d;margin-bottom:0.6rem;">
                ✨ Próximo aniversario en <strong>${infoTiempo.diasParaAniversario} días</strong> (Iniciaron el ${infoTiempo.fechaInicioFormateada})
              </div>
            ` : `
              <div style="font-size:0.88rem;color:#ff6ba8;font-weight:700;margin-bottom:0.25rem;">
                📅 ¿Cuándo inició su relación?
              </div>
              <p style="font-size:0.78rem;opacity:0.8;margin:0 0 0.5rem;">Configura la fecha de su aniversario para activar el contador de días juntos.</p>
            `}
            <div style="display:flex;align-items:center;justify-content:center;gap:0.4rem;flex-wrap:wrap;">
              <input type="date" id="pareja-input-aniversario" value="${fechaValInput}" style="padding:0.35rem 0.6rem;font-size:0.8rem;border-radius:8px;border:1px solid rgba(255,107,168,0.4);background:rgba(0,0,0,0.3);color:#fff;">
              <button type="button" class="btn-pareja" id="btn-guardar-aniversario-pareja" style="padding:0.35rem 0.75rem;font-size:0.78rem;">
                💾 Guardar fecha
              </button>
            </div>
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
            <button type="button" class="btn-pareja-sec" id="btn-cartas-amor-pareja">
              💌 Cartas Secretas
            </button>
            <button type="button" class="btn-pareja-sec" id="btn-cuidar-mascota-pareja">
              🐾 Cuidar mascota
            </button>
          </div>
        </div>
      `;
      $("btn-desvincular-pareja")?.addEventListener("click", desvincularPareja);
      $("btn-cartas-amor-pareja")?.addEventListener("click", () => {
        abrirModalCartasSecretas();
      });
      $("btn-guardar-aniversario-pareja")?.addEventListener("click", () => {
        const val = $("pareja-input-aniversario")?.value;
        if (!val) {
          alertar({ title: "Fecha requerida", message: "Selecciona una fecha válida." });
          return;
        }
        parejaActual.fecha_inicio_relacion = val;
        guardarParejaLocal(parejaActual);
        actualizarWidgetLobbyPareja();
        alertar({
          title: "💕 Fecha guardada",
          message: "¡Contador de días juntos actualizado con éxito!",
          variant: "success",
          icon: "📅"
        });
      });
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

  /* ------------------------------------------------------------
     5.1 CARTAS DE AMOR SECRETAS CON FECHA DE APERTURA
     ------------------------------------------------------------ */
  const KEY_CARTAS = () => `sunad_cartas_pareja_${getUserId()}`;

  function cargarCartasLocales() {
    try {
      return JSON.parse(localStorage.getItem(KEY_CARTAS()) || "[]");
    } catch {
      return [];
    }
  }

  function guardarCartasLocales(cartas) {
    try {
      localStorage.setItem(KEY_CARTAS(), JSON.stringify(cartas));
    } catch {}
  }

  function abrirModalCartasSecretas() {
    let modal = $("modal-cartas-secretas");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-cartas-secretas";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-backdrop" id="backdrop-cartas-secretas"></div>
        <div class="modal-content" style="max-width:540px;border:2px solid rgba(255,107,168,0.4);background:linear-gradient(180deg,#17121b,#0e0a12);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">
            <h3 style="margin:0;color:#ff6ba8;display:inline-flex;align-items:center;gap:0.5rem;font-size:1.15rem;">
              <span>💌</span> <span>Cartas Secretas de Amor</span>
            </h3>
            <button type="button" class="btn-secondary" id="btn-cerrar-cartas-secretas" style="padding:0.3rem 0.6rem;border-radius:50%;line-height:1;">✕</button>
          </div>
          <p style="font-size:0.82rem;opacity:0.8;margin:0 0 1rem;line-height:1.4;">
            Escribe una carta a tu pareja que permanecerá sellada y secreta hasta la fecha que elijas (aniversario, cumpleaños o día especial).
          </p>

          <!-- FORMULARIO CREAR CARTA -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,107,168,0.25);border-radius:14px;padding:0.9rem;margin-bottom:1.2rem;">
            <strong style="color:#ffd93d;font-size:0.85rem;display:block;margin-bottom:0.5rem;">✍️ Escribir nueva carta</strong>
            <input type="text" id="carta-titulo-input" placeholder="Título de la carta (ej. Para nuestro 1er aniversario 💕)" style="width:100%;padding:0.5rem 0.75rem;margin-bottom:0.5rem;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.3);color:#fff;font-size:0.85rem;outline:none;">
            <textarea id="carta-contenido-input" rows="3" placeholder="Escribe aquí tu mensaje de amor..." style="width:100%;padding:0.5rem 0.75rem;margin-bottom:0.6rem;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.3);color:#fff;font-size:0.85rem;outline:none;resize:vertical;"></textarea>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:0.75rem;opacity:0.85;">🔒 Fecha de apertura:</span>
                <input type="date" id="carta-fecha-input" style="padding:0.35rem 0.5rem;border-radius:8px;border:1px solid rgba(255,107,168,0.4);background:rgba(0,0,0,0.3);color:#fff;font-size:0.8rem;">
              </div>
              <button type="button" class="btn-pareja" id="btn-sellar-carta" style="padding:0.45rem 1rem;font-size:0.82rem;">
                💌 Sellar y Guardar
              </button>
            </div>
          </div>

          <!-- LISTA DE CARTAS -->
          <strong style="color:#ff6ba8;font-size:0.85rem;display:block;margin-bottom:0.5rem;">📬 Buzón de Cartas</strong>
          <div id="cartas-secretas-lista" style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;"></div>
        </div>
      `;
      document.body.appendChild(modal);

      $("backdrop-cartas-secretas")?.addEventListener("click", () => modal.classList.remove("active"));
      $("btn-cerrar-cartas-secretas")?.addEventListener("click", () => modal.classList.remove("active"));
      $("btn-sellar-carta")?.addEventListener("click", () => {
        const titulo = $("carta-titulo-input")?.value.trim();
        const texto = $("carta-contenido-input")?.value.trim();
        const fecha = $("carta-fecha-input")?.value;
        if (!titulo || !texto || !fecha) {
          alertar({ title: "Completa los campos", message: "Escribe un título, mensaje y elige la fecha de apertura." });
          return;
        }
        const cartas = cargarCartasLocales();
        const nueva = {
          id: "carta_" + Date.now(),
          titulo,
          texto,
          fecha_apertura: fecha,
          creada: new Date().toISOString(),
          abierta: false
        };
        cartas.unshift(nueva);
        guardarCartasLocales(cartas);
        $("carta-titulo-input").value = "";
        $("carta-contenido-input").value = "";
        $("carta-fecha-input").value = "";
        lluviaCorazonesPareja(15);
        try { window._snd?.("pop"); } catch {}
        renderListaCartas();
        alertar({
          title: "💌 Carta sellada con amor",
          message: `Tu carta secreta ha sido guardada. Podrá ser abierta a partir del <strong>${new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</strong>.`,
          variant: "success",
          icon: "🔒"
        });
      });
    }

    renderListaCartas();
    modal.classList.add("active");
  }

  function renderListaCartas() {
    const cont = $("cartas-secretas-lista");
    if (!cont) return;
    const cartas = cargarCartasLocales();
    if (!cartas.length) {
      cont.innerHTML = `<p style="font-size:0.8rem;opacity:0.7;text-align:center;padding:1rem;">Aún no tienes cartas selladas. ¡Escribe la primera arriba!</p>`;
      return;
    }

    const hoyStr = new Date().toISOString().slice(0, 10);
    cont.innerHTML = cartas.map((c, idx) => {
      const yaPuedeAbrir = hoyStr >= c.fecha_apertura;
      const estadoColor = yaPuedeAbrir ? "#51cf66" : "#ffd93d";
      const fechaObj = parseFechaLocal(c.fecha_apertura);
      const fechaFmt = fechaObj ? fechaObj.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : c.fecha_apertura;
      
      return `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0.75rem 0.9rem;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <strong style="font-size:0.86rem;color:#fff;display:block;margin-bottom:2px;">${esc(c.titulo)}</strong>
            <span style="font-size:0.75rem;color:${estadoColor};">
              ${yaPuedeAbrir ? "✨ ¡Lista para leer!" : `🔒 Se abre el ${esc(fechaFmt)}`}
            </span>
          </div>
          <button type="button" class="${yaPuedeAbrir ? 'btn-pareja' : 'btn-pareja-sec'}" data-abrir-carta="${esc(c.id)}" style="padding:0.35rem 0.75rem;font-size:0.78rem;">
            ${yaPuedeAbrir ? "📖 Leer" : "⏳ Ver sello"}
          </button>
        </div>
      `;
    }).join("");

    cont.querySelectorAll("[data-abrir-carta]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.abrirCarta;
        const c = cartas.find(x => x.id === id);
        if (!c) return;
        const yaPuede = hoyStr >= c.fecha_apertura;
        if (!yaPuede) {
          const fObj = parseFechaLocal(c.fecha_apertura);
          const fFmt = fObj ? fObj.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : c.fecha_apertura;
          alertar({
            title: "🔒 Carta aún sellada",
            message: `Esta carta tiene un sello mágico de amor y no podrá abrirse hasta el <strong>${esc(fFmt)}</strong>. ¡La espera valdrá la pena! 💕`,
            icon: "⏳"
          });
        } else {
          lluviaCorazonesPareja(20);
          try { window._snd?.("fanfarria") || window._snd?.("victoria"); } catch {}
          const safeTitulo = esc(c.titulo);
          const safeTexto = esc(c.texto).replace(/\n/g, '<br>');
          alertar({
            title: `💌 ${safeTitulo}`,
            message: `<div style="font-size:0.95rem;line-height:1.5;padding:0.6rem 0;color:#fdfdfd;font-style:italic;">"${safeTexto}"</div><div style="font-size:0.78rem;opacity:0.75;text-align:right;margin-top:0.4rem;">💕 Sellada con amor</div>`,
            variant: "success",
            icon: "💖"
          });
        }
      });
    });
  }

  function actualizarWidgetLobbyPareja() {
    const parejaCard = $("experiencia-card-pareja");
    if (!parejaCard) return;

    let subPill = parejaCard.querySelector(".pareja-dias-subpill");
    if (!subPill) {
      subPill = document.createElement("div");
      subPill.className = "pareja-dias-subpill";
      subPill.style.cssText = "font-size:0.75rem;color:#ff6ba8;font-weight:700;margin-top:4px;display:flex;align-items:center;gap:4px;flex-wrap:wrap;";
      const footer = parejaCard.querySelector(".bento-card-footer");
      if (footer) footer.parentNode.insertBefore(subPill, footer);
      else parejaCard.appendChild(subPill);
    }

    if (parejaActual && parejaActual.username) {
      const info = calcularTiempoPareja(parejaActual.fecha_inicio_relacion);
      if (info) {
        subPill.innerHTML = `<span>💕 Con @${parejaActual.username}</span> · <strong style="color:#ffd93d;">${info.diasJuntos} días juntos</strong> <span style="opacity:0.8;">(Aniversario en ${info.diasParaAniversario}d)</span>`;
      } else {
        subPill.innerHTML = `<span>💕 En pareja con @${parejaActual.username}</span> · <span style="opacity:0.8;text-decoration:underline;cursor:pointer;" id="link-tocar-aniv">Fijar aniversario</span>`;
        parejaCard.querySelector("#link-tocar-aniv")?.addEventListener("click", (e) => {
          e.stopPropagation();
          abrirModalPareja();
        });
      }
    } else {
      subPill.innerHTML = `<span style="opacity:0.75;font-weight:normal;">Toca para vincular a tu pareja</span>`;
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

    // Inyectar Selector de Stickers de Mascotas y Amor
    inyectarSelectorStickersChat(chatSection);
  }

  function inyectarSelectorStickersChat(chatSection) {
    const chatForm = $("chat-form", chatSection);
    if (!chatForm || $("btn-chat-stickers-toggle")) return;

    const STICKERS_COZY = [
      { emoji: "🐱", texto: "¡Miau! Te quiero un montón 💕" },
      { emoji: "🦝", texto: "¡Robando tu corazón! 🦝💖" },
      { emoji: "🐥", texto: "¡Pío pío! Pasaba a abrazarte 🐥✨" },
      { emoji: "🐰", texto: "¡Saltando de amor por ti! 🐰🌸" },
      { emoji: "🐼", texto: "Abrazo de panda gigante 🐼🤍" },
      { emoji: "💖", texto: "¡Lluvia de amor para ti! 💖✨" },
      { emoji: "☕", texto: "¿Un cafecito juntos hoy? ☕🍰" },
      { emoji: "🍿", texto: "¿Vemos una peli hoy? 🎬🍿" },
      { emoji: "🍕", texto: "¿Pedimos algo rico de comer? 🍕😋" },
      { emoji: "🌙", texto: "Buenas noches, sueña bonito 🌙⭐" },
      { emoji: "✨", texto: "¡Eres mi persona favorita! 🌻💛" },
      { emoji: "🥰", texto: "Me haces sonreír todo el día 🥰" }
    ];

    const btnStickers = document.createElement("button");
    btnStickers.type = "button";
    btnStickers.id = "btn-chat-stickers-toggle";
    btnStickers.className = "chat-btn-attach";
    btnStickers.style.cssText = "display:inline-flex;align-items:center;justify-content:center;background:rgba(255,107,168,0.12);border:1px solid rgba(255,107,168,0.3);color:#ff6ba8;border-radius:50%;width:38px;height:38px;cursor:pointer;flex-shrink:0;transition:transform 0.15s, background 0.15s;";
    btnStickers.title = "Stickers de mascotas y amor";
    btnStickers.innerHTML = `🐾`;

    // Panel de Stickers Flotante
    const panelStickers = document.createElement("div");
    panelStickers.id = "chat-stickers-popover";
    panelStickers.style.cssText = "display:none;position:absolute;bottom:70px;left:14px;right:14px;max-width:360px;background:rgba(20,24,35,0.96);border:1px solid rgba(255,107,168,0.4);border-radius:18px;padding:12px;box-shadow:0 12px 36px rgba(0,0,0,0.55);backdrop-filter:blur(14px);z-index:900;animation:popIn 0.18s ease;";
    panelStickers.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:0.8rem;font-weight:800;color:#ff6ba8;">🐾 Stickers de Mascotas & Pareja</span>
        <button type="button" id="btn-cerrar-stickers-chat" style="background:transparent;border:none;color:#aaa;cursor:pointer;font-size:0.9rem;padding:2px 6px;">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-height:210px;overflow-y:auto;">
        ${STICKERS_COZY.map((stk, idx) => `
          <button type="button" class="sticker-chip-btn" data-stk-idx="${idx}" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:transform 0.15s, background 0.15s;">
            <span style="font-size:1.6rem;line-height:1;">${stk.emoji}</span>
            <span style="font-size:0.65rem;color:#ccc;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;">${stk.texto.slice(0, 14)}</span>
          </button>
        `).join("")}
      </div>
    `;

    chatForm.style.position = "relative";
    chatForm.insertBefore(btnStickers, chatForm.firstChild);
    chatForm.appendChild(panelStickers);

    btnStickers.addEventListener("click", (e) => {
      e.stopPropagation();
      const visible = panelStickers.style.display === "block";
      panelStickers.style.display = visible ? "none" : "block";
    });

    panelStickers.querySelector("#btn-cerrar-stickers-chat")?.addEventListener("click", () => {
      panelStickers.style.display = "none";
    });

    panelStickers.querySelectorAll(".sticker-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.stkIdx);
        const item = STICKERS_COZY[idx];
        if (item) {
          const inp = $("chat-input");
          if (inp) {
            inp.value = item.texto;
            panelStickers.style.display = "none";
            chatForm.requestSubmit();
            try { window.ParejaSistema?.lluviaCorazones?.(10); } catch {}
          }
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!panelStickers.contains(e.target) && e.target !== btnStickers) {
        panelStickers.style.display = "none";
      }
    });
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
    let rpgTimer = null;
    const chequearRpg = () => {
      const vista = document.querySelector("[data-view].active")?.dataset.view;
      if (vista === "rpg" && !document.hidden && document.getElementById("rpg-acciones")) {
        inyectarBotonRpgCoop();
      }
    };
    rpgTimer = setInterval(chequearRpg, 3000);
    window.addEventListener("hashchange", () => setTimeout(chequearRpg, 200));

    // Sincronización automática de fotos/notas de pareja al arrancar o cambiar usuario/grupo
    parejaActual = cargarParejaLocal();
    actualizarUIPareja();
    actualizarWidgetLobbyPareja();
    sincronizarNubePareja();
    suscribirCanalParejaRealtime();

    window.addEventListener("sunad:user-ready", () => {
      parejaActual = cargarParejaLocal();
      actualizarUIPareja();
      actualizarWidgetLobbyPareja();
      sincronizarNubePareja();
      suscribirCanalParejaRealtime();
    });
    window.addEventListener("sunad:group-ready", () => {
      parejaActual = cargarParejaLocal();
      actualizarUIPareja();
      actualizarWidgetLobbyPareja();
      sincronizarNubePareja();
      suscribirCanalParejaRealtime();
    });
    window.addEventListener("sunad:progress", () => {
      actualizarWidgetLobbyPareja();
    });
  }

  // Guarda para evitar doble ejecución de init()
  let inicializado = false;
  function safeInit() {
    if (inicializado) return;
    inicializado = true;
    init();
  }

  // API Global
  window.ParejaSistema = {
    getPareja: () => parejaActual,
    vincular: vincularPareja,
    desvincular: desvincularPareja,
    abrirModal: abrirModalPareja,
    cerrarModal: cerrarModalPareja,
    sincronizar: sincronizarNubePareja,
    lluviaCorazones: lluviaCorazonesPareja
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
  setTimeout(safeInit, 400);
})();
