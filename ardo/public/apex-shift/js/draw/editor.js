/* Pist Çiz — çizim tahtası.

   Akış: tahtaya kapalı bir tur çiz → çizgi yumuşatılıp kontrol noktalarına
   dönüşür → yarış motorunun spline'ıyla aynı yol önizlenir → Sür.
   "Nasıl çizersen öyle yarışırsın": çizimin başladığı yer start çizgisi,
   çizim yönü yarış yönü.

   Durum tek bir "spec"te (geometry.js). Her değişiklik geri alma yığınına
   giriyor ve taslak olarak saklanıyor; sayfa yenilense de çizim kaybolmuyor. */
import {$,clamp} from '../common.js';
import * as G from './geometry.js';

const LS_TRACKS='apexShift.tracks', LS_DRAFT='apexShift.draft', LS_PREF='apexShift.drawPrefs';
const MAX_SAVED=40, MAX_HIST=60;

/* Tahtadaki yol renkleri oyundaki zeminlerle aynı (online/tracks.js THEME). */
const TH={
  grass:{road:'#3a3934',edge:'#57554c',curbA:'#c9402c',curbB:'#ece8dc',shoulder:'#7d7252',bg:'#17241a',line:'rgba(238,230,218,.28)'},
  desert:{road:'#94623a',edge:'#7a4c2a',curbA:'#b5452c',curbB:'#eadcc0',shoulder:'#6f5030',bg:'#2a2114',line:'rgba(255,236,206,.2)'},
  snow:{road:'#3c4048',edge:'#5a6069',curbA:'#2f6fd6',curbB:'#f4f6f8',shoulder:'#77818d',bg:'#1b2129',line:'rgba(240,244,248,.28)'},
};

const st={
  open:false, spec:null, an:null, hist:[], mode:'free', smooth:1,
  stroke:null, lastStroke:null, fromStroke:false,
  drag:-1, dragMoved:false, hover:-1, savedId:null, genSeed:{},
  view:{s:1,ox:0,oy:0}, cssW:0, cssH:0, dpr:1, raf:0, anTimer:0, lastTap:{t:0,i:-1},
  cb:{},
};
let el={}, ctx=null, bound=false;

