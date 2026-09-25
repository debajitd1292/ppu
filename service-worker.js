const CACHE_NAME = "ppu-dashboard-v8";   // 🔁 change this on every update

const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./service-worker.js",
    "https://raw.githubusercontent.com/debajitd1292/ppu/main/logo.png"
];

// 🔽 INSTALL
self.addEventListener("install", event => {
    console.log("Service Worker Installing...");

    self.skipWaiting();   // 🔥 activate immediately

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// 🔽 ACTIVATE
self.addEventListener("activate", event => {
    console.log("Service Worker Activating...");

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 🔥 take control immediately
    );
});

// 🔽 FETCH (Network First Strategy)
self.addEventListener("fetch", event => {

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Save latest version in cache
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
    );

});
