/* Apex Shift — Online mod.

   Oda düzeni:
     /apex/rooms/<KOD>/meta            yarış ayarı + faz
     /apex/rooms/<KOD>/players/<uid>   her istemci YALNIZ kendi yolunu yazar
     /apex/rooms/<KOD>/bots            yalnız host yazar

   Otorite modeli: kimse başkasının arabasını oynatmaz. Çarpışmada herkes
   sadece kendi arabasını iter, botları yalnız host simüle eder. Bu yüzden
   eşzamanlı yazımlar birbirini ezmiyor ve desync oluşmuyor.

   Zaman: tarayıcı saatleri saniyelerce kayabildiği için her şey (geri sayım,
   tur süresi, "bayat oyuncu" kararı) RTDB'nin sunucu damgasına kilitli.      */
import {$,clamp,lerp,lerpAngle,fmtTime,sanitName,drawCar,flashHint,crossFade,isTouch,
        reduceMotion,COLORS,LIVERIES,STOCK_LIVERIES,liveryOf,liveryFill,paintCarThumb,
        mulberry32,shuffle,audio,initAudio,sfx} from './common.js';
import {ONLINE_TRACKS,trackById,buildOnlineTrack,paintOnlineTrack,projectToTrack,
        nearestSample,gridSlots,VIEW_W,VIEW_H,PIT,inPitLane,inPitRange} from './online/tracks.js';
import {vehById,vehiclesFor,defaultVehFor,applyDamage,
        PIT_REPAIR_PER_S,PIT_CRAWL} from './online/vehicles.js';
import {createField,stepField,botPose,serializeBots,adoptBots,MAX_FIELD} from './online/bots.js';

/* ── sabitler ───────────────────────────── */
const SYNC_MS=450, RACE_SYNC_MS=220;
const STALE_MS=6000, PRUNE_MS=14000, LEAD_MS=4000;
const PODIUM_MS=9000, PHASE_GUARD_MS=2600, NET_FAIL_LIMIT=3;
const FINISH_WINDOW_MS=45000, RACE_MAX_MS=6*60*1000, JOIN_GRACE_MS=1500;
const FB_BASE='https://switch-master-687ff-default-rtdb.europe-west1.firebasedatabase.app';
const MIN_TURN_SPD=8, OFF_FRIC=2.5;
const TRAIL_LIFE=800, TRAIL_GAP=52, TRAIL_MAX=340, DUST_LIFE=520;
const NITRO_MS=1200, NITRO_SPEED_MULT=1.32, NITRO_ACCEL_MULT=1.7;
const CAR_R=13, COLL_PUSH=0.55, COLL_DRAG=0.22;
const SPIN_RATE=6.2, SPIN_MS=1400, WALL_CRASH_SPD=150, HIT_CRASH_SPD=125;
const EXTRAP_MS=420;

/* ── durum ──────────────────────────────── */
const uid='p'+Date.now().toString(36)+(Math.random()*1e6|0).toString(36);

let pName='',roomCode='';
let netOk=null,netFails=0,clockOffset=0,clockSynced=false;
let phaseGuardUntil=0,resultsShownAt=0,isHost=false;
let localPhase='menu';            // menu | lobby | spectate | racing | results
let car=null,remoteCars={},botCars={},trailPts=[],dustPts=[],smokePts=[],sparkPts=[];
let keys={},touch={l:0,r:0,g:0,b:0};
let rafId=null,syncTimer=null,syncBusy=false,startingRace=false,syncEvery=SYNC_MS;
let lastT=0,nitroActiveUntil=0;

let T=null,trackImg=null,V=null,raceLaps=3,raceId='',isNight=false;
let botField=null,lastStandings=[],cautionUntil=0;
let cam={x:0,y:0,z:1},camReady=false;

/* Lobide host'un seçtiği ayar; herkese meta üzerinden yayılıyor. */
let cfg={trackId:'oval',vehId:'f4',night:0,bots:0,botLevel:2};

/* ── motor sesi ─────────────────────────── */
let engineOsc=null,engineGain=null,engineFilter=null;
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
  const active=(localPhase==='racing'&&car&&!car.locked&&!audio.muted);
  const top=V?V.spd:270;
  const speedFrac=car?Math.min(1,Math.abs(car.speed)/top):0;
  const t=a.currentTime;
  engineGain.gain.setTargetAtTime(active?(0.045+0.09*speedFrac):0.0001,t,0.08);
  engineOsc.frequency.setTargetAtTime(52+speedFrac*150,t,0.08);
  engineFilter.frequency.setTargetAtTime(500+speedFrac*1800,t,0.08);
}
function crashSound(){ sfx.nitro(); setTimeout(()=>sfx.nitro(),70); }

/* ── dom ────────────────────────────────── */
const menuEl=$('menu'),gameEl=$('game');
const canvas=$('canvas'),ctx=canvas.getContext('2d');
const miniCv=$('minimap'),mctx=miniCv?miniCv.getContext('2d'):null;
const dot=$('dot'),connText=$('connText'),lpDot=$('lpDot'),lpConnText=$('lpConnText');
const hudPanel=$('hudPanel'),lbPanel=$('lbPanel');
const lapText=$('lapText'),timeText=$('timeText'),speedText=$('speedText');
const bestLapText=$('bestLapText'),posText=$('posText');
const nosPips=()=>document.querySelectorAll('#nosRow .nos-pip');
const dmgRow=$('dmgRow'),dmgFill=$('dmgFill'),pitTag=$('pitTag');
const flagBanner=$('flagBanner');
const lbTitle=$('lbTitle'),lbRows=$('lbRows');
const lobbyPanel=$('lobbyPanel'),lpLobby=$('lpLobby');
const lpRoomCode=$('lpRoomCode');
const trackPicker=$('trackPicker'),vehPicker=$('vehPicker'),colorPicker=$('colorPicker');
const botCount=$('botCount'),botLevel=$('botLevel'),nightToggle=$('nightToggle');
const lpPlayerList=$('lpPlayerList'),lpCountLabel=$('lpCountLabel');
const startRaceBtn=$('startRaceBtn'),hostNote=$('hostNote');
const spectateEl=$('spectate'),spectateText=$('spectateText');
const resultsEl=$('results'),resTitle=$('resTitle'),resSub=$('resSub'),resRows=$('resRows'),resStatus=$('resStatus');
const countdownEl=$('countdown'),cdNum=$('cdNum');
const tcEl=$('tc');

/* ── tuval ──────────────────────────────── */
const dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=VIEW_W*dpr; canvas.height=VIEW_H*dpr;
const MINI_W=176;
let miniH=110;
/* Gece ışık haritası yarım çözünürlükte: bulanıklık zaten gizliyor, maliyet düşüyor. */
const lightCv=document.createElement('canvas');
const lctx=lightCv.getContext('2d');
lightCv.width=Math.round(VIEW_W/2); lightCv.height=Math.round(VIEW_H/2);

