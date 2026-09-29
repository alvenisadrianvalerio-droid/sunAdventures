/* ============================================================
   ICONOS SVG — Estilo único "SunAdventures" (línea gruesa dorada)
   Reemplaza TODOS los emojis genéricos por SVG reutilizables.
   Uso: ICONO.girasol, ICONO.corazon, ICONO.casa ...
   ============================================================ */
(function () {
  /* SVG 24×24 con trazo (stroke) */
  const S = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  /* SVG 24×24 relleno (fill) */
  const F = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ${extra}>${d}</svg>`;
  /* SVG 32×32 relleno (para comidas con más detalle) */
  const F32 = (d) =>
    `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">${d}</svg>`;

  window.ICONO = {
    /* ============================================================
       NATURALEZA / MASCOTAS
       ============================================================ */
    girasol: F(`<circle cx="12" cy="12" r="2.4"/>
      <ellipse cx="12" cy="5.6" rx="1.6" ry="2.3"/><ellipse cx="12" cy="18.4" rx="1.6" ry="2.3"/>
      <ellipse cx="5.6" cy="12" rx="2.3" ry="1.6"/><ellipse cx="18.4" cy="12" rx="2.3" ry="1.6"/>
      <ellipse cx="7.5" cy="7.5" rx="1.6" ry="2.3" transform="rotate(-45 7.5 7.5)"/>
      <ellipse cx="16.5" cy="7.5" rx="1.6" ry="2.3" transform="rotate(45 16.5 7.5)"/>
      <ellipse cx="7.5" cy="16.5" rx="1.6" ry="2.3" transform="rotate(45 7.5 16.5)"/>
      <ellipse cx="16.5" cy="16.5" rx="1.6" ry="2.3" transform="rotate(-45 16.5 16.5)"/>`),
    corazon: F(`<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`),
    estrella: F(`<path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/><path d="M19 3l.7 2.8L22 6.5l-2.3.7L19 10l-.7-2.8L16 6.5l2.3-.7L19 3z" opacity=".7"/>`),
    huella: F(`<circle cx="6" cy="9" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="9" r="2"/><path d="M12 13c-3 0-6 2-6 4 0 2 1.5 3 3 3s2-1 3-1 2 1 3 1 3-1 3-3c0-2-3-4-6-4z"/>`),
    raiz: S(`<path d="M12 22v-8"/><path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z"/><path d="M12 14c0-4 3-7 7-7 0 4-3 7-7 7z"/>`),
    fuego: F(`<path d="M12 2c0 3 3 4 3 8 0 1.5-1 3-3 3s-3-1.5-3-3c0-1 1-2 1-3 0-1-1-2-1-3 2 0 3-1 3-2z"/><path d="M11 19c-3 0-6-2-6-6 0-1 1-3 2-4 0 2 1 3 2 3 0-2 1-3 2-4-1 3 3 5 3 8 0 2-1 3-3 3z"/>`),

    /* ============================================================
       NAVEGACIÓN
       ============================================================ */
    casa: S(`<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>`),
    camara: S(`<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`),
    nota: S(`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>`),
    musica: S(`<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`),
    trofeo: S(`<path d="M6 9H4a2 2 0 0 1-2-2V6h4"/><path d="M18 9h2a2 2 0 0 0 2-2V6h-4"/><path d="M6 4h12v6a6 6 0 0 1-12 0z"/><path d="M12 16v4"/><path d="M8 20h8"/>`),
    mapa: S(`<path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>`),
    chat: S(`<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>`),
    descargar: S(`<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>`),
    calendario: S(`<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`),

    /* ============================================================
       TEMA
       ============================================================ */
    sol: S(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`),
    luna: S(`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`),
    rayo: S(`<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>`),

    /* ============================================================
       ESTADOS
       ============================================================ */
    ok: S(`<path d="M20 6L9 17l-5-5"/>`),
    x: S(`<path d="M18 6L6 18M6 6l12 12"/>`),
    mas: S(`<path d="M12 5v14M5 12h14"/>`),
    menos: S(`<path d="M5 12h14"/>`),
    flechaIzq: S(`<path d="M15 6l-6 6 6 6"/>`),
    flechaDer: S(`<path d="M9 6l6 6-6 6"/>`),
    flechaArr: S(`<path d="M6 9l6 6 6-6"/>`),
    reintentar: S(`<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>`),

    /* ============================================================
       ACCIONES
       ============================================================ */
    basura: S(`<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>`),
    lapiz: S(`<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>`),
    expandir: S(`<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>`),
    candado: S(`<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`),
    campana: S(`<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`),
    persona: F(`<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z"/>`),
    ajustes: S(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`),
    amigos: F(`<path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3 0-6 1.5-6 4v2h8v-2c0-1 .4-1.9 1-2.7-.9-.2-1.9-.3-3-.3zm8 0c-1.1 0-2.1.1-3 .3.7.7 1 1.6 1 2.7v2h8v-2c0-2.5-3-4-6-4z"/>`),
    salir: S(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`),
    tienda: S(`<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>`),
    llave: S(`<circle cx="8" cy="15" r="4"/><path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>`),
    regalo: S(`<path d="M20 12v10H4V12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`),
    medalla: F(`<circle cx="12" cy="15" r="6"/><path d="M9 3l3 6 3-6" stroke="currentColor" stroke-width="2" fill="none"/>`),
    corona: F(`<path d="M3 18h18l-1.5-9-4.5 4L12 5 9 13 4.5 9 3 18z"/>`),
    globo: S(`<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>`),
    imagen: S(`<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>`),
    comida: S(`<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>`),

    /* ============================================================
       ACCIONES MASCOTA
       ============================================================ */
    mimar: F(`<path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"/>`),
    dormir: S(`<path d="M3 20v-8l7-2 5 2 6-3v11H3z"/><path d="M12 12c1-2 3-3 5-2v4h-5z"/><circle cx="17" cy="10" r="2"/>`),
    jugar: S(`<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>`),
    moneda: F(`<circle cx="12" cy="12" r="10" fill="#ffd93d" stroke="#b8860b" stroke-width="1.5"/><circle cx="12" cy="12" r="7" fill="#ffe066"/><text x="12" y="16" font-size="9" fill="#8b6914" text-anchor="middle" font-weight="bold">S</text>`),

    /* ============================================================
       COMIDAS (viewBox 32×32, más detalle)
       ============================================================ */
    manzana: F32(`
      <path d="M16 9c-3-4-8-4-10 0-2 5 1 12 5 15 2 1 3 1 5 0 2 1 3 1 5 0 4-3 7-10 5-15-2-4-7-4-10 0z" fill="#e63946"/>
      <path d="M16 4c0-2 1-3 3-3" stroke="#5a3010" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="12" cy="14" rx="2" ry="3" fill="#fff" opacity=".35"/>
    `),
    zanahoria: F32(`
      <path d="M16 30L8 12c-1-3 1-6 4-6h8c3 0 5 3 4 6L16 30z" fill="#f77f00"/>
      <path d="M12 6l4-4M16 6l2-5M20 6l4-4" stroke="#2a8a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M13 14l1 6M19 14l-1 6" stroke="#c95e00" stroke-width="1" fill="none" stroke-linecap="round" opacity=".6"/>
    `),
    pizza: F32(`
      <path d="M16 3L3 28h26L16 3z" fill="#f4a261"/>
      <path d="M16 7L7 24h18L16 7z" fill="#e76f51"/>
      <circle cx="13" cy="18" r="2" fill="#c1121f"/>
      <circle cx="19" cy="20" r="2" fill="#c1121f"/>
      <circle cx="16" cy="14" r="1.5" fill="#c1121f"/>
      <path d="M16 3L3 28h26L16 3z" fill="none" stroke="#a0522d" stroke-width="1.5" stroke-linejoin="round"/>
    `),
    pescado: F32(`
      <path d="M4 16c4-6 10-8 16-6 3 1 5 3 6 6-1 3-3 5-6 6-6 2-12 0-16-6z" fill="#4cc9f0"/>
      <path d="M26 16l4-4v8l-4-4z" fill="#4cc9f0"/>
      <circle cx="10" cy="14" r="1.2" fill="#0a2540"/>
      <path d="M4 16c4-6 10-8 16-6" fill="none" stroke="#0096c7" stroke-width="1" opacity=".6"/>
      <circle cx="14" cy="18" r="1" fill="#fff" opacity=".5"/>
    `),
    semillas: F32(`
      <ellipse cx="10" cy="12" rx="3" ry="4" fill="#c9a227" transform="rotate(-20 10 12)"/>
      <ellipse cx="20" cy="10" rx="3" ry="4" fill="#e0b93d" transform="rotate(15 20 10)"/>
      <ellipse cx="16" cy="20" rx="3.5" ry="4.5" fill="#c9a227" transform="rotate(-5 16 20)"/>
      <ellipse cx="24" cy="20" rx="2.5" ry="3.5" fill="#e0b93d" transform="rotate(30 24 20)"/>
      <ellipse cx="8" cy="22" rx="2.5" ry="3.5" fill="#e0b93d" transform="rotate(-30 8 22)"/>
    `),
    cupcake: F32(`
      <path d="M8 16h16l-2 12H10L8 16z" fill="#d4a373"/>
      <path d="M10 18h12M11 22h10M12 26h8" stroke="#a0522d" stroke-width=".8" opacity=".6"/>
      <path d="M7 16c0-4 3-7 9-7s9 3 9 7H7z" fill="#ff8fab"/>
      <circle cx="16" cy="6" r="2" fill="#e63946"/>
      <circle cx="11" cy="8" r="1.5" fill="#4cc9f0"/>
      <circle cx="21" cy="8" r="1.5" fill="#ffd93d"/>
      <path d="M16 3v2" stroke="#2a8a4a" stroke-width="1.5" stroke-linecap="round"/>
    `),
    agua: F32(`
      <path d="M16 3C10 11 6 16 6 21a10 10 0 0 0 20 0c0-5-4-10-10-18z" fill="#4cc9f0"/>
      <path d="M16 3C10 11 6 16 6 21a10 10 0 0 0 10 10" fill="none" stroke="#0096c7" stroke-width="1" opacity=".5"/>
      <ellipse cx="12" cy="22" rx="2" ry="3" fill="#fff" opacity=".5"/>
    `),
    carbon: F32(`
      <path d="M6 20l4-10 8-4 8 6-2 12-10 4z" fill="#2b2b2b"/>
      <path d="M10 10l8-4 8 6" fill="none" stroke="#555" stroke-width="1.2"/>
      <path d="M6 20l4-10" fill="none" stroke="#555" stroke-width="1.2"/>
      <path d="M24 22l-2 4-10 2" fill="none" stroke="#555" stroke-width="1.2"/>
      <circle cx="12" cy="18" r="1.5" fill="#ff6b35"/>
      <circle cx="20" cy="16" r="1" fill="#ffb627"/>
      <circle cx="16" cy="22" r="1.2" fill="#ff6b35"/>
    `)
  };
})();