import { useRef } from "react";
import Reveal from "../Reveal";
import KineticTitle from "../motion/KineticTitle";
import CountUp from "../motion/CountUp";
import { gsap, useGSAP, azalt } from "../motion/core";

/* ------------------------------------------------------------------
   Vaka çalışması tanıtımı — vitrinden sonra, çizelgeden önce.

   Vitrin "ne yaptığını" gösteriyor; bu blok "nasıl düşündüğünü".
   Tek yazı olduğu için liste değil, tek bir dergi kapağı.

   v2 — editoryal kapak
   Kapak görseli (Codex image_gen, assets-src/generated/case-apex-clock.png)
   yazının konusunu tek karede anlatıyor: yan yana yarışan iki araba,
   üstlerinde FARKLI saati gösteren iki kronometre, uzakta bağlantısı
   kopan bir sunucu. Görsel bilerek solu boş bırakılarak üretildi; metin
   o boşluğa oturuyor. Görsel kaydırmaya bağlı hafifçe kayıyor
   (yalnız görsel — metin sabit).

   Rakamlar (13 sn · 17 ms · 0) görününce sayıyor.

   İçerik locales içindeki caseStudies.apex altından — başlık ve sayılar
   yazının kendi sayfasıyla aynı kaynaktan.
------------------------------------------------------------------- */

function CaseTeaser({ strings }) {
  const kok = useRef(null);
  const d = strings.caseStudies?.apex;

  useGSAP(
    () => {
      if (azalt() || !kok.current) return;
      gsap.fromTo(
        kok.current.querySelector(".ct-cover img"),
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: kok.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    },
    { scope: kok }
  );

  if (!d || !d.teaser) return null;

  return (
    <section className="section case-teaser" id="writing" ref={kok}>
      <div className="shell">
        <Reveal as="article" className="ct">
          <div className="ct-cover" aria-hidden="true">
            <img
              src="/case/apex-clock.webp"
              srcSet="/case/apex-clock-768.webp 768w, /case/apex-clock.webp 1536w"
              sizes="(min-width: 1240px) 1240px, 100vw"
              alt=""
              width="1536"
              height="1024"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="ct-body">
            <span className="eyebrow">{d.teaser.eyebrow}</span>

            <KineticTitle className="ct-title" lead={d.title} accent={d.titleAccent} />

            <p className="ct-quote display">{d.teaser.quote}</p>

            <ul className="ct-metrics">
              {d.metrics.map((m) => (
                <li key={m.l}>
                  <b className="display">
                    <CountUp value={m.n} />
                  </b>
                  <span className="eyebrow is-bare">{m.l}</span>
                </li>
              ))}
            </ul>

            <a className="ct-link" href="/case/apex-shift">
              <span>{d.teaser.cta}</span>
              <span className="ct-link-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CaseTeaser;
