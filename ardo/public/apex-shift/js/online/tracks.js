/* Online modun pistleri. Geometri menajer modunun spline motorundan geliyor
   (buildTrack/sampleAt/limitAt); burada ona online'ın ihtiyaç duyduğu şeyler
   ekleniyor: pist başına dünya boyutu ve yol genişliği, noktadan-piste hızlı
   projeksiyon (s + lane + mesafe), kamera ayarı ve gece/gündüz zemin çizimi. */
import {buildTrack,sampleAt,limitAt,GRID_FRONT,GRID_GAP,GRID_LANE} from '../manager/track.js';
import {drawTree,mulberry32,clamp} from '../common.js';

export {sampleAt,limitAt,GRID_FRONT,GRID_GAP,GRID_LANE};

export const VIEW_W=1000, VIEW_H=640;

/* ── oval üreteci ────────────────────────────────────────────────────────
   Süper-elips: k küçüldükçe düzlükler uzar, virajlar köşeleşir. t=0 alt
   düzlüğün ortası ve ilk nokta orası — start/bitiş oraya kuruluyor. Araç
   +x yönünde çıkıp sağ virajdan yukarı dönüyor, yani dönüşler sola:
   NASCAR yönü.                                                            */
function ovalPts(cx,cy,a,b,n,k,bulge){
  const f=(u,e)=>Math.sign(u)*Math.pow(Math.abs(u),e);
  const pts=[];
  for(let i=0;i<n;i++){
    const t=i/n*Math.PI*2;
    const x=cx+a*f(Math.sin(t),k);
    let y=cy+b*f(Math.cos(t),k);
    if(bulge) y+=bulge*Math.pow(Math.max(0,Math.cos(t)),4);   // tri-oval çıkıntısı
    pts.push([Math.round(x),Math.round(y)]);
  }
  return pts;
}

/* hw: yol yarı genişliği · laps: tur sayısı · zoom: kamera yakınlığı
   mode:'nascar' pack racing kurallarını ve stock car sınıfını açar.       */
export const ONLINE_TRACKS=[
  {id:'oval',name:'Kısa Oval',icon:'⭕',theme:'grass',grip:1,seed:5,W:1000,H:640,hw:38,laps:4,zoom:1,
   sub:'Isınma turu için hızlı, basit oval',
   pts:ovalPts(500,320,380,215,20,.72,0)},
  {id:'vadi',name:'Yeşil Vadi',icon:'🌲',theme:'grass',grip:1,seed:11,W:1000,H:640,hw:30,laps:3,zoom:1,
   sub:'Teknik, dar, ritmi bozan virajlar',
   pts:[[520,548],[780,540],[880,490],[905,400],[850,330],[760,305],[735,225],[800,150],[760,80],[630,75],[545,150],[545,260],[470,320],[370,300],[340,215],[300,130],[200,95],[115,150],[100,260],[160,330],[120,430],[210,535]],
   stand:{x:330,y:598,w:380,h:30}, pond:{x:640,y:432,rx:70,ry:30}},
  {id:'col',name:'Çöl Rallisi',icon:'🏜️',theme:'desert',grip:.92,seed:23,W:1000,H:640,hw:32,laps:3,zoom:1,
   sub:'Düşük tutuş; frenleri erken al',
   pts:[[480,575],[800,565],[900,500],[870,410],[720,395],[520,395],[400,350],[410,270],[520,230],[760,240],[880,190],[870,95],[720,60],[480,65],[250,70],[120,115],[95,230],[190,300],[215,390],[130,460],[180,560]],
   stand:{x:450,y:455,w:250,h:30}},
  {id:'kar',name:'Kar Kupası',icon:'❄️',theme:'snow',grip:.88,seed:37,W:1000,H:640,hw:31,laps:3,zoom:1,
   sub:'Buz gibi; gaz sabrı ister',
   pts:[[520,560],[820,540],[915,440],[890,320],[770,270],[650,300],[560,380],[450,370],[395,290],[460,205],[620,165],[790,125],[775,60],[560,55],[330,60],[160,85],[85,190],[120,310],[95,430],[200,545]],
   stand:{x:420,y:445,w:260,h:30}},

  /* ── NASCAR: superspeedway ───────────────────────────────────────────
     2400×1400'lük dünya, 4 araba yan yana sığan 130 px genişliğinde asfalt.
     Ekrana sığmıyor; kamera oyuncuyu takip ediyor, minimap tamamını veriyor. */
  {id:'super',name:'Apex Superspeedway',icon:'🏁',theme:'speedway',grip:1.06,seed:71,
   W:2400,H:1540,hw:65,laps:5,zoom:1.15,mode:'nascar',
   sub:'Dev tri-oval · pack racing · 4 araba yan yana',
   pts:ovalPts(1200,700,1000,520,28,.85,110),
   /* Tribün ön düzlüğün DIŞINDA durmalı: asfalt dış kenarı y=1395,
      SAFER bariyeri 1420. Daha yukarısı seyirciyi pistin üstüne çiziyor. */
   stand:{x:600,y:1442,w:1200,h:58}, pit:true, pylons:22,
   infield:{lake:{x:1220,y:640,rx:265,ry:120}, garage:{x:700,y:360,w:300,h:104},
     road:[[850,470],[820,860],[1180,905],[1620,880],[1700,1150]]}},
];
export const trackById=id=>ONLINE_TRACKS.find(t=>t.id===id)||ONLINE_TRACKS[0];
export const NASCAR_TRACKS=ONLINE_TRACKS.filter(t=>t.mode==='nascar');
export const NORMAL_TRACKS=ONLINE_TRACKS.filter(t=>t.mode!=='nascar');

