const CACHE_NAME = "kuis-v2"; // Ganti versi agar cache lama terhapus
const urlsToCache = [
  "/",
  "/admin.html",
  "/style.css",
  "/script.js",
  "/admin.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  // PENTING: Jangan pernah sentuh request API! Biarkan langsung ke server
  if (event.request.url.includes("/api/")) {
    return;
  }

  // Untuk file lain (html, css, js, gambar)
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});
