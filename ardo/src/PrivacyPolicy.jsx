import { Link } from 'react-router-dom';

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
  },
  {
    name: 'Rushville',
    released: true,
    tag: { tr: 'Bulmaca', en: 'Puzzle' },
    note: { tr: 'Mobil · iOS & Android', en: 'Mobile · iOS & Android' },
    tone: 'rush',
  },
  {
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
  },
];

const SECTIONS = [
  { id: 'intro', key: 'introTitle' },
  { id: 'apps', key: 'appsTitle' },
  { id: 'data', key: 'dataTitle' },
  { id: 'offline', key: 'offlineTitle' },
  { id: 'third-party', key: 'thirdPartyTitle' },
  { id: 'usage', key: 'usageTitle' },
  { id: 'share', key: 'shareTitle' },
  { id: 'children', key: 'childrenTitle' },
  { id: 'changes', key: 'changesTitle' },
  { id: 'contact', key: 'contactTitle' },
];

const PrivacyPolicy = ({ language = 'tr' }) => {
  const content = {
    tr: {
      studio: 'Ardeko Studios',
      badge: 'Gizlilik & Veri Bildirimi',
      title: 'Gizlilik Politikası',
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
      dataTitle: 'Topladığımız bilgiler',
      dataText:
        'Uygulamaya bağlı olarak aşağıdaki türde bilgiler toplanabilir. Çevrimdışı oyunlarımız (ör. Torpidodan) kişisel veri toplamaz; oyun ilerlemesi yalnızca cihazınızda saklanır.',
      dataItems: [
        {
          label: 'Cihaz bilgileri',
          desc: 'Cihaz modeli, işletim sistemi, benzersiz tanımlayıcılar (ör. reklam kimlikleri) — yalnızca reklam veya analitik kullanan uygulamalarda.',
        },
        {
          label: 'Kullanım verileri',
          desc: 'Uygulama içi etkileşimler, oynama süreleri ve hata/çökme raporları — analitik entegre edilmiş uygulamalarda.',
        },
        {
          label: 'Kullanıcı tarafından sağlanan veriler',
          desc: 'Kayıt veya iletişim özelliği sunulan uygulamalarda isteyerek verdiğiniz ad, e-posta veya kullanıcı adı.',
        },
        {
          label: 'Yerel oyun verisi',
          desc: 'Bazı oyunlarda (ör. Torpidodan, Forza Orbit) kayıt yalnızca cihazınızda tutulur; sunucularımıza gönderilmez.',
        },
      ],
      offlineTitle: 'Çevrimdışı oyunlar',
      offlineText:
        'Torpidodan gibi tamamen çevrimdışı çalışan oyunlarımız hesap, giriş veya kişisel veri toplama gerektirmez. İlerlemenizi silmek için uygulamayı kaldırmanız veya oyun içinden yeni oyun başlatmanız yeterlidir.',
      thirdPartyTitle: 'Üçüncü taraf hizmetleri',
      thirdPartyText:
        'Reklam veya analitik kullanan uygulamalarımız aşağıdaki hizmetlerden yararlanabilir. Çevrimdışı oyunlarımız bu hizmetleri kullanmaz.',
      thirdPartyNote: 'Yalnızca ilgili uygulamalarda geçerlidir.',
      usageTitle: 'Bilgilerin kullanımı',
      usageText: 'Topladığımız bilgileri temel olarak şu amaçlarla kullanırız:',
      usageItems: [
        'Oyunların düzgün çalışmasını sağlamak ve iyileştirmek.',
        'Teknik sorunları tespit edip çözmek.',
        'Kullanıcı deneyimini geliştirmek.',
        'Reklam gösterilen uygulamalarda uygun reklamlar sunmak.',
      ],
      shareTitle: 'Bilgilerin paylaşımı',
      shareText:
        'Kullanıcı verilerini satmıyoruz. Reklam veya analitik kullanan uygulamalarda anonimleştirilmiş veriler ilgili üçüncü taraf ortaklarla paylaşılabilir. Bunun dışında verileriniz yalnızca yasal zorunluluk halinde yetkili mercilerle paylaşılır.',
      childrenTitle: 'Çocuklar',
      childrenText:
        'Oyunlarımız genel kitleye uygundur. Bilerek 13 yaş altından kişisel veri toplamıyoruz. Ebeveyn veya veli olarak endişeniz varsa bizimle iletişime geçin.',
      changesTitle: 'Değişiklikler',
      changesText:
        'Bu politika güncellenebilir. Güncel sürüm ardaguner.com/privacy-policy adresinde yayınlanır. Yeni oyun eklendiğinde sayfa güncellenir.',
      contactTitle: 'İletişim',
      contactText: 'Sorularınız için:',
      backHome: 'Anasayfaya dön',
      langSwitch: 'English',
    },
    en: {
      studio: 'Ardeko Studios',
      badge: 'Privacy & Data Notice',
      title: 'Privacy Policy',
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
      dataText:
        'Depending on the app, we may collect the following types of information. Our fully offline games (e.g. Torpidodan) do not collect personal data; progress is stored only on your device.',
      dataItems: [
        {
          label: 'Device information',
          desc: 'Device model, OS version, unique identifiers (e.g. ad IDs) — only in apps that use ads or analytics.',
        },
        {
          label: 'Usage data',
          desc: 'In-app interactions, play time, and crash reports — in apps with analytics.',
        },
        {
          label: 'User-provided data',
          desc: 'Name, email, or username you voluntarily provide where registration or contact features exist.',
        },
        {
          label: 'Local game data',
          desc: 'In some games (e.g. Torpidodan, Forza Orbit), saves stay on your device and are not sent to our servers.',
        },
      ],
      offlineTitle: 'Offline games',
      offlineText:
        'Fully offline games such as Torpidodan do not require accounts, login, or personal data collection. Uninstall the app or start a new game to delete progress.',
      thirdPartyTitle: 'Third-party services',
      thirdPartyText:
        'Apps that use ads or analytics may rely on the services below. Offline games do not use them.',
      thirdPartyNote: 'Applies only to relevant apps.',
      usageTitle: 'Use of information',
      usageText: 'We primarily use collected information to:',
      usageItems: [
        'Ensure proper functioning and improvement of our games.',
        'Detect and resolve technical issues.',
        'Enhance the user experience.',
        'Serve relevant ads in apps that display advertising.',
      ],
      shareTitle: 'Sharing of information',
      shareText:
        'We do not sell user data. In apps with ads or analytics, anonymized data may be shared with relevant third-party partners. Otherwise, data is shared with authorities only when legally required.',
      childrenTitle: 'Children',
      childrenText:
        'Our games are suitable for general audiences. We do not knowingly collect personal data from children under 13. Parents may contact us with any concerns.',
      changesTitle: 'Changes',
      changesText:
        'This policy may be updated. The current version is at ardaguner.com/privacy-policy. This page is updated when new games are added.',
      contactTitle: 'Contact',
      contactText: 'Questions:',
      backHome: 'Back to home',
      langSwitch: 'Türkçe',
    },
  };

  const t = content[language] || content.tr;
  const otherLang = language === 'tr' ? 'en' : 'tr';

  return (
    <div className="pp">
      <div className="pp__bg" aria-hidden="true" />
      <div className="pp__glow pp__glow--a" aria-hidden="true" />
      <div className="pp__glow pp__glow--b" aria-hidden="true" />

      <header className="pp__top">
        <Link to="/" className="pp__brand">
          <span className="pp__brand-mark">A</span>
          <span className="pp__brand-text">{t.studio}</span>
        </Link>
        <Link to="/privacy-policy" className="pp__lang" onClick={(e) => {
          e.preventDefault();
          window.localStorage.setItem('ardaguner-dil', otherLang);
          window.location.reload();
        }}>
          {t.langSwitch}
        </Link>
      </header>

      <div className="pp__wrap">
        <aside className="pp__aside">
          <p className="pp__badge">{t.badge}</p>
          <h1 className="pp__title">{t.title}</h1>
          <p className="pp__date">{t.updated}</p>
          <p className="pp__sub">{t.subtitle}</p>

          <nav className="pp__toc" aria-label={t.toc}>
            <p className="pp__toc-label">{t.toc}</p>
            <ol>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{t[s.key]}</a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <main className="pp__main">
          <section className="pp__section" id="intro">
            <h2>{t.introTitle}</h2>
            <p>{t.introText}</p>
            <p className="pp__note">{t.alsoCovers}</p>
          </section>

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

          <section className="pp__section" id="data">
            <h2>{t.dataTitle}</h2>
            <p className="pp__lead">{t.dataText}</p>
            <div className="pp__grid">
              {t.dataItems.map((item) => (
                <div key={item.label} className="pp__card">
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pp__section" id="offline">
            <h2>{t.offlineTitle}</h2>
            <p>{t.offlineText}</p>
          </section>

          <section className="pp__section" id="third-party">
            <h2>{t.thirdPartyTitle}</h2>
            <p>{t.thirdPartyText}</p>
            <p className="pp__note">{t.thirdPartyNote}</p>
            <div className="pp__pills">
              {['Google Play Services', 'Firebase Analytics', 'Google AdMob'].map((s) => (
                <span key={s} className="pp__pill">{s}</span>
              ))}
            </div>
          </section>

          <section className="pp__section" id="usage">
            <h2>{t.usageTitle}</h2>
            <p>{t.usageText}</p>
            <ul className="pp__list">
              {t.usageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="pp__section" id="share">
            <h2>{t.shareTitle}</h2>
            <p>{t.shareText}</p>
          </section>

          <section className="pp__section" id="children">
            <h2>{t.childrenTitle}</h2>
            <p>{t.childrenText}</p>
          </section>

          <section className="pp__section" id="changes">
            <h2>{t.changesTitle}</h2>
            <p>{t.changesText}</p>
          </section>

          <section className="pp__section pp__section--contact" id="contact">
            <h2>{t.contactTitle}</h2>
            <p>{t.contactText}</p>
            <div className="pp__contacts">
              <a href="mailto:ardaguner2000@gmail.com" className="pp__contact">
                <span className="pp__contact-label">E-posta</span>
                <span className="pp__contact-val">ardaguner2000@gmail.com</span>
              </a>
              <Link to="/" className="pp__contact">
                <span className="pp__contact-label">Web</span>
                <span className="pp__contact-val">{t.backHome}</span>
              </Link>
            </div>
          </section>
        </main>
      </div>

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
  );
};

export default PrivacyPolicy;
