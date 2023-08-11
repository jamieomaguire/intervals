// Define a name for the current cache version
const cacheName = 'v1';

// List of files to be cached
const cacheAssets = [
  './',
  'index.html'
];

// Call Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(cacheAssets);
    }).then(() => self.skipWaiting())
  );
});

// Call Activate event
self.addEventListener('activate', (event) => {
  // Remove unwanted caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Call Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
      caches.match(event.request).then(cacheRes => {
          return cacheRes || fetch(event.request);
      })
  );
});

