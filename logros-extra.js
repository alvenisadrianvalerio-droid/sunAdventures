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
    /* --- Post-Game RPG --- */
    { id:"rpg-falla-desbloqueada", tipo:"personal", nombre:"Más allá del Vacío", descripcion:"Desbloquea el Post-Game y abre la Falla Astral", meta:1, medir:()=> (window.RpgPostGame?.esDesbloqueado?.() ? 1 : 0) },
    { id:"rpg-caos-1",            tipo:"personal", nombre:"Cazador del Caos",    descripcion:"Derrota a tu primer Jefe del Caos en la Falla Astral", meta:1, medir:()=> ((window.RpgPostGame?.getState?.()?.jefesCaosDerrotados || []).length >= 1 ? 1 : 0) },
    { id:"rpg-caos-todos",        tipo:"personal", nombre:"Soberano Multiversal", descripcion:"Derrota a los 6 Jefes Ancestrales del Caos", meta:6, medir:()=> (window.RpgPostGame?.getState?.()?.jefesCaosDerrotados || []).length },
    { id:"rpg-falla-piso-10",     tipo:"personal", nombre:"Caminante Astral",   descripcion:"Alcanza el Piso 10 en la Falla Infinita", meta:10, medir:()=> (window.RpgPostGame?.getState?.()?.fallaMaxNivel || 1) },
    /* --- Modo Roguelike --- */
    { id:"rl-primer-run",         tipo:"personal", nombre:"Incursión Sombría",  descripcion:"Comienza tu primera expedición Roguelike", meta:1, medir:()=> roguelikeStats().runs },
    { id:"rl-piso-10",            tipo:"personal", nombre:"Abismo Profundo",     descripcion:"Alcanza el piso 10 en una partida Roguelike", meta:10, medir:()=> roguelikeStats().mejorPiso },
    { id:"rl-victoria",           tipo:"personal", nombre:"Conquistador del Destino", descripcion:"Completa con éxito una partida Roguelike", meta:1, medir:()=> roguelikeStats().victorias },
    { id:"rl-cazabosses",         tipo:"personal", nombre:"Azote de la Mazmorra", descripcion:"Derrota a 5 jefes en el modo Roguelike", meta:5, medir:()=> roguelikeStats().bossesDerrotados },
    /* 🐰 LOGRO ESPECIAL: Máxima bestia */
{
  id:"maxima-bestia",
  tipo:"personal",
  nombre:"Máxima bestia",
  descripcion:"Completa el juego con el conejo (derrota los 9 jefes)",
  meta:1,
  medir:()=> {
    try {
      const u = window._getUserIdSafe?.() || _getExtraLS("sunad_uid") || "local";
      const log = _getExtraJSON(`sa_rpg_jefes_mascota_${u}`, {});
      if ((log.conejo || []).length >= 9) return 1;
      const stConejo = _getExtraJSON(`sa_rpg_${u}_conejo`, {});
      if ((stConejo.jefesDerrotados || []).length >= 9) return 1;
      const st = _getExtraJSON(`sa_rpg_${u}`, {});
      const mascota = _getExtraLS("mascota_actual");
      return (mascota === "conejo" && (st.jefesDerrotados || []).length >= 9) ? 1 : 0;
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
      const log = _getExtraJSON(`sa_rpg_jefes_mascota_${u}`, {});
      return Object.values(log).filter(arr => (arr||[]).length >= 9).length;
    } catch { return 0; }
  }
}
  ];

  const _getExtraLS = (k) => {
    if (typeof window._sunadGetLogrosLS === "function") return window._sunadGetLogrosLS(k);
    try { return localStorage.getItem(k); } catch { return null; }
  };
  const _getExtraJSON = (k, fallback = null) => {
    if (typeof window._sunadGetLogrosJSON === "function") return window._sunadGetLogrosJSON(k, fallback);
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };

  function numLS(clave) {
    const u = window._getUserIdSafe?.() || _getExtraLS("sunad_uid") || "local";
    return Number(_getExtraLS(`sa_${clave}_${u}`) || 0);
  }
  function mascotasAmistadMax() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      const obj = _getExtraJSON(`mascota_amistad_${u}`, {});
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
  const LISTA_MASCOTAS = ["mapache","girasol","gatito","gatito-negro","hamburguesa","oveja","pollito","jirafa","unicornio","conejo","dragon-bebe","dragon-anciano"];

  function rpgState() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      const actualPet = _getExtraLS("mascota_actual") || "mapache";
      const keyPet = `sa_rpg_${u}_${actualPet}`;
      const stActual = _getExtraJSON(keyPet) || _getExtraJSON(`sa_rpg_${u}`) || {};

      // También agregamos estadísticas globales de todas las mascotas
      let enemigosDerrotadosTotal = 0;
      let maxNivel = Number(stActual.nivel || 1);
      const todosJefes = new Set(stActual.jefesDerrotados || []);
      let hordasTamanoMax = Number(stActual.hordasTamanoMax || 0);

      LISTA_MASCOTAS.forEach(m => {
        try {
          const data = _getExtraJSON(`sa_rpg_${u}_${m}`);
          if (data) {
            enemigosDerrotadosTotal += Number(data.enemigosDerrotados || 0);
            if (Number(data.nivel || 1) > maxNivel) maxNivel = Number(data.nivel);
            (data.jefesDerrotados || []).forEach(j => todosJefes.add(j));
            if (Number(data.hordasTamanoMax || 0) > hordasTamanoMax) hordasTamanoMax = Number(data.hordasTamanoMax);
          }
        } catch {}
      });

      // Incluir también los datos legacy si no estaban en las mascotas
      try {
        const dLeg = _getExtraJSON(`sa_rpg_${u}`);
        if (dLeg) {
          enemigosDerrotadosTotal = Math.max(enemigosDerrotadosTotal, Number(dLeg.enemigosDerrotados || 0));
          if (Number(dLeg.nivel || 1) > maxNivel) maxNivel = Number(dLeg.nivel);
          (dLeg.jefesDerrotados || []).forEach(j => todosJefes.add(j));
          if (Number(dLeg.hordasTamanoMax || 0) > hordasTamanoMax) hordasTamanoMax = Number(dLeg.hordasTamanoMax);
        }
      } catch {}

      return {
        ...stActual,
        nivel: maxNivel,
        enemigosDerrotados: Math.max(enemigosDerrotadosTotal, Number(stActual.enemigosDerrotados || 0)),
        jefesDerrotados: [...todosJefes],
        hordasTamanoMax: hordasTamanoMax
      };
    } catch {
      return { nivel:1, xp:0, hp:100, enemigosDerrotados:0, jefesDerrotados:[], hordasTamanoMax:0, statsBase:{atk:10,def:3} };
    }
  }

  function lootStats() {
    try {
      const u = window._getUserIdSafe?.() || "local";

      // Combinar loot de todas las mascotas y legacy
      const combinedLoot = {};
      let totalCofres = 0;
      let maxBonus = 0;

      const procesarLootYStats = (lootRaw, statsRaw, cofresRaw) => {
        try {
          if (lootRaw) {
            const l = typeof lootRaw === "string" ? JSON.parse(lootRaw) : lootRaw;
            Object.keys(l).forEach(id => { combinedLoot[id] = (combinedLoot[id] || 0) + Number(l[id] || 0); });
          }
          if (statsRaw) {
            const s = typeof statsRaw === "string" ? JSON.parse(statsRaw) : statsRaw;
            const b = (Number(s.atkBonus) || 0) + (Number(s.defBonus) || 0) + (Number(s.hpBonus) || 0);
            if (b > maxBonus) maxBonus = b;
          }
          if (cofresRaw) {
            totalCofres += Number(cofresRaw) || 0;
          }
        } catch {}
      };

      // Legacy
      procesarLootYStats(
        _getExtraJSON(`sa_rpg_loot_${u}`),
        _getExtraJSON(`sa_rpg_stats_${u}`),
        _getExtraLS(`sa_rpg_cofres_${u}`)
      );

      // Por mascota
      LISTA_MASCOTAS.forEach(m => {
        procesarLootYStats(
          _getExtraJSON(`sa_rpg_loot_${u}_${m}`),
          _getExtraJSON(`sa_rpg_stats_${u}_${m}`),
          _getExtraLS(`sa_rpg_cofres_${u}_${m}`)
        );
      });

      const unicos = Object.keys(combinedLoot).length;
      const total = Object.values(combinedLoot).reduce((a,b)=>a+b,0);

      // Míticos conseguidos
      let miticos = 0;
      try {
        const pool = window.RpgLoot?.POOL || [];
        const mits = new Set(pool.filter(p => p.rar === "mitico").map(p => p.id));
        Object.keys(combinedLoot).forEach(id => { if (mits.has(id)) miticos++; });
      } catch {}

      return { unicos, total, cofres: totalCofres, miticos, bonusTotal: maxBonus };
    } catch { return { unicos:0, total:0, cofres:0, miticos:0, bonusTotal:0 }; }
  }

  function roguelikeStats() {
    try {
      const u = window._getUserIdSafe?.() || "local";
      let totalRuns = 0;
      let maxPiso = 0;
      let totalVictorias = 0;
      let totalBosses = 0;

      const procesarMeta = (d) => {
        if (!d) return;
        try {
          totalRuns += Number(d.runs || 0);
          if (Number(d.mejorPiso || 0) > maxPiso) maxPiso = Number(d.mejorPiso || 0);
          totalVictorias += Number(d.victorias || 0);
          bossesDerrotadosTotal = Number(d.bossesDerrotados || 0);
          totalBosses += bossesDerrotadosTotal;
        } catch {}
      };

      // Legacy
      procesarMeta(_getExtraJSON(`sa_rl_meta_${u}`));

      // Por mascota
      LISTA_MASCOTAS.forEach(m => {
        procesarMeta(_getExtraJSON(`sa_rl_meta_${u}_${m}`));
      });

      return {
        runs: totalRuns,
        mejorPiso: maxPiso,
        victorias: totalVictorias,
        bossesDerrotados: totalBosses
      };
    } catch {
      return { runs: 0, mejorPiso: 0, victorias: 0, bossesDerrotados: 0 };
    }
  }

})();