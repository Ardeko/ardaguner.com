import { useCallback, useEffect, useRef, useState } from "react";
import AuroraField from "./AuroraField";
import DriftField from "./DriftField";
import "./Backdrop.css";

/* ------------------------------------------------------------------
   Arka plan katmanı — imlece tepki veren ışık.

   Varyantlar:
     "aurora" — WebGL kuzey ışığı perdesi (AuroraField)       ← v2 varsayılan
                WebGL yoksa kendiliğinden "drift"e düşer.
     "drift"  — 2D domain-warp alanı (DriftField)
     "beams"  — eğik huzmeler, sadece imlecin çevresinde görünüyor

   Hepsinin üstünde aynı imleç ışığı (.bd-spot) ve grain var.

   ETKİLEŞİM
   JS dört CSS değişkeni yazıyor (--mx/--my yüzde, --px/--py -1..1) ve
   aynı konumu bir ref'te tutuyor; aurora shader'ı imleci oradan okuyor.
   React state'i yok, fare hareketinde yeniden render yok. Değerler lerp
   ile (0.08) yaklaşıyor: ışık fareye yapışmıyor, ağırlığı var.

   Dokunmatikte ve reduced-motion'da imleç dinleyicisi kurulmuyor.
------------------------------------------------------------------- */

function Backdrop({ variant = "aurora", grain = true }) {
  const ref = useRef(null);
  const imlec = useRef({ x: 0.5, y: 0.34 });
  const [glYok, setGlYok] = useState(false);
  const dus = useCallback(() => setGlYok(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dokunmatik || azalt) return undefined;

    let raf = 0;
    let hedefX = 50;
    let hedefY = 34;
    let x = hedefX;
    let y = hedefY;
    const kok = document.documentElement;

    const cizim = () => {
      x += (hedefX - x) * 0.08;
      y += (hedefY - y) * 0.08;

      kok.style.setProperty("--mx", `${x.toFixed(2)}%`);
      kok.style.setProperty("--my", `${y.toFixed(2)}%`);
      kok.style.setProperty("--px", ((x - 50) / 50).toFixed(4));
      kok.style.setProperty("--py", ((y - 50) / 50).toFixed(4));
      imlec.current.x = x / 100;
      imlec.current.y = y / 100;

      // Hedefe yaklaşınca döngü duruyor; fare dururken pil yakmıyor.
      if (Math.abs(hedefX - x) > 0.03 || Math.abs(hedefY - y) > 0.03) {
        raf = requestAnimationFrame(cizim);
      } else {
        raf = 0;
      }
    };

    const hareket = (e) => {
      hedefX = (e.clientX / window.innerWidth) * 100;
      hedefY = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(cizim);
    };

    window.addEventListener("pointermove", hareket, { passive: true });
    el.dataset.live = "true";

    return () => {
      window.removeEventListener("pointermove", hareket);
      if (raf) cancelAnimationFrame(raf);
      delete el.dataset.live;
      ["--mx", "--my", "--px", "--py"].forEach((k) => kok.style.removeProperty(k));
    };
  }, []);

  const zemin = variant === "aurora" && glYok ? "drift" : variant;

  return (
    <div ref={ref} className={`backdrop bd-${zemin}`} aria-hidden="true">
      {zemin === "aurora" && (
        <>
          <div className="bd-aurora-glow" />
          <AuroraField pointer={imlec} onFail={dus} />
          <div className="bd-spot" />
        </>
      )}

      {zemin === "beams" && (
        <>
          <div className="bd-beams-glow" />
          <div className="bd-beams-field" />
          <div className="bd-spot" />
        </>
      )}

      {zemin === "drift" && (
        <>
          <DriftField />
          <div className="bd-drift-glow" />
          <div className="bd-spot" />
        </>
      )}

      {grain && <div className="bd-grain" />}
      <div className="bd-fade" />
    </div>
  );
}

export default Backdrop;
