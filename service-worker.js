/* ============================================
   SERVICE WORKER — SunAdventures PWA
   ============================================ */

const CACHE_NAME = "sunadventures-v5";

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

self.addEventListener("push", (event) => {
  let datos = { title: "SunAdventures", body: "Tienes una novedad 💛", url: "/#chat" };
  try { if (event.data) datos = { ...datos, ...event.data.json() }; } catch { /* payload opcional */ }
  event.waitUntil(
    self.registration.showNotification(datos.title, {
      body: datos.body,
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data: { url: datos.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/#chat";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
    const abierta = ventanas.find((ventana) => "focus" in ventana);
    if (abierta) { abierta.navigate(url); return abierta.focus(); }
    return clients.openWindow(url);
  }));
});