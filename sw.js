/* BACTERIO terrain : fonctionne hors ligne (les écrans sont gardés sur le téléphone).
   Les données saisies ne passent jamais par ce fichier : elles restent dans le téléphone. */
var VERSION = 'bacterio-terrain-efsa-v2.0.2';
var FICHIERS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './fx.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // écrans : d'abord ceux du téléphone (hors ligne), mis à jour en arrière-plan quand le réseau est là
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (gardé) {
      var reseau = fetch(e.request, { cache: 'no-cache' }).then(function (rep) {
        if (rep && rep.ok) c.put(e.request, rep.clone());
        return rep;
      }).catch(function () { return gardé; });
      return gardé || reseau;
    });
  }));
});
