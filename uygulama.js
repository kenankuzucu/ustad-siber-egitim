
/* ================= VERİ ================= */
var V = (typeof EGITIM_VERI !== 'undefined') ? EGITIM_VERI : null;
var BOLUM_RENK = ['#37e0ff','#00e05a','#ff5470','#b14cff','#ffc107','#ff8f00','#2f7bff','#00e5ff',
  '#f06292','#26c6da','#9ccc65','#ff7043','#7e57c2','#e02434','#00c853','#40c4ff','#ffd166','#c0ca33',
  '#4dd0e1','#ec407a','#8d6e63','#5c6bc0','#66bb6a','#ffa726','#ab47bc','#ef5350','#29b6f6','#d4e157','#ffca28'];
var AKTIF = null, GUNCEL = null, SINIR = 150;

/* ================= 3D ARKA PLAN (10 farklı sahne) ================= */
function anaRenk(){ return getComputedStyle(document.body).getPropertyValue('--ana').trim() || '#37e0ff'; }
function vurguRenk(){ return getComputedStyle(document.body).getPropertyValue('--vurgu').trim() || '#b14cff'; }

/* ================= 3D STÜDYO (18 sahne · 14 şablon · seçenekler) ================= */
var AYAR = { hiz:1, yogunluk:1, sallanma:true, otoSn:22 };
var SUANKI_SABLON = -1, SOLUK = false, ISIMA = 1;

function sahneAdi(k){
  var ad='', simge='';
  if(typeof S3==='undefined') return '';
  S3.LISTE.forEach(function(s){ if(s.k===k){ ad=s.ad; simge=s.simge; } });
  return simge+' '+ad;
}
function suankiYaz(){
  var t = (SUANKI_SABLON>=0 && S3.SABLONLAR[SUANKI_SABLON] ? 'Şablon: '+S3.SABLONLAR[SUANKI_SABLON].ad+'  ·  ' : '');
  document.getElementById('suanki').textContent = t + sahneAdi(S3.aktif());
}
function kaydet(){
  try{
    localStorage.setItem('use_sahne', S3.aktif());
    localStorage.setItem('use_sablon', String(SUANKI_SABLON));
    localStorage.setItem('use_ayar', JSON.stringify(AYAR));
    localStorage.setItem('use_sahne_oto', S3.otoDurum()?'1':'0');
    localStorage.setItem('use_sahne_soluk', SOLUK?'1':'0');
    localStorage.setItem('use_isima', String(ISIMA));
    localStorage.setItem('use_tema', document.body.getAttribute('data-tema'));
    localStorage.setItem('use_3d', (typeof S3!=='undefined' && S3.acikMi())?'1':'0');
  }catch(e){}
}
function studyoCiz(){
  if(typeof dunyaPlakaGuncelle==='function') setTimeout(dunyaPlakaGuncelle, 60);
  if(typeof S3==='undefined') return;
  var aktif=S3.aktif(), i;
  // sahne listesi
  var el=document.getElementById('stSahne');
  if(el){
    el.innerHTML='';
    S3.LISTE.forEach(function(s,k){
      var b=document.createElement('button');
      b.className='stDug'+(s.k===aktif?' aktif':'');
      b.innerHTML='<span class="s">'+s.simge+'</span><span class="ad">'+(k+1)+'. '+s.ad+'</span>';
      b.onclick=function(){ sahneSec(s.k); };
      el.appendChild(b);
    });
    document.getElementById('stSahneSayi').textContent='('+S3.LISTE.length+')';
  }
  // şablonlar
  var es=document.getElementById('stSablon');
  if(es){
    es.innerHTML='';
    S3.SABLONLAR.forEach(function(sb,k){
      var b=document.createElement('button');
      b.className='stDug'+(k===SUANKI_SABLON?' aktif':'');
      b.innerHTML='<span class="s">'+sb.simge+'</span><span class="ad">'+sb.ad+'</span>';
      b.onclick=function(){ sablonUygula(k); };
      es.appendChild(b);
    });
    document.getElementById('stSablonSayi').textContent='('+S3.SABLONLAR.length+')';
  }
  var alt=document.getElementById('stAlt');
  if(alt) alt.textContent = S3.LISTE.length+' sahne \u00b7 '+S3.SABLONLAR.length+' hazır şablon \u00b7 12 tema \u00b7 animasyon seçenekleri';
  secenekCiz();
  suankiYaz();
}
function secenekCiz(){
  var el=document.getElementById('stSecenek'); if(!el || typeof S3==='undefined') return;
  var o = S3.ayarOku();
  var satirlar = [
    ['hiz','ANİMASYON HIZI', [[0.6,'Yavaş'],[1,'Normal'],[1.6,'Hızlı'],[2.6,'Turbo']], AYAR.hiz],
    ['yogunluk','SAHNE YOĞUNLUĞU', [[0.6,'Az'],[1,'Normal'],[1.5,'Çok']], AYAR.yogunluk],
    ['isima','IŞIMA / PARLAKLIK', [[0.7,'Soluk'],[1,'Normal'],[1.35,'Parlak']], ISIMA],
    ['sallanma','KAMERA TAKİBİ', [[1,'Açık'],[0,'Kapalı']], AYAR.sallanma?1:0],
    ['otoSn','OTOMATİK GEÇİŞ', [[12,'12 sn'],[22,'22 sn'],[40,'40 sn']], o.otoSn],
    ['bolumSahne','BÖLÜM SAHNESİ', [[1,'Açık'],[0,'Kapalı']], (function(){ try{ return (localStorage.getItem('use_sahneEsle')||'1')==='1'?1:0; }catch(e){ return 1; } })()]
  ];
  el.innerHTML='';
  satirlar.forEach(function(r){
    var d=document.createElement('div'); d.className='secGrup';
    var ad=document.createElement('span'); ad.className='secAd'; ad.textContent=r[1]; d.appendChild(ad);
    var k=document.createElement('span'); k.className='secDugler';
    r[2].forEach(function(x){
      var b=document.createElement('button');
      b.className='secDug'+(x[0]===r[3]?' aktif':'');
      b.textContent=x[1];
      b.onclick=function(){ secenekSec(r[0], x[0]); };
      k.appendChild(b);
    });
    d.appendChild(k); el.appendChild(d);
  });
}
function secenekSec(ad, deger){
  if(ad==='bolumSahne'){
    try{ localStorage.setItem('use_sahneEsle', deger?'1':'0'); }catch(e){}
    if(deger && GUNCEL) bolumSahneAc(GUNCEL.id);
    SUANKI_SABLON=-1; kaydet(); studyoCiz(); return;
  }
  if(ad==='isima'){ ISIMA=deger; isimaAyarla(deger); }
  else if(ad==='sallanma'){ AYAR.sallanma=!!deger; S3.ayar({sallanma:AYAR.sallanma}); }
  else if(ad==='otoSn'){ AYAR.otoSn=deger; S3.ayar({otoSn:deger}); if(S3.otoDurum()) S3.otoAc(true,deger); }
  else { AYAR[ad]=deger; S3.ayar(ad==='hiz' ? {hiz:deger} : {yogunluk:deger}); }
  SUANKI_SABLON=-1; kaydet(); studyoCiz();
}
function isimaAyarla(v){
  var bg=document.getElementById('bg'); if(!bg) return;
  bg.style.filter = (v===1) ? '' : 'brightness('+v+')';
}
function solukAyarla(acik){
  SOLUK=!!acik;
  var bg=document.getElementById('bg'); if(bg) bg.style.opacity = SOLUK ? '0.5' : '1';
  var b=document.getElementById('solukDug'); if(b) b.className='otoDug'+(SOLUK?' aktif':'');
}
function solukDegistir(){ solukAyarla(!SOLUK); kaydet(); }
function uc3dEtiket(acik){
  var b=document.getElementById('uc3dDug'); if(!b) return;
  b.className='otoDug'+(acik?' aktif':'');
  b.innerHTML = acik ? '\u25C9 3D A\u00C7IK' : '\u25CB 3D KAPALI';
}
function uc3dDegistir(){
  if(typeof dunyaPlakaGuncelle==='function') setTimeout(dunyaPlakaGuncelle, 120);
  if(typeof S3==='undefined' || !S3.hazir()) return;
  var acik = !S3.acikMi();
  S3.acKapa(acik);
  uc3dEtiket(acik);
  var sb=document.querySelector('.sahneBar');
  if(sb) sb.style.opacity = acik ? '1' : '0.75';
  document.getElementById('suanki').textContent = acik ? sahneAdi(S3.aktif()) : '3D kapalı — düz arka plan';
  kaydet();
}
function sahneSec(k){ S3.sec(k); SUANKI_SABLON=-1; kaydet(); studyoCiz(); }
function rastgeleSahne(){ S3.rastgele(); SUANKI_SABLON=-1; kaydet(); studyoCiz(); }
function sablonUygula(i){
  var sb=S3.SABLONLAR[i]; if(!sb) return;
  SUANKI_SABLON=i;
  document.body.setAttribute('data-tema', sb.tema); temaCiz();
  S3.sec(sb.sahne);
  S3.ayar({hiz:sb.hiz, yogunluk:sb.yog, sallanma:sb.sallanma});
  AYAR.hiz=sb.hiz; AYAR.yogunluk=sb.yog; AYAR.sallanma=sb.sallanma;
  solukAyarla(!!sb.soluk);
  isimaAyarla(ISIMA);
  kaydet(); studyoCiz();
}
function otoDegistir(){
  var acik = !S3.otoDurum();
  S3.otoAc(acik, AYAR.otoSn);
  var b=document.getElementById('otoDug');
  if(b){ b.className='otoDug'+(acik?' aktif':''); b.innerHTML = acik ? '\u21BB OTOMAT\u0130K A\u00C7IK' : '\u21BB OTOMAT\u0130K'; }
  kaydet();
}
/* ---------- panel aç/kapat ---------- */
function studyoKonum(){
  var p=document.getElementById('studyo'), bar=document.querySelector('.sahneBar');
  if(p && bar) p.style.top = (bar.getBoundingClientRect().bottom + 6) + 'px';
}
function studyoDegistir(){
  var p=document.getElementById('studyo'); if(!p) return;
  if(p.className.indexOf('acik')>=0){ studyoKapat(); return; }
  studyoCiz(); studyoKonum();
  p.className='studyo acik';
}
function studyoAc(){ studyoCiz(); studyoKonum(); document.getElementById('studyo').className='studyo acik'; }
function studyoKapat(){ var p=document.getElementById('studyo'); if(p) p.className='studyo'; }
document.addEventListener('click', function(e){
  var p=document.getElementById('studyo');
  if(!p || p.className.indexOf('acik')<0) return;
  if(p.contains(e.target) || e.target.id==='studyoDug') return;
  studyoKapat();
});
document.addEventListener('keydown', function(e){ if(e.key==='Escape') studyoKapat(); });
window.addEventListener('resize', function(){ var p=document.getElementById('studyo');
  if(p && p.className.indexOf('acik')>=0) studyoKonum(); });
/* sahne motoru sahne değişince buraya haber verir */
window.S3_SAHNE_DEGISTI = function(k){ suankiYaz(); };

