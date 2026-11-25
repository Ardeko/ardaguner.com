import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------
   AuroraField — Backdrop'un "aurora" zemini (WebGL, paketsiz).

   NE ÇİZİYOR
   İki kat kuzey ışığı perdesi: alt kenarı keskin ve parlak, yukarı
   doğru uzun ve yumuşak sönen; içinde dikey ışınlar. Perdenin çizgisi
   ve ışınlar simplex gürültüsüyle (fbm) bükülüyor, yani desen kendini
   tekrar etmiyor. İmlecin yakını bir tık parlıyor ve perde ona doğru
   hafifçe kabarıyor.

   Renk tek bir ailenin üç tonu: soldan sağa derin camgöbeği → aksan
   mavisi (#89aacc) → soluk mor. Kuzey ışığının doğal renkleri; metin
   ve butonlar yine tek renkli, renk yalnızca bu katmanda.

   NE ZAMAN PARLIYOR
   Işık sayfanın iki ucunda: hero'da tam, ilk ekrandan sonra sönüyor,
   iletişim bölümüne yaklaşınca yeniden beliriyor. Aradaki okuma alanı
   (Hakkımda, çizelge) sakin OLED siyahı kalıyor. Işık sıfırdayken kare
   hiç çizilmiyor — GPU boşta.

   MALİYET
   Ekran çözünürlüğünün üçte biriyle çiziliyor, CSS büyütüyor (alan
   zaten bulanık, keskinlik kaybı görünmüyor). En fazla 30 kare/sn.
   Sekme arka plandayken rAF zaten durur.

   YEDEKLER
   WebGL yoksa ya da shader derlenemezse onFail çağrılıyor; Backdrop
   eski 2D DriftField'a dönüyor. Hareket azaltıldığında tek kare.
------------------------------------------------------------------- */

const OLCEK = 0.34;
const FPS = 30;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/* Simplex gürültü: Ashima Arts / Ian McEwan (MIT). */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uFade;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float t = uTime;

  vec2 m = vec2(uMouse.x * asp, 1.0 - uMouse.y);
  float near = exp(-2.4 * length(p - m));

  // Birinci perde
  float w1 = fbm(vec2(p.x * 0.55 + t * 0.035, t * 0.02));
  float base1 = 0.6 + 0.13 * w1 + 0.05 * near;
  float r1 = fbm(vec2(p.x * 2.6 + w1 * 1.8 - t * 0.06, p.y * 0.25 + t * 0.03));
  r1 = smoothstep(-0.35, 0.65, r1);
  float d1 = uv.y - base1;
  float c1 = smoothstep(-0.07, 0.0, d1) * exp(-max(d1, 0.0) * 3.0);

  // İkinci, daha alçak ve soluk perde
  float w2 = fbm(vec2(p.x * 0.8 - t * 0.03 + 7.3, t * 0.018 + 3.1));
  float base2 = 0.4 + 0.1 * w2;
  float r2 = fbm(vec2(p.x * 3.4 - w2 * 1.4 + t * 0.05 + 2.0, p.y * 0.3 - t * 0.02));
  r2 = smoothstep(-0.4, 0.7, r2);
  float d2 = uv.y - base2;
  float c2 = smoothstep(-0.05, 0.0, d2) * exp(-max(d2, 0.0) * 4.2);

  float glow = c1 * (0.35 + 0.65 * r1) + 0.5 * c2 * (0.3 + 0.7 * r2);
  glow *= 1.0 + 0.4 * near;
  // Sol yarıda (hero metninin arkası) ışık kısılıyor, sağda (kartlar) tam.
  glow *= 0.5 + 0.5 * smoothstep(0.05, 0.75, uv.x);

  float k = clamp(uv.x + 0.18 * w1, 0.0, 1.0);
  vec3 col = mix(uC1, uC2, smoothstep(0.0, 0.5, k));
  col = mix(col, uC3, smoothstep(0.5, 1.0, k));
  // Perdenin alt kenarı beyaza doğru bir tık ısınıyor.
  col = mix(col, vec3(0.86, 0.92, 1.0), 0.35 * smoothstep(0.035, 0.0, abs(d1)));

  float a = clamp(glow * uFade * 0.55, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}
`;

const RENKLER = {
  uC1: [0.2, 0.52, 0.56], // derin camgöbeği
  uC2: [0.537, 0.667, 0.8], // #89aacc
  uC3: [0.47, 0.42, 0.8], // soluk mor
};

const sinirla = (v) => Math.min(1, Math.max(0, v));
const yumusat = (v) => v * v * (3 - 2 * v);

/** Sayfanın neresindeyiz → ışığın gücü (0..1). */
function isikGucu() {
  const vh = window.innerHeight || 1;
  const y = window.scrollY;
  const toplam = document.documentElement.scrollHeight;
  const ust = 1 - yumusat(sinirla((y - vh * 0.1) / (vh * 1.1)));
  const kalan = toplam - (y + vh); // sayfa sonuna kalan mesafe
  const alt = yumusat(sinirla(1 - kalan / (vh * 1.2))) * 0.85;
  return Math.max(ust, alt);
}

function derle(gl, tur, kaynak) {
  const s = gl.createShader(tur);
  gl.shaderSource(s, kaynak);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function AuroraField({ pointer, onFail }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;

    let gl = null;
    try {
      gl = cv.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      onFail?.();
      return undefined;
    }

    const vs = derle(gl, gl.VERTEX_SHADER, VERT);
    const fs = derle(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      onFail?.();
      return undefined;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      onFail?.();
      return undefined;
    }
    gl.useProgram(prog);

    // Tek üçgen ekranın tamamını örtüyor (iki üçgenli dörtgenden ucuz).
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ["uRes", "uTime", "uMouse", "uFade", "uC1", "uC2", "uC3"].forEach((k) => {
      u[k] = gl.getUniformLocation(prog, k);
    });
    gl.uniform3fv(u.uC1, RENKLER.uC1);
    gl.uniform3fv(u.uC2, RENKLER.uC2);
    gl.uniform3fv(u.uC3, RENKLER.uC3);

    const boyutla = () => {
      const w = Math.max(64, Math.round(window.innerWidth * OLCEK));
      const h = Math.max(64, Math.round(window.innerHeight * OLCEK));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(u.uRes, w, h);
    };
    boyutla();

    let kayip = false;
    const kaybedildi = (e) => {
      e.preventDefault();
      kayip = true;
      onFail?.();
    };
    cv.addEventListener("webglcontextlost", kaybedildi);

    let sonGuc = -1;
    const ciz = (saniye) => {
      const guc = isikGucu();
      if (guc < 0.003 && sonGuc < 0.003) {
        sonGuc = guc;
        return;
      }
      if (guc < 0.003) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        sonGuc = guc;
        return;
      }
      sonGuc = guc;
      const p = pointer?.current || { x: 0.5, y: 0.34 };
      gl.uniform1f(u.uTime, saniye);
      gl.uniform2f(u.uMouse, p.x, p.y);
      gl.uniform1f(u.uFade, guc);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.addEventListener("resize", boyutla);

    if (azalt) {
      // Tek kare; kaydırınca güç değiştiği için kaydırmada yeniden çiz.
      const tekKare = () => ciz(18);
      tekKare();
      window.addEventListener("scroll", tekKare, { passive: true });
      return () => {
        window.removeEventListener("scroll", tekKare);
        window.removeEventListener("resize", boyutla);
        cv.removeEventListener("webglcontextlost", kaybedildi);
      };
    }

    let raf = 0;
    let son = -Infinity;
    const aralik = 1000 / FPS;
    const bas = performance.now();
    const dongu = (simdi) => {
      if (kayip) return;
      if (simdi - son >= aralik) {
        son = simdi;
        ciz((simdi - bas) / 1000 + 8);
      }
      raf = requestAnimationFrame(dongu);
    };
    raf = requestAnimationFrame(dongu);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", boyutla);
      cv.removeEventListener("webglcontextlost", kaybedildi);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [pointer, onFail]);

  return <canvas ref={ref} className="bd-aurora" aria-hidden="true" />;
}

export default AuroraField;
