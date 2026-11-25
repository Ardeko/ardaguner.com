import { useEffect, useRef } from "react";
import { gsap, azalt } from "./core";

/* ------------------------------------------------------------------
   Sonsuz kayan şerit — isteğe bağlı olarak kaydırma hızına duyarlı.

   İçerik iki kez basılıyor; şerit %50 kayınca ikinci kopya birincinin
   yerine oturduğu için döngü dikişsiz. Konum gsap.ticker'da elle
   ilerletiliyor (tween değil): tween'i geri oynatınca tekrarlı
   animasyon başa dayanıp duruyordu, elle sarmalanan bir konumun öyle
   bir sınırı yok.

   velocity: sayfa hızlı kaydırılınca şerit hızlanıyor, yukarı
   kaydırılınca yön değiştiriyor; durunca kendi hızına yavaşça dönüyor.
   Fare üstündeyken yavaşlıyor (okumak isteyene fırsat). Görünür alanda
   değilken hiç hesap yapılmıyor. Hareket azaltıldığında şerit sabit.
------------------------------------------------------------------- */

function Marquee({ children, speed = 40, reverse = false, velocity = false, className = "", label }) {
  const kok = useRef(null);
  const serit = useRef(null);

  useEffect(() => {
    if (azalt()) return undefined;
    const el = serit.current;
    const ana = kok.current;
    if (!el || !ana) return undefined;

    const setX = gsap.quickSetter(el, "xPercent");
    const sar = gsap.utils.wrap(-50, 0);
    const temelYon = reverse ? 1 : -1;
    const temelHiz = 50 / speed; // saniyede yüzde (yarım şerit = bir tur)

    let x = reverse ? -50 : 0;
    let yon = temelYon;
    let carpan = 1;
    let yavas = 1;
    let gorunur = false;
    let sonY = window.scrollY;

    const gozlemci = new IntersectionObserver(([g]) => {
      gorunur = g.isIntersecting;
    });
    gozlemci.observe(ana);

    const tik = (_, dt) => {
      const y = window.scrollY;
      const dy = y - sonY;
      sonY = y;
      if (!gorunur) return;

      if (velocity && Math.abs(dy) > 0.5) {
        // Aşağı kaydırma temel yönü korur, yukarı kaydırma tersine çevirir.
        yon = dy > 0 ? temelYon : -temelYon;
        carpan = Math.min(1 + Math.abs(dy) * 0.12, 7);
      }
      carpan += (1 - carpan) * 0.045;

      x = sar(x + yon * temelHiz * carpan * yavas * (dt / 1000));
      setX(x);
    };
    gsap.ticker.add(tik);

    const gir = () => (yavas = 0.25);
    const cik = () => (yavas = 1);
    ana.addEventListener("pointerenter", gir);
    ana.addEventListener("pointerleave", cik);

    return () => {
      gsap.ticker.remove(tik);
      gozlemci.disconnect();
      ana.removeEventListener("pointerenter", gir);
      ana.removeEventListener("pointerleave", cik);
    };
  }, [speed, reverse, velocity]);

  return (
    <div ref={kok} className={`mq ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}>
      <div ref={serit} className="mq-track">
        <div className="mq-group">{children}</div>
        <div className="mq-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
