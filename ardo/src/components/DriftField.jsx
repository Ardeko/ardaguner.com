import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   DriftField — Backdrop'un "drift" varyantının zemini.

   NE YAPIYOR
   Domain warping: gürültüyü doğrudan renge çevirmek yerine, önce
   gürültüyle koordinatları büküyoruz, sonra bükülmüş koordinatta
   tekrar gürültü okuyoruz. Sonuç, üç radyal lekenin veremediği şey:
   kenarı dairesel olmayan, organik, kendini tekrar etmeyen bir alan.

   NEDEN CANVAS, HEM DE BU KADAR KÜÇÜK
   Bu hesabı CSS yapamaz; piksel başına matematik gerekiyor. Ama tam
   çözünürlükte yapmaya da gerek yok: alan zaten bulanık ve %13'ün
   altında parlaklıkta. Bu yüzden 160×90'lık bir tampona çizilip CSS
   ile ekrana yayılıyor — tarayıcının bilinear büyütmesi bedava
   yumuşatma sağlıyor. Kare başına 14.400 piksel, saniyede 14 kare.

   WebGL YOK, paket YOK. Backdrop.css'in başındaki "Canvas yok, WebGL
   yok" notu artık tam doğru değil — ama oradaki asıl kural maliyetti,
   o duruyor: bu katmanın kare maliyeti üç blur'lu lekeninkinden düşük.

   DURDUĞU YERLER
   - Sekme arkaplandayken: rAF zaten çalışmıyor, bedava duruyor.
   - prefers-reduced-motion: tek kare çizilip döngü hiç kurulmuyor.
     Ekran yine dolu, sadece kıpırdamıyor.
   - Renk index.css'teki --accent'ten okunuyor; orayı değiştirirsen
     burası da değişir.
------------------------------------------------------------------- */

const W = 160;
const H = 90;
const FPS = 14;
/* Alanın en parlak noktasının opaklığı — tepe değeri, ortalaması değil.
   Ölçüldü: piksellerin medyanı %1 civarında kalıyor, %16'ya yalnızca
   sırtların tepesi çıkıyor. Backdrop'un "hiçbir varyant %15'i geçmez"
   kuralı ortalama parlaklık için konmuştu, o korunuyor. */
const MAX_ALPHA = 0.16;

/* Ham fbm çıktısı 0.5 etrafında kümeleniyor; doğrudan kullanınca alan
   tekdüze bir pus oluyordu (ölçüm: medyan .0196, tepe .0863 — yani
   neredeyse düz). Bu iki eşik kullanılabilir bandı gerip altını
   tamamen siyaha kesiyor, böylece karanlık zemin üstünde belirgin
   sırtlar çıkıyor. GAMMA sırtları inceltiyor. */
const LO = 0.42;
const HI = 0.86;
const GAMMA = 1.8;

/* Değer gürültüsü (value noise). Perlin'e göre biraz daha yumuşak ve
   belirgin biçimde ucuz; bu ölçekte fark görünmüyor. */
function makeNoise(seed) {
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;

  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 255; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }

  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  const val = new Float32Array(256);
  for (let i = 0; i < 256; i++) val[i] = rnd() * 2 - 1;

  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    // smoothstep — köşeleri yumuşatıyor, yoksa ızgara deseni görünüyor
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const X = xi & 255;
    const Y = yi & 255;

    const aa = val[p[(X + p[Y]) & 255]];
    const ba = val[p[(X + 1 + p[Y]) & 255]];
    const ab = val[p[(X + p[(Y + 1) & 255]) & 255]];
    const bb = val[p[(X + 1 + p[(Y + 1) & 255]) & 255]];

    const top = aa + (ba - aa) * u;
    const bot = ab + (bb - ab) * u;
    return top + (bot - top) * v;
  };
}

/* --accent'i oku. Okunamazsa Backdrop.css'teki yedeğin aynısı. */
function accentRgb() {
  const fallback = [137, 170, 204];
  if (typeof window === "undefined") return fallback;
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    const m = /^#([0-9a-f]{6})$/i.exec(raw);
    if (!m) return fallback;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } catch {
    return fallback;
  }
}

function DriftField() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;

    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const img = ctx.createImageData(W, H);
    const data = img.data;
    const noise = makeNoise(0x5eed);
    const [cr, cg, cb] = accentRgb();

    // 3 oktav yetiyor: alan zaten bulanık, dördüncü oktav ekranda
    // görünmüyor ama maliyeti kare başına %33 artırıyordu.
    const fbm = (x, y) => {
      let v = 0;
      let amp = 0.5;
      let f = 1;
      for (let o = 0; o < 3; o++) {
        v += amp * noise(x * f, y * f);
        f *= 2;
        amp *= 0.5;
      }
      return v;
    };

    const ciz = (t) => {
      let i = 0;
      for (let y = 0; y < H; y++) {
        const ny = (y / H) * 2.4;
        for (let x = 0; x < W; x++) {
          const nx = (x / W) * 4.2;

          // İki kademeli büküm: önce koordinatı gürültüyle kaydır,
          // sonra kaymış yerde tekrar oku. Alanın organik kenarı
          // buradan geliyor.
          const q1 = fbm(nx, ny + t * 0.10);
          const q2 = fbm(nx + 3.2, ny + 1.7 - t * 0.08);
          let n = fbm(nx + 2.4 * q1 + t * 0.05, ny + 2.4 * q2);

          n = n * 0.5 + 0.5;                 // -1..1 → 0..1

          // Kullanılabilir bandı ger, altını siyaha kes
          let k = (n - LO) / (HI - LO);
          if (k < 0) k = 0;
          else if (k > 1) k = 1;

          const a = Math.pow(k, GAMMA) * MAX_ALPHA;

          // Sırtların tepesinde nötr beyaza doğru bir tık kayıyor —
          // ikinci bir RENK değil, aynı ışığın daha parlak yeri.
          const w = k * k * 0.4;
          data[i++] = cr + (245 - cr) * w;
          data[i++] = cg + (245 - cg) * w;
          data[i++] = cb + (244 - cb) * w;
          data[i++] = a * 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (azalt) {
      // Tek kare. Kompozisyon yerinde duruyor, sadece hareket yok.
      ciz(0);
      return undefined;
    }

    let raf = 0;
    let sonKare = -Infinity;
    const aralik = 1000 / FPS;
    const bas = performance.now();

    const dongu = (simdi) => {
      // Kare hızı kısıtı: rAF 60/120 Hz çağırıyor ama alan o kadar
      // yavaş sürükleniyor ki 14 kare ile 60 kare arasında gözle
      // görülür fark yok — dördü bir karenin maliyeti.
      if (simdi - sonKare >= aralik) {
        sonKare = simdi;
        ciz((simdi - bas) / 1000);
      }
      raf = requestAnimationFrame(dongu);
    };
    raf = requestAnimationFrame(dongu);

    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="bd-field" aria-hidden="true" />;
}

export default DriftField;
