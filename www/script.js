document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // ---------- SVG ----------
  const SVG = {
    heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14"/></svg>',
    android: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 9v8a1 1 0 0 0 1 1h1v3a1 1 0 0 0 2 0v-3h4v3a1 1 0 0 0 2 0v-3h1a1 1 0 0 0 1-1V9H6zM4 9a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zm16 0a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-5a1 1 0 0 0-1-1zM8.5 5.5l-1-1.7a.3.3 0 0 1 .5-.3l1 1.7a5 5 0 0 1 6 0l1-1.7a.3.3 0 0 1 .5.3l-1 1.7A5 5 0 0 1 18 9H6a5 5 0 0 1 2.5-3.5zM8.5 7.5a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2zm7 0a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12.5c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.8c-1.6 0-3.2.9-4 2.4-1.7 3-.4 7.4 1.2 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.8 1.3-2.8s-2.5-1-2.7-3.9zM14.5 5.2c.7-.8 1.1-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z"/></svg>',
    windows: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5l7.5-1v7H3v-6zm0 13l7.5 1v-7H3v6zm8.5 1.2L21 21V12.5h-9.5v7.2zm0-15.4v7.2H21V3l-9.5 1.3z"/></svg>',
    linux: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c-2.2 0-4 1.8-4 4 0 1.2.5 2.2 1.3 2.9C8.2 9.6 7 11 6.3 12.9c-.2.5-.8 1.9-1.4 3.2-.5 1.2-.9 2.4-.5 3 .3.5 1 .7 1.8.6.7 0 1.5-.2 2.2-.5.6-.3 1.5-.5 2.6-.5h2c1.1 0 2 .2 2.6.5.7.3 1.5.5 2.2.5.8.1 1.5-.1 1.8-.6.4-.6 0-1.8-.5-3-.6-1.3-1.2-2.7-1.4-3.2-.7-1.9-1.9-3.3-3-4 .8-.7 1.3-1.7 1.3-2.9 0-2.2-1.8-4-4-4zm-1.5 4.5c-.4 0-.8-.4-.8-.9s.4-.9.8-.9.8.4.8.9-.4.9-.8.9zm3 0c-.4 0-.8-.4-.8-.9s.4-.9.8-.9.8.4.8.9-.4.9-.8.9zM10.3 9c.4.2.9.3 1.7.3s1.3-.1 1.7-.3c-.3.5-1 .8-1.7.8s-1.4-.3-1.7-.8z"/></svg>'
  };

  const getUserId = () => window._sunUserId || localStorage.getItem("sunadventures_uid") || "local";
  const randomDe = (arr) => (Array.isArray(arr) && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : "";
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

  // ============================================
  //  GIRASOL INTERACTIVO
  // ============================================
  try {
    const girasol = document.querySelector(".girasol-wrapper");
    const pop = $("pop");
    const burbuja = document.querySelector(".burbuja");
    if (girasol && pop) {
      pop.volume = 0.4;
      const frases = [
        "Mi lugar favorito 🌻", "Contigo hasta el infinito ✨", "Cada día te elijo 💫",
        "Eres mi casualidad más bonita 💖", "Mi persona favorita en el mundo 🌍",
        "Gracias por existir 🥹", "Siempre tú, siempre yo, siempre nosotros 💌", "Te pensé, y apareciste ✨"
      ];
      girasol.addEventListener("mouseenter", () => {
        pop.currentTime = 0; pop.play().catch(() => {});
        if (burbuja) burbuja.textContent = randomDe(frases);
      });
      girasol.addEventListener("click", (e) => {
        for (let i = 0; i < 5; i++) {
          const h = document.createElement("div");
          h.innerHTML = SVG.heart;
          h.style.cssText = `position:absolute;pointer-events:none;width:1.5rem;height:1.5rem;color:#a684f0;animation:heartFloat 1.5s ease-out forwards;animation-delay:${i * 0.05}s;left:${e.offsetX + (Math.random() - 0.5) * 40}px;top:${e.offsetY + (Math.random() - 0.5) * 40}px;--dx:${(Math.random() - 0.5) * 80}px`;
          girasol.appendChild(h);
          setTimeout(() => h.remove(), 1800);
        }
      });
    }
  } catch (err) { console.warn("Girasol init:", err); }

  // ============================================
  //  TOGGLE TEMA
  // ============================================
  try {
    const toggle = $("theme-toggle");
    if (toggle) {
      const themeIcon = toggle.querySelector(".theme-icon") || toggle;
      const pintar = () => themeIcon.innerHTML = document.body.classList.contains("light") ? SVG.sun : SVG.moon;
      pintar();
      toggle.addEventListener("click", () => { document.body.classList.toggle("light"); pintar(); });
    }
  } catch (err) { console.warn("Toggle tema:", err); }

  // ============================================
  //  DEFINICIONES
  // ============================================
  const MASCOTAS = {
    mapache: {
      nombre: "Mapache", imagen: "img/mapache.png", imagenDormida: "img/mapache-dormido.png",
      sonido: "chitter", favorita: "pizza",
      desbloqueo: { tipo: "inicial" },
      frases: {
        general: ["¡Hola! Soy tu mapache", "¿Vemos los recuerdos?", "¡Qué bonito todo!", "Ñam ñam...", "¡Súbeme una foto!", "Te acompaño siempre", "¿Un abrazo?", "¡Me encanta este rincón!"],
        mañana: ["¡Buenos días!", "¿Desayunamos?", "Empezamos el día juntos 🌅"],
        tarde: ["¡Qué calor!", "¿Una siesta?", "Tarde de aventuras ☀️"],
        noche: ["Buenas noches", "Zzz...", "Que sueñes bonito 🌙"],
        hambriento: ["Tengo hambre...", "¿Me das algo? 🍎", "Mi pancita suena"],
        feliz: ["¡Te quiero!", "¡Qué bien me siento!", "¡Soy el mapache más feliz!"],
        triste: ["Hace tiempo que no vienes...", "Te extraño", "¿Me has olvidado?"],
        durmiendo: ["Zzz...", "Déjame dormir...", "Shhh... 😴"],
        comidaFavorita: ["¡PIZZA! ¡Mi favorita! 🍕", "¡Ñam ñam pizza!", "¡Eres el mejor!"],
        comidaNormal: ["¡Gracias por la comida!", "Ñam ñam...", "¡Qué rico!"],
        minijuegoGana: ["¡SOMOS CAMPEONES! 🏆", "¡Qué reflejos!", "¡Otra vez, porfa!"],
        minijuegoPierde: ["Casi... ¡otra vez!", "¡Casi lo logramos!", "¡Vamos de nuevo!"]
      }
    },
    girasol: {
      nombre: "Girasol", imagen: "img/mascota-girasol.png", sonido: "twinkle", favorita: "agua",
      desbloqueo: { tipo: "nivel", nivel: 2 },
      frases: {
        general: ["¡Hola!", "Te doy la bienvenida", "Eres mi luz del sol", "¡Qué día tan bonito!", "¿Bailamos?", "¡Sonríe!", "Te quiero mucho", "Siempre mirando al sol", "¡Qué calorcito!"],
        mañana: ["¡Buenos días! Amanece contigo 🌻", "El sol ya está aquí ☀️"],
        tarde: ["¡Qué luz tan rica!", "Cargando energía solar 🌞"],
        noche: ["Voy a cerrar mis pétalos 💤", "Buenas noches, lucecita 🌙"],
        hambriento: ["Necesito agua... 💧", "Un poquito de sol, porfa ☀️"],
        feliz: ["¡Estoy radiante!", "¡Brillo contigo! ✨"],
        triste: ["Me falta luz...", "Vuelve pronto 🌻"],
        durmiendo: ["Zzz... fotosíntesis...", "Soñando con el sol 💤"],
        comidaFavorita: ["¡AGUA! ¡Justo lo que necesitaba! 💧", "¡Ah, qué frescura!"],
        comidaNormal: ["¡Gracias! 🌻", "Mmm... delicioso"],
        minijuegoGana: ["¡Brillé como el sol! ☀️", "¡Qué reflejos!"],
        minijuegoPierde: ["Casi, casi 🌻", "¡Otra oportunidad!"]
      }
    },
    gatito: {
      nombre: "Armstrong", imagen: "img/gatito.png", sonido: "meow", favorita: "pescado",
      desbloqueo: { tipo: "logro", id: "fotografos" },
      frases: {
        general: ["¡Miau! Soy Armstrong", "¿Me das mimos?", "Miau miau...", "Soy Armstrong, el gatito negro", "¿Un ratito juntos?", "Ronroneo activado", "Tengo ojitos dorados", "¡Miau! ¿Jugamos?", "Te quiero mucho", "Miau elegante y misterioso"],
        mañana: ["Miau... cinco minutitos más 😴", "Buenos días, humano ☀️"],
        tarde: ["Miau. Hora de la siesta 🐾", "¿Jugamos con la lana?"],
        noche: ["Miau. La noche es mía 🐈‍⬛", "Buenas noches, ronroneo para ti 🌙"],
        hambriento: ["Miau... tengo hambre 🐟", "¿Atún? Por favorrr"],
        feliz: ["Purrrr... ¡eres el mejor!", "Ronroneo de felicidad 😻"],
        triste: ["Miau... estoy solito", "Ven a acariciarme 🥺"],
        durmiendo: ["Zzz... ronroneando...", "Miau... cinco minutitos 💤"],
        comidaFavorita: ["¡MIAU! ¡Pescado! 🐟", "¡Purrrr, gracias!"],
        comidaNormal: ["Miau, gracias 🐾", "Ñam ñam..."],
        minijuegoGana: ["¡MIAU! ¡Gané! 🐾", "¡Soy el mejor cazador!"],
        minijuegoPierde: ["Miau... casi", "¡Otra vez!"]
      }
    },
    hamburguesa: {
      nombre: "Hamburguesa", imagen: "img/hamburguesa.png", sonido: "crunch", favorita: "pizza",
      desbloqueo: { tipo: "logro", id: "dj" },
      frases: {
        general: ["¡Hola!", "¿Tenemos hambre?", "Soy la más rica", "Con queso y todo", "Ñam ñam ñam...", "¿Me pides?", "¡Qué rica estoy!", "Un mordisco y feliz", "¡A comer!"],
        mañana: ["¡Desayuno! ☀️", "Con bacon, porfa"],
        tarde: ["¿Merienda? 🍔", "¡Hora del snack!"],
        noche: ["Cena ligera... o no 🌙", "¿Una de madrugada?"],
        hambriento: ["¡Tengo hambre!", "¡Cómeme ya! 🍔"],
        feliz: ["¡Soy la más feliz!", "¡Ñam ñam de alegría!"],
        triste: ["Me estoy enfriando...", "Nadie me quiere comer 🥺"],
        durmiendo: ["Zzz... con queso...", "Sueño con bacon 💤"],
        comidaFavorita: ["¡PIZZA! ¡Colega de plato! 🍕", "¡Ñam ñam!"],
        comidaNormal: ["¡Gracias! 🍔", "Mmm... rica"],
        minijuegoGana: ["¡Ñam ñam, gané! 🍔", "¡Qué rico premio!"],
        minijuegoPierde: ["Casi... 🍔", "¡Otra ronda!"]
      }
    },
    oveja: {
      nombre: "Oveja", imagen: "img/oveja.png", sonido: "baa", favorita: "manzana",
      desbloqueo: { tipo: "logro", id: "racha" },
      frases: {
        general: ["¡Beee!", "Soy muy suave", "¿Cuentas ovejitas?", "¡Qué sueñito!", "Soy de lana suavecita", "¡Beee!", "Te hago compañía", "¿Nos dormimos?", "Sueña bonito"],
        mañana: ["¡Beee! Buenos días ☀️", "A pastar se ha dicho"],
        tarde: ["Beee... calorcito 🐑", "Siesta entre nubes ☁️"],
        noche: ["¡Beee! A dormir 🌙", "Cuenta ovejitas... empieza por mí 💤"],
        hambriento: ["Beee... pasto, porfa 🌱", "Tengo hambre 🐑"],
        feliz: ["¡Beee de felicidad!", "¡Soy la oveja más feliz! ☁️"],
        triste: ["Beee... me siento sola", "Ven a abrazarme 🥺"],
        durmiendo: ["Zzz... beee...", "Soñando con prados 💤"],
        comidaFavorita: ["¡Beee! ¡MANZANA! 🍎", "¡Qué rica, beee!"],
        comidaNormal: ["Beee, gracias 🐑", "Ñam ñam..."],
        minijuegoGana: ["¡Beee! ¡Gané! 🐑", "¡Qué emoción!"],
        minijuegoPierde: ["Beee... casi", "¡Otra vez!"]
      }
    },
    pollito: {
      nombre: "Pollito", imagen: "img/pollito.png", sonido: "peep", favorita: "semillas",
      desbloqueo: { tipo: "logro", id: "poetas" },
      frases: {
        general: ["¡Pío pío!", "¡Hola!", "Soy un pollito", "¡Qué bonito día!", "¿Jugamos?", "Pío pío pío", "¡Tengo hambre!", "Te quiero mucho"],
        mañana: ["¡Pío pío! ¡Amanece! 🌅", "¡Primer gusanito del día!"],
        tarde: ["Pío... hora de la siesta 🐣", "¡Pío! ¿Jugamos?"],
        noche: ["Pío pío... a dormir 🌙", "Bajo el ala de mamá 💤"],
        hambriento: ["¡Pío! ¡Gusanito, porfa! 🐛", "¡Tengo mucha hambre!"],
        feliz: ["¡Pío pío de alegría!", "¡Soy el pollito más feliz! 🐥"],
        triste: ["Pío... estoy tristito", "Ven a jugar conmigo 🥺"],
        durmiendo: ["Pío... zzz...", "Soñando con gusanitos 💤"],
        comidaFavorita: ["¡PÍO! ¡SEMILLITAS! 🌾", "¡Qué ricas!"],
        comidaNormal: ["¡Pío, gracias! 🐥", "Ñam ñam"],
        minijuegoGana: ["¡PÍO PÍO! ¡Gané! 🐥", "¡Qué rápido soy!"],
        minijuegoPierde: ["Pío... casi", "¡Otra vez!"]
      }
    },
    jirafa: {
      nombre: "Jirafa", imagen: "img/jirafa.png", sonido: "blip", favorita: "manzana",
      desbloqueo: { tipo: "logro", id: "trotamundos" },
      frases: {
        general: ["¡Hola!", "Soy altísima", "Veo todo desde aquí arriba", "¿Me das una hoja?", "¡Qué cuello más largo!", "Tengo manchitas bonitas", "Hola desde las nubes", "Te veo desde muy lejos", "¡Un abrazo largoooo!"],
        mañana: ["Veo el amanecer desde arriba 🌅", "¡Buenos días desde las nubes!"],
        tarde: ["Hace sol aquí arriba ☀️", "La mejor vista del mundo 👀"],
        noche: ["Veo las estrellas de cerca ✨", "Buenas noches desde el cielo 🌙"],
        hambriento: ["Necesito hojas de árbol 🌿", "Mi pancita larga tiene hambre"],
        feliz: ["¡Soy la jirafa más feliz!", "Te veo y sonrío 😊"],
        triste: ["Me siento pequeñita...", "Ven a darme un abrazo largo 🥺"],
        durmiendo: ["Zzz... cuello relajado...", "Soñando con acacias 💤"],
        comidaFavorita: ["¡MANZANA! ¡Mi favorita! 🍎", "¡Qué rica!"],
        comidaNormal: ["Gracias desde arriba 🦒", "Ñam ñam"],
        minijuegoGana: ["¡Veo todo desde arriba y gané! 🦒", "¡Fácil!"],
        minijuegoPierde: ["Casi... 🦒", "¡Otra ronda!"]
      }
    },
    unicornio: {
      nombre: "Unicornio", imagen: "img/unicornio.png", sonido: "sparkle", favorita: "cupcake",
      desbloqueo: { tipo: "logro", id: "racha-365" },
      frases: {
        general: ["¡Hola!", "Soy mágico", "Ay mis hielitos", "Roaf, roaf", "Tenkiu, tenkiu, tenkiu", "Soy tierno y mágico", "¡Abracadabra!", "Vengo del arcoíris", "Hago magia a tu lado"],
        mañana: ["¡Buenos días! ✨", "El arcoíris madrugó conmigo"],
        tarde: ["Magia de tarde 🌈", "¡Un deseo se cumplió!"],
        noche: ["Estrellas y purpurina 🌙", "Buenas noches mágicas ✨"],
        hambriento: ["Necesito magia dulce 🍬", "¡Un cupcake de arcoíris!"],
        feliz: ["¡Magia pura de felicidad!", "¡Hago brillar tus días! ✨"],
        triste: ["Mi cuerno perdió brillo...", "Necesito un abracito mágico 🥺"],
        durmiendo: ["Zzz... soñando con unicornios...", "Magia dormilona 💤"],
        comidaFavorita: ["¡CUPCAKE MÁGICO! 🧁", "¡Delicioso! ✨"],
        comidaNormal: ["¡Gracias! ✨", "Ñam ñam mágico"],
        minijuegoGana: ["¡MAGIA PURA! ✨", "¡Soy leyenda!"],
        minijuegoPierde: ["Casi, casi ✨", "¡Otra vez!"]
      }
    },
    conejo: {
      nombre: "Conejito", imagen: "img/conejito.png", sonido: "hop", favorita: "zanahoria",
      desbloqueo: { tipo: "logro", id: "clics-mapache" },
      frases: {
        general: ["¡Hola!", "¿Te apetece dar un salto?", "¡Ay, brinquemos, brinquemos!", "¿Y esa zanahoria?", "Ay unicornio, qué bonito cuerno tienes", "Me encanta estar contigo", "¿Nos damos un paseo?", "Dame un poco de esa zanahoria", "Abusadol e,e"],
        mañana: ["¡Brinco de la cama! 🌅", "¡Zanahoria de desayuno!"],
        tarde: ["Brinco brinco ☀️", "¡A saltar por el prado!"],
        noche: ["A dormir en mi madriguera 🌙", "Sueño con zanahorias 💤"],
        hambriento: ["¡Zanahoria! ¡Porfa! 🥕", "Brinco de hambre..."],
        feliz: ["¡Brinco de felicidad!", "¡Soy el conejo más contento! 🐰"],
        triste: ["Mis orejitas están tristes...", "Ven a saltar conmigo 🥺"],
        durmiendo: ["Zzz... brinco en sueños...", "Zanahorias y nubes 💤"],
        comidaFavorita: ["¡ZANAHORIA! ¡MI AMOR! 🥕", "¡Brinco de alegría!"],
        comidaNormal: ["¡Gracias! 🐰", "Ñam ñam brincando"],
        minijuegoGana: ["¡BRINCO DE ALEGRÍA! 🐰", "¡Gané saltando!"],
        minijuegoPierde: ["Casi... 🐰", "¡Otra ronda!"]
      }
    },
    "dragon-bebe": {
      nombre: "Dragón Bebé", imagen: "img/dragon-bebe.png", sonido: "fireball", favorita: "carbon",
      desbloqueo: { tipo: "nivel", nivel: 3 },
      frases: {
        general: ["¡Vamos a jugar! Tenemos mucho tiempo", "No entiendo a mis padres", "¿Dios?", "¿Aún no lo conoces?", "¿Mi fuego existe? ¿Le puedo agradecer?", "Las brasas guían mi camino", "Yo sí puedo quemar esas montañas", "¿Humanos? ¿Aún existen?", "Yo creo en mí. ¡Fire Ball!", "¡Mis escamas son de acero!", "39 segundos es mucho tiempo"],
        mañana: ["¡Buenos días! ¡A quemar cosas! 🔥", "Hoy aprenderé a volar"],
        tarde: ["¡Hora del entrenamiento! 🔥", "Mira cómo escupo chispitas ✨"],
        noche: ["Las brasas iluminan mi sueño 🌙", "Buenas noches, fueguito 🔥"],
        hambriento: ["Tengo hambre... ¿carbón? 🪨", "¡Unas brasas, porfa!"],
        feliz: ["¡¡Fire Ball de felicidad!! 🔥", "¡Soy el dragón más feliz!"],
        triste: ["Mi fuego está apagado...", "Ven a jugar conmigo 🥺"],
        durmiendo: ["Zzz... brasitas...", "Sueño con dragones ancianos 💤"],
        comidaFavorita: ["¡CARBÓN! ¡Mi delicia! 🪨🔥", "¡Ñam ñam fueguito!"],
        comidaNormal: ["¡Gracias, humano!", "Ñam ñam"],
        minijuegoGana: ["¡¡FIRE BALL!! 🔥", "¡Soy imparable!"],
        minijuegoPierde: ["Casi... 🔥", "¡Otra vez!"]
      }
    },
    "dragon-anciano": {
      nombre: "Dragón Anciano", imagen: "img/dragon-anciano.png", sonido: "growl", favorita: "carbon",
      desbloqueo: { tipo: "nivel", nivel: 5 },
      frases: {
        general: ["No desperdicies el poco tiempo que nos… cof cof… Te queda…", "Cuando tenía tu edad tampoco entendía a mis padres", "¿Dios?", "¿Qué es eso?", "No estás aquí gracias a alguien más, estás aquí gracias a ti mismo", "No le des las gracias a alguien que ni siquiera existe", "No le dejes tu destino a alguien más", "Dios no ha movido montañas, no sé por qué piensan que la fe sí", "No entiendo a los humanos", "Prefieren creer en cosas que no existen en lugar de creer en ellos mismos", "La vida es mucho sufrimiento para estas escamas", "100 años no significan nada para la historia"],
        mañana: ["Cof... otro amanecer más...", "Los años pesan, joven humano"],
        tarde: ["El sol calienta mis escamas viejas", "Recuerdos de mil batallas..."],
        noche: ["La noche me trae paz...", "Duerme, joven, yo velo"],
        hambriento: ["Necesito... comer... cof cof", "Unas brasas... por favor"],
        feliz: ["Aún puedo sonreír, mira tú", "La sabiduría da paz"],
        triste: ["Los años pesan...", "He visto demasiado... cof"],
        durmiendo: ["Zzz... leyendas...", "Sueño con dragones de antaño 💤"],
        comidaFavorita: ["Cof... carbón del bueno 🪨", "Delicioso, gracias"],
        comidaNormal: ["Gracias, joven", "Ñam"],
        minijuegoGana: ["Aún tengo reflejos, ¿ves? 🔥", "Cof... gané"],
        minijuegoPierde: ["Los años no pasan en balde...", "Otra vez, joven"]
      }
    }
  };

  const COMIDAS = {
    manzana:   { emoji: "🍎", nombre: "Manzana",   precio: 5,  hambre: 15, felicidad: 5 },
    zanahoria: { emoji: "🥕", nombre: "Zanahoria", precio: 4,  hambre: 12, felicidad: 4 },
    pizza:     { emoji: "🍕", nombre: "Pizza",     precio: 12, hambre: 30, felicidad: 15 },
    pescado:   { emoji: "🐟", nombre: "Pescado",   precio: 10, hambre: 22, felicidad: 12 },
    semillas:  { emoji: "🌾", nombre: "Semillas",  precio: 3,  hambre: 10, felicidad: 3 },
    cupcake:   { emoji: "🧁", nombre: "Cupcake",   precio: 8,  hambre: 15, felicidad: 20 },
    agua:      { emoji: "💧", nombre: "Agua",      precio: 2,  hambre: 8,  felicidad: 5 },
    carbon:    { emoji: "🪨", nombre: "Carbón",    precio: 6,  hambre: 20, felicidad: 8 }
  };

  const SKINS = {
    corona:      { emoji: "👑", nombre: "Corona",     precio: 80,  zona: "cabeza", desc: "Para la realeza" },
    gorro:       { emoji: "🎩", nombre: "Chistera",   precio: 60,  zona: "cabeza", desc: "Muy elegante" },
    birrete:     { emoji: "🎓", nombre: "Birrete",    precio: 100, zona: "cabeza", desc: "Sabio oficial" },
    hongo:       { emoji: "🍄", nombre: "Honguito",   precio: 40,  zona: "cabeza", desc: "Adorable" },
    laurel:      { emoji: "🏆", nombre: "Laurel",     precio: 120, zona: "cabeza", desc: "Solo campeones" },
    santa:       { emoji: "🎅", nombre: "Gorro Navidad", precio: 70, zona: "cabeza", desc: "Festivo" },
    pajarita:    { emoji: "🎀", nombre: "Pajarita",   precio: 50,  zona: "cuello", desc: "Elegante" },
    corbata:     { emoji: "👔", nombre: "Corbata",    precio: 45,  zona: "cuello", desc: "Formal" },
    collar:      { emoji: "📿", nombre: "Collar",     precio: 55,  zona: "cuello", desc: "Mágico" },
    gafas:       { emoji: "🕶️", nombre: "Gafas sol",  precio: 65,  zona: "ojos",   desc: "Cool total" },
    monóculo:    { emoji: "🧐", nombre: "Monóculo",   precio: 90,  zona: "ojos",   desc: "Distinguido" },
    antifaz:     { emoji: "🥷", nombre: "Antifaz",    precio: 75,  zona: "ojos",   desc: "Misterioso" }
  };

  // ============================================
  //  DESBLOQUEO
  // ============================================
  const NIVELES_DESBLOQUEO = [0, 100, 500, 1000, 5000];
  const getXpActual = () => window._experienciaActual || 0;
  function getNivelActual() {
    const xp = getXpActual();
    for (let i = NIVELES_DESBLOQUEO.length - 1; i >= 0; i--) {
      if (xp >= NIVELES_DESBLOQUEO[i]) return i + 1;
    }
    return 1;
  }
  const getLogrosDesbloqueados = () => window._logrosDesbloqueados || {};
  function mascotaDesbloqueada(id) {
    const m = MASCOTAS[id]; if (!m || !m.desbloqueo) return true;
    const d = m.desbloqueo;
    if (d.tipo === "inicial") return true;
    if (d.tipo === "nivel") return getNivelActual() >= d.nivel;
    if (d.tipo === "logro") return !!getLogrosDesbloqueados()[d.id];
    return false;
  }

  // ============================================
  //  PERSISTENCIA
  // ============================================
  const KEY = {
    stats: (uid, m) => `mascota_stats_${uid}_${m}`,
    inventario: (uid) => `mascota_inventario_${uid}`,
    monedas: (uid) => `mascota_monedas_${uid}`,
    skinsCompradas: (uid) => `mascota_skins_${uid}`,
    skinsEquipadas: (uid, m) => `mascota_skins_eq_${uid}_${m}`,
    amistad: (uid) => `mascota_amistad_${uid}`,
    cuidado: (uid, m) => `mascota_cuidado_${uid}_${m}`,
    recordMinijuego: (uid, m) => `mascota_record_juego_${uid}_${m}`
  };

  const statsPorDefecto = () => ({ hambre: 80, felicidad: 100, energia: 100, ultimaActualizacion: Date.now(), durmiendo: false });

  function cargarStats(mascotaId) {
    try {
      const raw = localStorage.getItem(KEY.stats(getUserId(), mascotaId));
      if (!raw) return statsPorDefecto();
      const s = JSON.parse(raw);
      return {
        hambre: typeof s.hambre === "number" ? s.hambre : 80,
        felicidad: typeof s.felicidad === "number" ? s.felicidad : 100,
        energia: typeof s.energia === "number" ? s.energia : 100,
        ultimaActualizacion: s.ultimaActualizacion || Date.now(),
        durmiendo: !!s.durmiendo
      };
    } catch { return statsPorDefecto(); }
  }
  function guardarStats(mascotaId, stats) {
    try {
      stats.ultimaActualizacion = Date.now();
      localStorage.setItem(KEY.stats(getUserId(), mascotaId), JSON.stringify(stats));
    } catch (err) { console.warn("guardarStats:", err); }
  }

  const DECAIMIENTO = {
    hambre: 100 / (12 * 60 * 60 * 1000),
    felicidad: 100 / (24 * 60 * 60 * 1000),
    energia: 100 / (6 * 60 * 60 * 1000)
  };
  function aplicarDecaimiento(stats) {
    if (!stats) return stats;
    const ahora = Date.now();
    const delta = Math.max(0, ahora - (stats.ultimaActualizacion || ahora));
    const factorEnergia = stats.durmiendo ? 0 : 1;
    stats.hambre = Math.max(0, stats.hambre - delta * DECAIMIENTO.hambre);
    stats.felicidad = Math.max(0, stats.felicidad - delta * DECAIMIENTO.felicidad);
    stats.energia = Math.max(0, stats.energia - delta * DECAIMIENTO.energia * factorEnergia);
    return stats;
  }

  function darInventarioInicial() {
    const inv = { manzana: 5, zanahoria: 3, semillas: 3, agua: 3 };
    try { localStorage.setItem(KEY.inventario(getUserId()), JSON.stringify(inv)); } catch {}
    return inv;
  }
  function cargarInventario() {
    try {
      const raw = localStorage.getItem(KEY.inventario(getUserId()));
      if (!raw) return darInventarioInicial();
      const inv = JSON.parse(raw);
      return (inv && typeof inv === "object") ? inv : darInventarioInicial();
    } catch { return darInventarioInicial(); }
  }
  function guardarInventario(inv) {
    try { localStorage.setItem(KEY.inventario(getUserId()), JSON.stringify(inv)); } catch {}
  }

  function getMonedas() {
    try { return Number(localStorage.getItem(KEY.monedas(getUserId())) || 50); }
    catch { return 50; }
  }
  function setMonedas(n) {
    const val = Math.max(0, Math.floor(n));
    try { localStorage.setItem(KEY.monedas(getUserId()), String(val)); } catch {}
    return val;
  }

  function getSkinsCompradas() {
    try { return JSON.parse(localStorage.getItem(KEY.skinsCompradas(getUserId())) || "[]"); }
    catch { return []; }
  }
  function setSkinsCompradas(arr) {
    try { localStorage.setItem(KEY.skinsCompradas(getUserId()), JSON.stringify(arr)); } catch {}
  }
  function getSkinsEquipadas(mascotaId) {
    try { return JSON.parse(localStorage.getItem(KEY.skinsEquipadas(getUserId(), mascotaId)) || "{}"); }
    catch { return {}; }
  }
  function setSkinsEquipadas(mascotaId, eq) {
    try { localStorage.setItem(KEY.skinsEquipadas(getUserId(), mascotaId), JSON.stringify(eq)); } catch {}
  }

  function cargarAmistad() {
    try { return JSON.parse(localStorage.getItem(KEY.amistad(getUserId())) || "{}"); }
    catch { return {}; }
  }
  function guardarAmistad(a) {
    try { localStorage.setItem(KEY.amistad(getUserId()), JSON.stringify(a)); } catch {}
  }
  function getAmistad(a, b) {
    const am = cargarAmistad();
    const key = [a, b].sort().join("__");
    return am[key] || 0;
  }
  function subirAmistad(a, b, delta) {
    const am = cargarAmistad();
    const key = [a, b].sort().join("__");
    am[key] = clamp((am[key] || 0) + delta, 0, 100);
    guardarAmistad(am);
    return am[key];
  }

  function hoyISO() { return new Date().toISOString().slice(0, 10); }
  function ayerISO() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  function cargarCuidado(mascotaId) {
    try {
      const raw = localStorage.getItem(KEY.cuidado(getUserId(), mascotaId));
      if (!raw) return { fecha: hoyISO(), tareas: [], racha: 0, ultimaCompletada: null };
      const c = JSON.parse(raw);
      if (c.fecha !== hoyISO()) {
        return { fecha: hoyISO(), tareas: [], racha: c.racha || 0, ultimaCompletada: c.ultimaCompletada || null };
      }
      return c;
    } catch { return { fecha: hoyISO(), tareas: [], racha: 0, ultimaCompletada: null }; }
  }
  function guardarCuidado(mascotaId, c) {
    try { localStorage.setItem(KEY.cuidado(getUserId(), mascotaId), JSON.stringify(c)); } catch {}
  }

  // ============================================
  //  AUDIO
  // ============================================
  let audioContext = null;
  const getAudioContext = () => {
    if (!audioContext) {
      try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  };
  function tocarTono(freq, duracion, tipo = "sine", vol = 0.15, delay = 0, freqFinal = null) {
    const ctx = getAudioContext(); if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    if (freqFinal) osc.frequency.exponentialRampToValueAtTime(freqFinal, t + duracion);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duracion);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + duracion + 0.05);
  }
  function tocarRuido(duracion = 0.15, vol = 0.2) {
    const ctx = getAudioContext(); if (!ctx) return;
    const t = ctx.currentTime;
    const size = ctx.sampleRate * duracion;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 2);
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    src.buffer = buffer;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duracion);
    src.connect(gain).connect(ctx.destination);
    src.start(t);
  }
  const SONIDOS = {
    fireball: () => { tocarRuido(0.25, 0.3); tocarTono(180, 0.4, "sawtooth", 0.12, 0, 60); },
    growl: () => { tocarTono(120, 0.6, "sawtooth", 0.1, 0, 80); tocarTono(90, 0.5, "sawtooth", 0.08, 0.2, 60); },
    chitter: () => { [0, 0.07, 0.14].forEach(d => tocarTono(1200 + (d ? 200 : 0), 0.05, "square", 0.08, d)); },
    twinkle: () => { tocarTono(880, 0.3, "sine", 0.12); tocarTono(1320, 0.4, "sine", 0.1, 0.1); },
    meow: () => { tocarTono(500, 0.15, "sine", 0.15, 0, 800); tocarTono(800, 0.4, "sine", 0.15, 0.15, 400); },
    crunch: () => { tocarRuido(0.15, 0.2); tocarRuido(0.1, 0.15); },
    baa: () => tocarTono(600, 0.6, "sawtooth", 0.08, 0, 400),
    peep: () => { tocarTono(1800, 0.1, "sine", 0.12); tocarTono(2000, 0.08, "sine", 0.12, 0.12); },
    blip: () => { tocarTono(300, 0.3, "sine", 0.15); tocarTono(400, 0.2, "sine", 0.12, 0.15); },
    sparkle: () => { [660, 880, 1100].forEach((f, i) => tocarTono(f, 0.15, "sine", 0.1, i * 0.1)); tocarTono(1320, 0.3, "sine", 0.1, 0.3); },
    hop: () => { [420, 620, 860].forEach((f, i) => tocarTono(f, 0.1, "triangle", 0.1, i * 0.08)); },
    mimos: () => { [660, 880, 990].forEach((f, i) => tocarTono(f, 0.18, "sine", 0.1, i * 0.08)); },
    dormir: () => { tocarTono(440, 0.5, "sine", 0.12, 0, 220); tocarTono(330, 0.6, "sine", 0.08, 0.4, 165); },
    despertar: () => { [523, 659, 784].forEach((f, i) => tocarTono(f, 0.15, "sine", 0.12, i * 0.1)); },
    comer: () => { tocarRuido(0.12, 0.15); tocarRuido(0.08, 0.12); tocarTono(600, 0.2, "sine", 0.1, 0.15); },
    moneda: () => { tocarTono(900, 0.08, "square", 0.1); tocarTono(1300, 0.12, "square", 0.1, 0.06); },
    compra: () => { [523, 659, 784, 1046].forEach((f, i) => tocarTono(f, 0.12, "sine", 0.1, i * 0.07)); },
    atrapado: () => { tocarTono(880, 0.06, "square", 0.08); tocarTono(1320, 0.08, "square", 0.08, 0.04); },
    victoria: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tocarTono(f, 0.18, "triangle", 0.12, i * 0.09)); },
    derrota: () => { [600, 500, 400, 300].forEach((f, i) => tocarTono(f, 0.2, "sine", 0.1, i * 0.1)); }
  };
  const reproducirSonido = (tipo) => {
    if (!tipo) return;
    try { (SONIDOS[tipo] || (() => tocarTono(600, 0.2)))(); }
    catch (err) { console.warn("Sonido:", err); }
  };

  // ============================================
  //  FRASES CONTEXTUALES
  // ============================================
  function horaDelDia() {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return "mañana";
    if (h >= 12 && h < 20) return "tarde";
    return "noche";
  }
  function getNombreUsuario() {
    return localStorage.getItem("sunadventures_username") || window._sunUserEmail?.split("@")[0] || "";
  }
  function interpolarNombre(txt) {
    if (!txt) return "";
    const n = getNombreUsuario();
    return n ? txt.replace(/\{nombre\}/g, n) : txt;
  }
  function elegirFrase(mascotaId, stats, ctx = {}) {
    try {
      const m = MASCOTAS[mascotaId]; if (!m) return "";
      const frases = m.frases;
      if (ctx.comidaFavorita) return randomDe(frases.comidaFavorita || frases.general);
      if (ctx.comidaNormal) return randomDe(frases.comidaNormal || frases.general);
      if (ctx.minijuegoGana) return randomDe(frases.minijuegoGana || frases.feliz);
      if (ctx.minijuegoPierde) return randomDe(frases.minijuegoPierde || frases.general);
      if (stats?.durmiendo) return randomDe(frases.durmiendo || frases.general);
      if (stats) {
        if (stats.hambre < 25 && Math.random() < 0.75) return randomDe(frases.hambriento);
        if (stats.felicidad < 25 && Math.random() < 0.6) return randomDe(frases.triste);
        if (stats.felicidad > 85 && Math.random() < 0.4) return randomDe(frases.feliz);
      }
      const hora = horaDelDia();
      if (frases[hora] && Math.random() < 0.6) return randomDe(frases[hora]);
      return randomDe(frases.general);
    } catch (err) {
      console.warn("elegirFrase:", err);
      return "";
    }
  }

  // ============================================
  //  NOTIFICACIONES BANNER
  // ============================================
  let notifTimeout = null;
  function mostrarNotifMascota(titulo, texto, duracion = 4000) {
    try {
      let el = document.querySelector(".mascota-notif");
      if (!el) {
        el = document.createElement("div");
        el.className = "mascota-notif";
        el.innerHTML = `
          <img class="mascota-notif-sprite" src="img/mapache.png" alt="">
          <div class="mascota-notif-copy">
            <span class="mascota-notif-titulo"></span>
            <span class="mascota-notif-texto"></span>
          </div>
          <button class="mascota-notif-cerrar" aria-label="Cerrar">×</button>
        `;
        el.querySelector(".mascota-notif-cerrar").addEventListener("click", () => el.classList.remove("visible"));
        document.body.appendChild(el);
      }
      const actual = MASCOTAS[localStorage.getItem("mascota_actual") || "mapache"] || MASCOTAS.mapache;
      el.querySelector(".mascota-notif-sprite").src = actual.imagen;
      el.querySelector(".mascota-notif-titulo").textContent = titulo;
      el.querySelector(".mascota-notif-texto").textContent = texto;
      el.classList.add("visible");
      if (notifTimeout) clearTimeout(notifTimeout);
      notifTimeout = setTimeout(() => el.classList.remove("visible"), duracion);
    } catch (err) { console.warn("notif:", err); }
  }

  // ============================================
  //  ELEMENTOS
  // ============================================
  const mascota = document.querySelector(".mascota");
  const mascotaImg = document.querySelector(".mascota-img");
  const mascotaBurbuja = document.querySelector(".mascota-burbuja");
  const mascotaMenu = $("mascota-menu");
  const mascotaSelector = document.querySelector(".mascota-selector");

  // ⚠️ SI NO HAY MASCOTA EN EL DOM, SALIMOS LIMPIAMENTE
  if (!mascota || !mascotaImg || !mascotaBurbuja) {
    console.warn("⚠️ Mascota no encontrada en el DOM. Saltando sistema de mascotas.");
    // No hacemos return, seguimos con el resto (PWA, descarga, etc.)
  } else {
    // ... todo el sistema de mascotas aquí dentro
  }

  // ============================================
  //  ESTADO MASCOTA
  // ============================================
  let mascotaActual = localStorage.getItem("mascota_actual") || "mapache";
  // ✅ SANITIZAR
  if (!MASCOTAS[mascotaActual]) {
    console.warn(`Mascota "${mascotaActual}" no existe, usando mapache`);
    mascotaActual = "mapache";
    try { localStorage.setItem("mascota_actual", "mapache"); } catch {}
  }

  let burbujaTimeout = null;
  let statsMascota = null;
  let panelMascota = null;
  let cooldownMimos = 0;
  let cooldownDormir = 0;
  let inventario = cargarInventario();

  // Solo inicializamos si existe mascota en el DOM
  if (mascota && mascotaImg && mascotaBurbuja) {
    try {
      // ---- registrar conocida ----
      function registrarMascotaConocida(nombre) {
        try {
          const key = `mascotas_conocidas_${getUserId()}`;
          const lista = JSON.parse(localStorage.getItem(key) || "[]");
          if (!lista.includes(nombre)) { lista.push(nombre); localStorage.setItem(key, JSON.stringify(lista)); }
        } catch {}
      }

      // ---- recargar stats al volver a la pestaña ----
      function recargarStats() {
        try {
          if (!statsMascota) return;
          aplicarDecaimiento(statsMascota);
          if (statsMascota.durmiendo) {
            const ahora = Date.now();
            const delta = Math.max(0, ahora - statsMascota.ultimaActualizacion);
            const horas = delta / (60 * 60 * 1000);
            statsMascota.energia = Math.min(100, statsMascota.energia + horas * 8);
            if (statsMascota.energia >= 100) {
              statsMascota.durmiendo = false;
              mascota.classList.remove("dormida");
              mascotaImg.src = MASCOTAS[mascotaActual].imagen;
              reproducirSonido("despertar");
              decirMascota("¡Buenos días! Ya tengo energía ☀️");
            }
          }
          guardarStats(mascotaActual, statsMascota);
          actualizarPanelStats();
          actualizarEstadoVisual();
        } catch (err) { console.warn("recargarStats:", err); }
      }

      // ---- estados visuales ----
      function actualizarEstadoVisual() {
        try {
          if (!mascota || !statsMascota) return;
          mascota.classList.toggle("dormida", !!statsMascota.durmiendo);
          mascota.classList.toggle("hambrienta", statsMascota.hambre < 25 && !statsMascota.durmiendo);
          let zzz = mascota.querySelector(".mascota-zzz-cont");
          if (statsMascota.durmiendo && !zzz) {
            const cont = document.createElement("div");
            cont.className = "mascota-zzz-cont";
            for (let i = 0; i < 3; i++) {
              const z = document.createElement("span");
              z.className = "mascota-zzz"; z.textContent = "z";
              cont.appendChild(z);
            }
            mascota.appendChild(cont);
          } else if (!statsMascota.durmiendo && zzz) {
            zzz.remove();
          }
          aplicarSkinsVisuales();
        } catch (err) { console.warn("actualizarEstadoVisual:", err); }
      }

      // ---- skins ----
      function aplicarSkinsVisuales() {
        try {
          if (!mascota) return;
          mascota.querySelectorAll(".mascota-skin").forEach(s => s.remove());
          const equipadas = getSkinsEquipadas(mascotaActual);
          Object.entries(equipadas).forEach(([zona, skinId]) => {
            const skin = SKINS[skinId]; if (!skin) return;
            const el = document.createElement("span");
            el.className = `mascota-skin mascota-skin-${zona}`;
            el.textContent = skin.emoji;
            mascota.appendChild(el);
          });
        } catch (err) { console.warn("aplicarSkins:", err); }
      }

      // ---- Panel ----
      function crearPanelStats() {
        try {
          if (panelMascota) return;
          if (!mascota) return;
          const panel = document.createElement("div");
          panel.className = "mascota-panel";
          panel.setAttribute("aria-hidden", "true");
          panel.innerHTML = `
            <div class="mascota-panel-nombre">
              <span id="mascota-panel-nombre-txt">—</span>
              <span class="mascota-panel-estado" id="mascota-panel-estado">—</span>
            </div>
            <div class="mascota-monedero">
              <span>🌻 SunCoins</span>
              <span class="mascota-monedero-valor" id="mascota-monedas">0</span>
            </div>
            <div class="mascota-stat">
              <span class="mascota-stat-label">🍎 Hambre</span>
              <div class="mascota-stat-barra hambre"><span id="stat-hambre"></span></div>
              <span class="mascota-stat-valor" id="stat-hambre-val">0%</span>
            </div>
            <div class="mascota-stat">
              <span class="mascota-stat-label">💛 Felicidad</span>
              <div class="mascota-stat-barra felicidad"><span id="stat-felicidad"></span></div>
              <span class="mascota-stat-valor" id="stat-felicidad-val">0%</span>
            </div>
            <div class="mascota-stat">
              <span class="mascota-stat-label">⚡ Energía</span>
              <div class="mascota-stat-barra energia"><span id="stat-energia"></span></div>
              <span class="mascota-stat-valor" id="stat-energia-val">0%</span>
            </div>
            <div class="mascota-inventario" id="mascota-inventario"></div>
            <div class="cuidado-diario" id="cuidado-diario"></div>
            <div class="mascota-acciones">
              <button type="button" class="mascota-accion" data-accion="mimos">
                <span class="mascota-accion-icono">💗</span> Mimos
                <span class="mascota-accion-progreso" data-progreso="mimos"></span>
              </button>
              <button type="button" class="mascota-accion" data-accion="dormir">
                <span class="mascota-accion-icono" data-icono-dormir>😴</span> <span data-txt-dormir>Dormir</span>
                <span class="mascota-accion-progreso" data-progreso="dormir"></span>
              </button>
              <button type="button" class="mascota-accion jugar" data-accion="jugar">
                <span class="mascota-accion-icono">🎮</span> Jugar (Atrapa el girasol)
              </button>
            </div>
            <div class="mascota-acciones-extra">
              <button type="button" class="mascota-accion" data-accion="tienda">
                <span class="mascota-accion-icono">🛍️</span> Tienda
              </button>
              <button type="button" class="mascota-accion" data-accion="amistad">
                <span class="mascota-accion-icono">💞</span> Amistades
              </button>
              <button type="button" class="mascota-accion" data-accion="minimizar" style="grid-column: span 2;">
                <span class="mascota-accion-icono">🔽</span> Minimizar
              </button>
            </div>
          `;
          mascota.appendChild(panel);
          panelMascota = panel;

          panel.querySelector('[data-accion="mimos"]').addEventListener("click", (e) => { e.stopPropagation(); hacerMimos(); });
          panel.querySelector('[data-accion="dormir"]').addEventListener("click", (e) => { e.stopPropagation(); alternarDormir(); });
          panel.querySelector('[data-accion="jugar"]').addEventListener("click", (e) => { e.stopPropagation(); abrirMinijuego(); });
          panel.querySelector('[data-accion="tienda"]').addEventListener("click", (e) => { e.stopPropagation(); abrirTienda(); });
          panel.querySelector('[data-accion="amistad"]').addEventListener("click", (e) => { e.stopPropagation(); abrirAmistad(); });
          panel.querySelector('[data-accion="minimizar"]').addEventListener("click", (e) => { e.stopPropagation(); cerrarPanel(); });
        } catch (err) { console.warn("crearPanelStats:", err); }
      }

      function abrirPanel() {
        try {
          if (!panelMascota) crearPanelStats();
          if (!panelMascota) return;
          panelMascota.classList.add("open");
          panelMascota.setAttribute("aria-hidden", "false");
          actualizarPanelStats();
          renderizarInventario();
          renderizarCuidadoDiario();
        } catch (err) { console.warn("abrirPanel:", err); }
      }
      function cerrarPanel() {
        if (!panelMascota) return;
        panelMascota.classList.remove("open");
        panelMascota.setAttribute("aria-hidden", "true");
      }

      function actualizarPanelStats() {
        try {
          if (!panelMascota || !statsMascota || !MASCOTAS[mascotaActual]) return;
          const s = statsMascota;
          const set = (id, val) => { const el = $(id); if (el) el.textContent = Math.round(val) + "%"; };
          const bar = (id, val) => { const el = $(id); if (el) el.style.width = clamp(val) + "%"; };

          const nEl = panelMascota.querySelector("#mascota-panel-nombre-txt");
          if (nEl) nEl.textContent = MASCOTAS[mascotaActual].nombre;
          const estadoEl = panelMascota.querySelector("#mascota-panel-estado");
          if (estadoEl) estadoEl.textContent = s.durmiendo ? "Durmiendo 😴" : (s.hambre < 25 ? "Hambriento 🍎" : s.felicidad < 25 ? "Triste 🥺" : "Feliz 💛");
          const monEl = panelMascota.querySelector("#mascota-monedas");
          if (monEl) monEl.textContent = getMonedas();

          bar("stat-hambre", s.hambre); set("stat-hambre-val", s.hambre);
          bar("stat-felicidad", s.felicidad); set("stat-felicidad-val", s.felicidad);
          bar("stat-energia", s.energia); set("stat-energia-val", s.energia);

          const btnDormir = panelMascota.querySelector('[data-accion="dormir"]');
          if (btnDormir) {
            const icono = btnDormir.querySelector("[data-icono-dormir]");
            const txt = btnDormir.querySelector("[data-txt-dormir]");
            if (icono) icono.textContent = s.durmiendo ? "☀️" : "😴";
            if (txt) txt.textContent = s.durmiendo ? "Despertar" : "Dormir";
          }
        } catch (err) { console.warn("actualizarPanelStats:", err); }
      }

      // ---- Inventario ----
      function renderizarInventario() {
        try {
          const cont = $("mascota-inventario");
          if (!cont) return;
          if (!inventario) inventario = cargarInventario();
          cont.innerHTML = "";
          const favorita = MASCOTAS[mascotaActual]?.favorita;
          Object.entries(COMIDAS).forEach(([id, c]) => {
            const cant = inventario[id] || 0;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "comida-item" + (cant === 0 ? " vacia" : "") + (favorita === id ? " favorita" : "");
            btn.title = `${c.nombre} · ${cant} uds. · +${c.hambre}🍎 +${c.felicidad}💛`;
            btn.dataset.comida = id;
            btn.innerHTML = `<span>${c.emoji}</span><span class="comida-item-cantidad">${cant}</span>`;
            if (cant > 0) {
              btn.draggable = true;
              btn.addEventListener("click", (e) => { e.stopPropagation(); darComida(id); });
              btn.addEventListener("dragstart", (e) => {
                try {
                  e.dataTransfer.setData("text/plain", id);
                  e.dataTransfer.effectAllowed = "move";
                } catch {}
              });
            } else {
              btn.disabled = true;
            }
            cont.appendChild(btn);
          });
        } catch (err) { console.warn("renderizarInventario:", err); }
      }

      function renderizarCuidadoDiario() {
        try {
          const cont = $("cuidado-diario");
          if (!cont) return;
          if (!MASCOTAS[mascotaActual]) return;
          const c = cargarCuidado(mascotaActual);
          const tareas = ["alimentar", "jugar", "mimar"];
          const iconos = { alimentar: "🍎", jugar: "🎮", mimar: "💗" };
          cont.innerHTML = `
            <div class="cuidado-diario-titulo">
              <span>Cuidado diario</span>
              <span class="cuidado-diario-racha">🔥 ${c.racha || 0} días</span>
            </div>
            <div class="cuidado-diario-tareas">
              ${tareas.map(t => `<div class="cuidado-tarea ${c.tareas.includes(t) ? "hecha" : ""}">${iconos[t]} ${t}</div>`).join("")}
            </div>
          `;
        } catch (err) { console.warn("renderizarCuidadoDiario:", err); }
      }

      // ---- Cuidado: marcar tarea ----
      function marcarTareaCuidado(mascotaId, tarea) {
        try {
          const c = cargarCuidado(mascotaId);
          if (!c.tareas.includes(tarea)) c.tareas.push(tarea);
          if (c.tareas.length === 3 && c.ultimaCompletada !== hoyISO()) {
            c.ultimaCompletada = hoyISO();
            c.racha = (c.racha || 0) + 1;
            const bonus = 20 + c.racha * 2;
            setMonedas(getMonedas() + bonus);
            mostrarNotifMascota(`+${bonus} 🌻`, `¡Cuidado diario completado! Racha: ${c.racha} días 🔥`);
            if (statsMascota) {
              statsMascota.felicidad = clamp(statsMascota.felicidad + 15);
              guardarStats(mascotaActual, statsMascota);
            }
            decirMascota(`¡${c.racha} días seguidos cuidándome! 🎉`);
          }
          guardarCuidado(mascotaId, c);
          return c;
        } catch (err) { console.warn("marcarTareaCuidado:", err); return null; }
      }

      // ---- Acciones ----
      function hacerMimos() {
        try {
          if (!statsMascota) return;
          const ahora = Date.now();
          const COOLDOWN = 30000;
          const btn = panelMascota?.querySelector('[data-accion="mimos"]');
          if (ahora < cooldownMimos) {
            const restante = Math.ceil((cooldownMimos - ahora) / 1000);
            decirMascota(`Espera ${restante}s... aún estoy feliz 💗`, 2000);
            return;
          }
          cooldownMimos = ahora + COOLDOWN;
          lanzarCorazones(6);
          reproducirSonido("mimos");
          statsMascota.felicidad = clamp(statsMascota.felicidad + 8);
          guardarStats(mascotaActual, statsMascota);
          marcarTareaCuidado(mascotaActual, "mimar");
          subirAmistadConTodas(1);
          actualizarPanelStats();
          renderizarCuidadoDiario();
          actualizarEstadoVisual();
          decirMascota(interpolarNombre(randomDe(["¡Mmm, qué rico!", "¡Más mimos, porfa!", "¡Te quiero mucho! 💗", "¡Eso me encanta!", "Purrr..."])));
          if (btn) {
            btn.disabled = true;
            const prog = btn.querySelector('[data-progreso="mimos"]');
            const start = Date.now();
            const tick = () => {
              const elapsed = Date.now() - start;
              const pct = Math.min(100, (elapsed / COOLDOWN) * 100);
              if (prog) prog.style.width = pct + "%";
              if (elapsed < COOLDOWN) requestAnimationFrame(tick);
              else { btn.disabled = false; if (prog) prog.style.width = "0"; }
            };
            tick();
          }
        } catch (err) { console.warn("hacerMimos:", err); }
      }

      function alternarDormir() {
        try {
          if (!statsMascota) return;
          const ahora = Date.now();
          const COOLDOWN = 10000;
          if (ahora < cooldownDormir) return;
          cooldownDormir = ahora + COOLDOWN;
          if (statsMascota.durmiendo) {
            statsMascota.durmiendo = false;
            statsMascota.energia = clamp(statsMascota.energia + 15);
            reproducirSonido("despertar");
            decirMascota("¡Buenos días! Ya descansé ☀️");
          } else {
            if (statsMascota.energia > 95) { decirMascota("¡No tengo sueño todavía! ⚡", 2500); return; }
            statsMascota.durmiendo = true;
            reproducirSonido("dormir");
            decirMascota("Zzz... a dormir un ratito 😴", 2500);
          }
          guardarStats(mascotaActual, statsMascota);
          actualizarPanelStats();
          actualizarEstadoVisual();
        } catch (err) { console.warn("alternarDormir:", err); }
      }

      function lanzarCorazones(cantidad = 5) {
        try {
          if (!mascota) return;
          for (let i = 0; i < cantidad; i++) {
            const c = document.createElement("span");
            c.className = "corazon-flotante";
            c.innerHTML = SVG.heart;
            const rect = mascota.getBoundingClientRect();
            const x = Math.random() * rect.width * 0.7;
            const y = rect.height * 0.3 + Math.random() * 20;
            c.style.left = x + "px";
            c.style.top = y + "px";
            c.style.setProperty("--dx", (Math.random() - 0.5) * 60 + "px");
            c.style.setProperty("--rot", (Math.random() - 0.5) * 50 + "deg");
            c.style.animationDelay = (i * 0.06) + "s";
            mascota.appendChild(c);
            setTimeout(() => c.remove(), 2000);
          }
        } catch (err) { console.warn("lanzarCorazones:", err); }
      }

      function darComida(comidaId) {
        try {
          if (!statsMascota) return;
          if (!inventario[comidaId] || inventario[comidaId] <= 0) {
            decirMascota("No me queda de eso... ve a la tienda 🛍️", 2500);
            return;
          }
          if (statsMascota.durmiendo) {
            decirMascota("Shhh... estoy durmiendo 😴", 2000);
            return;
          }
          inventario[comidaId]--;
          guardarInventario(inventario);
          const c = COMIDAS[comidaId];
          const esFavorita = MASCOTAS[mascotaActual].favorita === comidaId;
          const mult = esFavorita ? 1.5 : 1;
          statsMascota.hambre = clamp(statsMascota.hambre + c.hambre * mult);
          statsMascota.felicidad = clamp(statsMascota.felicidad + c.felicidad * mult);
          statsMascota.energia = clamp(statsMascota.energia + (esFavorita ? 5 : 2));
          guardarStats(mascotaActual, statsMascota);
          marcarTareaCuidado(mascotaActual, "alimentar");
          subirAmistadConTodas(1);
          reproducirSonido("comer");
          lanzarCorazones(esFavorita ? 8 : 3);
          decirMascota(interpolarNombre(elegirFrase(mascotaActual, statsMascota, { comidaFavorita: esFavorita, comidaNormal: !esFavorita })));
          if (esFavorita) {
            setMonedas(getMonedas() + 3);
            mostrarNotifMascota("+3 🌻", "¡Comida favorita!");
          }
          actualizarPanelStats();
          renderizarInventario();
          renderizarCuidadoDiario();
          actualizarEstadoVisual();
          window.dispatchEvent(new Event("sunadventures:progress"));
        } catch (err) { console.warn("darComida:", err); }
      }

      function activarDropEnMascota() {
        try {
          if (!mascota) return;
          const zone = document.createElement("div");
          zone.className = "mascota-dropzone";
          mascota.appendChild(zone);

          ["dragenter", "dragover"].forEach(evt => {
            mascota.addEventListener(evt, (e) => {
              e.preventDefault(); e.stopPropagation();
              mascota.classList.add("drop-hover");
            });
          });
          ["dragleave", "drop"].forEach(evt => {
            mascota.addEventListener(evt, (e) => {
              e.preventDefault(); e.stopPropagation();
              if (evt === "dragleave" && e.relatedTarget && mascota.contains(e.relatedTarget)) return;
              mascota.classList.remove("drop-hover");
            });
          });
          mascota.addEventListener("drop", (e) => {
            const comidaId = e.dataTransfer?.getData("text/plain");
            if (comidaId && COMIDAS[comidaId]) darComida(comidaId);
          });
        } catch (err) { console.warn("activarDrop:", err); }
      }

      function subirAmistadConTodas(delta) {
        try {
          Object.keys(MASCOTAS).forEach(id => {
            if (id === mascotaActual) return;
            if (!mascotaDesbloqueada(id)) return;
            subirAmistad(mascotaActual, id, delta);
          });
        } catch (err) { console.warn("subirAmistadConTodas:", err); }
      }

      // ============================================
      //  TIENDA
      // ============================================
      function abrirTienda() {
        try {
          let overlay = document.querySelector(".tienda-overlay");
          if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "tienda-overlay";
            overlay.innerHTML = `
              <div class="tienda-panel">
                <div class="tienda-header">
                  <h2 class="tienda-titulo">🛍️ Tienda SunAdventures</h2>
                  <span class="tienda-monedero">🌻 <span id="tienda-monedas">0</span></span>
                </div>
                <div class="tienda-categorias">
                  <button class="tienda-categoria active" data-cat="comida">🍎 Comida</button>
                  <button class="tienda-categoria" data-cat="cabeza">👑 Cabeza</button>
                  <button class="tienda-categoria" data-cat="cuello">🎀 Cuello</button>
                  <button class="tienda-categoria" data-cat="ojos">🕶️ Ojos</button>
                </div>
                <div class="tienda-grid" id="tienda-grid"></div>
                <div style="text-align:right;margin-top:1rem;">
                  <button type="button" class="btn-secondary" data-close-tienda>Cerrar</button>
                </div>
              </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener("click", (e) => {
              if (e.target === overlay || e.target.hasAttribute("data-close-tienda")) overlay.classList.remove("active");
            });
            overlay.querySelectorAll(".tienda-categoria").forEach(btn => {
              btn.addEventListener("click", () => {
                overlay.querySelectorAll(".tienda-categoria").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderizarTienda(btn.dataset.cat);
              });
            });
          }
          overlay.querySelector("#tienda-monedas").textContent = getMonedas();
          const catActiva = overlay.querySelector(".tienda-categoria.active")?.dataset.cat || "comida";
          renderizarTienda(catActiva);
          overlay.classList.add("active");
        } catch (err) { console.warn("abrirTienda:", err); }
      }

      function renderizarTienda(categoria) {
        try {
          const overlay = document.querySelector(".tienda-overlay");
          if (!overlay) return;
          const grid = overlay.querySelector("#tienda-grid");
          grid.innerHTML = "";
          overlay.querySelector("#tienda-monedas").textContent = getMonedas();

          if (categoria === "comida") {
            Object.entries(COMIDAS).forEach(([id, c]) => {
              const item = document.createElement("div");
              item.className = "tienda-item";
              const puede = getMonedas() >= c.precio;
              const esFav = MASCOTAS[mascotaActual]?.favorita === id;
              item.innerHTML = `
                <div class="tienda-item-preview">${c.emoji}</div>
                <span class="tienda-item-nombre">${c.nombre}${esFav ? " ★" : ""}</span>
                <span class="tienda-item-desc">+${c.hambre}🍎 +${c.felicidad}💛</span>
                <span class="tienda-item-precio">🌻 ${c.precio}</span>
                <button class="tienda-item-btn" ${puede ? "" : "disabled"}>Comprar x1</button>
              `;
              item.querySelector("button").addEventListener("click", () => comprarComida(id, c.precio));
              grid.appendChild(item);
            });
          } else {
            const skinsCat = Object.entries(SKINS).filter(([, s]) => s.zona === categoria);
            const compradas = getSkinsCompradas();
            const equipadas = getSkinsEquipadas(mascotaActual);
            skinsCat.forEach(([id, s]) => {
              const item = document.createElement("div");
              item.className = "tienda-item";
              const tiene = compradas.includes(id);
              const equipada = equipadas[s.zona] === id;
              if (tiene) item.classList.add("comprado");
              const puede = getMonedas() >= s.precio;
              item.innerHTML = `
                <div class="tienda-item-preview">${s.emoji}</div>
                <span class="tienda-item-nombre">${s.nombre}</span>
                <span class="tienda-item-desc">${s.desc}</span>
                ${tiene ? `<span class="tienda-item-precio gratis">Comprado</span>` : `<span class="tienda-item-precio">🌻 ${s.precio}</span>`}
              `;
              const btn = document.createElement("button");
              btn.className = "tienda-item-btn";
              if (tiene) {
                if (equipada) { btn.textContent = "Equipado"; btn.classList.add("equipado"); }
                else btn.textContent = "Equipar";
                btn.addEventListener("click", () => equiparSkin(id));
              } else {
                btn.textContent = puede ? "Comprar" : "No alcanza";
                if (!puede) { btn.disabled = true; btn.classList.add("no-alcanza"); }
                btn.addEventListener("click", () => comprarSkin(id, s.precio));
              }
              item.appendChild(btn);
              grid.appendChild(item);
            });
          }
        } catch (err) { console.warn("renderizarTienda:", err); }
      }

      function comprarComida(id, precio) {
        try {
          if (getMonedas() < precio) { mostrarNotifMascota("Sin monedas", "Necesitas más 🌻"); return; }
          setMonedas(getMonedas() - precio);
          inventario[id] = (inventario[id] || 0) + 1;
          guardarInventario(inventario);
          reproducirSonido("moneda");
          mostrarNotifMascota("¡Comprado!", `${COMIDAS[id].emoji} ${COMIDAS[id].nombre}`);
          renderizarTienda("comida");
          renderizarInventario();
          actualizarPanelStats();
        } catch (err) { console.warn("comprarComida:", err); }
      }

      function comprarSkin(id, precio) {
        try {
          if (getMonedas() < precio) { mostrarNotifMascota("Sin monedas", "Necesitas más 🌻"); return; }
          setMonedas(getMonedas() - precio);
          const arr = getSkinsCompradas();
          if (!arr.includes(id)) arr.push(id);
          setSkinsCompradas(arr);
          reproducirSonido("compra");
          mostrarNotifMascota("¡Comprado!", `${SKINS[id].emoji} ${SKINS[id].nombre}`);
          renderizarTienda(SKINS[id].zona);
          actualizarPanelStats();
        } catch (err) { console.warn("comprarSkin:", err); }
      }

      function equiparSkin(id) {
        try {
          const skin = SKINS[id]; if (!skin) return;
          const eq = getSkinsEquipadas(mascotaActual);
          if (eq[skin.zona] === id) {
            delete eq[skin.zona];
            mostrarNotifMascota("Desequipado", skin.nombre);
          } else {
            eq[skin.zona] = id;
            mostrarNotifMascota("Equipado", `${skin.emoji} ${skin.nombre}`);
          }
          setSkinsEquipadas(mascotaActual, eq);
          aplicarSkinsVisuales();
          renderizarTienda(skin.zona);
        } catch (err) { console.warn("equiparSkin:", err); }
      }

      // ============================================
      //  AMISTAD
      // ============================================
      function abrirAmistad() {
        try {
          let overlay = document.querySelector(".amistad-overlay");
          if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "amistad-overlay";
            overlay.innerHTML = `
              <div class="amistad-panel">
                <h3 class="amistad-titulo">💞 Amistades de ${MASCOTAS[mascotaActual].nombre}</h3>
                <p class="amistad-sub">Aliméntalas, juega con ellas y sube su amistad.</p>
                <div class="amistad-lista" id="amistad-lista"></div>
                <div style="text-align:right;margin-top:1rem;">
                  <button type="button" class="btn-secondary" data-close-amistad>Cerrar</button>
                </div>
              </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener("click", (e) => {
              if (e.target === overlay || e.target.hasAttribute("data-close-amistad")) overlay.classList.remove("active");
            });
          }
          const lista = overlay.querySelector("#amistad-lista");
          lista.innerHTML = "";
          const desbloqueadas = Object.keys(MASCOTAS).filter(id => id !== mascotaActual && mascotaDesbloqueada(id));
          if (!desbloqueadas.length) {
            lista.innerHTML = `<div class="amistad-vacio">Aún no tienes otras mascotas desbloqueadas. ¡Consigue logros para conocer más!</div>`;
          } else {
            desbloqueadas.forEach(id => {
              const am = getAmistad(mascotaActual, id);
              const nivelTxt = am >= 80 ? "Mejores amigos 💖" : am >= 50 ? "Amigos 💛" : am >= 20 ? "Conocidos 🤝" : "Extraños 👋";
              const fila = document.createElement("div");
              fila.className = "amistad-fila";
              fila.innerHTML = `
                <img class="amistad-sprite" src="${MASCOTAS[id].imagen}" alt="${MASCOTAS[id].nombre}" onerror="this.style.display='none'">
                <div class="amistad-info">
                  <span class="amistad-nombre">${MASCOTAS[id].nombre}</span>
                  <div class="amistad-barra"><span style="width:${am}%"></span></div>
                </div>
                <span class="amistad-nivel">${nivelTxt}</span>
              `;
              lista.appendChild(fila);
            });
          }
          overlay.classList.add("active");
        } catch (err) { console.warn("abrirAmistad:", err); }
      }

      // ============================================
      //  MINIJUEGO
      // ============================================
      const DURACION_JUEGO = 60;
      let juegoActivo = false;
      let juegoTimeout = null;
      let juegoInterval = null;
      let juegoPuntos = 0;
      let juegoTiempo = 0;

      function abrirMinijuego() {
        try {
          if (juegoActivo) return;
          let overlay = document.querySelector(".minijuego-overlay");
          if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "minijuego-overlay";
            overlay.innerHTML = `
              <div class="minijuego-panel" id="minijuego-panel">
                <div class="minijuego-hud">
                  <span>🌻 <span id="juego-puntos">0</span></span>
                  <span class="minijuego-tiempo" id="juego-tiempo">${DURACION_JUEGO}s</span>
                </div>
                <button class="minijuego-cerrar" data-close-juego aria-label="Cerrar">×</button>
                <div class="minijuego-mensaje" id="juego-mensaje-inicio">
                  <h2>🌻 Atrapa el girasol 🌻</h2>
                  <p>Toca los girasoles que aparecen. Tienes ${DURACION_JUEGO} segundos. ¿Cuántos puedes atrapar?</p>
                  <p class="minijuego-record" id="juego-record-txt"></p>
                  <div class="minijuego-botones">
                    <button type="button" class="btn-primary" id="juego-start">¡Empezar!</button>
                  </div>
                </div>
                <div class="minijuego-mensaje hidden" id="juego-mensaje-final"></div>
              </div>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener("click", (e) => {
              if (e.target === overlay || e.target.hasAttribute("data-close-juego")) cerrarMinijuego();
            });
            overlay.querySelector("#juego-start").addEventListener("click", empezarJuego);
          }
          const record = Number(localStorage.getItem(KEY.recordMinijuego(getUserId(), mascotaActual)) || 0);
          const recTxt = overlay.querySelector("#juego-record-txt");
          recTxt.textContent = record > 0 ? `Tu récord: ${record} girasoles 🌻` : "Aún no tienes récord";
          overlay.querySelector("#juego-mensaje-inicio").classList.remove("hidden");
          overlay.querySelector("#juego-mensaje-final").classList.add("hidden");
          overlay.querySelector("#juego-puntos").textContent = "0";
          overlay.querySelector("#juego-tiempo").textContent = `${DURACION_JUEGO}s`;
          overlay.querySelectorAll(".girasol-juego").forEach(g => g.remove());
          overlay.classList.add("active");
        } catch (err) { console.warn("abrirMinijuego:", err); }
      }

      function cerrarMinijuego() {
        try {
          const overlay = document.querySelector(".minijuego-overlay");
          if (!overlay) return;
          overlay.classList.remove("active");
          overlay.querySelectorAll(".girasol-juego").forEach(g => g.remove());
          juegoActivo = false;
          clearTimeout(juegoTimeout);
          clearInterval(juegoInterval);
        } catch (err) { console.warn("cerrarMinijuego:", err); }
      }

      function empezarJuego() {
        try {
          const overlay = document.querySelector(".minijuego-overlay");
          if (!overlay) return;
          overlay.querySelector("#juego-mensaje-inicio").classList.add("hidden");
          overlay.querySelector("#juego-mensaje-final").classList.add("hidden");
          juegoPuntos = 0;
          juegoTiempo = DURACION_JUEGO;
          juegoActivo = true;
          overlay.querySelector("#juego-puntos").textContent = "0";
          const tiempoEl = overlay.querySelector("#juego-tiempo");
          tiempoEl.textContent = `${DURACION_JUEGO}s`;
          tiempoEl.classList.remove("urgente");

          juegoInterval = setInterval(() => {
            juegoTiempo--;
            tiempoEl.textContent = `${juegoTiempo}s`;
            tiempoEl.classList.toggle("urgente", juegoTiempo <= 10);
            if (juegoTiempo <= 0) {
              clearInterval(juegoInterval);
              terminarJuego();
            }
          }, 1000);

          for (let i = 0; i < 3; i++) setTimeout(spawnGirasol, i * 250);
        } catch (err) { console.warn("empezarJuego:", err); }
      }

      function spawnGirasol() {
        try {
          if (!juegoActivo) return;
          const overlay = document.querySelector(".minijuego-overlay");
          const panel = overlay?.querySelector("#minijuego-panel");
          if (!panel) return;

          const rect = panel.getBoundingClientRect();
          const size = 56;
          const maxX = Math.max(10, rect.width - size - 10);
          const maxY = Math.max(60, rect.height - size - 60);
          const x = 10 + Math.random() * maxX;
          const y = 55 + Math.random() * maxY;

          const g = document.createElement("div");
          g.className = "girasol-juego";
          g.style.left = x + "px";
          g.style.top = y + "px";
          g.dataset.puntos = Math.random() < 0.12 ? 3 : 1;

          const atrapado = (e) => {
            try {
              e.stopPropagation();
              if (!juegoActivo || g.classList.contains("atrapado")) return;
              g.classList.add("atrapado");
              const pts = Number(g.dataset.puntos);
              juegoPuntos += pts;
              overlay.querySelector("#juego-puntos").textContent = juegoPuntos;
              reproducirSonido("atrapado");
              const pop = document.createElement("span");
              pop.className = "minijuego-pop";
              pop.style.left = x + size / 2 + "px";
              pop.style.top = y + "px";
              pop.textContent = `+${pts}`;
              panel.appendChild(pop);
              setTimeout(() => pop.remove(), 800);
              setTimeout(() => g.remove(), 400);
            } catch (err) { console.warn("atrapado:", err); }
          };
          g.addEventListener("click", atrapado);
          g.addEventListener("touchstart", atrapado, { passive: true });

          panel.appendChild(g);

          const vida = 1400 + Math.random() * 900;
          setTimeout(() => {
            if (!g.classList.contains("atrapado")) {
              g.style.transition = "opacity 0.3s ease, transform 0.3s ease";
              g.style.opacity = "0";
              g.style.transform = "scale(0.6)";
              setTimeout(() => g.remove(), 300);
            }
          }, vida);

          if (juegoActivo) {
            const delay = Math.max(220, 700 - (DURACION_JUEGO - juegoTiempo) * 8);
            juegoTimeout = setTimeout(spawnGirasol, delay);
          }
        } catch (err) { console.warn("spawnGirasol:", err); }
      }

      function terminarJuego() {
        try {
          juegoActivo = false;
          clearInterval(juegoInterval);
          clearTimeout(juegoTimeout);
          const overlay = document.querySelector(".minijuego-overlay");
          if (!overlay) return;
          overlay.querySelectorAll(".girasol-juego").forEach(g => g.remove());

          const recordKey = KEY.recordMinijuego(getUserId(), mascotaActual);
          const recordAntes = Number(localStorage.getItem(recordKey) || 0);
          const nuevoRecord = juegoPuntos > recordAntes;
          if (nuevoRecord) localStorage.setItem(recordKey, String(juegoPuntos));

          const monedas = Math.max(1, Math.floor(juegoPuntos / 2));
          const felicidad = Math.min(20, Math.floor(juegoPuntos / 2));
          setMonedas(getMonedas() + monedas);
          mostrarNotifMascota(`+${monedas} 🌻`, `¡Atrapaste ${juegoPuntos} girasoles!`);
          if (statsMascota) {
            statsMascota.felicidad = clamp(statsMascota.felicidad + felicidad);
            statsMascota.energia = clamp(statsMascota.energia - 10);
            guardarStats(mascotaActual, statsMascota);
          }
          marcarTareaCuidado(mascotaActual, "jugar");
          subirAmistadConTodas(2);
          reproducirSonido(juegoPuntos > 0 ? "victoria" : "derrota");
          decirMascota(interpolarNombre(juegoPuntos > 0
            ? elegirFrase(mascotaActual, statsMascota, { minijuegoGana: true })
            : elegirFrase(mascotaActual, statsMascota, { minijuegoPierde: true })
          ));

          const final = overlay.querySelector("#juego-mensaje-final");
          final.classList.remove("hidden");
          final.innerHTML = `
            <h2>${juegoPuntos > 0 ? "¡Bien jugado!" : "¡Casi!"}</h2>
            <p>Atrapaste</p>
            <span class="minijuego-mensaje-num">${juegoPuntos}</span>
            <p>girasoles 🌻</p>
            ${nuevoRecord ? `<p class="minijuego-record">¡NUEVO RÉCORD! 🏆</p>` : `<p class="minijuego-record">Récord actual: ${Math.max(recordAntes, juegoPuntos)}</p>`}
            <p class="minijuego-record">Recompensa: +${monedas} 🌻 · +${felicidad} 💛</p>
            <div class="minijuego-botones">
              <button type="button" class="btn-primary" id="juego-otra">Jugar otra vez</button>
              <button type="button" class="btn-secondary" data-close-juego>Cerrar</button>
            </div>
          `;
          final.querySelector("#juego-otra").addEventListener("click", () => {
            overlay.querySelector("#juego-mensaje-final").classList.add("hidden");
            overlay.querySelector("#juego-mensaje-inicio").classList.remove("hidden");
            const record = Number(localStorage.getItem(recordKey) || 0);
            overlay.querySelector("#juego-record-txt").textContent = record > 0 ? `Tu récord: ${record} girasoles 🌻` : "Aún no tienes récord";
          });
          final.querySelector("[data-close-juego]").addEventListener("click", cerrarMinijuego);

          actualizarPanelStats();
          renderizarCuidadoDiario();
          actualizarEstadoVisual();
          window.dispatchEvent(new Event("sunadventures:progress"));
        } catch (err) { console.warn("terminarJuego:", err); }
      }

      // ---- Ojos ----
      function activarOjosCursor() {
        try {
          if (!mascota || !mascotaImg) return;
          const ojo1 = document.createElement("span");
          const ojo2 = document.createElement("span");
          ojo1.className = "mascota-ojo";
          ojo2.className = "mascota-ojo";
          ojo1.style.left = "30%"; ojo1.style.top = "38%";
          ojo2.style.left = "58%"; ojo2.style.top = "38%";
          mascota.appendChild(ojo1); mascota.appendChild(ojo2);
          document.addEventListener("mousemove", (e) => {
            const rect = mascota.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            const dist = Math.hypot(dx, dy);
            const mostrar = dist < 280;
            const opacidad = mostrar ? Math.min(0.85, 1 - dist / 320) : 0;
            ojo1.style.opacity = opacidad; ojo2.style.opacity = opacidad;
            if (mostrar) {
              const max = 2.5;
              const offX = Math.max(-max, Math.min(max, dx / 60));
              const offY = Math.max(-max, Math.min(max, dy / 60));
              ojo1.style.transform = `translate(${offX}px, ${offY}px)`;
              ojo2.style.transform = `translate(${offX}px, ${offY}px)`;
            }
          });
        } catch (err) { console.warn("ojos:", err); }
      }

      // ============================================
      //  INICIALIZACIÓN FINAL
      // ============================================
      window.cambiarMascotaDesdeVista = (id) => { if (MASCOTAS[id]) { cambiarMascota(id); decirMascota(`¡${MASCOTAS[id].nombre} seleccionada!`); } };
      window.decirMascota = window.decirMapache = (texto, duracion = 3000) => {
        try {
          mascotaBurbuja.textContent = texto;
          mascotaBurbuja.classList.add("visible");
          if (burbujaTimeout) clearTimeout(burbujaTimeout);
          burbujaTimeout = setTimeout(() => mascotaBurbuja.classList.remove("visible"), duracion);
        } catch {}
      };

      const cerrarMenuMascota = () => { try { mascotaMenu?.classList.remove("open"); mascotaMenu?.setAttribute("aria-hidden", "true"); } catch {} };
      const abrirMenuMascota = () => { try { mascotaMenu?.classList.add("open"); mascotaMenu?.setAttribute("aria-hidden", "false"); } catch {} };
      const animarSaludo = () => {
        try { mascota.classList.remove("saludo"); void mascota.offsetWidth; mascota.classList.add("saludo"); } catch {}
      };

      function cambiarMascota(nombre) {
        try {
          const datos = MASCOTAS[nombre]; if (!datos) return;
          if (statsMascota) guardarStats(mascotaActual, statsMascota);
          mascotaActual = nombre;
          statsMascota = cargarStats(nombre);
          aplicarDecaimiento(statsMascota);
          guardarStats(nombre, statsMascota);

          registrarMascotaConocida(nombre);
          mascotaImg.src = statsMascota.durmiendo && datos.imagenDormida ? datos.imagenDormida : datos.imagen;
          mascotaImg.alt = datos.nombre;
          localStorage.setItem("mascota_actual", nombre);
          mascota.classList.toggle("conejo-alto", nombre === "conejo");
          mascotaMenu?.querySelectorAll(".mascota-opcion").forEach(op => op.classList.toggle("activa", op.dataset.mascota === nombre));
          actualizarEstadoVisual();
          actualizarPanelStats();
          renderizarInventario();
          renderizarCuidadoDiario();
          animarSaludo();
          reproducirSonido(datos.sonido);
          decirMascota(`${datos.nombre} ha llegado`, 2500);
        } catch (err) { console.warn("cambiarMascota:", err); }
      }

      mascotaImg.addEventListener("click", (e) => {
        try {
          e.stopPropagation();
          if (mascota.classList.contains("drop-hover")) return;
          const key = `mascota_clicks_${getUserId()}_${mascotaActual}`;
          localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + 1));
          localStorage.setItem("mascota_clicks", String(Number(localStorage.getItem("mascota_clicks") || 0) + 1));
          window.dispatchEvent(new Event("sunadventures:progress"));
          reproducirSonido(MASCOTAS[mascotaActual].sonido);
          animarSaludo();
          if (statsMascota?.durmiendo) decirMascota(randomDe(MASCOTAS[mascotaActual].frases.durmiendo));
          else decirMascota(interpolarNombre(elegirFrase(mascotaActual, statsMascota)));
        } catch (err) { console.warn("click mascota:", err); }
      });

      let pressTimer = null;
      const onPressStart = () => { pressTimer = setTimeout(() => { abrirPanel(); reproducirSonido("blip"); }, 600); };
      const onPressEnd = () => { if (pressTimer) clearTimeout(pressTimer); };
      mascotaImg.addEventListener("mousedown", onPressStart);
      mascotaImg.addEventListener("mouseup", onPressEnd);
      mascotaImg.addEventListener("mouseleave", onPressEnd);
      mascotaImg.addEventListener("touchstart", onPressStart, { passive: true });
      mascotaImg.addEventListener("touchend", onPressEnd);

      mascotaSelector?.addEventListener("click", (e) => {
        try { e.preventDefault(); e.stopPropagation(); mascotaMenu?.classList.contains("open") ? cerrarMenuMascota() : abrirMenuMascota(); } catch {}
      });

      mascotaMenu?.querySelectorAll(".mascota-opcion").forEach(op => {
        op.addEventListener("click", (e) => {
          try { e.preventDefault(); e.stopPropagation(); cambiarMascota(op.dataset.mascota); cerrarMenuMascota(); } catch {}
        });
      });

      document.addEventListener("click", (e) => {
        try {
          if (mascotaMenu?.classList.contains("open")) {
            const dentro = mascota.contains(e.target) || mascotaSelector?.contains(e.target) || mascotaMenu.contains(e.target);
            if (!dentro) cerrarMenuMascota();
          }
          if (panelMascota?.classList.contains("open")) {
            const dentroPanel = panelMascota.contains(e.target) || mascota.contains(e.target);
            if (!dentroPanel) cerrarPanel();
          }
        } catch {}
      });

      document.addEventListener("keydown", (e) => {
        try {
          if (e.key === "Escape") {
            if (mascotaMenu?.classList.contains("open")) cerrarMenuMascota();
            if (panelMascota?.classList.contains("open")) cerrarPanel();
            document.querySelector(".amistad-overlay.active")?.classList.remove("active");
            document.querySelector(".tienda-overlay.active")?.classList.remove("active");
            document.querySelector(".minijuego-overlay.active") && cerrarMinijuego();
          }
        } catch {}
      });

      // Init
      statsMascota = cargarStats(mascotaActual);
      aplicarDecaimiento(statsMascota);
      guardarStats(mascotaActual, statsMascota);
      mascotaImg.src = statsMascota.durmiendo && MASCOTAS[mascotaActual].imagenDormida ? MASCOTAS[mascotaActual].imagenDormida : MASCOTAS[mascotaActual].imagen;
      mascotaImg.alt = MASCOTAS[mascotaActual].nombre;
      registrarMascotaConocida(mascotaActual);
      mascota.classList.toggle("conejo-alto", mascotaActual === "conejo");
      mascotaMenu?.querySelectorAll(".mascota-opcion").forEach(op => op.classList.toggle("activa", op.dataset.mascota === mascotaActual));

      actualizarEstadoVisual();
      activarOjosCursor();
      activarDropEnMascota();
      crearPanelStats();

      setTimeout(() => {
        const saludo = statsMascota?.durmiendo
          ? randomDe(MASCOTAS[mascotaActual].frases.durmiendo)
          : interpolarNombre(`¡Hola${getNombreUsuario() ? " " + getNombreUsuario() : ""}! Soy tu ${MASCOTAS[mascotaActual].nombre.toLowerCase()}`);
        decirMascota(saludo);
      }, 1500);

      setInterval(() => {
        try {
          if (!mascotaBurbuja.classList.contains("visible")) {
            decirMascota(interpolarNombre(elegirFrase(mascotaActual, statsMascota)));
          }
        } catch {}
      }, 45000);

      setInterval(() => {
        try {
          aplicarDecaimiento(statsMascota);
          if (statsMascota.durmiendo) {
            statsMascota.energia = clamp(statsMascota.energia + 1.5);
            if (statsMascota.energia >= 100) {
              statsMascota.durmiendo = false;
              mascota.classList.remove("dormida");
              reproducirSonido("despertar");
              decirMascota("¡Buenos días! Ya tengo energía ☀️");
            }
          }
          guardarStats(mascotaActual, statsMascota);
          actualizarPanelStats();
          actualizarEstadoVisual();
          if (statsMascota.hambre < 15 && !statsMascota.durmiendo && Math.random() < 0.5) decirMascota("Tengo mucha hambre... 🍎", 3500);
          else if (statsMascota.felicidad < 15 && !statsMascota.durmiendo && Math.random() < 0.4) decirMascota("Me siento triste... ven a mimarme 🥺", 3500);
        } catch {}
      }, 60000);

      document.addEventListener("visibilitychange", () => { if (!document.hidden) recargarStats(); });
      window.addEventListener("focus", recargarStats);

      window._abrirPanelMascota = abrirPanel;
      window._cerrarPanelMascota = cerrarPanel;
      // ============================================
//  VISTA MASCOTAS — cuadrícula + bloqueo menú
// ============================================
function renderMascotasGrid() {
  const grid = document.getElementById("mascotas-grid");
  const empty = document.getElementById("mascotas-empty");
  if (!grid) return;

  // Nombre "amigable" y descripción de desbloqueo de cada mascota
  const INFO = {
    mapache:        { nombre: "Mapache",       desc: "Tu compañero desde el principio" },
    girasol:        { nombre: "Girasol",       desc: "Alcanza el nivel Enamorados (100 XP)" },
    gatito:         { nombre: "Armstrong",     desc: "Consigue 50 fotos en el álbum" },
    hamburguesa:    { nombre: "Hamburguesa",   desc: "Añade 20 canciones al grupo" },
    oveja:          { nombre: "Oveja",         desc: "Abre la app 30 días seguidos" },
    pollito:        { nombre: "Pollito",       desc: "Escribe 30 notas del grupo" },
    jirafa:         { nombre: "Jirafa",        desc: "Guarda 10 fotos con ubicación" },
    unicornio:      { nombre: "Unicornio",     desc: "Abre la app 365 días seguidos" },
    conejo:         { nombre: "Conejito",      desc: "Dale 100 clics al Mapache" },
    "dragon-bebe":  { nombre: "Dragón Bebé",   desc: "Alcanza el nivel Compañeros de vida (500 XP)" },
    "dragon-anciano": { nombre: "Dragón Anciano", desc: "Alcanza el nivel Leyendas (5000 XP)" }
  };

  const actual = localStorage.getItem("mascota_actual") || "mapache";

  grid.innerHTML = "";
  let desbloqueadasCount = 0;

  Object.keys(MASCOTAS).forEach(id => {
    const info = INFO[id] || { nombre: MASCOTAS[id].nombre, desc: "" };
    const desbloqueada = mascotaDesbloqueada(id);
    if (desbloqueada) desbloqueadasCount++;

    const card = document.createElement("article");
    card.className = "mascota-card " + (desbloqueada ? "desbloqueada" : "bloqueada");
    if (id === actual && desbloqueada) card.classList.add("activa");

    // Candado si está bloqueada
    if (!desbloqueada) {
      const lock = document.createElement("span");
      lock.className = "mascota-card-lock";
      lock.textContent = "🔒";
      card.appendChild(lock);
    }
    // Badge ✓ si es la activa
    if (id === actual && desbloqueada) {
      const badge = document.createElement("span");
      badge.className = "mascota-card-activa-badge";
      badge.textContent = "✓";
      card.appendChild(badge);
    }

    const img = document.createElement("img");
    img.className = "mascota-card-img";
    img.src = MASCOTAS[id].imagen;
    img.alt = info.nombre;
    img.loading = "lazy";
    img.onerror = () => { img.style.visibility = "hidden"; };

    const h3 = document.createElement("h3");
    h3.className = "mascota-card-nombre";
    h3.textContent = info.nombre;

    const p = document.createElement("p");
    p.className = "mascota-card-desc";
    p.textContent = desbloqueada ? info.desc : "🔒 " + info.desc;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mascota-card-btn";
    if (!desbloqueada) {
      btn.textContent = "Bloqueada";
      btn.disabled = true;
    } else if (id === actual) {
      btn.textContent = "✓ En uso";
      btn.classList.add("activo");
    } else {
      btn.textContent = "Usar";
      btn.addEventListener("click", () => {
        if (typeof window.cambiarMascotaDesdeVista === "function") {
          window.cambiarMascotaDesdeVista(id);
          renderMascotasGrid();          // refresca para marcar la activa
          // También refresca el menú flotante
          document.querySelectorAll(".mascota-opcion").forEach(op =>
            op.classList.toggle("activa", op.dataset.mascota === id)
          );
        }
      });
    }

    card.append(img, h3, p, btn);
    grid.appendChild(card);
  });

  if (empty) empty.classList.toggle("hidden", desbloqueadasCount > 0);
}

// Bloquea las no desbloqueadas en el menú flotante de la mascota
function actualizarBloqueoMenuMascotas() {
  document.querySelectorAll(".mascota-opcion").forEach(op => {
    const id = op.dataset.mascota;
    const ok = mascotaDesbloqueada(id);
    op.classList.toggle("bloqueada", !ok);
    op.disabled = !ok;
    op.title = ok ? "" : "Aún no la has desbloqueado";
  });
}

// Pintar cuando se navega a la vista de mascotas
window._renderMascotasGrid = () => {
  renderMascotasGrid();
  actualizarBloqueoMenuMascotas();
};

// Pintar al cargar
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderMascotasGrid();
    actualizarBloqueoMenuMascotas();
  }, 500);
});

// Repintar cuando la XP cambia (subes de nivel, desbloqueas logros, etc.)
window.addEventListener("sunadventures:progress", () => {
  renderMascotasGrid();
  actualizarBloqueoMenuMascotas();
});
window.addEventListener("sunadventures:user-ready", () => {
  renderMascotasGrid();
  actualizarBloqueoMenuMascotas();
});

console.log("✅ Sistema de vista de mascotas listo");

      console.log("✅ Sistema de mascotas inicializado correctamente");
    } catch (err) {
      console.error("❌ Error crítico inicializando mascota:", err);
    }
  }

  // ============================================
  //  MODAL DE DESCARGA
  // ============================================
  document.querySelectorAll('[data-action="descargar"]').forEach(btn => btn.addEventListener("click", abrirModalDescarga));

  function abrirModalDescarga() {
    try {
      const modal = document.createElement("div");
      modal.className = "modal active";
      modal.setAttribute("aria-hidden", "false");
      modal.innerHTML = `
        <div class="modal-backdrop" data-close></div>
        <div class="modal-content" role="dialog" aria-modal="true">
          <h3 class="modal-title">Descargar SunAdventures</h3>
          <p style="opacity:0.8;margin-bottom:0.5rem">Llévanos contigo a todas partes</p>
          <div class="download-grid">
            <a class="download-option" href="app/sunadventures.apk" download>
              <span class="download-option-icon">${SVG.android}</span>
              <span class="download-option-title">Android</span>
              <span class="download-option-hint">Descargar APK</span>
            </a>
            <button class="download-option" data-platform="ios" type="button">
              <span class="download-option-icon">${SVG.apple}</span>
              <span class="download-option-title">iOS</span>
              <span class="download-option-hint">Añadir a inicio</span>
            </button>
            <button class="download-option" data-platform="windows" type="button">
              <span class="download-option-icon">${SVG.windows}</span>
              <span class="download-option-title">Windows</span>
              <span class="download-option-hint">Próximamente</span>
            </button>
            <button class="download-option" data-platform="linux" type="button">
              <span class="download-option-icon">${SVG.linux}</span>
              <span class="download-option-title">Linux</span>
              <span class="download-option-hint">Próximamente</span>
            </button>
          </div>
          <div class="modal-actions" style="margin-top:1.2rem">
            <button type="button" class="btn-secondary" data-close>Cerrar</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.body.style.overflow = "hidden";
      const cerrar = () => { modal.remove(); document.body.style.overflow = ""; };
      modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", cerrar));
      const alertas = {
        ios: "Ábrela en Safari y pulsa 'Compartir → Añadir a pantalla de inicio'",
        windows: "Próximamente: versión de escritorio para Windows",
        linux: "Próximamente: versión de escritorio para Linux"
      };
      modal.querySelectorAll("[data-platform]").forEach(btn => {
        btn.addEventListener("click", () => alert(alertas[btn.dataset.platform]));
      });
    } catch (err) { console.warn("abrirModalDescarga:", err); }
  }

  // ============================================
  //  PWA
  // ============================================
  try {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
          .then(reg => console.log("SW registrado:", reg.scope))
          .catch(err => console.warn("Error SW:", err));
      });
    }
    let deferredPrompt = null;
    const btnInstalar = $("btn-instalar-app");
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); deferredPrompt = e;
      if (btnInstalar) btnInstalar.style.display = "inline-flex";
    });
    btnInstalar?.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btnInstalar.style.display = "none";
    });
    window.addEventListener("appinstalled", () => { if (btnInstalar) btnInstalar.style.display = "none"; });
  } catch (err) { console.warn("PWA:", err); }

  console.log("✅ script.js cargado completamente");
});