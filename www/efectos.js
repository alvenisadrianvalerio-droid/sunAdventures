/* ============================================================
   EFECTOS.JS — Partículas visuales de los cosméticos "Efectos"
   · Chispas   → estallido al hacer clic en la mascota
   · Corazones → corazones flotando continuamente alrededor
   · Estrellas → estrellas cayendo desde arriba de la pantalla
   ============================================================ */
(function () {
  let intervalo = null;
  let limpiarClick = null;

  function detener() {
    if (intervalo) { clearInterval(intervalo); intervalo = null; }
    if (limpiarClick) { limpiarClick(); limpiarClick = null; }
    document.querySelectorAll(".fx-particle").forEach(el => el.remove());
  }

  function crear(tipo) {
    const s = document.createElement("span");
    s.className = "fx-particle fx-" + tipo;
    return s;
  }

    function efectoChispas() {
    const handler = (e) => {
      const m = document.getElementById("mascota");
      if (!m) return;
      // Solo si el clic fue sobre la mascota o su imagen
      const target = e.target;
      if (target !== m && !m.contains(target)) return;

      const r = m.getBoundingClientRect();
      const cx = e.clientX || (r.left + r.width / 2);
      const cy = e.clientY || (r.top + r.height / 2);

      for (let i = 0; i < 14; i++) {
        const p = document.createElement("span");
        p.className = "fx-particle fx-chispa";
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        const a = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 90;
        p.style.setProperty("--dx", (Math.cos(a) * d) + "px");
        p.style.setProperty("--dy", (Math.sin(a) * d) + "px");
        p.style.animationDelay = (i * 12) + "ms";
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1100);
      }
    };
    // ⚡ capture: true → se ejecuta ANTES que cualquier stopPropagation()
    document.addEventListener("click", handler, true);
    limpiarClick = () => document.removeEventListener("click", handler, true);
  }
  function efectoCorazones() {
    intervalo = setInterval(() => {
      const m = document.getElementById("mascota");
      if (!m || document.hidden) return;
      const r = m.getBoundingClientRect();
      const p = crear("corazon");
      p.style.left = (r.left + Math.random() * r.width) + "px";
      p.style.top = (r.top + r.height * 0.3) + "px";
      p.style.setProperty("--dx", ((Math.random() - 0.5) * 80) + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2400);
    }, 500);
  }

  function efectoEstrellas() {
    intervalo = setInterval(() => {
      if (document.hidden) return;
      const p = crear("estrella");
      p.style.left = (Math.random() * window.innerWidth) + "px";
      p.style.top = "-30px";
      const dur = 2500 + Math.random() * 2000;
      p.style.animationDuration = dur + "ms";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur + 100);
    }, 380);
  }

  function aplicar() {
    detener();
    if (localStorage.getItem("sunadventures_animations_disabled") === "true") return;
    try {
      const userId = window._getUserId?.() || localStorage.getItem("sunadventures_uid") || "local";
      const mascota = localStorage.getItem("mascota_actual") || "mapache";
      const eq = JSON.parse(localStorage.getItem(`mascota_skins_eq_${userId}_${mascota}`) || "{}");
      const fx = eq.efectos;
      if (fx === "chispas") efectoChispas();
      else if (fx === "corazones") efectoCorazones();
      else if (fx === "estrellas") efectoEstrellas();
    } catch (e) { console.warn("efectos:", e); }
  }

  window._aplicarEfectosVisuales = aplicar;

  // Aplicar al cargar
  setTimeout(aplicar, 600);

  // Re-aplicar cuando cambie la mascota o el equipamiento
  window.addEventListener("sunadventures:mascota-cambiada", () => setTimeout(aplicar, 100));
  window.addEventListener("sunadventures:animations-change", () => aplicar());
  window.addEventListener("sunadventures:perfil-actualizado", () => setTimeout(aplicar, 100));
  window.addEventListener("sunadventures:inventario-refresh", () => setTimeout(aplicar, 100));

  // Re-aplicar al equipar/quitar desde la tienda
  document.addEventListener("click", (e) => {
    if (e.target.closest(".tienda-item-btn") || e.target.closest(".tienda-fav")) {
      setTimeout(aplicar, 150);
    }
  });

  // Pausar cuando la pestaña está oculta (ahorro de batería)
  document.addEventListener("visibilitychange", () => { if (!document.hidden) aplicar(); });
})();