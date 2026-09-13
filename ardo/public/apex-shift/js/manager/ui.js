/* Apex Shift — Takım Menajeri. Yarışlar kendiliğinden döner: sen ödül, taraftar ve
   sponsor geliri toplar, pilotunun yeteneklerini geliştirir, sınıf atlarsın.
   İlerleme localStorage'da tutulur; oyun kapalıyken de gelir birikir. */
import {$,clamp,fmtTime,crossFade,audio,sfx,drawCar,mulberry32,shuffle} from '../common.js';
import {TRACKS,MW,MH,buildTrack,paintTrack} from './track.js';
import {createRace,stepRace,standings,carPose,playerStats,aiStats} from './sim.js';
import {SKILLS,CLASSES,AI_TEAMS,AI_COLORS,TEAM_COLORS,BOOST_MS,BOOST_CD_MS,OFFLINE_CAP_S,OFFLINE_RATE,
  skillCost,skillBonus,skillMaxed,defaultSave,loadSave,persist,wipeSave,incomePerSec,prizeFor,fansFor,gemsFor,fmtMoney,fmtNum} from './data.js';

const RESULT_MS=4500, CAR_SCALE=1.15, SAVE_EVERY=5000, SW=1000, SH=40;
const dpr=Math.min(window.devicePixelRatio||1,2);

const root=$('manager'), menuEl=$('menu');
const cv=$('mgCanvas'), ctx=cv.getContext('2d');
const strip=$('mgStrip'), sctx=strip.getContext('2d');
cv.width=MW*dpr; cv.height=MH*dpr;
strip.width=SW*dpr; strip.height=SH*dpr;

const E={
  cash:$('mgCash'),income:$('mgIncome'),gems:$('mgGems'),boost:$('mgBoost'),classShort:$('mgClassShort'),classBadge:$('mgClassBadge'),
  team:$('mgTeam'),fans:$('mgFans'),pos:$('mgPos'),timer:$('mgTimer'),cls:$('mgClass'),track:$('mgTrack'),lap:$('mgLap'),
  cd:$('mgCountdown'),cdNum:$('mgCdNum'),result:$('mgResult'),skills:$('mgSkills'),toast:$('mgToast'),avatar:$('mgAvatar'),mute:$('mgMute'),
};

let save=null, race=null, running=false, rafId=0, lastT=0, lastUi=0, lastSave=0, resultUntil=0, hiddenAt=0;
let prevPos=0, lastCd=null, onClose=null;
const tracks=[], trackArt=[];

function getTrack(i){
  if(!tracks[i]){ tracks[i]=buildTrack(TRACKS[i]); trackArt[i]=paintTrack(tracks[i],dpr); }
  return tracks[i];
}
function bonuses(){ const b={}; SKILLS.forEach(sk=>{ b[sk.id]=skillBonus(sk,save.skills[sk.id]||0); }); return b; }
const boostOn=()=>Date.now()<save.boostUntil;
const boostMult=()=>boostOn()?2:1;
function store(){ if(!save) return; save.lastSeen=Date.now(); persist(save); lastSave=performance.now(); }
function setText(el,t){ if(el.textContent!==t) el.textContent=t; }
function mmss(ms){ return fmtTime(ms).slice(0,5); }
function el(tag,cls,text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }

let toastTimer=0;
function toast(html,ms){
  E.toast.innerHTML=html; E.toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>E.toast.classList.remove('show'),ms||2600);
}