/* ================= MENÜ ================= */
function menuCiz(){
  var el=document.getElementById('menuSol'); var h='<h3>Eğitim Bölümleri</h3>';
  V.bolumler.forEach(function(b,i){
    h += '<div class="menuSatir" data-i="'+i+'" onclick="bolumAc('+i+')">'
       + '<span class="simge">'+b.simge+'</span><span class="ad">'+b.ad+'</span>'
       + '<span class="sayi">'+b.kayitlar.length+'</span><span class="menuYuzde">%'+bolumYuzde(b)+'</span></div>';
  });
  el.innerHTML=h;
}
/* Bölüm → 3D sahne eşlemesi (BÖLÜM SAHNESİ açıkken bölüme girince sahne değişir) */
var BOLUM_SAHNE = {
  komutlar:'hterminal', araclar:'kup', osint:'dunya', eglence:'matris', web:'duvar',
  kullanim:'kup', adli:'radar', agguvenlik:'ag', dallar:'tunel', sozluk:'galaksi',
  test:'kure', cve:'sizinti', vakalar:'radar', senaryolar:'sehir', lablar:'kup',
  sertifika:'yildiz', kariyer:'sehir', hukuk:'kalkan', savunma:'kalkan', anonimlik:'sifrekir',
  rehber:'hterminal', denetim:'hgoz', yol:'yildiz', portlar:'ag', ipuclari:'kure',
  teksatir:'kodserit', hatalar:'hterminal', hackerler:'siyahhack', tarih:'galaksi',
  filtreler:'kodserit', haberler:'dunya', harita:'dunya', kurulum:'hterminal',
  hizli:'kodserit', istatistik:'kup', ad:'sehir', mobil:'yorunge',
  kripto:'orgu', parola:'kalkan', sertlestirme:'duvar', zararli:'dna', bulut:'kup', insan:'hgoz',
  kurulum2:'kup', ileri2:'spektrum'
};
function bolumSahneAcetkin(){
  try{ return (localStorage.getItem('use_sahneEsle')||'1')==='1'; }catch(e){ return true; }
}
function bolumSahneAc(id){
  if(!bolumSahneAcetkin() || !id || typeof sahneSec!=='function') return;
  var k = BOLUM_SAHNE[id]; if(!k) return;
  try{ if(typeof S3!=='undefined' && S3.aktif && S3.aktif()===k) return; }catch(e){}
  sahneSec(k);
}
function bolumAc(i){
  AKTIF=i; GUNCEL=V.bolumler[i]; document.getElementById('ara').value='';
  FILTRE_Q=''; FILTRE_TIP='hepsi';
  bolumSahneAc(GUNCEL ? GUNCEL.id : null);
  if(GUNCEL && !FAV_MOD){ OGR.son={id:GUNCEL.id, ad:GUNCEL.ad}; ogrKaydet(); }
  var el=document.getElementById('menuSol');
  Array.prototype.forEach.call(el.querySelectorAll('.menuSatir'),function(s){ s.className='menuSatir'; });
  el.querySelector('.menuSatir[data-i="'+i+'"]').className='menuSatir aktif';
  kartCiz();
}

