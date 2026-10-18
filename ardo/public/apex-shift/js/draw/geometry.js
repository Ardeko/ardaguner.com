/* Pist çizimi — saf geometri. DOM yok; editör, oyun ve ağ aynı fonksiyonları
   kullanıyor ki tahtada görülen pist ile sürülen pist birebir aynı olsun.

   Pist "spec" olarak taşınıyor: noktalar dünyadan bağımsız [0,1] aralığında
   (u: yatay, v: dikey), dünya boyutu ayrı bir alan. Böylece pist boyutunu
   değiştirmek şekli bozmadan sadece ölçeği büyütüyor.

   Yarış motoru (manager/track.js → buildTrack) kontrol noktalarından geçen
   merkezcil Catmull-Rom kuruyor; burada üretilen her şey o motora uygun:
   ilk nokta start/bitiş çizgisi, nokta sırası yarış yönü.                 */
import {buildTrack} from '../manager/track.js';
import {mulberry32} from '../common.js';

/* 30 px yarı genişlik = 12 m yol; araç boyu ~26 px ≈ 5 m. */
export const M_PER_PX=0.2;
export const SIZES={
  s:{W:1000,H:640,name:'Küçük'},
  m:{W:1500,H:960,name:'Orta'},
  l:{W:2100,H:1344,name:'Büyük'},
};
export const THEMES_DRAW={
  grass:{name:'Çimen',icon:'🌲',grip:1},
  desert:{name:'Çöl',icon:'🏜️',grip:.92},
  snow:{name:'Kar',icon:'❄️',grip:.88},
};
export const HW_MIN=20, HW_MAX=44, HW_DEF=30;
export const MAX_PTS=160, MIN_PTS=5;
export const MIN_LEN_PX=1100;          // ~220 m: daha kısası tek bir viraj
const NAME_MAX=24;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);

/* ── temel poligon işlemleri ─────────────────────────────────────────── */
export function polyLength(pts,closed){
  let L=0;
  for(let i=1;i<pts.length;i++) L+=dist(pts[i-1],pts[i]);
  if(closed&&pts.length>1) L+=dist(pts[pts.length-1],pts[0]);
  return L;
}
/* Eşit aralıklı yeniden örnekleme. İlk nokta korunur. */
export function resample(pts,spacing,closed){
  const src=closed?pts.concat([pts[0]]):pts.slice();
  const out=[src[0].slice()];
  let carry=0;
  for(let i=1;i<src.length;i++){
    const a=src[i-1],b=src[i],seg=dist(a,b);
    if(seg<1e-9) continue;
    let d=spacing-carry;
    while(d<=seg){
      const t=d/seg;
      out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
      d+=spacing;
    }
    carry=seg-(d-spacing);
  }
  // kapalıda son nokta başa çok yakınsa at: dikiş yerinde çift nokta olmasın
  if(closed&&out.length>2&&dist(out[out.length-1],out[0])<spacing*0.5) out.pop();
  return out;
}
/* Halka üzerinde hareketli ortalama (kapalı). */
export function smoothRing(pts,r,passes){
  let cur=pts;
  for(let p=0;p<(passes||1);p++){
    const n=cur.length,out=new Array(n);
    for(let i=0;i<n;i++){
      let sx=0,sy=0;
      for(let k=-r;k<=r;k++){ const q=cur[(i+k+n)%n]; sx+=q[0]; sy+=q[1]; }
      out[i]=[sx/(2*r+1),sy/(2*r+1)];
    }
    cur=out;
  }
  return cur;
}
/* Ramer–Douglas–Peucker, açık çizgi. */
function rdp(pts,eps){
  if(pts.length<3) return pts.slice();
  const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1;
  const stack=[[0,pts.length-1]];
  while(stack.length){
    const [a,b]=stack.pop();
    const A=pts[a],B=pts[b],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy)||1e-9;
    let best=-1,bd=0;
    for(let i=a+1;i<b;i++){
      const d=Math.abs((pts[i][0]-A[0])*dy-(pts[i][1]-A[1])*dx)/L;
      if(d>bd){ bd=d; best=i; }
    }
    if(best>0&&bd>eps){ keep[best]=1; stack.push([a,best],[best,b]); }
  }
  return pts.filter((_,i)=>keep[i]);
}
/* Kapalı halkayı ilk noktası sabit kalacak şekilde sadeleştir. */
function rdpClosed(pts,eps){
  if(pts.length<6) return pts.slice();
  // halkayı en uzaktaki noktadan ikiye böl, iki yarıyı ayrı sadeleştir
  let far=1,fd=0;
  for(let i=1;i<pts.length;i++){ const d=dist(pts[0],pts[i]); if(d>fd){ fd=d; far=i; } }
  const a=rdp(pts.slice(0,far+1),eps);
  const b=rdp(pts.slice(far).concat([pts[0]]),eps);
  return a.concat(b.slice(1,-1));
}

