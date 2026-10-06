/* ============================================================
   RPG-FILTROS-COLECCION.JS — Filtros avanzados para la colección
   ============================================================ */
(function () {
    "use strict";

    let intentos = 0;
    function iniciar() {
        if (!window.RpgLoot) {
            intentos++;
            if (intentos > 100) return;
            setTimeout(iniciar, 100);
            return;
        }
        ejecutar();
    }

    iniciar();

    function ejecutar() {

    // ---------- Estado de filtros ----------
    const filtros = {
        rareza: "todos",       // todos | comun | raro | epico | legendario | mitico | tornasol
        tipo: "todos",         // todos | atk | def | hp | util | key
        conStats: false,       // solo items con stats
        conHabilidades: false, // solo items con habilidades
        busqueda: ""
    };

    // ---------- Extender renderColeccion ----------
    const _renderOrig = window.RpgLoot.renderColeccion;

    window.RpgLoot.renderColeccion = function () {
        // Llamar al render original
        _renderOrig.call(this);

        // Aplicar filtros después
        aplicarFiltros();
    };

    // ---------- Aplicar filtros al grid ya renderizado ----------
    function aplicarFiltros() {
        const panel = document.querySelector('[data-rpg-panel="objetos"]');
        if (!panel) return;

        const grid = panel.querySelector(".rpg-coleccion-grid");
        if (!grid) return;

        const items = grid.querySelectorAll(".rpg-coleccion-item");
        let visibles = 0;

        items.forEach(el => {
            const id = el.dataset.id;
            const item = window.RpgLoot.POOL.find(p => p.id === id);
            if (!item) { el.style.display = "none"; return; }

            let visible = true;

            // Filtro rareza
            if (filtros.rareza !== "todos" && item.rar !== filtros.rareza) visible = false;

            // Filtro tipo
            if (filtros.tipo !== "todos" && item.tipo !== filtros.tipo) visible = false;

            // Filtro con stats
            if (filtros.conStats && (!item.stats || !Object.keys(item.stats).length)) visible = false;

            // Filtro con habilidades
            if (filtros.conHabilidades && (!item.habilidades || !item.habilidades.length)) visible = false;

            // Filtro búsqueda
            if (filtros.busqueda) {
                const q = filtros.busqueda.toLowerCase();
                const nombre = (item.nombre || "").toLowerCase();
                const desc = (item.desc || "").toLowerCase();
                if (!nombre.includes(q) && !desc.includes(q)) visible = false;
            }

            el.style.display = visible ? "" : "none";
            if (visible) visibles++;
        });

        // Actualizar contador
        const contador = panel.querySelector(".rpg-coleccion-count");
        if (contador) {
            const total = window.RpgLoot.POOL.length;
            contador.textContent = `Mostrando ${visibles} de ${total} items`;
        }

        // Si no hay visibles, mostrar mensaje
        let empty = panel.querySelector(".rpg-coleccion-empty-filter");
        if (visibles === 0) {
            if (!empty) {
                empty = document.createElement("div");
                empty.className = "rpg-coleccion-empty-filter";
                empty.style.cssText = "grid-column:1/-1;text-align:center;padding:2rem 1rem;opacity:.6;font-style:italic;";
                empty.textContent = "No hay items que coincidan con los filtros.";
                grid.appendChild(empty);
            }
            empty.style.display = "block";
        } else if (empty) {
            empty.style.display = "none";
        }
    }

    // ---------- Inyectar UI de filtros ----------
    function inyectarFiltros() {
        const panel = document.querySelector('[data-rpg-panel="objetos"]');
        if (!panel) return;
        if (panel.querySelector(".rpg-filtros-avanzados")) return;

        const header = panel.querySelector(".rpg-coleccion-header");
        if (!header) return;

        const filtrosDiv = document.createElement("div");
        filtrosDiv.className = "rpg-filtros-avanzados";
        filtrosDiv.innerHTML = `
      <div class="rpg-filtros-row">
        <div class="rpg-filtro-grupo">
          <label>Rareza:</label>
          <select class="rpg-filtro-select" data-filtro="rareza">
            <option value="todos">Todas</option>
            <option value="comun">⚪ Común</option>
            <option value="raro">🔵 Raro</option>
            <option value="epico">🟣 Épico</option>
            <option value="legendario">🟡 Legendario</option>
            <option value="mitico">🌸 Mítico</option>
            <option value="tornasol">🌈 Tornasol</option>
          </select>
        </div>

        <div class="rpg-filtro-grupo">
          <label>Tipo:</label>
          <select class="rpg-filtro-select" data-filtro="tipo">
            <option value="todos">Todos</option>
            <option value="atk">⚔️ Ataque</option>
            <option value="def">🛡️ Defensa</option>
            <option value="hp">❤️ Vida</option>
            <option value="util">📦 Utilidad</option>
            <option value="key">🔑 Llave</option>
          </select>
        </div>

        <label class="rpg-filtro-check">
          <input type="checkbox" data-filtro="conStats">
          <span>⚡ Con stats</span>
        </label>

        <label class="rpg-filtro-check">
          <input type="checkbox" data-filtro="conHabilidades">
          <span>✨ Con habilidades</span>
        </label>

        <input type="search" class="rpg-filtro-busqueda" data-filtro="busqueda" placeholder="🔍 Buscar...">
      </div>
    `;

        // Insertar después del header
        header.parentNode.insertBefore(filtrosDiv, header.nextSibling);

        // Listeners
        filtrosDiv.querySelectorAll("[data-filtro]").forEach(el => {
            const key = el.dataset.filtro;
            if (el.type === "checkbox") {
                el.addEventListener("change", () => {
                    filtros[key] = el.checked;
                    aplicarFiltros();
                });
            } else if (el.type === "search") {
                let timeout;
                el.addEventListener("input", () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        filtros[key] = el.value.trim();
                        aplicarFiltros();
                    }, 200);
                });
            } else {
                el.addEventListener("change", () => {
                    filtros[key] = el.value;
                    aplicarFiltros();
                });
            }
        });
    }

    // ---------- Inyectar CSS ----------
    const style = document.createElement("style");
    style.textContent = `
    .rpg-filtros-avanzados {
      margin: 1rem 0;
      padding: .85rem;
      background: rgba(255,217,61,.04);
      border: 1px solid rgba(255,217,61,.18);
      border-radius: 12px;
    }
    .rpg-filtros-row {
      display: flex;
      gap: .8rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .rpg-filtro-grupo {
      display: flex;
      align-items: center;
      gap: .4rem;
    }
    .rpg-filtro-grupo label {
      font-size: .72rem;
      font-weight: 900;
      letter-spacing: .05em;
      text-transform: uppercase;
      opacity: .7;
    }
    .rpg-filtro-select {
      padding: .4rem .6rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(0,0,0,.35);
      color: var(--text, #fff);
      font-family: inherit;
      font-size: .82rem;
      cursor: pointer;
    }
    .rpg-filtro-check {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .35rem .6rem;
      border-radius: 8px;
      background: rgba(0,0,0,.25);
      font-size: .78rem;
      cursor: pointer;
      border: 1px solid rgba(255,255,255,.1);
    }
    .rpg-filtro-check input {
      accent-color: #ffd93d;
      cursor: pointer;
    }
    .rpg-filtro-busqueda {
      flex: 1;
      min-width: 140px;
      padding: .45rem .7rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,.15);
      background: rgba(0,0,0,.35);
      color: var(--text, #fff);
      font-family: inherit;
      font-size: .82rem;
      outline: none;
    }
    .rpg-filtro-busqueda:focus {
      border-color: #ffd93d;
      box-shadow: 0 0 0 3px rgba(255,217,61,.15);
    }
  `;
    document.head.appendChild(style);

    // ---------- Inyectar al cambiar de tab ----------
    window.addEventListener("sunad:rpg-tab", e => {
        if (e.detail?.tab === "objetos") {
            setTimeout(() => {
                inyectarFiltros();
                aplicarFiltros();
            }, 150);
        }
    });

    // Inyectar también al arranque
    setTimeout(() => {
        inyectarFiltros();
        aplicarFiltros();
    }, 1500);

    console.log("🔍 rpg-filtros-coleccion.js cargado");
    }
})();