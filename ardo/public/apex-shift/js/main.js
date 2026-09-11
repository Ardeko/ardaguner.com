/* Apex Shift — giriş noktası: menüdeki mod seçimi ve iki modun başlatılması. */
import {$,sanitName,initAudio} from './common.js';
import './online.js';
import {openManager,managerSummary} from './manager/ui.js';

const PREF_KEY='apexShift.prefs';
function readPrefs(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY))||{}; }catch(e){ return {}; } }
function writePrefs(){ try{ localStorage.setItem(PREF_KEY,JSON.stringify(prefs)); }catch(e){} }
const prefs=readPrefs();

const SUBS={
  online:'İsmini ve oda kodunu gir, lobiye düş. Odadaki herkes hazır olunca yarış aynı anda başlar.',
  manager:'Kendi takımını kur. Yarışlar kendiliğinden döner; sen ödül ve taraftar topla, pilotunu geliştir, Karting’den Formula 1’e yüksel.',
};
const tabs=[...document.querySelectorAll('.mode-tab')];
const nameInput=$('nameInput');

function setMode(m){
  tabs.forEach(t=>{ const on=t.dataset.mode===m; t.classList.toggle('on',on); t.setAttribute('aria-selected',String(on)); });
  $('onlinePane').hidden=m!=='online';
  $('managerPane').hidden=m!=='manager';
  $('modeSub').textContent=SUBS[m];
  prefs.mode=m; writePrefs();
  if(m==='manager') refreshSummary();
}
function refreshSummary(){
  const s=managerSummary(), box=$('mgSummary'), btn=$('mgStartBtn');
  if(!s){ box.hidden=true; btn.textContent='Kariyere Başla'; return; }
  box.innerHTML='';
  const b=document.createElement('b'); b.textContent=s.team; box.appendChild(b);
  box.appendChild(document.createTextNode(` · ${s.cls} · 💵 ${s.cash} · 💎 ${s.gems}`));
  box.hidden=false; btn.textContent='Kariyere Devam Et';
}

tabs.forEach(t=>t.addEventListener('click',()=>{
  // giriş animasyonunun gecikmeli sırası sadece ilk açılışta; sekme değişince hemen görünsün
  $('onlinePane').classList.add('swap'); $('managerPane').classList.add('swap');
  setMode(t.dataset.mode);
}));
if(prefs.name) nameInput.value=prefs.name;
nameInput.addEventListener('change',()=>{ prefs.name=nameInput.value.trim(); writePrefs(); });
$('mgStartBtn').addEventListener('click',()=>{
  initAudio();
  prefs.name=nameInput.value.trim(); writePrefs();
  openManager(sanitName(nameInput.value),{onClose:refreshSummary});
});

setMode(/manager|menajer/i.test(location.hash)?'manager':(prefs.mode==='manager'?'manager':'online'));
