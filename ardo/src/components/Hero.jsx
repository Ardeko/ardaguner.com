import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "./Icon";
import HeroDeck from "./HeroDeck";
import CountUp from "../motion/CountUp";
import { stats } from "../data/projects";
import { gsap, useGSAP, azalt } from "../motion/core";

/* ------------------------------------------------------------------
   Hero — sitenin tek "orkestralı" anı.

   v2'de sayfanın geri kalanı sakin; bütün koreografi burada ve perde
   kalkarken bir kez oynuyor:
     1. İsmin harfleri kendi maskelerinin içinden sırayla yükseliyor
        (kinetik tipografi).
     2. Sağda oyun kapakları farklı derinliklerden süzülüp yerine
        oturuyor (HeroDeck — spatial UI).
     3. Rol satırı, açıklama, butonlar ve rakamlar akıyor; rakamlar
        sıfırdan sayıyor.
   Arkada aurora ışığı (Backdrop) zaten yanıyor.

   İsim iki satır: "Arda / Güner". Tek satır hâli sağdaki kartlarla
   aynı satıra sığmıyordu; iki satırda daha büyük basılabiliyor ve
   editoryal bir kapak gibi duruyor.

   İmleç ışığı korunuyor (background-attachment: fixed, --mx/--my) —
   ama artık harf başına boyanıyor, çünkü harfler ayrı ayrı hareket
   ediyor. Açılış bitince transform temizleniyor; fixed arka plan
   transform'lu elemanda çalışmıyordu.

   Dönen rol kelimesi bir slot makinesi gibi: eski kelime yukarı çıkarken
   yenisi aşağıdan geliyor ve kutunun genişliği yeni kelimeye kayarak
   uyuyor (cümlenin geri kalanı zıplamıyor).
------------------------------------------------------------------- */

const ISIM = ["Arda", "Güner"];

function Hero({ language, strings, roles, ready }) {
  const kok = useRef(null);
  const kelimeRef = useRef(null);
  const [rol, setRol] = useState(0);
  const [dondu, setDondu] = useState(false);
  const [genislik, setGenislik] = useState(null);
  const sayilar = stats();

  useEffect(() => {
    if (!ready || azalt()) return undefined;
    const t = window.setInterval(() => {
      setDondu(true);
      setRol((r) => (r + 1) % roles.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [ready, roles.length]);

  // Yeni kelimenin genişliğini ölç; kutu ona doğru kayarak büyüyüp küçülsün.
  useLayoutEffect(() => {
    const olc = () => {
      if (kelimeRef.current) setGenislik(kelimeRef.current.getBoundingClientRect().width);
    };
    olc();
    document.fonts?.ready?.then(olc);
  }, [rol, language]);

  useGSAP(
    () => {
      if (!ready || azalt()) return;
      const q = gsap.utils.selector(kok);
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(
        q(".hn-char"),
        { yPercent: 118, rotate: 8 },
        { yPercent: 0, rotate: 0, duration: 1.35, stagger: 0.05, clearProps: "transform" },
        0.08
      )
        .fromTo(
          q(".deck-intro"),
          { y: 150, autoAlpha: 0, rotateX: -34, scale: 0.86 },
          { y: 0, autoAlpha: 1, rotateX: 0, scale: 1, duration: 1.7, stagger: 0.09, clearProps: "transform" },
          0.22
        )
        .fromTo(
          q(".hero-anim"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, clearProps: "transform" },
          0.4
        );

      // Kaydırınca yalnız dekoratif kart yığını yukarı süzülüyor.
      gsap.to(q(".deck"), {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: kok.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: kok, dependencies: [ready] }
  );

  /* Artikel role göre seçiliyor ("an instructor"). İngilizce'de artikel
     sese bakıyor; mevcut dört rol için sesli harf kontrolü doğru. */
  const rolAd = roles[rol] || "";
  const artikel = /^[aeiou]/i.test(rolAd) ? "An " : "A ";
  const cumle =
    language === "tr" ? ["Bir ", " İstanbul'da yaşıyor."] : [artikel, " based in Istanbul."];
  const onceki = dondu ? (rol - 1 + roles.length) % roles.length : null;

  return (
    <section className={`hero${ready ? " is-ready" : ""}`} id="top" ref={kok}>
      <div className="shell hero-grid">
        <div className="hero-copy">
          <a href="#studio" className="hero-chip glass hero-anim">
            <img src="/ardeko.png" alt="" width="20" height="20" />
            <span>{strings.hero.founderChip}</span>
          </a>

          {/* aria-label ekran okuyucuya tek isim veriyor; harf span'leri
              aria-hidden. Metin içeriği yine "Arda Güner" (satırlar
              arasında gerçek boşluk var) — arama motoru da onu okuyor. */}
          <h1 className="hero-name" aria-label="Arda Güner">
            {ISIM.map((kelime, wi) => (
              <span className={`hn-line hn-line-${wi + 1}`} key={kelime} aria-hidden="true">
                {Array.from(kelime).map((c, ci) => (
                  <span className="hn-char" key={ci}>
                    {c}
                  </span>
                ))}
                {wi < ISIM.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p className="hero-role hero-anim">
            {cumle[0]}
            <span className="role-slot" style={genislik ? { width: `${genislik}px` } : undefined}>
              {onceki !== null && (
                <span key={`o-${rol}`} className="role-word is-out display" aria-hidden="true">
                  {roles[onceki]}
                </span>
              )}
              <span key={`i-${rol}`} ref={kelimeRef} className={`role-word display${dondu ? " is-in" : ""}`}>
                {roles[rol]}
              </span>
            </span>
            {cumle[1]}
          </p>

          <p className="lede hero-lede hero-anim">{strings.hero.subtitle}</p>

          <div className="hero-actions hero-anim">
            <a href="#work" className="btn btn-solid btn-arrow">
              {strings.nav.projects}
              <span className="btn-arrow-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            {/* Buton imleci takip etmiyor (eski Magnetic kaldırılmıştı:
                tıklama hedefi kaçıyordu). Hareket yerinde: ışık süpürüyor,
                ikon bir tık aşağı iniyor — indirme jesti. */}
            <a
              href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
              className="btn btn-ghost btn-cv"
              target="_blank"
              rel="noopener noreferrer"
              download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
            >
              <Icon name="download" size={16} />
              {strings.cv.downloadButton}
            </a>
          </div>

          {/* Rakamlar projects.js'ten sayılıyor, elle yazılmıyor. */}
          <dl className="hero-stats hero-anim">
            {[
              [sayilar.projects, strings.hero.stats.projects],
              [sayilar.live, strings.hero.stats.live],
              [sayilar.games, strings.hero.stats.games],
            ].map(([deger, etiket]) => (
              <div className="hero-stat" key={etiket}>
                <dt className="display">
                  <CountUp value={deger} start={ready} duration={1800} />
                </dt>
                <dd className="eyebrow is-bare">{etiket}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroDeck strings={strings} label={strings.hero.deckLabel} />
      </div>

      <span className="hero-scroll" aria-hidden="true">
        <span>{language === "tr" ? "Kaydır" : "Scroll"}</span>
        <span className="hero-scroll-line" />
      </span>
    </section>
  );
}

export default Hero;
