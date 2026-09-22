/* Online bot alanı.

   Botlar menajer modunun yarış simülasyonu üzerinde koşuyor (manager/sim.js):
   pist üzerinde tek boyutlu ilerleme (s) + yanal şerit (lane), viraj hız
   profilini takip etme, sollama zarı, slipstream, hata payı. Bu sayede bot
   asla pistten çıkmıyor ve trafikte mantıklı davranıyor.

   İnsanlar serbest fizikle sürüyor; her adımda (x,y) → (s,lane) izdüşümleri
   alınıp sim'in araç listesine "hayalet" olarak enjekte ediliyor, böylece
   botlar insanları da görüp onları bloklayıp sollayabiliyor.

   Otorite: botları YALNIZCA host simüle edip ağa yazıyor. Diğer istemciler
   onları uzaktaki oyuncular gibi sadece çiziyor. Host değişirse yeni host
   ağdaki son durumdan sim'i yeniden kuruyor (adoptBots).                  */
import {stepRace,carPose} from '../manager/sim.js';
import {projectToTrack,pitZone,inPitRange} from './tracks.js';
import {DMG,PIT_REPAIR_PER_S} from './vehicles.js';
import {mulberry32,STOCK_LIVERIES,COLORS} from '../common.js';
import {AI_TEAMS} from '../manager/data.js';

export const MAX_FIELD=16;

/* Zorluk 0..3 → rakip gücü. Araç sınıfının kendi statlarına oranlanıyor ki
   bot ile insan aynı arabada eşit hızda olsun.                            */
function botStats(V,level,rng){
  const r=0.86+level*0.055+rng()*0.10;
  const craft=level*0.09;
  return {
    top:V.spd*r,
    accel:V.acc*0.85*r,
    grip:r,
    launch:rng()*0.22,
    overtake:0.06+rng()*0.14+craft,
    defense:0.06+rng()*0.14+craft,
    attack:craft*rng(),
    mistake:(V.cls==='nascar'?0.016:0.012)*(1.25-level*0.12),
  };
}

/* NASCAR'da numaralı stock liveryler, normal yarışta takım isimleri. */
function botIdentity(i,cls,rng,takenColors){
  if(cls==='nascar'){
    const pool=STOCK_LIVERIES.filter(l=>!takenColors.has(l.hex));
    const liv=pool.length?pool[0]:STOCK_LIVERIES[i%STOCK_LIVERIES.length];
    takenColors.add(liv.hex);
    // havuz tükendiyse numara tekrar etmesin diye sonuna tur eki
    const dup=pool.length?'':String.fromCharCode(65+Math.floor(i/STOCK_LIVERIES.length));
    return {name:'#'+liv.num+dup,color:liv.hex};
  }
  const pool=COLORS.filter(c=>!takenColors.has(c));
  const color=pool.length?pool[0]:COLORS[i%COLORS.length];
  takenColors.add(color);
  return {name:AI_TEAMS[(i*3+1)%AI_TEAMS.length],color};
}

/* ── kaza durumu ────────────────────────────────────────────────────────
   Spin: araç ekseni etrafında dönerken hız hızla düşer, şerit kayar,
   duman çıkar. Bittiğinde araç hasarlı ama yürür halde kalır.            */
const SPIN_MS=1500, SPIN_SLOW=2.6;
/* Pit: hasar bu eşiği geçince bot pite giriyor, şeritte sürünerek onarılıyor. */
const PIT_TRIGGER=0.42, PIT_MIN_MS=2200;
/* Temas: araç kutuları (s boyunca ~26, yanal ~13) gerçekten çakışırsa.
   Komşu şeritler 16 birim ayrı olduğu için yan yana normal yarışmak temas
   saymıyor; temas ancak şerit değiştirirken ya da birileri içeri dalarken
   oluşuyor — sollama anı riskli, düz gitmek değil.                        */
const CONTACT_S=26, CONTACT_LANE=13;

