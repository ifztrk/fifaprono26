// Service worker FIFAPRONO 26 — installabilité (PWA) + notifications push

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

// Handler fetch minimal (requis pour l'installabilité sur certains navigateurs)
self.addEventListener("fetch", () => {});

// Réception d'une notification push
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || "FIFAPRONO 26 ⚽";
  const options = {
    body: data.body || "",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: data.url || "/accueil" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur la notification → ouvre l'app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/accueil";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
