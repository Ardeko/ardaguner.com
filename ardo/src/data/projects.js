/* ------------------------------------------------------------------
   Proje kataloğu — tek kaynak.

   Buradaki hiçbir alan çevrilmez: yıl, ay, kategori, durum, platform,
   teknoloji ve linkler iki dilde de aynıdır. Çevrilen metin (başlık +
   açıklama) `locales/{tr,en}.json` içinde `projectItems[id]` altında
   durur. Sitenin mevcut deseni bu: metin locale dosyasında, yapı kodda.

   KAYNAKLAR — hepsi doğrulandı, uydurma tarih yok:
   - ardekostudios.com/src/lib/journey.js
     GitHub repo oluşturma tarihleriyle doğrulanmış 16 kilometre taşı.
   - ardekostudios.com/src/components/Games.jsx
     Oyun linkleri, platformlar, yayın durumu.
   - Yerel repoların ilk commit tarihleri (~/Desktop/projects/*):
     kk 2026-06-15 · skyline_swinger 2026-06-22 · torpidodan 2026-08-11
   - Bu reponun git geçmişi:
     apex-shift.html ve forza-orbit.html 2026-08-05'te public/ altına
     eklendi · switch-master/ 2026-05-06.

   İŞARETLİ ALANLAR
   - `unverified: true` → tarih dolaylı kanıta dayanıyor (klasör mtime
     ya da siteye eklenme tarihi). Arda onaylayınca bayrak silinir.
   - `image: null` → henüz görsel yok. Vitrin ve galeri bölümleri
     görselsiz projeyi atlar, kırık resim çıkmaz.
   - `/games/*` → Ardeko sitesinden gelen oyun görselleri, hazır.
   - `/shots/*` → HENÜZ YOK. Arda'nın alacağı ekran görüntüleri;
     ölçü ve çerçeveleme talimatı `public/shots/README.md` içinde.
------------------------------------------------------------------- */

const GH = 'https://github.com/Ardeko';

/** Rozet ve filtre çubuğunun kullandığı kategoriler. */
export const CATEGORIES = ['game', 'app', 'web', 'corporate', 'rnd'];

/**
 * Durumlar:
 *  live       — canlı ve erişilebilir (mağaza, tarayıcı ya da alan adı)
 *  source     — kaynak kodu açık, canlı bir sürümü yok
 *  wip        — geliştiriliyor, henüz yayında değil
 *  restricted — telif nedeniyle paylaşılmıyor
 */
export const STATUSES = ['live', 'source', 'wip', 'restricted'];

