/* Apex Shift — Online mod: aynı oda kodunu giren herkes aynı oval pistte yarışır. */
import {$,clamp,lerp,lerpAngle,fmtTime,sanitName,drawTree,drawCar,flashHint,crossFade,isTouch,reduceMotion,COLORS,LIVERIES,liveryOf,liveryFill,paintCarThumb,audio,initAudio,sfx} from './common.js';

/* ── constants ─────────────────────────── */
const SYNC_MS=450, STALE_MS=6000, PRUNE_MS=14000, LEAD_MS=3000, TOTAL_LAPS=3;
const PODIUM_MS=5000, PHASE_GUARD_MS=2600, NET_FAIL_LIMIT=3;
const FB_BASE='https://switch-master-687ff-default-rtdb.europe-west1.firebasedatabase.app';
const CW=1000,CH=600,CX=500,CY=300;
const OA=430,OB=260, IA=230,IB=110, MA=330,MB=185;
const FINISH_GATE={x1:CX,y1:CY-OB,x2:CX,y2:CY-IB};
const HALF_GATE  ={x1:CX,y1:CY+IB,x2:CX,y2:CY+OB};
const START_SLOTS=[
  {x:480,y:CY-225},{x:480,y:CY-185},{x:480,y:CY-145},
  {x:445,y:CY-225},{x:445,y:CY-185},{x:445,y:CY-145},
  {x:410,y:CY-225},{x:410,y:CY-185},{x:410,y:CY-145},
];
const MAX_SPD=270, REV_SPD=110, ACCEL=215, BRAKE=330, FRICTION=135, TURN=2.95, MIN_TURN_SPD=8;
const OFF_MULT=0.44, OFF_FRIC=2.5;
const TRAIL_LIFE=800, TRAIL_GAP=52, TRAIL_MAX=350, DUST_LIFE=520;
const NITRO_MS=1200, NITRO_SPEED_MULT=1.32, NITRO_ACCEL_MULT=1.7, NITRO_CHARGES=3;

/* ── state ─────────────────────────────── */
const uid='p'+Date.now().toString(36)+(Math.random()*1e6|0).toString(36);

let pName='',roomCode='';
let netOk=null, netFails=0, clockOffset=0, phaseGuardUntil=0, finishShownAt=0, isHost=false;
let localPhase='menu'; // menu | lobby | waiting | racing
let car=null, remoteCars={}, trailPts=[], dustPts=[];
let keys={}, touch={l:0,r:0,g:0,b:0};
let rafId=null,syncTimer=null,syncBusy=false,startingRace=false;
let lastT=0, nitroActiveUntil=0;

/* ── motor sesi ────────────────────────── */
let engineOsc=null, engineGain=null, engineFilter=null;
function startEngine(){
  const a=audio.ctx;
  if(!a||engineOsc) return;
  try{
    engineOsc=a.createOscillator(); engineOsc.type='sawtooth'; engineOsc.frequency.value=55;
    engineFilter=a.createBiquadFilter(); engineFilter.type='lowpass'; engineFilter.frequency.value=700;
    engineGain=a.createGain(); engineGain.gain.value=0;
    engineOsc.connect(engineFilter); engineFilter.connect(engineGain); engineGain.connect(audio.master);
    engineOsc.start();
  }catch(e){}
}
function updateEngineSound(){
  const a=audio.ctx;
  if(!a||!engineOsc) return;
  const active=(localPhase==='racing'&&!car.locked&&!audio.muted);
  const speedFrac=Math.min(1,Math.abs(car.speed)/MAX_SPD);
  const t=a.currentTime;
  engineGain.gain.setTargetAtTime(active?(0.045+0.09*speedFrac):0.0001, t, 0.08);
  engineOsc.frequency.setTargetAtTime(52+speedFrac*150, t, 0.08);
  engineFilter.frequency.setTargetAtTime(500+speedFrac*1800, t, 0.08);
}

/* ── dom ───────────────────────────────── */
const menuEl=$('menu'),gameEl=$('game');
const canvas=$('canvas'),ctx=canvas.getContext('2d');
const dot=$('dot'),connText=$('connText'),lpDot=$('lpDot'),lpConnText=$('lpConnText');
const hudPanel=$('hudPanel'),lbPanel=$('lbPanel');
const lapText=$('lapText'),timeText=$('timeText'),speedText=$('speedText'),bestLapText=$('bestLapText'),posText=$('posText');
const nosPips=()=>document.querySelectorAll('#nosRow .nos-pip');
const lbTitle=$('lbTitle'),lbRows=$('lbRows');
const lobbyPanel=$('lobbyPanel'),lpWaiting=$('lpWaiting'),lpLobby=$('lpLobby');
const lpRoomCode=$('lpRoomCode'),lpWaitList=$('lpWaitList');
const colorPicker=$('colorPicker'),lpPlayerList=$('lpPlayerList'),lpCountLabel=$('lpCountLabel');
const startRaceBtn=$('startRaceBtn');
const finishEl=$('finish'),finTimeEl=$('finTime'),finBestLapEl=$('finBestLap'),finStatusEl=$('finStatus');
const countdownEl=$('countdown'),cdNum=$('cdNum');
const tcEl=$('tc');

