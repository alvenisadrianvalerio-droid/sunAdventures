/* ============================================================
   RPG.JS v12 — Balance + Loadout + Pasivas
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("rpg")) window._extraVistas.push("rpg");

(function boot() {
  const API = window._TiendaAPI;
  if (!API) { let n = 0; const it = () => { if (window._TiendaAPI) return boot(); if (++n > 50) return; setTimeout(it, 100); }; return setTimeout(it, 100); }
  const { ICONO, COMIDAS, getMonedas, setMonedas, cargarInv, notifMascota, getUserId } = API;
  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clamp = (n, a = 0, b = 1e9) => Math.max(a, Math.min(b, n));
  const SND = t => { try { window._snd?.(t); } catch { } };
  const MASCOTAS = window._MASCOTAS || {};
  const FX = det => window.dispatchEvent(new CustomEvent("rpg:fx", { detail: det }));
  const FX_KEY = id => (window.RpgCanvas?.HABILIDAD_FX?.[id]) || "slash";

  const DIR_48 = 'img/48x48/';
  const SPR_ENEMIGO = {
    // --- Murciélagos (Bats) ---
    "murcielago-comun": "Bats/Bat 01 48.png",
    "murcielago-vampiro": "Bats/Bat 02 48.png",
    "murcielago-abismal": "Bats/Bat 03 48.png",
    // --- Hongos (Fungi) ---
    "hongo-espora": "Fungi/Fungus 01 48.png",
    "hongo-venenoso": "Fungi/Fungus 02 48.png",
    "hongo-alucinogeno": "Fungi/Fungus 03 48.png",
    "hongo-anciano": "Fungi/Fungus 04 48.png",
    // --- Fantasmas (Ghosts) ---
    "espectro-errante": "Ghosts/Ghost 01 48.png",
    "fantasma-vengativo": "Ghosts/Ghost 02 48.png",
    "alma-en-pena": "Ghosts/Ghost 03 48.png",
    // --- Orbinautas (Orbinauts) ---
    "orbinauta-azul": "Orbinauts/Orbinaut 01 48.png",
    "orbinauta-fuego": "Orbinauts/Orbinaut 02 48.png",
    "orbinauta-electrico": "Orbinauts/Orbinaut 03 48.png",
    "orbinauta-vacio": "Orbinauts/Orbinaut 04 48.png",
    // --- Orcos (Orcs) ---
    "orco-guerrero": "Orcs/Enemy Orc 01 48.png",
    // --- Ratas (Rats) ---
    "rata-de-cloaca": "Rats/Rat 01 48.png",
    "rata-rabiosa": "Rats/Rat 02 48.png",
    "rata-plagada": "Rats/Rat 03 48.png",
    // --- Esqueletos (Skeletons) ---
    "esqueleto-soldado": "Skeletons/Skeleton 01 48.png",
    "esqueleto-arquero": "Skeletons/Skeleton 02 48.png",
    "esqueleto-armadurado": "Skeletons/Skeleton 03 48.png",
    // --- Slimes bebés y normales (Slimes) ---
    "slime-bebe-verde": "Slimes/Baby Slime 01 48.png",
    "slime-bebe-azul": "Slimes/Baby Slime 02 48.png",
    "slime-bebe-rojo": "Slimes/Baby Slime 03 48.png",
    "slime-bebe-dorado": "Slimes/Baby Slime 04 48.png",
    "slime-verde": "Slimes/Slime 01 48.png",
    "slime-azul": "Slimes/Slime 02 48.png",
    "slime-rojo": "Slimes/Slime 03 48.png",
    "slime-dorado": "Slimes/Slime 04 48.png",
    // --- Serpientes (Snakes) ---
    "serpiente-cascabel": "Snakes/Snake 01 48.png",
    "serpiente-esmeralda": "Snakes/Snake 02 48.png",
    "serpiente-coral": "Snakes/Snake 03 48.png",
    // --- Zombis (Zombies) ---
    "zombi-podrido": "Zombies/Zombie 01 48.png",
    "zombi-infectado": "Zombies/Zombie 02 48.png",
    "zombi-voraz": "Zombies/Zombie 03 48.png",
    // --- Vehículos y Objetos Mágicos ---
    "vagoneta-poseida": "Vehicles/Minecart 01 48.png",
    "espada-viviente": "Weapons/Sword 01 48.png",
    // --- Jefes (Bosses) ---
    "reina-arana": "Bosses/arana.png",
    "demonio-ancestral": "Bosses/demonio.png",
    "dragon-supremo": "Bosses/dragon.png",
    "golem-colosal": "Bosses/golem.png",
    "kraken-abisal": "Bosses/kraken.png",
    "rey-bestia-leon": "Bosses/leon.png",
    "lobo-alfa-ancestral": "Bosses/lobo.png",
    "archimago-oscuro": "Bosses/mago.webp",
    "sapo-gigante-rey": "Bosses/rana.png",
    "rey-rata": "Bosses/rata.png",
    "escorpion-emperador": "Bosses/scorpion.png",
    "gran-serpiente-antigua": "Bosses/serpiente.webp",
    "senor-tengu": "Bosses/tengu.png",
    "troll-titánico": "Bosses/troll.webp",
    "lord-vampiro": "Bosses/vampiro.png",
    "patriarca-zombi": "Bosses/zombie.png"
  };

  const SPR_REGION = {
    praderas: "Bosses/arana.png",
    bosque: "Bosses/rana.png",
    cueva: "Bosses/golem.png",
    desierto: "Bosses/scorpion.png",
    glaciar: "Bosses/lobo.png",
    volcan: "Bosses/dragon.png",
    ruinas: "Bosses/mago.webp",
    sombras: "Bosses/vampiro.png",
    abismo: "Bosses/demonio.png",
    selva: "Bosses/leon.png",
    pantano: "Bosses/zombie.png",
    tundra: "Bosses/troll.webp",
    cielo: "Bosses/tengu.png",
    inframundo: "Bosses/serpiente.webp",
    vacio: "Bosses/kraken.png"
  };

  // Metadatos de columnas y filas (de 48x48 px por frame)
  // Las últimas 2 columnas de las hojas de 6, 9 y 10 cols corresponden a los frames de recibir daño (hurt).
  const SPRITE_METADATA_48 = {
    // Bats (9 cols x 4 rows) -> Primeros 7 frames idle (0..6), cols 7 y 8 hurt
    "Bats/Bat 01 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    "Bats/Bat 02 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    "Bats/Bat 03 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    // Fungi (6 cols x 8 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Fungi/Fungus 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 04 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    // Ghosts (6 cols x 4 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Ghosts/Ghost 01 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Ghosts/Ghost 02 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Ghosts/Ghost 03 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    // Orbinauts (3 cols x 1 row) -> 3 frames de giro normal
    "Orbinauts/Orbinaut 01 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 02 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 03 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 04 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    // Orcs (10 cols x 16 rows) -> Primeros 4 frames idle (0..3), cols 8 y 9 hurt (daño)
    "Orcs/Enemy Orc 01 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    // Rats (6 cols x 8 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Rats/Rat 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Rats/Rat 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Rats/Rat 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    // Skeletons (10 cols x 16 rows) -> Primeros 4 frames idle (0..3), cols 8 y 9 hurt (daño)
    "Skeletons/Skeleton 01 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Skeletons/Skeleton 02 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Skeletons/Skeleton 03 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    // Slimes Baby (6 cols x 4 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Slimes/Baby Slime 01 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 02 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 03 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 04 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    // Slimes Grandes (6 cols x 8 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Slimes/Slime 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Slime 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Slime 03 48.png": { cols: 6, rows: 8, idleFrames: 6, fps: 7 },
    "Slimes/Slime 04 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    // Snakes (6 cols x 8 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Snakes/Snake 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Snakes/Snake 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Snakes/Snake 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    // Vehicles / Weapons (8 cols x 16 rows) -> Primeros 4 frames idle
    "Vehicles/Minecart 01 48.png": { cols: 8, rows: 16, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-8", fps: 6 },
    "Weapons/Sword 01 48.png": { cols: 8, rows: 16, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-8", fps: 6 },
    // Zombies (6 cols x 8 rows) -> Primeros 4 frames idle (0..3), cols 4 y 5 hurt (daño)
    "Zombies/Zombie 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 },
    "Zombies/Zombie 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 },
    "Zombies/Zombie 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 }
  };

  function renderMobAnimado(relPath, size = 96, cls = "") {
    if (!relPath) return "";
    // Los jefes son ilustraciones completas HD (768x768), no spritesheets cortados
    if (relPath.startsWith("Bosses/")) {
      const fullUrl = `img/48x48/${relPath}`;
      return `<img src="${fullUrl}" alt="" class="rpg-boss-animado ${cls}" style="width:${size}px;height:${size}px;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">`;
    }

    const meta = SPRITE_METADATA_48[relPath] || { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 };
    const duracion = ((meta.idleFrames || 4) / (meta.fps || 6)).toFixed(2);
    const bgW = meta.cols * 100;
    const bgH = meta.rows * 100;
    const fullUrl = `img/48x48/${relPath}`;
    const animName = meta.animKey || `anim-mob-${meta.idleFrames}`;
    const hurtPct = meta.cols > 1 ? ((meta.hurtCol || 4) / (meta.cols - 1) * 100).toFixed(3) : 0;

    return `<div class="rpg-mob-animado ${cls}" style="
      --mob-cols:${meta.cols};
      --mob-rows:${meta.rows};
      --mob-frames:${meta.idleFrames};
      --mob-dur:${duracion}s;
      --mob-hurt-x:${hurtPct}%;
      width:${size}px;
      height:${size}px;
      background-image:url('${fullUrl}');
      background-repeat:no-repeat;
      background-size:${bgW}% ${bgH}%;
      background-position:0% 0%;
      image-rendering:pixelated;
      display:inline-block;
      animation:${animName} ${duracion}s steps(${meta.idleFrames}) infinite;
    "></div>`;
  }

  function spriteHtml(rutaOClave, cls = "rpg-sprite-img", alt = "") {
    if (!rutaOClave) return "";
    let rel = SPR_ENEMIGO[rutaOClave] || SPR_REGION[rutaOClave] || rutaOClave;
    if (rel.startsWith("img/48x48/")) rel = rel.replace("img/48x48/", "");

    // Si es un Jefe de la carpeta Bosses, mostrarlo directamente como imagen completa
    if (rel.startsWith("Bosses/")) {
      const fullUrl = `img/48x48/${rel}`;
      return `<img class="${cls}" src="${fullUrl}" alt="${alt}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='img/girasol-loading.png'">`;
    }

    const meta = SPRITE_METADATA_48[rel];

    // Si es un spritesheet de 48x48, mostramos el primer frame recortado limpiamente
    if (meta) {
      const bgW = meta.cols * 100;
      const bgH = meta.rows * 100;
      const fullUrl = `img/48x48/${rel}`;
      return `<div class="${cls} rpg-sprite-thumb-48" style="
        width:32px;
        height:32px;
        background-image:url('${fullUrl}');
        background-repeat:no-repeat;
        background-size:${bgW}% ${bgH}%;
        background-position:0% 0%;
        image-rendering:pixelated;
        display:inline-block;
      "></div>`;
    }

    let ruta = rel.startsWith("img/") ? rel : `${DIR_48}${rel}`;
    return `<img class="${cls}" src="${ruta}" alt="${alt}" loading="lazy" decoding="async">`;
  }

  const REGIONES = [
    {
      id: "praderas", nombre: "Praderas Verdes", icono: ICONO.girasol,
      base: ["slime-bebe-verde", "rata-de-cloaca", "hongo-espora", "murcielago-comun"],
      elite: ["slime-verde", "rata-rabiosa", "hongo-venenoso"],
      jefe: "reina-arana", jefeNombre: "La Reina Araña", jefeIcono: ICONO.girasol
    },
    {
      id: "bosque", nombre: "Bosque Espeso", icono: ICONO.bosque,
      base: ["slime-bebe-azul", "hongo-alucinogeno", "serpiente-cascabel", "murcielago-vampiro"],
      elite: ["slime-azul", "hongo-anciano", "orco-guerrero"],
      jefe: "sapo-gigante-rey", jefeNombre: "Rey Sapo del Bosque", jefeIcono: ICONO.bosque
    },
    {
      id: "cueva", nombre: "Cavernas de Cristal", icono: ICONO.gema,
      base: ["murcielago-comun", "rata-rabiosa", "vagoneta-poseida", "orbinauta-azul"],
      elite: ["orbinauta-electrico", "orco-guerrero", "murcielago-abismal"],
      jefe: "golem-colosal", jefeNombre: "El Golem Colosal", jefeIcono: ICONO.gema
    },
    {
      id: "desierto", nombre: "Desierto Ardiente", icono: ICONO.fuego,
      base: ["serpiente-cascabel", "serpiente-coral", "esqueleto-soldado", "orbinauta-fuego"],
      elite: ["serpiente-esmeralda", "esqueleto-arquero", "slime-rojo"],
      jefe: "escorpion-emperador", jefeNombre: "El Emperador Escorpión", jefeIcono: ICONO.corona
    },
    {
      id: "glaciar", nombre: "Glaciar Helado", icono: ICONO.copo,
      base: ["slime-bebe-azul", "orbinauta-azul", "espectro-errante", "murcielago-abismal"],
      elite: ["orbinauta-electrico", "fantasma-vengativo", "slime-azul"],
      jefe: "lobo-alfa-ancestral", jefeNombre: "El Lobo Alfa Ancestral", jefeIcono: ICONO.corona
    },
    {
      id: "volcan", nombre: "Cráter Volcánico", icono: ICONO.fuego,
      base: ["slime-bebe-rojo", "slime-rojo", "orbinauta-fuego", "esqueleto-arquero"],
      elite: ["espada-viviente", "orco-guerrero", "zombi-voraz"],
      jefe: "dragon-supremo", jefeNombre: "El Dragón Supremo", jefeIcono: ICONO.fuego
    },
    {
      id: "ruinas", nombre: "Ruinas Malditas", icono: ICONO.castillo,
      base: ["esqueleto-soldado", "esqueleto-arquero", "esqueleto-armadurado", "zombi-podrido"],
      elite: ["zombi-infectado", "espada-viviente", "fantasma-vengativo"],
      jefe: "archimago-oscuro", jefeNombre: "El Archimago Oscuro", jefeIcono: ICONO.corona
    },
    {
      id: "sombras", nombre: "Catacumbas de Sombras", icono: ICONO.luna,
      base: ["murcielago-abismal", "rata-plagada", "espectro-errante", "fantasma-vengativo"],
      elite: ["alma-en-pena", "orbinauta-vacio", "zombi-voraz"],
      jefe: "lord-vampiro", jefeNombre: "El Lord Vampiro", jefeIcono: ICONO.luna
    },
    {
      id: "abismo", nombre: "Abismo Profundo", icono: ICONO.corona,
      base: ["orbinauta-vacio", "alma-en-pena", "esqueleto-armadurado", "espada-viviente"],
      elite: ["orco-guerrero", "serpiente-esmeralda", "rata-plagada"],
      jefe: "demonio-ancestral", jefeNombre: "El Demonio Ancestral", jefeIcono: ICONO.corona
    },
    {
      id: "selva", nombre: "Selva Primitiva", icono: ICONO.bosque,
      base: ["serpiente-esmeralda", "serpiente-coral", "hongo-venenoso", "slime-verde"],
      elite: ["orco-guerrero", "hongo-anciano", "orbinauta-electrico"],
      jefe: "rey-bestia-leon", jefeNombre: "El Rey Bestia León", jefeIcono: ICONO.bosque
    },
    {
      id: "pantano", nombre: "Pantano Putrefacto", icono: ICONO.gota,
      base: ["zombi-podrido", "zombi-infectado", "rata-plagada", "slime-bebe-verde"],
      elite: ["zombi-voraz", "hongo-anciano", "esqueleto-armadurado"],
      jefe: "patriarca-zombi", jefeNombre: "El Patriarca Zombi", jefeIcono: ICONO.gota
    },
    {
      id: "tundra", nombre: "Tundra Gélida", icono: ICONO.copo,
      base: ["slime-azul", "orbinauta-azul", "esqueleto-soldado", "espectro-errante"],
      elite: ["esqueleto-armadurado", "fantasma-vengativo", "orco-guerrero"],
      jefe: "troll-titánico", jefeNombre: "El Troll Titánico", jefeIcono: ICONO.copo
    },
    {
      id: "cielo", nombre: "Cielos Tempestad", icono: ICONO.estrella,
      base: ["murcielago-vampiro", "orbinauta-electrico", "espectro-errante", "alma-en-pena"],
      elite: ["fantasma-vengativo", "espada-viviente", "slime-dorado"],
      jefe: "senor-tengu", jefeNombre: "El Señor Tengu", jefeIcono: ICONO.estrella
    },
    {
      id: "inframundo", nombre: "Inframundo Ígneo", icono: ICONO.fuego,
      base: ["slime-bebe-rojo", "orbinauta-fuego", "esqueleto-armadurado", "serpiente-coral"],
      elite: ["zombi-voraz", "espada-viviente", "rata-plagada"],
      jefe: "gran-serpiente-antigua", jefeNombre: "La Gran Serpiente Antigua", jefeIcono: ICONO.fuego
    },
    {
      id: "vacio", nombre: "El Vacío Cósmico", icono: ICONO.corona,
      base: ["orbinauta-vacio", "alma-en-pena", "slime-dorado", "slime-bebe-dorado"],
      elite: ["espada-viviente", "orbinauta-electrico", "esqueleto-armadurado"],
      jefe: "kraken-abisal", jefeNombre: "El Kraken Abisal", jefeIcono: ICONO.corona
    }
  ];

  const BIOMAS = {
    praderas: { imagen: "img/biomas/gen-5480873c-7b50-45b8-a3c1-abc457a2f0fa.png", acento: "#ffd84d", ambiente: "Campo de girasoles" },
    bosque: { imagen: "img/biomas/gen-df614595-485a-47f1-a074-7d4b4aa3d08e.png", acento: "#65d68b", ambiente: "Senderos del bosque" },
    cueva: { imagen: "img/biomas/gen-e46023c3-4ac1-4361-b312-e6f525bcead6.png", acento: "#81ddff", ambiente: "Cueva de cristal" },
    desierto: { imagen: "img/biomas/gen-3b1ee61a-d08b-44bc-a27b-9c56f5e009ef.png", acento: "#ffc36e", ambiente: "Dunas antiguas" },
    glaciar: { imagen: "img/biomas/gen-02a9154e-49f2-4451-b734-a787ce316fd5.png", acento: "#a8eaff", ambiente: "Glaciar eterno" },
    volcan: { imagen: "img/biomas/gen-6148d727-5f04-4360-b612-587e58fbd20d.png", acento: "#ff7958", ambiente: "Cráter en erupción" },
    ruinas: { imagen: "img/biomas/gen-5510680d-7fe8-4834-b72d-04dd75fc60e2.png", acento: "#e9bd78", ambiente: "Ruinas sepultadas" },
    sombras: { imagen: "img/biomas/gen-710f318c-55ee-45ba-aad5-7afcca056906.png", acento: "#b89aff", ambiente: "Bosque encantado" },
    abismo: { imagen: "img/biomas/gen-7f3a60dc-0b7b-4b78-9ae9-e63140799a1c.png", acento: "#ff8268", ambiente: "Abismo de lava" },
    selva: { imagen: "img/biomas/gen-54356df9-2637-441f-96a0-4742f61f6a57.png", acento: "#74dc8a", ambiente: "Selva ancestral" },
    pantano: { imagen: "img/biomas/gen-675040d8-722c-4ac6-bf7d-6d236587f618.png", acento: "#76dfc2", ambiente: "Pantano de los espíritus" },
    tundra: { imagen: "img/biomas/gen-b8ac5df4-7a81-443c-8cec-4d4f30bef9aa.png", acento: "#caeaff", ambiente: "Bosque de escarcha" },
    cielo: { imagen: "img/biomas/gen-ef4c41e3-8713-47f7-acde-eefb81a85d11.png", acento: "#ffb3dc", ambiente: "Jardines celestiales" },
    inframundo: { imagen: "img/biomas/gen-f34b37dd-a44a-4ac1-8ef3-a5b18a314480.png", acento: "#ff9a55", ambiente: "Tierras del inframundo" },
    vacio: { imagen: "img/biomas/gen-a36ad96d-725f-45b4-8793-4f27add89fb3.png", acento: "#b6a2ff", ambiente: "Ciudad del vacío" }
  };
  REGIONES.forEach(r => r.bioma = BIOMAS[r.id]);

  const NOMBRES = {
    // Murciélagos
    "murcielago-comun": "Murciélago Común",
    "murcielago-vampiro": "Murciélago Vampiro",
    "murcielago-abismal": "Murciélago Abismal",
    // Hongos
    "hongo-espora": "Hongo de Esporas",
    "hongo-venenoso": "Hongo Venenoso",
    "hongo-alucinogeno": "Hongo Hechicero",
    "hongo-anciano": "Hongo Anciano",
    // Fantasmas
    "espectro-errante": "Espectro Errante",
    "fantasma-vengativo": "Fantasma Vengativo",
    "alma-en-pena": "Alma en Pena",
    // Orbinautas
    "orbinauta-azul": "Orbinauta Arcano",
    "orbinauta-fuego": "Orbinauta Ígneo",
    "orbinauta-electrico": "Orbinauta de Trueno",
    "orbinauta-vacio": "Orbinauta Cósmico",
    // Orcos
    "orco-guerrero": "Orco Berserker",
    // Ratas
    "rata-de-cloaca": "Rata de Cloaca",
    "rata-rabiosa": "Rata Rabiosa",
    "rata-plagada": "Rata Infectada",
    // Esqueletos
    "esqueleto-soldado": "Esqueleto Guerrero",
    "esqueleto-arquero": "Esqueleto Arquero",
    "esqueleto-armadurado": "Caballero Calavera",
    // Slimes
    "slime-bebe-verde": "Slime Bebé Verde",
    "slime-bebe-azul": "Slime Bebé Azul",
    "slime-bebe-rojo": "Slime Bebé Carmesí",
    "slime-bebe-dorado": "Slime Bebé Áureo",
    "slime-verde": "Slime Ácido",
    "slime-azul": "Slime Glacial",
    "slime-rojo": "Slime de Fuego",
    "slime-dorado": "Slime Dorado",
    // Serpientes
    "serpiente-cascabel": "Serpiente de Cascabel",
    "serpiente-esmeralda": "Víbora Esmeralda",
    "serpiente-coral": "Cobra Venenosa",
    // Zombis
    "zombi-podrido": "Zombi Descompuesto",
    "zombi-infectado": "Caminante Infectado",
    "zombi-voraz": "Zombi Feroz",
    // Especiales
    "vagoneta-poseida": "Vagoneta Encantada",
    "espada-viviente": "Espada Maldita",
    // Jefes
    "reina-arana": "Reina Araña",
    "sapo-gigante-rey": "Rey Sapo del Pantano",
    "golem-colosal": "Golem Colosal de Piedra",
    "escorpion-emperador": "Emperador Escorpión",
    "lobo-alfa-ancestral": "Lobo Alfa del Invierno",
    "dragon-supremo": "Dragón Supremo de Fuego",
    "archimago-oscuro": "Archimago Sombrío",
    "lord-vampiro": "Señor de la Sangre Vampiro",
    "demonio-ancestral": "Señor Demonio del Abismo",
    "rey-bestia-leon": "León Rey de las Bestias",
    "patriarca-zombi": "Patriarca Zombi Resucitado",
    "troll-titánico": "Troll Titánico de las Nieves",
    "senor-tengu": "Gran Señor Tengu",
    "gran-serpiente-antigua": "Basilisco Antiguo de Fuego",
    "kraken-abisal": "Kraken Abisal de las Mareas"
  };

  /* ---------- Zonas (BALANCE v13 - Progresión Proporcional) ---------- */
  const ZONAS = (() => {
    const z = [];
    REGIONES.forEach((reg, ri) => {
      for (let i = 1; i <= 10; i++) {
        const idx = ri * 10 + i, esJefe = i === 10, esMini = i === 5, esElite = i >= 6 && i <= 9;
        // Curva lineal suave y progresiva adecuada al jugador
        const hpBase = 50 + idx * 16;
        const atkBase = 8 + idx * 2.2;
        const hpJefe = esJefe ? Math.round(idx * 35 + 80) : 0;
        const atkJefe = esJefe ? Math.round(idx * 1.5 + 6) : 0;
        const hpMini = esMini ? Math.round(idx * 18 + 35) : 0;
        const atkMini = esMini ? Math.round(idx * 0.9 + 3) : 0;
        z.push({
          id: `${reg.id}-${i}`,
          nombre: esJefe ? reg.jefeNombre : `${reg.nombre} · ${i}`,
          desc: esJefe ? "⚔️ JEFE DE REGIÓN" : esMini ? "★ Mini-jefe" : reg.nombre,
          icono: esJefe ? reg.jefeIcono : reg.icono, nivel: idx,
          enemigos: esJefe ? [reg.jefe] : esMini ? [...reg.elite.slice(0, 2), reg.base[0]] : esElite ? reg.elite : reg.base,
          hp: Math.round(hpBase + hpJefe + hpMini),
          atk: Math.round(atkBase + atkJefe + atkMini),
          xp: Math.round(15 + idx * 12 + (esJefe ? idx * 25 : esMini ? idx * 10 : 0)),
          monedas: Math.round(6 + idx * 2.2 + (esJefe ? 40 : esMini ? 15 : 0)),
          jefe: esJefe, miniJefe: esMini, region: reg.id, regionNombre: reg.nombre, orden: idx
        });
      }
    });
    return z;
  })();

  const GRUPOS = REGIONES.map((reg, i) => ({
    id: i, nombre: reg.nombre, icono: reg.icono, sprite: SPR_REGION[reg.id] || reg.sprite,
    jefe: reg.jefeNombre, jefeIcono: reg.jefeIcono, bioma: reg.bioma,
    zonas: ZONAS.filter(z => Math.floor((z.orden - 1) / 10) === i),
    nivelMin: i * 10 + 1, nivelMax: (i + 1) * 10
  }));

  const KEY = () => `sa_rpg_${getUserId()}`;
  const def = () => ({ nivel: 1, xp: 0, hp: 120, enemigosDerrotados: 0, jefesDerrotados: [], zonasConquistadas: [], zonaActual: null, statsBase: { atk: 14, def: 5 } });
  const cargar = () => { try { const r = localStorage.getItem(KEY()); return r ? { ...def(), ...JSON.parse(r) } : def(); } catch { return def(); } };
  const guardar = s => { try { localStorage.setItem(KEY(), JSON.stringify(s)); } catch { } };

  const STATS_DEF = { atkBonus: 0, defBonus: 0, hpBonus: 0, critBonus: 0, esqBonus: 0, velBonus: 0, manaBonus: 0, lifestealBonus: 0, thornsBonus: 0, regenBonus: 0, xpBonus: 0, oroBonus: 0, suerteBonus: 0, fuegoBonus: 0, hieloBonus: 0, rayoBonus: 0, venenoBonus: 0 };
  const statsLoot = () => { try { const r = localStorage.getItem(`sa_rpg_stats_${getUserId()}`); return r ? { ...STATS_DEF, ...JSON.parse(r) } : { ...STATS_DEF }; } catch { return { ...STATS_DEF }; } };
  const bonus = () => { try { return window._getBonusActivos?.() || []; } catch { return []; } };
  const bonusTipo = t => bonus().filter(x => x.tipo === t).reduce((s, x) => s + (x.val || 0), 0);
  const tieneBonus = t => bonus().some(x => x.tipo === t);

  let state = cargar();
  if (!Array.isArray(state.zonasConquistadas)) state.zonasConquistadas = [];

  // Desbloqueo estricto secuencial:
  // 1) En la primera región, la zona 1 siempre está abierta.
  // 2) Dentro de cualquier región, una zona requiere haber superado la zona inmediatamente anterior.
  // 3) Para acceder a una nueva región (su zona 1), requiere haber completado las 10 zonas de la región anterior.
  window._rpgZonaDesbloqueada = function (zid) {
    const z = ZONAS.find(x => x.id === zid);
    if (!z) return false;
    if (z.orden === 1) return true;
    const conq = state.zonasConquistadas || [];
    const numEnRegion = ((z.orden - 1) % 10) + 1;
    if (numEnRegion > 1) {
      const prev = ZONAS.find(x => x.orden === z.orden - 1);
      return prev ? conq.includes(prev.id) : false;
    } else {
      const ri = Math.floor((z.orden - 1) / 10);
      const grupoAnterior = GRUPOS[ri - 1];
      if (!grupoAnterior) return true;
      return grupoAnterior.zonas.every(pz => conq.includes(pz.id));
    }
  };

  const hpMax = () => 100 + state.nivel * 25 + (statsLoot().hpBonus || 0) + bonusTipo("hp_max");
  const atkTotal = () => state.statsBase.atk + state.nivel * 4 + (statsLoot().atkBonus || 0) + bonusTipo("atk_fijo");
  const defTotal = () => state.statsBase.def + state.nivel * 2.5 + (statsLoot().defBonus || 0) + bonusTipo("def_fijo");
  const critTotal = () => 0.15 + ((statsLoot().critBonus || 0) / 100);
  const esqTotal = () => ((statsLoot().esqBonus || 0) / 100);
  const regenTotal = () => (statsLoot().regenBonus || 0);
  const lifestealTotal = () => ((statsLoot().lifestealBonus || 0) / 100);
  const thornsTotal = () => (statsLoot().thornsBonus || 0);
  const xpTotal = () => 1 + ((statsLoot().xpBonus || 0) / 100);
  const oroTotal = () => 1 + ((statsLoot().oroBonus || 0) / 100);
  const xpParaSubir = () => Math.round(state.nivel * 160 + Math.pow(state.nivel, 1.8) * 35);

  let enemigo = null, turnoJugador = true, overlayObjetos = false;
  let buffsHeroe = [], buffsEnemigo = [];

  function inyectarSeccion() {
    if ($("rpg")) return;
    const sec = document.createElement("section");
    sec.id = "rpg"; sec.className = "rpg-section view"; sec.dataset.view = "rpg";
    sec.innerHTML = `<div class="rpg-header"><p class="rpg-subtitle">15 regiones, 150 zonas</p></div><div id="rpg-content"></div>`;
    const f = qs(".site-footer");
    f ? f.parentNode.insertBefore(sec, f) : document.body.appendChild(sec);
  }
  function inyectarNav() {
    if (qs('[data-view-link="rpg"]')) return;
    const nav = qs(".nav-links"); if (!nav) return;
    const a = document.createElement("a");
    a.href = "#rpg"; a.className = "nav-link"; a.dataset.viewLink = "rpg";
    a.innerHTML = `<span class="ui-icon nav-link-icon" data-icono="espada"></span><span class="nav-link-text">Aventura</span>`;
    nav.appendChild(a);
  }

  function render() {
    inyectarNav(); inyectarSeccion();
    const c = $("rpg-content"); if (!c) return;
    if (enemigo) { c.classList.add("rpg-en-batalla"); renderBatalla(c); }
    else { c.classList.remove("rpg-en-batalla"); renderPantalla(c); }
  }

  function renderPantalla(c) {
    const tab = c.dataset.tabActiva || "zonas";
    c.innerHTML = `
      <div class="rpg-tabs" role="tablist">
        <button type="button" class="rpg-tab ${tab === "zonas" ? "active" : ""}" data-rpg-tab="zonas"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/pocion.png" alt=""></span><span class="rpg-tab-text">Zonas</span></button>
        <button type="button" class="rpg-tab ${tab === "objetos" ? "active" : ""}" data-rpg-tab="objetos"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/hamburguesa.png" alt=""></span><span class="rpg-tab-text">Objetos</span></button>
        <button type="button" class="rpg-tab ${tab === "cofres" ? "active" : ""}" data-rpg-tab="cofres"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/rpg/items/cofre-madera.png?v=2" alt=""></span><span class="rpg-tab-text">Cofres</span></button>
        <button type="button" class="rpg-tab" data-rpg-tab="roguelike"><span class="rpg-tab-icon" aria-hidden="true"><img src="img/items%20de%20aventura/dado.png" alt=""></span><span class="rpg-tab-text">Roguelike</span></button>
      </div>
      <div class="rpg-panel ${tab === "zonas" ? "active" : ""}" data-rpg-panel="zonas">${htmlMapa()}</div>
      <div class="rpg-panel ${tab === "objetos" ? "active" : ""}" data-rpg-panel="objetos"></div>
      <div class="rpg-panel ${tab === "cofres" ? "active" : ""}" data-rpg-panel="cofres"></div>`;

    qsa(".rpg-tab", c).forEach(t => t.addEventListener("click", () => {
      const target = t.dataset.rpgTab;
      if (target === "roguelike") {
        qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
        qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", false));
        window.RpgRoguelike?.abrir?.();
        return;
      }
      c.dataset.tabActiva = target;
      qsa(".rpg-tab", c).forEach(x => x.classList.toggle("active", x === t));
      qsa(".rpg-panel", c).forEach(p => p.classList.toggle("active", p.dataset.rpgPanel === target));
      window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail: { tab: target } }));
    }));

    window.hidratarIconos?.(c);
    setTimeout(() => window.dispatchEvent(new CustomEvent("sunadventures:rpg-tab", { detail: { tab } })), 0);
  }

  function htmlMapa() {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const xpPct = clamp(state.xp / xpParaSubir() * 100);
    const st = statsLoot();
    const bonusTxt = (st.atkBonus + st.defBonus + st.hpBonus) > 0 ? `<span style="font-size:.68rem;opacity:.75;margin-left:.4rem;">+${st.atkBonus}ATK +${st.defBonus}DEF +${st.hpBonus}HP</span>` : "";
    return `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span>${bonusTxt}</div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          <div class="rpg-barra-label"><span>XP</span><span>${state.xp} / ${xpParaSubir()}</span></div>
          <div class="rpg-barra xp"><span style="width:${xpPct}%"></span></div>
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>
      <div class="rpg-grupos-grid">
        ${GRUPOS.map(g => {
      const completadas = g.zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
      const primeraZona = g.zonas[0];
      const desbloqueado = window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(primeraZona.id) : (state.nivel >= g.nivelMin - 2 || state.enemigosDerrotados >= g.nivelMin * 6);
      const sImg = g.sprite ? spriteHtml(g.sprite, "rpg-grupo-sprite-img", g.nombre) : "";
      return `<button type="button" class="rpg-grupo-card ${desbloqueado ? "" : "bloqueada"}" data-grupo="${g.id}" style="--bioma-img:url('${g.bioma.imagen}');--bioma-acento:${g.bioma.acento}" ${desbloqueado ? "" : "disabled"}>
            <span class="rpg-grupo-fondo" aria-hidden="true"></span>
            <div class="rpg-grupo-icono">${sImg || g.icono || ""}</div>
            <div class="rpg-grupo-nombre">${g.nombre}</div>
            <div class="rpg-grupo-ambiente">${g.bioma.ambiente}</div>
            <div class="rpg-grupo-rango">Nv ${g.nivelMin}–${g.nivelMax}</div>
            <div class="rpg-grupo-progreso"><span style="width:${(completadas / 10) * 100}%"></span></div>
            <div class="rpg-grupo-badge">${g.zonas.some(z => z.jefe && state.jefesDerrotados.includes(z.id)) ? "👑" : `${completadas}/10`}</div>
          </button>`;
    }).join("")}
      </div>
      <div style="display:flex;justify-content:center;margin:1rem 0;">
        <button type="button" class="rpg-btn huir" data-rpg-accion="descansar" style="max-width:300px;padding:.8rem 1.4rem;">💤 Descansar <span id="rpg-rest-cost" style="margin-left:.4rem;opacity:.85;">—</span></button>
      </div>
      <div class="rpg-idle">
        <div class="rpg-idle-icono">${ICONO.espada || ""}</div>
        <div class="rpg-idle-titulo">Elige una región</div>
        <div class="rpg-idle-desc">Enemigos derrotados: ${state.enemigosDerrotados}</div>
      </div>`;
  }

  function abrirPopupGrupo(grupo) {
    let m = $("rpg-popup-grupo"); if (m) m.remove();
    m = document.createElement("div");
    m.id = "rpg-popup-grupo"; m.className = "rpg-popup-grupo";
    const zonas = grupo.zonas;
    const conquistadas = zonas.filter(z => state.zonasConquistadas.includes(z.id)).length;
    const desbloqueada = z => window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : state.nivel >= z.nivel - 2 || state.enemigosDerrotados >= z.nivel * 6;
    m.innerHTML = `
      <div class="rpg-popup-panel" style="--bioma-img:url('${grupo.bioma.imagen}');--bioma-acento:${grupo.bioma.acento}">
        <button class="rpg-popup-close" aria-label="Cerrar">×</button>
        <header class="rpg-popup-hero">
          <img src="${grupo.bioma.imagen}" alt="${grupo.bioma.ambiente}" class="rpg-popup-bioma">
          <div class="rpg-popup-titulo">
            <small>EXPEDICIÓN · NV ${grupo.nivelMin}–${grupo.nivelMax}</small>
            <span>${grupo.nombre}</span>
            <strong>Jefe de región: ${grupo.jefe}</strong>
            <div class="rpg-popup-progreso"><span style="width:${conquistadas * 10}%"></span></div>
            <em>${conquistadas}/10 zonas conquistadas · Primera victoria: +50% XP y monedas</em>
          </div>
        </header>
        <div class="rpg-popup-zonas" aria-label="Zonas de la región">
          ${zonas.map((z, i) => {
      const open = desbloqueada(z);
      const conquistada = state.zonasConquistadas.includes(z.id);
      const tipo = z.jefe ? "Jefe de región" : z.miniJefe ? "Mini-jefe" : z.nivel % 10 >= 6 ? "Encuentro élite" : "Encuentro";
      const cls = ["rpg-popup-dot", "rpg-popup-zone", z.jefe ? "jefe" : z.miniJefe ? "minijefe" : "", !open ? "bloqueada" : "", conquistada ? "conquistada" : ""].filter(Boolean).join(" ");
      const zSprite = z.jefe ? SPR_ENEMIGO[z.enemigos?.[0]] : z.miniJefe ? SPR_ENEMIGO[z.enemigos?.[0]] : SPR_ENEMIGO[z.enemigos?.[0]] || (open ? "espada" : null);
      const zSpriteHtml = zSprite ? spriteHtml(zSprite, "rpg-zone-sprite-thumb", z.nombre) : "";
      return `<button type="button" class="${cls}" data-zona="${z.id}" ${open ? "" : "disabled"}>
              <span class="rpg-popup-zone-number">${zSpriteHtml || String(i + 1).padStart(2, "0")}</span>
              <span class="rpg-popup-zone-copy">
                <span class="rpg-popup-zone-meta"><strong>NIVEL ${z.nivel}</strong><i>${conquistada ? "✓ CONQUISTADA" : tipo}</i></span>
                <span class="rpg-popup-zone-name">${z.nombre}</span>
                <small>${!open ? "Sigue avanzando para desbloquearla" : conquistada ? "Vuelve a explorar o sigue al próximo desafío" : "Primera victoria: recompensa extra"}</small>
              </span>
              <span class="rpg-popup-zone-arrow">${!open ? "🔒" : conquistada ? "★" : "›"}</span>
            </button>`;
    }).join("")}
        </div>
      </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add("active"));
  }

  document.addEventListener("click", e => {
    const card = e.target.closest(".rpg-grupo-card");
    if (card && !card.disabled) {
      e.preventDefault(); e.stopPropagation();
      const g = GRUPOS[Number(card.dataset.grupo)];
      if (g) abrirPopupGrupo(g);
      return;
    }
    const popup = e.target.closest("#rpg-popup-grupo");
    if (popup) {
      if (e.target === popup || e.target.classList.contains("rpg-popup-close")) {
        popup.classList.remove("active");
        setTimeout(() => popup.remove(), 250);
        return;
      }
      const dot = e.target.closest(".rpg-popup-dot");
      if (dot) {
        e.preventDefault(); e.stopPropagation();
        if (dot.disabled) { SND("derrota"); return; }
        const z = ZONAS.find(x => x.id === dot.dataset.zona);
        if (!z) return;
        const ok = window._rpgZonaDesbloqueada ? window._rpgZonaDesbloqueada(z.id) : (state.nivel >= z.nivel - 2 || state.enemigosDerrotados >= z.nivel * 6);
        if (!ok) { SND("derrota"); return; }
        popup.classList.remove("active");
        setTimeout(() => { popup.remove(); entrarZona(z.id); }, 200);
      }
    }
  }, true);

  function renderBatalla(c) {
    const m = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
    const hpPct = clamp(state.hp / hpMax() * 100);
    const spriteKey = enemigo.sprite || SPR_ENEMIGO[enemigo.id];
    let relPath = spriteKey;
    if (relPath && relPath.startsWith("img/48x48/")) relPath = relPath.replace("img/48x48/", "");
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const habs = window.RpgHabilidades?.ataquesDesbloqueados(mascotaId, state.nivel) || [];
    const esFase2 = enemigo.phase === 2;
    const habsItems = window.RpgItems?.getHabilidadesActivas?.() || [];

    // Renderizado del enemigo o horda
    let eContent = "";
    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      const mobsHtml = enemigo.horda.map((mob, i) => {
        const vivo = mob.hp > 0;
        const mobSpr = renderMobAnimado(relPath, 42, `rpg-horda-anim ${vivo ? "" : "muerto"}`);
        return `<div class="rpg-horda-item ${vivo ? "" : "caido"}" data-horda-idx="${i}" title="${enemigo.nombre} #${i + 1} (${mob.hp}/${mob.hpMax} HP)">
          ${mobSpr}
          <div class="rpg-horda-item-hp"><span style="width:${Math.max(0, (mob.hp / mob.hpMax) * 100)}%"></span></div>
        </div>`;
      }).join("");
      eContent = `<div class="rpg-horda-container">
        <div class="rpg-horda-grid">${mobsHtml}</div>
        <div class="rpg-horda-contador">Horda: ${enemigo.horda.filter(x => x.hp > 0).length}/9 vivos</div>
      </div>`;
    } else {
      const eSpriteEl = relPath ? renderMobAnimado(relPath, 92, "rpg-enemy-sprite-anim") : "";
      const eIcon = ICONO[enemigo.iconoKey] || enemigo.icono || (enemigo.jefe ? ICONO.corona : ICONO.espada) || ICONO.estrella || "";
      eContent = eSpriteEl || eIcon;
    }

    c.innerHTML = `
      <div class="rpg-hud">
        <div class="rpg-hero-avatar"><img src="${m.imagen}" alt="${m.nombre}" style="width:58px;height:58px;max-width:58px;max-height:58px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'"></div>
        <div class="rpg-hero-info">
          <div class="rpg-hero-name">${m.nombre} <span class="rpg-hero-lvl">Nv ${state.nivel}</span></div>
          <div class="rpg-barra-label"><span>HP</span><span>${Math.round(state.hp)} / ${hpMax()}</span></div>
          <div class="rpg-barra hp"><span style="width:${hpPct}%"></span></div>
          ${enemigo.dot ? `<div class="rpg-barra-label" style="color:#ff9a3d"><span>🔥 Quemadura</span><span>${enemigo.dot} dmg/turno</span></div>` : ""}
          ${state.sangrado > 0 ? `<div class="rpg-barra-label" style="color:#ff5470"><span>🩸 Sangrado</span><span>${state.sangrado} dmg/turno</span></div>` : ""}
        </div>
        <div class="rpg-coins">${ICONO.moneda || ""} ${getMonedas()}</div>
      </div>
      <div class="rpg-batalla ${esFase2 ? 'rpg-enraged' : ''}" id="rpg-batalla">
        <div class="rpg-batalla-top">
          <div class="rpg-fighter" id="fighter-heroe">
            <div class="rpg-fighter-sprite hero-pet" id="sprite-heroe">
              <img src="${m.imagen}" alt="" class="rpg-pet-avatar-combat" style="width:90px;height:90px;max-width:90px;max-height:90px;object-fit:contain;display:block;image-rendering:pixelated;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">
            </div>
            <div class="rpg-fighter-nombre">${m.nombre}</div>
            <div class="rpg-fighter-hp">${Math.round(state.hp)} HP</div>
            <div class="rpg-buffs" id="buffs-heroe"></div>
          </div>
          <div class="rpg-vs">VS</div>
          <div class="rpg-fighter" id="fighter-enemigo">
            <div class="rpg-fighter-sprite enemigo ${enemigo.esHorda ? 'es-horda' : ''} ${esFase2 ? 'fase2' : ''}" id="sprite-enemigo">${eContent}</div>
            <div class="rpg-fighter-nombre">${enemigo.nombre} ${enemigo.jefe ? (esFase2 ? '🔥 FASE 2' : '👑') : enemigo.esHorda ? '👥 HORDA (x9)' : ''}</div>
            <div class="rpg-fighter-hp" id="hp-enemigo">${Math.round(enemigo.hp)} HP${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}</div>
            <div class="rpg-buffs" id="buffs-enemigo"></div>
          </div>
        </div>
        <div class="rpg-log" id="rpg-log"><div class="rpg-log-item info">¡${enemigo.esHorda ? '¡Una horda de 9 ' + enemigo.nombre + ' te rodea!' : '¡Un ' + enemigo.nombre + ' aparece!'}</div></div>
        <div class="rpg-habs-grid" id="rpg-habs-grid">
          ${habs.length ? habs.map(h => `<button type="button" class="rpg-hab rpg-hab-${h.tipo}" data-hab="${h.id}" title="${h.desc}"><span class="rpg-hab-nombre">${h.nombre}</span><span class="rpg-hab-lv">Nv ${h.lv}</span></button>`).join("") : `<button type="button" class="rpg-hab rpg-hab-daño" data-hab="ataque-basico" title="Ataque básico"><span class="rpg-hab-nombre">Ataque</span><span class="rpg-hab-lv">Básico</span></button>`}
        </div>
        <div class="rpg-acciones" id="rpg-acciones">
          <button type="button" class="rpg-btn objeto" id="btn-objeto">🧪 Objeto</button>
          ${habsItems.length ? `<button type="button" class="rpg-btn arma" id="btn-arma-habs">✨ Habilidad de arma <span class="rpg-btn-badge">${habsItems.length}</span></button>` : ""}
          <button type="button" class="rpg-btn huir" id="btn-huir">🏃 Huir</button>
        </div>
        <div id="rpg-arma-wrap"></div>
        <div id="rpg-objetos-wrap"></div>
      </div>`;

    window.hidratarIconos?.(c);

    qsa(".rpg-hab", c).forEach(b => b.addEventListener("click", () => usarHabilidad(b.dataset.hab)));
    $("#btn-objeto")?.addEventListener("click", toggleObjetos);
    $("#btn-arma-habs")?.addEventListener("click", toggleHabilidadesArma);
    $("#btn-huir")?.addEventListener("click", huir);
    renderBuffs();
  }

  function animarAtaqueHeroe() {
    const s = $("sprite-heroe");
    if (!s) return;
    s.classList.add("atacando");
    setTimeout(() => s.classList.remove("atacando"), 400);
  }

  function renderBuffs() {
    const h = $("buffs-heroe"), e = $("buffs-enemigo");
    const chip = (t, v, l) => `<span class="rpg-buff-chip ${t}">${l || t.toUpperCase()} ${v > 0 ? "+" : ""}${v}</span>`;
    if (h) h.innerHTML = buffsHeroe.map(b => chip(b.tipo, b.val, b.label)).join("");
    if (e) e.innerHTML = buffsEnemigo.map(b => chip(b.tipo, b.val, b.label)).join("");
  }
  const buffVal = t => buffsHeroe.filter(b => b.tipo === t).reduce((s, b) => s + b.val, 0);
  function tickBuffs() {
    buffsHeroe = buffsHeroe.map(b => ({ ...b, turnos: b.turnos - 1 })).filter(b => b.turnos > 0);
    buffsEnemigo = buffsEnemigo.map(b => ({ ...b, turnos: b.turnos - 1 })).filter(b => b.turnos > 0);
    renderBuffs();
  }

  const ESPECIALES = {
    comun: ['heal', 'buff', 'debuff', 'poison'],
    elite: ['multihit', 'drain', 'shield', 'curse'],
    jefe: ['firebreath', 'summon', 'apocalypse', 'curse']
  };

  function entrarZona(id) {
    const z = ZONAS.find(x => x.id === id); if (!z) return;
    state.zonaActual = z.id;
    state._oneshotUsado = false;
    state._segundaOportunidadUsada = false;
    state._inmuneUsado = false;
    guardar(state);

    const eId = z.enemigos[rnd(0, z.enemigos.length - 1)];
    const v = rnd(-15, 15) / 100;
    const hp = Math.max(30, Math.round(z.hp * (1 + v)));
    const tier = z.jefe ? 'jefe' : z.miniJefe ? 'elite' : 'comun';
    const esp = ESPECIALES[tier][rnd(0, ESPECIALES[tier].length - 1)];
    const spriteName = SPR_ENEMIGO[eId] || (z.jefe ? 'corona' : z.miniJefe ? 'calavera' : 'espada');

    // Sistema de Hordas: si NO es jefe ni minijefe, aparecen 9 enemigos de la misma especie
    const esHorda = !z.jefe && !z.miniJefe;
    let hordaArr = null;
    if (esHorda) {
      const hpIndividual = Math.max(8, Math.round(hp / 9));
      hordaArr = Array.from({ length: 9 }, (_, idx) => ({
        id: idx,
        hp: hpIndividual,
        hpMax: hpIndividual
      }));
    }

    enemigo = {
      id: eId, iconoKey: eId, icono: z.icono, sprite: spriteName, nombre: NOMBRES[eId] || eId,
      hpMax: esHorda ? (hordaArr.reduce((s, x) => s + x.hpMax, 0)) : hp,
      hp: esHorda ? (hordaArr.reduce((s, x) => s + x.hp, 0)) : hp,
      atk: Math.round(z.atk * (1 + v)), xp: z.xp, monedas: z.monedas,
      jefe: !!z.jefe, miniJefe: !!z.miniJefe, esHorda, horda: hordaArr,
      dot: 0, dotDur: 0, shield: 0, phase: 1, tier,
      special: esp, specialCD: z.jefe ? 2 : z.miniJefe ? 3 : 4, specialTimer: z.jefe ? 2 : z.miniJefe ? 3 : 4
    };
    turnoJugador = true; overlayObjetos = false;
    buffsHeroe = []; buffsEnemigo = [];
    SND("blip"); render();
  }

  function log(txt, tipo = "info") {
    const l = $("rpg-log"); if (!l) return;
    const d = document.createElement("div");
    d.className = "rpg-log-item " + tipo; d.textContent = txt;
    l.appendChild(d); l.scrollTop = l.scrollHeight;
  }
  function floatDmg(sel, txt, tipo = "daño") {
    const el = qs(sel); if (!el) return;
    const f = document.createElement("span");
    f.className = "rpg-float " + tipo; f.textContent = txt;
    el.style.position = "relative"; f.style.left = "50%"; f.style.top = "20%";
    el.appendChild(f); setTimeout(() => f.remove(), 1000);
  }
  function deshab(d) {
    qsa(".rpg-hab, [data-arma-hab]", document).forEach(b => b.disabled = d);
    ["#btn-objeto", "#btn-arma-habs", "#btn-huir"].forEach(s => { const b = qs(s); if (b) b.disabled = d; });
  }
  function actualizarHPs() {
    const he = $("hp-enemigo");
    if (he && enemigo) {
      if (enemigo.esHorda && enemigo.horda) {
        const vivos = enemigo.horda.filter(x => x.hp > 0).length;
        he.textContent = `${Math.max(0, enemigo.hp)} HP (${vivos}/9 vivos)${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}`;
        const countBadge = qs(".rpg-horda-contador");
        if (countBadge) countBadge.textContent = `Horda: ${vivos}/9 vivos`;
      } else {
        he.textContent = `${Math.max(0, enemigo.hp)} HP${enemigo.shield > 0 ? ` · 🛡️${enemigo.shield}` : ''}`;
      }
    }
    const hh = qs("#fighter-heroe .rpg-fighter-hp"); if (hh) hh.textContent = `${Math.round(state.hp)} HP`;
    const b = qs(".rpg-barra.hp > span"); if (b) b.style.width = clamp(state.hp / hpMax() * 100) + "%";
  }

  function aplicarDmgEnemigo(dmg) {
    if (!enemigo) return;
    if (enemigo.shield > 0) {
      const abs = Math.min(dmg, enemigo.shield);
      enemigo.shield -= abs; dmg -= abs;
    }

    if (enemigo.esHorda && Array.isArray(enemigo.horda)) {
      const vivos = enemigo.horda.filter(m => m.hp > 0);
      if (vivos.length > 0) {
        // El daño de un ataque se divide entre la cantidad de enemigos vivos en el combate
        const dmgPorMob = Math.max(1, Math.floor(dmg / vivos.length));
        vivos.forEach(m => {
          m.hp = Math.max(0, m.hp - dmgPorMob);
          const el = qs(`.rpg-horda-item[data-horda-idx="${m.id}"]`);
          if (el) {
            const bar = el.querySelector(".rpg-horda-item-hp > span");
            if (bar) bar.style.width = `${Math.max(0, (m.hp / m.hpMax) * 100)}%`;
            if (m.hp <= 0) {
              el.classList.add("caido");
              el.querySelector(".rpg-horda-anim")?.classList.add("muerto");
            }
          }
        });
        enemigo.hp = enemigo.horda.reduce((s, m) => s + m.hp, 0);
      } else {
        enemigo.hp = 0;
      }
    } else {
      enemigo.hp = Math.max(0, enemigo.hp - dmg);
    }

    // Animación visual de recibir golpe / herido
    const spr = qs("#sprite-enemigo");
    if (spr) {
      spr.classList.add("golpeado");
      const animMob = spr.querySelector(".rpg-mob-animado");
      if (animMob) animMob.classList.add("herido");
      setTimeout(() => {
        spr.classList.remove("golpeado");
        if (animMob) animMob.classList.remove("herido");
      }, 350);
    }
  }
  function chequearFaseJefe() {
    if (enemigo.jefe && enemigo.phase === 1 && enemigo.hp / enemigo.hpMax <= 0.5) {
      enemigo.phase = 2;
      enemigo.atk = Math.round(enemigo.atk * 1.25);
      enemigo.shield = Math.round(enemigo.hpMax * 0.08);
      log('🔥 ¡EL JEFE SE ENFURECE! +25% ATK', 'critico');
      SND('growl');
      $('rpg-batalla')?.classList.add('rpg-enraged');
    }
  }

  function danoEscaladoJefe(mult) {
    const atkEnemigo = enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s, b) => s + b.val, 0);
    const defHeroe = defTotal() + buffVal("def");
    const escalaHP = Math.min(1.4, 1 + (hpMax() - 300) / 2000);
    return Math.max(1, Math.round((atkEnemigo * mult * escalaHP) - defHeroe + rnd(-3, 3)));
  }

  function comprobarPasivas(evento, contexto = {}) {
    const habs = window.RpgItems?.getHabilidadesActivas?.() || [];
    let activada = false;

    habs.forEach(function (hab) {
      const nombre = (hab.nombre || "").toLowerCase();
      const desc = (hab.desc || "").toLowerCase();
      const texto = nombre + " " + desc;

      if (evento === "recibir-muerte" && texto.includes("oneshot")) {
        if (state._oneshotUsado) return;
        state._oneshotUsado = true;
        activada = true;
        const hpRevivir = Math.round(hpMax() * 0.5);
        state.hp = hpRevivir;
        log(`💫 ¡ONESHOT activado! Revives con ${hpRevivir} HP.`, "critico");
        floatDmg("#sprite-heroe", "¡ONESHOT!", "curar");
        FX({ tipo: "heal", target: "hero", valor: hpRevivir, fxKey: "heal" });
        SND("victoria");
      }

      if (evento === "recibir-muerte" && (texto.includes("segunda oportunidad") || texto.includes("alma errante") || texto.includes("renace"))) {
        if (state._segundaOportunidadUsada) return;
        state._segundaOportunidadUsada = true;
        activada = true;
        state.hp = Math.round(hpMax() * 0.3);
        log(`👻 ¡${hab.nombre} activado! Revives con ${state.hp} HP.`, "critico");
        floatDmg("#sprite-heroe", "¡RENACES!", "curar");
        SND("victoria");
      }

      if (evento === "recibir-muerte" && (texto.includes("inmune") || texto.includes("invulnerable") || texto.includes("bloqueo total"))) {
        if (state._inmuneUsado) return;
        state._inmuneUsado = true;
        activada = true;
        state.hp = Math.round(hpMax() * 0.5);
        log(`🛡️ ¡${hab.nombre} activado! Bloqueas el daño letal.`, "critico");
        floatDmg("#sprite-heroe", "¡INMUNE!", "curar");
        SND("victoria");
      }

      if (evento === "recibir-dano" && (texto.includes("refleja") || texto.includes("devuelve daño") || texto.includes("espejo"))) {
        const dmgRecibido = contexto.dano || 0;
        const reflejado = Math.round(dmgRecibido * 0.3);
        if (reflejado > 0 && enemigo) {
          enemigo.hp = Math.max(0, enemigo.hp - reflejado);
          log(`🪞 ${hab.nombre}: reflejas ${reflejado} daño.`, "daño");
          floatDmg("#sprite-enemigo", "-" + reflejado, "daño");
          activada = true;
        }
      }

      if (evento === "turno-propio" && (texto.includes("bendición de las inflorescencias") || texto.includes("bendicion de las inflorescencias"))) {
        const pctMatch = desc.match(/(\d+)\s*%/);
        const pct = pctMatch ? parseInt(pctMatch[1]) : 5;
        const curaPorTurno = Math.round(hpMax() * (pct / 100));
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        log(`🌸 ${hab.nombre}: +${curaPorTurno} HP (${pct}% de vida máx).`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("conocimiento absoluto")) {
        const curaMatch = desc.match(/(\d+)\s*(?:de\s+)?vida/);
        const curaPorTurno = curaMatch ? parseInt(curaMatch[1]) : 500;
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        log(`📚 ${hab.nombre}: +${curaPorTurno} HP por turno.`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && (texto.includes("el mago") || (texto.includes("mago") && texto.includes("esquiva")))) {
        buffsHeroe.push({ tipo: "def", val: -5, turnos: 999, label: "🧙 -5 DEF" });
        buffsHeroe.push({ tipo: "esq", val: 5, turnos: 999, label: "🧙 +5% ESQ" });
        buffsHeroe.push({ tipo: "crit", val: 10, turnos: 999, label: "🧙 +10% CRIT" });
        log(`🧙 ${hab.nombre}: -5 DEF, +10% crítico, +5% esquiva.`, "info");
        renderBuffs();
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("incertidumbre")) {
        const defMatch = desc.match(/defensa\s+en\s+(\d+)/);
        const defVal = defMatch ? parseInt(defMatch[1]) : 10;
        buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: "🎲 +DEF" });
        log(`🎲 ${hab.nombre}: +${defVal} DEF acumulativo.`, "info");
        renderBuffs();
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("cura") && texto.includes("turno")) {
        const curaPorTurno = Math.round(hpMax() * 0.05);
        state.hp = Math.min(hpMax(), state.hp + curaPorTurno);
        log(`💚 ${hab.nombre}: +${curaPorTurno} HP por turno.`, "curar");
        activada = true;
      }

      if (evento === "turno-propio" && texto.includes("envenena") && texto.includes("turno")) {
        if (enemigo) {
          enemigo.dot = Math.max(enemigo.dot, Math.round(enemigo.hpMax * 0.05));
          enemigo.dotDur = Math.max(enemigo.dotDur, 2);
          activada = true;
        }
      }
    });

    return activada;
  }

  function usarHabilidad(habId) {
    if (!enemigo || !turnoJugador || enemigo.terminado) return;

    if (habId === "ataque-basico") {
      turnoJugador = false; deshab(true);
      animarAtaqueHeroe();
      const dmg = Math.max(1, Math.round(atkTotal() * 0.9));
      aplicarDmgEnemigo(dmg);
      log(`Atacas por ${dmg} daño.`, "daño");
      floatDmg("#sprite-enemigo", "-" + dmg, "daño");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "slash" });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 800);
      return;
    }

    const hab = window.RpgHabilidades?.ataquePorId(habId);
    if (!hab) return;
    turnoJugador = false; deshab(true);
    animarAtaqueHeroe();
    const mascotaId = localStorage.getItem("mascota_actual") || "mapache";
    const pasiva = window.RpgHabilidades?.getPasiva(mascotaId) || {};
    const fxKey = FX_KEY(habId);

    if (hab.tipo === "boost" && hab.buff) {
      Object.entries(hab.buff).forEach(([k, v]) => {
        if (["atk", "def", "crit", "esq"].includes(k))
          buffsHeroe.push({ tipo: k, val: v, turnos: hab.buff.dur || 3, label: k.toUpperCase() });
      });
      log(`✨ ${hab.nombre}: buff aplicado.`, "curar");
      FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
      renderBuffs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "soporte") {
      const curado = Math.round(hpMax() * (hab.heal || 0.3));
      const antes = state.hp;
      state.hp = clamp(state.hp + curado, 0, hpMax());
      guardar(state);
      if (hab.limpia) { enemigo.dot = 0; log("🧼 Limpias efectos negativos.", "curar"); }
      if (hab.buff) {
        Object.entries(hab.buff).forEach(([k, v]) => {
          if (["atk", "def"].includes(k)) buffsHeroe.push({ tipo: k, val: v, turnos: hab.buff.dur || 3, label: k.toUpperCase() });
        });
        renderBuffs();
      }
      log(`💚 ${hab.nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
      FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
      actualizarHPs();
      setTimeout(turnoEnemigo, 800);
      return;
    }

    if (hab.tipo === "daño_indirecto") {
      enemigo.dot = Math.round(enemigo.hpMax * (hab.dmgInd || 0.1));
      enemigo.dotDur = hab.dur || 3;
      if (hab.debuff) {
        const k = hab.debuff.atk ? "atk" : "def";
        const v = -(hab.debuff.atk || hab.debuff.def);
        buffsEnemigo.push({ tipo: k, val: v, turnos: hab.debuff.dur || 3, label: "-" + k.toUpperCase() });
        renderBuffs();
      }
      log(`☠️ ${hab.nombre}: ${enemigo.dot} dmg por ${enemigo.dotDur} turnos.`, "critico");
      const dmg0 = Math.max(1, Math.round(atkTotal() * 0.5));
      aplicarDmgEnemigo(dmg0);
      floatDmg("#sprite-enemigo", "-" + dmg0, "daño");
      FX({ tipo: "attack", target: "enemy", valor: dmg0, fxKey: fxKey });
      actualizarHPs();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 900);
      return;
    }

    const hits = hab.hits || 1;
    let totalDmg = 0;
    const critBase = critTotal() + (bonusTipo("crit_pct") / 100) + (buffVal("crit") / 100);
    const atkBuffed = atkTotal() + buffVal("atk");
    let algunCrit = false;
    for (let i = 0; i < hits; i++) {
      const crit = Math.random() < critBase;
      if (crit) algunCrit = true;
      let dmg = Math.round((atkBuffed * (hab.mult || 1)) - rnd(1, 4));
      if (crit) dmg = Math.round(dmg * 1.8);
      if (enemigo.jefe && tieneBonus("crit_jefe")) dmg = Math.round(dmg * (1 + bonusTipo("crit_jefe") / 100));
      dmg = Math.max(1, dmg);
      aplicarDmgEnemigo(dmg);
      totalDmg += dmg;
      log((i === hits - 1 ? (crit ? "¡CRÍTICO! " : "") : "") + `${hab.nombre}${hits > 1 ? ` [${i + 1}/${hits}]` : ""}: ${dmg} daño.`, crit ? "critico" : "daño");
      if (enemigo.hp <= 0) break;
    }
    floatDmg("#sprite-enemigo", "-" + totalDmg, "daño");
    FX({ tipo: "attack", target: "enemy", valor: totalDmg, fxKey: fxKey, critico: algunCrit });
    SND("atrapado");

    if (hab.drain) {
      const robado = Math.round(totalDmg * hab.drain);
      state.hp = clamp(state.hp + robado, 0, hpMax());
      log(`🩸 Drenas ${robado} HP.`, "curar");
      guardar(state);
    }
    if (hab.robo) { setMonedas(getMonedas() + hab.robo); log(`💰 Robas ${hab.robo} monedas.`, "info"); }

    actualizarHPs();
    qs("#sprite-enemigo")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-enemigo")?.classList.remove("golpeado"), 350);
    chequearFaseJefe();
    if (enemigo.hp <= 0) return setTimeout(victoria, 500);

    if (pasiva.tipo === "doble_ataque" && Math.random() * 100 < pasiva.val) {
      log("🐰 ¡Brinco extra! Atacas otra vez.", "critico");
      setTimeout(() => {
        const seg = Math.max(1, Math.round(atkBuffed * 0.7));
        aplicarDmgEnemigo(seg);
        floatDmg("#sprite-enemigo", "-" + seg, "daño");
        FX({ tipo: "attack", target: "enemy", valor: seg, fxKey: "slash" });
        log(`Brinquito extra: ${seg} daño.`, "daño");
        actualizarHPs();
        chequearFaseJefe();
        if (enemigo.hp <= 0) return setTimeout(victoria, 400);
        setTimeout(turnoEnemigo, 800);
      }, 500);
      return;
    }
    setTimeout(turnoEnemigo, 800);
  }

  function usarHabilidadDeItem(hab) {
    if (!enemigo || !turnoJugador || enemigo.terminado) return;
    turnoJugador = false;
    deshab(true);
    animarAtaqueHeroe();

    const nombre = (hab.nombre || "").toLowerCase();
    const desc = (hab.desc || "").toLowerCase();
    const tipo = hab.tipo || "daño";
    const val = Number(hab.val) || 0;

    const efecto = detectarEfectoEspecifico(nombre, desc, val, tipo);
    if (efecto) {
      efecto.ejecutar();
      actualizarHPs();
      chequearFaseJefe();
      if (enemigo.hp <= 0) return setTimeout(victoria, 500);
      setTimeout(turnoEnemigo, 900);
      return;
    }

    if (tipo === "daño" || tipo === "ultimate") {
      let dmg;
      if (val >= 50) {
        dmg = Math.round(val);
        log(`✨ ${hab.nombre}: ${dmg} daño fijo.`, "critico");
      } else {
        dmg = Math.max(1, Math.round(atkTotal() * Math.max(val, 1)));
        log(`✨ ${hab.nombre}: ${dmg} daño.`, "critico");
      }
      aplicarDmgEnemigo(dmg);
      floatDmg("#sprite-enemigo", "-" + dmg, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
      SND("victoria");
    }
    else if (tipo === "daño_indirecto") {
      const dotVal = Math.max(1, Math.round(val > 0 ? val : enemigo.hpMax * 0.1));
      enemigo.dot = dotVal;
      enemigo.dotDur = 3;
      log(`☠️ ${hab.nombre}: ${dotVal} daño por turno (3 turnos).`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dotVal, fxKey: "burn" });
    }
    else if (tipo === "boost" || tipo === "defensa") {
      const atkBuff = Math.round(val * 2);
      const defBuff = Math.round(val * 1.5);
      buffsHeroe.push({ tipo: "atk", val: atkBuff, turnos: 3, label: "ATK" });
      buffsHeroe.push({ tipo: "def", val: defBuff, turnos: 3, label: "DEF" });
      log(`✨ ${hab.nombre}: +${atkBuff} ATK, +${defBuff} DEF (3 turnos).`, "curar");
      FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
      renderBuffs();
    }
    else if (tipo === "soporte") {
      let cur;
      if (val >= 1000 || val >= 100) cur = hpMax() - state.hp;
      else if (val > 0 && val < 100) cur = Math.round(hpMax() * (val / 100));
      else cur = Math.round(hpMax() * 0.4);
      const antes = state.hp;
      state.hp = Math.min(hpMax(), state.hp + cur);
      log(`💚 ${hab.nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
      floatDmg("#sprite-heroe", "+" + Math.round(state.hp - antes), "curar");
      FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
    }
    else if (tipo === "debuff") {
      const debuffVal = -Math.round(val * 2);
      buffsEnemigo.push({ tipo: "atk", val: debuffVal, turnos: 3, label: `${debuffVal} ATK` });
      log(`⬇️ ${hab.nombre}: enemigo ${debuffVal} ATK (3 turnos).`, "daño");
      renderBuffs();
    }
    else if (tipo === "control") {
      enemigo.specialTimer = Math.max(enemigo.specialTimer, 2);
      log(`❄️ ${hab.nombre}: enemigo aturdido 2 turnos.`, "critico");
    }
    else if (tipo === "invocacion") {
      const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 1));
      aplicarDmgEnemigo(dmg);
      log(`🌟 ${hab.nombre}: criatura golpea por ${dmg}.`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "magic" });
    }
    else if (tipo === "pasiva") {
      log(`🛡️ ${hab.nombre} es pasiva (siempre activa).`, "info");
    }

    actualizarHPs();
    chequearFaseJefe();
    if (enemigo.hp <= 0) return setTimeout(victoria, 500);
    setTimeout(turnoEnemigo, 900);
  }

  function detectarEfectoEspecifico(nombre, desc, val, tipo) {
    const texto = (nombre + " " + desc).toLowerCase();

    // AURA DORADA: +DEF permanente
    if (texto.includes("aura dorada")) {
      const defMatch = desc.match(/(\d+)\s*(?:de\s+)?defensa/i);
      const defVal = defMatch ? parseInt(defMatch[1]) : 25;
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: `🛡️ +${defVal}` });
          log(`✨ ${nombre}: +${defVal} DEF permanente durante el combate.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffDef" });
          renderBuffs();
        }
      };
    }

    // CONOCIMIENTO ABSOLUTO (pasiva)
    if (texto.includes("conocimiento absoluto")) {
      return { ejecutar: () => log(`📚 ${nombre} es pasiva: cura HP por turno.`, "info") };
    }

    // PODER ABSOLUTO (pasiva)
    if (texto.includes("poder absoluto")) {
      return { ejecutar: () => log(`👑 ${nombre} es pasiva: al vencer te curas.`, "info") };
    }

    // EL MAGO
    if (texto.includes("el mago") || (texto.includes("mago") && texto.includes("esquiva"))) {
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "def", val: -5, turnos: 3, label: "🧙 -5 DEF" });
          buffsHeroe.push({ tipo: "crit", val: 20, turnos: 3, label: "🎯 +20%" });
          buffsHeroe.push({ tipo: "esq", val: 5, turnos: 3, label: "💨 +5%" });
          log(`🧙 ${nombre}: -5 DEF, +20% crítico, +5% esquiva (3 turnos).`, "critico");
          FX({ tipo: "buff", target: "hero", fxKey: "buffAtk" });
          renderBuffs();
        }
      };
    }

    // DEMORAH
    if (texto.includes("demorah")) {
      const esqMatch = desc.match(/(\d+)\s*(?:de\s+)?esquiva/i);
      const esqVal = esqMatch ? parseInt(esqMatch[1]) : 100;
      const turnosMatch = desc.match(/(\d+)\s*turnos?/i);
      const turnos = turnosMatch ? parseInt(turnosMatch[1]) : 2;
      return {
        ejecutar: () => {
          buffsHeroe.push({ tipo: "esq", val: esqVal, turnos: turnos, label: `💨 +${esqVal}%` });
          log(`💨 ${nombre}: +${esqVal}% esquiva por ${turnos} turnos.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffEsq" });
          renderBuffs();
        }
      };
    }

    // INCERTIDUMBRE
    if (texto.includes("incertidumbre")) {
      const defMatch = desc.match(/defensa\s+en\s+(\d+)/i) || desc.match(/(\d+)\s*(?:de\s+)?defensa/i);
      const defVal = defMatch ? parseInt(defMatch[1]) : 10;
      return {
        ejecutar: () => {
          const existente = buffsHeroe.find(b => b.label === "🎲 INCERT");
          if (existente) {
            existente.val += defVal;
            existente.turnos = 999;
          } else {
            buffsHeroe.push({ tipo: "def", val: defVal, turnos: 999, label: "🎲 INCERT" });
          }
          log(`🎲 ${nombre}: +${defVal} DEF acumulativo.`, "curar");
          renderBuffs();
        }
      };
    }

    // GOLPE TITÁNICO
    if (texto.includes("golpe titánico") || texto.includes("golpe titanico")) {
      const dmgMatch = desc.match(/(\d+)\s*(?:de\s+)?daño/i);
      const dmg = dmgMatch ? parseInt(dmgMatch[1]) : (val >= 50 ? val : 250);
      return {
        ejecutar: () => {
          aplicarDmgEnemigo(dmg);
          log(`💥 ${nombre}: ${dmg} daño devastador.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "hammer", critico: true });
          SND("victoria");
        }
      };
    }

    // ALMA ANIMAL
    if (texto.includes("alma animal")) {
      const drainVal = val > 0 ? val : 30;
      return {
        ejecutar: () => {
          const dmgInmediato = Math.round(drainVal * 0.5);
          aplicarDmgEnemigo(dmgInmediato);
          enemigo.dot = drainVal;
          enemigo.dotDur = 3;
          const robado = Math.round(dmgInmediato * 0.5);
          state.hp = Math.min(hpMax(), state.hp + robado);
          log(`👻 ${nombre}: ${dmgInmediato} daño + ${drainVal}/turno (3 turnos) · robas ${robado} HP.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmgInmediato, "daño");
          floatDmg("#sprite-heroe", "+" + robado, "curar");
          FX({ tipo: "attack", target: "enemy", valor: dmgInmediato, fxKey: "shadow" });
        }
      };
    }

    // CURA con número exacto
    if (nombre === "cura" || nombre.startsWith("cura")) {
      const curaMatch = desc.match(/cura(?:r)?\s+(\d+)/i);
      if (curaMatch) {
        const curaVal = parseInt(curaMatch[1]);
        return {
          ejecutar: () => {
            const antes = state.hp;
            state.hp = Math.min(hpMax(), state.hp + curaVal);
            const curado = Math.round(state.hp - antes);
            log(`💚 ${nombre}: +${curado} HP.`, "curar");
            floatDmg("#sprite-heroe", "+" + curado, "curar");
            FX({ tipo: "heal", target: "hero", valor: curado, fxKey: "heal" });
          }
        };
      }
    }

    // BENDICIÓN DE LAS INFLORESCENCIAS (pasiva)
    if (texto.includes("bendición de las inflorescencias") || texto.includes("bendicion de las inflorescencias")) {
      return { ejecutar: () => log(`🌸 ${nombre} es pasiva: cura % HP por turno.`, "info") };
    }

    // ONESHOT / INMUNE / REVIVE
    if (texto.includes("oneshot") || texto.includes("inmune") || texto.includes("revive")) {
      return { ejecutar: () => log(`💫 ${nombre} es pasiva defensiva.`, "info") };
    }

    // CURAR TODA LA VIDA
    if (texto.includes("cura toda la vida") || texto.includes("curación completa") || texto.includes("vida completa")) {
      return {
        ejecutar: () => {
          const antes = state.hp;
          state.hp = hpMax();
          log(`💚 ${nombre}: ¡Curación total! +${Math.round(state.hp - antes)} HP.`, "curar");
          floatDmg("#sprite-heroe", `+${Math.round(state.hp - antes)}`, "curar");
          FX({ tipo: "heal", target: "hero", valor: Math.round(state.hp - antes), fxKey: "heal" });
        }
      };
    }

    // ESCUDO
    if (texto.includes("escudo") || texto.includes("blinda") || texto.includes("shield")) {
      let escudoVal = 0;
      const m1 = texto.match(/(\d+)\s*%\s*(?:de\s+)?(?:la\s+)?(?:vida\s+máxima|hp)/);
      const m2 = texto.match(/(?:da|dar|añade|otorga|genera)\s+(\d+)/);
      const m3 = texto.match(/\+?(\d+)\s*(?:de\s+)?escudo/);
      const m4 = texto.match(/escudo.*?(\d+)/);
      if (m1) escudoVal = Math.round(hpMax() * (parseInt(m1[1]) / 100));
      else if (m2) escudoVal = parseInt(m2[1]);
      else if (m3) escudoVal = parseInt(m3[1]);
      else if (m4) escudoVal = parseInt(m4[1]);
      else escudoVal = val > 0 ? val * 3 : Math.round(hpMax() * 0.2);
      const curaMatch = texto.match(/cura(?:r)?\s+(\d+)/);
      const curaVal = curaMatch ? parseInt(curaMatch[1]) : 0;
      return {
        ejecutar: () => {
          if (curaVal > 0) {
            const antes = state.hp;
            state.hp = Math.min(hpMax(), state.hp + curaVal);
            log(`💚 ${nombre}: +${Math.round(state.hp - antes)} HP.`, "curar");
          }
          buffsHeroe.push({ tipo: "def", val: Math.round(escudoVal / 2), turnos: 3, label: `🛡️ ${escudoVal}` });
          log(`🛡️ ${nombre}: escudo de ${escudoVal} por 3 turnos.`, "curar");
          FX({ tipo: "buff", target: "hero", fxKey: "buffDef" });
          renderBuffs();
        }
      };
    }

    // DRENAR VIDA
    if (texto.includes("drenar") || texto.includes("roba vida") || texto.includes("absorbe")) {
      return {
        ejecutar: () => {
          const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 1));
          aplicarDmgEnemigo(dmg);
          const robado = Math.round(dmg * 0.5);
          state.hp = Math.min(hpMax(), state.hp + robado);
          log(`🩸 ${nombre}: ${dmg} daño · robas ${robado} HP.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "daño");
          floatDmg("#sprite-heroe", "+" + robado, "curar");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "shadow" });
        }
      };
    }

    // VENENO / QUEMADURA
    if (texto.includes("veneno") || texto.includes("quema") || texto.includes("ardiente") || texto.includes("incendia")) {
      return {
        ejecutar: () => {
          const dotVal = Math.max(1, Math.round(val > 0 ? val : enemigo.hpMax * 0.08));
          enemigo.dot = dotVal;
          enemigo.dotDur = 3;
          const dmgInicial = Math.max(1, Math.round(atkTotal() * 0.5));
          aplicarDmgEnemigo(dmgInicial);
          log(`☠️ ${nombre}: ${dmgInicial} daño inicial + ${dotVal} por turno (3 turnos).`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmgInicial, "daño");
          FX({ tipo: "attack", target: "enemy", valor: dmgInicial, fxKey: "burn" });
        }
      };
    }

    // DAÑO MASIVO
    if (texto.includes("daño masivo") || texto.includes("devastador") || texto.includes("meteoro") || texto.includes("cometa")) {
      return {
        ejecutar: () => {
          const dmg = val >= 50 ? val : Math.round(atkTotal() * Math.max(val, 2));
          aplicarDmgEnemigo(dmg);
          log(`☄️ ${nombre}: ${dmg} daño devastador.`, "critico");
          floatDmg("#sprite-enemigo", "-" + dmg, "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "fireball", critico: true });
          SND("victoria");
        }
      };
    }

    // ATURDIR
    if (texto.includes("aturd") || texto.includes("congela") || texto.includes("paraliza")) {
      return {
        ejecutar: () => {
          enemigo.specialTimer = Math.max(enemigo.specialTimer, 3);
          const dmg = Math.max(1, Math.round(atkTotal() * 0.5));
          aplicarDmgEnemigo(dmg);
          log(`❄️ ${nombre}: enemigo aturdido 3 turnos + ${dmg} daño.`, "critico");
          floatDmg("#sprite-enemigo", "¡ATURDIDO!", "critico");
          FX({ tipo: "attack", target: "enemy", valor: dmg, fxKey: "icebolt" });
        }
      };
    }

    return null;
  }

  function toggleHabilidadesArma() {
    if (!turnoJugador) return;
    const w = $("rpg-arma-wrap"); if (!w) return;
    if (w.dataset.abierto === "1") { w.innerHTML = ""; w.dataset.abierto = "0"; return; }

    const habsItems = window.RpgItems?.getHabilidadesActivas?.() || [];
    if (!habsItems.length) {
      w.innerHTML = `<div class="rpg-arma-panel"><p style="opacity:.6;font-style:italic;text-align:center;padding:.5rem;">No tienes habilidades de arma equipadas.</p></div>`;
      w.dataset.abierto = "1"; return;
    }
    w.dataset.abierto = "1";
    w.innerHTML = `
      <div class="rpg-arma-panel">
        <div class="rpg-arma-titulo">✨ Habilidades equipadas (máx. 4)</div>
        <div class="rpg-arma-grid">
          ${habsItems.map((h, i) => `
            <button type="button" class="rpg-arma-item" data-arma-hab="${i}" title="${h.desc || ''}">
              <span class="rpg-arma-icono">✨</span>
              <span class="rpg-arma-info">
                <strong>${h.nombre}</strong>
                <small>${(h.tipo || "").replace(/_/g, " ")} · val ${h.val}</small>
              </span>
            </button>`).join("")}
        </div>
        <button type="button" class="rpg-arma-cerrar" id="rpg-arma-cerrar">Cancelar</button>
      </div>`;

    qsa("[data-arma-hab]", w).forEach(b => b.addEventListener("click", () => {
      const h = habsItems[Number(b.dataset.armaHab)];
      if (h) { w.innerHTML = ""; w.dataset.abierto = "0"; usarHabilidadDeItem(h); }
    }));
    $("rpg-arma-cerrar")?.addEventListener("click", () => { w.innerHTML = ""; w.dataset.abierto = "0"; });
  }

  function tickDoT() {
    if (enemigo.dot && enemigo.dot > 0) {
      aplicarDmgEnemigo(enemigo.dot);
      log(`🔥 Quemadura: -${enemigo.dot} HP.`, "daño");
      floatDmg("#sprite-enemigo", "-" + enemigo.dot, "daño");
      FX({ tipo: "attack", target: "enemy", valor: enemigo.dot, fxKey: "burn" });
      actualizarHPs();
      if (enemigo.hp <= 0) { setTimeout(victoria, 400); return true; }
      enemigo.dotDur--;
      if (enemigo.dotDur <= 0) enemigo.dot = 0;
    }
    return false;
  }

  function turnoEnemigo() {
    if (!enemigo) return;
    if (tickDoT()) return;
    comprobarPasivas("turno-propio");

    const rg = regenTotal() + bonusTipo("regen_turno");
    if (rg > 0) {
      const a = state.hp; state.hp = Math.min(hpMax(), state.hp + rg);
      const c = Math.round(state.hp - a); if (c > 0) log("💚 Regeneras " + c + " HP.", "curar");
    }
    if (state.sangrado > 0) {
      state.hp = Math.max(0, state.hp - state.sangrado);
      log(`🩸 Sangrado: -${state.sangrado} HP`, "daño");
      if (state.hp <= 0) return setTimeout(derrota, 500);
    }
    const esq = esqTotal() + bonusTipo("esquivar") / 100 + buffVal("esq") / 100;
    if (esq > 0 && Math.random() < esq) {
      log("😎 ¡Esquivaste!", "curar"); floatDmg("#sprite-heroe", "¡ESQUIVA!", "curar");
      guardar(state); actualizarHPs(); tickBuffs();
      turnoJugador = true; deshab(false); return;
    }
    enemigo.specialTimer--;
    if (enemigo.specialTimer <= 0) {
      enemigo.specialTimer = enemigo.specialCD;
      return setTimeout(ejecutarEspecial, 500);
    }
    ataqueNormalEnemigo();
  }

  function ataqueNormalEnemigo() {
    const atkEnemigo = Math.max(1, enemigo.atk + buffsEnemigo.filter(b => b.tipo === "atk").reduce((s, b) => s + b.val, 0));
    const defHeroe = defTotal() + buffVal("def");
    const dmg = Math.max(1, atkEnemigo - defHeroe + rnd(-3, 3));
    state.hp = Math.max(0, state.hp - dmg); guardar(state);
    SND("derrota");
    log(enemigo.nombre + " te ataca por " + dmg + ".", "daño");
    floatDmg("#sprite-heroe", "-" + dmg, "daño");
    FX({ tipo: "attack", target: "hero", valor: dmg, fxKey: "bolt" });
    qs("#sprite-heroe")?.classList.add("golpeado");
    setTimeout(() => qs("#sprite-heroe")?.classList.remove("golpeado"), 350);

    const ls = lifestealTotal();
    if (ls > 0) {
      const rob = Math.round(dmg * ls);
      if (rob > 0) { state.hp = Math.min(hpMax(), state.hp + rob); log(`🩸 Robas ${rob} HP al enemigo.`, "curar"); }
    }
    const th = thornsTotal();
    if (th > 0) {
      enemigo.hp = Math.max(0, enemigo.hp - th);
      log(`🌵 Espinas: ${th} daño al enemigo.`, "daño");
      floatDmg("#sprite-enemigo", "-" + th, "daño");
      if (enemigo.hp <= 0) { actualizarHPs(); return setTimeout(victoria, 400); }
    }

    comprobarPasivas("recibir-dano", { dano: dmg });

    actualizarHPs(); tickBuffs();
    if (state.hp <= 0) {
      if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
        guardar(state);
        actualizarHPs();
        turnoJugador = true; deshab(false);
        return;
      }
      return setTimeout(derrota, 500);
    }
    turnoJugador = true; deshab(false);
  }

  function ejecutarEspecial() {
    if (!enemigo) return;
    const s = enemigo.special;
    SND('growl');
    switch (s) {
      case 'heal': {
        const c = Math.round(enemigo.hpMax * 0.12);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + c);
        log(`💚 ${enemigo.nombre} se cura ${c} HP.`, "curar"); break;
      }
      case 'buff': {
        enemigo.atk = Math.round(enemigo.atk * 1.18);
        log(`⬆️ ${enemigo.nombre} se potencia (+18% ATK).`, "info"); break;
      }
      case 'debuff': {
        buffsHeroe.push({ tipo: 'atk', val: -4, turnos: 3, label: '-ATK' });
        log(`⬇️ ¡Tu ATK baja 4!`, "daño"); renderBuffs(); break;
      }
      case 'poison': {
        state.sangrado = (state.sangrado || 0) + 3;
        log('☠️ ¡Envenenado! +3 daño/turno.', "daño"); break;
      }
      case 'multihit': {
        let total = 0;
        for (let i = 0; i < 3; i++) {
          const defHeroe = defTotal() + buffVal("def");
          const d = Math.max(1, Math.floor(enemigo.atk * 0.45) - defHeroe + rnd(-2, 2));
          state.hp = Math.max(0, state.hp - d); total += d;
        }
        log(`💥💥💥 ¡Triple golpe! ${total} daño.`, "daño");
        floatDmg("#sprite-heroe", "-" + total, "daño");
        FX({ tipo: "attack", target: "hero", valor: total, fxKey: "dagger" }); break;
      }
      case 'drain': {
        const defHeroe = defTotal() + buffVal("def");
        const d = Math.max(1, Math.floor(enemigo.atk * 0.7) - defHeroe + rnd(-2, 2));
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(d * 0.7));
        log(`🩸 ${enemigo.nombre} te drena ${d} HP.`, "daño");
        floatDmg("#sprite-heroe", "-" + d, "daño"); break;
      }
      case 'shield': {
        enemigo.shield += Math.round(enemigo.hpMax * 0.15);
        log(`🛡️ ${enemigo.nombre} se blinda (${enemigo.shield}).`, "info"); break;
      }
      case 'curse': {
        buffsHeroe.push({ tipo: 'def', val: -3, turnos: 3, label: '-DEF' });
        log('💀 ¡Maldición! -3 DEF durante 3 turnos.', "critico"); renderBuffs(); break;
      }
      case 'firebreath': {
        const d = danoEscaladoJefe(1.2);
        state.hp = Math.max(0, state.hp - d);
        enemigo.dot = Math.round(enemigo.hpMax * 0.05);
        enemigo.dotDur = 2;
        log(`🔥 ¡Aliento de fuego! ${d} daño + quemadura.`, "critico");
        floatDmg("#sprite-heroe", "-" + d, "daño");
        FX({ tipo: "attack", target: "hero", valor: d, fxKey: "fireball", critico: true }); break;
      }
      case 'summon': {
        const d = danoEscaladoJefe(0.8);
        state.hp = Math.max(0, state.hp - d);
        enemigo.hp = Math.min(enemigo.hpMax, enemigo.hp + Math.round(enemigo.hpMax * 0.10));
        log(`💀 ${enemigo.nombre} invoca esqueletos · ${d} daño · se cura.`, "critico"); break;
      }
      case 'apocalypse': {
        const d = danoEscaladoJefe(1.5);
        state.hp = Math.max(0, state.hp - d);
        enemigo.shield += Math.round(enemigo.hpMax * 0.08);
        log(`☄️ ¡APOCALIPSIS! ${d} daño + escudo.`, "critico");
        floatDmg("#sprite-heroe", "-" + d, "daño");
        FX({ tipo: "attack", target: "hero", valor: d, fxKey: "fireball", critico: true }); break;
      }
    }
    actualizarHPs(); tickBuffs();
    if (state.hp <= 0) {
      if (comprobarPasivas("recibir-muerte", { hpAntes: 0 })) {
        guardar(state);
        actualizarHPs();
        turnoJugador = true; deshab(false);
        return;
      }
      return setTimeout(derrota, 500);
    }
    turnoJugador = true; deshab(false);
  }

  function toggleObjetos() {
    if (!turnoJugador) return;
    overlayObjetos = !overlayObjetos;
    const w = $("rpg-objetos-wrap"); if (!w) return;
    if (!overlayObjetos) { w.innerHTML = ""; return; }
    const inv = cargarInv();
    const comidas = Object.entries(COMIDAS).filter(([id]) => (inv[id] || 0) > 0);
    const RL = window.RpgLoot;
    const consum = RL?.getConsumibles?.() || [];
    const lootInv = RL?.cargarLoot?.() || {};
    if (!comidas.length && !consum.length) {
      w.innerHTML = `<div class="rpg-objetos"><div style="grid-column:1/-1;text-align:center;opacity:.6;font-style:italic;padding:.5rem;">No tienes objetos</div></div>`;
      return;
    }
    w.innerHTML = `<div class="rpg-objetos">
      ${comidas.map(([id, c]) => `<button type="button" class="rpg-objeto" data-tipo="comida" data-id="${id}" title="${c.nombre}"><span class="rpg-objeto-icono">${ICONO[c.icono] || ""}</span><span class="rpg-objeto-cantidad">${inv[id]}</span></button>`).join("")}
      ${consum.map(it => {
      const c = lootInv[it.id] || 0;
      const ic = RL?.renderIcono ? RL.renderIcono(it, "30px") : `<span class="loot-icono" data-icono="${it.icono}"></span>`;
      return `<button type="button" class="rpg-objeto rar-${it.rar}" data-tipo="loot" data-id="${it.id}" title="${it.nombre}"><span class="rpg-objeto-icono">${ic}</span><span class="rpg-objeto-cantidad">${c}</span></button>`;
    }).join("")}
    </div>`;
    window.hidratarIconos?.(w);
    qsa(".rpg-objeto", w).forEach(b => b.addEventListener("click", () => {
      b.dataset.tipo === "comida" ? usarObjeto(b.dataset.id) : usarLootConsumible(b.dataset.id);
    }));
  }

  function usarObjeto(id) {
    if (!turnoJugador || !enemigo) return;
    const inv = cargarInv();
    if (!inv[id] || inv[id] <= 0) return;
    const c = COMIDAS[id];
    inv[id]--; API.guardarInv(inv);
    const a = state.hp;
    state.hp = clamp(state.hp + c.efecto.hambre, 0, hpMax());
    guardar(state); SND("comer");
    log(`Usas ${c.nombre}. +${Math.round(state.hp - a)} HP.`, "curar");
    floatDmg("#sprite-heroe", `+${Math.round(state.hp - a)}`, "curar");
    FX({ tipo: "consumible", target: "hero", valor: Math.round(state.hp - a), fxKey: "potionRed" });
    actualizarHPs();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    setTimeout(turnoEnemigo, 700);
  }

  function usarLootConsumible(id) {
    if (!turnoJugador || !enemigo) return;
    const RL = window.RpgLoot; if (!RL?.usarConsumible) return;
    const item = RL.POOL.find(p => p.id === id); if (!item) return;
    if (!RL.usarConsumible(id)) return;
    if (item.tipo === "hp" || item.tipo === "def") {
      const cur = item.tipo === "hp" ? item.val : item.val * 3;
      const a = state.hp;
      state.hp = clamp(state.hp + cur, 0, hpMax()); guardar(state);
      SND("comer"); log(`Usas ${item.nombre}. +${Math.round(state.hp - a)} HP.`, "curar");
      floatDmg("#sprite-heroe", `+${Math.round(state.hp - a)}`, "curar");
      FX({ tipo: "consumible", target: "hero", valor: Math.round(state.hp - a), fxKey: "potionBlue" });
    } else if (item.tipo === "atk") {
      aplicarDmgEnemigo(item.val);
      SND("sparkle"); log(`¡Lanzas ${item.nombre}! ${item.val} de daño.`, "critico");
      floatDmg("#sprite-enemigo", `-${item.val}`, "critico");
      FX({ tipo: "attack", target: "enemy", valor: item.val, fxKey: "fireball", critico: true });
      chequearFaseJefe();
    }
    actualizarHPs();
    overlayObjetos = false; const w = $("rpg-objetos-wrap"); if (w) w.innerHTML = "";
    turnoJugador = false; deshab(true);
    if (enemigo.hp <= 0) setTimeout(victoria, 500);
    else setTimeout(turnoEnemigo, 700);
  }

  function huir() {
    if (!turnoJugador || !enemigo) return;
    if (enemigo.jefe) { log("❌ No puedes huir de un jefe.", "daño"); return; }
    const chance = tieneBonus("escape_seguro") ? 1 : 0.6;
    if (Math.random() < chance) {
      log("Escapas del combate...", "info");
      setTimeout(() => { enemigo = null; buffsHeroe = []; buffsEnemigo = []; state.sangrado = 0; render(); }, 500);
    } else {
      log("¡No pudiste escapar!", "daño");
      turnoJugador = false; deshab(true);
      setTimeout(turnoEnemigo, 700);
    }
  }

  function mostrarFinCombate(tipo, datos) {
    if (enemigo) enemigo.terminado = true;
    deshab(true);
    const batallaEl = $("rpg-batalla");
    if (!batallaEl) return;

    // Remover panel anterior si existiese
    qs(".rpg-fin-combate-overlay", batallaEl)?.remove();

    const overlay = document.createElement("div");
    overlay.className = `rpg-fin-combate-overlay ${tipo}`;
    const esVic = tipo === "victoria";

    overlay.innerHTML = `
      <div class="rpg-fin-combate-card">
        <div class="rpg-fin-icono">${esVic ? `<img src="img/sprites%20complementarios/trofeo.png" alt="" style="width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(255,217,61,.6));">` : "💀"}</div>
        <div class="rpg-fin-titulo">${esVic ? "¡VICTORIA!" : "¡DERROTA!"}</div>
        <div class="rpg-fin-sub">${esVic ? `${datos.nE} derrotado` : "Has caído en combate..."}</div>
        ${esVic ? `
          <div class="rpg-fin-recompensas">
            <span class="rpg-fin-badge xp">+${datos.xp} XP</span>
            <span class="rpg-fin-badge oro">+${datos.mon} 🪙</span>
          </div>
          ${datos.primeraVictoria ? `<div class="rpg-fin-extra">🌟 ¡Zona conquistada! Recompensa extra incluida.</div>` : ""}
          ${datos.sub > 0 ? `<div class="rpg-fin-subio"><img src="img/sprites%20complementarios/estrella.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:4px;">¡Subiste a Nivel ${state.nivel}!</div>` : ""}
        ` : `
          <div class="rpg-fin-recompensas">
            <span class="rpg-fin-badge oro perdidas">-${datos.perdidas} 🪙</span>
          </div>
          <div class="rpg-fin-extra">Descansas un poco y recuperas vida.</div>
        `}
        <div class="rpg-fin-botones">
          <button type="button" class="rpg-btn primaria" id="btn-combatir-otra-vez"><img src="img/sprites%20complementarios/espada.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px;">Combatir otra vez</button>
          <button type="button" class="rpg-btn secundaria" id="btn-salir-mapa"><img src="img/items%20de%20aventura/mapa.png" alt="" style="width:18px;height:18px;object-fit:contain;vertical-align:-3px;margin-right:6px;">Volver al mapa</button>
        </div>
      </div>
    `;

    batallaEl.appendChild(overlay);

    overlay.querySelector("#btn-combatir-otra-vez")?.addEventListener("click", () => {
      overlay.remove();
      const zActual = state.zonaActual;
      enemigo = null;
      buffsHeroe = [];
      buffsEnemigo = [];
      state.sangrado = 0;
      entrarZona(zActual);
    });

    overlay.querySelector("#btn-salir-mapa")?.addEventListener("click", () => {
      overlay.remove();
      enemigo = null;
      buffsHeroe = [];
      buffsEnemigo = [];
      state.sangrado = 0;
      render();
    });
  }

  function victoria() {
    if (!enemigo || enemigo.terminado) return;
    enemigo.terminado = true;
    const eraJefe = enemigo.jefe, nE = enemigo.nombre;
    let xp = Math.round(enemigo.xp * xpTotal());
    let mon = Math.round(enemigo.monedas * oroTotal());
    const xpB = bonusTipo("xp_extra") / 100;
    if (xpB > 0) xp = Math.round(xp * (1 + xpB));
    mon += bonusTipo("monedas_victoria");

    const primeraVictoriaZona = !state.zonasConquistadas.includes(state.zonaActual);
    const xpPrimeraVictoria = primeraVictoriaZona ? Math.round(xp * 0.5) : 0;
    const monedasPrimeraVictoria = primeraVictoriaZona ? Math.round(mon * 0.5) : 0;
    if (primeraVictoriaZona) {
      state.zonasConquistadas.push(state.zonaActual);
      xp += xpPrimeraVictoria; mon += monedasPrimeraVictoria;
    }

    // PODER ABSOLUTO: al vencer te curas
    const habs = window.RpgItems?.getHabilidadesActivas?.() || [];
    const poderAbsoluto = habs.find(h => {
      const t = ((h.nombre || "") + " " + (h.desc || "")).toLowerCase();
      return t.includes("poder absoluto");
    });
    if (poderAbsoluto) {
      const curaCompleta = hpMax() - state.hp;
      if (curaCompleta > 0) {
        state.hp = hpMax();
        log(`👑 ¡Poder Absoluto! Te curas ${Math.round(curaCompleta)} HP.`, "curar");
      }
    }

    window.dispatchEvent(new CustomEvent("rpg:victoria", { detail: { enemigo: { ...enemigo, zona: state.zonaActual, xp, monedas: mon } } }));
    state.enemigosDerrotados++;
    state.xp += xp;
    if (eraJefe && !state.jefesDerrotados.includes(state.zonaActual)) state.jefesDerrotados.push(state.zonaActual);
    if (eraJefe) {
      try {
        const u = getUserId(), mascota = localStorage.getItem("mascota_actual") || "mapache";
        const k = `sa_rpg_jefes_mascota_${u}`;
        const logData = JSON.parse(localStorage.getItem(k) || "{}");
        logData[mascota] = logData[mascota] || [];
        if (!logData[mascota].includes(state.zonaActual)) logData[mascota].push(state.zonaActual);
        localStorage.setItem(k, JSON.stringify(logData));
        if (mascota === "conejo" && logData[mascota].length >= 9) notifMascota?.("🐰 ¡MÁXIMA BESTIA!", "¡Has completado el juego con el conejo!");
      } catch { }
    }
    let sub = 0;
    while (state.xp >= xpParaSubir()) { state.xp -= xpParaSubir(); state.nivel++; state.hp = hpMax(); sub++; }
    const cuv = bonusTipo("curar_victoria");
    if (cuv > 0) { state.hp = Math.min(hpMax(), state.hp + cuv); log("💚 +" + cuv + " HP.", "curar"); }
    setMonedas(getMonedas() + mon);
    SND("victoria");
    try { window._darPremio?.(0, 10, "¡Victoria!"); } catch { }
    try { notifMascota?.("¡Victoria!", "+" + mon + " monedas · +" + xp + " XP"); } catch { }
    guardar(state);
    $("rpg-batalla")?.classList.add("ganada");
    log("¡" + nE + " derrotado! +" + xp + " XP, +" + mon + " monedas.", "info");
    if (primeraVictoriaZona) log(`✨ ¡Zona conquistada por primera vez! +${xpPrimeraVictoria} XP y +${monedasPrimeraVictoria} monedas extra.`, "critico");
    if (sub > 0) log("¡Subiste a nivel " + state.nivel + "!", "critico");

    mostrarFinCombate("victoria", { nE, xp, mon, primeraVictoria: primeraVictoriaZona, sub });
  }

  function derrota() {
    if (comprobarPasivas("recibir-muerte", { hpAntes: state.hp })) {
      guardar(state);
      actualizarHPs();
      turnoJugador = true;
      deshab(false);
      return;
    }

    if (enemigo) enemigo.terminado = true;
    SND("derrota");
    log("Has caído...", "daño");
    const monedasActuales = getMonedas();
    const perdidas = Math.floor(monedasActuales * 0.02);
    try { notifMascota?.("Derrota", `Pierdes ${perdidas} 🪙 (2% de tus monedas)`); } catch { }
    setMonedas(monedasActuales - perdidas);
    state.hp = Math.round(hpMax() * 0.3);
    state.sangrado = 0;
    guardar(state);
    $("rpg-batalla")?.classList.add("muerto");

    mostrarFinCombate("derrota", { perdidas });
  }

  function activarVistaRpg() {
    qsa("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === "rpg"));
    qsa("[data-view-link]").forEach(el => el.classList.toggle("active", el.dataset.viewLink === "rpg"));
    document.body.style.overflow = "";
  }
  window.addEventListener("hashchange", () => { if (location.hash === "#rpg") { activarVistaRpg(); render(); } });
  document.addEventListener("click", e => {
    if (!e.target.closest('[data-view-link="rpg"]')) return;
    setTimeout(() => { activarVistaRpg(); render(); }, 0);
  });
  window.addEventListener("rpg:stats-cambiados", () => {
    state.hp = Math.min(state.hp, hpMax());
    guardar(state);
    if ($("rpg-content") && (!enemigo || enemigo.terminado)) {
      if (!enemigo) render();
    }
  });
  window.addEventListener("sunadventures:mascota-cambiada", () => { if ($("rpg-content") && !enemigo) render(); });

  function init() { inyectarSeccion(); inyectarNav(); render(); if (location.hash === "#rpg") activarVistaRpg(); }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
  setTimeout(() => { if (location.hash === "#rpg" && !$("rpg")?.classList.contains("active")) { activarVistaRpg(); render(); } }, 300);

  window.Rpg = {
    state: () => state,
    enemigo: () => enemigo,
    zonas: ZONAS,
    grupos: GRUPOS,
    regiones: REGIONES,
    nombres: NOMBRES,
    spriteMapEnemigos: SPR_ENEMIGO,
    spriteMeta48: SPRITE_METADATA_48,
    renderMobAnimado,
    spriteHtml,
    biomas: REGIONES.map(reg => reg.bioma),
    abrirPopupGrupo,
    reset: () => { localStorage.removeItem(KEY()); state = def(); render(); }
  };
  window._rpgEntrarZona = entrarZona;
  window._comprobarPasivas = comprobarPasivas;

  console.log("✅ rpg.js v12 · balance + loadout + pasivas");
})();