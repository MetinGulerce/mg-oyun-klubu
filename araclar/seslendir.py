"""Oyunların hikâye ve karakter seslerini Gemini TTS ile bir kerelik kaydeder.

Kullanım (servis adresi ve API anahtarı depoya YAZILMAZ, ortam değişkenlerinden okunur):

    $env:TTS_URL = "https://.../v1/audio/speech"     # 9router (OpenAI uyumlu /audio/speech)
    $env:TTS_API_KEY = "sk-..."
    python araclar/seslendir.py                  # bütün oyunlar
    python araclar/seslendir.py pasta-atolyesi   # tek oyun

Yedek yol: depo kökündeki .env dosyasında (git dışında) GEMINI_TTS_API_KEY varsa, 9router hata verince
aynı satır doğrudan Google Gemini API'den alınır. TTS_URL hiç yoksa yalnızca Google kullanılır;
TTS_KAYNAK=google ile 9router atlanır, TTS_KAYNAK=9router ile Google'a hiç düşülmez. Google'ın ücretsiz
katmanı model başına günde 10 istek verir; günlük kota dolduysa beklemeden vazgeçilir, dakikalık sınırda beklenir.
TTS_MODEL ile model değiştirilir (varsayılan 3.1; 2.5 için 'gemini/gemini-2.5-flash-preview-tts/{}');
varsayılan dışı model liste.json'a "model" olarak yazılır.

Her oyunun index.html dosyasındaki SAY listesi (Köprü Ustası'nda ayrıca LEVELS ve ENDING) okunur,
her satır oyunlar/<oyun>/ses/<anahtar>.mp3 olarak kaydedilir.
Metni değişmeyen satırlar tekrar üretilmez (ses/liste.json içindeki özet ile karşılaştırılır).
"""
import base64
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
VARSAYILAN_MODEL = 'gemini/gemini-3.1-flash-tts-preview/{}'
MODEL = os.environ.get('TTS_MODEL', VARSAYILAN_MODEL)
GOOGLE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent'


def dotenv(ad):
    """Depo kökündeki .env dosyasından tek bir değeri okur (dosya git dışındadır)."""
    if os.environ.get(ad):
        return os.environ[ad]
    yol = os.path.join(KOK, '.env')
    if not os.path.exists(yol):
        return None
    for satir in open(yol, encoding='utf-8'):
        k, _, v = satir.strip().partition('=')
        if k.strip() == ad:
            return v.strip().strip('"').strip("'") or None
    return None
SESLER = {'anlatici': 'Zephyr', 'mila': 'Leda', 'kral': 'Puck', 'kralice': 'Aoede', 'bebek': 'Leda',
          'peri': 'Laomedeia', 'findik': 'Fenrir', 'nine': 'Gacrux', 'lale': 'Sulafat'}

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


def mp3_yaz(hedef, veri, ham_pcm=False):
    """Gelen sesi mp3 olarak kaydeder: mp3 ise olduğu gibi, WAV/PCM ise ffmpeg ile çevirerek."""
    if not ham_pcm and (veri[:3] == b'ID3' or veri[:2] in (b'\xff\xfb', b'\xff\xf3', b'\xff\xf2')):
        with open(hedef, 'wb') as f:
            f.write(veri)
        return
    with tempfile.NamedTemporaryFile(suffix='.pcm' if ham_pcm else '.wav', delete=False) as f:
        f.write(veri)
        gecici = f.name
    try:
        giris = ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', gecici] if ham_pcm else ['-i', gecici, '-af', 'loudnorm=I=-16:TP=-1.5']
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *giris, '-ac', '1', '-ar', '24000', '-b:a', '64k', hedef], check=True)
    finally:
        os.remove(gecici)


def uret_9router(url, key, anahtar, kim, metin, deneme_sayisi=4):
    govde = json.dumps({'model': MODEL.format(SESLER[kim]), 'input': metin,
                        'language': 'Turkish', 'response_format': 'mp3'}).encode('utf-8')
    for deneme in range(deneme_sayisi):
        try:
            req = urllib.request.Request(url, data=govde, method='POST', headers={
                'Content-Type': 'application/json', 'Authorization': f'Bearer {key}',
                'User-Agent': 'mg-oyun-klubu-seslendir/1.0', 'Accept': 'audio/*'})
            with urllib.request.urlopen(req, timeout=120) as r:
                veri = r.read()
            if len(veri) < 2000:
                raise RuntimeError(f'kısa yanıt ({len(veri)} bayt)')
            return veri
        except Exception as e:  # geçici hatalarda tekrar dene
            if deneme == deneme_sayisi - 1:
                raise
            print(f'  {anahtar}: {e} — tekrar deneniyor', flush=True)
            time.sleep(3 * (deneme + 1))