/* ── yardımcılar ─────────────────────────────────────────────────────── */
const cloneSpec=s=>s?{...s,pts:s.pts.map(p=>p.slice())}:null;
function readJSON(k,d){ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
function writeJSON(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function prefs(){ return Object.assign({size:'m',hw:G.HW_DEF,theme:'grass',smooth:1},readJSON(LS_PREF,{})); }
function savePrefs(p){ writeJSON(LS_PREF,Object.assign(prefs(),p)); }
const fmtKm=m=>(m/1000).toFixed(2).replace('.',',')+' km';
const fmtM=m=>isFinite(m)?Math.round(m)+' m':'–';

function toast(msg,kind){
  const t=el.toast; if(!t) return;
  t.textContent=msg; t.className='ed-toast show'+(kind?' '+kind:'');
  clearTimeout(t._t); t._t=setTimeout(()=>{ t.className='ed-toast'; },2600);
}

/* ── kayıtlı pistler ─────────────────────────────────────────────────── */
export function savedTracks(){
  const list=readJSON(LS_TRACKS,[]);
  return Array.isArray(list)?list.filter(t=>t&&t.id&&typeof t.code==='string'):[];
}
function writeSaved(list){ writeJSON(LS_TRACKS,list.slice(0,MAX_SAVED)); }
export function deleteSaved(id){ writeSaved(savedTracks().filter(t=>t.id!==id)); }
function saveCurrent(){
  if(!st.spec){ toast('Önce bir pist çiz.','bad'); return; }
  const spec=st.spec, code=G.encodeSpec(spec);
  const list=savedTracks();
  const at=Date.now(), lenM=st.an?Math.round(st.an.lenM):0;
  let item=st.savedId&&list.find(t=>t.id===st.savedId);
  if(item){ item.name=spec.name; item.code=code; item.at=at; item.lenM=lenM; }
  else{ item={id:'t'+at.toString(36),name:spec.name,code,at,lenM}; list.unshift(item); st.savedId=item.id; }
  list.sort((a,b)=>b.at-a.at);
  writeSaved(list);
  renderSaved();
  toast('💾 "'+spec.name+'" Pistlerim\'e kaydedildi.');
}

/* Küçük önizleme: menüde ve tahtanın yanında aynı çizim. */
export function paintThumb(cv,spec,w,h){
  const d=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(w*d); cv.height=Math.round(h*d);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,0,0);
  const th=TH[spec.theme]||TH.grass, {W,H}=G.sizeOf(spec);
  c.fillStyle=th.bg; c.fillRect(0,0,w,h);
  const s=Math.min((w-8)/W,(h-8)/H), ox=(w-W*s)/2, oy=(h-H*s)/2;
  let trk; try{ trk=G.analyze(G.toWorld(spec),spec.hw).trk; }catch(e){ return; }
  c.beginPath();
  for(let i=0;i<trk.n;i+=2){ const x=ox+trk.xs[i]*s, y=oy+trk.ys[i]*s; i?c.lineTo(x,y):c.moveTo(x,y); }
  c.closePath(); c.lineJoin='round';
  c.lineWidth=Math.max(2.2,spec.hw*2*s); c.strokeStyle=th.edge; c.stroke();
  c.lineWidth=Math.max(1.4,spec.hw*2*s-1.6); c.strokeStyle=th.road; c.stroke();
  const x0=ox+trk.xs[0]*s, y0=oy+trk.ys[0]*s;
  c.fillStyle='#f2b300'; c.beginPath(); c.arc(x0,y0,2.6,0,Math.PI*2); c.fill();
}

/* Pistlerim listesi — hem tahtada hem menüde kullanılıyor. */
export function renderSavedList(box,opts){
  if(!box) return;
  const list=savedTracks();
  box.innerHTML='';
  if(!list.length){
    const p=document.createElement('p'); p.className='ed-empty';
    p.textContent=opts.emptyText||'Henüz kayıtlı pistin yok. Çizip 💾 Kaydet\'e bas.';
    box.appendChild(p); return;
  }
  for(const t of list){
    const spec=G.decodeSpec(t.code); if(!spec) continue;
    const row=document.createElement('div'); row.className='ed-trk';
    const cv=document.createElement('canvas'); paintThumb(cv,spec,64,42);
    const info=document.createElement('div'); info.className='ed-trk-i';
    const nm=document.createElement('b'); nm.textContent=t.name||spec.name;
    const meta=document.createElement('small');
    meta.textContent=(t.lenM?fmtKm(t.lenM)+' · ':'')+G.sizeOf(spec).name+' · '+(G.THEMES_DRAW[spec.theme]||{}).name;
    info.appendChild(nm); info.appendChild(meta);
    const open=document.createElement('button'); open.type='button'; open.className='ed-trk-b';
    open.textContent=opts.openText||'Aç'; open.addEventListener('click',()=>opts.onOpen(spec,t.id));
    const del=document.createElement('button'); del.type='button'; del.className='ed-trk-x';
    del.setAttribute('aria-label',(t.name||'Pist')+' sil'); del.textContent='✕';
    del.addEventListener('click',()=>{
      if(!confirm('"'+(t.name||'Pist')+'" silinsin mi?')) return;
      deleteSaved(t.id); if(st.savedId===t.id) st.savedId=null;
      renderSavedList(box,opts); if(opts.onChange) opts.onChange();
    });
    row.appendChild(cv); row.appendChild(info); row.appendChild(open); row.appendChild(del);
    box.appendChild(row);
  }
}
function renderSaved(){
  renderSavedList(el.saved,{onOpen:(spec,id)=>{ setSpec(spec,true); st.savedId=id; toast('📂 "'+spec.name+'" açıldı.'); },
    onChange:()=>{ if(st.cb.onSavedChange) st.cb.onSavedChange(); }});
  if(st.cb.onSavedChange) st.cb.onSavedChange();
}

/* ── durum değişimi ──────────────────────────────────────────────────── */
function pushHist(){
  st.hist.push(cloneSpec(st.spec));
  if(st.hist.length>MAX_HIST) st.hist.shift();
}
function setSpec(spec,record){
  if(record) pushHist();
  st.spec=spec?cloneSpec(spec):null;
  st.fromStroke=false;
  syncControls();
  reanalyze(true);
  saveDraft();
}
function saveDraft(){
  try{
    if(st.spec) localStorage.setItem(LS_DRAFT,G.encodeSpec(st.spec));
    else localStorage.removeItem(LS_DRAFT);
  }catch(e){}
}
export function loadDraft(){ try{ return G.decodeSpec(localStorage.getItem(LS_DRAFT)||''); }catch(e){ return null; } }

function reanalyze(now){
  clearTimeout(st.anTimer);
  const run=()=>{
    st.an=null;
    if(st.spec){ try{ st.an=G.analyze(G.toWorld(st.spec),st.spec.hw); }catch(e){ st.an=null; } }
    renderStats(); requestDraw();
  };
  if(now) run(); else st.anTimer=setTimeout(run,60);
}
function ensureInside(spec){
  const {W,H}=G.sizeOf(spec);
  spec.pts=G.toNorm(G.fitInside(G.toWorld(spec),W,H,spec.hw),spec.size);
}

/* ── kontroller ──────────────────────────────────────────────────────── */
function segSet(box,v){ [...box.querySelectorAll('button')].forEach(b=>b.classList.toggle('on',b.dataset.v===String(v))); }
function syncControls(){
  const p=prefs(), s=st.spec;
  segSet(el.mode,st.mode);
  segSet(el.size,s?s.size:p.size);
  segSet(el.theme,s?s.theme:p.theme);
  segSet(el.smooth,st.smooth);
  const hw=s?s.hw:p.hw;
  el.width.value=String(hw); el.widthV.textContent=Math.round(hw*2*G.M_PER_PX)+' m';
  if(document.activeElement!==el.name) el.name.value=s?s.name:'';
  el.name.disabled=!s;
  el.undo.disabled=!st.hist.length;
  el.clear.disabled=el.reverse.disabled=el.share.disabled=el.save.disabled=el.relax.disabled=!s;
  el.board.classList.toggle('mode-dots',st.mode==='dots');
  el.board.classList.toggle('mode-start',st.mode==='start');
  const help={
    free:'Tahtaya <b>kapalı bir tur</b> çiz. Nasıl çizersen öyle yarışırsın: başladığın yer <b>start çizgisi</b>, çizdiğin yön <b>yarış yönü</b>.',
    dots:'Noktaları <b>sürükleyerek</b> pisti şekillendir. Yolun üstüne dokun: <b>yeni nokta</b>. Noktaya çift dokun (ya da sağ tık): <b>sil</b>.',
    start:'Start çizgisini koymak istediğin yere, <b>yolun üstüne</b> dokun.',
  };
  el.help.innerHTML=help[st.mode];
}
function renderStats(){
  const a=st.an;
  el.stLen.textContent=a?fmtKm(a.lenM):'–';
  el.stCorners.textContent=a?String(a.corners.length):'–';
  el.stStraight.textContent=a?fmtM(a.straightM):'–';
  el.stTight.textContent=a?fmtM(a.tightM):'–';
  const warn=[];
  let ok=!!a;
  if(a&&a.len<G.MIN_LEN_PX){ warn.push('⚠ Pist çok kısa — biraz daha büyük bir tur çiz.'); ok=false; }
  if(a&&a.crossings.length) warn.push('🌉 Pist kendini '+a.crossings.length+' yerde kesiyor: kesişmeler <b>köprü</b> olur.');
  if(a&&a.close.length) warn.push('⚠ '+a.close.length+' yerde iki yol birbirine çok yakın (tahtada kırmızı). Yollar birbirine karışabilir.');
  el.warn.innerHTML=warn.map(w=>'<p>'+w+'</p>').join('');
  el.warn.hidden=!warn.length;
  el.drive.disabled=el.online.disabled=!ok;
}

/* ── tahta: görünüm ve çizim ─────────────────────────────────────────── */
function worldSize(){ const s=st.spec; return G.SIZES[s?s.size:prefs().size]||G.SIZES.m; }
function fitView(){
  const {W,H}=worldSize(), pad=14;
  const s=Math.min((st.cssW-pad*2)/W,(st.cssH-pad*2)/H);
  st.view={s,ox:(st.cssW-W*s)/2,oy:(st.cssH-H*s)/2};
}
function resize(){
  const r=el.canvas.getBoundingClientRect();
  st.cssW=Math.max(40,r.width); st.cssH=Math.max(40,r.height);
  st.dpr=Math.min(window.devicePixelRatio||1,2);
  el.canvas.width=Math.round(st.cssW*st.dpr); el.canvas.height=Math.round(st.cssH*st.dpr);
  fitView(); requestDraw();
}
const W2C=(x,y)=>[st.view.ox+x*st.view.s,st.view.oy+y*st.view.s];
function C2W(cx,cy){ return [(cx-st.view.ox)/st.view.s,(cy-st.view.oy)/st.view.s]; }
function requestDraw(){ if(!st.raf) st.raf=requestAnimationFrame(()=>{ st.raf=0; draw(); }); }

function draw(){
  if(!ctx) return;
  const c=ctx, {W,H}=worldSize(), v=st.view, s=v.s;
  c.setTransform(st.dpr,0,0,st.dpr,0,0);
  c.clearRect(0,0,st.cssW,st.cssH);
  c.fillStyle='#0d0f0a'; c.fillRect(0,0,st.cssW,st.cssH);
  const theme=st.spec?st.spec.theme:prefs().theme, th=TH[theme]||TH.grass;
  // dünya alanı + ızgara
  c.fillStyle=th.bg; c.fillRect(v.ox,v.oy,W*s,H*s);
  c.lineWidth=1;
  for(let gx=0;gx<=W;gx+=50){ const x=Math.round(v.ox+gx*s)+.5; c.strokeStyle=gx%250===0?'rgba(255,255,255,.075)':'rgba(255,255,255,.03)'; c.beginPath(); c.moveTo(x,v.oy); c.lineTo(x,v.oy+H*s); c.stroke(); }
  for(let gy=0;gy<=H;gy+=50){ const y=Math.round(v.oy+gy*s)+.5; c.strokeStyle=gy%250===0?'rgba(255,255,255,.075)':'rgba(255,255,255,.03)'; c.beginPath(); c.moveTo(v.ox,y); c.lineTo(v.ox+W*s,y); c.stroke(); }
  c.strokeStyle='#343829'; c.lineWidth=1.5; c.strokeRect(v.ox+.5,v.oy+.5,W*s-1,H*s-1);

  if(st.spec&&st.an) drawTrack(c,th);
  else if(!st.stroke) drawEmpty(c);
  if(st.stroke) drawStroke(c);
}

function ringPath(c,trk,off,i0,i1){
  const n=trk.n, s=st.view.s;
  c.beginPath();
  const full=i0===undefined;
  const a=full?0:i0, b=full?n:i1;
  for(let k=a;k<=b;k++){
    const q=((k%n)+n)%n;
    const x=st.view.ox+(trk.xs[q]+trk.nx[q]*off)*s, y=st.view.oy+(trk.ys[q]+trk.ny[q]*off)*s;
    k===a?c.moveTo(x,y):c.lineTo(x,y);
  }
  if(full) c.closePath();
}
function roadLayers(c,trk,hw,th,i0,i1){
  const s=st.view.s;
  c.lineJoin='round'; c.lineCap=i0===undefined?'round':'butt';
  ringPath(c,trk,0,i0,i1);
  c.strokeStyle=th.shoulder; c.lineWidth=(hw*2+14)*s; c.stroke();
  c.setLineDash([Math.max(2,9*s),Math.max(2,9*s)]);
  c.strokeStyle=th.curbA; c.lineWidth=(hw*2+6)*s; c.stroke();
  c.lineDashOffset=Math.max(2,9*s); c.strokeStyle=th.curbB; c.stroke();
  c.setLineDash([]); c.lineDashOffset=0;
  c.strokeStyle=th.edge; c.lineWidth=(hw*2+1.5)*s; c.stroke();
  c.strokeStyle=th.road; c.lineWidth=(hw*2-2)*s; c.stroke();
}
function drawTrack(c,th){
  const a=st.an, trk=a.trk, hw=st.spec.hw, s=st.view.s, n=trk.n;
  roadLayers(c,trk,hw,th);
  // orta kesik çizgi
  ringPath(c,trk,0); c.setLineDash([Math.max(3,14*s),Math.max(3,14*s)]);
  c.strokeStyle=th.line; c.lineWidth=Math.max(1,1.6*s); c.stroke(); c.setLineDash([]);
  // köprüler: kesişmede sonradan gelen yol üstten geçiyor
  for(const cr of a.crossings){
    const K=Math.ceil(hw*2.8/trk.step), j=cr.j;
    c.save();
    ringPath(c,trk,0,j-K,j+K); c.lineCap='butt';
    c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=(hw*2+18)*s; c.translate(3,4); c.stroke(); c.translate(-3,-4);
    c.restore();
    roadLayers(c,trk,hw,{...th,curbA:'#c8c4b8',curbB:'#8e8a80'},j-K,j+K);
    ringPath(c,trk,0,j-K,j+K); c.setLineDash([Math.max(3,14*s),Math.max(3,14*s)]);
    c.strokeStyle=th.line; c.lineWidth=Math.max(1,1.6*s); c.stroke(); c.setLineDash([]);
  }
  // birbirine sürten yollar: kırmızı işaret
  for(const cl of a.close){
    const mx=(trk.xs[cl.i]+trk.xs[cl.j])/2, my=(trk.ys[cl.i]+trk.ys[cl.j])/2;
    const [x,y]=W2C(mx,my);
    c.fillStyle='rgba(217,60,42,.22)'; c.strokeStyle='rgba(255,122,102,.9)'; c.lineWidth=1.6;
    c.beginPath(); c.arc(x,y,Math.max(9,hw*1.6*s),0,Math.PI*2); c.fill(); c.stroke();
  }
  // yön okları
  const every=Math.max(8,Math.round(150/trk.step));
  c.fillStyle='rgba(242,179,0,.85)';
  for(let i=Math.round(every*0.6);i<n-every*0.3;i+=every){
    const [x,y]=W2C(trk.xs[i],trk.ys[i]), an=trk.ang[i], r=Math.max(3,5.5*s+2);
    c.save(); c.translate(x,y); c.rotate(an);
    c.beginPath(); c.moveTo(r,0); c.lineTo(-r*.8,-r*.75); c.lineTo(-r*.35,0); c.lineTo(-r*.8,r*.75); c.closePath(); c.fill();
    c.restore();
  }
  // start/bitiş damalı + grid kutuları
  {
    const [x,y]=W2C(trk.xs[0],trk.ys[0]), an=trk.ang[0], rows=6, sq=(hw*2*s)/rows;
    c.save(); c.translate(x,y); c.rotate(an);
    for(let col=0;col<2;col++) for(let r=0;r<rows;r++){
      c.fillStyle=((r+col)%2===0)?'#f4f2ec':'#151410';
      c.fillRect(-sq+col*sq,-hw*s+r*sq,sq,sq);
    }
    c.restore();
    c.strokeStyle='rgba(240,236,224,.45)'; c.lineWidth=1;
    for(let g=0;g<4;g++){
      const dS=(16+g*Math.max(26,hw*0.85)), q=((n-Math.round(dS/trk.step))%n+n)%n;
      const lane=(g%2?1:-1)*Math.min(16,hw*0.45);
      const [gx,gy]=W2C(trk.xs[q]+trk.nx[q]*lane,trk.ys[q]+trk.ny[q]*lane);
      c.save(); c.translate(gx,gy); c.rotate(trk.ang[q]); c.strokeRect(-13*s,-8*s,26*s,16*s); c.restore();
    }
  }
  // viraj numaraları: virajın dışına
  c.font='700 11px "Oswald","Arial Narrow",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  a.corners.forEach((cn,k)=>{
    const i=cn.i, side=cn.turn>0?-1:1, off=hw+26/Math.max(.35,s);
    const [x,y]=W2C(trk.xs[i]+trk.nx[i]*off*side,trk.ys[i]+trk.ny[i]*off*side);
    c.fillStyle='rgba(13,15,10,.85)'; c.strokeStyle='rgba(236,234,222,.55)'; c.lineWidth=1.3;
    c.beginPath(); c.arc(x,y,9,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='#eceade'; c.fillText(String(k+1),x,y+.5);
  });
  // nokta modu: kontrol noktaları
  if(st.mode==='dots'){
    const {W,H}=worldSize();
    st.spec.pts.forEach((p,i)=>{
      const [x,y]=W2C(p[0]*W,p[1]*H), big=(i===st.drag||i===st.hover);
      c.beginPath(); c.arc(x,y,big?9:6.5,0,Math.PI*2);
      c.fillStyle=i===0?'rgba(242,179,0,.95)':'rgba(13,15,10,.75)'; c.fill();
      c.lineWidth=2; c.strokeStyle=i===0?'#fff4c2':'#f2b300'; c.stroke();
    });
  }
}
function drawEmpty(c){
  const {W,H}=worldSize(), v=st.view;
  c.save();
  c.setLineDash([10,10]); c.lineWidth=2; c.strokeStyle='rgba(242,179,0,.22)';
  c.beginPath(); c.ellipse(v.ox+W*v.s/2,v.oy+H*v.s/2,W*v.s*.3,H*v.s*.28,0,0,Math.PI*2); c.stroke();
  c.setLineDash([]);
  c.fillStyle='rgba(236,234,222,.75)'; c.textAlign='center'; c.textBaseline='middle';
  c.font='600 '+clamp(st.cssW/26,15,24)+'px "Oswald","Arial Narrow",sans-serif';
  c.fillText('✏️  Buraya kapalı bir tur çiz',v.ox+W*v.s/2,v.oy+H*v.s/2-10);
  c.font='13px -apple-system,"Segoe UI",Arial,sans-serif'; c.fillStyle='rgba(138,140,122,.95)';
  c.fillText('ya da soldan hazır bir pist üret',v.ox+W*v.s/2,v.oy+H*v.s/2+18);
  c.restore();
}
function drawStroke(c){
  const pts=st.stroke; if(!pts.length) return;
  const hw=st.spec?st.spec.hw:prefs().hw;
  c.save(); c.lineJoin='round'; c.lineCap='round';
  c.beginPath();
  pts.forEach((p,i)=>{ const [x,y]=W2C(p[0],p[1]); i?c.lineTo(x,y):c.moveTo(x,y); });
  c.strokeStyle='rgba(242,179,0,.18)'; c.lineWidth=Math.max(6,hw*2*st.view.s); c.stroke();
  c.strokeStyle='#f2b300'; c.lineWidth=3; c.stroke();
  const [sx,sy]=W2C(pts[0][0],pts[0][1]);
  const last=pts[pts.length-1], [lx,ly]=W2C(last[0],last[1]);
  const near=Math.hypot(lx-sx,ly-sy)<30&&pts.length>20;
  c.beginPath(); c.arc(sx,sy,near?14:7,0,Math.PI*2);
  c.fillStyle=near?'rgba(62,207,142,.35)':'rgba(62,207,142,.9)'; c.fill();
  c.strokeStyle='#3ecf8e'; c.lineWidth=2; c.stroke();
  c.restore();
}

