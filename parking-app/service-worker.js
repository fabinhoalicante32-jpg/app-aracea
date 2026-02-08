self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Al tocar la notificación: abrir Google Maps con el punto
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url;

  event.waitUntil((async () => {
    // Si tenemos URL (Maps), abrirla
    if (url) {
      // intenta abrir directamente Maps (via web URL que Android suele abrir con la app)
      return clients.openWindow(url);
    }

    // fallback: enfocar la PWA si ya está abierta
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of allClients) {
      if (c.url && "focus" in c) return c.focus();
    }
    return clients.openWindow("./");
  })());
});