/* ================= KART ÇİZİM ================= */
function kac(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function kartHtml(b, r, rn, i){
  var renk = BOLUM_RENK[i % BOLUM_RENK.length];
  var key = ogrK(b.id!==undefined?b.id:'arama', rn);
  var h = '<div class="kart" data-k="'+kac(key)+'" data-b="'+kac(b.id||'arama')+'" style="--bolumRenk:'+renk+'">';
  h += '<div class="kartArac">'+
       '<button class="kA fav" title="Favorilere ekle / çıkar" onclick="ogrTikla(this,\'fav\')">&#9734;</button>'+
       '<button class="kA okundu" title="Okundu olarak işaretle" onclick="ogrTikla(this,\'oku\')">&#9675;</button>'+
       '<button class="kA" title="Bu kayda not ekle" onclick="ogrTikla(this,\'not\')">&#128221;</button>'+
       '<button class="kA" title="Sesli oku (Türkçe)" onclick="ogrTikla(this,\'dinle\')">&#128266;</button>'+
       '<button class="kA basit" title="Bu konuyu basitleştir (yapay zekâ istemini kopyalar — site anahtar kullanmaz)" onclick="basitlestir(this)">&#129302;</button>'+
       '</div>';
  h += '<div class="kartUst">'+(r.ust?kac(r.ust)+' · ':'')+'<span class="etiketRozet" style="background:'+renk+'">'+kac(r.etiket||r.tip||'')+'</span></div>';
  h += '<div class="kartBaslik"><span class="kartAd">'+kac(r.ad)+'</span></div>';
  if(r.tip==='soru'){
    h += '<div class="kartMetin">'+kac(r.metin)+'</div>';
    (r.secenekler||[]).forEach(function(s,k){
      h += '<button class="cevap" data-d="'+r.dogru+'" data-k="'+k+'" onclick="cevapTikla(this)">'+
           String.fromCharCode(65+k)+') '+kac(s)+'</button>';
    });
  } else {
    if(r.metin) h += '<div class="kartMetin">'+kac(r.metin)+'</div>';
    if(r.ornek) h += '<div class="kartOrnek"><span class="kodmetin">'+kac(r.ornek)+'</span>'+
        '<button class="kopya" onclick="kopyala(this)">KOPYALA</button></div>';
  }
  h += '</div>';
  return h;
}
function kartCiz(){
  var el=document.getElementById('icerik');
  if(!GUNCEL){ el.innerHTML='<div class="bos">Soldan bir bölüm seç</div>'; return; }
  var renk=BOLUM_RENK[AKTIF % BOLUM_RENK.length];
  var h='<div class="icerikBaslik"><span class="simge">'+GUNCEL.simge+'</span>'+
      '<h2>'+kac(GUNCEL.ad)+'</h2><span class="toplam">'+GUNCEL.kayitlar.length+' kayıt</span></div>';
  h+='<div class="bolumRenkBar" style="--bolumRenk:'+renk+'"></div>';
  if(FAV_MOD){
    var favlar=[];
    V.bolumler.forEach(function(bb){ bb.kayitlar.forEach(function(rr,ii){ if(OGR.fav[ogrK(bb.id,ii)]) favlar.push({b:bb,r:rr,i:ii}); }); });
    var hf='<div class="icerikBaslik"><span class="simge">&#11088;</span><h2>FAVORİLERİM</h2><span class="toplam">'+favlar.length+' kayıt</span></div><div class="bolumRenkBar"></div>';
    if(!favlar.length) hf+='<div class="bos">Henüz favori eklemedin. Kartın sağ üstündeki yıldıza bas.</div>';
    favlar.slice(0,SINIR).forEach(function(x,k){ hf+=kartHtml(x.b,x.r,x.i,V.bolumler.indexOf(x.b)); });
    el.innerHTML=hf; ogrSimgeGuncelle(); return;
  }
  h += icFiltreHtml();
  h += '<div id="kartListe"></div>';
  el.innerHTML=h;
  kartListeCiz();
  ogrSimgeGuncelle();
}

/* ---------- bölüm içi arama + tür filtresi ---------- */
var FILTRE_Q='', FILTRE_TIP='hepsi';
function icFiltreHtml(){
  if(!GUNCEL) return '';
  var say={}, top=0;
  GUNCEL.kayitlar.forEach(function(r){ var t=r.tip||'metin'; say[t]=(say[t]||0)+1; top++; });
  var h='<div class="icFiltre">'+
        '<input id="icAra" class="icAra" placeholder="Bu bölümde ara… (komut, terim, kelime)" value="'+kac(FILTRE_Q)+'" oninput="icAraYaz(this.value)">'+
        '<div class="icTipler" id="icTipler">'+icTipDugmeleri(say, top)+'</div></div>';
  return h;
}
function icTipDugmeleri(say, top){
  if(!say){
    say={}; top=0;
    GUNCEL.kayitlar.forEach(function(r){ var t=r.tip||'metin'; say[t]=(say[t]||0)+1; top++; });
  }
  var h='<button class="icTip'+(FILTRE_TIP==='hepsi'?' aktif':'')+'" onclick="icTipSec(\'hepsi\')">TÜMÜ <b>'+top+'</b></button>';
  Object.keys(say).forEach(function(t){
    h+='<button class="icTip'+(FILTRE_TIP===t?' aktif':'')+'" onclick="icTipSec(\''+t+'\')">'+kac(t.toUpperCase())+' <b>'+say[t]+'</b></button>';
  });
  return h;
}
function icSuz(){
  var q=FILTRE_Q.toLowerCase();
  return GUNCEL.kayitlar.map(function(r,i){ return {r:r,i:i}; }).filter(function(x){
    if(FILTRE_TIP!=='hepsi' && (x.r.tip||'metin')!==FILTRE_TIP) return false;
    if(!q) return true;
    var s=((x.r.ad||'')+' '+(x.r.metin||'')+' '+(x.r.ornek||'')+' '+(x.r.ust||'')+' '+(x.r.etiket||'')).toLowerCase();
    return s.indexOf(q)>=0;
  });
}
function kartListeCiz(){
  var el=document.getElementById('kartListe'); if(!el || !GUNCEL) return;
  var l=icSuz(), h='';
  if(!l.length){
    h='<div class="bos">Bu bölümde aramaya uyan kayıt yok. Tür filtresini TÜMÜ yap ya da başka kelime dene.</div>';
  } else {
    l.slice(0,SINIR).forEach(function(x){ h += kartHtml(GUNCEL,x.r,x.i,AKTIF); });
    if(l.length>SINIR) h+='<button class="gosterBtn" onclick="tumunuGosterFiltre()">&#9660; TÜMÜNÜ GÖSTER ('+l.length+' kayıt)</button>';
    h+='<div class="icSayi">'+l.length+' / '+GUNCEL.kayitlar.length+' kayıt gösteriliyor'+(FILTRE_TIP!=='hepsi'?' · tür: '+kac(FILTRE_TIP.toUpperCase()):'')+'</div>';
  }
  el.innerHTML=h; ogrSimgeGuncelle();
}
function icAraYaz(v){ FILTRE_Q=v||''; SINIR=150; kartListeCiz(); }
function icTipSec(t){
  FILTRE_TIP=t; SINIR=150;
  var kutu=document.getElementById('icTipler');
  if(kutu) kutu.innerHTML=icTipDugmeleri();
  kartListeCiz();
}
function tumunuGoster(){ SINIR=99999; kartCiz(); SINIR=150; }
function tumunuGosterFiltre(){ SINIR=99999; kartListeCiz(); SINIR=150; }
function kopyala(btn){
  var t=btn.parentNode.querySelector('.kodmetin').textContent;
  navigator.clipboard.writeText(t).then(function(){ btn.textContent='✔'; setTimeout(function(){btn.textContent='KOPYALA';},1200); });
}
function cevapTikla(btn){
  var kart=btn.parentNode; var d=parseInt(btn.getAttribute('data-d'),10);
  Array.prototype.forEach.call(kart.querySelectorAll('.cevap'),function(s,k){
    if(k===d){ s.className='cevap dogru'; } else if(s===btn){ s.className='cevap yanlis'; }
    s.disabled=true; s.style.cursor='default';
  });
}

/* ================= ARAMA ================= */
function ara(){
  var q=document.getElementById('ara').value.trim().toLowerCase();
  if(!q){ if(AKTIF!==null){ kartCiz(); } else { document.getElementById('icerik').innerHTML='<div class="bos">Soldan bir bölüm seç ya da yukarıda ara</div>'; } return; }
  var sonuc=[];
  V.bolumler.forEach(function(b,bi){
    b.kayitlar.forEach(function(r){
      var aranabilir=((r.ad||'')+' '+(r.metin||'')+' '+(r.ornek||'')+' '+(r.ust||'')).toLowerCase();
      if(aranabilir.indexOf(q)>=0) sonuc.push({b:b, r:r, bi:bi});
    });
  });
  var el=document.getElementById('icerik');
  var h='<div class="icerikBaslik"><span class="simge">&#128269;</span><h2>Arama: '+kac(document.getElementById('ara').value)+'</h2>'+
      '<span class="toplam">'+sonuc.length+' sonuç</span></div><div class="bolumRenkBar"></div>';
  if(!sonuc.length){ h+='<div class="bos">Sonuç yok</div>'; }
  else {
    sonuc.slice(0,SINIR).forEach(function(x,i){ h += kartHtml(x.b,x.r,x.b.kayitlar.indexOf(x.r),x.bi); });
    if(sonuc.length>SINIR) h+='<div class="bos">…'+sonuc.length+' sonuçtan ilk '+SINIR+' tanesi. Aramayı daralt.</div>';
  }
  el.innerHTML=h;
  ogrSimgeGuncelle();
}

/* ================= TEMALAR ================= */
var TEMALAR=[
  ['siber','Siber Cyan','#37e0ff'],['hacker','Hacker Yeşili','#00e05a'],['kan','Kan Kırmızı','#e02434'],
  ['mor','Ultraviyole','#b14cff'],['altin','Kali Altın','#ffc107'],['acik','Aydınlık','#0a58ca'],
  ['siyah','Hacker Siyah','#8a8f98'],['hackcam','Hacker Camgöbeği','#00e5ff'],['hackamber','Hacker Amber','#ffb300'],
  ['hackmor','Hacker Mor','#b14cff'],['hackkan','Hacker Kızıl','#ff1744'],['hackbuz','Hacker Buz','#7ee8ff']
];
function temaCiz(){
  var el=document.getElementById('temaCubuk'); el.innerHTML='';
  TEMALAR.forEach(function(t){
    var d=document.createElement('div'); d.className='temaNok'+(document.body.getAttribute('data-tema')===t[0]?' aktif':'');
    d.style.background=t[2]; d.title=t[1];
    d.onclick=function(){
      document.body.setAttribute('data-tema',t[0]);
      temaCiz();
      if(typeof S3!=='undefined' && S3.hazir()) S3.renkAyarla(anaRenk(), vurguRenk());
      try{ localStorage.setItem('use_tema', t[0]); }catch(e){}
    };
    el.appendChild(d);
  });
}


/* ================= KİŞİSEL KATMAN: FAVORİ / OKUNDU / NOT / SESLİ OKUMA / İLERLEME ================= */
var OGR={ fav:{}, oku:{}, not:{}, son:null, yanlis:{} };
var FAV_MOD=false, KONUSAN=null;
function ogrYukle(){
  function oku2(a,v){ try{ return JSON.parse(localStorage.getItem(a))||v; }catch(e){ return v; } }
  OGR.fav=oku2('use_fav',{}); OGR.oku=oku2('use_oku',{}); OGR.not=oku2('use_notlar',{});
  OGR.yanlis=oku2('use_yanlis',{}); OGR.son=oku2('use_son',null);
}
function ogrKaydet(){
  try{
    localStorage.setItem('use_fav',JSON.stringify(OGR.fav));
    localStorage.setItem('use_oku',JSON.stringify(OGR.oku));
    localStorage.setItem('use_notlar',JSON.stringify(OGR.not));
    localStorage.setItem('use_yanlis',JSON.stringify(OGR.yanlis));
    if(OGR.son) localStorage.setItem('use_son',JSON.stringify(OGR.son));
  }catch(e){}
}
function ogrK(bid,idx){ return bid+'#'+idx; }
function bolumYuzde(b){
  var o=OGR.oku[b.id]||{}, n=b.kayitlar.length, c=0;
  if(!n) return 0;
  b.kayitlar.forEach(function(r,i){ if(o[ogrK(b.id,i)]) c++; });
  return Math.round(c/n*100);
}
function menuYuzdeGuncelle(){
  var el=document.getElementById('menuSol'); if(!el) return;
  var toplam=0, okunan=0;
  V.bolumler.forEach(function(b){
    var y=bolumYuzde(b), o=OGR.oku[b.id]||{}, c=0;
    b.kayitlar.forEach(function(r,i){ if(o[ogrK(b.id,i)]) c++; });
    okunan+=c; toplam+=b.kayitlar.length;
    var sp=el.querySelector('.menuSatir[data-i="'+V.bolumler.indexOf(b)+'"] .menuYuzde');
    if(sp){ sp.textContent='%'+y; sp.className='menuYuzde'+(y===100?' tam':''); }
  });
  var gen=toplam?Math.round(okunan/toplam*100):0;
  var d=document.getElementById('ilYuzde'); if(d) d.innerHTML='&#128202; %'+gen;
  var dt=document.getElementById('devamDug');
  if(dt && OGR.son){ var bb=null; V.bolumler.forEach(function(b){ if(b.id===OGR.son.id) bb=b; });
    if(bb) dt.title='Kaldığın yer: '+bb.ad+' (%'+bolumYuzde(bb)+' okundu)'; }
}
function ogrSimgeGuncelle(){
  Array.prototype.forEach.call(document.querySelectorAll('.kart'),function(k){
    var key=k.getAttribute('data-k'), bid=k.getAttribute('data-b');
    var f=k.querySelector('.kA.fav'), o=k.querySelector('.kA.okundu');
    if(f){ f.textContent=OGR.fav[key]?'\u2605':'\u2606'; f.className='kA fav'+(OGR.fav[key]?' aktif':''); }
    var ok=(OGR.oku[bid]||{})[key];
    if(o){ o.textContent=ok?'\u2714':'\u25CB'; o.className='kA okundu'+(ok?' aktif':''); }
    if(ok) k.className='kart okunduKart'; else k.className='kart';
    if(OGR.not[key] && !k.querySelector('.ogrNotVar')){
      var d=document.createElement('div'); d.className='ogrNotVar'; d.textContent='\uD83D\uDCDD '+OGR.not[key];
      var nk=k.querySelector('.ogrNotKap'); k.insertBefore(d, nk||null);
    }
  });
  menuYuzdeGuncelle();
}
function ogrTikla(btn,tur){
  var kart=btn.closest('.kart'); if(!kart) return;
  var key=kart.getAttribute('data-k'), bid=kart.getAttribute('data-b');
  if(tur==='fav'){ if(OGR.fav[key]) delete OGR.fav[key]; else OGR.fav[key]=1; }
  else if(tur==='oku'){
    OGR.oku[bid]=OGR.oku[bid]||{};
    if(OGR.oku[bid][key]) delete OGR.oku[bid][key]; else OGR.oku[bid][key]=1;
  }
  else if(tur==='not'){ notAc(kart,key); return; }
  else if(tur==='dinle'){ kartDinle(btn,kart); return; }
  ogrKaydet(); ogrSimgeGuncelle();
  if(FAV_MOD){ if(!OGR.fav[key]) kartCiz(); }
}
function notAc(kart,key){
  var kap=kart.querySelector('.ogrNotKap');
  if(kap){ kap.parentNode.removeChild(kap); return; }
  var d=document.createElement('div'); d.className='ogrNotKap';
  d.innerHTML='<textarea placeholder="Bu kayıt için notun... (kendine hatırlatma, lab notu, komut varyantı)">'+kac(OGR.not[key]||'')+'</textarea>'+
    '<div class="kapat"><button class="kaydet" onclick="notKaydet(this)">\u2714 KAYDET</button>'+
    '<button onclick="notSil(this)">\u2716 SİL</button><button onclick="notAc(this.closest(\'.kart\'),null)">KAPAT</button></div>';
  kart.appendChild(d);
  var t=d.querySelector('textarea'); t.focus();
}
function notKaydet(btn){
  var kart=btn.closest('.kart'), key=kart.getAttribute('data-k');
  var v=btn.closest('.ogrNotKap').querySelector('textarea').value.trim();
  if(v) OGR.not[key]=v; else delete OGR.not[key];
  ogrKaydet();
  btn.closest('.ogrNotKap').parentNode.removeChild(btn.closest('.ogrNotKap'));
  var eski=kart.querySelector('.ogrNotVar'); if(eski) eski.parentNode.removeChild(eski);
  ogrSimgeGuncelle();
}
function notSil(btn){
  var kart=btn.closest('.kart'), key=kart.getAttribute('data-k');
  delete OGR.not[key]; ogrKaydet();
  btn.closest('.ogrNotKap').parentNode.removeChild(btn.closest('.ogrNotKap'));
  var eski=kart.querySelector('.ogrNotVar'); if(eski) eski.parentNode.removeChild(eski);
  ogrSimgeGuncelle();
}
function kartDinle(btn,kart){
  if(!('speechSynthesis' in window)){ alert('Bu tarayıcı sesli okumayı desteklemiyor.'); return; }
  if(KONUSAN===btn){ window.speechSynthesis.cancel(); btn.textContent='\uD83D\uDD0A'; btn.className='kA'; KONUSAN=null; return; }
  window.speechSynthesis.cancel();
  if(KONUSAN){ KONUSAN.textContent='\uD83D\uDD0A'; KONUSAN.className='kA'; }
  var ad=kart.querySelector('.kartAd'), mt=kart.querySelector('.kartMetin');
  var metin=(ad?ad.textContent:'')+'. '+(mt?mt.textContent:'')+' '+
    Array.prototype.map.call(kart.querySelectorAll('.cevap, .kodmetin'),function(x){ return x.textContent; }).join('. ');
  var u=new SpeechSynthesisUtterance(metin);
  u.lang='tr-TR'; u.rate=0.98; u.pitch=1;
  var sesler=window.speechSynthesis.getVoices()||[];
  for(var i=0;i<sesler.length;i++){ if((sesler[i].lang||'').toLowerCase().indexOf('tr')===0){ u.voice=sesler[i]; break; } }
  u.onend=function(){ btn.textContent='\uD83D\uDD0A'; btn.className='kA'; if(KONUSAN===btn) KONUSAN=null; };
  KONUSAN=btn; btn.textContent='\u23F9'; btn.className='kA konus';
  window.speechSynthesis.speak(u);
}
function favDegistir(){
  FAV_MOD=!FAV_MOD;
  var d=document.getElementById('favDug'); if(d) d.className='studyoDug sinavDug ogrDug'+(FAV_MOD?' secili':'');
  kartCiz();
}
function kaldigimYer(){
  if(!OGR.son){ alert('Henüz bir bölüme girip okumaya başlamadın. Soldan bir bölüm seç.'); return; }
  var idx=-1; V.bolumler.forEach(function(b,i){ if(b.id===OGR.son.id) idx=i; });
  if(idx<0){ alert('Kaldığın bölüm bulunamadı.'); return; }
  bolumAc(idx);
  var o=OGR.oku[OGR.son.id]||{}, hedef=null;
  V.bolumler[idx].kayitlar.forEach(function(r,i){ if(!o[ogrK(OGR.son.id,i)] && hedef===null) hedef=i; });
  setTimeout(function(){
    var kartlar=document.querySelectorAll('#icerik .kart');
    if(hedef!==null && kartlar[hedef]){
      kartlar[hedef].scrollIntoView({behavior:'smooth',block:'center'});
      kartlar[hedef].style.outline='2px solid var(--vurgu)';
      setTimeout(function(){ kartlar[hedef].style.outline=''; },2200);
    }
  },80);
}
function ilerlemeAc(){
  var toplam=0, okunan=0, favS=0, notS=0, h='';
  for(var k in OGR.fav) if(OGR.fav[k]) favS++;
  for(var k2 in OGR.not) notS++;
  var satir=[];
  V.bolumler.forEach(function(b){
    var o=OGR.oku[b.id]||{}, c=0;
    b.kayitlar.forEach(function(r,i){ if(o[ogrK(b.id,i)]) c++; });
    toplam+=b.kayitlar.length; okunan+=c;
    satir.push({ad:b.ad, c:c, n:b.kayitlar.length, y:bolumYuzde(b)});
  });
  var gen=toplam?Math.round(okunan/toplam*100):0;
  var sn=''; try{ var g=JSON.parse(localStorage.getItem('use_sinav')||'[]'); if(g.length) sn='Son sınav: '+g[0].dogru+'/'+g[0].toplam+' (%'+g[0].yuzde+')'; }catch(e){}
  document.getElementById('ogrOzet').innerHTML=
    '<b style="color:var(--ana);font-size:16px">Genel ilerleme: %'+gen+'</b> · '+okunan+' / '+toplam+' kayıt okundu işaretli<br>'+
    '<b>'+favS+'</b> favori · <b>'+notS+'</b> not'+(sn?' · '+sn:'');
  satir.sort(function(a,b){ return b.y-a.y; });
  satir.forEach(function(x){
    h+='<div class="ogrSatir"><span class="ad" style="color:var(--yazi)">'+kac(x.ad)+'</span>'+
       '<span style="color:var(--yazi2);font-size:11.5px">'+x.c+'/'+x.n+'</span>'+
       '<span class="ogrBar"><i style="width:'+x.y+'%"></i></span><span class="pc">%'+x.y+'</span></div>';
  });
  document.getElementById('ogrListe').innerHTML=h;
  document.getElementById('ogrPerde').className='ogrPerde acik';
}
function ilerlemeKapat(){ document.getElementById('ogrPerde').className='ogrPerde'; }
function ogrSifirla(){
  if(!confirm('Tüm favori, okundu ve not işaretlerin silinecek. Emin misin?')) return;
  OGR.fav={}; OGR.oku={}; OGR.not={}; OGR.yanlis={}; OGR.son=null;
  ['use_fav','use_oku','use_notlar','use_yanlis','use_son'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
  ilerlemeKapat(); menuCiz(); kartCiz();
}
function ogrYedekAl(){
  var v={tarih:new Date().toISOString(), favori:OGR.fav, okundu:OGR.oku, notlar:OGR.not, zayif:OGR.yanlis};
  var b=new Blob([JSON.stringify(v,null,1)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download='ustad-siber-ilerleme-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
/* sınav sonucundan zayıf konu kaydı */
function zayifKaydet(r, dogruMu){
  var k=r.ust||'Genel';
  OGR.yanlis[k]=OGR.yanlis[k]||{d:0,y:0};
  if(dogruMu) OGR.yanlis[k].d++; else OGR.yanlis[k].y++;
  ogrKaydet();
}
function zayifKategoriler(){
  var l=[];
  for(var k in OGR.yanlis){ if(OGR.yanlis[k].y>0) l.push({ad:k, y:OGR.yanlis[k].y, d:OGR.yanlis[k].d}); }
  l.sort(function(a,b){ return b.y-a.y; });
  return l;
}
ogrYukle();


/* ================= PWA: TELEFONA KUR + ÇEVRİMDIŞI ================= */
var KUR_OLAY=null, KURULU=false;
function cihazTipi(){
  var u=navigator.userAgent||'';
  if(/iPad|iPhone|iPod/.test(u) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)) return 'ios';
  if(/Android/i.test(u)) return 'android';
  return 'masaustu';
}
function kurPanelCiz(){
  var t=cihazTipi(), icerik='';
  if(t==='ios'){
    icerik='<div class="kurAdim"><span class="no">1</span><div>Safari ile bu sayfayı aç (Chrome değil).</div></div>'+
      '<div class="kurAdim"><span class="no">2</span><div>Alttaki <b>Paylaş</b> simgesine bas (kare içinde yukarı ok).</div></div>'+
      '<div class="kurAdim"><span class="no">3</span><div><b>Ana Ekrana Ekle</b> seçeneğine dokun.</div></div>'+
      '<div class="kurAdim"><span class="no">4</span><div>Sağ üstten <b>Ekle</b> de — simge masaüstünde görünür.</div></div>'+
      '<span class="kurOk">&#9989; Kurulunca internet olmadan da TÜM kayıtlara erişirsin.</span>';
  } else if(t==='android'){
    icerik='<div class="kurAdim"><span class="no">1</span><div>Tarayıcı menüsüne (&#8942;) dokun.</div></div>'+
      '<div class="kurAdim"><span class="no">2</span><div><b>Uygulamayı yükle</b> ya da <b>Ana ekrana ekle</b> seçeneğini seç.</div></div>'+
      '<div class="kurAdim"><span class="no">3</span><div>Onayla — simge ana ekrana gelir, uygulama gibi açılır.</div></div>'+
      '<span class="kurOk">&#9989; Çevrimdışı çalışır: uçak modunda bile tüm dersler elinde.</span>';
  } else {
    icerik='<div class="kurAdim"><span class="no">1</span><div>Adres çubuğunun sağındaki <b>kur simgesine</b> (&#8853;/ekran) bas.</div></div>'+
      '<div class="kurAdim"><span class="no">2</span><div>Ya da menüden <b>Y&#252;kle / Install</b> seçeneğini seç.</div></div>'+
      '<div class="kurAdim"><span class="no">3</span><div>Kurulunca masaüstünde ayrı pencere olarak açılır, çevrimdışı çalışır.</div></div>'+
      '<span class="kurOk">&#9989; Telefonda kurmak i&#231;in siteyi telefonda a&#231;, ayn&#305; ad&#305;mlar ge&#231;erli.</span>';
  }
  document.getElementById('kurIcerik').innerHTML=icerik;
}
function kurAc(){
  if(KURULU){ alert('Bu site zaten kurulu ve çevrimdışı çalışıyor. Ana ekrandaki ÜSTAD SİBER simgesinden açabilirsin.'); return; }
  kurPanelCiz();
  var g=document.getElementById('kurGit');
  if(KUR_OLAY){ g.style.display=''; } else { g.style.display='none'; }
  document.getElementById('kurPerde').className='kurPerde acik';
}
function kurKapat(){ document.getElementById('kurPerde').className='kurPerde'; }
function kurTikla(){ kurAc(); }
function kurBaslat(){
  if(!KUR_OLAY){ kurKapat(); return; }
  KUR_OLAY.prompt();
  KUR_OLAY.userChoice.then(function(c){
    if(c.outcome==='accepted'){ kurulduGoster(); }
    else { alert('Kurulum iptal edildi. İstediğin zaman bu düğmeden tekrar deneyebilirsin.'); }
    KUR_OLAY=null;
  });
}
function kurulduGoster(){
  KURULU=true;
  var d=document.getElementById('kurDug'), y=document.getElementById('kurYazi');
  if(d) d.className='studyoDug kurDug kurulu';
  if(y) y.textContent='KURULDU';
  kurKapat();
}
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); KUR_OLAY=e; });
window.addEventListener('appinstalled', function(){ kurulduGoster(); });
function cevrimGoster(){
  var r=document.getElementById('cevrimRozet');
  if(!r) return;
  if(navigator.onLine) r.className='cevrimdisiRozet'; else r.className='cevrimdisiRozet gorunur';
}
window.addEventListener('online', cevrimGoster);
window.addEventListener('offline', cevrimGoster);

/* Service worker kaydı */
function swKaydet(){
  if(!('serviceWorker' in navigator)) return;
  if(location.protocol==='file:'){ return; }   /* file:// üzerinde SW çalışmaz (sunucu şart) */
  navigator.serviceWorker.register('service-worker.js').then(function(kayit){
    try{
      if(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) kurulduGoster();
    }catch(e){}
  }).catch(function(e){ console.warn('SW kaydı başarısız:', e); });
}
/* Kısayol bağlantıları: ?s=sinav | devam | fav */
function kisayolIsle(){
  var m=/[?&]s=([a-z]+)/i.exec(location.search);
  if(!m) return;
  var t=m[1].toLowerCase();
  setTimeout(function(){
    if(t==='sinav' && typeof sinavAc==='function') sinavAc();
    else if(t==='devam' && typeof kaldigimYer==='function') kaldigimYer();
    else if(t==='fav' && typeof favDegistir==='function'){ if(typeof FAV_MOD!=='undefined' && !FAV_MOD) favDegistir(); }
  }, 500);
}
if(document.readyState!=='loading'){ swKaydet(); kisayolIsle(); cevrimGoster(); }
else document.addEventListener('DOMContentLoaded', function(){ swKaydet(); kisayolIsle(); cevrimGoster(); });



/* ============ BAŞLIKTAKİ GÜZEL SÖZLER (iki dünyanın ortasında) ============ */
var DG_SOZLER = [
  /* --- üstadın sözleri --- */
  ['Bilgi, paylaşıldıkça çoğalır.', 'ÜSTAD KENAN KUZUCU'],
  ['Kilit açılmadan önce, neden kilitlendiğini bil.', 'ÜSTAD KENAN KUZUCU'],
  ['Şifren güçlüyse kapın kilitlidir.', 'ÜSTAD KENAN KUZUCU'],
  ['Yedek almayan, bir gün her şeyini kaybeder.', 'ÜSTAD KENAN KUZUCU'],
  ['Merak iyidir; izinsiz merak suçtur.', 'ÜSTAD KENAN KUZUCU'],
  ['Öğrenmek bitmez; her gün bir komut, her gün bir ders.', 'ÜSTAD KENAN KUZUCU'],
  /* --- Yunus Emre --- */
  ['İlim ilim bilmektir, ilim kendini bilmektir.', 'YUNUS EMRE'],
  ['Bir kez gönül yıktın ise, bu kıldığın namaz değil.', 'YUNUS EMRE'],
  ['Sevelim, sevilelim; bu dünya kimseye kalmaz.', 'YUNUS EMRE'],
  ['Her dem yeni doğarız, bizden kim usanası.', 'YUNUS EMRE'],
  /* --- Mevlana --- */
  ['Dün ile beraber gitti cancağızım; şimdi yeni şeyler söylemek lazım.', 'MEVLANA'],
  ['Sabır, acıdır ama meyvesi tatlıdır.', 'MEVLANA'],
  ['Karanlığa söveceğine bir mum yak.', 'MEVLANA'],
  /* --- atasözleri --- */
  ['Ağaç yaşken eğilir.', 'ATASÖZÜ'],
  ['Akıl yaşta değil baştadır.', 'ATASÖZÜ'],
  ['İşleyen demir ışıldar.', 'ATASÖZÜ'],
  ['Ölç, iki kere biç.', 'ATASÖZÜ'],
  ['Damlaya damlaya göl olur.', 'ATASÖZÜ'],
  ['Sakla samanı, gelir zamanı.', 'ATASÖZÜ'],
  ['Acele işe şeytan karışır.', 'ATASÖZÜ'],
  ['Dost kara günde belli olur.', 'ATASÖZÜ'],
  ['Görünen köy kılavuz istemez.', 'ATASÖZÜ'],
  ['Yuvarlanan taş yosun tutmaz.', 'ATASÖZÜ'],
  ['Zararın neresinden dönülse kârdır.', 'ATASÖZÜ'],
  ['Bir musibet bin nasihatten iyidir.', 'ATASÖZÜ'],
  ['Bilmemek ayıp değil, öğrenmemek ayıp.', 'ATASÖZÜ'],
  ['Ayağını yorganına göre uzat.', 'ATASÖZÜ'],
  ['Su testisi su yolunda kırılır.', 'ATASÖZÜ'],
  ['Yalancının mumu yatsıya kadar yanar.', 'ATASÖZÜ'],
  ['Sabreden derviş muradına ermiş.', 'ATASÖZÜ'],
  ['Terzi kendi söküğünü dikemez.', 'ATASÖZÜ'],
  ['Deveyi yardan uçuran bir tutam ottur.', 'ATASÖZÜ'],
  ['Hazıra dağlar dayanmaz.', 'ATASÖZÜ'],
  ['Bir elin nesi var, iki elin sesi var.', 'ATASÖZÜ'],
  ['Bugünün işini yarına bırakma.', 'ATASÖZÜ'],
  ['Keskin sirke küpüne zarar.', 'ATASÖZÜ'],
  ['Vakit nakittir.', 'ATASÖZÜ'],
  /* --- özdeyişler --- */
  ['Bilgi güçtür.', 'FRANCIS BACON'],
  ['Savaşta ve barışta en güçlü kalkan hazırlıklı olmaktır.', 'ÖZDEYİŞ'],
  ['Güvenlik, önce kendini tanımakla başlar.', 'SİBER AKADEMİ'],
  ['Sistemi bilmeyen onu koruyamaz.', 'SİBER AKADEMİ'],
  ['Log tutmayan, olayı hiç göremez.', 'SİBER AKADEMİ'],
  ['Kolay parola, kolay kapı.', 'SİBER AKADEMİ'],
  ['Güncelleme yapmayan sistem, açık kapı bırakır.', 'SİBER AKADEMİ'],
  ['İzinsiz test suçtur; izinli test bilimdir.', 'SİBER AKADEMİ'],
  ['Bilgiyi saklayan değil, öğreten kazanır.', 'SİBER AKADEMİ'],
  ['Öğrenmenin yaşı yok, ekranın ışığı yeter.', 'SİBER AKADEMİ']
];
var dgSira = 0;
function dgSozCevir(){
  var b = document.getElementById('dgSozMetin'), k = document.getElementById('dgSozKim');
  if(!b) return;
  b.parentNode.className = 'dgSoz sol';
  setTimeout(function(){
    dgSira = (dgSira + 1) % DG_SOZLER.length;
    b.textContent = DG_SOZLER[dgSira][0];
    k.textContent = DG_SOZLER[dgSira][1];
    b.parentNode.className = 'dgSoz';
  }, 600);
}
setInterval(dgSozCevir, 9000);

/* ================= DÜNYA PLAKASI (marka + dönen slogan + canlı sayaç) ================= */
var DP_SLOGAN = [
  'BİLGİ EN GÜÇLÜ KALKANDIR',
  'ÖNCE ANLA · SONRA SAVUN',
  'KENDİ SİSTEMİNİ TANIRSAN SAVUNURSUN',
  'HER HATA BİR DERSTİR · KAYDA GEÇ',
  'SIFIR GÜVEN · DERİN SAVUNMA',
  'ÖĞREN · UYGULA · KORU · ÖĞRET',
  'LABORATUVARSIZ GÜVENLİK OLMAZ',
  'PAROLA UZUN OLURSA KAPI SAĞLAM OLUR',
  'YEDEĞİ OLMAYANIN GELECEĞİ OLMAZ',
  'GÜNCELLEMEYEN SİSTEM AÇIK KAPI BIRAKIR',
  'LOG OKUMAYAN KÖR UÇAR',
  'İZİNSİZ TEST SUÇTUR · İZİNLİ TEST BİLİMDİR',
  'BİLMEK YETMEZ · LOGLA VE KANITLA',
  'SALDIRI GELMEDEN SAVUNMAYI KUR',
  'ÖĞRENMEYİ BIRAKAN, GERİDE KALIR'
];
var dpSira = 0;
function dpSayacYaz(){
  var el = document.getElementById('dpSayac');
  if(!el || typeof V === 'undefined' || !V) return;
  var soru = 0;
  if(typeof snSorular === 'function'){ soru = snSorular().length; }
  else { V.bolumler.forEach(function(b){ if(b.id === 'test') soru = b.kayitlar.length; }); }
  el.textContent = V.bolumler.length + ' bölüm · ' + V.toplam.toLocaleString('tr-TR') + ' kayıt · ' + soru + ' soru';
}
function dpSaatYaz(){
  var el = document.getElementById('dpSaat');
  if(!el) return;
  var d = new Date();
  el.textContent = ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
}
function dpSloganCevir(){
  var el = document.getElementById('dpSlogan');
  if(!el) return;
  el.className = 'dpSlogan sol';
  setTimeout(function(){
    dpSira = (dpSira + 1) % DP_SLOGAN.length;
    el.textContent = DP_SLOGAN[dpSira];
    el.className = 'dpSlogan';
  }, 520);
}
function dunyaPlakaGuncelle(){
  var pl = document.getElementById('dunyaPlaka');
  if(!pl) return;
  var acik = false;
  try{
    acik = (typeof S3 !== 'undefined') && S3.hazir() && S3.acikMi() && S3.aktif() === 'canlidunya';
  }catch(e){ acik = false; }
  pl.className = 'dunyaPlaka' + (acik ? ' acik' : '');
  if(acik){ dpSayacYaz(); dpSaatYaz(); }
}
dpSayacYaz(); dpSaatYaz();
setInterval(dpSaatYaz, 20000);
setInterval(dpSloganCevir, 6200);
setInterval(dunyaPlakaGuncelle, 1500);
if(document.readyState !== 'loading') dunyaPlakaGuncelle();
else document.addEventListener('DOMContentLoaded', dunyaPlakaGuncelle);

/* ================= BAŞLAT ================= */
if(!V){ document.getElementById('icerik').innerHTML='<div class="bos">egitim-veri.js bulunamadı</div>'; }
else { menuCiz(); bolumAc(0); }
temaCiz();
if(typeof THREE!=='undefined' && typeof S3!=='undefined' && S3.baslat('bg', anaRenk(), vurguRenk())){
  var kayit = {};
  try{
    kayit.sahne   = localStorage.getItem('use_sahne');
    kayit.sablon  = parseInt(localStorage.getItem('use_sablon'), 10);
    kayit.oto     = localStorage.getItem('use_sahne_oto');
    kayit.soluk   = localStorage.getItem('use_sahne_soluk');
    kayit.isima   = parseFloat(localStorage.getItem('use_isima'));
    kayit.tema    = localStorage.getItem('use_tema');
    kayit.uc3d    = localStorage.getItem('use_3d');
    var a = JSON.parse(localStorage.getItem('use_ayar') || 'null');
    if(a){ if(a.hiz) AYAR.hiz=a.hiz; if(a.yogunluk) AYAR.yogunluk=a.yogunluk;
           if(a.sallanma!=null) AYAR.sallanma=a.sallanma; if(a.otoSn) AYAR.otoSn=a.otoSn; }
  }catch(e){}
  if(kayit.tema){ document.body.setAttribute('data-tema', kayit.tema); temaCiz(); }
  var varMi=false;
  S3.LISTE.forEach(function(x){ if(x.k===kayit.sahne) varMi=true; });
  S3.ayar({hiz:AYAR.hiz, yogunluk:AYAR.yogunluk, sallanma:AYAR.sallanma, otoSn:AYAR.otoSn});
  S3.sec(varMi ? kayit.sahne : 'canlidunya');   /* varsayılan: dönen canlı dünya */
  if(kayit.sablon>=0 && S3.SABLONLAR[kayit.sablon]) SUANKI_SABLON = kayit.sablon;
  if(kayit.isima && kayit.isima!==1){ ISIMA=kayit.isima; isimaAyarla(ISIMA); }
  solukAyarla(kayit.soluk==='1');
  if(localStorage.getItem('use_3d')==='0'){ S3.acKapa(false); uc3dEtiket(false);
    document.querySelector('.sahneBar').style.opacity='0.75'; }
  else uc3dEtiket(true);
  if(kayit.oto==='1'){
    S3.otoAc(true, AYAR.otoSn);
    var ob=document.getElementById('otoDug');
    ob.className='otoDug aktif'; ob.innerHTML='\u21BB OTOMAT\u0130K A\u00C7IK';
  }
  studyoCiz();
} else {
  document.getElementById('bg').style.display='none';
  var sb=document.querySelector('.sahneBar'); if(sb) sb.style.display='none';
}

/* ================= SINAV MODU + SERTİFİKA ================= */
var SINAV = { acik:false, sorular:[], i:0, cevap:[], kategori:'', sure:0, kalan:0, zaman:null, baslangic:0 };
function snSorular(){
  /* Sorular TÜM bölümlerden toplanır (yeni içerik paketleri kendi bölümünde soru taşır) */
  var liste=[];
  V.bolumler.forEach(function(b){
    b.kayitlar.forEach(function(r){
      if(r.tip==='soru' && r.secenekler && r.secenekler.length>=2){
        if(!r.ust) r.ust = b.ad;
        liste.push(r);
      }
    });
  });
  return liste;
}
function snKategoriDoldur(){
  var qs=snSorular(), say={};
  qs.forEach(function(r){ var k=r.ust||'Genel'; say[k]=(say[k]||0)+1; });
  var liste=Object.keys(say).sort(function(a,b){ return say[b]-say[a]; });
  var zk=zayifKategoriler();
  var el=document.getElementById('snKategori'), h='<option value="">TÜMÜ ('+qs.length+' soru)</option>';
  if(zk.length) h+='<option value="__ZAYIF__">&#127919; ZAYIF KONULARIM ('+zk.length+' konu · '+zk[0].ad+' '+zk[0].y+' yanlış)</option>';
  liste.forEach(function(k){ h+='<option value="'+k+'">'+k+' ('+say[k]+' soru)</option>'; });
  el.innerHTML=h;
  var sb=document.querySelector('.sinavUst .alt');
  if(sb) sb.textContent=qs.length+' soru · '+liste.length+' kategori · 5 seviye · süreli sınav · başarı sertifikası';
  var adlar={acemi:'Acemi — yeni başlayan', orta:'Orta — temel bilen', ileri:'İleri — uygulama yapan',
             uzman:'Uzman — derinleşen', master:'Master — tasarım ve yönetim'};
  var lv={}; qs.forEach(function(r){ var x=r.seviye||'orta'; lv[x]=(lv[x]||0)+1; });
  var he='';
  ['acemi','orta','ileri','uzman','master'].forEach(function(x){
    if(lv[x]) he+='<option value="'+x+'">'+adlar[x]+' ('+lv[x]+' soru)</option>';
  });
  he+='<option value="">KARIŞIK — tüm seviyeler ('+qs.length+' soru)</option>';
  var sel=document.getElementById('snSeviye');
  if(sel){ sel.innerHTML=he; sel.value='acemi'; }
  snSeviyeNot();
}
function snSeviyeNot(){
  var v=document.getElementById('snSeviye').value;
  var n={acemi:'Uzmanlık sorusu gelmez: yalnız temel kavramlar, komut mantığı ve güvenli kullanım sorulur.',
         orta:'Temel bilgiye ağ, web ve güvenlik soruları eklenir.',
         ileri:'Uygulama soruları: araçlar, sızma testi adımları, şifre kırma, kablosuz.',
         uzman:'Derin konular: olay müdahale, adli bilişim, API/oturum, raporlama.',
         master:'Mimari ve yönetim soruları: tasarım, program kurma, risk ve uyum kararları.',
         '':'Karışık: acemiden mastera tüm seviyeler karışık gelir. Yeni başlayan için önerilmez.'}[v]||'';
  var el=document.getElementById('snSeviyeNot');
  if(el) el.textContent=n;
}
function snGecmisCiz(){
  var g=[]; try{ g=JSON.parse(localStorage.getItem('use_sinav')||'[]'); }catch(e){}
  var el=document.getElementById('snGecmis');
  if(!g.length){ el.innerHTML='<b>Henüz sınav geçmişin yok.</b> İlk sınavını bitirince burada puanların birikir.'; return; }
  var h='<b>Son sonuçlarım:</b>';
  g.slice(0,6).forEach(function(x){
    h+='<div class="gSatir"><span>'+(x.ad?kac(x.ad)+' · ':'')+x.tarih+'</span><span>'+x.kategori+'</span><span>'+x.dogru+'/'+x.toplam+
       ' · %'+x.yuzde+'</span><span>'+(x.yuzde>=70?'✔ BAŞARILI':'katılım')+'</span></div>';
  });
  var isim=''; try{ isim=localStorage.getItem('use_sinav_isim')||''; }catch(e){}
  if(isim) h+='<div class="gSatir">Sertifika adı: <b>'+kac(isim)+'</b></div>';
  el.innerHTML=h;
}
function sinavAc(){
  if(!V) return;
  snKategoriDoldur(); snGecmisCiz(); snAdYaz(); karneCiz();
  var kk=document.getElementById('snKisi');
  if(kk){ var kayitli=''; try{ kayitli=localStorage.getItem('use_sinav_isim')||''; }catch(e){}
    kk.textContent = kayitli ? ('Sertifikada: '+kayitli) : ''; }
  document.getElementById('snBaslangic').style.display='';
  document.getElementById('snSinav').style.display='none';
  document.getElementById('snSonuc').style.display='none';
  document.getElementById('sertifika').className='';
  document.getElementById('sinavPerde').className='sinavPerde acik';
  SINAV.acik=true;
}
function sinavKapat(){
  document.getElementById('sinavPerde').className='sinavPerde';
  SINAV.acik=false;
  if(SINAV.zaman){ clearInterval(SINAV.zaman); SINAV.zaman=null; }
}
function snSureYaz(){
  var m=Math.floor(SINAV.kalan/60), sn=SINAV.kalan%60;
  var el=document.getElementById('snSayac');
  el.textContent=(m<10?'0':'')+m+':'+(sn<10?'0':'')+sn;
  el.className='snSayac'+((SINAV.kalan<=60)?' az':'');
}
function snAdYaz(){
  var el=document.getElementById('snAd'); if(!el) return;
  var v=''; try{ v=localStorage.getItem('use_sinav_isim')||''; }catch(e){}
  if(v && !el.value) el.value=v;
}
function snAdKaydet(v){
  try{ localStorage.setItem('use_sinav_isim', (v||'').trim()); }catch(e){}
  var k=document.getElementById('snKisi');
  if(k) k.textContent = (v||'').trim() ? ('Sertifikada: '+(v||'').trim()) : '';
}
function snAdKontrol(){
  var el=document.getElementById('snAd'); if(!el) return true;
  var v=(el.value||'').trim();
  if(v.length<3){
    el.style.borderColor='#ff6b6b'; el.focus();
    var u=document.getElementById('snUyari');
    if(u) u.textContent='Sertifikaya yazılacak adı gir (en az 3 harf).';
    el.addEventListener('input', function(){ el.style.borderColor=''; }, {once:true});
    return false;
  }
  snAdKaydet(v);
  return true;
}
function sinavBasla(){
  if(!snAdKontrol()) return;
  var tum=snSorular();
  if(ZORLA_TEK){
    document.getElementById('snKategori').value='';
    document.getElementById('snSeviye').value='';
    document.getElementById('snSayi').value='10';
    document.getElementById('snSure').value='0';
  }
  var kat=document.getElementById('snKategori').value;
  var zayifMod=(kat==='__ZAYIF__');
  if(zayifMod){
    var zl=zayifKategoriler(), set={};
    zl.forEach(function(x){ set[x.ad]=1; });
    tum=tum.filter(function(r){ return set[r.ust||'Genel']; });
    if(!tum.length){ alert('Önce bir sınav bitir; yanlış yaptığın konular burada birikir.'); return; }
  } else if(kat) tum=tum.filter(function(r){ return (r.ust||'Genel')===kat; });
  var lev=document.getElementById('snSeviye').value;
  if(lev) tum=tum.filter(function(r){ return (r.seviye||'orta')===lev; });
  if(ZORLA_TEK) tum=[ZORLA_TEK];
  if(!tum.length){ alert('Bu kategoride soru yok.'); return; }
  var adet=parseInt(document.getElementById('snSayi').value,10);
  if(!adet || isNaN(adet) || adet<1) adet=10;              /* bozuk/eksik seçimde varsayılan 10 */
  if(adet>tum.length) adet=tum.length;
  var karma=tum.slice();
  for(var i=karma.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=karma[i]; karma[i]=karma[j]; karma[j]=t; }
  SINAV.sorular=karma.slice(0,Math.min(adet,tum.length));
  if(!SINAV.sorular.length){
    alert('Bu seçimde soru bulunamadı. Kategori veya seviye seçimini genişlet (ör. seviye: KARIŞIK).');
    document.getElementById('snBaslangic').style.display=''; document.getElementById('snSinav').style.display='none';
    return;
  }
  SINAV.i=0; SINAV.cevap=[]; SINAV.kategori=(ZORLA_TEK?'GÜNÜN SORUSU':((kat==='__ZAYIF__')?('ZAYIF KONULARIM: '+zayifKategoriler().map(function(x){return x.ad;}).join(', ')):(kat||'TÜMÜ')));
  SINAV.seviye=ZORLA_TEK?((ZORLA_TEK.seviye||'orta').toUpperCase()):(lev||'KARIŞIK');
  ZORLA_TEK=null;
  SINAV.baslangic=Date.now();
  var dk=parseInt(document.getElementById('snSure').value,10);
  SINAV.sure=dk*60; SINAV.kalan=SINAV.sure;
  document.getElementById('snBaslangic').style.display='none';
  document.getElementById('snSonuc').style.display='none';
  document.getElementById('sertifika').className='';
  document.getElementById('snSinav').style.display='';
  if(SINAV.zaman){ clearInterval(SINAV.zaman); SINAV.zaman=null; }
  if(dk>0){
    document.getElementById('snSayac').style.display='';
    snSureYaz();
    SINAV.zaman=setInterval(function(){
      SINAV.kalan--; snSureYaz();
      if(SINAV.kalan<=0){ clearInterval(SINAV.zaman); SINAV.zaman=null; sinavBitir(false); }
    },1000);
  } else { document.getElementById('snSayac').textContent='∞'; document.getElementById('snSayac').className='snSayac'; }
  snSoruCiz();
}
function snSoruCiz(){
  var r=SINAV.sorular[SINAV.i];
  var n=SINAV.sorular.length;
  document.getElementById('snSira').textContent=(SINAV.i+1)+' / '+n;
  document.getElementById('snBar').style.width=((SINAV.i)/n*100)+'%';
  var sv=r.seviye||'orta';
  var h='<div class="kategori">'+kac(r.ust||'Genel')+'<span class="snLev '+sv+'">'+kac(sv)+'</span></div>'
       +'<div class="metin">'+kac(r.ad)+'</div>';
  (r.secenekler||[]).forEach(function(s,k){
    h+='<button class="snSecenek" data-k="'+k+'" onclick="snSec(this)"><span class="harf">'+String.fromCharCode(65+k)+')</span>'+kac(s)+'</button>';
  });
  document.getElementById('snSoru').innerHTML=h;
  var onceki=SINAV.cevap[SINAV.i];
  if(onceki!=null){
    var b=document.querySelector('.snSecenek[data-k="'+onceki+'"]'); if(b) b.className='snSecenek secili';
  }
  document.getElementById('snIleri').textContent=(SINAV.i===n-1)?'SINAVI BİTİR ✔':'SONRAKİ SORU ▶';
  document.getElementById('snUyari').textContent=(onceki==null)?'Bir seçenek işaretle.':'';
}
function snSec(btn){
  var k=parseInt(btn.getAttribute('data-k'),10);
  SINAV.cevap[SINAV.i]=k;
  Array.prototype.forEach.call(document.querySelectorAll('#snSoru .snSecenek'),function(b){ b.className='snSecenek'; });
  btn.className='snSecenek secili';
  document.getElementById('snUyari').textContent='';
}
function sinavIleri(){
  if(SINAV.cevap[SINAV.i]==null){ document.getElementById('snUyari').textContent='⚠ Önce bir seçenek işaretle.'; return; }
  if(SINAV.i===SINAV.sorular.length-1){ sinavBitir(false); return; }
  SINAV.i++; snSoruCiz();
}
function sinavBitir(elle){
  if(SINAV.zaman){ clearInterval(SINAV.zaman); SINAV.zaman=null; }
  var n=SINAV.sorular.length, dogru=0, yanlislar=[];
  for(var i=0;i<n;i++){
    var r=SINAV.sorular[i], c=SINAV.cevap[i];
    var dMi=(c!=null && c===r.dogru);
    if(dMi) dogru++; else yanlislar.push({r:r, c:c});
    zayifKaydet(r, dMi);
  }
  var yuzde=Math.round(dogru/n*100);
  var gecen=Math.round((Date.now()-SINAV.baslangic)/1000);
  document.getElementById('snSinav').style.display='none';
  document.getElementById('snSonuc').style.display='';
  var pe=document.getElementById('snPuan');
  pe.textContent='%'+yuzde; pe.className='snPuan'+(yuzde<70?' kotu':'');
  document.getElementById('snOzet').innerHTML=
    '<b>'+dogru+' doğru</b> · '+(n-dogru)+' yanlış/boş · '+n+' soru · '+SINAV.kategori+
    ' · seviye: <b>'+SINAV.seviye.toUpperCase()+'</b>'+
    ' · süre: '+Math.floor(gecen/60)+' dk '+(gecen%60)+' sn'+
    (elle?' · <i>(elle bitirildi)</i>':'')+
    '<br>'+(yuzde>=70?'✔ BAŞARILI — sertifikanı yazdırabilirsin.':'Katılım belgesi hazırlandı; 70 ve üzeri başarı sayılır.')+
    (function(){ var z=zayifKategoriler(); if(!z.length) return '';
       return '<div style="margin-top:10px;padding:9px 11px;border-radius:9px;background:rgba(255,143,0,.12);border-left:3px solid #ff8f00">'+
         '&#127919; <b>Zayıf konuların güncellendi.</b> En çok yanlışın: '+z.slice(0,4).map(function(x){ return kac(x.ad)+' ('+x.y+')'; }).join(' · ')+
         '<br><span style="color:var(--yazi2)">Sınav panelindeki <b>ZAYIF KONULARIM</b> seçeneğiyle bunları tekrar çözebilirsin.</span></div>'; })();
  var h='';
  yanlislar.slice(0,40).forEach(function(x){
    h+='<div class="snYanlis"><b>'+kac(x.r.ad)+'</b><br>';
    if(x.c!=null) h+='Senin cevabın: <span style="color:#ffb3ba">'+kac((x.r.secenekler||[])[x.c]||'-')+'</span><br>';
    else h+='<span style="color:#ffb3ba">Boş bıraktın</span><br>';
    h+='Doğru cevap: <span class="d">'+kac((x.r.secenekler||[])[x.r.dogru]||'-')+'</span>';
    if(x.r.metin) h+='<br><span style="color:var(--yazi2)">'+kac(x.r.metin)+'</span>';
    h+='</div>';
  });
  if(yanlislar.length>40) h+='<div class="snYanlis">…ve '+(yanlislar.length-40)+' yanlış daha.</div>';
  if(!yanlislar.length) h='<div class="snYanlis" style="background:rgba(0,224,90,.12);border-color:rgba(0,224,90,.4)">🎉 Hiç yanlış yok — tam puan!</div>';
  document.getElementById('snYanlislar').innerHTML=h;
  /* geçmişe kaydet */
  var tarih=new Date(), dstr=tarih.toLocaleDateString('tr-TR')+' '+tarih.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
  var g=[]; try{ g=JSON.parse(localStorage.getItem('use_sinav')||'[]'); }catch(e){}
  g.unshift({tarih:dstr, kategori:SINAV.kategori, dogru:dogru, toplam:n, yuzde:yuzde, sn:gecen});
  g=g.slice(0,10);
  try{ localStorage.setItem('use_sinav', JSON.stringify(g)); }catch(e){}
  sertifikaCiz(dogru,n,yuzde,gecen,yuzde>=70);
}
function sertifikaCiz(dogru,n,yuzde,gecen,basarili){
  var isim=''; try{ isim=(localStorage.getItem('use_sinav_isim')||'').trim(); }catch(e){}
  if(!isim) isim='ADI SOYADI';
  var g=[]; try{ g=JSON.parse(localStorage.getItem('use_sinav')||'[]'); }catch(e){}
  var no='UG-'+new Date().getFullYear()+'-'+String((g.length||1)).padStart(3,'0')+'-'+Math.floor(Math.random()*900+100);
  var bugun=new Date().toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'});
  var h='';
  h+='<span class="ustyazi">ÜSTAD KENAN KUZUCU · SİBER GÜVENLİK EĞİTİM AKADEMİSİ</span>';
  h+='<h1>'+(basarili?'BAŞARI SERTİFİKASI':'KATILIM BELGESİ')+'</h1>';
  h+='<span class="alt">Siber Güvenlik Bilgi Sınavı</span>';
  h+='<img class="madalyonS" src="foto/rozet.png" alt="rozet">';
  h+='<div><input id="sertIsim" class="isim" style="background:transparent;border:none;border-bottom:2px dotted var(--cizgi);color:#fff;text-align:center;font-family:Georgia,serif;font-size:31px;width:80%" value="'+kac(isim)+'" oninput="sertIsimKaydet(this.value)"></div>';
  h+='<div class="metinS">Yukarıda adı yazılı kişi, <b>'+n+' soruluk</b> '+kac(SINAV.kategori)+' kategorisindeki ve <b>'+kac(String(SINAV.seviye||'-').toUpperCase())+
     '</b> seviyesindeki siber güvenlik bilgi sınavını '+
     '<b>%'+yuzde+'</b> başarı oranıyla ('+dogru+' doğru) '+(basarili?'başarıyla tamamlamıştır.':'tamamlamıştır.')+'</div>';
  h+='<div class="degerler">'+
     '<div class="deger"><b>%'+yuzde+'</b><span>Puan</span></div>'+
     '<div class="deger"><b>'+dogru+'/'+n+'</b><span>Doğru</span></div>'+
     '<div class="deger"><b>'+Math.floor(gecen/60)+' dk</b><span>Süre</span></div>'+
     '<div class="deger"><b>'+kac(SINAV.kategori)+'</b><span>Kategori</span></div>'+
     '<div class="deger"><b>'+kac(String(SINAV.seviye||'-').toUpperCase())+'</b><span>Seviye</span></div></div>';
  h+='<div class="imzaAlani"><div class="imza">'+bugun+' · Düzenleme tarihi</div>'+
     '<div class="muhur">ÜSTAD<br>SİBER<br>AKADEMİ</div>'+
     '<div class="imza">ÜSTAD KENAN KUZUCU<br>Eğitim Sorumlusu</div></div>';
  h+='<div class="no">Sertifika No: '+no+' · Bu belge eğitim amaçlıdır, resmî yetki belgesi değildir.</div>';
  var el=document.getElementById('sertifika');
  el.innerHTML=h; el.className='goster';
}
function sertIsimKaydet(v){
  try{ localStorage.setItem('use_sinav_isim', v); }catch(e){}
}
function sertifikaYazdir(){ window.print(); }
document.addEventListener('keydown', function(e){
  if(e.key==='Escape' && SINAV.acik) sinavKapat();
});





/* ================= "BU KONUYU BASİTLEŞTİR" (istem kopyalar — sitede API anahtarı YOK) ================= */
function bildir(metin, iyi){
  var t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent=metin;
  t.className='toast goster'+(iyi?' iyi':'');
  clearTimeout(window._toastZ);
  window._toastZ=setTimeout(function(){ t.className='toast'; }, 3200);
}
function basitlestir(btn){
  var kart=btn.closest('.kart'); if(!kart) return;
  var ad=(kart.querySelector('.kartAd')||{}).textContent||'';
  var metin=(kart.querySelector('.kartMetin')||{}).textContent||'';
  var ornek=(kart.querySelector('.kodmetin')||{}).textContent||'';
  var tip=(kart.querySelector('.etiketRozet')||{}).textContent||'';
  var istem = 'Şu siber güvenlik konusunu, hiç teknik bilgisi olmayan bir esnafa anlatır gibi SADE Türkçe ile anlat.\n' +
    'Konu: ' + ad + (tip ? ' (' + tip + ')' : '') + '\n' +
    (ornek ? 'İlgili komut/örnek: ' + ornek + '\n' : '') +
    'Açıklama: ' + metin.slice(0, 600) + '\n\n' +
    'İstediklerim:\n' +
    '1) İlk 3 cümlede ne olduğunu günlük hayattan bir benzetmeyle anlat.\n' +
    '2) Teknik terimleri parantez içinde Türkçe karşılığıyla yaz.\n' +
    '3) "Neden önemli, kötü niyetli biri bunu nasıl kullanır (sadece mantık, uygulama değil)" diye anlat.\n' +
    '4) "Ben ne yapmalıyım" başlığıyla 5 maddelik savunma listesi ver.\n' +
    '5) En fazla 250 kelime olsun, madde işaretleri kullan.';
  function bitti(){ bildir('İstem kopyalandı ✓  ChatGPT / Gemini sohbetine yapıştır ve Enter\'a bas.', true); }
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(istem).then(bitti, function(){ kopyalaEski(istem); bitti(); }); return; }
  }catch(e){}
  kopyalaEski(istem); bitti();
}

