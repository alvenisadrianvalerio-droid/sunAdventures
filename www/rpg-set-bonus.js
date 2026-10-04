/* ============================================================
   RPG-SET-BONUS.JS — Bonus por equipar 3 items del mismo tipo
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
        const RL = window.RpgLoot;

    // ---------- Bonus por conjunto ----------
    const SETS = {
        atk: {
            nombre: "Guerrero",
            requisito: 3,
            bonus: { atk: 15, crit: 10 },
            desc: "+15 ATK · +10% crítico"
        },
        def: {
            nombre: "Guardián",
            requisito: 3,
            bonus: { def: 10, hp: 50 },
            desc: "+10 DEF · +50 HP máximo"
        },
        hp: {
            nombre: "Vitalista",
            requisito: 3,
            bonus: { hp: 100, regen: 5 },
            desc: "+100 HP · +5 regen/turno"
        },
        util: {
            nombre: "Explorador",
            requisito: 3,
            bonus: { xp: 25, oro: 25 },
            desc: "+25% XP · +25% oro"
        }
    };

    // ---------- Contar tipos en el inventario ----------
    function contarTipos() {
        const loot = RL.cargarLoot();
        const contador = { atk: 0, def: 0, hp: 0, util: 0, key: 0 };

        Object.entries(loot).forEach(([id, cantidad]) => {
            const item = RL.POOL.find(p => p.id === id);
            if (!item) return;
            const tipo = item.tipo || "util";
            if (contador[tipo] !== undefined) contador[tipo] += cantidad;
        });

        return contador;
    }

    // ---------- Calcular sets activos ----------
    function setsActivos() {
        const tipos = contarTipos();
        const activos = [];

        Object.entries(SETS).forEach(([tipo, set]) => {
            if (tipos[tipo] >= set.requisito) {
                activos.push({
                    tipo,
                    nombre: set.nombre,
                    cantidad: tipos[tipo],
                    bonus: set.bonus,
                    desc: set.desc
                });
            }
        });

        return activos;
    }

    // ---------- Aplicar sets al héroe (reemplaza la funcion de bonus) ----------
    const _aplicarBonusOrig = RL.aplicarBonus;

    RL.aplicarBonus = function (item) {
        _aplicarBonusOrig.call(this, item);
        // El set bonus se recalcula aparte con aplicarSets()
    };

    // ---------- Aplicar/actualizar sets en localStorage ----------
    function aplicarSets() {
        const sets = setsActivos();
        const u = window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
        const key = `sa_rpg_sets_${u}`;

        // Guardar sets activos
        localStorage.setItem(key, JSON.stringify(sets));

        window.dispatchEvent(new Event("rpg:stats-cambiados"));
        return sets;
    }

    // ---------- Recalcular cuando cambia el inventario ----------
    window.addEventListener("rpg:victoria", () => setTimeout(aplicarSets, 500));
    window.addEventListener("rpg:stats-cambiados", () => setTimeout(aplicarSets, 100));

    // ---------- UI: panel de sets activos ----------
    function inyectarPanelSets() {
        const panel = document.querySelector('[data-rpg-panel="objetos"]');
        if (!panel) return;

        // Eliminar panel anterior si existe
        panel.querySelector(".rpg-sets-panel")?.remove();

        const sets = setsActivos();
        if (!sets.length) return;

        const setsDiv = document.createElement("div");
        setsDiv.className = "rpg-sets-panel";
        setsDiv.innerHTML = `
      <div class="rpg-sets-titulo">🎯 Sets activos</div>
      <div class="rpg-sets-grid">
        ${sets.map(s => `
          <div class="rpg-set-card tipo-${s.tipo}">
            <div class="rpg-set-nombre">${s.nombre}</div>
            <div class="rpg-set-cantidad">${s.cantidad} items tipo ${s.tipo}</div>
            <div class="rpg-set-bonus">${s.desc}</div>
          </div>
        `).join("")}
      </div>
    `;

        const header = panel.querySelector(".rpg-coleccion-header");
        if (header) {
            header.parentNode.insertBefore(setsDiv, header.nextSibling);
        } else {
            panel.prepend(setsDiv);
        }
    }

    // ---------- CSS ----------
    const style = document.createElement("style");
    style.textContent = `
    .rpg-sets-panel {
      margin: 1rem 0;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(77,212,142,.08), rgba(166,132,240,.05));
      border: 1px solid rgba(77,212,142,.3);
      border-radius: 14px;
    }
    .rpg-sets-titulo {
      font-size: .85rem;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #4dd48e;
      margin-bottom: .7rem;
    }
    .rpg-sets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: .6rem;
    }
    .rpg-set-card {
      padding: .75rem .9rem;
      border-radius: 12px;
      background: rgba(0,0,0,.25);
      border-left: 4px solid #4dd48e;
    }
    .rpg-set-card.tipo-atk { border-left-color: #ff5470; }
    .rpg-set-card.tipo-def { border-left-color: #6cb8ff; }
    .rpg-set-card.tipo-hp { border-left-color: #ff6b9d; }
    .rpg-set-card.tipo-util { border-left-color: #ffd93d; }
    .rpg-set-nombre {
      font-size: .95rem;
      font-weight: 900;
      color: var(--text, #fff);
      margin-bottom: .15rem;
    }
    .rpg-set-cantidad {
      font-size: .7rem;
      opacity: .7;
      margin-bottom: .3rem;
    }
    .rpg-set-bonus {
      font-size: .78rem;
      font-weight: 700;
      color: #4dd48e;
    }
  `;
    document.head.appendChild(style);

    // ---------- Inyectar al cambiar de tab ----------
    window.addEventListener("sunadventures:rpg-tab", e => {
        if (e.detail?.tab === "objetos") {
            setTimeout(inyectarPanelSets, 250);
        }
    });

    setTimeout(() => {
        inyectarPanelSets();
        aplicarSets();
    }, 1800);

    // ---------- API pública ----------
    window.RpgSets = {
        setsActivos,
        aplicarSets,
        contarTipos,
        SETS
    };

    console.log("🎯 rpg-set-bonus.js cargado · 4 sets configurados");
    }
})();