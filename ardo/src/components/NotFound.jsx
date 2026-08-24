import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   404.

   Eskiden yakalayıcı rota yoktu: /hakkimda ya da eski bir bağlantı
   girildiğinde React Router hiçbir şey eşleştiremiyor, ziyaretçi üst
   çubuk ile alt bilginin arasında bomboş bir sayfa görüyordu. Hata
   mesajı bile yoktu, sayfa "yükleniyor" gibi duruyordu.

   Sayı için display yazıtipi kullanılıyor — sitedeki her büyük rakam
   (yıl başlıkları, vitrin numaraları) aynı italik serifle basılıyor,
   bu sayfa da o ailenin parçası.
------------------------------------------------------------------- */

function NotFound({ strings }) {
  return (
    <main className="page not-found">
      <div className="shell nf-inner">
        <span className="nf-code display" aria-hidden="true">
          404
        </span>
        <h1 className="display nf-title">{strings.notFound.title}</h1>
        <p className="lede">{strings.notFound.desc}</p>
        <Link to="/" className="btn btn-solid">
          {strings.notFound.cta}
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
