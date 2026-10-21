import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from './components/Icon';
import './PrivacyPolicy.css';
import './AccountDeletion.css';

/* ------------------------------------------------------------------
   Torpidodan — hesap ve veri silme.

   Google Play ve App Store, uygulamayı silmiş bir kullanıcının da
   silme talebini iletebileceği herkese açık bir adres istiyor. Bu
   sayfa o adres: giriş yok, form yok, takip yok. Mağaza kayıtlarında
   geçtiği için /torpidodan/hesap-silme yolu kırılamaz.

   İki dil aynı anda basılıyor, TR üstte. Dil anahtarı burada metni
   değiştirmiyor; inceleme ekibi hangi dili seçmiş olursa olsun ikisini
   de görmeli. Statik kopyası (doğru <title> / description ile)
   vite.config.js içinde üretiliyor.
------------------------------------------------------------------- */

const DELETION_PATH = '/torpidodan/hesap-silme';

// İkisi de okunuyor. "E-postayı hazırla" ikisine birden yazıyor.
const CONTACT_EMAILS = ['ardaguner2000@gmail.com', 'info@ardekostudios.com'];
const CONTROLLER = 'Arda Güner / Ardeko Studios';

const DELETION_META = {
  title: 'Torpidodan — Hesap ve veri silme · Account & data deletion',
  description:
    'Torpidodan hesabını ve çevrimiçi verilerini silme: uygulama içinden anında ya da uygulamayı sildiysen e-postayla. How to delete your Torpidodan account and online data.',
};

