import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

/* Torpidodan kullanım koşulları. Görünüm ve bileşen sınıfları gizlilik politikasıyla ortak (pp-*).
   Statik kopyası vite.config.js'te; başlık/açıklama oradakiyle aynı kalmalı. */
const CONTACT_EMAIL = 'ardaguner2000@gmail.com';
const SUPPORT_INSTAGRAM = 'ardekostudios';
const SUPPORT_DM_URL = `https://ig.me/m/${SUPPORT_INSTAGRAM}`;

const SECTIONS = [
  { id: 'scope', key: 'scope' },
  { id: 'fair-play', key: 'fair' },
  { id: 'report', key: 'report' },
  { id: 'enforcement', key: 'enforce' },
  { id: 'appeal', key: 'appeal' },
  { id: 'virtual', key: 'virtual' },
  { id: 'changes', key: 'changes' },
  { id: 'terms-contact', key: 'contact' },
];

const CONTENT = {
  tr: {
    badge: 'Hukuki',
    title: 'Torpidodan Kullanım Koşulları',
    subtitle:
      'Torpidodan’ı oynarken geçerli kurallar: herkes için adil bir oyun, açıkça yazılmış yasaklar ve itiraz yolu.',
    updatedLabel: 'Son güncelleme',
    updated: '17 Kasım 2026',
    toc: 'İçindekiler',
    privacy: 'Gizlilik politikası',
    backLabel: 'Gizlilik politikasına dön',
    sections: {
      scope: {
        title: 'Kapsam',
        paragraphs: [
          'Bu koşullar, Ardeko Studios (Arda Güner) tarafından yayınlanan Torpidodan oyununu ve çevrimiçi özelliklerini (sıralamalar, Canlı Mezat, Prestij Pazarı, etkinlikler, çarklar, sandıklar, Sanayi Kahvesi, Atelier ve Galericiler Sitesi) kapsar. Oyunu indirip oynayarak bu koşulları kabul etmiş olursun.',
          'Kişisel verilerin nasıl işlendiği ayrıca Gizlilik Politikası’nda anlatılır.',
        ],
      },
      fair: {
        title: 'Adil oyun ve yasak davranışlar',
        paragraphs: [
          'Torpidodan’ın sıralamaları, etkinlikleri ve çevrimiçi pazarları tüm oyuncular için adil olmalıdır. Aşağıdakiler yasaktır:',
        ],
        items: [
          'Oyundaki bir hatayı, açığı veya beklenmeyen davranışı (bug) kendi çıkarın için kullanmak (bug abuse). Bir şeyin tasarlandığı gibi çalışmadığını fark ediyorsan, bunu ne kadar kolay kullanabildiğin önemli değildir.',
          'Yazılım, kayıt dosyası veya iletişim oynamasıyla oyun sonucu, para, eşya ya da sıralama elde etmek; Noter doğrulamasını atlatmaya çalışmak.',
          'Aynı kişinin birden fazla hesapla sıralamalarda, etkinliklerde, çarklarda veya sandıklarda avantaj sağlaması; yasaklı bir hesabın yeni bir hesapla geri dönmesi.',
          'Otomasyon, bot veya üçüncü taraf araçlarla oyunu oynamak ya da çevrimiçi hizmetlere aşırı yük bindirmek.',
          'Uygunsuz, hakaret içeren veya başkasının haklarını ihlal eden galeri adı, fotoğraf ya da içerik paylaşmak.',
        ],
        after:
          'Sıralamada olağan dışı biçimde yüksek bir değer, bu yolların kullanıldığına dair bir işaret sayılabilir; ancak karar, oyunun sunucudaki kayıtlarının incelenmesine dayanır.',
      },
      report: {
        title: 'Açık bulursan bize bildir',
        paragraphs: [
          'Bir açık fark edersen onu kullanmak yerine bize bildir: Instagram’dan @ardekostudios hesabına yaz ya da e-posta gönder. Açığı gizli tutup kullanmayan ve bildiren oyuncuya teşekkür ederiz; açığı kendi çıkarına kullanmak ise yukarıdaki maddeye aykırıdır.',
        ],
      },
      enforce: {
        title: 'Yaptırımlar',
        paragraphs: [
          'Bu koşulları ihlal ettiği tespit edilen hesap için, ihlalin ağırlığına göre şunlardan biri veya birkaçı uygulanabilir ve önceden bildirim yapılmayabilir:',
        ],
        items: [
          'Haksız yolla elde edilen değerin, ödülün veya eşyanın geri alınması ya da silinmesi.',
          'Listelerdeki ve herkese açık kayıtlardaki satırların (sıralama, Cemiyet, sicil vb.) kaldırılması.',
          'Çevrimiçi özelliklerden (sıralamalar, Canlı Mezat, Prestij Pazarı, etkinlikler, çarklar, sandıklar) geçici veya kalıcı çıkarılma.',
        ],
        after:
          'Cihazındaki çevrimdışı oyun kalır ve oynamaya devam edebilirsin; ancak çıkarıldığın çevrimiçi özelliklerde sonuçların geçerli sayılmaz. Çıkarılan bir hesabın yeni bir hesapla geri dönmesi aynı ihlal sayılır.',
      },
      appeal: {
        title: 'İtiraz',
        paragraphs: [
          'Kararın hatalı olduğunu düşünüyorsan Instagram’dan @ardekostudios hesabına ya da e-postayla gerekçeni yaz. Gerekçeli itirazlar incelenir. Oyunun kayıtlarında bir açığın bilerek kullanıldığı görülmüşse karar genel olarak değişmez; açığın bizim tarafımızda olması, onu kullanmanın serbest olduğu anlamına gelmez.',
        ],
      },
      virtual: {
        title: 'Oyun parası ve sanal öğeler',
        paragraphs: [
          'Oyundaki para, araç, nüsha ve diğer sanal öğelerin gerçek para karşılığı yoktur; paraya çevrilemez ve oyun dışında değer taşımaz. Atelier’deki tek seferlik kozmetik ürünler ilgili mağazanın (Apple App Store, Google Play) satın alma ve iade kurallarına tabidir. Tüketici mevzuatından doğan yasal hakların saklıdır.',
        ],
      },
      changes: {
        title: 'Oyunda ve koşullarda değişiklik',
        paragraphs: [
          'Oyunun kuralları, dengesi ve çevrimiçi özellikleri güncellenebilir; hataların düzeltilmesi sırasında ilgili sonuçlar yeniden hesaplanabilir. Bu koşullar değiştiğinde bu sayfa güncellenir ve üstteki tarih değişir. Güncellemeden sonra oyunu kullanmaya devam etmen yeni koşulları kabul ettiğin anlamına gelir.',
        ],
      },
      contact: {
        title: 'İletişim',
        paragraphs: ['Sorular, itirazlar ve açık bildirimleri için:'],
      },
    },
  },
  en: {
    badge: 'Legal',
    title: 'Torpidodan Terms of Use',
    subtitle:
      'The rules that apply while you play Torpidodan: fair play for everyone, clearly stated prohibitions and a way to appeal.',
    updatedLabel: 'Last updated',
    updated: '17 November 2026',
    toc: 'Contents',
    privacy: 'Privacy Policy',
    backLabel: 'Back to the privacy policy',
    sections: {
      scope: {
        title: 'Scope',
        paragraphs: [
          'These terms cover the game Torpidodan published by Ardeko Studios (Arda Güner) and its online features (leaderboards, Live Auction, Prestige Market, events, wheels, chests, Sanayi Kahvesi, Atelier and the Galericiler site). By downloading and playing the game you accept these terms.',
          'How personal data is processed is described separately in the Privacy Policy.',
        ],
      },
      fair: {
        title: 'Fair play and prohibited conduct',
        paragraphs: [
          'Torpidodan’s leaderboards, events and online markets must be fair for every player. The following are prohibited:',
        ],
        items: [
          'Using a bug, loophole or unintended behaviour in the game for your own gain (bug abuse). If you notice something is not working as designed, how easy it is to use does not matter.',
          'Obtaining game results, currency, items or rankings by tampering with software, save files or communication; trying to bypass the Noter verification.',
          'Using several accounts to gain an advantage in leaderboards, events, wheels or chests; returning with a new account after being banned.',
          'Playing with automation, bots or third-party tools, or placing excessive load on the online services.',
          'Sharing a gallery name, photo or other content that is inappropriate, abusive or infringes someone else’s rights.',
        ],
        after:
          'An unusually high value on a leaderboard may be a sign that these methods were used; however, decisions rely on review of the game’s server-side records.',
      },
      report: {
        title: 'If you find a loophole, tell us',
        paragraphs: [
          'If you notice a loophole, report it instead of using it: message @ardekostudios on Instagram or send an email. We thank players who keep a loophole to themselves and report it; using it for your own gain breaks the rule above.',
        ],
      },
      enforce: {
        title: 'Enforcement',
        paragraphs: [
          'For an account found to have broken these terms, one or more of the following may be applied depending on the severity, and prior notice may not be given:',
        ],
        items: [
          'Reversing or deleting value, rewards or items obtained unfairly.',
          'Removing the account’s rows in lists and public records (rankings, Cemiyet, registries, etc.).',
          'Temporary or permanent removal from online features (leaderboards, Live Auction, Prestige Market, events, wheels, chests).',
        ],
        after:
          'The offline game on your device remains and you may keep playing it; however, your results are not counted in the online features you were removed from. Returning with a new account after removal is the same violation.',
      },
      appeal: {
        title: 'Appeals',
        paragraphs: [
          'If you think a decision was wrong, write your reasons to @ardekostudios on Instagram or by email. Reasoned appeals are reviewed. Where the game’s records show a loophole was used knowingly, the decision generally does not change; a loophole being on our side does not mean using it is allowed.',
        ],
      },
      virtual: {
        title: 'Game currency and virtual items',
        paragraphs: [
          'In-game money, vehicles, copies and other virtual items have no real-money value, cannot be exchanged for money and carry no value outside the game. The one-time cosmetic products in the Atelier are subject to the purchase and refund rules of the relevant store (Apple App Store, Google Play). Your statutory consumer rights are reserved.',
        ],
      },
      changes: {
        title: 'Changes to the game and these terms',
        paragraphs: [
          'The game’s rules, balance and online features may be updated; when bugs are fixed, affected results may be recalculated. When these terms change, this page is updated and the date above changes. Continuing to use the game after an update means you accept the new terms.',
        ],
      },
      contact: {
        title: 'Contact',
        paragraphs: ['For questions, appeals and loophole reports:'],
      },
    },
  },
};

