/* Menajer modu pistleri. Kontrol noktalarından kapalı bir spline kurulur, eşit aralıklarla
   örneklenir; viraj eğriliğinden bir hız limiti profili çıkarılır. Zemin bir kez çizilip
   önbelleğe alınır, her karede sadece arabalar çizilir. */
import {drawTree,mulberry32} from '../common.js';

export const MW=1000, MH=640, HW=30;
export const GRID_FRONT=16, GRID_GAP=26, GRID_LANE=16;
const STEP=3, LAT=250, PROF_BRAKE=260, VCAP=700;

export const THEMES={
  grass:{bg:'#2d5a26',tex:'rgba(255,255,255,.028)',shoulder:'#b9a676',curbA:'#c9402c',curbB:'#ece8dc',edge:'#57554c',road:'#3a3934',
    speck:['rgba(0,0,0,.10)','rgba(255,255,255,.05)'],line:'rgba(238,230,218,.2)',deco:'tree'},
  desert:{bg:'#c99352',tex:'rgba(120,70,20,.07)',shoulder:'#a9743f',curbA:'#b5452c',curbB:'#eadcc0',edge:'#7a4c2a',road:'#94623a',
    speck:['rgba(60,30,10,.16)','rgba(255,230,190,.10)'],line:null,ruts:'rgba(60,32,14,.22)',deco:'cactus'},
  snow:{bg:'#dde6ee',tex:'rgba(150,175,200,.10)',shoulder:'#aebccb',curbA:'#2f6fd6',curbB:'#f4f6f8',edge:'#5a6069',road:'#3c4048',
    speck:['rgba(0,0,0,.12)','rgba(255,255,255,.08)'],line:'rgba(240,244,248,.24)',deco:'pine'},
};

/* İlk nokta start/bitiş çizgisi; ondan önceki nokta aynı düzlükte olmalı (grid oraya dizilir). */
export const TRACKS=[
  {id:'vadi',name:'Yeşil Vadi',theme:'grass',grip:1,seed:11,
   pts:[[520,548],[780,540],[880,490],[905,400],[850,330],[760,305],[735,225],[800,150],[760,80],[630,75],[545,150],[545,260],[470,320],[370,300],[340,215],[300,130],[200,95],[115,150],[100,260],[160,330],[120,430],[210,535]],
   stand:{x:330,y:598,w:380,h:30}, pond:{x:640,y:432,rx:70,ry:30}},
  {id:'col',name:'Çöl Rallisi',theme:'desert',grip:.92,seed:23,
   pts:[[480,575],[800,565],[900,500],[870,410],[720,395],[520,395],[400,350],[410,270],[520,230],[760,240],[880,190],[870,95],[720,60],[480,65],[250,70],[120,115],[95,230],[190,300],[215,390],[130,460],[180,560]],
   stand:{x:450,y:455,w:250,h:30}},
  {id:'kar',name:'Kar Kupası',theme:'snow',grip:.88,seed:37,
   pts:[[520,560],[820,540],[915,440],[890,320],[770,270],[650,300],[560,380],[450,370],[395,290],[460,205],[620,165],[790,125],[775,60],[560,55],[330,60],[160,85],[85,190],[120,310],[95,430],[200,545]],
   stand:{x:420,y:445,w:260,h:30}},
];

const wrapA=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};

/* Merkezcil Catmull-Rom: düzensiz aralıklı noktalarda kıvrılma/düğüm yapmaz. */
function catmullClosed(pts,steps){
  const out=[], n=pts.length;
  const d=(a,b)=>Math.pow(Math.hypot(b[0]-a[0],b[1]-a[1]),.5)||1e-4;
  const mix=(a,b,wa,wb)=>[a[0]*wa+b[0]*wb,a[1]*wa+b[1]*wb];
  for(let i=0;i<n;i++){
    const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    const t0=0,t1=t0+d(p0,p1),t2=t1+d(p1,p2),t3=t2+d(p2,p3);
    for(let k=0;k<steps;k++){
      const t=t1+(t2-t1)*k/steps;
      const A1=mix(p0,p1,(t1-t)/(t1-t0),(t-t0)/(t1-t0));
      const A2=mix(p1,p2,(t2-t)/(t2-t1),(t-t1)/(t2-t1));
      const A3=mix(p2,p3,(t3-t)/(t3-t2),(t-t2)/(t3-t2));
      const B1=mix(A1,A2,(t2-t)/(t2-t0),(t-t0)/(t2-t0));
      const B2=mix(A2,A3,(t3-t)/(t3-t1),(t-t1)/(t3-t1));
      out.push(mix(B1,B2,(t2-t)/(t2-t1),(t-t1)/(t2-t1)));
    }
  }
  return out;
}
function smoothRing(arr,r){
  const n=arr.length, out=new Float32Array(n);
  for(let i=0;i<n;i++){ let s=0; for(let k=-r;k<=r;k++) s+=arr[(i+k+n)%n]; out[i]=s/(2*r+1); }
  return out;
}

