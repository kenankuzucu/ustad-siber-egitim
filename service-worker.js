/* ================================================================
   ÜSTAD SİBER EĞİTİM — Service Worker (çevrimdışı çalışma)
   Strateji: uygulama kabuğu "önce önbellek", veri/3D dosyaları da
   önbellekte tutulur; güncelleme SÜRÜM numarası artırılarak yapılır.
   ================================================================ */
var SURUM = 'ustad-siber-v2.0.0';

/* Çevrimdışı mutlaka gereken dosyalar (uygulama kabuğu) */
var CEKIRDEK = [
  './',
  'index.html',
  'uygulama.js',
  'veri.kilit',
  'sahne3d.js',
  'three.min.js',
  'manifest.webmanifest',
  'foto/rozet.png',
  'foto/ustad-kenan.jpg',
  'foto/ikon-192.png',
  'foto/ikon-512.png',
  'foto/ikon-maskable-512.png',
  /* Canlı Dünya dokuları (gerçek uydu görüntüleri) */
  'doku/earth_atmos_2048.jpg',
  'doku/earth_lights_2048.png',
  'doku/earth_specular_2048.jpg',
  'doku/earth_normal_2048.jpg',
  'doku/earth_clouds_1024.png'
];

/* Kurulum: çekirdek dosyaları önbelleğe al.
   Tek tek ekliyoruz ki bir dosya eksikse (ör. ikon) kurulum çökmesin. */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SURUM).then(function (c) {
      return Promise.all(CEKIRDEK.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

/* Etkinleşme: eski sürüm önbelleklerini temizle */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.map(function (a) {
        if (a !== SURUM) return caches.delete(a);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* İstek yakalama */
self.addEventListener('fetch', function (e) {
  var istek = e.request;
  if (istek.method !== 'GET') return;

  var url = new URL(istek.url);
  var yerel = (url.origin === self.location.origin);
  var disCdn = /fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|unpkg\.com|cdnjs/.test(url.hostname);

  /* 1) Yerel dosyalar: önce önbellek (hız + çevrimdışı), yoksa ağdan al ve sakla */
  if (yerel) {
    e.respondWith(
      caches.match(istek).then(function (c) {
        if (c) {
          /* Arka planda tazele (bayat veri kalmasın) */
          fetch(istek).then(function (y) {
            if (y && y.ok) caches.open(SURUM).then(function (cc) { cc.put(istek, y.clone()); });
          }).catch(function () {});
          return c;
        }
        return fetch(istek).then(function (y) {
          if (y && y.ok) {
            var kopya = y.clone();
            caches.open(SURUM).then(function (cc) { cc.put(istek, kopya); });
          }
          return y;
        }).catch(function () {
          /* Sayfa isteği başarısızsa çevrimdışı kabuğu ver */
          if (istek.mode === 'navigate' || (istek.headers.get('accept') || '').indexOf('text/html') >= 0) {
            return caches.match('index.html');
          }
          return new Response('', { status: 504, statusText: 'cevrimdisi' });
        });
      })
    );
    return;
  }

  /* 2) Dış CDN (font/üçüncü parti): önce ağ, olmazsa önbellek */
  if (disCdn) {
    e.respondWith(
      fetch(istek).then(function (y) {
        if (y && (y.ok || y.type === 'opaque')) {
          var k2 = y.clone();
          caches.open(SURUM).then(function (cc) { cc.put(istek, k2); });
        }
        return y;
      }).catch(function () { return caches.match(istek); })
    );
  }
});

/* Sayfadan gelen mesajlar: SÜRÜM sor, önbelleği yenile */
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.tip === 'surum') {
    e.source && e.source.postMessage({ tip: 'surum', surum: SURUM });
  }
  if (d.tip === 'yenile') {
    caches.open(SURUM).then(function (c) {
      return Promise.all(CEKIRDEK.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () {
      return self.clients.matchAll().then(function (cl) {
        cl.forEach(function (c) { c.postMessage({ tip: 'yenilendi', surum: SURUM }); });
      });
    });
  }
});