/* ── yardımcılar ────────────────────────── */
function nowSync(){return Date.now()+clockOffset;}
function safeN(v,f){return isFinite(Number(v))?Number(v):f;}
function randRoom(){const C='ABCDEFGHJKLMNPQRTVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=C[Math.random()*C.length|0];return s;}
function sanitRoom(v){return(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);}
const trackCls=id=>trackById(id).mode==='nascar'?'nascar':'normal';
const liveriesFor=cls=>cls==='nascar'?STOCK_LIVERIES:LIVERIES.filter(l=>l.pick);

/* ── ağ katmanı ─────────────────────────── */
const roomPath=p=>FB_BASE+'/apex/rooms/'+encodeURIComponent(roomCode)+(p||'')+'.json';
const JSON_HDR={'Content-Type':'application/json'};
const SRV_TS={'.sv':'timestamp'};

/* Yanıttaki Date başlığı CORS safelist'inde olmadığı için okunamıyor; onun
   yerine RTDB'nin sunucu damgasını kullanıyoruz. Kendi players/<uid>
   yazımımız çözülmüş sunucu zamanını geri döndürdüğü için her sync bedava
   bir saat örneği veriyor.                                                */
function applySrvSample(srv,sentAt,recvAt){
  if(!isFinite(srv)||srv<=0) return;
  const rtt=recvAt-sentAt;
  if(rtt>3000) return;
  const off=srv+rtt/2-recvAt;
  clockOffset=clockSynced?lerp(clockOffset,off,.3):off;
  clockSynced=true;
}
async function fbFetch(url,opts){
  const res=await fetch(url,opts);
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
    const ph=meta.phase;
    return{
      phase:(ph==='racing'||ph==='results')?ph:'lobby',
      raceStartAt:safeN(meta.raceStartAt,0),
      endedAt:safeN(meta.endedAt,0),
      raceId:String(meta.raceId||''),
      fieldSeed:safeN(meta.fieldSeed,1),
      cfg:{trackId:String((meta.cfg&&meta.cfg.trackId)||'oval'),
           vehId:String((meta.cfg&&meta.cfg.vehId)||'f4'),
           night:safeN(meta.cfg&&meta.cfg.night,0)?1:0,
           bots:clamp(safeN(meta.cfg&&meta.cfg.bots,0),0,MAX_FIELD),
           botLevel:clamp(safeN(meta.cfg&&meta.cfg.botLevel,2),0,3)},
      players:(raw&&raw.players&&typeof raw.players==='object')?raw.players:{},
      bots:(raw&&raw.bots&&typeof raw.bots==='object')?raw.bots:null
    };
  }catch(e){ netDown(); return null; }
}
async function netPutMe(entry){
  try{
    const sentAt=Date.now();
    const body=Object.assign({},entry,{ts:SRV_TS});
    const res=await fbFetch(roomPath('/players/'+uid),{method:'PUT',headers:JSON_HDR,body:JSON.stringify(body)});
    const saved=await res.json();
    applySrvSample(Number(saved&&saved.ts),sentAt,Date.now());
    netUp(); return true;
  }catch(e){ netDown(); return false; }
}
/* Odaya girerken, faz/bayatlık kararı vermeden önce saati kilitle. */
async function netSyncClock(){
  try{
    const sentAt=Date.now();
    const res=await fbFetch(roomPath('/players/'+uid+'/ts'),{method:'PUT',headers:JSON_HDR,body:JSON.stringify(SRV_TS)});
    applySrvSample(Number(await res.json()),sentAt,Date.now());
    netUp(); return true;
  }catch(e){ netDown(); return false; }
}
async function netPatchMeta(patch){
  try{ await fbFetch(roomPath('/meta')+'?print=silent',{method:'PATCH',headers:JSON_HDR,
        body:JSON.stringify(Object.assign({ts:SRV_TS},patch))}); netUp(); return true; }
  catch(e){ netDown(); return false; }
}
async function netPutBots(obj){
  try{ await fbFetch(roomPath('/bots')+'?print=silent',{method:'PUT',headers:JSON_HDR,body:JSON.stringify(obj)}); return true; }
  catch(e){ return false; }
}
function netDropBots(){ return fetch(roomPath('/bots')+'?print=silent',{method:'DELETE'}).catch(()=>{}); }
function netDropPlayer(pid,keepalive){
  return fetch(roomPath('/players/'+pid)+'?print=silent',{method:'DELETE',keepalive:!!keepalive}).catch(()=>{});
}
function netDropRoom(){ return fetch(roomPath()+'?print=silent',{method:'DELETE',keepalive:true}).catch(()=>{}); }

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
    if(!p||typeof p!=='object'||!p.name) continue;   // saat probunun yarım düğümü
    if(pid!==uid&&now-safeN(p.ts,0)>PRUNE_MS) continue;
    out[pid]=p;
  }
  return out;
}
function buildMyEntry(now){
  return{name:pName,color:car.color,veh:V?V.id:'f4',
    x:Math.round(car.x*10)/10,y:Math.round(car.y*10)/10,
    angle:Math.round(car.angle*1000)/1000,spd:Math.round(car.speed),
    prog:Math.round(car.prog),lap:Math.max(0,car.lapRaw),
    dmg:Math.round(car.damage*100)/100,crash:car.spin>0?1:0,
    finished:car.finished,finishedAt:car.finishAt||0,
    totalTime:car.finished?car.finishTime:(localPhase==='racing'?now-car.raceStart:0),
    bestLap:car.bestLap||0,
    racing:(localPhase==='racing'),raceId:raceId,ts:now};
}

/* ── yarış kurulumu ─────────────────────── */
function setupRace(c){
  const def=trackById(c.trackId);
  T=buildOnlineTrack(def);
  raceLaps=T.laps;
  isNight=!!c.night;
  const painted=paintOnlineTrack(T,dpr,{night:isNight});
  trackImg=painted.cv;
  const cls=def.mode==='nascar'?'nascar':'normal';
  V=vehById(c.vehId);
  if(V.cls!==cls) V=defaultVehFor(cls);
  if(miniCv){
    miniH=Math.max(64,Math.round(MINI_W*T.H/T.W));
    miniCv.width=Math.round(MINI_W*dpr); miniCv.height=Math.round(miniH*dpr);
    miniCv.style.width=MINI_W+'px'; miniCv.style.height=miniH+'px';
  }
  document.body.classList.toggle('night',isNight);
}
/* Grid sırası: canlı oyuncular fieldSeed ile karıştırılıyor — herkes aynı
   sonucu hesaplıyor, kimse sabit pole almıyor, iki araba aynı kutuya düşmüyor. */
function gridOrder(liveIds,seed){
  return shuffle(liveIds.slice().sort(),mulberry32((seed>>>0)||1));
}
function placeOnGrid(slotIdx){
  const slots=gridSlots(T,MAX_FIELD);
  const s=slots[clamp(slotIdx,0,slots.length-1)];
  car.x=s.x; car.y=s.y; car.angle=s.angle; car.speed=0;
  const pr=projectToTrack(T,car.x,car.y);
  car.prevS=pr?pr.s:0; car.lapRaw=-1; car.prog=-T.len+(pr?pr.s:0);
}

/* ── araba ──────────────────────────────── */
function makeCar(){
  return{x:0,y:0,angle:0,speed:0,color:COLORS[0],
    lapRaw:-1,prevS:0,prog:0,finished:false,finishTime:0,
    raceStart:nowSync(),finishAt:0,lastTrail:0,lastDust:0,lastSmoke:0,locked:true,
    bestLap:null,lastLapTs:null,nitroCharges:3,
    damage:0,spin:0,spinDir:1,spinCool:0,onWall:false,inPit:false,draft:0};
}
function tryActivateNitro(){
  if(!car||car.finished||car.locked||localPhase!=='racing'||car.spin>0) return;
  if(performance.now()<nitroActiveUntil) return;
  if(car.nitroCharges<=0) return;
  car.nitroCharges--;
  nitroActiveUntil=performance.now()+NITRO_MS;
  sfx.nitro();
}
/* Kendi arabamızı savur. Sadece kendimizi oynattığımız için ağa güvenli. */
function spinOut(severity){
  if(car.spin>0||car.finished) return;
  const tn=performance.now();
  if(tn<(car.spinCool||0)) return;        // arka arkaya savrulma kilidi
  car.spinCool=tn+SPIN_MS+900;
  car.spin=SPIN_MS*(0.65+severity*0.6);
  car.spinDir=Math.random()<0.5?-1:1;
  car.damage=Math.min(1,car.damage+0.18+severity*0.32);
  crashSound();
  for(let i=0;i<14;i++) addSpark(car.x,car.y);
}

/* Yakındaki araçlar: uzak oyuncular + botlar, ekranda gördüğümüz hâlleriyle. */
function othersNow(){
  const out=[],now=nowSync();
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(now-rc.ts>STALE_MS) continue;
    out.push({x:rc.renderX,y:rc.renderY,angle:rc.renderAngle,speed:rc.spd||0,id:pid,bot:false});
  }
  for(const bid in botCars){
    const b=botCars[bid];
    out.push({x:b.renderX,y:b.renderY,angle:b.renderAngle,speed:b.v||0,id:bid,bot:true});
  }
  return out;
}
/* Yumuşak çarpışma: herkes yalnız kendi arabasını ayırıyor. Karşı taraf da
   aynısını yaptığı için araçlar birbirinden itiliyor ama kimse kimsenin
   konumunu yazmıyor — otorite çakışması yok.                              */
function resolveCollisions(others){
  if(localPhase!=='racing'||!car||car.locked||car.finished) return;
  const nascar=T&&T.mode==='nascar';
  for(const o of others){
    const dx=car.x-o.x, dy=car.y-o.y;
    const d=Math.hypot(dx,dy), min=CAR_R*2;
    if(d>=min||d<1e-4) continue;
    const nx=dx/d, ny=dy/d, push=(min-d);
    car.x+=nx*push*COLL_PUSH; car.y+=ny*push*COLL_PUSH;
    // çarpma yönü gidiş yönümüze karşıysa hız kaybı
    const into=-(Math.cos(car.angle)*nx+Math.sin(car.angle)*ny);
    if(into>0){
      car.speed*=1-COLL_DRAG*into;
      if(Math.random()<0.3) addSpark((car.x+o.x)/2,(car.y+o.y)/2);
    }
    if(nascar){
      const rel=Math.abs(car.speed-(o.speed||0));
      const side=Math.abs(nx*-Math.sin(car.angle)+ny*Math.cos(car.angle));  // yandan mı
      car.damage=Math.min(1,car.damage+0.004+rel*0.00012);
      if(Math.abs(car.speed)>HIT_CRASH_SPD&&side>0.72&&Math.random()<0.10) spinOut(0.5);
    }
  }
}
/* NASCAR'da SAFER bariyeri gerçek bir duvar. Darbe cezası YALNIZ ilk temas
   karesinde uygulanıyor; sonrasında araç duvar boyunca sürtünerek kayıyor ve
   burnu teğete çevriliyor. Aksi hâlde duvara yaslanan araç her karede hız
   kaybedip oraya çivilenip kalıyordu.                                      */
