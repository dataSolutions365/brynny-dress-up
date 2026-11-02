/* ================= 🛍️ NEW FASHION AT THE CLOTHING STORE ================= */
// More outfits to buy with coins, for guys and for girls. They're sold at the 👔 Clothing Store and at the
// 🛍️ racks in the Sparkle Studio, and once bought they're in your closet. Every one is in the 2D studio too
// (index.html), with the same id. Guy tops all have sleeves, so the shoulders are covered.

/* ---------- fabrics ---------- */
const FAB_TEX={};
function fabMat(k,c,kind,o={}){const key=kind+c+(o.c2||'');const t=FAB_TEX[key]||(FAB_TEX[key]=canvasTex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);const c2=o.c2||trimOf(c);
    // wide bands across, like a rugby shirt
    if(kind==='bands'){x.fillStyle=c2;for(let y=0;y<h;y+=64)x.fillRect(0,y,w,26);}
    // thin stripes across, like a sailor top
    if(kind==='breton'){x.fillStyle=c2;for(let y=4;y<h;y+=21)x.fillRect(0,y,w,8);}
    // little checks
    if(kind==='gingham'){x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<w;i+=32){x.fillRect(i,0,16,h);x.fillRect(0,i,w,16);}x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<w;i+=32)for(let j=0;j<h;j+=32)x.fillRect(i,j,16,16);}
    // corduroy ribs that run up and down
    if(kind==='cord'){for(let i=0;i<w;i+=8){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(i,0,2,h);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(i+4,0,2,h);}}
    // a soft knit with ribs
    if(kind==='knit'){for(let i=0;i<w;i+=16){x.fillStyle='rgba(0,0,0,.14)';x.fillRect(i,0,3,h);}x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=2;
      for(let i=8;i<w;i+=16)for(let j=0;j<h;j+=10){x.beginPath();x.moveTo(i-3,j);x.lineTo(i,j+5);x.lineTo(i+3,j);x.stroke();}}
  },o.rep||4));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:o.rough??.85,sheen:.7,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.5});k.av.mats.push(m);return m;}
const satin=(k,c)=>{const m=k.mat(c,'shiny');m.roughness=.22;m.sheen=1;return m;};
// a band all the way round the top at height y (for color blocks and hems)
const bodyBand=(k,m,y,t=.016)=>{const o=beltRing(k,m,k.spine,.129,t,y);o.scale.set(k.av.shellX,1,.8);return o;};
const standCollar=(k,m,r=.06,h=.05)=>{const o=k.P(new THREE.CylinderGeometry(r,r*1.06,h,24,1,true),m,k.spine,0,.485,0);o.material.side=THREE.DoubleSide;return o;};
const zipper=(k,y0=.47,y1=.03)=>frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,y0,0,y1,.004,.004,10),.005);

