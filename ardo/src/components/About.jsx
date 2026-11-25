import { useRef } from "react";
import Reveal from "../Reveal";
import Icon from "./Icon";
import KineticTitle from "../motion/KineticTitle";
import ScrollFill from "../motion/ScrollFill";
import Marquee from "../motion/Marquee";
import { useSpotlight, useTilt } from "../motion/pointer";

/* ------------------------------------------------------------------
   Hakkımda — v2: editoryal giriş + bento.

   İçerik aynen korundu; tek bir kelime silinmedi. Metinlerin hepsi
   hâlâ `locales/{tr,en}.json` içindeki `about` anahtarından geliyor.

   ÜST KISIM — editoryal
   Portre solda yapışkan duruyor ve imlece doğru birkaç derece eğiliyor
   (üstünde cam bir parıltı geziniyor). Sağda dört paragraf; ilki
   büyük bir baş harfle (drop cap) açılıyor — dergi sayfası gibi.
   Hayat felsefesi cümlesi bölümün ortasında büyük bir alıntı: okur
   kaydırdıkça kelime kelime parlıyor.

   ALT KISIM — bento ızgara
   Eskiden iki uzun sütundu (CV'nin HTML'e dökülmüş hâli). Şimdi farklı
   boyutlarda altı kart; göz önce büyük kartı (deneyim), sonra
   küçükleri okuyor. Kartların kenarında imleci takip eden ince bir ışık
   var — tek dinleyici bütün ızgaraya yetiyor (useSpotlight).
     Deneyim (büyük) · Eğitim · Hobiler
     Yetenekler (tam genişlik: kayan teknoloji şeridi + kategori tablosu)
     Odak noktaları · GitHub (piksel katkı ızgarası — oyun stüdyosu
     aksanı)

   Bugün süren işler ("Günümüz" / "Present") deneyim listesinin başına
   alınıp "Şu an" etiketiyle işaretleniyor.
------------------------------------------------------------------- */

/** "2023-2025: TAC A.Ş., Yazılım Uzmanı" → { yil, rol } */
function ayir(satir) {
  const yer = satir.indexOf(":");
  if (yer === -1) return { yil: "", rol: satir };
  return { yil: satir.slice(0, yer).trim(), rol: satir.slice(yer + 1).trim() };
}

/** "TAC A.Ş., Yazılım Uzmanı" → { kurum, unvan } (ilk virgülden böl) */
function kurumUnvan(rol) {
  const yer = rol.indexOf(", ");
  if (yer === -1) return { kurum: rol, unvan: "" };
  return { kurum: rol.slice(0, yer), unvan: rol.slice(yer + 2) };
}

const tire = (yil) => yil.replace("-", "–");
const SURUYOR = /günümüz|present/i;

/* Locale'de olmayan anahtar sayfayı düşürmesin: filter(Boolean). */
const YETENEK_ANAHTARLARI = ["languages", "webTechnologies", "gameTechnologies", "databases", "tools", "os"];

// hobbyList ile aynı sıra: oyun fikirleri, bilim kurgu, buz pateni, dalış, drone.
const HOBI_IKON = ["play", "film", "skate", "scuba", "drone"];

/* GitHub kartındaki piksel ızgara: deterministik "katkı" yoğunlukları.
   Rastgele değil — her yüklemede aynı desen, hidrasyon farkı yok. */
const PIKSEL = Array.from({ length: 7 * 26 }, (_, i) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const r = v - Math.floor(v);
  return r > 0.86 ? 4 : r > 0.66 ? 3 : r > 0.44 ? 2 : r > 0.26 ? 1 : 0;
});