/* ── pist inşası + mekânsal indeks ─────────────────────────────────────
   Merkez çizgi örnekleri hücrelere bölünüyor; 3×3 komşuluk taraması CELL
   yarıçapındaki her şeyi bulmayı garanti ediyor. Bu tek yapı üç işi birden
   görüyor: pistte miyiz, yay uzunluğu (s) kaç, merkeze uzaklık (lane).    */
const CELL=70;
export function buildOnlineTrack(def){
  const trk=buildTrack(def);
  const cols=Math.ceil(def.W/CELL), rows=Math.ceil(def.H/CELL);
  const cells=new Array(cols*rows);
  for(let i=0;i<trk.n;i++){
    const gx=clamp(Math.floor(trk.xs[i]/CELL),0,cols-1);
    const gy=clamp(Math.floor(trk.ys[i]/CELL),0,rows-1);
    const k=gy*cols+gx;
    (cells[k]||(cells[k]=[])).push(i);
  }
  return {def,trk,W:def.W,H:def.H,hw:def.hw||30,laps:def.laps||3,grip:def.grip||1,
    zoom:def.zoom||1,mode:def.mode||'normal',len:trk.len,
    idx:{cols,rows,cells}};
}
/* En yakın merkez çizgi örneği. Pistten çok uzaktaysa null döner. */
export function nearestSample(T,x,y){
  const {cols,rows,cells}=T.idx, trk=T.trk;
  const cx=Math.floor(x/CELL), cy=Math.floor(y/CELL);
  let best=-1,bd=Infinity;
  for(let gy=cy-1;gy<=cy+1;gy++){
    if(gy<0||gy>=rows) continue;
    for(let gx=cx-1;gx<=cx+1;gx++){
      if(gx<0||gx>=cols) continue;
      const list=cells[gy*cols+gx]; if(!list) continue;
      for(let q=0;q<list.length;q++){
        const i=list[q], dx=trk.xs[i]-x, dy=trk.ys[i]-y, d=dx*dx+dy*dy;
        if(d<bd){ bd=d; best=i; }
      }
    }
  }
  return best<0?null:{i:best,d:Math.sqrt(bd)};
}
/* (x,y) → {s, lane, dist, onTrack}. lane: merkez çizgiden işaretli yanal sapma. */
export function projectToTrack(T,x,y){
  const ns=nearestSample(T,x,y);
  if(!ns) return null;
  const trk=T.trk, i=ns.i;
  const lane=(x-trk.xs[i])*trk.nx[i]+(y-trk.ys[i])*trk.ny[i];
  return {s:i*trk.step, i, lane, dist:ns.d, onTrack:ns.d<=T.hw+2};
}
export function isOnTrack(T,x,y){
  const ns=nearestSample(T,x,y);
  return !!ns&&ns.d<=T.hw+2;
}
/* Grid: start çizgisinin gerisine, iki şeritli dizilim. */
export function gridSlots(T,count){
  const gap=Math.max(GRID_GAP,T.hw*0.85), lane=Math.min(GRID_LANE,T.hw*0.45);
  const out=[];
  for(let g=0;g<count;g++){
    const p=sampleAt(T.trk,-(GRID_FRONT+g*gap));
    const off=(g%2?lane:-lane);
    out.push({x:p.x+p.nx*off,y:p.y+p.ny*off,angle:p.a});
  }
  return out;
}

