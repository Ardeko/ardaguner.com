import Reveal from "../Reveal";
import Icon from "./Icon";

/* ------------------------------------------------------------------
   Hakkımda — içerik aynen korundu, sunumu değişti.

   Eskiden dört paragraf + üç ayrı madde listesi (işler, yetenekler,
   hobiler) alt alta diziliyordu; CV'nin HTML'e dökülmüş hâli gibi
   duruyordu. Tek bir kelime silinmedi, sadece:
     - iş geçmişi yıl/rol olarak ikiye ayrıldı, göz yılları tarayabiliyor
     - yetenekler madde işareti yerine etiketlere dönüştü
     - hobiler listeden çıkıp tek satıra indi

   Metinlerin hepsi hâlâ `locales/{tr,en}.json` içindeki `about`
   anahtarından geliyor, hiçbiri koda gömülmedi.
------------------------------------------------------------------- */

/** "2023-2025: TAC A.Ş., Yazılım Uzmanı" → { yil, rol } */
function ayir(satir) {
  const yer = satir.indexOf(":");
  if (yer === -1) return { yil: "", rol: satir };
  return { yil: satir.slice(0, yer).trim(), rol: satir.slice(yer + 1).trim() };
}

/* Yetenek satırlarının sırası. Locale'de olmayan bir anahtar artık
   sayfayı düşürmüyor: filter(Boolean) onu sessizce atlıyor. Eskiden
   `strings.about.os` silindiğinde ayir(undefined) çağrılıyor ve tüm
   site beyaz ekrana düşüyordu. */
const YETENEK_ANAHTARLARI = [
  "languages",
  "webTechnologies",
  "gameTechnologies",
  "databases",
  "tools",
  "os",
];

function About({ strings, language }) {
  const yetenekler = YETENEK_ANAHTARLARI.map((k) => strings.about[k])
    .filter(Boolean)
    .map(ayir);

  return (
    <section className="section about" id="about">
      <div className="shell">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow">{language === "tr" ? "Kimim" : "Who I am"}</span>
            <h2>
              {language === "tr" ? "Hakkımda" : "About"}{" "}
              <em className="display">{language === "tr" ? "birkaç söz" : "in short"}</em>
            </h2>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal className="about-portrait">
            <img src="/arda.JPG" alt="Arda Güner" loading="lazy" decoding="async" />
          </Reveal>

          <div className="about-copy">
            {strings.about.detailedDescription.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 60} className="lede">
                {p}
              </Reveal>
            ))}

            <Reveal as="p" className="lede about-philosophy">
              {strings.about.philosophy}
            </Reveal>
          </div>
        </div>

        <div className="about-cols">
          <Reveal className="about-block">
            <h3 className="about-block-title">
              <Icon name="briefcase" size={16} />
              {strings.about.workExperience}
            </h3>
            <ul className="cv-list">
              {strings.about.jobs.map((job, i) => {
                const { yil, rol } = ayir(job);
                return (
                  <li key={i}>
                    <span className="cv-year">{yil}</span>
                    <span className="cv-role">{rol}</span>
                  </li>
                );
              })}
            </ul>

            <h3 className="about-block-title">
              <Icon name="book" size={16} />
              {strings.about.education}
            </h3>
            <ul className="cv-list">
              {(() => {
                const { yil, rol } = ayir(strings.about.educationDetails);
                return (
                  <li>
                    <span className="cv-year">{yil}</span>
                    <span className="cv-role">{rol}</span>
                  </li>
                );
              })()}
            </ul>
          </Reveal>

          <Reveal className="about-block" delay={80}>
            <h3 className="about-block-title">
              <Icon name="code" size={16} />
              {strings.about.skills}
            </h3>

            {yetenekler.map(({ yil: baslik, rol: liste }) => (
              <div className="skill-row" key={baslik}>
                <span className="skill-label">{baslik}</span>
                <ul className="tech">
                  {liste.split(",").map((t) => (
                    <li key={t.trim()}>{t.trim()}</li>
                  ))}
                </ul>
              </div>
            ))}

            <ul className="plain-list">
              {strings.about.additionalSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <h3 className="about-block-title">
              <Icon name="heart" size={16} />
              {strings.about.hobbies}
            </h3>
            {/* Hobiler tek satırda: madde işaretli liste hâlinde
                profesyonel durmuyordu, ama içerik korunmalıydı. */}
            <p className="lede hobbies">{strings.about.hobbyList.join(" · ")}</p>

            <p className="lede">
              {strings.about.githubCTA}{" "}
              <a href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
                {strings.about.githubLink}
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;
