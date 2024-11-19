import React from "react";
import "./Projects.css";

const Projects = () => {
  const projectList = [
    {
      name: "Teknofest Autonomous Underwater Drone",
      description: "Otonom görüntü işleme teknolojisiyle tasarlandı.",
      link: "https://github.com/SeIectra",
    },
    {
      name: "Renault Randevu Muayene App",
      description: "Araç muayene randevu sistemi.",
      link: "https://github.com/SeIectra",
    },
  ];

  return (
    <div className="projects-container">
      <h2>Projelerim</h2>
      <ul>
        {projectList.map((project, index) => (
          <li key={index}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              Daha Fazla
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
