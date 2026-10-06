/* ============================================================
   ÁLBUM + NOTAS + PLAYLISTS + CALENDARIO + PLAYER LOCAL + CHAT
   v4 — Solo archivos locales para el reproductor.
   Los enlaces externos (Spotify/YouTube) se abren en pestaña nueva.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Configuración ---------- */
  const SUPABASE_URL = "https://fsobpmulnvajwlrgkoxr.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2JwbXVsbnZhandscmdrb3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODMyOTgsImV4cCI6MjEwNTg1OTI5OH0.j7Q8Zv02QhXxC9v-7MS1ZWeZyd18dN0TKFrbEhDs96Y";
  const BUCKET_NAME = "album";
  const BUCKET_CANCIONES = "canciones";
  const URL_EXPIRY = 3600;
  const URL_EXPIRY_CANCIONES = 14400;
  const DURACION_CACHE_URL = (URL_EXPIRY - 60) * 1000;
  const CENSURA_KEY = "sunadventures_censura_activa";
  const PUSH_VAPID_PUBLIC_KEY = "BGLQw2FyE65Bd8m2BcucYBvgCPrfJQEDfDr-VE2EalHz4LzcKBwjtysfCrWxyIhYULhmTNroGxJZCCnqtjrCrog";
  const AUDIO_EXTS = ["mp3", "m4a", "wav", "ogg", "flac", "aac", "opus"];
  const VIDEO_EXTS = ["mp4", "webm", "mov", "mkv"];
  const MESES_LARGOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const LIMITE_CONCURRENCIA_URLS = 6;

  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.message || o.title));
  const alertar = o => window.SunModal ? window.SunModal.alert(o) : (alert(o.message || o.title), Promise.resolve());

  if (typeof window.supabase === "undefined") {
    document.getElementById("loading-screen")?.classList.remove("active");
    return alert("No se pudo conectar con el servidor. Recarga la página.");
  }
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window._supabase = supabase;
  window._loadingFailsafe = setTimeout(() => {
    const ls = document.getElementById("loading-screen");
    if (ls?.classList.contains("active")) { ls.classList.remove("active"); ls.setAttribute("aria-hidden", "true"); }
  }, 10000);

  /* ---------- Iconos SVG ---------- */
  const SVG = {
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    repeatOne: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>',
    volHigh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volLow: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',
    volMute: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v2.1l2.4 2.4c.06-.16.1-.33.1-.5zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18l-1.5-9-4.5 4L12 5 9 13 4.5 9 3 18z"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 3 3 4 3 8 0 1.5-1 3-3 3s-3-1.5-3-3c0-1 1-2 1-3 0-1-1-2-1-3 2 0 3-1 3-2z"/><path d="M11 19c-3 0-6-2-6-6 0-1 1-3 2-4 0 2 1 3 2 3 0-2 1-3 2-4-1 3 3 5 3 8 0 2-1 3-3 3z"/></svg>',
    medal: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="15" r="6"/><path d="M9 3l3 6 3-6" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/></svg>',
    sunflower: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="5.5" rx="1.7" ry="2.4"/><ellipse cx="12" cy="18.5" rx="1.7" ry="2.4"/><ellipse cx="5.5" cy="12" rx="2.4" ry="1.7"/><ellipse cx="18.5" cy="12" rx="2.4" ry="1.7"/><ellipse cx="7.4" cy="7.4" rx="1.7" ry="2.4" transform="rotate(-45 7.4 7.4)"/><ellipse cx="16.6" cy="7.4" rx="1.7" ry="2.4" transform="rotate(45 16.6 7.4)"/><ellipse cx="7.4" cy="16.6" rx="1.7" ry="2.4" transform="rotate(45 7.4 16.6)"/><ellipse cx="16.6" cy="16.6" rx="1.7" ry="2.4" transform="rotate(-45 16.6 16.6)"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    tap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v7"/><path d="M13 13V9a2 2 0 0 1 4 0v6"/><path d="M17 12a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0"/></svg>'
  };

  /* ---------- Helpers ---------- */
  const $ = id => document.getElementById(id);
  const getUserIdSafe = () => window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  window._getUserIdSafe = getUserIdSafe;
  const parseCoord = v => (v === null || v === undefined || v === "") ? null : (Number.isFinite(Number(v)) ? Number(v) : null);
  const escapeHtml = t => String(t).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const ext = n => (n.split(".").pop() || "").toLowerCase();

  function identificarEnlaceMusical(raw) {
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:") return null;
      const host = url.hostname.toLowerCase();
      if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
        const partes = url.pathname.split("/").filter(Boolean);
        const id = host === "youtu.be" ? partes[0] : ["embed", "shorts", "live"].includes(partes[0]) ? partes[1] : url.searchParams.get("v");
        return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? { tipo: "youtube", id } : null;
      }
      if (host === "open.spotify.com") {
        const partes = url.pathname.split("/").filter(Boolean);
        const tipoIndex = partes[0]?.startsWith("intl-") ? 1 : 0;
        const tipo = partes[tipoIndex] === "embed" ? partes[tipoIndex + 1] : partes[tipoIndex];
        const id = partes[tipoIndex] === "embed" ? partes[tipoIndex + 2] : partes[tipoIndex + 1];
        if (["track", "album", "playlist", "episode", "show"].includes(tipo) && /^[A-Za-z0-9]{10,64}$/.test(id || "")) {
          return { tipo: "spotify", entidad: tipo, id };
        }
      }
    } catch { }
    return null;
  }

  const esAudio = e => AUDIO_EXTS.includes(e);
  const esVideo = e => VIDEO_EXTS.includes(e);
  const fmtFecha = iso => { const d = new Date(iso + "T00:00:00"); return isNaN(d) ? iso : `${String(d.getDate()).padStart(2, "0")} · ${MESES_CORTOS[d.getMonth()]} · ${d.getFullYear()}`; };
  const fmtFechaNota = iso => { const d = new Date(iso); return isNaN(d) ? "" : `${String(d.getDate()).padStart(2, "0")} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtTiempo = s => (!isFinite(s) || s < 0) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const fmtTam = b => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const fechaISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const hoyISO = () => fechaISO(new Date());

  /* ---------- DOM refs ---------- */
  const grid = $("album-grid"), empty = $("album-empty"), btnAdd = $("btn-add-photo"), btnPastePhotos = $("btn-paste-photos"), inputPastePhotos = $("input-paste-photos"), modal = $("photo-modal"), modalTitle = $("modal-title"), form = $("photo-form");
  const inputPhoto = $("input-photo"), inputPhotoCampo = inputPhoto?.closest(".form-field"), inputDate = $("input-date"), inputNote = $("input-note");
  const preview = $("photo-preview"), photoPreviewInfo = $("photo-preview-info"), submitBtn = form?.querySelector('button[type="submit"]');
  const btnPhotoLocation = $("btn-photo-location"), photoLocationStatus = $("photo-location-status"), inputLat = $("input-lat"), inputLng = $("input-lng");
  const aventurasMap = $("aventuras-map"), mapaEmpty = $("mapa-empty"), chatMessages = $("chat-messages"), chatStatus = $("chat-status"), chatForm = $("chat-form"), chatInput = $("chat-input"), btnEnablePush = $("btn-enable-push");
  const notasGrid = $("notas-grid"), notasEmpty = $("notas-empty"), btnAddNota = $("btn-add-nota"), notaModal = $("nota-modal"), notaForm = $("nota-form"), notaModalTitle = $("nota-modal-title");
  const notaTitulo = $("nota-titulo"), notaContenido = $("nota-contenido"), notaPreview = $("nota-preview");
  const notaTituloCampo = notaTitulo?.closest(".form-field"), notaColorCampo = document.querySelector("#nota-form .color-picker")?.closest(".form-field"), notaSubmitBtn = notaForm?.querySelector('button[type="submit"]');
  const playlistsGrid = $("playlists-grid"), playlistsEmpty = $("playlists-empty"), btnAddPlaylist = $("btn-add-playlist"), playlistModal = $("playlist-modal"), playlistForm = $("playlist-form");
  const playlistNombre = $("playlist-nombre"), playlistDescripcion = $("playlist-descripcion"), playlistSubmitBtn = playlistForm?.querySelector('button[type="submit"]');
  const cancionesModal = $("canciones-modal"), cancionesModalTitle = $("canciones-modal-title"), cancionesModalDesc = $("canciones-modal-desc"), cancionesLista = $("canciones-lista"), cancionForm = $("cancion-form");
  const cancionTitulo = $("cancion-titulo"), cancionArtista = $("cancion-artista"), cancionUrl = $("cancion-url");
  const calGrid = $("cal-grid"), calMesActual = $("cal-mes-actual"), calPrev = $("cal-prev"), calNext = $("cal-next"), calProximos = $("cal-proximos"), calProximosVacio = $("cal-proximos-vacio"), calendarioEmpty = $("calendario-empty");
  const btnAddEvento = $("btn-add-evento"), btnNotifPermiso = $("btn-notif-permiso"), eventoModal = $("evento-modal"), eventoForm = $("evento-form");
  const eventoTitulo = $("evento-titulo"), eventoDescripcion = $("evento-descripcion"), eventoFecha = $("evento-fecha"), eventoRecordatorio = $("evento-recordatorio"), eventoRecurrente = $("evento-recurrente"), eventoSubmitBtn = eventoForm?.querySelector('button[type="submit"]');
  const playerBar = $("player-bar"), playerBarTitle = $("player-bar-title"), playerBarArtist = $("player-bar-artist"), playerCoverIcon = $("player-cover-icon"), playerPlay = $("player-play");
  const playerNext = $("player-next"), playerPrev = $("player-prev"), playerShuffle = $("player-shuffle"), playerRepeat = $("player-repeat"), playerSeek = $("player-seek");
  const playerCurrent = $("player-current"), playerDuration = $("player-duration"), playerVolumeBtn = $("player-volume-btn"), playerVolume = $("player-volume"), playerClose = $("player-close"), globalAudio = $("global-audio");
  const providerPlayer = $("provider-player"), playerProgress = document.querySelector(".player-progress");
  const loadingScreen = $("loading-screen"), loadingText = $("loading-text");
  const authModal = $("auth-modal"), btnOpenLogin = $("btn-open-login"), authForm = $("auth-form"), authUsername = $("auth-username"), authPassword = $("auth-password"), authPasswordConfirm = $("auth-password-confirm");
  const confirmField = $("confirm-password-field"), authSubmit = $("auth-submit"), authTitle = $("auth-title"), authSubtitle = $("auth-subtitle"), authToggleText = $("auth-toggle-text"), authToggleBtn = $("auth-toggle-btn"), authError = $("auth-error");
  const userInfo = $("user-info"), userEmail = $("user-email"), logoutBtn = $("logout-btn"), userMenuToggle = $("user-menu-toggle"), userDropdown = $("user-dropdown");
  const friendsModal = $("friends-modal"), friendsGroupName = $("friends-group-name"), friendSearchForm = $("friend-search-form"), friendSearchInput = $("friend-search-input"), friendSearchResults = $("friend-search-results");
  const groupMembersList = $("group-members-list"), groupInvitesList = $("group-invites-list"), settingsModal = $("settings-modal"), toggleCensura = $("toggle-censura");
  const logrosPersonalesGrid = $("logros-personales-grid"), logrosGrupoGrid = $("logros-grupo-grid"), logrosDesbloqueados = $("logros-desbloqueados"), logroToast = $("logro-toast");
  const experienciaTitulo = $("experiencia-titulo"), experienciaXp = $("experiencia-xp"), experienciaProgreso = $("experiencia-progreso"), experienciaSiguiente = $("experiencia-siguiente");

  /* ---------- Estado ---------- */
  let fotos = [], notas = [], notaEditando = null, fotoEditando = null;
  let colorSeleccionado = "amarillo", modoRegistro = false, grupoActivo = null, perfilActual = null, visitasConsecutivas = 0;
  let playlists = [], playlistEditando = null, emojiSeleccionado = "music", colorPlaylistSeleccionado = "amarillo";
  let eventos = [], mesMostrado = new Date(), colorEventoSeleccionado = "amarillo";
  let renderEnCurso = false, renderPendiente = false, subiendoFoto = false, colaSesion = Promise.resolve();
  const urlsFirmadasCache = new Map();
  let archivosPendientes = [], usuarioActualId = null;
  let colaReproduccion = [], indiceReproduccion = -1, modoAleatorio = false, modoRepetir = "off";
  let volumenActual = parseFloat(localStorage.getItem("app_volume") || localStorage.getItem("player_volumen") || "0.8");
  let silenciadoAntes = false, reproduciendo = false;
  let chatSubscription = null, chatModo = "grupo", chatDestinatario = null;
  mesMostrado.setDate(1);

  const mostrarLoading = (msg = "Cargando...") => { if (!loadingScreen) return; if (loadingText) loadingText.textContent = msg; loadingScreen.classList.add("active"); loadingScreen.setAttribute("aria-hidden", "false"); };
  const ocultarLoading = () => { if (!loadingScreen) return; loadingScreen.classList.remove("active"); loadingScreen.setAttribute("aria-hidden", "true"); };

  /* ============================================================
     LOGROS + EXPERIENCIA
     ============================================================ */
  const IMAGENES_MASCOTA = {
    mapache: "img/mapache.png", girasol: "img/mascota-girasol.png", gatito: "img/siamesa.png",
    "gatito-negro": "img/gatito-negro.png", hamburguesa: "img/hamburguesa.png", oveja: "img/oveja.png",
    pollito: "img/pollito.png", jirafa: "img/jirafa.png", unicornio: "img/unicornio.png",
    conejo: "img/conejito.png", "dragon-bebe": "img/dragon-bebe.png", "dragon-anciano": "img/dragon-anciano.png"
  };

  const LOGROS = [
    { id: "primeros-pasos", tipo: "grupo", icono: SVG.medal, nombre: "Primeros pasos", descripcion: "Guarda la primera foto del grupo", meta: 1, medir: () => fotos.length },
    { id: "fotografos", tipo: "grupo", icono: SVG.camera, nombre: "Fotógrafos", descripcion: "Guarda 50 fotos del grupo", meta: 50, medir: () => fotos.length },
    { id: "dj", tipo: "grupo", icono: SVG.music, nombre: "DJ", descripcion: "Añade 20 canciones al grupo", meta: 20, medir: () => playlists.reduce((t, p) => t + p.canciones.length, 0) },
    { id: "poetas", tipo: "grupo", icono: SVG.note, nombre: "Poetas", descripcion: "Escribe 30 notas del grupo", meta: 30, medir: () => notas.length },
    { id: "racha", icono: SVG.fire, nombre: "Racha de 30 días", descripcion: "Abre la app 30 días seguidos", meta: 30, medir: () => visitasConsecutivas },
    { id: "trotamundos", tipo: "grupo", icono: SVG.globe, nombre: "Trotamundos", descripcion: "Guarda 10 fotos con ubicación", meta: 10, medir: () => fotos.filter(f => f.lat != null && f.lng != null).length },
    { id: "racha-365", icono: SVG.calendar, nombre: "Un año de nosotros", descripcion: "Abre la app 365 días seguidos", meta: 365, medir: () => visitasConsecutivas },
    { id: "todos-los-logros", tipo: "grupo", icono: SVG.crown, nombre: "Leyenda absoluta", descripcion: "Completa todos los demás logros", meta: 1, esFinal: true, medir: () => LOGROS.filter(l => !l.esFinal).every(l => l.medir() >= l.meta) ? 1 : 0 }
  ];
  const MASCOTAS_LOGROS = [
    { id: "mapache", nombre: "el Mapache", icono: SVG.heart },
    { id: "girasol", nombre: "el Girasol", icono: SVG.sunflower },
    { id: "gatito", nombre: "la Siamesa", icono: SVG.heart },
    { id: "gatito-negro", nombre: "el Gato Negro", icono: SVG.heart },
    { id: "hamburguesa", nombre: "Hamburguesa", icono: SVG.heart },
    { id: "oveja", nombre: "la Oveja", icono: SVG.heart },
    { id: "pollito", nombre: "el Pollito", icono: SVG.heart },
    { id: "jirafa", nombre: "la Jirafa", icono: SVG.heart },
    { id: "unicornio", nombre: "el Unicornio", icono: SVG.sparkle },
    { id: "conejo", nombre: "el Conejito", icono: SVG.heart },
    { id: "dragon-bebe", nombre: "el Dragón Bebé", icono: SVG.fire },
    { id: "dragon-anciano", nombre: "el Dragón Anciano", icono: SVG.crown }
  ];
  MASCOTAS_LOGROS.forEach(m => {
    const sprite = IMAGENES_MASCOTA[m.id];
    const nombreCorto = m.nombre.replace(/^(el|la) /, "");
    LOGROS.push(
      { id: `mascota-${m.id}`, sprites: [sprite], icono: m.icono, nombre: `Conoce a ${m.nombre}`, descripcion: `Interactúa con ${m.nombre} por primera vez`, meta: 1, medir: () => JSON.parse(localStorage.getItem(`mascotas_conocidas_${getUserIdSafe()}`) || "[]").includes(m.id) ? 1 : 0 },
      { id: `clics-${m.id}`, sprites: [sprite], icono: SVG.tap, nombre: `Fan de ${nombreCorto}`, descripcion: `Dale 100 clics a ${nombreCorto}`, meta: 100, medir: () => Number(localStorage.getItem(`mascota_clicks_${getUserIdSafe()}_${m.id}`) || 0) }
    );
  });
  window.LOGROS = LOGROS;
  window.renderLogros = renderLogros;
  Object.defineProperty(window, "_playlists", { get: () => playlists, configurable: true });
  Object.defineProperty(window, "_eventos", { get: () => eventos, configurable: true });
  Object.defineProperty(window, "_fotos", { get: () => fotos, configurable: true });

  let logroToastTimeout = null;
  const notificarLogro = logro => {
    if (!logroToast) return;
    const spriteHTML = logro.sprites?.[0] ? `<img src="${logro.sprites[0]}" alt="" class="logro-toast-sprite">` : "";
    const iconoHTML = `<span class="logro-toast-icon-svg">${logro.icono}</span>`;
    logroToast.innerHTML = `<span class="logro-toast-visual">${spriteHTML}${iconoHTML}</span><span class="logro-toast-copy"><strong>Logro desbloqueado</strong><span>${logro.nombre}</span></span>`;
    logroToast.classList.add("visible");
    if (logroToastTimeout) clearTimeout(logroToastTimeout);
    logroToastTimeout = setTimeout(() => logroToast.classList.remove("visible"), 4500);
  };

  const crearIconoLogro = logro => {
    const wrapper = document.createElement("span");
    wrapper.className = "logro-icono-wrapper";
    if (logro.sprites && logro.sprites[0]) {
      const sw = document.createElement("span");
      sw.className = "logro-icono-sprite";
      const img = document.createElement("img");
      img.src = logro.sprites[0]; img.alt = ""; img.loading = "lazy";
      sw.appendChild(img); wrapper.appendChild(sw);
    }
    const svgWrap = document.createElement("span");
    svgWrap.className = "logro-icono-svg-badge";
    let iconHtml = logro.icono;
    if (!iconHtml) {
      const tipo = logro.id || "";
      if (tipo.startsWith("rpg-") || tipo.includes("jefe") || tipo.includes("enemigo")) iconHtml = window.ICONO?.espada;
      else if (tipo.includes("chat") || tipo.includes("mensaje")) iconHtml = window.ICONO?.chat;
      else if (tipo.includes("juego") || tipo.includes("jugador") || tipo.includes("ganador")) iconHtml = window.ICONO?.jugar;
      else if (tipo.includes("compra") || tipo.includes("moneda") || tipo.includes("rico")) iconHtml = window.ICONO?.moneda;
      else if (tipo.includes("playlist") || tipo.includes("cancion") || tipo.includes("musical")) iconHtml = window.ICONO?.musica;
      else if (tipo.includes("evento") || tipo.includes("calendario") || tipo.includes("planificador")) iconHtml = window.ICONO?.calendario;
      else if (tipo.includes("viaje") || tipo.includes("explorador") || tipo.includes("ubicacion")) iconHtml = window.ICONO?.mapa;
      else if (tipo.includes("cuidado") || tipo.includes("amistad") || tipo.includes("amigo")) iconHtml = window.ICONO?.corazon;
      else if (tipo.includes("nivel")) iconHtml = window.ICONO?.estrella;
      else iconHtml = window.ICONO?.estrella || "★";
    }
    svgWrap.innerHTML = iconHtml || "★";
    wrapper.appendChild(svgWrap);
    return wrapper;
  };

  const NIVEL_A_ICONO = { sprout: "raiz", heart: "corazon", flame: "fuego", sparkle: "estrella", sunflower: "girasol" };
  const NIVELES_EXPERIENCIA = [
    { minimo: 0, nombre: "Novatos", icono: "sprout", siguiente: 100, siguienteNombre: "Enamorados", siguienteIcono: "heart" },
    { minimo: 100, nombre: "Enamorados", icono: "heart", siguiente: 500, siguienteNombre: "Compañeros de vida", siguienteIcono: "flame" },
    { minimo: 500, nombre: "Compañeros de vida", icono: "flame", siguiente: 1000, siguienteNombre: "Almas gemelas", siguienteIcono: "sparkle" },
    { minimo: 1000, nombre: "Almas gemelas", icono: "sparkle", siguiente: 5000, siguienteNombre: "Leyendas", siguienteIcono: "sunflower" },
    { minimo: 5000, nombre: "Leyendas", icono: "sunflower", siguiente: null, siguienteNombre: "Máximo nivel", siguienteIcono: null }
  ];
  const calcularExperiencia = () => {
    const base = fotos.length * 10 + notas.length * 5 + playlists.reduce((t, p) => t + p.canciones.length, 0) * 8 + visitasConsecutivas * 20;
    const extra = Math.max(0, Number(localStorage.getItem(`sa_experiencia_extra_${getUserIdSafe()}`)) || 0);
    return base + extra;
  };
  const hidratarIconosEn = root => { if (!root) return; root.querySelectorAll("[data-icono]").forEach(el => { const k = el.dataset.icono; if (window.ICONO?.[k] && !el.querySelector("svg")) el.innerHTML = window.ICONO[k]; }); };

  function renderExperiencia() {
    try {
      const xp = calcularExperiencia();
      const nivel = [...NIVELES_EXPERIENCIA].reverse().find(i => xp >= i.minimo) || NIVELES_EXPERIENCIA[0];
      if (experienciaTitulo) {
        const iconoKey = NIVEL_A_ICONO[nivel.icono] || "raiz";
        experienciaTitulo.innerHTML = `${nivel.nombre} <span class="ui-icon" data-icono="${iconoKey}"></span>`;
        hidratarIconosEn(experienciaTitulo);
      }
      if (experienciaXp) experienciaXp.textContent = `${xp} XP`;
      if (nivel.siguiente) {
        const pct = ((xp - nivel.minimo) / (nivel.siguiente - nivel.minimo)) * 100;
        if (experienciaProgreso) experienciaProgreso.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        if (experienciaSiguiente) {
          const sigIconoKey = NIVEL_A_ICONO[nivel.siguienteIcono] || "raiz";
          experienciaSiguiente.innerHTML = `${Math.max(0, nivel.siguiente - xp)} XP para ${nivel.siguienteNombre} <span class="ui-icon" data-icono="${sigIconoKey}"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      } else {
        if (experienciaProgreso) experienciaProgreso.style.width = "100%";
        if (experienciaSiguiente) {
          experienciaSiguiente.innerHTML = `Nivel máximo alcanzado <span class="ui-icon" data-icono="girasol"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      }
      window._experienciaActual = xp;
      window._nivelActual = NIVELES_EXPERIENCIA.findIndex(n => n.nombre === nivel.nombre) + 1;
    } catch (err) { console.error("renderExperiencia:", err); }
  }

  function registrarVisita() {
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const clave = `sunadventures_visitas_${getUserIdSafe()}`;
      const dias = JSON.parse(localStorage.getItem(clave) || "[]");
      if (!dias.includes(hoy)) dias.push(hoy);
      const ordenados = dias.sort().slice(-400);
      localStorage.setItem(clave, JSON.stringify(ordenados));
      visitasConsecutivas = 0;
      const fechas = new Set(ordenados);
      const cursor = new Date();
      while (fechas.has(cursor.toISOString().slice(0, 10))) { visitasConsecutivas++; cursor.setDate(cursor.getDate() - 1); }
    } catch { visitasConsecutivas = 0; }
  }

  const _logroState = { personal: { grid: null, cards: new Map(), firma: "" }, grupo: { grid: null, cards: new Map(), firma: "" } };
  const _firmaLogros = lista => lista.map(l => l.id).join("|");
  function _construirCard(logro) {
    const card = document.createElement("article");
    card.className = "logro-card"; card.dataset.logroId = logro.id;
    const contenido = document.createElement("div");
    contenido.className = "logro-contenido";
    contenido.innerHTML = `<h3>${logro.nombre}</h3><p>${logro.descripcion}</p><small>0 / ${logro.meta}</small>`;
    card.append(crearIconoLogro(logro), contenido);
    return { card, small: contenido.querySelector("small") };
  }
  function _actualizarCard(entry, logro, desbloqueado, progreso, notificar) {
    const { card, small } = entry;
    const nuevoTexto = desbloqueado ? "Desbloqueado" : `${progreso} / ${logro.meta}`;
    if (small.textContent !== nuevoTexto) small.textContent = nuevoTexto;
    const tenia = card.classList.contains("desbloqueado");
    if (desbloqueado && !tenia) { card.classList.add("desbloqueado"); if (notificar) notificarLogro(logro); }
    else if (!desbloqueado && tenia) card.classList.remove("desbloqueado");
  }

  function renderLogros({ notificar = false } = {}) {
    try {
      if (!logrosPersonalesGrid || !logrosGrupoGrid) return;
      const cacheLS = new Map();
      const getLS = k => { if (cacheLS.has(k)) return cacheLS.get(k); const v = JSON.parse(localStorage.getItem(k) || "{}"); cacheLS.set(k, v); return v; };
      const pintar = (logros, gridEl, clave, stateKey) => {
        const st = _logroState[stateKey];
        const firma = _firmaLogros(logros);
        if (st.firma !== firma || st.grid !== gridEl) {
          gridEl.innerHTML = ""; st.cards.clear();
          const frag = document.createDocumentFragment();
          logros.forEach(logro => { const entry = _construirCard(logro); st.cards.set(logro.id, entry); frag.appendChild(entry.card); });
          gridEl.appendChild(frag); st.grid = gridEl; st.firma = firma;
        }
        const desbloqueados = getLS(clave);
        let total = 0, cambio = false;
        logros.forEach(logro => {
          try {
            const progreso = Math.min(logro.medir(), logro.meta);
            const desbloqueado = progreso >= logro.meta;
            if (desbloqueado) {
              if (notificar && !desbloqueados[logro.id]) notificarLogro(logro);
              if (!desbloqueados[logro.id]) { desbloqueados[logro.id] = true; cambio = true; }
              total++;
            }
            _actualizarCard(st.cards.get(logro.id), logro, desbloqueado, progreso, false);
          } catch (err) { console.warn(`Error logro ${logro.id}:`, err); }
        });
        if (cambio) localStorage.setItem(clave, JSON.stringify(desbloqueados));
        return total;
      };
      const personales = LOGROS.filter(l => l.tipo !== "grupo");
      const grupales = LOGROS.filter(l => l.tipo === "grupo");
      const totalPersonal = pintar(personales, logrosPersonalesGrid, `sunadventures_logros_${getUserIdSafe()}`, "personal");
      pintar(grupales, logrosGrupoGrid, `sunadventures_logros_grupo_${grupoActivo?.id || "local"}`, "grupo");
      if (logrosDesbloqueados) logrosDesbloqueados.textContent = totalPersonal;
      renderExperiencia();
      window._logrosDesbloqueados = {
        ...JSON.parse(localStorage.getItem(`sunadventures_logros_grupo_${grupoActivo?.id || "local"}`) || "{}"),
        ...JSON.parse(localStorage.getItem(`sunadventures_logros_${getUserIdSafe()}`) || "{}")
      };
      if (typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
    } catch (err) { console.error("renderLogros:", err); }
  }

  let _progressT = null, _progressPend = false;
  function _ejecutarProgress() {
    const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
    if (vistaActiva === "logros") renderLogros({ notificar: true });
    else try { renderLogros({ notificar: false }); } catch { }
    if (vistaActiva === "mascotas" && typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
    if (vistaActiva === "inicio") renderExperiencia();
    if (typeof window._actualizarModalMascota === "function") { try { window._actualizarModalMascota(); } catch { } }
  }
  window.addEventListener("sunadventures:progress", () => {
    if (_progressT) { _progressPend = true; return; }
    _progressT = requestAnimationFrame(() => {
      _progressT = null; _ejecutarProgress();
      if (_progressPend) { _progressPend = false; window.dispatchEvent(new Event("sunadventures:progress")); }
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (document.querySelector("[data-view].active")?.dataset.view === "logros") renderLogros({ notificar: true });
  });

  /* ============================================================
     GRUPO / AUTH
     ============================================================ */
  const usernameDesdeSesion = s => (s?.user?.email?.split("@")[0] || "usuario").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20).padEnd(3, "_");

  async function asegurarGrupoActivo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { grupoActivo = null; return null; }
      usuarioActualId = session.user.id;
      window._sunUserId = session.user.id;
      localStorage.setItem("sunadventures_uid", session.user.id);
      window.dispatchEvent(new Event("sunadventures:user-ready"));
      const username = usernameDesdeSesion(session);
      const { data: perfilExistente, error: perfilError } = await supabase.from("perfiles").select("id,username").eq("id", session.user.id).maybeSingle();
      if (perfilError) throw perfilError;
      if (perfilExistente) perfilActual = perfilExistente;
      else {
        const { data: perfil, error: crearPerfilError } = await supabase.from("perfiles").insert({ id: session.user.id, username }).select("id,username").single();
        if (crearPerfilError) throw crearPerfilError;
        perfilActual = perfil;
      }
      const { data: membresias } = await supabase.from("grupo_miembros").select("grupo_id, grupos(id,nombre,creado_por)").eq("user_id", session.user.id).limit(20);
      let membresia = (membresias || []).find(m => m.grupo_id === localStorage.getItem("grupo_activo")) || membresias?.[0];
      if (!membresia) {
        const { data: grupo, error } = await supabase.from("grupos").insert({ nombre: "Nuestro grupo de aventuras", creado_por: session.user.id }).select("id,nombre,creado_por").single();
        if (error) throw error;
        const { error: e2 } = await supabase.from("grupo_miembros").insert({ grupo_id: grupo.id, user_id: session.user.id, rol: "owner" });
        if (e2) throw e2;
        membresia = { grupo_id: grupo.id, grupos: grupo };
        localStorage.setItem("grupo_activo", grupo.id);
      }
      grupoActivo = membresia.grupos || { id: membresia.grupo_id, nombre: "Nuestro grupo de aventuras" };
      localStorage.setItem("grupo_activo", grupoActivo.id);
      window.dispatchEvent(new CustomEvent("sunadventures:group-ready", { detail: { groupId: grupoActivo.id, userId: session.user.id } }));
      await Promise.all(["fotos", "notas", "playlists"].map(t => supabase.from(t).update({ grupo_id: grupoActivo.id }).eq("user_id", session.user.id).is("grupo_id", null)));
      return grupoActivo;
    } catch (err) {
      console.error("asegurarGrupoActivo:", err);
      grupoActivo = null;
      window.dispatchEvent(new CustomEvent("sunadventures:group-error", { detail: { message: err?.message || "Error desconocido" } }));
      return null;
    }
  }
  window._asegurarGrupoActivo = asegurarGrupoActivo;
  window._getGrupoActivo = () => grupoActivo;

  async function cargarMiembrosGrupo() {
    try {
      if (!grupoActivo || !groupMembersList) return;
      const { data } = await supabase.from("grupo_miembros").select("user_id,rol").eq("grupo_id", grupoActivo.id);
      const ids = (data || []).map(m => m.user_id);
      const { data: perfiles } = ids.length ? await supabase.from("perfiles").select("id,username").in("id", ids) : { data: [] };
      const frag = document.createDocumentFragment();
      (perfiles || []).forEach(perfil => {
        const miembro = data.find(i => i.user_id === perfil.id);
        const div = document.createElement("div");
        div.className = "friend-row";
        div.textContent = `@${perfil.username}${miembro?.rol === "owner" ? " · propietario" : ""}`;
        frag.appendChild(div);
      });
      groupMembersList.innerHTML = ""; groupMembersList.appendChild(frag);
    } catch (err) { console.warn("cargarMiembrosGrupo:", err); }
  }

  async function cargarInvitaciones() {
    try {
      if (!groupInvitesList) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: invitaciones } = await supabase.from("invitaciones_grupo").select("id,grupo_id,grupos(nombre)").eq("invitado_id", session.user.id).eq("estado", "pendiente");
      const frag = document.createDocumentFragment();
      (invitaciones || []).forEach(inv => {
        const div = document.createElement("div");
        div.className = "friend-row friend-invite";
        div.textContent = `Invitación a ${inv.grupos?.nombre || "un grupo"}`;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "btn-secondary"; btn.textContent = "Aceptar";
        btn.addEventListener("click", async () => {
          await supabase.from("grupo_miembros").insert({ grupo_id: inv.grupo_id, user_id: session.user.id, rol: "miembro" });
          await supabase.from("invitaciones_grupo").update({ estado: "aceptada" }).eq("id", inv.id);
          localStorage.setItem("grupo_activo", inv.grupo_id);
          window.location.reload();
        });
        div.appendChild(btn); frag.appendChild(div);
      });
      groupInvitesList.innerHTML = ""; groupInvitesList.appendChild(frag);
    } catch (err) { console.warn("cargarInvitaciones:", err); }
  }

  async function abrirAmigosModal() {
    try {
      if (!friendsModal) return;
      await asegurarGrupoActivo();
      friendsModal.classList.add("active"); friendsModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      if (friendsGroupName) friendsGroupName.textContent = grupoActivo?.nombre || "Grupo privado";
      await cargarMiembrosGrupo(); await cargarInvitaciones();
    } catch (err) { console.warn("abrirAmigosModal:", err); }
  }
  friendsModal?.querySelectorAll("[data-close-friends]").forEach(el => el.addEventListener("click", () => { friendsModal.classList.remove("active"); friendsModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }));

  function abrirAjustes() {
    if (!settingsModal) return;
    try {
      if (toggleCensura) toggleCensura.checked = localStorage.getItem(CENSURA_KEY) === "true";
      window.SunPreferences?.setLanguage(window.SunPreferences.getLanguage());
      window.SunPreferences?.setAnimationsDisabled(localStorage.getItem("sunadventures_animations_disabled") === "true");
      window.SunPreferences?.setVolume(localStorage.getItem("app_volume") || localStorage.getItem("player_volumen") || "0.8");
      settingsModal.classList.add("active");
      settingsModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch (err) { console.error("abrirAjustes:", err); }
  }
  settingsModal?.querySelectorAll("[data-close-settings]").forEach(el => el.addEventListener("click", () => { settingsModal.classList.remove("active"); settingsModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }));
  toggleCensura?.addEventListener("change", () => localStorage.setItem(CENSURA_KEY, String(toggleCensura.checked)));

  const censurarMensaje = async texto => {
    if (localStorage.getItem(CENSURA_KEY) !== "true") return texto;
    const r = await fetch(`https://www.purgomalum.com/service/json?fill_char=*&text=${encodeURIComponent(texto)}`);
    if (!r.ok) throw new Error("Censura no disponible");
    const j = await r.json();
    if (typeof j.result !== "string") throw new Error("Respuesta inválida");
    return j.result;
  };

  friendSearchForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const termino = friendSearchInput.value.trim().toLowerCase();
      if (!termino) return;
      const { data: perfiles } = await supabase.from("perfiles").select("id,username").ilike("username", `%${termino}%`).limit(10);
      const frag = document.createDocumentFragment();
      (perfiles || []).filter(p => p.id !== perfilActual?.id).forEach(perfil => {
        const div = document.createElement("div"); div.className = "friend-row";
        const span = document.createElement("span"); span.textContent = `@${perfil.username}`;
        const btn = document.createElement("button");
        btn.type = "button"; btn.className = "btn-secondary"; btn.textContent = "Invitar";
        btn.addEventListener("click", async () => {
          const { error } = await supabase.from("invitaciones_grupo").insert({ grupo_id: grupoActivo.id, invitado_id: perfil.id, invitado_por: perfilActual.id });
          btn.textContent = error ? "No disponible" : "Enviada"; btn.disabled = true;
        });
        div.append(span, btn); frag.appendChild(div);
      });
      friendSearchResults.innerHTML = ""; friendSearchResults.appendChild(frag);
    } catch (err) { console.warn("friendSearch:", err); }
  });

  /* ============================================================
     FOTOS
     ============================================================ */
  async function cargarFotos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { fotos = []; return; }
      if (!grupoActivo) await asegurarGrupoActivo();
      if (!grupoActivo) { fotos = []; return; }
      const { data, error } = await supabase.from("fotos")
        .select("id,path,fecha,nota,lat,lng,lugar,grupo_id")
        .eq("grupo_id", grupoActivo.id)
        .order("created_at", { ascending: false });
      if (error) { console.warn("cargarFotos error:", error); fotos = []; return; }
      fotos = (data || []).map(f => ({ id: f.id, path: f.path, fecha: f.fecha, nota: f.nota, lat: f.lat, lng: f.lng, lugar: f.lugar, grupo_id: f.grupo_id }));
    } catch (err) { console.warn("cargarFotos:", err); fotos = []; }
  }

  const añadirFotoTabla = async (path, fecha, nota, lat, lng) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");
    const { data, error } = await supabase.from("fotos").insert({ user_id: session.user.id, grupo_id: grupoActivo.id, path, fecha: fecha || null, nota: nota || null, lat: lat || null, lng: lng || null }).select().single();
    if (error) throw error;
    return data;
  };
  const eliminarFotoTabla = async id => { const { error } = await supabase.from("fotos").delete().eq("id", id); if (error) throw error; };
  const actualizarFotoTabla = async (id, fecha, nota, lat, lng) => { const { data, error } = await supabase.from("fotos").update({ fecha: fecha || null, nota: nota || null, lat: lat || null, lng: lng || null }).eq("id", id).select().single(); if (error) throw error; return data; };

  async function obtenerUrlFirmada(path) {
    try {
      const g = urlsFirmadasCache.get(path);
      if (g && g.expira > Date.now()) return g.url;
      if (window.SunOffline) { const off = await window.SunOffline.obtenerImagenOffline(path); if (off) { urlsFirmadasCache.set(path, { url: off, expira: Date.now() + 24 * 3600 * 1000 }); return off; } }
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, URL_EXPIRY);
      if (error) return null;
      urlsFirmadasCache.set(path, { url: data.signedUrl, expira: Date.now() + DURACION_CACHE_URL });
      return data.signedUrl;
    } catch (err) { console.warn("obtenerUrlFirmada:", err); return null; }
  }

  function redimensionarImagen(file, maxSize = 1600) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            try {
              let { width, height } = img;
              if (width > height && width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
              else if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
              const c = document.createElement("canvas"); c.width = width; c.height = height;
              c.getContext("2d").drawImage(img, 0, 0, width, height);
              c.toBlob(b => b ? resolve(b) : reject(new Error("toBlob")), "image/jpeg", 0.85);
            } catch (err) { reject(err); }
          };
          img.onerror = reject; img.src = e.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
      } catch (err) { reject(err); }
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
      const urls = new Map();
      const cola = fotos.slice();
      await Promise.all(Array.from({ length: LIMITE_CONCURRENCIA_URLS }, async () => {
        while (cola.length) { const f = cola.shift(); const url = await obtenerUrlFirmada(f.path); if (url) urls.set(f.id, url); }
      }));
      const frag = document.createDocumentFragment();
      fotos.forEach(f => { const url = urls.get(f.id); if (!url) return; const el = crearPolaroid(f, url); if (el) frag.appendChild(el); });
      grid.appendChild(frag);
      if (document.querySelector("[data-view].active")?.dataset.view === "mapa") renderMapa();
    } catch (err) { console.warn("render:", err); }
    finally { renderEnCurso = false; if (renderPendiente) { renderPendiente = false; render(); } }
  }

  const activarFullscreen = (el, btn) => { const api = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen; if (api) { api.call(el); btn?.setAttribute("aria-pressed", "true"); return; } alert("Tu navegador no admite pantalla completa aquí."); };
  const cerrarFullscreen = () => { const api = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen; if (api && document.fullscreenElement) api.call(document); };
  const fullscreenInteractivo = (article, boton) => {
    article.tabIndex = 0; article.setAttribute("role", "button"); article.setAttribute("aria-label", "Abrir en pantalla completa");
    article.addEventListener("click", e => { if (e.target.closest("button, input, textarea, a")) return; if (document.fullscreenElement === article) return cerrarFullscreen(); activarFullscreen(article, boton); });
    article.addEventListener("keydown", e => { if (e.key !== "Enter" && e.key !== " " && e.target !== article) return; if (e.target !== article) return; e.preventDefault(); activarFullscreen(article, boton); });
  };
  const crearBtn = (cls, svg, title, onClick) => { const b = document.createElement("button"); b.type = "button"; b.className = cls; b.title = title; b.setAttribute("aria-label", title); b.innerHTML = svg; b.addEventListener("click", onClick); return b; };

  function crearPolaroid(foto, url) {
    try {
      const article = document.createElement("article");
      article.className = "polaroid"; fullscreenInteractivo(article);
      const btnDel = crearBtn("polaroid-delete", SVG.trash, "Eliminar foto", e => { e.stopPropagation(); eliminarFoto(foto.id); });
      const btnEdit = crearBtn("polaroid-edit", SVG.edit, "Editar", e => { e.preventDefault(); e.stopPropagation(); abrirModal(foto); });
      const btnFull = crearBtn("polaroid-fullscreen", SVG.expand, "Pantalla completa", e => { e.preventDefault(); e.stopPropagation(); if (document.fullscreenElement === article) { cerrarFullscreen(); return; } activarFullscreen(article, btnFull); });
      const btnClose = crearBtn("polaroid-close", SVG.close, "Salir", e => { e.preventDefault(); e.stopPropagation(); cerrarFullscreen(); });
      const img = document.createElement("img");
      img.src = url; img.alt = foto.nota || "Recuerdo"; img.loading = "lazy";
      const nota = document.createElement("div"); nota.className = "polaroid-nota";
      if (foto.fecha) { const f = document.createElement("span"); f.className = "polaroid-fecha"; f.textContent = fmtFecha(foto.fecha); nota.appendChild(f); }
      if (foto.nota) { const p = document.createElement("p"); p.textContent = foto.nota; nota.appendChild(p); }
      const visual = document.createElement("div"); visual.className = "polaroid-visual"; visual.append(img, nota);
      article.append(btnDel, btnEdit, btnFull, btnClose, visual);
      return article;
    } catch (err) { console.warn("crearPolaroid:", err); return null; }
  }

  async function abrirModal(fotoParaEditar = null) {
    try {
      if (!modal) return;
      fotoEditando = fotoParaEditar;
      modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      form?.reset();
      if (inputPhoto) inputPhoto.required = !fotoParaEditar;
      if (inputPhotoCampo) inputPhotoCampo.hidden = Boolean(fotoParaEditar);
      if (fotoParaEditar) { if (inputDate) inputDate.value = fotoParaEditar.fecha || ""; if (inputNote) inputNote.value = fotoParaEditar.nota || ""; if (inputLat) inputLat.value = fotoParaEditar.lat || ""; if (inputLng) inputLng.value = fotoParaEditar.lng || ""; }
      else if (inputDate) inputDate.value = new Date().toISOString().split("T")[0];
      actualizarEstadoUbicacion();
      if (preview) mostrarContenidoVistaPrevia(fotoParaEditar ? await obtenerUrlFirmada(fotoParaEditar.path) : null);
      if (modalTitle) modalTitle.textContent = fotoParaEditar ? "Editar recuerdo" : "Nuevo recuerdo";
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = fotoParaEditar ? "Actualizar recuerdo" : "Guardar recuerdo"; }
    } catch (err) { console.warn("abrirModal:", err); }
  }

  function cerrarModal() {
    try {
      if (!modal) return;
      modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      fotoEditando = null;
      if (inputPhoto) inputPhoto.required = true;
      if (inputPhotoCampo) inputPhotoCampo.hidden = false;
      if (modalTitle) modalTitle.textContent = "Nuevo recuerdo";
    } catch (err) { console.warn("cerrarModal:", err); }
  }

  function actualizarEstadoUbicacion() {
    if (!photoLocationStatus) return;
    photoLocationStatus.textContent = inputLat?.value && inputLng?.value ? `Ubicación lista: ${Number(inputLat.value).toFixed(4)}, ${Number(inputLng.value).toFixed(4)}` : "No se guardará hasta que tú lo elijas.";
  }
  btnPhotoLocation?.addEventListener("click", () => {
    try {
      if (!navigator.geolocation) { if (photoLocationStatus) photoLocationStatus.textContent = "Tu navegador no permite ubicación."; return; }
      btnPhotoLocation.disabled = true;
      if (photoLocationStatus) photoLocationStatus.textContent = "Obteniendo ubicación...";
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => { inputLat.value = coords.latitude; inputLng.value = coords.longitude; actualizarEstadoUbicacion(); btnPhotoLocation.disabled = false; },
        () => { if (photoLocationStatus) photoLocationStatus.textContent = "No se pudo obtener la ubicación."; btnPhotoLocation.disabled = false; },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } catch (err) { console.warn("geolocation:", err); btnPhotoLocation.disabled = false; }
  });

  let mapaLeaflet = null;
  function renderMapa() {
    try {
      if (!aventurasMap || typeof window.L === "undefined") return;
      const ubicadas = fotos.filter(f => f.lat != null && f.lng != null && f.lat !== "" && f.lng !== "" && Number.isFinite(Number(f.lat)) && Number.isFinite(Number(f.lng)));
      mapaEmpty?.classList.toggle("hidden", ubicadas.length > 0);
      if (!mapaLeaflet) { mapaLeaflet = L.map(aventurasMap).setView([20, 0], 2); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(mapaLeaflet); }
      mapaLeaflet.eachLayer(l => { if (l instanceof L.Marker) mapaLeaflet.removeLayer(l); });
      const puntos = [];
      ubicadas.forEach(f => { const lat = Number(f.lat), lng = Number(f.lng); L.marker([lat, lng]).addTo(mapaLeaflet).bindPopup(`<strong>${f.fecha ? fmtFecha(f.fecha) : "Recuerdo"}</strong><br>${escapeHtml(f.nota || "Sin nota")}`); puntos.push([lat, lng]); });
      if (puntos.length) mapaLeaflet.fitBounds(L.latLngBounds(puntos), { padding: [30, 30], maxZoom: 12 });
      setTimeout(() => mapaLeaflet?.invalidateSize(), 100);
    } catch (err) { console.warn("renderMapa:", err); }
  }

  /* ============================================================
     CHAT
     ============================================================ */
  function renderMensajeChat(m, mapaPerfiles) {
    if (!chatMessages) return;
    const perfil = mapaPerfiles?.[m.user_id] || {};
    const esPropio = m.user_id === usuarioActualId;
    const item = document.createElement("article");
    item.className = `chat-message${esPropio ? " propio" : ""}`;
    const header = document.createElement("div"); header.className = "chat-message-header";
    const av = document.createElement("div"); av.className = "chat-message-avatar";
    if (perfil.avatar_url) av.innerHTML = `<img src="${perfil.avatar_url}" alt="">`; else av.innerHTML = window.ICONO?.persona || "";
    const nombre = document.createElement("span"); nombre.className = "chat-message-nombre"; nombre.textContent = esPropio ? "Tú" : ("@" + (perfil.username || "usuario"));
    header.append(av, nombre);
    const p = document.createElement("p"); p.textContent = m.contenido;
    const t = document.createElement("time"); t.textContent = new Date(m.created_at).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
    item.append(header, p, t);
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function cargarDestinatarios() {
    try {
      const sel = document.getElementById("chat-privado-destinatario");
      if (!sel) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("grupo_miembros").select("user_id").eq("grupo_id", grupoActivo.id).neq("user_id", session.user.id);
      const ids = (data || []).map(m => m.user_id);
      if (!ids.length) { sel.innerHTML = `<option value="">Sin miembros</option>`; return; }
      const { data: perfiles } = await supabase.from("perfiles").select("id,username").in("id", ids);
      sel.innerHTML = `<option value="">— Elige —</option>` + (perfiles || []).map(p => `<option value="${p.id}">@${p.username}</option>`).join("");
      if (chatDestinatario) sel.value = chatDestinatario;
    } catch (e) { console.warn(e); }
  }

  async function recargarChat() {
    try {
      if (chatSubscription) { supabase.removeChannel(chatSubscription); chatSubscription = null; }
      if (!chatMessages) return;
      chatMessages.innerHTML = "";
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let query;
      if (chatModo === "grupo") query = supabase.from("mensajes").select("id,user_id,contenido,created_at").eq("room_id", grupoActivo.id).is("destinatario_id", null).order("created_at", { ascending: true }).limit(100);
      else {
        if (!chatDestinatario) { chatMessages.innerHTML = `<div class="chat-vacio">Elige un destinatario</div>`; return; }
        query = supabase.from("mensajes").select("id,user_id,contenido,created_at,destinatario_id").eq("room_id", grupoActivo.id).or(`and(user_id.eq.${session.user.id},destinatario_id.eq.${chatDestinatario}),and(user_id.eq.${chatDestinatario},destinatario_id.eq.${session.user.id})`).order("created_at", { ascending: true }).limit(100);
      }
      const { data, error } = await query;
      if (error) { if (chatStatus) chatStatus.textContent = "Error al cargar mensajes"; return; }
      const ids = [...new Set((data || []).map(m => m.user_id))];
      const { data: perfiles } = ids.length ? await supabase.from("perfiles").select("id,username,avatar_url").in("id", ids) : { data: [] };
      const mapaPerfiles = Object.fromEntries((perfiles || []).map(p => [p.id, p]));
      (data || []).forEach(m => renderMensajeChat(m, mapaPerfiles));
      if (chatStatus) chatStatus.textContent = chatModo === "grupo" ? "Chat de grupo" : "Chat privado";
      chatSubscription = supabase.channel(`chat-${grupoActivo.id}-${chatModo}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "mensajes", filter: `room_id=eq.${grupoActivo.id}` }, async ({ new: m }) => {
        if (chatModo === "grupo" && m.destinatario_id) return;
        if (chatModo === "privado" && (!m.destinatario_id || (m.user_id !== session.user.id && m.destinatario_id !== session.user.id))) return;
        if (!mapaPerfiles[m.user_id]) { const { data: p } = await supabase.from("perfiles").select("id,username,avatar_url").eq("id", m.user_id).single(); if (p) mapaPerfiles[m.user_id] = p; }
        renderMensajeChat(m, mapaPerfiles);
      }).subscribe();
    } catch (e) { console.warn("recargarChat:", e); }
  }

  document.querySelectorAll("[data-chat-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-chat-tab]").forEach(t => t.classList.toggle("active", t === tab));
      chatModo = tab.dataset.chatTab;
      const sel = document.getElementById("chat-privado-selector");
      if (sel) sel.hidden = chatModo !== "privado";
      if (chatModo === "privado") cargarDestinatarios();
      recargarChat();
    });
  });
  document.getElementById("chat-privado-destinatario")?.addEventListener("change", e => { chatDestinatario = e.target.value || null; recargarChat(); });

  chatForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const original = chatInput?.value.trim();
      if (!original) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alertar({ title: "Inicia sesión", message: "Necesitas una cuenta para escribir.", icon: "🔐" });
      if (chatModo === "privado" && !chatDestinatario) return alertar({ title: "Sin destinatario", message: "Elige a quién enviar el mensaje.", icon: "👤" });
      chatInput.disabled = true;
      let contenido;
      try { contenido = await censurarMensaje(original); } catch { chatInput.disabled = false; return; }
      const ins = { room_id: grupoActivo.id, grupo_id: grupoActivo.id, user_id: session.user.id, contenido, destinatario_id: chatModo === "privado" ? chatDestinatario : null };
      const { data: mensaje, error } = await supabase.from("mensajes").insert(ins).select("id,user_id,contenido,created_at").single();
      chatInput.disabled = false;
      if (error) return alertar({ title: "No se pudo enviar", message: error.message, variant: "danger" });
      chatInput.value = ""; chatInput.focus();
      supabase.functions.invoke("send-push", { body: { message: { ...mensaje, user_id: session.user.id } } }).catch(() => { });
    } catch (err) { console.warn("chat submit:", err); }
  });

  const convertirClaveBase64 = clave => { const padding = "=".repeat((4 - clave.length % 4) % 4); return Uint8Array.from(atob((clave + padding).replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)); };
  async function activarPush() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("Este navegador no admite notificaciones push.");
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") throw new Error("Permite las notificaciones para activar los recordatorios.");
      const registro = await navigator.serviceWorker.ready;
      const applicationServerKey = convertirClaveBase64(PUSH_VAPID_PUBLIC_KEY);
      let sub = await registro.pushManager.getSubscription();
      if (sub) {
        const currentKey = sub.options.applicationServerKey;
        const currentBytes = currentKey ? new Uint8Array(currentKey) : null;
        const sameKey = currentBytes?.length === applicationServerKey.length && currentBytes.every((value, index) => value === applicationServerKey[index]);
        if (!sameKey) {
          if (!await sub.unsubscribe()) throw new Error("No se pudo actualizar la suscripción de notificaciones.");
          sub = null;
        }
      }
      if (!sub) sub = await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Inicia sesión para activar notificaciones.");
      const { error } = await supabase.from("push_subscriptions").upsert({ user_id: session.user.id, endpoint: sub.endpoint, subscription: sub.toJSON() }, { onConflict: "endpoint" });
      if (error) throw error;
      if (btnEnablePush) btnEnablePush.textContent = "Notificaciones activadas";
      return true;
    } catch (err) { console.warn("activarPush:", err); throw err; }
  }
  window._activarNotificacionesPush = activarPush;
  btnEnablePush?.addEventListener("click", () => activarPush().catch(e => alertar({ title: "Error", message: "No se pudieron activar: " + e.message, variant: "danger" })));

  /* ---------- Formulario foto ---------- */
  if (btnAdd) btnAdd.addEventListener("click", () => abrirModal());
  modal?.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", cerrarModal));

  /* ---------- Pegar múltiples fotos en el Álbum ---------- */
  async function procesarYSubirFotosMultiples(archivos) {
    if (!archivos || !archivos.length) return;
    const imagenes = Array.from(archivos).filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(f.name));
    if (!imagenes.length) {
      return alertar({ title: "Sin imágenes válidas", message: "No se encontraron archivos de imagen en lo que intentaste pegar.", icon: "📸" });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return alertar({ title: "Inicia sesión", message: "Debes iniciar sesión para subir fotos al álbum.", icon: "🔒" });
    }
    if (!grupoActivo) await asegurarGrupoActivo();
    if (!grupoActivo) {
      return alertar({ title: "Sin grupo", message: "No se encontró un grupo activo para guardar las fotos.", icon: "👥" });
    }

    const hoy = hoyISO();
    let subidas = 0;
    let fallidas = 0;
    mostrarLoading(`Guardando ${imagenes.length} polaroid${imagenes.length === 1 ? '' : 's'}...`);

    for (let i = 0; i < imagenes.length; i++) {
      const img = imagenes[i];
      if (loadingText) loadingText.textContent = `Guardando polaroid ${i + 1} de ${imagenes.length}...`;
      try {
        const blob = await redimensionarImagen(img, 1600);
        const filePath = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const nueva = await añadirFotoTabla(filePath, hoy, null, null, null);
        fotos.unshift({ id: nueva.id, path: nueva.path, fecha: nueva.fecha, nota: nueva.nota, lat: nueva.lat, lng: nueva.lng });
        subidas++;
      } catch (err) {
        console.warn("Error subiendo foto pegada:", err);
        fallidas++;
      }
    }

    ocultarLoading();
    await render();
    window.dispatchEvent(new Event("sunadventures:progress"));

    if (subidas > 0) {
      alertar({
        title: "¡Recuerdos guardados!",
        message: `Se ${subidas === 1 ? 'ha agregado 1 polaroid' : `han agregado ${subidas} polaroids`} al álbum${fallidas > 0 ? ` (${fallidas} fallaron)` : ''}.`,
        icon: "📷"
      });
    } else {
      alertar({ title: "Error al guardar", message: "No se pudieron subir las imágenes copiadas.", variant: "danger" });
    }
  }

  async function pegarFotosDelPortapapeles() {
    let archivosEncontrados = [];

    // 1) Intentar leer ClipboardItems directamente desde navigator.clipboard.read()
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const items = await navigator.clipboard.read();
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const tiposImg = item.types.filter(t => t.startsWith("image/"));
          for (const tipo of tiposImg) {
            try {
              const blob = await item.getType(tipo);
              if (blob && blob.size > 0) {
                const ext = tipo.split("/")[1] || "jpg";
                const file = new File([blob], `polaroid_${Date.now()}_${i}.${ext}`, { type: tipo });
                archivosEncontrados.push(file);
              }
            } catch (err) {
              console.warn("Error obteniendo blob de clipboard:", err);
            }
          }
          // Si no vino como image/* directa, buscar imágenes incrustadas en text/html copiado
          if (archivosEncontrados.length === 0 && item.types.includes("text/html")) {
            try {
              const htmlBlob = await item.getType("text/html");
              const htmlText = await htmlBlob.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlText, "text/html");
              const imgs = doc.querySelectorAll("img[src]");
              for (const imgEl of imgs) {
                const src = imgEl.src;
                if (src.startsWith("data:image/")) {
                  const res = await fetch(src);
                  const b = await res.blob();
                  archivosEncontrados.push(new File([b], `polaroid_${Date.now()}_data.jpg`, { type: b.type }));
                } else if (src.startsWith("http://") || src.startsWith("https://")) {
                  try {
                    const res = await fetch(src, { mode: "cors" });
                    if (res.ok) {
                      const b = await res.blob();
                      archivosEncontrados.push(new File([b], `polaroid_${Date.now()}_web.jpg`, { type: b.type }));
                    }
                  } catch { }
                }
              }
            } catch (err) {
              console.warn("Error parseando html de portapapeles:", err);
            }
          }
        }
      } catch (err) {
        console.info("navigator.clipboard.read fallo o requirió permiso:", err);
      }
    }

    if (archivosEncontrados.length > 0) {
      await procesarYSubirFotosMultiples(archivosEncontrados);
    } else {
      // Si el portapapeles no contenía imágenes o el navegador no otorgó permiso directo,
      // abrir el selector múltiple como fallback garantizado
      inputPastePhotos?.click();
    }
  }

  btnPastePhotos?.addEventListener("click", () => {
    pegarFotosDelPortapapeles();
  });

  inputPastePhotos?.addEventListener("change", async () => {
    if (inputPastePhotos.files && inputPastePhotos.files.length) {
      const files = Array.from(inputPastePhotos.files);
      inputPastePhotos.value = "";
      await procesarYSubirFotosMultiples(files);
    }
  });

  // Soporte directo para Ctrl+V / Command+V cuando se está en la vista del álbum
  window.addEventListener("paste", async e => {
    const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
    if (vistaActiva !== "album") return;
    const targetTag = e.target?.tagName?.toLowerCase();
    if (targetTag === "input" || targetTag === "textarea") return;

    const items = e.clipboardData?.items;
    if (!items || !items.length) return;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      await procesarYSubirFotosMultiples(files);
    }
  });

  inputPhoto?.addEventListener("change", () => { mostrarVistaPreviaFoto(inputPhoto.files?.[0] || null); actualizarVistaPreviaFotoInfo(); });
  inputDate?.addEventListener("change", () => { const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note"); actualizarContenidoVistaPrevia(date, note); actualizarVistaPreviaFotoInfo(); });
  inputNote?.addEventListener("input", () => { const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note"); actualizarContenidoVistaPrevia(date, note); actualizarVistaPreviaFotoInfo(); });

  function mostrarVistaPreviaFoto(file) {
    if (!file) { mostrarContenidoVistaPrevia(null); return; }
    mostrarContenidoVistaPrevia(URL.createObjectURL(file));
  }
  function mostrarContenidoVistaPrevia(url) {
    if (!preview) return;
    preview.innerHTML = "";
    if (url) { const img = document.createElement("img"); img.src = url; img.alt = "Vista previa"; preview.appendChild(img); }
    else { const ph = document.createElement("div"); ph.className = "photo-preview-placeholder"; ph.textContent = "Selecciona una foto para verla aquí"; preview.appendChild(ph); }
    const cap = document.createElement("div"); cap.className = "photo-preview-caption";
    const date = document.createElement("span"); date.className = "photo-preview-date";
    const note = document.createElement("p"); note.className = "photo-preview-note";
    cap.append(date, note); preview.appendChild(cap);
    actualizarContenidoVistaPrevia(date, note);
  }
  function actualizarContenidoVistaPrevia(date, note) {
    if (date) date.textContent = inputDate?.value ? fmtFecha(inputDate.value) : "Sin fecha";
    if (note) note.textContent = inputNote?.value.trim() || "Tu nota aparecerá aquí";
  }
  function actualizarVistaPreviaFotoInfo() {
    const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note");
    actualizarContenidoVistaPrevia(date, note);
    if (!photoPreviewInfo) return;
    const hayFoto = Boolean(inputPhoto?.files?.length);
    photoPreviewInfo.hidden = !hayFoto;
    if (hayFoto) { const fecha = inputDate?.value || "Sin fecha"; const texto = inputNote?.value.trim(); photoPreviewInfo.textContent = texto ? `${fecha} · ${texto}` : fecha; }
  }

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (subiendoFoto) return;
    subiendoFoto = true;
    try {
      const fecha = inputDate?.value || "", nota = inputNote?.value.trim() || "";
      if (fotoEditando) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Actualizando..."; }
        try {
          const act = await actualizarFotoTabla(fotoEditando.id, fecha, nota, parseCoord(inputLat?.value), parseCoord(inputLng?.value));
          const idx = fotos.findIndex(f => f.id === fotoEditando.id);
          if (idx !== -1) fotos[idx] = { ...fotos[idx], fecha: act.fecha, nota: act.nota, lat: act.lat, lng: act.lng };
          cerrarModal(); await render(); window.dispatchEvent(new Event("sunadventures:progress"));
        } catch (err) { alertar({ title: "No se pudo actualizar", message: err.message || String(err), variant: "danger" }); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Actualizar recuerdo"; } }
        finally { subiendoFoto = false; }
        return;
      }
      const file = inputPhoto?.files[0];
      if (!file) { alertar({ title: "Falta la foto", message: "Selecciona una imagen primero.", icon: "📸" }); subiendoFoto = false; return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Subiendo..."; }
      mostrarLoading("Guardando recuerdo...");
      try {
        const blob = await redimensionarImagen(file, 1600);
        const filePath = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const nueva = await añadirFotoTabla(filePath, fecha, nota, parseCoord(inputLat?.value), parseCoord(inputLng?.value));
        fotos.unshift({ id: nueva.id, path: nueva.path, fecha: nueva.fecha, nota: nueva.nota, lat: nueva.lat, lng: nueva.lng });
        cerrarModal(); await render(); window.dispatchEvent(new Event("sunadventures:progress"));
      } catch (err) { alertar({ title: "No se pudo subir", message: err.message || String(err), variant: "danger" }); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Guardar recuerdo"; } }
      finally { subiendoFoto = false; ocultarLoading(); }
    } catch (err) { console.error(err); subiendoFoto = false; ocultarLoading(); }
  });

  async function eliminarFoto(id) {
    try {
      const ok = await confirmar({ title: "¿Eliminar esta aventura?", message: "La foto se borrará del álbum para siempre.", variant: "danger", icon: "🗑️", confirmText: "Sí, eliminar", cancelText: "Cancelar" });
      if (!ok) return;
      const foto = fotos.find(f => f.id === id);
      if (!foto) return;
      try { await supabase.storage.from(BUCKET_NAME).remove([foto.path]); } catch { }
      await eliminarFotoTabla(foto.id);
      fotos = fotos.filter(f => f.id !== id);
      urlsFirmadasCache.delete(foto.path);
      await render();
    } catch (err) { alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" }); }
  }

  /* ============================================================
     NOTAS
     ============================================================ */
  async function cargarNotas() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { notas = []; return; }
      if (!grupoActivo) await asegurarGrupoActivo();
      if (!grupoActivo) { notas = []; return; }
      const { data, error } = await supabase.from("notas")
        .select("id,titulo,contenido,color,created_at,grupo_id")
        .eq("grupo_id", grupoActivo.id)
        .order("created_at", { ascending: false });
      if (error) { console.warn("cargarNotas error:", error); notas = []; return; }
      notas = (data || []).map(n => ({ id: n.id, titulo: n.titulo, contenido: n.contenido, color: n.color || "amarillo", created_at: n.created_at, grupo_id: n.grupo_id }));
    } catch (err) { console.warn("cargarNotas:", err); notas = []; }
  }
  const añadirNotaTabla = async (titulo, contenido, color) => { const { data: { session } } = await supabase.auth.getSession(); if (!session) throw new Error("No hay sesión"); const { data, error } = await supabase.from("notas").insert({ user_id: session.user.id, grupo_id: grupoActivo.id, titulo: titulo || null, contenido, color: color || "amarillo" }).select().single(); if (error) throw error; return data; };
  const eliminarNotaTabla = async id => { const { error } = await supabase.from("notas").delete().eq("id", id); if (error) throw error; };
  const actualizarNotaTabla = async (id, titulo, contenido, color) => { const { data, error } = await supabase.from("notas").update({ titulo: titulo || null, contenido, color: color || "amarillo" }).eq("id", id).select().single(); if (error) throw error; return data; };

  function renderNotas() {
    try {
      if (!notasGrid) return;
      notasGrid.innerHTML = "";
      if (notas.length === 0) { notasEmpty?.classList.remove("hidden"); return; }
      notasEmpty?.classList.add("hidden");
      const frag = document.createDocumentFragment();
      notas.forEach(n => frag.appendChild(crearNotaPolaroid(n)));
      notasGrid.appendChild(frag);
    } catch (err) { console.warn("renderNotas:", err); }
  }

  function crearNotaPolaroid(nota) {
    try {
      const article = document.createElement("article");
      article.className = "nota color-" + (nota.color || "amarillo");
      fullscreenInteractivo(article);
      const btnDel = crearBtn("nota-delete", SVG.trash, "Eliminar nota", e => { e.stopPropagation(); eliminarNota(nota.id); });
      const btnFull = crearBtn("nota-fullscreen", SVG.expand, "Pantalla completa", e => { e.preventDefault(); e.stopPropagation(); if (document.fullscreenElement === article) { cerrarFullscreen(); return; } activarFullscreen(article, btnFull); });
      const btnEdit = crearBtn("nota-edit", SVG.edit, "Editar nota", e => { e.preventDefault(); e.stopPropagation(); abrirNotaModal(nota); });
      article.append(btnDel, btnFull, btnEdit);
      if (nota.titulo) { const h3 = document.createElement("h3"); h3.className = "nota-titulo"; h3.textContent = nota.titulo; article.appendChild(h3); }
      const wrap = document.createElement("div"); wrap.className = "nota-contenido-wrap";
      const lineas = (nota.contenido || "").split(/\r?\n/);
      if (lineas.length === 0 || (lineas.length === 1 && lineas[0].trim() === "")) { const p = document.createElement("p"); p.className = "nota-contenido"; p.textContent = nota.contenido || ""; wrap.appendChild(p); }
      else { lineas.forEach(linea => { const row = document.createElement("div"); row.className = "nota-linea"; const cb = document.createElement("input"); cb.type = "checkbox"; cb.className = "nota-check"; cb.setAttribute("aria-label", "Marcar línea"); const txt = document.createElement("span"); txt.className = "nota-texto"; txt.textContent = linea.trim() || " "; cb.addEventListener("change", () => txt.classList.toggle("tachada", cb.checked)); row.append(cb, txt); wrap.appendChild(row); }); }
      article.appendChild(wrap);
      if (nota.created_at) { const f = document.createElement("span"); f.className = "nota-fecha"; f.textContent = fmtFechaNota(nota.created_at); article.appendChild(f); }
      return article;
    } catch (err) { console.warn("crearNotaPolaroid:", err); return document.createElement("div"); }
  }

  function abrirNotaModal(notaParaEditar = null) {
    try {
      if (!notaModal) return;
      notaEditando = notaParaEditar;
      notaModal.classList.add("active"); notaModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      notaForm?.reset();
      colorSeleccionado = notaParaEditar?.color || "amarillo";
      if (notaParaEditar) { if (notaTitulo) notaTitulo.value = notaParaEditar.titulo || ""; if (notaContenido) notaContenido.value = notaParaEditar.contenido || ""; }
      if (notaTituloCampo) notaTituloCampo.hidden = Boolean(notaParaEditar);
      if (notaColorCampo) notaColorCampo.hidden = Boolean(notaParaEditar);
      if (notaModalTitle) notaModalTitle.textContent = notaParaEditar ? "Editar texto" : "Nueva notita";
      document.querySelectorAll(".color-option").forEach(opt => opt.classList.toggle("activo", opt.dataset.color === colorSeleccionado));
      if (notaSubmitBtn) { notaSubmitBtn.disabled = false; notaSubmitBtn.textContent = notaParaEditar ? "Actualizar texto" : "Guardar notita"; }
      actualizarVistaPreviaNota();
      setTimeout(() => notaTitulo?.focus(), 100);
    } catch (err) { console.warn("abrirNotaModal:", err); }
  }

  function actualizarVistaPreviaNota() {
    try {
      if (!notaPreview) return;
      notaPreview.className = `nota-preview color-${colorSeleccionado}`;
      notaPreview.innerHTML = "";
      const t = document.createElement("strong"); t.textContent = notaTitulo?.value.trim() || "Sin título";
      const c = document.createElement("span"); c.textContent = notaContenido?.value.trim() || "Escribe algo para ver la vista previa...";
      notaPreview.append(t, c); notaPreview.hidden = false;
    } catch (err) { console.warn("actualizarVistaPreviaNota:", err); }
  }

  function cerrarNotaModal() {
    try {
      if (!notaModal) return;
      notaModal.classList.remove("active"); notaModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      notaEditando = null;
      if (notaTituloCampo) notaTituloCampo.hidden = false;
      if (notaColorCampo) notaColorCampo.hidden = false;
      if (notaModalTitle) notaModalTitle.textContent = "Nueva notita";
    } catch (err) { console.warn("cerrarNotaModal:", err); }
  }

  async function eliminarNota(id) {
    try {
      const ok = await confirmar({ title: "¿Eliminar esta notita?", message: "Perderás este texto para siempre.", variant: "danger", icon: "📝", confirmText: "Sí, borrar", cancelText: "Mantener" });
      if (!ok) return;
      await eliminarNotaTabla(id);
      notas = notas.filter(n => n.id !== id);
      renderNotas();
      window.dispatchEvent(new Event("sunadventures:progress"));
    } catch (err) { alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" }); }
  }

  btnAddNota?.addEventListener("click", () => abrirNotaModal());
  notaModal?.querySelectorAll("[data-close-nota-modal]").forEach(el => el.addEventListener("click", cerrarNotaModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && notaModal?.classList.contains("active")) cerrarNotaModal(); });
  document.querySelectorAll(".color-option").forEach(opt => opt.addEventListener("click", () => { document.querySelectorAll(".color-option").forEach(o => o.classList.remove("activo")); opt.classList.add("activo"); colorSeleccionado = opt.dataset.color; actualizarVistaPreviaNota(); }));

  notaForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const titulo = notaTitulo?.value.trim() || "", contenido = notaContenido?.value.trim() || "";
      if (!contenido) return alertar({ title: "Nota vacía", message: "Escribe algo en la notita.", icon: "✏️" });
      if (notaSubmitBtn) { notaSubmitBtn.disabled = true; notaSubmitBtn.textContent = "Guardando..."; }
      try {
        if (notaEditando) {
          const act = await actualizarNotaTabla(notaEditando.id, notaEditando.titulo, contenido, notaEditando.color);
          const idx = notas.findIndex(n => n.id === notaEditando.id);
          if (idx !== -1) notas[idx] = { id: act.id, titulo: act.titulo, contenido: act.contenido, color: act.color, created_at: act.created_at };
        } else {
          const colorFinal = colorSeleccionado || document.querySelector(".color-option.activo")?.dataset.color || "amarillo";
          const nueva = await añadirNotaTabla(titulo, contenido, colorFinal);
          notas.unshift({ id: nueva.id, titulo: nueva.titulo, contenido: nueva.contenido, color: nueva.color, created_at: nueva.created_at });
        }
        cerrarNotaModal(); renderNotas(); window.dispatchEvent(new Event("sunadventures:progress"));
      } catch (err) { alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" }); if (notaSubmitBtn) { notaSubmitBtn.disabled = false; notaSubmitBtn.textContent = notaEditando ? "Actualizar texto" : "Guardar notita"; } }
    } catch (err) { console.warn("nota submit:", err); }
  });

  /* ============================================================
     PLAYLISTS
     ============================================================ */
  async function cargarPlaylists() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { playlists = []; return; }
      if (!grupoActivo) await asegurarGrupoActivo();
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
  const añadirPlaylistTabla = async (nombre, descripcion, emoji, color) => { const { data: { session } } = await supabase.auth.getSession(); if (!session) throw new Error("No hay sesión"); const { data, error } = await supabase.from("playlists").insert({ user_id: session.user.id, grupo_id: grupoActivo.id, nombre, descripcion: descripcion || null, emoji: emoji || "music", color: color || "amarillo", canciones: [] }).select().single(); if (error) throw error; return data; };
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
      actualizarEstadoReproduciendo();
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
          // ✅ Archivo local → botón play dentro del reproductor
          const btnPlay = crearBtn("cancion-item-link", SVG.play, "Reproducir en la app", () =>
            iniciarColaDesdePlaylist(playlistEditando, index)
          );
          item.appendChild(btnPlay);
        } else {
          // 🔗 Enlace externo → abrir en pestaña nueva
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
      window.dispatchEvent(new Event("sunadventures:progress"));
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

  /* ---------- Formulario "una a una" ---------- */
  cancionForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      const titulo = cancionTitulo?.value.trim() || "";
      const artista = cancionArtista?.value.trim() || "";
      const url = cancionUrl?.value.trim() || "";
      if (!titulo) return alertar({ title: "Falta el título", message: "Ponle un título a la canción.", icon: "🎵" });

      // Validar URL si la hay: solo Spotify o YouTube
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

  /* ---------- Pegar varias ---------- */
  const cancionesPegarTexto = $("cancion-pegar-texto"), cancionesPegarPreview = $("cancion-pegar-preview"), btnImportarCanciones = $("btn-importar-canciones");
  const cancionPegarArchivo = $("cancion-pegar-archivo"), btnCargarArchivo = $("btn-cargar-archivo");
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

  /* ---------- Subir archivos propios ---------- */
  const cancionSubirArchivo = $("cancion-subir-archivo");
  const btnSeleccionarArchivos = $("btn-seleccionar-archivos");
  const cancionSubirDropzone = $("cancion-subir-dropzone");
  const cancionSubirLista = $("cancion-subir-lista");
  const btnSubirCanciones = $("btn-subir-canciones");

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

      // ⚖️ Aviso legal: solo música propia
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

  /* ============================================================
     PLAYER — 100% local
     ============================================================ */
  const mostrarPlayerBar = () => {
    if (!playerBar) return;
    playerBar.classList.add("visible");
    playerBar.setAttribute("aria-hidden", "false");
    document.body.classList.add("player-abierto");
  };
  const actualizarIconoVolumen = () => {
    if (!playerVolumeBtn) return;
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
    if (playerVolume) playerVolume.value = volumenActual;
    actualizarIconoVolumen();
  }
  window.addEventListener("sunadventures:volume-change", event => {
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

  /**
   * Inicia la cola solo con canciones locales (storage:).
   * Si la canción pulsada es un enlace externo → se abre en pestaña nueva.
   */
  function iniciarColaDesdePlaylist(playlistId, indiceInicial) {
    try {
      const pl = playlists.find(p => p.id === playlistId);
      if (!pl) return;
      const inicial = pl.canciones[indiceInicial];
      if (!inicial) return;

      // Enlaces externos (Spotify/YouTube) → abrir en pestaña nueva
      if (inicial.url && !inicial.url.startsWith("storage:")) {
        window.open(inicial.url, "_blank", "noopener,noreferrer");
        return;
      }

      // Construir cola SOLO con archivos locales
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

      // Solo archivos locales
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

      // Preferimos copia offline (si existe)
      if (window.SunOffline) audioUrl = await window.SunOffline.obtenerCancionOffline(item.url);

      // Si no, pedimos signed URL al bucket
      if (!audioUrl) {
        const { data, error } = await supabase.storage
          .from(BUCKET_CANCIONES)
          .createSignedUrl(path, URL_EXPIRY_CANCIONES);
        if (error || !data?.signedUrl) throw error || new Error("Sin URL");
        audioUrl = data.signedUrl;
      }

      globalAudio.src = audioUrl;
      globalAudio.currentTime = 0;

      if (playerCoverIcon) {
        playerCoverIcon.innerHTML = esVideo(ext(path)) ? SVG.image : SVG.music;
      }
      playerCurrent.textContent = "0:00";
      playerDuration.textContent = "0:00";
      delete playerDuration.dataset.seconds;

      try {
        await globalAudio.play();
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
    if (playerVolume) playerVolume.value = globalAudio.volume;
  });
  playerVolume?.addEventListener("input", () => {
    if (!globalAudio) return;
    const v = parseFloat(playerVolume.value);
    window.dispatchEvent(new CustomEvent("sunadventures:volume-change", { detail: { volume: v } }));
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
    if (playerDuration) playerDuration.textContent = fmtTiempo(globalAudio.duration || 0);
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
      const items = cancionesLista?.querySelectorAll(".cancion-item");
      if (!items) return;
      items.forEach(i => i.classList.remove("reproduciendo"));
      if (!actual) return;
      const pl = playlists.find(p => p.id === playlistEditando);
      if (!pl) return;
      items.forEach((item, i) => { if (pl.canciones[i]?.url === actual.url) item.classList.add("reproduciendo"); });
    } catch (err) { console.warn("actualizarEstadoReproduciendo:", err); }
  }

  /* ---------- Hooks para watch-party ---------- */
  window._playerQueue = () => ({ cola: [...colaReproduccion], indice: indiceReproduccion });
  window._wpColaActual = () => colaReproduccion[indiceReproduccion] || null;
  Object.defineProperty(window, "globalAudio", { get: () => globalAudio, configurable: true });
  Object.defineProperty(window, "proveedorActual", { get: () => "local", configurable: true });
  window._wpReproducirUrl = url => {
    if (!url?.startsWith("storage:")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const pl = playlists.find(p => p.canciones.some(c => c.url === url));
    if (!pl) return;
    const idx = pl.canciones.findIndex(c => c.url === url);
    playlistEditando = pl.id;
    iniciarColaDesdePlaylist(pl.id, idx);
  };

  /* ============================================================
     EVENTOS / CALENDARIO
     ============================================================ */
  async function cargarEventos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { eventos = []; return; }
      const { data, error } = await supabase.from("eventos").select("id,titulo,descripcion,fecha,color,recordatorio_dias,recurrente").eq("user_id", session.user.id).order("fecha", { ascending: true });
      if (error) { eventos = []; return; }
      eventos = (data || []).map(e => ({ id: e.id, titulo: e.titulo, descripcion: e.descripcion, fecha: e.fecha, color: e.color || "amarillo", recordatorio_dias: e.recordatorio_dias ?? 1, recurrente: !!e.recurrente }));
    } catch (err) { console.warn("cargarEventos:", err); eventos = []; }
  }
  const añadirEventoTabla = async (titulo, descripcion, fecha, color, recordatorio, recurrente) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");
    const { data, error } = await supabase.from("eventos").insert({
      user_id: session.user.id, titulo, descripcion: descripcion || null, fecha,
      color: color || "amarillo", recordatorio_dias: recordatorio, recurrente
    }).select().single();
    if (error) throw error;
    return data;
  };
  const eliminarEventoTabla = async id => { const { error } = await supabase.from("eventos").delete().eq("id", id); if (error) throw error; };

  function renderCalendario() {
    try {
      if (!calGrid) return;
      if (calMesActual) calMesActual.textContent = `${MESES_LARGOS[mesMostrado.getMonth()]} ${mesMostrado.getFullYear()}`;
      calGrid.innerHTML = "";
      const año = mesMostrado.getFullYear(), mes = mesMostrado.getMonth();
      let offset = new Date(año, mes, 1).getDay() - 1;
      if (offset < 0) offset = 6;
      const ultimoDia = new Date(año, mes + 1, 0).getDate();
      const diasAnt = new Date(año, mes, 0).getDate();
      const total = Math.ceil((offset + ultimoDia) / 7) * 7;
      const hoy = hoyISO();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const celda = document.createElement("button");
        celda.type = "button"; celda.className = "cal-dia";
        let num, fecha;
        if (i < offset) { num = diasAnt - offset + i + 1; fecha = new Date(año, mes - 1, num); celda.classList.add("otro-mes"); }
        else if (i >= offset + ultimoDia) { num = i - offset - ultimoDia + 1; fecha = new Date(año, mes + 1, num); celda.classList.add("otro-mes"); }
        else { num = i - offset + 1; fecha = new Date(año, mes, num); }
        const iso = fechaISO(fecha);
        if (iso === hoy) celda.classList.add("hoy");
        const span = document.createElement("span"); span.className = "cal-dia-numero"; span.textContent = num; celda.appendChild(span);
        const evs = eventosDelDia(iso);
        if (evs.length) {
          const dots = document.createElement("div");
          dots.className = "cal-dia-eventos";
          evs.slice(0, 4).forEach(ev => {
            const d = document.createElement("span");
            d.className = `cal-evento-punto color-${ev.color}`;
            dots.appendChild(d);
          });
          celda.appendChild(dots);
        }
        celda.addEventListener("click", () => abrirEventoModal(iso));
        frag.appendChild(celda);
      }
      calGrid.appendChild(frag);
      renderProximos(); actualizarEmptyCalendario();
    } catch (err) { console.warn("renderCalendario:", err); }
  }
  function eventosDelDia(iso) { return eventos.filter(ev => { if (!ev.recurrente) return ev.fecha === iso; const [, mEv, dEv] = ev.fecha.split("-"); const [, mIso, dIso] = iso.split("-"); return mEv === mIso && dEv === dIso; }); }
  function proximaFechaEvento(ev) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = ev.fecha.split("-").map(Number);
    if (ev.recurrente) {
      const este = new Date(hoy.getFullYear(), m - 1, d);
      return este < hoy ? new Date(hoy.getFullYear() + 1, m - 1, d) : este;
    }
    return new Date(y, m - 1, d);
  }
  const diasHasta = fecha => {
    const h = new Date(); h.setHours(0, 0, 0, 0);
    const f = new Date(fecha); f.setHours(0, 0, 0, 0);
    return Math.round((f - h) / 86400000);
  };

  function renderProximos() {
    try {
      if (!calProximos) return;
      calProximos.innerHTML = "";
      const conFecha = eventos
        .map(ev => ({ ev, p: proximaFechaEvento(ev) }))
        .filter(x => diasHasta(x.p) >= 0)
        .sort((a, b) => a.p - b.p)
        .slice(0, 8);
      if (!conFecha.length) { calProximosVacio?.classList.remove("hidden"); return; }
      calProximosVacio?.classList.add("hidden");
      const frag = document.createDocumentFragment();
      conFecha.forEach(({ ev, p }) => frag.appendChild(crearItemProximo(ev, p)));
      calProximos.appendChild(frag);
    } catch (err) { console.warn("renderProximos:", err); }
  }

  function crearItemProximo(ev, proxima) {
    try {
      const item = document.createElement("div");
      item.className = "cal-proximo-item color-" + ev.color;
      const fb = document.createElement("div"); fb.className = "cal-proximo-fecha";
      const dia = document.createElement("span"); dia.className = "cal-proximo-dia"; dia.textContent = proxima.getDate();
      const mes = document.createElement("span"); mes.className = "cal-proximo-mes"; mes.textContent = MESES_LARGOS[proxima.getMonth()].slice(0, 3);
      fb.append(dia, mes);
      const info = document.createElement("div"); info.className = "cal-proximo-info";
      const t = document.createElement("span"); t.className = "cal-proximo-titulo"; t.textContent = ev.titulo; info.appendChild(t);
      if (ev.descripcion) { const d = document.createElement("span"); d.className = "cal-proximo-desc"; d.textContent = ev.descripcion; info.appendChild(d); }
      const diff = diasHasta(proxima);
      const cuando = document.createElement("span"); cuando.className = "cal-proximo-cuando";
      if (diff === 0) { cuando.classList.add("hoy"); cuando.textContent = "¡HOY!"; }
      else if (diff === 1) cuando.textContent = "Mañana";
      else if (diff < 7) cuando.textContent = `En ${diff} días`;
      else if (diff < 30) cuando.textContent = `En ${Math.round(diff / 7)} sem.`;
      else cuando.textContent = `En ${Math.round(diff / 30)} meses`;
      const btn = crearBtn("cal-proximo-delete", SVG.close, "Eliminar fecha", e => { e.stopPropagation(); eliminarEvento(ev.id); });
      item.append(fb, info, cuando, btn);
      item.addEventListener("click", () => {
        mesMostrado = new Date(proxima.getFullYear(), proxima.getMonth(), 1);
        renderCalendario();
        document.querySelector(".calendario-wrapper")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return item;
    } catch (err) { console.warn("crearItemProximo:", err); return document.createElement("div"); }
  }

  const actualizarEmptyCalendario = () => { if (!calendarioEmpty) return; calendarioEmpty.classList.toggle("hidden", eventos.length > 0); };

  function abrirEventoModal(fechaPrefill) {
    try {
      if (!eventoModal) return;
      eventoModal.classList.add("active"); eventoModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      eventoForm?.reset();
      colorEventoSeleccionado = "amarillo";
      document.querySelectorAll("#evento-form .color-option").forEach(o => o.classList.toggle("activo", o.dataset.color === "amarillo"));
      if (eventoFecha) eventoFecha.value = fechaPrefill || hoyISO();
      if (eventoSubmitBtn) { eventoSubmitBtn.disabled = false; eventoSubmitBtn.textContent = "Guardar fecha"; }
      setTimeout(() => eventoTitulo?.focus(), 100);
    } catch (err) { console.warn("abrirEventoModal:", err); }
  }
  function cerrarEventoModal() {
    try {
      if (!eventoModal) return;
      eventoModal.classList.remove("active"); eventoModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
    } catch { }
  }

  async function eliminarEvento(id) {
    try {
      const ok = await confirmar({ title: "¿Eliminar esta fecha?", message: "El evento se borrará del calendario.", variant: "danger", icon: "📅", confirmText: "Sí, eliminar", cancelText: "Cancelar" });
      if (!ok) return;
      await eliminarEventoTabla(id);
      eventos = eventos.filter(e => e.id !== id);
      renderCalendario();
    } catch (err) { alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" }); }
  }

  btnAddEvento?.addEventListener("click", () => abrirEventoModal());
  eventoModal?.querySelectorAll("[data-close-evento-modal]").forEach(el => el.addEventListener("click", cerrarEventoModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && eventoModal?.classList.contains("active")) cerrarEventoModal(); });
  document.querySelectorAll("#evento-form .color-option").forEach(opt => opt.addEventListener("click", () => {
    document.querySelectorAll("#evento-form .color-option").forEach(o => o.classList.remove("activo"));
    opt.classList.add("activo"); colorEventoSeleccionado = opt.dataset.color;
  }));
  calPrev?.addEventListener("click", () => { mesMostrado.setMonth(mesMostrado.getMonth() - 1); renderCalendario(); });
  calNext?.addEventListener("click", () => { mesMostrado.setMonth(mesMostrado.getMonth() + 1); renderCalendario(); });

  eventoForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const titulo = eventoTitulo?.value.trim() || "", descripcion = eventoDescripcion?.value.trim() || "", fecha = eventoFecha?.value || "";
      const recordatorio = parseInt(eventoRecordatorio?.value ?? "1", 10), recurrente = !!eventoRecurrente?.checked;
      if (!titulo || !fecha) return alertar({ title: "Faltan datos", message: "Rellena título y fecha.", icon: "📅" });
      if (eventoSubmitBtn) { eventoSubmitBtn.disabled = true; eventoSubmitBtn.textContent = "Guardando..."; }
      try {
        await pedirPermisoNotificacionesSilencioso();
        const nuevo = await añadirEventoTabla(titulo, descripcion, fecha, colorEventoSeleccionado, recordatorio, recurrente);
        eventos.push({ id: nuevo.id, titulo: nuevo.titulo, descripcion: nuevo.descripcion, fecha: nuevo.fecha, color: nuevo.color, recordatorio_dias: nuevo.recordatorio_dias, recurrente: nuevo.recurrente });
        eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
        cerrarEventoModal(); renderCalendario(); comprobarRecordatorios();
      } catch (err) {
        alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" });
        if (eventoSubmitBtn) { eventoSubmitBtn.disabled = false; eventoSubmitBtn.textContent = "Guardar fecha"; }
      }
    } catch (err) { console.warn("evento submit:", err); }
  });

  const NOTIF_PREFIX = "notif_ev_";
  const notifSoportadas = () => "Notification" in window;
  async function pedirPermisoNotificacionesSilencioso() {
    try {
      if (!notifSoportadas()) return false;
      if (Notification.permission === "granted") return true;
      if (Notification.permission === "denied") return false;
      const r = await Notification.requestPermission();
      actualizarBotonNotifPermiso();
      return r === "granted";
    } catch { return false; }
  }
  async function pedirPermisoNotificacionesManual() {
    try {
      if (!notifSoportadas()) return alertar({ title: "No compatible", message: "Tu navegador no soporta notificaciones.", icon: "🔕" });
      const r = await Notification.requestPermission();
      actualizarBotonNotifPermiso();
      if (r === "granted") { alertar({ title: "¡Listo!", message: "Notificaciones activadas.", variant: "success", icon: "🔔" }); comprobarRecordatorios(); }
      else if (r === "denied") alertar({ title: "Bloqueadas", message: "Has bloqueado las notificaciones. Actívalas desde la configuración del navegador.", variant: "warning", icon: "🔕" });
    } catch (err) { console.warn("pedirPermiso:", err); }
  }
  const actualizarBotonNotifPermiso = () => {
    if (!btnNotifPermiso) return;
    btnNotifPermiso.style.display = (!notifSoportadas() || Notification.permission !== "default") ? "none" : "inline-flex";
  };
  btnNotifPermiso?.addEventListener("click", pedirPermisoNotificacionesManual);

  function comprobarRecordatorios() {
    try {
      if (!notifSoportadas() || Notification.permission !== "granted" || !eventos.length) return;
      const hoy = hoyISO();
      eventos.forEach(ev => {
        const p = proximaFechaEvento(ev), diff = diasHasta(p);
        if (diff < 0 || diff > ev.recordatorio_dias) return;
        const key = `${NOTIF_PREFIX}${ev.id}_${hoy}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
        let cuerpo;
        if (diff === 0) cuerpo = "¡Es hoy! " + (ev.descripcion || "");
        else if (diff === 1) cuerpo = "Es mañana " + (ev.descripcion || "");
        else cuerpo = `Faltan ${diff} días · ` + (ev.descripcion || "");
        try {
          new Notification(ev.titulo, { body: cuerpo.trim(), icon: "img/girasol.jpg", tag: `evento-${ev.id}` });
        } catch { }
      });
    } catch (err) { console.warn("comprobarRecordatorios:", err); }
  }
  setTimeout(comprobarRecordatorios, 3000);
  setInterval(comprobarRecordatorios, 3600000);
  actualizarBotonNotifPermiso();

  mostrarLoading("Cargando recuerdos...");

  /* ============================================================
     AUTH UI
     ============================================================ */
  async function updateAuthUI(session) {
    try {
      const logueado = !!session;
      if (btnOpenLogin) btnOpenLogin.style.display = logueado ? "none" : "inline-flex";
      if (userInfo) userInfo.style.display = logueado ? "flex" : "none";
      if (logueado && userEmail) {
        const n = localStorage.getItem("sunadventures_username") || session.user.email.split("@")[0];
        userEmail.textContent = n;
        const dn = $("user-dropdown-name"); if (dn) dn.textContent = n;
        window._sunUserEmail = session.user.email;
      }
      if (btnAdd) btnAdd.style.display = logueado ? "inline-block" : "none";
      if (btnAddNota) btnAddNota.style.display = logueado ? "inline-block" : "none";
      if (logueado) {
        await asegurarGrupoActivo();
        try {
          const { data: perfil } = await supabase.from("perfiles").select("username,avatar_url").eq("id", session.user.id).single();
          if (perfil?.avatar_url) {
            const av = document.querySelector(".user-avatar");
            if (av) av.innerHTML = `<img src="${perfil.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
          }
          if (perfil?.username) {
            localStorage.setItem("sunadventures_username", perfil.username);
            const ue = $("user-email"); if (ue) ue.textContent = perfil.username;
            const udn = $("user-dropdown-name"); if (udn) udn.textContent = perfil.username;
          }
        } catch { }
        localStorage.setItem("sunadventures_uid", session.user.id);
        window._sunUserId = session.user.id;
        window.dispatchEvent(new Event("sunadventures:user-ready"));
        registrarVisita();
        await Promise.all([cargarFotos(), cargarNotas(), cargarPlaylists(), cargarEventos()]);
        await Promise.all([render(), Promise.resolve(renderNotas()), Promise.resolve(renderPlaylists()), Promise.resolve(renderCalendario()), Promise.resolve(renderLogros())]);
        renderExperiencia();
        if (typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
      } else {
        localStorage.removeItem("sunadventures_uid");
        window._sunUserId = null;
        window._sunUserEmail = "";
        fotos = []; notas = []; playlists = []; eventos = [];
        if (grid) grid.innerHTML = ""; if (empty) empty.classList.remove("hidden");
        if (notasGrid) notasGrid.innerHTML = ""; if (notasEmpty) notasEmpty.classList.remove("hidden");
        if (playlistsGrid) playlistsGrid.innerHTML = ""; if (playlistsEmpty) playlistsEmpty.classList.remove("hidden");
        if (calGrid) calGrid.innerHTML = ""; if (calProximos) calProximos.innerHTML = "";
        if (calProximosVacio) calProximosVacio.classList.remove("hidden");
        if (calendarioEmpty) calendarioEmpty.classList.remove("hidden");
        const mGrid = $("mascotas-grid"); if (mGrid) mGrid.innerHTML = "";
        renderExperiencia();
        window.dispatchEvent(new Event("sunadventures:user-logout"));
      }
      if (logueado && authModal) cerrarAuthModal();
    } catch (err) { console.error("updateAuthUI:", err); }
    finally { ocultarLoading(); }
  }
  supabase.auth.onAuthStateChange((_e, session) => {
    colaSesion = colaSesion.then(() => updateAuthUI(session)).catch(err => console.error(err));
  });
  setTimeout(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      colaSesion = colaSesion.then(() => updateAuthUI(session)).catch(err => console.error(err));
    } catch (err) { console.error("getSession:", err); ocultarLoading(); }
  }, 100);

  function abrirAuthModal() {
    try {
      if (!authModal) return;
      if (authSubmit) authSubmit.disabled = false;
      modoRegistro = false; setModoRegistro(false); authForm?.reset(); ocultarError();
      const recordar = $("auth-recordar");
      const guardado = localStorage.getItem("sunadventures_usuario_recordado");
      if (guardado && authUsername) { authUsername.value = guardado; if (recordar) recordar.checked = true; }
      authModal.classList.add("active"); authModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      setTimeout(() => authUsername?.focus(), 100);
    } catch (err) { console.warn("abrirAuthModal:", err); }
  }
  function cerrarAuthModal() {
    try {
      if (!authModal) return;
      authModal.classList.remove("active"); authModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      modoRegistro = false; if (authSubmit) authSubmit.disabled = false; authForm?.reset(); ocultarError(); setModoRegistro(false);
    } catch { }
  }
  function setModoRegistro(activar) {
    modoRegistro = activar;
    if (confirmField) confirmField.style.display = activar ? "flex" : "none";
    if (authTitle) authTitle.textContent = activar ? "Crear cuenta" : "Bienvenido";
    if (authSubtitle) authSubtitle.textContent = activar ? "Únete y guarda vuestros recuerdos" : "Inicia sesión para ver el álbum";
    if (authSubmit) authSubmit.textContent = activar ? "Crear cuenta" : "Entrar";
    if (authToggleText) authToggleText.textContent = activar ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?";
    if (authToggleBtn) authToggleBtn.textContent = activar ? "Iniciar sesión" : "Crear cuenta";
    ocultarError();
  }
  const mostrarError = msg => { if (authError) { authError.textContent = msg; authError.style.display = "block"; } };
  const ocultarError = () => { if (authError) { authError.style.display = "none"; authError.textContent = ""; } };
  const traducirError = msg => {
    if (!msg) return "Algo salió mal.";
    if (msg.includes("Invalid login credentials")) return "Usuario o contraseña incorrectos.";
    if (msg.includes("Email not confirmed")) return "Debes confirmar tu cuenta antes de entrar.";
    if (msg.includes("User already registered")) return "Ya existe una cuenta con ese usuario.";
    if (msg.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("Unable to validate email")) return "El usuario no es válido.";
    if (msg.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
    return msg;
  };

  btnOpenLogin?.addEventListener("click", abrirAuthModal);
  authModal?.querySelectorAll("[data-close-auth]").forEach(el => el.addEventListener("click", cerrarAuthModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && authModal?.classList.contains("active")) cerrarAuthModal(); });
  authToggleBtn?.addEventListener("click", () => setModoRegistro(!modoRegistro));

  authForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      ocultarError();
      const usuario = authUsername?.value.trim().toLowerCase() || "", password = authPassword?.value || "";
      if (!usuario || !password) return mostrarError("Rellena todos los campos.");
      if (!/^[a-z0-9_-]{3,20}$/.test(usuario)) return mostrarError("El usuario debe tener 3-20 caracteres (letras, números, _ o -).");
      const email = `${usuario}@foursunflowers.local`;
      if (modoRegistro) {
        if (password.length < 6) return mostrarError("La contraseña debe tener al menos 6 caracteres.");
        if (password !== authPasswordConfirm?.value) return mostrarError("Las contraseñas no coinciden.");
      }
      if (authSubmit) { authSubmit.disabled = true; authSubmit.textContent = modoRegistro ? "Creando cuenta..." : "Entrando..."; }
      mostrarLoading(modoRegistro ? "Creando tu cuenta..." : "Entrando...");
      try {
        if (modoRegistro) {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data.user && !data.session) {
            ocultarLoading();
            mostrarError("Cuenta creada. Revisa tu correo para confirmarla.");
            if (authSubmit) { authSubmit.disabled = false; authSubmit.textContent = "Crear cuenta"; }
            return;
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
        const recordar = $("auth-recordar");
        if (recordar?.checked) localStorage.setItem("sunadventures_usuario_recordado", usuario);
        else localStorage.removeItem("sunadventures_usuario_recordado");
      } catch (err) {
        ocultarLoading();
        mostrarError(traducirError(err.message));
        if (authSubmit) { authSubmit.disabled = false; authSubmit.textContent = modoRegistro ? "Crear cuenta" : "Entrar"; }
      }
    } catch (err) { console.warn("auth submit:", err); }
  });

  logoutBtn?.addEventListener("click", async () => {
    try { mostrarLoading("Saliendo..."); await supabase.auth.signOut(); } catch (err) { console.warn("logout:", err); ocultarLoading(); }
  });

  const abrirMenuPerfil = () => {
    if (!userDropdown || !userMenuToggle) return;
    userDropdown.classList.add("open"); userDropdown.setAttribute("aria-hidden", "false");
    userMenuToggle.setAttribute("aria-expanded", "true"); userInfo?.classList.add("open");
  };
  const cerrarMenuPerfil = () => {
    if (!userDropdown || !userMenuToggle) return;
    userDropdown.classList.remove("open"); userDropdown.setAttribute("aria-hidden", "true");
    userMenuToggle.setAttribute("aria-expanded", "false"); userInfo?.classList.remove("open");
  };
  userMenuToggle?.addEventListener("click", e => { e.stopPropagation(); userDropdown?.classList.contains("open") ? cerrarMenuPerfil() : abrirMenuPerfil(); });
  document.addEventListener("click", e => {
    if (!userDropdown?.classList.contains("open")) return;
    if (userInfo && !userInfo.contains(e.target)) cerrarMenuPerfil();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && userDropdown?.classList.contains("open")) cerrarMenuPerfil(); });

  userDropdown?.querySelectorAll("[data-action]").forEach(item => {
    item.addEventListener("click", async () => {
      const a = item.dataset.action;
      if (a === "perfil") window.abrirPerfilModal?.();
      else if (a === "ajustes") abrirAjustes();
      else if (a === "amigos") abrirAmigosModal();
      else if (a === "offline") {
        const uso = await window.SunOffline.estadoUso();
        const msg = (uso.imagenes || uso.canciones)
          ? `Ya tienes descargado:<br>📸 ${uso.imagenes} imágenes<br>🎵 ${uso.canciones} canciones<br>💾 ${uso.tamanoMB} MB<br><br>¿Descargar de nuevo todo lo nuevo?`
          : "¿Descargar todas las imágenes y canciones para uso sin conexión?";
        const ok = await confirmar({ title: "Descargar contenido", message: msg, variant: "success", icon: "📥", confirmText: "Descargar", cancelText: "Cancelar" });
        if (ok) await window.SunOffline.descargarTodo();
      }
      cerrarMenuPerfil();
    });
  });

  const VISTAS = () => ["inicio", "album", "mapa", "chat", "logros", "notas", "playlists", "calendario", "mascotas", "finanzas", ...(window._extraVistas || [])];
  const rutaDesdeHash = () => {
    const h = (location.hash || "").replace(/^#/, "").trim();
    return VISTAS().includes(h) ? h : "inicio";
  };

  function mostrarVista(nombre) {
    try {
      if (!VISTAS.includes(nombre)) nombre = "inicio";
      document.querySelectorAll("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === nombre));
      document.querySelectorAll("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === nombre));
      if (userDropdown?.classList.contains("open")) cerrarMenuPerfil();
      if (nombre === "chat") { if (!grupoActivo) asegurarGrupoActivo().then(() => recargarChat()); else recargarChat(); }
      else if (nombre === "logros") renderLogros({ notificar: false });
      else if (nombre === "inicio") renderExperiencia();
      else if (nombre === "mapa") renderMapa();
      else if (nombre === "mascotas" && typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { console.warn("mostrarVista:", err); }
  }

  /* ---------- Pegar imagen en el modal de foto ---------- */
  function notifPegado() {
    let el = $("foto-pegada-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "foto-pegada-toast";
      el.style.cssText = "position:fixed;top:6rem;left:50%;transform:translateX(-50%) translateY(-8px);background:linear-gradient(135deg,#ffd93d,#ffae3d);color:#2b2118;font-weight:800;font-size:.9rem;padding:.55rem 1rem;border-radius:999px;box-shadow:0 8px 24px rgba(255,217,61,.5);z-index:9999;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;";
      el.textContent = "📋 ¡Foto pegada!";
      document.body.appendChild(el);
    }
    requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(-8px)"; }, 1400);
  }
  document.addEventListener("paste", e => {
    if (!modal?.classList.contains("active") || fotoEditando) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    let file = null;
    for (const it of items) { if (it.type?.startsWith("image/")) { file = it.getAsFile(); if (file) break; } }
    if (!file) return;
    e.preventDefault();
    try { const dt = new DataTransfer(); dt.items.add(file); inputPhoto.files = dt.files; } catch { }
    mostrarVistaPreviaFoto(file); actualizarVistaPreviaFotoInfo(); notifPegado();
  });

  window.addEventListener("hashchange", () => mostrarVista(rutaDesdeHash()));
  mostrarVista(rutaDesdeHash());
  setTimeout(() => { if (loadingScreen?.classList.contains("active")) ocultarLoading(); }, 5000);

  const modalDrop = $("photo-modal");
  if (modalDrop) {
    modalDrop.addEventListener("dragover", e => { if (fotoEditando) return; if (!e.dataTransfer?.types?.includes("Files")) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; modalDrop.classList.add("drag-foto"); });
    modalDrop.addEventListener("dragleave", e => { if (e.relatedTarget && modalDrop.contains(e.relatedTarget)) return; modalDrop.classList.remove("drag-foto"); });
    modalDrop.addEventListener("drop", e => {
      if (fotoEditando) return;
      const f = e.dataTransfer?.files?.[0];
      if (!f || !f.type.startsWith("image/")) return;
      e.preventDefault(); modalDrop.classList.remove("drag-foto");
      try { const dt = new DataTransfer(); dt.items.add(f); inputPhoto.files = dt.files; } catch { }
      mostrarVistaPreviaFoto(f); actualizarVistaPreviaFotoInfo(); notifPegado();
    });
  }

  console.log("✅ album.js v4 cargado — player local + playlists legales");
});