/* ── high-DPI canvas ───────────────────── */
const dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=CW*dpr; canvas.height=CH*dpr;
ctx.setTransform(dpr,0,0,dpr,0,0);
const trackCv=document.createElement('canvas');
trackCv.width=CW*dpr; trackCv.height=CH*dpr;
const tctx=trackCv.getContext('2d');
tctx.setTransform(dpr,0,0,dpr,0,0);

/* ── helpers ───────────────────────────── */
function nowSync(){return Date.now()+clockOffset;}
function safeN(v,f){return isFinite(Number(v))?Number(v):f;}
function slotIdx(id){let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return h%START_SLOTS.length;}
function randRoom(){const C='ABCDEFGHJKLMNPQRTVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=C[Math.random()*C.length|0];return s;}
function sanitRoom(v){return(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);}
function segsect(p1,p2,p3,p4){function ccw(a,b,c){return(c.y-a.y)*(b.x-a.x)-(b.y-a.y)*(c.x-a.x);}const d1=ccw(p3,p4,p1),d2=ccw(p3,p4,p2),d3=ccw(p1,p2,p3),d4=ccw(p1,p2,p4);return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));}
function isOnTrack(x,y){const dx=x-CX,dy=y-CY;return(dx*dx)/(OA*OA)+(dy*dy)/(OB*OB)<=1.02&&(dx*dx)/(IA*IA)+(dy*dy)/(IB*IB)>=0.98;}

/* ── firebase realtime db networking ───── */
/* Oda düzeni:  /apex/rooms/<KOD>/meta            {phase, raceStartAt, ts}
                /apex/rooms/<KOD>/players/<uid>   {name,color,x,y,angle,...}
   Her istemci YALNIZCA kendi players/<uid> yolunu yazar; tüm odayı geri
   yazmadığı için eşzamanlı güncellemeler birbirini ezmez. meta'yı sadece
   "host" (canlı oyuncular arasında en küçük uid) yazar.                    */
const roomPath=p=>FB_BASE+'/apex/rooms/'+encodeURIComponent(roomCode)+(p||'')+'.json';
const JSON_HDR={'Content-Type':'application/json'};

/* Tarayıcı saatleri saniyelerce kayabiliyor; geri sayım ve tur süreleri
   ortak olsun diye Date başlığından sunucu saatine kilitleniyoruz. */
function syncClock(res,sentAt){
  const h=res.headers.get('date'); if(!h) return;
  const srv=Date.parse(h); if(!isFinite(srv)) return;
  const off=srv+(Date.now()-sentAt)/2-Date.now();
  clockOffset=(netOk===null)?off:lerp(clockOffset,off,.25);
}
async function fbFetch(url,opts){
  const sentAt=Date.now();
  const res=await fetch(url,opts);
  syncClock(res,sentAt);
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res;
}
function netUp(){ netFails=0; if(netOk!==true){ netOk=true; setConn(true); } }
function netDown(){ netFails++; if(netFails>=NET_FAIL_LIMIT&&netOk!==false){ netOk=false; setConn(false); } }

async function netGetRoom(){
  try{
    const res=await fbFetch(roomPath(),{cache:'no-store'});
    const raw=await res.json();
    netUp();
    const meta=(raw&&raw.meta&&typeof raw.meta==='object')?raw.meta:{};
    return{
      phase:meta.phase==='racing'?'racing':'lobby',
      raceStartAt:safeN(meta.raceStartAt,0),
      players:(raw&&raw.players&&typeof raw.players==='object')?raw.players:{}
    };
  }catch(e){ netDown(); return null; }
}
async function netPutMe(entry){
  try{ await fbFetch(roomPath('/players/'+uid)+'?print=silent',{method:'PUT',headers:JSON_HDR,body:JSON.stringify(entry)}); netUp(); return true; }
  catch(e){ netDown(); return false; }
}
async function netSetMeta(phase,raceStartAt){
  try{ await fbFetch(roomPath('/meta')+'?print=silent',{method:'PUT',headers:JSON_HDR,body:JSON.stringify({phase:phase,raceStartAt:raceStartAt||null,ts:nowSync()})}); netUp(); return true; }
  catch(e){ netDown(); return false; }
}
function netDropPlayer(pid,keepalive){
  return fetch(roomPath('/players/'+pid)+'?print=silent',{method:'DELETE',keepalive:!!keepalive}).catch(()=>{});
}
function netDropRoom(){
  return fetch(roomPath()+'?print=silent',{method:'DELETE',keepalive:true}).catch(()=>{});
}
function setConn(ok){
  const cls='dot'+(ok?'':' bad');
  dot.className=cls; lpDot.className=cls;
  const txt=ok?'Bağlı':'Bağlantı yok';
  connText.textContent=txt; lpConnText.textContent=txt;
}
function livePlayers(players,now){
  const out={};
  for(const pid in players){
    const p=players[pid];
    if(!p||typeof p!=='object') continue;
    if(pid!==uid&&now-safeN(p.ts,0)>PRUNE_MS) continue;
    out[pid]=p;
  }
  return out;
}
function buildMyEntry(now){
  return{name:pName,color:car.color,x:Math.round(car.x*10)/10,y:Math.round(car.y*10)/10,angle:Math.round(car.angle*1000)/1000,
    laps:car.laps,finished:car.finished,finishedAt:car.finishAt||0,
    totalTime:car.finished?car.finishTime:(localPhase==='racing'?now-car.raceStart:0),
    racing:(localPhase==='racing'),ts:now};
}
/* Bitiş ekranı en az PODIUM_MS görünsün, lobiye anında düşmeyelim. */
function canLeaveResults(now){ return !(car.finished&&finishShownAt&&now-finishShownAt<PODIUM_MS); }

