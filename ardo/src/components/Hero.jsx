import { useEffect, useState } from "react";
import Icon from "./Icon";
import { stats } from "../data/projects";

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
  const sayilar = stats();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const t = window.setInterval(() => setRol((r) => (r + 1) % roles.length), 2400);
    return () => window.clearInterval(t);
  }, [roles.length]);

  /* Artikel sabit "A " yazarken dönen rollerden biri "A instructor"
     çıkıyordu — sayfanın en üstünde, İngilizce bir dilbilgisi hatası.
     Artık role göre seçiliyor. Not: İngilizce'de artikel yazıma değil
     SESE bakıyor ("a university", "an hour"); mevcut dört rol için sesli
     harf kontrolü doğru sonucu veriyor, istisnalı bir rol eklenirse
     burası elle ele alınmalı. */
  const rolAd = roles[rol] || "";
  const artikel = /^[aeiou]/i.test(rolAd) ? "An " : "A ";
  const cumle =
    language === "tr"
      ? ["Bir ", " İstanbul'da yaşıyor."]
      : [artikel, " based in Istanbul."];

  return (
    <section className="hero" id="top">
      <div className="shell hero-inner">
        <span className="eyebrow hero-anim" style={{ animationDelay: "80ms" }}>
          {language === "tr" ? "Portfolyo · 2026" : "Portfolio · 2026"}
        </span>

        <h1 className="hero-name display grad-text hero-anim" style={{ animationDelay: "180ms" }}>
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

          {/* Buton eskiden imleci takip ediyordu (Magnetic). İki sorunu
              vardı: fareden kaçıyormuş gibi görünüyordu ve tıklama hedefi
              yer değiştirdiği için isabet ettirmek zorlaşıyordu — motor
              becerisi kısıtlı biri için doğrudan erişilebilirlik sorunu.
              Yerine amaca bağlı bir hareket geldi (.btn-cv): üzerine
              gelince ince bir ışık soldan sağa süpürüyor ve ikon bir tık
              aşağı iniyor. Buton yerinde duruyor, hareket anlam taşıyor. */}
          <a
            href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
            className="btn btn-ghost btn-cv"
            target="_blank"
            rel="noopener noreferrer"
            download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
          >
            <Icon name="file" size={16} />
            {strings.cv.downloadButton}
          </a>
        </div>

        {/* Üç rakam. Hepsi projects.js'ten sayılıyor, elle yazılmıyor:
            yeni proje eklendiğinde burası kendiliğinden doğru kalıyor.
            Rakamlar display serifiyle basılıyor — sitedeki her büyük
            sayı (yıl başlıkları, vitrin numaraları) aynı ailede. */}
        <dl className="hero-stats hero-anim" style={{ animationDelay: "560ms" }}>
          {[
            [sayilar.projects, strings.hero.stats.projects],
            [sayilar.live, strings.hero.stats.live],
            [sayilar.games, strings.hero.stats.games],
          ].map(([deger, etiket]) => (
            <div className="hero-stat" key={etiket}>
              <dt className="display">{deger}</dt>
              <dd className="eyebrow">{etiket}</dd>
            </div>
          ))}
        </dl>
      </div>

      <span className="hero-scroll" aria-hidden="true">
        <span className="eyebrow">{language === "tr" ? "Kaydır" : "Scroll"}</span>
        <span className="hero-scroll-line" />
      </span>
    </section>
  );
}

export default Hero;
