// GAINZ Sherpa service worker — offline-first app shell (SPEC §6).
// Bump CACHE when you change any shipped file to roll the update out to clients.
const CACHE = "gainz-v3";

// Everything needed to launch the app with no network connection.
const SHELL = [
  "./",
  "index.html",
  "app.js",
  "src/geo.js",
  "gyms.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

// Pre-cache the shell on install so the first offline launch already has it.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting(); // activate this version immediately
});

// Drop caches from older versions so updates actually take effect.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first for instant loads; fall back to the network for anything new.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
