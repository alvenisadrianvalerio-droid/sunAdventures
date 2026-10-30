const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('Suite 02: Characterization de Vistas y Rutas SPA', () => {
  const rootDir = path.resolve(__dirname, '..');
  const indexHtmlPath = path.join(rootDir, 'index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // Vistas estáticas reales presentes en index.html
  const VISTAS_ESTATICAS_HTML = [
    'inicio',
    'album',
    'chat',
    'logros',
    'notas',
    'mascotas',
    'finanzas',
    'diccionario',
    'recetas',
    'calendario'
  ];

  test('index.html debe contener el contenedor <section> o elemento de cada vista estática', () => {
    const vistasFaltantes = [];
    for (const vista of VISTAS_ESTATICAS_HTML) {
      const tieneDataView = indexHtml.includes(`data-view="${vista}"`);
      const tieneId = indexHtml.includes(`id="${vista}"`);
      if (!tieneDataView && !tieneId) {
        vistasFaltantes.push(vista);
      }
    }
    assert.deepEqual(vistasFaltantes, [], `Vistas que no se encuentran en index.html: ${vistasFaltantes.join(', ')}`);
  });

  test('Cada vista estática debe tener al menos un enlace de navegación (data-view-link)', () => {
    const sinEnlace = [];
    for (const vista of VISTAS_ESTATICAS_HTML) {
      const tieneLink = indexHtml.includes(`data-view-link="${vista}"`);
      if (!tieneLink) {
        sinEnlace.push(vista);
      }
    }
    assert.deepEqual(sinEnlace, [], `Vistas sin enlace data-view-link: ${sinEnlace.join(', ')}`);
  });
});