function wallCheck(dt){
  if(!T||T.mode!=='nascar'||!car||car.finished){ if(car) car.onWall=false; return; }
  const ns=nearestSample(T,car.x,car.y);
  if(!ns){ car.onWall=false; return; }
  // Pit girişinde iç duvar geri çekiliyor, yoksa şeride girmek imkânsız olurdu.
  const sgn=((car.x-T.trk.xs[ns.i])*T.trk.nx[ns.i]+(car.y-T.trk.ys[ns.i])*T.trk.ny[ns.i])>=0?1:-1;
  const pitOpen=(sgn<0)&&inPitRange(T,ns.i*T.trk.step);
  const lim=pitOpen?(T.hw+PIT.off+PIT.half):(T.hw+11);
  if(ns.d<=lim){ car.onWall=false; return; }
  const trk=T.trk,i=ns.i;
  const sign=((car.x-trk.xs[i])*trk.nx[i]+(car.y-trk.ys[i])*trk.ny[i])>=0?1:-1;
  car.x=trk.xs[i]+trk.nx[i]*lim*sign;
  car.y=trk.ys[i]+trk.ny[i]*lim*sign;
  const nx=trk.nx[i]*sign, ny=trk.ny[i]*sign;
  const into=Math.max(0,Math.cos(car.angle)*nx+Math.sin(car.angle)*ny);  // duvara dikey bileşen
  const spd=Math.abs(car.speed);
  if(!car.onWall){
    car.onWall=true;
    const hit=into*spd;
    car.speed*=1-0.5*into;
    car.damage=Math.min(1,car.damage+hit*0.0013);
    for(let k=0;k<9;k++) addSpark(car.x,car.y);
    if(hit>WALL_CRASH_SPD) spinOut(clamp((hit-WALL_CRASH_SPD)/160,0.3,1));
  } else {
    car.speed-=Math.sign(car.speed)*(60+220*into)*dt;   // sürtünme
    car.damage=Math.min(1,car.damage+into*spd*0.00012*dt);
    if(Math.random()<0.35) addSpark(car.x,car.y);
  }
  // burnu duvar teğetine çevir ki araç kayıp kurtulabilsin
  if(car.spin<=0&&into>0.02){
    let ta=trk.ang[i];
    if(Math.cos(car.angle-ta)<0) ta+=Math.PI;
    car.angle=lerpAngle(car.angle,ta,Math.min(1,6*dt));
  }
}
/* Slipstream: önündekinin arkasına takıl, son hızın artsın (NASCAR). */
function draftBonus(others){
  if(!V||!V.draft||!car) return 1;
  const D=V.draft;
  let best=0;
  const fx=Math.cos(car.angle),fy=Math.sin(car.angle);
  for(const o of others){
    const dx=o.x-car.x,dy=o.y-car.y;
    const dist=Math.hypot(dx,dy);
    if(dist<CAR_R||dist>D.dist) continue;
    const dotF=(dx*fx+dy*fy)/dist;                    // önümüzde mi
    if(dotF<0.55) continue;
    const align=Math.cos(o.angle-car.angle);          // aynı yöne mi bakıyor
    if(align<D.angle) continue;
    best=Math.max(best,(1-dist/D.dist)*dotF*align);
  }
  car.draft=best;
  return 1+D.gain*best;
}

function updateCar(dt,others){
  if(localPhase==='racing'&&car.locked&&nowSync()>=car.raceStart){ car.locked=false; sfx.go(); }
  if(localPhase!=='racing'||car.locked){ car.speed=0; return; }

  const spinning=car.spin>0;
  if(spinning){
    car.spin-=dt*1000;
    car.angle+=car.spinDir*SPIN_RATE*dt*clamp(Math.abs(car.speed)/120,0.25,1.4);
    car.speed-=Math.sign(car.speed)*480*dt;
    if(Math.abs(car.speed)<6) car.speed=0;
    const n=performance.now();
    if(n-car.lastSmoke>40){ addSmoke(car.x,car.y); car.lastSmoke=n; }
  }

  const up=!!(keys['arrowup']||keys['w']||touch.g);
  const dn=!!(keys['arrowdown']||keys['s']||touch.b);
  const lt=!!(keys['arrowleft']||keys['a']||touch.l);
  const rt=!!(keys['arrowright']||keys['d']||touch.r);
  const nitroOn=performance.now()<nitroActiveUntil;
  const Vd=applyDamage(V,car.damage);

  if(car.finished){
    if(car.speed>0) car.speed=Math.max(0,car.speed-Vd.fric*2*dt);
    else if(car.speed<0) car.speed=Math.min(0,car.speed+Vd.fric*2*dt);
  } else if(!spinning){
    const ns=nearestSample(T,car.x,car.y);
    const onT=!!ns&&ns.d<=T.hw+2;
    const nm=nitroOn?NITRO_SPEED_MULT:1, na=nitroOn?NITRO_ACCEL_MULT:1;
    const df=draftBonus(others);
    const mxF=(onT?Vd.spd:Vd.spd*Vd.off)*nm*df;
    const ac=(onT?Vd.acc:Vd.acc*0.5)*na;
    const fr=onT?Vd.fric:Vd.fric*OFF_FRIC;
    if(up&&!dn) car.speed+=ac*dt;
    else if(dn&&!up) car.speed-=Vd.brk*dt;
    else{ if(car.speed>0)car.speed=Math.max(0,car.speed-fr*dt); else if(car.speed<0)car.speed=Math.min(0,car.speed+fr*dt); }
    car.speed=clamp(car.speed,-Vd.spd*0.4,mxF);
    if(Math.abs(car.speed)>MIN_TURN_SPD){
      let st=0; if(lt)st-=1; if(rt)st+=1;
      car.angle+=st*(car.speed>=0?1:-1)*Vd.turn*dt;
    }
  }

  // Pit şeridi: hız limiti ve onarım. Limit sert kesme değil, güçlü bir
  // sürtünme — pite 330 ile dalıp anında 95'e düşmek yerine frenliyorsun.
  if(car.inPit&&!spinning){
    if(Math.abs(car.speed)>PIT.speed) car.speed-=Math.sign(car.speed)*Vd.brk*1.5*dt;
    if(Math.abs(car.speed)<=PIT_CRAWL&&car.damage>0){
      car.damage=Math.max(0,car.damage-PIT_REPAIR_PER_S*dt);
      if(car.damage<=0){ car.damage=0; car.nitroCharges=V?V.nos:3; sfx.buy(); }
    }
  }

  car.x+=Math.cos(car.angle)*car.speed*dt;
  car.y+=Math.sin(car.angle)*car.speed*dt;
  car.x=clamp(car.x,5,T.W-5); car.y=clamp(car.y,5,T.H-5);

  resolveCollisions(others);
  wallCheck(dt);
  if(!car.finished) trackProgress();

  if(!car.finished&&Math.abs(car.speed)>40){
    const n=performance.now();
    if(n-car.lastTrail>TRAIL_GAP){ addTrail(car.x,car.y,car.angle); car.lastTrail=n; }
  }
  if(!car.finished&&Math.abs(car.speed)>25){
    const ns2=nearestSample(T,car.x,car.y);
    if(!ns2||ns2.d>T.hw+2){
      const nd=performance.now();
      if(nd-car.lastDust>90){ addDust(car.x,car.y); car.lastDust=nd; }
    }
  }
}

/* Tur sayımı yay uzunluğundan: geri gitmek ilerlemeyi geri alıyor, yani
   çizgiyi ters geçip tur kasmak mümkün değil. prog aynı zamanda canlı
   sıralamayı veriyor (eski "tur + süre" sıralaması tur ortasında yanlıştı). */
function trackProgress(){
  const pr=projectToTrack(T,car.x,car.y);
  if(!pr){ car.inPit=false; return; }   // pistten çok uzaktayız: ilerleme donuyor
  car.inPit=inPitLane(T,pr.s,pr.lane);
  const s=pr.s, half=T.len/2;
  let ds=s-car.prevS;
  if(ds<-half){ car.lapRaw++; onLapCrossed(); }
  else if(ds>half){ car.lapRaw--; }
  car.prevS=s;
  car.prog=car.lapRaw*T.len+s;
}
function onLapCrossed(){
  const now=nowSync();
  if(car.lapRaw<=0){ car.lastLapTs=now; return; }   // grid'den ilk geçiş: tur 1 başlıyor
  if(car.lastLapTs){
    const lt=now-car.lastLapTs;
    if(car.bestLap===null||lt<car.bestLap) car.bestLap=lt;
  }
  car.lastLapTs=now;
  if(car.lapRaw>=raceLaps){
    car.finished=true; car.finishTime=now-car.raceStart; car.finishAt=now;
    showResults(); sfx.fanfare();
  } else sfx.lap();
}

