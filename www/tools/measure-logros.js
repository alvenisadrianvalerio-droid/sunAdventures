const fs = require('fs');

const mockCalls = [];
global.localStorage = {
  getItem: (k) => { mockCalls.push(k); return null; },
  setItem: () => {}
};
global.window = {
  AlbumApp: {
    $: () => ({ appendChild: () => {}, innerHTML: '', querySelectorAll: () => [], addEventListener: () => {} }),
    SVG: {},
    getUserIdSafe: () => 'u_test',
    modules: {
      fotos: { getFotos: () => [] },
      notas: { getNotas: () => [] },
      grupo: { getGrupoActivo: () => ({ id: 'g1' }) }
    }
  },
  _getUserIdSafe: () => 'u_test',
  dispatchEvent: () => {},
  addEventListener: () => {}
};
global.document = {
  readyState: 'complete',
  createElement: () => ({ append: () => {}, appendChild: () => {}, querySelector: () => null, classList: { add: () => {}, remove: () => {}, contains: () => false } }),
  createDocumentFragment: () => ({ appendChild: () => {} }),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const logrosCode = fs.readFileSync('www/src/modules/album-logros.js', 'utf8');
const extraCode = fs.readFileSync('www/logros-extra.js', 'utf8');

eval(logrosCode);
eval(extraCode);

console.log('Total logros registrados:', window.LOGROS.length);

// 1. Uncached pass
mockCalls.length = 0;
window.LOGROS.forEach(l => {
  try { l.medir(); } catch (e) {}
});
console.log('Total localStorage reads in ONE uncached pass:', mockCalls.length);

// 2. RenderLogros cached pass (simulates renderLogros execution)
mockCalls.length = 0;
const memCache = new Map();
const originalGetLS = window._sunadGetLogrosLS;
const originalGetJSON = window._sunadGetLogrosJSON;

window._sunadGetLogrosLS = (k) => {
  if (memCache.has(k)) return memCache.get(k);
  const v = global.localStorage.getItem(k);
  memCache.set(k, v);
  return v;
};
window._sunadGetLogrosJSON = (k, fallback = null) => {
  const raw = window._sunadGetLogrosLS(k);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
};

window.LOGROS.forEach(l => {
  try { l.medir(); } catch (e) {}
});

console.log('Total localStorage reads in renderLogros cached pass:', mockCalls.length);
console.log('Unique keys accessed:', new Set(mockCalls).size);