/* ── etkileşim ───────────────────────────────────────────────────────── */
function evtWorld(e){
  const r=el.canvas.getBoundingClientRect();
  return C2W(e.clientX-r.left,e.clientY-r.top);
}
function clampWorld(p){
  const {W,H}=worldSize(), m=G.marginPx(st.spec?st.spec.hw:prefs().hw)*0.6;
  return [clamp(p[0],m,W-m),clamp(p[1],m,H-m)];
}
function hitPoint(e){
  if(!st.spec) return -1;
  const r=el.canvas.getBoundingClientRect(), cx=e.clientX-r.left, cy=e.clientY-r.top;
  const {W,H}=worldSize(), R=e.pointerType==='touch'?20:13;
  let best=-1,bd=R;
  st.spec.pts.forEach((p,i)=>{ const [x,y]=W2C(p[0]*W,p[1]*H), d=Math.hypot(x-cx,y-cy); if(d<bd){ bd=d; best=i; } });
  return best;
}
/* Yolun üstünde mi? En yakın merkez örneği + yanal mesafe. */
function hitRoad(wp){
  const a=st.an; if(!a) return null;
  const trk=a.trk, hw=st.spec.hw;
  let best=-1,bd=Infinity;
  for(let i=0;i<trk.n;i++){ const dx=trk.xs[i]-wp[0], dy=trk.ys[i]-wp[1], d=dx*dx+dy*dy; if(d<bd){ bd=d; best=i; } }
  const tol=hw+12/Math.max(.25,st.view.s);
  return Math.sqrt(bd)<=tol?{i:best,s:best*trk.step}:null;
}
/* Yolun s noktasına yeni kontrol noktası: yarış sırasına doğru yere yerleşsin. */
function insertAt(hit){
  const {W,H}=worldSize(), trk=st.an.trk, pts=st.spec.pts;
  const P=[trk.xs[hit.i]/W,trk.ys[hit.i]/H];
  // her kontrol noktasının yol üstündeki konumu
  const sOf=pts.map(p=>{ let b=0,bd=Infinity; for(let i=0;i<trk.n;i+=2){ const dx=trk.xs[i]-p[0]*W,dy=trk.ys[i]-p[1]*H,d=dx*dx+dy*dy; if(d<bd){bd=d;b=i;} } return b; });
  let at=pts.length;
  for(let k=0;k<pts.length;k++){
    const a=sOf[k], b=k+1<pts.length?sOf[k+1]:trk.n+sOf[0];
    const hi=hit.i<a?hit.i+trk.n:hit.i;
    if(hi>=a&&hi<=b){ at=k+1; break; }
  }
  pts.splice(at,0,P);
  return at;
}

