/* ============================================================
   DB.js — Almacenamiento offline (IndexedDB)
   Guarda blobs de imágenes y canciones para uso sin internet.
   ============================================================ */
(function () {
  const DB_NAME = "sunadventures-offline";
  const DB_VERSION = 1;
  const STORE_IMGS = "imagenes";
  const STORE_SONGS = "canciones";
  let db = null;

  function abrir() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_IMGS)) {
          const s = d.createObjectStore(STORE_IMGS, { keyPath: "id" });
          s.createIndex("path", "path", { unique: false });
        }
        if (!d.objectStoreNames.contains(STORE_SONGS)) {
          const s = d.createObjectStore(STORE_SONGS, { keyPath: "id" });
          s.createIndex("url", "url", { unique: false });
        }
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  async function guardar(store, item) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readwrite");
      tx.objectStore(store).put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function obtener(store, id) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readonly");
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  async function listar(store) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async function borrar(store, id) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readwrite");
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function limpiar(store) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readwrite");
      tx.objectStore(store).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function contar(store) {
    const d = await abrir();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(store, "readonly");
      const req = tx.objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  window.SunDB = {
    guardarImagen: (item) => guardar(STORE_IMGS, item),
    obtenerImagen: (id) => obtener(STORE_IMGS, id),
    listarImagenes: () => listar(STORE_IMGS),
    borrarImagen: (id) => borrar(STORE_IMGS, id),
    limpiarImagenes: () => limpiar(STORE_IMGS),
    contarImagenes: () => contar(STORE_IMGS),
    guardarCancion: (item) => guardar(STORE_SONGS, item),
    obtenerCancion: (id) => obtener(STORE_SONGS, id),
    listarCanciones: () => listar(STORE_SONGS),
    borrarCancion: (id) => borrar(STORE_SONGS, id),
    limpiarCanciones: () => limpiar(STORE_SONGS),
    contarCanciones: () => contar(STORE_SONGS)
  };
})();