/* ── yetenek kartları ──────────────────── */
const skillEls={};
function buildSkills(){
  E.skills.innerHTML='';
  SKILLS.forEach(sk=>{
    const card=el('div','sk');
    card.innerHTML=`<div class="sk-head"><span class="sk-ic" aria-hidden="true">${sk.icon}</span>`+
      `<div class="sk-t"><div class="sk-name">${sk.name}</div><div class="sk-lv"></div></div>`+
      `<button class="sk-info" type="button" aria-label="${sk.name} nedir?">i</button></div>`+
      `<div class="sk-val"></div><button class="sk-buy" type="button"><span>Geliştir</span><span class="sk-cost"></span></button>`;
    const r={card,lv:card.querySelector('.sk-lv'),val:card.querySelector('.sk-val'),buy:card.querySelector('.sk-buy'),cost:card.querySelector('.sk-cost')};
    card.querySelector('.sk-info').addEventListener('click',()=>toast(`<b>${sk.name}</b> — ${sk.desc}`,3400));
    r.buy.addEventListener('click',()=>buySkill(sk));
    skillEls[sk.id]=r; E.skills.appendChild(card);
  });
}
const pct=v=>(Math.round(v*1000)/10)+'%';
function updateSkills(){
  SKILLS.forEach(sk=>{
    const r=skillEls[sk.id], lv=save.skills[sk.id]||0, max=skillMaxed(sk,lv), cost=skillCost(sk,lv);
    setText(r.lv,'Sv. '+lv);
    const html=max?`<b>${pct(skillBonus(sk,lv))}</b> · MAKS`:`${pct(skillBonus(sk,lv))} <span aria-hidden="true">→</span> <b>${pct(skillBonus(sk,lv+1))}</b>`;
    if(r.val.dataset.h!==html){ r.val.innerHTML=html; r.val.dataset.h=html; }
    setText(r.cost,max?'—':fmtMoney(cost));
    r.buy.disabled=max||save.cash<cost;
  });
}
function buySkill(sk){
  const lv=save.skills[sk.id]||0;
  if(skillMaxed(sk,lv)) return;
  const cost=skillCost(sk,lv);
  if(save.cash<cost) return;
  save.cash-=cost; save.skills[sk.id]=lv+1;
  const me=race&&race.cars.find(c=>c.isPlayer);
  if(me) me.stats=playerStats(bonuses());          // etkisi anında, süren yarışta da
  sfx.buy();
  const card=skillEls[sk.id].card; card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  updateEconomy(); store();
}

/* ── yarış döngüsü ─────────────────────── */
function newRace(){
  const ti=save.trackIdx%TRACKS.length, trk=getTrack(ti), cls=CLASSES[save.classIdx];
  const rng=mulberry32((Date.now()^Math.imul(save.races+1,2654435761))>>>0);
  const names=shuffle(AI_TEAMS.filter(n=>n!==save.team),rng);
  const cols=shuffle(AI_COLORS.filter(c=>c.toLowerCase()!==save.color.toLowerCase()),rng);
  const entrants=[{id:'me',name:save.team,color:save.color,isPlayer:true,stats:playerStats(bonuses())}];
  for(let i=0;i<9;i++) entrants.push({id:'ai'+i,name:names[i],color:cols[i%cols.length],stats:aiStats(cls.mult,rng)});
  race=createRace({track:trk,laps:cls.laps,entrants,rng});
  race.trackIdx=ti; race.classIdx=save.classIdx;
  prevPos=0; lastCd=null; E.result.hidden=true;
  setText(E.cls,cls.name); setText(E.track,TRACKS[ti].name);
}
function finishRace(){
  const order=standings(race), pos=order.findIndex(c=>c.isPlayer)+1, cls=CLASSES[race.classIdx];
  const m=boostMult(), cash=prizeFor(pos,cls)*m, fans=fansFor(pos,cls), gems=gemsFor(pos);
  save.cash+=cash; save.fans+=fans; save.gems+=gems;
  save.races++; if(pos===1) save.wins++; if(pos<=3) save.podiums++;
  save.trackIdx=(race.trackIdx+1)%TRACKS.length;
  store();
  showResult(order,pos,{cash,fans,gems,m});
  resultUntil=performance.now()+RESULT_MS;
  if(pos<=3) sfx.fanfare(); else sfx.lap();
  updateEconomy();
}
function showResult(order,pos,g){
  const r=E.result; r.innerHTML='';
  const box=el('div','rs-box');
  box.appendChild(el('div','rs-title','🏁 '+TRACKS[race.trackIdx].name+' · '+CLASSES[race.classIdx].name));
  box.appendChild(el('div','rs-pos'+(pos===1?' win':pos<=3?' podium':''),'P'+pos));
  const gain=el('div','rs-gain');
  gain.appendChild(el('span','g-cash','+'+fmtMoney(g.cash)+(g.m>1?' (2x)':'')));
  gain.appendChild(el('span','g-fans','+'+fmtNum(g.fans)+' 👥'));
  if(g.gems) gain.appendChild(el('span','g-gems','+'+g.gems+' 💎'));
  box.appendChild(gain);
  const list=el('ol','rs-list');
  const lead=order[0];
  const row=(c,i)=>{
    const li=el('li',c.isPlayer?'me':'');
    li.appendChild(el('span','rs-n',String(i+1)));
    const sw=el('span','rs-sw'); sw.style.background=c.color; li.appendChild(sw);
    li.appendChild(el('span','rs-name',c.name));
    li.appendChild(el('span','rs-t',!c.finished?'—':i===0?fmtTime(c.finishT*1000):'+'+(c.finishT-lead.finishT).toFixed(1)+'s'));
    list.appendChild(li);
  };
  order.slice(0,3).forEach(row);
  if(pos>3){ list.appendChild(el('li','rs-gap','⋯')); row(order[pos-1],pos-1); }
  box.appendChild(list);
  box.appendChild(el('div','rs-next','Sonraki yarış: '+TRACKS[save.trackIdx].name));
  r.appendChild(box); r.hidden=false;
}

