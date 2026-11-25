import { useEffect, useRef, useState } from "react";
import useInView from "./useInView";
import { azalt } from "./core";

/* ------------------------------------------------------------------
   Görünür olunca sıfırdan değerine sayan rakam.

   Değer sayı ya da "13 sn", "17 ms" gibi bir metin olabilir: baştaki
   sayı sayılıyor, ön ve son ek olduğu gibi kalıyor. Sayı içermeyen
   metin olduğu gibi basılıyor.

   `start` false iken beklemede kalıyor — hero'daki rakamlar açılış
   perdesi kalkmadan saymaya başlamasın diye.

   Sayılan değer aria-hidden; ekran okuyucu baştan son değeri okuyor
   (sr-only kopyası). Aksi hâlde ara değerleri anons edebiliyordu.
------------------------------------------------------------------- */

const KALIP = /^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/;

function CountUp({ value, start = true, duration = 1600, className = "" }) {
  const ref = useRef(null);
  const gorundu = useInView(ref, { threshold: 0.4 });
  const metin = String(value);
  const m = KALIP.exec(metin);
  const hedef = m ? parseFloat(m[2].replace(",", ".")) : 0;
  const ondalik = m && /[.,]/.test(m[2]) ? m[2].split(/[.,]/)[1].length : 0;
  const ayrac = m && m[2].includes(",") ? "," : ".";
  const [deger, setDeger] = useState(() => (azalt() ? hedef : 0));

  useEffect(() => {
    if (!m || !gorundu || !start) return undefined;
    if (azalt()) {
      setDeger(hedef);
      return undefined;
    }
    let raf = 0;
    const bas = performance.now();
    const tik = (simdi) => {
      const t = Math.min((simdi - bas) / duration, 1);
      // easeOutExpo — hızlı başlayıp hedefe yumuşak oturuyor
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDeger(hedef * e);
      if (t < 1) raf = requestAnimationFrame(tik);
    };
    raf = requestAnimationFrame(tik);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gorundu, start, hedef, duration]);

  if (!m) return <span className={className}>{metin}</span>;

  const sayi = deger.toFixed(ondalik).replace(".", ayrac);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>
        {m[1]}
        {sayi}
        {m[3]}
      </span>
      <span className="sr-only">{metin}</span>
    </span>
  );
}

export default CountUp;
