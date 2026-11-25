import { useEffect, useRef, useState } from "react";
import { basaDon } from "../motion/lenis";

/* ------------------------------------------------------------------
   Başa dön — v2: cam düğme + ilerleme halkası.

   Düğme ilk ekranda görünmüyor; iki ekran boyu inildikten sonra
   beliriyor. Çevresindeki halka sayfanın ne kadarının okunduğunu
   gösteriyor (üst çubuktaki adanın halkasıyla aynı dil). Halka doğrudan
   stil olarak yazılıyor; kaydırma başına render yok — state yalnız
   görünürlük eşiği geçilince değişiyor.

   Tıklayınca Lenis varsa yumuşak, yoksa (hareket azaltıldığında)
   tarayıcının kendi kaydırmasıyla başa dönüyor.
------------------------------------------------------------------- */

const R = 19;
const C = 2 * Math.PI * R;

function BackToTop({ label }) {
  const [gorunur, setGorunur] = useState(false);
  const halka = useRef(null);

  useEffect(() => {
    let raf = 0;
    const olc = () => {
      raf = 0;
      const y = window.scrollY;
      setGorunur(y > window.innerHeight * 2);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (halka.current) halka.current.style.strokeDashoffset = String(C * (1 - (max > 0 ? Math.min(y / max, 1) : 0)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(olc);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    olc();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      type="button"
      className={`to-top glass ${gorunur ? "is-on" : ""}`}
      onClick={basaDon}
      aria-label={label}
      tabIndex={gorunur ? 0 : -1}
    >
      <svg className="to-top-ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={R} className="to-top-track" />
        <circle ref={halka} cx="22" cy="22" r={R} className="to-top-fill" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default BackToTop;
