import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { tips } from "./tips";
import tr from "/locales/tr.json";
import en from "/locales/en.json";
import PrivacyPolicy from './PrivacyPolicy';
import StudioSpotlight from "./StudioSpotlight";
import Reveal from "./Reveal";
import Particles from "./Particles";
import Tilt from "./Tilt";
import Magnetic from "./Magnetic";
import { useKonamiCode, ConfettiBurst } from "./KonamiConfetti";

const CodeLab = lazy(() => import("./CodeLab"));

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock">
      🕒 {time.toLocaleTimeString()} - 📅 {time.toLocaleDateString()}
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  // Sadece gerçek fare + hover destekleyen cihazlarda aktif (mobil/dokunmatik hariç)
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncEnabled = () => setEnabled(query.matches);
    syncEnabled();
    query.addEventListener("change", syncEnabled);
    return () => query.removeEventListener("change", syncEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interactiveSelector = "a, button, [role='button'], input, textarea, select, .tilt, .magnetic";

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (reduceMotion && ringRef.current) {
        ringRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e) => {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.add("cursor-ring-hover");
      }
    };
    const onMouseOut = (e) => {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.remove("cursor-ring-hover");
      }
    };
    const onMouseDown = () => ringRef.current?.classList.add("cursor-ring-active");
    const onMouseUp = () => ringRef.current?.classList.remove("cursor-ring-active");
    const onMouseLeaveWindow = () => {
      dotRef.current?.style.setProperty("opacity", "0");
      ringRef.current?.style.setProperty("opacity", "0");
    };
    const onMouseEnterWindow = () => {
      dotRef.current?.style.setProperty("opacity", "1");
      ringRef.current?.style.setProperty("opacity", "1");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    document.addEventListener("mouseenter", onMouseEnterWindow);

    if (!reduceMotion) {
      const animateRing = () => {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
        rafId = requestAnimationFrame(animateRing);
      };
      rafId = requestAnimationFrame(animateRing);
    }

    document.body.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);
      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}

