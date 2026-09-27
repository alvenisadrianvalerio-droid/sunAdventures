/* ============================================
   SERVICE WORKER — SunAdventures
   ============================================ */

const CACHE_NAME = "sunadventures-v15";
const ASSETS_ESTATICOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./album.css",
  "./script.js",
  "./album.js",
  "./manifest.json",
  "./img/girasol-loading.png",
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

  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (event.request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("supabase.in")) return;
  if (url.hostname.includes("unpkg.com")) return;
  if (url.hostname.includes("jsdelivr.net")) return;
  if (url.hostname.includes("openstreetmap.org")) return;
  if (url.hostname.includes("googleapis.com")) return;
  if (url.hostname.includes("gstatic.com")) return;
  if (url.hostname.includes("purgomalum.com")) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

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