/* ── efektler ───────────────────────────── */
function addTrail(x,y,angle){
  const rx=x-Math.cos(angle)*13,ry=y-Math.sin(angle)*13;
  const ca=Math.cos(angle+Math.PI/2),sa=Math.sin(angle+Math.PI/2),pw=2.5;
  trailPts.push({x1:rx-ca*pw,y1:ry-sa*pw,x2:rx+ca*pw,y2:ry+sa*pw,born:performance.now()});
  if(trailPts.length>TRAIL_MAX) trailPts.shift();
}
function addDust(x,y){
  for(let i=0;i<2;i++) dustPts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,
    vx:(Math.random()-.5)*26,vy:(Math.random()-.5)*26,r:2+Math.random()*2,born:performance.now()});
}
function addSmoke(x,y){
  smokePts.push({x:x+(Math.random()-.5)*14,y:y+(Math.random()-.5)*14,
    vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30,r:5+Math.random()*7,born:performance.now()});
  if(smokePts.length>220) smokePts.shift();
}
function addSpark(x,y){
  const a=Math.random()*Math.PI*2,sp=60+Math.random()*180;
  sparkPts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,born:performance.now()});
  if(sparkPts.length>160) sparkPts.shift();
}
function drawTrails(c){
  const now=performance.now();
  c.save(); c.lineCap='round';
  for(let i=trailPts.length-1;i>=0;i--){
    const p=trailPts[i],age=now-p.born;
    if(age>TRAIL_LIFE){trailPts.splice(i,1);continue;}
    c.strokeStyle='rgba(8,7,5,'+(0.18*(1-age/TRAIL_LIFE)).toFixed(3)+')';
    c.lineWidth=2.4; c.beginPath(); c.moveTo(p.x1,p.y1); c.lineTo(p.x2,p.y2); c.stroke();
  }
  c.restore();
}
function drawDust(c){
  const now=performance.now();
  for(let i=dustPts.length-1;i>=0;i--){
    const p=dustPts[i],age=now-p.born;
    if(age>DUST_LIFE){dustPts.splice(i,1);continue;}
    const t=age/DUST_LIFE;
    c.fillStyle='rgba(196,178,138,'+(0.24*(1-t)).toFixed(3)+')';
    c.beginPath(); c.arc(p.x+p.vx*t*.3,p.y+p.vy*t*.3,p.r+t*6,0,Math.PI*2); c.fill();
  }
}
function drawSmoke(c){
  const now=performance.now(),LIFE=1100;
  for(let i=smokePts.length-1;i>=0;i--){
    const p=smokePts[i],age=now-p.born;
    if(age>LIFE){smokePts.splice(i,1);continue;}
    const t=age/LIFE;
    c.fillStyle='rgba('+(isNight?'150,150,158':'210,206,198')+','+(0.34*(1-t)).toFixed(3)+')';
    c.beginPath(); c.arc(p.x+p.vx*t*.5,p.y+p.vy*t*.5,p.r+t*20,0,Math.PI*2); c.fill();
  }
}
function drawSparks(c){
  const now=performance.now(),LIFE=420;
  for(let i=sparkPts.length-1;i>=0;i--){
    const p=sparkPts[i],age=now-p.born;
    if(age>LIFE){sparkPts.splice(i,1);continue;}
    const t=age/LIFE;
    c.fillStyle='rgba(255,'+(190-t*90|0)+',90,'+(0.9*(1-t)).toFixed(2)+')';
    c.beginPath(); c.arc(p.x+p.vx*t*.42,p.y+p.vy*t*.42,1.6*(1-t)+.5,0,Math.PI*2); c.fill();
  }
}

/* ── uzak araçlar ───────────────────────── */
function feedRemote(pid,p,now){
  const rx=safeN(p.x,0),ry=safeN(p.y,0),ra=safeN(p.angle,0);
  let rc=remoteCars[pid];
  if(!rc){ rc={prevX:rx,prevY:ry,prevAngle:ra,targetX:rx,targetY:ry,targetAngle:ra,
    renderX:rx,renderY:ry,renderAngle:ra,updStart:performance.now(),lastT:0,lastDust:0}; remoteCars[pid]=rc; }
  else{ rc.prevX=rc.renderX;rc.prevY=rc.renderY;rc.prevAngle=rc.renderAngle;
        rc.targetX=rx;rc.targetY=ry;rc.targetAngle=ra;rc.updStart=performance.now(); }
  rc.name=String(p.name||'?').slice(0,14); rc.color=String(p.color||'#888');
  rc.veh=String(p.veh||'f4'); rc.spd=safeN(p.spd,0);
  rc.lap=safeN(p.lap,0); rc.prog=safeN(p.prog,0);
  rc.dmg=safeN(p.dmg,0); rc.crash=!!p.crash;
  rc.finished=!!p.finished; rc.totalTime=safeN(p.totalTime,0); rc.bestLap=safeN(p.bestLap,0);
  rc.racing=!!p.racing; rc.ts=safeN(p.ts,now); rc.raceId=String(p.raceId||'');
}
function feedBots(obj){
  if(!obj){ botCars={}; return; }
  const seen={};
  for(const bid in obj){
    const b=obj[bid]; if(!b) continue;
    const rx=safeN(b.x,0),ry=safeN(b.y,0),ra=safeN(b.a,0);
    let bc=botCars[bid];
    if(!bc){ bc={prevX:rx,prevY:ry,prevAngle:ra,targetX:rx,targetY:ry,targetAngle:ra,
      renderX:rx,renderY:ry,renderAngle:ra,updStart:performance.now()}; botCars[bid]=bc; }
    else{ bc.prevX=bc.renderX;bc.prevY=bc.renderY;bc.prevAngle=bc.renderAngle;
          bc.targetX=rx;bc.targetY=ry;bc.targetAngle=ra;bc.updStart=performance.now(); }
    bc.name=String(b.n||'BOT'); bc.color=String(b.c||'#888');
    bc.v=safeN(b.v,0); bc.lap=safeN(b.lap,0); bc.prog=safeN(b.s,0);
    bc.dmg=safeN(b.dmg,0); bc.crash=!!b.cr;
    bc.finished=!!b.fin; bc.finishT=safeN(b.ft,0);
    seen[bid]=1;
  }
  for(const bid in botCars) if(!seen[bid]) delete botCars[bid];
}
/* Host botları kendi simülasyonundan doğrudan besliyor (ağ turunu beklemiyor). */
function feedBotsLocal(){
  if(!botField) return;
  for(const c of botField.cars){
    const p=botPose(botField,c);
    let bc=botCars[c.id];
    if(!bc){ bc={renderX:p.x,renderY:p.y,renderAngle:p.a}; botCars[c.id]=bc; }
    bc.renderX=p.x; bc.renderY=p.y; bc.renderAngle=p.a;
    bc.targetX=p.x; bc.targetY=p.y; bc.targetAngle=p.a; bc.updStart=performance.now();
    bc.name=c.name; bc.color=c.color; bc.v=c.v; bc.lap=Math.max(0,c.lapRaw);
    bc.prog=c.s; bc.dmg=c.damage||0; bc.crash=!!c.crashed;
    bc.finished=!!c.finished; bc.finishT=(c.finishT||0)*1000; bc.local=true;
  }
}
/* Ara değer + ölü hesap: veri gecikirse son bilinen hızla ileri sarıyoruz,
   böylece uzak araçlar takılıp zıplamak yerine akıcı ilerliyor.           */
function interpRemotes(){
  const now=performance.now();
  const step=(rc,spd)=>{
    const el=now-rc.updStart;
    if(el<=syncEvery){
      const t=el/syncEvery;
      rc.renderX=lerp(rc.prevX,rc.targetX,t);
      rc.renderY=lerp(rc.prevY,rc.targetY,t);
      rc.renderAngle=lerpAngle(rc.prevAngle,rc.targetAngle,t);
    } else {
      const ex=Math.min(el-syncEvery,EXTRAP_MS)/1000;
      rc.renderX=rc.targetX+Math.cos(rc.targetAngle)*(spd||0)*ex;
      rc.renderY=rc.targetY+Math.sin(rc.targetAngle)*(spd||0)*ex;
      rc.renderAngle=rc.targetAngle;
    }
  };
  // Kaza görselleri geçiş anına bağlı: host da, izleyen de aynı patlamayı görür.
  const crashFx=o=>{
    if(o.crash&&!o.wasCrash){
      for(let k=0;k<12;k++) addSpark(o.renderX,o.renderY);
      crashSound();
    }
    o.wasCrash=!!o.crash;
    if(o.crash&&(!o.lastSmoke||now-o.lastSmoke>55)){ addSmoke(o.renderX,o.renderY); o.lastSmoke=now; }
  };
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    step(rc,rc.spd);
    const moved=Math.hypot(rc.targetX-rc.prevX,rc.targetY-rc.prevY);
    if(rc.racing&&moved>5&&(!rc.lastT||now-rc.lastT>TRAIL_GAP)){ addTrail(rc.renderX,rc.renderY,rc.renderAngle); rc.lastT=now; }
    crashFx(rc);
  }
  for(const bid in botCars){
    const bc=botCars[bid];
    if(!bc.local) step(bc,bc.v);
    crashFx(bc);
  }
}

/* ── kamera ─────────────────────────────── */
function camTarget(){
  if(car&&(localPhase==='racing'||localPhase==='results')) return {x:car.x,y:car.y};
  // izleyici: lideri takip et
  let best=null,bp=-Infinity;
  const pool=[].concat(Object.values(remoteCars),Object.values(botCars));
  for(const o of pool){ if((o.prog||0)>bp){ bp=o.prog||0; best=o; } }
  if(best) return {x:best.renderX,y:best.renderY};
  return {x:T?T.W/2:VIEW_W/2,y:T?T.H/2:VIEW_H/2};
}
function updateCamera(dt){
  if(!T) return;
  const z=T.zoom, vw=VIEW_W/z, vh=VIEW_H/z;
  const t=camTarget();
  let cx=t.x, cy=t.y;
  cx=(T.W<=vw)?T.W/2:clamp(cx,vw/2,T.W-vw/2);
  cy=(T.H<=vh)?T.H/2:clamp(cy,vh/2,T.H-vh/2);
  if(!camReady){ cam.x=cx; cam.y=cy; camReady=true; }
  else{
    const k=1-Math.pow(0.0016,dt);     // kare hızından bağımsız yumuşatma
    cam.x=lerp(cam.x,cx,k); cam.y=lerp(cam.y,cy,k);
  }
  cam.z=z;
}
function applyCam(c){
  const z=cam.z;
  c.setTransform(dpr*z,0,0,dpr*z,dpr*(VIEW_W/2-cam.x*z),dpr*(VIEW_H/2-cam.y*z));
}

