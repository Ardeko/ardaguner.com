import { useEffect } from "react";
import { hassasIsaretci, azalt } from "./core";

/* ------------------------------------------------------------------
   İmleçle çalışan iki küçük kanca. İkisi de React state'i kullanmıyor:
   her fare hareketinde bileşeni yeniden çizmek yerine CSS değişkeni
   yazıyorlar, boyamanın tamamı CSS'te. Dokunmatikte ve hareket
   azaltıldığında hiç kurulmuyorlar.
------------------------------------------------------------------- */

/**
 * Spotlight — kapsayıcının içindeki `.spot` kartlarına imlecin kart
 * içindeki konumunu yazar (--sx / --sy). Tek dinleyici bütün ızgaraya
 * yetiyor; ışık kenarlıkta kart sınırlarını aşıp komşu karta da
 * düşüyor (Linear/Vercel tarzı "grid spotlight").
 */
export function useSpotlight(ref, selector = ".spot") {
  useEffect(() => {
    const kap = ref.current;
    if (!kap || !hassasIsaretci()) return undefined;
    let raf = 0;
    let ex = 0;
    let ey = 0;

    const boya = () => {
      raf = 0;
      kap.querySelectorAll(selector).forEach((kart) => {
        const r = kart.getBoundingClientRect();
        kart.style.setProperty("--sx", `${(ex - r.left).toFixed(1)}px`);
        kart.style.setProperty("--sy", `${(ey - r.top).toFixed(1)}px`);
      });
    };

    const hareket = (e) => {
      ex = e.clientX;
      ey = e.clientY;
      if (!raf) raf = requestAnimationFrame(boya);
    };

    kap.addEventListener("pointermove", hareket, { passive: true });
    return () => {
      kap.removeEventListener("pointermove", hareket);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, selector]);
}

/**
 * Tilt — elemanı imlece doğru birkaç derece eğer (--rx / --ry) ve
 * parıltı konumunu yazar (--gx / --gy, yüzde). Mekânsal (spatial)
 * derinlik hissi; tıklama hedefi yerinden kaymıyor, yalnız perspektif
 * içinde dönüyor.
 */
export function useTilt(ref, { max = 6 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hassasIsaretci() || azalt()) return undefined;
    let raf = 0;
    let hx = 0;
    let hy = 0;
    let x = 0;
    let y = 0;
    let aktif = false;

    const ciz = () => {
      x += (hx - x) * 0.12;
      y += (hy - y) * 0.12;
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${((x + 1) * 50).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((y + 1) * 50).toFixed(1)}%`);
      if (aktif || Math.abs(hx - x) > 0.002 || Math.abs(hy - y) > 0.002) {
        raf = requestAnimationFrame(ciz);
      } else {
        raf = 0;
      }
    };

    const hareket = (e) => {
      const r = el.getBoundingClientRect();
      hx = ((e.clientX - r.left) / r.width) * 2 - 1;
      hy = ((e.clientY - r.top) / r.height) * 2 - 1;
      aktif = true;
      if (!raf) raf = requestAnimationFrame(ciz);
    };
    const cik = () => {
      hx = 0;
      hy = 0;
      aktif = false;
      if (!raf) raf = requestAnimationFrame(ciz);
    };

    el.addEventListener("pointermove", hareket, { passive: true });
    el.addEventListener("pointerleave", cik);
    return () => {
      el.removeEventListener("pointermove", hareket);
      el.removeEventListener("pointerleave", cik);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, max]);
}
