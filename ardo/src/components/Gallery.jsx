import { useRef } from "react";
import Reveal from "../Reveal";
import Icon from "./Icon";
import KineticTitle from "../motion/KineticTitle";
import { gsap, useGSAP, azalt } from "../motion/core";
import { useSpotlight } from "../motion/pointer";
import { withImage, featuredProjects } from "../data/projects";

/* ------------------------------------------------------------------
   Arşiv — iki sütun, kaydırmayla ters yönlerde kayıyor.

   Vitrinde zaten görünen işler buraya girmiyor (aynı görsel iki kez
   çıkmasın). Görseli olmayan iş de girmiyor.

   v2:
   - Paralaks eskiden scroll dinleyicisi + React state ile yapılıyordu:
     her kaydırma karesinde bileşen yeniden çiziliyordu. Şimdi GSAP
     ScrollTrigger (scrub) doğrudan transform yazıyor; render yok.
   - Görseller birer tarayıcı penceresinin içinde (üç nokta + adres
     çubuğunda sitenin alan adı): bunlar web işleri, çerçeve onu
     söylüyor.

   Yüklenemeyen görsel kırık ikon basmasın diye karo `onError`'da
   kendini gizliyor.
------------------------------------------------------------------- */

const metniAl = (strings, id) => strings.projectItems[id] || { title: id, desc: "" };

const alanAdi = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function Gallery({ strings }) {
  const bolumRef = useRef(null);
  const izgara = useRef(null);
  useSpotlight(izgara);

  const oneCikanIds = new Set(featuredProjects().map((p) => p.id));
  const kareler = withImage().filter((p) => !oneCikanIds.has(p.id));
  const orta = Math.ceil(kareler.length / 2);
  const sutunlar = [kareler.slice(0, orta), kareler.slice(orta)];
  const cift = kareler.length === 2;

  useGSAP(
    () => {
      if (azalt() || !bolumRef.current) return;
      const mm = gsap.matchMedia();
      // Tek sütuna düşünce paralaks anlamsız; yalnız geniş ekranda.
      mm.add("(min-width: 621px)", () => {
        const [a, b] = bolumRef.current.querySelectorAll(".gallery-col");
        const st = { trigger: bolumRef.current, start: "top bottom", end: "bottom top", scrub: true };
        if (a) gsap.fromTo(a, { y: 50 }, { y: -50, ease: "none", scrollTrigger: st });
        if (b) gsap.fromTo(b, { y: -50 }, { y: 50, ease: "none", scrollTrigger: { ...st } });
      });
    },
    { scope: bolumRef }
  );

  if (!kareler.length) return null;

  return (
    <section className="section gallery" id="gallery" ref={bolumRef}>
      <div className="shell">
        <div className="section-head">
          <div>
            {/* Bölüm başlığı tek kelime: "Arşiv". Bölüm bir vitrin değil
                bir depo; iki parçalı başlık kalıbı burada kullanılmıyor. */}
            {strings.gallery.eyebrow && <span className="eyebrow">{strings.gallery.eyebrow}</span>}
            <KineticTitle lead={strings.gallery.titleLead} accent={strings.gallery.titleAccent} />
          </div>
          {strings.gallery.lede && <p className="lede">{strings.gallery.lede}</p>}
        </div>

        <div className={`gallery-grid${cift ? " is-pair" : ""}`} ref={izgara}>
          {sutunlar.map((sutun, si) => (
            <div key={si} className="gallery-col">
              {sutun.map((p) => {
                const metin = metniAl(strings, p.id);
                const canli = p.links?.live;
                const baslik = <span className="display">{metin.title}</span>;
                return (
                  <Reveal as="figure" key={p.id} className={`gallery-item spot${canli ? " is-link" : ""}`}>
                    <div className="browser-bar" aria-hidden="true">
                      <span className="browser-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                      {canli && <span className="browser-url">{alanAdi(canli)}</span>}
                    </div>
                    <div className="gallery-shot">
                      <img
                        src={p.image}
                        alt={metin.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.closest(".gallery-item").hidden = true;
                        }}
                      />
                    </div>
                    <figcaption>
                      {canli ? (
                        <a className="gallery-link" href={canli} target="_blank" rel="noopener noreferrer">
                          {baslik}
                          <Icon name="external" size={15} />
                        </a>
                      ) : (
                        baslik
                      )}
                      <span className={`status status-${p.status}`}>{strings.projectLabels.status[p.status]}</span>
                    </figcaption>
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
