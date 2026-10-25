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

  /* Cache en memoria por ciclo de render para eliminar lecturas sincrónicas a localStorage */
  let _lsMemoryCache = null;
  const _getMemoryItem = (k) => {
    if (_lsMemoryCache && _lsMemoryCache.has(k)) return _lsMemoryCache.get(k);
    try {
      const v = localStorage.getItem(k);
      if (_lsMemoryCache) _lsMemoryCache.set(k, v);
      return v;
    } catch { return null; }
  };
  const _getMemoryJSON = (k, fallback = null) => {
    const raw = _getMemoryItem(k);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  };
  window._sunadGetLogrosLS = _getMemoryItem;
  window._sunadGetLogrosJSON = _getMemoryJSON;

  const IMAGENES_MASCOTA = {
    mapache: "img/mapache.webp", girasol: "img/mascota-girasol.webp", gatito: "img/siamesa.webp",
    "gatito-negro": "img/gatito-negro.webp", hamburguesa: "img/hamburguesa.webp", oveja: "img/oveja.webp",
    pollito: "img/pollito.webp", jirafa: "img/jirafa.webp", unicornio: "img/unicornio.webp",
    conejo: "img/conejito.webp", "dragon-bebe": "img/dragon-bebe.webp", "dragon-anciano": "img/dragon-anciano.webp"
  };

  const LOGROS = [
    { id: "primeros-pasos", tipo: "grupo", icono: SVG.medal, nombre: "Primeros pasos", descripcion: "Guarda la primera foto del grupo", meta: 1, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "fotografos", tipo: "grupo", icono: SVG.camera, nombre: "Fotógrafos", descripcion: "Guarda 50 fotos del grupo", meta: 50, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "poetas", tipo: "grupo", icono: SVG.note, nombre: "Poetas", descripcion: "Escribe 30 notas del grupo", meta: 30, medir: () => (window.AlbumApp.modules.notas?.getNotas() || []).length },
    { id: "racha", icono: SVG.fire, nombre: "Racha de 30 días", descripcion: "Abre la app 30 días seguidos", meta: 30, medir: () => visitasConsecutivas },
    { id: "trotamundos", tipo: "grupo", icono: SVG.globe, nombre: "Trotamundos", descripcion: "Guarda 10 fotos con ubicación", meta: 10, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).filter(f => f.lat != null && f.lng != null).length },
    { id: "racha-365", icono: SVG.calendar, nombre: "Un año de nosotros", descripcion: "Abre la app 365 días seguidos", meta: 365, medir: () => visitasConsecutivas },
    { id: "todos-los-logros", tipo: "grupo", icono: SVG.crown, nombre: "Leyenda absoluta", descripcion: "Completa todos los demás logros", meta: 1, esFinal: true, medir: () => 0 }
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
      { id: `mascota-${m.id}`, sprites: [sprite], icono: m.icono, nombre: `Conoce a ${m.nombre}`, descripcion: `Interactúa con ${m.nombre} por primera vez`, meta: 1, medir: () => (_getMemoryJSON(`mascotas_conocidas_${getUserIdSafe()}`, [])).includes(m.id) ? 1 : 0 },
      { id: `clics-${m.id}`, sprites: [sprite], icono: SVG.tap, nombre: `Fan de ${nombreCorto}`, descripcion: `Dale 100 clics a ${nombreCorto}`, meta: 100, medir: () => Number(_getMemoryItem(`mascota_clicks_${getUserIdSafe()}_${m.id}`) || 0) }
    );
  });

  window.LOGROS = LOGROS;

  let logroToastTimeout = null;
  const notificarLogro = logro => {
    if (!logroToast) return;
    const spriteHTML = logro.sprites?.[0] ? `<img src="${logro.sprites[0]}" alt="${logro.nombre || ''}" class="logro-toast-sprite" width="36" height="36" decoding="async">` : "";
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
      img.src = logro.sprites[0];
      img.alt = logro.nombre || "Logro";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 44;
      img.height = 44;
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

  // 1. Escala Individual: Rangos de Aventurero / Explorador Solitario
  const NIVEL_INDIVIDUAL_A_ICONO = { sprout: "raiz", brújula: "mapa", sword: "espada", shield: "estrella", sunflower: "girasol" };
  const NIVELES_INDIVIDUALES = [
    { minimo: 0, nombre: "Explorador Novato", icono: "sprout", siguiente: 100, siguienteNombre: "Aventurero Intrépido", siguienteIcono: "brújula" },
    { minimo: 100, nombre: "Aventurero Intrépido", icono: "brújula", siguiente: 500, siguienteNombre: "Caballero del Sol", siguienteIcono: "sword" },
    { minimo: 500, nombre: "Caballero del Sol", icono: "sword", siguiente: 1500, siguienteNombre: "Héroe Legendario", siguienteIcono: "shield" },
    { minimo: 1500, nombre: "Héroe Legendario", icono: "shield", siguiente: 5000, siguienteNombre: "Guardián Supremo", siguienteIcono: "sunflower" },
    { minimo: 5000, nombre: "Guardián Supremo", icono: "sunflower", siguiente: null, siguienteNombre: "Máximo Nivel", siguienteIcono: null }
  ];

  // 2. Escala de Pareja: Rangos de Vínculo Afectivo y Amor Mutuo con iconos SVG dedicados
  const SVG_PAREJA = {
    brote: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="svg-pareja-icono"><path d="M12 3a9 9 0 0 0-9 9c0 3.87 2.45 7.17 5.9 8.44.07-.46.15-1.02.15-1.44 0-1.87-.75-3.32-2.18-4.14 2.87-.14 5.13-2.51 5.13-5.36 0-.3-.03-.59-.08-.88 1.48 1.25 3.08 1.88 4.79 1.88.5 0 1-.06 1.47-.17-.18 2.88 1.95 5.37 4.82 5.67-1.43.82-2.18 2.27-2.18 4.14 0 .42.08.98.15 1.44A9.006 9.006 0 0 0 21 12a9 9 0 0 0-9-9z"/></svg>`,
    corazon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="svg-pareja-icono"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    fuego: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="svg-pareja-icono"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM12 20c-3.31 0-6-2.69-6-6 0-1.53.5-3.05 1.4-4.22.18 2.07 1.88 3.72 3.97 3.72 2.21 0 4-1.79 4-4 0-.31-.04-.61-.1-.9 1.7 1.3 2.73 3.32 2.73 5.4 0 3.31-2.69 6-6 6z"/></svg>`,
    destello: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="svg-pareja-icono"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>`,
    anillo: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="svg-pareja-icono"><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93A7.002 7.002 0 0 0 5 17c0 3.87 3.13 7 7 7s7-3.13 7-7a7.002 7.002 0 0 0-6.25-7.07C14.6 9.58 16 7.95 16 6a4 4 0 0 0-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"/></svg>`
  };

  const NIVELES_PAREJA = [
    { minimo: 0, nombre: "Primeras Miradas", iconoSvg: SVG_PAREJA.brote, siguiente: 100, siguienteNombre: "Enamorados", siguienteIconoSvg: SVG_PAREJA.corazon },
    { minimo: 100, nombre: "Enamorados", iconoSvg: SVG_PAREJA.corazon, siguiente: 400, siguienteNombre: "Compañeros de Vida", siguienteIconoSvg: SVG_PAREJA.fuego },
    { minimo: 400, nombre: "Compañeros de Vida", iconoSvg: SVG_PAREJA.fuego, siguiente: 1000, siguienteNombre: "Almas Gemelas", siguienteIconoSvg: SVG_PAREJA.destello },
    { minimo: 1000, nombre: "Almas Gemelas", iconoSvg: SVG_PAREJA.destello, siguiente: 3000, siguienteNombre: "Amor Eterno", siguienteIconoSvg: SVG_PAREJA.anillo },
    { minimo: 3000, nombre: "Amor Eterno", iconoSvg: SVG_PAREJA.anillo, siguiente: null, siguienteNombre: "Vínculo Infinito", siguienteIconoSvg: null }
  ];

  /* Función global para otorgar XP directamente a la barra de nivel individual */
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
        try { window._TiendaAPI?.notifMascota?.("¡+XP Individual!", `+${Math.round(cantidad)} XP · ${motivo}`); } catch {}
      }
    } catch (err) { console.warn("sumarExperienciaGlobal:", err); }
  };

  /* Función global para otorgar Amor XP a la barra de pareja */
  window._sumarAmorPareja = (cantidad = 0, motivo = "") => {
    try {
      if (!cantidad || cantidad <= 0) return;
      const u = getUserIdSafe();
      const k = `sa_amor_pareja_${u}`;
      const actual = Math.max(0, Number(localStorage.getItem(k)) || 0);
      const nuevo = actual + Math.round(cantidad);
      localStorage.setItem(k, String(nuevo));
      renderExperiencia();
      window.dispatchEvent(new Event("sunad:progress"));
      if (motivo) {
        try { window._TiendaAPI?.notifMascota?.("¡+Amor XP!", `+${Math.round(cantidad)} Amor XP · ${motivo}`); } catch {}
      }
    } catch (err) { console.warn("sumarAmorPareja:", err); }
  };

  // Cálculo de XP Individual (hazañas, juegos, aventuras y récords personales)
  const calcularExperiencia = () => {
    const u = getUserIdSafe();
    const minijuegosCount = Math.max(0, Number(_getMemoryItem(`sa_minijuegos_jugados_${u}`)) || 0);
    const xpMinijuegos = minijuegosCount * 5; // 5 XP por minijuego

    const MASCOTAS_LISTA = ["mapache","girasol","gatito","gatito-negro","hamburguesa","oveja","pollito","jirafa","unicornio","conejo","dragon-bebe","dragon-anciano"];

    // Modo Aventura (RPG clásico)
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

      parseRpg(_getMemoryItem(`sa_rpg_${u}`));
      MASCOTAS_LISTA.forEach(m => parseRpg(_getMemoryItem(`sa_rpg_${u}_${m}`)));

      xpAventura = (enemigosTotal * 2) + (zonasTodas.size * 15) + (jefesTodos.size * 35);
    } catch {}

    // Modo Roguelike
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

      parseRl(_getMemoryItem(`sa_rl_meta_${u}`));
      MASCOTAS_LISTA.forEach(m => parseRl(_getMemoryItem(`sa_rl_meta_${u}_${m}`)));

      xpRoguelike = (runsTotal * 5) + (maxPiso * 10) + (vicTotal * 80) + (bossesTotal * 25);
    } catch {}

    const extra = Math.max(0, Number(_getMemoryItem(`sa_experiencia_extra_${u}`)) || 0);
    return extra + xpMinijuegos + xpAventura + xpRoguelike;
  };

  // Cálculo de Experiencia de Pareja (fotos conjuntas, notas de amor, visitas consecutivas y cariño mutuo)
  const calcularExperienciaPareja = () => {
    const u = getUserIdSafe();
    const fCount = (window.AlbumApp.modules.fotos?.getFotos() || []).length;
    const nCount = (window.AlbumApp.modules.notas?.getNotas() || []).length;
    const baseAmor = fCount * 15 + nCount * 10 + visitasConsecutivas * 25;

    // Amor acumulado enviado / recibido
    const extraAmor = Math.max(0, Number(_getMemoryItem(`sa_amor_pareja_${u}`)) || 0);
    return baseAmor + extraAmor;
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
      // 1. Render Nivel Individual
      const xpInd = calcularExperiencia();
      const nivelInd = [...NIVELES_INDIVIDUALES].reverse().find(i => xpInd >= i.minimo) || NIVELES_INDIVIDUALES[0];
      if (experienciaTitulo) {
        const iconoKey = NIVEL_INDIVIDUAL_A_ICONO[nivelInd.icono] || "raiz";
        experienciaTitulo.innerHTML = `${nivelInd.nombre} <span class="ui-icon" data-icono="${iconoKey}"></span>`;
        hidratarIconosEn(experienciaTitulo);
      }
      if (experienciaXp) experienciaXp.textContent = `${xpInd} XP`;
      if (nivelInd.siguiente) {
        const pctInd = ((xpInd - nivelInd.minimo) / (nivelInd.siguiente - nivelInd.minimo)) * 100;
        if (experienciaProgreso) experienciaProgreso.style.width = `${Math.min(100, Math.max(0, pctInd))}%`;
        if (experienciaSiguiente) {
          const sigIconoKey = NIVEL_INDIVIDUAL_A_ICONO[nivelInd.siguienteIcono] || "raiz";
          experienciaSiguiente.innerHTML = `${Math.max(0, nivelInd.siguiente - xpInd)} XP para ${nivelInd.siguienteNombre} <span class="ui-icon" data-icono="${sigIconoKey}"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      } else {
        if (experienciaProgreso) experienciaProgreso.style.width = "100%";
        if (experienciaSiguiente) {
          experienciaSiguiente.innerHTML = `Máximo rango individual alcanzado <span class="ui-icon" data-icono="girasol"></span>`;
          hidratarIconosEn(experienciaSiguiente);
        }
      }

      // 2. Render Nivel de Pareja
      const parejaTituloEl = $("pareja-exp-titulo");
      const parejaTotalEl = $("pareja-exp-total");
      const parejaProgresoEl = $("pareja-exp-progreso");
      const parejaSiguienteEl = $("pareja-exp-siguiente");
      const parejaBtnAmor = $("btn-pareja-dar-amor");

      const xpPar = calcularExperienciaPareja();
      const nivelPar = [...NIVELES_PAREJA].reverse().find(i => xpPar >= i.minimo) || NIVELES_PAREJA[0];

      if (parejaTituloEl) {
        parejaTituloEl.innerHTML = `${nivelPar.nombre} <span class="pareja-titulo-svg-wrap">${nivelPar.iconoSvg}</span>`;
      }
      if (parejaTotalEl) {
        parejaTotalEl.innerHTML = `<span class="xp-corazon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span> <span>${xpPar} Amor XP</span>`;
      }
      if (nivelPar.siguiente) {
        const pctPar = ((xpPar - nivelPar.minimo) / (nivelPar.siguiente - nivelPar.minimo)) * 100;
        if (parejaProgresoEl) parejaProgresoEl.style.width = `${Math.min(100, Math.max(0, pctPar))}%`;
        if (parejaSiguienteEl) {
          const sigIcono = nivelPar.siguienteIconoSvg ? `<span class="pareja-sig-svg-wrap">${nivelPar.siguienteIconoSvg}</span>` : "";
          parejaSiguienteEl.innerHTML = `${Math.max(0, nivelPar.siguiente - xpPar)} Amor XP para ${nivelPar.siguienteNombre} ${sigIcono}`;
        }
      } else {
        if (parejaProgresoEl) parejaProgresoEl.style.width = "100%";
        if (parejaSiguienteEl) {
          parejaSiguienteEl.innerHTML = `Vínculo máximo eterno alcanzado <span class="pareja-sig-svg-wrap">${SVG_PAREJA.anillo}</span>`;
        }
      }

      // Botón interactivo "Enviar amor"
      if (parejaBtnAmor && !parejaBtnAmor.dataset.bound) {
        parejaBtnAmor.dataset.bound = "true";
        parejaBtnAmor.addEventListener("click", e => {
          e.preventDefault();
          window._sumarAmorPareja(15, "Caricia de amor enviada a tu pareja");
          try { window._snd?.("pop"); } catch {}
          parejaBtnAmor.style.transform = "scale(1.2)";
          setTimeout(() => { parejaBtnAmor.style.transform = ""; }, 200);
        });
      }

      window._experienciaActual = xpInd;
      window._experienciaParejaActual = xpPar;
      window._nivelActual = NIVELES_INDIVIDUALES.findIndex(n => n.nombre === nivelInd.nombre) + 1;
      window._nivelParejaActual = NIVELES_PAREJA.findIndex(n => n.nombre === nivelPar.nombre) + 1;
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
      _lsMemoryCache = new Map();
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
            let progreso = 0;
            if (logro.esFinal) {
              progreso = (total >= (LOGROS.length - 1)) ? 1 : 0;
            } else {
              progreso = Math.min(logro.medir(), logro.meta);
            }
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
        ..._getMemoryJSON(`sunad_logros_grupo_${grupoActivo?.id || "local"}`, {}),
        ..._getMemoryJSON(`sunad_logros_${getUserIdSafe()}`, {})
      };
      if (typeof window._renderMascotasGrid === "function") window._renderMascotasGrid();
    } catch (err) {
      console.error("renderLogros:", err);
    } finally {
      _lsMemoryCache = null;
    }
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

  let _progressTimer = null;
  window.addEventListener("sunad:progress", () => {
    if (_progressTimer) return;
    _progressTimer = setTimeout(() => {
      _progressTimer = null;
      requestAnimationFrame(_ejecutarProgress);
    }, 150);
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
