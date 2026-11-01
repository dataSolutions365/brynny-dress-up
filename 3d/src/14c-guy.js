/* ================= GUYS ================= */
// You can play as a girl or a guy (look.body==='guy'), picked on the welcome screen or in the closet's Face tab.
// A guy has his own body (broader shoulders, flatter chest, slimmer hips, squarer jaw), his own hair styles and his
// own closet. Each body keeps its own saved look in SAVE.looks, so switching back and forth never loses an outfit.
// The clothes work like OUTFITS2D: each one is a function (kit,color) that adds its pieces to the avatar.
const isGuy=L=>!!L&&L.body==='guy';
const tagColor=L=>isGuy(L)?'#2f7be5':'#ff4d8d';

const GUY_HAIRS=[['crop','💇‍♂️','Crew cut'],['buzz','🪒','Buzz cut'],['quiff','😎','Swoop'],['sidepart','👔','Side part'],['curltop','🌀','Curly top'],['spiky','⚡','Spiky'],['flow','🏄','Surfer flow'],['manbun','🥷','Man bun'],['afro','☁️','Afro']];
const GUY_OUTFITS=[['suit','🤵','Sharp suit','#1f2a44'],['suit2','💼','Everyday suit','#6b7280'],['tux','🎩','Tuxedo','#1a1a1a'],['tracksuit','🏃','Tracksuit','#d62839'],['sweatsuit','🛋️','Sweatsuit','#8a8f99'],['coveralls','🔧','Mechanic coveralls','#2f4a7a'],['bballuni','🏀','Basketball uniform','#4f2d7f']];
const GUY_TOPS=[['gtee','👕','T-shirt','#4fb6ff'],['graphictee','⚡','Graphic tee','#2d2d3a'],['polo','⛳','Polo shirt','#2e9e4f'],['buttonup','👔','Button-up shirt','#cfe3ff'],['flannelover','🍁','Flannel over tee','#c0392b'],
  ['crewneck','🧶','Sweatshirt','#8a8f99'],['ghoodie','🧥','Hoodie','#2d2d3a'],['ziphoodie','🤐','Zip hoodie','#3a5bd9'],['quarterzip','⛷️','Quarter-zip','#1f2a44'],['puffer','❄️','Puffer jacket','#2d2d3a'],
  ['varsity','🏈','Varsity jacket','#d62839'],['jacket','🧥','Jean jacket','#5b8fd6'],['jersey','🏀','Jersey','#4fb6ff'],['tank','🎽','Tank top','#ffffff']];
const GUY_BOTTOMS=[['khakis','👖','Khakis','#c8b28a'],['slimjeans','👖','Tight jeans','#3a5bd9'],['baggyjeans','👖','Baggy jeans','#6f9be0'],['cargoshorts','🩳','Cargo shorts','#8a7a52'],['gymshorts','🏃','Gym shorts','#2d2d3a'],
  ['sweats','😴','Sweatpants','#8a8f99'],['cargopants','🪖','Cargo pants','#5d6b3a'],['swimtrunks','🏖️','Swim trunks','#2fd1c5']];
const GUY_SHOES=[['kicks','👟','Sneakers','#ffffff'],['hightops','🏀','High-tops','#d62839'],['skateshoes','🛹','Skate shoes','#2d2d3a'],['slides','🩴','Slides & socks','#2d2d3a'],['oxfords','👞','Dress shoes','#3b2416'],['loafers','🥿','Loafers','#7a4a2a'],['workboots','🥾','Work boots','#b07a3a'],['cleats','⚽','Cleats','#ff8a1f']];
const GUY_HATS=[['cap','🧢','Ball cap','#3a5bd9'],['backcap','🔄','Backwards cap','#d62839'],['snapback','🧢','Snapback','#2d2d3a'],['beanie','🧶','Beanie','#2d2d3a'],['bucket','🪣','Bucket hat','#c8b28a'],['sweatband','🏃','Sweatband','#ffffff']];
const GUY_EXTRAS=[['chain','⛓️','Chain','#e0b04a'],['watch','⌚','Watch','#c0c0c0'],['shades','🕶️','Sunglasses','#2d2d3a'],['glasses','👓','Glasses','#2d2d3a'],['headphones','🎧','Headphones','#2d2d3a'],['backpack','🎒','Backpack','#d62839'],
  ['wristbands','💪','Wristbands','#ffffff'],['skateboard','🛹','Skateboard','#ff8a1f'],['scarf','🧣','Scarf','#3a5bd9'],['medal','🥇','Gold medal','#ffd23f'],['cape','🦸','Cape','#e0263b']];
