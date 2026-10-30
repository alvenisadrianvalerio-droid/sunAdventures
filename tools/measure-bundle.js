const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptTagRegex = /<script\b([^>]*)>/gi;
const cssTagRegex = /<link\b([^>]*rel=["']stylesheet["'][^>]*)>/gi;

let syncScriptBytes = 0;
let deferScriptBytes = 0;
let syncCssBytes = 0;
let deferCssBytes = 0;

let tagMatch;
while ((tagMatch = scriptTagRegex.exec(html)) !== null) {
  const attrs = tagMatch[1];
  const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
  if (!srcMatch) continue;
  const src = srcMatch[1].split('?')[0];
  const isDeferred = /\bdefer\b/i.test(attrs) || /\basync\b/i.test(attrs);
  if (fs.existsSync(src)) {
    const size = fs.statSync(src).size;
    if (isDeferred) deferScriptBytes += size;
    else syncScriptBytes += size;
  }
}

while ((tagMatch = cssTagRegex.exec(html)) !== null) {
  const attrs = tagMatch[1];
  const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
  if (!hrefMatch) continue;
  const href = hrefMatch[1].split('?')[0];
  const isDeferred = /media=["']print["']/i.test(attrs) || /rel=["']preload["']/i.test(attrs);
  if (fs.existsSync(href)) {
    const size = fs.statSync(href).size;
    if (isDeferred) deferCssBytes += size;
    else syncCssBytes += size;
  }
}

console.log('Bloqueante JS KB:', (syncScriptBytes / 1024).toFixed(1));
console.log('Diferido JS KB:', (deferScriptBytes / 1024).toFixed(1));
console.log('Bloqueante CSS KB:', (syncCssBytes / 1024).toFixed(1));
console.log('Diferido CSS KB:', (deferCssBytes / 1024).toFixed(1));
console.log('Total crítico bloqueante (HTML + Sync CSS + Sync JS) KB:', ((html.length + syncCssBytes + syncScriptBytes) / 1024).toFixed(1));
