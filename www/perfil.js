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
   try {
  canciones = (window._playlists || []).reduce((t, p) => t + (p.canciones?.length || 0), 0);
} catch {}
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
  let username = (nombreEl?.value || "").trim().toLowerCase();

  // 🧹 Sanear: quitar cualquier carácter no permitido automáticamente
  const limpio = username.replace(/[^a-z0-9_-]/g, "");
  if (nombreEl && nombreEl.value !== limpio) nombreEl.value = limpio;
  username = limpio;

  // ✅ Validar con modal bonito en vez de alert nativo
  if (!username || username.length < 3 || username.length > 20) {
    if (window.SunModal) {
      return window.SunModal.alert({
        title: "Nombre no válido",
        message: "Debe tener entre <strong>3 y 20 caracteres</strong>.<br>Solo <strong>letras, números, _ y -</strong> (sin puntos ni espacios).",
        variant: "warning",
        icon: "✏️",
        confirmText: "Entendido"
      });
    }
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

      const antiguoUsername = perfil.username;
      const { error } = await sb().from("perfiles").update({ username, avatar_url }).eq("id", session.user.id);
      if (error) throw error;

      // 🔐 Mantener credenciales y sesión sincronizadas con el nuevo nombre:
      // Actualizamos el email del usuario en Supabase Auth para que pueda seguir iniciando sesión con su nuevo nombre
      const nuevoEmail = `${username}@foursunflowers.local`;
      try {
        await sb().auth.updateUser({ email: nuevoEmail });
      } catch (authErr) {
        console.warn("No se pudo actualizar el email de auth inmediatamente:", authErr);
      }

      // Migrar posibles claves legacy guardadas con el antiguo username
      if (antiguoUsername && antiguoUsername !== username) {
        try {
          const prefijos = ["sa_rpg_", "sa_rpg_stats_", "sa_rpg_loot_", "sa_rpg_cofres_", "sa_rl_meta_", "sa_rl_run_"];
          prefijos.forEach(pfx => {
            const valAntiguo = localStorage.getItem(`${pfx}${antiguoUsername}`);
            if (valAntiguo && !localStorage.getItem(`${pfx}${session.user.id}`)) {
              localStorage.setItem(`${pfx}${session.user.id}`, valAntiguo);
            }
          });
        } catch {}
      }

      perfil.username = username;
      perfil.avatar_url = avatar_url;
      localStorage.setItem("sunad_username", username);
      localStorage.setItem("sunadventures_username", username);
      if (localStorage.getItem("sunad_usuario_recordado")) {
        localStorage.setItem("sunad_usuario_recordado", username);
      }
      if (localStorage.getItem("sunadventures_usuario_recordado")) {
        localStorage.setItem("sunadventures_usuario_recordado", username);
      }

      const ue = $("user-email"); if (ue) ue.textContent = username;
      const udn = $("user-dropdown-name"); if (udn) udn.textContent = username;
      const avatarMenu = qs(".user-avatar");
      if (avatarMenu && avatar_url) avatarMenu.innerHTML = `<img src="${avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;

      archivoAvatar = null;
      limpiarPreview();
      cerrar();
      window.dispatchEvent(new Event("sunad:perfil-actualizado"));
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

  
  /* ---------- Respaldo y Sincronización en la Nube (Supabase user_metadata) ---------- */
  const PREFIJOS_SYNC = [
    "monedas_",
    "sa_monedas_max_",
    "sa_experiencia_extra_",
    "sa_amor_pareja_",
    "sunad_logros_",
    "sa_logros_recompensados_",
    "mascotas_compradas_",
    "mascotas_conocidas_",
    "mascota_amistad_",
    "skins_compradas_",
    "skins_equipadas_",
    "sa_rpg_",
    "sa_rpg_loot_",
    "sa_rpg_stats_",
    "sa_rpg_cofres_",
    "sa_rl_meta_"
  ];

  function recolectarEstadoProgreso(uid) {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.includes(uid)) continue;
        if (PREFIJOS_SYNC.some(p => k.startsWith(p))) {
          const val = localStorage.getItem(k);
          if (val && val.length < 16000) data[k] = val;
        }
      }
    } catch {}
    return data;
  }

  function restaurarEstadoProgreso(cloudData, uid) {
    if (!cloudData || typeof cloudData !== "object") return false;
    let restaurado = false;
    try {
      Object.entries(cloudData).forEach(([k, val]) => {
        if (!k.includes(uid) || typeof val !== "string") return;
        const localVal = localStorage.getItem(k);
        if (!localVal) {
          localStorage.setItem(k, val);
          restaurado = true;
        } else if (k.startsWith("monedas_") || k.startsWith("sa_experiencia_extra_") || k.startsWith("sa_amor_pareja_")) {
          if ((Number(val) || 0) > (Number(localVal) || 0)) {
            localStorage.setItem(k, val);
            restaurado = true;
          }
        }
      });
    } catch {}
    return restaurado;
  }

  let _syncTimer = null;
  async function sincronizarProgresoNube() {
    try {
      const sbClient = sb();
      if (!sbClient || !navigator.onLine) return;
      const { data: { session } } = await sbClient.auth.getSession();
      if (!session?.user?.id) return;
      const uid = session.user.id;
      const snapshot = recolectarEstadoProgreso(uid);
      if (!Object.keys(snapshot).length) return;
      await sbClient.auth.updateUser({
        data: { sunad_backup_v1: snapshot, sunad_backup_ts: Date.now() }
      });
    } catch {}
  }

  window.addEventListener("sunad:user-ready", async () => {
    try {
      const sbClient = sb();
      if (!sbClient) return;
      const { data: { session } } = await sbClient.auth.getSession();
      if (!session?.user?.id) return;
      const uid = session.user.id;
      const backup = session.user.user_metadata?.sunad_backup_v1;
      if (backup && restaurarEstadoProgreso(backup, uid)) {
        window.dispatchEvent(new Event("sunad:progress"));
      }
    } catch {}
  });

  window.addEventListener("sunad:progress", () => {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(sincronizarProgresoNube, 12000);
  });

  window.abrirPerfilModal = abrir;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();