# Ekran görüntüleri — çekim talimatı

`src/data/projects.js` bu klasördeki üç dosyayı bekliyor. Hiçbiri henüz yok;
görselsiz projeleri vitrin ve galeri atladığı için site şu an da çalışıyor,
ama vitrinin dördüncü kutusu bu dosyalar gelene kadar boş kalıyor.

| Dosya | Proje | Nerede görünecek |
|---|---|---|
| `sarteks.jpg` | Sarteks Makina | Vitrin — 3. sıra |
| `ardekostudios.jpg` | ardekostudios.com | Vitrin — 4. sıra |
| `ardaguner.jpg` | ardaguner.com | Galeri |

## Hepsi için ortak

- **Ölçü:** 1600 × 1000 px (16:10). Vitrin kutuları bunu kırpar, galeri
  tam kullanır. Daha büyük çekip küçültmek sorun değil, daha küçük olmasın.
- **Format:** JPEG, kalite ~82. Hedef dosya boyutu 150–250 KB.
  `/games/*.jpg` dosyaları 30–47 KB bandında; bunlar biraz daha ağır olabilir
  çünkü ekran görüntüsünde metin var, fazla sıkıştırma metni bulandırır.
- **Tarayıcı:** pencereyi 1600 × 1000'e ayarla, sonra tam sayfa değil
  **görünür alan** (viewport) görüntüsü al. Uzun sayfanın tamamını almak,
  kutuya sığdırıldığında okunmaz bir şerit üretiyor.
- **Tarayıcı çerçevesi olmasın.** Sekme çubuğu, adres çubuğu, imleç, eklenti
  ikonu görünmesin. Chrome'da `F12 → Ctrl+Shift+P → "Capture screenshot"`
  temiz sonuç verir.
- **Karanlık mod / açık mod:** sitenin kendi varsayılanı neyse o. Zorlama.
- **Dil:** üçü de Türkçe hâliyle çekilsin. Site iki dilli ama görseli
  dile göre değiştirmek iki kat dosya demek, kazancı yok.

## Kare kare ne görünsün

**sarteks.jpg** — Ana sayfanın hero'su. Bu projenin satış noktası kurumsal
ciddiyet ve 10 dil desteği; o yüzden dil seçici görünür durumdaysa iyi olur.
Ürün fotoğrafı ya da makine görseli kadrajın içinde kalsın, boş beyaz bir
alan gelmesin.

**ardekostudios.jpg** — Oyun kartlarının olduğu bölüm, hero değil. Hero tek
başına "bir logo ve bir başlık" gibi duruyor; kartlı bölüm hem daha dolu hem
de stüdyonun ne yaptığını tek karede anlatıyor. 2–3 oyun kartı kadraja
sığsın, yarım kalan kart olmasın.

**ardaguner.jpg** — **Yeni tasarım bitmeden çekme.** Şu anki hâlini koymak,
"eski siteyi yenilediğini" anlatmak yerine eski siteyi vitrine koymak olur.
Bu dosyayı en sona bırakıyoruz; yeni ana sayfa ayağa kalkınca hero'sundan
çekilecek.

## Sonra

Dosyaları buraya bırakman yeterli, `projects.js` yolları zaten yazılı:
`/shots/sarteks.jpg`, `/shots/ardekostudios.jpg`, `/shots/ardaguner.jpg`.
