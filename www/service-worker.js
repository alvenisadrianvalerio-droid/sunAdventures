const CACHE_NAME = "sunad-v259-pwa";
const ASSETS_ESTATICOS = [
  "./", "./index.html", "./styles.css", "./album.css", "./juegos.css",
  "./rpg.css", "./rpg-loot.css", "./temas.css", "./finanzas.css", "./capsula-tiempo.css", "./pareja-chat.css", "./diccionario.css", "./recetas.css",
  "./assets/app.bundle.min.css",
  "./assets/vendor-core.bundle.min.js",
  "./assets/view-logros.bundle.min.js",
  "./assets/view-album-social.bundle.min.js",
  "./assets/view-utilidades.bundle.min.js",
  "./assets/view-rpg.bundle.min.js",
  "./assets/view-app-extras.bundle.min.js",
  "./script.js", "./album.js", "./capsula-tiempo.js", "./preferences.js", "./finanzas.js", "./diccionario.js", "./recetas.js", "./icons-emojis.js", "./juegos.js",
  "./src/modules/album-core.js", "./src/modules/album-grupo.js", "./src/modules/album-logros.js",
  "./src/modules/album-fotos.js", "./src/modules/album-chat.js", "./src/modules/album-notas.js", "./src/modules/album-auth.js", "./src/modules/album-eventos.js",
  "./src/modules/album-router.js",
  "./ds.js", "./offline.js", "./tienda.js", "./perfil.js", "./logros-extra.js",
  "./sprites-config.js", "./sprites-names.js", "./efectos.js", "./rpg-data.js", "./rpg.js", "./rpg-postgame.js", "./rpg-loot.js",
  "./rpg-items-dinamicos.js", "./rpg-loadout.js", "./rpg-canvas.js", "./rpg-habilidades.js", "./rpg-minimap.js",
  "./rpg-roguelike.js", "./desafios-diarios.js", "./mejoras.js", "./parches-v2.js", "./parches-v3.js", "./pareja-sistema.js",
  "./manifest.json", "./img/girasol-loading.png", "./img/girasol-loading.webp",
  "./img/girasol.webp", "./img/mapache.webp", "./img/receta-mochi-matcha.jpg",
  "./img/dashboard/brand-four-sunflowers.svg",
  "./img/dashboard/card-album.svg",
  "./img/dashboard/card-notas.svg",
  "./img/dashboard/card-mascotas.svg",
  "./img/dashboard/card-recetas.svg",
  "./img/dashboard/card-aventura.svg",
  "./img/dashboard/card-roguelike.svg",
  "./img/dashboard/card-minijuegos.svg",
  "./img/dashboard/card-finanzas.svg",
  "./img/dashboard/card-diccionario.svg",
  "./img/dashboard/card-musica.svg",
  "./img/dashboard/card-calendario.svg",
  "./img/dashboard/card-logros.svg",
  "./img/items%20de%20aventura/icon.png", "./img/items%20de%20aventura/icon.webp",
  "./img/items%20de%20aventura/estrella.png", "./img/items%20de%20aventura/estrella.webp",
  "./img/items%20de%20aventura/corona.png", "./img/items%20de%20aventura/corona.webp",
  "./img/items%20de%20aventura/tienda.png", "./img/items%20de%20aventura/tienda.webp",
  "./img/items%20de%20aventura/dado.png",
  "./img/items%20de%20aventura/hamburguesa.png",
  "./img/items%20de%20aventura/mapa.png",
  "./img/items%20de%20aventura/pocion.png",
  "./img/items%20de%20aventura/calavera.png",
  "./img/items%20de%20aventura/diamante.png",
  "./img/items%20de%20aventura/espada.png",
  "./img/rpg/items/cofre-madera.png",
  "./img/tienda/admurin-items.png", "./img/tienda/comida-sheet.png", "./img/tienda/tienda-sheet.png",
  "./img/rpg/loot-1.png", "./img/rpg/loot-2.png",
  "./img/biomas/gen-02a9154e-49f2-4451-b734-a787ce316fd5.png",
  "./img/biomas/gen-3b1ee61a-d08b-44bc-a27b-9c56f5e009ef.png",
  "./img/biomas/gen-54356df9-2637-441f-96a0-4742f61f6a57.png",
  "./img/biomas/gen-5480873c-7b50-45b8-a3c1-abc457a2f0fa.png",
  "./img/biomas/gen-5510680d-7fe8-4834-b72d-04dd75fc60e2.png",
  "./img/biomas/gen-6148d727-5f04-4360-b612-587e58fbd20d.png",
  "./img/biomas/gen-e46023c3-4ac1-4361-b312-e6f525bcead6.png",
  "./img/biomas/gen-ef4c41e3-8713-47f7-acde-eefb81a85d11.png",
  "./img/biomas/gen-675040d8-722c-4ac6-bf7d-6d236587f618.png",
  "./img/biomas/gen-710f318c-55ee-45ba-aad5-7afcca056906.png",
  "./img/biomas/gen-7f3a60dc-0b7b-4b78-9ae9-e63140799a1c.png",
  "./img/biomas/gen-a36ad96d-725f-45b4-8793-4f27add89fb3.png",
  "./img/biomas/gen-b8ac5df4-7a81-443c-8cec-4d4f30bef9aa.png",
  "./img/biomas/gen-df614595-485a-47f1-a074-7d4b4aa3d08e.png",
  "./img/biomas/gen-f34b37dd-a44a-4ac1-8ef3-a5b18a314480.png"
];
// ... resto igual

