const CACHE_NAME = "neuraliso-pwa-v3";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install Event: Cache essential shell assets and skip waiting immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Delete any obsolete caches and claim client tabs immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting obsolete cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message Listener: Allow client UI to trigger skipWaiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch Event: Network-First Strategy for HTML, JS, CSS, and App Shell
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bypass service worker cache for backend API endpoints
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-First with fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network request succeeds with 200, update cache copy
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === "basic" || networkResponse.type === "cors")
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        console.warn("[SW] Network fetch failed, falling back to cache for:", event.request.url);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests when offline, return cached index.html
        if (
          event.request.mode === "navigate" ||
          (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html"))
        ) {
          const fallbackIndex = await caches.match("/index.html") || await caches.match("/");
          if (fallbackIndex) return fallbackIndex;
        }

        return new Response("Network offline and resource not cached.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain" }
        });
      })
  );
});
