import Icon from "./Icon";

/* ------------------------------------------------------------------
   Bir projenin link kümesini butonlara çeviren tek yer.

   Hem vitrin hem çizelge bunu kullanıyor; yoksa "github varsa şunu,
   appStore varsa bunu bas" mantığı iki dosyada birden tekrarlanırdı.
   Sıra kasıtlı: önce oynanabilir/canlı olan, sonra indirme, en sonda
   kaynak kodu. Ziyaretçinin ilk göreceği şey en doğrudan eylem olmalı.
------------------------------------------------------------------- */

const SIRA = ["play", "live", "appStore", "googlePlay", "download", "github"];

const IKON = {
  play: "play",
  live: "rocket",
  appStore: "download",
  googlePlay: "download",
  download: "download",
  github: "github",
};

function ProjectLinks({ project, labels, restrictedText, compact = false }) {
  if (project.status === "restricted") {
    return (
      <p className="project-restricted">
        <Icon name="ban" size={15} />
        {restrictedText}
      </p>
    );
  }

  const girdiler = SIRA.filter((k) => project.links?.[k]);
  if (!girdiler.length) return null;

  return (
    <div className={`project-links ${compact ? "is-compact" : ""}`}>
      {girdiler.map((k, i) => {
        const href = project.links[k];
        // Yerel oyunlar aynı sekmede açılmalı değil — tam ekran canvas
        // sayfaları, geri tuşuyla dönmek kötü bir deneyim.
        const dis = href.startsWith("http") || k === "play";
        return (
          <a
            key={k}
            href={href}
            className={`project-link ${i === 0 ? "is-primary" : ""}`}
            {...(dis ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <Icon name={IKON[k]} size={15} />
            {labels[k]}
          </a>
        );
      })}
    </div>
  );
}

export default ProjectLinks;
