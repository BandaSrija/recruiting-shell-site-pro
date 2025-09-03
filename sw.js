// Minimal offline cache (optional). Serves shell assets when available.
const CACHE = 'rwl-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './assets/logo-placeholder.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(()=>caches.match('./index.html')))
  );
});
