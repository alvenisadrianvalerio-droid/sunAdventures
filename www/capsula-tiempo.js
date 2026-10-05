/* ============================================================
   CAPSULA-TIEMPO.JS — Módulo de Cápsulas del Tiempo para el Álbum
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY_PREFIX = "sunadventures_capsulas_";
  const SVG_CAPSULE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const SVG_HOURGLASS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>';
  const SVG_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const SVG_UNLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';

  const getStorageKey = () => {
    const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
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
      btn.innerHTML = `<span>⏳</span> Cápsulas del Tiempo <span class="capsula-badge-count">0</span>`;
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
          <div class="capsula-hero-icon">⏳</div>
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
          <button type="button" class="btn-primary" id="btn-guardar-capsula">🔒 Sellar Cápsula</button>
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
            icon: "🔓"
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
          title: "¡Cápsula Sellada! ⏳",
          message: `Esta foto ha sido sellada. Podrás abrirla el ${formatearFechaBonita(fechaElegida)}. ¡La paciencia guarda los mejores tesoros!`,
          icon: "🔒"
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
          <div class="capsula-hero-icon" style="border-color:#ffd93d;background:radial-gradient(circle,rgba(255,217,61,.3),rgba(214,93,177,.3))">✨</div>
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
          <span>📅 Foto tomada el: <strong>${foto.fecha ? formatearFechaBonita(foto.fecha) : "Sin fecha"}</strong></span><br>
          <small>Sellada el ${formatearFechaBonita(capsula.fechaCreacion)} · Abierta hoy</small>
        </div>

        <div class="capsula-modal-actions" style="justify-content:center;">
          <button type="button" class="btn-primary" id="btn-completar-revelar" style="background:linear-gradient(135deg,#ffd93d 0%,#ff6f91 100%);color:#2b2118;font-weight:800;padding:.8rem 2rem;">
            💖 Guardar en el Álbum
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
          <div class="capsula-empty-state-icon">⏳</div>
          <p>No tienes ninguna cápsula del tiempo activa.</p>
          <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-top:0.4rem;">
            Toca el botón ⏳ en cualquier foto del álbum para convertirla en una cápsula y programar su apertura.
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
                    ? "✅ Ya abierta y completada"
                    : lista
                      ? "✨ ¡Lista para abrir hoy!"
                      : `Abre en ${dias} día${dias === 1 ? '' : 's'} (${formatearFechaBonita(cap.fechaDesbloqueo)})`}
                </p>
              </div>
            </div>
            <div class="capsula-list-status">
              ${!cap.abierta && lista
                ? `<button type="button" class="btn-primary btn-abrir-desde-lista" data-foto-id="${id}" style="padding:0.4rem 0.85rem;font-size:0.8rem;">Abrir 🎁</button>`
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
          <div class="capsula-hero-icon">⏳</div>
          <h3 class="capsula-modal-title">Cápsulas del Tiempo</h3>
          <p class="capsula-modal-desc">
            Momentos sellados esperando su fecha señalada para volver a brillar.
          </p>
        </div>

        ${itemsHtml}

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

  /* Inyectar botones y modificar tarjetas polaroid */
  function aplicarCapsulasAlGrid() {
    const grid = document.getElementById("album-grid");
    if (!grid) return;

    const fotos = window._fotos || [];
    const capsulas = cargarCapsulas();
    const polaroids = grid.querySelectorAll(".polaroid");

    polaroids.forEach((article, index) => {
      const foto = fotos[index];
      if (!foto) return;
      article.setAttribute("data-foto-id", foto.id);

      const capsula = capsulas[foto.id];
      const esCapsulaActiva = capsula && !capsula.abierta;
      const puedeAbrirse = esCapsulaActiva && esHoyOMas(capsula.fechaDesbloqueo);

      // Botón de Cápsula en la polaroid
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

        // Insertar en la cabecera de la polaroid junto a editar
        article.appendChild(btnCapsula);
      }

      // Remover overlay anterior si lo hubiera
      const viejoOverlay = article.querySelector(".polaroid-capsula-overlay");
      if (viejoOverlay) viejoOverlay.remove();

      article.classList.remove("polaroid-capsula-locked", "polaroid-capsula-ready");

      if (esCapsulaActiva) {
        article.classList.add("polaroid-capsula-locked");
        if (puedeAbrirse) article.classList.add("polaroid-capsula-ready");

        const overlay = document.createElement("div");
        overlay.className = "polaroid-capsula-overlay";

        const dias = diasRestantes(capsula.fechaDesbloqueo);
        const fechaTexto = formatearFechaBonita(capsula.fechaDesbloqueo);

        if (puedeAbrirse) {
          overlay.innerHTML = `
            <div class="polaroid-capsula-overlay-icon">🎁</div>
            <div class="polaroid-capsula-overlay-title">¡LLEGÓ EL DÍA!</div>
            <div class="polaroid-capsula-overlay-badge">Tu cápsula está lista</div>
            <button type="button" class="polaroid-capsula-overlay-btn btn-abrir-capsula">✨ Abrir Recuerdo</button>
          `;
        } else {
          overlay.innerHTML = `
            <div class="polaroid-capsula-overlay-icon">🔒</div>
            <div class="polaroid-capsula-overlay-title">Cápsula del Tiempo</div>
            <div class="polaroid-capsula-overlay-badge">Abre en ${dias} día${dias === 1 ? '' : 's'}</div>
            <small style="font-size:0.75rem;color:rgba(255,255,255,0.7);margin-top:0.4rem;">${fechaTexto}</small>
            <button type="button" class="polaroid-capsula-overlay-btn btn-gestionar-capsula" style="background:rgba(255,255,255,0.15);color:#fff;box-shadow:none;">Ajustar</button>
          `;
        }

        // Listener para abrir o ajustar
        overlay.querySelector(".btn-abrir-capsula")?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const img = article.querySelector("img");
          abrirModalRevelarCapsula(foto, capsula, img?.src || "");
        });

        overlay.querySelector(".btn-gestionar-capsula")?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          abrirModalConfigCapsula(foto);
        });

        // Click en toda la tarjeta si ya puede abrirse
        overlay.addEventListener("click", (e) => {
          if (e.target.closest("button")) return;
          e.stopPropagation();
          if (puedeAbrirse) {
            const img = article.querySelector("img");
            abrirModalRevelarCapsula(foto, capsula, img?.src || "");
          } else {
            abrirModalConfigCapsula(foto);
          }
        });

        article.appendChild(overlay);
      }
    });
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
        if (m.addedNodes.length > 0) hayCambios = true;
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
          title: "¡Cápsula del Tiempo Lista! ⏳🎁",
          message: `Tienes ${listas.length} recuerdo(s) esperando ser abiertos hoy en tu álbum. ¿Quieres verlos ahora?`,
          icon: "✨",
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
