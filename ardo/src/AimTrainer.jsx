import React, { useState, useEffect } from "react";
import "./AimTrainer.css";

const AimTrainer = () => {
  const [score, setScore] = useState(0);
  const [targetPosition, setTargetPosition] = useState({
    x: Math.random() * 90 + "%",
    y: Math.random() * 90 + "%",
  });

  const moveTarget = () => {
    setTargetPosition({
      x: Math.random() * 90 + "%",
      y: Math.random() * 90 + "%",
    });
  };

  const handleClick = () => {
    setScore(score + 1);
    moveTarget();
  };

  useEffect(() => {
    const timer = setInterval(moveTarget, 2000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="aim-trainer">
      <h1>Hedef Vurma Oyunu</h1>
      <p>Puan: {score}</p>
      <div
        className="target"
        style={{ left: targetPosition.x, top: targetPosition.y }}
        onClick={handleClick}
      ></div>
    </div>
  );
};

export default AimTrainer;
