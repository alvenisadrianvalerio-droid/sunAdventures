const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

describe('Suite 01: Verificación de Integridad de Módulos y Sintaxis', () => {
  const rootDir = path.resolve(__dirname, '..');
  const jsFiles = fs.readdirSync(rootDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('.'))
    .map(f => path.join(rootDir, f));

  const srcModulesDir = path.join(rootDir, 'src', 'modules');
  if (fs.existsSync(srcModulesDir)) {
    fs.readdirSync(srcModulesDir)
      .filter(f => f.endsWith('.js'))
      .forEach(f => jsFiles.push(path.join(srcModulesDir, f)));
  }

  test('Todos los archivos JS clave deben tener sintaxis válida', () => {
    const fallos = [];
    for (const file of jsFiles) {
      try {
        execSync(`node -c "${file}"`, { stdio: 'pipe' });
      } catch (err) {
        fallos.push({ file: path.basename(file), error: err.message });
      }
    }
    assert.equal(fallos.length, 0, `Archivos con error de sintaxis: ${JSON.stringify(fallos, null, 2)}`);
  });
});
