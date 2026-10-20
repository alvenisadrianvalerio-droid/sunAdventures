/* ============================================================
   RPG-POSTGAME.JS — Sistema Post-Game para el Modo Aventura
   El Reino Primordial / Falla Astral & Rematch de Jefes del Caos
   ============================================================ */
(() => {
  "use strict";

  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const SND = t => { try { window._snd?.(t); } catch { } };

  const POSTGAME_STORAGE_KEY = () => {
    const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
    return `sa_rpg_postgame_${uid}`;
  };

  const getPostGameState = () => {
    try {
      const raw = localStorage.getItem(POSTGAME_STORAGE_KEY());
      if (raw) return JSON.parse(raw);
    } catch { }
    return {
      fallaNivel: 1,
      fallaMaxNivel: 1,
      jefesCaosDerrotados: [],
      ascensiones: 0,
      prestigioPuntos: 0,
      bendiciones: {
        fuerzaAstral: 0,    // +3% daño por nivel
        armaduraCosmica: 0, // +3% defensa y +50 HP por nivel
        ojoTornasol: 0,     // +0.05% probabilidad de tornasol
        bendicionMonedas: 0 // +10% monedas de batalla
      }
    };
  };

  const savePostGameState = (st) => {
    try {
      localStorage.setItem(POSTGAME_STORAGE_KEY(), JSON.stringify(st));
    } catch { }
  };

  // Condición de desbloqueo del Post-Game:
  // Haber conquistado las 150 zonas o haber derrotado al jefe final (Kraken Abisal en vacio-10)
  const esPostGameDesbloqueado = () => {
    try {
      const rpgState = window.Rpg?.state?.();
      if (rpgState) {
        if ((rpgState.jefesDerrotados && rpgState.jefesDerrotados.includes("vacio-10")) ||
            (rpgState.zonasConquistadas && rpgState.zonasConquistadas.length >= 150)) {
          return true;
        }
      }
      const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
      const pet = localStorage.getItem("mascota_actual") || "mapache";
      const keys = [`sa_rpg_${uid}_${pet}`, `sa_rpg_${uid}`];
      const MASCOTAS = ["mapache","girasol","gatito","gatito-negro","hamburguesa","oveja","pollito","jirafa","unicornio","conejo","dragon-bebe","dragon-anciano"];
      MASCOTAS.forEach(m => keys.push(`sa_rpg_${uid}_${m}`));

      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if ((parsed.jefesDerrotados && parsed.jefesDerrotados.includes("vacio-10")) ||
                (parsed.zonasConquistadas && parsed.zonasConquistadas.length >= 150)) {
              return true;
            }
          } catch {}
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Afijos del Caos para los Jefes Ancestrales del Rematch
  const AFIJOS = [
    { id: "vampirismo", nombre: "Vampirismo Astral", icono: "🩸", desc: "El jefe drena 25% del daño que inflige para curarse." },
    { id: "furia", nombre: "Furia Primordial", icono: "🔥", desc: "Ataca con 35% más de furia y activa su fase enrage antes." },
    { id: "escudo_estelar", nombre: "Escudo Estelar", icono: "🛡️", desc: "Comienza con una barrera cósmica del 20% de su vida." },
    { id: "reflejo", nombre: "Espejo del Vacío", icono: "🪞", desc: "Refleja 15% de todo el daño que recibe de vuelta al atacante." },
    { id: "aceleracion", nombre: "Dilatación Temporal", icono: "⚡", desc: "Reduce en 1 turno el enfriamiento de sus habilidades especiales." },
    { id: "veneno_etereo", nombre: "Miasma Astral", icono: "☠️", desc: "Cada impacto te aplica 5 de miasma letal acumulativo por turno." }
  ];

  // Catálogo de Jefes del Caos para el Desafío Post-Game
  const JEFES_CAOS = [
    {
      id: "caos-arana",
      originalId: "reina-arana",
      nombre: "Reina Araña de la Falla Astral",
      titulo: "Matriarca del Vacío",
      sprite: "Bosses/arana.png",
      afijo: AFIJOS[0], // Vampirismo
      nivelReq: 50,
      hpBase: 16500,
      atkBase: 440,
      xpBase: 12500,
      monedasBase: 2800,
      recompensaDesc: "Cofre Celestial garantizado + Probabilidad x3 de Tornasol"
    },
    {
      id: "caos-golem",
      originalId: "golem-colosal",
      nombre: "Golem Cósmico Primigenio",
      titulo: "Guardián de la Materia Oscura",
      sprite: "Bosses/golem.png",
      afijo: AFIJOS[2], // Escudo estelar
      nivelReq: 50,
      hpBase: 24000,
      atkBase: 480,
      xpBase: 15000,
      monedasBase: 3400,
      recompensaDesc: "Cofre Celestial garantizado + 150 Puntos de Prestigio"
    },
    {
      id: "caos-dragon",
      originalId: "dragon-supremo",
      nombre: "Dragón del Fin de los Tiempos",
      titulo: "Devorador de Galaxias",
      sprite: "Bosses/dragon.png",
      afijo: AFIJOS[1], // Furia primordial
      nivelReq: 50,
      hpBase: 31000,
      atkBase: 560,
      xpBase: 19000,
      monedasBase: 4200,
      recompensaDesc: "Cofre Celestial + Multiplicador de Botín Épico"
    },
    {
      id: "caos-mago",
      originalId: "archimago-oscuro",
      nombre: "Archimago del Continuo Temporal",
      titulo: "Cronista de la Destrucción",
      sprite: "Bosses/mago.webp",
      afijo: AFIJOS[4], // Dilatación Temporal
      nivelReq: 50,
      hpBase: 38000,
      atkBase: 620,
      xpBase: 23000,
      monedasBase: 5200,
      recompensaDesc: "Reliquia del Vacío + Drop ultra alto de gemas"
    },
    {
      id: "caos-demonio",
      originalId: "demonio-ancestral",
      nombre: "Señor Demonio del Caos Absoluto",
      titulo: "Soberano de las Profundidades",
      sprite: "Bosses/demonio.png",
      afijo: AFIJOS[3], // Espejo del Vacío
      nivelReq: 50,
      hpBase: 46000,
      atkBase: 690,
      xpBase: 28000,
      monedasBase: 6500,
      recompensaDesc: "Cofre Celestial + Doble Premio en SunCoins"
    },
    {
      id: "caos-kraken",
      originalId: "kraken-abisal",
      nombre: "Kraken Cósmico Devorador de Mundos",
      titulo: "Némesis del Multiverso",
      sprite: "Bosses/kraken.png",
      afijo: AFIJOS[5], // Miasma Astral
      nivelReq: 50,
      hpBase: 58000,
      atkBase: 760,
      xpBase: 36000,
      monedasBase: 8500,
      recompensaDesc: "🌟 Máxima Gloria Post-Game + Título 'Vencedor del Multiverso'"
    }
  ];

  /* ------------------------------------------------------------
     Inyección de la Pestaña Post-Game en la barra de pestañas RPG
     ------------------------------------------------------------ */
  function inyectarTabPostGame() {
    const tabsContainer = qs(".rpg-tabs");
    if (!tabsContainer) return;
    if (tabsContainer.querySelector('[data-rpg-tab="postgame"]')) return;
    if (!esPostGameDesbloqueado()) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rpg-tab rpg-tab-postgame";
    btn.dataset.rpgTab = "postgame";
    btn.innerHTML = `
      <span class="rpg-tab-icon" aria-hidden="true">
        <img src="img/items%20de%20aventura/corona.png" alt="Post-Game" class="postgame-corona-shimmer">
      </span>
      <span class="rpg-tab-text">Falla Astral</span>
    `;

    // Insertar justo al lado de Zonas / Mapa
    const ref = tabsContainer.querySelector('[data-rpg-tab="mapa"]') || tabsContainer.children[1];
    if (ref) tabsContainer.insertBefore(btn, ref.nextSibling);
    else tabsContainer.appendChild(btn);

    // Evento de clic
    btn.addEventListener("click", () => {
      activarTabPostGame();
    });
  }

  function inyectarPanelPostGame() {
    const content = $("rpg-content");
    if (!content) return;
    let panel = qs('[data-rpg-panel="postgame"]', content);
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "rpg-panel rpg-panel-postgame";
      panel.dataset.rpgPanel = "postgame";
      content.appendChild(panel);
    }
    renderPanelPostGame(panel);
  }

  function activarTabPostGame() {
    const c = $("rpg-content");
    if (!c) return;
    window.RpgRoguelike?.cerrar?.();
    c.dataset.tabActiva = "postgame";
    qsa(".rpg-tab", c).forEach(t => t.classList.toggle("active", t.dataset.rpgTab === "postgame"));
    qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === "postgame"));
    inyectarPanelPostGame();
    SND("sparkle");
  }

  /* ------------------------------------------------------------
     Renderizado del Panel Post-Game
     ------------------------------------------------------------ */
  function renderPanelPostGame(panel) {
    if (!panel) panel = qs('[data-rpg-panel="postgame"]');
    if (!panel) return;

    const pgState = getPostGameState();
    const jefesCompletados = pgState.jefesCaosDerrotados.length;
    const totalJefes = JEFES_CAOS.length;
    const progresoPct = Math.round((jefesCompletados / totalJefes) * 100);

    const bonusFuerza = (pgState.bendiciones.fuerzaAstral || 0) * 3;
    const bonusArmadura = (pgState.bendiciones.armaduraCosmica || 0) * 3;
    const bonusHp = (pgState.bendiciones.armaduraCosmica || 0) * 50;
    const bonusTornasol = ((pgState.bendiciones.ojoTornasol || 0) * 0.05).toFixed(2);
    const bonusMonedas = (pgState.bendiciones.bendicionMonedas || 0) * 10;

    panel.innerHTML = `
      <div class="rpg-postgame-wrap">
        <!-- Hero Banner Astral -->
        <header class="rpg-postgame-hero">
          <div class="rpg-postgame-badge-top">🌌 CONTENIDO POST-GAME DESBLOQUEADO</div>
          <h2 class="rpg-postgame-title">La Falla Astral del Caos</h2>
          <p class="rpg-postgame-subtitle">
            Has completado las 15 regiones del mundo y derrotado al Kraken Abisal.
            Ahora los jefes han renacido en el tejido dimensional, portando <strong>Afijos del Caos</strong> y recompensas legendarias con multiplicador cósmico de botín.
          </p>
          <div class="rpg-postgame-stats-ribbon">
            <div class="rpg-postgame-stat-card">
              <span class="rpg-postgame-stat-val">${pgState.fallaNivel}</span>
              <span class="rpg-postgame-stat-lbl">Piso de la Falla</span>
            </div>
            <div class="rpg-postgame-stat-card">
              <span class="rpg-postgame-stat-val">${jefesCompletados} / ${totalJefes}</span>
              <span class="rpg-postgame-stat-lbl">Jefes del Caos</span>
            </div>
            <div class="rpg-postgame-stat-card">
              <span class="rpg-postgame-stat-val">✨ ${pgState.prestigioPuntos}</span>
              <span class="rpg-postgame-stat-lbl">Puntos de Prestigio</span>
            </div>
            <div class="rpg-postgame-stat-card">
              <span class="rpg-postgame-stat-val">🌈 +${bonusTornasol}%</span>
              <span class="rpg-postgame-stat-lbl">Bonus Tornasol</span>
            </div>
          </div>
        </header>

        <!-- Sub-navegación Post-Game -->
        <div class="rpg-postgame-subtabs">
          <button type="button" class="rpg-pg-subtab active" data-pg-view="jefes">
            ⚔️ Rematch de Jefes Ancestrales (${jefesCompletados}/${totalJefes})
          </button>
          <button type="button" class="rpg-pg-subtab" data-pg-view="falla">
            🌀 Falla Infinita (Piso ${pgState.fallaNivel})
          </button>
          <button type="button" class="rpg-pg-subtab" data-pg-view="bendiciones">
            🌟 Altar de Ascensión Cósmica (${pgState.prestigioPuntos} pts)
          </button>
        </div>

        <!-- Vista 1: Jefes Ancestrales Rematch -->
        <div class="rpg-pg-section-view active" id="pg-view-jefes">
          <div class="rpg-pg-cards-grid">
            ${JEFES_CAOS.map((jefe, i) => {
              const derrotado = pgState.jefesCaosDerrotados.includes(jefe.id);
              const desbloqueado = i === 0 || pgState.jefesCaosDerrotados.includes(JEFES_CAOS[i - 1].id);
              const sprHtml = window.RpgData?.renderMobAnimado ? window.RpgData.renderMobAnimado(jefe.sprite, 80, "rpg-boss-anim-card") : `<img src="img/48x48/${jefe.sprite}" style="width:72px;height:72px;">`;

              return `
                <div class="rpg-boss-caos-card ${derrotado ? 'conquistado' : ''} ${desbloqueado ? '' : 'bloqueado'}">
                  <div class="rpg-boss-caos-top">
                    <span class="rpg-boss-tier-badge">DESAFÍO ${i + 1}</span>
                    <span class="rpg-boss-afijo-pill" title="${jefe.afijo.desc}">${jefe.afijo.icono} ${jefe.afijo.nombre}</span>
                  </div>
                  <div class="rpg-boss-sprite-zone">
                    ${sprHtml}
                  </div>
                  <div class="rpg-boss-info">
                    <h3 class="rpg-boss-name">${jefe.nombre}</h3>
                    <div class="rpg-boss-title">${jefe.titulo}</div>
                    <div class="rpg-boss-stats-row">
                      <span>❤️ ${jefe.hpBase.toLocaleString()} HP</span>
                      <span>⚔️ ${jefe.atkBase} ATK</span>
                      <span>⭐ +${jefe.xpBase.toLocaleString()} XP</span>
                    </div>
                    <p class="rpg-boss-afijo-desc">
                      <em>${jefe.afijo.desc}</em>
                    </p>
                    <div class="rpg-boss-loot-highlight">
                      🎁 ${jefe.recompensaDesc}
                    </div>
                  </div>
                  <div class="rpg-boss-footer">
                    ${derrotado ? `
                      <button type="button" class="rpg-btn-caos repetible" data-caos-id="${jefe.id}">
                        ⚡ Desafiar de nuevo
                      </button>
                    ` : desbloqueado ? `
                      <button type="button" class="rpg-btn-caos iniciar" data-caos-id="${jefe.id}">
                        ⚔️ Iniciar Duelo Cósmico
                      </button>
                    ` : `
                      <button type="button" class="rpg-btn-caos bloqueado" disabled>
                        🔒 Derrota al jefe anterior
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Vista 2: Falla Infinita -->
        <div class="rpg-pg-section-view" id="pg-view-falla" style="display:none;">
          <div class="rpg-falla-panel">
            <div class="rpg-falla-header">
              <div class="rpg-falla-orb">🌀</div>
              <div class="rpg-falla-copy">
                <h3>Ascensión a la Falla Infinita · Piso ${pgState.fallaNivel}</h3>
                <p>Enfréntate a oleadas cósmicas sin límite. Cada piso incrementa la resistencia y ferocidad de los enemigos un +8%, pero multiplica las monedas, la experiencia y la probabilidad de botines <strong>Míticos</strong> y <strong>Tornasol</strong>.</p>
                <div class="rpg-falla-multipliers">
                  <span class="falla-mult-tag">Dificultad: +${((pgState.fallaNivel - 1) * 8)}%</span>
                  <span class="falla-mult-tag oro">Oro: +${((pgState.fallaNivel - 1) * 15)}%</span>
                  <span class="falla-mult-tag tornasol">Drop Tornasol: x${(1 + (pgState.fallaNivel - 1) * 0.25).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div class="rpg-falla-actions">
              <button type="button" class="rpg-btn-falla-entrar" id="btn-entrar-falla">
                🌌 Entrar al Piso ${pgState.fallaNivel} de la Falla
              </button>
              ${pgState.fallaNivel > 1 ? `
                <button type="button" class="rpg-btn-falla-reset" id="btn-reset-falla">
                  🔄 Reiniciar desde Piso 1
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Vista 3: Altar de Ascensión Cósmica -->
        <div class="rpg-pg-section-view" id="pg-view-bendiciones" style="display:none;">
          <div class="rpg-altar-panel">
            <header class="rpg-altar-header">
              <h3>✨ Altar de Ascensión Cósmica</h3>
              <p>Canjea tus Puntos de Prestigio obtenidos derrotando Jefes del Caos y superando Pisos de la Falla para adquirir bendiciones permanentes que potencian a todas tus mascotas en la aventura.</p>
              <div class="rpg-altar-points-badge">
                Puntos de Prestigio Disponibles: <strong>${pgState.prestigioPuntos}</strong>
              </div>
            </header>

            <div class="rpg-bendiciones-grid">
              <!-- Fuerza Astral -->
              <div class="rpg-bendicion-card">
                <div class="rpg-bendicion-icon">⚔️</div>
                <div class="rpg-bendicion-info">
                  <h4>Fuerza Astral (Nv ${pgState.bendiciones.fuerzaAstral || 0})</h4>
                  <p>Incrementa todo tu daño físico y de habilidades un +3% por nivel.</p>
                  <small class="rpg-bendicion-status">Efecto actual: +${bonusFuerza}% ATK</small>
                </div>
                <button type="button" class="rpg-btn-bendicion" data-bendicion="fuerzaAstral" ${pgState.prestigioPuntos >= 50 ? '' : 'disabled'}>
                  Mejorar (50 pts)
                </button>
              </div>

              <!-- Armadura Cósmica -->
              <div class="rpg-bendicion-card">
                <div class="rpg-bendicion-icon">🛡️</div>
                <div class="rpg-bendicion-info">
                  <h4>Armadura Cósmica (Nv ${pgState.bendiciones.armaduraCosmica || 0})</h4>
                  <p>Aumenta tu defensa en +3% y otorga +50 HP máximos por nivel.</p>
                  <small class="rpg-bendicion-status">Efecto actual: +${bonusArmadura}% DEF y +${bonusHp} HP</small>
                </div>
                <button type="button" class="rpg-btn-bendicion" data-bendicion="armaduraCosmica" ${pgState.prestigioPuntos >= 50 ? '' : 'disabled'}>
                  Mejorar (50 pts)
                </button>
              </div>

              <!-- Ojo Tornasol -->
              <div class="rpg-bendicion-card tornasol">
                <div class="rpg-bendicion-icon">🌈</div>
                <div class="rpg-bendicion-info">
                  <h4>Ojo del Vacío Tornasol (Nv ${pgState.bendiciones.ojoTornasol || 0})</h4>
                  <p>Aumenta permanentemente la probabilidad de obtener items Tornasol en cofres y victorias.</p>
                  <small class="rpg-bendicion-status">Efecto actual: +${bonusTornasol}% Drop Tornasol</small>
                </div>
                <button type="button" class="rpg-btn-bendicion" data-bendicion="ojoTornasol" ${pgState.prestigioPuntos >= 100 ? '' : 'disabled'}>
                  Mejorar (100 pts)
                </button>
              </div>

              <!-- Bendición de la Fortuna -->
              <div class="rpg-bendicion-card">
                <div class="rpg-bendicion-icon">🪙</div>
                <div class="rpg-bendicion-info">
                  <h4>Fortuna Primordial (Nv ${pgState.bendiciones.bendicionMonedas || 0})</h4>
                  <p>Otorga +10% de monedas SunCoins extra en cada victoria del modo Aventura.</p>
                  <small class="rpg-bendicion-status">Efecto actual: +${bonusMonedas}% Oro</small>
                </div>
                <button type="button" class="rpg-btn-bendicion" data-bendicion="bendicionMonedas" ${pgState.prestigioPuntos >= 40 ? '' : 'disabled'}>
                  Mejorar (40 pts)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Manejar sub-tabs internas
    qsa(".rpg-pg-subtab", panel).forEach(b => {
      b.addEventListener("click", () => {
        qsa(".rpg-pg-subtab", panel).forEach(x => x.classList.toggle("active", x === b));
        const viewId = b.dataset.pgView;
        qsa(".rpg-pg-section-view", panel).forEach(sec => {
          sec.style.display = sec.id === `pg-view-${viewId}` ? "" : "none";
        });
        SND("blip");
      });
    });

    // Iniciar combate con Jefe del Caos
    qsa(".rpg-btn-caos:not([disabled])", panel).forEach(b => {
      b.addEventListener("click", () => {
        const jefeId = b.dataset.caosId;
        iniciarCombateJefeCaos(jefeId);
      });
    });

    // Botón Entrar a la Falla
    $("#btn-entrar-falla")?.addEventListener("click", () => {
      iniciarCombateFalla(pgState.fallaNivel);
    });

    // Botón Reset Falla
    $("#btn-reset-falla")?.addEventListener("click", () => {
      pgState.fallaNivel = 1;
      savePostGameState(pgState);
      renderPanelPostGame(panel);
      SND("blip");
    });

    // Botones de Bendiciones
    qsa(".rpg-btn-bendicion:not([disabled])", panel).forEach(b => {
      b.addEventListener("click", () => {
        const tipo = b.dataset.bendicion;
        comprarBendicion(tipo);
      });
    });
  }

  /* ------------------------------------------------------------
     Mecánica de Combate: Jefe del Caos
     ------------------------------------------------------------ */
  function iniciarCombateJefeCaos(jefeId) {
    const jefe = JEFES_CAOS.find(j => j.id === jefeId);
    if (!jefe) return;

    const pgState = getPostGameState();
    const bonusDanoHeroe = 1 + ((pgState.bendiciones.fuerzaAstral || 0) * 0.03);

    // Configurar enemigo especial para el motor de rpg.js
    const enemigoEspecial = {
      id: jefe.id,
      nombre: jefe.nombre,
      sprite: jefe.sprite,
      iconoKey: "corona",
      icono: "👑",
      hpMax: jefe.hpBase,
      hp: jefe.hpBase,
      atk: jefe.atkBase,
      xp: jefe.xpBase,
      monedas: jefe.monedasBase,
      jefe: true,
      miniJefe: false,
      esHorda: false,
      esPostGame: true,
      afijoCaos: jefe.afijo,
      dot: 0, dotDur: 0, sangrado: 0, sangradoDur: 0,
      shield: jefe.afijo.id === "escudo_estelar" ? Math.round(jefe.hpBase * 0.20) : 0,
      phase: 1,
      tier: 'jefe',
      special: jefe.afijo.id === "aceleracion" ? 'apocalypse' : 'firebreath',
      specialCD: jefe.afijo.id === "aceleracion" ? 1 : 2,
      specialTimer: 1
    };

    // Invocar combate usando el hook de rpg.js
    if (typeof window._rpgIniciarCombateDirecto === "function") {
      window._rpgIniciarCombateDirecto(enemigoEspecial, `Falla Astral · ${jefe.nombre}`);
    } else {
      // Fallback: simular zona y entrar
      const zonaSimulada = {
        id: jefe.id,
        nombre: jefe.nombre,
        desc: `🌌 JEFE DEL CAOS · ${jefe.afijo.nombre}`,
        icono: "👑",
        nivel: 50,
        enemigos: [jefe.originalId],
        hp: jefe.hpBase,
        atk: jefe.atkBase,
        xp: jefe.xpBase,
        monedas: jefe.monedasBase,
        jefe: true,
        miniJefe: false,
        region: "vacio",
        regionNombre: "Falla Astral",
        orden: 151
      };
      if (window.Rpg?.zonas) {
        const exist = window.Rpg.zonas.find(x => x.id === jefe.id);
        if (!exist) window.Rpg.zonas.push(zonaSimulada);
      }
      window._rpgEntrarZona?.(jefe.id);
    }
  }

  /* ------------------------------------------------------------
     Mecánica de Combate: Piso de la Falla Infinita
     ------------------------------------------------------------ */
  function iniciarCombateFalla(piso) {
    const escalado = 1 + (piso - 1) * 0.08;
    const hp = Math.round(8500 * escalado);
    const atk = Math.round(320 * escalado);
    const xp = Math.round(6000 * escalado);
    const mon = Math.round(1200 * (1 + (piso - 1) * 0.08));

    const eId = "orbinauta-vacio";
    const enemigoFalla = {
      id: `falla-mob-${piso}`,
      nombre: `Entidad del Vacío (Piso ${piso})`,
      sprite: "Orbinauts/Orbinaut 04 48.png",
      iconoKey: "corona",
      icono: "🌀",
      hpMax: hp,
      hp: hp,
      atk: atk,
      xp: xp,
      monedas: mon,
      jefe: (piso % 5 === 0),
      miniJefe: (piso % 5 !== 0),
      esHorda: false,
      esPostGame: true,
      esFallaInfinita: true,
      pisoFalla: piso,
      dot: 0, dotDur: 0, sangrado: 0, sangradoDur: 0, shield: 0, phase: 1, tier: 'elite',
      special: 'curse', specialCD: 2, specialTimer: 2
    };

    if (typeof window._rpgIniciarCombateDirecto === "function") {
      window._rpgIniciarCombateDirecto(enemigoFalla, `Falla Infinita · Piso ${piso}`);
    } else {
      const zId = `falla-piso-${piso}`;
      const zonaFalla = {
        id: zId,
        nombre: `Falla Infinita · Piso ${piso}`,
        desc: `🌀 Piso ${piso} de la Falla Astral`,
        icono: "🌀",
        nivel: 50 + piso,
        enemigos: [eId],
        hp: hp, atk: atk, xp: xp, monedas: mon,
        jefe: (piso % 5 === 0), miniJefe: (piso % 5 !== 0),
        region: "vacio", regionNombre: "Falla Astral", orden: 150 + piso
      };
      if (window.Rpg?.zonas) {
        const exist = window.Rpg.zonas.find(x => x.id === zId);
        if (!exist) window.Rpg.zonas.push(zonaFalla);
      }
      window._rpgEntrarZona?.(zId);
    }
  }

  /* ------------------------------------------------------------
     Compra de Bendiciones de Prestigio
     ------------------------------------------------------------ */
  function comprarBendicion(tipo) {
    const costes = {
      fuerzaAstral: 50,
      armaduraCosmica: 50,
      ojoTornasol: 100,
      bendicionMonedas: 40
    };
    const coste = costes[tipo] || 50;
    const st = getPostGameState();
    if (st.prestigioPuntos < coste) {
      SND("derrota");
      return;
    }
    st.prestigioPuntos -= coste;
    st.bendiciones[tipo] = (st.bendiciones[tipo] || 0) + 1;
    savePostGameState(st);
    SND("victoria");
    try { window.RpgParticulas?.flashRareza?.("#b0f5ff"); } catch { }
    renderPanelPostGame();
  }

  /* ------------------------------------------------------------
     Escucha de Victorias para Recompensas Post-Game
     ------------------------------------------------------------ */
  window.addEventListener("rpg:victoria", (e) => {
    const en = e.detail?.enemigo;
    if (!en) return;

    const st = getPostGameState();
    let huboCambio = false;

    // Si fue un Jefe del Caos
    if (en.afijoCaos && en.id) {
      if (!st.jefesCaosDerrotados.includes(en.id)) {
        st.jefesCaosDerrotados.push(en.id);
        st.prestigioPuntos += 100;
        huboCambio = true;
        try {
          window._darPremio?.(0, 50, "¡Jefe del Caos Derrotado!");
          window.RpgLoot?.agregarCofreInventario?.("celestial", 1);
        } catch { }
      } else {
        st.prestigioPuntos += 25; // Recompensa por repetición
        huboCambio = true;
      }
    }

    // Si fue un Piso de la Falla Infinita
    if (en.esFallaInfinita || en.pisoFalla) {
      const p = en.pisoFalla || st.fallaNivel;
      if (p >= st.fallaNivel) {
        st.fallaNivel = p + 1;
        st.fallaMaxNivel = Math.max(st.fallaMaxNivel, st.fallaNivel);
        st.prestigioPuntos += 15 + Math.floor(p * 2);
        huboCambio = true;
      }
    }

    // Si derrotó al Kraken de la campaña por primera vez (vacio-10), desbloquea Falla Astral
    if (en.zona === "vacio-10" || en.id === "kraken-abisal") {
      huboCambio = true;
      setTimeout(() => {
        inyectarBannerPostGameDesbloqueado();
        inyectarTabPostGame();
      }, 500);
    }

    if (huboCambio) {
      savePostGameState(st);
    }
  });

  /* ------------------------------------------------------------
     Banner visual en el Hub de Zonas cuando el Post-Game está activo
     ------------------------------------------------------------ */
  function inyectarBannerPostGameDesbloqueado() {
    if (!esPostGameDesbloqueado()) return;
    const hud = qs(".rpg-hud");
    if (!hud || qs("#rpg-postgame-portal-banner")) return;

    const banner = document.createElement("div");
    banner.id = "rpg-postgame-portal-banner";
    banner.className = "rpg-postgame-portal-banner";
    banner.innerHTML = `
      <div class="rpg-pg-banner-content">
        <div class="rpg-pg-banner-icon">🌌</div>
        <div class="rpg-pg-banner-text">
          <strong>¡La Falla Astral del Caos ha despertado!</strong>
          <span>Has conquistado el mundo base. Enfréntate a los Jefes Ancestrales del Caos y a la Falla Infinita.</span>
        </div>
        <button type="button" class="rpg-pg-banner-btn" id="btn-ir-postgame">
          Abrir Falla Astral ›
        </button>
      </div>
    `;

    hud.parentNode.insertBefore(banner, hud.nextSibling);
    banner.querySelector("#btn-ir-postgame")?.addEventListener("click", () => {
      activarTabPostGame();
    });
  }

  // Hook global y sinc
  window.RpgPostGame = {
    esDesbloqueado: esPostGameDesbloqueado,
    getState: getPostGameState,
    saveState: savePostGameState,
    abrir: activarTabPostGame,
    jefesCaos: JEFES_CAOS,
    afijos: AFIJOS
  };

  // Observador para inyectar pestaña y banners en el ciclo de vida de la vista RPG
  window.addEventListener("sunad:rpg-tab", (e) => {
    if (e.detail?.tab === "postgame") {
      inyectarPanelPostGame();
    } else {
      setTimeout(() => {
        inyectarTabPostGame();
        inyectarBannerPostGameDesbloqueado();
      }, 100);
    }
  });

  const _initCheck = setInterval(() => {
    if ($("rpg-content")) {
      inyectarTabPostGame();
      inyectarBannerPostGameDesbloqueado();
      clearInterval(_initCheck);
    }
  }, 400);

  console.log("✅ rpg-postgame.js cargado · Falla Astral & Jefes del Caos listos.");
})();
