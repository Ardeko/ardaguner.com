/* Apex Shift — iki modun (online yarış + takım menajeri) paylaştığı parçalar:
   küçük yardımcılar, ekran geçişleri, Web Audio sesleri ve araba sprite'ı. */

export const $=id=>document.getElementById(id);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function lerpAngle(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2))-Math.PI;if(d<-Math.PI)d+=Math.PI*2;return a+d*t;}
export function fmtTime(ms){if(!isFinite(ms)||ms<0)ms=0;const s=ms/1000,m=Math.floor(s/60),sec=Math.floor(s%60),d=Math.floor((ms%1000)/100);return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+d;}
export function shadeHex(hex,p){const n=parseInt(hex.replace('#',''),16);const r=clamp((n>>16)+Math.round(255*p/100),0,255);const g=clamp(((n>>8)&0xff)+Math.round(255*p/100),0,255);const b=clamp((n&0xff)+Math.round(255*p/100),0,255);return'rgb('+r+','+g+','+b+')';}
export function rrp(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
export function sanitName(v){return(v||'').trim().slice(0,12)||'Sürücü';}
export function mulberry32(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function shuffle(arr,rng){for(let i=arr.length-1;i>0;i--){const j=Math.floor((rng||Math.random)()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

const hasWin=typeof window!=='undefined';
export const isTouch=hasWin&&(('ontouchstart' in window)||navigator.maxTouchPoints>0);
export const reduceMotion=hasWin&&!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
/* Ünlü grid vinilleri: logo yok, renk + şerit. hex kimlik (eski kayıtlar ALIAS ile göçer). */
export const LIVERIES=[
  {id:'ferrari',name:'Ferrari',pick:1,hex:'#cc1e1e',base:'#cc1e1e',pod:'#1a1210',wing:'#1a1210',wing2:'#cc1e1e',badge:'#ffd100',halo:'#c9a227',nose:'#cc1e1e',
   swatch:'linear-gradient(90deg,#cc1e1e 0 58%,#ffd100 58% 70%,#1a1210 70%)'},
  {id:'redbull',name:'Red Bull',pick:1,hex:'#1e41c8',base:'#061433',pod:'#061433',wing:'#ffd200',wing2:'#c8102e',badge:'#ffd200',halo:'#ffd200',nose:'#c8102e',
   swatch:'linear-gradient(90deg,#061433 0 42%,#c8102e 42% 68%,#ffd200 68%)'},
  {id:'aston',name:'Aston Martin',pick:1,hex:'#005e51',base:'#005e51',pod:'#00463c',wing:'#c5e86b',wing2:'#005e51',badge:'#c5e86b',halo:'#c5e86b',nose:'#005e51',
   swatch:'linear-gradient(90deg,#005e51 0 72%,#c5e86b 72%)'},
  {id:'renault',name:'Renault',pick:1,hex:'#f5c400',base:'#f5c400',pod:'#141414',wing:'#141414',wing2:'#f5c400',badge:'#141414',halo:'#f5c400',nose:'#f5c400',
   swatch:'linear-gradient(90deg,#f5c400 0 62%,#141414 62%)'},
  {id:'racingbulls',name:'Racing Bulls',pick:1,hex:'#16325c',base:'#0a1e46',pod:'#f4f0ea',wing:'#0a1e46',wing2:'#f4f0ea',badge:'#e10600',halo:'#f4f0ea',nose:'#0a1e46',
   swatch:'linear-gradient(90deg,#0a1e46 0 48%,#f4f0ea 48% 78%,#e10600 78%)'},
  {id:'alpine',name:'Alpine',pick:1,hex:'#ff4aa4',base:'#ff4aa4',pod:'#0055a5',wing:'#0055a5',wing2:'#ff4aa4',badge:'#ffffff',halo:'#ff4aa4',nose:'#ff4aa4',
   swatch:'linear-gradient(90deg,#ff4aa4 0 55%,#0055a5 55%)'},
  {id:'mclaren',name:'McLaren',pick:1,hex:'#ff6a00',base:'#ff6a00',pod:'#47c7e8',wing:'#47c7e8',wing2:'#ff6a00',badge:'#47c7e8',halo:'#d8d4c8',nose:'#ff6a00',
   swatch:'linear-gradient(90deg,#ff6a00 0 50%,#47c7e8 50%)'},
  {id:'mercedes',name:'Mercedes',pick:1,hex:'#c5cdd1',base:'#c5cdd1',pod:'#aeb6bb',wing:'#00d2be',wing2:'#c5cdd1',badge:'#00d2be',halo:'#1a1c1e',nose:'#c5cdd1',
   swatch:'linear-gradient(90deg,#c5cdd1 0 62%,#00d2be 62%)'},
  {id:'haas',name:'Haas',pick:0,hex:'#e8e4dc',base:'#e8e4dc',pod:'#e10600',wing:'#111111',wing2:'#e8e4dc',badge:'#e10600',halo:'#111111',nose:'#e8e4dc',
   swatch:'linear-gradient(90deg,#e8e4dc 0 40%,#e10600 40% 70%,#111111 70%)'},
  {id:'sauber',name:'Sauber',pick:0,hex:'#1a2a1a',base:'#141a14',pod:'#0c100c',wing:'#9dff00',wing2:'#141a14',badge:'#9dff00',halo:'#9dff00',nose:'#141a14',
   swatch:'linear-gradient(90deg,#141a14 0 68%,#9dff00 68%)'},

  /* ── stock car (NASCAR modu) ────────────────────────────────────────────
     F1 vinilleriyle aynı mantık: logo ve pilot ismi yok, tanınabilir renk
     düzeni + kaput numarası. `vin` bandları gövdeye normalize koordinatla
     (0 = burun, 1 = arka / 0 = sol, 1 = sağ) boyanır.                      */
  {id:'sc-siyah',name:'Siyah Efsane',pick:0,cls:'stock',num:'3',hex:'#141414',base:'#141414',pod:'#0b0b0b',wing:'#c9c5bb',wing2:'#141414',badge:'#c9c5bb',halo:'#c9c5bb',nose:'#141414',numCol:'#e8e4d8',
   vin:[{c:'#c9c5bb',x:[.70,.80]},{c:'#8f8b82',x:[.82,.87]}],
   swatch:'linear-gradient(90deg,#141414 0 62%,#c9c5bb 62% 74%,#141414 74%)'},
  {id:'sc-gokkusagi',name:'Gökkuşağı 24',pick:0,cls:'stock',num:'24',hex:'#2b3fb8',base:'#2b3fb8',pod:'#1d2c8a',wing:'#ff6a00',wing2:'#f2b300',badge:'#ffffff',halo:'#ffffff',nose:'#2b3fb8',numCol:'#ffffff',
   vin:[{c:'#ff3b2f',x:[.30,.40]},{c:'#ff8c28',x:[.40,.50]},{c:'#f2b300',x:[.50,.60]},{c:'#3ecf8e',x:[.60,.70]}],
   swatch:'linear-gradient(90deg,#2b3fb8 0 30%,#ff3b2f 30% 45%,#f2b300 45% 60%,#3ecf8e 60% 70%,#2b3fb8 70%)'},
  {id:'sc-lowes',name:'Mavi Şimşek',pick:0,cls:'stock',num:'48',hex:'#0b6fc4',base:'#0b6fc4',pod:'#085395',wing:'#f2b300',wing2:'#ffffff',badge:'#f2b300',halo:'#ffffff',nose:'#0b6fc4',numCol:'#f2b300',
   vin:[{c:'#f2b300',x:[.06,.18]},{c:'#ffffff',x:[.18,.23]}],
   swatch:'linear-gradient(90deg,#0b6fc4 0 24%,#f2b300 24% 36%,#0b6fc4 36%)'},
  {id:'sc-yesil',name:'Yeşil 88',pick:0,cls:'stock',num:'88',hex:'#1faa4b',base:'#1faa4b',pod:'#15803a',wing:'#111111',wing2:'#1faa4b',badge:'#111111',halo:'#e8e4d8',nose:'#1faa4b',numCol:'#111111',
   vin:[{c:'#111111',y:[0,.22]},{c:'#111111',y:[.78,1]}],
   swatch:'linear-gradient(0deg,#111 0 20%,#1faa4b 20% 80%,#111 80%)'},
  {id:'sc-turuncu',name:'Turuncu Ok',pick:0,cls:'stock',num:'11',hex:'#ff6a00',base:'#ff6a00',pod:'#d65500',wing:'#f4f2ec',wing2:'#ff6a00',badge:'#2b2b2b',halo:'#f4f2ec',nose:'#ff6a00',numCol:'#f4f2ec',
   vin:[{c:'#f4f2ec',x:[.40,.54]},{c:'#2b2b2b',x:[.54,.59]}],
   swatch:'linear-gradient(90deg,#ff6a00 0 44%,#f4f2ec 44% 58%,#ff6a00 58%)'},
  {id:'sc-petty',name:'Petty Mavisi',pick:0,cls:'stock',num:'43',hex:'#1e5fd0',base:'#1e5fd0',pod:'#1749a3',wing:'#e01b1b',wing2:'#f4f2ec',badge:'#f4f2ec',halo:'#f4f2ec',nose:'#e01b1b',numCol:'#f4f2ec',
   vin:[{c:'#e01b1b',x:[0,.36]},{c:'#f4f2ec',x:[.36,.42]}],
   swatch:'linear-gradient(90deg,#e01b1b 0 34%,#f4f2ec 34% 40%,#1e5fd0 40%)'},
  {id:'sc-kirmizi',name:'Kırmızı 22',pick:0,cls:'stock',num:'22',hex:'#c81d1d',base:'#c81d1d',pod:'#9c1414',wing:'#f2b300',wing2:'#141414',badge:'#f2b300',halo:'#141414',nose:'#f2b300',numCol:'#f2b300',
   vin:[{c:'#141414',x:[.58,.76]},{c:'#f2b300',x:[.76,.82]}],
   swatch:'linear-gradient(90deg,#c81d1d 0 52%,#141414 52% 70%,#f2b300 70%)'},
  {id:'sc-beyaz',name:'Beyaz 2',pick:0,cls:'stock',num:'2',hex:'#eceade',base:'#eceade',pod:'#cfccc0',wing:'#1a3a7a',wing2:'#eceade',badge:'#1a3a7a',halo:'#1a3a7a',nose:'#eceade',numCol:'#1a3a7a',
   vin:[{c:'#1a3a7a',y:[0,.26]},{c:'#1a3a7a',y:[.74,1]},{c:'#c81d1d',x:[.46,.54]}],
   swatch:'linear-gradient(0deg,#1a3a7a 0 24%,#eceade 24% 76%,#1a3a7a 76%)'},
];
/* NASCAR lobisi bu listeden seçtirir; F1 vinilleri `pick` ile ayrılıyor. */
export const STOCK_LIVERIES=LIVERIES.filter(l=>l.cls==='stock');
export const STOCK_COLORS=STOCK_LIVERIES.map(l=>l.hex);
const LIVERY_ALIAS={
  '#d93c2a':'ferrari','#cc1e1e':'ferrari',
  '#3aa0ff':'redbull','#1e41c8':'redbull','#1636a8':'redbull','#5b6cff':'redbull',
  '#38d39f':'aston','#005e51':'aston',
  '#f4b400':'renault','#f5c400':'renault',
  '#c792ea':'racingbulls','#16325c':'racingbulls','#8d6bff':'racingbulls',
  '#ff6fb0':'alpine','#ff4aa4':'alpine',
  '#ff8c28':'mclaren','#ff6a00':'mclaren',
  '#f2f2f2':'mercedes','#c5cdd1':'mercedes','#1ec8d6':'mercedes',
  '#9aa0a6':'haas','#e8e4dc':'haas','#7fd93a':'sauber','#1a2a1a':'sauber',
};
export const COLORS=LIVERIES.filter(l=>l.pick).map(l=>l.hex);
export const ALL_LIVERY_HEXES=LIVERIES.map(l=>l.hex);
export function liveryOf(color){
  const k=String(color||'').toLowerCase();
  let liv=LIVERIES.find(l=>l.id===k||l.hex.toLowerCase()===k);
  if(!liv){ const id=LIVERY_ALIAS[k]; if(id) liv=LIVERIES.find(l=>l.id===id); }
  if(liv) return liv;
  const hex=/^#[0-9a-f]{6}$/i.test(k)?k:'#cc1e1e';
  return {id:'custom',name:'Takım',pick:0,hex,base:hex,pod:shadeHex(hex,-18),wing:shadeHex(hex,-28),wing2:hex,badge:'#ffd100',halo:'#d0cdc4',nose:hex,swatch:hex};
}
export function liveryFill(el,color){
  if(!el) return;
  const liv=liveryOf(color);
  el.style.background=liv.swatch||liv.hex;
}

export function flashHint(el,msg){
  if(!el) return;
  if(!el.dataset.base) el.dataset.base=el.innerHTML;
  el.innerHTML=msg; el.style.color='var(--red)';
  clearTimeout(el._ht);
  el._ht=setTimeout(()=>{ el.innerHTML=el.dataset.base; el.style.color=''; },3800);
}
export function crossFade(hideEl,showEl){
  if(reduceMotion){ hideEl.style.display='none'; showEl.style.display='block'; return; }
  hideEl.style.transition='opacity .22s ease';
  hideEl.style.opacity='0';
  setTimeout(()=>{
    hideEl.style.display='none'; hideEl.style.opacity=''; hideEl.style.transition='';
    showEl.style.display='block'; showEl.style.opacity='0';
    requestAnimationFrame(()=>{
      showEl.style.transition='opacity .3s ease';
      showEl.style.opacity='1';
      setTimeout(()=>{ showEl.style.transition=''; showEl.style.opacity=''; },320);
    });
  },220);
}

/* ── ses (Web Audio API, dosyasız) ─────── */
export const audio={ctx:null,master:null,muted:false};
export function initAudio(){
  if(audio.ctx){ if(audio.ctx.state==='suspended') audio.ctx.resume(); return; }
  try{
    audio.ctx=new (window.AudioContext||window.webkitAudioContext)();
    audio.master=audio.ctx.createGain(); audio.master.gain.value=0.32;
    audio.master.connect(audio.ctx.destination);
    if(audio.ctx.state==='suspended') audio.ctx.resume();
  }catch(e){ audio.ctx=null; }
}
export function beep(freq,dur,type,vol){
  const a=audio.ctx;
  if(!a||audio.muted) return;
  try{
    const o=a.createOscillator(), g=a.createGain();
    o.type=type||'sine'; o.frequency.value=freq;
    o.connect(g); g.connect(audio.master);
    const t=a.currentTime;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.22,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t); o.stop(t+dur+0.03);
  }catch(e){}
}
export const sfx={
  countdown(){ beep(440,0.09,'square',0.16); },
  go(){ beep(220,0.16,'sawtooth',0.28); setTimeout(()=>beep(330,0.28,'sawtooth',0.28),90); },
  lap(){ beep(660,0.1,'sine',0.22); setTimeout(()=>beep(880,0.16,'sine',0.22),80); },
  fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.22,'triangle',0.24),i*110)); },
  nitro(){ beep(140,0.22,'sawtooth',0.24); },
  buy(){ beep(988,0.07,'triangle',0.14); setTimeout(()=>beep(1319,0.1,'triangle',0.14),55); },
};