export const PROJECTS = [
  {
    id: 'unichain',
    // Arda'nın notu: katalogdaki en eski proje. Ne repo oluşturma tarihi
    // ne de kilometre taşı kaydı var, bu yüzden ay bilinmiyor — çizelgede
    // 2023'ün başına, Protocol'ün önüne oturuyor. Kesin tarih gelirse
    // ay güncellenip `unverified` silinecek.
    year: 2023,
    month: 1,
    category: 'app',
    status: 'source',
    platforms: 'WEB',
    tech: ['Blockchain'],
    image: null,
    unverified: true,
    links: { github: `${GH}/unichain` },
  },
  {
    id: 'protocol',
    year: 2023,
    month: 7,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['JavaScript', 'HTML5 Canvas'],
    image: null,
    links: { github: `${GH}/protocol` },
  },
  {
    id: 'ardobot',
    year: 2023,
    month: 8,
    category: 'app',
    status: 'source',
    platforms: 'DISCORD',
    tech: ['Node.js', 'Discord.js', 'AI'],
    image: null,
    links: { github: `${GH}/ardobot` },
  },
  {
    id: 'teknofest',
    year: 2023,
    category: 'rnd',
    status: 'source',
    platforms: 'EMBEDDED',
    tech: ['Python', 'OpenCV'],
    image: null,
    // Takım reposu — mevcut sitede de bu adres kullanılıyordu, korundu.
    links: { github: 'https://github.com/EVA-Submarine-Team' },
  },
  {
    id: 'wordeko',
    year: 2024,
    month: 4,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['JavaScript'],
    image: null,
    links: { github: `${GH}/wordeko` },
  },
  {
    id: 'legendOfRey',
    year: 2024,
    category: 'game',
    status: 'source',
    platforms: 'DESKTOP',
    tech: ['Python', 'Pygame'],
    // Arda'nın gönderdiği anahtar görsel (LORE — Echoes). Kaynak 1536x1024
    // PNG'ydi; 1080x720 JPEG'e indirildi (2 MB → 137 KB). Diğer oyun
    // görselleri 720x480, bu vitrinde büyük bastığı için iki katı.
    image: '/games/legend-of-rey.jpg',
    // Forza Orbit'ten devraldığı 4. sıra: katalogdaki tek gerçek "oyun
    // yapımı" işi ve elde tek düzgün anahtar görsel bunda.
    featured: 4,
    links: { github: `${GH}/Legend-Of-Rey` },
  },
  {
    id: 'renault',
    year: 2024,
    category: 'corporate',
    status: 'restricted',
    platforms: 'MOBILE',
    // Stack bilinmiyor — uydurmak yerine boş bırakıldı.
    tech: [],
    image: null,
    links: {},
  },
  {
    id: 'ardaguner',
    year: 2024,
    month: 11,
    category: 'web',
    status: 'live',
    platforms: 'WEB',
    tech: ['React', 'Vite'],
    image: '/shots/ardaguner.jpg',
    links: { github: `${GH}/ardaguner.com`, live: 'https://ardaguner.com' },
  },
  {
    id: 'stok',
    year: 2025,
    month: 6,
    category: 'corporate',
    status: 'source',
    platforms: 'WEB',
    tech: ['C#', 'ASP.NET Core MVC', 'MSSQL'],
    image: null,
    links: { github: `${GH}/StokEkstresiApp` },
  },
  {
    id: 'revo',
    year: 2025,
    month: 7,
    category: 'app',
    status: 'live',
    platforms: 'WEB · WINDOWS',
    tech: ['SignalR', 'WebRTC', 'React'],
    image: '/games/revo.jpg',
    featured: 1,
    links: {
      live: 'https://ardekostudios.xyz',
      // Kalıcı adres: her zaman en son sürümü indirir, yeni release
      // çıkınca burayı güncellemek gerekmez.
      download: `${GH}/Revo/releases/latest/download/REVO-Setup.exe`,
      github: `${GH}/Revo`,
    },
  },
  {
    id: 'nebula',
    year: 2025,
    month: 7,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['React', 'Phaser 3', 'FastAPI', 'MongoDB'],
    image: null,
    links: { github: `${GH}/Nebula` },
  },
  {
    id: 'switchMaster',
    year: 2026,
    month: 5,
    category: 'game',
    status: 'live',
    platforms: 'IOS · ANDROID',
    tech: ['Unity', 'iOS', 'Android'],
    image: '/games/switch.jpg',
    featured: 2,
    links: {
      appStore: 'https://apps.apple.com/tr/app/switch-master-railway/id6770972534?l=tr',
      googlePlay:
        'https://play.google.com/store/apps/details?id=com.ardeko.switchmaster&pcampaignid=web_share',
    },
  },
  {
    id: 'ardekostudios',
    year: 2026,
    month: 5,
    category: 'web',
    status: 'live',
    platforms: 'WEB',
    tech: ['React 19', 'Vite 8', 'Tailwind v4'],
    image: '/shots/ardekostudios.jpg',
    // Vitrinden çıkarıldı (featured kaldırıldı): stüdyonun kendi bölümü
    // zaten sayfanın altında (StudioSpotlight) duruyor, üst kartlarda
    // ikinci kez görünmesi tekrardı. Proje katalogda ve çizelgede
    // duruyor, sadece öne çıkanlarda değil.
    links: { github: `${GH}/ardekostudios.com`, live: 'https://ardekostudios.com' },
  },
  {
    id: 'kafa',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'wip',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/kafa.jpg',
    links: {},
  },
  {
    id: 'rushville',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'wip',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/rushville.jpg',
    // Klasörde git yok; tarih dizin mtime'ından (2026-06-22).
    unverified: true,
    links: {},
  },
  {
    id: 'skyline',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'wip',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/skyline.jpg',
    links: {},
  },
  {
    id: 'sarteks',
    year: 2026,
    month: 6,
    category: 'corporate',
    status: 'live',
    platforms: 'WEB',
    tech: ['Next.js 16', 'TypeScript', 'Tailwind v4', 'Matter.js'],
    image: '/shots/sarteks.png',
    featured: 3,
    links: { live: 'https://sarteks.com.tr' },
  },
  {
    id: 'forza',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · BROWSER',
    tech: ['JavaScript', 'Canvas'],
    image: '/games/forza.jpg',
    // Vitrinden çıkarıldı (featured kaldırıldı): 4. sıra Legend of Rey'e
    // geçti. Proje katalogda, arşivde ve çizelgede duruyor, oynanabilir
    // linki de yerinde — sadece öne çıkanlarda değil.
    // "forza shift" reposunun ilk commit'i 2026-06-15 ama çalışma ağacı
    // boş; güvenilir tarih dosyanın public/ altına eklendiği gün.
    unverified: true,
    links: { play: '/forza-orbit.html' },
  },
  {
    id: 'apex',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · BROWSER',
    tech: ['JavaScript', 'Canvas'],
    image: '/games/apex.jpg',
    unverified: true,
    links: { play: '/apex-shift.html' },
  },
  {
    id: 'dny',
    year: 2026,
    month: 8,
    category: 'corporate',
    status: 'source',
    platforms: 'WEB',
    tech: ['HTML', 'CSS', 'SEO'],
    image: null,
    links: { github: `${GH}/dny-bilisim` },
  },
  {
    id: 'torpidodan',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'wip',
    platforms: 'IOS · ANDROID',
    tech: ['React', 'TypeScript', 'Capacitor'],
    image: '/games/torpidodan.svg',
    links: {},
  },
  {
    id: 'decoy',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · ONLINE',
    tech: ['JavaScript', 'Firebase', 'Firestore'],
    image: '/games/decoy.svg',
    links: { play: 'https://ardekostudios.com/decoy/' },
  },
  {
    id: 'erafront',
    // Delphi ile geliştirilen tek proje. Metinde "Python ve Delphi ile
    // masaüstü oyunları" deniyor; katalogda karşılığı olmadan o cümle
    // doğrulanamıyordu. Windows-only, mobil/web hedefi yok.
    year: 2026,
    month: 8,
    category: 'game',
    status: 'wip',
    platforms: 'WINDOWS',
    tech: ['Delphi', 'FireMonkey'],
    image: null,
    links: {},
  },
  {
    id: 'metroray',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'wip',
    platforms: 'WEB',
    tech: ['Phaser 3', 'Matter.js', 'JavaScript'],
    image: null,
    links: {},
  },
];

