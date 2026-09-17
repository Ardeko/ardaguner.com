/* Menajer modu: yetenekler, sınıflar, ekonomi formülleri ve kayıt (localStorage). */
import {ALL_LIVERY_HEXES,COLORS,liveryOf} from '../common.js';

export const SKILLS=[
  {id:'engine',  name:'Motor Gücü',        icon:'⚙️', per:1,   base:25, desc:'Düzlüklerde ulaşılan azami hızı artırır.'},
  {id:'throttle',name:'Gaz Kontrolü',      icon:'📈', per:2,   base:25, desc:'Hızlanmayı artırır; virajlardan daha güçlü çıkarsın.'},
  {id:'corner',  name:'Viraj Mekaniği',    icon:'↪️', per:2,   base:40, desc:'Yol tutuşunu artırır; virajlara daha hızlı girersin.'},
  {id:'launch',  name:'Kalkış Kontrolü',   icon:'🚦', per:6,   base:20, desc:'Starttan sonraki ilk saniyelerde ekstra ivme.'},
  {id:'overtake',name:'Sollama Tekniği',   icon:'🎯', per:2,   base:30, desc:'Öndeki aracın arkasına takıldığında onu geçme şansını artırır.'},
  {id:'attack',  name:'Atak Hamleleri',    icon:'⚡', per:0.8, base:50, desc:'Rakibin hemen arkasındayken (vakum etkisi) ekstra hız kazanırsın.'},
  {id:'defense', name:'Savunma Pozisyonu', icon:'🛡️', per:2,   base:35, desc:'Arkadan gelen rakiplerin seni geçmesini zorlaştırır.'},
  {id:'sponsor', name:'Sponsorluk',        icon:'💼', per:10,  base:60, desc:'Saniye başına gelen sponsor gelirini artırır.'},
];
export const MAX_LEVEL=100;
const COST_GROWTH=1.16;

/* mult: rakip gücü · prize/income/fans: ödül, gelir ve taraftar çarpanları · gems: kilit bedeli */
export const CLASSES=[
  {id:'kart',name:'Karting',  short:'KART',icon:'🛞',mult:1.00,prize:1,  income:1, fans:1, laps:2,gems:0},
  {id:'f4',  name:'Formula 4',short:'F4',  icon:'🏎️',mult:1.10,prize:4,  income:3, fans:2, laps:2,gems:8},
  {id:'f3',  name:'Formula 3',short:'F3',  icon:'🏎️',mult:1.20,prize:15, income:9, fans:4, laps:3,gems:25},
  {id:'f2',  name:'Formula 2',short:'F2',  icon:'🏎️',mult:1.30,prize:60, income:27,fans:8, laps:3,gems:60},
  {id:'f1',  name:'Formula 1',short:'F1',  icon:'🏆',mult:1.42,prize:250,income:81,fans:16,laps:3,gems:150},
];

export const AI_TEAMS=['Asfalt Kurtları','Turbo Tilkiler','Viraj Ustaları','Kara Şimşek','Pist Canavarları','Nitro Kings',
  'Smashers','Blue Comets','Demir Atlar','Apex Avcıları','Gece Kuşları','Kum Fırtınası','Pole Pozisyon','Zirve Racing',
  'Kıvılcım GP','Rüzgar Takımı','Red Rockets','Hız Sultanları'];
export const TEAM_COLORS=COLORS;
export const AI_COLORS=ALL_LIVERY_HEXES;

const PRIZE=[1,.72,.54,.42,.33,.26,.2,.15,.11,.08];
const PRIZE_BASE=150;
export const BOOST_MS=60000, BOOST_CD_MS=180000;
export const OFFLINE_CAP_S=4*3600, OFFLINE_RATE=0.5;

export const skillCost=(sk,lvl)=>Math.ceil(sk.base*Math.pow(COST_GROWTH,lvl));
export const skillBonus=(sk,lvl)=>sk.per*lvl/100;
export const skillMaxed=(sk,lvl)=>lvl>=MAX_LEVEL;

export function incomePerSec(save){
  const sp=SKILLS.find(s=>s.id==='sponsor');
  return (1+save.fans*0.004)*(1+skillBonus(sp,save.skills.sponsor||0))*CLASSES[save.classIdx].income;
}
export const prizeFor=(pos,cls)=>Math.round(PRIZE_BASE*(PRIZE[pos-1]||0)*cls.prize);
export const fansFor=(pos,cls)=>Math.round(Math.pow(Math.max(0,11-pos),1.5)*2*cls.fans);
export const gemsFor=pos=>pos===1?3:pos===2?2:pos===3?1:0;

/* ── kayıt ─────────────────────────────── */
const SAVE_KEY='apexShift.manager.v1';
export function defaultSave(driver){
  const d=driver||'Sürücü';
  return {v:1,driver:d,team:(d+' Racing').slice(0,20),color:TEAM_COLORS[0],cash:0,gems:0,fans:0,
    classIdx:0,unlocked:1,skills:{},races:0,wins:0,podiums:0,trackIdx:0,boostUntil:0,boostReadyAt:0,lastSeen:Date.now()};
}
export function loadSave(){
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(!raw||raw.v!==1) return null;
    const s=Object.assign(defaultSave(raw.driver),raw);
    ['cash','gems','fans','races','wins','podiums','trackIdx','boostUntil','boostReadyAt','lastSeen'].forEach(k=>{ if(!isFinite(s[k])||s[k]<0) s[k]=0; });
    s.unlocked=Math.min(CLASSES.length,Math.max(1,s.unlocked|0));
    s.classIdx=Math.min(s.unlocked-1,Math.max(0,s.classIdx|0));
    if(!s.skills||typeof s.skills!=='object') s.skills={};
    SKILLS.forEach(sk=>{ s.skills[sk.id]=Math.min(MAX_LEVEL,Math.max(0,s.skills[sk.id]|0)); });
    s.team=String(s.team||'').slice(0,20)||defaultSave(s.driver).team;
    s.color=liveryOf(s.color).hex;
    return s;
  }catch(e){ return null; }
}
export function persist(save){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(save)); }catch(e){} }
export function wipeSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }

/* ── biçimlendirme: 1.55K, 219M ────────── */
const UNITS=['','K','M','B','T','Qa','Qi'];
export function fmtNum(n){
  n=Math.max(0,n||0);
  if(n<1000) return String(Math.floor(n));
  let u=0; while(n>=1000&&u<UNITS.length-1){ n/=1000; u++; }
  let s=n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2);
  if(s.includes('.')) s=s.replace(/\.?0+$/,'');
  return s+UNITS[u];
}
export function fmtMoney(n,fine){
  if(fine&&n<100) return '$'+(Math.round(n*10)/10);
  return '$'+fmtNum(n);
}