function onDown(e){
  if(e.button===2) return;
  el.canvas.setPointerCapture(e.pointerId);
  const wp=evtWorld(e);
  if(st.mode==='free'){
    st.stroke=[clampWorld(wp)]; requestDraw(); return;
  }
  if(!st.spec) return;
  if(st.mode==='dots'){
    const i=hitPoint(e);
    const now=performance.now();
    if(i>=0&&st.lastTap.i===i&&now-st.lastTap.t<340){ deletePoint(i); st.lastTap={t:0,i:-1}; return; }
    st.lastTap={t:now,i};
    if(i>=0){ pushHist(); st.drag=i; st.dragMoved=false; requestDraw(); return; }
    const hit=hitRoad(wp);
    if(hit){ pushHist(); st.drag=insertAt(hit); st.dragMoved=true; reanalyze(true); }
    return;
  }
  if(st.mode==='start'){
    const hit=hitRoad(wp);
    if(!hit){ toast('Yolun üstüne dokun.','bad'); return; }
    const {W,H}=worldSize();
    const ptsW=G.rebase(G.toWorld(st.spec),hit.s,56);
    const next=cloneSpec(st.spec); next.pts=G.toNorm(ptsW,next.size);
    setSpec(next,true);
    st.mode='free'; syncControls();
    toast('🏁 Start çizgisi taşındı.');
  }
}
function onMove(e){
  if(st.mode==='free'&&st.stroke){
    const wp=clampWorld(evtWorld(e)), last=st.stroke[st.stroke.length-1];
    if(Math.hypot(wp[0]-last[0],wp[1]-last[1])*st.view.s>=2.5){ st.stroke.push(wp); requestDraw(); }
    return;
  }
  if(st.mode==='dots'&&st.spec){
    if(st.drag>=0){
      const {W,H}=worldSize(), wp=clampWorld(evtWorld(e));
      st.spec.pts[st.drag]=[wp[0]/W,wp[1]/H]; st.dragMoved=true;
      reanalyze(true);     // analiz birkaç ms: yol parmağı gecikmeden izlesin
    } else {
      const h=hitPoint(e); if(h!==st.hover){ st.hover=h; requestDraw(); }
    }
  }
}
function onUp(e){
  if(st.mode==='free'&&st.stroke){
    const stroke=st.stroke; st.stroke=null;
    finishStroke(stroke); return;
  }
  if(st.mode==='dots'&&st.drag>=0){
    st.drag=-1;
    if(!st.dragMoved) st.hist.pop();     // sadece dokunuş: geri alma kaydı tutma
    else{ ensureInside(st.spec); saveDraft(); }
    reanalyze(true); syncControls();
  }
}
function deletePoint(i){
  if(!st.spec||st.spec.pts.length<=G.MIN_PTS+1){ toast('Pistte en az '+(G.MIN_PTS+1)+' nokta kalmalı.','bad'); return; }
  const next=cloneSpec(st.spec);
  next.pts.splice(i,1);
  if(i===0) toast('Start noktası silindi; start bir sonraki noktaya geçti.');
  setSpec(next,true);
}
function finishStroke(stroke){
  const lenPx=G.polyLength(stroke,false);
  if(stroke.length<8||lenPx<G.MIN_LEN_PX*0.45){ requestDraw(); if(lenPx>40) toast('Biraz daha büyük bir tur çiz.','bad'); return; }
  const gap=Math.hypot(stroke[0][0]-stroke[stroke.length-1][0],stroke[0][1]-stroke[stroke.length-1][1]);
  const p=prefs();
  const base=st.spec||{size:p.size,hw:p.hw,theme:p.theme,laps:3,name:''};
  const pts=G.strokeToPts(stroke,st.smooth);
  if(!pts){ toast('Bu çizimden pist çıkmadı, tekrar dene.','bad'); requestDraw(); return; }
  const {W,H}=G.SIZES[base.size];
  // yeni çizim yeni bir pist: otomatik verilmiş ad yenilensin, kullanıcının yazdığı ad kalsın
  const keepName=base.name&&!AUTO_NAME.test(base.name);
  const next={v:1,name:keepName?base.name:nextName(),size:base.size,hw:base.hw,theme:base.theme,laps:base.laps||3,
    pts:G.toNorm(G.fitInside(pts,W,H,base.hw),base.size)};
  setSpec(next,true);
  st.lastStroke=stroke; st.fromStroke=true;
  st.savedId=null;
  if(gap>lenPx*0.16) toast('Tur otomatik kapatıldı: bitişi başlangıca düz çizgiyle bağladım.');
}
const AUTO_NAME=/^(Pistim|Grand Prix|Akıcı|Teknik|Sokak|Oval|Kart) \d+$/;
function nextName(){
  const n=savedTracks().length+1;
  return 'Pistim '+n;
}

