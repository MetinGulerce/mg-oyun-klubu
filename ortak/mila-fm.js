/* Mila FM — MG Oyun Klübü'nün ortak radyosu.
 *
 *   MilaFM.init({button, host})  button: radyoyu açan düğme, host: panelin konacağı kutu (position:relative)
 *   MilaFM.duck(true|false)      seslendirme sırasında radyoyu kısar
 *   MilaFM.stop()                radyoyu durdurur
 *
 * İstasyonlar:
 *   K-Pop     → Sony Pictures Animation'ın resmi YouTube videoları (yalnızca http/https üzerinden çalışır)
 *   Pamuk Pop → oyunun kendi bestesi, WebAudio ile internetsiz çalınır
 */
(function(){
'use strict';
const KPOP = [
  ['yebNIHKAC4A', 'Golden — HUNTR/X'],
  ['QGsevnbItdU', "How It's Done — HUNTR/X"],
  ['TbMEMCvFbZk', 'What It Sounds Like — HUNTR/X'],
  ['fjOeJssZX_Q', 'Free — Rumi & Jinu'],
  ['l8Dr7vzMSVE', 'Takedown — TWICE'],
  ['983bBbJx0Mk', 'Soda Pop — Saja Boys'],
];
const TUNES = [
  {name:'Pamuk Pop', bpm:118, prog:['C', 'G', 'Am', 'F'],
   mel:'E5 - G5 - C6 - B5 A5 G5 - E5 - D5 - C5 - D5 - G5 - B5 - A5 G5 D5 - - - . . . . C5 - E5 - A5 - G5 E5 A5 - G5 - E5 - C5 - F5 - A5 - C6 - A5 G5 F5 - E5 - D5 - - -'},
  {name:'Gökkuşağı Dansı', bpm:124, prog:['Am', 'F', 'C', 'G'],
   mel:'A4 . C5 . E5 - D5 C5 E5 - A5 - G5 - E5 - F5 - E5 - C5 - A4 - C5 . C5 . F5 - E5 - E5 - G5 - C6 - B5 - G5 - E5 - G5 . G5 . B5 - A5 - G5 - D5 - B4 - D5 - G5 - - -'},
  {name:'Şato Partisi', bpm:110, prog:['F', 'G', 'Em', 'Am'],
   mel:'C5 . F5 . A5 . C6 - A5 . F5 . G5 - A5 - B5 - D6 - B5 - G5 - D5 - G5 - B5 - - - G5 . E5 . G5 . B5 - A5 - G5 - E5 - D5 - E5 - C5 - A4 - C5 - E5 - A5 - - - . .'},
];
const CHORD = {C:[60, 64, 67], G:[59, 62, 67], Am:[57, 60, 64], F:[57, 60, 65], Em:[59, 64, 67]};
const BASS = {C:36, G:43, Am:45, F:41, Em:40};
const NOTE = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const midi = t => 12 * (+t.slice(-1) + 1) + NOTE[t[0]];
const ytOK = () => location.protocol === 'http:' || location.protocol === 'https:';
const KEY = 'mg-mila-fm';

const R = {on:false, st:'kpop', song:0, vol:0.7, mini:false, yt:null, tm:null, step:0, next:0, loops:0, ducked:false};
try { const r = JSON.parse(localStorage.getItem(KEY)); if (r){ R.st = r.st === 'pop' ? 'pop' : 'kpop'; R.vol = +r.vol || 0.7; } } catch (e) {}
let actx = null, gain = null, noiseBuf = null, panel = null, btn = null;

const CSS = `
#mfm{position:absolute;left:12px;bottom:12px;z-index:6;width:min(280px,calc(100% - 24px));background:#fff;border-radius:18px;border:2px solid #f6bcd9;box-shadow:0 10px 30px rgba(120,40,90,.25);padding:10px 12px 12px;font:14px/1.4 "Fredoka",system-ui,sans-serif;color:#4a2545}
#mfm[hidden]{display:none}
#mfm button{font:inherit;color:inherit;cursor:pointer;border:0}
#mfm .rh{display:flex;align-items:center;gap:6px;font-weight:800}
#mfm .rh .x{width:30px;height:30px;border-radius:50%;background:#ffe1ef}
#mfm .rh .x:first-of-type{margin-left:auto}
#mfm .st{display:flex;gap:6px;margin:8px 0}
#mfm .st button{flex:1;padding:7px 4px;border-radius:12px;background:#ffe1ef;font-weight:700;font-size:13px;border:2px solid transparent}
#mfm .st button.on{border-color:#ff5fa2;background:#ffd0e4}
#mfm .now{font-size:13px;color:#a3748f;min-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mfm .now b{color:#4a2545}
#mfm .ctl{display:flex;align-items:center;gap:6px;margin-top:6px}
#mfm .ctl button{width:44px;height:40px;border-radius:12px;background:#ffe1ef;font-size:18px}
#mfm .ctl input{flex:1;accent-color:#ff5fa2}
#mfm .yt{margin-top:8px;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9}
#mfm .yt iframe{width:100%;height:100%;border:0;display:block}
#mfm .note{font-size:11.5px;color:#a3748f;margin-top:6px;line-height:1.35}
#mfm.mini .st,#mfm.mini .note{display:none}
#mfm.mini .yt{width:200px}
.mfm-eq{display:inline-flex;gap:2px;align-items:flex-end;height:14px;margin-left:4px}
.mfm-eq i{width:3px;background:#ff5fa2;border-radius:2px;animation:mfmeq .8s ease-in-out infinite}
.mfm-eq i:nth-child(2){animation-delay:.2s}.mfm-eq i:nth-child(3){animation-delay:.4s}
@keyframes mfmeq{0%,100%{height:3px}50%{height:14px}}`;

function save(){ try { localStorage.setItem(KEY, JSON.stringify({st:R.st, vol:R.vol})); } catch (e) {} }
function ctxA(){
  if (!actx){ try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (actx.state === 'suspended') actx.resume().catch(() => {});
  return actx;
}
function ytCmd(func, args){ try { R.yt && R.yt.contentWindow.postMessage(JSON.stringify({event:'command', func, args:args || []}), '*'); } catch (e) {} }
function volume(){
  const v = R.vol * (R.ducked ? 0.25 : 1);
  if (gain && actx) gain.gain.setTargetAtTime(v * 0.5, actx.currentTime, 0.15);
  if (R.yt) ytCmd('setVolume', [Math.round(v * 100)]);
}

// ---- Pamuk Pop sıralayıcısı (16'lık notalar)
function note(t, f, dur, type, vol, cut){
  const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f;
  let out = o; if (cut){ const fl = actx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); out = fl; }
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  out.connect(g); g.connect(gain); o.start(t); o.stop(t + dur + 0.05);
}
function noise(t, dur, vol, type, freq){
  if (!noiseBuf){ noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = actx.createBufferSource(), fl = actx.createBiquadFilter(), g = actx.createGain(); s.buffer = noiseBuf; fl.type = type; fl.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(fl); fl.connect(g); g.connect(gain); s.start(t); s.stop(t + dur + 0.02);
}
function kick(t){ const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28); o.connect(g); g.connect(gain); o.start(t); o.stop(t + 0.3); }
TUNES.forEach(T => {
  const tk = T.mel.trim().split(/\s+/), notes = [];
  tk.forEach((x, i) => { if (x === '.' || x === '-') return; let n = 1; while (tk[i + n] === '-') n++; notes[i] = [midi(x), n]; });
  T.m = {notes, len:tk.length};
});
function stepAt(T, i, t){
  const st = 60 / T.bpm / 4, s = i % 16, ch = T.prog[Math.floor(i / 16) % T.prog.length];
  if ((R.loops % 4 !== 3 || s < 8) && s % 4 === 0) kick(t);
  if (s === 4 || s === 12) noise(t, 0.16, 0.35, 'bandpass', 1900);
  if (s % 2 === 1) noise(t, 0.035, s % 4 === 3 ? 0.14 : 0.08, 'highpass', 8000);
  if ([0, 2, 3, 6, 8, 10, 11, 14].includes(s)) note(t, hz(BASS[ch] + (s === 3 || s === 11 ? 12 : 0)), st * 1.6, 'sawtooth', 0.22, 700);
  if (s === 2 || s === 6 || s === 10 || s === 14) for (const m of CHORD[ch]) note(t, hz(m), st * 1.4, 'triangle', 0.07);
  if (R.loops > 0){ const n = T.m.notes[i % T.m.len]; if (n){ note(t, hz(n[0]), st * n[1] * 0.95, 'square', 0.055, 3200); note(t, hz(n[0] + 12), st * n[1] * 0.6, 'sine', 0.035); } }
  else if (s % 2 === 0) note(t, hz(CHORD[ch][(s / 2) % 3] + 24), st * 1.2, 'sine', 0.04);
}
function tick(){
  const T = TUNES[R.song], st = 60 / T.bpm / 4;
  while (R.next < actx.currentTime + 0.15){
    stepAt(T, R.step, R.next); R.next += st; R.step++;
    if (R.step % T.m.len === 0 && ++R.loops >= 6){ R.song = (R.song + 1) % TUNES.length; R.step = 0; R.loops = 0; render(); return; }
  }
}
function popStart(){
  if (!ctxA()) return;
  if (!gain){ gain = actx.createGain(); gain.connect(actx.destination); }
  volume(); R.step = 0; R.loops = 0; R.next = actx.currentTime + 0.08;
  clearInterval(R.tm); R.tm = setInterval(tick, 25);
}
function popStop(){ clearInterval(R.tm); R.tm = null; if (gain){ gain.disconnect(); gain = null; } }

function play(){
  R.on = true;
  if (R.st === 'pop' || !ytOK()){ if (!ytOK()) R.st = 'pop'; popStart(); } else popStop();
  render(); btn && btn.classList.add('on');
}
function stop(){ R.on = false; popStop(); ytCmd('pauseVideo'); render(); btn && btn.classList.remove('on'); }
function skip(d){
  if (R.st === 'pop'){ R.song = (R.song + d + TUNES.length) % TUNES.length; if (R.on) popStart(); render(); }
  else ytCmd(d > 0 ? 'nextVideo' : 'previousVideo');
}
function toggle(){ if (panel.hidden){ panel.hidden = false; render(); if (!R.on) play(); } else panel.hidden = true; }
function render(){
  if (!panel || panel.hidden) return;
  const kp = R.st === 'kpop' && ytOK();
  panel.classList.toggle('mini', R.mini);
  panel.innerHTML = `<div class="rh">📻 Mila FM ${R.on ? '<span class="mfm-eq"><i></i><i></i><i></i></span>' : ''}<button class="x" data-a="mini" title="Küçült/büyüt">${R.mini ? '▢' : '–'}</button><button class="x" data-a="close" title="Kapat">✕</button></div>
    <div class="st"><button data-a="kpop" class="${R.st === 'kpop' ? 'on' : ''}">🎤 K-Pop</button><button data-a="pop" class="${R.st === 'pop' ? 'on' : ''}">🎹 Pamuk Pop</button></div>
    <div class="now">${kp ? '🎶 <b>KPop Demon Hunters</b> şarkıları' : `🎶 <b>${TUNES[R.song].name}</b>`}</div>
    <div class="ctl"><button data-a="prev" title="Önceki">⏮</button><button data-a="play" title="Çal / durdur">${R.on ? '⏸' : '▶'}</button><button data-a="next" title="Sonraki">⏭</button><input type="range" min="0" max="1" step="0.05" value="${R.vol}" title="Ses"></div>
    <div class="ytbox"></div>
    <div class="note">${ytOK() ? (kp ? 'Resmi Sony Pictures Animation videoları YouTube’dan çalınır.' : 'Pamuk Pop oyunun kendi şarkıları; internetsiz çalar.') : 'K-Pop şarkıları oyunu internet sitesinden açınca çalar. Dosyadan açtığında Pamuk Pop çalar.'}</div>`;
  panel.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'close'){ stop(); panel.hidden = true; }
    else if (a === 'mini'){ R.mini = !R.mini; render(); }
    else if (a === 'kpop' || a === 'pop'){ if (a === 'kpop' && !ytOK()) return; R.st = a; save(); R.on ? play() : render(); }
    else if (a === 'play') R.on ? stop() : play();
    else skip(a === 'next' ? 1 : -1);
  });
  panel.querySelector('input').oninput = e => { R.vol = +e.target.value; save(); volume(); };
  const box = panel.querySelector('.ytbox');
  if (kp){
    if (!R.yt){
      const ids = KPOP.map(k => k[0]), f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${ids[0]}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&loop=1&playlist=${ids.slice(1).concat(ids[0]).join(',')}&origin=${encodeURIComponent(location.origin)}`;
      f.allow = 'autoplay; encrypted-media'; f.title = 'Mila FM K-Pop'; f.onload = () => setTimeout(volume, 800);
      R.yt = f;
    }
    const w = document.createElement('div'); w.className = 'yt'; w.appendChild(R.yt); box.appendChild(w);
    if (R.on) ytCmd('playVideo');
  } else if (R.yt){ ytCmd('pauseVideo'); const w = document.createElement('div'); w.style.display = 'none'; w.appendChild(R.yt); box.appendChild(w); }
}

window.MilaFM = {
  init(o){
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    panel = document.createElement('div'); panel.id = 'mfm'; panel.hidden = true; o.host.appendChild(panel);
    btn = o.button; if (btn) btn.addEventListener('click', toggle);
  },
  duck(on){ if (R.ducked !== on){ R.ducked = on; volume(); } },
  stop, toggle, get on(){ return R.on; },
};
})();
