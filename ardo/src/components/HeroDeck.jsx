import { useEffect, useRef } from "react";
import { PROJECTS } from "../data/projects";
import { hassasIsaretci, azalt } from "../motion/core";

/* ------------------------------------------------------------------
   Hero kart yığını — Spatial UI.

   NEDEN
   Eski hero'nun sağ yarısı bomboştu: büyük bir isim ve altında metin,
   yanında 700px karanlık. Bir oyun geliştiricisinin ilk ekranı, işin
   kendisini göstermeli. Burada beş yayındaki oyunun kapağı, havada
   duran cam pencereler gibi farklı derinliklerde asılı duruyor.

   DERİNLİK
   Her kartın bir derinliği var (--d, 0..1). İmleç hareket edince yakın
   kartlar çok, uzaktakiler az kayıyor (paralaks) ve bütün sahne imlece
   doğru birkaç derece dönüyor. Konum CSS değişkeniyle yazılıyor; React
   her fare hareketinde yeniden çizmiyor. Kartların yüzündeki parlama
   da aynı değişkenle kayıyor — cam yüzeyden yansıyan ışık.

   Dokunmatikte ve hareket azaltıldığında sahne sabit bir kompozisyon.

   Açılış (kartların aşağıdan süzülüp yerine oturması) Hero'daki GSAP
   zaman çizelgesinde; `.deck-intro` katmanını o oynatıyor. Kaydırınca
   yığının yukarı süzülmesi de orada (yalnız dekoratif katman — metin
   ve butonlar paralaksa girmiyor).

   Erişilebilirlik: kartlar dekoratif (alt=""), bütün yığın tek bir
   link: "Seçilmiş işlere git". Klavyede tek durak.
------------------------------------------------------------------- */

// x / y / w: sahnenin yüzdesi. d: derinlik (1 = en önde). r: eğim (derece).
const KARTLAR = [
  { id: "rushville", src: "/games/rushville.jpg", x: 2, y: 70, w: 38, d: 0.35, r: -3, minor: true },
  { id: "skyline", src: "/games/skyline-swinger-cover-640.webp", x: 40, y: 1, w: 58, d: 0.5, r: 4 },
  { id: "apex", src: "/games/apex-shift-cover-640.webp", x: 0, y: 9, w: 45, d: 0.62, r: -6, minor: true },
  { id: "legendOfRey", src: "/games/legend-of-rey.jpg", x: 55, y: 63, w: 43, d: 0.78, r: 5 },
  { id: "torpidodan", src: "/games/torpidodan.svg", x: 8, y: 31, w: 70, d: 1, r: -2.5 },
];

const durumOf = (id) => PROJECTS.find((p) => p.id === id)?.status;

function HeroDeck({ strings, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hassasIsaretci() || azalt()) return undefined;
    const hero = el.closest(".hero") || el;
    let raf = 0;
    let hx = 0;
    let hy = 0;
    let x = 0;
    let y = 0;

    const ciz = () => {
      x += (hx - x) * 0.07;
      y += (hy - y) * 0.07;
      el.style.setProperty("--hx", x.toFixed(4));
      el.style.setProperty("--hy", y.toFixed(4));
      if (Math.abs(hx - x) > 0.001 || Math.abs(hy - y) > 0.001) raf = requestAnimationFrame(ciz);
      else raf = 0;
    };
    const hareket = (e) => {
      hx = (e.clientX / window.innerWidth) * 2 - 1;
      hy = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(ciz);
    };
    const cik = () => {
      hx = 0;
      hy = 0;
      if (!raf) raf = requestAnimationFrame(ciz);
    };

    hero.addEventListener("pointermove", hareket, { passive: true });
    hero.addEventListener("pointerleave", cik);
    return () => {
      hero.removeEventListener("pointermove", hareket);
      hero.removeEventListener("pointerleave", cik);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a href="#work" className="deck" ref={ref} aria-label={label}>
      <span className="deck-halo" aria-hidden="true" />
      <span className="deck-stage" aria-hidden="true">
        {KARTLAR.map((k, i) => {
          const baslik = strings.projectItems[k.id]?.title || k.id;
          const durum = durumOf(k.id);
          return (
            <span
              key={k.id}
              className={`deck-slot${k.minor ? " is-minor" : ""}`}
              style={{
                "--x": k.x,
                "--y": k.y,
                "--w": k.w,
                "--d": k.d,
                "--r": k.r,
                "--bob": `${6.5 + i * 1.3}s`,
                "--bob-delay": `${-i * 1.7}s`,
                zIndex: Math.round(k.d * 10),
              }}
            >
              <span className="deck-intro">
                <span className="deck-bob">
                  <span className="deck-card">
                    <img
                      src={k.src}
                      alt=""
                      width="640"
                      height="360"
                      decoding="async"
                      draggable="false"
                    />
                    <span className="deck-sheen" />
                    <span className="deck-cap">
                      <span className={`deck-dot status-${durum || "live"}`} />
                      {baslik}
                    </span>
                  </span>
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </a>
  );
}

export default HeroDeck;
