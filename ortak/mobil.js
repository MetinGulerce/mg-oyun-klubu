/* MG Oyun Klübü — telefon ve tablet yardımcıları (bütün sayfalar ortak kullanır).
 *
 *   MGMobil.init({yatay:true})  yatay: telefon dik tutulunca "yan çevir" önerisi gösterilir
 *                               Sayfada <button id="fsBtn" hidden></button> varsa tam ekran düğmesi olur:
 *                               tarayıcı destekliyorsa tam ekranı açıp kapatır, iPhone'da "Ana Ekrana Ekle" yolunu anlatır.
 *                               Telefonda oyuna ilk dokunuşta tam ekrana kendiliğinden geçilir (oto:false kapatır);
 *                               düğmeyle tam ekrandan çıkılırsa o oturumda bir daha zorlanmaz.
 *   MGMobil.tamEkran()          tam ekranı açar/kapatır (tarayıcı desteklemiyorsa false döner)
 *   MGMobil.tamEkranVar         tarayıcı tam ekranı destekliyor mu
 *   MGMobil.telefon()           küçük dokunmatik ekran mı
 *   MGMobil.titret(ms)          destekleyen telefonlarda kısa titreşim
 *   MGMobil.oynatici()          seslendirmeler için tek ses oynatıcı: iPhone/iPad'de ilk dokunuşta kilidi açılır,
 *                               sonra oyun içinden (dokunuş olmadan) da konuşabilir
 *
 * Ayrıca: iOS'ta sayfanın iki parmakla büyümesini engeller; ana ekrana eklenince
 * (manifest.webmanifest) oyunlar tarayıcı çubukları olmadan tam ekran açılır.
 */