async function syncTick(){
  if(!car||syncBusy||localPhase==='menu') return;
  syncBusy=true;
  try{
    const now=nowSync();
    const [state]=await Promise.all([netGetRoom(),netPutMe(buildMyEntry(now))]);
    if(!state) return;   // ağ hatası: faz kararı verme, mevcut durumu koru

    const players=livePlayers(state.players,now);
    const view=Object.assign({},players); view[uid]=buildMyEntry(now);

    for(const pid in players){
      if(pid===uid) continue;
      const p=players[pid];
      const rx=safeN(p.x,CX),ry=safeN(p.y,CY),ra=safeN(p.angle,0);
      let rc=remoteCars[pid];
      if(!rc){ rc={prevX:rx,prevY:ry,prevAngle:ra,targetX:rx,targetY:ry,targetAngle:ra,renderX:rx,renderY:ry,renderAngle:ra,updStart:performance.now(),lastT:0}; remoteCars[pid]=rc; }
      else{ rc.prevX=rc.renderX;rc.prevY=rc.renderY;rc.prevAngle=rc.renderAngle; rc.targetX=rx;rc.targetY=ry;rc.targetAngle=ra; rc.updStart=performance.now(); }
      rc.name=String(p.name||'?').slice(0,14); rc.color=String(p.color||'#888');
      rc.laps=safeN(p.laps,0); rc.finished=!!p.finished; rc.totalTime=safeN(p.totalTime,0); rc.racing=!!p.racing; rc.ts=safeN(p.ts,now);
    }
    for(const pid in remoteCars){ if(!players[pid]) delete remoteCars[pid]; }

    const live=Object.keys(view).filter(pid=>pid===uid||now-safeN(view[pid].ts,0)<=STALE_MS).sort();
    isHost=(live[0]===uid);

    if(now>=phaseGuardUntil){
      if(state.phase==='racing'&&localPhase==='lobby') enterRacingPhase(state.raceStartAt||now);
      else if(state.phase==='lobby'&&(localPhase==='racing'||localPhase==='waiting')&&canLeaveResults(now)) resetToLobby();
    }

    if(state.phase==='racing'&&isHost&&now>=phaseGuardUntil){
      let allDone=true,lastFin=0;
      for(const pid of live){
        const p=view[pid];
        if(!p.racing) continue;
        if(!p.finished){ allDone=false; break; }
        lastFin=Math.max(lastFin,safeN(p.finishedAt,0));
      }
      if(allDone&&(lastFin===0||now-lastFin>=PODIUM_MS)) await netSetMeta('lobby',null);
    }

    if(isHost){
      for(const pid in state.players){
        if(pid===uid) continue;
        if(now-safeN((state.players[pid]||{}).ts,0)>PRUNE_MS) netDropPlayer(pid);
      }
    }

    if(localPhase==='lobby'||localPhase==='waiting') renderLobbyList(players,now);
    else updateLB();
  }catch(e){ console.warn('sync',e); }
  finally{ syncBusy=false; }
}

/* ── lobby / color picker ──────────────── */
function renderLobbyList(playersObj,now){
  const rows=[{name:pName,color:car.color,me:true}];
  for(const pid in playersObj){
    if(pid===uid) continue;
    const p=playersObj[pid];
    if(p.racing) continue;
    if(now-(p.ts||0)>STALE_MS) continue;
    rows.push({name:String(p.name||'?').slice(0,14),color:p.color||'#888',me:false});
  }
  const target=(localPhase==='waiting')?lpWaitList:lpPlayerList;
  target.innerHTML='';
  rows.forEach(r=>{
    const row=document.createElement('div'); row.className='lp-player'+(r.me?' me':'');
    const sw=document.createElement('span'); sw.className='lp-swatch'; liveryFill(sw,r.color);
    const nm=document.createElement('span'); nm.textContent=r.name;
    row.appendChild(sw); row.appendChild(nm); target.appendChild(row);
  });
  if(localPhase==='lobby'){ lpCountLabel.textContent='Odadakiler ('+rows.length+')'; renderColorPicker(rows); }
}
function renderColorPicker(rows){
  const taken=new Set(rows.filter(r=>!r.me).map(r=>liveryOf(r.color).hex));
  const mine=liveryOf(car.color).hex;
  colorPicker.innerHTML='';
  LIVERIES.filter(l=>l.pick).forEach(liv=>{
    const b=document.createElement('button'); b.type='button';
    const used=taken.has(liv.hex)&&liv.hex!==mine;
    b.className='liv'+(liv.hex===mine?' picked':'')+(used?' taken':'');
    b.setAttribute('aria-label',liv.name+' vinili');
    const cv=document.createElement('canvas'); paintCarThumb(cv,'f1',liv.hex,72,36);
    const cap=document.createElement('span'); cap.className='liv-n'; cap.textContent=liv.name;
    b.appendChild(cv); b.appendChild(cap);
    b.addEventListener('click',()=>{ if(used) return; car.color=liv.hex; renderColorPicker(rows); });
    colorPicker.appendChild(b);
  });
}

