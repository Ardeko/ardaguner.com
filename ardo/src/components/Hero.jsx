import { useEffect, useState } from "react";
import Magnetic from "../Magnetic";
import Icon from "./Icon";

/* ------------------------------------------------------------------
   Hero — tek bir kompozisyon.

   Eskiden burada dört şey birden vardı: iki yörünge diyagramı, günlük
   ipucu kutusu, CV bloğu ve iki buton. Hepsi aynı anda konuşuyordu.
   Şimdi tek bir şey söylüyor: kim olduğu. İpucu widget'ı silinmedi,
   aşağıdaki footer'a taşındı — orada bir detay, burada gürültüydü.

   Dönen rol kelimesi tek hareketli öğe. `key` her değişimde yenilendiği
   için CSS animasyonu baştan tetikleniyor.
------------------------------------------------------------------- */

function Hero({ language, strings, roles }) {
  const [rol, setRol] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const t = window.setInterval(() => setRol((r) => (r + 1) % roles.length), 2400);
    return () => window.clearInterval(t);
  }, [roles.length]);

  const cumle = language === "tr" ? ["Bir ", " İstanbul'da yaşıyor."] : ["A ", " based in Istanbul."];

  return (
    <section className="hero" id="top">
      <div className="shell hero-inner">
        <span className="eyebrow hero-anim" style={{ animationDelay: "80ms" }}>
          {language === "tr" ? "Portfolyo · 2026" : "Portfolio · 2026"}
        </span>

        <h1 className="hero-name display hero-anim" style={{ animationDelay: "180ms" }}>
          Arda Güner
        </h1>

        <p className="hero-role hero-anim" style={{ animationDelay: "300ms" }}>
          {cumle[0]}
          <span key={rol} className="hero-role-word display">
            {roles[rol]}
          </span>
          {cumle[1]}
        </p>

        <p className="lede hero-lede hero-anim" style={{ animationDelay: "380ms" }}>
          {strings.hero.subtitle}
        </p>

        <div className="hero-actions hero-anim" style={{ animationDelay: "460ms" }}>
          <a href="#work" className="btn btn-solid">
            {strings.nav.projects}
          </a>

          <Magnetic
            as="a"
            href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
            download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
            strength={0.22}
          >
            <Icon name="file" size={16} />
            {strings.cv.downloadButton}
          </Magnetic>
        </div>
      </div>

      <span className="hero-scroll" aria-hidden="true">
        <span className="eyebrow">{language === "tr" ? "Kaydır" : "Scroll"}</span>
        <span className="hero-scroll-line" />
      </span>
    </section>
  );
}

export default Hero;
