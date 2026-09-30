/* ============================================================
   RPG-ROGUELIKE.JS v2 — Modo Roguelike HARDCORE
   · 10 pisos · 6 columnas · Enemigos con especiales
   · Jefes con 2 fases · Maldiciones persistentes
   · Cooldowns de habilidades · Nodos evento
   · Meta-progresión con desbloqueos permanentes
   ============================================================ */
(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n = 0; const it = () => { if (window._TiendaAPI) return boot(); if (++n > 60) return; setTimeout(it, 100); }; return setTimeout(it, 100); }
  const { ICONO, getUserId } = API;
  const $   = id => document.getElementById(String(id).replace(/^#/, ''));
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (n, a = 0, b = 1e9) => Math.max(a, Math.min(b, n));
  const SND = t => { try { window._snd?.(t); } catch {} };
  const MASCOTAS = window._MASCOTAS || {};
  const confirmar = (o) => window.SunModal ? window.SunModal.confirm(o) : Promise.resolve(confirm(o.message || o.title));

  /* ============================================================
     CONSTANTES
     ============================================================ */
  const PISOS_MAX = 10;
  const COLS_POR_PISO = 6;

  const TIPOS = {
    combat:  { ico:'⚔️',  nombre:'Combate',  color:'#ff7a9c' },
    elite:   { ico:'💀',  nombre:'Élite',    color:'#a684f0' },
    treasure:{ ico:'💎',  nombre:'Tesoro',   color:'#6cb8ff' },
    shop:    { ico:'🛒',  nombre:'Tienda',   color:'#ffd93d' },
    rest:    { ico:'🔥',  nombre:'Descanso', color:'#4dd48e' },
    event:   { ico:'❓',  nombre:'Evento',   color:'#ff9a3d' },
    boss:    { ico:'👑',  nombre:'Jefe',     color:'#ffae3d' }
  };

  /* Enemigos con estadísticas base escaladas y especiales */
  const ENEMIGOS_RL = {
    comun: [
      { id:'slime',      nombre:'Slime Ácido',    hp:28, atk:7,  xp:10, ico:'🟢', special:'poison' },
      { id:'rata',       nombre:'Rata Pútrida',   hp:22, atk:9,  xp:9,  ico:'🐀', special:'multihit' },
      { id:'murcielago', nombre:'Murciélago',     hp:20, atk:10, xp:11, ico:'🦇', special:'drain' },
      { id:'esqueleto',  nombre:'Esqueleto',      hp:32, atk:8,  xp:12, ico:'💀', special:'buff' },
      { id:'sapo',       nombre:'Sapo Tóxico',    hp:38, atk:7,  xp:13, ico:'🐸', special:'poison' },
      { id:'hongo',      nombre:'Hongo Esporero', hp:30, atk:9,  xp:11, ico:'🍄', special:'debuff' },
      { id:'bandido',    nombre:'Bandido',        hp:34, atk:10, xp:14, ico:'🗡️', special:'multihit' },
      { id:'lobo',       nombre:'Lobo Salvaje',   hp:26, atk:12, xp:13, ico:'🐺', special:'multihit' }
    ],
    elite: [
      { id:'golem',      nombre:'Golem de Piedra', hp:85, atk:15, xp:42, ico:'🗿', special:'shield' },
      { id:'quimera',    nombre:'Quimera',         hp:72, atk:18, xp:45, ico:'🦁', special:'multihit' },
      { id:'nigromante', nombre:'Nigromante',      hp:66, atk:20, xp:48, ico:'🧙', special:'heal' },
      { id:'troll',      nombre:'Troll',           hp:98, atk:14, xp:50, ico:'🧌', special:'buff' },
      { id:'vampiro',    nombre:'Vampiro Lord',    hp:70, atk:19, xp:52, ico:'🧛', special:'drain' },
      { id:'hechicero',  nombre:'Hechicero Arcano',hp:58, atk:22, xp:55, ico:'🔮', special:'debuff' }
    ],
    jefe: [
      { id:'dragon',  nombre:'Dragón Ancestral',  hp:200, atk:24, xp:150, ico:'🐉', special:'firebreath' },
      { id:'lich',    nombre:'Lich Supremo',      hp:180, atk:26, xp:155, ico:'☠️', special:'summon' },
      { id:'kraken',  nombre:'Kraken Primigenio', hp:230, atk:22, xp:160, ico:'🦑', special:'multihit' },
      { id:'titan',   nombre:'Titán de Hierro',   hp:270, atk:20, xp:170, ico:'⚡', special:'shield' },
      { id:'senor',   nombre:'Señor del Abismo',  hp:290, atk:28, xp:180, ico:'👿', special:'curse' },
      { id:'dios',    nombre:'Dios Antiguo',      hp:320, atk:30, xp:200, ico:'👁️', special:'apocalypse' }
    ]
  };

  /* Reliquias más escasas y poderosas */
  const RELIQUIAS = [
    { id:'r-atk',    nombre:'Filo Ardiente',     desc:'+6 ATK',                ico:'⚔️', rar:'comun',      aplicar:s=>s.atk+=6 },
    { id:'r-def',    nombre:'Égida de Hierro',   desc:'+4 DEF',                ico:'🛡️', rar:'comun',      aplicar:s=>s.def+=4 },
    { id:'r-hp',     nombre:'Corazón de Roble',  desc:'+35 HP máximo',         ico:'❤️', rar:'raro',       aplicar:s=>{s.hpMax+=35;s.hp+=35;} },
    { id:'r-crit',   nombre:'Ojo de Halcón',     desc:'+18% crítico',          ico:'🎯', rar:'raro',       aplicar:s=>s.crit+=0.18 },
    { id:'r-vamp',   nombre:'Colmillo Vampírico',desc:'+20% robo de vida',     ico:'🦷', rar:'epico',      aplicar:s=>s.lifesteal+=0.20 },
    { id:'r-thorn',  nombre:'Corona de Espinas', desc:'Reflejas 5 de daño',    ico:'👑', rar:'epico',      aplicar:s=>s.thorns+=5 },
    { id:'r-potion', nombre:'Alquimista',        desc:'+2 pociones iniciales', ico:'🧪', rar:'raro',       aplicar:s=>{s.pocionesInicio+=2;s.pociones+=2;} },
    { id:'r-luck',   nombre:'Trébol de 4 hojas', desc:'+40% oro',              ico:'🍀', rar:'raro',       aplicar:s=>s.oroMult+=0.40 },
    { id:'r-swift',  nombre:'Botas Ligeras',     desc:'+22% prob. esquivar',   ico:'👢', rar:'epico',      aplicar:s=>s.evasion+=0.22 },
    { id:'r-fury',   nombre:'Ira del Berserker', desc:'+60% daño si HP < 30%', ico:'🔥', rar:'legendario', aplicar:s=>s.furia=true },
    { id:'r-soul',   nombre:'Alma Errante',      desc:'Revives 1 vez con 50% HP', ico:'👻', rar:'legendario', aplicar:s=>s.revive=true },
    { id:'r-gold',   nombre:'Monedero Real',     desc:'+200 oro inicial',      ico:'💰', rar:'raro',       aplicar:s=>{s.oro+=200;} },
    { id:'r-cd',     nombre:'Reloj de Arena',    desc:'Habilidades -1 cooldown', ico:'⏳', rar:'legendario', aplicar:s=>s.cdReduction+=1 },
    { id:'r-double', nombre:'Espejo Gemelo',     desc:'20% prob. doble ataque', ico:'🪞', rar:'legendario', aplicar:s=>s.doubleAtk+=0.20 },
    { id:'r-regen',  nombre:'Anillo de Vida',    desc:'Regeneras 3 HP/turno',  ico:'💍', rar:'epico',      aplicar:s=>s.regen+=3 },
    { id:'r-curse',  nombre:'Ojo Maldito',       desc:'+30% daño pero -10 HP máx', ico:'🧿', rar:'epico',  aplicar:s=>{s.atkMult+=0.30;s.hpMax-=10;s.hp=Math.min(s.hp,s.hpMax);} }
  ];

  const MALDICIONES = [
    { id:'fragil',    nombre:'Fragilidad',    desc:'-15% HP máximo',            ico:'💔', aplicar:s=>{s.hpMax=Math.round(s.hpMax*0.85);s.hp=Math.min(s.hp,s.hpMax);} },
    { id:'debil',     nombre:'Debilidad',     desc:'-15% ATK',                  ico:'🩹', aplicar:s=>{s.atk=Math.round(s.atk*0.85);} },
    { id:'lenta',     nombre:'Lentitud',      desc:'+1 cooldown habilidades',   ico:'🐌', aplicar:s=>{s.cdPenalty=(s.cdPenalty||0)+1;} },
    { id:'sangrado',  nombre:'Sangrado',      desc:'-2 HP por turno en combate',ico:'🩸', aplicar:s=>{s.sangrado=(s.sangrado||0)+2;} },
    { id:'mudez',     nombre:'Mudez',         desc:'-1 poción inicial',         ico:'🤐', aplicar:s=>{s.pociones=Math.max(0,s.pociones-1);s.pocionesInicio=Math.max(0,s.pocionesInicio-1);} },
    { id:'avaricia',  nombre:'Avaricia',      desc:'-25% oro obtenido',         ico:'💸', aplicar:s=>{s.oroMult=Math.max(0.5,s.oroMult-0.25);} }
  ];

  /* ============================================================
     ESTADO
     ============================================================ */
  const KEY_META = () => `sa_rl_meta_${getUserId()}`;
  const KEY_RUN  = () => `sa_rl_run_${getUserId()}`;

  const metaDef = () => ({ runs:0, mejorPiso:0, victorias:0, desbloqueos:[], maldicionesTotales:0, bossesDerrotados:0 });
  const cargarMeta = () => { try { return { ...metaDef(), ...JSON.parse(localStorage.getItem(KEY_META()) || '{}') }; } catch { return metaDef(); } };
  const guardarMeta = m => { try { localStorage.setItem(KEY_META(), JSON.stringify(m)); } catch {} };

  /* Bonificaciones desbloqueadas por meta-progresión */
  function bonosMeta(m) {
    const b = { hp:0, atk:0, def:0, pocion:0, crit:0 };
    const r = m.runs || 0;
    if (r >= 3)  { b.hp += 10; }
    if (r >= 5)  { b.pocion += 1; }
    if (r >= 8)  { b.atk += 2; }
    if (r >= 12) { b.def += 2; }
    if (r >= 20) { b.crit += 0.05; }
    if (m.victorias >= 1) { b.hp += 15; b.atk += 3; }
    if (m.victorias >= 3) { b.pocion += 1; b.crit += 0.05; }
    return b;
  }

  function nuevoRun(mascotaId) {
    const meta = cargarMeta();
    const b = bonosMeta(meta);
    return {
      mascota: mascotaId,
      hp: 100 + b.hp, hpMax: 100 + b.hp,
      atk: 10 + b.atk, def: 3 + b.def,
      crit: 0.10 + b.crit, evasion: 0.03,
      atkMult: 1.0,
      lifesteal: 0, thorns: 0, furia: false, revive: false,
      pocionesInicio: 1 + b.pocion, oroMult: 1.0,
      oro: 40, pociones: 1 + b.pocion,
      reliquias: [], maldiciones: [],
      nivel: 1, xp: 0, xpSig: 35,
      piso: 1, pisoMax: PISOS_MAX,
      mapa: null, salaActual: null,
      enBatalla: false, enemigo: null,
      turno: 'jugador',
      cd: 0,                // cooldown de habilidad
      cdMax: 3,             // base
      cdReduction: 0,
      cdPenalty: 0,
      doubleAtk: 0,
      regen: 0,
      sangrado: 0,
      log: [],
      vivo: true,
      semilla: Date.now()
    };
  }

  const cargarRun = () => { try { const r = localStorage.getItem(KEY_RUN()); return r ? JSON.parse(r) : null; } catch { return null; } };
  const guardarRun = s => { try { localStorage.setItem(KEY_RUN(), JSON.stringify(s)); } catch {} };
  const limpiarRun = () => { try { localStorage.removeItem(KEY_RUN()); } catch {} };

  let state = cargarRun();
  let _animTimer = null;

  /* ============================================================
     MAPA PROCEDURAL — 6 columnas, 2-4 nodos por columna
     ============================================================ */
  function generarPiso(piso) {
    const nodos = [];
    for (let c = 0; c < COLS_POR_PISO; c++) {
      const n = rnd(2, 4);
      for (let f = 0; f < n; f++) {
        let tipo = 'combat';
        const roll = Math.random();
        // Última columna: siempre jefe
        if (c === COLS_POR_PISO - 1) tipo = 'boss';
        // Primera columna: siempre combate
        else if (c === 0) tipo = 'combat';
        else if (roll < 0.05) tipo = 'elite';
        else if (roll < 0.14) tipo = 'treasure';
        else if (roll < 0.21) tipo = 'shop';
        else if (roll < 0.28) tipo = 'rest';
        else if (roll < 0.36) tipo = 'event';
        nodos.push({ id:`${piso}-${c}-${f}`, col:c, fila:f, tipo, visitado:false });
      }
    }
    return { piso, nodos, actual: null, completado: false };
  }

  function nodosDisponibles(mapa) {
    if (!mapa.actual) return mapa.nodos.filter(n => n.col === 0);
    const cur = mapa.nodos.find(n => n.id === mapa.actual);
    if (!cur) return mapa.nodos.filter(n => n.col === 0);
    return mapa.nodos.filter(n => !n.visitado && n.col === cur.col + 1);
  }

  /* ============================================================
     RENDER DEL MAPA EN CANVAS
     ============================================================ */
  function renderMapaCanvas(canvas, mapa) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth || 640;
    const H = canvas.clientHeight || 340;
    if (canvas.width !== W * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fondo
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a0e27'); g.addColorStop(1, '#050816');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,217,61,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const colW = W / COLS_POR_PISO;
    const disponibles = new Set(nodosDisponibles(mapa).map(n => n.id));
    const porColumna = {};
    mapa.nodos.forEach(n => { porColumna[n.col] = porColumna[n.col] || []; porColumna[n.col].push(n); });

    // Conexiones desde actual
    const curNodo = mapa.nodos.find(n => n.id === mapa.actual);
    if (curNodo) {
      ctx.strokeStyle = 'rgba(255,217,61,0.35)';
      ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      porColumna[curNodo.col + 1]?.forEach(dest => {
        const a = centroNodo(curNodo, colW, H, porColumna);
        const b = centroNodo(dest, colW, H, porColumna);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // Nodos
    const pulse = 0.5 + Math.sin(Date.now() / 320) * 0.5;
    mapa.nodos.forEach(n => {
      const { x, y } = centroNodo(n, colW, H, porColumna);
      const tipo = TIPOS[n.tipo];
      const activo = disponibles.has(n.id);
      const visitado = n.visitado;
      const esActual = mapa.actual === n.id;

      if (activo) {
        ctx.beginPath();
        ctx.arc(x, y, 26 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = tipo.color + '28';
        ctx.fill();
      }

      const radius = esActual ? 22 : (n.tipo === 'boss' ? 24 : 17);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (visitado) { ctx.fillStyle = 'rgba(120,120,120,0.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,120,120,0.6)'; }
      else if (activo || esActual) { ctx.fillStyle = tipo.color + '35'; ctx.fill(); ctx.strokeStyle = tipo.color; }
      else { ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; }
      ctx.lineWidth = 2.5; ctx.stroke();

      ctx.font = `${radius + 6}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(tipo.ico, x, y + 1);

      if (esActual) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
      }
    });

    // HUD
    ctx.fillStyle = 'rgba(255,217,61,0.9)';
    ctx.font = '900 15px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`Piso ${mapa.piso} / ${PISOS_MAX}`, 14, 12);
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Selecciona un nodo iluminado', 14, 32);
  }

  function centroNodo(n, colW, H, porColumna) {
    const col = porColumna[n.col] || [];
    const total = col.length;
    const x = colW * n.col + colW / 2;
    const sep = (H - 60) / (total + 1);
    const y = 45 + sep * (n.fila + 1);
    return { x, y };
  }

  /* ============================================================
     PANEL PRINCIPAL
     ============================================================ */
  function inyectarSeccion() {
    if ($('rpg-roguelike-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'rpg-roguelike-panel';
    panel.className = 'rpg-rl-panel';
    panel.style.display = 'none';
    document.body.appendChild(panel);
  }

  function renderPanel() {
    const panel = $('rpg-roguelike-panel');
    if (!panel) return;
    if (_animTimer) { cancelAnimationFrame(_animTimer); _animTimer = null; }
    if (!state || !state.vivo) { renderMenuInicio(panel); return; }
    if (state.enBatalla) { renderBatalla(panel); return; }
    if (!state.mapa) { state.mapa = generarPiso(state.piso); guardarRun(state); }
    renderMapa(panel);
  }

  function renderMenuInicio(panel) {
    const meta = cargarMeta();
    const mascotaId = localStorage.getItem('mascota_actual') || 'mapache';
    const m = MASCOTAS[mascotaId] || {};
    const b = bonosMeta(meta);
    panel.innerHTML = `
      <div class="rpg-rl-menu">
        <div class="rpg-rl-hero">
          <div class="rpg-rl-hero-art">${m.imagen ? `<img src="${m.imagen}" alt="">` : '🐾'}</div>
          <h2>Modo Roguelike</h2>
          <p>10 pisos · 6 columnas · Maldiciones · Jefes con 2 fases</p>
          <div class="rpg-rl-stats">
            <div><strong>${meta.runs}</strong><span>Runs</span></div>
            <div><strong>${meta.mejorPiso}</strong><span>Mejor piso</span></div>
            <div><strong>${meta.victorias}</strong><span>Victorias</span></div>
            <div><strong>${meta.bossesDerrotados || 0}</strong><span>Jefes</span></div>
          </div>
          <div class="rpg-rl-bonos-meta">
            <span class="rpg-rl-bono-chip">+${b.hp} HP</span>
            <span class="rpg-rl-bono-chip">+${b.atk} ATK</span>
            <span class="rpg-rl-bono-chip">+${b.def} DEF</span>
            <span class="rpg-rl-bono-chip">+${b.pocion} 🧪</span>
            <span class="rpg-rl-bono-chip">+${Math.round(b.crit*100)}% crit</span>
          </div>
        </div>
        <button type="button" class="btn-primary rpg-rl-start" id="rl-start">▶ Iniciar nueva run</button>
        ${meta.runs > 0 ? `<button type="button" class="btn-secondary" id="rl-reset-meta">Resetear estadísticas</button>` : ''}
        <div class="rpg-rl-info">
          <h3>⚠️ Este modo es HARDCORE</h3>
          <ul class="rpg-rl-info-list">
            <li>Los <strong>jefes</strong> tienen 2 fases (se enfurecen al 50% HP)</li>
            <li>Los <strong>élites y jefes</strong> pueden aplicar <em>maldiciones permanentes</em></li>
            <li>Las <strong>habilidades</strong> tienen cooldown de 3 turnos</li>
            <li>No te curas al <strong>subir de nivel</strong></li>
            <li>Los <strong>nodos evento</strong> tienen riesgos reales</li>
          </ul>
        </div>
      </div>`;
    $('rl-start')?.addEventListener('click', () => {
      state = nuevoRun(mascotaId);
      guardarRun(state);
      SND('victoria');
      renderPanel();
    });
    $('rl-reset-meta')?.addEventListener('click', async () => {
      const ok = await confirmar({ title: 'Resetear estadísticas', message: '¿Borrar todo tu progreso meta del roguelike?', variant: 'danger', confirmText: 'Borrar' });
      if (!ok) return;
      guardarMeta(metaDef());
      renderPanel();
    });
  }

  function renderMapa(panel) {
    const m = MASCOTAS[state.mascota] || {};
    const hpPct = clamp(state.hp / state.hpMax * 100);
    panel.innerHTML = `
      <div class="rpg-rl-hud">
        <div class="rpg-rl-hud-hero">
          ${m.imagen ? `<img src="${m.imagen}" alt="">` : '🐾'}
          <div><strong>${m.nombre || 'Héroe'}</strong><small>Nv ${state.nivel} · Piso ${state.piso}</small></div>
        </div>
        <div class="rpg-rl-hud-stats">
          <div class="rpg-rl-barra hp">
            <span style="width:${hpPct}%"></span>
            <em>${Math.round(state.hp)} / ${state.hpMax} HP</em>
          </div>
          <div class="rpg-rl-hud-chips">
            <span class="rpg-rl-chip atk">⚔️ ${state.atk}</span>
            <span class="rpg-rl-chip def">🛡️ ${state.def}</span>
            <span class="rpg-rl-chip crit">🎯 ${Math.round(state.crit*100)}%</span>
            <span class="rpg-rl-chip oro">💰 ${state.oro}</span>
            <span class="rpg-rl-chip poc">🧪 ${state.pociones}</span>
          </div>
        </div>
      </div>
      <canvas id="rl-canvas-mapa" class="rpg-rl-canvas-mapa"></canvas>
      <div class="rpg-rl-reliquias-bar">
        ${state.reliquias.length
          ? state.reliquias.map(rid => {
              const r = RELIQUIAS.find(x => x.id === rid);
              return r ? `<span class="rpg-rl-chip-reliquia rar-${r.rar}" title="${r.desc}">${r.ico} ${r.nombre}</span>` : '';
            }).join('')
          : '<span class="rpg-rl-vacio">Sin reliquias todavía…</span>'}
      </div>
      ${state.maldiciones.length ? `
        <div class="rpg-rl-maldiciones-bar">
          <span class="rpg-rl-mald-label">Maldiciones activas:</span>
          ${state.maldiciones.map(mid => {
            const mm = MALDICIONES.find(x => x.id === mid);
            return mm ? `<span class="rpg-rl-chip-maldicion" title="${mm.desc}">${mm.ico} ${mm.nombre}</span>` : '';
          }).join('')}
        </div>` : ''}
      <button type="button" class="btn-secondary rpg-rl-abandonar" id="rl-abandonar">Abandonar run</button>
    `;
    const canvas = $('rl-canvas-mapa');
    if (canvas) {
      const animar = () => {
        if (!document.contains(canvas)) return;
        renderMapaCanvas(canvas, state.mapa);
        _animTimer = requestAnimationFrame(animar);
      };
      animar();
      canvas.addEventListener('click', (e) => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const colW = r.width / COLS_POR_PISO;
        const porColumna = {};
        state.mapa.nodos.forEach(n => { porColumna[n.col] = porColumna[n.col] || []; porColumna[n.col].push(n); });
        const disponibles = nodosDisponibles(state.mapa);
        const nodo = disponibles.find(n => {
          const c = centroNodo(n, colW, r.height, porColumna);
          return Math.hypot(c.x - x, c.y - y) < 32;
        });
        if (nodo) entrarNodo(nodo);
      });
    }
    $('rl-abandonar')?.addEventListener('click', async () => {
      const ok = await confirmar({
        title: '¿Abandonar la run?',
        message: 'Se perderá todo el progreso de esta partida. Esta acción no se puede deshacer.',
        variant: 'danger',
        confirmText: 'Sí, abandonar',
        cancelText: 'Seguir jugando'
      });
      if (!ok) return;
      terminarRun(false);
    });
  }

  /* ============================================================
     ENTRAR NODO
     ============================================================ */
  function entrarNodo(nodo) {
    if (!state.mapa) return;
    nodo.visitado = true;
    state.mapa.actual = nodo.id;
    state.salaActual = nodo.tipo;
    guardarRun(state);
    SND('blip');
    switch (nodo.tipo) {
      case 'combat':   iniciarBatalla('comun'); break;
      case 'elite':    iniciarBatalla('elite'); break;
      case 'boss':     iniciarBatalla('jefe'); break;
      case 'treasure': abrirTesoro(); break;
      case 'shop':     abrirTienda(); break;
      case 'rest':     abrirDescanso(); break;
      case 'event':    abrirEvento(); break;
    }
  }

  /* ============================================================
     COMBATE
     ============================================================ */
  function iniciarBatalla(tier) {
    const lista = ENEMIGOS_RL[tier];
    const base = lista[rnd(0, lista.length - 1)];
    // Escalado MUCHO más agresivo
    const escalaHP  = 1 + (state.piso - 1) * 0.65 + (state.nivel - 1) * 0.12;
    const escalaATK = 1 + (state.piso - 1) * 0.50 + (state.nivel - 1) * 0.10;
    const hpMax = Math.round(base.hp * escalaHP);
    state.enemigo = {
      ...base,
      hp: hpMax, hpMax,
      atk: Math.round(base.atk * escalaATK),
      xp: Math.round(base.xp * (1 + (state.piso - 1) * 0.35)),
      tier,
      specialCD: tier === 'jefe' ? 2 : tier === 'elite' ? 3 : 4,
      specialTimer: tier === 'jefe' ? 2 : tier === 'elite' ? 3 : 4,
      phase: 1,
      shield: 0
    };
    state.enBatalla = true;
    state.turno = 'jugador';
    state.cd = 0; // reset cooldown de habilidad al empezar combate
    state.log = [];
    guardarRun(state);
    renderPanel();
  }

  function renderBatalla(panel) {
    const m = MASCOTAS[state.mascota] || {};
    const e = state.enemigo;
    const cdMax = state.cdMax + state.cdPenalty - state.cdReduction;
    const cdListo = state.cd <= 0;
    const esFase2 = e.phase === 2;
    panel.innerHTML = `
      <div class="rpg-rl-batalla ${esFase2 ? 'enraged' : ''}">
        <canvas id="rl-canvas-batalla" class="rpg-rl-canvas-batalla"></canvas>
        <div class="rpg-rl-batalla-hud">
          <div class="rpg-rl-fighter-info hero">
            <strong>${m.nombre || 'Héroe'}</strong>
            <div class="rpg-rl-barra-hp">
              <span style="width:${clamp(state.hp/state.hpMax*100)}%"></span>
              <em>${Math.round(state.hp)} / ${state.hpMax}</em>
            </div>
          </div>
          <div class="rpg-rl-fighter-info enemigo ${esFase2 ? 'fase2' : ''}">
            <strong>${e.nombre} ${e.tier === 'jefe' ? (esFase2 ? '🔥 FASE 2' : '👑') : e.tier === 'elite' ? '💀' : ''}</strong>
            <div class="rpg-rl-barra-hp enemigo ${esFase2 ? 'fase2' : ''}">
              <span style="width:${clamp(e.hp/e.hpMax*100)}%"></span>
              <em>${Math.round(e.hp)} / ${e.hpMax}</em>
            </div>
            ${e.shield > 0 ? `<small class="rpg-rl-shield">🛡️ Escudo: ${e.shield}</small>` : ''}
          </div>
        </div>
        <div class="rpg-rl-acciones">
          <button type="button" class="rpg-rl-btn atacar" data-accion="atacar"><span>⚔️</span><span>Atacar</span></button>
          <button type="button" class="rpg-rl-btn habilidad ${cdListo ? 'listo' : ''}" data-accion="habilidad" ${cdListo ? '' : 'disabled'}>
            <span>✨</span><span>${cdListo ? 'Habilidad' : `CD: ${state.cd}`}</span>
          </button>
          <button type="button" class="rpg-rl-btn pocion" data-accion="pocion" ${state.pociones <= 0 ? 'disabled' : ''}>
            <span>🧪</span><span>Poción (${state.pociones})</span>
          </button>
          <button type="button" class="rpg-rl-btn huir" data-accion="huir" ${e.tier === 'jefe' ? 'disabled' : ''}>
            <span>🏃</span><span>${e.tier === 'jefe' ? 'Sin escape' : 'Huir'}</span>
          </button>
        </div>
        <div class="rpg-rl-log" id="rl-log"></div>
      </div>
    `;
    const canvas = $('rl-canvas-batalla');
    const animador = new BatallaCanvas(canvas);

    qsa('[data-accion]', panel).forEach(b => b.addEventListener('click', () => {
      if (state.turno !== 'jugador' || !state.enBatalla) return;
      state.turno = 'enemigo';
      desactivarBotones(panel);
      switch (b.dataset.accion) {
        case 'atacar':    accionAtacar(animador); break;
        case 'habilidad': accionHabilidad(animador); break;
        case 'pocion':    accionPocion(animador); break;
        case 'huir':      accionHuir(animador); break;
      }
    }));

    // Log previo
    if (state.log.length) {
      const log = $('rl-log');
      state.log.forEach(t => {
        const div = document.createElement('div');
        div.className = 'rpg-rl-log-line';
        div.textContent = t;
        log.appendChild(div);
      });
      log.scrollTop = log.scrollHeight;
    }
  }

  function desactivarBotones(panel) { qsa('[data-accion]', panel).forEach(b => b.disabled = true); }
  function reactivarBotones(panel) { qsa('[data-accion]', panel).forEach(b => b.disabled = false); }

  function logBatalla(txt) {
    state.log.push(txt);
    if (state.log.length > 40) state.log.shift();
    const log = $('rl-log');
    if (log) {
      const div = document.createElement('div');
      div.className = 'rpg-rl-log-line';
      div.textContent = txt;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }
  }

  function calcularDmgBase() {
    let dmg = state.atk * (state.atkMult || 1) + rnd(-2, 3);
    if (state.furia && state.hp / state.hpMax < 0.3) dmg *= 1.6;
    return Math.round(dmg);
  }

  function accionAtacar(animador) {
    let dmg = calcularDmgBase();
    const crit = Math.random() < state.crit;
    if (crit) dmg = Math.round(dmg * 1.8);
    // Escudo del enemigo
    if (state.enemigo.shield > 0) {
      const absorbed = Math.min(dmg, state.enemigo.shield);
      state.enemigo.shield -= absorbed;
      dmg -= absorbed;
      if (absorbed > 0) logBatalla(`🛡️ El escudo absorbe ${absorbed}`);
    }
    dmg = Math.max(0, dmg);
    animador.playAttack('slash', dmg, crit);
    SND(crit ? 'victoria' : 'atrapado');
    logBatalla(`⚔️ Atacas por ${dmg}${crit ? ' ¡CRÍTICO!' : ''}`);
    state.enemigo.hp = Math.max(0, state.enemigo.hp - dmg);

    // Robo de vida
    if (state.lifesteal > 0) {
      const rob = Math.round(dmg * state.lifesteal);
      if (rob > 0) { state.hp = clamp(state.hp + rob, 0, state.hpMax); logBatalla(`🩸 Robas ${rob} HP`); }
    }
    // Thorns (refleja si enemigo ataca)
    // Doble ataque
    if (state.doubleAtk > 0 && Math.random() < state.doubleAtk) {
      logBatalla('🪞 ¡Ataque doble!');
      setTimeout(() => {
        let d2 = calcularDmgBase();
        state.enemigo.hp = Math.max(0, state.enemigo.hp - d2);
        animador.playAttack('dagger', d2, false);
        logBatalla(`⚔️ Segundo golpe: ${d2}`);
        setTimeout(() => afterPlayerAction(), 500);
      }, 350);
      return;
    }
    setTimeout(() => afterPlayerAction(), 700);
  }

  function afterPlayerAction() {
    // Chequear fase 2 del jefe
    const e = state.enemigo;
    if (e && e.tier === 'jefe' && e.phase === 1 && e.hp / e.hpMax <= 0.5) {
      e.phase = 2;
      e.atk = Math.round(e.atk * 1.35);
      e.shield = Math.round(e.hpMax * 0.15);
      logBatalla('🔥 ¡EL JEFE SE ENFURECE! +35% ATK');
      SND('growl');
      const canvas = $('rl-canvas-batalla');
      if (canvas) canvas.classList.add('shake');
      setTimeout(() => canvas?.classList.remove('shake'), 600);
    }
    // Sangrado
    if (state.sangrado > 0) {
      state.hp = Math.max(0, state.hp - state.sangrado);
      logBatalla(`🩸 Sangrado: -${state.sangrado} HP`);
    }
    // Regeneración
    if (state.regen > 0) {
      state.hp = clamp(state.hp + state.regen, 0, state.hpMax);
      logBatalla(`💚 Regeneras ${state.regen} HP`);
    }
    if (state.hp <= 0) {
      if (state.revive) {
        state.revive = false;
        state.hp = Math.round(state.hpMax * 0.5);
        logBatalla('👻 ¡Alma Errante te revive!');
        actualizarBarraHeroe();
        state.turno = 'jugador';
        reactivarBotones(qs('.rpg-rl-batalla'));
        return;
      }
      return derrotaBatalla();
    }
    actualizarBarraHeroe();
    if (state.enemigo.hp <= 0) return setTimeout(victoriaBatalla, 400);
    setTimeout(turnoEnemigo, 500);
  }

  function accionHabilidad(animador) {
    const cdMax = state.cdMax + state.cdPenalty - state.cdReduction;
    if (state.cd > 0) return;
    state.cd = Math.max(1, cdMax);

    const mascota = state.mascota;
    const habs = {
      mapache:{ fx:'dagger',   mult:1.9, nombre:'Robo relámpago', roba:true },
      girasol:{ fx:'fireball', mult:2.1, nombre:'Rayo solar' },
      gatito:{ fx:'slash',     mult:1.5, hits:2, nombre:'Doble garra' },
      'gatito-negro':{ fx:'shadow', mult:2.0, drena:0.4, nombre:'Mordida de sombra' },
      hamburguesa:{ fx:'hammer', mult:2.4, nombre:'Mega burger' },
      oveja:{ fx:'hammer',     mult:1.6, cura:true, nombre:'Cabezazo sagrado' },
      pollito:{ fx:'bolt',     mult:1.3, hits:3, nombre:'Triple picotazo' },
      jirafa:{ fx:'slash',     mult:2.3, nombre:'Coz relámpago' },
      unicornio:{ fx:'magic',  mult:2.6, limpia:true, nombre:'Juicio arcano' },
      conejo:{ fx:'slash',     mult:0.9, hits:4, nombre:'Ráfaga de saltos' },
      'dragon-bebe':{ fx:'fireball', mult:2.3, quema:true, nombre:'Bola de fuego' },
      'dragon-anciano':{ fx:'fireball', mult:3.0, quema:true, nombre:'Apocalipsis' }
    };
    const h = habs[mascota] || habs.mapache;
    const hits = h.hits || 1;
    let total = 0;
    for (let i = 0; i < hits; i++) {
      let d = Math.round(calcularDmgBase() * h.mult);
      if (state.enemigo.shield > 0) {
        const absorbed = Math.min(d, state.enemigo.shield);
        state.enemigo.shield -= absorbed;
        d -= absorbed;
      }
      total += d;
      state.enemigo.hp = Math.max(0, state.enemigo.hp - d);
      if (state.enemigo.hp <= 0) break;
    }
    animador.playAttack(h.fx, total, true);
    SND('victoria');
    logBatalla(`✨ ${h.nombre}: ${total} daño`);

    if (h.cura) {
      const c = Math.round(state.hpMax * 0.25);
      state.hp = clamp(state.hp + c, 0, state.hpMax);
      logBatalla(`💚 +${c} HP`);
    }
    if (h.drena) {
      const rob = Math.round(total * h.drena);
      state.hp = clamp(state.hp + rob, 0, state.hpMax);
      logBatalla(`🩸 Drenas ${rob} HP`);
    }
    if (h.roba) { state.oro += 5; logBatalla('💰 Robas 5 oro'); }
    if (h.limpia) { state.sangrado = 0; logBatalla('🧼 Limpias efectos negativos'); }
    if (h.quema) {
      state.enemigo.quemado = 3;
      logBatalla('🔥 ¡El enemigo arde!');
    }
    setTimeout(() => afterPlayerAction(), 800);
  }

  function accionPocion(animador) {
    if (state.pociones <= 0) return;
    state.pociones--;
    const c = Math.round(state.hpMax * 0.45);
    state.hp = clamp(state.hp + c, 0, state.hpMax);
    animador.playHeal();
    SND('comer');
    logBatalla(`🧪 Poción: +${c} HP`);
    setTimeout(() => afterPlayerAction(), 700);
  }

  function accionHuir(animador) {
    if (state.enemigo.tier === 'boss') return;
    if (Math.random() < 0.55) {
      logBatalla('🏃 Escapas con éxito');
      setTimeout(() => {
        state.enBatalla = false;
        state.enemigo = null;
        guardarRun(state);
        renderPanel();
      }, 500);
    } else {
      logBatalla('❌ No pudiste escapar');
      setTimeout(turnoEnemigo, 500);
    }
  }

  function actualizarBarraHeroe() {
    const s = qs('.rpg-rl-fighter-info.hero .rpg-rl-barra-hp span');
    const e = qs('.rpg-rl-fighter-info.hero .rpg-rl-barra-hp em');
    if (s) s.style.width = clamp(state.hp / state.hpMax * 100) + '%';
    if (e) e.textContent = `${Math.round(state.hp)} / ${state.hpMax}`;
    const es = qs('.rpg-rl-fighter-info.enemigo .rpg-rl-barra-hp span');
    const ee = qs('.rpg-rl-fighter-info.enemigo .rpg-rl-barra-hp em');
    if (es && state.enemigo) es.style.width = clamp(state.enemigo.hp / state.enemigo.hpMax * 100) + '%';
    if (ee && state.enemigo) ee.textContent = `${Math.round(state.enemigo.hp)} / ${state.enemigo.hpMax}`;
  }

  /* Enemigo con especiales */
  function turnoEnemigo() {
    if (!state.enBatalla || !state.enemigo) return;
    const e = state.enemigo;
    actualizarBarraHeroe();

    // Quemadura del enemigo
    if (e.quemado > 0) {
      const q = Math.round(e.hpMax * 0.06);
      e.hp = Math.max(0, e.hp - q);
      e.quemado--;
      logBatalla(`🔥 Quemadura: -${q} HP enemigo`);
      if (e.hp <= 0) return setTimeout(victoriaBatalla, 400);
    }

    // Cooldown del especial
    e.specialTimer--;

    // ¿Usar especial?
    if (e.specialTimer <= 0) {
      e.specialTimer = e.specialCD;
      setTimeout(() => ejecutarEspecial(e), 400);
      return;
    }

    // Ataque normal
    setTimeout(() => ataqueNormalEnemigo(e), 600);
  }

  function ataqueNormalEnemigo(e) {
    // Esquivar
    if (Math.random() < state.evasion) {
      logBatalla(`😎 Esquivaste a ${e.nombre}`);
      SND('blip');
      const anim = $('rl-canvas-batalla')?._batallaAnim;
      anim?.playDodge();
      state.turno = 'jugador';
      guardarRun(state);
      reactivarBotones(qs('.rpg-rl-batalla'));
      return;
    }
    let dmg = Math.max(1, e.atk - Math.floor(state.def * 0.5) + rnd(-2, 2));
    state.hp = Math.max(0, state.hp - dmg);
    SND('derrota');
    logBatalla(`💥 ${e.nombre} te ataca por ${dmg}`);
    const anim = $('rl-canvas-batalla')?._batallaAnim;
    anim?.playEnemyAttack(dmg);

    // Thorns
    if (state.thorns > 0) {
      e.hp = Math.max(0, e.hp - state.thorns);
      logBatalla(`🌵 Espinas: ${state.thorns} daño a enemigo`);
      if (e.hp <= 0) return setTimeout(victoriaBatalla, 400);
    }
    finalizarTurnoEnemigo();
  }

  function ejecutarEspecial(e) {
    const s = e.special;
    SND('growl');
    const anim = $('rl-canvas-batalla')?._batallaAnim;
    switch (s) {
      case 'heal': {
        const c = Math.round(e.hpMax * 0.25);
        e.hp = clamp(e.hp + c, 0, e.hpMax);
        logBatalla(`💚 ${e.nombre} se cura ${c} HP`);
        anim?.playHeal();
        break;
      }
      case 'buff': {
        e.atk = Math.round(e.atk * 1.20);
        logBatalla(`⬆️ ${e.nombre} se potencia (+20% ATK)`);
        break;
      }
      case 'debuff': {
        state.atkMult = Math.max(0.6, (state.atkMult || 1) - 0.25);
        logBatalla(`⬇️ ¡Tu ATK se reduce 25%!`);
        setTimeout(() => { state.atkMult = Math.min(1, (state.atkMult || 1) + 0.25); }, 3000);
        break;
      }
      case 'multihit': {
        let total = 0;
        for (let i = 0; i < 3; i++) {
          const d = Math.max(1, Math.floor(e.atk * 0.5));
          state.hp = Math.max(0, state.hp - d);
          total += d;
        }
        logBatalla(`💥💥💥 ¡Triple golpe! ${total} daño`);
        anim?.playEnemyAttack(total);
        break;
      }
      case 'poison': {
        state.sangrado = (state.sangrado || 0) + 2;
        logBatalla('☠️ ¡Envenenado! +2 daño/turno');
        break;
      }
      case 'drain': {
        const d = Math.max(1, Math.floor(e.atk * 0.9));
        state.hp = Math.max(0, state.hp - d);
        e.hp = clamp(e.hp + Math.round(d * 0.6), 0, e.hpMax);
        logBatalla(`🩸 ${e.nombre} te drena ${d} HP`);
        anim?.playEnemyAttack(d);
        break;
      }
      case 'shield': {
        e.shield = Math.round(e.hpMax * 0.25);
        logBatalla(`🛡️ ${e.nombre} se blinda (${e.shield})`);
        break;
      }
      case 'firebreath': {
        const d = Math.max(1, Math.round(e.atk * 1.4));
        state.hp = Math.max(0, state.hp - d);
        state.sangrado = (state.sangrado || 0) + 2;
        logBatalla(`🔥 ¡Aliento de fuego! ${d} daño + quemadura`);
        anim?.playEnemyAttack(d);
        break;
      }
      case 'summon': {
        const d = Math.max(1, Math.round(e.atk * 0.7));
        state.hp = Math.max(0, state.hp - d);
        e.hp = clamp(e.hp + Math.round(e.hpMax * 0.15), 0, e.hpMax);
        logBatalla(`💀 ${e.nombre} invoca esqueletos · ${d} daño · se cura`);
        anim?.playEnemyAttack(d);
        break;
      }
      case 'curse': {
        const nuevas = MALDICIONES.filter(m => !state.maldiciones.includes(m.id));
        if (nuevas.length) {
          const mal = nuevas[rnd(0, nuevas.length - 1)];
          aplicarMaldicion(mal);
          logBatalla(`💀 ¡MALDICIÓN APLICADA: ${mal.nombre}!`);
        } else {
          state.hp = Math.max(0, state.hp - Math.round(e.atk * 1.2));
          logBatalla(`💀 ¡Maldición total! -${Math.round(e.atk * 1.2)} HP`);
        }
        break;
      }
      case 'apocalypse': {
        const d = Math.max(1, Math.round(e.atk * 1.8));
        state.hp = Math.max(0, state.hp - d);
        e.shield = Math.round(e.hpMax * 0.15);
        logBatalla(`☄️ ¡APOCALIPSIS! ${d} daño + escudo`);
        anim?.playEnemyAttack(d);
        break;
      }
      default: {
        const d = Math.max(1, Math.floor(e.atk * 1.2));
        state.hp = Math.max(0, state.hp - d);
        logBatalla(`⚡ ${e.nombre} usa un ataque especial (${d})`);
      }
    }
    finalizarTurnoEnemigo();
  }

  function finalizarTurnoEnemigo() {
    actualizarBarraHeroe();
    if (state.hp <= 0) {
      if (state.revive) {
        state.revive = false;
        state.hp = Math.round(state.hpMax * 0.5);
        logBatalla('👻 ¡Alma Errante te revive!');
        actualizarBarraHeroe();
        state.turno = 'jugador';
        guardarRun(state);
        reactivarBotones(qs('.rpg-rl-batalla'));
        return;
      }
      return derrotaBatalla();
    }
    // Reducir cooldown de habilidad
    if (state.cd > 0) state.cd--;
    state.turno = 'jugador';
    guardarRun(state);
    reactivarBotones(qs('.rpg-rl-batalla'));
    // Actualizar texto del botón de habilidad
    const habBtn = qs('[data-accion="habilidad"] span:last-child');
    if (habBtn) {
      const cdMax = state.cdMax + state.cdPenalty - state.cdReduction;
      habBtn.textContent = state.cd <= 0 ? 'Habilidad' : `CD: ${state.cd}`;
      const btn = qs('[data-accion="habilidad"]');
      if (btn) btn.disabled = state.cd > 0;
      btn?.classList.toggle('listo', state.cd <= 0);
    }
  }

  function victoriaBatalla() {
    state.enBatalla = false;
    const e = state.enemigo;
    let oroGanado = Math.round(rnd(10, 22) * (e.tier === 'jefe' ? 8 : e.tier === 'elite' ? 3.5 : 1) * state.oroMult);
    state.oro += oroGanado;
    state.xp += e.xp;
    let subido = false;
    while (state.xp >= state.xpSig) {
      state.xp -= state.xpSig;
      state.nivel++;
      state.xpSig = Math.round(state.xpSig * 1.45);
      state.hpMax += 12;
      // NO se cura al subir de nivel (hardcore)
      state.atk += 2;
      state.def += 1;
      subido = true;
    }
    SND('victoria');

    // Maldición por jefe/élite
    let maldicionAplicada = null;
    if (e.tier === 'jefe' && Math.random() < 0.55) {
      const nuevas = MALDICIONES.filter(m => !state.maldiciones.includes(m.id));
      if (nuevas.length) {
        maldicionAplicada = nuevas[rnd(0, nuevas.length - 1)];
        aplicarMaldicion(maldicionAplicada);
      }
    } else if (e.tier === 'elite' && Math.random() < 0.20) {
      const nuevas = MALDICIONES.filter(m => !state.maldiciones.includes(m.id));
      if (nuevas.length) {
        maldicionAplicada = nuevas[rnd(0, nuevas.length - 1)];
        aplicarMaldicion(maldicionAplicada);
      }
    }

    const esBoss = e.tier === 'jefe';
    guardarRun(state);

    setTimeout(() => {
      if (esBoss) {
        const meta = cargarMeta();
        meta.bossesDerrotados = (meta.bossesDerrotados || 0) + 1;
        guardarMeta(meta);
        state.piso++;
        if (state.piso > state.pisoMax) return victoriaFinal();
        state.mapa = generarPiso(state.piso);
        state.mapa.actual = null;
      }
      state.enemigo = null;
      guardarRun(state);
      const lineas = [`+${oroGanado} oro`, `+${e.xp} XP`];
      if (subido) lineas.push(`⬆️ Nivel ${state.nivel}`);
      if (maldicionAplicada) lineas.push(`💀 MALDICIÓN: ${maldicionAplicada.nombre}`);
      mostrarRecompensa('¡Victoria!', lineas, () => renderPanel());
    }, 900);
  }

  function aplicarMaldicion(mal) {
    if (state.maldiciones.includes(mal.id)) return;
    state.maldiciones.push(mal.id);
    mal.aplicar(state);
    const meta = cargarMeta();
    meta.maldicionesTotales = (meta.maldicionesTotales || 0) + 1;
    guardarMeta(meta);
    SND('derrota');
  }

  function derrotaBatalla() {
    state.vivo = false;
    SND('derrota');
    guardarRun(state);
    const meta = cargarMeta();
    meta.runs++;
    meta.mejorPiso = Math.max(meta.mejorPiso, state.piso);
    guardarMeta(meta);
    setTimeout(() => {
      mostrarRecompensa('💀 Has caído…', [
        `Llegaste al piso ${state.piso}`,
        `Nivel ${state.nivel}`,
        `${state.reliquias.length} reliquias`,
        `${state.maldiciones.length} maldiciones`
      ], () => { limpiarRun(); state = null; renderPanel(); });
    }, 700);
  }

  function victoriaFinal() {
    state.vivo = false;
    SND('victoria');
    const meta = cargarMeta();
    meta.runs++;
    meta.victorias++;
    meta.mejorPiso = PISOS_MAX;
    guardarMeta(meta);
    guardarRun(state);
    setTimeout(() => {
      mostrarRecompensa('🏆 ¡VICTORIA!', [
        `Conquistaste los ${PISOS_MAX} pisos`,
        `Nivel final: ${state.nivel}`,
        `${state.reliquias.length} reliquias`,
        `${state.maldiciones.length} maldiciones`,
        `+500 oro bonus`
      ], () => { limpiarRun(); state = null; renderPanel(); });
    }, 700);
  }

  /* ============================================================
     MODALES DE EVENTO / TESORO / TIENDA / DESCANSO
     ============================================================ */
  function mostrarRecompensa(titulo, lineas, onClose) {
    const panel = $('rpg-roguelike-panel');
    const card = document.createElement('div');
    card.className = 'rpg-rl-recompensa';
    card.innerHTML = `
      <div class="rpg-rl-recompensa-card">
        <h2>${titulo}</h2>
        <ul>${lineas.map(l => `<li>${l}</li>`).join('')}</ul>
        <button type="button" class="btn-primary" id="rl-rec-cont">Continuar</button>
      </div>`;
    panel.appendChild(card);
    requestAnimationFrame(() => card.classList.add('active'));
    $('rl-rec-cont').addEventListener('click', () => {
      card.classList.remove('active');
      setTimeout(() => { card.remove(); onClose(); }, 250);
    });
  }

  function mostrarEleccion(titulo, opciones) {
    const panel = $('rpg-roguelike-panel');
    const card = document.createElement('div');
    card.className = 'rpg-rl-recompensa';
    card.innerHTML = `
      <div class="rpg-rl-recompensa-card">
        <h2>${titulo}</h2>
        <div class="rpg-rl-eleccion-lista">
          ${opciones.map((o, i) => `
            <button type="button" class="rpg-rl-opcion rpg-rl-opcion-reliquia" data-i="${i}">
              <span class="rpg-rl-opcion-ico">${o.ico}</span>
              <strong>${o.titulo}</strong>
              <small>${o.desc}</small>
            </button>`).join('')}
        </div>
      </div>`;
    panel.appendChild(card);
    requestAnimationFrame(() => card.classList.add('active'));
    qsa('.rpg-rl-opcion', card).forEach(b => b.addEventListener('click', () => {
      const o = opciones[Number(b.dataset.i)];
      if (o?.onClick) o.onClick();
      card.classList.remove('active');
      setTimeout(() => card.remove(), 250);
    }));
  }

  function abrirTesoro() {
    const pool = RELIQUIAS.filter(r => !state.reliquias.includes(r.id));
    if (!pool.length) return completarSala();
    const ops = [];
    for (let i = 0; i < 3 && pool.length; i++) {
      const idx = rnd(0, pool.length - 1);
      const r = pool.splice(idx, 1)[0];
      ops.push({
        ico:r.ico, titulo:r.nombre, desc:r.desc,
        onClick: () => { aplicarReliquia(r); completarSala(); }
      });
    }
    mostrarEleccion('💎 Elige una reliquia', ops);
  }

  function aplicarReliquia(r) {
    if (state.reliquias.includes(r.id)) return;
    state.reliquias.push(r.id);
    r.aplicar(state);
    SND('victoria');
    guardarRun(state);
  }

  function abrirTienda() {
    const panel = $('rpg-roguelike-panel');
    const pool = RELIQUIAS.filter(r => !state.reliquias.includes(r.id));
    const items = [];
    for (let i = 0; i < 2 && pool.length; i++) {
      const idx = rnd(0, pool.length - 1);
      const r = pool.splice(idx, 1)[0];
      const precio = r.rar === 'legendario' ? rnd(200, 300) : r.rar === 'epico' ? rnd(120, 200) : rnd(80, 130);
      items.push({ tipo:'reliquia', rel:r, precio });
    }
    const precioPocion = 60;
    const card = document.createElement('div');
    card.className = 'rpg-rl-recompensa';
    card.innerHTML = `
      <div class="rpg-rl-recompensa-card rpg-rl-tienda">
        <h2>🛒 Tienda</h2>
        <p>Oro: <strong>${state.oro}</strong></p>
        <div class="rpg-rl-tienda-lista">
          ${items.map((o, i) => `
            <button type="button" class="rpg-rl-tienda-item" data-i="${i}" ${state.oro < o.precio ? 'disabled' : ''}>
              <span class="rpg-rl-tienda-ico">${o.rel.ico}</span>
              <strong>${o.rel.nombre}</strong>
              <small>${o.rel.desc}</small>
              <em>💰 ${o.precio}</em>
            </button>`).join('')}
          <button type="button" class="rpg-rl-tienda-item" data-pocion="1" ${state.oro < precioPocion ? 'disabled' : ''}>
            <span class="rpg-rl-tienda-ico">🧪</span>
            <strong>Poción curativa</strong>
            <small>+45% HP máximo</small>
            <em>💰 ${precioPocion}</em>
          </button>
          <button type="button" class="rpg-rl-tienda-item" data-heal="1" ${state.oro < 45 ? 'disabled' : ''}>
            <span class="rpg-rl-tienda-ico">❤️</span>
            <strong>Curar 30% HP</strong>
            <small>Recuperación inmediata</small>
            <em>💰 45</em>
          </button>
        </div>
        <button type="button" class="btn-secondary" id="rl-tienda-salir">Salir</button>
      </div>`;
    panel.appendChild(card);
    requestAnimationFrame(() => card.classList.add('active'));

    qsa('.rpg-rl-tienda-item', card).forEach(b => b.addEventListener('click', () => {
      if (b.dataset.pocion) {
        if (state.oro < precioPocion) return;
        state.oro -= precioPocion; state.pociones++;
        SND('moneda'); b.disabled = true; b.querySelector('em').textContent = '✓ Comprado';
        return;
      }
      if (b.dataset.heal) {
        if (state.oro < 45) return;
        state.oro -= 45;
        state.hp = clamp(state.hp + Math.round(state.hpMax * 0.3), 0, state.hpMax);
        SND('comer'); b.disabled = true; b.querySelector('em').textContent = '✓ Comprado';
        return;
      }
      const o = items[Number(b.dataset.i)];
      if (!o || state.oro < o.precio) return;
      state.oro -= o.precio;
      aplicarReliquia(o.rel);
      SND('moneda'); b.disabled = true; b.querySelector('em').textContent = '✓ Comprado';
    }));

    $('rl-tienda-salir')?.addEventListener('click', () => {
      card.classList.remove('active');
      setTimeout(() => { card.remove(); completarSala(); }, 250);
    });
  }

  function abrirDescanso() {
    const panel = $('rpg-roguelike-panel');
    const card = document.createElement('div');
    card.className = 'rpg-rl-recompensa';
    card.innerHTML = `
      <div class="rpg-rl-recompensa-card rpg-rl-descanso">
        <h2>🔥 Descanso</h2>
        <p>Elige un beneficio</p>
        <div class="rpg-rl-descanso-opts">
          <button type="button" class="rpg-rl-opcion" data-op="curar"><span>❤️</span><strong>Curar 40% HP</strong></button>
          <button type="button" class="rpg-rl-opcion" data-op="atk"><span>⚔️</span><strong>+3 ATK</strong></button>
          <button type="button" class="rpg-rl-opcion" data-op="def"><span>🛡️</span><strong>+2 DEF</strong></button>
          <button type="button" class="rpg-rl-opcion" data-op="pocion"><span>🧪</span><strong>+1 Poción</strong></button>
          <button type="button" class="rpg-rl-opcion" data-op="hp"><span>💗</span><strong>+15 HP máx</strong></button>
          <button type="button" class="rpg-rl-opcion" data-op="crit"><span>🎯</span><strong>+5% crítico</strong></button>
        </div>
      </div>`;
    panel.appendChild(card);
    requestAnimationFrame(() => card.classList.add('active'));
    qsa('[data-op]', card).forEach(b => b.addEventListener('click', () => {
      const op = b.dataset.op;
      if (op === 'curar')  { state.hp = clamp(state.hp + Math.round(state.hpMax * 0.4), 0, state.hpMax); }
      if (op === 'atk')    { state.atk += 3; }
      if (op === 'def')    { state.def += 2; }
      if (op === 'pocion') { state.pociones++; }
      if (op === 'hp')     { state.hpMax += 15; state.hp += 15; }
      if (op === 'crit')   { state.crit += 0.05; }
      SND('despertar');
      card.classList.remove('active');
      setTimeout(() => { card.remove(); completarSala(); }, 250);
    }));
  }

  /* EVENTOS — con riesgos reales */
  const EVENTOS = [
    {
      titulo:'🗿 Altar Antiguo',
      desc:'Un altar con runas brillantes. Puedes ofrecer sangre a cambio de poder.',
      ops: [
        { txt:'Ofrecer 15 HP por +8 ATK', fn: () => {
          if (state.hp <= 15) return 'No tienes suficiente HP';
          state.hp -= 15; state.atk += 8; SND('victoria');
          return '¡El altar brilla! +8 ATK';
        }},
        { txt:'Ignorar el altar', fn: () => 'Sigues tu camino.' }
      ]
    },
    {
      titulo:'🏺 Cofre Maldito',
      desc:'Un cofre brilla con luz siniestra. Podría contener un tesoro… o una maldición.',
      ops: [
        { txt:'Abrir el cofre (50% maldición)', fn: () => {
          if (Math.random() < 0.5) {
            const pool = RELIQUIAS.filter(r => !state.reliquias.includes(r.id));
            if (pool.length) { const r = pool[rnd(0, pool.length - 1)]; aplicarReliquia(r); return `¡Reliquia: ${r.nombre}!`; }
          }
          const nuevas = MALDICIONES.filter(m => !state.maldiciones.includes(m.id));
          if (nuevas.length) { const m = nuevas[rnd(0, nuevas.length - 1)]; aplicarMaldicion(m); return `¡Maldición: ${m.nombre}!`; }
          return 'Nada ocurre.';
        }},
        { txt:'Dejarlo cerrado', fn: () => 'Pasas de largo.' }
      ]
    },
    {
      titulo:'💀 Espíritu Errante',
      desc:'Un espíritu te ofrece un pacto: conocimientos antiguos a cambio de algo de ti.',
      ops: [
        { txt:'Aceptar (+6 ATK, -10 HP máx)', fn: () => {
          if (state.hpMax <= 30) return 'Demasiado débil';
          state.atk += 6; state.hpMax = Math.max(20, state.hpMax - 10); state.hp = Math.min(state.hp, state.hpMax);
          return '¡Poder antiguo fluye en ti!';
        }},
        { txt:'Rechazar', fn: () => 'El espíritu desaparece.' }
      ]
    },
    {
      titulo:'⚗️ Laboratorio Abandonado',
      desc:'Frascos con líquidos desconocidos. Podrías beber uno… o llevarte el equipo.',
      ops: [
        { txt:'Beber la poción azul (cura 40%)', fn: () => {
          state.hp = clamp(state.hp + Math.round(state.hpMax * 0.4), 0, state.hpMax);
          return 'Te sientes mucho mejor.';
        }},
        { txt:'Saquear el laboratorio (+80 oro)', fn: () => { state.oro += 80; return '+80 oro'; }},
        { txt:'Beber la poción roja (aleatorio)', fn: () => {
          if (Math.random() < 0.6) { state.atk += 4; return '¡+4 ATK!'; }
          state.hp = Math.max(1, state.hp - 20); return '¡-20 HP!';
        }}
      ]
    },
    {
      titulo:'🔥 Forja Enana',
      desc:'Una forja aún caliente. Puedes fundir algo de tu equipo.',
      ops: [
        { txt:'Fundir armadura (-3 DEF, +100 oro)', fn: () => { if (state.def < 3) return 'DEF insuficiente'; state.def -= 3; state.oro += 100; return '+100 oro, -3 DEF'; }},
        { txt:'Fundir armas (-3 ATK, +1 reliquia)', fn: () => {
          if (state.atk < 8) return 'ATK insuficiente';
          state.atk -= 3;
          const pool = RELIQUIAS.filter(r => !state.reliquias.includes(r.id));
          if (pool.length) { const r = pool[rnd(0, pool.length - 1)]; aplicarReliquia(r); return `-3 ATK · +${r.nombre}`; }
          return 'Nada que forjar.';
        }}
      ]
    }
  ];

  function abrirEvento() {
    const ev = EVENTOS[rnd(0, EVENTOS.length - 1)];
    const panel = $('rpg-roguelike-panel');
    const card = document.createElement('div');
    card.className = 'rpg-rl-recompensa';
    card.innerHTML = `
      <div class="rpg-rl-recompensa-card">
        <h2>${ev.titulo}</h2>
        <p class="rpg-rl-evento-desc">${ev.desc}</p>
        <div class="rpg-rl-eleccion-lista">
          ${ev.ops.map((o, i) => `
            <button type="button" class="rpg-rl-opcion" data-i="${i}">
              <strong>${o.txt}</strong>
            </button>`).join('')}
        </div>
      </div>`;
    panel.appendChild(card);
    requestAnimationFrame(() => card.classList.add('active'));
    qsa('.rpg-rl-opcion', card).forEach(b => b.addEventListener('click', () => {
      const res = ev.ops[Number(b.dataset.i)].fn();
      card.classList.remove('active');
      setTimeout(() => {
        card.remove();
        mostrarRecompensa('Resultado', [res], () => completarSala());
      }, 250);
    }));
  }

  function completarSala() {
    state.salaActual = null;
    guardarRun(state);
    renderPanel();
  }

  function terminarRun() {
    state.vivo = false;
    const meta = cargarMeta();
    meta.runs++;
    meta.mejorPiso = Math.max(meta.mejorPiso, state.piso);
    guardarMeta(meta);
    limpiarRun();
    state = null;
    renderPanel();
  }

  /* ============================================================
     CANVAS DE BATALLA
     ============================================================ */
  function BatallaCanvas(canvas) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.texts = [];
    this.enemyShake = 0;
    this.heroShake = 0;
    this.flash = 0;
    this.raf = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = canvas.clientWidth || 600;
    this.H = canvas.clientHeight || 260;
    canvas.width = this.W * dpr;
    canvas.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.last = performance.now();
    this._loop = this._loop.bind(this);
    canvas._batallaAnim = this;
    this.sprites = { hero: null };
    const m = MASCOTAS[state.mascota] || {};
    if (m.imagen) { const i = new Image(); i.onload = () => { this.sprites.hero = i; }; i.src = m.imagen; }
    this.raf = requestAnimationFrame(this._loop);
  }
  BatallaCanvas.prototype.playAttack = function (fxKey, dmg, crit) {
    const heroX = this.W * 0.22, heroY = this.H * 0.55;
    const enX = this.W * 0.78, enY = this.H * 0.5;
    const fx = window.RpgCanvas?.FX?.[fxKey] || {};
    this.particles.push({ kind:'proj', fx, fromX:heroX, fromY:heroY, toX:enX, toY:enY, x:heroX, y:heroY, t:0, dur:0.42 });
    setTimeout(() => {
      this.enemyShake = 0.35;
      this.flash = crit ? 0.22 : 0.12;
      this.spawnBurst(enX, enY, crit ? 16 : 11, crit ? '#ffae3d' : '#ff5470');
      this.texts.push({ x:enX, y:enY-40, txt:'-'+dmg, color:crit?'#ffae3d':'#ff7a9c', size:crit?40:28, t:0, dur:1 });
    }, 400);
  };
  BatallaCanvas.prototype.playEnemyAttack = function (dmg) {
    const heroX = this.W * 0.22, heroY = this.H * 0.55;
    const enX = this.W * 0.78, enY = this.H * 0.5;
    this.particles.push({ kind:'proj', fx: window.RpgCanvas?.FX?.bolt || {}, fromX:enX, fromY:enY, toX:heroX, toY:heroY, x:enX, y:enY, t:0, dur:0.42 });
    setTimeout(() => {
      this.heroShake = 0.35;
      this.spawnBurst(heroX, heroY, 10, '#ff5470');
      this.texts.push({ x:heroX, y:heroY-40, txt:'-'+dmg, color:'#ff5470', size:28, t:0, dur:1 });
    }, 400);
  };
  BatallaCanvas.prototype.playHeal = function () {
    const heroX = this.W * 0.22, heroY = this.H * 0.55;
    this.spawnBurst(heroX, heroY, 14, '#4dd48e');
    this.texts.push({ x:heroX, y:heroY-40, txt:'+HP', color:'#4dd48e', size:30, t:0, dur:1.2 });
  };
  BatallaCanvas.prototype.playDodge = function () {
    const heroX = this.W * 0.22, heroY = this.H * 0.55;
    this.texts.push({ x:heroX, y:heroY-40, txt:'¡ESQUIVA!', color:'#a684f0', size:26, t:0, dur:1 });
  };
  BatallaCanvas.prototype.spawnBurst = function (x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 80;
      this.particles.push({ kind:'spark', x, y, vx:Math.cos(a)*d, vy:Math.sin(a)*d, t:0, dur:0.7, color, size:3 + Math.random() * 3 });
    }
  };
  BatallaCanvas.prototype._loop = function (now) {
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    const g = ctx.createRadialGradient(this.W/2, this.H/2, 0, this.W/2, this.H/2, this.W/1.4);
    g.addColorStop(0, state.enemigo?.phase === 2 ? 'rgba(255,84,112,0.18)' : 'rgba(255,217,61,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.W, this.H);
    ctx.strokeStyle = 'rgba(255,217,61,0.08)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { const y = this.H * 0.65 + i * 6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke(); }
    this._drawHero(ctx);
    this._drawEnemy(ctx);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.t += dt;
      const pr = p.t / p.dur;
      if (pr >= 1) { this.particles.splice(i, 1); continue; }
      if (p.kind === 'proj') {
        const e = 1 - Math.pow(1 - pr, 2.2);
        p.x = p.fromX + (p.toX - p.fromX) * e;
        p.y = p.fromY + (p.toY - p.fromY) * e - Math.sin(e * Math.PI) * 30;
        this._drawSpriteFx(ctx, p.fx, p.x, p.y, 42 * (1 - pr * 0.2), 0);
      } else if (p.kind === 'spark') {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 250 * dt;
        ctx.globalAlpha = 1 - pr;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - pr * 0.5), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.t += dt;
      const pr = t.t / t.dur;
      if (pr >= 1) { this.texts.splice(i, 1); continue; }
      const a = pr < 0.15 ? pr/0.15 : 1 - (pr - 0.15) / 0.85;
      const y = t.y - 60 * pr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = `900 ${t.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(t.txt, t.x, y);
      ctx.fillStyle = t.color; ctx.fillText(t.txt, t.x, y);
      ctx.restore();
    }
    if (this.enemyShake > 0) this.enemyShake = Math.max(0, this.enemyShake - dt);
    if (this.heroShake > 0) this.heroShake = Math.max(0, this.heroShake - dt);
    if (this.flash > 0) { this.flash = Math.max(0, this.flash - dt); ctx.fillStyle = `rgba(255,255,255,${this.flash})`; ctx.fillRect(0, 0, this.W, this.H); }
    this.raf = requestAnimationFrame(this._loop);
  };
  BatallaCanvas.prototype._drawHero = function (ctx) {
    const x = this.W * 0.22 + (this.heroShake > 0 ? (Math.random() - 0.5) * 12 : 0);
    const y = this.H * 0.55;
    ctx.save(); ctx.translate(x, y);
    if (this.sprites.hero) { ctx.imageSmoothingEnabled = false; ctx.drawImage(this.sprites.hero, -55, -55, 110, 110); }
    else { ctx.font = '80px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🐾', 0, 0); }
    ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 60, 45, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  BatallaCanvas.prototype._drawEnemy = function (ctx) {
    const e = state.enemigo; if (!e) return;
    const x = this.W * 0.78 + (this.enemyShake > 0 ? (Math.random() - 0.5) * 14 : 0);
    const y = this.H * 0.5;
    ctx.save(); ctx.translate(x, y);
    if (e.phase === 2) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
      g.addColorStop(0, 'rgba(255,84,112,0.5)');
      g.addColorStop(1, 'rgba(255,84,112,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = '90px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(e.ico || '👹', 0, 0);
    ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y + 60, 50, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  BatallaCanvas.prototype._drawSpriteFx = function (ctx, fx, x, y, size, rot) {
    ctx.save(); ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (fx.tint) {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      g.addColorStop(0, fx.tint + 'aa'); g.addColorStop(1, fx.tint + '00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
    }
    if (fx.sheet && window.RpgCanvas?.SHEETS?.[fx.sheet]?.img) {
      const s = window.RpgCanvas.SHEETS[fx.sheet];
      const cw = s.img.naturalWidth / s.cols;
      const ch = s.img.naturalHeight / s.rows;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(s.img, fx.col * cw, fx.row * ch, cw, ch, -size/2, -size/2, size, size);
    } else {
      ctx.fillStyle = fx.tint || '#ffd93d';
      ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  /* ============================================================
     API pública
     ============================================================ */
  window.RpgRoguelike = {
    abrir() { inyectarSeccion(); const p = $('rpg-roguelike-panel'); if (p) p.style.display = 'block'; renderPanel(); },
    cerrar() { const p = $('rpg-roguelike-panel'); if (p) p.style.display = 'none'; },
    reset() { limpiarRun(); state = null; renderPanel(); },
    state: () => state,
    RELIQUIAS, ENEMIGOS_RL, MALDICIONES
  };

  setTimeout(() => {
    const tabs = qs('.rpg-tabs');
    if (tabs && !qs('[data-rpg-tab="roguelike"]')) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rpg-tab'; b.dataset.rpgTab = 'roguelike';
      b.innerHTML = '<span class="rpg-tab-icon">🎲</span><span class="rpg-tab-text">Roguelike</span>';
      b.addEventListener('click', () => {
        qsa('.rpg-tab').forEach(x => x.classList.toggle('active', x === b));
        qsa('.rpg-panel').forEach(p => p.classList.toggle('active', false));
        window.RpgRoguelike.abrir();
      });
      tabs.appendChild(b);
    }
  }, 1200);

  console.log('✅ rpg-roguelike.js v2 HARDCORE listo');
})();