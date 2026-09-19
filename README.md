# 🎈 MG Oyun Klübü

Minik oyuncular için tarayıcıda oynanan oyunlar. Kurulum yok; `index.html` dosyasını açmak ya da siteyi ziyaret etmek yeterli.

## Oyunlar — Mila'nın Masalı

Oyunlar tek bir hikâyenin bölümleridir: Prenses Mila, unicorn Pamuk'un doğum günü için malzeme toplar, pastayı pişirir, fırtınanın yıktığı köprüleri kurup Gökkuşağı Şatosu'na yetişir.

| Bölüm | Oyun | Açıklama |
|---|---|---|
| 1 | Orman ve Köy *(yakında)* | Fırtınadan önce ormandan ve köyden malzeme toplama. |
| 2 | [🧁 Pasta Atölyesi](oyunlar/pasta-atolyesi/) | Şatonun mutfağında malzemeleri karıştır, pişir, krema sür, süsle, mumları üfle. Pamuk'un mektubundaki üç dileği yerine getir. |
| 3 | [🌉 Köprü Ustası](oyunlar/kopru-ustasi/) | 10 durakta köprü kurarak pastayı şatoya yetiştir. Malzemeler dört grupta (Yol, Kirişler, Halatlar, Yapılar); kule, destek noktası ve köprü ayağı eklenebilir. Köprüler arasındaki yolda bonus toplanır, engellerin üstünden zıplanır. Pasta Atölyesi'nde yapılan pasta arabada görünür. |

Oyunlar aynı sitede çalıştığı için bilgileri paylaşır: Pasta Atölyesi'nde bitirilen pastanın resmi `mg-kulup-pasta` anahtarıyla tarayıcıya kaydedilir, Köprü Ustası onu okur.

## Klasör yapısı

```
index.html                  kulübün giriş sayfası (oyun listesi)
oyunlar/<oyun>/index.html   her oyun kendi klasöründe, tek dosya
oyunlar/<oyun>/ses/         hikâye ve karakter seslendirmeleri (MP3)
ortak/mila-fm.js            oyunların ortak radyosu (Mila FM)
araclar/seslendir.py        seslendirmeleri Gemini TTS ile üreten betik
```

## Yeni oyun eklemek

1. `oyunlar/<yeni-oyun>/index.html` olarak oyunu ekle.
2. Giriş sayfasındaki (`index.html`) `OYUNLAR` listesine bir satır ekle.

## Seslendirme

Hikâye, ipucu ve karakter repliklerinin sesleri her oyunun `ses/` klasöründe hazır durur; oyun oynarken seslendirme servisine bağlanılmaz.
Metinler değişirse yalnızca değişen satırlar yeniden üretilir:

```powershell
$env:TTS_URL = "..."       # servis adresi ve anahtar depoya yazılmaz
$env:TTS_API_KEY = "..."
python araclar/seslendir.py                  # bütün oyunlar
python araclar/seslendir.py pasta-atolyesi   # tek oyun
```

Seslendirilen metinler her oyundaki `SAY` listesinden (Köprü Ustası'nda ayrıca `LEVELS` ve `ENDING`) okunur. Sesler: anlatıcı *Zephyr*, Mila *Leda*, kral *Puck*, kraliçe *Aoede*. Betik için `ffmpeg` gerekir.

## Radyo

Oyunlardaki 📻 **Mila FM** (`ortak/mila-fm.js`) iki istasyonludur:

- **K-Pop:** KPop Demon Hunters şarkılarının Sony Pictures Animation kanalındaki resmi YouTube videolarını çalar. YouTube dosyadan (`file://`) açılan sayfalarda çalışmadığı için bu istasyon yalnızca site üzerinden açılınca çalar.
- **Pamuk Pop:** Oyunun kendi bestesi olan üç şarkı; internetsiz çalar.

## Kayıtlar

Oyun ilerlemesi tarayıcıda (`localStorage`) saklanır. Oyundaki ☰ Menü'den kayıt yuvalarına kaydedilebilir, dosyaya yedeklenebilir ya da sıfırdan başlanabilir.
