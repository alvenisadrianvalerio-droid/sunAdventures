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
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
      const uid = session.user.id;
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
      
      const { data, error } = await query;
      if (error) { console.warn("cargarFotos error:", error); fotos = []; return; }
      fotos = (data || []).map(f => ({ id: f.id, path: f.path, fecha: f.fecha, nota: f.nota, lat: f.lat, lng: f.lng, lugar: f.lugar, grupo_id: f.grupo_id, user_id: f.user_id }));
      window._fotos = fotos;
    } catch (err) { console.warn("cargarFotos:", err); fotos = []; }
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
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#f43f5e"/></svg>`
    },
    {
      key: "love",
      label: "Enamorado/a",
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#fbbf24"/><circle cx="12" cy="12" r="9" fill="#f59e0b"/><path d="M7.5 10c-.8 0-1.5-.6-1.5-1.4 0-1.1 1.5-2 1.5-2s1.5.9 1.5 2c0 .8-.7 1.4-1.5 1.4zm9 0c-.8 0-1.5-.6-1.5-1.4 0-1.1 1.5-2 1.5-2s1.5.9 1.5 2c0 .8-.7 1.4-1.5 1.4z" fill="#e11d48"/><path d="M8 15s1.5 2.5 4 2.5 4-2.5 4-2.5" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`
    },
    {
      key: "fire",
      label: "Increíble",
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2c-.5 2.5-3 5-3 8 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-.5-3.5-1.5-5-.5 2-2 3-3.5 3-2.5 0-4-3-4-6z" fill="#f97316"/><path d="M12 9c-1 1-1.5 2.2-1.5 3.5 0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5c0-.8-.3-1.6-.8-2.2-.4 1.2-1.5 2.2-2.7 2.2s-2-1.5-2-3.5z" fill="#fde047"/></svg>`
    },
    {
      key: "sunflower",
      label: "Nuestro sol",
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><g fill="#f59e0b"><circle cx="12" cy="4" r="2.4"/><circle cx="12" cy="20" r="2.4"/><circle cx="4" cy="12" r="2.4"/><circle cx="20" cy="12" r="2.4"/><circle cx="6.3" cy="6.3" r="2.3"/><circle cx="17.7" cy="6.3" r="2.3"/><circle cx="6.3" cy="17.7" r="2.3"/><circle cx="17.7" cy="17.7" r="2.3"/></g><circle cx="12" cy="12" r="4.8" fill="#78350f" stroke="#fde047" stroke-width="1.3"/></svg>`
    },
    {
      key: "star",
      label: "Mágico",
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l2.9 6.6L22 9.5l-5.3 4.8 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.5l7.1-.9L12 2z" fill="#fbbf24" stroke="#fef08a" stroke-width="1.2"/></svg>`
    },
    {
      key: "sparkles",
      label: "Brillante",
      svg: `<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 0l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z" fill="#ec4899"/></svg>`
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
        window._sumarAmorPareja?.(4, `Reaccionaste (${info?.label || "ReacciÃ³n"}) a un recuerdo`);
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
      chip.style.cssText = `padding:4px 9px;border-radius:999px;border:1px solid ${esMia ? "rgba(244,63,94,0.7)" : "rgba(255,255,255,0.2)"};background:${esMia ? "rgba(244,63,94,0.3)" : "rgba(15,23,42,0.75)"};color:#fff;display:inline-flex;align-items:center;gap:6px;cursor:pointer;backdrop-filter:blur(6px);transition:transform 0.15s ease;`;
      chip.innerHTML = `<span style="display:inline-flex;align-items:center;">${r.svg}</span><span style="font-size:0.72rem;font-weight:800;">${count}</span>`;
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
    btnAddReac.title = "AÃ±adir reacciÃ³n";
    btnAddReac.style.cssText = "padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(15,23,42,0.7);color:#fde68a;cursor:pointer;display:inline-flex;align-items:center;gap:4px;backdrop-filter:blur(6px);";
    btnAddReac.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="#fbbf24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span style="font-size:0.82rem;font-weight:800;">+</span>`;

    btnAddReac.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const prevMenu = container.querySelector(".polaroid-reac-picker");
      if (prevMenu) { prevMenu.remove(); return; }

      const picker = document.createElement("div");
      picker.className = "polaroid-reac-picker";
      picker.style.cssText = "position:absolute;bottom:calc(100% + 8px);left:0;z-index:40;display:flex;gap:8px;padding:8px 14px;border-radius:999px;background:rgba(15,23,42,0.96);border:1px solid rgba(251,191,36,0.45);box-shadow:0 12px 32px rgba(0,0,0,0.75);backdrop-filter:blur(12px);";
      REACCIONES_ALBUM.forEach(r => {
        const b = document.createElement("button");
        b.type = "button";
        b.title = r.label;
        b.innerHTML = r.svg;
        b.style.cssText = "border:none;background:transparent;cursor:pointer;padding:6px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;transition:transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);";
        b.addEventListener("mouseenter", () => { b.style.transform = "scale(1.3)"; });
        b.addEventListener("mouseleave", () => { b.style.transform = "scale(1)"; });
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
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:radial-gradient(circle at center,rgba(24,16,38,0.96),rgba(6,8,16,0.99));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.2rem;color:#fff;";
    overlay.innerHTML = `
      <div style="position:absolute;top:16px;left:20px;right:20px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="img/dashboard/card-album.svg" alt="" width="28" height="28">
          <strong style="font-size:1rem;color:#ffd93d;display:inline-flex;align-items:center;gap:6px;"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ffd93d;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg> Nuestra Película de Recuerdos</strong>
          <span id="slideshow-counter" style="font-size:0.8rem;opacity:0.75;margin-left:6px;">1 / ${disponibles.length}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button type="button" id="slideshow-btn-pause" class="btn-secondary" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:999px;">⏸ Pausar</button>
          <button type="button" id="slideshow-btn-close" class="btn-primary" style="padding:0.4rem 0.9rem;font-size:0.8rem;border-radius:999px;">✕ Salir</button>
        </div>
      </div>
      <div id="slideshow-stage" style="max-width:520px;width:100%;background:#fffdf9;color:#1e293b;padding:14px 14px 22px;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,0.65);text-align:center;transition:opacity 0.35s ease, transform 0.35s ease;">
        <div style="width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:#0f172a;display:flex;align-items:center;justify-content:center;">
          <img id="slideshow-img" src="" alt="" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div style="margin-top:12px;">
          <span id="slideshow-date" style="font-size:0.78rem;font-weight:700;color:#e11d48;text-transform:uppercase;letter-spacing:0.04em;"></span>
          <p id="slideshow-note" style="margin:6px 0 0;font-size:0.98rem;font-weight:600;color:#1e293b;"></p>
        </div>
      </div>
      <div style="margin-top:16px;display:flex;gap:12px;">
        <button type="button" id="slideshow-prev" class="btn-secondary" style="padding:0.45rem 1.1rem;border-radius:999px;">← Anterior</button>
        <button type="button" id="slideshow-next" class="btn-secondary" style="padding:0.45rem 1.1rem;border-radius:999px;">Siguiente →</button>
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
      if (stageEl) { stageEl.style.opacity = "0.3"; stageEl.style.transform = "scale(0.97)"; }
      const u = await obtenerUrlFirmada(f.path);
      if (imgEl && u) imgEl.src = u;
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

    bar.querySelectorAll("[data-album-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll("[data-album-filter]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filtroFotoModo = btn.dataset.albumFilter || "todas";
        aplicarFiltrosAlbumDOM();
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
      if (!modal) return;
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        await cerrarFullscreen();
        // Breve pausa para permitir que el navegador restaure el viewport
        await new Promise(r => setTimeout(r, 60));
      }
      fotoEditando = fotoParaEditar;
      modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      form?.reset();
      if (inputPhoto) inputPhoto.required = !fotoParaEditar;
      if (inputPhotoCampo) inputPhotoCampo.hidden = Boolean(fotoParaEditar);
      if (fotoParaEditar) { if (inputDate) inputDate.value = fotoParaEditar.fecha || ""; if (inputNote) inputNote.value = fotoParaEditar.nota || ""; if (inputLat) inputLat.value = fotoParaEditar.lat || ""; if (inputLng) inputLng.value = fotoParaEditar.lng || ""; }
      else if (inputDate) inputDate.value = new Date().toISOString().split("T")[0];
      actualizarEstadoUbicacion();
      if (preview) mostrarContenidoVistaPrevia(fotoParaEditar ? await obtenerUrlFirmada(fotoParaEditar.path) : null);
      if (modalTitle) modalTitle.textContent = fotoParaEditar ? "Editar recuerdo" : "Nuevo recuerdo";
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = fotoParaEditar ? "Actualizar recuerdo" : "Guardar recuerdo"; }
    } catch (err) { console.warn("abrirModal:", err); }
  }

  function cerrarModal() {
    try {
      if (!modal) return;
      modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      fotoEditando = null;
      if (inputPhoto) inputPhoto.required = true;
      if (inputPhotoCampo) inputPhotoCampo.hidden = false;
      if (modalTitle) modalTitle.textContent = "Nuevo recuerdo";
    } catch (err) { console.warn("cerrarModal:", err); }
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
      if (!mapaLeaflet) { mapaLeaflet = L.map(aventurasMap).setView([20, 0], 2); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(mapaLeaflet); }
      mapaLeaflet.eachLayer(l => { if (l instanceof L.Marker) mapaLeaflet.removeLayer(l); });
      const puntos = [];
      ubicadas.forEach(f => { const lat = Number(f.lat), lng = Number(f.lng); L.marker([lat, lng]).addTo(mapaLeaflet).bindPopup(`<strong>${f.fecha ? fmtFecha(f.fecha) : "Recuerdo"}</strong><br>${escapeHtml(f.nota || "Sin nota")}`); puntos.push([lat, lng]); });
      if (puntos.length) mapaLeaflet.fitBounds(L.latLngBounds(puntos), { padding: [30, 30], maxZoom: 12 });
      setTimeout(() => mapaLeaflet?.invalidateSize(), 100);
    } catch (err) { console.warn("renderMapa:", err); }
  }

  /* Listeners modal y previews */
  if (btnAdd) btnAdd.addEventListener("click", () => abrirModal());
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