export default function TermsOfUse({ language }) {
  const t = CONTENT[language] || CONTENT.tr;

  useEffect(() => {
    const prev = document.title;
    document.title = language === 'tr' ? 'Torpidodan Kullanım Koşulları — Arda Güner' : 'Torpidodan Terms of Use — Arda Güner';
    return () => {
      document.title = prev;
    };
  }, [language]);

  return (
    <main className="page pp section" id="terms">
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
              <Link to="/privacy-policy">{t.privacy}</Link>
            </li>
          </ul>
        </header>

        <div className="pp-layout">
          <aside className="pp-toc" aria-label={t.toc}>
            <p className="eyebrow pp-toc-label">{t.toc}</p>
            <ol>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{t.sections[s.key].title}</a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="pp-main">
            {SECTIONS.map((s) => {
              const sec = t.sections[s.key];
              return (
                <section className="pp-section" id={s.id} key={s.id}>
                  <h2 className="display">{sec.title}</h2>
                  {sec.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {sec.items && (
                    <ul className="pp-list">
                      {sec.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {sec.after && <p>{sec.after}</p>}
                  {s.id === 'terms-contact' && (
                    <div className="pp-contacts">
                      <a href={`mailto:${CONTACT_EMAIL}`} className="pp-contact">
                        <span className="pp-contact-label">E-posta</span>
                        <span className="pp-contact-val">{CONTACT_EMAIL}</span>
                      </a>
                      <a href={SUPPORT_DM_URL} className="pp-contact" target="_blank" rel="noopener noreferrer">
                        <span className="pp-contact-label">Instagram</span>
                        <span className="pp-contact-val">@{SUPPORT_INSTAGRAM}</span>
                      </a>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