function App() {
  const [language, setLanguage] = useState("tr");
  const [celebrate, setCelebrate] = useState(false);
  const strings = language === "tr" ? tr : en;

  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    if (tips && tips["tr"]) {
      const randomIndex = Math.floor(Math.random() * tips["tr"].length);
      setActiveTipIndex(randomIndex);
    }
  }, []);

  // Header, scroll edildiğinde arka planına blur/gölge kazanır
  const [headerScrolled, setHeaderScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Proje kartları ekrana girince sırayla (stagger) beliriyor
  const projectListRef = useRef(null);
  const [projectsVisible, setProjectsVisible] = useState(false);
  useEffect(() => {
    const el = projectListRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProjectsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mobil hamburger menü
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleUnlock = useCallback(() => {
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 3600);
  }, []);

  useKonamiCode(handleUnlock);

  const projectList = [  
    {
      name: "Legend of Rey", 
      description: strings.projects.legendOfReyDescription,
      link: "https://github.com/Ardeko/legend-of-rey", 
      emoji: "⚔️", 
    },
    {
     name: strings.projects.revoApp,
    description: strings.projects.revoDescription,
    link: "https://github.com/Ardeko/Revo",
    emoji: "💬"
    },
    {
      name: strings.projects.underwaterDrone,
      description: strings.projects.underwaterDescription,
      link: "https://github.com/EVA-Submarine-Team",
      emoji: "🌊",
    },
    {
      name: "Ardobot - Discord Bot",
      description: strings.projects.ardobotDescription,
      link: "https://github.com/Ardeko/ardobot",
      emoji: "🤖",
    },
    
    {
      name: strings.projects.renaultApp,
      description: strings.projects.renaultDescription,
      isRestricted: true,
      emoji: "🚗",
    },

    {
      name: strings.projects.stokApp,
      description: strings.projects.stokDescription,
      link: "https://github.com/Ardeko/StokEkstresiApp",
      emoji: "📦"
    },
    
    {
      name: strings.projects.wordeko,
      description: strings.projects.wordekoDescription,
      link: "https://github.com/Ardeko/wordeko",
      emoji: "📖",
    },
    {
      name: strings.projects.protocolGame,
      description: strings.projects.protocolDescription,
      link: "https://github.com/Ardeko/protocol",
      emoji: "🏎️",
    },
    {
       name: "Nebula - Bubble Shooter",
       description: strings.projects.nebulaDescription,
       link: "https://github.com/Ardeko/Nebula",
       emoji: "🌌",
    },
    {
      name: strings.projects.unichain,
      description: strings.projects.unichainDescription,
      link: "https://github.com/Ardeko/unichain",
      emoji: "🔗",
    },
];

  return (
    <Router>
      <CustomCursor />
      <ScrollProgress />
      <Particles />
      <ConfettiBurst active={celebrate} language={language} />
      <header className={`header ${headerScrolled ? "header-scrolled" : ""}`}>
        <h1 className="modern-brand-name">
          Arda Güner
        </h1>
        <p>{strings.profession}</p>

        <button
          type="button"
          className={`hamburger ${mobileMenuOpen ? "is-open" : ""}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          aria-label={
            mobileMenuOpen
              ? (language === "tr" ? "Menüyü kapat" : "Close menu")
              : (language === "tr" ? "Menüyü aç" : "Open menu")
          }
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`nav-backdrop ${mobileMenuOpen ? "is-visible" : ""}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <nav id="primary-navigation" className={mobileMenuOpen ? "nav-open" : ""}>
          <div className={`language-switcher-v2 lang-${language}`}>
            <div className="switch-track">
              <div
                className={`lang-option-v2 turkish ${language === "tr" ? "active" : ""}`}
                onClick={() => setLanguage("tr")}
                role="button"
                tabIndex={0}
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
                aria-pressed={language === "en"}
                aria-label="Switch to English"
              >
                <span className="crystal-flag en-flag" />
                <span className="lang-text">EN</span>
              </div>
            </div>
          </div>
          <ul>
            <li>
              <Link to="/" onClick={closeMobileMenu}>{strings.nav.home}</Link>
            </li>
            <li>
              <a href="#about" onClick={closeMobileMenu}>{strings.nav.about}</a>
            </li>
            <li>
              <a href="#projects" onClick={closeMobileMenu}>{strings.nav.projects}</a>
            </li>
            <li>
              <a href="#studio" onClick={closeMobileMenu}>{language === "tr" ? "Stüdyo" : "Studio"}</a>
            </li>
            <li>
              <a href="#contact" onClick={closeMobileMenu}>{strings.nav.contact}</a>
            </li>
            <li><Link to="/codelab" onClick={closeMobileMenu}>Code Lab</Link></li>
          </ul>
        </nav>
      </header>
      
      <Routes>
        <Route
          path="/"
          element={
            <div className="page-fade" key={language}>
              <section id="hero" className="hero">
                <Reveal as="h1" delay={0}>{strings.hero.title}</Reveal>
                <Reveal as="p" delay={100}>{strings.hero.subtitle}</Reveal>

                <Reveal as="div" delay={200} className="daily-tip-widget">
                  <h3>{strings.hero.tipTitle}</h3>
                  <p>{tips[language]?.[activeTipIndex] || "..."}</p>
                </Reveal>

                <Reveal
                  as="button"
                  delay={300}
                  onClick={() => {
                    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {strings.hero.aboutButton}
                </Reveal>

                <Reveal as="div" delay={400} style={{ marginTop: "20px" }}>
                  <h2 className="cv-title">{strings.cv.title}</h2>
                  <Magnetic
                    as="a"
                    href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
                    className="pdf-button"
                    target="_blank"
                    rel="noopener noreferrer"
                    download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
                    strength={0.25}
                  >
                    <span className="pdf-icon">📄</span>
                    {strings.cv.downloadButton}
                  </Magnetic>
                </Reveal>
              </section>

              <Reveal as="section" id="about" className="about-container">
                <h2 className="about-title">{strings.about.title}</h2>
                <div className="about-content">
                  <img src="/arda.JPG" alt="Arda Güner" className="profile-picture" />
                  <div className="about-text">
                    {strings.about.detailedDescription.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    <h3>{strings.about.workExperience}</h3>
                    <ul>
                      {strings.about.jobs.map((job, index) => (
                        <li key={index}>{job}</li>
                      ))}
                    </ul>
                    <h3>{strings.about.skills}</h3>
                    <ul>
                      <li>{strings.about.languages}</li>
                      <li>{strings.about.webTechnologies}</li>
                      <li>{strings.about.databases}</li>
                      <li>{strings.about.os}</li>
                      {strings.about.additionalSkills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                    <h3>{strings.about.hobbies}</h3>
                    <ul>
                      {strings.about.hobbyList.map((hobby, index) => (
                        <li key={index}>{hobby}</li>
                      ))}
                    </ul>
                    <p>{strings.about.philosophy}</p>
                    <p>
                      {strings.about.githubCTA}{" "}
                      <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
                        {strings.about.githubLink}
                      </a>
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="switch-master-card" strength={5}>
                  <span className="badge">
                    {language === "tr" ? "YAYINDA" : "LIVE"}
                  </span>
                  <h2>🚂 Switch Master</h2>
                  <p>
                    {language === "tr"
                      ? "🚦 Rayları değiştir, treni kurtar! Şimdi mobil mağazalarda ücretsiz."
                      : "🚦 Switch tracks, save the train! Now free on mobile stores."}
                  </p>

                  <div className="store-buttons-container">
                    <a
                      href="https://apps.apple.com/tr/app/switch-master-railway/id6770972534?l=tr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn app-store"
                    >
                      <svg viewBox="0 0 384 512" width="22" height="22" fill="currentColor">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 47.5-24.4 76.5 26.9 2.4 51.2-16 68.3-38.9z"/>
                      </svg>
                      <div className="store-btn-text">
                        <span className="sub-text">Download on the</span>
                        <span className="main-text">App Store</span>
                      </div>
                    </a>

                    <a
                      href="https://play.google.com/store/apps/details?id=com.ardeko.switchmaster&pcampaignid=web_share"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn google-play"
                    >
                      <svg viewBox="0 0 512 512" width="22" height="22" fill="currentColor">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58 33.2-60.1-60.1L439 162c16.5-9.5 26.2-2.3 26.2 11.6v103.7c0 14-9.7 21.1-23 13.9zm-147 62.4l60.1 60.1L104.6 499l220.6-126.6z"/>
                      </svg>
                      <div className="store-btn-text">
                        <span className="sub-text">GET IT ON</span>
                        <span className="main-text">Google Play</span>
                      </div>
                    </a>
                  </div>
                </Tilt>
              </Reveal>
              {/* --- APEX SHIFT KARTI BAŞLANGICI --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    {language === "tr" ? "CANLI · OYNA" : "LIVE · PLAY NOW"}
                  </span>
                  <h2>🏎️ Apex Shift</h2>
                  <p>
                    {language === "tr"
                      ? "Yüksek tempolu tarayıcı içi yarış deneyimi! Klavyenizi hazırlayın, hemen yeni sekmede yarışa katılın."
                      : "High-paced in-browser racing experience! Prepare your keyboard and jump into the race in a new tab."}
                  </p>
                  <a
                    href="/apex-shift.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="revo-button"
                  >
                    <span>🎮</span>
                    {language === "tr" ? "Oyuna Başla" : "Play Game"}
                  </a>
                </Tilt>
              </Reveal>
              {/* --- APEX SHIFT KARTI BİTİŞİ --- */}
              {/* --- FORZA SHIFT KARTI BAŞLANGICI --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    {language === "tr" ? "YENİ · OYNA" : "NEW · PLAY NOW"}
                  </span>
                  <h2>🪐 Forza Orbit</h2>
                  <p>
                    {language === "tr"
                      ? "Reflekslerinizi test eden yörünge tabanlı arcade deneyimi! Mükemmel atışlar yapın, komboları toplayın ve yeni sekmede rekor kırın."
                      : "Orbit-based arcade experience that tests your reflexes! Make perfect shots, build up combos, and set new high scores in a new tab."}
                  </p>
                  <a
                    href="/forza-orbit.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="revo-button"
                  >
                    <span>🎮</span>
                    {language === "tr" ? "Oyuna Başla" : "Play Game"}
                  </a>
                </Tilt>
              </Reveal>
              {/* --- FORZA SHIFT KARTI BİTİŞİ --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    {language === "tr" ? "CANLI · TARAYICIDA ÇALIŞIR" : "LIVE · RUNS IN BROWSER"}
                  </span>
                  <h2>💬 Revo</h2>
                  <p>
                    {language === "tr"
                      ? "SignalR ve WebRTC ile güçlendirilmiş, tarayıcı üzerinden anlık sesli ve yazılı sohbet platformu. Kurulum yok — tek tıkla bir odaya katıl, arkadaşlarınla aynı frekansta buluş."
                      : "A browser-based instant voice & text chat platform powered by SignalR and WebRTC. No install — join a room in one click and connect with friends instantly."}
                  </p>
                  <a
                    href="https://ardekostudios.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="revo-button"
                  >
                    <span>🚀</span>
                    {language === "tr" ? "Sohbete Başla" : "Start Chatting"}
                  </a>
                </Tilt>
              </Reveal>

              <Reveal as="section" id="projects" className="projects-container">
                <h2>{strings.projects.title}</h2>
                <ul ref={projectListRef} className={projectsVisible ? "in-view" : ""}>
                  {projectList.map((project, index) => (
                    <Tilt as="li" key={index} strength={5}>
                      <span className="project-emoji">{project.emoji}</span>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      {project.isRestricted ? (
                        <p>🚫 {strings.projects.restricted}</p>
                      ) : (
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          {strings.projects.more}
                        </a>
                      )}
                    </Tilt>
                  ))}
                </ul>
              </Reveal>

              <StudioSpotlight language={language} />
            </div>
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
      </Routes>

      <Reveal as="footer" id="contact" className="footer">
        <h2>{strings.footer.title}</h2>
        <ul className="contact-list">
          <li>
            <span className="contact-icon" role="img" aria-label="email">📬</span>
            <a href="mailto:ardaguner2000@gmail.com">ardaguner2000@gmail.com</a>
          </li>
          <li>
            <span className="contact-icon" role="img" aria-label="email">📬</span>
            <a href="mailto:ardaguner@hotmail.com">ardaguner@hotmail.com</a>
          </li>
          <li>
            <span className="contact-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn Icon" />
            </span>
            <a href="https://www.linkedin.com/in/arda-g%C3%BCner/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
          <li>
            <span className="contact-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub Icon" />
            </span>
            <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <Link to="/privacy-policy" style={{ textDecoration: "underline" }}>
              {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
            </Link>
          </li>
        </ul>

        <Clock />

        <p style={{ cursor: "pointer" }} onClick={() => alert(strings.footer.thanks)}>
          {strings.footer.copyright}
        </p>
      </Reveal>
    </Router>
  );
}

export default App;
