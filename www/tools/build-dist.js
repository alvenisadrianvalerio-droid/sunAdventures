const fs = require('fs');
const path = require('path');
const terser = require('terser');

const rootDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Extraer listas de CSS y JS en orden estricto
const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["']/g;
const jsRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["']/g;

const cssFiles = [];
let m;
while ((m = cssRegex.exec(html)) !== null) {
  cssFiles.push(m[1].split('?')[0]);
}

const jsFiles = [];
while ((m = jsRegex.exec(html)) !== null) {
  const file = m[1].split('?')[0];
  if (!file.startsWith('http')) {
    jsFiles.push(file);
  }
}

// Chunks para code-splitting por área lógica:
const CHUNKS = {
  // Vendor y core indispensable para el primer render
  'vendor-core': [
    'supabase.js',
    'leaflet.js',
    'icons-emojis.js',
    'ds.js',
    'offline.js',
    'sun-modal.js',
    'preferences.js',
    'sprites-config.js',
    'sprites-names.js',
    'src/modules/album-core.js',
    'src/modules/album-grupo.js',
    'src/modules/album-auth.js',
    'src/modules/album-router.js',
    'album.js'
  ],
  // Módulo de logros y experiencia
  'view-logros': [
    'src/modules/album-logros.js',
    'logros-extra.js'
  ],
  // Módulo de álbum, fotos, chat y notas de pareja
  'view-album-social': [
    'src/modules/album-fotos.js',
    'src/modules/album-chat.js',
    'src/modules/album-notas.js',
    'pareja-sistema.js'
  ],
  // Módulo de recetario y diccionario
  'view-utilidades': [
    'diccionario.js',
    'recetas.js'
  ],
  // Módulo completo de Aventura RPG y Roguelike
  'view-rpg': [
    'rpg-loot.js',
    'rpg-items-dinamicos.js',
    'rpg-loadout.js',
    'rpg-data.js',
    'rpg.js',
    'rpg-postgame.js',
    'rpg-habilidades.js',
    'rpg-minimap.js',
    'rpg-canvas.js',
    'rpg-roguelike.js'
  ],
  // Minijuegos, tienda, música, finanzas y extras
  'view-app-extras': [
    'tienda.js',
    'script.js',
    'perfil.js',
    'juegos.js',
    'desafios-diarios.js',
    'mejoras.js',
    'efectos.js',
    'parches-v2.js',
    'watch-party.js',
    'parches-v3.js',
    'youtube-spotify-metadata.js',
    'player-extras.js',
    'finanzas.js',
    'capsula-tiempo.js'
  ]
};

async function build() {
  console.log('🚀 Iniciando pipeline de build y minificación...');
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  let rawCssTotal = 0;
  let minCssTotal = 0;
  let combinedCss = '';

  // 1. Bundle y minificación de CSS
  for (const f of cssFiles) {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      rawCssTotal += content.length;
      combinedCss += `\n/* ${f} */\n` + content;
    }
  }

  // Minificación simple y robusta de CSS
  const minifiedCss = combinedCss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([\{\}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

  const cssDistPath = path.join(assetsDir, 'app.bundle.min.css');
  fs.writeFileSync(cssDistPath, minifiedCss);
  minCssTotal = fs.statSync(cssDistPath).size;

  console.log(`\n📦 CSS Bundle: ${(rawCssTotal/1024).toFixed(1)} KB -> ${(minCssTotal/1024).toFixed(1)} KB (-${((1 - minCssTotal/rawCssTotal)*100).toFixed(1)}%)`);

  // 2. Chunks de JS minificados con Terser
  let rawJsTotal = 0;
  let minJsTotal = 0;
  const chunkOutputs = [];

  for (const [chunkName, files] of Object.entries(CHUNKS)) {
    let chunkSource = '';
    let chunkRawSize = 0;

    for (const f of files) {
      const p = path.join(rootDir, f);
      if (fs.existsSync(p)) {
        const c = fs.readFileSync(p, 'utf8');
        chunkRawSize += c.length;
        chunkSource += `\n;// --- ${f} ---\n` + c;
      }
    }
    rawJsTotal += chunkRawSize;

    console.log(`Minificando chunk [${chunkName}] (${files.length} archivos)...`);
    const minified = await terser.minify(chunkSource, {
      compress: {
        dead_code: true,
        drop_debugger: true,
        passes: 2
      },
      mangle: false, // Seguro para mantener comunicación entre scripts legacy
      format: { comments: false }
    });

    const outName = `${chunkName}.bundle.min.js`;
    const outPath = path.join(assetsDir, outName);
    fs.writeFileSync(outPath, minified.code);
    const sz = fs.statSync(outPath).size;
    minJsTotal += sz;

    chunkOutputs.push({ name: outName, size: sz, filesCount: files.length, rawSize: chunkRawSize });
  }

  console.log(`\n📦 JS Total: ${(rawJsTotal/1024).toFixed(1)} KB -> ${(minJsTotal/1024).toFixed(1)} KB (-${((1 - minJsTotal/rawJsTotal)*100).toFixed(1)}%)`);
  
  // 3. Generar index.html de producción optimizado en dist/
  let prodHtml = html;

  // Reemplazar todos los <link rel="stylesheet"> locales por el bundle único minificado
  const firstCssRegex = /<link rel="stylesheet" href="leaflet\.css">[\s\S]*?<link rel="stylesheet" href="recetas\.css\?v=5">/;
  prodHtml = prodHtml.replace(firstCssRegex, `<link rel="stylesheet" href="assets/app.bundle.min.css">`);

  // Reemplazar los 52 scripts sueltos por los 6 chunks organizados
  const scriptsBlockRegex = /<!-- ============================================================[\s\S]*?<!-- Resto de la app -->[\s\S]*?<script src="pareja-sistema\.js\?v=1"><\/script>/;
  const newScriptsTags = chunkOutputs.map(c => `  <script src="assets/${c.name}"></script>`).join('\n');
  prodHtml = prodHtml.replace(scriptsBlockRegex, `  <!-- Bundles Minificados (Code Splitting por Secciones) -->\n${newScriptsTags}`);

  fs.writeFileSync(path.join(distDir, 'index.html'), prodHtml);

  // Copiar manifest, icons e img
  console.log('\nCopiando assets estáticos a dist/...');
  const dirsToCopy = ['icons', 'img', 'sounds'];
  for (const d of dirsToCopy) {
    const srcD = path.join(rootDir, d);
    const dstD = path.join(distDir, d);
    if (fs.existsSync(srcD)) {
      fs.cpSync(srcD, dstD, { recursive: true });
    }
  }

  // Copiar archivos raíz necesarios (manifest, sw, etc.)
  const filesToCopy = ['manifest.json', 'service-worker.js'];
  for (const f of filesToCopy) {
    const srcF = path.join(rootDir, f);
    const dstF = path.join(distDir, f);
    if (fs.existsSync(srcF)) {
      fs.copyFileSync(srcF, dstF);
    }
  }

  console.log('\n======================================================');
  console.log('✅ BUILD DE PRODUCCIÓN COMPLETADO CON ÉXITO EN dist/');
  console.log('======================================================');
  console.log(`CSS Inicial: ${(rawCssTotal/1024).toFixed(1)} KB -> ${(minCssTotal/1024).toFixed(1)} KB`);
  console.log(`JS Inicial:  ${(rawJsTotal/1024).toFixed(1)} KB -> ${(minJsTotal/1024).toFixed(1)} KB`);
  console.log(`TOTAL CÓDIGO CRÍTICO: ${((rawCssTotal + rawJsTotal)/1024).toFixed(1)} KB -> ${((minCssTotal + minJsTotal)/1024).toFixed(1)} KB (${((minCssTotal + minJsTotal)/(1024*1024)).toFixed(2)} MB)`);
  console.log(`Número de Chunks JS: ${chunkOutputs.length}`);
  console.log(`Archivos JS sueltos eliminados de index.html: 52 -> ${chunkOutputs.length}`);
}

build().catch(err => {
  console.error('Error en build:', err);
  process.exit(1);
});
