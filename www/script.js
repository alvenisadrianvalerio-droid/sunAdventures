document.addEventListener("DOMContentLoaded", () => {

  // ============================================
  //  GIRASOL INTERACTIVO
  // ============================================
  const girasol = document.querySelector(".girasol-wrapper");
  const pop = document.getElementById("pop");
  const burbuja = document.querySelector(".burbuja");
  const toggle = document.getElementById("theme-toggle");

  if (girasol && pop) {
    pop.volume = 0.4;

    const frases = [
      "Mi lugar favorito🌻",
      "Contigo hasta el infinito ✨",
      "Cada día te elijo 💫",
      "Eres mi casualidad más bonita 💖",
      "Mi persona favorita en el mundo 🌍",
      "Gracias por existir 🥹",
      "Siempre tú, siempre yo, siempre nosotros 💌",
      "Te pensé, y apareciste ✨"
    ];

    girasol.addEventListener("mouseenter", () => {
      pop.currentTime = 0;
      pop.play().catch((err) => {
        console.warn("No se pudo reproducir el sonido:", err);
      });

      if (burbuja) {
        burbuja.textContent = frases[Math.floor(Math.random() * frases.length)];
      }
    });

    girasol.addEventListener("click", (e) => {
      for (let i = 0; i < 5; i++) {
        const heart = document.createElement("div");
        heart.textContent = "💜";
        heart.style.position = "absolute";

        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;

        heart.style.left = (e.offsetX + offsetX) + "px";
        heart.style.top = (e.offsetY + offsetY) + "px";
        heart.style.pointerEvents = "none";
        heart.style.fontSize = "1.5rem";
        heart.style.animation = "heartFloat 1.5s ease-out forwards";
        heart.style.animationDelay = (i * 0.05) + "s";
        heart.style.setProperty("--dx", ((Math.random() - 0.5) * 80) + "px");

        girasol.appendChild(heart);

        setTimeout(() => heart.remove(), 1800);
      }
    });
  }

  // ============================================
  //  TOGGLE TEMA
  // ============================================
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("light");
      toggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
    });
  }

  // ============================================
  //  MASCOTA VIRTUAL — 9 mascotas
  // ============================================
  const mascota = document.getElementById("mascota");
  const mascotaImg = document.getElementById("mascota-img");
  const mascotaBurbuja = document.getElementById("mascota-burbuja");
  const mascotaSelector = document.getElementById("mascota-selector");
  const mascotaMenu = document.getElementById("mascota-menu");

  const MASCOTAS = {
    mapache: {
      nombre: "Mapache",
      imagen: "img/mapache.png",
      sonido: "chitter",
      frases: [
        "¡Hola! 🦝",
        "¿Vemos los recuerdos?",
        "¡Qué bonito todo!",
        "Soy tu mapache 💛",
        "Ñam ñam... 🍂",
        "¡Súbeme una foto!",
        "Te acompaño siempre 🦝",
        "¿Un abrazo? 🤗",
        "¡Me encanta este rincón!"
      ]
    },
    girasol: {
      nombre: "Girasol",
      imagen: "img/mascota-girasol.png",
      sonido: "twinkle",
      frases: [
        "¡Hola! 🌻",
        "Te doy la bienvenida ✨",
        "Eres mi luz del sol ☀️",
        "¡Qué día tan bonito!",
        "¿Bailamos? 💃",
        "¡Sonríe! 😊",
        "Te quiero mucho 💛",
        "Siempre mirando al sol 🌻",
        "¡Qué calorcito!"
      ]
    },
    gatito: {
      nombre: "Armstrong",
      imagen: "img/gatito.png",
      sonido: "meow",
      frases: [
        "¡Miau! Soy Armstrong 🐱",
        "¿Me das mimos? 🥺",
        "Miau miau... 😺",
        "Soy Armstrong, el gatito negro 🖤",
        "¿Un ratito juntos?",
        "Ronroneo activado 🔊",
        "Tengo ojitos dorados ✨",
        "¡Miau! ¿Jugamos?",
        "Te quiero mucho 🐾",
        "Soy Armstrong, un placer 🎩",
        "Miau elegante y misterioso 🖤"
      ]
    },
    hamburguesa: {
      nombre: "Hamburguesa",
      imagen: "img/hamburguesa.png",
      sonido: "crunch",
      frases: [
        "¡Hola! 🍔",
        "¿Tenemos hambre? 😋",
        "Soy la más rica 🥰",
        "Con queso y todo 🧀",
        "Ñam ñam ñam...",
        "¿Me pides? 🍟",
        "¡Qué rica estoy!",
        "Un mordisco y feliz 😊",
        "¡A comer! 🍽️"
      ]
    },
    oveja: {
      nombre: "Oveja",
      imagen: "img/oveja.png",
      sonido: "baa",
      frases: [
        "¡Beee! 🐑",
        "Soy muy suave 🥰",
        "¿Cuentas ovejitas? 💤",
        "¡Qué sueñito! 😴",
        "Soy de lana suavecita ☁️",
        "¡Beee! 🐏",
        "Te hago compañía 💛",
        "¿Nos dormimos? 🌙",
        "Sueña bonito ✨"
      ]
    },
    pollito: {
      nombre: "Pollito",
      imagen: "img/pollito.png",
      sonido: "peep",
      frases: [
        "¡Pío pío! 🐤",
        "¡Hola! 🐥",
        "Soy un pollito 🐣",
        "¡Qué bonito día! ☀️",
        "¿Jugamos? 🎈",
        "Pío pío pío 🎵",
        "¡Tengo hambre! 🌾",
        "Te quiero mucho 💛",
        "¡Pío pío! 🐤"
      ]
    },
    jirafa: {
      nombre: "Jirafa",
      imagen: "img/jirafa.png",
      sonido: "blip",
      frases: [
        "¡Hola! 🦒",
        "Soy altísima 🌳",
        "Veo todo desde aquí arriba 👀",
        "¿Me das una hoja? 🍃",
        "¡Qué cuello más largo!",
        "Tengo manchitas bonitas 🟤",
        "Hola desde las nubes ☁️",
        "Te veo desde muy lejos 👁️",
        "¡Un abrazo largoooo! 🤗"
      ]
    },
    unicornio: {
      nombre: "Unicornio",
      imagen: "img/unicornio.png",
      sonido: "sparkle",
      frases: [
        "¡Hola! 🦄",
        "Soy mágico ✨",
        "Ay mis hielitos 🌟",
        "Roaf, roaf 🌈",
        "Tenkiu, tenkiu, tenkiu🪄",
        "Soy tierno y mágico 💜",
        "¡Abracadabra! 🎩",
        "Vengo del arcoíris 🌈",
        "Hago magia a tu lado ✨"
      ]
    },
    conejo: {
      nombre: "Conejito",
      imagen: "img/conejito.png",
      sonido: "hop",
      frases: [
        "¡Hola! 🐰",
        "¿Te apetece dar un salto?",
        "¡Ay, brinquemos, brinquemos! 💛",
        "¿Y esa zanahoria? ✨",
        "Ay unicornio, que bonito cuerno tienes. 🐾",
        "Me encanta estar contigo ☁️",
        "¿Nos damos un paseo? 🌼",
        "Dame un poco de esa zanahoria 🥕",
        "Abusadol e,e"
      ]
    }
  };

  let mascotaActual = localStorage.getItem("mascota_actual") || "mapache";
  let burbujaTimeout = null;

  function registrarMascotaConocida(nombre) {
    const conocidas = JSON.parse(localStorage.getItem("mascotas_conocidas") || "[]");
    if (!conocidas.includes(nombre)) {
      conocidas.push(nombre);
      localStorage.setItem("mascotas_conocidas", JSON.stringify(conocidas));
    }
  }

  // ============================================
  //  SINTETIZADOR DE SONIDOS (Web Audio API)
  // ============================================
  let audioContext = null;

  function getAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    return audioContext;
  }

  function tocarTono(freq, duracion, tipo = "sine", volumen = 0.15, delay = 0, freqFinal = null) {
    const ctx = getAudioContext();
    const ahora = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, ahora);
    if (freqFinal) {
      osc.frequency.exponentialRampToValueAtTime(freqFinal, ahora + duracion);
    }

    gain.gain.setValueAtTime(0, ahora);
    gain.gain.linearRampToValueAtTime(volumen, ahora + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ahora);
    osc.stop(ahora + duracion + 0.05);
  }

  function tocarRuido(duracion = 0.15, volumen = 0.2) {
    const ctx = getAudioContext();
    const ahora = ctx.currentTime;
    const bufferSize = ctx.sampleRate * duracion;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volumen, ahora);
    gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ahora);
  }

  function reproducirSonido(tipo) {
    if (!tipo) return;

    try {
      switch (tipo) {
        case "chitter":
          tocarTono(1200, 0.05, "square", 0.08, 0);
          tocarTono(1400, 0.05, "square", 0.08, 0.07);
          tocarTono(1200, 0.05, "square", 0.08, 0.14);
          break;

        case "twinkle":
          tocarTono(880, 0.3, "sine", 0.12, 0);
          tocarTono(1320, 0.4, "sine", 0.10, 0.1);
          break;

        case "meow":
          tocarTono(500, 0.15, "sine", 0.15, 0, 800);
          tocarTono(800, 0.4, "sine", 0.15, 0.15, 400);
          break;

        case "crunch":
          tocarRuido(0.15, 0.2);
          tocarRuido(0.1, 0.15);
          break;

        case "baa":
          tocarTono(600, 0.6, "sawtooth", 0.08, 0, 400);
          break;

        case "peep":
          tocarTono(1800, 0.1, "sine", 0.12, 0);
          tocarTono(2000, 0.08, "sine", 0.12, 0.12);
          break;

        case "blip":
          tocarTono(300, 0.3, "sine", 0.15, 0);
          tocarTono(400, 0.2, "sine", 0.12, 0.15);
          break;

        case "sparkle":
          tocarTono(660, 0.15, "sine", 0.10, 0);
          tocarTono(880, 0.15, "sine", 0.10, 0.1);
          tocarTono(1100, 0.15, "sine", 0.10, 0.2);
          tocarTono(1320, 0.3, "sine", 0.10, 0.3);
          break;

        case "hop":
          tocarTono(420, 0.08, "triangle", 0.1, 0);
          tocarTono(620, 0.1, "triangle", 0.1, 0.08);
          tocarTono(860, 0.12, "triangle", 0.09, 0.16);
          break;

        default:
          tocarTono(600, 0.2, "sine", 0.15, 0);
      }
    } catch (err) {
      console.warn("No se pudo reproducir el sonido:", err);
    }
  }

  if (mascota && mascotaImg && mascotaBurbuja) {

    // ---------- Cambiar mascota ✅ FIX: ahora sí suena al cambiar
    function cambiarMascota(nombre) {
      const datos = MASCOTAS[nombre];
      if (!datos) return;

      mascotaActual = nombre;
      registrarMascotaConocida(nombre);
      mascotaImg.src = datos.imagen;
      mascotaImg.alt = datos.nombre;
      localStorage.setItem("mascota_actual", nombre);
      mascota.classList.toggle("conejo-alto", nombre === "conejo");

      mascotaMenu?.querySelectorAll(".mascota-opcion").forEach((op) => {
        op.classList.toggle("activa", op.dataset.mascota === nombre);
      });

      mascota.classList.remove("saludo");
      void mascota.offsetWidth;
      mascota.classList.add("saludo");

      // 🔊 Sonido de la mascota nueva
      reproducirSonido(datos.sonido);

      decirMascota(`${datos.nombre} ha llegado 💛`, 2500);
    }

    // ---------- Decir frase ----------
    window.decirMascota = function (texto, duracion = 3000) {
      mascotaBurbuja.textContent = texto;
      mascotaBurbuja.classList.add("visible");

      if (burbujaTimeout) clearTimeout(burbujaTimeout);
      burbujaTimeout = setTimeout(() => {
        mascotaBurbuja.classList.remove("visible");
      }, duracion);
    };

    // Compatibilidad con el código antiguo
    window.decirMapache = window.decirMascota;

    function cerrarMenuMascota() {
      mascotaMenu?.classList.remove("open");
      mascotaMenu?.setAttribute("aria-hidden", "true");
    }

    function abrirMenuMascota() {
      mascotaMenu?.classList.add("open");
      mascotaMenu?.setAttribute("aria-hidden", "false");
    }

    // ---------- Click en la mascota ----------
    mascota.addEventListener("click", (e) => {
      if (e.target === mascotaSelector || mascotaSelector.contains(e.target) || mascotaMenu?.contains(e.target)) {
        return;
      }

      e.stopPropagation();
      const clicsKey = `mascota_clicks_${mascotaActual}`;
      const clicsMascota = Number(localStorage.getItem(clicsKey) || 0) + 1;
      localStorage.setItem(clicsKey, String(clicsMascota));
      localStorage.setItem("mascota_clicks", String(Number(localStorage.getItem("mascota_clicks") || 0) + 1));
      window.dispatchEvent(new Event("sunadventures:progress"));

      const sonido = MASCOTAS[mascotaActual].sonido;
      reproducirSonido(sonido);

      mascota.classList.remove("saludo");
      void mascota.offsetWidth;
      mascota.classList.add("saludo");

      const frases = MASCOTAS[mascotaActual].frases;
      const frase = frases[Math.floor(Math.random() * frases.length)];
      decirMascota(frase);
    });

    // ---------- Abrir/cerrar selector ----------
    mascotaSelector?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const abierto = mascotaMenu?.classList.contains("open");
      if (abierto) {
        cerrarMenuMascota();
      } else {
        abrirMenuMascota();
      }
    });

    // ---------- Elegir mascota ✅ FIX: eliminada función duplicada
    mascotaMenu?.querySelectorAll(".mascota-opcion").forEach((op) => {
      op.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cambiarMascota(op.dataset.mascota);
        cerrarMenuMascota();
      });
    });

    // ---------- Click fuera → cerrar ----------
    document.addEventListener("click", (e) => {
      if (!mascotaMenu?.classList.contains("open")) return;

      const pulsadoDentro = mascota.contains(e.target) || mascotaSelector.contains(e.target) || mascotaMenu.contains(e.target);
      if (!pulsadoDentro) {
        cerrarMenuMascota();
      }
    });

    // ---------- Escape → cerrar ----------
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mascotaMenu?.classList.contains("open")) {
        mascotaMenu.classList.remove("open");
        mascotaMenu.setAttribute("aria-hidden", "true");
      }
    });

    // ---------- Aplicar mascota guardada al cargar ----------
    mascotaImg.src = MASCOTAS[mascotaActual].imagen;
    mascotaImg.alt = MASCOTAS[mascotaActual].nombre;
    registrarMascotaConocida(mascotaActual);
    mascota.classList.toggle("conejo-alto", mascotaActual === "conejo");
    mascotaMenu?.querySelectorAll(".mascota-opcion").forEach((op) => {
      op.classList.toggle("activa", op.dataset.mascota === mascotaActual);
    });

    // ---------- Saludo inicial ----------
    setTimeout(() => {
      decirMascota(`¡Hola! Soy tu ${MASCOTAS[mascotaActual].nombre.toLowerCase()} 💛`);
    }, 1500);

    // ---------- Frases periódicas ----------
    setInterval(() => {
      if (!mascotaBurbuja.classList.contains("visible")) {
        const frases = MASCOTAS[mascotaActual].frases;
        const frase = frases[Math.floor(Math.random() * frases.length)];
        decirMascota(frase);
      }
    }, 45000);
  }

   // ============================================
  //  BOTONES DEL LOBBY
  // ============================================
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;

      switch (action) {
        case "descargar":
          abrirModalDescarga();
          break;
        // "playlists", "album" y "notas" ya no son botones:
        // ahora son enlaces <a href="#..."> manejados por el router de album.js
      }
    });
  });


  // ============================================
  //  MODAL DE PLAYLISTS
  // ============================================
  function abrirModalPlaylists() {
    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.setAttribute("aria-hidden", "false");
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3 class="modal-title">🎵 Nuestras Playlists</h3>
        <p style="opacity:0.8; margin-bottom: 1rem;">
          Las canciones que nos recuerdan a nosotros 💛
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <a href="#" target="_blank" class="btn-primary"
             style="text-align:center; text-decoration:none; display:block;">
            🎧 Abrir en Spotify
          </a>
          <a href="#" target="_blank" class="btn-secondary"
             style="text-align:center; text-decoration:none; display:block;">
            ▶️ Abrir en YouTube
          </a>
        </div>
        <div class="modal-actions" style="margin-top: 1.2rem;">
          <button type="button" class="btn-secondary" data-close> Cerrar </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", () => {
        modal.remove();
        document.body.style.overflow = "";
      });
    });
  }

    // ============================================
  //  MODAL DE DESCARGA
  // ============================================
  function abrirModalDescarga() {
    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.setAttribute("aria-hidden", "false");
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3 class="modal-title">📲 Descargar SunAdventures</h3>
        <p style="opacity:0.8; margin-bottom: 0.5rem;">
          Llévanos contigo a todas partes ✨
        </p>
        <div class="download-grid">
          <a class="download-option" href="app/sunadventures.apk" download>
            <span class="download-option-icon">🤖</span>
            <span class="download-option-title">Android</span>
            <span class="download-option-hint">Descargar APK</span>
          </a>
          <button class="download-option" data-platform="ios" type="button">
            <span class="download-option-icon">🍎</span>
            <span class="download-option-title">iOS</span>
            <span class="download-option-hint">Añadir a inicio</span>
          </button>
          <button class="download-option" data-platform="windows" type="button">
            <span class="download-option-icon">🪟</span>
            <span class="download-option-title">Windows</span>
            <span class="download-option-hint">Próximamente</span>
          </button>
          <button class="download-option" data-platform="mac" type="button">
            <span class="download-option-icon">🍏</span>
            <span class="download-option-title">macOS</span>
            <span class="download-option-hint">Próximamente</span>
          </button>
        </div>
        <div class="modal-actions" style="margin-top: 1.2rem;">
          <button type="button" class="btn-secondary" data-close> Cerrar </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    modal.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", () => {
        modal.remove();
        document.body.style.overflow = "";
      });
    });

    modal.querySelectorAll("[data-platform]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;

        switch (platform) {
          case "ios":
            alert("🍎 Ábrela en Safari y pulsa 'Compartir → Añadir a pantalla de inicio'");
            break;
          case "windows":
            alert("🪟 Próximamente: versión de escritorio para Windows");
            break;
          case "mac":
            alert("🍏 Próximamente: versión de escritorio para macOS");
            break;
        }
      });
    });
  }

  // ============================================
  //  PWA — Service Worker + Botón instalar
  // ============================================
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((reg) => console.log("✅ SW registrado:", reg.scope))
        .catch((err) => console.warn("⚠️ Error SW:", err));
    });
  }

  let deferredPrompt = null;
  const btnInstalar = document.getElementById("btn-instalar-app");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstalar) btnInstalar.style.display = "inline-flex";
  });

  if (btnInstalar) {
    btnInstalar.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btnInstalar.style.display = "none";
    });
  }

  window.addEventListener("appinstalled", () => {
    console.log("🎉 App instalada");
    if (btnInstalar) btnInstalar.style.display = "none";
  });

});