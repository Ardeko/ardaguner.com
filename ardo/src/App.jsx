import { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import SmoothScroll from "./motion/SmoothScroll";

import tr from "/locales/tr.json";
import en from "/locales/en.json";
import { tips } from "./tips";

import Particles from "./Particles";
import { useKonamiCode, ConfettiBurst } from "./KonamiConfetti";
import StudioSpotlight from "./StudioSpotlight";

import Backdrop from "./components/Backdrop";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Featured from "./components/Featured";
import CaseTeaser from "./components/CaseTeaser";
import Gallery from "./components/Gallery";
import Timeline from "./components/Timeline";
import About from "./components/About";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import NotFound from "./components/NotFound";

import { lazy, Suspense } from "react";
const CodeLab = lazy(() => import("./CodeLab"));

/* v2: ana sayfada hiç gerekmeyen sayfalar da tembel yükleniyor. Yeni
   hareket katmanı (GSAP + ScrollTrigger + Lenis, ~50 KB gzip) ana
   pakete girdi; gizlilik politikası, kullanım koşulları, hesap silme ve
   vaka çalışması (metinleri ve CSS'leriyle birlikte) ayrı parçalara
   çıkınca ilk yüklemenin büyük kısmı geri kazanılıyor. Adresler aynı. */
const PrivacyPolicy = lazy(() => import("./PrivacyPolicy"));
const AccountDeletion = lazy(() => import("./AccountDeletion"));
const TermsOfUse = lazy(() => import("./TermsOfUse"));
const CaseStudy = lazy(() => import("./CaseStudy"));

function SayfaBekle() {
  return (
    <div className="lab-loading" role="status">
      <span className="lab-spinner" />
    </div>
  );
}

/* ------------------------------------------------------------------
   Kabuk: dil durumu, rotalar ve bölüm sırası. Eskiden 995 satırdı,
   içinde ikon seti, yörünge diyagramı, imleç ve saat de vardı;
   hepsi ya kendi dosyasına taşındı ya da kaldırıldı.

   ROTALAR DEĞİŞMEDİ. `/privacy-policy` Google Play kaydında geçtiği
   için kırılamaz; `/codelab` de aynı adreste ve hâlâ tembel yükleniyor.
   `/torpidodan/hesap-silme` da mağaza kayıtlarında geçiyor (hesap
   silme adresi) — o da kırılamaz.
------------------------------------------------------------------- */

const SILME_YOLU = "/torpidodan/hesap-silme";
const KOSUL_YOLU = "/torpidodan/kullanim-kosullari";

function SkipLink({ label }) {
  const { pathname } = useLocation();
  const hedef =
    pathname === "/privacy-policy"
      ? "#privacy"
      : pathname === KOSUL_YOLU
        ? "#terms"
        : pathname === SILME_YOLU
        ? "#hesap-silme"
        : "#about";
  return (
    <a href={hedef} className="skip-link">
      {label}
    </a>
  );
}

const DILLER = { tr, en };
const DEPO = "ardaguner-dil";

function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "tr";
    const kayitli = window.localStorage.getItem(DEPO);
    if (kayitli === "tr" || kayitli === "en") return kayitli;
    return (navigator.language || "tr").toLowerCase().startsWith("tr") ? "tr" : "en";
  });

  const strings = DILLER[language];

  // Dil seçimi eskiden hiçbir yere yazılmıyordu; sayfa yenileyince
  // TR'ye dönüyordu. Artık kalıcı ve <html lang> de güncelleniyor —
  // ekran okuyucular ve arama motorları için gerekli.
  useEffect(() => {
    window.localStorage.setItem(DEPO, language);
    document.documentElement.lang = language;
  }, [language]);

  // Hesap silme sayfası mağaza incelemesinden ve uygulamayı silmiş
  // kullanıcılardan doğrudan açılıyor; iki saniyelik perde orada
  // yalnızca bilgiyi geciktirir.
  const [yukleniyor, setYukleniyor] = useState(
    () => typeof window === "undefined" || window.location.pathname.replace(/\/$/, "") !== SILME_YOLU
  );
  const bitir = useCallback(() => setYukleniyor(false), []);

  // Hero'nun açılış koreografisi perde KALKARKEN başlıyor (perde tamamen
  // gidince değil); perde hiç yoksa hemen.
  const [sahne, setSahne] = useState(() => !yukleniyor);
  const perdeKalkti = useCallback(() => setSahne(true), []);

  const [celebrate, setCelebrate] = useState(false);
  const handleUnlock = useCallback(() => {
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 3600);
  }, []);
  useKonamiCode(handleUnlock);

  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const liste = tips[language] || [];
    if (liste.length) setTipIndex(Math.floor(Math.random() * liste.length));
  }, [language]);

  const roller =
    language === "tr"
      ? ["yazılım mühendisi", "oyun geliştirici", "web geliştirici", "eğitmen"]
      : ["software engineer", "game developer", "web developer", "instructor"];

  return (
    <Router>
      <SmoothScroll />

      {yukleniyor && (
        <Preloader
          words={language === "tr" ? ["Tasarla", "Kur", "Yayınla"] : ["Design", "Build", "Ship"]}
          onLift={perdeKalkti}
          onDone={bitir}
        />
      )}

      {/* Klavyeyle gezen ziyaretçi altı menü linkini tek tek geçmeden
          içeriğe atlayabiliyor. Odaklanmadıkça görünmüyor. */}
      <SkipLink label={strings.nav.skip} />

      {/* Arka plan katmanı. Varyant: "aurora" (WebGL) | "beams" | "drift".
          aurora, WebGL yoksa kendiliğinden drift'e düşüyor. */}
      <Backdrop variant="aurora" />
      <Particles />
      <ConfettiBurst active={celebrate} language={language} />

      <Nav language={language} setLanguage={setLanguage} strings={strings} />

      <Routes>
        <Route
          path="/"
          element={
            <main key={language} className="page">
              {/* BÖLÜM SIRASI — bilinçli.
                  Hero kim olduğunu söyler, About onu açar, ancak
                  ondan sonra iş gösterilir. Eskiden ziyaretçi önce
                  projelere çarpıyor, "bunları yapan kim" sorusunun
                  cevabını sayfanın dibinde buluyordu.

                  Öne çıkanlardan sonra çizelge geliyor (seçilmiş işlerden
                  tüm kataloga), arşiv en sonda: derinleşmek isteyen
                  oraya kadar iniyor. */}
              <Hero language={language} strings={strings} roles={roller} ready={sahne} />
              <About strings={strings} language={language} />
              <Featured strings={strings} />
              {/* Vitrin ne yaptigini gosterir; bu blok nasil dusundugunu. */}
              <CaseTeaser strings={strings} />
              <Timeline strings={strings} language={language} />
              <Gallery strings={strings} />
              <StudioSpotlight strings={strings} />
            </main>
          }
        />

        <Route
          path="/codelab"
          element={
            <Suspense
              fallback={
                <div className="lab-loading">
                  <span className="lab-spinner" />
                  <span>Loading Code Lab…</span>
                </div>
              }
            >
              <CodeLab lang={language} strings={strings} />
            </Suspense>
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<SayfaBekle />}>
              <PrivacyPolicy language={language} />
            </Suspense>
          }
        />

        {/* İki dilli, oturumsuz. Statik kopyası vite.config.js'te. */}
        <Route
          path={SILME_YOLU}
          element={
            <Suspense fallback={<SayfaBekle />}>
              <AccountDeletion />
            </Suspense>
          }
        />

        {/* Oyun kuralları, açık kullanımı yasağı, yaptırımlar. Statik kopyası vite.config.js'te. */}
        <Route
          path={KOSUL_YOLU}
          element={
            <Suspense fallback={<SayfaBekle />}>
              <TermsOfUse language={language} />
            </Suspense>
          }
        />

        {/* Vaka calismasi. Icerik locales icinde; yeni vaka eklemek
            burada bir rota ve orada bir anahtar demek. */}
        <Route
          path="/case/apex-shift"
          element={
            <Suspense fallback={<SayfaBekle />}>
              <CaseStudy strings={strings} />
            </Suspense>
          }
        />

        {/* Yakalayıcı rota. Yoksa /eskisayfa gibi bir adres üst çubuk
            ile alt bilgi arasında bomboş bir gövde basıyordu. */}
        <Route path="*" element={<NotFound strings={strings} />} />
      </Routes>

      <Footer strings={strings} language={language} tip={tips[language]?.[tipIndex]} />
      <BackToTop label={strings.nav.top} />
    </Router>
  );
}

export default App;
