import { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./components/Enhancements.css";

import tr from "/locales/tr.json";
import en from "/locales/en.json";
import { tips } from "./tips";

import Particles from "./Particles";
import { useKonamiCode, ConfettiBurst } from "./KonamiConfetti";
import PrivacyPolicy from "./PrivacyPolicy";
import StudioSpotlight from "./StudioSpotlight";

import Backdrop from "./components/Backdrop";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Featured from "./components/Featured";
import Gallery from "./components/Gallery";
import Timeline from "./components/Timeline";
import About from "./components/About";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import NotFound from "./components/NotFound";

import { lazy, Suspense } from "react";
const CodeLab = lazy(() => import("./CodeLab"));

/* ------------------------------------------------------------------
   Kabuk: dil durumu, rotalar ve bölüm sırası. Eskiden 995 satırdı,
   içinde ikon seti, yörünge diyagramı, imleç ve saat de vardı;
   hepsi ya kendi dosyasına taşındı ya da kaldırıldı.

   ROTALAR DEĞİŞMEDİ. `/privacy-policy` Google Play kaydında geçtiği
   için kırılamaz; `/codelab` de aynı adreste ve hâlâ tembel yükleniyor.
------------------------------------------------------------------- */

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

  const [yukleniyor, setYukleniyor] = useState(true);
  const bitir = useCallback(() => setYukleniyor(false), []);

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
      {yukleniyor && (
        <Preloader
          words={language === "tr" ? ["Tasarla", "Kur", "Yayınla"] : ["Design", "Build", "Ship"]}
          onDone={bitir}
        />
      )}

      {/* Klavyeyle gezen ziyaretçi altı menü linkini tek tek geçmeden
          içeriğe atlayabiliyor. Odaklanmadıkça görünmüyor. */}
      <a href="#about" className="skip-link">
        {strings.nav.skip}
      </a>

      {/* Arka plan katmanı. Varyant: "aurora" | "beams" */}
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

                  Öne çıkanlardan sonra çizelge geliyor (dört işten
                  tüm kataloga), arşiv en sonda: derinleşmek isteyen
                  oraya kadar iniyor. */}
              <Hero language={language} strings={strings} roles={roller} />
              <About strings={strings} language={language} />
              <Featured strings={strings} />
              <Timeline strings={strings} language={language} />
              <Gallery strings={strings} />
              <StudioSpotlight language={language} />
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

        <Route path="/privacy-policy" element={<PrivacyPolicy language={language} />} />

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
