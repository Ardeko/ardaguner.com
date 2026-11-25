import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import Icon from "./Icon";
import KineticTitle from "../motion/KineticTitle";
import Marquee from "../motion/Marquee";
import { gsap, useGSAP, azalt } from "../motion/core";

/* ------------------------------------------------------------------
   İletişim + alt bilgi — v2: kinetik kapanış.

   - Üstteki şerit artık kaydırma hızına duyarlı: hızlı kaydırınca
     hızlanıyor, yukarı kaydırınca yön değiştiriyor. İki satır, ters
     yönlerde; dolu ve kontur kelimeler sırayla.
   - Ortada İstanbul silueti (Codex image_gen, tek çizgi kalınlığında
     line art). Footer görünür alana girerken soldan sağa "çiziliyor"
     (kaydırmaya bağlı maske).
   - En altta sayfanın dibinden taşan dev isim: sayfanın imzası.
   - Arka plan artık şeffaf: Backdrop'taki aurora ışığı sayfanın sonuna
     yaklaşınca yeniden beliriyor ve bu bölümün arkasında yanıyor.

   Günlük ipucu ve telif satırındaki teşekkür notu (easter egg) aynen.
------------------------------------------------------------------- */

const MAILLER = ["ardaguner2000@gmail.com", "ardaguner@hotmail.com"];

function Footer({ strings, language, tip }) {
  const kok = useRef(null);
  const [kopyalanan, setKopyalanan] = useState("");
  const F = strings.footer;

  // Mobilde mailto: bir uygulama açar; çoğu ziyaretçi adresi başka bir
  // yere yapıştırmak ister. Kopyala düğmesi o adımı kısaltıyor.
  const kopyala = async (mail) => {
    try {
      await navigator.clipboard.writeText(mail);
      setKopyalanan(mail);
      window.setTimeout(() => setKopyalanan(""), 1800);
    } catch {
      /* pano izni yoksa mailto linki zaten duruyor */
    }
  };

  useGSAP(
    () => {
      if (azalt() || !kok.current) return;
      const q = gsap.utils.selector(kok);
      gsap.fromTo(
        q(".footer-skyline img"),
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: { trigger: q(".footer-skyline")[0], start: "top 95%", end: "bottom 55%", scrub: 0.8 },
        }
      );
      gsap.fromTo(
        q(".footer-wordmark span"),
        { yPercent: 45 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: q(".footer-wordmark")[0], start: "top bottom", end: "bottom bottom", scrub: 0.6 },
        }
      );
    },
    { scope: kok, dependencies: [language] }
  );

  const kelimeler =
    language === "tr" ? ["Yazılım", "Oyun", "Tasarım", "İstanbul"] : ["Software", "Games", "Design", "Istanbul"];

  const serit = (kaydir) =>
    kelimeler.map((k, i) => (
      <span key={`${k}-${kaydir}`} className={`mq-word${(i + kaydir) % 2 ? " is-outline" : ""}`}>
        {k}
        <span className="mq-star" aria-hidden="true">
          ✦
        </span>
      </span>
    ));

  return (
    <footer className="footer" id="contact" ref={kok}>
      <div className="footer-marquee" aria-hidden="true">
        <Marquee speed={38} velocity>
          {serit(0)}
          {serit(0)}
        </Marquee>
        <Marquee speed={46} velocity reverse>
          {serit(1)}
          {serit(1)}
        </Marquee>
      </div>

      <div className="shell footer-inner">
        <div className="footer-lead">
          <span className="eyebrow">{F.title}</span>
          <KineticTitle className="footer-title" lead="" accent={F.heading} />
          <Reveal as="p" className="lede">
            {F.lede}
          </Reveal>
          <Reveal className="footer-cta" delay={80}>
            <a className="btn btn-solid btn-arrow" href={`mailto:${MAILLER[0]}`}>
              <Icon name="mail" size={16} />
              {F.mailCta}
              <span className="btn-arrow-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal className="footer-links" delay={80}>
          <ul className="contact-list">
            {MAILLER.map((mail) => (
              <li key={mail}>
                <Icon name="mail" size={17} />
                <a href={`mailto:${mail}`}>{mail}</a>
                <button
                  type="button"
                  className={`copy-btn${kopyalanan === mail ? " is-done" : ""}`}
                  onClick={() => kopyala(mail)}
                  aria-label={`${F.copy}: ${mail}`}
                >
                  <Icon name={kopyalanan === mail ? "check" : "copy"} size={13} />
                  {kopyalanan === mail ? F.copied : F.copy}
                </button>
              </li>
            ))}
            <li>
              <Icon name="linkedin" size={17} />
              <a href="https://www.linkedin.com/in/arda-g%C3%BCner/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <Icon name="external" size={14} className="contact-ext" />
            </li>
            <li>
              <Icon name="github" size={17} />
              <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <Icon name="external" size={14} className="contact-ext" />
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="footer-skyline">
        <img src="/footer/istanbul.webp" alt={F.skylineAlt} width="1536" height="225" loading="lazy" decoding="async" />
      </div>

      {tip && (
        <div className="shell footer-tip">
          <span className="eyebrow">{strings.hero.tipTitle}</span>
          <p>{tip}</p>
        </div>
      )}

      <div className="shell footer-base">
        {/* Telif satırına tıklayınca teşekkür notu çıkıyor — eski
            sitedeki easter egg, davranışı aynen korundu. */}
        <p className="footer-thanks" onClick={() => window.alert(F.thanks)} title={language === "tr" ? "Tıkla" : "Click me"}>
          {F.copyright}
        </p>
        <span className="footer-hint" aria-hidden="true">
          <kbd>{typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || "") ? "⌘" : "Ctrl"}</kbd>
          <kbd>K</kbd>
          {language === "tr" ? "ile her yere" : "to go anywhere"}
        </span>
        <Link to="/privacy-policy">{language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}</Link>
      </div>

      <div className="footer-wordmark" aria-hidden="true">
        <span className="display">Arda Güner</span>
      </div>
    </footer>
  );
}

export default Footer;
