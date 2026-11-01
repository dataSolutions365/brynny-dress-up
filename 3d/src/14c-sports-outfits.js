/* ================= SPORTS OUTFITS =================
   Basketball and baseball clothes for the closet (the court and batting cage are in 12c-place-sports.js).
   Each item goes in the normal catalog lists and is built like the other 2D-game outfits in 14b-outfits-2d.js. */
TOPS.push(['bballjersey','🏀','Basketball jersey','#8e6cff'],['baseballtop','⚾','Baseball jersey','#ffffff']);
BOTTOMS.push(['bballshorts','🏀','Basketball shorts','#8e6cff'],['baseballpants','⚾','Baseball pants','#ffffff']);
SHOES.push(['courtkicks','🏀','Basketball sneakers','#ff6fae'],['ballcleats','⚾','Baseball cleats','#2d2d3a']);
HATS.push(['helmet','⛑️','Batting helmet','#3a5bd9']);
EXTRAS.push(['glove','🧤','Baseball glove','#a0622d']);
// guys get the same sports gear in their closet (14c-guy.js)
GUY_TOPS.push(['bballjersey','🏀','Basketball jersey','#d62839'],['baseballtop','⚾','Baseball jersey','#ffffff']);
GUY_BOTTOMS.push(['bballshorts','🏀','Basketball shorts','#d62839'],['baseballpants','⚾','Baseball pants','#ffffff']);
GUY_SHOES.push(['courtkicks','🏀','Basketball sneakers','#ffffff'],['ballcleats','⚾','Baseball cleats','#2d2d3a']);
GUY_HATS.push(['helmet','⛑️','Batting helmet','#3a5bd9']);
GUY_EXTRAS.push(['glove','🧤','Baseball glove','#a0622d']);
// the trim color: white on colored clothes, pink on white ones
const sportTrim=c=>{const h={};new THREE.Color(c).getHSL(h);return h.l>.85?'#ff4d8d':'#ffffff';};
// thin up-and-down pinstripes for the baseball uniform
const PIN_TEX={};
function pinMat(k,c){const t=PIN_TEX[c]||(PIN_TEX[c]=canvasTex(128,128,(x)=>{x.fillStyle=c;x.fillRect(0,0,128,128);x.fillStyle=sportTrim(c)==='#ffffff'?'rgba(255,255,255,.55)':'rgba(58,91,217,.45)';for(let i=0;i<128;i+=16)x.fillRect(i,0,3,128);},3));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:.75,sheen:.6});k.av.mats.push(m);return m;}
Object.assign(OUTFITS2D,{
  // 🏀 Basketball jersey: a sleeveless jersey with wide straps, trim around the neck and arms, and number 23
  bballjersey(k,c){const m=k.mat(c,'shiny'),tr=k.mat(sportTrim(c),'shiny');k.topShell(m,'strap');
    for(const a of k.arms){const st=k.P(box(.05,.13,.012),m,k.spine,a.sx*.07,.41,0);st.scale.z=8;const r=k.P(new THREE.TorusGeometry(.055,.008,6,20),tr,k.spine,a.sx*.125,.38,0);r.rotation.y=Math.PI/2;}
    for(const s of [-1,1]){const v=k.P(box(.012,.08,.01),tr,k.spine,s*.022,.43,.096);v.rotation.z=s*.55;}
    const hem=k.P(new THREE.TorusGeometry(.142,.01,6,32),tr,k.spine,0,.08,0);hem.rotation.x=Math.PI/2;hem.scale.set(1.04,.82,1);
    frontText(k,'23',sportTrim(c),.27,.17);},
  // ⚾ Baseball jersey: pinstripes, short sleeves, a row of buttons and a little ball on the chest
  baseballtop(k,c){const m=pinMat(k,c),tr=k.mat(sportTrim(c)==='#ffffff'?'#3a5bd9':'#ffffff','shiny');k.topShell(m,'short');
    for(const a of k.arms){const r=k.P(new THREE.TorusGeometry(.05,.008,6,20),tr,a.sh,0,-.06,0);r.rotation.x=Math.PI/2;}
    buttons(k,tr,k.spine,0,[.12,.19,.26,.33],.104,.006);
    const col=k.P(new THREE.TorusGeometry(.05,.01,6,20,Math.PI),tr,k.spine,0,.45,.03);col.rotation.x=Math.PI/2+.4;col.rotation.z=Math.PI;
    frontText(k,'⚾',sportTrim(c),.31,.08);},
  // 🏀 Basketball shorts: long and loose down to the knees, with a stripe down each side
  bballshorts(k,c){const m=k.mat(c,'shiny');k.waist(m);for(const l of k.legs){const s=k.P(capTop(.084,.22+k.av.legX),m,l.hp);s.scale.set(1.08,1,1.05);}
    const tr=k.mat(sportTrim(c),'shiny');for(const l of k.legs)k.P(box(.012,.24,.03),tr,l.hp,l.sx*.088,-.14,0);
    const wb=k.P(new THREE.TorusGeometry(.137,.012,6,32),tr,k.hips,0,.07,0);wb.rotation.x=Math.PI/2;wb.scale.set(1.06,.84,1);},
  // ⚾ Baseball pants: down to the knee, with a belt and tall colored socks
  baseballpants(k,c){const m=pinMat(k,c),sock=k.mat(sportTrim(c)==='#ffffff'?'#3a5bd9':'#ff4d8d');k.waist(m);
    for(const l of k.legs){k.P(capTop(.075,.3+k.av.legX),m,l.hp);k.P(capTop(.058,.28+k.av.legX),sock,l.kn);}
    const belt=k.P(new THREE.TorusGeometry(.138,.014,6,32),k.mat('#2d2d3a','shiny'),k.hips,0,.07,0);belt.rotation.x=Math.PI/2;belt.scale.set(1.06,.84,1);},
  // 🏀 Basketball sneakers: high-tops with a bright sole and a stripe on the side
  courtkicks(k,c){const m=k.mat(c,'shiny'),w=k.mat('#ffffff','shiny');shoeShell(k,m);solePad(k,w,.035);bootLeg(k,m,.058,.08);
    k.legs.forEach(l=>{const s=k.P(box(.008,.025,.12),w,l.an,l.sx*.064,-.015,.04);s.rotation.x=-.3;for(let i=0;i<3;i++)k.P(box(.04,.005,.006),w,l.an,0,i*.018,.1-i*.012);});},
  // ⚾ Baseball cleats: low, with studs underneath
  ballcleats(k,c){const m=k.mat(c,'shiny'),w=k.mat('#ffffff');shoeShell(k,m,.75);k.legs.forEach(l=>{k.P(box(.01,.025,.1),w,l.an,l.sx*.06,-.02,.05);for(const z of [-.02,.04,.1,.14])for(const x of [-.03,.03])k.P(cyl(.007,.005,.02,6),k.mat('#c0c0c0','metal'),l.an,x,-.07,z);});},
  // ⛑️ Batting helmet: shiny, with a short brim and an ear flap on one side
  helmet(k,c){const m=k.mat(c,'shiny');const h=k.P(new THREE.SphereGeometry(.158,28,16,0,Math.PI*2,0,Math.PI*.55),m,k.head,0,.02,-.005);h.scale.set(1.02,.95,1.06);
    const b=k.P(cyl(.1,.1,.012,24,1),m,k.head,0,.045,.135);b.scale.z=.8;b.rotation.x=.18;
    const f=k.P(sph(.06,16,12),m,k.head,.13,-.03,0);f.scale.set(.45,1,1.1);
    const lg=new THREE.Mesh(new THREE.CircleGeometry(.03,20),new THREE.MeshBasicMaterial({map:canvasTex(64,64,(x)=>{x.font='48px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('⭐',32,36);}),transparent:true}));
    lg.position.set(0,.11,.115);lg.rotation.x=-.5;k.head.add(lg);k.av.parts.push(lg);},
  // 🧤 Baseball glove on the left hand
  glove(k,c){const a=k.arms[1],m=k.mat(c),lace=k.mat('#5a3418');const g=k.P(new RoundedBoxGeometry(.11,.14,.06,3,.025),m,a.hand,0,-.06,.01);
    for(let i=0;i<4;i++){const f=k.P(new THREE.CapsuleGeometry(.014,.05,4,8),m,a.hand,-.035+i*.023,-.15,.01);f.rotation.z=(i-1.5)*.08;}
    const th=k.P(new THREE.CapsuleGeometry(.016,.05,4,8),m,a.hand,.06,-.06,.02);th.rotation.z=-.6;
    k.P(box(.08,.004,.064),lace,a.hand,0,-.11,.012);},
});
// one tap "suit up" looks for each sport (the closet still lets you change any piece)
const SPORT_LOOKS={
  court:{top:{id:'bballjersey',c:'#8e6cff'},bottom:{id:'bballshorts',c:'#8e6cff'},shoes:{id:'courtkicks',c:'#ff6fae'},hat:{id:'sweatband',c:'#ff4d8d'}},
  batting:{top:{id:'baseballtop',c:'#ffffff'},bottom:{id:'baseballpants',c:'#ffffff'},shoes:{id:'ballcleats',c:'#2d2d3a'},hat:{id:'helmet',c:'#ff4d8d'},glove:'#a0622d'}};
const GUY_SPORT_LOOKS={
  court:{top:{id:'bballjersey',c:'#d62839'},bottom:{id:'bballshorts',c:'#d62839'},shoes:{id:'courtkicks',c:'#ffffff'},hat:{id:'sweatband',c:'#ffffff'}},
  batting:{top:{id:'baseballtop',c:'#ffffff'},bottom:{id:'baseballpants',c:'#ffffff'},shoes:{id:'ballcleats',c:'#2d2d3a'},hat:{id:'helmet',c:'#3a5bd9'},glove:'#a0622d'}};
const sportLook=zid=>(isGuy(SAVE.look)?GUY_SPORT_LOOKS:SPORT_LOOKS)[zid];
