/* WetterPro Mannheim – Service Worker: Start ohne Netz.
   App-Hülle (Seite, Manifest, Symbole, konfig.js, Leaflet) wird beim Einrichten vorab gespeichert und danach aus dem Cache geliefert.
   Daten (config.json, stationen.json, Snapshot) immer zuerst aus dem Netz, der Cache nur als Rückfall ohne Netz.
   Bilder, fremde Datenquellen und der Bildspeicher gehen nie durch den Cache.
   VERSION erneuern, damit Geräte die neue Hülle holen; online.py setzt beim Veröffentlichen den Bauzeitpunkt ein. */
var VERSION = 'wpma-20261025-012048';
var HUELLE = ['./', 'manifest.webmanifest', 'js/konfig.js', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png'];
var LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // Einzeln, damit eine fehlende Datei (z. B. konfig.js in der Einzeldatei) nicht die ganze Einrichtung verhindert
    return Promise.all(HUELLE.concat([LEAFLET]).map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () { }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (alle) {
    return Promise.all(alle.filter(function (k) { return /^wpma-/.test(k) && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function ausCacheSonstNetz(req, schluessel) {
  return caches.match(schluessel || req, { ignoreSearch: true }).then(function (r) {
    return r || fetch(req).then(function (n) {
      if (n && n.ok) { var kopie = n.clone(); caches.open(VERSION).then(function (c) { c.put(schluessel || req, kopie); }); }
      return n;
    });
  });
}
function netzSonstCache(req) {
  return fetch(req).then(function (n) {
    if (n && n.ok) { var kopie = n.clone(); caches.open(VERSION).then(function (c) { c.put(req, kopie); }); }
    return n;
  }, function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || Response.error(); }); });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.href === LEAFLET) { e.respondWith(ausCacheSonstNetz(req)); return; }
  if (url.origin !== self.location.origin) return;                         // Wetterdienste, Bildspeicher, Kacheln: immer direkt
  if (req.destination === 'image' && !/\/icons\//.test(url.pathname)) return;   // Bilder nie dauerhaft
  if (req.mode === 'navigate') { e.respondWith(ausCacheSonstNetz(req, './')); return; }
  if (/\.json$/.test(url.pathname) || /\/js\/konfig\.js$/.test(url.pathname)) { e.respondWith(netzSonstCache(req)); return; }   // Daten und Bildspeicher-Adresse: Netz zuerst
  if (/\.(js|css|webmanifest|png|svg)$/.test(url.pathname)) { e.respondWith(ausCacheSonstNetz(req)); return; }
});
