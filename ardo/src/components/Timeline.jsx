import { useState } from "react";
import Reveal from "../Reveal";
import ProjectLinks from "./ProjectLinks";
import { CATEGORIES, groupByYear, chronological } from "../data/projects";

/* ------------------------------------------------------------------
   Çizelge — katalogdaki 23 projenin tamamı, yıla göre gruplanmış.

   Vitrin dört işi öne çıkarıyor; burası "hepsi" listesi. Eski sitede
   on proje aynı boyutta on kart halindeydi ve hiçbir sıra duygusu
   yoktu. Yıla bölünce 2023'te üç, 2026'da on iki proje olduğu tek
   bakışta görünüyor — asıl anlatmak istediğimiz şey bu.

   Filtre çubuğu kategoriye göre daraltıyor. Boş kalan yıl başlığı
   basılmıyor.
------------------------------------------------------------------- */

function Timeline({ strings, language }) {
  const [filtre, setFiltre] = useState("all");
  const L = strings.projectLabels;

  const hepsi = chronological();
  const suzulmus = filtre === "all" ? hepsi : hepsi.filter((p) => p.category === filtre);
  const yillar = groupByYear(suzulmus);

  const sayilar = CATEGORIES.reduce((acc, c) => {
    acc[c] = hepsi.filter((p) => p.category === c).length;
    return acc;
  }, {});

  return (
    <section className="section journey" id="journey">
      <div className="shell">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">{strings.journey.eyebrow}</span>
            <h2>
              {strings.journey.titleLead}{" "}
              <em className="display">{strings.journey.titleAccent}</em>
            </h2>
          </div>
          <p className="lede">{strings.journey.lede.replace("{n}", hepsi.length)}</p>
        </Reveal>

        <Reveal className="filters" role="group" aria-label={strings.journey.filterLabel}>
          <button
            type="button"
            className={filtre === "all" ? "is-on" : ""}
            onClick={() => setFiltre("all")}
          >
            {strings.journey.all} <span>{hepsi.length}</span>
          </button>
          {CATEGORIES.filter((c) => sayilar[c] > 0).map((c) => (
            <button
              key={c}
              type="button"
              className={filtre === c ? "is-on" : ""}
              onClick={() => setFiltre(c)}
            >
              {L.category[c]} <span>{sayilar[c]}</span>
            </button>
          ))}
        </Reveal>

        <div className="years">
          {yillar.map((grup) => (
            <div className="year" key={grup.year}>
              <h3 className="year-label display">{grup.year}</h3>

              <ul className="year-items">
                {grup.items.map((p, i) => {
                  const metin = strings.projectItems[p.id];
                  return (
                    <Reveal as="li" key={p.id} delay={Math.min(i, 4) * 60} className="entry">
                      <div className="entry-head">
                        <h4 className="display entry-title">{metin.title}</h4>
                        <span className={`status status-${p.status}`}>{L.status[p.status]}</span>
                      </div>

                      <p className="lede entry-desc">{metin.desc}</p>

                      <div className="entry-foot">
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
                          compact
                        />
                      </div>
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {suzulmus.length === 0 && (
          <p className="lede">{language === "tr" ? "Bu kategoride proje yok." : "No projects in this category."}</p>
        )}
      </div>
    </section>
  );
}

export default Timeline;
