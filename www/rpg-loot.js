/* RPG-LOOT.JS v5 — Botín, cofres, colección y reroll */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n=0; const it=()=>{ if(window._TiendaAPI) return boot(); if(++n>50) return; setTimeout(it,100); }; return setTimeout(it,100); }
  const { notifMascota, getUserId, getMonedas, setMonedas } = API;
  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SND = t => { try { window._snd?.(t); } catch {} };
  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(window.confirm(o.title));

  /* Sheets */
  const SHEETS = {
    loot1: { url: "img/rpg/loot-1.png", cols: 8, rows: 9 },
    loot2: { url: "img/rpg/loot-2.png", cols: 8, rows: 9 },
    main:  { url: window.SPRITE_SHEET?.url || "img/tienda/admurin-items.png", cols: window.SPRITE_SHEET?.cols || 30, rows: window.SPRITE_SHEET?.rows || 110 }
  };

  function renderIcono(item, size) {
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      const s = SHEETS[item.sheet] || SHEETS.loot1;
      const [col, row] = item.sprite;
      if (col >= 0 && col < s.cols && row >= 0 && row < s.rows) {
        const px = s.cols > 1 ? (col / (s.cols - 1)) * 100 : 50;
        const py = s.rows > 1 ? (row / (s.rows - 1)) * 100 : 50;
        const sz = size ? `width:${size};height:${size};` : "";
        return `<div class="loot-sprite" style="${sz}background-image:url('${s.url}');background-size:${s.cols*100}% ${s.rows*100}%;background-position:${px}% ${py}%"></div>`;
      }
    }
    return `<span class="loot-icono" data-icono="${item.icono || "estrella"}"></span>`;
  }

  /* Persistencia */
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

  /* Rarezas / calidades / cofres */
  const RAREZAS = {
    comun:      { prob:0.62,  label:"Común",      color:"#c9c9c9", glow:"rgba(201,201,201,.3)" },
    raro:       { prob:0.24,  label:"Raro",       color:"#6cb8ff", glow:"rgba(108,184,255,.5)" },
    epico:      { prob:0.095, label:"Épico",      color:"#a684f0", glow:"rgba(166,132,240,.6)" },
    legendario: { prob:0.040, label:"Legendario", color:"#ffd93d", glow:"rgba(255,217,61,.7)" },
    mitico:     { prob:0.005, label:"Mítico",     color:"#ff6b9d", glow:"rgba(255,107,157,.8)" }
  };
  const ORDEN_RAREZAS = ["comun","raro","epico","legendario","mitico"];
  const PROB_REROLL_RAREZA = { misma:0.94, sube1:0.05, sube2:0.005, baja1:0.005 };
  const CALIDADES = {
    normal:    { label:"Normal",    mult:1.0, icon:"" },
    reforzado: { label:"Reforzado", mult:1.25, icon:"⚡" },
    impecable: { label:"Impecable", mult:1.6, icon:"✨" },
    ancestral: { label:"Ancestral", mult:2.2, icon:"🔥" }
  };
  const COFRES = {
    madera:    { nombre:"Cofre de Madera",    precio:500,    rarBoosts:{comun:.70,raro:.22,epico:.065,legendario:.013,mitico:.002}, calBoosts:{normal:.78,reforzado:.18,impecable:.035,ancestral:.005}, emoji:"📦", color:"#a0522d", cantMin:1, cantMax:2 },
    hierro:    { nombre:"Cofre de Hierro",    precio:3000,   rarBoosts:{comun:.55,raro:.30,epico:.115,legendario:.03,mitico:.005}, calBoosts:{normal:.62,reforzado:.26,impecable:.10,ancestral:.02},   emoji:"🗃️", color:"#718093", cantMin:2, cantMax:3 },
    dorado:    { nombre:"Cofre Dorado",       precio:15000,  rarBoosts:{comun:.35,raro:.35,epico:.20,legendario:.085,mitico:.015}, calBoosts:{normal:.42,reforzado:.33,impecable:.20,ancestral:.05},   emoji:"🏆", color:"#ffd93d", cantMin:3, cantMax:5 },
    alba:      { nombre:"Cofre del Alba",     precio:75000,  rarBoosts:{comun:.15,raro:.30,epico:.33,legendario:.18,mitico:.04},   calBoosts:{normal:.15,reforzado:.30,impecable:.38,ancestral:.17},   emoji:"🌟", color:"#ff6b9d", cantMin:5, cantMax:7 },
    celestial: { nombre:"Cofre Celestial",    precio:400000, rarBoosts:{comun:.03,raro:.15,epico:.35,legendario:.37,mitico:.10},    calBoosts:{normal:.05,reforzado:.15,impecable:.42,ancestral:.38},   emoji:"☀️", color:"#fff5b8", cantMin:7, cantMax:10 }
  };

  /* POOL — formato comprimido
     [id, nombre, col, row, sheet, tipo, val, rar, consumible?, icono?]
     sheet: 1=loot1 · 2=loot2
     rar: c=comun · r=raro · e=epico · l=legendario · m=mitico
     icono: esp·not·man·com·poc·lla·fue·gem·cof·cor·rai·gir */
  const _P = [
    /* loot1 — fila 0 */
    ["espada","Espada de Acero",0,0,1,"atk",3,"r"],
    ["espada-fuego","Espada Flamígera",1,0,1,"atk",7,"l"],
    ["espada-hielo","Filo de Hielo",2,0,1,"atk",6,"l"],
    ["cimitarra","Cimitarra Real",3,0,1,"atk",3,"r"],
    ["espada-ropera","Espada Ropera",4,0,1,"atk",4,"e"],
    ["espada-elfica","Espada Élfica",5,0,1,"atk",5,"e"],
    ["espada-legend","Filo del Alba",6,0,1,"atk",10,"m"],
    ["espada-cristal","Espada de Cristal",7,0,1,"atk",8,"l"],
    /* fila 1 */
    ["daga","Daga Oxidada",0,1,1,"atk",1,"c"],
    ["daga-asesino","Daga del Asesino",1,1,1,"atk",3,"r"],
    ["daga-cristal","Daga Carmesí",2,1,1,"atk",4,"e"],
    ["maza","Maza de Hierro",3,1,1,"atk",2,"c"],
    ["martillo-hierro","Martillo de Hierro",4,1,1,"atk",3,"r"],
    ["hacha-guerra","Hacha de Guerra",5,1,1,"atk",4,"r"],
    ["hacha-doble","Hacha Doble",6,1,1,"atk",5,"e"],
    ["hacha-cristal","Hacha Azulada",7,1,1,"atk",6,"l"],
    /* fila 2 */
    ["arco-madera","Arco de Madera",0,2,1,"atk",1,"c"],
    ["arco-elfico","Arco Élfico",1,2,1,"atk",4,"e"],
    ["arco-fuego","Arco Ígneo",2,2,1,"atk",5,"e"],
    ["arco-hielo","Arco Gélido",3,2,1,"atk",5,"e"],
    ["ballesta","Ballesta de Torre",4,2,1,"atk",5,"e"],
    ["baston","Bastón Antiguo",5,2,1,"atk",5,"e"],
    ["vara-cristal","Vara de Cristal",6,2,1,"atk",4,"r"],
    ["baculo-fuego","Báculo de Fuego",7,2,1,"atk",7,"l"],
    /* fila 3 */
    ["baston-antiguo","Bastón Ancestral",0,3,1,"atk",6,"l"],
    ["baculo-cristal","Báculo Cristalino",1,3,1,"atk",4,"e"],
    ["baculo-rayo","Báculo del Rayo",2,3,1,"atk",8,"l"],
    ["cetro-solar","Cetro Solar",3,3,1,"atk",9,"l"],
    ["baculo-fuego2","Báculo Ardiente",4,3,1,"atk",7,"l"],
    ["baculo-infinito","Báculo del Infinito",5,3,1,"atk",15,"m"],
    ["baculo-sombra","Báculo Umbrío",6,3,1,"atk",10,"m"],
    ["varita","Varita Mágica",7,3,1,"atk",3,"r"],
    /* fila 4 */
    ["amuleto-sol","Amuleto Solar",0,4,1,"atk",6,"l"],
    ["amuleto-azul","Amuleto Azul",1,4,1,"def",5,"e"],
    ["amuleto-rubi","Amuleto de Rubí",2,4,1,"atk",4,"e"],
    ["amuleto-esmeralda","Amuleto Esmeralda",3,4,1,"hp",40,"e"],
    ["pergamino-azul","Pergamino Arcano",4,4,1,"atk",5,"e",1,"not"],
    ["pergamino-rojo","Pergamino Ígneo",5,4,1,"atk",4,"r",1,"not"],
    ["pergamino-madera","Pergamino Rúnico",6,4,1,"hp",25,"r",1,"not"],
    ["pergamino-escudo","Pergamino Protector",7,4,1,"def",5,"e",1,"not"],
    /* fila 5 */
    ["anillo-poder","Anillo de Poder",0,5,1,"atk",3,"r"],
    ["anillo-estrella","Anillo Estelar",1,5,1,"atk",5,"e"],
    ["anillo-silver","Anillo de Plata",2,5,1,"def",4,"e"],
    ["anillo-esmeralda","Anillo Esmeralda",3,5,1,"hp",35,"e"],
    ["casco-hierro","Casco de Hierro",4,5,1,"def",2,"r"],
    ["casco-alba","Casco del Alba",5,5,1,"def",5,"e"],
    ["casco-cruz","Casco Cruzado",6,5,1,"def",6,"l"],
    ["casco-sombra","Casco Umbrío",7,5,1,"def",7,"l"],
    /* fila 6 */
    ["botas-piel","Botas de Piel",0,6,1,"def",2,"r"],
    ["botas-silver","Botas de Plata",1,6,1,"def",3,"r"],
    ["botas-aladas","Botas Aladas",2,6,1,"def",3,"r"],
    ["botas-sombra","Botas Umbrías",3,6,1,"def",4,"e"],
    ["capa-hood","Capucha Oscura",4,6,1,"def",3,"r"],
    ["capa-mago","Capa de Mago",5,6,1,"def",5,"e"],
    ["mascara","Máscara Blanca",6,6,1,"def",4,"e"],
    ["capa-sombras","Capa de Sombras",7,6,1,"def",7,"l"],
    /* fila 7 */
    ["coraza-cuero","Coraza de Cuero",0,7,1,"def",3,"r"],
    ["coraza-malla","Cota de Malla",1,7,1,"def",4,"e"],
    ["coraza-placas","Coraza de Placas",2,7,1,"def",5,"e"],
    ["armadura-dorada","Armadura Dorada",3,7,1,"def",8,"l"],
    ["guante-cuero","Guante de Cuero",4,7,1,"def",2,"r"],
    ["guante-sombra","Guante Umbrío",5,7,1,"def",4,"e"],
    ["guante-garra","Garra de Bestia",6,7,1,"atk",5,"e"],
    ["guantelete","Guantelete de Poder",7,7,1,"def",4,"e"],
    /* fila 8 */
    ["manzana-comida","Manzana Fresca",0,8,1,"hp",15,"c",1,"man"],
    ["queso","Queso Curado",1,8,1,"hp",20,"c",1,"com"],
    ["huevo","Huevo Frito",2,8,1,"hp",18,"c",1,"com"],
    ["carne","Carne Asada",3,8,1,"hp",30,"r",1,"com"],
    ["llave-pequena","Llave Menuda",4,8,1,"hp",20,"r",0,"lla"],
    ["llave-hierro","Llave de Hierro",5,8,1,"hp",30,"e",0,"lla"],
    ["vela","Vela Sagrada",6,8,1,"hp",25,"r",1,"fue"],
    ["caliz-estelar","Cáliz Estelar",7,8,1,"hp",70,"l"],
    /* loot2 — fila 0 */
    ["espada-corta","Espada Corta",0,0,2,"atk",1,"c"],
    ["espada-larga","Espada Larga",1,0,2,"atk",2,"c"],
    ["espada-cruzada","Espada Cruzada",2,0,2,"atk",3,"r"],
    ["espada-cruzada-azul","Espada Cruzada Azul",3,0,2,"atk",4,"e"],
    ["katana","Katana",4,0,2,"atk",5,"e"],
    ["katana-dorada","Katana Dorada",5,0,2,"atk",6,"l"],
    ["sable","Sable Curvo",6,0,2,"atk",4,"e"],
    ["baston-simple","Bastón Simple",7,0,2,"atk",2,"c"],
    /* fila 1 */
    ["pico","Pico Minero",0,1,2,"atk",3,"r"],
    ["pico-dorado","Pico Dorado",1,1,2,"atk",4,"e"],
    ["daga-azul","Daga Azul",2,1,2,"atk",3,"r"],
    ["daga-verde","Daga Verde",3,1,2,"atk",3,"r"],
    ["hacha","Hacha de Leñador",4,1,2,"atk",3,"r"],
    ["martillo-madera","Martillo de Madera",5,1,2,"atk",2,"c"],
    ["hacha-curva","Hacha Curva",6,1,2,"atk",4,"e"],
    ["hacha-cristal2","Hacha de Cristal",7,1,2,"atk",5,"e"],
    /* fila 2 */
    ["garrote","Garrote",0,2,2,"atk",1,"c"],
    ["martillo","Martillo de Guerra",1,2,2,"atk",4,"r"],
    ["martillo-mixto","Martillo Mixto",2,2,2,"atk",4,"r"],
    ["martillo-plata","Martillo de Plata",3,2,2,"atk",5,"e"],
    ["maza-azul","Maza Azulada",4,2,2,"atk",5,"e"],
    ["maza-naranja","Maza Ígnea",5,2,2,"atk",6,"l"],
    ["arco-amarillo","Arco Dorado",6,2,2,"atk",5,"e"],
    ["arco-oscuro","Arco Sombrío",7,2,2,"atk",6,"l"],
    /* fila 3 */
    ["maza-corta","Maza Corta",0,3,2,"atk",2,"c"],
    ["maza-azul2","Maza Azul",1,3,2,"atk",4,"e"],
    ["ballesta-corta","Ballesta Corta",2,3,2,"atk",4,"e"],
    ["ballesta-pesada","Ballesta Pesada",3,3,2,"atk",6,"l"],
    ["arco-ornamentado","Arco Ornamentado",4,3,2,"atk",5,"e"],
    ["arco-simple","Arco Simple",5,3,2,"atk",2,"c"],
    ["arco-curvo","Arco Curvo",6,3,2,"atk",3,"r"],
    ["arco-real","Arco Real",7,3,2,"atk",6,"l"],
    /* fila 4 */
    ["escudo-madera","Escudo de Madera",0,4,2,"def",1,"c"],
    ["escudo-hierro","Escudo de Hierro",1,4,2,"def",3,"r"],
    ["escudo-torre","Escudo Torre",2,4,2,"def",6,"e"],
    ["libro-rojo","Grimorio Rojo",3,4,2,"atk",3,"e",0,"not"],
    ["casco-caballero","Casco de Caballero",4,4,2,"def",5,"e"],
    ["casco-visor","Casco con Visor",5,4,2,"def",5,"e"],
    ["casco-legendario","Casco Alado",6,4,2,"def",8,"l"],
    ["casco-negro","Casco Negro",7,4,2,"def",6,"l"],
    /* fila 5 */
    ["yunque","Yunque de Forja",0,5,2,"hp",30,"r"],
    ["yunque-pequeno","Yunque Pequeño",1,5,2,"hp",20,"c"],
    ["armadura-gris","Armadura Gris",2,5,2,"def",4,"e"],
    ["armadura-azul","Armadura Azul",3,5,2,"def",6,"l"],
    ["capa-roja","Capa Roja",4,5,2,"def",4,"e"],
    ["cofre-madera","Cofre Pequeño",5,5,2,"hp",25,"r",0,"cof"],
    ["capucha","Capucha",6,5,2,"def",2,"c"],
    ["calavera","Calavera Maldita",7,5,2,"atk",5,"e"],
    /* fila 6 */
    ["collar-oro","Collar de Oro",0,6,2,"hp",25,"r"],
    ["collar-doble","Collar Doble",1,6,2,"hp",35,"e"],
    ["collar-hierro","Collar de Hierro",2,6,2,"def",3,"r"],
    ["collar-corazon","Collar de Corazón",3,6,2,"hp",50,"l"],
    ["lingote-hierro","Lingote de Hierro",4,6,2,"hp",20,"c"],
    ["lingote-oro","Lingote de Oro",5,6,2,"hp",40,"e"],
    ["tronco","Tronco Recio",6,6,2,"def",2,"c"],
    ["ramas","Ramas Secas",7,6,2,"def",1,"c"],
    /* fila 7 */
    ["trigo","Haz de Trigo",0,7,2,"hp",15,"c",1,"com"],
    ["pan","Hogaza de Pan",1,7,2,"hp",25,"c",1,"com"],
    ["muslo","Muslo Asado",2,7,2,"hp",35,"r",1,"com"],
    ["hongo","Hongo Silvestre",3,7,2,"hp",18,"c",1,"gir"],
    ["piedra","Piedra Común",4,7,2,"def",1,"c"],
    ["roca-marron","Roca Marrón",5,7,2,"def",2,"c"],
    ["mineral-azul","Mineral Azul",6,7,2,"hp",30,"r",0,"gem"],
    ["paja","Paca de Paja",7,7,2,"hp",15,"c",1,"com"],
    /* fila 8 */
    ["pocion-azul","Poción Azul",0,8,2,"hp",50,"e",1,"poc"],
    ["pocion-dorada","Poción Dorada",1,8,2,"hp",80,"l",1,"poc"],
    ["hierba-verde","Hierba Curativa",2,8,2,"hp",20,"c",1,"rai"],
    ["platano","Plátano",3,8,2,"hp",15,"c",1,"com"],
    ["hoja-verde","Hoja de Rocío",4,8,2,"hp",12,"c",1,"rai"],
    ["flor-roja","Flor de Brasa",5,8,2,"hp",18,"r",1,"gir"],
    ["pluma","Pluma Mágica",6,8,2,"hp",40,"e"],
    ["daga-roja","Daga Carmesí",7,8,2,"atk",6,"l"],
    /* míticos extra */
    ["orbe-creacion","Orbe de la Creación",5,3,1,"atk",20,"m",0,"gem"],
    ["mandoble-divino","Mandoble Divino",6,0,1,"atk",12,"m"],
    ["corona-imperial","Corona Imperial",3,7,1,"def",12,"m",0,"cor"],
    ["caliz-mitico","Cáliz de la Eternidad",7,8,1,"hp",100,"m"]
  ];

  const RAR_MAP = { c:"comun", r:"raro", e:"epico", l:"legendario", m:"mitico" };
  const SHEET_MAP = { 1:"loot1", 2:"loot2" };
  const ICO_MAP = { esp:"espada", not:"nota", man:"manzana", com:"comida", poc:"pocion", lla:"llave", fue:"fuego", gem:"gema", cof:"cofre", cor:"corona", rai:"raiz", gir:"girasol" };

  const POOL = _P.map(([id, nombre, col, row, sh, tipo, val, rar, cons, ico]) => {
    const it = {
      id, nombre,
      sprite: [col, row],
      sheet: SHEET_MAP[sh],
      tipo, val,
      rar: RAR_MAP[rar],
      icono: ico ? ICO_MAP[ico] : (tipo === "hp" ? "manzana" : "espada")
    };
    if (cons) it.consumible = true;
    return it;
  });

  /* Sorteo */
  function sortearCon(probs) {
    const r = Math.random();
    let acc = 0;
    for (const k of Object.keys(probs)) { acc += probs[k]; if (r <= acc) return k; }
    return Object.keys(probs)[0];
  }
  const sortearRareza  = b => sortearCon(b || Object.fromEntries(Object.entries(RAREZAS).map(e => [e[0], e[1].prob])));
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
      r = x < 0.008 ? "mitico" : x < 0.048 ? "legendario" : x < 0.20 ? "epico" : x < 0.55 ? "raro" : "comun";
    } else {
      const x = Math.random();
      r = x < 0.0015 ? "mitico" : x < 0.02 ? "legendario" : x < 0.12 ? "epico" : x < 0.42 ? "raro" : "comun";
    }
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

  function quitarBonus(item) {
    if (item.consumible) return;
    const st = cargarStats();
    const v = item.valFinal || item.val;
    if (item.tipo === "atk") st.atkBonus = Math.max(0, st.atkBonus - v);
    if (item.tipo === "def") st.defBonus = Math.max(0, st.defBonus - v);
    if (item.tipo === "hp")  st.hpBonus  = Math.max(0, st.hpBonus  - v);
    guardarStats(st);
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }

  function usarConsumible(id) {
    const item = POOL.find(p => p.id === id);
    if (!item?.consumible) return false;
    const loot = cargarLoot();
    if (!loot[id] || loot[id] <= 0) return false;
    loot[id]--;
    if (loot[id] <= 0) delete loot[id];
    guardarLoot(loot);
    renderColeccion();
    return item;
  }
  const getConsumibles = () => { const l = cargarLoot(); return POOL.filter(p => p.consumible && (l[p.id] || 0) > 0); };

  /* Popup + modal detalle */
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
    añadirBotonReroll(m, item);
    const bc = document.createElement("button");
    bc.type = "button"; bc.className = "btn-secondary"; bc.textContent = "Cerrar";
    bc.addEventListener("click", () => m.classList.remove("active"));
    acc.appendChild(bc);
    m.classList.add("active");
    if (window.hidratarIconos) window.hidratarIconos(m);
  }

  /* Reroll */
  const COSTO_REROLL = { comun:100, raro:500, epico:2500, legendario:12000, mitico:50000 };

  function moverRareza(actual, delta) {
    const i = ORDEN_RAREZAS.indexOf(actual);
    if (i < 0) return actual;
    const n = Math.max(0, Math.min(ORDEN_RAREZAS.length - 1, i + delta));
    return ORDEN_RAREZAS[n];
  }

  function sortearNuevaRareza(original) {
    const r = Math.random(), t = PROB_REROLL_RAREZA;
    if (r < t.misma) return original;
    if (r < t.misma + t.sube1) return moverRareza(original, 1);
    if (r < t.misma + t.sube1 + t.sube2) return moverRareza(original, 2);
    return moverRareza(original, -1);
  }

  function buscarCandidatos(original, nuevaRareza, sheetOverride) {
    const sheet = sheetOverride || original.sheet;
    const base = rar => POOL.filter(p =>
      p.rar === rar && p.id !== original.id && p.tipo === original.tipo &&
      p.consumible === original.consumible && p.sheet === sheet
    );
    let cand = base(nuevaRareza);
    let rarezaFinal = nuevaRareza;
    if (!cand.length) { cand = base(original.rar); rarezaFinal = original.rar; }
    return { cand, rarezaFinal };
  }

  function rerollItem(itemId) {
    const original = POOL.find(p => p.id === itemId);
    if (!original) return { error: "Item no encontrado" };
    const loot = cargarLoot();
    const cant = loot[itemId] || 0;
    if (cant <= 0) return { error: "No tienes este objeto" };
    const costo = COSTO_REROLL[original.rar] || 500;
    if (getMonedas() < costo) return { error: `Necesitas ${costo} monedas` };

    const rarezaSorteada = sortearNuevaRareza(original.rar);
    const { cand, rarezaFinal } = buscarCandidatos(original, rarezaSorteada);
    if (!cand.length) return { error: "No hay alternativas del mismo tipo" };

    const nuevo = cand[Math.floor(Math.random() * cand.length)];
    setMonedas(getMonedas() - costo);
    quitarBonus(original);

    loot[itemId]--;
    if (loot[itemId] <= 0) delete loot[itemId];
    loot[nuevo.id] = (loot[nuevo.id] || 0) + 1;
    if (!nuevo.consumible) aplicarBonus(nuevo);
    guardarLoot(loot);

    const delta = ORDEN_RAREZAS.indexOf(rarezaFinal) - ORDEN_RAREZAS.indexOf(original.rar);
    if (delta > 0) SND("victoria");
    else if (delta < 0) SND("derrota");
    else SND("sparkle");

    mostrarPopup(nuevo);
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
    renderColeccion();
    return { ok:true, nuevo, costo, rarezaAnterior:original.rar, rarezaNueva:rarezaFinal, cambioRareza:delta !== 0, delta };
  }

  async function rerollCategoria(cat) {
    const loot = cargarLoot();
    const ids = Object.keys(loot).filter(id => {
      const it = POOL.find(p => p.id === id);
      return it && it.sheet === cat && !it.consumible;
    });
    if (!ids.length) return { error: "No hay objetos para rerollear" };
    const total = ids.reduce((s, id) => {
      const it = POOL.find(p => p.id === id);
      return s + (COSTO_REROLL[it.rar] || 500) * loot[id];
    }, 0);
    if (getMonedas() < total) return { error: `Necesitas ${total} monedas` };

    const ok = await confirmar({
      title: '¿Rerollear objetos?',
      message: `Se rerollearán <strong>${ids.length}</strong> objetos por <strong>${total} monedas</strong>.<br><br><em>88% misma rareza · 9% +1 tier · 2% +2 tiers · 1% -1 tier</em>`,
      variant: 'warning',
      icon: '🎲',
      confirmText: `Pagar ${total} 🪙`,
      cancelText: 'Cancelar'
    });
    if (!ok) return { cancel:true };

    setMonedas(getMonedas() - total);
    let cambiados = 0, mejoras = 0, bajadas = 0;

    ids.forEach(id => {
      const cant = loot[id];
      const original = POOL.find(p => p.id === id);
      for (let i = 0; i < cant; i++) {
        const rarezaSorteada = sortearNuevaRareza(original.rar);
        const { cand, rarezaFinal } = buscarCandidatos(original, rarezaSorteada, cat);
        if (!cand.length) continue;
        const nuevo = cand[Math.floor(Math.random() * cand.length)];
        quitarBonus(original);
        aplicarBonus(nuevo);
        loot[nuevo.id] = (loot[nuevo.id] || 0) + 1;
        cambiados++;
        const delta = ORDEN_RAREZAS.indexOf(rarezaFinal) - ORDEN_RAREZAS.indexOf(original.rar);
        if (delta > 0) mejoras++;
        else if (delta < 0) bajadas++;
      }
      delete loot[id];
    });

    guardarLoot(loot);
    renderColeccion();
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
    SND(mejoras > 0 ? "victoria" : "sparkle");
    return { ok:true, cambiados, mejoras, bajadas, total };
  }

  function añadirBotonReroll(modal, item) {
    const acc = modal.querySelector(".rpg-loot-modal-acciones");
    if (!acc || item.consumible) return;
    const loot = cargarLoot();
    const cant = loot[item.id] || 0;
    if (cant <= 0) return;
    const costo = COSTO_REROLL[item.rar] || 500;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rpg-loot-usar";
    b.style.background = "linear-gradient(135deg,#6cb8ff,#a684f0)";
    b.style.color = "#1a1030";
    b.textContent = `🎲 Reroll (${costo} 🪙)`;
    b.title = "88% misma · 9% +1 · 2% +2 · 1% -1";
    b.addEventListener("click", () => {
      const r = rerollItem(item.id);
      if (r.error) return alert(r.error);
      modal.classList.remove("active");
      const txt = r.delta > 0 ? `⭐ ¡Subió a ${RAREZAS[r.rarezaNueva].label}!`
                : r.delta < 0 ? `💧 Bajó a ${RAREZAS[r.rarezaNueva].label}...`
                : r.nuevo.nombre;
      notifMascota?.("🎲 Reroll", txt);
    });
    acc.insertBefore(b, acc.firstChild);
  }

  /* Cofres */
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

  /* Colección */
  const CATS = [
    { id:"todos",       label:"Todos",     sheets:null },
    { id:"loot1",       label:"Arsenal",   sheets:["loot1"] },
    { id:"loot2",       label:"Recursos",  sheets:["loot2"] },
    { id:"consumibles", label:"Pociones",  soloConsumibles:true }
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
    const puedeReroll = filtro === "loot1" || filtro === "loot2";

    let grid = "";
    pool.forEach(p => {
      const t = loot[p.id] || 0;
      grid += `<div class="rpg-coleccion-item rar-${p.rar}${p.consumible && t ? " consumible" : ""}${t ? "" : " bloqueado"}" data-id="${p.id}" title="${t ? p.nombre + (p.consumible ? " (usable)" : "") : "???"} (${RAREZAS[p.rar].label})">${renderIcono(p)}${t ? `<span class="rpg-coleccion-cant">×${t}</span>` : ""}</div>`;
    });

    c.innerHTML = `
      <div class="rpg-coleccion-header">
        <span class="rpg-coleccion-titulo">🎒 Colección</span>
        <span class="rpg-coleccion-count">${uniq} / ${POOL.length} · ${total} objetos</span>
      </div>
      <div class="rpg-col-filtros">
        ${filtros}
        ${puedeReroll ? `<button class="rpg-col-filtro" id="btn-reroll-cat" style="margin-left:auto;border-color:rgba(108,184,255,.5);color:#6cb8ff;font-weight:900;" title="88% misma · 9% +1 · 2% +2 · 1% -1">🎲 Reroll ${cat.label}</button>` : ""}
      </div>
      <div class="rpg-coleccion-grid">${grid}</div>`;

    if (window.hidratarIconos) window.hidratarIconos(c);
    qsa(".rpg-col-filtro[data-cat]", c).forEach(b => b.addEventListener("click", () => { filtro = b.dataset.cat; renderColeccion(); }));
    qsa(".rpg-coleccion-item", c).forEach(el => el.addEventListener("click", () => {
      const it = POOL.find(p => p.id === el.dataset.id);
      if (it) mostrarDetalleItem(it);
    }));

    document.getElementById("btn-reroll-cat")?.addEventListener("click", async () => {
      const r = await rerollCategoria(filtro);
      if (r.error) alert(r.error);
      else if (!r.cancel) {
        let msg = `🎲 ${r.cambiados} objetos rerolleados.\nCoste: ${r.total} 🪙`;
        if (r.mejoras > 0) msg += `\n⭐ ${r.mejoras} mejoras de rareza!`;
        if (r.bajadas > 0) msg += `\n💧 ${r.bajadas} bajadas...`;
        alert(msg);
      }
    });
  }

  /* Cofres — render */
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

  /* Eventos */
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

  /* API pública */
  window.RpgLoot = {
    POOL, SHEETS, RAREZAS, CALIDADES, COFRES, COSTO_REROLL,
    ORDEN_RAREZAS, PROB_REROLL_RAREZA,
    cargarLoot, guardarLoot, cargarStats, guardarStats,
    usarConsumible, getConsumibles,
    mostrarDetalleItem, mostrarPopup, renderIcono,
    renderColeccion, renderCofres, abrirCofre,
    rerollItem, rerollCategoria, añadirBotonReroll,
    moverRareza, sortearNuevaRareza,
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
    reset: async () => {
      const ok = await confirmar({
        title: '¿Borrar TODO tu botín?',
        message: 'Perderás todas las reliquias, objetos y bonus acumulados. Esta acción es irreversible.',
        variant: 'danger',
        icon: '💀',
        confirmText: 'Sí, borrar todo',
        cancelText: 'Cancelar'
      });
      if (!ok) return;
      localStorage.removeItem(KEY_LOOT());
      localStorage.removeItem(KEY_STATS());
      renderColeccion();
      window.dispatchEvent(new Event("rpg:stats-cambiados"));
    }
  };

  console.log("✅ rpg-loot.js v5 listo · " + POOL.length + " items");
})();