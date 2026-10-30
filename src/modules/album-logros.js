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
    { id: "primeros-pasos", tipo: "grupo", sprites: ["img/logros/primeros-pasos.svg"], icono: SVG.medal, nombre: "Primeros pasos", descripcion: "Guarda la primera foto del grupo", meta: 1, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "fotografos", tipo: "grupo", sprites: ["img/logros/fotografos.svg"], icono: SVG.camera, nombre: "Fotógrafos", descripcion: "Guarda 50 fotos del grupo", meta: 50, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).length },
    { id: "poetas", tipo: "grupo", sprites: ["img/logros/poetas.svg"], icono: SVG.note, nombre: "Poetas", descripcion: "Escribe 30 notas del grupo", meta: 30, medir: () => (window.AlbumApp.modules.notas?.getNotas() || []).length },
    { id: "racha", sprites: ["img/logros/racha.svg"], icono: SVG.fire, nombre: "Racha de 30 días", descripcion: "Abre la app 30 días seguidos", meta: 30, medir: () => visitasConsecutivas },
    { id: "trotamundos", tipo: "grupo", sprites: ["img/logros/trotamundos.svg"], icono: SVG.globe, nombre: "Trotamundos", descripcion: "Guarda 10 fotos con ubicación", meta: 10, medir: () => (window.AlbumApp.modules.fotos?.getFotos() || []).filter(f => f.lat != null && f.lng != null).length },
    { id: "racha-365", sprites: ["img/logros/racha-365.svg"], icono: SVG.calendar, nombre: "Un año de nosotros", descripcion: "Abre la app 365 días seguidos", meta: 365, medir: () => visitasConsecutivas },
    { id: "todos-los-logros", tipo: "grupo", sprites: ["img/logros/todos-los-logros.svg"], icono: SVG.crown, nombre: "Leyenda absoluta", descripcion: "Completa todos los demás logros", meta: 1, esFinal: true, medir: () => 0 }
  ];

  const MASCOTAS_LOGROS = [
    { id: "mapache", nombre: "el Mapache", icono: SVG.heart },
    { id: "girasol", nombre: "el Girasol", icono: SVG.sunflower },
    { id: "gatito", nombre: "la Siamesa", icono: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="5" r="2.5"/><circle cx="17" cy="5" r="2.5"/><path d="M12 7c-4 0-7 2.5-7 6.5 0 3 2.5 5.5 7 5.5s7-2.5 7-5.5C19 9.5 16 7 12 7z"/><circle cx="9.5" cy="12.5" r="1.2" fill="#181c28"/><circle cx="14.5" cy="12.5" r="1.2" fill="#181c28"/></svg>' },
    { id: "gatito-negro", nombre: "el Gato Negro", icono: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9 9 0 0 0-9 9c0 3.8 2.3 7 5.7 8.3L8 21h8l-.7-1.7C18.7 18 21 14.8 21 11a9 9 0 0 0-9-9zm-4 7l2 3h-4l2-3zm8 0l2 3h-4l2-3z"/></svg>' },
    { id: "hamburguesa", nombre: "Hamburguesa", icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11c0-4 4-7 9-7s9 3 9 7H3z"/><path d="M4 15h16"/><path d="M4 19h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1z"/><circle cx="8" cy="7" r=".8" fill="currentColor"/><circle cx="12" cy="6" r=".8" fill="currentColor"/><circle cx="16" cy="7" r=".8" fill="currentColor"/></svg>' },
    { id: "oveja", nombre: "la Oveja", icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6a3 3 0 1 1 6 0 3 3 0 1 1 3 3 3 3 0 1 1 0 6 3 3 0 1 1-3 3H9a3 3 0 1 1-3-3 3 3 0 1 1 0-6 3 3 0 1 1 3-3z"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/></svg>' },
    { id: "pollito", nombre: "el Pollito", icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="6"/><path d="M12 16c3 0 6 2 6 5H6c0-3 3-5 6-5z"/><path d="M12 10l-2 2h4l-2-2z" fill="currentColor"/><circle cx="10" cy="8.5" r=".8" fill="currentColor"/><circle cx="14" cy="8.5" r=".8" fill="currentColor"/></svg>' },
    { id: "jirafa", nombre: "la Jirafa", icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21v-8l4-8h4l-2 5v11"/><path d="M11 5V2M15 5V2"/><circle cx="13" cy="7" r="1" fill="currentColor"/></svg>' },
    { id: "unicornio", nombre: "el Unicornio", icono: SVG.sparkle },
    { id: "conejo", nombre: "el Conejito", icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2c-1 3 0 7 2 9M16 2c1 3 0 7-2 9"/><path d="M7 13a5 5 0 0 1 10 0c0 4-2 7-5 7s-5-3-5-7z"/><circle cx="10" cy="15" r=".8" fill="currentColor"/><circle cx="14" cy="15" r=".8" fill="currentColor"/></svg>' },
    { id: "dragon-bebe", nombre: "el Dragón Bebé", icono: SVG.fire },
    { id: "dragon-anciano", nombre: "el Dragón Anciano", icono: SVG.crown }
  ];

  MASCOTAS_LOGROS.forEach(m => {
    const nombreCorto = m.nombre.replace(/^(el|la) /, "");
    LOGROS.push(
      { id: `mascota-${m.id}`, sprites: [`img/logros/mascota-${m.id}.svg`], icono: m.icono, nombre: `Conoce a ${m.nombre}`, descripcion: `Interactúa con ${m.nombre} por primera vez`, meta: 1, medir: () => (_getMemoryJSON(`mascotas_conocidas_${getUserIdSafe()}`, [])).includes(m.id) ? 1 : 0 },
      { id: `clics-${m.id}`, sprites: [`img/logros/clics-${m.id}.svg`], icono: SVG.tap, nombre: `Fan de ${nombreCorto}`, descripcion: `Dale 100 clics a ${nombreCorto}`, meta: 100, medir: () => Number(_getMemoryItem(`mascota_clicks_${getUserIdSafe()}_${m.id}`) || 0) }
    );
  });

  window.LOGROS = LOGROS;

  // Iconos vectoriales ilustrados (estilo dashboard 160x160) hechos a medida para cada logro
  const SPRITES_TEMATICOS_LOGROS = {
    // Grupo y sociales
    "primeros-pasos": "img/logros/primeros-pasos.svg",
    "fotografos": "img/logros/fotografos.svg",
    "poetas": "img/logros/poetas.svg",
    "trotamundos": "img/logros/trotamundos.svg",
    "exploradores": "img/logros/exploradores.svg",
    "viajeros": "img/logros/viajeros.svg",
    "racha": "img/logros/racha.svg",
    "racha-365": "img/logros/racha-365.svg",
    "todos-los-logros": "img/logros/todos-los-logros.svg",

    // Chat
    "primer-chat": "img/logros/primer-chat.svg",
    "conversador": "img/logros/conversador.svg",
    "chat-1000": "img/logros/chat-1000.svg",

    // Minijuegos
    "primer-juego": "img/logros/primer-juego.svg",
    "jugador": "img/logros/jugador.svg",
    "vicio": "img/logros/vicio.svg",
    "ganador": "img/logros/ganador.svg",
    "invicto": "img/logros/invicto.svg",

    // Tienda y Economía
    "primera-compra": "img/logros/primera-compra.svg",
    "comprador": "img/logros/comprador.svg",
    "coleccionista": "img/logros/coleccionista.svg",
    "ahorrador": "img/logros/ahorrador.svg",
    "rico": "img/logros/rico.svg",

    // Progreso, Niveles y Cuidado
    "nivel-3": "img/logros/nivel-3.svg",
    "nivel-5": "img/logros/nivel-5.svg",
    "cuidado-7": "img/logros/cuidado-7.svg",
    "cuidado-30": "img/logros/cuidado-30.svg",
    "mejor-amigo": "img/logros/mejor-amigo.svg",

    // Sabiduría, Recetario y Calendario
    "primer-playlist": "img/logros/primer-playlist.svg",
    "dj-pro": "img/logros/dj-pro.svg",
    "coleccion-musical": "img/logros/coleccion-musical.svg",
    "primer-evento": "img/logros/primer-evento.svg",
    "planificador": "img/logros/planificador.svg",

    // Aventura RPG: Combate y enemigos
    "rpg-primer-paso": "img/logros/rpg-primer-paso.svg",
    "rpg-cazador": "img/logros/rpg-cazador.svg",
    "rpg-exterminador": "img/logros/rpg-exterminador.svg",
    "rpg-genocida": "img/logros/rpg-genocida.svg",
    "rpg-nivel-10": "img/logros/rpg-nivel-10.svg",
    "rpg-nivel-25": "img/logros/rpg-nivel-25.svg",
    "rpg-nivel-50": "img/logros/rpg-nivel-50.svg",

    // Jefes RPG
    "rpg-jefes-1": "img/logros/rpg-jefes-1.svg",
    "rpg-jefes-todos": "img/logros/rpg-jefes-todos.svg",

    // Botín y Cofres
    "rpg-loot-10": "img/logros/rpg-loot-10.svg",
    "rpg-loot-40": "img/logros/rpg-loot-40.svg",
    "rpg-loot-75": "img/logros/rpg-loot-75.svg",
    "rpg-mitico": "img/logros/rpg-mitico.svg",
    "rpg-cofres-10": "img/logros/rpg-cofres-10.svg",
    "rpg-cofres-50": "img/logros/rpg-cofres-50.svg",
    "rpg-bonus-100": "img/logros/rpg-bonus-100.svg",

    // Hordas RPG
    "rpg-horda-4": "img/logros/rpg-horda-4.svg",
    "rpg-horda-8": "img/logros/rpg-horda-8.svg",
    "rpg-horda-12": "img/logros/rpg-horda-12.svg",

    // Post-Game y Caos
    "rpg-falla-desbloqueada": "img/logros/rpg-falla-desbloqueada.svg",
    "rpg-caos-1": "img/logros/rpg-caos-1.svg",
    "rpg-caos-todos": "img/logros/rpg-caos-todos.svg",
    "rpg-falla-piso-10": "img/logros/rpg-falla-piso-10.svg",

    // Modo Roguelike
    "rl-primer-run": "img/logros/rl-primer-run.svg",
    "rl-piso-10": "img/logros/rl-piso-10.svg",
    "rl-victoria": "img/logros/rl-victoria.svg",
    "rl-cazabosses": "img/logros/rl-cazabosses.svg",

    // Especial Conejil
    "maxima-bestia": "img/logros/maxima-bestia.svg",
    "maxima-bestia-todas": "img/logros/maxima-bestia-todas.svg"
  };

  const _obtenerSpriteLogro = logro => {
    if (SPRITES_TEMATICOS_LOGROS[logro.id]) return SPRITES_TEMATICOS_LOGROS[logro.id];
    if (logro.sprites && logro.sprites[0]) return logro.sprites[0];
    return `img/logros/${logro.id || "nivel-5"}.svg`;
  };

  let logroToastTimeout = null;
  const notificarLogro = logro => {
    if (!logroToast) return;
    const spriteSrc = _obtenerSpriteLogro(logro);
    const rec = _obtenerRecompensaLogro(logro);
    const spriteHTML = spriteSrc ? `<img src="${spriteSrc}" alt="${logro.nombre || ''}" class="logro-toast-sprite" width="44" height="44" decoding="async">` : "";
    logroToast.innerHTML = `<span class="logro-toast-visual">${spriteHTML}</span><span class="logro-toast-copy"><strong>Logro desbloqueado · +${rec.monedas} 🪙 +${rec.xp} XP</strong><span>${logro.nombre}</span></span>`;
    logroToast.classList.add("visible");
    if (logroToastTimeout) clearTimeout(logroToastTimeout);
    logroToastTimeout = setTimeout(() => logroToast.classList.remove("visible"), 4500);
  };

  // Iconografía temática SVG dedicada para cada categoría y logro
  const ICONOS_TEMATICOS_LOGROS = {
    // Grupo y sociales
    "primeros-pasos": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="5"/><path d="M12 2l2.5 5 5 .5-4 3.5 1.5 5-5-3-5 3 1.5-5-4-3.5 5-.5z"/><path d="M8 22l4-3 4 3"/></svg>',
    "fotografos": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    "poetas": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
    "trotamundos": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    "exploradores": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/><circle cx="12" cy="11" r="2" fill="currentColor"/></svg>',
    "viajeros": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    "racha": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 3 3 4 3 8 0 1.5-1 3-3 3s-3-1.5-3-3c0-1 1-2 1-3 0-1-1-2-1-3 2 0 3-1 3-2z"/><path d="M11 19c-3 0-6-2-6-6 0-1 1-3 2-4 0 2 1 3 2 3 0-2 1-3 2-4-1 3 3 5 3 8 0 2-1 3-3 3z"/></svg>',
    "racha-365": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14l1.5 2 3-3" stroke-width="2.5"/></svg>',
    "todos-los-logros": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18l-1.5-9-4.5 4L12 5 9 13 4.5 9 3 18z"/></svg>',
    
    // Chat
    "primer-chat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    "conversador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    "chat-1000": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>',

    // Minijuegos
    "primer-juego": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></svg>',
    "jugador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>',
    "vicio": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="12 6 15 11 20 11 16 14 18 19 12 16 6 19 8 14 4 11 9 11 12 6" fill="currentColor"/></svg>',
    "ganador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V6h4"/><path d="M18 9h2a2 2 0 0 0 2-2V6h-4"/><path d="M6 4h12v6a6 6 0 0 1-12 0z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>',
    "invicto": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6 6 1-4.5 4.5 1 6L12 16l-5.5 3.5 1-6L3 9l6-1 3-6z"/></svg>',

    // Tienda y Economía
    "primera-compra": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    "comprador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    "coleccionista": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    "ahorrador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v12"/></svg>',
    "rico": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 9l8 13 8-13z"/><path d="M12 2v20M4 9h16" stroke="rgba(255,255,255,.4)" stroke-width="1.2"/></svg>',

    // Progreso y Niveles
    "nivel-3": '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    "nivel-5": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/><circle cx="12" cy="12" r="2.5" fill="#12141e"/></svg>',
    "cuidado-7": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><path d="M12 8v4l3 2"/></svg>',
    "cuidado-30": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><polygon points="12 5 13 8 16 8 13.5 10 14.5 13 12 11.5 9.5 13 10.5 10 8 8 11 8 12 5" fill="#ffd93d"/></svg>',
    "mejor-amigo": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#ffd93d"/></svg>',

    // Música y Calendario
    "primer-playlist": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    "dj-pro": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3"/></svg>',
    "coleccion-musical": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    "primer-evento": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14v4M10 16h4"/></svg>',
    "planificador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/></svg>',

    // Aventura RPG: Combate y enemigos
    "rpg-primer-paso": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>',
    "rpg-cazador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    "rpg-exterminador": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M9.5 17.5L21 6V3h-3L6.5 14.5"/><path d="M11 19l-6-6"/></svg>',
    "rpg-genocida": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9 9 0 0 0-9 9c0 3.2 1.7 6 4.3 7.5L7 21l3-1 2 1 2-1 3 1-.3-2.5C19.3 17 21 14.2 21 11a9 9 0 0 0-9-9zm-3.5 10c-.8 0-1.5-.7-1.5-1.5S7.7 9 8.5 9s1.5.7 1.5 1.5S9.3 12 8.5 12zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/></svg>',
    "rpg-nivel-10": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 15 9"/></svg>',
    "rpg-nivel-25": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 7v10M8 12h8"/></svg>',
    "rpg-nivel-50": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5L12 7z"/></svg>',
    
    // Jefes RPG
    "rpg-jefes-1": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4l2 3-3 1 2 4-5-2-2 6-2-6-5 2 2-4-3-1 2-3h12z"/><circle cx="12" cy="11" r="2" fill="currentColor"/></svg>',
    "rpg-jefes-todos": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>',

    // Botín y Cofres
    "rpg-loot-10": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 2 18 2 22 7 12 22 2 7 6 2"/><line x1="2" y1="7" x2="22" y2="7"/></svg>',
    "rpg-loot-40": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    "rpg-loot-75": '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2"/><circle cx="12" cy="12" r="2" fill="#181c28"/></svg>',
    "rpg-mitico": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 9l8 13 8-13z"/><path d="M12 2v20M4 9l8 4 8-4" stroke="rgba(255,255,255,.5)" stroke-width="1.5" fill="none"/></svg>',
    "rpg-cofres-10": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18v10H3z"/><path d="M3 10l2-4h14l2 4"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/></svg>',
    "rpg-cofres-50": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9z"/><path d="M3 11l2.5-6h13L21 11"/><rect x="10" y="14" width="4" height="4" rx="1" fill="currentColor"/></svg>',
    "rpg-bonus-100": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',

    // Hordas RPG
    "rpg-horda-4": '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5v1H4v-1zm10 1v-1c0-1.8-1-3.4-2.5-4.2 1-.5 2.2-.8 3.5-.8 2.2 0 4 1.8 4 4v2h-5z"/></svg>',
    "rpg-horda-8": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2v1.1C17.6 5.7 20 8.6 20 12c0 2.2-1 4.2-2.5 5.5l1.5 3.5-3.5-1.5C14.2 20 13.1 20 12 20s-2.2 0-3.5-.5L5 21l1.5-3.5C5 16.2 4 14.2 4 12c0-3.4 2.4-6.3 6-6.9V4c0-1.1.9-2 2-2zm-3 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',
    "rpg-horda-12": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 5h6l-4.5 4.5 1.5 6.5L12 15l-6 3 1.5-6.5L3 7h6l3-5z"/><path d="M12 7l1.5 2.5h3L14.2 12l.8 3-3-1.5-3 1.5.8-3-2.3-2.5h3L12 7z" fill="#181c28"/></svg>',

    // Post-Game y Caos
    "rpg-falla-desbloqueada": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
    "rpg-caos-1": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    "rpg-caos-todos": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3 4 5-1-1 5 4 3-4 3 1 5-5-1-3 4-3-4-5 1 1-5-4-3 4-3-1-5 5 1 3-4z"/><circle cx="12" cy="12" r="3" fill="#181c28"/></svg>',
    "rpg-falla-piso-10": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',

    // Modo Roguelike
    "rl-primer-run": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    "rl-piso-10": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 10l7-7 7 7"/><path d="M5 21h14"/></svg>',
    "rl-victoria": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5L12 7z" fill="#181c28"/></svg>',
    "rl-cazabosses": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></svg>',

    // Especial Conejil
    "maxima-bestia": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 2c-1.5 3 0 7 2 9M16 2c1.5 3 0 7-2 9"/><path d="M6 13a6 6 0 0 1 12 0c0 4-2.5 8-6 8s-6-4-6-8z"/><circle cx="9" cy="14" r="1" fill="#181c28"/><circle cx="15" cy="14" r="1" fill="#181c28"/><polygon points="12 2 13 4 15 4 13.5 5.5 14 7.5 12 6.5 10 7.5 10.5 5.5 9 4 11 4 12 2" fill="#ffd93d"/></svg>',
    "maxima-bestia-todas": '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/><circle cx="12" cy="12" r="3" fill="#181c28"/></svg>'
  };

  const crearIconoLogro = logro => {
    const wrapper = document.createElement("span");
    wrapper.className = "logro-icono-wrapper";
    const spriteSrc = _obtenerSpriteLogro(logro);
    if (spriteSrc) {
      const sw = document.createElement("span");
      sw.className = "logro-icono-sprite";
      const img = document.createElement("img");
      img.src = spriteSrc;
      img.alt = logro.nombre || "Logro";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 56;
      img.height = 56;
      sw.appendChild(img);
      wrapper.appendChild(sw);
    }
    return wrapper;
  };

  // 1. Escala Individual: Rangos de Aventurero / Explorador Solitario con emblemas SVG ilustrados
  const NIVEL_INDIVIDUAL_A_ICONO = { sprout: "raiz", brújula: "mapa", sword: "espada", shield: "estrella", sunflower: "girasol" };
  const NIVELES_INDIVIDUALES = [
    { minimo: 0, nombre: "Explorador Novato", icono: "sprout", imgRango: "img/rangos/ind-1-novato.svg", siguiente: 100, siguienteNombre: "Aventurero Intrépido", siguienteIcono: "brújula", siguienteImg: "img/rangos/ind-2-aventurero.svg", beneficio: "Acceso básico a todas las herramientas del santuario y minijuegos." },
    { minimo: 100, nombre: "Aventurero Intrépido", icono: "brújula", imgRango: "img/rangos/ind-2-aventurero.svg", siguiente: 500, siguienteNombre: "Caballero del Sol", siguienteIcono: "sword", siguienteImg: "img/rangos/ind-3-caballero.svg", beneficio: "+5% de probabilidad de botín raro en cofres y +10 SunCoins diarios." },
    { minimo: 500, nombre: "Caballero del Sol", icono: "sword", imgRango: "img/rangos/ind-3-caballero.svg", siguiente: 1500, siguienteNombre: "Héroe Legendario", siguienteIcono: "shield", siguienteImg: "img/rangos/ind-4-heroe.svg", beneficio: "+10% de daño físico en Aventura y acceso prioritario a recetas místicas." },
    { minimo: 1500, nombre: "Héroe Legendario", icono: "shield", imgRango: "img/rangos/ind-4-heroe.svg", siguiente: 5000, siguienteNombre: "Guardián Supremo", siguienteIcono: "sunflower", siguienteImg: "img/rangos/ind-5-guardian.svg", beneficio: "+15% de defensa total, marco dorado exclusivo de explorador y +20 SunCoins diarios." },
    { minimo: 5000, nombre: "Guardián Supremo", icono: "sunflower", imgRango: "img/rangos/ind-5-guardian.svg", siguiente: null, siguienteNombre: "Máximo Nivel", siguienteIcono: null, siguienteImg: null, beneficio: "Aura solar suprema, acceso ilimitado a secretos arcanos y bonificación máxima en todos los modos." }
  ];

  // 2. Escala de Pareja: Rangos de Vínculo Afectivo y Amor Mutuo con emblemas SVG ilustrados
  const SVG_PAREJA = {
    brote: `<img src="img/rangos/par-1-miradas.svg" width="22" height="22" alt="Primeras Miradas" class="rango-inline-emblem">`,
    corazon: `<img src="img/rangos/par-2-enamorados.svg" width="22" height="22" alt="Enamorados" class="rango-inline-emblem">`,
    fuego: `<img src="img/rangos/par-3-companeros.svg" width="22" height="22" alt="Compañeros de Vida" class="rango-inline-emblem">`,
    destello: `<img src="img/rangos/par-4-almas.svg" width="22" height="22" alt="Almas Gemelas" class="rango-inline-emblem">`,
    anillo: `<img src="img/rangos/par-5-eterno.svg" width="22" height="22" alt="Amor Eterno" class="rango-inline-emblem">`
  };

  const NIVELES_PAREJA = [
    { minimo: 0, nombre: "Primeras Miradas", imgRango: "img/rangos/par-1-miradas.svg", iconoSvg: SVG_PAREJA.brote, siguiente: 100, siguienteNombre: "Enamorados", siguienteIconoSvg: SVG_PAREJA.corazon, beneficio: "Desbloquea el envío diario de caricias de amor y notas compartidas." },
    { minimo: 100, nombre: "Enamorados", imgRango: "img/rangos/par-2-enamorados.svg", iconoSvg: SVG_PAREJA.corazon, siguiente: 400, siguienteNombre: "Compañeros de Vida", siguienteIconoSvg: SVG_PAREJA.fuego, beneficio: "Notificaciones de amor instantáneas y fondo romántico suave en el chat." },
    { minimo: 400, nombre: "Compañeros de Vida", imgRango: "img/rangos/par-3-companeros.svg", iconoSvg: SVG_PAREJA.fuego, siguiente: 1000, siguienteNombre: "Almas Gemelas", siguienteIconoSvg: SVG_PAREJA.destello, beneficio: "+25% de XP al enviar fotos conjuntas al álbum y stickers exclusivos." },
    { minimo: 1000, nombre: "Almas Gemelas", imgRango: "img/rangos/par-4-almas.svg", iconoSvg: SVG_PAREJA.destello, siguiente: 3000, siguienteNombre: "Amor Eterno", siguienteIconoSvg: SVG_PAREJA.anillo, beneficio: "Desbloquea mini-recuerdos interactivos en el calendario y animación especial de fuegos artificiales." },
    { minimo: 3000, nombre: "Amor Eterno", imgRango: "img/rangos/par-5-eterno.svg", iconoSvg: SVG_PAREJA.anillo, siguiente: null, siguienteNombre: "Vínculo Infinito", siguienteIconoSvg: null, beneficio: "Anillo astral de pareja permanente, medalla de Amor Inmortal y efectos mágicos de corazones." }
  ];

  // Cálculo automático de recompensa por logro (SunCoins + XP)
  function _obtenerRecompensaLogro(logro) {
    if (logro.esFinal) return { monedas: 500, xp: 300 };
    const id = logro.id || "";
    const meta = Number(logro.meta || 1);
    if (id.includes("todos") || id.includes("caos-todos") || id === "racha-365" || id === "rpg-genocida" || id === "rico") {
      return { monedas: 150, xp: 100 };
    }
    if (meta >= 100 || id.startsWith("rl-victoria") || id.startsWith("rpg-mitico") || id === "maxima-bestia") {
      return { monedas: 100, xp: 75 };
    }
    if (meta >= 25 || id.startsWith("rpg-jefes") || id.startsWith("rpg-horda")) {
      return { monedas: 60, xp: 45 };
    }
    return { monedas: 35, xp: 25 };
  }

  /* Modal de Rangos y Beneficios */
  function abrirModalRangos(tipoInicial = "individual") {
    const modal = $("modal-rangos-beneficios");
    if (!modal) return;

    const btnCerrar = $("btn-cerrar-modal-rangos");
    const tabInd = $("tab-rangos-individual");
    const tabPar = $("tab-rangos-pareja");
    const listaEl = $("modal-rangos-lista");
    const iconBadge = $("modal-rangos-tipo-icon");
    const tituloEl = $("modal-rangos-titulo");
    const subtituloEl = $("modal-rangos-subtitulo");

    let tabActual = tipoInicial;

    function renderLista() {
      if (!listaEl) return;
      listaEl.innerHTML = "";

      if (tabActual === "individual") {
        if (iconBadge) iconBadge.innerHTML = `<img src="img/rangos/ind-4-heroe.svg" width="26" height="26" alt="Individual">`;
        if (tituloEl) tituloEl.textContent = "Rangos de Explorador Individual";
        if (subtituloEl) subtituloEl.textContent = "Gana XP jugando minijuegos, en Aventura, logrando hazañas y cuidando mascotas";
        if (tabInd) tabInd.classList.add("active");
        if (tabPar) tabPar.classList.remove("active");

        const xpInd = calcularExperiencia();
        NIVELES_INDIVIDUALES.forEach((lvl) => {
          const desbloqueado = xpInd >= lvl.minimo;
          const esActual = desbloqueado && (!lvl.siguiente || xpInd < lvl.siguiente);

          const item = document.createElement("div");
          item.className = `modal-rango-item ${desbloqueado ? "desbloqueado" : "bloqueado"} ${esActual ? "rango-actual" : ""}`;
          item.innerHTML = `
            <div class="modal-rango-icono-col">
              <img src="${lvl.imgRango}" alt="${lvl.nombre}" width="44" height="44" class="modal-rango-emblem-img" decoding="async">
              ${esActual ? '<span class="modal-rango-actual-tag">ACTUAL</span>' : ""}
            </div>
            <div class="modal-rango-info-col">
              <div class="modal-rango-top-row">
                <strong class="modal-rango-nombre">${lvl.nombre}</strong>
                <span class="modal-rango-req">${lvl.minimo === 0 ? "Inicial" : `${lvl.minimo} XP`}</span>
              </div>
              <p class="modal-rango-beneficio">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" class="svg-inline-sparkle" aria-hidden="true"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>
                <strong>Beneficio:</strong> ${lvl.beneficio}
              </p>
              ${desbloqueado ? '<span class="modal-rango-status-pill pill-ok"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Desbloqueado</span>' : `<span class="modal-rango-status-pill pill-lock"><svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> Requiere ${lvl.minimo - xpInd} XP más</span>`}
            </div>
          `;
          listaEl.appendChild(item);
        });
      } else {
        if (iconBadge) iconBadge.innerHTML = `<img src="img/rangos/par-5-eterno.svg" width="26" height="26" alt="Pareja">`;
        if (tituloEl) tituloEl.textContent = "Rangos de Vínculo de Pareja";
        if (subtituloEl) subtituloEl.textContent = "Acumula Amor XP guardando fotos, notas y enviando caricias";
        if (tabPar) tabPar.classList.add("active");
        if (tabInd) tabInd.classList.remove("active");

        const xpPar = calcularExperienciaPareja();
        NIVELES_PAREJA.forEach((lvl) => {
          const desbloqueado = xpPar >= lvl.minimo;
          const esActual = desbloqueado && (!lvl.siguiente || xpPar < lvl.siguiente);

          const item = document.createElement("div");
          item.className = `modal-rango-item item-pareja ${desbloqueado ? "desbloqueado" : "bloqueado"} ${esActual ? "rango-actual" : ""}`;
          item.innerHTML = `
            <div class="modal-rango-icono-col">
              <img src="${lvl.imgRango}" alt="${lvl.nombre}" width="44" height="44" class="modal-rango-emblem-img" decoding="async">
              ${esActual ? '<span class="modal-rango-actual-tag tag-pink">ACTUAL</span>' : ""}
            </div>
            <div class="modal-rango-info-col">
              <div class="modal-rango-top-row">
                <strong class="modal-rango-nombre">${lvl.nombre}</strong>
                <span class="modal-rango-req">${lvl.minimo === 0 ? "Inicial" : `${lvl.minimo} Amor XP`}</span>
              </div>
              <p class="modal-rango-beneficio">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" class="svg-inline-heart" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <strong>Beneficio:</strong> ${lvl.beneficio}
              </p>
              ${desbloqueado ? '<span class="modal-rango-status-pill pill-ok"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> Desbloqueado</span>' : `<span class="modal-rango-status-pill pill-lock"><svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> Requiere ${lvl.minimo - xpPar} Amor XP más</span>`}
            </div>
          `;
          listaEl.appendChild(item);
        });
      }
    }

    renderLista();

    if (tabInd && !tabInd.dataset.bound) {
      tabInd.dataset.bound = "true";
      tabInd.addEventListener("click", () => {
        tabActual = "individual";
        renderLista();
        try { window._snd?.("pop"); } catch {}
      });
    }

    if (tabPar && !tabPar.dataset.bound) {
      tabPar.dataset.bound = "true";
      tabPar.addEventListener("click", () => {
        tabActual = "pareja";
        renderLista();
        try { window._snd?.("pop"); } catch {}
      });
    }

    const cerrar = () => {
      modal.classList.remove("active");
      try { window._snd?.("pop"); } catch {}
    };

    if (btnCerrar && !btnCerrar.dataset.bound) {
      btnCerrar.dataset.bound = "true";
      btnCerrar.addEventListener("click", cerrar);
    }

    const backdrop = modal.querySelector(".modal-backdrop");
    if (backdrop && !backdrop.dataset.bound) {
      backdrop.dataset.bound = "true";
      backdrop.addEventListener("click", cerrar);
    }

    modal.classList.add("active");
    try { window._snd?.("pop"); } catch {}
  }

  // Vincular eventos de clic a las tarjetas de nivel del lobby
  function inicializarCardsExperiencia() {
    const cardInd = $("card-progreso-individual");
    if (cardInd && !cardInd.dataset.boundModal) {
      cardInd.dataset.boundModal = "true";
      const abrir = (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        abrirModalRangos("individual");
      };
      cardInd.addEventListener("click", abrir);
      cardInd.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(e); }
      });
    }

    const cardPar = $("experiencia-card-pareja");
    if (cardPar && !cardPar.dataset.boundModal) {
      cardPar.dataset.boundModal = "true";
      const abrir = (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        abrirModalRangos("pareja");
      };
      cardPar.addEventListener("click", abrir);
      cardPar.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(e); }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarCardsExperiencia);
  } else {
    inicializarCardsExperiencia();
  }

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

    // Vínculo acumulado con las mascotas (cada nivel de amor otorga experiencia)
    let xpVinculoMascotas = 0;
    try {
      MASCOTAS_LISTA.forEach(m => {
        const vinculoRaw = Number(_getMemoryItem(`sa_mascota_vinculo_${u}_${m}`) || 0);
        xpVinculoMascotas += Math.round(vinculoRaw * 0.15);
      });
    } catch {}

    const extra = Math.max(0, Number(_getMemoryItem(`sa_experiencia_extra_${u}`)) || 0);
    return extra + xpMinijuegos + xpAventura + xpRoguelike + xpVinculoMascotas;
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
        experienciaTitulo.innerHTML = `${nivelInd.nombre} <img src="${nivelInd.imgRango}" alt="${nivelInd.nombre}" width="24" height="24" class="rango-inline-emblem" decoding="async">`;
      }
      if (experienciaXp) experienciaXp.textContent = `${xpInd} XP`;
      if (nivelInd.siguiente) {
        const pctInd = ((xpInd - nivelInd.minimo) / (nivelInd.siguiente - nivelInd.minimo)) * 100;
        if (experienciaProgreso) experienciaProgreso.style.width = `${Math.min(100, Math.max(0, pctInd))}%`;
        if (experienciaSiguiente) {
          const sigImg = nivelInd.siguienteImg ? `<img src="${nivelInd.siguienteImg}" alt="" width="18" height="18" class="rango-inline-emblem" decoding="async">` : "";
          experienciaSiguiente.innerHTML = `${Math.max(0, nivelInd.siguiente - xpInd)} XP para ${nivelInd.siguienteNombre} ${sigImg}`;
        }
      } else {
        if (experienciaProgreso) experienciaProgreso.style.width = "100%";
        if (experienciaSiguiente) {
          experienciaSiguiente.innerHTML = `Máximo rango individual alcanzado <img src="img/rangos/ind-5-guardian.svg" alt="" width="18" height="18" class="rango-inline-emblem" decoding="async">`;
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
        parejaTotalEl.textContent = `${xpPar} Amor XP`;
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
          try {
            const u = getUserIdSafe();
            const totalAmor = Math.max(0, Number(localStorage.getItem(`sa_amor_pareja_${u}`)) || 0);
            window.dispatchEvent(new CustomEvent("sunad:amor-enviado", {
              detail: { delta: 15, total: totalAmor }
            }));
          } catch {}
        });
      }

      // 3. Render Jardín Solar Evolutivo ("Árbol de Nuestro Amor")
      const cardParejaEl = $("experiencia-card-pareja");
      if (cardParejaEl) {
        let jardinBox = $("pareja-jardin-widget");
        if (!jardinBox) {
          jardinBox = document.createElement("div");
          jardinBox.id = "pareja-jardin-widget";
          jardinBox.style.cssText = "margin-top:10px;padding:9px 11px;border-radius:12px;background:linear-gradient(135deg,rgba(244,63,94,0.10),rgba(245,158,11,0.09));border:1px solid rgba(251,113,133,0.25);display:flex;align-items:center;justify-content:space-between;gap:10px;";
          cardParejaEl.appendChild(jardinBox);
        }

        const etapasJardin = [
          {
            min: 0,
            nombre: "Semilla del Destino",
            sub: "Etapa 1/5 · Germinando juntos",
            svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="10" y="34" width="28" height="7" rx="3.5" fill="#78350f"/><path d="M14 41h20l-2.5 5H16.5z" fill="#92400e"/><ellipse cx="24" cy="29" rx="6" ry="4.5" fill="#d97706" stroke="#fde68a" stroke-width="1.5"/><path d="M24 24c0-4 3-6 3-6s1 3-3 6z" fill="#4ade80"/><circle cx="17" cy="20" r="1.5" fill="#fb7185" opacity="0.8"/><circle cx="31" cy="18" r="1.3" fill="#fbbf24" opacity="0.8"/></svg>`
          },
          {
            min: 100,
            nombre: "Brote Tierno",
            sub: "Etapa 2/5 · Hojas de cariño",
            svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="12" y="35" width="24" height="8" rx="3" fill="#92400e"/><path d="M24 35V20" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/><path d="M24 28c-6-1-9-5-7-8 3-1 6 2 7 8z" fill="#4ade80"/><path d="M24 25c6-1 9-5 7-8-3-1-6 2-7 8z" fill="#22c55e"/><path d="M24 17l-2-2a2.2 2.2 0 0 1 3.1-3.1l.9.9.9-.9a2.2 2.2 0 0 1 3.1 3.1l-6 5z" fill="#fb7185"/></svg>`
          },
          {
            min: 300,
            nombre: "Capullo Dorado",
            sub: "Etapa 3/5 · Despertar solar",
            svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="13" y="36" width="22" height="8" rx="3" fill="#b45309"/><path d="M24 36V16" stroke="#16a34a" stroke-width="3.2" stroke-linecap="round"/><path d="M24 29c-7-1-10-5-8-8 3-1 7 2 8 8z" fill="#4ade80"/><path d="M24 27c7-1 10-5 8-8-3-1-7 2-8 8z" fill="#22c55e"/><circle cx="24" cy="15" r="6.5" fill="#fbbf24" stroke="#fef08a" stroke-width="1.5"/><circle cx="24" cy="15" r="3.5" fill="#92400e"/></svg>`
          },
          {
            min: 700,
            nombre: "Girasol Radiante",
            sub: "Etapa 4/5 · Plena floración",
            svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="13" y="37" width="22" height="8" rx="3" fill="#b45309"/><path d="M24 37V17" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/><path d="M24 30c-7-1-10-5-8-8 3-1 7 2 8 8z" fill="#4ade80"/><path d="M24 28c7-1 10-5 8-8-3-1-7 2-8 8z" fill="#22c55e"/><g fill="#f59e0b"><circle cx="24" cy="7" r="3"/><circle cx="24" cy="23" r="3"/><circle cx="16" cy="15" r="3"/><circle cx="32" cy="15" r="3"/><circle cx="18.3" cy="9.3" r="3"/><circle cx="29.7" cy="9.3" r="3"/><circle cx="18.3" cy="20.7" r="3"/><circle cx="29.7" cy="20.7" r="3"/></g><circle cx="24" cy="15" r="5.5" fill="#78350f" stroke="#fde047" stroke-width="1.2"/></svg>`
          },
          {
            min: 1400,
            nombre: "Jardín Estelar Eterno",
            sub: "Etapa 5/5 · Amor cósmico infinito",
            svg: `<svg viewBox="0 0 48 48" width="40" height="40"><defs><radialGradient id="jgGlow" cx="50%" cy="40%" r="50%"><stop offset="0%" stop-color="#fde047" stop-opacity="0.65"/><stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/></radialGradient></defs><circle cx="24" cy="20" r="19" fill="url(#jgGlow)"/><rect x="12" y="37" width="24" height="8" rx="3.5" fill="#9d174d" stroke="#fbcfe8" stroke-width="1"/><path d="M24 37V15" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/><path d="M18 37V22" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/><path d="M30 37V22" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/><g fill="#fbbf24"><circle cx="24" cy="7" r="2.8"/><circle cx="24" cy="21" r="2.8"/><circle cx="17" cy="14" r="2.8"/><circle cx="31" cy="14" r="2.8"/><circle cx="19" cy="9" r="2.6"/><circle cx="29" cy="9" r="2.6"/><circle cx="19" cy="19" r="2.6"/><circle cx="29" cy="19" r="2.6"/></g><circle cx="24" cy="14" r="4.8" fill="#be123c" stroke="#fef08a" stroke-width="1.3"/><circle cx="16" cy="21" r="3.6" fill="#f43f5e" stroke="#fde047" stroke-width="1.2"/><circle cx="32" cy="21" r="3.6" fill="#f43f5e" stroke="#fde047" stroke-width="1.2"/></svg>`
          }
        ];

        const etapaActual = [...etapasJardin].reverse().find(e => xpPar >= e.min) || etapasJardin[0];
        const hoyKey = new Date().toISOString().slice(0, 10);
        const uidJardin = getUserIdSafe();
        const regadoHoy = localStorage.getItem(`sa_jardin_regado_${uidJardin}`) === hoyKey;

        const svgMiniGirasol = `<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-right:3px;flex-shrink:0;"><g fill="#fbbf24"><circle cx="12" cy="4.5" r="2.3"/><circle cx="12" cy="19.5" r="2.3"/><circle cx="4.5" cy="12" r="2.3"/><circle cx="19.5" cy="12" r="2.3"/><circle cx="6.7" cy="6.7" r="2.2"/><circle cx="17.3" cy="6.7" r="2.2"/><circle cx="6.7" cy="17.3" r="2.2"/><circle cx="17.3" cy="17.3" r="2.2"/></g><circle cx="12" cy="12" r="4.6" fill="#78350f" stroke="#fde047" stroke-width="1.2"/></svg>`;
        const svgMiniGota = `<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;margin-right:3px;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/></svg>`;
        const svgMiniMoneda = `<svg viewBox="0 0 24 24" width="12" height="12" style="vertical-align:-1px;margin:0 1px;"><circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#fef08a" stroke-width="1.8"/><circle cx="12" cy="12" r="5" fill="#d97706"/></svg>`;
        const svgMiniCorazon = `<svg viewBox="0 0 24 24" width="12" height="12" style="vertical-align:-1px;margin:0 1px;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fb7185"/></svg>`;

        jardinBox.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <div style="width:42px;height:42px;border-radius:11px;background:rgba(15,23,42,0.55);border:1px solid rgba(251,191,36,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${etapaActual.svg}
            </div>
            <div style="min-width:0;">
              <div style="display:flex;align-items:center;font-size:0.8rem;font-weight:800;color:#ffe4e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${svgMiniGirasol}<span style="overflow:hidden;text-overflow:ellipsis;">${etapaActual.nombre}</span></div>
              <div style="font-size:0.69rem;color:#fda4af;opacity:0.9;">${etapaActual.sub}</div>
            </div>
          </div>
          <button type="button" id="btn-pareja-regar-jardin" ${regadoHoy ? "disabled" : ""} style="padding:6px 11px;border-radius:999px;border:1px solid ${regadoHoy ? "rgba(52,211,153,0.4)" : "rgba(56,189,248,0.5)"};background:${regadoHoy ? "rgba(6,78,59,0.45)" : "linear-gradient(135deg,rgba(14,165,233,0.32),rgba(236,72,153,0.32))"};color:${regadoHoy ? "#6ee7b7" : "#e0f2fe"};font-size:0.73rem;font-weight:800;cursor:${regadoHoy ? "default" : "pointer"};white-space:nowrap;flex-shrink:0;transition:transform 0.15s;display:inline-flex;align-items:center;">
            ${regadoHoy ? "✓ Regado hoy" : `${svgMiniGota}Regar (+30${svgMiniMoneda} · +25${svgMiniCorazon})`}
          </button>
        `;

        const btnRegar = $("btn-pareja-regar-jardin");
        if (btnRegar && !regadoHoy) {
          btnRegar.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            localStorage.setItem(`sa_jardin_regado_${uidJardin}`, hoyKey);
            try { window._Economia?.addCoins?.(30, "Regar el Jardín de Nuestro Amor"); } catch {}
            window._sumarAmorPareja(25, "Regaste el Jardín Solar de Nuestro Amor 🌻💧");
            try { window.ParejaSistema?.lluviaCorazones?.(14); } catch {}
            try {
              const totalAmor = Math.max(0, Number(localStorage.getItem(`sa_amor_pareja_${uidJardin}`)) || 0);
              window.dispatchEvent(new CustomEvent("sunad:amor-enviado", {
                detail: { delta: 25, total: totalAmor }
              }));
            } catch {}
            renderExperiencia();
          });
        }
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
    const rec = _obtenerRecompensaLogro(logro);
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
        <span class="logro-reward-pill" title="Recompensa al desbloquear">+${rec.monedas} 🪙 · +${rec.xp} XP</span>
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

  function _otorgarRecompensaLogro(logro) {
    try {
      const u = getUserIdSafe();
      const claimKey = `sa_logros_recompensados_${u}`;
      const reclamados = JSON.parse(localStorage.getItem(claimKey) || "{}");
      if (reclamados[logro.id]) return;

      const rec = _obtenerRecompensaLogro(logro);
      reclamados[logro.id] = true;
      localStorage.setItem(claimKey, JSON.stringify(reclamados));

      if (typeof window._getMonedas === "function" && typeof window._setMonedas === "function") {
        window._setMonedas(window._getMonedas() + rec.monedas);
      } else {
        const mKey = `monedas_${u}`;
        const actualM = Math.max(0, Number(localStorage.getItem(mKey)) || 0);
        localStorage.setItem(mKey, String(actualM + rec.monedas));
      }

      if (logro.tipo === "grupo") {
        const aKey = `sa_amor_pareja_${u}`;
        const actualA = Math.max(0, Number(localStorage.getItem(aKey)) || 0);
        localStorage.setItem(aKey, String(actualA + rec.xp));
      } else {
        const xKey = `sa_experiencia_extra_${u}`;
        const actualX = Math.max(0, Number(localStorage.getItem(xKey)) || 0);
        localStorage.setItem(xKey, String(actualX + rec.xp));
      }
    } catch (e) { console.warn("_otorgarRecompensaLogro:", e); }
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

      let totalPersonal = 0;
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
              progreso = ((totalPersonal + total) >= (LOGROS.length - 1)) ? 1 : 0;
            } else {
              progreso = Math.min(logro.medir(), logro.meta);
            }
            const desbloqueado = progreso >= logro.meta;
            if (desbloqueado) {
              if (!desbloqueados[logro.id]) {
                desbloqueados[logro.id] = true;
                cambio = true;
                _otorgarRecompensaLogro(logro);
                if (notificar) notificarLogro(logro);
              } else {
                // Asegurar recompensa retroactiva para logros ya desbloqueados
                _otorgarRecompensaLogro(logro);
              }
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
      totalPersonal = pintar(personales, logrosPersonalesGrid, `sunad_logros_${getUserIdSafe()}`, "personal");
      const totalGrupal = pintar(grupales, logrosGrupoGrid, `sunad_logros_grupo_${grupoActivo?.id || "local"}`, "grupo");

      // Actualizar conteos y barra global
      const totalDesbloqueados = totalPersonal + totalGrupal;
      const totalMeta = LOGROS.length;
      const pctGlobal = totalMeta > 0 ? Math.round((totalDesbloqueados / totalMeta) * 100) : 0;

      if (logrosDesbloqueados) logrosDesbloqueados.textContent = totalDesbloqueados;
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
