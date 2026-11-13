
const CACHE_NAME = "ppu-dashboard-v61";

// Application shell: required for offline startup
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",

    "./images/logo.png",
    "./images/banner.jpg",

    "./js/config.js",
    "./js/data.js",
    "./js/alerts.js",
    "./js/production.js",
    "./js/grade_specifications.js",
    "./js/ims.js",
    "./js/holiday.js",
    "./js/notes.js",
    "./js/training.js",
    "./js/theme.js",
    "./js/utils.js",
    "./js/status.js",
    "./js/selection.js",
    "./js/shift-data.js",
    "./js/views.js",
    "./js/loader.js",
    "./js/pwa.js",
    "./js/app.js",
    "./js/plant.js",
    "./js/propylene_stock.js",
    "./js/additive_composition.js",
    "./js/reactor_shutdown.js",
    "./js/reactor_startup.js",
    "./js/intercoms.js"
];


// INSTALL
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );

});


// ACTIVATE
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );

});


// FETCH
self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // CSV FILES: NETWORK FIRST, CACHE FALLBACK
    if (url.pathname.toLowerCase().endsWith(".csv")) {

        event.respondWith((async () => {

            const cacheURL = new URL(request.url);
            cacheURL.search = "";
            cacheURL.hash = "";

            const cacheKey = new Request(cacheURL.href);

            try {

                const response = await fetch(request, {
                    cache: "no-store"
                });

                if (response.ok && response.type !== "opaque") {

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
                    "Offline: No saved data available",
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


    // HTML PAGE: NETWORK FIRST, CACHED PAGE FALLBACK
    if (request.mode === "navigate") {

        event.respondWith((async () => {

            try {

                const response = await fetch(request);

                if (response.ok) {

                    const cache = await caches.open(CACHE_NAME);

                    await cache.put(
                        "./index.html",
                        response.clone()
                    );

                }

                return response;

            } catch (error) {

                const cached = await caches.match(
                    "./index.html",
                    { ignoreSearch: true }
                );

                if (cached) return cached;

                return new Response(
                    "Dashboard unavailable. Please open the app online once.",
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


    // OTHER RESOURCES: CACHE FIRST, NETWORK UPDATE
    if (url.origin === self.location.origin) {

        event.respondWith((async () => {

            const cached = await caches.match(request);

            const networkFetch = fetch(request).then(async response => {

                if (response.ok) {

                    const cache = await caches.open(CACHE_NAME);

                    await cache.put(
                        request,
                        response.clone()
                    );

                }

                return response;

            });

            if (cached) {

                event.waitUntil(
                    networkFetch.catch(() => {})
                );

                return cached;

            }

            try {

                return await networkFetch;

            } catch (error) {

                return new Response("Resource unavailable", {
                    status: 503
                });

            }

        })());

        return;
    }

});
