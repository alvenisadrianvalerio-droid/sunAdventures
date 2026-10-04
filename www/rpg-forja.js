/* ============================================================
   RPG-FORJA.JS — Fusiona 3 items iguales en 1 de rareza superior
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
    const ORDEN = ["comun", "raro", "epico", "legendario", "mitico", "tornasol"];

    // ---------- Coste de forja (en oro) ----------
    const COSTO_FORJA = {
        comun: 500,        // 3 comunes → 1 raro
        raro: 2000,        // 3 raros → 1 épico
        epico: 10000,      // 3 épicos → 1 legendario
        legendario: 50000, // 3 legendarios → 1 mítico
        mitico: 500000     // 3 míticos → 1 tornasol
    };

    // ---------- Forjar ----------
    async function forjar(itemId) {
        const item = RL.POOL.find(p => p.id === itemId);
        if (!item) return { error: "Item no encontrado" };

        const idx = ORDEN.indexOf(item.rar);
        if (idx === -1 || idx === ORDEN.length - 1) {
            return { error: "Este item no puede subir más de rareza." };
        }

        const loot = RL.cargarLoot();
        const cantidad = loot[itemId] || 0;
        if (cantidad < 3) {
            return { error: `Necesitas 3 copias. Tienes ${cantidad}.` };
        }

        const costo = COSTO_FORJA[item.rar] || 1000;
        const monedas = RL ? Number(window._getMonedas?.() || 0) : 0;
        if (monedas < costo) {
            return { error: `Necesitas ${costo} 🪙. Tienes ${monedas}.` };
        }

        // Buscar un item de rareza superior del mismo tipo
        const nuevaRar = ORDEN[idx + 1];
        const candidatos = RL.POOL.filter(p =>
            p.rar === nuevaRar &&
            p.tipo === item.tipo &&
            p.id !== item.id &&
            p.sheet === item.sheet
        );

        if (!candidatos.length) {
            return { error: "No hay items superiores del mismo tipo disponibles." };
        }

        // Elegir uno al azar
        const resultado = candidatos[Math.floor(Math.random() * candidatos.length)];

        // Ejecutar la forja
        window._setMonedas(monedas - costo);

        // Quitar 3 del inventario
        loot[itemId] -= 3;
        if (loot[itemId] <= 0) delete loot[itemId];

        // Añadir el nuevo
        loot[resultado.id] = (loot[resultado.id] || 0) + 1;

        // Aplicar/quitar stats
        RL.quitarBonus(item);
        RL.aplicarBonus(resultado);

        RL.guardarLoot(loot);
        RL.renderColeccion();

        return {
            ok: true,
            consumido: item.nombre,
            creado: resultado.nombre,
            rarezaAnterior: item.rar,
            rarezaNueva: resultado.rar,
            costo
        };
    }

    // ---------- Forja masiva (todas las que se puedan) ----------
    async function forjarTodo() {
        const loot = RL.cargarLoot();
        let fabricados = 0, gastado = 0, errores = 0;

        // Ordenar por rareza ascendente
        const ids = Object.keys(loot).sort((a, b) => {
            const ia = RL.POOL.find(p => p.id === a);
            const ib = RL.POOL.find(p => p.id === b);
            if (!ia || !ib) return 0;
            return ORDEN.indexOf(ia.rar) - ORDEN.indexOf(ib.rar);
        });

        for (const id of ids) {
            while ((RL.cargarLoot()[id] || 0) >= 3) {
                const r = await forjar(id);
                if (r.error) { errores++; break; }
                fabricados++;
                gastado += r.costo;
                await new Promise(r => setTimeout(r, 300)); // pequeña pausa
            }
        }

        return { fabricados, gastado, errores };
    }

    // ---------- UI: botón de forja ----------
    function inyectarBotonForja(item) {
        // Buscar el modal de detalle del item
        const modal = document.getElementById("rpg-loot-modal");
        if (!modal || !modal.classList.contains("active")) return;

        const acciones = modal.querySelector(".rpg-loot-modal-acciones");
        if (!acciones) return;
        if (acciones.querySelector(".rpg-loot-forjar")) return;

        const loot = RL.cargarLoot();
        const cantidad = loot[item.id] || 0;
        const idx = ORDEN.indexOf(item.rar);

        // No se puede forjar si es tornasol o si no tienes 3
        if (idx === -1 || idx === ORDEN.length - 1) return;
        if (cantidad < 3) return;

        const costo = COSTO_FORJA[item.rar] || 1000;
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "rpg-loot-usar rpg-loot-forjar";
        boton.style.background = "linear-gradient(135deg, #ff8c1a, #c41e3a)";
        boton.style.color = "#fff";
        boton.innerHTML = `⚒️ Forjar 3 → 1 (${costo} 🪙)`;
        boton.title = "Fusiona 3 copias en 1 de rareza superior";

        boton.addEventListener("click", async () => {
            const ok = await (window.SunModal ? window.SunModal.confirm({
                title: "⚒️ Forjar item",
                message: `Consumirás <strong>3 copias de "${item.nombre}"</strong> y <strong>${costo} 🪙</strong> para crear 1 item de rareza superior.<br><br>¿Confirmas?`,
                variant: "warning",
                icon: "⚒️",
                confirmText: "Sí, forjar",
                cancelText: "Cancelar"
            }) : Promise.resolve(confirm(`¿Forjar 3 "${item.nombre}" por ${costo} 🪙?`)));

            if (!ok) return;

            const r = await forjar(item.id);
            if (r.error) {
                alert(r.error);
                return;
            }

            // Sonido + partículas
            try { window._snd?.("victoria"); } catch { }
            try { window.RpgParticulas?.flashRareza?.(r.rarezaNueva === "tornasol" ? "#b0f5ff" : "#ffd93d"); } catch { }

            // Cerrar modal y mostrar resultado
            modal.classList.remove("active");
            setTimeout(() => {
                if (window.SunModal) {
                    window.SunModal.alert({
                        title: "⚒️ ¡Forja exitosa!",
                        message: `Has creado: <strong>${r.creado}</strong><br><small>Rareza: ${r.rarezaAnterior} → ${r.rarezaNueva}</small>`,
                        variant: "success",
                        icon: "✨"
                    });
                } else {
                    alert(`¡Has creado: ${r.creado}!`);
                }
                // Reintentar mostrar el popup del nuevo item
                const nuevoItem = RL.POOL.find(p => p.nombre === r.creado);
                if (nuevoItem) RL.mostrarPopup(nuevoItem);
            }, 300);
        });

        acciones.insertBefore(boton, acciones.firstChild);
    }

    // ---------- Inyectar al abrir el modal de item ----------
    const _mostrarDetalleOrig = RL.mostrarDetalleItem;

    if (typeof _mostrarDetalleOrig === "function") {
        RL.mostrarDetalleItem = function (item) {
            _mostrarDetalleOrig.call(this, item);
            setTimeout(() => inyectarBotonForja(item), 50);
        };
    }

    // ---------- Botón de forja masiva ----------
    function inyectarForjaMasiva() {
        const panel = document.querySelector('[data-rpg-panel="objetos"]');
        if (!panel) return;
        if (panel.querySelector(".rpg-btn-forja-masiva")) return;

        const header = panel.querySelector(".rpg-coleccion-header");
        if (!header) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "rpg-btn-forja-masiva";
        btn.innerHTML = "⚒️ Forjar todo";
        btn.title = "Fusiona automáticamente todos los items que tengas x3 o más";
        btn.style.cssText = `
      padding: .45rem .9rem;
      border-radius: 999px;
      border: 1px solid rgba(255,140,26,.5);
      background: linear-gradient(135deg, rgba(255,140,26,.2), rgba(196,30,58,.15));
      color: #ff9a3d;
      font-family: inherit;
      font-size: .78rem;
      font-weight: 900;
      cursor: pointer;
      transition: all .2s;
      margin-left: auto;
    `;
        btn.addEventListener("mouseenter", () => {
            btn.style.transform = "translateY(-2px)";
            btn.style.boxShadow = "0 6px 20px rgba(255,140,26,.35)";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "";
            btn.style.boxShadow = "";
        });

        btn.addEventListener("click", async () => {
            const ok = await (window.SunModal ? window.SunModal.confirm({
                title: "⚒️ Forja masiva",
                message: "Se fusionarán <strong>automáticamente</strong> todos los items que tengas x3 o más.<br><br>El coste se calculará según la rareza de cada uno.<br><br>¿Continuar?",
                variant: "warning",
                icon: "⚒️",
                confirmText: "Sí, forjar todo",
                cancelText: "Cancelar"
            }) : Promise.resolve(confirm("¿Forjar todos los items repetidos?")));

            if (!ok) return;

            const r = await forjarTodo();
            try { window._snd?.("victoria"); } catch { }

            if (window.SunModal) {
                window.SunModal.alert({
                    title: r.fabricados > 0 ? "⚒️ ¡Forja completada!" : "Sin cambios",
                    message: r.fabricados > 0
                        ? `Se crearon <strong>${r.fabricados}</strong> items nuevos.<br>Gastaste <strong>${r.gastado} 🪙</strong>.<br>${r.errores > 0 ? `Errores: ${r.errores}` : ""}`
                        : "No tienes suficientes copias para forjar nada.",
                    variant: r.fabricados > 0 ? "success" : "warning",
                    icon: "⚒️"
                });
            }
        });

        header.appendChild(btn);
    }

    window.addEventListener("sunadventures:rpg-tab", e => {
        if (e.detail?.tab === "objetos") {
            setTimeout(inyectarForjaMasiva, 200);
        }
    });

    setTimeout(inyectarForjaMasiva, 1500);

    // ---------- API pública ----------
    window.RpgForja = {
        forjar,
        forjarTodo,
        COSTO_FORJA
    };

    console.log("⚒️ rpg-forja.js cargado · sistema de forja listo");
    }
})();