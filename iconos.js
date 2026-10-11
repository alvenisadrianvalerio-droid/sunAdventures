/* ============================================
   ICONOS — Reemplaza emojis por Lucide SVG
   ============================================ */

(function () {
  // Mapa: emoji Unicode → nombre del icono Lucide
  // Búscalos en https://lucide.dev/icons
  const MAPA_EMOJIS = {
    // Naturaleza / plantas
    '🌻': 'flower-2',      // girasol → flower-2 (line style)
    '🌱': 'sprout',
    '🍂': 'leaf',
    '🌸': 'flower',
    '🌙': 'moon',
    '☀️': 'sun',
    '✨': 'sparkles',
    '⭐': 'star',
    '🌟': 'star',

    // Corazones / emociones
    '💛': 'heart',
    '💜': 'heart',
    '💖': 'heart',
    '💌': 'mail-heart',
    '🥰': 'heart-handshake',
    '😊': 'smile',
    '🥹': 'smile-plus',
    '😴': 'moon',

    // Trofeos / logros
    '🏆': 'trophy',
    '🥇': 'award',
    '🎖️': 'medal',
    '🔥': 'flame',
    '⚡': 'zap',
    '💎': 'gem',
    '💫': 'sparkle',

    // Multimedia
    '🎵': 'music',
    '🎶': 'music-2',
    '🎧': 'headphones',
    '🎤': 'mic',
    '🎸': 'guitar',
    '🎹': 'piano',
    '💿': 'disc',
    '📀': 'disc-2',

    // Objetos / acciones
    '📸': 'camera',
    '📷': 'camera',
    '📁': 'folder',
    '📂': 'folder-open',
    '📥': 'download',
    '📤': 'upload',
    '⬆️': 'arrow-up',
    '⬇️': 'arrow-down',
    '➡️': 'arrow-right',
    '⬅️': 'arrow-left',
    '🔍': 'search',
    '🔔': 'bell',
    '🔕': 'bell-off',
    '🔊': 'volume-2',
    '🔉': 'volume-1',
    '🔇': 'volume-x',
    '🔀': 'shuffle',
    '🔁': 'repeat',
    '🔂': 'repeat-1',
    '⏮': 'skip-back',
    '⏭': 'skip-forward',
    '▶': 'play',
    '⏸': 'pause',
    '⏹': 'square',
    '⏺': 'circle',
    '🎬': 'clapperboard',
    '🎞️': 'film',
    '📅': 'calendar',
    '📆': 'calendar-days',
    '🗓️': 'calendar-range',
    '⏰': 'alarm-clock',
    '⌛': 'hourglass',
    '⏳': 'hourglass',

    // Navegación
    '🏠': 'home',
    '🗺️': 'map',
    '📍': 'map-pin',
    '💬': 'message-circle',
    '💭': 'message-square-dots',
    '📝': 'pencil',
    '✏️': 'pencil',
    '✒️': 'pen',
    '🖊️': 'pen-tool',

    // Varios
    '🎁': 'gift',
    '🎂': 'cake',
    '🎉': 'party-popper',
    '🎊': 'confetti',
    '👤': 'user',
    '👥': 'users',
    '⚙️': 'settings',
    '🔧': 'wrench',
    '🔨': 'hammer',
    '🛠️': 'hammer-wrench',
    '↪': 'log-out',
    '↩': 'log-in',
    '❌': 'x',
    '✅': 'check',
    '✓': 'check',
    '⚠️': 'alert-triangle',
    'ℹ️': 'info',
    '❓': 'help-circle',
    '➕': 'plus',
    '➖': 'minus',
    '×': 'x',

    // Media / info
    '📊': 'bar-chart-3',
    '📈': 'trending-up',
    '📉': 'trending-down',
    '💡': 'lightbulb',
    '📖': 'book-open',
    '📚': 'library',

    // Mascotas / animales
    '🦝': 'squirrel',
    '🐱': 'cat',
    '🐑': 'sheep',
    '🐤': 'bird',
    '🦒': 'giraffe',
    '🦄': 'unicorn',
    '🍔': 'sandwich',
    '🐾': 'paw-print'
  };

  // Colores específicos para ciertos iconos
  const COLORES_ESPECIALES = {
    'sun': '#ffd93d',
    'flower-2': '#ffd93d',
    'heart': '#ff6ba8',
    'heart-handshake': '#ff6ba8',
    'mail-heart': '#ff6ba8',
    'trophy': '#ffd93d',
    'award': '#ffd93d',
    'medal': '#ffd93d',
    'flame': '#ff6b35',
    'zap': '#ffd93d',
    'sparkle': '#ffd93d',
    'sparkles': '#ffd93d',
    'star': '#ffd93d',
    'gem': '#6cb8ff',
    'music': '#a684f0',
    'music-2': '#a684f0'
  };

  /**
   * Convierte un emoji en un <i data-lucide="..."> con clase opcional
   */
  function crearIcono(nombreLucide, color) {
    const i = document.createElement('i');
    i.setAttribute('data-lucide', nombreLucide);
    i.className = 'icono-inline';
    if (color) {
      i.style.color = color;
      i.style.stroke = color;
    }
    return i;
  }

  /**
   * Recorre el DOM y reemplaza emojis en nodos de texto.
   * Llámalo cada vez que el DOM cambie con contenido nuevo.
   */
  function reemplazarEmojis(root = document.body) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (nodo) => {
          // Ignorar nodos vacíos o dentro de <script> / <style>
          if (!nodo.nodeValue || !nodo.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const padre = nodo.parentNode;
          if (!padre) return NodeFilter.FILTER_REJECT;
          if (padre.tagName === 'SCRIPT' || padre.tagName === 'STYLE') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodosTexto = [];
    let nodo;
    while ((nodo = walker.nextNode())) nodosTexto.push(nodo);

    nodosTexto.forEach((nodoTexto) => {
      const texto = nodoTexto.nodeValue;
      // Comprobar si contiene algún emoji del mapa
      let contiene = false;
      for (const emoji of Object.keys(MAPA_EMOJIS)) {
        if (texto.includes(emoji)) { contiene = true; break; }
      }
      if (!contiene) return;

      // Construir el fragmento reemplazando
      const frag = document.createDocumentFragment();
      let resto = texto;

      while (resto.length > 0) {
        // Buscar el emoji más temprano en el texto
        let posicionMin = -1;
        let emojiElegido = null;
        let iconoElegido = null;

        for (const [emoji, icono] of Object.entries(MAPA_EMOJIS)) {
          const pos = resto.indexOf(emoji);
          if (pos !== -1 && (posicionMin === -1 || pos < posicionMin)) {
            posicionMin = pos;
            emojiElegido = emoji;
            iconoElegido = icono;
          }
        }

        if (posicionMin === -1) {
          // No hay más emojis → añadir el resto como texto
          frag.appendChild(document.createTextNode(resto));
          break;
        }

        // Añadir el texto anterior al emoji
        if (posicionMin > 0) {
          frag.appendChild(document.createTextNode(resto.slice(0, posicionMin)));
        }

        // Añadir el icono en su lugar
        const color = COLORES_ESPECIALES[iconoElegido] || null;
        frag.appendChild(crearIcono(iconoElegido, color));

        // Continuar con el resto
        resto = resto.slice(posicionMin + emojiElegido.length);
      }

      nodoTexto.parentNode.replaceChild(frag, nodoTexto);
    });

    // Reiniciar Lucide para que pinte los nuevos <i>
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // Exponer globalmente
  window.reemplazarEmojis = reemplazarEmojis;
  window.crearIcono = crearIcono;

  // Auto-ejecutar al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => reemplazarEmojis(document.body), 100);
    });
  } else {
    setTimeout(() => reemplazarEmojis(document.body), 100);
  }

  // También re-ejecutar cuando el hash cambie (cambio de vista)
  window.addEventListener('hashchange', () => {
    setTimeout(() => reemplazarEmojis(document.body), 200);
  });
    // Exponer globalmente
  window.reemplazarEmojis = reemplazarEmojis;
  window.crearIcono = crearIcono;

  // ✅ Solo auto-ejecutar si Lucide realmente está cargado
  // (ahorra cientos de milisegundos si no se usa)
  const lucideListo = () => !!(window.lucide && typeof window.lucide.createIcons === "function");
  if (lucideListo()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => setTimeout(() => reemplazarEmojis(document.body), 200));
    } else {
      setTimeout(() => reemplazarEmojis(document.body), 200);
    }
    window.addEventListener("hashchange", () => setTimeout(() => reemplazarEmojis(document.body), 400));
  }
})();
