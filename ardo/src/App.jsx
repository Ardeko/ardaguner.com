import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { tips } from "./tips";
import tr from "/locales/tr.json";
import en from "/locales/en.json";
import PrivacyPolicy from './PrivacyPolicy';
import StudioSpotlight from "./StudioSpotlight";
import Reveal from "./Reveal";
import Particles from "./Particles";

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

function App() {
  const [language, setLanguage] = useState("tr");
  const strings = language === "tr" ? tr : en;

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
      <ScrollProgress />
      <Particles />
      <header className="header">
        <h1 className="modern-brand-name">
          Arda Güner<span className="pulse-dot"></span>
        </h1>
        <p>{strings.profession}</p>
        <nav>
          <ul>
            <li>
              <Link to="/">{strings.nav.home}</Link>
            </li>
            <li>
              <a href="#about">{strings.nav.about}</a>
            </li>
            <li>
              <a href="#projects">{strings.nav.projects}</a>
            </li>
            <li>
              <a href="#studio">{language === "tr" ? "Stüdyo" : "Studio"}</a>
            </li>
            <li>
              <a href="#contact">{strings.nav.contact}</a>
            </li>
            <li><Link to="/codelab">Code Lab</Link></li>
          </ul>
        </nav>
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
      </header>
      
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* HERO SECTION */}
              <section id="hero" className="hero">
                <Reveal as="h1" delay={0}>{strings.hero.title}</Reveal>
                <Reveal as="p" delay={100}>{strings.hero.subtitle}</Reveal>

                <Reveal as="div" delay={200} className="daily-tip-widget">
                  <h3>{strings.hero.tipTitle}</h3>
                  <p>{tips[language][Math.floor(Math.random() * tips[language].length)]}</p>
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
                  <a
                    href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
                    className="pdf-button"
                    target="_blank"
                    rel="noopener noreferrer"
                    download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
                  >
                    <span className="pdf-icon">📄</span>
                    {strings.cv.downloadButton}
                  </a>
                </Reveal>
              </section>

              {/* ABOUT SECTION */}
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

              {/* SWITCH MASTER - FEATURED APP CARD (YENİ PRO UX YERİ) */}
              <Reveal as="section" className="switch-master-wrapper">
                <div className="switch-master-card">
                  <span className="badge">
                    {language === "tr" ? "YAYINDA" : "LIVE"}
                  </span>
                  <h2>🚂 Switch Master</h2>
                  <p>
                    {language === "tr"
                      ? "🚦 Rayları değiştir, treni kurtar! Şimdi mobil mağazalarda ücretsiz."
                      : "🚦 Switch tracks, save the train! Now free on mobile stores."}
                  </p>
                  
                  {/* Mağaza Butonları */}
                  <div className="store-buttons-container">
                    {/* App Store */}
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

                    {/* Google Play */}
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
                </div>
              </Reveal>

              {/* PROJECTS SECTION */}
              <Reveal as="section" id="projects" className="projects-container">
                <h2>{strings.projects.title}</h2>
                <ul>
                  {projectList.map((project, index) => (
                    <li key={index}>
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
                    </li>
                  ))}
                </ul>
              </Reveal>

              <StudioSpotlight language={language} />
            </>
          }
        />
        <Route
          path="/codelab"
          element={
            <Suspense fallback={<div style={{color:"#fff", padding:"2rem"}}>Loading Code Lab…</div>}>
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