/* ── leaderboard + position ─────────────── */
function updateLB(){
  const now=nowSync();
  const list=[{name:pName,laps:car.laps,finished:car.finished,totalTime:car.finished?car.finishTime:(now-car.raceStart),me:true}];
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(!rc.racing) continue;
    if(now-rc.ts>STALE_MS) continue;
    list.push({name:rc.name,laps:rc.laps,finished:rc.finished,totalTime:rc.totalTime,me:false});
  }
  list.sort((a,b)=>(b.laps-a.laps)||(a.totalTime-b.totalTime));
  posText.textContent='P'+(list.findIndex(p=>p.me)+1);
  lbTitle.textContent='Yarışçılar ('+list.length+')';
  lbRows.innerHTML='';
  list.forEach(p=>{
    const row=document.createElement('div'); row.className='lbr'+(p.me?' me':'');
    const n=document.createElement('span'); n.className='lbn'; n.textContent=(p.finished?'🏁 ':'')+p.name;
    const i=document.createElement('span'); i.textContent=p.laps+'/'+TOTAL_LAPS;
    row.appendChild(n); row.appendChild(i); lbRows.appendChild(row);
  });
}

/* ── phase transitions ─────────────────── */
function applyPhaseVisibility(){
  const racingUI=(localPhase==='racing');
  hudPanel.style.display=racingUI?'block':'none';
  lbPanel.style.display=racingUI?'block':'none';
  tcEl.style.display=(racingUI&&isTouch)?'flex':'none';
  lobbyPanel.style.display=(localPhase==='lobby'||localPhase==='waiting')?'block':'none';
  lpWaiting.style.display=(localPhase==='waiting')?'block':'none';
  lpLobby.style.display=(localPhase==='lobby')?'block':'none';
  if(!racingUI) countdownEl.style.display='none';
}
function enterRacingPhase(startAt){
  localPhase='racing';
  car.raceStart=startAt; car.lastLapTs=startAt;
  car.locked=startAt>nowSync();
  applyPhaseVisibility();
}
function resetToLobby(){
  const slot=START_SLOTS[slotIdx(uid)];
  car.x=slot.x; car.y=slot.y; car.angle=0; car.speed=0;
  car.laps=0; car.passedHalf=false; car.finished=false; car.finishTime=0; car.finishAt=0;
  car.locked=false; car.lastTrail=0; car.lastDust=0; car.bestLap=null; car.lastLapTs=null; car.nitroCharges=NITRO_CHARGES;
  trailPts=[]; dustPts=[];
  hideFinish(); finishShownAt=0;
  localPhase='lobby';
  applyPhaseVisibility();
}