const HOSTS_EXTERNOS = [
  "supabase.co", "supabase.in", "unpkg.com", "jsdelivr.net",
  "openstreetmap.org", "googleapis.com", "gstatic.com", "purgomalum.com",
  "dolarapi.com", "dolarvzla.com", "criptoya.com", "er-api.com",
  "dictionaryapi.dev", "wiktionary.org", "mymemory.translated.net"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) =>
      Promise.all(ASSETS_ESTATICOS.map((u) => c.add(u).catch(() => { })))
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && !k.startsWith("sunad-offline-")).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("push", event => {
  event.waitUntil((async () => {
    let data = {};
    try { data = event.data?.json() || {}; }
    catch (error) {
      console.error("No se pudo leer la notificación push:", error);
      data = { title: "SunAd", body: event.data?.text() || "" };
    }
    await self.registration.showNotification(data.title || "SunAd", {
      body: data.body || "",
      icon: "./img/girasol-loading.png",
      badge: "./img/girasol-loading.png",
      image: data.image,
      tag: data.tag,
      silent: data.silent === true,
      data: { url: data.url || "./#finanzas" }
    });
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./#finanzas", self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ✅ Saltar CDNs/APIs y archivos de descarga APK para que el navegador los descargue directamente
  if (HOSTS_EXTERNOS.some((h) => url.hostname.includes(h))) return;
  if (url.pathname.endsWith(".apk") || url.pathname.includes("/app/")) return;

  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });

    // Documentos HTML: network-first con timeout rápido (3s) para no bloquear en conexiones lentas
    if (req.mode === "navigate" || req.destination === "document") {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 3000);
        const red = await fetch(req, { signal: ctrl.signal });
        clearTimeout(tid);
        if (red && red.status === 200) {
          caches.open(CACHE_NAME).then((c) => c.put(req, red.clone())).catch(() => { });
        }
        return red;
      } catch {
        return cached || (await caches.match("./index.html")) || Response.error();
      }
    }

    // Scripts JS y Hojas CSS: Stale-While-Revalidate (respuesta instantánea desde caché y actualización en segundo plano)
    if (
      req.destination === "script" ||
      req.destination === "style" ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css")
    ) {
      const fetchPromise = fetch(req).then((red) => {
        if (red && red.status === 200) {
          caches.open(CACHE_NAME).then((c) => c.put(req, red.clone())).catch(() => { });
        }
        return red;
      }).catch(() => cached || Response.error());
      return cached || fetchPromise;
    }

    // Otros recursos estáticos (imágenes, fuentes): cache-first
    if (cached) return cached;
    try {
      const red = await fetch(req);
      if (red && red.status === 200 && red.type === "basic") {
        caches.open(CACHE_NAME).then((c) => c.put(req, red.clone())).catch(() => { });
      }
      return red;
    } catch {
      return cached || Response.error();
    }
  })());
});