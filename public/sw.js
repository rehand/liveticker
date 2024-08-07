var CACHE_NAME = 'liveticker-cache-v1';
var urlsToCache = [
    '/images/captain.png',
    '/images/header_new.jpg',
    '/images/in.png',
    '/images/out.png',
    '/images/penalty_miss.png',
    '/images/penalty_score.png',
    '/images/red.png',
    '/images/yellow.png',
    '/images/yellowred.png',
    '/images/Muenzer-Logo_small.png',
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