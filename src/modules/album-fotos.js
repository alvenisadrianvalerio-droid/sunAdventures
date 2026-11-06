/* ============================================================
   MÓDULO: FOTOS / POLAROIDS / MAPA (album-fotos.js)
   ============================================================ */
(function() {
  const {
    supabase,
    BUCKET_NAME,
    R2_PUBLIC_URL,
    URL_EXPIRY,
    DURACION_CACHE_URL,
    LIMITE_CONCURRENCIA_URLS,
    SVG,
    $,
    parseCoord,
    escapeHtml,
    fmtFecha,
    hoyISO,
    confirmar,
    alertar,
    mostrarLoading,
    ocultarLoading,
    crearBtn,
    activarFullscreen,
    cerrarFullscreen,
    fullscreenInteractivo,
    urlsFirmadasCache
  } = window.AlbumApp;

  let fotos = [];
  let fotoEditando = null;
  let modoSeleccionFotos = false;
  let fotosSeleccionadasIds = new Set();
  let renderEnCurso = false;
  let renderPendiente = false;
  let subiendoFoto = false;

  const grid = $("album-grid"), empty = $("album-empty"), btnAdd = $("btn-add-photo"), btnPastePhotos = $("btn-paste-photos"), inputPastePhotos = $("input-paste-photos"), modal = $("photo-modal"), modalTitle = $("modal-title"), form = $("photo-form");
  const btnSeleccionarFotos = $("btn-seleccionar-fotos"), albumSeleccionBar = $("album-seleccion-bar"), albumSeleccionContador = $("album-seleccion-contador");
  const btnSeleccionarTodas = $("btn-seleccionar-todas"), btnEliminarSeleccionadas = $("btn-eliminar-seleccionadas"), btnCancelarSeleccion = $("btn-cancelar-seleccion");
  const inputPhoto = $("input-photo"), inputPhotoCampo = inputPhoto?.closest(".form-field"), inputDate = $("input-date"), inputNote = $("input-note");
  const preview = $("photo-preview"), photoPreviewInfo = $("photo-preview-info"), submitBtn = form?.querySelector('button[type="submit"]');
  const btnPhotoLocation = $("btn-photo-location"), photoLocationStatus = $("photo-location-status"), inputLat = $("input-lat"), inputLng = $("input-lng");
  const aventurasMap = $("aventuras-map"), mapaEmpty = $("mapa-empty");

  Object.defineProperty(window, "_fotos", { get: () => fotos, configurable: true });

  async function cargarFotos() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { fotos = []; return; }
      const uid = session.user.id;
      const cacheKey = `sunad_fotos_cache_${uid}`;

      // 1. Mostrar fotos desde cache local inmediatamente si aun no estan en memoria
      if (!fotos.length) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length) {
              fotos = parsed;
              window._fotos = fotos;
            }
          }
        } catch (_) {}
      }

      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
      
      let query = supabase.from("fotos")
        .select("id,path,fecha,nota,lat,lng,lugar,grupo_id,user_id")
        .order("created_at", { ascending: false })
        .limit(5000);
      
      if (grupoActivo?.id) {
        let conds = [`grupo_id.eq.${grupoActivo.id}`, `user_id.eq.${uid}`];
        const pareja = window.ParejaSistema?.getPareja?.();
        if (pareja?.id && pareja.id !== uid) {
          conds.push(`user_id.eq.${pareja.id}`);
        } else {
          try {
            const rawPareja = localStorage.getItem(`sunad_pareja_${uid}`);
            if (rawPareja) {
              const parsed = JSON.parse(rawPareja);
              if (parsed?.id && parsed.id !== uid) conds.push(`user_id.eq.${parsed.id}`);
            }
          } catch {}
        }
        query = query.or(conds.join(","));
      } else {
        query = query.eq("user_id", uid);
      }
      
      let { data, error } = await query;

      // Fallback 1: Si la consulta con OR falla o devuelve vacio, consultar directamente por user_id
      if (error || !data || !data.length) {
        try {
          const fbUser = await supabase.from("fotos")
            .select("id,path,fecha,nota,lat,lng,lugar,grupo_id,user_id")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(5000);
          if (fbUser.data && fbUser.data.length) {
            data = fbUser.data;
            error = null;
          }
        } catch (_) {}
      }

      // Fallback 2: Si aun no hay datos y hay grupo activo, consultar directamente por grupo_id
      if ((!data || !data.length) && grupoActivo?.id) {
        try {
          const fbGrupo = await supabase.from("fotos")
            .select("id,path,fecha,nota,lat,lng,lugar,grupo_id,user_id")
            .eq("grupo_id", grupoActivo.id)
            .order("created_at", { ascending: false })
            .limit(5000);
          if (fbGrupo.data && fbGrupo.data.length) {
            data = fbGrupo.data;
            error = null;
          }
        } catch (_) {}
      }

      if (error) {
        console.warn("cargarFotos error final:", error);
        if (!fotos.length) fotos = [];
        return;
      }

      if (data && Array.isArray(data)) {
        fotos = data.map(f => ({ id: f.id, path: f.path, fecha: f.fecha, nota: f.nota, lat: f.lat, lng: f.lng, lugar: f.lugar, grupo_id: f.grupo_id, user_id: f.user_id }));
        window._fotos = fotos;
        try { localStorage.setItem(cacheKey, JSON.stringify(fotos)); } catch (_) {}
      }
    } catch (err) {
      console.warn("cargarFotos exception:", err);
      if (!fotos.length) fotos = [];
    }
  }

  const añadirFotoTabla = async (path, fecha, nota, lat, lng) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");
    const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();
    const { data, error } = await supabase.from("fotos").insert({ user_id: session.user.id, grupo_id: grupoActivo?.id, path, fecha: fecha || null, nota: nota || null, lat: lat || null, lng: lng || null }).select().single();
    if (error) throw error;
    return data;
  };
  const eliminarFotoTabla = async id => { const { error } = await supabase.from("fotos").delete().eq("id", id); if (error) throw error; };
  const actualizarFotoTabla = async (id, fecha, nota, lat, lng) => { const { data, error } = await supabase.from("fotos").update({ fecha: fecha || null, nota: nota || null, lat: lat || null, lng: lng || null }).eq("id", id).select().single(); if (error) throw error; return data; };

  async function obtenerUrlFirmada(path, forzarSupabase = false) {
    try {
      if (!path) return null;
      if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
        return path;
      }
      const cacheKey = forzarSupabase ? `sb_${path}` : path;
      const g = urlsFirmadasCache.get(cacheKey);
      if (g && g.expira > Date.now()) return g.url;
      if (window.SunOffline) {
        const off = await window.SunOffline.obtenerImagenOffline(path);
        if (off) {
          urlsFirmadasCache.set(cacheKey, { url: off, expira: Date.now() + 24 * 3600 * 1000 });
          return off;
        }
      }

      // 1. Usar Cloudflare R2 si está configurado (a menos que se pida forzar Supabase tras error)
      if (R2_PUBLIC_URL && !forzarSupabase) {
        const limpiaPath = path.startsWith("/") ? path.slice(1) : path;
        const r2Url = `${R2_PUBLIC_URL}/${limpiaPath}`;
        urlsFirmadasCache.set(cacheKey, { url: r2Url, expira: Date.now() + DURACION_CACHE_URL });
        return r2Url;
      }

      // 2. Fallback o subidas recientes directas en Supabase storage
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, URL_EXPIRY);
      if (error) return null;
      urlsFirmadasCache.set(cacheKey, { url: data.signedUrl, expira: Date.now() + DURACION_CACHE_URL });
      return data.signedUrl;
    } catch (err) { console.warn("obtenerUrlFirmada:", err); return null; }
  }

  function redimensionarImagen(file, maxSize = 1200, calidad = 0.75) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image();
          img.onload = () => {
            try {
              let { width, height } = img;
              if (width > height && width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              } else if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
              const c = document.createElement("canvas");
              c.width = width;
              c.height = height;
              const ctx = c.getContext("2d");
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, 0, 0, width, height);

              // Probar soporte nativo de toBlob webp con fallback a jpeg
              const mime = c.toDataURL("image/webp").startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
              c.toBlob(b => b ? resolve(b) : reject(new Error("toBlob falló")), mime, calidad);
            } catch (err) { reject(err); }
          };
          img.onerror = reject; img.src = e.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
      } catch (err) { reject(err); }
    });
  }

  // IntersectionObserver para cargar las fotos dinámicamente según el usuario hace scroll
  let observerLazyFotos = null;

  function obtenerObserverLazy() {
    if (observerLazyFotos) return observerLazyFotos;
    if ("IntersectionObserver" in window) {
      observerLazyFotos = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            obs.unobserve(el);
            cargarFotoVisible(el);
          }
        });
      }, {
        root: null,
        rootMargin: "350px 0px", // Precargar con antelación antes de que entre al viewport
        threshold: 0.01
      });
    }
    return observerLazyFotos;
  }

  async function cargarFotoVisible(el) {
    if (!el || el.dataset.fotoCargada === "true") return;
    el.dataset.fotoCargada = "true";
    const path = el.dataset.fotoPath;
    if (!path) return;
    const img = el.querySelector(".polaroid-visual img");
    if (!img) return;

    try {
      const url = await obtenerUrlFirmada(path);
      if (url) {
        asignarUrlImagen(img, path, url);
      }
    } catch (err) {
      console.warn("cargarFotoVisible error:", err);
    }
  }

    const STORAGE_FOTOS_FAV = () => `sa_fotos_fav_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;
  const STORAGE_FOTOS_REAC = () => `sa_fotos_reac_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;

  const REACCIONES_ALBUM = [
    {
      key: "heart",
      label: "Me encanta",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradHeart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff4b72"/>
            <stop offset="60%" stop-color="#e11d48"/>
            <stop offset="100%" stop-color="#be123c"/>
          </linearGradient>
          <radialGradient id="reacShineHeart" cx="35%" cy="30%" r="45%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <path d="M16 28.5C15.3 28.5 4 20.8 4 11.5 4 7 7.5 3.5 12 3.5c2.4 0 4.6 1.1 6 3 1.4-1.9 3.6-3 6-3 4.5 0 8 3.5 8 8 0 9.3-11.3 17-12 17z" fill="url(#reacGradHeart)" stroke="none"/>
        <path d="M11 6.5C8 6.5 6 8.5 6 11.5c0 2 .8 4 2 5.5 1.5-3 3.5-5.5 6-7-1-2.2-2.5-3.5-3-3.5z" fill="url(#reacShineHeart)" stroke="none"/>
      </svg>`
    },
    {
      key: "love",
      label: "Enamorado/a",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradLoveFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffe066"/>
            <stop offset="100%" stop-color="#f59f00"/>
          </linearGradient>
          <linearGradient id="reacGradHeartEyes" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff4b72"/>
            <stop offset="100%" stop-color="#d61f43"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#reacGradLoveFace)" stroke="none"/>
        <!-- Ojo izquierdo de corazón -->
        <path d="M10.8 9.5c-1.6 0-2.8 1.2-2.8 2.8 0 3 4.3 5.4 4.8 5.7.5-.3 4.8-2.7 4.8-5.7 0-1.6-1.2-2.8-2.8-2.8-1 0-1.7.5-2 1.1-.3-.6-1-1.1-2-1.1z" fill="url(#reacGradHeartEyes)" stroke="none" transform="translate(-1.5, 0) scale(0.9)"/>
        <!-- Ojo derecho de corazón -->
        <path d="M21.2 9.5c-1.6 0-2.8 1.2-2.8 2.8 0 3 4.3 5.4 4.8 5.7.5-.3 4.8-2.7 4.8-5.7 0-1.6-1.2-2.8-2.8-2.8-1 0-1.7.5-2 1.1-.3-.6-1-1.1-2-1.1z" fill="url(#reacGradHeartEyes)" stroke="none" transform="translate(1.5, 0) scale(0.9)"/>
        <!-- Sonrisa cálida -->
        <path d="M10.5 20.5c1.3 2.8 3.3 4 5.5 4s4.2-1.2 5.5-4c-1.8.8-3.6 1.2-5.5 1.2s-3.7-.4-5.5-1.2z" fill="#78350f" stroke="none"/>
        <!-- Mejillas sonrosadas -->
        <circle cx="7.5" cy="18.5" r="2.2" fill="#ff6b81" opacity="0.55"/>
        <circle cx="24.5" cy="18.5" r="2.2" fill="#ff6b81" opacity="0.55"/>
      </svg>`
    },
    {
      key: "fire",
      label: "Increíble",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradFireOut" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff3b30"/>
            <stop offset="45%" stop-color="#ff9500"/>
            <stop offset="100%" stop-color="#ff2d55"/>
          </linearGradient>
          <linearGradient id="reacGradFireIn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fff566"/>
            <stop offset="100%" stop-color="#ff9500"/>
          </linearGradient>
        </defs>
        <!-- Fuego exterior -->
        <path d="M16 2.5c-.8 3.5-4.2 7-4.2 12 0 4.8 3.8 8.8 8.4 8.8 3.6 0 6.6-2.4 7.6-5.8.5 6.5-4.7 11.5-11.2 11.5C9.8 29 4.5 23.8 4.5 17c0-6.8 5.2-12.8 11.5-14.5z" fill="url(#reacGradFireOut)" stroke="none"/>
        <!-- Fuego núcleo cálido -->
        <path d="M16.5 13.5c-.4 2.2-2.5 4.2-2.5 6.5 0 2.8 2.2 5 5 5 2.2 0 3.8-1.4 4.5-3.3.3 3.5-2.6 6.3-6.2 6.3-3.6 0-6.5-2.9-6.5-6.5 0-3.8 2.8-6.2 5.7-8z" fill="url(#reacGradFireIn)" stroke="none"/>
      </svg>`
    },
    {
      key: "sunflower",
      label: "Nuestro sol",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradPetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
          <radialGradient id="reacGradCenter" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#92400e"/>
            <stop offset="70%" stop-color="#5a2305"/>
            <stop offset="100%" stop-color="#3d1400"/>
          </radialGradient>
        </defs>
        <!-- Pétalos en corona -->
        <g fill="url(#reacGradPetal)" stroke="#d97706" stroke-width="0.5">
          <circle cx="16" cy="4.5" r="3.2"/>
          <circle cx="16" cy="27.5" r="3.2"/>
          <circle cx="4.5" cy="16" r="3.2"/>
          <circle cx="27.5" cy="16" r="3.2"/>
          <circle cx="7.8" cy="7.8" r="3.2"/>
          <circle cx="24.2" cy="7.8" r="3.2"/>
          <circle cx="7.8" cy="24.2" r="3.2"/>
          <circle cx="24.2" cy="24.2" r="3.2"/>
          <circle cx="11.2" cy="5.2" r="2.8"/>
          <circle cx="20.8" cy="5.2" r="2.8"/>
          <circle cx="11.2" cy="26.8" r="2.8"/>
          <circle cx="20.8" cy="26.8" r="2.8"/>
          <circle cx="5.2" cy="11.2" r="2.8"/>
          <circle cx="5.2" cy="20.8" r="2.8"/>
          <circle cx="26.8" cy="11.2" r="2.8"/>
          <circle cx="26.8" cy="20.8" r="2.8"/>
        </g>
        <!-- Centro cálido con relieve y brillo -->
        <circle cx="16" cy="16" r="6.8" fill="url(#reacGradCenter)" stroke="#f59e0b" stroke-width="1"/>
        <circle cx="14.5" cy="14.5" r="1.8" fill="#fde047" opacity="0.35"/>
      </svg>`
    },
    {
      key: "star",
      label: "Mágico",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff566"/>
            <stop offset="40%" stop-color="#ffcc00"/>
            <stop offset="100%" stop-color="#ff9500"/>
          </linearGradient>
        </defs>
        <!-- Sombra sutil -->
        <path d="M16 2.5l4.2 8.5 9.4 1.4-6.8 6.6 1.6 9.4L16 23.9 7.6 28.4l1.6-9.4-6.8-6.6 9.4-1.4L16 2.5z" fill="url(#reacGradStar)" stroke="#eab308" stroke-width="0.75" stroke-linejoin="round"/>
        <!-- Reflejo interior brillante -->
        <polygon points="16,4.5 19.5,11.5 27,12.6 21.5,18 22.8,25.5 16,21.8" fill="#ffffff" opacity="0.38"/>
      </svg>`
    },
    {
      key: "sparkles",
      label: "Brillante",
      svg: `<svg class="polaroid-reac-svg" viewBox="0 0 32 32" width="26" height="26">
        <defs>
          <linearGradient id="reacGradSparkle1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff6b9d"/>
            <stop offset="50%" stop-color="#c084fc"/>
            <stop offset="100%" stop-color="#60a5fa"/>
          </linearGradient>
          <linearGradient id="reacGradSparkle2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <!-- Gran destello multicolor central -->
        <path d="M14 2c.5 6 4.5 10 10.5 10.5-6 .5-10 4.5-10.5 10.5-.5-6-4.5-10-10.5-10.5 6-.5 10-4.5 10.5-10.5z" fill="url(#reacGradSparkle1)" stroke="none"/>
        <!-- Destello dorado pequeño superior derecho -->
        <path d="M25 15c.3 3.5 2.5 5.7 6 6-3.5.3-5.7 2.5-6 6-.3-3.5-2.5-5.7-6-6 3.5-.3 5.7-2.5 6-6z" fill="url(#reacGradSparkle2)" stroke="none" transform="translate(1, -2) scale(0.7)"/>
        <!-- Mini chispita inferior izquierda -->
        <circle cx="5" cy="24" r="1.5" fill="#fde047"/>
      </svg>`
    }
  ];

  let filtroFotoModo = "todas";
  let busquedaFotoTxt = "";

  function getFotosFav() {
    try { return JSON.parse(localStorage.getItem(STORAGE_FOTOS_FAV()) || "{}"); } catch { return {}; }
  }
  function getFotosReacciones() {
    try { return JSON.parse(localStorage.getItem(STORAGE_FOTOS_REAC()) || "{}"); } catch { return {}; }
  }

  function toggleReaccionFoto(id, reacKey, pillContainer) {
    try {
      const todas = getFotosReacciones();
      if (!todas[id] || typeof todas[id] !== "object") todas[id] = {};
      const actual = Number(todas[id][reacKey]) || 0;
      const miKey = `_mi_${reacKey}`;
      if (todas[id][miKey]) {
        todas[id][reacKey] = Math.max(0, actual - 1);
        if (todas[id][reacKey] === 0) delete todas[id][reacKey];
        delete todas[id][miKey];
      } else {
        todas[id][reacKey] = actual + 1;
        todas[id][miKey] = true;
        const info = REACCIONES_ALBUM.find(r => r.key === reacKey);
        window._sumarAmorPareja?.(4, `Reaccionaste (${info?.label || "Reacción"}) a un recuerdo`);
        try { window._snd?.("pop"); } catch {}
      }
      localStorage.setItem(STORAGE_FOTOS_REAC(), JSON.stringify(todas));
      if (pillContainer) renderReaccionesPolaroid(id, pillContainer);
    } catch {}
  }

  function renderReaccionesPolaroid(id, container) {
    if (!container) return;
    const todas = getFotosReacciones()[id] || {};
    const activas = REACCIONES_ALBUM.filter(r => (Number(todas[r.key]) || 0) > 0);
    container.innerHTML = "";

    activas.forEach(r => {
      const count = Number(todas[r.key]) || 0;
      const esMia = Boolean(todas[`_mi_${r.key}`]);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "polaroid-reac-chip";
      chip.title = `${r.label} (${count})`;
      chip.style.cssText = `padding:4px 9px;border-radius:999px;border:1px solid ${esMia ? "rgba(244,63,94,0.7)" : "rgba(255,255,255,0.2)"};background:${esMia ? "rgba(244,63,94,0.3)" : "rgba(15,23,42,0.75)"};color:#fff;display:inline-flex;align-items:center;gap:6px;cursor:pointer;backdrop-filter:blur(6px);transition:transform 0.15s ease;flex-shrink:0;`;
      chip.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;min-width:22px;min-height:22px;flex-shrink:0;">${r.svg}</span><span style="font-size:0.75rem;font-weight:800;line-height:1;">${count}</span>`;
      chip.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        toggleReaccionFoto(id, r.key, container);
      });
      container.appendChild(chip);
    });

    const btnAddReac = document.createElement("button");
    btnAddReac.type = "button";
    btnAddReac.className = "polaroid-reac-add";
    btnAddReac.title = "Añadir reacción";
    btnAddReac.style.cssText = "padding:5px 10px;border-radius:999px;border:1px solid rgba(251,191,36,0.35);background:rgba(15,23,42,0.8);color:#fde68a;cursor:pointer;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(8px);flex-shrink:0;";
    btnAddReac.innerHTML = `<svg class="polaroid-reac-add-svg" viewBox="0 0 24 24" width="17" height="17" style="width:17px;height:17px;min-width:17px;min-height:17px;display:block;flex-shrink:0;" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><span style="font-size:0.85rem;font-weight:800;line-height:1;color:#fbbf24;">+</span>`;

    btnAddReac.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const prevMenu = container.querySelector(".polaroid-reac-picker");
      if (prevMenu) { prevMenu.remove(); return; }

      const picker = document.createElement("div");
      picker.className = "polaroid-reac-picker";
      REACCIONES_ALBUM.forEach(r => {
        const b = document.createElement("button");
        b.type = "button";
        b.title = r.label;
        b.innerHTML = r.svg;
        b.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();
          picker.remove();
          toggleReaccionFoto(id, r.key, container);
        });
        picker.appendChild(b);
      });
      container.appendChild(picker);
    });

    container.appendChild(btnAddReac);
  }
  function toggleFotoFav(id, btnEl) {
    try {
      const favs = getFotosFav();
      const nuevo = !favs[id];
      if (nuevo) {
        favs[id] = true;
        window._sumarAmorPareja?.(5, "Recuerdo marcado como favorito ❤️");
        try { window._snd?.("pop"); } catch {}
      } else {
        delete favs[id];
      }
      localStorage.setItem(STORAGE_FOTOS_FAV(), JSON.stringify(favs));
      if (btnEl) {
        btnEl.textContent = nuevo ? "❤️" : "🤍";
        btnEl.style.background = nuevo ? "rgba(244,63,94,0.88)" : "rgba(0,0,0,0.45)";
      }
      aplicarFiltrosAlbumDOM();
    } catch {}
  }

  function aplicarFiltrosAlbumDOM() {
    if (!grid) return;
    const favs = getFotosFav();
    grid.querySelectorAll(".polaroid").forEach(el => {
      if (el.getAttribute("data-capsula-activa") === "true") return;
      const fid = el.dataset.fotoId;
      const fotoObj = fotos.find(x => String(x.id) === String(fid));
      let visible = true;
      if (filtroFotoModo === "favs" && !favs[fid]) visible = false;
      if (visible && busquedaFotoTxt && fotoObj) {
        const hay = `${fotoObj.nota || ""} ${fotoObj.fecha || ""} ${fotoObj.lugar || ""}`.toLowerCase();
        if (!hay.includes(busquedaFotoTxt)) visible = false;
      }
      el.style.display = visible ? "" : "none";
    });
  }

  async function iniciarPeliculaRecuerdos() {
    const disponibles = fotos.filter(f => !window.SunCapsulaTiempo?.esFotoCapsulaActiva?.(f.id));
    if (!disponibles.length) {
      return alertar({ title: "Álbum vacío", message: "Añade fotos primero para reproducir la película de recuerdos.", icon: "📸" });
    }
    const overlay = document.createElement("div");
    overlay.id = "album-slideshow-overlay";
    overlay.className = "album-slideshow-overlay";
    overlay.innerHTML = `
      <div class="slideshow-header">
        <div class="slideshow-header-title">
          <img src="img/dashboard/card-album.svg" alt="" width="26" height="26">
          <strong class="slideshow-title-text"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ffd93d;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg> Película de Recuerdos</strong>
          <span id="slideshow-counter" class="slideshow-counter">1 / ${disponibles.length}</span>
        </div>
        <div class="slideshow-header-btns">
          <button type="button" id="slideshow-btn-pause" class="btn-secondary slideshow-btn">⏸ Pausar</button>
          <button type="button" id="slideshow-btn-close" class="btn-primary slideshow-btn">✕ Salir</button>
        </div>
      </div>
      <div id="slideshow-stage" class="slideshow-stage">
        <div class="slideshow-media-container">
          <img id="slideshow-img" src="" alt="Recuerdo" class="slideshow-img">
        </div>
        <div class="slideshow-info">
          <span id="slideshow-date" class="slideshow-date"></span>
          <p id="slideshow-note" class="slideshow-note"></p>
        </div>
      </div>
      <div class="slideshow-controls">
        <button type="button" id="slideshow-prev" class="btn-secondary slideshow-ctrl-btn">← Anterior</button>
        <button type="button" id="slideshow-next" class="btn-secondary slideshow-ctrl-btn">Siguiente →</button>
      </div>
    `;
    document.body.appendChild(overlay);

    let idx = 0;
    let pausado = false;
    const imgEl = overlay.querySelector("#slideshow-img");
    const dateEl = overlay.querySelector("#slideshow-date");
    const noteEl = overlay.querySelector("#slideshow-note");
    const countEl = overlay.querySelector("#slideshow-counter");
    const stageEl = overlay.querySelector("#slideshow-stage");

    const mostrarSlide = async (i) => {
      idx = (i + disponibles.length) % disponibles.length;
      const f = disponibles[idx];
      if (stageEl) { stageEl.style.opacity = "0.35"; stageEl.style.transform = "scale(0.97)"; }
      
      if (imgEl && f.path) {
        // Asignar imagen con fallback automático resiliente
        asignarUrlImagen(imgEl, f.path);
      }
      if (dateEl) dateEl.textContent = f.fecha ? fmtFecha(f.fecha) : "Recuerdo inolvidable";
      if (noteEl) noteEl.textContent = f.nota || "Un momento especial juntos ✨";
      if (countEl) countEl.textContent = `${idx + 1} / ${disponibles.length}`;
      setTimeout(() => {
        if (stageEl) { stageEl.style.opacity = "1"; stageEl.style.transform = "scale(1)"; }
      }, 90);
    };

    await mostrarSlide(0);
    const timer = setInterval(() => {
      if (!pausado && document.body.contains(overlay)) mostrarSlide(idx + 1);
    }, 3800);

    const cerrar = () => {
      clearInterval(timer);
      overlay.remove();
    };
    overlay.querySelector("#slideshow-btn-close")?.addEventListener("click", cerrar);
    overlay.querySelector("#slideshow-prev")?.addEventListener("click", () => mostrarSlide(idx - 1));
    overlay.querySelector("#slideshow-next")?.addEventListener("click", () => mostrarSlide(idx + 1));
    overlay.querySelector("#slideshow-btn-pause")?.addEventListener("click", e => {
      pausado = !pausado;
      e.currentTarget.textContent = pausado ? "▶ Reanudar" : "⏸ Pausar";
    });
  }

  function inyectarBarraAlbumExtras() {
    if (!grid) return;
    const sec = grid.parentElement;
    if (!sec || $("album-extras-toolbar")) return;

    const bar = document.createElement("div");
    bar.id = "album-extras-toolbar";
    bar.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:0 auto 1.2rem;max-width:1100px;padding:0.7rem 1rem;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);";
    bar.innerHTML = `
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="btn-secondary album-filter-chip active" data-album-filter="todas" style="display:inline-flex;align-items:center;gap:6px;padding:0.38rem 0.85rem;font-size:0.78rem;font-weight:600;border-radius:999px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#60a5fa;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Todas
        </button>
        <button type="button" class="btn-secondary album-filter-chip" data-album-filter="favs" style="display:inline-flex;align-items:center;gap:6px;padding:0.38rem 0.85rem;font-size:0.78rem;font-weight:600;border-radius:999px;border-color:rgba(244,63,94,0.45);color:#fda4af;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#f43f5e"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          Favoritas
        </button>
        <button type="button" id="btn-album-mapa-toggle" class="btn-secondary album-filter-chip" data-album-filter="mapa" style="display:inline-flex;align-items:center;gap:6px;padding:0.38rem 0.85rem;font-size:0.78rem;font-weight:600;border-radius:999px;border-color:rgba(52,211,153,0.45);color:#6ee7b7;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#34d399;"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
          Mapa
        </button>
        <button type="button" id="btn-album-slideshow" class="btn-primary" style="display:inline-flex;align-items:center;gap:6px;padding:0.38rem 0.95rem;font-size:0.78rem;font-weight:700;border-radius:999px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#78350f;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
          Película de Recuerdos
        </button>
      </div>
      <div style="flex:1;min-width:190px;max-width:320px;position:relative;display:flex;align-items:center;">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:12px;color:rgba(255,255,255,0.45);pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" id="album-buscador-input" placeholder="Buscar por nota o fecha..." style="width:100%;padding:0.45rem 0.8rem 0.45rem 2.2rem;border-radius:999px;border:1px solid rgba(255,255,255,0.16);background:rgba(0,0,0,0.28);color:#fff;font-size:0.82rem;outline:none;">
      </div>
    `;
    sec.insertBefore(bar, grid);

    const mapContainer = $("aventuras-map-container");

    bar.querySelectorAll("[data-album-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll("[data-album-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const fModo = btn.dataset.albumFilter || "todas";
        
        if (fModo === "mapa") {
          if (grid) grid.style.display = "none";
          if (empty) empty.style.display = "none";
          if (mapContainer) mapContainer.style.display = "block";
          renderMapa();
        } else {
          if (mapContainer) mapContainer.style.display = "none";
          if (grid) grid.style.display = "";
          filtroFotoModo = fModo;
          aplicarFiltrosAlbumDOM();
        }
      });
    });

    $("album-buscador-input")?.addEventListener("input", e => {
      busquedaFotoTxt = (e.target.value || "").trim().toLowerCase();
      aplicarFiltrosAlbumDOM();
    });

    $("btn-album-slideshow")?.addEventListener("click", iniciarPeliculaRecuerdos);
  }

  /* Render progresivo con Lazy Loading en scroll y reconciliación sin parpadeo */
  async function render() {
    if (!grid) return;
    inyectarBarraAlbumExtras();
    if (renderEnCurso) { renderPendiente = true; return; }
    renderEnCurso = true;
    try {
      if (fotos.length === 0) {
        grid.innerHTML = "";
        empty?.classList.remove("hidden");
        renderEnCurso = false;
        return;
      }
      empty?.classList.add("hidden");

      const obs = obtenerObserverLazy();

      // Mapa de elementos polaroid existentes en el DOM para preservarlos sin parpadeo
      const existentes = new Map();
      grid.querySelectorAll(".polaroid").forEach(el => {
        const id = el.dataset.fotoId;
        if (id) existentes.set(id, el);
      });

      // Si el modo de selección cambió o el DOM fue manipulado externamente, limpiar
      const targetIds = new Set(fotos.map(f => f.id));
      // Eliminar elementos que ya no existen en el array de fotos
      existentes.forEach((el, id) => {
        if (!targetIds.has(id)) {
          if (obs) obs.unobserve(el);
          el.remove();
        }
      });

      // Renderizado por lotes (chunked) manteniendo orden y reutilizando nodos sin parpadeo
      const BATCH_SIZE = 36;
      let indiceActual = 0;

      function renderSiguienteLote() {
        if (!grid || !renderEnCurso) return;
        const fin = Math.min(indiceActual + BATCH_SIZE, fotos.length);

        for (let i = indiceActual; i < fin; i++) {
          const foto = fotos[i];
          const actualEnPos = grid.children[i];
          let el = existentes.get(foto.id);

          if (!el) {
            // Elemento nuevo: crearlo y observarlo
            el = crearPolaroid(foto, null);
            if (el) {
              if (actualEnPos) {
                grid.insertBefore(el, actualEnPos);
              } else {
                grid.appendChild(el);
              }
              existentes.set(foto.id, el);
              if (obs) {
                obs.observe(el);
              } else {
                cargarFotoVisible(el);
              }
            }
          } else {
            // Elemento ya existente: si la posición cambió por ordenamiento, moverlo sin recrear el nodo <img>
            if (actualEnPos !== el) {
              grid.insertBefore(el, actualEnPos || null);
            }
            // Asegurar que si aún no ha cargado y no está en observer, se observe
            if (el.dataset.fotoCargada !== "true" && obs) {
              obs.observe(el);
            }
          }
        }

        indiceActual = fin;

        if (indiceActual < fotos.length) {
          requestAnimationFrame(renderSiguienteLote);
        } else {
          renderEnCurso = false;
          aplicarFiltrosAlbumDOM();
          if (renderPendiente) {
            renderPendiente = false;
            render();
          }
        }
      }

      renderSiguienteLote();

      if (document.querySelector("[data-view].active")?.dataset.view === "mapa") renderMapa();
      return;
    } catch (err) {
      console.warn("render:", err);
      renderEnCurso = false;
      if (renderPendiente) { renderPendiente = false; render(); }
    }
  }

  function asignarUrlImagen(img, path, url) {
    if (!img) return;
    img.onerror = async () => {
      img.onerror = null; // evitar bucle infinito
      console.warn("Fallo al cargar imagen desde CDN/R2, recurriendo a Supabase:", path);
      try {
        const fallbackUrl = await obtenerUrlFirmada(path, true);
        if (fallbackUrl && fallbackUrl !== img.src) {
          img.onerror = () => {
            img.onerror = null;
            img.style.opacity = "0.6";
            img.alt = "Imagen no disponible (puedes borrarla)";
          };
          img.src = fallbackUrl;
          img.style.opacity = "1";
          return;
        }
      } catch (e) {
        console.warn("Error en fallback de imagen:", e);
      }
      img.style.opacity = "0.6";
      img.alt = "Imagen no disponible (puedes borrarla)";
    };
    img.src = url;
    img.style.opacity = "1";
  }

  function crearPolaroid(foto, url) {
    try {
      const article = document.createElement("article");
      article.className = "polaroid";
      article.dataset.fotoId = foto.id;
      article.dataset.fotoPath = foto.path || "";

      // Si la foto está sellada en una cápsula del tiempo no abierta, ocultarla de inmediato para no mostrarla fuera del mazo
      let esCapsula = false;
      try {
        if (window.SunCapsulaTiempo?.esFotoCapsulaActiva) {
          esCapsula = window.SunCapsulaTiempo.esFotoCapsulaActiva(foto.id);
        } else {
          // Búsqueda de respaldo en localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("sunad_capsulas_")) {
              const val = localStorage.getItem(k);
              if (val && val.includes(`"${foto.id}"`)) {
                const parsed = JSON.parse(val);
                if (parsed[foto.id] && !parsed[foto.id].abierta) {
                  esCapsula = true;
                  break;
                }
              }
            }
          }
        }
      } catch (_) {}

      if (esCapsula) {
        article.setAttribute("data-capsula-activa", "true");
        article.style.display = "none";
      }

      if (modoSeleccionFotos) {
        article.classList.add("modo-seleccion");
        const estaSel = fotosSeleccionadasIds.has(foto.id);
        if (estaSel) article.classList.add("seleccionada");

        const checkIndicator = document.createElement("div");
        checkIndicator.className = "polaroid-checkbox-indicator";
        checkIndicator.textContent = estaSel ? "✓" : "";
        article.appendChild(checkIndicator);

        article.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          toggleSeleccionFoto(foto.id);
        });
      }

      const img = document.createElement("img");
      img.decoding = "async";
      img.width = 300;
      img.height = 300;
      if (url) {
        asignarUrlImagen(img, foto.path, url);
      } else {
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E";
        img.style.opacity = "0.35";
        img.style.transition = "opacity 0.3s ease";
      }
      img.alt = foto.nota || "Recuerdo";
      img.loading = "lazy";
      const nota = document.createElement("div"); nota.className = "polaroid-nota";
      if (foto.fecha) { const f = document.createElement("span"); f.className = "polaroid-fecha"; f.textContent = fmtFecha(foto.fecha); nota.appendChild(f); }
      if (foto.nota) { const p = document.createElement("p"); p.textContent = foto.nota; nota.appendChild(p); }
      const visual = document.createElement("div"); visual.className = "polaroid-visual"; visual.append(img, nota);
      article.append(visual);

      if (!modoSeleccionFotos) {
        fullscreenInteractivo(article);
        const btnDel = crearBtn("polaroid-delete", SVG.trash, "Eliminar foto", e => {
          e.preventDefault();
          e.stopPropagation();
          eliminarFoto(foto.id);
        });
        const btnEdit = crearBtn("polaroid-edit", SVG.edit, "Editar", e => {
          e.preventDefault();
          e.stopPropagation();
          abrirModal(foto);
        });
        const btnFull = crearBtn("polaroid-fullscreen", SVG.expand, "Pantalla completa", e => {
          e.preventDefault();
          e.stopPropagation();
          if (document.fullscreenElement === article) { cerrarFullscreen(); return; }
          activarFullscreen(article, btnFull);
        });
        const btnClose = crearBtn("polaroid-close", SVG.close, "Salir", e => {
          e.preventDefault();
          e.stopPropagation();
          cerrarFullscreen();
        });

        const esFav = Boolean(getFotosFav()[foto.id]);
        const btnFav = document.createElement("button");
        btnFav.type = "button";
        btnFav.className = "polaroid-fav-btn";
        btnFav.title = "Marcar como favorita";
        btnFav.style.cssText = `position:absolute;top:8px;right:78px;z-index:15;width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;background:${esFav ? "rgba(244,63,94,0.88)" : "rgba(0,0,0,0.45)"};color:#fff;font-size:0.85rem;display:inline-flex;align-items:center;justify-content:center;`;
        btnFav.textContent = esFav ? "❤️" : "🤍";
        btnFav.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          toggleFotoFav(foto.id, btnFav);
        });

        // Barra de reacciones múltiples sobre la esquina inferior izquierda de la foto
        const reacBar = document.createElement("div");
        reacBar.className = "polaroid-reacciones-bar";
        reacBar.style.cssText = "position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:6px;padding-top:4px;z-index:6;";
        renderReaccionesPolaroid(foto.id, reacBar);
        nota.appendChild(reacBar);

        // Asegurar que toques en dispositivos táctiles no sean interceptados por gestos de la tarjeta
        [btnDel, btnEdit, btnFull, btnClose, btnFav, reacBar].forEach(btn => {
          btn.addEventListener("touchstart", e => e.stopPropagation(), { passive: true });
          btn.addEventListener("touchend", e => e.stopPropagation());
        });

        article.append(btnDel, btnEdit, btnFull, btnClose, btnFav);
      }

      return article;
    } catch (err) { console.warn("crearPolaroid:", err); return null; }
  }

  async function abrirModal(fotoParaEditar = null) {
    try {
      const modalEl = document.getElementById("photo-modal") || modal;
      if (!modalEl) {
        console.warn('abrirModal: no modal');
        return;
      }
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        try { await cerrarFullscreen(); } catch (_) {}
        // Breve pausa para permitir que el navegador restaure el viewport
        await new Promise(r => setTimeout(r, 60));
      }
      fotoEditando = fotoParaEditar;
      
      modalEl.classList.add('active');
      modalEl.setAttribute('aria-hidden', 'false');
      modalEl.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      const fForm = document.getElementById("photo-form") || form;
      fForm?.reset();

      const fInputPhoto = document.getElementById("input-photo") || inputPhoto;
      const fInputCampo = fInputPhoto?.closest(".form-field") || inputPhotoCampo;
      if (fInputPhoto) fInputPhoto.required = !fotoParaEditar;
      if (fInputCampo) fInputCampo.hidden = Boolean(fotoParaEditar);

      const fInputDate = document.getElementById("input-date") || inputDate;
      const fInputNote = document.getElementById("input-note") || inputNote;
      const fInputLat = document.getElementById("input-lat") || inputLat;
      const fInputLng = document.getElementById("input-lng") || inputLng;

      if (fotoParaEditar) {
        if (fInputDate) fInputDate.value = fotoParaEditar.fecha || "";
        if (fInputNote) fInputNote.value = fotoParaEditar.nota || "";
        if (fInputLat) fInputLat.value = fotoParaEditar.lat || "";
        if (fInputLng) fInputLng.value = fotoParaEditar.lng || "";
      } else if (fInputDate) {
        fInputDate.value = new Date().toISOString().split("T")[0];
      }

      actualizarEstadoUbicacion();

      const fPreview = document.getElementById("photo-preview") || preview;
      if (fPreview) {
        let prevUrl = null;
        if (fotoParaEditar && fotoParaEditar.path) {
          try { prevUrl = await obtenerUrlFirmada(fotoParaEditar.path); } catch (_) {}
        }
        mostrarContenidoVistaPrevia(prevUrl);
      }

      const fTitle = document.getElementById("modal-title") || modalTitle;
      if (fTitle) fTitle.textContent = fotoParaEditar ? "Editar recuerdo" : "Nuevo recuerdo";

      const fSubmit = fForm?.querySelector('button[type="submit"]') || submitBtn;
      if (fSubmit) {
        fSubmit.disabled = false;
        fSubmit.textContent = fotoParaEditar ? "Actualizar recuerdo" : "Guardar recuerdo";
      }
    } catch (err) {
      console.warn("abrirModal:", err);
    }
  }

  function cerrarModal() {
    try {
      const modalEl = document.getElementById("photo-modal") || modal;
      if (modalEl) {
        modalEl.classList.remove("active");
        modalEl.setAttribute("aria-hidden", "true");
        modalEl.style.display = "";
      }
      document.body.style.overflow = "";
      fotoEditando = null;

      const fInputPhoto = document.getElementById("input-photo") || inputPhoto;
      const fInputCampo = fInputPhoto?.closest(".form-field") || inputPhotoCampo;
      if (fInputPhoto) fInputPhoto.required = true;
      if (fInputCampo) fInputCampo.hidden = false;

      const fTitle = document.getElementById("modal-title") || modalTitle;
      if (fTitle) fTitle.textContent = "Nuevo recuerdo";
    } catch (err) {
      console.warn("cerrarModal:", err);
    }
  }

  function actualizarEstadoUbicacion() {
    if (!photoLocationStatus) return;
    photoLocationStatus.textContent = inputLat?.value && inputLng?.value ? `Ubicación lista: ${Number(inputLat.value).toFixed(4)}, ${Number(inputLng.value).toFixed(4)}` : "No se guardará hasta que tú lo elijas.";
  }

  btnPhotoLocation?.addEventListener("click", () => {
    try {
      if (!navigator.geolocation) { if (photoLocationStatus) photoLocationStatus.textContent = "Tu navegador no permite ubicación."; return; }
      btnPhotoLocation.disabled = true;
      if (photoLocationStatus) photoLocationStatus.textContent = "Obteniendo ubicación...";
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => { inputLat.value = coords.latitude; inputLng.value = coords.longitude; actualizarEstadoUbicacion(); btnPhotoLocation.disabled = false; },
        () => { if (photoLocationStatus) photoLocationStatus.textContent = "No se pudo obtener la ubicación."; btnPhotoLocation.disabled = false; },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } catch (err) { console.warn("geolocation:", err); btnPhotoLocation.disabled = false; }
  });

  let mapaLeaflet = null;
  function renderMapa() {
    try {
      if (!aventurasMap || typeof window.L === "undefined") return;
      const ubicadas = fotos.filter(f => f.lat != null && f.lng != null && f.lat !== "" && f.lng !== "" && Number.isFinite(Number(f.lat)) && Number.isFinite(Number(f.lng)));
      mapaEmpty?.classList.toggle("hidden", ubicadas.length > 0);
      if (!mapaLeaflet) {
        mapaLeaflet = L.map(aventurasMap, { zoomControl: true }).setView([20, 0], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19
        }).addTo(mapaLeaflet);
      }
      mapaLeaflet.eachLayer(l => { if (l instanceof L.Marker) mapaLeaflet.removeLayer(l); });
      const puntos = [];
      
      const pinIcon = L.divIcon({
        className: "custom-sun-pin",
        html: `<div style="background:linear-gradient(135deg,#ffd93d,#f59e0b);color:#1e1b18;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:2.5px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,0.45);font-size:16px;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      ubicadas.forEach(f => {
        const lat = Number(f.lat), lng = Number(f.lng);
        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(mapaLeaflet);
        const rawUrl = f.url || (f.path ? `https://pub-28303b7c8dfb445585f9bb27efc92131.r2.dev/${f.path}` : "");
        const safeUrl = rawUrl && /^https?:\/\//i.test(rawUrl) ? escapeHtml(rawUrl) : "";
        marker.bindPopup(`
          <div style="font-family:system-ui,-apple-system,sans-serif;min-width:180px;max-width:240px;padding:4px;">
            ${safeUrl ? `<img src="${safeUrl}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:6px;display:block;">` : ""}
            <strong style="color:#d97706;font-size:0.85rem;display:block;margin-bottom:3px;">${f.fecha ? fmtFecha(f.fecha) : "Recuerdo"}</strong>
            <p style="margin:0;font-size:0.88rem;color:#1e293b;line-height:1.35;word-break:break-word;">${escapeHtml(f.nota || "Sin nota")}</p>
          </div>
        `);
        puntos.push([lat, lng]);
      });
      if (puntos.length) {
        mapaLeaflet.fitBounds(L.latLngBounds(puntos), { padding: [35, 35], maxZoom: 13 });
      }
      setTimeout(() => mapaLeaflet?.invalidateSize(), 150);
    } catch (err) { console.warn("renderMapa:", err); }
  }

  /* Listeners modal y previews */
  if (btnAdd) btnAdd.addEventListener("click", () => abrirModal());
  document.addEventListener('click', function(e) {
    const btn = e.target && e.target.closest && e.target.closest('#btn-add-photo');
    if (btn) {
      e.preventDefault();
      abrirModal();
    }
  });
  window.abrirModalRecuerdo = function() { abrirModal(); };
  document.addEventListener("click", function(e) {
    const closeBtn = e.target && e.target.closest && e.target.closest("#photo-modal [data-close-modal]");
    if (closeBtn) {
      e.preventDefault();
      cerrarModal();
    }
  });
  modal?.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", cerrarModal));

  inputPhoto?.addEventListener("change", () => { mostrarVistaPreviaFoto(inputPhoto.files?.[0] || null); actualizarVistaPreviaFotoInfo(); });
  inputDate?.addEventListener("change", () => { const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note"); actualizarContenidoVistaPrevia(date, note); actualizarVistaPreviaFotoInfo(); });
  inputNote?.addEventListener("input", () => { const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note"); actualizarContenidoVistaPrevia(date, note); actualizarVistaPreviaFotoInfo(); });

  function mostrarVistaPreviaFoto(file) {
    if (!file) { mostrarContenidoVistaPrevia(null); return; }
    mostrarContenidoVistaPrevia(URL.createObjectURL(file));
  }
  function mostrarContenidoVistaPrevia(url) {
    if (!preview) return;
    preview.innerHTML = "";
    if (url) { const img = document.createElement("img"); img.src = url; img.alt = "Vista previa"; preview.appendChild(img); }
    else { const ph = document.createElement("div"); ph.className = "photo-preview-placeholder"; ph.textContent = "Selecciona una foto para verla aquí"; preview.appendChild(ph); }
    const cap = document.createElement("div"); cap.className = "photo-preview-caption";
    const date = document.createElement("span"); date.className = "photo-preview-date";
    const note = document.createElement("p"); note.className = "photo-preview-note";
    cap.append(date, note); preview.appendChild(cap);
    actualizarContenidoVistaPrevia(date, note);
  }
  function actualizarContenidoVistaPrevia(date, note) {
    if (date) date.textContent = inputDate?.value ? fmtFecha(inputDate.value) : "Sin fecha";
    if (note) note.textContent = inputNote?.value.trim() || "Tu nota aparecerá aquí";
  }
  function actualizarVistaPreviaFotoInfo() {
    const date = preview?.querySelector(".photo-preview-date"), note = preview?.querySelector(".photo-preview-note");
    actualizarContenidoVistaPrevia(date, note);
    if (!photoPreviewInfo) return;
    const hayFoto = Boolean(inputPhoto?.files?.length);
    photoPreviewInfo.hidden = !hayFoto;
    if (hayFoto) { const fecha = inputDate?.value || "Sin fecha"; const texto = inputNote?.value.trim(); photoPreviewInfo.textContent = texto ? `${fecha} · ${texto}` : fecha; }
  }

  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (subiendoFoto) return;
    subiendoFoto = true;
    try {
      const fecha = inputDate?.value || "", nota = inputNote?.value.trim() || "";
      if (fotoEditando) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Actualizando..."; }
        try {
          const act = await actualizarFotoTabla(fotoEditando.id, fecha, nota, parseCoord(inputLat?.value), parseCoord(inputLng?.value));
          const idx = fotos.findIndex(f => f.id === fotoEditando.id);
          if (idx !== -1) fotos[idx] = { ...fotos[idx], fecha: act.fecha, nota: act.nota, lat: act.lat, lng: act.lng };
          cerrarModal(); await render(); window.dispatchEvent(new Event("sunad:progress"));
        } catch (err) { alertar({ title: "No se pudo actualizar", message: err.message || String(err), variant: "danger" }); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Actualizar recuerdo"; } }
        finally { subiendoFoto = false; }
        return;
      }
      const file = inputPhoto?.files[0];
      if (!file) { alertar({ title: "Falta la foto", message: "Selecciona una imagen primero.", icon: "📸" }); subiendoFoto = false; return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Subiendo..."; }
      mostrarLoading("Guardando recuerdo...");
      try {
        const blob = await redimensionarImagen(file, 1200, 0.75);
        const ext = blob.type === "image/webp" ? "webp" : "jpg";
        const filePath = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob, { contentType: blob.type || "image/jpeg" });
        if (upErr) throw upErr;
        const nueva = await añadirFotoTabla(filePath, fecha, nota, parseCoord(inputLat?.value), parseCoord(inputLng?.value));
        fotos.unshift({ id: nueva.id, path: nueva.path, fecha: nueva.fecha, nota: nueva.nota, lat: nueva.lat, lng: nueva.lng });
        cerrarModal(); await render(); window.dispatchEvent(new Event("sunad:progress"));
      } catch (err) { alertar({ title: "No se pudo subir", message: err.message || String(err), variant: "danger" }); if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Guardar recuerdo"; } }
      finally { subiendoFoto = false; ocultarLoading(); }
    } catch (err) { console.error(err); subiendoFoto = false; ocultarLoading(); }
  });

  /* Múltiples fotos y selección */
  async function procesarYSubirFotosMultiples(archivos) {
    if (!archivos || !archivos.length) return;
    const imagenes = Array.from(archivos).filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(f.name));
    if (!imagenes.length) return alertar({ title: "Sin imágenes válidas", message: "No se encontraron archivos de imagen en lo que intentaste pegar.", icon: "📸" });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alertar({ title: "Inicia sesión", message: "Debes iniciar sesión para subir fotos al álbum.", icon: "🔒" });
    const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
    if (!grupoActivo) return alertar({ title: "Sin grupo", message: "No se encontró un grupo activo para guardar las fotos.", icon: "👥" });

    const hoy = hoyISO();
    let subidas = 0, fallidas = 0, completadas = 0;
    const nuevasFotos = [];
    mostrarLoading(`Guardando ${imagenes.length} polaroids (0/${imagenes.length})...`);

    const CONCURRENCIA_SUBIDA = 4;
    let indiceSiguiente = 0;

    const subirUnaFotoConReintento = async (img, retries = 2) => {
      let ultimoError = null;
      for (let intento = 0; intento <= retries; intento++) {
        try {
          const blob = await redimensionarImagen(img, 1200, 0.75);
          const ext = blob.type === "image/webp" ? "webp" : "jpg";
          const filePath = `fotos/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
          const { error: upErr } = await supabase.storage.from(BUCKET_NAME).upload(filePath, blob, { contentType: blob.type || "image/jpeg" });
          if (upErr) throw upErr;
          const nueva = await añadirFotoTabla(filePath, hoy, null, null, null);
          return { id: nueva.id, path: nueva.path, fecha: nueva.fecha, nota: nueva.nota, lat: nueva.lat, lng: nueva.lng, lugar: nueva.lugar, grupo_id: nueva.grupo_id };
        } catch (e) {
          ultimoError = e;
          if (intento < retries) await new Promise(r => setTimeout(r, 600 * (intento + 1)));
        }
      }
      throw ultimoError;
    };

    const worker = async () => {
      while (indiceSiguiente < imagenes.length) {
        const indiceActual = indiceSiguiente++;
        const img = imagenes[indiceActual];
        try {
          const fotoGuardada = await subirUnaFotoConReintento(img);
          nuevasFotos.push(fotoGuardada);
          subidas++;
        } catch (err) {
          console.warn(`Error al subir foto #${indiceActual + 1}:`, err);
          fallidas++;
        } finally {
          completadas++;
          const lt = $("loading-text");
          if (lt) lt.textContent = `Guardando polaroids (${completadas}/${imagenes.length}) · ${subidas} listas...`;
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCIA_SUBIDA, imagenes.length) }, () => worker()));

    if (nuevasFotos.length) fotos = [...nuevasFotos, ...fotos];

    ocultarLoading();
    await render();
    window.dispatchEvent(new Event("sunad:progress"));

    if (subidas > 0) alertar({ title: "¡Recuerdos guardados!", message: `Se ${subidas === 1 ? 'ha agregado 1 polaroid' : `han agregado ${subidas} polaroids`} al álbum${fallidas > 0 ? ` (${fallidas} fallaron)` : ''}.`, icon: "📷" });
    else alertar({ title: "Error al guardar", message: "No se pudieron subir las imágenes copiadas.", variant: "danger" });
  }

  async function pegarFotosDelPortapapeles() {
    let archivosEncontrados = [];
    if (navigator.clipboard && typeof navigator.clipboard.read === "function") {
      try {
        const items = await navigator.clipboard.read();
        if (items && items.length) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const tiposImg = (item.types || []).filter(t => t.startsWith("image/"));
            for (const tipo of tiposImg) {
              try {
                const blob = await item.getType(tipo);
                if (blob && blob.size > 0) {
                  const ext = (tipo.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");
                  const file = new File([blob], `polaroid_${Date.now()}_${i}.${ext}`, { type: tipo });
                  archivosEncontrados.push(file);
                }
              } catch (e) { console.warn("getType error:", e); }
            }
          }
        }
      } catch (err) { console.info("Clipboard API read() no disponible:", err); }
    }
    if (archivosEncontrados.length > 0) await procesarYSubirFotosMultiples(archivosEncontrados);
    else inputPastePhotos?.click();
  }

  btnPastePhotos?.addEventListener("click", async () => pegarFotosDelPortapapeles());
  inputPastePhotos?.addEventListener("change", async () => {
    if (inputPastePhotos.files && inputPastePhotos.files.length) {
      const files = Array.from(inputPastePhotos.files);
      inputPastePhotos.value = "";
      await procesarYSubirFotosMultiples(files);
    }
  });

  window.addEventListener("paste", async e => {
    const vistaActiva = document.querySelector("[data-view].active")?.dataset.view;
    if (vistaActiva !== "album") return;
    const targetTag = e.target?.tagName?.toLowerCase();
    if (targetTag === "input" || targetTag === "textarea") return;
    const items = e.clipboardData?.items;
    if (!items || !items.length) return;
    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) { e.preventDefault(); await procesarYSubirFotosMultiples(files); }
  });

  function actualizarUISeleccionFotos() {
    if (!albumSeleccionBar) return;
    if (modoSeleccionFotos) {
      albumSeleccionBar.classList.remove("hidden");
      if (btnSeleccionarFotos) btnSeleccionarFotos.classList.add("active");
      const cant = fotosSeleccionadasIds.size;
      if (albumSeleccionContador) albumSeleccionContador.textContent = `${cant} foto${cant === 1 ? '' : 's'} seleccionada${cant === 1 ? '' : 's'}`;
      if (btnEliminarSeleccionadas) btnEliminarSeleccionadas.disabled = cant === 0;
    } else {
      albumSeleccionBar.classList.add("hidden");
      if (btnSeleccionarFotos) btnSeleccionarFotos.classList.remove("active");
      fotosSeleccionadasIds.clear();
    }
  }

  function toggleSeleccionFoto(id) {
    if (fotosSeleccionadasIds.has(id)) fotosSeleccionadasIds.delete(id);
    else fotosSeleccionadasIds.add(id);
    const card = grid?.querySelector(`[data-foto-id="${id}"]`);
    if (card) {
      const estaSel = fotosSeleccionadasIds.has(id);
      card.classList.toggle("seleccionada", estaSel);
      const ind = card.querySelector(".polaroid-checkbox-indicator");
      if (ind) ind.textContent = estaSel ? "✓" : "";
    }
    actualizarUISeleccionFotos();
  }

  function activarModoSeleccion(activar = true) {
    modoSeleccionFotos = activar;
    if (!activar) fotosSeleccionadasIds.clear();
    actualizarUISeleccionFotos();
    render();
  }

  btnSeleccionarFotos?.addEventListener("click", () => activarModoSeleccion(!modoSeleccionFotos));
  btnCancelarSeleccion?.addEventListener("click", () => activarModoSeleccion(false));
  btnSeleccionarTodas?.addEventListener("click", () => {
    if (!modoSeleccionFotos) modoSeleccionFotos = true;
    if (fotosSeleccionadasIds.size === fotos.length) fotosSeleccionadasIds.clear();
    else fotosSeleccionadasIds = new Set(fotos.map(f => f.id));
    actualizarUISeleccionFotos();
    render();
  });

  btnEliminarSeleccionadas?.addEventListener("click", async () => {
    const ids = Array.from(fotosSeleccionadasIds);
    if (!ids.length) return;
    const ok = await confirmar({ title: `¿Eliminar ${ids.length} polaroid${ids.length === 1 ? '' : 's'}?`, message: "Las fotos seleccionadas se borrarán permanentemente del álbum.", variant: "danger", icon: SVG.trash, confirmText: `Sí, eliminar ${ids.length}`, cancelText: "Cancelar" });
    if (!ok) return;

    mostrarLoading(`Eliminando ${ids.length} polaroids...`);
    try {
      const fotosParaBorrar = fotos.filter(f => ids.includes(f.id));
      const pathsStorage = fotosParaBorrar.map(f => f.path).filter(Boolean);
      if (pathsStorage.length) {
        try { await supabase.storage.from(BUCKET_NAME).remove(pathsStorage); } catch (e) { console.warn("Storage remove batch error:", e); }
      }
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const { error: dbErr } = await supabase.from("fotos").delete().in("id", chunk);
        if (dbErr) throw dbErr;
      }
      pathsStorage.forEach(p => urlsFirmadasCache.delete(p));
      const idSet = new Set(ids);
      fotos = fotos.filter(f => !idSet.has(f.id));
      activarModoSeleccion(false);
      await render();
      window.dispatchEvent(new Event("sunad:progress"));
      alertar({ title: "Fotos eliminadas", message: `Se eliminaron correctamente ${ids.length} polaroid${ids.length === 1 ? '' : 's'}.`, icon: SVG.trash });
    } catch (err) {
      console.error("Error al eliminar fotos seleccionadas:", err);
      alertar({ title: "Error al eliminar", message: "Ocurrió un problema: " + (err.message || err), variant: "danger" });
    } finally {
      ocultarLoading();
    }
  });

  async function eliminarFoto(id) {
    try {
      const foto = fotos.find(f => f.id === id);
      if (!foto) {
        console.warn("eliminarFoto: No se encontró la foto con id:", id);
        return;
      }

      const ok = await confirmar({
        title: "¿Eliminar esta aventura?",
        message: "La foto se borrará del álbum para siempre.",
        variant: "danger",
        icon: SVG.trash,
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar"
      });
      if (!ok) return;

      mostrarLoading("Eliminando polaroid...");
      try {
        if (foto.path) {
          try { await supabase.storage.from(BUCKET_NAME).remove([foto.path]); } catch (eStorage) { console.warn("Fallo storage remove:", eStorage); }
        }
        await eliminarFotoTabla(foto.id);
        fotos = fotos.filter(f => f.id !== id);
        if (foto.path) urlsFirmadasCache.delete(foto.path);

        // Limpiar de cápsula si estuviera registrada
        try {
          const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
          const storageKey = `sunad_capsulas_${uid}`;
          const capsulas = JSON.parse(localStorage.getItem(storageKey) || "{}");
          if (capsulas[foto.id]) {
            delete capsulas[foto.id];
            localStorage.setItem(storageKey, JSON.stringify(capsulas));
          }
        } catch (_) { }

        await render();
        window.dispatchEvent(new Event("sunad:progress"));
        alertar({ title: "Foto eliminada", message: "La polaroid ha sido eliminada con éxito.", icon: SVG.trash });
      } finally {
        ocultarLoading();
      }
    } catch (err) {
      console.error("Error al eliminar foto:", err);
      ocultarLoading();
      alertar({ title: "Error al eliminar", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" });
    }
  }

  window.addEventListener("sunad:fotos-recargar", () => { cargarFotos().then(render); });

  window.AlbumApp.modules.fotos = {
    cargarFotos,
    render,
    renderMapa,
    abrirModal,
    cerrarModal,
    getFotos: () => fotos,
    setFotos: f => { fotos = f; window._fotos = f; }
  };
})();

