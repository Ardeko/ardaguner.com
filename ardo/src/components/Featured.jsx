import Reveal from "../Reveal";
import ProjectLinks from "./ProjectLinks";
import { featuredProjects } from "../data/projects";

/* ------------------------------------------------------------------
   Vitrin — dört seçilmiş iş.

   Sıra `projects.js` içindeki `featured` numarasından geliyor, burada
   sabit değil: 1 REVO, 2 Switch Master, 3 Sarteks, 4 Legend of Rey.

   Izgara 12 sütun ve açıklıklar 7/5/5/7 diye dönüşüyor — dört eşit
   kutu yerine iki farklı genişlik, gözün satır satır taramasını
   engelliyor. Eski sitede on kartın hepsi aynı boyuttaydı, o yüzden
   hiçbiri öne çıkmıyordu.

   Görseli olmayan proje kırık resim basmıyor: yerine numarasının
   büyük yazıldığı sade bir yüzey geliyor.
------------------------------------------------------------------- */

/** Locale'de karşılığı olmayan proje sayfayı düşürmesin — bugün
    `about.os` silindiğinde site tam olarak böyle beyaz ekrana düştü. */
const metniAl = (strings, id) =>
  strings.projectItems[id] || { title: id, desc: "" };

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
                className={`bento-card span-${i % 4 === 0 || i % 4 === 3 ? 7 : 5}`}
              >
                <div className="bento-media">
                  {p.image ? (
                    <img src={p.image} alt={metin.title} loading="lazy" decoding="async" />
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