/* ── dünya ↔ normalize ───────────────────────────────────────────────── */
export function sizeOf(spec){ return SIZES[spec.size]||SIZES.m; }
export function toWorld(spec){
  const {W,H}=sizeOf(spec);
  return spec.pts.map(p=>[p[0]*W,p[1]*H]);
}
export function toNorm(ptsW,size){
  const {W,H}=SIZES[size]||SIZES.m;
  return ptsW.map(p=>[clamp(p[0]/W,0,1),clamp(p[1]/H,0,1)]);
}
/* Yol + bariyer dünyanın kenarına taşmasın. */
export function marginPx(hw){ return hw+34; }

/* Dünyadaki noktaları kenar payının içine sığdır (gerekirse merkeze doğru ölçekle). */
export function fitInside(ptsW,W,H,hw){
  const m=marginPx(hw);
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const p of ptsW){ x0=Math.min(x0,p[0]); y0=Math.min(y0,p[1]); x1=Math.max(x1,p[0]); y1=Math.max(y1,p[1]); }
  const bw=x1-x0||1,bh=y1-y0||1;
  const s=Math.min(1,(W-2*m)/bw,(H-2*m)/bh);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;
  const tx=clamp(cx,m+bw*s/2,W-m-bw*s/2), ty=clamp(cy,m+bh*s/2,H-m-bh*s/2);
  return ptsW.map(p=>[tx+(p[0]-cx)*s,ty+(p[1]-cy)*s]);
}

/* ── serbest çizim → kontrol noktaları ───────────────────────────────── */
/* smooth: 0 az · 1 normal · 2 çok. Çizimin başladığı yer start, yön yarış yönü. */
const SMOOTH=[{r:2,pass:1,space:44,eps:2.2},{r:4,pass:2,space:62,eps:3},{r:6,pass:3,space:82,eps:4}];
export function strokeToPts(strokeW,smooth){
  const S=SMOOTH[clamp(smooth|0,0,2)];
  if(strokeW.length<4) return null;
  let p=resample(strokeW,7,true);
  if(p.length<12) return null;
  p=smoothRing(p,S.r,S.pass);
  // yumuşatma ilk noktayı da kaydırdı; start yine çizimin başladığı yerde olsun
  let near=0,nd=Infinity;
  for(let i=0;i<p.length;i++){ const d=dist(p[i],strokeW[0]); if(d<nd){ nd=d; near=i; } }
  p=p.slice(near).concat(p.slice(0,near));
  p=resample(p,S.space,true);
  p=rdpClosed(p,S.eps);
  return p.length>=MIN_PTS?p:null;
}

/* ── merkez çizgiyi yeniden örnekleyerek start kaydırma / sadeleştirme ── */
/* Spline'ı yoğun örnekleyip sTarget'tan başlayan yeni kontrol noktaları üretir.
   Catmull-Rom yoğun noktalardan geçtiği için şekil korunuyor.            */
