import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/* ------------------------------------------------------------------
   Hareket çekirdeği — GSAP tek yerden kaydediliyor.

   NEDEN GSAP
   Basit girişler (başlık kelimeleri, kart belirmesi) CSS geçişiyle
   yapılıyor, kütüphane istemiyor. GSAP yalnız CSS'in yapamadığı iki iş
   için var: kaydırmaya bağlı (scrub) hareketler — paralaks, kelime
   kelime dolan metin, siluet çizimi — ve hero'nun açılış zaman çizelgesi
   (perde kalkınca isim, kartlar ve rakamlar tek bir koreografi).

   ScrollTrigger'ın kaydırma ölçümünü Lenis besliyor (SmoothScroll.jsx).
   3.13'ten beri bütün GSAP eklentileri ücretsiz; lisans "Standard
   no-charge", ticari kullanım dahil.
------------------------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobilde adres çubuğu kaybolup belirince viewport yüksekliği değişiyor;
// her seferinde bütün tetikleyicileri yeniden hesaplamak kaydırmayı
// tekletiyordu.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Kullanıcı hareketi azaltmayı istemiş mi? */
export const azalt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fare gibi hassas bir işaretçi var mı? (dokunmatikte hover efekti yok) */
export const hassasIsaretci = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export { gsap, ScrollTrigger, useGSAP };
