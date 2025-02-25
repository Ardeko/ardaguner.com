import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { tips } from "./tips";
import tr from "/locales/tr.json";
import en from "/locales/en.json";

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

function App() {
  const [language, setLanguage] = useState("en");
  const strings = language === "tr" ? tr : en;

  const toggleLanguage = () => {
    setLanguage((prevLanguage) => (prevLanguage === "tr" ? "en" : "tr"));
  };

  const projectList = [  
    {
      name: "Legend of Rey", 
      description: strings.projects.legendOfReyDescription,
      link: "https://github.com/SeIectra/legend-of-rey", 
      emoji: "⚔️", 
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
      link: "https://github.com/SeIectra/ardobot",
      emoji: "🤖",
    },
    /*
    {
      name: strings.projects.renaultApp,
      description: strings.projects.renaultDescription,
      isRestricted: true,
      emoji: "🚗",
    },
    */
    {
      name: strings.projects.wordeko,
      description: strings.projects.wordekoDescription,
      link: "https://github.com/SeIectra/wordeko",
      emoji: "📖",
    },
    {
      name: strings.projects.protocolGame,
      description: strings.projects.protocolDescription,
      link: "https://github.com/SeIectra/protocol",
      emoji: "🏎️",
    },
    {
      name: strings.projects.unichain,
      description: strings.projects.unichainDescription,
      link: "https://github.com/SeIectra/unichain",
      emoji: "🔗",
    },
];


  return (
    <Router>
      <header className="header">
        <h1>Arda Güner</h1>
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
              <a href="#contact">{strings.nav.contact}</a>
            </li>
          </ul>
        </nav>
        <div className="language-switcher">
          <label className="switch">
            <input
              type="checkbox"
              id="language-toggle"
              onChange={toggleLanguage}
              checked={language === "en"}
            />
            <span className="slider">
              <span className="language-labels">
                <span style={{ marginLeft: "10px" }}>EN</span>
                <span style={{ marginRight: "10px" }}>TR</span>
              </span>
            </span>
          </label>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        {/* Anasayfa */}
        <Route
          path="/"
          element={
            <>
              {/* Hero Section */}
              <section id="hero" className="hero">
  <h1>{strings.hero.title}</h1>
  <p>{strings.hero.subtitle}</p>

  {/* Daily Software Tip */}
  <div className="daily-tip-widget">
    <h3>{strings.hero.tipTitle}</h3>
    <p>{tips[language][Math.floor(Math.random() * tips[language].length)]}</p>
  </div>

  {/* About Button */}
  <button
    onClick={() => {
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    }}
  >
    {strings.hero.aboutButton}
  </button>

{/* CV Download */}
<div style={{ marginTop: "20px" }}>
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
</div>

</section>

              {/* About Section */}
              <section id="about" className="about-container">
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
          href="https://github.com/SeIectra"
          target="_blank"
          rel="noopener noreferrer"
        >
          {strings.about.githubLink}
        </a>
      </p>
    </div>
  </div>
</section>

              {/* Projects Section */}
              <section id="projects" className="projects-container">
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
              </section>
            </>
          }
        />
      </Routes>

       {/* Footer */}
       <footer id="contact" className="footer">
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
              href="https://github.com/SeIectra"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </li>
          <li style={{ marginBottom: "1rem" }}></li> {/* Boşluk için */}
        </ul>

        {/* Saat ve Tarih */}
        <Clock />

        <p 
          style={{ cursor: "pointer", color: "#64b5f6" }} 
          onClick={() => alert(strings.footer.thanks)}
        >
          {strings.footer.copyright}
        </p>
      </footer>
    </Router>
  );
}

export default App;
