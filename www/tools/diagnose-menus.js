const fs = require('fs');

const html = fs.readFileSync('www/index.html', 'utf8');

console.log('=== DIAGNÓSTICO DE NODOS EN MENÚS ===');

// 1. nav-links
const navIdx = html.indexOf('id="main-nav-links"');
const navEnd = html.indexOf('</nav>', navIdx);
const navSection = html.slice(navIdx, navEnd);
const navItems = (navSection.match(/<a /g) || []).length;
console.log('1. Menu Hamburguesa Principal (#main-nav-links):');
console.log('   - Enlaces directos:', navItems);
console.log('   - Nodos DOM hijos aprox:', (navSection.match(/<[a-z0-9]+/gi) || []).length);

// 2. user-dropdown
const userIdx = html.indexOf('id="user-dropdown"');
const userEnd = html.indexOf('</header>', userIdx);
const userSection = html.slice(userIdx, userEnd);
const userItems = (userSection.match(/class="user-dropdown-item/g) || []).length;
console.log('2. Menu Perfil / Dropdown (#user-dropdown):');
console.log('   - Opciones / acciones:', userItems);
console.log('   - Nodos DOM hijos aprox:', (userSection.match(/<[a-z0-9]+/gi) || []).length);

// 3. chat-sidebar
const chatIdx = html.indexOf('id="chat-sidebar"');
const chatEnd = html.indexOf('</aside>', chatIdx);
const chatSection = html.slice(chatIdx, chatEnd);
console.log('3. Sidebar Móvil Chat (#chat-sidebar):');
console.log('   - Nodos DOM estáticos iniciales:', (chatSection.match(/<[a-z0-9]+/gi) || []).length);