/* ── gece ışıkları ──────────────────────── */
function drawNightLights(cars){
  const S=0.5, z=cam.z;
  lctx.setTransform(1,0,0,1,0,0);
  lctx.globalCompositeOperation='source-over';
  // Her kare sıfırdan kurulmalı: temizlemeden yarı saydam karanlık basmak
  // kareler boyunca birikip sahneyi opak siyaha çeviriyordu.
  lctx.clearRect(0,0,lightCv.width,lightCv.height);
  lctx.fillStyle='rgba(3,7,22,.72)';
  lctx.fillRect(0,0,lightCv.width,lightCv.height);
  lctx.globalCompositeOperation='destination-out';
  const toScreen=(x,y)=>[(VIEW_W/2+(x-cam.x)*z)*S,(VIEW_H/2+(y-cam.y)*z)*S];
  for(const o of cars){
    const [sx,sy]=toScreen(o.x,o.y);
    if(sx<-160||sy<-160||sx>lightCv.width+160||sy>lightCv.height+160) continue;
    // farlar: aracın önüne uzanan koni
    const fx=Math.cos(o.angle),fy=Math.sin(o.angle);
    const hx=sx+fx*58*z*S, hy=sy+fy*58*z*S;
    const R=84*z*S;
    const g=lctx.createRadialGradient(hx,hy,2,hx,hy,R);
    g.addColorStop(0,'rgba(0,0,0,.96)'); g.addColorStop(.5,'rgba(0,0,0,.52)'); g.addColorStop(1,'rgba(0,0,0,0)');
    lctx.fillStyle=g; lctx.beginPath(); lctx.arc(hx,hy,R,0,Math.PI*2); lctx.fill();
    // aracın etrafındaki yumuşak hâle
    const R2=38*z*S;
    const g2=lctx.createRadialGradient(sx,sy,1,sx,sy,R2);
    g2.addColorStop(0,'rgba(0,0,0,.62)'); g2.addColorStop(1,'rgba(0,0,0,0)');
    lctx.fillStyle=g2; lctx.beginPath(); lctx.arc(sx,sy,R2,0,Math.PI*2); lctx.fill();
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.globalCompositeOperation='source-over';
  ctx.drawImage(lightCv,0,0,VIEW_W,VIEW_H);
}

/* ── çizim ──────────────────────────────── */
function renderFrame(){
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=isNight?'#05070f':'#12140f'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();

  applyCam(ctx);
  if(trackImg) ctx.drawImage(trackImg,0,0,T.W,T.H);
  drawTrails(ctx); drawDust(ctx);

  const now=nowSync(),lit=[];
  const kindOf=id=>vehById(id).kind;
  // etiket kalabaligi: sadece bize yakin araclarin ismi yazilsin
  const LBL_R=(T.mode==='nascar'?260:230)/cam.z;
  const near=o=>!car||localPhase==='spectate'||Math.hypot(o.x-car.x,o.y-car.y)<LBL_R;
  for(const bid in botCars){
    const b=botCars[bid];
    drawCar(ctx,b.renderX,b.renderY,b.renderAngle,b.color,
      {kind:T.mode==='nascar'?'stock':kindOf(V?V.id:'f4'),headlights:isNight,
       label:near({x:b.renderX,y:b.renderY})?b.name:'',labelSize:11,scale:.9,damage:b.dmg,braking:b.crash});
    lit.push({x:b.renderX,y:b.renderY,angle:b.renderAngle});
  }
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(now-rc.ts>STALE_MS) continue;
    drawCar(ctx,rc.renderX,rc.renderY,rc.renderAngle,rc.color,
      {kind:kindOf(rc.veh),headlights:isNight,
       label:near({x:rc.renderX,y:rc.renderY})?rc.name:'',scale:.9,
       damage:rc.dmg,braking:rc.crash});
    lit.push({x:rc.renderX,y:rc.renderY,angle:rc.renderAngle});
  }
  if(car&&localPhase!=='spectate'){
    const braking=!!(keys['arrowdown']||keys['s']||touch.b);
    drawCar(ctx,car.x,car.y,car.angle,car.color,
      {kind:V?V.kind:'f4',headlights:isNight,label:pName,isSelf:true,
       boosting:performance.now()<nitroActiveUntil,braking,scale:.9,damage:car.damage});
    lit.push({x:car.x,y:car.y,angle:car.angle});
  }
  drawSmoke(ctx); drawSparks(ctx);

  if(isNight) drawNightLights(lit);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawMinimap();
}
/* Minimap: pist küçültülmüş hâliyle + herkesin noktası + kamera çerçevesi. */
let miniTrack=null,miniTrackFor='';
function drawMinimap(){
  if(!mctx||!T||localPhase==='lobby') return;
  const fits=(VIEW_W/cam.z>=T.W-1)&&(VIEW_H/cam.z>=T.H-1);
  miniCv.parentElement.style.display=fits?'none':'block';
  if(fits) return;
  const key=T.def.id+'|'+(isNight?'n':'d');
  if(miniTrackFor!==key&&trackImg){
    miniTrack=document.createElement('canvas');
    miniTrack.width=Math.round(MINI_W*dpr); miniTrack.height=Math.round(miniH*dpr);
    const g=miniTrack.getContext('2d');
    g.setTransform(dpr,0,0,dpr,0,0);
    g.drawImage(trackImg,0,0,MINI_W,miniH);
    miniTrackFor=key;
  }
  mctx.setTransform(dpr,0,0,dpr,0,0);
  mctx.clearRect(0,0,MINI_W,miniH);
  if(miniTrack) mctx.drawImage(miniTrack,0,0,MINI_W,miniH);
  const sx=MINI_W/T.W, sy=miniH/T.H;
  const dotAt=(x,y,col,r)=>{ mctx.fillStyle=col; mctx.beginPath(); mctx.arc(x*sx,y*sy,r,0,Math.PI*2); mctx.fill(); };
  for(const bid in botCars){ const b=botCars[bid]; dotAt(b.renderX,b.renderY,'rgba(230,226,214,.75)',1.8); }
  const now=nowSync();
  for(const pid in remoteCars){ const rc=remoteCars[pid]; if(now-rc.ts>STALE_MS) continue;
    dotAt(rc.renderX,rc.renderY,liveryOf(rc.color).hex,2.4); }
  if(car&&localPhase!=='spectate'){
    dotAt(car.x,car.y,'#f2b300',3.2);
    mctx.strokeStyle='rgba(242,179,0,.9)'; mctx.lineWidth=1.2;
    mctx.beginPath(); mctx.arc(car.x*sx,car.y*sy,5,0,Math.PI*2); mctx.stroke();
  }
  // kamera çerçevesi (pist ekrana sığmıyorsa anlamlı)
  const vw=VIEW_W/cam.z, vh=VIEW_H/cam.z;
  if(vw<T.W-1||vh<T.H-1){
    mctx.strokeStyle='rgba(236,234,222,.5)'; mctx.lineWidth=1;
    mctx.strokeRect((cam.x-vw/2)*sx,(cam.y-vh/2)*sy,vw*sx,vh*sy);
  }
}

/* ── sıralama ───────────────────────────── */
/* Bitirenler süreye, bitirmeyenler kat edilen mesafeye göre. Mesafe tabanlı
   olduğu için tur ortasındaki pozisyon da doğru.                          */
function buildStandings(){
  const now=nowSync(),list=[];
  if(car&&localPhase!=='spectate'){
    list.push({id:uid,me:true,name:pName,color:car.color,veh:V?V.id:'f4',
      lap:Math.max(0,car.lapRaw),prog:car.prog,finished:car.finished,
      totalTime:car.finished?car.finishTime:(now-car.raceStart),bestLap:car.bestLap||0,dmg:car.damage});
  }
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(!rc.racing||now-rc.ts>STALE_MS) continue;
    if(raceId&&rc.raceId&&rc.raceId!==raceId) continue;
    list.push({id:pid,me:false,name:rc.name,color:rc.color,veh:rc.veh,
      lap:rc.lap,prog:rc.prog,finished:rc.finished,totalTime:rc.totalTime,bestLap:rc.bestLap,dmg:rc.dmg});
  }
  for(const bid in botCars){
    const b=botCars[bid];
    list.push({id:bid,me:false,bot:true,name:b.name,color:b.color,veh:'stock',
      lap:b.lap,prog:b.prog,finished:b.finished,totalTime:b.finishT,bestLap:0,dmg:b.dmg});
  }
  list.sort((a,b)=>{
    if(a.finished!==b.finished) return a.finished?-1:1;
    if(a.finished) return a.totalTime-b.totalTime;
    return b.prog-a.prog;
  });
  lastStandings=list;
  return list;
}
function updateLB(){
  const list=buildStandings();
  const mine=list.findIndex(p=>p.me);
  posText.textContent='P'+(mine>=0?mine+1:'-');
  lbTitle.textContent='Sıralama ('+list.length+')';
  lbRows.innerHTML='';
  list.slice(0,10).forEach((p,i)=>{
    const row=document.createElement('div'); row.className='lbr'+(p.me?' me':'');
    const pos=document.createElement('span'); pos.className='lbp'; pos.textContent=(i+1);
    const n=document.createElement('span'); n.className='lbn';
    n.textContent=(p.finished?'🏁 ':'')+p.name+(p.bot?' ·b':'');
    const info=document.createElement('span'); info.textContent=Math.min(p.lap,raceLaps)+'/'+raceLaps;
    row.appendChild(pos); row.appendChild(n); row.appendChild(info); lbRows.appendChild(row);
  });
}