export function createField(opts){
  const {T,laps,vehicle,count,level,seed,cls,takenColors,gridStart}=opts;
  const rng=mulberry32((seed>>>0)||7);
  const taken=new Set(takenColors||[]);
  const cars=[];
  for(let i=0;i<count;i++){
    const id='b'+i;
    const ident=botIdentity(i,cls,rng,taken);
    const g=gridStart+i;
    const lane=(g%2?1:-1)*Math.min(14,T.hw*0.45);
    const st=botStats(vehicle,level,rng);
    cars.push({id,name:ident.name,color:ident.color,isPlayer:false,bot:true,
      stats:Object.assign({},st),base:st,grid:g+1,
      s:-(16+g*Math.max(26,T.hw*0.85)),v:0,lane,laneTarget:lane,laneVel:0,
      tryT:0,laneT:1+rng()*2,stumble:0,braking:false,finished:false,finishT:0,
      damage:0,spin:0,spinAng:0,crashed:false,lapRaw:-1,prevS:null,
      pit:0,pitDone:0,mustPit:false});
  }
  return {T,laps,total:laps*T.len,cars,rng,t:0,state:'running',leaderFinishT:null,
    vehicle,cls,ghosts:[],cautionUntil:0};
}

/* Host değiştiğinde: ağdaki son bot durumundan sim'i yeniden kur. */
export function adoptBots(field,netBots){
  if(!field||!netBots) return;
  for(const c of field.cars){
    const nb=netBots[c.id];
    if(!nb) continue;
    c.s=Number(nb.s)||c.s; c.v=Number(nb.v)||0; c.lane=Number(nb.lane)||0;
    c.laneTarget=c.lane; c.damage=Number(nb.dmg)||0;
    c.finished=!!nb.fin; c.lapRaw=Number(nb.lap); if(!isFinite(c.lapRaw)) c.lapRaw=-1;
    c.crashed=false; c.spin=0; c.pit=0; c.mustPit=(c.damage||0)>=PIT_TRIGGER;
  }
}

/* Hasarı statlara yansıt. Oyuncuyla aynı tablo (vehicles.js DMG) kullanılıyor;
   aksi hâlde kaza sadece insanı yavaşlatan tek taraflı bir ceza olurdu.     */
function applyBotDamage(c){
  const d=Math.max(0,Math.min(1,c.damage||0)), b=c.base;
  c.stats.top=b.top*(1-DMG.spd*d);
  c.stats.accel=b.accel*(1-DMG.acc*d);
  c.stats.grip=b.grip*(1-DMG.grip*d);
}

/* İnsan arabalarını sim'in göreceği hayaletlere çevir. */
function syncGhosts(field,humans){
  const {T}=field;
  const list=[];
  for(const h of humans){
    const pr=projectToTrack(T,h.x,h.y);
    if(!pr) continue;
    list.push({id:h.id,name:h.name,color:h.color,isPlayer:true,ghost:true,
      stats:{top:9999,accel:0,grip:1,launch:0,overtake:0,defense:0.35,attack:0,mistake:0},
      s:(h.lapRaw||0)*T.len+pr.s, v:Math.abs(h.speed||0), lane:pr.lane, laneTarget:pr.lane,
      laneVel:0,tryT:0,laneT:99,stumble:0,braking:false,finished:!!h.finished,finishT:0});
  }
  field.ghosts=list;
}

export function triggerCrash(field,car,severity){
  if(!car||car.finished||car.crashed) return false;
  car.crashed=true;
  car.mustPit=true;        // kaza yapan bot onarım için pite girmek zorunda
  car.spin=SPIN_MS*(0.6+severity*0.7);
  car.spinAng=0;
  car.spinDir=field.rng()<0.5?-1:1;
  car.damage=Math.min(1,(car.damage||0)+0.25+severity*0.45);
  return true;
}

/* Temas kazaları: botlar birbirine ve insanlara çarpınca da kaza yapıyor.
   Önceden kaza yalnız rastgele "hata" zarından çıkıyordu; bu yüzden oyuncu
   bir bota daldığında bota hiçbir şey olmuyordu.                          */
