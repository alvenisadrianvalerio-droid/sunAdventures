/* ============================================================
   DESAFIOS-DIARIOS.JS — Sistema de Misiones Diarias Rotativas + Racha Semanal
   · Pool dinámico de 9 misiones que rotan según el día
   · Cofre Bonus Diario al completar las 3 misiones del día
   · Racha de 7 Días con Gran Cofre Solar Semanal (+250 🪙 · +150 XP)
   ============================================================ */
(function () {
  "use strict";

  const hoy = () => new Date().toISOString().slice(0, 10);
  const getUsuario = () =>
    window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local";
  const clave = () => `sa_misiones_diarias_v2_${getUsuario()}`;
  const claveRacha = () => `sa_misiones_racha_v1_${getUsuario()}`;

  const POOL_MISIONES = [
    // Slot 0: Juegos y Recreación
    [
      {
        id: "minijuegos",
        titulo: "Minijuegos del Día",
        desc: "Prueba 2 minijuegos distintos hoy",
        icono: "img/dashboard/card-minijuegos.svg",
        meta: 2,
        monedas: 35,
        xp: 30
      },
      {
        id: "minijuegos_3",
        titulo: "Maratón Arcade",
        desc: "Disfruta 3 minijuegos en el Salón Arcade",
        icono: "img/dashboard/card-minijuegos.svg",
        meta: 3,
        monedas: 50,
        xp: 40
      },
      {
        id: "sabiduria",
        titulo: "Curiosidad y Saberes",
        desc: "Aprende la Palabra del Día, cocina una receta o juega 1 minijuego",
        icono: "img/dashboard/card-diccionario.svg",
        meta: 1,
        monedas: 40,
        xp: 35
      }
    ],
    // Slot 1: Pareja, Mascota y Recuerdos
    [
      {
        id: "vinculo",
        titulo: "Amor y Santuario",
        desc: "Envía amor a tu pareja o acaricia 10 veces a tu mascota",
        icono: "img/dashboard/card-mascotas.svg",
        meta: 1,
        monedas: 40,
        xp: 35
      },
      {
        id: "pareja_plan",
        titulo: "Detalles del Corazón",
        desc: "Envía cariño a tu pareja, agenda un plan o escribe una nota",
        icono: "img/dashboard/card-calendario.svg",
        meta: 1,
        monedas: 45,
        xp: 40
      },
      {
        id: "mimos_20",
        titulo: "Cuidado del Santuario",
        desc: "Haz 15 caricias a tu mascota o envía amor a tu pareja",
        icono: "img/dashboard/card-mascotas.svg",
        meta: 1,
        monedas: 45,
        xp: 35
      }
    ],
    // Slot 2: Aventura RPG y Falla Astral
    [
      {
        id: "aventura",
        titulo: "Caza en Aventura",
        desc: "Derrota 5 enemigos en Aventura o Falla Astral",
        icono: "img/dashboard/card-aventura.svg",
        meta: 5,
        monedas: 50,
        xp: 45
      },
      {
        id: "aventura_8",
        titulo: "Guardián Implacable",
        desc: "Derrota 8 criaturas en el Modo Aventura RPG",
        icono: "img/dashboard/card-aventura.svg",
        meta: 8,
        monedas: 65,
        xp: 55
      },
      {
        id: "explorador",
        titulo: "Exploración Heroica",
        desc: "Vence a 3 enemigos en RPG o juega 2 minijuegos",
        icono: "img/dashboard/card-roguelike.svg",
        meta: 3,
        monedas: 45,
        xp: 40
      }
    ]
  ];

  function obtenerMisionesDeHoy() {
    const fechaStr = hoy();
    const seed = fechaStr.split("-").reduce((acc, n) => acc + Number(n), 0);
    return [
      POOL_MISIONES[0][seed % POOL_MISIONES[0].length],
      POOL_MISIONES[1][(seed + 1) % POOL_MISIONES[1].length],
      POOL_MISIONES[2][(seed + 2) % POOL_MISIONES[2].length]
    ];
  }

  const BONUS_COFRE = { monedas: 75, xp: 60 };
  const BONUS_RACHA_7 = { monedas: 250, xp: 150 };

  function cargarRacha() {
    try {
      const r = JSON.parse(localStorage.getItem(claveRacha()) || "null");
      if (r && typeof r === "object") {
        return { dias: Math.max(0, Number(r.dias) || 0), ultimaFecha: r.ultimaFecha || "" };
      }
    } catch {}
    return { dias: 0, ultimaFecha: "" };
  }

  function registrarDiaEnRacha() {
    const r = cargarRacha();
    const h = hoy();
    if (r.ultimaFecha === h) return r;
    const ayerDate = new Date();
    ayerDate.setDate(ayerDate.getDate() - 1);
    const ayer = ayerDate.toISOString().slice(0, 10);
    const nuevosDias = (r.ultimaFecha === ayer) ? (r.dias + 1) : 1;
    const actualizado = { dias: nuevosDias, ultimaFecha: h };
    try { localStorage.setItem(claveRacha(), JSON.stringify(actualizado)); } catch {}
    return actualizado;
  }

  const nombreJuego = id => {
    const conocidos = {
      "juego-girasol-overlay": "Atrapa el girasol",
      "juego-memoria-overlay": "Memoria",
      "juego-adivina-overlay": "Adivina la mascota"
    };
    return conocidos[id] || id
      .replace(/^juego-/, "")
      .replace(/-overlay$/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, letra => letra.toUpperCase());
  };

  function obtenerEnemigosActuales() {
    try {
      const u = getUsuario();
      const pet = localStorage.getItem("mascota_actual") || "mapache";
      const raw = localStorage.getItem(`sa_rpg_${u}_${pet}`) || localStorage.getItem(`sa_rpg_${u}`);
      if (!raw) return 0;
      const d = JSON.parse(raw);
      return Number(d.enemigosDerrotados || 0);
    } catch { return 0; }
  }

  function obtenerAmorYClicksActuales() {
    try {
      const u = getUsuario();
      const amor = Number(localStorage.getItem(`sa_amor_pareja_${u}`) || 0);
      const pet = localStorage.getItem("mascota_actual") || "mapache";
      const clicks = Number(localStorage.getItem(`mascota_clicks_${u}_${pet}`) || 0);
      return { amor, clicks };
    } catch { return { amor: 0, clicks: 0 }; }
  }

  function cargarEstado() {
    const baseEnemigos = obtenerEnemigosActuales();
    const baseVinculo = obtenerAmorYClicksActuales();
    try {
      const guardado = JSON.parse(localStorage.getItem(clave()) || "null");
      if (guardado?.fecha === hoy()) {
        return {
          fecha: hoy(),
          juegos: Array.isArray(guardado.juegos) ? [...new Set(guardado.juegos)] : [],
          baseEnemigos: Number.isFinite(guardado.baseEnemigos) ? guardado.baseEnemigos : baseEnemigos,
          enemigosHoy: Math.max(0, Number(guardado.enemigosHoy || 0)),
          baseAmor: Number.isFinite(guardado.baseAmor) ? guardado.baseAmor : baseVinculo.amor,
          baseClicks: Number.isFinite(guardado.baseClicks) ? guardado.baseClicks : baseVinculo.clicks,
          vinculoCompletado: Boolean(guardado.vinculoCompletado),
          reclamados: guardado.reclamados || {},
          cofreBonusReclamado: Boolean(guardado.cofreBonusReclamado)
        };
      }
    } catch (error) {
      console.warn("No se pudo leer misiones diarias:", error);
    }
    const inicial = {
      fecha: hoy(),
      juegos: [],
      baseEnemigos,
      enemigosHoy: 0,
      baseAmor: baseVinculo.amor,
      baseClicks: baseVinculo.clicks,
      vinculoCompletado: false,
      reclamados: {},
      cofreBonusReclamado: false
    };
    guardarEstado(inicial);
    return inicial;
  }

  function guardarEstado(estado) {
    try {
      localStorage.setItem(clave(), JSON.stringify(estado));
      return true;
    } catch { return false; }
  }

  function sincronizarProgreso(estado = cargarEstado()) {
    let cambio = false;

    // 1. Detectar minijuego activo
    const overlay = document.querySelector(".minijuego-overlay.active[id]");
    if (overlay && !estado.juegos.includes(overlay.id)) {
      estado.juegos.push(overlay.id);
      cambio = true;
    }

    // 2. Detectar progreso de vínculo (amor enviado o +10 clics a mascota hoy)
    const vinc = obtenerAmorYClicksActuales();
    if (!estado.vinculoCompletado) {
      if (vinc.amor > estado.baseAmor || (vinc.clicks - estado.baseClicks) >= 10) {
        estado.vinculoCompletado = true;
        cambio = true;
      }
    }

    // 3. Detectar enemigos derrotados en Aventura hoy
    const enemActual = obtenerEnemigosActuales();
    const deltaEnem = Math.max(0, enemActual - estado.baseEnemigos);
    if (deltaEnem > estado.enemigosHoy) {
      estado.enemigosHoy = deltaEnem;
      cambio = true;
    }

    if (cambio) guardarEstado(estado);
    return estado;
  }

  function obtenerProgresoMision(misionId, estado) {
    if (misionId === "minijuegos") return Math.min(2, estado.juegos.length);
    if (misionId === "minijuegos_3") return Math.min(3, estado.juegos.length);
    if (misionId === "sabiduria") {
      const u = getUsuario();
      const aprendioHoy = localStorage.getItem(`sa_dic_palabra_dia_${u}`) === hoy();
      return (aprendioHoy || estado.juegos.length >= 1) ? 1 : 0;
    }
    if (misionId === "vinculo" || misionId === "pareja_plan" || misionId === "mimos_20") {
      return estado.vinculoCompletado ? 1 : 0;
    }
    if (misionId === "aventura") return Math.min(5, estado.enemigosHoy);
    if (misionId === "aventura_8") return Math.min(8, estado.enemigosHoy);
    if (misionId === "explorador") return Math.min(3, Math.max(estado.enemigosHoy, estado.juegos.length * 2));
    return 0;
  }

  function render(estado = sincronizarProgreso()) {
    const MISIONES_DEF = obtenerMisionesDeHoy();
    const rachaInfo = cargarRacha();
    // 1. Render en vista Minijuegos (#desafio-minijuegos)
    const cardMinijuegos = document.getElementById("desafio-minijuegos");
    if (cardMinijuegos) {
      const mJuegos = MISIONES_DEF[0];
      const progJ = obtenerProgresoMision(mJuegos.id, estado);
      const compJ = Boolean(estado.reclamados[mJuegos.id]);
      const barra = document.getElementById("desafio-minijuegos-progreso");
      const medidor = cardMinijuegos.querySelector('[role="progressbar"]');
      const mensaje = document.getElementById("desafio-minijuegos-estado");
      const juegos = document.getElementById("desafio-minijuegos-juegos");

      if (barra) barra.style.width = `${(progJ / mJuegos.meta) * 100}%`;
      if (medidor) medidor.setAttribute("aria-valuenow", String(progJ));
      if (mensaje) {
        mensaje.textContent = compJ
          ? "¡Reto completado!"
          : `${progJ} de ${mJuegos.meta} (${mJuegos.titulo})`;
      }
      if (juegos) {
        if (compJ) {
          juegos.textContent = `¡Buen trabajo! Recibiste ${mJuegos.monedas} SunCoins y ${mJuegos.xp} XP.`;
        } else if (estado.juegos.length) {
          juegos.textContent = `Probaste: ${estado.juegos.map(nombreJuego).join(" · ")}.`;
        } else {
          juegos.textContent = mJuegos.desc;
        }
      }
      cardMinijuegos.classList.toggle("completado", compJ);
    }

    // 2. Render en Widget Bento del Dashboard (#bento-reto-diario)
    const cardBento = document.getElementById("bento-reto-diario");
    if (!cardBento) return;

    // Encontrar la misión activa actual (primera sin reclamar, o mostrar el Cofre Bonus si las 3 están reclamadas)
    const misionPendienteReclamar = MISIONES_DEF.find(m => !estado.reclamados[m.id] && obtenerProgresoMision(m.id, estado) >= m.meta);
    const misionEnCurso = misionPendienteReclamar || MISIONES_DEF.find(m => !estado.reclamados[m.id]) || MISIONES_DEF[0];
    const totalReclamadas = MISIONES_DEF.filter(m => estado.reclamados[m.id]).length;
    const todasCompletadas = totalReclamadas === MISIONES_DEF.length;

    const barraBento = document.getElementById("bento-reto-progreso");
    const conteoBento = document.getElementById("bento-reto-conteo");
    const descBento = document.getElementById("bento-reto-desc");
    const btnReclamar = document.getElementById("btn-bento-reto-reclamar");
    const tituloBento = cardBento.querySelector(".bento-reto-title-left .bento-rank-name");
    const imgIcono = cardBento.querySelector(".bento-reto-icon-accent img");
    const badgeEl = cardBento.querySelector(".bento-badge-amber");
    const recEl = cardBento.querySelector(".bento-reto-recompensa");

    if (badgeEl) {
      badgeEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Misiones (${totalReclamadas}/3) · 🔥 Racha ${rachaInfo.dias}d
      `;
    }

    if (todasCompletadas) {
      const listoCofre = !estado.cofreBonusReclamado;
      if (tituloBento) tituloBento.textContent = "Cofre Diario Solar";
      if (conteoBento) conteoBento.textContent = "3/3";
      if (imgIcono) imgIcono.src = "img/logros/rpg-cofres-50.svg";
      if (barraBento) barraBento.style.width = "100%";
      if (recEl) {
        recEl.innerHTML = `<img src="img/items%20de%20aventura/icon.webp" alt="SunCoins" width="14" height="14"><span>+${BONUS_COFRE.monedas}</span><img src="img/items%20de%20aventura/estrella.webp" alt="XP" width="14" height="14"><span>+${BONUS_COFRE.xp}</span>`;
      }
      if (descBento) {
        descBento.textContent = listoCofre
          ? "¡Completaste las 3 misiones de hoy! Reclama tu Cofre Solar extra."
          : "¡Has completado todas las misiones y el Cofre Solar de hoy! Vuelve mañana.";
      }
      if (btnReclamar) {
        btnReclamar.disabled = !listoCofre;
        btnReclamar.classList.toggle("reclamable", listoCofre);
        btnReclamar.classList.toggle("completado", !listoCofre);
        btnReclamar.innerHTML = listoCofre
          ? `<span>🎁 Abrir Cofre (+${BONUS_COFRE.monedas} 🪙)</span>`
          : `<span>✓ Todo Reclamado</span>`;
      }
      cardBento.classList.toggle("reto-completado", !listoCofre);
      cardBento.classList.toggle("reto-listo", listoCofre);
      return;
    }

    const prog = obtenerProgresoMision(misionEnCurso.id, estado);
    const listo = prog >= misionEnCurso.meta;

    if (tituloBento) tituloBento.textContent = misionEnCurso.titulo;
    if (conteoBento) conteoBento.textContent = `${prog}/${misionEnCurso.meta}`;
    if (imgIcono) imgIcono.src = misionEnCurso.icono;
    if (barraBento) barraBento.style.width = `${Math.min(100, (prog / misionEnCurso.meta) * 100)}%`;
    if (recEl) {
      recEl.innerHTML = `<img src="img/items%20de%20aventura/icon.webp" alt="SunCoins" width="14" height="14"><span>+${misionEnCurso.monedas}</span><img src="img/items%20de%20aventura/estrella.webp" alt="XP" width="14" height="14"><span>+${misionEnCurso.xp}</span>`;
    }
    if (descBento) {
      descBento.textContent = listo
        ? `¡Misión cumplida! Reclama +${misionEnCurso.monedas} SunCoins y +${misionEnCurso.xp} XP.`
        : `${misionEnCurso.desc} (+${misionEnCurso.monedas} SunCoins y +${misionEnCurso.xp} XP).`;
    }
    if (btnReclamar) {
      btnReclamar.disabled = !listo;
      btnReclamar.classList.toggle("reclamable", listo);
      btnReclamar.classList.remove("completado");
      btnReclamar.innerHTML = listo
        ? `<span>✨ Reclamar Premio</span>`
        : `<span>${prog}/${misionEnCurso.meta} En curso</span>`;
    }
    cardBento.classList.remove("reto-completado");
    cardBento.classList.toggle("reto-listo", listo);
  }

  function entregarMonedasYXp(monedas, xp) {
    const u = getUsuario();
    const xpKey = `sa_experiencia_extra_${u}`;
    const xpActual = Math.max(0, Number(localStorage.getItem(xpKey)) || 0);
    localStorage.setItem(xpKey, String(xpActual + xp));
    if (typeof window._getMonedas === "function" && typeof window._setMonedas === "function") {
      window._setMonedas(window._getMonedas() + monedas);
    } else {
      const mKey = `monedas_${u}`;
      localStorage.setItem(mKey, String((Number(localStorage.getItem(mKey)) || 0) + monedas));
    }
  }

  function reclamarPremio() {
    const MISIONES_DEF = obtenerMisionesDeHoy();
    const estado = sincronizarProgreso();
    const misionLista = MISIONES_DEF.find(m => !estado.reclamados[m.id] && obtenerProgresoMision(m.id, estado) >= m.meta);

    if (misionLista) {
      entregarMonedasYXp(misionLista.monedas, misionLista.xp);
      estado.reclamados[misionLista.id] = true;
      guardarEstado(estado);
      render(estado);
      window.dispatchEvent(new Event("sunad:progress"));
      window._snd?.("victoria");
      window.SunModal?.alert({
        title: `¡${misionLista.titulo} Completada!`,
        message: `Recibiste <strong>+${misionLista.monedas} SunCoins</strong> y <strong>+${misionLista.xp} XP</strong>.`,
        variant: "success",
        icon: `<img src="img/dashboard/card-logros.svg" alt="Trofeo" style="width:42px;height:42px;display:block;object-fit:contain;">`,
        confirmText: "¡Genial!"
      });
      return;
    }

    const todasReclamadas = MISIONES_DEF.every(m => estado.reclamados[m.id]);
    if (todasReclamadas && !estado.cofreBonusReclamado) {
      const rachaActual = registrarDiaEnRacha();
      const esSeptimoDia = rachaActual.dias > 0 && rachaActual.dias % 7 === 0;
      const totalMonedas = BONUS_COFRE.monedas + (esSeptimoDia ? BONUS_RACHA_7.monedas : 0);
      const totalXp = BONUS_COFRE.xp + (esSeptimoDia ? BONUS_RACHA_7.xp : 0);

      entregarMonedasYXp(totalMonedas, totalXp);
      estado.cofreBonusReclamado = true;
      guardarEstado(estado);
      render(estado);
      window.dispatchEvent(new Event("sunad:progress"));
      window._snd?.("fanfarria") || window._snd?.("victoria");
      window.SunModal?.alert({
        title: esSeptimoDia ? "¡Gran Cofre Mítico de Racha 7 Días!" : "¡Cofre Diario Solar Abierto!",
        message: esSeptimoDia
          ? `¡Increíble! Alcanzaste <strong>${rachaActual.dias} días de racha</strong> completando todas tus misiones.<br><br>Bono Mítico: <strong>+${totalMonedas} SunCoins</strong> y <strong>+${totalXp} XP</strong>.`
          : `¡Completaste las 3 misiones del día (Racha: <strong>${rachaActual.dias} día(s)</strong>)! Recibiste un bono extra de <strong>+${totalMonedas} SunCoins</strong> y <strong>+${totalXp} XP</strong>.`,
        variant: "success",
        icon: `<img src="${esSeptimoDia ? "img/logros/rpg-todas-miticas.svg" : "img/logros/rpg-cofres-50.svg"}" alt="Cofre" style="width:42px;height:42px;display:block;object-fit:contain;">`,
        confirmText: "¡Increíble!"
      });
    }
  }

  document.addEventListener("click", event => {
    const btn = event.target.closest("#btn-bento-reto-reclamar");
    if (btn && !btn.disabled) {
      reclamarPremio();
    }
  });

  window.addEventListener("sunad:progress", () => render());
  window.addEventListener("sunad:user-ready", () => render());
  window.addEventListener("storage", event => {
    if (event.key === clave()) render();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => render(), { once: true });
  } else {
    render();
  }
})();
