const fs = require('fs');
const content = fs.readFileSync('www/rpg.js', 'utf8');
const sprBlock = content.match(/const SPR_ENEMIGO = \{([\s\S]*?)\n  \};/)[1];
const sprKeys = new Set([...sprBlock.matchAll(/"([^"]+)":/g)].map(m => m[1]));

const regBlock = content.match(/const REGIONES = \[([\s\S]*?)\n  \];/)[1];
const baseElite = [...regBlock.matchAll(/"([a-z0-9\-]+)"/g)].map(m => m[1]);

const missing = [];
for (const k of baseElite) {
  if (k.includes('-') && !sprKeys.has(k) && !k.endsWith('-1') && k !== 'mapache') {
    missing.push(k);
  }
}
console.log('MISSING:', [...new Set(missing)]);

const metadataBlock = content.match(/const SPRITE_METADATA_48 = \{([\s\S]*?)\n  \};/)[1];
const metaKeys = new Set([...metadataBlock.matchAll(/"([^"]+)":/g)].map(m => m[1]));
const missingMeta = [];
for (const [k, v] of sprKeys.entries()) {
  const file = sprBlock.match(new RegExp('"' + k + '":\\s*"([^"]+)"'))?.[1];
  if (file && !file.startsWith('Bosses/') && !metaKeys.has(file)) {
    missingMeta.push({ k, file });
  }
}
console.log('MISSING METADATA:', missingMeta);

