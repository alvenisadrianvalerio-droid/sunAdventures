/* ============================================================
   RPG-LOOT.JS — Botín, cofres y colección (v2)
   Nuevos sprite sheets: img/rpg/loot-1.png y img/rpg/loot-2.png
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const it = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 50) return;
      setTimeout(it, 100);
    };
    return setTimeout(it, 100);
  }

  const { notifMascota, getUserId, getMonedas, setMonedas } = API;
  const $  = id => document.getElementById(String(id).replace(/^#/, ""));
  const qsa= (s, r = document) => [...r.querySelectorAll(s)];
  const rnd= (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SND= t => { try { window._snd?.(t); } catch {} };

  /* ============================================================
     SHEETS — 8×9 cada uno
     ============================================================ */
  const SHEETS = {
    loot1: { url: "img/rpg/loot-1.png", cols: 8, rows: 9 }, // Armas · Armaduras · Joyería
    loot2: { url: "img/rpg/loot-2.png", cols: 8, rows: 9 }, // Herramientas · Recursos · Pociones
    main:  {
      url:  window.SPRITE_SHEET?.url  || "img/tienda/admurin-items.png",
      cols: window.SPRITE_SHEET?.cols || 30,
      rows: window.SPRITE_SHEET?.rows || 110
    }
  };

  /* ---------- Render de icono (soporta cualquier sheet) ---------- */
  function renderIcono(item, size) {
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      const key = item.sheet || "loot1";
      const s = SHEETS[key] || SHEETS.loot1;
      const [col, row] = item.sprite;
      if (col >= 0 && col < s.cols && row >= 0 && row < s.rows) {
        const px = s.cols > 1 ? (col / (s.cols - 1)) * 100 : 50;
        const py = s.rows > 1 ? (row / (s.rows - 1)) * 100 : 50;
        const sz = size ? `width:${size};height:${size};` : "";
        return `<div class="loot-sprite" style="${sz}background-image:url('${s.url}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${px}% ${py}%"></div>`;
      }
    }
    return `<span class="loot-icono" data-icono="${item.icono || "estrella"}"></span>`;
  }

  /* ============================================================
     PERSISTENCIA
     ============================================================ */
  const KEY_LOOT  = () => "sa_rpg_loot_"  + getUserId();
  const KEY_STATS = () => "sa_rpg_stats_" + getUserId();
  const KEY_RPG   = () => "sa_rpg_"       + getUserId();
  const cargarLoot  = () => { try { return JSON.parse(localStorage.getItem(KEY_LOOT()) || "{}"); } catch { return {}; } };
  const guardarLoot = o => { try { localStorage.setItem(KEY_LOOT(), JSON.stringify(o)); } catch {} };
  const cargarStats = () => { try { return JSON.parse(localStorage.getItem(KEY_STATS()) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}'); } catch { return { atkBonus:0, defBonus:0, hpBonus:0 }; } };
  const guardarStats= o => { try { localStorage.setItem(KEY_STATS(), JSON.stringify(o)); } catch {} };
  const cargarEstado= () => { try { const r = localStorage.getItem(KEY_RPG()); return r ? JSON.parse(r) : { nivel:1, xp:0, hp:100, statsBase:{atk:10,def:3} }; } catch { return { nivel:1, xp:0, hp:100, statsBase:{atk:10,def:3} }; } };
  const guardarEstado=s => { try { localStorage.setItem(KEY_RPG(), JSON.stringify(s)); } catch {} };
  const hpMaxRpg = s => 80 + s.nivel * 20 + (cargarStats().hpBonus || 0);

  /* ============================================================
     RAREZAS / CALIDADES / COFRES
     ============================================================ */
  const RAREZAS = {
    comun:      { prob:0.55, label:"Común",      color:"#c9c9c9", glow:"rgba(201,201,201,.3)" },
    raro:       { prob:0.25, label:"Raro",       color:"#6cb8ff", glow:"rgba(108,184,255,.5)" },
    epico:      { prob:0.12, label:"Épico",      color:"#a684f0", glow:"rgba(166,132,240,.6)" },
    legendario: { prob:0.06, label:"Legendario", color:"#ffd93d", glow:"rgba(255,217,61,.7)" },
    mitico:     { prob:0.02, label:"Mítico",     color:"#ff6b9d", glow:"rgba(255,107,157,.8)" }
  };

  const CALIDADES = {
    normal:    { label:"Normal",    mult:1.0, icon:"" },
    reforzado: { label:"Reforzado", mult:1.25, icon:"⚡" },
    impecable: { label:"Impecable", mult:1.6, icon:"✨" },
    ancestral: { label:"Ancestral", mult:2.2, icon:"🔥" }
  };

  const COFRES = {
    madera: { nombre:"Cofre de Madera", precio:50,   rarBoosts:{comun:.6,raro:.28,epico:.10,legendario:.02,mitico:0},     calBoosts:{normal:.7,reforzado:.22,impecable:.07,ancestral:.01}, emoji:"📦", color:"#a0522d", cantMin:1, cantMax:2 },
    hierro: { nombre:"Cofre de Hierro", precio:150,  rarBoosts:{comun:.4,raro:.35,epico:.18,legendario:.06,mitico:.01},   calBoosts:{normal:.5,reforzado:.3,impecable:.16,ancestral:.04},  emoji:"🗃️", color:"#718093", cantMin:2, cantMax:3 },
    dorado: { nombre:"Cofre Dorado",    precio:400,  rarBoosts:{comun:.2,raro:.3,epico:.3,legendario:.16,mitico:.04},     calBoosts:{normal:.25,reforzado:.35,impecable:.28,ancestral:.12},emoji:"🏆", color:"#ffd93d", cantMin:3, cantMax:5 },
    alba:   { nombre:"Cofre del Alba",  precio:1200, rarBoosts:{comun:.05,raro:.2,epico:.35,legendario:.28,mitico:.12},   calBoosts:{normal:.05,reforzado:.2,impecable:.4,ancestral:.35},  emoji:"🌟", color:"#ff6b9d", cantMin:5, cantMax:7 }
  };

  /* ============================================================
     POOL — 100 items mapeados a los nuevos sheets
     ============================================================ */
  const POOL = [

    /* ══════════════════════════════════════════════════════════
       ESPADAS — LOOT-1 · fila 0
       ══════════════════════════════════════════════════════════ */
    { id:"espada",            nombre:"Espada de Acero",      sprite:[0,0], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"espada-fuego",      nombre:"Espada Flamígera",     sprite:[1,0], sheet:"loot1", tipo:"atk", val:7,  rar:"legendario", icono:"espada" },
    { id:"espada-hielo",      nombre:"Filo de Hielo",        sprite:[2,0], sheet:"loot1", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"cimitarra",         nombre:"Cimitarra Real",       sprite:[3,0], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"espada-ropera",     nombre:"Espada Ropera",        sprite:[4,0], sheet:"loot1", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"espada-elfica",     nombre:"Espada Élfica",        sprite:[5,0], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"espada-legend",     nombre:"Filo del Alba",        sprite:[6,0], sheet:"loot1", tipo:"atk", val:10, rar:"mitico",     icono:"espada" },
    { id:"espada-cristal",    nombre:"Espada de Cristal",    sprite:[7,0], sheet:"loot1", tipo:"atk", val:8,  rar:"legendario", icono:"espada" },

    /* DAGAS · MAZAS · HACHAS — fila 1 */
    { id:"daga",              nombre:"Daga Oxidada",         sprite:[0,1], sheet:"loot1", tipo:"atk", val:1,  rar:"comun",      icono:"espada" },
    { id:"daga-asesino",      nombre:"Daga del Asesino",     sprite:[1,1], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"daga-cristal",      nombre:"Daga Carmesí",         sprite:[2,1], sheet:"loot1", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"maza",              nombre:"Maza de Hierro",       sprite:[3,1], sheet:"loot1", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },
    { id:"martillo-hierro",   nombre:"Martillo de Hierro",   sprite:[4,1], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"hacha-guerra",      nombre:"Hacha de Guerra",      sprite:[5,1], sheet:"loot1", tipo:"atk", val:4,  rar:"raro",       icono:"espada" },
    { id:"hacha-doble",       nombre:"Hacha Doble",          sprite:[6,1], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"hacha-cristal",     nombre:"Hacha Azulada",        sprite:[7,1], sheet:"loot1", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },

    /* ARCOS Y BASTONES — fila 2 */
    { id:"arco-madera",       nombre:"Arco de Madera",       sprite:[0,2], sheet:"loot1", tipo:"atk", val:1,  rar:"comun",      icono:"espada" },
    { id:"arco-elfico",       nombre:"Arco Élfico",          sprite:[1,2], sheet:"loot1", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"arco-fuego",        nombre:"Arco Ígneo",           sprite:[2,2], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"arco-hielo",        nombre:"Arco Gélido",          sprite:[3,2], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"ballesta",          nombre:"Ballesta de Torre",    sprite:[4,2], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"baston",            nombre:"Bastón Antiguo",       sprite:[5,2], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"vara-cristal",      nombre:"Vara de Cristal",      sprite:[6,2], sheet:"loot1", tipo:"atk", val:4,  rar:"raro",       icono:"espada" },
    { id:"baculo-fuego",      nombre:"Báculo de Fuego",      sprite:[7,2], sheet:"loot1", tipo:"atk", val:7,  rar:"legendario", icono:"espada" },

    /* ORBES Y VARITAS — fila 3 */
    { id:"baston-antiguo",    nombre:"Bastón Ancestral",     sprite:[0,3], sheet:"loot1", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"baculo-cristal",    nombre:"Báculo Cristalino",    sprite:[1,3], sheet:"loot1", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"baculo-rayo",       nombre:"Báculo del Rayo",      sprite:[2,3], sheet:"loot1", tipo:"atk", val:8,  rar:"legendario", icono:"espada" },
    { id:"cetro-solar",       nombre:"Cetro Solar",          sprite:[3,3], sheet:"loot1", tipo:"atk", val:9,  rar:"legendario", icono:"espada" },
    { id:"baculo-fuego2",     nombre:"Báculo Ardiente",      sprite:[4,3], sheet:"loot1", tipo:"atk", val:7,  rar:"legendario", icono:"espada" },
    { id:"baculo-infinito",   nombre:"Báculo del Infinito",  sprite:[5,3], sheet:"loot1", tipo:"atk", val:15, rar:"mitico",     icono:"espada" },
    { id:"baculo-sombra",     nombre:"Báculo Umbrío",        sprite:[6,3], sheet:"loot1", tipo:"atk", val:10, rar:"mitico",     icono:"espada" },
    { id:"varita",            nombre:"Varita Mágica",        sprite:[7,3], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },

    /* AMULETOS Y PERGAMINOS — fila 4 */
    { id:"amuleto-sol",       nombre:"Amuleto Solar",        sprite:[0,4], sheet:"loot1", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"amuleto-azul",      nombre:"Amuleto Azul",         sprite:[1,4], sheet:"loot1", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"amuleto-rubi",      nombre:"Amuleto de Rubí",      sprite:[2,4], sheet:"loot1", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"amuleto-esmeralda", nombre:"Amuleto Esmeralda",    sprite:[3,4], sheet:"loot1", tipo:"hp",  val:40, rar:"epico",      icono:"espada" },
    { id:"pergamino-azul",    nombre:"Pergamino Arcano",     sprite:[4,4], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"nota", consumible:true },
    { id:"pergamino-rojo",    nombre:"Pergamino Ígneo",      sprite:[5,4], sheet:"loot1", tipo:"atk", val:4,  rar:"raro",       icono:"nota", consumible:true },
    { id:"pergamino-madera",  nombre:"Pergamino Rúnico",     sprite:[6,4], sheet:"loot1", tipo:"hp",  val:25, rar:"raro",       icono:"nota", consumible:true },
    { id:"pergamino-escudo",  nombre:"Pergamino Protector",  sprite:[7,4], sheet:"loot1", tipo:"def", val:5,  rar:"epico",      icono:"nota", consumible:true },

    /* ANILLOS Y CASCOS — fila 5 */
    { id:"anillo-poder",      nombre:"Anillo de Poder",      sprite:[0,5], sheet:"loot1", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"anillo-estrella",   nombre:"Anillo Estelar",       sprite:[1,5], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"anillo-silver",     nombre:"Anillo de Plata",      sprite:[2,5], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"anillo-esmeralda",  nombre:"Anillo Esmeralda",     sprite:[3,5], sheet:"loot1", tipo:"hp",  val:35, rar:"epico",      icono:"espada" },
    { id:"casco-hierro",      nombre:"Casco de Hierro",      sprite:[4,5], sheet:"loot1", tipo:"def", val:2,  rar:"raro",       icono:"espada" },
    { id:"casco-alba",        nombre:"Casco del Alba",       sprite:[5,5], sheet:"loot1", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"casco-cruz",        nombre:"Casco Cruzado",        sprite:[6,5], sheet:"loot1", tipo:"def", val:6,  rar:"legendario", icono:"espada" },
    { id:"casco-sombra",      nombre:"Casco Umbrío",         sprite:[7,5], sheet:"loot1", tipo:"def", val:7,  rar:"legendario", icono:"espada" },

    /* BOTAS Y CAPAS — fila 6 */
    { id:"botas-piel",        nombre:"Botas de Piel",        sprite:[0,6], sheet:"loot1", tipo:"def", val:2,  rar:"raro",       icono:"espada" },
    { id:"botas-silver",      nombre:"Botas de Plata",       sprite:[1,6], sheet:"loot1", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"botas-aladas",      nombre:"Botas Aladas",         sprite:[2,6], sheet:"loot1", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"botas-sombra",      nombre:"Botas Umbrías",        sprite:[3,6], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"capa-hood",         nombre:"Capucha Oscura",       sprite:[4,6], sheet:"loot1", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"capa-mago",         nombre:"Capa de Mago",         sprite:[5,6], sheet:"loot1", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"mascara",           nombre:"Máscara Blanca",       sprite:[6,6], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"capa-sombras",      nombre:"Capa de Sombras",      sprite:[7,6], sheet:"loot1", tipo:"def", val:7,  rar:"legendario", icono:"espada" },

    /* ARMADURAS Y GUANTES — fila 7 */
    { id:"coraza-cuero",      nombre:"Coraza de Cuero",      sprite:[0,7], sheet:"loot1", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"coraza-malla",      nombre:"Cota de Malla",        sprite:[1,7], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"coraza-placas",     nombre:"Coraza de Placas",     sprite:[2,7], sheet:"loot1", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"armadura-dorada",   nombre:"Armadura Dorada",      sprite:[3,7], sheet:"loot1", tipo:"def", val:8,  rar:"legendario", icono:"espada" },
    { id:"guante-cuero",      nombre:"Guante de Cuero",      sprite:[4,7], sheet:"loot1", tipo:"def", val:2,  rar:"raro",       icono:"espada" },
    { id:"guante-sombra",     nombre:"Guante Umbrío",        sprite:[5,7], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"guante-garra",      nombre:"Garra de Bestia",      sprite:[6,7], sheet:"loot1", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"guantelete",        nombre:"Guantelete de Poder",  sprite:[7,7], sheet:"loot1", tipo:"def", val:4,  rar:"epico",      icono:"espada" },

    /* COMIDA Y OBJETOS — fila 8 */
    { id:"manzana-comida",    nombre:"Manzana Fresca",       sprite:[0,8], sheet:"loot1", tipo:"hp",  val:15, rar:"comun",      consumible:true, icono:"manzana" },
    { id:"queso",             nombre:"Queso Curado",         sprite:[1,8], sheet:"loot1", tipo:"hp",  val:20, rar:"comun",      consumible:true, icono:"comida" },
    { id:"huevo",             nombre:"Huevo Frito",          sprite:[2,8], sheet:"loot1", tipo:"hp",  val:18, rar:"comun",      consumible:true, icono:"comida" },
    { id:"carne",             nombre:"Carne Asada",          sprite:[3,8], sheet:"loot1", tipo:"hp",  val:30, rar:"raro",       consumible:true, icono:"comida" },
    { id:"llave-pequena",     nombre:"Llave Menuda",         sprite:[4,8], sheet:"loot1", tipo:"hp",  val:20, rar:"raro",       icono:"llave" },
    { id:"llave-hierro",      nombre:"Llave de Hierro",      sprite:[5,8], sheet:"loot1", tipo:"hp",  val:30, rar:"epico",      icono:"llave" },
    { id:"vela",              nombre:"Vela Sagrada",         sprite:[6,8], sheet:"loot1", tipo:"hp",  val:25, rar:"raro",       consumible:true, icono:"fuego" },
    { id:"caliz-estelar",     nombre:"Cáliz Estelar",        sprite:[7,8], sheet:"loot1", tipo:"hp",  val:70, rar:"legendario", icono:"espada" },

    /* ══════════════════════════════════════════════════════════
       ESPADAS CORTAS — LOOT-2 · fila 0
       ══════════════════════════════════════════════════════════ */
    { id:"espada-corta",      nombre:"Espada Corta",         sprite:[0,0], sheet:"loot2", tipo:"atk", val:1,  rar:"comun",      icono:"espada" },
    { id:"espada-larga",      nombre:"Espada Larga",         sprite:[1,0], sheet:"loot2", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },
    { id:"espada-cruzada",    nombre:"Espada Cruzada",       sprite:[2,0], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"espada-cruzada-azul", nombre:"Espada Cruzada Azul",sprite:[3,0], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"katana",            nombre:"Katana",               sprite:[4,0], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"katana-dorada",     nombre:"Katana Dorada",        sprite:[5,0], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"sable",             nombre:"Sable Curvo",          sprite:[6,0], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"baston-simple",     nombre:"Bastón Simple",        sprite:[7,0], sheet:"loot2", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },

    /* PICOS Y DAGAS — fila 1 */
    { id:"pico",              nombre:"Pico Minero",          sprite:[0,1], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"pico-dorado",       nombre:"Pico Dorado",          sprite:[1,1], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"daga-azul",         nombre:"Daga Azul",            sprite:[2,1], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"daga-verde",        nombre:"Daga Verde",           sprite:[3,1], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"hacha",             nombre:"Hacha de Leñador",     sprite:[4,1], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"martillo-madera",   nombre:"Martillo de Madera",   sprite:[5,1], sheet:"loot2", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },
    { id:"hacha-curva",       nombre:"Hacha Curva",          sprite:[6,1], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"hacha-cristal2",    nombre:"Hacha de Cristal",     sprite:[7,1], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },

    /* MARTILLOS Y MAZAS — fila 2 */
    { id:"garrote",           nombre:"Garrote",              sprite:[0,2], sheet:"loot2", tipo:"atk", val:1,  rar:"comun",      icono:"espada" },
    { id:"martillo",          nombre:"Martillo de Guerra",   sprite:[1,2], sheet:"loot2", tipo:"atk", val:4,  rar:"raro",       icono:"espada" },
    { id:"martillo-mixto",    nombre:"Martillo Mixto",       sprite:[2,2], sheet:"loot2", tipo:"atk", val:4,  rar:"raro",       icono:"espada" },
    { id:"martillo-plata",    nombre:"Martillo de Plata",    sprite:[3,2], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"maza-azul",         nombre:"Maza Azulada",         sprite:[4,2], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"maza-naranja",      nombre:"Maza Ígnea",           sprite:[5,2], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"arco-amarillo",     nombre:"Arco Dorado",          sprite:[6,2], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"arco-oscuro",       nombre:"Arco Sombrío",         sprite:[7,2], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },

    /* BALLESTAS Y ARCOS — fila 3 */
    { id:"maza-corta",        nombre:"Maza Corta",           sprite:[0,3], sheet:"loot2", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },
    { id:"maza-azul2",        nombre:"Maza Azul",            sprite:[1,3], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"ballesta-corta",    nombre:"Ballesta Corta",       sprite:[2,3], sheet:"loot2", tipo:"atk", val:4,  rar:"epico",      icono:"espada" },
    { id:"ballesta-pesada",   nombre:"Ballesta Pesada",      sprite:[3,3], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },
    { id:"arco-ornamentado",  nombre:"Arco Ornamentado",     sprite:[4,3], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },
    { id:"arco-simple",       nombre:"Arco Simple",          sprite:[5,3], sheet:"loot2", tipo:"atk", val:2,  rar:"comun",      icono:"espada" },
    { id:"arco-curvo",        nombre:"Arco Curvo",           sprite:[6,3], sheet:"loot2", tipo:"atk", val:3,  rar:"raro",       icono:"espada" },
    { id:"arco-real",         nombre:"Arco Real",            sprite:[7,3], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },

    /* ESCUDOS Y CASCOS — fila 4 */
    { id:"escudo-madera",     nombre:"Escudo de Madera",     sprite:[0,4], sheet:"loot2", tipo:"def", val:1,  rar:"comun",      icono:"espada" },
    { id:"escudo-hierro",     nombre:"Escudo de Hierro",     sprite:[1,4], sheet:"loot2", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"escudo-torre",      nombre:"Escudo Torre",         sprite:[2,4], sheet:"loot2", tipo:"def", val:6,  rar:"epico",      icono:"espada" },
    { id:"libro-rojo",        nombre:"Grimorio Rojo",        sprite:[3,4], sheet:"loot2", tipo:"atk", val:3,  rar:"epico",      icono:"nota" },
    { id:"casco-caballero",   nombre:"Casco de Caballero",   sprite:[4,4], sheet:"loot2", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"casco-visor",       nombre:"Casco con Visor",      sprite:[5,4], sheet:"loot2", tipo:"def", val:5,  rar:"epico",      icono:"espada" },
    { id:"casco-legendario",  nombre:"Casco Alado",          sprite:[6,4], sheet:"loot2", tipo:"def", val:8,  rar:"legendario", icono:"espada" },
    { id:"casco-negro",       nombre:"Casco Negro",          sprite:[7,4], sheet:"loot2", tipo:"def", val:6,  rar:"legendario", icono:"espada" },

    /* YUNQUES Y ARMADURAS — fila 5 */
    { id:"yunque",            nombre:"Yunque de Forja",      sprite:[0,5], sheet:"loot2", tipo:"hp",  val:30, rar:"raro",       icono:"espada" },
    { id:"yunque-pequeno",    nombre:"Yunque Pequeño",       sprite:[1,5], sheet:"loot2", tipo:"hp",  val:20, rar:"comun",      icono:"espada" },
    { id:"armadura-gris",     nombre:"Armadura Gris",        sprite:[2,5], sheet:"loot2", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"armadura-azul",     nombre:"Armadura Azul",        sprite:[3,5], sheet:"loot2", tipo:"def", val:6,  rar:"legendario", icono:"espada" },
    { id:"capa-roja",         nombre:"Capa Roja",            sprite:[4,5], sheet:"loot2", tipo:"def", val:4,  rar:"epico",      icono:"espada" },
    { id:"cofre-madera",      nombre:"Cofre Pequeño",        sprite:[5,5], sheet:"loot2", tipo:"hp",  val:25, rar:"raro",       icono:"cofre" },
    { id:"capucha",           nombre:"Capucha",              sprite:[6,5], sheet:"loot2", tipo:"def", val:2,  rar:"comun",      icono:"espada" },
    { id:"calavera",          nombre:"Calavera Maldita",     sprite:[7,5], sheet:"loot2", tipo:"atk", val:5,  rar:"epico",      icono:"espada" },

    /* COLLARES Y MINERALES — fila 6 */
    { id:"collar-oro",        nombre:"Collar de Oro",        sprite:[0,6], sheet:"loot2", tipo:"hp",  val:25, rar:"raro",       icono:"espada" },
    { id:"collar-doble",      nombre:"Collar Doble",         sprite:[1,6], sheet:"loot2", tipo:"hp",  val:35, rar:"epico",      icono:"espada" },
    { id:"collar-hierro",     nombre:"Collar de Hierro",     sprite:[2,6], sheet:"loot2", tipo:"def", val:3,  rar:"raro",       icono:"espada" },
    { id:"collar-corazon",    nombre:"Collar de Corazón",    sprite:[3,6], sheet:"loot2", tipo:"hp",  val:50, rar:"legendario", icono:"espada" },
    { id:"lingote-hierro",    nombre:"Lingote de Hierro",    sprite:[4,6], sheet:"loot2", tipo:"hp",  val:20, rar:"comun",      icono:"espada" },
    { id:"lingote-oro",       nombre:"Lingote de Oro",       sprite:[5,6], sheet:"loot2", tipo:"hp",  val:40, rar:"epico",      icono:"espada" },
    { id:"tronco",            nombre:"Tronco Recio",         sprite:[6,6], sheet:"loot2", tipo:"def", val:2,  rar:"comun",      icono:"espada" },
    { id:"ramas",             nombre:"Ramas Secas",          sprite:[7,6], sheet:"loot2", tipo:"def", val:1,  rar:"comun",      icono:"espada" },

    /* MATERIALES Y COMIDA — fila 7 */
    { id:"trigo",             nombre:"Haz de Trigo",         sprite:[0,7], sheet:"loot2", tipo:"hp",  val:15, rar:"comun",      consumible:true, icono:"comida" },
    { id:"pan",               nombre:"Hogaza de Pan",        sprite:[1,7], sheet:"loot2", tipo:"hp",  val:25, rar:"comun",      consumible:true, icono:"comida" },
    { id:"muslo",             nombre:"Muslo Asado",          sprite:[2,7], sheet:"loot2", tipo:"hp",  val:35, rar:"raro",       consumible:true, icono:"comida" },
    { id:"hongo",             nombre:"Hongo Silvestre",      sprite:[3,7], sheet:"loot2", tipo:"hp",  val:18, rar:"comun",      consumible:true, icono:"girasol" },
    { id:"piedra",            nombre:"Piedra Común",         sprite:[4,7], sheet:"loot2", tipo:"def", val:1,  rar:"comun",      icono:"espada" },
    { id:"roca-marron",       nombre:"Roca Marrón",          sprite:[5,7], sheet:"loot2", tipo:"def", val:2,  rar:"comun",      icono:"espada" },
    { id:"mineral-azul",      nombre:"Mineral Azul",         sprite:[6,7], sheet:"loot2", tipo:"hp",  val:30, rar:"raro",       icono:"gema" },
    { id:"paja",              nombre:"Paca de Paja",         sprite:[7,7], sheet:"loot2", tipo:"hp",  val:15, rar:"comun",      icono:"comida" },

    /* POCIONES Y PLANTAS — fila 8 */
    { id:"pocion-azul",       nombre:"Poción Azul",          sprite:[0,8], sheet:"loot2", tipo:"hp",  val:50, rar:"epico",      consumible:true, icono:"pocion" },
    { id:"pocion-dorada",     nombre:"Poción Dorada",        sprite:[1,8], sheet:"loot2", tipo:"hp",  val:80, rar:"legendario", consumible:true, icono:"pocion" },
    { id:"hierba-verde",      nombre:"Hierba Curativa",      sprite:[2,8], sheet:"loot2", tipo:"hp",  val:20, rar:"comun",      consumible:true, icono:"raiz" },
    { id:"platano",           nombre:"Plátano",              sprite:[3,8], sheet:"loot2", tipo:"hp",  val:15, rar:"comun",      consumible:true, icono:"comida" },
    { id:"hoja-verde",        nombre:"Hoja de Rocío",        sprite:[4,8], sheet:"loot2", tipo:"hp",  val:12, rar:"comun",      consumible:true, icono:"raiz" },
    { id:"flor-roja",         nombre:"Flor de Brasa",        sprite:[5,8], sheet:"loot2", tipo:"hp",  val:18, rar:"raro",       consumible:true, icono:"girasol" },
    { id:"pluma",             nombre:"Pluma Mágica",         sprite:[6,8], sheet:"loot2", tipo:"hp",  val:40, rar:"epico",      icono:"espada" },
    { id:"daga-roja",         nombre:"Daga Carmesí",         sprite:[7,8], sheet:"loot2", tipo:"atk", val:6,  rar:"legendario", icono:"espada" },

    /* ══════════════════════════════════════════════════════════
       MÍTICOS EXTRA (para las 4 categorías top)
       ══════════════════════════════════════════════════════════ */
    { id:"orbe-creacion",     nombre:"Orbe de la Creación",  sprite:[5,3], sheet:"loot1", tipo:"atk", val:20, rar:"mitico",     icono:"gema" },
    { id:"mandoble-divino",   nombre:"Mandoble Divino",      sprite:[6,0], sheet:"loot1", tipo:"atk", val:12, rar:"mitico",     icono:"espada" },
    { id:"corona-imperial",   nombre:"Corona Imperial",      sprite:[3,7], sheet:"loot1", tipo:"def", val:12, rar:"mitico",     icono:"corona" },
    { id:"caliz-mitico",      nombre:"Cáliz de la Eternidad",sprite:[7,8], sheet:"loot1", tipo:"hp",  val:100, rar:"mitico",    icono:"espada" }
  ];

  /* ============================================================
     SORTEO
     ============================================================ */
  function sortearCon(probs) {
    const r = Math.random();
    let acc = 0;
    for (const k of Object.keys(probs)) { acc += probs[k]; if (r <= acc) return k; }
    return Object.keys(probs)[0];
  }
  const sortearRareza = b => sortearCon(b || Object.fromEntries(Object.entries(RAREZAS).map(e => [e[0], e[1].prob])));
  const sortearCalidad = b => sortearCon(b || { normal:.7, reforzado:.2, impecable:.08, ancestral:.02 });

  function sortearItem(rareza, calidad) {
    const cand = POOL.filter(p => p.rar === rareza);
    const it = cand[rnd(0, cand.length - 1)] || POOL[0];
    const cal = CALIDADES[calidad] || CALIDADES.normal;
    return { ...it, calidad, valFinal: Math.round(it.val * cal.mult) };
  }

  function sortearItemVictoria(jefe) {
    let r;
    if (jefe) {
      const x = Math.random();
      r = x < .12 ? "mitico" : x < .3 ? "legendario" : x < .6 ? "epico" : x < .85 ? "raro" : "comun";
    } else r = sortearRareza();
    return sortearItem(r, sortearCalidad());
  }

  function aplicarBonus(item) {
    if (item.consumible) return;
    const st = cargarStats();
    const v = item.valFinal || item.val;
    if (item.tipo === "atk") st.atkBonus += v;
    if (item.tipo === "def") st.defBonus += v;
    if (item.tipo === "hp")  st.hpBonus  += v;
    guardarStats(st);
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }

  function usarConsumible(id) {
    const item = POOL.find(p => p.id === id);
    if (!item || !item.consumible) return false;
    const loot = cargarLoot();
    if (!loot[id] || loot[id] <= 0) return false;
    loot[id]--;
    if (loot[id] <= 0) delete loot[id];
    guardarLoot(loot);
    renderColeccion();
    return item;
  }
  const getConsumibles = () => { const l = cargarLoot(); return POOL.filter(p => p.consumible && (l[p.id] || 0) > 0); };

  /* ============================================================
     POPUP + MODAL DETALLE
     ============================================================ */
  function mostrarPopup(item) {
    let c = $("loot-popup");
    if (!c) { c = document.createElement("div"); c.id = "loot-popup"; c.className = "loot-popup"; document.body.appendChild(c); }
    const cal = CALIDADES[item.calidad || "normal"];
    const v = item.valFinal || item.val;
    const card = document.createElement("div");
    card.className = "loot-card rar-" + item.rar;
    card.innerHTML = `<div class="loot-card-icon">${renderIcono(item, "44px")}</div><div class="loot-card-copy"><span class="loot-card-rarity">${RAREZAS[item.rar].label}${cal.icon ? " · " + cal.icon + " " + cal.label : ""}</span><span class="loot-card-name">${item.nombre}</span><span class="loot-card-bonus">+${v} ${item.tipo.toUpperCase()}</span></div>`;
    c.appendChild(card);
    if (window.hidratarIconos) window.hidratarIconos(card);
    setTimeout(() => card.remove(), 3600);
  }

  function mostrarDetalleItem(item) {
    const loot = cargarLoot();
    const cant = loot[item.id] || 0;
    const cal = CALIDADES[item.calidad || "normal"];
    const v = item.valFinal || item.val;
    let m = $("rpg-loot-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "rpg-loot-modal";
      m.className = "rpg-loot-modal";
      m.innerHTML = `<div class="rpg-loot-modal-panel"><button class="rpg-loot-modal-close">×</button><div class="rpg-loot-modal-icon"></div><div class="rpg-loot-modal-rarity"></div><h3 class="rpg-loot-modal-nombre"></h3><p class="rpg-loot-modal-desc"></p><p class="rpg-loot-modal-tipo"></p><div class="rpg-loot-modal-acciones"></div></div>`;
      document.body.appendChild(m);
      m.addEventListener("click", e => { if (e.target === m || e.target.classList.contains("rpg-loot-modal-close")) m.classList.remove("active"); });
    }
    m.querySelector(".rpg-loot-modal-panel").className = "rpg-loot-modal-panel rar-" + item.rar;
    m.querySelector(".rpg-loot-modal-icon").innerHTML = renderIcono(item, "96px");
    m.querySelector(".rpg-loot-modal-rarity").innerHTML = `${RAREZAS[item.rar].label} &nbsp;<span class="loot-cal-badge cal-${item.calidad || "normal"}">${cal.icon} ${cal.label}</span>`;
    m.querySelector(".rpg-loot-modal-nombre").textContent = item.nombre;
    m.querySelector(".rpg-loot-modal-desc").textContent = `+${v} ${item.tipo.toUpperCase()}`;
    m.querySelector(".rpg-loot-modal-tipo").textContent = item.consumible ? `Consumible · Tienes ×${cant}` : "Pasivo · bonus permanente aplicado";
    const acc = m.querySelector(".rpg-loot-modal-acciones");
    acc.innerHTML = "";
    if (item.consumible && cant > 0) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "rpg-loot-usar"; b.textContent = "🧪 Usar ahora";
      b.addEventListener("click", () => {
        const s = cargarEstado(); const hm = hpMaxRpg(s);
        if (item.tipo === "hp" || item.tipo === "def") {
          const cur = item.tipo === "hp" ? v : v * 3;
          const a = s.hp; s.hp = Math.min(hm, s.hp + cur);
          const g = Math.round(s.hp - a);
          if (g <= 0) { alert("Ya tienes la vida al máximo"); return; }
          usarConsumible(item.id); guardarEstado(s); SND("comer");
          m.classList.remove("active");
          window.dispatchEvent(new Event("rpg:stats-cambiados"));
        } else alert("Los objetos de ataque solo funcionan en batalla");
      });
      acc.appendChild(b);
    }
    const bc = document.createElement("button");
    bc.type = "button"; bc.className = "btn-secondary"; bc.textContent = "Cerrar";
    bc.addEventListener("click", () => m.classList.remove("active"));
    acc.appendChild(bc);
    m.classList.add("active");
    if (window.hidratarIconos) window.hidratarIconos(m);
  }

  /* ============================================================
     COFRES
     ============================================================ */
  function abrirCofre(tipo, cant) {
    cant = cant || 1;
    const def = COFRES[tipo]; if (!def) return;
    const cost = def.precio * cant;
    if (getMonedas() < cost) { SND("error"); notifMascota?.("Sin monedas", `Necesitas ${cost}`); return; }
    setMonedas(getMonedas() - cost);
    const n = rnd(def.cantMin, def.cantMax) * cant;
    const items = [];
    for (let i = 0; i < n; i++) items.push(sortearItem(sortearRareza(def.rarBoosts), sortearCalidad(def.calBoosts)));
    const loot = cargarLoot();
    items.forEach(it => { loot[it.id] = (loot[it.id] || 0) + 1; if (!it.consumible) aplicarBonus(it); });
    guardarLoot(loot);
    try {
      const k = "sa_rpg_cofres_" + getUserId();
      localStorage.setItem(k, String(Number(localStorage.getItem(k) || 0) + cant));
      window.dispatchEvent(new Event("sunadventures:progress"));
    } catch {}
    mostrarModalCofre(def, items);
    renderColeccion();
    const top = items.some(it => it.rar === "legendario" || it.rar === "mitico");
    SND(top ? "victoria" : "sparkle");
    notifMascota?.("¡Cofre Abierto!", `+${items.length} items del ${def.nombre}`);
  }

  function mostrarModalCofre(def, items) {
    let m = $("loot-cofre-modal");
    if (!m) { m = document.createElement("div"); m.id = "loot-cofre-modal"; m.className = "loot-cofre-modal"; document.body.appendChild(m); }
    let html = "";
    items.forEach(it => {
      const cal = CALIDADES[it.calidad || "normal"];
      const v = it.valFinal || it.val;
      html += `<div class="loot-cofre-item rar-${it.rar}"><div class="loot-cofre-item-sprite">${renderIcono(it, "48px")}</div><span class="loot-cofre-item-name">${it.nombre}</span><span class="loot-cofre-item-rar">${RAREZAS[it.rar].label}</span><span class="loot-cal-badge cal-${it.calidad || "normal"}">${cal.icon} ${cal.label}</span><span class="loot-cofre-item-val">+${v} ${it.tipo.toUpperCase()}</span></div>`;
    });
    m.innerHTML = `<div class="loot-cofre-panel"><div class="loot-cofre-header"><span class="loot-cofre-emoji" style="color:${def.color}">${def.emoji}</span><h3 class="loot-cofre-titulo">${def.nombre} Abierto</h3><button class="rpg-loot-modal-close">×</button></div><p class="loot-cofre-sub">¡Obtuviste <strong>${items.length}</strong> items!</p><div class="loot-cofre-items">${html}</div><button class="rpg-loot-usar" style="margin-top:1rem" id="btn-cerrar-cofre">¡Genial!</button></div>`;
    m.classList.add("active");
    if (window.hidratarIconos) window.hidratarIconos(m);
    m.onclick = e => { if (e.target === m || e.target.classList.contains("rpg-loot-modal-close") || e.target.id === "btn-cerrar-cofre") m.classList.remove("active"); };
  }

  /* ============================================================
     RENDER PESTAÑA OBJETOS
     ============================================================ */
  const CATS = [
    { id:"todos",    label:"Todos",     sheets:null },
    { id:"loot1",    label:"Arsenal",   sheets:["loot1"] },
    { id:"loot2",    label:"Recursos",  sheets:["loot2"] },
    { id:"consumibles", label:"Pociones", soloConsumibles:true }
  ];
  let filtro = "todos";

  function renderColeccion() {
    const c = document.querySelector('[data-rpg-panel="objetos"]');
    if (!c) return;
    const loot = cargarLoot();
    const total = Object.values(loot).reduce((a, b) => a + b, 0);
    const uniq = Object.keys(loot).length;
    const cat = CATS.find(x => x.id === filtro) || CATS[0];

    let pool = POOL;
    if (cat.sheets) pool = pool.filter(p => cat.sheets.includes(p.sheet));
    if (cat.soloConsumibles) pool = pool.filter(p => p.consumible);

    const filtros = CATS.map(x => `<button class="rpg-col-filtro ${x.id === filtro ? "active" : ""}" data-cat="${x.id}">${x.label}</button>`).join("");

    let grid = "";
    pool.forEach(p => {
      const t = loot[p.id] || 0;
      grid += `<div class="rpg-coleccion-item rar-${p.rar}${p.consumible && t ? " consumible" : ""}${t ? "" : " bloqueado"}" data-id="${p.id}" title="${t ? p.nombre + (p.consumible ? " (usable)" : "") : "???"} (${RAREZAS[p.rar].label})">${renderIcono(p)}${t ? `<span class="rpg-coleccion-cant">×${t}</span>` : ""}</div>`;
    });

    c.innerHTML = `<div class="rpg-coleccion-header"><span class="rpg-coleccion-titulo">🎒 Colección</span><span class="rpg-coleccion-count">${uniq} / ${POOL.length} · ${total} objetos</span></div><div class="rpg-col-filtros">${filtros}</div><div class="rpg-coleccion-grid">${grid}</div>`;

    if (window.hidratarIconos) window.hidratarIconos(c);
    qsa(".rpg-col-filtro", c).forEach(b => b.addEventListener("click", () => { filtro = b.dataset.cat; renderColeccion(); }));
    qsa(".rpg-coleccion-item", c).forEach(el => el.addEventListener("click", () => {
      const it = POOL.find(p => p.id === el.dataset.id);
      if (it) mostrarDetalleItem(it);
    }));
  }

  /* ============================================================
     RENDER PESTAÑA COFRES
     ============================================================ */
  function renderCofres() {
    const c = document.querySelector('[data-rpg-panel="cofres"]');
    if (!c) return;
    const grid = Object.entries(COFRES).map(([tipo, def]) => `<div class="rpg-cofre-card" data-tipo="${tipo}" style="--cofre-color:${def.color}"><span class="rpg-cofre-emoji">${def.emoji}</span><span class="rpg-cofre-nombre">${def.nombre}</span><span class="rpg-cofre-precio"><span data-icono="moneda"></span> ${def.precio}</span><button class="rpg-cofre-btn" data-tipo="${tipo}">Abrir</button></div>`).join("");
    c.innerHTML = `<div class="rpg-coleccion-header"><span class="rpg-coleccion-titulo">🎁 Cofres</span><span class="rpg-coleccion-count">Ábrelos para conseguir botín</span></div><div class="rpg-barra-cofres-grid">${grid}</div>`;
    if (window.hidratarIconos) window.hidratarIconos(c);
    qsa(".rpg-cofre-btn", c).forEach(b => b.addEventListener("click", () => {
      const t = b.dataset.tipo;
      b.classList.add("shake");
      setTimeout(() => b.classList.remove("shake"), 600);
      setTimeout(() => abrirCofre(t, 1), 300);
    }));
  }

  /* ============================================================
     EVENTOS
     ============================================================ */
  window.addEventListener("sunadventures:rpg-tab", e => {
    const t = e.detail?.tab || "zonas";
    setTimeout(() => { if (t === "objetos") renderColeccion(); else if (t === "cofres") renderCofres(); }, 0);
  });

  window.addEventListener("rpg:victoria", e => {
    const en = e.detail?.enemigo; if (!en) return;
    const prob = en.jefe ? 1 : 0.45;
    if (Math.random() > prob) return;
    const item = sortearItemVictoria(!!en.jefe);
    const loot = cargarLoot();
    loot[item.id] = (loot[item.id] || 0) + 1;
    guardarLoot(loot);
    aplicarBonus(item);
    if (item.rar === "mitico" || item.rar === "legendario") SND("victoria");
    else if (item.rar === "epico") SND("sparkle");
    else SND("moneda");
    mostrarPopup(item);
    notifMascota?.("¡Botín!", `${RAREZAS[item.rar].label}: ${item.nombre}`);
    renderColeccion();
  });

  /* ============================================================
     API PÚBLICA
     ============================================================ */
  window.RpgLoot = {
    POOL, SHEETS, RAREZAS, CALIDADES, COFRES,
    cargarLoot, guardarLoot, cargarStats, guardarStats,
    usarConsumible, getConsumibles,
    mostrarDetalleItem, mostrarPopup, renderIcono,
    renderColeccion, renderCofres, abrirCofre,
    simular: jefe => {
      const it = sortearItemVictoria(!!jefe);
      const l = cargarLoot();
      l[it.id] = (l[it.id] || 0) + 1;
      guardarLoot(l);
      aplicarBonus(it);
      mostrarPopup(it);
      renderColeccion();
      return it;
    },
    reset: () => {
      if (!confirm("¿Borrar TODO tu botín y bonus?")) return;
      localStorage.removeItem(KEY_LOOT());
      localStorage.removeItem(KEY_STATS());
      renderColeccion();
      window.dispatchEvent(new Event("rpg:stats-cambiados"));
    }
  };

  console.log("✅ rpg-loot.js v2 listo · " + POOL.length + " items · 2 sheets");
})();