/* ================= KARNEM: KONU BAZLI GRAFİK ================= */
function karneVerisi(){
  var satir=[];
  for(var k in OGR.yanlis){
    var x=OGR.yanlis[k];
    var d=x.d||0, y=x.y||0, t=d+y;
    if(t>0) satir.push({ad:k, d:d, y:y, t:t, yuzde:Math.round(d*100/t)});
  }
  satir.sort(function(a,b){ return b.t-a.t; });
  return satir;
}
function karneCiz(){
  var el=document.getElementById('karne'); if(!el) return;
  var satir=karneVerisi();
  var sinav=[]; try{ sinav=JSON.parse(localStorage.getItem('use_sinav')||'[]'); }catch(e){}
  var toplamS=0, toplamD=0;
  satir.forEach(function(x){ toplamS+=x.t; toplamD+=x.d; });
  var genel=toplamS?Math.round(toplamD*100/toplamS):0;
  var enIyi=0; sinav.forEach(function(x){ if((x.yuzde||0)>enIyi) enIyi=x.yuzde||0; });
  var h='<div class="karneBaslik">&#128202; KARNEM — KONU BAZLI DURUM</div>';
  h+='<div class="karneOzet">'+
     '<span class="kOzet"><b>'+sinav.length+'</b> sınav</span>'+
     '<span class="kOzet"><b>'+toplamS+'</b> cevap</span>'+
     '<span class="kOzet"><b>%'+genel+'</b> doğruluk</span>'+
     '<span class="kOzet"><b>%'+enIyi+'</b> en iyi puan</span>'+
     (satir.length?'<span class="kOzet uyari"><b>'+satir.length+'</b> zayıf konu</span>':'<span class="kOzet iyi">Zayıf konu yok</span>')+
     '</div>';
  if(!satir.length){
    h+='<div class="karneBos">Henüz ölçülecek veri yok. Sınav ol → yanlışların burada konu konu grafik olur.</div>';
  } else {
    h+='<div class="karneSatirlar">';
    satir.slice(0,12).forEach(function(x){
      var renk = x.yuzde>=70 ? '#00e05a' : (x.yuzde>=40 ? '#ffc46b' : '#ff6b6b');
      h+='<div class="kSatir"><span class="kAd">'+kac(x.ad)+'</span>'+
         '<span class="kCubuk"><i style="width:'+x.yuzde+'%;background:'+renk+';box-shadow:0 0 10px '+renk+'"></i></span>'+
         '<span class="kYuzde" style="color:'+renk+'">%'+x.yuzde+'</span>'+
         '<span class="kDetay">'+x.d+'D / '+x.y+'Y</span></div>';
    });
    h+='</div>';
    h+='<div class="karneNot">Yeşil %70+, sarı %40-69, kırmızı %40 altı. Kırmızı konuları <b>ZAYIF KONULARIM</b> seçeneğiyle tekrar çöz.</div>';
  }
  el.innerHTML=h;
}

