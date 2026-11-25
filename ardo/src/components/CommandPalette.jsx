import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { chronological, featuredProjects } from "../data/projects";
import { lenisRef, basaDon } from "../motion/lenis";

/* ------------------------------------------------------------------
   Komut paleti — ⌘K / Ctrl+K (ya da "/").

   Bir yazılımcının portfolyosunda menünün klavyeden kullanılan hâli:
   Raycast / Linear tarzı tek bir arama kutusu.
     Bölümler  — sayfadaki bölüme kayarak git, Code Lab'e geç
     Projeler  — 24 projenin içinde ad, teknoloji, kategori, yıl ile ara;
                 seçince çizelgedeki satırına gidip açıyor
     Eylemler  — dili değiştir, e-postayı kopyala, CV indir, GitHub,
                 LinkedIn, başa dön

   Arama Türkçe karakterlere duyarsız: "ozgecmis" yazınca "Özgeçmiş"
   bulunuyor, "İ/ı" sorunu yok. Boş sorguda yalnız öne çıkan projeler
   listeleniyor; yazınca hepsi aranıyor.

   ERİŞİLEBİLİRLİK
   combobox + listbox deseni: odak hep arama kutusunda, seçili satırı
   aria-activedescendant söylüyor. ↑/↓ gezer, Enter çalıştırır, Esc
   kapatır; kapanınca odak paleti açan düğmeye geri dönüyor. Tab kutudan
   çıkmıyor (modal).
------------------------------------------------------------------- */

const MAIL = "ardaguner2000@gmail.com";

const KATEGORI_IKON = {
  game: "play",
  app: "phone",
  web: "link",
  corporate: "briefcase",
  rnd: "cpu",
};

/** Türkçe duyarsız arama anahtarı: küçük harf + aksan/çengel temizliği. */
const norm = (s) =>
  String(s || "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function ogeler(strings, language) {
  const tr = language === "tr";
  const P = strings.palette;
  const L = strings.projectLabels;

  const bolum = [
    ["about", strings.nav.about],
    ["work", strings.nav.projects],
    ["journey", tr ? "Çizelge" : "Timeline"],
    ["gallery", tr ? "Arşiv" : "Archive"],
    ["studio", tr ? "Stüdyo" : "Studio"],
    ["contact", strings.nav.contact],
  ].map(([id, label]) => ({
    key: `s-${id}`,
    grup: "s",
    icon: "hash",
    label,
    meta: `#${id}`,
    act: { tip: "bolum", id },
  }));
  bolum.push({
    key: "s-codelab",
    grup: "s",
    icon: "code",
    label: "Code Lab",
    meta: "/codelab",
    act: { tip: "rota", to: "/codelab" },
  });

  const oneCikan = new Set(featuredProjects().map((p) => p.id));
  const proje = chronological().map((p) => ({
    key: `p-${p.id}`,
    grup: "p",
    icon: KATEGORI_IKON[p.category] || "box",
    label: strings.projectItems[p.id]?.title || p.id,
    meta: `${L.category[p.category]} · ${p.year}`,
    status: p.status,
    featured: oneCikan.has(p.id),
    ara: [p.tech.join(" "), p.platforms, L.status[p.status]].join(" "),
    act: { tip: "proje", id: p.id },
  }));

  const eylem = [
    { key: "a-lang", icon: "globe", label: P.switchLang, meta: tr ? "EN" : "TR", act: { tip: "dil" } },
    { key: "a-mail", icon: "copy", label: P.copyEmail, meta: MAIL, act: { tip: "kopyala" } },
    { key: "a-cv", icon: "download", label: P.downloadCv, meta: "PDF", act: { tip: "cv" } },
    { key: "a-gh", icon: "github", label: P.openGithub, meta: "github.com/Ardeko", act: { tip: "dis", url: "https://github.com/Ardeko" } },
    {
      key: "a-li",
      icon: "linkedin",
      label: P.openLinkedin,
      meta: "linkedin.com",
      act: { tip: "dis", url: "https://www.linkedin.com/in/arda-g%C3%BCner/" },
    },
    { key: "a-top", icon: "arrowUp", label: P.backToTop, meta: "", act: { tip: "ust" } },
  ].map((o) => ({ ...o, grup: "a" }));

  return [...bolum, ...proje, ...eylem];
}

