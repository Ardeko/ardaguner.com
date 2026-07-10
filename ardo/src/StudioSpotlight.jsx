import Reveal from "./Reveal";
import "./StudioSpotlight.css";

const STUDIO_URL = "https://ardekostudios.com";

function StudioSpotlight({ language }) {
  return (
    <Reveal as="section" id="studio" className="studio-section">
      <div className="studio-inner">
        <span className="studio-eyebrow">
          {language === "tr" ? "İndie Oyun Stüdyosu" : "Indie Game Studio"}
        </span>

        <div className="studio-kickoff" aria-hidden="true">
          <span className="studio-pitch-line" />
          <span className="studio-shadow" />
          <span className="studio-ball">
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#f2f0e6" stroke="#1b1e2b" strokeWidth="1.5" />
              <polygon points="20,11 27,16.5 24.5,24.5 15.5,24.5 13,16.5" fill="#1b1e2b" />
              <path
                d="M20 11 L20 4 M27 16.5 L34 12.5 M24.5 24.5 L28 32 M15.5 24.5 L12 32 M13 16.5 L6 12.5"
                stroke="#1b1e2b"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </div>

        <div className="studio-logo-wrap">
          <img
            src="/ardeko.png"
            alt={language === "tr" ? "Ardeko Studios logosu" : "Ardeko Studios logo"}
            className="studio-logo"
            loading="lazy"
            decoding="async"
          />
        </div>

        <h2 className="studio-heading">Ardeko Studios</h2>

        <p className="studio-tagline">
          {language === "tr"
            ? "Switch Master: Railway, Kafa Kafaya, Rushville ve Skyline Swinger'ın arkasındaki oyun stüdyosu."
            : "The studio behind Switch Master: Railway, Kafa Kafaya, Rushville, and Skyline Swinger."}
        </p>

        <a
          href={STUDIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="studio-cta"
        >
          <span>{language === "tr" ? "Stüdyoyu Ziyaret Et" : "Visit the Studio"}</span>
          <span className="studio-cta-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </Reveal>
  );
}

export default StudioSpotlight;