/* --- Seçiciler -----------------------------------------------------
   Tasarım katmanı bu fonksiyonları çağırır, diziyi kendisi filtrelemez.
   Böylece "hangi proje nerede görünür" kararı tek yerde kalıyor.
------------------------------------------------------------------- */

/** Öne çıkanlar — `featured` sırasına göre. Vitrin bölümü bunu kullanır. */
export const featuredProjects = () =>
  PROJECTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured);

/**
 * Hero'daki üç rakam. Elle yazılmıyor: yeni proje eklenince kendiliğinden
 * güncelleniyor, yoksa "23 proje" yazısı ilk eklemede yalan olurdu.
 */
export const stats = () => ({
  projects: PROJECTS.length,
  live: PROJECTS.filter((p) => p.status === 'live').length,
  games: PROJECTS.filter((p) => p.category === 'game').length,
});

/** Görseli olan projeler — galeri bölümü bunu kullanır. */
export const withImage = () => PROJECTS.filter((p) => p.image);

/**
 * Ayı bilinmeyen kayıtlar için varsayılan. 0 yerine 6 kullanılıyor:
 * 0 olsaydı aysız her proje kendi yılının en eskisi gibi görünür, bu da
 * Teknofest'i Unichain'in altına atardı — oysa katalogdaki en eski proje
 * Unichain. 6 "yıl içinde bir yerde" demek ve kimseyi uca itmiyor.
 */
const monthOf = (p) => p.month ?? 6;

/** Yılı bilinen projeler, en yeniden en eskiye. */
export const chronological = () =>
  PROJECTS.filter((p) => p.year).sort(
    (a, b) => b.year - a.year || monthOf(b) - monthOf(a)
  );

/** Yıla göre gruplanmış çizelge: [{ year, items }, ...] */
export function groupByYear(items = chronological()) {
  const years = [];
  for (const item of items) {
    const last = years[years.length - 1];
    if (last && last.year === item.year) last.items.push(item);
    else years.push({ year: item.year, items: [item] });
  }
  return years;
}
