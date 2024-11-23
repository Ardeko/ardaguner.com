import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import CatMouseGame from "./CatMouseGame";
import RockPaperScissors from "./RockPaperScissors";
import AimTrainer from "./AimTrainer";
import { tips } from "./tips";
function App() {
  const projectList = [
    {
      name: "Teknofest Autonomous Underwater Drone",
      description: "Otonom görüntü işleme teknolojisiyle tasarlandı.",
      link: "https://github.com/EVA-Submarine-Team",
      emoji: "🌊",
    },
    {
      name: "Ardobot - Discord Bot",
      description: "Yapay zeka destekli, özelleştirilebilir bir Discord botu.",
      link: "https://github.com/SeIectra/ardobot", 
      emoji: "🤖", 
    },
    {
      name: "Renault Randevu Muayene App",
      description: "Renault MAIS Muayene ve Randevu uygulaması",
      isRestricted: true,
      emoji: "🚗",
    },
    {
      name: "Wordeko Kelime Oyunu",
      description: "Eğlenceli bir kelime tahmin oyunu.",
      link: "https://github.com/SeIectra/wordeko",
      emoji: "📖",
    },
    {
      name: "Protocol Yarış Oyunu",
      description: "Heyecan dolu bir hız ve strateji yarışı.",
      link: "https://github.com/SeIectra/protocol",
      emoji: "🏎️",
    },
    {
      name: "Unichain Blockchain İzleme Zinciri",
      description: "Blockchain işlemlerini takip etmeye yönelik bir sistem.",
      link: "https://github.com/SeIectra/unichain",
      emoji: "🔗",
    },
  ];

  return (
    <Router>
      <header className="header">
        <h1>Arda Güner</h1>
        <p>Software Engineer</p>
        <nav>
          <ul>
            <li>
              <Link to="/">Anasayfa</Link>
            </li>
            <li>
              <a href="#about">Hakkımda</a>
            </li>
            <li>
              <a href="#projects">Projeler</a>
            </li>
            <li>
              <a href="#contact">İletişim</a>
            </li>
            <li>
              <Link to="/games">Oyunlar</Link>
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
                <h1>Merhaba, Ben Arda!</h1>
                <p>Yazılım mühendisliğine tutkuyla bağlı bir geliştiriciyim.</p>
                <div className="daily-tip-widget">
                  <h3>Yazılım İpucu</h3>
                  <p>{tips[Math.floor(Math.random() * tips.length)]}</p>
                </div>
                <button
                  onClick={() => {
                    document.getElementById("about").scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Hakkımda Daha Fazla
                </button>
              </section>

                  
              <section id="about" className="about-container">
  <h2 className="about-title">Hakkımda</h2>
  <div className="about-content">
    <img src="/arda.JPG" alt="Arda Güner" className="profile-picture" />
    <div className="about-text">
      <p>
        Merhaba, ben <strong>Arda Güner</strong>. Yazılım geliştirme yolculuğumda 
        <strong> JavaScript</strong> ile başladım ve bu alanda kendimi geliştirdim. Modern web teknolojilerini kullanarak 
        yaratıcı ve etkili çözümler üretmekten keyif alıyorum. Özellikle 
        <strong> React</strong> ve <strong>Node.js</strong> gibi JavaScript ekosistemindeki araçlarla projeler geliştirmek benim için hem bir iş hem de bir tutku.
      </p>
      <p>
        <strong>Flutter</strong> ve <strong>Dart</strong> sayesinde mobil uygulama geliştirme alanında da deneyim sahibiyim. 
        Kullanıcı dostu ve performanslı mobil uygulamalar tasarlamak en güçlü yönlerimden biri. 
        Öte yandan, <strong>Kotlin</strong> konusunda hala öğrenme sürecindeyim ve bu alanda eksikliklerimi kapatmak için çaba sarf ediyorum.
      </p>
      <h3>Çalışma Hayatım</h3>
      <ul>
        <li><b>2019-2021:</b> DNY, Teknik Destek Stajyeri</li>
        <li><b>2023:</b> Fit Bilişim Bilgisayar ve Danışmanlık, Ağ İzleme Stajyeri</li>
        <li><b>2023 - Şu Anda:</b> TAC A.Ş., Yazılım Geliştirme Uzmanı</li>
      </ul>
      <h3>Yeteneklerim</h3>
      <p>
        <strong>Yazılım Dilleri:</strong>
        <ul>
          <li><b>JavaScript (React, Node.js):</b> Güçlü</li>
          <li><b>Dart ve Flutter:</b> İleri Düzey</li>
          <li><b>C, C++, C#, Python, Solidity:</b> İyi</li>
          <li><b>Kotlin:</b> Geliştirme Sürecinde</li>
        </ul>
        <strong>Veritabanı Yönetimi:</strong> MySQL, SQL <br />
        <strong>İşletim Sistemleri:</strong> Linux, MacOS, Windows
      </p>
      <p>
        <strong>Ek Yetkinlikler:</strong>
        <ul>
          <li>Git ve GitHub ile versiyon kontrol</li>
          <li>Algoritma tasarımı ve problem çözme</li>
        </ul>
      </p>
      <h3>Hobilerim</h3>
      <p>Boş zamanlarımda:</p>
      <ul>
        <li>Yaratıcı oyun fikirleri geliştirmek,</li>
        <li>Bilimkurgu filmleri izlemek (<i>Lucy, Limitless, Inception</i> gibi),</li>
        <li>Buz pateni yaparak hem zihin hem de bedenimi dinlendirmek,</li>
        <li>Scuba Diving ve su altı keşifleriyle doğanın derinliklerini deneyimlemek,</li>
        <li>Drone pilotluğu ile modern teknolojiyi hobiyle birleştirmek.</li>
      </ul>
      <p>
        Hayat felsefem, sürekli öğrenme, keşfetme ve yeniliklere açık olmaktır.
      </p>
      <p>
        Ayrıca, projelerimi GitHub hesabımda paylaşıyorum. Daha fazlası için:
        <a href="https://github.com/SeIectra" target="_blank" rel="noopener noreferrer"> GitHub Profilim</a>
      </p>
    </div>
  </div>
</section>



              {/* Projects Section */}
              <section id="projects" className="projects-container">
                <h2>Projelerim</h2>
                <ul>
                  {projectList.map((project, index) => (
                    <li
                      key={index}
                      className={`project-${project.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="project-emoji" role="img" aria-label="emoji">
                        {project.emoji}
                      </span>
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
            </>
          }
        />

        {/* Oyunlar */}
        <Route
          path="/games"
          element={
            <div className="games-container">
  <h2>Oyunlar (Beta) </h2>
  <ul>
    <li>
      <Link to="/game">Kedi-Fare Yakalama Oyunu</Link>
    </li>
    <li>
      <Link to="/games/rock-paper-scissors">Taş-Kağıt-Makas</Link>
    </li>
    <li>
      <Link to="/games/aim-trainer">Hedef Vurma</Link>
    </li>
  </ul>
</div>
          }
        />
        <Route path="/game" element={<CatMouseGame />} />
        <Route path="/games/rock-paper-scissors" element={<RockPaperScissors />} />
        <Route path="/games/aim-trainer" element={<AimTrainer />} />
      </Routes>

      {/* Footer */}
      {/* Footer */}
<footer id="contact" className="footer">
  <h2>İletişim</h2>
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
  </ul>
  <p 
    style={{ cursor: "pointer", color: "#64b5f6" }} 
    onClick={() => alert("Special Thanks to Soner and Çiğdem Güner!")}
  >
    © 2024 Arda Güner. Tüm hakları saklıdır.
  </p>
</footer>

    </Router>
  );

  
}


export default App;