import { Link } from 'react-router-dom';

const PrivacyPolicy = ({ language = "tr" }) => {
  const content = {
    tr: {
      badge: "🛡️ GÜVENLİ ALTYAPI",
      title: "Gizlilik Politikası",
      updated: "Son Güncelleme: Mayıs 2026",
      subtitle: "Uygulama & Web Veri Bildirimi",
      introTitle: "1. Giriş",
      introText: "Arda Güner (Ardeko Studios) olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu Gizlilik Politikası, Google Play Mağazası'nda yer alan Switch Master: Railway mobil uygulamamızı/oyunumuzu ve ardaguner.com web sitemizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklamaktadır.",
      dataTitle: "2. Topladığımız Bilgiler",
      dataText: "Switch Master: Railway oyunumuzu ve uygulamalarımızı kullandığınızda aşağıdaki türde bilgileri toplayabiliriz:",
      dataItems: [
        { label: "Cihaz Bilgileri", desc: "Cihaz modeli, işletim sistemi sürümü, benzersiz cihaz tanımlayıcıları (ör. reklam kimlikleri) ve mobil ağ bilgileri." },
        { label: "Kullanım Verileri", desc: "Uygulama içindeki etkileşimleriniz, oynama süreleriniz, tıklanan bağlantılar ve hata/çökme raporları." },
        { label: "Kullanıcı Tarafından Sağlanan Veriler", desc: "İsim, e-posta adresi, kullanıcı adı gibi sizin isteyerek verdiğiniz bilgiler (kayıt özellikleri kullanılıyorsa)." }
      ],
      thirdPartyTitle: "3. Üçüncü Taraf Hizmetleri",
      thirdPartyText: "Uygulamamız, işlevselliği artırmak, analiz yapmak ve reklam göstermek amacıyla aşağıdaki üçüncü taraf hizmetlerini kullanabilir:",
      usageTitle: "4. Bilgilerin Kullanımı",
      usageText: "Topladığımız bilgileri temel olarak şu amaçlarla kullanırız:",
      usageItems: [
        "Switch Master: Railway oyununun düzgün çalışmasını sağlamak ve iyileştirmek.",
        "Karşılaşılan teknik sorunları tespit edip çözmek.",
        "Kullanıcı deneyimini kişiselleştirmek ve geliştirmek.",
        "Eğer kullanılıyorsa, size uygun reklamlar sunmak."
      ],
      shareTitle: "5. Bilgilerin Paylaşımı",
      shareText: "Kullanıcı verilerini kesinlikle satmıyoruz. Ancak, yukarıda belirtilen üçüncü taraf analiz ve reklam ortaklarımızla anonimleştirilmiş veriler paylaşebilir. Bunun dışında verileriniz yalnızca yasal bir zorunluluk olduğunda yetkili mercilerle paylaşılır.",
      contactTitle: "6. İletişim",
      contactText: "Bu Gizlilik Politikası veya veri işleme uygulamalarımız hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz:",
      backHome: "Anasayfaya Dön"
    },
    en: {
      badge: "🛡️ SECURE INFRASTRUCTURE",
      title: "Privacy Policy",
      updated: "Last Updated: May 2026",
      subtitle: "App & Web Data Notice",
      introTitle: "1. Introduction",
      introText: "As Arda Güner (Ardeko Studios), I respect your privacy and am committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share your information when you use our Switch Master: Railway mobile application/game on the Google Play Store and our website ardaguner.com.",
      dataTitle: "2. Information We Collect",
      dataText: "When you use our Switch Master: Railway game and applications, we may collect the following types of information:",
      dataItems: [
        { label: "Device Information", desc: "Device model, operating system version, unique device identifiers (e.g., ad IDs), and mobile network information." },
        { label: "Usage Data", desc: "Your interactions within the application, gameplay durations, clicked links, and crash reports." },
        { label: "User-Provided Data", desc: "Information you voluntarily provide such as name, email address, or username (if registration features are used)." }
      ],
      thirdPartyTitle: "3. Third-Party Services",
      thirdPartyText: "Our application may use the following third-party services to increase functionality, analyze performance, and display advertisements:",
      usageTitle: "4. Use of Information",
      usageText: "We primarily use the information we collect for the following purposes:",
      usageItems: [
        "To ensure the proper functioning and improvement of the Switch Master: Railway game.",
        "To detect and resolve technical issues encountered.",
        "To personalize and enhance the user experience.",
        "To serve relevant advertisements, if applicable."
      ],
      shareTitle: "5. Sharing of Information",
      shareText: "We absolutely do not sell user data. However, anonymized data may be shared with third-party analysis and advertising partners mentioned above. Other than that, your data is only shared with authorized authorities when legally required.",
      contactTitle: "6. Contact",
      contactText: "If you have any questions about this Privacy Policy or our data processing practices, you can contact us:",
      backHome: "Back to Home"
    }
  };

  const t = content[language] || content["tr"];

  return (
    <div className="privacy-page-container">
      <div className="privacy-header animate-fade-in">
        <div className="privacy-badge">{t.badge}</div>
        <h1 className="privacy-title-text">{t.title}</h1>
        <div className="privacy-date-badge">
          <span>📅 {t.updated}</span>
        </div>
      </div>

      <main className="privacy-main-card animate-fade-in-up">
        <div className="privacy-card-header">
          <div className="privacy-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
          </div>
          <h2>{t.subtitle}</h2>
        </div>

        <div className="privacy-content-space">
          <section className="privacy-section">
            <h3>{t.introTitle}</h3>
            <p>{t.introText}</p>
          </section>

          <section className="privacy-section">
            <h3>{t.dataTitle}</h3>
            <p className="highlight-text">{t.dataText}</p>
            <div className="info-grid">
              {t.dataItems.map((item, idx) => (
                <div key={idx} className="info-item-box">
                  <span className="info-box-label">{item.label}</span>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="privacy-section">
            <h3>{t.thirdPartyTitle}</h3>
            <p>{t.thirdPartyText}</p>
            <div className="services-row">
              {['Google Play Services', 'Google Analytics for Firebase', 'Google AdMob'].map((service) => (
                <div key={service} className="service-tag">{service}</div>
              ))}
            </div>
          </section>

          <section className="privacy-section">
            <h3>{t.usageTitle}</h3>
            <p>{t.usageText}</p>
            <ul className="usage-grid">
              {t.usageItems.map((text, idx) => (
                <li key={idx} className="usage-item">
                  <span className="bullet-dot" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="privacy-section">
            <h3>{t.shareTitle}</h3>
            <p>{t.shareText}</p>
          </section>

          <section className="privacy-section contact-border-top">
            <h3>{t.contactTitle}</h3>
            <p className="sub-p">{t.contactText}</p>
            
            <div className="contact-cards-wrapper">
              <a href="mailto:ardaguner2000@gmail.com" className="privacy-contact-card">
                <div className="contact-card-icon">📬</div>
                <div className="contact-card-details">
                  <span className="card-tag">Email</span>
                  <span className="card-val">ardaguner2000@gmail.com</span>
                </div>
              </a>

              <Link to="/" className="privacy-contact-card">
                <div className="contact-card-icon">🏠</div>
                <div className="contact-card-details">
                  <span className="card-tag">Website</span>
                  <span className="card-val">{t.backHome}</span>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .privacy-page-container {
          background-color: #030d14;
          min-height: 100vh;
          padding: 4rem 1rem;
          color: #b4c6ef;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .privacy-header {
          max-width: 800px;
          margin: 0 auto 2rem auto;
          text-align: center;
        }
        .privacy-badge {
          display: inline-block;
          padding: 0.5rem 1.2rem;
          background: linear-gradient(135deg, #3f51b5, #00bcd4);
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: bold;
          color: #fff;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 15px rgba(63, 81, 181, 0.2);
        }
        .privacy-title-text {
          font-size: 2.5rem;
          color: #ffffff;
          margin: 0 0 1rem 0;
          font-weight: 800;
        }
        .privacy-date-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: rgba(255, 138, 101, 0.1);
          border: 1px solid rgba(255, 138, 101, 0.2);
          border-radius: 12px;
          font-size: 0.8rem;
          color: #ff8a65;
          font-weight: 600;
        }
        .privacy-main-card {
          max-width: 800px;
          margin: 0 auto;
          background: #0d1926;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .privacy-card-header {
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        .privacy-icon-wrapper {
          width: 60px;
          height: 60px;
          background: rgba(0, 188, 212, 0.1);
          border: 1px solid rgba(0, 188, 212, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00bcd4;
          margin: 0 auto 1rem auto;
          box-shadow: 0 0 20px rgba(0, 188, 212, 0.15);
        }
        .privacy-card-header h2 {
          color: #ffffff;
          font-size: 1.3rem;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .privacy-content-space {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .privacy-section h3 {
          color: #ffffff;
          font-size: 1.15rem;
          margin: 0 0 0.8rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          padding-bottom: 0.4rem;
        }
        .privacy-section p {
          line-height: 1.6;
          font-size: 0.95rem;
          margin: 0;
          color: #cbd5e1;
        }
        .highlight-text {
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 1rem;
        }
        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        .info-item-box {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.02);
          padding: 1rem;
          border-radius: 12px;
        }
        .info-box-label {
          display: block;
          color: #00bcd4;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.3rem;
        }
        .info-item-box p {
          font-size: 0.9rem;
          color: #94a3b8;
        }
        .services-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .service-tag {
          background: #08111a;
          border: 1px solid rgba(255,255,255,0.03);
          padding: 0.8rem;
          border-radius: 12px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: bold;
          color: #cbd5e1;
        }
        .usage-grid {
          list-style: none;
          padding: 0;
          margin: 1rem 0 0 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        .usage-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background: rgba(0,0,0,0.15);
          padding: 0.8rem;
          border-radius: 10px;
          font-size: 0.9rem;
        }
        .bullet-dot {
          width: 6px;
          height: 6px;
          background-color: #00bcd4;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .contact-border-top {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 2rem;
        }
        .sub-p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .contact-cards-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .privacy-contact-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #08111a;
          border: 1px solid rgba(255,255,255,0.04);
          padding: 1rem;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .privacy-contact-card:hover {
          border-color: rgba(0, 188, 212, 0.4);
          background: #0c1a29;
          transform: translateY(-2px);
        }
        .contact-card-icon {
          font-size: 1.3rem;
          background: rgba(0, 188, 212, 0.1);
          padding: 0.5rem;
          border-radius: 8px;
        }
        .card-tag {
          display: block;
          font-size: 0.65rem;
          text-transform: uppercase;
          color: #64748b;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        .card-val {
          font-size: 0.85rem;
          color: #e2e8f0;
          font-weight: 500;
        }
        .privacy-contact-card:hover .card-val {
          color: #00bcd4;
        }
        
        .animate-fade-in {
          animation: privacyFadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: privacyFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes privacyFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes privacyFadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 600px) {
          .privacy-main-card { padding: 1.5rem; }
          .privacy-title-text { font-size: 2rem; }
          .usage-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;