export function rebase(ptsW,sTarget,spacing){
  const trk=buildTrack({pts:ptsW});
  const n=trk.n, step=trk.step;
  const sp=Math.max(step,spacing||56);
  const every=Math.max(1,Math.round(sp/step));
  let i0=Math.round(((sTarget%trk.len)+trk.len)%trk.len/step)%n;
  const out=[];
  for(let k=0;k<n;k+=every){ const i=(i0+k)%n; out.push([trk.xs[i],trk.ys[i]]); }
  // Düzlüklerdeki ara noktaları at: nokta modunda sürüklenecek nokta az olsun.
  // 3 px sapma tahtada görünmüyor; virajlardaki noktalar kalıyor.
  return rdpClosed(out,3);
}
export function reversePts(pts){ return [pts[0]].concat(pts.slice(1).reverse()); }

/* ── analiz: uzunluk, virajlar, düzlükler, kesişmeler ─────────────────── */
const wrapA=a=>{ while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return a; };
export function analyze(ptsW,hw){
  const trk=buildTrack({pts:ptsW});
  const n=trk.n, step=trk.step;
  // eğrilik: ±W örnek üzerinden açı farkı / mesafe, iki kez yumuşatılmış
  const Wn=4, k=new Float32Array(n), sgn=new Int8Array(n);
  for(let i=0;i<n;i++){
    const d=wrapA(trk.ang[(i+Wn)%n]-trk.ang[(i-Wn+n)%n]);
    k[i]=Math.abs(d)/(2*Wn*step); sgn[i]=d>=0?1:-1;
  }
  let ks=k;
  for(let pass=0;pass<2;pass++){
    const o=new Float32Array(n);
    for(let i=0;i<n;i++){ let s=0; for(let q=-3;q<=3;q++) s+=ks[(i+q+n)%n]; o[i]=s/7; }
    ks=o;
  }
  // Virajlar: eğriliği eşiği geçen ve toplamda ~40°'den fazla dönen bölgeler.
  // Eşik geniş tutuldu: ovalin iki ucu ve akıcı pistin uzun virajları da sayılsın.
  const K_CORNER=1/320, K_STRAIGHT=1/650;
  const corners=[];
  let i=0;
  // halkayı bir viraj ortasından başlatmamak için düz bir yerden başla
  let startI=0; for(let q=0;q<n;q++){ if(ks[q]<K_CORNER){ startI=q; break; } }
  let inC=false,cStart=0,turn=0,apex=0,apexK=0;
  for(let c=0;c<=n;c++){
    i=(startI+c)%n;
    const on=ks[i]>=K_CORNER&&c<n;
    if(on&&!inC){ inC=true; cStart=c; turn=0; apexK=0; }
    if(on){ turn+=wrapA(trk.ang[(i+1)%n]-trk.ang[i]); if(ks[i]>apexK){ apexK=ks[i]; apex=i; } }
    if(!on&&inC){
      inC=false;
      if(Math.abs(turn)>=0.7) corners.push({i:apex,turn,k:apexK});
    }
  }
  corners.sort((a,b)=>a.i-b.i);
  // en uzun düzlük
  let best=0,run=0,bestEnd=0;
  for(let c=0;c<2*n;c++){
    const q=c%n;
    if(ks[q]<K_STRAIGHT){ run++; if(run>best&&run<=n){ best=run; bestEnd=q; } } else run=0;
  }
  let kmax=0; for(let q=0;q<n;q++) kmax=Math.max(kmax,ks[q]);
  const cross=findCrossings(trk,hw);
  return {
    trk, n, step, len:trk.len,
    lenM:trk.len*M_PER_PX,
    corners,
    straightM:best*step*M_PER_PX,
    straightMid:((bestEnd-Math.floor(best/2))%n+n)%n,
    tightM:kmax>0?(1/kmax)*M_PER_PX:Infinity,
    crossings:cross.crossings, close:cross.close,
  };
}

/* Merkez çizginin kendini kesmesi (köprü) ve iki ayrı yolun birbirine
   sürtecek kadar yaklaşması (yol karışır). Hücre ızgarasıyla O(n).       */
