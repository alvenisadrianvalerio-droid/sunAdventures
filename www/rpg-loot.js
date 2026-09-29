/* ============================================================
   RPG-LOOT.JS — Sistema de botín · 100 items · 5 rarezas · 4 calidades
   · Sprite sheet 10×10 (rpg-loot-sheet.png)
   · Sistema de cofres (madera, hierro, dorado, alba)
   · Consumibles usables en batalla o fuera
   · Modal de detalle con calidad y uso
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const intentar = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 50) return console.warn("rpg-loot.js: _TiendaAPI nunca lleg\u00f3");
      setTimeout(intentar, 100);
    };
    setTimeout(intentar, 100);
    return;
  }

  const { notifMascota, getUserId, getMonedas, setMonedas } = API;
  const $   = (id) => document.getElementById(String(id).replace(/^#/, ""));
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SND = (t) => { try { window._snd?.(t); } catch(e) {} };

  /* ============================================================
     SPRITE SHEET (10 x 10)
     ============================================================ */
  const SHEET = { url: "img/rpg/rpg-loot-sheet.png", cols: 10, rows: 10 };

  function renderIcono(item, size) {
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      const col = item.sprite[0];
      const row = item.sprite[1];
      if (col >= 0 && col < SHEET.cols && row >= 0 && row < SHEET.rows) {
        const posX = SHEET.cols > 1 ? (col / (SHEET.cols - 1)) * 100 : 50;
        const posY = SHEET.rows > 1 ? (row / (SHEET.rows - 1)) * 100 : 50;
        const sizeStyle = size ? ("width:" + size + ";height:" + size + ";") : "";
        return "<div class=\"loot-sprite\" style=\"" + sizeStyle +
          "background-image:url('" + SHEET.url + "');" +
          "background-size:" + (SHEET.cols * 100) + "% " + (SHEET.rows * 100) + "%;" +
          "background-position:" + posX + "% " + posY + "%" +
          "\"></div>";
      }
    }
    return "<span class=\"loot-icono\" data-icono=\"" + (item.icono || "estrella") + "\"></span>";
  }

  /* ============================================================
     PERSISTENCIA
     ============================================================ */
  const KEY_LOOT  = () => "sa_rpg_loot_" + getUserId();
  const KEY_STATS = () => "sa_rpg_stats_" + getUserId();
  const KEY_RPG   = () => "sa_rpg_" + getUserId();

  const cargarLoot    = () => { try { return JSON.parse(localStorage.getItem(KEY_LOOT()) || "{}"); } catch(e) { return {}; } };
  const guardarLoot   = (o) => { try { localStorage.setItem(KEY_LOOT(), JSON.stringify(o)); } catch(e) {} };
  const cargarStats   = () => { try { return JSON.parse(localStorage.getItem(KEY_STATS()) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}'); } catch(e) { return { atkBonus: 0, defBonus: 0, hpBonus: 0 }; } };
  const guardarStats  = (o) => { try { localStorage.setItem(KEY_STATS(), JSON.stringify(o)); } catch(e) {} };
  const cargarEstadoRpg = () => {
    try {
      const r = localStorage.getItem(KEY_RPG());
      return r ? JSON.parse(r) : { nivel: 1, xp: 0, hp: 100, statsBase: { atk: 10, def: 3 } };
    } catch(e) { return { nivel: 1, xp: 0, hp: 100, statsBase: { atk: 10, def: 3 } }; }
  };
  const guardarEstadoRpg = (s) => { try { localStorage.setItem(KEY_RPG(), JSON.stringify(s)); } catch(e) {} };
  const hpMaxRpg = (state) => 80 + state.nivel * 20 + (cargarStats().hpBonus || 0);

  /* ============================================================
     RAREZAS (5 niveles)
     ============================================================ */
  const RAREZAS = {
    comun:      { prob: 0.55, label: "Com\u00fan",      color: "#c9c9c9", glow: "rgba(201,201,201,.3)" },
    raro:       { prob: 0.25, label: "Raro",       color: "#6cb8ff", glow: "rgba(108,184,255,.5)" },
    epico:      { prob: 0.12, label: "\u00c9pico",      color: "#a684f0", glow: "rgba(166,132,240,.6)" },
    legendario: { prob: 0.06, label: "Legendario", color: "#ffd93d", glow: "rgba(255,217,61,.7)"  },
    mitico:     { prob: 0.02, label: "M\u00edtico",     color: "#ff6b9d", glow: "rgba(255,107,157,.8)" }
  };

  /* ============================================================
     CALIDADES (multiplicador de val)
     ============================================================ */
  const CALIDADES = {
    normal:    { label: "Normal",    mult: 1.0,  icon: ""   },
    reforzado: { label: "Reforzado", mult: 1.25, icon: "\u26a1" },
    impecable: { label: "Impecable", mult: 1.6,  icon: "\u2728" },
    ancestral: { label: "Ancestral", mult: 2.2,  icon: "\ud83d\udd25" }
  };

  /* ============================================================
     COFRES (4 tipos)
     ============================================================ */
  const COFRES = {
    madera: {
      nombre: "Cofre de Madera",  precio: 50,
      rarBoosts: { comun: 0.60, raro: 0.28, epico: 0.10, legendario: 0.02, mitico: 0.00 },
      calBoosts:  { normal: 0.70, reforzado: 0.22, impecable: 0.07, ancestral: 0.01 },
      emoji: "\ud83d\udce6", color: "#a0522d", cantMin: 1, cantMax: 2
    },
    hierro: {
      nombre: "Cofre de Hierro",  precio: 150,
      rarBoosts: { comun: 0.40, raro: 0.35, epico: 0.18, legendario: 0.06, mitico: 0.01 },
      calBoosts:  { normal: 0.50, reforzado: 0.30, impecable: 0.16, ancestral: 0.04 },
      emoji: "\ud83d\uddc3\ufe0f", color: "#718093", cantMin: 2, cantMax: 3
    },
    dorado: {
      nombre: "Cofre Dorado",     precio: 400,
      rarBoosts: { comun: 0.20, raro: 0.30, epico: 0.30, legendario: 0.16, mitico: 0.04 },
      calBoosts:  { normal: 0.25, reforzado: 0.35, impecable: 0.28, ancestral: 0.12 },
      emoji: "\ud83c\udfc6", color: "#ffd93d", cantMin: 3, cantMax: 5
    },
    alba: {
      nombre: "Cofre del Alba",   precio: 1200,
      rarBoosts: { comun: 0.05, raro: 0.20, epico: 0.35, legendario: 0.28, mitico: 0.12 },
      calBoosts:  { normal: 0.05, reforzado: 0.20, impecable: 0.40, ancestral: 0.35 },
      emoji: "\ud83c\udf1f", color: "#ff6b9d", cantMin: 5, cantMax: 7
    }
  };

  /* ============================================================
     POOL DE 100 ITEMS
     ROW 0: Hierbas y Plantas
     ROW 1: Pociones y Elixires
     ROW 2: Libros, Tomos y Pergaminos
     ROW 3: Gemas y Cristales
     ROW 4: Dagas y Espadas Ligeras
     ROW 5: Armas Pesadas, Hachas y Lanzas
     ROW 6: Armas a Distancia y Baculos
     ROW 7: Escudos y Armaduras
     ROW 8: Joyeria y Amuletos
     ROW 9: Cofres, Llaves y Reliquias
     ============================================================ */
  const POOL = [
    /* ROW 0 — Hierbas y Plantas */
    { id:"hoja-verde",        nombre:"Hoja de Roc\u00edo",         sprite:[0,0], tipo:"hp",  val:8,   rar:"comun",      consumible:true,  icono:"raiz"    },
    { id:"flor-roja",         nombre:"Flor de Brasa",          sprite:[1,0], tipo:"hp",  val:12,  rar:"comun",      consumible:true,  icono:"girasol" },
    { id:"hongo",             nombre:"Hongo Lunar",             sprite:[2,0], tipo:"hp",  val:18,  rar:"raro",       consumible:true,  icono:"girasol" },
    { id:"hongo-dorado",      nombre:"Hongo Dorado",            sprite:[3,0], tipo:"hp",  val:22,  rar:"raro",       consumible:true,  icono:"girasol" },
    { id:"raiz-mandinga",     nombre:"Ra\u00edz Mandinga",          sprite:[4,0], tipo:"atk", val:5,   rar:"raro",       consumible:true,  icono:"raiz"    },
    { id:"orquidea-hielo",    nombre:"Orqu\u00eddea Hielo",         sprite:[5,0], tipo:"hp",  val:30,  rar:"epico",      consumible:true,  icono:"girasol" },
    { id:"baya-solar",        nombre:"Baya Solar",              sprite:[6,0], tipo:"hp",  val:20,  rar:"raro",       consumible:true,  icono:"manzana" },
    { id:"tallo-espina",      nombre:"Tallo Espina",            sprite:[7,0], tipo:"atk", val:8,   rar:"epico",      consumible:true,  icono:"raiz"    },
    { id:"semilla-vida",      nombre:"Semilla de Vida",         sprite:[8,0], tipo:"hp",  val:50,  rar:"legendario", consumible:true,  icono:"girasol" },
    { id:"loto-eter",         nombre:"Loto Et\u00e9reo",            sprite:[9,0], tipo:"hp",  val:80,  rar:"mitico",     consumible:true,  icono:"girasol" },

    /* ROW 1 — Pociones y Elixires */
    { id:"pocion-roja",       nombre:"Poci\u00f3n Menor",           sprite:[0,1], tipo:"hp",  val:25,  rar:"comun",      consumible:true,  icono:"pocion"    },
    { id:"pocion-azul",       nombre:"Poci\u00f3n Arcana",          sprite:[1,1], tipo:"atk", val:10,  rar:"raro",       consumible:true,  icono:"pocion"    },
    { id:"pocion-morada",     nombre:"Elixir Arcano",           sprite:[2,1], tipo:"hp",  val:40,  rar:"epico",      consumible:true,  icono:"pocionAmor"},
    { id:"pocion-dorada",     nombre:"Elixir Dorado",           sprite:[3,1], tipo:"hp",  val:60,  rar:"epico",      consumible:true,  icono:"pocion"    },
    { id:"pocion-verde",      nombre:"Ant\u00eddoto Verde",         sprite:[4,1], tipo:"def", val:8,   rar:"raro",       consumible:true,  icono:"pocion"    },
    { id:"pocion-naranja",    nombre:"Esencia Naranja",         sprite:[5,1], tipo:"atk", val:15,  rar:"epico",      consumible:true,  icono:"pocion"    },
    { id:"pocion-blanca",     nombre:"Leche Lunar",             sprite:[6,1], tipo:"hp",  val:35,  rar:"raro",       consumible:true,  icono:"pocion"    },
    { id:"elixir-dragon",     nombre:"Elixir de Drag\u00f3n",      sprite:[7,1], tipo:"atk", val:25,  rar:"legendario", consumible:true,  icono:"pocion"    },
    { id:"frasco-vacio",      nombre:"Frasco de Sombra",        sprite:[8,1], tipo:"def", val:12,  rar:"epico",      consumible:true,  icono:"pocion"    },
    { id:"lagrima-hada",      nombre:"L\u00e1grima de Hada",       sprite:[9,1], tipo:"hp",  val:100, rar:"mitico",     consumible:true,  icono:"pocionAmor"},

    /* ROW 2 — Libros, Tomos y Pergaminos */
    { id:"libro-verde",       nombre:"Tomo Olvidado",           sprite:[0,2], tipo:"atk", val:2,   rar:"raro"      },
    { id:"libro-rojo",        nombre:"Grimorio \u00cdgneo",          sprite:[1,2], tipo:"atk", val:3,   rar:"epico"     },
    { id:"libro-azul",        nombre:"C\u00f3dice de Hielo",       sprite:[2,2], tipo:"def", val:2,   rar:"epico"     },
    { id:"libro-morado",      nombre:"Volumen de Sombras",      sprite:[3,2], tipo:"atk", val:4,   rar:"legendario"},
    { id:"libro-dorado",      nombre:"Biblia del Alba",         sprite:[4,2], tipo:"atk", val:6,   rar:"legendario"},
    { id:"pergamino-rayo",    nombre:"Pergamino del Rayo",      sprite:[5,2], tipo:"atk", val:5,   rar:"epico"     },
    { id:"pergamino-fuego",   nombre:"Pergamino de Fuego",      sprite:[6,2], tipo:"atk", val:4,   rar:"raro"      },
    { id:"pergamino-escudo",  nombre:"Pergamino Escudo",        sprite:[7,2], tipo:"def", val:5,   rar:"epico"     },
    { id:"mapa-antiguo",      nombre:"Mapa Ancestral",          sprite:[8,2], tipo:"hp",  val:40,  rar:"legendario"},
    { id:"runa-ancestral",    nombre:"Runa Ancestral",          sprite:[9,2], tipo:"atk", val:10,  rar:"mitico"    },

    /* ROW 3 — Gemas y Cristales */
    { id:"gema-verde",        nombre:"Jade Menuda",             sprite:[0,3], tipo:"def", val:1,   rar:"comun"     },
    { id:"gema-azul",         nombre:"Zafiro Pulido",           sprite:[1,3], tipo:"def", val:2,   rar:"raro"      },
    { id:"gema-roja",         nombre:"Rub\u00ed Ardiente",         sprite:[2,3], tipo:"atk", val:2,   rar:"raro"      },
    { id:"gema-morada",       nombre:"Amatista Oscura",         sprite:[3,3], tipo:"atk", val:3,   rar:"epico"     },
    { id:"gema-dorada",       nombre:"Topacio Real",            sprite:[4,3], tipo:"hp",  val:30,  rar:"epico"     },
    { id:"diamante-estrella", nombre:"Diamante Estelar",        sprite:[5,3], tipo:"atk", val:5,   rar:"legendario"},
    { id:"esmeralda-lagrima", nombre:"Esmeralda L\u00e1grima",    sprite:[6,3], tipo:"def", val:4,   rar:"legendario"},
    { id:"cristal-hielo",     nombre:"Cristal de Hielo",        sprite:[7,3], tipo:"def", val:6,   rar:"legendario"},
    { id:"obsidiana-viva",    nombre:"Obsidiana Viva",          sprite:[8,3], tipo:"atk", val:8,   rar:"legendario"},
    { id:"perla-mar",         nombre:"Perla del Mar Vivo",      sprite:[9,3], tipo:"hp",  val:60,  rar:"mitico"    },

    /* ROW 4 — Dagas y Espadas Ligeras */
    { id:"daga",              nombre:"Daga Oxidada",            sprite:[0,4], tipo:"atk", val:1,   rar:"comun"     },
    { id:"daga-asesino",      nombre:"Daga del Asesino",        sprite:[1,4], tipo:"atk", val:3,   rar:"raro"      },
    { id:"daga-cristal",      nombre:"Daga Cristalina",         sprite:[2,4], tipo:"atk", val:4,   rar:"epico"     },
    { id:"cimitarra",         nombre:"Cimitarra Dorada",        sprite:[3,4], tipo:"atk", val:3,   rar:"raro"      },
    { id:"espada",            nombre:"Espada de Acero",         sprite:[4,4], tipo:"atk", val:3,   rar:"raro"      },
    { id:"espada-ropera",     nombre:"Espada Ropera",           sprite:[5,4], tipo:"atk", val:4,   rar:"epico"     },
    { id:"katana",            nombre:"Katana Forjada",          sprite:[6,4], tipo:"atk", val:5,   rar:"epico"     },
    { id:"espada-hielo",      nombre:"Filo de Hielo",           sprite:[7,4], tipo:"atk", val:6,   rar:"legendario"},
    { id:"espada-fuego",      nombre:"Espada Flam\u00edgera",      sprite:[8,4], tipo:"atk", val:7,   rar:"legendario"},
    { id:"espada-legend",     nombre:"Filo del Alba",           sprite:[9,4], tipo:"atk", val:10,  rar:"mitico"    },

    /* ROW 5 — Armas Pesadas, Hachas y Lanzas */
    { id:"hacha",             nombre:"Hacha de Hierro",         sprite:[0,5], tipo:"atk", val:2,   rar:"comun"     },
    { id:"hacha-guerra",      nombre:"Hacha de Guerra",         sprite:[1,5], tipo:"atk", val:4,   rar:"raro"      },
    { id:"martillo-hierro",   nombre:"Martillo de Hierro",      sprite:[2,5], tipo:"atk", val:3,   rar:"raro"      },
    { id:"martillo-trueno",   nombre:"Martillo del Trueno",     sprite:[3,5], tipo:"atk", val:7,   rar:"legendario"},
    { id:"lanza-acero",       nombre:"Lanza de Acero",          sprite:[4,5], tipo:"atk", val:3,   rar:"raro"      },
    { id:"tridente",          nombre:"Tridente Marino",         sprite:[5,5], tipo:"atk", val:5,   rar:"epico"     },
    { id:"alabarda",          nombre:"Alabarda Real",           sprite:[6,5], tipo:"atk", val:6,   rar:"epico"     },
    { id:"guadana",           nombre:"Guada\u00f1a Oscura",        sprite:[7,5], tipo:"atk", val:6,   rar:"legendario"},
    { id:"garrote-puas",      nombre:"Garrote con P\u00faas",     sprite:[8,5], tipo:"atk", val:4,   rar:"epico"     },
    { id:"mandoble-divino",   nombre:"Mandoble Divino",         sprite:[9,5], tipo:"atk", val:12,  rar:"mitico"    },

    /* ROW 6 — Armas a Distancia y Baculos */
    { id:"arco-madera",       nombre:"Arco de Madera",          sprite:[0,6], tipo:"atk", val:1,   rar:"comun"     },
    { id:"arco-elfico",       nombre:"Arco \u00c9lfico",             sprite:[1,6], tipo:"atk", val:4,   rar:"epico"     },
    { id:"ballesta",          nombre:"Ballesta de Torre",       sprite:[2,6], tipo:"atk", val:5,   rar:"epico"     },
    { id:"flecha-dorada",     nombre:"Flecha Dorada",           sprite:[3,6], tipo:"atk", val:3,   rar:"raro",       consumible:true },
    { id:"baston",            nombre:"Bast\u00f3n Antiguo",         sprite:[4,6], tipo:"atk", val:5,   rar:"epico"     },
    { id:"vara-cristal",      nombre:"Vara de Cristal",         sprite:[5,6], tipo:"atk", val:4,   rar:"raro"      },
    { id:"baculo-fuego",      nombre:"B\u00e1culo de Fuego",       sprite:[6,6], tipo:"atk", val:7,   rar:"legendario"},
    { id:"baculo-rayo",       nombre:"B\u00e1culo del Rayo",       sprite:[7,6], tipo:"atk", val:8,   rar:"legendario"},
    { id:"cetro-solar",       nombre:"Cetro Solar",             sprite:[8,6], tipo:"atk", val:9,   rar:"legendario"},
    { id:"baculo-infinito",   nombre:"B\u00e1culo del Infinito",   sprite:[9,6], tipo:"atk", val:15,  rar:"mitico"    },

    /* ROW 7 — Escudos y Armaduras */
    { id:"escudo-madera",     nombre:"Escudo de Madera",        sprite:[0,7], tipo:"def", val:1,   rar:"comun"     },
    { id:"escudo-hierro",     nombre:"Escudo de Hierro",        sprite:[1,7], tipo:"def", val:3,   rar:"raro"      },
    { id:"escudo-alba",       nombre:"Escudo del Alba",         sprite:[2,7], tipo:"def", val:5,   rar:"epico"     },
    { id:"escudo-torre",      nombre:"Escudo Torre",            sprite:[3,7], tipo:"def", val:6,   rar:"epico"     },
    { id:"escudo-dragon",     nombre:"Escudo Drag\u00f3n",         sprite:[4,7], tipo:"def", val:8,   rar:"legendario"},
    { id:"casco-hierro",      nombre:"Casco de Hierro",         sprite:[5,7], tipo:"def", val:2,   rar:"raro"      },
    { id:"coraza-placas",     nombre:"Coraza de Placas",        sprite:[6,7], tipo:"def", val:5,   rar:"epico"     },
    { id:"guantelete",        nombre:"Guantelete de Poder",     sprite:[7,7], tipo:"def", val:4,   rar:"epico"     },
    { id:"botas-aladas",      nombre:"Botas Aladas",            sprite:[8,7], tipo:"def", val:3,   rar:"raro"      },
    { id:"capa-sombras",      nombre:"Capa de Sombras",         sprite:[9,7], tipo:"def", val:7,   rar:"legendario"},

    /* ROW 8 — Joyeria y Amuletos */
    { id:"moneda-oro",        nombre:"Moneda Antigua",          sprite:[0,8], tipo:"hp",  val:15,  rar:"comun"     },
    { id:"saco-monedas",      nombre:"Saco de Monedas",         sprite:[1,8], tipo:"hp",  val:25,  rar:"raro"      },
    { id:"anillo-poder",      nombre:"Anillo de Poder",         sprite:[2,8], tipo:"atk", val:3,   rar:"raro"      },
    { id:"anillo-esmeralda",  nombre:"Anillo Esmeralda",        sprite:[3,8], tipo:"def", val:3,   rar:"epico"     },
    { id:"anillo-zafiro",     nombre:"Anillo Zafiro",           sprite:[4,8], tipo:"hp",  val:35,  rar:"epico"     },
    { id:"amuleto-sol",       nombre:"Amuleto Solar",           sprite:[5,8], tipo:"atk", val:6,   rar:"legendario"},
    { id:"collar-diente",     nombre:"Collar de Diente",        sprite:[6,8], tipo:"def", val:4,   rar:"raro"      },
    { id:"brazalete-oro",     nombre:"Brazalete Dorado",        sprite:[7,8], tipo:"hp",  val:45,  rar:"legendario"},
    { id:"pendientes-estrella",nombre:"Aretes Estelares",       sprite:[8,8], tipo:"atk", val:4,   rar:"epico"     },
    { id:"ojo-horus",         nombre:"Ojo de Horus",            sprite:[9,8], tipo:"atk", val:12,  rar:"mitico"    },

    /* ROW 9 — Cofres, Llaves y Reliquias */
    { id:"cofre-madera",      nombre:"Cofre de Madera",         sprite:[0,9], tipo:"hp",  val:25,  rar:"raro"      },
    { id:"cofre-hierro",      nombre:"Cofre de Hierro",         sprite:[1,9], tipo:"hp",  val:50,  rar:"epico"     },
    { id:"cofre-dorado",      nombre:"Cofre Dorado",            sprite:[2,9], tipo:"hp",  val:80,  rar:"legendario"},
    { id:"llave-antigua",     nombre:"Llave Antigua",           sprite:[3,9], tipo:"hp",  val:20,  rar:"raro"      },
    { id:"llave-dorada",      nombre:"Llave Dorada",            sprite:[4,9], tipo:"hp",  val:40,  rar:"epico"     },
    { id:"corona-plata",      nombre:"Corona de Plata",         sprite:[5,9], tipo:"def", val:3,   rar:"epico"     },
    { id:"corona-oro",        nombre:"Corona Dorada",           sprite:[6,9], tipo:"def", val:5,   rar:"legendario"},
    { id:"caliz-estelar",     nombre:"C\u00e1liz Estelar",         sprite:[7,9], tipo:"hp",  val:70,  rar:"legendario"},
    { id:"reliquia",          nombre:"Reliquia Perdida",        sprite:[8,9], tipo:"def", val:4,   rar:"legendario"},
    { id:"orbe-creacion",     nombre:"Orbe de la Creaci\u00f3n",  sprite:[9,9], tipo:"atk", val:20,  rar:"mitico"    }
  ];

  /* ============================================================
     SORTEO DE RAREZA / CALIDAD
     ============================================================ */
  function sortearCon(probs) {
    const r = Math.random();
    let acc = 0;
    const keys = Object.keys(probs);
    for (let i = 0; i < keys.length; i++) {
      acc += probs[keys[i]];
      if (r <= acc) return keys[i];
    }
    return keys[0];
  }

  function sortearRareza(boosts) {
    const probs = boosts || Object.fromEntries(Object.entries(RAREZAS).map(function(entry) { return [entry[0], entry[1].prob]; }));
    return sortearCon(probs);
  }

  function sortearCalidad(boosts) {
    const probs = boosts || { normal: 0.70, reforzado: 0.20, impecable: 0.08, ancestral: 0.02 };
    return sortearCon(probs);
  }

  function sortearItem(rareza, calidad) {
    const candidatos = POOL.filter(function(p) { return p.rar === rareza; });
    const item = candidatos[rnd(0, candidatos.length - 1)] || POOL[0];
    const cal = CALIDADES[calidad] || CALIDADES.normal;
    return Object.assign({}, item, { calidad: calidad, valFinal: Math.round(item.val * cal.mult) });
  }

  function sortearItemVictoria(jefe) {
    var rareza;
    if (jefe) {
      const r = Math.random();
      rareza = r < 0.12 ? "mitico" : r < 0.30 ? "legendario" : r < 0.60 ? "epico" : r < 0.85 ? "raro" : "comun";
    } else {
      rareza = sortearRareza(null);
    }
    return sortearItem(rareza, sortearCalidad(null));
  }

  /* ============================================================
     APLICAR BONUS PERMANENTE
     ============================================================ */
  function aplicarBonus(item) {
    if (item.consumible) return;
    const stats = cargarStats();
    const val = item.valFinal || item.val;
    if (item.tipo === "atk") stats.atkBonus += val;
    if (item.tipo === "def") stats.defBonus += val;
    if (item.tipo === "hp")  stats.hpBonus  += val;
    guardarStats(stats);
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }

  /* ============================================================
     CONSUMIBLES
     ============================================================ */
  function usarConsumible(id) {
    const item = POOL.find(function(p) { return p.id === id; });
    if (!item || !item.consumible) return false;
    const loot = cargarLoot();
    if (!loot[id] || loot[id] <= 0) return false;
    loot[id]--;
    if (loot[id] <= 0) delete loot[id];
    guardarLoot(loot);
    renderColeccion();
    return item;
  }

  function getConsumibles() {
    const loot = cargarLoot();
    return POOL.filter(function(p) { return p.consumible && (loot[p.id] || 0) > 0; });
  }

  /* ============================================================
     POPUP DE BOTIN
     ============================================================ */
  function mostrarPopup(item) {
    let cont = $("loot-popup");
    if (!cont) {
      cont = document.createElement("div");
      cont.id = "loot-popup";
      cont.className = "loot-popup";
      document.body.appendChild(cont);
    }
    const cal = CALIDADES[item.calidad || "normal"];
    const valShow = item.valFinal || item.val;
    const card = document.createElement("div");
    card.className = "loot-card rar-" + item.rar;
    card.innerHTML =
      "<div class=\"loot-card-icon\">" + renderIcono(item, "44px") + "</div>" +
      "<div class=\"loot-card-copy\">" +
        "<span class=\"loot-card-rarity\">" + RAREZAS[item.rar].label + (cal.icon ? " \u00b7 " + cal.icon + " " + cal.label : "") + "</span>" +
        "<span class=\"loot-card-name\">" + item.nombre + "</span>" +
        "<span class=\"loot-card-bonus\">+" + valShow + " " + item.tipo.toUpperCase() + "</span>" +
      "</div>";
    cont.appendChild(card);
    if (typeof window.hidratarIconos === "function") window.hidratarIconos(card);
    setTimeout(function() { card.remove(); }, 3600);
  }

  /* ============================================================
     MODAL DE DETALLE
     ============================================================ */
  function mostrarDetalleItem(item) {
    const loot = cargarLoot();
    const cantidad = loot[item.id] || 0;
    const cal = CALIDADES[item.calidad || "normal"];
    const valShow = item.valFinal || item.val;

    let modal = $("rpg-loot-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "rpg-loot-modal";
      modal.className = "rpg-loot-modal";
      modal.innerHTML =
        "<div class=\"rpg-loot-modal-panel\">" +
          "<button class=\"rpg-loot-modal-close\" aria-label=\"Cerrar\">\u00d7</button>" +
          "<div class=\"rpg-loot-modal-icon\"></div>" +
          "<div class=\"rpg-loot-modal-rarity\"></div>" +
          "<h3 class=\"rpg-loot-modal-nombre\"></h3>" +
          "<p class=\"rpg-loot-modal-desc\"></p>" +
          "<p class=\"rpg-loot-modal-tipo\"></p>" +
          "<div class=\"rpg-loot-modal-acciones\"></div>" +
        "</div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e) {
        if (e.target === modal || e.target.classList.contains("rpg-loot-modal-close"))
          modal.classList.remove("active");
      });
    }

    const panel = modal.querySelector(".rpg-loot-modal-panel");
    panel.className = "rpg-loot-modal-panel rar-" + item.rar;
    modal.querySelector(".rpg-loot-modal-icon").innerHTML = renderIcono(item, "96px");
    modal.querySelector(".rpg-loot-modal-rarity").innerHTML =
      RAREZAS[item.rar].label + " &nbsp;<span class=\"loot-cal-badge cal-" + (item.calidad || "normal") + "\">" + cal.icon + " " + cal.label + "</span>";
    modal.querySelector(".rpg-loot-modal-nombre").textContent = item.nombre;
    modal.querySelector(".rpg-loot-modal-desc").textContent = "+" + valShow + " " + item.tipo.toUpperCase();
    modal.querySelector(".rpg-loot-modal-tipo").textContent = item.consumible
      ? "Consumible \u00b7 se gasta al usar \u00b7 Tienes \u00d7" + cantidad
      : "Pasivo \u00b7 bonus permanente ya aplicado";

    const acciones = modal.querySelector(".rpg-loot-modal-acciones");
    acciones.innerHTML = "";

    if (item.consumible && cantidad > 0) {
      const btnUsar = document.createElement("button");
      btnUsar.type = "button";
      btnUsar.className = "rpg-loot-usar";
      btnUsar.textContent = "\ud83e\uddea Usar ahora";
      btnUsar.addEventListener("click", function() {
        const state = cargarEstadoRpg();
        const hpMax = hpMaxRpg(state);
        if (item.tipo === "hp" || item.tipo === "def") {
          const curacion = item.tipo === "hp" ? valShow : valShow * 3;
          const antes = state.hp;
          state.hp = Math.min(hpMax, state.hp + curacion);
          const ganado = Math.round(state.hp - antes);
          if (ganado <= 0) { alert("Ya tienes la vida al m\u00e1ximo"); return; }
          usarConsumible(item.id);
          guardarEstadoRpg(state);
          SND("comer");
          modal.classList.remove("active");
          window.dispatchEvent(new Event("rpg:stats-cambiados"));
        } else if (item.tipo === "atk") {
          alert("Los objetos de ataque solo funcionan en batalla");
        }
      });
      acciones.appendChild(btnUsar);
    }

    const btnCerrar = document.createElement("button");
    btnCerrar.type = "button";
    btnCerrar.className = "btn-secondary";
    btnCerrar.textContent = "Cerrar";
    btnCerrar.addEventListener("click", function() { modal.classList.remove("active"); });
    acciones.appendChild(btnCerrar);

    modal.classList.add("active");
    if (typeof window.hidratarIconos === "function") window.hidratarIconos(modal);
  }

  /* ============================================================
     SISTEMA DE COFRES
     ============================================================ */
  function abrirCofre(tipo, cant) {
    cant = cant || 1;
    const cofreDef = COFRES[tipo];
    if (!cofreDef) return;
    const coste = cofreDef.precio * cant;
    if (getMonedas() < coste) {
      SND("error");
      if (typeof notifMascota === "function") notifMascota("Sin monedas", "Necesitas " + coste + " monedas");
      return;
    }
    setMonedas(getMonedas() - coste);

    const numItems = rnd(cofreDef.cantMin, cofreDef.cantMax) * cant;
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const rareza  = sortearRareza(cofreDef.rarBoosts);
      const calidad = sortearCalidad(cofreDef.calBoosts);
      items.push(sortearItem(rareza, calidad));
    }

    const loot = cargarLoot();
    items.forEach(function(it) {
      loot[it.id] = (loot[it.id] || 0) + 1;
      if (!it.consumible) aplicarBonus(it);
    });
    guardarLoot(loot);

    mostrarModalCofre(cofreDef, items);
    renderColeccion();

    const hasTop = items.some(function(it) { return it.rar === "legendario" || it.rar === "mitico"; });
    SND(hasTop ? "victoria" : "sparkle");
    if (typeof notifMascota === "function") notifMascota("\u00a1Cofre Abierto!", "+" + items.length + " items del " + cofreDef.nombre);
  }

  function mostrarModalCofre(cofreDef, items) {
    let modal = $("loot-cofre-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "loot-cofre-modal";
      modal.className = "loot-cofre-modal";
      document.body.appendChild(modal);
    }

    let itemsHTML = "";
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const cal = CALIDADES[it.calidad || "normal"];
      const valShow = it.valFinal || it.val;
      itemsHTML +=
        "<div class=\"loot-cofre-item rar-" + it.rar + "\">" +
          "<div class=\"loot-cofre-item-sprite\">" + renderIcono(it, "48px") + "</div>" +
          "<span class=\"loot-cofre-item-name\">" + it.nombre + "</span>" +
          "<span class=\"loot-cofre-item-rar\">" + RAREZAS[it.rar].label + "</span>" +
          "<span class=\"loot-cal-badge cal-" + (it.calidad || "normal") + "\">" + cal.icon + " " + cal.label + "</span>" +
          "<span class=\"loot-cofre-item-val\">+" + valShow + " " + it.tipo.toUpperCase() + "</span>" +
        "</div>";
    }

    modal.innerHTML =
      "<div class=\"loot-cofre-panel\">" +
        "<div class=\"loot-cofre-header\">" +
          "<span class=\"loot-cofre-emoji\" style=\"color:" + cofreDef.color + "\">" + cofreDef.emoji + "</span>" +
          "<h3 class=\"loot-cofre-titulo\">" + cofreDef.nombre + " Abierto</h3>" +
          "<button class=\"rpg-loot-modal-close\" aria-label=\"Cerrar\">\u00d7</button>" +
        "</div>" +
        "<p class=\"loot-cofre-sub\">\u00a1Obtuviste <strong>" + items.length + "</strong> items!</p>" +
        "<div class=\"loot-cofre-items\">" + itemsHTML + "</div>" +
        "<button class=\"rpg-loot-usar\" style=\"margin-top:1rem\" id=\"btn-cerrar-cofre\">\u00a1Genial!</button>" +
      "</div>";

    modal.classList.add("active");
    if (typeof window.hidratarIconos === "function") window.hidratarIconos(modal);

    function cerrarModal() { modal.classList.remove("active"); }
    modal.onclick = function(e) {
      if (e.target === modal || e.target.classList.contains("rpg-loot-modal-close") || e.target.id === "btn-cerrar-cofre")
        cerrarModal();
    };
  }

  /* ============================================================
     BARRA DE COFRES
     ============================================================ */
  function inyectarBarraCofres() {
    if ($("rpg-barra-cofres")) return;
    const cont = $("rpg-coleccion");
    if (!cont) return;

    const barra = document.createElement("div");
    barra.id = "rpg-barra-cofres";
    barra.className = "rpg-barra-cofres";

    let gridHTML = "";
    const tiposCofre = Object.keys(COFRES);
    for (let i = 0; i < tiposCofre.length; i++) {
      const tipo = tiposCofre[i];
      const def = COFRES[tipo];
      gridHTML +=
        "<div class=\"rpg-cofre-card\" data-tipo=\"" + tipo + "\" style=\"--cofre-color:" + def.color + "\">" +
          "<span class=\"rpg-cofre-emoji\">" + def.emoji + "</span>" +
          "<span class=\"rpg-cofre-nombre\">" + def.nombre + "</span>" +
          "<span class=\"rpg-cofre-precio\"><span data-icono=\"moneda\"></span> " + def.precio + "</span>" +
          "<button class=\"rpg-cofre-btn\" data-tipo=\"" + tipo + "\">Abrir</button>" +
        "</div>";
    }

    barra.innerHTML =
      "<div class=\"rpg-barra-cofres-titulo\">\ud83c\udf81 Cofres</div>" +
      "<div class=\"rpg-barra-cofres-grid\">" + gridHTML + "</div>";

    cont.parentNode.insertBefore(barra, cont);
    if (typeof window.hidratarIconos === "function") window.hidratarIconos(barra);

    qsa(".rpg-cofre-btn", barra).forEach(function(btn) {
      btn.addEventListener("click", function() {
        const tipo = btn.dataset.tipo;
        btn.classList.add("shake");
        setTimeout(function() { btn.classList.remove("shake"); }, 600);
        setTimeout(function() { abrirCofre(tipo, 1); }, 300);
      });
    });
  }

  /* ============================================================
     PANEL DE COLECCION CON FILTROS
     ============================================================ */
  const CATEGORIAS_COLECCION = [
    { id: "todos",    label: "Todos",    rows: null },
    { id: "plantas",  label: "Plantas",  rows: [0] },
    { id: "pociones", label: "Pociones", rows: [1] },
    { id: "libros",   label: "Libros",   rows: [2] },
    { id: "gemas",    label: "Gemas",    rows: [3] },
    { id: "armas",    label: "Armas",    rows: [4,5,6] },
    { id: "defensa",  label: "Defensa",  rows: [7] },
    { id: "joyeria",  label: "Joyer\u00eda",  rows: [8] },
    { id: "reliquias",label: "Reliquias",rows: [9] }
  ];

  let filtroColeccion = "todos";

  function renderColeccion() {
    const cont = $("rpg-coleccion");
    if (!cont) return;

    const loot   = cargarLoot();
    const total  = Object.values(loot).reduce(function(a, b) { return a + b; }, 0);
    const unicos = Object.keys(loot).length;

    const catActual = CATEGORIAS_COLECCION.find(function(c) { return c.id === filtroColeccion; }) || CATEGORIAS_COLECCION[0];
    const poolFiltrado = catActual.rows
      ? POOL.filter(function(p) { return catActual.rows.some(function(r) { return p.sprite[1] === r; }); })
      : POOL;

    let filtrosHTML = "";
    for (let i = 0; i < CATEGORIAS_COLECCION.length; i++) {
      const c = CATEGORIAS_COLECCION[i];
      filtrosHTML += "<button class=\"rpg-col-filtro " + (c.id === filtroColeccion ? "active" : "") + "\" data-cat=\"" + c.id + "\">" + c.label + "</button>";
    }

    let gridHTML = "";
    for (let i = 0; i < poolFiltrado.length; i++) {
      const p = poolFiltrado[i];
      const tiene = loot[p.id] || 0;
      const claseConsumible = p.consumible && tiene ? " consumible" : "";
      gridHTML +=
        "<div class=\"rpg-coleccion-item rar-" + p.rar + claseConsumible + (tiene ? "" : " bloqueado") + "\"" +
          " data-id=\"" + p.id + "\"" +
          " title=\"" + (tiene ? p.nombre + (p.consumible ? " (usable)" : "") : "???") + " (" + RAREZAS[p.rar].label + ")\"" +
          " style=\"cursor:pointer\">" +
          renderIcono(p) +
          (tiene ? "<span class=\"rpg-coleccion-cant\">\u00d7" + tiene + "</span>" : "") +
        "</div>";
    }

    cont.innerHTML =
      "<div class=\"rpg-coleccion-header\">" +
        "<span class=\"rpg-coleccion-titulo\">\ud83c\udf92 Colecci\u00f3n</span>" +
        "<span class=\"rpg-coleccion-count\">" + unicos + " / " + POOL.length + " \u00b7 " + total + " objetos</span>" +
      "</div>" +
      "<div class=\"rpg-col-filtros\">" + filtrosHTML + "</div>" +
      "<div class=\"rpg-coleccion-grid\">" + gridHTML + "</div>";

    if (typeof window.hidratarIconos === "function") window.hidratarIconos(cont);

    qsa(".rpg-col-filtro", cont).forEach(function(btn) {
      btn.addEventListener("click", function() {
        filtroColeccion = btn.dataset.cat;
        renderColeccion();
      });
    });

    qsa(".rpg-coleccion-item", cont).forEach(function(el) {
      el.addEventListener("click", function() {
        const item = POOL.find(function(p) { return p.id === el.dataset.id; });
        if (item) mostrarDetalleItem(item);
      });
    });
  }

  /* ============================================================
     INYECTAR PANEL EN EL RPG
     ============================================================ */
  function inyectarPanel() {
    const cont = $("rpg-content");
    if (!cont || $("rpg-coleccion")) return;
    const panel = document.createElement("div");
    panel.id = "rpg-coleccion";
    panel.className = "rpg-coleccion";
    cont.appendChild(panel);
    renderColeccion();
    setTimeout(inyectarBarraCofres, 100);
  }

  const obs = new MutationObserver(function() {
    if ($("rpg-content") && !$("rpg-coleccion")) inyectarPanel();
    else if ($("rpg-coleccion") && !$("rpg-barra-cofres")) inyectarBarraCofres();
  });
  obs.observe(document.body, { childList: true, subtree: true });

  setTimeout(inyectarPanel, 800);
  setTimeout(inyectarPanel, 2000);

  window.addEventListener("hashchange", function() {
    if (location.hash === "#rpg") setTimeout(renderColeccion, 100);
  });

  /* ============================================================
     HOOK: victorias del RPG
     ============================================================ */
  window.addEventListener("rpg:victoria", function(e) {
    const enemigo = e.detail && e.detail.enemigo;
    if (!enemigo) return;
    const prob = enemigo.jefe ? 1 : 0.45;
    if (Math.random() > prob) return;

    const item = sortearItemVictoria(!!enemigo.jefe);
    const loot = cargarLoot();
    loot[item.id] = (loot[item.id] || 0) + 1;
    guardarLoot(loot);
    aplicarBonus(item);

    if (item.rar === "mitico" || item.rar === "legendario") SND("victoria");
    else if (item.rar === "epico") SND("sparkle");
    else SND("moneda");

    mostrarPopup(item);
    try { if (typeof notifMascota === "function") notifMascota("\u00a1Bot\u00edn!", RAREZAS[item.rar].label + ": " + item.nombre); } catch(e2) {}
    renderColeccion();
  });

  /* ============================================================
     API PUBLICA
     ============================================================ */
  window.RpgLoot = {
    POOL: POOL, SHEET: SHEET, RAREZAS: RAREZAS, CALIDADES: CALIDADES, COFRES: COFRES,
    cargarLoot: cargarLoot, guardarLoot: guardarLoot,
    cargarStats: cargarStats, guardarStats: guardarStats,
    usarConsumible: usarConsumible, getConsumibles: getConsumibles,
    mostrarDetalleItem: mostrarDetalleItem, mostrarPopup: mostrarPopup,
    renderIcono: renderIcono, renderColeccion: renderColeccion,
    abrirCofre: abrirCofre,

    simular: function(jefe) {
      const item = sortearItemVictoria(!!jefe);
      const loot = cargarLoot();
      loot[item.id] = (loot[item.id] || 0) + 1;
      guardarLoot(loot);
      aplicarBonus(item);
      mostrarPopup(item);
      renderColeccion();
      return item;
    },

    reset: function() {
      if (!confirm("\u00bfBorrar TODO tu bot\u00edn y bonus?")) return;
      localStorage.removeItem(KEY_LOOT());
      localStorage.removeItem(KEY_STATS());
      renderColeccion();
      window.dispatchEvent(new Event("rpg:stats-cambiados"));
    }
  };

  console.log("rpg-loot.js listo - " + POOL.length + " items - 5 rarezas - 4 calidades - 4 cofres");
})();
