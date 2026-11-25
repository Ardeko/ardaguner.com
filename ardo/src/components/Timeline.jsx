import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Reveal from "../Reveal";
import ProjectLinks from "./ProjectLinks";
import KineticTitle from "../motion/KineticTitle";
import { lenisRef } from "../motion/lenis";
import { hassasIsaretci } from "../motion/core";
import { CATEGORIES, groupByYear, chronological, PROJECTS } from "../data/projects";

/* ------------------------------------------------------------------
   Çizelge — katalogdaki projelerin tamamı, yıla göre (v2: İsviçre dizini).

   Eski hâli her projeyi açıklama + etiketler + linklerle tam boy basıyordu;
   24 proje yedi ekran kaydırma demekti ve göz yalnızca yılları
   tarayabiliyordu. Şimdi bir katalog dizini: her proje tek satır, katı bir
   ızgarada — numara · ad · kategori · platform · durum. Satıra tıklayınca
   açıklama, teknolojiler ve linkler satırın altında açılıyor ("Hepsini aç"
   ile hepsi birden). Aynı bilgi, üç ekranda.

   Numara gerçek bir sıra: projenin kronolojik sırası (01 = ilk proje).
   Liste yeniden eskiye aktığı için numaralar aşağı doğru azalıyor.

   Yıl başlığının yanındaki küçük rakam o yılın proje sayısı — 2023'te
   üç, 2026'da on üç; anlatmak istediğimiz büyüme tek bakışta görünüyor.

   Fareyle bir satırın üzerine gelince, projenin görseli varsa imleci
   izleyen küçük bir önizleme beliriyor (yalnız hassas işaretçide).

   Komut paletinden bir proje seçilince ("timeline:open" olayı) filtre
   sıfırlanıyor, satır açılıyor ve sayfa oraya kayıyor.

   Açılan satırın içeriği kapalıyken `inert`: klavye görünmeyen linklere
   girmiyor.
------------------------------------------------------------------- */

const metniAl = (strings, id) => strings.projectItems[id] || { title: id, desc: "" };

// Kronolojik sıra numarası: en eski proje 1.
const SIRA_NO = (() => {
  const eskidenYeniye = [...chronological()].reverse();
  return Object.fromEntries(eskidenYeniye.map((p, i) => [p.id, i + 1]));
})();

