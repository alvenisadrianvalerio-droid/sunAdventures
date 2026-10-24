/* ============================================================
   MÓDULO: LOGROS Y EXPERIENCIA (album-logros.js)
   ============================================================ */
(function() {
  const { $, SVG, getUserIdSafe } = window.AlbumApp;

  const logrosPersonalesGrid = $("logros-personales-grid");
  const logrosGrupoGrid = $("logros-grupo-grid");
  const logrosDesbloqueados = $("logros-desbloqueados");
  const logroToast = $("logro-toast");
  const experienciaTitulo = $("experiencia-titulo");
  const experienciaXp = $("experiencia-xp");
  const experienciaProgreso = $("experiencia-progreso");
  const experienciaSiguiente = $("experiencia-siguiente");

  let visitasConsecutivas = 0;

  const IMAGENES_MASCOTA = {
    mapache: "img/mapache.png", girasol: "img/mascota-girasol.png", gatito: "img/siamesa.png",
    "gatito-negro": "img/gatito-negro.png", hamburguesa: "img/hamburguesa.png", oveja: "img/oveja.png",
    pollito: "img/pollito.png", jirafa: "img/jirafa.png", unicornio: "img/unicornio.png",
    conejo: "img/conejito.png", "dragon-bebe": "img/dragon-bebe.png", "dragon-anciano": "img/dragon-anciano.png"
  };

  const LOGROS = [
    { id: "primeros-pasos", tipo: "grupo", icono: SVG.medal, nombre: "Primeros pasos", descripcion: "Guarda la primera foto del grupo", meta: 1, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "fotografos", tipo: "grupo", icono: SVG.camera, nombre: "Fotógrafos", descripcion: "Guarda 50 fotos del grupo", meta: 50, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "poetas", tipo: "grupo", icono: SVG.note, nombre: "Poetas", descripcion: "Escribe 30 notas del grupo", meta: 30, medir: () => (window.AlbumApp.modules.notas?.getNotas() || []).length },
    { id: "racha", icono: SVG.fire, nombre: "Racha de 30 días", descripcion: "Abre la app 30 días seguidos", meta: 30, medir: () => visitasConsecutivas },
    { id: "trotamundos", tipo: "grupo", icono: SVG.globe, nombre: "Trotamundos", descripcion: "Guarda 10 fotos con ubicación", meta: 10, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).filter(f => f.lat != null && f.lng != null).length },
    { id: "racha-365", icono: SVG.calendar, nombre: "Un año de nosotros", descripcion: "Abre la app 365 días seguidos", meta: 365, medir: () => visitasConsecutivas },
    { id: "todos-los-logros", tipo: "grupo", icono: SVG.crown, nombre: "Leyenda absoluta", descripcion: "Completa todos los demás logros", meta: 1, esFinal: true, medir: () => LOGROS.filter(l => !l.esFinal).every(l => l.medir() >= l.meta) ? 1 : 0 }
  ];

  const MASCOTAS_LOGROS = [
    { id: "mapache", nombre: "el Mapache", icono: SVG.heart },
    { id: "girasol", nombre: "el Girasol", icono: SVG.sunflower },
    { id: "gatito", nombre: "la Siamesa", icono: SVG.heart },
    { id: "gatito-negro", nombre: "el Gato Negro", icono: SVG.heart },
    { id: "hamburguesa", nombre: "Hamburguesa", icono: SVG.heart },
    { id: "oveja", nombre: "la Oveja", icono: SVG.heart },
    { id: "pollito", nombre: "el Pollito", icono: SVG.heart },
    { id: "jirafa", nombre: "la Jirafa", icono: SVG.heart },
    { id: "unicornio", nombre: "el Unicornio", icono: SVG.sparkle },
    { id: "conejo", nombre: "el Conejito", icono: SVG.heart },
    { id: "dragon-bebe", nombre: "el Dragón Bebé", icono: SVG.fire },
    { id: "dragon-anciano", nombre: "el Dragón Anciano", icono: SVG.crown }
  ];

  MASCOTAS_LOGROS.forEach(m => {
    const sprite = IMAGENES_MASCOTA[m.id];
    const nombreCorto = m.nombre.replace(/^(el|la) /, "");
    LOGROS.push(
      { id: `mascota-${m.id}`, sprites: [sprite], icono: m.icono, nombre: `Conoce a ${m.nombre}`, descripcion: `Interactúa con ${m.nombre} por primera vez`, meta: 1, medir: () => JSON.parse(localStorage.getItem(`mascotas_conocidas_${getUserIdSafe()}`) || "[]").includes(m.id) ? 1 : 0 },
      { id: `clics-${m.id}`, sprites: [sprite], icono: SVG.tap, nombre: `Fan de ${nombreCorto}`, descripcion: `Dale 100 clics a ${nombreCorto}`, meta: 100, medir: () => Number(localStorage.getItem(`mascota_clicks_${getUserIdSafe()}_${m.id}`) || 0) }
    );
  });

  window.LOGROS = LOGROS;

  let logroToastTimeout = null;
  const notificarLogro = logro => {
    if (!logroToast) return;
    const spriteHTML = logro.sprites?.[0] ? `<img src="${logro.sprites[0]}" alt="" class="logro-toast-sprite">` : "";
    const iconoHTML = `<span class="logro-toast-icon-svg">${logro.icono}</span>`;
    logroToast.innerHTML = `<span class="logro-toast-visual">${spriteHTML}${iconoHTML}</span><span class="logro-toast-copy"><strong>Logro desbloqueado</strong><span>${logro.nombre}</span></span>`;
    logroToast.classList.add("visible");
    if (logroToastTimeout) clearTimeout(logroToastTimeout);
    logroToastTimeout = setTimeout(() => logroToast.classList.remove("visible"), 4500);
  };

  const crearIconoLogro = logro => {
    const wrapper = document.createElement("span");
    wrapper.className = "logro-icono-wrapper";
    if (logro.sprites && logro.sprites[0]) {
      const sw = document.createElement("span");
      sw.className = "logro-icono-sprite";
      const img = document.createElement("img");
      img.src = logro.sprites[0]; img.alt = ""; img.loading = "lazy";
      sw.appendChild(img); wrapper.appendChild(sw);
    }
    const svgWrap = document.createElement("span");
    svgWrap.className = "logro-icono-svg-badge";
    let iconHtml = logro.icono;
    if (!iconHtml) {
      const tipo = logro.id || "";
      if (tipo.startsWith("rpg-") || tipo.includes("jefe") || tipo.includes("enemigo")) iconHtml = window.ICONO?.espada;
      else if (tipo.includes("chat") || tipo.includes("mensaje")) iconHtml = window.ICONO?.chat;
      else if (tipo.includes("juego") || tipo.includes("jugador") || tipo.includes("ganador")) iconHtml = window.ICONO?.jugar;
      else if (tipo.includes("compra") || tipo.includes("moneda") || tipo.includes("rico")) iconHtml = window.ICONO?.moneda;
      else if (tipo.includes("playlist") || tipo.includes("cancion") || tipo.includes("musical")) iconHtml = window.ICONO?.musica;
      else if (tipo.includes("evento") || tipo.includes("calendario") || tipo.includes("planificador")) iconHtml = window.ICONO?.calendario;
      else if (tipo.includes("viaje") || tipo.includes("explorador") || tipo.includes("ubicacion")) iconHtml = window.ICONO?.mapa;
      else if (tipo.includes("cuidado") || tipo.includes("amistad") || tipo.includes("amigo")) iconHtml = window.ICONO?.corazon;
      else if (tipo.includes("nivel")) iconHtml = window.ICONO?.estrella;
      else iconHtml = window.ICONO?.estrella || "★";
    }
    svgWrap.innerHTML = iconHtml || "★";
    wrapper.appendChild(svgWrap);
    return wrapper;
  };

  const NIVEL_A_ICONO = { sprout: "raiz", heart: "corazon", flame: "fuego", sparkle: "estrella", sunflower: "girasol" };
  const NIVELES_EXPERIENCIA = [
    { minimo: 0, nombre: "Novatos", icono: "sprout", siguiente: 100, siguienteNombre: "Enamorados", siguienteIcono: "heart" },
    { minimo: 100, nombre: "Enamorados", icono: "heart", siguiente: 500, siguienteNombre: "Compañeros de vida", siguienteIcono: "flame" },
    { minimo: 500, nombre: "Compañeros de vida", icono: "flame", siguiente: 1000, siguienteNombre: "Almas gemelas", siguienteIcono: "sparkle" },
    { minimo: 1000, nombre: "Almas gemelas", icono: "sparkle", siguiente: 5000, siguienteNombre: "Leyendas", siguienteIcono: "sunflower" },
    { minimo: 5000, nombre: "Leyendas", icono: "sunflower", siguiente: null, siguienteNombre: "Máximo nivel", siguienteIcono: null }
  ];

  /* Función global para otorgar XP directamente a la barra de nivel */
  window._sumarExperienciaGlobal = (cantidad = 0, motivo = "") => {
    try {
      if (!cantidad || cantidad <= 0) return;
      const u = getUserIdSafe();
      const k = `sa_experiencia_extra_${u}`;
      const actual = Math.max(0, Number(localStorage.getItem(k)) || 0);
      const nuevo = actual + Math.round(cantidad);
      localStorage.setItem(k, String(nuevo));
      renderExperiencia();
      window.dispatchEvent(new Event("sunad:progress"));
      if (motivo) {
        try { window._TiendaAPI?.notifMascota?.("¡+XP de Nivel!", `+${Math.round(cantidad)} XP · ${motivo}`); } catch {}
      }
    } catch (err) { console.warn("sumarExperienciaGlobal:", err); }
  };

  const calcularExperiencia = () => {
    const u = getUserIdSafe();
    const fCount = (window.AlbumApp.modules.fotos?.getFotos() || []).length;
    const nCount = (window.AlbumApp.modules.notas?.getNotas() || []).length;
    const base = fCount * 10 + nCount * 5 + visitasConsecutivas * 20;

    // 1. Minijuegos jugados
    const minijuegosCount = Math.max(0, Number(localStorage.getItem(`sa_minijuegos_jugados_${u}`)) || 0);
    const xpMinijuegos = minijuegosCount * 5; // 5 XP por partida

    const MASCOTAS_LISTA = ["mapache","girasol","gatito","gatito-negro","hamburguesa","oveja","pollito","jirafa","unicornio","conejo","dragon-bebe","dragon-anciano"];

    // 2. Modo Aventura (RPG clásico): enemigos y zonas (agregado de todas las mascotas + legacy)
    let xpAventura = 0;
    try {
      let enemigosTotal = 0;
      const zonasTodas = new Set();
      const jefesTodos = new Set();

      const parseRpg = raw => {
        if (!raw) return;
        try {
          const d = typeof raw === "string" ? JSON.parse(raw) : raw;
          enemigosTotal += Number(d.enemigosDerrotados || 0);
          (d.zonasConquistadas || []).forEach(z => zonasTodas.add(z));
          (d.jefesDerrotados || []).forEach(j => jefesTodos.add(j));
        } catch {}
      };

      parseRpg(localStorage.getItem(`sa_rpg_${u}`));
      MASCOTAS_LISTA.forEach(m => parseRpg(localStorage.getItem(`sa_rpg_${u}_${m}`)));

      xpAventura = (enemigosTotal * 2) + (zonasTodas.size * 15) + (jefesTodos.size * 35);
    } catch {}

    // 3. Modo Roguelike: runs, mejor piso, victorias y jefes (agregado de todas las mascotas + legacy)
    let xpRoguelike = 0;
    try {
      let runsTotal = 0;
      let maxPiso = 0;
      let vicTotal = 0;
      let bossesTotal = 0;

      const parseRl = raw => {
        if (!raw) return;
        try {
          const d = typeof raw === "string" ? JSON.parse(raw) : raw;
          runsTotal += Number(d.runs || 0);
          if (Number(d.mejorPiso || 0) > maxPiso) maxPiso = Number(d.mejorPiso || 0);
          vicTotal += Number(d.victorias || 0);
          bossesTotal += Number(d.bossesDerrotados || 0);
        } catch {}
      };

      parseRl(localStorage.getItem(`sa_rl_meta_${u}`));
      MASCOTAS_LISTA.forEach(m => parseRl(localStorage.getItem(`sa_rl_meta_${u}_${m}`)));

      xpRoguelike = (runsTotal * 5) + (maxPiso * 10) + (vicTotal * 80) + (bossesTotal * 25);
    } catch {}

    const extra = Math.max(0, Number(localStorage.getItem(`sa_experiencia_extra_${u}`)) || 0);
    return base + extra + xpMinijuegos + xpAventura + xpRoguelike;
  };

  const hidratarIconosEn = root => {
    if (!root) return;
    root.querySelectorAll("[data-icono]").forEach(el => {
      const k = el.dataset.icono;
      if (window.ICONO?.[k] && !el.querySelector("svg")) el.innerHTML = window.ICONO[k];
    });
  };

  function renderExperiencia() {
    try {
      const xp = calcularExperiencia();
      const nivel = [...NIVELES_EXPERIENCIA].reverse().find(i => xp >= i.minimo) || NIVELES_EXPERIENCIA[0];
      if (experienciaTitulo) {
        const iconoKey = NIVEL_A_ICONO[nivel.icono] || "raiz";
        experienciaTitulo.innerHTML = `${nivel.nombre} <span class="ui-icon" data-icono="${iconoKey}"></span>`;
        hidratarIconosEn(experienciaTitulo);
      }
      if (experienciaXp) experienciaXp.textContent = `${xp} XP`;
      if (nivel.siguiente) {
        const pct = ((xp - nivel.minimo) / (nivel.siguiente - nivel.minimo)) * 100;
        if (experienciaProgreso) experienciaProgreso.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        if (experienciaSiguiente) {
          const sigIconoKey = NIVEL_A_ICONO[nivel.siguienteIcono] || "raiz";
          experienciaSiguiente.innerHTML = `${Math.max(0, nivel.siguiente - xp)} XP para ${nivel.siguienteNombre} <span class="ui-icon" data-icono="${sigIconoKey}"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      } else {
        if (experienciaProgreso) experienciaProgreso.style.width = "100%";
        if (experienciaSiguiente) {
          experienciaSiguiente.innerHTML = `Nivel máximo alcanzado <span class="ui-icon" data-icono="girasol"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      }
      window._experienciaActual = xp;
      window._nivelActual = NIVELES_EXPERIENCIA.findIndex(n => n.nombre === nivel.nombre) + 1;
    } catch (err) { console.error("renderExperiencia:", err); }
  }

  function registrarVisita() {
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const clave = `sunad_visitas_${getUserIdSafe()}`;
      const dias = JSON.parse(localStorage.getItem(clave) || "[]");
      if (!dias.includes(hoy)) dias.push(hoy);
      const ordenados = dias.sort().slice(-400);
      localStorage.setItem(clave, JSON.stringify(ordenados));
      visitasConsecutivas = 0;
      const fechas = new Set(ordenados);
      const cursor = new Date();
      while (fechas.has(cursor.toISOString().slice(0, 10))) { visitasConsecutivas++; cursor.setDate(cursor.getDate() - 1); }
    } catch { visitasConsecutivas = 0; }
  }

  const _logroState = { personal: { grid: null, cards: new Map(), firma: "" }, grupo: { grid: null, cards: new Map(), firma: "" } };
  const _firmaLogros = lista => lista.map(l => l.id).join("|");

  function _obtenerCategoria(logro) {
    if (logro.tipo === "grupo") return "grupo";
    const id = logro.id || "";
    if (id.startsWith("rl-")) return "roguelike";
    if (id.startsWith("rpg-") || id.startsWith("maxima-bestia")) return "rpg";
    if (id.startsWith("mascota-") || id.startsWith("clics-") || id.includes("cuidado") || id.includes("amigo")) return "mascotas";
    if (id.includes("juego") || id.includes("jugador") || id.includes("ganador") || id.includes("invicto") || id.includes("vicio")) return "minijuegos";
    return "general";
  }

  let _categoriaFiltroActiva = "todos";

  function _construirCard(logro) {
    const card = document.createElement("article");
    const cat = _obtenerCategoria(logro);
    card.className = "logro-card";
    card.dataset.logroId = logro.id;
    card.dataset.categoria = cat;
    if (_categoriaFiltroActiva !== "todos" && cat !== _categoriaFiltroActiva) {
      card.classList.add("logro-oculto");
    }

    const contenido = document.createElement("div");
    contenido.className = "logro-contenido";
    contenido.innerHTML = `
      <div class="logro-header-row">
        <h3>${logro.nombre}</h3>
        <span class="logro-badge-status">🔒</span>
      </div>
      <p>${logro.descripcion}</p>
      <div class="logro-progreso-track">
        <span class="logro-progreso-fill" style="width: 0%"></span>
      </div>
      <div class="logro-meta-info">
        <small class="logro-meta-text">0 / ${logro.meta}</small>
        <span class="logro-meta-porcentaje">0%</span>
      </div>`;
    card.append(crearIconoLogro(logro), contenido);
    return {
      card,
      small: contenido.querySelector(".logro-meta-text"),
      porcentaje: contenido.querySelector(".logro-meta-porcentaje"),
      fill: contenido.querySelector(".logro-progreso-fill"),
      badge: contenido.querySelector(".logro-badge-status")
    };
  }

  function _actualizarCard(entry, logro, desbloqueado, progreso, notificar) {
    const { card, small, porcentaje, fill, badge } = entry;
    const meta = Math.max(1, logro.meta || 1);
    const pct = Math.min(100, Math.max(0, Math.round((progreso / meta) * 100)));
    const nuevoTexto = desbloqueado ? "¡Completado!" : `${progreso} / ${logro.meta}`;
    if (small && small.textContent !== nuevoTexto) small.textContent = nuevoTexto;
    if (porcentaje) porcentaje.textContent = desbloqueado ? "100%" : `${pct}%`;
    if (fill) fill.style.width = desbloqueado ? "100%" : `${pct}%`;
    if (badge) badge.textContent = desbloqueado ? "✨" : "🔒";

    const tenia = card.classList.contains("desbloqueado");
    if (desbloqueado && !tenia) {
      card.classList.add("desbloqueado");
      try { window._snd?.("fanfarria") || window._snd?.("pop"); } catch {}
      if (notificar) notificarLogro(logro);
    } else if (!desbloqueado && tenia) {
      card.classList.remove("desbloqueado");
    }
  }

  function renderLogros({ notificar = false } = {}) {
    try {
      if (!logrosPersonalesGrid || !logrosGrupoGrid) return;
      const cacheLS = new Map();
      const getLS = k => { if (cacheLS.has(k)) return cacheLS.get(k); const v = JSON.parse(localStorage.getItem(k) || "{}"); cacheLS.set(k, v); return v; };
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();

      const pintar = (logros, gridEl, clave, stateKey) => {
        const st = _logroState[stateKey];
        const firma = _firmaLogros(logros);
        if (st.firma !== firma || st.grid !== gridEl) {
          gridEl.innerHTML = ""; st.cards.clear();
          const frag = document.createDocumentFragment();
          logros.forEach(logro => { const entry = _construirCard(logro); st.cards.set(logro.id, entry); frag.appendChild(entry.card); });
          gridEl.appendChild(frag); st.grid = gridEl; st.firma = firma;
        }
        const desbloqueados = getLS(clave);
        let total = 0, cambio = false;
        logros.forEach(logro => {
          try {
            const progreso = Math.min(logro.medir(), logro.meta);
            const desbloqueado = progreso >= logro.meta;
            if (desbloqueado) {
              if (notificar && !desbloqueados[logro.id]) notificarLogro(logro);
              if (!desbloqueados[logro.id]) { desbloqueados[logro.id] = true; cambio = true; }
              total++;
            }
            _actualizarCard(st.cards.get(logro.id), logro, desbloqueado, progreso, false);
          } catch (err) { console.warn(`Error logro ${logro.id}:`, err); }
        });
        if (cambio) localStorage.setItem(clave, JSON.stringify(desbloqueados));
        return total;
      };

      const personales = LOGROS.filter(l => l.tipo !== "grupo");
      const grupales = LOGROS.filter(l => l.tipo === "grupo");
      const totalPersonal = pintar(personales, logrosPersonalesGrid, `sunad_logros_${getUserIdSafe()}`, "personal");
      const totalGrupal = pintar(grupales, logrosGrupoGrid, `sunad_logros_grupo_${grupoActivo?.id || "local"}`, "grupo");

      // Actualizar conteos y barra global
      const totalDesbloqueados = totalPersonal + totalGrupal;
      const totalMeta = LOGROS.length;
      const pctGlobal = totalMeta > 0 ? Math.round((totalDesbloqueados / totalMeta) * 100) : 0;

      if (logrosDesbloqueados) logrosDesbloqueados.textContent = totalPersonal;
      const totalCountEl = $("logros-total-count");
      if (totalCountEl) totalCountEl.textContent = totalMeta;
      const pctGlobalEl = $("logros-porcentaje-global");
      if (pctGlobalEl) pctGlobalEl.textContent = `${pctGlobal}%`;
      const fillGlobalEl = $("logros-global-fill");
      if (fillGlobalEl) fillGlobalEl.style.width = `${pctGlobal}%`;

      // Aplicar filtro activo a los elementos visibles
      aplicarFiltroActivo();

      renderExperiencia();
      window._logrosDesbloqueados = {
        ...JSON.parse(localStorage.getItem(`sunad_logros_grupo_${grupoActivo?.id || "local"}`) || "{}"),
        ...JSON.parse(localStorage.getItem(`sunad_logros_${getUserIdSafe()}`) || "{}")
      };
      if (typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
    } catch (err) { console.error("renderLogros:", err); }
  }

  function aplicarFiltroActivo() {
    const cards = document.querySelectorAll(".logros-grid .logro-card");
    cards.forEach(card => {
      const cat = card.dataset.categoria;
      if (_categoriaFiltroActiva === "todos" || cat === _categoriaFiltroActiva) {
        card.classList.remove("logro-oculto");
      } else {
        card.classList.add("logro-oculto");
      }
    });

    // Ocultar o mostrar títulos según filtro
    const titPersonal = $("logros-cat-titulo-personal");
    const titGrupo = $("logros-cat-titulo-grupo");
    const gridGrupo = $("logros-grupo-grid");
    if (_categoriaFiltroActiva === "grupo") {
      if (titPersonal) titPersonal.style.display = "none";
      if (logrosPersonalesGrid) logrosPersonalesGrid.style.display = "none";
      if (titGrupo) titGrupo.style.display = "";
      if (gridGrupo) gridGrupo.style.display = "";
    } else if (_categoriaFiltroActiva !== "todos") {
      if (titPersonal) titPersonal.style.display = "";
      if (logrosPersonalesGrid) logrosPersonalesGrid.style.display = "";
      if (titGrupo) titGrupo.style.display = "none";
      if (gridGrupo) gridGrupo.style.display = "none";
    } else {
      if (titPersonal) titPersonal.style.display = "";
      if (logrosPersonalesGrid) logrosPersonalesGrid.style.display = "";
      if (titGrupo) titGrupo.style.display = "";
      if (gridGrupo) gridGrupo.style.display = "";
    }
  }

  // Configurar botones de filtro
  function inicializarFiltros() {
    const bar = $("logros-filtros-bar");
    if (!bar) return;
    bar.addEventListener("click", e => {
      const btn = e.target.closest(".logro-filtro-btn");
      if (!btn) return;
      bar.querySelectorAll(".logro-filtro-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      _categoriaFiltroActiva = btn.dataset.cat || "todos";
      aplicarFiltroActivo();
      try { window._snd?.("pop"); } catch {}
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarFiltros);
  } else {
    inicializarFiltros();
  }

  let _progressT = null, _progressPend = false;
  function _ejecutarProgress() {
    const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
    if (vistaActiva === "logros") renderLogros({ notificar: true });
    else try { renderLogros({ notificar: false }); } catch { }
    if (vistaActiva === "mascotas" && typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
    if (vistaActiva === "inicio") renderExperiencia();
    if (typeof window._actualizarModalMascota === "function") { try { window._actualizarModalMascota(); } catch { } }
  }

  window.addEventListener("sunad:progress", () => {
    if (_progressT) { _progressPend = true; return; }
    _progressT = requestAnimationFrame(() => {
      _progressT = null; _ejecutarProgress();
      if (_progressPend) { _progressPend = false; window.dispatchEvent(new Event("sunad:progress")); }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (document.querySelector("[data-view].active")?.dataset.view === "logros") renderLogros({ notificar: true });
  });

  window.renderLogros = renderLogros;

  window.AlbumApp.modules.logros = {
    LOGROS,
    renderLogros,
    renderExperiencia,
    registrarVisita,
    notificarLogro,
    getVisitasConsecutivas: () => visitasConsecutivas
  };
})();
