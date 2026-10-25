/* ============================================================
   MÓDULO: CHAT Y NOTIFICACIONES PUSH (album-chat.js)
   ============================================================ */
(function() {
  const {
    supabase,
    $,
    alertar,
    PUSH_VAPID_PUBLIC_KEY
  } = window.AlbumApp;

  const chatMessages = $("chat-messages");
  const chatStatus = $("chat-status");
  const chatForm = $("chat-form");
  const chatInput = $("chat-input");
  const btnEnablePush = $("btn-enable-push");

  let chatSubscription = null;
  let chatGlobalSubscription = null;
  let chatModo = "grupo"; // "grupo" o "privado"
  let chatDestinatario = null;
  let destinatarioPerfil = null;
  let canalGrupoId = null;
  let amigosCache = [];
  let amigoSeleccionadoPopover = null;

  function mostrarPuntoNotificacion() {
    const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
    if (vistaActiva === "chat") return;
    const badge = $("chat-nav-badge");
    if (badge) badge.hidden = false;
    try { window._snd?.("pop"); } catch {}
  }

  function marcarChatComoLeido() {
    const badge = $("chat-nav-badge");
    if (badge) badge.hidden = true;
  }

  // Ajuste automático de altura del textarea al escribir
  function autoAjustarTextarea() {
    if (!chatInput) return;
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  }

  chatInput?.addEventListener("input", autoAjustarTextarea);
  chatInput?.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm?.requestSubmit();
    }
  });

  // ============================================================
  // GESTIÓN DE FOTOS PEGADAS O ARRASTRADAS EN EL CHAT
  // Opciones: 1. Animar personaje | 2. Crear personaje pixelado | 3. Hacer mapa basado en la foto
  // ============================================================
  function procesarFotoPegada(file) {
    if (!file || !file.type.startsWith("image/")) return;
    // La IA de mascota y procesamiento generativo ha sido retirada del chat.
  }

  function renderMensajeChat(m, mapaPerfiles) {
    if (!chatMessages) return;
    const perfil = mapaPerfiles?.[m.user_id] || {};
    const usuarioActualId = window.AlbumApp.modules.grupo?.getUsuarioActualId() || window._sunUserId;
    const esPropio = m.user_id === usuarioActualId;
    const item = document.createElement("article");
    item.className = `chat-message${esPropio ? " propio" : ""}`;
    if (!esPropio) {
      const header = document.createElement("div"); header.className = "chat-message-header";
      const av = document.createElement("div"); av.className = "chat-message-avatar";
      if (perfil.avatar_url) av.innerHTML = `<img src="${perfil.avatar_url}" alt="">`; else av.innerHTML = window.ICONO?.persona || "";
      const nombre = document.createElement("span"); nombre.className = "chat-message-nombre"; nombre.textContent = "@" + (perfil.username || "usuario");
      header.append(av, nombre);
      item.appendChild(header);
    }
    const p = document.createElement("p"); p.textContent = m.contenido;
    const t = document.createElement("time"); t.textContent = new Date(m.created_at).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
    item.append(p, t);
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /* Popover contextual para interactuar con un amigo */
  const popover = $("chat-amigo-popover");
  const popoverAvatar = $("chat-popover-avatar");
  const popoverNombre = $("chat-popover-nombre");
  const popoverStatus = $("chat-popover-status");
  const popoverBtnPrivado = $("chat-popover-btn-privado");
  const popoverBtnGrupo = $("chat-popover-btn-grupo");

  function cerrarPopoverAmigo() {
    if (popover) {
      popover.hidden = true;
      popover.classList.add("hidden");
    }
    amigoSeleccionadoPopover = null;
  }

  function abrirPopoverAmigo(amigo, targetElement) {
    if (!popover || !targetElement) return;

    // Si ya está abierto para este mismo amigo, cerrarlo (toggle)
    if (!popover.hidden && amigoSeleccionadoPopover?.id === amigo.id) {
      cerrarPopoverAmigo();
      return;
    }
    amigoSeleccionadoPopover = amigo;
    if (popoverAvatar) {
      if (amigo.avatar_url) popoverAvatar.innerHTML = `<img src="${amigo.avatar_url}" alt="">`;
      else popoverAvatar.innerHTML = window.ICONO?.persona || "";
    }
    if (popoverNombre) popoverNombre.textContent = `@${amigo.username}`;
    if (popoverStatus) popoverStatus.textContent = amigo.rol === "owner" ? "Propietario del grupo" : "Amigo del grupo";

    // Posicionar popover
    const rect = targetElement.getBoundingClientRect();
    const chatSec = $("chat")?.getBoundingClientRect() || { top: 0, left: 0 };
    
    // Posición relativa a section#chat
    let top = rect.top - chatSec.top;
    let left = rect.right - chatSec.left + 8;
    
    // Si se sale a la derecha en móviles, mostrarlo encima o dentro
    if (left + 230 > (window.innerWidth - 10)) {
      left = Math.max(10, rect.left - chatSec.left);
      top = rect.bottom - chatSec.top + 6;
    }

    popover.style.top = `${Math.max(10, top)}px`;
    popover.style.left = `${Math.max(10, left)}px`;
    popover.hidden = false;
    popover.classList.remove("hidden");
  }

  // Cerrar al hacer click o tap fuera en cualquier parte de la pantalla
  const cerrarSiAfuera = e => {
    if (!popover || popover.hidden) return;
    if (!popover.contains(e.target) && !e.target.closest(".chat-amigo-item")) {
      cerrarPopoverAmigo();
    }
  };

  document.addEventListener("click", cerrarSiAfuera);
  document.addEventListener("touchend", cerrarSiAfuera);
  document.addEventListener("pointerup", cerrarSiAfuera);

  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && popover && !popover.hidden) {
      cerrarPopoverAmigo();
    }
  });

  popoverBtnPrivado?.addEventListener("click", () => {
    if (!amigoSeleccionadoPopover) return;
    const amigo = amigoSeleccionadoPopover;
    cerrarPopoverAmigo();
    activarChatPrivado(amigo);
    // Si está en móvil, cerrar sidebar
    $("chat-sidebar")?.classList.remove("mobile-open");
  });

  popoverBtnGrupo?.addEventListener("click", async () => {
    if (!amigoSeleccionadoPopover) return;
    const amigo = amigoSeleccionadoPopover;
    cerrarPopoverAmigo();
    activarChatGrupo();
    // Mensaje automático invitando o mencionando al amigo en el chat grupal
    if (chatInput) {
      chatInput.value = `¡Hola @${amigo.username}! Te invito a charlar aquí en el grupo ✨`;
      chatInput.focus();
      autoAjustarTextarea();
    }
    // Si está en móvil, cerrar sidebar
    $("chat-sidebar")?.classList.remove("mobile-open");
  });

  function activarChatGrupo() {
    chatModo = "grupo";
    chatDestinatario = null;
    destinatarioPerfil = null;
    document.querySelectorAll(".chat-amigo-item").forEach(i => i.classList.remove("active"));
    $("chat-item-grupo")?.classList.add("active");
    if (chatStatus) chatStatus.textContent = "Grupo activo";
    recargarChat();
  }

  function activarChatPrivado(amigo) {
    chatModo = "privado";
    chatDestinatario = amigo.id;
    destinatarioPerfil = amigo;
    document.querySelectorAll(".chat-amigo-item").forEach(i => {
      i.classList.toggle("active", i.dataset.amigoId === amigo.id);
    });
    if (chatStatus) chatStatus.textContent = `Privado con @${amigo.username}`;
    recargarChat();
  }

  async function cargarAmigosSidebar() {
    const lista = $("chat-amigos-lista");
    if (!lista) return;

    try {
      // 1. Renderizar caché previa si existe
      if (amigosCache && amigosCache.length > 0) {
        renderListaAmigos(amigosCache);
      }

      const miId = window._sunUserId || localStorage.getItem("sunad_uid");
      const pareja = window.ParejaSistema?.getPareja?.();

      // Si tenemos pareja en memoria/local, añadirla directamente
      if (pareja?.id && pareja.id !== miId) {
        if (!amigosCache.some(a => a.id === pareja.id)) {
          amigosCache.unshift({
            id: pareja.id,
            username: pareja.username || "pareja",
            avatar_url: pareja.avatar_url || null,
            rol: "pareja"
          });
          renderListaAmigos(amigosCache);
        }
      }

      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || { id: localStorage.getItem("grupo_activo") };
      if (!grupoActivo?.id) {
        if (!amigosCache.length) {
          lista.innerHTML = '<div class="chat-amigos-vacio">Invita amigos para chatear</div>';
        }
        return;
      }

      // Consulta de miembros
      const { data: miembros, error: errorM } = await supabase
        .from("grupo_miembros")
        .select("user_id, rol")
        .eq("grupo_id", grupoActivo.id);

      if (errorM || !miembros) {
        if (!amigosCache.length) {
          lista.innerHTML = '<div class="chat-amigos-vacio">Sin otros miembros aún</div>';
        }
        return;
      }

      const amigosIds = miembros.filter(m => m.user_id !== miId).map(m => m.user_id);
      if (pareja?.id && pareja.id !== miId && !amigosIds.includes(pareja.id)) {
        amigosIds.push(pareja.id);
      }

      if (amigosIds.length === 0) {
        amigosCache = [];
        lista.innerHTML = '<div class="chat-amigos-vacio">Invita amigos para chatear</div>';
        return;
      }

      const { data: perfiles } = await supabase
        .from("perfiles")
        .select("id, username, avatar_url")
        .in("id", amigosIds);

      const mapaRoles = Object.fromEntries(miembros.map(m => [m.user_id, m.rol]));
      amigosCache = (perfiles || []).map(p => ({
        ...p,
        rol: p.id === pareja?.id ? "pareja" : (mapaRoles[p.id] || "miembro")
      }));

      if (pareja?.id && !amigosCache.some(a => a.id === pareja.id)) {
        amigosCache.unshift({
          id: pareja.id,
          username: pareja.username || "pareja",
          avatar_url: pareja.avatar_url || null,
          rol: "pareja"
        });
      }

      renderListaAmigos(amigosCache);
    } catch (e) {
      console.warn("cargarAmigosSidebar:", e);
      if (lista && !amigosCache.length) {
        lista.innerHTML = '<div class="chat-amigos-vacio">Invita amigos para chatear</div>';
      }
    }
  }

  function renderListaAmigos(amigos) {
    const lista = $("chat-amigos-lista");
    if (!lista) return;

    if (!amigos || amigos.length === 0) {
      lista.innerHTML = '<div class="chat-amigos-vacio">No hay otros miembros</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    amigos.forEach(amigo => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-amigo-item";
      btn.dataset.amigoId = amigo.id;
      if (chatModo === "privado" && chatDestinatario === amigo.id) {
        btn.classList.add("active");
      }

      const avatar = document.createElement("div");
      avatar.className = "chat-amigo-avatar";
      if (amigo.avatar_url) {
        avatar.innerHTML = `<img src="${amigo.avatar_url}" alt="${amigo.username}">`;
      } else {
        avatar.innerHTML = window.ICONO?.persona || '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      }

      const info = document.createElement("div");
      info.className = "chat-amigo-info";

      const nom = document.createElement("span");
      nom.className = "chat-amigo-nombre";
      nom.textContent = `@${amigo.username || "amigo"}`;

      const sub = document.createElement("span");
      sub.className = "chat-amigo-sub";
      sub.textContent = amigo.rol === "owner" ? "Propietario" : "Amigo del grupo";

      info.append(nom, sub);
      btn.append(avatar, info);

      // Al tocar o clickear al amigo, abrir opciones (popover interactivo)
      btn.addEventListener("click", e => {
        e.stopPropagation();
        abrirPopoverAmigo(amigo, btn);
      });

      frag.appendChild(btn);
    });

    lista.innerHTML = "";
    lista.appendChild(frag);
  }

  // Botón recargar amigos
  $("chat-amigos-recargar")?.addEventListener("click", () => {
    cargarAmigosSidebar();
  });

  // Toggle de sidebar en móviles
  const btnToggleSidebar = $("chat-btn-toggle-sidebar");
  btnToggleSidebar?.addEventListener("click", e => {
    e.stopPropagation();
    const sidebar = $("chat-sidebar");
    if (!sidebar) return;
    sidebar.classList.add("is-animating");
    const onEnd = () => {
      sidebar.classList.remove("is-animating");
      sidebar.removeEventListener("transitionend", onEnd);
    };
    sidebar.addEventListener("transitionend", onEnd);
    setTimeout(onEnd, 260);
    sidebar.classList.toggle("mobile-open");
  });

  // Cerrar sidebar móvil al tocar el área de mensajes
  chatMessages?.addEventListener("click", () => {
    const sidebar = $("chat-sidebar");
    if (sidebar && sidebar.classList.contains("mobile-open")) {
      sidebar.classList.add("is-animating");
      const onEnd = () => {
        sidebar.classList.remove("is-animating");
        sidebar.removeEventListener("transitionend", onEnd);
      };
      sidebar.addEventListener("transitionend", onEnd);
      setTimeout(onEnd, 260);
      sidebar.classList.remove("mobile-open");
    }
  });

  // Suscripción en tiempo real siempre activa para detectar nuevos mensajes y mostrar punto rojo
  function conectarNotificacionesChat(grupoId) {
    if (!grupoId || canalGrupoId === grupoId) return;
    canalGrupoId = grupoId;
    if (chatGlobalSubscription) { supabase.removeChannel(chatGlobalSubscription); }
    chatGlobalSubscription = supabase.channel(`chat-notifs-${grupoId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "mensajes",
      filter: `room_id=eq.${grupoId}`
    }, async ({ new: m }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const miId = session?.user?.id || window._sunUserId;
      if (m.user_id === miId) return;
      if (m.destinatario_id && m.destinatario_id !== miId) return;

      const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
      if (vistaActiva !== "chat") {
        mostrarPuntoNotificacion();
      }
    }).subscribe();
  }

  window.addEventListener("sunad:group-ready", e => {
    if (e.detail?.groupId) {
      conectarNotificacionesChat(e.detail.groupId);
      cargarAmigosSidebar();
    }
  });

  async function recargarChat() {
    try {
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
      if (!grupoActivo) {
        if (chatStatus) chatStatus.textContent = "Sin grupo";
        return;
      }
      conectarNotificacionesChat(grupoActivo.id);
      if (chatSubscription) { supabase.removeChannel(chatSubscription); chatSubscription = null; }
      if (!chatMessages) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      let query;
      if (chatModo === "grupo") {
        query = supabase.from("mensajes")
          .select("id,user_id,contenido,created_at")
          .eq("room_id", grupoActivo.id)
          .is("destinatario_id", null)
          .order("created_at", { ascending: false })
          .limit(60);
      } else {
        if (!chatDestinatario) {
          chatMessages.innerHTML = `<div class="chat-vacio">Elige un amigo a la izquierda para chatear en privado ✨</div>`;
          return;
        }
        query = supabase.from("mensajes")
          .select("id,user_id,contenido,created_at,destinatario_id")
          .eq("room_id", grupoActivo.id)
          .or(`and(user_id.eq.${session.user.id},destinatario_id.eq.${chatDestinatario}),and(user_id.eq.${chatDestinatario},destinatario_id.eq.${session.user.id})`)
          .order("created_at", { ascending: false })
          .limit(60);
      }

      const { data, error } = await query;
      if (error) { if (chatStatus) chatStatus.textContent = "Error al cargar"; return; }

      // Ordenar cronológicamente (más antiguo primero)
      const mensajesCronologicos = (data || []).reverse();

      // Utilizar mapa de perfiles en caché si ya los tenemos de amigosCache o cargarlos
      const ids = [...new Set(mensajesCronologicos.map(m => m.user_id))];
      const mapaPerfiles = {};
      
      // Llenar primero con amigosCache y usuario actual
      if (session.user) mapaPerfiles[session.user.id] = { id: session.user.id, username: localStorage.getItem("sunad_username") || "yo" };
      amigosCache.forEach(a => { mapaPerfiles[a.id] = a; });

      const faltantes = ids.filter(id => !mapaPerfiles[id]);
      if (faltantes.length > 0) {
        const { data: perfiles } = await supabase.from("perfiles").select("id,username,avatar_url").in("id", faltantes);
        (perfiles || []).forEach(p => { mapaPerfiles[p.id] = p; });
      }

      chatMessages.innerHTML = "";
      mensajesCronologicos.forEach(m => renderMensajeChat(m, mapaPerfiles));
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (chatStatus) {
        if (chatModo === "grupo") chatStatus.textContent = "Grupo activo";
        else chatStatus.textContent = `Privado con @${destinatarioPerfil?.username || "amigo"}`;
      }
      
      chatSubscription = supabase.channel(`chat-${grupoActivo.id}-${chatModo}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "mensajes", filter: `room_id=eq.${grupoActivo.id}` }, async ({ new: m }) => {
        if (chatModo === "grupo" && m.destinatario_id) return;
        if (chatModo === "privado" && (!m.destinatario_id || (m.user_id !== session.user.id && m.destinatario_id !== session.user.id))) return;
        if (!mapaPerfiles[m.user_id]) { const { data: p } = await supabase.from("perfiles").select("id,username,avatar_url").eq("id", m.user_id).single(); if (p) mapaPerfiles[m.user_id] = p; }
        renderMensajeChat(m, mapaPerfiles);
      }).subscribe();
    } catch (e) { console.warn("recargarChat:", e); }
  }

  window._recargarChat = recargarChat;
  window._setChatDestinatario = id => {
    chatDestinatario = id;
    chatModo = "privado";
    const amigo = amigosCache.find(a => a.id === id);
    if (amigo) activarChatPrivado(amigo);
    else recargarChat();
  };

  chatForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const original = chatInput?.value.trim();
      if (!original) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alertar({ title: "Inicia sesión", message: "Necesitas una cuenta para escribir.", icon: "🔐" });
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();
      if (!grupoActivo) return alertar({ title: "Sin grupo", message: "No hay grupo seleccionado.", icon: "👥" });
      if (chatModo === "privado" && !chatDestinatario) return alertar({ title: "Sin destinatario", message: "Elige a qué amigo enviar el mensaje en la barra izquierda.", icon: "👤" });
      if (chatInput) chatInput.disabled = true;
      let contenido;
      try {
        const censurar = window.AlbumApp.modules.grupo?.censurarMensaje;
        contenido = censurar ? await censurar(original) : original;
      } catch {
        if (chatInput) chatInput.disabled = false;
        return;
      }
      const ins = { room_id: grupoActivo.id, grupo_id: grupoActivo.id, user_id: session.user.id, contenido, destinatario_id: chatModo === "privado" ? chatDestinatario : null };
      const { data: mensaje, error } = await supabase.from("mensajes").insert(ins).select("id,user_id,contenido,created_at").single();
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.value = "";
        autoAjustarTextarea();
        chatInput.focus();
      }
      if (error) return alertar({ title: "No se pudo enviar", message: error.message, variant: "danger" });
      try {
        const u = getUserIdSafe();
        const kChat = `sa_chat_msgs_${u}`;
        const prevMsgs = Number(localStorage.getItem(kChat) || 0);
        localStorage.setItem(kChat, String(prevMsgs + 1));
        window.dispatchEvent(new Event("sunad:progress"));
      } catch {}
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

  window.AlbumApp.modules.chat = {
    recargarChat,
    cargarDestinatarios: cargarAmigosSidebar,
    cargarAmigosSidebar,
    activarPush,
    marcarChatComoLeido,
    mostrarPuntoNotificacion
  };
})();
