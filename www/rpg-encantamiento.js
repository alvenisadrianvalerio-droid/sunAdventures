/* ============================================================
   RPG-ENCANTAMIENTO.JS — Añade stats aleatorios con oro
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

    // ---------- Encantamientos posibles ----------
    const ENCANTAMIENTOS = [
        { id: "atk", nombre: "Filo afilado", icono: "⚔️", rango: [1, 5], peso: 100 },
        { id: "def", nombre: "Blindaje", icono: "🛡️", rango: [1, 4], peso: 100 },
        { id: "hp", nombre: "Vitalidad", icono: "❤️", rango: [5, 25], peso: 100 },
        { id: "crit", nombre: "Precisión", icono: "🎯", rango: [2, 8], peso: 60 },
        { id: "esq", nombre: "Evasión", icono: "💨", rango: [2, 6], peso: 60 },
        { id: "regen", nombre: "Regeneración", icono: "💚", rango: [1, 3], peso: 40 },
        { id: "lifesteal", nombre: "Vampirismo", icono: "🩸", rango: [1, 4], peso: 40 },
        { id: "thorns", nombre: "Espinas", icono: "🌵", rango: [1, 4], peso: 40 },
        { id: "xp", nombre: "Sabiduría", icono: "✨", rango: [3, 10], peso: 50 },
        { id: "oro", nombre: "Avaricia", icono: "💰", rango: [3, 12], peso: 50 },
        { id: "fuego", nombre: "Encantamiento ígneo", icono: "🔥", rango: [2, 6], peso: 30 },
        { id: "hielo", nombre: "Encantamiento gélido", icono: "❄️", rango: [2, 6], peso: 30 },
        { id: "rayo", nombre: "Encantamiento eléctrico", icono: "⚡", rango: [2, 6], peso: 30 },
        { id: "veneno", nombre: "Encantamiento venenoso", icono: "☠️", rango: [2, 6], peso: 30 }
    ];

    // ---------- Costo de encantamiento según rareza ----------
    const COSTO_ENCANTAMIENTO = {
        comun: 200,
        raro: 1000,
        epico: 5000,
        legendario: 25000,
        mitico: 100000,
        tornasol: 500000
    };

    // Máximo de encantamientos por item (según rareza)
    const MAX_ENCANTAMIENTOS = {
        comun: 1,
        raro: 2,
        epico: 3,
        legendario: 4,
        mitico: 5,
        tornasol: 6
    };

    // ---------- Obtener encantamientos guardados ----------
    function cargarEncantamientos() {
        const u = window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
        try {
            return JSON.parse(localStorage.getItem(`sa_rpg_encantamientos_${u}`) || "{}");
        } catch { return {}; }
    }

    function guardarEncantamientos(data) {
        const u = window._getUserIdSafe?.() || localStorage.getItem("sunadventures_uid") || "local";
        localStorage.setItem(`sa_rpg_encantamientos_${u}`, JSON.stringify(data));
    }

    // ---------- Obtener encantamientos de un item ----------
    function getEncantamientosItem(itemId) {
        const data = cargarEncantamientos();
        return data[itemId] || [];
    }

    // ---------- Sortear encantamiento aleatorio ----------
    function sortearEncantamiento() {
        const totalPeso = ENCANTAMIENTOS.reduce((s, e) => s + e.peso, 0);
        let r = Math.random() * totalPeso;
        for (const enc of ENCANTAMIENTOS) {
            r -= enc.peso;
            if (r <= 0) {
                const valor = Math.floor(Math.random() * (enc.rango[1] - enc.rango[0] + 1)) + enc.rango[0];
                return { ...enc, valor };
            }
        }
        return null;
    }

    // ---------- Aplicar encantamiento ----------
    async function encantar(itemId) {
        const item = RL.POOL.find(p => p.id === itemId);
        if (!item) return { error: "Item no encontrado" };

        const encantamientos = getEncantamientosItem(itemId);
        const maxEnc = MAX_ENCANTAMIENTOS[item.rar] || 1;

        if (encantamientos.length >= maxEnc) {
            return { error: `Este item ya tiene ${maxEnc} encantamiento(s) (máximo).` };
        }

        const costo = COSTO_ENCANTAMIENTO[item.rar] || 1000;
        const monedas = Number(window._getMonedas?.() || 0);
        if (monedas < costo) {
            return { error: `Necesitas ${costo} 🪙. Tienes ${monedas}.` };
        }

        // Sortear encantamiento
        const nuevo = sortearEncantamiento();
        if (!nuevo) return { error: "Error sorteando encantamiento" };

        // Aplicar
        window._setMonedas(monedas - costo);

        const data = cargarEncantamientos();
        data[itemId] = [...(data[itemId] || []), nuevo];
        guardarEncantamientos(data);

        // Aplicar stats al héroe
        const st = RL.cargarStats();
        const STATS_MAP = {
            atk: "atkBonus", def: "defBonus", hp: "hpBonus", crit: "critBonus",
            esq: "esqBonus", regen: "regenBonus", lifesteal: "lifestealBonus",
            thorns: "thornsBonus", xp: "xpBonus", oro: "oroBonus",
            fuego: "fuegoBonus", hielo: "hieloBonus", rayo: "rayoBonus", veneno: "venenoBonus"
        };
        const campo = STATS_MAP[nuevo.id];
        if (campo) {
            st[campo] = (st[campo] || 0) + nuevo.valor;
            RL.guardarStats(st);
        }
        window.dispatchEvent(new Event("rpg:stats-cambiados"));

        return {
            ok: true,
            item: item.nombre,
            encantamiento: nuevo,
            costo,
            totalEncantamientos: data[itemId].length,
            maxEnc
        };
    }

    // ---------- UI: botón de encantamiento ----------
    function inyectarBotonEncantamiento(item) {
        const modal = document.getElementById("rpg-loot-modal");
        if (!modal || !modal.classList.contains("active")) return;

        const acciones = modal.querySelector(".rpg-loot-modal-acciones");
        if (!acciones) return;
        if (acciones.querySelector(".rpg-loot-encantar")) return;

        const encantamientos = getEncantamientosItem(item.id);
        const maxEnc = MAX_ENCANTAMIENTOS[item.rar] || 1;
        if (encantamientos.length >= maxEnc) return; // ya está al máximo

        const costo = COSTO_ENCANTAMIENTO[item.rar] || 1000;
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "rpg-loot-usar rpg-loot-encantar";
        boton.style.background = "linear-gradient(135deg, #a684f0, #6a3ec4)";
        boton.style.color = "#fff";
        boton.innerHTML = `✨ Encantar (${costo} 🪙)`;
        boton.title = `Añade un stat aleatorio al item. ${encantamientos.length}/${maxEnc} encantamientos`;

        boton.addEventListener("click", async () => {
            const ok = await (window.SunModal ? window.SunModal.confirm({
                title: "✨ Encantar item",
                message: `Se añadirá un <strong>stat aleatorio</strong> a "${item.nombre}".<br>Coste: <strong>${costo} 🪙</strong>.<br>Encantamientos: ${encantamientos.length}/${maxEnc}`,
                variant: "warning",
                icon: "✨",
                confirmText: `Pagar ${costo}`,
                cancelText: "Cancelar"
            }) : Promise.resolve(confirm(`¿Encantar por ${costo} 🪙?`)));

            if (!ok) return;

            const r = await encantar(item.id);
            if (r.error) { alert(r.error); return; }

            // Efectos
            try { window._snd?.("victoria"); } catch { }
            try { window.RpgParticulas?.flashRareza?.("#a684f0"); } catch { }

            modal.classList.remove("active");
            setTimeout(() => {
                if (window.SunModal) {
                    window.SunModal.alert({
                        title: "✨ ¡Encantamiento aplicado!",
                        message: `<strong>${r.encantamiento.icono} ${r.encantamiento.nombre} +${r.encantamiento.valor}</strong><br><br>Encantamientos: ${r.totalEncantamientos}/${r.maxEnc}`,
                        variant: "success",
                        icon: r.encantamiento.icono
                    });
                } else {
                    alert(`¡Encantamiento: ${r.encantamiento.nombre} +${r.encantamiento.valor}!`);
                }
            }, 300);
        });

        acciones.insertBefore(boton, acciones.firstChild);
    }

    // ---------- Mostrar encantamientos en el detalle ----------
    const _mostrarDetalleOrig = RL.mostrarDetalleItem;

    if (typeof _mostrarDetalleOrig === "function") {
        RL.mostrarDetalleItem = function (item) {
            _mostrarDetalleOrig.call(this, item);

            setTimeout(() => {
                const modal = document.getElementById("rpg-loot-modal");
                if (!modal) return;

                // Añadir sección de encantamientos
                const panel = modal.querySelector(".rpg-loot-modal-panel");
                if (!panel) return;
                panel.querySelector(".rpg-loot-encantamientos")?.remove();

                const encantamientos = getEncantamientosItem(item.id);
                if (!encantamientos.length) return;

                const div = document.createElement("div");
                div.className = "rpg-loot-encantamientos";
                div.style.cssText = "margin:1rem 0;padding:.75rem;background:rgba(166,132,240,.1);border:1px solid rgba(166,132,240,.35);border-radius:10px;";
                div.innerHTML = `
          <div style="font-size:.72rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#c4a5ff;margin-bottom:.4rem;">✨ Encantamientos</div>
          ${encantamientos.map(e => `
            <div style="display:flex;align-items:center;gap:.5rem;padding:.3rem 0;font-size:.85rem;color:#fff;">
              <span style="font-size:1rem;">${e.icono}</span>
              <span style="flex:1;">${e.nombre}</span>
              <strong style="color:#c4a5ff;">+${e.valor}</strong>
            </div>
          `).join("")}
        `;
                const acciones = panel.querySelector(".rpg-loot-modal-acciones");
                if (acciones) panel.insertBefore(div, acciones);
                else panel.appendChild(div);
            }, 50);
        };
    }

    // Inyectar botón al abrir modal
    document.addEventListener("click", () => {
        setTimeout(() => {
            const modal = document.getElementById("rpg-loot-modal");
            if (!modal || !modal.classList.contains("active")) return;
            // Buscar el item actual por su nombre
            const nombreEl = modal.querySelector(".rpg-loot-modal-nombre");
            if (!nombreEl) return;
            const item = RL.POOL.find(p => p.nombre === nombreEl.textContent);
            if (item) inyectarBotonEncantamiento(item);
        }, 100);
    });

    // ---------- API pública ----------
    window.RpgEncantamiento = {
        encantar,
        getEncantamientosItem,
        ENCANTAMIENTOS,
        COSTO_ENCANTAMIENTO,
        MAX_ENCANTAMIENTOS
    };

    console.log("✨ rpg-encantamiento.js cargado · 14 encantamientos disponibles");
    }
})();