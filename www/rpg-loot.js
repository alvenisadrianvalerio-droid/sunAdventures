/* ============================================================
   RPG-LOOT.JS — Botín, cofres y colección en pestañas
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n=0; const it=()=>{ if(window._TiendaAPI) return boot(); if(++n>50) return; setTimeout(it,100); }; return setTimeout(it,100); }

  const { notifMascota, getUserId, getMonedas, setMonedas } = API;
  const $  = id => document.getElementById(String(id).replace(/^#/,""));
  const qsa= (s,r=document)=>[...r.querySelectorAll(s)];
  const rnd= (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const SND= t=>{ try{window._snd?.(t);}catch{} };

   const SHEET = {
    url:  window.SPRITE_SHEET?.url  || "img/rpg/rpg-loot-sheet.png",
    cols: window.SPRITE_SHEET?.cols || 10,
    rows: window.SPRITE_SHEET?.rows || 10
  };

   /* ---------- Sheets: dos hojas independientes ---------- */
  const SHEET_RPG  = { url: "img/rpg/rpg-loot-sheet.png", cols: 10, rows: 10 };
  const SHEET_MAIN = {
    url:  window.SPRITE_SHEET?.url  || "img/tienda/admurin-items.png",
    cols: window.SPRITE_SHEET?.cols || 30,
    rows: window.SPRITE_SHEET?.rows || 110
  };

  function renderIcono(item, size) {
    if (Array.isArray(item.sprite) && item.sprite.length === 2) {
      // ⚡ Cada item elige su hoja según item.sheet
      const s = item.sheet === "main" ? SHEET_MAIN : SHEET_RPG;
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
  const KEY_LOOT  = () => "sa_rpg_loot_" + getUserId();
  const KEY_STATS = () => "sa_rpg_stats_" + getUserId();
  const KEY_RPG   = () => "sa_rpg_" + getUserId();
  const cargarLoot  = () => { try { return JSON.parse(localStorage.getItem(KEY_LOOT())||"{}"); } catch { return {}; } };
  const guardarLoot = o => { try { localStorage.setItem(KEY_LOOT(), JSON.stringify(o)); } catch {} };
  const cargarStats = () => { try { return JSON.parse(localStorage.getItem(KEY_STATS())||'{"atkBonus":0,"defBonus":0,"hpBonus":0}'); } catch { return { atkBonus:0, defBonus:0, hpBonus:0 }; } };
  const guardarStats= o => { try { localStorage.setItem(KEY_STATS(), JSON.stringify(o)); } catch {} };
  const cargarEstado= () => { try { const r = localStorage.getItem(KEY_RPG()); return r ? JSON.parse(r) : { nivel:1, xp:0, hp:100, statsBase:{atk:10,def:3} }; } catch { return { nivel:1, xp:0, hp:100, statsBase:{atk:10,def:3} }; } };
  const guardarEstado=s => { try { localStorage.setItem(KEY_RPG(), JSON.stringify(s)); } catch {} };
  const hpMaxRpg = s => 80 + s.nivel*20 + (cargarStats().hpBonus||0);

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
     POOL DE 100 ITEMS
     ============================================================ */
  const POOL = [
    /* ROW 0 — Hierbas */
    { id:"hoja-verde", nombre:"Hoja de Rocío", sprite:[0,0], tipo:"hp", val:8, rar:"comun", consumible:true, icono:"raiz" },
    { id:"flor-roja", nombre:"Flor de Brasa", sprite:[1,0], tipo:"hp", val:12, rar:"comun", consumible:true, icono:"girasol" },
    { id:"hongo", nombre:"Hongo Lunar", sprite:[2,0], tipo:"hp", val:18, rar:"raro", consumible:true, icono:"girasol" },
    { id:"hongo-dorado", nombre:"Hongo Dorado", sprite:[3,0], tipo:"hp", val:22, rar:"raro", consumible:true, icono:"girasol" },
    { id:"raiz-mandinga", nombre:"Raíz Mandinga", sprite:[4,0], tipo:"atk", val:5, rar:"raro", consumible:true, icono:"raiz" },
    { id:"orquidea-hielo", nombre:"Orquídea Hielo", sprite:[5,0], tipo:"hp", val:30, rar:"epico", consumible:true, icono:"girasol" },
    { id:"baya-solar", nombre:"Baya Solar", sprite:[6,0], tipo:"hp", val:20, rar:"raro", consumible:true, icono:"manzana" },
    { id:"tallo-espina", nombre:"Tallo Espina", sprite:[7,0], tipo:"atk", val:8, rar:"epico", consumible:true, icono:"raiz" },
    { id:"semilla-vida", nombre:"Semilla de Vida", sprite:[8,0], tipo:"hp", val:50, rar:"legendario", consumible:true, icono:"girasol" },
    { id:"loto-eter", nombre:"Loto Etéreo", sprite:[9,0], tipo:"hp", val:80, rar:"mitico", consumible:true, icono:"girasol" },
    /* ROW 1 — Pociones */
    { id:"pocion-roja", nombre:"Poción Menor", sprite:[0,1], tipo:"hp", val:25, rar:"comun", consumible:true, icono:"pocion" },
    { id:"pocion-azul", nombre:"Poción Arcana", sprite:[1,1], tipo:"atk", val:10, rar:"raro", consumible:true, icono:"pocion" },
    { id:"pocion-morada", nombre:"Elixir Arcano", sprite:[2,1], tipo:"hp", val:40, rar:"epico", consumible:true, icono:"pocionAmor" },
    { id:"pocion-dorada", nombre:"Elixir Dorado", sprite:[3,1], tipo:"hp", val:60, rar:"epico", consumible:true, icono:"pocion" },
    { id:"pocion-verde", nombre:"Antídoto Verde", sprite:[4,1], tipo:"def", val:8, rar:"raro", consumible:true, icono:"pocion" },
    { id:"pocion-naranja", nombre:"Esencia Naranja", sprite:[5,1], tipo:"atk", val:15, rar:"epico", consumible:true, icono:"pocion" },
    { id:"pocion-blanca", nombre:"Leche Lunar", sprite:[6,1], tipo:"hp", val:35, rar:"raro", consumible:true, icono:"pocion" },
    { id:"elixir-dragon", nombre:"Elixir de Dragón", sprite:[7,1], tipo:"atk", val:25, rar:"legendario", consumible:true, icono:"pocion" },
    { id:"frasco-vacio", nombre:"Frasco de Sombra", sprite:[8,1], tipo:"def", val:12, rar:"epico", consumible:true, icono:"pocion" },
    { id:"lagrima-hada", nombre:"Lágrima de Hada", sprite:[9,1], tipo:"hp", val:100, rar:"mitico", consumible:true, icono:"pocionAmor" },
    /* ROW 2 — Libros */
    { id:"libro-verde", nombre:"Tomo Olvidado", sprite:[0,2], tipo:"atk", val:2, rar:"raro" },
    { id:"libro-rojo", nombre:"Grimorio Ígneo", sprite:[1,2], tipo:"atk", val:3, rar:"epico" },
    { id:"libro-azul", nombre:"Códice de Hielo", sprite:[2,2], tipo:"def", val:2, rar:"epico" },
    { id:"libro-morado", nombre:"Volumen de Sombras", sprite:[3,2], tipo:"atk", val:4, rar:"legendario" },
    { id:"libro-dorado", nombre:"Biblia del Alba", sprite:[4,2], tipo:"atk", val:6, rar:"legendario" },
    { id:"pergamino-rayo", nombre:"Pergamino del Rayo", sprite:[5,2], tipo:"atk", val:5, rar:"epico" },
    { id:"pergamino-fuego", nombre:"Pergamino de Fuego", sprite:[6,2], tipo:"atk", val:4, rar:"raro" },
    { id:"pergamino-escudo", nombre:"Pergamino Escudo", sprite:[7,2], tipo:"def", val:5, rar:"epico" },
    { id:"mapa-antiguo", nombre:"Mapa Ancestral", sprite:[8,2], tipo:"hp", val:40, rar:"legendario" },
    { id:"runa-ancestral", nombre:"Runa Ancestral", sprite:[9,2], tipo:"atk", val:10, rar:"mitico" },
    /* ROW 3 — Gemas */
    { id:"gema-verde", nombre:"Jade Menuda", sprite:[0,3], tipo:"def", val:1, rar:"comun" },
    { id:"gema-azul", nombre:"Zafiro Pulido", sprite:[1,3], tipo:"def", val:2, rar:"raro" },
    { id:"gema-roja", nombre:"Rubí Ardiente", sprite:[2,3], tipo:"atk", val:2, rar:"raro" },
    { id:"gema-morada", nombre:"Amatista Oscura", sprite:[3,3], tipo:"atk", val:3, rar:"epico" },
    { id:"gema-dorada", nombre:"Topacio Real", sprite:[4,3], tipo:"hp", val:30, rar:"epico" },
    { id:"diamante-estrella", nombre:"Diamante Estelar", sprite:[5,3], tipo:"atk", val:5, rar:"legendario" },
    { id:"esmeralda-lagrima", nombre:"Esmeralda Lágrima", sprite:[6,3], tipo:"def", val:4, rar:"legendario" },
    { id:"cristal-hielo", nombre:"Cristal de Hielo", sprite:[7,3], tipo:"def", val:6, rar:"legendario" },
    { id:"obsidiana-viva", nombre:"Obsidiana Viva", sprite:[8,3], tipo:"atk", val:8, rar:"legendario" },
    { id:"perla-mar", nombre:"Perla del Mar Vivo", sprite:[9,3], tipo:"hp", val:60, rar:"mitico" },
    /* ROW 4 — Dagas y espadas */
    { id:"daga", nombre:"Daga Oxidada", sprite:[0,4], tipo:"atk", val:1, rar:"comun" },
    { id:"daga-asesino", nombre:"Daga del Asesino", sprite:[1,4], tipo:"atk", val:3, rar:"raro" },
    { id:"daga-cristal", nombre:"Daga Cristalina", sprite:[2,4], tipo:"atk", val:4, rar:"epico" },
    { id:"cimitarra", nombre:"Cimitarra Dorada", sprite:[3,4], tipo:"atk", val:3, rar:"raro" },
    { id:"espada", nombre:"Espada de Acero", sprite:[4,4], tipo:"atk", val:3, rar:"raro" },
    { id:"espada-ropera", nombre:"Espada Ropera", sprite:[5,4], tipo:"atk", val:4, rar:"epico" },
    { id:"katana", nombre:"Katana Forjada", sprite:[6,4], tipo:"atk", val:5, rar:"epico" },
    { id:"espada-hielo", nombre:"Filo de Hielo", sprite:[7,4], tipo:"atk", val:6, rar:"legendario" },
    { id:"espada-fuego", nombre:"Espada Flamígera", sprite:[8,4], tipo:"atk", val:7, rar:"legendario" },
    { id:"espada-legend", nombre:"Filo del Alba", sprite:[9,4], tipo:"atk", val:10, rar:"mitico" },
    /* ROW 5 — Armas pesadas */
    { id:"hacha", nombre:"Hacha de Hierro", sprite:[0,5], tipo:"atk", val:2, rar:"comun" },
    { id:"hacha-guerra", nombre:"Hacha de Guerra", sprite:[1,5], tipo:"atk", val:4, rar:"raro" },
    { id:"martillo-hierro", nombre:"Martillo de Hierro", sprite:[2,5], tipo:"atk", val:3, rar:"raro" },
    { id:"martillo-trueno", nombre:"Martillo del Trueno", sprite:[3,5], tipo:"atk", val:7, rar:"legendario" },
    { id:"lanza-acero", nombre:"Lanza de Acero", sprite:[4,5], tipo:"atk", val:3, rar:"raro" },
    { id:"tridente", nombre:"Tridente Marino", sprite:[5,5], tipo:"atk", val:5, rar:"epico" },
    { id:"alabarda", nombre:"Alabarda Real", sprite:[6,5], tipo:"atk", val:6, rar:"epico" },
    { id:"guadana", nombre:"Guadaña Oscura", sprite:[7,5], tipo:"atk", val:6, rar:"legendario" },
    { id:"garrote-puas", nombre:"Garrote con Púas", sprite:[8,5], tipo:"atk", val:4, rar:"epico" },
    { id:"mandoble-divino", nombre:"Mandoble Divino", sprite:[9,5], tipo:"atk", val:12, rar:"mitico" },
    /* ROW 6 — Distancia */
    { id:"arco-madera", nombre:"Arco de Madera", sprite:[0,6], tipo:"atk", val:1, rar:"comun" },
    { id:"arco-elfico", nombre:"Arco Élfico", sprite:[1,6], tipo:"atk", val:4, rar:"epico" },
    { id:"ballesta", nombre:"Ballesta de Torre", sprite:[2,6], tipo:"atk", val:5, rar:"epico" },
    { id:"flecha-dorada", nombre:"Flecha Dorada", sprite:[3,6], tipo:"atk", val:3, rar:"raro", consumible:true },
    { id:"baston", nombre:"Bastón Antiguo", sprite:[4,6], tipo:"atk", val:5, rar:"epico" },
    { id:"vara-cristal", nombre:"Vara de Cristal", sprite:[5,6], tipo:"atk", val:4, rar:"raro" },
    { id:"baculo-fuego", nombre:"Báculo de Fuego", sprite:[6,6], tipo:"atk", val:7, rar:"legendario" },
    { id:"baculo-rayo", nombre:"Báculo del Rayo", sprite:[7,6], tipo:"atk", val:8, rar:"legendario" },
    { id:"cetro-solar", nombre:"Cetro Solar", sprite:[8,6], tipo:"atk", val:9, rar:"legendario" },
    { id:"baculo-infinito", nombre:"Báculo del Infinito", sprite:[9,6], tipo:"atk", val:15, rar:"mitico" },
    /* ROW 7 — Escudos */
    { id:"escudo-madera", nombre:"Escudo de Madera", sprite:[0,7], tipo:"def", val:1, rar:"comun" },
    { id:"escudo-hierro", nombre:"Escudo de Hierro", sprite:[1,7], tipo:"def", val:3, rar:"raro" },
    { id:"escudo-alba", nombre:"Escudo del Alba", sprite:[2,7], tipo:"def", val:5, rar:"epico" },
    { id:"escudo-torre", nombre:"Escudo Torre", sprite:[3,7], tipo:"def", val:6, rar:"epico" },
    { id:"escudo-dragon", nombre:"Escudo Dragón", sprite:[4,7], tipo:"def", val:8, rar:"legendario" },
    { id:"casco-hierro", nombre:"Casco de Hierro", sprite:[5,7], tipo:"def", val:2, rar:"raro" },
    { id:"coraza-placas", nombre:"Coraza de Placas", sprite:[6,7], tipo:"def", val:5, rar:"epico" },
    { id:"guantelete", nombre:"Guantelete de Poder", sprite:[7,7], tipo:"def", val:4, rar:"epico" },
    { id:"botas-aladas", nombre:"Botas Aladas", sprite:[8,7], tipo:"def", val:3, rar:"raro" },
    { id:"capa-sombras", nombre:"Capa de Sombras", sprite:[9,7], tipo:"def", val:7, rar:"legendario" },
    /* ROW 8 — Joyería */
    { id:"moneda-oro", nombre:"Moneda Antigua", sprite:[0,8], tipo:"hp", val:15, rar:"comun" },
    { id:"saco-monedas", nombre:"Saco de Monedas", sprite:[1,8], tipo:"hp", val:25, rar:"raro" },
    { id:"anillo-poder", nombre:"Anillo de Poder", sprite:[2,8], tipo:"atk", val:3, rar:"raro" },
    { id:"anillo-esmeralda", nombre:"Anillo Esmeralda", sprite:[3,8], tipo:"def", val:3, rar:"epico" },
    { id:"anillo-zafiro", nombre:"Anillo Zafiro", sprite:[4,8], tipo:"hp", val:35, rar:"epico" },
    { id:"amuleto-sol", nombre:"Amuleto Solar", sprite:[5,8], tipo:"atk", val:6, rar:"legendario" },
    { id:"collar-diente", nombre:"Collar de Diente", sprite:[6,8], tipo:"def", val:4, rar:"raro" },
    { id:"brazalete-oro", nombre:"Brazalete Dorado", sprite:[7,8], tipo:"hp", val:45, rar:"legendario" },
    { id:"pendientes-estrella", nombre:"Aretes Estelares", sprite:[8,8], tipo:"atk", val:4, rar:"epico" },
    { id:"ojo-horus", nombre:"Ojo de Horus", sprite:[9,8], tipo:"atk", val:12, rar:"mitico" },
    /* ROW 9 — Reliquias */
    { id:"cofre-madera", nombre:"Cofre de Madera", sprite:[0,9], tipo:"hp", val:25, rar:"raro" },
    { id:"cofre-hierro", nombre:"Cofre de Hierro", sprite:[1,9], tipo:"hp", val:50, rar:"epico" },
    { id:"cofre-dorado", nombre:"Cofre Dorado", sprite:[2,9], tipo:"hp", val:80, rar:"legendario" },
    { id:"llave-antigua", nombre:"Llave Antigua", sprite:[3,9], tipo:"hp", val:20, rar:"raro" },
    { id:"llave-dorada", nombre:"Llave Dorada", sprite:[4,9], tipo:"hp", val:40, rar:"epico" },
    { id:"corona-plata", nombre:"Corona de Plata", sprite:[5,9], tipo:"def", val:3, rar:"epico" },
    { id:"corona-oro", nombre:"Corona Dorada", sprite:[6,9], tipo:"def", val:5, rar:"legendario" },
    { id:"caliz-estelar", nombre:"Cáliz Estelar", sprite:[7,9], tipo:"hp", val:70, rar:"legendario" },
    { id:"reliquia", nombre:"Reliquia Perdida", sprite:[8,9], tipo:"def", val:4, rar:"legendario" },
    { id:"orbe-creacion", nombre:"Orbe de la Creación", sprite:[9,9], tipo:"atk", val:20, rar:"mitico" }
  ];

  /* ============================================================
     SORTEO
     ============================================================ */
  function sortearCon(probs) {
    const r = Math.random(); let acc = 0;
    const ks = Object.keys(probs);
    for (let i = 0; i < ks.length; i++) { acc += probs[ks[i]]; if (r <= acc) return ks[i]; }
    return ks[0];
  }
  const sortearRareza = b => sortearCon(b || Object.fromEntries(Object.entries(RAREZAS).map(e => [e[0], e[1].prob])));
  const sortearCalidad = b => sortearCon(b || { normal:.7, reforzado:.2, impecable:.08, ancestral:.02 });

  function sortearItem(rareza, calidad) {
    const cand = POOL.filter(p => p.rar === rareza);
    const it = cand[rnd(0, cand.length-1)] || POOL[0];
    const cal = CALIDADES[calidad] || CALIDADES.normal;
    return { ...it, calidad, valFinal: Math.round(it.val * cal.mult) };
  }

  function sortearItemVictoria(jefe) {
    let r;
    if (jefe) { const x = Math.random(); r = x < .12 ? "mitico" : x < .3 ? "legendario" : x < .6 ? "epico" : x < .85 ? "raro" : "comun"; }
    else r = sortearRareza();
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
  const getConsumibles = () => { const l = cargarLoot(); return POOL.filter(p => p.consumible && (l[p.id]||0) > 0); };

  /* ============================================================
     POPUP + MODAL DETALLE
     ============================================================ */
  function mostrarPopup(item) {
    let c = $("loot-popup");
    if (!c) { c = document.createElement("div"); c.id = "loot-popup"; c.className = "loot-popup"; document.body.appendChild(c); }
    const cal = CALIDADES[item.calidad||"normal"];
    const v = item.valFinal || item.val;
    const card = document.createElement("div");
    card.className = "loot-card rar-" + item.rar;
    card.innerHTML = `<div class="loot-card-icon">${renderIcono(item,"44px")}</div><div class="loot-card-copy"><span class="loot-card-rarity">${RAREZAS[item.rar].label}${cal.icon?" · "+cal.icon+" "+cal.label:""}</span><span class="loot-card-name">${item.nombre}</span><span class="loot-card-bonus">+${v} ${item.tipo.toUpperCase()}</span></div>`;
    c.appendChild(card);
    if (window.hidratarIconos) window.hidratarIconos(card);
    setTimeout(() => card.remove(), 3600);
  }

  function mostrarDetalleItem(item) {
    const loot = cargarLoot();
    const cant = loot[item.id] || 0;
    const cal = CALIDADES[item.calidad||"normal"];
    const v = item.valFinal || item.val;
    let m = $("rpg-loot-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "rpg-loot-modal"; m.className = "rpg-loot-modal";
      m.innerHTML = `<div class="rpg-loot-modal-panel"><button class="rpg-loot-modal-close">×</button><div class="rpg-loot-modal-icon"></div><div class="rpg-loot-modal-rarity"></div><h3 class="rpg-loot-modal-nombre"></h3><p class="rpg-loot-modal-desc"></p><p class="rpg-loot-modal-tipo"></p><div class="rpg-loot-modal-acciones"></div></div>`;
      document.body.appendChild(m);
      m.addEventListener("click", e => { if (e.target === m || e.target.classList.contains("rpg-loot-modal-close")) m.classList.remove("active"); });
    }
    m.querySelector(".rpg-loot-modal-panel").className = "rpg-loot-modal-panel rar-" + item.rar;
    m.querySelector(".rpg-loot-modal-icon").innerHTML = renderIcono(item, "96px");
    m.querySelector(".rpg-loot-modal-rarity").innerHTML = `${RAREZAS[item.rar].label} &nbsp;<span class="loot-cal-badge cal-${item.calidad||"normal"}">${cal.icon} ${cal.label}</span>`;
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
          const cur = item.tipo === "hp" ? v : v*3;
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
    items.forEach(it => { loot[it.id] = (loot[it.id]||0) + 1; if (!it.consumible) aplicarBonus(it); });
    guardarLoot(loot);
    try { const k = "sa_rpg_cofres_" + getUserId(); localStorage.setItem(k, String(Number(localStorage.getItem(k)||0) + cant)); window.dispatchEvent(new Event("sunadventures:progress")); } catch {}
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
      const cal = CALIDADES[it.calidad||"normal"];
      const v = it.valFinal || it.val;
      html += `<div class="loot-cofre-item rar-${it.rar}"><div class="loot-cofre-item-sprite">${renderIcono(it,"48px")}</div><span class="loot-cofre-item-name">${it.nombre}</span><span class="loot-cofre-item-rar">${RAREZAS[it.rar].label}</span><span class="loot-cal-badge cal-${it.calidad||"normal"}">${cal.icon} ${cal.label}</span><span class="loot-cofre-item-val">+${v} ${it.tipo.toUpperCase()}</span></div>`;
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
    { id:"todos", label:"Todos", rows:null },
    { id:"plantas", label:"Plantas", rows:[0] },
    { id:"pociones", label:"Pociones", rows:[1] },
    { id:"libros", label:"Libros", rows:[2] },
    { id:"gemas", label:"Gemas", rows:[3] },
    { id:"armas", label:"Armas", rows:[4,5,6] },
    { id:"defensa", label:"Defensa", rows:[7] },
    { id:"joyeria", label:"Joyería", rows:[8] },
    { id:"reliquias", label:"Reliquias", rows:[9] }
  ];
  let filtro = "todos";

  function renderColeccion() {
    const c = document.querySelector('[data-rpg-panel="objetos"]');
    if (!c) return;
    const loot = cargarLoot();
    const total = Object.values(loot).reduce((a,b) => a+b, 0);
    const uniq = Object.keys(loot).length;
    const cat = CATS.find(x => x.id === filtro) || CATS[0];
    const pool = cat.rows ? POOL.filter(p => cat.rows.includes(p.sprite[1])) : POOL;

    const filtros = CATS.map(x => `<button class="rpg-col-filtro ${x.id===filtro?"active":""}" data-cat="${x.id}">${x.label}</button>`).join("");

    let grid = "";
    pool.forEach(p => {
      const t = loot[p.id] || 0;
      grid += `<div class="rpg-coleccion-item rar-${p.rar}${p.consumible&&t?" consumible":""}${t?"":" bloqueado"}" data-id="${p.id}" title="${t?p.nombre+(p.consumible?" (usable)":""):"???"} (${RAREZAS[p.rar].label})">${renderIcono(p)}${t?`<span class="rpg-coleccion-cant">×${t}</span>`:""}</div>`;
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
    const grid = Object.entries(COFRES).map(([tipo,def]) => `<div class="rpg-cofre-card" data-tipo="${tipo}" style="--cofre-color:${def.color}"><span class="rpg-cofre-emoji">${def.emoji}</span><span class="rpg-cofre-nombre">${def.nombre}</span><span class="rpg-cofre-precio"><span data-icono="moneda"></span> ${def.precio}</span><button class="rpg-cofre-btn" data-tipo="${tipo}">Abrir</button></div>`).join("");
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
    loot[item.id] = (loot[item.id]||0) + 1;
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
    POOL, SHEET, RAREZAS, CALIDADES, COFRES,
    cargarLoot, guardarLoot, cargarStats, guardarStats,
    usarConsumible, getConsumibles,
    mostrarDetalleItem, mostrarPopup, renderIcono,
    renderColeccion, renderCofres, abrirCofre,
    simular: jefe => { const it = sortearItemVictoria(!!jefe); const l = cargarLoot(); l[it.id] = (l[it.id]||0) + 1; guardarLoot(l); aplicarBonus(it); mostrarPopup(it); renderColeccion(); return it; },
    reset: () => { if (!confirm("¿Borrar TODO tu botín y bonus?")) return; localStorage.removeItem(KEY_LOOT()); localStorage.removeItem(KEY_STATS()); renderColeccion(); window.dispatchEvent(new Event("rpg:stats-cambiados")); }
  };

  console.log("rpg-loot.js listo · " + POOL.length + " items");
})();