/* ── çizim ─────────────────────────────── */
export function drawTree(c,x,y,s){
  c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(2*s,4*s,11*s,7*s,0,0,Math.PI*2); c.fill();
  const blobs=[[0,0,9,'#2a5423'],[-7,-3,7,'#214019'],[7,-2,7,'#35622c'],[-3,6,6.5,'#214019'],[4,6,6.5,'#2f5a27'],[0,-7,6.5,'#35622c']];
  blobs.forEach(b=>{ c.fillStyle=b[3]; c.beginPath(); c.arc(b[0]*s,b[1]*s,b[2]*s,0,Math.PI*2); c.fill(); });
  c.restore();
}
function paintBody(c,color,span){
  const gr=c.createLinearGradient(0,-span,0,span);
  gr.addColorStop(0,shadeHex(color,-22)); gr.addColorStop(.32,shadeHex(color,22));
  gr.addColorStop(.5,shadeHex(color,32)); gr.addColorStop(.68,shadeHex(color,22)); gr.addColorStop(1,shadeHex(color,-22));
  c.fillStyle=gr; c.fill();
}
function paintVinyl(c,liv,x0,x1,hw){
  const w=x1-x0, id=liv.id;
  if(liv.vin){
    // x/y normalize: x 0=arka 1=burun yönünde soldan sağa, y 0=üst 1=alt
    for(const b of liv.vin){
      c.fillStyle=b.c;
      const bx0=x1-w*(b.x?b.x[1]:1), bx1=x1-w*(b.x?b.x[0]:0);
      const by0=-hw+2*hw*(b.y?b.y[0]:0), by1=-hw+2*hw*(b.y?b.y[1]:1);
      c.fillRect(bx0,by0,bx1-bx0,by1-by0);
    }
    return;
  }
  if(id==='ferrari'){
    c.fillStyle='#1a1210'; c.fillRect(x0,-hw,w*.62,hw*.4); c.fillRect(x0,hw*.6,w*.62,hw*.4);
    c.fillStyle='#ffd100'; c.fillRect(x0+w*.2,-.5,w*.55,1);
  }else if(id==='redbull'){
    c.fillStyle='#c8102e';
    c.beginPath(); c.moveTo(x0,-hw); c.lineTo(x0+w*.62,-hw); c.lineTo(x0+w*.28,0); c.lineTo(x0,0); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x0,hw); c.lineTo(x0+w*.62,hw); c.lineTo(x0+w*.28,0); c.lineTo(x0,0); c.closePath(); c.fill();
    c.fillStyle='#ffd200'; c.fillRect(x0,-.45,w,.9);
  }else if(id==='mercedes'){
    c.fillStyle='rgba(20,40,48,.22)'; c.fillRect(x0,-hw,w*.4,hw*2);
    c.fillStyle='#00d2be'; c.fillRect(x0,-.75,w,1.5);
  }else if(id==='mclaren'){
    c.fillStyle='#47c7e8'; c.fillRect(x0,-hw,w*.5,hw*2);
  }else if(id==='aston'){
    c.fillStyle='#c5e86b'; c.fillRect(x0,-.55,w,1.1); c.fillRect(x0,-hw,w*.16,hw*2);
  }else if(id==='alpine'){
    c.fillStyle='#0055a5'; c.fillRect(x0,-hw,w,hw*.38); c.fillRect(x0,hw*.62,w,hw*.38);
  }else if(id==='renault'){
    c.fillStyle='#141414'; c.fillRect(x0,-hw,w*.55,hw*.4); c.fillRect(x0,hw*.6,w*.55,hw*.4);
  }else if(id==='racingbulls'){
    c.fillStyle='#f4f0ea'; c.fillRect(x0,-hw,w*.7,hw*.36); c.fillRect(x0,hw*.64,w*.7,hw*.36);
    c.fillStyle='#e10600'; c.fillRect(x0,-.5,w,1);
  }else if(id==='haas'){
    c.fillStyle='#e10600'; c.fillRect(x0,-hw*.22,w,hw*.44);
    c.fillStyle='#111'; c.fillRect(x0,-.4,w,.8);
  }else if(id==='sauber'){
    c.fillStyle='#9dff00'; c.fillRect(x0,-.6,w,1.2); c.fillRect(x1-w*.22,-hw,w*.22,hw*2);
  }
}
function clipVinyl(c,pathFn,liv,x0,x1,hw){
  c.save(); pathFn(c); c.clip(); paintVinyl(c,liv,x0,x1,hw); c.restore();
}
function paintBadge(c,liv,x){
  c.fillStyle=liv.badge||'#ffd100';
  if(liv.id==='ferrari'){
    c.beginPath(); c.moveTo(x,0); c.lineTo(x-2.4,-1.7); c.lineTo(x-4.2,-1.2); c.lineTo(x-4.2,1.2); c.lineTo(x-2.4,1.7); c.closePath(); c.fill();
  }else{ c.beginPath(); c.arc(x,0,1.15,0,Math.PI*2); c.fill(); }
}
function brakeGlow(c,o,draw){
  if(o.braking){ c.shadowColor='rgba(255,50,35,.95)'; c.shadowBlur=8; c.fillStyle='#ff4433'; }
  else c.fillStyle='#c0261a';
  draw(); c.shadowBlur=0;
}
function drawWheel(c,x,y){ c.fillStyle='#0e0d0b'; rrp(c,x-3,y-1.8,6,3.6,1.2); c.fill(); c.fillStyle='#4a4740'; c.beginPath(); c.arc(x,y,1,0,Math.PI*2); c.fill(); }
function drawSlick(c,x,y,len,wid){
  c.fillStyle='#10100e'; rrp(c,x-len/2,y-wid/2,len,wid,1.3); c.fill();
  c.fillStyle='#555248'; c.beginPath(); c.ellipse(x,y,len*.2,wid*.24,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(x-len*.1,y-wid*.08,len*.07,wid*.09,0,0,Math.PI*2); c.fill();
}
function carBodyPath(c){
  c.beginPath();
  c.moveTo(14,-2); c.bezierCurveTo(14,-4.5,11.5,-6.5,8,-7);
  c.bezierCurveTo(4,-7.5,-4,-7.6,-8,-7.1);
  c.bezierCurveTo(-11.5,-6.6,-13.8,-4.8,-14,-2.5);
  c.bezierCurveTo(-14.3,-1,-14.3,1,-14,2.5);
  c.bezierCurveTo(-13.8,4.8,-11.5,6.6,-8,7.1);
  c.bezierCurveTo(-4,7.6,4,7.5,8,7);
  c.bezierCurveTo(11.5,6.5,14,4.5,14,2);
  c.closePath();
}
/* ── stock car (NASCAR) ─────────────────────────────────────────────────
   Geniş, ağır gövde: burun x=+17, arka x=-17, yarı genişlik 8.8.
   Çatıda numara, arkada spoiler, önde splitter.                          */
function stockBodyPath(c){
  c.beginPath();
  c.moveTo(16.8,-3.4);
  c.bezierCurveTo(16.8,-6.6,14.4,-8.5,10.6,-8.8);
  c.lineTo(-10.4,-8.8);
  c.bezierCurveTo(-14.4,-8.5,-16.4,-6.6,-16.6,-3.4);
  c.bezierCurveTo(-16.8,-1.2,-16.8,1.2,-16.6,3.4);
  c.bezierCurveTo(-16.4,6.6,-14.4,8.5,-10.4,8.8);
  c.lineTo(10.6,8.8);
  c.bezierCurveTo(14.4,8.5,16.8,6.6,16.8,3.4);
  c.closePath();
}
function stockTire(c,x,y){
  c.fillStyle='#0c0b09'; rrp(c,x-3.6,y-2.1,7.2,4.2,1.2); c.fill();
  c.fillStyle='rgba(255,255,255,.07)'; c.fillRect(x-3.2,y-1.9,6.4,.7);
}
function drawStock(c,color,o,liv){
  const dmg=clamp(o.damage||0,0,1);
  // lastikler gövdenin altında: sadece dış omuzları görünür
  [[10.4,-8.2],[10.4,8.2],[-10.2,-8.2],[-10.2,8.2]].forEach(p=>stockTire(c,p[0],p[1]));
  // splitter + arka difüzör
  c.fillStyle='#17160f'; rrp(c,15.2,-9.2,3.2,18.4,1); c.fill();
  c.fillStyle='#1b1a14'; rrp(c,-18.2,-7.6,2.6,15.2,1); c.fill();

  c.shadowColor='rgba(0,0,0,.5)'; c.shadowBlur=4; c.shadowOffsetY=1.6;
  stockBodyPath(c); paintBody(c,liv.base,8.8);
  c.shadowBlur=0; c.shadowOffsetY=0;
  clipVinyl(c,stockBodyPath,liv,-16.8,16.8,8.8);

  // gövde kenar çizgisi + kapı ayrımı
  c.strokeStyle='rgba(0,0,0,.22)'; c.lineWidth=.7; stockBodyPath(c); c.stroke();

  // greenhouse: tek kabin gövdesi, camlar içine gömülü
  c.fillStyle=shadeHex(liv.base,-16); rrp(c,-7.4,-5.6,15,11.2,2.4); c.fill();
  c.fillStyle='rgba(16,22,32,.8)';   // ön cam
  c.beginPath(); c.moveTo(7.3,-4.6); c.lineTo(4.4,-5.2); c.lineTo(4.4,5.2); c.lineTo(7.3,4.6); c.closePath(); c.fill();
  c.fillStyle='rgba(16,22,32,.66)';  // arka cam
  c.beginPath(); c.moveTo(-7,-4.4); c.lineTo(-4.6,-5); c.lineTo(-4.6,5); c.lineTo(-7,4.4); c.closePath(); c.fill();
  c.fillStyle='rgba(200,225,240,.17)'; rrp(c,5.4,-4,1.5,3.2,.6); c.fill();

  // çatı numarası
  if(liv.num){
    c.save(); c.rotate(-Math.PI/2);
    c.font='700 8px "Oswald","Arial Narrow",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillStyle='rgba(0,0,0,.45)'; c.fillText(liv.num,0.6,-0.2);
    c.fillStyle=liv.numCol||'#f4f2ec'; c.fillText(liv.num,0,-0.8);
    c.restore();
  }
  // çatı bayrağı (aero fin) + spoiler
  c.fillStyle=shadeHex(liv.base,-34); c.fillRect(-6.4,-5.9,13,1); c.fillRect(-6.4,4.9,13,1);
  c.fillStyle=liv.wing||shadeHex(liv.base,-24); rrp(c,-17.4,-8.2,2.6,16.4,.8); c.fill();
  c.fillStyle='rgba(255,255,255,.12)'; c.fillRect(-17.4,-8.2,2.6,1.2);

  // far/stop decal'leri
  c.fillStyle='rgba(245,238,200,.85)'; rrp(c,13.4,-7.4,2.6,3.4,.7); c.fill(); rrp(c,13.4,4,2.6,3.4,.7); c.fill();
  brakeGlow(c,o,()=>{ rrp(c,-16.4,-7,2,3.2,.6); c.fill(); rrp(c,-16.4,3.8,2,3.2,.6); c.fill(); });

  // hasar: ezik paneller + is izi
  if(dmg>0.02){
    c.save(); stockBodyPath(c); c.clip();
    c.fillStyle='rgba(16,14,11,'+(0.72*dmg).toFixed(3)+')';
    c.beginPath(); c.ellipse(12.5,-6.2,7*dmg+2.4,4*dmg+1.6,0.4,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(-9,7,8*dmg+2.4,3.6*dmg+1.4,-0.3,0,Math.PI*2); c.fill();
    if(dmg>0.35){
      c.strokeStyle='rgba(10,9,7,.72)'; c.lineWidth=1.3;
      c.beginPath(); c.moveTo(16.4,-4.4); c.lineTo(9,-7.8); c.lineTo(2.5,-5.6); c.stroke();
      c.beginPath(); c.moveTo(-15,5.2); c.lineTo(-7,8.2); c.stroke();
    }
    if(dmg>0.62){   // kaput/çamurluk açılmış
      c.fillStyle='rgba(120,112,96,.5)';
      c.beginPath(); c.moveTo(14.5,-8.6); c.lineTo(8,-8.8); c.lineTo(10,-4.6); c.closePath(); c.fill();
      c.strokeStyle='rgba(8,7,5,.6)'; c.lineWidth=.9; c.stroke();
    }
    c.restore();
  }
  if(o.isSelf){ c.strokeStyle='rgba(240,236,220,.85)'; c.lineWidth=1.2; stockBodyPath(c); c.stroke(); }
}
function drawGt(c,color,o,liv){
  drawWheel(c,9,-8); drawWheel(c,9,8); drawWheel(c,-9,-8); drawWheel(c,-9,8);
  c.shadowColor='rgba(0,0,0,.5)'; c.shadowBlur=4; c.shadowOffsetY=1.5;
  carBodyPath(c); paintBody(c,liv.base,7);
  c.shadowBlur=0; c.shadowOffsetY=0;
  clipVinyl(c,carBodyPath,liv,-14,14,7);
  c.strokeStyle='rgba(0,0,0,.16)'; c.lineWidth=.6;
  c.beginPath(); c.moveTo(13,0); c.lineTo(3,0); c.stroke();
  c.fillStyle=shadeHex(liv.base,-36); rrp(c,-6.5,-5.6,11,11.2,2.8); c.fill();
  c.fillStyle='rgba(28,38,52,.7)'; rrp(c,-5.8,-4.7,9.6,9.4,2.2); c.fill();
  c.fillStyle='rgba(200,225,240,.22)'; rrp(c,-5.2,-3.8,3.5,7.6,1.5); c.fill();
  c.fillStyle=liv.pod||shadeHex(liv.base,-18); rrp(c,2,-8.8,2.2,1.8,.7); c.fill(); rrp(c,2,7,2.2,1.8,.7); c.fill();
  c.fillStyle='#fff6c4'; rrp(c,11.8,-5.6,2.2,2.2,.8); c.fill(); rrp(c,11.8,3.4,2.2,2.2,.8); c.fill();
  brakeGlow(c,o,()=>{ rrp(c,-14.2,-5,1.8,2.2,.5); c.fill(); rrp(c,-14.2,2.8,1.8,2.2,.5); c.fill(); });
  if(o.isSelf){ c.strokeStyle='rgba(240,236,220,.85)'; c.lineWidth=1.2; carBodyPath(c); c.stroke(); }
}
function kartPath(c){
  c.beginPath();
  c.moveTo(9,-4.1); c.lineTo(9,4.1); c.lineTo(6.2,5.5); c.lineTo(-7.2,5.5);
  c.lineTo(-9.2,3.1); c.lineTo(-9.2,-3.1); c.lineTo(-7.2,-5.5); c.lineTo(6.2,-5.5);
  c.closePath();
}
function drawKart(c,color,o,liv){
  c.strokeStyle='rgba(36,34,30,.9)'; c.lineWidth=1.45; c.lineCap='round';
  c.beginPath(); c.moveTo(7.1,-9.1); c.lineTo(7.1,9.1); c.stroke();
  c.beginPath(); c.moveTo(-6.5,-9.1); c.lineTo(-6.5,9.1); c.stroke();
  [[7.1,-9.35],[7.1,9.35],[-6.5,-9.35],[-6.5,9.35]].forEach(([x,y])=>{
    c.fillStyle='#12110f'; rrp(c,x-3.7,y-2.55,7.4,5.1,1.7); c.fill();
    c.fillStyle='#5c5850'; c.beginPath(); c.ellipse(x,y,1.55,1.15,0,0,Math.PI*2); c.fill();
  });
  c.fillStyle=liv.nose||liv.base; rrp(c,8.1,-5.9,3.4,11.8,2); c.fill();
  c.fillStyle=liv.wing||shadeHex(liv.base,-10); rrp(c,-10.6,-5.3,3.6,10.6,1.5); c.fill();
  c.shadowColor='rgba(0,0,0,.45)'; c.shadowBlur=3; c.shadowOffsetY=1;
  kartPath(c); paintBody(c,liv.base,5.5);
  c.shadowBlur=0; c.shadowOffsetY=0;
  clipVinyl(c,kartPath,liv,-9.2,9,5.5);
  c.fillStyle=liv.pod||shadeHex(liv.base,-18); rrp(c,-5.2,-6.9,10.4,1.9,.8); c.fill(); rrp(c,-5.2,5,10.4,1.9,.8); c.fill();
  c.fillStyle='#2c2f28'; rrp(c,-3.4,-3.3,7.2,6.6,2.1); c.fill();
  c.fillStyle='#161814'; rrp(c,-1.8,-2.3,4.8,4.6,1.7); c.fill();
  c.fillStyle='#d6d2c6'; c.beginPath(); c.arc(2.3,0,2.15,0,Math.PI*2); c.fill();
  c.fillStyle='#1c2838'; rrp(c,2.5,-1.45,1.7,2.9,.7); c.fill();
  c.strokeStyle='#c9c5b9'; c.lineWidth=1.15; c.beginPath(); c.arc(6.3,0,1.85,-.85,.85); c.stroke();
  c.fillStyle='#3c3c38'; rrp(c,-8.8,-2.5,3.9,5,.8); c.fill();
  c.fillStyle='#6c6a62'; c.fillRect(-8.4,-1.7,3.1,.65); c.fillRect(-8.4,1.05,3.1,.65);
  brakeGlow(c,o,()=>{ rrp(c,-10.8,-3.5,1.5,1.9,.4); c.fill(); rrp(c,-10.8,1.6,1.5,1.9,.4); c.fill(); });
  if(o.isSelf){ c.strokeStyle='rgba(240,236,220,.85)'; c.lineWidth=1.2; kartPath(c); c.stroke(); }
}
/* Menajer sınıfları: karting → F1. Hepsi üstten bakış, takım rengini gövdeye boyar. */
const FSPEC={
  f4:{fx:7.2,rx:-6.6,wy:9.2,sl:5.4,sw:3.2,nose:10.0,tail:-9.0,hw:3.5,fwX:9.8,fwS:13.0,fwT:2.0,fwN:1,rwX:-10.2,rwS:8.2,rwT:2.0,halo:0,fin:0,barge:0,podX:-6.4,podL:6.6,podW:1.8,podY:3.6},
  f3:{fx:9.4,rx:-8.6,wy:10.0,sl:5.8,sw:3.2,nose:13.4,tail:-11.4,hw:3.2,fwX:13.2,fwS:16.2,fwT:2.1,fwN:2,rwX:-13.0,rwS:11.8,rwT:2.4,halo:1,fin:0,barge:0,podX:-7.8,podL:8.4,podW:1.9,podY:3.8},
  f2:{fx:11.0,rx:-10.2,wy:10.5,sl:6.1,sw:3.35,nose:15.6,tail:-13.2,hw:3.25,fwX:15.4,fwS:18.0,fwT:2.25,fwN:2,rwX:-15.0,rwS:13.6,rwT:2.6,halo:1,fin:1,barge:1,podX:-9.2,podL:10.0,podW:2.15,podY:4.05},
  f1:{fx:13.0,rx:-12.0,wy:11.3,sl:6.5,sw:3.5,nose:19.0,tail:-15.4,hw:3.15,fwX:18.8,fwS:22.2,fwT:2.45,fwN:3,rwX:-17.4,rwS:16.6,rwT:2.9,halo:1,fin:1,barge:1,podX:-10.6,podL:11.4,podW:2.4,podY:4.3},
};
function chassisPath(c,s){
  const n=s.nose,t=s.tail,w=s.hw,nw=w*.32;
  c.beginPath();
  c.moveTo(n,0);
  c.bezierCurveTo(n,-nw,n-4,-w,n-9,-w);
  c.lineTo(1.5,-w);
  c.bezierCurveTo(-1,-w*1.15,-3,-w*1.05,-5,-w*.9);
  c.lineTo(t+2,-w*.55); c.lineTo(t,0); c.lineTo(t+2,w*.55);
  c.lineTo(-5,w*.9);
  c.bezierCurveTo(-3,w*1.05,-1,w*1.15,1.5,w);
  c.lineTo(n-9,w);
  c.bezierCurveTo(n-4,w,n,nw,n,0);
  c.closePath();
}
function drawFormula(c,color,o,s,liv){
  c.fillStyle='#141310'; c.fillRect(s.rwX-1.2,-s.rwS/2,2.4,s.rwS);
  c.fillStyle=liv.wing||shadeHex(liv.base,-6); rrp(c,s.rwX-s.rwT/2,-s.rwS/2,s.rwT,s.rwS,.5); c.fill();
  if(s.fwN>=2){ c.fillStyle=liv.wing2||shadeHex(liv.base,8); rrp(c,s.rwX+1.4,-s.rwS/2+1,s.rwT*.7,s.rwS-2,.4); c.fill(); }
  c.fillStyle='#0c0b09'; c.fillRect(s.rwX-3.2,-s.rwS/2-.4,6.4,2); c.fillRect(s.rwX-3.2,s.rwS/2-1.6,6.4,2);
  for(let i=s.fwN-1;i>=0;i--){
    c.fillStyle=i?shadeHex(liv.wing2||liv.base,10-i*8):(liv.wing2||liv.base);
    rrp(c,s.fwX-s.fwT/2-i*1.5,-s.fwS/2+i*.8,s.fwT,s.fwS-i*1.6,.5); c.fill();
  }
  c.fillStyle='#12110e'; c.fillRect(s.fwX-2.4,-s.fwS/2-.5,4.2,1.7); c.fillRect(s.fwX-2.4,s.fwS/2-1.2,4.2,1.7);
  c.strokeStyle='rgba(30,28,24,.9)'; c.lineWidth=1.15; c.lineCap='round';
  c.beginPath(); c.moveTo(s.fx,-s.wy+1.4); c.lineTo(s.fx,s.wy-1.4); c.stroke();
  c.beginPath(); c.moveTo(s.rx,-s.wy+1.4); c.lineTo(s.rx,s.wy-1.4); c.stroke();
  if(s.barge){
    c.fillStyle=liv.pod||shadeHex(liv.base,-28);
    rrp(c,1.2,-s.podY-.6,4.2,1.2,.4); c.fill(); rrp(c,1.2,s.podY-.6,4.2,1.2,.4); c.fill();
  }
  c.fillStyle=liv.pod||shadeHex(liv.base,-14);
  rrp(c,s.podX,-s.podY-s.podW/2,s.podL,s.podW,1); c.fill();
  rrp(c,s.podX,s.podY-s.podW/2,s.podL,s.podW,1); c.fill();
  c.fillStyle='rgba(255,255,255,.12)'; rrp(c,s.podX+1,-s.podY-s.podW/2+.2,s.podL*.35,s.podW*.4,.4); c.fill();
  if(s.fin){
    c.fillStyle=shadeHex(liv.base,-30);
    c.beginPath(); c.moveTo(-2,0); c.lineTo(s.rwX+2,-.55); c.lineTo(s.rwX+2,.55); c.closePath(); c.fill();
  }
  c.shadowColor='rgba(0,0,0,.45)'; c.shadowBlur=3; c.shadowOffsetY=1;
  chassisPath(c,s); paintBody(c,liv.base,s.hw+1);
  c.shadowBlur=0; c.shadowOffsetY=0;
  clipVinyl(c,()=>chassisPath(c,s),liv,s.tail,s.nose,s.hw+1.2);
  c.strokeStyle='rgba(0,0,0,.18)'; c.lineWidth=.55; chassisPath(c,s); c.stroke();
  c.fillStyle='rgba(18,24,34,.88)'; rrp(c,-2.2,-2.35,6.6,4.7,1.7); c.fill();
  c.fillStyle='rgba(190,215,235,.16)'; rrp(c,-.6,-1.5,3.2,3,1.1); c.fill();
  if(s.halo){
    c.strokeStyle=liv.halo||'#d0cdc4'; c.lineWidth=1.55; c.lineCap='round';
    c.beginPath(); c.arc(1.4,0,3.15,.35,Math.PI*2-.35); c.stroke();
    c.strokeStyle='#9a978e'; c.lineWidth=1.15;
    c.beginPath(); c.moveTo(1.4,-3.1); c.lineTo(1.4,3.1); c.stroke();
  } else {
    c.fillStyle='#d8d4c8'; c.beginPath(); c.arc(1.6,0,1.85,0,Math.PI*2); c.fill();
    c.fillStyle='#1c2838'; rrp(c,1.8,-1.2,1.3,2.4,.5); c.fill();
    c.strokeStyle='#2a2a28'; c.lineWidth=1.7;
    c.beginPath(); c.arc(-1.6,0,2.5,-Math.PI/2-.2,Math.PI/2+.2); c.stroke();
  }
  paintBadge(c,liv,s.nose-3.2);
  c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=.7;
  c.beginPath(); c.moveTo(s.nose-1,0); c.lineTo(4,0); c.stroke();
  [[s.fx,-s.wy],[s.fx,s.wy],[s.rx,-s.wy],[s.rx,s.wy]].forEach(p=>drawSlick(c,p[0],p[1],s.sl,s.sw));
  brakeGlow(c,o,()=>{ rrp(c,s.rwX-1.5,-s.rwS/2+.4,3,1.5,.3); c.fill(); rrp(c,s.rwX-1.5,s.rwS/2-1.9,3,1.5,.3); c.fill(); });
  if(o.isSelf){ c.strokeStyle='rgba(240,236,220,.85)'; c.lineWidth=1.15; chassisPath(c,s); c.stroke(); }
}
const KIND_SC={gt:1,kart:.9,f4:.96,f3:1.06,f2:1.16,f1:1.28,stock:1.04};
const KIND_SHADOW={gt:[15,8],kart:[12,9],f4:[14,7],f3:[15,7],f2:[17,7],f1:[19,7],stock:[18,10]};
const KIND_TAIL={gt:-17,kart:-12,f4:-14,f3:-16,f2:-18,f1:-20,stock:-20};
/* o: {kind, label, labelSize, isSelf, boosting, braking, scale, headlights}
   kind: 'gt' | 'kart' | 'f4' | 'f3' | 'f2' | 'f1' */
export function drawCar(c,x,y,angle,color,o){
  o=o||{};
  const kind=o.kind||'gt', sc=(o.scale||1)*(KIND_SC[kind]||1);
  const sh=KIND_SHADOW[kind]||KIND_SHADOW.gt, tail=KIND_TAIL[kind]||KIND_TAIL.gt;
  c.save(); c.translate(x,y); if(sc!==1) c.scale(sc,sc);
  if(o.boosting){
    c.save(); c.rotate(angle);
    const gl=c.createRadialGradient(tail+2,0,1,tail+2,0,15);
    gl.addColorStop(0,'rgba(255,170,60,.55)'); gl.addColorStop(1,'rgba(255,170,60,0)');
    c.fillStyle=gl; c.beginPath(); c.arc(tail,0,15,0,Math.PI*2); c.fill();
    c.restore();
  }
  if(o.headlights!==false&&(kind==='gt'||kind==='stock')){
    c.save(); c.rotate(angle);
    const hl=c.createRadialGradient(18,0,2,18,0,27);
    hl.addColorStop(0,'rgba(255,246,196,.20)'); hl.addColorStop(1,'rgba(255,246,196,0)');
    c.fillStyle=hl; c.beginPath(); c.ellipse(22,0,26,15,0,0,Math.PI*2); c.fill();
    c.restore();
  }
  c.save(); c.translate(1.5,2.5); c.rotate(angle);
  c.fillStyle='rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0,0,sh[0],sh[1],0,0,Math.PI*2); c.fill();
  c.restore();
  c.save(); c.rotate(angle);
  const liv=liveryOf(color);
  if(kind==='kart') drawKart(c,color,o,liv);
  else if(kind==='stock') drawStock(c,color,o,liv);
  else if(FSPEC[kind]) drawFormula(c,color,o,FSPEC[kind],liv);
  else drawGt(c,color,o,liv);
  c.restore();
  c.restore();
  if(o.label){
    const ly=y-22*sc;
    c.font='600 '+(o.labelSize||14)+'px -apple-system,"Segoe UI",Arial,sans-serif'; c.textAlign='center';
    c.fillStyle='rgba(0,0,0,.4)'; c.fillText(o.label,x+1,ly+1);
    c.fillStyle=o.isSelf?'#f2f0e0':'rgba(238,234,220,.88)'; c.fillText(o.label,x,ly);
  }
}
const THUMB_SC={gt:1.35,kart:1.42,f4:1.22,f3:1.08,f2:.92,f1:.78,stock:1.08};
export function paintCarThumb(canvas,kind,color,w,h,scale){
  w=w||72; h=h||44;
  const d=typeof window!=='undefined'?Math.min(window.devicePixelRatio||1,2):1;
  canvas.width=w*d; canvas.height=h*d;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  const ctx=canvas.getContext('2d');
  ctx.setTransform(d,0,0,d,0,0); ctx.clearRect(0,0,w,h);
  drawCar(ctx,w/2,h/2,0,color,{kind:kind||'gt',scale:scale||THUMB_SC[kind]||1.2,headlights:false});
}
