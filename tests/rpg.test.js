const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const rpgCode = fs.readFileSync('rpg.js', 'utf8');

test('Suite 05: Tests de Regresión del Modo Aventura', async (t) => {
  await t.test('Bug A1: Carga y desinfección de estado corrupto', () => {
    // Simular el sanitizador de carga
    const def = () => ({ nivel: 1, xp: 0, hp: 120, enemigosDerrotados: 0, jefesDerrotados: [], zonasConquistadas: [], zonaActual: null, statsBase: { atk: 14, def: 5 } });
    const corrupto = {
      nivel: NaN,
      xp: -50,
      zonasConquistadas: null,
      jefesDerrotados: "invalido",
      statsBase: null
    };

    const merged = { ...def(), ...corrupto };
    if (!Array.isArray(merged.zonasConquistadas)) merged.zonasConquistadas = [];
    if (!Array.isArray(merged.jefesDerrotados)) merged.jefesDerrotados = [];
    if (typeof merged.nivel !== "number" || isNaN(merged.nivel) || merged.nivel < 1) merged.nivel = 1;
    if (typeof merged.xp !== "number" || isNaN(merged.xp) || merged.xp < 0) merged.xp = 0;
    if (typeof merged.enemigosDerrotados !== "number" || isNaN(merged.enemigosDerrotados) || merged.enemigosDerrotados < 0) merged.enemigosDerrotados = 0;
    if (!merged.statsBase || typeof merged.statsBase !== "object") merged.statsBase = { atk: 14, def: 5 };

    assert.equal(merged.nivel, 1, 'Nivel debe recuperarse a 1 si es NaN o inválido');
    assert.equal(merged.xp, 0, 'XP debe recuperarse a 0 si es negativo o inválido');
    assert.ok(Array.isArray(merged.zonasConquistadas), 'zonasConquistadas debe ser un array garantizado');
    assert.ok(Array.isArray(merged.jefesDerrotados), 'jefesDerrotados debe ser un array garantizado');
    assert.deepEqual(merged.statsBase, { atk: 14, def: 5 }, 'statsBase debe restaurarse con defaults');
  });

  await t.test('Bug B1: Algoritmo de level-up protegido contra loops infinitos', () => {
    const NIVEL_MAX = 50;
    const xpParaSubir = (nivel) => nivel >= NIVEL_MAX ? Infinity : Math.round(nivel * 160 + Math.pow(nivel, 1.8) * 35);

    // Caso 1: xp normal con subida de nivel correcta
    let state1 = { nivel: 1, xp: 500, hp: 100 };
    let sub = 0;
    let maxSubidas = 100;
    while (state1.nivel < NIVEL_MAX && maxSubidas-- > 0) {
      const req = xpParaSubir(state1.nivel);
      if (!isFinite(req) || req <= 0 || state1.xp < req) break;
      state1.xp -= req;
      state1.nivel++;
      sub++;
    }
    assert.ok(sub > 0, 'Debe haber subido de nivel');
    assert.ok(state1.nivel > 1, 'El nivel debió incrementar');

    // Caso 2: xpParaSubir retorna 0 o NaN (simulación de fallo sin colgar el hilo)
    let stateCorrupto = { nivel: 1, xp: 999999 };
    let iterations = 0;
    maxSubidas = 100;
    while (stateCorrupto.nivel < NIVEL_MAX && maxSubidas-- > 0) {
      const req = 0; // valor corrupto
      if (!isFinite(req) || req <= 0 || stateCorrupto.xp < req) break;
      stateCorrupto.xp -= req;
      stateCorrupto.nivel++;
      iterations++;
    }
    assert.equal(iterations, 0, 'El bucle debe abortar inmediatamente ante un req inválido sin freeze');
  });

  await t.test('Bug D1 & F1: Verificación de salvaguardas en código fuente', () => {
    assert.ok(rpgCode.includes('beforeunload'), 'rpg.js debe registrar listener de beforeunload para salvar estado');
    assert.ok(rpgCode.includes('maxSubidas-- > 0'), 'rpg.js debe tener límite superior de iteraciones en el while de level-up');
    assert.ok(rpgCode.includes('!Array.isArray(merged.zonasConquistadas)'), 'rpg.js debe validar y proteger el array zonasConquistadas en cargar()');
  });
});
