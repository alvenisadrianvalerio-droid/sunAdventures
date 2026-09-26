/* ============================================
   SERVICE WORKER — SunAdventures PWA
   ============================================ */

const CACHE_NAME = "sunadventures-v2";

const ARCHIVOS_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./album.css",
  "./script.js",
  "./album.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./img/mapache.png",
  "./four%20sunflower%20img/girasol.jpg",
];

// ---------- INSTALL ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARCHIVOS_CACHE))
      .catch((err) => console.warn("⚠️ Error cacheando:", err))
  );
  self.skipWaiting();
});

// ---------- ACTIVATE ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ---------- FETCH ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.origin.includes("supabase.co") ||
    url.origin.includes("jsdelivr.net") ||
    url.origin.includes("unpkg.com")
  ) {
    return;   // no cachear Supabase ni CDN
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});