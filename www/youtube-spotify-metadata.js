/* ============================================================
   YOUTUBE-SPOTIFY-METADATA.JS
   - Extrae título/artista de links YT/Spotify (oEmbed, sin API key)
   - Detecta videos no-embebibles antes de reproducirlos
   - Rellena el formulario automáticamente
   ============================================================ */
(function () {
  "use strict";
  const $  = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);

  /* ---------- 1. Detectar link ---------- */
  function parsearLink(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const partes = u.pathname.split("/").filter(Boolean);
        const id = host === "youtu.be"
          ? partes[0]
          : ["embed", "shorts", "live"].includes(partes[0]) ? partes[1] : u.searchParams.get("v");
        return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { tipo: "youtube", id } : null;
      }
      if (host === "open.spotify.com") {
        const partes = u.pathname.split("/").filter(Boolean);
        const ti = partes[0]?.startsWith("intl-") ? 1 : 0;
        const entidad = partes[ti];
        const id = partes[ti + 1];
        if (["track", "album", "playlist", "episode", "show"].includes(entidad) && id) {
          return { tipo: "spotify", entidad, id };
        }
      }
    } catch {}
    return null;
  }

  /* ---------- 2. oEmbed público ---------- */
  async function fetchOEmbed(url) {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const r = await fetch(endpoint);
    if (!r.ok) throw new Error("oEmbed " + r.status);
    return await r.json(); // { title, author_name, thumbnail_url, ... }
  }

  async function fetchSpotifyOEmbed(url) {
    const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error("oEmbed " + r.status);
    return await r.json(); // { title, thumbnail_url, ... }
  }

  /* ---------- 3. Rellenar el formulario ---------- */
  async function autorellenar() {
    const input = $("cancion-url");
    const titulo = $("cancion-titulo");
    const artista = $("cancion-artista");
    if (!input || !titulo || !artista) return;

    const url = input.value.trim();
    const parsed = parsearLink(url);
    if (!parsed) {
      // Si no es YT/Spotify, sólo limpia el estado si estaba mostrando algo
      input.dataset.estado = "";
      return;
    }

    // Evitar llamar dos veces para el mismo link
    if (input.dataset.ultimoFetch === url) return;
    input.dataset.ultimoFetch = url;
    input.dataset.estado = "cargando";

    try {
      let data;
      if (parsed.tipo === "youtube") {
        data = await fetchOEmbed(url);
        if (!titulo.value.trim()) titulo.value = data.title || "";
        if (!artista.value.trim()) artista.value = data.author_name || "";
      } else {
        data = await fetchSpotifyOEmbed(url);
        // Spotify devuelve "Song · Artist" o similar en title
        if (!titulo.value.trim()) {
          const m = (data.title || "").match(/^(.+?)\s*[·•-]\s*(.+)$/);
          if (m) {
            titulo.value = m[1].trim();
            if (!artista.value.trim()) artista.value = m[2].trim();
          } else {
            titulo.value = data.title || "";
          }
        }
      }
      input.dataset.estado = "ok";
    } catch (err) {
      console.warn("No se pudo obtener metadata:", err);
      input.dataset.estado = "error";
    }
  }

  /* ---------- 4. Comprobar si el video es embebible ---------- */
  async function esEmbebible(videoId) {
    try {
      // Consulta al oEmbed: si el video es privado/no-embebible devuelve 401/404
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      return r.ok;
    } catch { return false; }
  }

  /* ---------- 5. Interceptar reproducción de YouTube ---------- */
  // Parcheamos el player de YouTube para que avise cuando falle
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".cancion-item-link");
    if (!btn) return;
    const item = btn.closest(".cancion-item");
    if (!item) return;

    // Esperar a que el player esté montado
    await new Promise(r => setTimeout(r, 1500));

    const target = document.getElementById("youtube-player-target");
    if (!target) return;

    // Detectar el error de YouTube: "Este vídeo no está disponible"
    const errorObs = new MutationObserver((muts) => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        const txt = (n.textContent || "").toLowerCase();
        if (txt.includes("no está disponible") || txt.includes("not available") || txt.includes("unavailable")) {
          // Sacar el link del item actual para abrirlo en pestaña nueva
          const cancion = window._wpColaActual?.();
          if (!cancion?.url) return;
          errorObs.disconnect();

          // Modal de aviso bonito
          if (window.SunModal) {
            window.SunModal.confirm({
              title: "🎬 Este video no se puede incrustar",
              message: `El autor bloqueó el reproductor. ¿Abrirlo en YouTube en una pestaña nueva?`,
              variant: "warning",
              icon: "⚠️",
              confirmText: "Abrir en YouTube",
              cancelText: "Siguiente canción"
            }).then(ok => {
              if (ok) {
                window.open(cancion.url, "_blank", "noopener");
              } else {
                document.getElementById("player-next")?.click();
              }
            });
          }
        }
      }));
    });
    errorObs.observe(target, { childList: true, subtree: true });
    // Auto-desconectar a los 8 segundos por si no encuentra error
    setTimeout(() => errorObs.disconnect(), 8000);
  }, true);

  /* ---------- 6. Enganchar al formulario ---------- */
  document.addEventListener("input", (e) => {
    if (e.target.id === "cancion-url") {
      clearTimeout(e.target._t);
      e.target._t = setTimeout(autorellenar, 600);
    }
  });
  // También en pegado inmediato
  document.addEventListener("paste", (e) => {
    if (e.target.id === "cancion-url") {
      setTimeout(autorellenar, 100);
    }
  });

  /* ---------- 7. Indicador visual del estado ---------- */
  const css = document.createElement("style");
  css.textContent = `
    #cancion-url[data-estado="cargando"] { border-color: #ffd93d !important; background: rgba(255,217,61,.05) !important; }
    #cancion-url[data-estado="ok"]       { border-color: #4dd48e !important; background: rgba(77,212,142,.06) !important; }
    #cancion-url[data-estado="error"]    { border-color: #ff5470 !important; background: rgba(255,84,112,.06) !important; }
  `;
  document.head.appendChild(css);

  console.log("✅ youtube-spotify-metadata.js cargado");
})();