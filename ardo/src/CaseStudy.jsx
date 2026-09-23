import { useEffect } from "react";
import "./CaseStudy.css";

/* ------------------------------------------------------------------
   Vaka çalışması sayfası — /case/apex-shift

   NEDEN VAR
   Site ne yaptığını gösteriyordu, nasıl düşündüğünü göstermiyordu:
   24 proje, her birine iki üç cümle. Bir işveren ya da müşteri için
   bu bir liste. Burada tek bir işin hikâyesi var — problem, teşhis,
   çözüm, ölçüm — çünkü bir rozet listesi mühendislik yargısını
   anlatamıyor, bir hata ayıklama hikâyesi anlatıyor.

   İçerik locales/{tr,en}.json içindeki caseStudies.apex altında.
   Yeni vaka eklemek için oraya bir anahtar, App.jsx'e bir rota.

   METİN BİÇİMİ
   Paragraflarda iki basit işaret destekleniyor: **kalın** ve `kod`.
   Markdown kütüphanesi eklemek, iki işaret için 40 KB taşımak olurdu.
------------------------------------------------------------------- */

/** `kod` ve **kalın** işaretlerini React parçalarına çevirir. */
function zenginMetin(metin) {
  const parcalar = [];
  const kalip = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let son = 0;
  let m;
  while ((m = kalip.exec(metin)) !== null) {
    if (m.index > son) parcalar.push(metin.slice(son, m.index));
    const t = m[0];
    if (t.startsWith("**")) {
      parcalar.push(<strong key={m.index}>{t.slice(2, -2)}</strong>);
    } else {
      parcalar.push(<code key={m.index}>{t.slice(1, -1)}</code>);
    }
    son = m.index + t.length;
  }
  if (son < metin.length) parcalar.push(metin.slice(son));
  return parcalar;
}

function CaseStudy({ strings }) {
  const d = strings.caseStudies?.apex;

  // Başlık, paylaşılan linkte ve sekmede doğru görünsün.
  useEffect(() => {
    if (!d) return undefined;
    const eski = document.title;
    document.title = `${d.title} ${d.titleAccent} — Arda Güner`;
    return () => {
      document.title = eski;
    };
  }, [d]);

  if (!d) return null;

  return (
    <main className="page case-page" id="case">
      <div className="shell case-shell">
        <a className="case-back" href="/#work">
          ← {d.back}
        </a>

        <header className="case-head">
          <span className="eyebrow">{d.eyebrow}</span>
          <h1 className="case-title grad-text">
            {d.title} <em className="display">{d.titleAccent}</em>
          </h1>
          <p className="lede case-lede">{d.lede}</p>

          <dl className="case-meta">
            {d.meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <ul className="case-metrics">
          {d.metrics.map((m) => (
            <li key={m.l}>
              <b className="display">{m.n}</b>
              <span className="eyebrow">{m.l}</span>
            </li>
          ))}
        </ul>

        <div className="case-body">
          {d.sections.map((s, i) => (
            <section key={s.h} className="case-section">
              <h2>
                <span className="case-num display">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.h}
              </h2>

              {s.p.map((par, j) => (
                <p key={j}>{zenginMetin(par)}</p>
              ))}

              {s.code && (
                <pre className="case-code">
                  <code>{s.code}</code>
                </pre>
              )}

              {s.after &&
                s.after.map((par, j) => <p key={`a${j}`}>{zenginMetin(par)}</p>)}
            </section>
          ))}
        </div>

        <aside className="case-cta">
          <h2 className="display">{d.ctaTitle}</h2>
          <p>{d.ctaText}</p>
          <a className="btn btn-solid" href="/apex-shift/index.html">
            {d.ctaPlay}
          </a>
        </aside>
      </div>
    </main>
  );
}

export default CaseStudy;
