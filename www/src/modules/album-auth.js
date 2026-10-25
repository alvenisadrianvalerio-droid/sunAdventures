/* ============================================================
   MÓDULO: AUTENTICACIÓN Y SESIÓN (album-auth.js)
   ============================================================ */
(function() {
  const {
    supabase,
    $,
    mostrarLoading,
    ocultarLoading
  } = window.AlbumApp;

  let modoRegistro = false;
  let colaSesion = Promise.resolve();

  const authModal = $("auth-modal");
  const btnOpenLogin = $("btn-open-login");
  const authForm = $("auth-form");
  const authUsername = $("auth-username");
  const authPassword = $("auth-password");
  const authPasswordConfirm = $("auth-password-confirm");
  const confirmField = $("confirm-password-field");
  const authSubmit = $("auth-submit");
  const authTitle = $("auth-title");
  const authSubtitle = $("auth-subtitle");
  const authToggleText = $("auth-toggle-text");
  const authToggleBtn = $("auth-toggle-btn");
  const authError = $("auth-error");

  const userInfo = $("user-info");
  const userEmail = $("user-email");
  const logoutBtn = $("logout-btn");
  const userMenuToggle = $("user-menu-toggle");
  const userDropdown = $("user-dropdown");

  const btnAdd = $("btn-add-photo");
  const btnAddNota = $("btn-add-nota");
  const grid = $("album-grid");
  const empty = $("album-empty");
  const notasGrid = $("notas-grid");
  const notasEmpty = $("notas-empty");
  const playlistsGrid = $("playlists-grid");
  const playlistsEmpty = $("playlists-empty");
  const calGrid = $("cal-grid");
  const calProximos = $("cal-proximos");
  const calProximosVacio = $("cal-proximos-vacio");
  const calendarioEmpty = $("calendario-empty");

  async function updateAuthUI(session) {
    try {
      const logueado = !!session;
      if (btnOpenLogin) btnOpenLogin.style.display = logueado ? "none" : "inline-flex";
      if (userInfo) userInfo.style.display = logueado ? "flex" : "none";
      if (logueado && userEmail) {
        const n = localStorage.getItem("sunad_username") || session.user.email.split("@")[0];
        userEmail.textContent = n;
        const dn = $("user-dropdown-name"); if (dn) dn.textContent = n;
        window._sunUserEmail = session.user.email;
      }
      if (btnAdd) btnAdd.style.display = logueado ? "inline-block" : "none";
      if (btnAddNota) btnAddNota.style.display = logueado ? "inline-block" : "none";

      if (logueado) {
        if (authModal) cerrarAuthModal();
        ocultarLoading();

        await window.AlbumApp.modules.grupo?.asegurarGrupoActivo().catch(e => console.warn("asegurarGrupo:", e));
        try {
          const { data: perfil } = await supabase.from("perfiles").select("username,avatar_url").eq("id", session.user.id).single();
          if (perfil?.avatar_url) {
            const av = document.querySelector(".user-avatar");
            if (av) av.innerHTML = `<img src="${perfil.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
          }
          if (perfil?.username) {
            localStorage.setItem("sunad_username", perfil.username);
            const ue = $("user-email"); if (ue) ue.textContent = perfil.username;
            const udn = $("user-dropdown-name"); if (udn) udn.textContent = perfil.username;
          }
        } catch { }

        localStorage.setItem("sunad_uid", session.user.id);
        window._sunUserId = session.user.id;
        window.dispatchEvent(new Event("sunad:user-ready"));
        window.AlbumApp.modules.logros?.registrarVisita();

        await Promise.allSettled([
          window.AlbumApp.modules.fotos?.cargarFotos(),
          window.AlbumApp.modules.notas?.cargarNotas()
        ]);

        await Promise.allSettled([
          window.AlbumApp.modules.fotos?.render(),
          Promise.resolve(window.AlbumApp.modules.notas?.renderNotas()),
          Promise.resolve(window.AlbumApp.modules.logros?.renderLogros())
        ]);

        window.AlbumApp.modules.logros?.renderExperiencia();
        if (typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
        window.AlbumApp.modules.chat?.cargarAmigosSidebar?.();
      } else {
        localStorage.removeItem("sunad_uid");
        window._sunUserId = null;
        window._sunUserEmail = "";
        window.AlbumApp.modules.fotos?.setFotos([]);
        window.AlbumApp.modules.notas?.setNotas([]);
        if (grid) grid.innerHTML = ""; if (empty) empty.classList.remove("hidden");
        if (notasGrid) notasGrid.innerHTML = ""; if (notasEmpty) notasEmpty.classList.remove("hidden");
        if (calendarioEmpty) calendarioEmpty.classList.remove("hidden");
        const mGrid = $("mascotas-grid"); if (mGrid) mGrid.innerHTML = "";
        window.AlbumApp.modules.logros?.renderExperiencia();
        window.dispatchEvent(new Event("sunad:user-logout"));
      }
      if (logueado && authModal) cerrarAuthModal();
    } catch (err) { console.error("updateAuthUI:", err); }
    finally {
      ocultarLoading();
      if (authSubmit) {
        authSubmit.disabled = false;
        authSubmit.textContent = modoRegistro ? "Crear cuenta" : "Entrar";
      }
    }
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
      const guardado = localStorage.getItem("sunad_usuario_recordado");
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
          let loginRes = await supabase.auth.signInWithPassword({ email, password });
          if (loginRes.error) {
            // Si falló el login directo con su nuevo usuario, intentar buscar si el usuario tenía un correo previo
            let resuelto = false;
            try {
              // Si coincide con usuario recordado previo
              const rec = localStorage.getItem("sunad_usuario_recordado") || localStorage.getItem("sunadventures_usuario_recordado");
              if (rec && rec !== usuario) {
                const altRes = await supabase.auth.signInWithPassword({ email: `${rec}@foursunflowers.local`, password });
                if (!altRes.error && altRes.data?.session) {
                  loginRes = altRes;
                  resuelto = true;
                  // Auto-actualizar email en Supabase Auth al nuevo username
                  try { await supabase.auth.updateUser({ email }); } catch {}
                }
              }
            } catch {}

            if (!resuelto && loginRes.error) throw loginRes.error;
          }
        }
        const recordar = $("auth-recordar");
        if (recordar?.checked) {
          localStorage.setItem("sunad_usuario_recordado", usuario);
          localStorage.setItem("sunadventures_usuario_recordado", usuario);
        } else {
          localStorage.removeItem("sunad_usuario_recordado");
          localStorage.removeItem("sunadventures_usuario_recordado");
        }
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
  const toggleMenu = e => {
    if (e.cancelable && e.type !== "click") e.preventDefault();
    e.stopPropagation();
    userDropdown?.classList.contains("open") ? cerrarMenuPerfil() : abrirMenuPerfil();
  };
  userMenuToggle?.addEventListener("click", toggleMenu);

  // Cerrar menú al tocar fuera
  const cerrarSiTocaFuera = e => {
    if (!userDropdown?.classList.contains("open")) return;
    const target = e.target;
    if (userDropdown.contains(target) || userMenuToggle?.contains(target)) return;
    cerrarMenuPerfil();
  };
  document.addEventListener("click", cerrarSiTocaFuera);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && userDropdown?.classList.contains("open")) cerrarMenuPerfil(); });

  const ejecutarAccionDropdown = async (item, e) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable && e.type !== "click") e.preventDefault();
    }
    const a = item.dataset.action;

    try {
      if (a === "perfil") {
        if (typeof window.abrirPerfilModal === "function") window.abrirPerfilModal();
      }
      else if (a === "pareja") {
        if (typeof window.ParejaSistema?.abrirModal === "function") window.ParejaSistema.abrirModal();
      }
      else if (a === "ajustes") {
        window.AlbumApp.modules.grupo?.abrirAjustes?.();
      }
      else if (a === "amigos") {
        window.AlbumApp.modules.grupo?.abrirAmigosModal?.();
      }
      else if (a === "descargar") {
        if (typeof window.abrirDescarga === "function") window.abrirDescarga();
        else if (typeof window.descargarApkDirecta === "function") window.descargarApkDirecta();
        else {
          const btnDesc = document.querySelector('.lobby-btn[data-action="descargar"]');
          if (btnDesc) btnDesc.click();
        }
      }
      else if (a === "offline") {
        if (window.SunOffline?.estadoUso) {
          const uso = await window.SunOffline.estadoUso();
          const msg = (uso.imagenes || uso.canciones)
            ? `Ya tienes descargado:<br>📸 ${uso.imagenes} imágenes<br>🎵 ${uso.canciones} canciones<br>💾 ${uso.tamanoMB} MB<br><br>¿Descargar de nuevo todo lo nuevo?`
            : "¿Descargar todas las imágenes y canciones para uso sin conexión?";
          const ok = await window.AlbumApp.confirmar({ title: "Descargar contenido", message: msg, variant: "success", icon: "📥", confirmText: "Descargar", cancelText: "Cancelar" });
          if (ok) await window.SunOffline.descargarTodo();
        }
      }
    } finally {
      setTimeout(() => { cerrarMenuPerfil(); }, 120);
    }
  };

  // Delegación de eventos en un único listener para todo el dropdown
  userDropdown?.addEventListener("click", e => {
    const actionItem = e.target.closest("[data-action]");
    if (actionItem && userDropdown.contains(actionItem)) {
      e.preventDefault();
      e.stopPropagation();
      ejecutarAccionDropdown(actionItem, e);
      return;
    }
    const navLink = e.target.closest("a.user-dropdown-item");
    if (navLink && userDropdown.contains(navLink)) {
      cerrarMenuPerfil();
    }
  });

  window.AlbumApp.modules.auth = {
    updateAuthUI,
    abrirAuthModal,
    cerrarAuthModal,
    cerrarMenuPerfil
  };
})();
