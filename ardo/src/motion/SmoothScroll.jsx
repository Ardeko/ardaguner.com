import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, azalt } from "./core";
import { lenisRef } from "./lenis";

/* ------------------------------------------------------------------
   Yumuşak kaydırma (Lenis) + ScrollTrigger senkronu.

   Lenis tarayıcının kendi kaydırmasını kaldırmıyor; pencere hâlâ gerçekten
   kayıyor, yalnız tekerlek adımları ara değerle yumuşatılıyor. Bu yüzden
   position: sticky, çapa linkleri ve klavyeyle kaydırma bozulmuyor.
   Dokunmatikte (syncTouch kapalı) telefonun kendi ataleti aynen kalıyor.

   KAPANDIĞI YERLER
   - prefers-reduced-motion: hiç kurulmuyor.
   - /codelab: Monaco editörünün kendi kaydırması var; tekerleği Lenis
     yakalarsa editörün içinde kaydırmak sayfayı kaydırıyordu.

   Lenis örneği modül düzeyinde tutuluyor (lenis.js → lenisRef): mobil
   menü açılınca durdurmak ve "başa dön" düğmesi için.
------------------------------------------------------------------- */

function SmoothScroll() {
  const { pathname } = useLocation();
  const ilk = useRef(true);

  // Rota değişince başa dön. İlk yüklemede DEĞİL: tarayıcı yenilemede
  // kaldığın yeri geri getiriyor, onu ezmemek gerekiyor. Hash varsa
  // (/#work gibi) çapa kendi yerine gidiyor.
  useEffect(() => {
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (azalt() || pathname === "/codelab") return undefined;

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      anchors: true,
      autoRaf: false,
      stopInertiaOnNavigate: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tik = (zaman) => lenis.raf(zaman * 1000);
    gsap.ticker.add(tik);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tik);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  // İçerik yüksekliği sonradan değişiyor (tembel görseller, çizelge
  // filtresi, açılan satırlar). ScrollTrigger başlangıç/bitiş noktalarını
  // sayfa ilk ölçüldüğünde hesaplıyor; tazelenmezse paralaks ve dolan
  // metin yanlış yerde tetikleniyor.
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    let zamanlayici = 0;
    let sonYukseklik = document.body.scrollHeight;
    const gozlemci = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - sonYukseklik) < 2) return;
      sonYukseklik = h;
      window.clearTimeout(zamanlayici);
      zamanlayici = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    gozlemci.observe(document.body);
    return () => {
      gozlemci.disconnect();
      window.clearTimeout(zamanlayici);
    };
  }, []);

  return null;
}

export default SmoothScroll;