/* ── araç çubuğu ─────────────────────────────────────────────────────── */
function undo(){
  if(!st.hist.length) return;
  st.spec=st.hist.pop();
  st.fromStroke=false;
  syncControls(); reanalyze(true); saveDraft();
}
function clearAll(){ if(!st.spec) return; setSpec(null,true); st.savedId=null; toast('Tahta temizlendi. ↶ ile geri alabilirsin.'); }
function reverse(){
  if(!st.spec) return;
  const next=cloneSpec(st.spec); next.pts=G.reversePts(next.pts);
  setSpec(next,true); toast('⇄ Yarış yönü ters çevrildi.');
}
function relax(){
  if(!st.spec) return;
  const next=cloneSpec(st.spec), {W,H}=G.sizeOf(next);
  let w=G.toWorld(next);
  w=G.resample(G.smoothRing(G.resample(w,22,true),3,1),56,true);
  next.pts=G.toNorm(G.fitInside(w,W,H,next.hw),next.size);
  setSpec(next,true); toast('〰 Virajlar yumuşatıldı.');
}
export function shareUrl(spec){
  return location.origin+location.pathname.replace(/[^/]*$/,'')+'index.html#pist='+G.encodeSpec(spec);
}
async function share(){
  if(!st.spec) return;
  const url=shareUrl(st.spec);
  try{
    if(navigator.clipboard&&window.isSecureContext){ await navigator.clipboard.writeText(url); toast('🔗 Link kopyalandı — açan herkes bu pisti görür.'); return; }
  }catch(e){}
  window.prompt('Pist linkini kopyala:',url);
}
function generate(style){
  const p=prefs(), base=st.spec?{size:st.spec.size,hw:st.spec.hw,theme:st.spec.theme}:{size:p.size,hw:p.hw,theme:p.theme};
  let seed=(st.genSeed[style]||((Math.random()*1e6)|0))+1, spec=null;
  for(let k=0;k<24&&!spec;k++,seed++) spec=G.generate(style,seed*2654435761>>>0,base);
  st.genSeed[style]=seed;
  if(!spec){ toast('Üretilemedi, tekrar bas.','bad'); return; }
  setSpec(spec,true); st.savedId=null;
  toast('Yeni '+G.GENERATORS[style].name+' pisti. Tekrar bas, başkası gelsin; beğenmezsen ↶.');
}