/* ── zemin çizimi ──────────────────────────────────────────────────────── */
const THEME={
  grass:{bg:'#2d5a26',tex:'rgba(255,255,255,.028)',shoulder:'#b9a676',curbA:'#c9402c',curbB:'#ece8dc',edge:'#57554c',road:'#3a3934',
    speck:['rgba(0,0,0,.10)','rgba(255,255,255,.05)'],line:'rgba(238,230,218,.2)',deco:'tree'},
  desert:{bg:'#c99352',tex:'rgba(120,70,20,.07)',shoulder:'#a9743f',curbA:'#b5452c',curbB:'#eadcc0',edge:'#7a4c2a',road:'#94623a',
    speck:['rgba(60,30,10,.16)','rgba(255,230,190,.10)'],line:null,ruts:'rgba(60,32,14,.22)',deco:'cactus'},
  snow:{bg:'#dde6ee',tex:'rgba(150,175,200,.10)',shoulder:'#aebccb',curbA:'#2f6fd6',curbB:'#f4f6f8',edge:'#5a6069',road:'#3c4048',
    speck:['rgba(0,0,0,.12)','rgba(255,255,255,.08)'],line:'rgba(240,244,248,.24)',deco:'pine'},
  speedway:{bg:'#2f5a2a',tex:'rgba(255,255,255,.022)',shoulder:'#d8d4c8',curbA:'#c9402c',curbB:'#f2efe6',edge:'#4a4840',road:'#43423d',
    speck:['rgba(0,0,0,.09)','rgba(255,255,255,.045)'],line:'rgba(240,236,224,.22)',deco:'none'},
};
/* Gece. Referans gerçek gece yarışı: pist projektörlerle ışıl ışıl, etraf
   zifiri. Bu yüzden karartma elemana göre değişiyor — çimen/dekor sert,
   asfalt ve kurblar neredeyse hiç. Aksi hâlde sürülemeyecek kadar
   karanlık bir sahne çıkıyor.                                            */
