import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  // Projeler listesi
  const projectList = [
    {
      name: "Teknofest Autonomous Underwater Drone",
      description: "Otonom görüntü işleme teknolojisiyle tasarlandı.",
      link: "https://github.com/SeIectra",
    },
    {
      name: "Renault Randevu Muayene App",
      description: "Bu proje telif hakları nedeniyle gizlidir.",
      isRestricted: true, // Gizli proje işareti
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="header">
        <h1>Arda Güner</h1>
        <p>Yazılım Mühendisi</p>
        <nav>
          <ul>
            <li>
              <a href="#hero">Anasayfa</a>
            </li>
            <li>
              <a href="#projects">Projeler</a>
            </li>
            <li>
              <a href="#contact">İletişim</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <h1>Merhaba, Ben Arda Güner</h1>
        <p>Yazılım mühendisliğine tutkuyla bağlı bir geliştiriciyim.</p>
        <button
          onClick={() => {
            document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
          }}
        >
          Projelerimi Gör
        </button>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-container">
        <h2>Projelerim</h2>
        <ul>
          {projectList.map((project, index) => (
            <li key={index}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              {project.isRestricted ? (
                <p className="restricted">
                  🚫 Bu proje telif hakları nedeniyle paylaşılmamaktadır.
                </p>
              ) : (
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  Daha Fazla
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <p>© 2024 Arda Güner. Tüm hakları saklıdır.</p>
        <div className="social-links">
          <a href="https://github.com/SeIectra" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/arda-g%C3%BCner/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
