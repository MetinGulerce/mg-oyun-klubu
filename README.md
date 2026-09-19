# 🎈 MG Oyun Klübü

Minik oyuncular için tarayıcıda oynanan oyunlar. Kurulum yok; `index.html` dosyasını açmak ya da siteyi ziyaret etmek yeterli.

## Oyunlar

| Oyun | Açıklama |
|---|---|
| [🌉 Köprü Ustası](oyunlar/kopru-ustasi/) | Prenses Mila, doğum günü pastasını Gökkuşağı Şatosu'na yetiştirebilsin diye 10 durakta köprü kurar. Sesli hikâye, radyo, araba garajı ve süs dükkânı var. |

## Klasör yapısı

```
index.html                  kulübün giriş sayfası (oyun listesi)
oyunlar/<oyun>/index.html   her oyun kendi klasöründe, tek dosya
oyunlar/kopru-ustasi/ses/   hikâye ve karakter seslendirmeleri (MP3)
araclar/seslendir.py        seslendirmeleri Gemini TTS ile üreten betik
```

## Yeni oyun eklemek

1. `oyunlar/<yeni-oyun>/index.html` olarak oyunu ekle.
2. Giriş sayfasındaki (`index.html`) `OYUNLAR` listesine bir satır ekle.

## Seslendirme

Köprü Ustası'ndaki hikâye, ipucu ve karakter repliklerinin sesleri `oyunlar/kopru-ustasi/ses/` klasöründe hazır durur; oyun oynarken internet gerekmez.
Metinler değişirse yalnızca değişen satırlar yeniden üretilir:

```powershell
$env:TTS_API_KEY = "..."   # anahtar depoya yazılmaz
python araclar/seslendir.py
```

Seslendirilen metinler oyundaki `LEVELS` (hikâye ve ipuçları), `ENDING` ve `SAY` listelerinden okunur. Sesler: anlatıcı *Zephyr*, Mila *Leda*, kral *Puck*, kraliçe *Aoede*. Betik için `ffmpeg` gerekir.

## Radyo

Oyundaki 📻 **Mila FM** iki istasyonludur:

- **K-Pop:** KPop Demon Hunters şarkılarının Sony Pictures Animation kanalındaki resmi YouTube videolarını çalar. YouTube dosyadan (`file://`) açılan sayfalarda çalışmadığı için bu istasyon yalnızca site üzerinden açılınca çalar.
- **Pamuk Pop:** Oyunun kendi bestesi olan üç şarkı; internetsiz çalar.

## Kayıtlar

Oyun ilerlemesi tarayıcıda (`localStorage`) saklanır. Oyundaki ☰ Menü'den kayıt yuvalarına kaydedilebilir, dosyaya yedeklenebilir ya da sıfırdan başlanabilir.
