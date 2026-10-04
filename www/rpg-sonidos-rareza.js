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
    const vol = () => Number(localStorage.getItem("app_volume") || 0.8);

    function tono(f, dur, tipo = "sine", v = 0.15, delay = 0, freqFinal = null) {
        v *= vol();
        if (v <= 0) return;
        const c = getAC(); if (!c) return;
        const t = c.currentTime + delay;
        const o = c.createOscillator(), g = c.createGain();
        o.type = tipo;
        o.frequency.setValueAtTime(f, t);
        if (freqFinal) o.frequency.exponentialRampToValueAtTime(freqFinal, t + dur);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(c.destination);
        o.start(t); o.stop(t + dur + 0.05);
    }

    function ruido(dur = 0.2, v = 0.15, filtro = null) {
        v *= vol();
        if (v <= 0) return;
        const c = getAC(); if (!c) return;
        const t = c.currentTime;
        const sr = c.sampleRate * dur;
        const buffer = c.createBuffer(1, sr, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < sr; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sr, 2);
        const source = c.createBufferSource();
        source.buffer = buffer;
        const gain = c.createGain();
        gain.gain.setValueAtTime(v, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        if (filtro) {
            const filter = c.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = filtro;
            source.connect(filter).connect(gain).connect(c.destination);
        } else {
            source.connect(gain).connect(c.destination);
        }
        source.start(t);
    }

    // ============================================================
    // SONIDOS POR RAREZA
    // ============================================================
    const SONIDOS = {
        comun: () => {
            // Un pequeño "pop"
            tono(600, 0.08, "sine", 0.1);
        },
        raro: () => {
            // Dos notas ascendentes
            tono(660, 0.1, "sine", 0.1);
            tono(880, 0.15, "sine", 0.12, 0.1);
        },
        epico: () => {
            // Tres notas + chispa
            tono(660, 0.08, "triangle", 0.1);
            tono(880, 0.08, "triangle", 0.1, 0.08);
            tono(1100, 0.15, "triangle", 0.12, 0.16);
            ruido(0.3, 0.08, 3000);
        },
        legendario: () => {
            // Fanfarria de 5 notas + brillo
            [523, 659, 784, 1046, 1318].forEach((f, i) => {
                tono(f, 0.2, "triangle", 0.12, i * 0.08);
            });
            ruido(0.5, 0.1, 4000);
            tono(1568, 0.4, "sine", 0.1, 0.4);
        },
        mitico: () => {
            // Acorde ascendente + eco místico
            [523, 659, 784].forEach((f, i) => tono(f, 0.6, "sine", 0.1, i * 0.04));
            [1046, 1318, 1568].forEach((f, i) => tono(f, 0.4, "triangle", 0.1, 0.3 + i * 0.05));
            ruido(0.8, 0.12, 5000);
            tono(2093, 0.5, "sine", 0.08, 0.7);
        },
        tornasol: () => {
            // Fanfarria épica completa con eco arcoíris
            // Base: acorde mayor
            [523, 659, 784, 1046].forEach((f, i) => tono(f, 1.0, "sine", 0.12, i * 0.03));
            // Segunda capa: arpegio
            [1318, 1568, 2093, 2637].forEach((f, i) => tono(f, 0.4, "triangle", 0.1, 0.3 + i * 0.08));
            // Chispas: barrido de ruido
            ruido(1.2, 0.15, 6000);
            ruido(0.8, 0.12, 8000);
            // Toque final: campanilla
            [2093, 2637, 3136].forEach((f, i) => tono(f, 0.8, "sine", 0.09, 1.0 + i * 0.12));
            // Vibrato final
            for (let i = 0; i < 6; i++) tono(1760 + i * 50, 0.15, "sine", 0.06, 1.5 + i * 0.05);
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