function nightify(hex,amt,warm){
  const n=parseInt(String(hex).replace('#',''),16);
  let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  const k=1-amt;
  r=Math.round(r*k*(warm?1.00:0.70)+(warm?6:0));
  g=Math.round(g*k*(warm?0.94:0.76)+(warm?4:0));
  b=Math.round(b*k*(warm?0.78:1.04)+(warm?0:14*amt));
  return 'rgb('+Math.min(255,r)+','+Math.min(255,g)+','+Math.min(255,b)+')';
}
const NIGHT_AMT={bg:.74,tex:.74,shoulder:.30,edge:.42,road:.18,curbA:.22,curbB:.26};
function themeFor(def,night){
  const base=THEME[def.theme]||THEME.grass;
  if(!night) return base;
  const t=Object.assign({},base);
  for(const k in NIGHT_AMT){
    if(!t[k]||t[k].indexOf('#')!==0) continue;
    const lit=(k==='road'||k==='shoulder'||k==='curbA'||k==='curbB');
    t[k]=nightify(t[k],NIGHT_AMT[k],lit);
  }
  return t;
}

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
function drawStand(c,st,rnd,night){
  const {x,y,w,h}=st;
  c.fillStyle='rgba(0,0,0,.28)'; c.fillRect(x+4,y+5,w,h);
  c.fillStyle=night?'#4a4740':'#8d887a'; c.fillRect(x,y,w,h);
  const crowd=night
    ? ['#6b6862','#7a5a52','#5a6a7a','#7a7060','#6a7a66','#7a6a72','#3a3a38','#6c6478']
    : ['#e9e6db','#d93c2a','#3aa0ff','#f2b300','#38d39f','#ff6fb0','#2a2a2a','#c792ea'];
  for(let r=0;r<3;r++){
    const y0=y+5+r*((h-8)/3);
    c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x+2,y0+4.5,w-4,1.2);
    for(let px=x+5;px<x+w-5;px+=6.5){
      if(rnd()<.12) continue;
      c.fillStyle=crowd[rnd()*crowd.length|0]; c.beginPath(); c.arc(px,y0+2,2.2,0,Math.PI*2); c.fill();
    }
  }
  c.fillStyle=night?'#6e2418':'#c9402c'; c.fillRect(x-4,y-7,w+8,7);
  c.fillStyle='rgba(255,255,255,.55)'; for(let px=x-4;px<x+w+4;px+=16) c.fillRect(px,y-7,8,2);
}
/* SAFER bariyeri: pistin dışını saran beyaz duvar + kırmızı aksan. */
function drawBarrier(c,T,night){
  const {trk}=T, n=trk.n;
  const ring=(off,wid,col,dash)=>{
    c.beginPath();
    for(let i=0;i<=n;i++){ const q=i%n; const px=trk.xs[q]+trk.nx[q]*off, py=trk.ys[q]+trk.ny[q]*off; i?c.lineTo(px,py):c.moveTo(px,py); }
    c.closePath();
    if(dash) c.setLineDash(dash); else c.setLineDash([]);
    c.lineWidth=wid; c.strokeStyle=col; c.stroke();
    c.setLineDash([]);
  };
  const o=T.hw+13;
  c.lineJoin='round';
  ring(o,15,night?'#2a2b2e':'#43444a');
  ring(o,11,night?'#9a9a94':'#eceae0');
  ring(o,11,night?'#6e2418':'#c9402c',[26,150]);
  ring(-o,13,night?'#26272a':'#3d3e44');
  ring(-o,9, night?'#8e8e88':'#dedbd2');
}
/* Gece aydınlatma direkleri ve asfalttaki sıcak havuzları. */
function drawPylons(c,T,count,night){
  const {trk}=T, step=Math.floor(trk.n/count);
  for(let k=0;k<count;k++){
    const i=(k*step)%trk.n;
    const ox=trk.xs[i]+trk.nx[i]*(T.hw+52), oy=trk.ys[i]+trk.ny[i]*(T.hw+52);
    if(night){
      const g=c.createRadialGradient(trk.xs[i],trk.ys[i],4,trk.xs[i],trk.ys[i],T.hw*3.1);
      g.addColorStop(0,'rgba(255,240,196,.20)'); g.addColorStop(.5,'rgba(255,230,170,.08)'); g.addColorStop(1,'rgba(255,225,160,0)');
      c.fillStyle=g; c.beginPath(); c.arc(trk.xs[i],trk.ys[i],T.hw*2.5,0,Math.PI*2); c.fill();
    }
    c.fillStyle=night?'#4a4a46':'#6d6a62'; c.fillRect(ox-2.5,oy-12,5,24);
    c.fillStyle=night?'#ffe9a8':'#b9b5aa'; c.fillRect(ox-9,oy-17,18,7);
    if(night){
      c.fillStyle='rgba(255,236,170,.55)'; c.beginPath(); c.arc(ox,oy-13,11,0,Math.PI*2); c.fill();
    }
  }
}
/* Pit şeridinin geometrisi tek yerden: çizim de oyun mantığı da bunu okuyor. */
export const PIT={from:0.88, to:0.12, off:34, half:16, speed:95};
export function pitZone(T){
  if(!T.def.pit) return null;
  return {sFrom:T.len*PIT.from, sTo:T.len*PIT.to,
          lane:-(T.hw+PIT.off), half:PIT.half, speed:PIT.speed};
}
/* s pit aralığında mı (start/bitiş çizgisinin üstünden sarıyor). */
export function inPitRange(T,s){
  const z=pitZone(T); if(!z) return false;
  return s>=z.sFrom||s<=z.sTo;
}
/* Araç pit şeridinin içinde mi (hem boyuna hem yanal). */
export function inPitLane(T,s,lane){
  const z=pitZone(T); if(!z) return false;
  return inPitRange(T,s)&&Math.abs(lane-z.lane)<=z.half;
}
/* Pit yolu. Pistin iç kenarından ayrılan, duvarla ayrılmış, numaralı
   kutuları olan ayrı bir yol. Asfalttan SONRA çiziliyor — daha önce
   yüzeyin altında kalıp hiç görünmüyordu.                                 */