const GUY_CAT={dresses:GUY_OUTFITS,tops:GUY_TOPS,bottoms:GUY_BOTTOMS,shoes:GUY_SHOES,hats:GUY_HATS,extras:GUY_EXTRAS};
const GUY_TABS=[['hair','💇‍♂️','Hair'],['skin','🙂','Face'],['dresses','🤵','Suits'],['tops','👕','Tops'],['bottoms','👖','Bottoms'],['shoes','👟','Shoes'],['hats','🧢','Hats'],['extras','⌚','Extras']];
// holiday things that are made for dresses stay in the girls' closet
const GIRL_ONLY=new Set(['ghost','elf']);
const catOf=tab=>{if(!isGuy(SAVE.look))return CAT[tab];const base=GUY_CAT[tab]||[];
  const hol=(CAT[tab]||[]).filter(x=>{const s=shopItem('look:'+x[0]);return s&&s.hol&&!GIRL_ONLY.has(x[0])&&!base.some(b=>b[0]===x[0]);});return base.concat(hol);};
const hairsOf=L=>isGuy(L)?GUY_HAIRS:HAIRS;
const tabsOf=()=>isGuy(SAVE.look)?GUY_TABS:TABS;
const LOOK_ALL=a=>a.concat(...Object.values(GUY_CAT));
const defaultGuyLook=(from)=>({body:'guy',style:(from&&from.style)||'glam',skin:(from&&from.skin)||'#f7cfae',eyes:(from&&from.eyes)||'#6b4a2b',hair:{id:'crop',c:'#4a2c1a'},
  top:{id:'gtee',c:'#4fb6ff'},bottom:{id:'slimjeans',c:'#3a5bd9'},dress:null,shoes:{id:'kicks',c:'#ffffff'},hat:null,extras:{},makeup:Object.assign(defaultMakeup(),{blush:'none'})});
// what goes on when a top or bottom replaces a full outfit
const plainTop=L=>isGuy(L)?{id:'gtee',c:'#4fb6ff'}:{id:'tee',c:'#ff6fae'};
const plainBottom=L=>isGuy(L)?{id:'slimjeans',c:'#3a5bd9'}:{id:'jeans',c:'#3a5bd9'};
// switch between playing a girl and a guy; each keeps its own look (and face paint)
function switchBody(b){const cur=isGuy(SAVE.look)?'guy':'girl';if(b===cur)return false;
  SAVE.looks=SAVE.looks||{};SAVE.looks[cur]={look:SAVE.look,paint:SAVE.facePaint||null};
  const nx=SAVE.looks[b];
  SAVE.look=nx&&nx.look?nx.look:b==='guy'?defaultGuyLook(SAVE.look):Object.assign(defaultLook(),{style:SAVE.look.style||'glam',skin:SAVE.look.skin,eyes:SAVE.look.eyes,makeup:defaultMakeup()});
  if(nx&&nx.paint)SAVE.facePaint=nx.paint;else delete SAVE.facePaint;
  if(!SAVE.look.makeup)SAVE.look.makeup=defaultMakeup();
  persist();did('body',b);shareBody();renderMe();return true;}
// tell the 2D studio whether you play a girl or a guy (its top-left picture matches unless you pick your own)
function shareBody(){try{localStorage.setItem('brynny.body',JSON.stringify({b:isGuy(SAVE.look)?'guy':'girl',at:Date.now()}));}catch(e){}}

