/* ============================================================
   RPG-PARTICULAS-LOOT.JS — Confeti y efectos al obtener items raros
   ============================================================ */
(function () {
    "use strict";

    const COLORES_ARCOIRIS = ["#ff5470", "#ffae3d", "#ffd93d", "#4dd48e", "#6cb8ff", "#a684f0", "#ff6b9d"];

    // Crear contenedor global de partículas
    function getContenedor() {
        let c = document.getElementById("rpg-particulas-contenedor");
        if (!c) {
            c = document.createElement("div");
            c.id = "rpg-particulas-contenedor";
            Object.assign(c.style, {
                position: "fixed",
                inset: "0",
                pointerEvents: "none",
                zIndex: "99999",
                overflow: "hidden"
            });
            document.body.appendChild(c);
        }
        return c;
    }

    // ---------- Confeti ----------
    function lluviaConfeti(cantidad = 60) {
        const c = getContenedor();
        for (let i = 0; i < cantidad; i++) {
            const p = document.createElement("div");
            const color = COLORES_ARCOIRIS[i % COLORES_ARCOIRIS.length];
            const size = 6 + Math.random() * 8;
            Object.assign(p.style, {
                position: "absolute",
                top: "-20px",
                left: (Math.random() * 100) + "%",
                width: size + "px",
                height: size + "px",
                background: color,
                borderRadius: Math.random() < 0.5 ? "50%" : "2px",
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: "1",
                boxShadow: `0 0 10px ${color}`
            });
            c.appendChild(p);

            const duracion = 2000 + Math.random() * 2000;
            const desplazamientoX = (Math.random() - 0.5) * 200;
            const rotacion = Math.random() * 720 - 360;

            p.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${desplazamientoX}px, ${window.innerHeight + 50}px) rotate(${rotacion}deg)`, opacity: 0.3 }
            ], {
                duration: duracion,
                easing: "cubic-bezier(.3,.6,.5,1)"
            });

            setTimeout(() => p.remove(), duracion);
        }
    }

    // ---------- Estrellas radiales ----------
    function explosionEstrellas(x, y, cantidad = 20) {
        const c = getContenedor();
        for (let i = 0; i < cantidad; i++) {
            const p = document.createElement("div");
            const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.3;
            const distancia = 100 + Math.random() * 200;
            const color = COLORES_ARCOIRIS[i % COLORES_ARCOIRIS.length];
            Object.assign(p.style, {
                position: "absolute",
                left: x + "px",
                top: y + "px",
                width: "8px",
                height: "8px",
                background: color,
                borderRadius: "50%",
                boxShadow: `0 0 15px ${color}, 0 0 30px ${color}`
            });
            c.appendChild(p);

            const dx = Math.cos(angulo) * distancia;
            const dy = Math.sin(angulo) * distancia;

            p.animate([
                { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
                { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.5)`, opacity: 0 }
            ], {
                duration: 1200 + Math.random() * 800,
                easing: "cubic-bezier(.2,.8,.4,1)"
            });

            setTimeout(() => p.remove(), 2000);
        }
    }

    // ---------- Aura pulsante tipo "flash" ----------
    function flashRareza(color) {
        const c = getContenedor();
        const flash = document.createElement("div");
        Object.assign(flash.style, {
            position: "absolute",
            inset: "0",
            background: `radial-gradient(circle at 50% 50%, ${color}66, transparent 70%)`,
            opacity: "0"
        });
        c.appendChild(flash);
        flash.animate([
            { opacity: 0 },
            { opacity: 0.8, offset: 0.3 },
            { opacity: 0 }
        ], { duration: 800, easing: "ease-out" });
        setTimeout(() => flash.remove(), 900);
    }

    // ============================================================
    // ENGANCHE A RpgLoot.mostrarPopup
    // ============================================================
    let intentosHook = 0;
    function engancharRpgLoot() {
        if (!window.RpgLoot) {
            intentosHook++;
            if (intentosHook > 100) return;
            setTimeout(engancharRpgLoot, 100);
            return;
        }

        const _mostrarPopupOrig = window.RpgLoot.mostrarPopup;

        if (typeof _mostrarPopupOrig === "function") {
            window.RpgLoot.mostrarPopup = function (item) {
                const rar = item.rar || "comun";

            // Efectos según rareza
            if (rar === "tornasol") {
                flashRareza("#b0f5ff");
                setTimeout(() => lluviaConfeti(80), 100);
                // Doble confeti para el tornasol
                setTimeout(() => lluviaConfeti(40), 800);
                setTimeout(() => lluviaConfeti(30), 1600);
            }
            else if (rar === "mitico") {
                flashRareza("#ff6b9d");
                setTimeout(() => lluviaConfeti(40), 100);
            }
            else if (rar === "legendario") {
                flashRareza("#ffd93d");
                setTimeout(() => lluviaConfeti(25), 100);
            }
            else if (rar === "epico") {
                flashRareza("#a684f0");
            }

            return _mostrarPopupOrig.call(this, item);
        };
    }

    // También al abrir cofres
    const _mostrarModalCofreOrig = window.RpgLoot.mostrarModalCofre;

    if (typeof _mostrarModalCofreOrig === "function") {
        window.RpgLoot.mostrarModalCofre = function (def, items) {
            const orden = ["comun", "raro", "epico", "legendario", "mitico", "tornasol"];
            let mejor = "comun";
            items.forEach(it => {
                if (orden.indexOf(it.rar) > orden.indexOf(mejor)) mejor = it.rar;
            });

            setTimeout(() => {
                if (mejor === "tornasol") { flashRareza("#b0f5ff"); lluviaConfeti(120); }
                else if (mejor === "mitico") { flashRareza("#ff6b9d"); lluviaConfeti(60); }
                else if (mejor === "legendario") { flashRareza("#ffd93d"); lluviaConfeti(35); }
            }, 200);

            return _mostrarModalCofreOrig.call(this, def, items);
        };
    }
    }

    engancharRpgLoot();

    // ============================================================
    // API PÚBLICA por si quieres invocarlo manualmente
    // ============================================================
    window.RpgParticulas = {
        lluviaConfeti,
        explosionEstrellas,
        flashRareza
    };

    console.log("🌈 rpg-particulas-loot.js cargado · partículas listas");
})();