function About({ strings, language }) {
  const tr = language === "tr";
  const A = strings.about;
  const izgara = useRef(null);
  const portre = useRef(null);
  useSpotlight(izgara);
  useTilt(portre, { max: 7 });

  const yetenekler = YETENEK_ANAHTARLARI.map((k) => A[k]).filter(Boolean).map(ayir);
  const teknolojiler = [...new Set(yetenekler.flatMap(({ rol }) => rol.split(",").map((t) => t.trim())))];

  const isler = A.jobs.map(ayir).map((j, i) => ({ ...j, ...kurumUnvan(j.rol), suruyor: SURUYOR.test(j.yil), i }));
  // Süren işler başa, geri kalanı yeniden eskiye.
  const sirali = [...isler.filter((j) => j.suruyor), ...isler.filter((j) => !j.suruyor).reverse()];

  const egitim = ayir(A.educationDetails);
  const okul = kurumUnvan(egitim.rol);

  return (
    <section className="section about" id="about">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{tr ? "Kimim" : "Who I am"}</span>
            <KineticTitle lead={tr ? "Hakkımda" : "About"} accent={tr ? "birkaç söz" : "in short"} />
          </div>
        </div>

        <div className="about-intro">
          <Reveal className="about-portrait-col">
            {/* Kaynak 6240×4160 / 16.5 MB ham fotoğraftı; burada 600×750
                (kutunun 2x retina karşılığı). Orijinal deploy'a girmesin
                diye public dışında: assets-src/arda-original.JPG */}
            <figure className="about-portrait" ref={portre}>
              <div className="portrait-frame">
                <picture>
                  <source srcSet="/portrait.webp" type="image/webp" />
                  <img src="/portrait.jpg" alt="Arda Güner" width="600" height="750" loading="lazy" decoding="async" />
                </picture>
                <span className="portrait-glare" aria-hidden="true" />
              </div>
              <figcaption className="portrait-cap glass">
                <span className="live-dot" aria-hidden="true" />
                {tr ? "İstanbul, Türkiye" : "Istanbul, Türkiye"}
              </figcaption>
            </figure>
          </Reveal>

          <div className="about-copy">
            {A.detailedDescription.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 60} className={`lede${i === 0 ? " about-lead" : ""}`}>
                {p}
              </Reveal>
            ))}
          </div>
        </div>

        <ScrollFill text={A.philosophy} className="about-philosophy display" />

        <div className="about-bento" ref={izgara}>
          {/* --- Deneyim --- */}
          <Reveal className="bcard spot b-exp">
            <h3 className="bcard-title">
              <Icon name="briefcase" size={16} />
              {A.workExperience}
            </h3>
            <ol className="exp-list">
              {sirali.map((j) => (
                <li key={j.i} className={j.suruyor ? "is-now" : ""}>
                  <span className="exp-year">{tire(j.yil)}</span>
                  <span className="exp-role">
                    <span className="exp-org">{j.kurum}</span>
                    {j.unvan && <span className="exp-title">{j.unvan}</span>}
                  </span>
                  {j.suruyor && (
                    <span className="now-tag">
                      <span className="live-dot" aria-hidden="true" />
                      {A.now}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>

          {/* --- Eğitim --- */}
          <Reveal className="bcard spot b-edu" delay={80}>
            <h3 className="bcard-title">
              <Icon name="cap" size={16} />
              {A.education}
            </h3>
            <p className="edu-years display">{tire(egitim.yil)}</p>
            <p className="edu-school">{okul.kurum}</p>
            {okul.unvan && <p className="edu-dept">{okul.unvan}</p>}
          </Reveal>

          {/* --- Hobiler --- */}
          <Reveal className="bcard spot b-hobby" delay={140}>
            <h3 className="bcard-title">
              <Icon name="heart" size={16} />
              {A.hobbies}
            </h3>
            <ul className="hobby-list">
              {A.hobbyList.map((h, i) => (
                <li key={i}>
                  <span className="hobby-icon" aria-hidden="true">
                    <Icon name={HOBI_IKON[i] || "heart"} size={17} />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* --- Yetenekler --- */}
          <Reveal className="bcard spot b-stack">
            <h3 className="bcard-title">
              <Icon name="code" size={16} />
              {A.skills}
            </h3>
            {/* Kayan şerit dekoratif (aria-hidden); aynı teknolojiler
                aşağıdaki tabloda okunabilir hâlde duruyor. */}
            <Marquee className="stack-marquee" speed={60}>
              {teknolojiler.map((t) => (
                <span className="stack-word display" key={t}>
                  {t}
                  <span className="stack-sep">✦</span>
                </span>
              ))}
            </Marquee>
            <div className="skill-table">
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
            </div>
          </Reveal>

          {/* --- Odak noktaları --- */}
          <Reveal className="bcard spot b-focus">
            <h3 className="bcard-title">
              <Icon name="spark" size={16} />
              {A.focus}
            </h3>
            <ul className="focus-list">
              {A.additionalSkills.map((s, i) => (
                <li key={i}>
                  <Icon name="check" size={15} />
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* --- GitHub --- */}
          <Reveal className="bcard spot b-gh" delay={80}>
            <div className="gh-grid" aria-hidden="true">
              {PIKSEL.map((v, i) => (
                <span key={i} className={`px px-${v}`} style={{ "--c": i % 26 }} />
              ))}
            </div>
            <p className="gh-text">{A.githubCTA}</p>
            <a className="btn btn-ghost gh-link" href="https://github.com/Ardeko" target="_blank" rel="noopener noreferrer">
              <Icon name="github" size={16} />
              {A.githubLink}
              <Icon name="external" size={14} />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default About;
