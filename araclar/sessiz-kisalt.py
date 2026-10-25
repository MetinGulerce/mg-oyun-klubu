"""Kısacık (patlamalı) sessiz harflerin seslerini kırpar: "Bı" kaydından yalnızca "b"yi bırakır.

Seslendirme servisi b, k, t gibi sesleri tek başına söyleyemez, hep "bı/kı" der. Bu betik
ses/h_b.mp3 gibi dosyalarda sessizin patlamasını bulur ve ünlü başlamadan hemen önce keser
(ünlüden yalnızca EK_MS kadar kalır, sonra yumuşakça susar).

    python araclar/seslendir.py harf-perileri
    python araclar/sessiz-kisalt.py harf-perileri

Kırpılan dosya ses/liste.json'da "kisaltildi" ile işaretlenir; ikinci kez kırpılmaz.
seslendir.py bir satırı yeniden üretirse işaret silinir, bu betik onu yeniden kırpar.
"""
import array
import json
import os
import subprocess
import sys
import tempfile

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SESSIZLER = ['h_b', 'h_c', 'h_cc', 'h_d', 'h_g', 'h_k', 'h_p', 'h_t']
EK_MS = 25      # sessizden sonra ünlüden kalan pay (0 = hiç ünlü yok)
ADIM = 5        # zarf çözünürlüğü (ms)


def zarf(yol):
    ham = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', yol, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                         capture_output=True, check=True).stdout
    a = array.array('h')
    a.frombytes(ham)
    n = 16 * ADIM
    return [(sum(x * x for x in a[i:i + n]) / n) ** 0.5 for i in range(0, len(a) - n, n)]


def kesim(env):
    """(başlangıç, vadi) indeksleri: vadi = sessizin tümseğinden sonra ünlü yükselmeden önceki en alçak nokta."""
    mx = max(env)
    on = next(i for i, e in enumerate(env) if e > mx * 0.05)
    tepe = on
    for i in range(on, min(len(env) - 1, on + 60)):
        if env[i] >= env[tepe]:
            tepe = i
        if i - on >= 8 and env[tepe] > mx * 0.2 and env[i] < env[tepe] * 0.75 and env[i + 1] > env[i]:
            return on, i
    return on, on + 20   # belirgin vadi yoksa: 100 ms


def kisalt(yol):
    on, vadi = kesim(zarf(yol))
    bas = max(0, on * ADIM - 20) / 1000
    son = (vadi * ADIM + EK_MS) / 1000
    sure = son - bas
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
        gecici = f.name
    try:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', yol, '-af',
                        f'atrim={bas:.3f}:{son:.3f},asetpts=N/SR/TB,afade=t=out:st={max(0, sure - 0.03):.3f}:d=0.03,apad=pad_dur=0.25',
                        '-ac', '1', '-ar', '24000', '-b:a', '64k', gecici], check=True)
        os.replace(gecici, yol)
    finally:
        if os.path.exists(gecici):
            os.remove(gecici)
    return int(sure * 1000)


def main():
    oyun = sys.argv[1] if len(sys.argv) > 1 else 'harf-perileri'
    ses = os.path.join(KOK, 'oyunlar', oyun, 'ses')
    liste_yolu = os.path.join(ses, 'liste.json')
    liste = json.load(open(liste_yolu, encoding='utf-8'))
    for k in SESSIZLER:
        yol = os.path.join(ses, k + '.mp3')
        if k not in liste or not os.path.exists(yol) or liste[k].get('kisaltildi'):
            continue
        ms = kisalt(yol)
        liste[k]['kisaltildi'] = EK_MS
        print(f'{k}: {ms} ms', flush=True)
    json.dump(dict(sorted(liste.items())), open(liste_yolu, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
