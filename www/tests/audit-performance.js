const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

const cssMatches = [];
const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["']/g;
let m;
while ((m = cssRegex.exec(html)) !== null) {
  cssMatches.push(m[1].split('?')[0]);
}

const jsMatches = [];
const jsRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["']/g;
while ((m = jsRegex.exec(html)) !== null) {
  jsMatches.push(m[1].split('?')[0]);
}

let totalCss = 0;
console.log('=== CSS (' + cssMatches.length + ' archivos) ===');
cssMatches.forEach(f => {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) {
    const sz = fs.statSync(p).size;
    totalCss += sz;
    console.log(f.padEnd(35), (sz / 1024).toFixed(1) + ' KB');
  } else {
    console.log(f.padEnd(35), '404 NO ENCONTRADO');
  }
});

let totalJs = 0;
console.log('\n=== JS (' + jsMatches.length + ' archivos) ===');
jsMatches.forEach(f => {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) {
    const sz = fs.statSync(p).size;
    totalJs += sz;
    console.log(f.padEnd(35), (sz / 1024).toFixed(1) + ' KB');
  } else {
    console.log(f.padEnd(35), '404 NO ENCONTRADO');
  }
});

console.log('\n========================================');
console.log('TOTAL CSS: ' + (totalCss/1024).toFixed(1) + ' KB');
console.log('TOTAL JS:  ' + (totalJs/1024).toFixed(1) + ' KB');
console.log('TOTAL CRÍTICO AL INICIO: ' + ((totalCss + totalJs)/1024).toFixed(1) + ' KB (' + ((totalCss + totalJs)/(1024*1024)).toFixed(2) + ' MB)');