function bindOnce(){
  if(bound) return; bound=true;
  el={editor:$('editor'),canvas:$('edCanvas'),board:$('edBoard'),toast:$('edToast'),help:$('edHelp'),
    mode:$('edMode'),size:$('edSize'),theme:$('edTheme'),smooth:$('edSmooth'),
    width:$('edWidth'),widthV:$('edWidthV'),name:$('edName'),warn:$('edWarn'),
    undo:$('edUndo'),clear:$('edClear'),reverse:$('edReverse'),share:$('edShare'),save:$('edSave'),relax:$('edRelax'),
    drive:$('edDrive'),online:$('edOnline'),saved:$('edSaved'),gens:$('edGens'),
    stLen:$('stLen'),stCorners:$('stCorners'),stStraight:$('stStraight'),stTight:$('stTight')};
  ctx=el.canvas.getContext('2d');
  const ro=new ResizeObserver(()=>{ if(st.open) resize(); });
  ro.observe(el.board);

  el.canvas.addEventListener('pointerdown',onDown);
  el.canvas.addEventListener('pointermove',onMove);
  el.canvas.addEventListener('pointerup',onUp);
  el.canvas.addEventListener('pointercancel',onUp);
  el.canvas.addEventListener('pointerleave',()=>{ if(st.hover>=0){ st.hover=-1; requestDraw(); } });
  el.canvas.addEventListener('contextmenu',e=>{
    if(st.mode!=='dots') return;
    e.preventDefault(); const i=hitPoint(e); if(i>=0) deletePoint(i);
  });

  el.mode.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    if((b.dataset.v==='dots'||b.dataset.v==='start')&&!st.spec){ toast('Önce bir pist çiz ya da üret.','bad'); return; }
    st.mode=b.dataset.v; syncControls(); requestDraw();
  });
  el.gens.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) generate(b.dataset.g); });
  el.size.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    savePrefs({size:b.dataset.v});
    if(st.spec&&st.spec.size!==b.dataset.v){ const n=cloneSpec(st.spec); n.size=b.dataset.v; ensureInside(n); setSpec(n,true); }
    fitView(); syncControls(); requestDraw();
  });
  el.theme.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    savePrefs({theme:b.dataset.v});
    if(st.spec&&st.spec.theme!==b.dataset.v){ const n=cloneSpec(st.spec); n.theme=b.dataset.v; setSpec(n,true); }
    syncControls(); requestDraw();
  });
  el.smooth.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b) return;
    st.smooth=+b.dataset.v; savePrefs({smooth:st.smooth}); syncControls();
    // Son çizgi hâlâ olduğu gibiyse yeni yumuşatmayla yeniden kur. Önce çizgiden
    // önceki duruma dön ki geri alma yığınında eski yumuşatma kalmasın.
    if(st.fromStroke&&st.lastStroke){ const s=st.lastStroke; st.spec=st.hist.pop()||null; finishStroke(s); }
  });
  let widthHist=false;
  el.width.addEventListener('input',()=>{
    const hw=+el.width.value; el.widthV.textContent=Math.round(hw*2*G.M_PER_PX)+' m';
    savePrefs({hw});
    if(st.spec){ if(!widthHist){ pushHist(); widthHist=true; } st.spec.hw=hw; reanalyze(false); requestDraw(); }
  });
  el.width.addEventListener('change',()=>{ widthHist=false; if(st.spec){ ensureInside(st.spec); reanalyze(true); saveDraft(); syncControls(); } });
  el.name.addEventListener('input',()=>{ if(st.spec){ st.spec.name=G.cleanName(el.name.value)||st.spec.name; saveDraft(); } });

  el.undo.addEventListener('click',undo);
  el.clear.addEventListener('click',clearAll);
  el.reverse.addEventListener('click',reverse);
  el.share.addEventListener('click',share);
  el.save.addEventListener('click',saveCurrent);
  el.relax.addEventListener('click',relax);
  $('edBack').addEventListener('click',()=>{ if(st.cb.onBack) st.cb.onBack(); });
  el.drive.addEventListener('click',()=>{ if(st.spec&&st.cb.onDrive){ saveDraft(); st.cb.onDrive(cloneSpec(st.spec)); } });
  el.online.addEventListener('click',()=>{ if(st.spec&&st.cb.onOnline){ saveDraft(); st.cb.onOnline(cloneSpec(st.spec)); } });

  window.addEventListener('keydown',e=>{
    if(!st.open) return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&document.activeElement!==el.name){ e.preventDefault(); undo(); }
  });
}

/* ── dış arayüz ──────────────────────────────────────────────────────── */
export function openEditor(opts){
  bindOnce();
  st.cb=opts||{};
  st.open=true;
  const p=prefs(); st.smooth=p.smooth|0;
  if(opts&&opts.spec){ st.hist=[]; st.spec=cloneSpec(opts.spec); st.savedId=opts.savedId||null; saveDraft(); }
  else if(!st.spec){ st.spec=loadDraft(); st.hist=[]; }
  st.mode='free';
  el.editor.style.opacity=''; el.editor.style.transition='';
  el.editor.style.display='flex';
  document.body.classList.add('editing');
  syncControls(); renderSaved();
  requestAnimationFrame(()=>{ resize(); reanalyze(true); });
}
/* keepVisible: sürüşe geçerken tahta görünür kalsın, solma geçişi gizlesin. */
export function closeEditor(keepVisible){
  st.open=false;
  if(el.editor&&!keepVisible) el.editor.style.display='none';
  document.body.classList.remove('editing');
}
export function currentSpec(){ return cloneSpec(st.spec); }
export function editorToast(msg,kind){ toast(msg,kind); }