/* ── podyum ─────────────────────────────── */
function showResults(){
  if(resultsShownAt) return;
  resultsShownAt=nowSync();
  renderResults(false);
  resultsEl.style.display='flex';
}
function hideResults(){ resultsEl.style.display='none'; resultsShownAt=0; }
const MEDAL=['🥇','🥈','🥉'];
function renderResults(final){
  const list=buildStandings();
  const winner=list[0];
  resTitle.textContent=final?'🏁 Yarış Bitti':'🏁 Bitirdin!';
  resSub.textContent=(T?T.def.name:'')+' · '+raceLaps+' tur'+(isNight?' · gece':'');
  resRows.innerHTML='';
  list.forEach((p,i)=>{
    const row=document.createElement('div'); row.className='res-row'+(p.me?' me':'');
    const pos=document.createElement('span'); pos.className='res-pos';
    pos.textContent=i<3?MEDAL[i]:(i+1);
    const sw=document.createElement('span'); sw.className='res-sw'; liveryFill(sw,p.color);
    const nm=document.createElement('span'); nm.className='res-name';
    nm.textContent=p.name+(p.bot?' · bot':'');
    const tm=document.createElement('span'); tm.className='res-time';
    if(p.finished){
      tm.textContent=(i===0||!winner.finished)?fmtTime(p.totalTime)
        :'+'+fmtTime(Math.max(0,p.totalTime-winner.totalTime));
    } else {
      tm.textContent=Math.min(p.lap,raceLaps)+'/'+raceLaps+' tur';
      tm.classList.add('dnf');
    }
    row.appendChild(pos); row.appendChild(sw); row.appendChild(nm); row.appendChild(tm);
    resRows.appendChild(row);
  });
  const me=list.find(p=>p.me);
  if(me&&me.bestLap) resSub.textContent+=' · en iyi turun '+fmtTime(me.bestLap);
}
function updateResultsStatus(){
  if(!resultsShownAt) return;
  if(localPhase==='results'){
    const left=Math.max(0,PODIUM_MS-(nowSync()-resultsShownAt));
    resStatus.textContent='Lobiye dönülüyor… '+Math.ceil(left/1000);
  } else {
    const list=lastStandings;
    const running=list.filter(p=>!p.finished).length;
    resStatus.textContent=running?('Pistte '+running+' yarışçı var — bekleniyor…'):'Sonuçlar kesinleşiyor…';
  }
}

/* ── faz geçişleri ──────────────────────── */
function applyPhaseVisibility(){
  const racing=(localPhase==='racing'),spect=(localPhase==='spectate');
  hudPanel.style.display=racing?'block':'none';
  lbPanel.style.display=(racing||spect)?'block':'none';
  if(miniCv&&!(racing||spect)) miniCv.parentElement.style.display='none';
  tcEl.style.display=(racing&&isTouch)?'flex':'none';
  lobbyPanel.style.display=(localPhase==='lobby')?'block':'none';
  lpLobby.style.display=(localPhase==='lobby')?'block':'none';
  spectateEl.style.display=spect?'flex':'none';
  if(dmgRow) dmgRow.style.display=(racing&&T&&T.mode==='nascar')?'flex':'none';
  if(!racing&&!spect) countdownEl.style.display='none';
}
function enterRacingPhase(startAt,state){
  const now=nowSync();
  // Emniyet kemeri: saat senkronu kaydıysa bile kimse 11 saniyelik geri sayım
  // görmesin ya da geri sayımı atlayıp erken kalkmasın.
  let wait=safeN(startAt,now)-now;
  if(!(wait>0)) wait=0;
  else if(wait>LEAD_MS+1200) wait=LEAD_MS+1200;
  const start=now+wait;

  raceId=state.raceId||('r'+now);
  setupRace(state.cfg);
  resetCarForRace();
  car.raceStart=start; car.lastLapTs=null; car.locked=wait>0;

  const live=Object.keys(state.players||{}).filter(pid=>{
    const p=state.players[pid];
    return p&&p.name&&(pid===uid||now-safeN(p.ts,0)<=STALE_MS);
  });
  const order=gridOrder(live.length?live:[uid],state.fieldSeed);
  placeOnGrid(Math.max(0,order.indexOf(uid)));
  maybeCreateBots(state,order.length);

  localPhase='racing'; camReady=false; cautionUntil=0;
  setSyncRate(RACE_SYNC_MS);
  applyPhaseVisibility();
}
function enterSpectate(state){
  raceId=state.raceId||'';
  setupRace(state.cfg);
  localPhase='spectate'; camReady=false;
  setSyncRate(RACE_SYNC_MS);
  spectateText.textContent='Yarış sürüyor — izliyorsun. Bitince lobiye alınacaksın.';
  applyPhaseVisibility();
}
function resetCarForRace(){
  car.lapRaw=-1; car.prog=0; car.prevS=0;
  car.finished=false; car.finishTime=0; car.finishAt=0;
  car.bestLap=null; car.lastLapTs=null;
  car.damage=0; car.spin=0; car.spinCool=0; car.onWall=false; car.inPit=false; car.draft=0;
  car.nitroCharges=V?V.nos:3;
  car.speed=0; car.lastTrail=0; car.lastDust=0; car.lastSmoke=0;
  trailPts=[]; dustPts=[]; smokePts=[]; sparkPts=[];
  nitroActiveUntil=0;
  hideResults();
}
function resetToLobby(){
  localPhase='lobby';
  botField=null; botCars={}; raceId='';
  resetCarForRace();
  setSyncRate(SYNC_MS);
  document.body.classList.remove('night');
  applyPhaseVisibility();
  renderLobbyControls();
}
function setSyncRate(ms){
  if(syncEvery===ms&&syncTimer) return;
  syncEvery=ms;
  if(syncTimer) clearInterval(syncTimer);
  syncTimer=setInterval(syncTick,syncEvery);
}

/* ── botlar (yalnız host) ───────────────── */
function maybeCreateBots(state,humanCount){
  botField=null; botCars={};
  const want=state.cfg.bots|0;
  if(want<=0) return;
  const cls=trackCls(state.cfg.trackId);
  const count=Math.min(want,Math.max(0,MAX_FIELD-humanCount));
  if(count<=0) return;
  if(!isHost) return;                 // host olmayan botları ağdan alır
  const taken=[];
  if(car) taken.push(liveryOf(car.color).hex);
  for(const pid in remoteCars) taken.push(liveryOf(remoteCars[pid].color).hex);
  botField=createField({T,laps:raceLaps,vehicle:V,count,level:state.cfg.botLevel|0,
    seed:state.fieldSeed,cls,takenColors:taken,gridStart:humanCount});
  feedBotsLocal();   // geri sayım boyunca botlar grid'de dursun, boş görünmesin
}
function stepBots(dt){
  if(!botField||!isHost||localPhase!=='racing') return;
  if(car&&car.locked) return;          // geri sayım bitene kadar bekle
  const humans=[];
  if(car) humans.push({id:uid,name:pName,color:car.color,x:car.x,y:car.y,
    speed:car.speed,lapRaw:Math.max(0,car.lapRaw),finished:car.finished});
  const now=nowSync();
  for(const pid in remoteCars){
    const rc=remoteCars[pid];
    if(!rc.racing||now-rc.ts>STALE_MS) continue;
    humans.push({id:pid,name:rc.name,color:rc.color,x:rc.renderX,y:rc.renderY,
      speed:rc.spd,lapRaw:rc.lap,finished:rc.finished});
  }
  stepField(botField,dt,humans,ev=>{
    // Kıvılcım/ses crashFx'te geçiş anında veriliyor; burada sadece caution.
    if(ev.type==='crash'&&ev.caught>=2) cautionUntil=nowSync()+7000;
  });
  feedBotsLocal();
}

