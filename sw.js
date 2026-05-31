// GAINZ Sherpa service worker — offline-first shell with controlled updates
// (SPEC §6, issue #25). Bump CACHE when you change any shipped file so the
// update rolls out to clients.
const CACHE = "gainz-v6";

// Everything needed to launch the app with no network connection.
const SHELL = [
  "./",
  "index.html",
  "app.js",
  "src/geo.js",
  "src/update.js",
  "gyms.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

// Pre-cache the shell on install. We deliberately DO NOT call skipWaiting() here:
// a new worker stays in "waiting" until the user accepts the restart prompt
// (issue #25), so we never swap assets out from under a running page.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
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

// The page posts this when the user accepts the restart prompt. Activating now
// fires "controllerchange" in the page, which reloads onto the new version.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Data (e.g. gyms.json) changes more often than the shell, so serve it
// network-first: users always see the latest data, with a cached copy as the
// offline fallback. The static shell stays cache-first for instant loads;
// shell freshness is handled by the update-and-restart flow above.
function isDataRequest(url) {
  return url.pathname.endsWith("gyms.json");
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (isDataRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Refresh the cached copy for offline use, then return the fresh one.
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Shell: cache-first for instant loads; fall back to the network for anything new.
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