function CommandPalette({ open, onClose, language, setLanguage, strings }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ana = pathname === "/";
  const P = strings.palette;

  const [takili, setTakili] = useState(false);
  const [gorunur, setGorunur] = useState(false);
  const [sorgu, setSorgu] = useState("");
  const [secili, setSecili] = useState(0);
  const [bildirim, setBildirim] = useState("");
  const girdiRef = useRef(null);
  const listeRef = useRef(null);
  const tetikRef = useRef(null);

  // Aç/kapat: kapanırken animasyon bitene kadar DOM'da kal.
  useEffect(() => {
    if (open) {
      tetikRef.current = document.activeElement;
      setTakili(true);
      setSorgu("");
      setSecili(0);
      setBildirim("");
      return undefined;
    }
    setGorunur(false);
    const t = window.setTimeout(() => setTakili(false), 260);
    if (tetikRef.current && document.contains(tetikRef.current)) {
      tetikRef.current.focus?.({ preventScroll: true });
    }
    return () => window.clearTimeout(t);
  }, [open]);

  /* Odak ve giriş animasyonu AYRI efekt: kutu DOM'a eklendikten sonra
     çalışıyor. Önceden aynı efektin rAF'ında yapılıyordu; takma render'ı
     o kareden sonra geldiğinde kutu henüz yoktu ve odak sayfada kalıyordu
     (Enter, ok tuşları paleti değil sayfayı etkiliyordu). */
  useEffect(() => {
    if (!open || !takili) return undefined;
    girdiRef.current?.focus({ preventScroll: true });
    const r = requestAnimationFrame(() => setGorunur(true));
    return () => cancelAnimationFrame(r);
  }, [open, takili]);

  const tumu = useMemo(() => ogeler(strings, language), [strings, language]);

  const liste = useMemo(() => {
    const parcalar = norm(sorgu.trim()).split(/\s+/).filter(Boolean);
    if (!parcalar.length) return tumu.filter((o) => o.grup !== "p" || o.featured);
    return tumu.filter((o) => {
      const saman = norm(`${o.label} ${o.meta} ${o.ara || ""}`);
      return parcalar.every((p) => saman.includes(p));
    });
  }, [tumu, sorgu]);

  useEffect(() => setSecili(0), [sorgu]);

  useEffect(() => {
    listeRef.current?.querySelector(`[data-i="${secili}"]`)?.scrollIntoView({ block: "nearest" });
  }, [secili]);

  const git = (hash) => {
    if (!ana) {
      window.location.assign(`/${hash}`);
      return;
    }
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { force: true, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const calistir = (o) => {
    const a = o.act;
    switch (a.tip) {
      case "bolum":
        onClose();
        git(`#${a.id}`);
        break;
      case "rota":
        onClose();
        navigate(a.to);
        break;
      case "proje":
        onClose();
        if (ana) window.dispatchEvent(new CustomEvent("timeline:open", { detail: a.id }));
        else window.location.assign("/#journey");
        break;
      case "dil":
        setLanguage(language === "tr" ? "en" : "tr");
        onClose();
        break;
      case "kopyala":
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(MAIL)
            .then(() => {
              setBildirim(P.copied);
              window.setTimeout(onClose, 900);
            })
            .catch(() => {
              window.location.href = `mailto:${MAIL}`;
            });
        } else {
          window.location.href = `mailto:${MAIL}`;
        }
        break;
      case "cv":
        onClose();
        window.open(language === "tr" ? "/files/arda-guner-cv-tr.pdf" : "/files/arda-guner-cv-en.pdf", "_blank", "noopener");
        break;
      case "dis":
        onClose();
        window.open(a.url, "_blank", "noopener,noreferrer");
        break;
      case "ust":
        onClose();
        basaDon();
        break;
      default:
        break;
    }
  };

  const tus = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSecili((s) => (liste.length ? (s + 1) % liste.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSecili((s) => (liste.length ? (s - 1 + liste.length) % liste.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (liste[secili]) calistir(liste[secili]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  if (!takili) return null;

  const basliklar = { s: P.sections, p: sorgu.trim() ? P.projects : P.featured, a: P.actions };
  let sira = 0;
  const gruplar = ["s", "p", "a"]
    .map((g) => ({ g, items: liste.filter((o) => o.grup === g) }))
    .filter((x) => x.items.length);

  const aktifOge = liste[secili];

  return (
    <div className={`cmdk-root${gorunur ? " is-open" : ""}`}>
      <div className="cmdk-scrim" onClick={onClose} aria-hidden="true" />
      <div className="cmdk" role="dialog" aria-modal="true" aria-label={P.title}>
        <div className="cmdk-head">
          <Icon name="search" size={18} />
          <input
            ref={girdiRef}
            className="cmdk-input"
            value={sorgu}
            onChange={(e) => setSorgu(e.target.value)}
            onKeyDown={tus}
            placeholder={P.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-liste"
            aria-autocomplete="list"
            aria-activedescendant={aktifOge ? `cmdk-${aktifOge.key}` : undefined}
            spellCheck="false"
            autoComplete="off"
          />
          <button type="button" className="cmdk-esc" onClick={onClose}>
            esc
          </button>
        </div>

        <div className="cmdk-list" id="cmdk-liste" role="listbox" ref={listeRef} aria-label={P.title} data-lenis-prevent>
          {gruplar.map(({ g, items }) => (
            <div role="group" aria-labelledby={`cmdk-g-${g}`} key={g}>
              <div className="cmdk-group" id={`cmdk-g-${g}`}>
                {basliklar[g]}
              </div>
              {items.map((o) => {
                const i = sira++;
                return (
                  <div
                    key={o.key}
                    id={`cmdk-${o.key}`}
                    role="option"
                    aria-selected={i === secili}
                    data-i={i}
                    className={`cmdk-item${i === secili ? " is-active" : ""}`}
                    onMouseMove={() => i !== secili && setSecili(i)}
                    onClick={() => calistir(o)}
                  >
                    <span className="cmdk-icon">
                      <Icon name={o.icon} size={16} />
                    </span>
                    <span className="cmdk-label">
                      {o.label}
                      {o.status && <span className={`cmdk-dot status-${o.status}`} aria-hidden="true" />}
                    </span>
                    <span className="cmdk-meta">{o.meta}</span>
                    <span className="cmdk-enter" aria-hidden="true">
                      <Icon name="enter" size={14} />
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
          {!liste.length && <p className="cmdk-empty">{P.empty.replace("{q}", sorgu.trim())}</p>}
        </div>

        <div className="cmdk-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {P.navigate}
          </span>
          <span>
            <kbd>↵</kbd> {P.select}
          </span>
          <span>
            <kbd>esc</kbd> {P.close}
          </span>
          <span className={`cmdk-toast${bildirim ? " is-on" : ""}`} role="status">
            {bildirim}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
