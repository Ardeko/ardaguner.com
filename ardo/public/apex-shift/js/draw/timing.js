/* Zamana karşı antrenman: üç sektör, en iyi tura göre canlı fark ve en iyi
   turun hayaleti. Pist + araç başına cihazda saklanıyor; anahtar pistin
   geometrisinden geldiği için aynı pisti çizen iki kişi aynı rekora koşar.

   Hayalet örnekleri [t, x, y, açı, s]: t turun başından ms, s turdaki yay
   uzunluğu. Canlı fark "aynı noktada hayalet kaç ms öndeydi" sorusu: o
   yüzden zamana değil s'ye göre aranıyor.                                 */
const LS_PREFIX='apexShift.tt.', LS_INDEX='apexShift.ttIndex';
const SAMPLE_MS=70, MAX_KEEP=24, MAX_SAMPLES=4000;

function load(id){
  try{
    const v=JSON.parse(localStorage.getItem(LS_PREFIX+id));
    if(!v||!isFinite(v.best)||v.best<=0) return null;
    return v;
  }catch(e){ return null; }
}
function store(id,data){
  try{
    localStorage.setItem(LS_PREFIX+id,JSON.stringify(data));
    let idx=JSON.parse(localStorage.getItem(LS_INDEX)||'[]');
    if(!Array.isArray(idx)) idx=[];
    idx=[id].concat(idx.filter(k=>k!==id));
    // en eski kayıtları sil: hayaletler birkaç on KB, depo dolmasın
    for(const old of idx.slice(MAX_KEEP)) localStorage.removeItem(LS_PREFIX+old);
    localStorage.setItem(LS_INDEX,JSON.stringify(idx.slice(0,MAX_KEEP)));
  }catch(e){}
}

/* İkili arama: arr içinde f(arr[i]) <= v olan son indeks. */
function lastLE(arr,v,f){
  let lo=0,hi=arr.length-1,ans=-1;
  while(lo<=hi){ const m=(lo+hi)>>1; if(f(arr[m])<=v){ ans=m; lo=m+1; } else hi=m-1; }
  return ans;
}

export function createTiming(trackKey,vehId,len){
  const id=trackKey+'.'+vehId;
  const saved=load(id);
  const tm={
    id, len,
    best:saved?saved.best:null,
    bestSec:saved&&Array.isArray(saved.sec)?saved.sec.slice(0,3):[null,null,null],
    ghost:saved&&Array.isArray(saved.ghost)&&saved.ghost.length>4?saved.ghost:null,
    lapStart:null, rec:[], lastRec:0,
    sec:0, secStart:null, cur:[null,null,null], status:['','',''],
    lastLap:null, lastWasBest:false, laps:0, flashUntil:0,
  };

  /* Çizgi geçişi: önceki tur kapanır, yenisi başlar. */
  tm.lap=function(now){
    if(tm.lapStart!==null){
      closeSector(now,2);
      const t=now-tm.lapStart;
      tm.lastLap=t; tm.laps++;
      tm.lastWasBest=false;
      const complete=tm.cur.every(x=>x!==null);
      if(complete&&(tm.best===null||t<tm.best)){
        tm.best=t; tm.lastWasBest=true; tm.flashUntil=now+2600;
        tm.ghost=tm.rec.length>4?tm.rec:tm.ghost;
      }
      for(let k=0;k<3;k++) if(tm.cur[k]!==null&&(tm.bestSec[k]===null||tm.cur[k]<tm.bestSec[k])) tm.bestSec[k]=tm.cur[k];
      if(complete) store(id,{best:tm.best,sec:tm.bestSec,ghost:tm.ghost,at:Date.now()});
    }
    tm.lapStart=now; tm.secStart=now; tm.sec=0;
    tm.cur=[null,null,null]; tm.status=['','',''];
    tm.rec=[]; tm.lastRec=0;
  };
  function closeSector(now,k){
    if(tm.secStart===null||tm.cur[k]!==null) return;
    const t=now-tm.secStart;
    tm.cur[k]=t;
    const b=tm.bestSec[k];
    tm.status[k]=b===null||t<b?'pb':'slow';
    tm.secStart=now; tm.sec=k+1;
  }
  /* Her kare: hayalet örneği ve sektör geçişi. s turdaki yay uzunluğu. */
  tm.tick=function(now,x,y,a,s){
    if(tm.lapStart===null) return;
    const t=now-tm.lapStart;
    if(t-tm.lastRec>=SAMPLE_MS&&tm.rec.length<MAX_SAMPLES){
      tm.rec.push([Math.round(t),Math.round(x*10)/10,Math.round(y*10)/10,Math.round(a*100)/100,Math.round(s)]);
      tm.lastRec=t;
    }
    // ileri doğru ilk iki sektör sınırı; geri gidip tekrar geçmek sayılmıyor
    while(tm.sec<2&&s>=tm.len*(tm.sec+1)/3&&s<tm.len*0.98) closeSector(now,tm.sec);
  };
  /* Aynı noktada hayalet ne kadar öndeydi (ms, + yavaş). */
  tm.delta=function(now,s){
    if(!tm.ghost||tm.lapStart===null) return null;
    const i=lastLE(tm.ghost,s,g=>g[4]);
    if(i<0) return null;
    const a=tm.ghost[i], b=tm.ghost[Math.min(i+1,tm.ghost.length-1)];
    const f=b[4]>a[4]?(s-a[4])/(b[4]-a[4]):0;
    const gt=a[0]+(b[0]-a[0])*Math.max(0,Math.min(1,f));
    return (now-tm.lapStart)-gt;
  };
  /* Hayaletin şu anki konumu (turun başından geçen süreye göre). */
  tm.ghostPose=function(now){
    if(!tm.ghost||tm.lapStart===null) return null;
    const t=now-tm.lapStart;
    const g=tm.ghost, i=lastLE(g,t,q=>q[0]);
    if(i<0||i>=g.length-1) return null;
    const a=g[i], b=g[i+1], f=(t-a[0])/((b[0]-a[0])||1);
    let da=b[3]-a[3]; while(da>Math.PI) da-=Math.PI*2; while(da<-Math.PI) da+=Math.PI*2;
    return {x:a[1]+(b[1]-a[1])*f, y:a[2]+(b[2]-a[2])*f, a:a[3]+da*f};
  };
  return tm;
}
