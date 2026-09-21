/* ============================================================
   ÜSTAD SİBER EĞİTİM — 3D SAHNE MOTORU  (sahne3d.js)
   Her sahne bağımsız bir "tür": küre, kod yağmuru, ağ, tünel,
   DNA, kalkan, galaksi, veri blokları, radar, dünya.
   Kullanım:
     S3.baslat('bg', '#37e0ff', '#b14cff');   // canvas id + renkler
     S3.sec('matris');                        // sahne değiştir
     S3.renkAyarla('#00e05a', '#00e5ff');     // tema değişince
     S3.otoAc(true, 22);                      // otomatik geçiş (sn)
     S3.ayar({hiz:1.6, yogunluk:1.4, sallanma:true});
     S3.SABLONLAR                             // 14 hazır şablon
     S3.rastgele();                           // rastgele sahne
   ============================================================ */
(function (global) {
  'use strict';

  var LISTE = [
    { k: 'canlidunya',ad: 'Canlı Dünya',        simge: '\uD83C\uDF0D' },
    { k: 'kure',      ad: 'Enerji Küresi',      simge: '\u269B\uFE0F' },
    { k: 'matris',    ad: 'Kod Yağmuru',        simge: '\uD83D\uDFE9' },
    { k: 'ag',        ad: 'Ağ Topolojisi',      simge: '\uD83D\uDD78\uFE0F' },
    { k: 'tunel',     ad: 'Hiper Tünel',        simge: '\uD83C\uDF00' },
    { k: 'dna',       ad: 'DNA Sarmalı',        simge: '\uD83E\uDDEC' },
    { k: 'kalkan',    ad: 'Siber Kalkan',       simge: '\uD83D\uDEE1\uFE0F' },
    { k: 'galaksi',   ad: 'Galaksi',            simge: '\uD83C\uDF0C' },
    { k: 'kup',       ad: 'Veri Blokları',      simge: '\uD83E\uDDCA' },
    { k: 'radar',     ad: 'Radar',              simge: '\uD83D\uDCE1' },
    { k: 'dunya',     ad: 'Dünya Ağı',          simge: '\uD83C\uDF0D' },
    { k: 'yildiz',    ad: 'Yıldız Geçidi',      simge: '\uD83D\uDE80' },
    { k: 'orgu',      ad: 'Kuantum Örgü',       simge: '\uD83D\uDD37' },
    { k: 'sehir',     ad: 'Hologram Şehir',     simge: '\uD83C\uDF06' },
    { k: 'spektrum',  ad: 'Ses Spektrumu',      simge: '\uD83C\uDF9A\uFE0F' },
    { k: 'yorunge',   ad: 'Uydu Yörüngeleri',   simge: '\uD83D\uDEF0\uFE0F' },
    { k: 'supernova', ad: 'Süpernova',          simge: '\uD83D\uDCA5' },
    { k: 'duvar',     ad: 'Güvenlik Duvarı',    simge: '\uD83E\uDDF1' },
    { k: 'manyetik',  ad: 'Manyetik Alan',      simge: '\uD83E\uDDED' },
    { k: 'hterminal', ad: 'Hacker Terminal',    simge: '\uD83D\uDCBB' },
    { k: 'siyahhack', ad: 'Siyah Hacker',       simge: '\u25B2' },
    { k: 'kodserit',  ad: 'Kod Şeritleri',      simge: '\uD83D\uDFE5' },
    { k: 'hgoz',      ad: 'Hacker Gözü',        simge: '\uD83D\uDC41' },
    { k: 'sizinti',   ad: 'Veri Sızıntısı',     simge: '\uD83D\uDCA7' },
    { k: 'sifrekir',  ad: 'Şifre Kırıcı',       simge: '\uD83D\uDD13' },
    { k: 'sessiz',    ad: 'Sade Siyah',         simge: '\u2B1B' }
  ];

  var renderer = null, sahne = null, kamera = null, kokGrup = null;
  var guncelK = null, guncel = null;
  var ANA = null, VURGU = null;
  var mx = 0, my = 0, sonT = 0, oto = false, otoSayac = 0, OTO_SN = 22;
  var HIZ = 1, YOG = 1, SALLANMA = true, ACIK = true;

  /* ---------- malzeme yardımcıları ---------- */
  function pmat(col, op, size) {
    return new THREE.PointsMaterial({
      color: col, size: size == null ? 0.03 : size, transparent: true,
      opacity: op == null ? 0.8 : op, blending: THREE.AdditiveBlending,
      depthWrite: false, sizeAttenuation: true
    });
  }
  function lmat(col, op) {
    return new THREE.LineBasicMaterial({
      color: col, transparent: true, opacity: op == null ? 0.4 : op,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
  }
  function mmat(col, op) {
    return new THREE.MeshBasicMaterial({
      color: col, wireframe: true, transparent: true, opacity: op == null ? 0.2 : op,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
  }
  function dmat(col, op) {
    return new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: op == null ? 0.6 : op,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
  }
  function yg(n) { return Math.max(4, Math.round(n * YOG)); }
  function noktalar(dizi) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dizi), 3));
    return g;
  }
  function alan(dizi) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dizi), 3));
    return g;
  }

  /* ============================================================
     1) ENERJİ KÜRESİ
     ============================================================ */
  function sKure(g) {
    var N = yg(1400), pos = [], i;
    for (i = 0; i < N; i++) {
      var u = Math.random(), v = Math.random();
      var t = 2 * Math.PI * u, p = Math.acos(2 * v - 1), r = 2.4 + Math.random() * 2.2;
      pos.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t) * 0.7, r * Math.cos(p));
    }
    var par = new THREE.Points(noktalar(pos), pmat(ANA, 0.75, 0.022)); g.add(par);
    var kure = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 2), mmat(ANA, 0.16)); g.add(kure);
    var cekirdek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), mmat(VURGU, 0.35)); g.add(cekirdek);
    var halka = [], h;
    for (h = 0; h < 3; h++) {
      var m = new THREE.Mesh(new THREE.TorusGeometry(1.9 + h * 0.55, 0.006, 8, 140),
        new THREE.MeshBasicMaterial({ color: ANA, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.rotation.x = Math.PI / 2 + (h - 0.5) * 0.7; m.rotation.y = h * 1.1;
      g.add(m); halka.push(m);
    }
    return { guncelle: function (t, dt) {
      par.rotation.y += 0.072 * dt; par.rotation.x += 0.024 * dt;
      kure.rotation.y += 0.24 * dt; kure.rotation.x += 0.096 * dt;
      cekirdek.rotation.y -= 0.42 * dt; cekirdek.rotation.z += 0.18 * dt;
      for (var i = 0; i < halka.length; i++) { halka[i].rotation.z += 0.132 * (i + 1) * dt; halka[i].rotation.x += 0.048 * dt; }
    } };
  }

  /* ============================================================
     2) KOD YAĞMURU  (3B matris)
     ============================================================ */
  function sMatris(g) {
    var KK = Math.max(4, Math.round(Math.sqrt(yg(100))));
    var KOL = KK * KK, SIRA = 40, N = KOL * SIRA, i, j, c;
    var pos = [], col = [], hiz = [], kx = [], kz = [];
    for (c = 0; c < KOL; c++) {
      kx.push(((c % KK) - (KK - 1) / 2) * (6.2 / KK));
      kz.push((Math.floor(c / KK) - (KK - 1) / 2) * (6.2 / KK));
      hiz.push(1.2 + Math.random() * 3.2);
    }
    for (i = 0; i < N; i++) {
      c = Math.floor(i / SIRA); j = i % SIRA;
      pos.push(kx[c], -6.6 + j * 0.17 + Math.random() * 0.02, kz[c]);
      var bas = (j === 0);                       // akışın başı daha parlak
      var parlak = bas ? 1 : 0.55 + Math.random() * 0.45;
      var renk = bas ? VURGU : (Math.random() < 0.14 ? VURGU : ANA);
      col.push(Math.min(1, renk.r * parlak + (bas ? 0.25 : 0)), Math.min(1, renk.g * parlak + (bas ? 0.25 : 0)), Math.min(1, renk.b * parlak + (bas ? 0.25 : 0)));
    }
    var geo = alan(pos); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
    var p = new THREE.Points(geo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.075, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    g.add(p);
    var izgara = new THREE.GridHelper(15, 22, ANA, ANA);
    izgara.material.transparent = true; izgara.material.opacity = 0.11;
    izgara.material.blending = THREE.AdditiveBlending; izgara.material.depthWrite = false;
    izgara.position.y = -7.2; g.add(izgara);
    var dizi = geo.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        var c = Math.floor(i / SIRA);
        var yi = i * 3 + 1;
        dizi[yi] -= hiz[c] * dt;
        if (dizi[yi] < -6.7) dizi[yi] += 6.9;
      }
      geo.attributes.position.needsUpdate = true;
      g.rotation.y = Math.sin(t * 0.09) * 0.34;
      g.rotation.x = -0.07 + Math.sin(t * 0.06) * 0.05;
    } };
  }

  /* ============================================================
     3) AĞ TOPOLOJİSİ
     ============================================================ */
  function sAg(g) {
    var N = yg(68), i, j, dugum = [];
    for (i = 0; i < N; i++) {
      var r = 1.6 + Math.random() * 1.6, tt = Math.random() * Math.PI * 2, pp = Math.acos(2 * Math.random() - 1);
      dugum.push([r * Math.sin(pp) * Math.cos(tt), r * Math.sin(pp) * Math.sin(tt) * 0.72, r * Math.cos(pp)]);
    }
    var pos = [];
    for (i = 0; i < N; i++) pos.push(dugum[i][0], dugum[i][1], dugum[i][2]);
    var pn = new THREE.Points(noktalar(pos), pmat(ANA, 0.95, 0.10)); g.add(pn);

    // en yakın 2 komşuya kenar
    var kume = {}, kenar = [], a, b, k;
    function ekle(a, b) { var kk = (a < b ? a + '_' + b : b + '_' + a); if (!kume[kk]) { kume[kk] = 1; kenar.push([a, b]); } }
    for (i = 0; i < N; i++) {
      var en = [];
      for (j = 0; j < N; j++) {
        if (i === j) continue;
        var dx = dugum[i][0] - dugum[j][0], dy = dugum[i][1] - dugum[j][1], dz = dugum[i][2] - dugum[j][2];
        en.push([dx * dx + dy * dy + dz * dz, j]);
      }
      en.sort(function (p, q) { return p[0] - q[0]; });
      ekle(i, en[0][1]); ekle(i, en[1][1]);
    }
    var lp = [];
    for (k = 0; k < kenar.length; k++) {
      a = kenar[k][0]; b = kenar[k][1];
      lp.push(dugum[a][0], dugum[a][1], dugum[a][2], dugum[b][0], dugum[b][1], dugum[b][2]);
    }
    g.add(new THREE.LineSegments(noktalar(lp), lmat(ANA, 0.32)));

    // kenarlarda dolaşan paketler
    var PK = yg(40), pp2 = [], paket = [];
    for (i = 0; i < PK; i++) {
      var ei = Math.floor(Math.random() * kenar.length);
      paket.push({ e: ei, p: Math.random(), h: 0.18 + Math.random() * 0.35 });
      pp2.push(0, 0, 0);
    }
    var pg = noktalar(pp2);
    var ppk = new THREE.Points(pg, pmat(VURGU, 0.95, 0.11)); g.add(ppk);
    var pa = pg.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < PK; i++) {
        var o = paket[i]; o.p += o.h * dt;
        if (o.p > 1) { o.p = 0; o.e = Math.floor(Math.random() * kenar.length); }
        var A = dugum[kenar[o.e][0]], B = dugum[kenar[o.e][1]];
        pa[i * 3] = A[0] + (B[0] - A[0]) * o.p;
        pa[i * 3 + 1] = A[1] + (B[1] - A[1]) * o.p;
        pa[i * 3 + 2] = A[2] + (B[2] - A[2]) * o.p;
      }
      pg.attributes.position.needsUpdate = true;
      g.rotation.y += 0.11 * dt; g.rotation.x = Math.sin(t * 0.15) * 0.22;
      pn.material.opacity = 0.7 + Math.sin(t * 2.2) * 0.25;
    } };
  }

  /* ============================================================
     4) HİPER TÜNEL
     ============================================================ */
  function sTunel(g) {
    var N = yg(58), halka = [], i;
    for (i = 0; i < N; i++) {
      var yc = 1.35 + Math.random() * 0.85;
      var m = new THREE.Mesh(new THREE.TorusGeometry(yc, 0.012, 6, 84),
        new THREE.MeshBasicMaterial({ color: ANA, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.z = -i * 0.62; m.rotation.z = Math.random() * Math.PI;
      g.add(m); halka.push(m);
    }
    var SN = yg(320), pos = [], hz = [];
    for (i = 0; i < SN; i++) {
      var ac = Math.random() * Math.PI * 2, rr = 0.35 + Math.random() * 1.5;
      pos.push(Math.cos(ac) * rr, Math.sin(ac) * rr, -22 + Math.random() * 28);
      hz.push(6 + Math.random() * 9);
    }
    var sg = noktalar(pos);
    g.add(new THREE.Points(sg, pmat(VURGU, 0.8, 0.05)));
    var sa = sg.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        halka[i].position.z += 5.5 * dt;
        halka[i].rotation.z += 0.35 * dt;
        if (halka[i].position.z > 6) halka[i].position.z -= N * 0.62;
      }
      for (var j = 0; j < SN; j++) {
        var zi = j * 3 + 2;
        sa[zi] += hz[j] * dt;
        if (sa[zi] > 6) sa[zi] -= 28;
      }
      sg.attributes.position.needsUpdate = true;
      g.rotation.z = Math.sin(t * 0.2) * 0.06;
    } };
  }

  /* ============================================================
     5) DNA SARMALI
     ============================================================ */
  function sDna(g) {
    var AD = yg(124), R = 1.55, i, pos = [], capraz = [];
    for (i = 0; i < AD; i++) {
      var ac = i * 0.30, y = -5.4 + i * 0.105;
      pos.push(Math.cos(ac) * R, y, Math.sin(ac) * R);
      pos.push(Math.cos(ac + Math.PI) * R, y, Math.sin(ac + Math.PI) * R);
      if (i % 5 === 0) {
        capraz.push(Math.cos(ac) * R, y, Math.sin(ac) * R,
          Math.cos(ac + Math.PI) * R, y, Math.sin(ac + Math.PI) * R);
      }
    }
    g.add(new THREE.Points(noktalar(pos), pmat(ANA, 0.95, 0.105)));
    g.add(new THREE.LineSegments(noktalar(capraz), lmat(VURGU, 0.42)));
    var gizliKap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 10.6, 6, 1, true), mmat(ANA, 0.10));
    g.add(gizliKap);
    return { guncelle: function (t, dt) {
      g.rotation.y += 0.55 * dt;
      g.position.y = Math.sin(t * 0.45) * 0.22;
      g.rotation.z = Math.sin(t * 0.3) * 0.05;
    } };
  }

  /* ============================================================
     6) SİBER KALKAN  (dalga zemin + kubbe)
     ============================================================ */
  function sKalkan(g) {
    var kubbe = new THREE.Mesh(new THREE.SphereGeometry(2.5, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), mmat(ANA, 0.13));
    kubbe.position.y = -1.5; g.add(kubbe);
    var duz = new THREE.PlaneGeometry(11, 11, 42, 42);
    var grid = new THREE.Mesh(duz, mmat(ANA, 0.24));
    grid.rotation.x = -Math.PI / 2; grid.position.y = -1.6; g.add(grid);
    var halkalar = [], h;
    for (h = 0; h < 3; h++) {
      var rm = new THREE.Mesh(new THREE.TorusGeometry(1.7 + h * 0.8, 0.008, 6, 120), mmat(VURGU, 0.22));
      rm.rotation.x = Math.PI / 2; rm.position.y = -1.58; g.add(rm); halkalar.push(rm);
    }
    return { guncelle: function (t, dt) {
      var a = duz.attributes.position.array, i;
      for (i = 0; i < a.length; i += 3) {
        a[i + 2] = Math.sin(a[i] * 0.62 + t * 1.7) * Math.cos(a[i + 1] * 0.62 - t * 1.3) * 0.42;
      }
      duz.attributes.position.needsUpdate = true;
      kubbe.rotation.y += 0.16 * dt;
      for (h = 0; h < halkalar.length; h++) {
        halkalar[h].material.opacity = 0.14 + Math.abs(Math.sin(t * 1.1 + h * 0.7)) * 0.26;
        halkalar[h].rotation.z += 0.10 * (h + 1) * dt;
      }
    } };
  }

  /* ============================================================
     7) PARÇACIK GALAKSİSİ
     ============================================================ */
  function sGalaksi(g) {
    var N = yg(3600), KOL = 5, pos = [], col = [], i;
    for (i = 0; i < N; i++) {
      var r = Math.pow(Math.random(), 0.72) * 4.3;
      var dal = (i % KOL) / KOL * Math.PI * 2;
      var ac = dal + r * 1.05 + (Math.random() - 0.5) * 0.55;
      pos.push(Math.cos(ac) * r, (Math.random() - 0.5) * 0.55 * (1 - r / 5.6), Math.sin(ac) * r);
      var kat = Math.min(1, r / 4.2);
      var c = (Math.random() < 0.14) ? VURGU : ANA;
      var kar = 0.9 - kat * 0.35;
      col.push(c.r * kar + (1 - kar) * 0.85, c.g * kar + (1 - kar) * 0.85, c.b * kar + (1 - kar) * 0.85);
    }
    var geo = alan(pos); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
    var p = new THREE.Points(geo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.042, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    var eg = new THREE.Group(); eg.rotation.x = -0.85; eg.add(p); g.add(eg);
    var cek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), mmat(VURGU, 0.35)); eg.add(cek);
    return { guncelle: function (t, dt) {
      eg.rotation.y += 0.10 * dt;
      p.rotation.y += 0.06 * dt;
      cek.rotation.y -= 0.5 * dt;
      g.rotation.z = Math.sin(t * 0.12) * 0.08;
    } };
  }

  /* ============================================================
     8) VERİ BLOKLARI
     ============================================================ */
  function sKup(g) {
    var ortak = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    var N = yg(46), kup = [], i;
    for (i = 0; i < N; i++) {
      var m = new THREE.LineSegments(ortak, lmat(Math.random() < 0.25 ? VURGU : ANA, 0.52));
      var s = 0.18 + Math.random() * 0.44;
      m.scale.set(s, s, s);
      var bx = (Math.random() - 0.5) * 7, by = (Math.random() - 0.5) * 4.4, bz = (Math.random() - 0.5) * 5.2;
      m.position.set(bx, by, bz);
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      m.userData = { temelY: by, faz: Math.random() * 6.28, h: 0.2 + Math.random() * 0.5 * Math.sign(Math.random() - 0.5) };
      g.add(m); kup.push(m);
    }
    var cam = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), mmat(VURGU, 0.16)); g.add(cam);
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        var o = kup[i];
        o.rotation.x += 0.18 * o.userData.h * dt * 3;
        o.rotation.y += 0.26 * o.userData.h * dt * 3;
        o.position.y = o.userData.temelY + Math.sin(t * 0.7 + o.userData.faz) * 0.32;
      }
      cam.rotation.y += 0.24 * dt; cam.rotation.x += 0.1 * dt;
      g.rotation.y += 0.05 * dt;
    } };
  }

  /* ============================================================
     9) RADAR TARAMASI
     ============================================================ */
  function sRadar(g) {
    var eg = new THREE.Group(); eg.rotation.x = -0.72; g.add(eg);
    var i, h;
    for (h = 0; h < 4; h++) {
      var rm = new THREE.Mesh(new THREE.TorusGeometry(0.85 + h * 0.72, 0.01, 6, 110), mmat(ANA, 0.25));
      rm.rotation.x = Math.PI / 2; eg.add(rm);
    }
    var cr = [];
    for (i = 0; i < 2; i++) {
      var d = i === 0 ? [6.4, 0, 0, -6.4, 0, 0] : [0, 0, 6.4, 0, 0, -6.4];
      cr.push(d[0], d[1], d[2], d[3], d[4], d[5]);
    }
    eg.add(new THREE.LineSegments(noktalar(cr), lmat(ANA, 0.14)));
    // tarama dilimi (3 kademeli iz) — düzlemsel yelpaze
    function dilim(op) {
      var uc = [], a;
      for (a = -0.95; a <= 0.02; a += 0.07) uc.push([Math.cos(a) * 2.9, 0, -Math.sin(a) * 2.9]);
      var nk = [0, 0, 0], idx = [], i;
      for (i = 0; i < uc.length; i++) nk.push(uc[i][0], uc[i][1], uc[i][2]);
      for (i = 1; i < uc.length; i++) idx.push(0, i, i + 1);
      var gg = new THREE.BufferGeometry();
      gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nk), 3));
      gg.setIndex(idx);
      var m = new THREE.Mesh(gg, dmat(ANA, op));
      eg.add(m); return m;
    }
    var dilimler = [dilim(0.30), dilim(0.16), dilim(0.09)];
    // hedefler
    var BN = yg(18), hedef = [];
    for (i = 0; i < BN; i++) {
      var ac = Math.random() * Math.PI * 2, r = 0.6 + Math.random() * 2.3;
      var b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), dmat(VURGU, 0.3));
      b.position.set(Math.cos(ac) * r, 0.02, -Math.sin(ac) * r);
      b.userData = { ac: ac };
      eg.add(b); hedef.push(b);
    }
    var tarama = 0;
    return { guncelle: function (t, dt) {
      tarama += 0.95 * dt;
      var kap = tarama % (Math.PI * 2);
      var j, i;
      for (j = 0; j < dilimler.length; j++) dilimler[j].rotation.y = -kap - j * 0.30;
      for (i = 0; i < BN; i++) {
        var b = hedef[i];
        var d = ((-kap - b.userData.ac) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        var parlak = d < 1.5 ? (1 - d / 1.5) : 0;
        b.material.opacity = 0.14 + parlak * 0.86;
        var s = 1 + parlak * 0.9;
        b.scale.set(s, s, s);
      }
      g.rotation.y = Math.sin(t * 0.08) * 0.30;
    } };
  }

  /* ============================================================
     10) DÜNYA AĞI
     ============================================================ */
  function sDunya(g) {
    var yerkure = new THREE.Group(); g.add(yerkure);
    yerkure.add(new THREE.Mesh(new THREE.SphereGeometry(2.0, 30, 20), mmat(ANA, 0.07)));
    var pos = [], lat, lon;
    for (lat = -84; lat <= 84; lat += 7) {
      var en = 2.02 * Math.cos(lat * Math.PI / 180), y = 2.02 * Math.sin(lat * Math.PI / 180);
      for (lon = 0; lon < 360; lon += 7) {
        var a = lon * Math.PI / 180;
        pos.push(Math.cos(a) * en, y, Math.sin(a) * en);
      }
    }
    yerkure.add(new THREE.Points(noktalar(pos), pmat(ANA, 0.5, 0.028)));
    var ekvator = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.008, 6, 140), mmat(VURGU, 0.35));
    ekvator.rotation.x = Math.PI / 2; yerkure.add(ekvator);
    // yörünge + uydu
    var yor = new THREE.Group(); yor.rotation.x = 1.08; g.add(yor);
    var halka = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.008, 6, 140), mmat(VURGU, 0.20));
    halka.rotation.x = Math.PI / 2; yor.add(halka);
    var uydu = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), dmat(VURGU, 0.85));
    uydu.position.set(2.75, 0, 0); yor.add(uydu);
    return { guncelle: function (t, dt) {
      yerkure.rotation.y += 0.17 * dt;
      yor.rotation.y += 0.42 * dt;
      uydu.rotation.y += 1.2 * dt; uydu.rotation.x += 0.8 * dt;
      void t;
    } };
  }


  /* ============================================================
     11) YILDIZ GEÇİDİ (warp)
     ============================================================ */
  function sYildiz(g) {
    var N = yg(900), i, pos = [], zz = [], hz = [], kuy = [];
    for (i = 0; i < N; i++) {
      var ac = Math.random() * Math.PI * 2, rr = Math.random() * 4.3;
      var x = Math.cos(ac) * rr, y = Math.sin(ac) * rr * 0.85, z = -60 + Math.random() * 66;
      var k = 1.1 + Math.random() * 3.0;
      pos.push(x, y, z, x, y, z + k);
      zz.push(z); hz.push(20 + Math.random() * 34); kuy.push(k);
    }
    var geo = noktalar(pos);
    g.add(new THREE.LineSegments(geo, lmat(ANA, 0.7)));
    var saha = [];
    for (i = 0; i < 500; i++) {
      saha.push((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 18, -58 + Math.random() * 62);
    }
    g.add(new THREE.Points(noktalar(saha), pmat(VURGU, 0.5, 0.09)));
    var d = geo.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        zz[i] += hz[i] * dt;
        if (zz[i] > 7) zz[i] = -62;
        var u = i * 6;
        d[u + 2] = zz[i]; d[u + 5] = zz[i] + kuy[i];
      }
      geo.attributes.position.needsUpdate = true;
      g.rotation.z += 0.05 * dt;
      void t;
    } };
  }

  /* ============================================================
     12) KUANTUM ÖRGÜ (kristal kafes + tarama)
     ============================================================ */
  function sOrgu(g) {
    var K = 6, A = 1.5, i, j, k, lp = [];
    function P(a, b, c) { return [(a - (K - 1) / 2) * A, (b - (K - 1) / 2) * A, (c - (K - 1) / 2) * A]; }
    for (i = 0; i < K; i++) for (j = 0; j < K; j++) for (k = 0; k < K; k++) {
      var p = P(i, j, k), q;
      if (i < K - 1) { q = P(i + 1, j, k); lp.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
      if (j < K - 1) { q = P(i, j + 1, k); lp.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
      if (k < K - 1) { q = P(i, j, k + 1); lp.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
    }
    g.add(new THREE.LineSegments(noktalar(lp), lmat(ANA, 0.24)));
    var katman = [];
    for (j = 0; j < K; j++) {
      var dz = [];
      for (i = 0; i < K; i++) for (k = 0; k < K; k++) { var pp = P(i, j, k); dz.push(pp[0], pp[1], pp[2]); }
      var pm = pmat(ANA, 0.34, 0.115);
      g.add(new THREE.Points(noktalar(dz), pm));
      katman.push({ m: pm, y: (j - (K - 1) / 2) * A });
    }
    var cek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), mmat(VURGU, 0.3)); g.add(cek);
    return { guncelle: function (t, dt) {
      var tar = Math.sin(t * 0.55) * 4.4, j;
      for (j = 0; j < katman.length; j++) {
        var yakin = Math.max(0, 1 - Math.abs(katman[j].y - tar) / 2.0);
        katman[j].m.opacity = 0.16 + yakin * 0.84;
        katman[j].m.size = 0.10 + yakin * 0.12;
      }
      g.rotation.y += 0.22 * dt; g.rotation.x += 0.09 * dt;
      cek.rotation.y -= 0.6 * dt;
    } };
  }

  /* ============================================================
     13) HOLOGRAM ŞEHİR
     ============================================================ */
  function sSehir(g) {
    var izgara = new THREE.GridHelper(16, 32, ANA, ANA);
    izgara.material.transparent = true; izgara.material.opacity = 0.14;
    izgara.material.blending = THREE.AdditiveBlending; izgara.material.depthWrite = false;
    izgara.position.y = -2.3; g.add(izgara);
    var N = yg(72), isik = [], i;
    for (i = 0; i < N; i++) {
      var bx = (Math.random() - 0.5) * 13.5, bz = (Math.random() - 0.5) * 13.5;
      var h = 0.4 + Math.pow(Math.random(), 1.9) * 3.4;
      var w = 0.45 + Math.random() * 0.7, dp = 0.45 + Math.random() * 0.7;
      var b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, dp)),
        lmat(Math.random() < 0.2 ? VURGU : ANA, 0.52));
      b.position.set(bx, -2.3 + h / 2, bz);
      b.userData = { faz: Math.random() * 6.28 };
      g.add(b);
      if (Math.random() < 0.34) {
        var l = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), dmat(VURGU, 0.8));
        l.position.set(bx, -2.3 + h + 0.09, bz);
        l.userData = { faz: Math.random() * 6.28 };
        g.add(l); isik.push(l);
      }
    }
    return { guncelle: function (t, dt) {
      g.rotation.y += 0.13 * dt;
      for (var i = 0; i < isik.length; i++) {
        isik[i].material.opacity = 0.25 + Math.abs(Math.sin(t * 2.1 + isik[i].userData.faz)) * 0.75;
      }
    } };
  }

  /* ============================================================
     14) SES SPEKTRUMU (dairesel ekolayzer)
     ============================================================ */
  function sSpektrum(g) {
    var N = yg(56), cubuk = [], i;
    var kb = new THREE.BoxGeometry(0.09, 1, 0.09); kb.translate(0, 0.5, 0);
    for (i = 0; i < N; i++) {
      var ac = i / N * Math.PI * 2;
      var m = new THREE.Mesh(kb, dmat(i % 3 === 0 ? VURGU : ANA, 0.55));
      m.position.set(Math.cos(ac) * 2.05, -0.9, Math.sin(ac) * 2.05);
      m.rotation.y = -ac;
      m.userData = { faz: i * 0.31, h: 0.35 + Math.random() * 0.65 };
      g.add(m); cubuk.push(m);
    }
    var halka = [];
    for (i = 0; i < 3; i++) {
      var rm = new THREE.Mesh(new THREE.TorusGeometry(1.15 + i * 0.5, 0.006, 6, 120), mmat(i === 1 ? VURGU : ANA, 0.18));
      rm.rotation.x = Math.PI / 2; rm.position.y = -0.9; g.add(rm); halka.push(rm);
    }
    var cek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), mmat(VURGU, 0.4)); g.add(cek);
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        var u = cubuk[i].userData;
        var v = (Math.sin(t * 2.6 + u.faz) * 0.5 + 0.5) * (Math.sin(t * 1.15 + u.faz * 2.3) * 0.5 + 0.5);
        cubuk[i].scale.y = 0.22 + v * 3.4 * u.h;
        cubuk[i].material.opacity = 0.32 + v * 0.62;
      }
      g.rotation.y += 0.24 * dt;
      for (var j = 0; j < halka.length; j++) halka[j].rotation.z += 0.2 * (j + 1) * dt;
      cek.rotation.y += 0.8 * dt;
      var s = 0.9 + Math.sin(t * 3.2) * 0.12; cek.scale.set(s, s, s);
    } };
  }

  /* ============================================================
     15) UYDU YÖRÜNGELERİ
     ============================================================ */
  function sYorunge(g) {
    var cek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), mmat(ANA, 0.3)); g.add(cek);
    var ic = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), dmat(VURGU, 0.5)); g.add(ic);
    var NH = 5, uydu = [], i;
    for (i = 0; i < NH; i++) {
      var gr = new THREE.Group();
      gr.rotation.x = -0.95 + i * 0.44; gr.rotation.z = i * 0.55;
      var R = 1.75 + i * 0.33;
      var rm = new THREE.Mesh(new THREE.TorusGeometry(R, 0.008, 6, 140), mmat(i % 2 ? VURGU : ANA, 0.3));
      rm.rotation.x = Math.PI / 2; gr.add(rm);
      var u = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), dmat(i % 2 ? VURGU : ANA, 0.9));
      gr.add(u);
      uydu.push({ o: u, R: R, h: 0.45 + Math.random() * 0.85, faz: Math.random() * 6.28 });
      g.add(gr);
    }
    return { guncelle: function (t, dt) {
      for (var i = 0; i < uydu.length; i++) {
        var u = uydu[i], a = t * u.h + u.faz;
        u.o.position.set(Math.cos(a) * u.R, 0, Math.sin(a) * u.R);
        u.o.rotation.y += 1.4 * dt; u.o.rotation.x += 0.9 * dt;
      }
      cek.rotation.y += 0.25 * dt;
      ic.rotation.y -= 0.7 * dt; ic.rotation.z += 0.4 * dt;
      g.rotation.y += 0.05 * dt;
    } };
  }

  /* ============================================================
     16) SÜPERNOVA (dalga dalga patlama)
     ============================================================ */
  function sSupernova(g) {
    var N = yg(1700), i, pos = [], yon = [], hz = [], col = [];
    for (i = 0; i < N; i++) {
      var ac = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      var dx = Math.sin(ph) * Math.cos(ac), dy = Math.sin(ph) * Math.sin(ac), dz = Math.cos(ph);
      var r0 = Math.random() * 0.6;
      pos.push(dx * r0, dy * r0, dz * r0);
      yon.push(dx, dy, dz); hz.push(1.1 + Math.random() * 2.8);
      var c = Math.random() < 0.2 ? VURGU : ANA; col.push(c.r, c.g, c.b);
    }
    var geo = alan(pos); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.05, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));
    var d = geo.attributes.position.array, yr = new Float32Array(N);
    for (i = 0; i < N; i++) yr[i] = Math.random() * 4.4;
    var dalga = [], j;
    for (j = 0; j < 3; j++) {
      var rm = new THREE.Mesh(new THREE.TorusGeometry(1, 0.01, 6, 120), mmat(j === 1 ? VURGU : ANA, 0.4));
      rm.rotation.x = Math.PI / 2; g.add(rm); dalga.push({ o: rm, f: j * 1.7 });
    }
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        yr[i] += hz[i] * dt;
        if (yr[i] > 5.4) yr[i] = 0.05;
        var u = i * 3, r = yr[i];
        d[u] = yon[u] * r; d[u + 1] = yon[u + 1] * r; d[u + 2] = yon[u + 2] * r;
      }
      geo.attributes.position.needsUpdate = true;
      for (var j = 0; j < dalga.length; j++) {
        var w = dalga[j], s2 = (t * 1.35 + w.f) % 4.8;
        w.o.scale.set(s2, s2, s2);
        w.o.material.opacity = Math.max(0, 0.45 * (1 - s2 / 4.8));
        w.o.rotation.z += 0.25 * dt;
      }
      g.rotation.y += 0.12 * dt; g.rotation.x = Math.sin(t * 0.2) * 0.25;
    } };
  }

  /* ============================================================
     17) GÜVENLİK DUVARI (saldırı dalgası)
     ============================================================ */
  function sDuvar(g) {
    var W = 10, H = 6.4;
    var duz = new THREE.PlaneGeometry(W, H, 44, 28);
    var duvar = new THREE.Mesh(duz, mmat(ANA, 0.22));
    duvar.position.z = -2.0; g.add(duvar);
    var da = duz.attributes.position.array;
    var N = yg(48), i, pos = [], hz = [];
    for (i = 0; i < N; i++) {
      pos.push((Math.random() - 0.5) * W * 0.95, (Math.random() - 0.5) * H * 0.95, -18 + Math.random() * 15);
      hz.push(6 + Math.random() * 11);
    }
    var sg = noktalar(pos);
    g.add(new THREE.Points(sg, pmat(VURGU, 0.9, 0.095)));
    var sa = sg.attributes.position.array;
    var parlama = [], j;
    for (j = 0; j < 10; j++) {
      var pm = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.30, 22), dmat(VURGU, 0));
      pm.position.set(0, 0, -1.97); g.add(pm);
      parlama.push({ o: pm, s: 0 });
    }
    var cek = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mmat(VURGU, 0.25));
    cek.position.z = 0.9; g.add(cek);
    var sira = 0;
    return { guncelle: function (t, dt) {
      var k;
      for (k = 0; k < da.length; k += 3) {
        da[k + 2] = Math.sin(da[k] * 0.8 + t * 1.4) * Math.cos(da[k + 1] * 0.9 + t * 1.1) * 0.16;
      }
      duz.attributes.position.needsUpdate = true;
      for (var i = 0; i < N; i++) {
        var zi = i * 3 + 2;
        sa[zi] += hz[i] * dt;
        if (sa[zi] >= -2.02) {
          var pp = parlama[sira % parlama.length]; sira++;
          pp.o.position.set(sa[i * 3], sa[i * 3 + 1], -1.95); pp.s = 1;
          sa[zi] = -18;
          sa[i * 3] = (Math.random() - 0.5) * W * 0.95;
          sa[i * 3 + 1] = (Math.random() - 0.5) * H * 0.95;
        }
      }
      sg.attributes.position.needsUpdate = true;
      for (var j = 0; j < parlama.length; j++) {
        var q = parlama[j];
        if (q.s > 0) {
          q.s -= dt * 1.7;
          q.o.scale.setScalar(0.5 + (1 - q.s) * 1.3);
          q.o.material.opacity = Math.max(0, q.s);
        } else q.o.material.opacity = 0;
      }
      cek.rotation.y += 0.3 * dt;
      g.rotation.y = Math.sin(t * 0.1) * 0.25;
    } };
  }

  /* ============================================================
     18) MANYETİK ALAN (kutup alan çizgileri)
     ============================================================ */
  function sManyetik(g) {
    var cekirdek = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), mmat(VURGU, 0.5)); g.add(cekirdek);
    var hatlar = [], N = 5, AZ = 6, i, j;
    function egri(r0, az) {
      var dizi = [], n;
      for (n = 1; n <= 26; n++) {
        var th = Math.PI * (0.10 + 0.80 * n / 26);
        var r = r0 * Math.sin(th) * Math.sin(th);
        dizi.push(Math.cos(az) * r * Math.sin(th), r * Math.cos(th) * 1.55, Math.sin(az) * r * Math.sin(th));
      }
      return dizi;
    }
    for (i = 0; i < N; i++) {
      for (j = 0; j < AZ; j++) {
        var e = egri(1.2 + i * 0.62, j / AZ * Math.PI * 2);
        hatlar.push(e);
        g.add(new THREE.Line(noktalar(e), lmat(i % 2 ? VURGU : ANA, 0.32)));
      }
    }
    var PK = yg(95), par = [], pp = [];
    for (i = 0; i < PK; i++) {
      par.push({ l: Math.floor(Math.random() * hatlar.length), t: Math.random(), h: 0.08 + Math.random() * 0.22 });
      pp.push(0, 0, 0);
    }
    var pg = noktalar(pp);
    g.add(new THREE.Points(pg, pmat(ANA, 0.9, 0.09)));
    var pa = pg.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < PK; i++) {
        var o = par[i]; o.t += o.h * dt;
        if (o.t > 1) { o.t = 0; o.l = Math.floor(Math.random() * hatlar.length); }
        var hat = hatlar[o.l], kn = hat.length / 3 - 1;
        var fi = o.t * kn, n = Math.floor(fi);
        if (n >= kn) n = kn - 1;
        var f = fi - n, a3 = n * 3;
        pa[i * 3] = hat[a3] + (hat[a3 + 3] - hat[a3]) * f;
        pa[i * 3 + 1] = hat[a3 + 1] + (hat[a3 + 4] - hat[a3 + 1]) * f;
        pa[i * 3 + 2] = hat[a3 + 2] + (hat[a3 + 5] - hat[a3 + 2]) * f;
      }
      pg.attributes.position.needsUpdate = true;
      g.rotation.y += 0.18 * dt;
      cekirdek.rotation.y += 0.4 * dt;
      void t;
    } };
  }


  /* ============================================================
     19) HACKER TERMİNAl (kayan kod satırları + imleç)
     ============================================================ */
  function sHTerminal(g) {
    var SAT = yg(26), satir = [], i, j;
    function metinUret() {                 // bir satırın "kelime" parçaları
      var adet = 3 + Math.floor(Math.random() * 4), p = -4.4, d = [];
      for (var k = 0; k < adet; k++) {
        var uz = 0.25 + Math.random() * 1.1;
        d.push([p, uz]);
        p += uz + 0.18 + Math.random() * 0.5;
      }
      return d;
    }
    for (i = 0; i < SAT; i++) {
      var parca = metinUret();
      var dizi = [];
      for (j = 0; j < parca.length; j++) dizi.push(parca[j][0], 0, 0, parca[j][0] + parca[j][1], 0, 0);
      var geo = noktalar(dizi);
      var m = lmat(ANA, 0.5);
      var o = new THREE.LineSegments(geo, m);
      g.add(o);
      satir.push({ o: o, g: geo, parca: parca, y: -4.0 + i * 0.31, z: -2.0 + (i % 8) * 0.5, h: 0.30 + Math.random() * 0.55, faz: Math.random() * 6.28 });
    }
    var cerceve = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(9.6, 8.4, 4.6)), lmat(ANA, 0.22));
    g.add(cerceve);
    var tarayici = new THREE.LineSegments(noktalar([-4.7, 0, 1.5, 4.7, 0, 1.5]), lmat(VURGU, 0.9));
    g.add(tarayici);
    var tarayici2 = new THREE.LineSegments(noktalar([-4.7, 0, 1.45, 4.7, 0, 1.45]), lmat(VURGU, 0.35));
    g.add(tarayici2);
    var imlec = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 0.26), dmat(VURGU, 0.95));
    imlec.position.set(2.9, -4.0, 1.4); g.add(imlec);
    function yaz(r) {
      var a = r.g.attributes.position.array, k;
      for (k = 0; k < r.parca.length; k++) {
        a[k * 6 + 1] = r.y; a[k * 6 + 4] = r.y;
        a[k * 6 + 2] = r.z; a[k * 6 + 5] = r.z;
      }
      r.g.attributes.position.needsUpdate = true;
    }
    for (i = 0; i < SAT; i++) yaz(satir[i]);
    return { guncelle: function (t, dt) {
      for (var i = 0; i < SAT; i++) {
        var r = satir[i];
        r.y += r.h * dt;
        if (r.y > 4.2) {                       // satır yeniden doğar → yeni "metin"
          r.y -= 8.2;
          r.parca = metinUret();
          var dizi = [];
          for (var j = 0; j < r.parca.length; j++) dizi.push(r.parca[j][0], 0, 0, r.parca[j][0] + r.parca[j][1], 0, 0);
          r.g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dizi), 3));
        }
        r.o.position.x = Math.sin(t * 0.55 + r.faz) * 0.22;
        yaz(r);
        var yakin = Math.max(0, 1 - Math.abs(r.y - Math.sin(t * 0.6) * 4.0) / 1.2);
        r.o.material.opacity = 0.40 + yakin * 0.6;
      }
      var sy = Math.sin(t * 0.6) * 4.0;
      tarayici.position.y = sy; tarayici2.position.y = sy - 0.09;
      imlec.material.opacity = Math.sin(t * 5.4) > 0 ? 1 : 0.12;
      g.rotation.y = Math.sin(t * 0.12) * 0.10;
    } };
  }

  /* ============================================================
     20) SİYAH HACKER (saf siyah zeminde sade piramit)
     ============================================================ */
  function sSiyahHack(g) {
    var piramit = new THREE.Mesh(new THREE.ConeGeometry(2.1, 3.0, 3, 1, true), mmat(ANA, 0.30));
    piramit.position.y = -0.2; g.add(piramit);
    var piramit2 = new THREE.Mesh(new THREE.ConeGeometry(1.45, 2.1, 3, 1, true), mmat(VURGU, 0.22));
    piramit2.position.y = -0.2; g.add(piramit2);
    var cek = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), dmat(VURGU, 0.85));
    cek.position.y = -0.2; g.add(cek);
    var tarama = [], i;
    for (i = 0; i < 3; i++) {
      var rm = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.01, 6, 90), mmat(ANA, 0.35));
      rm.rotation.x = Math.PI / 2; g.add(rm); tarama.push({ o: rm, f: i * 2.4 });
    }
    var damla = yg(60), dp = [], dz = [], hz = [];
    for (i = 0; i < damla; i++) {
      var ac = Math.random() * Math.PI * 2, rr = Math.random() * 1.5;
      dp.push(Math.cos(ac) * rr, 1.4 + Math.random() * 3, Math.sin(ac) * rr);
      hz.push(0.5 + Math.random() * 1.3); dz.push(1);
    }
    var dg = noktalar(dp);
    g.add(new THREE.Points(dg, pmat(ANA, 0.75, 0.055)));
    var da = dg.attributes.position.array;
    var zemin = new THREE.GridHelper(14, 28, ANA, ANA);
    zemin.material.transparent = true; zemin.material.opacity = 0.09;
    zemin.material.blending = THREE.AdditiveBlending; zemin.material.depthWrite = false;
    zemin.position.y = -1.9; g.add(zemin);
    return { guncelle: function (t, dt) {
      piramit.rotation.y += 0.16 * dt; piramit2.rotation.y -= 0.24 * dt;
      cek.rotation.y += 0.7 * dt; cek.rotation.x += 0.4 * dt;
      for (var i = 0; i < 3; i++) {
        var s2 = ((t * 0.55 + tarama[i].f) % 4.2);
        tarama[i].o.position.y = -1.9 + s2;
        tarama[i].o.material.opacity = Math.max(0, 0.5 * (1 - s2 / 4.2));
        tarama[i].o.rotation.z += 0.2 * dt;
      }
      for (var j = 0; j < damla; j++) {
        var yi = j * 3 + 1;
        da[yi] -= hz[j] * dt;
        if (da[yi] < -1.9) da[yi] = 4.4;
      }
      dg.attributes.position.needsUpdate = true;
      g.rotation.y = Math.sin(t * 0.08) * 0.16;
    } };
  }

  /* ============================================================
     21) KOD ŞERİTLERİ (3B yeşil kod yağmuru — çizgi)
     ============================================================ */
  function sKodserit(g) {
    var N = yg(230), i, pos = [], col = [], y0 = [], hz = [], uzun = [];
    for (i = 0; i < N; i++) {
      var x = (Math.random() - 0.5) * 9, z = (Math.random() - 0.5) * 7.5;
      var uz = 0.5 + Math.random() * 1.9;
      var y = -6 + Math.random() * 6;
      pos.push(x, y, z, x, y - uz, z);
      var par = 0.35 + Math.random() * 0.65;
      col.push(ANA.r * par, ANA.g * par, ANA.b * par);
      col.push(ANA.r * par * 0.15, ANA.g * par * 0.15, ANA.b * par * 0.15);
      hz.push(1.6 + Math.random() * 4.2); y0.push(y); uzun.push(uz);
    }
    var geo = noktalar(pos);
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
    g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));
    var a = geo.attributes.position.array;
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        var u = i * 6;
        a[u + 1] -= hz[i] * dt; a[u + 4] -= hz[i] * dt;
        if (a[u + 1] < -6.2) { a[u + 1] += 12.4; a[u + 4] += 12.4; }
      }
      geo.attributes.position.needsUpdate = true;
      g.rotation.y = Math.sin(t * 0.07) * 0.22;
      g.rotation.x = Math.sin(t * 0.05) * 0.06;
      void uzun; void y0;
    } };
  }

  /* ============================================================
     22) HACKER GÖZÜ (gözetleme)
     ============================================================ */
  function sHGoz(g) {
    var goz = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.045, 8, 120), mmat(ANA, 0.55));
    goz.scale.y = 0.52; g.add(goz);
    var kapak = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.02, 6, 120), mmat(ANA, 0.22));
    kapak.scale.y = 0.55; g.add(kapak);
    var iris = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 6, 90), mmat(VURGU, 0.6));
    g.add(iris);
    var gozbebek = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), dmat(VURGU, 0.75));
    g.add(gozbebek);
    var isin = [], i;
    for (i = 0; i < 10; i++) {
      var ac = i / 10 * Math.PI * 2;
      var ll = new THREE.Line(noktalar([Math.cos(ac) * 0.75, Math.sin(ac) * 0.75 * 0.6, 0,
        Math.cos(ac) * 2.6, Math.sin(ac) * 2.6 * 0.6, 0]), lmat(ANA, 0.14));
      g.add(ll); isin.push(ll);
    }
    var tarayici = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 40), dmat(VURGU, 0.5));
    g.add(tarayici);
    return { guncelle: function (t, dt) {
      var a = Math.sin(t * 0.35) * 0.5;
      var b = Math.cos(t * 0.27) * 0.28;
      iris.position.set(a, b, 0.12); gozbebek.position.set(a, b, 0.2);
      iris.rotation.z += 0.5 * dt; goz.rotation.z += 0.04 * dt; kapak.rotation.z -= 0.07 * dt;
      iris.scale.setScalar(1 + Math.sin(t * 1.6) * 0.05);
      var s2 = ((t * 0.8) % 2.8);
      tarayici.scale.setScalar(0.6 + s2 * 0.75);
      tarayici.material.opacity = Math.max(0, 0.55 * (1 - s2 / 2.8));
      for (var i = 0; i < isin.length; i++) isin[i].material.opacity = 0.08 + Math.abs(Math.sin(t * 2 + i * 0.6)) * 0.16;
      g.rotation.y = Math.sin(t * 0.1) * 0.18;
    } };
  }

  /* ============================================================
     23) VERİ SIZINTISI (merkezden dışarı akan veri)
     ============================================================ */
  function sSizinti(g) {
    var sunucu = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), mmat(ANA, 0.45));
    g.add(sunucu);
    var yuz = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mmat(VURGU, 0.6));
    g.add(yuz);
    var N = yg(900), i, pos = [], yon = [], r0 = [], hz = [], col = [];
    for (i = 0; i < N; i++) {
      var ac = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      var dx = Math.sin(ph) * Math.cos(ac), dy = Math.sin(ph) * Math.sin(ac), dz = Math.cos(ph);
      var rr = 0.35 + Math.random() * 0.3;
      pos.push(dx * rr, dy * rr, dz * rr);
      yon.push(dx, dy - 0.35, dz); hz.push(0.8 + Math.random() * 2.4);
      r0.push(rr);
      var c = Math.random() < 0.25 ? VURGU : ANA; col.push(c.r, c.g, c.b);
    }
    var geo = alan(pos); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
    g.add(new THREE.Points(geo, new THREE.PointsMaterial({
      vertexColors: true, size: 0.045, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));
    var da = geo.attributes.position.array;
    var zemin = new THREE.GridHelper(15, 30, ANA, ANA);
    zemin.material.transparent = true; zemin.material.opacity = 0.10;
    zemin.material.blending = THREE.AdditiveBlending; zemin.material.depthWrite = false;
    zemin.position.y = -2.6; g.add(zemin);
    return { guncelle: function (t, dt) {
      for (var i = 0; i < N; i++) {
        r0[i] += hz[i] * dt;
        if (r0[i] > 5.4) r0[i] = 0.35;
        var u = i * 3, r = r0[i];
        da[u] = yon[u] * r; da[u + 1] = yon[u + 1] * r; da[u + 2] = yon[u + 2] * r;
      }
      geo.attributes.position.needsUpdate = true;
      sunucu.rotation.y += 0.35 * dt; sunucu.rotation.x += 0.18 * dt;
      yuz.rotation.y -= 0.5 * dt; yuz.rotation.z += 0.3 * dt;
      g.rotation.y = Math.sin(t * 0.09) * 0.3;
    } };
  }

  /* ============================================================
     24) ŞİFRE KIRICI (brute-force kadranları)
     ============================================================ */
  function sSifrekir(g) {
    var cek = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.09, 10, 40), mmat(VURGU, 0.7)); g.add(cek);
    var orta = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), dmat(VURGU, 0.85)); g.add(orta);
    var kadran = [], n, i;
    var kare = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    for (n = 0; n < 3; n++) {
      var gr = new THREE.Group();
      var adet = 16 + n * 6, R = 1.15 + n * 0.62;
      var blok = [];
      for (i = 0; i < adet; i++) {
        var ac = i / adet * Math.PI * 2;
        var m = new THREE.LineSegments(kare, lmat(n === 1 ? VURGU : ANA, 0.4));
        m.position.set(Math.cos(ac) * R, Math.sin(ac) * R, 0);
        m.scale.setScalar(0.10 + Math.random() * 0.14);
        m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        gr.add(m); blok.push(m);
      }
      gr.rotation.z = n * 0.7;
      g.add(gr);
      kadran.push({ g: gr, b: blok, h: (0.5 + n * 0.35) * (n % 2 ? -1 : 1), faz: Math.random() * 6.28 });
    }
    return { guncelle: function (t, dt) {
      var i, j;
      for (i = 0; i < kadran.length; i++) {
        var k = kadran[i];
        k.g.rotation.z += k.h * dt;
        var vurguZamani = Math.abs(Math.sin(t * 0.8 + i * 1.1)) > 0.94;
        for (j = 0; j < k.b.length; j++) {
          var b = k.b[j];
          b.rotation.x += 0.5 * dt; b.rotation.y += 0.4 * dt;
          b.material.opacity = vurguZamani ? 0.95 : 0.35 + (j % 5 === 0 ? 0.2 : 0);
        }
        k.g.scale.setScalar(1 + (vurguZamani ? 0.06 : 0));
      }
      cek.rotation.x += 0.6 * dt; cek.rotation.y += 0.4 * dt;
      orta.rotation.y += 1.1 * dt; orta.rotation.x += 0.6 * dt;
      g.rotation.y = Math.sin(t * 0.12) * 0.25;
      g.rotation.x = Math.cos(t * 0.15) * 0.16;
    } };
  }

  /* ============================================================
     25) SADE SİYAH (neredeyse boş — sakin zemin)
     ============================================================ */
  function sSessiz(g) {
    var zemin = new THREE.GridHelper(18, 36, ANA, ANA);
    zemin.material.transparent = true; zemin.material.opacity = 0.10;
    zemin.material.blending = THREE.AdditiveBlending; zemin.material.depthWrite = false;
    zemin.position.y = -2.4; g.add(zemin);
    var tavan = zemin.clone(); tavan.position.y = 2.6; tavan.material = zemin.material.clone();
    tavan.material.opacity = 0.05; g.add(tavan);
    var kure = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), mmat(ANA, 0.22)); g.add(kure);
    var kure2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), mmat(VURGU, 0.3)); g.add(kure2);
    var n = yg(220), i, pos = [];
    for (i = 0; i < n; i++) pos.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 7, -6 + Math.random() * 12);
    g.add(new THREE.Points(noktalar(pos), pmat(ANA, 0.35, 0.035)));
    return { guncelle: function (t, dt) {
      kure.rotation.y += 0.12 * dt; kure.rotation.x += 0.05 * dt;
      kure2.rotation.y -= 0.35 * dt;
      kure.position.y = Math.sin(t * 0.4) * 0.18; kure2.position.y = kure.position.y;
      void t;
    } };
  }


  /* ============================================================
     CANLI DÜNYA — gerçek uydu dokusu, bulut, gece ışıkları,
     atmosfer halesi, veri yayları. Sürekli döner.
     ============================================================ */
  var CD_DOKU = null;
  var CD_GUNES = new THREE.Vector3(-0.52, 0.34, 0.78).normalize();

  function cdDoku() {
    if (CD_DOKU) return CD_DOKU;
    var Y = new THREE.TextureLoader();
    function al(yol, renkli) {
      var t = Y.load(yol);
      if (renkli && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    }
    CD_DOKU = {
      gun:   al('doku/earth_atmos_2048.jpg', true),
      gece:  al('doku/earth_lights_2048.png', true),
      spek:  al('doku/earth_specular_2048.jpg', false),
      yuk:   al('doku/earth_normal_2048.jpg', false),
      bulut: al('doku/earth_clouds_1024.png', true)
    };
    return CD_DOKU;
  }

  /* lat/lon -> vektör (dünya yarıçapı 1 kabul) */
  function cdNokta(lat, lon) {
    var p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t));
  }

  function sCanliDunya(g) {
    var D = cdDoku();
    var kok = new THREE.Group(); g.add(kok);
    var R = 2.55;

    /* --- ışık --- */
    var gunes = new THREE.DirectionalLight(0xffffff, 2.0);
    gunes.position.copy(CD_GUNES).multiplyScalar(12); kok.add(gunes);
    kok.add(new THREE.AmbientLight(0x2a3b4d, 1.15));

    /* --- yıldız alanı --- */
    var sp = [], i, N = yg(2600);
    for (i = 0; i < N; i++) {
      var u = Math.random(), v = Math.random();
      var th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1), rr = 30 + Math.random() * 26;
      sp.push(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph));
    }
    var yildiz = new THREE.Points(noktalar(sp), new THREE.PointsMaterial({
      color: 0xe4f6ff, size: 0.09, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    kok.add(yildiz);

    /* --- dünya (23.4° eksen eğikliği) --- */
    var dunya = new THREE.Group();
    dunya.rotation.z = 23.4 * Math.PI / 180;
    kok.add(dunya);

    var matYer = new THREE.MeshPhongMaterial({
      map: D.gun, specularMap: D.spek, bumpMap: D.yuk, bumpScale: 0.03,
      specular: new THREE.Color(0x2d4d68), shininess: 14
    });
    var yer = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 96), matYer); dunya.add(yer);

    /* --- bulut katmanı --- */
    var matBulut = new THREE.MeshPhongMaterial({
      map: D.bulut, transparent: true, opacity: 0.8, depthWrite: false, color: 0xffffff
    });
    var bulut = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 96, 64), matBulut); dunya.add(bulut);

    /* --- gece ışıkları (yalnız karanlık yüzeyde parlar) --- */
    var matGece = new THREE.ShaderMaterial({
      uniforms: {
        map:    { value: D.gece },
        gunes:  { value: CD_GUNES.clone() },
        guc:    { value: 1.35 }
      },
      vertexShader: [
        'varying vec2 vUv; varying vec3 vN;',
        'void main(){',
        '  vUv = uv;',
        '  vN = normalize(mat3(modelMatrix) * normal);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D map; uniform vec3 gunes; uniform float guc;',
        'varying vec2 vUv; varying vec3 vN;',
        'void main(){',
        '  vec3 t = texture2D(map, vUv).rgb;',
        '  float isik = max(t.r, max(t.g, t.b));',
        '  float aydin = dot(normalize(vN), normalize(gunes));',
        '  float gece = smoothstep(0.16, -0.26, aydin);',
        '  float a = isik * gece;',
        '  gl_FragColor = vec4(vec3(1.0, 0.84, 0.58) * isik * guc, a);',
        '}'
      ].join('\n'),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    var gece = new THREE.Mesh(new THREE.SphereGeometry(R * 1.002, 96, 64), matGece); dunya.add(gece);

    /* --- atmosfer halesi --- */
    var matAtmos = new THREE.ShaderMaterial({
      uniforms: {
        ana:   { value: new THREE.Color(ANA) },
        vurgu: { value: new THREE.Color(VURGU) },
        gunes: { value: CD_GUNES.clone() }
      },
      vertexShader: [
        'varying vec3 vN; varying vec3 vP;',
        'void main(){',
        '  vN = normalize(mat3(modelMatrix) * normal);',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vP = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 ana; uniform vec3 vurgu; uniform vec3 gunes;',
        'varying vec3 vN; varying vec3 vP;',
        'void main(){',
        '  vec3 V = normalize(cameraPosition - vP);',
        '  float kirilma = pow(clamp(1.0 - abs(dot(normalize(vN), V)), 0.0, 1.0), 2.35);',
        '  float lit = clamp(dot(normalize(vN), normalize(gunes)), 0.0, 1.0);',
        '  float s = 0.28 + 0.95 * lit;',
        '  vec3 renk = mix(ana, vurgu, 0.28) * kirilma * s * 3.1;',
        '  gl_FragColor = vec4(renk, clamp(kirilma * s, 0.0, 1.0));',
        '}'
      ].join('\n'),
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    var atmos = new THREE.Mesh(new THREE.SphereGeometry(R * 1.155, 72, 54), matAtmos); dunya.add(atmos);

    /* --- veri yayları (kıtalar arası bağlantı hissi) --- */
    var yaylar = [], yayMat = [], sehirler = [
      [41.0, 28.9], [39.9, 116.4], [40.7, -74.0], [51.5, -0.12], [35.7, 139.7],
      [37.0, 37.4], [48.9, 2.35], [55.75, 37.6], [-23.5, -46.6], [1.35, 103.8],
      [19.4, -99.1], [-33.9, 151.2], [25.2, 55.3], [52.5, 13.4], [30.0, 31.2]
    ];
    for (i = 0; i < 13; i++) {
      var a = cdNokta(sehirler[i % sehirler.length][0], sehirler[i % sehirler.length][1]);
      var b = cdNokta(sehirler[(i * 5 + 3) % sehirler.length][0], sehirler[(i * 5 + 3) % sehirler.length][1]);
      if (a.distanceTo(b) < 0.6) continue;
      var pts = [], n2 = 26, k;
      for (k = 0; k <= n2; k++) {
        var t2 = k / n2;
        var p = new THREE.Vector3().copy(a).lerp(b, t2);
        var uzunluk = p.length();
        if (uzunluk > 0.0001) p.multiplyScalar((R * (1 + 0.30 * Math.sin(Math.PI * t2))) / uzunluk);
        pts.push(p);
      }
      var egri = new THREE.CatmullRomCurve3(pts);
      var m = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? VURGU : ANA, transparent: true, opacity: 0.34,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      yaylar.push(new THREE.Mesh(new THREE.TubeGeometry(egri, 48, 0.0055, 6, false), m));
      yayMat.push(m);
    }
    for (i = 0; i < yaylar.length; i++) dunya.add(yaylar[i]);

    /* --- uydu yörüngesi --- */
    var yor = new THREE.Mesh(new THREE.TorusGeometry(R * 1.30, 0.0045, 8, 170),
      new THREE.MeshBasicMaterial({ color: VURGU, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    yor.rotation.x = 1.32; yor.rotation.y = 0.42; dunya.add(yor);
    var uyduVeri = [];
    for (i = 0; i < 3; i++) {
      var g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
      var uy = new THREE.Points(g2, pmat(0xfff0b0, 0.95, 0.07)); uy.userData.a = i * 2.1; dunya.add(uy); uyduVeri.push(uy);
    }

    /* --- konum: ekranın sol-alt boşluğuna yerleştir --- */
    var hedefX = 0.30, hedefY = 0.84;     /* ekran oranı (0-1): sol-alt boşluk */
    function yerles() {
      var W = global.innerWidth, H = global.innerHeight;
      var gorunurY = 2 * Math.tan(30 * Math.PI / 180) * 5.2;
      var gorunurX = gorunurY * (W / H);
      kok.position.x = (hedefX - 0.5) * gorunurX;
      kok.position.y = -(hedefY - 0.5) * gorunurY;
    }
    yerles();

    /* --- animasyon --- */
    var donus = 0, bulutDonus = 0;
    return {
      boyut: function () { yerles(); },
      guncelle: function (t, dt) {
        donus += 0.052 * dt; bulutDonus += 0.074 * dt;
        dunya.rotation.y = donus;
        bulut.rotation.y = bulutDonus - donus;      /* bulutlar yerküreye göre kayar */
        yildiz.rotation.y += 0.0035 * dt;
        atmos.rotation.y = -donus;                   /* hale sabit kalsın */
        gece.rotation.y = 0;
        var k;
        for (k = 0; k < yayMat.length; k++) yayMat[k].opacity = 0.22 + 0.20 * (0.5 + 0.5 * Math.sin(t * 0.9 + k * 1.7));
        for (k = 0; k < uyduVeri.length; k++) {
          var uy = uyduVeri[k], a2 = uy.userData.a + t * 0.30 * (k % 2 ? 1 : -1) * 0.5;
          var r2 = R * 1.30, x = Math.cos(a2) * r2, z = Math.sin(a2) * r2;
          var e = new THREE.Euler(1.32, 0.42, 0);
          var v = new THREE.Vector3(x, 0, z).applyEuler(e);
          uy.geometry.attributes.position.setXYZ(0, v.x, v.y, v.z);
          uy.geometry.attributes.position.needsUpdate = true;
          uy.geometry.computeBoundingSphere();
        }
        void 0;
      }
    };
  }

  var YAP = {
    kure: sKure, matris: sMatris, ag: sAg, tunel: sTunel, dna: sDna,
    kalkan: sKalkan, galaksi: sGalaksi, kup: sKup, radar: sRadar, dunya: sDunya,
    yildiz: sYildiz, orgu: sOrgu, sehir: sSehir, spektrum: sSpektrum,
    yorunge: sYorunge, supernova: sSupernova, duvar: sDuvar, manyetik: sManyetik,
    hterminal: sHTerminal, siyahhack: sSiyahHack, kodserit: sKodserit,
    hgoz: sHGoz, sizinti: sSizinti, sifrekir: sSifrekir, sessiz: sSessiz, canlidunya: sCanliDunya
  };

  /* ---------- temizlik ---------- */
  function bosalt(obje) {
    obje.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); });
        else o.material.dispose();
      }
    });
  }

  /* ---------- ana döngü ---------- */
  function dongu() {
    if (!renderer) return;
    requestAnimationFrame(dongu);
    var simdi = performance.now();
    var dt = Math.min((simdi - sonT) / 1000, 0.05) * HIZ; sonT = simdi;
    if (!ACIK) { return; }
    var t = simdi * 0.001;
    if (guncel && guncel.guncelle) { try { guncel.guncelle(t, dt); } catch (e) { } }
    if (SALLANMA) {
      kamera.position.x += (mx * 1.4 - kamera.position.x) * 0.04;
      kamera.position.y += (-my * 1.0 - kamera.position.y) * 0.04;
    } else if (kamera.position.x !== 0 || kamera.position.y !== 0) {
      kamera.position.x += (0 - kamera.position.x) * 0.06;
      kamera.position.y += (0 - kamera.position.y) * 0.06;
    }
    kamera.lookAt(0, 0, 0);
    if (oto) {
      otoSayac += dt;
      if (otoSayac >= OTO_SN && guncelK !== 'canlidunya') {
        otoSayac = 0;
        var i = 0, k;
        for (k = 0; k < LISTE.length; k++) if (LISTE[k].k === guncelK) i = k;
        sec(LISTE[(i + 1) % LISTE.length].k);
      }
    }
    renderer.render(sahne, kamera);
  }

  /* ---------- dışa açık ---------- */
  function baslat(canvasId, anaRenk, vurguRenk) {
    if (typeof THREE === 'undefined') return false;
    var cv = document.getElementById(canvasId);
    if (!cv) return false;
    ANA = new THREE.Color(anaRenk || '#37e0ff');
    VURGU = new THREE.Color(vurguRenk || '#b14cff');
    renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    sahne = new THREE.Scene();
    kamera = new THREE.PerspectiveCamera(60, global.innerWidth / global.innerHeight, 0.1, 1000);
    kamera.position.z = 5.2;
    function boyut() {
      renderer.setSize(global.innerWidth, global.innerHeight);
      kamera.aspect = global.innerWidth / global.innerHeight;
      kamera.updateProjectionMatrix();
      if (guncel && guncel.boyut) { try { guncel.boyut(global.innerWidth, global.innerHeight); } catch (e) { } }
    }
    global.addEventListener('resize', boyut); boyut();
    global.addEventListener('mousemove', function (e) {
      mx = (e.clientX / global.innerWidth - 0.5) * 2;
      my = (e.clientY / global.innerHeight - 0.5) * 2;
    });
    sonT = performance.now();
    dongu();
    return true;
  }

  function sec(k) {
    if (!sahne || !YAP[k]) return;
    if (kokGrup) { sahne.remove(kokGrup); bosalt(kokGrup); }
    kokGrup = new THREE.Group(); sahne.add(kokGrup);
    guncelK = k; guncel = YAP[k](kokGrup);
    otoSayac = 0;
    if (typeof global.S3_SAHNE_DEGISTI === 'function') global.S3_SAHNE_DEGISTI(k);
  }

  function renkAyarla(anaRenk, vurguRenk) {
    if (typeof THREE === 'undefined') return;
    ANA = new THREE.Color(anaRenk); VURGU = new THREE.Color(vurguRenk);
    if (kokGrup) sec(guncelK);   // sahneyi yeni renkle yeniden kur
  }
  function acKapa(on) {
    ACIK = !!on;
    if (renderer && renderer.domElement) {
      renderer.domElement.style.display = ACIK ? '' : 'none';
      if (ACIK) { sonT = performance.now(); renderer.render(sahne, kamera); }
    }
  }
  function acikMi() { return ACIK; }
  function otoAc(on, sn) { oto = !!on; if (sn) OTO_SN = sn; otoSayac = 0; }
  function otoDurum() { return oto; }


  /* ---------- SEÇENEKLER ---------- */
  function ayar(a) {
    if (!a) return;
    if (a.hiz != null) HIZ = a.hiz;
    if (a.yogunluk != null && a.yogunluk !== YOG) { YOG = a.yogunluk; if (kokGrup) sec(guncelK); }
    if (a.sallanma != null) SALLANMA = !!a.sallanma;
    if (a.otoSn != null) OTO_SN = a.otoSn;
  }
  function ayarOku() { return { hiz: HIZ, yogunluk: YOG, sallanma: SALLANMA, otoSn: OTO_SN }; }
  function rastgele() {
    var aday = [], i;
    for (i = 0; i < LISTE.length; i++) if (LISTE[i].k !== guncelK) aday.push(LISTE[i].k);
    sec(aday[Math.floor(Math.random() * aday.length)]);
  }

  /* ---------- HAZIR ŞABLONLAR (sahne + tema + seçenek) ---------- */
  var SABLONLAR = [
    { ad: 'Canlı Dünya',    simge: '\uD83C\uDF0D', sahne: 'canlidunya', tema: 'siber', hiz: 0.9, yog: 1, sallanma: false, soluk: false },
    { ad: 'Eğitim Klasik',  simge: '\uD83C\uDF93', sahne: 'kure',      tema: 'siber',  hiz: 1,   yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Kali Terminal',  simge: '\uD83D\uDC09', sahne: 'matris',    tema: 'hacker', hiz: 1.6, yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Matris Turbo',   simge: '\uD83D\uDFE9', sahne: 'matris',    tema: 'hacker', hiz: 2.6, yog: 1.5, sallanma: false, soluk: false },
    { ad: 'Gece Nöbeti',    simge: '\uD83D\uDCE1', sahne: 'radar',     tema: 'kan',    hiz: 1,   yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Siber Savaş',    simge: '\u2694\uFE0F', sahne: 'duvar',     tema: 'kan',    hiz: 1.8, yog: 1.3, sallanma: true,  soluk: false },
    { ad: 'Uzay İstasyonu', simge: '\uD83D\uDEF0\uFE0F', sahne: 'yorunge', tema: 'siber', hiz: 1, yog: 1,  sallanma: true,  soluk: false },
    { ad: 'Galaksi',        simge: '\uD83C\uDF0C', sahne: 'galaksi',   tema: 'mor',    hiz: 0.7, yog: 1.3, sallanma: true,  soluk: false },
    { ad: 'Hologram Şehir', simge: '\uD83C\uDF06', sahne: 'sehir',     tema: 'mor',    hiz: 1.2, yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Ağ Merkezi',     simge: '\uD83D\uDD78\uFE0F', sahne: 'ag', tema: 'altin',  hiz: 1,   yog: 1.4, sallanma: true,  soluk: false },
    { ad: 'Warp',           simge: '\uD83D\uDE80', sahne: 'yildiz',    tema: 'siber',  hiz: 1.9, yog: 1.2, sallanma: false, soluk: false },
    { ad: 'Kuantum Örgü',   simge: '\uD83D\uDD37', sahne: 'orgu',      tema: 'altin',  hiz: 1.3, yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Ses Salonu',     simge: '\uD83C\uDF9A\uFE0F', sahne: 'spektrum', tema: 'altin', hiz: 1.2, yog: 1.2, sallanma: true, soluk: false },
    { ad: 'Manyetik Alan',  simge: '\uD83E\uDDED', sahne: 'manyetik',  tema: 'mor',    hiz: 1,   yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Okuma Modu',     simge: '\uD83D\uDCD6', sahne: 'kalkan',    tema: 'acik',   hiz: 0.6, yog: 1,   sallanma: false, soluk: true },
    /* ---- HACKER ŞABLONLARI ---- */
    { ad: 'Hacker Yeşil',    simge: '\uD83D\uDCBB', sahne: 'hterminal', tema: 'hacker',   hiz: 1.4, yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Yeşil Kod',       simge: '\uD83D\uDFE5', sahne: 'kodserit',  tema: 'hacker',   hiz: 2.0, yog: 1.4, sallanma: false, soluk: false },
    { ad: 'Siyah Hacker',    simge: '\u25B2',        sahne: 'siyahhack', tema: 'siyah',    hiz: 0.8, yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Sade Siyah',      simge: '\u2B1B',        sahne: 'sessiz',    tema: 'siyah',    hiz: 0.7, yog: 1,   sallanma: false, soluk: true },
    { ad: 'Camgöbeği Hacker',simge: '\uD83E\uDDCA', sahne: 'kodserit',  tema: 'hackcam',  hiz: 1.5, yog: 1.2, sallanma: true,  soluk: false },
    { ad: 'Amber Terminal',  simge: '\uD83D\uDFE0', sahne: 'hterminal', tema: 'hackamber',hiz: 1.3, yog: 1.2, sallanma: true,  soluk: false },
    { ad: 'Mor Hacker',      simge: '\uD83D\uDFE3', sahne: 'sizinti',   tema: 'hackmor',  hiz: 1.2, yog: 1.3, sallanma: true,  soluk: false },
    { ad: 'Kızıl Hacker',    simge: '\uD83D\uDD34', sahne: 'sifrekir',  tema: 'hackkan',  hiz: 1.6, yog: 1,   sallanma: false, soluk: false },
    { ad: 'Gözetleme',       simge: '\uD83D\uDC41', sahne: 'hgoz',      tema: 'hackcam',  hiz: 1,   yog: 1,   sallanma: true,  soluk: false },
    { ad: 'Buz Hacker',      simge: '\uD83E\uDDCA', sahne: 'siyahhack', tema: 'hackbuz',  hiz: 1.1, yog: 1.2, sallanma: true,  soluk: false },
    { ad: 'Brute Force',     simge: '\uD83D\uDD13', sahne: 'sifrekir',  tema: 'hackamber',hiz: 2.2, yog: 1.5, sallanma: false, soluk: false }
  ];

  global.S3 = {
    LISTE: LISTE, baslat: baslat, sec: sec, renkAyarla: renkAyarla,
    otoAc: otoAc, otoDurum: otoDurum, aktif: function () { return guncelK; },
    hazir: function () { return !!renderer; },
    ayar: ayar, ayarOku: ayarOku, rastgele: rastgele, SABLONLAR: SABLONLAR,
    acKapa: acKapa, acikMi: acikMi
  };
})(window);
