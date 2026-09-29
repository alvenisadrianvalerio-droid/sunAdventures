/* ============================================================
   LOGROS-EXTRA.JS — Logros adicionales
   Se inyectan al array global si existe; si no, se guardan aparte.
   ============================================================ */
(function () {
  const extras = [
    /* --- Personal / uso --- */
    { id:"primer-chat",     tipo:"personal", nombre:"Primera palabra",   descripcion:"Envía tu primer mensaje en el chat",    meta:1,   medir:()=> numLS("chat_msgs") },
    { id:"conversador",     tipo:"personal", nombre:"Conversador",       descripcion:"Envía 100 mensajes en el chat",         meta:100, medir:()=> numLS("chat_msgs") },
    { id:"chat-1000",       tipo:"personal", nombre:"Imparable",         descripcion:"Envía 1000 mensajes en el chat",        meta:1000,medir:()=> numLS("chat_msgs") },

    { id:"primer-juego",    tipo:"personal", nombre:"Primer juego",      descripcion:"Juega tu primer minijuego",             meta:1,   medir:()=> numLS("minijuegos_jugados") },
    { id:"jugador",         tipo:"personal", nombre:"Jugador",           descripcion:"Juega 25 minijuegos",                   meta:25,  medir:()=> numLS("minijuegos_jugados") },
    { id:"vicio",           tipo:"personal", nombre:"Vicio sano",        descripcion:"Juega 100 minijuegos",                  meta:100, medir:()=> numLS("minijuegos_jugados") },
    { id:"ganador",         tipo:"personal", nombre:"Ganador",           descripcion:"Gana 10 minijuegos",                    meta:10,  medir:()=> numLS("minijuegos_ganados") },
    { id:"invicto",         tipo:"personal", nombre:"Invicto",           descripcion:"Gana 50 minijuegos",                    meta:50,  medir:()=> numLS("minijuegos_ganados") },

    { id:"primera-compra",  tipo:"personal", nombre:"Primera compra",    descripcion:"Compra algo en la tienda",              meta:1,   medir:()=> numLS("tienda_compras") },
    { id:"comprador",       tipo:"personal", nombre:"Comprador",         descripcion:"Compra 15 objetos en la tienda",        meta:15,  medir:()=> numLS("tienda_compras") },
    { id:"coleccionista",   tipo:"personal", nombre:"Coleccionista",     descripcion:"Compra 50 objetos en la tienda",        meta:50,  medir:()=> numLS("tienda_compras") },

    { id:"ahorrador",       tipo:"personal", nombre:"Ahorrador",         descripcion:"Acumula 500 SunCoins",                  meta:500, medir:()=> numLS("monedas_max") },
    { id:"rico",            tipo:"personal", nombre:"Rico",              descripcion:"Acumula 2000 SunCoins",                 meta:2000,medir:()=> numLS("monedas_max") },

    { id:"nivel-3",         tipo:"personal", nombre:"Nivel 3",           descripcion:"Alcanza el nivel 3",                    meta:1,   medir:()=> (window._nivelActual||1)>=3?1:0 },
    { id:"nivel-5",         tipo:"personal", nombre:"Leyenda viva",      descripcion:"Alcanza el nivel 5",                    meta:1,   medir:()=> (window._nivelActual||1)>=5?1:0 },

    { id:"cuidado-7",       tipo:"personal", nombre:"Cuidador",          descripcion:"Completa el cuidado diario 7 días",     meta:7,   medir:()=> numLS("cuidado_racha") },
    { id:"cuidado-30",      tipo:"personal", nombre:"Padre ejemplar",    descripcion:"Completa el cuidado diario 30 días",    meta:30,  medir:()=> numLS("cuidado_racha") },

    /* --- Grupo --- */
    { id:"primer-playlist", tipo:"grupo",    nombre:"Primera lista",     descripcion:"Crea tu primera playlist",              meta:1,   medir:()=> (window._playlists?.length||0) },
    { id:"dj-pro",          tipo:"grupo",    nombre:"DJ profesional",    descripcion:"Crea 10 playlists",                     meta:10,  medir:()=> (window._playlists?.length||0) },
    { id:"coleccion-musical",tipo:"grupo",   nombre:"Colección musical", descripcion:"Añade 100 canciones en total",          meta:100, medir:()=> (window._playlists||[]).reduce((t,p)=>t+(p.canciones?.length||0),0) },
    { id:"primer-evento",   tipo:"grupo",    nombre:"Primera fecha",     descripcion:"Añade un evento al calendario",         meta:1,   medir:()=> (window._eventos?.length||0) },
    { id:"planificador",    tipo:"grupo",    nombre:"Planificador",      descripcion:"Añade 10 eventos al calendario",        meta:10,  medir:()=> (window._eventos?.length||0) },
    { id:"exploradores",    tipo:"grupo",    nombre:"Exploradores",      descripcion:"Visita 25 ubicaciones distintas",       meta:25,  medir:()=> (window._fotos||[]).filter(f=>f.lat!=null&&f.lng!=null).length },
    { id:"viajeros",        tipo:"grupo",    nombre:"Trotamundos pro",   descripcion:"Visita 100 ubicaciones distintas",      meta:100, medir:()=> (window._fotos||[]).filter(f=>f.lat!=null&&f.lng!=null).length },
    { id:"mejor-amigo",     tipo:"grupo",    nombre:"Mejores amigos",    descripcion:"Ten una amistad de mascota al 100%",   meta:1,   medir:()=> mascotasAmistadMax() }
  ];

  function numLS(clave) {
    const u = window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
    return Number(localStorage.getItem(`sa_${clave}_${u}`) || 0);
  }
  function mascotasAmistadMax() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      const obj = JSON.parse(localStorage.getItem(`mascota_amistad_${u}`) || "{}");
      return Object.values(obj).some(v => v >= 100) ? 1 : 0;
    } catch { return 0; }
  }

  /* Inyectar en el array global si album.js ya lo expuso */
  function inyectar() {
    if (window.LOGROS && Array.isArray(window.LOGROS)) {
      const ids = new Set(window.LOGROS.map(l => l.id));
      extras.forEach(l => { if (!ids.has(l.id)) window.LOGROS.push(l); });
      if (typeof window.renderLogros === "function") window.renderLogros();
      return true;
    }
    return false;
  }
  if (!inyectar()) {
    let tries = 0;
    const t = setInterval(() => {
      if (inyectar() || ++tries > 20) clearInterval(t);
    }, 300);
  }
})();