import { useRef } from "react";
import Reveal from "./Reveal";
import Icon from "./components/Icon";
import KineticTitle from "./motion/KineticTitle";
import { gsap, useGSAP, azalt } from "./motion/core";
import { useTilt } from "./motion/pointer";
import { PROJECTS } from "./data/projects";
import "./StudioSpotlight.css";

/* ------------------------------------------------------------------
   Ardeko Studios — v2: izometrik vitrin + piksel aksanlar.

   SAĞ: stüdyonun izometrik maketi (Codex image_gen; kaynak ve istem
   assets-src/generated/ altında). Odadaki her nesne Arda'dan: makas
   değiştiren maket tren yolu (Switch Master), atari makinesi, ekranlarda
   oyunlar, rafta drone, dalış maskesi, buz patenleri ve futbol topu
   (Kafa Kafaya; hobiler listesinin ta kendisi). Maket kaydırmaya bağlı
   hafifçe süzülüyor ve imlece doğru birkaç derece dönüyor.

   SOL: stüdyonun gerçek uygulama ikonları bir raf gibi dizili; her biri
   oyunun mağaza / oyna sayfasına gidiyor (linki olmayan — geliştirilen —
   oyun düz ikon). Altında oyun dünyasının dilinden bir buton: piksel
   yazı, box-shadow ile çizilmiş basamaklı çerçeve, basınca gerçekten
   "basılıyor". Piksel dil yalnız bu bölümde ve 404'te; sitenin geri
   kalanı editoryal kalıyor.

   Eski bölümdeki zıplayan top kaldırıldı — top artık maketin rafında.
------------------------------------------------------------------- */

const STUDIO_URL = "https://ardekostudios.com";

const OYUNLAR = [
  { id: "switchMaster", icon: "/apps/switch-master.webp" },
  { id: "kafa", icon: "/apps/kafa-kafaya.webp" },
  { id: "rushville", icon: "/apps/rushville.webp" },
  { id: "skyline", icon: "/apps/skyline-swinger.webp" },
  { id: "torpidodan", icon: "/apps/torpidodan.webp" },
  { id: "forza", icon: "/apps/forza-orbit.webp" },
];

const BIRINCIL = ["play", "appStore", "googlePlay", "live"];
const linkOf = (id) => {
  const p = PROJECTS.find((x) => x.id === id);
  const k = BIRINCIL.find((key) => p?.links?.[key]);
  return k ? p.links[k] : null;
};

function StudioSpotlight({ strings }) {
  const kok = useRef(null);
  const maket = useRef(null);
  useTilt(maket, { max: 5 });
  const S = strings.studio;

  useGSAP(
    () => {
      if (azalt() || !kok.current) return;
      gsap.fromTo(
        kok.current.querySelector(".studio-diorama"),
        { y: 70 },
        {
          y: -70,
          ease: "none",
          scrollTrigger: { trigger: kok.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    },
    { scope: kok }
  );

  return (
    <section id="studio" className="section studio-section" ref={kok}>
      <div className="shell studio-grid">
        <div className="studio-copy">
          <Reveal>
            <span className="pixel-tag">{S.eyebrow}</span>
          </Reveal>

          <h2 className="studio-heading">
            <img src="/ardeko.png" alt="" className="studio-logo" width="56" height="56" loading="lazy" decoding="async" />
            <KineticTitle as="span" className="studio-title" lead="Ardeko" accent="Studios" />
          </h2>

          <Reveal as="p" className="lede studio-tagline">
            {S.tagline}
          </Reveal>

          <Reveal className="studio-games" delay={80}>
            <span className="studio-games-label">{S.games}</span>
            <ul>
              {OYUNLAR.map((o, i) => {
                const ad = strings.projectItems[o.id]?.title || o.id;
                const url = linkOf(o.id);
                const ic = <img src={o.icon} alt="" width="56" height="56" loading="lazy" decoding="async" />;
                return (
                  <li key={o.id} style={{ "--i": i }}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={ad} data-tip={ad}>
                        {ic}
                      </a>
                    ) : (
                      <span role="img" aria-label={ad} data-tip={ad}>
                        {ic}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Tek link. Erişilebilir ad görünen metni de içeriyor
              ("OYUNA BAŞLA — Stüdyoyu ziyaret et"; WCAG 2.5.3). */}
          <Reveal delay={140} className="studio-cta-row">
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn"
              aria-label={`${S.press} — ${S.cta}`}
            >
              <span className="pixel-btn-face">
                <span className="pixel-btn-blink" aria-hidden="true">
                  ▶
                </span>
                {S.press}
              </span>
            </a>
            <span className="studio-url" aria-hidden="true">
              ardekostudios.com
              <Icon name="external" size={13} />
            </span>
          </Reveal>
        </div>

        <div className="studio-art">
          <span className="studio-glow" aria-hidden="true" />
          <div className="studio-diorama">
            <figure className="studio-tilt" ref={maket}>
              <img
                src="/studio/diorama.webp"
                srcSet="/studio/diorama-640.webp 640w, /studio/diorama.webp 1100w"
                sizes="(min-width: 980px) 560px, 88vw"
                width="1100"
                height="1121"
                alt={S.dioramaAlt}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
          <span className="studio-floor" aria-hidden="true" />
          <span className="pixel-hud" aria-hidden="true">
            1UP · ARDEKO
          </span>
        </div>
      </div>
    </section>
  );
}

export default StudioSpotlight;