/* ── car / physics ─────────────────────── */
function makeCar(){
  const slot=START_SLOTS[slotIdx(uid)];
  return{x:slot.x,y:slot.y,angle:0,speed:0,
    color:COLORS[Math.floor(Math.random()*COLORS.length)],
    laps:0,passedHalf:false,finished:false,finishTime:0,
    raceStart:nowSync(),finishAt:0,lastTrail:0,lastDust:0,locked:true,
    bestLap:null,lastLapTs:null,nitroCharges:NITRO_CHARGES};
}
function tryActivateNitro(){
  if(!car||car.finished||car.locked||localPhase!=='racing') return;
  if(performance.now()<nitroActiveUntil) return;
  if(car.nitroCharges<=0) return;
  car.nitroCharges--;
  nitroActiveUntil=performance.now()+NITRO_MS;
  sfx.nitro();
}
function updateCar(dt){
  if(localPhase==='racing'&&car.locked&&nowSync()>=car.raceStart){ car.locked=false; sfx.go(); }
  if(localPhase!=='racing'||car.locked){ car.speed=0; return; }

  const up=!!(keys['arrowup']||keys['w']||touch.g);
  const dn=!!(keys['arrowdown']||keys['s']||touch.b);
  const lt=!!(keys['arrowleft']||keys['a']||touch.l);
  const rt=!!(keys['arrowright']||keys['d']||touch.r);
  const nitroOn=performance.now()<nitroActiveUntil;

  if(car.finished){
    if(car.speed>0) car.speed=Math.max(0,car.speed-FRICTION*2*dt);
    else if(car.speed<0) car.speed=Math.min(0,car.speed+FRICTION*2*dt);
  } else {
    const onT=isOnTrack(car.x,car.y);
    const nm=nitroOn?NITRO_SPEED_MULT:1, na=nitroOn?NITRO_ACCEL_MULT:1;
    const mxF=(onT?MAX_SPD:MAX_SPD*OFF_MULT)*nm;
    const ac=(onT?ACCEL:ACCEL*0.5)*na;
    const fr=onT?FRICTION:FRICTION*OFF_FRIC;
    if(up&&!dn) car.speed+=ac*dt;
    else if(dn&&!up) car.speed-=BRAKE*dt;
    else{ if(car.speed>0)car.speed=Math.max(0,car.speed-fr*dt); else if(car.speed<0)car.speed=Math.min(0,car.speed+fr*dt); }
    car.speed=clamp(car.speed,-REV_SPD,mxF);
    if(Math.abs(car.speed)>MIN_TURN_SPD){
      let st=0; if(lt)st-=1; if(rt)st+=1;
      car.angle+=st*(car.speed>=0?1:-1)*TURN*dt;
    }
  }
  const px=car.x,py=car.y;
  car.x+=Math.cos(car.angle)*car.speed*dt;
  car.y+=Math.sin(car.angle)*car.speed*dt;
  car.x=clamp(car.x,5,CW-5); car.y=clamp(car.y,5,CH-5);
  if(!car.finished) checkLap(px,py,car.x,car.y);
  if(!car.finished&&Math.abs(car.speed)>40){
    const n=performance.now();
    if(n-car.lastTrail>TRAIL_GAP){ addTrail(car.x,car.y,car.angle); car.lastTrail=n; }
  }
  if(!car.finished&&Math.abs(car.speed)>25&&!isOnTrack(car.x,car.y)){
    const nd=performance.now();
    if(nd-car.lastDust>90){ addDust(car.x,car.y); car.lastDust=nd; }
  }
}
function checkLap(px,py,cx,cy){
  const p1={x:px,y:py},p2={x:cx,y:cy};
  if(!car.passedHalf){
    if(segsect(p1,p2,{x:HALF_GATE.x1,y:HALF_GATE.y1},{x:HALF_GATE.x2,y:HALF_GATE.y2})) car.passedHalf=true;
  } else if(segsect(p1,p2,{x:FINISH_GATE.x1,y:FINISH_GATE.y1},{x:FINISH_GATE.x2,y:FINISH_GATE.y2})){
    car.laps++; car.passedHalf=false;
    const now=nowSync();
    if(car.lastLapTs){ const lt=now-car.lastLapTs; if(car.bestLap===null||lt<car.bestLap) car.bestLap=lt; }
    car.lastLapTs=now;
    if(car.laps>=TOTAL_LAPS){ car.finished=true; car.finishTime=now-car.raceStart; car.finishAt=now; showFinish(); sfx.fanfare(); }
    else sfx.lap();
  }
}
function addTrail(x,y,angle){
  const rx=x-Math.cos(angle)*13,ry=y-Math.sin(angle)*13;
  const ca=Math.cos(angle+Math.PI/2),sa=Math.sin(angle+Math.PI/2),pw=2.5;
  trailPts.push({x1:rx-ca*pw,y1:ry-sa*pw,x2:rx+ca*pw,y2:ry+sa*pw,born:performance.now()});
  if(trailPts.length>TRAIL_MAX) trailPts.shift();
}