function Satir({ p, strings, acik, onToggle, onPreview }) {
  const L = strings.projectLabels;
  const metin = metniAl(strings, p.id);
  const govde = useRef(null);

  useEffect(() => {
    if (govde.current) govde.current.inert = !acik;
  }, [acik]);

  return (
    <li id={`tl-${p.id}`} className={`row${acik ? " is-open" : ""}`}>
      <button
        type="button"
        className="row-head"
        aria-expanded={acik}
        aria-controls={`tl-body-${p.id}`}
        onClick={() => onToggle(p.id)}
        onPointerEnter={() => onPreview(p)}
      >
        <span className="row-no">{String(SIRA_NO[p.id]).padStart(2, "0")}</span>
        <span className="row-title display">{metin.title}</span>
        <span className="row-cat">{L.category[p.category]}</span>
        <span className="row-plat">{p.platforms}</span>
        <span className={`status status-${p.status}`}>{L.status[p.status]}</span>
        <span className="row-plus" aria-hidden="true" />
      </button>

      <div className="row-body" id={`tl-body-${p.id}`} ref={govde}>
        <div className="row-inner">
          <p className="lede entry-desc">{metin.desc}</p>
          <div className="entry-foot">
            {p.tech.length > 0 && (
              <ul className="tech">
                {p.tech.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <ProjectLinks project={p} labels={L.link} restrictedText={strings.projects.restricted} compact />
          </div>
        </div>
      </div>
    </li>
  );
}

function Timeline({ strings, language }) {
  const [filtre, setFiltre] = useState("all");
  const [aciklar, setAciklar] = useState(() => new Set());
  const L = strings.projectLabels;
  const J = strings.journey;

  const hepsi = chronological();
  const suzulmus = filtre === "all" ? hepsi : hepsi.filter((p) => p.category === filtre);
  const yillar = groupByYear(suzulmus);
  const hepsiAcik = suzulmus.length > 0 && suzulmus.every((p) => aciklar.has(p.id));

  const sayilar = CATEGORIES.reduce((acc, c) => {
    acc[c] = hepsi.filter((p) => p.category === c).length;
    return acc;
  }, {});

  const degistir = useCallback((id) => {
    setAciklar((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(id)) yeni.delete(id);
      else yeni.add(id);
      return yeni;
    });
  }, []);

  const tumunu = () => {
    setAciklar(hepsiAcik ? new Set() : new Set(suzulmus.map((p) => p.id)));
  };

  /* --- Filtre göstergesi (kayan hap) --------------------------------- */
  const filtrelerRef = useRef(null);
  const gostergeRef = useRef(null);
  const gostergeKonumla = useCallback(() => {
    const kap = filtrelerRef.current;
    const g = gostergeRef.current;
    if (!kap || !g) return;
    const el = kap.querySelector(".is-on");
    if (!el) return;
    g.style.width = `${el.offsetWidth}px`;
    g.style.height = `${el.offsetHeight}px`;
    g.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
  }, []);
  useLayoutEffect(() => {
    gostergeKonumla();
  }, [filtre, language, gostergeKonumla]);
  useEffect(() => {
    window.addEventListener("resize", gostergeKonumla);
    document.fonts?.ready?.then(gostergeKonumla);
    return () => window.removeEventListener("resize", gostergeKonumla);
  }, [gostergeKonumla]);

  /* --- Komut paletinden "bu projeye git" ----------------------------- */
  useEffect(() => {
    const ac = (e) => {
      const id = e.detail;
      if (!PROJECTS.some((p) => p.id === id)) return;
      setFiltre("all");
      setAciklar((onceki) => new Set(onceki).add(id));
      window.setTimeout(() => {
        const el = document.getElementById(`tl-${id}`);
        if (!el) return;
        if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -140, duration: 1.4, force: true });
        else el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.querySelector(".row-head")?.focus({ preventScroll: true });
      }, 80);
    };
    window.addEventListener("timeline:open", ac);
    return () => window.removeEventListener("timeline:open", ac);
  }, []);

  /* --- İmleci izleyen önizleme --------------------------------------- */
  const onizRef = useRef(null);
  const onizImg = useRef(null);
  const onizDurum = useRef({ x: 0, y: 0, hx: 0, hy: 0, raf: 0, acik: false });
  const listeRef = useRef(null);

  useEffect(() => {
    const kap = listeRef.current;
    const kutu = onizRef.current;
    if (!kap || !kutu || !hassasIsaretci()) return undefined;
    const d = onizDurum.current;

    const ciz = () => {
      d.x += (d.hx - d.x) * 0.16;
      d.y += (d.hy - d.y) * 0.16;
      kutu.style.transform = `translate3d(${d.x.toFixed(1)}px, ${d.y.toFixed(1)}px, 0)`;
      if (d.acik || Math.abs(d.hx - d.x) > 0.5 || Math.abs(d.hy - d.y) > 0.5) d.raf = requestAnimationFrame(ciz);
      else d.raf = 0;
    };
    const hareket = (e) => {
      d.hx = e.clientX + 28;
      d.hy = e.clientY - 90;
      if (!d.raf) d.raf = requestAnimationFrame(ciz);
    };
    const cik = () => {
      d.acik = false;
      kutu.classList.remove("is-on");
    };
    kap.addEventListener("pointermove", hareket, { passive: true });
    kap.addEventListener("pointerleave", cik);
    window.addEventListener("scroll", cik, { passive: true });
    return () => {
      kap.removeEventListener("pointermove", hareket);
      kap.removeEventListener("pointerleave", cik);
      window.removeEventListener("scroll", cik);
      if (d.raf) cancelAnimationFrame(d.raf);
    };
  }, []);

  const onizle = useCallback((p) => {
    const kutu = onizRef.current;
    const img = onizImg.current;
    if (!kutu || !img || !hassasIsaretci()) return;
    if (!p.image) {
      kutu.classList.remove("is-on");
      onizDurum.current.acik = false;
      return;
    }
    if (img.getAttribute("src") !== p.image) img.setAttribute("src", p.image);
    // İlk görünüşte imlecin olduğu yerden başlasın, köşeden süzülmesin.
    if (!onizDurum.current.acik) {
      onizDurum.current.x = onizDurum.current.hx;
      onizDurum.current.y = onizDurum.current.hy;
    }
    onizDurum.current.acik = true;
    kutu.classList.add("is-on");
  }, []);

  return (
    <section className="section journey" id="journey">
      <div className="shell">
        <div className="section-head">
          <div>
            <span className="eyebrow">{J.eyebrow}</span>
            <KineticTitle lead={J.titleLead} accent={J.titleAccent} />
          </div>
          <Reveal as="p" className="lede">
            {J.lede.replace("{n}", hepsi.length)}
          </Reveal>
        </div>

        <Reveal className="tl-bar">
          <div className="filters" role="group" aria-label={J.filterLabel} ref={filtrelerRef}>
            <span className="filters-pill" ref={gostergeRef} aria-hidden="true" />
            <button type="button" className={filtre === "all" ? "is-on" : ""} aria-pressed={filtre === "all"} onClick={() => setFiltre("all")}>
              {J.all} <span>{hepsi.length}</span>
            </button>
            {CATEGORIES.filter((c) => sayilar[c] > 0).map((c) => (
              <button key={c} type="button" className={filtre === c ? "is-on" : ""} aria-pressed={filtre === c} onClick={() => setFiltre(c)}>
                {L.category[c]} <span>{sayilar[c]}</span>
              </button>
            ))}
          </div>
          <button type="button" className="tl-toggle" onClick={tumunu} aria-pressed={hepsiAcik}>
            <span className={`tl-toggle-icon${hepsiAcik ? " is-open" : ""}`} aria-hidden="true" />
            {hepsiAcik ? J.collapseAll : J.expandAll}
          </button>
        </Reveal>

        <div className="years" ref={listeRef}>
          {yillar.map((grup) => (
            <div className="year" key={grup.year}>
              <h3 className="year-label display">
                <span className="grad-text-dim">{grup.year}</span>
                <sup className="year-count">{String(grup.items.length).padStart(2, "0")}</sup>
              </h3>
              <ol className="rows">
                {grup.items.map((p) => (
                  <Satir key={p.id} p={p} strings={strings} acik={aciklar.has(p.id)} onToggle={degistir} onPreview={onizle} />
                ))}
              </ol>
            </div>
          ))}
        </div>

        {suzulmus.length === 0 && <p className="lede">{language === "tr" ? "Bu kategoride proje yok." : "No projects in this category."}</p>}
      </div>

      <div className="tl-preview" ref={onizRef} aria-hidden="true">
        <img ref={onizImg} alt="" decoding="async" />
      </div>
    </section>
  );
}

export default Timeline;