const FASHION_WEAR={
  /* ===== guys ===== */
  // 🛩️ Bomber jacket: shiny, with ribbed collar, cuffs and hem, a zipper and a little pocket on the sleeve
  bomber(k,c){const m=k.mat(c,'shiny');m.roughness=.4;k.topShell(m,'long');const rib=k.mat(shadeC(c,-.3));crewNeck(k,rib,.058,.015);cuffs(k,rib,.045,.016);waistband(k,rib);zipper(k);
    const a=k.arms[1];k.P(box(.012,.045,.035),k.mat('#d9d9d9','metal'),a.sh,a.sx*.05,-.09,0);},
  // 🏉 Rugby shirt: wide stripes, a white collar and a button placket
  rugby(k,c){const m=fabMat(k,c,'bands');k.topShell(m,'long');const w=k.mat('#ffffff');shirtCollar(k,w);frontStrip(k,w,lineOf(0,.46,0,.36,.013,.013,4),.003);
    const bm=k.mat(shadeC(c,-.3),'shiny');frontDot(k,bm,.43,0,.005);frontDot(k,bm,.39,0,.005);cuffs(k,w,.044,.012);},
  // 🌬️ Windbreaker: shiny with a white band across the chest, a stand-up collar and a half zip
  windbreaker(k,c){const m=k.mat(c,'shiny');m.roughness=.3;k.topShell(m,'long');const w=k.mat(trimOf(c),'shiny');w.roughness=.3;
    bodyBand(k,w,.33,.03);for(const a of k.arms)k.P(new THREE.CylinderGeometry(.05,.05,.05,20,1,true),w,a.sh,0,-.06,0).material.side=THREE.DoubleSide;
    standCollar(k,m);zipper(k,.5,.33);cuffs(k,k.mat(shadeC(c,-.25)),.042,.012);waistband(k,k.mat(shadeC(c,-.25)));},
  // 🧥 Corduroy shirt-jacket: ribbed fabric, a collar, two chest pockets with flaps and big buttons
  shacket(k,c){const m=fabMat(k,c,'cord');k.topShell(m,'long');shirtCollar(k,m);const dk=fabMat(k,shadeC(c,-.15),'cord');
    for(const s of [-1,1]){frontStrip(k,dk,lineOf(s*.065,.38,s*.065,.32,.028,.028,2),.004);frontStrip(k,m,lineOf(s*.065,.388,s*.065,.37,.03,.03,1),.007);}
    const bm=k.mat(shadeC(c,-.45),'shiny');[.43,.35,.27,.19,.11].forEach(y=>frontDot(k,bm,y,0,.0065));cuffs(k,dk,.046,.013);},
  // 🏃 Track jacket: shiny zip-up with stripes down the sleeves
  trackjacket(k,c){const m=k.mat(c,'shiny'),w=k.mat(trimOf(c));k.topShell(m,'long');standCollar(k,m);zipper(k);waistband(k,m);
    for(const a of k.arms){k.P(box(.008,.17,.02),w,a.sh,a.sx*.048,-.13,0);k.P(box(.008,.15,.02),w,a.el,a.sx*.042,-.1,0);}
    for(const s of [-1,1])frontStrip(k,w,lineOf(s*.05,.47,s*.06,.2,.004,.004,6),.004);},
  // 〰️ Striped tee: a soft tee with thin stripes, sleeves that cover the shoulders
  stripetee(k,c){const m=fabMat(k,c,'breton');k.topShell(m,'short');for(const a of k.arms)k.P(capTop(.055,.05),m,a.sh,0,-.02,0);crewNeck(k,k.mat(c));},
  // 🏃 Track pants: shiny with stripes down the sides and cuffs at the ankles
  trackpants(k,c){const m=k.mat(c,'shiny');k.waist(m);k.legsShell(m,.074,true);sideStripes(k,k.mat(trimOf(c)),true);ankleCuffs(k,m,.064);drawstrings(k);},
  // 🟫 Corduroys: ribbed straight pants with a belt
  cords(k,c){const m=fabMat(k,c,'cord');k.waist(m);looseLegs(k,m,.082,{hem:.96});guyBelt(k,'#3a2a1e');},
  // 🩳 Jean shorts: long denim shorts with a frayed hem
  jorts(k,c){const m=k.mat(c,'denim');k.waist(m);looseLegs(k,m,.088,{thigh:.4,shin:0});const f=k.mat('#e8eef7');for(const l of k.legs)beltRing(k,f,l.hp,.089,.006,.02-.4+.008);guyBelt(k,'#1a1a1a');},
  // 🥾 Chelsea boots: shiny ankle boots with stretchy sides and a pull tab
  chelsea(k,c){const m=k.mat(c,'shiny');m.clearcoat=1;shoeShell(k,m,.9,1.02);bootLeg(k,m,.064,.14);solePad(k,k.mat('#1a1a1a','shiny'),.02,.112,.232);
    const e=k.mat('#1a1a1a');k.legs.forEach(l=>{const X=k.av.legX;for(const s of [-1,1])k.P(box(.006,.08,.035),e,l.kn,s*.064,-.37-X+.08,0);k.P(box(.02,.03,.006),e,l.kn,0,-.37-X+.15,-.066);});},
  // 👟 Retro sneakers: a cream sole, a toe cap and a colored stripe on the side
  retrokicks(k,c){const m=k.mat('#ffffff');shoeShell(k,m,.86,1.04);solePad(k,k.mat('#f2e6c8','shiny'),.034,.118,.235);const cm=k.mat(c,'shiny');
    k.legs.forEach(l=>{for(const s of [-1,1]){const st=k.P(box(.005,.012,.09),cm,l.an,s*.064,-.015,.05);st.rotation.x=-.3;}k.P(sph(.04,12,8),cm,l.an,0,-.025,.13).scale.set(1.3,.6,.9);});},
  // ⛵ Boat shoes: low and shiny with a white sole and laces around the top
  boatshoes(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.68,1.02);solePad(k,k.mat('#ffffff','shiny'),.02,.112,.232);const lm=k.mat('#e8d5a8');
    k.legs.forEach(l=>{beltRing(k,lm,l.an,.05,.004,.022).scale.set(1.1,1,1.6);k.P(box(.03,.004,.012),lm,l.an,.02,.03,.09);});},
  // 🧢 Flat cap: a low flat crown with a short brim
  flatcap(k,c){const m=fabMat(k,c,'knit',{rough:.9});const cr=k.P(new THREE.SphereGeometry(.15,24,12,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.04,.01);cr.scale.set(1.04,.55,1.14);cr.rotation.x=.18;
    const b=k.P(new THREE.CylinderGeometry(.1,.1,.012,24,1,false,-1.4,2.8),m,k.head,0,.06,.1);b.scale.z=.7;b.rotation.x=.25;k.P(sph(.01,8,6),m,k.head,0,.12,.02);},
  // 🧢 Trucker hat: a tall front panel, a mesh back and a curved brim
  trucker(k,c){const m=k.mat(c),w=k.mat('#ffffff');const back=k.P(new THREE.SphereGeometry(.15,28,14,Math.PI*.6,Math.PI*.8,0,Math.PI/2),w,k.head,0,.025,-.005);back.scale.set(1.02,1.02,1.04);
    const fr=k.P(new THREE.SphereGeometry(.152,28,14,-Math.PI*.4,Math.PI*1.2,0,Math.PI/2),m,k.head,0,.025,-.005);fr.scale.set(1.02,1.04,1.04);
    const b=k.P(cyl(.11,.11,.012,24),m,k.head,0,.05,.15);b.scale.z=.85;b.rotation.x=.12;k.P(sph(.012,8,6),m,k.head,0,.18,-.005);},
  // 👜 Crossbody bag: a strap across the chest and a small bag on the hip
  crossbody(k,c){const m=k.mat(c,'shiny'),dk=k.mat(shadeC(c,-.3));frontStrip(k,dk,lineOf(.085,.45,-.11,.1,.009,.009,10),.012);
    const back=k.P(box(.018,.36,.008),dk,k.spine,.03,.27,-.11);back.rotation.z=.55;
    const bag=k.P(new RoundedBoxGeometry(.13,.09,.045,2,.015),m,k.spine,-.12,.08,.07);bag.rotation.y=-.5;k.P(box(.08,.008,.004),k.mat('#d9d9d9','metal'),bag,0,.025,.024);},
  // 🤠 Neckerchief: a bandana tied round the neck with a point in front
  neckerchief(k,c){const m=fabMat(k,c,'gingham',{rep:6});const r=k.P(new THREE.TorusGeometry(.064,.018,8,24),m,k.spine,0,.465,0);r.rotation.x=Math.PI/2;
    const t=k.P(new THREE.ConeGeometry(.05,.09,3),m,k.spine,0,.415,shellZ(k,.42)+.01);t.rotation.x=Math.PI;t.scale.z=.25;},

  /* ===== girls ===== */
  // 🥂 Satin slip dress: thin straps, a shiny midi skirt and lace at the neckline
  slipdress(k,c){const m=satin(k,c);k.topShell(m,'strap');k.skirt(m,.62,.27,{curve:.9,folds:.04,k:10});bodyBand(k,k.mat('#ffffff'),.4,.006);k.av.legAmp=.32;},
  // 🎀 Wrap dress: crossed front, a tie belt with a bow and a swishy skirt
  wrapdress(k,c){const m=k.mat(c),dk=k.mat(shadeC(c,-.2));k.topShell(m,'short');for(const s of [-1,1])frontStrip(k,dk,lineOf(s*.055,.46,-s*.04,.2,.004,.004,8),.004);
    beltRing(k,dk,k.hips,.14,.012,.1);for(const s of [-1,1]){const l=k.P(new THREE.ConeGeometry(.02,.05,10),dk,k.hips,.08+s*.025,.1,.12);l.rotation.z=s*Math.PI/2;l.scale.z=.5;}
    k.P(capTop(.006,.1),dk,k.hips,.085,.09,.125);k.skirt(m,.5,.3,{curve:.85,folds:.08,k:9});},
  // 🧶 Sweater dress: cozy knit with a tall collar and long sleeves
  sweaterdress(k,c){const m=fabMat(k,c,'knit');k.topShell(m,'long');standCollar(k,m,.058,.07);cuffs(k,m,.046,.016);k.skirt(m,.34,.18,{curve:1,folds:.02,k:12});},
  // 🧺 Gingham dress: little checks, puff sleeves and a round white collar
  gingham(k,c){const m=fabMat(k,c,'gingham',{rep:5});k.topShell(m,'puff');k.skirt(m,.45,.32,{curve:.8,folds:.07,k:12});const w=k.mat('#ffffff');
    for(const s of [-1,1]){const d=k.P(cyl(.03,.03,.006,20),w,k.spine,s*.028,.44,shellZ(k,.44,s*.028)+.004);d.rotation.x=Math.PI/2-.3;}},
  // 👚 Puff-sleeve blouse: big puffy shoulders and buttons down the front
  puffblouse(k,c){const m=k.mat(c);k.topShell(m,'puff');for(const a of k.arms)k.P(capTop(.042,.15),m,a.el);const bm=k.mat(trimOf(c),'shiny');[.4,.34,.28,.22].forEach(y=>frontDot(k,bm,y,0,.005));},
  // 🧥 Cardigan: a soft knit open over a white top, with buttons
  cardigan(k,c){const m=fabMat(k,c,'knit');k.topShell(m,'long');frontStrip(k,k.mat('#ffffff'),lineOf(0,.46,0,.07,.03,.03,10),.003);
    for(const s of [-1,1])frontStrip(k,k.mat(shadeC(c,-.15)),lineOf(s*.034,.46,s*.036,.07,.005,.005,10),.004);
    const bm=k.mat('#ffffff','shiny');[.38,.3,.22,.14].forEach(y=>frontDot(k,bm,y,-.034,.006));cuffs(k,m,.046,.014);waistband(k,m);},
  // 🧥 Trench coat: long, with lapels, a belt with a buckle and two rows of buttons
  trench(k,c){const m=k.mat(c);k.topShell(m,'long');const hem=k.skirt(m,.48,.24,{r0:.15,curve:1,folds:.03,k:8});hem.scale.set(k.av.shellX/1.12*1.04,1,.84);
    const dk=k.mat(shadeC(c,-.2));for(const s of [-1,1])frontStrip(k,dk,lineOf(s*.04,.46,s*.012,.3,.016,.006,6),.005);bodyBand(k,dk,.12,.014);
    k.P(box(.03,.026,.01),k.mat('#d9d9d9','metal'),k.spine,0,.12,shellZ(k,.12)+.012);const bm=k.mat(shadeC(c,-.4),'shiny');for(const x of [-.04,.04])[.27,.21].forEach(y=>frontDot(k,bm,y,x,.0065));cuffs(k,dk,.046,.012);},
  // ⚓ Striped top: a sailor-style top with thin stripes and long sleeves
  stripetop(k,c){const m=fabMat(k,c,'breton');k.topShell(m,'long');crewNeck(k,k.mat(c),.06,.008);},
  // 👖 Wide-leg jeans: high waist and wide legs
  widejeans(k,c){const m=k.mat(c,'denim');k.waist(m);looseLegs(k,m,.084,{hem:1.18});bodyBand(k,k.mat(shadeC(c,-.15),'denim'),.035,.012);},
  // 🏫 Plaid skirt: a pleated mini in a plaid
  plaidskirt(k,c){const m=plaidMat(k,c);k.waist(m);k.skirt(m,.3,.25,{curve:.6,folds:.1,k:20});},
  // 🌙 Satin skirt: a shiny midi skirt that swishes
  satinskirt(k,c){const m=satin(k,c);k.waist(m);k.skirt(m,.6,.3,{curve:.9,folds:.05,k:12});k.av.legAmp=.32;},
  // 👟 Platform sneakers: tall white soles that make you taller
  platsneaks(k,c){shoeShell(k,k.mat(c),.86,1.04);const w=k.mat('#ffffff','shiny');k.legs.forEach(l=>k.P(new RoundedBoxGeometry(.12,.07,.24,2,.015),w,l.an,0,-.07,.045));
    shoeTrim(k,k.mat(trimOf(c),'shiny'));k.av.lift=.04;},
  // 🤠 Western boots: tall, with a pointy toe, a heel and stitching
  westernboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.85,1).forEach(sh=>{sh.scale.z*=1.12;});bootLeg(k,m,.066,.24);const g=k.mat('#d4af37','metal');
    k.legs.forEach(l=>{k.P(box(.06,.05,.045),k.mat(shadeC(c,-.3),'shiny'),l.an,0,-.05,-.03);for(const s of [-1,1]){const st=k.P(box(.004,.14,.004),g,l.kn,s*.05,-.29-k.av.legX,.045);st.rotation.y=s*.6;}});},
  // 🥿 Mules: slip-on shoes with a pointy toe and a little heel
  mules(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.6,1);k.legs.forEach(l=>{k.P(cyl(.014,.01,.045,8),m,l.an,0,-.045,-.035);k.P(box(.03,.006,.02),k.mat('#d4af37','metal'),l.an,0,.005,.09);});},
  // 💇‍♀️ Claw clip: a big clip holding your hair up at the back
  clawclip(k,c){const m=k.mat(c,'shiny');m.transparent=true;m.opacity=.92;for(const s of [-1,1]){const t=k.P(new THREE.TorusGeometry(.04,.01,8,16,Math.PI),m,k.head,0,.08,-.15+s*.012);t.rotation.y=Math.PI/2;t.rotation.z=s*.3;}
    for(let i=-2;i<=2;i++)k.P(new THREE.ConeGeometry(.007,.03,6),m,k.head,i*.012,.05,-.16).rotation.x=Math.PI;},
  // 🌸 Bandana headband: a printed scarf tied round your head with a knot at the back
  headscarf(k,c){const m=fabMat(k,c,'gingham',{rep:6});const b=k.P(new THREE.TorusGeometry(.142,.018,8,40),m,k.head,0,.085,-.01);b.rotation.x=Math.PI/2-.35;b.scale.set(1.04,1.08,1);
    k.P(sph(.018,10,8),m,k.head,0,.035,-.15);for(const s of [-1,1]){const t=k.P(new THREE.ConeGeometry(.02,.08,3),m,k.head,s*.022,-.01,-.155);t.rotation.z=s*.35;t.scale.z=.3;}},
  // 👜 Shoulder bag: a little bag tucked under your arm on a short strap
  shoulderbag(k,c){const a=k.arms[1],m=k.mat(c,'shiny');const s=k.P(new THREE.TorusGeometry(.06,.006,6,20),k.mat(shadeC(c,-.25)),a.sh,0,-.05,0);s.rotation.y=Math.PI/2;
    k.P(new RoundedBoxGeometry(.04,.09,.17,2,.015),m,a.sh,a.sx*.05,-.13,.0);k.P(box(.006,.02,.03),k.mat('#d4af37','metal'),a.sh,a.sx*.072,-.12,.0);},
  // ⭕ Hoop earrings: big gold hoops
  hoops(k,c){const m=k.mat(c,'metal');for(const s of [-1,1]){const h=k.P(new THREE.TorusGeometry(.03,.004,8,24),m,k.head,s*.13*k.av.hs.x,-.075,.0);h.rotation.y=Math.PI/2;}},
};
Object.assign(OUTFITS2D,FASHION_WEAR);