const mailto = (subject, body) =>
  `mailto:${CONTACT_EMAILS.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const CONTENT = [
  {
    lang: 'tr',
    code: 'TR',
    name: 'Türkçe',
    intro: 'Hesabını ve verilerini silmenin iki yolu var.',
    app: {
      title: 'Uygulama içinden',
      badge: 'Önerilen · anında',
      steps: ['Ayarlar', 'Çevrimiçi hesap', '“Çevrimiçi verilerimi sil”', 'onayla'],
      note: 'Apple ile giriş yaptıysan Apple penceresinde bir kez onay vermen gerekir.',
    },
    mail: {
      title: 'Uygulamayı sildiysen ya da açamıyorsan',
      badge: 'E-posta · en geç 30 gün',
      subject: 'Torpidodan veri silme',
      body: 'Galeri adı:\nBağlı Apple/Google e-postası (varsa):\nYaklaşık oynama tarihleri:\n',
      lead: ([a, b]) => (
        <>
          {a} ya da {b} adresine <q>Torpidodan veri silme</q> konusuyla yaz.
        </>
      ),
      details:
        'E-postada galerinin adını, Apple/Google ile bağladıysan bağladığın hesabın e-postasını ve yaklaşık oynama tarihlerini belirt. Kimliğini doğrulamak için bu bilgiler gerekebilir. Talebini en geç 30 gün içinde yanıtlar ve verileri sileriz.',
      cta: 'E-postayı hazırla',
    },
    deletedTitle: 'Ne silinir',
    deleted: [
      'Çevrimiçi oturum hesabın ve bağlı Apple/Google e-postan',
      'Mal Beyanı, TORBİST, Cemiyet ve Borsa Ligi satırların',
      'Haftalık yarış skorların',
      'TORPİDO dergisi vitrinin ve kornaların',
      'Canlı Mezat kayıtların (limit, rapor, hesap)',
      'Noter mühürlerin ve kayıt defterin',
      'Açıkça gönderdiğin özel destek kopyaları ve ilgili kayıtlar',
      'Prestij Pazarı ilanların, atölye katılımların ve kişisel işlem/makbuz kayıtların',
      'Galericiler Sitesi üyeliğin, başvuru/davetlerin, kişisel ortak iş ve Site Kupası delillerin, katılım ve hatıraların',
      'Çevrimiçi Sanayi Kahvesi bilet ve oyuncu kayıtların',
      'Paylaştığın portre fotoğrafının sunucudaki kopyası',
      'Sezon 1 hediye kaydın',
      'Devir kaydın',
      'Gönderdiğin bildirimler',
    ],
    keptTitle: 'Ne kalır',
    kept: [
      'Gala Sicili ve Özel Plaka listelerinde ödenmiş gala aracı ve pey tutarı kaydı (başkalarının kaydı bozulmasın diye) kalır, ad ve portren silinir.',
      'Ortak site kasası ve yarış toplamları ile bazı özel araç sicilleri, başkalarının kayıtlarının tutarlılığı için adın ve hesap kimliğinle eşleşmesi kaldırılarak kalabilir.',
      'Cihazındaki oyun kaydı silinmez; sunucudaki kişisel doğrulama ve destek kopyaları silinir. Çevrimiçi kayıtlarda otomatik süre sonu silmesi yoktur; bu hesap silme yolu geçerlidir.',
      'Telefonundan seçtiğin portre fotoğrafı telefonunda kalır. Paylaşmadıysan sunucuya hiç gönderilmemiştir; paylaştıysan sunucudaki kopyası silinir.',
    ],
    noteLabel: 'Not',
    note: 'Hesabını bağlamadan uygulamayı silersen, anonim hesabına yeniden ulaşamayız; bu durumda silme talebini galeri adın ve oyun tarihlerinle yaparsın, eşleşen kayıtları sileriz.',
  },
  {
    lang: 'en',
    code: 'EN',
    name: 'English',
    intro: 'There are two ways to delete your account and data.',
    app: {
      title: 'In the app',
      badge: 'Recommended · instant',
      steps: ['Settings', 'Online account', '“Delete my online data”', 'confirm'],
      note: 'If you signed in with Apple, you will need to approve once in the Apple window.',
    },
    mail: {
      title: 'If you uninstalled the app or can’t open it',
      badge: 'Email · within 30 days',
      subject: 'Torpidodan data deletion',
      body: 'Gallery name:\nLinked Apple/Google email (if any):\nApproximate play dates:\n',
      lead: ([a, b]) => (
        <>
          Email {a} or {b} with the subject <q>Torpidodan data deletion</q>.
        </>
      ),
      details:
        'In the email, include your gallery name, the email of the Apple/Google account you linked (if you linked one), and your approximate play dates. We may need this information to verify your identity. We will reply to your request and delete your data within 30 days at the latest.',
      cta: 'Compose the email',
    },
    deletedTitle: 'What is deleted',
    deleted: [
      'Your online session account and linked Apple/Google email',
      'Your Mal Beyanı (Asset Declaration), TORBİST, Cemiyet and Borsa Ligi entries',
      'Your weekly race scores',
      'Your TORPİDO magazine showcase and horns',
      'Your Canlı Mezat (Live Auction) records (limit, report, account)',
      'Your Noter (Notary) seals and register',
      'Private support copies you explicitly submitted and related records',
      'Prestige Market listings, workshop entries and personal transaction/receipt records',
      'Galericiler Sitesi membership, applications/invitations, personal cooperative-task and Site Cup evidence, entries and memories',
      'Online Sanayi Kahvesi ticket and player records',
      'The server copy of a portrait photo you shared',
      'Your Season 1 gift record',
      'Your handover record',
      'Notifications you sent',
    ],
    keptTitle: 'What remains',
    kept: [
      'In the Gala Sicili (Gala Register) and Özel Plaka (Special Plate) lists, the record of the paid gala car and bid amount remains (so other players’ records stay intact); your name and portrait are removed.',
      'Shared site funds and race totals and some special vehicle registers may remain with your name and account association removed to preserve other players’ records.',
      'Your on-device save is not deleted; your personal online verification and support copies are deleted. Online records have no automatic expiry; this account deletion flow applies.',
      'A portrait you choose from your photos stays on your phone. If you never shared it, it was never sent to the server; if you shared it, the server copy is deleted.',
    ],
    noteLabel: 'Note',
    note: 'If you uninstall the app without linking your account, we cannot reach your anonymous account again. In that case, send your deletion request with your gallery name and play dates, and we will delete the matching records.',
  },
];

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (!el) return () => {};
  const prev = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => el.setAttribute(attr, prev);
}

function LanguageBlock({ t }) {
  return (
    <article className="dl-lang" id={t.lang} lang={t.lang} aria-labelledby={`${t.lang}-intro`}>
      <div className="dl-lang-rule">
        <span className="dl-lang-code">{t.code}</span>
        <span className="dl-lang-name">{t.name}</span>
      </div>

      <h2 className="display dl-intro" id={`${t.lang}-intro`}>
        {t.intro}
      </h2>

      <div className="dl-ways">
        <section className="dl-way dl-way--primary">
          <div className="dl-way-top">
            <span className="dl-way-icon">
              <Icon name="phone" size={18} />
            </span>
            <span className="dl-badge dl-badge--live">{t.app.badge}</span>
          </div>
          <h3>{t.app.title}</h3>
          <ol className="dl-steps">
            {t.app.steps.map((step, i) => (
              <li key={step}>
                <span className="dl-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="dl-fine">{t.app.note}</p>
        </section>

        <section className="dl-way">
          <div className="dl-way-top">
            <span className="dl-way-icon">
              <Icon name="mail" size={18} />
            </span>
            <span className="dl-badge">{t.mail.badge}</span>
          </div>
          <h3>{t.mail.title}</h3>
          <p>
            {t.mail.lead(
              CONTACT_EMAILS.map((email) => (
                <strong key={email} className="dl-email">
                  {email}
                </strong>
              ))
            )}
          </p>
          <p>{t.mail.details}</p>
          <a className="btn btn-ghost dl-mail" href={mailto(t.mail.subject, t.mail.body)}>
            <Icon name="mail" size={16} />
            {t.mail.cta}
          </a>
        </section>
      </div>

      <div className="dl-split">
        <section className="dl-col dl-col--gone">
          <h3>
            <Icon name="trash" size={17} />
            {t.deletedTitle}
          </h3>
          <ul>
            {t.deleted.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="dl-col dl-col--kept">
          <h3>
            <Icon name="keep" size={17} />
            {t.keptTitle}
          </h3>
          <ul>
            {t.kept.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="dl-note">
        <span className="dl-note-label">{t.noteLabel}</span>
        <p>{t.note}</p>
      </aside>
    </article>
  );
}

const AccountDeletion = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = DELETION_META.title;
    const undo = [
      setMeta('meta[name="description"]', 'content', DELETION_META.description),
      setMeta('link[rel="canonical"]', 'href', `https://ardaguner.com${DELETION_PATH}`),
    ];
    return () => {
      document.title = prevTitle;
      undo.forEach((fn) => fn());
    };
  }, []);

  return (
    <main className="page pp dl section" id="hesap-silme">
      <div className="shell">
        <header className="dl-hero">
          <div className="dl-app">
            <span className="pp-game-mark dl-app-mark">
              <img src="/apps/torpidodan.webp" alt="" width={52} height={52} />
            </span>
            <div>
              <span className="dl-app-name">Torpidodan</span>
              <span className="eyebrow">Ardeko Studios</span>
            </div>
          </div>

          <h1 className="display grad-text">Torpidodan — Hesap ve veri silme</h1>
          <p className="display dl-hero-en" lang="en">
            Account and data deletion
          </p>

          <nav className="dl-jump" aria-label="Dil / Language">
            {CONTENT.map((t) => (
              <a key={t.lang} href={`#${t.lang}`} hrefLang={t.lang}>
                <span>{t.code}</span>
                {t.name}
              </a>
            ))}
          </nav>

          <ul className="pp-meta">
            <li>
              <strong>Son güncelleme · Last updated</strong>
              Ekim 2026 · October 2026
            </li>
            <li>
              <strong>Veri sorumlusu · Data controller</strong>
              {CONTROLLER}
            </li>
            <li>
              <strong>İletişim · Contact</strong>
              {CONTACT_EMAILS.map((email) => (
                <a key={email} href={`mailto:${email}`}>
                  {email}
                </a>
              ))}
            </li>
          </ul>
        </header>

        {CONTENT.map((t) => (
          <LanguageBlock key={t.lang} t={t} />
        ))}

        <footer className="dl-foot">
          <Link to="/privacy-policy" className="pp-contact">
            <span className="pp-contact-label">Gizlilik · Privacy</span>
            <span className="pp-contact-val">Gizlilik Politikası · Privacy Policy</span>
          </Link>
          <Link to="/" className="pp-contact">
            <span className="pp-contact-label">Web</span>
            <span className="pp-contact-val">ardaguner.com</span>
          </Link>
        </footer>
      </div>
    </main>
  );
};

export default AccountDeletion;