function contactCrashes(field,dt,onEvent){
  const all=field.cars.concat(field.ghosts);
  const nascar=field.cls==='nascar';
  for(const a of field.cars){
    if(a.finished||a.crashed||a.pit>0) continue;
    for(const b of all){
      if(b===a||b.finished) continue;
      const ds=b.s-a.s, dl=b.lane-a.lane;
      if(Math.abs(ds)>CONTACT_S||Math.abs(dl)>CONTACT_LANE) continue;
      const rel=Math.abs((a.v||0)-(b.v||0));
      const overlap=1-Math.abs(dl)/CONTACT_LANE;
      // sürtünme: temas eden her araç biraz hasar alıyor
      a.damage=Math.min(1,(a.damage||0)+(0.03+rel*0.0006)*overlap*dt);
      // kaza zarı: hız farkı ve iç içelik arttıkça
      const p=(0.05+rel*0.0045)*overlap*(nascar?1.7:0.7);
      if(field.rng()<p*dt){
        if(triggerCrash(field,a,0.35+Math.min(0.65,rel/150))){
          const caught=nascar?chainCrash(field,a):0;
          onEvent&&onEvent({type:'crash',car:a,caught,contact:true});
        }
        break;
      }
    }
  }
}

/* Zincirleme kaza: kazanın yakınındaki araçlar da toplanır — "The Big One". */
function chainCrash(field,origin){
  const R=170;
  let caught=0;
  for(const c of field.cars){
    if(c===origin||c.crashed||c.finished) continue;
    const gap=c.s-origin.s;
    if(gap>0||gap<-R) continue;                       // sadece arkadakiler
    const laneNear=Math.abs(c.lane-origin.lane)<field.T.hw*0.8;
    const p=(laneNear?0.65:0.22)*(1+gap/R);
    if(field.rng()<p){ triggerCrash(field,c,0.5+field.rng()*0.5); caught++; }
  }
  return caught;
}

/* Bir adım. events dizisine kaza/duman olaylarını yazıp döndürür. */
export function stepField(field,dt,humans,onEvent){
  if(!field) return;
  syncGhosts(field,humans||[]);

  const T=field.T, pz=pitZone(T);
  for(const c of field.cars) applyBotDamage(c);

  // pit kararı: kaza yapan ya da yeterince hasarlı bot şeride sapıyor
  if(pz) for(const c of field.cars){
    if(c.crashed||c.finished||c.pit>0) continue;
    if(!c.mustPit&&(c.damage||0)<PIT_TRIGGER) continue;
    const sIn=((c.s%T.len)+T.len)%T.len;
    if(!inPitRange(T,sIn)) continue;
    c.pit=PIT_MIN_MS; c.pitDone=0;
  }
  // pit yolu olmayan pistlerde hasar kendiliğinden yavaşça kapanıyor
  if(!pz) for(const c of field.cars){
    if(c.damage>0) c.damage=Math.max(0,c.damage-0.02*dt);
  }

  // kaza/pit hâlindeki araçların durumunu sim'den koru
  const frozen=field.cars.filter(c=>c.crashed||c.pit>0).map(c=>({c,s:c.s,v:c.v,lane:c.lane}));

  const race={track:field.T.trk,laps:field.laps,total:field.total,
    cars:field.cars.concat(field.ghosts),rng:field.rng,t:field.t,state:'running',
    leaderFinishT:field.leaderFinishT};
  stepRace(race,dt);
  field.t=race.t; field.leaderFinishT=race.leaderFinishT;

  // kazalıları geri al ve kendi fiziğiyle ilerlet
  for(const f of frozen){
    const c=f.c;
    c.s=f.s; c.lane=f.lane; c.v=f.v;
    if(!c.crashed&&c.pit>0){ stepPit(field,c,dt,pz); continue; }
    c.spin-=dt*1000;
    c.spinAng+=c.spinDir*dt*7.5*(c.v/120+0.35);
    c.v=Math.max(0,c.v-SPIN_SLOW*180*dt);
    c.lane+=c.spinDir*dt*26;                       // savrulma
    const lim=field.T.hw+26;
    if(c.lane>lim){ c.lane=lim; c.v*=0.82; }
    if(c.lane<-lim){ c.lane=-lim; c.v*=0.82; }
    c.s+=c.v*dt;
    c.braking=true;
    if(c.spin<=0){ c.crashed=false; c.spin=0; c.laneTarget=Math.max(-field.T.hw*.5,Math.min(field.T.hw*.5,c.lane)); }
  }

  contactCrashes(field,dt,onEvent);

  // yeni kaza zarları: sıkışık trafikte ve NASCAR'da daha sık
  const nascar=field.cls==='nascar';
  for(const c of field.cars){
    if(c.crashed||c.finished) continue;
    let near=0;
    for(const o of field.cars.concat(field.ghosts)){
      if(o===c) continue;
      const gap=Math.abs(o.s-c.s);
      if(gap<90&&Math.abs(o.lane-c.lane)<field.T.hw*0.7) near++;
    }
    const base=(nascar?0.0055:0.0022)*(1+near*0.75);
    if(c.stumble>0&&field.rng()<base*dt*60*0.35){
      if(triggerCrash(field,c,0.35+field.rng()*0.4)){
        const caught=nascar?chainCrash(field,c):0;
        onEvent&&onEvent({type:'crash',car:c,caught});
      }
    }
  }

  // tur sayımı: s toplam mesafeye göre
  for(const c of field.cars){
    const lap=Math.floor(c.s/field.T.len);
    if(lap!==c.lapRaw&&lap>=0){ c.lapRaw=lap; }
    if(!c.finished&&c.s>=field.total){
      c.finished=true; c.finishT=field.t;
      onEvent&&onEvent({type:'finish',car:c});
    }
  }
}