export function findCrossings(trk,hw){
  const n=trk.n, step=trk.step, xs=trk.xs, ys=trk.ys;
  const CELL=Math.max(24,hw*2);
  const grid=new Map();
  const key=(gx,gy)=>gx*73856093^gy*19349663;
  for(let i=0;i<n;i++){
    const gx=Math.floor(xs[i]/CELL), gy=Math.floor(ys[i]/CELL), kk=key(gx,gy);
    let b=grid.get(kk); if(!b){ b=[]; grid.set(kk,b); } b.push(i);
  }
  const arcGap=(a,b)=>{ const d=Math.abs(a-b); return Math.min(d,n-d)*step; };
  const minArc=Math.max(hw*7,120);
  const crossings=[], close=[];
  const segX=(a,b)=>{
    const a2=(a+1)%n,b2=(b+1)%n;
    const x1=xs[a],y1=ys[a],x2=xs[a2],y2=ys[a2],x3=xs[b],y3=ys[b],x4=xs[b2],y4=ys[b2];
    const d=(x2-x1)*(y4-y3)-(y2-y1)*(x4-x3);
    if(Math.abs(d)<1e-9) return false;
    const t=((x3-x1)*(y4-y3)-(y3-y1)*(x4-x3))/d, u=((x3-x1)*(y2-y1)-(y3-y1)*(x2-x1))/d;
    return t>=0&&t<=1&&u>=0&&u<=1;
  };
  const near2=(hw*2-4)*(hw*2-4);
  for(let i=0;i<n;i++){
    const gx=Math.floor(xs[i]/CELL), gy=Math.floor(ys[i]/CELL);
    for(let ox=-1;ox<=1;ox++) for(let oy=-1;oy<=1;oy++){
      const b=grid.get(key(gx+ox,gy+oy)); if(!b) continue;
      for(const j of b){
        if(j<=i||arcGap(i,j)<minArc) continue;
        if(segX(i,j)) crossings.push({i,j});
        else{
          const dx=xs[i]-xs[j],dy=ys[i]-ys[j];
          if(dx*dx+dy*dy<near2) close.push({i,j});
        }
      }
    }
  }
  // Aynı kesişmenin komşu segmentlerdeki kopyalarını birleştir. Çift sırasız
  // karşılaştırılıyor: start çizgisinin üstündeki bir kesişme (0,j) ve (j',n-1)
  // diye iki farklı sırayla gelebiliyor.
  const same=(o,c,r)=>(arcGap(o.i,c.i)<r&&arcGap(o.j,c.j)<r)||(arcGap(o.i,c.j)<r&&arcGap(o.j,c.i)<r);
  const merge=(list)=>{
    const out=[];
    for(const c of list){
      if(out.some(o=>same(o,c,hw*3))) continue;
      out.push(c);
    }
    return out;
  };
  const cr=merge(crossings);
  // kesişmenin hemen yanındaki "yakınlık"lar köprünün kendisi: ayrı uyarı verme
  const cl=merge(close).filter(c=>!cr.some(o=>same(o,c,hw*5)));
  return {crossings:cr, close:cl};
}

