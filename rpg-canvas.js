/* ============================================================
   RPG-CANVAS.JS — Motor visual con sprites (Ataques · Buffs ·
   Consumibles · Habilidades enemigas · Efectos de zonas)
   ============================================================ */
(function () {
  'use strict';
  const $  = id => document.getElementById(String(id).replace(/^#/, ''));
  const qs = (s, r = document) => r.querySelector(s);
  const SND = t => { try { window._snd?.(t); } catch {} };
  const rnd = (a, b) => Math.random() * (b - a) + a;

  /* ---------- Carga de sprite sheets ---------- */
  const SHEETS = {
    main:  { url: 'img/tienda/admurin-items.png', cols: 30, rows: 110, img: null },
    loot1: { url: 'img/rpg/loot-1.png',           cols: 8,  rows: 9,   img: null },
    loot2: { url: 'img/rpg/loot-2.png',           cols: 8,  rows: 9,   img: null }
  };

  function loadSheet(s) {
    return new Promise(res => {
      if (s.img) return res(s);
      const i = new Image();
      i.onload  = () => { s.img = i; res(s); };
      i.onerror = () => res(s);
      i.src = s.url;
    });
  }
  const loadAll = () => Promise.all(Object.values(SHEETS).map(loadSheet));

  /* ---------- Presets de FX (coordenadas basadas en loot1/loot2) ---------- */
  const FX = {
    /* Ataques cuerpo a cuerpo / proyectiles */
    slash:      { sheet:'loot1', col:0, row:0, w:64, h:64, tint:'#ffd93d' },
    fireball:   { sheet:'loot1', col:1, row:0, w:56, h:56, tint:'#ff6b35', trail:true },
    icebolt:    { sheet:'loot1', col:2, row:0, w:56, h:56, tint:'#6cb8ff', trail:true },
    arrow:      { sheet:'loot1', col:6, row:3, w:52, h:52, tint:'#4dd48e', trail:true },
    magic:      { sheet:'loot1', col:5, row:3, w:56, h:56, tint:'#a684f0', pulse:true },
    dagger:     { sheet:'loot2', col:2, row:1, w:52, h:52, tint:'#ff7a9c', trail:true },
    axe:        { sheet:'loot2', col:4, row:1, w:56, h:56, tint:'#ffae3d' },
    hammer:     { sheet:'loot2', col:1, row:2, w:58, h:58, tint:'#c9c9c9' },
    bolt:       { sheet:'loot2', col:3, row:3, w:52, h:52, tint:'#ffd93d', trail:true },
    shadow:     { sheet:'loot2', col:7, row:5, w:56, h:56, tint:'#a684f0', pulse:true },
    /* Impactos */
    hit:        { sheet:'loot1', col:1, row:9, w:58, h:58, tint:'#ff5470' },
    crit:       { sheet:'loot1', col:0, row:4, w:72, h:72, tint:'#ffae3d', pulse:true },
    /* Buffs */
    buffAtk:    { sheet:'loot1', col:0, row:5, w:52, h:52, tint:'#ff6b35' },
    buffDef:    { sheet:'loot1', col:6, row:5, w:52, h:52, tint:'#6cb8ff' },
    buffCrit:   { sheet:'loot1', col:1, row:5, w:52, h:52, tint:'#ffd93d' },
    buffEsq:    { sheet:'loot1', col:6, row:6, w:52, h:52, tint:'#a684f0' },
    /* Curaciones / consumibles */
    heal:       { sheet:'loot1', col:0, row:8, w:56, h:56, tint:'#4dd48e', pulse:true },
    potionRed:  { sheet:'loot1', col:3, row:0, w:56, h:56, tint:'#ff5470' },
    potionBlue: { sheet:'loot1', col:4, row:0, w:56, h:56, tint:'#6cb8ff' },
    potionGold: { sheet:'loot1', col:0, row:1, w:56, h:56, tint:'#ffd93d' },
    scroll:     { sheet:'loot1', col:4, row:4, w:52, h:52, tint:'#ffae3d' },
    /* Buffs enemigos */
    curse:      { sheet:'loot1', col:3, row:2, w:58, h:58, tint:'#a684f0', pulse:true },
    burn:       { sheet:'loot1', col:1, row:3, w:56, h:56, tint:'#ff6b35' },
    poison:     { sheet:'loot2', col:4, row:8, w:56, h:56, tint:'#4dd48e' },
    
    /* Nuevas auras */
auraSagrada:  { sheet:'loot1', col:0, row:7, w:72, h:72, tint:'#ffd93d', pulse:true },
auraOscura:   { sheet:'loot2', col:5, row:6, w:72, h:72, tint:'#a684f0', pulse:true },
auraFuego:    { sheet:'loot1', col:1, row:3, w:72, h:72, tint:'#ff6b35', pulse:true },
auraHielo:    { sheet:'loot1', col:2, row:0, w:72, h:72, tint:'#6cb8ff', pulse:true },
auraVeneno:   { sheet:'loot2', col:4, row:8, w:72, h:72, tint:'#4dd48e', pulse:true },
escudoMagico: { sheet:'loot1', col:6, row:6, w:80, h:80, tint:'#a684f0', pulse:true },
shieldBurst:  { sheet:'loot2', col:2, row:4, w:70, h:70, tint:'#a684f0', pulse:true },

  };

  /* ---------- Mapa rápido de habilidades → sprite ---------- */
  const HABILIDAD_FX = {
    zarpazo:'slash', 'robo':'dagger', 'escondite':'buffDef',
    'doble-mordida':'slash', 'cura-basura':'heal', 'tornado':'axe',
    'rayo-solar':'fireball', semillas:'poison', 'escudo-flor':'buffDef',
    eclipse:'shadow', bendicion:'heal', supernova:'fireball',
    'zarpazo-rapido':'slash', enfoque:'buffCrit', 'bola-pelo':'poison',
    'doble-garra':'dagger', lamida:'heal', 'furia-9':'slash',
    aranazo:'shadow', maldicion:'curse', camuflaje:'buffEsq',
    'mordida-sombra':'shadow', 'novena-vida':'heal', 'eclipse-felino':'shadow',
    embestida:'hammer', 'salsa-picante':'burn', 'queso-escudo':'buffDef',
    'doble-carne':'slash', combo:'heal', 'mega-burger':'hammer',
    cabezazo:'hammer', 'lana-gruesa':'buffDef', balido:'buffAtk',
    sueno:'heal', rebano:'buffAtk', torbellino:'slash',
    picotazo:'slash', aleteo:'buffEsq', 'pio-explosivo':'bolt',
    circulos:'slash', cuidado:'heal', tormenta:'bolt',
    patada:'slash', vista:'buffCrit', coz:'slash',
    aplastar:'hammer', sombrilla:'buffDef', 'caida-alta':'hammer',
    cuerno:'magic', 'polvo-estrellas':'magic', bendicion2:'buffAtk',
    arcoiris:'magic', 'cura-pura':'heal', juicio:'magic',
    brinquito:'slash', zanahoria:'heal', 'esquiva-agil':'buffEsq',
    'patada-rapida':'slash', madriguera:'buffDef', 'rafaga-saltos':'slash',
    chispita:'fireball', aliento:'burn', escamas:'buffDef',
    'bola-fuego':'fireball', regen:'heal', 'fuego-ancestral':'fireball',
    rugido:'curse', 'aliento-inf':'burn', 'sabiduria-m':'buffAtk',
    'lluvia-fuego':'fireball', 'cura-arcana':'heal', apocalipsis:'fireball',
    'ataque-basico':'slash'
  };

  /* ============================================================
     FX CANVAS — capa de efectos sobre un elemento padre
     ============================================================ */
  class FxCanvas {
    constructor(parent) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'rpg-fx-canvas';
      Object.assign(this.canvas.style, {
        position:'absolute', inset:'0', pointerEvents:'none', zIndex:'6'
      });
      if (getComputedStyle(parent).position === 'static')
        parent.style.position = 'relative';
      parent.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.texts = [];
      this.raf = null;
      this._resize = this._resize.bind(this);
      this._loop = this._loop.bind(this);
      window.addEventListener('resize', this._resize);
      this._resize();
    }

    _resize() {
      const p = this.canvas.parentElement;
      if (!p) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = p.clientWidth, h = p.clientHeight;
      this.canvas.width  = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width  = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = h;
    }

    /* --- spawns --- */
    projectile(fxKey, fromX, fromY, toX, toY, opts = {}) {
      const fx = FX[fxKey] || FX.slash;
      this.particles.push({
        kind:'projectile', fx, fromX, fromY, toX, toY,
        x:fromX, y:fromY, t:0, dur:opts.dur || 0.55
      });
      this._start();
    }
    burst(fxKey, x, y, count = 10, opts = {}) {
      const fx = FX[fxKey] || FX.hit;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + rnd(-0.4, 0.4);
        const d = rnd(50, 110);
        this.particles.push({
          kind:'burst', fx, x, y,
          vx: Math.cos(a) * d, vy: Math.sin(a) * d - 20,
          t:0, dur:opts.dur || 0.75, size:opts.size || 32,
          rot:rnd(0, 6.28), spin:rnd(-8, 8)
        });
      }
      this._start();
    }
    aura(fxKey, x, y, opts = {}) {
      const fx = FX[fxKey] || FX.heal;
      this.particles.push({
        kind:'aura', fx, x, y, t:0, dur:opts.dur || 1.3,
        size:opts.size || 86
      });
      this._start();
    }
    rise(fxKey, x, y, opts = {}) {
      const fx = FX[fxKey] || FX.potionRed;
      this.particles.push({
        kind:'rise', fx, x, y, t:0, dur:opts.dur || 1.1,
        size:opts.size || 52, vy:opts.vy || -95
      });
      this._start();
    }
    text(x, y, txt, color = '#ffd93d', size = 30) {
      this.texts.push({ x, y, txt, color, size, t:0, dur:1.15, vy:-70 });
      this._start();
    }

    _start() {
      if (this.raf) return;
      this._last = performance.now();
      this.raf = requestAnimationFrame(this._loop);
    }

    _loop(now) {
      const dt = Math.min((now - this._last) / 1000, 0.05);
      this._last = now;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.t += dt;
        const prog = p.t / p.dur;
        if (prog >= 1) { this.particles.splice(i, 1); continue; }
        this._drawP(ctx, p, prog);
      }
      for (let i = this.texts.length - 1; i >= 0; i--) {
        const t = this.texts[i];
        t.t += dt;
        const prog = t.t / t.dur;
        if (prog >= 1) { this.texts.splice(i, 1); continue; }
        const a = prog < 0.15 ? prog/0.15 : 1 - (prog - 0.15) / 0.85;
        const y = t.y + t.vy * (1 - Math.pow(1 - prog, 2));
        ctx.save();
        ctx.globalAlpha = Math.max(0, a);
        ctx.font = `900 ${t.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeText(t.txt, t.x, y);
        ctx.fillStyle = t.color;
        ctx.fillText(t.txt, t.x, y);
        ctx.restore();
      }

      if (this.particles.length || this.texts.length)
        this.raf = requestAnimationFrame(this._loop);
      else this.raf = null;
    }

    _drawP(ctx, p, prog) {
      const fx = p.fx;
      let x = p.x, y = p.y, size = p.size || fx.w || 48;
      let alpha = 1, rot = 0;

      if (p.kind === 'projectile') {
        const e = 1 - Math.pow(1 - prog, 2.2);
        x = p.fromX + (p.toX - p.fromX) * e;
        y = p.fromY + (p.toY - p.fromY) * e - Math.sin(e * Math.PI) * 34;
        if (fx.trail) {
          for (let i = 1; i <= 3; i++) {
            const tp = Math.max(0, e - i * 0.055);
            const tx = p.fromX + (p.toX - p.fromX) * tp;
            const ty = p.fromY + (p.toY - p.fromY) * tp - Math.sin(tp * Math.PI) * 34;
            ctx.globalAlpha = (0.32 / i) * (alpha = 1);
            this._blit(ctx, fx, tx, ty, size * (1 - i * 0.14), 0);
          }
          ctx.globalAlpha = 1;
        }
        if (prog > 0.92) alpha = (1 - prog) / 0.08;
      } else if (p.kind === 'burst') {
        x = p.x + p.vx * prog;
        y = p.y + p.vy * prog + 40 * prog * prog;
        alpha = 1 - prog;
        size = p.size * (0.7 + prog * 0.6);
        rot = p.rot + p.spin * prog;
      } else if (p.kind === 'aura') {
        alpha = Math.sin(prog * Math.PI);
        size = p.size * (0.75 + Math.sin(prog * Math.PI * 2) * 0.08 + prog * 0.45);
      } else if (p.kind === 'rise') {
        y = p.y + p.vy * prog;
        alpha = 1 - prog;
      }

      ctx.globalAlpha = Math.max(0, alpha);
      if (fx.pulse) size *= 1 + Math.sin(prog * Math.PI * 4) * 0.16;
      this._blit(ctx, fx, x, y, size, rot);
      ctx.globalAlpha = 1;
    }

    _blit(ctx, fx, x, y, size, rot) {
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      if (fx.tint) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        g.addColorStop(0, fx.tint + 'aa');
        g.addColorStop(1, fx.tint + '00');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      }
      const s = SHEETS[fx.sheet];
      if (s && s.img) {
        const cw = s.img.naturalWidth / s.cols;
        const ch = s.img.naturalHeight / s.rows;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.img, fx.col * cw, fx.row * ch, cw, ch,
                      -size/2, -size/2, size, size);
      } else {
        ctx.fillStyle = fx.tint || '#ffd93d';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    destroy() {
      window.removeEventListener('resize', this._resize);
      if (this.raf) cancelAnimationFrame(this.raf);
      this.canvas.remove();
    }
  }

  /* ============================================================
     Helper: obtener posiciones de los "fighters" en el DOM
     ============================================================ */
  function getHeroPos(fx) {
    const el = qs('#fighter-heroe .rpg-fighter-sprite') || qs('#sprite-heroe');
    if (!el || !fx.canvas.parentElement) return { x: 80, y: fx.H * 0.5 };
    const p = fx.canvas.parentElement.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2 - p.left, y: r.top + r.height/2 - p.top };
  }
  function getEnemyPos(fx) {
    const el = qs('#fighter-enemigo .rpg-fighter-sprite') || qs('#sprite-enemigo');
    if (!el || !fx.canvas.parentElement) return { x: fx.W - 80, y: fx.H * 0.5 };
    const p = fx.canvas.parentElement.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2 - p.left, y: r.top + r.height/2 - p.top };
  }

  /* ============================================================
     Hook automático: escucha eventos del RPG
     ============================================================ */
  let fxLayer = null;

  function ensureFxLayer() {
    const batalla = $('rpg-batalla');
    if (!batalla) { fxLayer = null; return null; }
    if (!batalla._fxCanvas) {
      batalla._fxCanvas = new FxCanvas(batalla);
    }
    fxLayer = batalla._fxCanvas;
    return fxLayer;
  }

  function attachBattleHooks() {
    // Cuando entra nueva batalla, aseguramos capa
    const obs = new MutationObserver(() => {
      if ($('rpg-batalla')) setTimeout(ensureFxLayer, 30);
    });
    obs.observe(document.body, { childList:true, subtree:true });

    // Escucha el log de combate para disparar efectos
    const logObs = new MutationObserver((muts) => {
      if (!fxLayer) ensureFxLayer();
      if (!fxLayer) return;
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        const txt = n.textContent || '';
        const cls = n.className || '';
        const hero = getHeroPos(fxLayer);
        const enemy = getEnemyPos(fxLayer);

        // Daño al enemigo (atacamos)
        if (cls.includes('daño') && txt.match(/daño|Atacas|golpe/i) && !txt.includes('te ataca')) {
          const esCrit = cls.includes('critico');
          fxLayer.projectile('slash', hero.x, hero.y, enemy.x, enemy.y, { dur: 0.4 });
          setTimeout(() => {
            fxLayer.burst(esCrit ? 'crit' : 'hit', enemy.x, enemy.y, esCrit ? 14 : 9);
            if (esCrit) fxLayer.text(enemy.x, enemy.y - 40, '¡CRÍTICO!', '#ffae3d', 34);
          }, 350);
        }
        // Daño al héroe (enemigo ataca)
        if (txt.match(/te ataca/i)) {
          fxLayer.projectile('bolt', enemy.x, enemy.y, hero.x, hero.y, { dur: 0.4 });
          setTimeout(() => fxLayer.burst('hit', hero.x, hero.y, 8), 350);
        }
        // Curación
        if (cls.includes('curar') && txt.match(/\+|cura/i)) {
          fxLayer.aura('heal', hero.x, hero.y, { dur: 1.2 });
        }
        // Buff
        if (txt.match(/buff|✨/i)) {
          fxLayer.aura('buffAtk', hero.x, hero.y, { dur: 1.1 });
        }
        // Daño indirecto
        if (txt.match(/Quemadura|☠|veneno/i)) {
          fxLayer.burst('burn', enemy.x, enemy.y, 6);
        }
      }));
    });

    const reattachLog = () => {
      const log = $('rpg-log');
      if (log && !log._fxBound) {
        log._fxBound = true;
        logObs.observe(log, { childList:true });
      }
    };

    // Reengancha cuando cambie la batalla
    new MutationObserver(reattachLog).observe(document.body, { childList:true, subtree:true });
    setTimeout(reattachLog, 600);
  }

  /* ============================================================
     API pública
     ============================================================ */
  window.RpgCanvas = {
    loadAll, FxCanvas, FX, SHEETS, HABILIDAD_FX,
    attachTo: (el) => el?._fxCanvas || new FxCanvas(el),
    fxFor: (habId) => FX[HABILIDAD_FX[habId]] || FX.slash,
    burstAt(target, fxKey, count) {
      const layer = ensureFxLayer();
      if (!layer) return;
      const pos = target === 'enemy' ? getEnemyPos(layer) : getHeroPos(layer);
      layer.burst(fxKey, pos.x, pos.y, count || 10);
    },
    textAt(target, txt, color) {
      const layer = ensureFxLayer();
      if (!layer) return;
      const pos = target === 'enemy' ? getEnemyPos(layer) : getHeroPos(layer);
      layer.text(pos.x, pos.y - 30, txt, color);
    }
  };

  loadAll().then(() => {
    console.log('✅ rpg-canvas.js — sprites cargados:', Object.keys(SHEETS).length);
    attachBattleHooks();
    setTimeout(ensureFxLayer, 500);
  });
})();