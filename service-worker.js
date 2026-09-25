const CACHE_NAME = "ppu-dashboard-v8";

const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./service-worker.js",
    "https://raw.githubusercontent.com/debajitd1292/ppu/main/logo.png"
];

// INSTALL
self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                urlsToCache.map(url => cache.add(url))
            );
        })
    );
});

// ACTIVATE
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH
self.addEventListener("fetch", event => {

    const url = event.request.url;

    // ✅ Always fetch fresh CSV (dynamic data)
    if (url.includes(".csv")) {
        event.respondWith(fetch(event.request));
        return;
    }

    // ✅ Navigation fallback
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => caches.match("./index.html"))
        );
        return;
    }

    // ✅ Cache-first for static assets
    event.respondWith(
        caches.match(event.request).then(cached => {

            return cached || fetch(event.request).then(response => {

                if (response && response.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                    });
                }

                return response;
            });

        })
    );
});
