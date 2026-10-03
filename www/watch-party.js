/* ============================================================
   WATCH-PARTY.JS — Sincronización de YouTube / Spotify en grupo
   Sin API keys · Usa Supabase Realtime + iframes oficiales
   ============================================================ */
(function () {
  "use strict";
  const sb = () => window._supabase;
  const $  = id => document.getElementById(id);

  const state = {
    grupoId: null,
    userId: null,
    userName: "",
    host: false,
    canal: null,
    activo: false,
    ready: false
  };

  /* ---------- 1. Inicializar ---------- */
  async function init() {
    const s = sb(); if (!s) { setTimeout(init, 400); return; }
    const { data:{ session } } = await s.auth.getSession();
    if (!session) { setTimeout(init, 800); return; }
    state.userId = session.user.id;
    state.userName = localStorage.getItem("sunadventures_username") || "Alguien";
    state.grupoId = window._getGrupoActivo?.()?.id || localStorage.getItem("grupo_activo");
    if (!state.grupoId) { setTimeout(init, 800); return; }
    await leerEstadoInicial();
    await suscribir();
    state.ready = true;
    console.log("✅ Watch-party listo");
  }

  /* ---------- 2. Leer estado actual ---------- */
  async function leerEstadoInicial() {
    const { data } = await sb().from("playback_sync").select("*").eq("grupo_id", state.grupoId).maybeSingle();
    if (!data) return;
    state.host = data.host_id === state.userId;
    renderEstado(data);
    if (data.activo && data.host_id !== state.userId) aplicarEstadoRemoto(data);
  }

  /* ---------- 3. Suscripción Realtime ---------- */
  async function suscribir() {
    if (state.canal) sb().removeChannel(state.canal);
    state.canal = sb()
      .channel(`wp-${state.grupoId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "playback_sync",
        filter: `grupo_id=eq.${state.grupoId}`
      }, ({ new: row }) => {
        if (!row) return;
        state.host = row.host_id === state.userId;
        renderEstado(row);
        if (row.host_id === state.userId) return; // no me aplico mis propios cambios
        if (!row.activo) return;
        aplicarEstadoRemoto(row);
      })
      .subscribe();
  }

  /* ---------- 4. Publicar cambios (solo host) ---------- */
  async function publicar(evento, posicionMs = 0, url = null) {
    if (!state.host || !state.grupoId) return;
    const row = {
      grupo_id: state.grupoId,
      host_id: state.userId,
      host_name: state.userName,
      url: url ?? state.ultimaUrl,
      evento,
      posicion_ms: Math.max(0, Math.round(posicionMs)),
      host_started_at: new Date().toISOString(),
      activo: evento !== "stop",
      updated_at: new Date().toISOString()
    };
    await sb().from("playback_sync").upsert(row, { onConflict: "grupo_id" });
  }
  window._wpPublicar = publicar;
  window._wpSetUrl = u => { state.ultimaUrl = u; };

  /* ---------- 5. Aplicar estado remoto ---------- */
  function aplicarEstadoRemoto(row) {
    const transcurrido = Date.now() - new Date(row.host_started_at).getTime();
    const posicionObjetivo = (row.posicion_ms || 0) + (row.evento === "play" ? transcurrido : 0);
    const item = (window._playlists || [])
      .flatMap(p => p.canciones)
      .find(c => c.url === row.url);
    if (!item) return;

    // Cambiar de pista si es distinto al actual
    const actual = colaActual();
    if (!actual || actual.url !== row.url) {
      window._wpReproducirUrl?.(row.url);
    }

    setTimeout(() => {
      if (row.evento === "play") {
        if (window.proveedorActual === "youtube" && window.youtubePlayer) {
          window.youtubePlayer.seekTo(posicionObjetivo / 1000, true);
          window.youtubePlayer.playVideo();
        } else if (window.proveedorActual === "spotify" && window.spotifyController) {
          window.spotifyController.seek(posicionObjetivo);
          window.spotifyController.play();
        } else if (window.globalAudio) {
          window.globalAudio.currentTime = posicionObjetivo / 1000;
          window.globalAudio.play().catch(() => {});
        }
      } else if (row.evento === "pause") {
        if (window.proveedorActual === "youtube" && window.youtubePlayer) window.youtubePlayer.pauseVideo();
        else if (window.proveedorActual === "spotify" && window.spotifyController) window.spotifyController.pause();
        else window.globalAudio?.pause();
      } else if (row.evento === "seek") {
        if (window.proveedorActual === "youtube" && window.youtubePlayer) window.youtubePlayer.seekTo(posicionObjetivo / 1000, true);
        else if (window.proveedorActual === "spotify" && window.spotifyController) window.spotifyController.seek(posicionObjetivo);
        else if (window.globalAudio) window.globalAudio.currentTime = posicionObjetivo / 1000;
      }
    }, 400);
  }

  function colaActual() {
    try { return window._wpColaActual?.(); } catch { return null; }
  }

  /* ---------- 6. UI del botón "Ver juntos" ---------- */
  function renderEstado(row) {
    const banner = $("wp-banner");
    if (!banner) return;
    if (!row.activo) { banner.hidden = true; return; }
    banner.hidden = false;
    const soyHost = row.host_id === state.userId;
    banner.innerHTML = `
      <span class="wp-live-dot"></span>
      <span class="wp-info">
        ${soyHost ? "🎬 Tú controlas la sesión" : `🎬 ${row.host_name || "Alguien"} está reproduciendo`}
      </span>
      ${soyHost
        ? `<button type="button" class="wp-btn wp-stop" id="wp-stop">Terminar</button>`
        : `<button type="button" class="wp-btn wp-follow" id="wp-follow">Unirme</button>`}
    `;
    $("wp-stop")?.addEventListener("click", () => publicar("stop"));
    $("wp-follow")?.addEventListener("click", () => {
      const last = row; aplicarEstadoRemoto({ ...last, evento: "play" });
    });
  }

  /* ---------- 7. Botón "Compartir con el grupo" ---------- */
  function inyectarBotonCompartir() {
    const bar = $("player-bar");
    if (!bar || bar.querySelector("#wp-share")) return;
    const btn = document.createElement("button");
    btn.id = "wp-share";
    btn.className = "player-btn-sm";
    btn.title = "Compartir con el grupo";
    btn.textContent = "🎬";
    btn.addEventListener("click", async () => {
      state.host = true;
      const item = colaActual();
      if (!item) return;
      await publicar("play", 0, item.url);
      bannerToast("🎬 Tu grupo se ha unido · controla tú la sesión");
    });
    bar.querySelector(".player-controls")?.prepend(btn);
  }

  function bannerToast(msg) {
    const el = document.createElement("div");
    el.className = "wp-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* ---------- 8. Hooks: publicar cambios del host ---------- */
  function engancharPlayer() {
    // Cuando el host hace play
    document.addEventListener("click", e => {
      if (!state.host) return;
      if (e.target.closest("#player-play")) {
        const posMs = obtenerPosMs();
        const estaPausado = $("player-play")?.innerHTML?.includes("M5 3v18") || false;
        publicar(estaPausado ? "play" : "pause", posMs);
      }
    }, true);

    // Cuando el host hace seek
    $("player-seek")?.addEventListener("change", () => {
      if (!state.host) return;
      publicar("seek", obtenerPosMs());
    }, true);

    // Cuando el host cambia de canción
    document.addEventListener("click", e => {
      if (!state.host) return;
      if (e.target.closest("#player-next") || e.target.closest("#player-prev")) {
        setTimeout(() => {
          const item = colaActual();
          if (item) publicar("change", 0, item.url);
        }, 700);
      }
    }, true);
  }

  function obtenerPosMs() {
    if (window.proveedorActual === "youtube" && window.youtubePlayer)
      return (window.youtubePlayer.getCurrentTime() || 0) * 1000;
    if (window.globalAudio) return (window.globalAudio.currentTime || 0) * 1000;
    return Number($("player-current")?.dataset.seconds || 0) * 1000;
  }

  /* ---------- 9. Init ---------- */
  window.addEventListener("sunadventures:group-ready", () => init());
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => setTimeout(() => { init(); inyectarBotonCompartir(); engancharPlayer(); }, 1500));
  else
    setTimeout(() => { init(); inyectarBotonCompartir(); engancharPlayer(); }, 1500);

  window.WatchParty = { publicar, state, init };
  console.log("✅ watch-party.js cargado");
})();