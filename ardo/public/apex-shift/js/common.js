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
export const COLORS=['#3aa0ff','#38d39f','#c792ea','#ff6fb0','#f4b400','#f2f2f2','#8d6bff','#7fd93a'];

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
function drawWheel(c,x,y){ c.fillStyle='#0e0d0b'; rrp(c,x-3,y-1.8,6,3.6,1.2); c.fill(); c.fillStyle='#4a4740'; c.beginPath(); c.arc(x,y,1,0,Math.PI*2); c.fill(); }
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
/* o: {label, labelSize, isSelf, boosting, braking, scale, headlights} */
export function drawCar(c,x,y,angle,color,o){
  o=o||{};
  const sc=o.scale||1;
  c.save(); c.translate(x,y); if(sc!==1) c.scale(sc,sc);
  if(o.boosting){
    c.save(); c.rotate(angle);
    const gl=c.createRadialGradient(-15,0,1,-15,0,15);
    gl.addColorStop(0,'rgba(255,170,60,.55)'); gl.addColorStop(1,'rgba(255,170,60,0)');
    c.fillStyle=gl; c.beginPath(); c.arc(-17,0,15,0,Math.PI*2); c.fill();
    c.restore();
  }
  if(o.headlights!==false){
    c.save(); c.rotate(angle);
    const hl=c.createRadialGradient(18,0,2,18,0,27);
    hl.addColorStop(0,'rgba(255,246,196,.20)'); hl.addColorStop(1,'rgba(255,246,196,0)');
    c.fillStyle=hl; c.beginPath(); c.ellipse(22,0,26,15,0,0,Math.PI*2); c.fill();
    c.restore();
  }
  c.save(); c.translate(1.5,2.5); c.rotate(angle);
  c.fillStyle='rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0,0,15,8,0,0,Math.PI*2); c.fill();
  c.restore();
  c.save(); c.rotate(angle);
  drawWheel(c,9,-8); drawWheel(c,9,8); drawWheel(c,-9,-8); drawWheel(c,-9,8);
  c.shadowColor='rgba(0,0,0,.5)'; c.shadowBlur=4; c.shadowOffsetY=1.5;
  carBodyPath(c);
  const gr=c.createLinearGradient(0,-7,0,7);
  gr.addColorStop(0,shadeHex(color,-20)); gr.addColorStop(.3,shadeHex(color,22));
  gr.addColorStop(.5,shadeHex(color,30)); gr.addColorStop(.7,shadeHex(color,22)); gr.addColorStop(1,shadeHex(color,-20));
  c.fillStyle=gr; c.fill();
  c.shadowBlur=0; c.shadowOffsetY=0;
  c.strokeStyle='rgba(0,0,0,.16)'; c.lineWidth=.6;
  c.beginPath(); c.moveTo(13,0); c.lineTo(3,0); c.stroke();
  c.fillStyle=shadeHex(color,-36); rrp(c,-6.5,-5.6,11,11.2,2.8); c.fill();
  c.fillStyle='rgba(28,38,52,.7)'; rrp(c,-5.8,-4.7,9.6,9.4,2.2); c.fill();
  c.fillStyle='rgba(200,225,240,.22)'; rrp(c,-5.2,-3.8,3.5,7.6,1.5); c.fill();
  c.fillStyle=shadeHex(color,-18);
  rrp(c,2,-8.8,2.2,1.8,.7); c.fill();
  rrp(c,2,7,2.2,1.8,.7); c.fill();
  c.fillStyle='#fff6c4'; rrp(c,11.8,-5.6,2.2,2.2,.8); c.fill(); rrp(c,11.8,3.4,2.2,2.2,.8); c.fill();
  if(o.braking){ c.shadowColor='rgba(255,50,35,.95)'; c.shadowBlur=9; c.fillStyle='#ff4433'; }
  else{ c.fillStyle='#c0261a'; }
  rrp(c,-14.2,-5,1.8,2.2,.5); c.fill(); rrp(c,-14.2,2.8,1.8,2.2,.5); c.fill();
  c.shadowBlur=0;
  if(o.isSelf){ c.strokeStyle='rgba(240,236,220,.85)'; c.lineWidth=1.2; carBodyPath(c); c.stroke(); }
  c.restore();
  c.restore();
  if(o.label){
    const ly=y-22*sc;
    c.font='600 '+(o.labelSize||14)+'px -apple-system,"Segoe UI",Arial,sans-serif'; c.textAlign='center';
    c.fillStyle='rgba(0,0,0,.4)'; c.fillText(o.label,x+1,ly+1);
    c.fillStyle=o.isSelf?'#f2f0e0':'rgba(238,234,220,.88)'; c.fillText(o.label,x,ly);
  }
}