const STALL_COLS=['#cc1e1e','#0b6fc4','#1faa4b','#ff6a00','#f2b300','#eceade',
                  '#c81d1d','#1e5fd0','#2b3fb8','#141414','#9a4fd0','#00a79a'];
function drawPitRoad(c,T,night){
  const trk=T.trk, n=trk.n;
  const i0=Math.floor(n*PIT.from), i1=Math.floor(n*PIT.to)+n;
  const roadOff=-(T.hw+PIT.off), wallOff=-(T.hw+11), stallOff=-(T.hw+PIT.off+32);
  const pt=(i,off)=>{
    const q=((i%n)+n)%n;
    return {x:trk.xs[q]+trk.nx[q]*off, y:trk.ys[q]+trk.ny[q]*off,
            a:trk.ang[q], nx:trk.nx[q], ny:trk.ny[q]};
  };
  /* Giriş: yol pistin iç kenarından başlayıp yumuşakça pit offsetine açılıyor.
     Ayrı bir "huni" poligonu çizmek kopuk bir leke bırakıyordu.            */
  const ENTRY=90;
  const laneAt=(i,base)=>{
    if(i>=i0) return base;
    const t=Math.max(0,Math.min(1,(i-(i0-ENTRY))/ENTRY));
    return -(T.hw-2)+(base+(T.hw-2))*(t*t);
  };
  const ribbon=(off,w,col,dash,from,to)=>{
    c.beginPath();
    const s0=from===undefined?i0-ENTRY:from, s1=to===undefined?i1:to;
    for(let i=s0;i<=s1;i++){ const q=pt(i,laneAt(i,off)); i===s0?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y); }
    c.setLineDash(dash||[]); c.lineWidth=w; c.strokeStyle=col; c.stroke(); c.setLineDash([]);
  };
  const mix=(d,nl)=>night?nl:d;
  c.save(); c.lineJoin='round'; c.lineCap='butt';

  // 2) pit yolu yüzeyi + kenar çizgileri + orta sarı
  ribbon(roadOff,PIT.half*2+6,mix('#3a3933','#26251f'));
  ribbon(roadOff,PIT.half*2,mix('#56554e','#39382f'));
  ribbon(roadOff-PIT.half+1.4,2.6,mix('#eeece2','#a9a498'));
  ribbon(roadOff+PIT.half-1.4,2.6,mix('#eeece2','#a9a498'),null,i0-20,i1);
  ribbon(roadOff,1.8,mix('#f2b300','#9c7a1c'),[18,22]);

  // 3) numaralı pit kutuları + yola bağlanan beyaz şeritler
  const stalls=12;
  for(let k=0;k<stalls;k++){
    const i=Math.floor(i0+(i1-i0)*(k+0.6)/stalls);
    const q=pt(i,stallOff);
    c.save(); c.translate(q.x,q.y); c.rotate(q.a);
    c.fillStyle='rgba(0,0,0,.28)'; c.fillRect(-18,-13,36,26);
    c.fillStyle=mix(STALL_COLS[k%STALL_COLS.length],'#3a3932');
    c.globalAlpha=night?.5:.85; c.fillRect(-18,-13,36,26); c.globalAlpha=1;
    c.strokeStyle=mix('#eeece2','#a9a498'); c.lineWidth=2; c.strokeRect(-18,-13,36,26);
    c.font='700 15px "Oswald","Arial Narrow",sans-serif';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(0,0,0,.5)'; c.fillText(String(k+1),1,1);
    c.fillStyle=mix('#f6f4ea','#b8b4a6'); c.fillText(String(k+1),0,0);
    // ekip: kutunun yol tarafında iki nokta
    c.fillStyle=mix('#d8d4c8','#6e6a60');
    c.beginPath(); c.arc(-6,17,3,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(4,17,3,0,Math.PI*2); c.fill();
    c.restore();
  }

  // 4) pit duvarı — oyunun iç duvarıyla aynı yerde, pit aralığında açılıyor
  ribbon(wallOff,10,mix('#3d3e44','#24252a'),null,i0+16,i1);
  ribbon(wallOff,7,mix('#eceae0','#9a968c'),null,i0+16,i1);
  ribbon(wallOff,7,mix('#c9402c','#6e2418'),[20,90],i0+16,i1);

  // 5) giriş tabelası: pistten bakınca kaçırılmayacak kadar büyük
  {
    const q=pt(i0-18,-(T.hw+PIT.off+70));
    c.save(); c.translate(q.x,q.y); c.rotate(q.a);
    c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(-46,-17,96,36);
    c.fillStyle=mix('#f2b300','#8c6c14'); c.fillRect(-48,-19,96,36);
    c.fillStyle=mix('#1a1a12','#0d0d09');
    c.font='700 21px "Oswald","Arial Narrow",sans-serif';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText('PIT',-16,0);
    c.beginPath(); c.moveTo(34,0); c.lineTo(12,-11); c.lineTo(12,11); c.closePath(); c.fill();
    c.restore();
  }
  // 6) girişe boyanmış sarı şevronlar (asfaltın iç omzunda)
  for(let k=0;k<6;k++){
    const q=pt(i0-62+k*13,-(T.hw-4));
    c.save(); c.translate(q.x,q.y); c.rotate(q.a);
    c.globalAlpha=night?.45:.8; c.fillStyle=mix('#f2b300','#9c7a1c');
    c.beginPath(); c.moveTo(7,0); c.lineTo(-5,-7); c.lineTo(-2,0); c.lineTo(-5,7); c.closePath(); c.fill();
    c.globalAlpha=1; c.restore();
  }
  // 7) çıkış işareti
  {
    const q=pt(i1-24,-(T.hw+PIT.off+62));
    c.save(); c.translate(q.x,q.y); c.rotate(q.a);
    c.fillStyle=mix('#3ecf8e','#1d6b4a'); c.fillRect(-34,-13,68,26);
    c.fillStyle=mix('#07160f','#04100a');
    c.font='700 15px "Oswald","Arial Narrow",sans-serif';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText('ÇIKIŞ',0,0);
    c.restore();
  }
  // 8) gece: pit yolu da aydınlatılıyor
  if(night){
    ribbon(roadOff,PIT.half*2+34,'rgba(255,238,198,.05)');
    ribbon(roadOff,PIT.half*2+10,'rgba(255,241,208,.07)');
  }
  c.restore();
}

