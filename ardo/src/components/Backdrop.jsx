import { useEffect, useRef } from "react";
import "./Backdrop.css";

/* ------------------------------------------------------------------
   Arka plan katmanı — imlece tepki veren ışık.

   İki varyant var:
     "aurora" — üç yumuşak leke + imleci takip eden ışık   (varsayılan)
     "beams"  — eğik huzmeler, sadece imlecin çevresinde görünüyor

   Izgara ve nokta varyantları kaldırıldı: sabit bir desen, hareket
   eden bir zemine göre hem daha sönük hem de metnin arkasında daha
   gürültülüydü.

   ETKİLEŞİM NASIL ÇALIŞIYOR
   JS'in tek işi dört CSS değişkeni yazmak:
     --mx / --my  imlecin viewport içindeki yüzde konumu (ışığın merkezi)
     --px / --py  aynı konumun -1..1 aralığına indirgenmiş hâli
                  (lekelerin paralaks kayması için)
   Boyamanın tamamı CSS'te. React state'i yok, yani her fare
   hareketinde yeniden render olmuyor — 60fps'te bileşen ağacını
   yeniden çizmek bu efektin görsel değerinden çok daha pahalı olurdu.

   Değerler doğrudan yazılmıyor, lerp ile yaklaşıyor (0.08 katsayısı).
   Ham imleç konumu kullanılsaydı ışık fareye yapışık dururdu; bu
   gecikme ona ağırlık veriyor.

   KAPANDIĞI DURUMLAR
   - Dokunmatik cihaz (pointer: coarse): imleç yok, dinleyici hiç
     kurulmuyor. Lekeler kendi yavaş animasyonlarıyla dönmeye devam
     ediyor, ekran yine boş kalmıyor.
   - prefers-reduced-motion: hem takip hem sürüklenme duruyor.
------------------------------------------------------------------- */

function Backdrop({ variant = "aurora", grain = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (dokunmatik || azalt) return undefined;

    let raf = 0;
    // Başlangıç: ekranın biraz üstü. Sayfa açıldığında ışık hero
    // başlığının arkasında olsun, imleç hiç kıpırdamasa bile.
    let hedefX = 50;
    let hedefY = 34;
    let x = hedefX;
    let y = hedefY;

    const cizim = () => {
      x += (hedefX - x) * 0.08;
      y += (hedefY - y) * 0.08;

      el.style.setProperty("--mx", `${x.toFixed(2)}%`);
      el.style.setProperty("--my", `${y.toFixed(2)}%`);
      el.style.setProperty("--px", ((x - 50) / 50).toFixed(4));
      el.style.setProperty("--py", ((y - 50) / 50).toFixed(4));

      // Hedefe yeterince yaklaşınca döngü duruyor. Sürekli dönen bir
      // rAF, fare dururken de pil yakardı.
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
    };
  }, []);

  return (
    <div ref={ref} className={`backdrop bd-${variant}`} aria-hidden="true">
      {variant === "aurora" && (
        <>
          <div className="bd-blob bd-blob-a" />
          <div className="bd-blob bd-blob-b" />
          <div className="bd-blob bd-blob-c" />
          <div className="bd-spot" />
        </>
      )}

      {variant === "beams" && (
        <>
          <div className="bd-beams-glow" />
          <div className="bd-beams-field" />
          <div className="bd-spot" />
        </>
      )}

      {grain && <div className="bd-grain" />}
      <div className="bd-fade" />
    </div>
  );
}

export default Backdrop;
