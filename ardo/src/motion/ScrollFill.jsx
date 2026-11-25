import { Fragment, useRef } from "react";
import { gsap, useGSAP, azalt } from "./core";

/* ------------------------------------------------------------------
   Kaydırdıkça kelime kelime dolan metin.

   Paragraf soluk başlıyor; okur aşağı indikçe kelimeler sırayla tam
   parlaklığa çıkıyor. Hareket kaydırmaya BAĞLI (scrub): okur durursa
   metin de duruyor, geri kaydırırsa geri sönüyor. Yani okuma hızını
   sayfa değil okur belirliyor.

   Hareket azaltıldığında metin baştan tam parlak, tetikleyici yok.
   Başlangıç opaklığı 0.18 — sönük kelimeler de okunabilir kalıyor
   (kontrast düşük ama metin hiçbir an görünmez değil).
------------------------------------------------------------------- */

function ScrollFill({ text, as: Tag = "p", className = "" }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (azalt()) return;
      const parcalar = ref.current.querySelectorAll(".sf-w");
      gsap.fromTo(
        parcalar,
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            end: "bottom 45%",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: ref, dependencies: [text] }
  );

  const sozcukler = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref} className={`sf ${className}`}>
      {sozcukler.map((w, i) => (
        <Fragment key={i}>
          <span className="sf-w">{w}</span>
          {i < sozcukler.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

export default ScrollFill;