/* ================= GÜNÜN SORUSU ================= */
var ZORLA_TEK = null;
function gununSoruListesi(){
  var l = snSorular();
  return l.filter(function(r){ return r.ad && r.secenekler && r.secenekler.length>=2; });
}
function gununSoru(){
  var l = gununSoruListesi(); if(!l.length) return null;
  var d = new Date();
  var gunNo = Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
  return l[(gunNo * 13) % l.length];
}
function gununSoruYaz(){
  var kod = document.getElementById('mkSoru'); if(!kod) return;
  var s = gununSoru(); if(!s){ kod.textContent = '--'; return; }
  var sev = (s.seviye||'orta').toUpperCase();
  var etiket = {'ACEMİ':'🟢','ORTA':'🔵','İLERİ':'🟡','UZMAN':'🟠','MASTER':'🟣'}[sev] || '🔵';
  kod.textContent = etiket + ' ' + (s.ad||'').slice(0,24);
  var kart = document.getElementById('gunSoruKart');
  if(kart) kart.title = 'Günün sorusu (' + sev + ' · ' + (s.ust||'Genel') + ') — tıkla, tek soruluk sınav açılır';
}
function gununSoruBasla(){
  var s = gununSoru(); if(!s) return;
  ZORLA_TEK = s;
  if(typeof sinavAc==='function') sinavAc();
  setTimeout(function(){ sinavBasla(); }, 120);
}