export function buildTrack(def){
  const dense=catmullClosed(def.pts,28), m=dense.length;
  const cum=new Float64Array(m+1);
  for(let i=0;i<m;i++){ const a=dense[i],b=dense[(i+1)%m]; cum[i+1]=cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1]); }
  const len=cum[m], n=Math.round(len/STEP), step=len/n;
  const xs=new Float32Array(n),ys=new Float32Array(n),ang=new Float32Array(n),nx=new Float32Array(n),ny=new Float32Array(n);
  let j=0;
  for(let i=0;i<n;i++){
    const d=i*step;
    while(cum[j+1]<d) j++;
    const t=(d-cum[j])/((cum[j+1]-cum[j])||1), a=dense[j], b=dense[(j+1)%m];
    xs[i]=a[0]+(b[0]-a[0])*t; ys[i]=a[1]+(b[1]-a[1])*t;
  }
  for(let i=0;i<n;i++){
    const p=(i-1+n)%n,q=(i+1)%n;
    ang[i]=Math.atan2(ys[q]-ys[p],xs[q]-xs[p]);
    nx[i]=-Math.sin(ang[i]); ny[i]=Math.cos(ang[i]);
  }
  const W=5; let k=new Float32Array(n);
  for(let i=0;i<n;i++) k[i]=Math.abs(wrapA(ang[(i+W)%n]-ang[(i-W+n)%n]))/(2*W*step);
  k=smoothRing(smoothRing(k,6),6);
  const vlim=new Float32Array(n);
  for(let i=0;i<n;i++) vlim[i]=Math.min(VCAP,Math.sqrt(LAT/Math.max(k[i],1e-5)));
  // geriye doğru frenleme geçişi: virajdan önce yavaşlamaya başlanacak mesafeyi profile işler
  for(let pass=0;pass<2;pass++) for(let i=n-1;i>=0;i--){
    const nv=vlim[(i+1)%n]; vlim[i]=Math.min(vlim[i],Math.sqrt(nv*nv+2*PROF_BRAKE*step));
  }
  return {def,theme:THEMES[def.theme],grip:def.grip,n,step,len,xs,ys,ang,nx,ny,vlim};
}

function idx(trk,s){ let i=Math.floor(s/trk.step)%trk.n; return i<0?i+trk.n:i; }
export function limitAt(trk,s){ return trk.vlim[idx(trk,s)]; }
export function sampleAt(trk,s){
  const f=s/trk.step; let i=Math.floor(f); const t=f-i;
  i%=trk.n; if(i<0) i+=trk.n;
  const j=(i+1)%trk.n;
  const a=trk.ang[i]+wrapA(trk.ang[j]-trk.ang[i])*t;
  return {x:trk.xs[i]+(trk.xs[j]-trk.xs[i])*t, y:trk.ys[i]+(trk.ys[j]-trk.ys[i])*t, a, nx:-Math.sin(a), ny:Math.cos(a)};
}
function nearRoad(trk,x,y,r){
  const r2=r*r;
  for(let i=0;i<trk.n;i+=3){ const dx=trk.xs[i]-x,dy=trk.ys[i]-y; if(dx*dx+dy*dy<r2) return true; }
  return false;
}

