import { useEffect } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   404 — v2: oyun dünyasının diliyle.

   Yakalayıcı rota: /hakkimda gibi var olmayan bir adres boş bir gövde
   basmasın diye. Bir oyun geliştiricisinin 404'ü bir "seviye sonu"
   gibi: piksel sahnede (Codex image_gen, assets-src/generated/
   lost-404.png) feneriyle uçurumun kenarında duran küçük bir kahraman,
   bir sonraki platform yok. Üstünde piksel yazıyla "SEVİYE 404", altında
   yanıp sönen "DEVAM?" ve anasayfaya dönen piksel buton.

   Asıl bilgi (başlık, açıklama) yine okunur düz metin: piksel yazı yalnız
   süs ve aria-hidden. Sayfa başlığı sekmede de "404" diyor.
------------------------------------------------------------------- */

function NotFound({ strings }) {
  const N = strings.notFound;

  useEffect(() => {
    const eski = document.title;
    document.title = `404 — ${N.title} · Arda Güner`;
    return () => {
      document.title = eski;
    };
  }, [N.title]);

  return (
    <main className="page not-found">
      <div className="shell nf-inner">
        <div className="nf-art" aria-hidden="true">
          <img src="/lost/lost.webp" alt="" width="720" height="720" decoding="async" />
          <span className="nf-scan" />
        </div>

        <div className="nf-copy">
          <span className="pixel-tag" aria-hidden="true">
            {N.level}
          </span>
          <h1 className="display nf-title grad-text">{N.title}</h1>
          <p className="lede">{N.desc}</p>
          <span className="nf-continue" aria-hidden="true">
            {N.continue}
          </span>
          <Link to="/" className="pixel-btn">
            <span className="pixel-btn-face">
              <span className="pixel-btn-blink" aria-hidden="true">
                ▶
              </span>
              {N.cta}
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