/* Oval içi alan: göl, garaj sırası ve servis yolu — boş yeşillik kalmasın. */
function drawInfield(c,T,inf,night){
  if(inf.road&&inf.road.length>1){
    c.lineJoin='round'; c.lineCap='round';
    c.beginPath();
    inf.road.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
    c.strokeStyle=night?'#33342f':'#55544c'; c.lineWidth=20; c.stroke();
    c.strokeStyle=night?'#6e6d64':'#a8a496'; c.lineWidth=1.6; c.setLineDash([12,14]); c.stroke(); c.setLineDash([]);
  }
  if(inf.lake){
    const L=inf.lake;
    c.fillStyle=night?'#3f4a36':'#8fa36a'; c.beginPath(); c.ellipse(L.x,L.y,L.rx+10,L.ry+10,0,0,Math.PI*2); c.fill();
    c.fillStyle=night?'#0e2a42':'#2f7fc0'; c.beginPath(); c.ellipse(L.x,L.y,L.rx,L.ry,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,'+(night?'.07':'.16')+')';
    c.beginPath(); c.ellipse(L.x-L.rx*.3,L.y-L.ry*.35,L.rx*.4,L.ry*.2,0,0,Math.PI*2); c.fill();
  }
  if(inf.garage){
    const G=inf.garage;
    c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(G.x+5,G.y+6,G.w,G.h);
    c.fillStyle=night?'#3c3d39':'#6f6d64'; c.fillRect(G.x,G.y,G.w,G.h);
    const bays=8, bw=G.w/bays;
    for(let i=0;i<bays;i++){
      c.fillStyle=night?'#2a2b28':'#4a4942'; c.fillRect(G.x+i*bw+3,G.y+G.h*.48,bw-6,G.h*.44);
      if(night&&i%2===0){ c.fillStyle='rgba(255,232,170,.28)'; c.fillRect(G.x+i*bw+3,G.y+G.h*.48,bw-6,G.h*.44); }
    }
    c.fillStyle=night?'#5a2f22':'#b4553a'; c.fillRect(G.x,G.y,G.w,G.h*.16);
    // garaj arkasına dizilmiş takım tırları
    const hl=['#c9c5bb','#8fa0b4','#b48f8f','#9db48f','#b4aa8f','#9f9fb4'];
    for(let i=0;i<6;i++){
      const hx=G.x+8+i*((G.w-16)/6), hy=G.y-46;
      c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(hx+3,hy+4,26,38);
      c.fillStyle=night?'#4a4a46':hl[i]; c.fillRect(hx,hy,26,38);
      c.fillStyle=night?'#2e2e2c':'#55534c'; c.fillRect(hx,hy+28,26,10);
    }
  }
}

