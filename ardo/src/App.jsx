import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import "./App.enhancements.css";
import { tips } from "./tips";
import tr from "/locales/tr.json";
import en from "/locales/en.json";
import PrivacyPolicy from './PrivacyPolicy';
import StudioSpotlight from "./StudioSpotlight";
import Reveal from "./Reveal";
import Particles from "./Particles";
import Tilt from "./Tilt";
import Magnetic from "./Magnetic";
import { useKonamiCode, ConfettiBurst } from "./KonamiConfetti";

const CodeLab = lazy(() => import("./CodeLab"));

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock">
      <Icon name="clock" size={16} /> {time.toLocaleTimeString()} - <Icon name="calendar" size={16} /> {time.toLocaleDateString()}
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  // Sadece gerçek fare + hover destekleyen cihazlarda aktif (mobil/dokunmatik hariç)
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncEnabled = () => setEnabled(query.matches);
    syncEnabled();
    query.addEventListener("change", syncEnabled);
    return () => query.removeEventListener("change", syncEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interactiveSelector = "a, button, [role='button'], input, textarea, select, .tilt, .magnetic";

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (reduceMotion && ringRef.current) {
        ringRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e) => {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.add("cursor-ring-hover");
      }
    };
    const onMouseOut = (e) => {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        ringRef.current?.classList.remove("cursor-ring-hover");
      }
    };
    const onMouseDown = () => ringRef.current?.classList.add("cursor-ring-active");
    const onMouseUp = () => ringRef.current?.classList.remove("cursor-ring-active");
    const onMouseLeaveWindow = () => {
      dotRef.current?.style.setProperty("opacity", "0");
      ringRef.current?.style.setProperty("opacity", "0");
    };
    const onMouseEnterWindow = () => {
      dotRef.current?.style.setProperty("opacity", "1");
      ringRef.current?.style.setProperty("opacity", "1");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    document.addEventListener("mouseenter", onMouseEnterWindow);

    if (!reduceMotion) {
      const animateRing = () => {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
        rafId = requestAnimationFrame(animateRing);
      };
      rafId = requestAnimationFrame(animateRing);
    }

    document.body.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);
      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}