/* ── hazır pist üreteci ──────────────────────────────────────────────── */
/* Dünya 1000×640 çerçevesinde üretilir, sonra normalize edilir. */
const GW=1000, GH=640;
function polarTrack(rng,o){
  const n=o.n[0]+Math.floor(rng()*(o.n[1]-o.n[0]+1));
  const cx=GW/2, cy=GH/2, rx=GW*0.4, ry=GH*0.39;
  const phase=rng()*Math.PI*2;
  const pts=[];
  const r=new Array(n);
  for(let i=0;i<n;i++) r[i]=1-o.amp*rng();
  // saç tokası: bir noktayı içeri çek, komşularını hafif dışarı it
  const dents=o.dents[0]+Math.floor(rng()*(o.dents[1]-o.dents[0]+1));
  for(let d=0;d<dents;d++){
    const i=Math.floor(rng()*n);
    r[i]=Math.max(0.26,r[i]-o.depth*(0.7+rng()*0.5));
    r[(i+1)%n]=Math.min(1,r[(i+1)%n]+0.08); r[(i-1+n)%n]=Math.min(1,r[(i-1+n)%n]+0.08);
  }
  for(let i=0;i<n;i++){
    const t=phase+(i+(rng()-.5)*o.jit)/n*Math.PI*2;
    pts.push([cx+Math.cos(t)*rx*r[i],cy+Math.sin(t)*ry*r[i]]);
  }
  // düzlükler: rastgele birkaç noktayı at, aradaki yol düzleşir
  const drop=Math.floor(n*(o.drop||0));
  for(let d=0;d<drop&&pts.length>7;d++) pts.splice(Math.floor(rng()*pts.length),1);
  return pts;
}
function ovalTrack(rng){
  const n=20, k=0.66+rng()*0.22, bulge=rng()<0.5?0:40+rng()*60;
  const a=GW*(0.36+rng()*0.06), b=GH*(0.27+rng()*0.08);
  const f=(u,e)=>Math.sign(u)*Math.pow(Math.abs(u),e);
  const pts=[];
  for(let i=0;i<n;i++){
    const t=i/n*Math.PI*2;
    let y=GH/2+b*f(Math.cos(t),k);
    if(bulge) y+=bulge*Math.pow(Math.max(0,Math.cos(t)),4);
    pts.push([GW/2+a*f(Math.sin(t),k),y]);
  }
  return pts;
}
/* Sokak pisti: x boyunca tekdüze dik açılı bir poligon (üst ve alt sınır
   basamak basamak), köşeler yuvarlatılmış. Kendini kesemez.            */
