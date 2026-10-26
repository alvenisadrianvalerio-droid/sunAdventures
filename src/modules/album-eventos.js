/* ============================================================
   MÓDULO: NUESTRO TIEMPO (album-eventos.js)
   Four Sunflowers · Diario de Planes, Recuerdos y Aniversarios
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

  // Mapa de Categorías Oficiales
  const CATEGORIAS = {
    cita: { id: "cita", nombre: "Cita Romance", emoji: "❤️", color: "rosa", colorHex: "#f472b6" },
    viaje: { id: "viaje", nombre: "Viaje / Aventura", emoji: "✈️", color: "amarillo", colorHex: "#ffd93d" },
    comida: { id: "comida", nombre: "Comida / Receta", emoji: "🍔", color: "naranja", colorHex: "#fb923c" },
    aniversario: { id: "aniversario", nombre: "Fecha Especial", emoji: "⭐", color: "dorado", colorHex: "#f59e0b" },
    nota: { id: "nota", nombre: "Nota / Recordatorio", emoji: "📌", color: "cielo", colorHex: "#60a5fa" }
  };

  const DIAS_SEMANA_COMPLETOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  let eventos = [];
  let mesMostrado = new Date();
  let diaSeleccionadoISO = hoyISO();
  let categoriaSeleccionada = "cita";
  let colorEventoSeleccionado = "rosa";
  let vistaActual = "mes"; // "mes" | "agenda"
  let filtroCategoria = "all"; // "all" | categoria id

  mesMostrado.setDate(1);

  const LOCAL_STORAGE_KEY = "sunad_eventos_offline";
  const REACCIONES_STORAGE_KEY = "sunad_eventos_reacciones";

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
  const eventoFechaFin = $("evento-fecha-fin");
  const eventoRecordatorio = $("evento-recordatorio");
  const eventoRecurrente = $("evento-recurrente");
  const eventoCategoriaInput = $("evento-categoria");

  // Elementos del Rediseño "Nuestro Tiempo"
  const calCountdownBanner = $("cal-countdown-banner");
  const calCountdownTitle = $("cal-countdown-title");
  const calCountdownDesc = $("cal-countdown-desc");
  const calCountdownDays = $("cal-countdown-days");
  const btnCalViewMes = $("btn-cal-view-mes");
  const btnCalViewAgenda = $("btn-cal-view-agenda");
  const calViewMesContainer = $("cal-view-mes-container");
  const calViewAgendaContainer = $("cal-view-agenda-container");
  const calAgendaLista = $("cal-agenda-lista");
  const calAgendaVacia = $("cal-agenda-vacia");
  const btnCalIrHoy = $("btn-cal-ir-hoy");

  // Panel lateral / Bottom-sheet
  const calDiaPanel = $("cal-dia-panel");
  const calPanelDiaSemana = $("cal-panel-diasemana");
  const calPanelFechaTexto = $("cal-panel-fecha-texto");
  const calPanelEventosLista = $("cal-panel-eventos-lista");
  const btnPanelAddPlan = $("btn-panel-add-plan");
  const btnPanelAddText = $("btn-panel-add-text");
  const btnCerrarDiaPanel = $("btn-cerrar-dia-panel");

  Object.defineProperty(window, "_eventos", { get: () => eventos, configurable: true });

  // Guardar y Cargar en caché offline / local
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

  // Manejo de Reacciones ❤️ ("Me encanta")
  function cargarReacciones() {
    try {
      const raw = localStorage.getItem(REACCIONES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function guardarReacciones(reacciones) {
    try {
      localStorage.setItem(REACCIONES_STORAGE_KEY, JSON.stringify(reacciones));
    } catch {}
  }

  function toggleReaccion(eventoId) {
    try {
      const reacciones = cargarReacciones();
      const current = reacciones[eventoId] || { count: 0, liked: false };
      if (current.liked) {
        current.liked = false;
        current.count = Math.max(0, (current.count || 1) - 1);
      } else {
        current.liked = true;
        current.count = (current.count || 0) + 1;
      }
      reacciones[eventoId] = current;
      guardarReacciones(reacciones);
      renderPanelDia(diaSeleccionadoISO);
      if (vistaActual === "agenda") renderAgenda();
    } catch (err) {
      console.warn("toggleReaccion error:", err);
    }
  }

  // Obtener info del usuario actual / pareja
  function getUsuarioActual() {
    try {
      const pareja = window.ParejaSistema?.getPareja?.();
      const miNombre = localStorage.getItem("sunad_mi_nombre") || "Nosotros";
      return {
        nombre: miNombre,
        parejaNombre: pareja?.nombre || "Mi Amor"
      };
    } catch {
      return { nombre: "Nosotros", parejaNombre: "Mi Amor" };
    }
  }

  // Normalizar evento para asegurar estructura completa
  function normalizarEvento(raw) {
    // Si viene solo color o sin categoria, mapear color -> categoria
    let cat = raw.categoria;
    if (!cat || !CATEGORIAS[cat]) {
      const colorMap = {
        rosa: "cita",
        amarillo: "viaje",
        naranja: "comida",
        dorado: "aniversario",
        lila: "cita",
        cielo: "nota",
        menta: "nota"
      };
      cat = colorMap[raw.color] || "cita";
    }

    const col = raw.color || CATEGORIAS[cat]?.color || "amarillo";

    return {
      id: raw.id,
      titulo: raw.titulo || "Plan especial",
      descripcion: raw.descripcion || "",
      fecha: raw.fecha,
      fecha_fin: raw.fecha_fin || raw.fecha,
      categoria: cat,
      color: col,
      recordatorio_dias: raw.recordatorio_dias ?? 1,
      recurrente: !!raw.recurrente,
      creado_por: raw.creado_por || { nombre: "Tú y yo" }
    };
  }

  async function cargarEventos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        eventos = (cargarLocalmente() || []).map(normalizarEvento);
        actualizarTodo();
        return;
      }
      const uid = session.user.id;
      let query = supabase.from("eventos")
        .select("id,titulo,descripcion,fecha,color,recordatorio_dias,recurrente,user_id")
        .order("fecha", { ascending: true });

      // Si hay pareja, sincronizar los planes compartidos
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
        eventos = (cargarLocalmente() || []).map(normalizarEvento);
      } else {
        // Enriquecer datos desde Supabase y fusionar con metadata offline si existe
        const locales = cargarLocalmente() || [];
        const localesMap = new Map(locales.map(l => [String(l.id), l]));

        eventos = (data || []).map(e => {
          const localMatch = localesMap.get(String(e.id)) || {};
          return normalizarEvento({
            id: e.id,
            titulo: e.titulo,
            descripcion: e.descripcion,
            fecha: e.fecha,
            fecha_fin: localMatch.fecha_fin || e.fecha,
            categoria: localMatch.categoria,
            color: e.color || "amarillo",
            recordatorio_dias: e.recordatorio_dias ?? 1,
            recurrente: !!e.recurrente,
            creado_por: localMatch.creado_por || { nombre: e.user_id === uid ? "Tú" : (pareja?.nombre || "Tu pareja") }
          });
        });
        guardarLocalmente(eventos);
      }
      actualizarTodo();
    } catch (err) {
      console.warn("cargarEventos:", err);
      eventos = (cargarLocalmente() || []).map(normalizarEvento);
      actualizarTodo();
    }
  }

  const añadirEventoTabla = async (datos) => {
    const { titulo, descripcion, fecha, fecha_fin, categoria, color, recordatorio, recurrente } = datos;
    const { data: { session } } = await supabase.auth.getSession();
    const usuarioInfo = getUsuarioActual();

    if (!session?.user) {
      // Modo local / offline
      const localId = "local_ev_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      return normalizarEvento({
        id: localId,
        titulo,
        descripcion: descripcion || null,
        fecha,
        fecha_fin: fecha_fin || fecha,
        categoria,
        color: color || "rosa",
        recordatorio_dias: recordatorio,
        recurrente,
        creado_por: { nombre: usuarioInfo.nombre }
      });
    }

    const { data, error } = await supabase.from("eventos").insert({
      user_id: session.user.id,
      titulo,
      descripcion: descripcion || null,
      fecha,
      color: color || "rosa",
      recordatorio_dias: recordatorio,
      recurrente
    }).select().single();

    if (error) {
      console.warn("Fallo guardado en Supabase, guardando en local:", error);
      const localId = "local_ev_" + Date.now();
      return normalizarEvento({
        id: localId,
        titulo,
        descripcion: descripcion || null,
        fecha,
        fecha_fin: fecha_fin || fecha,
        categoria,
        color: color || "rosa",
        recordatorio_dias: recordatorio,
        recurrente,
        creado_por: { nombre: usuarioInfo.nombre }
      });
    }

    return normalizarEvento({
      ...data,
      fecha_fin: fecha_fin || fecha,
      categoria,
      creado_por: { nombre: usuarioInfo.nombre }
    });
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

  // -------------------------------------------------------------
  // CÁLCULO DE CUENTA REGRESIVA Y FECHAS
  // -------------------------------------------------------------
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

  function parseFechaLocal(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Comprueba si un día 'iso' cae dentro del rango [ev.fecha, ev.fecha_fin]
  function eventoEnDia(ev, iso) {
    if (ev.recurrente) {
      const [, mEv, dEv] = ev.fecha.split("-");
      const [, mIso, dIso] = iso.split("-");
      return mEv === mIso && dEv === dIso;
    }
    const fIni = ev.fecha;
    const fFin = ev.fecha_fin || ev.fecha;
    return iso >= fIni && iso <= fFin;
  }

  function eventosDelDia(iso) {
    return eventos.filter(ev => {
      if (filtroCategoria !== "all" && ev.categoria !== filtroCategoria) return false;
      return eventoEnDia(ev, iso);
    });
  }

  // -------------------------------------------------------------
  // ACTUALIZACIÓN GENERAL
  // -------------------------------------------------------------
  function actualizarTodo() {
    renderCountdownBanner();
    renderCalendario();
    renderPanelDia(diaSeleccionadoISO);
    renderProximos();
    if (vistaActual === "agenda") {
      renderAgenda();
    }
    actualizarEmptyCalendario();
  }

  // 1. BANNER DESTACADO DE CUENTA ATRÁS ROMÁNTICA
  function renderCountdownBanner() {
    try {
      if (!calCountdownBanner) return;

      // Buscar el próximo aniversario o evento más cercano
      const conFecha = eventos
        .map(ev => ({ ev, p: proximaFechaEvento(ev) }))
        .filter(x => diasHasta(x.p) >= 0)
        .sort((a, b) => {
          // Priorizar aniversarios o fechas especiales si están relativamente cerca
          if (a.ev.categoria === "aniversario" && b.ev.categoria !== "aniversario" && diasHasta(a.p) <= 60) return -1;
          if (b.ev.categoria === "aniversario" && a.ev.categoria !== "aniversario" && diasHasta(b.p) <= 60) return 1;
          return a.p - b.p;
        });

      if (!conFecha.length) {
        calCountdownTitle.textContent = "Nuestro próximo recuerdo";
        calCountdownDesc.textContent = "Crea un plan juntos para comenzar la cuenta regresiva.";
        calCountdownDays.textContent = "--";
        return;
      }

      const hito = conFecha[0];
      const diff = diasHasta(hito.p);
      const cat = CATEGORIAS[hito.ev.categoria] || CATEGORIAS.cita;

      if (diff === 0) {
        calCountdownTitle.textContent = `¡Hoy celebramos: ${hito.ev.titulo}! 🎉`;
        calCountdownDesc.textContent = hito.ev.descripcion || "¡Un día mágico preparado con todo nuestro amor!";
        calCountdownDays.textContent = "¡HOY!";
      } else if (diff === 1) {
        calCountdownTitle.textContent = `Mañana: ${hito.ev.titulo} ✨`;
        calCountdownDesc.textContent = hito.ev.descripcion || `Cuenta regresiva para ${cat.nombre.toLowerCase()}.`;
        calCountdownDays.textContent = "1";
      } else {
        calCountdownTitle.textContent = `${cat.emoji} ${hito.ev.titulo}`;
        calCountdownDesc.textContent = hito.ev.descripcion || `Faltan muy pocos días para nuestro gran momento.`;
        calCountdownDays.textContent = String(diff);
      }
    } catch (err) {
      console.warn("renderCountdownBanner error:", err);
    }
  }

  // 2. RENDER DE CUADRÍCULA DE MES (Con rangos, puntos de categoría y badges)
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
        let esOtroMes = false;

        if (i < offset) {
          num = diasAnt - offset + i + 1;
          fecha = new Date(año, mes - 1, num);
          celda.classList.add("otro-mes");
          esOtroMes = true;
        } else if (i >= offset + ultimoDia) {
          num = i - offset - ultimoDia + 1;
          fecha = new Date(año, mes + 1, num);
          celda.classList.add("otro-mes");
          esOtroMes = true;
        } else {
          num = i - offset + 1;
          fecha = new Date(año, mes, num);
        }

        const iso = fechaISO(fecha);
        celda.dataset.fecha = iso;

        // Fines de semana (Sábado = 5, Domingo = 6 en grid con offset Lun=0)
        const colIndex = i % 7;
        if (colIndex === 5 || colIndex === 6) {
          celda.classList.add("cal-dia-finsemana");
        }

        if (iso === hoy) celda.classList.add("hoy");
        if (iso === diaSeleccionadoISO) celda.classList.add("dia-seleccionado");

        const span = document.createElement("span");
        span.className = "cal-dia-numero";
        span.textContent = num;
        celda.appendChild(span);

        // Detectar si hay evento de aniversario para colocar un destello suave
        const evs = eventosDelDia(iso);
        const tieneAniversario = evs.some(e => e.categoria === "aniversario");
        if (tieneAniversario) {
          celda.classList.add("cal-dia-aniversario");
        }

        // Detectar si este día es parte de un evento de varios días
        const eventoRango = evs.find(e => e.fecha_fin && e.fecha_fin !== e.fecha);
        if (eventoRango) {
          celda.classList.add("cal-dia-en-rango");
          if (iso === eventoRango.fecha) celda.classList.add("rango-inicio");
          if (iso === eventoRango.fecha_fin) celda.classList.add("rango-fin");
        }

        if (evs.length) {
          celda.classList.add("tiene-evento");
          const dots = document.createElement("div");
          dots.className = "cal-dia-eventos";

          // Mostrar hasta 3 puntos temáticos
          evs.slice(0, 3).forEach(ev => {
            const d = document.createElement("span");
            const cat = CATEGORIAS[ev.categoria] || CATEGORIAS.cita;
            d.className = `cal-evento-punto cat-${cat.id} color-${ev.color}`;
            d.title = `${cat.emoji} ${ev.titulo}`;
            dots.appendChild(d);
          });

          // Si hay más de 3, indicar +N
          if (evs.length > 3) {
            const badgeMas = document.createElement("span");
            badgeMas.className = "cal-evento-mas";
            badgeMas.textContent = `+${evs.length - 3}`;
            dots.appendChild(badgeMas);
          }

          celda.appendChild(dots);
        }

        // Al hacer clic: seleccionar el día, actualizar panel lateral / abrir bottom sheet
        celda.addEventListener("click", () => {
          seleccionarDia(iso);
        });

        frag.appendChild(celda);
      }

      calGrid.appendChild(frag);
    } catch (err) {
      console.warn("renderCalendario:", err);
    }
  }

  // 3. SELECCIÓN DE DÍA Y ACTUALIZACIÓN DEL PANEL LATERAL
  function seleccionarDia(iso) {
    diaSeleccionadoISO = iso;

    // Actualizar clase activa en la cuadrícula
    document.querySelectorAll(".cal-dia").forEach(c => {
      c.classList.toggle("dia-seleccionado", c.dataset.fecha === iso);
    });

    renderPanelDia(iso);

    // En pantallas móviles / tablet, abrir el bottom-sheet suavemente
    if (window.innerWidth <= 860 && calDiaPanel) {
      calDiaPanel.classList.add("panel-open");
    }
  }

  function renderPanelDia(iso) {
    try {
      if (!calDiaPanel || !calPanelEventosLista) return;

      const fechaObj = parseFechaLocal(iso);
      const diaSem = DIAS_SEMANA_COMPLETOS[fechaObj.getDay()];
      const diaNum = fechaObj.getDate();
      const mesNom = MESES_LARGOS[fechaObj.getMonth()];
      const esHoy = iso === hoyISO();

      if (calPanelDiaSemana) {
        calPanelDiaSemana.textContent = esHoy ? "¡Hoy!" : diaSem;
      }
      if (calPanelFechaTexto) {
        calPanelFechaTexto.textContent = `${diaNum} de ${mesNom}`;
      }
      if (btnPanelAddText) {
        btnPanelAddText.textContent = `+ Añadir plan para el ${diaNum} de ${mesNom.slice(0, 3)}`;
      }

      const evs = eventosDelDia(iso);
      calPanelEventosLista.innerHTML = "";

      if (!evs.length) {
        calPanelEventosLista.innerHTML = `
          <div class="cal-panel-vacio">
            <span class="cal-panel-vacio-icon">✨</span>
            <p class="cal-panel-vacio-txt">No hay planes registrados para este día.</p>
            <span class="cal-panel-vacio-sub">¿Planeamos una cita, cena o escapada juntos?</span>
          </div>
        `;
        return;
      }

      const reacciones = cargarReacciones();
      const frag = document.createDocumentFragment();

      evs.forEach(ev => {
        const cat = CATEGORIAS[ev.categoria] || CATEGORIAS.cita;
        const reaccion = reacciones[ev.id] || { count: 0, liked: false };
        const card = document.createElement("div");
        card.className = `cal-card-evento cat-${cat.id} color-${ev.color}`;

        const esRango = ev.fecha_fin && ev.fecha_fin !== ev.fecha;
        let badgeRango = "";
        if (esRango) {
          const fFinObj = parseFechaLocal(ev.fecha_fin);
          badgeRango = `<span class="cal-badge-rango">Hasta ${fFinObj.getDate()} de ${MESES_LARGOS[fFinObj.getMonth()].slice(0, 3)}</span>`;
        }

        const autor = ev.creado_por?.nombre || "Nosotros";
        const autorInicial = autor.charAt(0).toUpperCase();

        card.innerHTML = `
          <div class="cal-card-evento-header">
            <div class="cal-card-cat-badge">
              <span class="cal-card-cat-emoji">${cat.emoji}</span>
              <span class="cal-card-cat-nombre">${cat.nombre}</span>
            </div>
            ${badgeRango}
            <div class="cal-card-acciones-top">
              <button type="button" class="cal-btn-icon-eliminar" title="Eliminar plan" aria-label="Eliminar plan">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <h4 class="cal-card-titulo">${ev.titulo}</h4>
          ${ev.descripcion ? `<p class="cal-card-desc">${ev.descripcion}</p>` : ""}

          <div class="cal-card-footer">
            <div class="cal-card-autor" title="Añadido por ${autor}">
              <span class="cal-card-avatar">${autorInicial}</span>
              <span class="cal-card-autor-nombre">${autor}</span>
            </div>

            <button type="button" class="cal-card-reaccion ${reaccion.liked ? 'liked' : ''}" aria-label="Me encanta este plan">
              <span class="cal-card-heart">❤️</span>
              <span class="cal-card-heart-count">${reaccion.count > 0 ? reaccion.count : ''}</span>
            </button>
          </div>
        `;

        // Eventos de botones
        card.querySelector(".cal-btn-icon-eliminar")?.addEventListener("click", e => {
          e.stopPropagation();
          eliminarEvento(ev.id);
        });

        card.querySelector(".cal-card-reaccion")?.addEventListener("click", e => {
          e.stopPropagation();
          toggleReaccion(ev.id);
        });

        frag.appendChild(card);
      });

      calPanelEventosLista.appendChild(frag);
    } catch (err) {
      console.warn("renderPanelDia error:", err);
    }
  }

  // 4. VISTA AGENDA CRONOLÓGICA (Timeline de pareja)
  function renderAgenda() {
    try {
      if (!calAgendaLista) return;
      calAgendaLista.innerHTML = "";

      let lista = [...eventos];
      if (filtroCategoria !== "all") {
        lista = lista.filter(e => e.categoria === filtroCategoria);
      }

      lista.sort((a, b) => a.fecha.localeCompare(b.fecha));

      if (!lista.length) {
        calAgendaVacia?.classList.remove("hidden");
        return;
      }
      calAgendaVacia?.classList.add("hidden");

      const hoy = hoyISO();
      const reacciones = cargarReacciones();
      const frag = document.createDocumentFragment();

      // Agrupar por mes/año para una línea de tiempo limpia
      let mesActualAgrupador = "";

      lista.forEach(ev => {
        const fechaObj = parseFechaLocal(ev.fecha);
        const grupo = `${MESES_LARGOS[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;

        if (grupo !== mesActualAgrupador) {
          mesActualAgrupador = grupo;
          const separador = document.createElement("div");
          separador.className = "cal-agenda-separador";
          separador.textContent = mesActualAgrupador;
          frag.appendChild(separador);
        }

        const cat = CATEGORIAS[ev.categoria] || CATEGORIAS.cita;
        const reaccion = reacciones[ev.id] || { count: 0, liked: false };
        const item = document.createElement("div");
        item.className = `cal-agenda-item cat-${cat.id} color-${ev.color} ${ev.fecha === hoy ? 'es-hoy' : ''}`;

        const diff = diasHasta(ev.fecha);
        let badgeTiempo = "";
        if (diff === 0) badgeTiempo = `<span class="cal-agenda-badge hoy">¡Hoy!</span>`;
        else if (diff === 1) badgeTiempo = `<span class="cal-agenda-badge">Mañana</span>`;
        else if (diff > 1 && diff <= 30) badgeTiempo = `<span class="cal-agenda-badge">En ${diff} días</span>`;
        else if (diff < 0) badgeTiempo = `<span class="cal-agenda-badge pasado">Recuerdo</span>`;

        const autor = ev.creado_por?.nombre || "Nosotros";

        item.innerHTML = `
          <div class="cal-agenda-fecha-col">
            <span class="cal-agenda-dia-num">${fechaObj.getDate()}</span>
            <span class="cal-agenda-dia-sem">${DIAS_SEMANA_COMPLETOS[fechaObj.getDay()].slice(0, 3)}</span>
          </div>

          <div class="cal-agenda-info">
            <div class="cal-agenda-tags">
              <span class="cal-agenda-cat">${cat.emoji} ${cat.nombre}</span>
              ${badgeTiempo}
              ${ev.recurrente ? '<span class="cal-badge-anual">🔁 Anual</span>' : ''}
            </div>
            <h4 class="cal-agenda-titulo">${ev.titulo}</h4>
            ${ev.descripcion ? `<p class="cal-agenda-desc">${ev.descripcion}</p>` : ''}
            <div class="cal-agenda-meta">
              <span class="cal-agenda-creador">Propuesto por: <strong>${autor}</strong></span>
            </div>
          </div>

          <div class="cal-agenda-acciones">
            <button type="button" class="cal-card-reaccion ${reaccion.liked ? 'liked' : ''}" aria-label="Me encanta">
              <span>❤️</span>
              <span>${reaccion.count > 0 ? reaccion.count : ''}</span>
            </button>
            <button type="button" class="cal-btn-icon-eliminar btn-del-agenda" title="Eliminar plan">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        item.querySelector(".btn-del-agenda")?.addEventListener("click", e => {
          e.stopPropagation();
          eliminarEvento(ev.id);
        });

        item.querySelector(".cal-card-reaccion")?.addEventListener("click", e => {
          e.stopPropagation();
          toggleReaccion(ev.id);
        });

        item.addEventListener("click", () => {
          diaSeleccionadoISO = ev.fecha;
          mesMostrado = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
          setVista("mes");
          seleccionarDia(ev.fecha);
        });

        frag.appendChild(item);
      });

      calAgendaLista.appendChild(frag);
    } catch (err) {
      console.warn("renderAgenda error:", err);
    }
  }

  // 5. CAMBIO DE VISTA (Mes vs Agenda)
  function setVista(nuevaVista) {
    vistaActual = nuevaVista;
    if (btnCalViewMes) btnCalViewMes.classList.toggle("active", nuevaVista === "mes");
    if (btnCalViewAgenda) btnCalViewAgenda.classList.toggle("active", nuevaVista === "agenda");

    if (calViewMesContainer) calViewMesContainer.classList.toggle("hidden", nuevaVista !== "mes");
    if (calViewAgendaContainer) calViewAgendaContainer.classList.toggle("hidden", nuevaVista !== "agenda");

    if (nuevaVista === "mes") {
      renderCalendario();
    } else {
      renderAgenda();
    }
  }

  // 6. PRÓXIMAS FECHAS (Mini-feed inferior de hitos)
  function renderProximos() {
    try {
      if (!calProximos) return;
      calProximos.innerHTML = "";
      const conFecha = eventos
        .map(ev => ({ ev, p: proximaFechaEvento(ev) }))
        .filter(x => diasHasta(x.p) >= 0)
        .sort((a, b) => a.p - b.p)
        .slice(0, 8);

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
      const cat = CATEGORIAS[ev.categoria] || CATEGORIAS.cita;
      const item = document.createElement("div");
      item.className = `cal-proximo-item cat-${cat.id} color-${ev.color}`;

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
      t.innerHTML = `${cat.emoji} ${ev.titulo}`;

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
        setVista("mes");
        seleccionarDia(fechaISO(proxima));
        document.querySelector(".calendario-master-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // -------------------------------------------------------------
  // MODAL CREAR / AÑADIR PLAN
  // -------------------------------------------------------------
  function abrirEventoModal(fechaPrefill) {
    try {
      const modal = $("evento-modal");
      if (!modal) return;
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      const form = $("evento-form");
      form?.reset();

      // Reset de categoría inicial a "cita"
      categoriaSeleccionada = "cita";
      colorEventoSeleccionado = "rosa";
      if (eventoCategoriaInput) eventoCategoriaInput.value = "cita";

      // Actualizar botones de selector de categorías
      document.querySelectorAll("#evento-categoria-selector .cat-card").forEach(c => {
        c.classList.toggle("active", c.dataset.categoria === "cita");
      });

      // Actualizar selector de colores
      document.querySelectorAll("#evento-form .color-option").forEach(o =>
        o.classList.toggle("activo", o.dataset.color === "rosa")
      );

      const fInput = $("evento-fecha");
      const fFinInput = $("evento-fecha-fin");
      const pre = fechaPrefill || diaSeleccionadoISO || hoyISO();

      if (fInput) fInput.value = pre;
      if (fFinInput) fFinInput.value = "";

      const sBtn = form?.querySelector('button[type="submit"]');
      if (sBtn) {
        sBtn.disabled = false;
        sBtn.textContent = "Guardar plan";
      }

      setTimeout(() => $("evento-titulo")?.focus(), 120);
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
        title: "¿Eliminar este plan?",
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
      actualizarTodo();
    } catch (err) {
      alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" });
    }
  }

  // -------------------------------------------------------------
  // INICIALIZACIÓN Y EVENT LISTENERS
  // -------------------------------------------------------------
  function inicializarEventosDOM() {
    // Botón principal de añadir plan
    $("btn-add-evento")?.addEventListener("click", () => abrirEventoModal(diaSeleccionadoISO));
    $("btn-panel-add-plan")?.addEventListener("click", () => abrirEventoModal(diaSeleccionadoISO));
    $("btn-agenda-agregar")?.addEventListener("click", () => abrirEventoModal());

    // Toggle de Vistas Mes vs Agenda
    btnCalViewMes?.addEventListener("click", () => setVista("mes"));
    btnCalViewAgenda?.addEventListener("click", () => setVista("agenda"));

    // Botón "Ir a hoy"
    btnCalIrHoy?.addEventListener("click", () => {
      const h = new Date();
      mesMostrado = new Date(h.getFullYear(), h.getMonth(), 1);
      seleccionarDia(hoyISO());
      renderCalendario();
    });

    // Cerrar panel lateral (móvil bottom-sheet)
    btnCerrarDiaPanel?.addEventListener("click", () => {
      calDiaPanel?.classList.remove("panel-open");
    });

    // Filtros por Categoría
    document.querySelectorAll(".cal-categorias-chips .cal-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".cal-categorias-chips .cal-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        filtroCategoria = chip.dataset.catFilter || "all";
        renderCalendario();
        renderPanelDia(diaSeleccionadoISO);
        if (vistaActual === "agenda") renderAgenda();
      });
    });

    // Modal de Eventos
    const modal = $("evento-modal");
    modal?.querySelectorAll("[data-close-evento-modal]").forEach(el =>
      el.addEventListener("click", cerrarEventoModal)
    );

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && $("evento-modal")?.classList.contains("active")) {
        cerrarEventoModal();
      }
    });

    // Selector de Categoría en Modal
    document.querySelectorAll("#evento-categoria-selector .cat-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll("#evento-categoria-selector .cat-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        categoriaSeleccionada = card.dataset.categoria;
        colorEventoSeleccionado = card.dataset.color;
        if (eventoCategoriaInput) eventoCategoriaInput.value = categoriaSeleccionada;

        // Auto-seleccionar color correspondiente
        document.querySelectorAll("#evento-form .color-option").forEach(opt => {
          opt.classList.toggle("activo", opt.dataset.color === colorEventoSeleccionado);
        });
      });
    });

    // Selector de Color libre en Modal
    document.querySelectorAll("#evento-form .color-option").forEach(opt => {
      opt.addEventListener("click", () => {
        document.querySelectorAll("#evento-form .color-option").forEach(o => o.classList.remove("activo"));
        opt.classList.add("activo");
        colorEventoSeleccionado = opt.dataset.color;
      });
    });

    // Navegación de mes
    $("cal-prev")?.addEventListener("click", () => {
      mesMostrado.setMonth(mesMostrado.getMonth() - 1);
      renderCalendario();
    });

    $("cal-next")?.addEventListener("click", () => {
      mesMostrado.setMonth(mesMostrado.getMonth() + 1);
      renderCalendario();
    });

    // Formulario de Envío
    $("evento-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      try {
        const titulo = $("evento-titulo")?.value.trim() || "";
        const descripcion = $("evento-descripcion")?.value.trim() || "";
        const fecha = $("evento-fecha")?.value || "";
        const fecha_fin = $("evento-fecha-fin")?.value || fecha;
        const categoria = categoriaSeleccionada || "cita";
        const recordatorio = parseInt($("evento-recordatorio")?.value ?? "1", 10);
        const recurrente = !!$("evento-recurrente")?.checked;

        if (!titulo || !fecha) {
          return alertar({ title: "Faltan datos", message: "Rellena título y fecha para el plan.", icon: "📅" });
        }

        if (fecha_fin && fecha_fin < fecha) {
          return alertar({ title: "Fechas inválidas", message: "La fecha de fin no puede ser anterior a la de inicio.", icon: "⚠️" });
        }

        const sBtn = $("evento-form")?.querySelector('button[type="submit"]');
        if (sBtn) {
          sBtn.disabled = true;
          sBtn.textContent = "Guardando plan...";
        }

        try {
          await pedirPermisoNotificacionesSilencioso();
          const nuevo = await añadirEventoTabla({
            titulo,
            descripcion,
            fecha,
            fecha_fin,
            categoria,
            color: colorEventoSeleccionado,
            recordatorio,
            recurrente
          });

          eventos.push(nuevo);
          eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));
          guardarLocalmente(eventos);
          cerrarEventoModal();

          // Sintonizar la vista al mes y día del nuevo evento
          const fObj = parseFechaLocal(fecha);
          mesMostrado = new Date(fObj.getFullYear(), fObj.getMonth(), 1);
          diaSeleccionadoISO = fecha;

          actualizarTodo();
          comprobarRecordatorios();
        } catch (err) {
          alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" });
          if (sBtn) {
            sBtn.disabled = false;
            sBtn.textContent = "Guardar plan";
          }
        }
      } catch (err) {
        console.warn("evento submit:", err);
      }
    });

    $("btn-notif-permiso")?.addEventListener("click", pedirPermisoNotificacionesManual);
  }

  // -------------------------------------------------------------
  // NOTIFICACIONES Y RECORDATORIOS
  // -------------------------------------------------------------
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

  // Inicialización
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
    renderAgenda,
    renderPanelDia,
    setVista,
    abrirEventoModal,
    cerrarEventoModal,
    comprobarRecordatorios,
    getEventos: () => eventos,
    setEventos: e => {
      eventos = (e || []).map(normalizarEvento);
      guardarLocalmente(eventos);
      actualizarTodo();
    }
  };
})();
