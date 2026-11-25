import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { lenisRef } from "../motion/lenis";
import CommandPalette from "./CommandPalette";
import Icon from "./Icon";

/* ------------------------------------------------------------------
   Üst çubuk — "Dinamik Ada" (v2).

   Eski hâli sabit bir haptı: marka, altı link, dil anahtarı. Her
   ekranda aynı genişlikte duruyor, okurken de gözün önünde menünün
   tamamı asılı kalıyordu.

   ŞEKİL: ekranın üst kenarından sarkan bir ÇENTİK — üstü ekrana yapışık,
   iki yanda içe kavisli omuzlarla kenara bağlanıyor, alt köşeleri
   yuvarlak (Arda dört seçenek arasından bunu seçti: çentik, sıvı
   damlalar, oyun HUD'u, yan ray). Şekil App.css'te .notch.

   DAVRANIŞ: tek bir yüzey, üç biçim arasında yay hareketiyle şekil
   değiştiriyor (Apple'ın Dynamic Island'ı ve Liquid Glass malzemesi):

     full    — sayfanın tepesinde ya da fare üstündeyken: marka, linkler
               (arkalarında kayan cam mercek), dil anahtarı, ⌘K.
     compact — okurken: küçük bir ada. Logo, çevresinde sayfa ilerleme
               halkası ve BULUNDUĞUN BÖLÜMÜN ADI. Bölüm değiştikçe ad
               slot makinesi gibi dönüyor, ada da yeni ada göre
               genişleyip daralıyor. Üstüne gelince yeniden açılıyor.
     sheet   — dar ekranda menü düğmesine basınca ada aşağı doğru büyüyüp
               bir panele dönüşüyor (ayrı bir çekmece yok).

   Genişlik/yükseklik ölçülüp tek bir transition ile değişiyor; içerik
   grupları üst üste duruyor, yalnız aktif olan görünür ve odaklanabilir
   (diğeri inert). Ada taşmayı kırptığı için daralırken içerik "sıkışıyor"
   gibi görünüyor — biçim değiştiren tek bir nesne hissi buradan geliyor.

   ⌘K / Ctrl+K komut paletini açıyor (CommandPalette.jsx): bölüme atla,
   proje ara, dil değiştir, e-postayı kopyala.

   DİL ANAHTARI — işaretleme ve sınıf adları eski App.jsx'ten birebir
   (`language-switcher-v2` / `switch-track` / `lang-option-v2` /
   `crystal-flag`). Tek fark: artık bir bileşen (DilAnahtari), çünkü hem
   geniş biçimde hem dar ekrandaki adada basılıyor; CSS ikisinden yalnız
   birini gösteriyor.
------------------------------------------------------------------- */

const BOLUMLER = ["about", "work", "journey", "gallery", "studio", "contact"];
const GENIS_SORGU = "(min-width: 1100px)";
const HALKA_R = 19;
const HALKA_C = 2 * Math.PI * HALKA_R;

function DilAnahtari({ language, setLanguage }) {
  return (
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
  );
}

function useMedia(sorgu) {
  const [eslesti, setEslesti] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(sorgu).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(sorgu);
    const degisti = () => setEslesti(mq.matches);
    degisti();
    mq.addEventListener("change", degisti);
    return () => mq.removeEventListener("change", degisti);
  }, [sorgu]);
  return eslesti;
}

const MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