/* ---------- guy hair: added on top of the short cap every hair style starts with ---------- */
const GUY_HAIR={
  crop({P,m,head,cap}){cap.scale.set(1.02,1.07,1.04);const t=new THREE.IcosahedronGeometry(.032,1);
    for(let i=0;i<9;i++){const a=-1+i*.25;const s=P(t.clone(),m,head,Math.sin(a)*.09,.118+Math.cos(a*1.3)*.012,.035+Math.cos(a)*.03);s.scale.set(1.2,.45,1);}},
  buzz({cap,m}){cap.scale.set(1.0,1.04,1.015);m.bumpScale=.08;m.sheen=.3;},
  quiff({P,m,head,cap}){cap.scale.set(1.02,1.07,1.04);const q=P(sph(.07,20,14),m,head,0,.125,.065);q.scale.set(1.25,.62,1.05);q.rotation.x=-.45;
    const q2=P(sph(.05,16,12),m,head,.01,.155,.05);q2.scale.set(1.3,.6,1.1);q2.rotation.x=-.7;},
  sidepart({P,m,head,cap}){cap.scale.set(1.03,1.08,1.05);const f=P(sph(.075,20,14),m,head,-.025,.115,.06);f.scale.set(1.35,.42,1);f.rotation.z=-.25;f.rotation.x=-.3;
    const s=P(sph(.06,16,12),m,head,.07,.1,.03);s.scale.set(.9,.5,1.1);},
  curltop({P,m,head,cap}){cap.scale.set(1.0,1.04,1.02);const rr=new THREE.IcosahedronGeometry(.03,1);
    for(let i=0;i<26;i++){const az=(i*2.4)%(Math.PI*2),pol=.15+(i%5)*.17;const x=Math.sin(pol)*Math.sin(az)*.13,z=Math.sin(pol)*Math.cos(az)*.13+.005,y=.1+Math.cos(pol)*.045;P(rr.clone(),m,head,x,y,z);}},
  spiky({P,m,head,cap}){cap.scale.set(1.02,1.06,1.04);const cg=new THREE.ConeGeometry(.022,.07,8);
    for(let i=0;i<12;i++){const az=(i*2.4)%(Math.PI*2),pol=.2+(i%4)*.2;const d=new THREE.Vector3(Math.sin(pol)*Math.sin(az),Math.cos(pol),Math.sin(pol)*Math.cos(az)+.25).normalize();
      const s=P(cg.clone(),m,head,d.x*.13,d.y*.13+.02,d.z*.12);s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);}},
  flow({P,m,head,cap,hang}){cap.scale.set(1.04,1.1,1.06);hang(.24,.04,.168,false);const f=P(sph(.07,20,14),m,head,.02,.112,.07);f.scale.set(1.4,.42,.9);f.rotation.z=-.2;},
  manbun({P,m,head,cap}){cap.scale.set(1.03,1.08,1.05);const b=P(sph(.05,18,14),m,head,0,.135,-.105);b.scale.set(1,.85,1);P(new THREE.TorusGeometry(.03,.009,8,18),m,head,0,.11,-.1).rotation.x=Math.PI/2-.6;},
  afro({P,m,head,cap}){cap.scale.set(1.06,1.12,1.08);const rr=new THREE.IcosahedronGeometry(.05,1);
    for(let i=0;i<46;i++){const pol=.15+(i%7)*.24,az=((i*.618)%1)*Math.PI*2;const r=.16,x=Math.sin(pol)*Math.sin(az)*r*1.05,y=Math.cos(pol)*r*1.05+.02,z=Math.sin(pol)*Math.cos(az)*r-.025;
      if(z>.05&&y<.09)continue;if(y<-.06)continue;P(rr.clone(),m,head,x,y,z);}},
};

/* ---------- helpers for guy clothes ---------- */
// how far the front of the top sticks out at height y (and side position x), so trims sit right on the cloth
const shellZ=(k,y,x=0)=>{const d=Math.max(0,Math.abs(y-.24)-.1),R2=.129*.129-d*d-(x/k.av.shellX)**2;const z=.8*Math.sqrt(Math.max(0,R2));
  // up by the neck, stay in front of the neck
  return y>.42&&Math.abs(x)<.056?Math.max(z,Math.sqrt(.0031-x*x)):z;};
// a flat strip that follows the front of the top: pts are [x,y,half width] from top to bottom
function frontStrip(k,m,pts,off=.002){const pos=[],idx=[];
  pts.forEach(([x,y,w],i)=>{for(const s of [-1,1]){const X=x+s*w;pos.push(X,y,shellZ(k,y,X)+off);}if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  m.side=THREE.DoubleSide;const o=k.P(g,m,k.spine);o.castShadow=false;return o;}
const lineOf=(x0,y0,x1,y1,w0,w1,n=6)=>Array.from({length:n+1},(_,i)=>{const t=i/n;return [x0+(x1-x0)*t,y0+(y1-y0)*t,w0+(w1-w0)*t];});
const isLight=c=>new THREE.Color(c).getHSL({}).l>.6;
const trimOf=c=>isLight(c)?'#2d2d3a':'#ffffff';
const frontDot=(k,m,y,x=0,r=.0065)=>k.P(sph(r,8,6),m,k.spine,x,y,shellZ(k,y,x)+.003);
// a belt that goes around the waist of the pants
const guyBelt=(k,c='#3a2a1e')=>{const b=beltRing(k,k.mat(c,'shiny'),k.hips,.142,.011,.045);b.scale.set(1,1,.8);k.P(box(.03,.022,.008),k.mat('#d9d9d9','metal'),k.hips,0,.045,.116);};
// a crew neck, a stand collar, shirt-collar points, cuffs and a waistband
const crewNeck=(k,m,r=.056,t=.011)=>{const o=k.P(new THREE.TorusGeometry(r,t,8,24),m,k.spine,0,.468,0);o.rotation.x=Math.PI/2;return o;};
const shirtCollar=(k,m)=>{crewNeck(k,m,.058,.009);for(const s of [-1,1])frontStrip(k,m,lineOf(s*.012,.463,s*.045,.418,.004,.016,3),.004);};
const cuffs=(k,m,r=.045,t=.014)=>{for(const a of k.arms)k.P(new THREE.TorusGeometry(r,t,8,20),m,a.el,0,-.19,0).rotation.x=Math.PI/2;};
const waistband=(k,m)=>{const o=beltRing(k,m,k.spine,.098,.014,.055);o.scale.set(k.av.shellX,1,.8);};
// pants: slim legs hug the leg; loose legs are open tubes so they hang wide
function looseLegs(k,m,r=.088,{thigh=.46,shin=.4,hem=1.06}={}){m.side=THREE.DoubleSide;
  for(const l of k.legs){k.P(new THREE.CylinderGeometry(r,r*1.02,thigh,28,1,true),m,l.hp,0,.02-thigh/2,0);
    if(shin)k.P(new THREE.CylinderGeometry(r*1.02,r*hem,shin,28,1,true),m,l.kn,0,.03-shin/2,0);}}
const sidePockets=(k,m,y,r=.088)=>{for(const l of k.legs){k.P(box(.022,.075,.07),m,l.hp,l.sx*(r+.008),y,0);k.P(box(.024,.012,.072),m,l.hp,l.sx*(r+.009),y+.04,0);}};
const ankleCuffs=(k,m,r=.062)=>{const X=k.av.legX;for(const l of k.legs)beltRing(k,m,l.kn,r,.016,-.33-X);};
const drawstrings=(k,y=.1)=>{const w=k.mat('#ffffff');for(const s of [-1,1]){const d=k.P(cyl(.0035,.0035,.07,6),w,k.hips,s*.018,y-.035,.12);d.rotation.z=s*.12;}};
// plaid fabric for the flannel
const PLAID_TEX={};
function plaidMat(k,c){const t=PLAID_TEX[c]||(PLAID_TEX[c]=canvasTex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(20,20,30,.45)';x.fillRect(0,40,w,26);x.fillRect(40,0,26,h);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(0,96,w,6);x.fillRect(96,0,6,h);
  x.fillStyle='rgba(20,20,30,.3)';x.fillRect(0,8,w,6);x.fillRect(8,0,6,h);},4));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:.85,sheen:.6,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.5});k.av.mats.push(m);return m;}
