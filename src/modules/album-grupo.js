/* ============================================================
   MÓDULO: GRUPO Y PERFILES (album-grupo.js)
   ============================================================ */
(function() {
  const { supabase, $, alertar, CENSURA_KEY } = window.AlbumApp;

  let grupoActivo = null;
  let perfilActual = null;
  let usuarioActualId = null;

  const friendsModal = $("friends-modal");
  const friendsGroupName = $("friends-group-name");
  const friendSearchForm = $("friend-search-form");
  const friendSearchInput = $("friend-search-input");
  const friendSearchResults = $("friend-search-results");
  const groupMembersList = $("group-members-list");
  const groupInvitesList = $("group-invites-list");
  const settingsModal = $("settings-modal");
  const toggleCensura = $("toggle-censura");

  const usernameDesdeSesion = s => (s?.user?.email?.split("@")[0] || "usuario").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20).padEnd(3, "_");

  async function asegurarGrupoActivo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { grupoActivo = null; return null; }
      usuarioActualId = session.user.id;
      window._sunUserId = session.user.id;
      localStorage.setItem("sunad_uid", session.user.id);
      window.dispatchEvent(new Event("sunad:user-ready"));
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
      window.dispatchEvent(new CustomEvent("sunad:group-ready", { detail: { groupId: grupoActivo.id, userId: session.user.id } }));
      await Promise.all(["fotos", "notas", "playlists"].map(t => supabase.from(t).update({ grupo_id: grupoActivo.id }).eq("user_id", session.user.id).is("grupo_id", null)));
      return grupoActivo;
    } catch (err) {
      console.error("asegurarGrupoActivo:", err);
      grupoActivo = null;
      window.dispatchEvent(new CustomEvent("sunad:group-error", { detail: { message: err?.message || "Error desconocido" } }));
      return null;
    }
  }

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

  friendsModal?.querySelectorAll("[data-close-friends]").forEach(el => el.addEventListener("click", () => {
    friendsModal.classList.remove("active"); friendsModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  }));

  function abrirAjustes() {
    if (!settingsModal) return;
    try {
      if (toggleCensura) toggleCensura.checked = localStorage.getItem(CENSURA_KEY) === "true";
      window.SunPreferences?.setLanguage(window.SunPreferences.getLanguage());
      window.SunPreferences?.setAnimationsDisabled(localStorage.getItem("sunad_animations_disabled") === "true");
      window.SunPreferences?.setVolume(localStorage.getItem("app_volume") || localStorage.getItem("player_volumen") || "0.8");
      settingsModal.classList.add("active");
      settingsModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    } catch (err) { console.error("abrirAjustes:", err); }
  }

  settingsModal?.querySelectorAll("[data-close-settings]").forEach(el => el.addEventListener("click", () => {
    settingsModal.classList.remove("active"); settingsModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  }));
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
      const termino = friendSearchInput?.value.trim().toLowerCase();
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
      if (friendSearchResults) {
        friendSearchResults.innerHTML = "";
        friendSearchResults.appendChild(frag);
      }
    } catch (err) { console.warn("friendSearch:", err); }
  });

  window._asegurarGrupoActivo = asegurarGrupoActivo;
  window._getGrupoActivo = () => grupoActivo;

  window.AlbumApp.modules.grupo = {
    asegurarGrupoActivo,
    getGrupoActivo: () => grupoActivo,
    setGrupoActivo: g => { grupoActivo = g; },
    getPerfilActual: () => perfilActual,
    setPerfilActual: p => { perfilActual = p; },
    getUsuarioActualId: () => usuarioActualId,
    setUsuarioActualId: u => { usuarioActualId = u; },
    abrirAmigosModal,
    abrirAjustes,
    censurarMensaje
  };
})();
