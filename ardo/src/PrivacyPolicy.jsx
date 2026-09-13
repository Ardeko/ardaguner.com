import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

<<<<<<< HEAD
const CONTACT_EMAIL = 'ardaguner2000@gmail.com';
const CONTROLLER = 'Arda Güner / Ardeko Studios';

/** Mağaza ikonları: `public/apps/{slug}.png` */
const APPS = [
  {
    slug: 'switch-master',
    name: 'Switch Master: Railway',
    tag: { tr: 'Yayında', en: 'Live' },
    note: { tr: 'Yerel oyun; hesap gerekmez', en: 'Local play; no account required' },
  },
  {
    slug: 'forza-orbit',
    name: 'Forza Orbit',
    tag: { tr: 'Arcade', en: 'Arcade' },
    note: { tr: 'Yerel skor; hesap gerekmez', en: 'Local scores; no account required' },
  },
  {
    slug: 'torpidodan',
    name: 'Torpidodan',
    tag: { tr: 'Simülasyon', en: 'Simulation' },
    note: { tr: 'Çevrimdışı oyun; hesap gerekmez', en: 'Offline play; no account required' },
  },
  {
    slug: 'kafa-kafaya',
    name: 'Kafa Kafaya',
    tag: { tr: 'Spor', en: 'Sports' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
=======
/* Politikanın kapsadığı oyunlar.

   Eskiden bu dizinin adı PLANNED_GAMES'ti ve bölüm başlığı "yakında
   mağazaya yüklenecek" diyordu. Skyline Swinger, Rushville ve
   Torpidodan çıkınca o cümle yanlış bir beyana dönüştü — yayında olan
   bir uygulamayı "planlanan" diye listeleyen bir politika, mağazanın
   veri güvenliği formuyla çelişir.

   Yayında ve yakında ayrımı `released` alanıyla yapılıyor, iki ayrı
   dizi tutulmuyor: ayrı tutulsaydı bir oyun çıktığında biri
   güncellenip diğeri unutulurdu. Yeni oyun eklerken tek yapılacak
   şey buraya bir satır yazmak. */
const GAMES = [
  {
    name: 'Switch Master: Railway',
    released: true,
    tag: { tr: 'Bulmaca', en: 'Puzzle' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
    tone: 'switch',
  },
  {
    name: 'Skyline Swinger',
    released: true,
    tag: { tr: 'Koşu', en: 'Runner' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
    tone: 'sky',
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b
  },
  {
    slug: 'rushville',
    name: 'Rushville',
    released: true,
    tag: { tr: 'Bulmaca', en: 'Puzzle' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
  },
  {
<<<<<<< HEAD
    slug: 'skyline-swinger',
    name: 'Skyline Swinger',
    tag: { tr: 'Koşu', en: 'Runner' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
=======
    name: 'Torpidodan',
    released: true,
    tag: { tr: 'Simülasyon', en: 'Simulation' },
    note: { tr: 'Mobil · tamamen çevrimdışı', en: 'Mobile · fully offline' },
    tone: 'torpidodan',
  },
  {
    name: 'Forza Orbit',
    released: true,
    tag: { tr: 'Arcade', en: 'Arcade' },
    note: {
      tr: 'Tarayıcı · yerel skor, hesap gerekmez',
      en: 'Browser · local scores, no account',
    },
    tone: 'orbit',
  },
  {
    name: 'Kafa Kafaya',
    released: false,
    tag: { tr: 'Spor', en: 'Sports' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
    tone: 'kafa',
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b
  },
];

const SECTIONS = [
  { id: 'intro', key: 'introTitle' },
  { id: 'apps', key: 'appsTitle' },
  { id: 'online-list', key: 'onlineTitle' },
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
      src={`/apps/${slug}.png`}
      alt=""
      width={52}
      height={52}
      onError={() => setBroken(true)}
    />
  );
}

const PrivacyPolicy = ({ language = 'tr' }) => {
  const content = {
    tr: {
      badge: 'Gizlilik',
      title: 'Gizlilik Politikası',
<<<<<<< HEAD
      updated: 'Eylül 2026',
      updatedLabel: 'Son güncelleme',
      controllerLabel: 'Veri sorumlusu',
      subtitle:
        'Google Play, App Store ve ardaguner.com üzerinden sunduğumuz oyunlar ile isteğe bağlı Online liste (Mal Beyanı) özelliği.',
      toc: 'İçindekiler',
      alsoCovers:
        'Bu politika Switch Master: Railway dahil tüm Ardeko Studios mobil uygulamalarını kapsar.',
      introTitle: 'Giriş',
      introText:
        'Arda Güner (Ardeko Studios) olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu metin; Google Play ve App Store’da yayınladığımız veya yayınlamayı planladığımız oyunları, ardaguner.com web sitemizi ve bu kanallar üzerinden sunulan hizmetleri kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklar.',
      appsTitle: 'Kapsam — Uygulamalar',
      appsText:
        'Aşağıdaki başlıklar bu politikanın kapsadığı veya yakında mağazaya yüklenecek oyunlarımızdır. Her oyun aynı veriyi işlemez; Online liste (Mal Beyanı) yalnızca o özelliği açıkça kullandığınız uygulamada geçerlidir.',
      onlineTitle: 'Online liste (Mal Beyanı)',
      onlineLead:
        'Bazı uygulamalarımızda isteğe bağlı bir Online liste (Mal Beyanı) bulunur. Özelliği kullanmazsanız bu veriler gönderilmez. Reklam veya takip SDK’sı yoktur.',
      onlineFacts: [
        {
          label: 'Hangi veriler',
          desc: 'Beyanda yazdığınız içerik (ör. rumuz / görünen ad ve listelediğiniz kalemler), gönderim zamanı ve beyanı geri çekebilmeniz için gereken teknik kimlik. Konum, rehber, fotoğraf veya reklam kimliği gönderilmez.',
        },
        {
          label: 'Amaç ve dayanak',
          desc: 'Amacımız beyanınızı diğer oyuncuların görebileceği çevrimiçi listede yayınlamaktır. Hukuki dayanak açık rızanızdır (KVKK m. 5/1; GDPR m. 6/1-a). Rıza vermeden beyan gönderilmez.',
        },
        {
          label: 'Kim görür',
          desc: 'Yayınlanan beyan, uygulamayı kullanan diğer kişiler tarafından listede görülebilir. Veri sorumlusu olarak Arda Güner / Ardeko Studios, işlemi yürütmek ve silme taleplerini yerine getirmek için verilere erişebilir.',
        },
        {
          label: 'Nerede tutulur',
          desc: 'Veriler Avrupa Birliği bölgesindeki Google Firebase altyapısında tutulur.',
        },
        {
          label: 'Silme',
          desc: 'Uygulama içindeki “Beyanımı geri çek” ile beyanınızı silebilirsiniz. Silme, listedeki kaydı kaldırır. Aynı talebi e-posta ile de iletebilirsiniz.',
        },
        {
          label: 'Haklarınız',
          desc: `KVKK ve GDPR kapsamındaki erişim, düzeltme, silme, işlemeyi kısıtlama, rızayı geri çekme ve (GDPR için) veri taşınabilirliği haklarınızı ${CONTACT_EMAIL} adresinden kullanabilirsiniz. Şikayet için Kişisel Verileri Koruma Kurulu’na veya yaşadığınız yerdeki denetim otoritesine başvurabilirsiniz.`,
        },
        {
          label: 'Çocuklar',
          desc: 'Bu özellik 13 yaş altındaki çocuklar için değildir. 13 yaş altından bilerek veri toplamayız. Böyle bir beyan fark edersek sileriz.',
        },
        {
          label: 'Reklam ve takip',
          desc: 'Online liste (Mal Beyanı) reklam, izleme veya analitik SDK kullanmaz. Beyan verisi reklam amacıyla işlenmez, satılmaz ve reklam ortaklarıyla paylaşılmaz.',
        },
      ],
=======
      updated: 'Son güncelleme: Eylül 2026',
      subtitle: 'Mobil oyunlar ve ardaguner.com',
      toc: 'İçindekiler',
      alsoCovers:
        'Politika, Ardeko Studios adıyla yayınlanan tüm mobil uygulamaları ve ardaguner.com üzerinden oynanan tarayıcı oyunlarını kapsar.',
      introTitle: 'Giriş',
      introText:
        'Arda Güner (Ardeko Studios) olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu metin; Google Play ve App Store’da yayınladığımız veya yayınlamayı planladığımız oyunları, ardaguner.com web sitemizi ve bu kanallar üzerinden sunulan hizmetleri kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklar.',
      appsTitle: 'Kapsam — Oyunlarımız',
      appsText:
        'Bu politika aşağıdaki oyunları kapsar. Her oyun aynı veriyi toplamaz; ilgili bölümlerde farklar belirtilmiştir.',
      appsLive: 'Yayında',
      appsPlanned: 'Yakında',
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b
      dataTitle: 'Topladığımız bilgiler',
      dataText:
        'Uygulamaya ve kullandığınız özelliğe bağlı olarak aşağıdaki türde bilgiler işlenebilir. Çevrimdışı oyunlarda ilerleme cihazınızda kalır. Online liste (Mal Beyanı) yalnızca o özelliği kullanırsanız veri gönderir.',
      dataItems: [
        {
          label: 'Online liste (Mal Beyanı)',
          desc: 'İsteğe bağlı beyan içeriği ve geri çekme için gereken teknik kimlik. Ayrıntılar yukarıdaki bölümde.',
        },
        {
          label: 'Cihaz bilgileri',
          desc: 'Cihaz modeli, işletim sistemi, benzersiz tanımlayıcılar (ör. reklam kimlikleri) — yalnızca reklam veya analitik kullanan uygulamalarda.',
        },
        {
          label: 'Kullanım verileri',
          desc: 'Uygulama içi etkileşimler, oynama süreleri ve hata/çökme raporları — analitik entegre edilmiş uygulamalarda.',
        },
        {
          label: 'Yerel oyun verisi',
          desc: 'Bazı oyunlarda (ör. Torpidodan, Forza Orbit, Switch Master: Railway) kayıt yalnızca cihazınızda tutulur; sunucularımıza gönderilmez.',
        },
      ],
      offlineTitle: 'Çevrimdışı oyunlar',
      offlineText:
        'Torpidodan gibi çevrimdışı çalışan oyunlarımız hesap veya giriş gerektirmez. Oyun ilerlemesi cihazınızda kalır. İlerlemeyi silmek için uygulamayı kaldırmanız veya oyun içinden yeni oyun başlatmanız yeterlidir. Online liste (Mal Beyanı) sunuluyorsa o özellik bu kuralın dışındadır ve yalnızca açık rızanızla çalışır.',
      thirdPartyTitle: 'Üçüncü taraf hizmetleri',
      thirdPartyText:
        'Online liste (Mal Beyanı) için Avrupa Birliği bölgesindeki Google Firebase kullanılır; bu özellik reklam veya analitik SDK barındırmaz. Reklam veya analitik kullanan diğer uygulamalar aşağıdaki hizmetlerden yararlanabilir.',
      thirdPartyNote: 'Firebase Analytics ve AdMob yalnızca ilgili uygulamalarda geçerlidir; Mal Beyanı özelliğinde yoktur.',
      usageTitle: 'Bilgilerin kullanımı',
      usageText: 'İşlediğimiz bilgileri şu amaçlarla kullanırız:',
      usageItems: [
        'Açık rızanızla Online liste (Mal Beyanı) kaydını yayınlamak ve geri çekme talebinizi yerine getirmek.',
        'Oyunların düzgün çalışmasını sağlamak ve iyileştirmek.',
        'Teknik sorunları tespit edip çözmek.',
        'Reklam gösterilen uygulamalarda uygun reklamlar sunmak.',
      ],
      shareTitle: 'Bilgilerin paylaşımı',
      shareText:
        'Kullanıcı verilerini satmıyoruz. Online liste (Mal Beyanı) kaydı, özelliğin doğası gereği uygulamadaki diğer kullanıcılara görünür. Reklam veya analitik kullanan uygulamalarda anonimleştirilmiş veriler ilgili üçüncü taraf ortaklarla paylaşılabilir. Bunun dışında verileriniz yalnızca yasal zorunluluk halinde yetkili mercilerle paylaşılır.',
      childrenTitle: 'Çocuklar',
      childrenText:
        'Oyunlarımız genel kitleye uygundur. Online liste (Mal Beyanı) 13 yaş altı için değildir. Bilerek 13 yaş altından kişisel veri toplamıyoruz. Ebeveyn veya veli olarak endişeniz varsa bizimle iletişime geçin.',
      changesTitle: 'Değişiklikler',
      changesText:
        'Bu politika güncellenebilir. Güncel sürüm ardaguner.com/privacy-policy adresinde yayınlanır. Yeni oyun veya özellik eklendiğinde sayfa güncellenir.',
      contactTitle: 'İletişim',
      contactText: `Sorular, rıza geri çekme ve KVKK / GDPR talepleri için veri sorumlusu ${CONTROLLER}:`,
      backHome: 'Anasayfaya dön',
    },
    en: {
      badge: 'Privacy',
      title: 'Privacy Policy',
<<<<<<< HEAD
      updated: 'September 2026',
      updatedLabel: 'Last updated',
      controllerLabel: 'Data controller',
      subtitle:
        'Our games on Google Play, the App Store and ardaguner.com, including the optional Online list (Asset Declaration) feature.',
      toc: 'Contents',
      alsoCovers:
        'This policy covers all Ardeko Studios mobile apps, including Switch Master: Railway.',
      introTitle: 'Introduction',
      introText:
        'As Arda Güner (Ardeko Studios), I respect your privacy and am committed to protecting your personal data. This notice explains how we collect, use, and share information when you use our games on Google Play and the App Store, our website ardaguner.com, and related services.',
      appsTitle: 'Scope — Apps',
      appsText:
        'The titles below are covered by this policy or planned for store release. Not every game processes the same data. The Online list (Asset Declaration) applies only in apps where you choose to use that feature.',
      onlineTitle: 'Online list (Asset Declaration)',
      onlineLead:
        'Some of our apps offer an optional Online list (Asset Declaration). If you do not use the feature, this data is not sent. The feature has no advertising or tracking SDKs.',
      onlineFacts: [
        {
          label: 'What is sent',
          desc: 'The content you enter in the declaration (for example a display name / nickname and the items you list), the time of submission, and a technical identifier needed so you can withdraw it. Location, contacts, photos, and advertising IDs are not sent.',
        },
        {
          label: 'Purpose and legal basis',
          desc: 'The purpose is to publish your declaration on the in-app online list visible to other players. The legal basis is your explicit consent (KVKK Art. 5/1; GDPR Art. 6/1-a). Nothing is sent without that consent.',
        },
        {
          label: 'Who can see it',
          desc: 'A published declaration is visible to other people using the app. As data controller, Arda Güner / Ardeko Studios can access the data to operate the feature and honour deletion requests.',
        },
        {
          label: 'Where it is stored',
          desc: 'The data is stored on Google Firebase infrastructure in the European Union.',
        },
        {
          label: 'Deletion',
          desc: 'Use “Beyanımı geri çek” (Withdraw my declaration) in the app to delete your entry from the list. You may also email the same request.',
        },
        {
          label: 'Your rights',
          desc: `You may exercise your KVKK and GDPR rights of access, rectification, erasure, restriction, withdrawal of consent, and (under the GDPR) portability by writing to ${CONTACT_EMAIL}. You may also lodge a complaint with the Turkish Personal Data Protection Authority or your local supervisory authority.`,
        },
        {
          label: 'Children',
          desc: 'This feature is not for children under 13. We do not knowingly collect data from children under 13. If we become aware of such a declaration, we delete it.',
        },
        {
          label: 'Ads and tracking',
          desc: 'The Online list (Asset Declaration) does not use advertising, tracking, or analytics SDKs. Declaration data is not used for advertising, is not sold, and is not shared with advertising partners.',
        },
      ],
      dataTitle: 'Information we process',
=======
      updated: 'Last updated: September 2026',
      subtitle: 'Mobile games and ardaguner.com',
      toc: 'Contents',
      alsoCovers:
        'The policy covers all mobile apps published under the Ardeko Studios name and the browser games playable on ardaguner.com.',
      introTitle: 'Introduction',
      introText:
        'As Arda Güner (Ardeko Studios), I respect your privacy and am committed to protecting your personal data. This notice explains how we collect, use, and share information when you use our games on Google Play and the App Store, our website ardaguner.com, and related services.',
      appsTitle: 'Scope — Our games',
      appsText:
        'This policy covers the games below. Not every game collects the same data; differences are noted in the relevant sections.',
      appsLive: 'Available now',
      appsPlanned: 'Coming soon',
      dataTitle: 'Information we collect',
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b
      dataText:
        'Depending on the app and the features you use, we may process the types of information below. In offline games, progress stays on your device. The Online list (Asset Declaration) sends data only if you use that feature.',
      dataItems: [
        {
          label: 'Online list (Asset Declaration)',
          desc: 'Optional declaration content and the technical identifier needed to withdraw it. Details are in the section above.',
        },
        {
          label: 'Device information',
          desc: 'Device model, OS version, unique identifiers (e.g. ad IDs) — only in apps that use ads or analytics.',
        },
        {
          label: 'Usage data',
          desc: 'In-app interactions, play time, and crash reports — in apps with analytics.',
        },
        {
          label: 'Local game data',
          desc: 'In some games (e.g. Torpidodan, Forza Orbit, Switch Master: Railway), saves stay on your device and are not sent to our servers.',
        },
      ],
      offlineTitle: 'Offline games',
      offlineText:
        'Fully offline games such as Torpidodan do not require an account or login. Progress stays on your device. Uninstall the app or start a new game to delete it. If an Online list (Asset Declaration) is offered, that feature is the exception and runs only with your explicit consent.',
      thirdPartyTitle: 'Third-party services',
      thirdPartyText:
        'The Online list (Asset Declaration) uses Google Firebase in the European Union. That feature does not include advertising or analytics SDKs. Apps that do use ads or analytics may rely on the services below.',
      thirdPartyNote:
        'Firebase Analytics and AdMob apply only to the relevant apps; they are not used by the Asset Declaration feature.',
      usageTitle: 'Use of information',
      usageText: 'We use processed information to:',
      usageItems: [
        'Publish an Online list (Asset Declaration) entry with your explicit consent and honour withdrawal requests.',
        'Ensure proper functioning and improvement of our games.',
        'Detect and resolve technical issues.',
        'Serve ads in apps that display advertising.',
      ],
      shareTitle: 'Sharing of information',
      shareText:
        'We do not sell user data. An Online list (Asset Declaration) entry is visible to other users of that app by design. In apps with ads or analytics, anonymized data may be shared with relevant third-party partners. Otherwise, data is shared with authorities only when legally required.',
      childrenTitle: 'Children',
      childrenText:
        'Our games are suitable for general audiences. The Online list (Asset Declaration) is not for children under 13. We do not knowingly collect personal data from children under 13. Parents may contact us with any concerns.',
      changesTitle: 'Changes',
      changesText:
        'This policy may be updated. The current version is at ardaguner.com/privacy-policy. This page is updated when new games or features are added.',
      contactTitle: 'Contact',
      contactText: `Questions, consent withdrawal, and KVKK / GDPR requests — data controller ${CONTROLLER}:`,
      backHome: 'Back to home',
    },
  };

  const t = content[language] || content.tr;

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
        </header>

        <div className="pp-layout">
          <aside className="pp-toc" aria-label={t.toc}>
            <p className="eyebrow pp-toc-label">{t.toc}</p>
            <ol>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{t[s.key]}</a>
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

<<<<<<< HEAD
            <section className="pp-section" id="apps">
              <h2 className="display">{t.appsTitle}</h2>
              <p>{t.appsText}</p>
              <div className="pp-games">
                {APPS.map((game) => (
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
            </section>

            <section className="pp-section pp-callout" id="online-list">
              <h2 className="display">{t.onlineTitle}</h2>
              <p>{t.onlineLead}</p>
              <div className="pp-facts">
                {t.onlineFacts.map((item) => (
                  <div key={item.label} className="pp-fact">
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
=======
          <section className="pp__section" id="apps">
            <h2>{t.appsTitle}</h2>
            <p>{t.appsText}</p>

            {/* Boş grup hiç basılmıyor: son planlanan oyun da çıktığında
                başlıksız bir "Yakında" bloğu kalmasın. */}
            {[
              [t.appsLive, GAMES.filter((g) => g.released)],
              [t.appsPlanned, GAMES.filter((g) => !g.released)],
            ]
              .filter(([, list]) => list.length > 0)
              .map(([label, list]) => (
                <div className="pp__games-group" key={label}>
                  <p className="pp__group-label">{label}</p>
                  <div className="pp__games">
                    {list.map((game) => (
                      <article key={game.name} className={`pp__game pp__game--${game.tone}`}>
                        <div className="pp__game-head">
                          <span className="pp__game-initial" aria-hidden="true">
                            {game.name.charAt(0)}
                          </span>
                          <div>
                            <h3>{game.name}</h3>
                            <span className="pp__game-tag">
                              {game.tag[language] || game.tag.tr}
                            </span>
                          </div>
                        </div>
                        <p>{game.note[language] || game.note.tr}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
          </section>
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b

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
                {['Google Firebase (AB / EU)', 'Google Play Services', 'Firebase Analytics', 'Google AdMob'].map(
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
                <Link to="/" className="pp-contact">
                  <span className="pp-contact-label">Web</span>
                  <span className="pp-contact-val">{t.backHome}</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
<<<<<<< HEAD
    </main>
=======

      <style>{`
        .pp {
          --pp-bg: #070b10;
          --pp-surface: rgba(14, 20, 28, 0.82);
          --pp-border: rgba(255, 255, 255, 0.07);
          --pp-text: #e8edf4;
          --pp-muted: #8b9bb0;
          --pp-accent: #5eb8ff;
          --pp-accent-soft: rgba(94, 184, 255, 0.12);
          position: relative;
          min-height: 100vh;
          color: var(--pp-text);
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }
        .pp__bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .pp__glow {
          position: fixed;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.35;
          pointer-events: none;
        }
        .pp__glow--a { top: -120px; right: -80px; background: #1a4a7a; }
        .pp__glow--b { bottom: -160px; left: -100px; background: #0d3d35; }

        .pp__top {
          position: relative;
          z-index: 2;
          max-width: 1120px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pp__brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          color: inherit;
        }
        .pp__brand-mark {
          width: 2rem;
          height: 2rem;
          border-radius: 8px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 0.9rem;
          background: linear-gradient(135deg, #3d7ab8, #5eb8ff);
          color: #041018;
        }
        .pp__brand-text {
          font-weight: 600;
          letter-spacing: 0.02em;
          font-size: 0.95rem;
        }
        .pp__lang {
          font-size: 0.8rem;
          color: var(--pp-muted);
          text-decoration: none;
          border: 1px solid var(--pp-border);
          padding: 0.4rem 0.75rem;
          border-radius: 999px;
          transition: border-color 0.2s, color 0.2s;
        }
        .pp__lang:hover { color: var(--pp-text); border-color: rgba(94, 184, 255, 0.4); }

        .pp__wrap {
          position: relative;
          z-index: 1;
          max-width: 1120px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .pp__aside {
          position: sticky;
          top: 1.5rem;
        }
        .pp__badge {
          display: inline-block;
          margin: 0 0 1rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--pp-accent);
          background: var(--pp-accent-soft);
          border: 1px solid rgba(94, 184, 255, 0.2);
        }
        .pp__title {
          margin: 0 0 0.5rem;
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .pp__date {
          margin: 0 0 0.35rem;
          font-size: 0.8rem;
          color: var(--pp-muted);
        }
        .pp__sub {
          margin: 0 0 1.75rem;
          font-size: 0.9rem;
          color: var(--pp-muted);
        }
        .pp__toc-label {
          margin: 0 0 0.65rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--pp-muted);
          font-weight: 700;
        }
        .pp__toc ol {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .pp__toc a {
          display: block;
          padding: 0.4rem 0.65rem;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--pp-muted);
          text-decoration: none;
          border-left: 2px solid transparent;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }
        .pp__toc a:hover {
          color: var(--pp-text);
          background: rgba(255,255,255,0.03);
          border-left-color: var(--pp-accent);
        }

        .pp__main {
          background: var(--pp-surface);
          border: 1px solid var(--pp-border);
          border-radius: 20px;
          padding: 2rem 2rem 2.5rem;
          backdrop-filter: blur(12px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
        }
        .pp__section {
          padding-bottom: 2rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--pp-border);
          scroll-margin-top: 1.5rem;
        }
        .pp__section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .pp__section h2 {
          margin: 0 0 0.85rem;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .pp__section p {
          margin: 0;
          line-height: 1.7;
          color: #b8c5d6;
          font-size: 0.95rem;
        }
        .pp__lead { font-weight: 500; color: var(--pp-text); margin-bottom: 1rem !important; }
        .pp__note {
          margin-top: 0.85rem !important;
          font-size: 0.85rem !important;
          color: var(--pp-muted) !important;
          font-style: italic;
        }

        .pp__games-group + .pp__games-group { margin-top: 1.5rem; }
        .pp__group-label {
          margin: 1.25rem 0 0 !important;
          font-size: 0.7rem !important;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--pp-muted) !important;
        }
        .pp__games {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.85rem;
          margin-top: 1.25rem;
        }
        .pp__game {
          padding: 1rem 1.05rem;
          border-radius: 14px;
          border: 1px solid var(--pp-border);
          background: rgba(0, 0, 0, 0.22);
          transition: transform 0.2s, border-color 0.2s;
        }
        .pp__game:hover {
          transform: translateY(-2px);
          border-color: rgba(94, 184, 255, 0.25);
        }
        .pp__game-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.55rem;
        }
        .pp__game-initial {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 0.95rem;
          flex-shrink: 0;
        }
        .pp__game--switch .pp__game-initial { background: linear-gradient(135deg, #fb7185, #e11d48); color: #1c0409; }
        .pp__game--orbit .pp__game-initial { background: linear-gradient(135deg, #ff6b4a, #ff9f43); color: #1a0800; }
        .pp__game--torpidodan .pp__game-initial { background: linear-gradient(135deg, #f7bd3f, #1450a8); color: #0f1419; }
        .pp__game--kafa .pp__game-initial { background: linear-gradient(135deg, #a78bfa, #6366f1); color: #0f0a1a; }
        .pp__game--rush .pp__game-initial { background: linear-gradient(135deg, #34d399, #059669); color: #021a12; }
        .pp__game--sky .pp__game-initial { background: linear-gradient(135deg, #60a5fa, #818cf8); color: #0a1020; }
        .pp__game h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .pp__game-tag {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--pp-muted);
        }
        .pp__game p {
          font-size: 0.82rem !important;
          color: var(--pp-muted) !important;
        }

        .pp__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.85rem;
        }
        .pp__card {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--pp-border);
          background: rgba(0, 0, 0, 0.18);
        }
        .pp__card h3 {
          margin: 0 0 0.4rem;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--pp-accent);
        }
        .pp__card p { font-size: 0.88rem !important; }

        .pp__pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .pp__pill {
          padding: 0.45rem 0.8rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid var(--pp-border);
          background: rgba(0, 0, 0, 0.25);
          color: #c5d0de;
        }

        .pp__list {
          margin: 1rem 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .pp__list li {
          position: relative;
          padding-left: 1.1rem;
          font-size: 0.92rem;
          color: #b8c5d6;
          line-height: 1.55;
        }
        .pp__list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--pp-accent);
        }

        .pp__contacts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .pp__contact {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--pp-border);
          background: rgba(0, 0, 0, 0.2);
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .pp__contact:hover {
          border-color: rgba(94, 184, 255, 0.35);
          background: rgba(94, 184, 255, 0.06);
        }
        .pp__contact-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--pp-muted);
          font-weight: 700;
        }
        .pp__contact-val {
          font-size: 0.9rem;
          color: var(--pp-text);
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .pp__wrap {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .pp__aside { position: static; }
          .pp__toc { display: none; }
          .pp__main { padding: 1.35rem 1.25rem 1.75rem; }
        }
      `}</style>
    </div>
>>>>>>> 25eedc15dbcb76cd3f4f160362195a0f2c57c44b
  );
};

export default PrivacyPolicy;
