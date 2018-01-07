var CACHE_NAME = 'liveticker-cache-v1';
var urlsToCache = [
    '/images/header.jpg',
    '/images/in.png',
    '/images/out.png',
    '/images/red.png',
    '/images/yellow.png',
    '/images/yellowred.png',
    '/image/captain.png',
    '/audio/hymne_sturm.mp3'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});