/* ── HUD ────────────────────────────────── */
function updateHUD(){
  if(!car) return;
  lapText.textContent='Tur '+Math.min(Math.max(0,car.lapRaw),raceLaps)+'/'+raceLaps;
  const el=car.finished?car.finishTime:(nowSync()-car.raceStart);
  timeText.textContent=fmtTime(el);
  speedText.textContent=Math.round(Math.abs(car.speed))+' km/h'+(car.draft>0.15?' 🌀':'');
  bestLapText.textContent='En iyi tur: '+(car.bestLap!==null?fmtTime(car.bestLap):'–');
  nosPips().forEach((p,i)=>p.classList.toggle('on',i<car.nitroCharges));
  if(dmgFill) dmgFill.style.width=Math.round(car.damage*100)+'%';
  if(pitTag){
    const nascar=T&&T.mode==='nascar';
    if(!nascar||car.finished){ pitTag.style.display='none'; }
    else if(car.inPit&&car.damage>0){
      pitTag.style.display='block'; pitTag.className='pit-fix';
      pitTag.textContent=Math.abs(car.speed)<=PIT_CRAWL
        ? '🔧 TAMİR — %'+Math.round((1-car.damage)*100)
        : '🔧 PİT — YAVAŞLA';
    }
    else if(car.inPit){ pitTag.style.display='block'; pitTag.className='pit-ok'; pitTag.textContent='✅ ONARILDI — ÇIK'; }
    else if(car.damage>0.4){ pitTag.style.display='block'; pitTag.className='pit-warn'; pitTag.textContent='⚠ HASAR — PİTE GİR'; }
    else pitTag.style.display='none';
  }
  if(flagBanner){
    const on=nowSync()<cautionUntil;
    flagBanner.style.display=on?'block':'none';
  }
}
function updateCountdownUI(){
  if(localPhase!=='racing'||!car||!car.locked){ countdownEl.style.display='none'; return; }
  const msLeft=car.raceStart-nowSync();
  if(msLeft<=0){ countdownEl.style.display='none'; return; }
  countdownEl.style.display='flex';
  const txt=String(Math.ceil(msLeft/1000));
  if(cdNum.textContent!==txt){
    cdNum.textContent=txt; sfx.countdown();
    cdNum.style.animation='none'; void cdNum.offsetWidth; cdNum.style.animation='cdPop .5s ease-out';
  }
}

/* ── döngü ──────────────────────────────── */
function frame(t){
  if(localPhase==='menu') return;
  const dt=Math.min((t-(lastT||t))/1000,.05); lastT=t;
  const others=othersNow();
  if(localPhase==='racing') updateCar(dt,others);
  stepBots(dt);
  interpRemotes();
  updateCamera(dt);
  renderFrame();
  if(localPhase==='racing'){ updateHUD(); updateCountdownUI(); }
  updateEngineSound();
  if(resultsShownAt){ renderResults(localPhase==='results'); updateResultsStatus(); }
  rafId=requestAnimationFrame(frame);
}
function startLoops(){ lastT=0; rafId=requestAnimationFrame(frame); syncTick(); setSyncRate(syncEvery); }
function stopLoops(){ if(rafId) cancelAnimationFrame(rafId); rafId=null; if(syncTimer) clearInterval(syncTimer); syncTimer=null; }

/* ── senkron ────────────────────────────── */
async function syncTick(){
  if(!car||syncBusy||localPhase==='menu') return;
  syncBusy=true;
  try{
    const now=nowSync();
    const writes=[netGetRoom()];
    if(localPhase!=='spectate') writes.push(netPutMe(buildMyEntry(now)));
    const [state]=await Promise.all(writes);
    if(!state) return;                 // ağ hatası: faz kararı verme

    const players=livePlayers(state.players,now);
    for(const pid in players){ if(pid!==uid) feedRemote(pid,players[pid],now); }
    for(const pid in remoteCars){ if(!players[pid]) delete remoteCars[pid]; }

    const live=Object.keys(players).filter(pid=>pid===uid||now-safeN(players[pid].ts,0)<=STALE_MS).sort();
    isHost=(live[0]===uid)||(live.length===0);

    // botlar: host yazar, diğerleri okur
    if(isHost&&botField&&localPhase==='racing'){
      if(live.length>1) netPutBots(serializeBots(botField));
    } else if(state.bots){
      feedBots(state.bots);
      if(isHost&&!botField&&localPhase==='racing'&&(state.cfg.bots|0)>0){
        maybeCreateBots(state,live.length); adoptBots(botField,state.bots);
      }
    }

    if(localPhase==='lobby'){
      if(!isHost){ cfg=state.cfg; syncCfgToUI(); }
      renderLobbyList(players,now);
    }

    if(now>=phaseGuardUntil) applyRemotePhase(state,now);
    if(isHost&&now>=phaseGuardUntil) hostDuties(state,live,now);

    if(isHost){
      for(const pid in state.players){
        if(pid===uid) continue;
        if(now-safeN((state.players[pid]||{}).ts,0)>PRUNE_MS) netDropPlayer(pid);
      }
    }
    if(localPhase!=='lobby') updateLB();
  }catch(e){ console.warn('sync',e); }
  finally{ syncBusy=false; }
}

/* Uzaktan gelen faz değişimini yerel duruma uygula. */
function applyRemotePhase(state,now){
  if(state.phase==='racing'){
    if(localPhase==='lobby'){
      const left=safeN(state.raceStartAt,0)-now;
      // geri sayım hâlâ sürüyorsa yarışa yetiş, değilse izleyiciye geç
      if(left>JOIN_GRACE_MS) enterRacingPhase(state.raceStartAt,state);
      else enterSpectate(state);
    } else if(localPhase==='racing'&&state.raceId&&raceId&&state.raceId!==raceId){
      enterRacingPhase(state.raceStartAt,state);   // yeni yarış başlamış
    }
  } else if(state.phase==='results'){
    if(localPhase==='racing'||localPhase==='spectate'){
      localPhase='results';
      setSyncRate(SYNC_MS);
      showResults();
      applyPhaseVisibility();
    }
  } else {                                    // lobby
    if(localPhase==='results'||localPhase==='spectate') resetToLobby();
    else if(localPhase==='racing') resetToLobby();
  }
}
/* Host sorumlulukları: yarışı bitirme kararı ve lobiye dönüş. */
function hostDuties(state,live,now){
  if(state.phase==='racing'){
    const racers=[];
    for(const pid of live){
      const p=state.players[pid];
      if(p&&p.racing&&(!p.raceId||!state.raceId||p.raceId===state.raceId)) racers.push(p);
    }
    const anyHuman=racers.length>0;
    const allHumanDone=anyHuman&&racers.every(p=>p.finished);
    const botsDone=!botField||botField.cars.every(c=>c.finished);
    // İlk bitirenden itibaren sayılan pencere: geride kalan biri hiç
    // bitirmezse yarış sonsuza kadar açık kalmasın.
    let firstFin=0;
    racers.forEach(p=>{
      if(!p.finished) return;
      const t=safeN(p.finishedAt,0);
      if(t>0&&(firstFin===0||t<firstFin)) firstFin=t;
    });
    if(botField) botField.cars.forEach(c=>{
      if(!c.finished) return;
      const t=safeN(state.raceStartAt,now)+(c.finishT||0)*1000;
      if(firstFin===0||t<firstFin) firstFin=t;
    });
    const started=safeN(state.raceStartAt,now);

    const everyoneDone=allHumanDone&&botsDone;
    const windowUp=firstFin&&(now-firstFin>FINISH_WINDOW_MS);
    const hardCap=now-started>RACE_MAX_MS;
    const abandoned=!anyHuman&&now-started>8000;

    if(abandoned){ netPatchMeta({phase:'lobby',raceStartAt:null,endedAt:null}); netDropBots(); return; }
    if(everyoneDone||windowUp||hardCap){
      netPatchMeta({phase:'results',endedAt:now});
    }
  } else if(state.phase==='results'){
    const ended=safeN(state.endedAt,now);
    if(now-ended>=PODIUM_MS){
      netPatchMeta({phase:'lobby',raceStartAt:null,endedAt:null});
      netDropBots();
    }
  }
}

