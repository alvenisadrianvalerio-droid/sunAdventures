/* ============================================================
   MÓDULO: PLAYLISTS Y GESTIÓN DE CANCIONES (album-playlists.js)
   ============================================================ */
(function() {
  const {
    supabase,
    BUCKET_CANCIONES,
    SVG,
    $,
    ext,
    esAudio,
    esVideo,
    fmtTam,
    identificarEnlaceMusical,
    confirmar,
    alertar,
    crearBtn
  } = window.AlbumApp;

  let playlists = [];
  let playlistEditando = null;
  let emojiSeleccionado = "music";
  let colorPlaylistSeleccionado = "amarillo";
  let archivosPendientes = [];

  const playlistsGrid = $("playlists-grid");
  const playlistsEmpty = $("playlists-empty");
  const btnAddPlaylist = $("btn-add-playlist");
  const playlistModal = $("playlist-modal");
  const playlistForm = $("playlist-form");
  const playlistNombre = $("playlist-nombre");
  const playlistDescripcion = $("playlist-descripcion");
  const playlistSubmitBtn = playlistForm?.querySelector('button[type="submit"]');

  const cancionesModal = $("canciones-modal");
  const cancionesModalTitle = $("canciones-modal-title");
  const cancionesModalDesc = $("canciones-modal-desc");
  const cancionesLista = $("canciones-lista");
  const cancionForm = $("cancion-form");
  const cancionTitulo = $("cancion-titulo");
  const cancionArtista = $("cancion-artista");
  const cancionUrl = $("cancion-url");

  const cancionesPegarTexto = $("cancion-pegar-texto");
  const cancionesPegarPreview = $("cancion-pegar-preview");
  const btnImportarCanciones = $("btn-importar-canciones");
  const cancionPegarArchivo = $("cancion-pegar-archivo");
  const btnCargarArchivo = $("btn-cargar-archivo");

  const cancionSubirArchivo = $("cancion-subir-archivo");
  const btnSeleccionarArchivos = $("btn-seleccionar-archivos");
  const cancionSubirDropzone = $("cancion-subir-dropzone");
  const cancionSubirLista = $("cancion-subir-lista");
  const btnSubirCanciones = $("btn-subir-canciones");

  Object.defineProperty(window, "_playlists", { get: () => playlists, configurable: true });

  async function cargarPlaylists() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { playlists = []; return; }
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
      if (!grupoActivo) { playlists = []; return; }
      const { data, error } = await supabase.from("playlists")
        .select("id,nombre,descripcion,emoji,color,canciones,created_at,grupo_id")
        .eq("grupo_id", grupoActivo.id)
        .order("created_at", { ascending: false });
      if (error) { console.warn("cargarPlaylists error:", error); playlists = []; return; }
      playlists = (data || []).map(p => ({
        id: p.id, nombre: p.nombre, descripcion: p.descripcion,
        emoji: p.emoji || "music", color: p.color || "amarillo",
        canciones: Array.isArray(p.canciones) ? p.canciones : [],
        created_at: p.created_at, grupo_id: p.grupo_id
      }));
    } catch (err) { console.warn("cargarPlaylists:", err); playlists = []; }
  }

  const añadirPlaylistTabla = async (nombre, descripcion, emoji, color) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");
    const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();
    const { data, error } = await supabase.from("playlists").insert({ user_id: session.user.id, grupo_id: grupoActivo?.id, nombre, descripcion: descripcion || null, emoji: emoji || "music", color: color || "amarillo", canciones: [] }).select().single();
    if (error) throw error;
    return data;
  };
  const eliminarPlaylistTabla = async id => { const { error } = await supabase.from("playlists").delete().eq("id", id); if (error) throw error; };
  const guardarCancionesTabla = async (id, canciones) => { const { error } = await supabase.from("playlists").update({ canciones }).eq("id", id); if (error) throw error; };

  const EMOJI_A_SVG = { music: SVG.music, note: SVG.note, sparkle: SVG.sparkle, sunflower: SVG.sunflower, heart: SVG.heart, calendar: SVG.calendar };
  const renderEmoji = e => EMOJI_A_SVG[e] || SVG.music;

  function renderPlaylists() {
    try {
      if (!playlistsGrid) return;
      playlistsGrid.innerHTML = "";
      if (playlists.length === 0) { playlistsEmpty?.classList.remove("hidden"); return; }
      playlistsEmpty?.classList.add("hidden");
      const frag = document.createDocumentFragment();
      playlists.forEach(p => frag.appendChild(crearPlaylistCard(p)));
      playlistsGrid.appendChild(frag);
    } catch (err) { console.warn("renderPlaylists:", err); }
  }

  function crearPlaylistCard(pl) {
    try {
      const card = document.createElement("article");
      card.className = "playlist-card color-" + (pl.color || "amarillo");
      const btnDel = crearBtn("playlist-card-delete", SVG.close, "Eliminar playlist", e => { e.stopPropagation(); eliminarPlaylist(pl.id); });
      card.appendChild(btnDel);
      const header = document.createElement("div"); header.className = "playlist-card-header";
      const emoji = document.createElement("span"); emoji.className = "playlist-card-emoji"; emoji.innerHTML = renderEmoji(pl.emoji);
      const info = document.createElement("div"); info.className = "playlist-card-info";
      const nombre = document.createElement("span"); nombre.className = "playlist-card-nombre"; nombre.textContent = pl.nombre;
      info.appendChild(nombre);
      if (pl.descripcion) { const d = document.createElement("span"); d.className = "playlist-card-desc"; d.textContent = pl.descripcion; info.appendChild(d); }
      header.append(emoji, info); card.appendChild(header);
      const n = pl.canciones.length;
      const count = document.createElement("span"); count.className = "playlist-card-count";
      count.textContent = n === 0 ? "Sin canciones" : n === 1 ? "1 canción" : `${n} canciones`;
      card.appendChild(count);
      if (n > 0) {
        const prev = document.createElement("div");
        prev.className = "playlist-card-preview";
        prev.textContent = pl.canciones.slice(0, 3).map(c => c.titulo + (c.artista ? " · " + c.artista : "")).join("\n");
        card.appendChild(prev);
      }
      card.addEventListener("click", () => abrirCancionesModal(pl.id));
      return card;
    } catch (err) { console.warn("crearPlaylistCard:", err); return document.createElement("div"); }
  }

  function abrirPlaylistModal() {
    try {
      if (!playlistModal) return;
      playlistModal.classList.add("active"); playlistModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      playlistForm?.reset();
      emojiSeleccionado = "music"; colorPlaylistSeleccionado = "amarillo";
      document.querySelectorAll("#emoji-picker .emoji-option").forEach(o => o.classList.toggle("activo", o.dataset.emoji === "music"));
      document.querySelectorAll("#playlist-form .color-option").forEach(o => o.classList.toggle("activo", o.dataset.color === "amarillo"));
      if (playlistSubmitBtn) { playlistSubmitBtn.disabled = false; playlistSubmitBtn.textContent = "Guardar playlist"; }
      setTimeout(() => playlistNombre?.focus(), 100);
    } catch (err) { console.warn("abrirPlaylistModal:", err); }
  }
  function cerrarPlaylistModal() {
    try { if (!playlistModal) return; playlistModal.classList.remove("active"); playlistModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; } catch { }
  }

  async function eliminarPlaylist(id) {
    try {
      const ok = await confirmar({ title: "¿Eliminar esta playlist?", message: "Se borrarán todas sus canciones del grupo.", variant: "danger", icon: "🎵", confirmText: "Sí, eliminar", cancelText: "Cancelar" });
      if (!ok) return;
      await eliminarPlaylistTabla(id);
      playlists = playlists.filter(p => p.id !== id);
      renderPlaylists();
    } catch (err) { alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" }); }
  }

  function abrirCancionesModal(id) {
    try {
      const pl = playlists.find(p => p.id === id);
      if (!pl || !cancionesModal) return;
      playlistEditando = id;
      if (cancionesModalTitle) cancionesModalTitle.textContent = pl.nombre;
      if (cancionesModalDesc) cancionesModalDesc.textContent = pl.descripcion || "";
      renderCancionesLista(); resetCancionTabs();
      cancionesModal.classList.add("active"); cancionesModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      setTimeout(() => cancionTitulo?.focus(), 100);
    } catch (err) { console.warn("abrirCancionesModal:", err); }
  }
  function cerrarCancionesModal() {
    try { if (!cancionesModal) return; cancionesModal.classList.remove("active"); cancionesModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; playlistEditando = null; } catch { }
  }

  function renderCancionesLista() {
    try {
      if (!cancionesLista) return;
      const pl = playlists.find(p => p.id === playlistEditando);
      cancionesLista.innerHTML = "";
      if (!pl || pl.canciones.length === 0) {
        const v = document.createElement("div");
        v.className = "canciones-lista-vacia";
        v.textContent = "Aún no hay canciones. Sube tus archivos de audio locales.";
        cancionesLista.appendChild(v);
        return;
      }
      const frag = document.createDocumentFragment();
      pl.canciones.forEach((c, i) => frag.appendChild(crearCancionItem(c, i)));
      cancionesLista.appendChild(frag);
      window.AlbumApp.modules.player?.actualizarEstadoReproduciendo();
    } catch (err) { console.warn("renderCancionesLista:", err); }
  }

  function crearCancionItem(cancion, index) {
    try {
      const item = document.createElement("div");
      item.className = "cancion-item";
      item.dataset.index = index;

      const info = document.createElement("div");
      info.className = "cancion-item-info";
      const t = document.createElement("span");
      t.className = "cancion-item-titulo";
      t.textContent = cancion.titulo;
      info.appendChild(t);
      if (cancion.artista) {
        const a = document.createElement("span");
        a.className = "cancion-item-artista";
        a.textContent = cancion.artista;
        info.appendChild(a);
      }
      item.appendChild(info);

      if (cancion.url) {
        const esLocal = cancion.url.startsWith("storage:");
        const enlace = identificarEnlaceMusical(cancion.url);

        if (esLocal) {
          const btnPlay = crearBtn("cancion-item-link", SVG.play, "Reproducir en la app", () =>
            window.AlbumApp.modules.player?.iniciarColaDesdePlaylist(playlistEditando, index)
          );
          item.appendChild(btnPlay);
        } else {
          const link = document.createElement("a");
          link.className = "cancion-item-link";
          link.href = cancion.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.title = enlace?.tipo === "youtube"
            ? "Abrir en YouTube"
            : enlace?.tipo === "spotify"
              ? "Abrir en Spotify"
              : "Abrir enlace externo";
          link.innerHTML = SVG.external;
          item.appendChild(link);
        }
      }

      item.appendChild(crearBtn("cancion-item-delete", SVG.close, "Quitar canción", () => eliminarCancion(index)));
      return item;
    } catch (err) {
      console.warn("crearCancionItem:", err);
      return document.createElement("div");
    }
  }

  async function eliminarCancion(index) {
    try {
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      const c = pl.canciones[index];
      if (c?.url?.startsWith("storage:")) {
        try { await supabase.storage.from(BUCKET_CANCIONES).remove([c.url.replace(/^storage:/, "")]); } catch { }
      }
      const nuevas = pl.canciones.filter((_, i) => i !== index);
      await guardarCancionesTabla(pl.id, nuevas);
      pl.canciones = nuevas;
      renderCancionesLista(); renderPlaylists();
      window.dispatchEvent(new Event("sunad:progress"));
    } catch (err) { alertar({ title: "Error", message: "No se pudo quitar la canción: " + (err.message || err), variant: "danger" }); }
  }

  btnAddPlaylist?.addEventListener("click", abrirPlaylistModal);
  playlistModal?.querySelectorAll("[data-close-playlist-modal]").forEach(el => el.addEventListener("click", cerrarPlaylistModal));
  cancionesModal?.querySelectorAll("[data-close-canciones-modal]").forEach(el => el.addEventListener("click", cerrarCancionesModal));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (cancionesModal?.classList.contains("active")) cerrarCancionesModal();
    else if (playlistModal?.classList.contains("active")) cerrarPlaylistModal();
  });
  document.querySelectorAll("#emoji-picker .emoji-option").forEach(opt => opt.addEventListener("click", () => { document.querySelectorAll("#emoji-picker .emoji-option").forEach(o => o.classList.remove("activo")); opt.classList.add("activo"); emojiSeleccionado = opt.dataset.emoji; }));
  document.querySelectorAll("#playlist-form .color-option").forEach(opt => opt.addEventListener("click", () => { document.querySelectorAll("#playlist-form .color-option").forEach(o => o.classList.remove("activo")); opt.classList.add("activo"); colorPlaylistSeleccionado = opt.dataset.color; }));

  playlistForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const nombre = playlistNombre?.value.trim() || "", descripcion = playlistDescripcion?.value.trim() || "";
      if (!nombre) return alertar({ title: "Falta el nombre", message: "Ponle un nombre a la playlist.", icon: "🎵" });
      if (playlistSubmitBtn) { playlistSubmitBtn.disabled = true; playlistSubmitBtn.textContent = "Guardando..."; }
      try {
        const nueva = await añadirPlaylistTabla(nombre, descripcion, emojiSeleccionado, colorPlaylistSeleccionado);
        playlists.unshift({ id: nueva.id, nombre: nueva.nombre, descripcion: nueva.descripcion, emoji: nueva.emoji, color: nueva.color, canciones: [], created_at: nueva.created_at });
        cerrarPlaylistModal(); renderPlaylists();
      } catch (err) { alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" }); if (playlistSubmitBtn) { playlistSubmitBtn.disabled = false; playlistSubmitBtn.textContent = "Guardar playlist"; } }
    } catch (err) { console.warn("playlist submit:", err); }
  });

  cancionForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      const titulo = cancionTitulo?.value.trim() || "";
      const artista = cancionArtista?.value.trim() || "";
      const url = cancionUrl?.value.trim() || "";
      if (!titulo) return alertar({ title: "Falta el título", message: "Ponle un título a la canción.", icon: "🎵" });

      if (url && !identificarEnlaceMusical(url)) {
        return alertar({
          title: "Enlace no válido",
          message: "Solo aceptamos enlaces de <strong>Spotify</strong> o <strong>YouTube</strong>.<br>Si tienes un archivo propio, súbelo en la pestaña «Subir archivos».",
          variant: "warning",
          icon: "🔗"
        });
      }

      const nuevas = [...pl.canciones, { titulo, artista, url }];
      await guardarCancionesTabla(pl.id, nuevas);
      pl.canciones = nuevas;
      renderCancionesLista(); renderPlaylists();
      cancionForm.reset(); cancionTitulo?.focus();
    } catch (err) { alertar({ title: "Error", message: "No se pudo añadir: " + (err.message || err), variant: "danger" }); }
  });

  document.querySelectorAll(".cancion-tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".cancion-tab").forEach(t => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".cancion-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab.dataset.tab));
  }));

  function resetCancionTabs() {
    try {
      document.querySelectorAll(".cancion-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === "una"));
      document.querySelectorAll(".cancion-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === "una"));
      if (cancionesPegarTexto) cancionesPegarTexto.value = "";
      if (cancionesPegarPreview) { cancionesPegarPreview.classList.remove("visible"); cancionesPegarPreview.innerHTML = ""; }
      const radio = document.querySelector('input[name="pegar-orden"][value="titulo-artista"]');
      if (radio) radio.checked = true;
      if (cancionPegarArchivo) cancionPegarArchivo.value = "";
      archivosPendientes = archivosPendientes.filter(a => a.estado === "uploading");
      renderColaArchivos(); actualizarBotonSubir();
    } catch (err) { console.warn("resetCancionTabs:", err); }
  }

  function parsearListaCanciones(texto, orden) {
    const resultado = [], seps = [" - ", " – ", " — ", " | ", "\t"];
    (texto || "").split(/\r?\n/).forEach(raw => {
      let linea = raw.trim();
      if (!linea || /^#EXT/i.test(linea)) return;
      if (/^[A-Za-z]:\\/.test(linea) || /^\/Users\//.test(linea) || /^\/(home|mnt|media)\//.test(linea)) return;
      if (/^(playlist|canciones|songs|tracklist|mi playlist|lista)\s*:?\s*$/i.test(linea)) return;
      linea = linea.replace(/^(?:#\d+|\d+\s*[\.\)\-:]\s*)/, "").replace(/^[•·*\-–—]\s*/, "");
      if (!linea) return;
      if (/^https?:\/\/\S+$/i.test(linea)) { resultado.push({ titulo: "Canción", artista: "", url: linea }); return; }
      let url = "";
      const m = linea.match(/\s*[\(\[]?(https?:\/\/[^\s\)\]]+)[\)\]]?\s*$/i);
      if (m) { url = m[1]; linea = linea.replace(m[0], "").trim(); }
      const sep = seps.find(s => linea.includes(s));
      if (sep) {
        const partes = linea.split(sep).map(p => p.trim()).filter(Boolean);
        if (partes.length >= 2) {
          const [titulo, artista] = orden === "artista-titulo"
            ? [partes.slice(1).join(" - "), partes[0]]
            : [partes[0], partes.slice(1).join(" - ")];
          resultado.push({ titulo, artista, url });
          return;
        }
      }
      resultado.push({ titulo: linea, artista: "", url });
    });
    return resultado;
  }
  const ordenSeleccionado = () => document.querySelector('input[name="pegar-orden"]:checked')?.value || "titulo-artista";

  function actualizarPreviewPegar() {
    try {
      if (!cancionesPegarPreview || !cancionesPegarTexto) return;
      const canciones = parsearListaCanciones(cancionesPegarTexto.value, ordenSeleccionado());
      cancionesPegarPreview.innerHTML = "";
      if (canciones.length === 0) { cancionesPegarPreview.classList.remove("visible"); return; }
      cancionesPegarPreview.classList.add("visible");
      const cab = document.createElement("span");
      cab.className = "cancion-pegar-preview-num";
      cab.textContent = `${canciones.length} canción${canciones.length === 1 ? "" : "es"} detectada${canciones.length === 1 ? "" : "s"}`;
      cancionesPegarPreview.appendChild(cab);
      canciones.slice(0, 5).forEach(c => {
        const item = document.createElement("div");
        item.className = "cancion-pegar-preview-item";
        item.textContent = "• " + c.titulo + (c.artista ? " — " + c.artista : "") + (c.url ? " (con enlace)" : "");
        cancionesPegarPreview.appendChild(item);
      });
      if (canciones.length > 5) {
        const m = document.createElement("div");
        m.className = "cancion-pegar-preview-item";
        m.style.opacity = "0.5";
        m.textContent = `… y ${canciones.length - 5} más`;
        cancionesPegarPreview.appendChild(m);
      }
    } catch (err) { console.warn("actualizarPreviewPegar:", err); }
  }

  cancionesPegarTexto?.addEventListener("input", actualizarPreviewPegar);
  document.querySelectorAll('input[name="pegar-orden"]').forEach(r => r.addEventListener("change", actualizarPreviewPegar));

  btnImportarCanciones?.addEventListener("click", async () => {
    try {
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      const nuevas = parsearListaCanciones(cancionesPegarTexto.value, ordenSeleccionado());
      if (nuevas.length === 0) return alertar({ title: "Sin canciones", message: "No se detectaron canciones válidas.", icon: "🎵" });
      const ok = await confirmar({ title: "¿Importar canciones?", message: `Se añadirán <strong>${nuevas.length}</strong> canciones a <em>"${pl.nombre}"</em>.`, variant: "success", icon: "🎶", confirmText: "Importar", cancelText: "Cancelar" });
      if (!ok) return;
      btnImportarCanciones.disabled = true; btnImportarCanciones.textContent = "Importando...";
      try {
        const actualizadas = [...pl.canciones, ...nuevas];
        await guardarCancionesTabla(pl.id, actualizadas); pl.canciones = actualizadas;
        renderCancionesLista(); renderPlaylists(); resetCancionTabs();
      } catch (err) { alertar({ title: "Error", message: "No se pudo importar: " + (err.message || err), variant: "danger" }); }
      finally { btnImportarCanciones.disabled = false; btnImportarCanciones.textContent = "Importar todas"; }
    } catch (err) { console.warn("importar:", err); }
  });

  const leerArchivoTexto = file => new Promise((resolve, reject) => {
    try {
      const r = new FileReader();
      r.onload = e => resolve(e.target.result || "");
      r.onerror = reject;
      r.readAsText(file, "UTF-8");
    } catch (err) { reject(err); }
  });

  function aplicarArchivosCargados(textos, nombres) {
    try {
      if (!cancionesPegarTexto) return;
      const completo = textos.filter(Boolean).join("\n");
      if (!completo.trim()) return alertar({ title: "Archivos vacíos", message: "Los archivos no contenían texto.", icon: "📄" });
      const yaHay = cancionesPegarTexto.value.trim().length > 0;
      let final;
      if (yaHay) {
        const añadir = confirm(`Ya hay texto. ¿AÑADIR los ${nombres.length} archivo(s)? (Cancelar = reemplazar)`);
        final = añadir ? cancionesPegarTexto.value.trimEnd() + "\n" + completo : completo;
      } else final = completo;
      cancionesPegarTexto.value = final;
      actualizarPreviewPegar(); mostrarInfoArchivosTexto(nombres);
    } catch (err) { console.warn("aplicarArchivosCargados:", err); }
  }

  function mostrarInfoArchivosTexto(nombres) {
    try {
      if (!cancionesPegarPreview) return;
      cancionesPegarPreview.querySelector(".cancion-pegar-archivos")?.remove();
      const info = document.createElement("div"); info.className = "cancion-pegar-archivos";
      const t = document.createElement("span");
      t.className = "cancion-pegar-archivos-titulo";
      t.textContent = `${nombres.length} archivo${nombres.length === 1 ? "" : "s"} cargado${nombres.length === 1 ? "" : "s"}:`;
      info.appendChild(t);
      nombres.forEach(n => { const s = document.createElement("span"); s.className = "cancion-pegar-archivo-nombre"; s.textContent = "• " + n; info.appendChild(s); });
      cancionesPegarPreview.insertBefore(info, cancionesPegarPreview.firstChild);
    } catch (err) { console.warn("mostrarInfoArchivosTexto:", err); }
  }

  btnCargarArchivo?.addEventListener("click", () => cancionPegarArchivo?.click());
  cancionPegarArchivo?.addEventListener("change", async () => {
    try {
      const archivos = Array.from(cancionPegarArchivo.files || []);
      if (!archivos.length) return;
      const textos = [], nombres = [];
      for (const a of archivos) { try { textos.push(await leerArchivoTexto(a)); nombres.push(`${a.name} (${(a.size / 1024).toFixed(1)} KB)`); } catch { } }
      aplicarArchivosCargados(textos, nombres); cancionPegarArchivo.value = "";
    } catch (err) { console.warn("cargar archivo:", err); }
  });

  if (cancionesPegarTexto) {
    ["dragenter", "dragover"].forEach(evt => cancionesPegarTexto.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); cancionesPegarTexto.classList.add("drag-over"); }));
    ["dragleave", "drop"].forEach(evt => cancionesPegarTexto.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      if (evt === "dragleave" && e.relatedTarget && cancionesPegarTexto.contains(e.relatedTarget)) return;
      cancionesPegarTexto.classList.remove("drag-over");
    }));
    cancionesPegarTexto.addEventListener("drop", async e => {
      try {
        const archivos = Array.from(e.dataTransfer?.files || []);
        if (!archivos.length) return;
        const textos = [], nombres = [];
        for (const a of archivos) {
          if (!/\.(txt|csv|m3u|m3u8)$/i.test(a.name) && !a.type.startsWith("text/")) continue;
          try { textos.push(await leerArchivoTexto(a)); nombres.push(`${a.name} (${(a.size / 1024).toFixed(1)} KB)`); } catch { }
        }
        if (!textos.length) return alertar({ title: "Formatos no válidos", message: "Solo .txt, .csv, .m3u o .m3u8.", icon: "📄" });
        aplicarArchivosCargados(textos, nombres);
      } catch (err) { console.warn("drop archivos:", err); }
    });
  }

  const tituloDesdeArchivo = nombre => {
    try {
      const base = nombre.replace(/\.[^.]+$/, "");
      const sep = [" - ", " – ", " — "].find(s => base.includes(s));
      if (sep) {
        const p = base.split(sep).map(x => x.trim()).filter(Boolean);
        return { titulo: p[0] || base, artista: p.slice(1).join(" - ") || "" };
      }
      return { titulo: base, artista: "" };
    } catch { return { titulo: nombre, artista: "" }; }
  };

  function agregarArchivosACola(files) {
    try {
      if (!files?.length) return;
      for (const f of Array.from(files)) {
        if (archivosPendientes.some(p => p.file.name === f.name && p.file.size === f.size)) continue;
        const e = ext(f.name);
        if (!esAudio(e) && !esVideo(e)) continue;
        archivosPendientes.push({ file: f, id: Math.random().toString(36).slice(2), estado: "pending" });
      }
      renderColaArchivos(); actualizarBotonSubir();
    } catch (err) { console.warn("agregarArchivosACola:", err); }
  }

  function renderColaArchivos() {
    try {
      if (!cancionSubirLista) return;
      cancionSubirLista.innerHTML = "";
      if (!archivosPendientes.length) return;
      const textos = { pending: "Pendiente", uploading: "Subiendo...", done: "Listo", error: "Error" };
      const frag = document.createDocumentFragment();
      archivosPendientes.forEach(item => {
        const el = document.createElement("div"); el.className = "cancion-subir-item";
        const icon = document.createElement("span"); icon.className = "cancion-subir-item-icon"; icon.innerHTML = SVG.music;
        const info = document.createElement("div"); info.className = "cancion-subir-item-info";
        const n = document.createElement("span"); n.className = "cancion-subir-item-nombre"; n.textContent = item.file.name;
        const s = document.createElement("span"); s.className = "cancion-subir-item-size"; s.textContent = fmtTam(item.file.size);
        info.append(n, s);
        const status = document.createElement("span"); status.className = "cancion-subir-item-status " + item.estado;
        status.textContent = textos[item.estado] || item.estado;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "cancion-subir-item-remove"; btn.innerHTML = SVG.close; btn.title = "Quitar";
        btn.addEventListener("click", () => { archivosPendientes = archivosPendientes.filter(x => x.id !== item.id); renderColaArchivos(); actualizarBotonSubir(); });
        el.append(icon, info, status, btn); frag.appendChild(el);
      });
      cancionSubirLista.appendChild(frag);
    } catch (err) { console.warn("renderColaArchivos:", err); }
  }
  function actualizarBotonSubir() { if (!btnSubirCanciones) return; btnSubirCanciones.disabled = !archivosPendientes.some(a => a.estado === "pending"); }

  btnSeleccionarArchivos?.addEventListener("click", () => cancionSubirArchivo?.click());
  cancionSubirArchivo?.addEventListener("change", () => { agregarArchivosACola(cancionSubirArchivo.files); cancionSubirArchivo.value = ""; });

  if (cancionSubirDropzone) {
    ["dragenter", "dragover"].forEach(evt => cancionSubirDropzone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); cancionSubirDropzone.classList.add("drag-over"); }));
    ["dragleave", "drop"].forEach(evt => cancionSubirDropzone.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      if (evt === "dragleave" && e.relatedTarget && cancionSubirDropzone.contains(e.relatedTarget)) return;
      cancionSubirDropzone.classList.remove("drag-over");
    }));
    cancionSubirDropzone.addEventListener("drop", e => { const files = e.dataTransfer?.files; if (files?.length) agregarArchivosACola(files); });
  }

  async function subirArchivoACanciones(item, userId) {
    const e = ext(item.file.name) || "bin";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${e}`;
    const { error } = await supabase.storage.from(BUCKET_CANCIONES).upload(path, item.file, {
      contentType: item.file.type || "application/octet-stream",
      upsert: false
    });
    if (error) throw error;
    return path;
  }

  btnSubirCanciones?.addEventListener("click", async () => {
    try {
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alertar({ title: "Inicia sesión", message: "Necesitas una cuenta para subir archivos.", icon: "🔐" });
      const pendientes = archivosPendientes.filter(a => a.estado === "pending");
      if (!pendientes.length) return;

      const ok = await confirmar({
        title: "⚖️ Sube solo música legal",
        message: `Sube únicamente audios <strong>tuyos</strong> o de <strong>dominio público</strong>.<br><br>Se subirán <strong>${pendientes.length}</strong> archivo(s) a <em>"${pl.nombre}"</em>.`,
        variant: "warning",
        icon: "🎵",
        confirmText: "Confirmo, subir",
        cancelText: "Cancelar"
      });
      if (!ok) return;

      btnSubirCanciones.disabled = true;
      btnSubirCanciones.textContent = "Subiendo...";
      const nuevas = [];
      let exitos = 0, fallos = 0;
      for (const item of pendientes) {
        item.estado = "uploading"; renderColaArchivos();
        try {
          const path = await subirArchivoACanciones(item, session.user.id);
          const meta = tituloDesdeArchivo(item.file.name);
          nuevas.push({ titulo: meta.titulo, artista: meta.artista, url: "storage:" + path });
          item.estado = "done"; exitos++;
        } catch { item.estado = "error"; fallos++; }
        renderColaArchivos();
      }
      try {
        if (nuevas.length > 0) {
          const actualizadas = [...pl.canciones, ...nuevas];
          await guardarCancionesTabla(pl.id, actualizadas);
          pl.canciones = actualizadas;
          renderCancionesLista(); renderPlaylists();
        }
        archivosPendientes = archivosPendientes.filter(a => a.estado !== "done");
        renderColaArchivos();
        alertar({
          title: fallos === 0 ? "¡Subida completa!" : "Subida parcial",
          message: fallos === 0
            ? `${exitos} archivo(s) subidos correctamente.`
            : `Subidos ${exitos}, fallaron ${fallos}.`,
          variant: fallos === 0 ? "success" : "warning",
          icon: "🎵"
        });
      } catch (err) {
        alertar({ title: "Error", message: "Error guardando en la playlist: " + (err.message || err), variant: "danger" });
      } finally {
        btnSubirCanciones.disabled = false;
        btnSubirCanciones.textContent = "Subir todas";
        actualizarBotonSubir();
      }
    } catch (err) { console.warn("subir canciones:", err); }
  });

  window.AlbumApp.modules.playlists = {
    cargarPlaylists,
    renderPlaylists,
    abrirPlaylistModal,
    cerrarPlaylistModal,
    abrirCancionesModal,
    cerrarCancionesModal,
    renderCancionesLista,
    getPlaylists: () => playlists,
    setPlaylists: p => { playlists = p; },
    getPlaylistEditando: () => playlistEditando,
    setPlaylistEditando: id => { playlistEditando = id; }
  };
})();
