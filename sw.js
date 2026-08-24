// IMPORTANTE: cambiar este número (v2, v3, v4...) CADA VEZ que se actualice
// algún archivo de la app. Si no se cambia, el navegador nunca detecta que
// hay una versión nueva y sigue mostrando la copia vieja para siempre.
const CACHE_NAME = "mipyv-cache-v5";
const FILES_TO_CACHE = [
  "./index.html",
  "./app.js",
  "./data.js",
  "./icons.js",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // network-first para el propio Apps Script (siempre intenta enviar en vivo);
  // cache-first para los archivos estáticos de la app.
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});