/* ================= ÇALIŞMA KRONOMETRESİ ================= */
var KRONO_ZAMAN = null;
function kronoOku(){
  var bugun = new Date();
  var a = bugun.getFullYear()+'-'+('0'+(bugun.getMonth()+1)).slice(-2)+'-'+('0'+bugun.getDate()).slice(-2);
  var k = null; try{ k = JSON.parse(localStorage.getItem('use_krono')||'null'); }catch(e){ k=null; }
  if(!k || k.gun !== a) k = { gun:a, saniye:0, calisiyor:false };
  return k;
}
function kronoYaz(){
  var k = kronoOku();
  var b = document.getElementById('mkKrono'), kart = document.getElementById('kronoKart');
  if(!b) return;
  var s = k.saniye;
  var yazi = (s<3600) ? (Math.floor(s/60)+' dk ' + ('0'+(s%60)).slice(-2)) : (Math.floor(s/3600)+' sa '+Math.floor((s%3600)/60)+' dk');
  b.textContent = yazi;
  if(kart){
    kart.className = 'miniKart kronoKart' + (k.calisiyor?' calisiyor':'');
    kart.title = (k.calisiyor?'Çalışıyor':'Durdu') + ' · bugün ' + yazi + ' — tıkla başlat/durdur, sağ tıkla sıfırla';
  }
}
function kronoKaydet(k){ try{ localStorage.setItem('use_krono', JSON.stringify(k)); }catch(e){} }
function kronoDegistir(){
  var k = kronoOku();
  k.calisiyor = !k.calisiyor;
  kronoKaydet(k);
  if(k.calisiyor){
    if(KRONO_ZAMAN) clearInterval(KRONO_ZAMAN);
    KRONO_ZAMAN = setInterval(function(){
      var g = kronoOku(); if(!g.calisiyor){ clearInterval(KRONO_ZAMAN); KRONO_ZAMAN=null; return; }
      g.saniye++; kronoKaydet(g); kronoYaz();
    }, 1000);
  } else if(KRONO_ZAMAN){ clearInterval(KRONO_ZAMAN); KRONO_ZAMAN=null; }
  kronoYaz();
}
function kronoSifirla(){
  var k = kronoOku(); k.saniye = 0; k.calisiyor = false; kronoKaydet(k);
  if(KRONO_ZAMAN){ clearInterval(KRONO_ZAMAN); KRONO_ZAMAN=null; }
  kronoYaz();
}
function kronoBaslat(){ var k=kronoOku(); if(k.calisiyor){ KRONO_ZAMAN=setInterval(function(){ var g=kronoOku(); if(!g.calisiyor){clearInterval(KRONO_ZAMAN);KRONO_ZAMAN=null;return;} g.saniye++; kronoKaydet(g); kronoYaz(); },1000); } kronoYaz(); }

