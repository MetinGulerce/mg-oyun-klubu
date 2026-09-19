"""Köprü Ustası hikâye ve karakter seslerini Gemini TTS ile bir kerelik kaydeder.

Kullanım (API anahtarı depoya YAZILMAZ, ortam değişkeninden okunur):

    set TTS_API_KEY=sk-...          (PowerShell: $env:TTS_API_KEY="sk-...")
    python araclar/seslendir.py

Oyundaki metinler (LEVELS içindeki story/hint, ENDING ve SAY listesi) okunur,
her satır oyunlar/kopru-ustasi/ses/<anahtar>.mp3 olarak kaydedilir.
Metni değişmeyen satırlar tekrar üretilmez (ses/liste.json içindeki özet ile karşılaştırılır).
"""
import concurrent.futures as cf
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.request

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OYUN = os.path.join(KOK, 'oyunlar', 'kopru-ustasi', 'index.html')
SES = os.path.join(KOK, 'oyunlar', 'kopru-ustasi', 'ses')
URL = os.environ.get('TTS_URL')
MODEL = 'gemini/gemini-3.1-flash-tts-preview/{}'
SESLER = {'anlatici': 'Zephyr', 'mila': 'Leda', 'kral': 'Puck', 'kralice': 'Aoede', 'bebek': 'Leda'}

EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️‍⬀-⯿]')


def temizle(t):
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('↓', 'aşağı ok').replace('→', 'sağ ok').replace('←', 'sol ok')
    t = re.sub(r'(\d+) m\b', r'\1 metre', t)
    t = EMOJI.sub('', t)
    return re.sub(r'\s+', ' ', t).strip()


def satirlar(html):
    out = {}
    blok = html[html.index('const LEVELS = ['):html.index('const ENDING')]
    for i, (hik, ipucu) in enumerate(re.findall(r'story:"(.*?)",\s*hint:\'(.*?)\'\}', blok, re.S)):
        out[f'story{i}'] = ('anlatici', hik)
        out[f'hint{i}'] = ('anlatici', ipucu)
    out['ending'] = ('anlatici', re.search(r'const ENDING = "(.*?)";', html).group(1))
    say = html[html.index('const SAY = {'):html.index('const HORN_TXT')]
    for k, kim, t in re.findall(r"(\w+):\s*\['(\w+)',\s*'([^']*)'\]", say):
        out[k] = (kim, t)
    return out


def uret(anahtar, kim, metin, key):
    govde = json.dumps({'model': MODEL.format(SESLER[kim]), 'input': metin,
                        'language': 'Turkish', 'response_format': 'mp3'}).encode('utf-8')
    for deneme in range(4):
        try:
            req = urllib.request.Request(URL, data=govde, method='POST', headers={
                'Content-Type': 'application/json', 'Authorization': f'Bearer {key}',
                'User-Agent': 'mg-oyun-klubu-seslendir/1.0', 'Accept': 'audio/*'})
            with urllib.request.urlopen(req, timeout=120) as r:
                veri = r.read()
            if len(veri) < 2000:
                raise RuntimeError(f'kısa yanıt ({len(veri)} bayt)')
            break
        except Exception as e:  # geçici hatalarda tekrar dene
            if deneme == 3:
                raise
            print(f'  {anahtar}: {e} — tekrar deneniyor', flush=True)
            time.sleep(3 * (deneme + 1))
    hedef = os.path.join(SES, anahtar + '.mp3')
    if veri[:3] == b'ID3' or veri[:2] in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
        with open(hedef, 'wb') as f:
            f.write(veri)
    else:  # servis WAV döndürüyor: ffmpeg ile MP3'e çevir
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            f.write(veri)
            gecici = f.name
        try:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', gecici, '-af', 'loudnorm=I=-16:TP=-1.5',
                            '-ac', '1', '-ar', '24000', '-b:a', '64k', hedef], check=True)
        finally:
            os.remove(gecici)
    return anahtar


def main():
    key = os.environ.get('TTS_API_KEY')
    if not key:
        sys.exit('TTS_API_KEY ortam değişkenini ayarla.')
    os.makedirs(SES, exist_ok=True)
    html = open(OYUN, encoding='utf-8').read()
    liste_yolu = os.path.join(SES, 'liste.json')
    liste = json.load(open(liste_yolu, encoding='utf-8')) if os.path.exists(liste_yolu) else {}
    isler = {}
    for k, (kim, ham) in satirlar(html).items():
        metin = temizle(ham)
        ozet = hashlib.sha1(f'{SESLER[kim]}|{metin}'.encode('utf-8')).hexdigest()[:12]
        if liste.get(k, {}).get('ozet') == ozet and os.path.exists(os.path.join(SES, k + '.mp3')):
            continue
        isler[k] = (kim, metin, ozet)
    print(f'{len(isler)} satır seslendirilecek.', flush=True)
    with cf.ThreadPoolExecutor(4) as ex:
        fut = {ex.submit(uret, k, kim, m, key): k for k, (kim, m, _) in isler.items()}
        for f in cf.as_completed(fut):
            k = fut[f]
            try:
                f.result()
                kim, m, ozet = isler[k]
                liste[k] = {'konusan': kim, 'ses': SESLER[kim], 'metin': m, 'ozet': ozet}
                print(f'✓ {k}', flush=True)
            except Exception as e:
                print(f'✗ {k}: {e}', flush=True)
    json.dump(dict(sorted(liste.items())), open(liste_yolu, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('bitti.')


if __name__ == '__main__':
    main()