/* ---------- what's for sale, and for how much ---------- */
// guys: [id, emoji, name, starting color, price]
const FASHION_GUY={tops:[['bomber','🛩️','Bomber jacket','#4b5a3a',60],['rugby','🏉','Rugby shirt','#1f2a44',45],['windbreaker','🌬️','Windbreaker','#3a5bd9',50],
    ['shacket','🧥','Cord shirt jacket','#a0622d',55],['trackjacket','🏃','Track jacket','#2d2d3a',45],['stripetee','〰️','Striped tee','#ffffff',30]],
  bottoms:[['trackpants','🏃','Track pants','#2d2d3a',40],['cords','🟫','Corduroys','#8a5a3b',40],['jorts','🩳','Jean shorts','#6f9be0',30]],
  shoes:[['chelsea','🥾','Chelsea boots','#3b2416',60],['retrokicks','👟','Retro sneakers','#d62839',55],['boatshoes','⛵','Boat shoes','#8a5a3b',40]],
  hats:[['flatcap','🧢','Flat cap','#6b6f78',35],['trucker','🧢','Trucker hat','#2e9e4f',30]],
  extras:[['crossbody','👜','Crossbody bag','#2d2d3a',40],['neckerchief','🤠','Neckerchief','#d62839',20]]};
// girls: the same, plus dresses
const FASHION_GIRL={dresses:[['slipdress','🥂','Satin slip dress','#c9a0dc',90],['wrapdress','🎀','Wrap dress','#d62839',80],['sweaterdress','🧶','Sweater dress','#c8b28a',70],['gingham','🧺','Gingham dress','#4fb6ff',70]],
  tops:[['puffblouse','👚','Puff-sleeve blouse','#ffffff',45],['cardigan','🧥','Cardigan','#ffb3d1',45],['trench','🧥','Trench coat','#c8a06a',70],['stripetop','⚓','Striped top','#ffffff',35]],
  bottoms:[['widejeans','👖','Wide-leg jeans','#6f9be0',45],['plaidskirt','🏫','Plaid skirt','#c0392b',40],['satinskirt','🌙','Satin skirt','#d4af37',50]],
  shoes:[['platsneaks','👟','Platform sneakers','#ffffff',60],['westernboots','🤠','Western boots','#ffffff',65],['mules','🥿','Mules','#2d2d3a',40]],
  hats:[['clawclip','💇‍♀️','Claw clip','#c68642',20],['headscarf','🌸','Bandana headband','#ff6fae',25]],
  extras:[['shoulderbag','👜','Shoulder bag','#ff6fae',50],['hoops','⭕','Hoop earrings','#e0b04a',30]]};