/* ================= GAZİANTEP HAVA DURUMU (çevrimiçiyse) ================= */
function havaSimge(c){
  if(c===0) return '☀️'; if(c<=2) return '🌤️'; if(c===3) return '☁️';
  if(c===45||c===48) return '🌫️'; if(c>=51&&c<=57) return '🌦️';
  if(c>=61&&c<=67) return '🌧️'; if(c>=71&&c<=77) return '❄️';
  if(c>=80&&c<=82) return '🌧️'; if(c>=85&&c<=86) return '❄️';
  if(c>=95) return '⛈️'; return '🌡️';
}
function havaYaz(){
  var kart = document.getElementById('havaKart'); if(!kart) return;
  if(navigator.onLine === false){ kart.style.display='none'; return; }
  var x = new XMLHttpRequest();
  x.open('GET','https://api.open-meteo.com/v1/forecast?latitude=37.0662&longitude=37.3833&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul',true);
  x.onload = function(){
    try{
      var d = JSON.parse(x.responseText), c = d.current;
      var b = document.getElementById('mkHava');
      b.textContent = Math.round(c.temperature_2m)+'°C '+havaSimge(c.weather_code);
      kart.style.display='';
      kart.title = 'Gaziantep · şu an '+Math.round(c.temperature_2m)+'°C '+havaSimge(c.weather_code);
    }catch(e){ kart.style.display='none'; }
  };
  x.onerror = function(){ kart.style.display='none'; };
  x.send();
}
window.addEventListener('online', havaYaz);
window.addEventListener('offline', function(){ var k=document.getElementById('havaKart'); if(k) k.style.display='none'; });
havaYaz(); setInterval(havaYaz, 900000);

