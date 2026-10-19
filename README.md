# 🎈 MG Oyun Klübü

Minik oyuncular için tarayıcıda oynanan oyunlar. Kurulum yok; `index.html` dosyasını açmak ya da siteyi ziyaret etmek yeterli. Oyunlar telefonda da (dik ya da yatay) oynanır.

## Oyunlar — Mila'nın Masalı

Oyunlar tek bir hikâyenin bölümleridir: Prenses Mila, unicorn Pamuk'un doğum günü için malzeme toplar, pastayı pişirir, fırtınanın yıktığı köprüleri kurup Gökkuşağı Şatosu'na yetişir.

| Bölüm | Oyun | Açıklama |
|---|---|---|
| 1 | [🧺 Orman ve Köy](oyunlar/orman-ve-koy/) | Kraliçe annenin listesindeki malzemeleri topla. Mila şatodan köye yürür, altı durakta yardım eder: 🍓 Çilek Tarlası (olgunları seç), 🧚 Peri Bahçesi (çiçeklerin ezgisini tekrar et, çikolata yağmurunu yakala), 🌾 Değirmen (buğday biç, kanatları çevir), 🐔 Kümes (tavukların altındaki yumurtalar), 🐄 Ahır (Benekli'yi besle, yayık salla), 🍬 Şekerci (renklere göre ayır). Sepet dolunca fırtına çıkar, kral baba Mila'yı faytonla eve götürür. Yolda kelebek, yıldız ve saklı hayvanlar (çıkartma albümü); yıldızlarla Prenses Butiği'nden elbise ve taç. |
| 2 | [🧁 Pasta Atölyesi](oyunlar/pasta-atolyesi/) | Şatonun mutfağında malzemeleri karıştır, pişir, krema sür, süsle, mumları üfle. Pamuk'un mektubundaki üç dileği yerine getir. |
| 3 | [🌉 Köprü Ustası](oyunlar/kopru-ustasi/) | 10 durakta köprü kurarak pastayı şatoya yetiştir. Malzemeler dört grupta (Yol, Kirişler, Halatlar, Yapılar); kule, destek noktası ve köprü ayağı eklenebilir. Köprüler arasındaki yolda bonus toplanır, engellerin üstünden zıplanır. |

Oyunlar aynı sitede çalıştığı için bilgileri paylaşır (tarayıcıdaki ortak anahtarlar):

- `mg-kulup-sepet`: Orman ve Köy'de dolan sepet. Pasta Atölyesi'nin hikâye kartında ve tezgâhında görünür.
- `mg-kulup-pasta`: Pasta Atölyesi'nde bitirilen pastanın resmi. Köprü Ustası'nda arabada görünür.
- `mg-kulup-mila`: Prenses Butiği'nde seçilen elbise ve taç. Mila bütün oyunlarda bu kıyafetle görünür.

Giriş sayfasındaki kartlar bu tarayıcıdaki ilerlemeyi gösterir (toplanan malzeme, yapılan pasta, geçilen köprü).

## Telefonda

- **Yerleşim:** Dik telefonda araçlar altta iki sıra, yatay telefonda ekranın iki yanında durur; oyun alanı büyür. Pencerelerin düğmeleri kısa ekranda da hep görünür.
- **Köprü Ustası:** Küçük ekranda köprü alanına yakın açılır. Noktalar parmak kadar geniş alandan tutulur; sürüklerken parmağın üstünde bir büyüteç hedefi gösterir, kenara gelince ekran kayar. Silgiyle parmak gezdirince yolundaki parçalar silinir, yapılar basılı tutup kaydırarak yerleştirilir. Dik tutulunca "yan çevir" önerisi çıkar.
- **Tam ekran:** Menüdeki ⛶ Tam ekran (Android). Safari'de Paylaş → Ana Ekrana Ekle ile kulüp, tarayıcı çubukları olmadan bir uygulama gibi açılır (`manifest.webmanifest`, simgeler `ikonlar/`). iPhone'da ana ekrandaki uygulamanın kayıtları Safari'dekinden ayrı tutulur.

## Klasör yapısı

```
index.html                  kulübün giriş sayfası (oyun listesi)
manifest.webmanifest        ana ekrana eklenince uygulama gibi açılması için
ikonlar/                    ana ekran simgeleri
oyunlar/<oyun>/index.html   her oyun kendi klasöründe, tek dosya
oyunlar/<oyun>/ses/         hikâye ve karakter seslendirmeleri (MP3)
ortak/mila-fm.js            oyunların ortak radyosu (Mila FM)
ortak/mobil.js              telefon yardımcıları (tam ekran, "yan çevir" önerisi, sayfa büyümesini engelleme)
ortak/mila-gorunum.js       butikte seçilen elbise ve tacı bütün oyunlarda çizer
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
python araclar/seslendir.py orman-ve-koy     # tek oyun
```

Seslendirilen metinler her oyundaki `SAY` listesinden (Köprü Ustası'nda ayrıca `LEVELS` ve `ENDING`) okunur. Sesler: anlatıcı *Zephyr*, Mila *Leda*, kral *Puck*, kraliçe *Aoede*, Peri Işıltı *Laomedeia*, değirmenci Fındık *Fenrir*, Nine *Gacrux*, Lale Teyze *Sulafat*. Betik için `ffmpeg` gerekir.

## Radyo

Oyunlardaki 📻 **Mila FM** iki istasyonludur:

- **K-Pop:** KPop Demon Hunters şarkılarının Sony Pictures Animation kanalındaki resmi YouTube videolarını çalar. YouTube dosyadan (`file://`) açılan sayfalarda çalışmadığı için bu istasyon yalnızca site üzerinden açılınca çalar.
- **Pamuk Pop:** Oyunun kendi bestesi olan üç şarkı; internetsiz çalar.

## Kayıtlar

Oyun ilerlemesi tarayıcıda (`localStorage`) saklanır. Köprü Ustası'nın ☰ Menü'sünden kayıt yuvalarına kaydedilebilir, dosyaya yedeklenebilir ya da sıfırdan başlanabilir. Orman ve Köy'de baştan başlamak sepeti boşaltır; yıldızlar, çıkartmalar ve alınan elbiseler kalır.
