/* Apex Shift — giriş noktası: menüdeki mod seçimi ve üç modun başlatılması. */
import {$,sanitName,initAudio} from './common.js';
import {startSolo,startOnlineWith} from './online.js';
import {openManager,managerSummary} from './manager/ui.js';
import {openEditor,closeEditor,renderSavedList,editorToast} from './draw/editor.js';
import {decodeSpec} from './draw/geometry.js';

const PREF_KEY='apexShift.prefs';
function readPrefs(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY))||{}; }catch(e){ return {}; } }
function writePrefs(){ try{ localStorage.setItem(PREF_KEY,JSON.stringify(prefs)); }catch(e){} }
const prefs=readPrefs();

const SUBS={
  online:'İsmini ve oda kodunu gir, lobiye düş. Odadaki herkes hazır olunca yarış aynı anda başlar.',
  draw:'Kendi pistini çiz: kapalı bir tur çiz, saniyeler içinde üzerinde yarış. Nasıl çizersen öyle yarışırsın.',
  manager:'Kendi takımını kur. Yarışlar kendiliğinden döner; sen ödül ve taraftar topla, pilotunu geliştir, Karting’den Formula 1’e yüksel.',
};
const PANES={online:'onlinePane',draw:'drawPane',manager:'managerPane'};
const tabs=[...document.querySelectorAll('.mode-tab')];
const nameInput=$('nameInput');
const menuEl=$('menu');

function setMode(m){
  if(!PANES[m]) m='online';
  tabs.forEach(t=>{ const on=t.dataset.mode===m; t.classList.toggle('on',on); t.setAttribute('aria-selected',String(on)); });
  for(const k in PANES) $(PANES[k]).hidden=k!==m;
  $('modeSub').textContent=SUBS[m];
  prefs.mode=m; writePrefs();
  if(m==='manager') refreshSummary();
  if(m==='draw') refreshMenuSaved();
}
function refreshSummary(){
  const s=managerSummary(), box=$('mgSummary'), btn=$('mgStartBtn');
  if(!s){ box.hidden=true; btn.textContent='Kariyere Başla'; return; }
  box.innerHTML='';
  const b=document.createElement('b'); b.textContent=s.team; box.appendChild(b);
  box.appendChild(document.createTextNode(` · ${s.cls} · 💵 ${s.cash} · 💎 ${s.gems}`));
  box.hidden=false; btn.textContent='Kariyere Devam Et';
}

/* ── Pist Çiz ─────────────────────────────── */
function refreshMenuSaved(){
  renderSavedList($('menuSaved'),{
    openText:'Aç',
    emptyText:'Henüz kayıtlı pistin yok. Tahtayı açıp ilk pistini çiz.',
    onOpen:(spec,id)=>showEditor(spec,id),
  });
}
function saveName(){ prefs.name=nameInput.value.trim(); writePrefs(); }
/* Sürüşten çıkınca editöre dönülüyor; pist ve geri alma geçmişi yerinde. */
const backToEditor=()=>showEditor();
function showEditor(spec,savedId){
  menuEl.style.display='none';
  openEditor({spec,savedId,
    onBack:()=>{ closeEditor(); menuEl.style.display='block'; setMode('draw'); },
    onDrive:async s=>{
      initAudio(); saveName();
      closeEditor(true);
      await startSolo(s,backToEditor);
    },
    onOnline:async s=>{
      initAudio(); saveName();
      closeEditor(true);
      const ok=await startOnlineWith(s,backToEditor);
      if(!ok){ showEditor(); editorToast('⚠ Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.','bad'); }
    },
    onSavedChange:refreshMenuSaved,
  });
}
$('drawOpenBtn').addEventListener('click',()=>{ initAudio(); showEditor(); });

tabs.forEach(t=>t.addEventListener('click',()=>{
  // giriş animasyonunun gecikmeli sırası sadece ilk açılışta; sekme değişince hemen görünsün
  for(const k in PANES) $(PANES[k]).classList.add('swap');
  setMode(t.dataset.mode);
}));
if(prefs.name) nameInput.value=prefs.name;
nameInput.addEventListener('change',saveName);
$('mgStartBtn').addEventListener('click',()=>{
  initAudio();
  saveName();
  openManager(sanitName(nameInput.value),{onClose:refreshSummary});
});

/* Paylaşılan linkler: #pist=… editörü o pistle açar, #oda=… oda kodunu doldurur. */
function handleHash(){
  const h=location.hash||'';
  const mp=h.match(/[#&]pist=([A-Za-z0-9_-]{8,1200})/);
  if(mp){
    const spec=decodeSpec(mp[1]);
    history.replaceState(null,'',location.pathname+location.search);
    if(spec){ setMode('draw'); showEditor(spec); editorToast('🔗 Paylaşılan pist açıldı: "'+spec.name+'"'); return true; }
  }
  const mo=h.match(/[#&]oda=([A-Za-z0-9]{1,8})/i);
  if(mo){
    history.replaceState(null,'',location.pathname+location.search);
    setMode('online');
    $('roomInput').value=mo[1].toUpperCase();
    return true;
  }
  return false;
}
if(!handleHash()){
  const m=/manager|menajer/i.test(location.hash)?'manager':(PANES[prefs.mode]?prefs.mode:'online');
  setMode(m);
}
window.addEventListener('hashchange',handleHash);
