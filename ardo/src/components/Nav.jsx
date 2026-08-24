import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   Üst çubuk: marka, bölüm linkleri ve dil anahtarı.

   DİL ANAHTARI — işaretleme ve sınıf adları eski App.jsx'ten birebir
   taşındı (`language-switcher-v2` / `switch-track` / `lang-option-v2`
   / `crystal-flag`). CSS'i de App.css içinde aynen duruyor, tek bir
   değeri değişmedi. Tek fark konumu: eskiden ekranın sol üst köşesine
   `position: fixed` ile çivilenmişti, artık çubuğun içinde akıyor.
------------------------------------------------------------------- */

function Nav({ language, setLanguage, strings }) {
  const [kaydi, setKaydi] = useState(false);
  const [acik, setAcik] = useState(false);
  const kapat = useCallback(() => setAcik(false), []);

  useEffect(() => {
    const onScroll = () => setKaydi(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = acik ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [acik]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setAcik(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Hangi bölümdeyiz? Üst çubukta altı link var ama hiçbiri nerede
     olduğumuzu söylemiyordu; ziyaretçi dört ekran kaydırdıktan sonra
     menüye baktığında bir işaret bulamıyor. IntersectionObserver
     scroll dinleyicisinden ucuz: tarayıcı kesişimi kendi hesaplıyor.
     rootMargin üst çubuğun yüksekliğini telafi ediyor. */
  const [aktif, setAktif] = useState("");
  useEffect(() => {
    const bolumler = ["about", "work", "journey", "gallery", "studio", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!bolumler.length) return undefined;

    const gozlemci = new IntersectionObserver(
      (girisler) => {
        const gorunen = girisler
          .filter((g) => g.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (gorunen) setAktif(gorunen.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5] }
    );

    bolumler.forEach((b) => gozlemci.observe(b));
    return () => gozlemci.disconnect();
  }, []);

  // Sıra sayfadaki bölüm sırasıyla birebir aynı. Menü, sayfanın
  // kendisinden farklı bir sıra öneriyorsa ziyaretçi nerede olduğunu
  // takip edemiyor.
  const linkler = [
    { href: "#about", label: strings.nav.about },
    { href: "#work", label: strings.nav.projects },
    { href: "#journey", label: language === "tr" ? "Çizelge" : "Timeline" },
    { href: "#gallery", label: language === "tr" ? "Arşiv" : "Archive" },
    { href: "#studio", label: language === "tr" ? "Stüdyo" : "Studio" },
    { href: "#contact", label: strings.nav.contact },
  ];

  return (
    <header className={`nav ${kaydi ? "is-scrolled" : ""}`}>
      <div className="nav-pill">
        <Link to="/" className="nav-brand" onClick={kapat}>
          <img src="/ardeko.png" alt="" className="nav-logo" />
          <span>Arda Güner</span>
        </Link>

        <span className="nav-divider" aria-hidden="true" />

        <nav className="nav-links" aria-label={strings.nav.home}>
          {linkler.map((l) => {
            const acik_mi = `#${aktif}` === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                className={acik_mi ? "is-current" : ""}
                aria-current={acik_mi ? "true" : undefined}
              >
                {l.label}
              </a>
            );
          })}
          <Link to="/codelab">Code Lab</Link>
        </nav>

        <span className="nav-divider" aria-hidden="true" />

        {/* Dil anahtarı — işaretleme birebir korundu. */}
        <div className={`language-switcher-v2 lang-${language}`}>
          <div className="switch-track">
            <div
              className={`lang-option-v2 turkish ${language === "tr" ? "active" : ""}`}
              onClick={() => setLanguage("tr")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setLanguage("tr")}
              aria-pressed={language === "tr"}
              aria-label="Türkçe'ye geç"
            >
              <span className="crystal-flag tr-flag" />
              <span className="lang-text">TR</span>
            </div>

            <div className="switch-handle" />

            <div
              className={`lang-option-v2 english ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setLanguage("en")}
              aria-pressed={language === "en"}
              aria-label="Switch to English"
            >
              <span className="crystal-flag en-flag" />
              <span className="lang-text">EN</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`hamburger ${acik ? "is-open" : ""}`}
          onClick={() => setAcik((o) => !o)}
          aria-expanded={acik}
          aria-controls="mobil-menu"
          aria-label={
            acik
              ? language === "tr"
                ? "Menüyü kapat"
                : "Close menu"
              : language === "tr"
                ? "Menüyü aç"
                : "Open menu"
          }
        >
          <span />
          <span />
        </button>
      </div>

      <div
        className={`nav-backdrop ${acik ? "is-visible" : ""}`}
        onClick={kapat}
        aria-hidden="true"
      />

      <div id="mobil-menu" className={`nav-sheet ${acik ? "is-open" : ""}`}>
        {linkler.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={kapat}
            className={`#${aktif}` === l.href ? "is-current" : ""}
            style={{ transitionDelay: `${acik ? 120 + i * 55 : 0}ms` }}
          >
            {l.label}
          </a>
        ))}
        <Link
          to="/codelab"
          onClick={kapat}
          style={{ transitionDelay: `${acik ? 120 + linkler.length * 55 : 0}ms` }}
        >
          Code Lab
        </Link>
      </div>
    </header>
  );
}

export default Nav;
