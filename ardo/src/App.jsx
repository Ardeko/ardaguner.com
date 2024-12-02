import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import CatMouseGame from "./CatMouseGame";
import RockPaperScissors from "./RockPaperScissors";
import AimTrainer from "./AimTrainer";
import { tips } from "./tips";
import tr from "/locales/tr.json";
import en from "/locales/en.json";

function App() {
  const [language, setLanguage] = useState("tr");
  const strings = language === "tr" ? tr : en;

  const projectList = [
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
    {
      name: strings.projects.renaultApp,
      description: strings.projects.renaultDescription,
      isRestricted: true,
      emoji: "🚗",
    },
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
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <button onClick={() => setLanguage("tr")}>🇹🇷 Türkçe</button>
          <button onClick={() => setLanguage("en")}>en English</button>
        </div>
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
            <li>
              <Link to="/games">{strings.nav.games}</Link>
            </li>
          </ul>
        </nav>
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
                <div className="daily-tip-widget">
                  <h3>{strings.hero.tipTitle}</h3>
                  <p>{tips[Math.floor(Math.random() * tips.length)]}</p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {strings.hero.aboutButton}
                </button>
              </section>

              {/* About Section */}
              <section id="about" className="about-container">
                <h2 className="about-title">{strings.about.title}</h2>
                <div className="about-content">
                  <img src="/arda.JPG" alt="Arda Güner" className="profile-picture" />
                  <div className="about-text">
                    <p>{strings.about.description}</p>
                    <h3>{strings.about.workExperience}</h3>
                    <ul>
                      <li>{strings.about.job1}</li>
                      <li>{strings.about.job2}</li>
                      <li>{strings.about.job3}</li>
                    </ul>
                    <h3>{strings.about.skills}</h3>
                    <ul>
                      <li>{strings.about.languages}</li>
                      <li>{strings.about.databases}</li>
                      <li>{strings.about.os}</li>
                    </ul>
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

        {/* Games */}
        {/* <Route
          path="/games"
          element={
            <div className="games-container">
              <h2>{strings.games.title}</h2>
              <ul>
                <li>
                  <Link to="/game">{strings.games.catMouse}</Link>
                </li>
                <li>
                  <Link to="/games/rock-paper-scissors">{strings.games.rps}</Link>
                </li>
                <li>
                  <Link to="/games/aim-trainer">{strings.games.aimTrainer}</Link>
                </li>
              </ul>
            </div>
          }
        />
        <Route path="/game" element={<CatMouseGame />} />
        <Route path="/games/rock-paper-scissors" element={<RockPaperScissors />} />
        <Route path="/games/aim-trainer" element={<AimTrainer />} /> */}
      </Routes>

      {/* Footer */}
      <footer id="contact" className="footer">
  <h2>{strings.footer.title}</h2>
  <ul className="contact-list">
    <li>
      <span className="contact-icon" role="img" aria-label="email">
        📧
      </span>
      <a href="mailto:ardaguner2000@gmail.com">ardaguner2000@gmail.com</a>
    </li>
    <li>
      <span className="contact-icon" role="img" aria-label="email">
        📧
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
