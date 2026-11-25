import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Açılış perdesi: dönen üç kelime, altta ilerleyen ince çubuk.

   v2 — kinetik tipografi
   Kelimeler artık yerinde solmuyor; bir slot makinesi gibi aşağıdan
   gelip yukarı çıkıyor (her kelime kendi maskesinin içinde). Perde de
   solarak değil, yukarı kalkarak açılıyor: sahnenin önünden çekilen bir
   perde. Kalkış başladığı an `onLift` çağrılıyor — hero'nun açılış
   koreografisi (isim, kartlar, rakamlar) perdeyle aynı anda başlasın,
   arkasında boşa oynamasın. Eskiden hero animasyonu perdenin
   ARKASINDA bitiyordu, ziyaretçi hiç görmüyordu.

   Sağ alttaki 000–100 sayacı yok (bilinçli olarak kaldırılmıştı);
   ilerlemeyi tek başına çubuk anlatıyor. Sabit süre, en fazla ~1.7 sn.
------------------------------------------------------------------- */

const SURE = 1700;
const KALKIS = 900;

function Preloader({ words, onLift, onDone }) {
  const [ilerleme, setIlerleme] = useState(0);
  const [kelime, setKelime] = useState(0);
  const [kalkiyor, setKalkiyor] = useState(false);
  const bittiRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onLift?.();
      onDone();
      return undefined;
    }

    const bas = performance.now();
    let raf = 0;
    let kapat = 0;

    const bitir = () => {
      if (bittiRef.current) return;
      bittiRef.current = true;
      setIlerleme(100);
      setKalkiyor(true);
      onLift?.();
      kapat = window.setTimeout(onDone, KALKIS);
    };

    const tik = (simdi) => {
      const oran = Math.min((simdi - bas) / SURE, 1);
      // easeOutCubic — çubuk sona doğru yavaşlıyor, birden sıçramıyor.
      setIlerleme(Math.round((1 - Math.pow(1 - oran, 3)) * 100));
      if (oran < 1) raf = requestAnimationFrame(tik);
      else bitir();
    };

    raf = requestAnimationFrame(tik);
    const dondur = window.setInterval(() => setKelime((k) => (k + 1) % words.length), 560);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(dondur);
      window.clearTimeout(kapat);
    };
  }, [onLift, onDone, words.length]);

  return (
    <div className={`preloader ${kalkiyor ? "is-leaving" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        <span className="preloader-tag">Arda Güner</span>

        <div className="preloader-words">
          {words.map((w, i) => {
            const durum = i === kelime ? "is-on" : i === (kelime + words.length - 1) % words.length ? "is-out" : "";
            return (
              <span key={w} className={`preloader-word ${durum}`}>
                {w}
              </span>
            );
          })}
        </div>

        <div className="preloader-foot">
          <span className="preloader-year">© 2026</span>
          <div className="preloader-bar">
            <span style={{ transform: `scaleX(${ilerleme / 100})` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preloader;
