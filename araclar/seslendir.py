"""Oyunların hikâye ve karakter seslerini Gemini TTS ile bir kerelik kaydeder.

Kullanım (servis adresi ve API anahtarı depoya YAZILMAZ, ortam değişkenlerinden okunur):

    $env:TTS_URL = "https://.../v1/audio/speech"
    $env:TTS_API_KEY = "sk-..."
    python araclar/seslendir.py                  # bütün oyunlar
    python araclar/seslendir.py pasta-atolyesi   # tek oyun

Her oyunun index.html dosyasındaki SAY listesi (Köprü Ustası'nda ayrıca LEVELS ve ENDING) okunur,
her satır oyunlar/<oyun>/ses/<anahtar>.mp3 olarak kaydedilir.
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
OYUNLAR = os.path.join(KOK, 'oyunlar')
MODEL = 'gemini/gemini-3.1-flash-tts-preview/{}'
SESLER = {'anlatici': 'Zephyr', 'mila': 'Leda', 'kral': 'Puck', 'kralice': 'Aoede', 'bebek': 'Leda'}

EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿️‍⬀-⯿]')
SATIR = re.compile(r"""(\w+):\s*\['(\w+)',\s*(?:'([^']*)'|"([^"]*)")\]""")


def temizle(t):
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('↓', 'aşağı ok').replace('→', 'sağ ok').replace('←', 'sol ok')
    t = re.sub(r'(\d+) m\b', r'\1 metre', t)
    t = EMOJI.sub('', t)
    return re.sub(r'\s+', ' ', t).strip()


def satirlar(html):
    out = {}
    if 'const LEVELS = [' in html:
        blok = html[html.index('const LEVELS = ['):html.index('const ENDING')]
        for i, (hik, ipucu) in enumerate(re.findall(r'story:"(.*?)",\s*hint:\'(.*?)\'\}', blok, re.S)):
            out[f'story{i}'] = ('anlatici', hik)
            out[f'hint{i}'] = ('anlatici', ipucu)
        out['ending'] = ('anlatici', re.search(r'const ENDING = "(.*?)";', html).group(1))
    a = html.index('const SAY = {')
    for m in SATIR.finditer(html[a:html.index('\n};', a)]):
        out[m.group(1)] = (m.group(2), m.group(3) if m.group(3) is not None else m.group(4))
    return out


def uret(ses, url, key, anahtar, kim, metin):
    govde = json.dumps({'model': MODEL.format(SESLER[kim]), 'input': metin,
                        'language': 'Turkish', 'response_format': 'mp3'}).encode('utf-8')
    for deneme in range(4):
        try:
            req = urllib.request.Request(url, data=govde, method='POST', headers={
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
    hedef = os.path.join(ses, anahtar + '.mp3')
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


def seslendir(oyun, url, key):
    html = open(os.path.join(OYUNLAR, oyun, 'index.html'), encoding='utf-8').read()
    if 'const SAY = {' not in html:
        return
    ses = os.path.join(OYUNLAR, oyun, 'ses')
    os.makedirs(ses, exist_ok=True)
    liste_yolu = os.path.join(ses, 'liste.json')
    liste = json.load(open(liste_yolu, encoding='utf-8')) if os.path.exists(liste_yolu) else {}
    isler = {}
    for k, (kim, ham) in satirlar(html).items():
        metin = temizle(ham)
        ozet = hashlib.sha1(f'{SESLER[kim]}|{metin}'.encode('utf-8')).hexdigest()[:12]
        if liste.get(k, {}).get('ozet') == ozet and os.path.exists(os.path.join(ses, k + '.mp3')):
            continue
        isler[k] = (kim, metin, ozet)
    print(f'{oyun}: {len(isler)} satır seslendirilecek.', flush=True)
    with cf.ThreadPoolExecutor(4) as ex:
        fut = {ex.submit(uret, ses, url, key, k, kim, m): k for k, (kim, m, _) in isler.items()}
        for f in cf.as_completed(fut):
            k = fut[f]
            try:
                f.result()
                kim, m, ozet = isler[k]
                liste[k] = {'konusan': kim, 'ses': SESLER[kim], 'metin': m, 'ozet': ozet}
                print(f'✓ {oyun}/{k}', flush=True)
            except Exception as e:
                print(f'✗ {oyun}/{k}: {e}', flush=True)
    json.dump(dict(sorted(liste.items())), open(liste_yolu, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def main():
    url, key = os.environ.get('TTS_URL'), os.environ.get('TTS_API_KEY')
    if not url or not key:
        sys.exit('TTS_URL ve TTS_API_KEY ortam değişkenlerini ayarla.')
    oyunlar = sys.argv[1:] or sorted(d for d in os.listdir(OYUNLAR) if os.path.isfile(os.path.join(OYUNLAR, d, 'index.html')))
    for oyun in oyunlar:
        seslendir(oyun, url, key)
    print('bitti.')


if __name__ == '__main__':
    main()
