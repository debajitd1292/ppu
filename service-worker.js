const CACHE_NAME = "ppu-dashboard-v60";

const urlsToCache = [
    "./",
    "./index.html?v=60",
    "./manifest.json",
    "./service-worker.js",
    "https://raw.githubusercontent.com/debajitd1292/ppu/main/images/logo.png"
];

// INSTALL
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );

});

// ACTIVATE
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cache => {
                        if (cache !== CACHE_NAME) {
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );

});

// FETCH
self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // CSV: Network first, cache fallback
    if (url.pathname.toLowerCase().endsWith(".csv")) {

        event.respondWith((async () => {

            const cacheKey = new Request(
                (() => {
                    const cleanURL = new URL(request.url);
                    cleanURL.search = "";
                    cleanURL.hash = "";
                    return cleanURL.toString();
                })()
            );

            try {

                const response = await fetch(request, {
                    cache: "no-store"
                });

                if (response.ok) {

                    const cache = await caches.open(CACHE_NAME);

                    await cache.put(
                        cacheKey,
                        response.clone()
                    );

                }

                return response;

            } catch (error) {

                const cached = await caches.match(cacheKey);

                if (cached) return cached;

                return new Response(
                    "Offline: No cached CSV data available",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );

            }

        })());

        return;
    }

    // Other resources: Network first, cache fallback
    event.respondWith((async () => {

        try {

            const response = await fetch(request);

            if (response.ok) {

                const cache = await caches.open(CACHE_NAME);

                await cache.put(
                    request,
                    response.clone()
                );

            }

            return response;

        } catch (error) {

            const cached = await caches.match(request);

            if (cached) return cached;

            return new Response("Offline", {
                status: 503
            });

        }

    })());

});
