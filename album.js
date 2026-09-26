/* ============================================
   ÁLBUM + NOTAS + PLAYLISTS + CALENDARIO + PLAYER
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ============================================
  //  CONFIGURACIÓN SUPABASE
  // ============================================
  const SUPABASE_URL = "https://fsobpmulnvajwlrgkoxr.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2JwbXVsbnZhandscmdrb3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODMyOTgsImV4cCI6MjEwNTg1OTI5OH0.j7Q8Zv02QhXxC9v-7MS1ZWeZyd18dN0TKFrbEhDs96Y";
  const BUCKET_NAME = "album";
  const BUCKET_CANCIONES = "canciones";
  const URL_EXPIRY = 60 * 60;
  const URL_EXPIRY_CANCIONES = 60 * 60 * 4; // 4h: suficiente para una sesión larga

  if (typeof window.supabase === "undefined") {
    const ls = document.getElementById("loading-screen");
    if (ls) {
      ls.classList.remove("active");
      ls.setAttribute("aria-hidden", "true");
    }
    console.error("❌ Supabase no se pudo cargar. Revisa el CDN.");
    alert("No se pudo conectar con el servidor. Recarga la página.");
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window._supabase = supabase;

  // ============================================
  //  REFERENCIAS DOM
  // ============================================

  // ÁLBUM
  const grid = document.getElementById("album-grid");
  const empty = document.getElementById("album-empty");
  const btnAdd = document.getElementById("btn-add-photo");
  const modal = document.getElementById("photo-modal");
  const form = document.getElementById("photo-form");
  const inputPhoto = document.getElementById("input-photo");
  const inputDate = document.getElementById("input-date");
  const inputNote = document.getElementById("input-note");
  const preview = document.getElementById("photo-preview");
  const submitBtn = form?.querySelector('button[type="submit"]');

  // NOTAS
  const notasGrid = document.getElementById("notas-grid");
  const notasEmpty = document.getElementById("notas-empty");
  const btnAddNota = document.getElementById("btn-add-nota");
  const notaModal = document.getElementById("nota-modal");
  const notaForm = document.getElementById("nota-form");
  const notaTitulo = document.getElementById("nota-titulo");
  const notaContenido = document.getElementById("nota-contenido");
  const notaSubmitBtn = notaForm?.querySelector('button[type="submit"]');

  // PLAYLISTS
  const playlistsGrid = document.getElementById("playlists-grid");
  const playlistsEmpty = document.getElementById("playlists-empty");
  const btnAddPlaylist = document.getElementById("btn-add-playlist");
  const playlistModal = document.getElementById("playlist-modal");
  const playlistForm = document.getElementById("playlist-form");
  const playlistNombre = document.getElementById("playlist-nombre");
  const playlistDescripcion = document.getElementById("playlist-descripcion");
  const playlistSubmitBtn = playlistForm?.querySelector('button[type="submit"]');

  const cancionesModal = document.getElementById("canciones-modal");
  const cancionesModalTitle = document.getElementById("canciones-modal-title");
  const cancionesModalDesc = document.getElementById("canciones-modal-desc");
  const cancionesLista = document.getElementById("canciones-lista");
  const cancionForm = document.getElementById("cancion-form");
  const cancionTitulo = document.getElementById("cancion-titulo");
  const cancionArtista = document.getElementById("cancion-artista");
  const cancionUrl = document.getElementById("cancion-url");

  // CALENDARIO
  const calGrid = document.getElementById("cal-grid");
  const calMesActual = document.getElementById("cal-mes-actual");
  const calPrev = document.getElementById("cal-prev");
  const calNext = document.getElementById("cal-next");
  const calProximos = document.getElementById("cal-proximos");
  const calProximosVacio = document.getElementById("cal-proximos-vacio");
  const calendarioEmpty = document.getElementById("calendario-empty");
  const btnAddEvento = document.getElementById("btn-add-evento");
  const btnNotifPermiso = document.getElementById("btn-notif-permiso");

  const eventoModal = document.getElementById("evento-modal");
  const eventoForm = document.getElementById("evento-form");
  const eventoTitulo = document.getElementById("evento-titulo");
  const eventoDescripcion = document.getElementById("evento-descripcion");
  const eventoFecha = document.getElementById("evento-fecha");
  const eventoRecordatorio = document.getElementById("evento-recordatorio");
  const eventoRecurrente = document.getElementById("evento-recurrente");
  const eventoSubmitBtn = eventoForm?.querySelector('button[type="submit"]');

  // PLAYER
  const playerBar = document.getElementById("player-bar");
  const playerBarTitle = document.getElementById("player-bar-title");
  const playerBarArtist = document.getElementById("player-bar-artist");
  const playerCoverIcon = document.getElementById("player-cover-icon");
  const playerPlay = document.getElementById("player-play");
  const playerPrev = document.getElementById("player-prev");
  const playerNext = document.getElementById("player-next");
  const playerShuffle = document.getElementById("player-shuffle");
  const playerRepeat = document.getElementById("player-repeat");
  const playerSeek = document.getElementById("player-seek");
  const playerCurrent = document.getElementById("player-current");
  const playerDuration = document.getElementById("player-duration");
  const playerVolumeBtn = document.getElementById("player-volume-btn");
  const playerVolume = document.getElementById("player-volume");
  const playerClose = document.getElementById("player-close");
  const globalAudio = document.getElementById("global-audio");

  // CARGA
  const loadingScreen = document.getElementById("loading-screen");
  const loadingText = document.getElementById("loading-text");

  // LOGIN
  const authModal = document.getElementById("auth-modal");
  const btnOpenLogin = document.getElementById("btn-open-login");
  const authForm = document.getElementById("auth-form");
  const authUsername = document.getElementById("auth-username");
  const authPassword = document.getElementById("auth-password");
  const authPasswordConfirm = document.getElementById("auth-password-confirm");
  const confirmField = document.getElementById("confirm-password-field");
  const authSubmit = document.getElementById("auth-submit");
  const authTitle = document.getElementById("auth-title");
  const authSubtitle = document.getElementById("auth-subtitle");
  const authToggleText = document.getElementById("auth-toggle-text");
  const authToggleBtn = document.getElementById("auth-toggle-btn");
  const authError = document.getElementById("auth-error");
  const userInfo = document.getElementById("user-info");
  const userEmail = document.getElementById("user-email");
  const logoutBtn = document.getElementById("logout-btn");
  const userMenuToggle = document.getElementById("user-menu-toggle");
  const userDropdown = document.getElementById("user-dropdown");

  // ============================================
  //  ESTADO
  // ============================================
  let fotos = [];
  let notas = [];
  let colorSeleccionado = "amarillo";
  let modoRegistro = false;

  let playlists = [];
  let playlistEditando = null;
  let emojiSeleccionado = "🎵";
  let colorPlaylistSeleccionado = "amarillo";

  let eventos = [];
  let mesMostrado = new Date();
  mesMostrado.setDate(1);
  let colorEventoSeleccionado = "amarillo";

  let renderEnCurso = false;
  let renderPendiente = false;
  let subiendoFoto = false;
  let colaSesion = Promise.resolve();

  let archivosPendientes = [];

  // Player
  let colaReproduccion = [];        // array de { titulo, artista, url, playlistId }
  let indiceReproduccion = -1;
  let modoAleatorio = false;
  let modoRepetir = "off";           // 'off' | 'all' | 'one'
  let volumenActual = parseFloat(localStorage.getItem("player_volumen") || "0.8");
  let silenciadoAntes = false;
  let urlActualEsStorage = false;
  let cargandoCancion = false;

  // ============================================
  //  PANTALLA DE CARGA
  // ============================================
  function mostrarLoading(mensaje = "Cargando...") {
    if (!loadingScreen) return;
    if (loadingText) loadingText.textContent = mensaje;
    loadingScreen.classList.add("active");
    loadingScreen.setAttribute("aria-hidden", "false");
  }

  function ocultarLoading() {
    if (!loadingScreen) return;
    loadingScreen.classList.remove("active");
    loadingScreen.setAttribute("aria-hidden", "true");
  }

  // ============================================
  //  FOTOS
  // ============================================
  async function cargarFotos() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { fotos = []; return; }

    const { data, error } = await supabase
      .from("fotos").select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) { console.error("Error cargando fotos:", error); fotos = []; return; }

    fotos = (data || []).map((f) => ({
      id: f.id, path: f.path, fecha: f.fecha, nota: f.nota,
    }));
  }

  async function añadirFotoTabla(path, fecha, nota) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");

    const { data, error } = await supabase
      .from("fotos")
      .insert({ user_id: session.user.id, path, fecha: fecha || null, nota: nota || null })
      .select().single();

    if (error) throw error;
    return data;
  }

  async function eliminarFotoTabla(id) {
    const { error } = await supabase.from("fotos").delete().eq("id", id);
    if (error) throw error;
  }

  async function obtenerUrlFirmada(path) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME).createSignedUrl(path, URL_EXPIRY);

    if (error) { console.error("Error URL firmada:", path, error); return null; }
    return data.signedUrl;
  }

  function redimensionarImagen(file, maxSize = 1600) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("toBlob falló"))),
            "image/jpeg", 0.85
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function render() {
    if (!grid) return;
    if (renderEnCurso) { renderPendiente = true; return; }
    renderEnCurso = true;

    try {
      grid.innerHTML = "";

      if (fotos.length === 0) { empty?.classList.remove("hidden"); return; }
      empty?.classList.add("hidden");

      const promesas = fotos.map(async (foto) => {
        const url = await obtenerUrlFirmada(foto.path);
        if (!url) return null;
        return crearPolaroid(foto, url);
      });

      const elementos = await Promise.all(promesas);
      elementos.forEach((el) => { if (el) grid.appendChild(el); });
    } finally {
      renderEnCurso = false;
      if (renderPendiente) { renderPendiente = false; render(); }
    }
  }

  function crearPolaroid(foto, url) {
    const article = document.createElement("article");
    article.className = "polaroid";

    const btnDelete = document.createElement("button");
    btnDelete.className = "polaroid-delete";
    btnDelete.textContent = "×";
    btnDelete.title = "Eliminar";
    btnDelete.addEventListener("click", () => eliminarFoto(foto.id));

    const img = document.createElement("img");
    img.src = url;
    img.alt = foto.nota || "Recuerdo";
    img.loading = "lazy";

    const nota = document.createElement("div");
    nota.className = "polaroid-nota";

    if (foto.fecha) {
      const fecha = document.createElement("span");
      fecha.className = "polaroid-fecha";
      fecha.textContent = formatearFecha(foto.fecha);
      nota.appendChild(fecha);
    }

    if (foto.nota) {
      const p = document.createElement("p");
      p.textContent = foto.nota;
      nota.appendChild(p);
    }

    article.append(btnDelete, img, nota);
    return article;
  }

  function formatearFecha(iso) {
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return `${String(d.getDate()).padStart(2, "0")} · ${meses[d.getMonth()]} · ${d.getFullYear()}`;
  }

  function abrirModal() {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const hoy = new Date().toISOString().split("T")[0];
    form?.reset();
    if (inputDate) inputDate.value = hoy;
    if (preview) preview.innerHTML = "";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar recuerdo 💛";
    }
  }

  function cerrarModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (typeof decirMapache === "function") {
      decirMapache("¡Qué bonito recuerdo! 💛", 4000);
    }
  }

  if (btnAdd) btnAdd.addEventListener("click", abrirModal);
  modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", cerrarModal);
  });

  if (inputPhoto) {
    inputPhoto.addEventListener("change", () => {
      const file = inputPhoto.files[0];
      if (!preview) return;
      preview.innerHTML = "";
      if (!file) return;

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.classList.add("visible");
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (subiendoFoto) return;
      subiendoFoto = true;

      const file = inputPhoto?.files[0];
      if (!file) { alert("Selecciona una foto primero"); subiendoFoto = false; return; }

      const fecha = inputDate?.value || "";
      const nota = inputNote?.value.trim() || "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Subiendo...";
      }

      mostrarLoading("Guardando recuerdo...");

      try {
        const blob = await redimensionarImagen(file, 1600);
        const filePath = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME).upload(filePath, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;

        const nueva = await añadirFotoTabla(filePath, fecha, nota);
        fotos.unshift({ id: nueva.id, path: nueva.path, fecha: nueva.fecha, nota: nueva.nota });

        cerrarModal();
        await render();
      } catch (err) {
        console.error(err);
        alert("No se pudo subir la foto: " + (err.message || err));
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Guardar recuerdo 💛";
        }
      } finally {
        subiendoFoto = false;
        ocultarLoading();
      }
    });
  }

  async function eliminarFoto(id) {
    if (!confirm("¿Eliminar esta aventura del álbum?")) return;
    const foto = fotos.find((f) => f.id === id);
    if (!foto) return;

    try {
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME).remove([foto.path]);
      if (removeError) console.warn("No se pudo borrar del Storage:", removeError);

      await eliminarFotoTabla(foto.id);
      fotos = fotos.filter((f) => f.id !== id);
      await render();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar: " + (err.message || err));
    }
  }

  // ============================================
  //  NOTAS
  // ============================================
  async function cargarNotas() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) { notas = []; return; }

      const { data, error } = await supabase
        .from("notas").select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) { console.error("Error cargando notas:", error); notas = []; return; }

      notas = (data || []).map((n) => ({
        id: n.id, titulo: n.titulo, contenido: n.contenido,
        color: n.color || "amarillo", created_at: n.created_at,
      }));
    } catch (err) {
      console.error("💥 Error en cargarNotas:", err);
      notas = [];
    }
  }

  async function añadirNotaTabla(titulo, contenido, color) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");

    const { data, error } = await supabase
      .from("notas")
      .insert({
        user_id: session.user.id,
        titulo: titulo || null,
        contenido: contenido,
        color: color || "amarillo",
      })
      .select().single();

    if (error) throw error;
    return data;
  }

  async function eliminarNotaTabla(id) {
    const { error } = await supabase.from("notas").delete().eq("id", id);
    if (error) throw error;
  }

  function renderNotas() {
    if (!notasGrid) return;
    notasGrid.innerHTML = "";

    if (notas.length === 0) { notasEmpty?.classList.remove("hidden"); return; }
    notasEmpty?.classList.add("hidden");

    notas.forEach((nota) => notasGrid.appendChild(crearNotaPolaroid(nota)));
  }

  function crearNotaPolaroid(nota) {
    const article = document.createElement("article");
    article.className = "nota color-" + (nota.color || "amarillo");

    const btnDelete = document.createElement("button");
    btnDelete.className = "nota-delete";
    btnDelete.textContent = "×";
    btnDelete.title = "Eliminar";
    btnDelete.addEventListener("click", () => eliminarNota(nota.id));
    article.appendChild(btnDelete);

    if (nota.titulo) {
      const h3 = document.createElement("h3");
      h3.className = "nota-titulo";
      h3.textContent = nota.titulo;
      article.appendChild(h3);
    }

    const p = document.createElement("p");
    p.className = "nota-contenido";
    p.textContent = nota.contenido;
    article.appendChild(p);

    if (nota.created_at) {
      const fecha = document.createElement("span");
      fecha.className = "nota-fecha";
      fecha.textContent = formatearFechaNota(nota.created_at);
      article.appendChild(fecha);
    }

    return article;
  }

  function formatearFechaNota(iso) {
    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  function abrirNotaModal() {
    if (!notaModal) return;
    notaModal.classList.add("active");
    notaModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (notaForm) notaForm.reset();
    colorSeleccionado = "amarillo";
    document.querySelectorAll(".color-option").forEach((opt) => {
      opt.classList.toggle("activo", opt.dataset.color === "amarillo");
    });

    if (notaSubmitBtn) {
      notaSubmitBtn.disabled = false;
      notaSubmitBtn.textContent = "Guardar notita 💌";
    }

    setTimeout(() => notaTitulo?.focus(), 100);
  }

  function cerrarNotaModal() {
    if (!notaModal) return;
    notaModal.classList.remove("active");
    notaModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function eliminarNota(id) {
    if (!confirm("¿Eliminar esta notita?")) return;
    try {
      await eliminarNotaTabla(id);
      notas = notas.filter((n) => n.id !== id);
      renderNotas();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar: " + (err.message || err));
    }
  }

  if (btnAddNota) btnAddNota.addEventListener("click", abrirNotaModal);

  notaModal?.querySelectorAll("[data-close-nota-modal]").forEach((el) => {
    el.addEventListener("click", cerrarNotaModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && notaModal?.classList.contains("active")) cerrarNotaModal();
  });

  document.querySelectorAll(".color-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".color-option").forEach((o) => o.classList.remove("activo"));
      opt.classList.add("activo");
      colorSeleccionado = opt.dataset.color;
    });
  });

  if (notaForm) {
    notaForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = notaTitulo?.value.trim() || "";
      const contenido = notaContenido?.value.trim() || "";
      if (!contenido) { alert("Escribe algo en la notita"); return; }

      if (notaSubmitBtn) {
        notaSubmitBtn.disabled = true;
        notaSubmitBtn.textContent = "Guardando...";
      }

      try {
        const nueva = await añadirNotaTabla(titulo, contenido, colorSeleccionado);
        notas.unshift({
          id: nueva.id, titulo: nueva.titulo, contenido: nueva.contenido,
          color: nueva.color, created_at: nueva.created_at,
        });
        cerrarNotaModal();
        renderNotas();
      } catch (err) {
        console.error(err);
        alert("No se pudo guardar: " + (err.message || err));
        if (notaSubmitBtn) {
          notaSubmitBtn.disabled = false;
          notaSubmitBtn.textContent = "Guardar notita 💌";
        }
      }
    });
  }

  // ============================================
  //  PLAYLISTS
  // ============================================
  async function cargarPlaylists() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) { playlists = []; return; }

      const { data, error } = await supabase
        .from("playlists").select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) { console.error("Error cargando playlists:", error); playlists = []; return; }

      playlists = (data || []).map((p) => ({
        id: p.id, nombre: p.nombre, descripcion: p.descripcion,
        emoji: p.emoji || "🎵", color: p.color || "amarillo",
        canciones: Array.isArray(p.canciones) ? p.canciones : [],
        created_at: p.created_at,
      }));
    } catch (err) {
      console.error("💥 Error en cargarPlaylists:", err);
      playlists = [];
    }
  }

  async function añadirPlaylistTabla(nombre, descripcion, emoji, color) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: session.user.id,
        nombre, descripcion: descripcion || null,
        emoji: emoji || "🎵", color: color || "amarillo",
        canciones: [],
      })
      .select().single();

    if (error) throw error;
    return data;
  }

  async function eliminarPlaylistTabla(id) {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) throw error;
  }

  async function guardarCancionesTabla(id, canciones) {
    const { error } = await supabase.from("playlists").update({ canciones }).eq("id", id);
    if (error) throw error;
  }

  function renderPlaylists() {
    if (!playlistsGrid) return;
    playlistsGrid.innerHTML = "";

    if (playlists.length === 0) { playlistsEmpty?.classList.remove("hidden"); return; }
    playlistsEmpty?.classList.add("hidden");

    playlists.forEach((p) => playlistsGrid.appendChild(crearPlaylistCard(p)));
  }

  function crearPlaylistCard(playlist) {
    const article = document.createElement("article");
    article.className = "playlist-card color-" + (playlist.color || "amarillo");

    const btnDelete = document.createElement("button");
    btnDelete.className = "playlist-card-delete";
    btnDelete.textContent = "×";
    btnDelete.title = "Eliminar playlist";
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      eliminarPlaylist(playlist.id);
    });
    article.appendChild(btnDelete);

    const header = document.createElement("div");
    header.className = "playlist-card-header";

    const emoji = document.createElement("span");
    emoji.className = "playlist-card-emoji";
    emoji.textContent = playlist.emoji || "🎵";

    const info = document.createElement("div");
    info.className = "playlist-card-info";

    const nombre = document.createElement("span");
    nombre.className = "playlist-card-nombre";
    nombre.textContent = playlist.nombre;
    info.appendChild(nombre);

    if (playlist.descripcion) {
      const desc = document.createElement("span");
      desc.className = "playlist-card-desc";
      desc.textContent = playlist.descripcion;
      info.appendChild(desc);
    }

    header.append(emoji, info);
    article.appendChild(header);

    const n = playlist.canciones.length;
    const count = document.createElement("span");
    count.className = "playlist-card-count";
    count.textContent = n === 0 ? "Sin canciones" : n === 1 ? "1 canción" : `${n} canciones`;
    article.appendChild(count);

    if (n > 0) {
      const preview = document.createElement("div");
      preview.className = "playlist-card-preview";
      preview.textContent = playlist.canciones
        .slice(0, 3)
        .map((c) => c.titulo + (c.artista ? " · " + c.artista : ""))
        .join("\n");
      article.appendChild(preview);
    }

    article.addEventListener("click", () => abrirCancionesModal(playlist.id));
    return article;
  }

  function abrirPlaylistModal() {
    if (!playlistModal) return;
    playlistModal.classList.add("active");
    playlistModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (playlistForm) playlistForm.reset();
    emojiSeleccionado = "🎵";
    colorPlaylistSeleccionado = "amarillo";

    document.querySelectorAll("#emoji-picker .emoji-option").forEach((opt) => {
      opt.classList.toggle("activo", opt.dataset.emoji === "🎵");
    });
    document.querySelectorAll("#playlist-form .color-option").forEach((opt) => {
      opt.classList.toggle("activo", opt.dataset.color === "amarillo");
    });

    if (playlistSubmitBtn) {
      playlistSubmitBtn.disabled = false;
      playlistSubmitBtn.textContent = "Guardar playlist 🎵";
    }

    setTimeout(() => playlistNombre?.focus(), 100);
  }

  function cerrarPlaylistModal() {
    if (!playlistModal) return;
    playlistModal.classList.remove("active");
    playlistModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function eliminarPlaylist(id) {
    if (!confirm("¿Eliminar esta playlist?")) return;
    try {
      await eliminarPlaylistTabla(id);
      playlists = playlists.filter((p) => p.id !== id);
      renderPlaylists();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar: " + (err.message || err));
    }
  }

  function abrirCancionesModal(playlistId) {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || !cancionesModal) return;

    playlistEditando = playlistId;

    if (cancionesModalTitle) {
      cancionesModalTitle.textContent = `${playlist.emoji || "🎵"} ${playlist.nombre}`;
    }
    if (cancionesModalDesc) {
      cancionesModalDesc.textContent = playlist.descripcion || "";
    }

    renderCancionesLista();
    resetCancionTabs();

    cancionesModal.classList.add("active");
    cancionesModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setTimeout(() => cancionTitulo?.focus(), 100);
  }

  function cerrarCancionesModal() {
    if (!cancionesModal) return;
    cancionesModal.classList.remove("active");
    cancionesModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    playlistEditando = null;
  }

  function renderCancionesLista() {
    if (!cancionesLista) return;
    const playlist = playlists.find((p) => p.id === playlistEditando);
    cancionesLista.innerHTML = "";

    if (!playlist || playlist.canciones.length === 0) {
      const vacio = document.createElement("div");
      vacio.className = "canciones-lista-vacia";
      vacio.textContent = "Aún no hay canciones. ¡Añade la primera! 🎵";
      cancionesLista.appendChild(vacio);
      return;
    }

    playlist.canciones.forEach((cancion, index) => {
      cancionesLista.appendChild(crearCancionItem(cancion, index));
    });

    // Marcar la que está sonando
    actualizarEstadoReproduciendo();
  }

  function crearCancionItem(cancion, index) {
    const item = document.createElement("div");
    item.className = "cancion-item";
    item.dataset.index = index;

    const info = document.createElement("div");
    info.className = "cancion-item-info";

    const titulo = document.createElement("span");
    titulo.className = "cancion-item-titulo";
    titulo.textContent = cancion.titulo;
    info.appendChild(titulo);

    if (cancion.artista) {
      const artista = document.createElement("span");
      artista.className = "cancion-item-artista";
      artista.textContent = cancion.artista;
      info.appendChild(artista);
    }

    item.appendChild(info);

    if (cancion.url) {
      if (cancion.url.startsWith("storage:")) {
        const btnPlay = document.createElement("button");
        btnPlay.type = "button";
        btnPlay.className = "cancion-item-link";
        btnPlay.textContent = "▶";
        btnPlay.title = "Reproducir";
        btnPlay.addEventListener("click", () => {
          iniciarColaDesdePlaylist(playlistEditando, index);
        });
        item.appendChild(btnPlay);
      } else {
        const link = document.createElement("a");
        link.className = "cancion-item-link";
        link.href = cancion.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "↗";
        link.title = "Abrir enlace externo";
        item.appendChild(link);
      }
    }

    const btnDel = document.createElement("button");
    btnDel.className = "cancion-item-delete";
    btnDel.textContent = "×";
    btnDel.title = "Quitar canción";
    btnDel.addEventListener("click", () => eliminarCancion(index));
    item.appendChild(btnDel);

    return item;
  }

  async function eliminarCancion(index) {
    const playlist = playlists.find((p) => p.id === playlistEditando);
    if (!playlist) return;

    const cancion = playlist.canciones[index];

    if (cancion?.url?.startsWith("storage:")) {
      const path = cancion.url.replace(/^storage:/, "");
      try {
        await supabase.storage.from(BUCKET_CANCIONES).remove([path]);
      } catch (err) {
        console.warn("No se pudo borrar del storage:", err);
      }
    }

    const nuevas = playlist.canciones.filter((_, i) => i !== index);

    try {
      await guardarCancionesTabla(playlist.id, nuevas);
      playlist.canciones = nuevas;
      renderCancionesLista();
      renderPlaylists();
    } catch (err) {
      console.error(err);
      alert("No se pudo quitar la canción: " + (err.message || err));
    }
  }

  // Listeners PLAYLISTS
  if (btnAddPlaylist) btnAddPlaylist.addEventListener("click", abrirPlaylistModal);

  playlistModal?.querySelectorAll("[data-close-playlist-modal]").forEach((el) => {
    el.addEventListener("click", cerrarPlaylistModal);
  });

  cancionesModal?.querySelectorAll("[data-close-canciones-modal]").forEach((el) => {
    el.addEventListener("click", cerrarCancionesModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (cancionesModal?.classList.contains("active")) cerrarCancionesModal();
    else if (playlistModal?.classList.contains("active")) cerrarPlaylistModal();
  });

  document.querySelectorAll("#emoji-picker .emoji-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll("#emoji-picker .emoji-option").forEach((o) => o.classList.remove("activo"));
      opt.classList.add("activo");
      emojiSeleccionado = opt.dataset.emoji;
    });
  });

  document.querySelectorAll("#playlist-form .color-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll("#playlist-form .color-option").forEach((o) => o.classList.remove("activo"));
      opt.classList.add("activo");
      colorPlaylistSeleccionado = opt.dataset.color;
    });
  });

  if (playlistForm) {
    playlistForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = playlistNombre?.value.trim() || "";
      const descripcion = playlistDescripcion?.value.trim() || "";

      if (!nombre) { alert("Ponle un nombre a la playlist"); return; }

      if (playlistSubmitBtn) {
        playlistSubmitBtn.disabled = true;
        playlistSubmitBtn.textContent = "Guardando...";
      }

      try {
        const nueva = await añadirPlaylistTabla(nombre, descripcion, emojiSeleccionado, colorPlaylistSeleccionado);
        playlists.unshift({
          id: nueva.id, nombre: nueva.nombre, descripcion: nueva.descripcion,
          emoji: nueva.emoji, color: nueva.color, canciones: [],
          created_at: nueva.created_at,
        });
        cerrarPlaylistModal();
        renderPlaylists();
      } catch (err) {
        console.error(err);
        alert("No se pudo guardar: " + (err.message || err));
        if (playlistSubmitBtn) {
          playlistSubmitBtn.disabled = false;
          playlistSubmitBtn.textContent = "Guardar playlist 🎵";
        }
      }
    });
  }

  if (cancionForm) {
    cancionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const playlist = playlists.find((p) => p.id === playlistEditando);
      if (!playlist) return;

      const titulo = cancionTitulo?.value.trim() || "";
      const artista = cancionArtista?.value.trim() || "";
      const url = cancionUrl?.value.trim() || "";

      if (!titulo) { alert("Ponle un título a la canción"); return; }

      const nuevas = [...playlist.canciones, { titulo, artista, url }];

      try {
        await guardarCancionesTabla(playlist.id, nuevas);
        playlist.canciones = nuevas;
        renderCancionesLista();
        renderPlaylists();
        cancionForm.reset();
        cancionTitulo?.focus();
      } catch (err) {
        console.error(err);
        alert("No se pudo añadir: " + (err.message || err));
      }
    });
  }

  // ============================================
  //  CANCIONES — Pestañas + Importar + Subir
  // ============================================
  const cancionesPegarTexto = document.getElementById("cancion-pegar-texto");
  const cancionesPegarPreview = document.getElementById("cancion-pegar-preview");
  const btnImportarCanciones = document.getElementById("btn-importar-canciones");
  const cancionPegarArchivo = document.getElementById("cancion-pegar-archivo");
  const btnCargarArchivo = document.getElementById("btn-cargar-archivo");

  const cancionSubirArchivo = document.getElementById("cancion-subir-archivo");
  const btnSeleccionarArchivos = document.getElementById("btn-seleccionar-archivos");
  const cancionSubirDropzone = document.getElementById("cancion-subir-dropzone");
  const cancionSubirLista = document.getElementById("cancion-subir-lista");
  const btnSubirCanciones = document.getElementById("btn-subir-canciones");

  document.querySelectorAll(".cancion-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const nombre = tab.dataset.tab;
      document.querySelectorAll(".cancion-tab").forEach((t) => t.classList.toggle("active", t === tab));
      document.querySelectorAll(".cancion-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === nombre));
    });
  });

  function resetCancionTabs() {
    document.querySelectorAll(".cancion-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === "una");
    });
    document.querySelectorAll(".cancion-panel").forEach((p) => {
      p.classList.toggle("active", p.dataset.panel === "una");
    });
    if (cancionesPegarTexto) cancionesPegarTexto.value = "";
    if (cancionesPegarPreview) {
      cancionesPegarPreview.classList.remove("visible");
      cancionesPegarPreview.innerHTML = "";
    }
    const radioDefault = document.querySelector('input[name="pegar-orden"][value="titulo-artista"]');
    if (radioDefault) radioDefault.checked = true;

    const inputArchivoPegar = document.getElementById("cancion-pegar-archivo");
    if (inputArchivoPegar) inputArchivoPegar.value = "";

    archivosPendientes = archivosPendientes.filter((a) => a.estado === "uploading");
    renderColaArchivos();
    actualizarBotonSubir();
  }

  function parsearListaCanciones(texto, orden) {
    const lineas = (texto || "").split(/\r?\n/);
    const resultado = [];
    const separadores = [" - ", " – ", " — ", " | ", "\t"];

    for (let raw of lineas) {
      let linea = raw.trim();
      if (!linea) continue;
      if (/^#EXT/i.test(linea)) continue;
      if (/^[A-Za-z]:\\/.test(linea) || /^\/Users\//.test(linea) || /^\/(home|mnt|media)\//.test(linea)) continue;
      if (/^(playlist|canciones|songs|tracklist|mi playlist|lista)\s*:?\s*$/i.test(linea)) continue;

      linea = linea.replace(/^(?:#\d+|\d+\s*[\.\)\-:]\s*)/, "");
      linea = linea.replace(/^[•·*\-–—]\s*/, "");
      if (!linea) continue;

      if (/^https?:\/\/\S+$/i.test(linea)) {
        resultado.push({ titulo: "Canción", artista: "", url: linea });
        continue;
      }

      let url = "";
      const urlMatch = linea.match(/\s*[\(\[]?(https?:\/\/[^\s\)\]]+)[\)\]]?\s*$/i);
      if (urlMatch) {
        url = urlMatch[1];
        linea = linea.replace(urlMatch[0], "").trim();
      }

      let sepEncontrado = null;
      for (const s of separadores) {
        if (linea.includes(s)) { sepEncontrado = s; break; }
      }

      if (sepEncontrado) {
        const partes = linea.split(sepEncontrado).map((p) => p.trim()).filter(Boolean);
        if (partes.length >= 2) {
          let titulo, artista;
          if (orden === "artista-titulo") {
            artista = partes[0];
            titulo = partes.slice(1).join(" - ");
          } else {
            titulo = partes[0];
            artista = partes.slice(1).join(" - ");
          }
          resultado.push({ titulo, artista, url });
          continue;
        }
      }

      resultado.push({ titulo: linea, artista: "", url });
    }

    return resultado;
  }

  function ordenSeleccionado() {
    const r = document.querySelector('input[name="pegar-orden"]:checked');
    return r?.value || "titulo-artista";
  }

  function actualizarPreviewPegar() {
    if (!cancionesPegarPreview || !cancionesPegarTexto) return;
    const canciones = parsearListaCanciones(cancionesPegarTexto.value, ordenSeleccionado());

    cancionesPegarPreview.innerHTML = "";
    if (canciones.length === 0) { cancionesPegarPreview.classList.remove("visible"); return; }
    cancionesPegarPreview.classList.add("visible");

    const cab = document.createElement("span");
    cab.className = "cancion-pegar-preview-num";
    cab.textContent = `${canciones.length} canción${canciones.length === 1 ? "" : "es"} detectada${canciones.length === 1 ? "" : "s"}`;
    cancionesPegarPreview.appendChild(cab);

    canciones.slice(0, 5).forEach((c) => {
      const item = document.createElement("div");
      item.className = "cancion-pegar-preview-item";
      item.textContent = "• " + c.titulo + (c.artista ? " — " + c.artista : "") + (c.url ? "  🔗" : "");
      cancionesPegarPreview.appendChild(item);
    });

    if (canciones.length > 5) {
      const mas = document.createElement("div");
      mas.className = "cancion-pegar-preview-item";
      mas.style.opacity = "0.5";
      mas.textContent = `… y ${canciones.length - 5} más`;
      cancionesPegarPreview.appendChild(mas);
    }
  }

  cancionesPegarTexto?.addEventListener("input", actualizarPreviewPegar);

  document.querySelectorAll('input[name="pegar-orden"]').forEach((radio) => {
    radio.addEventListener("change", actualizarPreviewPegar);
  });

  if (btnImportarCanciones) {
    btnImportarCanciones.addEventListener("click", async () => {
      const playlist = playlists.find((p) => p.id === playlistEditando);
      if (!playlist) return;

      const cancionesNuevas = parsearListaCanciones(cancionesPegarTexto.value, ordenSeleccionado());
      if (cancionesNuevas.length === 0) { alert("No se detectaron canciones."); return; }
      if (!confirm(`¿Importar ${cancionesNuevas.length} canciones a "${playlist.nombre}"?`)) return;

      btnImportarCanciones.disabled = true;
      btnImportarCanciones.textContent = "Importando...";

      try {
        const actualizadas = [...playlist.canciones, ...cancionesNuevas];
        await guardarCancionesTabla(playlist.id, actualizadas);
        playlist.canciones = actualizadas;
        renderCancionesLista();
        renderPlaylists();
        resetCancionTabs();
      } catch (err) {
        console.error(err);
        alert("No se pudo importar: " + (err.message || err));
      } finally {
        btnImportarCanciones.disabled = false;
        btnImportarCanciones.textContent = "📥 Importar todas";
      }
    });
  }

  if (btnCargarArchivo && cancionPegarArchivo) {
    btnCargarArchivo.addEventListener("click", () => cancionPegarArchivo.click());

    cancionPegarArchivo.addEventListener("change", async () => {
      const archivos = Array.from(cancionPegarArchivo.files || []);
      if (archivos.length === 0) return;

      const textos = [];
      const nombres = [];

      for (const archivo of archivos) {
        try {
          const contenido = await leerArchivoTexto(archivo);
          textos.push(contenido);
          nombres.push(`${archivo.name} (${(archivo.size / 1024).toFixed(1)} KB)`);
        } catch (err) {
          console.warn("No se pudo leer:", archivo.name, err);
        }
      }

      aplicarArchivosCargados(textos, nombres);
      cancionPegarArchivo.value = "";
    });
  }

  function leerArchivoTexto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = reject;
      reader.readAsText(file, "UTF-8");
    });
  }

  function aplicarArchivosCargados(textos, nombres) {
    if (!cancionesPegarTexto) return;
    const textoCompleto = textos.filter(Boolean).join("\n");
    if (!textoCompleto.trim()) { alert("Los archivos estaban vacíos."); return; }

    const yaHayTexto = cancionesPegarTexto.value.trim().length > 0;
    let contenidoFinal;

    if (yaHayTexto) {
      const añadir = confirm(`Ya hay texto. ¿AÑADIR los ${nombres.length} archivo(s)? (Cancelar = reemplazar)`);
      contenidoFinal = añadir
        ? cancionesPegarTexto.value.trimEnd() + "\n" + textoCompleto
        : textoCompleto;
    } else {
      contenidoFinal = textoCompleto;
    }

    cancionesPegarTexto.value = contenidoFinal;
    actualizarPreviewPegar();
    mostrarInfoArchivosTexto(nombres);
  }

  function mostrarInfoArchivosTexto(nombres) {
    if (!cancionesPegarPreview) return;
    const anterior = cancionesPegarPreview.querySelector(".cancion-pegar-archivos");
    if (anterior) anterior.remove();

    const info = document.createElement("div");
    info.className = "cancion-pegar-archivos";

    const titulo = document.createElement("span");
    titulo.className = "cancion-pegar-archivos-titulo";
    titulo.textContent = `📁 ${nombres.length} archivo${nombres.length === 1 ? "" : "s"} cargado${nombres.length === 1 ? "" : "s"}:`;
    info.appendChild(titulo);

    nombres.forEach((n) => {
      const span = document.createElement("span");
      span.className = "cancion-pegar-archivo-nombre";
      span.textContent = "• " + n;
      info.appendChild(span);
    });

    cancionesPegarPreview.insertBefore(info, cancionesPegarPreview.firstChild);
  }

  if (cancionesPegarTexto) {
    ["dragenter", "dragover"].forEach((evt) => {
      cancionesPegarTexto.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        cancionesPegarTexto.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      cancionesPegarTexto.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        if (evt === "dragleave" && e.relatedTarget && cancionesPegarTexto.contains(e.relatedTarget)) return;
        cancionesPegarTexto.classList.remove("drag-over");
      });
    });

    cancionesPegarTexto.addEventListener("drop", async (e) => {
      const archivos = Array.from(e.dataTransfer?.files || []);
      if (archivos.length === 0) return;

      const textos = [];
      const nombres = [];

      for (const archivo of archivos) {
        const ok = /\.(txt|csv|m3u|m3u8)$/i.test(archivo.name) || archivo.type.startsWith("text/");
        if (!ok) { console.warn("Formato no soportado:", archivo.name); continue; }

        try {
          const contenido = await leerArchivoTexto(archivo);
          textos.push(contenido);
          nombres.push(`${archivo.name} (${(archivo.size / 1024).toFixed(1)} KB)`);
        } catch (err) {
          console.warn("No se pudo leer:", archivo.name, err);
        }
      }

      if (textos.length === 0) { alert("Formatos aceptados: .txt, .csv, .m3u, .m3u8"); return; }
      aplicarArchivosCargados(textos, nombres);
    });
  }

  // ============================================
  //  SUBIR ARCHIVOS (audio/video)
  // ============================================
  const AUDIO_EXTS = ["mp3", "m4a", "wav", "ogg", "flac", "aac", "opus"];
  const VIDEO_EXTS = ["mp4", "webm", "mov", "mkv"];

  function extensionDe(nombre) {
    return (nombre.split(".").pop() || "").toLowerCase();
  }

  function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function iconoArchivo(nombre) {
    const ext = extensionDe(nombre);
    if (AUDIO_EXTS.includes(ext)) return "🎵";
    if (VIDEO_EXTS.includes(ext)) return "🎬";
    return "📄";
  }

  function tituloDesdeArchivo(nombre) {
    let base = nombre.replace(/\.[^.]+$/, "");
    const sep = [" - ", " – ", " — "].find((s) => base.includes(s));
    if (sep) {
      const partes = base.split(sep).map((p) => p.trim()).filter(Boolean);
      return { titulo: partes[0] || base, artista: partes.slice(1).join(" - ") || "" };
    }
    return { titulo: base, artista: "" };
  }

  function agregarArchivosACola(files) {
    if (!files || files.length === 0) return;

    for (const f of Array.from(files)) {
      const yaEsta = archivosPendientes.some((p) => p.file.name === f.name && p.file.size === f.size);
      if (yaEsta) continue;

      const ext = extensionDe(f.name);
      if (!AUDIO_EXTS.includes(ext) && !VIDEO_EXTS.includes(ext)) {
        console.warn("Formato no soportado:", f.name);
        continue;
      }

      archivosPendientes.push({
        file: f,
        id: Math.random().toString(36).slice(2),
        estado: "pending",
      });
    }

    renderColaArchivos();
    actualizarBotonSubir();
  }

  function renderColaArchivos() {
    if (!cancionSubirLista) return;
    cancionSubirLista.innerHTML = "";
    if (archivosPendientes.length === 0) return;

    archivosPendientes.forEach((item) => {
      const el = document.createElement("div");
      el.className = "cancion-subir-item";

      const icon = document.createElement("span");
      icon.className = "cancion-subir-item-icon";
      icon.textContent = iconoArchivo(item.file.name);

      const info = document.createElement("div");
      info.className = "cancion-subir-item-info";

      const nombre = document.createElement("span");
      nombre.className = "cancion-subir-item-nombre";
      nombre.textContent = item.file.name;
      info.appendChild(nombre);

      const size = document.createElement("span");
      size.className = "cancion-subir-item-size";
      size.textContent = formatearTamano(item.file.size);
      info.appendChild(size);

      const status = document.createElement("span");
      status.className = "cancion-subir-item-status " + item.estado;
      const textos = { pending: "Pendiente", uploading: "Subiendo...", done: "✓ Listo", error: "Error" };
      status.textContent = textos[item.estado] || item.estado;

      const btnRemove = document.createElement("button");
      btnRemove.type = "button";
      btnRemove.className = "cancion-subir-item-remove";
      btnRemove.textContent = "×";
      btnRemove.title = "Quitar de la cola";
      btnRemove.addEventListener("click", () => {
        archivosPendientes = archivosPendientes.filter((x) => x.id !== item.id);
        renderColaArchivos();
        actualizarBotonSubir();
      });

      el.append(icon, info, status, btnRemove);
      cancionSubirLista.appendChild(el);
    });
  }

  function actualizarBotonSubir() {
    if (!btnSubirCanciones) return;
    const hayPendientes = archivosPendientes.some((a) => a.estado === "pending");
    btnSubirCanciones.disabled = !hayPendientes;
  }

  if (btnSeleccionarArchivos && cancionSubirArchivo) {
    btnSeleccionarArchivos.addEventListener("click", () => cancionSubirArchivo.click());

    cancionSubirArchivo.addEventListener("change", () => {
      agregarArchivosACola(cancionSubirArchivo.files);
      cancionSubirArchivo.value = "";
    });
  }

  if (cancionSubirDropzone) {
    ["dragenter", "dragover"].forEach((evt) => {
      cancionSubirDropzone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        cancionSubirDropzone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      cancionSubirDropzone.addEventListener(evt, (e) => {
        e.preventDefault(); e.stopPropagation();
        if (evt === "dragleave" && e.relatedTarget && cancionSubirDropzone.contains(e.relatedTarget)) return;
        cancionSubirDropzone.classList.remove("drag-over");
      });
    });

    cancionSubirDropzone.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) agregarArchivosACola(files);
    });
  }

  async function subirArchivoACanciones(item, userId) {
    const file = item.file;
    const ext = extensionDe(file.name) || "bin";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_CANCIONES)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) throw error;
    return path;
  }

  if (btnSubirCanciones) {
    btnSubirCanciones.addEventListener("click", async () => {
      const playlist = playlists.find((p) => p.id === playlistEditando);
      if (!playlist) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { alert("No hay sesión"); return; }

      const pendientes = archivosPendientes.filter((a) => a.estado === "pending");
      if (pendientes.length === 0) return;
      if (!confirm(`¿Subir ${pendientes.length} archivo(s) a "${playlist.nombre}"?`)) return;

      btnSubirCanciones.disabled = true;
      btnSubirCanciones.textContent = "Subiendo...";

      const cancionesNuevas = [];
      let exitos = 0, fallos = 0;

      for (const item of pendientes) {
        item.estado = "uploading";
        renderColaArchivos();

        try {
          const path = await subirArchivoACanciones(item, session.user.id);
          const meta = tituloDesdeArchivo(item.file.name);
          cancionesNuevas.push({ titulo: meta.titulo, artista: meta.artista, url: "storage:" + path });
          item.estado = "done";
          exitos++;
        } catch (err) {
          console.error("Error subiendo", item.file.name, err);
          item.estado = "error";
          fallos++;
        }

        renderColaArchivos();
      }

      try {
        if (cancionesNuevas.length > 0) {
          const actualizadas = [...playlist.canciones, ...cancionesNuevas];
          await guardarCancionesTabla(playlist.id, actualizadas);
          playlist.canciones = actualizadas;
          renderCancionesLista();
          renderPlaylists();
        }

        archivosPendientes = archivosPendientes.filter((a) => a.estado !== "done");
        renderColaArchivos();

        if (fallos === 0) alert(`✅ ${exitos} archivo(s) subido(s) correctamente`);
        else alert(`Subidos ${exitos}, fallaron ${fallos}. Revisa la consola.`);
      } catch (err) {
        console.error(err);
        alert("Error guardando en la playlist: " + (err.message || err));
      } finally {
        btnSubirCanciones.disabled = false;
        btnSubirCanciones.textContent = "⬆️ Subir todas";
        actualizarBotonSubir();
      }
    });
  }

  // ============================================
  //  PLAYER GLOBAL
  // ============================================

  function formatearTiempo(seg) {
    if (!isFinite(seg) || seg < 0) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function mostrarPlayerBar() {
    if (!playerBar) return;
    playerBar.classList.add("visible");
    playerBar.setAttribute("aria-hidden", "false");
    document.body.classList.add("player-abierto");
  }

  function ocultarPlayerBar() {
    if (!playerBar) return;
    playerBar.classList.remove("visible");
    playerBar.setAttribute("aria-hidden", "true");
    document.body.classList.remove("player-abierto");
  }

  // Volume inicial
  if (globalAudio) {
    globalAudio.volume = volumenActual;
    if (playerVolume) playerVolume.value = volumenActual;
    actualizarIconoVolumen();
  }

  function actualizarIconoVolumen() {
    if (!playerVolumeBtn) return;
    if (globalAudio.muted || volumenActual === 0) playerVolumeBtn.textContent = "🔇";
    else if (volumenActual < 0.4) playerVolumeBtn.textContent = "🔉";
    else playerVolumeBtn.textContent = "🔊";
  }

  // ---------- Cola de reproducción ----------
  function iniciarColaDesdePlaylist(playlistId, indiceInicial) {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    // Solo canciones con storage:
    const indexOriginal = indiceInicial;
    const cancionOriginal = playlist.canciones[indexOriginal];
    if (!cancionOriginal?.url?.startsWith("storage:")) return;

    colaReproduccion = [];
    let idxEnCola = -1;

    playlist.canciones.forEach((c, i) => {
      if (c.url?.startsWith("storage:")) {
        colaReproduccion.push({
          titulo: c.titulo,
          artista: c.artista || "",
          url: c.url,
          playlistId,
        });
        if (i === indexOriginal) idxEnCola = colaReproduccion.length - 1;
      }
    });

    if (idxEnCola < 0) return;

    indiceReproduccion = idxEnCola;
    reproducirIndiceActual();
  }

  async function reproducirIndiceActual(seekTo = 0) {
    if (!globalAudio) return;
    if (indiceReproduccion < 0 || indiceReproduccion >= colaReproduccion.length) {
      pausarReproduccion();
      return;
    }

    const item = colaReproduccion[indiceReproduccion];
    if (!item?.url?.startsWith("storage:")) return;

    const path = item.url.replace(/^storage:/, "");
    urlActualEsStorage = true;
    cargandoCancion = true;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_CANCIONES)
        .createSignedUrl(path, URL_EXPIRY_CANCIONES);

      if (error || !data?.signedUrl) throw error || new Error("Sin URL firmada");

      globalAudio.src = data.signedUrl;
      globalAudio.currentTime = 0;

      // Actualizar UI
      if (playerBarTitle) playerBarTitle.textContent = item.titulo;
      if (playerBarArtist) playerBarArtist.textContent = item.artista || "";
      if (playerCoverIcon) {
        const ext = extensionDe(path);
        playerCoverIcon.textContent = VIDEO_EXTS.includes(ext) ? "🎬" : "🎵";
      }

      mostrarPlayerBar();
      actualizarEstadoReproduciendo();

      // Reproducir
      try {
        await globalAudio.play();
        reproduciendo = true;
        actualizarBotonPlay();
        actualizarMediaSession(item);
      } catch (err) {
        // Autoplay bloqueado por el navegador → dejamos el botón listo para que el usuario pulse
        console.warn("Autoplay bloqueado:", err);
        reproduciendo = false;
        actualizarBotonPlay();
      }
    } catch (err) {
      console.error("Error preparando reproducción:", err);
      // Saltar a la siguiente si falla
      setTimeout(() => siguienteCancion(true), 500);
    } finally {
      cargandoCancion = false;
    }
  }

  let reproduciendo = false;

  function actualizarBotonPlay() {
    if (!playerPlay) return;
    playerPlay.textContent = reproduciendo ? "⏸" : "▶";
    playerPlay.title = reproduciendo ? "Pausar" : "Reproducir";
    playerPlay.setAttribute("aria-label", reproduciendo ? "Pausar" : "Reproducir");
  }

  function pausarReproduccion() {
    if (!globalAudio) return;
    globalAudio.pause();
    reproduciendo = false;
    actualizarBotonPlay();
  }

  function reanudarReproduccion() {
    if (!globalAudio) return;
    if (!globalAudio.src) return;
    globalAudio.play().then(() => {
      reproduciendo = true;
      actualizarBotonPlay();
    }).catch((err) => {
      console.warn("No se pudo reproducir:", err);
    });
  }

  function siguienteCancion(autoplay = true) {
    if (colaReproduccion.length === 0) return;

    if (modoRepetir === "one") {
      reproducirIndiceActual();
      return;
    }

    if (modoAleatorio) {
      let nuevoIdx;
      if (colaReproduccion.length === 1) nuevoIdx = 0;
      else {
        do { nuevoIdx = Math.floor(Math.random() * colaReproduccion.length); }
        while (nuevoIdx === indiceReproduccion);
      }
      indiceReproduccion = nuevoIdx;
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
  }

  function anteriorCancion() {
    if (colaReproduccion.length === 0) return;
    if (globalAudio && globalAudio.currentTime > 3) {
      globalAudio.currentTime = 0;
      return;
    }

    if (modoAleatorio) {
      siguienteCancion();
      return;
    }

    indiceReproduccion--;
    if (indiceReproduccion < 0) indiceReproduccion = colaReproduccion.length - 1;
    reproducirIndiceActual();
  }

  // ---------- Controles ----------
  playerPlay?.addEventListener("click", () => {
    if (reproduciendo) pausarReproduccion();
    else reanudarReproduccion();
  });

  playerNext?.addEventListener("click", () => siguienteCancion(true));
  playerPrev?.addEventListener("click", anteriorCancion);

  playerShuffle?.addEventListener("click", () => {
    modoAleatorio = !modoAleatorio;
    playerShuffle.classList.toggle("activo", modoAleatorio);
  });

  playerRepeat?.addEventListener("click", () => {
    if (modoRepetir === "off") modoRepetir = "all";
    else if (modoRepetir === "all") modoRepetir = "one";
    else modoRepetir = "off";

    playerRepeat.classList.toggle("activo", modoRepetir !== "off");
    playerRepeat.textContent = modoRepetir === "one" ? "🔂" : "🔁";
    playerRepeat.title = modoRepetir === "one" ? "Repetir una" : modoRepetir === "all" ? "Repetir todas" : "Repetir";
  });

  playerClose?.addEventListener("click", () => {
    pausarReproduccion();
    if (globalAudio) {
      globalAudio.src = "";
      globalAudio.currentTime = 0;
    }
    colaReproduccion = [];
    indiceReproduccion = -1;
    ocultarPlayerBar();
    actualizarEstadoReproduciendo();
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
    if (playerVolume) playerVolume.value = globalAudio.volume;
  });

  playerVolume?.addEventListener("input", () => {
    if (!globalAudio) return;
    const v = parseFloat(playerVolume.value);
    volumenActual = v;
    globalAudio.volume = v;
    globalAudio.muted = v === 0;
    localStorage.setItem("player_volumen", String(v));
    actualizarIconoVolumen();
  });

  // ---------- Eventos del <audio> ----------
  globalAudio?.addEventListener("play", () => {
    reproduciendo = true;
    actualizarBotonPlay();
  });

  globalAudio?.addEventListener("pause", () => {
    reproduciendo = false;
    actualizarBotonPlay();
  });

  globalAudio?.addEventListener("timeupdate", () => {
    if (!globalAudio) return;
    const ct = globalAudio.currentTime || 0;
    const dur = globalAudio.duration || 0;

    if (playerCurrent) playerCurrent.textContent = formatearTiempo(ct);
    if (playerDuration) playerDuration.textContent = formatearTiempo(dur);

    if (playerSeek && dur > 0) {
      playerSeek.max = 100;
      playerSeek.value = (ct / dur) * 100;
    }
  });

  globalAudio?.addEventListener("loadedmetadata", () => {
    if (playerDuration) playerDuration.textContent = formatearTiempo(globalAudio.duration || 0);
  });

  globalAudio?.addEventListener("ended", () => {
    siguienteCancion(true);
  });

  globalAudio?.addEventListener("error", () => {
    console.warn("Error reproduciendo, saltando a la siguiente");
    setTimeout(() => siguienteCancion(true), 300);
  });

  playerSeek?.addEventListener("input", () => {
    if (!globalAudio || !isFinite(globalAudio.duration)) return;
    const pct = parseFloat(playerSeek.value);
    globalAudio.currentTime = (pct / 100) * globalAudio.duration;
  });

  // Marcar el item activo en la lista
  function actualizarEstadoReproduciendo() {
    const actual = colaReproduccion[indiceReproduccion];
    const items = cancionesLista?.querySelectorAll(".cancion-item");
    if (!items) return;

    items.forEach((item) => {
      item.classList.remove("reproduciendo");
    });

    if (!actual) return;
    const playlist = playlists.find((p) => p.id === playlistEditando);
    if (!playlist) return;

    const idx = playlist.canciones.findIndex(
      (c) => c.url === actual.url && c.titulo === actual.titulo
    );
    if (idx >= 0 && items[idx]) items[idx].classList.add("reproduciendo");
  }

  // ============================================
  //  MEDIA SESSION API (para pantalla de bloqueo)
  // ============================================
  function actualizarMediaSession(item) {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.titulo || "Sin título",
        artist: item.artista || "Four Sunflowers",
        album: "Nuestras playlists",
        artwork: [
          { src: "img/girasol.jpg", sizes: "512x512", type: "image/jpeg" },
          { src: "img/girasol.jpg", sizes: "192x192", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => reanudarReproduccion());
      navigator.mediaSession.setActionHandler("pause", () => pausarReproduccion());
      navigator.mediaSession.setActionHandler("previoustrack", () => anteriorCancion());
      navigator.mediaSession.setActionHandler("nexttrack", () => siguienteCancion(true));
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const offset = details.seekOffset || 10;
        if (globalAudio) globalAudio.currentTime = Math.max(0, globalAudio.currentTime - offset);
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const offset = details.seekOffset || 10;
        if (globalAudio) globalAudio.currentTime = Math.min(globalAudio.duration || 0, globalAudio.currentTime + offset);
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.fastSeek && "fastSeek" in globalAudio) globalAudio.fastSeek(details.seekTime);
        else globalAudio.currentTime = details.seekTime;
      });
    } catch (err) {
      console.warn("Media Session error:", err);
    }
  }

  // Sincronizar el estado de la sesión
  globalAudio?.addEventListener("play", () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
  });
  globalAudio?.addEventListener("pause", () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
  });

  // ============================================
  //  CALENDARIO
  // ============================================
  const MESES_LARGOS = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  function fechaISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dia}`;
  }

  function hoyISO() { return fechaISO(new Date()); }

  async function cargarEventos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) { eventos = []; return; }

      const { data, error } = await supabase
        .from("eventos").select("*")
        .eq("user_id", session.user.id)
        .order("fecha", { ascending: true });

      if (error) { console.error("Error cargando eventos:", error); eventos = []; return; }

      eventos = (data || []).map((e) => ({
        id: e.id, titulo: e.titulo, descripcion: e.descripcion, fecha: e.fecha,
        color: e.color || "amarillo",
        recordatorio_dias: e.recordatorio_dias ?? 1,
        recurrente: !!e.recurrente,
      }));
    } catch (err) {
      console.error("💥 Error en cargarEventos:", err);
      eventos = [];
    }
  }

  async function añadirEventoTabla(titulo, descripcion, fecha, color, recordatorio, recurrente) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");

    const { data, error } = await supabase
      .from("eventos")
      .insert({
        user_id: session.user.id, titulo,
        descripcion: descripcion || null, fecha,
        color: color || "amarillo",
        recordatorio_dias: recordatorio, recurrente,
      })
      .select().single();

    if (error) throw error;
    return data;
  }

  async function eliminarEventoTabla(id) {
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) throw error;
  }

  function renderCalendario() {
    if (!calGrid) return;

    if (calMesActual) {
      calMesActual.textContent = `${MESES_LARGOS[mesMostrado.getMonth()]} ${mesMostrado.getFullYear()}`;
    }

    calGrid.innerHTML = "";

    const año = mesMostrado.getFullYear();
    const mes = mesMostrado.getMonth();

    const primerDia = new Date(año, mes, 1);
    let offset = primerDia.getDay() - 1;
    if (offset < 0) offset = 6;

    const ultimoDiaMes = new Date(año, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    const totalCeldas = Math.ceil((offset + ultimoDiaMes) / 7) * 7;
    const hoy = hoyISO();

    for (let i = 0; i < totalCeldas; i++) {
      const celda = document.createElement("button");
      celda.type = "button";
      celda.className = "cal-dia";

      let numeroDia, fechaCelda;

      if (i < offset) {
        numeroDia = diasMesAnterior - offset + i + 1;
        fechaCelda = new Date(año, mes - 1, numeroDia);
        celda.classList.add("otro-mes");
      } else if (i >= offset + ultimoDiaMes) {
        numeroDia = i - offset - ultimoDiaMes + 1;
        fechaCelda = new Date(año, mes + 1, numeroDia);
        celda.classList.add("otro-mes");
      } else {
        numeroDia = i - offset + 1;
        fechaCelda = new Date(año, mes, numeroDia);
      }

      const isoCelda = fechaISO(fechaCelda);
      if (isoCelda === hoy) celda.classList.add("hoy");

      const num = document.createElement("span");
      num.className = "cal-dia-numero";
      num.textContent = numeroDia;
      celda.appendChild(num);

      const evsDelDia = eventosDelDia(isoCelda);
      if (evsDelDia.length > 0) {
        const dots = document.createElement("div");
        dots.className = "cal-dia-eventos";
        evsDelDia.slice(0, 4).forEach((ev) => {
          const dot = document.createElement("span");
          dot.className = `cal-evento-punto color-${ev.color}`;
          dots.appendChild(dot);
        });
        celda.appendChild(dots);
      }

      celda.addEventListener("click", () => abrirEventoModal(isoCelda));
      calGrid.appendChild(celda);
    }

    renderProximos();
    actualizarEmptyCalendario();
  }

  function eventosDelDia(isoFecha) {
    return eventos.filter((ev) => {
      if (!ev.recurrente) return ev.fecha === isoFecha;
      const [, mesEv, diaEv] = ev.fecha.split("-");
      const [, mesIso, diaIso] = isoFecha.split("-");
      return mesEv === mesIso && diaEv === diaIso;
    });
  }

  function proximaFechaEvento(ev) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = ev.fecha.split("-").map(Number);
    let fecha = new Date(y, m - 1, d);

    if (ev.recurrente) {
      const esteAno = new Date(hoy.getFullYear(), m - 1, d);
      fecha = esteAno < hoy ? new Date(hoy.getFullYear() + 1, m - 1, d) : esteAno;
    }

    return fecha;
  }

  function diasHasta(fecha) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return Math.round((f - hoy) / (1000 * 60 * 60 * 24));
  }

  function renderProximos() {
    if (!calProximos) return;
    calProximos.innerHTML = "";

    const conFecha = eventos
      .map((ev) => ({ ev, proxima: proximaFechaEvento(ev) }))
      .filter(({ proxima }) => diasHasta(proxima) >= 0)
      .sort((a, b) => a.proxima - b.proxima)
      .slice(0, 8);

    if (conFecha.length === 0) { calProximosVacio?.classList.remove("hidden"); return; }
    calProximosVacio?.classList.add("hidden");

    conFecha.forEach(({ ev, proxima }) => {
      calProximos.appendChild(crearItemProximo(ev, proxima));
    });
  }

  function crearItemProximo(ev, proxima) {
    const item = document.createElement("div");
    item.className = "cal-proximo-item color-" + ev.color;

    const fechaBox = document.createElement("div");
    fechaBox.className = "cal-proximo-fecha";
    const dia = document.createElement("span");
    dia.className = "cal-proximo-dia";
    dia.textContent = proxima.getDate();
    const mes = document.createElement("span");
    mes.className = "cal-proximo-mes";
    mes.textContent = MESES_LARGOS[proxima.getMonth()].slice(0, 3);
    fechaBox.append(dia, mes);

    const info = document.createElement("div");
    info.className = "cal-proximo-info";
    const titulo = document.createElement("span");
    titulo.className = "cal-proximo-titulo";
    titulo.textContent = ev.titulo;
    info.appendChild(titulo);

    if (ev.descripcion) {
      const desc = document.createElement("span");
      desc.className = "cal-proximo-desc";
      desc.textContent = ev.descripcion;
      info.appendChild(desc);
    }

    const diff = diasHasta(proxima);
    const cuando = document.createElement("span");
    cuando.className = "cal-proximo-cuando";
    if (diff === 0) { cuando.classList.add("hoy"); cuando.textContent = "¡HOY!"; }
    else if (diff === 1) cuando.textContent = "Mañana";
    else if (diff < 7) cuando.textContent = `En ${diff} días`;
    else if (diff < 30) cuando.textContent = `En ${Math.round(diff / 7)} sem.`;
    else cuando.textContent = `En ${Math.round(diff / 30)} meses`;

    const btnDelete = document.createElement("button");
    btnDelete.className = "cal-proximo-delete";
    btnDelete.textContent = "×";
    btnDelete.title = "Eliminar fecha";
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      eliminarEvento(ev.id);
    });

    item.append(fechaBox, info, cuando, btnDelete);

    item.addEventListener("click", () => {
      mesMostrado = new Date(proxima.getFullYear(), proxima.getMonth(), 1);
      renderCalendario();
      document.querySelector(".calendario-wrapper")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return item;
  }

  function actualizarEmptyCalendario() {
    if (!calendarioEmpty) return;
    if (eventos.length === 0) calendarioEmpty.classList.remove("hidden");
    else calendarioEmpty.classList.add("hidden");
  }

  function abrirEventoModal(fechaPrefill) {
    if (!eventoModal) return;
    eventoModal.classList.add("active");
    eventoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (eventoForm) eventoForm.reset();
    colorEventoSeleccionado = "amarillo";
    document.querySelectorAll("#evento-form .color-option").forEach((opt) => {
      opt.classList.toggle("activo", opt.dataset.color === "amarillo");
    });

    if (eventoFecha) eventoFecha.value = fechaPrefill || hoyISO();

    if (eventoSubmitBtn) {
      eventoSubmitBtn.disabled = false;
      eventoSubmitBtn.textContent = "Guardar fecha 📅";
    }

    setTimeout(() => eventoTitulo?.focus(), 100);
  }

  function cerrarEventoModal() {
    if (!eventoModal) return;
    eventoModal.classList.remove("active");
    eventoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function eliminarEvento(id) {
    if (!confirm("¿Eliminar esta fecha del calendario?")) return;
    try {
      await eliminarEventoTabla(id);
      eventos = eventos.filter((e) => e.id !== id);
      renderCalendario();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar: " + (err.message || err));
    }
  }

  if (btnAddEvento) btnAddEvento.addEventListener("click", () => abrirEventoModal());

  eventoModal?.querySelectorAll("[data-close-evento-modal]").forEach((el) => {
    el.addEventListener("click", cerrarEventoModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && eventoModal?.classList.contains("active")) cerrarEventoModal();
  });

  document.querySelectorAll("#evento-form .color-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll("#evento-form .color-option").forEach((o) => o.classList.remove("activo"));
      opt.classList.add("activo");
      colorEventoSeleccionado = opt.dataset.color;
    });
  });

  calPrev?.addEventListener("click", () => {
    mesMostrado.setMonth(mesMostrado.getMonth() - 1);
    renderCalendario();
  });

  calNext?.addEventListener("click", () => {
    mesMostrado.setMonth(mesMostrado.getMonth() + 1);
    renderCalendario();
  });

  if (eventoForm) {
    eventoForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = eventoTitulo?.value.trim() || "";
      const descripcion = eventoDescripcion?.value.trim() || "";
      const fecha = eventoFecha?.value || "";
      const recordatorio = parseInt(eventoRecordatorio?.value ?? "1", 10);
      const recurrente = !!eventoRecurrente?.checked;

      if (!titulo || !fecha) { alert("Rellena título y fecha"); return; }

      if (eventoSubmitBtn) {
        eventoSubmitBtn.disabled = true;
        eventoSubmitBtn.textContent = "Guardando...";
      }

      try {
        await pedirPermisoNotificacionesSilencioso();

        const nuevo = await añadirEventoTabla(
          titulo, descripcion, fecha,
          colorEventoSeleccionado, recordatorio, recurrente
        );

        eventos.push({
          id: nuevo.id, titulo: nuevo.titulo, descripcion: nuevo.descripcion,
          fecha: nuevo.fecha, color: nuevo.color,
          recordatorio_dias: nuevo.recordatorio_dias, recurrente: nuevo.recurrente,
        });

        eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
        cerrarEventoModal();
        renderCalendario();
        comprobarRecordatorios();
      } catch (err) {
        console.error(err);
        alert("No se pudo guardar: " + (err.message || err));
        if (eventoSubmitBtn) {
          eventoSubmitBtn.disabled = false;
          eventoSubmitBtn.textContent = "Guardar fecha 📅";
        }
      }
    });
  }

  // ============================================
  //  NOTIFICACIONES
  // ============================================
  const NOTIF_STORAGE_PREFIX = "notif_ev_";

  function notificacionesSoportadas() { return "Notification" in window; }

  async function pedirPermisoNotificacionesSilencioso() {
    if (!notificacionesSoportadas()) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    try {
      const res = await Notification.requestPermission();
      actualizarBotonNotifPermiso();
      return res === "granted";
    } catch { return false; }
  }

  async function pedirPermisoNotificacionesManual() {
    if (!notificacionesSoportadas()) { alert("Tu navegador no soporta notificaciones 😢"); return; }
    const res = await Notification.requestPermission();
    actualizarBotonNotifPermiso();
    if (res === "granted") { alert("✅ ¡Notificaciones activadas!"); comprobarRecordatorios(); }
    else if (res === "denied") alert("❌ Notificaciones bloqueadas.");
  }

  function actualizarBotonNotifPermiso() {
    if (!btnNotifPermiso) return;
    if (!notificacionesSoportadas() || Notification.permission !== "default") {
      btnNotifPermiso.style.display = "none";
    } else {
      btnNotifPermiso.style.display = "inline-flex";
    }
  }

  if (btnNotifPermiso) btnNotifPermiso.addEventListener("click", pedirPermisoNotificacionesManual);

  function comprobarRecordatorios() {
    if (!notificacionesSoportadas()) return;
    if (Notification.permission !== "granted") return;
    if (eventos.length === 0) return;

    const hoy = hoyISO();

    eventos.forEach((ev) => {
      const proxima = proximaFechaEvento(ev);
      const diff = diasHasta(proxima);
      if (diff < 0 || diff > ev.recordatorio_dias) return;

      const key = `${NOTIF_STORAGE_PREFIX}${ev.id}_${hoy}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");

      let cuerpo;
      if (diff === 0) cuerpo = "¡Es hoy! 🎉 " + (ev.descripcion || "");
      else if (diff === 1) cuerpo = "Es mañana 🌻 " + (ev.descripcion || "");
      else cuerpo = `Faltan ${diff} días 📅 ` + (ev.descripcion || "");

      try {
        new Notification("🌻 " + ev.titulo, {
          body: cuerpo.trim(),
          icon: "img/girasol.jpg",
          tag: `evento-${ev.id}`,
        });
      } catch (err) { console.warn("Notif error:", err); }
    });
  }

  setTimeout(comprobarRecordatorios, 3000);
  setInterval(comprobarRecordatorios, 60 * 60 * 1000);
  actualizarBotonNotifPermiso();

  // ============================================
  //  SESIÓN
  // ============================================
  mostrarLoading("Cargando recuerdos...");

  function manejarSesion(session) {
    colaSesion = colaSesion
      .then(() => updateAuthUI(session))
      .catch((err) => console.error("💥 Error cola sesión:", err));
  }

  async function updateAuthUI(session) {
    const logueado = !!session;

    try {
      if (btnOpenLogin) btnOpenLogin.style.display = logueado ? "none" : "inline-flex";
      if (userInfo) userInfo.style.display = logueado ? "flex" : "none";

      if (logueado && userEmail) {
        const nombre = session.user.email.split("@")[0];
        userEmail.textContent = nombre;
        const dropdownName = document.getElementById("user-dropdown-name");
        if (dropdownName) dropdownName.textContent = nombre;
      }

      if (btnAdd) btnAdd.style.display = logueado ? "inline-block" : "none";
      if (btnAddNota) btnAddNota.style.display = logueado ? "inline-block" : "none";

      if (logueado) {
        await cargarFotos(); await render();
        await cargarNotas(); renderNotas();
        await cargarPlaylists(); renderPlaylists();
        await cargarEventos(); renderCalendario();
      } else {
        fotos = []; notas = []; playlists = []; eventos = [];

        if (grid) grid.innerHTML = "";
        if (empty) empty.classList.remove("hidden");
        if (notasGrid) notasGrid.innerHTML = "";
        if (notasEmpty) notasEmpty.classList.remove("hidden");
        if (playlistsGrid) playlistsGrid.innerHTML = "";
        if (playlistsEmpty) playlistsEmpty.classList.remove("hidden");
        if (calGrid) calGrid.innerHTML = "";
        if (calProximos) calProximos.innerHTML = "";
        if (calProximosVacio) calProximosVacio.classList.remove("hidden");
        if (calendarioEmpty) calendarioEmpty.classList.remove("hidden");
      }

      if (logueado && authModal) cerrarAuthModal();

    } catch (err) {
      console.error("💥 Error en updateAuthUI:", err);
    } finally {
      ocultarLoading();
    }
  }

  supabase.auth.onAuthStateChange((_event, session) => manejarSesion(session));

  setTimeout(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    manejarSesion(session);
  }, 100);

  // ============================================
  //  LOGIN
  // ============================================
  function abrirAuthModal() {
    if (!authModal) return;
    if (authSubmit) authSubmit.disabled = false;

    modoRegistro = false;
    setModoRegistro(false);
    if (authForm) authForm.reset();
    ocultarError();

    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => authUsername?.focus(), 100);
  }

  function cerrarAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("active");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modoRegistro = false;
    if (authSubmit) authSubmit.disabled = false;
    if (authForm) authForm.reset();
    ocultarError();
    setModoRegistro(false);
  }

  function setModoRegistro(activar) {
    modoRegistro = activar;
    if (confirmField) confirmField.style.display = activar ? "flex" : "none";
    if (authTitle) authTitle.textContent = activar ? "Crear cuenta" : "Bienvenido";
    if (authSubtitle) authSubtitle.textContent = activar
      ? "Únete y guarda vuestros recuerdos 🌻"
      : "Inicia sesión para ver el álbum";
    if (authSubmit) authSubmit.textContent = activar ? "Crear cuenta" : "Entrar";
    if (authToggleText) authToggleText.textContent = activar ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?";
    if (authToggleBtn) authToggleBtn.textContent = activar ? "Iniciar sesión" : "Crear cuenta";
    ocultarError();
  }

  function mostrarError(msg) {
    if (!authError) return;
    authError.textContent = msg;
    authError.style.display = "block";
  }

  function ocultarError() {
    if (!authError) return;
    authError.style.display = "none";
    authError.textContent = "";
  }

  function traducirError(msg) {
    if (!msg) return "Algo salió mal. Inténtalo otra vez.";
    if (msg.includes("Invalid login credentials")) return "Usuario o contraseña incorrectos.";
    if (msg.includes("Email not confirmed")) return "Debes confirmar tu cuenta antes de entrar.";
    if (msg.includes("User already registered")) return "Ya existe una cuenta con ese usuario.";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("Unable to validate email")) return "El usuario no es válido.";
    if (msg.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
    return msg;
  }

  if (btnOpenLogin) btnOpenLogin.addEventListener("click", abrirAuthModal);

  authModal?.querySelectorAll("[data-close-auth]").forEach((el) => {
    el.addEventListener("click", cerrarAuthModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal?.classList.contains("active")) cerrarAuthModal();
  });

  if (authToggleBtn) {
    authToggleBtn.addEventListener("click", () => setModoRegistro(!modoRegistro));
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      ocultarError();

      const usuario = authUsername?.value.trim().toLowerCase() || "";
      const password = authPassword?.value || "";

      if (!usuario || !password) { mostrarError("Rellena todos los campos."); return; }

      if (!/^[a-z0-9_-]{3,20}$/.test(usuario)) {
        mostrarError("El usuario debe tener 3-20 caracteres (letras, números, _ o -).");
        return;
      }

      const email = `${usuario}@foursunflowers.local`;

      if (modoRegistro) {
        if (password.length < 6) { mostrarError("La contraseña debe tener al menos 6 caracteres."); return; }
        if (password !== authPasswordConfirm?.value) { mostrarError("Las contraseñas no coinciden."); return; }
      }

      if (authSubmit) {
        authSubmit.disabled = true;
        authSubmit.textContent = modoRegistro ? "Creando cuenta..." : "Entrando...";
      }

      mostrarLoading(modoRegistro ? "Creando tu cuenta..." : "Entrando...");

      try {
        if (modoRegistro) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;

          if (data.user && !data.session) {
            ocultarLoading();
            mostrarError("✅ Cuenta creada. Revisa tu correo para confirmarla.");
            if (authSubmit) {
              authSubmit.disabled = false;
              authSubmit.textContent = "Crear cuenta";
            }
            return;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } catch (err) {
        console.error(err);
        ocultarLoading();
        mostrarError(traducirError(err.message));
        if (authSubmit) {
          authSubmit.disabled = false;
          authSubmit.textContent = modoRegistro ? "Crear cuenta" : "Entrar";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      mostrarLoading("Saliendo...");
      await supabase.auth.signOut();
    });
  }

  // ============================================
  //  MENÚ DE PERFIL
  // ============================================
  function abrirMenuPerfil() {
    if (!userDropdown || !userMenuToggle) return;
    userDropdown.classList.add("open");
    userDropdown.setAttribute("aria-hidden", "false");
    userMenuToggle.setAttribute("aria-expanded", "true");
    userInfo?.classList.add("open");
  }

  function cerrarMenuPerfil() {
    if (!userDropdown || !userMenuToggle) return;
    userDropdown.classList.remove("open");
    userDropdown.setAttribute("aria-hidden", "true");
    userMenuToggle.setAttribute("aria-expanded", "false");
    userInfo?.classList.remove("open");
  }

  function toggleMenuPerfil() {
    if (!userDropdown) return;
    if (userDropdown.classList.contains("open")) cerrarMenuPerfil();
    else abrirMenuPerfil();
  }

  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenuPerfil();
    });
  }

  document.addEventListener("click", (e) => {
    if (!userDropdown?.classList.contains("open")) return;
    if (userInfo && !userInfo.contains(e.target)) cerrarMenuPerfil();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userDropdown?.classList.contains("open")) cerrarMenuPerfil();
  });

  userDropdown?.querySelectorAll("[data-action]").forEach((item) => {
    item.addEventListener("click", () => {
      const action = item.dataset.action;
      switch (action) {
        case "perfil": alert("👤 Aquí irá tu perfil (próximamente)"); break;
        case "ajustes": alert("⚙️ Aquí irán tus ajustes (próximamente)"); break;
        case "estadisticas": alert("📊 Aquí verás tus estadísticas (próximamente)"); break;
        case "logout": break;
      }
      cerrarMenuPerfil();
    });
  });

  // ============================================
  //  SISTEMA DE VISTAS
  // ============================================
  const VISTAS = ["inicio", "album", "notas", "playlists", "calendario"];

  function rutaDesdeHash() {
    const hash = (location.hash || "").replace(/^#/, "").trim();
    return VISTAS.includes(hash) ? hash : "inicio";
  }

  function mostrarVista(nombre) {
    if (!VISTAS.includes(nombre)) nombre = "inicio";

    document.querySelectorAll("[data-view]").forEach((el) => {
      el.classList.toggle("active", el.dataset.view === nombre);
    });

    document.querySelectorAll("[data-view-link]").forEach((el) => {
      el.classList.toggle("active", el.dataset.viewLink === nombre);
    });

    if (userDropdown?.classList.contains("open")) cerrarMenuPerfil();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", () => mostrarVista(rutaDesdeHash()));
  mostrarVista(rutaDesdeHash());

  // ============================================
  //  FAILSAFE LOADING
  // ============================================
  setTimeout(() => {
    if (loadingScreen && loadingScreen.classList.contains("active")) {
      console.warn("⚠️ Loading atascado, forzando cierre");
      ocultarLoading();
    }
  }, 5000);

});