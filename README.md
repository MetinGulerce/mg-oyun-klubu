# 🎈 MG Oyun Klübü

Minik oyuncular için tarayıcıda oynanan oyunlar. Kurulum yok; `index.html` dosyasını açmak ya da siteyi ziyaret etmek yeterli. Oyunlar telefonda da (dik ya da yatay) oynanır.

## Oyunlar — Mila'nın Masalı

Oyunlar tek bir hikâyenin bölümleridir: Prenses Mila, unicorn Pamuk'un doğum günü için malzeme toplar, pastayı pişirir, fırtınanın yıktığı köprüleri kurup Gökkuşağı Şatosu'na yetişir. Doğum gününde Pamuk'un hediyesi sihirli bir kitaptır: Harf Perileri.

| Bölüm | Oyun | Açıklama |
|---|---|---|
| 1 | [🧺 Orman ve Köy](oyunlar/orman-ve-koy/) | Kraliçe annenin listesindeki malzemeleri topla. Mila şatodan köye yürür, altı durakta yardım eder: 🍓 Çilek Tarlası (olgunları seç), 🧚 Peri Bahçesi (çiçeklerin ezgisini tekrar et, çikolata yağmurunu yakala), 🌾 Değirmen (buğday biç, kanatları çevir), 🐔 Kümes (tavukların altındaki yumurtalar), 🐄 Ahır (Benekli'yi besle, yayık salla), 🍬 Şekerci (renklere göre ayır). Sepet dolunca fırtına çıkar, kral baba Mila'yı faytonla eve götürür. Yolda kelebek, yıldız ve saklı hayvanlar (çıkartma albümü); yıldızlarla Prenses Butiği'nden elbise ve taç. |
| 2 | [🧁 Pasta Atölyesi](oyunlar/pasta-atolyesi/) | Şatonun mutfağında malzemeleri karıştır, pişir, krema sür, süsle, mumları üfle. Pamuk'un mektubundaki üç dileği yerine getir. |
| 3 | [🌉 Köprü Ustası](oyunlar/kopru-ustasi/) | 10 durakta köprü kurarak pastayı şatoya yetiştir. Malzemeler dört grupta (Yol, Kirişler, Halatlar, Yapılar); kule, destek noktası ve köprü ayağı eklenebilir. Köprüler arasındaki yolda bonus toplanır, engellerin üstünden zıplanır. |
| 4 | [🧚 Harf Perileri](oyunlar/harf-perileri/) | Kitaptan uçan harf perilerini bul. Peri Bahçesi'nde 15 durak: önce harfle tanış (harfin adı değil sesi: "mmm"), Ses Avı'nda sesi duyup doğru periyi bul, Gökkuşağı Kaydırağı'nda Mila'yı kaydırıp sesleri heceye birleştir ("mmm-aaa → ma"), sonra resimdeki kelimeyi yaz (MAMA, LAMA, MİLA, BABA, ELMA, ANNE, KEK…). Bilgisayarda gerçek klavyeyle, telefonda büyük harf düğmeleriyle oynanır; ekrandaki klavye Türkçe Q düzenindedir. Serbest Klavye'de her tuş kendi sesini söyler. Anne-baba köşesinde hangi harfin öğrenildiği görünür. |

Oyunlar aynı sitede çalıştığı için bilgileri paylaşır (tarayıcıdaki ortak anahtarlar):

- `mg-kulup-sepet`: Orman ve Köy'de dolan sepet. Pasta Atölyesi'nin hikâye kartında ve tezgâhında görünür.
- `mg-kulup-pasta`: Pasta Atölyesi'nde bitirilen pastanın resmi. Köprü Ustası'nda arabada görünür.
- `mg-kulup-mila`: Prenses Butiği'nde seçilen elbise ve taç. Mila bütün oyunlarda bu kıyafetle görünür.

Mila'nın çizgi resmi `ortak/resim/` klasöründedir (`mila-prenses.webp` portre, `mila-yuz.webp` yuvarlak yüz). Oyunlarda çizilen prenses de gerçek Mila gibi koyu kahve saçlı ve iki atkuyrukludur (`ortak/mila-gorunum.js`).

Harf Perileri'nin arka planları `ortak/resim/sahne/` klasöründedir: harita kale bahçesi, peri tanışması çardak, ses avı teras, kaydırak göl kenarı, kelime yazma şato salonu, serbest klavye balkon. Harfler okumayı öğrenen çocuklar için çizilmiş **Andika** yazı tipiyle gösterilir (İ ile I, b ile d net ayrılır).

Giriş sayfasındaki kartlar bu tarayıcıdaki ilerlemeyi gösterir (toplanan malzeme, yapılan pasta, geçilen köprü).

## Telefonda

- **Yerleşim:** Dik telefonda araçlar altta iki sıra, yatay telefonda ekranın iki yanında durur; oyun alanı büyür. Pencerelerin düğmeleri kısa ekranda da hep görünür.
- **Köprü Ustası:** Küçük ekranda köprü alanına yakın açılır. Noktalar parmak kadar geniş alandan tutulur; sürüklerken parmağın üstünde bir büyüteç hedefi gösterir, kenara gelince ekran kayar. Silgiyle parmak gezdirince yolundaki parçalar silinir, yapılar basılı tutup kaydırarak yerleştirilir. Dik tutulunca "yan çevir" önerisi çıkar.
- **Tam ekran:** Telefonda oyuna ilk dokunuşta tarayıcı çubukları kendiliğinden gizlenir; her oyunun başlığındaki ⛶ düğmesi tam ekranı açıp kapatır (düğmeyle çıkılırsa o oturumda bir daha zorlanmaz). iPhone Safari sayfalara tam ekran izni vermediği için düğme orada ana ekrana eklemeyi anlatır. Safari'de Paylaş → Ana Ekrana Ekle ile kulüp, tarayıcı çubukları olmadan bir uygulama gibi açılır (`manifest.webmanifest`, simgeler `ikonlar/`). iPhone'da ana ekrandaki uygulamanın kayıtları Safari'dekinden ayrı tutulur.

## Klasör yapısı

```
index.html                  kulübün giriş sayfası (oyun listesi)
manifest.webmanifest        ana ekrana eklenince uygulama gibi açılması için
ikonlar/                    ana ekran simgeleri
oyunlar/<oyun>/index.html   her oyun kendi klasöründe, tek dosya
oyunlar/<oyun>/ses/         hikâye ve karakter seslendirmeleri (MP3)
ortak/mila-fm.js            oyunların ortak radyosu (Mila FM)
ortak/mobil.js              telefon yardımcıları (tam ekran, "yan çevir" önerisi, sayfa büyümesini engelleme)
ortak/mila-gorunum.js       butikte seçilen elbise ve tacı, Mila'nın saçını bütün oyunlarda çizer
ortak/resim/                Mila'nın prenses portresi ve yüzü
ortak/resim/sahne/          kale bahçesi konsept resimlerinden kesilmiş sahneler (arka planlar)
araclar/seslendir.py        seslendirmeleri Gemini TTS ile üreten betik
araclar/sessiz-kisalt.py    kısacık sessizlerin ("bı" → "b") seslerini kırpan betik
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

Harf Perileri'nde ses dosyası olmayan satırda oyun sessiz kalır; tarayıcının kendi sesi kullanılmaz (harf seslerini yanlış okur: "mmm" yerine "mi mi"). Harf sesleri `h_`, heceler `s_`, kelimeler `w_` ile başlar.

Servis b, k, t gibi kısacık sesleri tek başına söyleyemez, hep "bı, kı" der. Bu yüzden Harf Perileri'nin sesleri üretildikten sonra `python araclar/sessiz-kisalt.py harf-perileri` çalıştırılır: kayıtta sessizin patlamasını bulur, ünlü başlamadan keser. Harf Perileri'nde bütün satırları hikâye anlatıcısı (*Zephyr*) okur. Servis yalnızca "eeeee" yazılınca e'yi ı'ya kaydırıyor; bu yüzden bütün ünlüler (A E I İ O Ö U Ü) İngilizce talimatla ("Say only the Turkish vowel 'e' as in 'el', held long and steady...") birkaç aday üretilip formantları ölçülerek en temizi seçildi ve ilk 1,4 saniyesi alındı (`liste.json`'da `elle` notu); seslendir.py onları yeniden üretmez. Kelime yazılınca önce harfler yavaşça uzatılarak ("nnn-iii-nnn-eee"), sonra kelime bir kere normal hızla okunur.

Seslendirilen metinler her oyundaki `SAY` listesinden (Köprü Ustası'nda ayrıca `LEVELS` ve `ENDING`) okunur. Sesler: anlatıcı *Zephyr*, Mila *Leda*, kral *Puck*, kraliçe *Aoede*, Peri Işıltı *Laomedeia*, değirmenci Fındık *Fenrir*, Nine *Gacrux*, Lale Teyze *Sulafat*. Betik için `ffmpeg` gerekir.

## Radyo

Oyunlardaki 📻 **Mila FM** iki istasyonludur:

- **K-Pop:** KPop Demon Hunters şarkılarının Sony Pictures Animation kanalındaki resmi YouTube videolarını çalar. YouTube dosyadan (`file://`) açılan sayfalarda çalışmadığı için bu istasyon yalnızca site üzerinden açılınca çalar.
- **Pamuk Pop:** Oyunun kendi bestesi olan üç şarkı; internetsiz çalar.

## Kayıtlar

Oyun ilerlemesi tarayıcıda (`localStorage`) saklanır. Köprü Ustası'nın ☰ Menü'sünden kayıt yuvalarına kaydedilebilir, dosyaya yedeklenebilir ya da sıfırdan başlanabilir. Orman ve Köy'de baştan başlamak sepeti boşaltır; yıldızlar, çıkartmalar ve alınan elbiseler kalır.
