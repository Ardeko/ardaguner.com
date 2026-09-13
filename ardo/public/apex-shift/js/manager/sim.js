/* Menajer modunun yarış simülasyonu. Arabalar pist boyunca tek boyutta ilerler
   (s = start çizgisinden kat edilen mesafe); şerit (lane) yalnızca yan yana durmak ve
   sollamak için var. Öndeki araç aynı şeritteyse arkadaki onun hızına takılır ve
   yarım saniyede bir sollama zarı atar: Sollama Tekniği ile rakibin Savunması yarışır. */
import {clamp,shuffle} from '../common.js';
import {sampleAt,limitAt,GRID_FRONT,GRID_GAP,GRID_LANE} from './track.js';

export const BASE_TOP=240, BASE_ACC=115, BRAKE=380;
export const COUNTDOWN=3, END_GRACE=9;
const LANES=[-GRID_LANE,0,GRID_LANE];
const BLOCK_GAP=24, MIN_GAP=15, LANE_TOL=11, SLIP_GAP=90, SLIP_BASE=0.025, LANE_SPEED=48, TRY_EVERY=0.5;

/* Yeni pilot çaylak başlar: Karting ortalamasının biraz altında, arka sıralarda. */
const ROOKIE=0.9;
/* b: skill id → bonus oranı (0.15 = %15) */
export function playerStats(b){
  return {top:BASE_TOP*ROOKIE*(1+b.engine), accel:BASE_ACC*ROOKIE*(1+b.throttle), grip:ROOKIE*ROOKIE*(1+b.corner),
    launch:0.1+b.launch, overtake:0.1+b.overtake, defense:0.1+b.defense, attack:b.attack, mistake:0.01};
}
/* m: sınıfın rakip gücü çarpanı. Her rakip bunun %90–106'sı arasında rastgele bir güçte. */
export function aiStats(m,rng){
  const r=m*(0.9+rng()*0.16), craft=(m-1)*0.3;
  return {top:BASE_TOP*r, accel:BASE_ACC*r, grip:r*r, launch:rng()*0.2,
    overtake:0.05+rng()*0.12+craft, defense:0.05+rng()*0.12+craft, attack:craft*rng(), mistake:0.018};
}

export function createRace({track,laps,entrants,rng}){
  const order=shuffle(entrants.slice(),rng);
  const cars=order.map((e,g)=>{
    const lane=g%2?LANES[2]:LANES[0];
    return {id:e.id,name:e.name,color:e.color,isPlayer:!!e.isPlayer,stats:e.stats,grid:g+1,
      s:-(GRID_FRONT+g*GRID_GAP),v:0,lane,laneTarget:lane,laneVel:0,tryT:0,laneT:1+rng()*2,
      stumble:0,braking:false,finished:false,finishT:0};
  });
  return {track,laps,total:laps*track.len,cars,rng,t:-COUNTDOWN,state:'countdown',leaderFinishT:null};
}

function laneFree(cars,c,L){
  for(const o of cars){
    if(o===c||o.finished) continue;
    if(Math.abs(o.s-c.s)<30&&(Math.abs(o.lane-L)<LANE_TOL||Math.abs(o.laneTarget-L)<LANE_TOL)) return false;
  }
  return true;
}
function passLane(cars,c,ahead){
  const opts=LANES.filter(L=>Math.abs(L-ahead.lane)>=LANE_TOL+3).sort((a,b)=>Math.abs(a-c.lane)-Math.abs(b-c.lane));
  for(const L of opts) if(laneFree(cars,c,L)) return L;
  return null;
}

export function stepRace(race,dt){
  race.t+=dt;
  if(race.t<0||race.state==='done') return;
  race.state='running';
  const {cars,track,rng}=race;
  const byS=cars.slice().sort((a,b)=>b.s-a.s);   // öndekiler önce hareket etsin
  for(const c of byS){
    const st=c.stats, s0=c.s;
    let ahead=null, gapA=Infinity, slip=false;
    if(!c.finished) for(const o of cars){
      if(o===c||o.finished) continue;
      const gap=o.s-c.s; if(gap<=0) continue;
      const dl=Math.abs(o.lane-c.lane);
      if(gap<SLIP_GAP&&dl<LANE_TOL*1.5) slip=true;
      if(gap<BLOCK_GAP&&dl<LANE_TOL&&gap<gapA){ ahead=o; gapA=gap; }
    }
    const top=st.top*(slip?1+SLIP_BASE+st.attack:1);
    let target=Math.min(top,limitAt(track,c.s)*Math.sqrt(st.grip*track.grip));
    if(c.finished) target=Math.min(target,st.top*0.5);
    if(c.stumble>0){ c.stumble-=dt; target*=0.62; }
    else if(!c.finished&&rng()<st.mistake*dt) c.stumble=0.4+rng()*0.6;

    let acc=st.accel*Math.max(0.3,1-c.v/(top*1.06));
    if(race.t<4) acc*=1+st.launch;
    c.braking=c.v>target+1;
    c.v=c.v<target?Math.min(target,c.v+acc*dt):Math.max(target,c.v-BRAKE*dt);

    if(ahead){
      if(c.v>=ahead.v){
        c.tryT+=dt;
        if(c.tryT>=TRY_EVERY){
          c.tryT=0;
          const edge=clamp((target-ahead.v)/80,0,0.3);
          const p=clamp(0.2+edge+st.overtake-ahead.stats.defense,0.04,0.92);
          if(rng()<p){ const L=passLane(cars,c,ahead); if(L!==null) c.laneTarget=L; }
        }
      }
      c.v=Math.min(c.v,ahead.v);     // yana açılana kadar öndekinin hızına takılı
    } else c.tryT=0;

    c.laneT-=dt;
    if(c.laneT<=0){
      c.laneT=1.2+rng()*2.2;
      if(!ahead&&c.laneTarget!==0&&laneFree(cars,c,0)) c.laneTarget=0;   // ideal çizgiye dön
    }
    const mv=clamp(c.laneTarget-c.lane,-LANE_SPEED*dt,LANE_SPEED*dt);
    c.lane+=mv; c.laneVel=mv/dt;

    if(c.finished&&c.s>race.total+320) c.v=0;   // bitişten sonra pite çekildi
    c.s+=c.v*dt;
    if(ahead) c.s=Math.max(s0,Math.min(c.s,ahead.s-MIN_GAP));
    if(!c.finished&&c.s>=race.total){
      c.finished=true;
      c.finishT=race.t-(c.s-race.total)/Math.max(c.v,1);
      if(race.leaderFinishT===null) race.leaderFinishT=race.t;
    }
  }
  if(cars.every(c=>c.finished)||(race.leaderFinishT!==null&&race.t-race.leaderFinishT>END_GRACE)) race.state='done';
}

export function standings(race){
  return race.cars.slice().sort((a,b)=>{
    if(a.finished!==b.finished) return a.finished?-1:1;
    return a.finished?a.finishT-b.finishT:b.s-a.s;
  });
}
export function carPose(track,c){
  const p=sampleAt(track,c.s);
  return {x:p.x+p.nx*c.lane, y:p.y+p.ny*c.lane, a:p.a+Math.atan2(c.laneVel,Math.max(c.v,40))};
}