/* ── static track (pre-rendered once) ──── */
const roadNoise=(()=>{const pts=[];let a=0;while(pts.length<280&&a++<5000){const x=Math.random()*CW,y=Math.random()*CH;if(isOnTrack(x,y))pts.push({x,y,r:.6+Math.random()*1.5,d:Math.random()<.5});}return pts;})();
function drawTireWall(c,x,y){
  c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(1,8,15,6,0,0,Math.PI*2); c.fill();
  [[-7,4],[7,4],[0,-5]].forEach(p=>{
    c.fillStyle='#141310'; c.beginPath(); c.arc(p[0],p[1],6.5,0,Math.PI*2); c.fill();
    c.fillStyle='#3a3930'; c.beginPath(); c.arc(p[0],p[1],3.6,0,Math.PI*2); c.fill();
    c.fillStyle='#141310'; c.beginPath(); c.arc(p[0],p[1],1.5,0,Math.PI*2); c.fill();
  });
  c.restore();
}
function drawCurb(c,rx,ry){
  c.save(); c.lineWidth=7; c.setLineDash([15,15]);
  c.lineDashOffset=0; c.strokeStyle='#c9402c'; c.beginPath(); c.ellipse(CX,CY,rx,ry,0,0,Math.PI*2); c.stroke();
  c.lineDashOffset=15; c.strokeStyle='#e9e6db'; c.beginPath(); c.ellipse(CX,CY,rx,ry,0,0,Math.PI*2); c.stroke();
  c.restore();
}
function drawCheckered(c,gate){
  for(let i=0;i<8;i++){
    const y0=lerp(gate.y1,gate.y2,i/8),y1=lerp(gate.y1,gate.y2,(i+1)/8);
    c.fillStyle=(i%2===0)?'#f4f2ec':'#151410';
    c.fillRect(gate.x1-6,y0,12,y1-y0);
  }
}
function renderTrack(c){
  c.fillStyle='#1e3a1a'; c.fillRect(0,0,CW,CH);
  c.save(); c.translate(CX,CY); c.rotate(Math.PI/8); c.translate(-CX,-CY);
  c.fillStyle='rgba(255,255,255,.018)';
  for(let i=-CH;i<CW+CH;i+=44) c.fillRect(i,-CH,22,CH*3);
  c.restore();
  c.beginPath(); c.ellipse(CX,CY,OA+18,OB+18,0,0,Math.PI*2); c.fillStyle='#4a4840'; c.fill();
  c.beginPath(); c.ellipse(CX,CY,OA,OB,0,0,Math.PI*2); c.fillStyle='#2e2d28'; c.fill();
  roadNoise.forEach(t=>{ c.fillStyle=t.d?'rgba(0,0,0,.08)':'rgba(255,255,255,.045)'; c.beginPath(); c.arc(t.x,t.y,t.r,0,Math.PI*2); c.fill(); });
  c.save(); c.globalAlpha=.09; c.lineWidth=26; c.strokeStyle='#000';
  c.beginPath(); c.ellipse(CX,CY,MA,MB,0,0,Math.PI*2); c.stroke(); c.restore();
  c.beginPath(); c.ellipse(CX,CY,IA+16,IB+16,0,0,Math.PI*2); c.fillStyle='#4a4840'; c.fill();
  c.beginPath(); c.ellipse(CX,CY,IA,IB,0,0,Math.PI*2); c.fillStyle='#1e3a1a'; c.fill();
  drawCurb(c,OA,OB); drawCurb(c,IA,IB);
  c.setLineDash([14,14]); c.lineWidth=2; c.strokeStyle='rgba(238,230,218,.18)';
  c.beginPath(); c.ellipse(CX,CY,MA,MB,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
  c.fillStyle='rgba(238,230,218,.38)';
  for(let k=1;k<=5;k++){
    const th=-Math.PI/2+k*(Math.PI*2/6);
    const px=CX+MA*Math.cos(th),py=CY+MB*Math.sin(th);
    const dx=-MA*Math.sin(th),dy=MB*Math.cos(th),ang=Math.atan2(dy,dx);
    c.save(); c.translate(px,py); c.rotate(ang);
    c.beginPath(); c.moveTo(10,0); c.lineTo(-8,-6.5); c.lineTo(-8,6.5); c.closePath(); c.fill();
    c.restore();
  }
  for(let row=0;row<3;row++) for(let col=0;col<3;col++){
    const gx=408+col*35, gy=CY-225+row*40;
    c.strokeStyle='rgba(238,230,218,.3)'; c.lineWidth=1.2;
    c.strokeRect(gx-14,gy-11,28,22);
  }
  drawCheckered(c,FINISH_GATE);
  const trees=[[38,30,.9],[72,44,.8],[30,72,.85],[962,30,.9],[928,44,.8],[970,72,.85],[38,570,.9],[72,556,.8],[30,528,.85],[962,570,.9],[928,556,.8],[970,528,.85]];
  trees.forEach(t=>drawTree(c,t[0],t[1],t[2]));
  drawTireWall(c,430,18); drawTireWall(c,570,18);
  const vg=c.createRadialGradient(CX,CY,320,CX,CY,640);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.4)');
  c.fillStyle=vg; c.fillRect(0,0,CW,CH);
}
renderTrack(tctx);

