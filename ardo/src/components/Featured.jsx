import { useRef } from "react";
import Reveal from "../Reveal";
import ProjectLinks from "./ProjectLinks";
import KineticTitle from "../motion/KineticTitle";
import { useSpotlight } from "../motion/pointer";
import { featuredProjects } from "../data/projects";

/* ------------------------------------------------------------------
   Vitrin — seçilmiş işler (bento).

   Sıra `projects.js` içindeki `featured` numarasından geliyor. Izgara
   12 sütun: ilk dört iş büyük kartlarda (7/5/5/7), geri kalanlar üçerli
   satırlarda; son satır eksik kalırsa kartlar genişleyip satırı
   dolduruyor.

   v2'de kartın kendisi:
   - Görsel, kart göründüğünde maskeden açılıyor (clip-path) ve bir tık
     büyükten yerine oturuyor. Tek seferlik, CSS ile.
   - Kenarda imleci izleyen ince bir ışık (useSpotlight): ızgaranın
     tamamına tek dinleyici.
   - Hover parıltısının rengi kartın KENDİ oyun görselinden (`accent`,
     projects.js). Palete yeni renk eklemiyor; her oyun kendi rengini
     getiriyor, bilgi taşıyor.
   - Numara ve durum görselin üstünde cam rozetlerde.

   Görseli olmayan proje kırık resim basmıyor: numarasının büyük yazıldığı
   sade bir yüzey geliyor.
------------------------------------------------------------------- */

const metniAl = (strings, id) => strings.projectItems[id] || { title: id, desc: "" };

const BUYUK = 4;

/** `i`. kartın 12 sütunda kaç sütun kaplayacağı. */
function aciklik(i, toplam) {
  if (i < BUYUK) return i % 4 === 0 || i % 4 === 3 ? 7 : 5;
  const j = i - BUYUK;
  const satirdaki = Math.min(3, toplam - BUYUK - (j - (j % 3)));
  return 12 / satirdaki;
}

function Featured({ strings }) {
  const isler = featuredProjects();
  const L = strings.projectLabels;
  const izgara = useRef(null);
  useSpotlight(izgara);

  return (
    <section className="section" id="work">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{strings.work.eyebrow}</span>
            <KineticTitle lead={strings.work.titleLead} accent={strings.work.titleAccent} />
          </div>
          {strings.work.lede && <Reveal as="p" className="lede">{strings.work.lede}</Reveal>}
        </div>

        <div className="bento" ref={izgara}>
          {isler.map((p, i) => {
            const metin = metniAl(strings, p.id);
            const no = String(i + 1).padStart(2, "0");
            return (
              <Reveal
                as="article"
                key={p.id}
                delay={(i % 3) * 70}
                className={`bento-card spot span-${aciklik(i, isler.length)}`}
                style={p.accent ? { "--card-accent": p.accent } : undefined}
              >
                <div className={`bento-media${p.artwork ? " is-artwork" : ""}`}>
                  {p.image ? (
                    <img
                      src={p.image}
                      srcSet={p.artwork?.srcSet}
                      sizes={p.artwork?.sizes}
                      width={p.artwork?.width}
                      height={p.artwork?.height}
                      alt={metin.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="bento-placeholder display" aria-hidden="true">
                      {no}
                    </span>
                  )}
                  <span className="media-chip glass media-no" aria-hidden="true">
                    {no}
                  </span>
                  <span className={`media-chip glass status status-${p.status}`}>{L.status[p.status]}</span>
                </div>

                <div className="bento-body">
                  <div className="project-meta">
                    <span className="project-cat">{L.category[p.category]}</span>
                    <span className="project-plat">{p.platforms}</span>
                  </div>

                  <h3 className="display bento-title">{metin.title}</h3>
                  <p className="lede">{metin.desc}</p>

                  {p.tech.length > 0 && (
                    <ul className="tech">
                      {p.tech.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}

                  <ProjectLinks project={p} labels={L.link} restrictedText={strings.projects.restricted} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Featured;
