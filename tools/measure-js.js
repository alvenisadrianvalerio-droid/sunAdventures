const fs = require('fs');
const jsFiles = fs.readdirSync('.').filter(f => f.endsWith('.js'));
let scrollListeners = 0;
let resizeListeners = 0;
let mouseMoveListeners = 0;
let intervals = 0;
let localStorages = 0;

for (const f of jsFiles) {
  const content = fs.readFileSync(f, 'utf8');
  scrollListeners += (content.match(/addEventListener\s*\(\s*['"]scroll['"]/gi) || []).length;
  resizeListeners += (content.match(/addEventListener\s*\(\s*['"]resize['"]/gi) || []).length;
  mouseMoveListeners += (content.match(/addEventListener\s*\(\s*['"]mousemove['"]/gi) || []).length;
  intervals += (content.match(/setInterval\s*\(/gi) || []).length;
  localStorages += (content.match(/localStorage\./gi) || []).length;
}

console.log('JS Metrics:', { scrollListeners, resizeListeners, mouseMoveListeners, intervals, localStorages });