/* ── dynamic fx ────────────────────────── */
function drawTrails(){
  const now=performance.now();
  ctx.save(); ctx.lineCap='round';
  for(let i=trailPts.length-1;i>=0;i--){
    const p=trailPts[i],age=now-p.born;
    if(age>TRAIL_LIFE){trailPts.splice(i,1);continue;}
    ctx.strokeStyle='rgba(8,7,5,'+(0.18*(1-age/TRAIL_LIFE)).toFixed(3)+')';
    ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(p.x1,p.y1); ctx.lineTo(p.x2,p.y2); ctx.stroke();
  }
  ctx.restore();
}
function addDust(x,y){
  for(let i=0;i<2;i++){
    dustPts.push({x:x+(Math.random()-0.5)*10,y:y+(Math.random()-0.5)*10,
      vx:(Math.random()-0.5)*26,vy:(Math.random()-0.5)*26,
      r:2+Math.random()*2,born:performance.now()});
  }
  if(dustPts.length>120) dustPts.splice(0,dustPts.length-120);
}
function drawDust(){
  const now=performance.now();
  ctx.save();
  for(let i=dustPts.length-1;i>=0;i--){
    const p=dustPts[i], age=now-p.born;
    if(age>DUST_LIFE){ dustPts.splice(i,1); continue; }
    const t=age/DUST_LIFE;
    ctx.fillStyle='rgba(196,178,138,'+(0.24*(1-t)).toFixed(3)+')';
    ctx.beginPath(); ctx.arc(p.x+p.vx*t*0.3,p.y+p.vy*t*0.3,p.r+t*6,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function interpRemotes(){
  const now=performance.now();
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    const t=clamp((now-rc.updStart)/SYNC_MS,0,1);
    rc.renderX=lerp(rc.prevX,rc.targetX,t); rc.renderY=lerp(rc.prevY,rc.targetY,t); rc.renderAngle=lerpAngle(rc.prevAngle,rc.targetAngle,t);
    const moved=Math.hypot(rc.targetX-rc.prevX,rc.targetY-rc.prevY);
    if(rc.racing&&moved>5&&(!rc.lastT||now-rc.lastT>TRAIL_GAP)){ addTrail(rc.renderX,rc.renderY,rc.renderAngle); rc.lastT=now; }
    if(rc.racing&&moved>3&&!isOnTrack(rc.renderX,rc.renderY)&&(!rc.lastDust||now-rc.lastDust>90)){ addDust(rc.renderX,rc.renderY); rc.lastDust=now; }
  }
}
function renderFrame(){
  ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(trackCv,0,0); ctx.restore();
  drawTrails();
  drawDust();
  const now=nowSync();
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(now-rc.ts>STALE_MS) continue;
    drawCar(ctx,rc.renderX,rc.renderY,rc.renderAngle,rc.color,{kind:'f1',headlights:false,label:rc.name,scale:.9});
  }
  const braking=!!(keys['arrowdown']||keys['s']||touch.b);
  drawCar(ctx,car.x,car.y,car.angle,car.color,{kind:'f1',headlights:false,label:pName,isSelf:true,boosting:performance.now()<nitroActiveUntil,braking,scale:.9});
}
function updateHUD(){
  lapText.textContent='Tur '+Math.min(car.laps,TOTAL_LAPS)+'/'+TOTAL_LAPS;
  const el=car.finished?car.finishTime:(nowSync()-car.raceStart);
  timeText.textContent=fmtTime(el);
  speedText.textContent=Math.round(Math.abs(car.speed))+' km/h';
  bestLapText.textContent='En iyi tur: '+(car.bestLap!==null?fmtTime(car.bestLap):'–');
  nosPips().forEach((p,i)=>p.classList.toggle('on', i<car.nitroCharges));
}
function updateCountdownUI(){
  if(localPhase!=='racing'||!car.locked){ countdownEl.style.display='none'; return; }
  const msLeft=car.raceStart-nowSync();
  if(msLeft<=0){ countdownEl.style.display='none'; return; }
  countdownEl.style.display='flex';
  const txt=String(Math.ceil(msLeft/1000));
  if(cdNum.textContent!==txt){
    cdNum.textContent=txt; sfx.countdown();
    cdNum.style.animation='none'; void cdNum.offsetWidth; cdNum.style.animation='cdPop .5s ease-out';
  }
}

/* ── loop ──────────────────────────────── */
function frame(t){
  if(localPhase==='menu') return;
  const dt=Math.min((t-(lastT||t))/1000,.05); lastT=t;
  updateCar(dt);
  interpRemotes();
  renderFrame();
  updateHUD();
  updateCountdownUI();
  updateEngineSound();
  finStatusEl.style.display=(car.finished&&localPhase==='racing')?'block':'none';
  rafId=requestAnimationFrame(frame);
}
function startLoops(){ lastT=0; rafId=requestAnimationFrame(frame); syncTick(); syncTimer=setInterval(syncTick,SYNC_MS); }
function stopLoops(){ if(rafId) cancelAnimationFrame(rafId); rafId=null; if(syncTimer) clearInterval(syncTimer); syncTimer=null; }

/* ── finish ────────────────────────────── */
function showFinish(){
  finTimeEl.textContent=fmtTime(car.finishTime);
  finBestLapEl.textContent=car.bestLap!==null?('En iyi tur: '+fmtTime(car.bestLap)):'';
  finishEl.style.display='flex'; finishShownAt=nowSync();
}
function hideFinish(){ finishEl.style.display='none'; }

/* ── start race ─────────────────────────── */
async function onStartClicked(){
  if(startingRace) return;
  startingRace=true; startRaceBtn.disabled=true;
  // devam eden syncTick bizi lobiye geri atmasın diye korumayı hemen kur
  phaseGuardUntil=nowSync()+PHASE_GUARD_MS;
  try{
    // syncTick 450 ms'de iki ağ turu yapıyor; sürüyorsa tıklamayı düşürme, sırasını bekle
    for(let i=0;i<40&&syncBusy;i++) await new Promise(r=>setTimeout(r,50));
    const startAt=nowSync()+LEAD_MS;
    phaseGuardUntil=nowSync()+PHASE_GUARD_MS;
    const wrote=await netSetMeta('racing',startAt);
    if(!wrote){ phaseGuardUntil=0; flashHint($('startHint'),'⚠ Bağlantı kurulamadı — tekrar dene.'); return; }
    enterRacingPhase(startAt);
    await netPutMe(buildMyEntry(nowSync()));
  } finally { startingRace=false; startRaceBtn.disabled=false; }
}

/* ── leave room ────────────────────────── */
async function leaveRoom(){
  stopLoops();
  localPhase='menu';
  const alone=Object.keys(remoteCars).length===0;
  if(roomCode){
    try{ await netDropPlayer(uid); if(alone) await netDropRoom(); }catch(e){}
  }
  remoteCars={}; trailPts=[]; dustPts=[];
  hideFinish(); countdownEl.style.display='none';
  phaseGuardUntil=0; finishShownAt=0; isHost=false; netOk=null; netFails=0;
  crossFade(gameEl, menuEl);
}

/* ── input ─────────────────────────────── */
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(localPhase!=='menu'&&['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
  keys[k]=true;
  if(k==='shift') tryActivateNitro();
});
window.addEventListener('keyup',e=>{ keys[e.key.toLowerCase()]=false; });
function bindHold(el,down,up){
  if(!el) return;
  el.addEventListener('pointerdown',e=>{e.preventDefault();down();});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,e=>{e.preventDefault();up();}));
}
bindHold($('leftBtn'), ()=>touch.l=1, ()=>touch.l=0);
bindHold($('rightBtn'),()=>touch.r=1, ()=>touch.r=0);
bindHold($('gasBtn'),  ()=>touch.g=1, ()=>touch.g=0);
bindHold($('brakeBtn'),()=>touch.b=1, ()=>touch.b=0);
$('nosBtn').addEventListener('pointerdown',e=>{ e.preventDefault(); tryActivateNitro(); });
$('muteBtn').addEventListener('click',()=>{ audio.muted=!audio.muted; $('muteBtn').textContent=audio.muted?'🔇':'🔊'; });

