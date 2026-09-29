/* ============================================================
   OFFLINE.js — Descarga masiva + cola de sincronización
   ============================================================ */
(function () {
  const sb = () => window._supabase;
  const DB = () => window.SunDB;

  /* ---------- Cola de sincronización ---------- */
  const QUEUE_KEY = "sa_sync_queue";
  const getQueue = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; } };
  const setQueue = (q) => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} };

  function encolar(accion) {
    const q = getQueue();
    q.push({ ...accion, ts: Date.now() });
    setQueue(q);
    if (navigator.onLine) procesarCola();
  }

  async function procesarCola() {
    if (!navigator.onLine) return;
    const q = getQueue();
    if (!q.length) return;
    const sbv = sb();
    if (!sbv) return;

    const pendientes = [];
    for (const accion of q) {
      try {
        if (accion.tipo === "foto")       await sbv.from("fotos").insert(accion.data);
        else if (accion.tipo === "nota")  await sbv.from("notas").insert(accion.data);
        else if (accion.tipo === "evento")await sbv.from("eventos").insert(accion.data);
        else if (accion.tipo === "delete-foto")   await sbv.from("fotos").delete().eq("id", accion.id);
        else if (accion.tipo === "delete-nota")   await sbv.from("notas").delete().eq("id", accion.id);
        else if (accion.tipo === "delete-evento") await sbv.from("eventos").delete().eq("id", accion.id);
      } catch (e) { pendientes.push(accion); }
    }
    setQueue(pendientes);
    window.dispatchEvent(new Event("offline:synced"));
  }

  window.addEventListener("online", procesarCola);
  setInterval(procesarCola, 60000);

  /* ---------- Descargar imagen ---------- */
  async function descargarImagen(foto, onProgress) {
    try {
      const r = await sb().storage.from("album").createSignedUrl(foto.path, 3600);
      if (r.error || !r.data?.signedUrl) throw new Error("Sin URL");
      const resp = await fetch(r.data.signedUrl);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const blob = await resp.blob();
      await DB().guardarImagen({
        id: foto.path, path: foto.path, blob, tipo: blob.type,
        tamano: blob.size, fecha: foto.fecha || null, nota: foto.nota || null,
        descargadoEn: Date.now()
      });
      onProgress?.(true); return true;
    } catch (e) { console.warn("descargarImagen:", e); onProgress?.(false); return false; }
  }

  /* ---------- Descargar canción ---------- */
  async function descargarCancion(cancion, onProgress) {
    if (!cancion.url?.startsWith("storage:")) return false;
    try {
      const path = cancion.url.replace(/^storage:/, "");
      const r = await sb().storage.from("canciones").createSignedUrl(path, 14400);
      if (r.error || !r.data?.signedUrl) throw new Error("Sin URL");
      const resp = await fetch(r.data.signedUrl);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const blob = await resp.blob();
      await DB().guardarCancion({
        id: path, url: cancion.url, titulo: cancion.titulo || "Sin título",
        artista: cancion.artista || "", blob, tipo: blob.type,
        tamano: blob.size, descargadoEn: Date.now()
      });
      onProgress?.(true); return true;
    } catch (e) { console.warn("descargarCancion:", e); onProgress?.(false); return false; }
  }

  /* ---------- Descargar TODO ---------- */
  async function descargarTodo() {
    const sbv = sb();
    if (!sbv) return alert("No hay conexión.");
    const { data: { session } } = await sbv.auth.getSession();
    if (!session) return alert("Inicia sesión primero.");
    const grupoId = localStorage.getItem("grupo_activo");
    if (!grupoId) return alert("No hay grupo activo.");

    /* Fotos */
    const { data: fotos } = await sbv.from("fotos").select("path,fecha,nota").eq("grupo_id", grupoId);
    /* Playlists + canciones */
    const { data: playlists } = await sbv.from("playlists").select("canciones").eq("grupo_id", grupoId);
    /* Notas y eventos: los cacheamos en localStorage (texto ligero) */
    const { data: notas } = await sbv.from("notas").select("*").eq("grupo_id", grupoId);
    const { data: eventos } = await sbv.from("eventos").select("*").eq("user_id", session.user.id);

    try { localStorage.setItem("sa_offline_notas", JSON.stringify(notas || [])); } catch {}
    try { localStorage.setItem("sa_offline_eventos", JSON.stringify(eventos || [])); } catch {}

    const canciones = [];
    (playlists || []).forEach(pl => (pl.canciones || []).forEach(c => {
      if (c.url?.startsWith("storage:")) canciones.push(c);
    }));

    const total = (fotos?.length || 0) + canciones.length;
    if (total === 0 && (!notas || !notas.length) && (!eventos || !eventos.length)) {
      return alert("No hay nada que descargar todavía.");
    }

    const overlay = crearOverlayProgreso(total || 1);
    let hechas = 0, ok = 0, fallos = 0;
    const tick = (exito) => { hechas++; exito ? ok++ : fallos++; overlay.actualizar(hechas, total || 1, ok, fallos); };

    for (const f of (fotos || [])) { await descargarImagen(f, tick); await new Promise(r => setTimeout(r, 30)); }
    for (const c of canciones)     { await descargarCancion(c, tick); await new Promise(r => setTimeout(r, 30)); }

    overlay.terminar(ok, fallos);
    window.dispatchEvent(new Event("offline:updated"));
  }

  /* ---------- Overlay progreso ---------- */
  function crearOverlayProgreso(total) {
    const o = document.createElement("div");
    o.className = "offline-overlay";
    o.innerHTML = `
      <div class="offline-panel">
        <h3 class="offline-titulo">Descargando para uso sin conexión</h3>
        <p class="offline-sub">Guardando todo en tu dispositivo…</p>
        <div class="offline-barra"><span></span></div>
        <p class="offline-info"><span class="offline-num">0</span> / ${total}</p>
        <p class="offline-detalle">✅ 0 · ❌ 0</p>
      </div>`;
    document.body.appendChild(o);
    const barra = o.querySelector(".offline-barra span");
    const num = o.querySelector(".offline-num");
    const det = o.querySelector(".offline-detalle");
    return {
      actualizar(h, t, ok, f) {
        barra.style.width = Math.round(h / t * 100) + "%";
        num.textContent = h;
        det.textContent = `✅ ${ok} · ❌ ${f}`;
      },
      terminar(ok, f) {
        o.querySelector(".offline-titulo").textContent = "¡Descarga completada!";
        o.querySelector(".offline-sub").textContent = "Ya puedes usar la app sin internet.";
        det.textContent = `✅ ${ok} correctos · ❌ ${f} fallidos`;
        barra.style.width = "100%";
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn-primary"; b.textContent = "Cerrar";
        b.style.marginTop = "1rem";
        b.addEventListener("click", () => o.remove());
        o.querySelector(".offline-panel").appendChild(b);
      }
    };
  }

  /* ---------- Obtener offline ---------- */
  async function obtenerImagenOffline(path) {
    try { const it = await DB().obtenerImagen(path); return it?.blob ? URL.createObjectURL(it.blob) : null; } catch { return null; }
  }
  async function obtenerCancionOffline(url) {
    try {
      const path = url.replace(/^storage:/, "");
      const it = await DB().obtenerCancion(path);
      return it?.blob ? URL.createObjectURL(it.blob) : null;
    } catch { return null; }
  }

  async function estadoUso() {
    try {
      const [imgs, songs] = await Promise.all([DB().listarImagenes(), DB().listarCanciones()]);
      const tam = [...imgs, ...songs].reduce((t, x) => t + (x.tamano || 0), 0);
      return { imagenes: imgs.length, canciones: songs.length, tamanoMB: (tam / 1024 / 1024).toFixed(2), pendientes: getQueue().length };
    } catch { return { imagenes: 0, canciones: 0, tamanoMB: "0.00", pendientes: 0 }; }
  }

  async function borrarTodo() {
    if (!confirm("¿Borrar todas las imágenes y canciones descargadas?")) return;
    await Promise.all([DB().limpiarImagenes(), DB().limpiarCanciones()]);
    alert("Todo borrado.");
    window.dispatchEvent(new Event("offline:updated"));
  }

  window.SunOffline = {
    descargarTodo, descargarImagen, descargarCancion,
    obtenerImagenOffline, obtenerCancionOffline,
    estadoUso, borrarTodo, encolar, procesarCola, getQueue
  };
})();