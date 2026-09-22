/* Online modun araç sınıfları.

   Denge fikri: hiçbir araç diğerinin her yönden üstünü değil. Son hız arttıkça
   dönüş hızı düşüyor, yani hızlı araç viraja geç giriyor ve geniş dönüyor.
   Sabit dönüş hızıyla dönüş yarıçapı = hız / turn olduğundan, hangi aracın
   kazandığına pist karar veriyor: Çöl Rallisi'nde kart, Kısa Oval'de F1.

   spd  son hız (px/sn)        acc  ivme (px/sn²)
   brk  fren gücü             turn dönüş hızı (rad/sn)
   fric gaz bırakınca yavaşlama   off  pist dışı hız çarpanı
   nos  NOS hakkı             draft slipstream (yalnız stock car)          */

export const VEHICLES=[
  {id:'kart', kind:'kart', name:'Kart',      cls:'normal',
   spd:210, acc:255, brk:350, turn:4.00, fric:150, off:0.50, nos:2,
   sub:'Yavaş ama iğne deliğinden geçer'},
  {id:'f4',   kind:'f4',   name:'Formula 4', cls:'normal',
   spd:242, acc:228, brk:335, turn:3.30, fric:140, off:0.44, nos:3,
   sub:'Dengeli ve affedici — ilk tercih'},
  {id:'gt',   kind:'gt',   name:'GT',        cls:'normal',
   spd:258, acc:200, brk:300, turn:2.95, fric:122, off:0.62, nos:3,
   sub:'Ağır; pist dışında en az ceza yiyen'},
  {id:'f1',   kind:'f1',   name:'Formula 1', cls:'normal',
   spd:292, acc:268, brk:395, turn:2.55, fric:136, off:0.34, nos:3,
   sub:'En hızlı; virajda hantal, çimde çaresiz'},

  /* Stock car yalnız NASCAR modunda. Frenle durmayan, zor dönen, düzlükte
     uçan bir tank: tehlike virajdan değil trafikten geliyor.               */
  {id:'stock',kind:'stock',name:'Stock Car', cls:'nascar',
   spd:330, acc:190, brk:255, turn:2.05, fric:98, off:0.26, nos:2,
   draft:{dist:135, gain:0.11, angle:0.7},
   sub:'Dev oval için: draft ile uç, frene güvenme'},
];

export const vehById=id=>VEHICLES.find(v=>v.id===id)||VEHICLES[1];
export const vehiclesFor=cls=>VEHICLES.filter(v=>v.cls===(cls==='nascar'?'nascar':'normal'));
export const defaultVehFor=cls=>vehiclesFor(cls)[cls==='nascar'?0:1];

/* NASCAR'da hasar sürüşü bozar: ön kaput ezildikçe hız ve dönüş düşer.
   Oran tablosu tek yerde durmalı — botlar da (bots.js) bunu okuyor, aksi
   hâlde hasar yalnız oyuncuyu cezalandıran bir mekanik olur.              */
export const DMG={spd:0.22, acc:0.28, turn:0.30, brk:0.18, grip:0.30};

export function applyDamage(V,damage){
  const d=Math.max(0,Math.min(1,damage||0));
  if(d<=0) return V;
  return Object.assign({},V,{
    spd:V.spd*(1-DMG.spd*d),
    acc:V.acc*(1-DMG.acc*d),
    turn:V.turn*(1-DMG.turn*d),
    brk:V.brk*(1-DMG.brk*d),
  });
}

/* Pit: şeritte yavaşken hasar bu hızla iniyor (tam onarım ~2 sn sürüyor). */
export const PIT_REPAIR_PER_S=0.55;
export const PIT_CRAWL=30;          // bunun altında tamir işliyor