// a suit jacket: long sleeves, a hem over the hips, lapels and buttons. The shirt (and tie) show in the V.
function suitJacket(k,c,{shirt='#ffffff',lapel,tie,bow,pocket}={}){const jm=k.mat(c),dk=k.mat(lapel||shadeC(c,-.18),lapel?'shiny':'fabric');
  k.topShell(jm,'long');const hem=k.skirt(jm,.13,.152,{r0:.15,curve:1,folds:0,k:8});hem.scale.set(k.av.shellX/1.12*1.04,1,.82);
  frontStrip(k,k.mat(shirt),lineOf(0,.462,0,.27,.036,.002,8),.003);shirtCollar(k,k.mat(shirt));
  for(const s of [-1,1])frontStrip(k,dk,lineOf(s*.04,.452,s*.006,.262,.014,.006,8),.005);
  const bm=k.mat(shadeC(c,-.35),'shiny');frontDot(k,bm,.22);frontDot(k,bm,.16);
  for(const a of k.arms)k.P(new THREE.TorusGeometry(.044,.006,6,20),k.mat(shirt),a.el,0,-.2,0).rotation.x=Math.PI/2;
  if(tie){const tm=k.mat(tie,'shiny');k.P(sph(.011,10,8),tm,k.spine,0,.447,shellZ(k,.447)+.012).scale.set(1.1,1,.6);frontStrip(k,tm,[[0,.44,.007],[0,.4,.013],[0,.3,.016],[0,.27,.016],[0,.255,.0]],.007);}
  if(bow){const bm2=k.mat(bow,'shiny');for(const s of [-1,1]){const l=k.P(new THREE.ConeGeometry(.018,.04,12),bm2,k.spine,s*.02,.452,shellZ(k,.452)+.016);l.rotation.z=s*Math.PI/2;l.scale.z=.5;}k.P(sph(.008,8,6),bm2,k.spine,0,.452,shellZ(k,.452)+.018);}
  if(pocket){const pm=k.mat(pocket,'shiny');k.P(box(.03,.014,.006),pm,k.spine,.072,.355,shellZ(k,.355,.072)+.004).rotation.z=.1;}
  return jm;}
const slacks=(k,c)=>{const m=k.mat(c);k.waist(m);k.legsShell(m,.068,true);return m;};
// shoes
const shoeTrim=(k,m,c)=>k.legs.forEach(l=>{for(const s of [-1,1]){const b=k.P(box(.005,.014,.085),m,l.an,s*.064,-.025,.05);b.rotation.x=-.25;}});