/* ── zemin çizimi ──────────────────────── */
function drawCactus(c,x,y,s){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(70,35,10,.25)'; c.beginPath(); c.ellipse(4,5,10,5,0,0,Math.PI*2); c.fill();
  c.fillStyle='#3f7a3a'; c.strokeStyle='#2c5a28'; c.lineWidth=1.2;
  const cap=(x0,y0,w,h)=>{ c.beginPath(); c.roundRect?c.roundRect(x0,y0,w,h,w/2):c.rect(x0,y0,w,h); c.fill(); c.stroke(); };
  cap(-3,-14,6,19); cap(-9,-8,4,9); cap(5,-11,4,9); cap(-9,-2,7,3.5); cap(2,-4,7,3.5);
  c.restore();
}
function drawRock(c,x,y,s,col){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(2,3,9,5,0,0,Math.PI*2); c.fill();
  c.fillStyle=col; c.beginPath(); c.moveTo(-8,2); c.lineTo(-5,-5); c.lineTo(2,-7); c.lineTo(8,-2); c.lineTo(6,4); c.lineTo(-4,5); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(-5,-5); c.lineTo(2,-7); c.lineTo(0,-2); c.closePath(); c.fill();
  c.restore();
}
function drawPine(c,x,y,s){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle='rgba(60,80,110,.22)'; c.beginPath(); c.ellipse(4,6,11,5,0,0,Math.PI*2); c.fill();
  c.fillStyle='#5b3a22'; c.fillRect(-1.5,2,3,5);
  [[0,-16,7],[0,-10,9],[0,-3,11]].forEach(([tx,ty,w],i)=>{
    c.fillStyle=i%2?'#1f4a33':'#245a3c';
    c.beginPath(); c.moveTo(tx,ty-7); c.lineTo(tx+w,ty+5); c.lineTo(tx-w,ty+5); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,.85)';
    c.beginPath(); c.moveTo(tx,ty-7); c.lineTo(tx+w*.45,ty-1); c.lineTo(tx-w*.45,ty-1); c.closePath(); c.fill();
  });
  c.restore();
}
function drawStand(c,st,rnd){
  const {x,y,w,h}=st;
  c.fillStyle='rgba(0,0,0,.28)'; c.fillRect(x+4,y+5,w,h);
  c.fillStyle='#8d887a'; c.fillRect(x,y,w,h);
  const crowd=['#e9e6db','#d93c2a','#3aa0ff','#f2b300','#38d39f','#ff6fb0','#2a2a2a','#c792ea'];
  for(let r=0;r<3;r++){
    const y0=y+5+r*((h-8)/3);
    c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x+2,y0+4.5,w-4,1.2);
    for(let px=x+5;px<x+w-5;px+=6.5){
      if(rnd()<.12) continue;
      c.fillStyle=crowd[rnd()*crowd.length|0]; c.beginPath(); c.arc(px,y0+2,2.2,0,Math.PI*2); c.fill();
    }
  }
  c.fillStyle='#c9402c'; c.fillRect(x-4,y-7,w+8,7);
  c.fillStyle='rgba(255,255,255,.55)'; for(let px=x-4;px<x+w+4;px+=16) c.fillRect(px,y-7,8,2);
}

