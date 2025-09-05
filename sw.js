
/* Fun Bible Word Game — Service Worker v2025.09.05.1448 */
const SW_VERSION = "v2025.09.05.1448";
const STATIC_CACHE = "static-" + SW_VERSION;
const RUNTIME_CACHE = "runtime-" + SW_VERSION;

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./Aug29_3_Modes.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./favicon.png",
  "./favicon.ico",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon-180.png",
  "./audio/win.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith("static-") || k.startsWith("runtime-")) && k !== STATIC_CACHE && k !== RUNTIME_CACHE ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

function fetchWithTimeout(request, timeoutMs = 7000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Network timeout")), timeoutMs);
    fetch(request).then(res => { clearTimeout(timer); resolve(res); }).catch(err => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetchWithTimeout(req, 7000);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cacheStatic = await caches.open(STATIC_CACHE);
        const cached = await cacheStatic.match("./index.html") || await cacheStatic.match("./Aug29_3_Modes.html") || await cacheStatic.match("./offline.html");
        return cached || Response.error();
      }
    })());
    return;
  }

  if (req.destination === "image" || req.destination === "font" || req.destination === "audio") {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) {
        fetch(req).then(res => cache.put(req, res.clone())).catch(()=>{});
        return cached;
      }
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type !== "opaque") {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      const cached = await cache.match(req) || await caches.match(req);
      return cached || Response.error();
    }
  })());
});
