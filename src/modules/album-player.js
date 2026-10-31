/**
 * MÓDULO: REPRODUCTOR LOCAL (album-player.js)
 * Reproductor deshabilitado.
 */
(() => {
  "use strict";

  if (!window.AlbumApp) window.AlbumApp = { modules: {} };
  if (!window.AlbumApp.modules) window.AlbumApp.modules = {};

  const noop = () => {};

  window.AlbumApp.modules.player = {
    reproducirPista: noop,
    iniciarColaDesdePlaylist: noop,
    actualizarEstadoReproduciendo: noop,
    pausarReproduccion: noop,
    reanudarReproduccion: noop,
    siguienteCancion: noop,
    anteriorCancion: noop
  };

  window._playerQueue = () => ({ cola: [], indice: -1 });
})();
