import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Açılış ekranı: altta ilerleyen ince bir çubuk ve dönen üç kelime.

   Neden var: eski sitede ilk kare, yarısı yüklenmiş bir hero'ydu —
   fontlar geç geldiği için başlık zıplıyordu. Perde o boşluğu
   doldurup girişe bir ritim veriyor.

   Sağ alttaki 000–100 sayacı kaldırıldı; ilerlemeyi tek başına çubuk
   anlatıyor. `ilerleme` state'i duruyor çünkü çubuğun scaleX'ini o
   besliyor — sadece artık ekranda rakam olarak yazılmıyor.

   İlerleme sahte DEĞİL ama gerçek yükleme yüzdesi de değil: tarayıcı
   böyle bir sayı vermiyor. Sabit süre boyunca ilerliyor, `document`
   hazırsa erken kapanıyor. Yani en kötü ihtimalle 2 saniye tutuyor,
   sayfa hazırsa daha az.
------------------------------------------------------------------- */

const SURE = 1900;

function Preloader({ words, onDone }) {
  const [ilerleme, setIlerleme] = useState(0);
  const [kelime, setKelime] = useState(0);
  const [kapaniyor, setKapaniyor] = useState(false);
  const bittiRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onDone();
      return undefined;
    }

    const bas = performance.now();
    let raf = 0;

    const bitir = () => {
      if (bittiRef.current) return;
      bittiRef.current = true;
      setIlerleme(100);
      setKapaniyor(true);
      // Kapanış geçişi 600ms; onDone'ı sonunda çağırıyoruz ki hero
      // perde tam kalkmadan animasyonuna başlamasın.
      window.setTimeout(onDone, 600);
    };

    const tik = (simdi) => {
      const oran = Math.min((simdi - bas) / SURE, 1);
      // easeOutCubic — çubuk sonlara doğru yavaşlıyor, birden dolup
      // sıçramıyor.
      const yumusak = 1 - Math.pow(1 - oran, 3);
      setIlerleme(Math.round(yumusak * 100));
      if (oran < 1) raf = requestAnimationFrame(tik);
      else bitir();
    };

    raf = requestAnimationFrame(tik);
    const dondur = window.setInterval(
      () => setKelime((k) => (k + 1) % words.length),
      620
    );

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(dondur);
    };
  }, [onDone, words.length]);

  return (
    <div className={`preloader ${kapaniyor ? "is-leaving" : ""}`}>
      <span className="preloader-tag eyebrow">Arda Güner</span>

      <div className="preloader-words" aria-hidden="true">
        {words.map((w, i) => (
          <span key={w} className={`preloader-word ${i === kelime ? "is-on" : ""}`}>
            {w}
          </span>
        ))}
      </div>

      <div className="preloader-bar">
        <span style={{ transform: `scaleX(${ilerleme / 100})` }} />
      </div>
    </div>
  );
}

export default Preloader;
