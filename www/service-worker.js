const CACHE_NAME = "sunadventures-v38"; // ⬅️ sube versión para forzar update
const ASSETS_ESTATICOS = [
  "./","./index.html","./styles.css","./album.css","./juegos.css",
  "./rpg.css","./rpg-loot.css","./temas.css",
  "./script.js","./album.js","./icons-emojis.js","./juegos.js",
  "./ds.js",              // ⬅️ CORREGIDO: era "./db.js" (no existe)
  "./offline.js","./tienda.js","./perfil.js","./logros-extra.js",
  "./sprites-config.js","./efectos.js","./rpg.js","./rpg-loot.js",
  "./manifest.json","./img/girasol-loading.png",
];
// ... resto igual

const HOSTS_EXTERNOS = [
  "supabase.co","supabase.in","unpkg.com","jsdelivr.net",
  "openstreetmap.org","googleapis.com","gstatic.com","purgomalum.com"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) =>
      Promise.all(ASSETS_ESTATICOS.map((u) => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ✅ Saltar CDNs/APIs sin lanzar excepciones
  if (HOSTS_EXTERNOS.some((h) => url.hostname.includes(h))) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);

    // Documentos: network-first (para tener HTML fresco)
    if (req.destination === "document") {
      try {
        const red = await fetch(req);
        if (red && red.status === 200) {
          caches.open(CACHE_NAME).then((c) => c.put(req, red.clone())).catch(() => {});
        }
        return red;
      } catch {
        return cached || Response.error();
      }
    }

    // Otros: cache-first
    if (cached) return cached;
    try {
      const red = await fetch(req);
      if (red && red.status === 200 && red.type === "basic") {
        caches.open(CACHE_NAME).then((c) => c.put(req, red.clone())).catch(() => {});
      }
      return red;
    } catch {
      return cached || Response.error();
    }
  })());
});