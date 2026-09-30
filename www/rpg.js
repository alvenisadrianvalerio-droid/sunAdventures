/* ============================================================
   RPG.JS — Aventura por turnos · versión compacta con pestañas
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("rpg")) window._extraVistas.push("rpg");

(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n=0; const it=()=>{ if(window._TiendaAPI) return boot(); if(++n>50) return; setTimeout(it,100); }; return setTimeout(it,100); }

  const { ICONO, COMIDAS, getMonedas, setMonedas, cargarInv, notifMascota, getUserId } = API;
  const $  = id => document.getElementById(String(id).replace(/^#/,""));
  const qs = (s,r=document)=>r.querySelector(s);
  const qsa= (s,r=document)=>[...r.querySelectorAll(s)];
  const rnd= (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const clamp=(n,a=0,b=1e9)=>Math.max(a,Math.min(b,n));
  const SND= t=>{ try{window._snd?.(t);}catch{} };
  const MASCOTAS = window._MASCOTAS || {};

  /* ============================================================
     ZONAS
     ============================================================ */
  const ZONAS = [
    { id:"bosque",    nombre:"Bosque de Girasoles", desc:"Enemigos tranquilos",     icono:ICONO.bosque,   nivel:1,  enemigos:["abeja","mariposa","caracol","pajaro"],        hp:30,   atk:8,   xp:12,   monedas:8    },
    { id:"cueva",     nombre:"Cueva Cristal",       desc:"Oscura y fría",           icono:ICONO.montaña,  nivel:3,  enemigos:["lagarto","pulpo","tortuga"],                  hp:60,   atk:15,  xp:28,   monedas:18   },
    { id:"castillo",  nombre:"Castillo de Naipes",  desc:"Guardias de élite",       icono:ICONO.castillo, nivel:6,  enemigos:["dragon-bebe","jirafa","hamburguesa"],         hp:100,  atk:25,  xp:55,   monedas:35   },
    { id:"torre",     nombre:"Torre del Alba",      desc:"El primer jefe",          icono:ICONO.corona,   nivel:10, enemigos:["dragon-anciano"], jefe:true,                 hp:200,  atk:40,  xp:150,  monedas:120  },
    { id:"desierto",  nombre:"Desierto Ardiente",   desc:"Arena y escorpiones",     icono:ICONO.fuego,    nivel:13, enemigos:["escorpion","serpiente","escarabajo"],        hp:260,  atk:50,  xp:220,  monedas:180  },
    { id:"glaciar",   nombre:"Glaciar Eterno",      desc:"Hielo que corta",         icono:ICONO.copo,     nivel:16, enemigos:["lobo-hielo","oso-polar","elemental-hielo"],   hp:330,  atk:62,  xp:300,  monedas:240  },
    { id:"volcan",    nombre:"Volcán Dormido",      desc:"Ríos de lava",            icono:ICONO.fuego,    nivel:20, enemigos:["golem-lava","salamandra","fenix-joven"],      hp:420,  atk:76,  xp:400,  monedas:320  },
    { id:"ruinas",    nombre:"Ruinas Antiguas",     desc:"Ecos del pasado",         icono:ICONO.castillo, nivel:24, enemigos:["esqueleto","momia","gargola"],                hp:520,  atk:90,  xp:520,  monedas:420  },
    { id:"pantano",   nombre:"Pantano Sombrío",     desc:"Niebla venenosa",         icono:ICONO.bosque,   nivel:28, enemigos:["sapo-gigante","cocodrilo","bruja-pantano"],   hp:640,  atk:105, xp:660,  monedas:540  },
    { id:"cavernas",  nombre:"Cavernas de Cristal", desc:"Gemas vivientes",         icono:ICONO.gema,     nivel:32, enemigos:["golem-cristal","murcielago","espectro"],     hp:780,  atk:120, xp:820,  monedas:680  },
    { id:"monte",     nombre:"Monte Celestial",     desc:"Rumbo al cielo",          icono:ICONO.montaña,  nivel:36, enemigos:["grifo","quimera","elemental-aire"],         hp:950,  atk:138, xp:1000, monedas:850  },
    { id:"oceano",    nombre:"Ciudad Sumergida",    desc:"Bajo las olas",           icono:ICONO.globo,    nivel:40, enemigos:["sirena","kraken-joven","tiburon"],          hp:1150, atk:158, xp:1200, monedas:1050 },
    { id:"sombras",   nombre:"Reino de Sombras",    desc:"Nadie sale igual",        icono:ICONO.luna,     nivel:45, enemigos:["espectro-negro","vampiro","nigromante"],    hp:1400, atk:180, xp:1450, monedas:1300 },
    { id:"fortaleza", nombre:"Fortaleza Mecánica",  desc:"Acero y engranajes",      icono:ICONO.ajustes,  nivel:50, enemigos:["robot-guardia","dron","mech-gigante"],     hp:1700, atk:205, xp:1750, monedas:1600 },
    { id:"valle",     nombre:"Valle de Dragones",   desc:"JEFE — Nido ancestral",   icono:ICONO.fuego,    nivel:55, enemigos:["dragon-rojo"], jefe:true,                 hp:2200, atk:235, xp:2200, monedas:2100 },
    { id:"abismo",    nombre:"Abismo Final",        desc:"JEFE FINAL — El vacío",   icono:ICONO.corona,   nivel:60, enemigos:["senor-abismo"], jefe:true,                 hp:3000, atk:280, xp:3500, monedas:3500 }
  ];

  const NOMBRES = {
    abeja:"Abeja Soldado", mariposa:"Mariposa Sombría", caracol:"Caracol Blindado", pajaro:"Gorrión Guerrero",
    lagarto:"Lagarto Espinoso", pulpo:"Pulpo Abisal", tortuga:"Tortuga de Hierro",
    "dragon-bebe":"Dragón Bebé", jirafa:"Jirafa Colosal", hamburguesa:"Hamburguesa Mutante", "dragon-anciano":"Dragón Ancestral",
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
    "dragon-rojo":"Dragón Rojo Ancestral", "senor-abismo":"Señor del Abismo"
  };

  /* ============================================================
     ESTADO
     ============================================================ */
  const KEY = () => `sa_rpg_${getUserId()}`;
  const def = () => ({ nivel:1, xp:0, hp:100, enemigosDerrotados:0, jefesDerrotados:[], zonaActual:null, statsBase:{atk:10,def:3} });
  const cargar = () => { try { const r = localStorage.getItem(KEY()); return r ? { ...def(), ...JSON.parse(r) } : def(); } catch { return def(); } };
  const guardar = s => { try { localStorage.setItem(KEY(), JSON.stringify(s)); } catch {} };

  const statsLoot = () => { try { return JSON.parse(localStorage.getItem(`sa_rpg_stats_${getUserId()}`) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}'); } catch { return { atkBonus:0, defBonus:0, hpBonus:0 }; } };
  const bonus = () => { try { return window._getBonusActivos?.() || []; } catch { return []; } };
const bonusTipo = t => bonus().filter(x => x.tipo === t).reduce((s, x) => s + (x.val || 0), 0);
  const tieneBonus = t => bonus().some(x => x.tipo === t);

  const hpMax       = () => 80 + state.nivel*20 + (statsLoot().hpBonus||0) + bonusTipo("hp_max");
  const atkTotal    = () => state.statsBase.atk + state.nivel*3 + (statsLoot().atkBonus||0) + bonusTipo("atk_fijo");
  const defTotal    = () => state.statsBase.def + state.nivel*2 + (statsLoot().defBonus||0) + bonusTipo("def_fijo");
  const xpParaSubir = () => Math.round(state.nivel*100 + Math.pow(state.nivel,1.6)*20);

  let state = cargar(), enemigo = null, turnoJugador = true, overlayObjetos = false;

  /* ============================================================
     INYECCIÓN
     ============================================================ */
  function inyectarSeccion() {
    if ($("rpg")) return;
    const sec = document.createElement("section");
    sec.id = "rpg"; sec.className = "rpg-section view"; sec.dataset.view = "rpg";
    sec.innerHTML = `<div class="rpg-header"><h2 class="rpg-title">Aventura</h2><p class="rpg-subtitle">Lucha, sube de nivel y conquista las zonas</p></div><div id="rpg-content"></div>`;
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
    const dd = qs("#user-dropdown");
    if (dd) {
      const btn = document.createElement("a");
      btn.href = "#rpg"; btn.className = "user-dropdown-item"; btn.dataset.viewLink = "rpg";
      btn.innerHTML = `<span class="user-dropdown-icon" data-icono="espada"></span><span>Aventura RPG</span>`;
      const lo = qs("#logout-btn");
      lo ? lo.parentNode.insertBefore(btn, lo) : dd.appendChild(btn);
    }
  }

  /* ============================================================
     RENDER
     ============================================================ */
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
        <button type="button" class="rpg-tab ${tab==="zonas"?"active":""}" data-rpg-tab="zonas"><span class="rpg-tab-icon">${ICONO.mapa||""}</span><span class="rpg-tab-text">Zonas</span></button>
        <button type="button" class="rpg-tab ${tab==="objetos"?"active":""}" data-rpg-tab="objetos"><span class="rpg-tab-icon">${ICONO.gema||""}</span><span class="rpg-tab-text">Objetos</span></button>
        <button type="button" class="rpg-tab ${tab==="cofres"?"active":""}" data-rpg-tab="cofres"><span class="rpg-tab-icon">${ICONO.regalo||""}</span><span class="rpg-tab-text">Cofres</span></button>
      </div>
      <div class="rpg-panel ${tab==="zonas"?"active":""}" data-rpg-panel="zonas">${htmlMapa()}</div>
      <div class="rpg-panel ${tab==="objetos"?"active":""}" data-rpg-panel="objetos"></div>
      <div class="rpg-panel ${tab==="cofres"?"active":""}" data-rpg-panel="cofres"></div>`;

    qsa(".rpg-zone", c).forEach(b => b.addEventListener("click", () => entrarZona(b.dataset.zona)));
    qsa(".rpg-tab", c).forEach(t => t.addEventListener("click", () => {
      const target = t.dataset.rpgTab;
      c.dataset.tabActiva = target;
      qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
      qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === target));
      window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail: { tab: target } }));
    }));

    if (window.hidratarIconos) window.hidratarIconos(c);
    setTimeout(() => window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail: { tab } })), 0);
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
        <div class="rpg-hero-avatar">
          <img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">
        </div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span>${bonusTxt}</div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          <div class="rpg-barra-label"><span>XP</span><span>${state.xp} / ${xpParaSubir()}</span></div>
          <div class="rpg-barra xp"><span style="width:${xpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda||""} ${getMonedas()}</div>
      </div>
      <div class="rpg-zones">
        ${ZONAS.map(z => {
          const d = state.nivel >= z.nivel || state.enemigosDerrotados >= z.nivel*3;
          const v = z.jefe && state.jefesDerrotados.includes(z.id);
          return `<button type="button" class="rpg-zone ${d?"":"bloqueada"} ${z.jefe?"jefe":""}" data-zona="${z.id}" ${d?"":"disabled"}>
            <span class="rpg-zone-nivel">${z.jefe?"JEFE":"Nv "+z.nivel}</span>
            <div class="rpg-zone-icon">${z.icono||""}</div>
            <div class="rpg-zone-nombre">${z.nombre}${v?" ✓":""}</div>
            <div class="rpg-zone-desc">${z.desc}</div>
          </button>`;
        }).join("")}
      </div>
      <div class="rpg-idle">
        <div class="rpg-idle-icono">${ICONO.espada||""}</div>
        <div class="rpg-idle-titulo">Elige una zona</div>
        <div class="rpg-idle-desc">Enemigos derrotados: ${state.enemigosDerrotados}</div>
      </div>`;
  }

  function renderBatalla(c) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual")||"mapache"] || MASCOTAS.mapache;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const eIcon = ICONO[enemigo.iconoKey] || ICONO.estrella || "";

    c.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span></div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda||""} ${getMonedas()}</div>
      </div>
      <div class="rpg-batalla" id="rpg-batalla">
        <div class="rpg-batalla-top">
          <div class="rpg-fighter" id="fighter-heroe">
            <div class="rpg-fighter-sprite" id="sprite-heroe"><img src="${m.imagen}" alt="" style="width:90px;height:90px;max-width:90px;max-height:90px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
            <div class="rpg-fighter-nombre">${m.nombre}</div>
            <div class="rpg-fighter-hp">${Math.round(state.hp)} HP</div>
          </div>
          <div class="rpg-vs">VS</div>
          <div class="rpg-fighter" id="fighter-enemigo">
            <div class="rpg-fighter-sprite enemigo" id="sprite-enemigo">${eIcon}</div>
            <div class="rpg-fighter-nombre">${enemigo.nombre}</div>
            <div class="rpg-fighter-hp" id="hp-enemigo">${enemigo.hp} HP</div>
          </div>
        </div>
        <div class="rpg-log" id="rpg-log"><div class="rpg-log-item info">¡Un ${enemigo.nombre} aparece!</div></div>
        <div class="rpg-acciones" id="rpg-acciones">
          <button type="button" class="rpg-btn atacar" id="btn-atacar">⚔ Atacar</button>
          <button type="button" class="rpg-btn objeto" id="btn-objeto">🧪 Objeto</button>
          <button type="button" class="rpg-btn huir" id="btn-huir">🏃 Huir</button>
        </div>
        <div id="rpg-objetos-wrap"></div>
      </div>`;

    if (window.hidratarIconos) window.hidratarIconos(c);
    $("#btn-atacar")?.addEventListener("click", atacar);
    $("#btn-objeto")?.addEventListener("click", toggleObjetos);
    $("#btn-huir")?.addEventListener("click", huir);
  }

  /* ============================================================
     COMBATE
     ============================================================ */
  function entrarZona(id) {
    const z = ZONAS.find(x => x.id === id); if (!z) return;
    state.zonaActual = z.id; guardar(state);
    const eId = z.enemigos[rnd(0, z.enemigos.length-1)];
    const v = rnd(-20,20)/100;
    const hp = Math.round(z.hp * (1+v));
    enemigo = { id:eId, iconoKey:eId, nombre:NOMBRES[eId]||eId, hpMax:hp, hp, atk:Math.round(z.atk*(1+v)), xp:z.xp, monedas:z.monedas, jefe:!!z.jefe };
    turnoJugador = true; overlayObjetos = false; SND("blip"); render();
  }

  function log(txt, tipo="info") {
    const l = $("#rpg-log"); if (!l) return;
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
    ["#btn-atacar","#btn-objeto","#btn-huir"].forEach(s => { const b = qs(s); if (b) b.disabled = d; });
  }

  function actualizarHPs() {
    const he = $("hp-enemigo"); if (he) he.textContent = `${Math.max(0,enemigo.hp)} HP`;
    const hh = qs("#fighter-heroe .rpg-fighter-hp"); if (hh) hh.textContent = `${Math.round(state.hp)} HP`;
    const b = qs(".rpg-barra.hp > span"); if (b) b.style.width = clamp(state.hp/hpMax()*100) + "%";
  }

  function atacar() {
    if (!enemigo || !turnoJugador) return;
    turnoJugador = false; deshab(true);
    const crit = Math.random() < (0.15 + bonusTipo("crit_pct")/100);
    let dmg = atkTotal() - rnd(2,6);
    if (crit) dmg = Math.round(dmg * 1.8);
    if (enemigo.jefe && tieneBonus("crit_jefe")) dmg = Math.round(dmg * (1 + bonusTipo("crit_jefe")/100));
    const fuego = bonusTipo("fuego_atk");
    if (fuego > 0) dmg += rnd(0, fuego);
    dmg = Math.max(1, dmg);
    enemigo.hp = Math.max(0, enemigo.hp - dmg);
    SND(crit ? "victoria" : "atrapado");
    log((crit?"¡CRÍTICO! ":"") + "Atacas por " + dmg + " daño." + (fuego>0?" 🔥":""), crit?"critico":"daño");
    floatDmg("#sprite-enemigo", "-"+dmg, crit?"critico":"daño");
    qs("#sprite-enemigo")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-enemigo")?.classList.remove("golpeado"), 350);
    actualizarHPs();

    if (bonusTipo("stun_pct") > 0 && Math.random() < bonusTipo("stun_pct")/100) {
      log("⚡ ¡Enemigo aturdido!", "critico");
      if (enemigo.hp > 0) { setTimeout(() => { turnoJugador = true; deshab(false); }, 600); return; }
    }
    if (enemigo.hp <= 0) { setTimeout(victoria, 500); return; }
    setTimeout(turnoEnemigo, 800);
  }

  function turnoEnemigo() {
    if (!enemigo) return;
    const rg = bonusTipo("regen_turno");
    if (rg > 0) {
      const a = state.hp; state.hp = Math.min(hpMax(), state.hp + rg);
      const c = Math.round(state.hp - a); if (c > 0) log("💚 Regeneras " + c + " HP.", "curar");
    }
    const esq = bonusTipo("esquivar")/100;
    if (esq > 0 && Math.random() < esq) {
      log("😎 ¡Esquivaste!", "curar"); floatDmg("#sprite-heroe", "¡ESQUIVA!", "curar");
      guardar(state); actualizarHPs(); turnoJugador = true; deshab(false); return;
    }
    const dmg = Math.max(1, enemigo.atk - defTotal() + rnd(-3,3));
    state.hp = Math.max(0, state.hp - dmg); guardar(state);
    SND("derrota");
    log(enemigo.nombre + " te ataca por " + dmg + ".", "daño");
    floatDmg("#sprite-heroe", "-"+dmg, "daño");
    qs("#sprite-heroe")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-heroe")?.classList.remove("golpeado"), 350);
    actualizarHPs();
    if (state.hp <= 0) { setTimeout(derrota, 500); return; }
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
      ${comidas.map(([id,c]) => {
        let ic = ICONO[c.icono] || "";
        if (Array.isArray(c.sprite) && c.sprite.length === 2) {
          const px = (c.sprite[0]/4)*100, py = (c.sprite[1]/4)*100;
          ic = `<div class="tienda-item-sprite" style="width:28px;height:28px;background-position:${px}% ${py}%"></div>`;
        }
        return `<button type="button" class="rpg-objeto" data-tipo="comida" data-id="${id}" title="${c.nombre}"><span class="rpg-objeto-icono">${ic}</span><span class="rpg-objeto-cantidad">${inv[id]}</span></button>`;
      }).join("")}
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
    if (item.tipo === "hp") {
      const a = state.hp;
      state.hp = clamp(state.hp + item.val, 0, hpMax()); guardar(state);
      SND("comer"); log(`Usas ${item.nombre}. +${Math.round(state.hp-a)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp-a)}`, "curar");
    } else if (item.tipo === "atk") {
      enemigo.hp = Math.max(0, enemigo.hp - item.val);
      SND("sparkle"); log(`¡Lanzas ${item.nombre}! ${item.val} de daño.`, "critico");
      floatDmg("#sprite-enemigo", `-${item.val}`, "critico");
    } else if (item.tipo === "def") {
      const a = state.hp;
      state.hp = clamp(state.hp + item.val*3, 0, hpMax()); guardar(state);
      SND("comer"); log(`Usas ${item.nombre}. +${Math.round(state.hp-a)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp-a)}`, "curar");
    }
    actualizarHPs();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    if (enemigo.hp <= 0) setTimeout(victoria, 500);
    else setTimeout(turnoEnemigo, 700);
  }

  function huir() {
    if (!turnoJugador || !enemigo) return;
    const chance = tieneBonus("escape_seguro") ? 1 : 0.7;
    if (Math.random() < chance) {
      log("Escapas del combate...", "info");
      setTimeout(() => { enemigo = null; render(); }, 500);
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

    window.dispatchEvent(new CustomEvent("rpg:victoria", { detail: { enemigo: { ...enemigo, zona:state.zonaActual, xp, monedas:mon } } }));
    state.enemigosDerrotados++;
    state.xp += xp;
    if (eraJefe && !state.jefesDerrotados.includes(state.zonaActual)) state.jefesDerrotados.push(state.zonaActual);

    let sub = 0;
    while (state.xp >= xpParaSubir()) { state.xp -= xpParaSubir(); state.nivel++; state.hp = hpMax(); sub++; }
    const cuv = bonusTipo("curar_victoria");
    if (cuv > 0) { state.hp = Math.min(hpMax(), state.hp + cuv); log("💚 +"+cuv+" HP.", "curar"); }

    setMonedas(getMonedas() + mon);
    SND("victoria");
    try { window._darPremio?.(0, 10, "¡Victoria!"); } catch {}
    try { notifMascota("¡Victoria!", "+"+mon+" monedas · +"+xp+" XP"); } catch {}
    guardar(state);
    $("rpg-batalla")?.classList.add("ganada");
    log("¡"+nE+" derrotado! +"+xp+" XP, +"+mon+" monedas.", "info");
    if (sub > 0) log("¡Subiste a nivel "+state.nivel+"!", "critico");
    setTimeout(() => { enemigo = null; render(); }, 1500);
  }

  function derrota() {
    SND("derrota"); log("Has caído...", "daño");
    try { notifMascota?.("Derrota", "Pierdes la mitad de tus monedas"); } catch {}
    setMonedas(getMonedas() - Math.floor(getMonedas()/2));
    state.hp = Math.round(hpMax()*0.3); guardar(state);
    $("rpg-batalla")?.classList.add("muerto");
    setTimeout(() => { enemigo = null; render(); }, 1600);
  }

  /* ============================================================
     ACTIVACIÓN
     ============================================================ */
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

  window.Rpg = { state: () => state, enemigo: () => enemigo, zonas: ZONAS, reset: () => { localStorage.removeItem(KEY()); state = def(); render(); } };
  console.log("✅ rpg.js listo · zonas:", ZONAS.length);
})();