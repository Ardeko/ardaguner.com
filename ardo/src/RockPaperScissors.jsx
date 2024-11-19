import React, { useState } from "react";
import "./RockPaperScissors.css";

const RockPaperScissors = () => {
  const choices = ["Taş", "Kağıt", "Makas"];
  const [userChoice, setUserChoice] = useState("");
  const [computerChoice, setComputerChoice] = useState("");
  const [result, setResult] = useState("");

  const playGame = (choice) => {
    setUserChoice(choice);
    const computerRandomChoice = choices[Math.floor(Math.random() * 3)];
    setComputerChoice(computerRandomChoice);
    determineWinner(choice, computerRandomChoice);
  };

  const determineWinner = (user, computer) => {
    if (user === computer) {
      setResult("Berabere!");
    } else if (
      (user === "Taş" && computer === "Makas") ||
      (user === "Kağıt" && computer === "Taş") ||
      (user === "Makas" && computer === "Kağıt")
    ) {
      setResult("Kazandınız! 🎉");
    } else {
      setResult("Kaybettiniz! 😢");
    }
  };

  return (
    <div className="rps-container">
      <h1>Taş-Kağıt-Makas Oyunu</h1>
      <div className="choices">
        {choices.map((choice) => (
          <button key={choice} onClick={() => playGame(choice)}>
            {choice}
          </button>
        ))}
      </div>
      <div className="results">
        <p>Sizin Seçiminiz: {userChoice}</p>
        <p>Bilgisayarın Seçimi: {computerChoice}</p>
        <h2>{result}</h2>
      </div>
    </div>
  );
};

export default RockPaperScissors;
