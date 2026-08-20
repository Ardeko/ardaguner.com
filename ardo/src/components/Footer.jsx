import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import Icon from "./Icon";

/* ------------------------------------------------------------------
   İletişim + alt bilgi.

   Üstteki kayan şerit sayfayı kapatan tek dekoratif öğe; saf CSS
   animasyonu, iki özdeş yarım sonsuz döngüyü veriyor.

   Günlük ipucu widget'ı buraya taşındı. Hero'da dört öğeden biriydi
   ve dikkat dağıtıyordu; burada sayfayı bitiren küçük bir detay.
------------------------------------------------------------------- */

const MAILLER = ["ardaguner2000@gmail.com", "ardaguner@hotmail.com"];

function Footer({ strings, language, tip }) {
  const serit = language === "tr" ? "YAZILIM · OYUN · TASARIM · " : "SOFTWARE · GAMES · DESIGN · ";

  return (
    <footer className="footer" id="contact">
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>{serit.repeat(6)}</span>
          <span>{serit.repeat(6)}</span>
        </div>
      </div>

      <div className="shell footer-inner">
        <Reveal className="footer-lead">
          <span className="eyebrow">{strings.footer.title}</span>
          <h2 className="display footer-title">
            {language === "tr" ? "Birlikte çalışalım" : "Let's work together"}
          </h2>
          <p className="lede">
            {language === "tr"
              ? "Proje, iş birliği ya da sadece merhaba — kutunuz açık."
              : "Projects, collaborations, or just a hello — the inbox is open."}
          </p>
        </Reveal>

        <Reveal className="footer-links" delay={80}>
          <ul className="contact-list">
            {MAILLER.map((mail) => (
              <li key={mail}>
                <Icon name="mail" size={17} />
                <a href={`mailto:${mail}`}>{mail}</a>
              </li>
            ))}
            <li>
              <Icon name="linkedin" size={17} />
              <a
                href="https://www.linkedin.com/in/arda-g%C3%BCner/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <Icon name="github" size={17} />
              <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </Reveal>
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
        <p
          className="footer-thanks"
          onClick={() => window.alert(strings.footer.thanks)}
          title={language === "tr" ? "Tıkla" : "Click me"}
        >
          {strings.footer.copyright}
        </p>
        <Link to="/privacy-policy">
          {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