(function(){
'use strict';
const d = document, de = d.documentElement, nav = navigator;
const ios = /iP(hone|od|ad)/.test(nav.platform || '') || (/Mac/.test(nav.userAgent) && 'ontouchend' in d);
const uygulama = () => matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || nav.standalone === true;
const tamEkranVar = !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
const dokunmatik = () => matchMedia('(hover: none) and (pointer: coarse)').matches;
const telefon = () => dokunmatik() && Math.min(screen.width, screen.height) < 600;
const tamEkranda = () => !!(d.fullscreenElement || d.webkitFullscreenElement);
let ayar = {};

// Tam ekran. Oturum boyunca hatırlanan tek şey: kullanıcı tam ekrandan kendi isteğiyle (düğme/menü) çıktı mı.
let otoKapali = false; try { otoKapali = sessionStorage.getItem('mg-tam') === 'kapali'; } catch (e) {}
function otoAyarla(kapali){ otoKapali = kapali; try { sessionStorage.setItem('mg-tam', kapali ? 'kapali' : ''); } catch (e) {} }
function gir(kilit){
  const f = de.requestFullscreen || de.webkitRequestFullscreen; let p;
  try { p = f.call(de, {navigationUI:'hide'}); } catch (e) { return; }
  if (p && p.then) p.then(() => { if (kilit && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
}
function cik(){ try { const p = (d.exitFullscreen || d.webkitExitFullscreen).call(d); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
// düğme, menü ya da "yan çevir" kartından: kullanıcının açık isteği
function tamEkran(kilit){
  if (!tamEkranVar) return false;
  if (tamEkranda()){ otoAyarla(true); cik(); } else { otoAyarla(false); gir(kilit === true); }
  return true;
}
// telefonda oyuna dokununca tarayıcı çubuklarını kendiliğinden gizle (dokunuş olmadan tam ekran açılamaz)
let bekliyor = false;
function otoTam(e){
  if (e.type === 'pointerup' && e.pointerType === 'mouse') return;
  if (ayar.oto === false || otoKapali || bekliyor || !tamEkranVar || tamEkranda() || uygulama() || !telefon()) return;
  if (e.target && e.target.closest && e.target.closest('#fsBtn, .mgOrt')) return;
  bekliyor = true; setTimeout(() => { bekliyor = false; }, 1000);
  gir(false);
}

// iOS Safari "user-scalable=no"yu yok sayar: başlık ve düğmelerde iki parmakla sayfa büyümesin
d.addEventListener('gesturestart', e => e.preventDefault());

// Safari, dokunuşla başlatılmamış sesi çalmaz. Her replik için yeni ses nesnesi yerine tek bir oynatıcı
// kullanılır ve ilk dokunuşta kısa bir sessizlik çalınarak kilidi açılır.
const SESSIZ = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYyLjEyLjEwMgAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAABAAAAlgAenp6enp6enp6enp6enp6enp6enp6enp6pqampqampqampqampqampqampqampqamptPT09PT09PT09PT09PT09PT09PT09PT09P/////////////////////////////////AAAAAExhdmM2Mi4yOAAAAAAAAAAAAAAAACQCcQAAAAAAAAJY+/pGGwAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
let sesEl = null, kilitAcik = false;
function oynatici(){ if (!sesEl){ sesEl = new Audio(); sesEl.preload = 'auto'; } return sesEl; }
function kilidiAc(){
  if (kilitAcik) return;
  const a = oynatici(); if (a.src && !a.paused) { kilitAcik = true; return; }   // zaten bir replik çalıyor
  kilitAcik = true; a.src = SESSIZ;
  const p = a.play(); if (p && p.catch) p.catch(() => { kilitAcik = false; });
}
for (const ev of ['touchend', 'click', 'keydown']) d.addEventListener(ev, kilidiAc, true);

const CSS = `
.mgOrt{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(74,37,69,.45);font:15px/1.45 "Fredoka",system-ui,sans-serif;color:#4a2545;overflow:auto}
.mgOrt[hidden]{display:none}
.mgOrt .k{width:min(340px,100%);background:#fff6fb;border:2px solid #f6bcd9;border-radius:22px;padding:22px 20px 18px;text-align:center;box-shadow:0 18px 50px rgba(120,40,90,.35)}
.mgOrt .tel{font-size:64px;line-height:1;display:inline-block}
#mgYan .tel{animation:mgDon 2.4s ease-in-out infinite}
.mgOrt b{display:block;font-size:21px;margin:12px 0 4px}
.mgOrt p b,.mgOrt .ip b{display:inline;font-size:inherit;margin:0}
.mgOrt p{margin:4px 0;color:#7b4f71}
.mgOrt .r{display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap}
.mgOrt button{font:inherit;font-weight:700;border:0;cursor:pointer;padding:11px 18px;border-radius:14px;background:#ffe1ef;color:#4a2545}
.mgOrt button.p{background:#ff5fa2;color:#fff}
.mgOrt .ip{font-size:12.5px;margin-top:12px;color:#a3748f}
#fsBtn{display:inline-flex;align-items:center;justify-content:center;line-height:1;align-self:stretch}
#fsBtn[hidden]{display:none!important}
#fsBtn svg{display:block;width:18px;height:18px}
@media (orientation:landscape) and (max-height:520px){.mgOrt{padding:10px}.mgOrt .k{padding:14px 18px 12px}.mgOrt .tel{font-size:44px}.mgOrt b{margin:6px 0 2px;font-size:19px}}
@keyframes mgDon{0%,20%{transform:rotate(0)}45%,75%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){#mgYan .tel{animation:none}}`;

const IKON_AC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const IKON_KAPA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M15 20v-5h5M9 20v-5H4"/></svg>';
let fsBtn = null;
function dugmeGuncelle(){
  if (!fsBtn) return;
  const ic = tamEkranda();
  fsBtn.innerHTML = ic ? IKON_KAPA : IKON_AC;
  fsBtn.title = ic ? 'Tam ekrandan çık' : 'Tam ekran';
  fsBtn.setAttribute('aria-label', fsBtn.title);
}
// iPhone Safari sayfalara tam ekran izni vermez; tek yol ana ekrana eklemek
let iosEl = null;
function iosKarti(){
  if (!iosEl){
    iosEl = d.createElement('div'); iosEl.className = 'mgOrt'; iosEl.id = 'mgTam';
    iosEl.innerHTML = `<div class="k"><div class="tel">📲</div><b>iPhone’da tam ekran</b>
      <p>Safari tarayıcı çubuklarını kendiliğinden gizlemez. Oyunu bir kere ana ekrana ekle:</p>
      <p>1. Alttaki <b>Paylaş ⬆️</b> düğmesine dokun (görünmüyorsa <b>•••</b> menüsünde).<br>2. <b>Ana Ekrana Ekle</b>’yi seç.</p>
      <p>Sonra oyunları ana ekrandaki 🎈 simgesinden aç: çubuklar olmadan, kocaman açılır.</p>
      <div class="r"><button class="p" data-a="ok">Tamam</button></div></div>`;
    iosEl.addEventListener('click', e => { if (e.target === iosEl || e.target.closest('[data-a]')) iosEl.hidden = true; });
    d.body.appendChild(iosEl);
  }
  iosEl.hidden = false;
}

let yanEl = null;
function yanKontrol(){
  if (!yanEl) return;
  const dik = innerHeight > innerWidth * 1.1;
  let gordu = false; try { gordu = sessionStorage.getItem('mg-yan') === '1'; } catch (e) {}
  yanEl.hidden = !(dik && telefon() && !gordu);
}
function yanKapat(){ try { sessionStorage.setItem('mg-yan', '1'); } catch (e) {} if (yanEl) yanEl.hidden = true; }

function init(o){
  ayar = o || {};
  const st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
  fsBtn = d.getElementById('fsBtn');
  if (fsBtn){
    // ana ekrandan açılmışsa zaten tam ekran; destek yoksa yalnızca iPhone'a yol gösterilir
    fsBtn.hidden = uygulama() || !(tamEkranVar || ios);
    dugmeGuncelle();
    fsBtn.addEventListener('click', () => { if (tamEkranVar) tamEkran(); else iosKarti(); });
  }
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) d.addEventListener(ev, dugmeGuncelle);
  d.addEventListener('touchend', otoTam, true);
  d.addEventListener('pointerup', otoTam, true);
  if (ayar.yatay){
    yanEl = d.createElement('div'); yanEl.id = 'mgYan'; yanEl.className = 'mgOrt'; yanEl.hidden = true;
    yanEl.innerHTML = `<div class="k"><div class="tel">📱</div><b>Telefonu yan çevir!</b><p>${ayar.yatayNeden || 'Oyun alanı kocaman olur, parmağınla çok daha rahat oynarsın.'}</p>
      <div class="r">${tamEkranVar ? '<button class="p" data-a="fs">⛶ Tam ekran</button>' : ''}<button data-a="ok" class="${tamEkranVar ? '' : 'p'}">Tamam</button></div>
      ${ios && !uygulama() ? '<p class="ip">İpucu: Safari’de <b style="display:inline;font-size:inherit;margin:0">Paylaş ⬆️ → Ana Ekrana Ekle</b> dersen oyun tam ekran açılır.</p>' : ''}</div>`;
    yanEl.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'fs') tamEkran(true);
      yanKapat();
    });
    d.body.appendChild(yanEl);
    addEventListener('resize', yanKontrol);
    addEventListener('orientationchange', () => setTimeout(yanKontrol, 250));
    yanKontrol();
  }
}

window.MGMobil = {
  init, tamEkran, tamEkranVar, telefon, dokunmatik, ios, uygulama, tamEkranda, oynatici,
  titret(ms){ try { nav.vibrate && nav.vibrate(ms || 10); } catch (e) {} },
};
})();