/* ── lobi ───────────────────────────────── */
function renderLobbyList(playersObj,now){
  const rows=[{name:pName,color:car.color,me:true}];
  for(const pid in playersObj){
    if(pid===uid) continue;
    const p=playersObj[pid];
    if(p.racing) continue;
    if(now-(p.ts||0)>STALE_MS) continue;
    rows.push({name:String(p.name||'?').slice(0,14),color:p.color||'#888',me:false});
  }
  lpPlayerList.innerHTML='';
  rows.forEach(r=>{
    const row=document.createElement('div'); row.className='lp-player'+(r.me?' me':'');
    const sw=document.createElement('span'); sw.className='lp-swatch'; liveryFill(sw,r.color);
    const nm=document.createElement('span'); nm.textContent=r.name;
    row.appendChild(sw); row.appendChild(nm); lpPlayerList.appendChild(row);
  });
  lpCountLabel.textContent='Odadakiler ('+rows.length+')';
  renderColorPicker(rows);
}
function renderColorPicker(rows){
  const cls=trackCls(cfg.trackId);
  const taken=new Set(rows.filter(r=>!r.me).map(r=>liveryOf(r.color).hex));
  const mine=liveryOf(car.color).hex;
  colorPicker.innerHTML='';
  liveriesFor(cls).forEach(liv=>{
    const b=document.createElement('button'); b.type='button';
    const used=taken.has(liv.hex)&&liv.hex!==mine;
    b.className='liv'+(liv.hex===mine?' picked':'')+(used?' taken':'');
    b.setAttribute('aria-label',liv.name+' vinili');
    const cv=document.createElement('canvas');
    paintCarThumb(cv,cls==='nascar'?'stock':(V?V.kind:'f4'),liv.hex,72,36);
    const cap=document.createElement('span'); cap.className='liv-n';
    cap.textContent=liv.num?('#'+liv.num+' '+liv.name):liv.name;
    b.appendChild(cv); b.appendChild(cap);
    b.addEventListener('click',()=>{ if(used) return; car.color=liv.hex; renderColorPicker(rows); });
    colorPicker.appendChild(b);
  });
}
/* Ayarları yalnız host değiştirebiliyor; diğerleri canlı olarak görüyor. */
function renderLobbyControls(){
  const host=isHost;
  trackPicker.innerHTML='';
  ONLINE_TRACKS.forEach(t=>{
    const b=document.createElement('button'); b.type='button';
    b.className='trk'+(t.id===cfg.trackId?' picked':'')+(t.mode==='nascar'?' nascar':'');
    b.disabled=!host;
    b.innerHTML='<span class="trk-i">'+t.icon+'</span><span class="trk-n">'+t.name+'</span>'+
      '<span class="trk-s">'+t.sub+'</span><span class="trk-l">'+t.laps+' tur</span>';
    b.addEventListener('click',()=>{ if(!host) return; setCfg({trackId:t.id}); });
    trackPicker.appendChild(b);
  });
  const cls=trackCls(cfg.trackId);
  vehPicker.innerHTML='';
  vehiclesFor(cls).forEach(v=>{
    const b=document.createElement('button'); b.type='button';
    b.className='veh'+(v.id===cfg.vehId?' picked':'');
    b.disabled=!host;
    const cv=document.createElement('canvas');
    paintCarThumb(cv,v.kind,car?car.color:COLORS[0],76,38);
    const nm=document.createElement('span'); nm.className='veh-n'; nm.textContent=v.name;
    const sb=document.createElement('span'); sb.className='veh-s'; sb.textContent=v.sub;
    const bars=document.createElement('span'); bars.className='veh-bars';
    [['Hız',v.spd/340],['İvme',v.acc/280],['Dönüş',v.turn/4.2]].forEach(([lab,frac])=>{
      const w=document.createElement('span'); w.className='vb';
      const f=document.createElement('i'); f.style.width=Math.round(clamp(frac,0,1)*100)+'%';
      w.title=lab; w.appendChild(f); bars.appendChild(w);
    });
    b.appendChild(cv); b.appendChild(nm); b.appendChild(bars); b.appendChild(sb);
    b.addEventListener('click',()=>{ if(!host) return; setCfg({vehId:v.id}); });
    vehPicker.appendChild(b);
  });
  botCount.disabled=!host; botLevel.disabled=!host; nightToggle.disabled=!host;
  hostNote.style.display=host?'none':'block';
  startRaceBtn.disabled=!host;
  startRaceBtn.textContent=host?'🏁 Yarışı Başlat':'Host başlatmayı bekliyor…';
  syncCfgToUI();
}
function syncCfgToUI(){
  const cls=trackCls(cfg.trackId);
  if(vehById(cfg.vehId).cls!==cls) cfg.vehId=defaultVehFor(cls).id;
  V=vehById(cfg.vehId);
  botCount.value=String(cfg.bots);
  botLevel.value=String(cfg.botLevel);
  nightToggle.checked=!!cfg.night;
  [...trackPicker.children].forEach((b,i)=>b.classList.toggle('picked',ONLINE_TRACKS[i].id===cfg.trackId));
  const vl=vehiclesFor(cls);
  if(vehPicker.children.length!==vl.length) renderLobbyControls();
  else [...vehPicker.children].forEach((b,i)=>b.classList.toggle('picked',vl[i].id===cfg.vehId));
  // NASCAR'a geçince liveri ve araç sınıfı otomatik uysun
  const livs=liveriesFor(cls);
  if(car&&!livs.some(l=>l.hex===liveryOf(car.color).hex)) car.color=livs[0].hex;
}
function setCfg(patch){
  Object.assign(cfg,patch);
  const cls=trackCls(cfg.trackId);
  if(vehById(cfg.vehId).cls!==cls) cfg.vehId=defaultVehFor(cls).id;
  if(cls==='nascar'&&cfg.bots===0) cfg.bots=Math.min(MAX_FIELD-1,11);   // NASCAR boş grid istemez
  renderLobbyControls();
  netPatchMeta({cfg:cfg});
}

/* ── yarışı başlat ──────────────────────── */
async function onStartClicked(){
  if(startingRace||!isHost) return;
  startingRace=true; startRaceBtn.disabled=true;
  phaseGuardUntil=nowSync()+PHASE_GUARD_MS;
  try{
    for(let i=0;i<40&&syncBusy;i++) await new Promise(r=>setTimeout(r,50));
    const startAt=nowSync()+LEAD_MS;
    const rid='r'+Date.now().toString(36);
    const seed=(Math.random()*1e9)|0;
    phaseGuardUntil=nowSync()+PHASE_GUARD_MS;
    const ok=await netPatchMeta({phase:'racing',raceStartAt:startAt,raceId:rid,
      fieldSeed:seed,endedAt:null,cfg:cfg});
    if(!ok){ phaseGuardUntil=0; flashHint($('startHint'),'⚠ Bağlantı kurulamadı — tekrar dene.'); return; }
    const state=await netGetRoom();
    enterRacingPhase(startAt,state||{raceId:rid,fieldSeed:seed,cfg:cfg,players:{}});
    await netPutMe(buildMyEntry(nowSync()));
  } finally { startingRace=false; startRaceBtn.disabled=!isHost; }
}

/* ── odadan ayrıl ───────────────────────── */
async function leaveRoom(){
  stopLoops();
  localPhase='menu';
  const alone=Object.keys(remoteCars).length===0;
  if(roomCode){
    try{ await netDropPlayer(uid); if(alone){ await netDropBots(); await netDropRoom(); } }catch(e){}
  }
  remoteCars={}; botCars={}; botField=null;
  trailPts=[]; dustPts=[]; smokePts=[]; sparkPts=[];
  hideResults(); countdownEl.style.display='none';
  phaseGuardUntil=0; isHost=false; netOk=null; netFails=0; raceId='';
  document.body.classList.remove('night');
  crossFade(gameEl,menuEl);
}

/* ── giriş ──────────────────────────────── */
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

botCount.addEventListener('change',()=>{ if(isHost) setCfg({bots:clamp(parseInt(botCount.value,10)||0,0,MAX_FIELD-1)}); });
botLevel.addEventListener('change',()=>{ if(isHost) setCfg({botLevel:clamp(parseInt(botLevel.value,10)||0,0,3)}); });
nightToggle.addEventListener('change',()=>{ if(isHost) setCfg({night:nightToggle.checked?1:0}); });

/* ── menü ───────────────────────────────── */
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

  car=makeCar(); remoteCars={}; botCars={};
  trailPts=[]; dustPts=[]; smokePts=[]; sparkPts=[];

  const state=await netGetRoom();
  btn.disabled=false; btn.textContent='Odaya Katıl';
  if(!state){ flashHint($('joinHint'),'⚠ Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.'); return; }

  // Faz, geri sayım ve bayatlık kararlarının hepsi sunucu saatine dayanır.
  await netSyncClock();

  const now=nowSync();
  const players=livePlayers(state.players,now);
  const live=Object.keys(players).filter(pid=>pid!==uid);
  isHost=live.length===0;
  cfg=state.cfg;
  if(isHost&&state.phase!=='lobby'){
    // terk edilmiş yarış kalıntısı: odayı lobiye çek
    await netPatchMeta({phase:'lobby',raceStartAt:null,endedAt:null});
    state.phase='lobby';
  }

  const taken=new Set(live.map(pid=>liveryOf(players[pid].color).hex));
  const livs=liveriesFor(trackCls(cfg.trackId));
  const free=livs.find(l=>!taken.has(l.hex));
  car.color=(free||livs[Math.floor(Math.random()*livs.length)]).hex;
  V=vehById(cfg.vehId);

  let activeRacers=0;
  for(const pid of live) if(players[pid].racing&&(now-safeN(players[pid].ts,0))<STALE_MS) activeRacers++;

  if(state.phase==='racing'&&activeRacers>0){
    const left=safeN(state.raceStartAt,0)-now;
    if(left>JOIN_GRACE_MS){ enterRacingPhase(state.raceStartAt,state); }
    else { enterSpectate(state); }
  } else if(state.phase==='results'&&activeRacers>0){
    enterSpectate(state);
    localPhase='spectate';
  } else {
    localPhase='lobby';
    setupRace(cfg);            // lobide arka planda pist görünsün diye
    renderLobbyControls();
  }

  await netPutMe(buildMyEntry(nowSync()));
  crossFade(menuEl,gameEl);
  applyPhaseVisibility();
  startLoops();
});

// sekme kapanırsa lobide hayalet bırakma
window.addEventListener('pagehide',()=>{ if(roomCode&&localPhase!=='menu') netDropPlayer(uid,true); });

$('leaveBtn').addEventListener('click',leaveRoom);
startRaceBtn.addEventListener('click',onStartClicked);
