/* ============================================================
   RPG-SONIDOS-RAREZA.JS — Sonidos épicos al obtener items raros
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

    // Asegurar contexto de audio
    let ac = null;
    function getAC() {
        if (!ac) {
            try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
        }
        if (ac.state === "suspended") ac.resume().catch(() => { });
        return ac;
    }
    const vol = () => Number(localStorage.getItem("app_volume") || 0.65);

    function tono(f, dur, tipo = "sine", v = 0.08, delay = 0, freqFinal = null) {
        v = v * 0.5 * vol();
        if (v <= 0) return;
        const c = getAC(); if (!c) return;
        const t = c.currentTime + delay;
        const o = c.createOscillator(), g = c.createGain();
        o.type = (tipo === "sawtooth" || tipo === "square") ? "sine" : tipo;
        o.frequency.setValueAtTime(f, t);
        if (freqFinal) o.frequency.exponentialRampToValueAtTime(Math.max(20, freqFinal), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        const attack = Math.min(0.04, dur * 0.25);
        g.gain.linearRampToValueAtTime(v, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(c.destination);
        o.start(t); o.stop(t + dur + 0.06);
    }

    function ruido(dur = 0.15, v = 0.05, filtro = 2000) {
        v = v * 0.4 * vol();
        if (v <= 0) return;
        const c = getAC(); if (!c) return;
        const t = c.currentTime;
        const sr = Math.max(1, Math.floor(c.sampleRate * dur));
        const buffer = c.createBuffer(1, sr, c.sampleRate);
        const data = buffer.getChannelData(0);
        let prev = 0;
        for (let i = 0; i < sr; i++) {
            prev = (prev + (Math.random() * 2 - 1) * 0.08) / 1.08;
            data[i] = prev * Math.pow(1 - i / sr, 2) * 2;
        }
        const source = c.createBufferSource();
        source.buffer = buffer;
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(v, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const filter = c.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = Math.min(filtro || 2000, 2400);
        source.connect(filter).connect(gain).connect(c.destination);
        source.start(t);
    }

    // ============================================================
    // SONIDOS POR RAREZA (Relajantes y agradables)
    // ============================================================
    const SONIDOS = {
        comun: () => {
            tono(523, 0.12, "sine", 0.05);
        },
        raro: () => {
            tono(523, 0.14, "sine", 0.05);
            tono(659, 0.18, "sine", 0.06, 0.08);
        },
        epico: () => {
            tono(523, 0.15, "sine", 0.05);
            tono(659, 0.15, "sine", 0.05, 0.07);
            tono(784, 0.22, "sine", 0.06, 0.14);
            ruido(0.2, 0.03, 1800);
        },
        legendario: () => {
            [440, 554, 659, 880, 1046].forEach((f, i) => {
                tono(f, 0.25, "sine", 0.05, i * 0.07);
            });
            ruido(0.3, 0.03, 1600);
        },
        mitico: () => {
            [440, 554, 659].forEach((f, i) => tono(f, 0.5, "sine", 0.05, i * 0.06));
            [880, 1108].forEach((f, i) => tono(f, 0.4, "sine", 0.04, 0.25 + i * 0.06));
            ruido(0.35, 0.03, 1500);
        },
        tornasol: () => {
            [440, 554, 659, 880].forEach((f, i) => tono(f, 0.6, "sine", 0.05, i * 0.05));
            [1108, 1318].forEach((f, i) => tono(f, 0.35, "sine", 0.04, 0.28 + i * 0.07));
            ruido(0.4, 0.03, 1600);
        }
    };

    // ============================================================
    // INTERCEPTAR POPUPS DE LOOT
    // ============================================================
    const _mostrarPopupOrig = window.RpgLoot?.mostrarPopup;

    if (typeof _mostrarPopupOrig === "function") {
        window.RpgLoot.mostrarPopup = function (item) {
            // Reproducir sonido según rareza
            const rar = item.rar || "comun";
            try {
                (SONIDOS[rar] || SONIDOS.comun)();
            } catch (e) { console.warn("Sonido rareza:", e); }

            // Vibrar en móvil para raros+ (si está soportado)
            if (["legendario", "mitico", "tornasol"].includes(rar) && navigator.vibrate) {
                try { navigator.vibrate(rar === "tornasol" ? [50, 30, 50, 30, 100] : [40, 30, 80]); } catch { }
            }

            // Llamar al original
            return _mostrarPopupOrig.call(this, item);
        };
    }

    // También cuando se abre un cofre
    const _mostrarModalCofreOrig = window.RpgLoot?.mostrarModalCofre;

    if (typeof _mostrarModalCofreOrig === "function") {
        window.RpgLoot.mostrarModalCofre = function (def, items) {
            // Encontrar la mejor rareza del cofre
            const orden = ["comun", "raro", "epico", "legendario", "mitico", "tornasol"];
            let mejor = "comun";
            items.forEach(it => {
                if (orden.indexOf(it.rar) > orden.indexOf(mejor)) mejor = it.rar;
            });
            // Sonido especial tras 300ms (para no chocar con la animación)
            setTimeout(() => {
                try { (SONIDOS[mejor] || SONIDOS.comun)(); } catch { }
            }, 300);

            return _mostrarModalCofreOrig.call(this, def, items);
        };
    }

    console.log("🔊 rpg-sonidos-rareza.js cargado · 6 sonidos épicos listos");
    }
})();