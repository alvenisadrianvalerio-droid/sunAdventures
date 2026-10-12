/* ============================================================
   MÓDULO: NAVEGACIÓN, RUTAS Y DRAG & DROP (album-router.js)
   ============================================================ */
(function() {
  const { $, ocultarLoading } = window.AlbumApp;

  const VISTAS = () => ["inicio", "album", "mapa", "chat", "logros", "notas", "playlists", "calendario", "mascotas", "finanzas", ...(window._extraVistas || [])];
  const rutaDesdeHash = () => {
    const h = (location.hash || "").replace(/^#/, "").trim();
    return VISTAS().includes(h) ? h : "inicio";
  };

  function mostrarVista(nombre) {
    try {
      if (!VISTAS().includes(nombre)) nombre = "inicio";
      document.querySelectorAll("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === nombre));
      document.querySelectorAll("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === nombre));
      document.body.classList.toggle("in-chat", nombre === "chat");
      
      const userDropdown = $("user-dropdown");
      if (userDropdown?.classList.contains("open")) {
        window.AlbumApp.modules.auth?.cerrarMenuPerfil();
      }

      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();
      if (nombre === "chat") {
        window.AlbumApp.modules.chat?.marcarChatComoLeido?.();
        if (!grupoActivo) {
          window.AlbumApp.modules.grupo?.asegurarGrupoActivo().then(() => {
            window.AlbumApp.modules.chat?.cargarAmigosSidebar?.();
            window.AlbumApp.modules.chat?.recargarChat();
          });
        } else {
          window.AlbumApp.modules.chat?.cargarAmigosSidebar?.();
          window.AlbumApp.modules.chat?.recargarChat();
        }
      } else if (nombre === "logros") {
        window.AlbumApp.modules.logros?.renderLogros({ notificar: false });
      } else if (nombre === "inicio") {
        window.AlbumApp.modules.logros?.renderExperiencia();
      } else if (nombre === "mapa") {
        window.AlbumApp.modules.fotos?.renderMapa();
      } else if (nombre === "mascotas" && typeof window._renderMascotasGrid === "function") {
        window._renderMascotasGrid();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { console.warn("mostrarVista:", err); }
  }

  /* Toast de foto pegada */
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

  /* Pegar imagen directamente en modal de foto abierta */
  const photoModal = $("photo-modal");
  const inputPhoto = $("input-photo");

  document.addEventListener("paste", e => {
    if (!photoModal?.classList.contains("active")) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    let file = null;
    for (const it of items) { if (it.type?.startsWith("image/")) { file = it.getAsFile(); if (file) break; } }
    if (!file) return;
    e.preventDefault();
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      if (inputPhoto) inputPhoto.files = dt.files;
    } catch { }
    inputPhoto?.dispatchEvent(new Event("change"));
    notifPegado();
  });

  /* Drag and drop sobre el modal de foto */
  if (photoModal) {
    photoModal.addEventListener("dragover", e => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      photoModal.classList.add("drag-foto");
    });
    photoModal.addEventListener("dragleave", e => {
      if (e.relatedTarget && photoModal.contains(e.relatedTarget)) return;
      photoModal.classList.remove("drag-foto");
    });
    photoModal.addEventListener("drop", e => {
      const f = e.dataTransfer?.files?.[0];
      if (!f || !f.type.startsWith("image/")) return;
      e.preventDefault();
      photoModal.classList.remove("drag-foto");
      try {
        const dt = new DataTransfer();
        dt.items.add(f);
        if (inputPhoto) inputPhoto.files = dt.files;
      } catch { }
      inputPhoto?.dispatchEvent(new Event("change"));
      notifPegado();
    });
  }

  window.addEventListener("hashchange", () => mostrarVista(rutaDesdeHash()));
  mostrarVista(rutaDesdeHash());

  const loadingScreen = $("loading-screen");
  setTimeout(() => { if (loadingScreen?.classList.contains("active")) ocultarLoading(); }, 5000);

  window.AlbumApp.modules.router = {
    mostrarVista,
    rutaDesdeHash,
    notifPegado
  };
})();
