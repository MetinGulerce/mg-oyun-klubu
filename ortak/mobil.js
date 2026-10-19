/* MG Oyun Klübü — telefon ve tablet yardımcıları (bütün sayfalar ortak kullanır).
 *
 *   MGMobil.init({yatay:true})  yatay: telefon dik tutulunca "yan çevir" önerisi gösterilir
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

function tamEkran(){
  if (!tamEkranVar) return false;
  if (tamEkranda()){ (d.exitFullscreen || d.webkitExitFullscreen).call(d); return true; }
  const p = (de.requestFullscreen || de.webkitRequestFullscreen).call(de, {navigationUI:'hide'});
  if (p && p.then) p.then(() => { if (ayar.yatay && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
  return true;
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
#mgYan{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(74,37,69,.45);font:15px/1.45 "Fredoka",system-ui,sans-serif;color:#4a2545}
#mgYan[hidden]{display:none}
#mgYan .k{width:min(340px,100%);background:#fff6fb;border:2px solid #f6bcd9;border-radius:22px;padding:22px 20px 18px;text-align:center;box-shadow:0 18px 50px rgba(120,40,90,.35)}
#mgYan .tel{font-size:64px;line-height:1;display:inline-block;animation:mgDon 2.4s ease-in-out infinite}
#mgYan b{display:block;font-size:21px;margin:12px 0 4px}
#mgYan p{margin:4px 0;color:#7b4f71}
#mgYan .r{display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap}
#mgYan button{font:inherit;font-weight:700;border:0;cursor:pointer;padding:11px 18px;border-radius:14px;background:#ffe1ef;color:#4a2545}
#mgYan button.p{background:#ff5fa2;color:#fff}
#mgYan .ip{font-size:12.5px;margin-top:12px;color:#a3748f}
@keyframes mgDon{0%,20%{transform:rotate(0)}45%,75%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){#mgYan .tel{animation:none}}`;

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
  if (ayar.yatay){
    yanEl = d.createElement('div'); yanEl.id = 'mgYan'; yanEl.hidden = true;
    yanEl.innerHTML = `<div class="k"><div class="tel">📱</div><b>Telefonu yan çevir!</b><p>${ayar.yatayNeden || 'Oyun alanı kocaman olur, parmağınla çok daha rahat oynarsın.'}</p>
      <div class="r">${tamEkranVar ? '<button class="p" data-a="fs">⛶ Tam ekran</button>' : ''}<button data-a="ok" class="${tamEkranVar ? '' : 'p'}">Tamam</button></div>
      ${ios && !uygulama() ? '<p class="ip">İpucu: Safari’de <b style="display:inline;font-size:inherit;margin:0">Paylaş ⬆️ → Ana Ekrana Ekle</b> dersen oyun tam ekran açılır.</p>' : ''}</div>`;
    yanEl.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'fs') tamEkran();
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
