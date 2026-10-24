/* ============================================================
   ÁLBUM + NOTAS + PLAYLISTS + CALENDARIO + PLAYER LOCAL + CHAT
   v5 — Arquitectura Modular por Dominios Específicos
   ============================================================
   Módulos incluidos en src/modules/:
   - album-core.js       : Configuración, Supabase client, SVG, Utilidades DOM y URLs
   - album-grupo.js      : Grupos familiares/pareja, miembros, invitaciones, censura y ajustes
   - album-logros.js     : Sistema de logros, rachas de días y niveles de experiencia
   - album-fotos.js      : Álbum fotográfico polaroid, mapa interactivo, subida y edición
   - album-chat.js       : Chat grupal/privado en tiempo real y notificaciones Web Push
   - album-notas.js      : Notitas estilo polaroid, listas de chequeo interactivas y colores
   - album-playlists.js  : Playlists grupales, importación masiva y subida de archivos de audio
   - album-player.js     : Reproductor local en segundo plano, MediaSession y WakeLock
   - album-auth.js       : Autenticación, sesión, menú de usuario y dropdowns
   - album-router.js     : Enrutamiento hash (#vistas), drag & drop y eventos globales
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Si los módulos ya están cargados globalmente vía etiquetas script en index.html, no reinjectar
  if (window.AlbumApp && window.AlbumApp.modules?.router) {
    console.log("✅ Módulos de album.js cargados sincrónicamente desde index.html");
    return;
  }

  const modulos = [
    "src/modules/album-core.js",
    "src/modules/album-grupo.js",
    "src/modules/album-logros.js",
    "src/modules/album-fotos.js",
    "src/modules/album-chat.js",
    "src/modules/album-notas.js",
    "src/modules/album-auth.js",
    "src/modules/album-router.js"
  ];

  function cargarModulo(indice) {
    if (indice >= modulos.length) {
      console.log("✅ Todos los módulos de album.js cargados y orquestados exitosamente");
      return;
    }
    const script = document.createElement("script");
    script.src = modulos[indice];
    script.async = false;
    script.onload = () => cargarModulo(indice + 1);
    script.onerror = err => console.error("Error al cargar módulo:", modulos[indice], err);
    document.head.appendChild(script);
  }

  cargarModulo(0);
});