/* Pit şeridinde sürünerek onarım. Trafiği kapatmasın diye şeritte ilerlemeye
   devam ediyor; çıkışta hasarsız ama kaybettiği süreyle geri dönüyor.      */
function stepPit(field,c,dt,pz){
  c.pit-=dt*1000;
  const target=pz.lane;
  c.lane+=Math.max(-90*dt,Math.min(90*dt,target-c.lane));
  c.laneTarget=target;
  const want=pz.speed;
  c.v=c.v>want?Math.max(want,c.v-420*dt):Math.min(want,c.v+220*dt);
  c.s+=c.v*dt;
  c.braking=c.v>want*1.1;
  if(Math.abs(c.lane-target)<10) c.damage=Math.max(0,c.damage-PIT_REPAIR_PER_S*dt);
  if(c.pit<=0&&c.damage<=0.01){
    c.pit=0; c.damage=0; c.pitDone=1; c.mustPit=false;
    c.laneTarget=Math.max(-field.T.hw*.5,Math.min(field.T.hw*.5,0));
  } else if(c.pit<=0){ c.pit=400; }   // onarım bitmediyse biraz daha kal
}

/* Çizim/ağ için poz. Kazadaki araç ekstra spin açısıyla dönüyor. */
export function botPose(field,c){
  const p=carPose(field.T.trk,c);
  return {x:p.x,y:p.y,a:p.a+(c.spinAng||0)};
}

/* Ağa yazılacak sıkıştırılmış hal. */
export function serializeBots(field){
  const out={};
  for(const c of field.cars){
    const p=botPose(field,c);
    out[c.id]={n:c.name,c:c.color,
      x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,a:Math.round(p.a*1000)/1000,
      v:Math.round(c.v),s:Math.round(c.s),lane:Math.round(c.lane*10)/10,
      lap:Math.max(0,c.lapRaw),
      fin:c.finished?1:0,ft:Math.round(c.finishT*1000),
      dmg:Math.round((c.damage||0)*100)/100,cr:c.crashed?1:0,pt:c.pit>0?1:0};
  }
  return out;
}

/* Boş grid yerlerini dolduracak bot sayısı. */
export function fillCount(humanCount,fieldSize){
  return Math.max(0,Math.min(MAX_FIELD,fieldSize)-humanCount);
}
