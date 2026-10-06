/* ============================================================
   CAPSULA-TIEMPO.JS — Módulo de Cápsulas del Tiempo para el Álbum
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY_PREFIX = "sunad_capsulas_";
  const SVG_CAPSULE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const SVG_HOURGLASS = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd93d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>';
  const SVG_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const SVG_UNLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
  const SVG_GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd93d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
  const SVG_CARDS = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd93d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="15" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v13"/></svg>';
  const SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#51cf66" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;display:inline-block;vertical-align:-2px;margin-right:4px;"><path d="M20 6L9 17l-5-5"/></svg>';
  const SVG_SPARKLE = '<svg viewBox="0 0 24 24" fill="#ffd93d" stroke="#ffd93d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;display:inline-block;vertical-align:-2px;margin-right:4px;"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>';
  const SVG_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="#d65db1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;display:inline-block;vertical-align:-3px;margin-right:6px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
  const SVG_LOCK_INLINE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline-block;vertical-align:-2px;margin-right:5px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const SVG_SPARKLE_MEDAL = '<svg viewBox="0 0 24 24" fill="#ffd93d" stroke="#ffd93d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:34px;height:34px;display:block;"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>';

  // Sprites pixel-art del juego (estrella, calendario, corazón, reloj de arena)
  const SPRITE_ESTRELLA = (size = 36) => `<img src="img/items%20de%20aventura/estrella.png" alt="Estrella" class="sprite-capsula" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;display:inline-block;vertical-align:middle;">`;
  const SPRITE_CALENDARIO = (size = 18) => `<img src="img/sprites%20complementarios/calendario.png" alt="Calendario" class="sprite-capsula" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;display:inline-block;vertical-align:middle;margin-right:4px;">`;
  const SPRITE_CORAZON = (size = 20) => `<img src="img/sprites%20complementarios/corazon.png" alt="Corazón" class="sprite-capsula" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;display:inline-block;vertical-align:middle;margin-right:6px;">`;
  const SPRITE_RELOJ_ARENA = (size = 20) => `<img src="img/sprites%20complementarios/reloj%20de%20arena.png" alt="Reloj de Arena" class="sprite-capsula" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;display:inline-block;vertical-align:middle;margin-right:4px;">`;

  const getStorageKey = () => {
    const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
    return `${STORAGE_KEY_PREFIX}${uid}`;
  };

  const cargarCapsulas = () => {
    try {
      return JSON.parse(localStorage.getItem(getStorageKey()) || "{}");
    } catch {
      return {};
    }
  };

  const guardarCapsulas = (capsulas) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(capsulas));
    } catch (e) {
      console.warn("guardarCapsulas error:", e);
    }
  };

  const esHoyOMas = (fechaISO) => {
    if (!fechaISO) return false;
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    const objetivo = new Date(fechaISO + "T00:00:00");
    return ahora.getTime() >= objetivo.getTime();
  };

  const formatearFechaBonita = (fechaStr) => {
    if (!fechaStr) return "";
    const partes = fechaStr.split("-");
    if (partes.length !== 3) return fechaStr;
    const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  const diasRestantes = (fechaISO) => {
    if (!fechaISO) return 0;
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    const objetivo = new Date(fechaISO + "T00:00:00");
    const diff = objetivo.getTime() - ahora.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  /* Efecto de celebración con chispas de colores */
  function dispararCelebracion(x, y) {
    const colores = ["#ffd93d", "#ff6f91", "#845ec2", "#4ffbdf", "#ff9671", "#ffc75f"];
    for (let i = 0; i < 35; i++) {
      const p = document.createElement("div");
      p.className = "capsula-particle";
      const rad = (Math.PI * 2 * i) / 35 + (Math.random() - 0.5) * 0.3;
      const dist = 60 + Math.random() * 120;
      const tx = Math.cos(rad) * dist + "px";
      const ty = Math.sin(rad) * dist + "px";
      const tam = 6 + Math.random() * 8;
      p.style.width = tam + "px";
      p.style.height = tam + "px";
      p.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
      p.style.left = (x || window.innerWidth / 2) + "px";
      p.style.top = (y || window.innerHeight / 2) + "px";
      p.style.setProperty("--tx", tx);
      p.style.setProperty("--ty", ty);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1300);
    }
  }

  /* Audio alegre opcional si AudioContext está disponible */
  function sonarFanfarria() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notas = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
      });
    } catch {
      // Ignorar si el audio está bloqueado por el navegador
    }
  }

  /* Actualizar el botón de la cabecera del álbum */
  function actualizarBotonHeader() {
    let btn = document.getElementById("btn-ver-capsulas");
    const headerActions = document.querySelector(".album-actions");
    if (!headerActions) return;

    const capsulas = cargarCapsulas();
    const activas = Object.values(capsulas).filter(c => !c.abierta);
    const listasParaAbrir = activas.filter(c => esHoyOMas(c.fechaDesbloqueo));

    if (!btn) {
      btn = document.createElement("button");
      btn.id = "btn-ver-capsulas";
      btn.className = "btn-secondary btn-capsula-tiempo";
      btn.type = "button";
      btn.innerHTML = `${SPRITE_RELOJ_ARENA(20)} Cápsulas del Tiempo <span class="capsula-badge-count">0</span>`;
      btn.addEventListener("click", () => abrirModalListadoCapsulas());
      headerActions.appendChild(btn);
    }

    const badge = btn.querySelector(".capsula-badge-count");
    if (badge) {
      if (listasParaAbrir.length > 0) {
        badge.textContent = `¡${listasParaAbrir.length} listas!`;
        badge.style.background = "#ffd93d";
        badge.style.color = "#2b2118";
      } else {
        badge.textContent = `${activas.length}`;
        badge.style.background = "rgba(0, 0, 0, 0.3)";
        badge.style.color = "#ffeaa7";
      }
    }
  }

  /* Modal de configuración: Crear o Modificar cápsula para una foto */
  function abrirModalConfigCapsula(foto) {
    if (!foto) return;
    const capsulas = cargarCapsulas();
    const capsulaExistente = capsulas[foto.id];

    // Fechas rápidas por defecto
    const hoy = new Date();
    const sumarDias = (d) => {
      const res = new Date(hoy);
      res.setDate(res.getDate() + d);
      return res.toISOString().split("T")[0];
    };
    const sumarMeses = (m) => {
      const res = new Date(hoy);
      res.setMonth(res.getMonth() + m);
      return res.toISOString().split("T")[0];
    };

    const fecha1Mes = sumarMeses(1);
    const fecha6Meses = sumarMeses(6);
    const fecha1Ano = sumarMeses(12);

    let fechaElegida = capsulaExistente?.fechaDesbloqueo || fecha1Mes;

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.id = "capsula-config-modal";
    modal.innerHTML = `
      <div class="modal-backdrop" data-close-capsula></div>
      <div class="modal-content capsula-modal-content">
        <div class="capsula-header-visual">
          <div class="capsula-hero-icon">${SVG_HOURGLASS}</div>
          <h3 class="capsula-modal-title">${capsulaExistente ? "Editar Cápsula del Tiempo" : "Crear Cápsula del Tiempo"}</h3>
          <p class="capsula-modal-desc">
            Sella esta fotito en un cofre del tiempo. Permanecerá oculta y protegida hasta el día que elijas.
          </p>
        </div>

        <div class="capsula-preview-mini">
          <img src="" id="capsula-prev-img" alt="Foto">
          <div class="capsula-preview-mini-info">
            <h4>${foto.fecha ? formatearFechaBonita(foto.fecha) : "Recuerdo especial"}</h4>
            <p>${foto.nota ? foto.nota : "Sin nota escrita"}</p>
          </div>
        </div>

        <div class="capsula-options-grid">
          <button type="button" class="capsula-opt-btn ${fechaElegida === sumarDias(7) ? 'active' : ''}" data-dias="7">
            <span class="capsula-opt-btn-label">En 1 semana</span>
            <span class="capsula-opt-btn-sub">${formatearFechaBonita(sumarDias(7))}</span>
          </button>
          <button type="button" class="capsula-opt-btn ${fechaElegida === fecha1Mes ? 'active' : ''}" data-dias="30">
            <span class="capsula-opt-btn-label">En 1 mes</span>
            <span class="capsula-opt-btn-sub">${formatearFechaBonita(fecha1Mes)}</span>
          </button>
          <button type="button" class="capsula-opt-btn ${fechaElegida === fecha6Meses ? 'active' : ''}" data-dias="180">
            <span class="capsula-opt-btn-label">En 6 meses</span>
            <span class="capsula-opt-btn-sub">${formatearFechaBonita(fecha6Meses)}</span>
          </button>
          <button type="button" class="capsula-opt-btn ${fechaElegida === fecha1Ano ? 'active' : ''}" data-dias="365">
            <span class="capsula-opt-btn-label">En 1 año</span>
            <span class="capsula-opt-btn-sub">${formatearFechaBonita(fecha1Ano)}</span>
          </button>
        </div>

        <div class="capsula-custom-date-wrap">
          <label for="capsula-custom-date">O elige una fecha exacta para abrirla:</label>
          <input type="date" id="capsula-custom-date" min="${sumarDias(1)}" value="${fechaElegida}">
        </div>

        <div class="capsula-modal-actions">
          ${capsulaExistente ? `<button type="button" class="btn-secondary" id="btn-eliminar-capsula" style="margin-right:auto;color:#ff6b6b;">Quitar cápsula</button>` : ""}
          <button type="button" class="btn-secondary" data-close-capsula>Cancelar</button>
          <button type="button" class="btn-primary" id="btn-guardar-capsula" style="display:inline-flex;align-items:center;justify-content:center;">${SVG_LOCK_INLINE} Sellar Cápsula</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cargar imagen en la vista previa
    const imgEl = modal.querySelector("#capsula-prev-img");
    const polaroidImg = document.querySelector(`.polaroid[data-foto-id="${foto.id}"] img`);
    if (polaroidImg && polaroidImg.src) {
      imgEl.src = polaroidImg.src;
    } else {
      imgEl.style.display = "none";
    }

    const inputFecha = modal.querySelector("#capsula-custom-date");
    const optBtns = modal.querySelectorAll(".capsula-opt-btn");

    optBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        optBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const dias = Number(btn.dataset.dias);
        fechaElegida = sumarDias(dias);
        inputFecha.value = fechaElegida;
      });
    });

    inputFecha.addEventListener("change", () => {
      fechaElegida = inputFecha.value;
      optBtns.forEach(b => b.classList.remove("active"));
    });

    const cerrar = () => {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelectorAll("[data-close-capsula]").forEach(el => el.addEventListener("click", cerrar));

    // Botón eliminar cápsula
    const btnEliminar = modal.querySelector("#btn-eliminar-capsula");
    if (btnEliminar) {
      btnEliminar.addEventListener("click", () => {
        delete capsulas[foto.id];
        guardarCapsulas(capsulas);
        cerrar();
        aplicarCapsulasAlGrid();
        actualizarBotonHeader();
        if (window.SunModal) {
          window.SunModal.alert({
            title: "Cápsula cancelada",
            message: "La fotito vuelve a ser un recuerdo normal y visible en el álbum.",
            icon: SVG_UNLOCK
          });
        }
      });
    }

    // Botón guardar cápsula
    const btnGuardar = modal.querySelector("#btn-guardar-capsula");
    btnGuardar.addEventListener("click", () => {
      if (!fechaElegida) {
        alert("Por favor selecciona una fecha válida.");
        return;
      }
      capsulas[foto.id] = {
        fotoId: foto.id,
        fechaCreacion: new Date().toISOString().split("T")[0],
        fechaDesbloqueo: fechaElegida,
        abierta: false
      };
      guardarCapsulas(capsulas);
      cerrar();
      aplicarCapsulasAlGrid();
      actualizarBotonHeader();
      dispararCelebracion(window.innerWidth / 2, window.innerHeight / 2);
      if (window.SunModal) {
        window.SunModal.alert({
          title: `¡Cápsula Sellada! <span style="width:20px;height:20px;display:inline-block;vertical-align:-3px;margin-left:4px;">${SVG_HOURGLASS}</span>`,
          message: `Esta foto ha sido sellada. Podrás abrirla el ${formatearFechaBonita(fechaElegida)}. ¡La paciencia guarda los mejores tesoros!`,
          icon: SVG_LOCK
        });
      }
    });
  }

  /* Modal de Apertura / Revelación de Cápsula */
  function abrirModalRevelarCapsula(foto, capsula, imgUrl) {
    sonarFanfarria();
    dispararCelebracion(window.innerWidth / 2, window.innerHeight / 2);

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.id = "capsula-revelar-modal";
    modal.innerHTML = `
      <div class="modal-backdrop" data-close-capsula></div>
      <div class="modal-content capsula-modal-content capsula-revelar-card">
        <div class="capsula-header-visual">
          <div class="capsula-hero-icon" style="border-color:#ffd93d;background:radial-gradient(circle,rgba(255,217,61,.3),rgba(214,93,177,.3))">
            ${SPRITE_ESTRELLA(42)}
          </div>
          <h3 class="capsula-modal-title">¡Llegó el día! Cápsula Revelada</h3>
          <p class="capsula-modal-desc">
            El tiempo ha pasado y este recuerdo guardado con tanto cariño vuelve a la luz.
          </p>
        </div>

        <div class="capsula-revelar-img-wrap">
          <img src="${imgUrl}" alt="Recuerdo revelado">
        </div>

        ${foto.nota ? `<div class="capsula-revelar-nota"><p>“${foto.nota}”</p></div>` : ""}

        <div class="capsula-revelar-meta">
          <span style="display:inline-flex;align-items:center;justify-content:center;gap:4px;">
            ${SPRITE_CALENDARIO(18)} Foto tomada el: <strong>${foto.fecha ? formatearFechaBonita(foto.fecha) : "Sin fecha"}</strong>
          </span><br>
          <small>Sellada el ${formatearFechaBonita(capsula.fechaCreacion)} · Abierta hoy</small>
        </div>

        <div class="capsula-modal-actions" style="justify-content:center;">
          <button type="button" class="btn-primary" id="btn-completar-revelar" style="background:linear-gradient(135deg,#ffd93d 0%,#ff6f91 100%);color:#2b2118;font-weight:800;padding:.8rem 2rem;display:inline-flex;align-items:center;justify-content:center;gap:6px;">
            ${SPRITE_CORAZON(20)} Guardar en el Álbum
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelectorAll("[data-close-capsula]").forEach(el => el.addEventListener("click", cerrar));

    const btnCompletar = modal.querySelector("#btn-completar-revelar");
    btnCompletar.addEventListener("click", () => {
      const capsulas = cargarCapsulas();
      if (capsulas[foto.id]) {
        capsulas[foto.id].abierta = true;
        guardarCapsulas(capsulas);
      }
      cerrar();
      aplicarCapsulasAlGrid();
      actualizarBotonHeader();
    });
  }

  /* Modal de Listado de Todas las Cápsulas del Tiempo */
  function abrirModalListadoCapsulas() {
    const capsulas = cargarCapsulas();
    const fotos = window._fotos || [];
    const keys = Object.keys(capsulas);

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.id = "capsulas-list-modal";

    let itemsHtml = "";
    if (keys.length === 0) {
      itemsHtml = `
        <div class="capsula-empty-state">
          <div class="capsula-empty-state-icon">${SVG_HOURGLASS}</div>
          <p>No tienes ninguna cápsula del tiempo activa.</p>
          <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-top:0.4rem;">
            Toca el botón de cápsula en cualquier foto del álbum para convertirla en una cápsula y programar su apertura.
          </p>
        </div>
      `;
    } else {
      itemsHtml = `<div class="capsulas-list">`;
      keys.forEach(id => {
        const cap = capsulas[id];
        const foto = fotos.find(f => f.id === id);
        const lista = esHoyOMas(cap.fechaDesbloqueo);
        const dias = diasRestantes(cap.fechaDesbloqueo);
        const polaroidImg = document.querySelector(`.polaroid[data-foto-id="${id}"] img`);
        const imgSrc = polaroidImg?.src || "img/mascota-girasol.png";

        itemsHtml += `
          <div class="capsula-list-item ${lista && !cap.abierta ? 'is-ready' : ''}">
            <div class="capsula-list-left">
              <img src="${imgSrc}" class="${!cap.abierta && !lista ? 'blur-mini' : ''}" alt="">
              <div class="capsula-list-info">
                <h4>${foto?.nota ? foto.nota : (foto?.fecha ? formatearFechaBonita(foto.fecha) : "Recuerdo")}</h4>
                <p>
                  ${cap.abierta
                    ? `${SVG_CHECK} Ya abierta y completada`
                    : lista
                      ? `${SVG_SPARKLE} ¡Lista para abrir hoy!`
                      : `Abre en ${dias} día${dias === 1 ? '' : 's'} (${formatearFechaBonita(cap.fechaDesbloqueo)})`}
                </p>
              </div>
            </div>
            <div class="capsula-list-status">
              ${!cap.abierta && lista
                ? `<button type="button" class="btn-primary btn-abrir-desde-lista" data-foto-id="${id}" style="padding:0.4rem 0.85rem;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px;">Abrir <span style="width:14px;height:14px;display:inline-block;">${SVG_GIFT}</span></button>`
                : `<button type="button" class="btn-secondary btn-editar-desde-lista" data-foto-id="${id}" style="padding:0.4rem 0.75rem;font-size:0.8rem;">${cap.abierta ? 'Ver' : 'Ajustar'}</button>`}
            </div>
          </div>
        `;
      });
      itemsHtml += `</div>`;
    }

    modal.innerHTML = `
      <div class="modal-backdrop" data-close-capsula></div>
      <div class="modal-content capsula-modal-content">
        <div class="capsula-header-visual">
          <div class="capsula-hero-icon">${SVG_HOURGLASS}</div>
          <h3 class="capsula-modal-title">Cápsulas del Tiempo</h3>
          <p class="capsula-modal-desc">
            Momentos sellados esperando su fecha señalada para volver a brillar.
          </p>
        </div>

        ${itemsHtml}

        <div class="capsula-bulk" style="margin:1rem 0;padding:0.95rem 1rem;border-radius:14px;background:rgba(132,94,194,0.12);border:1px solid rgba(214,93,177,0.35);">
          <p style="margin:0 0 0.4rem;font-weight:700;color:#fff;display:flex;align-items:center;">
            ${SVG_BOX} Sellar recuerdos recientes en lote
          </p>
          <p style="margin:0 0 0.7rem;font-size:0.8rem;color:rgba(255,255,255,0.65);">Elige la fecha de apertura y sella fotos del último mes o de los últimos 3 meses.</p>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;margin-bottom:0.75rem;">
            <label style="font-size:0.8rem;color:rgba(255,255,255,0.85);font-weight:600;">Abrir el día:</label>
            <input type="date" id="capsula-bulk-fecha" style="flex:1;min-width:140px;padding:0.45rem 0.6rem;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff;">
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <button type="button" class="btn-primary" id="btn-capsula-bulk-1m" style="flex:1;min-width:140px;font-size:0.85rem;padding:0.55rem 0.8rem;background:linear-gradient(135deg,#845ec2,#d65db1);display:inline-flex;align-items:center;justify-content:center;">${SVG_LOCK_INLINE} Último mes</button>
            <button type="button" class="btn-primary" id="btn-capsula-bulk-3m" style="flex:1;min-width:140px;font-size:0.85rem;padding:0.55rem 0.8rem;background:linear-gradient(135deg,#d65db1,#ff6f91);display:inline-flex;align-items:center;justify-content:center;">${SVG_LOCK_INLINE} Últimos 3 meses</button>
          </div>
        </div>

        <div class="capsula-modal-actions">
          <button type="button" class="btn-secondary" data-close-capsula>Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cerrar = () => {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 250);
    };

    modal.querySelectorAll("[data-close-capsula]").forEach(el => el.addEventListener("click", cerrar));

    // Sellado en lote: helper para procesar 1 mes o 3 meses
    const inputBulk = modal.querySelector("#capsula-bulk-fecha");
    const enUnAno = new Date(); enUnAno.setFullYear(enUnAno.getFullYear() + 1);
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    inputBulk.value = enUnAno.toISOString().split("T")[0];
    inputBulk.min = manana.toISOString().split("T")[0];

    const procesarSelladoLote = async (mesesAtras, etiqueta) => {
      const fecha = inputBulk.value;
      if (!fecha || esHoyOMas(fecha)) { alert("Elige una fecha futura para abrir la cápsula."); return; }
      const limite = new Date(); limite.setMonth(limite.getMonth() - mesesAtras); limite.setHours(0, 0, 0, 0);
      const fechaFoto = f => { const d = new Date(f.fecha || f.created_at || f.creado || 0); return isNaN(d) ? null : d; };
      const actuales = cargarCapsulas();
      const candidatas = fotos.filter(f => {
        const d = fechaFoto(f);
        return d && d >= limite && !(actuales[f.id] && !actuales[f.id].abierta);
      });
      if (!candidatas.length) {
        alert(`No hay fotos nuevas del ${etiqueta.toLowerCase()} para sellar.`);
        return;
      }
      const msg = `¿Sellar ${candidatas.length} foto(s) del ${etiqueta.toLowerCase()} hasta el ${formatearFechaBonita(fecha)}?`;
      const ok = window.SunModal?.confirm
        ? await window.SunModal.confirm({
          title: `Cápsula: ${etiqueta} <span style="width:20px;height:20px;display:inline-block;vertical-align:-3px;margin-left:5px;">${SVG_HOURGLASS}</span>`,
          message: msg,
          icon: SVG_BOX,
          confirmText: "Sellar",
          cancelText: "Cancelar"
        })
        : confirm(msg);
      if (!ok) return;
      const hoyISO = new Date().toISOString().split("T")[0];
      candidatas.forEach(f => {
        actuales[f.id] = { fotoId: f.id, fechaCreacion: hoyISO, fechaDesbloqueo: fecha, abierta: false, lote: `${mesesAtras}meses` };
      });
      guardarCapsulas(actuales);
      cerrar();
      aplicarCapsulasAlGrid();
      actualizarBotonHeader();
      dispararCelebracion(window.innerWidth / 2, window.innerHeight / 2);
    };

    modal.querySelector("#btn-capsula-bulk-1m")?.addEventListener("click", () => procesarSelladoLote(1, "Último mes"));
    modal.querySelector("#btn-capsula-bulk-3m")?.addEventListener("click", () => procesarSelladoLote(3, "Últimos 3 meses"));

    modal.querySelectorAll(".btn-abrir-desde-lista").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.fotoId;
        const foto = fotos.find(f => f.id === id);
        const polaroidImg = document.querySelector(`.polaroid[data-foto-id="${id}"] img`);
        cerrar();
        if (foto && capsulas[id]) {
          abrirModalRevelarCapsula(foto, capsulas[id], polaroidImg?.src || "");
        }
      });
    });

    modal.querySelectorAll(".btn-editar-desde-lista").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.fotoId;
        const foto = fotos.find(f => f.id === id);
        cerrar();
        if (foto) abrirModalConfigCapsula(foto);
      });
    });
  }

  /* ============================================================
     BARAJA DE RECUERDOS: Animación de reparto y revelación una a una
     ============================================================ */
  function abrirModalBarajaCapsulas(itemsCapsula) {
    if (!itemsCapsula || !itemsCapsula.length) return;

    sonarFanfarria();
    dispararCelebracion(window.innerWidth / 2, window.innerHeight / 2);

    const total = itemsCapsula.length;
    let indiceActual = 0;

    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.id = "capsula-deck-modal";
    modal.innerHTML = `
      <div class="modal-backdrop" data-close-deck></div>
      <div class="modal-content capsula-modal-content capsula-deck-container">
        <div class="capsula-header-visual" style="margin-bottom:0.4rem;">
          <div class="capsula-hero-icon" style="border-color:#ffd93d;background:radial-gradient(circle,rgba(255,217,61,.3),rgba(214,93,177,.3))">
            ${SVG_GIFT}
          </div>
          <h3 class="capsula-modal-title" style="color:#ffd93d;font-size:1.45rem;">¡Llegó el día de tu Cápsula!</h3>
          <p class="capsula-modal-desc" id="capsula-deck-counter" style="color:rgba(255,255,255,0.85);font-weight:600;">
            Repartiendo ${total} recuerdo${total > 1 ? 's' : ''}...
          </p>
        </div>

        <div class="capsula-deck-stage" id="capsula-deck-stage"></div>

        <div class="capsula-deck-controls">
          <button type="button" class="btn-secondary" data-close-deck>Cerrar</button>
          <button type="button" class="btn-primary" id="btn-deck-next" style="background:linear-gradient(135deg,#ffd93d 0%,#ff6f91 100%);color:#2b2118;font-weight:800;padding:0.75rem 1.8rem;min-width:210px;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:0.95rem;box-shadow:0 8px 25px rgba(255,217,61,0.5);">
            ${SPRITE_CORAZON(22)} Guardar en el Álbum
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const stage = modal.querySelector("#capsula-deck-stage");
    const btnNext = modal.querySelector("#btn-deck-next");
    const counterText = modal.querySelector("#capsula-deck-counter");

    // Construir las cartas en el mazo centradas inicialmente
    const cardEls = itemsCapsula.map((item, idx) => {
      const card = document.createElement("div");
      card.className = "deck-card";
      card.dataset.index = idx;

      // Calcular posiciones de abanico repartido
      // Distribución centrada horizontal y leve rotación angular de cartas
      const offset = idx - (total - 1) / 2;
      const x = Math.min(Math.max(offset * 32, -180), 180);
      const y = Math.min(Math.abs(offset) * 8, 30);
      const rot = Math.min(Math.max(offset * 5, -20), 20);

      card.style.setProperty("--deal-x", `${x}px`);
      card.style.setProperty("--deal-y", `${y}px`);
      card.style.setProperty("--deal-rot", `${rot}deg`);
      card.style.zIndex = idx + 10;

      const fechaFmt = item.foto.fecha ? formatearFechaBonita(item.foto.fecha) : "Recuerdo";
      const notaFmt = item.foto.nota || "Un momento para no olvidar ❤️";

      card.innerHTML = `
        <span class="deck-card-fecha" style="display:flex;align-items:center;justify-content:center;gap:3px;">
          ${SPRITE_CALENDARIO(14)} ${fechaFmt}
        </span>
        <img src="${item.imgSrc}" alt="Foto">
        <div class="deck-card-nota">“${notaFmt}”</div>
      `;

      card.addEventListener("click", () => {
        enfocarCarta(idx);
      });

      stage.appendChild(card);
      return card;
    });

    // Animación de reparto de baraja de cartas una por una al inicio
    itemsCapsula.forEach((_, idx) => {
      setTimeout(() => {
        if (cardEls[idx]) {
          cardEls[idx].classList.add("dealt");
        }
      }, 120 + idx * 160);
    });

    function enfocarCarta(idx) {
      indiceActual = idx;
      cardEls.forEach((c, i) => {
        if (i === idx) {
          c.classList.add("highlight");
          c.classList.remove("dealt");
        } else {
          c.classList.remove("highlight");
          c.classList.add("dealt");
        }
      });

      const actual = itemsCapsula[idx];
      const fStr = actual.foto.fecha ? formatearFechaBonita(actual.foto.fecha) : "";
      counterText.innerHTML = `Viendo recuerdo <strong>${idx + 1} de ${total}</strong> ${fStr ? `• ${fStr}` : ''}`;
    }

    // Tras terminar el reparto inicial, enfocar la primera carta
    const tiempoRepartoTotal = 150 + total * 160 + 200;
    setTimeout(() => {
      enfocarCarta(0);
    }, tiempoRepartoTotal);

    // Botón "Guardar en el álbum": anima la baraja volando hacia el álbum y las fotos apareciendo una por una
    let guardando = false;
    btnNext.addEventListener("click", () => {
      if (guardando) return;
      guardando = true;

      btnNext.disabled = true;
      btnNext.style.opacity = "0.8";
      btnNext.innerHTML = `<span style="display:inline-block;animation:spin 1s infinite linear;">✨</span> Guardando en el álbum...`;

      // 1. Marcar todas las cápsulas como abiertas
      const capsulas = cargarCapsulas();
      itemsCapsula.forEach(it => {
        if (capsulas[it.foto.id]) {
          capsulas[it.foto.id].abierta = true;
        }
      });
      guardarCapsulas(capsulas);

      // 2. Animación de las cartas del mazo despegando hacia abajo / hacia el álbum
      cardEls.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add("flying-to-album");
        }, i * 60);
      });

      // 3. Cerrar el modal y desplegar la animación en cascada en el álbum
      setTimeout(() => {
        sonarFanfarria();
        dispararCelebracion(window.innerWidth / 2, window.innerHeight / 3);

        modal.classList.remove("active");
        setTimeout(() => {
          modal.remove();

          // Renderizar el álbum con las fotos desbloqueadas y animarlas
          aplicarCapsulasAlGrid();
          actualizarBotonHeader();
          animarAparicionEnAlbum(itemsCapsula);
        }, 300);
      }, Math.min(800, cardEls.length * 60 + 250));
    });

    function cerrarModal() {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.remove();
      }, 250);
    }

    modal.querySelectorAll("[data-close-deck]").forEach(el => el.addEventListener("click", cerrarModal));
  }

  /* Animación en cascada de fotos revelándose y aterrizando en el álbum */
  function animarAparicionEnAlbum(items) {
    if (!items || !items.length) return;
    const grid = document.getElementById("album-grid");
    if (!grid) return;

    // Hacer scroll suave hacia las fotos si es necesario
    const primerId = items[0]?.foto?.id;
    const primeraTarjeta = primerId ? grid.querySelector(`[data-foto-id="${primerId}"]`) : null;
    if (primeraTarjeta) {
      primeraTarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    items.forEach((item, idx) => {
      const art = grid.querySelector(`[data-foto-id="${item.foto.id}"]`);
      if (art) {
        art.classList.add("polaroid-revealed-landing");
        art.style.animationDelay = `${idx * 120}ms`;
        setTimeout(() => {
          const rect = art.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            dispararCelebracion(rect.left + rect.width / 2, rect.top + rect.height / 2);
          }
        }, idx * 120 + 200);

        setTimeout(() => {
          art.classList.remove("polaroid-revealed-landing");
        }, idx * 120 + 1200);
      }
    });
  }

  /* Inyectar botones y modificar tarjetas polaroid (agrupando en un solo stack) */
  function aplicarCapsulasAlGrid() {
    const grid = document.getElementById("album-grid");
    if (!grid) return;

    // Remover stack agrupado previo si existiera
    const prevStack = grid.querySelector("#polaroid-capsula-stack-card");
    if (prevStack) prevStack.remove();

    const fotos = window._fotos || [];
    const capsulas = cargarCapsulas();
    const polaroids = Array.from(grid.querySelectorAll(".polaroid:not(#polaroid-capsula-stack-card)"));

    // Recolectar fotos que están en cápsula activa
    const capsulasListas = [];
    const capsulasBloqueadas = [];

    polaroids.forEach((article, index) => {
      const foto = fotos[index];
      if (!foto) return;
      article.setAttribute("data-foto-id", foto.id);

      const capsula = capsulas[foto.id];
      const esCapsulaActiva = capsula && !capsula.abierta;
      const puedeAbrirse = esCapsulaActiva && esHoyOMas(capsula.fechaDesbloqueo);

      // Botón de Cápsula en la polaroid individual
      let btnCapsula = article.querySelector(".polaroid-capsula");
      if (!btnCapsula) {
        btnCapsula = document.createElement("button");
        btnCapsula.type = "button";
        btnCapsula.className = "polaroid-capsula";
        btnCapsula.innerHTML = SVG_HOURGLASS;
        btnCapsula.title = "Cápsula del tiempo";
        btnCapsula.setAttribute("aria-label", "Cápsula del tiempo");

        btnCapsula.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          abrirModalConfigCapsula(foto);
        });

        article.appendChild(btnCapsula);
      }

      // Remover overlay anterior si lo hubiera
      const viejoOverlay = article.querySelector(".polaroid-capsula-overlay");
      if (viejoOverlay) viejoOverlay.remove();
      article.classList.remove("polaroid-capsula-locked", "polaroid-capsula-ready");

      if (esCapsulaActiva) {
        const img = article.querySelector("img");
        const imgSrc = img?.src || "img/mascota-girasol.png";
        if (puedeAbrirse) {
          capsulasListas.push({ foto, capsula, article, imgSrc });
        } else {
          capsulasBloqueadas.push({ foto, capsula, article, imgSrc });
        }
      } else {
        // Asegurar que fotos normales estén visibles
        article.style.display = "";
      }
    });

    // 1. SI HAY CÁPSULAS LISTAS PARA ABRIR HOY:
    // Agruparlas en un ÚNICO polaroid tipo mazo (stack de baraja)
    if (capsulasListas.length > 0) {
      // Ocultar polaroids individuales de la cápsula lista para no saturar el grid
      capsulasListas.forEach(item => {
        item.article.style.display = "none";
      });

      const count = capsulasListas.length;
      const stackCard = document.createElement("article");
      stackCard.id = "polaroid-capsula-stack-card";
      stackCard.className = "polaroid polaroid-capsula-stack";

      stackCard.innerHTML = `
        <div class="polaroid-img-wrap" style="background:#1a1727;min-height:200px;display:flex;align-items:center;justify-content:center;">
          <div style="opacity:0.2;filter:blur(8px);position:absolute;inset:0;overflow:hidden;">
            <img src="${capsulasListas[0].imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="">
          </div>
        </div>
        <div class="polaroid-capsula-overlay" style="cursor:pointer;">
          <div class="polaroid-capsula-overlay-icon">${SVG_GIFT}</div>
          <div class="polaroid-capsula-overlay-title" style="font-size:1.1rem;font-weight:900;">¡LLEGÓ EL DÍA!</div>
          <div class="polaroid-capsula-overlay-badge" style="background:rgba(255,217,61,0.2);color:#ffeaa7;border-color:#ffd93d;">
            ${count === 1 ? '1 cápsula lista' : `${count} recuerdos listos`}
          </div>
          <button type="button" class="polaroid-capsula-overlay-btn" id="btn-abrir-stack-deck" style="display:inline-flex;align-items:center;justify-content:center;gap:7px;">
            ${SPRITE_ESTRELLA(24)} Abrir Recuerdos
          </button>
        </div>
        <div class="polaroid-nota">
          <p style="text-align:center;font-weight:700;color:#ffd93d;">🎴 Baraja de Recuerdos</p>
        </div>
      `;

      stackCard.addEventListener("click", () => {
        abrirModalBarajaCapsulas(capsulasListas);
      });

      // Insertar el polaroid agrupado al principio del grid para máxima visibilidad
      if (grid.firstChild) {
        grid.insertBefore(stackCard, grid.firstChild);
      } else {
        grid.appendChild(stackCard);
      }
    }

    // 2. Para cápsulas que aún están en cuenta regresiva (bloqueadas):
    // Si son muchas (por ejemplo creadas en lote), también agrupamos o mostramos overlay con candado
    if (capsulasBloqueadas.length > 1) {
      // Si hay un lote de cápsulas bloqueadas, mantenerlas agrupadas si no hay stack de listas
      // o agruparlas en un polaroid stack sellado
      let stackBloqueado = grid.querySelector("#polaroid-capsula-stack-locked");
      if (stackBloqueado) stackBloqueado.remove();

      capsulasBloqueadas.forEach(item => {
        item.article.style.display = "none";
      });

      const count = capsulasBloqueadas.length;
      stackBloqueado = document.createElement("article");
      stackBloqueado.id = "polaroid-capsula-stack-locked";
      stackBloqueado.className = "polaroid polaroid-capsula-stack";
      stackBloqueado.style.borderColor = "rgba(180, 130, 255, 0.7)";

      const diasMin = Math.min(...capsulasBloqueadas.map(c => diasRestantes(c.capsula.fechaDesbloqueo)));
      const fechaTexto = formatearFechaBonita(capsulasBloqueadas[0].capsula.fechaDesbloqueo);

      stackBloqueado.innerHTML = `
        <div class="polaroid-img-wrap" style="background:#1a1727;min-height:200px;display:flex;align-items:center;justify-content:center;">
          <div style="opacity:0.15;filter:blur(10px);position:absolute;inset:0;overflow:hidden;">
            <img src="${capsulasBloqueadas[0].imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="">
          </div>
        </div>
        <div class="polaroid-capsula-overlay" style="cursor:pointer;">
          <div class="polaroid-capsula-overlay-icon" style="border-color:rgba(180,130,255,0.7);">${SVG_LOCK}</div>
          <div class="polaroid-capsula-overlay-title">Cápsula del Tiempo</div>
          <div class="polaroid-capsula-overlay-badge">${count} recuerdos sellados</div>
          <small style="font-size:0.75rem;color:rgba(255,255,255,0.7);margin-top:0.4rem;">
            Abre en ${diasMin} día${diasMin === 1 ? '' : 's'} (${fechaTexto})
          </small>
          <button type="button" class="polaroid-capsula-overlay-btn" style="background:rgba(255,255,255,0.15);color:#fff;box-shadow:none;">
            Ver cápsulas
          </button>
        </div>
        <div class="polaroid-nota">
          <p style="text-align:center;font-weight:700;color:#cba6f7;">⏳ Cofre del Tiempo (${count})</p>
        </div>
      `;

      stackBloqueado.addEventListener("click", () => {
        abrirModalListadoCapsulas();
      });

      if (grid.firstChild) {
        grid.insertBefore(stackBloqueado, grid.firstChild);
      } else {
        grid.appendChild(stackBloqueado);
      }
    } else if (capsulasBloqueadas.length === 1) {
      // Una sola cápsula sellada individual
      const { foto, capsula, article } = capsulasBloqueadas[0];
      article.style.display = "";
      article.classList.add("polaroid-capsula-locked");

      const overlay = document.createElement("div");
      overlay.className = "polaroid-capsula-overlay";
      const dias = diasRestantes(capsula.fechaDesbloqueo);
      const fechaTexto = formatearFechaBonita(capsula.fechaDesbloqueo);

      overlay.innerHTML = `
        <div class="polaroid-capsula-overlay-icon">${SVG_LOCK}</div>
        <div class="polaroid-capsula-overlay-title">Cápsula del Tiempo</div>
        <div class="polaroid-capsula-overlay-badge">Abre en ${dias} día${dias === 1 ? '' : 's'}</div>
        <small style="font-size:0.75rem;color:rgba(255,255,255,0.7);margin-top:0.4rem;">${fechaTexto}</small>
        <button type="button" class="polaroid-capsula-overlay-btn btn-gestionar-capsula" style="background:rgba(255,255,255,0.15);color:#fff;box-shadow:none;">Ajustar</button>
      `;

      overlay.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalConfigCapsula(foto);
      });

      article.appendChild(overlay);
    }
  }

  // Interceptar la mutación del álbum grid cuando se renderiza
  function iniciarObservador() {
    const grid = document.getElementById("album-grid");
    if (!grid) {
      setTimeout(iniciarObservador, 400);
      return;
    }

    actualizarBotonHeader();
    aplicarCapsulasAlGrid();

    // Observar cuando se vuelvan a añadir polaroids al grid
    const observer = new MutationObserver((mutations) => {
      let hayCambios = false;
      mutations.forEach(m => {
        Array.from(m.addedNodes).forEach(node => {
          if (node.nodeType === 1 && !node.id?.includes("polaroid-capsula-stack")) {
            hayCambios = true;
          }
        });
      });
      if (hayCambios) {
        setTimeout(() => {
          aplicarCapsulasAlGrid();
          actualizarBotonHeader();
        }, 80);
      }
    });

    observer.observe(grid, { childList: true });
  }

  // Notificar al usuario si hoy hay cápsulas listas para abrir al iniciar
  function verificarCapsulasPendientesHoy() {
    setTimeout(() => {
      const capsulas = cargarCapsulas();
      const activas = Object.values(capsulas).filter(c => !c.abierta);
      const listas = activas.filter(c => esHoyOMas(c.fechaDesbloqueo));
      if (listas.length > 0 && window.SunModal) {
        window.SunModal.confirm({
          title: `¡Cápsula del Tiempo Lista! <span style="display:inline-flex;gap:4px;vertical-align:-3px;margin-left:4px;"><span style="width:18px;height:18px;display:inline-block;">${SVG_HOURGLASS}</span><span style="width:18px;height:18px;display:inline-block;">${SVG_GIFT}</span></span>`,
          message: `Tienes ${listas.length} recuerdo(s) esperando ser abiertos hoy en tu álbum. ¿Quieres verlos ahora?`,
          icon: SVG_SPARKLE_MEDAL,
          confirmText: "Ver cápsula",
          cancelText: "Luego"
        }).then(ok => {
          if (ok) {
            const albumLink = document.querySelector('[data-view-link="album"]');
            albumLink?.click();
            abrirModalListadoCapsulas();
          }
        });
      }
    }, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      iniciarObservador();
      verificarCapsulasPendientesHoy();
    });
  } else {
    iniciarObservador();
    verificarCapsulasPendientesHoy();
  }

  // Exportar API para uso global
  window.SunCapsulaTiempo = {
    abrirModalConfig: abrirModalConfigCapsula,
    abrirModalListado: abrirModalListadoCapsulas,
    actualizar: () => {
      actualizarBotonHeader();
      aplicarCapsulasAlGrid();
    }
  };

  console.log("✅ capsula-tiempo.js cargado correctamente");
})();
