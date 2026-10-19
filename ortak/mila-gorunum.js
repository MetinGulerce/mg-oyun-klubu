/* Mila'nın görünüşü — Orman ve Köy'deki Prenses Butiği'nde seçilen elbise ve taç bütün oyunlarda ortak.
 * Seçim tarayıcıda 'mg-kulup-mila' anahtarında durur: {elbise:'#rrggbb' | 'rainbow', tac:'altin'|'cicek'|'yildiz'|'kalp'}
 *
 *   MilaGorunum.elbise(c, x0, y0, x1, y1)  elbisenin dolgusu (gökkuşağı seçildiyse renk geçişi)
 *   MilaGorunum.tac(c, x, y, s)            Mila'nın tacı (x, y: tacın alt ortası, s: boyut)
 */
(function(){
'use strict';
const look = {elbise:'#ff9ccb', tac:'altin'};
try {
  const o = JSON.parse(localStorage.getItem('mg-kulup-mila'));
  if (o && typeof o === 'object'){
    if (/^#[0-9a-f]{6}$/i.test(o.elbise) || o.elbise === 'rainbow') look.elbise = o.elbise;
    if (['altin', 'cicek', 'yildiz', 'kalp'].includes(o.tac)) look.tac = o.tac;
  }
} catch (e) {}
const RB = ['#ff7eb6', '#ffb13d', '#ffe95c', '#8fe3a1', '#7cc8ff', '#c9a7ff', '#ff7eb6'];
function circ(c, x, y, r, col){ c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill(); }
function heart(c, x, y, s, col){ c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(0, 0.38); c.bezierCurveTo(-0.7, -0.1, -0.38, -0.62, 0, -0.26); c.bezierCurveTo(0.38, -0.62, 0.7, -0.1, 0, 0.38); c.fillStyle = col; c.fill(); c.restore(); }
function star(c, x, y, s, col){ c.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.45 : s; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fillStyle = col; c.fill(); }

window.MilaGorunum = {
  look,
  elbise(c, x0, y0, x1, y1){
    if (look.elbise !== 'rainbow') return look.elbise;
    const g = c.createLinearGradient(x0, y0, x1, y1); RB.forEach((col, i) => g.addColorStop(i / (RB.length - 1), col)); return g;
  },
  tac(c, x, y, s){
    const k = look.tac;
    if (k === 'cicek'){
      for (let i = 0; i < 7; i++){ const a = Math.PI * (1.05 + i * 0.15), px = x + Math.cos(a) * s * 0.55, py = y + 0.1 * s + Math.sin(a) * s * 0.22, col = ['#ff7eb6', '#ffd36e', '#c9a7ff', '#ffffff'][i % 4];
        for (let j = 0; j < 5; j++) circ(c, px + Math.cos(j * 1.257) * s * 0.07, py + Math.sin(j * 1.257) * s * 0.07, s * 0.07, col); circ(c, px, py, s * 0.05, '#ffb13d'); }
      return;
    }
    c.beginPath(); c.moveTo(x - 0.5 * s, y); c.lineTo(x - 0.58 * s, y - 0.55 * s); c.lineTo(x - 0.25 * s, y - 0.3 * s); c.lineTo(x, y - 0.72 * s);
    c.lineTo(x + 0.25 * s, y - 0.3 * s); c.lineTo(x + 0.58 * s, y - 0.55 * s); c.lineTo(x + 0.5 * s, y); c.closePath(); c.fillStyle = k === 'altin' ? '#f6c445' : '#ffe9a8'; c.fill();
    if (k === 'yildiz'){ star(c, x, y - 0.62 * s, 0.32 * s, '#ffd23f'); return; }
    if (k === 'kalp'){ heart(c, x, y - 0.55 * s, 0.62 * s, '#ff4f9a'); circ(c, x - 0.58 * s, y - 0.55 * s, 0.07 * s, '#c9a7ff'); circ(c, x + 0.58 * s, y - 0.55 * s, 0.07 * s, '#c9a7ff'); return; }
    circ(c, x, y - 0.72 * s, 0.09 * s, '#ff5fa2'); circ(c, x - 0.58 * s, y - 0.55 * s, 0.07 * s, '#7cc8ff'); circ(c, x + 0.58 * s, y - 0.55 * s, 0.07 * s, '#7cc8ff');
  },
};
})();
