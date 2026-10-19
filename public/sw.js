// Service Worker per Ristorante Sì Chef
// Cache static assets e API per supporto offline parziale

const CACHE_NAME = "sichef-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/assets/img/hero.webp",
  "/assets/img/logo.png",
];

const API_CACHE_NAME = "sichef-api-v1";
const API_PATHS = ["/api/content", "/api/availability", "/api/categories", "/api/menu-items"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo richieste same-origin
  if (url.origin !== location.origin) return;

  // API GET - network first, poi cache
  if (API_PATHS.some((path) => url.pathname.startsWith(path)) && request.method === "GET") {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
    return;
  }

  // Asset statici - cache first
  if (request.method === "GET" && (request.destination === "image" || request.destination === "script" || request.destination === "style" || request.destination === "font")) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Navigazione - network first per HTML
  if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    return;
  }
});

async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}