import React from "react";
import "./Projects.css";
import { projectList } from "./App"; 

const Projects = () => {
  return (
    <div className="projects-container">
      <h2>Projelerim</h2>
      <ul>
        {projectList.map((project, index) => (
          <li key={index}>
            <span className="project-emoji">{project.emoji}</span>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            {project.isRestricted ? (
              <p>🚫 Telif nedeniyle gizli</p>
            ) : (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                Daha Fazla
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
