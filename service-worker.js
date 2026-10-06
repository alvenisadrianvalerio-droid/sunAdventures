/* ============================================
   SERVICE WORKER — SunAd
   ============================================ */

const CACHE_NAME = "sunad-v5";   // ⬅️ subido por cambios de assets
const ASSETS_ESTATICOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./album.css",
  "./script.js",
  "./album.js",
  "./manifest.json",
  // Iconos UI
  "./icons/ui-icons.svg",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./icons/favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/paw.png",
  // Imágenes clave
  "./img/girasol.jpg",
  "./img/mapache.png",
  "./img/mascota-girasol.png",
  "./img/gatito.png",
  "./img/hamburguesa.png",
  "./img/oveja.png",
  "./img/pollito.png",
  "./img/jirafa.png",
  "./img/unicornio.png",
  "./img/conejito.png",
  "./img/dragon-bebe.png",
  "./img/dragon-anciano.png",
];

// ---------- INSTALL ----------
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS_ESTATICOS.map((url) =>
          cache.add(url).catch((err) => console.warn("No se pudo cachear:", url, err))
        )
      )
    )
  );
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---------- FETCH ----------
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚫 Filtro 1: solo http/https (evita chrome-extension://, data:, etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // 🚫 Filtro 2: solo GET
  if (event.request.method !== "GET") return;

  // 🚫 Filtro 3: no interceptar APIs externas
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("supabase.in")) return;
  if (url.hostname.includes("unpkg.com")) return;
  if (url.hostname.includes("jsdelivr.net")) return;
  if (url.hostname.includes("openstreetmap.org")) return;
  if (url.hostname.includes("googleapis.com")) return;
  if (url.hostname.includes("gstatic.com")) return;
  if (url.hostname.includes("purgomalum.com")) return;

  // ✅ A partir de aquí, gestionamos la caché
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

      // HTML: red primero (para tener siempre la última versión)
      if (event.request.destination === "document") {
        try {
          const red = await fetch(event.request);
          if (red && red.status === 200) {
            const clon = red.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clon)).catch(() => {});
          }
          return red;
        } catch {
          if (cached) return cached;
          throw new Error("Sin conexión y sin caché");
        }
      }

      // Resto: caché primero, red como fallback
      if (cached) return cached;

      try {
        const red = await fetch(event.request);
        if (red && red.status === 200 && red.type === "basic") {
          const clon = red.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clon)).catch(() => {});
        }
        return red;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    })()
  );
});