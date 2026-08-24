import { useEffect, useRef, useState } from "react";
import Reveal from "../Reveal";
import { withImage, featuredProjects } from "../data/projects";

/* ------------------------------------------------------------------
   Galeri — iki sütun, kaydırmayla ters yönlerde kayıyor.

   Vitrinde zaten görünen dört iş buraya girmiyor, yoksa aynı görsel
   sayfada iki kez çıkardı.

   Paralaks tek bir scroll dinleyicisi ve iki `transform` ile yapıldı;
   bunun için bir animasyon kütüphanesi kurmaya değmez. Dinleyici
   `passive`, iş rAF içinde yapılıyor, yani kaydırma bloklanmıyor.

   `/shots/*` dosyaları henüz yok. Yüklenemeyen görsel kırık ikon
   basmasın diye karo `onError`'da kendini gizliyor — dosyalar gelince
   kendiliğinden görünür olacaklar, kod değişmeyecek.
------------------------------------------------------------------- */

/** Locale'de karşılığı olmayan proje sayfayı düşürmesin — bugün
    `about.os` silindiğinde site tam olarak böyle beyaz ekrana düştü. */
const metniAl = (strings, id) =>
  strings.projectItems[id] || { title: id, desc: "" };

function Gallery({ strings }) {
  const bolumRef = useRef(null);
  const [kayma, setKayma] = useState(0);

  const oneCikanIds = new Set(featuredProjects().map((p) => p.id));
  const kareler = withImage().filter((p) => !oneCikanIds.has(p.id));
  const orta = Math.ceil(kareler.length / 2);
  const sutunlar = [kareler.slice(0, orta), kareler.slice(orta)];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    let raf = 0;
    const olc = () => {
      raf = 0;
      const el = bolumRef.current;
      if (!el) return;
      const kutu = el.getBoundingClientRect();
      // Bölüm ekranın ortasına geldiğinde 0, uzaklaştıkça artıyor.
      const ilerleme = (window.innerHeight / 2 - (kutu.top + kutu.height / 2)) / window.innerHeight;
      setKayma(Math.max(-1, Math.min(1, ilerleme)) * 40);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(olc);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    olc();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!kareler.length) return null;

  return (
    <section className="section gallery" id="gallery" ref={bolumRef}>
      <div className="shell">
        <Reveal className="section-head">
          <div>
            {/* Bu bölümün başlığı tek kelime: "Arşiv". Eyebrow ve
                titleLead locale'de boş; diğer bölümlerdeki iki
                parçalı kalıp burada kasıtlı olarak kullanılmıyor,
                çünkü bölüm bir vitrin değil bir depo. */}
            {strings.gallery.eyebrow && (
              <span className="eyebrow">{strings.gallery.eyebrow}</span>
            )}
            <h2 className="grad-text">
              {strings.gallery.titleLead && `${strings.gallery.titleLead} `}
              <em className="display">{strings.gallery.titleAccent}</em>
            </h2>
          </div>
          {strings.gallery.lede && <p className="lede">{strings.gallery.lede}</p>}
        </Reveal>

        <div className="gallery-grid">
          {sutunlar.map((sutun, si) => (
            <div
              key={si}
              className="gallery-col"
              style={{ transform: `translate3d(0, ${si === 0 ? kayma : -kayma}px, 0)` }}
            >
              {sutun.map((p) => {
                const metin = metniAl(strings, p.id);
                return (
                  <Reveal as="figure" key={p.id} className="gallery-item">
                    <img
                      src={p.image}
                      alt={metin.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.closest(".gallery-item").hidden = true;
                      }}
                    />
                    <figcaption>
                      <span className="display">{metin.title}</span>
                      <span className={`status status-${p.status}`}>
                        {strings.projectLabels.status[p.status]}
                      </span>
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
