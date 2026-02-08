/* parking-app/service-worker.js */
const CACHE_NAME = "parking-pwa-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./parking_192x192.png",
  "./parking_512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache SOLO lo que esté dentro del scope real del service worker
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // scope real, ejemplo: https://xxx.github.io/mis-apps/parking-app/
  const scope = self.registration.scope;

  // si NO está dentro de la carpeta del PWA, no tocamos nada
  if (!url.href.startsWith(scope)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return resp;
          })
          .catch(() => cached)
      );
    })
  );
});

// Click en notificación: abrir la URL guardada (Google Maps)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url;
  if (!targetUrl) return;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

      for (const c of allClients) {
        if ("focus" in c) {
          await c.focus();
          // Navega a Maps desde la ventana enfocada
          if ("navigate" in c) return c.navigate(targetUrl);
          return;
        }
      }

      if (clients.openWindow) await clients.openWindow(targetUrl);
    })()
  );
});
