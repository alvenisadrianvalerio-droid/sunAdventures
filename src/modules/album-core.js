/* ============================================================
   MÓDULO: CORE / CONFIG / UTILIDADES (album-core.js)
   ============================================================ */
(function() {
  const SUPABASE_URL = "https://fsobpmulnvajwlrgkoxr.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2JwbXVsbnZhandscmdrb3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODMyOTgsImV4cCI6MjEwNTg1OTI5OH0.j7Q8Zv02QhXxC9v-7MS1ZWeZyd18dN0TKFrbEhDs96Y";
  const BUCKET_NAME = "album";
  const BUCKET_CANCIONES = "canciones";
  const R2_PUBLIC_URL = "https://pub-834bce82ae304eb8abdd44f9daafe3e6.r2.dev";
  const URL_EXPIRY = 3600;
  const URL_EXPIRY_CANCIONES = 14400;
  const DURACION_CACHE_URL = (URL_EXPIRY - 60) * 1000;
  const CENSURA_KEY = "sunad_censura_activa";
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
    alert("No se pudo conectar con el servidor. Recarga la página.");
    return;
  }
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window._supabase = supabase;
  window._loadingFailsafe = setTimeout(() => {
    const ls = document.getElementById("loading-screen");
    if (ls?.classList.contains("active")) { ls.classList.remove("active"); ls.setAttribute("aria-hidden", "true"); }
  }, 10000);

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

  const $ = id => document.getElementById(id);
  const getUserIdSafe = () => window._sunUserId || localStorage.getItem("sunad_uid") || "local";
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

  const loadingScreen = $("loading-screen"), loadingText = $("loading-text");
  const mostrarLoading = (msg = "Cargando...") => { if (!loadingScreen) return; if (loadingText) loadingText.textContent = msg; loadingScreen.classList.add("active"); loadingScreen.setAttribute("aria-hidden", "false"); };
  const ocultarLoading = () => { if (!loadingScreen) return; loadingScreen.classList.remove("active"); loadingScreen.setAttribute("aria-hidden", "true"); };

  const crearBtn = (cls, svg, title, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.innerHTML = svg;
    b.addEventListener("click", onClick);
    return b;
  };

  const activarFullscreen = (el, btn) => { const api = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen; if (api) { api.call(el); btn?.setAttribute("aria-pressed", "true"); return; } alert("Tu navegador no admite pantalla completa aquí."); };
  const cerrarFullscreen = async () => {
    try {
      const api = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (api && (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
        await api.call(document);
      }
    } catch (_) {}
  };
  const fullscreenInteractivo = (article, boton) => {
    article.tabIndex = 0; article.setAttribute("role", "button"); article.setAttribute("aria-label", "Abrir en pantalla completa");
    article.addEventListener("click", async e => { if (e.target.closest("button, input, textarea, a")) return; if (document.fullscreenElement === article) { await cerrarFullscreen(); return; } activarFullscreen(article, boton); });
    article.addEventListener("keydown", e => { if (e.key !== "Enter" && e.key !== " " && e.target !== article) return; if (e.target !== article) return; e.preventDefault(); activarFullscreen(article, boton); });
  };

  const urlsFirmadasCache = new Map();

  // Exportar al namespace global AlbumApp
  window.AlbumApp = {
    supabase,
    BUCKET_NAME,
    BUCKET_CANCIONES,
    R2_PUBLIC_URL,
    URL_EXPIRY,
    URL_EXPIRY_CANCIONES,
    DURACION_CACHE_URL,
    CENSURA_KEY,
    PUSH_VAPID_PUBLIC_KEY,
    AUDIO_EXTS,
    VIDEO_EXTS,
    MESES_LARGOS,
    MESES_CORTOS,
    LIMITE_CONCURRENCIA_URLS,
    confirmar,
    alertar,
    SVG,
    $,
    getUserIdSafe,
    parseCoord,
    escapeHtml,
    ext,
    identificarEnlaceMusical,
    esAudio,
    esVideo,
    fmtFecha,
    fmtFechaNota,
    fmtTiempo,
    fmtTam,
    fechaISO,
    hoyISO,
    mostrarLoading,
    ocultarLoading,
    crearBtn,
    activarFullscreen,
    cerrarFullscreen,
    fullscreenInteractivo,
    urlsFirmadasCache,
    modules: {}
  };
})();
