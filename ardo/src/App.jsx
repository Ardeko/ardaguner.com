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
        <h1 className="shimmer-text">Arda Güner</h1>
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
            
            {/* Türkçe Seçeneği (Sol) */}
            <div
              className={`lang-option-v2 turkish ${language === "tr" ? "active" : ""}`}
              onClick={() => setLanguage("tr")}
              role="button"
              tabIndex={0}
              aria-pressed={language === "tr"}
              aria-label="Türkçe'ye geç"
            >
              {/* Buraya internetten bulduğun kristal veya normal TR bayrak resmini/SVG'sini ekle */}
              <span className="crystal-flag tr-flag" /> 
              <span className="lang-text">TR</span>
            </div>

            {/* Kayan Panel (Handle) */}
            <div className="switch-handle" />

            {/* İngilizce Seçeneği (Sağ) */}
            <div
              className={`lang-option-v2 english ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
              role="button"
              tabIndex={0}
              aria-pressed={language === "en"}
              aria-label="Switch to English"
            >
              {/* Buraya internetten bulduğun kristal veya normal EN bayrak resmini/SVG'sini ekle */}
              <span className="crystal-flag en-flag" />
              <span className="lang-text">EN</span>
            </div>
            
          </div>
        </div>
        {/* ------------------------------------------ */}
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="hero" className="hero">
                <Reveal as="h1" delay={0}>{strings.hero.title}</Reveal>
                <Reveal as="p" delay={100}>{strings.hero.subtitle}</Reveal>

                <Reveal as="div" delay={200} className="switch-master-wrapper">
                  <div className="switch-master-card">
                    <span className="badge">
                      {language === "tr" ? "YENİ" : "NEW"}
                    </span>

                    <h2>🚂 Switch Master</h2>

                    <p>
                      {language === "tr"
                        ? "🚦 Rayları değiştir, treni kurtar! Reflekslerini test et."
                        : "🚦 Switch tracks, save the train! Test your reflexes."}
                    </p>

                    <button
                      className="play-button"
                      onClick={() =>
                        window.open("/switch-master/index.html", "_blank")
                      }
                    >
                      {language === "tr" ? "OYNA 🔥" : "PLAY 🔥"}
                    </button>
                  </div>
                </Reveal>

                <Reveal as="div" delay={300} className="daily-tip-widget">
                  <h3>{strings.hero.tipTitle}</h3>
                  <p>{tips[language][Math.floor(Math.random() * tips[language].length)]}</p>
                </Reveal>

                <Reveal
                  as="button"
                  delay={400}
                  onClick={() => {
                    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {strings.hero.aboutButton}
                </Reveal>

                <Reveal as="div" delay={500} style={{ marginTop: "20px" }}>
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
                      <a
                        href="https://github.com/Ardeko"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {strings.about.githubLink}
                      </a>
                    </p>
                  </div>
                </div>
              </Reveal>

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
            <span className="contact-icon" role="img" aria-label="email">
              📬
            </span>
            <a href="mailto:ardaguner2000@gmail.com">ardaguner2000@gmail.com</a>
          </li>
          <li>
            <span className="contact-icon" role="img" aria-label="email">
              📬
            </span>
            <a href="mailto:ardaguner@hotmail.com">ardaguner@hotmail.com</a>
          </li>
          <li>
            <span className="contact-icon">
              <img
                src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                alt="LinkedIn Icon"
              />
            </span>
            <a
              href="https://www.linkedin.com/in/arda-g%C3%BCner/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <span className="contact-icon">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733553.png"
                alt="GitHub Icon"
              />
            </span>
            <a
              href="https://github.com/Ardeko"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
          <li style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <Link to="/privacy-policy" style={{ textDecoration: "underline" }}>
              {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
            </Link>
          </li>
        </ul>

        <Clock />

        <p
          style={{ cursor: "pointer" }}
          onClick={() => alert(strings.footer.thanks)}
        >
          {strings.footer.copyright}
        </p>
      </Reveal>
    </Router>
  );
}

export default App;
