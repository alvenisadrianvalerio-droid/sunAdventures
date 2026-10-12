/**
 * rpg-data.js - Catálogo de Regiones, Biomas, Enemigos, Sprites y Zonas para RPG
 * Extraído de rpg.js para modularización y reducción del tamaño del código.
 */
(() => {
  "use strict";

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

  const SPRITE_METADATA_48 = {
    "Bats/Bat 01 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    "Bats/Bat 02 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    "Bats/Bat 03 48.png": { cols: 9, rows: 4, idleFrames: 7, hurtCol: 7, animKey: "anim-mob-idle-7-of-9", fps: 8 },
    "Fungi/Fungus 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Fungi/Fungus 04 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Ghosts/Ghost 01 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Ghosts/Ghost 02 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Ghosts/Ghost 03 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Orbinauts/Orbinaut 01 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 02 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 03 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orbinauts/Orbinaut 04 48.png": { cols: 3, rows: 1, idleFrames: 3, hurtCol: 1, animKey: "anim-mob-idle-3-of-3", fps: 6 },
    "Orcs/Enemy Orc 01 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Rats/Rat 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Rats/Rat 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Rats/Rat 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Skeletons/Skeleton 01 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Skeletons/Skeleton 02 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Skeletons/Skeleton 03 48.png": { cols: 10, rows: 16, idleFrames: 4, hurtCol: 8, animKey: "anim-mob-idle-4-of-10", fps: 6 },
    "Slimes/Baby Slime 01 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 02 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 03 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Baby Slime 04 48.png": { cols: 6, rows: 4, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Slime 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Slime 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Slimes/Slime 03 48.png": { cols: 6, rows: 8, idleFrames: 6, fps: 7 },
    "Slimes/Slime 04 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 7 },
    "Snakes/Snake 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Snakes/Snake 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Snakes/Snake 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 },
    "Vehicles/Minecart 01 48.png": { cols: 8, rows: 16, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-8", fps: 6 },
    "Weapons/Sword 01 48.png": { cols: 8, rows: 16, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-8", fps: 6 },
    "Zombies/Zombie 01 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 },
    "Zombies/Zombie 02 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 },
    "Zombies/Zombie 03 48.png": { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 5 }
  };

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

  const NOMBRES = {
    "murcielago-comun": "Murciélago Común",
    "murcielago-vampiro": "Murciélago Vampiro",
    "murcielago-abismal": "Murciélago Abismal",
    "hongo-espora": "Hongo de Esporas",
    "hongo-venenoso": "Hongo Venenoso",
    "hongo-alucinogeno": "Hongo Hechicero",
    "hongo-anciano": "Hongo Anciano",
    "espectro-errante": "Espectro Errante",
    "fantasma-vengativo": "Fantasma Vengativo",
    "alma-en-pena": "Alma en Pena",
    "orbinauta-azul": "Orbinauta Arcano",
    "orbinauta-fuego": "Orbinauta Ígneo",
    "orbinauta-electrico": "Orbinauta de Trueno",
    "orbinauta-vacio": "Orbinauta Cósmico",
    "orco-guerrero": "Orco Berserker",
    "rata-de-cloaca": "Rata de Cloaca",
    "rata-rabiosa": "Rata Rabiosa",
    "rata-plagada": "Rata Infectada",
    "esqueleto-soldado": "Esqueleto Guerrero",
    "esqueleto-arquero": "Esqueleto Arquero",
    "esqueleto-armadurado": "Caballero Calavera",
    "slime-bebe-verde": "Slime Bebé Verde",
    "slime-bebe-azul": "Slime Bebé Azul",
    "slime-bebe-rojo": "Slime Bebé Carmesí",
    "slime-bebe-dorado": "Slime Bebé Áureo",
    "slime-verde": "Slime Ácido",
    "slime-azul": "Slime Glacial",
    "slime-rojo": "Slime de Fuego",
    "slime-dorado": "Slime Dorado",
    "serpiente-cascabel": "Serpiente de Cascabel",
    "serpiente-esmeralda": "Víbora Esmeralda",
    "serpiente-coral": "Cobra Venenosa",
    "zombi-podrido": "Zombi Descompuesto",
    "zombi-infectado": "Caminante Infectado",
    "zombi-voraz": "Zombi Feroz",
    "vagoneta-poseida": "Vagoneta Encantada",
    "espada-viviente": "Espada Maldita",
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

  function renderMobAnimado(relPath, size = 96, cls = "") {
    if (!relPath) return "";
    if (relPath.startsWith("Bosses/")) {
      const fullUrl = `img/48x48/${relPath}`;
      return `<img src="${fullUrl}" alt="" class="rpg-boss-animado ${cls}" style="width:${size}px;height:${size}px;" onerror="this.onerror=null;this.src='img/girasol-loading.png'">`;
    }

    const cleanPath = (relPath || "").trim();
    const meta = SPRITE_METADATA_48[cleanPath] || { cols: 6, rows: 8, idleFrames: 4, hurtCol: 4, animKey: "anim-mob-idle-4-of-6", fps: 6 };
    const duracion = ((meta.idleFrames || 4) / (meta.fps || 6)).toFixed(2);
    const bgW = meta.cols * 100;
    const bgH = meta.rows * 100;
    const fullUrl = `img/48x48/${encodeURI(cleanPath)}`;
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
      min-width:${size}px;
      min-height:${size}px;
      background-image:url('${fullUrl}');
      background-repeat:no-repeat;
      background-size:${bgW}% ${bgH}%;
      background-position:0% 0%;
      image-rendering:pixelated;
      display:inline-block;
      flex-shrink:0;
      animation:${animName} ${duracion}s steps(${meta.idleFrames}) infinite;
    "></div>`;
  }

  function spriteHtml(rutaOClave, cls = "rpg-sprite-img", alt = "") {
    if (!rutaOClave) return "";
    let rel = (SPR_ENEMIGO[rutaOClave] || SPR_REGION[rutaOClave] || rutaOClave).trim();
    if (rel.startsWith("img/48x48/")) rel = rel.replace("img/48x48/", "");

    if (rel.startsWith("Bosses/")) {
      const fullUrl = `img/48x48/${encodeURI(rel)}`;
      return `<img class="${cls}" src="${fullUrl}" alt="${alt}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='img/girasol-loading.png'">`;
    }

    const meta = SPRITE_METADATA_48[rel];
    if (meta) {
      const bgW = meta.cols * 100;
      const bgH = meta.rows * 100;
      const fullUrl = `img/48x48/${encodeURI(rel)}`;
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

    let ruta = rel.startsWith("img/") ? encodeURI(rel) : `${DIR_48}${encodeURI(rel)}`;
    return `<img class="${cls}" src="${ruta}" alt="${alt}" loading="lazy" decoding="async">`;
  }

  window.RpgData = {
    DIR_48,
    SPR_ENEMIGO,
    SPR_REGION,
    SPRITE_METADATA_48,
    BIOMAS,
    NOMBRES,
    renderMobAnimado,
    spriteHtml
  };
})();