function render(){
  const trk=tracks[race.trackIdx];
  ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(trackArt[race.trackIdx],0,0);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  let me=null;
  for(const c of race.cars){
    if(c.isPlayer){ me=c; continue; }
    drawRaceCar(trk,c);
  }
  if(me){
    const p=drawRaceCar(trk,me);
    if(p){
      const bob=Math.sin(performance.now()/180)*2.5, y=p.y-30+bob;
      ctx.fillStyle='#f2b300'; ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(p.x-9,y-10); ctx.lineTo(p.x+9,y-10); ctx.lineTo(p.x,y); ctx.closePath(); ctx.stroke(); ctx.fill();
    }
  }
  renderStrip();
}
function drawRaceCar(trk,c){
  const past=c.finished?c.s-race.total:0;        // bitişten sonra pite çekilirken sönümlen
  if(past>260) return null;
  const p=carPose(trk,c);
  if(past>100){ ctx.save(); ctx.globalAlpha=clamp(1-(past-100)/160,0,1); }
  drawCar(ctx,p.x,p.y,p.a,c.color,{scale:CAR_SCALE,isSelf:c.isPlayer,headlights:false,braking:c.braking});
  if(past>100) ctx.restore();
  return p;
}
function renderStrip(){
  const c=sctx; c.setTransform(dpr,0,0,dpr,0,0); c.clearRect(0,0,SW,SH);
  const x0=26,x1=SW-40,ym=SH/2;
  c.lineCap='round'; c.strokeStyle='rgba(236,234,222,.16)'; c.lineWidth=6;
  c.beginPath(); c.moveTo(x0,ym); c.lineTo(x1,ym); c.stroke();
  c.fillStyle='rgba(236,234,222,.35)';
  for(let k=1;k<race.laps;k++){ const x=x0+(x1-x0)*k/race.laps; c.fillRect(x-1.5,ym-11,3,22); }
  for(let r=0;r<4;r++) for(let q=0;q<2;q++){ c.fillStyle=(r+q)%2?'#151410':'#f4f2ec'; c.fillRect(x1+8+q*7,ym-14+r*7,7,7); }
  const order=standings(race);
  let me=null, mi=0;
  order.forEach((car,i)=>{
    if(car.isPlayer){ me=car; mi=i; return; }
    const x=x0+(x1-x0)*clamp(car.s/race.total,0,1);
    c.fillStyle=car.color; c.beginPath(); c.arc(x,ym+(i%2?6:-6),8,0,Math.PI*2); c.fill();
  });
  if(me){
    const x=x0+(x1-x0)*clamp(me.s/race.total,0,1), y=ym+(mi%2?6:-6);
    c.fillStyle=me.color; c.beginPath(); c.arc(x,y,11,0,Math.PI*2); c.fill();
    c.strokeStyle='#f2b300'; c.lineWidth=3.5; c.stroke();
  }
}
function updateRaceHud(){
  const order=standings(race), me=order.findIndex(c=>c.isPlayer)+1, car=order[me-1];
  setText(E.pos,'P'+me+'/'+order.length);
  if(race.state==='running'&&prevPos&&me!==prevPos){
    E.pos.classList.remove('up','down'); void E.pos.offsetWidth; E.pos.classList.add(me<prevPos?'up':'down');
  }
  prevPos=me;
  setText(E.timer,mmss(Math.max(0,race.t)*1000));
  const lap=clamp(Math.floor(Math.max(0,car.s)/race.track.len)+1,1,race.laps);
  setText(E.lap,car.finished?'Bitirdi 🏁':'Tur '+lap+'/'+race.laps);
  if(race.t<0){
    const k=Math.ceil(-race.t);
    E.cd.hidden=false;
    if(k!==lastCd){ lastCd=k; E.cdNum.textContent=k; E.cdNum.style.animation='none'; void E.cdNum.offsetWidth; E.cdNum.style.animation=''; sfx.countdown(); }
  } else if(lastCd){ lastCd=0; E.cd.hidden=true; sfx.go(); }
  else E.cd.hidden=true;
}

