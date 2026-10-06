/* ============================================================
   RPG-LOOT.JS v6 — Botín, cofres, colección y reroll
   Optimizado · Cofres con sprites · Moneda pixel-art
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n=0; const it=()=>{ if(window._TiendaAPI) return boot(); if(++n>50) return; setTimeout(it,100); }; return setTimeout(it,100); }
  const { notifMascota, getUserId, getMonedas, setMonedas } = API;

  const $  = id => document.getElementById(String(id).replace(/^#/, ""));
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const SND = t => { try { window._snd?.(t); } catch {} };
  const confirmar = o => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.title));

  /* ---------- Sprites ---------- */
  const SHEETS = {
    loot1: { url: "img/rpg/loot-1.png", cols: 8, rows: 9 },
    loot2: { url: "img/rpg/loot-2.png", cols: 8, rows: 9 },
    main:  { url: window.SPRITE_SHEET?.url || "img/tienda/admurin-items.png",
             cols: window.SPRITE_SHEET?.cols || 30,
             rows: window.SPRITE_SHEET?.rows || 110 }
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

  /* ---------- Persistencia ---------- */
  const K = {
    loot:  () => "sa_rpg_loot_"  + getUserId(),
    stats: () => "sa_rpg_stats_" + getUserId(),
    rpg:   () => "sa_rpg_"       + getUserId(),
    cofres:() => "sa_rpg_cofres_"+ getUserId()
  };
  const load  = (k, def) => { try { return JSON.parse(localStorage.getItem(k) || def); } catch { return JSON.parse(def); } };
  const save  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const cargarLoot  = () => load(K.loot(), "{}");
  const guardarLoot = o => save(K.loot(), o);
  const cargarStats = () => load(K.stats(), '{"atkBonus":0,"defBonus":0,"hpBonus":0}');
  const guardarStats= o => save(K.stats(), o);
  const cargarEstado= () => load(K.rpg(), '{"nivel":1,"xp":0,"hp":100,"statsBase":{"atk":10,"def":3}}');
  const guardarEstado=s => save(K.rpg(), s);
  const hpMaxRpg   = s => 100 + (s.nivel || 1) * 25 + (cargarStats().hpBonus || 0);

  /* ---------- Rarezas / calidades ---------- */
  const RAREZAS = {
    comun:      { prob:0.62,  label:"Común",      color:"#c9c9c9", glow:"rgba(201,201,201,.3)" },
    raro:       { prob:0.24,  label:"Raro",       color:"#6cb8ff", glow:"rgba(108,184,255,.5)" },
    epico:      { prob:0.095, label:"Épico",      color:"#a684f0", glow:"rgba(166,132,240,.6)" },
    legendario: { prob:0.040, label:"Legendario", color:"#ffd93d", glow:"rgba(255,217,61,.7)" },
    mitico:     { prob:0.005, label:"Mítico",     color:"#ff6b9d", glow:"rgba(255,107,157,.8)" },
    tornasol:   { prob:0.001, label:"Tornasol",   color:"#b0f5ff", glow:"rgba(176,245,255,.9)" }
  };
  const ORDEN_RAREZAS = ["comun","raro","epico","legendario","mitico","tornasol"];
  const PROB_REROLL_RAREZA = { misma:0.94, sube1:0.05, sube2:0.005, baja1:0.005 };
  const CALIDADES = {
    normal:    { label:"Normal",    mult:1.0, icon:"" },
    reforzado: { label:"Reforzado", mult:1.25, icon:"⚡" },
    impecable: { label:"Impecable", mult:1.6, icon:"✨" },
    ancestral: { label:"Ancestral", mult:2.2, icon:"🔥" }
  };

  /* ---------- Cofres (con sprites) ---------- */
  const COFRES = {
    // Orden visual correcto: madera (marrón), hierro (verdoso), dorado (dorado)
    madera: {
      nombre:"Cofre de Madera", precio:500,
      rarBoosts:{comun:.70,raro:.22,epico:.065,legendario:.013,mitico:.002},
      calBoosts:{normal:.78,reforzado:.18,impecable:.035,ancestral:.005},
      emoji:"📦", imagen:"img/rpg/items/cofre-madera.png?v=2", color:"#a0522d",
      cantMin:1, cantMax:2
    },
    hierro: {
      nombre:"Cofre de Hierro", precio:3000,
      rarBoosts:{comun:.55,raro:.30,epico:.115,legendario:.03,mitico:.005},
      calBoosts:{normal:.62,reforzado:.26,impecable:.10,ancestral:.02},
      emoji:"🗃️", imagen:"img/rpg/items/cofre-hierro.png?v=2", color:"#718093",
      cantMin:2, cantMax:3
    },
    dorado: {
      nombre:"Cofre Dorado", precio:15000,
      rarBoosts:{comun:.35,raro:.35,epico:.20,legendario:.085,mitico:.015},
      calBoosts:{normal:.42,reforzado:.33,impecable:.20,ancestral:.05},
      emoji:"🏆", imagen:"img/rpg/items/cofre-dorado.png?v=2", color:"#ffd93d",
      cantMin:3, cantMax:5
    },
    alba: {
      nombre:"Cofre del Alba", precio:75000,
      rarBoosts:{comun:.15,raro:.30,epico:.33,legendario:.18,mitico:.04},
      calBoosts:{normal:.15,reforzado:.30,impecable:.38,ancestral:.17},
      emoji:"🌟", imagen:"img/rpg/items/cofre-alba.png?v=5", color:"#ff6b9d",
      cantMin:5, cantMax:7
    },
    celestial: {
      nombre:"Cofre Celestial", precio:400000,
      rarBoosts:{comun:.03,raro:.15,epico:.35,legendario:.37,mitico:.10},
      calBoosts:{normal:.05,reforzado:.15,impecable:.42,ancestral:.38},
      emoji:"☀️", imagen:"img/rpg/items/cofre-celestial.png?v=4", color:"#fff5b8",
      cantMin:7, cantMax:10
    }
  };

  /* ---------- POOL comprimido ----------
     [id, nombre, col, row, sheet(1|2), tipo, val, rar(c/r/e/l/m), consumible(0|1), icono] */
  const _P = [
    ["espada","Espada de Acero",0,0,1,"atk",3,"r"],
    ["espada-fuego","Espada Flamígera",1,0,1,"atk",7,"l"],
    ["espada-hielo","Filo de Hielo",2,0,1,"atk",6,"l"],
    ["cimitarra","Cimitarra Real",3,0,1,"atk",3,"r"],
    ["espada-ropera","Espada Ropera",4,0,1,"atk",4,"e"],
    ["espada-elfica","Espada Élfica",5,0,1,"atk",5,"e"],
    ["espada-legend","Filo del Alba",6,0,1,"atk",10,"m"],
    ["espada-cristal","Espada de Cristal",7,0,1,"atk",8,"l"],
    ["daga","Daga Oxidada",0,1,1,"atk",1,"c"],
    ["daga-asesino","Daga del Asesino",1,1,1,"atk",3,"r"],
    ["daga-cristal","Daga Carmesí",2,1,1,"atk",4,"e"],
    ["maza","Maza de Hierro",3,1,1,"atk",2,"c"],
    ["martillo-hierro","Martillo de Hierro",4,1,1,"atk",3,"r"],
    ["hacha-guerra","Hacha de Guerra",5,1,1,"atk",4,"r"],
    ["hacha-doble","Hacha Doble",6,1,1,"atk",5,"e"],
    ["hacha-cristal","Hacha Azulada",7,1,1,"atk",6,"l"],
    ["arco-madera","Arco de Madera",0,2,1,"atk",1,"c"],
    ["arco-elfico","Arco Élfico",1,2,1,"atk",4,"e"],
    ["arco-fuego","Arco Ígneo",2,2,1,"atk",5,"e"],
    ["arco-hielo","Arco Gélido",3,2,1,"atk",5,"e"],
    ["ballesta","Ballesta de Torre",4,2,1,"atk",5,"e"],
    ["baston","Bastón Antiguo",5,2,1,"atk",5,"e"],
    ["vara-cristal","Vara de Cristal",6,2,1,"atk",4,"r"],
    ["baculo-fuego","Báculo de Fuego",7,2,1,"atk",7,"l"],
    ["baston-antiguo","Bastón Ancestral",0,3,1,"atk",6,"l"],
    ["baculo-cristal","Báculo Cristalino",1,3,1,"atk",4,"e"],
    ["baculo-rayo","Báculo del Rayo",2,3,1,"atk",8,"l"],
    ["cetro-solar","Cetro Solar",3,3,1,"atk",9,"l"],
    ["baculo-fuego2","Báculo Ardiente",4,3,1,"atk",7,"l"],
    ["baculo-infinito","Báculo del Infinito",5,3,1,"atk",15,"m"],
    ["baculo-sombra","Báculo Umbrío",6,3,1,"atk",10,"m"],
    ["varita","Varita Mágica",7,3,1,"atk",3,"r"],
    ["amuleto-sol","Amuleto Solar",0,4,1,"atk",6,"l"],
    ["amuleto-azul","Amuleto Azul",1,4,1,"def",5,"e"],
    ["amuleto-rubi","Amuleto de Rubí",2,4,1,"atk",4,"e"],
    ["amuleto-esmeralda","Amuleto Esmeralda",3,4,1,"hp",40,"e"],
    ["pergamino-azul","Pergamino Arcano",4,4,1,"atk",5,"e",1,"not"],
    ["pergamino-rojo","Pergamino Ígneo",5,4,1,"atk",4,"r",1,"not"],
    ["pergamino-madera","Pergamino Rúnico",6,4,1,"hp",25,"r",1,"not"],
    ["pergamino-escudo","Pergamino Protector",7,4,1,"def",5,"e",1,"not"],
    ["anillo-poder","Anillo de Poder",0,5,1,"atk",3,"r"],
    ["anillo-estrella","Anillo Estelar",1,5,1,"atk",5,"e"],
    ["anillo-silver","Anillo de Plata",2,5,1,"def",4,"e"],
    ["anillo-esmeralda","Anillo Esmeralda",3,5,1,"hp",35,"e"],
    ["casco-hierro","Casco de Hierro",4,5,1,"def",2,"r"],
    ["casco-alba","Casco del Alba",5,5,1,"def",5,"e"],
    ["casco-cruz","Casco Cruzado",6,5,1,"def",6,"l"],
    ["casco-sombra","Casco Umbrío",7,5,1,"def",7,"l"],
    ["botas-piel","Botas de Piel",0,6,1,"def",2,"r"],
    ["botas-silver","Botas de Plata",1,6,1,"def",3,"r"],
    ["botas-aladas","Botas Aladas",2,6,1,"def",3,"r"],
    ["botas-sombra","Botas Umbrías",3,6,1,"def",4,"e"],
    ["capa-hood","Capucha Oscura",4,6,1,"def",3,"r"],
    ["capa-mago","Capa de Mago",5,6,1,"def",5,"e"],
    ["mascara","Máscara Blanca",6,6,1,"def",4,"e"],
    ["capa-sombras","Capa de Sombras",7,6,1,"def",7,"l"],
    ["coraza-cuero","Coraza de Cuero",0,7,1,"def",3,"r"],
    ["coraza-malla","Cota de Malla",1,7,1,"def",4,"e"],
    ["coraza-placas","Coraza de Placas",2,7,1,"def",5,"e"],
    ["armadura-dorada","Armadura Dorada",3,7,1,"def",8,"l"],
    ["guante-cuero","Guante de Cuero",4,7,1,"def",2,"r"],
    ["guante-sombra","Guante Umbrío",5,7,1,"def",4,"e"],
    ["guante-garra","Garra de Bestia",6,7,1,"atk",5,"e"],
    ["guantelete","Guantelete de Poder",7,7,1,"def",4,"e"],
    ["manzana-comida","Manzana Fresca",0,8,1,"hp",15,"c",1,"man"],
    ["queso","Queso Curado",1,8,1,"hp",20,"c",1,"com"],
    ["huevo","Huevo Frito",2,8,1,"hp",18,"c",1,"com"],
    ["carne","Carne Asada",3,8,1,"hp",30,"r",1,"com"],
    ["llave-pequena","Llave Menuda",4,8,1,"hp",20,"r",0,"lla"],
    ["llave-hierro","Llave de Hierro",5,8,1,"hp",30,"e",0,"lla"],
    ["vela","Vela Sagrada",6,8,1,"hp",25,"r",1,"fue"],
    ["caliz-estelar","Cáliz Estelar",7,8,1,"hp",70,"l"],
    ["espada-corta","Espada Corta",0,0,2,"atk",1,"c"],
    ["espada-larga","Espada Larga",1,0,2,"atk",2,"c"],
    ["espada-cruzada","Espada Cruzada",2,0,2,"atk",3,"r"],
    ["espada-cruzada-azul","Espada Cruzada Azul",3,0,2,"atk",4,"e"],
    ["katana","Katana",4,0,2,"atk",5,"e"],
    ["katana-dorada","Katana Dorada",5,0,2,"atk",6,"l"],
    ["sable","Sable Curvo",6,0,2,"atk",4,"e"],
    ["baston-simple","Bastón Simple",7,0,2,"atk",2,"c"],
    ["pico","Pico Minero",0,1,2,"atk",3,"r"],
    ["pico-dorado","Pico Dorado",1,1,2,"atk",4,"e"],
    ["daga-azul","Daga Azul",2,1,2,"atk",3,"r"],
    ["daga-verde","Daga Verde",3,1,2,"atk",3,"r"],
    ["hacha","Hacha de Leñador",4,1,2,"atk",3,"r"],
    ["martillo-madera","Martillo de Madera",5,1,2,"atk",2,"c"],
    ["hacha-curva","Hacha Curva",6,1,2,"atk",4,"e"],
    ["hacha-cristal2","Hacha de Cristal",7,1,2,"atk",5,"e"],
    ["garrote","Garrote",0,2,2,"atk",1,"c"],
    ["martillo","Martillo de Guerra",1,2,2,"atk",4,"r"],
    ["martillo-mixto","Martillo Mixto",2,2,2,"atk",4,"r"],
    ["martillo-plata","Martillo de Plata",3,2,2,"atk",5,"e"],
    ["maza-azul","Maza Azulada",4,2,2,"atk",5,"e"],
    ["maza-naranja","Maza Ígnea",5,2,2,"atk",6,"l"],
    ["arco-amarillo","Arco Dorado",6,2,2,"atk",5,"e"],
    ["arco-oscuro","Arco Sombrío",7,2,2,"atk",6,"l"],
    ["maza-corta","Maza Corta",0,3,2,"atk",2,"c"],
    ["maza-azul2","Maza Azul",1,3,2,"atk",4,"e"],
    ["ballesta-corta","Ballesta Corta",2,3,2,"atk",4,"e"],
    ["ballesta-pesada","Ballesta Pesada",3,3,2,"atk",6,"l"],
    ["arco-ornamentado","Arco Ornamentado",4,3,2,"atk",5,"e"],
    ["arco-simple","Arco Simple",5,3,2,"atk",2,"c"],
    ["arco-curvo","Arco Curvo",6,3,2,"atk",3,"r"],
    ["arco-real","Arco Real",7,3,2,"atk",6,"l"],
    ["escudo-madera","Escudo de Madera",0,4,2,"def",1,"c"],
    ["escudo-hierro","Escudo de Hierro",1,4,2,"def",3,"r"],
    ["escudo-torre","Escudo Torre",2,4,2,"def",6,"e"],
    ["libro-rojo","Grimorio Rojo",3,4,2,"atk",3,"e",0,"not"],
    ["casco-caballero","Casco de Caballero",4,4,2,"def",5,"e"],
    ["casco-visor","Casco con Visor",5,4,2,"def",5,"e"],
    ["casco-legendario","Casco Alado",6,4,2,"def",8,"l"],
    ["casco-negro","Casco Negro",7,4,2,"def",6,"l"],
    ["yunque","Yunque de Forja",0,5,2,"hp",30,"r"],
    ["yunque-pequeno","Yunque Pequeño",1,5,2,"hp",20,"c"],
    ["armadura-gris","Armadura Gris",2,5,2,"def",4,"e"],
    ["armadura-azul","Armadura Azul",3,5,2,"def",6,"l"],
    ["capa-roja","Capa Roja",4,5,2,"def",4,"e"],
    ["cofre-madera","Cofre Pequeño",5,5,2,"hp",25,"r",0,"cof"],
    ["capucha","Capucha",6,5,2,"def",2,"c"],
    ["calavera","Calavera Maldita",7,5,2,"atk",5,"e"],
    ["collar-oro","Collar de Oro",0,6,2,"hp",25,"r"],
    ["collar-doble","Collar Doble",1,6,2,"hp",35,"e"],
    ["collar-hierro","Collar de Hierro",2,6,2,"def",3,"r"],
    ["collar-corazon","Collar de Corazón",3,6,2,"hp",50,"l"],
    ["lingote-hierro","Lingote de Hierro",4,6,2,"hp",20,"c"],
    ["lingote-oro","Lingote de Oro",5,6,2,"hp",40,"e"],
    ["tronco","Tronco Recio",6,6,2,"def",2,"c"],
    ["ramas","Ramas Secas",7,6,2,"def",1,"c"],
    ["trigo","Haz de Trigo",0,7,2,"hp",15,"c",1,"com"],
    ["pan","Hogaza de Pan",1,7,2,"hp",25,"c",1,"com"],
    ["muslo","Muslo Asado",2,7,2,"hp",35,"r",1,"com"],
    ["hongo","Hongo Silvestre",3,7,2,"hp",18,"c",1,"gir"],
    ["piedra","Piedra Común",4,7,2,"def",1,"c"],
    ["roca-marron","Roca Marrón",5,7,2,"def",2,"c"],
    ["mineral-azul","Mineral Azul",6,7,2,"hp",30,"r",0,"gem"],
    ["paja","Paca de Paja",7,7,2,"hp",15,"c",1,"com"],
    ["pocion-azul","Poción Azul",0,8,2,"hp",50,"e",1,"poc"],
    ["pocion-dorada","Poción Dorada",1,8,2,"hp",80,"l",1,"poc"],
    ["hierba-verde","Hierba Curativa",2,8,2,"hp",20,"c",1,"rai"],
    ["platano","Plátano",3,8,2,"hp",15,"c",1,"com"],
    ["hoja-verde","Hoja de Rocío",4,8,2,"hp",12,"c",1,"rai"],
    ["flor-roja","Flor de Brasa",5,8,2,"hp",18,"r",1,"gir"],
    ["pluma","Pluma Mágica",6,8,2,"hp",40,"e"],
    ["daga-roja","Daga Carmesí",7,8,2,"atk",6,"l"],
    ["orbe-creacion","Orbe de la Creación",5,3,1,"atk",20,"m",0,"gem"],
    ["mandoble-divino","Mandoble Divino",6,0,1,"atk",12,"m"],
    ["corona-imperial","Corona Imperial",3,7,1,"def",12,"m",0,"cor"],
    ["caliz-mitico","Cáliz de la Eternidad",7,8,1,"hp",100,"m"]
  ];

  const RAR_MAP = { c:"comun", r:"raro", e:"epico", l:"legendario", m:"mitico" };
  const SHEET_MAP = { 1:"loot1", 2:"loot2" };
  const ICO_MAP = { esp:"espada", not:"nota", man:"manzana", com:"comida", poc:"pocion", lla:"llave", fue:"fuego", gem:"gema", cof:"cofre", cor:"corona", rai:"raiz", gir:"girasol" };

  const POOL = _P.map(([id, nombre, col, row, sh, tipo, val, rar, cons, ico]) => {
    const it = { id, nombre, sprite:[col,row], sheet:SHEET_MAP[sh], tipo, val,
      rar: RAR_MAP[rar], icono: ico ? ICO_MAP[ico] : (tipo === "hp" ? "manzana" : "espada") };
    if (cons) it.consumible = true;
    return it;
  });

  /* ---------- Sorteos ---------- */
  const sortearCon = probs => {
    const r = Math.random(); let acc = 0;
    for (const k of Object.keys(probs)) { acc += probs[k]; if (r <= acc) return k; }
    return Object.keys(probs)[0];
  };
  const sortearRareza  = b => sortearCon(b || Object.fromEntries(Object.entries(RAREZAS).map(e => [e[0], e[1].prob])));
  const sortearCalidad = b => sortearCon(b || { normal:.7, reforzado:.2, impecable:.08, ancestral:.02 });

  function sortearItem(rareza, calidad) {
    const cand = POOL.filter(p => p.rar === rareza);
    const it = cand[rnd(0, cand.length - 1)] || POOL[0];
    const cal = CALIDADES[calidad] || CALIDADES.normal;
    return { ...it, calidad, valFinal: Math.round(it.val * cal.mult) };
  }

  function sortearItemVictoria(jefe) {
    const x = Math.random();
    const r = jefe
      ? (x < 0.008 ? "mitico" : x < 0.048 ? "legendario" : x < 0.20 ? "epico" : x < 0.55 ? "raro" : "comun")
      : (x < 0.0015 ? "mitico" : x < 0.02 ? "legendario" : x < 0.12 ? "epico" : x < 0.42 ? "raro" : "comun");
    return sortearItem(r, sortearCalidad());
  }

  function aplicarBonus(item) {
    if (item.consumible) return;
    const st = cargarStats(), v = item.valFinal || item.val;
    if (item.tipo === "atk") st.atkBonus += v;
    if (item.tipo === "def") st.defBonus += v;
    if (item.tipo === "hp")  st.hpBonus  += v;
    guardarStats(st);
    window.dispatchEvent(new Event("rpg:stats-cambiados"));
  }
  function quitarBonus(item) {
    if (item.consumible) return;
    const st = cargarStats(), v = item.valFinal || item.val;
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
    loot[id]--; if (loot[id] <= 0) delete loot[id];
    guardarLoot(loot); renderColeccion();
    return item;
  }
  const getConsumibles = () => { const l = cargarLoot(); return POOL.filter(p => p.consumible && (l[p.id] || 0) > 0); };

  /* ---------- Popup + modal ---------- */
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
    m.querySelector(".rpg-loot-modal-panel").className = "rpg-loot-modal-panel rar-" + (item.rar || "comun");
    m.querySelector(".rpg-loot-modal-icon").innerHTML = renderIcono(item, "96px");
    const rarInfo = RAREZAS[item.rar] || { label: item.rar || "Común" };
    m.querySelector(".rpg-loot-modal-rarity").innerHTML = `${rarInfo.label} &nbsp;<span class="loot-cal-badge cal-${item.calidad || "normal"}">${cal.icon} ${cal.label}</span>`;
    m.querySelector(".rpg-loot-modal-nombre").textContent = item.nombre;
    
    // Estadísticas y descripción
    let statsTexto = item.desc ? `<div style="font-size:.82rem;opacity:.9;margin-bottom:.5rem;font-style:italic;">"${item.desc}"</div>` : "";
    if (item.stats && Object.keys(item.stats).length > 0) {
      const statsList = Object.entries(item.stats).map(([k, val]) => `<span style="display:inline-block;padding:.15rem .45rem;margin:.15rem;border-radius:6px;background:rgba(255,255,255,.08);font-size:.75rem;font-weight:700;">+${val} ${k.toUpperCase()}</span>`).join("");
      statsTexto += `<div style="margin-bottom:.5rem;">${statsList}</div>`;
    } else {
      statsTexto += `+${v} ${item.tipo.toUpperCase()}`;
    }

    // Habilidades mapeadas
    if (Array.isArray(item.habilidades) && item.habilidades.length > 0) {
      statsTexto += `<div style="margin-top:.6rem;padding:.5rem;background:rgba(166,132,240,.12);border:1px solid rgba(166,132,240,.3);border-radius:8px;text-align:left;">
        <div style="font-size:.7rem;font-weight:900;text-transform:uppercase;color:#c4a5ff;margin-bottom:.3rem;display:flex;align-items:center;gap:5px;">
          <img src="img/sprites complementarios/estrella.png" alt="" style="width:14px;height:14px;object-fit:contain;display:inline-block;">
          <span>HABILIDADES:</span>
        </div>
        ${item.habilidades.map(h => `<div style="font-size:.75rem;margin-bottom:.2rem;"><strong>${h.nombre}</strong> <span style="opacity:.7;">(${h.tipo})</span>: <small style="opacity:.85;">${h.desc || ''}</small></div>`).join("")}
      </div>`;
    }

    m.querySelector(".rpg-loot-modal-desc").innerHTML = statsTexto;
    m.querySelector(".rpg-loot-modal-tipo").textContent = item.consumible ? `Consumible · Tienes ×${cant}` : "Pasivo · bonus permanente aplicado";
    const acc = m.querySelector(".rpg-loot-modal-acciones");
    acc.innerHTML = "";
    if (item.consumible && cant > 0) {
      if (item.id === "item-4-8" || item.id === "llave-hierro" || item.nombre?.toLowerCase().includes("llave dorada")) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "rpg-loot-usar"; b.textContent = "🏆 Abrir Cofre Dorado";
        b.addEventListener("click", () => {
          m.classList.remove("active");
          abrirCofre("dorado", 1, true);
        });
        acc.appendChild(b);
      } else if (item.id === "item-5-8" || item.id === "llave-pequena" || item.nombre?.toLowerCase().includes("llave común") || item.nombre?.toLowerCase().includes("llave comun")) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "rpg-loot-usar"; b.textContent = "🗃️ Abrir Cofre Plateado";
        b.addEventListener("click", () => {
          m.classList.remove("active");
          abrirCofre("hierro", 1, true);
        });
        acc.appendChild(b);
      } else {
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
    }
    añadirBotonReroll(m, item);
    const bc = document.createElement("button");
    bc.type = "button"; bc.className = "btn-secondary"; bc.textContent = "Cerrar";
    bc.addEventListener("click", () => m.classList.remove("active"));
    acc.appendChild(bc);
    m.classList.add("active");
    if (window.hidratarIconos) window.hidratarIconos(m);
  }

  /* ---------- Mini Pop-up / Tooltip (Hover & Tap) ---------- */
  let tooltipEl = null;
  function getTooltipEl() {
    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.id = "rpg-item-tooltip";
      tooltipEl.className = "rpg-item-tooltip";
      document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
  }

  function mostrarTooltipItem(item, x, y) {
    const tip = getTooltipEl();
    const rar = RAREZAS[item.rar] || { label: item.rar || "Común", color: "#ffd93d", glow: "rgba(255,217,61,.3)", prob: 0.1 };
    const cal = CALIDADES[item.calidad || "normal"] || { label: "Normal", icon: "" };
    const dropPct = (rar.prob * 100).toFixed(1);

    tip.style.setProperty("--rar-color", rar.color || "#ffd93d");
    tip.style.setProperty("--rar-glow", rar.glow || "rgba(255,217,61,.3)");

    let statsHtml = "";
    if (item.stats && Object.keys(item.stats).length > 0) {
      statsHtml = Object.entries(item.stats).map(([k, val]) => `<span class="rpg-item-tooltip-stat-tag">+${val} ${k.toUpperCase()}</span>`).join("");
    } else {
      const v = item.valFinal || item.val || 0;
      statsHtml = `<span class="rpg-item-tooltip-stat-tag">+${v} ${(item.tipo || "UTIL").toUpperCase()}</span>`;
    }

    let habsHtml = "";
    if (Array.isArray(item.habilidades) && item.habilidades.length > 0) {
      habsHtml = `
        <div class="rpg-item-tooltip-habs">
          <div class="rpg-item-tooltip-hab-title" style="display:flex;align-items:center;gap:4px;">
            <img src="img/sprites complementarios/estrella.png" alt="" style="width:13px;height:13px;object-fit:contain;display:inline-block;">
            <span>Habilidades:</span>
          </div>
          ${item.habilidades.map(h => `<div class="rpg-item-tooltip-hab-item"><strong>${h.nombre}</strong> <span style="opacity:.7">(${h.tipo})</span>: <span>${h.desc || ''}</span></div>`).join("")}
        </div>
      `;
    }

    tip.innerHTML = `
      <div class="rpg-item-tooltip-header">
        <div class="rpg-item-tooltip-icon">${renderIcono(item, "32px")}</div>
        <div class="rpg-item-tooltip-titles">
          <div class="rpg-item-tooltip-name">${item.nombre}</div>
          <div class="rpg-item-tooltip-tags">
            <span>${rar.label}</span>
            <span>· ${cal.icon} ${cal.label}</span>
          </div>
        </div>
      </div>
      <div class="rpg-item-tooltip-drop">🎲 Drop rate: ${dropPct}%</div>
      ${item.desc ? `<div class="rpg-item-tooltip-desc">"${item.desc}"</div>` : ""}
      <div class="rpg-item-tooltip-stats">${statsHtml}</div>
      ${habsHtml}
    `;

    tip.classList.add("active");

    // Posicionar respecto a x, y de forma segura dentro de la ventana
    const rect = tip.getBoundingClientRect();
    const w = rect.width || 280, h = rect.height || 180;
    let posX = x + 14;
    let posY = y + 14;

    if (posX + w > window.innerWidth - 12) posX = window.innerWidth - w - 12;
    if (posX < 12) posX = 12;
    if (posY + h > window.innerHeight - 12) posY = y - h - 14;
    if (posY < 12) posY = 12;

    tip.style.left = `${posX}px`;
    tip.style.top = `${posY}px`;
  }

  function ocultarTooltipItem() {
    if (tooltipEl) {
      tooltipEl.classList.remove("active");
      tooltipEl.dataset.currentId = "";
    }
  }

  // Cerrar al tocar fuera o hacer scroll
  document.addEventListener("scroll", ocultarTooltipItem, true);
  document.addEventListener("pointerdown", e => {
    if (!e.target.closest(".rpg-coleccion-item") && !e.target.closest("#rpg-item-tooltip")) {
      ocultarTooltipItem();
    }
  });
  const COSTO_REROLL = { comun:100, raro:500, epico:2500, legendario:12000, mitico:50000 };

  const moverRareza = (actual, delta) => {
    const i = ORDEN_RAREZAS.indexOf(actual);
    if (i < 0) return actual;
    const n = Math.max(0, Math.min(ORDEN_RAREZAS.length - 1, i + delta));
    return ORDEN_RAREZAS[n];
  };

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
      p.consumible === original.consumible && p.sheet === sheet);
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
    SND(delta > 0 ? "victoria" : delta < 0 ? "derrota" : "sparkle");

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
      title: "¿Rerollear objetos?",
      message: `Se rerollearán <strong>${ids.length}</strong> objetos por <strong>${total} monedas</strong>.<br><br><em>88% misma rareza · 9% +1 tier · 2% +2 tiers · 1% -1 tier</em>`,
      variant: "warning", icon: "🎲", confirmText: `Pagar ${total} 🪙`, cancelText: "Cancelar"
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
        if (delta > 0) mejoras++; else if (delta < 0) bajadas++;
      }
      delete loot[id];
    });

    guardarLoot(loot); renderColeccion();
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
    b.type = "button"; b.className = "rpg-loot-usar";
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

  /* ---------- Cofres ---------- */
  function getLlavesDisponibles() {
    const loot = cargarLoot();
    // Llaves en el pool:
    // Común (plateada): "llave-pequena", "item-5-8"
    // Dorada: "llave-hierro", "item-4-8", "llave-dorada"
    const comunes = (loot["llave-pequena"] || 0) + (loot["item-5-8"] || 0);
    const doradas = (loot["llave-hierro"] || 0) + (loot["item-4-8"] || 0) + (loot["llave-dorada"] || 0);
    return { comunes, doradas, total: comunes + doradas, loot };
  }

  function consumirLlaveParaCofre(tipo) {
    const { comunes, doradas, loot } = getLlavesDisponibles();
    if (tipo === "hierro") {
      // Cofre plateado / de hierro: se abre con 1 Llave común (o 1 dorada como alternativa si no tiene comunes)
      if (comunes > 0) {
        if (loot["llave-pequena"] > 0) loot["llave-pequena"]--;
        else if (loot["item-5-8"] > 0) loot["item-5-8"]--;
        guardarLoot(loot);
        return true;
      } else if (doradas > 0) {
        if (loot["llave-hierro"] > 0) loot["llave-hierro"]--;
        else if (loot["item-4-8"] > 0) loot["item-4-8"]--;
        else if (loot["llave-dorada"] > 0) loot["llave-dorada"]--;
        guardarLoot(loot);
        return true;
      }
    } else if (tipo === "dorado") {
      // Cofre Dorado: se abre con 1 Llave dorada (o 2 llaves comunes)
      if (doradas > 0) {
        if (loot["llave-hierro"] > 0) loot["llave-hierro"]--;
        else if (loot["item-4-8"] > 0) loot["item-4-8"]--;
        else if (loot["llave-dorada"] > 0) loot["llave-dorada"]--;
        guardarLoot(loot);
        return true;
      } else if (comunes >= 2) {
        let restantes = 2;
        if (loot["llave-pequena"] > 0) {
          const gasto = Math.min(loot["llave-pequena"], restantes);
          loot["llave-pequena"] -= gasto;
          restantes -= gasto;
        }
        if (restantes > 0 && loot["item-5-8"] > 0) {
          loot["item-5-8"] -= restantes;
        }
        guardarLoot(loot);
        return true;
      }
    }
    return false;
  }

  function abrirCofre(tipo, cant, conLlave = false) {
    cant = cant || 1;
    const def = COFRES[tipo]; if (!def) return;

    if (conLlave) {
      const exito = consumirLlaveParaCofre(tipo);
      if (!exito) {
        SND("error");
        notifMascota?.("Sin llaves", tipo === "dorado" ? "Necesitas 1 Llave Dorada o 2 Llaves Comunes" : "Necesitas 1 Llave");
        return;
      }
    } else {
      const cost = def.precio * cant;
      if (getMonedas() < cost) { SND("error"); notifMascota?.("Sin monedas", `Necesitas ${cost}`); return; }
      setMonedas(getMonedas() - cost);
    }

    const n = rnd(def.cantMin, def.cantMax) * cant;
    const items = [];
    for (let i = 0; i < n; i++) items.push(sortearItem(sortearRareza(def.rarBoosts), sortearCalidad(def.calBoosts)));
    const loot = cargarLoot();
    items.forEach(it => { loot[it.id] = (loot[it.id] || 0) + 1; if (!it.consumible) aplicarBonus(it); });
    guardarLoot(loot);
    try {
      localStorage.setItem(K.cofres(), String(Number(localStorage.getItem(K.cofres()) || 0) + cant));
      window.dispatchEvent(new Event("sunadventures:progress"));
    } catch {}
    mostrarModalCofre(def, items);
    renderColeccion();
    renderCofres();
    const top = items.some(it => it.rar === "legendario" || it.rar === "mitico");
    SND(top ? "victoria" : "sparkle");
    notifMascota?.("¡Cofre Abierto!", `+${items.length} items del ${def.nombre}`);
  }

  function mostrarModalCofre(def, items) {
    let m = $("loot-cofre-modal");
    if (!m) { m = document.createElement("div"); m.id = "loot-cofre-modal"; m.className = "loot-cofre-modal"; document.body.appendChild(m); }
    const visualCab = def.imagen
      ? `<img class="loot-cofre-img" src="${def.imagen}" alt="${def.nombre}">`
      : `<span class="loot-cofre-emoji" style="color:${def.color}">${def.emoji}</span>`;
    let html = "";
    items.forEach(it => {
      const cal = CALIDADES[it.calidad || "normal"];
      const v = it.valFinal || it.val;
      html += `<div class="loot-cofre-item rar-${it.rar}"><div class="loot-cofre-item-sprite">${renderIcono(it, "48px")}</div><span class="loot-cofre-item-name">${it.nombre}</span><span class="loot-cofre-item-rar">${RAREZAS[it.rar].label}</span><span class="loot-cal-badge cal-${it.calidad || "normal"}">${cal.icon} ${cal.label}</span><span class="loot-cofre-item-val">+${v} ${it.tipo.toUpperCase()}</span></div>`;
    });
    m.innerHTML = `<div class="loot-cofre-panel"><div class="loot-cofre-header">${visualCab}<h3 class="loot-cofre-titulo">${def.nombre} Abierto</h3><button class="rpg-loot-modal-close">×</button></div><p class="loot-cofre-sub">¡Obtuviste <strong>${items.length}</strong> items!</p><div class="loot-cofre-items">${html}</div><button class="rpg-loot-usar" style="margin-top:1rem" id="btn-cerrar-cofre">¡Genial!</button></div>`;
    m.classList.add("active");
    if (window.hidratarIconos) window.hidratarIconos(m);
    m.onclick = e => { if (e.target === m || e.target.classList.contains("rpg-loot-modal-close") || e.target.id === "btn-cerrar-cofre") m.classList.remove("active"); };
  }

  /* ---------- Colección ---------- */
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
      grid += `<div class="rpg-coleccion-item rar-${p.rar || "comun"}${t ? "" : " bloqueado"}" data-id="${p.id}">${renderIcono(p)}${t ? `<span class="rpg-coleccion-cant">×${t}</span>` : ""}</div>`;
    });

    c.innerHTML = `
      <div class="rpg-coleccion-header">
        <span class="rpg-coleccion-titulo"><img src="img/sprites complementarios/libro.png" alt="" style="width:20px;height:20px;vertical-align:-3px;object-fit:contain;margin-right:6px;display:inline-block;">Colección</span>
        <span class="rpg-coleccion-count">${uniq} / ${POOL.length} · ${total} objetos</span>
      </div>
      <div class="rpg-col-filtros">
        ${filtros}
        ${puedeReroll ? `<button class="rpg-col-filtro" id="btn-reroll-cat" style="margin-left:auto;border-color:rgba(108,184,255,.5);color:#6cb8ff;font-weight:900;" title="88% misma · 9% +1 · 2% +2 · 1% -1">🎲 Reroll ${cat.label}</button>` : ""}
      </div>
      <div class="rpg-coleccion-grid">${grid}</div>`;

    if (window.hidratarIconos) window.hidratarIconos(c);
    qsa(".rpg-col-filtro[data-cat]", c).forEach(b => b.addEventListener("click", () => { filtro = b.dataset.cat; renderColeccion(); }));
    
    // Mini pop-up tooltip en hover / tap y detalle modal en click
    qsa(".rpg-coleccion-item", c).forEach(el => {
      const it = POOL.find(p => p.id === el.dataset.id);
      if (!it) return;

      el.addEventListener("pointerenter", e => {
        if (e.pointerType === "mouse") mostrarTooltipItem(it, e.clientX, e.clientY);
      });
      el.addEventListener("mousemove", e => {
        mostrarTooltipItem(it, e.clientX, e.clientY);
      });
      el.addEventListener("pointerleave", () => {
        ocultarTooltipItem();
      });

      // En dispositivos táctiles (o click/tap directo)
      el.addEventListener("click", e => {
        // En móvil/touch, el primer tap muestra el tooltip si no está activo, o abre el modal si se pulsa dos veces / click directo
        if (window.matchMedia("(hover: none)").matches) {
          const tip = getTooltipEl();
          const activo = tip.classList.contains("active") && tip.dataset.currentId === it.id;
          if (!activo) {
            e.stopPropagation();
            tip.dataset.currentId = it.id;
            const rect = el.getBoundingClientRect();
            mostrarTooltipItem(it, rect.left + rect.width / 2, rect.bottom + 8);
            return;
          }
        }
        ocultarTooltipItem();
        mostrarDetalleItem(it);
      });
    });

    $("btn-reroll-cat")?.addEventListener("click", async () => {
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

  /* ---------- Cofres render ---------- */
  function renderCofres() {
    const c = document.querySelector('[data-rpg-panel="cofres"]');
    if (!c) return;
    const llaves = getLlavesDisponibles();
    const grid = Object.entries(COFRES).map(([tipo, def]) => {
      const visual = def.imagen
        ? `<img class="rpg-cofre-img" src="${def.imagen}" alt="${def.nombre}" loading="lazy">`
        : `<span class="rpg-cofre-emoji">${def.emoji}</span>`;
      
      const svgLlave = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:2px;"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/></svg>`;
      const svgLlaveDorada = `<svg viewBox="0 0 24 24" fill="none" stroke="#ffd93d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:2px;"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15L19 4M18 5l2.5 2.5M15 8l2.5 2.5"/></svg>`;

      let botonLlaveHtml = "";
      if (tipo === "hierro") {
        const tieneLlave = llaves.comunes > 0 || llaves.doradas > 0;
        const infoTxt = llaves.comunes > 0 ? `(${llaves.comunes} ${svgLlave})` : `(${llaves.doradas} ${svgLlaveDorada})`;
        botonLlaveHtml = `<button class="rpg-cofre-btn rpg-cofre-llave-btn ${tieneLlave ? 'tiene-llave' : 'sin-llave'}" data-tipo="${tipo}" title="${tieneLlave ? `Abre con 1 Llave Común (${llaves.comunes} disp.)` : 'Necesitas 1 Llave Común'}">
          ${svgLlave} Abrir con Llave Común ${tieneLlave ? infoTxt : '(0)'}
        </button>`;
      } else if (tipo === "dorado") {
        const puedeAbrirDorado = llaves.doradas > 0 || llaves.comunes >= 2;
        const infoTxt = llaves.doradas > 0 ? `(${llaves.doradas} ${svgLlaveDorada})` : `(${Math.floor(llaves.comunes / 2)} usos)`;
        botonLlaveHtml = `<button class="rpg-cofre-btn rpg-cofre-llave-btn ${puedeAbrirDorado ? 'tiene-llave' : 'sin-llave'}" data-tipo="${tipo}" title="${puedeAbrirDorado ? 'Abre con 1 Llave Dorada o 2 Comunes' : 'Necesitas 1 Llave Dorada o 2 Comunes'}">
          ${svgLlaveDorada} Abrir con Llave Dorada ${puedeAbrirDorado ? infoTxt : '(0)'}
        </button>`;
      }

      return `<div class="rpg-cofre-card" data-tipo="${tipo}" style="--cofre-color:${def.color}">
        ${visual}
        <span class="rpg-cofre-nombre">${def.nombre}</span>
        <span class="rpg-cofre-precio"><span data-icono="moneda"></span> ${def.precio}</span>
        <div class="rpg-cofre-acciones">
          <button class="rpg-cofre-btn" data-tipo="${tipo}">Abrir (🪙)</button>
          ${botonLlaveHtml}
        </div>
      </div>`;
    }).join("");
    const svgCofreRegalo = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;display:inline-block;vertical-align:-3px;margin-right:6px;color:var(--accent,#ffd93d);"><path d="M20 12v10H4V12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
    c.innerHTML = `<div class="rpg-coleccion-header"><span class="rpg-coleccion-titulo">${svgCofreRegalo}Cofres</span><span class="rpg-coleccion-count">Ábrelos para conseguir botín</span></div><div class="rpg-barra-cofres-grid">${grid}</div>`;
    if (window.hidratarIconos) window.hidratarIconos(c);

    qsa(".rpg-cofre-btn:not(.rpg-cofre-llave-btn)", c).forEach(b => b.addEventListener("click", () => {
      const t = b.dataset.tipo;
      b.classList.add("shake");
      setTimeout(() => b.classList.remove("shake"), 600);
      setTimeout(() => abrirCofre(t, 1, false), 300);
    }));

    qsa(".rpg-cofre-llave-btn", c).forEach(b => b.addEventListener("click", () => {
      const t = b.dataset.tipo;
      b.classList.add("shake");
      setTimeout(() => b.classList.remove("shake"), 600);
      setTimeout(() => abrirCofre(t, 1, true), 300);
    }));
  }

  /* ---------- Eventos ---------- */
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

  /* ---------- API pública ---------- */
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
      guardarLoot(l); aplicarBonus(it);
      mostrarPopup(it); renderColeccion();
      return it;
    },
    reset: async () => {
      const ok = await confirmar({
        title: "¿Borrar TODO tu botín?",
        message: "Perderás todas las reliquias, objetos y bonus acumulados. Esta acción es irreversible.",
        variant: "danger", icon: "💀", confirmText: "Sí, borrar todo", cancelText: "Cancelar"
      });
      if (!ok) return;
      localStorage.removeItem(K.loot());
      localStorage.removeItem(K.stats());
      renderColeccion();
      window.dispatchEvent(new Event("rpg:stats-cambiados"));
    }
  };

  console.log("✅ rpg-loot.js v6 · " + POOL.length + " items · 3 cofres con sprite");
})();