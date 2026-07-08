const PARTICLES = [
  { left: "6%", size: 3, duration: 18, delay: 0 },
  { left: "14%", size: 2, duration: 22, delay: 3 },
  { left: "22%", size: 4, duration: 16, delay: 6 },
  { left: "30%", size: 2, duration: 24, delay: 1 },
  { left: "38%", size: 3, duration: 19, delay: 8 },
  { left: "46%", size: 2, duration: 21, delay: 4 },
  { left: "54%", size: 4, duration: 17, delay: 10 },
  { left: "62%", size: 2, duration: 23, delay: 2 },
  { left: "70%", size: 3, duration: 20, delay: 7 },
  { left: "78%", size: 2, duration: 18, delay: 5 },
  { left: "86%", size: 4, duration: 25, delay: 9 },
  { left: "92%", size: 2, duration: 19, delay: 11 },
];

function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Particles;
