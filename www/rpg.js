/* ============================================================
   RPG.JS — Aventura por turnos integrada con SunAdventures
   Reutiliza: mascotas, comida, monedas, XP, sonidos, iconos
   Integra bonus permanentes del sistema de botín (rpg-loot.js)
   ============================================================ */

/* Registrar la vista "rpg" en el sistema global ANTES del IIFE */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("rpg")) window._extraVistas.push("rpg");

(function boot() {
  const API = window._TiendaAPI;
  if (!API) {
    let n = 0;
    const intentar = () => {
      if (window._TiendaAPI) return boot();
      if (++n > 50) return console.warn("rpg.js: _TiendaAPI nunca llegó");
      setTimeout(intentar, 100);
    };
    setTimeout(intentar, 100);
    return;
  }

  /* ---------- Dependencias de la API ---------- */
  const {
    ICONO, COMIDAS,
    getMonedas, setMonedas,
    cargarInv, guardarInv,
    notifMascota, getUserId
  } = API;

  /* ---------- Helpers ---------- */
  const $   = (id) => document.getElementById(String(id).replace(/^#/, ""));
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (n, a = 0, b = 1e9) => Math.max(a, Math.min(b, n));
  const SND = (t) => { try { window._snd?.(t); } catch {} };
  const MASCOTAS = window._MASCOTAS || {};

  /* ============================================================
     DATOS DEL MUNDO
     ============================================================ */
  const ZONAS = [
    { id: "bosque",   nombre: "Bosque de Girasoles", desc: "Enemigos tranquilos",     icono: ICONO.bosque,   nivel: 1,  enemigos: ["abeja","mariposa","caracol","pajaro"], hp: 30,  atk: 8,  xp: 12,  monedas: 8  },
    { id: "cueva",    nombre: "Cueva Cristal",       desc: "Oscura y fría",           icono: ICONO.montaña,  nivel: 3,  enemigos: ["lagarto","pulpo","tortuga"],             hp: 60,  atk: 15, xp: 28,  monedas: 18 },
    { id: "castillo", nombre: "Castillo de Naipes",  desc: "Guardias de élite",       icono: ICONO.castillo, nivel: 6,  enemigos: ["dragon-bebe","jirafa","hamburguesa"],    hp: 100, atk: 25, xp: 55,  monedas: 35 },
    { id: "torre",    nombre: "Torre del Alba",      desc: "El jefe final te espera", icono: ICONO.corona,   nivel: 10, enemigos: ["dragon-anciano"], jefe: true,            hp: 200, atk: 40, xp: 150, monedas: 120 }
  ];

  const NOMBRES_ENEMIGO = {
    abeja: "Abeja Soldado", mariposa: "Mariposa Sombría", caracol: "Caracol Blindado", pajaro: "Gorrión Guerrero",
    lagarto: "Lagarto Espinoso", pulpo: "Pulpo Abisal", tortuga: "Tortuga de Hierro",
    "dragon-bebe": "Dragón Bebé", jirafa: "Jirafa Colosal", hamburguesa: "Hamburguesa Mutante",
    "dragon-anciano": "Dragón Ancestral"
  };

  /* ============================================================
     ESTADO + PERSISTENCIA
     ============================================================ */
  const KEY = () => `sa_rpg_${getUserId()}`;
  const defaultState = () => ({
    nivel: 1,
    xp: 0,
    hp: 100,
    enemigosDerrotados: 0,
    jefesDerrotados: [],
    zonaActual: null,
    statsBase: { atk: 10, def: 3 }
  });

  const cargar = () => {
    try {
      const raw = localStorage.getItem(KEY());
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch { return defaultState(); }
  };
  const guardar = (s) => { try { localStorage.setItem(KEY(), JSON.stringify(s)); } catch {} };

  /* ---------- Stats del botín (compartidos con rpg-loot.js) ---------- */
  const statsLoot = () => {
    try {
      return JSON.parse(localStorage.getItem(`sa_rpg_stats_${getUserId()}`) || '{"atkBonus":0,"defBonus":0,"hpBonus":0}');
    } catch { return { atkBonus: 0, defBonus: 0, hpBonus: 0 }; }
  };

  /* ---------- Bonus de skins de la tienda ---------- */
  function bonusSkins() {
    try { return window._getBonusActivos ? window._getBonusActivos() : []; } catch(e) { return []; }
  }
  function getBonusTipo(tipo) {
    const b = bonusSkins().find(function(x) { return x.tipo === tipo; });
    return b ? b.val : 0;
  }
  function tieneBonusTipo(tipo) {
    return bonusSkins().some(function(x) { return x.tipo === tipo; });
  }

  /* ---------- Formulas de combate ---------- */
  const hpMax        = () => 80 + state.nivel * 20 + (statsLoot().hpBonus  || 0) + getBonusTipo("hp_max");
  const atkTotal     = () => state.statsBase.atk + state.nivel * 3 + (statsLoot().atkBonus || 0) + getBonusTipo("atk_fijo");
  const defTotal     = () => state.statsBase.def + state.nivel * 2 + (statsLoot().defBonus || 0) + getBonusTipo("def_fijo");
  const xpParaSubir  = () => state.nivel * 100;

  /* ---------- Variables mutables ---------- */
  let state          = cargar();
  let enemigo        = null;
  let turnoJugador   = true;
  let overlayObjetos = false;

  /* ============================================================
     INYECCIÓN DE SECCIÓN + NAV
     ============================================================ */
  function inyectarSeccion() {
    if ($("rpg")) return;
    const sec = document.createElement("section");
    sec.id = "rpg";
    sec.className = "rpg-section view";
    sec.dataset.view = "rpg";
    sec.innerHTML = `
      <div class="rpg-header">
        <h2 class="rpg-title">Aventura</h2>
        <p class="rpg-subtitle">Lucha, sube de nivel y conquista las 4 zonas</p>
      </div>
      <div id="rpg-content"></div>
    `;
    const footer = qs(".site-footer");
    footer ? footer.parentNode.insertBefore(sec, footer) : document.body.appendChild(sec);
  }

  function inyectarNav() {
    if (qs('[data-view-link="rpg"]')) return;
    const nav = qs(".nav-links");
    if (!nav) return;

    // Botón principal en la barra
    const a = document.createElement("a");
    a.href = "#rpg";
    a.className = "nav-link";
    a.dataset.viewLink = "rpg";
    a.innerHTML = `<span class="ui-icon nav-link-icon" data-icono="espada"></span><span class="nav-link-text">Aventura</span>`;
    nav.appendChild(a);

    // Entrada en el dropdown
    const dd = qs("#user-dropdown");
    if (dd) {
      const btn = document.createElement("a");
      btn.href = "#rpg";
      btn.className = "user-dropdown-item";
      btn.dataset.viewLink = "rpg";
      btn.innerHTML = `<span class="user-dropdown-icon" data-icono="espada"></span><span>Aventura RPG</span>`;
      const logout = qs("#logout-btn");
      logout ? logout.parentNode.insertBefore(btn, logout) : dd.appendChild(btn);
    }
  }

  /* ============================================================
     RENDER PRINCIPAL
     ============================================================ */
  function render() {
    inyectarNav();
    inyectarSeccion();
    const cont = $("rpg-content");
    if (!cont) return;
    enemigo ? renderBatalla(cont) : renderMapa(cont);
  }

  /* ---------- Mapa / selector de zonas ---------- */
  function renderMapa(cont) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const hpPct = clamp((state.hp / hpMax()) * 100, 0, 100);
    const xpPct = clamp((state.xp / xpParaSubir()) * 100, 0, 100);
    const stats = statsLoot();
    const bonusTxt = (stats.atkBonus + stats.defBonus + stats.hpBonus) > 0
      ? `<span style="font-size:.68rem;opacity:.75;margin-left:.4rem;">+${stats.atkBonus}ATK +${stats.defBonus}DEF +${stats.hpBonus}HP</span>`
      : "";

    cont.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar">
          <img src="${m.imagen}" alt="${m.nombre}"
               style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;"
               onerror="this.onerror=null;this.src='img/girasol-loading.png'">
        </div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">
            ${m.nombre}
            <span class="rpg-hero-lvl">Nv ${state.nivel}</span>
            ${bonusTxt}
          </div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          <div class="rpg-barra-label"><span>XP</span><span>${state.xp} / ${xpParaSubir()}</span></div>
          <div class="rpg-barra xp"><span style="width:${xpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>

      <div class="rpg-zones">
        ${ZONAS.map(z => {
          const desbloqueada = state.nivel >= z.nivel || state.enemigosDerrotados >= z.nivel * 3;
          const vencidoJefe  = z.jefe && state.jefesDerrotados.includes(z.id);
          return `
            <button type="button"
                    class="rpg-zone ${desbloqueada ? "" : "bloqueada"} ${z.jefe ? "jefe" : ""}"
                    data-zona="${z.id}" ${desbloqueada ? "" : "disabled"}>
              <span class="rpg-zone-nivel">${z.jefe ? "JEFE" : "Nv " + z.nivel}</span>
              <div class="rpg-zone-icon">${z.icono || ""}</div>
              <div class="rpg-zone-nombre">${z.nombre}${vencidoJefe ? " ✓" : ""}</div>
              <div class="rpg-zone-desc">${z.desc}</div>
            </button>
          `;
        }).join("")}
      </div>

      <div class="rpg-idle">
        <div class="rpg-idle-icono">${ICONO.espada || ""}</div>
        <div class="rpg-idle-titulo">Elige una zona</div>
        <div class="rpg-idle-desc">Enemigos derrotados: ${state.enemigosDerrotados}</div>
      </div>
    `;

    if (typeof window.hidratarIconos === "function") window.hidratarIconos(cont);
    qsa(".rpg-zone", cont).forEach(b => b.addEventListener("click", () => entrarZona(b.dataset.zona)));
  }

  /* ---------- Escena de combate ---------- */
  function renderBatalla(cont) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const hpPct  = clamp((state.hp / hpMax()) * 100, 0, 100);
    const eHpPct = clamp((enemigo.hp / enemigo.hpMax) * 100, 0, 100);
    const enemigoIcono = ICONO[enemigo.iconoKey] || ICONO.estrella || "";

    cont.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar">
          <img src="${m.imagen}" alt="${m.nombre}"
               style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;"
               onerror="this.onerror=null;this.src='img/girasol-loading.png'">
        </div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span></div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>

      <div class="rpg-batalla" id="rpg-batalla">
        <div class="rpg-batalla-top">
          <div class="rpg-fighter" id="fighter-heroe">
            <div class="rpg-fighter-sprite" id="sprite-heroe">
              <img src="${m.imagen}" alt=""
                   style="width:90px;height:90px;max-width:90px;max-height:90px;object-fit:contain;display:block;image-rendering:pixelated;"
                   onerror="this.onerror=null;this.src='img/girasol-loading.png'">
            </div>
            <div class="rpg-fighter-nombre">${m.nombre}</div>
            <div class="rpg-fighter-hp">${Math.round(state.hp)} HP</div>
          </div>
          <div class="rpg-vs">VS</div>
          <div class="rpg-fighter" id="fighter-enemigo">
            <div class="rpg-fighter-sprite enemigo" id="sprite-enemigo">${enemigoIcono}</div>
            <div class="rpg-fighter-nombre">${enemigo.nombre}</div>
            <div class="rpg-fighter-hp" id="hp-enemigo">${enemigo.hp} HP</div>
          </div>
        </div>

        <div class="rpg-log" id="rpg-log">
          <div class="rpg-log-item info">¡Un ${enemigo.nombre} aparece!</div>
        </div>

        <div class="rpg-acciones" id="rpg-acciones">
          <button type="button" class="rpg-btn atacar" id="btn-atacar">⚔ Atacar</button>
          <button type="button" class="rpg-btn objeto" id="btn-objeto">🧪 Objeto</button>
          <button type="button" class="rpg-btn huir"   id="btn-huir">🏃 Huir</button>
        </div>

        <div id="rpg-objetos-wrap"></div>
      </div>
    `;

    if (typeof window.hidratarIconos === "function") window.hidratarIconos(cont);

    $("#btn-atacar")?.addEventListener("click", atacar);
    $("#btn-objeto")?.addEventListener("click", toggleObjetos);
    $("#btn-huir")?.addEventListener("click", huir);
  }

  /* ============================================================
     LÓGICA DE COMBATE
     ============================================================ */
  function entrarZona(zonaId) {
    const z = ZONAS.find(x => x.id === zonaId);
    if (!z) return;
    state.zonaActual = z.id;
    guardar(state);

    const enemId = z.enemigos[rnd(0, z.enemigos.length - 1)];
    const vari   = rnd(-20, 20) / 100;
    const hpBase = Math.round(z.hp * (1 + vari));

    enemigo = {
      id: enemId,
      iconoKey: enemId,
      nombre: NOMBRES_ENEMIGO[enemId] || enemId,
      hpMax: hpBase,
      hp: hpBase,
      atk: Math.round(z.atk * (1 + vari)),
      xp: z.xp,
      monedas: z.monedas,
      jefe: !!z.jefe
    };
    turnoJugador = true;
    overlayObjetos = false;
    SND("blip");
    render();
  }

  function log(txt, tipo = "info") {
    const l = $("#rpg-log");
    if (!l) return;
    const d = document.createElement("div");
    d.className = "rpg-log-item " + tipo;
    d.textContent = txt;
    l.appendChild(d);
    l.scrollTop = l.scrollHeight;
  }

  function floatDamage(targetSelector, txt, tipo = "daño") {
    const el = qs(targetSelector);
    if (!el) return;
    const f = document.createElement("span");
    f.className = "rpg-float " + tipo;
    f.textContent = txt;
    el.style.position = "relative";
    f.style.left = "50%";
    f.style.top = "20%";
    el.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  function deshabilitarAcciones(d) {
    ["#btn-atacar", "#btn-objeto", "#btn-huir"].forEach(s => {
      const b = qs(s);
      if (b) b.disabled = d;
    });
  }

  function actualizarHPs() {
    const hpEnem = $("hp-enemigo");
    if (hpEnem) hpEnem.textContent = `${Math.max(0, enemigo.hp)} HP`;

    const heroe = qs("#fighter-heroe .rpg-fighter-hp");
    if (heroe) heroe.textContent = `${Math.round(state.hp)} HP`;

    const barra = qs(".rpg-barra.hp > span");
    if (barra) barra.style.width = clamp((state.hp / hpMax()) * 100, 0, 100) + "%";
  }

  function atacar() {
    if (!enemigo || !turnoJugador) return;
    turnoJugador = false;
    deshabilitarAcciones(true);

    // Critico base + bonus de gafas/monoculo/gafas3d
    const critBase = 0.15 + getBonusTipo("crit_pct") / 100;
    const critico = Math.random() < critBase;
    let daño = atkTotal() - rnd(2, 6);
    if (critico) daño = Math.round(daño * 1.8);

    // Bonus sombrero: +20% daño a jefes
    if (enemigo.jefe && tieneBonusTipo("crit_jefe")) {
      daño = Math.round(daño * (1 + getBonusTipo("crit_jefe") / 100));
    }

    // Fondo fuego: daño extra de quemadura
    const fuego = getBonusTipo("fuego_atk");
    if (fuego > 0) daño += rnd(0, fuego);

    daño = Math.max(1, daño);
    enemigo.hp = Math.max(0, enemigo.hp - daño);
    SND(critico ? "victoria" : "atrapado");
    log((critico ? "¡CRÍTICO! " : "") + "Atacas por " + daño + " daño." + (fuego > 0 ? " 🔥" : ""), critico ? "critico" : "daño");
    floatDamage("#sprite-enemigo", "-" + daño, critico ? "critico" : "daño");
    qs("#sprite-enemigo")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-enemigo")?.classList.remove("golpeado"), 350);
    actualizarHPs();

    // Chispas: stun al enemigo (salta su siguiente turno)
    if (getBonusTipo("stun_pct") > 0 && Math.random() < getBonusTipo("stun_pct") / 100) {
      log("⚡ ¡Enemigo aturdido! Pierde su turno.", "critico");
      if (enemigo.hp > 0) {
        setTimeout(function() {
          turnoJugador = true;
          deshabilitarAcciones(false);
        }, 600);
        return;
      }
    }

    if (enemigo.hp <= 0) { setTimeout(victoria, 500); return; }
    setTimeout(turnoEnemigo, 800);
  }

  function turnoEnemigo() {
    if (!enemigo) return;

    // Regen de la diadema al inicio del turno enemigo (antes de recibir daño)
    const regen = getBonusTipo("regen_turno");
    if (regen > 0) {
      const antes = state.hp;
      state.hp = Math.min(hpMax(), state.hp + regen);
      const curado = Math.round(state.hp - antes);
      if (curado > 0) log("💚 Regeneras " + curado + " HP.", "curar");
    }

    // Gafas: esquivar el ataque
    const esquivar = getBonusTipo("esquivar") / 100;
    if (esquivar > 0 && Math.random() < esquivar) {
      log("😎 ¡Esquivaste el ataque!", "curar");
      floatDamage("#sprite-heroe", "¡ESQUIVA!", "curar");
      guardar(state);
      actualizarHPs();
      turnoJugador = true;
      deshabilitarAcciones(false);
      return;
    }

    const daño = Math.max(1, enemigo.atk - defTotal() + rnd(-3, 3));
    state.hp = Math.max(0, state.hp - daño);
    guardar(state);

    SND("derrota");
    log(enemigo.nombre + " te ataca por " + daño + " daño.", "daño");
    floatDamage("#sprite-heroe", "-" + daño, "daño");
    qs("#sprite-heroe")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-heroe")?.classList.remove("golpeado"), 350);
    actualizarHPs();

    if (state.hp <= 0) { setTimeout(derrota, 500); return; }
    turnoJugador = true;
    deshabilitarAcciones(false);
  }

 function toggleObjetos() {
  if (!turnoJugador) return;
  overlayObjetos = !overlayObjetos;
  const wrap = $("rpg-objetos-wrap");
  if (!wrap) return;

  if (!overlayObjetos) { wrap.innerHTML = ""; return; }

  const inv       = cargarInv();
  const comidas   = Object.entries(COMIDAS).filter(([id]) => (inv[id] || 0) > 0);
  const RpgLoot   = window.RpgLoot;
  const consum    = RpgLoot?.getConsumibles?.() || [];
  const lootInv   = RpgLoot?.cargarLoot?.() || {};

  if (!comidas.length && !consum.length) {
    wrap.innerHTML = `<div class="rpg-objetos">
      <div style="grid-column:1/-1;text-align:center;opacity:.6;font-style:italic;padding:.5rem;">
        No tienes objetos
      </div></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="rpg-objetos">
      ${comidas.map(([id, c]) => {
        let iconoHtml = ICONO[c.icono] || "";
        if (Array.isArray(c.sprite) && c.sprite.length === 2) {
          const posX = (c.sprite[0] / 4) * 100;
          const posY = (c.sprite[1] / 4) * 100;
          iconoHtml = `<div class="tienda-item-sprite" style="width:28px;height:28px;background-position:${posX}% ${posY}%"></div>`;
        }
        return `
          <button type="button" class="rpg-objeto" data-tipo="comida" data-id="${id}" title="${c.nombre}">
            <span class="rpg-objeto-icono">${iconoHtml}</span>
            <span class="rpg-objeto-cantidad">${inv[id]}</span>
          </button>
        `;
      }).join("")}
      ${consum.map(item => {
        const cant = lootInv[item.id] || 0;
        const iconHtml = RpgLoot?.renderIcono ? RpgLoot.renderIcono(item, "30px") : `<span class="loot-icono" data-icono="${item.icono}"></span>`;
        return `
          <button type="button" class="rpg-objeto rar-${item.rar}"
                  data-tipo="loot" data-id="${item.id}" title="${item.nombre}">
            <span class="rpg-objeto-icono">${iconHtml}</span>
            <span class="rpg-objeto-cantidad">${cant}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;

  if (typeof window.hidratarIconos === "function") window.hidratarIconos(wrap);

  qsa(".rpg-objeto", wrap).forEach(b => b.addEventListener("click", () => {
    if (b.dataset.tipo === "comida") usarObjeto(b.dataset.id);
    else usarLootConsumible(b.dataset.id);
  }));
}

function usarLootConsumible(id) {
  if (!turnoJugador || !enemigo) return;
  const RpgLoot = window.RpgLoot;
  if (!RpgLoot?.usarConsumible) return;

  const item = RpgLoot.POOL.find(p => p.id === id);
  if (!item) return;

  const ok = RpgLoot.usarConsumible(id);
  if (!ok) return;

  let consumido = true;

  if (item.tipo === "hp") {
    const antes = state.hp;
    state.hp = clamp(state.hp + item.val, 0, hpMax());
    guardar(state);
    SND("comer");
    log(`Usas ${item.nombre}. +${Math.round(state.hp - antes)} HP.`, "curar");
    floatDamage("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
    actualizarHPs();
  } else if (item.tipo === "atk") {
    enemigo.hp = Math.max(0, enemigo.hp - item.val);
    SND("sparkle");
    log(`¡Lanzas ${item.nombre}! ${item.val} de daño.`, "critico");
    floatDamage("#sprite-enemigo", `-${item.val}`, "critico");
    actualizarHPs();
  } else if (item.tipo === "def") {
    const antes = state.hp;
    state.hp = clamp(state.hp + item.val * 3, 0, hpMax());
    guardar(state);
    SND("comer");
    log(`Usas ${item.nombre}. +${Math.round(state.hp - antes)} HP.`, "curar");
    floatDamage("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
    actualizarHPs();
  }

  overlayObjetos = false;
  const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
  turnoJugador = false;
  deshabilitarAcciones(true);

  if (enemigo.hp <= 0) setTimeout(victoria, 500);
  else setTimeout(turnoEnemigo, 700);
}
  /* ============================================================
     VICTORIA / DERROTA
     ============================================================ */
  function victoria() {
    if (!enemigo) return;
    const eraJefe = enemigo.jefe;
    const nombreE = enemigo.nombre;
    let xp = enemigo.xp;
    let monedas = enemigo.monedas;

    // Bonus de skins: XP extra
    const xpBonusPct = getBonusTipo("xp_extra") / 100;
    if (xpBonusPct > 0) xp = Math.round(xp * (1 + xpBonusPct));

    // Bonus de skins: monedas extra
    monedas += getBonusTipo("monedas_victoria");

    // Disparar evento ANTES de resetear (rpg-loot.js lo escucha)
    // Collar: doble probabilidad de loot
    const lootExtra = tieneBonusTipo("loot_extra");
    window.dispatchEvent(new CustomEvent("rpg:victoria", {
      detail: { enemigo: Object.assign({}, enemigo, { zona: state.zonaActual, xp: xp, monedas: monedas, lootExtra: lootExtra }) }
    }));

    state.enemigosDerrotados++;
    state.xp += xp;
    if (eraJefe && !state.jefesDerrotados.includes(state.zonaActual)) {
      state.jefesDerrotados.push(state.zonaActual);
    }

    // Subir niveles
    let subio = 0;
    while (state.xp >= xpParaSubir()) {
      state.xp -= xpParaSubir();
      state.nivel++;
      state.hp = hpMax();
      subio++;
    }

    // Bonus de skins: curar tras victoria
    const curacionVict = getBonusTipo("curar_victoria");
    if (curacionVict > 0) {
      state.hp = Math.min(hpMax(), state.hp + curacionVict);
      log("💚 +" + curacionVict + " HP por victoria.", "curar");
    }

    setMonedas(getMonedas() + monedas);
    SND("victoria");
    try { window._darPremio?.(0, 10, "¡Victoria!"); } catch(e) {}
    try { if (typeof notifMascota === "function") notifMascota("¡Victoria!", "+" + monedas + " monedas · +" + xp + " XP"); } catch(e) {}

    guardar(state);

    const batalla = $("rpg-batalla");
    batalla?.classList.add("ganada");

    let logTxt = "¡" + nombreE + " derrotado! +" + xp + " XP, +" + monedas + " monedas.";
    if (xpBonusPct > 0) logTxt += " 📚 XP bonus!";
    log(logTxt, "info");
    if (subio > 0) log("¡Subiste a nivel " + state.nivel + "!", "critico");

    setTimeout(function() { enemigo = null; render(); }, 1500);
  }

  function derrota() {
    SND("derrota");
    log("Has caído...", "daño");
    try { notifMascota?.("Derrota", "Pierdes la mitad de tus monedas"); } catch {}

    const perdida = Math.floor(getMonedas() / 2);
    setMonedas(getMonedas() - perdida);
    state.hp = Math.round(hpMax() * 0.3);
    guardar(state);

    const batalla = $("rpg-batalla");
    batalla?.classList.add("muerto");

    setTimeout(() => { enemigo = null; render(); }, 1600);
  }

  /* ============================================================
     ACTIVACIÓN DE LA VISTA RPG
     ============================================================ */
  function activarVistaRpg() {
    qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "rpg"));
    qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "rpg"));
    document.body.style.overflow = "";
  }

  /* ============================================================
     LISTENERS GLOBALES
     ============================================================ */
  // Cambio de hash
  window.addEventListener("hashchange", () => {
    if (location.hash === "#rpg") {
      activarVistaRpg();
      render();
    }
  });

  // Click en cualquier enlace [data-view-link="rpg"]
  document.addEventListener("click", (e) => {
    const link = e.target.closest('[data-view-link="rpg"]');
    if (!link) return;
    setTimeout(() => { activarVistaRpg(); render(); }, 0);
  });

  // Cuando el botín sume bonus, recalcular HP máximo y clamp
  window.addEventListener("rpg:stats-cambiados", () => {
    state.hp = Math.min(state.hp, hpMax());
    guardar(state);
    if ($("rpg-content")) render();
  });

  // Cuando el usuario cambia de mascota, refrescar el héroe
  window.addEventListener("sunadventures:mascota-cambiada", () => {
    if ($("rpg-content")) render();
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    inyectarSeccion();
    inyectarNav();
    render();
    // Si la página cargó directamente en #rpg, activar YA
    if (location.hash === "#rpg") activarVistaRpg();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Failsafe: por si album.js pisó el estado después
  setTimeout(() => {
    if (location.hash === "#rpg" && !$("rpg")?.classList.contains("active")) {
      activarVistaRpg();
      render();
    }
  }, 300);

  /* ---------- API interna para debug / otros módulos ---------- */
  window.Rpg = {
    state: () => state,
    enemigo: () => enemigo,
    zonas: ZONAS,
    reset: () => { localStorage.removeItem(KEY()); state = defaultState(); render(); }
  };

  console.log("✅ rpg.js listo · zonas:", ZONAS.length);
})();