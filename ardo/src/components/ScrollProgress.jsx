import { useEffect, useState } from "react";

/* ------------------------------------------------------------------
   Sayfanın en üstünde duran saç teli kalınlığında ilerleme çubuğu.

   Görsel dili açılış ekranındaki `.preloader-bar` ile aynı: 2px, gri
   yol, beyaz dolgu. Yeni bir renk ya da gradient getirmiyor — sitede
   zaten var olan bir şeyin devamı gibi okunması gerekiyor.

   Sayfa dört ekran boyu; ziyaretçi ne kadar kaldığını bilmiyor.
   Çubuk bunu tek bakışta söylüyor.

   Ölçüm rAF içinde, dinleyici passive: kaydırma bloklanmıyor.
   transform kullanılıyor (width değil), böylece her karede layout
   yeniden hesaplanmıyor.
------------------------------------------------------------------- */

function ScrollProgress() {
  const [oran, setOran] = useState(0);

  useEffect(() => {
    let raf = 0;

    const olc = () => {
      raf = 0;
      const yukseklik = document.documentElement.scrollHeight - window.innerHeight;
      setOran(yukseklik > 0 ? Math.min(1, window.scrollY / yukseklik) : 0);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(olc);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    olc();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${oran})` }} />
    </div>
  );
}

export default ScrollProgress;