/* ---------- the guy clothes ---------- */
const GUY_WEAR={
  /* suits and full outfits */
  // 🤵 Sharp suit: slim jacket, white shirt, a tie and a pocket square
  suit(k,c){suitJacket(k,c,{tie:isLight(c)?'#1f2a44':'#c0392b',pocket:'#ffffff'});slacks(k,c);},
  // 💼 Everyday suit: a relaxed blazer over an open-collar shirt
  suit2(k,c){suitJacket(k,c,{shirt:'#cfe3ff'});slacks(k,shadeC(c,-.1));},
  // 🎩 Tuxedo: satin lapels and a bow tie
  tux(k,c){suitJacket(k,c,{lapel:shadeC(c,-.3),bow:'#1a1a1a',pocket:'#ffffff'});const m=slacks(k,c);sideStripes(k,k.mat(shadeC(c,-.3),'shiny'),true);},
  // 🏃 Tracksuit: shiny zip jacket and track pants with white stripes
  tracksuit(k,c){const m=k.mat(c,'shiny'),w=k.mat(trimOf(c));k.topShell(m,'long');waistband(k,m);
    const col=k.P(new THREE.CylinderGeometry(.06,.064,.05,24,1,true),m,k.spine,0,.48,0);col.material.side=THREE.DoubleSide;
    frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,.47,0,.03,.004,.004,10),.004);
    for(const a of k.arms){k.P(box(.008,.17,.02),w,a.sh,a.sx*.048,-.13,0);k.P(box(.008,.15,.02),w,a.el,a.sx*.042,-.1,0);}
    k.waist(m);k.legsShell(m,.072,true);sideStripes(k,w,true);ankleCuffs(k,m);},
  // 🛋️ Sweatsuit: a matching hoodie and sweatpants
  sweatsuit(k,c){GUY_WEAR.ghoodie(k,c);GUY_WEAR.sweats(k,c);},
  // 🔧 Mechanic coveralls: one piece with a zipper, pockets, a belt and a name patch
  coveralls(k,c){const m=k.mat(c),dk=k.mat(shadeC(c,-.25));k.topShell(m,'long');shirtCollar(k,m);k.waist(m);k.legsShell(m,.074,true);
    frontStrip(k,k.mat('#c0c0c0','metal'),lineOf(0,.45,0,.04,.004,.004,10),.004);beltRing(k,dk,k.hips,.142,.012,.06).scale.set(1,1,.8);
    for(const s of [-1,1])frontStrip(k,dk,lineOf(s*.07,.37,s*.07,.31,.03,.03,2),.004);
    const nm=(k.av.name||'').slice(0,6).toUpperCase()||'ACE';const t=canvasTex(256,96,(x)=>{x.fillStyle='#ffffff';roundRect(x,4,4,248,88,40);x.fill();x.strokeStyle='#c0392b';x.lineWidth=8;x.stroke();x.fillStyle='#c0392b';x.font='bold 54px Fredoka, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(nm,128,52);});
    const pm=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7});k.av.mats.push(pm);frontStrip(k,pm,[[-.07,.395,.032],[-.07,.365,.032]],.006);
    {const g=k.av.parts[k.av.parts.length-1].geometry;g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,0,0,1,0],2));}
    k.legs.forEach(l=>k.P(box(.022,.07,.06),dk,l.hp,l.sx*.08,-.2,0));},
  // 🏀 Basketball uniform: a numbered tank and long shorts with stripes
  bballuni(k,c){const m=k.mat(c),w=k.mat(trimOf(c));k.topShell(m,'strap');for(const a of k.arms){const st=k.P(box(.045,.12,.012),m,k.spine,a.sx*.07,.41,0);st.scale.z=8;}
    frontStrip(k,w,lineOf(-.04,.44,0,.39,.005,.006,3),.003);frontStrip(k,w,lineOf(.04,.44,0,.39,.005,.006,3),.003);frontText(k,'23',trimOf(c),.27,.15);
    GUY_WEAR.gymshorts(k,c,.36);},

  /* tops */
  // 👕 T-shirt with a crew neck and a little longer sleeves
  gtee(k,c){const m=k.mat(c);k.topShell(m,'short');for(const a of k.arms)k.P(capTop(.052,.04),m,a.sh,0,-.04,0);crewNeck(k,m);},
  // ⚡ Graphic tee
  graphictee(k,c){GUY_WEAR.gtee(k,c);const t=canvasTex(128,128,(x)=>{x.font='88px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('⚡',64,70);});
    const dm=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7,depthWrite:false});k.av.mats.push(dm);k.P(new THREE.PlaneGeometry(.13,.13),dm,k.spine,0,.28,.107).castShadow=false;},
  // ⛳ Polo: collar points, a button placket and a tiny logo
  polo(k,c){const m=k.mat(c);k.topShell(m,'short');shirtCollar(k,k.mat(c));frontStrip(k,k.mat(shadeC(c,-.08)),lineOf(0,.46,0,.36,.012,.012,4),.003);
    const bm=k.mat('#ffffff','shiny');frontDot(k,bm,.42,0,.005);frontDot(k,bm,.38,0,.005);frontDot(k,k.mat(trimOf(c),'shiny'),.37,.075,.008);},
  // 👔 Button-up: collar, buttons down the front and cuffs
  buttonup(k,c){const m=k.mat(c);k.topShell(m,'long');shirtCollar(k,m);const bm=k.mat('#ffffff','shiny');[.43,.37,.31,.25,.19,.13].forEach(y=>frontDot(k,bm,y,0,.0045));cuffs(k,m,.043,.01);
    frontStrip(k,k.mat(shadeC(c,-.1)),lineOf(0,.45,0,.08,.0015,.0015,8),.0035);},
  // 🍁 Flannel shirt worn open over a white tee
  flannelover(k,c){const m=plaidMat(k,c);k.topShell(m,'long');frontStrip(k,k.mat('#ffffff'),lineOf(0,.462,0,.03,.03,.034,10),.003);crewNeck(k,k.mat('#ffffff'),.054,.008);
    for(const s of [-1,1])frontStrip(k,k.mat(shadeC(c,-.2)),lineOf(s*.034,.462,s*.038,.03,.004,.004,10),.004);cuffs(k,m,.043,.012);},
  // 🧶 Crewneck sweatshirt with ribbed neck, cuffs and waistband, and your first letter on the chest
  crewneck(k,c){const m=k.mat(c),rib=k.mat(shadeC(c,-.12));k.topShell(m,'long');crewNeck(k,rib,.056,.013);cuffs(k,rib);waistband(k,rib);
    frontText(k,((k.av.name||'B').trim()[0]||'B').toUpperCase(),trimOf(c),.3,.12);},
  // 🧥 Hoodie: hood, front pocket and drawstrings
  ghoodie(k,c){const m=k.mat(c),rib=k.mat(shadeC(c,-.12));k.topShell(m,'long');k.P(sph(.1,16,12,0,Math.PI*2,0,Math.PI*.6),m,k.spine,0,.44,-.07).rotation.x=-1.9;
    frontStrip(k,rib,lineOf(0,.2,0,.09,.06,.075,3),.006);cuffs(k,rib);waistband(k,rib);
    const w=k.mat('#ffffff');for(const s of [-1,1])frontStrip(k,w,lineOf(s*.022,.45,s*.024,.36,.0035,.0035,3),.005);},
  // 🤐 Zip hoodie: a hoodie with a zipper all the way down
  ziphoodie(k,c){GUY_WEAR.ghoodie(k,c);frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,.46,0,.03,.004,.004,10),.008);},
  // ⛷️ Quarter-zip: a stand-up collar with a short zipper
  quarterzip(k,c){const m=k.mat(c);k.topShell(m,'long');const col=k.P(new THREE.CylinderGeometry(.058,.064,.055,24,1,true),m,k.spine,0,.485,0);col.material.side=THREE.DoubleSide;
    frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,.47,0,.34,.004,.004,5),.004);k.P(box(.008,.02,.004),k.mat('#d9d9d9','metal'),k.spine,.006,.33,shellZ(k,.33)+.008);cuffs(k,m,.044,.01);waistband(k,m);},
  // ❄️ Puffer jacket: puffy stitched rings, a tall collar and puffy sleeves
  puffer(k,c){const m=k.mat(c,'shiny');const b=k.P(new THREE.CapsuleGeometry(.14,.2,6,24),m,k.spine,0,.24,0);b.scale.set(k.av.shellX*1.02,1,.86);
    for(const y of [.16,.24,.32]){const r=k.P(new THREE.TorusGeometry(.14,.02,8,32),m,k.spine,0,y,0);r.rotation.x=Math.PI/2;r.scale.set(k.av.shellX*1.03,.88,1);}
    const col=k.P(new THREE.CylinderGeometry(.066,.075,.07,24,1,true),m,k.spine,0,.48,0);col.material.side=THREE.DoubleSide;
    for(const a of k.arms){k.P(capTop(.06,.17),m,a.sh);k.P(capTop(.054,.15),m,a.el);k.P(new THREE.TorusGeometry(.058,.016,8,20),m,a.sh,0,-.13,0).rotation.x=Math.PI/2;k.P(new THREE.TorusGeometry(.052,.015,8,20),m,a.el,0,-.1,0).rotation.x=Math.PI/2;}
    const hem=k.skirt(m,.1,.158,{r0:.152,curve:1,folds:0,k:8});hem.scale.set(k.av.shellX/1.12*1.05,1,.84);
    frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(0,.5,0,.0,.004,.004,10),.02);},

  /* bottoms */
  // 👖 Khakis with a belt
  khakis(k,c){const m=k.mat(c);k.waist(m);k.legsShell(m,.07,true);guyBelt(k);},
  // 👖 Tight jeans
  slimjeans(k,c){const m=k.mat(c,'denim');k.waist(m);k.legsShell(m,.066,true);guyBelt(k);},
  // 👖 Baggy jeans: wide legs that stack over the shoes
  baggyjeans(k,c){const m=k.mat(c,'denim');k.waist(m);looseLegs(k,m,.09,{hem:1.08});guyBelt(k,'#1a1a1a');},
  // 🩳 Cargo shorts down to the knee, with big side pockets
  cargoshorts(k,c){const m=k.mat(c);k.waist(m);looseLegs(k,m,.086,{thigh:.44,shin:0});sidePockets(k,k.mat(shadeC(c,-.1)),-.24,.086);guyBelt(k);},
  // 🏃 Gym shorts with a stripe down the side
  gymshorts(k,c,len=.27){const m=k.mat(c);k.waist(m);looseLegs(k,m,.088,{thigh:len,shin:0});const w=k.mat(trimOf(c));
    for(const l of k.legs){k.P(box(.008,len,.02),w,l.hp,l.sx*.09,.02-len/2,0);beltRing(k,w,l.hp,.089,.005,.02-len+.006);}drawstrings(k);},
  // 😴 Sweatpants with cuffs at the ankles
  sweats(k,c){const m=k.mat(c);k.waist(m);k.legsShell(m,.078,true);ankleCuffs(k,k.mat(shadeC(c,-.1)),.064);drawstrings(k);},
  // 🪖 Cargo pants: loose legs with pockets on the thighs
  cargopants(k,c){const m=k.mat(c);k.waist(m);looseLegs(k,m,.084,{hem:.84});sidePockets(k,k.mat(shadeC(c,-.12)),-.24,.084);guyBelt(k,'#1a1a1a');},
  // 🏖️ Swim trunks with a leaf print
  swimtrunks(k,c){const m=printMat(k,c,'leaves');k.waist(m);m.side=THREE.DoubleSide;for(const l of k.legs)k.P(new THREE.CylinderGeometry(.086,.09,.3,28,1,true),m,l.hp,0,.02-.15,0);drawstrings(k);},

  /* shoes */
  // 👟 Sneakers: chunky white soles and a stripe on the side
  kicks(k,c){const m=k.mat(c);shoeShell(k,m,.88,1.05);solePad(k,k.mat(isLight(c)?'#f2f2f2':'#ffffff','shiny'),.036,.118,.235);shoeTrim(k,k.mat(isLight(c)?'#3a5bd9':'#ffffff','shiny'));
    k.legs.forEach(l=>{for(let i=0;i<3;i++)k.P(box(.036,.005,.006),k.mat('#ffffff'),l.an,0,.012+i*.016,.095-i*.012);});},
  // 🛹 Skate shoes: flat and wide with a gum sole
  skateshoes(k,c){const m=k.mat(c);shoeShell(k,m,.82,1.07);solePad(k,k.mat('#f4f1e8'),.03,.12,.24);shoeTrim(k,k.mat('#ffffff'));},
  // 🩴 Slides with white socks
  slides(k,c){const w=k.mat('#ffffff');shoeShell(k,w,.78,.98);bootLeg(k,w,.05,.12);const m=k.mat(c,'shiny');
    k.legs.forEach(l=>{k.P(new RoundedBoxGeometry(.115,.024,.235,2,.008),m,l.an,0,-.05,.045);k.P(new RoundedBoxGeometry(.13,.045,.095,2,.016),m,l.an,0,-.02,.075);});},
  // 👞 Dress shoes: polished with a thin dark sole
  oxfords(k,c){const m=k.mat(c,'shiny');m.clearcoat=1;shoeShell(k,m,.72,1.02);solePad(k,k.mat('#1a1a1a','shiny'),.016,.11,.23);
    k.legs.forEach(l=>k.P(box(.03,.004,.03),k.mat(shadeC(c,-.3)),l.an,0,.012,.085));},
  // 🥿 Loafers: low with a strap across the top
  loafers(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.64,1.02);solePad(k,k.mat('#2a1a10','shiny'),.014,.11,.23);k.legs.forEach(l=>k.P(box(.08,.008,.02),k.mat(shadeC(c,-.25),'shiny'),l.an,0,.006,.085));},
  // 🥾 Work boots: tall, laced, with a thick sole
  workboots(k,c){const m=k.mat(c);shoeShell(k,m,.95,1.08);bootLeg(k,m,.064,.13);solePad(k,k.mat('#3a2a1e','shiny'),.04,.122,.24);
    const lm=k.mat(shadeC(c,-.4));k.legs.forEach(l=>{for(let i=0;i<4;i++)k.P(box(.04,.005,.006),lm,l.an,0,.0+i*.02,.1-i*.013);beltRing(k,k.mat(shadeC(c,-.15)),l.kn,.066,.012,-.41-k.av.legX+.13);});},

  /* hats */
  // 🔄 Backwards cap
  backcap(k,c){const m=k.mat(c);k.P(new THREE.SphereGeometry(.146,28,14,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.025,-.005).scale.set(1.02,.9,1.04);
    const b=k.P(cyl(.1,.1,.012,24),m,k.head,0,.045,-.15);b.scale.z=.9;b.rotation.x=-.2;k.P(sph(.012,8,6),m,k.head,0,.158,-.005);},
  // 🧢 Snapback: a taller crown and a flat brim
  snapback(k,c){const m=k.mat(c);k.P(new THREE.SphereGeometry(.15,28,14,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.025,-.005).scale.set(1.02,1,1.04);
    const b=k.P(cyl(.11,.11,.012,24),m,k.head,0,.045,.15);b.scale.z=.85;k.P(sph(.012,8,6),m,k.head,0,.175,-.005);frontText(Object.assign({},k,{spine:k.head}),'★',trimOf(c),.1,.07);
    const lt=k.av.parts[k.av.parts.length-1];lt.position.z=.148;lt.rotation.x=-.25;},
  // 🪣 Bucket hat: a soft crown with a brim that slopes down all around
  bucket(k,c){const m=k.mat(c);m.side=THREE.DoubleSide;k.P(new THREE.CylinderGeometry(.13,.152,.1,32,1,false),m,k.head,0,.12,-.005);k.P(new THREE.CylinderGeometry(.152,.215,.05,32,1,true),m,k.head,0,.05,-.005);
    beltRing(k,k.mat(shadeC(c,-.2)),k.head,.15,.008,.075);},

  /* extras */
  // ⛓️ Chain necklace
  chain(k,c){const m=k.mat(c,'metal'),g=new THREE.TorusGeometry(.0085,.0028,6,12);
    for(let i=0;i<26;i++){const a=i/26*Math.PI*2;const o=k.P(g.clone(),m,k.spine,Math.sin(a)*.075,.452-Math.max(0,Math.cos(a))*.06,Math.cos(a)*.066+(Math.cos(a)>0?.012:0));o.rotation.y=a;if(i%2)o.rotation.x=Math.PI/2;o.castShadow=false;}},
  // ⌚ Watch on the left wrist
  watch(k,c){const a=k.arms[1],m=k.mat(c,'metal');k.P(new THREE.TorusGeometry(.037,.008,8,20),k.mat('#2d2d3a','shiny'),a.el,0,-.2,0).rotation.x=Math.PI/2;
    const f=k.P(cyl(.016,.016,.01,20),m,a.el,a.sx*.04,-.2,0);f.rotation.z=Math.PI/2;const gl=k.P(cyl(.012,.012,.004,20),k.mat('#cfefff','glass'),a.el,a.sx*.046,-.2,0);gl.rotation.z=Math.PI/2;},
  // 🕶️ Sunglasses
  shades(k,c){const m=k.mat(c,'shiny'),lens=k.mat('#1a1a2a','shiny');lens.metalness=.6;lens.roughness=.05;
    for(const s of [-1,1]){k.P(new RoundedBoxGeometry(.05,.03,.006,2,.008),lens,k.head,s*.045,.008,.135);const arm=k.P(box(.005,.005,.13),m,k.head,s*.08,.012,.07);}
    k.P(box(.12,.007,.007),m,k.head,0,.024,.136);},
  // 🎧 Headphones over the ears
  headphones(k,c){const m=k.mat(c,'shiny');const b=k.P(new THREE.TorusGeometry(.15,.011,8,32,Math.PI),m,k.head,0,.02,-.01);
    for(const s of [-1,1]){const cup=k.P(cyl(.042,.042,.03,24),m,k.head,s*.14,.0,-.01);cup.rotation.z=Math.PI/2;const pad=k.P(cyl(.036,.036,.012,24),k.mat('#2d2d3a'),k.head,s*.122,.0,-.01);pad.rotation.z=Math.PI/2;}},
  // 🎒 Backpack with straps over the shoulders
  backpack(k,c){const m=k.mat(c),dk=k.mat(shadeC(c,-.2));k.P(new RoundedBoxGeometry(.22,.27,.1,3,.03),m,k.spine,0,.26,-.155);k.P(new RoundedBoxGeometry(.16,.1,.04,3,.015),dk,k.spine,0,.18,-.21);
    for(const s of [-1,1]){frontStrip(k,dk,lineOf(s*.075,.45,s*.085,.2,.012,.012,6),.006);const t=k.P(new THREE.TorusGeometry(.04,.012,6,16,Math.PI),dk,k.spine,s*.08,.45,-.03);t.rotation.y=Math.PI/2;}},
  // 💪 Wristbands on both wrists
  wristbands(k,c){const m=k.mat(c);for(const a of k.arms){const w=k.P(new THREE.CylinderGeometry(.042,.042,.04,20),m,a.el,0,-.19,0);}},
  // 🛹 Skateboard carried in the right hand
  skateboard(k,c){const a=k.arms[0];const g=new THREE.Group();g.position.set(a.sx*.03,-.06,0);g.rotation.z=a.sx*.08;a.hand.add(g);k.av.parts.push(g);g.geometry={dispose(){}};
    k.P(new RoundedBoxGeometry(.014,.62,.18,2,.006),k.mat(c,'shiny'),g,0,0,0);k.P(new RoundedBoxGeometry(.004,.6,.17,2,.002),k.mat('#2d2d3a'),g,-a.sx*.009,0,0);
    const wm=k.mat('#ffd23f','shiny');for(const y of [-.21,.21])for(const z of [-.06,.06]){const w=k.P(cyl(.022,.022,.02,12),wm,g,a.sx*.03,y,z);w.rotation.z=Math.PI/2;}},
};
