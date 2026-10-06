/* ============================================================
   RPG-ITEMS-DINAMICOS.JS — v7 BLINDADO + Stats mejorados
   ============================================================ */
(function () {
    "use strict";

    console.log("%c🚀 rpg-items-dinamicos.js ARRANCANDO", "color:#ffd93d;font-weight:900");

    let intentos = 0;
    function esperarDependencias(callback) {
        intentos++;
        if (window.RpgLoot && window.SPRITE_NAMES) return callback();
        if (intentos > 50) {
            console.error("❌ Timeout esperando dependencias");
            return;
        }
        setTimeout(() => esperarDependencias(callback), 100);
    }

    esperarDependencias(function init() {
        try {
            console.log("✅ Dependencias OK. Iniciando reemplazo del pool...");
            const RL = window.RpgLoot;

            const SHEET_CONFIG = {
                url: "img/rpg/loot-2.png",
                cols: 8,
                rows: 9,
                nombre: "loot1"
            };

            if (!RL.SHEETS) RL.SHEETS = {};
            RL.SHEETS[SHEET_CONFIG.nombre] = {
                url: SHEET_CONFIG.url,
                cols: SHEET_CONFIG.cols,
                rows: SHEET_CONFIG.rows
            };

            // ─── Escalado por rareza (Balanceado y Proporcional) ───
            const MULT_RAREZA = {
                comun: 1.0,
                raro: 1.25,
                epico: 1.6,
                legendario: 2.1,
                mitico: 2.8,
                tornasol: 3.5
            };

            // ─── Escalado por tipo (valores moderados para un combate táctico equilibrado) ───
            const MULT_TIPO_STAT = {
                atk: 0.85,
                def: 0.80,
                hp: 4.5,    // HP balanceado en lugar de 8.0x excesivo
                crit: 0.35, // % moderado
                esq: 0.30,
                regen: 0.50,
                lifesteal: 0.35,
                thorns: 0.55,
                xp: 0.40,
                oro: 0.40,
                fuego: 0.90,
                hielo: 0.90,
                rayo: 0.90,
                veneno: 0.90,
                vel: 0.65,
                mana: 0.65,
                suerte: 0.45
            };

            function escalarStats(stats, rareza) {
                if (!stats) return {};
                const mult = MULT_RAREZA[rareza] || 1.0;
                const escalados = {};
                Object.entries(stats).forEach(([key, val]) => {
                    const tipoMult = MULT_TIPO_STAT[key] || 1.0;
                    // Escalado equilibrado con progresión controlada
                    const factor = Math.sqrt(mult * tipoMult);
                    const baseCalc = Number(val) * factor;
                    escalados[key] = Math.max(1, Math.round(baseCalc));
                });
                return escalados;
            }

            // ─── Construir pool ───
            function construirPool() {
                const names = window.SPRITE_NAMES || {};
                const entradas = Object.entries(names);
                console.log(`📦 Construyendo pool desde ${entradas.length} items mapeados...`);

                return entradas.map(([coord, info]) => {
                    const [col, row] = coord.split(",").map(Number);
                    let tipo = "util";
                    if (info.stats) {
                        if (info.stats.atk) tipo = "atk";
                        else if (info.stats.def) tipo = "def";
                        else if (info.stats.hp) tipo = "hp";
                    }
                    if (info.tipo) tipo = info.tipo;

                    const statsEscalados = escalarStats(info.stats, info.rar);

                    // Si el objeto no tiene stats o quedaron en 0, otorgar stats base según rareza para que nunca tenga 0 util
                    if (!info.stats || Object.keys(info.stats).length === 0 || Object.values(statsEscalados).every(v => !v)) {
                        const baseAtk = info.rar === "mitico" || info.rar === "tornasol" ? 25 : info.rar === "legendario" ? 18 : info.rar === "epico" ? 12 : info.rar === "raro" ? 8 : 4;
                        statsEscalados.atk = baseAtk;
                        statsEscalados.def = Math.max(1, Math.round(baseAtk / 2));
                        if (tipo === "util") tipo = "atk";
                    }

                    // Si el objeto tiene stats configurados fijos o específicos como Origen de la vida
                    if (coord === "5,4" || info.nombre?.includes("Origen de la vida")) {
                        statsEscalados.hp = 1500;
                    }

                    const valorPrincipal = statsEscalados.atk || statsEscalados.def || statsEscalados.hp ||
                        Object.values(statsEscalados)[0] || 1;

                    const habsFinales = Array.isArray(info.habilidades) ? [...info.habilidades] : [];
                    const sangradoVal = statsEscalados.sangrado || info.stats?.sangrado || 0;
                    if (sangradoVal > 0 && !habsFinales.some(h => (h.nombre || "").toLowerCase().includes("sangr") || (h.desc || "").toLowerCase().includes("sangr"))) {
                        habsFinales.push({
                            nombre: "Desgarro Sangriento.",
                            tipo: "pasiva",
                            val: sangradoVal,
                            desc: `Tus ataques desgarran al enemigo provocando sangrado continuo (${sangradoVal} dmg/turno).`
                        });
                    }

                    return {
                        id: info.id || `item-${col}-${row}`,
                        nombre: info.nombre || `Objeto ${col},${row}`,
                        sprite: [col, row],
                        sheet: SHEET_CONFIG.nombre,
                        tipo,
                        val: valorPrincipal,
                        valFinal: valorPrincipal,
                        rar: info.rar || "comun",
                        icono: info.icono || "espada",
                        desc: info.desc || "",
                        consumible: !!info.consumible,
                        stats: statsEscalados,          // ← stats escalados
                        statsRaw: info.stats || {},     // ← stats originales (por si acaso)
                        habilidades: habsFinales,
                        calidad: "normal"
                    };
                });
            }

            const nuevoPool = construirPool();
            if (nuevoPool.length > 0) {
                RL.POOL.length = 0;
                nuevoPool.forEach(item => RL.POOL.push(item));
                console.log(`%c✅ POOL REEMPLAZADO: ${nuevoPool.length} items`, "color:#4dd48e;font-weight:900");
                console.log(`   Sheet: "${SHEET_CONFIG.nombre}" → ${SHEET_CONFIG.url}`);
            } else {
                console.error("❌ Pool vacío");
                return;
            }

            // ─── Sistema de SLOTS ACTIVOS (máximo 10 items activos) ───
            // De todos tus items conseguidos, solo los 10 "más fuertes" dan stats.
            // Los demás quedan en inventario pero no aportan stats pasivos.
            const MAX_ITEMS_ACTIVOS = 10;
            const SLOTS_KEY = () => `sa_rpg_items_activos_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;

            function getItemsActivos() {
                try {
                    const raw = localStorage.getItem(SLOTS_KEY());
                    return raw ? JSON.parse(raw) : null;
                } catch { return null; }
            }
            function setItemsActivos(ids) {
                localStorage.setItem(SLOTS_KEY(), JSON.stringify(ids.slice(0, MAX_ITEMS_ACTIVOS)));
            }

            // ─── Calcular stats totales de items conseguidos ───
            function calcularStatsDeItems() {
                const loot = RL.cargarLoot();
                const ids = Object.keys(loot);

                // Ordenar por "score" para coger los más fuertes
                const items = ids
                    .map(id => RL.POOL.find(p => p.id === id))
                    .filter(Boolean)
                    .filter(it => !it.consumible);

                // Score = rareza + suma de stats
                const score = it => {
                    const rarScore = { comun: 1, raro: 2, epico: 3, legendario: 4, mitico: 5, tornasol: 6 }[it.rar] || 1;
                    const statScore = Object.values(it.stats || {}).reduce((s, v) => s + Math.abs(v), 0) / 20;
                    return rarScore * 100 + statScore;
                };

                items.sort((a, b) => score(b) - score(a));
                const activos = items.slice(0, MAX_ITEMS_ACTIVOS);

                // Sumar stats
                const total = {
                    atkBonus: 0, defBonus: 0, hpBonus: 0, critBonus: 0, esqBonus: 0,
                    velBonus: 0, manaBonus: 0, lifestealBonus: 0, thornsBonus: 0,
                    regenBonus: 0, xpBonus: 0, oroBonus: 0, suerteBonus: 0,
                    fuegoBonus: 0, hieloBonus: 0, rayoBonus: 0, venenoBonus: 0
                };

                const STATS_MAP = {
                    atk: "atkBonus", def: "defBonus", hp: "hpBonus",
                    crit: "critBonus", esq: "esqBonus", vel: "velBonus", mana: "manaBonus",
                    lifesteal: "lifestealBonus", thorns: "thornsBonus", regen: "regenBonus",
                    xp: "xpBonus", oro: "oroBonus", suerte: "suerteBonus",
                    fuego: "fuegoBonus", hielo: "hieloBonus", rayo: "rayoBonus", veneno: "venenoBonus"
                };

                activos.forEach(item => {
                    Object.entries(item.stats || {}).forEach(([key, val]) => {
                        const campo = STATS_MAP[key];
                        if (!campo) return;
                        total[campo] += val;
                    });
                });

                return { total, activos, totalItems: items.length };
            }

            // ─── Sobrescribir aplicarBonus / quitarBonus ───
            // Ya no se aplica/resta item por item. Se recalcula todo de cero.
            RL.aplicarBonus = function () {
                const { total } = calcularStatsDeItems();
                RL.guardarStats(total);
                window.dispatchEvent(new Event("rpg:stats-cambiados"));
            };

            RL.quitarBonus = function () {
                RL.aplicarBonus();
            };

            // Recalcular al cargar
            RL.aplicarBonus();

            // ─── Re-render ───
            setTimeout(() => {
                try { RL.renderColeccion?.(); } catch (e) { console.warn(e); }
            }, 500);

            window.addEventListener("sunad:rpg-tab", e => {
                if (e.detail?.tab === "objetos") setTimeout(() => { try { RL.renderColeccion?.(); } catch (e) { } }, 100);
            });

            // Recalcular al obtener items
            window.addEventListener("rpg:victoria", () => setTimeout(() => RL.aplicarBonus(), 500));
            window.addEventListener("rpg:item-obtenido", () => setTimeout(() => RL.aplicarBonus(), 200));

            // ─── Guardar habilidades de items ───
            const STORAGE_HABS = () => `sa_rpg_habs_items_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;

            function guardarHabs(item) {
                if (!item || !item.habilidades?.length) return;
                try {
                    const raw = localStorage.getItem(STORAGE_HABS());
                    const data = raw ? JSON.parse(raw) : {};
                    data[item.id] = item.habilidades;
                    localStorage.setItem(STORAGE_HABS(), JSON.stringify(data));
                } catch (e) { console.warn(e); }
            }

            (function sync() {
                const loot = RL.cargarLoot?.() || {};
                let modificado = false;
                Object.keys(loot).forEach(id => {
                    const it = RL.POOL.find(p => p.id === id);
                    if (it) {
                        guardarHabs(it);
                    } else {
                        delete loot[id];
                        modificado = true;
                    }
                });
                if (modificado) {
                    RL.guardarLoot?.(loot);
                    try { RL.renderColeccion?.(); } catch (e) {}
                }
            })();

            // ─── API pública ───
            window.RpgItems = window.RpgItems || {};
            Object.assign(window.RpgItems, {
                getHabilidadesActivas() {
                    try {
                        const loot = RL.cargarLoot?.() || {};
                        const activas = [];
                        Object.keys(loot).forEach(id => {
                            if ((loot[id] || 0) <= 0) return;
                            const it = RL.POOL.find(p => p.id === id);
                            if (it && Array.isArray(it.habilidades)) {
                                it.habilidades.forEach(h => activas.push({ ...h, itemId: id }));
                            }
                        });
                        return activas;
                    } catch { return []; }
                },
                recargarPool() {
                    const p = construirPool();
                    RL.POOL.length = 0;
                    p.forEach(i => RL.POOL.push(i));
                    RL.renderColeccion?.();
                    RL.aplicarBonus();
                    return p.length;
                },
                calcularStatsDeItems,
                getItemsActivos: () => calcularStatsDeItems().activos,
                MAX_ITEMS_ACTIVOS,
                diagnostico() {
                    const { total, activos, totalItems } = calcularStatsDeItems();
                    console.log("%c🔍 DIAGNÓSTICO STATS", "color:#ffd93d;font-weight:900");
                    console.log("Items totales:", totalItems);
                    console.log("Items activos (aportan stats):", activos.length);
                    console.log("Stats totales:", total);
                    console.log("Items activos:");
                    activos.forEach(it => console.log(`  ${it.nombre} (${it.rar})`));
                }
            });

            console.log(`%c✅ rpg-items-dinamicos.js v7 LISTO · ${MAX_ITEMS_ACTIVOS} slots activos`, "color:#4dd48e;font-weight:900");

        } catch (err) {
            console.error("❌ Error en init():", err);
        }
    });
})();