// Tek tip, çizgi tabanlı ikon seti — emoji ve dış CDN görsellerinin
// yerini alıyor. currentColor kullanıyor, böylece nereye konursa
// konsun etraftaki metin rengini miras alıyor ve mevcut paletle
// çakışmıyor.
function Icon({ name, size = 20, className = "" }) {
  const filled = name === "github" || name === "linkedin";
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: `icon icon-${name}${className ? ` ${className}` : ""}`,
    "aria-hidden": "true",
    focusable: "false",
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: filled ? 0 : 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "github":
      return (
        <svg {...props}>
          <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 007.86 10.94c.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .31.21.66.8.55A11.5 11.5 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...props}>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 7l8.5 6 8.5-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 9.5h16M8 3v4M16 3v4" />
        </svg>
      );
    case "racing":
      return (
        <svg {...props}>
          <path d="M4 16l1.5-5a2 2 0 011.9-1.4h9.2A2 2 0 0118.5 11L20 16" />
          <path d="M2.5 16h19" />
          <circle cx="7" cy="17.6" r="1.6" />
          <circle cx="17" cy="17.6" r="1.6" />
          <path d="M6.2 11l1.4-3h8.8l1.4 3" />
        </svg>
      );
    case "orbit":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-20 12 12)" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "message":
      return (
        <svg {...props}>
          <path d="M4 5h16v11H8l-4 4V5z" />
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="9" rx="4" />
          <path d="M8 11v3M6.5 12.5h3" />
          <circle cx="16" cy="11.5" r="1" fill="currentColor" />
          <circle cx="18.3" cy="13.6" r="1" fill="currentColor" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...props}>
          <path d="M12 2.5c2.6 2 4.2 5.1 4.2 8.6 0 1.9-.5 3.5-1.1 4.7l-3.1 3.3-3.1-3.3c-.6-1.2-1.1-2.8-1.1-4.7 0-3.5 1.6-6.6 4.2-8.6z" />
          <circle cx="12" cy="10.5" r="1.5" />
          <path d="M8.7 15.8L6.3 18.3M15.3 15.8l2.4 2.5" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M12 3v12M7.5 11l4.5 4.5L16.5 11" />
          <path d="M4.5 20h15" />
        </svg>
      );
    case "file":
      return (
        <svg {...props}>
          <path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
          <path d="M14 3.5V8h4.5" />
        </svg>
      );
    case "sword":
      return (
        <svg {...props}>
          <path d="M5 19l8.5-8.5M15 3.5l5.5 5.5-2 2-5.5-5.5 2-2z" />
          <path d="M4 20l1.6-1.6" />
        </svg>
      );
    case "waves":
      return (
        <svg {...props}>
          <path d="M3 10c1.8-1.8 3.6-1.8 5.4 0s3.6 1.8 5.4 0 3.6-1.8 5.4 0" />
          <path d="M3 15.5c1.8-1.8 3.6-1.8 5.4 0s3.6 1.8 5.4 0 3.6-1.8 5.4 0" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...props}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <rect x="10" y="10" width="4" height="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "car":
      return (
        <svg {...props}>
          <path d="M5 16v-3.8a2 2 0 011-1.7l1.4-3A2 2 0 019.3 6.4h5.4a2 2 0 011.9 1.1l1.4 3a2 2 0 011 1.7V16" />
          <path d="M3 16h18" />
          <circle cx="7.5" cy="17.6" r="1.5" />
          <circle cx="16.5" cy="17.6" r="1.5" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M3 8l9-5 9 5-9 5-9-5z" />
          <path d="M3 8v9l9 5 9-5V8" />
          <path d="M12 13v9" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M4 5.8A2.3 2.3 0 016.3 3.5H12V20H6.3A2.3 2.3 0 004 17.7V5.8z" />
          <path d="M20 5.8a2.3 2.3 0 00-2.3-2.3H12V20h5.7A2.3 2.3 0 0020 17.7V5.8z" />
        </svg>
      );
    case "train":
      return (
        <svg {...props}>
          <rect x="5.5" y="4" width="13" height="12" rx="3" />
          <path d="M5.5 10h13" />
          <circle cx="9" cy="19" r="1.4" />
          <circle cx="15" cy="19" r="1.4" />
          <path d="M8 16l-2 3M16 16l2 3" />
        </svg>
      );
    case "galaxy":
      return (
        <svg {...props}>
          <path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3z" />
          <circle cx="18" cy="17" r="1.2" fill="currentColor" />
          <circle cx="6" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case "link":
      return (
        <svg {...props}>
          <path d="M9.5 14.5l5-5" />
          <path d="M8 11.5l-1.8 1.8a3 3 0 004.2 4.2l1.8-1.8" />
          <path d="M16 12.5l1.8-1.8a3 3 0 00-4.2-4.2L12 8.3" />
        </svg>
      );
    case "ban":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M6.5 6.5l11 11" />
        </svg>
      );
    case "code":
      return (
        <svg {...props}>
          <path d="M8.5 8L4.5 12l4 4" />
          <path d="M15.5 8l4 4-4 4" />
          <path d="M13.2 6l-2.4 12" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...props}>
          <rect x="3" y="7.5" width="18" height="12" rx="2" />
          <path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" />
          <path d="M3 12.5h18" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props}>
          <path d="M12 20s-7-4.4-9.5-9A5 5 0 0112 6a5 5 0 019.5 5c-2.5 4.6-9.5 9-9.5 9z" />
        </svg>
      );
    default:
      return null;
  }
}

