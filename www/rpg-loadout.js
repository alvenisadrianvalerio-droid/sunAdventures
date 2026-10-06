/* ============================================================
   RPG-LOADOUT.JS — Sistema de 4 habilidades equipadas
   Permite elegir qué 4 habilidades de items llevar a combate.
   ============================================================ */
(function () {
    "use strict";

    let intentos = 0;
    function iniciar() {
        if (!window.RpgLoot || !window.RpgItems) {
            intentos++;
            if (intentos > 100) {
                console.warn("⚠️ rpg-loadout.js: Timeout esperando RpgLoot o RpgItems.");
                return;
            }
            setTimeout(iniciar, 100);
            return;
        }
        ejecutar();
    }

    iniciar();

    function ejecutar() {

    const MAX_HABS = 4;
    const SLOT_KEY = () => `sa_rpg_loadout_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;

    // ─── Obtener loadout guardado ───
    function getLoadout() {
        try {
            return JSON.parse(localStorage.getItem(SLOT_KEY()) || "[]").slice(0, MAX_HABS);
        } catch { return []; }
    }

    function setLoadout(ids) {
        localStorage.setItem(SLOT_KEY(), JSON.stringify(ids.slice(0, MAX_HABS)));
    }

    // ─── Guardar función original de RpgItems para evitar recursión ───
    const _getHabsActivasOrig = window.RpgItems.getHabilidadesActivas;

    // ─── Obtener todas las habilidades disponibles ───
    function getTodasHabilidades() {
        return (_getHabsActivasOrig ? _getHabsActivasOrig.call(window.RpgItems) : []) || [];
    }

    // ─── Obtener habilidades equipadas (para combate) ───
    function getHabilidadesEquipadas() {
        const todas = getTodasHabilidades();
        const loadout = getLoadout();

        // Si nunca se ha configurado el loadout (clave no existe en localStorage)
        if (localStorage.getItem(SLOT_KEY()) === null) {
            const auto = todas.slice(0, MAX_HABS).map(h => `${h.itemId}::${h.nombre}`);
            setLoadout(auto);
            return todas.slice(0, MAX_HABS);
        }

        // Mapear exactamente según el orden guardado por el usuario
        const equipadas = [];
        loadout.forEach(slot => {
            const [itemId, nombre] = slot.split("::");
            const hab = todas.find(h => h.itemId === itemId && h.nombre === nombre);
            if (hab) equipadas.push(hab);
        });

        return equipadas.slice(0, MAX_HABS);
    }

    // ─── Toggle de una habilidad en el loadout ───
    function toggleHabilidad(itemId, nombre) {
        const slotId = `${itemId}::${nombre}`;
        const loadout = getLoadout();
        const idx = loadout.indexOf(slotId);

        if (idx !== -1) {
            // Quitar
            loadout.splice(idx, 1);
            setLoadout(loadout);
            return { accion: "quitada", loadout };
        }

        if (loadout.length >= MAX_HABS) {
            return { accion: "lleno", loadout, error: `Máximo ${MAX_HABS} habilidades equipadas. Quita una primero.` };
        }

        loadout.push(slotId);
        setLoadout(loadout);
        return { accion: "añadida", loadout };
    }

    // ─── Desequipar habilidad específica por índice o clave ───
    function desequiparHabilidad(itemId, nombre) {
        const slotId = `${itemId}::${nombre}`;
        const loadout = getLoadout();
        const idx = loadout.indexOf(slotId);
        if (idx !== -1) {
            loadout.splice(idx, 1);
            setLoadout(loadout);
            actualizarPanelLoadout();
            return true;
        }
        return false;
    }

    // ─── Exponer en RpgItems ───
    window.RpgItems.getHabilidadesEquipadas = getHabilidadesEquipadas;
    window.RpgItems.getTodasHabilidades = getTodasHabilidades;
    window.RpgItems.toggleHabilidad = toggleHabilidad;
    window.RpgItems.desequiparHabilidad = desequiparHabilidad;
    window.RpgItems.getLoadout = getLoadout;
    window.RpgItems.clearLoadout = () => setLoadout([]);

    // ─── Sobrescribir getHabilidadesActivas para que SOLO devuelva las 4 ───
    // Esto hace que rpg.js use automáticamente solo 4 en combate.
    window.RpgItems.getHabilidadesActivas = function () {
        return getHabilidadesEquipadas();
    };
    window.RpgItems.getHabilidadesActivasTodas = _getHabsActivasOrig;

    // ─── UI: Panel de Loadout en la colección ───
    function inyectarPanelLoadout() {
        const panel = document.querySelector('[data-rpg-panel="objetos"]');
        if (!panel) return;
        if (panel.querySelector(".rpg-loadout-panel")) {
            actualizarPanelLoadout();
            return;
        }

        const div = document.createElement("div");
        div.className = "rpg-loadout-panel";
        div.innerHTML = `
      <div class="rpg-loadout-header">
        <span class="rpg-loadout-titulo">⚔️ Habilidades equipadas</span>
        <span class="rpg-loadout-contador" id="rpg-loadout-contador"></span>
      </div>
      <div class="rpg-loadout-slots" id="rpg-loadout-slots"></div>
      <button type="button" class="rpg-loadout-btn" id="rpg-loadout-abrir">
        <img src="img/sprites complementarios/diana.png" alt="" class="rpg-loadout-btn-icon" style="width:18px;height:18px;vertical-align:middle;object-fit:contain;margin-right:6px;display:inline-block;">Elegir habilidades
      </button>
    `;

        const header = panel.querySelector(".rpg-coleccion-header");
        if (header) {
            header.parentNode.insertBefore(div, header);
        } else {
            panel.prepend(div);
        }

        actualizarPanelLoadout();

        document.getElementById("rpg-loadout-abrir").addEventListener("click", abrirModalLoadout);
    }

    function actualizarPanelLoadout() {
        const slots = document.getElementById("rpg-loadout-slots");
        const contador = document.getElementById("rpg-loadout-contador");
        if (!slots) return;

        const equipadas = getHabilidadesEquipadas();

        slots.innerHTML = "";
        for (let i = 0; i < MAX_HABS; i++) {
            const hab = equipadas[i];
            const slot = document.createElement("div");
            slot.className = "rpg-loadout-slot" + (hab ? " ocupado" : " clickable-vacio");

            if (hab) {
                const tipo = (hab.tipo || "daño").replace(/_/g, " ");
                slot.innerHTML = `
          <span class="rpg-loadout-slot-num">${i + 1}</span>
          <button type="button" class="rpg-loadout-slot-quitar" title="Quitar habilidad">×</button>
          <span class="rpg-loadout-slot-nombre">${hab.nombre}</span>
          <span class="rpg-loadout-slot-tipo">${tipo}</span>
        `;
                slot.title = `${hab.nombre} (${tipo})\nHaz clic para cambiar o quitar`;
                slot.querySelector(".rpg-loadout-slot-quitar").addEventListener("click", (e) => {
                    e.stopPropagation();
                    desequiparHabilidad(hab.itemId, hab.nombre);
                });
                slot.addEventListener("click", () => {
                    abrirModalLoadout();
                });
            } else {
                slot.innerHTML = `<span class="rpg-loadout-slot-num">${i + 1}</span><span class="rpg-loadout-slot-vacio">+ Añadir</span>`;
                slot.title = "Espacio libre. Haz clic para elegir una habilidad.";
                slot.addEventListener("click", () => {
                    abrirModalLoadout();
                });
            }

            slots.appendChild(slot);
        }

        if (contador) contador.textContent = `${equipadas.length} / ${MAX_HABS}`;
    }

    // ─── Modal para elegir habilidades ───
    function abrirModalLoadout() {
        let modal = document.getElementById("rpg-loadout-modal");
        if (modal) modal.remove();

        modal = document.createElement("div");
        modal.id = "rpg-loadout-modal";
        modal.className = "rpg-loadout-modal";
        modal.innerHTML = `
      <div class="rpg-loadout-modal-backdrop"></div>
      <div class="rpg-loadout-modal-card">
        <div class="rpg-loadout-modal-header">
          <h3 style="display:flex;align-items:center;gap:8px;">
            <img src="img/sprites complementarios/estrella.png" alt="" style="width:20px;height:20px;object-fit:contain;display:inline-block;">
            <span>Elige tus 4 habilidades</span>
          </h3>
          <button type="button" class="rpg-loadout-modal-close">×</button>
        </div>
        <p class="rpg-loadout-modal-hint">Estas son las habilidades que llevas a combate. Solo puedes tener ${MAX_HABS} activas.</p>
        <div class="rpg-loadout-modal-lista" id="rpg-loadout-modal-lista"></div>
        <div class="rpg-loadout-modal-footer">
          <span class="rpg-loadout-modal-contador" id="rpg-loadout-modal-contador"></span>
          <button type="button" class="rpg-loadout-modal-btn" id="rpg-loadout-modal-cerrar">Listo</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add("active"));

        // Cerrar
        const cerrar = () => {
            modal.classList.remove("active");
            setTimeout(() => modal.remove(), 250);
        };
        modal.querySelector(".rpg-loadout-modal-close").addEventListener("click", cerrar);
        modal.querySelector(".rpg-loadout-modal-backdrop").addEventListener("click", cerrar);
        document.getElementById("rpg-loadout-modal-cerrar").addEventListener("click", cerrar);

        renderModalLista();
    }

    function renderModalLista() {
        const lista = document.getElementById("rpg-loadout-modal-lista");
        const contador = document.getElementById("rpg-loadout-modal-contador");
        if (!lista) return;

        const todas = getTodasHabilidades();
        const equipadas = getHabilidadesEquipadas();
        const loadoutKeys = equipadas.map(h => `${h.itemId}::${h.nombre}`);

        if (contador) contador.textContent = `${equipadas.length} / ${MAX_HABS} equipadas`;

        if (todas.length === 0) {
            lista.innerHTML = `<p class="rpg-loadout-modal-vacio">No tienes habilidades de items activas.</p>`;
            return;
        }

        // Agrupar por tipo para ordenar
        const grupos = {};
        todas.forEach(h => {
            const tipo = h.tipo || "daño";
            if (!grupos[tipo]) grupos[tipo] = [];
            grupos[tipo].push(h);
        });

        let html = "";
        const RL = window.RpgLoot;
        const calidadesDef = {
            normal: { label: "Normal", icon: "" },
            reforzado: { label: "Reforzado", icon: "⚡" },
            impecable: { label: "Impecable", icon: "✨" },
            ancestral: { label: "Ancestral", icon: "🔥" }
        };

        Object.entries(grupos).forEach(([tipo, habs]) => {
            html += `<div class="rpg-loadout-grupo">
        <div class="rpg-loadout-grupo-titulo">${tipo.replace(/_/g, " ")}</div>
        <div class="rpg-loadout-grupo-lista">
          ${habs.map(h => {
                const key = `${h.itemId}::${h.nombre}`;
                const activa = loadoutKeys.includes(key);
                const bloqueada = !activa && equipadas.length >= MAX_HABS;
                
                // Buscar el item asociado para obtener nombre, sprite, calidad y rareza
                const it = RL?.POOL?.find(p => p.id === h.itemId);
                const calKey = (it?.calidad || "normal").toLowerCase();
                const calInfo = calidadesDef[calKey] || { label: "Normal", icon: "" };
                const rarLabel = it?.rar ? it.rar.toUpperCase() : "";

                // Render icono / sprite del arma
                let itemVisual = "";
                if (it && RL?.renderIcono) {
                    itemVisual = RL.renderIcono(it, "24px");
                } else if (it && window.renderSprite && Array.isArray(it.sprite)) {
                    itemVisual = window.renderSprite(it.sprite[0], it.sprite[1], 24);
                }

                return `
              <button type="button" class="rpg-loadout-item${activa ? " activa" : ""}${bloqueada ? " bloqueada" : ""}" 
                data-item-id="${h.itemId}" data-nombre="${h.nombre}" ${bloqueada ? "disabled" : ""}>
                <span class="rpg-loadout-item-check">${activa ? "✓" : "+"}</span>
                <div class="rpg-loadout-item-body">
                  <div class="rpg-loadout-item-info">
                    <strong>${h.nombre}</strong>
                    <small>${h.desc || h.tipo}</small>
                  </div>
                  ${it ? `
                    <div class="rpg-loadout-item-origen">
                      <div class="rpg-loadout-item-arma rar-${it.rar || "comun"}">
                        <span class="rpg-loadout-arma-icon">${itemVisual}</span>
                        <span class="rpg-loadout-arma-nombre">${it.nombre}</span>
                      </div>
                      <span class="rpg-loadout-calidad-badge cal-${calKey}" title="Calidad ${calInfo.label}">
                        ${calInfo.icon ? `<span class="rpg-loadout-cal-icon">${calInfo.icon}</span>` : ""}
                        <span>${calInfo.label}</span>
                      </span>
                    </div>
                  ` : ""}
                </div>
              </button>
            `;
            }).join("")}
        </div>
      </div>`;
        });

        lista.innerHTML = html;

        lista.querySelectorAll(".rpg-loadout-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const itemId = btn.dataset.itemId;
                const nombre = btn.dataset.nombre;
                const r = toggleHabilidad(itemId, nombre);

                if (r.error) {
                    alert(r.error);
                    return;
                }

                renderModalLista();
                actualizarPanelLoadout();
            });
        });
    }

    // ─── CSS ───
    const style = document.createElement("style");
    style.textContent = `
    /* Panel de loadout en la colección */
    .rpg-loadout-panel {
      margin: 1rem 0;
      padding: .85rem;
      background: linear-gradient(135deg, rgba(166,132,240,.08), rgba(166,132,240,.03));
      border: 1px solid rgba(166,132,240,.3);
      border-radius: 14px;
    }
    .rpg-loadout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .6rem;
    }
    .rpg-loadout-titulo {
      font-size: .82rem;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #c4a5ff;
    }
    .rpg-loadout-contador {
      font-size: .72rem;
      font-weight: 900;
      padding: .15rem .55rem;
      border-radius: 999px;
      background: rgba(166,132,240,.2);
      color: #d4b8ff;
    }
    .rpg-loadout-slots {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: .45rem;
      margin-bottom: .6rem;
    }
    .rpg-loadout-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: .2rem;
      padding: .5rem .3rem;
      border-radius: 10px;
      border: 1.5px dashed rgba(166,132,240,.3);
      background: rgba(0,0,0,.25);
      min-height: 64px;
      text-align: center;
      position: relative;
      cursor: pointer;
      transition: all .2s;
    }
    .rpg-loadout-slot:hover {
      border-color: rgba(166,132,240,.8);
      transform: translateY(-1px);
    }
    .rpg-loadout-slot.ocupado {
      border-style: solid;
      border-color: rgba(166,132,240,.65);
      background: linear-gradient(135deg, rgba(166,132,240,.2), rgba(166,132,240,.05));
    }
    .rpg-loadout-slot-num {
      position: absolute;
      top: 3px;
      left: 5px;
      font-size: .62rem;
      font-weight: 900;
      color: #c4a5ff;
      opacity: .8;
    }
    .rpg-loadout-slot-quitar {
      position: absolute;
      top: 2px;
      right: 3px;
      width: 18px;
      height: 18px;
      line-height: 16px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: rgba(255, 80, 80, .25);
      color: #ff9999;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .15s;
    }
    .rpg-loadout-slot-quitar:hover {
      background: rgba(255, 60, 60, .85);
      color: #fff;
      transform: scale(1.15);
    }
    .rpg-loadout-slot-nombre {
      font-size: .72rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.15;
      word-break: break-word;
    }
    .rpg-loadout-slot-tipo {
      font-size: .58rem;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #c4a5ff;
      opacity: .75;
    }
    .rpg-loadout-slot-vacio {
      font-size: .72rem;
      font-weight: 700;
      color: #c4a5ff;
      opacity: .7;
    }
    .rpg-loadout-btn {
      width: 100%;
      padding: .55rem;
      border-radius: 10px;
      border: 1px solid rgba(166,132,240,.5);
      background: rgba(166,132,240,.15);
      color: #c4a5ff;
      font-family: inherit;
      font-size: .78rem;
      font-weight: 900;
      cursor: pointer;
      transition: all .2s;
    }
    .rpg-loadout-btn:hover {
      background: rgba(166,132,240,.3);
      transform: translateY(-1px);
    }

    /* Modal */
    .rpg-loadout-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .rpg-loadout-modal.active { display: flex; }
    .rpg-loadout-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.75);
      backdrop-filter: blur(6px);
    }
    .rpg-loadout-modal-card {
      position: relative;
      width: min(560px, 96vw);
      max-height: 88vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #14161f, #0b0c12);
      border: 2px solid rgba(166,132,240,.4);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,.7), 0 0 30px rgba(166,132,240,.2);
      animation: loadoutIn .3s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes loadoutIn {
      from { opacity: 0; transform: scale(.9); }
      to   { opacity: 1; transform: scale(1); }
    }
    .rpg-loadout-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem 1.4rem .6rem;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .rpg-loadout-modal-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #c4a5ff;
      font-weight: 900;
    }
    .rpg-loadout-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(255,255,255,.05);
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all .2s;
    }
    .rpg-loadout-modal-close:hover {
      transform: rotate(90deg);
      background: rgba(255,84,112,.3);
    }
    .rpg-loadout-modal-hint {
      margin: .6rem 1.4rem;
      font-size: .78rem;
      opacity: .7;
      font-style: italic;
    }
    .rpg-loadout-modal-lista {
      flex: 1;
      overflow-y: auto;
      padding: 0 1.2rem .6rem;
    }
    .rpg-loadout-grupo { margin-bottom: .9rem; }
    .rpg-loadout-grupo-titulo {
      font-size: .7rem;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #c4a5ff;
      opacity: .75;
      margin-bottom: .4rem;
      padding-left: .2rem;
    }
    .rpg-loadout-grupo-lista {
      display: grid;
      gap: .35rem;
    }
    .rpg-loadout-item {
      display: grid;
      grid-template-columns: 32px 1fr;
      gap: .75rem;
      align-items: center;
      padding: .65rem .8rem;
      border-radius: 12px;
      border: 1.5px solid rgba(255,255,255,.1);
      background: rgba(0,0,0,.28);
      color: #fff;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: all .18s ease;
    }
    .rpg-loadout-item:hover:not(:disabled) {
      border-color: rgba(166,132,240,.5);
      background: rgba(166,132,240,.12);
      transform: translateX(2px);
    }
    .rpg-loadout-item.activa {
      border-color: #a684f0;
      background: linear-gradient(135deg, rgba(166,132,240,.28), rgba(166,132,240,.1));
      box-shadow: 0 0 16px rgba(166,132,240,.3);
    }
    .rpg-loadout-item.bloqueada {
      opacity: .35;
      cursor: not-allowed;
    }
    .rpg-loadout-item-check {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,.2);
      background: rgba(255,255,255,.05);
      font-weight: 900;
      font-size: .85rem;
      color: rgba(255,255,255,.5);
      flex-shrink: 0;
    }
    .rpg-loadout-item.activa .rpg-loadout-item-check {
      border-color: #a684f0;
      background: #a684f0;
      color: #fff;
      box-shadow: 0 0 10px rgba(166,132,240,.5);
    }

    /* Layout interno flexible y responsive */
    .rpg-loadout-item-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: .8rem;
      min-width: 0;
    }
    .rpg-loadout-item-info {
      display: flex;
      flex-direction: column;
      gap: .15rem;
      min-width: 0;
      flex: 1;
    }
    .rpg-loadout-item-info strong {
      font-size: .88rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: .01em;
    }
    .rpg-loadout-item-info small {
      font-size: .72rem;
      opacity: .72;
      line-height: 1.3;
      word-break: break-word;
    }

    /* Arma y Calidad */
    .rpg-loadout-item-origen {
      display: flex;
      align-items: center;
      gap: .5rem;
      flex-shrink: 0;
    }
    .rpg-loadout-item-arma {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.14);
      padding: .2rem .5rem;
      border-radius: 8px;
      max-width: 170px;
    }
    .rpg-loadout-arma-icon {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 4px;
    }
    .rpg-loadout-arma-icon .loot-sprite {
      width: 24px !important;
      height: 24px !important;
      border-radius: 4px !important;
      transform: none !important;
      filter: none !important;
    }
    .rpg-loadout-arma-icon .sprite-item {
      transform: scale(.85);
    }
    .rpg-loadout-arma-nombre {
      font-size: .74rem;
      font-weight: 800;
      color: #e8ecf2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rpg-loadout-item-arma.rar-comun { border-color: rgba(201,201,201,.4); color: #c9c9c9; }
    .rpg-loadout-item-arma.rar-raro { border-color: rgba(108,184,255,.5); color: #6cb8ff; }
    .rpg-loadout-item-arma.rar-epico { border-color: rgba(166,132,240,.5); color: #c4a5ff; }
    .rpg-loadout-item-arma.rar-legendario { border-color: rgba(255,217,61,.5); color: #ffd93d; }
    .rpg-loadout-item-arma.rar-mitico { border-color: rgba(255,107,157,.6); color: #ff6b9d; }
    .rpg-loadout-item-arma.rar-tornasol { border-color: rgba(176,245,255,.7); color: #b0f5ff; }

    /* Calidad Badge */
    .rpg-loadout-calidad-badge {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      font-size: .66rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .04em;
      padding: .2rem .45rem;
      border-radius: 6px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.12);
      color: #b0b8c4;
      white-space: nowrap;
    }
    .rpg-loadout-calidad-badge.cal-normal {
      background: rgba(255,255,255,.05);
      border-color: rgba(255,255,255,.15);
      color: #a0a6b5;
    }
    .rpg-loadout-calidad-badge.cal-reforzado {
      background: rgba(108,184,255,.15);
      border-color: rgba(108,184,255,.45);
      color: #6cb8ff;
    }
    .rpg-loadout-calidad-badge.cal-impecable {
      background: rgba(255,217,61,.15);
      border-color: rgba(255,217,61,.45);
      color: #ffd93d;
    }
    .rpg-loadout-calidad-badge.cal-ancestral {
      background: rgba(255,107,157,.18);
      border-color: rgba(255,107,157,.5);
      color: #ff6b9d;
    }
    .rpg-loadout-cal-icon {
      font-size: .75rem;
      line-height: 1;
    }

    .rpg-loadout-modal-vacio {
      text-align: center;
      padding: 2rem 1rem;
      opacity: .55;
      font-style: italic;
    }
    .rpg-loadout-modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: .9rem 1.4rem;
      border-top: 1px solid rgba(255,255,255,.06);
    }
    .rpg-loadout-modal-contador {
      font-size: .78rem;
      font-weight: 900;
      color: #c4a5ff;
    }
    .rpg-loadout-modal-btn {
      padding: .6rem 1.4rem;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #ffd93d, #ffae3d);
      color: #2b2118;
      font-family: inherit;
      font-size: .85rem;
      font-weight: 900;
      cursor: pointer;
      transition: transform .2s;
    }
    .rpg-loadout-modal-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(255,217,61,.5);
    }

    /* Adaptabilidad Responsive */
    @media (max-width: 640px) {
      .rpg-loadout-modal-card {
        width: 96vw;
        max-height: 92vh;
        border-radius: 16px;
      }
      .rpg-loadout-modal-header {
        padding: 1rem 1.1rem .5rem;
      }
      .rpg-loadout-modal-hint {
        margin: .4rem 1.1rem;
      }
      .rpg-loadout-modal-lista {
        padding: 0 1rem .6rem;
      }
      .rpg-loadout-item-body {
        flex-direction: column;
        align-items: flex-start;
        gap: .45rem;
      }
      .rpg-loadout-item-origen {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
      .rpg-loadout-item-arma {
        max-width: 100%;
      }
      .rpg-loadout-modal-footer {
        padding: .8rem 1.1rem;
      }
    }

    @media (max-width: 520px) {
      .rpg-loadout-slots { grid-template-columns: repeat(2, 1fr); }
    }
  `;
    document.head.appendChild(style);

    // ─── Inyectar al cambiar de tab ───
    window.addEventListener("sunad:rpg-tab", e => {
        if (e.detail?.tab === "objetos") {
            setTimeout(inyectarPanelLoadout, 200);
        }
    });

    setTimeout(inyectarPanelLoadout, 1800);

    // ─── API pública ───
    window.RpgLoadout = {
        getLoadout,
        setLoadout,
        getHabilidadesEquipadas,
        getTodasHabilidades,
        toggleHabilidad,
        clearLoadout: () => setLoadout([]),
        MAX_HABS
    };

    console.log("✅ rpg-loadout.js cargado · máximo 4 habilidades equipadas");
    }
})();