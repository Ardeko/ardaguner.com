import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  // Projeler listesi
  const projectList = [
    {
      name: "Teknofest Autonomous Underwater Drone",
      description: "Otonom görüntü işleme teknolojisiyle tasarlandı.",
      link: "https://github.com/EVA-Submarine-Team",
      emoji: "🌊", // Su altı temalı emoji
    },
    {
      name: "Renault Randevu Muayene App",
      description: "Renault MAIS Muayene ve Randevu uygulaması",
      isRestricted: true, // Gizli proje işareti
      emoji: "🚗", // Araba temalı emoji
    },
    {
      name: "Wordeko Kelime Oyunu",
      description: "Eğlenceli bir kelime tahmin oyunu.",
      link: "https://github.com/SeIectra/wordeko",
      emoji: "📖", // Kitap/kelime temalı emoji
    },
    {
      name: "Protocol Yarış Oyunu",
      description: "Heyecan dolu bir hız ve strateji yarışı.",
      link: "https://github.com/SeIectra/protocol",
      emoji: "🏎️", // Yarış temalı emoji
    },
    {
      name: "Unichain Blockchain İzleme Zinciri",
      description: "Blockchain işlemlerini takip etmeye yönelik bir sistem.",
      link: "https://github.com/SeIectra/unichain",
      emoji: "🔗", // Zincir/blok temalı emoji
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="header">
        <h1>Arda Güner</h1>
        <p>Software Engineer</p>
        <nav>
          <ul>
            <li>
              <a href="#hero">Anasayfa</a>
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
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <h1>Merhaba, Ben Arda Güner</h1>
        <p>Yazılım mühendisliğine tutkuyla bağlı bir geliştiriciyim.</p>
        <button
          onClick={() => {
            document.getElementById("about").scrollIntoView({ behavior: "smooth" });
          }}
        >
          Hakkımda Daha Fazla
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="about-container">
        <h2>Hakkımda</h2>
        <p>
          Merhaba, ben Arda Güner. 2018-2023 yılları arasında Altınbaş Üniversitesi’nde 
          Yazılım Mühendisliği eğitimi aldım. Üniversite hayatım boyunca ve sonrasında 
          teknolojiye olan tutkum beni farklı projelerde çalışmaya yönlendirdi.
        </p>
        <p>
          Çalışma hayatımda birçok deneyim kazandım:
          <ul>
            <li><b>2019-2021:</b> DNY, Teknik Destek Stajyeri</li>
            <li><b>2023:</b> Fit Bilişim Bilgisayar ve Danışmanlık, Ağ İzleme Stajyeri</li>
            <li><b>2023 - Şu Anda:</b> TAC A.Ş. , Yazılım Geliştirme Uzmanı</li>
          </ul>
        </p>
        <p>
          Yazılım dilleri (C, C++, C#, Python, Solidity, JavaScript) ve veri tabanı 
          yönetimi (MySQL, SQL) konularında bilgi sahibiyim. Ayrıca Linux, MacOS ve 
          Windows işletim sistemlerini etkin bir şekilde kullanabiliyorum.
        </p>
        <p>
          Boş zamanlarımda yaratıcı oyun fikirleri geliştirmekten, bilimkurgu filmleri 
          izlemekten (Lucy, Limitless, Inception gibi) ve yeni teknolojilere yönelik 
          projelerde yer almaktan keyif alıyorum. Hayat felsefem, sürekli öğrenme ve 
          yeniliklere açık olmaktır.
        </p>
        <p>
          Ayrıca GitHub üzerindeki projelerimi inceleyebilirsiniz.
        </p>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-container">
        <h2>Projelerim</h2>
        <ul>
          {projectList.map((project, index) => (
            <li key={index} className={`project-${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
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
  <p>© 2024 Arda Güner. Tüm hakları saklıdır.</p>
</footer>



    </>
  );
}

export default App;
