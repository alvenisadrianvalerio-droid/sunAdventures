/* ============================================================
   MÓDULO: EVENTOS Y CALENDARIO (album-eventos.js)
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

  let eventos = [];
  let mesMostrado = new Date();
  let colorEventoSeleccionado = "amarillo";
  mesMostrado.setDate(1);

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

  const eliminarEventoTabla = async id => {
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) throw error;
  };

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

  function eventosDelDia(iso) {
    return eventos.filter(ev => {
      if (!ev.recurrente) return ev.fecha === iso;
      const [, mEv, dEv] = ev.fecha.split("-");
      const [, mIso, dIso] = iso.split("-");
      return mEv === mIso && dEv === dIso;
    });
  }

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

  window.AlbumApp.modules.eventos = {
    cargarEventos,
    renderCalendario,
    abrirEventoModal,
    cerrarEventoModal,
    comprobarRecordatorios,
    getEventos: () => eventos,
    setEventos: e => { eventos = e; }
  };
})();