function streetTrack(rng){
  const cols=5+Math.floor(rng()*3), rows=6;
  const cw=GW*0.8/cols, rh=GH*0.78/rows, x0=GW*0.1, y0=GH*0.11;
  const top=[],bot=[];
  for(let c=0;c<cols;c++){
    let t=Math.floor(rng()*3), b=rows-Math.floor(rng()*3);
    if(c>0&&rng()<0.45){ t=top[c-1]; }
    if(c>0&&rng()<0.45){ b=bot[c-1]; }
    if(b-t<2){ t=Math.max(0,b-2); }
    top.push(t); bot.push(b);
  }
  const corners=[];
  // üst sınır soldan sağa
  for(let c=0;c<cols;c++){
    const yx=y0+top[c]*rh;
    if(c===0) corners.push([x0,yx]);
    else if(top[c]!==top[c-1]){ corners.push([x0+c*cw,y0+top[c-1]*rh]); corners.push([x0+c*cw,yx]); }
  }
  corners.push([x0+cols*cw,y0+top[cols-1]*rh]);
  // alt sınır sağdan sola
  for(let c=cols-1;c>=0;c--){
    const yx=y0+bot[c]*rh;
    if(c===cols-1) corners.push([x0+cols*cw,yx]);
    else if(bot[c]!==bot[c+1]){ corners.push([x0+(c+1)*cw,y0+bot[c+1]*rh]); corners.push([x0+(c+1)*cw,yx]); }
  }
  corners.push([x0,y0+bot[0]*rh]);
  // aynı doğrultudaki ara noktaları at
  const clean=[];
  for(let i=0;i<corners.length;i++){
    const p=corners[(i-1+corners.length)%corners.length],c=corners[i],q=corners[(i+1)%corners.length];
    const cr=(c[0]-p[0])*(q[1]-c[1])-(c[1]-p[1])*(q[0]-c[0]);
    if(Math.abs(cr)>1e-6&&dist(p,c)>1&&dist(c,q)>1) clean.push(c);
  }
  // köşe yuvarlatma: her köşeyi iki kenara R kadar kesip arasına yay noktası koy
  const out=[];
  for(let i=0;i<clean.length;i++){
    const p=clean[(i-1+clean.length)%clean.length],c=clean[i],q=clean[(i+1)%clean.length];
    const R=Math.min(36,dist(p,c)*0.42,dist(c,q)*0.42);
    const a=[c[0]+(p[0]-c[0])/dist(p,c)*R,c[1]+(p[1]-c[1])/dist(p,c)*R];
    const b=[c[0]+(q[0]-c[0])/dist(c,q)*R,c[1]+(q[1]-c[1])/dist(c,q)*R];
    out.push(a,[(a[0]+b[0])/2*0.6+c[0]*0.4,(a[1]+b[1])/2*0.6+c[1]*0.4],b);
  }
  return out;
}
export const GENERATORS={
  gp:{name:'Grand Prix',make:r=>polarTrack(r,{n:[12,15],amp:.42,dents:[1,2],depth:.42,jit:.5,drop:.25})},
  akici:{name:'Akıcı',make:r=>polarTrack(r,{n:[7,9],amp:.26,dents:[0,0],depth:0,jit:.35})},
  teknik:{name:'Teknik',make:r=>polarTrack(r,{n:[16,19],amp:.48,dents:[2,3],depth:.36,jit:.4,drop:.1})},
  sokak:{name:'Sokak',make:streetTrack},
  oval:{name:'Oval',make:ovalTrack},
  kart:{name:'Kart',make:r=>polarTrack(r,{n:[14,18],amp:.55,dents:[2,3],depth:.4,jit:.45})},
};
/* Üret: spec döndürür (start çizgisi en uzun düzlüğün ortasına konur). */
export function generate(style,seed,base){
  const g=GENERATORS[style]||GENERATORS.gp;
  const rng=mulberry32((seed>>>0)||1);
  const size=style==='kart'?'s':(base&&base.size)||'m';
  const hw=style==='kart'?24:style==='oval'?36:(base&&base.hw)||HW_DEF;
  const {W,H}=SIZES[size];
  // 1000×640 çerçeveden seçilen dünyaya taşı
  let ptsW=g.make(rng).map(p=>[p[0]/GW*W,p[1]/GH*H]);
  ptsW=fitInside(ptsW,W,H,hw);
  let an=analyze(ptsW,hw);
  // Yol yarı genişliğinden dar viraj yolun iç kenarını kendi üstüne katlıyor.
  // Reddetmek yerine gevşet: yoğun örnekleyip yumuşat, viraj açılana dek.
  const tightMin=hw*M_PER_PX*0.8;
  for(let pass=0;pass<8&&an.tightM<tightMin;pass++){
    ptsW=fitInside(resample(smoothRing(resample(ptsW,24,true),3,2),48,true),W,H,hw);
    an=analyze(ptsW,hw);
  }
  if(an.tightM<tightMin) return null;
  if(an.crossings.length||an.close.length) return null;   // üretici kendini kesmesin
  ptsW=rebase(ptsW,an.straightMid*an.step,64);
  return {v:1,name:g.name+' '+(1+(seed%97)),size,hw,theme:(base&&base.theme)||'grass',laps:3,pts:toNorm(ptsW,size)};
}

/* ── kimlik ve paylaşım kodu ─────────────────────────────────────────── */
/* FNV-1a: aynı pist her cihazda aynı anahtarı verir (en iyi tur ve hayalet
   bu anahtarla saklanıyor; iki kişi aynı pisti çizerse aynı rekor).      */