const TAB_NAME={dresses:'Dresses',tops:'Tops',bottoms:'Bottoms',shoes:'Shoes',hats:'Hats',extras:'Extras'};
// the girls' side of the store (guys' side is STORE_CAT, from 14d-barber-looks.js)
const GIRL_STORE_CAT={glasses:STORE_GLASSES,dresses:[],tops:[],bottoms:[],shoes:[],hats:[],extras:[]};
{const GUY_LIST={tops:[STORE_TOPS,GUY_TOPS],bottoms:[STORE_BOTTOMS,GUY_BOTTOMS],shoes:[STORE_SHOES,GUY_SHOES],hats:[STORE_HATS,GUY_HATS],extras:[STORE_EXTRAS,GUY_EXTRAS]};
  for(const tab in FASHION_GUY)FASHION_GUY[tab].forEach(([id,e,n,c,p])=>{const it=[id,e,n,c];GUY_LIST[tab].forEach(l=>l.push(it));STORE_PRICE[tab].push(p);
    SHOP.push({k:'look:'+id,tab:'store',st:tab,e,n,p,d:`New at the store! Made for guys. Find it in your closet's ${TAB_NAME[tab]}.`});});
  for(const tab in FASHION_GIRL)FASHION_GIRL[tab].forEach(([id,e,n,c,p])=>{const it=[id,e,n,c];CAT[tab].push(it);GIRL_STORE_CAT[tab].push(it);
    SHOP.push({k:'look:'+id,tab:'store',st:tab,girl:true,e,n,p,d:`New at the store! Find it in your closet's ${TAB_NAME[tab]}.`});});}
