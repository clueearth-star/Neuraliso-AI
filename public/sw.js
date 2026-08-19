const CACHE_NAME = "neuraliso-pwa-v5";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
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

// Message Listener: Allow client UI to trigger skipWaiting or display notifications
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    const notificationOptions = {
      body: options?.body || "Take a mindful pause. How are you feeling today?",
      icon: options?.icon || "/icon.svg",
      badge: options?.badge || "/icon.svg",
      tag: options?.tag || "neuraliso-mood-reminder",
      renotify: true,
      requireInteraction: options?.requireInteraction ?? false,
      data: {
        url: options?.url || "/app/mood",
        timestamp: Date.now(),
        ...(options?.data || {}),
      },
      actions: [
        { action: "checkin", title: "✨ Check In Now" },
        { action: "dismiss", title: "Later" }
      ],
      ...(options || {})
    };

    self.registration.showNotification(title || "Daily Mood Check-in 🌿", notificationOptions);
  }
});

// Notification Click Handler: Focus existing tab or open /app/mood
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/app/mood";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a Neuraliso tab is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Notification Close Handler
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
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

  const isHTML = event.request.mode === "navigate" || 
                (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html"));

  if (isHTML) {
    // Always fetch fresh HTML from network first to prevent stale asset hashes
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.warn("[SW] Offline: falling back to cached index.html");
          const cachedResponse = await caches.match(event.request) || await caches.match("/index.html") || await caches.match("/");
          if (cachedResponse) return cachedResponse;
          return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        })
    );
    return;
  }

  // Network-First with fallback to cache for static JS/CSS/Assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
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

        return new Response("Resource not found", {
          status: 404,
          headers: { "Content-Type": "text/plain" }
        });
      })
  );
});
