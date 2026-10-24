const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Suite 04: Integridad de Recursos Declarados en Service Worker', () => {
  const rootDir = path.resolve(__dirname, '..');
  const swPath = path.join(rootDir, 'service-worker.js');
  const swCode = fs.readFileSync(swPath, 'utf8');

  test('Todos los recursos en ASSETS_ESTATICOS deben existir físicamente en disco', () => {
    const match = swCode.match(/const\s+ASSETS_ESTATICOS\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(match, 'No se pudo encontrar la constante ASSETS_ESTATICOS en service-worker.js');

    const listaStr = match[1];
    const items = listaStr
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(s => s.length > 0 && s !== './' && s !== '/');

    const faltantes = [];
    for (const item of items) {
      const cleanPath = item.replace(/^\.\//, '').replace(/^\//, '');
      const decodedPath = decodeURIComponent(cleanPath);
      const fullPath = path.join(rootDir, decodedPath);
      if (!fs.existsSync(fullPath)) {
        faltantes.push(cleanPath);
      }
    }

    assert.deepEqual(faltantes, [], `Recursos 404 en el Service Worker que romperían el offline en producción: ${faltantes.join(', ')}`);
  });
});
