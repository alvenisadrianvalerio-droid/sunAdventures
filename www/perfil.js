/* ============================================================
   PERFIL.JS — Perfil de usuario mejorado
   ============================================================ */
(function () {
  const $  = (id) => document.getElementById(id);
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const sb = () => window._supabase;

  let perfil = null;
  let archivoAvatar = null;
  let objectUrlPreview = null;

  function limpiarPreview() {
    if (objectUrlPreview) { URL.revokeObjectURL(objectUrlPreview); objectUrlPreview = null; }
  }

  async function abrir() {
    const m = $("perfil-modal");
    if (!m) return;
    try {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) return;
      const { data } = await sb().from("perfiles").select("id,username,avatar_url").eq("id", session.user.id).single();
      perfil = data || { id: session.user.id, username: session.user.email.split("@")[0], avatar_url: null };
      pintar();
      m.classList.add("active");
      m.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch (e) { console.warn("perfil.abrir:", e); }
  }

  function cerrar() {
    const m = $("perfil-modal");
    if (!m) return;
    m.classList.remove("active");
    m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    archivoAvatar = null;
    limpiarPreview();
  }

  async function pintar() {
    const nombre = $("perfil-username");
    if (nombre) nombre.value = perfil.username || "";
    const av = $("perfil-avatar-preview");
    const fb = qs(".perfil-avatar-fallback");
    if (av && perfil.avatar_url) { av.src = perfil.avatar_url; av.style.display = "block"; if (fb) fb.style.display = "none"; }
    else { if (av) av.style.display = "none"; if (fb) fb.style.display = "grid"; }

    /* Stats */
    const stats = calcularStats();
    setTexto("perfil-stat-fotos", stats.fotos);
    setTexto("perfil-stat-notas", stats.notas);
    setTexto("perfil-stat-canciones", stats.canciones);
    setTexto("perfil-stat-logros", stats.logros);
    setTexto("perfil-stat-xp", stats.xp);
    setTexto("perfil-stat-mon", stats.monedas);
  }
  const setTexto = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  function calcularStats() {
    let fotos = 0, notas = 0, canciones = 0, logros = 0, xp = 0, monedas = 0;
    try { fotos = Number(document.querySelectorAll("#album-grid .polaroid").length); } catch {}
    try { notas = Number(document.querySelectorAll("#notas-grid .nota").length); } catch {}
    try { canciones = Number(document.querySelectorAll(".playlist-card-preview").length); } catch {}
    try { logros = Number(window._logrosDesbloqueados ? Object.keys(window._logrosDesbloqueados).length : 0); } catch {}
    try { xp = Number(window._experienciaActual || 0); } catch {}
    try { monedas = window._TiendaAPI?.getMonedas?.() || 0; } catch {}
    return { fotos, notas, canciones, logros, xp, monedas };
  }

  /* ---------- Avatar ---------- */
  async function comprimirImagen(file, maxSize = 400, calidad = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
          else if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
          const c = document.createElement("canvas");
          c.width = width; c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          c.toBlob(b => b ? resolve(b) : reject(new Error("toBlob")), "image/jpeg", calidad);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function initAvatar() {
    const btn = $("perfil-avatar-btn");
    const input = $("perfil-avatar-input");
    const av = $("perfil-avatar-preview");
    const fb = qs(".perfil-avatar-fallback");

    btn?.addEventListener("click", () => input?.click());
    input?.addEventListener("change", async () => {
      const f = input.files?.[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) return alert("La imagen no puede superar 5 MB.");
      try {
        archivoAvatar = await comprimirImagen(f, 400, 0.85);
        limpiarPreview();
        objectUrlPreview = URL.createObjectURL(archivoAvatar);
        if (av) { av.src = objectUrlPreview; av.style.display = "block"; }
        if (fb) fb.style.display = "none";
      } catch (e) { alert("No se pudo procesar la imagen."); }
    });
  }

  async function guardar() {
    if (!perfil) return;
    const nombreEl = $("perfil-username");
    const username = nombreEl?.value.trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{3,20}$/.test(username)) {
      return alert("Usuario inválido (3-20 letras, números, _ o -).");
    }
    const btn = $("perfil-guardar");
    if (btn) { btn.disabled = true; btn.textContent = "Guardando..."; }
    try {
      const { data: { session } } = await sb().auth.getSession();
      if (!session) throw new Error("Sin sesión");
      let avatar_url = perfil.avatar_url || null;

      if (archivoAvatar) {
        const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
        const { error: upErr } = await sb().storage.from("avatares").upload(path, archivoAvatar, {
          upsert: true, contentType: "image/jpeg"
        });
        if (upErr) throw upErr;
        const { data: urlData } = sb().storage.from("avatares").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      const { error } = await sb().from("perfiles").update({ username, avatar_url }).eq("id", session.user.id);
      if (error) throw error;

      perfil.username = username;
      perfil.avatar_url = avatar_url;
      localStorage.setItem("sunadventures_username", username);

      const ue = $("user-email"); if (ue) ue.textContent = username;
      const udn = $("user-dropdown-name"); if (udn) udn.textContent = username;
      const avatarMenu = qs(".user-avatar");
      if (avatarMenu && avatar_url) avatarMenu.innerHTML = `<img src="${avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;

      archivoAvatar = null;
      limpiarPreview();
      cerrar();
      window.dispatchEvent(new Event("sunadventures:perfil-actualizado"));
    } catch (e) {
      alert("Error: " + (e.message || e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Guardar cambios"; }
    }
  }

  function init() {
    qsa("[data-close-perfil]").forEach(el => el.addEventListener("click", cerrar));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $("perfil-modal")?.classList.contains("active")) cerrar();
    });
    $("perfil-guardar")?.addEventListener("click", guardar);
    initAvatar();
  }

  window.abrirPerfilModal = abrir;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();