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
    { id:"mejor-amigo",     tipo:"grupo",    nombre:"Mejores amigos",    descripcion:"Ten una amistad de mascota al 100%",   meta:1,   medir:()=> mascotasAmistadMax() },
        /* --- Aventura RPG --- */
    { id:"rpg-primer-paso",   tipo:"personal", nombre:"Primer paso",       descripcion:"Derrota a tu primer enemigo",        meta:1,    medir:()=> rpgState().enemigosDerrotados },
    { id:"rpg-cazador",       tipo:"personal", nombre:"Cazador",           descripcion:"Derrota 50 enemigos",                meta:50,   medir:()=> rpgState().enemigosDerrotados },
    { id:"rpg-exterminador",  tipo:"personal", nombre:"Exterminador",      descripcion:"Derrota 250 enemigos",               meta:250,  medir:()=> rpgState().enemigosDerrotados },
    { id:"rpg-genocida",      tipo:"personal", nombre:"Genocida",          descripcion:"Derrota 1000 enemigos",              meta:1000, medir:()=> rpgState().enemigosDerrotados },
    { id:"rpg-nivel-10",      tipo:"personal", nombre:"Guerrero",          descripcion:"Alcanza nivel 10 en Aventura",        meta:10,   medir:()=> rpgState().nivel },
    { id:"rpg-nivel-25",      tipo:"personal", nombre:"Veterano",          descripcion:"Alcanza nivel 25 en Aventura",        meta:25,   medir:()=> rpgState().nivel },
    { id:"rpg-nivel-50",      tipo:"personal", nombre:"Leyenda viva",      descripcion:"Alcanza nivel 50 en Aventura",        meta:50,   medir:()=> rpgState().nivel },
    { id:"rpg-jefes-1",       tipo:"personal", nombre:"Matajefes",         descripcion:"Derrota a tu primer jefe",           meta:1,    medir:()=> (rpgState().jefesDerrotados||[]).length },
    { id:"rpg-jefes-todos",   tipo:"personal", nombre:"Cazador de jefes",  descripcion:"Derrota a 3 jefes",                  meta:3,    medir:()=> (rpgState().jefesDerrotados||[]).length },
    { id:"rpg-loot-10",       tipo:"personal", nombre:"Aventurero",        descripcion:"Consigue 10 objetos únicos",         meta:10,   medir:()=> lootStats().unicos },
    { id:"rpg-loot-40",       tipo:"personal", nombre:"Coleccionista",     descripcion:"Consigue 40 objetos únicos",         meta:40,   medir:()=> lootStats().unicos },
    { id:"rpg-loot-75",       tipo:"personal", nombre:"Maestro del botín", descripcion:"Consigue 75 objetos únicos",         meta:75,   medir:()=> lootStats().unicos },
    { id:"rpg-mitico",        tipo:"personal", nombre:"Mítico",            descripcion:"Consigue un objeto Mítico",          meta:1,    medir:()=> lootStats().miticos },
    { id:"rpg-cofres-10",     tipo:"personal", nombre:"Abrecofres",        descripcion:"Abre 10 cofres",                     meta:10,   medir:()=> lootStats().cofres },
    { id:"rpg-cofres-50",     tipo:"personal", nombre:"Traficante",        descripcion:"Abre 50 cofres",                     meta:50,   medir:()=> lootStats().cofres },
    { id:"rpg-bonus-100",     tipo:"personal", nombre:"Forjado",           descripcion:"Acumula +100 de bonus total",        meta:100,  medir:()=> lootStats().bonusTotal },
    /* --- Hordas RPG --- */
    { id:"rpg-horda-4",       tipo:"personal", nombre:"Cazador de Patrullas", descripcion:"Derrota a una horda de 4 o más enemigos",   meta:4,    medir:()=> rpgState().hordasTamanoMax || 0 },
    { id:"rpg-horda-8",       tipo:"personal", nombre:"Furia de la Horda",     descripcion:"Derrota a una horda de 8 o más enemigos",   meta:8,    medir:()=> rpgState().hordasTamanoMax || 0 },
    { id:"rpg-horda-12",      tipo:"personal", nombre:"Rompe-Enjambres",       descripcion:"Derrota a una horda de 12 enemigos",        meta:12,   medir:()=> rpgState().hordasTamanoMax || 0 },
    { id:"rpg-horda-jefe",    tipo:"personal", nombre:"Asedio Legendario",     descripcion:"Derrota a un Jefe de región en modo Horda", meta:1,    medir:()=> rpgState().jefesHordaDerrotados || 0 },
    /* 🐰 LOGRO ESPECIAL: Máxima bestia */
{
  id:"maxima-bestia",
  tipo:"personal",
  nombre:"Máxima bestia",
  descripcion:"Completa el juego con el conejo (derrota los 9 jefes)",
  meta:1,
  medir:()=> {
    try {
      const u = window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
      const st = JSON.parse(localStorage.getItem(`sa_rpg_${u}`) || "{}");
      const jefesDerrotados = st.jefesDerrotados || [];
      const mascota = localStorage.getItem("mascota_actual");
      // 9 jefes (uno por región)
      return (mascota === "conejo" && jefesDerrotados.length >= 9) ? 1 : 0;
    } catch { return 0; }
  }
},
{
  id:"maxima-bestia-todas",
  tipo:"personal",
  nombre:"Leyenda absoluta (conejil)",
  descripcion:"Completa el juego con TODAS las mascotas",
  meta:9,
  medir:()=> {
    try {
      const u = window._getUserIdSafe?.() || "local";
      const log = JSON.parse(localStorage.getItem(`sa_rpg_jefes_mascota_${u}`) || "{}");
      return Object.values(log).filter(arr => (arr||[]).length >= 9).length;
    } catch { return 0; }
  }
}
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
    function rpgState() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      return JSON.parse(localStorage.getItem(`sa_rpg_${u}`) || '{"nivel":1,"xp":0,"hp":100,"enemigosDerrotados":0,"jefesDerrotados":[],"statsBase":{"atk":10,"def":3}}');
    } catch { return { nivel:1, xp:0, hp:100, enemigosDerrotados:0, jefesDerrotados:[], statsBase:{atk:10,def:3} }; }
  }
  function lootStats() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      const loot = JSON.parse(localStorage.getItem(`sa_rpg_loot_${u}`) || "{}");
      const stats = JSON.parse(localStorage.getItem(`sa_rpg_stats_${u}`) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}');
      const unicos = Object.keys(loot).length;
      const total = Object.values(loot).reduce((a,b)=>a+b,0);
      const cofres = Number(localStorage.getItem(`sa_rpg_cofres_${u}`) || 0);
      // Míticos conseguidos (contamos cuántos IDs del pool tienen rar mitico)
      let miticos = 0;
      try {
        const pool = window.RpgLoot?.POOL || [];
        const mits = new Set(pool.filter(p => p.rar === "mitico").map(p => p.id));
        Object.keys(loot).forEach(id => { if (mits.has(id)) miticos++; });
      } catch {}
      const bonusTotal = (stats.atkBonus||0) + (stats.defBonus||0) + (stats.hpBonus||0);
      return { unicos, total, cofres, miticos, bonusTotal };
    } catch { return { unicos:0, total:0, cofres:0, miticos:0, bonusTotal:0 }; }
  }

})();