// Hero'nun arkaplan grafikleri: soyut süsleme değil, iki anlamlı
// diyagram — biri Ardeko çatısı altındaki alanları (Oyunlar / Revo /
// Araçlar), diğeri kullandığım teknoloji setini (React / Node.js /
// JavaScript) gösteriyor. Dönme yok — sadece nabız gibi hafif bir
// parıltı — böylece etiketler her an okunur kalıyor. idPrefix, aynı
// sayfada iki kopya varken gradient id çakışmasını önlüyor.
function OrbitDiagram({ hub, nodeLabels, idPrefix }) {
  const nodes = [
    { x: 200, y: 66, label: nodeLabels[0] },
    { x: 332, y: 258, label: nodeLabels[1] },
    { x: 68, y: 258, label: nodeLabels[2] },
  ];
  const coreId = `${idPrefix}-core-glow`;
  const ringId = `${idPrefix}-ring-grad`;

  return (
    <svg className="hero-orbit" viewBox="0 0 400 320" role="img" aria-hidden="true">
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ardeko-cyan)" stopOpacity="0.8" />
          <stop offset="60%" stopColor="var(--ardeko-violet)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--ardeko-violet)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--ardeko-cyan)" />
          <stop offset="100%" stopColor="var(--ardeko-magenta)" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="175" r="115" fill={`url(#${coreId})`} className="orbit-core" />

      {nodes.map((n, i) => (
        <line
          key={`line-${i}`}
          x1="200"
          y1="175"
          x2={n.x}
          y2={n.y}
          stroke={`url(#${ringId})`}
          strokeWidth="1"
          strokeDasharray="3 6"
          opacity="0.5"
        />
      ))}

      <circle cx="200" cy="175" r="30" fill="#06060f" stroke={`url(#${ringId})`} strokeWidth="1.5" />
      <text x="200" y="180" textAnchor="middle" className="orbit-hub-label">{hub}</text>

      {nodes.map((n, i) => (
        <g key={`node-${i}`} className="orbit-node">
          <circle cx={n.x} cy={n.y} r="19" fill="#06060f" stroke={`url(#${ringId})`} strokeWidth="1.2" />
          <circle
            cx={n.x}
            cy={n.y}
            r="3"
            fill="var(--ardeko-cyan)"
            className="orbit-pulse"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <text x={n.x} y={n.y + 33} textAnchor="middle" className="orbit-label">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

function App() {
  const [language, setLanguage] = useState("tr");
  const [celebrate, setCelebrate] = useState(false);
  const strings = language === "tr" ? tr : en;

  const [activeTipIndex, setActiveTipIndex] = useState(0);

  useEffect(() => {
    if (tips && tips["tr"]) {
      const randomIndex = Math.floor(Math.random() * tips["tr"].length);
      setActiveTipIndex(randomIndex);
    }
  }, []);

  // Header, scroll edildiğinde arka planına blur/gölge kazanır
  const [headerScrolled, setHeaderScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Proje kartları ekrana girince sırayla (stagger) beliriyor
  const projectListRef = useRef(null);
  const [projectsVisible, setProjectsVisible] = useState(false);
  useEffect(() => {
    const el = projectListRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProjectsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mobil hamburger menü
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleUnlock = useCallback(() => {
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 3600);
  }, []);

  useKonamiCode(handleUnlock);

  const projectList = [  
    {
      name: "Legend of Rey", 
      description: strings.projects.legendOfReyDescription,
      link: "https://github.com/Ardeko/legend-of-rey", 
      icon: "sword", 
    },
    {
     name: strings.projects.revoApp,
    description: strings.projects.revoDescription,
    link: "https://github.com/Ardeko/Revo",
    icon: "message"
    },
    {
      name: strings.projects.underwaterDrone,
      description: strings.projects.underwaterDescription,
      link: "https://github.com/EVA-Submarine-Team",
      icon: "waves",
    },
    {
      name: "Ardobot - Discord Bot",
      description: strings.projects.ardobotDescription,
      link: "https://github.com/Ardeko/ardobot",
      icon: "cpu",
    },
    
    {
      name: strings.projects.renaultApp,
      description: strings.projects.renaultDescription,
      isRestricted: true,
      icon: "car",
    },

    {
      name: strings.projects.stokApp,
      description: strings.projects.stokDescription,
      link: "https://github.com/Ardeko/StokEkstresiApp",
      icon: "box"
    },
    
    {
      name: strings.projects.wordeko,
      description: strings.projects.wordekoDescription,
      link: "https://github.com/Ardeko/wordeko",
      icon: "book",
    },
    {
      name: strings.projects.protocolGame,
      description: strings.projects.protocolDescription,
      link: "https://github.com/Ardeko/protocol",
      icon: "racing",
    },
    {
       name: "Nebula - Bubble Shooter",
       description: strings.projects.nebulaDescription,
       link: "https://github.com/Ardeko/Nebula",
       icon: "galaxy",
    },
    {
      name: strings.projects.unichain,
      description: strings.projects.unichainDescription,
      link: "https://github.com/Ardeko/unichain",
      icon: "link",
    },
];

  return (
    <Router>
      <CustomCursor />
      <ScrollProgress />
      <Particles />
      <ConfettiBurst active={celebrate} language={language} />
      <header className={`header ${headerScrolled ? "header-scrolled" : ""}`}>
        <div className="brand-mark">
          <span className="brand-logo-wrap">
            <span className="brand-mark-ring" aria-hidden="true" />
            <img src="/ardeko.png" alt="Ardeko Studios" className="brand-logo" />
          </span>
          <div>
            <h1 className="modern-brand-name">
              Arda Güner
            </h1>
            <p>{strings.profession}</p>
          </div>
        </div>

        <button
          type="button"
          className={`hamburger ${mobileMenuOpen ? "is-open" : ""}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          aria-label={
            mobileMenuOpen
              ? (language === "tr" ? "Menüyü kapat" : "Close menu")
              : (language === "tr" ? "Menüyü aç" : "Open menu")
          }
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={`nav-backdrop ${mobileMenuOpen ? "is-visible" : ""}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <nav id="primary-navigation" className={mobileMenuOpen ? "nav-open" : ""}>
          <div className={`language-switcher-v2 lang-${language}`}>
            <div className="switch-track">
              <div
                className={`lang-option-v2 turkish ${language === "tr" ? "active" : ""}`}
                onClick={() => setLanguage("tr")}
                role="button"
                tabIndex={0}
                aria-pressed={language === "tr"}
                aria-label="Türkçe'ye geç"
              >
                <span className="crystal-flag tr-flag" /> 
                <span className="lang-text">TR</span>
              </div>

              <div className="switch-handle" />

              <div
                className={`lang-option-v2 english ${language === "en" ? "active" : ""}`}
                onClick={() => setLanguage("en")}
                role="button"
                tabIndex={0}
                aria-pressed={language === "en"}
                aria-label="Switch to English"
              >
                <span className="crystal-flag en-flag" />
                <span className="lang-text">EN</span>
              </div>
            </div>
          </div>
          <ul>
            <li>
              <Link to="/" onClick={closeMobileMenu}>{strings.nav.home}</Link>
            </li>
            <li>
              <a href="#about" onClick={closeMobileMenu}>{strings.nav.about}</a>
            </li>
            <li>
              <a href="#projects" onClick={closeMobileMenu}>{strings.nav.projects}</a>
            </li>
            <li>
              <a href="#studio" onClick={closeMobileMenu}>{language === "tr" ? "Stüdyo" : "Studio"}</a>
            </li>
            <li>
              <a href="#contact" onClick={closeMobileMenu}>{strings.nav.contact}</a>
            </li>
            <li><Link to="/codelab" onClick={closeMobileMenu}>Code Lab</Link></li>
          </ul>
        </nav>
      </header>
      
      <Routes>
        <Route
          path="/"
          element={
            <div className="page-fade" key={language}>
              <section id="hero" className="hero">
                <div className="hero-orbit-bg hero-orbit-bg--left" aria-hidden="true">
                  <OrbitDiagram
                    hub="Arda"
                    nodeLabels={["React", "Node.js", "JavaScript"]}
                    idPrefix="left"
                  />
                </div>

                <div className="hero-orbit-bg hero-orbit-bg--right" aria-hidden="true">
                  <OrbitDiagram
                    hub="Ardeko"
                    nodeLabels={language === "tr" ? ["Oyunlar", "Revo", "Araçlar"] : ["Games", "Revo", "Tools"]}
                    idPrefix="right"
                  />
                </div>

                <div className="hero-content">
                  <Reveal as="h1" delay={0}>{strings.hero.title}</Reveal>
                  <Reveal as="p" delay={100}>{strings.hero.subtitle}</Reveal>

                  <Reveal as="div" delay={200} className="daily-tip-widget">
                    <h3>{strings.hero.tipTitle}</h3>
                    <p>{tips[language]?.[activeTipIndex] || "..."}</p>
                  </Reveal>

                  <Reveal
                    as="button"
                    delay={300}
                    className="hero-cta"
                    onClick={() => {
                      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {strings.hero.aboutButton}
                  </Reveal>

                  <Reveal as="div" delay={400} style={{ marginTop: "20px" }}>
                    <h2 className="cv-title">{strings.cv.title}</h2>
                    <Magnetic
                      as="a"
                      href={language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf"}
                      className="pdf-button"
                      target="_blank"
                      rel="noopener noreferrer"
                      download={language === "tr" ? "arda-guner-cv-tr.pdf" : "arda-guner-cv-en.pdf"}
                      strength={0.25}
                    >
                      <span className="pdf-icon"><Icon name="file" size={18} /></span>
                      {strings.cv.downloadButton}
                    </Magnetic>
                  </Reveal>
                </div>
              </section>

              <Reveal as="section" id="about" className="about-container">
                <h2 className="about-title">{strings.about.title}</h2>
                <div className="about-content">
                  <img src="/arda.JPG" alt="Arda Güner" className="profile-picture" />
                  <div className="about-text">
                    {strings.about.detailedDescription.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    <h3><Icon name="briefcase" size={18} className="section-icon" />{strings.about.workExperience}</h3>
                    <ul>
                      {strings.about.jobs.map((job, index) => (
                        <li key={index}>{job}</li>
                      ))}
                    </ul>
                    <h3><Icon name="code" size={18} className="section-icon" />{strings.about.skills}</h3>
                    <ul>
                      <li>{strings.about.languages}</li>
                      <li>{strings.about.webTechnologies}</li>
                      <li>{strings.about.databases}</li>
                      <li>{strings.about.os}</li>
                      {strings.about.additionalSkills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                    <h3><Icon name="heart" size={18} className="section-icon" />{strings.about.hobbies}</h3>
                    <ul>
                      {strings.about.hobbyList.map((hobby, index) => (
                        <li key={index}>{hobby}</li>
                      ))}
                    </ul>
                    <p>{strings.about.philosophy}</p>
                    <p>
                      {strings.about.githubCTA}{" "}
                      <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
                        {strings.about.githubLink}
                      </a>
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="switch-master-card" strength={5}>
                  <span className="badge">
                    <span className="badge-dot" aria-hidden="true" />
                    {language === "tr" ? "YAYINDA" : "LIVE"}
                  </span>
                  <h2><Icon name="train" size={24} className="heading-icon" />Switch Master</h2>
                  <p>
                    {language === "tr"
                      ? "Rayları değiştir, treni kurtar! Şimdi mobil mağazalarda ücretsiz."
                      : "Switch tracks, save the train! Now free on mobile stores."}
                  </p>

                  <div className="store-buttons-container">
                    <a
                      href="https://apps.apple.com/tr/app/switch-master-railway/id6770972534?l=tr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn app-store"
                    >
                      <svg viewBox="0 0 384 512" width="22" height="22" fill="currentColor">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 47.5-24.4 76.5 26.9 2.4 51.2-16 68.3-38.9z"/>
                      </svg>
                      <div className="store-btn-text">
                        <span className="sub-text">Download on the</span>
                        <span className="main-text">App Store</span>
                      </div>
                    </a>

                    <a
                      href="https://play.google.com/store/apps/details?id=com.ardeko.switchmaster&pcampaignid=web_share"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="store-btn google-play"
                    >
                      <svg viewBox="0 0 512 512" width="22" height="22" fill="currentColor">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58 33.2-60.1-60.1L439 162c16.5-9.5 26.2-2.3 26.2 11.6v103.7c0 14-9.7 21.1-23 13.9zm-147 62.4l60.1 60.1L104.6 499l220.6-126.6z"/>
                      </svg>
                      <div className="store-btn-text">
                        <span className="sub-text">GET IT ON</span>
                        <span className="main-text">Google Play</span>
                      </div>
                    </a>
                  </div>
                </Tilt>
              </Reveal>
              {/* --- APEX SHIFT KARTI BAŞLANGICI --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    <span className="badge-dot" aria-hidden="true" />
                    {language === "tr" ? "CANLI · OYNA" : "LIVE · PLAY NOW"}
                  </span>
                  <h2><Icon name="racing" size={24} className="heading-icon" />Apex Shift</h2>
                  <p>
                    {language === "tr"
                      ? "Yüksek tempolu tarayıcı içi yarış deneyimi! Klavyenizi hazırlayın, hemen yeni sekmede yarışa katılın."
                      : "High-paced in-browser racing experience! Prepare your keyboard and jump into the race in a new tab."}
                  </p>
                  <a
                    href="/apex-shift.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="revo-button"
                  >
                    <Icon name="play" size={18} />
                    {language === "tr" ? "Oyuna Başla" : "Play Game"}
                  </a>
                </Tilt>
              </Reveal>
              {/* --- APEX SHIFT KARTI BİTİŞİ --- */}
              {/* --- FORZA SHIFT KARTI BAŞLANGICI --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    <span className="badge-dot" aria-hidden="true" />
                    {language === "tr" ? "YENİ · OYNA" : "NEW · PLAY NOW"}
                  </span>
                  <h2><Icon name="orbit" size={24} className="heading-icon" />Forza Orbit</h2>
                  <p>
                    {language === "tr"
                      ? "Reflekslerinizi test eden yörünge tabanlı arcade deneyimi! Mükemmel atışlar yapın, komboları toplayın ve yeni sekmede rekor kırın."
                      : "Orbit-based arcade experience that tests your reflexes! Make perfect shots, build up combos, and set new high scores in a new tab."}
                  </p>
                  <a
                    href="/forza-orbit.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="revo-button"
                  >
                    <Icon name="play" size={18} />
                    {language === "tr" ? "Oyuna Başla" : "Play Game"}
                  </a>
                </Tilt>
              </Reveal>
              {/* --- FORZA SHIFT KARTI BİTİŞİ --- */}
              <Reveal as="section" className="switch-master-wrapper">
                <Tilt as="div" className="ardeko-card" strength={5}>
                  <span className="ardeko-badge">
                    <span className="badge-dot" aria-hidden="true" />
                    {language === "tr" ? "CANLI · WEB & WINDOWS" : "LIVE · WEB & WINDOWS"}
                  </span>
                  <h2><Icon name="message" size={24} className="heading-icon" />Revo</h2>
                  <p>
                    {language === "tr"
                      ? "Uçtan uca şifreli, düşük gecikmeli sesli sohbet. Odanı saniyeler içinde kur ve linki paylaş — karşı tarafın hesap açmasına bile gerek yok."
                      : "End-to-end encrypted, low-latency voice chat. Spin up a room in seconds and share the link — no account needed on the other end."}
                  </p>

                  {/* Özellikleri paragrafa gömmek yerine taranabilir rozetlere
                      ayırdık: kart içinde göz bir cümleyi baştan sona okumaz,
                      tarar. Üç kısa etiket, üç sıfatlı bir cümleden daha hızlı
                      okunuyor. */}
                  <ul className="revo-features">
                    <li>{language === "tr" ? "Uçtan uca şifreli" : "End-to-end encrypted"}</li>
                    <li>{language === "tr" ? "Ekran paylaşımı" : "Screen sharing"}</li>
                    <li>{language === "tr" ? "Gürültü engelleme" : "Noise suppression"}</li>
                  </ul>

                  {/* İki ayrı yol, iki ayrı buton. Tek butonla "tarayıcıda aç"
                      ve "indir" aynı yere gidiyordu; masaüstü sürümü çıkınca
                      bu ayrım netleşmeliydi. Birincil eylem dolu, ikincil
                      eylem çerçeveli — hiyerarşi renkten değil ağırlıktan
                      geliyor. */}
                  <div className="revo-actions">
                    <a
                      href="https://ardekostudios.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="revo-button"
                    >
                      <Icon name="rocket" size={18} />
                      {language === "tr" ? "Sohbete Başla" : "Start Chatting"}
                    </a>
                    <a
                      href="https://github.com/Ardeko/Revo/releases/latest/download/REVO-Setup.exe"
                      className="revo-button revo-button--ghost"
                    >
                      <Icon name="download" size={18} />
                      {language === "tr" ? "Windows için indir" : "Download for Windows"}
                    </a>
                  </div>
                  <small className="revo-note">
                    {language === "tr"
                      ? "Windows 10/11 · 64-bit · Kurulum dosyası"
                      : "Windows 10/11 · 64-bit · Installer"}
                  </small>
                </Tilt>
              </Reveal>

              <Reveal as="section" id="projects" className="projects-container">
                <h2>{strings.projects.title}</h2>
                <ul ref={projectListRef} className={projectsVisible ? "in-view" : ""}>
                  {projectList.map((project, index) => (
                    <Tilt as="li" key={index} strength={5}>
                      <span className="project-emoji"><Icon name={project.icon} size={26} /></span>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      {project.isRestricted ? (
                        <p><Icon name="ban" size={16} /> {strings.projects.restricted}</p>
                      ) : (
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          {strings.projects.more}
                        </a>
                      )}
                    </Tilt>
                  ))}
                </ul>
              </Reveal>

              <StudioSpotlight language={language} />
            </div>
          }
        />
        <Route
          path="/codelab"
          element={
            <Suspense
              fallback={
                <div className="lab-loading">
                  <span className="lab-spinner" />
                  <span>Loading Code Lab…</span>
                </div>
              }
            >
              <CodeLab lang={language} strings={strings} />
            </Suspense>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy language={language} />} />
      </Routes>

      <Reveal as="footer" id="contact" className="footer">
        <h2>{strings.footer.title}</h2>
        <ul className="contact-list">
          <li>
            <span className="contact-icon" role="img" aria-label="email"><Icon name="mail" size={18} /></span>
            <a href="mailto:ardaguner2000@gmail.com">ardaguner2000@gmail.com</a>
          </li>
          <li>
            <span className="contact-icon" role="img" aria-label="email"><Icon name="mail" size={18} /></span>
            <a href="mailto:ardaguner@hotmail.com">ardaguner@hotmail.com</a>
          </li>
          <li>
            <span className="contact-icon">
              <Icon name="linkedin" size={20} />
            </span>
            <a href="https://www.linkedin.com/in/arda-g%C3%BCner/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
          <li>
            <span className="contact-icon">
              <Icon name="github" size={20} />
            </span>
            <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li style={{ marginBottom: "1rem", marginTop: "1rem" }}>
            <Link to="/privacy-policy" style={{ textDecoration: "underline" }}>
              {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
            </Link>
          </li>
        </ul>

        <Clock />

        <p style={{ cursor: "pointer" }} onClick={() => alert(strings.footer.thanks)}>
          {strings.footer.copyright}
        </p>
      </Reveal>
    </Router>
  );
}

export default App;