/* ------------------------------------------------------------------
   Çizgi tabanlı ikon seti. Emoji ve dış CDN görsellerinin yerine
   geçiyor; currentColor kullandığı için konduğu yerin metin rengini
   miras alıyor. App.jsx içinden buraya taşındı, gövdesi değişmedi.
------------------------------------------------------------------- */

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

export default Icon;
