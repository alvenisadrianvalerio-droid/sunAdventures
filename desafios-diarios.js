(function () {
  "use strict";

  const META = 2;
  const PREMIO_MONEDAS = 20;
  const PREMIO_XP = 25;
  const hoy = () => new Date().toISOString().slice(0, 10);
  const getUsuario = () =>
    window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local";
  const clave = () => `sa_minijuegos_desafio_${getUsuario()}`;
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

  function cargarEstado() {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave()) || "null");
      if (guardado?.fecha === hoy() && Array.isArray(guardado.juegos)) {
        return {
          fecha: hoy(),
          juegos: [...new Set(guardado.juegos.filter(id => typeof id === "string"))],
          reclamado: guardado.reclamado === true
        };
      }
    } catch (error) {
      console.warn("No se pudo leer el reto diario de minijuegos:", error);
    }
    return { fecha: hoy(), juegos: [], reclamado: false };
  }

  function guardarEstado(estado) {
    try {
      localStorage.setItem(clave(), JSON.stringify(estado));
      return true;
    } catch (error) {
      console.error("No se pudo guardar el progreso del reto diario:", error);
      return false;
    }
  }

  function render(estado = cargarEstado()) {
    const progreso = Math.min(estado.juegos.length, META);
    const completo = estado.reclamado;
    const listoParaReclamar = !completo && estado.juegos.length >= META;

    // 1. Render en vista Minijuegos
    const cardMinijuegos = document.getElementById("desafio-minijuegos");
    if (cardMinijuegos) {
      const barra = document.getElementById("desafio-minijuegos-progreso");
      const medidor = cardMinijuegos.querySelector('[role="progressbar"]');
      const mensaje = document.getElementById("desafio-minijuegos-estado");
      const juegos = document.getElementById("desafio-minijuegos-juegos");

      if (barra) barra.style.width = `${(progreso / META) * 100}%`;
      if (medidor) medidor.setAttribute("aria-valuenow", String(progreso));
      if (mensaje) {
        mensaje.textContent = completo
          ? "¡Reto completado!"
          : `${progreso} de ${META} minijuegos distintos`;
      }
      if (juegos) {
        if (completo) {
          juegos.textContent = `¡Buen trabajo! Recibiste ${PREMIO_MONEDAS} SunCoins y ${PREMIO_XP} XP.`;
        } else if (estado.juegos.length) {
          juegos.textContent = `Probaste: ${estado.juegos.map(nombreJuego).join(" · ")}.`;
        } else {
          juegos.textContent = "Completa cualquier minijuego para empezar.";
        }
      }
      cardMinijuegos.classList.toggle("completado", completo);
    }

    // 2. Render en Widget Bento del Dashboard / Lobby
    const cardBento = document.getElementById("bento-reto-diario");
    if (cardBento) {
      const barraBento = document.getElementById("bento-reto-progreso");
      const medidorBento = cardBento.querySelector('[role="progressbar"]');
      const conteoBento = document.getElementById("bento-reto-conteo");
      const descBento = document.getElementById("bento-reto-desc");
      const btnReclamar = document.getElementById("btn-bento-reto-reclamar");

      if (barraBento) barraBento.style.width = `${(progreso / META) * 100}%`;
      if (medidorBento) medidorBento.setAttribute("aria-valuenow", String(progreso));
      if (conteoBento) {
        conteoBento.textContent = `${progreso}/${META}`;
      }
      if (descBento) {
        if (completo) {
          descBento.textContent = "¡Completado hoy! Vuelve mañana por más recompensas.";
        } else if (listoParaReclamar) {
          descBento.textContent = "¡Meta cumplida! Reclama tus monedas y XP ahora.";
        } else if (estado.juegos.length === 1) {
          descBento.textContent = `1 minijuego listo. Falta 1 más para ganar +${PREMIO_MONEDAS} SunCoins.`;
        } else {
          descBento.textContent = `Prueba 2 minijuegos distintos hoy para ganar +${PREMIO_MONEDAS} SunCoins y +${PREMIO_XP} XP.`;
        }
      }

      if (btnReclamar) {
        if (completo) {
          btnReclamar.disabled = true;
          btnReclamar.classList.remove("reclamable");
          btnReclamar.classList.add("completado");
          btnReclamar.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Reclamado</span>
          `;
        } else if (listoParaReclamar) {
          btnReclamar.disabled = false;
          btnReclamar.classList.add("reclamable");
          btnReclamar.classList.remove("completado");
          btnReclamar.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>Reclamar</span>
          `;
        } else {
          btnReclamar.disabled = true;
          btnReclamar.classList.remove("reclamable", "completado");
          btnReclamar.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${progreso}/${META} Listo</span>
          `;
        }
      }

      cardBento.classList.toggle("reto-completado", completo);
      cardBento.classList.toggle("reto-listo", listoParaReclamar);
    }
  }

  function reclamarPremio(estado = cargarEstado()) {
    if (estado.reclamado || estado.juegos.length < META) return;

    const xpKey = `sa_experiencia_extra_${getUsuario()}`;
    try {
      if (typeof window._getMonedas !== "function" || typeof window._setMonedas !== "function") {
        throw new Error("El monedero no está disponible.");
      }
      const xpActual = Math.max(0, Number(localStorage.getItem(xpKey)) || 0);
      localStorage.setItem(xpKey, String(xpActual + PREMIO_XP));
      window._setMonedas(window._getMonedas() + PREMIO_MONEDAS);
      estado.reclamado = true;
      if (!guardarEstado(estado)) {
        estado.reclamado = false;
        return;
      }
    } catch (error) {
      console.error("No se pudo entregar el premio del reto diario:", error);
      return;
    }

    render(estado);
    window.dispatchEvent(new Event("sunad:progress"));
    window._snd?.("victoria");
    window.SunModal?.alert({
      title: "¡Reto Diario Completado!",
      message: `Has probado los minijuegos de hoy. Recibiste <strong>+${PREMIO_MONEDAS} SunCoins</strong> y <strong>+${PREMIO_XP} XP</strong>.`,
      variant: "success",
      icon: "🏆",
      confirmText: "¡Genial!"
    });
  }

  function registrarMinijuego() {
    const overlay = document.querySelector(".minijuego-overlay.active[id]");
    if (!overlay) return;

    const estado = cargarEstado();
    if (!estado.juegos.includes(overlay.id)) {
      estado.juegos.push(overlay.id);
      if (!guardarEstado(estado)) return;
    }
    render(estado);
  }

  // Listener para el botón interactivo de Reclamar en el widget de lobby
  document.addEventListener("click", event => {
    const btn = event.target.closest("#btn-bento-reto-reclamar");
    if (btn && !btn.disabled) {
      reclamarPremio();
    }
  });

  window.addEventListener("sunad:progress", registrarMinijuego);
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