/* ── ekonomi paneli ────────────────────── */
function updateEconomy(){
  const now=Date.now();
  setText(E.cash,fmtMoney(save.cash));
  setText(E.income,fmtMoney(incomePerSec(save)*boostMult(),true));
  E.income.classList.toggle('boosted',boostOn());
  setText(E.gems,fmtNum(save.gems));
  setText(E.fans,fmtNum(save.fans));
  setText(E.team,save.team);
  E.avatar.style.color=save.color;
  if(now<save.boostUntil){ E.boost.className='mg-boost on'; E.boost.disabled=true; setText(E.boost,'⚡ 2x · '+mmss(save.boostUntil-now)); }
  else if(now<save.boostReadyAt){ E.boost.className='mg-boost cd'; E.boost.disabled=true; setText(E.boost,'⏳ '+mmss(save.boostReadyAt-now)); }
  else { E.boost.className='mg-boost'; E.boost.disabled=false; setText(E.boost,'2x Kazanç'); }
  setText(E.classShort,CLASSES[save.classIdx].short);
  const next=CLASSES[save.unlocked];
  E.classBadge.hidden=!(next&&save.gems>=next.gems);
  updateSkills();
}
function activateBoost(){
  const now=Date.now();
  if(now<save.boostReadyAt) return;
  save.boostUntil=now+BOOST_MS; save.boostReadyAt=save.boostUntil+BOOST_CD_MS;
  sfx.nitro(); toast('⚡ <b>60 saniye</b> boyunca gelir ve yarış ödülleri 2 katı!');
  updateEconomy(); store();
}

/* ── sınıflar ──────────────────────────── */
function renderClasses(){
  const list=$('mgClassList'); list.innerHTML='';
  CLASSES.forEach((cls,i)=>{
    const unlocked=i<save.unlocked, cur=i===save.classIdx, isNext=i===save.unlocked;
    const row=el('div','cl'+(cur?' cur':'')+(unlocked?'':' locked'));
    row.appendChild(el('div','cl-ic',cls.icon));
    const t=el('div','cl-t');
    t.appendChild(el('div','cl-name',cls.name));
    t.appendChild(el('div','cl-meta','Rakip gücü ×'+cls.mult.toFixed(2)+' · Ödül ×'+cls.prize+' · Gelir ×'+cls.income));
    row.appendChild(t);
    const b=el('button','cl-btn'); b.type='button';
    if(cur){ b.textContent='Seçili'; b.disabled=true; }
    else if(unlocked){ b.textContent='Seç'; b.addEventListener('click',()=>{ save.classIdx=i; store(); renderClasses(); updateEconomy(); toast(`<b>${cls.name}</b> seçildi — sonraki yarıştan itibaren geçerli.`); }); }
    else if(isNext){
      b.textContent='💎 '+cls.gems; b.disabled=save.gems<cls.gems; b.classList.add('buy');
      b.addEventListener('click',()=>{
        if(save.gems<cls.gems) return;
        save.gems-=cls.gems; save.unlocked=i+1; save.classIdx=i;
        store(); sfx.fanfare(); renderClasses(); updateEconomy();
        toast(`🏆 <b>${cls.name}</b> açıldı! Sonraki yarıştan itibaren buradasın.`,3400);
      });
    }
    else { b.textContent='🔒'; b.disabled=true; }
    row.appendChild(b); list.appendChild(row);
  });
}

/* ── takım ayarları ────────────────────── */
function renderTeam(){
  $('mgTeamInput').value=save.team;
  const pick=$('mgColorPick'); pick.innerHTML='';
  TEAM_COLORS.forEach(col=>{
    const b=el('button','swatch'+(col===save.color?' picked':'')); b.type='button';
    b.style.background=col; b.setAttribute('aria-label','Takım rengi '+col);
    b.addEventListener('click',()=>{
      save.color=col;
      const me=race&&race.cars.find(c=>c.isPlayer); if(me) me.color=col;
      store(); renderTeam(); updateEconomy();
    });
    pick.appendChild(b);
  });
  setText($('mgStats'),`${save.races} yarış · ${save.wins} galibiyet · ${save.podiums} podyum`);
}
function openModal(id){ $(id).hidden=false; }
function closeModals(){ document.querySelectorAll('.mg-modal').forEach(m=>{ m.hidden=true; }); }