/* ── menu wiring ───────────────────────── */
let roomShuffleTimer=null;
function animateRoomCode(finalCode){
  const el=$('roomInput');
  if(roomShuffleTimer) clearInterval(roomShuffleTimer);
  if(reduceMotion){ el.value=finalCode; return; }
  const chars='ABCDEFGHJKLMNPQRTVWXYZ23456789';
  let ticks=0;
  roomShuffleTimer=setInterval(()=>{
    let s=''; for(let i=0;i<finalCode.length;i++) s+=chars[Math.random()*chars.length|0];
    el.value=s;
    if(++ticks>=9){ clearInterval(roomShuffleTimer); roomShuffleTimer=null; el.value=finalCode; }
  },45);
}
$('randBtn').addEventListener('click',()=>{
  const btn=$('randBtn');
  btn.classList.remove('rolling'); void btn.offsetWidth; btn.classList.add('rolling');
  animateRoomCode(randRoom());
});

$('joinBtn').addEventListener('click', async ()=>{
  const btn=$('joinBtn');
  if(btn.disabled) return;
  initAudio(); startEngine();
  $('muteBtn').textContent=audio.muted?'🔇':'🔊';
  btn.disabled=true; btn.textContent='Bağlanılıyor…';
  pName=sanitName($('nameInput').value);
  roomCode=sanitRoom($('roomInput').value)||randRoom();
  $('roomInput').value=roomCode;
  lpRoomCode.textContent=roomCode;

  car=makeCar(); remoteCars={}; trailPts=[]; dustPts=[];

  const state=await netGetRoom();
  btn.disabled=false; btn.textContent='Odaya Katıl';
  if(!state){ flashHint($('joinHint'),'⚠ Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.'); return; }

  const now=nowSync();
  const players=livePlayers(state.players,now);
  let activeCount=0;
  for(const pid in players){
    if(pid===uid) continue;
    if(players[pid].racing&&(now-safeN(players[pid].ts,0))<STALE_MS) activeCount++;
  }
  if(state.phase==='racing'&&activeCount>0){
    localPhase='waiting';
  } else {
    localPhase='lobby';
    if(state.phase==='racing') await netSetMeta('lobby',null); // terk edilmiş yarış kalıntısı
  }

  const taken=new Set(Object.keys(players).filter(pid=>pid!==uid).map(pid=>liveryOf(players[pid].color).hex));
  const free=COLORS.find(c=>!taken.has(c));
  car.color=free||COLORS[Math.floor(Math.random()*COLORS.length)];

  await netPutMe(buildMyEntry(nowSync()));

  crossFade(menuEl, gameEl);
  applyPhaseVisibility();
  startLoops();
});

// sekme kapanırsa lobide hayalet bırakma
window.addEventListener('pagehide',()=>{ if(roomCode&&localPhase!=='menu') netDropPlayer(uid,true); });

$('leaveBtn').addEventListener('click',leaveRoom);
startRaceBtn.addEventListener('click',onStartClicked);