def uret_google(gkey, anahtar, kim, metin):
    """Doğrudan Gemini API: PCM (16 bit, 24 kHz, tek kanal) döner."""
    model = MODEL.format('').split('/')[1]
    govde = json.dumps({'contents': [{'parts': [{'text': metin}]}], 'generationConfig': {
        'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': SESLER[kim]}}}}}).encode('utf-8')
    for deneme in range(6):
        try:
            req = urllib.request.Request(GOOGLE_URL.format(model), data=govde, method='POST', headers={
                'Content-Type': 'application/json', 'x-goog-api-key': gkey, 'User-Agent': 'mg-oyun-klubu-seslendir/1.0'})
            with urllib.request.urlopen(req, timeout=120) as r:
                yanit = json.load(r)
            parca = yanit['candidates'][0]['content']['parts'][0]['inlineData']
            if not parca['mimeType'].lower().startswith('audio/l16'):
                raise RuntimeError('beklenmeyen ses biçimi ' + parca['mimeType'])
            return base64.b64decode(parca['data'])
        except Exception as e:
            kota = getattr(e, 'code', None) == 429
            if kota:
                govde_hata = e.read().decode('utf-8', 'replace') if hasattr(e, 'read') else ''
                if 'PerDay' in govde_hata:   # günlük kota: beklemenin anlamı yok
                    m = re.search(r'retry in ([0-9hms.]+)', govde_hata)
                    raise RuntimeError('Google günlük kotası doldu' + (f' ({m.group(1)} sonra açılır)' if m else ''))
            if deneme == 5:
                raise
            print(f'  {anahtar}: google {e} — {"dakikalık kota, " if kota else ""}tekrar deneniyor', flush=True)
            time.sleep((20 if kota else 3) * (deneme + 1))


def uret(ses, url, key, anahtar, kim, metin):
    """Önce 9router, olmazsa (ya da hiç yoksa) doğrudan Google."""
    hedef = os.path.join(ses, anahtar + '.mp3')
    gkey = dotenv('GEMINI_TTS_API_KEY')
    if url and key and os.environ.get('TTS_KAYNAK') != 'google':
        try:
            mp3_yaz(hedef, uret_9router(url, key, anahtar, kim, metin, 2 if gkey else 4))
            return
        except Exception as e:
            if not gkey or os.environ.get('TTS_KAYNAK') == '9router':
                raise
            print(f'  {anahtar}: 9router olmadı ({e}), doğrudan Google deneniyor', flush=True)
    if not gkey:
        raise RuntimeError('ne 9router ne GEMINI_TTS_API_KEY var')
    if os.environ.get('TTS_KAYNAK') == '9router':
        raise RuntimeError('TTS_KAYNAK=9router ama TTS_URL/TTS_API_KEY yok')
    mp3_yaz(hedef, uret_google(gkey, anahtar, kim, metin), ham_pcm=True)


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
    google_yolu = os.environ.get('TTS_KAYNAK') == 'google' or not (url and key)   # Google'ın dakikalık sınırı için tek sıra
    with cf.ThreadPoolExecutor(1 if google_yolu else 4) as ex:
        fut = {ex.submit(uret, ses, url, key, k, kim, m): k for k, (kim, m, _) in isler.items()}
        for f in cf.as_completed(fut):
            k = fut[f]
            try:
                f.result()
                kim, m, ozet = isler[k]
                liste[k] = {'konusan': kim, 'ses': SESLER[kim], 'metin': m, 'ozet': ozet}
                if MODEL != VARSAYILAN_MODEL:
                    liste[k]['model'] = MODEL.format('')   # varsayılan model dışıyla üretildi
                print(f'✓ {oyun}/{k}', flush=True)
            except Exception as e:
                print(f'✗ {oyun}/{k}: {e}', flush=True)
    json.dump(dict(sorted(liste.items())), open(liste_yolu, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def main():
    url, key = os.environ.get('TTS_URL'), os.environ.get('TTS_API_KEY')
    if not (url and key) and not dotenv('GEMINI_TTS_API_KEY'):
        sys.exit('TTS_URL ve TTS_API_KEY ortam değişkenlerini ayarla ya da .env dosyasına GEMINI_TTS_API_KEY yaz.')
    oyunlar = sys.argv[1:] or sorted(d for d in os.listdir(OYUNLAR) if os.path.isfile(os.path.join(OYUNLAR, d, 'index.html')))
    for oyun in oyunlar:
        seslendir(oyun, url, key)
    print('bitti.')


if __name__ == '__main__':
    main()