export function trackKey(spec){
  let h=0x811c9dc5;
  const feed=v=>{ h^=v&0xff; h=Math.imul(h,16777619); h^=(v>>8)&0xff; h=Math.imul(h,16777619); };
  feed(spec.size==='s'?1:spec.size==='l'?3:2); feed(spec.hw|0);
  for(const p of spec.pts){ feed(Math.round(p[0]*4095)); feed(Math.round(p[1]*4095)); }
  return 'c'+(h>>>0).toString(36);
}
const THEME_IDS=['grass','desert','snow'], SIZE_IDS=['s','m','l'];
const b64u={
  enc(bytes){ let s=''; for(const b of bytes) s+=String.fromCharCode(b); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); },
  dec(str){ const s=atob(str.replace(/-/g,'+').replace(/_/g,'/')); const out=new Uint8Array(s.length); for(let i=0;i<s.length;i++) out[i]=s.charCodeAt(i); return out; },
};
/* Biçim (v1): [1][boyut][hw][tema][tur][n][ad uzunluğu][ad UTF-8...][nokta: 12+12 bit = 3 bayt]. */
export function encodeSpec(spec){
  const name=new TextEncoder().encode(String(spec.name||'').slice(0,NAME_MAX)).slice(0,60);
  const n=Math.min(MAX_PTS,spec.pts.length);
  const bytes=new Uint8Array(7+name.length+n*3);
  let o=0;
  bytes[o++]=1;
  bytes[o++]=Math.max(0,SIZE_IDS.indexOf(spec.size));
  bytes[o++]=clamp(spec.hw|0,HW_MIN,HW_MAX);
  bytes[o++]=Math.max(0,THEME_IDS.indexOf(spec.theme));
  bytes[o++]=clamp(spec.laps|0,1,20);
  bytes[o++]=n;
  bytes[o++]=name.length;
  bytes.set(name,o); o+=name.length;
  for(let i=0;i<n;i++){
    const u=clamp(Math.round(spec.pts[i][0]*4095),0,4095), v=clamp(Math.round(spec.pts[i][1]*4095),0,4095);
    bytes[o++]=u>>4; bytes[o++]=((u&15)<<4)|(v>>8); bytes[o++]=v&255;
  }
  return b64u.enc(bytes);
}
/* Güvenilmeyen girdi (link, ağ). Bozuksa null. */
export function decodeSpec(str){
  try{
    if(typeof str!=='string'||str.length>1200||!/^[A-Za-z0-9_-]+$/.test(str)) return null;
    const b=b64u.dec(str);
    if(b.length<7||b[0]!==1) return null;
    let o=1;
    const size=SIZE_IDS[b[o++]], hw=b[o++], theme=THEME_IDS[b[o++]], laps=b[o++], n=b[o++], nl=b[o++];
    if(!size||!theme||n<MIN_PTS||n>MAX_PTS||b.length!==7+nl+n*3) return null;
    const name=new TextDecoder().decode(b.slice(o,o+nl)); o+=nl;
    const pts=[];
    for(let i=0;i<n;i++){
      const u=(b[o]<<4)|(b[o+1]>>4), v=((b[o+1]&15)<<8)|b[o+2]; o+=3;
      pts.push([u/4095,v/4095]);
    }
    return sanitizeSpec({v:1,name,size,hw,theme,laps,pts});
  }catch(e){ return null; }
}
export function cleanName(s){
  return String(s||'').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,NAME_MAX);
}
export function sanitizeSpec(o){
  if(!o||typeof o!=='object'||!Array.isArray(o.pts)) return null;
  const pts=[];
  for(const p of o.pts.slice(0,MAX_PTS)){
    if(!Array.isArray(p)) return null;
    const u=Number(p[0]),v=Number(p[1]);
    if(!isFinite(u)||!isFinite(v)) return null;
    pts.push([clamp(u,0,1),clamp(v,0,1)]);
  }
  if(pts.length<MIN_PTS) return null;
  const size=SIZE_IDS.includes(o.size)?o.size:'m';
  const spec={v:1,name:cleanName(o.name)||'Çizdiğim Pist',size,
    hw:clamp(Math.round(Number(o.hw)||HW_DEF),HW_MIN,HW_MAX),
    theme:THEME_IDS.includes(o.theme)?o.theme:'grass',
    laps:clamp(Math.round(Number(o.laps)||3),1,20),pts};
  if(polyLength(toWorld(spec),true)<MIN_LEN_PX*0.6) return null;
  return spec;
}

/* Online motorunun beklediği pist tanımı. */
export function specToDef(spec){
  const {W,H}=sizeOf(spec);
  const th=THEMES_DRAW[spec.theme]||THEMES_DRAW.grass;
  const key=trackKey(spec);
  let seed=0; for(let i=0;i<key.length;i++) seed=(seed*31+key.charCodeAt(i))>>>0;
  return {id:'custom',custom:true,key,name:spec.name,icon:'✏️',theme:spec.theme,grip:th.grip,
    seed:seed||3,W,H,hw:spec.hw,laps:spec.laps,zoom:1,sub:'Çizdiğin pist',
    pts:toWorld(spec)};
}
