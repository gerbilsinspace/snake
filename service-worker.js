const CACHE_NAME = 'static-cache';
const urls = [
  '.',
  'https://fonts.googleapis.com/css?family=Baloo'
];

self.addEventListener('install', function (event) {
  console.log('Service worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urls);
    })
    .catch(error => {
      console.log(error)
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );
});

function fetchAndCache(url) {
  return fetch(url).then(function(response) {
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }

    return caches.open(CACHE_NAME).then(function(cache) {
      cache.put(url, response.clone());
      return response;
    });
  }).catch(function(error) {
    console.log('Request failed:', error);
    // You could return a custom offline 404 page here
  });
}
