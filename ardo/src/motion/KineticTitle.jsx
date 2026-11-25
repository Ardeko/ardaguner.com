import { Fragment, useRef } from "react";
import useInView from "./useInView";

/* ------------------------------------------------------------------
   Kinetik başlık — kelimeler kendi maskelerinin içinden sırayla çıkıyor.

   Kütüphane yok: her kelime iki span (maske + iç), gecikme CSS'te
   `--i` ile hesaplanıyor (index.css → .kt-*). JS'in tek işi başlık
   görünür olunca `is-in` sınıfını eklemek.

   Erişilebilirlik: harf değil KELİME bölündüğü ve kelimeler arasında
   gerçek boşluk karakteri kaldığı için ekran okuyucu başlığı normal
   cümle olarak okuyor; aria-label gerekmiyor. Vurgu kısmı eskisi gibi
   <em class="display"> içinde.

   Prop'lar: lead (düz kısım), accent (italik serif kısım). Biri boş
   olabilir — Arşiv başlığı tek kelime, yalnız accent.
------------------------------------------------------------------- */

const kelimeler = (metin) => (metin ? metin.split(/\s+/).filter(Boolean) : []);

function KineticTitle({ as: Tag = "h2", lead = "", accent = "", className = "", delay = 0, ...rest }) {
  const ref = useRef(null);
  const girdi = useInView(ref, { threshold: 0.35 });

  const duz = kelimeler(lead);
  const vurgu = kelimeler(accent);
  let sira = 0;

  const kelime = (w, k) => (
    <span className="kt-w" key={k}>
      <span className="kt-i" style={{ "--i": sira++ }}>
        {w}
      </span>
    </span>
  );

  return (
    <Tag
      ref={ref}
      className={`kt${girdi ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { "--kt-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {duz.map((w, i) => (
        <Fragment key={`l${i}`}>
          {kelime(w, `l${i}`)}
          {i < duz.length - 1 ? " " : ""}
        </Fragment>
      ))}
      {duz.length > 0 && vurgu.length > 0 ? " " : ""}
      {vurgu.length > 0 && (
        <em className="display">
          {vurgu.map((w, i) => (
            <Fragment key={`a${i}`}>
              {kelime(w, `a${i}`)}
              {i < vurgu.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </em>
      )}
    </Tag>
  );
}

export default KineticTitle;
