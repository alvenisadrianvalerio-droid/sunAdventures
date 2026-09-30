/* ============================================================
   SCRIPT.JS — SunAdventures · v5 compacto
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Helpers ---------- */
  const $   = id => document.getElementById(id);
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const ICONO = window.ICONO || {};
  const SVG = {
    heart: ICONO.corazon || "", sun: ICONO.sol || "", moon: ICONO.luna || "",
    android: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 9v8a1 1 0 0 0 1 1h1v3a1 1 0 0 0 2 0v-3h4v3a1 1 0 0 0 2 0v-3h1a1 1 0 0 0 1-1V9H6zM4 9a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zm16 0a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zM8.5 5.5l-1-1.7a.3.3 0 0 1 .5-.3l1 1.7a5 5 0 0 1 6 0l1-1.7a.3.3 0 0 1 .5.3l-1 1.7A5 5 0 0 1 18 9H6a5 5 0 0 1 2.5-3.5z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12.5c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.8c-1.6 0-3.2.9-4 2.4-1.7 3-.4 7.4 1.2 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.8 1.3-2.8s-2.5-1-2.7-3.9zM14.5 5.2c.7-.8 1.1-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z"/></svg>',
    windows: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5l7.5-1v7H3v-6zm0 13l7.5 1v-7H3v6zm8.5 1.2L21 21V12.5h-9.5v7.2zm0-15.4v7.2H21V3l-9.5 1.3z"/></svg>',
    linux: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.2 0-4 1.8-4 4 0 1.2.5 2.2 1.3 2.9C8.2 9.6 7 11 6.3 12.9c-.2.5-.8 1.9-1.4 3.2-.5 1.2-.9 2.4-.5 3 .3.5 1 .7 1.8.6.7 0 1.5-.2 2.2-.5.6-.3 1.5-.5 2.6-.5h2c1.1 0 2 .2 2.6.5.7.3 1.5.5 2.2.5.8.1 1.5-.1 1.8-.6.4-.6 0-1.8-.5-3-.6-1.3-1.2-2.7-1.4-3.2-.7-1.9-1.9-3.3-3-4 .8-.7 1.3-1.7 1.3-2.9 0-2.2-1.8-4-4-4z"/></svg>'
  };
  const getUserId = () => window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  const randomDe = a => (Array.isArray(a) && a.length) ? a[Math.floor(Math.random() * a.length)] : "";
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const numLS = k => Number(localStorage.getItem(k) || 0);
  const setNumLS = (k, v) => localStorage.setItem(k, String(v));

  /* ---------- Girasol lobby ---------- */
  try {
    const g = qs(".girasol-wrapper"), pop = $("pop"), b = qs(".burbuja");
    if (g && pop) {
      pop.volume = 0.4;
      const fr = ["Mi lugar favorito", "Contigo hasta el infinito", "Cada día te elijo", "Eres mi casualidad más bonita", "Mi persona favorita en el mundo", "Gracias por existir", "Siempre tú, siempre yo, siempre nosotros", "Te pensé, y apareciste"];
      g.addEventListener("mouseenter", () => { pop.currentTime = 0; pop.play().catch(() => {}); if (b) b.textContent = randomDe(fr); });
      g.addEventListener("click", e => {
        for (let i = 0; i < 5; i++) {
          const h = document.createElement("div");
          h.innerHTML = SVG.heart;
          h.style.cssText = `position:absolute;pointer-events:none;width:1.5rem;height:1.5rem;color:#a684f0;animation:heartFloat 1.5s ease-out forwards;animation-delay:${i * 0.05}s;left:${e.offsetX + (Math.random() - .5) * 40}px;top:${e.offsetY + (Math.random() - .5) * 40}px;--dx:${(Math.random() - .5) * 80}px`;
          g.appendChild(h);
          setTimeout(() => h.remove(), 1800);
        }
      });
    }
  } catch {}

  /* ---------- Tema ---------- */
  try {
    const t = $("theme-toggle");
    if (t) {
      const ti = qs(".theme-icon", t) || t;
      const p = () => { ti.innerHTML = document.body.classList.contains("light") ? SVG.sun : SVG.moon; };
      p();
      t.addEventListener("click", () => { document.body.classList.toggle("light"); p(); });
    }
  } catch {}

  /* ---------- Datos ---------- */
  const MASCOTAS = {
    mapache:{nombre:"Mapache",imagen:"img/mapache.png",sonido:"chitter",favorita:"pizza"},
    girasol:{nombre:"Girasol",imagen:"img/mascota-girasol.png",sonido:"twinkle",favorita:"agua"},
    gatito:{nombre:"Siamesa",imagen:"img/siamesa.png",sonido:"meow",favorita:"pescado"},
    "gatito-negro":{nombre:"Armstrong",imagen:"img/gatito-negro.png",sonido:"meow",favorita:"pescado"},
    hamburguesa:{nombre:"Hamburguesa",imagen:"img/hamburguesa.png",sonido:"crunch",favorita:"pizza"},
    oveja:{nombre:"Oveja",imagen:"img/oveja.png",sonido:"baa",favorita:"manzana"},
    pollito:{nombre:"Pollito",imagen:"img/pollito.png",sonido:"peep",favorita:"semillas"},
    jirafa:{nombre:"Jirafa",imagen:"img/jirafa.png",sonido:"blip",favorita:"manzana"},
    unicornio:{nombre:"Unicornio",imagen:"img/unicornio.png",sonido:"sparkle",favorita:"cupcake"},
    conejo:{nombre:"Conejito",imagen:"img/conejito.png",sonido:"hop",favorita:"zanahoria"},
    "dragon-bebe":{nombre:"Dragón Bebé",imagen:"img/dragon-bebe.png",sonido:"fireball",favorita:"carbon"},
    "dragon-anciano":{nombre:"Dragón Anciano",imagen:"img/dragon-anciano.png",sonido:"growl",favorita:"carbon"}
  };
  const FRASES = {
    mapache:["¡Hola! Soy tu mapache","Ñam ñam...","¡Súbeme una foto!","¡Qué bonito todo!","Te acompaño siempre"],
    girasol:["Eres mi luz del sol","Siempre mirando al sol","¡Qué calorcito!","¡Sonríe!"],
    gatito:["¿Quieres acompañarme al cementerio a buscar fuegos fatuos?","Odio a la gente imprudente, no los aguanto.","La dualidad es uno de mis conceptos favoritos.","Los dragones son las criaturas más tercas y complejas.","Valoro mucho la discreción.","Soy pragmática, no pendeja.","Odio a los dragones.","Hollymolly :D"],
    "gatito-negro":["Miau miau...","Ronroneo activado","¿Me das mimos?","Miau elegante"],
    hamburguesa:["Con queso y todo","¡A comer!","Ñam ñam ñam...","¿Me pides?"],
    oveja:["¡Beee!","¿Cuentas ovejitas?","Soy de lana suavecita","¡Qué sueñito!"],
    pollito:["¡Pío pío!","¡Qué bonito día!","¿Jugamos?","Pío pío pío"],
    jirafa:["Veo todo desde aquí arriba","Tengo manchitas bonitas","Hola desde las nubes","¡Un abrazo largoooo!"],
    unicornio:["Soy mágico","Vengo del arcoíris","¡Abracadabra!","Hago magia a tu lado"],
    conejo:["¡Ay, brinquemos!","¿Y esa zanahoria?","¡Brinco de alegría!","Me encanta estar contigo"],
    "dragon-bebe":["¡Fire Ball!","¡Mis escamas son de acero!","Yo creo en mí","Las brasas guían mi camino"],
    "dragon-anciano":["Cof... otro amanecer más","Los años pesan, joven","La sabiduría da paz","100 años no significan nada"]
  };

  /* ---------- TIENDA ---------- */
  const TIENDA_ITEMS = {
    comida: {
      manzana:{nombre:"Manzana",precio:5,icono:"manzana",sprite:[0,0],efecto:{hambre:15,felicidad:5}},
      tomate:{nombre:"Tomate",precio:4,icono:"manzana",sprite:[1,0],efecto:{hambre:12,felicidad:6}},
      pimiento:{nombre:"Pimiento",precio:5,icono:"manzana",sprite:[2,0],efecto:{hambre:13,felicidad:7}},
      pera:{nombre:"Pera",precio:5,icono:"manzana",sprite:[3,0],efecto:{hambre:14,felicidad:8}},
      cerezas:{nombre:"Cerezas",precio:6,icono:"manzana",sprite:[4,0],efecto:{hambre:10,felicidad:12}},
      sandia:{nombre:"Sandía",precio:7,icono:"manzana",sprite:[0,1],efecto:{hambre:18,felicidad:10}},
      naranja:{nombre:"Naranja",precio:5,icono:"manzana",sprite:[1,1],efecto:{hambre:14,felicidad:8}},
      platano:{nombre:"Plátano",precio:4,icono:"manzana",sprite:[2,1],efecto:{hambre:12,felicidad:7}},
      pan:{nombre:"Pan",precio:6,icono:"manzana",sprite:[3,1],efecto:{hambre:16,felicidad:6}},
      uvas:{nombre:"Uvas",precio:8,icono:"manzana",sprite:[4,1],efecto:{hambre:12,felicidad:14}},
      fresa:{nombre:"Fresa",precio:5,icono:"manzana",sprite:[0,2],efecto:{hambre:10,felicidad:15}},
      hotdog:{nombre:"Hot Dog",precio:10,icono:"pizza",sprite:[1,2],efecto:{hambre:25,felicidad:15}},
      hamburguesa:{nombre:"Hamburguesa",precio:12,icono:"pizza",sprite:[2,2],efecto:{hambre:30,felicidad:18}},
      sandwich:{nombre:"Sándwich",precio:9,icono:"pizza",sprite:[3,2],efecto:{hambre:22,felicidad:14}},
      papas:{nombre:"Papas fritas",precio:8,icono:"pizza",sprite:[4,2],efecto:{hambre:18,felicidad:20}},
      pollo:{nombre:"Pollo",precio:11,icono:"pizza",sprite:[0,3],efecto:{hambre:28,felicidad:12}},
      huevo:{nombre:"Huevo",precio:5,icono:"manzana",sprite:[1,3],efecto:{hambre:14,felicidad:6}},
      queso:{nombre:"Queso",precio:7,icono:"manzana",sprite:[2,3],efecto:{hambre:16,felicidad:12}},
      tocino:{nombre:"Tocino",precio:9,icono:"pizza",sprite:[3,3],efecto:{hambre:22,felicidad:14}},
      pizza:{nombre:"Pizza",precio:14,icono:"pizza",sprite:[4,3],efecto:{hambre:32,felicidad:18}},
      sushi:{nombre:"Sushi",precio:15,icono:"pizza",sprite:[0,4],efecto:{hambre:26,felicidad:22}},
      nigiri:{nombre:"Nigiri",precio:13,icono:"pizza",sprite:[1,4],efecto:{hambre:24,felicidad:20}},
      hogaza:{nombre:"Hogaza",precio:8,icono:"manzana",sprite:[2,4],efecto:{hambre:20,felicidad:8}},
      refresco:{nombre:"Refresco",precio:6,icono:"agua",sprite:[3,4],efecto:{hambre:8,felicidad:16}},
      helado:{nombre:"Helado",precio:10,icono:"helado",sprite:[4,4],efecto:{hambre:12,felicidad:30}}
    },
    cabeza: {
      corona:{nombre:"Corona",precio:80,icono:"corona",sheet:"tienda",sprite:[0,0],desc:"Para la realeza",bonus:{tipo:"monedas_victoria",val:10,desc:"+10 monedas al vencer"}},
      gorro:{nombre:"Chistera",precio:60,icono:"tienda",sheet:"tienda",sprite:[1,0],desc:"Muy elegante",bonus:{tipo:"xp_extra",val:15,desc:"+15% XP por victoria"}},
      birrete:{nombre:"Birrete",precio:100,icono:"medalla",sheet:"tienda",sprite:[2,0],desc:"Sabio oficial",bonus:{tipo:"xp_extra",val:25,desc:"+25% XP por victoria"}},
      hongo:{nombre:"Honguito",precio:40,icono:"girasol",sheet:"tienda",sprite:[3,0],desc:"Adorable",bonus:{tipo:"nada",val:0,desc:"Solo estilo"}},
      laurel:{nombre:"Laurel",precio:120,icono:"trofeo",sheet:"tienda",sprite:[4,0],desc:"Solo campeones",bonus:{tipo:"monedas_victoria",val:25,desc:"+25 monedas al vencer"}},
      santa:{nombre:"Gorro Navidad",precio:70,icono:"regalo",sheet:"tienda",sprite:[0,1],desc:"Festivo",bonus:{tipo:"curar_victoria",val:10,desc:"Cura 10 HP tras vencer"}},
      casco:{nombre:"Casco vikingo",precio:150,icono:"escudo",sheet:"tienda",sprite:[1,1],desc:"A la batalla",bonus:{tipo:"atk_fijo",val:5,desc:"+5 ATK en combate"}},
      sombrero:{nombre:"Sombrero mágico",precio:180,icono:"varita",sheet:"tienda",sprite:[2,1],desc:"De un mago",bonus:{tipo:"crit_jefe",val:20,desc:"+20% daño a jefes"}},
      diadema:{nombre:"Diadema",precio:90,icono:"estrella",sheet:"tienda",sprite:[3,1],desc:"Princesa total",bonus:{tipo:"regen_turno",val:5,desc:"+5 HP al inicio de turno"}}
    },
    cuello: {
      pajarita:{nombre:"Pajarita",precio:50,icono:"estrella",sheet:"tienda",sprite:[4,1],desc:"Elegante",bonus:{tipo:"monedas_victoria",val:5,desc:"+5 monedas al vencer"}},
      corbata:{nombre:"Corbata",precio:45,icono:"tienda",sheet:"tienda",sprite:[0,2],desc:"Formal",bonus:{tipo:"descuento_tienda",val:15,desc:"15% descuento en tienda"}},
      collar:{nombre:"Collar",precio:55,icono:"llave",sheet:"tienda",sprite:[1,2],desc:"Mágico",bonus:{tipo:"loot_extra",val:1,desc:"Doble prob. de loot"}},
      bufanda:{nombre:"Bufanda",precio:65,icono:"nube",sheet:"tienda",sprite:[2,2],desc:"Calentita",bonus:{tipo:"def_fijo",val:4,desc:"+4 DEF en combate"}},
      medallon:{nombre:"Medallón",precio:110,icono:"llaveDorada",sheet:"tienda",sprite:[3,2],desc:"Reliquia",bonus:{tipo:"hp_max",val:30,desc:"+30 HP máximo"}}
    },
    ojos: {
      gafas:{nombre:"Gafas sol",precio:65,icono:"globo",sheet:"tienda",sprite:[4,2],desc:"Cool total",bonus:{tipo:"esquivar",val:10,desc:"10% prob. de esquivar"}},
      monoculo:{nombre:"Monóculo",precio:90,icono:"ajustes",sheet:"tienda",sprite:[0,3],desc:"Distinguido",bonus:{tipo:"crit_pct",val:15,desc:"+15% golpe crítico"}},
      antifaz:{nombre:"Antifaz",precio:75,icono:"candado",sheet:"tienda",sprite:[1,3],desc:"Misterioso",bonus:{tipo:"escape_seguro",val:1,desc:"Escape garantizado"}},
      gafas3d:{nombre:"Gafas 3D",precio:100,icono:"cubo",sheet:"tienda",sprite:[2,3],desc:"Cine retro",bonus:{tipo:"crit_pct",val:10,desc:"+10% golpe crítico"}}
    },
    fondos: {
      noche:{nombre:"Fondo Noche estrellada",precio:5000,icono:"luna",sheet:"tienda",sprite:[3,3],desc:"Cambia toda la web",bonus:{tipo:"tema_noche",val:1,desc:"Temática nocturna estelar"}},
      arcoiris:{nombre:"Fondo Arcoíris mágico",precio:8000,icono:"arcoiris",sheet:"tienda",sprite:[4,3],desc:"Cambia toda la web",bonus:{tipo:"tema_arcoiris",val:1,desc:"Temática pastel de arcoíris"}},
      fuego:{nombre:"Fondo Infierno ardiente",precio:12000,icono:"fuego",sheet:"tienda",sprite:[0,4],desc:"Cambia toda la web",bonus:{tipo:"tema_fuego",val:1,desc:"Temática volcánica ardiente"}},
      bosque:{nombre:"Fondo Bosque profundo",precio:6000,icono:"bosque",sheet:"tienda",sprite:[1,0],desc:"Cambia toda la web",bonus:{tipo:"tema_bosque",val:1,desc:"Temática bosque húmedo"}},
      oceano:{nombre:"Fondo Océano profundo",precio:9000,icono:"globo",sheet:"tienda",sprite:[2,0],desc:"Cambia toda la web",bonus:{tipo:"tema_oceano",val:1,desc:"Temática abisal con burbujas"}},
      desierto:{nombre:"Fondo Desierto dorado",precio:7500,icono:"sol",sheet:"tienda",sprite:[3,0],desc:"Cambia toda la web",bonus:{tipo:"tema_desierto",val:1,desc:"Temática duna y calor"}},
      aurora:{nombre:"Fondo Aurora boreal",precio:15000,icono:"estrella",sheet:"tienda",sprite:[4,0],desc:"Cambia toda la web",bonus:{tipo:"tema_aurora",val:1,desc:"Temática aurora polar"}},
      sakura:{nombre:"Fondo Sakura",precio:11000,icono:"girasol",sheet:"tienda",sprite:[0,5],desc:"Cambia toda la web",bonus:{tipo:"tema_sakura",val:1,desc:"Temática flor de cerezo"}},
      cyberpunk:{nombre:"Fondo Cyberpunk",precio:22000,icono:"rayoDoble",sheet:"tienda",sprite:[1,5],desc:"Cambia toda la web",bonus:{tipo:"tema_cyberpunk",val:1,desc:"Temática neón futurista"}},
      tormenta:{nombre:"Fondo Tormenta eléctrica",precio:18000,icono:"rayo",sheet:"tienda",sprite:[2,5],desc:"Cambia toda la web",bonus:{tipo:"tema_tormenta",val:1,desc:"Temática lluvia y relámpagos"}}
    },
    efectos: {
      chispas:{nombre:"Chispas",precio:150,icono:"rayoDoble",sheet:"tienda",sprite:[1,4],desc:"Al hacer clic",bonus:{tipo:"stun_pct",val:8,desc:"8% aturdimiento en ataque"}},
      corazones:{nombre:"Corazones",precio:180,icono:"corazon",sheet:"tienda",sprite:[2,4],desc:"Vuelan alrededor",bonus:{tipo:"curar_victoria",val:20,desc:"Cura 20 HP tras vencer"}},
      estrellas:{nombre:"Estrellas",precio:220,icono:"estrellaDoble",sheet:"tienda",sprite:[3,4],desc:"Caen del cielo",bonus:{tipo:"monedas_victoria",val:15,desc:"+15 monedas al vencer"}}
    }
  };
  const COMIDAS = TIENDA_ITEMS.comida;
  const SKINS = { ...TIENDA_ITEMS.cabeza, ...TIENDA_ITEMS.cuello, ...TIENDA_ITEMS.ojos, ...TIENDA_ITEMS.fondos, ...TIENDA_ITEMS.efectos };

  /* ============================================================
     NIVEL — función HOISTEADA (definir ANTES de desbloqueada)
     ============================================================ */
  function getNivel() {
    try {
      const xp = window._experienciaActual || 0;
      const NIVELES = [0, 100, 500, 1000, 5000];
      for (let i = NIVELES.length - 1; i >= 0; i--) if (xp >= NIVELES[i]) return i + 1;
      return 1;
    } catch { return 1; }
  }
  window.getNivel = getNivel;

  /* ============================================================
     DESBLOQUEOS
     ============================================================ */
  const DESBLOQUEO = {
    mapache:         { tipo:"inicial" },
    "gatito-negro":  { tipo:"inicial" },
    // 🔒 Compra + nivel 10 del jugador
    girasol:    { tipo:"compra", precio:2500, reqNivel:10 },
    conejo:     { tipo:"compra", precio:4000, reqNivel:10 },
    unicornio:  { tipo:"compra", precio:8000, reqNivel:10 },
    // 🏆 Por logros / nivel
    gatito:          { tipo:"logro", id:"fotografos" },
    hamburguesa:     { tipo:"logro", id:"dj" },
    oveja:           { tipo:"logro", id:"racha" },
    pollito:         { tipo:"logro", id:"poetas" },
    jirafa:          { tipo:"logro", id:"trotamundos" },
    "dragon-bebe":   { tipo:"nivel", nivel:3 },
    "dragon-anciano":{ tipo:"nivel", nivel:5 }
  };
  const KEY_MASCOTAS_COMPRADAS = () => `sa_mascotas_compradas_${getUserId()}`;
  const getMascotasCompradas = () => { try { return JSON.parse(localStorage.getItem(KEY_MASCOTAS_COMPRADAS()) || "[]"); } catch { return []; } };
  const setMascotasCompradas = (a) => { try { localStorage.setItem(KEY_MASCOTAS_COMPRADAS(), JSON.stringify(a)); } catch {} };

  const comprarMascota = (id) => {
    const d = DESBLOQUEO[id];
    if (!d || d.tipo !== "compra") return false;
    const compradas = getMascotasCompradas();
    if (compradas.includes(id)) return true;
    const nivelActual = getNivel();
    if (nivelActual < (d.reqNivel || 1)) { notifMascota("Bloqueado", `Necesitas nivel ${d.reqNivel}`); return false; }
    if (getMonedas() < d.precio) { notifMascota("Sin monedas", `Necesitas ${d.precio} SunCoins`); return false; }
    setMonedas(getMonedas() - d.precio);
    compradas.push(id);
    setMascotasCompradas(compradas);
    notifMascota("¡Desbloqueado!", `Nueva mascota: ${MASCOTAS[id].nombre}`);
    try { snd("compra"); } catch {}
    window.dispatchEvent(new Event("sunadventures:progress"));
    return true;
  };
  const desbloqueada = id => {
    const d = DESBLOQUEO[id];
    if (!d) return true;
    try {
      if (d.tipo === "inicial") return true;
      if (d.tipo === "compra") {
        if (getMascotasCompradas().includes(id)) return true;
        return getNivel() >= (d.reqNivel || 1);
      }
      if (d.tipo === "nivel") return getNivel() >= d.nivel;
      if (d.tipo === "logro") return !!(window._logrosDesbloqueados || {})[d.id];
    } catch (err) { console.warn("desbloqueada:", id, err); }
    return false;
  };
  const esComprable = id => {
    const d = DESBLOQUEO[id];
    return d && d.tipo === "compra" && !getMascotasCompradas().includes(id);
  };

  /* ---------- Persistencia ---------- */
  const KEY = {
    stats:(u,m)=>`mascota_stats_${u}_${m}`,
    inv:u=>`mascota_inventario_${u}`,
    mon:u=>`mascota_monedas_${u}`,
    skinsC:u=>`mascota_skins_${u}`,
    skinsE:(u,m)=>`mascota_skins_eq_${u}_${m}`,
    amistad:u=>`mascota_amistad_${u}`,
    cuidado:(u,m)=>`mascota_cuidado_${u}_${m}`
  };
  const statsDef = () => ({ hambre:80, felicidad:100, energia:100, ultimaActualizacion:Date.now(), durmiendo:false });
  const cargarStats = m => {
    try {
      const r = localStorage.getItem(KEY.stats(getUserId(), m));
      if (!r) return statsDef();
      const s = JSON.parse(r);
      return { hambre:s.hambre??80, felicidad:s.felicidad??100, energia:s.energia??100, ultimaActualizacion:s.ultimaActualizacion||Date.now(), durmiendo:!!s.durmiendo };
    } catch { return statsDef(); }
  };
  const guardarStats = (m, s) => { try { s.ultimaActualizacion = Date.now(); localStorage.setItem(KEY.stats(getUserId(), m), JSON.stringify(s)); } catch {} };
  const DEC = { hambre:100/(12*3600000), felicidad:100/(24*3600000), energia:100/(6*3600000) };
  const decaer = s => {
    if (!s) return s;
    const d = Math.max(0, Date.now() - (s.ultimaActualizacion || Date.now()));
    const fe = s.durmiendo ? 0 : 1;
    s.hambre    = Math.max(0, s.hambre    - d * DEC.hambre);
    s.felicidad = Math.max(0, s.felicidad - d * DEC.felicidad);
    s.energia   = Math.max(0, s.energia   - d * DEC.energia * fe);
    return s;
  };
  const invInicial = () => ({ manzana:5, zanahoria:3, semillas:3, agua:3 });
  const cargarInv = () => {
    try {
      const r = localStorage.getItem(KEY.inv(getUserId()));
      if (!r) { const i = invInicial(); localStorage.setItem(KEY.inv(getUserId()), JSON.stringify(i)); return i; }
      const i = JSON.parse(r);
      return (i && typeof i === "object") ? i : invInicial();
    } catch { return invInicial(); }
  };
  const guardarInv = i => { try { localStorage.setItem(KEY.inv(getUserId()), JSON.stringify(i)); } catch {} };
  const getMonedas = () => { try { return Number(localStorage.getItem(KEY.mon(getUserId())) || 50); } catch { return 50; } };
  const setMonedas = n => {
    const v = Math.max(0, Math.floor(n));
    try { localStorage.setItem(KEY.mon(getUserId()), String(v)); } catch {}
    const u = getUserId();
    if (v > numLS(`sa_monedas_max_${u}`)) setNumLS(`sa_monedas_max_${u}`, v);
    return v;
  };
  const getSkinsC = () => { try { return JSON.parse(localStorage.getItem(KEY.skinsC(getUserId())) || "[]"); } catch { return []; } };
  const setSkinsC = a => { try { localStorage.setItem(KEY.skinsC(getUserId()), JSON.stringify(a)); } catch {} };
  const getSkinsE = m => { try { return JSON.parse(localStorage.getItem(KEY.skinsE(getUserId(), m)) || "{}"); } catch { return {}; } };
  const setSkinsE = (m, e) => { try { localStorage.setItem(KEY.skinsE(getUserId(), m), JSON.stringify(e)); } catch {} };
  const cargarAm  = () => { try { return JSON.parse(localStorage.getItem(KEY.amistad(getUserId())) || "{}"); } catch { return {}; } };
  const guardarAm = a => { try { localStorage.setItem(KEY.amistad(getUserId()), JSON.stringify(a)); } catch {} };
  const getAmistad = (a, b) => cargarAm()[[a, b].sort().join("__")] || 0;
  const subirAmistad = (a, b, d) => {
    const am = cargarAm();
    const k = [a, b].sort().join("__");
    am[k] = clamp((am[k] || 0) + d);
    guardarAm(am);
    return am[k];
  };
  const cargarCuidado = m => {
    try {
      const r = localStorage.getItem(KEY.cuidado(getUserId(), m));
      if (!r) return { fecha:hoyISO(), tareas:[], racha:0, ultimaCompletada:null };
      const c = JSON.parse(r);
      if (c.fecha !== hoyISO()) return { fecha:hoyISO(), tareas:[], racha:c.racha||0, ultimaCompletada:c.ultimaCompletada||null };
      return c;
    } catch { return { fecha:hoyISO(), tareas:[], racha:0, ultimaCompletada:null }; }
  };
  const guardarCuidado = (m, c) => { try { localStorage.setItem(KEY.cuidado(getUserId(), m), JSON.stringify(c)); } catch {} };

  /* ---------- Audio ---------- */
  let ac = null;
  const getAC = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ac.state === "suspended") ac.resume().catch(() => {});
    return ac;
  };
  const tono = (f, d, t = "sine", v = 0.15, dl = 0, ff = null) => {
    const c = getAC(); if (!c) return;
    const ti = c.currentTime + dl;
    const o = c.createOscillator(), g = c.createGain();
    o.type = t; o.frequency.setValueAtTime(f, ti);
    if (ff) o.frequency.exponentialRampToValueAtTime(ff, ti + d);
    g.gain.setValueAtTime(0, ti);
    g.gain.linearRampToValueAtTime(v, ti + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ti + d);
    o.connect(g).connect(c.destination);
    o.start(ti); o.stop(ti + d + 0.05);
  };
  const ruido = (d = 0.15, v = 0.2) => {
    const c = getAC(); if (!c) return;
    const ti = c.currentTime, s = c.sampleRate * d;
    const b = c.createBuffer(1, s, c.sampleRate), da = b.getChannelData(0);
    for (let i = 0; i < s; i++) da[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / s, 2);
    const sr = c.createBufferSource(), g = c.createGain();
    sr.buffer = b;
    g.gain.setValueAtTime(v, ti);
    g.gain.exponentialRampToValueAtTime(0.001, ti + d);
    sr.connect(g).connect(c.destination);
    sr.start(ti);
  };
  const SND = {
    fireball:()=>{ruido(0.25,0.3);tono(180,0.4,"sawtooth",0.12,0,60);},
    growl:()=>{tono(120,0.6,"sawtooth",0.1,0,80);tono(90,0.5,"sawtooth",0.08,0.2,60);},
    chitter:()=>[0,0.07,0.14].forEach(d=>tono(1200+(d?200:0),0.05,"square",0.08,d)),
    twinkle:()=>{tono(880,0.3,"sine",0.12);tono(1320,0.4,"sine",0.1,0.1);},
    meow:()=>{tono(500,0.15,"sine",0.15,0,800);tono(800,0.4,"sine",0.15,0.15,400);},
    crunch:()=>{ruido(0.15,0.2);ruido(0.1,0.15);},
    baa:()=>tono(600,0.6,"sawtooth",0.08,0,400),
    peep:()=>{tono(1800,0.1,"sine",0.12);tono(2000,0.08,"sine",0.12,0.12);},
    blip:()=>{tono(300,0.3,"sine",0.15);tono(400,0.2,"sine",0.12,0.15);},
    sparkle:()=>{[660,880,1100].forEach((f,i)=>tono(f,0.15,"sine",0.1,i*0.1));tono(1320,0.3,"sine",0.1,0.3);},
    hop:()=>[420,620,860].forEach((f,i)=>tono(f,0.1,"triangle",0.1,i*0.08)),
    mimos:()=>[660,880,990].forEach((f,i)=>tono(f,0.18,"sine",0.1,i*0.08)),
    dormir:()=>{tono(440,0.5,"sine",0.12,0,220);tono(330,0.6,"sine",0.08,0.4,165);},
    despertar:()=>[523,659,784].forEach((f,i)=>tono(f,0.15,"sine",0.12,i*0.1)),
    comer:()=>{ruido(0.12,0.15);ruido(0.08,0.12);tono(600,0.2,"sine",0.1,0.15);},
    moneda:()=>{tono(900,0.08,"square",0.1);tono(1300,0.12,"square",0.1,0.06);},
    compra:()=>[523,659,784,1046].forEach((f,i)=>tono(f,0.12,"sine",0.1,i*0.07)),
    atrapado:()=>{tono(880,0.06,"square",0.08);tono(1320,0.08,"square",0.08,0.04);},
    victoria:()=>[523,659,784,1046,1318].forEach((f,i)=>tono(f,0.18,"triangle",0.12,i*0.09)),
    derrota:()=>[600,500,400,300].forEach((f,i)=>tono(f,0.2,"sine",0.1,i*0.1))
  };
  const snd = t => { if (!t) return; try { (SND[t] || (() => tono(600, 0.2)))(); } catch {} };
  const getNombre = () => localStorage.getItem("sunadventures_username") || window._sunUserEmail?.split("@")[0] || "";

  /* ---------- Notificación ---------- */
  let notifT = null, _notifEl = null;
  function notifMascota(t, txt, d = 4000) {
    try {
      if (!_notifEl || !_notifEl.isConnected) {
        _notifEl = document.createElement("div");
        _notifEl.className = "mascota-notif";
        _notifEl.innerHTML = `<img class="mascota-notif-sprite" src="img/mapache.png" alt=""><div class="mascota-notif-copy"><span class="mascota-notif-titulo"></span><span class="mascota-notif-texto"></span></div><button class="mascota-notif-cerrar">×</button>`;
        qs(".mascota-notif-cerrar", _notifEl).addEventListener("click", () => _notifEl.classList.remove("visible"));
        document.body.appendChild(_notifEl);
      }
      const a = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
      const sp = qs(".mascota-notif-sprite", _notifEl);
      sp.onerror = () => { sp.onerror = null; sp.src = "img/girasol-loading.png"; };
      sp.src = a.imagen;
      qs(".mascota-notif-titulo", _notifEl).textContent = t;
      qs(".mascota-notif-texto", _notifEl).textContent = txt;
      _notifEl.classList.add("visible");
      if (notifT) clearTimeout(notifT);
      notifT = setTimeout(() => _notifEl.classList.remove("visible"), d);
    } catch {}
  }

  /* ---------- Premios ---------- */
  const darPremio = (m, f, mot) => {
    setMonedas(getMonedas() + m);
    try {
      const k = KEY.stats(getUserId(), localStorage.getItem("mascota_actual") || "mapache");
      const r = localStorage.getItem(k);
      const s = r ? JSON.parse(r) : statsDef();
      s.felicidad = clamp((s.felicidad || 100) + f);
      s.ultimaActualizacion = Date.now();
      localStorage.setItem(k, JSON.stringify(s));
    } catch {}
    try { setNumLS(`sa_minijuegos_jugados_${getUserId()}`, numLS(`sa_minijuegos_jugados_${getUserId()}`) + 1); } catch {}
    if (window.decirMascota) window.decirMascota(mot || `+${m}`, 2500);
    window.dispatchEvent(new Event("sunadventures:progress"));
  };

  /* ============================================================
     MASCOTA FLOTANTE
     ============================================================ */
  const mascota = qs(".mascota"), mascotaImg = qs(".mascota-img"), mascotaBurbuja = qs(".mascota-burbuja");
  let mascotaActual = localStorage.getItem("mascota_actual") || "mapache";
  if (!MASCOTAS[mascotaActual]) { mascotaActual = "mapache"; try { localStorage.setItem("mascota_actual", "mapache"); } catch {} }

  let burbujaT = null, statsM = null, cdMimos = 0, cdDormir = 0, inv = cargarInv();
  const _imgRotas = new Set();

  function setMascotaImg(img, src, alt, fallbackSrc) {
    if (!img) return;
    img.alt = alt || "";
    const fallback = fallbackSrc || "img/girasol-loading.png";
    const finalSrc = _imgRotas.has(src) ? fallback : src;
    if (img.dataset.currentSrc === finalSrc) return;
    img.onerror = () => {
      img.onerror = null;
      _imgRotas.add(src);
      if (img.src.endsWith(fallback)) return;
      img.dataset.currentSrc = fallback;
      img.src = fallback;
    };
    img.dataset.currentSrc = finalSrc;
    img.src = finalSrc;
  }

  if (mascota && mascotaImg && mascotaBurbuja) {
    window.decirMascota = (t, d = 3000) => {
      try {
        mascotaBurbuja.textContent = t;
        mascotaBurbuja.classList.add("visible");
        if (burbujaT) clearTimeout(burbujaT);
        burbujaT = setTimeout(() => mascotaBurbuja.classList.remove("visible"), d);
      } catch {}
    };
    window._setMascotaImg = setMascotaImg;

    function aplicarSkins() {
      try {
        if (!mascota) return;
        qsa(".mascota-skin", mascota).forEach(s => s.remove());
        const e = getSkinsE(mascotaActual);
        Object.entries(e).forEach(([zona, idSkin]) => {
          const sk = SKINS[idSkin];
          if (!sk) return;
          const el = document.createElement("span");
          el.className = `mascota-skin mascota-skin-${zona}`;
          el.innerHTML = ICONO[sk.icono] || "";
          if (!ICONO[sk.icono]) el.dataset.icono = sk.icono;
          mascota.appendChild(el);
        });
        if (typeof window._aplicarTemaFondo === "function") window._aplicarTemaFondo();
        if (typeof window._aplicarEfectosVisuales === "function") window._aplicarEfectosVisuales();
      } catch (err) { console.warn("aplicarSkins:", err); }
    }
    window._aplicarSkins = aplicarSkins;

    function actualizarModalMascota() {
      try {
        const modal = $("mascota-modal");
        if (!modal?.classList.contains("active")) return;
        const m = MASCOTAS[mascotaActual];
        if (!m || !statsM) return;
        const av = $("mm-avatar-img"); if (av) { av.src = m.imagen; av.alt = m.nombre; }
        const nom = $("mm-nombre-txt"); if (nom) nom.textContent = m.nombre;
        const est = $("mm-estado");
        if (est) {
          let estado = "Tranquila";
          if (statsM.durmiendo) estado = "Durmiendo";
          else if (statsM.hambre < 25) estado = "Hambrienta";
          else if (statsM.felicidad < 25) estado = "Triste";
          else if (statsM.felicidad > 80) estado = "Feliz";
          else if (statsM.energia < 25) estado = "Cansada";
          est.textContent = estado;
        }
        const mon = $("mm-monedas"); if (mon) mon.textContent = getMonedas();
        const hp = Math.round(statsM.hambre), fp = Math.round(statsM.felicidad), ep = Math.round(statsM.energia);
        const hv = $("mm-stat-hambre-val"), fv = $("mm-stat-felicidad-val"), ev = $("mm-stat-energia-val");
        if (hv) hv.textContent = hp + "%"; if (fv) fv.textContent = fp + "%"; if (ev) ev.textContent = ep + "%";
        const bh = $("mm-stat-hambre"), bf = $("mm-stat-felicidad"), be = $("mm-stat-energia");
        if (bh) bh.style.width = hp + "%"; if (bf) bf.style.width = fp + "%"; if (be) be.style.width = ep + "%";
        const btn = qs('[data-accion="dormir"] [data-txt-dormir]', modal);
        if (btn) btn.textContent = statsM.durmiendo ? "Despertar" : "Dormir";
      } catch (e) { console.warn("actualizarModalMascota:", e); }
    }
    window._actualizarModalMascota = actualizarModalMascota;

    function visual() {
      try {
        if (!mascota || !statsM) return;
        const meta = MASCOTAS[mascotaActual];
        mascota.classList.toggle("dormida", !!statsM.durmiendo);
        mascota.classList.toggle("hambrienta", statsM.hambre < 25 && !statsM.durmiendo);
        if (statsM.durmiendo && meta.imagenDormida) setMascotaImg(mascotaImg, meta.imagenDormida, meta.nombre, meta.imagen);
        else setMascotaImg(mascotaImg, meta.imagen, meta.nombre);
        let z = qs(".mascota-zzz-cont", mascota);
        if (statsM.durmiendo && !z) {
          const c = document.createElement("div");
          c.className = "mascota-zzz-cont";
          for (let i = 0; i < 3; i++) { const s = document.createElement("span"); s.className = "mascota-zzz"; s.textContent = "z"; c.appendChild(s); }
          mascota.appendChild(c);
        } else if (!statsM.durmiendo && z) z.remove();
        aplicarSkins();
      } catch {}
    }

    window.abrirMascotaModal = () => {
      const m = $("mascota-modal"); if (!m) return;
      m.classList.add("active");
      m.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      actualizarModalMascota();
      renderInv(); renderCuidado(); renderCambiarMascota();
      window.dispatchEvent(new Event("sunadventures:mascota-cambiada"));
      const embed = $("tienda-embed");
      if (embed && window.Tienda?.montar) window.Tienda.montar(embed);
    };
    window.cerrarMascotaModal = () => {
      const m = $("mascota-modal"); if (!m) return;
      m.classList.remove("active");
      m.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    function renderInv() {
      const c = $("mm-inventario"); if (!c) return;
      if (!inv) inv = cargarInv();
      c.innerHTML = "";
      const fav = MASCOTAS[mascotaActual]?.favorita;
      Object.entries(COMIDAS).forEach(([id, co]) => {
        const cant = inv[id] || 0;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "comida-item" + (cant === 0 ? " vacia" : "") + (fav === id ? " favorita" : "");
        b.title = `${co.nombre} · ${cant} uds.`;
        b.dataset.comida = id;
        let iconoHtml = ICONO[co.icono] || "";
        if (Array.isArray(co.sprite) && co.sprite.length === 2) {
          const posX = (co.sprite[0] / 4) * 100, posY = (co.sprite[1] / 4) * 100;
          iconoHtml = `<div class="tienda-item-sprite" style="width:75%;height:75%;background-position:${posX}% ${posY}%"></div>`;
        }
        b.innerHTML = `<span class="comida-item-icono">${iconoHtml}</span><span class="comida-item-cantidad">${cant}</span>`;
        if (cant > 0) {
          b.draggable = true;
          b.addEventListener("click", e => { e.stopPropagation(); darComida(id); });
          b.addEventListener("dragstart", e => { try { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; } catch {} });
        } else b.disabled = true;
        c.appendChild(b);
      });
    }
    window._renderInv = renderInv;

    function renderCuidado() {
      const c = $("mm-cuidado-diario"); if (!c) return;
      const cu = cargarCuidado(mascotaActual);
      const t = [
        { id:"alimentar", icono:ICONO.manzana, txt:"Alimentar" },
        { id:"jugar",     icono:ICONO.jugar,   txt:"Jugar" },
        { id:"mimar",     icono:ICONO.mimar,   txt:"Mimar" }
      ];
      c.innerHTML = `<div class="cuidado-diario-titulo"><span>Cuidado diario</span><span class="cuidado-diario-racha">${cu.racha || 0} ${cu.racha === 1 ? "día" : "días"}</span></div><div class="cuidado-diario-tareas">${t.map(x => `<div class="cuidado-tarea ${cu.tareas.includes(x.id) ? "hecha" : ""}"><span class="cuidado-tarea-emoji">${x.icono || ""}</span><span class="cuidado-tarea-txt">${x.txt}</span>${cu.tareas.includes(x.id) ? '<span class="cuidado-tarea-check">✓</span>' : ''}</div>`).join("")}</div>`;
    }
    window._renderCuidado = renderCuidado;

    function renderCambiarMascota() {
      const c = $("mm-cambiar-lista"); if (!c) return;
      c.innerHTML = "";
      Object.keys(MASCOTAS).forEach(id => {
        const ok = desbloqueada(id);
        const comprable = esComprable(id);
        const d = DESBLOQUEO[id];
        const item = document.createElement("button");
        item.type = "button";
        item.className = "mm-cambiar-item" + (id === mascotaActual ? " activa" : "") + (!ok ? " bloqueada" : "") + (comprable ? " comprable" : "");
        item.innerHTML = `<img alt=""><span class="mm-cambiar-info"></span>`;
        const im = item.querySelector("img");
        im.onerror = () => { im.onerror = null; im.src = "img/girasol-loading.png"; };
        im.src = MASCOTAS[id].imagen;
        const info = item.querySelector(".mm-cambiar-info");
        if (comprable && d) {
          info.textContent = `${d.precio} 🪙`;
          item.title = `Comprar ${MASCOTAS[id].nombre} (nivel ${d.reqNivel})`;
        } else {
          item.title = MASCOTAS[id].nombre;
        }
        if (ok && id !== mascotaActual && !comprable) {
          item.addEventListener("click", () => {
            localStorage.setItem("mascota_actual", id);
            mascotaActual = id;
            statsM = cargarStats(mascotaActual);
            decaer(statsM);
            guardarStats(mascotaActual, statsM);
            visual();
            actualizarModalMascota();
            renderInv(); renderCuidado(); renderCambiarMascota();
            decirMascota(`¡Hola! Ahora soy ${MASCOTAS[mascotaActual].nombre}`);
            window.dispatchEvent(new Event("sunadventures:mascota-cambiada"));
          });
        } else if (comprable) {
          item.addEventListener("click", () => {
            if (comprarMascota(id)) { renderCambiarMascota(); renderGrid(); }
          });
        }
        c.appendChild(item);
      });
    }

    function marcarTarea(t) {
      try {
        const c = cargarCuidado(mascotaActual);
        if (!c.tareas.includes(t)) c.tareas.push(t);
        if (c.tareas.length === 3 && c.ultimaCompletada !== hoyISO()) {
          c.ultimaCompletada = hoyISO();
          c.racha = (c.racha || 0) + 1;
          const b = 20 + c.racha * 2;
          setMonedas(getMonedas() + b);
          setNumLS(`sa_cuidado_racha_${getUserId()}`, c.racha);
          notifMascota(`+${b}`, `¡Cuidado diario completado! Racha: ${c.racha} días`);
          if (statsM) { statsM.felicidad = clamp(statsM.felicidad + 15); guardarStats(mascotaActual, statsM); }
          decirMascota(`¡${c.racha} días seguidos cuidándome!`);
        }
        guardarCuidado(mascotaActual, c);
      } catch {}
    }

    function hacerMimos() {
      try {
        if (!statsM) return;
        const a = Date.now(), CD = 30000;
        const b = qs('[data-accion="mimos"]', $("mascota-modal"));
        if (a < cdMimos) { decirMascota(`Espera ${Math.ceil((cdMimos - a) / 1000)}s...`, 2000); return; }
        cdMimos = a + CD;
        lanzarCorazones(6);
        snd("mimos");
        statsM.felicidad = clamp(statsM.felicidad + 8);
        guardarStats(mascotaActual, statsM);
        marcarTarea("mimar");
        subirAmistadTodas(1);
        actualizarModalMascota();
        renderCuidado();
        visual();
        decirMascota(randomDe(["¡Mmm, qué rico!", "¡Más mimos, porfa!", "¡Te quiero mucho!", "¡Eso me encanta!", "Purrr..."]));
        if (b) {
          b.disabled = true;
          const p = qs('[data-progreso="mimos"]', b), s = Date.now();
          const tk = () => {
            const el = Date.now() - s, pc = Math.min(100, (el / CD) * 100);
            if (p) p.style.width = pc + "%";
            if (el < CD) requestAnimationFrame(tk);
            else { b.disabled = false; if (p) p.style.width = "0"; }
          };
          tk();
        }
      } catch {}
    }

    function dormir() {
      try {
        if (!statsM) return;
        const a = Date.now(), CD = 10000;
        if (a < cdDormir) return;
        cdDormir = a + CD;
        if (statsM.durmiendo) {
          statsM.durmiendo = false;
          statsM.energia = clamp(statsM.energia + 15);
          snd("despertar");
          decirMascota("¡Buenos días! Ya descansé");
        } else {
          if (statsM.energia > 95) { decirMascota("¡No tengo sueño todavía!", 2500); return; }
          statsM.durmiendo = true;
          snd("dormir");
          decirMascota("Zzz... a dormir un ratito", 2500);
        }
        guardarStats(mascotaActual, statsM);
        actualizarModalMascota();
        visual();
      } catch {}
    }

    function lanzarCorazones(c = 5) {
      try {
        if (!mascota) return;
        for (let i = 0; i < c; i++) {
          const h = document.createElement("span");
          h.className = "corazon-flotante";
          h.innerHTML = SVG.heart;
          const r = mascota.getBoundingClientRect();
          h.style.left = (Math.random() * r.width * 0.7) + "px";
          h.style.top  = (r.height * 0.3 + Math.random() * 20) + "px";
          h.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px");
          h.style.setProperty("--rot", (Math.random() - 0.5) * 50 + "deg");
          h.style.animationDelay = (i * 0.06) + "s";
          mascota.appendChild(h);
          setTimeout(() => h.remove(), 2000);
        }
      } catch {}
    }

    function darComida(id) {
      try {
        if (!statsM) return;
        if (!inv[id] || inv[id] <= 0) { decirMascota("No me queda de eso... ve a la tienda", 2500); return; }
        if (statsM.durmiendo) { decirMascota("Shhh... estoy durmiendo", 2000); return; }
        inv[id]--; guardarInv(inv);
        const c = COMIDAS[id], fav = MASCOTAS[mascotaActual].favorita === id, m = fav ? 1.5 : 1;
        statsM.hambre    = clamp(statsM.hambre    + c.efecto.hambre * m);
        statsM.felicidad = clamp(statsM.felicidad + c.efecto.felicidad * m);
        statsM.energia   = clamp(statsM.energia   + (fav ? 5 : 2));
        guardarStats(mascotaActual, statsM);
        marcarTarea("alimentar");
        subirAmistadTodas(1);
        snd("comer");
        lanzarCorazones(fav ? 8 : 3);
        decirMascota(randomDe(fav ? ["¡PIZZA! ¡Mi favorita!", "¡Ñam ñam!", "¡Eres el mejor!"] : ["¡Gracias por la comida!", "Ñam ñam...", "¡Qué rico!"]));
        if (fav) { setMonedas(getMonedas() + 3); notifMascota("+3", "¡Comida favorita!"); }
        actualizarModalMascota();
        renderInv(); renderCuidado(); visual();
        window.dispatchEvent(new Event("sunadventures:progress"));
      } catch {}
    }

    function dropEnMascota() {
      try {
        if (!mascota) return;
        const z = document.createElement("div");
        z.className = "mascota-dropzone";
        mascota.appendChild(z);
        ["dragenter", "dragover"].forEach(e => mascota.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); mascota.classList.add("drop-hover"); }));
        ["dragleave", "drop"].forEach(e => mascota.addEventListener(e, ev => {
          ev.preventDefault(); ev.stopPropagation();
          if (e === "dragleave" && ev.relatedTarget && mascota.contains(ev.relatedTarget)) return;
          mascota.classList.remove("drop-hover");
        }));
        mascota.addEventListener("drop", ev => {
          const id = ev.dataTransfer?.getData("text/plain");
          if (id && COMIDAS[id]) darComida(id);
        });
      } catch {}
    }

    function subirAmistadTodas(d) {
      try {
        Object.keys(MASCOTAS).forEach(id => {
          if (id === mascotaActual) return;
          if (!desbloqueada(id)) return;
          subirAmistad(mascotaActual, id, d);
        });
      } catch {}
    }

    function abrirAmistad() {
      try {
        let o = qs(".amistad-overlay");
        if (!o) {
          o = document.createElement("div");
          o.className = "amistad-overlay";
          o.innerHTML = `<div class="amistad-panel"><h3 class="amistad-titulo">Amistades de ${MASCOTAS[mascotaActual].nombre}</h3><p class="amistad-sub">Aliméntalas, juega con ellas y sube su amistad.</p><div class="amistad-lista" id="amistad-lista"></div><div style="text-align:right;margin-top:1rem;"><button type="button" class="btn-secondary" data-close-amistad>Cerrar</button></div></div>`;
          document.body.appendChild(o);
          o.addEventListener("click", e => { if (e.target === o || e.target.hasAttribute("data-close-amistad")) o.classList.remove("active"); });
        }
        const l = qs("#amistad-lista", o);
        l.innerHTML = "";
        const d = Object.keys(MASCOTAS).filter(id => id !== mascotaActual && desbloqueada(id));
        if (!d.length) l.innerHTML = `<div class="amistad-vacio">Aún no tienes otras mascotas desbloqueadas.</div>`;
        else d.forEach(id => {
          const am = getAmistad(mascotaActual, id);
          const n = am >= 80 ? "Mejores amigos" : am >= 50 ? "Amigos" : am >= 20 ? "Conocidos" : "Extraños";
          const f = document.createElement("div");
          f.className = "amistad-fila";
          f.innerHTML = `<img class="amistad-sprite" src="${MASCOTAS[id].imagen}" alt="${MASCOTAS[id].nombre}" onerror="this.style.display='none'"><div class="amistad-info"><span class="amistad-nombre">${MASCOTAS[id].nombre}</span><div class="amistad-barra"><span style="width:${am}%"></span></div></div><span class="amistad-nivel">${n}</span>`;
          l.appendChild(f);
        });
        o.classList.add("active");
      } catch {}
    }

    /* ---------- INIT mascota ---------- */
    statsM = cargarStats(mascotaActual);
    decaer(statsM);
    guardarStats(mascotaActual, statsM);
    visual();

    /* Taps y clics */
    let _pressT = null, _pressDisparo = false, _ultimoTap = 0;

    function _contarClick() {
      try {
        const u = getUserId();
        const k = `mascota_clicks_${u}_${mascotaActual}`;
        const actual = Number(localStorage.getItem(k) || 0) + 1;
        localStorage.setItem(k, String(actual));
        window.dispatchEvent(new Event("sunadventures:progress"));
      } catch {}
    }
    function _interactuar() {
      snd(MASCOTAS[mascotaActual].sonido);
      mascota.classList.remove("saludo");
      void mascota.offsetWidth;
      mascota.classList.add("saludo");
      decirMascota(randomDe(FRASES[mascotaActual]));
      _contarClick();
    }

    mascotaImg.addEventListener("click", e => {
      if (e.pointerType === "touch" || _ultimoTap > 0) return;
      e.stopPropagation();
      _interactuar();
    });
    mascotaImg.addEventListener("touchstart", () => {
      _pressDisparo = false;
      _pressT = setTimeout(() => {
        _pressDisparo = true;
        abrirMascotaModal();
        snd("blip");
        try { navigator.vibrate?.(15); } catch {}
      }, 500);
    }, { passive: true });
    mascotaImg.addEventListener("touchend", e => {
      if (_pressT) { clearTimeout(_pressT); _pressT = null; }
      if (_pressDisparo) { _pressDisparo = false; return; }
      e.stopPropagation(); e.preventDefault();
      _ultimoTap = Date.now();
      setTimeout(() => { _ultimoTap = 0; }, 400);
      _interactuar();
    }, { passive: false });
    mascotaImg.addEventListener("touchmove", () => {
      if (_pressT) { clearTimeout(_pressT); _pressT = null; }
    }, { passive: true });

    let _pressMouseT = null;
    mascotaImg.addEventListener("mousedown", () => {
      _pressMouseT = setTimeout(() => { _pressDisparo = true; abrirMascotaModal(); snd("blip"); }, 500);
    });
    mascotaImg.addEventListener("mouseup", () => {
      if (_pressMouseT) { clearTimeout(_pressMouseT); _pressMouseT = null; }
      if (_pressDisparo) _pressDisparo = false;
    });
    mascotaImg.addEventListener("mouseleave", () => {
      if (_pressMouseT) { clearTimeout(_pressMouseT); _pressMouseT = null; }
      _pressDisparo = false;
    });
    mascota.addEventListener("contextmenu", e => { e.preventDefault(); abrirMascotaModal(); });

    qsa("[data-close-mascota]").forEach(el => el.addEventListener("click", cerrarMascotaModal));
    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarMascotaModal(); });

    const mModal = $("mascota-modal");
    if (mModal) {
      qs('[data-accion="mimos"]',   mModal)?.addEventListener("click", e => { e.stopPropagation(); hacerMimos(); });
      qs('[data-accion="dormir"]',  mModal)?.addEventListener("click", e => { e.stopPropagation(); dormir(); });
      qs('[data-accion="jugar"]',   mModal)?.addEventListener("click", e => { e.stopPropagation(); juegoGirasol(); });
      qs('[data-accion="tienda"]',  mModal)?.addEventListener("click", e => { e.stopPropagation(); window.Tienda?.abrir(); });
      qs('[data-accion="amistad"]', mModal)?.addEventListener("click", e => { e.stopPropagation(); abrirAmistad(); });
    }

    document.addEventListener("click", e => {
      const tab = e.target.closest("[data-mm-tab]");
      if (!tab) return;
      const target = tab.dataset.mmTab;
      const modal = tab.closest("#mascota-modal");
      if (!modal) return;
      qsa("[data-mm-tab]", modal).forEach(t => t.classList.toggle("active", t === tab));
      qsa("[data-mm-panel]", modal).forEach(p => p.classList.toggle("active", p.dataset.mmPanel === target));
      if (target === "tienda") { const embed = $("tienda-embed"); if (embed && window.Tienda?.montar) window.Tienda.montar(embed); }
      if (target === "inventario") renderInv?.();
    });

    dropEnMascota();
    setTimeout(() => decirMascota(`¡Hola${getNombre() ? " " + getNombre() : ""}! Soy tu ${MASCOTAS[mascotaActual].nombre.toLowerCase()}`), 1500);

    if (window._mascotaIntervals) window._mascotaIntervals.forEach(clearInterval);
    window._mascotaIntervals = [
      setInterval(() => { try { if (!mascotaBurbuja.classList.contains("visible")) decirMascota(randomDe(FRASES[mascotaActual])); } catch {} }, 45000),
      setInterval(() => { try { decaer(statsM); guardarStats(mascotaActual, statsM); actualizarModalMascota(); visual(); } catch {} }, 60000)
    ];
  }

  /* ============================================================
     MINIJUEGOS (3 del panel)
     ============================================================ */
  function crearOverlay(id, html) {
    document.getElementById(id)?.remove();
    const o = document.createElement("div");
    o.id = id; o.className = "minijuego-overlay";
    o.innerHTML = `<div class="minijuego-panel"><button class="minijuego-cerrar" data-close-juego>×</button>${html}</div>`;
    document.body.appendChild(o);
    o.addEventListener("click", e => {
      if (e.target === o || e.target.hasAttribute("data-close-juego")) { o.classList.remove("active"); setTimeout(() => o.remove(), 250); }
    });
    return o;
  }

  function juegoGirasol() {
    document.getElementById("juego-girasol-overlay")?.remove();
    const o = crearOverlay("juego-girasol-overlay", `
      <h2 class="minijuego-titulo">Atrapa el girasol</h2>
      <p class="minijuego-desc">Toca los girasoles antes de que se escapen</p>
      <div class="jg-hud">
        <div class="jg-hud-card"><span class="jg-hud-icon">${ICONO.girasol || ""}</span><div class="jg-hud-info"><span class="jg-hud-label">Puntos</span><strong id="jg-puntos">0</strong></div></div>
        <div class="jg-hud-card jg-hud-time"><span class="jg-hud-icon">${ICONO.calendario || ""}</span><div class="jg-hud-info"><span class="jg-hud-label">Tiempo</span><strong id="jg-tiempo">35s</strong></div></div>
      </div>
      <div class="jg-barra"><span id="jg-barra-fill"></span></div>
      <div class="jg-campo" id="jg-wrap"></div>
      <div class="jg-inicio" id="jg-inicio"><div class="jg-inicio-card"><div class="jg-inicio-emoji">${ICONO.girasol || ""}</div><h3>¿Listo para atrapar?</h3><p>Tienes <strong>35 segundos</strong>.<br>Los <strong>dorados</strong> valen <strong>3 puntos</strong></p><button type="button" class="btn-primary" id="jg-empezar">¡Empezar!</button></div></div>`);
    o.classList.add("active");
    const w = $("jg-wrap"), eP = $("jg-puntos"), eT = $("jg-tiempo"), barra = $("jg-barra-fill"), inicio = $("jg-inicio"), b = $("jg-empezar");
    const SPRITE = "img/girasol-loading.png";
    let act = false, pts = 0, t = 35, tk = null, st = null, finalizado = false;

    const sp = () => {
      if (!act || finalizado) return;
      const r = w.getBoundingClientRect(), s = 64;
      const x = Math.random() * Math.max(20, r.width - s - 20) + 10;
      const y = Math.random() * Math.max(20, r.height - s - 20) + 10;
      const dor = Math.random() < 0.12;
      const g = document.createElement("div");
      g.className = "jg-girasol" + (dor ? " jg-girasol-dorado" : "");
      g.style.left = x + "px"; g.style.top = y + "px";
      const img = document.createElement("img"); img.src = SPRITE; img.alt = "girasol";
      img.onerror = () => { img.style.display = "none"; };
      g.appendChild(img);
      const aura = document.createElement("span"); aura.className = "jg-girasol-aura"; g.appendChild(aura);
      g.dataset.pts = dor ? 3 : 1;
      const rc = ev => {
        ev.stopPropagation();
        if (!act || g.classList.contains("atrapado") || finalizado) return;
        g.classList.add("atrapado");
        const p = Number(g.dataset.pts); pts += p; eP.textContent = pts;
        const pp = document.createElement("span");
        pp.className = "minijuego-pop";
        pp.style.left = (x + s / 2) + "px"; pp.style.top = y + "px"; pp.textContent = "+" + p;
        w.appendChild(pp); setTimeout(() => pp.remove(), 800);
        snd(dor ? "moneda" : "atrapado");
        setTimeout(() => g.remove(), 400);
      };
      g.addEventListener("click", rc);
      g.addEventListener("touchstart", rc, { passive: true });
      w.appendChild(g);
      setTimeout(() => { if (!g.classList.contains("atrapado")) { g.classList.add("escapando"); setTimeout(() => g.remove(), 400); } }, 1000 + Math.random() * 500);
      st = setTimeout(sp, Math.max(200, 500 - (35 - t) * 5));
    };

    const term = () => {
      if (finalizado) return;
      finalizado = true; act = false;
      clearInterval(tk); clearTimeout(st);
      qsa(".jg-girasol", w).forEach(x => x.remove());
      const m = Math.max(1, Math.floor(pts / 2));
      const f = Math.min(20, Math.floor(pts / 2));
      darPremio(m, f, `¡Atrapaste ${pts} girasoles! +${m}`);
      const p = qs(".minijuego-panel", o);
      const r = document.createElement("div");
      r.className = "minijuego-mensaje";
      r.innerHTML = `<div class="jg-final-emoji">${pts >= 25 ? (ICONO.trofeo || "") : pts >= 15 ? (ICONO.estrella || "") : (ICONO.girasol || "")}</div><h2>${pts > 0 ? "¡Bien jugado!" : "¡Casi!"}</h2><p>Atrapaste</p><span class="minijuego-mensaje-num">${pts}</span><p>girasoles</p><p style="color:#ffd93d;font-weight:bold;">+${m} · +${f}</p><div class="minijuego-botones"><button type="button" class="btn-primary" id="jg-otra">Otra vez</button></div>`;
      p.appendChild(r);
      qs("#jg-otra", r).addEventListener("click", () => { o.remove(); setTimeout(juegoGirasol, 100); });
    };

    const emp = () => {
      act = true; pts = 0; t = 35; finalizado = false;
      inicio.classList.add("hidden");
      eP.textContent = "0"; eT.textContent = "35s"; barra.style.width = "100%";
      eT.classList.remove("urgente"); qsa(".jg-girasol", w).forEach(x => x.remove());
      for (let i = 0; i < 4; i++) setTimeout(sp, i * 200);
      tk = setInterval(() => {
        t--; eT.textContent = t + "s"; barra.style.width = (t / 35 * 100) + "%";
        eT.classList.toggle("urgente", t <= 10); barra.classList.toggle("urgente", t <= 10);
        if (t <= 0) term();
      }, 1000);
    };
    b.addEventListener("click", emp);
  }

  function juegoMemoria() {
    const ids = Object.keys(MASCOTAS).filter(desbloqueada);
    const pool = ids.length >= 8 ? ids : Object.keys(MASCOTAS);
    const eleg = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    const cart = [...eleg, ...eleg].sort(() => Math.random() - 0.5).map((id, i) => ({ id, key: i }));
    const o = crearOverlay("juego-memoria-overlay", `
      <h2 class="minijuego-titulo">Memoria de mascotas</h2>
      <p class="minijuego-desc">Encuentra las parejas — ¡40 segundos!</p>
      <div class="jm-hud">
        <div class="jm-hud-card"><span class="jm-hud-icon">${ICONO.estrella || ""}</span><div class="jm-hud-info"><span class="jm-hud-label">Parejas</span><strong><span id="jm-parejas">0</span> / ${eleg.length}</strong></div></div>
        <div class="jm-hud-card"><span class="jm-hud-icon">${ICONO.reintentar || ""}</span><div class="jm-hud-info"><span class="jm-hud-label">Intentos</span><strong id="jm-intentos">0</strong></div></div>
        <div class="jm-hud-card jm-hud-time"><span class="jm-hud-icon">${ICONO.calendario || ""}</span><div class="jm-hud-info"><span class="jm-hud-label">Tiempo</span><strong id="jm-tiempo">40s</strong></div></div>
      </div>
      <div class="jm-progreso"><span id="jm-progreso-fill"></span></div>
      <div class="memoria-grid jm-grid" id="jm-grid"></div>`);
    o.classList.add("active");
    const g = $("jm-grid"), eP = $("jm-parejas"), eI = $("jm-intentos"), eT = $("jm-tiempo"), barra = $("jm-progreso-fill");
    let pr = null, sg = null, bl = false, pa = 0, it = 0, tr = 40;

    const ivT = setInterval(() => {
      tr--;
      if (eT) { eT.textContent = tr + "s"; eT.classList.toggle("urgente", tr <= 10); }
      if (tr <= 0) { clearInterval(ivT); terminarPorTiempo(); }
    }, 1000);

    function terminarPorTiempo() {
      [...g.children].forEach(c => c.disabled = true);
      const m = Math.max(1, pa * 2);
      darPremio(m, 5, `¡Se acabó! ${pa}/${eleg.length} parejas`);
      const p = qs(".minijuego-panel", o), r = document.createElement("div");
      r.className = "minijuego-mensaje jm-final";
      r.innerHTML = `<div class="jg-final-emoji">${ICONO.reintentar || ""}</div><h2>¡Se acabó!</h2><p>Encontraste <strong>${pa}</strong> de <strong>${eleg.length}</strong> parejas</p><p style="color:#ffd93d;font-weight:bold;">+${m}</p><div class="minijuego-botones"><button type="button" class="btn-primary" id="jm-otra">Otra vez</button></div>`;
      p.appendChild(r);
      qs("#jm-otra", r).addEventListener("click", () => { o.remove(); juegoMemoria(); });
    }

    cart.forEach((c, i) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "memoria-carta jm-carta";
      el.dataset.id = c.id;
      el.dataset.index = i;
      el.innerHTML = `<span class="jm-carta-inner"><span class="jm-carta-cara jm-carta-atras"><span class="jm-carta-emoji">${ICONO.girasol || ""}</span></span><span class="jm-carta-cara jm-carta-frente"><img class="jm-carta-img" src="${MASCOTAS[c.id].imagen}" alt="${MASCOTAS[c.id].nombre}" loading="lazy"></span></span><span class="jm-carta-nombre">${MASCOTAS[c.id].nombre}</span>`;
      qs(".jm-carta-img", el).onerror = ev => { ev.target.style.display = "none"; };
      el.addEventListener("click", () => {
        if (bl || el.classList.contains("volteada") || el.classList.contains("emparejada")) return;
        el.classList.add("volteada");
        snd("blip");
        if (!pr) { pr = el; return; }
        if (pr === el) return;
        sg = el; it++; eI.textContent = it; bl = true;
        if (pr.dataset.id === sg.dataset.id) {
          setTimeout(() => {
            pr.classList.add("emparejada"); sg.classList.add("emparejada");
            pa++; eP.textContent = pa;
            barra.style.width = (pa / eleg.length * 100) + "%";
            snd("moneda");
            pr = sg = null; bl = false;
            if (pa === eleg.length) {
              clearInterval(ivT);
              const m = Math.max(5, 25 - it + Math.max(0, tr));
              darPremio(m, 15, `¡Memoria completada! +${m}`);
              const p = qs(".minijuego-panel", o), r = document.createElement("div");
              r.className = "minijuego-mensaje jm-final";
              r.innerHTML = `<div class="jg-final-emoji">${it <= 12 ? (ICONO.trofeo || "") : it <= 20 ? (ICONO.estrella || "") : (ICONO.imagen || "")}</div><h2>¡Lo lograste!</h2><p>En <strong>${it}</strong> intentos con <strong>${tr}s</strong> restantes</p><p style="color:#ffd93d;font-weight:bold;">+${m} · +15</p><div class="minijuego-botones"><button type="button" class="btn-primary" id="jm-otra">Otra vez</button></div>`;
              p.appendChild(r);
              qs("#jm-otra", r).addEventListener("click", () => { o.remove(); juegoMemoria(); });
            }
          }, 500);
        } else {
          setTimeout(() => { pr.classList.remove("volteada"); sg.classList.remove("volteada"); pr = sg = null; bl = false; }, 900);
        }
      });
      g.appendChild(el);
    });
  }

  function juegoAdivina() {
    const pool = Object.keys(MASCOTAS).filter(desbloqueada);
    const pf = pool.length >= 4 ? pool : Object.keys(MASCOTAS);
    const TOTAL = 20, SEG = 5, OPC = 6;
    let r = 0, a = 0, cor = "", racha = 0, timer = null, tr = SEG, bl = false, vidas = 2;
    const o = crearOverlay("juego-adivina-overlay", `
      <h2 class="minijuego-titulo">Adivina la mascota · Difícil</h2>
      <p class="minijuego-desc">¿Quién ha dicho esta frase? ¡Solo ${SEG}s por ronda y ${vidas} vidas!</p>
      <div class="ja-hud">
        <div class="ja-hud-card"><span class="ja-hud-icon">${ICONO.estrella || ""}</span><div class="ja-hud-info"><span class="ja-hud-label">Aciertos</span><strong id="ja-aciertos">0</strong></div></div>
        <div class="ja-hud-card"><span class="ja-hud-icon">${ICONO.nota || ""}</span><div class="ja-hud-info"><span class="ja-hud-label">Ronda</span><strong><span id="ja-ronda">1</span> / ${TOTAL}</strong></div></div>
        <div class="ja-hud-card ja-hud-racha"><span class="ja-hud-icon">${ICONO.fuego || ""}</span><div class="ja-hud-info"><span class="ja-hud-label">Racha</span><strong id="ja-racha">0</strong></div></div>
        <div class="ja-hud-card ja-hud-vidas"><span class="ja-hud-icon">${ICONO.corazon || ""}</span><div class="ja-hud-info"><span class="ja-hud-label">Vidas</span><strong id="ja-vidas">${vidas}</strong></div></div>
        <div class="ja-hud-card ja-hud-time2"><span class="ja-hud-icon">${ICONO.calendario || ""}</span><div class="ja-hud-info"><span class="ja-hud-label">Tiempo</span><strong id="ja-tiempo">${SEG}s</strong></div></div>
      </div>
      <div class="ja-progreso"><span id="ja-progreso-fill"></span></div>
      <div class="adivina-panel ja-panel">
        <div class="ja-burbuja"><div class="ja-burbuja-icono">${ICONO.chat || ""}</div><p class="adivina-frase ja-frase" id="ja-frase">Cargando...</p></div>
        <div class="adivina-sprite-wrap ja-sprite-wrap"><img class="adivina-sprite ja-sprite" id="ja-sprite" src="" alt=""><span class="ja-sprite-aura"></span></div>
        <div class="adivina-opciones ja-opciones" id="ja-opciones"></div>
      </div>`);
    o.classList.add("active");
    const eA = $("ja-aciertos"), eR = $("ja-ronda"), eRa = $("ja-racha"), eT = $("ja-tiempo"), eV = $("ja-vidas");
    const barra = $("ja-progreso-fill"), sprite = $("ja-sprite"), frase = $("ja-frase"), op = $("ja-opciones");
    const frases = pf.flatMap(id => (FRASES[id] || []).map(f => ({ id, frase: f })));
    let usadas = new Set();

    function nuevaFrase() {
      let n = 0, e;
      do { e = frases[Math.floor(Math.random() * frases.length)]; n++; } while (usadas.has(e.frase) && n < 50);
      usadas.add(e.frase);
      if (usadas.size > frases.length - 5) usadas.clear();
      return e;
    }
    function iniciarTimer() {
      clearInterval(timer);
      tr = SEG;
      if (eT) { eT.textContent = tr + "s"; eT.classList.remove("urgente"); }
      timer = setInterval(() => {
        tr--;
        if (eT) { eT.textContent = tr + "s"; eT.classList.toggle("urgente", tr <= 2); }
        if (tr <= 0) {
          clearInterval(timer);
          if (bl) return;
          bl = true; racha = 0; eRa.textContent = racha;
          vidas--; eV.textContent = vidas;
          snd("derrota");
          [...op.children].forEach(x => { x.disabled = true; if (x.dataset.id === cor) x.classList.add("correcta"); });
          setTimeout(() => { if (vidas <= 0) return term(); nR(); }, 1200);
        }
      }, 1000);
    }
    const nR = () => {
      r++;
      if (r > TOTAL) return term();
      bl = false;
      eR.textContent = r;
      barra.style.width = ((r - 1) / TOTAL * 100) + "%";
      const { id, frase: texto } = nuevaFrase();
      cor = id;
      frase.textContent = `"${texto}"`;
      sprite.src = MASCOTAS[cor].imagen;
      sprite.onerror = () => { sprite.style.display = "none"; };
      const dist = pf.filter(x => x !== cor).sort(() => Math.random() - 0.5).slice(0, OPC - 1);
      const ops = [...dist, cor].sort(() => Math.random() - 0.5);
      op.innerHTML = "";
      ops.forEach((id2, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "adivina-opcion ja-opcion"; b.dataset.id = id2;
        b.innerHTML = `<span class="ja-opcion-letra">${String.fromCharCode(65 + i)}</span><span class="ja-opcion-nombre">${MASCOTAS[id2].nombre}</span>`;
        b.addEventListener("click", () => resp(b, id2));
        op.appendChild(b);
      });
      iniciarTimer();
    };
    const resp = (b, id) => {
      if (bl) return;
      bl = true;
      clearInterval(timer);
      if (id === cor) {
        b.classList.add("correcta"); a++; eA.textContent = a;
        const bonus = tr >= SEG / 2 ? 3 : 1;
        racha += bonus; eRa.textContent = racha;
        snd("moneda");
      } else {
        b.classList.add("incorrecta");
        racha = 0; eRa.textContent = racha;
        vidas--; eV.textContent = vidas;
        snd("derrota");
        [...op.children].forEach(x => { if (x.dataset.id === cor) x.classList.add("correcta"); });
      }
      [...op.children].forEach(x => x.disabled = true);
      setTimeout(() => { if (vidas <= 0) return term(); nR(); }, 1100);
    };
    const term = () => {
      clearInterval(timer);
      const m = a * 3 + Math.floor(racha / 3);
      darPremio(m, Math.min(20, a * 2), `¡${a}/${TOTAL} aciertos! +${m}`);
      const p = qs(".minijuego-panel", o), rr = document.createElement("div");
      rr.className = "minijuego-mensaje ja-final";
      const nivel = a >= 17 ? "¡Perfecto!" : a >= 13 ? "¡Excelente!" : a >= 8 ? "¡Bien!" : "¡Sigue así!";
      rr.innerHTML = `<div class="jg-final-emoji">${a >= 17 ? (ICONO.trofeo || "") : a >= 13 ? (ICONO.estrella || "") : a >= 8 ? (ICONO.corazon || "") : (ICONO.girasol || "")}</div><h2>${nivel}</h2><p>Acertaste</p><span class="minijuego-mensaje-num">${a} / ${TOTAL}</span><p style="color:#ffd93d;font-weight:bold;">+${m}</p><div class="minijuego-botones"><button type="button" class="btn-primary" id="ja-otra">Otra vez</button></div>`;
      p.appendChild(rr);
      qs("#ja-otra", rr).addEventListener("click", () => { o.remove(); juegoAdivina(); });
    };
    nR();
  }

  /* ============================================================
     GRID MASCOTAS
     ============================================================ */
  function renderGrid() {
    const g = $("mascotas-grid"), e = $("mascotas-empty");
    if (!g) return;
    const act = localStorage.getItem("mascota_actual") || "mapache";
    g.innerHTML = "";
    let cnt = 0;
    Object.keys(MASCOTAS).forEach(id => {
      const info = MASCOTAS[id], ok = desbloqueada(id), comprable = esComprable(id);
      if (ok) cnt++;
      const c = document.createElement("article");
      c.className = "mascota-card " + (ok ? "desbloqueada" : "bloqueada");
      if (id === act && ok) c.classList.add("activa");
      if (!ok) { const l = document.createElement("span"); l.className = "mascota-card-lock"; l.innerHTML = ICONO.candado || ""; c.appendChild(l); }
      if (id === act && ok) { const b = document.createElement("span"); b.className = "mascota-card-activa-badge"; b.textContent = "✓"; c.appendChild(b); }
      const im = document.createElement("img");
      im.className = "mascota-card-img"; im.alt = info.nombre; im.loading = "lazy"; im.decoding = "async";
      im.onerror = () => { im.onerror = null; im.src = "img/girasol-loading.png"; };
      im.src = info.imagen;
      const h = document.createElement("h3"); h.className = "mascota-card-nombre"; h.textContent = info.nombre;
      const p = document.createElement("p");  p.className = "mascota-card-desc";
      const b = document.createElement("button");
      b.type = "button"; b.className = "mascota-card-btn";
      const d = DESBLOQUEO[id];
      if (!ok) {
        if (comprable && d) { p.textContent = `Desbloquea al nivel ${d.reqNivel}`; b.textContent = `${d.precio} 🪙 Comprar`; b.disabled = getNivel() < d.reqNivel; b.addEventListener("click", () => { if (comprarMascota(id)) renderGrid(); }); }
        else { p.textContent = "Aún no desbloqueada"; b.textContent = "Bloqueada"; b.disabled = true; }
      }
      else if (id === act) { p.textContent = "Te acompaña"; b.textContent = "En uso"; b.classList.add("activo"); }
      else { p.textContent = "Disponible"; b.textContent = "Usar"; b.addEventListener("click", () => { localStorage.setItem("mascota_actual", id); window.location.reload(); }); }
      c.append(im, h, p, b);
      g.appendChild(c);
    });
    if (e) e.classList.toggle("hidden", cnt > 0);
  }
  window._renderMascotasGrid = renderGrid;

  $("btn-juego-girasol")?.addEventListener("click", juegoGirasol);
  $("btn-juego-memoria")?.addEventListener("click", juegoMemoria);
  $("btn-juego-adivina")?.addEventListener("click", juegoAdivina);
  setTimeout(renderGrid, 600);
  window.addEventListener("sunadventures:progress", renderGrid);
  window.addEventListener("sunadventures:user-ready", () => setTimeout(renderGrid, 400));

  /* ---------- Hidratar iconos ---------- */
  function hidratarIconos(root = document) {
    qsa("[data-icono]", root).forEach(el => {
      const k = el.dataset.icono;
      if (ICONO[k] && !qs("svg", el)) el.innerHTML = ICONO[k];
    });
  }
  window.hidratarIconos = hidratarIconos;
  hidratarIconos();

  let _hidraPend = false;
  const _hidraCola = new Set();
  const _hidraFlush = () => {
    _hidraPend = false;
    _hidraCola.forEach(n => { try { hidratarIconos(n); } catch {} });
    _hidraCola.clear();
  };
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) _hidraCola.add(n);
    if (!_hidraPend && _hidraCola.size) { _hidraPend = true; requestAnimationFrame(_hidraFlush); }
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- Mostrar contraseña ---------- */
  qsa("[data-toggle-pass]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.togglePass);
      if (!input) return;
      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      btn.classList.toggle("visible", mostrar);
    });
  });

  /* ---------- Modal descarga app ---------- */
  qsa('[data-action="descargar"]').forEach(b => b.addEventListener("click", abrirDescarga));
  function abrirDescarga() {
    try {
      const m = document.createElement("div");
      m.className = "modal active";
      m.setAttribute("aria-hidden", "false");
      m.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal-content"><h3 class="modal-title">Descargar SunAdventures</h3><p style="opacity:.8;margin-bottom:.5rem">Llévanos contigo a todas partes</p><div class="download-grid"><a class="download-option" href="app/sunadventures.apk" download><span class="download-option-icon">${SVG.android}</span><span class="download-option-title">Android</span><span class="download-option-hint">Descargar APK</span></a><button class="download-option" data-platform="ios" type="button"><span class="download-option-icon">${SVG.apple}</span><span class="download-option-title">iOS</span><span class="download-option-hint">Añadir a inicio</span></button><button class="download-option" data-platform="windows" type="button"><span class="download-option-icon">${SVG.windows}</span><span class="download-option-title">Windows</span><span class="download-option-hint">Próximamente</span></button><button class="download-option" data-platform="linux" type="button"><span class="download-option-icon">${SVG.linux}</span><span class="download-option-title">Linux</span><span class="download-option-hint">Próximamente</span></button></div><div class="modal-actions" style="margin-top:1.2rem"><button type="button" class="btn-secondary" data-close>Cerrar</button></div></div>`;
      document.body.appendChild(m);
      document.body.style.overflow = "hidden";
      const c = () => { m.remove(); document.body.style.overflow = ""; };
      qsa("[data-close]", m).forEach(el => el.addEventListener("click", c));
      const a = { ios:"Ábrela en Safari → Compartir → Añadir a pantalla de inicio", windows:"Próximamente", linux:"Próximamente" };
      qsa("[data-platform]", m).forEach(b => b.addEventListener("click", () => alert(a[b.dataset.platform])));
    } catch {}
  }

  /* ---------- PWA ---------- */
  try {
    if ("serviceWorker" in navigator)
      window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(e => console.warn("SW:", e)));
  } catch {}

  /* ---------- Recuperar contraseña ---------- */
  (function initRecuperar() {
    const modal = $("recuperar-modal"); if (!modal) return;
    let usuario = "", codigo = "";
    const mostrarPaso = p => {
      qsa(".recuperar-paso", modal).forEach(el => el.classList.toggle("active", el.dataset.paso === String(p)));
      qsa(".recuperar-error", modal).forEach(e => e.textContent = "");
    };
    const mostrarError = (id, msg) => { const el = $(id); if (el) el.textContent = msg || ""; };
    const abrir = () => {
      usuario = ""; codigo = "";
      ["recuperar-usuario", "recuperar-codigo", "recuperar-pass1", "recuperar-pass2"].forEach(id => { const el = $(id); if (el) el.value = ""; });
      qs(".recuperar-codigo-info", modal)?.remove();
      mostrarPaso(1);
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(() => $("recuperar-usuario")?.focus(), 100);
    };
    const cerrar = () => { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };

    $("recuperar-btn-1")?.addEventListener("click", async () => {
      const u = $("recuperar-usuario")?.value.trim().toLowerCase();
      if (!u || !/^[a-z0-9_-]{3,20}$/.test(u)) return mostrarError("recuperar-error-1", "Usuario inválido (3-20 letras, números, _ o -).");
      usuario = u;
      const btn = $("recuperar-btn-1"); btn.disabled = true; btn.textContent = "Generando...";
      try {
        const { data, error } = await window._supabase.functions.invoke("reset-password", { body:{ action:"solicitar", usuario } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (!data.codigo) throw new Error("Este usuario no existe.");
        mostrarPaso(2);
        const cont = qs('[data-paso="2"]', modal);
        qs(".recuperar-codigo-info", cont)?.remove();
        const info = document.createElement("p");
        info.className = "recuperar-error recuperar-codigo-info";
        info.style.cssText = "background:rgba(255,217,61,.15);border-left-color:#ffd93d;color:#8b6914;font-weight:bold;font-size:.9rem;text-align:center;letter-spacing:.2em;display:block;";
        info.textContent = "Código: " + data.codigo;
        cont.insertBefore(info, qs(".form-field", cont));
        setTimeout(() => $("recuperar-codigo")?.focus(), 100);
      } catch (err) { mostrarError("recuperar-error-1", err.message || "No se pudo generar el código."); }
      finally { btn.disabled = false; btn.textContent = "Generar código"; }
    });

    $("recuperar-btn-2")?.addEventListener("click", () => {
      const c = $("recuperar-codigo")?.value.trim();
      if (!c || !/^\d{6}$/.test(c)) return mostrarError("recuperar-error-2", "El código debe tener 6 dígitos.");
      codigo = c;
      mostrarPaso(3);
      setTimeout(() => $("recuperar-pass1")?.focus(), 100);
    });

    $("recuperar-btn-3")?.addEventListener("click", async () => {
      const p1 = $("recuperar-pass1")?.value || "";
      const p2 = $("recuperar-pass2")?.value || "";
      if (p1.length < 6) return mostrarError("recuperar-error-3", "La contraseña debe tener al menos 6 caracteres.");
      if (p1 !== p2) return mostrarError("recuperar-error-3", "Las contraseñas no coinciden.");
      const btn = $("recuperar-btn-3"); btn.disabled = true; btn.textContent = "Cambiando...";
      try {
        const { data, error } = await window._supabase.functions.invoke("reset-password", { body:{ action:"confirmar", usuario, codigo, nuevaPassword:p1 } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        mostrarPaso("ok");
      } catch (err) { mostrarError("recuperar-error-3", err.message || "No se pudo cambiar."); }
      finally { btn.disabled = false; btn.textContent = "Cambiar contraseña"; }
    });

    $("recuperar-volver-1")?.addEventListener("click", () => mostrarPaso(1));
    $("recuperar-volver-2")?.addEventListener("click", () => mostrarPaso(2));
    qsa("[data-close-recuperar]", modal).forEach(el => el.addEventListener("click", cerrar));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("active")) cerrar(); });
    $("auth-forgot-link")?.addEventListener("click", e => { e.preventDefault(); abrir(); });
    qsa("[data-toggle-pass]", modal).forEach(btn => {
      btn.addEventListener("click", () => {
        const input = $(btn.dataset.togglePass);
        if (!input) return;
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        btn.classList.toggle("visible", mostrar);
      });
    });
  })();

  /* ============================================================
     API PÚBLICA
     ============================================================ */
  window._TiendaAPI = {
    ICONO, TIENDA_ITEMS, COMIDAS, SKINS, MASCOTAS,
    getMonedas, setMonedas, getSkinsC, setSkinsC, getSkinsE, setSkinsE,
    cargarInv, guardarInv,
    notifMascota: (t, txt) => { try { notifMascota(t, txt, 2500); } catch {} },
    aplicarSkins: () => { try { window._aplicarSkins?.(); } catch {} },
    getUserId
  };
  window._MASCOTAS = MASCOTAS;
  window._FRASES = FRASES;
  window._COMIDAS = COMIDAS;
  window._SKINS = SKINS;
  window._TIENDA_ITEMS = TIENDA_ITEMS;

  function getBonusActivos() {
    try {
      const userId = getUserId();
      const mascotaActual = localStorage.getItem("mascota_actual") || "mapache";
      const eq = JSON.parse(localStorage.getItem(`mascota_skins_eq_${userId}_${mascotaActual}`) || "{}");
      const SL = { ...TIENDA_ITEMS.cabeza, ...TIENDA_ITEMS.cuello, ...TIENDA_ITEMS.ojos, ...TIENDA_ITEMS.fondos, ...TIENDA_ITEMS.efectos };
      const activos = [];
      Object.values(eq).forEach(id => { const s = SL[id]; if (s && s.bonus) activos.push(s.bonus); });
      return activos;
    } catch { return []; }
  }
  window._getBonusActivos = getBonusActivos;
  window._darPremio = darPremio;
  window._snd = snd;
  window._setMonedas = setMonedas;
  window._getMonedas = getMonedas;
  window._desbloqueada = desbloqueada;
  window._esComprable = esComprable;
  window._comprarMascota = comprarMascota;
  window._getUserId = getUserId;
  window._registrarMinijuego = () => {
    const u = getUserId();
    setNumLS(`sa_minijuegos_jugados_${u}`, numLS(`sa_minijuegos_jugados_${u}`) + 1);
    window.dispatchEvent(new Event("sunadventures:progress"));
  };

  /* ---------- Aplicar tema de fondo comprado ---------- */
  const TEMAS_FONDO = [
    "tema-fondo-noche","tema-fondo-arcoiris","tema-fondo-fuego",
    "tema-fondo-bosque","tema-fondo-oceano","tema-fondo-desierto",
    "tema-fondo-aurora","tema-fondo-sakura","tema-fondo-cyberpunk",
    "tema-fondo-tormenta"
  ];
  window._aplicarTemaFondo = function () {
    try {
      document.body.classList.remove(...TEMAS_FONDO);
      const userId = getUserId();
      const mascota = localStorage.getItem("mascota_actual") || "mapache";
      const eq = JSON.parse(localStorage.getItem(`mascota_skins_eq_${userId}_${mascota}`) || "{}");
      const fondoId = eq.fondos;
      if (!fondoId) return;
      const f = TIENDA_ITEMS.fondos?.[fondoId];
      if (f?.bonus?.tipo?.startsWith("tema_")) {
        const clase = "tema-fondo-" + f.bonus.tipo.replace("tema_", "");
        document.body.classList.add(clase);
      }
    } catch (e) { console.warn("_aplicarTemaFondo:", e); }
  };
  try { window._aplicarTemaFondo(); } catch {}

  window.dispatchEvent(new Event("sunadventures:api-ready"));

  /* ---------- Contadores extra ---------- */
  window.addEventListener("sunadventures:tienda-compra", () => {
    const u = getUserId();
    setNumLS(`sa_tienda_compras_${u}`, numLS(`sa_tienda_compras_${u}`) + 1);
  });
  setInterval(() => {
    const u = getUserId();
    const actual = getMonedas();
    if (actual > numLS(`sa_monedas_max_${u}`)) setNumLS(`sa_monedas_max_${u}`, actual);
  }, 5000);

  Object.entries(SKINS).forEach(([id, s]) => {
    if (s.icono && !ICONO[s.icono]) console.warn(`[Skin] ${id}: icono "${s.icono}" no existe en ICONO`);
  });

  window.addEventListener("sunadventures:inventario-refresh", () => { try { window._renderInv?.(); } catch {} });
  window.addEventListener("sunadventures:tienda-compra", () => {
    try {
      const embed = $("tienda-embed");
      if (embed && window.Tienda?.render) window.Tienda.render();
      window._actualizarModalMascota?.();
    } catch {}
  });
  window.addEventListener("sunadventures:perfil-actualizado", () => {
    try { window._aplicarTemaFondo?.(); } catch {}
  });

  console.log("✅ script.js v5 cargado (getNivel hoisteada)");
});