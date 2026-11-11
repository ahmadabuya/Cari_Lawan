const cacheName = 'ligatemu-shell-v4';
const assets = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('ligatemu-shell-') && key !== cacheName).map(key => caches.delete(key))
  )));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      (event.request.mode !== 'navigate' && !assets.includes(url.pathname)) || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then(async response => {
    if (response.ok && assets.includes(url.pathname)) {
      const cache = await caches.open(cacheName);
      await cache.put(url.pathname,response.clone());
    }
    return response;
  }).catch(async () => (await caches.match(url.pathname)) ||
    (event.request.mode === 'navigate' ? await caches.match('/') : null) || Response.error()));
});
