import { useEffect, useMemo } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useKonamiCode(onUnlock) {
  useEffect(() => {
    let position = 0;

    const handleKeyDown = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = KONAMI_SEQUENCE[position];

      if (key === expected) {
        position += 1;
        if (position === KONAMI_SEQUENCE.length) {
          position = 0;
          onUnlock();
        }
      } else {
        position = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUnlock]);
}

const CONFETTI_EMOJI = ["⚽", "🚂", "🎮", "✨", "🏆"];

export function ConfettiBurst({ active, language }) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 26 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      duration: 2.4 + Math.random() * 1.6,
      delay: Math.random() * 0.5,
      emoji: CONFETTI_EMOJI[index % CONFETTI_EMOJI.length],
      rotate: Math.random() * 360,
    }));
  }, [active]);

  if (!active) return null;

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        >
          {piece.emoji}
        </span>
      ))}
      <div className="confetti-message">
        {language === "tr" ? "🎮 Gizli kod bulundu!" : "🎮 Secret code unlocked!"}
      </div>
    </div>
  );
}
