const CACHE_NAME = "parking-pwa-v1";

// Ojo: aquí cacheamos SOLO lo que está dentro de /parking-app/
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./parking_192x192.png",
  "./parking_512x512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // limpiar caches viejas
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

// ✅ Esto es lo que te falta para que Chrome lo vea “instalable”
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        // guarda en cache solo cosas del mismo origen
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (e) {
        // si está offline y no hay cache, al menos devuelve index
        return (await caches.match("./index.html")) || Response.error();
      }
    })()
  );
});

// Click en notificación -> abrir o enfocar
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = (event.notification && event.notification.data && event.notification.data.url) || "./";
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

    for (const c of allClients) {
      if (c.url && "focus" in c) return c.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  })());
});
