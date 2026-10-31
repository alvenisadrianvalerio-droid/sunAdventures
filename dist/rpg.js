/* ============================================================
   RPG.JS v12 — Balance + Loadout + Pasivas
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("rpg")) window._extraVistas.push("rpg");

(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n = 0; const it = () => { if (window._TiendaAPI) return boot(); if (++n > 50) return; setTimeout(it, 100); }; return setTimeout(it, 100); }
  const { ICONO, COMIDAS, getMonedas, setMonedas, cargarInv, notifMascota, getUserId } = API;
  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (n, a = 0, b = 1e9) => Math.max(a, Math.min(b, n));
  const SND = t => { try { window._snd?.(t); } catch { } };
  const MASCOTAS = window._MASCOTAS || {};
  const FX = det => window.dispatchEvent(new CustomEvent("rpg:fx", { detail: det }));
  const FX_KEY = id => (window.RpgCanvas?.HABILIDAD_FX?.[id]) || "slash";

  const SVG_POTION = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;display:inline-block;vertical-align:-3px;margin-right:5px;"><path d="M9 2h6M10 2v3.5a2 2 0 0 1-.5 1.4L5.2 12.3A5 5 0 0 0 4 15.6V18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2.4a5 5 0 0 0-1.2-3.3l-4.3-5.4a2 2 0 0 1-.5-1.4V2"/><path d="M6 14h12" opacity="0.6"/></svg>';
  const SVG_SPARKLES = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;display:inline-block;vertical-align:-3px;margin-right:5px;"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/><path d="M19 2l1.2 3.3L23.5 6.5l-3.3 1.2L19 11l-1.2-3.3L14.5 6.5l3.3-1.2L19 2z" opacity="0.75"/></svg>';
  const SVG_RUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;display:inline-block;vertical-align:-3px;margin-right:5px;"><circle cx="14" cy="4" r="2"/><path d="m9 20 3-6-3-3 4-2 3 3h4"/><path d="m6 16 3-3"/><path d="M14 14l2 6"/></svg>';
  const SVG_SWORD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rpg-stat-svg" style="width:13px;height:13px;display:inline-block;vertical-align:-2px;margin-right:3px;color:#ff9a3d;"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>';
  const SVG_SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rpg-stat-svg" style="width:13px;height:13px;display:inline-block;vertical-align:-2px;margin-right:3px;color:#6cb8ff;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  const SVG_ZAP = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" class="rpg-stat-svg" style="width:13px;height:13px;display:inline-block;vertical-align:-2px;margin-right:3px;color:#ffd93d;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  const SVG_WIND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" class="rpg-stat-svg" style="width:13px;height:13px;display:inline-block;vertical-align:-2px;margin-right:3px;color:#a8ff78;"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>';

  const D = window.RpgData || {};
  const DIR_48 = D.DIR_48 || 'img/48x48/';
  const SPR_ENEMIGO = D.SPR_ENEMIGO || {};
  const SPR_REGION = D.SPR_REGION || {};
  const SPRITE_METADATA_48 = D.SPRITE_METADATA_48 || {};
  const renderMobAnimado = D.renderMobAnimado || (() => "");
  const spriteHtml = D.spriteHtml || (() => "");

  const REGIONES = [
    {
      id: "praderas", nombre: "Praderas Verdes", icono: ICONO.girasol,
      base: ["slime-bebe-verde", "rata-de-cloaca", "hongo-espora", "murcielago-comun"],
      elite: ["slime-verde", "rata-rabiosa", "hongo-venenoso"],
      jefe: "reina-arana", jefeNombre: "La Reina Araña", jefeIcono: ICONO.girasol
    },
    {
      id: "bosque", nombre: "Bosque Espeso", icono: ICONO.bosque,
      base: ["slime-bebe-azul", "hongo-alucinogeno", "serpiente-cascabel", "murcielago-vampiro"],
      elite: ["slime-azul", "hongo-anciano", "orco-guerrero"],
      jefe: "sapo-gigante-rey", jefeNombre: "Rey Sapo del Bosque", jefeIcono: ICONO.bosque
    },
    {
      id: "cueva", nombre: "Cavernas de Cristal", icono: ICONO.gema,
      base: ["murcielago-comun", "rata-rabiosa", "vagoneta-poseida", "orbinauta-azul"],
      elite: ["orbinauta-electrico", "orco-guerrero", "murcielago-abismal"],
      jefe: "golem-colosal", jefeNombre: "El Golem Colosal", jefeIcono: ICONO.gema
    },
    {
      id: "desierto", nombre: "Desierto Ardiente", icono: ICONO.fuego,
      base: ["serpiente-cascabel", "serpiente-coral", "esqueleto-soldado", "orbinauta-fuego"],
      elite: ["serpiente-esmeralda", "esqueleto-arquero", "slime-rojo"],
      jefe: "escorpion-emperador", jefeNombre: "El Emperador Escorpión", jefeIcono: ICONO.corona
    },
    {
      id: "glaciar", nombre: "Glaciar Helado", icono: ICONO.copo,
      base: ["slime-bebe-azul", "orbinauta-azul", "espectro-errante", "murcielago-abismal"],
      elite: ["orbinauta-electrico", "fantasma-vengativo", "slime-azul"],
      jefe: "lobo-alfa-ancestral", jefeNombre: "El Lobo Alfa Ancestral", jefeIcono: ICONO.corona
    },
    {
      id: "volcan", nombre: "Cráter Volcánico", icono: ICONO.fuego,
      base: ["slime-bebe-rojo", "slime-rojo", "orbinauta-fuego", "esqueleto-arquero"],
      elite: ["espada-viviente", "orco-guerrero", "zombi-voraz"],
      jefe: "dragon-supremo", jefeNombre: "El Dragón Supremo", jefeIcono: ICONO.fuego
    },
    {
      id: "ruinas", nombre: "Ruinas Malditas", icono: ICONO.castillo,
      base: ["esqueleto-soldado", "esqueleto-arquero", "esqueleto-armadurado", "zombi-podrido"],
      elite: ["zombi-infectado", "espada-viviente", "fantasma-vengativo"],
      jefe: "archimago-oscuro", jefeNombre: "El Archimago Oscuro", jefeIcono: ICONO.corona
    },
    {
      id: "sombras", nombre: "Catacumbas de Sombras", icono: ICONO.luna,
      base: ["murcielago-abismal", "rata-plagada", "espectro-errante", "fantasma-vengativo"],
      elite: ["alma-en-pena", "orbinauta-vacio", "zombi-voraz"],
      jefe: "lord-vampiro", jefeNombre: "El Lord Vampiro", jefeIcono: ICONO.luna
    },
    {
      id: "abismo", nombre: "Abismo Profundo", icono: ICONO.corona,
      base: ["orbinauta-vacio", "alma-en-pena", "esqueleto-armadurado", "espada-viviente"],
      elite: ["orco-guerrero", "serpiente-esmeralda", "rata-plagada"],
      jefe: "demonio-ancestral", jefeNombre: "El Demonio Ancestral", jefeIcono: ICONO.corona
    },
    {
      id: "selva", nombre: "Selva Primitiva", icono: ICONO.bosque,
      base: ["serpiente-esmeralda", "serpiente-coral", "hongo-venenoso", "slime-verde"],
      elite: ["orco-guerrero", "hongo-anciano", "orbinauta-electrico"],
      jefe: "rey-bestia-leon", jefeNombre: "El Rey Bestia León", jefeIcono: ICONO.bosque
    },
    {
      id: "pantano", nombre: "Pantano Putrefacto", icono: ICONO.gota,
      base: ["zombi-podrido", "zombi-infectado", "rata-plagada", "slime-bebe-verde"],
      elite: ["zombi-voraz", "hongo-anciano", "esqueleto-armadurado"],
      jefe: "patriarca-zombi", jefeNombre: "El Patriarca Zombi", jefeIcono: ICONO.gota
    },
    {
      id: "tundra", nombre: "Tundra Gélida", icono: ICONO.copo,
      base: ["slime-azul", "orbinauta-azul", "esqueleto-soldado", "espectro-errante"],
      elite: ["esqueleto-armadurado", "fantasma-vengativo", "orco-guerrero"],
      jefe: "troll-titánico", jefeNombre: "El Troll Titánico", jefeIcono: ICONO.copo
    },
    {
      id: "cielo", nombre: "Cielos Tempestad", icono: ICONO.estrella,
      base: ["murcielago-vampiro", "orbinauta-electrico", "espectro-errante", "alma-en-pena"],
      elite: ["fantasma-vengativo", "espada-viviente", "slime-dorado"],
      jefe: "senor-tengu", jefeNombre: "El Señor Tengu", jefeIcono: ICONO.estrella
    },
    {
      id: "inframundo", nombre: "Inframundo Ígneo", icono: ICONO.fuego,
      base: ["slime-bebe-rojo", "orbinauta-fuego", "esqueleto-armadurado", "serpiente-coral"],
      elite: ["zombi-voraz", "espada-viviente", "rata-plagada"],
      jefe: "gran-serpiente-antigua", jefeNombre: "La Gran Serpiente Antigua", jefeIcono: ICONO.fuego
    },
    {
      id: "vacio", nombre: "El Vacío Cósmico", icono: ICONO.corona,
      base: ["orbinauta-vacio", "alma-en-pena", "slime-dorado", "slime-bebe-dorado"],
      elite: ["espada-viviente", "orbinauta-electrico", "esqueleto-armadurado"],
      jefe: "kraken-abisal", jefeNombre: "El Kraken Abisal", jefeIcono: ICONO.corona
    }
  ];

  const BIOMAS = D.BIOMAS || {};
  REGIONES.forEach(r => r.bioma = BIOMAS[r.id]);

  const NOMBRES = D.NOMBRES || {};

  /* ---------- Zonas (BALANCE v13 - Progresión Proporcional) ---------- */
  const ZONAS = (() => {
    const z = [];
    REGIONES.forEach((reg, ri) => {
      for (let i = 1; i <= 10; i++) {
        const idx = ri * 10 + i, esJefe = i === 10, esMini = i === 5, esElite = i >= 6 && i <= 9;
        // Dificultad afinada: enemigos normales y jefes más desafiantes
        const hpBase = Math.round(115 + idx * 34);
        const atkBase = Math.round(17 + idx * 4.2);
        const hpJefe = esJefe ? Math.round(idx * 85 + 320) : 0;
        const atkJefe = esJefe ? Math.round(idx * 3.0 + 16) : 0;
        const hpMini = esMini ? Math.round(idx * 45 + 150) : 0;
        const atkMini = esMini ? Math.round(idx * 1.9 + 10) : 0;

        // 🔥 Escalado de stats reforzados a partir de nivel 50:
        // A partir de idx >= 50 los monstruos obtienen un multiplicador progresivo sustancial en vida y ataque
        let multHpNivel50 = 1;
        let multAtkNivel50 = 1;
        if (idx >= 50) {
          // Nivel 50 a 74: +25% base + 1.2% por nivel sobre 50
          // Nivel 75 a 99: +55% base + 2.0% por nivel sobre 75
          // Nivel 100 a 150 (End-game): vida y ataque masivos para combate épico
          if (idx >= 100) {
            multHpNivel50 = 1.9 + (idx - 99) * 0.04;    // +4% por nivel desde 100 (+190% en 100, +270% en 120, +394% en 150)
            multAtkNivel50 = 1.45 + (idx - 99) * 0.018; // +1.8% ataque por nivel desde 100
          } else if (idx >= 75) {
            multHpNivel50 = 1.45 + (idx - 74) * 0.018;  // +45% a +88% vida
            multAtkNivel50 = 1.25 + (idx - 74) * 0.008; // +25% a +44% ataque
          } else {
            multHpNivel50 = 1.20 + (idx - 49) * 0.01;   // +20% a +44% vida
            multAtkNivel50 = 1.12 + (idx - 49) * 0.005; // +12% a +24% ataque
          }
        }

        z.push({
          id: `${reg.id}-${i}`,
          nombre: esJefe ? reg.jefeNombre : `${reg.nombre} · ${i}`,
          desc: esJefe ? "⚔️ JEFE DE REGIÓN" : esMini ? "★ Mini-jefe" : reg.nombre,
          icono: esJefe ? reg.jefeIcono : reg.icono, nivel: idx,
          enemigos: esJefe ? [reg.jefe] : esMini ? [...reg.elite.slice(0, 2), reg.base[0]] : esElite ? reg.elite : reg.base,
          hp: Math.round((hpBase + hpJefe + hpMini) * multHpNivel50),
          atk: Math.round((atkBase + atkJefe + atkMini) * multAtkNivel50),
          shieldBase: idx >= 50 ? Math.round((idx - 49) * (esJefe ? 25 : esMini ? 12 : 5)) : 0,
          xp: Math.round((25 + idx * 18 + (esJefe ? idx * 36 : esMini ? idx * 18 : 0)) * (idx >= 100 ? 1.25 : 1)),
          monedas: Math.round((8 + idx * 2.8 + (esJefe ? 45 + idx * 1.5 : esMini ? 18 + idx * 0.8 : 0)) * (idx >= 100 ? 1.15 : 1)),
          jefe: esJefe, miniJefe: esMini, region: reg.id, regionNombre: reg.nombre, orden: idx
        });
      }
    });
    return z;
  })();

  const GRUPOS = REGIONES.map((reg, i) => ({
    id: i, nombre: reg.nombre, icono: reg.icono, sprite: SPR_REGION[reg.id] || reg.sprite,
    jefe: reg.jefeNombre, jefeIcono: reg.jefeIcono, bioma: reg.bioma,
    zonas: ZONAS.filter(z => Math.floor((z.orden - 1) / 10) === i),
    nivelMin: i * 10 + 1, nivelMax: (i + 1) * 10
  }));

  const resolveUid = () => window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || localStorage.getItem("sunadventures_uid") || (typeof getUserId === "function" ? getUserId() : "local");
  const getMascotaActualId = () => {
    try { return localStorage.getItem("mascota_actual") || "mapache"; } catch { return "mapache"; }
  };
  const KEY = () => `sa_rpg_${resolveUid()}_${getMascotaActualId()}`;
  const def = () => ({ nivel: 1, xp: 0, hp: 120, enemigosDerrotados: 0, jefesDerrotados: [], zonasConquistadas: [], zonaActual: null, statsBase: { atk: 14, def: 5 } });

  const getUserCandidates = () => {
    const list = [];
    const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || (typeof getUserId === "function" ? getUserId() : null);
    if (uid && uid !== "local") list.push(uid);

    const legacyUid = localStorage.getItem("sunadventures_uid");
    if (legacyUid && !list.includes(legacyUid)) list.push(legacyUid);

    const username = localStorage.getItem("sunad_username") || localStorage.getItem("sunadventures_username");
    if (username && !list.includes(username)) list.push(username);

    const email = window._sunUserEmail || "";
    if (email) {
      const emailPrefix = email.split("@")[0];
      if (emailPrefix && !list.includes(emailPrefix)) list.push(emailPrefix);
    }

    // Candidato local (siempre al final para no sobrescribir antes de tiempo)
    if (!list.includes("local")) list.push("local");
    return list;
  };

  // Recupera datos existentes buscando en la clave de la mascota actual y haciendo fallback si está vacío
  const cargar = () => {
    try {
      const u = resolveUid();
      const m = getMascotaActualId();
      const kPrincipal = `sa_rpg_${u}_${m}`;
      const userCand = getUserCandidates();
      const candidatas = [kPrincipal];
      userCand.forEach(c => {
        const k = `sa_rpg_${c}_${m}`;
        if (!candidatas.includes(k)) candidatas.push(k);
      });
      // Fallback para mapache si venía de la clave global histórica
      if (m === "mapache") {
        if (!candidatas.includes(`sa_rpg_${u}`)) candidatas.push(`sa_rpg_${u}`);
        userCand.forEach(c => {
          const k = `sa_rpg_${c}`;
          if (!candidatas.includes(k)) candidatas.push(k);
        });
      }

      // Buscar si alguna de las claves candidatas legítimas tiene datos reales
      let encontrado = null;
      let claveGanadora = null;

      for (const k of candidatas) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
              const tieneProgreso = (parsed.nivel && parsed.nivel > 1) ||
                (parsed.xp && parsed.xp > 0) ||
                (parsed.zonasConquistadas && parsed.zonasConquistadas.length > 0) ||
                (parsed.enemigosDerrotados && parsed.enemigosDerrotados > 0);
              if (tieneProgreso) {
                encontrado = parsed;
                claveGanadora = k;
                break;
              } else if (!encontrado) {
                encontrado = parsed;
                claveGanadora = k;
              }
            }
          } catch { }
        }
      }

      if (encontrado) {
        const merged = { ...def(), ...encontrado };
        if (!Array.isArray(merged.zonasConquistadas)) merged.zonasConquistadas = [];
        if (!Array.isArray(merged.jefesDerrotados)) merged.jefesDerrotados = [];
        if (typeof merged.nivel !== "number" || isNaN(merged.nivel) || merged.nivel < 1) merged.nivel = 1;
        if (typeof merged.xp !== "number" || isNaN(merged.xp) || merged.xp < 0) merged.xp = 0;
        if (typeof merged.enemigosDerrotados !== "number" || isNaN(merged.enemigosDerrotados) || merged.enemigosDerrotados < 0) merged.enemigosDerrotados = 0;
        if (!merged.statsBase || typeof merged.statsBase !== "object") merged.statsBase = { atk: 14, def: 5 };
        // Migrar a la clave del usuario autenticado de la mascota actual si provenía de un fallback
        if (claveGanadora && claveGanadora !== kPrincipal && u !== "local") {
          try { localStorage.setItem(kPrincipal, JSON.stringify(merged)); } catch { }
        }
        return merged;
      }
      return def();
    } catch {
      return def();
    }
  };

  const guardar = s => {
    try {
      localStorage.setItem(KEY(), JSON.stringify(s));
    } catch { }
  };

  const STATS_DEF = { atkBonus: 0, defBonus: 0, hpBonus: 0, critBonus: 0, esqBonus: 0, velBonus: 0, lifestealBonus: 0, thornsBonus: 0, regenBonus: 0, xpBonus: 0, oroBonus: 0, suerteBonus: 0, fuegoBonus: 0, hieloBonus: 0, rayoBonus: 0, venenoBonus: 0 };
  const statsLoot = () => {
    try {
      const u = resolveUid();
      const m = getMascotaActualId();
      const k = `sa_rpg_stats_${u}_${m}`;
      let r = localStorage.getItem(k);
      if (!r && m === "mapache") {
        r = localStorage.getItem(`sa_rpg_stats_${u}`);
      }
      if (!r && u !== "local") {
        const userCand = getUserCandidates();
        for (const c of userCand) {
          const candVal = localStorage.getItem(`sa_rpg_stats_${c}_${m}`) || (m === "mapache" ? localStorage.getItem(`sa_rpg_stats_${c}`) : null);
          if (candVal) {
            r = candVal;
            try { localStorage.setItem(k, r); } catch { }
            break;
          }
        }
      }
      return r ? { ...STATS_DEF, ...JSON.parse(r) } : { ...STATS_DEF };
    } catch {
      return { ...STATS_DEF };
    }
  };
  const bonus = () => { try { return window._getBonusActivos?.() || []; } catch { return []; } };
  const bonusTipo = t => bonus().filter(x => x.tipo === t).reduce((s, x) => s + (x.val || 0), 0);
  const tieneBonus = t => bonus().some(x => x.tipo === t);

  let state = cargar();
  if (!Array.isArray(state.zonasConquistadas)) state.zonasConquistadas = [];
  if (!state.statsBase) state.statsBase = { atk: 14, def: 5 };

  // Desbloqueo estricto secuencial:
  // 1) En la primera región, la zona 1 siempre está abierta.
  // 2) Dentro de cualquier región, una zona requiere haber superado la zona inmediatamente anterior.
  // 3) Para acceder a una nueva región (su zona 1), requiere haber completado las 10 zonas de la región anterior.
  window._rpgZonaDesbloqueada = function (zid) {
    const z = ZONAS.find(x => x.id === zid);
    if (!z) return false;
    if (z.orden === 1) return true;
    const conq = state.zonasConquistadas || [];
    const numEnRegion = ((z.orden - 1) % 10) + 1;
    if (numEnRegion > 1) {
      const prev = ZONAS.find(x => x.orden === z.orden - 1);
      return prev ? conq.includes(prev.id) : false;
    } else {
      const ri = Math.floor((z.orden - 1) / 10);
      const grupoAnterior = GRUPOS[ri - 1];
      if (!grupoAnterior) return true;
      return grupoAnterior.zonas.every(pz => conq.includes(pz.id));
    }
  };

  const NIVEL_MAX = 50;
  const pgBonusAtk = () => ((window.RpgPostGame?.getState?.()?.bendiciones?.fuerzaAstral || 0) * 0.03);
  const pgBonusDef = () => ((window.RpgPostGame?.getState?.()?.bendiciones?.armaduraCosmica || 0) * 0.03);
  const pgBonusHp = () => ((window.RpgPostGame?.getState?.()?.bendiciones?.armaduraCosmica || 0) * 50);
  const pgBonusOro = () => ((window.RpgPostGame?.getState?.()?.bendiciones?.bendicionMonedas || 0) * 0.10);

  const hpMax = () => {
    const rawLootHp = Number(statsLoot().hpBonus || 0);
    // Suavizado del escalado desmedido por exceso de ítems (curva balanceada)
    const lootHpEffective = Math.round(rawLootHp > 300 ? 300 + (rawLootHp - 300) * 0.6 : rawLootHp * 0.85);
    return Math.round(100 + Math.min(state.nivel, NIVEL_MAX) * 35 + lootHpEffective + bonusTipo("hp_max") + pgBonusHp());
  };
  const atkTotal = () => {
    const rawLootAtk = Number(statsLoot().atkBonus || 0);
    const lootAtkEffective = Math.round(rawLootAtk > 150 ? 150 + (rawLootAtk - 150) * 0.55 : rawLootAtk * 0.75);
    return Math.round((state.statsBase.atk + Math.min(state.nivel, NIVEL_MAX) * 5.5 + lootAtkEffective + bonusTipo("atk_fijo")) * (1 + pgBonusAtk()));
  };
  const defTotal = () => {
    const rawLootDef = Number(statsLoot().defBonus || 0);
    const lootDefEffective = Math.round(rawLootDef > 100 ? 100 + (rawLootDef - 100) * 0.55 : rawLootDef * 0.75);
    return Math.round((state.statsBase.def + Math.min(state.nivel, NIVEL_MAX) * 3.5 + lootDefEffective + bonusTipo("def_fijo")) * (1 + pgBonusDef()));
  };
  const critTotal = () => 0.15 + ((statsLoot().critBonus || 0) / 100);
  const esqTotal = () => ((statsLoot().esqBonus || 0) / 100);
  const regenTotal = () => (statsLoot().regenBonus || 0);
  const lifestealTotal = () => ((statsLoot().lifestealBonus || 0) / 100);
  const thornsTotal = () => (statsLoot().thornsBonus || 0);
  const xpTotal = () => 1 + ((statsLoot().xpBonus || 0) / 100);
  const oroTotal = () => (1 + ((statsLoot().oroBonus || 0) / 100) + pgBonusOro());
  const xpParaSubir = () => state.nivel >= NIVEL_MAX ? Infinity : Math.round(state.nivel * 160 + Math.pow(state.nivel, 1.8) * 35);

  let enemigo = null, turnoJugador = true, overlayObjetos = false;
  let mobHordaObjetivoIdx = null;
  let buffsHeroe = [], buffsEnemigo = [];

  function inyectarSeccion() {
    if ($("rpg")) return;
    const sec = document.createElement("section");
    sec.id = "rpg"; sec.className = "rpg-section view"; sec.dataset.view = "rpg";
    sec.innerHTML = `<div class="rpg-header"><p class="rpg-subtitle">${REGIONES.length} regiones, ${REGIONES.length * 10} zonas</p></div><div id="rpg-content"></div>`;
    const f = qs(".site-footer");
    f ? f.parentNode.insertBefore(sec, f) : document.body.appendChild(sec);
  }
  function tieneSesion() {
    return true;
  }

  function inyectarNav() {
    const nav = qs(".nav-links"); if (!nav) return;
    let a = qs('[data-view-link="rpg"]');
    if (!a) {
      a = document.createElement("a");
      a.href = "#rpg"; a.className = "nav-link"; a.dataset.viewLink = "rpg";
      a.innerHTML = `<span class="ui-icon nav-link-icon" data-icono="espada"></span><span class="nav-link-text">Aventura</span>`;
      nav.appendChild(a);
    }
    a.style.display = tieneSesion() ? "" : "none";
  }

  window._rpgRender = () => { try { if (window._rpgRenderSeguro) window._rpgRenderSeguro(); else { activarVistaRpg(); render(); } } catch(e){} };
  function render() {
    inyectarNav(); inyectarSeccion();
    const c = $("rpg-content"); if (!c) return;
    if (enemigo) { c.classList.add("rpg-en-batalla"); renderBatalla(c); }
    else { c.classList.remove("rpg-en-batalla"); renderPantalla(c); }
  }

  function renderPantalla(c) {
    const tab = c.dataset.tabActiva || "zonas";
    c.innerHTML = `
      <div class="rpg-tabs" role="tablist">
        <button type="button" class="rpg-tab ${tab === "zonas" ? "active" : ""}" data-rpg-tab="zonas"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/pocion.png" alt=""></span><span class="rpg-tab-text">Zonas</span></button>
        <button type="button" class="rpg-tab ${tab === "mapa" ? "active" : ""}" data-rpg-tab="mapa"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/mapa.png" alt=""></span><span class="rpg-tab-text">Mapa</span></button>
        <button type="button" class="rpg-tab ${tab === "objetos" ? "active" : ""}" data-rpg-tab="objetos"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/hamburguesa.png" alt=""></span><span class="rpg-tab-text">Objetos</span></button>
        <button type="button" class="rpg-tab ${tab === "cofres" ? "active" : ""}" data-rpg-tab="cofres"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/rpg/items/cofre-madera.png?v=2" alt=""></span><span class="rpg-tab-text">Cofres</span></button>
        <button type="button" class="rpg-tab" data-rpg-tab="roguelike"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/dado.png" alt=""></span><span class="rpg-tab-text">Roguelike</span></button>
      </div>
      <div class="rpg-panel ${tab === "zonas" ? "active" : ""}" data-rpg-panel="zonas">${htmlMapa()}</div>
      <div class="rpg-panel ${tab === "mapa" ? "active" : ""}" data-rpg-panel="mapa" id="rpg-panel-mapa"></div>
      <div class="rpg-panel ${tab === "objetos" ? "active" : ""}" data-rpg-panel="objetos"></div>
      <div class="rpg-panel ${tab === "cofres" ? "active" : ""}" data-rpg-panel="cofres"></div>`;

    qsa(".rpg-tab", c).forEach(t => t.addEventListener("click", () => {
      const target = t.dataset.rpgTab;
      if (target === "roguelike") {
        qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
        qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", false));
        window.RpgRoguelike?.abrir?.();
        return;
      }
      window.RpgRoguelike?.cerrar?.();
      c.dataset.tabActiva = target;
      qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
      qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === target));
      window.dispatchEvent(new CustomEvent("sunad:rpg-tab", { detail: { tab: target } }));
    }));

    window.hidratarIconos?.(c);
    setTimeout(() => window.dispatchEvent(new CustomEvent("sunad:rpg-tab", { detail: { tab } })), 0);
  }

  function htmlMapa() {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const esNivelMax = state.nivel >= NIVEL_MAX;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const xpReq = xpParaSubir();
    const xpPct = esNivelMax ? 100 : clamp(state.xp / (isFinite(xpReq) ? xpReq : 1) * 100);
    const totalAtk = Math.round(atkTotal());
    const totalDef = Math.round(defTotal());
    const totalHpMax = Math.round(hpMax());
    const critPct = Math.round(critTotal() * 100);
    const esqPct = Math.round(esqTotal() * 100);

    return `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar rpg-hero-avatar-btn" data-rpg-accion="cambiar-mascota" title="Clic para cambiar de mascota" style="cursor:pointer;position:relative;">
          <img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">
          <span class="rpg-hero-avatar-cambiar-badge" title="Cambiar mascota" style="position:absolute;bottom:0px;right:0px;width:24px;height:24px;background:linear-gradient(135deg, #ffd93d 0%, #ff9f1a 100%);border:2px solid #1a1a24;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.6), 0 0 10px rgba(255,217,61,0.6);z-index:10;pointer-events:none;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#121217" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          </span>
        </div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">
            <span>${m.nombre}</span>
            <span class="rpg-hero-lvl">${esNivelMax ? `Nv ${NIVEL_MAX} (MÁX)` : `Nv ${state.nivel}`}</span>
            <button type="button" class="rpg-btn-cambiar-mascota" data-rpg-accion="cambiar-mascota" title="Cambiar de Mascota">
              <svg viewBox="0 0 24 24" class="rpg-btn-cambiar-icon" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Cambiar</span>
            </button>
            <div class="rpg-hero-stats-badges">
              <span class="rpg-stat-badge" title="Ataque">${SVG_SWORD}${totalAtk}</span>
              <span class="rpg-stat-badge" title="Defensa">${SVG_SHIELD}${totalDef}</span>
              ${critPct > 15 ? `<span class="rpg-stat-badge" title="Crítico">${SVG_ZAP}${critPct}%</span>` : ""}
              ${esqPct > 0 ? `<span class="rpg-stat-badge" title="Esquiva">${SVG_WIND}${esqPct}%</span>` : ""}
            </div>
          </div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${totalHpMax}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          <div class="rpg-barra-label"><span>XP</span><span>${esNivelMax ? 'NIVEL MÁXIMO' : `${state.xp} / ${xpReq}`}</span></div>
          <div class="rpg-barra xp"><span style="width:${xpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>
      <div class="rpg-grupos-grid">
        ${GRUPOS.map(g => {
      const completadas = g.zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
      const primeraZona = g.zonas[0];
      const desbloqueado = window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(primeraZona.id) : (state.nivel >= g.nivelMin - 2 || state.enemigosDerrotados >= g.nivelMin * 6);
      const sImg = g.sprite ? spriteHtml(g.sprite, "rpg-grupo-sprite-img", g.nombre) : "";
      return `<button type="button" class="rpg-grupo-card ${desbloqueado ? "" : "bloqueada"}" data-grupo="${g.id}" style="--bioma-img:url('${g.bioma.imagen}');--bioma-acento:${g.bioma.acento}" ${desbloqueado ? "" : "disabled"}>
            <span class="rpg-grupo-fondo" aria-hidden="true"></span>
            <div class="rpg-grupo-icono">${sImg || g.icono || ""}</div>
            <div class="rpg-grupo-nombre">${g.nombre}</div>
            <div class="rpg-grupo-ambiente">${g.bioma.ambiente}</div>
            <div class="rpg-grupo-rango">Nv ${g.nivelMin}–${g.nivelMax}</div>
            <div class="rpg-grupo-progreso"><span style="width:${(completadas / 10) * 100}%"></span></div>
            <div class="rpg-grupo-badge">${g.zonas.some(z => z.jefe && state.jefesDerrotados.includes(z.id)) ? "👑" : `${completadas}/10`}</div>
          </button>`;
    }).join("")}
      </div>
      <div style="display:flex;justify-content:center;margin:1rem 0;">
        <button type="button" class="rpg-btn huir" data-rpg-accion="descansar" style="max-width:300px;padding:.8rem 1.4rem;" ${state.hp >= hpMax() ? "disabled style='opacity:0.6;cursor:not-allowed;max-width:300px;padding:.8rem 1.4rem;'" : ""}>
          💤 Descansar <span id="rpg-rest-cost" style="margin-left:.4rem;opacity:.85;">${state.hp >= hpMax() ? "(Vida Completa)" : `(Gratis · +${Math.round(hpMax() - state.hp)} HP)`}</span>
        </button>
      </div>
      <div class="rpg-idle">
        <div class="rpg-idle-icono">${ICONO.espada || ""}</div>
        <div class="rpg-idle-titulo">Elige una región</div>
        <div class="rpg-idle-desc">Enemigos derrotados: ${state.enemigosDerrotados}</div>
      </div>`;
  }

  function getTamanoHorda() {
    const raw = Number(localStorage.getItem("sa_rpg_tamano_horda"));
    return [1, 4, 8, 12].includes(raw) ? raw : 4;
  }
  function setTamanoHorda(n) {
    const val = [1, 4, 8, 12].includes(Number(n)) ? Number(n) : 4;
    localStorage.setItem("sa_rpg_tamano_horda", String(val));
    return val;
  }

  function abrirPopupGrupo(grupo) {
    let m = $("rpg-popup-grupo"); if (m) m.remove();
    m = document.createElement("div");
    m.id = "rpg-popup-grupo"; m.className = "rpg-popup-grupo";
    const zonas = grupo.zonas;
    const conquistadas = zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
    const desbloqueada = z => window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : state.nivel >= z.nivel - 2 || state.enemigosDerrotados >= z.nivel * 6;
    const currentHorda = getTamanoHorda();
    m.innerHTML = `
      <div class="rpg-popup-panel" style="--bioma-img:url('${grupo.bioma.imagen}');--bioma-acento:${grupo.bioma.acento}">
        <button class="rpg-popup-close" aria-label="Cerrar">×</button>
        <header class="rpg-popup-hero">
          <img src="${grupo.bioma.imagen}" alt="${grupo.bioma.ambiente}" class="rpg-popup-bioma">
          <div class="rpg-popup-titulo">
            <small>EXPEDICIÓN · NV ${grupo.nivelMin}–${grupo.nivelMax}</small>
            <span>${grupo.nombre}</span>
            <strong>Jefe de región: ${grupo.jefe}</strong>
            <div class="rpg-popup-progreso"><span style="width:${conquistadas * 10}%"></span></div>
            <em>${conquistadas}/10 zonas conquistadas · Primera victoria: +50% XP y monedas</em>
          </div>
        </header>

        <!-- Selector de Tamaño de Horda / Dificultad -->
        <div class="rpg-popup-horda-box">
          <div class="rpg-popup-horda-label">
            <span>👥 Modo de Combate:</span>
            <small>Más enemigos = combate más difícil y mayor recompensa</small>
          </div>
          <div class="rpg-popup-horda-btns" id="rpg-horda-selector-btns">
            <button type="button" class="rpg-btn-horda-opt ${currentHorda === 1 ? 'active' : ''}" data-mobs="1">
              <span class="rpg-horda-opt-num">1</span>
              <span class="rpg-horda-opt-info"><strong>Solo</strong><small>Dificultad base</small></span>
            </button>
            <button type="button" class="rpg-btn-horda-opt ${currentHorda === 4 ? 'active' : ''}" data-mobs="4">
              <span class="rpg-horda-opt-num">4</span>
              <span class="rpg-horda-opt-info"><strong>Patrulla</strong><small>+35% Oro / +25% XP</small></span>
            </button>
            <button type="button" class="rpg-btn-horda-opt ${currentHorda === 8 ? 'active' : ''}" data-mobs="8">
              <span class="rpg-horda-opt-num">8</span>
              <span class="rpg-horda-opt-info"><strong>Horda</strong><small>+90% Oro / +60% XP</small></span>
            </button>
            <button type="button" class="rpg-btn-horda-opt ${currentHorda === 12 ? 'active' : ''}" data-mobs="12">
              <span class="rpg-horda-opt-num">12</span>
              <span class="rpg-horda-opt-info"><strong>Enjambre</strong><small>+160% Oro / +110% XP</small></span>
            </button>
          </div>
        </div>

        <div class="rpg-popup-zonas" aria-label="Zonas de la región">
          ${zonas.map((z, i) => {
      const open = desbloqueada(z);
      const conquistada = state.zonasConquistadas.includes(z.id);
      const tipo = z.jefe ? "Jefe de región" : z.miniJefe ? "Mini-jefe" : z.nivel % 10 >= 6 ? "Encuentro élite" : "Encuentro";
      const cls = ["rpg-popup-dot", "rpg-popup-zone", z.jefe ? "jefe" : z.miniJefe ? "minijefe" : "", !open ? "bloqueada" : "", conquistada ? "conquistada" : ""].filter(Boolean).join(" ");
      const zSprite = z.jefe ? SPR_ENEMIGO[z.enemigos?.[0]] : z.miniJefe ? SPR_ENEMIGO[z.enemigos?.[0]] : SPR_ENEMIGO[z.enemigos?.[0]] || (open ? "espada" : null);
      const zSpriteHtml = zSprite ? spriteHtml(zSprite, "rpg-zone-sprite-thumb", z.nombre) : "";
      return `<button type="button" class="${cls}" data-zona="${z.id}" ${open ? "" : "disabled"}>
              <span class="rpg-popup-zone-number">${zSpriteHtml || String(i + 1).padStart(2, "0")}</span>
              <span class="rpg-popup-zone-copy">
                <span class="rpg-popup-zone-meta"><strong>NIVEL ${z.nivel}</strong><i>${conquistada ? "✓ CONQUISTADA" : tipo}</i></span>
                <span class="rpg-popup-zone-name">${z.nombre}</span>
                <small>${!open ? "Sigue avanzando para desbloquearla" : conquistada ? "Vuelve a explorar o sigue al próximo desafío" : "Primera victoria: recompensa extra"}</small>
              </span>
              <span class="rpg-popup-zone-arrow">${!open ? "🔒" : conquistada ? "★" : "›"}</span>
            </button>`;
    }).join("")}
        </div>
      </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add("active"));
  }

  function getMascotasDisponibles() {
    const API = window._TiendaAPI;
    const ids = Object.keys(MASCOTAS);
    return ids.filter(id => {
      if (API?.desbloqueada) return API.desbloqueada(id);
      if (id === "mapache" || id === "gatito-negro") return true;
      try {
        const u = resolveUid();
        const comp = JSON.parse(localStorage.getItem(`sa_mascotas_compradas_${u}`) || "[]");
        return comp.includes(id);
      } catch { return false; }
    });
  }

  function abrirPopupMascotas(modo = "aventura") {
    let p = $("rpg-popup-mascotas"); if (p) p.remove();
    p = document.createElement("div");
    p.id = "rpg-popup-mascotas";
    p.className = "rpg-popup-grupo";

    const disponibles = getMascotasDisponibles();
    const actualId = getMascotaActualId();
    const u = resolveUid();

    p.innerHTML = `
      <div class="rpg-popup-panel rpg-popup-mascotas-panel">
        <button class="rpg-popup-close" aria-label="Cerrar">×</button>
        <header class="rpg-popup-mascotas-header">
          <div class="rpg-popup-mascotas-header-badge">
            <span class="rpg-header-sparkle">✦</span>
            <span>${modo === "roguelike" ? "MODO ROGUELIKE" : "MODO AVENTURA"}</span>
          </div>
          <h2 class="rpg-popup-mascotas-title">Elige tu Mascota</h2>
          <p class="rpg-popup-mascotas-desc">Cada compañero cuenta con su propio progreso, nivel independiente y estilo único en combate.</p>
        </header>
        <div class="rpg-popup-mascotas-grid">
          ${disponibles.map(id => {
            const data = MASCOTAS[id] || {};
            const esActiva = id === actualId;
            let nivelTxt = "Nv 1";
            let nivelNum = 1;
            if (modo === "aventura") {
              try {
                const sRaw = localStorage.getItem(`sa_rpg_${u}_${id}`) || (id === "mapache" ? localStorage.getItem(`sa_rpg_${u}`) : null);
                if (sRaw) {
                  const sObj = JSON.parse(sRaw);
                  if (sObj?.nivel) {
                    nivelNum = sObj.nivel;
                    nivelTxt = `Nv ${sObj.nivel}`;
                  }
                }
              } catch {}
            } else {
              try {
                const mRaw = localStorage.getItem(`sa_rl_meta_${u}_${id}`) || (id === "mapache" ? localStorage.getItem(`sa_rl_meta_${u}`) : null);
                if (mRaw) {
                  const mObj = JSON.parse(mRaw);
                  nivelTxt = `Piso ${mObj?.mejorPiso || 1}`;
                }
              } catch {}
            }
            return `
              <button type="button" class="rpg-popup-mascota-card pet-theme-${id} ${esActiva ? "activa" : ""}" data-mascota-sel="${id}">
                ${esActiva ? `<div class="rpg-popup-mascota-activa-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>` : ""}
                <div class="rpg-popup-mascota-img-wrap">
                  <div class="rpg-popup-mascota-aura"></div>
                  <img src="${data.imagen || 'img/girasol-loading.png'}" alt="${data.nombre}" onerror="this.onerror=null;this.src='img/girasol-loading.png'">
                </div>
                <div class="rpg-popup-mascota-info">
                  <strong class="rpg-popup-mascota-nombre">${data.nombre || id}</strong>
                  <span class="rpg-popup-mascota-level-pill ${esActiva ? 'pill-activa' : ''}">${nivelTxt}</span>
                </div>
                <div class="rpg-popup-mascota-footer">
                  ${esActiva 
                    ? `<span class="rpg-popup-mascota-status-tag"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg> En equipo</span>` 
                    : `<span class="rpg-popup-mascota-btn-action">Seleccionar</span>`}
                </div>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(p);
    requestAnimationFrame(() => p.classList.add("active"));
  }
  window._rpgAbrirPopupMascotas = abrirPopupMascotas;

  function cerrarPopupMascotas() {
    const popupMascotas = $("rpg-popup-mascotas");
    if (popupMascotas) {
      popupMascotas.classList.remove("active");
      setTimeout(() => popupMascotas.remove(), 250);
    }
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  document.addEventListener("click", e => {
    const btnCambiarMascota = e.target.closest('[data-rpg-accion="cambiar-mascota"]');
    if (btnCambiarMascota) {
      e.preventDefault(); e.stopPropagation();
      abrirPopupMascotas("aventura");
      return;
    }
    const cardMascotaSel = e.target.closest("[data-mascota-sel]");
    if (cardMascotaSel) {
      e.preventDefault(); e.stopPropagation();
      const nuevoId = cardMascotaSel.dataset.mascotaSel;
      if (nuevoId) {
        localStorage.setItem("mascota_actual", nuevoId);
        SND("blip");
        cerrarPopupMascotas();
        window.dispatchEvent(new Event("sunad:mascota-cambiada"));
      }
      return;
    }
    const popupMascotas = e.target.closest("#rpg-popup-mascotas");
    if (popupMascotas && (e.target === popupMascotas || e.target.classList.contains("rpg-popup-close"))) {
      cerrarPopupMascotas();
      return;
    }

    const btnDescansar = e.target.closest('[data-rpg-accion="descansar"]');
    if (btnDescansar && !btnDescansar.disabled) {
      e.preventDefault(); e.stopPropagation();
      const faltante = hpMax() - state.hp;
      if (faltante > 0) {
        state.hp = hpMax();
        state.sangrado = 0;
        guardar(state);
        SND("curar");
        notifMascota?.("Descanso", `¡Has descansado y recuperado ${Math.round(faltante)} HP!`);
        render();
      }
      return;
    }
    const card = e.target.closest(".rpg-grupo-card");
    if (card && !card.disabled) {
      e.preventDefault(); e.stopPropagation();
      const g = GRUPOS[Number(card.dataset.grupo)];
      if (g) abrirPopupGrupo(g);
      return;
    }
    const popup = e.target.closest("#rpg-popup-grupo");
    if (popup) {
      if (e.target === popup || e.target.classList.contains("rpg-popup-close")) {
        popup.classList.remove("active");
        setTimeout(() => popup.remove(), 250);
        return;
      }
      const hordaBtn = e.target.closest(".rpg-btn-horda-opt");
      if (hordaBtn) {
        e.preventDefault(); e.stopPropagation();
        const num = Number(hordaBtn.dataset.mobs);
        setTamanoHorda(num);
        popup.querySelectorAll(".rpg-btn-horda-opt").forEach(b => {
          b.classList.toggle("active", Number(b.dataset.mobs) === num);
        });
        SND("blip");
        return;
      }
      const dot = e.target.closest(".rpg-popup-dot");
      if (dot) {
        e.preventDefault(); e.stopPropagation();
        if (dot.disabled) { SND("derrota"); return; }
        const z = ZONAS.find(x => x.id === dot.dataset.zona);
        if (!z) return;
        const ok = window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : (state.nivel >= z.nivel - 2 || state.enemigosDerrotados >= z.nivel * 6);
        if (!ok) { SND("derrota"); return; }
        popup.classList.remove("active");
        setTimeout(() => { popup.remove(); entrarZona(z.id); }, 200);
      }
    }
  }, true);

  function renderBatalla(c) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const spriteKey = enemigo.sprite || SPR_ENEMIGO[enemigo.id];
    let relPath = spriteKey;
    if (relPath && relPath.startsWith("img/48x48/")) relPath = relPath.replace("img/48x48/", "");
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const habs = window.RpgHabilidades?.ataquesDesbloqueados(mascotaId, state.nivel) || [];
    const esFase2 = enemigo.phase === 2;
    const habsItems = window.RpgItems?.getHabilidadesActivas?.() || [];

    // Renderizado del enemigo o horda
    let eContent = "";
    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      const totMobs = enemigo.horda.length;
      // Validar objetivo actual
      if (mobHordaObjetivoIdx === null || !enemigo.horda[mobHordaObjetivoIdx] || enemigo.horda[mobHordaObjetivoIdx].hp <= 0) {
        const primerVivo = enemigo.horda.findIndex(m => m.hp > 0);
        mobHordaObjetivoIdx = primerVivo >= 0 ? primerVivo : 0;
      }
      const mobsHtml = enemigo.horda.map((mob, i) => {
        const vivo = mob.hp > 0;
        let mSprKey = mob.sprite || relPath;
        if (mSprKey && mSprKey.startsWith("img/48x48/")) mSprKey = mSprKey.replace("img/48x48/", "");
        const mobSize = mob.esLider ? (totMobs >= 12 ? 42 : 48) : (totMobs >= 12 ? 34 : totMobs >= 8 ? 38 : 42);
        const mobSpr = renderMobAnimado(mSprKey, mobSize, `rpg-horda-anim ${vivo ? "" : "muerto"} ${mob.esLider ? "lider" : ""}`);
        const esSeleccionado = vivo && i === mobHordaObjetivoIdx;
        return `<div class="rpg-horda-item ${vivo ? "" : "caido"} ${mob.esLider ? "horda-lider" : ""} ${esSeleccionado ? "objetivo-seleccionado" : ""}" data-horda-idx="${i}" title="${mob.nombre || enemigo.nombre} (${mob.hp}/${mob.hpMax} HP) - Clic para fijar objetivo">
          ${mob.esLider ? `<span class="rpg-horda-corona">👑</span>` : ""}
          ${mobSpr}
          <div class="rpg-horda-item-hp"><span style="width:${Math.max(0, (mob.hp / mob.hpMax) * 100)}%"></span></div>
        </div>`;
      }).join("");
      eContent = `<div class="rpg-horda-container">
        <div class="rpg-horda-grid mobs-${totMobs}">${mobsHtml}</div>
        <div class="rpg-horda-contador">Horda: ${enemigo.horda.filter(x => x.hp > 0).length}/${totMobs} vivos <small style="display:block;font-size:0.75rem;opacity:.8;margin-top:2px;">(Toca un mob para atacarlo directamente)</small></div>
      </div>`;
    } else {
      const eSpriteEl = relPath ? renderMobAnimado(relPath, 92, "rpg-enemy-sprite-anim") : "";
      const eIcon = ICONO[enemigo.iconoKey] || enemigo.icono || (enemigo.jefe ? ICONO.corona : ICONO.espada) || ICONO.estrella || "";
      eContent = eSpriteEl || eIcon;
    }

    const totalAtkCombat = Math.round(atkTotal());
    const totalDefCombat = Math.round(defTotal());
    const totalHpMaxCombat = Math.round(hpMax());

    c.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">
            <span>${m.nombre}</span>
            <span class="rpg-hero-lvl">${state.nivel >= NIVEL_MAX ? `Nv ${NIVEL_MAX} (MÁX)` : `Nv ${state.nivel}`}</span>
            <div class="rpg-hero-stats-badges">
              <span class="rpg-stat-badge" title="Ataque">${SVG_SWORD}${totalAtkCombat}</span>
              <span class="rpg-stat-badge" title="Defensa">${SVG_SHIELD}${totalDefCombat}</span>
            </div>
          </div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${totalHpMaxCombat}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          ${enemigo.dot ? `<div class="rpg-barra-label" style="color:#ff9a3d"><span>🔥 Quemadura</span><span>${enemigo.dot} dmg/turno</span></div>` : ""}
          ${state.sangrado > 0 ? `<div class="rpg-barra-label" style="color:#ff5470"><span>🩸 Sangrado</span><span>${state.sangrado} dmg/turno</span></div>` : ""}
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>
      <div class="rpg-batalla ${esFase2 ? 'rpg-enraged' : ''}" id="rpg-batalla">
        <div class="rpg-batalla-top">
          <div class="rpg-fighter" id="fighter-heroe">
            <div class="rpg-fighter-sprite hero-pet" id="sprite-heroe">
              <img src="${m.imagen}" alt="" class="rpg-pet-avatar-combat" style="width:90px;height:90px;max-width:90px;max-height:90px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">
            </div>
            <div class="rpg-fighter-nombre">${m.nombre}</div>
            <div class="rpg-fighter-hp">${Math.round(state.hp)} HP</div>
            <div class="rpg-buffs" id="buffs-heroe"></div>
          </div>
          <div class="rpg-vs">VS</div>
          <div class="rpg-fighter" id="fighter-enemigo">
            <div class="rpg-fighter-sprite enemigo ${enemigo.esHorda ? 'es-horda' : ''} ${esFase2 ? 'fase2' : ''}" id="sprite-enemigo">${eContent}</div>
            <div class="rpg-fighter-nombre">${enemigo.nombre} ${enemigo.jefe ? (esFase2 ? '🔥 FASE 2' : '👑') : enemigo.esHorda ? `👥 HORDA (x${enemigo.horda.length})` : ''}</div>
            <div class="rpg-fighter-hp" id="hp-enemigo">${Math.round(enemigo.hp)} HP${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}</div>
            <div class="rpg-buffs" id="buffs-enemigo"></div>
          </div>
        </div>
        <div class="rpg-log" id="rpg-log"><div class="rpg-log-item info">¡${enemigo.esHorda ? `¡Una horda de ${enemigo.horda.length} ${enemigo.nombre} te rodea!` : '¡Un ' + enemigo.nombre + ' aparece!'}</div></div>
        <div class="rpg-habs-grid" id="rpg-habs-grid">
          ${habs.length ? habs.map(h => `<button type="button" class="rpg-hab rpg-hab-${h.tipo}" data-hab="${h.id}" title="${h.desc}"><span class="rpg-hab-nombre">${h.nombre}</span><span class="rpg-hab-lv">Nv ${h.lv}</span></button>`).join("") : `<button type="button" class="rpg-hab rpg-hab-daño" data-hab="ataque-basico" title="Ataque básico"><span class="rpg-hab-nombre">Ataque</span><span class="rpg-hab-lv">Básico</span></button>`}
        </div>
        <div class="rpg-acciones" id="rpg-acciones">
          <button type="button" class="rpg-btn objeto" id="btn-objeto" ${totalConsumibles() <= 0 ? "disabled" : ""}>
            ${SVG_POTION} Objeto <span class="rpg-btn-badge" id="rpg-badge-objetos">${totalConsumibles()}</span>
          </button>
          ${habsItems.length ? `<button type="button" class="rpg-btn arma" id="btn-arma-habs">
            ${SVG_SPARKLES} Habilidad de arma <span class="rpg-btn-badge">${habsItems.length}</span>
          </button>` : ""}
          <button type="button" class="rpg-btn huir" id="btn-huir">
            ${SVG_RUN} Huir
          </button>
        </div>
        <div id="rpg-arma-wrap"></div>
        <div id="rpg-objetos-wrap"></div>
      </div>`;

    window.hidratarIconos?.(c);

    qsa(".rpg-hab", c).forEach(b => b.addEventListener("click", () => usarHabilidad(b.dataset.hab)));
    qsa(".rpg-horda-item", c).forEach(item => {
      item.addEventListener("click", () => {
        const idx = Number(item.dataset.hordaIdx);
        if (enemigo && enemigo.horda && enemigo.horda[idx] && enemigo.horda[idx].hp > 0) {
          mobHordaObjetivoIdx = idx;
          qsa(".rpg-horda-item", c).forEach(it => it.classList.remove("objetivo-seleccionado"));
          item.classList.add("objetivo-seleccionado");
          log(`🎯 Objetivo fijado: ${enemigo.horda[idx].nombre} (${enemigo.horda[idx].hp}/${enemigo.horda[idx].hpMax} HP)`, "info");
          SND("blip");
        }
      });
    });
    $("#btn-objeto")?.addEventListener("click", toggleObjetos);
    $("#btn-arma-habs")?.addEventListener("click", toggleHabilidadesArma);
    $("#btn-huir")?.addEventListener("click", huir);
    renderBuffs();
  }

  function animarAtaqueHeroe() {
    const s = $("sprite-heroe");
    if (!s) return;
    s.classList.add("atacando");
    setTimeout(() => s.classList.remove("atacando"), 420);
  }

  function renderBuffs() {
    const h = $("buffs-heroe"), e = $("buffs-enemigo");
    const chip = (t, v, l) => `<span class="rpg-buff-chip ${t}">${l || t.toUpperCase()} ${v > 0 ? "+" : ""}${v}</span>`;
    if (h) h.innerHTML = buffsHeroe.map(b => chip(b.tipo, b.val, b.label)).join("");
    if (e) e.innerHTML = buffsEnemigo.map(b => chip(b.tipo, b.val, b.label)).join("");
  }
  const buffVal = t => buffsHeroe.filter(b => b.tipo === t).reduce((s, b) => s + b.val, 0);
  function tickBuffs() {
    buffsHeroe = buffsHeroe.map(b => ({ ...b, turnos: b.turnos - 1 })).filter(b => b.turnos > 0);
    buffsEnemigo = buffsEnemigo.map(b => ({ ...b, turnos: b.turnos - 1 })).filter(b => b.turnos > 0);
    if (state._cooldownPocion && state._cooldownPocion > 0) {
      state._cooldownPocion--;
    }
    renderBuffs();
  }

  const ESPECIALES = {
    comun: ['heal', 'buff', 'debuff', 'poison'],
    elite: ['multihit', 'drain', 'shield', 'curse'],
    jefe: ['firebreath', 'summon', 'apocalypse', 'curse']
  };

  function contarReliquiasPoder() {
    try {
      const loot = window.RpgLoot?.cargarLoot?.() || {};
      const pool = window.RpgLoot?.POOL || [];
      const mapaPool = new Map(pool.map(p => [p.id, p]));
      let cant = 0;
      Object.keys(loot).forEach(id => {
        const count = Number(loot[id]) || 0;
        if (count <= 0) return;
        const it = mapaPool.get(id);
        const rar = it?.rar || "";
        if (rar === "legendario" || rar === "mitico") {
          cant += count;
        }
      });
      return cant;
    } catch {
      return 0;
    }
  }

  function entrarZona(id) {
    const z = ZONAS.find(x => x.id === id); if (!z) return;
    state.zonaActual = z.id;
    state._oneshotUsado = false;
    state._segundaOportunidadUsada = false;
    state._inmuneUsado = false;
    mobHordaObjetivoIdx = null;
    guardar(state);

    const eId = z.enemigos[rnd(0, z.enemigos.length - 1)];
    const v = rnd(-15, 15) / 100;
    const hp = Math.max(30, Math.round(z.hp * (1 + v)));
    const tier = z.jefe ? 'jefe' : z.miniJefe ? 'elite' : 'comun';
    const esp = ESPECIALES[tier][rnd(0, ESPECIALES[tier].length - 1)];
    const spriteName = SPR_ENEMIGO[eId] || (z.jefe ? 'corona' : z.miniJefe ? 'calavera' : 'espada');

    // Selección y configuración de tamaño de horda (1, 4, 8, 12 mobs)
    // ¡Ahora disponible también para jefes y mini-jefes!
    const nHorda = getTamanoHorda();
    const esHorda = nHorda > 1;

    // Escalado de dificultad según reliquias legendarias y míticas (+2% HP y ATK por cada una)
    const cantReliquiasPoder = contarReliquiasPoder();
    const multPoderItems = 1 + (cantReliquiasPoder * 0.02);

    // Dificultad escalada: a mayor número de mobs, combate más desafiante y sustancialmente más recompensas
    // 1 mob: 1.0x HP, 1.0x ATK, 1.0x XP, 1.0x Oro
    // 4 mobs: 1.15x HP total, 1.20x ATK, +25% XP, +35% Oro
    // 8 mobs: 1.40x HP total, 1.45x ATK, +60% XP, +90% Oro
    // 12 mobs: 1.75x HP total, 1.75x ATK, +110% XP, +160% Oro
    const multHP = (esHorda ? (nHorda === 4 ? 1.15 : nHorda === 8 ? 1.40 : 1.75) : 1.0) * multPoderItems;
    const multATK = (esHorda ? (nHorda === 4 ? 1.20 : nHorda === 8 ? 1.45 : 1.75) : 1.0) * multPoderItems;
    const multXP = esHorda ? (nHorda === 4 ? 1.25 : nHorda === 8 ? 1.60 : 2.10) : 1.0;
    const multPremio = esHorda ? (nHorda === 4 ? 1.35 : nHorda === 8 ? 1.90 : 2.60) : 1.0;

    const hpFinal = Math.max(30, Math.round(hp * multHP));
    let hordaArr = null;
    if (esHorda) {
      if (z.jefe || z.miniJefe) {
        // En horda de JEFE / MINI-JEFE: El jefe lidera la vanguardia con 40% de la vida total,
        // y sus esbirros/guardias de la región lo escoltan con el resto repartido.
        const regInfo = REGIONES.find(r => r.id === z.region);
        const poolEscoltas = (regInfo && regInfo.elite && regInfo.elite.length) ? regInfo.elite : (z.enemigos || [eId]);
        const hpJefeParte = Math.max(20, Math.round(hpFinal * 0.40));
        const hpPorEscolta = Math.max(6, Math.round((hpFinal - hpJefeParte) / (nHorda - 1)));

        hordaArr = Array.from({ length: nHorda }, (_, idx) => {
          if (idx === 0) {
            return {
              id: 0,
              nombre: NOMBRES[eId] || eId,
              sprite: spriteName,
              hp: hpJefeParte,
              hpMax: hpJefeParte,
              esLider: true
            };
          } else {
            const escId = poolEscoltas[(idx - 1) % poolEscoltas.length];
            const escSpr = SPR_ENEMIGO[escId] || "espada";
            return {
              id: idx,
              nombre: NOMBRES[escId] || escId,
              sprite: escSpr,
              hp: hpPorEscolta,
              hpMax: hpPorEscolta,
              esLider: false
            };
          }
        });
      } else {
        const hpIndividual = Math.max(6, Math.round(hpFinal / nHorda));
        hordaArr = Array.from({ length: nHorda }, (_, idx) => ({
          id: idx,
          nombre: NOMBRES[eId] || eId,
          sprite: spriteName,
          hp: hpIndividual,
          hpMax: hpIndividual,
          esLider: false
        }));
      }
    }

    const probEsquivaHorda = esHorda ? (nHorda <= 4 ? 0.22 : nHorda <= 8 ? 0.28 : 0.35) : 0;

    enemigo = {
      id: eId, iconoKey: eId, icono: z.icono, sprite: spriteName, nombre: NOMBRES[eId] || eId,
      hpMax: esHorda ? (hordaArr.reduce((s, x) => s + x.hpMax, 0)) : hpFinal,
      hp: esHorda ? (hordaArr.reduce((s, x) => s + x.hp, 0)) : hpFinal,
      atk: Math.round(z.atk * (1 + v) * multATK),
      xp: Math.round(z.xp * multXP),
      monedas: Math.round(z.monedas * multPremio),
      jefe: !!z.jefe, miniJefe: !!z.miniJefe, esHorda, horda: hordaArr,
      tamanoHorda: nHorda,
      probEsquiva: probEsquivaHorda,
      dot: 0, dotDur: 0, sangrado: 0, sangradoDur: 0, shield: Math.round(z.shieldBase || 0), phase: 1, tier,
      special: esp, specialCD: z.jefe ? 2 : z.miniJefe ? 3 : 4, specialTimer: z.jefe ? 2 : z.miniJefe ? 3 : 4
    };
    turnoJugador = false; overlayObjetos = false;
    buffsHeroe = []; buffsEnemigo = [];
    SND("blip"); render();

    deshab(true);
    if (esHorda) {
      const tipoGrupo = nHorda <= 4 ? "La patrulla" : "La horda";
      log(`⚡ ¡${tipoGrupo} es más rápida que tú y toma la iniciativa atacando primero!`, "critico");
    } else {
      log(`⚡ ¡${enemigo.nombre} es más rápido que tú y ataca primero!`, "critico");
    }
    setTimeout(turnoEnemigo, 700);
  }

  function log(txt, tipo = "info") {
    const l = $("rpg-log"); if (!l) return;
    const d = document.createElement("div");
    d.className = "rpg-log-item " + tipo; d.textContent = txt;
    l.appendChild(d); l.scrollTop = l.scrollHeight;
  }
  function floatDmg(sel, txt, tipo = "daño") {
    const el = (sel instanceof Element) ? sel : qs(sel); if (!el) return;
    const f = document.createElement("span");
    f.className = "rpg-float " + tipo; f.textContent = txt;
    el.style.position = "relative"; f.style.left = "50%"; f.style.top = "20%";
    el.appendChild(f); setTimeout(() => f.remove(), 1000);
  }
  function totalConsumibles() {
    const inv = cargarInv();
    const comidasCount = Object.entries(COMIDAS).reduce((sum, [id]) => sum + (inv[id] || 0), 0);
    const RL = window.RpgLoot;
    const lootInv = RL?.cargarLoot?.() || {};
    const lootCount = (RL?.getConsumibles?.() || []).reduce((sum, it) => sum + (lootInv[it.id] || 0), 0);
    return comidasCount + lootCount;
  }
  function actualizarBadgeObjetos() {
    const total = totalConsumibles();
    const badge = $("rpg-badge-objetos");
    if (badge) badge.textContent = total;
    const btn = $("btn-objeto");
    if (btn && turnoJugador) {
      btn.disabled = total <= 0;
    }
  }
  function deshab(d) {
    qsa(".rpg-hab, [data-arma-hab]", document).forEach(b => b.disabled = d);
    ["#btn-arma-habs", "#btn-huir"].forEach(s => { const b = qs(s); if (b) b.disabled = d; });
    const btnObj = $("btn-objeto");
    if (btnObj) btnObj.disabled = d || totalConsumibles() <= 0;
  }
  function actualizarHPs() {
    const he = $("hp-enemigo");
    if (he && enemigo) {
      let extras = [];
      if (enemigo.shield > 0) extras.push(`🛡️${enemigo.shield}`);
      if (enemigo.dot > 0) extras.push(`🔥${enemigo.dot}`);
      if (enemigo.sangrado > 0) extras.push(`🩸${enemigo.sangrado}`);
      const extraStr = extras.length ? ` · ${extras.join(" · ")}` : "";

      if (enemigo.esHorda && enemigo.horda) {
        const vivos = enemigo.horda.filter(x => x.hp > 0).length;
        const total = enemigo.horda.length;
        he.textContent = `${Math.max(0, enemigo.hp)} HP (${vivos}/${total} vivos)${extraStr}`;
        const countBadge = qs(".rpg-horda-contador");
        if (countBadge) countBadge.textContent = `Horda: ${vivos}/${total} vivos`;
      } else {
        he.textContent = `${Math.max(0, enemigo.hp)} HP${extraStr}`;
      }
    }
    const hh = qs("#fighter-heroe .rpg-fighter-hp"); if (hh) hh.textContent = `${Math.round(state.hp)} HP`;
    const b = qs(".rpg-barra.hp > span"); if (b) b.style.width = clamp(state.hp / hpMax() * 100) + "%";
  }

  function aplicarDmgEnemigo(dmg, esAoE = false) {
    if (!enemigo) return;
    if (enemigo.shield > 0) {
      const abs = Math.min(dmg, enemigo.shield);
      enemigo.shield -= abs; dmg -= abs;
    }

    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      const vivos = enemigo.horda.filter(m => m.hp > 0);
      if (vivos.length > 0) {
        const probEsq = enemigo.probEsquiva || (enemigo.tamanoHorda <= 4 ? 0.22 : enemigo.tamanoHorda <= 8 ? 0.28 : 0.35);
        if (esAoE) {
          // Ataque en área: cada monstruo evalúa individualmente si logra esquivar
          vivos.forEach(m => {
            const el = qs(`.rpg-horda-item[data-horda-idx="${m.id}"]`);
            if (probEsq > 0 && Math.random() < probEsq) {
              log(`💨 ¡${m.nombre}${m.esLider ? " (Líder)" : ""} esquivó ágilmente el ataque en área!`, "curar");
              if (el) floatDmg(el, "¡ESQUIVÓ!", "curar");
              return;
            }
            m.hp = Math.max(0, m.hp - dmg);
            if (el) {
              const bar = el.querySelector(".rpg-horda-item-hp > span");
              if (bar) bar.style.width = `${Math.max(0, (m.hp / m.hpMax) * 100)}%`;
              if (m.hp <= 0) {
                el.classList.add("caido");
                el.classList.remove("objetivo-seleccionado");
                el.querySelector(".rpg-horda-anim")?.classList.add("muerto");
              }
            }
          });
        } else {
          // Ataque a un solo objetivo: comprobar si el objetivo seleccionado esquiva el golpe
          let target = enemigo.horda[mobHordaObjetivoIdx];
          if (!target || target.hp <= 0) {
            target = vivos[0];
            mobHordaObjetivoIdx = target ? target.id : 0;
          }
          if (target) {
            const el = qs(`.rpg-horda-item[data-horda-idx="${target.id}"]`);
            if (probEsq > 0 && Math.random() < probEsq) {
              log(`💨 ¡${target.nombre}${target.esLider ? " (Líder)" : ""} es demasiado rápido y esquivó tu ataque!`, "curar");
              if (el) floatDmg(el, "¡ESQUIVÓ!", "curar");
              else floatDmg("#sprite-enemigo", "¡ESQUIVÓ!", "curar");
              SND("blip");
              return;
            }
            target.hp = Math.max(0, target.hp - dmg);
            if (el) {
              const bar = el.querySelector(".rpg-horda-item-hp > span");
              if (bar) bar.style.width = `${Math.max(0, (target.hp / target.hpMax) * 100)}%`;
              if (target.hp <= 0) {
                el.classList.add("caido");
                el.classList.remove("objetivo-seleccionado");
                el.querySelector(".rpg-horda-anim")?.classList.add("muerto");
                log(`💀 ¡${target.nombre} ha caído!`, "critico");
              }
            }
          }
        }
        enemigo.hp = enemigo.horda.reduce((s, m) => s + m.hp, 0);

        // Si el objetivo fijado murió, seleccionar automáticamente el siguiente vivo
        if (mobHordaObjetivoIdx === null || !enemigo.horda[mobHordaObjetivoIdx] || enemigo.horda[mobHordaObjetivoIdx].hp <= 0) {
          const prox = enemigo.horda.find(m => m.hp > 0);
          if (prox) {
            mobHordaObjetivoIdx = prox.id;
            qsa(".rpg-horda-item").forEach(it => it.classList.remove("objetivo-seleccionado"));
            qs(`.rpg-horda-item[data-horda-idx="${prox.id}"]`)?.classList.add("objetivo-seleccionado");
          }
        }
      } else {
        enemigo.hp = 0;
      }
    } else {
      enemigo.hp = Math.max(0, enemigo.hp - dmg);
    }

    // Afección de Afijo: Espejo del Vacío (Reflejo del Jefe del Caos)
    if (enemigo && enemigo.afijoCaos && enemigo.afijoCaos.id === "reflejo" && dmg > 0) {
      const reflejado = Math.max(1, Math.round(dmg * 0.15));
      state.hp = Math.max(0, state.hp - reflejado);
      log(`🪞 Espejo del Vacío: ¡${enemigo.nombre} te refleja ${reflejado} de daño!`, "daño");
      floatDmg("#sprite-heroe", `-${reflejado}`, "daño");
      FX({ tipo: "attack", target: "hero", valor: reflejado, fxKey: "magic" });
      if (state.hp <= 0) {
        if (!comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
          setTimeout(derrota, 400);
        }
      }
    }

    // Animación visual de recibir golpe / herido
    const spr = qs("#sprite-enemigo");
    if (spr) {
      spr.classList.add("golpeado");
      const animMob = spr.querySelector(".rpg-mob-animado");
      if (animMob) animMob.classList.add("herido");
      setTimeout(() => {
        spr.classList.remove("golpeado");
        if (animMob) animMob.classList.remove("herido");
      }, 350);
    }
  }
  function chequearFaseJefe() {
    if (enemigo.jefe && enemigo.phase === 1 && enemigo.hp / enemigo.hpMax <= 0.5) {
      enemigo.phase = 2;
      enemigo.atk = Math.round(enemigo.atk * 1.25);
      enemigo.shield = Math.round(enemigo.hpMax * 0.08);
      log('🔥 ¡EL JEFE SE ENFURECE! +25% ATK', 'critico');
      SND('growl');
      $('rpg-batalla')?.classList.add('rpg-enraged');
    }
  }

  function danoEscaladoJefe(mult) {
    const atkEnemigo = enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s, b) => s + b.val, 0);
    const defHeroe = defTotal() + buffVal("def");
    const escalaHP = Math.min(1.5, 1 + (hpMax() - 300) / 1800);
    const minDmg = Math.max(12, Math.round(atkEnemigo * mult * 0.32));
    return Math.max(minDmg, Math.round((atkEnemigo * mult * escalaHP) - (defHeroe * 0.75) + rnd(1, 6)));
  }

  function comprobarPasivas(evento, contexto = {}) {
    const habs = window.RpgItems?.getHabilidadesActivas?.() || [];
    let activada = false;

    habs.forEach(function (hab) {
      const nombre = (hab.nombre || "").toLowerCase();
      const desc = (hab.desc || "").toLowerCase();
      const texto = nombre + " " + desc;

      if (evento === "recibir-muerte" && texto.includes("oneshot")) {
        if (state._oneshotUsado) return;
        state._oneshotUsado = true;
        activada = true;
        const hpRevivir = Math.round(hpMax() * 0.5);
        state.hp = hpRevivir;
        log(`💫 ¡ONESHOT activado! Revives con ${hpRevivir} HP.`, "critico");
        floatDmg("#sprite-heroe", "¡ONESHOT!", "curar");
        FX({ tipo: "heal", target: "hero", valor: hpRevivir, fxKey: "heal" });
        SND("victoria");
      }

      if (evento === "recibir-muerte" && (texto.includes("segunda oportunidad") || texto.includes("alma errante") || texto.includes("renace"))) {
        if (state._segundaOportunidadUsada) return;
        state._segundaOportunidadUsada = true;
        activada = true;
        state.sangrado = 0;
        state.hp = Math.round(hpMax() * 0.3);
        log(`👻 ¡${hab.nombre} activado! Revives con ${state.hp} HP.`, "critico");
        floatDmg("#sprite-heroe", "¡RENACES!", "curar");
        SND("victoria");
      }

      if (evento === "recibir-muerte" && (texto.includes("inmune") || texto.includes("invulnerable") || texto.includes("bloqueo total") || texto.includes("milagro de la gracia") || texto.includes("gracia"))) {
        if (state._inmuneUsado) return;
        state._inmuneUsado = true;
        activada = true;
        state.hp = Math.max(500, Math.round(hpMax() * 0.5));
        buffsHeroe.push({ tipo: "def", val: 500, turnos: 3, label: "🛡️ GRACIA" });
        log(`🕯️ ¡${hab.nombre} activado! La Gracia Solar anula la muerte: revives con ${state.hp} HP y escudo celestial.`, "critico");
        floatDmg("#sprite-heroe", "¡MILAGRO SOLAR!", "curar");
        SND("victoria");
      }

      if (evento === "recibir-dano" && (texto.includes("refleja") || texto.includes("devuelve daño") || texto.includes("espejo"))) {
        const dmgRecibido = contexto.dano || 0;
        const reflejado = Math.round(dmgRecibido * 0.3);
        if (reflejado > 0 && enemigo) {
          enemigo.hp = Math.max(0, enemigo.hp - reflejado);
          log(`🪞 ${hab.nombre}: reflejas ${reflejado} daño.`, "daño");
          floatDmg("#sprite-enemigo", "-" + reflejado, "daño");
          activada = true;
        }
      }

      if (evento === "turno-propio" && (texto.includes("bendición de las inflorescencias") || texto.includes("bendicion de las inflorescencias"))) {
        const pctMatch = desc.match(/(\d+)\s*%/);
        const pct = pctMatch ? parseInt(pctMatch[1]) : 5;
        const curaPorTurno = Math.round(hpMax() * (pct / 100));
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        log(`🌸 ${hab.nombre}: +${curaPorTurno} HP (${pct}% de vida máx).`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("conocimiento absoluto")) {
        const curaMatch = desc.match(/(\d+)\s*(?:de\s+)?vida/);
        const curaPorTurno = curaMatch ? parseInt(curaMatch[1]) : (hab.val || 600);
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        buffsHeroe.push({ tipo: "def", val: 200, turnos: 2, label: "🛡️ ESCUDO CÓSMICO" });
        log(`📚 ${hab.nombre}: +${curaPorTurno} HP y +400 escudo primordial cada turno.`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && (texto.includes("el mago") || (texto.includes("mago") && texto.includes("esquiva")))) {
        buffsHeroe.push({ tipo: "def", val: -5, turnos: 999, label: "🧙 -5 DEF" });
        buffsHeroe.push({ tipo: "esq", val: 10, turnos: 999, label: "🧙 +10% ESQ" });
        buffsHeroe.push({ tipo: "crit", val: 15, turnos: 999, label: "🧙 +15% CRIT" });
        if (enemigo && !enemigo.terminado) {
          const dmgArcano = 450;
          aplicarDmgEnemigo(dmgArcano);
          log(`🧙 ${hab.nombre}: +15% crítico, +10% esquiva y ¡destello arcano de ${dmgArcano} daño!`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmgArcano, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmgArcano, fxKey: "magic" });
        } else {
          log(`🧙 ${hab.nombre}: +15% crítico, +10% esquiva.`, "info");
        }
        renderBuffs();
        activada = true;
      }

      if (evento === "turno-propio" && (texto.includes("poder estelar") || texto.includes("cometa astral"))) {
        buffsHeroe.push({ tipo: "atk", val: 35, turnos: 999, label: "⭐ +35% ATK" });
        log(`⭐ ${hab.nombre}: la estrella pulsa aumentando tu poder +35% ATK acumulativo.`, "curar");
        renderBuffs();
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("incertidumbre")) {
        const defMatch = desc.match(/defensa\s+en\s+(\d+)/);
        const defVal = defMatch ? parseInt(defMatch[1]) : 10;
        buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: "🎲 +DEF" });
        log(`🎲 ${hab.nombre}: +${defVal} DEF acumulativo.`, "info");
        renderBuffs();
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("cura") && texto.includes("turno")) {
        const curaPorTurno = Math.round(hpMax() * 0.05);
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        log(`💚 ${hab.nombre}: +${curaPorTurno} HP por turno.`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("envenena") && texto.includes("turno")) {
        if (enemigo) {
          enemigo.dot = Math.max(enemigo.dot, Math.round(enemigo.hpMax * 0.05));
          enemigo.dotDur = Math.max(enemigo.dotDur, 2);
          activada = true;
        }
      }

      if (evento === "atacar" && (texto.includes("sangr") || hab.tipo === "sangrado" || hab.stats?.sangrado)) {
        if (enemigo && !enemigo.terminado) {
          const sangradoMatch = desc.match(/(\d+)\s*(?:de\s+)?(?:dmg|daño)/i);
          const sangradoDmg = sangradoMatch ? parseInt(sangradoMatch[1]) : (hab.val || 20);
          enemigo.sangrado = Math.max(enemigo.sangrado || 0, sangradoDmg);
          enemigo.sangradoDur = Math.max(enemigo.sangradoDur || 0, 3);
          log(`🩸 ${hab.nombre}: aplicas sangrado (${enemigo.sangrado} dmg/turno).`, "critico");
          floatDmg("#sprite-enemigo", "🩸 SANGRADO", "daño");
          activada = true;
        }
      }
    });

    // ─── Afijos Roguelike / Aventura Activos ───
    const tieneAfijo = af => window.RpgItems?.tieneAfijo?.(af);

    // 1. Sed de Sangre: al asestar crítico, cura 15% del daño y otorga +10% ATK por 2 turnos
    if (evento === "atacar" && contexto.crit && tieneAfijo("sed_de_sangre")) {
      const dmgReal = contexto.dmg || 0;
      const curacion = Math.max(1, Math.round(dmgReal * 0.15));
      state.hp = clamp(state.hp + curacion, 0, hpMax());
      guardar(state);
      buffsHeroe.push({ tipo: "atk", val: Math.max(5, Math.round(atkTotal() * 0.1)), turnos: 2, label: "🩸 SED DE SANGRE" });
      log(`🩸 Sed de Sangre: ¡Crítico voraz! Recuperas ${curacion} HP y ganas +10% ATK por 2 turnos.`, "curar");
      floatDmg("#sprite-heroe", `+${curacion}`, "curar");
      activada = true;
    }

    // 2. Baluarte Espinoso: al recibir daño, devuelve 150% de tu DEF al atacante
    if (evento === "recibir-dano" && tieneAfijo("baluarte_espinoso") && enemigo && !enemigo.terminado) {
      const defHeroe = defTotal() + buffVal("def");
      const contragolpe = Math.max(10, Math.round(defHeroe * 1.5));
      enemigo.hp = Math.max(0, enemigo.hp - contragolpe);
      log(`🛡️ Baluarte Espinoso: devuelves ${contragolpe} daño reflejado al atacante.`, "daño");
      floatDmg("#sprite-enemigo", `-${contragolpe}`, "daño");
      FX({ tipo: "attack", target: "enemy", valor: contragolpe, fxKey: "hammer" });
      activada = true;
    }

    // 3. Sobrecarga Solar: cada 3 turnos desata una descarga del 80% del ATK
    if (evento === "turno-propio" && tieneAfijo("sobrecarga_solar") && enemigo && !enemigo.terminado) {
      state._sobrecargaCargas = (state._sobrecargaCargas || 0) + 1;
      if (state._sobrecargaCargas >= 3) {
        state._sobrecargaCargas = 0;
        const dmgSolar = Math.max(15, Math.round((atkTotal() + buffVal("atk")) * 0.8));
        enemigo.hp = Math.max(0, enemigo.hp - dmgSolar);
        log(`☀️ Sobrecarga Solar: ¡Tu arsenal estalla liberando ${dmgSolar} daño solar radiante!`, "critico");
        floatDmg("#sprite-enemigo", `-${dmgSolar}`, "critico");
        FX({ tipo: "attack", target: "enemy", valor: dmgSolar, fxKey: "fireball", critico: true });
        activada = true;
      } else {
        log(`☀️ Sobrecarga Solar: acumulando energía solar (${state._sobrecargaCargas}/3)...`, "info");
      }
    }

    return activada;
  }

  function usarHabilidad(habId) {
    if (!enemigo || !turnoJugador || enemigo.terminado) return;

    if (habId === "ataque-basico") {
      turnoJugador = false; deshab(true);
      animarAtaqueHeroe();
      const dmg = Math.max(1, Math.round(atkTotal() * 0.9));
      aplicarDmgEnemigo(dmg);
      log(`Atacas por ${dmg} daño.`, "daño");
      floatDmg("#sprite-enemigo", "-" + dmg, "daño");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "slash" });
      comprobarPasivas("atacar", { dmg, habId });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 800);
      return;
    }

    const hab = window.RpgHabilidades?.ataquePorId(habId);
    if (!hab) return;
    turnoJugador = false; deshab(true);
    animarAtaqueHeroe();
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const pasiva = window.RpgHabilidades?.getPasiva(mascotaId) || {};
    const fxKey = FX_KEY(habId);

    // Escalado de habilidad por nivel y estadísticas totales
    const petLv = Math.min(state.nivel || 1, NIVEL_MAX);
    const escalaHabilidad = 1 + (petLv - 1) * 0.025; // +2.5% por nivel (hasta +122.5% a nivel 50)
    const statScaleBonus = Math.round((atkTotal() * 0.08) + (defTotal() * 0.06)); // Sinergia con stats equipados

    if (hab.tipo === "boost" && hab.buff) {
      Object.entries(hab.buff).forEach(([k, v]) => {
        if (["atk", "def", "crit", "esq"].includes(k)) {
          // Buffs escalan con nivel y estadísticas
          const vEscalado = Math.round(v * escalaHabilidad + (k === "atk" ? atkTotal() * 0.05 : k === "def" ? defTotal() * 0.05 : 0));
          buffsHeroe.push({ tipo: k, val: vEscalado, turnos: hab.buff.dur || 3, label: k.toUpperCase() });
        }
      });
      log(`✨ ${hab.nombre}: buff aplicado (potenciado por stats).`, "curar");
      FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
      renderBuffs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "soporte") {
      // Curación escala con HP Max y DEF total
      const healBase = hab.heal || 0.3;
      const curado = Math.round(hpMax() * (healBase * (1 + (petLv - 1) * 0.012)) + (defTotal() * 0.35));
      const antes = state.hp;
      state.hp = clamp(state.hp + curado, 0, hpMax());
      guardar(state);
      if (hab.limpia) { enemigo.dot = 0; log("🧼 Limpias efectos negativos.", "curar"); }
      if (hab.buff) {
        Object.entries(hab.buff).forEach(([k, v]) => {
          if (["atk", "def"].includes(k)) {
            const vEscalado = Math.round(v * escalaHabilidad);
            buffsHeroe.push({ tipo: k, val: vEscalado, turnos: hab.buff.dur || 3, label: k.toUpperCase() });
          }
        });
        renderBuffs();
      }
      log(`💚 ${hab.nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
      FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
      actualizarHPs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "daño_indirecto") {
      const esAoE = hab.alcance === "todos";
      // Daño continuo escala con el ATK del héroe y nivel
      const dotBase = Math.round((enemigo.hpMax * (hab.dmgInd || 0.1)) + (atkTotal() * 0.12 * escalaHabilidad));
      enemigo.dot = dotBase;
      enemigo.dotDur = hab.dur || 3;
      if (hab.debuff) {
        const k = hab.debuff.atk ? "atk" : "def";
        const v = -Math.round((hab.debuff.atk || hab.debuff.def) * escalaHabilidad);
        buffsEnemigo.push({ tipo: k, val: v, turnos: hab.debuff.dur || 3, label: "-" + k.toUpperCase() });
        renderBuffs();
      }
      log(`☠️ ${hab.nombre}: ${enemigo.dot} dmg por ${enemigo.dotDur} turnos.`, "critico");
      const dmg0 = Math.max(1, Math.round((atkTotal() * 0.55 * escalaHabilidad) + statScaleBonus));
      aplicarDmgEnemigo(dmg0, esAoE);
      floatDmg("#sprite-enemigo", "-" + dmg0, "daño");
      FX({ tipo: "attack", target: "enemy", valor: dmg0, fxKey: fxKey });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 900);
      return;
    }

    const hits = hab.hits || 1;
    const esAoE = hab.alcance === "todos";
    let totalDmg = 0;
    const veloActivo = !!state._veloEspectralCrit;
    if (veloActivo) {
      delete state._veloEspectralCrit;
      log("💨 Velo Espectral: ¡El contraataque sombrío desata un crítico garantizado con sangrado mortal!", "critico");
    }
    const critBase = veloActivo ? 1.0 : (critTotal() + (bonusTipo("crit_pct") / 100) + (buffVal("crit") / 100));
    const atkBuffed = atkTotal() + buffVal("atk");
    let algunCrit = false;
    for (let i = 0; i < hits; i++) {
      const crit = Math.random() < critBase;
      if (crit) algunCrit = true;
      // Multiplicador base de habilidad escalado por nivel y stats equipados
      const multTotal = (hab.mult || 1) * escalaHabilidad;
      let dmg = Math.round((atkBuffed * multTotal) + (statScaleBonus / hits) - rnd(1, 4));
      if (crit) dmg = Math.round(dmg * 1.8);
      if (enemigo.jefe && tieneBonus("crit_jefe")) dmg = Math.round(dmg * (1 + bonusTipo("crit_jefe") / 100));
      dmg = Math.max(1, dmg);
      aplicarDmgEnemigo(dmg, esAoE);
      totalDmg += dmg;
      log((i === hits - 1 ? (crit ? "¡CRÍTICO! " : "") : "") + `${hab.nombre}${hits > 1 ? ` [${i + 1}/${hits}]` : ""}: ${dmg} daño${esAoE ? " (a toda la horda)" : ""}.`, crit ? "critico" : "daño");
      if (enemigo.hp <= 0) break;
    }
    floatDmg("#sprite-enemigo", "-" + totalDmg, "daño");
    FX({ tipo: "attack", target: "enemy", valor: totalDmg, fxKey: fxKey, critico: algunCrit });
    SND("atrapado");

    if (veloActivo && enemigo && !enemigo.terminado) {
      const bleedDmg = Math.max(15, Math.round(totalDmg * 0.25));
      enemigo.sangrado = (enemigo.sangrado || 0) + bleedDmg;
      enemigo.sangradoDur = Math.max(enemigo.sangradoDur || 0, 3);
      log(`🩸 Velo Espectral: desgarro profundo aplica sangrado (-${bleedDmg} HP/turno).`, "daño");
    }

    if (hab.drain) {
      const robado = Math.round(totalDmg * hab.drain);
      state.hp = clamp(state.hp + robado, 0, hpMax());
      log(`🩸 Drenas ${robado} HP.`, "curar");
      guardar(state);
    }
    if (hab.robo) { setMonedas(getMonedas() + hab.robo); log(`💰 Robas ${hab.robo} monedas.`, "info"); }

    actualizarHPs();
    qs("#sprite-enemigo")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-enemigo")?.classList.remove("golpeado"), 350);
    chequearFaseJefe();
    comprobarPasivas("atacar", { dmg: totalDmg, hab, crit: algunCrit });
    if (enemigo.hp <= 0) return setTimeout(victoria, 500);

    if (pasiva.tipo === "doble_ataque" && Math.random() * 100 < pasiva.val) {
      log("🐰 ¡Brinco extra! Atacas otra vez.", "critico");
      setTimeout(() => {
        const seg = Math.max(1, Math.round(atkBuffed * 0.7));
        aplicarDmgEnemigo(seg, false);
        floatDmg("#sprite-enemigo", "-" + seg, "daño");
        FX({ tipo: "attack", target: "enemy", valor: seg, fxKey: "slash" });
        log(`Brinquito extra: ${seg} daño.`, "daño");
        actualizarHPs();
        chequearFaseJefe();
        if (enemigo.hp <= 0) return setTimeout(victoria, 400);
        setTimeout(turnoEnemigo, 800);
      }, 500);
      return;
    }
    setTimeout(turnoEnemigo, 800);
  }

  function usarHabilidadDeItem(hab) {
    if (!enemigo || !turnoJugador || enemigo.terminado) return;
    turnoJugador = false;
    deshab(true);
    animarAtaqueHeroe();

    const nombre = (hab.nombre || "").toLowerCase();
    const desc = (hab.desc || "").toLowerCase();
    const tipo = hab.tipo || "daño";
    const val = Number(hab.val) || 0;

    const efecto = detectarEfectoEspecifico(nombre, desc, val, tipo);
    if (efecto) {
      efecto.ejecutar();
      actualizarHPs();
      chequearFaseJefe();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 900);
      return;
    }

    if (tipo === "daño" || tipo === "ultimate") {
      let dmg;
      if (val >= 50) {
        dmg = Math.round(val);
        log(`✨ ${hab.nombre}: ${dmg} daño fijo.`, "critico");
      } else {
        dmg = Math.max(1, Math.round(atkTotal() * Math.max(val, 1)));
        log(`✨ ${hab.nombre}: ${dmg} daño.`, "critico");
      }
      aplicarDmgEnemigo(dmg);
      floatDmg("#sprite-enemigo", "-" + dmg, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
      SND("victoria");
    }
    else if (tipo === "daño_indirecto") {
      const dotVal = Math.max(1, Math.round(val > 0 ? val : enemigo.hpMax * 0.1));
      enemigo.dot = dotVal;
      enemigo.dotDur = 3;
      log(`☠️ ${hab.nombre}: ${dotVal} daño por turno (3 turnos).`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dotVal, fxKey: "burn" });
    }
    else if (tipo === "boost" || tipo === "defensa") {
      const atkBuff = Math.round(val * 2);
      const defBuff = Math.round(val * 1.5);
      buffsHeroe.push({ tipo: "atk", val: atkBuff, turnos: 3, label: "ATK" });
      buffsHeroe.push({ tipo: "def", val: defBuff, turnos: 3, label: "DEF" });
      log(`✨ ${hab.nombre}: +${atkBuff} ATK, +${defBuff} DEF (3 turnos).`, "curar");
      FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
      renderBuffs();
    }
    else if (tipo === "soporte") {
      let cur;
      if (val >= 1000 || val >= 100) cur = hpMax() - state.hp;
      else if (val > 0 && val < 100) cur = Math.round(hpMax() * (val / 100));
      else cur = Math.round(hpMax() * 0.4);
      const antes = state.hp;
      state.hp = Math.min(hpMax(), state.hp + cur);
      log(`💚 ${hab.nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
      floatDmg("#sprite-heroe", "+" + Math.round(state.hp - antes), "curar");
      FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
    }
    else if (tipo === "debuff") {
      const debuffVal = -Math.round(val * 2);
      buffsEnemigo.push({ tipo: "atk", val: debuffVal, turnos: 3, label: `${debuffVal} ATK` });
      log(`⬇️ ${hab.nombre}: enemigo ${debuffVal} ATK (3 turnos).`, "daño");
      renderBuffs();
    }
    else if (tipo === "control") {
      enemigo.specialTimer = Math.max(enemigo.specialTimer, 2);
      log(`❄️ ${hab.nombre}: enemigo aturdido 2 turnos.`, "critico");
    }
    else if (tipo === "invocacion") {
      const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 1));
      aplicarDmgEnemigo(dmg);
      log(`🌟 ${hab.nombre}: criatura golpea por ${dmg}.`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "magic" });
    }
    else if (tipo === "pasiva") {
      log(`🛡️ ${hab.nombre} es pasiva (siempre activa).`, "info");
    }

    if (["daño", "ataque", "invocacion", "ultimate"].includes(tipo)) {
      comprobarPasivas("atacar", { hab });
    }
    actualizarHPs();
    chequearFaseJefe();
    if (enemigo.hp <= 0) return setTimeout(victoria, 500);
    setTimeout(turnoEnemigo, 900);
  }

  function detectarEfectoEspecifico(nombre, desc, val, tipo) {
    const texto = (nombre + " " + desc).toLowerCase();

    // AURA DORADA: +DEF permanente
    if (texto.includes("aura dorada")) {
      const defMatch = desc.match(/(\d+)\s*(?:de\s+)?defensa/i);
      const defVal = defMatch ? parseInt(defMatch[1]) : 25;
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: `🛡️ +${defVal}` });
          log(`✨ ${nombre}: +${defVal} DEF permanente durante el combate.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffDef" });
          renderBuffs();
        }
      };
    }

    // CONOCIMIENTO ABSOLUTO (pasiva)
    if (texto.includes("conocimiento absoluto")) {
      return { ejecutar: () => log(`📚 ${nombre} es pasiva: regenera HP y genera escudo por turno.`, "info") };
    }

    // COMETA ASTRAL (Tornasol)
    if (texto.includes("cometa astral") || texto.includes("cometa.")) {
      return {
        ejecutar: () => {
          const dmg = val >= 100 ? val : Math.max(1200, Math.round(atkTotal() * 4.5));
          aplicarDmgEnemigo(dmg);
          if (enemigo) {
            enemigo.dot = Math.round(dmg * 0.15);
            enemigo.dotDur = 3;
          }
          log(`☄️ ${nombre}: ¡Impacto cósmico masivo de ${dmg} daño y quemadura estelar!`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
          SND("victoria");
        }
      };
    }

    // GÉNESIS CÓSMICA (Tornasol)
    if (texto.includes("génesis cósmica") || texto.includes("genesis cosmica")) {
      return {
        ejecutar: () => {
          const cura = val >= 100 ? val : 1500;
          const antes = state.hp;
          state.hp = Math.min(hpMax(), state.hp + cura);
          state.sangrado = 0;
          buffsHeroe = buffsHeroe.filter(b => (b.val || 0) >= 0);
          const c = Math.round(state.hp - antes);
          log(`✨ ${nombre}: ¡Génesis Celestial! +${c} HP y purificación total de estados negativos.`, "curar");
          floatDmg("#sprite-heroe", `+${c}`, "curar");
          FX({ tipo: "heal", target: "hero", valor: c, fxKey: "heal" });
          SND("sparkle");
        }
      };
    }

    // TRASCENDENCIA ESPECTRAL (Tornasol)
    if (texto.includes("trascendencia espectral")) {
      return {
        ejecutar: () => {
          const dmg = val >= 100 ? val : 1200;
          aplicarDmgEnemigo(dmg);
          buffsHeroe.push({ tipo: "esq", val: 100, turnos: 2, label: "👻 ESPECTRAL 100%" });
          log(`🌌 ${nombre}: ${dmg} daño arcano y te vuelves intangible (+100% esquiva).`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "shadow", critico: true });
          renderBuffs();
          SND("victoria");
        }
      };
    }

    // AURA DE GRACIA INFINITA (Tornasol)
    if (texto.includes("aura de gracia")) {
      return {
        ejecutar: () => {
          const escudo = val >= 100 ? val : 1000;
          buffsHeroe.push({ tipo: "def", val: Math.round(escudo / 2), turnos: 4, label: `🕯️ +${escudo} ESCUDO` });
          log(`🕯️ ${nombre}: Aura Solar envolvente. +${escudo} escudo celestial y prosperidad bendecida.`, "curar");
          floatDmg("#sprite-heroe", `+${escudo} ESCUDO`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffDef" });
          renderBuffs();
          SND("sparkle");
        }
      };
    }

    // HERVOR GALÁCTICO (Tornasol)
    if (texto.includes("hervor galáctico") || texto.includes("hervor galactico")) {
      return {
        ejecutar: () => {
          const dmg = val >= 100 ? val : 1400;
          aplicarDmgEnemigo(dmg);
          if (enemigo) {
            enemigo.specialTimer = Math.max(enemigo.specialTimer, 3);
          }
          log(`🍲 ${nombre}: ¡Onda de choque hirviente! ${dmg} daño y el enemigo queda aturdido 2 turnos.`, "critico");
          floatDmg("#sprite-enemigo", `-${dmg} ATURDIDO`, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "icebolt", critico: true });
          SND("victoria");
        }
      };
    }

    // NUTRICIÓN CÓSMICA (Tornasol)
    if (texto.includes("nutrición cósmica") || texto.includes("nutricion cosmica")) {
      return {
        ejecutar: () => {
          const cura = val >= 100 ? val : 800;
          const antes = state.hp;
          state.hp = Math.min(hpMax(), state.hp + cura);
          buffsHeroe.push({ tipo: "atk", val: 30, turnos: 999, label: "💪 +30 ATK" });
          const c = Math.round(state.hp - antes);
          log(`🍗 ${nombre}: Nutrición estelar +${c} HP y +30 ATK permanente.`, "curar");
          floatDmg("#sprite-heroe", `+${c} HP`, "curar");
          FX({ tipo: "heal", target: "hero", valor: c, fxKey: "heal" });
          renderBuffs();
          SND("sparkle");
        }
      };
    }

    // PODER ABSOLUTO (pasiva)
    if (texto.includes("poder absoluto")) {
      return { ejecutar: () => log(`👑 ${nombre} es pasiva: al vencer te curas.`, "info") };
    }

    // EL MAGO
    if (texto.includes("el mago") || (texto.includes("mago") && texto.includes("esquiva"))) {
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "def", val: -5, turnos: 3, label: "🧙 -5 DEF" });
          buffsHeroe.push({ tipo: "crit", val: 20, turnos: 3, label: "🎯 +20%" });
          buffsHeroe.push({ tipo: "esq", val: 5, turnos: 3, label: "💨 +5%" });
          log(`🧙 ${nombre}: -5 DEF, +20% crítico, +5% esquiva (3 turnos).`, "critico");
          FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
          renderBuffs();
        }
      };
    }

    // DEMORAH
    if (texto.includes("demorah")) {
      const esqMatch = desc.match(/(\d+)\s*(?:de\s+)?esquiva/i);
      const esqVal = esqMatch ? parseInt(esqMatch[1]) : 100;
      const turnosMatch = desc.match(/(\d+)\s*turnos?/i);
      const turnos = turnosMatch ? parseInt(turnosMatch[1]) : 2;
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "esq", val: esqVal, turnos: turnos, label: `💨 +${esqVal}%` });
          log(`💨 ${nombre}: +${esqVal}% esquiva por ${turnos} turnos.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffEsq" });
          renderBuffs();
        }
      };
    }

    // INCERTIDUMBRE
    if (texto.includes("incertidumbre")) {
      const defMatch = desc.match(/defensa\s+en\s+(\d+)/i) || desc.match(/(\d+)\s*(?:de\s+)?defensa/i);
      const defVal = defMatch ? parseInt(defMatch[1]) : 10;
      return {
        ejecutar: () => {
          const existente = buffsHeroe.find(b => b.label === "🎲 INCERT");
          if (existente) {
            existente.val += defVal;
            existente.turnos = 999;
          } else {
            buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: "🎲 INCERT" });
          }
          log(`🎲 ${nombre}: +${defVal} DEF acumulativo.`, "curar");
          renderBuffs();
        }
      };
    }

    // GOLPE TITÁNICO
    if (texto.includes("golpe titánico") || texto.includes("golpe titanico")) {
      const dmgMatch = desc.match(/(\d+)\s*(?:de\s+)?daño/i);
      const dmg = dmgMatch ? parseInt(dmgMatch[1]) : (val >= 50 ? val : 250);
      return {
        ejecutar: () => {
          aplicarDmgEnemigo(dmg);
          log(`💥 ${nombre}: ${dmg} daño devastador.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "hammer", critico: true });
          SND("victoria");
        }
      };
    }

    // ALMA ANIMAL
    if (texto.includes("alma animal")) {
      const drainVal = val > 0 ? val : 30;
      return {
        ejecutar: () => {
          const dmgInmediato = Math.round(drainVal * 0.5);
          aplicarDmgEnemigo(dmgInmediato);
          enemigo.dot = drainVal;
          enemigo.dotDur = 3;
          const robado = Math.round(dmgInmediato * 0.5);
          state.hp = Math.min(hpMax(), state.hp + robado);
          log(`👻 ${nombre}: ${dmgInmediato} daño + ${drainVal}/turno (3 turnos) · robas ${robado} HP.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmgInmediato, "daño");
          floatDmg("#sprite-heroe", "+" + robado, "curar");
          FX({ tipo: "attack", target: "enemy", valor: dmgInmediato, fxKey: "shadow" });
        }
      };
    }

    // CURA con número exacto
    if (nombre === "cura" || nombre.startsWith("cura")) {
      const curaMatch = desc.match(/cura(?:r)?\s+(\d+)/i);
      if (curaMatch) {
        const curaVal = parseInt(curaMatch[1]);
        return {
          ejecutar: () => {
            const antes = state.hp;
            state.hp = Math.min(hpMax(), state.hp + curaVal);
            const curado = Math.round(state.hp - antes);
            log(`💚 ${nombre}: +${curado} HP.`, "curar");
            floatDmg("#sprite-heroe", "+" + curado, "curar");
            FX({ tipo: "heal", target: "hero", valor: curado, fxKey: "heal" });
          }
        };
      }
    }

    // BENDICIÓN DE LAS INFLORESCENCIAS (pasiva)
    if (texto.includes("bendición de las inflorescencias") || texto.includes("bendicion de las inflorescencias")) {
      return { ejecutar: () => log(`🌸 ${nombre} es pasiva: cura % HP por turno.`, "info") };
    }

    // ONESHOT / INMUNE / REVIVE
    if (texto.includes("oneshot") || texto.includes("inmune") || texto.includes("revive")) {
      return { ejecutar: () => log(`💫 ${nombre} es pasiva defensiva.`, "info") };
    }

    // CURAR TODA LA VIDA
    if (texto.includes("cura toda la vida") || texto.includes("curación completa") || texto.includes("vida completa")) {
      return {
        ejecutar: () => {
          const antes = state.hp;
          state.hp = hpMax();
          log(`💚 ${nombre}: ¡Curación total! +${Math.round(state.hp - antes)} HP.`, "curar");
          floatDmg("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
          FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
        }
      };
    }

    // ESCUDO
    if (texto.includes("escudo") || texto.includes("blinda") || texto.includes("shield")) {
      let escudoVal = 0;
      const m1 = texto.match(/(\d+)\s*%\s*(?:de\s+)?(?:la\s+)?(?:vida\s+máxima|hp)/);
      const m2 = texto.match(/(?:da|dar|añade|otorga|genera)\s+(\d+)/);
      const m3 = texto.match(/\+?(\d+)\s*(?:de\s+)?escudo/);
      const m4 = texto.match(/escudo.*?(\d+)/);
      if (m1) escudoVal = Math.round(hpMax() * (parseInt(m1[1]) / 100));
      else if (m2) escudoVal = parseInt(m2[1]);
      else if (m3) escudoVal = parseInt(m3[1]);
      else if (m4) escudoVal = parseInt(m4[1]);
      else escudoVal = val > 0 ? val * 3 : Math.round(hpMax() * 0.2);
      const curaMatch = texto.match(/cura(?:r)?\s+(\d+)/);
      const curaVal = curaMatch ? parseInt(curaMatch[1]) : 0;
      return {
        ejecutar: () => {
          if (curaVal > 0) {
            const antes = state.hp;
            state.hp = Math.min(hpMax(), state.hp + curaVal);
            log(`💚 ${nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
          }
          buffsHeroe.push({ tipo: "def", val: Math.round(escudoVal / 2), turnos: 3, label: `🛡️ ${escudoVal}` });
          log(`🛡️ ${nombre}: escudo de ${escudoVal} por 3 turnos.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffDef" });
          renderBuffs();
        }
      };
    }

    // DRENAR VIDA
    if (texto.includes("drenar") || texto.includes("roba vida") || texto.includes("absorbe")) {
      return {
        ejecutar: () => {
          const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 1));
          aplicarDmgEnemigo(dmg);
          const robado = Math.round(dmg * 0.5);
          state.hp = Math.min(hpMax(), state.hp + robado);
          log(`🩸 ${nombre}: ${dmg} daño · robas ${robado} HP.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "daño");
          floatDmg("#sprite-heroe", "+" + robado, "curar");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "shadow" });
        }
      };
    }

    // VENENO / QUEMADURA
    if (texto.includes("veneno") || texto.includes("quema") || texto.includes("ardiente") || texto.includes("incendia")) {
      return {
        ejecutar: () => {
          const dotVal = Math.max(1, Math.round(val > 0 ? val : enemigo.hpMax * 0.08));
          enemigo.dot = dotVal;
          enemigo.dotDur = 3;
          const dmgInicial = Math.max(1, Math.round(atkTotal() * 0.5));
          aplicarDmgEnemigo(dmgInicial);
          log(`☠️ ${nombre}: ${dmgInicial} daño inicial + ${dotVal} por turno (3 turnos).`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmgInicial, "daño");
          FX({ tipo: "attack", target: "enemy", valor: dmgInicial, fxKey: "burn" });
        }
      };
    }

    // DAÑO MASIVO
    if (texto.includes("daño masivo") || texto.includes("devastador") || texto.includes("meteoro") || texto.includes("cometa")) {
      return {
        ejecutar: () => {
          const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 2));
          aplicarDmgEnemigo(dmg);
          log(`☄️ ${nombre}: ${dmg} daño devastador.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
          SND("victoria");
        }
      };
    }

    // ATURDIR
    if (texto.includes("aturd") || texto.includes("congela") || texto.includes("paraliza")) {
      return {
        ejecutar: () => {
          enemigo.specialTimer = Math.max(enemigo.specialTimer, 3);
          const dmg = Math.max(1, Math.round(atkTotal() * 0.5));
          aplicarDmgEnemigo(dmg);
          log(`❄️ ${nombre}: enemigo aturdido 3 turnos + ${dmg} daño.`, "critico");
          floatDmg("#sprite-enemigo", "¡ATURDIDO!", "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "icebolt" });
        }
      };
    }

    return null;
  }

  function toggleHabilidadesArma() {
    if (!turnoJugador) return;
    const w = $("rpg-arma-wrap"); if (!w) return;
    if (w.dataset.abierto === "1") { w.innerHTML = ""; w.dataset.abierto = "0"; return; }

    const habsItems = window.RpgItems?.getHabilidadesActivas?.() || [];
    if (!habsItems.length) {
      w.innerHTML = `<div class="rpg-arma-panel"><p style="opacity:.6;font-style:italic;text-align:center;padding:.5rem;">No tienes habilidades de arma equipadas.</p></div>`;
      w.dataset.abierto = "1"; return;
    }
    w.dataset.abierto = "1";
    w.innerHTML = `
      <div class="rpg-arma-panel">
        <div class="rpg-arma-titulo">${SVG_SPARKLES} Habilidades equipadas (máx. 4)</div>
        <div class="rpg-arma-grid">
          ${habsItems.map((h, i) => `
            <button type="button" class="rpg-arma-item" data-arma-hab="${i}" title="${h.desc || ''}">
              <span class="rpg-arma-icono">${SVG_SPARKLES}</span>
              <span class="rpg-arma-info">
                <strong>${h.nombre}</strong>
                <small>${(h.tipo || "").replace(/_/g, " ")} · val ${h.val}</small>
              </span>
            </button>`).join("")}
        </div>
        <button type="button" class="rpg-arma-cerrar" id="rpg-arma-cerrar">Cancelar</button>
      </div>`;

    qsa("[data-arma-hab]", w).forEach(b => b.addEventListener("click", () => {
      const h = habsItems[Number(b.dataset.armaHab)];
      if (h) { w.innerHTML = ""; w.dataset.abierto = "0"; usarHabilidadDeItem(h); }
    }));
    $("rpg-arma-cerrar")?.addEventListener("click", () => { w.innerHTML = ""; w.dataset.abierto = "0"; });
  }

  function tickDoT() {
    let dotActivo = false;
    if (enemigo.dot && enemigo.dot > 0) {
      aplicarDmgEnemigo(enemigo.dot);
      log(`🔥 Quemadura: -${enemigo.dot} HP.`, "daño");
      floatDmg("#sprite-enemigo", "-" + enemigo.dot, "daño");
      FX({ tipo: "attack", target: "enemy", valor: enemigo.dot, fxKey: "burn" });
      actualizarHPs();
      if (enemigo.hp <= 0) { setTimeout(victoria, 400); return true; }
      enemigo.dotDur--;
      if (enemigo.dotDur <= 0) enemigo.dot = 0;
      dotActivo = true;
    }
    if (enemigo.sangrado && enemigo.sangrado > 0) {
      aplicarDmgEnemigo(enemigo.sangrado);
      log(`🩸 Sangrado: -${enemigo.sangrado} HP al enemigo.`, "critico");
      floatDmg("#sprite-enemigo", "-" + enemigo.sangrado, "daño");
      FX({ tipo: "attack", target: "enemy", valor: enemigo.sangrado, fxKey: "slash" });
      actualizarHPs();
      if (enemigo.hp <= 0) { setTimeout(victoria, 400); return true; }
      enemigo.sangradoDur--;
      if (enemigo.sangradoDur <= 0) enemigo.sangrado = 0;
      dotActivo = true;
    }
    return false;
  }

  function turnoEnemigo() {
    if (!enemigo) return;
    if (tickDoT()) return;
    comprobarPasivas("turno-propio");

    const rg = regenTotal() + bonusTipo("regen_turno");
    if (rg > 0) {
      const a = state.hp; state.hp = Math.min(hpMax(), state.hp + rg);
      const c = Math.round(state.hp - a); if (c > 0) log("💚 Regeneras " + c + " HP.", "curar");
    }
    if (state.sangrado > 0) {
      state.hp = Math.max(0, state.hp - state.sangrado);
      log(`🩸 Sangrado: -${state.sangrado} HP`, "daño");
      if (state.hp <= 0) return setTimeout(derrota, 500);
    }
    // Comprobación de esquiva del héroe
    const esq = esqTotal() + bonusTipo("esquivar") / 100 + buffVal("esq") / 100;

    enemigo.specialTimer--;
    if (enemigo.specialTimer <= 0) {
      // Si la habilidad especial es curación pero el enemigo o horda tiene la vida llena (>=95%), no malgastar el turno curándose
      if (enemigo.special === 'heal' && enemigo.hp >= enemigo.hpMax * 0.95) {
        enemigo.specialTimer = 1; // Reevaluar el siguiente turno
        return ataqueNormalEnemigo();
      }
      enemigo.specialTimer = enemigo.specialCD;
      return setTimeout(ejecutarEspecial, 500);
    }
    ataqueNormalEnemigo();
  }

  function animarAtaqueEnemigo() {
    const s = $("sprite-enemigo");
    if (!s) return;
    s.classList.add("atacando");
    setTimeout(() => s.classList.remove("atacando"), 440);
  }

  function ataqueHordaSecuencial(skipMobIdx = null) {
    if (!enemigo || !enemigo.esHorda || !Array.isArray(enemigo.horda)) {
      return ataqueNormalEnemigo();
    }
    const vivos = enemigo.horda.filter(m => m.hp > 0 && (skipMobIdx === null || m.id !== skipMobIdx));
    if (!vivos.length) {
      actualizarHPs();
      tickBuffs();
      turnoJugador = true;
      deshab(false);
      return;
    }

    const nTotal = enemigo.horda.length;
    // Factor de daño equilibrado y peligroso por mob:
    // Con 4 mobs c/u pega ~40% del daño total, con 8 mobs c/u pega ~25%, con 12 mobs c/u pega ~20%
    const factorDmgMob = nTotal <= 4 ? 0.40 : nTotal <= 8 ? 0.25 : 0.20;
    const atkEnemigoBase = Math.max(1, enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s, b) => s + b.val, 0));
    const defHeroe = defTotal() + buffVal("def");
    const esqHeroe = esqTotal() + bonusTipo("esquivar") / 100 + buffVal("esq") / 100;

    let step = 0;
    function siguienteMobAtaca() {
      if (!enemigo || state.hp <= 0) return;
      if (step >= vivos.length) {
        actualizarHPs();
        tickBuffs();
        if (state.hp <= 0) {
          if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
            guardar(state);
            actualizarHPs();
            turnoJugador = true;
            deshab(false);
            return;
          }
          return setTimeout(derrota, 500);
        }
        turnoJugador = true;
        deshab(false);
        return;
      }

      const mob = vivos[step];
      step++;

      // Animación en el elemento específico del mob
      const mobEl = qs(`.rpg-horda-item[data-horda-idx="${mob.id}"]`);
      if (mobEl) {
        mobEl.classList.add("mob-atacando");
        setTimeout(() => mobEl.classList.remove("mob-atacando"), 320);
      }

      // Comprobación individual de esquiva frente al ataque de este mob
      if (esqHeroe > 0 && Math.random() < esqHeroe) {
        log(`😎 ¡Esquivaste el ataque de ${mob.nombre}${mob.esLider ? " (Líder)" : ""}!`, "curar");
        floatDmg("#sprite-heroe", "¡ESQUIVA!", "curar");
        if (window.RpgItems?.tieneAfijo?.("velo_espectral")) {
          state._veloEspectralCrit = true;
          log("💨 ¡Velo Espectral activado! Tu próximo golpe será un impacto crítico asegurado.", "critico");
        }
        actualizarHPs();
        return setTimeout(siguienteMobAtaca, 200);
      }

      // Cálculo de daño individual del mob con penetración parcial de defensa
      const multLider = mob.esLider ? 1.4 : 1.0;
      const atkJunto = Math.max(1, Math.round(atkEnemigoBase * factorDmgMob * multLider));
      // La defensa del héroe amortigua el golpe pero siempre deja pasar un mínimo tangible de daño (~18% del ataque del mob)
      const defMitigada = Math.max(0, Math.round(defHeroe * factorDmgMob * 0.75));
      const minDmg = Math.max(3, Math.round(atkJunto * 0.18));
      const dmg = Math.max(minDmg, atkJunto - defMitigada + rnd(0, 3));

      state.hp = Math.max(0, state.hp - dmg);
      guardar(state);
      // Sonido de impacto sutil y rápido para la horda (evita el sonido estridente repetido)
      SND("mobHit");
      log(`⚔️ ${mob.nombre}${mob.esLider ? " (Líder)" : ""}: te golpea por ${dmg} daño.`, "daño");
      floatDmg("#sprite-heroe", `-${dmg}`, "daño");
      FX({ tipo: "attack", target: "hero", valor: dmg, fxKey: mob.esLider ? "hammer" : "slash" });

      const heroeSpr = qs("#sprite-heroe");
      if (heroeSpr) {
        heroeSpr.classList.add("golpeado");
        setTimeout(() => heroeSpr.classList.remove("golpeado"), 180);
      }

      comprobarPasivas("recibir-dano", { dano: dmg, mob });
      actualizarHPs();

      if (state.hp <= 0) {
        if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
          guardar(state);
          actualizarHPs();
          turnoJugador = true;
          deshab(false);
          return;
        }
        return setTimeout(derrota, 500);
      }

      // Intervalo rápido y fluido entre ataques individuales (refleja la alta velocidad de la horda)
      setTimeout(siguienteMobAtaca, 230);
    }

    siguienteMobAtaca();
  }

  function ataqueNormalEnemigo() {
    if (enemigo.esHorda) {
      return ataqueHordaSecuencial();
    }
    animarAtaqueEnemigo();
    const esqHeroe = esqTotal() + bonusTipo("esquivar") / 100 + buffVal("esq") / 100;
    if (esqHeroe > 0 && Math.random() < esqHeroe) {
      log(`😎 ¡Esquivaste el ataque de ${enemigo.nombre}!`, "curar");
      floatDmg("#sprite-heroe", "¡ESQUIVA!", "curar");
      if (window.RpgItems?.tieneAfijo?.("velo_espectral")) {
        state._veloEspectralCrit = true;
        log("💨 ¡Velo Espectral activado! Tu próximo golpe será un impacto crítico asegurado.", "critico");
      }
      actualizarHPs();
      tickBuffs();
      turnoJugador = true;
      deshab(false);
      return;
    }
    const atkEnemigo = Math.max(1, enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s, b) => s + b.val, 0));
    const defHeroe = defTotal() + buffVal("def");
    const minDmg = Math.max(6, Math.round(atkEnemigo * 0.22));
    const dmg = Math.max(minDmg, Math.round(atkEnemigo - (defHeroe * 0.82)) + rnd(0, 4));
    state.hp = Math.max(0, state.hp - dmg); guardar(state);
    SND("hit");
    log(enemigo.nombre + " te ataca por " + dmg + ".", "daño");
    floatDmg("#sprite-heroe", "-" + dmg, "daño");
    FX({ tipo: "attack", target: "hero", valor: dmg, fxKey: "bolt" });
    const heroeSpr = qs("#sprite-heroe");
    if (heroeSpr) {
      heroeSpr.classList.add("golpeado");
      setTimeout(() => heroeSpr.classList.remove("golpeado"), 380);
    }
    const batallaBox = $("rpg-batalla");
    if (batallaBox) {
      batallaBox.classList.add("rpg-shake");
      setTimeout(() => batallaBox.classList.remove("rpg-shake"), 320);
    }

    const ls = lifestealTotal();
    if (ls > 0) {
      const rob = Math.round(dmg * ls);
      if (rob > 0) { state.hp = Math.min(hpMax(), state.hp + rob); log(`🩸 Robas ${rob} HP al enemigo.`, "curar"); }
    }
    const th = thornsTotal();
    if (th > 0) {
      enemigo.hp = Math.max(0, enemigo.hp - th);
      log(`🌵 Espinas: ${th} daño al enemigo.`, "daño");
      floatDmg("#sprite-enemigo", "-" + th, "daño");
      if (enemigo.hp <= 0) { actualizarHPs(); return setTimeout(victoria, 400); }
    }

    // Afijo Caos: Vampirismo Astral
    if (enemigo && enemigo.afijoCaos && enemigo.afijoCaos.id === "vampirismo" && dmg > 0) {
      const curado = Math.min(enemigo.hpMax - enemigo.hp, Math.round(dmg * 0.25));
      if (curado > 0) {
        enemigo.hp += curado;
        log(`🩸 Vampirismo Astral: ¡${enemigo.nombre} drena ${curado} HP de ti!`, "curar-enemigo");
        floatDmg("#sprite-enemigo", `+${curado}`, "curar");
      }
    }

    // Afijo Caos: Miasma Astral
    if (enemigo && enemigo.afijoCaos && enemigo.afijoCaos.id === "veneno_etereo") {
      state.sangrado = (state.sangrado || 0) + 5;
      log(`☠️ Miasma Astral: ¡Te impregnas de energía corrupta! (+5 daño/turno)`, "daño");
    }

    comprobarPasivas("recibir-dano", { dano: dmg });

    actualizarHPs(); tickBuffs();
    if (state.hp <= 0) {
      if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
        guardar(state);
        actualizarHPs();
        turnoJugador = true; deshab(false);
        return;
      }
      return setTimeout(derrota, 500);
    }
    turnoJugador = true; deshab(false);
  }

  function ejecutarEspecial() {
    if (!enemigo) return;
    const s = enemigo.special;
    SND('growl');

    // Identificar qué mob de la horda ejecuta la habilidad especial
    let mobActor = null;
    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      const vivos = enemigo.horda.filter(m => m.hp > 0);
      mobActor = vivos.find(m => m.esLider) || vivos[0];
      if (mobActor) {
        const mobEl = qs(`.rpg-horda-item[data-horda-idx="${mobActor.id}"]`);
        if (mobEl) {
          mobEl.classList.add("mob-atacando");
          setTimeout(() => mobEl.classList.remove("mob-atacando"), 400);
        }
      }
    }

    const actorNombre = mobActor ? `${mobActor.nombre}${mobActor.esLider ? ' (Líder)' : ''}` : enemigo.nombre;

    switch (s) {
      case 'heal': {
        const c = Math.round(enemigo.hpMax * 0.12);
        const antes = enemigo.hp;
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + c);
        const curadoReal = Math.round(enemigo.hp - antes);
        if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
          const heridos = enemigo.horda.filter(m => m.hp > 0 && m.hp < m.hpMax);
          if (heridos.length) {
            const cadaUno = Math.max(1, Math.round(c / heridos.length));
            heridos.forEach(m => { m.hp = Math.min(m.hpMax, m.hp + cadaUno); });
            enemigo.hp = enemigo.horda.reduce((s, m) => s + m.hp, 0);
          }
        }
        log(`💚 ${actorNombre} se cura ${curadoReal || c} HP.`, "curar-enemigo");
        floatDmg(mobActor ? `.rpg-horda-item[data-horda-idx="${mobActor.id}"]` : "#sprite-enemigo", `+${curadoReal || c}`, "curar");
        FX({ tipo: "heal", target: "enemy", valor: curadoReal || c, fxKey: "heal" });
        break;
      }
      case 'buff': {
        enemigo.atk = Math.round(enemigo.atk * 1.18);
        log(`⬆️ ${actorNombre} se potencia (+18% ATK).`, "info"); break;
      }
      case 'debuff': {
        buffsHeroe.push({ tipo: 'atk', val: -4, turnos: 3, label: '-ATK' });
        log(`⬇️ ¡${actorNombre} reduce tu ATK en 4!`, "daño");
        floatDmg("#sprite-heroe", "-4 ATK", "daño");
        FX({ tipo: "attack", target: "hero", valor: 4, fxKey: "darkness" });
        renderBuffs(); break;
      }
      case 'poison': {
        state.sangrado = (state.sangrado || 0) + 3;
        log(`☠️ ¡${actorNombre} te envenena! +3 daño/turno.`, "daño"); break;
      }
      case 'multihit': {
        let total = 0;
        for (let i = 0; i < 3; i++) {
          const defHeroe = defTotal() + buffVal("def");
          const d = Math.max(1, Math.floor(enemigo.atk * 0.45) - defHeroe + rnd(-2, 2));
          state.hp = Math.max(0, state.hp - d); total += d;
        }
        log(`💥💥💥 ¡${actorNombre} desata un triple golpe! ${total} daño.`, "daño");
        floatDmg("#sprite-heroe", "-" + total, "daño");
        FX({ tipo: "attack", target: "hero", valor: total, fxKey: "dagger" }); break;
      }
      case 'drain': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.floor(enemigo.atk * 0.7) - defHeroe + rnd(-2, 2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(d * 0.7));
        log(`🩸 ${actorNombre} te drena ${d} HP.`, "daño");
        floatDmg("#sprite-heroe", "-" + d, "daño"); break;
      }
      case 'shield': {
        enemigo.shield += Math.round(enemigo.hpMax * 0.15);
        log(`🛡️ ${actorNombre} se blinda (${enemigo.shield}).`, "info"); break;
      }
      case 'curse': {
        buffsHeroe.push({ tipo: 'def', val: -3, turnos: 3, label: '-DEF' });
        log(`💀 ¡${actorNombre} lanza una maldición! -3 DEF durante 3 turnos.`, "critico");
        floatDmg("#sprite-heroe", "-3 DEF", "critico");
        FX({ tipo: "attack", target: "hero", valor: 3, fxKey: "darkness" });
        renderBuffs(); break;
      }
      case 'firebreath': {
        const d = danoEscaladoJefe(1.2);
        state.hp = Math.max(0, state.hp - d);
        enemigo.dot = Math.round(enemigo.hpMax * 0.05);
        enemigo.dotDur = 2;
        log(`🔥 ¡${actorNombre} exhala aliento de fuego! ${d} daño + quemadura.`, "critico");
        floatDmg("#sprite-heroe", "-" + d, "daño");
        FX({ tipo: "attack", target: "hero", valor: d, fxKey: "fireball", critico: true }); break;
      }
      case 'summon': {
        const d = danoEscaladoJefe(0.8);
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(enemigo.hpMax * 0.10));
        log(`💀 ${actorNombre} invoca esqueletos · ${d} daño · se cura.`, "critico"); break;
      }
      case 'apocalypse': {
        const d = danoEscaladoJefe(1.5);
        state.hp = Math.max(0, state.hp - d);
        enemigo.shield += Math.round(enemigo.hpMax * 0.08);
        log(`☄️ ¡${actorNombre}: APOCALIPSIS! ${d} daño + escudo.`, "critico");
        floatDmg("#sprite-heroe", "-" + d, "daño");
        FX({ tipo: "attack", target: "hero", valor: d, fxKey: "fireball", critico: true }); break;
      }
    }
    actualizarHPs();
    if (state.hp <= 0) {
      if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
        guardar(state);
        actualizarHPs();
        tickBuffs();
        turnoJugador = true; deshab(false);
        return;
      }
      return setTimeout(derrota, 500);
    }

    // En hordas: Un miembro de la horda usó su habilidad especial (buff, multihit, heal, etc.).
    // Los demás miembros de la horda aún deben realizar sus ataques secuenciales en este turno.
    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      // Si el especial fue de ataque directo (como multihit, drain, apocalypse, etc.),
      // el mob que lo ejecutó ya consumió su acción ofensiva, por lo que los restantes atacan.
      // Si fue buff/heal/shield, toda la horda ataca potenciada.
      const specialsSinAtaqueDirecto = ['buff', 'heal', 'shield', 'debuff', 'poison', 'curse'];
      const skipId = specialsSinAtaqueDirecto.includes(s) ? null : (mobActor ? mobActor.id : null);
      return setTimeout(() => ataqueHordaSecuencial(skipId), 450);
    }

    tickBuffs();
    turnoJugador = true; deshab(false);
  }

  function toggleObjetos() {
    if (!turnoJugador) return;
    overlayObjetos = !overlayObjetos;
    const w = $("rpg-objetos-wrap"); if (!w) return;
    if (!overlayObjetos) { w.innerHTML = ""; return; }
    const inv = cargarInv();
    const comidas = Object.entries(COMIDAS).filter(([id]) => (inv[id] || 0) > 0);
    const RL = window.RpgLoot;
    const consum = RL?.getConsumibles?.() || [];
    const lootInv = RL?.cargarLoot?.() || {};
    if (!comidas.length && !consum.length) {
      w.innerHTML = `<div class="rpg-objetos"><div style="grid-column:1/-1;text-align:center;opacity:.6;font-style:italic;padding:.5rem;">No tienes objetos</div></div>`;
      return;
    }
    w.innerHTML = `<div class="rpg-objetos">
      ${comidas.map(([id, c]) => `<button type="button" class="rpg-objeto" data-tipo="comida" data-id="${id}" title="${c.nombre}"><span class="rpg-objeto-icono">${ICONO[c.icono] || ""}</span><span class="rpg-objeto-cantidad">${inv[id]}</span></button>`).join("")}
      ${consum.map(it => {
      const c = lootInv[it.id] || 0;
      const ic = RL?.renderIcono ? RL.renderIcono(it, "30px") : `<span class="loot-icono" data-icono="${it.icono}"></span>`;
      return `<button type="button" class="rpg-objeto rar-${it.rar}" data-tipo="loot" data-id="${it.id}" title="${it.nombre}"><span class="rpg-objeto-icono">${ic}</span><span class="rpg-objeto-cantidad">${c}</span></button>`;
    }).join("")}
    </div>`;
    window.hidratarIconos?.(w);
    qsa(".rpg-objeto", w).forEach(b => b.addEventListener("click", () => {
      b.dataset.tipo === "comida" ? usarObjeto(b.dataset.id) : usarLootConsumible(b.dataset.id);
    }));
  }

  function usarObjeto(id) {
    if (!turnoJugador || !enemigo) return;
    const inv = cargarInv();
    if (!inv[id] || inv[id] <= 0) return;
    const c = COMIDAS[id];
    inv[id]--; API.guardarInv(inv);
    const a = state.hp;
    state.hp = clamp(state.hp + c.efecto.hambre, 0, hpMax());
    guardar(state); SND("comer");
    log(`Usas ${c.nombre}. +${Math.round(state.hp - a)} HP.`, "curar");
    floatDmg("#sprite-heroe", `+${Math.round(state.hp - a)}`, "curar");
    FX({ tipo: "consumible", target: "hero", valor: Math.round(state.hp - a), fxKey: "potionRed" });
    actualizarHPs();
    actualizarBadgeObjetos();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    setTimeout(turnoEnemigo, 700);
  }

  function usarLootConsumible(id) {
    if (!turnoJugador || !enemigo) return;
    const RL = window.RpgLoot; if (!RL?.usarConsumible) return;
    const item = RL.POOL.find(p => p.id === id); if (!item) return;

    if (state._cooldownPocion && state._cooldownPocion > 0) {
      log(`⏳ Pociones en cooldown: debes esperar ${state._cooldownPocion} turno(s) más.`, "daño");
      floatDmg("#sprite-heroe", `⏳ ${state._cooldownPocion}T`, "daño");
      return;
    }

    if (!RL.usarConsumible(id)) return;
    state._cooldownPocion = item.cooldown || 3;
    const st = item.stats || {};
    const curVal = st.hp || item.val || 100;
    const a = state.hp;

    if (item.tipo === "hp" || item.tipo === "def" || item.tipo === "soporte" || item.consumible) {
      state.hp = clamp(state.hp + curVal, 0, hpMax());
      guardar(state);
      SND("comer");
      const curado = Math.round(state.hp - a);
      log(`Usas ${item.nombre} (Cooldown: ${state._cooldownPocion}T). +${curado} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${curado}`, "curar");
      FX({ tipo: "consumible", target: "hero", valor: curado, fxKey: "potionBlue" });

      if (st.def || (item.tipo === "def" && item.val)) {
        const esc = st.def || Math.round(item.val * 2);
        buffsHeroe.push({ tipo: "def", val: esc, turnos: 3, label: "DEF" });
        log(`🛡️ ${item.nombre}: +${esc} DEF temporal.`, "curar");
        renderBuffs();
      }
      if (st.atk) {
        buffsHeroe.push({ tipo: "atk", val: st.atk, turnos: 3, label: "ATK" });
        log(`⚔️ ${item.nombre}: +${st.atk} ATK temporal.`, "curar");
        renderBuffs();
      }
    } else if (item.tipo === "atk") {
      const dmg = st.atk || item.val || 50;
      aplicarDmgEnemigo(dmg);
      SND("sparkle"); log(`¡Lanzas ${item.nombre}! ${dmg} de daño.`, "critico");
      floatDmg("#sprite-enemigo", `-${dmg}`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
      chequearFaseJefe();
    }
    actualizarHPs();
    actualizarBadgeObjetos();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    if (enemigo.hp <= 0) setTimeout(victoria, 500);
    else setTimeout(turnoEnemigo, 700);
  }

  function huir() {
    if (!turnoJugador || !enemigo) return;
    if (enemigo.jefe) { log("❌ No puedes huir de un jefe.", "daño"); return; }
    const chance = tieneBonus("escape_seguro") ? 1 : 0.6;
    if (Math.random() < chance) {
      log("Escapas del combate...", "info");
      setTimeout(() => { enemigo = null; buffsHeroe = []; buffsEnemigo = []; state.sangrado = 0; render(); }, 500);
    } else {
      log("¡No pudiste escapar!", "daño");
      turnoJugador = false; deshab(true);
      setTimeout(turnoEnemigo, 700);
    }
  }

  function mostrarFinCombate(tipo, datos) {
    if (enemigo) enemigo.terminado = true;
    deshab(true);
    const batallaEl = $("rpg-batalla");
    if (!batallaEl) return;

    // Remover panel anterior si existiese
    qs(".rpg-fin-combate-overlay", batallaEl)?.remove();

    const overlay = document.createElement("div");
    overlay.className = `rpg-fin-combate-overlay ${tipo}`;
    const esVic = tipo === "victoria";

    overlay.innerHTML = `
      <div class="rpg-fin-combate-card">
        <div class="rpg-fin-icono">${esVic ? `<img src="img/sprites%20complementarios/trofeo.png" alt="" style="width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(255,217,61,.6));">` : "💀"}</div>
        <div class="rpg-fin-titulo">${esVic ? "¡VICTORIA!" : "¡DERROTA!"}</div>
        <div class="rpg-fin-sub">${esVic ? `${datos.nE} derrotado` : "Has caído en combate..."}</div>
        ${esVic ? `
          <div class="rpg-fin-recompensas">
            <span class="rpg-fin-badge xp">+${datos.xp} XP</span>
            <span class="rpg-fin-badge oro">+${datos.mon} 🪙</span>
            ${datos.cofre ? `<span class="rpg-fin-badge cofre">${datos.cofre.emoji} ${datos.cofre.nombre}</span>` : ""}
          </div>
          ${datos.cofre ? `<div class="rpg-fin-extra" style="color:#ffd84d;">🎁 ¡El enemigo soltó un ${datos.cofre.nombre}! Ve a la pestaña 'Cofres' para abrirlo.</div>` : ""}
          ${datos.primeraVictoria ? `<div class="rpg-fin-extra">🌟 ¡Zona conquistada! Recompensa extra incluida.</div>` : ""}
          ${datos.sub > 0 ? `<div class="rpg-fin-subio"><img src="img/sprites%20complementarios/estrella.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:4px;">¡Subiste a Nivel ${state.nivel}!</div>` : ""}
        ` : `
          <div class="rpg-fin-recompensas">
            <span class="rpg-fin-badge oro perdidas">-${datos.perdidas} 🪙</span>
          </div>
          <div class="rpg-fin-extra">Descansas un poco y recuperas vida.</div>
        `}
        <div class="rpg-fin-botones">
          <button type="button" class="rpg-btn primaria" id="btn-combatir-otra-vez"><img src="img/sprites%20complementarios/espada.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px;">Combatir otra vez</button>
          <button type="button" class="rpg-btn secundaria" id="btn-salir-mapa"><img src="img/items%20de%20aventura/mapa.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px;">Volver al mapa</button>
        </div>
      </div>
    `;

    batallaEl.appendChild(overlay);

    overlay.querySelector("#btn-combatir-otra-vez")?.addEventListener("click", (e) => {
      e.target.disabled = true;
      overlay.remove();
      const zActual = state.zonaActual;
      enemigo = null;
      buffsHeroe = [];
      buffsEnemigo = [];
      state.sangrado = 0;
      entrarZona(zActual);
    });

    overlay.querySelector("#btn-salir-mapa")?.addEventListener("click", (e) => {
      e.target.disabled = true;
      overlay.remove();
      enemigo = null;
      buffsHeroe = [];
      buffsEnemigo = [];
      state.sangrado = 0;
      render();
    });
  }

  function victoria() {
    if (!enemigo || enemigo.terminado) return;
    enemigo.terminado = true;
    const eraJefe = enemigo.jefe, nE = enemigo.nombre;
    let xp = Math.round(enemigo.xp * xpTotal());
    let mon = Math.round(enemigo.monedas * oroTotal());
    const xpB = bonusTipo("xp_extra") / 100;
    if (xpB > 0) xp = Math.round(xp * (1 + xpB));
    mon += bonusTipo("monedas_victoria");

    const primeraVictoriaZona = !state.zonasConquistadas.includes(state.zonaActual);
    const xpPrimeraVictoria = primeraVictoriaZona ? Math.round(xp * 0.5) : 0;
    const monedasPrimeraVictoria = primeraVictoriaZona ? Math.round(mon * 0.5) : 0;
    if (primeraVictoriaZona) {
      state.zonasConquistadas.push(state.zonaActual);
      xp += xpPrimeraVictoria; mon += monedasPrimeraVictoria;
    }

    // PODER ABSOLUTO: al vencer te curas
    const habs = window.RpgItems?.getHabilidadesActivas?.() || [];
    const poderAbsoluto = habs.find(h => {
      const t = ((h.nombre || "") + " " + (h.desc || "")).toLowerCase();
      return t.includes("poder absoluto");
    });
    if (poderAbsoluto) {
      const curaCompleta = hpMax() - state.hp;
      if (curaCompleta > 0) {
        state.hp = hpMax();
        log(`👑 ¡Poder Absoluto! Te curas ${Math.round(curaCompleta)} HP.`, "curar");
      }
    }

    window.dispatchEvent(new CustomEvent("rpg:victoria", { detail: { enemigo: { ...enemigo, zona: state.zonaActual, xp, monedas: mon } } }));
    state.enemigosDerrotados++;
    state.xp += xp;

    // Métricas de Hordas para estadísticas y logros
    if (enemigo.esHorda) {
      state.hordasDerrotadas = (state.hordasDerrotadas || 0) + 1;
      state.hordasTamanoMax = Math.max(state.hordasTamanoMax || 0, enemigo.tamanoHorda || 1);
      if (eraJefe) {
        state.jefesHordaDerrotados = (state.jefesHordaDerrotados || 0) + 1;
      }
    }

    if (eraJefe && !state.jefesDerrotados.includes(state.zonaActual)) state.jefesDerrotados.push(state.zonaActual);
    if (eraJefe) {
      try {
        const u = resolveUid(), mascota = localStorage.getItem("mascota_actual") || "mapache";
        const k = `sa_rpg_jefes_mascota_${u}`;
        const logData = JSON.parse(localStorage.getItem(k) || "{}");
        logData[mascota] = logData[mascota] || [];
        if (!logData[mascota].includes(state.zonaActual)) logData[mascota].push(state.zonaActual);
        localStorage.setItem(k, JSON.stringify(logData));
        if (mascota === "conejo" && logData[mascota].length >= 9) notifMascota?.("🐰 ¡MÁXIMA BESTIA!", "¡Has completado el juego con el conejo!");
      } catch { }
    }
    let sub = 0;
    let maxSubidas = 100;
    while (state.nivel < NIVEL_MAX && maxSubidas-- > 0) {
      const req = xpParaSubir();
      if (!isFinite(req) || req <= 0 || state.xp < req) break;
      state.xp -= req;
      state.nivel++;
      state.hp = hpMax();
      sub++;
    }
    if (state.nivel >= NIVEL_MAX) {
      state.nivel = NIVEL_MAX;
      state.xp = 0;
    }
    const cuv = bonusTipo("curar_victoria");
    if (cuv > 0) { state.hp = Math.min(hpMax(), state.hp + cuv); log("💚 +" + cuv + " HP.", "curar"); }
    setMonedas(getMonedas() + mon);
    SND("victoria");
    try { window._darPremio?.(0, 10, "¡Victoria!"); } catch { }
    try {
      const u = resolveUid();
      const kXp = `sa_experiencia_extra_${u}`;
      const actualXp = Math.max(0, Number(localStorage.getItem(kXp)) || 0);
      const xpGanado = Math.max(2, Math.round(xp * 0.25));
      localStorage.setItem(kXp, String(actualXp + xpGanado));
      window.dispatchEvent(new Event("sunad:progress"));
    } catch { }
    try {
      const petAct = localStorage.getItem("mascota_actual") || "mapache";
      const amorG = eraJefe ? 12 : 4;
      window._subirVinculo?.(petAct, amorG, eraJefe ? "Jefe derrotado en equipo" : "Victoria de Aventura");
    } catch { }
    try { notifMascota?.("¡Victoria!", "+" + mon + " monedas · +" + xp + " XP"); } catch { }
    guardar(state);
    $("rpg-batalla")?.classList.add("ganada");
    log("¡" + nE + " derrotado! +" + xp + " XP, +" + mon + " monedas.", "info");
    // Sistema de drop de cofres según dificultad, tier de enemigo y tamaño de horda
    let cofreGanado = null;
    try {
      const RL = window.RpgLoot;
      if (RL && RL.COFRES) {
        const nHorda = enemigo.tamanoHorda || 1;
        // Probabilidad base de drop de cofre (reducida para mayor dificultad):
        // Normal: 2% (antes 6%), Mini-jefe: 10% (antes 22%), Jefe: 30% (antes 55%)
        // Bonus por horda: +1.5% (Patrulla), +3% (Horda), +5% (Enjambre)
        let probCofre = eraJefe ? 0.30 : enemigo.miniJefe ? 0.10 : 0.02;
        if (nHorda >= 12) probCofre += 0.05;
        else if (nHorda >= 8) probCofre += 0.03;
        else if (nHorda >= 4) probCofre += 0.015;

        // En combate Post-Game (Jefes del Caos o Falla alta): drop garantizado de cofre Celestial o Alba
        if (enemigo.esPostGame) {
          probCofre = 1.0;
        }

        if (Math.random() <= probCofre) {
          // Determinar qué cofre otorgar según orden de la zona y tier
          const zOrd = ZONAS.find(x => x.id === state.zonaActual)?.orden || 1;
          let tipoCofre = "madera";
          if (enemigo.esPostGame) {
            // Postgame: más balanceado entre dorado, alba y una prob menor de celestial
            const x = Math.random();
            tipoCofre = enemigo.jefe
              ? (x < 0.25 ? "celestial" : x < 0.65 ? "alba" : "dorado")
              : (x < 0.12 ? "celestial" : x < 0.45 ? "alba" : "dorado");
          } else if (zOrd >= 100 || (eraJefe && zOrd >= 80)) {
            // Drop reducido de celestial en campaña: 12% celestial, 28% alba, 60% dorado
            const x = Math.random();
            tipoCofre = x < 0.12 ? "celestial" : x < 0.40 ? "alba" : "dorado";
          } else if (zOrd >= 60 || (eraJefe && zOrd >= 40)) {
            // Drop reducido de alba: 20% alba, 55% dorado, 25% hierro
            const x = Math.random();
            tipoCofre = x < 0.20 ? "alba" : x < 0.75 ? "dorado" : "hierro";
          } else if (zOrd >= 30 || (eraJefe && zOrd >= 20) || enemigo.miniJefe) {
            tipoCofre = Math.random() < 0.50 ? "dorado" : "hierro";
          } else if (zOrd >= 10 || eraJefe) {
            tipoCofre = Math.random() < 0.60 ? "hierro" : "madera";
          }

          if (RL.COFRES[tipoCofre]) {
            RL.agregarCofreInventario?.(tipoCofre, 1);
            cofreGanado = { tipo: tipoCofre, ...RL.COFRES[tipoCofre] };
            log(`🎁 ¡Obtuviste un ${cofreGanado.nombre}!`, "critico");
          }
        }
      }
    } catch { }

    mostrarFinCombate("victoria", { nE, xp, mon, primeraVictoria: primeraVictoriaZona, sub, cofre: cofreGanado });
  }

  function derrota() {
    if (comprobarPasivas("recibir-muerte", { hpAntes: state.hp })) {
      guardar(state);
      actualizarHPs();
      turnoJugador = true;
      deshab(false);
      return;
    }

    if (enemigo) enemigo.terminado = true;
    SND("derrota");
    log("Has caído...", "daño");
    const monedasActuales = getMonedas();
    const perdidas = Math.floor(monedasActuales * 0.02);
    try { notifMascota?.("Derrota", `Pierdes ${perdidas} 🪙 (2% de tus monedas)`); } catch { }
    setMonedas(monedasActuales - perdidas);
    state.hp = hpMax();
    state.sangrado = 0;
    guardar(state);
    $("rpg-batalla")?.classList.add("muerto");

    mostrarFinCombate("derrota", { perdidas });
  }

  function activarVistaRpg() {
    inyectarSeccion(); inyectarNav(); if (false) {
      if (location.hash === "#rpg") {
        location.hash = "#album";
      }
      inyectarNav();
      try {
        if (typeof window.SunModal?.alert === "function") {
          window.SunModal.alert({ title: "Inicia sesión", message: "Inicia sesión con tu cuenta para acceder al modo Aventura y guardar tu progreso.", icon: "⚔️" });
        } else {
          alert("Inicia sesión para acceder al modo Aventura.");
        }
      } catch { }
      try { $("btn-open-login")?.click(); } catch { }
      return;
    }
    qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "rpg"));
    qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "rpg"));
    document.body.style.overflow = "";
  }
  let _ultimoRpgRender = 0;
  window._rpgRenderSeguro = () => {
    activarVistaRpg();
    const ahora = Date.now();
    if (ahora - _ultimoRpgRender > 250) {
      _ultimoRpgRender = ahora;
      if (tieneSesion()) render();
    }
  };
  window.addEventListener("hashchange", () => { if (location.hash === "#rpg") window._rpgRenderSeguro(); });
  document.addEventListener("click", e => {
    if (!e.target.closest('[data-view-link="rpg"]')) return;
    if (!tieneSesion()) {
      e.preventDefault();
      activarVistaRpg();
      return;
    }
    // No disparamos renders duplicados aquí, el router centralizado y hashchange se encargan
  });
  window.addEventListener("rpg:stats-cambiados", () => {
    state.hp = Math.min(state.hp, hpMax());
    guardar(state);
    actualizarBadgeObjetos();
    if ($("rpg-content") && (!enemigo || enemigo.terminado)) {
      if (!enemigo) render();
    }
  });
  window.addEventListener("rpg:loot-cambiado", () => {
    actualizarBadgeObjetos();
  });
  window.addEventListener("storage", e => {
    if (e.key === "inventario" || e.key === "rpg_loot_inv") {
      actualizarBadgeObjetos();
    }
  });
  window.addEventListener("sunad:mascota-cambiada", () => {
    state = cargar();
    if (!Array.isArray(state.zonasConquistadas)) state.zonasConquistadas = [];
    if (!state.statsBase) state.statsBase = { atk: 14, def: 5 };
    if ($("rpg-content") && !enemigo) render();
  });
  window.addEventListener("sunad:user-ready", () => {
    state = cargar();
    inyectarNav();
    if (location.hash === "#rpg") {
      activarVistaRpg();
      render();
    } else {
      render();
    }
  });
  window.addEventListener("sunad:user-logout", () => {
    inyectarNav();
    if (location.hash === "#rpg" || $("rpg")?.classList.contains("active")) {
      location.hash = "#album";
      qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "album"));
      qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "album"));
    }
  });

  function init() {
    inyectarSeccion();
    inyectarNav();
    if (tieneSesion()) {
      render();
      if (location.hash === "#rpg") activarVistaRpg();
    } else if (location.hash === "#rpg") {
      activarVistaRpg();
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
  setTimeout(() => {
    inyectarNav();
    if (location.hash === "#rpg" && !$("rpg")?.classList.contains("active")) {
      activarVistaRpg();
      if (tieneSesion()) render();
    }
  }, 300);

  function iniciarCombateDirecto(enemigoObj, zonaNombre = "Falla Astral") {
    state.zonaActual = enemigoObj.id || "caos-directo";
    state._oneshotUsado = false;
    state._segundaOportunidadUsada = false;
    state._inmuneUsado = false;
    mobHordaObjetivoIdx = null;
    guardar(state);

    const cantReliquiasPoder = contarReliquiasPoder();
    const multPoderItems = 1 + (cantReliquiasPoder * 0.02);

    const objClon = { ...enemigoObj };
    if (objClon.hpMax) objClon.hpMax = Math.round(objClon.hpMax * multPoderItems);
    if (objClon.hp) objClon.hp = Math.round(objClon.hp * multPoderItems);
    if (objClon.atk) objClon.atk = Math.round(objClon.atk * multPoderItems);

    enemigo = objClon;
    turnoJugador = false;
    overlayObjetos = false;
    buffsHeroe = [];
    buffsEnemigo = [];
    SND("blip");
    render();
    deshab(true);
    log(`⚡ ¡${enemigo.nombre} es más rápido que tú y ataca primero!`, "critico");
    setTimeout(turnoEnemigo, 700);
  }

  window.Rpg = {
    state: () => state,
    guardar: () => guardar(state),
    curarHeroe: (cantidad) => {
      const a = state.hp;
      state.hp = clamp(state.hp + cantidad, 0, hpMax());
      guardar(state);
      actualizarHPs();
      return Math.round(state.hp - a);
    },
    agregarBuffHeroe: (tipo, val, turnos, label) => {
      buffsHeroe.push({ tipo, val, turnos, label });
      renderBuffs();
    },
    enemigo: () => enemigo,
    hpMax: () => hpMax(),
    atkTotal: () => atkTotal(),
    defTotal: () => defTotal(),
    statsLoot: () => statsLoot(),
    zonas: ZONAS,
    grupos: GRUPOS,
    regiones: REGIONES,
    nombres: NOMBRES,
    spriteMapEnemigos: SPR_ENEMIGO,
    spriteMeta48: SPRITE_METADATA_48,
    renderMobAnimado,
    spriteHtml,
    biomas: REGIONES.map(reg => reg.bioma),
    abrirPopupGrupo,
    reset: () => { localStorage.removeItem(KEY()); state = def(); render(); }
  };
  window.addEventListener("beforeunload", () => {
    try {
      if (state) guardar(state);
    } catch { }
  });

  window._rpgEntrarZona = entrarZona;
  window._rpgIniciarCombateDirecto = iniciarCombateDirecto;
  window._comprobarPasivas = comprobarPasivas;

  console.log("✅ rpg.js v15 · post-game ready + balance + loadout");
})();
