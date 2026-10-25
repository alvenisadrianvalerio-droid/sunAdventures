/* ============================================================
   MÓDULO: EVENTOS Y CALENDARIO ESPECIAL (album-eventos.js)
   Four Sunflowers · Fechas, Aniversarios y Recuerdos
   ============================================================ */
(function() {
  const {
    supabase,
    SVG,
    $,
    MESES_LARGOS,
    fechaISO,
    hoyISO,
    confirmar,
    alertar,
    crearBtn
  } = window.AlbumApp;

  // Registrar la vista especial en el enrutador
  window._extraVistas = window._extraVistas || [];
  if (!window._extraVistas.includes("calendario")) {
    window._extraVistas.push("calendario");
  }

  let eventos = [];
  let mesMostrado = new Date();
  let colorEventoSeleccionado = "amarillo";
  mesMostrado.setDate(1);

  const LOCAL_STORAGE_KEY = "sunad_eventos_offline";

  // Selectores DOM
  const calGrid = $("cal-grid");
  const calMesActual = $("cal-mes-actual");
  const calPrev = $("cal-prev");
  const calNext = $("cal-next");
  const calProximos = $("cal-proximos");
  const calProximosVacio = $("cal-proximos-vacio");
  const calendarioEmpty = $("calendario-empty");
  const btnAddEvento = $("btn-add-evento");
  const btnNotifPermiso = $("btn-notif-permiso");
  const eventoModal = $("evento-modal");
  const eventoForm = $("evento-form");
  const eventoTitulo = $("evento-titulo");
  const eventoDescripcion = $("evento-descripcion");
  const eventoFecha = $("evento-fecha");
  const eventoRecordatorio = $("evento-recordatorio");
  const eventoRecurrente = $("evento-recurrente");
  const eventoSubmitBtn = eventoForm?.querySelector('button[type="submit"]');

  Object.defineProperty(window, "_eventos", { get: () => eventos, configurable: true });

  // Guardar en cache offline / local
  function guardarLocalmente(lista) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lista));
    } catch {}
  }

  function cargarLocalmente() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async function cargarEventos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        eventos = cargarLocalmente();
        renderCalendario();
        return;
      }
      const uid = session.user.id;
      let query = supabase.from("eventos")
        .select("id,titulo,descripcion,fecha,color,recordatorio_dias,recurrente,user_id")
        .order("fecha", { ascending: true });

      // Si hay pareja, compartir aniversarios y fechas especiales
      const pareja = window.ParejaSistema?.getPareja?.();
      if (pareja?.id && pareja.id !== uid) {
        query = query.or(`user_id.eq.${uid},user_id.eq.${pareja.id}`);
      } else {
        try {
          const rawPareja = localStorage.getItem(`sunad_pareja_${uid}`);
          if (rawPareja) {
            const parsed = JSON.parse(rawPareja);
            if (parsed?.id && parsed.id !== uid) {
              query = query.or(`user_id.eq.${uid},user_id.eq.${parsed.id}`);
            } else {
              query = query.eq("user_id", uid);
            }
          } else {
            query = query.eq("user_id", uid);
          }
        } catch {
          query = query.eq("user_id", uid);
        }
      }

      const { data, error } = await query;
      if (error) {
        console.warn("cargarEventos supabase error, usando local:", error);
        eventos = cargarLocalmente();
      } else {
        eventos = (data || []).map(e => ({
          id: e.id,
          titulo: e.titulo,
          descripcion: e.descripcion,
          fecha: e.fecha,
          color: e.color || "amarillo",
          recordatorio_dias: e.recordatorio_dias ?? 1,
          recurrente: !!e.recurrente
        }));
        guardarLocalmente(eventos);
      }
      renderCalendario();
    } catch (err) {
      console.warn("cargarEventos:", err);
      eventos = cargarLocalmente();
      renderCalendario();
    }
  }

  const añadirEventoTabla = async (titulo, descripcion, fecha, color, recordatorio, recurrente) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      // Modo local / offline
      const localId = "local_ev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const ev = { id: localId, titulo, descripcion: descripcion || null, fecha, color: color || "amarillo", recordatorio_dias: recordatorio, recurrente };
      return ev;
    }
    const { data, error } = await supabase.from("eventos").insert({
      user_id: session.user.id,
      titulo,
      descripcion: descripcion || null,
      fecha,
      color: color || "amarillo",
      recordatorio_dias: recordatorio,
      recurrente
    }).select().single();

    if (error) {
      console.warn("Fallo guardado en Supabase, guardando en local:", error);
      const localId = "local_ev_" + Date.now();
      return { id: localId, titulo, descripcion: descripcion || null, fecha, color: color || "amarillo", recordatorio_dias: recordatorio, recurrente };
    }
    return data;
  };

  const eliminarEventoTabla = async id => {
    if (String(id).startsWith("local_ev_")) return;
    try {
      const { error } = await supabase.from("eventos").delete().eq("id", id);
      if (error) console.warn("eliminarEventoTabla error:", error);
    } catch (err) {
      console.warn("eliminarEventoTabla catch:", err);
    }
  };

  function renderCalendario() {
    try {
      if (!calGrid) return;
      if (calMesActual) {
        calMesActual.textContent = `${MESES_LARGOS[mesMostrado.getMonth()]} ${mesMostrado.getFullYear()}`;
      }
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
        celda.type = "button";
        celda.className = "cal-dia";
        let num, fecha;
        if (i < offset) {
          num = diasAnt - offset + i + 1;
          fecha = new Date(año, mes - 1, num);
          celda.classList.add("otro-mes");
        } else if (i >= offset + ultimoDia) {
          num = i - offset - ultimoDia + 1;
          fecha = new Date(año, mes + 1, num);
          celda.classList.add("otro-mes");
        } else {
          num = i - offset + 1;
          fecha = new Date(año, mes, num);
        }

        const iso = fechaISO(fecha);
        if (iso === hoy) celda.classList.add("hoy");

        const span = document.createElement("span");
        span.className = "cal-dia-numero";
        span.textContent = num;
        celda.appendChild(span);

        const evs = eventosDelDia(iso);
        if (evs.length) {
          celda.classList.add("tiene-evento");
          const dots = document.createElement("div");
          dots.className = "cal-dia-eventos";
          evs.slice(0, 4).forEach(ev => {
            const d = document.createElement("span");
            d.className = `cal-evento-punto color-${ev.color}`;
            d.title = ev.titulo;
            dots.appendChild(d);
          });
          celda.appendChild(dots);
        }

        celda.addEventListener("click", () => abrirEventoModal(iso));
        frag.appendChild(celda);
      }

      calGrid.appendChild(frag);
      renderProximos();
      actualizarEmptyCalendario();
    } catch (err) {
      console.warn("renderCalendario:", err);
    }
  }

  function eventosDelDia(iso) {
    return eventos.filter(ev => {
      if (!ev.recurrente) return ev.fecha === iso;
      const [, mEv, dEv] = ev.fecha.split("-");
      const [, mIso, dIso] = iso.split("-");
      return mEv === mIso && dEv === dIso;
    });
  }

  function proximaFechaEvento(ev) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = ev.fecha.split("-").map(Number);
    if (ev.recurrente) {
      const este = new Date(hoy.getFullYear(), m - 1, d);
      return este < hoy ? new Date(hoy.getFullYear() + 1, m - 1, d) : este;
    }
    return new Date(y, m - 1, d);
  }

  const diasHasta = fecha => {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
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
        .slice(0, 10);

      if (!conFecha.length) {
        calProximosVacio?.classList.remove("hidden");
        return;
      }
      calProximosVacio?.classList.add("hidden");
      const frag = document.createDocumentFragment();
      conFecha.forEach(({ ev, p }) => frag.appendChild(crearItemProximo(ev, p)));
      calProximos.appendChild(frag);
    } catch (err) {
      console.warn("renderProximos:", err);
    }
  }

  function crearItemProximo(ev, proxima) {
    try {
      const item = document.createElement("div");
      item.className = "cal-proximo-item color-" + ev.color;
      const fb = document.createElement("div");
      fb.className = "cal-proximo-fecha";
      const dia = document.createElement("span");
      dia.className = "cal-proximo-dia";
      dia.textContent = proxima.getDate();
      const mes = document.createElement("span");
      mes.className = "cal-proximo-mes";
      mes.textContent = MESES_LARGOS[proxima.getMonth()].slice(0, 3);
      fb.append(dia, mes);

      const info = document.createElement("div");
      info.className = "cal-proximo-info";
      const t = document.createElement("span");
      t.className = "cal-proximo-titulo";
      t.textContent = ev.titulo;
      if (ev.recurrente) {
        const badge = document.createElement("span");
        badge.className = "cal-badge-anual";
        badge.textContent = "🔁 Anual";
        t.appendChild(badge);
      }
      info.appendChild(t);

      if (ev.descripcion) {
        const d = document.createElement("span");
        d.className = "cal-proximo-desc";
        d.textContent = ev.descripcion;
        info.appendChild(d);
      }

      const diff = diasHasta(proxima);
      const cuando = document.createElement("span");
      cuando.className = "cal-proximo-cuando";
      if (diff === 0) {
        cuando.classList.add("hoy");
        cuando.textContent = "¡HOY! 🎉";
      } else if (diff === 1) {
        cuando.textContent = "Mañana ✨";
      } else if (diff < 7) {
        cuando.textContent = `En ${diff} días`;
      } else if (diff < 30) {
        cuando.textContent = `En ${Math.round(diff / 7)} sem.`;
      } else {
        cuando.textContent = `En ${Math.round(diff / 30)} meses`;
      }

      const btn = crearBtn("cal-proximo-delete", SVG.close, "Eliminar fecha", e => {
        e.stopPropagation();
        eliminarEvento(ev.id);
      });

      item.append(fb, info, cuando, btn);
      item.addEventListener("click", () => {
        mesMostrado = new Date(proxima.getFullYear(), proxima.getMonth(), 1);
        renderCalendario();
        document.querySelector(".calendario-wrapper")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return item;
    } catch (err) {
      console.warn("crearItemProximo:", err);
      return document.createElement("div");
    }
  }

  const actualizarEmptyCalendario = () => {
    if (!calendarioEmpty) return;
    calendarioEmpty.classList.toggle("hidden", eventos.length > 0);
  };

  function abrirEventoModal(fechaPrefill) {
    try {
      const modal = $("evento-modal");
      if (!modal) return;
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const form = $("evento-form");
      form?.reset();
      colorEventoSeleccionado = "amarillo";
      document.querySelectorAll("#evento-form .color-option").forEach(o =>
        o.classList.toggle("activo", o.dataset.color === "amarillo")
      );
      const fInput = $("evento-fecha");
      if (fInput) fInput.value = fechaPrefill || hoyISO();
      const sBtn = form?.querySelector('button[type="submit"]');
      if (sBtn) {
        sBtn.disabled = false;
        sBtn.textContent = "Guardar fecha";
      }
      setTimeout(() => $("evento-titulo")?.focus(), 100);
    } catch (err) {
      console.warn("abrirEventoModal:", err);
    }
  }

  function cerrarEventoModal() {
    try {
      const modal = $("evento-modal");
      if (!modal) return;
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    } catch {}
  }

  async function eliminarEvento(id) {
    try {
      const ok = await confirmar({
        title: "¿Eliminar esta fecha?",
        message: "El evento se borrará de tu calendario y recordatorios.",
        variant: "danger",
        icon: "📅",
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar"
      });
      if (!ok) return;
      await eliminarEventoTabla(id);
      eventos = eventos.filter(e => e.id !== id);
      guardarLocalmente(eventos);
      renderCalendario();
    } catch (err) {
      alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" });
    }
  }

  // Delegación de eventos e inicialización
  function inicializarEventosDOM() {
    $("btn-add-evento")?.addEventListener("click", () => abrirEventoModal());

    const modal = $("evento-modal");
    modal?.querySelectorAll("[data-close-evento-modal]").forEach(el =>
      el.addEventListener("click", cerrarEventoModal)
    );

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $("evento-modal")?.classList.contains("active")) {
        cerrarEventoModal();
      }
    });

    document.querySelectorAll("#evento-form .color-option").forEach(opt => {
      opt.addEventListener("click", () => {
        document.querySelectorAll("#evento-form .color-option").forEach(o => o.classList.remove("activo"));
        opt.classList.add("activo");
        colorEventoSeleccionado = opt.dataset.color;
      });
    });

    $("cal-prev")?.addEventListener("click", () => {
      mesMostrado.setMonth(mesMostrado.getMonth() - 1);
      renderCalendario();
    });

    $("cal-next")?.addEventListener("click", () => {
      mesMostrado.setMonth(mesMostrado.getMonth() + 1);
      renderCalendario();
    });

    $("evento-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      try {
        const titulo = $("evento-titulo")?.value.trim() || "";
        const descripcion = $("evento-descripcion")?.value.trim() || "";
        const fecha = $("evento-fecha")?.value || "";
        const recordatorio = parseInt($("evento-recordatorio")?.value ?? "1", 10);
        const recurrente = !!$("evento-recurrente")?.checked;

        if (!titulo || !fecha) {
          return alertar({ title: "Faltan datos", message: "Rellena título y fecha para el evento.", icon: "📅" });
        }

        const sBtn = $("evento-form")?.querySelector('button[type="submit"]');
        if (sBtn) {
          sBtn.disabled = true;
          sBtn.textContent = "Guardando...";
        }

        try {
          await pedirPermisoNotificacionesSilencioso();
          const nuevo = await añadirEventoTabla(titulo, descripcion, fecha, colorEventoSeleccionado, recordatorio, recurrente);
          eventos.push({
            id: nuevo.id,
            titulo: nuevo.titulo,
            descripcion: nuevo.descripcion,
            fecha: nuevo.fecha,
            color: nuevo.color,
            recordatorio_dias: nuevo.recordatorio_dias,
            recurrente: nuevo.recurrente
          });
          eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
          guardarLocalmente(eventos);
          cerrarEventoModal();
          renderCalendario();
          comprobarRecordatorios();
        } catch (err) {
          alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" });
          if (sBtn) {
            sBtn.disabled = false;
            sBtn.textContent = "Guardar fecha";
          }
        }
      } catch (err) {
        console.warn("evento submit:", err);
      }
    });

    $("btn-notif-permiso")?.addEventListener("click", pedirPermisoNotificacionesManual);
  }

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
    } catch {
      return false;
    }
  }

  async function pedirPermisoNotificacionesManual() {
    try {
      if (!notifSoportadas()) {
        return alertar({ title: "No compatible", message: "Tu navegador no soporta notificaciones de escritorio.", icon: "🔕" });
      }
      const r = await Notification.requestPermission();
      actualizarBotonNotifPermiso();
      if (r === "granted") {
        alertar({ title: "¡Listo!", message: "Notificaciones y recordatorios activados.", variant: "success", icon: "🔔" });
        comprobarRecordatorios();
      } else if (r === "denied") {
        alertar({ title: "Bloqueadas", message: "Las notificaciones están bloqueadas en tu navegador. Actívalas en la configuración si deseas recordatorios.", variant: "warning", icon: "🔕" });
      }
    } catch (err) {
      console.warn("pedirPermiso:", err);
    }
  }

  const actualizarBotonNotifPermiso = () => {
    const btn = $("btn-notif-permiso");
    if (!btn) return;
    btn.style.display = (!notifSoportadas() || Notification.permission !== "default") ? "none" : "inline-flex";
  };

  function comprobarRecordatorios() {
    try {
      if (!notifSoportadas() || Notification.permission !== "granted" || !eventos.length) return;
      const hoy = hoyISO();
      eventos.forEach(ev => {
        const p = proximaFechaEvento(ev);
        const diff = diasHasta(p);
        if (diff < 0 || diff > ev.recordatorio_dias) return;
        const key = `${NOTIF_PREFIX}${ev.id}_${hoy}`;
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, "1");
        let cuerpo;
        if (diff === 0) cuerpo = "¡Es hoy! " + (ev.descripcion || "");
        else if (diff === 1) cuerpo = "Es mañana: " + (ev.descripcion || "");
        else cuerpo = `Faltan ${diff} días: ` + (ev.descripcion || "");
        try {
          new Notification(ev.titulo, { body: cuerpo.trim(), icon: "img/girasol.jpg", tag: `evento-${ev.id}` });
        } catch {}
      });
    } catch (err) {
      console.warn("comprobarRecordatorios:", err);
    }
  }

  // Inicialización al cargar DOM o script
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      inicializarEventosDOM();
      cargarEventos();
    });
  } else {
    inicializarEventosDOM();
    cargarEventos();
  }

  setTimeout(comprobarRecordatorios, 3000);
  setInterval(comprobarRecordatorios, 3600000);
  actualizarBotonNotifPermiso();

  window.AlbumApp.modules.eventos = {
    cargarEventos,
    renderCalendario,
    abrirEventoModal,
    cerrarEventoModal,
    comprobarRecordatorios,
    getEventos: () => eventos,
    setEventos: e => {
      eventos = e;
      guardarLocalmente(e);
      renderCalendario();
    }
  };
})();
