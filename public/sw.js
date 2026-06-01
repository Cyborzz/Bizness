// Fidélise-moi service worker — Web Push + offline fallback.

const CACHE_NAME = "fidelise-moi-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.mode !== "navigate") return;
  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL)),
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "Fidélise-moi", body: "Vous avez une nouvelle offre.", url: "/" };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // payload non-JSON, garde les valeurs par défaut
  }

  const options = {
    body: payload.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    image: payload.image,
    data: { url: payload.url || "/" },
    tag: payload.tag,
    renotify: Boolean(payload.tag),
    vibrate: [120, 60, 120],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if ("focus" in client && client.url.includes(targetUrl)) {
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
