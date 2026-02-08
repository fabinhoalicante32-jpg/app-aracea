const CACHE_NAME = "parking-pwa-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔵 Abrir Google Maps APP directamente (sin preguntar)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const lat = data.lat;
  const lng = data.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return;

  const intentUrl =
    `intent://maps.google.com/maps?daddr=${lat},${lng}` +
    `#Intent;scheme=https;package=com.google.android.apps.maps;end`;

  event.waitUntil(
    clients.openWindow(intentUrl)
  );
});
