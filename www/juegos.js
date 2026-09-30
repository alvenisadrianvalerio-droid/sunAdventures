/* ============================================================
   JUEGOS.JS — 20 minijuegos únicos, optimizados y divertidos
   Con power-ups, rachas, dificultad progresiva y variedad
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const ICONO = window.ICONO || {};
  const getUserId = () => window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
  const randomDe = (a) => (Array.isArray(a) && a.length) ? a[Math.floor(Math.random() * a.length)] : "";
  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
  const rnd = (min, max) => Math.random() * (max - min) + min;
  const rndInt = (min, max) => Math.floor(rnd(min, max + 1));

  const MASCOTAS = () => window._MASCOTAS || {};
  const FRASES = () => window._FRASES || {};
  const darPremio = (m, f, mot) => window._darPremio ? window._darPremio(m, f, mot) : null;
  const snd = (t) => window._snd ? window._snd(t) : null;
  const getMonedas = () => window._getMonedas ? window._getMonedas() : 50;
  const setMonedas = (n) => window._setMonedas ? window._setMonedas(n) : n;

  const _timersPorOverlay = new WeakMap();

function registrarTimer(overlay, id) {
  if (!_timersPorOverlay.has(overlay)) _timersPorOverlay.set(overlay, new Set());
  _timersPorOverlay.get(overlay).add(id);
}

function limpiarTimers(overlay) {
  const set = _timersPorOverlay.get(overlay);
  if (!set) return;
  set.forEach(id => {
    if (typeof id === "number") clearInterval(id) || clearTimeout(id);
  });
  set.clear();
}

  // ============ HELPERS ============
  function crearOverlay(id, html) {
  document.getElementById(id)?.remove();
  const o = document.createElement("div");
  o.id = id; o.className = "minijuego-overlay";
  o.innerHTML = `<div class="minijuego-panel"><button class="minijuego-cerrar" data-close-juego aria-label="Cerrar">×</button>${html}</div>`;
  document.body.appendChild(o);

  const cerrar = () => {
    limpiarTimers(o);       // ⬅️ mata intervals pendientes
    o.classList.remove("active");
    setTimeout(() => o.remove(), 250);
  };

  o.addEventListener("click", e => {
    if (e.target === o || e.target.hasAttribute("data-close-juego")) cerrar();
  });

  // Expón un hook para que cada juego registre sus timers
  o._cerrar = cerrar;
  return o;
}

  const HUD = (items) => `<div class="jm-hud">${items.map(i => `
    <div class="jm-hud-card${i.cls ? " " + i.cls : ""}">
      <span class="jm-hud-icon">${i.icon || ""}</span>
      <div class="jm-hud-info"><span class="jm-hud-label">${i.label}</span><strong id="${i.id}">${i.value}</strong></div>
    </div>`).join("")}</div>`;

  const finalizar = (o, { titulo, emoji, subtitulo, num, extra, botonTxt = "Otra vez", onReiniciar }) => {
    const p = qs(".minijuego-panel", o);
    const r = document.createElement("div");
    r.className = "minijuego-mensaje jm-final";
    r.innerHTML = `
      <div class="jg-final-emoji">${emoji || ICONO.trofeo || ""}</div>
      <h2>${titulo}</h2>
      ${subtitulo ? `<p>${subtitulo}</p>` : ""}
      ${num !== undefined ? `<span class="minijuego-mensaje-num">${num}</span>` : ""}
      ${extra ? `<p style="color:#ffd93d;font-weight:bold;">${extra}</p>` : ""}
      <div class="minijuego-botones"><button type="button" class="btn-primary" id="mini-otra">${botonTxt}</button></div>`;
    p.appendChild(r);
    qs("#mini-otra", r).addEventListener("click", () => { o.remove(); onReiniciar?.(); });
    return r;
  };

  const loopAnim = (fn) => { const step = (t) => { if (fn(t) !== false) requestAnimationFrame(step); }; requestAnimationFrame(step); };

  const popPuntos = (parent, x, y, txt, color = "#ffd93d") => {
    const p = document.createElement("span");
    p.className = "minijuego-pop";
    p.style.left = x + "px"; p.style.top = y + "px";
    p.style.color = color;
    p.textContent = txt;
    parent.appendChild(p);
    setTimeout(() => p.remove(), 800);
  };

  const onKeyOnce = (o, handler) => {
    document.addEventListener("keydown", handler);
    o.addEventListener("click", e => {
      if (e.target.hasAttribute("data-close-juego") || e.target === o)
        document.removeEventListener("keydown", handler);
    });
  };

  // ============================================================
  // 1. DADOS LOCOS
  // ============================================================
  function juegoDados() {
    const o = crearOverlay("juego-dados-overlay", `
      <h2 class="minijuego-titulo">Dados locos</h2>
      <p class="minijuego-desc">Tira los dados y busca combinaciones · ¡Bonus por racha!</p>
      ${HUD([
        { id:"dad-puntos", label:"Puntos", value:"0", icon:ICONO.dado || "" },
        { id:"dad-tiradas", label:"Tiradas", value:"0 / 5", icon:ICONO.reintentar || "" },
        { id:"dad-racha", label:"Racha", value:"0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="dad-dados" id="dad-dados"></div>
      <div class="dad-botones"><button type="button" class="btn-primary" id="dad-girar">Tirar dados</button></div>
      <div class="simon-estado" id="dad-estado">Pulsa "Tirar dados"</div>
    `);
    o.classList.add("active");
    const cont = $("dad-dados"), eP = $("dad-puntos"), eT = $("dad-tiradas"), eR = $("dad-racha"), estado = $("dad-estado"), btn = $("dad-girar");
    let puntos = 0, tiradas = 0, racha = 0, activo = true, rachaCombos = 0;

    const renderDado = (val) => {
      const pos = { 1:[[50,50]], 2:[[25,25],[75,75]], 3:[[25,25],[50,50],[75,75]],
        4:[[25,25],[75,25],[25,75],[75,75]], 5:[[25,25],[75,25],[50,50],[25,75],[75,75]],
        6:[[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]] };
      return `<svg viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" rx="14" fill="none" stroke="currentColor" stroke-width="3"/>${pos[val].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="7" fill="currentColor"/>`).join("")}</svg>`;
    };

    function tirar() {
      if (!activo) return;
      btn.disabled = true;
      tiradas++; eT.textContent = `${tiradas} / 5`;
      const valores = Array.from({length:5}, () => rndInt(1,6));
      cont.innerHTML = valores.map(() => `<div class="dad-dado">?</div>`).join("");
      let giros = 0;
      const anim = setInterval(() => {
        qsa(".dad-dado", cont).forEach(d => d.textContent = rndInt(1,6));
        if (++giros >= 12) {
          clearInterval(anim);
          qsa(".dad-dado", cont).forEach((d, i) => { d.innerHTML = renderDado(valores[i]); d.classList.add("resultado"); });
          const cuenta = {}; valores.forEach(v => cuenta[v] = (cuenta[v]||0)+1);
          const maxRep = Math.max(...Object.values(cuenta));
          let ganados = valores.reduce((a,b)=>a+b,0);
          let bonusMsg = "";
          if (maxRep === 5) { ganados += 150; rachaCombos++; bonusMsg = "¡REPÓKER! +150"; snd("victoria"); }
          else if (maxRep === 4) { ganados += 60; rachaCombos++; bonusMsg = "¡PÓKER! +60"; snd("victoria"); }
          else if (maxRep === 3) { ganados += 30; rachaCombos++; bonusMsg = "¡Trío! +30"; snd("moneda"); }
          else if (maxRep === 2) { ganados += 12; rachaCombos++; bonusMsg = "¡Pareja! +12"; snd("moneda"); }
          else { rachaCombos = 0; bonusMsg = `Suma: ${ganados}`; }
          if (rachaCombos >= 3) {
            const bonusRacha = rachaCombos * 10;
            ganados += bonusRacha;
            bonusMsg += ` · ¡Racha x${rachaCombos}! +${bonusRacha}`;
            snd("victoria");
          }
          racha = rachaCombos; eR.textContent = racha;
          estado.textContent = bonusMsg;
          puntos += ganados; eP.textContent = puntos;
          btn.disabled = false;
          if (tiradas >= 5) { activo = false; terminar(); }
        }
      }, 80);
      snd("blip");
    }
    function terminar() {
      const m = Math.max(1, Math.floor(puntos / 10));
      darPremio(m, Math.min(20, Math.floor(puntos / 20)), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Buen tiro!", emoji: ICONO.trofeoDiamante || "", subtitulo: "Puntos totales", num: puntos, extra: `+${m}`, onReiniciar: juegoDados });
    }
    btn.addEventListener("click", tirar);
  }

  // ============================================================
  // 2. CARTAS GIRATORIAS
  // ============================================================
  function juegoCartas() {
    const NUM = 16, ASES = 4;
    const o = crearOverlay("juego-cartas-overlay", `
      <h2 class="minijuego-titulo">Cartas giratorias</h2>
      <p class="minijuego-desc">Encuentra los 4 ases · Bonus si van seguidos</p>
      ${HUD([
        { id:"car-encontrados", label:"Ases", value:"0 / 4", icon:ICONO.carta || "" },
        { id:"car-tiempo", label:"Tiempo", value:"35s", icon:ICONO.reloj || "", cls:"jm-hud-time" },
        { id:"car-combo", label:"Combo", value:"x0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="car-grid" id="car-grid"></div>
    `);
    o.classList.add("active");
    const grid = $("car-grid"), eE = $("car-encontrados"), eT = $("car-tiempo"), eC = $("car-combo");
    const posiciones = new Set(shuffle([...Array(NUM).keys()]).slice(0, ASES));
    let encontrados = 0, t = 35, activo = true, combo = 0;

    for (let i = 0; i < NUM; i++) {
      const c = document.createElement("button");
      c.type = "button"; c.className = "car-carta";
      c.innerHTML = `<span class="car-interior"><span class="car-atras">${ICONO.carta || ""}</span><span class="car-frente">${posiciones.has(i) ? (ICONO.trofeo || "") : (ICONO.corazon || "")}</span></span>`;
      c.addEventListener("click", () => {
        if (!activo || c.classList.contains("volteada")) return;
        c.classList.add("volteada");
        if (posiciones.has(i)) {
          combo++;
          const bonus = combo >= 2 ? combo * 5 : 0;
          encontrados++; eE.textContent = `${encontrados} / 4`;
          eC.textContent = `x${combo}`;
          snd(bonus > 0 ? "victoria" : "moneda");
          c.classList.add("es-asa");
          if (encontrados === 4) terminar(true);
        } else {
          combo = 0; eC.textContent = "x0";
          snd("derrota");
          setTimeout(() => c.classList.remove("volteada"), 700);
        }
      });
      grid.appendChild(c);
    }
    function terminar(gano) {
      activo = false;
      const m = gano ? 50 + t + combo * 5 : Math.max(1, encontrados * 5);
      darPremio(m, gano ? 25 : 5, gano ? `¡Encontraste los 4 ases! +${m}` : `${encontrados}/4 ases +${m}`);
      finalizar(o, { titulo: gano ? "¡Encontraste todos!" : "¡Se acabó!", emoji: ICONO.carta || "", subtitulo: "Ases encontrados", num: `${encontrados} / 4`, extra: `+${m}`, onReiniciar: juegoCartas });
    }
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { clearInterval(tk); if (activo) terminar(false); } }, 1000);
  }

  // ============================================================
  // 3. LUZ Y SOMBRA
  // ============================================================
  function juegoSiluetas() {
    const o = crearOverlay("juego-siluetas-overlay", `
      <h2 class="minijuego-titulo">Luz y sombra</h2>
      <p class="minijuego-desc">¿Qué mascota proyecta esta silueta? ¡Rápido!</p>
      ${HUD([
        { id:"sil-ronda", label:"Ronda", value:"1 / 12", icon:ICONO.estrellaDoble || "" },
        { id:"sil-aciertos", label:"Aciertos", value:"0", icon:ICONO.trofeo || "" },
        { id:"sil-tiempo", label:"Tiempo", value:"5s", icon:ICONO.cronometro || "", cls:"jm-hud-time" }
      ])}
      <div class="sil-escena"><div class="sil-sombra" id="sil-sombra"></div></div>
      <div class="sil-opciones" id="sil-opciones"></div>
    `);
    o.classList.add("active");
    const sombra = $("sil-sombra"), op = $("sil-opciones"), eR = $("sil-ronda"), eA = $("sil-aciertos"), eT = $("sil-tiempo");
    const M = MASCOTAS();
    const ids = Object.keys(M);
    let ronda = 1, aciertos = 0, correcta = null, bloqueado = false, t = 5, tk = null;
    const TOTAL = 12;

    function nuevaRonda() {
      if (ronda > TOTAL) return terminar();
      eR.textContent = `${ronda} / ${TOTAL}`;
      correcta = randomDe(ids);
      sombra.style.backgroundImage = `url(${M[correcta].imagen})`;
      sombra.classList.add("visible");
      const distractores = shuffle(ids.filter(i => i !== correcta)).slice(0, 3);
      const ops = shuffle([...distractores, correcta]);
      op.innerHTML = "";
      ops.forEach(id => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "sil-opcion"; b.dataset.id = id;
        b.innerHTML = `<img src="${M[id].imagen}" alt="${M[id].nombre}"><span>${M[id].nombre}</span>`;
        b.addEventListener("click", () => elegir(b, id));
        op.appendChild(b);
      });
      bloqueado = false;
      clearInterval(tk); t = 5; eT.textContent = "5s"; eT.classList.remove("urgente");
      tk = setInterval(() => {
        if (bloqueado) return;
        t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 2);
        if (t <= 0) { clearInterval(tk); elegir(null, null); }
      }, 1000);
    }
    function elegir(b, id) {
      if (bloqueado) return;
      bloqueado = true; clearInterval(tk);
      if (id === correcta) {
        if (b) b.classList.add("correcta");
        aciertos++; eA.textContent = aciertos; snd("moneda");
      } else {
        if (b) b.classList.add("incorrecta");
        qsa(".sil-opcion", op).forEach(x => { if (x.dataset.id === correcta) x.classList.add("correcta"); });
        snd("derrota");
      }
      setTimeout(() => { ronda++; nuevaRonda(); }, 900);
    }
    function terminar() {
      const m = aciertos * 5;
      darPremio(m, Math.min(20, aciertos * 2), `¡${aciertos}/${TOTAL} aciertos! +${m}`);
      finalizar(o, { titulo: aciertos >= 10 ? "¡Ojo de halcón!" : aciertos >= 6 ? "¡Buen ojo!" : "¡Sigue así!", emoji: ICONO.rayoDoble || "", subtitulo: "Aciertos", num: `${aciertos} / ${TOTAL}`, extra: `+${m}`, onReiniciar: juegoSiluetas });
    }
    nuevaRonda();
  }

  // ============================================================
  // 4. PESCA EN EL LAGO
  // ============================================================
  function juegoPesca() {
    const o = crearOverlay("juego-pesca-overlay", `
      <h2 class="minijuego-titulo">Pesca en el lago</h2>
      <p class="minijuego-desc">Atrapa peces · Dorados x3 · Combo x5 = ¡bonus!</p>
      ${HUD([
        { id:"pes-puntos", label:"Peces", value:"0", icon:ICONO.pez || "" },
        { id:"pes-combo", label:"Combo", value:"x0", icon:ICONO.fuego || "", cls:"ja-hud-racha" },
        { id:"pes-tiempo", label:"Tiempo", value:"45s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="pes-lago" id="pes-lago"><div class="pes-agua"></div></div>
    `);
    o.classList.add("active");
    const lago = $("pes-lago"), eP = $("pes-puntos"), eC = $("pes-combo"), eT = $("pes-tiempo");
    let puntos = 0, combo = 0, t = 45, activo = true, ultimoComboT = 0;

    function spawn() {
      if (!activo) return;
      const r = lago.getBoundingClientRect();
      const roll = Math.random();
      const tipo = roll < 0.12 ? "estrella" : roll < 0.3 ? "dorado" : "normal";
      const pez = document.createElement("button");
      pez.type = "button"; pez.className = "pes-pez";
      if (tipo !== "normal") pez.classList.add("dorado");
      pez.dataset.tipo = tipo;
      pez.innerHTML = tipo === "estrella" ? (ICONO.estrellaDoble || "") : tipo === "dorado" ? (ICONO.trofeoDiamante || "") : (ICONO.pez || "");
      pez.style.left = rnd(20, r.width - 80) + "px";
      pez.style.top = (r.height - 30) + "px";
      lago.appendChild(pez);
      const dur = rnd(1800, 3500);
      const ini = performance.now();
      loopAnim(() => {
        if (!pez.parentNode || !activo) return false;
        const p = (performance.now() - ini) / dur;
        if (p >= 1) { pez.remove(); return false; }
        pez.style.top = ((r.height - 30) * (1 - p)) + "px";
        return true;
      });
      pez.addEventListener("click", () => {
        if (!activo || !pez.parentNode) return;
        const pts = tipo === "estrella" ? 10 : tipo === "dorado" ? 5 : 1;
        const ahora = Date.now();
        combo = (ahora - ultimoComboT < 1200) ? combo + 1 : 1;
        ultimoComboT = ahora;
        const bonus = combo >= 5 ? Math.floor(combo / 5) * 2 : 0;
        puntos += pts + bonus;
        eP.textContent = puntos;
        eC.textContent = `x${combo}`;
        popPuntos(lago, parseFloat(pez.style.left) + 20, parseFloat(pez.style.top), `+${pts + bonus}`, tipo === "estrella" ? "#ff7a9c" : "#ffd93d");
        snd(tipo === "normal" ? "atrapado" : "victoria");
        pez.remove();
      });
      setTimeout(spawn, rnd(400, 800));
    }
    setTimeout(spawn, 400);
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      const m = Math.max(1, puntos * 2);
      darPremio(m, Math.min(20, puntos), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Buena pesca!", emoji: ICONO.pez || "", subtitulo: "Puntos totales", num: puntos, extra: `+${m}`, onReiniciar: juegoPesca });
    }
  }

  // ============================================================
  // 5. MARIPOSAS
  // ============================================================
  function juegoMariposas() {
    const o = crearOverlay("juego-mariposas-overlay", `
      <h2 class="minijuego-titulo">Mariposas del jardín</h2>
      <p class="minijuego-desc">Toca doradas · Esquiva oscuras · Combo = multiplicador</p>
      ${HUD([
        { id:"mar-puntos", label:"Puntos", value:"0", icon:ICONO.mariposa || "" },
        { id:"mar-combo", label:"Combo", value:"x1", icon:ICONO.fuego || "", cls:"ja-hud-racha" },
        { id:"mar-tiempo", label:"Tiempo", value:"40s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="mar-jardin" id="mar-jardin"></div>
    `);
    o.classList.add("active");
    const jardin = $("mar-jardin"), eP = $("mar-puntos"), eC = $("mar-combo"), eT = $("mar-tiempo");
    let puntos = 0, combo = 1, t = 40, activo = true;

    function spawn() {
      if (!activo) return;
      const r = jardin.getBoundingClientRect();
      const m = document.createElement("button");
      m.type = "button"; m.className = "mar-mariposa";
      const oscura = Math.random() < 0.3;
      if (oscura) m.classList.add("oscura");
      m.innerHTML = ICONO.mariposa || "";
      m.style.left = rnd(20, r.width - 70) + "px";
      m.style.top = rnd(20, r.height - 70) + "px";
      jardin.appendChild(m);
      const dur = rnd(2000, 3400);
      setTimeout(() => m.parentNode && m.remove(), dur);
      m.addEventListener("click", () => {
        if (!activo || !m.parentNode) return;
        const px = parseFloat(m.style.left), py = parseFloat(m.style.top);
        if (oscura) {
          combo = 1; eC.textContent = "x1"; snd("derrota");
          puntos = Math.max(0, puntos - 3); eP.textContent = puntos;
          popPuntos(jardin, px, py, "-3", "#ff5470");
          m.classList.add("mala");
        } else {
          const pts = combo;
          puntos += pts; eP.textContent = puntos;
          combo = Math.min(8, combo + 1); eC.textContent = `x${combo}`;
          popPuntos(jardin, px, py, `+${pts}`, "#ffd93d");
          snd("moneda"); m.classList.add("buena");
        }
        setTimeout(() => m.remove(), 300);
      });
      setTimeout(spawn, Math.max(280, 750 - puntos * 4));
    }
    setTimeout(spawn, 400);
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      const m = Math.max(1, Math.floor(puntos / 2));
      darPremio(m, Math.min(20, Math.floor(puntos / 3)), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Vuelo perfecto!", emoji: ICONO.mariposa || "", subtitulo: "Puntos", num: puntos, extra: `+${m}`, onReiniciar: juegoMariposas });
    }
  }

  // ============================================================
  // 6. POCIÓN MÁGICA
  // ============================================================
  function juegoPocion() {
    const RECETAS = [
      { nombre: "Poción de amor", color: "#ff5470", pasos: ["pocionAmor", "corazon", "pocionAmor", "corazon"] },
      { nombre: "Elixir dorado", color: "#ffd93d", pasos: ["girasol", "pocion", "girasol", "pocion"] },
      { nombre: "Tónico estelar", color: "#6cb8ff", pasos: ["estrella", "pocion", "estrella", "luna"] },
      { nombre: "Brebaje de fuego", color: "#ff6b35", pasos: ["fuego", "pocion", "fuego", "fuego"] },
      { nombre: "Filtro lunar", color: "#a684f0", pasos: ["luna", "pocion", "luna", "estrella"] }
    ];
    const o = crearOverlay("juego-pocion-overlay", `
      <h2 class="minijuego-titulo">Poción mágica</h2>
      <p class="minijuego-desc">Sigue la receta en orden · ¡Los ingredientes brillan si toca!</p>
      ${HUD([
        { id:"poc-ronda", label:"Ronda", value:"1 / 6", icon:ICONO.pocion || "" },
        { id:"poc-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"poc-racha", label:"Racha", value:"0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="poc-receta" id="poc-receta"></div>
      <div class="poc-caldero"><div class="poc-liquido" id="poc-liquido"></div></div>
      <div class="poc-ingredientes" id="poc-ingredientes"></div>
      <div class="simon-estado" id="poc-estado">Sigue la receta</div>
    `);
    o.classList.add("active");
    const recetaEl = $("poc-receta"), liquido = $("poc-liquido"), ingEl = $("poc-ingredientes"), estado = $("poc-estado");
    const eR = $("poc-ronda"), eV = $("poc-vidas"), eRa = $("poc-racha");
    const TODOS_ING = ["girasol", "corazon", "estrella", "fuego", "luna", "pocion"];
    let ronda = 1, vidas = 3, receta = null, pasoActual = 0, activo = true, racha = 0;

    function nuevaRonda() {
      if (ronda > 6) return terminar(true);
      eR.textContent = `${ronda} / 6`;
      receta = randomDe(RECETAS);
      pasoActual = 0;
      liquido.style.background = receta.color;
      liquido.style.height = "15%";
      estado.textContent = `Prepara: ${receta.nombre}`;
      recetaEl.innerHTML = receta.pasos.map((p, i) => `<div class="poc-paso" data-i="${i}"><span class="poc-paso-ico">${ICONO[p]||""}</span></div>`).join("");
      ingEl.innerHTML = "";
      shuffle(TODOS_ING).forEach(id => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "poc-ing"; b.dataset.id = id;
        b.innerHTML = ICONO[id] || "";
        b.addEventListener("click", () => elegir(b, id));
        ingEl.appendChild(b);
      });
      marcarSiguiente();
      activo = true;
    }
    function marcarSiguiente() {
      qsa(".poc-ing", ingEl).forEach(b => b.classList.remove("brilla"));
      const esperado = receta.pasos[pasoActual];
      const btn = qsa(".poc-ing", ingEl).find(b => b.dataset.id === esperado);
      if (btn) btn.classList.add("brilla");
    }
    function elegir(b, id) {
      if (!activo) return;
      const esperado = receta.pasos[pasoActual];
      if (id === esperado) {
        qsa(".poc-paso", recetaEl)[pasoActual].classList.add("hecho");
        pasoActual++;
        liquido.style.height = (15 + pasoActual * 20) + "%";
        snd("blip");
        if (pasoActual >= receta.pasos.length) {
          activo = false; racha++; eRa.textContent = racha;
          snd("victoria"); estado.textContent = "¡Poción lista!";
          setTimeout(() => { ronda++; nuevaRonda(); }, 900);
        } else {
          marcarSiguiente();
        }
      } else {
        activo = false;
        vidas--; eV.textContent = vidas; racha = 0; eRa.textContent = 0;
        snd("derrota");
        b.classList.add("mal");
        liquido.classList.add("explota");
        estado.textContent = "¡Explotó el caldero!";
        setTimeout(() => {
          liquido.classList.remove("explota");
          if (vidas <= 0) terminar(false);
          else nuevaRonda();
        }, 1000);
      }
    }
    function terminar(gano) {
      activo = false;
      const m = gano ? 60 : Math.max(1, (ronda - 1) * 10);
      darPremio(m, gano ? 25 : 5, gano ? `¡6 pociones perfectas! +${m}` : `${ronda - 1}/6 pociones +${m}`);
      finalizar(o, { titulo: gano ? "¡Alquimista!" : "¡Caldero roto!", emoji: ICONO.pocion || "", subtitulo: "Pociones completadas", num: `${ronda - 1} / 6`, extra: `+${m}`, onReiniciar: juegoPocion });
    }
    nuevaRonda();
  }

  // ============================================================
  // 7. PINGÜINO RESBALADIZO
  // ============================================================
  function juegoPinguino() {
    const o = crearOverlay("juego-pinguino-overlay", `
      <h2 class="minijuego-titulo">Pingüino resbaladizo</h2>
      <p class="minijuego-desc">Esquiva bloques con ← → · Recoge monedas</p>
      ${HUD([
        { id:"pin-dist", label:"Distancia", value:"0 m", icon:ICONO.montaña || "" },
        { id:"pin-monedas", label:"Monedas", value:"0", icon:ICONO.moneda || "" },
        { id:"pin-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" }
      ])}
      <div class="pin-pista" id="pin-pista">
        <div class="pin-pinguino" id="pin-pinguino">${ICONO.hamburguesa || ""}</div>
      </div>
      <div class="pin-controles">
        <button type="button" class="pin-btn" data-dir="-1">${ICONO.flechaIzq || "◀"}</button>
        <button type="button" class="pin-btn" data-dir="1">${ICONO.flechaDer || "▶"}</button>
      </div>
    `);
    o.classList.add("active");
    const pista = $("pin-pista"), pingu = $("pin-pinguino"), eD = $("pin-dist"), eM = $("pin-monedas"), eV = $("pin-vidas");
    let carril = 1, dist = 0, monedas = 0, vidas = 3, activo = true;
    const CARRILES = 3;
    let obstaculos = [], monedasArr = [];

    function setCarril() {
      const r = pista.getBoundingClientRect();
      const ancho = r.width / CARRILES;
      pingu.style.left = (carril * ancho + ancho / 2 - 20) + "px";
    }
    function mover(dir) {
      if (!activo) return;
      carril = clamp(carril + dir, 0, CARRILES - 1);
      setCarril(); snd("blip");
    }
    qsa(".pin-btn", o).forEach(b => b.addEventListener("click", () => mover(Number(b.dataset.dir))));
    onKeyOnce(o, e => {
      if (!activo) return;
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); mover(-1); }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); mover(1); }
    });

    function spawnObs() {
      if (!activo) return;
      const r = pista.getBoundingClientRect();
      const ancho = r.width / CARRILES;
      const c = rndInt(0, CARRILES - 1);
      const obs = document.createElement("div");
      obs.className = "pin-obs"; obs.innerHTML = ICONO.cubo || "";
      obs.style.left = (c * ancho + ancho / 2 - 20) + "px";
      obs.style.top = "-50px";
      pista.appendChild(obs);
      obstaculos.push({ el: obs, carril: c, y: -50 });
      setTimeout(spawnObs, Math.max(380, 1100 - dist / 25));
    }
    function spawnMoneda() {
      if (!activo) return;
      const r = pista.getBoundingClientRect();
      const ancho = r.width / CARRILES;
      const c = rndInt(0, CARRILES - 1);
      const m = document.createElement("div");
      m.className = "pin-obs pin-moneda"; m.innerHTML = ICONO.moneda || "";
      m.style.left = (c * ancho + ancho / 2 - 20) + "px";
      m.style.top = "-50px";
      pista.appendChild(m);
      monedasArr.push({ el: m, carril: c, y: -50 });
      setTimeout(spawnMoneda, rnd(600, 1500));
    }
    function gameLoop() {
      if (!activo) return;
      obstaculos.forEach(ob => {
        ob.y += 6 + dist / 350;
        ob.el.style.top = ob.y + "px";
        if (!ob.chequeado && ob.y > pista.offsetHeight - 55 && ob.y < pista.offsetHeight - 45) {
          if (ob.carril === carril) {
            ob.chequeado = true; vidas--; eV.textContent = vidas; snd("derrota");
            pingu.classList.add("golpe");
            setTimeout(() => pingu.classList.remove("golpe"), 300);
            if (vidas <= 0) { terminar(); return; }
          }
        }
        if (ob.y > pista.offsetHeight) { ob.el.remove(); ob.dead = true; }
      });
      obstaculos = obstaculos.filter(o => !o.dead);
      monedasArr.forEach(m => {
        m.y += 6 + dist / 350;
        m.el.style.top = m.y + "px";
        if (!m.cogida && m.y > pista.offsetHeight - 55 && m.y < pista.offsetHeight - 45) {
          if (m.carril === carril) {
            m.cogida = true; monedas++; eM.textContent = monedas; snd("moneda");
            m.el.remove(); m.dead = true;
          }
        }
        if (m.y > pista.offsetHeight) { m.el.remove(); m.dead = true; }
      });
      monedasArr = monedasArr.filter(m => !m.dead);
      dist += 1; eD.textContent = dist + " m";
      requestAnimationFrame(gameLoop);
    }
    function terminar() {
      activo = false;
      const m = Math.max(1, Math.floor(dist / 10) + monedas * 2);
      darPremio(m, Math.min(20, Math.floor(dist / 20) + monedas), `¡${dist}m y ${monedas} monedas! +${m}`);
      finalizar(o, { titulo: "¡Buen viaje!", emoji: ICONO.montaña || "", subtitulo: "Distancia", num: dist + " m", extra: `+${m}`, onReiniciar: juegoPinguino });
    }
    setCarril();
    setTimeout(spawnObs, 500);
    setTimeout(spawnMoneda, 1000);
    requestAnimationFrame(gameLoop);
  }

  // ============================================================
  // 8. CASTILLO DE NAIPES
  // ============================================================
  function juegoCastillo() {
    const o = crearOverlay("juego-castillo-overlay", `
      <h2 class="minijuego-titulo">Castillo de naipes</h2>
      <p class="minijuego-desc">Apila en la columna que brilla · ¡Cada vez va más rápido!</p>
      ${HUD([
        { id:"cas-altura", label:"Altura", value:"0", icon:ICONO.castillo || "" },
        { id:"cas-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"cas-racha", label:"Racha", value:"0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="cas-torre" id="cas-torre"></div>
      <div class="cas-botones" id="cas-botones">
        ${[0,1,2].map(i => `<button type="button" class="cas-btn" data-col="${i}">${ICONO.carta || ""}</button>`).join("")}
      </div>
      <div class="simon-estado" id="cas-estado">Coloca la carta en la columna que brilla</div>
    `);
    o.classList.add("active");
    const torre = $("cas-torre"), estado = $("cas-estado"), eA = $("cas-altura"), eV = $("cas-vidas"), eR = $("cas-racha");
    let altura = 0, vidas = 3, colObjetivo = 0, activo = true, racha = 0;
    const columnas = [[], [], []];

    function renderTorre() {
      torre.innerHTML = "";
      columnas.forEach(col => {
        const c = document.createElement("div"); c.className = "cas-col";
        col.forEach(() => { const carta = document.createElement("div"); carta.className = "cas-carta-col"; carta.innerHTML = ICONO.carta || ""; c.appendChild(carta); });
        torre.appendChild(c);
      });
    }
    function nuevaJugada() {
      if (!activo) return;
      colObjetivo = rndInt(0, 2);
      estado.textContent = `Columna ${colObjetivo + 1}`;
      qsa(".cas-btn", o).forEach((b, i) => b.classList.toggle("objetivo", i === colObjetivo));
      const vel = Math.max(320, 1100 - altura * 35);
      clearTimeout(window._casTO);
      window._casTO = setTimeout(() => {
        if (activo) { vidas--; racha = 0; eR.textContent = 0; eV.textContent = vidas; snd("derrota"); if (vidas <= 0) terminar(); else nuevaJugada(); }
      }, vel);
    }
    qsa(".cas-btn", o).forEach(b => b.addEventListener("click", () => {
      if (!activo) return;
      clearTimeout(window._casTO);
      const c = Number(b.dataset.col);
      if (c === colObjetivo) {
        columnas[c].push(1); altura++; racha++;
        eA.textContent = altura; eR.textContent = racha;
        snd(racha >= 5 ? "victoria" : "moneda");
        renderTorre();
        if (altura >= 20) return terminar();
        nuevaJugada();
      } else {
        vidas--; racha = 0; eR.textContent = 0; eV.textContent = vidas; snd("derrota");
        if (vidas <= 0) terminar(); else nuevaJugada();
      }
    }));
    function terminar() {
      activo = false; clearTimeout(window._casTO);
      const m = Math.max(1, altura * 3 + racha * 5);
      darPremio(m, Math.min(20, altura), `¡Torre de ${altura}! +${m}`);
      finalizar(o, { titulo: altura >= 20 ? "¡Maestro constructor!" : altura >= 12 ? "¡Buena torre!" : "¡Sigue intentando!", emoji: ICONO.castillo || "", subtitulo: "Altura alcanzada", num: altura, extra: `+${m}`, onReiniciar: juegoCastillo });
    }
    renderTorre(); nuevaJugada();
  }

  // ============================================================
  // 9. LABERINTO DE HOJAS
  // ============================================================
  function juegoLaberinto() {
    const N = 9;
    const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ n:true, s:true, e:true, w:true, visited:false })));
    const stack = [[0, 0]]; grid[0][0].visited = true;
    while (stack.length) {
      const [f, c] = stack[stack.length - 1];
      const vecinos = [];
      if (f > 0 && !grid[f-1][c].visited) vecinos.push([-1, 0, "n", "s"]);
      if (f < N-1 && !grid[f+1][c].visited) vecinos.push([1, 0, "s", "n"]);
      if (c > 0 && !grid[f][c-1].visited) vecinos.push([0, -1, "w", "e"]);
      if (c < N-1 && !grid[f][c+1].visited) vecinos.push([0, 1, "e", "w"]);
      if (vecinos.length === 0) { stack.pop(); continue; }
      const [df, dc, dir, op] = randomDe(vecinos);
      grid[f][c][dir] = false; grid[f+df][c+dc][op] = false; grid[f+df][c+dc].visited = true;
      stack.push([f+df, c+dc]);
    }
    const monedas = new Set();
    for (let i = 0; i < 5; i++) {
      const f = rndInt(0, N-1), c = rndInt(0, N-1);
      if (f === 0 && c === 0) continue;
      if (f === N-1 && c === N-1) continue;
      monedas.add(`${f},${c}`);
    }
    const o = crearOverlay("juego-laberinto-overlay", `
      <h2 class="minijuego-titulo">Laberinto de hojas</h2>
      <p class="minijuego-desc">Llega a la salida · Recoge las 5 monedas secretas</p>
      ${HUD([
        { id:"lab-pasos", label:"Pasos", value:"0", icon:ICONO.huella || "" },
        { id:"lab-monedas", label:"Monedas", value:"0 / 5", icon:ICONO.moneda || "" },
        { id:"lab-tiempo", label:"Tiempo", value:"60s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="lab-grid" id="lab-grid"></div>
      <div class="lab-controles">
        <button type="button" class="lab-btn" data-dir="n">↑</button>
        <div class="lab-fila"><button type="button" class="lab-btn" data-dir="w">←</button><button type="button" class="lab-btn" data-dir="s">↓</button><button type="button" class="lab-btn" data-dir="e">→</button></div>
      </div>
    `);
    o.classList.add("active");
    const gridEl = $("lab-grid"), eP = $("lab-pasos"), eM = $("lab-monedas"), eT = $("lab-tiempo");
    let pos = { f: 0, c: 0 }, pasos = 0, cogidas = 0, t = 60, activo = true;
    const visitadas = new Set(["0,0"]);

    function render() {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
      grid.forEach((fila, f) => fila.forEach((cell, c) => {
        const d = document.createElement("div");
        d.className = "lab-celda";
        if (cell.n) d.classList.add("pared-n");
        if (cell.s) d.classList.add("pared-s");
        if (cell.e) d.classList.add("pared-e");
        if (cell.w) d.classList.add("pared-w");
        const key = `${f},${c}`;
        if (f === pos.f && c === pos.c) { d.classList.add("jugador"); d.innerHTML = ICONO.hoja || ICONO.girasol || ""; }
        else if (f === N-1 && c === N-1) { d.classList.add("meta"); d.innerHTML = ICONO.trofeo || ""; }
        else if (monedas.has(key) && !visitadas.has(key)) d.innerHTML = ICONO.moneda || "";
        gridEl.appendChild(d);
      }));
    }
    function mover(dir) {
      if (!activo) return;
      const cell = grid[pos.f][pos.c];
      if (cell[dir]) return;
      const delta = { n:[-1,0], s:[1,0], e:[0,1], w:[0,-1] }[dir];
      pos.f += delta[0]; pos.c += delta[1]; pasos++; eP.textContent = pasos;
      const key = `${pos.f},${pos.c}`;
      if (monedas.has(key) && !visitadas.has(key)) {
        visitadas.add(key); cogidas++; eM.textContent = `${cogidas} / 5`;
        snd("moneda");
      }
      snd("blip"); render();
      if (pos.f === N-1 && pos.c === N-1) terminar();
    }
    qsa(".lab-btn", o).forEach(b => b.addEventListener("click", () => mover(b.dataset.dir)));
    onKeyOnce(o, e => {
      if (!activo) return;
      const map = { ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e", w: "n", s: "s", a: "w", d: "e" };
      if (map[e.key]) { e.preventDefault(); mover(map[e.key]); }
    });
    function terminar() {
      activo = false;
      const bonusMon = cogidas * 8;
      const m = Math.max(5, 80 - pasos + t + bonusMon);
      darPremio(m, 20, `¡Salida en ${pasos} pasos y ${cogidas} monedas! +${m}`);
      finalizar(o, { titulo: "¡Encontraste la salida!", emoji: ICONO.bosque || "", subtitulo: "Pasos", num: pasos, extra: `+${m}`, onReiniciar: juegoLaberinto });
    }
    render();
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { clearInterval(tk); if (activo) { activo = false; darPremio(1, 0, "¡Tiempo agotado!"); finalizar(o, { titulo: "¡Se acabó!", emoji: ICONO.reloj || "", subtitulo: "No llegaste a la meta", num: `${pasos} pasos`, extra: "+1", onReiniciar: juegoLaberinto }); } } }, 1000);
  }

  // ============================================================
  // 10. COFRE DEL TESORO
  // ============================================================
  function juegoCofre() {
    const o = crearOverlay("juego-cofre-overlay", `
      <h2 class="minijuego-titulo">Cofre del tesoro</h2>
      <p class="minijuego-desc">Uno tiene tesoro, otro trampa. ¡Lee la pista!</p>
      ${HUD([
        { id:"cof-ronda", label:"Ronda", value:"1 / 8", icon:ICONO.cofre || "" },
        { id:"cof-tesoros", label:"Tesoros", value:"0", icon:ICONO.llaveDorada || "" },
        { id:"cof-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" }
      ])}
      <div class="cof-pista" id="cof-pista"></div>
      <div class="cof-fila" id="cof-fila"></div>
    `);
    o.classList.add("active");
    const pista = $("cof-pista"), fila = $("cof-fila"), eR = $("cof-ronda"), eT = $("cof-tesoros"), eV = $("cof-vidas");
    const TOTAL = 8; let ronda = 1, tesoros = 0, vidas = 3, activo = true;

    function nuevaRonda() {
      if (ronda > TOTAL) return terminar();
      eR.textContent = `${ronda} / ${TOTAL}`;
      const n = 4;
      const correcto = rndInt(0, n-1);
      const trampa = (correcto + 1 + rndInt(0, n-2)) % n;
      const pistas = [
        `El tesoro está en el cofre ${correcto + 1}`,
        correcto % 2 === 0 ? "El tesoro está en un cofre par" : "El tesoro está en un cofre impar",
        `El tesoro NO está en el cofre ${trampa + 1}`,
        correcto === 0 ? "El tesoro está en el primero" : correcto === n-1 ? "El tesoro está en el último" : `El tesoro está en el ${correcto + 1}º`,
        `El cofre ${trampa + 1} tiene una trampa, evítalo`
      ];
      pista.textContent = `"${randomDe(pistas)}"`;
      fila.innerHTML = "";
      for (let i = 0; i < n; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "cof-cofre"; b.dataset.i = i;
        b.innerHTML = ICONO.cofre || "";
        b.addEventListener("click", () => elegir(b, i, correcto, trampa));
        fila.appendChild(b);
      }
      activo = true;
    }
    function elegir(b, i, correcto, trampa) {
      if (!activo) return;
      activo = false;
      if (i === correcto) {
        b.classList.add("abierto"); b.innerHTML = ICONO.llaveDorada || "";
        tesoros++; eT.textContent = tesoros; snd("victoria");
      } else if (i === trampa) {
        b.classList.add("trampa"); b.innerHTML = ICONO.bomba || "";
        vidas--; eV.textContent = vidas; snd("derrota");
      } else {
        b.classList.add("vacio");
        qsa(".cof-cofre", fila)[correcto].classList.add("abierto");
        qsa(".cof-cofre", fila)[correcto].innerHTML = ICONO.llaveDorada || "";
        snd("derrota");
      }
      setTimeout(() => {
        if (vidas <= 0) return terminar(true);
        ronda++; nuevaRonda();
      }, 900);
    }
    function terminar(muerte = false) {
      const m = tesoros * 10;
      darPremio(m, Math.min(20, tesoros * 3), `¡${tesoros}/${TOTAL} tesoros! +${m}`);
      finalizar(o, { titulo: muerte ? "¡Trampa!" : tesoros >= 6 ? "¡Gran pirata!" : "¡Buen intento!", emoji: ICONO.cofre || "", subtitulo: "Tesoros encontrados", num: `${tesoros} / ${TOTAL}`, extra: `+${m}`, onReiniciar: juegoCofre });
    }
    nuevaRonda();
  }

  // ============================================================
  // 11. ARCOIRIS
  // ============================================================
  function juegoArcoiris() {
    const COLORES = [
      { id: "rojo", color: "#ff5470" }, { id: "naranja", color: "#ff9f43" },
      { id: "amarillo", color: "#ffd93d" }, { id: "verde", color: "#4dd48e" },
      { id: "azul", color: "#6cb8ff" }, { id: "morado", color: "#a684f0" }
    ];
    const o = crearOverlay("juego-arcoiris-overlay", `
      <h2 class="minijuego-titulo">Arcoíris</h2>
      <p class="minijuego-desc">Coloca los colores en el orden que marca la barra</p>
      ${HUD([
        { id:"arc-ronda", label:"Ronda", value:"1 / 5", icon:ICONO.arcoiris || "" },
        { id:"arc-tiempo", label:"Tiempo", value:"50s", icon:ICONO.reloj || "", cls:"jm-hud-time" },
        { id:"arc-perfectas", label:"Perfectas", value:"0", icon:ICONO.trofeo || "" }
      ])}
      <div class="arc-objetivo" id="arc-objetivo"></div>
      <div class="arc-opciones" id="arc-opciones"></div>
      <div class="simon-estado" id="arc-estado">Pulsa los colores en orden</div>
    `);
    o.classList.add("active");
    const objetivoEl = $("arc-objetivo"), opcionesEl = $("arc-opciones"), estado = $("arc-estado");
    const eR = $("arc-ronda"), eT = $("arc-tiempo"), ePerf = $("arc-perfectas");
    let ronda = 1, t = 50, activo = true, orden = [], paso = 0, erroresRonda = 0, perfectas = 0;

    function nuevaRonda() {
      if (ronda > 5) return terminar(true);
      eR.textContent = `${ronda} / 5`;
      orden = shuffle(COLORES);
      paso = 0; erroresRonda = 0;
      objetivoEl.innerHTML = orden.map((c, i) => `<div class="arc-hueco" data-i="${i}"><span>${i+1}</span></div>`).join("");
      opcionesEl.innerHTML = "";
      shuffle(COLORES).forEach(c => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "arc-btn";
        b.style.background = c.color; b.dataset.id = c.id;
        b.addEventListener("click", () => elegir(b, c));
        opcionesEl.appendChild(b);
      });
      estado.textContent = "Pulsa el color " + (paso + 1);
      activo = true;
    }
    function elegir(b, c) {
      if (!activo) return;
      if (c.id === orden[paso].id) {
        const hueco = qsa(".arc-hueco", objetivoEl)[paso];
        hueco.style.background = c.color; hueco.classList.add("lleno");
        b.disabled = true; b.classList.add("usado");
        paso++; snd("blip");
        if (paso >= COLORES.length) {
          activo = false; snd("victoria");
          if (erroresRonda === 0) { perfectas++; ePerf.textContent = perfectas; }
          setTimeout(() => { ronda++; nuevaRonda(); }, 800);
        } else estado.textContent = "Pulsa el color " + (paso + 1);
      } else {
        erroresRonda++;
        snd("derrota"); b.classList.add("mal");
        setTimeout(() => b.classList.remove("mal"), 500);
      }
    }
    function terminar(gano) {
      activo = false;
      const m = gano ? 40 + t + perfectas * 15 : Math.max(1, (ronda - 1) * 8);
      darPremio(m, gano ? 20 : 5, gano ? `¡5 arcoíris completos! +${m}` : `${ronda-1}/5 +${m}`);
      finalizar(o, { titulo: gano ? "¡Maestro del color!" : "¡Se acabó!", emoji: ICONO.arcoiris || "", subtitulo: "Arcoíris completos", num: `${ronda - 1} / 5`, extra: `+${m}`, onReiniciar: juegoArcoiris });
    }
    nuevaRonda();
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { clearInterval(tk); if (activo) terminar(false); } }, 1000);
  }

  // ============================================================
  // 12. GOTAS DE LLUVIA
  // ============================================================
  function juegoGotas() {
    const o = crearOverlay("juego-gotas-overlay", `
      <h2 class="minijuego-titulo">Gotas de lluvia</h2>
      <p class="minijuego-desc">Recoge gotas · Doradas x3 · ¡No dejes caer 3 seguidas!</p>
      ${HUD([
        { id:"got-puntos", label:"Gotas", value:"0", icon:ICONO.gota || "" },
        { id:"got-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"got-combo", label:"Combo", value:"x1", icon:ICONO.fuego || "", cls:"ja-hud-racha" },
        { id:"got-tiempo", label:"Tiempo", value:"45s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="got-cielo" id="got-cielo">
        <div class="got-cubo" id="got-cubo">${ICONO.cubo || ""}</div>
      </div>
    `);
    o.classList.add("active");
    const cielo = $("got-cielo"), cubo = $("got-cubo"), eP = $("got-puntos"), eV = $("got-vidas"), eC = $("got-combo"), eT = $("got-tiempo");
    let puntos = 0, vidas = 3, activo = true, cuboX = 0, fallos = 0, combo = 1, t = 45;

    function mover(x) {
      const r = cielo.getBoundingClientRect();
      cuboX = clamp(x - r.left - 30, 0, r.width - 60);
      cubo.style.left = cuboX + "px";
    }
    cielo.addEventListener("mousemove", e => mover(e.clientX));
    cielo.addEventListener("touchmove", e => { e.preventDefault(); mover(e.touches[0].clientX); }, { passive: false });

    function spawn() {
      if (!activo) return;
      const r = cielo.getBoundingClientRect();
      const dorada = Math.random() < 0.18;
      const g = document.createElement("div");
      g.className = "got-gota" + (dorada ? " dorada" : "");
      g.innerHTML = ICONO.gota || "";
      g.style.left = rnd(0, r.width - 30) + "px";
      g.style.top = "-40px";
      cielo.appendChild(g);
      const ini = performance.now();
      const dur = rnd(2400, 3800);
      let recogida = false;
      loopAnim(() => {
        if (!g.parentNode || !activo) return false;
        const p = (performance.now() - ini) / dur;
        if (p >= 1) {
          g.remove();
          if (!recogida && !dorada) {
            fallos++;
            combo = 1; eC.textContent = "x1";
            if (fallos % 3 === 0) {
              vidas--; eV.textContent = vidas; snd("derrota");
              if (vidas <= 0) { terminar(); return false; }
            }
          }
          return false;
        }
        g.style.top = (p * (r.height + 40) - 40) + "px";
        const gx = parseFloat(g.style.left);
        if (!recogida && Math.abs(gx - cuboX) < 40 && p > 0.82) {
          const pts = dorada ? 3 * combo : combo;
          puntos += pts; eP.textContent = puntos;
          combo = Math.min(5, combo + 1); eC.textContent = `x${combo}`;
          popPuntos(cielo, gx, parseFloat(g.style.top), `+${pts}`, dorada ? "#ff7a9c" : "#6cb8ff");
          snd(dorada ? "victoria" : "moneda");
          recogida = true; g.remove(); return false;
        }
        return true;
      });
      setTimeout(spawn, Math.max(280, 700 - puntos * 4));
    }
    setTimeout(spawn, 500);

    const tk = setInterval(() => {
      if (!activo) { clearInterval(tk); return; }
      t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10);
      if (t <= 0) { clearInterval(tk); terminar(); }
    }, 1000);

    function terminar() {
      if (!activo) return;
      activo = false; clearInterval(tk);
      const m = Math.max(1, puntos * 2);
      darPremio(m, Math.min(20, puntos), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Buen chaparrón!", emoji: ICONO.gota || "", subtitulo: "Puntos", num: puntos, extra: `+${m}`, onReiniciar: juegoGotas });
    }
  }

  // ============================================================
  // 13. CRISTALES DE HIELO
  // ============================================================
  function juegoCristales() {
    const o = crearOverlay("juego-cristales-overlay", `
      <h2 class="minijuego-titulo">Cristales de hielo</h2>
      <p class="minijuego-desc">Rompe solo los que brillan · No falles</p>
      ${HUD([
        { id:"cri-puntos", label:"Puntos", value:"0", icon:ICONO.copo || "" },
        { id:"cri-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"cri-tiempo", label:"Tiempo", value:"40s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="cri-grid" id="cri-grid"></div>
    `);
    o.classList.add("active");
    const grid = $("cri-grid"), eP = $("cri-puntos"), eV = $("cri-vidas"), eT = $("cri-tiempo");
    let puntos = 0, vidas = 3, t = 40, activo = true;
    const N = 16;
    for (let i = 0; i < N; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "cri-celda"; b.dataset.i = i;
      b.innerHTML = ICONO.copo || "";
      b.addEventListener("click", () => {
        if (!activo) return;
        if (b.classList.contains("brilla")) {
          puntos += 2; eP.textContent = puntos; snd("moneda");
          b.classList.remove("brilla"); b.classList.add("roto");
          setTimeout(() => b.classList.remove("roto"), 1500);
        } else {
          vidas--; eV.textContent = vidas; snd("derrota");
          puntos = Math.max(0, puntos - 1); eP.textContent = puntos;
          b.classList.add("mal");
          setTimeout(() => b.classList.remove("mal"), 300);
          if (vidas <= 0) terminar();
        }
      });
      grid.appendChild(b);
    }
    function brillar() {
      if (!activo) return;
      qsa(".cri-celda.brilla", grid).forEach(c => c.classList.remove("brilla"));
      const disponibles = qsa(".cri-celda:not(.roto)", grid);
      const n = Math.min(disponibles.length, 2 + Math.floor(puntos / 8));
      for (let i = 0; i < n; i++) {
        const c = randomDe(disponibles);
        if (c) {
          c.classList.add("brilla");
          const timeout = Math.max(380, 1100 - puntos * 15);
          setTimeout(() => c.classList.remove("brilla"), timeout);
        }
      }
      setTimeout(brillar, Math.max(450, 1100 - puntos * 12));
    }
    brillar();
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      activo = false;
      const m = Math.max(1, puntos);
      darPremio(m, Math.min(20, Math.floor(puntos / 2)), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Cristales rotos!", emoji: ICONO.copo || "", subtitulo: "Puntos", num: puntos, extra: `+${m}`, onReiniciar: juegoCristales });
    }
  }

  // ============================================================
  // 14. VUELO DE LA ABEJA
  // ============================================================
  function juegoAbeja() {
    const o = crearOverlay("juego-abeja-overlay", `
      <h2 class="minijuego-titulo">Vuelo de la abeja</h2>
      <p class="minijuego-desc">Toca flores · Miel dorada x5 · ¡Cuidado con las avispas!</p>
      ${HUD([
        { id:"abe-polinizadas", label:"Flores", value:"0", icon:ICONO.abeja || "" },
        { id:"abe-miel", label:"Miel", value:"0", icon:ICONO.trofeoDiamante || "" },
        { id:"abe-tiempo", label:"Tiempo", value:"40s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="abe-prado" id="abe-prado">
        <div class="abe-abeja" id="abe-abeja">${ICONO.abeja || ""}</div>
      </div>
    `);
    o.classList.add("active");
    const prado = $("abe-prado"), abeja = $("abe-abeja"), eP = $("abe-polinizadas"), eM = $("abe-miel"), eT = $("abe-tiempo");
    let puntos = 0, miel = 0, t = 40, activo = true;

    function spawnFlor() {
      if (!activo) return;
      const r = prado.getBoundingClientRect();
      const roll = Math.random();
      const tipo = roll < 0.15 ? "miel" : roll < 0.35 ? "avispa" : "normal";
      const f = document.createElement("button");
      f.type = "button"; f.className = "abe-flor";
      if (tipo === "miel") f.classList.add("miel");
      if (tipo === "avispa") f.classList.add("avispa");
      f.innerHTML = tipo === "avispa" ? (ICONO.abeja || "") : (ICONO.girasol || "");
      if (tipo === "avispa") f.style.color = "#3d3226";
      f.style.left = rnd(20, r.width - 70) + "px";
      f.style.top = rnd(20, r.height - 100) + "px";
      prado.appendChild(f);
      const dur = rnd(2000, 3200);
      setTimeout(() => f.parentNode && f.remove(), dur);
      f.addEventListener("click", () => {
        if (!activo || !f.parentNode) return;
        abeja.style.left = (parseFloat(f.style.left) + 30) + "px";
        abeja.style.top = (parseFloat(f.style.top) + 30) + "px";
        const px = parseFloat(f.style.left), py = parseFloat(f.style.top);
        if (tipo === "miel") {
          puntos += 5; miel++; eM.textContent = miel;
          popPuntos(prado, px, py, "+5 MIEL", "#ffd93d");
          snd("victoria");
        } else if (tipo === "avispa") {
          puntos = Math.max(0, puntos - 3);
          popPuntos(prado, px, py, "-3", "#ff5470");
          snd("derrota");
        } else {
          puntos += 1;
          popPuntos(prado, px, py, "+1", "#4dd48e");
          snd("moneda");
        }
        eP.textContent = puntos;
        f.classList.add("polinizada");
        setTimeout(() => f.remove(), 300);
      });
      setTimeout(spawnFlor, Math.max(350, 1000 - puntos * 8));
    }
    setTimeout(spawnFlor, 500);
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      const m = Math.max(1, puntos * 2);
      darPremio(m, Math.min(20, puntos), `¡${puntos} puntos y ${miel} miel! +${m}`);
      finalizar(o, { titulo: "¡Dulce como la miel!", emoji: ICONO.abeja || "", subtitulo: "Puntos", num: puntos, extra: `+${m}`, onReiniciar: juegoAbeja });
    }
  }

  // ============================================================
  // 15. CARRERA DE CARACOLES
  // ============================================================
  function juegoCaracoles() {
    const o = crearOverlay("juego-caracoles-overlay", `
      <h2 class="minijuego-titulo">Carrera de caracoles</h2>
      <p class="minijuego-desc">Elige tu caracol · ¡Los demás pueden adelantarte!</p>
      ${HUD([
        { id:"car-carreras", label:"Carreras", value:"0 / 6", icon:ICONO.caracol || "" },
        { id:"car-ganadas", label:"Ganadas", value:"0", icon:ICONO.trofeo || "" }
      ])}
      <div class="car-pista" id="car-pista"></div>
      <div class="car-eleccion" id="car-eleccion"></div>
    `);
    o.classList.add("active");
    const pista = $("car-pista"), eleccion = $("car-eleccion"), eC = $("car-carreras"), eG = $("car-ganadas");
    const NUM = 4;
    let carreras = 0, ganadas = 0, activo = true;
    const caracoles = [];

    function nuevaCarrera() {
      if (carreras >= 6) return terminar();
      eC.textContent = `${carreras + 1} / 6`;
      pista.innerHTML = ""; eleccion.innerHTML = "";
      caracoles.length = 0;
      for (let i = 0; i < NUM; i++) {
        const c = document.createElement("div");
        c.className = "car-caracol"; c.dataset.i = i;
        c.innerHTML = `<span class="car-ico">${ICONO.caracol || ""}</span>`;
        c.style.top = (i * 50 + 20) + "px";
        c.style.left = "0px";
        pista.appendChild(c);
        caracoles.push({ el: c, x: 0, i, boost: 0 });
      }
      for (let i = 0; i < NUM; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "car-elegir"; b.dataset.i = i;
        b.textContent = "Caracol " + (i + 1);
        b.addEventListener("click", () => iniciarCarrera(i));
        eleccion.appendChild(b);
      }
      activo = false;
    }
    function iniciarCarrera(elegido) {
      activo = true;
      eleccion.innerHTML = "";
      caracoles.forEach(c => { c.x = 0; c.boost = 0; });
      const intervalo = setInterval(() => {
        if (!activo) { clearInterval(intervalo); return; }
        caracoles.forEach(c => {
          c.x += Math.random() * 3.5 + c.boost;
          if (Math.random() < 0.02) { c.boost = 1.5; setTimeout(() => c.boost = 0, 500); }
          c.el.style.left = c.x + "px";
        });
        const ganador = caracoles.find(c => c.x >= pista.offsetWidth - 60);
        if (ganador) {
          clearInterval(intervalo); activo = false; carreras++;
          if (ganador.i === elegido) { ganadas++; eG.textContent = ganadas; snd("victoria"); }
          else snd("derrota");
          ganador.el.classList.add("ganador");
          setTimeout(() => { nuevaCarrera(); }, 1200);
        }
      }, 60);
    }
    function terminar() {
      activo = false;
      const m = ganadas * 12;
      darPremio(m, Math.min(20, ganadas * 4), `¡${ganadas}/6 carreras ganadas! +${m}`);
      finalizar(o, { titulo: ganadas >= 4 ? "¡Buen olfato!" : "¡Sigue intentando!", emoji: ICONO.caracol || "", subtitulo: "Carreras ganadas", num: `${ganadas} / 6`, extra: `+${m}`, onReiniciar: juegoCaracoles });
    }
    nuevaCarrera();
  }

  // ============================================================
  // 16. NUBES Y SOL
  // ============================================================
  function juegoNubes() {
    const o = crearOverlay("juego-nubes-overlay", `
      <h2 class="minijuego-titulo">Nubes y sol</h2>
      <p class="minijuego-desc">Toca nubes · Esquiva soles · Nubes doradas x3</p>
      ${HUD([
        { id:"nub-puntos", label:"Puntos", value:"0", icon:ICONO.nube || "" },
        { id:"nub-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"nub-tiempo", label:"Tiempo", value:"40s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="nub-cielo" id="nub-cielo"></div>
    `);
    o.classList.add("active");
    const cielo = $("nub-cielo"), eP = $("nub-puntos"), eV = $("nub-vidas"), eT = $("nub-tiempo");
    let puntos = 0, vidas = 3, activo = true, t = 40;

    function spawn() {
      if (!activo) return;
      const r = cielo.getBoundingClientRect();
      const roll = Math.random();
      const tipo = roll < 0.2 ? "sol" : roll < 0.35 ? "dorada" : "nube";
      const el = document.createElement("button");
      el.type = "button"; el.className = "nub-item";
      if (tipo === "sol") el.classList.add("sol");
      if (tipo === "dorada") el.classList.add("dorada");
      el.innerHTML = tipo === "sol" ? (ICONO.sol || "") : (ICONO.nube || "");
      el.style.top = rnd(20, r.height - 90) + "px";
      el.style.left = "-80px";
      cielo.appendChild(el);
      const ini = performance.now();
      const dur = rnd(3000, 5000);
      loopAnim(() => {
        if (!el.parentNode || !activo) return false;
        const p = (performance.now() - ini) / dur;
        if (p >= 1) { el.remove(); return false; }
        el.style.left = (p * (r.width + 80) - 80) + "px";
        return true;
      });
      el.addEventListener("click", () => {
        if (!activo || !el.parentNode) return;
        const px = parseFloat(el.style.left), py = parseFloat(el.style.top);
        if (tipo === "sol") {
          vidas--; eV.textContent = vidas; snd("derrota");
          popPuntos(cielo, px, py, "-1 vida", "#ff5470");
          el.classList.add("mal");
          if (vidas <= 0) terminar();
        } else {
          const pts = tipo === "dorada" ? 3 : 1;
          puntos += pts; eP.textContent = puntos;
          popPuntos(cielo, px, py, `+${pts}`, tipo === "dorada" ? "#ffd93d" : "#fff");
          snd("moneda");
          el.classList.add("bien");
        }
        setTimeout(() => el.remove(), 300);
      });
      setTimeout(spawn, Math.max(300, 700 - puntos * 5));
    }
    setTimeout(spawn, 400);
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      activo = false;
      const m = Math.max(1, puntos * 2);
      darPremio(m, Math.min(20, puntos), `¡${puntos} puntos! +${m}`);
      finalizar(o, { titulo: "¡Cielo despejado!", emoji: ICONO.nube || "", subtitulo: "Puntos", num: puntos, extra: `+${m}`, onReiniciar: juegoNubes });
    }
  }

  // ============================================================
  // 17. GLOBO AEROSTÁTICO
  // ============================================================
  function juegoGlobo() {
    const o = crearOverlay("juego-globo-overlay", `
      <h2 class="minijuego-titulo">Globo aerostático</h2>
      <p class="minijuego-desc">Sube esquivando pájaros · ¡Cuidado con el viento!</p>
      ${HUD([
        { id:"glo-altura", label:"Altura", value:"0 m", icon:ICONO.globo || "" },
        { id:"glo-vidas", label:"Vidas", value:"3", icon:ICONO.corazon || "", cls:"ja-hud-vidas" },
        { id:"glo-viento", label:"Viento", value:"—", icon:ICONO.rayo || "" }
      ])}
      <div class="glo-cielo" id="glo-cielo">
        <div class="glo-globo" id="glo-globo">${ICONO.globo || ""}</div>
      </div>
      <div class="glo-controles">
        <button type="button" class="glo-btn" data-dir="-1">◀</button>
        <button type="button" class="glo-btn" data-dir="1">▶</button>
      </div>
    `);
    o.classList.add("active");
    const cielo = $("glo-cielo"), globo = $("glo-globo"), eA = $("glo-altura"), eV = $("glo-vidas"), eW = $("glo-viento");
    let x = 50, altura = 0, vidas = 3, activo = true, viento = 0;
    const pajaros = [];

    function mover(dir) {
      if (!activo) return;
      x = clamp(x + dir * 8, 5, 95);
      globo.style.left = x + "%"; globo.style.transform = "translateX(-50%)";
      snd("blip");
    }
    qsa(".glo-btn", o).forEach(b => b.addEventListener("click", () => mover(Number(b.dataset.dir))));
    onKeyOnce(o, e => {
      if (!activo) return;
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); mover(-1); }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); mover(1); }
    });

    function spawnPajaro() {
      if (!activo) return;
      const p = document.createElement("div");
      p.className = "glo-pajaro"; p.innerHTML = ICONO.pajaro || "";
      p.style.left = rnd(5, 90) + "%";
      p.style.top = "-50px";
      cielo.appendChild(p);
      pajaros.push({ el: p, y: -50 });
      setTimeout(spawnPajaro, Math.max(350, 1000 - altura / 20));
    }
    function cambiarViento() {
      if (!activo) return;
      viento = rndInt(-2, 2);
      eW.textContent = viento === 0 ? "—" : (viento > 0 ? `→ x${Math.abs(viento)}` : `← x${Math.abs(viento)}`);
      setTimeout(cambiarViento, rnd(3000, 6000));
    }
    function gameLoop() {
      if (!activo) return;
      if (viento !== 0) {
        x = clamp(x + viento * 0.15, 5, 95);
        globo.style.left = x + "%";
      }
      pajaros.forEach(p => {
        p.y += 5 + altura / 200;
        p.el.style.top = p.y + "px";
        const rect = p.el.getBoundingClientRect();
        const grect = globo.getBoundingClientRect();
        if (!p.chequeado && rect.bottom > grect.top && rect.top < grect.bottom && rect.right > grect.left && rect.left < grect.right) {
          p.chequeado = true; vidas--; eV.textContent = vidas; snd("derrota");
          globo.classList.add("golpe");
          setTimeout(() => globo.classList.remove("golpe"), 300);
          if (vidas <= 0) { terminar(); return; }
        }
        if (p.y > cielo.offsetHeight) { p.el.remove(); p.dead = true; }
      });
      pajaros = pajaros.filter(p => !p.dead);
      altura += 1; eA.textContent = altura + " m";
      requestAnimationFrame(gameLoop);
    }
    function terminar() {
      activo = false;
      const m = Math.max(1, Math.floor(altura / 8));
      darPremio(m, Math.min(20, Math.floor(altura / 15)), `¡${altura}m de altura! +${m}`);
      finalizar(o, { titulo: "¡Buen vuelo!", emoji: ICONO.globo || "", subtitulo: "Altura máxima", num: altura + " m", extra: `+${m}`, onReiniciar: juegoGlobo });
    }
    setTimeout(spawnPajaro, 500);
    setTimeout(cambiarViento, 3000);
    requestAnimationFrame(gameLoop);
  }

  // ============================================================
  // 18. MOLINO DE VIENTO
  // ============================================================
  function juegoMolino() {
    const o = crearOverlay("juego-molino-overlay", `
      <h2 class="minijuego-titulo">Molino de viento</h2>
      <p class="minijuego-desc">Pulsa cuando el aspa apunte al color correcto</p>
      ${HUD([
        { id:"mol-aciertos", label:"Aciertos", value:"0", icon:ICONO.diana || "" },
        { id:"mol-ronda", label:"Ronda", value:"1 / 12", icon:ICONO.estrellaDoble || "" },
        { id:"mol-racha", label:"Racha", value:"0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="mol-escena">
        <div class="mol-molino"><div class="mol-aspa" id="mol-aspa"></div></div>
        <div class="mol-objetivo" id="mol-objetivo">Objetivo: N</div>
      </div>
      <button type="button" class="btn-primary" id="mol-btn" style="width:100%;">¡AHORA!</button>
    `);
    o.classList.add("active");
    const aspa = $("mol-aspa"), objetivoEl = $("mol-objetivo"), btn = $("mol-btn");
    const eA = $("mol-aciertos"), eR = $("mol-ronda"), eRa = $("mol-racha");
    const DIRS = ["N", "E", "S", "W"];
    let angulo = 0, objetivo = "N", ronda = 1, aciertos = 0, activo = true, racha = 0, velocidad = 4;
    const TOTAL = 12;

    function nuevaRonda() {
      if (ronda > TOTAL) return terminar();
      eR.textContent = `${ronda} / ${TOTAL}`;
      objetivo = randomDe(DIRS);
      objetivoEl.textContent = "Objetivo: " + objetivo;
    }
    function loop() {
      if (!activo) return;
      angulo = (angulo + velocidad) % 360;
      aspa.style.transform = `rotate(${angulo}deg)`;
      requestAnimationFrame(loop);
    }
    btn.addEventListener("click", () => {
      if (!activo) return;
      const dirActual = DIRS[Math.round(angulo / 90) % 4];
      if (dirActual === objetivo) {
        aciertos++; racha++;
        eA.textContent = aciertos; eRa.textContent = racha;
        snd(racha >= 3 ? "victoria" : "moneda");
        btn.classList.add("acierto");
        if (racha >= 3 && racha % 3 === 0) setMonedas(getMonedas() + 5);
      } else {
        racha = 0; eRa.textContent = 0;
        snd("derrota"); btn.classList.add("fallo");
      }
      velocidad = Math.min(10, 4 + Math.floor(aciertos / 2));
      setTimeout(() => { btn.classList.remove("acierto", "fallo"); ronda++; nuevaRonda(); }, 400);
    });
    function terminar() {
      activo = false;
      const m = aciertos * 5 + racha * 3;
      darPremio(m, Math.min(20, aciertos * 2), `¡${aciertos}/${TOTAL} aciertos! +${m}`);
      finalizar(o, { titulo: aciertos >= 9 ? "¡Puntería perfecta!" : "¡Buen intento!", emoji: ICONO.diana || "", subtitulo: "Aciertos", num: `${aciertos} / ${TOTAL}`, extra: `+${m}`, onReiniciar: juegoMolino });
    }
    nuevaRonda(); loop();
  }

  // ============================================================
  // 19. FUENTE DE LOS DESEOS
  // ============================================================
  function juegoFuente() {
    const o = crearOverlay("juego-fuente-overlay", `
      <h2 class="minijuego-titulo">Fuente de los deseos</h2>
      <p class="minijuego-desc">Toca el centro · Se hace pequeño · ¡Rápido!</p>
      ${HUD([
        { id:"fue-deseos", label:"Deseos", value:"0", icon:ICONO.estrellaDoble || "" },
        { id:"fue-tiempo", label:"Tiempo", value:"35s", icon:ICONO.reloj || "", cls:"jm-hud-time" }
      ])}
      <div class="fue-fuente" id="fue-fuente">
        <div class="fue-centro" id="fue-centro"></div>
      </div>
    `);
    o.classList.add("active");
    const fuente = $("fue-fuente"), centro = $("fue-centro"), eD = $("fue-deseos"), eT = $("fue-tiempo");
    let deseos = 0, t = 35, activo = true;

    function moverCentro() {
      const r = fuente.getBoundingClientRect();
      const offsetX = (Math.random() - 0.5) * (r.width * 0.7);
      const offsetY = (Math.random() - 0.5) * (r.height * 0.5);
      centro.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      const size = Math.max(35, 90 - deseos * 4);
      centro.style.width = size + "px";
      centro.style.height = size + "px";
    }
    centro.addEventListener("click", () => {
      if (!activo) return;
      deseos++; eD.textContent = deseos;
      snd("victoria");
      const px = centro.offsetLeft, py = centro.offsetTop;
      const splash = document.createElement("div");
      splash.className = "fue-salpicadura";
      splash.style.left = px + "px"; splash.style.top = py + "px";
      fuente.appendChild(splash);
      setTimeout(() => splash.remove(), 700);
      if (deseos > 5) {
        clearInterval(window._fueInt);
        window._fueInt = setInterval(() => { if (activo) moverCentro(); }, 800);
      }
      moverCentro();
    });
    moverCentro();
    const tk = setInterval(() => { t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 10); if (t <= 0) { activo = false; clearInterval(tk); terminar(); } }, 1000);
    function terminar() {
      activo = false; clearInterval(window._fueInt);
      const m = deseos * 4;
      darPremio(m, Math.min(20, deseos * 2), `¡${deseos} deseos pedidos! +${m}`);
      finalizar(o, { titulo: "¡Que se cumplan!", emoji: ICONO.estrellaDoble || "", subtitulo: "Deseos pedidos", num: deseos, extra: `+${m}`, onReiniciar: juegoFuente });
    }
  }

  // ============================================================
  // 20. BOSQUE ENCANTADO
  // ============================================================
  function juegoBosque() {
    const o = crearOverlay("juego-bosque-overlay", `
      <h2 class="minijuego-titulo">Bosque encantado</h2>
      <p class="minijuego-desc">Encuentra al duende · Se mueve cada vez más rápido</p>
      ${HUD([
        { id:"bos-ronda", label:"Ronda", value:"1 / 6", icon:ICONO.bosque || "" },
        { id:"bos-tiempo", label:"Tiempo", value:"8s", icon:ICONO.cronometro || "", cls:"jm-hud-time" },
        { id:"bos-racha", label:"Racha", value:"0", icon:ICONO.fuego || "", cls:"ja-hud-racha" }
      ])}
      <div class="bos-arboles" id="bos-arboles"></div>
      <div class="simon-estado" id="bos-estado">Busca al duende...</div>
    `);
    o.classList.add("active");
    const arboles = $("bos-arboles"), estado = $("bos-estado"), eR = $("bos-ronda"), eT = $("bos-tiempo"), eRa = $("bos-racha");
    const N = 6, TOTAL = 6;
    let ronda = 1, activo = true, posDuende = 0, t = 8, tk = null, racha = 0;

    function nuevaRonda() {
      if (ronda > TOTAL) return terminar(true);
      eR.textContent = `${ronda} / ${TOTAL}`;
      posDuende = rndInt(0, N - 1);
      t = 8; eT.textContent = "8s"; eT.classList.remove("urgente");
      arboles.innerHTML = "";
      for (let i = 0; i < N; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "bos-arbol"; b.dataset.i = i;
        b.innerHTML = ICONO.bosque || "";
        b.addEventListener("click", () => elegir(i));
        arboles.appendChild(b);
      }
      estado.textContent = "Busca al duende...";
      activo = true;
      clearInterval(tk);
      tk = setInterval(() => {
        if (!activo) return;
        t--; eT.textContent = t + "s"; eT.classList.toggle("urgente", t <= 3);
        const vel = Math.max(1, 4 - Math.floor(ronda / 2));
        if (t % vel === 0 && t > 0) posDuende = rndInt(0, N - 1);
        if (t <= 0) { clearInterval(tk); ronda++; nuevaRonda(); }
      }, 1000);
    }
    function elegir(i) {
      if (!activo) return;
      activo = false; clearInterval(tk);
      const b = qsa(".bos-arbol", arboles)[i];
      const duende = qsa(".bos-arbol", arboles)[posDuende];
      if (i === posDuende) {
        duende.classList.add("encontrado"); duende.innerHTML = ICONO.varita || "";
        estado.textContent = "¡Encontrado!";
        racha++; eRa.textContent = racha;
        snd("victoria");
        setTimeout(() => { ronda++; nuevaRonda(); }, 700);
      } else {
        b.classList.add("fallo");
        duende.classList.add("encontrado"); duende.innerHTML = ICONO.varita || "";
        estado.textContent = "¡Se escapó!";
        racha = 0; eRa.textContent = 0;
        snd("derrota");
        setTimeout(() => { ronda++; nuevaRonda(); }, 900);
      }
    }
    function terminar(gano) {
      const m = Math.max(1, (ronda - 1) * 8);
      darPremio(m, Math.min(20, (ronda - 1) * 3), `¡${ronda - 1}/${TOTAL} duendes! +${m}`);
      finalizar(o, { titulo: gano ? "¡Bosque explorado!" : "¡Se acabó!", emoji: ICONO.bosque || "", subtitulo: "Duendes encontrados", num: `${ronda - 1} / ${TOTAL}`, extra: `+${m}`, onReiniciar: juegoBosque });
    }
    nuevaRonda();
  }

  // ============================================================
  // 21. ADIVINA LA MASCOTA (con sprite oculto hasta responder)
  // ============================================================
  function juegoAdivina() {
    const pool = Object.keys(MASCOTAS()).filter(id => window._desbloqueada ? window._desbloqueada(id) : true);
    const pf = pool.length >= 4 ? pool : Object.keys(MASCOTAS());
    const TOTAL = 20, SEGUNDOS = 5, OPCIONES = 6;
    let r = 0, a = 0, cor = "", racha = 0;
    let timer = null, tiempoRonda = SEGUNDOS, bloqueado = false;
    let vidas = 2;
    const o = crearOverlay("juego-adivina-overlay", `
      <h2 class="minijuego-titulo">Adivina la mascota · Difícil</h2>
      <p class="minijuego-desc">¿Quién ha dicho esta frase? ¡Solo ${SEGUNDOS}s por ronda y ${vidas} vidas!</p>
      <div class="ja-hud">
        <div class="ja-hud-card"><span class="ja-hud-icon">${ICONO.estrella||""}</span><div class="ja-hud-info"><span class="ja-hud-label">Aciertos</span><strong id="ja-aciertos">0</strong></div></div>
        <div class="ja-hud-card"><span class="ja-hud-icon">${ICONO.nota||""}</span><div class="ja-hud-info"><span class="ja-hud-label">Ronda</span><strong><span id="ja-ronda">1</span> / ${TOTAL}</strong></div></div>
        <div class="ja-hud-card ja-hud-racha"><span class="ja-hud-icon">${ICONO.fuego||""}</span><div class="ja-hud-info"><span class="ja-hud-label">Racha</span><strong id="ja-racha">0</strong></div></div>
        <div class="ja-hud-card ja-hud-vidas"><span class="ja-hud-icon">${ICONO.corazon||""}</span><div class="ja-hud-info"><span class="ja-hud-label">Vidas</span><strong id="ja-vidas">${vidas}</strong></div></div>
        <div class="ja-hud-card ja-hud-time2"><span class="ja-hud-icon">${ICONO.calendario||""}</span><div class="ja-hud-info"><span class="ja-hud-label">Tiempo</span><strong id="ja-tiempo">${SEGUNDOS}s</strong></div></div>
      </div>
      <div class="ja-progreso"><span id="ja-progreso-fill"></span></div>
      <div class="adivina-panel ja-panel">
        <div class="ja-burbuja"><div class="ja-burbuja-icono">${ICONO.chat||""}</div><p class="adivina-frase ja-frase" id="ja-frase">Cargando...</p></div>
        <div class="adivina-sprite-wrap ja-sprite-wrap ja-sprite-oculto" id="ja-sprite-wrap">
          <img class="adivina-sprite ja-sprite" id="ja-sprite" src="" alt="">
          <span class="ja-sprite-aura"></span>
          <span class="ja-sprite-interrogacion" id="ja-sprite-int">?</span>
        </div>
        <div class="adivina-opciones ja-opciones" id="ja-opciones"></div>
      </div>
    `);
    o.classList.add("active");
    const eA = $("ja-aciertos"), eR = $("ja-ronda"), eRa = $("ja-racha"), eT = $("ja-tiempo"), eV = $("ja-vidas");
    const barra = $("ja-progreso-fill"), sprite = $("ja-sprite"), spriteWrap = $("ja-sprite-wrap"), spriteInt = $("ja-sprite-int");
    const frase = $("ja-frase"), op = $("ja-opciones");
    const frasesGlobales = pf.flatMap(id => (FRASES()[id] || []).map(f => ({ id, frase: f })));
    let usadas = new Set();

    function nuevaFrase() {
      let intentos = 0, elegida;
      do { elegida = frasesGlobales[Math.floor(Math.random() * frasesGlobales.length)]; intentos++; }
      while (usadas.has(elegida.frase) && intentos < 50);
      usadas.add(elegida.frase);
      if (usadas.size > frasesGlobales.length - 5) usadas.clear();
      return elegida;
    }
    function mostrarSprite() {
      spriteWrap.classList.remove("ja-sprite-oculto");
      spriteWrap.classList.add("ja-sprite-revelado");
    }
    function iniciarTimer() {
      clearInterval(timer);
      tiempoRonda = SEGUNDOS;
      if (eT) { eT.textContent = tiempoRonda + "s"; eT.classList.remove("urgente"); }
      timer = setInterval(() => {
        tiempoRonda--;
        if (eT) { eT.textContent = tiempoRonda + "s"; eT.classList.toggle("urgente", tiempoRonda <= 2); }
        if (tiempoRonda <= 0) {
          clearInterval(timer);
          if (bloqueado) return;
          bloqueado = true;
          racha = 0; if (eRa) eRa.textContent = racha;
          vidas--; if (eV) eV.textContent = vidas;
          snd("derrota");
          mostrarSprite();
          [...op.children].forEach(x => { x.disabled = true; if (x.dataset.id === cor) x.classList.add("correcta"); });
          setTimeout(() => { if (vidas <= 0) return term(); nR(); }, 1600);
        }
      }, 1000);
    }
    const nR = () => {
      r++;
      if (r > TOTAL) return term();
      bloqueado = false;
      eR.textContent = r;
      barra.style.width = ((r - 1) / TOTAL * 100) + "%";
      const { id, frase: textoFrase } = nuevaFrase();
      cor = id;
      frase.textContent = `"${textoFrase}"`;
      sprite.style.display = "";
      sprite.src = MASCOTAS()[cor].imagen;
      sprite.onerror = () => { sprite.style.display = "none"; };
      spriteWrap.classList.remove("ja-sprite-revelado");
      spriteWrap.classList.add("ja-sprite-oculto");
      if (spriteInt) spriteInt.style.display = "";
      const distractores = pf.filter(x => x !== cor).sort(() => Math.random() - 0.5).slice(0, OPCIONES - 1);
      const ops = [...distractores, cor].sort(() => Math.random() - 0.5);
      op.innerHTML = "";
      ops.forEach((id2, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "adivina-opcion ja-opcion";
        b.dataset.id = id2;
        b.innerHTML = `<span class="ja-opcion-letra">${String.fromCharCode(65 + i)}</span><span class="ja-opcion-nombre">${MASCOTAS()[id2].nombre}</span>`;
        b.addEventListener("click", () => resp(b, id2));
        op.appendChild(b);
      });
      iniciarTimer();
    };
    const resp = (b, id) => {
      if (bloqueado) return;
      bloqueado = true;
      clearInterval(timer);
      mostrarSprite();
      if (id === cor) {
        b.classList.add("correcta");
        a++; eA.textContent = a;
        const bonus = tiempoRonda >= SEGUNDOS / 2 ? 3 : 1;
        racha += bonus; eRa.textContent = racha;
        snd("moneda");
      } else {
        b.classList.add("incorrecta");
        racha = 0; eRa.textContent = racha;
        vidas--; if (eV) eV.textContent = vidas;
        snd("derrota");
        [...op.children].forEach(x => { if (x.dataset.id === cor) x.classList.add("correcta"); });
      }
      [...op.children].forEach(x => x.disabled = true);
      setTimeout(() => { if (vidas <= 0) return term(); nR(); }, 1400);
    };
    const term = () => {
      clearInterval(timer);
      const m = a * 3 + Math.floor(racha / 3);
      darPremio(m, Math.min(20, a * 2), `¡${a}/${TOTAL} aciertos! +${m}`);
      const p = qs(".minijuego-panel", o), rr = document.createElement("div");
      rr.className = "minijuego-mensaje ja-final";
      const nivel = a >= 17 ? "¡Perfecto!" : a >= 13 ? "¡Excelente!" : a >= 8 ? "¡Bien!" : "¡Sigue así!";
      rr.innerHTML = `<div class="jg-final-emoji">${a>=17?(ICONO.trofeo||""):a>=13?(ICONO.estrella||""):a>=8?(ICONO.corazon||""):(ICONO.girasol||"")}</div><h2>${nivel}</h2><p>Acertaste</p><span class="minijuego-mensaje-num">${a} / ${TOTAL}</span><p style="color:#ffd93d;font-weight:bold;">+${m}</p><div class="minijuego-botones"><button type="button" class="btn-primary" id="ja-otra">Otra vez</button></div>`;
      p.appendChild(rr);
      qs("#ja-otra", rr).addEventListener("click", () => { o.remove(); juegoAdivina(); });
    };
    nR();
  }

  // ============================================================
  // REGISTRO
  // ============================================================
  const JUEGOS = [
    { id:"dados", nombre:"Dados locos", fn:juegoDados, icon:ICONO.dado },
    { id:"cartas", nombre:"Cartas giratorias", fn:juegoCartas, icon:ICONO.carta },
    { id:"siluetas", nombre:"Luz y sombra", fn:juegoSiluetas, icon:ICONO.rayoDoble },
    { id:"pesca", nombre:"Pesca en el lago", fn:juegoPesca, icon:ICONO.pez },
    { id:"mariposas", nombre:"Mariposas del jardín", fn:juegoMariposas, icon:ICONO.mariposa },
    { id:"pocion", nombre:"Poción mágica", fn:juegoPocion, icon:ICONO.pocion },
    { id:"pinguino", nombre:"Pingüino resbaladizo", fn:juegoPinguino, icon:ICONO.montaña },
    { id:"castillo", nombre:"Castillo de naipes", fn:juegoCastillo, icon:ICONO.castillo },
    { id:"laberinto", nombre:"Laberinto de hojas", fn:juegoLaberinto, icon:ICONO.bosque },
    { id:"cofre", nombre:"Cofre del tesoro", fn:juegoCofre, icon:ICONO.cofre },
    { id:"arcoiris", nombre:"Arcoíris", fn:juegoArcoiris, icon:ICONO.arcoiris },
    { id:"gotas", nombre:"Gotas de lluvia", fn:juegoGotas, icon:ICONO.gota },
    { id:"cristales", nombre:"Cristales de hielo", fn:juegoCristales, icon:ICONO.copo },
    { id:"abeja", nombre:"Vuelo de la abeja", fn:juegoAbeja, icon:ICONO.abeja },
    { id:"caracoles", nombre:"Carrera de caracoles", fn:juegoCaracoles, icon:ICONO.caracol },
    { id:"nubes", nombre:"Nubes y sol", fn:juegoNubes, icon:ICONO.nube },
    { id:"globo", nombre:"Globo aerostático", fn:juegoGlobo, icon:ICONO.globo },
    { id:"molino", nombre:"Molino de viento", fn:juegoMolino, icon:ICONO.diana },
    { id:"fuente", nombre:"Fuente de los deseos", fn:juegoFuente, icon:ICONO.estrellaDoble },
    { id:"bosque", nombre:"Bosque encantado", fn:juegoBosque, icon:ICONO.bosque },
    { id:"adivina", nombre:"Adivina la mascota", fn:juegoAdivina, icon:ICONO.globo }
  ];
  window.JUEGOS_EXTRA = JUEGOS;
  window.abrirJuegoExtra = (id) => { const j = JUEGOS.find(x => x.id === id); if (j) j.fn(); };

  function inyectarBotones() {
    const menu = qs(".minijuegos-menu");
    if (!menu || menu.dataset.extras === "1") return;
    menu.dataset.extras = "1";
    JUEGOS.forEach(j => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn-minijuego"; b.dataset.juegoExtra = j.id;
      b.innerHTML = `<span class="btn-minijuego-icon">${j.icon || ""}</span><span class="btn-minijuego-text">${j.nombre}</span>`;
      b.addEventListener("click", () => j.fn());
      menu.appendChild(b);
    });
  }
  setTimeout(inyectarBotones, 800);
  window.addEventListener("hashchange", () => setTimeout(inyectarBotones, 300));
  window.JUEGO_FNS = Object.fromEntries(JUEGOS.map(j => [j.id, j.fn]));

  console.log("✅ juegos.js cargado —", JUEGOS.length, "juegos únicos");
});