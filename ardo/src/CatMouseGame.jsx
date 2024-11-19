import React, { useState, useEffect } from "react";
import "./CatMouseGame.css";

const CatMouseGame = () => {
  const [catPosition, setCatPosition] = useState({ x: 50, y: 50 });
  const [mousePosition, setMousePosition] = useState({
    x: Math.random() * 500,
    y: Math.random() * 500,
  });
  const [isCaught, setIsCaught] = useState(false);

  const moveCat = (e) => {
    setCatPosition((prev) => {
      let newX = prev.x;
      let newY = prev.y;
      if (e.key === "ArrowUp") newY = Math.max(0, prev.y - 10);
      if (e.key === "ArrowDown") newY = Math.min(490, prev.y + 10);
      if (e.key === "ArrowLeft") newX = Math.max(0, prev.x - 10);
      if (e.key === "ArrowRight") newX = Math.min(490, prev.x + 10);
      return { x: newX, y: newY };
    });
  };

  const moveMouse = () => {
    setMousePosition({
      x: Math.random() * 500,
      y: Math.random() * 500,
    });
  };

  useEffect(() => {
    const interval = setInterval(moveMouse, 2000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", moveCat);
    return () => document.removeEventListener("keydown", moveCat);
  }, []);

  useEffect(() => {
    const distance = Math.sqrt(
      Math.pow(catPosition.x - mousePosition.x, 2) +
        Math.pow(catPosition.y - mousePosition.y, 2)
    );
    if (distance < 30) {
      setIsCaught(true);
    }
  }, [catPosition, mousePosition]);

  const resetGame = () => {
    setCatPosition({ x: 50, y: 50 });
    setMousePosition({ x: Math.random() * 500, y: Math.random() * 500 });
    setIsCaught(false);
  };

  return (
    <div className="game-container">
      {isCaught ? (
        <div className="game-over">
          <h2>Fare Yakalandı! 🎉</h2>
          <button onClick={resetGame}>Tekrar Oyna</button>
        </div>
      ) : (
        <div className="game-area">
          <div
            className="cat"
            style={{
              left: `${catPosition.x}px`,
              top: `${catPosition.y}px`,
            }}
          ></div>
          <div
            className="mouse"
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CatMouseGame;
