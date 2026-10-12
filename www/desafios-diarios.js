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
    const card = document.getElementById("desafio-minijuegos");
    if (!card) return;

    const progreso = Math.min(estado.juegos.length, META);
    const barra = document.getElementById("desafio-minijuegos-progreso");
    const medidor = card.querySelector('[role="progressbar"]');
    const mensaje = document.getElementById("desafio-minijuegos-estado");
    const juegos = document.getElementById("desafio-minijuegos-juegos");
    const completo = estado.reclamado;

    if (barra) barra.style.width = `${progreso / META * 100}%`;
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
    card.classList.toggle("completado", completo);
  }

  function reclamarPremio(estado) {
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
      title: "¡Reto completado!",
      message: `Has probado dos minijuegos distintos. Recibiste <strong>+${PREMIO_MONEDAS} SunCoins</strong> y <strong>+${PREMIO_XP} XP</strong>.`,
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
    reclamarPremio(estado);
    render(estado);
  }

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
