/* ============================================================
   MUSICA-LOCAL.JS v3 — audio + vídeo, local, con sync de grupo
   · Registra la vista antes de que album.js lea _extraVistas
   · Activa la vista de forma autónoma (no depende de album.js)
   ============================================================ */
(function () {
  "use strict";

  window._extraVistas = window._extraVistas || [];
  if (!window._extraVistas.includes("musica-local")) window._extraVistas.push("musica-local");

  const DB = "sunadventures_musica", VER = 1, S_TR = "tracks", S_PL = "playlists";
  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const fmt = s => !isFinite(s) || s < 0 ? "0:00" : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const fsz = b => b < 1048576 ? (b/1024).toFixed(1) + " KB" : (b/1048576).toFixed(1) + " MB";

  const AEX = ["mp3","m4a","wav","ogg","flac","aac","opus"];
  const VEX = ["mp4","webm","mov","mkv","m4v","ogv","avi"];
  const kindOf = f => {
    const m = (f.type || "").toLowerCase();
    const e = (f.name.split(".").pop() || "").toLowerCase();
    if (m.startsWith("video/") || VEX.includes(e)) return "video";
    if (m.startsWith("audio/") || AEX.includes(e)) return "audio";
    return null;
  };

  /* ---------- IndexedDB ---------- */
  let _db = null;
  const openDB = () => _db ? Promise.resolve(_db) : new Promise((res, rej) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(S_TR)) d.createObjectStore(S_TR, { keyPath: "hash" });
      if (!d.objectStoreNames.contains(S_PL)) d.createObjectStore(S_PL, { keyPath: "id" });
    };
    r.onsuccess = () => { _db = r.result; res(_db); };
    r.onerror = () => rej(r.error);
  });
  const dbPut = async (s, o) => { const d = await openDB(); return new Promise((res, rej) => { const t = d.transaction(s, "readwrite"); t.objectStore(s).put(o); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); };
  const dbGet = async (s, k) => { const d = await openDB(); return new Promise((res, rej) => { const r = d.transaction(s, "readonly").objectStore(s).get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); }); };
  const dbAll = async (s) => { const d = await openDB(); return new Promise((res, rej) => { const r = d.transaction(s, "readonly").objectStore(s).getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); }); };
  const dbDel = async (s, k) => { const d = await openDB(); return new Promise((res, rej) => { const t = d.transaction(s, "readwrite"); t.objectStore(s).delete(k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); };

  /* ---------- Helpers ---------- */
  const uid = () => window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
  const gid = () => window._getGrupoActivo?.()?.id || localStorage.getItem("grupo_activo");
  const sb  = () => window._supabase;
  const notif = t => { try { window._TiendaAPI?.notifMascota?.("Mi música", t); } catch {} };

  const state = { tracks: [], playlists: [], queue: [], queueIndex: -1, playing: false, shuffle: false, repeat: "off" };

  /* ---------- <video> flotante (sirve también para audio) ---------- */
  const videoBox = document.createElement("div");
  videoBox.className = "ml-video-box";
  videoBox.hidden = true;
  videoBox.innerHTML = `<button type="button" class="ml-video-close" title="Ocultar vídeo">×</button><video class="ml-video-el" playsinline controls></video>`;
  document.body.appendChild(videoBox);
  const audio = videoBox.querySelector(".ml-video-el");
  audio.preload = "metadata";
  audio.volume = parseFloat(localStorage.getItem("ml_volumen") || "0.8");
  videoBox.querySelector(".ml-video-close").onclick = () => { videoBox.hidden = true; };
  let blobUrlActual = null;

  /* ---------- Hash / parseo / duración ---------- */
  const hashOf = async f => {
    const buf = new TextEncoder().encode(`${f.name}|${f.size}|${f.lastModified || 0}`);
    const dg = await crypto.subtle.digest("SHA-1", buf);
    return [...new Uint8Array(dg)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  };
  const parseName = name => {
    const b = name.replace(/\.[^.]+$/, "").trim();
    const m = b.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    return m ? { artista: m[1].trim(), titulo: m[2].trim() } : { artista: "", titulo: b };
  };
  const durationOf = (blob, kind = "audio") => new Promise(res => {
    const u = URL.createObjectURL(blob);
    const el = document.createElement(kind === "video" ? "video" : "audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => { URL.revokeObjectURL(u); res(el.duration || 0); };
    el.onerror = () => { URL.revokeObjectURL(u); res(0); };
    el.src = u;
  });

  /* ---------- Añadir archivos ---------- */
  async function añadirArchivos() {
    if ("showOpenFilePicker" in window) {
      try {
        const hs = await window.showOpenFilePicker({
          multiple: true,
          types: [{
            description: "Audio o vídeo",
            accept: {
              "audio/*": AEX.map(e => "." + e),
              "video/*": VEX.map(e => "." + e)
            }
          }]
        });
        for (const h of hs) { try { await importar(await h.getFile()); } catch {} }
        return;
      } catch (e) { if (e.name === "AbortError") return; }
    }
    const i = document.createElement("input");
    i.type = "file";
    i.multiple = true;
    i.accept = "audio/*,video/*," + [...AEX, ...VEX].map(e => "." + e).join(",");
    i.onchange = async () => { for (const f of i.files) await importar(f); };
    i.click();
  }

  async function importar(file) {
    const kind = kindOf(file);
    if (!kind) return;
    const hash = await hashOf(file);
    if (await dbGet(S_TR, hash)) { notif("Ya está: " + file.name); return; }
    const { titulo, artista } = parseName(file.name);
    const rec = {
      hash,
      name: file.name,
      size: file.size,
      type: file.type || (kind === "video" ? "video/mp4" : "audio/mpeg"),
      lastModified: file.lastModified || 0,
      kind,
      titulo,
      artista,
      duracion: await durationOf(file, kind),
      addedAt: Date.now(),
      blob: file
    };
    await dbPut(S_TR, rec);
    state.tracks.push(rec);
    renderLib();
    notif(`✅ ${titulo}`);
  }

  /* ---------- Biblioteca ---------- */
  function renderLib() {
    const c = $("ml-biblioteca-lista"); if (!c) return;
    const q = ($("ml-buscar")?.value || "").toLowerCase().trim();
    const list = state.tracks
      .filter(t => !q || t.titulo.toLowerCase().includes(q) || (t.artista || "").toLowerCase().includes(q))
      .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    if (!list.length) {
      c.innerHTML = `<div class="ml-vacio">${state.tracks.length ? "Sin resultados" : "Aún no has añadido música.<br>Pulsa «+ Añadir archivos» para empezar."}</div>`;
      return;
    }
    const cur = state.queue[state.queueIndex]?.hash;
    c.innerHTML = list.map(t => `
      <div class="ml-track${cur === t.hash ? " reproduciendo" : ""}" data-hash="${t.hash}">
        <button class="ml-track-play" title="Reproducir">▶</button>
        <div class="ml-track-info">
          <span class="ml-track-titulo">${esc(t.titulo)}</span>
          <span class="ml-track-artista">${esc(t.artista || "—")} · ${fmt(t.duracion)} · ${fsz(t.size)}</span>
        </div>
        <button class="ml-track-add" title="Añadir a playlist">＋</button>
        <button class="ml-track-del" title="Quitar">×</button>
      </div>`).join("");
    c.querySelectorAll(".ml-track").forEach(r => {
      const h = r.dataset.hash;
      r.querySelector(".ml-track-play").onclick = () => reproducirDesdeLib(h);
      r.querySelector(".ml-track-add").onclick  = () => addAPlaylist(h);
      r.querySelector(".ml-track-del").onclick  = () => quitarDeLib(h);
    });
  }

  async function quitarDeLib(hash) {
    if (!confirm("¿Quitar de tu biblioteca? El archivo original NO se borra del disco.")) return;
    await dbDel(S_TR, hash);
    state.tracks = state.tracks.filter(t => t.hash !== hash);
    renderLib();
  }

  /* ---------- Reproducción ---------- */
  const reproducirDesdeLib = async hash => {
    state.queue = state.tracks.slice();
    state.queueIndex = state.queue.findIndex(t => t.hash === hash);
    await reproducirActual();
  };

  async function reproducirActual() {
    const t = state.queue[state.queueIndex];
    if (!t) return;
    if (blobUrlActual) { URL.revokeObjectURL(blobUrlActual); blobUrlActual = null; }
    if (!t.blob) { notif("Archivo no disponible"); return; }
    blobUrlActual = URL.createObjectURL(t.blob);
    audio.src = blobUrlActual;
    videoBox.hidden = t.kind !== "video";
    if (t.kind === "video") { try { audio.load(); } catch {} }
    try { await audio.play(); state.playing = true; } catch { state.playing = false; }
    updPlayer();
    renderLib();
  }

  const pausar    = () => { audio.pause(); state.playing = false; updPlayer(); };
  const reanudar  = () => { if (audio.src) { audio.play(); state.playing = true; updPlayer(); } };
  const siguiente = () => {
    if (!state.queue.length) return;
    if (state.repeat === "one") return reproducirActual();
    if (state.shuffle) {
      let n;
      do { n = Math.floor(Math.random() * state.queue.length); }
      while (state.queue.length > 1 && n === state.queueIndex);
      state.queueIndex = n;
    } else {
      state.queueIndex++;
      if (state.queueIndex >= state.queue.length) {
        if (state.repeat === "all") state.queueIndex = 0;
        else { state.queueIndex = state.queue.length - 1; pausar(); return; }
      }
    }
    reproducirActual();
  };
  const anterior = () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    if (state.shuffle) return siguiente();
    state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    reproducirActual();
  };
  const updPlayer = () => {
    const b = $("ml-player"); if (!b) return;
    const t = state.queue[state.queueIndex];
    if (!t) { b.classList.remove("visible"); return; }
    b.classList.add("visible");
    b.querySelector(".ml-player-titulo").textContent  = t.titulo;
    b.querySelector(".ml-player-artista").textContent = t.artista || "—";
    b.querySelector(".ml-player-play").textContent    = state.playing ? "❚❚" : "▶";
  };

  /* ---------- Playlists ---------- */
  const norm = p => ({
    id: p.id, nombre: p.nombre, descripcion: p.descripcion || "",
    canciones: Array.isArray(p.canciones) ? p.canciones : []
  });

  async function cargarPLs() {
    const s = sb(), g = gid();
    if (!s || !g) { state.playlists = []; return; }
    let r = await s.from("playlists").select("id,nombre,descripcion,canciones,created_at")
      .eq("grupo_id", g).eq("tipo", "local").order("created_at", { ascending: false });
    if (r.error) r = await s.from("playlists").select("id,nombre,descripcion,canciones,created_at")
      .eq("grupo_id", g).order("created_at", { ascending: false });
    state.playlists = r.error ? [] : (r.data || []).map(norm);
  }

  async function crearPL(nombre, desc) {
    const s = sb(), g = gid();
    const { data: { session } } = await s.auth.getSession();
    if (!session) throw new Error("Inicia sesión");
    const { data, error } = await s.from("playlists").insert({
      user_id: session.user.id, grupo_id: g, nombre, descripcion: desc || null,
      canciones: [], emoji: "music", color: "amarillo"
    }).select().single();
    if (error) throw error;
    state.playlists.unshift(norm(data));
  }

  const guardarPL = async pl => {
    const { error } = await sb().from("playlists").update({ canciones: pl.canciones }).eq("id", pl.id);
    if (error) throw error;
  };

  async function borrarPL(id) {
    if (!confirm("¿Eliminar esta playlist? No afecta a tus archivos.")) return;
    await sb().from("playlists").delete().eq("id", id);
    state.playlists = state.playlists.filter(p => p.id !== id);
    renderPLs();
  }

  function renderPLs() {
    const c = $("ml-playlists"); if (!c) return;
    if (!state.playlists.length) {
      c.innerHTML = `<div class="ml-vacio">Aún no hay playlists.<br>Pulsa «+ Nueva playlist» para crear la primera.</div>`;
      return;
    }
    c.innerHTML = state.playlists.map(p => `
      <div class="ml-playlist" data-id="${p.id}">
        <button class="ml-playlist-del" title="Eliminar">×</button>
        <h3 class="ml-playlist-nombre">${esc(p.nombre)}</h3>
        ${p.descripcion ? `<p class="ml-playlist-desc">${esc(p.descripcion)}</p>` : ""}
        <span class="ml-playlist-count">${p.canciones.length} canci${p.canciones.length === 1 ? "ón" : "ones"}</span>
        <div class="ml-playlist-play">▶ Reproducir</div>
      </div>`).join("");
    c.querySelectorAll(".ml-playlist").forEach(card => {
      const id = card.dataset.id;
      card.onclick = e => { if (!e.target.classList.contains("ml-playlist-del")) abrirPL(id); };
      card.querySelector(".ml-playlist-del").onclick = e => { e.stopPropagation(); borrarPL(id); };
    });
  }

  function abrirPL(id) {
    const pl = state.playlists.find(p => p.id === id); if (!pl) return;
    const disp = pl.canciones.filter(c => state.tracks.some(t => t.hash === c.hash));
    if (!disp.length) return alert(`Esta playlist tiene ${pl.canciones.length} canción(es), pero no tienes ninguna en tu dispositivo.\n\nPide a la otra persona que te comparta los archivos, o añade los tuyos propios.`);
    state.queue = disp.map(c => state.tracks.find(t => t.hash === c.hash)).filter(Boolean);
    state.queueIndex = 0;
    reproducirActual();
    pubSync(pl.id, 0, 0, true);
  }

  function addAPlaylist(hash) {
    if (!state.playlists.length) return alert("Primero crea una playlist con el botón «+ Nueva playlist».");
    const op = state.playlists.map((p, i) => `${i + 1}. ${p.nombre}`).join("\n");
    const pick = prompt("¿A qué playlist quieres añadirla?\n\n" + op);
    const i = Number(pick) - 1;
    if (!Number.isInteger(i) || !state.playlists[i]) return;
    const pl = state.playlists[i];
    const tr = state.tracks.find(t => t.hash === hash);
    if (!tr) return;
    if (pl.canciones.some(c => c.hash === hash)) return notif("Ya está en esa playlist");
    pl.canciones.push({ hash: tr.hash, titulo: tr.titulo, artista: tr.artista, duracion: tr.duracion, size: tr.size, kind: tr.kind });
    guardarPL(pl).then(() => { renderPLs(); notif("Añadida a " + pl.nombre); });
  }

  /* ---------- Modales ---------- */
  const abrirModalPL = () => {
    const m = $("ml-modal"); if (!m) return;
    m.classList.add("active");
    $("ml-modal-nombre").value = "";
    $("ml-modal-desc").value = "";
    $("ml-modal-nombre").focus();
  };
  const cerrarModalPL = () => $("ml-modal")?.classList.remove("active");

  /* ---------- Sync de grupo ---------- */
  let syncCh = null;
  async function pubSync(pid, idx, posMs, playing) {
    const s = sb(), g = gid(); if (!s || !g) return;
    const { data: { session } } = await s.auth.getSession();
    if (!session) return;
    await s.from("playback_sync").upsert({
      grupo_id: g, playlist_id: pid, host_id: session.user.id,
      host_name: localStorage.getItem("sunadventures_username") || "Anfitrión",
      track_index: idx, position_ms: Math.round(posMs),
      is_playing: !!playing, host_started_at: new Date().toISOString()
    }, { onConflict: "grupo_id" });
  }

  async function listenSync() {
    const s = sb(), g = gid(); if (!s || !g) return;
    if (syncCh) s.removeChannel(syncCh);
    syncCh = s.channel(`ml-sync-${g}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "playback_sync", filter: `grupo_id=eq.${g}` },
        ({ new: row }) => {
          if (!row || row.host_id === uid()) return;
          const pl = state.playlists.find(p => p.id === row.playlist_id); if (!pl) return;
          const meta = pl.canciones[row.track_index]; if (!meta) return;
          if (!state.tracks.some(t => t.hash === meta.hash)) return;
          state.queue = pl.canciones.map(c => state.tracks.find(t => t.hash === c.hash)).filter(Boolean);
          state.queueIndex = state.queue.findIndex(t => t.hash === meta.hash);
          if (state.queueIndex < 0) return;
          const elapsed = row.is_playing ? (Date.now() - new Date(row.host_started_at).getTime()) : 0;
          const target = ((row.position_ms || 0) + elapsed) / 1000;
          reproducirActual().then(() => {
            if (row.is_playing) { audio.currentTime = target; audio.play().catch(() => {}); state.playing = true; }
            else { audio.pause(); state.playing = false; }
            updPlayer();
          });
        }).subscribe();
  }

  /* ---------- Navegación autónoma ---------- */
  function activarVista() {
    qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "musica-local"));
    qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "musica-local"));
    $("#user-dropdown")?.classList.remove("open");
    $("#user-info")?.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.addEventListener("click", e => {
    if (e.target.closest('[data-view-link="musica-local"]'))
      requestAnimationFrame(() => requestAnimationFrame(activarVista));
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#musica-local")
      requestAnimationFrame(() => requestAnimationFrame(activarVista));
  });

  /* ---------- DOM: vista, nav, modal, player ---------- */
  function injectVista() {
    if ($("musica-local")) return;
    const s = document.createElement("section");
    s.id = "musica-local";
    s.className = "ml-section view";
    s.dataset.view = "musica-local";
    s.innerHTML = `
      <div class="ml-header"><h2 class="ml-title">Mi música</h2><p class="ml-subtitle">Tus archivos, tus playlists, tu privacidad</p></div>
      <div class="ml-aviso"><strong>⚖️ 100 % legal</strong><br>Los audios y vídeos que añadas <strong>nunca se suben a ningún servidor</strong>: se guardan cifrados en el almacenamiento local de tu navegador. Solo se comparten los <em>metadatos</em> (título, artista, duración) con tu grupo, y cada persona reproduce desde su propia copia del archivo.</div>
      <div class="ml-tabs" role="tablist">
        <button type="button" class="ml-tab active" data-ml-tab="biblioteca">Biblioteca</button>
        <button type="button" class="ml-tab" data-ml-tab="playlists">Playlists</button>
      </div>
      <div class="ml-panel active" data-ml-panel="biblioteca">
        <div class="ml-toolbar">
          <button type="button" class="ml-btn" id="ml-btn-add">＋ Añadir archivos</button>
          <input type="search" id="ml-buscar" placeholder="Buscar por título o artista…" autocomplete="off">
        </div>
        <div class="ml-lista" id="ml-biblioteca-lista"></div>
      </div>
      <div class="ml-panel" data-ml-panel="playlists">
        <div class="ml-toolbar">
          <button type="button" class="ml-btn" id="ml-btn-nueva-pl">＋ Nueva playlist</button>
          <button type="button" class="ml-btn sec" id="ml-btn-recargar">↻ Recargar</button>
        </div>
        <div class="ml-playlists" id="ml-playlists"></div>
      </div>`;
    const f = qs(".site-footer");
    f ? f.parentNode.insertBefore(s, f) : document.body.appendChild(s);
    qsa("[data-ml-tab]", s).forEach(tab => tab.onclick = () => {
      qsa("[data-ml-tab]", s).forEach(t => t.classList.toggle("active", t === tab));
      qsa("[data-ml-panel]", s).forEach(p => p.classList.toggle("active", p.dataset.mlPanel === tab.dataset.mlTab));
      tab.dataset.mlTab === "playlists" ? renderPLs() : renderLib();
    });
    $("ml-btn-add").onclick = añadirArchivos;
    $("ml-btn-nueva-pl").onclick = abrirModalPL;
    $("ml-btn-recargar").onclick = async () => { await cargarPLs(); renderPLs(); };
    $("ml-buscar").oninput = renderLib;
  }

  function injectNav() {
    if (qs('[data-view-link="musica-local"]')) return;
    const n = qs(".nav-links"); if (!n) return;
    const a = document.createElement("a");
    a.href = "#musica-local";
    a.className = "nav-link";
    a.dataset.viewLink = "musica-local";
    a.innerHTML = `<span class="ui-icon nav-link-icon" data-icono="musica"></span><span class="nav-link-text">Mi música</span>`;
    n.appendChild(a);
  }

  function injectModal() {
    if ($("ml-modal")) return;
    const m = document.createElement("div");
    m.id = "ml-modal";
    m.className = "ml-modal";
    m.setAttribute("aria-hidden", "true");
    m.innerHTML = `
      <div class="ml-modal-card">
        <button type="button" class="ml-modal-close" data-ml-modal-close>×</button>
        <h3>Nueva playlist</h3>
        <label><span>Nombre</span><input type="text" id="ml-modal-nombre" maxlength="50" placeholder="Ej. Para el coche"></label>
        <label><span>Descripción (opcional)</span><input type="text" id="ml-modal-desc" maxlength="80" placeholder="Ej. Lo que suena los domingos"></label>
        <div class="ml-modal-actions">
          <button type="button" class="ml-btn sec" data-ml-modal-close>Cancelar</button>
          <button type="button" class="ml-btn" id="ml-modal-crear">Crear</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    m.querySelectorAll("[data-ml-modal-close]").forEach(b => b.onclick = cerrarModalPL);
    m.onclick = e => { if (e.target === m) cerrarModalPL(); };
    $("ml-modal-crear").onclick = async () => {
      const n = $("ml-modal-nombre").value.trim();
      if (!n) return alert("Ponle un nombre");
      try { await crearPL(n, $("ml-modal-desc").value.trim()); cerrarModalPL(); renderPLs(); }
      catch (e) { alert("No se pudo crear: " + e.message); }
    };
  }

  function injectPlayer() {
    if ($("ml-player")) return;
    const p = document.createElement("div");
    p.id = "ml-player";
    p.className = "ml-player";
    p.innerHTML = `
      <button class="ml-player-close" title="Cerrar reproductor">×</button>
      <div class="ml-player-info">
        <div class="ml-player-cover">♪</div>
        <div class="ml-player-meta">
          <span class="ml-player-titulo">—</span>
          <span class="ml-player-artista">—</span>
        </div>
      </div>
      <div class="ml-player-controls">
        <button class="ml-player-prev" title="Anterior">⏮</button>
        <button class="ml-player-play" title="Reproducir">▶</button>
        <button class="ml-player-next" title="Siguiente">⏭</button>
        <button class="ml-player-shuffle" title="Aleatorio">⤨</button>
        <button class="ml-player-repeat" title="Repetir">↻</button>
      </div>
      <div class="ml-player-progress">
        <span class="ml-player-time ml-player-current">0:00</span>
        <input type="range" class="ml-player-seek" min="0" max="100" value="0" step="0.1">
        <span class="ml-player-time ml-player-duration">0:00</span>
      </div>`;
    document.body.appendChild(p);
    p.querySelector(".ml-player-play").onclick = () => state.playing ? pausar() : reanudar();
    p.querySelector(".ml-player-prev").onclick = anterior;
    p.querySelector(".ml-player-next").onclick = siguiente;
    p.querySelector(".ml-player-shuffle").onclick = e => { state.shuffle = !state.shuffle; e.currentTarget.classList.toggle("activo", state.shuffle); };
    p.querySelector(".ml-player-repeat").onclick = e => {
      state.repeat = state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off";
      e.currentTarget.classList.toggle("activo", state.repeat !== "off");
      e.currentTarget.textContent = state.repeat === "one" ? "1" : "↻";
    };
    p.querySelector(".ml-player-close").onclick = () => {
      pausar();
      if (blobUrlActual) { URL.revokeObjectURL(blobUrlActual); blobUrlActual = null; }
      audio.src = "";
      videoBox.hidden = true;
      state.queue = [];
      state.queueIndex = -1;
      p.classList.remove("visible");
    };
    const seek = p.querySelector(".ml-player-seek");
    seek.oninput = () => { if (isFinite(audio.duration)) audio.currentTime = parseFloat(seek.value) / 100 * audio.duration; };
    audio.onplay = () => { state.playing = true; updPlayer(); };
    audio.onpause = () => { state.playing = false; updPlayer(); };
    audio.onended = siguiente;
    audio.ontimeupdate = () => {
      const c = audio.currentTime || 0, d = audio.duration || 0;
      p.querySelector(".ml-player-current").textContent = fmt(c);
      p.querySelector(".ml-player-duration").textContent = fmt(d);
      if (d > 0) seek.value = (c / d) * 100;
    };
    audio.onloadedmetadata = () => {
      p.querySelector(".ml-player-duration").textContent = fmt(audio.duration);
    };
  }

  /* ---------- INIT ---------- */
  async function init() {
    injectNav();
    injectVista();
    injectModal();
    injectPlayer();
    state.tracks = (await dbAll(S_TR)).sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    renderLib();
    if (location.hash === "#musica-local") setTimeout(activarVista, 50);
    const boot = async () => {
      if (!gid()) return setTimeout(boot, 800);
      try { await cargarPLs(); renderPLs(); await listenSync(); } catch (e) { console.warn(e); }
    };
    boot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 600));
  } else {
    setTimeout(init, 600);
  }

  window.MusicaLocal = { añadirArchivos, state };
  console.log("✅ musica-local.js v3 — audio + vídeo, local, con sync de grupo");
})();