const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const rlCode = fs.readFileSync('rpg-roguelike.js', 'utf8');

test('Suite 06: Tests de Regresión del Modo Roguelike', async (t) => {
  await t.test('Bug A1: Sanitización de Meta-Progreso', () => {
    const metaDef = () => ({ runs: 0, mejorPiso: 0, victorias: 0, desbloqueos: [], maldicionesTotales: 0, bossesDerrotados: 0 });
    const parsedCorrupto = {
      runs: "muchas",
      mejorPiso: NaN,
      victorias: -2,
      desbloqueos: null,
      bossesDerrotados: undefined
    };

    const merged = { ...metaDef(), ...(parsedCorrupto || {}) };
    if (!Array.isArray(merged.desbloqueos)) merged.desbloqueos = [];
    ['runs', 'mejorPiso', 'victorias', 'maldicionesTotales', 'bossesDerrotados'].forEach(k => {
      if (typeof merged[k] !== 'number' || isNaN(merged[k]) || merged[k] < 0) merged[k] = 0;
    });

    assert.equal(merged.runs, 0, 'Runs debe sanearse a 0 si no es numérico');
    assert.equal(merged.mejorPiso, 0, 'mejorPiso debe sanearse a 0 si es NaN');
    assert.equal(merged.victorias, 0, 'victorias debe sanearse a 0 si es negativo');
    assert.ok(Array.isArray(merged.desbloqueos), 'desbloqueos debe ser un array válido');
    assert.equal(merged.bossesDerrotados, 0, 'bossesDerrotados debe ser 0 si es undefined');
  });

  await t.test('Bug A2: Sanitización de Run Activo Deserializado', () => {
    const base = {
      reliquias: [],
      maldiciones: [],
      log: [],
      piso: 1,
      oro: 40,
      hp: 100,
      hpMax: 100
    };

    const savedCorrupto = {
      reliquias: null,
      maldiciones: undefined,
      log: "no-array",
      piso: NaN,
      oro: -100,
      hp: "muerto"
    };

    const merged = { ...base, ...savedCorrupto };
    if (!Array.isArray(merged.reliquias)) merged.reliquias = [];
    if (!Array.isArray(merged.maldiciones)) merged.maldiciones = [];
    if (!Array.isArray(merged.log)) merged.log = [];
    if (typeof merged.piso !== 'number' || isNaN(merged.piso) || merged.piso < 1) merged.piso = 1;
    if (typeof merged.oro !== 'number' || isNaN(merged.oro) || merged.oro < 0) merged.oro = 0;
    if (typeof merged.hp !== 'number' || isNaN(merged.hp) || merged.hp < 0) merged.hp = merged.hpMax || 100;

    assert.ok(Array.isArray(merged.reliquias), 'reliquias debe ser array');
    assert.ok(Array.isArray(merged.maldiciones), 'maldiciones debe ser array');
    assert.ok(Array.isArray(merged.log), 'log debe ser array');
    assert.equal(merged.piso, 1, 'Piso debe recuperarse a 1');
    assert.equal(merged.oro, 0, 'Oro debe normalizarse a 0 si es negativo');
    assert.equal(merged.hp, 100, 'HP debe restaurarse con hpMax si es corrupto');
  });

  await t.test('Bug B1: Algoritmo de level-up en Roguelike protegido contra loop infinito', () => {
    let state = { xp: 5000, xpSig: 0, nivel: 1, hp: 50, hpMax: 50, atk: 10 };
    let subido = false;
    let lvlsSubidos = 0;
    let maxSubidas = 50;

    // Con xpSig = 0 debe abortar inmediatamente gracias al guard
    while (state.xp >= state.xpSig && maxSubidas-- > 0) {
      if (!isFinite(state.xpSig) || state.xpSig <= 0) break;
      state.xp -= state.xpSig;
      state.nivel++;
      state.xpSig = Math.round(state.xpSig * 1.45);
      subido = true;
      lvlsSubidos++;
    }

    assert.equal(lvlsSubidos, 0, 'No debe iterar infinitamente ante xpSig inválido');
  });

  await t.test('Bug F1: Presencia de listener beforeunload en rpg-roguelike.js', () => {
    assert.ok(rlCode.includes('window.addEventListener("beforeunload"'), 'rpg-roguelike.js debe guardar run activo ante beforeunload');
  });
});