function Nav({ language, setLanguage, strings }) {
  const { pathname } = useLocation();
  const ana = pathname === "/";
  const genis = useMedia(GENIS_SORGU);
  const tr = language === "tr";

  const [ustte, setUstte] = useState(true);
  const [uzerinde, setUzerinde] = useState(false);
  const [odakta, setOdakta] = useState(false);
  const [panel, setPanel] = useState(false);
  const [palet, setPalet] = useState(false);
  const [mercekHedef, setMercekHedef] = useState(null);

  const adaRef = useRef(null);
  const satirRef = useRef(null);
  const logoRef = useRef(null);
  const tamRef = useRef(null);
  const kucukRef = useRef(null);
  const yuvaRef = useRef(null);
  const etiketRef = useRef(null);
  const panelRef = useRef(null);
  const halkaRef = useRef(null);
  const linklerRef = useRef(null);
  const mercekRef = useRef(null);
  const birakZaman = useRef(0);

  const mod = panel ? "sheet" : genis && (ustte || uzerinde || odakta) ? "full" : "compact";

  /* --- Kaydırma: tepe eşiği, ilerleme halkası, bulunduğun bölüm -------

     Bulunduğun bölüm eskiden IntersectionObserver ile bulunuyordu ve
     takılıyordu: gözlemci yalnız durumu DEĞİŞEN bölümleri bildiriyor.
     Ölçüm bandına iki bölüm birden düştüğünde (Hakkımda'nın sonu ile
     Projeler'in başı) üstteki kazanıyor; o banttan çıkınca alttaki
     "zaten kesişiyordu" diye hiç bildirilmiyor ve işaret Hakkımda'da
     kalıyordu. Şimdi her kaydırma karesinde doğrudan konumdan
     hesaplanıyor: üst kenarı ekranın %30'unu geçmiş son bölüm. Altı
     getBoundingClientRect — rAF ile kare başına bir kez, maliyeti yok.
     Bölümler her seferinde id ile aranıyor; dil değişince yeniden
     kurulan <main>'in yeni düğümleri kendiliğinden bulunuyor. */
  const [aktif, setAktif] = useState("");
  useEffect(() => {
    let raf = 0;
    const olc = () => {
      raf = 0;
      const y = window.scrollY;
      setUstte(y < 90);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const oran = max > 0 ? Math.min(y / max, 1) : 0;
      if (halkaRef.current) halkaRef.current.style.strokeDashoffset = String(HALKA_C * (1 - oran));

      const cizgi = window.innerHeight * 0.3;
      let su = "";
      for (const id of BOLUMLER) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= cizgi) su = id;
      }
      // Sayfanın dibine inildiyse son bölüm (iletişim) kısa kalsa da işaretlensin.
      if (max > 0 && y >= max - 2 && document.getElementById("contact")) su = "contact";
      setAktif(su);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(olc);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    olc();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, language]);

  const linkler = [
    { id: "about", label: strings.nav.about },
    { id: "work", label: strings.nav.projects },
    { id: "journey", label: tr ? "Çizelge" : "Timeline" },
    { id: "gallery", label: tr ? "Arşiv" : "Archive" },
    { id: "studio", label: tr ? "Stüdyo" : "Studio" },
    { id: "contact", label: strings.nav.contact },
  ].map((l) => ({ ...l, href: ana ? `#${l.id}` : `/#${l.id}` }));

  /* Adadaki etiket: ana sayfada bölümün adı, diğer sayfalarda sayfanın. */
  const sayfaAdi = {
    "/privacy-policy": tr ? "Gizlilik" : "Privacy",
    "/codelab": "Code Lab",
    "/case/apex-shift": tr ? "Vaka çalışması" : "Case study",
    "/torpidodan/hesap-silme": "Torpidodan",
    "/torpidodan/kullanim-kosullari": "Torpidodan",
  }[pathname.replace(/\/$/, "") || "/"];
  const etiket = panel
    ? tr
      ? "Menü"
      : "Menu"
    : ana
      ? linkler.find((l) => l.id === aktif)?.label || "Arda Güner"
      : sayfaAdi || "Arda Güner";

  const [etiketGecmis, setEtiketGecmis] = useState({ simdi: etiket, once: null, n: 0 });
  useEffect(() => {
    setEtiketGecmis((g) => (g.simdi === etiket ? g : { simdi: etiket, once: g.simdi, n: g.n + 1 }));
  }, [etiket]);

  /* --- Ölçüm: her biçimin genişliği ---------------------------------
     Ada genişliği CSS'te "auto" olsaydı biçim değişimi animasyonsuz
     sıçrardı (auto'dan px'e geçiş yok). Gruplar max-content genişlikte
     üst üste duruyor; ölçüp adaya px olarak veriyoruz. Etiket kutusu
     geçiş hâlindeyken offsetWidth ara değeri verdiği için küçük adanın
     genişliği "sabit kısım + yeni etiketin doğal genişliği" diye
     hesaplanıyor. */
  const [olcu, setOlcu] = useState({ tam: 0, kucuk: 0, etiket: 0, panel: 0, ek: 0 });
  const olc = useCallback(() => {
    const satir = satirRef.current;
    if (!satir) return;
    const st = getComputedStyle(satir);
    const ek =
      (logoRef.current?.offsetWidth || 0) +
      parseFloat(st.columnGap || st.gap || 0) +
      parseFloat(st.paddingLeft) +
      parseFloat(st.paddingRight);
    const tam = tamRef.current?.offsetWidth || 0;
    const yuva = yuvaRef.current?.offsetWidth || 0;
    const etiketW = etiketRef.current ? Math.ceil(etiketRef.current.getBoundingClientRect().width) : 0;
    const kucuk = (kucukRef.current?.offsetWidth || 0) - yuva + etiketW;
    const panelH = panelRef.current?.scrollHeight || 0;
    setOlcu({ tam, kucuk, etiket: etiketW, panel: panelH, ek });
  }, []);

  useLayoutEffect(() => {
    olc();
  }, [olc, etiketGecmis, language, genis, pathname]);

  useEffect(() => {
    window.addEventListener("resize", olc);
    document.fonts?.ready?.then(olc);
    return () => window.removeEventListener("resize", olc);
  }, [olc]);

  /* --- Mercek (geniş biçimde linklerin arkasındaki cam) ------------- */
  const kodLab = pathname === "/codelab";
  const mercekKonumla = useCallback(() => {
    const kap = linklerRef.current;
    const m = mercekRef.current;
    if (!kap || !m) return;
    const hedef = mercekHedef || (kodLab ? "codelab" : aktif);
    const el = hedef ? kap.querySelector(`[data-id="${hedef}"]`) : null;
    if (!el) {
      m.style.opacity = "0";
      return;
    }
    m.style.opacity = "1";
    m.style.width = `${el.offsetWidth}px`;
    m.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [mercekHedef, aktif, kodLab]);

  useLayoutEffect(() => {
    mercekKonumla();
  }, [mercekKonumla, language, mod]);

  useEffect(() => {
    window.addEventListener("resize", mercekKonumla);
    document.fonts?.ready?.then(mercekKonumla);
    return () => window.removeEventListener("resize", mercekKonumla);
  }, [mercekKonumla]);

  /* --- Panel (dar ekran) ve palet açıkken sayfa dursun --------------- */
  useEffect(() => {
    if (genis && panel) setPanel(false);
  }, [genis, panel]);

  useEffect(() => {
    const kilit = panel || palet;
    document.body.style.overflow = panel ? "hidden" : "";
    if (kilit) lenisRef.current?.stop();
    else lenisRef.current?.start();
    return () => {
      document.body.style.overflow = "";
      lenisRef.current?.start();
    };
  }, [panel, palet]);

  // Rota değişince panel kapansın.
  useEffect(() => {
    setPanel(false);
  }, [pathname]);

  /* --- Klavye: Esc, ⌘K / Ctrl+K, "/" --------------------------------- */
  useEffect(() => {
    const tus = (e) => {
      if (e.key === "Escape") {
        setPanel(false);
        return;
      }
      const yaziyor = e.target?.closest?.('input, textarea, select, [contenteditable="true"], .monaco-editor');
      const kisayol = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (kisayol && !yaziyor) {
        e.preventDefault();
        setPalet((p) => !p);
      } else if (e.key === "/" && !yaziyor && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPalet(true);
      }
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, []);

  const gir = () => {
    window.clearTimeout(birakZaman.current);
    setUzerinde(true);
  };
  const birak = () => {
    window.clearTimeout(birakZaman.current);
    // Kısa gecikme: imleç adanın kenarından bir an taşınca kapanıp
    // açılarak titremesin.
    birakZaman.current = window.setTimeout(() => setUzerinde(false), 380);
  };
  useEffect(() => () => window.clearTimeout(birakZaman.current), []);

  /* Klavye: odak geniş gruptayken ada açık kalıyor. Küçük gruptan geniş
     gruba geçerken küçük grup inert oluyor ve içindeki düğme odağını
     kaybediyor (relatedTarget boş) — o kayıp "adadan çıktı" sayılmıyor,
     yoksa ada açılıp hemen geri kapanıyordu. */
  const odakIste = useRef(false);
  const odakGir = (e) => {
    if (genis && tamRef.current?.contains(e.target)) setOdakta(true);
  };
  const odakCik = (e) => {
    if (adaRef.current?.contains(e.relatedTarget)) return;
    if (!e.relatedTarget && kucukRef.current?.contains(e.target)) return;
    setOdakta(false);
  };

  const etiketTikla = () => {
    if (genis) {
      odakIste.current = true;
      setOdakta(true);
    } else {
      setPanel((p) => !p);
    }
  };

  useEffect(() => {
    if (mod === "full" && odakIste.current) {
      odakIste.current = false;
      linklerRef.current?.querySelector("a")?.focus();
    }
  }, [mod]);

  const kapat = () => setPanel(false);

  // Panel genişliği CSS'teki .island-sheet genişliğiyle AYNI olmalı
  // (--sheet-w, App.css): panel gizliyken de o genişlikte ölçülüyor.
  const adaStil = {};
  if (olcu.ek) {
    if (mod === "full") adaStil.width = `${olcu.ek + olcu.tam}px`;
    else if (mod === "compact") adaStil.width = `${olcu.ek + olcu.kucuk}px`;
    else adaStil.width = "var(--sheet-w)";
  }
  if (mod === "sheet") adaStil.height = `calc(var(--ada-h) + ${olcu.panel}px)`;

  const kisayolMetni = MAC ? "⌘K" : "Ctrl K";

  /* Çentik iki katman: dış .notch şekli taşıyor (genişlik/yükseklik geçişi,
     dolgu, alt köşeler, ekranın üst kenarına bağlanan içe kavisli
     omuzlar). Omuzlar kutunun DIŞINDA durduğu için taşmayı kırpan katman
     o olamaz; içerik iç .island'da kırpılıyor. */
  return (
    <header className={`nav nav--${mod}${ustte ? " is-top" : ""}`}>
      <div className="notch" style={adaStil} onPointerEnter={gir} onPointerLeave={birak}>
      <div className="island" ref={adaRef} onFocus={odakGir} onBlur={odakCik}>
        <div className="island-row" ref={satirRef}>
          <Link to="/" className="island-logo" ref={logoRef} onClick={kapat} aria-label={tr ? "Arda Güner — anasayfa" : "Arda Güner — home"}>
            <svg className="island-ring" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r={HALKA_R} className="island-ring-track" />
              <circle
                ref={halkaRef}
                cx="22"
                cy="22"
                r={HALKA_R}
                className="island-ring-fill"
                strokeDasharray={HALKA_C}
                strokeDashoffset={HALKA_C}
              />
            </svg>
            {/* Kişisel monogram (AG). Eskiden burada Ardeko Studios logosu
                vardı; stüdyo logosu artık yalnız stüdyoyu anlatan yerlerde
                (hero'daki "kurucusu" çipi, Stüdyo bölümü). */}
            <img src="/brand/ag-mark.webp" alt="" width="30" height="30" />
          </Link>

          <div className="island-stack">
            {/* --- Geniş biçim --- */}
            <div className="island-full" ref={tamRef} inert={mod === "full" ? undefined : ""}>
              <Link to="/" className="nav-brand">
                Arda Güner
              </Link>
              <span className="nav-divider" aria-hidden="true" />
              <nav
                className="nav-links"
                aria-label={strings.nav.home}
                ref={linklerRef}
                onPointerLeave={() => setMercekHedef(null)}
              >
                <span className="nav-lens" ref={mercekRef} aria-hidden="true" />
                {linkler.map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    data-id={l.id}
                    className={aktif === l.id ? "is-current" : ""}
                    aria-current={aktif === l.id ? "true" : undefined}
                    onPointerEnter={() => setMercekHedef(l.id)}
                    onFocus={() => setMercekHedef(l.id)}
                    onBlur={() => setMercekHedef(null)}
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/codelab"
                  data-id="codelab"
                  className={kodLab ? "is-current" : ""}
                  aria-current={kodLab ? "page" : undefined}
                  onPointerEnter={() => setMercekHedef("codelab")}
                  onFocus={() => setMercekHedef("codelab")}
                  onBlur={() => setMercekHedef(null)}
                >
                  Code Lab
                </Link>
              </nav>
              <span className="nav-divider" aria-hidden="true" />
              <DilAnahtari language={language} setLanguage={setLanguage} />
              <button type="button" className="cmd-chip" onClick={() => setPalet(true)} aria-label={strings.palette.open}>
                <Icon name="search" size={14} />
                <kbd>{kisayolMetni}</kbd>
              </button>
            </div>

            {/* --- Ada biçimi --- */}
            <div className="island-compact" ref={kucukRef} inert={mod === "full" ? "" : undefined}>
              <button
                type="button"
                className="ic-label"
                onClick={etiketTikla}
                aria-expanded={genis ? undefined : panel}
                aria-controls={genis ? undefined : "ada-panel"}
                aria-label={genis ? (tr ? `Menüyü aç — şu an: ${etiket}` : `Open menu — now: ${etiket}`) : undefined}
              >
                <span className="ic-slot" ref={yuvaRef} style={olcu.etiket ? { width: `${olcu.etiket}px` } : undefined}>
                  {etiketGecmis.once && (
                    <span key={`o${etiketGecmis.n}`} className="ic-word is-out" aria-hidden="true">
                      {etiketGecmis.once}
                    </span>
                  )}
                  <span key={`i${etiketGecmis.n}`} ref={etiketRef} className={`ic-word${etiketGecmis.n ? " is-in" : ""}`}>
                    {etiketGecmis.simdi}
                  </span>
                </span>
              </button>

              <div className="ic-lang">
                <DilAnahtari language={language} setLanguage={setLanguage} />
              </div>

              <button type="button" className="cmd-chip ic-cmd" onClick={() => setPalet(true)} aria-label={strings.palette.open}>
                <Icon name="search" size={14} />
                <kbd>{kisayolMetni}</kbd>
              </button>

              <button
                type="button"
                className={`hamburger ic-menu ${panel ? "is-open" : ""}`}
                onClick={() => setPanel((o) => !o)}
                aria-expanded={panel}
                aria-controls="ada-panel"
                aria-label={panel ? (tr ? "Menüyü kapat" : "Close menu") : tr ? "Menüyü aç" : "Open menu"}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        {/* --- Panel biçimi (dar ekran) --- */}
        <div id="ada-panel" className="island-sheet" ref={panelRef} inert={mod === "sheet" ? undefined : ""}>
          <nav aria-label={strings.nav.home}>
            {linkler.map((l, i) => (
              <a
                key={l.id}
                href={l.href}
                onClick={kapat}
                className={aktif === l.id ? "is-current" : ""}
                style={{ "--i": i }}
              >
                <span className="sheet-no" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            ))}
            <Link to="/codelab" onClick={kapat} style={{ "--i": linkler.length }}>
              <span className="sheet-no" aria-hidden="true">
                {String(linkler.length + 1).padStart(2, "0")}
              </span>
              Code Lab
            </Link>
          </nav>
          <div className="sheet-foot" style={{ "--i": linkler.length + 1 }}>
            <button
              type="button"
              className="sheet-search"
              onClick={() => {
                setPanel(false);
                setPalet(true);
              }}
            >
              <Icon name="search" size={15} />
              {strings.palette.open}
            </button>
            {/* Mobilde alt bilgiye inmeden ulaşılsın diye; mağaza
                incelemesi ve oyuncular politikayı en çok telefondan açıyor. */}
            <Link
              to="/privacy-policy"
              onClick={kapat}
              className={pathname === "/privacy-policy" ? "is-current" : ""}
              aria-current={pathname === "/privacy-policy" ? "page" : undefined}
            >
              {tr ? "Gizlilik Politikası" : "Privacy Policy"}
            </Link>
          </div>
        </div>
      </div>
      </div>

      <div className={`nav-backdrop ${panel ? "is-visible" : ""}`} onClick={kapat} aria-hidden="true" />

      <CommandPalette
        open={palet}
        onClose={() => setPalet(false)}
        language={language}
        setLanguage={setLanguage}
        strings={strings}
      />
    </header>
  );
}

export default Nav;