/* ================= 3D STÜDYO ÇERÇEVELERİ (dört köşe çizgisi) ================= */
function studioCerceve(){
  ['stSahne','stSablon'].forEach(function(id){
    var iz = document.getElementById(id); if(!iz) return;
    [].slice.call(iz.querySelectorAll('button')).forEach(function(b, k){
      var ad = b.querySelector('.ad');
      if(ad && !ad.querySelector('.stNo')) {
        var n = document.createElement('i'); n.className='stNo';
        n.textContent = ('0'+(k+1)).slice(-2);
        ad.insertBefore(n, ad.firstChild);
      }
    });
  });
}
gununSoruYaz();
kronoBaslat();
setTimeout(function(){ if(typeof studyoCiz==='function') studyoCiz(); studioCerceve(); }, 400);
setInterval(gununSoruYaz, 600000);

/* ================= DEVAMLILIK (üst üste çalışma günü) + GÜNÜN KOMUTU ================= */
function devamlilikYaz(){
  var el = document.getElementById('mkDevam'); if(!el) return;
  var bugun = new Date();
  var anahtar = bugun.getFullYear() + '-' + ('0'+(bugun.getMonth()+1)).slice(-2) + '-' + ('0'+bugun.getDate()).slice(-2);
  var kayit = null;
  try{ kayit = JSON.parse(localStorage.getItem('use_devam') || 'null'); }catch(e){ kayit = null; }
  if(!kayit || !kayit.son){ kayit = { son: anahtar, gun: 1 }; }
  else if(kayit.son !== anahtar){
    var dun = new Date(bugun.getTime() - 86400000);
    var dunA = dun.getFullYear() + '-' + ('0'+(dun.getMonth()+1)).slice(-2) + '-' + ('0'+dun.getDate()).slice(-2);
    kayit = { son: anahtar, gun: (kayit.son === dunA) ? (kayit.gun + 1) : 1 };
  }
  try{ localStorage.setItem('use_devam', JSON.stringify(kayit)); }catch(e){}
  el.textContent = kayit.gun + ' GÜN';
  el.title = kayit.gun + ' gün üst üste. Her gün bir komut, her gün bir adım.';
}
function gununKomutlari(){
  var liste = [];
  if(typeof V === 'undefined' || !V) return liste;
  var yedek = [];
  V.bolumler.forEach(function(b){
    b.kayitlar.forEach(function(k){
      if(k.tip !== 'komut' || !k.ad || k.ad.length > 46) return;
      var kayit = { ad: k.ad, ornek: k.ornek || '', bolum: b.ad };
      yedek.push(kayit);
      /* gerçek kabuk komutu gibi görünenler öncelikli (küçük harfle başlayan) */
      if(/^[a-z][a-z0-9._-]*(\s|$)/.test(k.ad)) liste.push(kayit);
    });
  });
  return liste.length ? liste : yedek;
}
function gununKomutuYaz(){
  var kod = document.getElementById('mkKomut'); if(!kod) return;
  var liste = gununKomutlari();
  if(!liste.length){ kod.textContent = 'nmap -sV hedef'; return; }
  var d = new Date();
  var gunNo = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  var secili = liste[(gunNo * 7) % liste.length];
  kod.textContent = secili.ad;
  var kart = document.getElementById('gunKomutKart');
  if(kart){
    kart.setAttribute('data-komut', secili.ornek || secili.ad);
    kart.title = 'Günün komutu: ' + secili.ad + ' (' + secili.bolum + ') — tıkla, kopyalanır';
  }
}
function kopyalaEski(yazi){
  try{
    var t = document.createElement('textarea'); t.value = yazi;
    t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t);
    t.select(); document.execCommand('copy'); document.body.removeChild(t);
  }catch(e){}
}
function gunKomutKopyala(){
  var kart = document.getElementById('gunKomutKart'), kod = document.getElementById('mkKomut');
  if(!kart || !kod) return;
  var yazi = kart.getAttribute('data-komut') || kod.textContent;
  function bitti(){
    kart.className = 'miniKart komutKart kopyalandi';
    var eski = kod.textContent;
    kod.textContent = 'KOPYALANDI ✓';
    setTimeout(function(){ kod.textContent = eski; kart.className = 'miniKart komutKart'; }, 1200);
  }
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(yazi).then(bitti, function(){ kopyalaEski(yazi); bitti(); });
      return;
    }
  }catch(e){}
  kopyalaEski(yazi); bitti();
}
devamlilikYaz();
gununKomutuYaz();
setInterval(gununKomutuYaz, 600000);

/* ================= NEO IŞIKLI SAAT ================= */
var NS_GUN = ['PAZAR','PAZARTESİ','SALI','ÇARŞAMBA','PERŞEMBE','CUMA','CUMARTESİ'];
var NS_AY  = ['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
function neoSaatYaz(){
  var el = document.getElementById('nsSaat');
  if(!el) return;
  var d = new Date();
  el.textContent = ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2) + ':' + ('0'+d.getSeconds()).slice(-2);
  var g = document.getElementById('nsGun');
  if(g) g.textContent = d.getDate() + ' ' + NS_AY[d.getMonth()].slice(0,3) + ' ' + NS_GUN[d.getDay()].slice(0,3);
  var u = document.getElementById('nsDunya');
  if(u) u.textContent = ('0'+d.getUTCHours()).slice(-2) + ':' + ('0'+d.getUTCMinutes()).slice(-2) + ':' + ('0'+d.getUTCSeconds()).slice(-2);
}
neoSaatYaz();
setInterval(neoSaatYaz, 1000);