/* ── ana döngü ─────────────────────────── */
function frame(t){
  if(!running) return;
  const rdt=lastT?Math.min((t-lastT)/1000,0.25):0; lastT=t;
  save.cash+=incomePerSec(save)*boostMult()*rdt;
  if(race.state!=='done'){
    let d=Math.min(rdt,0.1);
    while(d>1e-6&&race.state!=='done'){ const h=Math.min(d,1/60); stepRace(race,h); d-=h; }
    if(race.state==='done') finishRace();
  } else if(t>=resultUntil) newRace();
  render(); updateRaceHud();
  if(t-lastUi>200){ lastUi=t; updateEconomy(); }
  if(t-lastSave>SAVE_EVERY) store();
  rafId=requestAnimationFrame(frame);
}
function grantAway(sec,label){
  const amt=incomePerSec(save)*Math.min(sec,OFFLINE_CAP_S)*OFFLINE_RATE;
  if(amt<1) return;
  save.cash+=amt;
  toast(`💤 ${label} <b>${fmtMoney(amt)}</b> sponsor geliri birikti`,3800);
}

let skillsBuilt=false;
export function openManager(driver,opts){
  onClose=(opts&&opts.onClose)||null;
  const fresh=!save;
  save=save||loadSave()||defaultSave(driver);
  if(!skillsBuilt){ buildSkills(); skillsBuilt=true; }
  if(fresh){
    const away=(Date.now()-(save.lastSeen||Date.now()))/1000;
    if(away>60&&save.races>0) setTimeout(()=>grantAway(away,'Sen yokken'),500);
  }
  E.mute.textContent=audio.muted?'🔇':'🔊';
  if(!race) newRace();
  updateEconomy();
  crossFade(menuEl,root);
  running=true; lastT=0; cancelAnimationFrame(rafId); rafId=requestAnimationFrame(frame);
  store();
}
function closeManager(){
  running=false; cancelAnimationFrame(rafId); closeModals(); store();
  crossFade(root,menuEl);
  if(onClose) onClose();
}
export function managerSummary(){
  const s=save||loadSave();
  if(!s) return null;
  return {team:s.team,cls:CLASSES[s.classIdx].name,cash:fmtMoney(s.cash),gems:s.gems,races:s.races};
}

/* ── olaylar ───────────────────────────── */
$('mgBack').addEventListener('click',closeManager);
E.boost.addEventListener('click',activateBoost);
E.mute.addEventListener('click',()=>{ audio.muted=!audio.muted; E.mute.textContent=audio.muted?'🔇':'🔊'; });
$('mgClassesBtn').addEventListener('click',()=>{ renderClasses(); openModal('mgClassModal'); });
E.avatar.addEventListener('click',()=>{ renderTeam(); openModal('mgTeamModal'); });
document.querySelectorAll('.mg-modal').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m||e.target.closest('[data-close]')) closeModals(); });
});
window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModals(); });
$('mgTeamInput').addEventListener('input',e=>{
  const v=e.target.value.trim().slice(0,20);
  if(!v) return;
  save.team=v;
  const me=race&&race.cars.find(c=>c.isPlayer); if(me) me.name=v;
  setText(E.team,v);
});
$('mgTeamInput').addEventListener('change',()=>{ $('mgTeamInput').value=save.team; store(); });
$('mgReset').addEventListener('click',()=>{
  if(!confirm('Tüm menajer ilerlemen (para, yetenekler, sınıflar) silinsin mi?')) return;
  const driver=save.driver;
  wipeSave(); save=defaultSave(driver); closeModals(); newRace(); updateEconomy(); store();
  toast('İlerleme sıfırlandı. Yeni sezon başlıyor!');
});
document.addEventListener('visibilitychange',()=>{
  if(!running||!save) return;
  if(document.hidden){ hiddenAt=Date.now(); store(); return; }
  const away=hiddenAt?(Date.now()-hiddenAt)/1000:0;
  hiddenAt=0; lastT=0;
  if(away>30) grantAway(away,'Arka plandayken');
});
window.addEventListener('pagehide',()=>{ if(save) store(); });