export function paintTrack(trk,dpr){
  const cv=document.createElement('canvas'); cv.width=MW*dpr; cv.height=MH*dpr;
  const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0);
  const th=trk.theme, def=trk.def, rnd=mulberry32(def.seed), {n,xs,ys,nx,ny}=trk;

  c.fillStyle=th.bg; c.fillRect(0,0,MW,MH);
  if(def.theme==='grass'){
    c.save(); c.translate(MW/2,MH/2); c.rotate(Math.PI/8); c.translate(-MW/2,-MH/2);
    c.fillStyle=th.tex; for(let i=-MH;i<MW+MH;i+=44) c.fillRect(i,-MH,22,MH*3);
    c.restore();
  } else {
    for(let i=0;i<70;i++){ c.fillStyle=th.tex; c.beginPath(); c.ellipse(rnd()*MW,rnd()*MH,30+rnd()*70,10+rnd()*22,rnd()*Math.PI,0,Math.PI*2); c.fill(); }
  }
  if(def.pond){
    const p=def.pond;
    c.fillStyle='#b9a676'; c.beginPath(); c.ellipse(p.x,p.y,p.rx+6,p.ry+6,0,0,Math.PI*2); c.fill();
    c.fillStyle='#2f7fc0'; c.beginPath(); c.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(p.x-p.rx*.3,p.y-p.ry*.35,p.rx*.35,p.ry*.18,0,0,Math.PI*2); c.fill();
  }

  const path=new Path2D(); path.moveTo(xs[0],ys[0]);
  for(let i=1;i<n;i++) path.lineTo(xs[i],ys[i]);
  path.closePath();
  c.lineJoin='round'; c.lineCap='round';
  c.strokeStyle=th.shoulder; c.lineWidth=HW*2+24; c.stroke(path);
  c.lineWidth=HW*2+9; c.setLineDash([13,13]);
  c.strokeStyle=th.curbA; c.stroke(path);
  c.lineDashOffset=13; c.strokeStyle=th.curbB; c.stroke(path);
  c.setLineDash([]); c.lineDashOffset=0;
  c.strokeStyle=th.edge; c.lineWidth=HW*2+2; c.stroke(path);
  c.strokeStyle=th.road; c.lineWidth=HW*2-2; c.stroke(path);

  for(let k=0;k<1100;k++){
    const i=rnd()*n|0, off=(rnd()*2-1)*(HW-4);
    c.fillStyle=th.speck[k&1]; c.beginPath(); c.arc(xs[i]+nx[i]*off,ys[i]+ny[i]*off,.6+rnd()*1.3,0,Math.PI*2); c.fill();
  }
  if(th.ruts){
    c.strokeStyle=th.ruts; c.lineWidth=3;
    [-10,10].forEach(off=>{ c.beginPath(); for(let i=0;i<=n;i++){ const q=i%n; const px=xs[q]+nx[q]*off,py=ys[q]+ny[q]*off; i?c.lineTo(px,py):c.moveTo(px,py);} c.stroke(); });
  }
  if(th.line){ c.setLineDash([16,16]); c.strokeStyle=th.line; c.lineWidth=2; c.stroke(path); c.setLineDash([]); }

  // grid kutuları
  c.strokeStyle='rgba(240,236,224,.38)'; c.lineWidth=1.2;
  for(let g=0;g<10;g++){
    const p=sampleAt(trk,-(GRID_FRONT+g*GRID_GAP)), lane=g%2?GRID_LANE:-GRID_LANE;
    c.save(); c.translate(p.x+p.nx*lane,p.y+p.ny*lane); c.rotate(p.a); c.strokeRect(-13,-9,26,18); c.restore();
  }
  // start / bitiş
  const sp=sampleAt(trk,0), sq=(HW*2)/8;
  c.save(); c.translate(sp.x,sp.y); c.rotate(sp.a);
  for(let col=0;col<2;col++) for(let r=0;r<8;r++){
    c.fillStyle=((r+col)%2===0)?'#f4f2ec':'#151410';
    c.fillRect(-sq+col*sq,-HW+r*sq,sq,sq);
  }
  c.restore();

  if(def.stand) drawStand(c,def.stand,rnd);

  const deco=[]; let tries=0;
  while(deco.length<60&&tries++<5000){
    const x=16+rnd()*(MW-32), y=16+rnd()*(MH-32);
    if(nearRoad(trk,x,y,HW+30)) continue;
    const st=def.stand; if(st&&x>st.x-18&&x<st.x+st.w+18&&y>st.y-24&&y<st.y+st.h+18) continue;
    const pd=def.pond; if(pd&&((x-pd.x)/(pd.rx+20))**2+((y-pd.y)/(pd.ry+20))**2<1) continue;
    if(deco.some(d=>Math.hypot(d.x-x,d.y-y)<26)) continue;
    deco.push({x,y,s:.7+rnd()*.45,rock:rnd()<.22});
  }
  deco.sort((a,b)=>a.y-b.y).forEach(d=>{
    if(d.rock) drawRock(c,d.x,d.y,d.s,def.theme==='snow'?'#8a96a3':def.theme==='desert'?'#8b6a4a':'#6f6c62');
    else if(th.deco==='cactus') drawCactus(c,d.x,d.y,d.s);
    else if(th.deco==='pine') drawPine(c,d.x,d.y,d.s);
    else drawTree(c,d.x,d.y,d.s);
  });

  const vg=c.createRadialGradient(MW/2,MH/2,340,MW/2,MH/2,680);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.32)');
  c.fillStyle=vg; c.fillRect(0,0,MW,MH);
  return cv;
}
