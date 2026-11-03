/* ================= 🏆 MODERN FASHION YOU EARN: can't be bought, only won =================
   Picked from what's in style now (fall 2026): cable knits, shearling jackets, parachute pants, barrel-leg jeans,
   utility vests, denim maxi skirts and chunky sneakers. In the 3D world they're locked 🔒 in your closet until you earn them
   by winning contests and games or by playing days in a row (24i-earned-rides.js gives them out, the ⭐🏆 Rewards tab shows how close you are).
   Every one is in the 2D studio too (index.html), with the same id, free to try there.
   who: 'both' = girls and guys, 'guy' or 'girl' = only that closet. */
const EARN_LOOKS=[
  {id:'cableknit',tab:'tops',e:'🧶',n:'Cable-knit sweater',c:'#f2e6d0',who:'both',earn:{by:'days',goal:2}},
  {id:'parachute',tab:'bottoms',e:'🪂',n:'Parachute pants',c:'#2d2d3a',who:'both',earn:{by:'wins',goal:1}},
  {id:'barreljeans',tab:'bottoms',e:'👖',n:'Barrel jeans',c:'#5b7fb8',who:'both',earn:{by:'wins',goal:2}},
  {id:'utilityvest',tab:'tops',e:'🦺',n:'Utility vest',c:'#5d6b3a',who:'guy',earn:{by:'days',goal:4}},
  {id:'denimmaxi',tab:'bottoms',e:'💙',n:'Denim maxi skirt',c:'#5b7fb8',who:'girl',earn:{by:'days',goal:4}},
  {id:'shearling',tab:'tops',e:'🐑',n:'Shearling jacket',c:'#8a5a3b',who:'both',earn:{by:'days',goal:5}},
  {id:'chunkykicks',tab:'shoes',e:'👟',n:'Chunky sneakers',c:'#ffffff',who:'both',earn:{by:'wins',goal:5}},
];
Object.assign(OUTFITS2D,{
  // 🧶 Cable-knit sweater: soft knit with braided cables down the front, ribbed neck, cuffs and hem
  cableknit(k,c){const m=fabMat(k,c,'knit');k.topShell(m,'long');const rib=k.mat(shadeC(c,-.12));crewNeck(k,rib,.058,.016);cuffs(k,rib,.046,.016);waistband(k,rib);
    for(const x of [-.055,0,.055])for(let i=0;i<9;i++){const y=.105+i*.036;frontDot(k,rib,y,x+(i%2?.006:-.006),.0105);}},
  // 🪂 Parachute pants: baggy and shiny, with drawstrings and toggles at the ankles
  parachute(k,c){const m=k.mat(c,'shiny');m.roughness=.35;k.waist(m);looseLegs(k,m,.094,{hem:.92});const dk=k.mat(shadeC(c,-.2),'shiny');ankleCuffs(k,dk,.08);drawstrings(k);
    const X=k.av.legX,t=k.mat('#1a1a1a');for(const l of k.legs){k.P(cyl(.003,.003,.05,6),k.mat('#ffffff'),l.kn,l.sx*.03,-.36-X,.075);k.P(cyl(.008,.008,.016,8),t,l.kn,l.sx*.03,-.39-X,.077);}
    for(const l of k.legs)beltRing(k,dk,l.kn,.092,.006,-.02);},
  // 👖 Barrel jeans: roomy at the knee and curving in at the ankle, with a belt
  barreljeans(k,c){const m=k.mat(c,'denim');k.waist(m);looseLegs(k,m,.093,{hem:.74});guyBelt(k,'#3a2a1e');},
  // 🦺 Utility vest: lots of pockets and a zip, over a plain tee
  utilityvest(k,c){k.topShell(k.mat('#ececec'),'short');for(const a of k.arms)k.P(capTop(.055,.05),k.mat('#ececec'),a.sh,0,-.02,0);
    const m=k.mat(c);const b=k.P(new THREE.CapsuleGeometry(.138,.2,6,24),m,k.spine,0,.25,0);b.scale.set(k.av.shellX*1.02,1,.84);
    const dk=k.mat(shadeC(c,-.18));standCollar(k,m,.066,.04);
    for(const s of [-1,1]){frontStrip(k,dk,lineOf(s*.06,.37,s*.06,.31,.045,.045,2),.016);frontStrip(k,dk,lineOf(s*.065,.2,s*.065,.12,.055,.055,2),.017);}
    frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,.47,0,.06,.005,.005,10),.017);},
  // 💙 Denim maxi skirt: long and straight, with a front seam and gold stitching
  denimmaxi(k,c){const m=k.mat(c,'denim');k.waist(m);k.skirt(m,.8,.22,{curve:.9,folds:.03,k:8});beltRing(k,k.mat(shadeC(c,-.15),'denim'),k.hips,.14,.012,.1);k.av.legAmp=.34;},
  // 🐑 Shearling jacket: suede with a big fluffy cream collar, cuffs and hem
  shearling(k,c){const m=k.mat(c);m.roughness=.95;k.topShell(m,'long');const cr=k.mat('#f4ebdc');cr.roughness=1;
    crewNeck(k,cr,.07,.028);for(const s of [-1,1])frontStrip(k,cr,lineOf(s*.03,.46,s*.075,.33,.035,.012,5),.006);cuffs(k,cr,.05,.02);waistband(k,cr);
    frontStrip(k,k.mat(shadeC(c,-.35)),lineOf(0,.36,0,.05,.004,.004,6),.004);},
  // 👟 Chunky sneakers: big layered soles with a colored stripe
  chunkykicks(k,c){shoeShell(k,k.mat(c),.95,1.1);solePad(k,k.mat('#f4f4f4','shiny'),.06,.13,.25);
    const acc=k.mat(isLight(c)?'#8fb8ff':trimOf(c),'shiny');k.legs.forEach(l=>k.P(box(.134,.012,.254),acc,l.an,0,-.032,.045));shoeTrim(k,k.mat(shadeC(c,-.25),'shiny'));},
});
for(const L of EARN_LOOKS){const it=[L.id,L.e,L.n,L.c];if(L.who!=='guy')CAT[L.tab].push(it);if(L.who!=='girl')GUY_CAT[L.tab].push(it);
  SHOP.push({k:'look:'+L.id,tab:'earned',st:L.tab,girl:L.who==='girl',guy:L.who==='guy',e:L.e,n:L.n,p:0,prize:L.earn.goal,earn:L.earn,
    d:`Modern fashion you can't buy! Earn it and find it in your closet's ${TAB_NAME[L.tab]}.`});}
