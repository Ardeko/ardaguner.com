import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const CONTACT_EMAIL = 'ardaguner2000@gmail.com';
const STUDIO_EMAIL = 'info@ardekostudios.com';
const CONTROLLER = 'Arda Güner / Ardeko Studios';
const DELETION_PATH = '/torpidodan/hesap-silme';
/* Torpidodan'da hata bildirimi Instagram'dan (uygulamada Ayarlar -> Sorun bildir, 5.0.3). Yasal talepler e-postada. */
const SUPPORT_INSTAGRAM = 'ardekostudios';
const SUPPORT_DM_URL = `https://ig.me/m/${SUPPORT_INSTAGRAM}`;

/* Politikanın kapsadığı oyunlar.

   Yayında / yakında ayrımı `released` ile yapılıyor. Skyline, Rushville
   ve Torpidodan çıktıktan sonra hepsini "planlanan" diye yazmak mağaza
   formuyla çelişirdi. Logolar: public/apps/{slug}.webp — 128×128,
   52px kutuda 2x retina için yeterli. Önceden 1024×1024 PNG'lerdi
   (toplam 5.8 MB) ve hiç küçültülmeden deploy'a giriyorlardı. */
const GAMES = [
  {
    slug: 'switch-master',
    name: 'Switch Master: Railway',
    released: true,
    tag: { tr: 'Bulmaca', en: 'Puzzle' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
  {
    slug: 'skyline-swinger',
    name: 'Skyline Swinger',
    released: true,
    tag: { tr: 'Koşu', en: 'Runner' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
  {
    slug: 'rushville',
    name: 'Rushville',
    released: true,
    tag: { tr: 'Bulmaca', en: 'Puzzle' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
  {
    slug: 'torpidodan',
    name: 'Torpidodan',
    released: true,
    tag: { tr: 'Simülasyon', en: 'Simulation' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
  {
    slug: 'forza-orbit',
    name: 'Forza Orbit',
    released: true,
    tag: { tr: 'Arcade', en: 'Arcade' },
    note: {
      tr: 'Tarayıcı · yerel skor, hesap gerekmez',
      en: 'Browser · local scores, no account',
    },
  },
  {
    slug: 'kafa-kafaya',
    name: 'Kafa Kafaya',
    released: false,
    tag: { tr: 'Spor', en: 'Sports' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
];

const SECTIONS = [
  { id: 'intro', key: 'introTitle' },
  { id: 'apps', key: 'appsTitle' },
  { id: 'online-list', key: 'onlineTitle' },
  { id: 'delete-data', key: 'deleteTitle' },
  { id: 'data', key: 'dataTitle' },
  { id: 'offline', key: 'offlineTitle' },
  { id: 'third-party', key: 'thirdPartyTitle' },
  { id: 'usage', key: 'usageTitle' },
  { id: 'share', key: 'shareTitle' },
  { id: 'children', key: 'childrenTitle' },
  { id: 'changes', key: 'changesTitle' },
  { id: 'pp-contact', key: 'contactTitle' },
];

function AppMark({ slug, name }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="pp-game-initial" aria-hidden="true">
        {name.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={`/apps/${slug}.webp`}
      alt=""
      width={52}
      height={52}
      onError={() => setBroken(true)}
    />
  );
}

function GameGrid({ games, language }) {
  return (
    <div className="pp-games">
      {games.map((game) => (
        <article key={game.slug} className="pp-game">
          <div className="pp-game-head">
            <span className="pp-game-mark">
              <AppMark slug={game.slug} name={game.name} />
            </span>
            <div>
              <h3>{game.name}</h3>
              <span className="pp-game-tag">{game.tag[language] || game.tag.tr}</span>
            </div>
          </div>
          <p>{game.note[language] || game.note.tr}</p>
        </article>
      ))}
    </div>
  );
}

const PrivacyPolicy = ({ language = 'tr' }) => {
  const content = {
    tr: {
      badge: 'Gizlilik',
      title: 'Gizlilik Politikası',
      updated: '31 Ekim 2026',
      updatedLabel: 'Son güncelleme',
      controllerLabel: 'Veri sorumlusu',
      subtitle:
        'Google Play, App Store ve ardaguner.com üzerinden sunduğumuz oyunlar; Torpidodan’ın sıralamaları, kayıt doğrulaması, çevrimiçi özellikleri, uygulama içi satın almaları ve ödüllü reklamları.',
      toc: 'İçindekiler',
      newBadge: 'Yeni',
      glanceLabel: 'Bir bakışta',
      glance: [
        { k: 'Satmayız', v: 'Kullanıcı verisi satılmaz.' },
        { k: 'Ödeme', v: 'Kart bilgisi Apple/Google’da kalır.' },
        { k: 'Reklam', v: 'İsteğe bağlı, kişiselleştirilmemiş ödüllü reklam.' },
        { k: 'Silme', v: 'Uygulamadan tek adımda hesabını sil.' },
      ],
      alsoCovers:
        'Politika, Ardeko Studios adıyla yayınlanan tüm mobil uygulamaları ve ardaguner.com üzerinden oynanan tarayıcı oyunlarını kapsar.',
      introTitle: 'Giriş',
      introText:
        'Arda Güner (Ardeko Studios) olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu metin; Google Play ve App Store’da yayınladığımız veya yayınlamayı planladığımız oyunları, ardaguner.com web sitemizi ve bu kanallar üzerinden sunulan hizmetleri kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklar.',
      appsTitle: 'Kapsam — Oyunlarımız',
      appsText:
        'Bu politika aşağıdaki oyunları kapsar. Her oyun aynı veriyi işlemez. Torpidodan’a ilişkin açıklamalar bu oyunun çevrimiçi özelliklerini kapsar.',
      appsLive: 'Yayında',
      appsPlanned: 'Yakında',
      onlineTitle: 'Torpidodan — çevrimiçi oyun verileri',
      onlineLead:
        'Torpidodan’ın kariyeri internetsiz oynanabilir. Oyun kaydınız cihazınızda saklanır; çevrimiçi doğrulama kayıtları ve açıkça gönderdiğiniz destek kopyaları ayrıca sunucuda tutulabilir. Galeri adınızı seçtiğinizde Online liste (Mal Beyanı) dahil tüm güncel çevrimiçi sıralamalara otomatik katılırsınız; oyun başladığında ve gün sonunda internet varsa beyan gönderilir. Bağlantı yoksa oyun sürer, gönderim daha sonra yeniden denenir. Apple/Google hesabı bağlama, fotoğraf paylaşma, Atelier’de satın alma, ödüllü reklam izleme ve aşağıda belirtilen özel etkinliklere katılma oyuncunun seçimidir.',
      onlineFacts: [
        {
          label: 'Hangi veriler',
          desc: 'Oyuna başladığınızda şu bilgiler otomatik gönderilir: galeri adınız ve seçtiğiniz hazır oyun portresi; oyun içi kasa, mal varlığı, borç ve şirket değeri; oyundaki gün, galeri seviyeniz, sıralama sonuçlarınız ve oyun içi unvanlarınız; bunlarla birlikte Firebase’in cihazınıza atadığı anonim oturum kimliği. Haftanın Piyasası’nı bitirirseniz o haftanın listesine galeri adınız, skorunuz ve oyun içi kasa, stok ve borç değerleriniz aynı anonim kimlikle gönderilir. Oyundaki paralar gerçek para değildir; bunlar mali hesap bilgisi değildir. Gerçek adınız, telefon numaranız, konumunuz ve telefon rehberiniz toplanmaz; bu oyun kayıtlarına reklam kimliği eklenmez; e-posta yalnızca hesabınızı bağlarsanız saklanır. Satın almalar ve ödüllü reklamlar için aşağıdaki ilgili bölümlere bakın. Kişisel portre fotoğrafınız yalnızca paylaşmayı seçerseniz gönderilir (bkz. “Kendi resminiz”).',
        },
        {
          label: 'İşleme amacı',
          desc: 'Veriler sıralamaları ve çevrimiçi etkinlikleri işletmek, oyun sonuçlarını doğrulamak, hile ve yinelenen işlemleri önlemek, hesap ve kayıt desteği sağlamak için kullanılır. Galeri adı seçimi sırasında otomatik katılım ve herkese açık alanlar açıklanır. Çevrimiçi kayıtlar reklam veya takip için kullanılmaz.',
        },
        {
          label: 'Kim görür',
          desc: 'Galeri adı, hazır portre ve yayımlanan oyun değerleri diğer oyunculara görünür; paylaşıp onaylanan fotoğrafınız Canlı Mezat’ta ve Kahve masasında görünür. Anonim oturum kimliğiniz ve gönderdiğiniz bildirimler diğer oyunculara gösterilmez. Bir galeri/site adını ya da fotoğrafı bildirirseniz bildirim, anonim kimliğiniz ve hedef kayıtla birlikte saklanır ve yetkili yöneticiye iletilir. Ham kayıt defterleri, destek kopyaları ve hesap e-postası kimseye gösterilmez. Veri sorumlusu hizmeti işletmek ve talepleri yanıtlamak için verilere erişebilir.',
        },
        {
          label: 'Hesap bağlama ve müşteri defteri',
          desc: 'İsterseniz çevrimiçi hesabınızı Apple veya Google hesabınıza bağlayabilirsiniz (Ayarlar → Çevrimiçi hesap). Bağlarsanız sağlayıcı kimliği, o hesabın e-posta adresi (Apple’da, isterseniz Apple’ın gizli aktarma adresi) ve Google’da hesabın görünen adı ile profil resmi bağlantısı hesap yönetimi için Firebase Authentication’da saklanır; kimseye gösterilmez, listelere girmez. Bağlamazsanız hiçbir e-posta toplanmaz. Hesabınızı sildiğinizde bağlantı, e-posta ve bu profil bilgileri de silinir; Apple ile bağlıysanız bir kerelik yetki koduyla Apple’ın yetkisi de iptal edilir. Oyunun müşteri defterindeki kişiler ve numaralar kurgudur; telefon rehberinize erişilmez.',
        },
        {
          label: 'Kendi resminiz',
          desc: 'Portre olarak telefonunuzdan bir fotoğraf seçebilirsiniz. Fotoğraf telefonunuzda saklanır. İsterseniz paylaşabilirsiniz (Galeri → Kariyer → Profili düzenle → “Fotoğrafını paylaş”; koşulları kabul ederek): 256 piksellik resim anonim kimliğinizle birlikte sunucuya gönderilir, uygunsuz içerik için otomatik olarak (Google Cloud Vision) denetlenir, gerekirse elle incelenir; onaylanırsa Canlı Mezat’ta ve Kahve masasında diğer oyunculara gösterilir. Diğer oyuncular fotoğrafınızı bildirebilir; bildirimler bildirenin anonim kimliğiyle saklanır. Paylaşımı istediğiniz an kapatabilirsiniz; fotoğraf sunucudan silinir. Çevrimiçi hesabınızı sildiğinizde de silinir. Paylaşmazsanız listelerde ve mezatta diğer oyuncular seçtiğiniz hazır portreyi görür.',
        },
        {
          label: 'Sürüm kontrolü',
          desc: 'Ana menü açıldığında, internet varsa, mağazadaki son sürümün numarası herkese açık bir kayıttan okunur. Bu istekle cihazınızdan hiçbir veri gönderilmez ve sunucuda hiçbir şey saklanmaz; isteğin teknik gereği olarak IP adresiniz yalnızca anlık işlenir.',
        },
        {
          label: 'Noter, kayıt doğrulaması ve destek',
          desc: 'Galeri başlangıcı ve oyun hamlelerinden oluşan kayıt defteri doğrulama için sunucuya gönderilir; mühürler, gerekli kayıt parçaları ve doğrulanmış anlık görüntüler saklanabilir. “Kopyayı desteğe gönder” işlemini seçerseniz tam oyun kaydınız ve ilgili şahsi hesap, sezon hediyesi, miras/devir verileri; uygulama sürümü ve platformuyla birlikte özel destek incelemesine gönderilir. Fotoğraf, e-posta ve giriş belirteçleri bu kopyaya eklenmez. Kopyaya yalnız sahibi ve yetkili yönetici erişebilir.',
        },
        {
          label: 'Sorun bildirimi (Instagram)',
          desc: `Uygulamada Ayarlar → “Sorun bildir” Instagram’da @${SUPPORT_INSTAGRAM} ile konuşma açar ve kısa bir notu panoya kopyalar; uygulama kendisi bir şey göndermez. Notu mesajınıza yapıştırırsanız uygulama sürümü, cihazın işletim sistemi, galeri adı ve oyun günü, çevrimiçi hesap kimliği ve son hata bilgisi; mesajınız ve Instagram kullanıcı adınızla birlikte bize Instagram (Meta) üzerinden ulaşır. Yalnızca sorunu incelemek ve size cevap vermek için kullanılır. Instagram mesajları Meta’nın kendi politikasına da tabidir; KVKK / GDPR talepleri için aşağıdaki e-posta adreslerini kullanın.`,
        },
        {
          label: 'Mezat, Prestij Pazarı ve diğer çevrimiçi alanlar',
          desc: 'Canlı Mezat, Özel Plaka, Prestij Pazarı ve özel atölyelerde oyun içi teklifler, araç ve yapım bilgileri, mülkiyet, katılım, işlem ve teslim kayıtları tutulur; ilanlar ve sonuçlarda galeri adı ve hazır portre gösterilebilir; Canlı Mezat’ta paylaşıp onaylanan fotoğrafınız da görünebilir. TORPİDO’ya gönderdiğiniz vitrin, seçtiğiniz araçlar ve korna sayısı diğer oyunculara görünür. Çevrimiçi Kahve masaları açıldığında masa, hamle, sonuç, bilet ve kozmetik kayıtları işlenir. Hiçbir tutar gerçek para değildir.',
        },
        {
          label: 'Galericiler Sitesi',
          desc: 'İsteğe bağlı site alanını kullandığınızda üyeliğiniz, galeri ve site adlarınız, amblem, roller, üyelik tarihleri, başvuru ve davetleriniz ile kuruluş, gönüllü katkı ve yenilemelerin oyun içi tutarları hesabınızla ilişkili tutulur. Site adı, amblem ve üye sayısı diğer oyunculara; üye adları, katkılar ve ortak kasa hareketleri site üyelerine gösterilir. Özel başvuru ve davetler yalnız ilgili kişilere ve yetkililere açılır. Bu veriler site üyeliğini, oyun içi ortak kasayı, doğrulamayı ve haftalık yarışları işletmek için Firebase’de tutulur; reklam veya takip amacıyla kullanılmaz. Siteye katılmak Apple veya Google hesabı bağlantısı gerektirir. Bütün tutarlar oyun parasıdır; gerçek para veya mali hesap bilgisi değildir.',
        },
        {
          label: 'Ortak işler ve Site Kupası',
          desc: 'Ortak iş katkınızı gönderdiğinizde kariyerinizin oyun eylem defteri sunucuda doğrulanır. Site Kupası’na kaydolduğunuzda haftaya ait ayrı başlangıç ve koşu kimliği saklanır; bitişte koşunun eylem defteri doğrulama için gönderilir. Bu kanıtlar diğer oyunculara açılmaz. Haftalık kadro ve kişisel puanlar ilgili site görünümünde, site toplamı ve sırası genel sıralamada gösterilir. Kişisel haftalık hatıralar hesabınız için saklanır. Bağlantı kesilirse aynı bitiş kanıtı cihazda saklanıp bağlantı geldiğinde yeniden gönderilebilir.',
        },
        {
          fresh: true,
          label: 'Atelier — uygulama içi satın alımlar (RevenueCat)',
          desc: 'Atelier’de tek seferlik, kalıcı kozmetik paketler satılır; abonelik veya oyun içi premium para yoktur. Ödemeyi Apple App Store veya Google Play alır; kart ve ödeme bilgileriniz bize ya da RevenueCat’e gelmez. Satın alımları doğrulamak, geri yüklemek, iadelerde hakları güncellemek ve satın alma istatistiklerini görmek için RevenueCat, Inc. kullanılır. Mağaza açıkken uygulama başladığında RevenueCat oyun hesabınızın anonim kimliğiyle (Firebase UID) yapılandırılır; satın alma yapmadıysanız yalnızca bu kimlik ile uygulama sürümü ve platform gibi teknik bilgiler iletilir. Satın alırsanız mağazanın satın alma kayıtları (ürün kimliği, işlem kimliği, satın alma/iade tarihi, fiyat, para birimi ve mağaza ülkesi) da eklenir. RevenueCat’e e-posta adresiniz veya reklam kimliğiniz gönderilmez; RevenueCat verileri hizmet sağlayıcı olarak adımıza işler ve satın alma değişikliklerini sunucumuza bildirir. Kalıcı ürün haklarınız, kozmetik tercihleriniz ve kuşandığınız tasarımlar Firebase’de hesabınızla tutulur; kuşanılan tasarımlar ve sergilenen nüshalar diğer oyunculara görünebilir, fiyat ve işlem makbuzu kimseye gösterilmez.',
        },
        {
          fresh: true,
          label: 'Ödüllü reklamlar (Google AdMob)',
          desc: 'Atelier’de günlük kozmetik parça kazanmak için isteğe bağlı ödüllü reklam izleyebilirsiniz; banner veya zorunlu geçiş reklamı yoktur. Reklamlar Google AdMob ile gösterilir ve kişiselleştirilmemiş reklam istenir. Gerekli bölgelerde (ör. AB/AEA ve Birleşik Krallık) ilk reklamdan önce Google’ın izin formu (UMP) gösterilir; izin alınamazsa reklam istenmez. Tercihlerinizi Atelier → “Reklam gizlilik tercihleri” ile değiştirebilirsiniz. Uygulama iOS’ta uygulama izleme izni (ATT) istemez; bu izin olmadan iOS reklam kimliğine (IDFA) erişilemez. Kişiselleştirilmemiş reklamda da Google; IP adresi ve buradan çıkarılan yaklaşık konum, cihaz ve uygulama bilgileri, Android’de reklam kimliği, reklam etkileşimleri ile tanılama ve performans verilerini reklamı sunmak, sıklığı sınırlamak, ölçmek ve sahteciliği önlemek için işleyebilir; bu işleme Google’ın kendi politikasına tabidir (policies.google.com/technologies/ads). Ödülü doğrulamak için reklam isteğiyle birlikte oyun hesabınızın anonim kimliği ve tek kullanımlık bir istek kimliği Google’a verilir; Google reklam tamamlandığında bunları imzalı olarak sunucumuza geri iletir. Günlük ödül sayacı ve doğrulama kaydı Firebase’de tutulur. Galeri adınız, oyun değerleriniz, e-postanız ve fotoğrafınız reklam ağına verilmez.',
        },
        {
          label: 'Nerede tutulur',
          desc: 'Veriler, hizmet sağlayıcımız Google Firebase’in (Cloud Firestore) Avrupa Birliği’ndeki sunucularında tutulur; bu, verilerin Türkiye dışına aktarılması anlamına gelir. Kimlik doğrulaması Firebase Authentication ile, paylaşılan fotoğrafların otomatik denetimi Google Cloud Vision ile yapılır. Google bu hizmetlerde verileri yalnızca adımıza işler. Satın alma kayıtları RevenueCat’in, ödüllü reklam verileri Google’ın altyapısında işlenir; bu da yurt dışına aktarım anlamına gelir. Aktarım HTTPS ile şifrelenir. Bağlantı sırasında IP adresi ve teknik istemci bilgileri hizmetin sunulması ve güvenliği için işlenebilir.',
        },
        {
          label: 'Saklama ve silme',
          desc: 'Çevrimiçi oyun kayıtlarınız ve destek kopyaları hesap silme talebine kadar tutulur; otomatik süre sonu silmesi yoktur. Ayarlar → Çevrimiçi hesap → “Çevrimiçi verilerimi sil” hesabınızı ve sıralama ile haftalık sonuçlarınız dahil kişisel çevrimiçi verilerinizi siler. Paylaştığınız fotoğraf, site üyeliğiniz, başvuru/davetleriniz, kişisel görev/kupa delilleriniz, katılım ve hatıralarınız; Atelier ürün haklarınız, kozmetik tercihleriniz, ödül sayacınız ve RevenueCat’teki müşteri kaydınız da silinir. Apple/Google’ın kendi ödeme kayıtları ve sağlayıcıların yasal saklama yükümlülükleri bundan ayrıdır; hesap silmek otomatik iade anlamına gelmez. Diğer oyuncuların kayıtlarının tutarlılığı için ortak kasa ve yarış toplamları adınız ve hesap kimliğinizle ilişkisi kaldırılarak korunabilir; Gala ve Özel Plaka sicilinde diğer oyuncuların kayıtlarıyla bağlantılı işlem bilgileri isimsiz kalır. Cihazınızdaki oyun kaydı kalır. Ayrıntılar aşağıdaki silme sayfasındadır.',
        },
        {
          label: 'Haklarınız',
          desc: `KVKK (m. 11) ve GDPR (m. 15–21) kapsamındaki erişim, düzeltme, silme, işlemeyi kısıtlama, rızayı geri çekme ve (GDPR için) veri taşınabilirliği haklarınızı ${CONTACT_EMAIL} veya ${STUDIO_EMAIL} adresinden kullanabilirsiniz. Şikayet için Kişisel Verileri Koruma Kurulu’na veya yaşadığınız yerdeki denetim otoritesine başvurabilirsiniz.`,
        },
        {
          label: 'Çocuklar',
          desc: 'Torpidodan’ın çevrimiçi özellikleri (Online liste dahil) 13 yaş altındaki kullanıcılar için tasarlanmamıştır. 13 yaş altından bilerek veri toplamayız. Böyle bir kayıt fark edersek sileriz.',
        },
        {
          label: 'Reklam ve takip',
          desc: 'Torpidodan yalnızca isteğe bağlı ödüllü reklamlar için Google AdMob’u kullanır ve kişiselleştirilmemiş reklam ister; Firebase Analytics gibi bir analitik SDK kullanmaz. Kullanıcı verisi satılmaz. Çevrimiçi oyun verisi reklam hedeflemesi için kullanılmaz; ödülü doğrulamak için gereken anonim kimlik dışında reklam ağıyla paylaşılmaz.',
        },
        {
          fresh: true,
          label: 'Telif ve içerik bildirimleri',
          desc: `Torpidodan’da paylaşılan bir fotoğraf hakkınızı ihlal ediyorsa fotoğrafa dokunup “Fotoğrafı bildir” → “Telif hakkı ihlali (izinsiz kullanılan resim)” seçeneğini kullanabilir ya da ${CONTACT_EMAIL} adresine yazabilirsiniz. Bildirilen içerik incelenir; ihlal görülürse kaldırılır. Uygulamanın içinde Ayarlar → Hakkında → “KVKK aydınlatma metni” bu politikanın Torpidodan’a ilişkin kısa Türkçe aydınlatma metnini internetsiz de gösterir.`,
        },
      ],
      deleteTitle: 'Verilerinizi silme',
      deleteText:
        'Torpidodan’daki çevrimiçi hesabınızı ve kişisel verilerinizi uygulama içinden silebilirsiniz: Ayarlar → Çevrimiçi hesap → “Çevrimiçi verilerimi sil” → onaylayın. Paylaştığınız fotoğraf sunucudan silinir; cihazınızdaki oyun kaydı ve portre fotoğrafı bu işlemle silinmez. Atelier ürün haklarınız ve RevenueCat kaydınız da silinir; Apple/Google’daki ödeme kayıtları mağazada kalır ve hesap silmek otomatik iade anlamına gelmez. Uygulamayı açamıyorsanız e-posta ile talepte bulunabilirsiniz.',
      deleteLinkLabel: 'Ayrıntılar ve uygulamayı silmiş kullanıcılar için',
      dataTitle: 'Topladığımız bilgiler',
      dataText:
        'Uygulamaya ve kullanılan özelliğe göre veri akışı değişir. Torpidodan’ın otomatik sıralama ve Noter kayıtları ile oyuncunun başlattığı çevrimiçi işlemler yukarıda açıklanmıştır.',
      dataItems: [
        {
          label: 'Torpidodan oyun kayıtları',
          desc: 'Oturum kimliği, görünen galeri/site adı, oyun değerleri, kayıt doğrulaması, destek kopyaları ve çevrimiçi işlem kayıtları. Görünürlük ve saklama ayrıntıları yukarıdaki bölümdedir.',
        },
        {
          label: 'Paylaşılan portre fotoğrafı',
          desc: 'Torpidodan’da yalnızca paylaşmayı seçerseniz: 256 piksellik resim ve anonim kimliğiniz; fotoğrafınıza ilişkin bildirimler bildirenin anonim kimliğiyle. Paylaşımı kapattığınızda silinir.',
        },
        {
          label: 'Bağlı hesap e-postası',
          desc: 'Torpidodan’da çevrimiçi hesabınızı isteğe bağlı olarak Apple veya Google ile bağlarsanız o hesabın e-posta adresi. Bağlamazsanız yalnızca anonim bir oturum kimliği kullanılır.',
        },
        {
          label: 'Satın alma kayıtları',
          desc: 'Torpidodan Atelier’de satın alırsanız ürün ve işlem kimliği, tarih, fiyat ve para birimi gibi mağaza kayıtları; anonim hesap kimliğinizle RevenueCat ve Firebase’de. Ödeme bilgileri Apple/Google’da kalır.',
        },
        {
          label: 'Cihaz bilgileri',
          desc: 'Cihaz modeli, işletim sistemi, benzersiz tanımlayıcılar (ör. reklam kimlikleri) — yalnızca reklam veya analitik kullanan uygulamalarda. Torpidodan’da yalnızca ödüllü reklam izlediğinizde, Google AdMob tarafından.',
        },
        {
          label: 'Kullanım verileri',
          desc: 'Uygulama içi etkileşimler, oynama süreleri ve hata/çökme raporları — analitik entegre edilmiş uygulamalarda. Torpidodan’da yalnızca reklam etkileşimleri ve reklam SDK’sının tanılama verileri.',
        },
        {
          label: 'Yerel oyun verisi',
          desc: 'Forza Orbit ve Switch Master: Railway gibi çevrimdışı oyunlarda kayıt cihazda tutulur. Torpidodan’ın kariyer kaydı da cihazdadır; çevrimiçi doğrulama kayıtları ve açıkça gönderilen destek kopyaları ayrıca sunucuda saklanabilir. Kişisel portre fotoğrafı cihazda kalır; yalnızca paylaşmayı seçerseniz sunucuya gönderilir.',
        },
      ],
      offlineTitle: 'Çevrimdışı oyunlar',
      offlineText:
        'Torpidodan’ın kariyerine Apple/Google hesabı bağlamadan başlayabilir ve internetsiz devam edebilirsiniz. Bağlantı olduğunda anonim oturum, otomatik sıralamalar ve Noter doğrulaması çalışır. Yeni oyun başlatmak veya uygulamayı kaldırmak sunucudaki hesabınızı silmez; çevrimiçi verileri silmek için uygulamadaki silme yolunu ya da aşağıdaki e-posta talebini kullanın.',
      thirdPartyTitle: 'Üçüncü taraf hizmetleri',
      thirdPartyText:
        'Torpidodan’ın çevrimiçi oyun verileri için Google Firebase; isteğe bağlı hesap bağlantısı için Apple ile Giriş ve Google ile Giriş; paylaşılan portre fotoğraflarının otomatik içerik denetimi için Google Cloud Vision; uygulama içi satın almaların doğrulanması ve geri yüklenmesi için RevenueCat; isteğe bağlı ödüllü reklamlar ve reklam izin formu için Google AdMob ile Google UMP kullanılır. Google (Firebase, Cloud Vision) ve RevenueCat bu verileri hizmet sağlayıcı olarak adımıza işler; AdMob’daki reklam verileri Google’ın kendi politikasına tabidir. Reklam veya analitik kullanan diğer uygulamalar aşağıdaki hizmetlerden yararlanabilir.',
      thirdPartyNote:
        'Firebase Analytics yalnızca ilgili diğer uygulamalarda geçerlidir; Torpidodan’da kullanılmaz. Torpidodan’da AdMob yalnızca isteğe bağlı, kişiselleştirilmemiş ödüllü reklamlar için kullanılır.',
      usageTitle: 'Bilgilerin kullanımı',
      usageText: 'İşlediğimiz bilgileri şu amaçlarla kullanırız:',
      usageItems: [
        'Torpidodan sıralamalarını, kayıt doğrulamasını ve oyuncunun katıldığı çevrimiçi etkinlikleri işletmek; hesap silme taleplerini yerine getirmek.',
        'Çevrimiçi hesabınızı Apple veya Google ile bağlarsanız hesabınızı tanımak ve silme talebinizi doğrulamak.',
        'Paylaşmayı seçtiğiniz portre fotoğrafını uygunsuz içeriğe karşı denetlemek ve diğer oyunculara göstermek.',
        'Oyunların düzgün çalışmasını sağlamak ve iyileştirmek.',
        'Teknik sorunları tespit edip çözmek.',
        'Torpidodan Atelier satın alımlarını doğrulamak, geri yüklemek ve iadelerde hakları güncellemek.',
        'Reklam gösterilen uygulamalarda uygun reklamlar sunmak; Torpidodan’da ödüllü reklamın tamamlandığını doğrulayıp kozmetik ödülü vermek.',
      ],
      shareTitle: 'Bilgilerin paylaşımı',
      shareText:
        'Kullanıcı verilerini satmıyoruz. Torpidodan’ın liste, ilan, vitrin, paylaşılan fotoğraf ve site verilerinin oyunculara görünürlüğü yukarıda açıklanmıştır; özel doğrulama ve destek kayıtları herkese açılmaz. Hizmet sağlayıcılar (Google Firebase, RevenueCat) işlemleri adımıza yürütür. Torpidodan’da ödüllü reklam izlediğinizde Google AdMob, reklamı sunmak için gereken cihaz ve teknik verileri kendi politikasına göre işler ve ödül doğrulaması için anonim hesap kimliğinizi alır. Reklam veya analitik kullanan diğer uygulamalarda anonimleştirilmiş veriler ilgili ortaklarla paylaşılabilir. Veriler ayrıca yasal zorunluluk halinde yetkili mercilere iletilebilir.',
      childrenTitle: 'Çocuklar',
      childrenText:
        'Oyunlarımız genel kitleye uygundur. Torpidodan’ın çevrimiçi özellikleri (Online liste / Mal Beyanı dahil) 13 yaş altı için tasarlanmamıştır. Bilerek 13 yaş altından kişisel veri toplamıyoruz. Ebeveyn veya veli olarak endişeniz varsa bizimle iletişime geçin.',
      changesTitle: 'Değişiklikler',
      changesText:
        'Bu politika güncellenebilir. Güncel sürüm ardaguner.com/privacy-policy adresinde yayınlanır. Yeni oyun veya özellik eklendiğinde sayfa güncellenir.',
      contactTitle: 'İletişim',
      contactText: `Sorular, rıza geri çekme ve KVKK / GDPR talepleri için veri sorumlusu ${CONTROLLER}:`,
      instagramLabel: 'Instagram · Torpidodan hata bildirimi',
      backHome: 'Anasayfaya dön',
    },
    en: {
      badge: 'Privacy',
      title: 'Privacy Policy',
      updated: '31 October 2026',
      updatedLabel: 'Last updated',
      controllerLabel: 'Data controller',
      subtitle:
        'Our games on Google Play, the App Store and ardaguner.com, including Torpidodan rankings, save verification, online features, in-app purchases and rewarded ads.',
      toc: 'Contents',
      newBadge: 'New',
      glanceLabel: 'At a glance',
      glance: [
        { k: 'Never sold', v: 'We do not sell user data.' },
        { k: 'Payments', v: 'Card details stay with Apple/Google.' },
        { k: 'Ads', v: 'Optional, non-personalized rewarded ads.' },
        { k: 'Deletion', v: 'Delete your account in the app in one step.' },
      ],
      alsoCovers:
        'The policy covers all mobile apps published under the Ardeko Studios name and the browser games playable on ardaguner.com.',
      introTitle: 'Introduction',
      introText:
        'As Arda Güner (Ardeko Studios), I respect your privacy and am committed to protecting your personal data. This notice explains how we collect, use, and share information when you use our games on Google Play and the App Store, our website ardaguner.com, and related services.',
      appsTitle: 'Scope — Our games',
      appsText:
        'This policy covers the games below. Not every game processes the same data. The Torpidodan-specific sections describe that game’s online features.',
      appsLive: 'Available now',
      appsPlanned: 'Coming soon',
      onlineTitle: 'Torpidodan — online game data',
      onlineLead:
        'Torpidodan’s career can be played offline. Your save is kept on your device; online verification records and support copies you explicitly submit may also be stored on the server. Choosing a dealership name automatically enrolls you in all current online rankings, including the Online leaderboard (Mal Beyanı); declarations are sent when play starts and at the end of game days if connected. Offline play continues and uploads retry later. Linking Apple/Google, sharing a photo, buying in the Atelier, watching rewarded ads and joining the specific activities below remain player choices.',
      onlineFacts: [
        {
          label: 'What is sent',
          desc: 'When you start playing, the following is sent automatically: your dealership’s name and the ready-made portrait you chose; its in-game cash, assets, debt and company value; your in-game day, dealership level, rankings and game titles; and an anonymous session ID that Firebase assigns to your device. If you finish the weekly challenge (Haftanın Piyasası), your dealership’s name, your score and your in-game cash, stock and debt are sent to that week’s leaderboard with the same anonymous ID. In-game money is not real money and is not financial account information. We do not collect your real name, phone number, location or phone contacts; no advertising ID is attached to these game records; an email is stored only if you link your account. For purchases and rewarded ads, see the sections below. Your personal portrait photo is sent only if you choose to share it (see “Your own picture”).',
        },
        {
          label: 'Purpose',
          desc: 'Data is used to run rankings and online activities, verify game results, prevent cheating and duplicate transactions, and provide account and save support. The naming screen explains automatic participation and which fields are public. Online records are not used for advertising or tracking.',
        },
        {
          label: 'Who can see it',
          desc: 'Dealership names, ready-made portraits and published game values are visible to other players; an approved shared photo is shown in Live Auction and at Coffeehouse tables. Your anonymous session ID and the reports you send are not shown to other players. If you report a dealership/site name or a photo, the report is stored with your anonymous ID and the target record and goes to authorized administrators. Raw game journals, support copies and account emails are shown to no one. The controller can access records to operate the service and respond to requests.',
        },
        {
          label: 'Account linking and fictional contacts',
          desc: 'You can link your online account to an Apple or Google account (Settings → Online account). If you do, the provider identifier, that account’s email address (for Apple, the private relay address if you choose to hide your email) and, for Google, the account’s display name and profile picture URL are stored in Firebase Authentication for account management; they are shown to no one and never appear in lists. If you don’t link, no email is collected. Deleting your account removes the link, the email and this profile information; for Apple-linked accounts, Apple’s authorization is also revoked using a one-time authorization code. The game’s customer contact book contains fictional characters and numbers; it does not access your phone contacts.',
        },
        {
          label: 'Your own picture',
          desc: 'You may pick a photo from your phone as your portrait. The photo is stored on your phone. If you choose to share it (Galeri → Kariyer → Profili düzenle → “Fotoğrafını paylaş”, after accepting the terms), a 256-pixel image is sent to the server with your anonymous ID, checked automatically for inappropriate content (Google Cloud Vision) and reviewed by hand when needed; once approved, it is shown to other players in Live Auction and at Coffeehouse tables. Other players can report your photo; reports are stored with the reporter’s anonymous ID. You can stop sharing at any time and the photo is deleted from the server; it is also deleted when you delete your online account. If you don’t share, other players see the ready-made portrait you chose.',
        },
        {
          label: 'Update check',
          desc: 'When the main menu opens and you are online, the app reads the latest store version number from a public record. No data from your device is sent and nothing is stored on the server; your IP address is processed only momentarily, as any network request requires.',
        },
        {
          label: 'Notary, save verification and support',
          desc: 'A journal containing the dealership start and game actions is sent to the server for verification; seals, required journal segments and verified snapshots may be retained. If you choose to send a support copy, your full save and related personal in-game account, season gift and legacy/handover records are sent with the app version and platform for private support review. Photos, emails and login tokens are excluded from that copy. Only its owner and authorized administrators can access it.',
        },
        {
          label: 'Bug reports (Instagram)',
          desc: `In the app, Settings → “Sorun bildir” (report a problem) opens a conversation with @${SUPPORT_INSTAGRAM} on Instagram and copies a short note to your clipboard; the app itself sends nothing. If you paste the note into your message, the app version, your device’s operating system, dealership name and game day, online account ID and last error reach us through Instagram (Meta), together with your message and Instagram username. They are used only to investigate the problem and reply to you. Instagram messages are also subject to Meta’s own policy; please use the email addresses below for KVKK / GDPR requests.`,
        },
        {
          label: 'Auctions, Prestige Market and other online activities',
          desc: 'Live Auction, Special Plate, Prestige Market and special workshops store fictional bids, vehicle/build details, ownership, entries, transactions and delivery receipts. Listings and results may show dealership names and ready-made portraits; an approved shared photo may also appear in Live Auction. Your submitted TORPİDO showcase, selected vehicles and horn count are public. When online café tables are enabled, table, move, result, ticket and cosmetic records are processed. All amounts are fictional game currency.',
        },
        {
          label: 'Galericiler Sitesi',
          desc: 'In the optional site area, we store your account-linked membership, dealership and site names, emblem, roles, membership dates, applications and invitations, and fictional founding, contribution and renovation amounts. Site names, emblems and member counts appear in the directory. Member names, contributions and shared treasury activity appear to site members. Private applications and invitations are limited to the relevant users and officers. Firebase processes these records to operate membership, the fictional treasury, verification and weekly competitions, without advertising or tracking. Site membership requires linking an Apple or Google account. All amounts are fictional game currency.',
        },
        {
          label: 'Cooperative tasks and Site Cup',
          desc: 'When you submit a cooperative task contribution, your career action journal is verified on the server. Registering for Site Cup stores a separate weekly start and run identifier; finishing submits that run’s action journal for verification. Raw proofs are private. Weekly rosters and individual points appear in the relevant site view; site totals and ranks appear in the public rankings. Personal weekly keepsakes are stored for your account. An interrupted finish submission may be retained on your device and retried with the same proof when connected.',
        },
        {
          fresh: true,
          label: 'Atelier — in-app purchases (RevenueCat)',
          desc: 'The Atelier sells one-time, permanent cosmetic packs; there are no subscriptions or premium in-game currency. Payment is handled by the Apple App Store or Google Play; your card and payment details never reach us or RevenueCat. We use RevenueCat, Inc. to validate and restore purchases, update entitlements after refunds and view purchase statistics. When the store is enabled, RevenueCat is configured with your game account’s anonymous ID (Firebase UID) as the app starts; if you have not bought anything, only that ID and technical details such as app version and platform are sent. If you buy, the store’s purchase records (product ID, transaction ID, purchase/refund date, price, currency and storefront country) are added. Your email address and advertising ID are not sent to RevenueCat; RevenueCat processes the data on our behalf as a service provider and notifies our server of purchase changes. Your permanent entitlements, cosmetic preferences and equipped designs are stored with your account in Firebase; equipped designs and displayed copies may be visible to other players, while prices and receipts are shown to no one.',
        },
        {
          fresh: true,
          label: 'Rewarded ads (Google AdMob)',
          desc: 'In the Atelier you can choose to watch rewarded ads to earn daily cosmetic pieces; there are no banner or forced interstitial ads. Ads are served by Google AdMob and non-personalized ads are requested. Where required (e.g. the EU/EEA and the UK), Google’s consent form (UMP) is shown before the first ad; without consent, no ad is requested. You can change your choices under Atelier → “Reklam gizlilik tercihleri” (ad privacy options). On iOS the app does not request App Tracking Transparency permission; without it, the iOS advertising identifier (IDFA) is not accessible. Even for non-personalized ads, Google may process your IP address and the approximate location derived from it, device and app information, the advertising ID on Android, ad interactions, and diagnostic and performance data to serve ads, cap frequency, measure performance and prevent fraud, under its own policy (policies.google.com/technologies/ads). To verify a reward, your game account’s anonymous ID and a one-time request ID are passed to Google with the ad request; when the ad completes, Google returns them to our server in a signed callback. The daily reward counter and verification record are stored in Firebase. Your dealership name, game values, email and photo are not given to the ad network.',
        },
        {
          label: 'Where it is stored',
          desc: 'On the European Union servers of our service provider Google Firebase (Cloud Firestore); for users in Türkiye this means data is transferred abroad. Firebase Authentication handles sign-in, and Google Cloud Vision performs the automatic check of shared photos. Google processes this data only on our behalf. Purchase records are processed on RevenueCat’s infrastructure and rewarded-ad data on Google’s, which also means a transfer abroad. Transfers are encrypted with HTTPS. IP addresses and technical client information may be processed to provide and secure network requests.',
        },
        {
          label: 'Retention and deletion',
          desc: 'Online game records and support copies are kept until you request account deletion; there is no automatic expiry. Settings → Online account → “Delete my online data” removes your account and all personal online records, including rankings and weekly results. Your shared photo, site membership, applications/invitations, personal task/Cup proofs, participation records and keepsakes, as well as your Atelier entitlements, cosmetic preferences, reward counter and RevenueCat customer record, are also deleted. Apple’s and Google’s own payment records and providers’ legal retention duties are separate; deleting your account does not trigger an automatic refund. Shared treasury and competition totals may remain with your name and account association removed to preserve other players’ records; in the Gala and Special Plate registers, transaction details linked to other players’ records remain without your name. Your local game save remains. Details are on the deletion page below.',
        },
        {
          label: 'Your rights',
          desc: `You may exercise your KVKK (Art. 11) and GDPR (Arts. 15–21) rights of access, rectification, erasure, restriction, withdrawal of consent, and (under the GDPR) portability by writing to ${CONTACT_EMAIL} or ${STUDIO_EMAIL}. You may also lodge a complaint with the Turkish Personal Data Protection Authority or your local supervisory authority.`,
        },
        {
          label: 'Children',
          desc: 'Torpidodan’s online features (including the online leaderboard) are not intended for users under 13. We do not knowingly collect data from children under 13. If we become aware of such a record, we delete it.',
        },
        {
          label: 'Ads and tracking',
          desc: 'Torpidodan uses Google AdMob only for optional rewarded ads and requests non-personalized ads; it uses no analytics SDK such as Firebase Analytics. User data is never sold. Online game data is not used for ad targeting and is not shared with the ad network, apart from the anonymous ID needed to verify a reward.',
        },
        {
          fresh: true,
          label: 'Copyright and content reports',
          desc: `If a photo shared in Torpidodan infringes your rights, tap it and choose “Fotoğrafı bildir” → “Telif hakkı ihlali (izinsiz kullanılan resim)” (report → copyright infringement), or write to ${CONTACT_EMAIL}. Reported content is reviewed and removed if it infringes. Inside the app, Settings → About → “KVKK aydınlatma metni” shows a short Turkish privacy notice for Torpidodan, also offline.`,
        },
      ],
      deleteTitle: 'Deleting your data',
      deleteText:
        'Delete your Torpidodan online account and personal records in Settings → Online account → “Delete my online data” → confirm. A shared photo is deleted from the server; the save and portrait photo on your device are not deleted. Your Atelier entitlements and RevenueCat record are also deleted; payment records stay with Apple/Google, and deleting your account does not trigger an automatic refund. If you cannot open the app, you can request deletion by email.',
      deleteLinkLabel: 'Details, and for users who have uninstalled the app',
      dataTitle: 'Information we process',
      dataText:
        'Data flows depend on the app and feature. Torpidodan’s automatic ranking and Notary records and player-initiated online activities are described above.',
      dataItems: [
        {
          label: 'Torpidodan game records',
          desc: 'Session ID, public dealership/site name, game values, verification records, support copies and online transaction records. Visibility and retention are described above.',
        },
        {
          label: 'Shared portrait photo',
          desc: 'In Torpidodan, only if you choose to share it: a 256-pixel image and your anonymous ID; reports about your photo are stored with the reporter’s anonymous ID. Deleted when you stop sharing.',
        },
        {
          label: 'Linked account email',
          desc: 'In Torpidodan, if you choose to link your online account with Apple or Google, that account’s email address. If you don’t link it, only an anonymous session ID is used.',
        },
        {
          label: 'Purchase records',
          desc: 'If you buy in the Torpidodan Atelier, store records such as product and transaction ID, date, price and currency, held with your anonymous account ID in RevenueCat and Firebase. Payment details stay with Apple/Google.',
        },
        {
          label: 'Device information',
          desc: 'Device model, OS version, unique identifiers (e.g. ad IDs) — only in apps that use ads or analytics. In Torpidodan, only by Google AdMob when you watch a rewarded ad.',
        },
        {
          label: 'Usage data',
          desc: 'In-app interactions, play time, and crash reports — in apps with analytics. In Torpidodan, only ad interactions and the ad SDK’s diagnostic data.',
        },
        {
          label: 'Local game data',
          desc: 'Offline games such as Forza Orbit and Switch Master: Railway store saves on-device. Torpidodan also keeps its career save on-device, while online verification records and explicitly submitted support copies may additionally be stored on the server. Personal portrait photos stay on-device and are uploaded only if you choose to share them.',
        },
      ],
      offlineTitle: 'Offline games',
      offlineText:
        'You can start Torpidodan’s career without linking Apple/Google and continue offline. When connected, anonymous sign-in, automatic rankings and Notary verification operate. Starting a new game or uninstalling does not delete your server account; use in-app deletion or the email request below to delete online data.',
      thirdPartyTitle: 'Third-party services',
      thirdPartyText:
        'Torpidodan uses Google Firebase for online game data, Sign in with Apple/Google Sign-In for optional account linking, Google Cloud Vision to automatically check shared portrait photos for inappropriate content, RevenueCat to validate and restore in-app purchases, and Google AdMob with Google UMP for optional rewarded ads and the ad consent form. Google (Firebase, Cloud Vision) and RevenueCat process this data on our behalf as service providers; ad data in AdMob is subject to Google’s own policy. Other apps that use ads or analytics may rely on the services below.',
      thirdPartyNote:
        'Firebase Analytics applies only to the relevant other apps; it is not used by Torpidodan. In Torpidodan, AdMob is used only for optional, non-personalized rewarded ads.',
      usageTitle: 'Use of information',
      usageText: 'We use processed information to:',
      usageItems: [
        'Operate Torpidodan rankings, save verification and online activities that players join; honor account deletion requests.',
        'Recognise your account and verify deletion requests if you link your online account with Apple or Google.',
        'Check a portrait photo you choose to share for inappropriate content and show it to other players.',
        'Ensure proper functioning and improvement of our games.',
        'Detect and resolve technical issues.',
        'Validate and restore Torpidodan Atelier purchases and update entitlements after refunds.',
        'Serve ads in apps that display advertising; in Torpidodan, verify that a rewarded ad was completed and grant the cosmetic reward.',
      ],
      shareTitle: 'Sharing of information',
      shareText:
        'We do not sell user data. Visibility of Torpidodan rankings, listings, showcases, shared photos and site data is described above; private verification and support records are not public. Service providers (Google Firebase, RevenueCat) process data on our behalf. When you watch a rewarded ad in Torpidodan, Google AdMob processes the device and technical data needed to serve it under its own policy and receives your anonymous account ID for reward verification. In other apps with ads or analytics, anonymized data may be shared with relevant partners. Data may also be provided to authorities when legally required.',
      childrenTitle: 'Children',
      childrenText:
        'Our games are suitable for general audiences. Torpidodan’s online features (including the Online list / Asset Declaration) are not intended for children under 13. We do not knowingly collect personal data from children under 13. Parents may contact us with any concerns.',
      changesTitle: 'Changes',
      changesText:
        'This policy may be updated. The current version is at ardaguner.com/privacy-policy. This page is updated when new games or features are added.',
      contactTitle: 'Contact',
      contactText: `Questions, consent withdrawal, and KVKK / GDPR requests — data controller ${CONTROLLER}:`,
      instagramLabel: 'Instagram · Torpidodan bug reports',
      backHome: 'Back to home',
    },
  };

  const t = content[language] || content.tr;
  const live = GAMES.filter((g) => g.released);
  const planned = GAMES.filter((g) => !g.released);
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  /* Torpidodan maddeleri (20 başlık) telefonda kapalı başlar: başlıklar bir bakışta okunur, istenen açılır. */
  const [factsOpen, setFactsOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(min-width: 721px)').matches);
  const [factsKey, setFactsKey] = useState(0);
  const tocRef = useRef(null);

  /* Telefonda içindekiler yatay şerit: etkin bölümün çipi görünür kalsın. */
  useEffect(() => {
    const strip = tocRef.current;
    const chip = strip?.querySelector('a.is-active');
    if (!strip || !chip || strip.scrollWidth <= strip.clientWidth) return;
    const left = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeId]);

  /* İçindekiler: ekranın üst üçte birinde duran bölümü vurgular. */
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0];
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    const prev = document.title;
    document.title =
      language === 'tr'
        ? 'Gizlilik Politikası — Arda Güner'
        : 'Privacy Policy — Arda Güner';
    return () => {
      document.title = prev;
    };
  }, [language]);

  return (
    <main className="page pp section" id="privacy">
      <div className="shell">
        <header className="pp-hero">
          <span className="eyebrow">{t.badge}</span>
          <h1 className="display grad-text">{t.title}</h1>
          <p className="lede">{t.subtitle}</p>
          <ul className="pp-meta">
            <li>
              <strong>{t.updatedLabel}</strong>
              {t.updated}
            </li>
            <li>
              <strong>{t.controllerLabel}</strong>
              {CONTROLLER}
            </li>
          </ul>
          <ul className="pp-glance" aria-label={t.glanceLabel}>
            {t.glance.map((g) => (
              <li key={g.k}>
                <strong>{g.k}</strong>
                <span>{g.v}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="pp-layout">
          <aside className="pp-toc" aria-label={t.toc}>
            <p className="eyebrow pp-toc-label">{t.toc}</p>
            <ol ref={tocRef}>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={activeId === s.id ? 'is-active' : undefined}
                    aria-current={activeId === s.id ? 'true' : undefined}
                  >
                    {t[s.key]}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="pp-main">
            <section className="pp-section" id="intro">
              <h2 className="display">{t.introTitle}</h2>
              <p>{t.introText}</p>
              <p className="pp-note">{t.alsoCovers}</p>
            </section>

            <section className="pp-section" id="apps">
              <h2 className="display">{t.appsTitle}</h2>
              <p>{t.appsText}</p>
              {live.length > 0 && (
                <div className="pp-games-group">
                  <p className="pp-group-label">{t.appsLive}</p>
                  <GameGrid games={live} language={language} />
                </div>
              )}
              {planned.length > 0 && (
                <div className="pp-games-group">
                  <p className="pp-group-label">{t.appsPlanned}</p>
                  <GameGrid games={planned} language={language} />
                </div>
              )}
            </section>

            <section className="pp-section pp-callout" id="online-list">
              <h2 className="display">{t.onlineTitle}</h2>
              <p>{t.onlineLead}</p>
              <div className="pp-facts-bar">
                <span>{t.onlineFacts.length} {language === 'tr' ? 'başlık' : 'topics'}</span>
                <button
                  type="button"
                  className="pp-facts-toggle"
                  aria-expanded={factsOpen}
                  onClick={() => {
                    setFactsOpen((v) => !v);
                    setFactsKey((k) => k + 1);
                  }}
                >
                  {factsOpen ? (language === 'tr' ? 'Tümünü kapat' : 'Collapse all') : (language === 'tr' ? 'Tümünü aç' : 'Expand all')}
                </button>
              </div>
              <div className="pp-facts">
                {t.onlineFacts.map((item) => (
                  <details key={`${factsKey}-${item.label}`} className={item.fresh ? 'pp-fact is-new' : 'pp-fact'} open={factsOpen}>
                    <summary>
                      <h3>
                        {item.label}
                        {item.fresh && <span className="pp-badge">{t.newBadge}</span>}
                      </h3>
                    </summary>
                    <p>{item.desc}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="pp-section" id="delete-data">
              <h2 className="display">{t.deleteTitle}</h2>
              <p>{t.deleteText}</p>
              <Link to={DELETION_PATH} className="pp-contact pp-delete-link">
                <span className="pp-contact-label">{t.deleteLinkLabel}</span>
                <span className="pp-contact-val">ardaguner.com{DELETION_PATH}</span>
              </Link>
            </section>

            <section className="pp-section" id="data">
              <h2 className="display">{t.dataTitle}</h2>
              <p>{t.dataText}</p>
              <div className="pp-grid">
                {t.dataItems.map((item) => (
                  <div key={item.label} className="pp-card">
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="pp-section" id="offline">
              <h2 className="display">{t.offlineTitle}</h2>
              <p>{t.offlineText}</p>
            </section>

            <section className="pp-section" id="third-party">
              <h2 className="display">{t.thirdPartyTitle}</h2>
              <p>{t.thirdPartyText}</p>
              <p className="pp-note">{t.thirdPartyNote}</p>
              <div className="pp-pills">
                {[
                  'Google Firebase (AB / EU)',
                  'Sign in with Apple',
                  'Google Sign-In',
                  'Google Cloud Vision',
                  'RevenueCat',
                  'Google Play Services',
                  'Firebase Analytics',
                  'Google AdMob',
                  'Google UMP',
                ].map(
                  (s) => (
                    <span key={s} className="pp-pill">
                      {s}
                    </span>
                  )
                )}
              </div>
            </section>

            <section className="pp-section" id="usage">
              <h2 className="display">{t.usageTitle}</h2>
              <p>{t.usageText}</p>
              <ul className="pp-list">
                {t.usageItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="pp-section" id="share">
              <h2 className="display">{t.shareTitle}</h2>
              <p>{t.shareText}</p>
            </section>

            <section className="pp-section" id="children">
              <h2 className="display">{t.childrenTitle}</h2>
              <p>{t.childrenText}</p>
            </section>

            <section className="pp-section" id="changes">
              <h2 className="display">{t.changesTitle}</h2>
              <p>{t.changesText}</p>
            </section>

            <section className="pp-section" id="pp-contact">
              <h2 className="display">{t.contactTitle}</h2>
              <p>{t.contactText}</p>
              <div className="pp-contacts">
                <a href={`mailto:${CONTACT_EMAIL}`} className="pp-contact">
                  <span className="pp-contact-label">E-posta</span>
                  <span className="pp-contact-val">{CONTACT_EMAIL}</span>
                </a>
                <a href={`mailto:${STUDIO_EMAIL}`} className="pp-contact">
                  <span className="pp-contact-label">E-posta · Ardeko Studios</span>
                  <span className="pp-contact-val">{STUDIO_EMAIL}</span>
                </a>
                <a href={SUPPORT_DM_URL} className="pp-contact" target="_blank" rel="noopener noreferrer">
                  <span className="pp-contact-label">{t.instagramLabel}</span>
                  <span className="pp-contact-val">@{SUPPORT_INSTAGRAM}</span>
                </a>
                <Link to="/" className="pp-contact">
                  <span className="pp-contact-label">Web</span>
                  <span className="pp-contact-val">{t.backHome}</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
