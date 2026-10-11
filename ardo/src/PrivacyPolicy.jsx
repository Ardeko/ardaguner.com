import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const CONTACT_EMAIL = 'ardaguner2000@gmail.com';
const STUDIO_EMAIL = 'info@ardekostudios.com';
const CONTROLLER = 'Arda Güner / Ardeko Studios';
const DELETION_PATH = '/torpidodan/hesap-silme';

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
      updated: 'Ekim 2026',
      updatedLabel: 'Son güncelleme',
      controllerLabel: 'Veri sorumlusu',
      subtitle:
        'Google Play, App Store ve ardaguner.com üzerinden sunduğumuz oyunlar ile isteğe bağlı Online liste (Mal Beyanı) özelliği.',
      toc: 'İçindekiler',
      alsoCovers:
        'Politika, Ardeko Studios adıyla yayınlanan tüm mobil uygulamaları ve ardaguner.com üzerinden oynanan tarayıcı oyunlarını kapsar.',
      introTitle: 'Giriş',
      introText:
        'Arda Güner (Ardeko Studios) olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu metin; Google Play ve App Store’da yayınladığımız veya yayınlamayı planladığımız oyunları, ardaguner.com web sitemizi ve bu kanallar üzerinden sunulan hizmetleri kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklar.',
      appsTitle: 'Kapsam — Oyunlarımız',
      appsText:
        'Bu politika aşağıdaki oyunları kapsar. Her oyun aynı veriyi işlemez; Online liste (Mal Beyanı) yalnızca o özelliği açıkça kullandığınız uygulamada geçerlidir.',
      appsLive: 'Yayında',
      appsPlanned: 'Yakında',
      onlineTitle: 'Online liste (Mal Beyanı)',
      onlineLead:
        'Bazı uygulamalarımızda isteğe bağlı bir Online liste (Mal Beyanı) bulunur. Özelliği kullanmazsanız bu veriler gönderilmez. Reklam veya takip SDK’sı yoktur.',
      onlineFacts: [
        {
          label: 'Hangi veriler',
          desc: 'Beyanda yazdığınız içerik (ör. rumuz / görünen ad ve listelediğiniz kalemler), gönderim zamanı ve beyanı geri çekebilmeniz için gereken teknik kimlik. Hesabınızı isteğe bağlı olarak Apple veya Google ile bağlarsanız o hesabın e-posta adresi de saklanır. Konum, rehber, fotoğraf veya reklam kimliği gönderilmez; portre olarak seçtiğiniz fotoğraf yalnızca cihazınızda kalır.',
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
          desc: 'Torpidodan’da Ayarlar → Çevrimiçi hesap → “Çevrimiçi verilerimi sil” ile çevrimiçi verilerinizi anında silebilirsiniz. Uygulamayı sildiyseniz aynı talebi e-posta ile iletebilirsiniz; ayrıntılar aşağıdaki “Verilerini silme” bölümünde.',
        },
        {
          label: 'Haklarınız',
          desc: `KVKK ve GDPR kapsamındaki erişim, düzeltme, silme, işlemeyi kısıtlama, rızayı geri çekme ve (GDPR için) veri taşınabilirliği haklarınızı ${CONTACT_EMAIL} veya ${STUDIO_EMAIL} adresinden kullanabilirsiniz. Şikayet için Kişisel Verileri Koruma Kurulu’na veya yaşadığınız yerdeki denetim otoritesine başvurabilirsiniz.`,
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
      deleteTitle: 'Verilerini silme',
      deleteText:
        'Torpidodan’daki çevrimiçi verilerini uygulama içinden anında silebilirsin: Ayarlar → Çevrimiçi hesap → “Çevrimiçi verilerimi sil” → onayla. Oyun ilerlemen ve portre fotoğrafın zaten yalnızca cihazında durur.',
      deleteLinkLabel: 'Ayrıntılar ve uygulamayı silmiş kullanıcılar için',
      dataTitle: 'Topladığımız bilgiler',
      dataText:
        'Uygulamaya ve kullandığınız özelliğe bağlı olarak aşağıdaki türde bilgiler işlenebilir. Çevrimdışı oyunlarda ilerleme cihazınızda kalır. Online liste (Mal Beyanı) yalnızca o özelliği kullanırsanız veri gönderir.',
      dataItems: [
        {
          label: 'Online liste (Mal Beyanı)',
          desc: 'İsteğe bağlı beyan içeriği ve geri çekme için gereken teknik kimlik. Ayrıntılar yukarıdaki bölümde.',
        },
        {
          label: 'Bağlı hesap e-postası',
          desc: 'Torpidodan’da çevrimiçi hesabınızı isteğe bağlı olarak Apple veya Google ile bağlarsanız o hesabın e-posta adresi. Bağlamazsanız yalnızca anonim bir oturum kimliği kullanılır.',
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
          desc: 'Bazı oyunlarda (ör. Torpidodan, Forza Orbit, Switch Master: Railway) oyun ilerlemesi yalnızca cihazınızda tutulur; sunucularımıza gönderilmez. Torpidodan’da portre olarak seçtiğiniz fotoğraf da cihazınızda kalır.',
        },
      ],
      offlineTitle: 'Çevrimdışı oyunlar',
      offlineText:
        'Torpidodan gibi oyunlarımız giriş gerektirmez ve oyun ilerlemesi cihazınızda kalır; sunucuda tutulmaz. İlerlemeyi silmek için uygulamayı kaldırmanız veya oyun içinden yeni oyun başlatmanız yeterlidir. Torpidodan’ın isteğe bağlı çevrimiçi özelliklerini (ör. Online liste) kullanırsanız anonim bir oturum hesabı oluşturulur ve gönderdiğiniz kayıtlar saklanır; hesabı Apple veya Google ile bağlarsanız o hesabın e-posta adresi de saklanır. Bu özellikler yalnızca açık rızanızla çalışır.',
      thirdPartyTitle: 'Üçüncü taraf hizmetleri',
      thirdPartyText:
        'Online liste (Mal Beyanı) için Avrupa Birliği bölgesindeki Google Firebase kullanılır; bu özellik reklam veya analitik SDK barındırmaz. Çevrimiçi hesabı isteğe bağlı olarak bağlamak için Apple ile Giriş ve Google ile Giriş kullanılır. Reklam veya analitik kullanan diğer uygulamalar aşağıdaki hizmetlerden yararlanabilir.',
      thirdPartyNote:
        'Firebase Analytics ve AdMob yalnızca ilgili uygulamalarda geçerlidir; Mal Beyanı özelliğinde yoktur.',
      usageTitle: 'Bilgilerin kullanımı',
      usageText: 'İşlediğimiz bilgileri şu amaçlarla kullanırız:',
      usageItems: [
        'Açık rızanızla Online liste (Mal Beyanı) kaydını yayınlamak ve geri çekme talebinizi yerine getirmek.',
        'Çevrimiçi hesabınızı Apple veya Google ile bağlarsanız hesabınızı tanımak ve silme talebinizi doğrulamak.',
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
      updated: 'October 2026',
      updatedLabel: 'Last updated',
      controllerLabel: 'Data controller',
      subtitle:
        'Our games on Google Play, the App Store and ardaguner.com, including the optional Online list (Asset Declaration) feature.',
      toc: 'Contents',
      alsoCovers:
        'The policy covers all mobile apps published under the Ardeko Studios name and the browser games playable on ardaguner.com.',
      introTitle: 'Introduction',
      introText:
        'As Arda Güner (Ardeko Studios), I respect your privacy and am committed to protecting your personal data. This notice explains how we collect, use, and share information when you use our games on Google Play and the App Store, our website ardaguner.com, and related services.',
      appsTitle: 'Scope — Our games',
      appsText:
        'This policy covers the games below. Not every game processes the same data. The Online list (Asset Declaration) applies only in apps where you choose to use that feature.',
      appsLive: 'Available now',
      appsPlanned: 'Coming soon',
      onlineTitle: 'Online list (Asset Declaration)',
      onlineLead:
        'Some of our apps offer an optional Online list (Asset Declaration). If you do not use the feature, this data is not sent. The feature has no advertising or tracking SDKs.',
      onlineFacts: [
        {
          label: 'What is sent',
          desc: 'The content you enter in the declaration (for example a display name / nickname and the items you list), the time of submission, and a technical identifier needed so you can withdraw it. If you choose to link your account with Apple or Google, that account’s email address is also stored. Location, contacts, photos, and advertising IDs are not sent; a portrait you pick from your photos stays on your device.',
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
          desc: 'In Torpidodan, go to Settings → Online account → “Delete my online data” to delete your online data instantly. If you uninstalled the app, you can email the same request; see “Deleting your data” below.',
        },
        {
          label: 'Your rights',
          desc: `You may exercise your KVKK and GDPR rights of access, rectification, erasure, restriction, withdrawal of consent, and (under the GDPR) portability by writing to ${CONTACT_EMAIL} or ${STUDIO_EMAIL}. You may also lodge a complaint with the Turkish Personal Data Protection Authority or your local supervisory authority.`,
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
      deleteTitle: 'Deleting your data',
      deleteText:
        'You can delete your Torpidodan online data instantly in the app: Settings → Online account → “Delete my online data” → confirm. Your game progress and portrait photo already stay only on your device.',
      deleteLinkLabel: 'Details, and for users who have uninstalled the app',
      dataTitle: 'Information we process',
      dataText:
        'Depending on the app and the features you use, we may process the types of information below. In offline games, progress stays on your device. The Online list (Asset Declaration) sends data only if you use that feature.',
      dataItems: [
        {
          label: 'Online list (Asset Declaration)',
          desc: 'Optional declaration content and the technical identifier needed to withdraw it. Details are in the section above.',
        },
        {
          label: 'Linked account email',
          desc: 'In Torpidodan, if you choose to link your online account with Apple or Google, that account’s email address. If you don’t link it, only an anonymous session ID is used.',
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
          desc: 'In some games (e.g. Torpidodan, Forza Orbit, Switch Master: Railway), game progress stays on your device and is not sent to our servers. In Torpidodan, a portrait you pick from your photos also stays on your device.',
        },
      ],
      offlineTitle: 'Offline games',
      offlineText:
        'Games such as Torpidodan do not require a login, and game progress stays on your device; it is not kept on a server. Uninstall the app or start a new game to delete it. If you use Torpidodan’s optional online features (e.g. the Online list), an anonymous session account is created and the entries you send are stored; if you link it with Apple or Google, that account’s email address is stored too. These features run only with your explicit consent.',
      thirdPartyTitle: 'Third-party services',
      thirdPartyText:
        'The Online list (Asset Declaration) uses Google Firebase in the European Union. That feature does not include advertising or analytics SDKs. Sign in with Apple and Google Sign-In are used to optionally link your online account. Apps that do use ads or analytics may rely on the services below.',
      thirdPartyNote:
        'Firebase Analytics and AdMob apply only to the relevant apps; they are not used by the Asset Declaration feature.',
      usageTitle: 'Use of information',
      usageText: 'We use processed information to:',
      usageItems: [
        'Publish an Online list (Asset Declaration) entry with your explicit consent and honour withdrawal requests.',
        'Recognise your account and verify deletion requests if you link your online account with Apple or Google.',
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
  const live = GAMES.filter((g) => g.released);
  const planned = GAMES.filter((g) => !g.released);

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
              <div className="pp-facts">
                {t.onlineFacts.map((item) => (
                  <div key={item.label} className="pp-fact">
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                  </div>
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
                  'Google Play Services',
                  'Firebase Analytics',
                  'Google AdMob',
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
