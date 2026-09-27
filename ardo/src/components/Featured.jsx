import Reveal from "../Reveal";
import ProjectLinks from "./ProjectLinks";
import { featuredProjects } from "../data/projects";

/* ------------------------------------------------------------------
   Vitrin — seçilmiş işler.

   Sıra `projects.js` içindeki `featured` numarasından geliyor, burada
   sabit değil: 1 Torpidodan, 2 Legend of Rey, 3 Rushville, 4 Skyline
   Swinger, 5 Switch Master, 6 REVO, 7 Apex Shift, 8 Decoy, 9 Forza
   Orbit.

   Izgara 12 sütun. İlk dört iş büyük kartlarda, açıklıklar 7/5/5/7
   diye dönüşüyor — dört eşit kutu yerine iki farklı genişlik, gözün
   satır satır taramasını engelliyor. Geri kalanlar üçerli satırlara
   (4/4/4) iniyor; son satır eksik kalırsa kartlar genişleyip satırı
   dolduruyor (iki kart 6/6, tek kart tam genişlik), sağda boşluk
   kalmıyor.

   Görseli olmayan proje kırık resim basmıyor: yerine numarasının
   büyük yazıldığı sade bir yüzey geliyor.
------------------------------------------------------------------- */

/** Locale'de karşılığı olmayan proje sayfayı düşürmesin — bugün
    `about.os` silindiğinde site tam olarak böyle beyaz ekrana düştü. */
const metniAl = (strings, id) =>
  strings.projectItems[id] || { title: id, desc: "" };

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

  return (
    <section className="section" id="work">
      <div className="shell">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">{strings.work.eyebrow}</span>
            <h2 className="grad-text">
              {strings.work.titleLead}{" "}
              <em className="display">{strings.work.titleAccent}</em>
            </h2>
          </div>
          {/* lede opsiyonel: locale'de boş bırakılırsa başlık tek
              başına kalır, boş bir <p> ile araya boşluk girmez. */}
          {strings.work.lede && <p className="lede">{strings.work.lede}</p>}
        </Reveal>

        <div className="bento">
          {isler.map((p, i) => {
            const metin = metniAl(strings, p.id);
            return (
              <Reveal
                as="article"
                key={p.id}
                delay={i * 80}
                className={`bento-card span-${aciklik(i, isler.length)}`}
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
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                <div className="bento-body">
                  <div className="project-meta">
                    <span className={`status status-${p.status}`}>{L.status[p.status]}</span>
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

                  <ProjectLinks
                    project={p}
                    labels={L.link}
                    restrictedText={strings.projects.restricted}
                  />
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
