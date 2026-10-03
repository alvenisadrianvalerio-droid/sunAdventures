/* ============================================================
   RPG.JS v8 — Aventura HARDCORE + pestaña Roguelike nativa
   · 15 regiones · 150 zonas · Enemigos con especiales
   · Jefes con 2 fases · Escalado brutal
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("rpg")) window._extraVistas.push("rpg");

(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n=0; const it=()=>{ if(window._TiendaAPI) return boot(); if(++n>50) return; setTimeout(it,100); }; return setTimeout(it,100); }
  const { ICONO, COMIDAS, getMonedas, setMonedas, cargarInv, notifMascota, getUserId } = API;
  const $   = id => document.getElementById(String(id).replace(/^#/,""));
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>[...r.querySelectorAll(s)];
  const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const clamp=(n,a=0,b=1e9)=>Math.max(a,Math.min(b,n));
  const SND = t=>{ try{window._snd?.(t);}catch{} };
  const MASCOTAS = window._MASCOTAS || {};
  const FX = det => window.dispatchEvent(new CustomEvent("rpg:fx",{detail:det}));
  const FX_KEY = id => (window.RpgCanvas?.HABILIDAD_FX?.[id]) || "slash";

  /* ============================================================
     🎨 SPRITES COMPLEMENTARIOS — Modo Aventura
     ============================================================ */
  const SPRITES_DIR_NEW = 'img/sprites%20complementarios/';
  const SPRITES_DIR_OLD = 'img/items%20de%20aventura/';

  const SPRITE_MAP_ENEMIGOS = {
    abeja: "araña", mariposa: "flor", caracol: "lentitud", pajaro: "tengu", conejo: "colmillo",
    lagarto: "dragon", pulpo: "kraken", tortuga: "golem", "dragon-bebe": "dragon",
    jirafa: "leon", hamburguesa: "icon", girasol: "girasol", hongo: "seta",
    escorpion: "scorpion", serpiente: "serpiente", escarabajo: "scorpion",
    "lobo-hielo": "lobo", "oso-polar": "lobo", "elemental-hielo": "hielo",
    "golem-lava": "golem", salamandra: "dragon", "fenix-joven": "fuego",
    esqueleto: "calavera", momia: "calavera", gargola: "demonio",
    "sapo-gigante": "rana", cocodrilo: "dragon", "bruja-pantano": "mago",
    "golem-cristal": "golem", murcielago: "murcielago", espectro: "fantasma",
    grifo: "leon", quimera: "oni", "elemental-aire": "orbe",
    sirena: "kraken", "kraken-joven": "kraken", tiburon: "kraken",
    "espectro-negro": "fantasma", vampiro: "vampiro", nigromante: "mago",
    "robot-guardia": "golem", dron: "ojo", "mech-gigante": "golem",
    "dragon-rojo": "dragon", "senor-abismo": "demonio",
    "girasol-anciano": "girasol", "arbol-ancestral": "arbol",
    "reina-cristal": "corona", faraon: "corona", "rey-glaciar": "corona",
    lich: "calavera", "senor-sombras": "demonio",
    jaguar: "leon", "mono-loco": "tengu", "serpiente-emplumada": "serpiente",
    "planta-carnivora": "brote", "tucan-sombrio": "tengu",
    "chaman-jaguar": "mago", "tigre-espiritu": "leon", "tarantula-gigante": "araña",
    "senor-selva": "corona",
    "rana-venenosa": "rana", "cocodrilo-muerto": "zombie", "serpiente-veneno": "serpiente",
    "espectro-fango": "fantasma", "hechicero-pantano": "mago",
    "rey-ranas": "rana", "treant-podrido": "arbol", "diosa-pantano": "corona",
    yeti: "troll", "lobo-blanco": "lobo", "gigante-hielo": "troll",
    "rey-yeti": "troll", "quimera-nieve": "oni", "dragon-blanco-joven": "dragon",
    "titan-glaciar": "corona",
    harpia: "tengu", "angel-caido": "demonio", "halcon-gigante": "tengu",
    serafin: "estrella", "quimera-alada": "oni", "dragon-tormenta": "dragon",
    "dios-cielo": "corona",
    "demonio-menor": "demonio", "alma-perdida": "fantasma", "cerberus-cachorro": "lobo",
    succubus: "demonio", "espectro-fuego": "fuego", "senor-demonio": "demonio",
    "lich-infierno": "calavera", "dragon-negro": "dragon",
    "senor-inframundo": "corona",
    horror: "demonio", aberracion: "oni", "ojo-vacio": "ojo", tentaculo: "kraken",
    "sombra-vacia": "fantasma", "caballero-vacio": "espada", "titan-vacio": "golem",
    "dragon-vacio": "dragon", "el-vacio": "corona"
  };

  const SPRITE_MAP_REGIONES = {
    praderas: "girasol", bosque: "arbol", cueva: "orbe", desierto: "fuego",
    glaciar: "hielo", volcan: "fuego", ruinas: "corona", sombras: "luna",
    abismo: "corona", selva: "arbol", pantano: "rana", tundra: "hielo",
    cielo: "estrella", inframundo: "demonio", vacio: "ojo"
  };

  function spriteHtml(nombre, cls = "rpg-sprite-img", alt = "") {
    if (!nombre) return "";
    const ext = (nombre === "mago" || nombre === "murcielago" || nombre === "serpiente" || nombre === "troll") ? ".webp" : ".png";
    const srcNuevo = `${SPRITES_DIR_NEW}${nombre}${ext}`;
    const srcViejo = `${SPRITES_DIR_OLD}${nombre}.png`;
    return `<img class="${cls}" src="${srcNuevo}" alt="${alt}" data-fallback="${srcViejo}" onerror="if(this.dataset.fallback){this.onerror=null;this.src=this.dataset.fallback;}">`;
  }

  /* ---------- 15 REGIONES ---------- */
  const REGIONES = [
    { id:"praderas", nombre:"Praderas de Girasoles", icono:ICONO.girasol, sprite:"girasol",
      base:["abeja","mariposa","caracol","pajaro","conejo"], elite:["jirafa","oveja","pollito","girasol"],
      jefe:"girasol-anciano", jefeNombre:"El Girasol Ancestral", jefeIcono:ICONO.girasol },
    { id:"bosque", nombre:"Bosque Umbrío", icono:ICONO.bosque,
      base:["lagarto","sapo-gigante","cocodrilo","pulpo","tortuga"], elite:["bruja-pantano","espectro","hongo"],
      jefe:"arbol-ancestral", jefeNombre:"El Árbol que Susurra", jefeIcono:ICONO.bosque },
    { id:"cueva", nombre:"Cavernas de Cristal", icono:ICONO.gema,
      base:["murcielago","golem-cristal","espectro","lagarto"], elite:["gargola","elemental-hielo","golem-lava"],
      jefe:"reina-cristal", jefeNombre:"La Reina de Cristal", jefeIcono:ICONO.gema },
    { id:"desierto", nombre:"Desierto Ardiente", icono:ICONO.fuego,
      base:["escorpion","serpiente","escarabajo","momia"], elite:["salamandra","fenix-joven","golem-lava"],
      jefe:"faraon", jefeNombre:"El Faraón Olvidado", jefeIcono:ICONO.corona },
    { id:"glaciar", nombre:"Glaciar Eterno", icono:ICONO.copo,
      base:["lobo-hielo","oso-polar","elemental-hielo","espectro"], elite:["gargola","quimera","elemental-aire"],
      jefe:"rey-glaciar", jefeNombre:"El Rey del Hielo Eterno", jefeIcono:ICONO.corona },
    { id:"volcan", nombre:"Volcán Dormido", icono:ICONO.fuego,
      base:["golem-lava","salamandra","fenix-joven","escorpion"], elite:["quimera","gargola","espectro-negro"],
      jefe:"dragon-rojo", jefeNombre:"El Dragón Rojo", jefeIcono:ICONO.fuego },
    { id:"ruinas", nombre:"Ruinas Antiguas", icono:ICONO.castillo,
      base:["esqueleto","momia","gargola","espectro"], elite:["nigromante","vampiro","golem-cristal"],
      jefe:"lich", jefeNombre:"El Lich Supremo", jefeIcono:ICONO.corona },
    { id:"sombras", nombre:"Reino de Sombras", icono:ICONO.luna,
      base:["espectro-negro","vampiro","nigromante","murcielago"], elite:["kraken-joven","tiburon","sirena"],
      jefe:"senor-sombras", jefeNombre:"El Señor de las Sombras", jefeIcono:ICONO.luna },
    { id:"abismo", nombre:"Abismo Final", icono:ICONO.corona,
      base:["mech-gigante","robot-guardia","dron","golem-cristal"], elite:["dragon-rojo","kraken-joven","nigromante"],
      jefe:"senor-abismo", jefeNombre:"El Señor del Abismo", jefeIcono:ICONO.corona },
    { id:"selva", nombre:"Selva Ancestral", icono:ICONO.bosque,
      base:["jaguar","mono-loco","serpiente-emplumada","planta-carnivora","tucan-sombrio"], elite:["chaman-jaguar","tigre-espiritu","tarantula-gigante"],
      jefe:"senor-selva", jefeNombre:"El Señor de la Selva", jefeIcono:ICONO.bosque },
    { id:"pantano", nombre:"Pantano Maldito", icono:ICONO.gota,
      base:["rana-venenosa","cocodrilo-muerto","bruja-pantano","serpiente-veneno","espectro-fango"], elite:["hechicero-pantano","rey-ranas","treant-podrido"],
      jefe:"diosa-pantano", jefeNombre:"La Diosa del Pantano", jefeIcono:ICONO.gota },
    { id:"tundra", nombre:"Tundra Helada", icono:ICONO.copo,
      base:["yeti","lobo-blanco","oso-polar","elemental-hielo","gigante-hielo"], elite:["rey-yeti","quimera-nieve","dragon-blanco-joven"],
      jefe:"titan-glaciar", jefeNombre:"El Titán Glaciar", jefeIcono:ICONO.copo },
    { id:"cielo", nombre:"Cielo Celestial", icono:ICONO.estrella,
      base:["grifo","angel-caido","harpia","halcon-gigante","elemental-aire"], elite:["serafin","quimera-alada","dragon-tormenta"],
      jefe:"dios-cielo", jefeNombre:"El Dios del Cielo", jefeIcono:ICONO.estrella },
    { id:"inframundo", nombre:"Inframundo Ardiente", icono:ICONO.fuego,
      base:["demonio-menor","alma-perdida","cerberus-cachorro","succubus","espectro-fuego"], elite:["senor-demonio","lich-infierno","dragon-negro"],
      jefe:"senor-inframundo", jefeNombre:"El Señor del Inframundo", jefeIcono:ICONO.fuego },
    { id:"vacio", nombre:"Vacío Absoluto", icono:ICONO.corona,
      base:["horror","aberracion","ojo-vacio","tentaculo","sombra-vacia"], elite:["caballero-vacio","titan-vacio","dragon-vacio"],
      jefe:"el-vacio", jefeNombre:"El Vacío", jefeIcono:ICONO.corona }
  ];

  const BIOMAS = {
    praderas:  { imagen:"img/biomas/gen-5480873c-7b50-45b8-a3c1-abc457a2f0fa.png", acento:"#ffd84d", ambiente:"Campo de girasoles" },
    bosque:    { imagen:"img/biomas/gen-df614595-485a-47f1-a074-7d4b4aa3d08e.png", acento:"#65d68b", ambiente:"Senderos del bosque" },
    cueva:     { imagen:"img/biomas/gen-e46023c3-4ac1-4361-b312-e6f525bcead6.png", acento:"#81ddff", ambiente:"Cueva de cristal" },
    desierto:  { imagen:"img/biomas/gen-3b1ee61a-d08b-44bc-a27b-9c56f5e009ef.png", acento:"#ffc36e", ambiente:"Dunas antiguas" },
    glaciar:   { imagen:"img/biomas/gen-02a9154e-49f2-4451-b734-a787ce316fd5.png", acento:"#a8eaff", ambiente:"Glaciar eterno" },
    volcan:    { imagen:"img/biomas/gen-6148d727-5f04-4360-b612-587e58fbd20d.png", acento:"#ff7958", ambiente:"Cráter en erupción" },
    ruinas:    { imagen:"img/biomas/gen-5510680d-7fe8-4834-b72d-04dd75fc60e2.png", acento:"#e9bd78", ambiente:"Ruinas sepultadas" },
    sombras:   { imagen:"img/biomas/gen-710f318c-55ee-45ba-aad5-7afcca056906.png", acento:"#b89aff", ambiente:"Bosque encantado" },
    abismo:    { imagen:"img/biomas/gen-7f3a60dc-0b7b-4b78-9ae9-e63140799a1c.png", acento:"#ff8268", ambiente:"Abismo de lava" },
    selva:     { imagen:"img/biomas/gen-54356df9-2637-441f-96a0-4742f61f6a57.png", acento:"#74dc8a", ambiente:"Selva ancestral" },
    pantano:   { imagen:"img/biomas/gen-675040d8-722c-4ac6-bf7d-6d236587f618.png", acento:"#76dfc2", ambiente:"Pantano de los espíritus" },
    tundra:    { imagen:"img/biomas/gen-b8ac5df4-7a81-443c-8cec-4d4f30bef9aa.png", acento:"#caeaff", ambiente:"Bosque de escarcha" },
    cielo:     { imagen:"img/biomas/gen-ef4c41e3-8713-47f7-acde-eefb81a85d11.png", acento:"#ffb3dc", ambiente:"Jardines celestiales" },
    inframundo:{ imagen:"img/biomas/gen-f34b37dd-a44a-4ac1-8ef3-a5b18a314480.png", acento:"#ff9a55", ambiente:"Tierras del inframundo" },
    vacio:     { imagen:"img/biomas/gen-a36ad96d-725f-45b4-8793-4f27add89fb3.png", acento:"#b6a2ff", ambiente:"Ciudad del vacío" }
  };
  REGIONES.forEach(reg => { reg.bioma = BIOMAS[reg.id]; });

  const NOMBRES = {
    abeja:"Abeja Soldado", mariposa:"Mariposa Sombría", caracol:"Caracol Blindado", pajaro:"Gorrión Guerrero", conejo:"Conejo Espinoso",
    lagarto:"Lagarto Espinoso", pulpo:"Pulpo Abisal", tortuga:"Tortuga de Hierro", "dragon-bebe":"Dragón Bebé",
    jirafa:"Jirafa Colosal", hamburguesa:"Hamburguesa Mutante", girasol:"Girasol Guardián", hongo:"Hongo Lunar",
    escorpion:"Escorpión de Arena", serpiente:"Serpiente del Desierto", escarabajo:"Escarabajo Sagrado",
    "lobo-hielo":"Lobo de Hielo", "oso-polar":"Oso Polar", "elemental-hielo":"Elemental Glacial",
    "golem-lava":"Golem de Lava", salamandra:"Salamandra Ígnea", "fenix-joven":"Fénix Joven",
    esqueleto:"Esqueleto Guerrero", momia:"Momia Maldita", gargola:"Gárgola de Piedra",
    "sapo-gigante":"Sapo Gigante", cocodrilo:"Cocodrilo Sombrío", "bruja-pantano":"Bruja del Pantano",
    "golem-cristal":"Golem de Cristal", murcielago:"Murciélago Vampiro", espectro:"Espectro",
    grifo:"Grifo Celestial", quimera:"Quimera", "elemental-aire":"Elemental de Aire",
    sirena:"Sirena Hipnótica", "kraken-joven":"Kraken Joven", tiburon:"Tiburón Colosal",
    "espectro-negro":"Espectro Negro", vampiro:"Vampiro Lord", nigromante:"Nigromante",
    "robot-guardia":"Robot Guardián", dron:"Dron Asesino", "mech-gigante":"Mech Gigante",
    "dragon-rojo":"Dragón Rojo Ancestral", "senor-abismo":"Señor del Abismo",
    "girasol-anciano":"Girasol Ancestral", "arbol-ancestral":"Árbol Susurrante",
    "reina-cristal":"Reina de Cristal", faraon:"Faraón Olvidado", "rey-glaciar":"Rey del Hielo",
    lich:"Lich Supremo", "senor-sombras":"Señor de Sombras",
    jaguar:"Jaguar Sangriento", "mono-loco":"Mono Poseído", "serpiente-emplumada":"Serpiente Emplumada",
    "planta-carnivora":"Planta Carnívora", "tucan-sombrio":"Tucán Sombrío",
    "chaman-jaguar":"Chamán Jaguar", "tigre-espiritu":"Tigre Espíritu", "tarantula-gigante":"Tarántula Gigante",
    "senor-selva":"El Señor de la Selva",
    "rana-venenosa":"Rana Venenosa", "cocodrilo-muerto":"Cocodrilo No-Muerto", "serpiente-veneno":"Serpiente de Veneno",
    "espectro-fango":"Espectro del Fango", "hechicero-pantano":"Hechicero del Pantano",
    "rey-ranas":"Rey de las Ranas", "treant-podrido":"Treant Podrido", "diosa-pantano":"La Diosa del Pantano",
    yeti:"Yeti", "lobo-blanco":"Lobo Blanco", "gigante-hielo":"Gigante de Hielo",
    "rey-yeti":"Rey Yeti", "quimera-nieve":"Quimera de Nieve", "dragon-blanco-joven":"Dragón Blanco Joven",
    "titan-glaciar":"El Titán Glaciar",
    harpia:"Harpía", "angel-caido":"Ángel Caído", "halcon-gigante":"Halcón Gigante",
    serafin:"Serafín", "quimera-alada":"Quimera Alada", "dragon-tormenta":"Dragón de Tormenta",
    "dios-cielo":"El Dios del Cielo",
    "demonio-menor":"Demonio Menor", "alma-perdida":"Alma Perdida", "cerberus-cachorro":"Cerberus Cachorro",
    succubus:"Súcubo", "espectro-fuego":"Espectro de Fuego", "senor-demonio":"Señor Demonio",
    "lich-infierno":"Lich del Infierno", "dragon-negro":"Dragón Negro",
    "senor-inframundo":"El Señor del Inframundo",
    horror:"Horror", aberracion:"Aberración", "ojo-vacio":"Ojo del Vacío", tentaculo:"Tentáculo",
    "sombra-vacia":"Sombra Vacía", "caballero-vacio":"Caballero del Vacío", "titan-vacio":"Titán Vacío",
    "dragon-vacio":"Dragón Vacío", "el-vacio":"El Vacío"
  };

  /* ---------- 150 zonas ---------- */
  const ZONAS = (() => {
    const z = [];
    REGIONES.forEach((reg, ri) => {
      for (let i = 1; i <= 10; i++) {
        const idx = ri * 10 + i, esJefe = i === 10, esMini = i === 5, esElite = i >= 6 && i <= 9;
        const hp  = Math.round(45 + idx*30 + idx*idx*3.6 + (esJefe ? idx*350 : esMini ? idx*100 : 0));
        const atk = Math.round(7 + idx*2.6 + Math.pow(idx,1.75)*1.3 + (esJefe ? idx*12 : esMini ? idx*5 : 0));
        const xp  = Math.round(9 + idx*7 + (esJefe ? idx*100 : esMini ? idx*25 : 0));
        const mon = Math.round(3 + idx*1.4 + (esJefe ? 55 : esMini ? 15 : 0));
        const enemigos = esJefe ? [reg.jefe] : esMini ? [...reg.elite.slice(0,2), reg.base[0]] : esElite ? reg.elite : reg.base;
        z.push({
          id:`${reg.id}-${i}`, nombre: esJefe ? reg.jefeNombre : `${reg.nombre} · ${i}`,
          desc: esJefe ? "⚔️ JEFE DE REGIÓN" : esMini ? "★ Mini-jefe" : reg.nombre,
          icono: esJefe ? reg.jefeIcono : reg.icono, nivel: idx, enemigos, hp, atk, xp, monedas:mon,
          jefe: esJefe, miniJefe: esMini, region: reg.id, regionNombre: reg.nombre, orden: idx
        });
      }
    });
    return z;
  })();

  const GRUPOS = REGIONES.map((reg, i) => ({
    id:i, nombre:reg.nombre, icono:reg.icono, sprite: SPRITE_MAP_REGIONES[reg.id] || reg.sprite, jefe:reg.jefeNombre, jefeIcono:reg.jefeIcono, bioma:reg.bioma,
    zonas: ZONAS.filter(z => Math.floor((z.orden-1)/10) === i),
    nivelMin: i*10+1, nivelMax: (i+1)*10
  }));

  /* ---------- Estado ---------- */
  const KEY = () => `sa_rpg_${getUserId()}`;
  const def = () => ({ nivel:1, xp:0, hp:100, enemigosDerrotados:0, jefesDerrotados:[], zonasConquistadas:[], zonaActual:null, statsBase:{atk:10,def:3} });
  const cargar = () => { try { const r = localStorage.getItem(KEY()); return r ? { ...def(), ...JSON.parse(r) } : def(); } catch { return def(); } };
  const guardar = s => { try { localStorage.setItem(KEY(), JSON.stringify(s)); } catch {} };
  const statsLoot = () => { try { return JSON.parse(localStorage.getItem(`sa_rpg_stats_${getUserId()}`) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}'); } catch { return { atkBonus:0, defBonus:0, hpBonus:0 }; } };
  const bonus = () => { try { return window._getBonusActivos?.() || []; } catch { return []; } };
  const bonusTipo = t => bonus().filter(x=>x.tipo===t).reduce((s,x)=>s+(x.val||0),0);
  const tieneBonus = t => bonus().some(x => x.tipo === t);

  let state = cargar();
  if (!Array.isArray(state.zonasConquistadas)) state.zonasConquistadas = [];
  const hpMax       = () => 80 + state.nivel*20 + (statsLoot().hpBonus||0) + bonusTipo("hp_max");
  const atkTotal    = () => state.statsBase.atk + state.nivel*3 + (statsLoot().atkBonus||0) + bonusTipo("atk_fijo");
  const defTotal    = () => state.statsBase.def + state.nivel*2 + (statsLoot().defBonus||0) + bonusTipo("def_fijo");
  const xpParaSubir = () => Math.round(state.nivel * 320 + Math.pow(state.nivel, 2.3) * 60);

  let enemigo = null, turnoJugador = true, overlayObjetos = false;
  let buffsHeroe = [], buffsEnemigo = [];

  /* ---------- Inyección de sección y nav ---------- */
  function inyectarSeccion() {
    if ($("rpg")) return;
    const sec = document.createElement("section");
    sec.id = "rpg"; sec.className = "rpg-section view"; sec.dataset.view = "rpg";
    sec.innerHTML = `<div class="rpg-header"><p class="rpg-subtitle">15 regiones, 150 zonas</p></div><div id="rpg-content"></div>`;
    const f = qs(".site-footer");
    f ? f.parentNode.insertBefore(sec, f) : document.body.appendChild(sec);
  }
  function inyectarNav() {
  if (qs('[data-view-link="rpg"]')) return;
  const nav = qs(".nav-links"); if (!nav) return;
  const a = document.createElement("a");
  a.href = "#rpg"; a.className = "nav-link"; a.dataset.viewLink = "rpg";
  a.innerHTML = `<span class="ui-icon nav-link-icon" data-icono="espada"></span><span class="nav-link-text">Aventura</span>`;
  nav.appendChild(a);
  }

  function render() {
    inyectarNav(); inyectarSeccion();
    const c = $("rpg-content"); if (!c) return;
    if (enemigo) { c.classList.add("rpg-en-batalla"); renderBatalla(c); }
    else { c.classList.remove("rpg-en-batalla"); renderPantalla(c); }
  }

  /* ---------- ✅ Render principal con pestaña Roguelike NATIVA ---------- */
  function renderPantalla(c) {
    const tab = c.dataset.tabActiva || "zonas";
    c.innerHTML = `
      <div class="rpg-tabs" role="tablist">
        <button type="button" class="rpg-tab ${tab==="zonas"?"active":""}" data-rpg-tab="zonas">
          <span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/pocion.png" alt=""></span><span class="rpg-tab-text">Zonas</span>
        </button>
        <button type="button" class="rpg-tab ${tab==="objetos"?"active":""}" data-rpg-tab="objetos">
          <span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/hamburguesa.png" alt=""></span><span class="rpg-tab-text">Objetos</span>
        </button>
        <button type="button" class="rpg-tab ${tab==="cofres"?"active":""}" data-rpg-tab="cofres">
          <span class="rpg-tab-icon" aria-hidden="true"><img src="img/rpg/items/cofre-madera.png?v=2" alt=""></span><span class="rpg-tab-text">Cofres</span>
        </button>
        <button type="button" class="rpg-tab" data-rpg-tab="roguelike">
          <span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/dado.png" alt=""></span><span class="rpg-tab-text">Roguelike</span>
        </button>
      </div>
      <div class="rpg-panel ${tab==="zonas"?"active":""}" data-rpg-panel="zonas">${htmlMapa()}</div>
      <div class="rpg-panel ${tab==="objetos"?"active":""}" data-rpg-panel="objetos"></div>
      <div class="rpg-panel ${tab==="cofres"?"active":""}" data-rpg-panel="cofres"></div>`;

    qsa(".rpg-tab", c).forEach(t => t.addEventListener("click", () => {
      const target = t.dataset.rpgTab;

      /* ⚡ Pestaña Roguelike → panel independiente */
      if (target === "roguelike") {
        qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
        qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", false));
        if (window.RpgRoguelike?.abrir) window.RpgRoguelike.abrir();
        else console.warn("[rpg.js] RpgRoguelike no está cargado todavía");
        return;
      }

      /* Pestañas normales */
      c.dataset.tabActiva = target;
      qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
      qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === target));
      window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail:{ tab:target } }));
    }));

    if (window.hidratarIconos) window.hidratarIconos(c);
    setTimeout(() => window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail:{ tab } })), 0);
  }

  function htmlMapa() {
    const m = MASCOTAS[localStorage.getItem("mascota_actual")||"mapache"] || MASCOTAS.mapache;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const xpPct = clamp(state.xp / xpParaSubir() * 100);
    const st = statsLoot();
    const bonusTxt = (st.atkBonus + st.defBonus + st.hpBonus) > 0
      ? `<span style="font-size:.68rem;opacity:.75;margin-left:.4rem;">+${st.atkBonus}ATK +${st.defBonus}DEF +${st.hpBonus}HP</span>` : "";
    return `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span>${bonusTxt}</div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          <div class="rpg-barra-label"><span>XP</span><span>${state.xp} / ${xpParaSubir()}</span></div>
          <div class="rpg-barra xp"><span style="width:${xpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda||""} ${getMonedas()}</div>
      </div>
      <div class="rpg-grupos-grid">
        ${GRUPOS.map(g => {
          const completadas = g.zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
          const primeraZona = g.zonas[0];
          const desbloqueado = window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(primeraZona.id) : (state.nivel >= g.nivelMin - 2 || state.enemigosDerrotados >= g.nivelMin * 6);
          const sImg = g.sprite ? spriteHtml(g.sprite, "rpg-grupo-sprite-img", g.nombre) : "";
          return `<button type="button" class="rpg-grupo-card ${desbloqueado?"":"bloqueada"}" data-grupo="${g.id}" style="--bioma-img:url('${g.bioma.imagen}');--bioma-acento:${g.bioma.acento}" ${desbloqueado?"":"disabled"}>
            <span class="rpg-grupo-fondo" aria-hidden="true"></span>
            <div class="rpg-grupo-icono">${sImg || g.icono || ""}</div>
            <div class="rpg-grupo-nombre">${g.nombre}</div>
            <div class="rpg-grupo-ambiente">${g.bioma.ambiente}</div>
            <div class="rpg-grupo-rango">Nv ${g.nivelMin}–${g.nivelMax}</div>
            <div class="rpg-grupo-progreso"><span style="width:${(completadas/10)*100}%"></span></div>
            <div class="rpg-grupo-badge">${g.zonas.some(z => z.jefe && state.jefesDerrotados.includes(z.id)) ? "👑" : `${completadas}/10`}</div>
          </button>`;
        }).join("")}
      </div>
      <div style="display:flex;justify-content:center;margin:1rem 0;">
  <button type="button" class="rpg-btn huir" data-rpg-accion="descansar"
          style="max-width:300px;padding:.8rem 1.4rem;">
    💤 Descansar <span id="rpg-rest-cost" style="margin-left:.4rem;opacity:.85;">—</span>
  </button>
</div>
      <div class="rpg-idle">
        <div class="rpg-idle-icono">${ICONO.espada||""}</div>
        <div class="rpg-idle-titulo">Elige una región</div>
        <div class="rpg-idle-desc">Enemigos derrotados: ${state.enemigosDerrotados}</div>
      </div>`;
  }

  /* ---------- Popup de grupo ---------- */
  function abrirPopupGrupo(grupo) {
    let m = $("rpg-popup-grupo"); if (m) m.remove();
    m = document.createElement("div");
    m.id = "rpg-popup-grupo"; m.className = "rpg-popup-grupo";
    const zonas = grupo.zonas;
    const conquistadas = zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
    const desbloqueada = z => window._rpgZonaDesbloqueada
      ? window._rpgZonaDesbloqueada(z.id)
      : state.nivel >= z.nivel - 2 || state.enemigosDerrotados >= z.nivel * 6;
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
        <div class="rpg-popup-zonas" aria-label="Zonas de la región">
          ${zonas.map((z, i) => {
            const open = desbloqueada(z);
            const conquistada = state.zonasConquistadas.includes(z.id);
            const tipo = z.jefe ? "Jefe de región" : z.miniJefe ? "Mini-jefe" : z.nivel % 10 >= 6 ? "Encuentro élite" : "Encuentro";
            const cls = ["rpg-popup-dot", "rpg-popup-zone", z.jefe ? "jefe" : z.miniJefe ? "minijefe" : "", !open ? "bloqueada" : "", conquistada ? "conquistada" : ""].filter(Boolean).join(" ");
            const zSprite = z.jefe ? "corona" : z.miniJefe ? "calavera" : SPRITE_MAP_ENEMIGOS[z.enemigos?.[0]] || (open ? "espada" : null);
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

  document.addEventListener("click", e => {
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

  /* ---------- Batalla ---------- */
  function renderBatalla(c) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual")||"mapache"] || MASCOTAS.mapache;
    const spriteKey = enemigo.sprite || SPRITE_MAP_ENEMIGOS[enemigo.id];
    const eSpriteEl = spriteKey ? spriteHtml(spriteKey, "rpg-enemy-sprite-img", enemigo.nombre) : "";
    const eContent = eSpriteEl || eIcon;
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const habs = window.RpgHabilidades?.ataquesDesbloqueados(mascotaId, state.nivel) || [];
    const esFase2 = enemigo.phase === 2;
    c.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span></div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          ${enemigo.dot ? `<div class="rpg-barra-label" style="color:#ff9a3d"><span>🔥 Quemadura</span><span>${enemigo.dot} dmg/turno</span></div>` : ""}
          ${state.sangrado > 0 ? `<div class="rpg-barra-label" style="color:#ff5470"><span>🩸 Sangrado</span><span>${state.sangrado} dmg/turno</span></div>` : ""}
        </div>
        <div class="rpg-coins">${ICONO.moneda||""} ${getMonedas()}</div>
      </div>
      <div class="rpg-batalla ${esFase2 ? 'rpg-enraged' : ''}" id="rpg-batalla">
        <div class="rpg-batalla-top">
          <div class="rpg-fighter" id="fighter-heroe">
            <div class="rpg-fighter-sprite" id="sprite-heroe"><img src="${m.imagen}" alt="" style="width:90px;height:90px;max-width:90px;max-height:90px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
            <div class="rpg-fighter-nombre">${m.nombre}</div>
            <div class="rpg-fighter-hp">${Math.round(state.hp)} HP</div>
            <div class="rpg-buffs" id="buffs-heroe"></div>
          </div>
          <div class="rpg-vs">VS</div>
          <div class="rpg-fighter" id="fighter-enemigo">
            <div class="rpg-fighter-sprite enemigo ${esFase2 ? 'fase2' : ''}" id="sprite-enemigo">${eContent}</div>
            <div class="rpg-fighter-nombre">${enemigo.nombre} ${enemigo.jefe ? (esFase2 ? '🔥 FASE 2' : '👑') : ''}</div>
            <div class="rpg-fighter-hp" id="hp-enemigo">${Math.round(enemigo.hp)} HP${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}</div>
            <div class="rpg-buffs" id="buffs-enemigo"></div>
          </div>
        </div>
        <div class="rpg-log" id="rpg-log"><div class="rpg-log-item info">¡Un ${enemigo.nombre} aparece!</div></div>
        <div class="rpg-habs-grid" id="rpg-habs-grid">
          ${habs.length ? habs.map(h => `
            <button type="button" class="rpg-hab rpg-hab-${h.tipo}" data-hab="${h.id}" title="${h.desc}">
              <span class="rpg-hab-nombre">${h.nombre}</span><span class="rpg-hab-lv">Nv ${h.lv}</span>
            </button>`).join("") : `
            <button type="button" class="rpg-hab rpg-hab-daño" data-hab="ataque-basico" title="Ataque básico">
              <span class="rpg-hab-nombre">Ataque</span><span class="rpg-hab-lv">Básico</span>
            </button>`}
        </div>
        <div class="rpg-acciones" id="rpg-acciones">
          <button type="button" class="rpg-btn objeto" id="btn-objeto">🧪 Objeto</button>
          <button type="button" class="rpg-btn huir" id="btn-huir">🏃 Huir</button>
        </div>
        <div id="rpg-objetos-wrap"></div>
      </div>`;
    if (window.hidratarIconos) window.hidratarIconos(c);
    qsa(".rpg-hab", c).forEach(b => b.addEventListener("click", () => usarHabilidad(b.dataset.hab)));
    $("#btn-objeto")?.addEventListener("click", toggleObjetos);
    $("#btn-huir")?.addEventListener("click", huir);
    renderBuffs();
  }

  function renderBuffs() {
    const h = $("buffs-heroe"), e = $("buffs-enemigo");
    const chip = (t,v,l) => `<span class="rpg-buff-chip ${t}">${l||t.toUpperCase()} ${v>0?"+":""}${v}</span>`;
    if (h) h.innerHTML = buffsHeroe.map(b => chip(b.tipo, b.val, b.label)).join("");
    if (e) e.innerHTML = buffsEnemigo.map(b => chip(b.tipo, b.val, b.label)).join("");
  }
  const buffVal = t => buffsHeroe.filter(b => b.tipo === t).reduce((s,b) => s+b.val, 0);
  function tickBuffs() {
    buffsHeroe = buffsHeroe.map(b => ({ ...b, turnos: b.turnos-1 })).filter(b => b.turnos > 0);
    buffsEnemigo = buffsEnemigo.map(b => ({ ...b, turnos: b.turnos-1 })).filter(b => b.turnos > 0);
    renderBuffs();
  }

  const ESPECIALES = {
    comun:  ['heal', 'buff', 'debuff', 'poison'],
    elite:  ['multihit', 'drain', 'shield', 'curse'],
    jefe:   ['firebreath', 'summon', 'apocalypse', 'curse']
  };

  function entrarZona(id) {
    const z = ZONAS.find(x => x.id === id); if (!z) return;
    state.zonaActual = z.id; guardar(state);
    const eId = z.enemigos[rnd(0, z.enemigos.length-1)];
    const v = rnd(-20,20)/100;
    const hp = Math.round(z.hp * (1+v));
    const tier = z.jefe ? 'jefe' : z.miniJefe ? 'elite' : (z.nivel >= 6 && z.nivel % 10 >= 6 && z.nivel % 10 <= 9) ? 'elite' : 'comun';
    const esp = ESPECIALES[tier][rnd(0, ESPECIALES[tier].length-1)];
    const spriteName = SPRITE_MAP_ENEMIGOS[eId] || (z.jefe ? 'corona' : z.miniJefe ? 'calavera' : 'espada');
    enemigo = {
      id:eId, iconoKey:eId, icono:z.icono, sprite:spriteName, nombre:NOMBRES[eId]||eId, hpMax:hp, hp,
      atk:Math.round(z.atk*(1+v)), xp:z.xp, monedas:z.monedas, jefe:!!z.jefe,
      dot:0, dotDur:0, shield:0, phase:1, tier,
      special: esp, specialCD: z.jefe ? 2 : z.miniJefe ? 3 : 4, specialTimer: z.jefe ? 2 : z.miniJefe ? 3 : 4
    };
    turnoJugador = true; overlayObjetos = false;
    buffsHeroe = []; buffsEnemigo = [];
    SND("blip"); render();
  }

  function log(txt, tipo="info") {
    const l = $("rpg-log"); if (!l) return;
    const d = document.createElement("div");
    d.className = "rpg-log-item " + tipo; d.textContent = txt;
    l.appendChild(d); l.scrollTop = l.scrollHeight;
  }
  function floatDmg(sel, txt, tipo="daño") {
    const el = qs(sel); if (!el) return;
    const f = document.createElement("span");
    f.className = "rpg-float " + tipo; f.textContent = txt;
    el.style.position = "relative"; f.style.left = "50%"; f.style.top = "20%";
    el.appendChild(f); setTimeout(() => f.remove(), 1000);
  }
  function deshab(d) {
    qsa(".rpg-hab", document).forEach(b => b.disabled = d);
    ["#btn-objeto","#btn-huir"].forEach(s => { const b = qs(s); if (b) b.disabled = d; });
  }
  function actualizarHPs() {
    const he = $("hp-enemigo");
    if (he) he.textContent = `${Math.max(0,enemigo.hp)} HP${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}`;
    const hh = qs("#fighter-heroe .rpg-fighter-hp"); if (hh) hh.textContent = `${Math.round(state.hp)} HP`;
    const b = qs(".rpg-barra.hp > span"); if (b) b.style.width = clamp(state.hp/hpMax()*100) + "%";
  }

  function aplicarDmgEnemigo(dmg) {
    if (enemigo.shield > 0) {
      const abs = Math.min(dmg, enemigo.shield);
      enemigo.shield -= abs; dmg -= abs;
    }
    enemigo.hp = Math.max(0, enemigo.hp - dmg);
  }
  function chequearFaseJefe() {
    if (enemigo.jefe && enemigo.phase === 1 && enemigo.hp / enemigo.hpMax <= 0.5) {
      enemigo.phase = 2;
      enemigo.atk = Math.round(enemigo.atk * 1.4);
      enemigo.shield = Math.round(enemigo.hpMax * 0.12);
      log('🔥 ¡EL JEFE SE ENFURECE! +40% ATK', 'critico');
      SND('growl');
      const b = $('rpg-batalla');
      if (b) b.classList.add('rpg-enraged');
    }
  }

  function usarHabilidad(habId) {
    if (!enemigo || !turnoJugador) return;

    if (habId === "ataque-basico") {
      turnoJugador = false; deshab(true);
      const dmg = Math.max(1, Math.round(atkTotal() * 0.9));
      aplicarDmgEnemigo(dmg);
      log(`Atacas por ${dmg} daño.`, "daño");
      floatDmg("#sprite-enemigo", "-"+dmg, "daño");
      FX({ tipo:"attack", target:"enemy", valor:dmg, fxKey:"slash" });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 800);
      return;
    }

    const hab = window.RpgHabilidades?.ataquePorId(habId);
    if (!hab) return;
    turnoJugador = false; deshab(true);
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const pasiva = window.RpgHabilidades?.getPasiva(mascotaId) || {};
    const fxKey = FX_KEY(habId);

    if (hab.tipo === "boost" && hab.buff) {
      Object.entries(hab.buff).forEach(([k,v]) => {
        if (["atk","def","crit","esq"].includes(k))
          buffsHeroe.push({ tipo:k, val:v, turnos: hab.buff.dur||3, label:k.toUpperCase() });
      });
      log(`✨ ${hab.nombre}: buff aplicado.`, "curar");
      FX({ tipo:"buff", target:"hero", fxKey:"buffAtk" });
      renderBuffs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "soporte") {
      const curado = Math.round(hpMax() * (hab.heal||0.3));
      const antes = state.hp;
      state.hp = clamp(state.hp + curado, 0, hpMax());
      guardar(state);
      if (hab.limpia) { enemigo.dot = 0; log("🧼 Limpias efectos negativos.", "curar"); }
      if (hab.buff) {
        Object.entries(hab.buff).forEach(([k,v]) => {
          if (["atk","def"].includes(k)) buffsHeroe.push({ tipo:k, val:v, turnos:hab.buff.dur||3, label:k.toUpperCase() });
        });
        renderBuffs();
      }
      log(`💚 ${hab.nombre}: +${Math.round(state.hp-antes)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp-antes)}`, "curar");
      FX({ tipo:"heal", target:"hero", valor:Math.round(state.hp-antes), fxKey:"heal" });
      actualizarHPs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "daño_indirecto") {
      enemigo.dot = Math.round(enemigo.hpMax * (hab.dmgInd||0.1));
      enemigo.dotDur = hab.dur || 3;
      if (hab.debuff) {
        const k = hab.debuff.atk ? "atk" : "def";
        const v = -(hab.debuff.atk || hab.debuff.def);
        buffsEnemigo.push({ tipo:k, val:v, turnos:hab.debuff.dur||3, label:"-"+k.toUpperCase() });
        renderBuffs();
      }
      log(`☠️ ${hab.nombre}: ${enemigo.dot} dmg por ${enemigo.dotDur} turnos.`, "critico");
      const dmg0 = Math.max(1, Math.round(atkTotal() * 0.5));
      aplicarDmgEnemigo(dmg0);
      floatDmg("#sprite-enemigo", "-"+dmg0, "daño");
      FX({ tipo:"attack", target:"enemy", valor:dmg0, fxKey:fxKey });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 900);
      return;
    }

    const hits = hab.hits || 1;
    let totalDmg = 0;
    const critBase = 0.15 + (bonusTipo("crit_pct")/100) + (buffVal("crit")/100);
    const atkBuffed = atkTotal() + buffVal("atk");
    let algunCrit = false;
    for (let i = 0; i < hits; i++) {
      const crit = Math.random() < critBase;
      if (crit) algunCrit = true;
      let dmg = Math.round((atkBuffed * (hab.mult||1)) - rnd(1,4));
      if (crit) dmg = Math.round(dmg * 1.8);
      if (enemigo.jefe && tieneBonus("crit_jefe")) dmg = Math.round(dmg * (1 + bonusTipo("crit_jefe")/100));
      dmg = Math.max(1, dmg);
      aplicarDmgEnemigo(dmg);
      totalDmg += dmg;
      if (i === hits - 1) log((crit?"¡CRÍTICO! ":"") + `${hab.nombre}: ${dmg} daño.`, crit?"critico":"daño");
      else log(`${hab.nombre} [${i+1}/${hits}]: ${dmg} daño.`, "daño");
      if (enemigo.hp <= 0) break;
    }
    floatDmg("#sprite-enemigo", "-"+totalDmg, "daño");
    FX({ tipo:"attack", target:"enemy", valor:totalDmg, fxKey:fxKey, critico:algunCrit });
    SND("atrapado");

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
    if (enemigo.hp <= 0) return setTimeout(victoria, 500);

    if (pasiva.tipo === "doble_ataque" && Math.random()*100 < pasiva.val) {
      log("🐰 ¡Brinco extra! Atacas otra vez.", "critico");
      setTimeout(() => {
        const seg = Math.max(1, Math.round(atkBuffed * 0.7));
        aplicarDmgEnemigo(seg);
        floatDmg("#sprite-enemigo", "-"+seg, "daño");
        FX({ tipo:"attack", target:"enemy", valor:seg, fxKey:"slash" });
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

  function tickDoT() {
    if (enemigo.dot && enemigo.dot > 0) {
      aplicarDmgEnemigo(enemigo.dot);
      log(`🔥 Quemadura: -${enemigo.dot} HP.`, "daño");
      floatDmg("#sprite-enemigo", "-"+enemigo.dot, "daño");
      FX({ tipo:"attack", target:"enemy", valor:enemigo.dot, fxKey:"burn" });
      actualizarHPs();
      if (enemigo.hp <= 0) { setTimeout(victoria, 400); return true; }
      enemigo.dotDur--;
      if (enemigo.dotDur <= 0) enemigo.dot = 0;
    }
    return false;
  }

  function turnoEnemigo() {
    if (!enemigo) return;
    if (tickDoT()) return;
    const rg = bonusTipo("regen_turno");
    if (rg > 0) {
      const a = state.hp; state.hp = Math.min(hpMax(), state.hp + rg);
      const c = Math.round(state.hp - a); if (c > 0) log("💚 Regeneras " + c + " HP.", "curar");
    }
    if (state.sangrado > 0) {
      state.hp = Math.max(0, state.hp - state.sangrado);
      log(`🩸 Sangrado: -${state.sangrado} HP`, "daño");
      if (state.hp <= 0) return setTimeout(derrota, 500);
    }
    const esq = bonusTipo("esquivar")/100 + buffVal("esq")/100;
    if (esq > 0 && Math.random() < esq) {
      log("😎 ¡Esquivaste!", "curar"); floatDmg("#sprite-heroe", "¡ESQUIVA!", "curar");
      guardar(state); actualizarHPs(); tickBuffs();
      turnoJugador = true; deshab(false); return;
    }
    enemigo.specialTimer--;
    if (enemigo.specialTimer <= 0) {
      enemigo.specialTimer = enemigo.specialCD;
      return setTimeout(() => ejecutarEspecial(), 500);
    }
    ataqueNormalEnemigo();
  }

  function ataqueNormalEnemigo() {
    const atkEnemigo = Math.max(1, enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s,b)=>s+b.val,0));
    const defHeroe = defTotal() + buffVal("def");
    const dmg = Math.max(1, atkEnemigo - defHeroe + rnd(-3,3));
    state.hp = Math.max(0, state.hp - dmg); guardar(state);
    SND("derrota");
    log(enemigo.nombre + " te ataca por " + dmg + ".", "daño");
    floatDmg("#sprite-heroe", "-"+dmg, "daño");
    FX({ tipo:"attack", target:"hero", valor:dmg, fxKey:"bolt" });
    qs("#sprite-heroe")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-heroe")?.classList.remove("golpeado"), 350);
    actualizarHPs(); tickBuffs();
    if (state.hp <= 0) return setTimeout(derrota, 500);
    turnoJugador = true; deshab(false);
  }

  function ejecutarEspecial() {
    if (!enemigo) return;
    const s = enemigo.special;
    SND('growl');
    switch (s) {
      case 'heal': {
        const c = Math.round(enemigo.hpMax * 0.20);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + c);
        log(`💚 ${enemigo.nombre} se cura ${c} HP.`, "curar");
        break;
      }
      case 'buff': {
        enemigo.atk = Math.round(enemigo.atk * 1.18);
        log(`⬆️ ${enemigo.nombre} se potencia (+18% ATK).`, "info");
        break;
      }
      case 'debuff': {
        buffsHeroe.push({ tipo:'atk', val:-4, turnos:3, label:'-ATK' });
        log(`⬇️ ¡Tu ATK baja 4!`, "daño");
        renderBuffs();
        break;
      }
      case 'poison': {
        state.sangrado = (state.sangrado || 0) + 3;
        log('☠️ ¡Envenenado! +3 daño/turno.', "daño");
        break;
      }
      case 'multihit': {
        let total = 0;
        for (let i = 0; i < 3; i++) {
          const defHeroe = defTotal() + buffVal("def");
          const d = Math.max(1, Math.floor(enemigo.atk * 0.6) - defHeroe + rnd(-2,2));
          state.hp = Math.max(0, state.hp - d);
          total += d;
        }
        log(`💥💥💥 ¡Triple golpe! ${total} daño.`, "daño");
        floatDmg("#sprite-heroe", "-"+total, "daño");
        FX({ tipo:"attack", target:"hero", valor:total, fxKey:"dagger" });
        break;
      }
      case 'drain': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.floor(enemigo.atk * 0.9) - defHeroe + rnd(-2,2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(d * 0.7));
        log(`🩸 ${enemigo.nombre} te drena ${d} HP.`, "daño");
        floatDmg("#sprite-heroe", "-"+d, "daño");
        break;
      }
      case 'shield': {
        enemigo.shield += Math.round(enemigo.hpMax * 0.20);
        log(`🛡️ ${enemigo.nombre} se blinda (${enemigo.shield}).`, "info");
        break;
      }
      case 'curse': {
        buffsHeroe.push({ tipo:'def', val:-3, turnos:3, label:'-DEF' });
        log('💀 ¡Maldición! -3 DEF durante 3 turnos.', "critico");
        renderBuffs();
        break;
      }
      case 'firebreath': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.round(enemigo.atk * 1.5) - defHeroe + rnd(-2,2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.dot = Math.round(enemigo.hpMax * 0.05);
        enemigo.dotDur = 2;
        log(`🔥 ¡Aliento de fuego! ${d} daño + quemadura.`, "critico");
        floatDmg("#sprite-heroe", "-"+d, "daño");
        FX({ tipo:"attack", target:"hero", valor:d, fxKey:"fireball", critico:true });
        break;
      }
      case 'summon': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.round(enemigo.atk * 0.8) - defHeroe + rnd(-2,2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(enemigo.hpMax * 0.12));
        log(`💀 ${enemigo.nombre} invoca esqueletos · ${d} daño · se cura.`, "critico");
        break;
      }
      case 'apocalypse': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.round(enemigo.atk * 1.9) - defHeroe + rnd(-2,2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.shield += Math.round(enemigo.hpMax * 0.10);
        log(`☄️ ¡APOCALIPSIS! ${d} daño + escudo.`, "critico");
        floatDmg("#sprite-heroe", "-"+d, "daño");
        FX({ tipo:"attack", target:"hero", valor:d, fxKey:"fireball", critico:true });
        break;
      }
    }
    actualizarHPs(); tickBuffs();
    if (state.hp <= 0) return setTimeout(derrota, 500);
    turnoJugador = true; deshab(false);
  }

  function toggleObjetos() {
    if (!turnoJugador) return;
    overlayObjetos = !overlayObjetos;
    const w = $("rpg-objetos-wrap"); if (!w) return;
    if (!overlayObjetos) { w.innerHTML = ""; return; }
    const inv = cargarInv();
    const comidas = Object.entries(COMIDAS).filter(([id]) => (inv[id]||0) > 0);
    const RL = window.RpgLoot;
    const consum = RL?.getConsumibles?.() || [];
    const lootInv = RL?.cargarLoot?.() || {};
    if (!comidas.length && !consum.length) {
      w.innerHTML = `<div class="rpg-objetos"><div style="grid-column:1/-1;text-align:center;opacity:.6;font-style:italic;padding:.5rem;">No tienes objetos</div></div>`;
      return;
    }
    w.innerHTML = `<div class="rpg-objetos">
      ${comidas.map(([id,c]) => `<button type="button" class="rpg-objeto" data-tipo="comida" data-id="${id}" title="${c.nombre}"><span class="rpg-objeto-icono">${ICONO[c.icono]||""}</span><span class="rpg-objeto-cantidad">${inv[id]}</span></button>`).join("")}
      ${consum.map(it => {
        const c = lootInv[it.id] || 0;
        const ic = RL?.renderIcono ? RL.renderIcono(it, "30px") : `<span class="loot-icono" data-icono="${it.icono}"></span>`;
        return `<button type="button" class="rpg-objeto rar-${it.rar}" data-tipo="loot" data-id="${it.id}" title="${it.nombre}"><span class="rpg-objeto-icono">${ic}</span><span class="rpg-objeto-cantidad">${c}</span></button>`;
      }).join("")}
    </div>`;
    if (window.hidratarIconos) window.hidratarIconos(w);
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
    log(`Usas ${c.nombre}. +${Math.round(state.hp-a)} HP.`, "curar");
    floatDmg("#sprite-heroe", `+${Math.round(state.hp-a)}`, "curar");
    FX({ tipo:"consumible", target:"hero", valor:Math.round(state.hp-a), fxKey:"potionRed" });
    actualizarHPs();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    setTimeout(turnoEnemigo, 700);
  }

  function usarLootConsumible(id) {
    if (!turnoJugador || !enemigo) return;
    const RL = window.RpgLoot; if (!RL?.usarConsumible) return;
    const item = RL.POOL.find(p => p.id === id); if (!item) return;
    if (!RL.usarConsumible(id)) return;
    if (item.tipo === "hp" || item.tipo === "def") {
      const cur = item.tipo === "hp" ? item.val : item.val*3;
      const a = state.hp;
      state.hp = clamp(state.hp + cur, 0, hpMax()); guardar(state);
      SND("comer"); log(`Usas ${item.nombre}. +${Math.round(state.hp-a)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp-a)}`, "curar");
      FX({ tipo:"consumible", target:"hero", valor:Math.round(state.hp-a), fxKey:"potionBlue" });
    } else if (item.tipo === "atk") {
      aplicarDmgEnemigo(item.val);
      SND("sparkle"); log(`¡Lanzas ${item.nombre}! ${item.val} de daño.`, "critico");
      floatDmg("#sprite-enemigo", `-${item.val}`, "critico");
      FX({ tipo:"attack", target:"enemy", valor:item.val, fxKey:"fireball", critico:true });
      chequearFaseJefe();
    }
    actualizarHPs();
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

  function victoria() {
    if (!enemigo) return;
    const eraJefe = enemigo.jefe, nE = enemigo.nombre;
    let xp = enemigo.xp, mon = enemigo.monedas;
    const xpB = bonusTipo("xp_extra")/100;
    if (xpB > 0) xp = Math.round(xp * (1+xpB));
    mon += bonusTipo("monedas_victoria");
    const primeraVictoriaZona = !state.zonasConquistadas.includes(state.zonaActual);
    const xpPrimeraVictoria = primeraVictoriaZona ? Math.round(xp * 0.5) : 0;
    const monedasPrimeraVictoria = primeraVictoriaZona ? Math.round(mon * 0.5) : 0;
    if (primeraVictoriaZona) {
      state.zonasConquistadas.push(state.zonaActual);
      xp += xpPrimeraVictoria;
      mon += monedasPrimeraVictoria;
    }
    window.dispatchEvent(new CustomEvent("rpg:victoria", { detail:{ enemigo:{ ...enemigo, zona:state.zonaActual, xp, monedas:mon } } }));
    state.enemigosDerrotados++;
    state.xp += xp;
    if (eraJefe && !state.jefesDerrotados.includes(state.zonaActual)) state.jefesDerrotados.push(state.zonaActual);
    if (eraJefe) {
      try {
        const u = getUserId();
        const mascota = localStorage.getItem("mascota_actual") || "mapache";
        const k = `sa_rpg_jefes_mascota_${u}`;
        const logData = JSON.parse(localStorage.getItem(k) || "{}");
        logData[mascota] = logData[mascota] || [];
        if (!logData[mascota].includes(state.zonaActual)) logData[mascota].push(state.zonaActual);
        localStorage.setItem(k, JSON.stringify(logData));
        if (mascota === "conejo" && logData[mascota].length >= 9) {
          try { notifMascota?.("🐰 ¡MÁXIMA BESTIA!", "¡Has completado el juego con el conejo!"); } catch {}
        }
      } catch {}
    }
    let sub = 0;
    while (state.xp >= xpParaSubir()) { state.xp -= xpParaSubir(); state.nivel++; state.hp = hpMax(); sub++; }
    const cuv = bonusTipo("curar_victoria");
    if (cuv > 0) { state.hp = Math.min(hpMax(), state.hp + cuv); log("💚 +"+cuv+" HP.", "curar"); }
    setMonedas(getMonedas() + mon);
    SND("victoria");
    try { window._darPremio?.(0, 10, "¡Victoria!"); } catch {}
    try { notifMascota?.("¡Victoria!", "+"+mon+" monedas · +"+xp+" XP"); } catch {}
    guardar(state);
    $("rpg-batalla")?.classList.add("ganada");
    log("¡"+nE+" derrotado! +"+xp+" XP, +"+mon+" monedas.", "info");
    if (primeraVictoriaZona) log(`✨ ¡Zona conquistada por primera vez! +${xpPrimeraVictoria} XP y +${monedasPrimeraVictoria} monedas extra.`, "critico");
    if (sub > 0) log("¡Subiste a nivel "+state.nivel+"!", "critico");
    setTimeout(() => { enemigo = null; buffsHeroe = []; buffsEnemigo = []; state.sangrado = 0; render(); }, 1500);
  }

  function derrota() {
    SND("derrota"); log("Has caído...", "daño");
    try { notifMascota?.("Derrota", "Pierdes la mitad de tus monedas"); } catch {}
    setMonedas(getMonedas() - Math.floor(getMonedas()/2));
    state.hp = Math.round(hpMax()*0.3);
    state.sangrado = 0;
    guardar(state);
    $("rpg-batalla")?.classList.add("muerto");
    setTimeout(() => { enemigo = null; buffsHeroe = []; buffsEnemigo = []; render(); }, 1600);
  }

  /* ---------- Activación de vista ---------- */
  function activarVistaRpg() {
    qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "rpg"));
    qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "rpg"));
    document.body.style.overflow = "";
  }
  window.addEventListener("hashchange", () => { if (location.hash === "#rpg") { activarVistaRpg(); render(); } });
  document.addEventListener("click", e => {
    if (!e.target.closest('[data-view-link="rpg"]')) return;
    setTimeout(() => { activarVistaRpg(); render(); }, 0);
  });
  window.addEventListener("rpg:stats-cambiados", () => { state.hp = Math.min(state.hp, hpMax()); guardar(state); if ($("rpg-content")) render(); });
  window.addEventListener("sunadventures:mascota-cambiada", () => { if ($("rpg-content")) render(); });

  function init() { inyectarSeccion(); inyectarNav(); render(); if (location.hash === "#rpg") activarVistaRpg(); }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
  setTimeout(() => { if (location.hash === "#rpg" && !$("rpg")?.classList.contains("active")) { activarVistaRpg(); render(); } }, 300);

  window.Rpg = {
    state: () => state,
    enemigo: () => enemigo,
    zonas: ZONAS,
    grupos: GRUPOS,
    biomas: REGIONES.map(reg => reg.bioma),
    abrirPopupGrupo,
    reset: () => { localStorage.removeItem(KEY()); state = def(); render(); }
  };
  window._rpgEntrarZona = entrarZona;
  console.log("✅ rpg.js v8 listo · zonas:", ZONAS.length, "· regiones:", REGIONES.length);
})();