/* Büyük dünyalarda cihaz pikseli patlamasın diye çözünürlük bütçesi. */
const PX_BUDGET=4.2e6;
export function trackDpr(def,dpr){
  const want=Math.min(dpr||1,2);
  const cap=Math.sqrt(PX_BUDGET/Math.max(1,def.W*def.H));
  return Math.max(1,Math.min(want,cap));
}

export function paintOnlineTrack(T,dpr,opts){
  opts=opts||{};
  const night=!!opts.night, def=T.def, trk=T.trk, W=T.W, H=T.H, HW=T.hw;
  const d=trackDpr(def,dpr);
  const cv=document.createElement('canvas');
  cv.width=Math.round(W*d); cv.height=Math.round(H*d);
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,0,0);
  const th=themeFor(def,night), rnd=mulberry32(def.seed);
  const n=trk.n, xs=trk.xs, ys=trk.ys, nx=trk.nx, ny=trk.ny;

  c.fillStyle=th.bg; c.fillRect(0,0,W,H);
  if(def.theme==='grass'||def.theme==='speedway'){
    c.save(); c.translate(W/2,H/2); c.rotate(Math.PI/8); c.translate(-W/2,-H/2);
    c.fillStyle=th.tex; for(let i=-H;i<W+H;i+=44) c.fillRect(i,-H,22,H*3);
    c.restore();
  } else {
    for(let i=0;i<90;i++){ c.fillStyle=th.tex; c.beginPath(); c.ellipse(rnd()*W,rnd()*H,30+rnd()*70,10+rnd()*22,rnd()*Math.PI,0,Math.PI*2); c.fill(); }
  }
  if(def.pond){
    const p=def.pond;
    c.fillStyle=night?'#4c463a':'#b9a676'; c.beginPath(); c.ellipse(p.x,p.y,p.rx+6,p.ry+6,0,0,Math.PI*2); c.fill();
    c.fillStyle=night?'#12324d':'#2f7fc0'; c.beginPath(); c.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(p.x-p.rx*.3,p.y-p.ry*.35,p.rx*.35,p.ry*.18,0,0,Math.PI*2); c.fill();
  }
  if(def.infield) drawInfield(c,T,def.infield,night);

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

  // eğim (banking): dış kenar açık, iç kenar koyu — virajda hacim hissi
  if(def.mode==='nascar'){
    const bands=[[HW*0.62,'rgba(255,255,255,.055)'],[HW*0.86,'rgba(255,255,255,.085)'],[-HW*0.7,'rgba(0,0,0,.16)'],[-HW*0.3,'rgba(18,16,12,.22)']];
    for(let k=0;k<bands.length;k++){
      const off=bands[k][0];
      c.beginPath();
      for(let i=0;i<=n;i++){ const q=i%n; const px=xs[q]+nx[q]*off, py=ys[q]+ny[q]*off; i?c.lineTo(px,py):c.moveTo(px,py); }
      c.closePath(); c.lineWidth=HW*0.5; c.strokeStyle=bands[k][1]; c.stroke();
    }
  }

  const specks=def.mode==='nascar'?2400:1100;
  for(let k=0;k<specks;k++){
    const i=rnd()*n|0, off=(rnd()*2-1)*(HW-4);
    c.fillStyle=th.speck[k&1]; c.beginPath(); c.arc(xs[i]+nx[i]*off,ys[i]+ny[i]*off,.6+rnd()*1.3,0,Math.PI*2); c.fill();
  }
  if(th.ruts){
    c.strokeStyle=th.ruts; c.lineWidth=3;
    [-10,10].forEach(off=>{ c.beginPath(); for(let i=0;i<=n;i++){ const q=i%n; const px=xs[q]+nx[q]*off,py=ys[q]+ny[q]*off; i?c.lineTo(px,py):c.moveTo(px,py);} c.stroke(); });
  }
  if(th.line&&def.mode!=='nascar'){ c.setLineDash([16,16]); c.strokeStyle=th.line; c.lineWidth=2; c.stroke(path); c.setLineDash([]); }

  if(def.mode==='nascar') drawBarrier(c,T,night);
  if(def.pit) drawPitRoad(c,T,night);

  // grid kutuları
  const gsl=gridSlots(T,12);
  c.strokeStyle='rgba(240,236,224,.36)'; c.lineWidth=1.4;
  gsl.forEach(p=>{ c.save(); c.translate(p.x,p.y); c.rotate(p.angle); c.strokeRect(-15,-10,30,20); c.restore(); });

  // start / bitiş damalı
  const sp=sampleAt(trk,0), rowsN=Math.max(6,Math.round(HW/7)), sq=(HW*2)/rowsN;
  c.save(); c.translate(sp.x,sp.y); c.rotate(sp.a);
  for(let col=0;col<2;col++) for(let r=0;r<rowsN;r++){
    c.fillStyle=((r+col)%2===0)?'#f4f2ec':'#151410';
    c.fillRect(-sq+col*sq,-HW+r*sq,sq,sq);
  }
  c.restore();

  if(def.stand) drawStand(c,def.stand,rnd,night);
  if(def.pylons) drawPylons(c,T,def.pylons,night);

  if(th.deco!=='none'){
    const deco=[]; let tries=0;
    while(deco.length<60&&tries++<5000){
      const x=16+rnd()*(W-32), y=16+rnd()*(H-32);
      const ns=nearestSample(T,x,y);
      if(ns&&ns.d<HW+30) continue;
      const st=def.stand; if(st&&x>st.x-18&&x<st.x+st.w+18&&y>st.y-24&&y<st.y+st.h+18) continue;
      const pd=def.pond; if(pd&&((x-pd.x)/(pd.rx+20))**2+((y-pd.y)/(pd.ry+20))**2<1) continue;
      if(deco.some(dd=>Math.hypot(dd.x-x,dd.y-y)<26)) continue;
      deco.push({x,y,s:.7+rnd()*.45,rock:rnd()<.22});
    }
    deco.sort((a,b)=>a.y-b.y).forEach(dd=>{
      if(dd.rock) drawRock(c,dd.x,dd.y,dd.s,def.theme==='snow'?'#8a96a3':def.theme==='desert'?'#8b6a4a':'#6f6c62');
      else if(th.deco==='cactus') drawCactus(c,dd.x,dd.y,dd.s);
      else if(th.deco==='pine') drawPine(c,dd.x,dd.y,dd.s);
      else drawTree(c,dd.x,dd.y,dd.s);
    });
  }

  if(night){
    /* Projektörler pist boyunca kesintisiz aydınlatır; tek tek havuz çizmek
       aralarda zifiri boşluk bırakıyordu. Önce yumuşak bir bant, sonra
       direklerin havuzları onun üstüne varyasyon olarak biniyor.          */
    c.save(); c.lineJoin='round'; c.lineCap='round';
    const band=(w,col)=>{ c.lineWidth=w; c.strokeStyle=col; c.stroke(path); };
    band(HW*3.4,'rgba(255,238,198,.045)');
    band(HW*2.5,'rgba(255,240,205,.065)');
    band(HW*1.9,'rgba(255,243,212,.075)');
    c.restore();
    if(def.pylons) drawPylons(c,T,def.pylons,true);
  }
  const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.42,W/2,H/2,Math.max(W,H)*0.78);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,night?'rgba(0,0,0,.34)':'rgba(0,0,0,.34)');
  c.fillStyle=vg; c.fillRect(0,0,W,H);
  return {cv,dpr:d};
}
