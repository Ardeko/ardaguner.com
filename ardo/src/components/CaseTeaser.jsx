import Reveal from "../Reveal";

/* ------------------------------------------------------------------
   Vaka çalışması tanıtımı — vitrinden sonra, çizelgeden önce.

   NEDEN AYRI BİR BÖLÜM
   Yazının linki önce proje kartının buton sırasındaydı: "Oyna",
   "Canlı", "İndir", "Kaynak kodu" ile yan yana. Hepsi "git şunu yap"
   eylemi; vaka çalışması ise okunacak bir şey. Aynı sıraya girince
   hem yanlış bir söz veriyordu hem de dört karttan yalnız birinde
   olduğu için tek başına kalıyordu.

   Burada tek bir iş yapıyor: "ne yaptığını" anlatan vitrinin hemen
   ardından "nasıl düşündüğünü" gösteriyor. Tek yazı olduğu için
   liste değil, tek blok.

   İçerik locales içindeki caseStudies.apex altından geliyor —
   başlık ve sayılar yazının kendi sayfasıyla aynı kaynaktan, yani
   ikisi birbirinden ayrı düşemiyor.
------------------------------------------------------------------- */

function CaseTeaser({ strings }) {
  const d = strings.caseStudies?.apex;
  if (!d || !d.teaser) return null;

  return (
    <section className="section case-teaser" id="writing">
      <div className="shell">
        <Reveal className="ct-card">
          <span className="eyebrow">{d.teaser.eyebrow}</span>

          <h2 className="ct-title grad-text">
            {d.title} <em className="display">{d.titleAccent}</em>
          </h2>

          <p className="ct-quote display">{d.teaser.quote}</p>

          <ul className="ct-metrics">
            {d.metrics.map((m) => (
              <li key={m.l}>
                <b className="display">{m.n}</b>
                <span className="eyebrow">{m.l}</span>
              </li>
            ))}
          </ul>

          <a className="ct-link" href="/case/apex-shift">
            {d.teaser.cta}
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export default CaseTeaser;
