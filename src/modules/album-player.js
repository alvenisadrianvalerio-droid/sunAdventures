/* ============================================================
   MÓDULO: REPRODUCTOR LOCAL (album-player.js)
   ============================================================ */
(function() {
  const {
    supabase,
    BUCKET_CANCIONES,
    URL_EXPIRY_CANCIONES,
    SVG,
    $,
    ext,
    esVideo,
    fmtTiempo
  } = window.AlbumApp;

  const playerBar = $("player-bar");
  const playerBarTitle = $("player-bar-title");
  const playerBarArtist = $("player-bar-artist");
  const playerCoverIcon = $("player-cover-icon");
  const playerPlay = $("player-play");
  const playerNext = $("player-next");
  const playerPrev = $("player-prev");
  const playerShuffle = $("player-shuffle");
  const playerRepeat = $("player-repeat");
  const playerSeek = $("player-seek");
  const playerCurrent = $("player-current");
  const playerDuration = $("player-duration");
  const playerVolumeBtn = $("player-volume-btn");
  const playerVolume = $("player-volume");
  const playerClose = $("player-close");
  const globalAudio = $("global-audio");

  let colaReproduccion = [];
  let indiceReproduccion = -1;
  let modoAleatorio = false;
  let modoRepetir = "off";
  let volumenActual = parseFloat(localStorage.getItem("app_volume") || localStorage.getItem("player_volumen") || "0.8");
  let silenciadoAntes = false;
  let reproduciendo = false;

  const mostrarPlayerBar = () => {
    if (!playerBar) return;
    playerBar.classList.add("visible");
    playerBar.setAttribute("aria-hidden", "false");
    document.body.classList.add("player-abierto");
  };
  const actualizarIconoVolumen = () => {
    if (!playerVolumeBtn || !globalAudio) return;
    if (globalAudio.muted || volumenActual === 0) playerVolumeBtn.innerHTML = SVG.volMute;
    else if (volumenActual < 0.4) playerVolumeBtn.innerHTML = SVG.volLow;
    else playerVolumeBtn.innerHTML = SVG.volHigh;
  };
  const actualizarBotonPlay = () => {
    if (!playerPlay) return;
    playerPlay.innerHTML = reproduciendo ? SVG.pause : SVG.play;
    playerPlay.title = reproduciendo ? "Pausar" : "Reproducir";
    document.body.classList.toggle("player-playing", reproduciendo);
  };

  if (globalAudio) {
    globalAudio.volume = volumenActual;
    if (playerVolume) playerVolume.value = String(volumenActual);
    actualizarIconoVolumen();
  }
  window.addEventListener("sunad:volume-change", event => {
    const volume = Number(event.detail?.volume);
    if (!Number.isFinite(volume)) return;
    volumenActual = Math.max(0, Math.min(1, volume));
    if (globalAudio) {
      globalAudio.volume = volumenActual;
      globalAudio.muted = volumenActual === 0;
    }
    if (playerVolume) playerVolume.value = String(volumenActual);
    localStorage.setItem("player_volumen", String(volumenActual));
    actualizarIconoVolumen();
  });
  if (playerRepeat) playerRepeat.innerHTML = SVG.repeat;

  async function activarWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try { if (window._wakeLock) await window._wakeLock.release(); window._wakeLock = await navigator.wakeLock.request("screen"); } catch { }
  }
  async function liberarWakeLock() {
    if (window._wakeLock) { try { await window._wakeLock.release(); } catch { } window._wakeLock = null; }
  }

  function actualizarMediaSession(item) {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.titulo || "Sin título",
        artist: item.artista || "Four Sunflowers",
        album: "Nuestras playlists",
        artwork: [{ src: "img/girasol.jpg", sizes: "512x512", type: "image/jpeg" }]
      });
      navigator.mediaSession.setActionHandler("play", reanudarReproduccion);
      navigator.mediaSession.setActionHandler("pause", pausarReproduccion);
      navigator.mediaSession.setActionHandler("previoustrack", anteriorCancion);
      navigator.mediaSession.setActionHandler("nexttrack", () => siguienteCancion(true));
      navigator.mediaSession.playbackState = "playing";
    } catch { }
  }

  function iniciarColaDesdePlaylist(playlistId, indiceInicial) {
    try {
      const playlists = window.AlbumApp.modules.playlists?.getPlaylists() || [];
      const pl = playlists.find(p => p.id === playlistId);
      if (!pl) return;
      const inicial = pl.canciones[indiceInicial];
      if (!inicial) return;

      if (inicial.url && !inicial.url.startsWith("storage:")) {
        window.open(inicial.url, "_blank", "noopener,noreferrer");
        return;
      }

      colaReproduccion = [];
      let idxEnCola = -1;
      pl.canciones.forEach((c, i) => {
        if (c.url?.startsWith("storage:")) {
          colaReproduccion.push({
            titulo: c.titulo || "Sin título",
            artista: c.artista || "",
            url: c.url,
            playlistId
          });
          if (i === indiceInicial) idxEnCola = colaReproduccion.length - 1;
        }
      });

      if (idxEnCola < 0) return;
      indiceReproduccion = idxEnCola;
      reproducirIndiceActual();
    } catch (err) { console.warn("iniciarColaDesdePlaylist:", err); }
  }

  async function reproducirIndiceActual() {
    try {
      if (indiceReproduccion < 0 || indiceReproduccion >= colaReproduccion.length) {
        return pausarReproduccion();
      }
      const item = colaReproduccion[indiceReproduccion];
      if (!item) return;

      if (!item.url?.startsWith("storage:")) {
        return siguienteCancion(true);
      }

      pausarReproduccion();
      globalAudio?.removeAttribute("src");
      globalAudio?.load();

      if (playerBarTitle) playerBarTitle.textContent = item.titulo;
      if (playerBarArtist) playerBarArtist.textContent = item.artista || "";
      if (playerCoverIcon) playerCoverIcon.innerHTML = SVG.music;
      mostrarPlayerBar();
      actualizarEstadoReproduciendo();

      const path = item.url.replace(/^storage:/, "");
      let audioUrl = null;

      if (window.SunOffline) audioUrl = await window.SunOffline.obtenerCancionOffline(item.url);

      if (!audioUrl) {
        const { data, error } = await supabase.storage
          .from(BUCKET_CANCIONES)
          .createSignedUrl(path, URL_EXPIRY_CANCIONES);
        if (error || !data?.signedUrl) throw error || new Error("Sin URL");
        audioUrl = data.signedUrl;
      }

      if (globalAudio) {
        globalAudio.src = audioUrl;
        globalAudio.currentTime = 0;
      }

      if (playerCoverIcon) {
        playerCoverIcon.innerHTML = esVideo(ext(path)) ? SVG.image : SVG.music;
      }
      if (playerCurrent) playerCurrent.textContent = "0:00";
      if (playerDuration) {
        playerDuration.textContent = "0:00";
        delete playerDuration.dataset.seconds;
      }

      try {
        await globalAudio?.play();
        reproduciendo = true;
        actualizarBotonPlay();
        actualizarMediaSession(item);
      } catch {
        reproduciendo = false;
        actualizarBotonPlay();
      }
    } catch (err) {
      console.warn("reproducirIndiceActual:", err);
      setTimeout(() => siguienteCancion(true), 500);
    }
  }

  const pausarReproduccion = () => {
    globalAudio?.pause();
    reproduciendo = false;
    actualizarBotonPlay();
    liberarWakeLock();
  };

  const reanudarReproduccion = () => {
    if (!globalAudio?.src) return;
    globalAudio.play()
      .then(() => { reproduciendo = true; actualizarBotonPlay(); activarWakeLock(); })
      .catch(err => console.warn("No se pudo reanudar el audio:", err));
  };

  function siguienteCancion(autoplay = true) {
    try {
      if (!colaReproduccion.length) return;
      if (modoRepetir === "one") return reproducirIndiceActual();
      if (modoAleatorio) {
        let n;
        if (colaReproduccion.length === 1) n = 0;
        else { do { n = Math.floor(Math.random() * colaReproduccion.length); } while (n === indiceReproduccion); }
        indiceReproduccion = n;
      } else {
        indiceReproduccion++;
        if (indiceReproduccion >= colaReproduccion.length) {
          if (modoRepetir === "all") indiceReproduccion = 0;
          else {
            indiceReproduccion = colaReproduccion.length - 1;
            pausarReproduccion();
            return;
          }
        }
      }
      if (autoplay) reproducirIndiceActual();
      else {
        const item = colaReproduccion[indiceReproduccion];
        if (playerBarTitle) playerBarTitle.textContent = item.titulo;
        if (playerBarArtist) playerBarArtist.textContent = item.artista || "";
      }
    } catch (err) { console.warn("siguienteCancion:", err); }
  }

  function anteriorCancion() {
    try {
      if (!colaReproduccion.length) return;
      if (globalAudio && globalAudio.currentTime > 3) { globalAudio.currentTime = 0; return; }
      if (modoAleatorio) return siguienteCancion();
      indiceReproduccion--;
      if (indiceReproduccion < 0) indiceReproduccion = colaReproduccion.length - 1;
      reproducirIndiceActual();
    } catch (err) { console.warn("anteriorCancion:", err); }
  }

  playerPlay?.addEventListener("click", () => reproduciendo ? pausarReproduccion() : reanudarReproduccion());
  playerNext?.addEventListener("click", () => siguienteCancion(true));
  playerPrev?.addEventListener("click", anteriorCancion);
  playerShuffle?.addEventListener("click", () => { modoAleatorio = !modoAleatorio; playerShuffle.classList.toggle("activo", modoAleatorio); });
  playerRepeat?.addEventListener("click", () => {
    modoRepetir = modoRepetir === "off" ? "all" : modoRepetir === "all" ? "one" : "off";
    playerRepeat.classList.toggle("activo", modoRepetir !== "off");
    playerRepeat.innerHTML = modoRepetir === "one" ? SVG.repeatOne : SVG.repeat;
  });
  playerClose?.addEventListener("click", () => {
    pausarReproduccion();
    if (globalAudio) { globalAudio.src = ""; globalAudio.currentTime = 0; }
    colaReproduccion = []; indiceReproduccion = -1;
    playerBar?.classList.remove("visible");
    playerBar?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("player-abierto", "player-playing");
    actualizarEstadoReproduciendo();
    liberarWakeLock();
  });
  playerVolumeBtn?.addEventListener("click", () => {
    if (!globalAudio) return;
    if (globalAudio.muted || globalAudio.volume === 0) {
      globalAudio.muted = false;
      globalAudio.volume = volumenActual || 0.8;
    } else {
      silenciadoAntes = globalAudio.volume;
      globalAudio.volume = 0;
      globalAudio.muted = true;
    }
    actualizarIconoVolumen();
    if (playerVolume) playerVolume.value = String(globalAudio.volume);
  });
  playerVolume?.addEventListener("input", () => {
    if (!globalAudio) return;
    const v = parseFloat(playerVolume.value);
    window.dispatchEvent(new CustomEvent("sunad:volume-change", { detail: { volume: v } }));
    window.SunPreferences?.setVolume(v);
    actualizarIconoVolumen();
  });

  globalAudio?.addEventListener("play", () => { reproduciendo = true; actualizarBotonPlay(); activarWakeLock(); });
  globalAudio?.addEventListener("pause", () => { reproduciendo = false; actualizarBotonPlay(); });
  globalAudio?.addEventListener("timeupdate", () => {
    if (!globalAudio) return;
    const ct = globalAudio.currentTime || 0, dur = globalAudio.duration || 0;
    if (playerCurrent) playerCurrent.textContent = fmtTiempo(ct);
    if (playerDuration) playerDuration.textContent = fmtTiempo(dur);
    if (playerSeek && dur > 0) { playerSeek.max = 100; playerSeek.value = (ct / dur) * 100; }
  });
  globalAudio?.addEventListener("loadedmetadata", () => {
    if (playerDuration && globalAudio) playerDuration.textContent = fmtTiempo(globalAudio.duration || 0);
  });
  globalAudio?.addEventListener("ended", () => siguienteCancion(true));
  globalAudio?.addEventListener("error", () => setTimeout(() => siguienteCancion(true), 300));
  playerSeek?.addEventListener("input", () => {
    const ratio = parseFloat(playerSeek.value) / 100;
    if (globalAudio && isFinite(globalAudio.duration)) globalAudio.currentTime = ratio * globalAudio.duration;
  });

  function actualizarEstadoReproduciendo() {
    try {
      const actual = colaReproduccion[indiceReproduccion];
      const cancionesLista = $("canciones-lista");
      const items = cancionesLista?.querySelectorAll(".cancion-item");
      if (!items) return;
      items.forEach(i => i.classList.remove("reproduciendo"));
      if (!actual) return;
      const playlistEditando = window.AlbumApp.modules.playlists?.getPlaylistEditando();
      const playlists = window.AlbumApp.modules.playlists?.getPlaylists() || [];
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      items.forEach((item, i) => { if (pl.canciones[i]?.url === actual.url) item.classList.add("reproduciendo"); });
    } catch (err) { console.warn("actualizarEstadoReproduciendo:", err); }
  }

  // Hooks para watch-party y reproductor global
  window._playerQueue = () => ({ cola: [...colaReproduccion], indice: indiceReproduccion });
  window._wpColaActual = () => colaReproduccion[indiceReproduccion] || null;
  Object.defineProperty(window, "globalAudio", { get: () => globalAudio, configurable: true });
  Object.defineProperty(window, "proveedorActual", { get: () => "local", configurable: true });
  window._wpReproducirUrl = url => {
    if (!url?.startsWith("storage:")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const playlists = window.AlbumApp.modules.playlists?.getPlaylists() || [];
    const pl = playlists.find(p => p.canciones.some(c => c.url === url));
    if (!pl) return;
    const idx = pl.canciones.findIndex(c => c.url === url);
    window.AlbumApp.modules.playlists?.setPlaylistEditando(pl.id);
    iniciarColaDesdePlaylist(pl.id, idx);
  };

  window.AlbumApp.modules.player = {
    iniciarColaDesdePlaylist,
    reproducirIndiceActual,
    pausarReproduccion,
    reanudarReproduccion,
    siguienteCancion,
    anteriorCancion,
    actualizarEstadoReproduciendo
  };
})();
