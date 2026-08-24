import { useEffect, useState } from "react";

/* ------------------------------------------------------------------
   Başa dön.

   Katalog 24 projeye çıktı; çizelgenin dibinden üst çubuğa dönmek
   uzun bir kaydırma. Düğme ilk ekranda görünmüyor, iki ekran boyu
   inildikten sonra beliriyor — hemen orada dururken bir işe yaramaz,
   sadece köşeyi doldurur.

   `scroll-behavior: smooth` html üzerinde zaten tanımlı, ama
   prefers-reduced-motion açıkken index.css onu `auto`ya çeviriyor.
   Bu yüzden burada scrollTo'ya behavior geçmiyoruz: karar tek yerde,
   CSS'te kalıyor.
------------------------------------------------------------------- */

function BackToTop({ label }) {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    const onScroll = () => setGorunur(window.scrollY > window.innerHeight * 2);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${gorunur ? "is-on" : ""}`}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label={label}
      tabIndex={gorunur ? 0 : -1}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default BackToTop;
