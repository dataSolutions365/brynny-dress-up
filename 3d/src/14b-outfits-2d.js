/* ================= OUTFITS FROM THE 2D GAME ================= */
// The 2D dress-up game's outfits, rebuilt as real 3D clothes. Each one is a function (kit,color) that adds its pieces,
// like the holiday costumes in seasons.js. kit has the avatar's body parts and the same helpers the closet uses:
// P(geo,mat,parent,x,y,z), mat(color,kind), topShell(mat,sleeve), skirt(mat,len,width,opts), waist(mat), legsShell(mat,r,full).

// printed fabric: a little pattern drawn on the cloth color (made once per color and pattern, then shared)
const PRINT_TEX={};
function printMat(kit,c,kind,o={}){const key=kind+c;const t=PRINT_TEX[key]||(PRINT_TEX[key]=canvasTex(256,256,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);
    const R=(a,b)=>a+Math.random()*(b-a);
    if(kind==='flowers'){for(let i=0;i<14;i++){const X=R(0,w),Y=R(0,h),r=R(7,11);x.fillStyle=Math.random()<.5?'#ffd23f':'#ff8a1f';for(let k=0;k<5;k++){const a=k/5*Math.PI*2;x.beginPath();x.arc(X+Math.cos(a)*r*.6,Y+Math.sin(a)*r*.6,r*.45,0,7);x.fill();}x.fillStyle='#fff3b0';x.beginPath();x.arc(X,Y,r*.3,0,7);x.fill();}}
    if(kind==='moons'){x.fillStyle='#fff3b0';for(let i=0;i<16;i++){const X=R(0,w),Y=R(0,h);if(i%2){x.font='22px serif';x.fillText('★',X,Y);}else{x.beginPath();x.arc(X,Y,10,0,7);x.fill();x.fillStyle=c;x.beginPath();x.arc(X+5,Y-3,9,0,7);x.fill();x.fillStyle='#fff3b0';}}}
    if(kind==='leaves'){x.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<22;i++){x.save();x.translate(R(0,w),R(0,h));x.rotate(R(0,6.3));x.beginPath();x.ellipse(0,0,9,4,0,0,7);x.fill();x.restore();}}
    if(kind==='wraps'){for(let y=0;y<h;y+=R(10,16)){x.strokeStyle='rgba(120,100,70,.35)';x.lineWidth=R(1,2.5);x.beginPath();x.moveTo(0,y);x.lineTo(w,y+R(-6,6));x.stroke();}
      for(let i=0;i<6;i++){x.strokeStyle='rgba(120,100,70,.25)';x.beginPath();const y=R(0,h);x.moveTo(R(0,w),y);x.lineTo(R(0,w),y+R(8,20));x.stroke();}}
    if(kind==='stripes'){x.fillStyle='rgba(120,130,150,.45)';for(let y=0;y<h;y+=32)x.fillRect(0,y,w,12);}
    if(kind==='spots'){x.fillStyle='rgba(255,255,255,.95)';for(let i=0;i<40;i++){x.beginPath();x.arc(R(0,w),R(0,h),R(3,5),0,7);x.fill();}}
  },o.rep||3));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:o.rough??.8,sheen:1,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.5});kit.av.mats.push(m);return m;}
const shadeC=(c,k)=>{const x=new THREE.Color(c);return k<0?'#'+x.multiplyScalar(1+k).getHexString():'#'+x.lerp(new THREE.Color('#ffffff'),k).getHexString();};
const beltRing=(kit,m,parent,r,t,y,z=0)=>{const o=kit.P(new THREE.TorusGeometry(r,t,8,32),m,parent,0,y,z);o.rotation.x=Math.PI/2;return o;};

// big printed letters or numbers on the front of a top (like a jersey number)
function frontText(k,txt,col,y=.28,size=.11){const t=canvasTex(128,128,(x)=>{x.font='bold 84px Fredoka, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle=col;x.fillText(txt,64,70);});
  const m=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7,depthWrite:false});k.av.mats.push(m);k.P(new THREE.PlaneGeometry(size,size),m,k.spine,0,y,.106).castShadow=false;}
const buttons=(k,m,parent,x,ys,z,r=.007)=>ys.forEach(y=>k.P(sph(r,8,6),m,parent,x,y,z));
const sideStripes=(k,m,full)=>{for(const l of k.legs){const X=k.av.legX;k.P(box(.008,full?.3+X:.07,.02),m,l.hp,l.sx*.071,full?-(.3+X)/2-.03:-.06,0);if(full)k.P(box(.008,.3+X,.02),m,l.kn,l.sx*.064,-(.3+X)/2-.02,0);}};
// a shoe shell around each foot (sy: how tall), and a boot leg up the shin (len: how high)
const shoeShell=(k,m,sy=.82,grow=1)=>k.legs.map(l=>{const sh=k.P(sph(.057*grow,16,12),m,l.an,0,-.012,.045);sh.scale.set(1.12,sy,2.05);return sh;});
const bootLeg=(k,m,r,len,fz=0)=>k.legs.map(l=>{const X=k.av.legX,g=new THREE.CylinderGeometry(r,r*1.04,len,32,fz?16:1);const b=k.P(fz?fuzz(g,fz,110):g,m,l.kn,0,-.37-X+len/2,0);return b;});
const solePad=(k,m,h=.03,w=.11,d=.22)=>k.legs.forEach(l=>k.P(box(w,h,d),m,l.an,0,-.06+h/2-.005,.045));
const OUTFITS2D={
  // 🤸 Gymnast: a long-sleeved shiny leotard with a sweep of rhinestones
  leotard(k,c){const m=k.mat(c,'shiny');k.topShell(m,'long');k.waist(m);
    const gm=k.mat('#ffffff','gem');for(let i=0;i<7;i++){const a=-.9+i*.3;k.P(sph(.007,8,6),gm,k.spine,Math.sin(a)*.1,.36-i*.02,.093+Math.cos(a)*.008);}},
  // 📣 Cheer outfit: tank with a white chevron, white belt and a pleated skirt
  cheer(k,c){const m=k.mat(c),w=k.mat('#ffffff','shiny');k.topShell(m,'strap');
    for(const s of [-1,1]){const v=k.P(box(.012,.11,.01),w,k.spine,s*.032,.3,.1);v.rotation.z=s*.95;}
    beltRing(k,w,k.hips,.14,.012,.1);k.skirt(m,.3,.27,{curve:.6,folds:.1,k:22});beltRing(k,w,k.hips,.27,.008,-.19);},
  // 🎾 Tennis dress: white with green trim and a crisp pleated skirt
  tennis(k,c){const m=k.mat(c),g=k.mat('#7ee081','shiny');k.topShell(m,'strap');beltRing(k,g,k.spine,.065,.006,.44).scale.set(1.3,1,1);
    k.skirt(m,.3,.26,{curve:.6,folds:.08,k:22});beltRing(k,g,k.hips,.26,.007,-.19);k.P(sph(.022,12,10),k.mat('#d4f03c','fabric'),k.arms[1].hand,0,-.08,.03);},
  // 🩱 Swimsuit with little sunflowers
  swimsuit(k,c){const m=printMat(k,c,'flowers',{rough:.35});k.topShell(m,'strap');k.waist(m);},
  // ✨ Sequin dress: a sparkly mini
  minidress(k,c){const m=k.mat(c,'sparkle');k.topShell(m,'strap');k.skirt(m,.36,.25,{curve:1,folds:.03,k:12});},
  // 👖 Jumpsuit: wide flared legs with a belt and a gold buckle
  jumpsuit(k,c){const m=k.mat(c),X=k.av.legX;k.topShell(m,'strap');k.waist(m);k.legsShell(m,.074,true);
    for(const l of k.legs)k.P(new THREE.CylinderGeometry(.074,.11,.2,24,1,true),m,l.kn,0,-.3-X,0).material.side=THREE.DoubleSide;
    beltRing(k,k.mat(shadeC(c,-.25)),k.hips,.14,.012,.1);k.P(box(.03,.024,.012),k.mat('#ffd23f','metal'),k.hips,0,.1,.132);k.av.legAmp=.4;},
  // 🌙 Pajamas with moons and stars
  pajamas(k,c){const m=printMat(k,c,'moons');k.topShell(m,'long');k.waist(m);k.legsShell(m,.072,true);beltRing(k,k.mat('#ffffff'),k.spine,.06,.01,.45);},
  // 🌹 Red carpet gown: one long satin column with a flower on the shoulder
  redcarpet(k,c){const m=k.mat(c,'shiny');k.topShell(m,'strap');k.skirt(m,.92,.36,{curve:1.2,folds:.05,k:8});
    const f=k.mat(shadeC(c,.45),'shiny');for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.P(sph(.012,8,6),f,k.spine,.075+Math.cos(a)*.012,.44+Math.sin(a)*.012,.06);}k.P(sph(.008,8,6),k.mat('#ffd23f','shiny'),k.spine,.075,.44,.068);k.av.legAmp=.3;},
  // 🐶 Space pup suit: a cozy onesie with a pale tummy and a curly tail
  spacepup(k,c){const m=k.mat(c),lt=k.mat(shadeC(c,.55));k.topShell(m,'long');k.waist(m);k.legsShell(m,.072,true);
    k.P(sph(.08,16,12),lt,k.spine,0,.22,.088).scale.set(.75,1.35,.3);
    const t=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.02,-.11),new THREE.Vector3(.04,.05,-.2),new THREE.Vector3(.1,.12,-.22),new THREE.Vector3(.12,.2,-.17)]);k.P(new THREE.TubeGeometry(t,16,.018,8,false),m,k.hips);},
  // 🌺 Island dress: red with white leaves, straight and breezy
  island(k,c){const m=printMat(k,c,'leaves');k.topShell(m,'strap');k.skirt(m,.42,.22,{curve:1,folds:.04,k:10});},
  // 🧛 Vampire gown: black with a red neckline, red belt and cuffs, and a pointy hem
  vampire(k,c){const m=k.mat(c),r=k.mat('#b3001b','shiny');k.topShell(m,'long');
    for(const s of [-1,1]){const v=k.P(box(.03,.12,.01),r,k.spine,s*.016,.37,.1);v.rotation.z=-s*.25;}
    beltRing(k,r,k.hips,.14,.014,.1);for(const a of k.arms)beltRing(k,r,a.el,.046,.012,-.17);
    k.skirt(m,.9,.44,{curve:.8,folds:.16,k:7,seg:14});k.P(sph(.012,10,8),r,k.spine,0,.45,.07);k.av.legAmp=.3;},
  // 🐺 Werewolf: furry all over with torn purple shorts
  werewolf(k,c){const f=k.mat(c,'fur'),p=k.mat('#5b2a86');k.topShell(f,'long');k.legsShell(f,.066,true);k.waist(p);
    for(const l of k.legs)k.P(new THREE.CylinderGeometry(.078,.088,.12,7,1,true),p,l.hp,0,-.07,0).material.side=THREE.DoubleSide;},
  // 🧻 Mummy wraps
  mummy(k,c){const m=printMat(k,c,'wraps',{rep:3});k.topShell(m,'long');k.waist(m);k.legsShell(m,.071,true);},
  // 🧟 Zombie rags: a torn green tee with a patch and ripped grey pants
  zombie(k,c){const m=k.mat(c),pm=k.mat('#5a6b7a');k.topShell(m,'short');k.waist(pm);k.legsShell(pm,.07,true);
    k.P(box(.035,.03,.01),k.mat('#a0442a'),k.spine,.04,.28,.101).rotation.z=.2;k.P(new THREE.CylinderGeometry(.14,.15,.06,9,1,true),m,k.hips,0,.12,0).material.side=THREE.DoubleSide;},
  // 💃 Red tulle gown: a short red dress under a long see-through tulle skirt
  redtulle(k,c){const m=k.mat(c,'shiny');k.topShell(m,'strap');k.skirt(m,.3,.24,{curve:.8});beltRing(k,k.mat(shadeC(c,-.25),'shiny'),k.hips,.14,.012,.1);
    k.skirt(k.mat(shadeC(c,.6),'tulle'),.92,.56,{r0:.145,curve:.6,folds:.09,k:9});k.av.legAmp=.3;},
  // 👖 Denim catsuit with a fluffy purple collar
  catsuit(k,c){const m=k.mat(c,'denim'),X=k.av.legX;k.topShell(m,'long');k.waist(m);k.legsShell(m,.071,true);
    const p=k.mat('#b388ff','fur');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.P(sph(.03,10,8),p,k.spine,Math.sin(a)*.075,.455,Math.cos(a)*.065);}
    k.P(box(.03,.02,.01),k.mat('#e8e8ff','metal'),k.hips,0,.1,.135);},

  /* ---- tops ---- */
  // 🎄 Holiday sweater: red with a white and green band and a little tree
  xmas(k,c){const m=k.mat(c);k.topShell(m,'long');beltRing(k,k.mat('#2e9e4f'),k.spine,.146,.016,.07).scale.set(1,.72,1);beltRing(k,k.mat('#ffffff'),k.spine,.146,.01,.095).scale.set(1,.72,1);
    for(const a of k.arms)beltRing(k,k.mat('#ffffff'),a.el,.045,.01,-.15);k.decal('🎄');},
  // 👚 Blouse: white with a frilly collar and pink buttons
  blouse(k,c){const m=k.mat(c);k.topShell(m,'short');beltRing(k,k.mat(shadeC(c,-.06),'tulle'),k.spine,.062,.012,.45);buttons(k,k.mat('#ff6fae','shiny'),k.spine,0,[.37,.31,.25,.19],.104);},
  // 🏀 Sports jersey: number 11 with a white V neck
  jersey(k,c){const m=k.mat(c,'shiny'),w=k.mat('#ffffff');k.topShell(m,'short');for(const s of [-1,1]){const v=k.P(box(.01,.07,.01),w,k.spine,s*.018,.43,.096);v.rotation.z=s*.5;}frontText(k,'11','#ffffff',.27,.16);},
  // 🎀 Ruffle top: strapless with ruffles on top and bottom
  ruffle(k,c){const m=k.mat(c);k.topShell(m,'strap');const r=k.mat(shadeC(c,.3));for(const y of [.4,.05]){const o=beltRing(k,r,k.spine,.142,.02,y);o.scale.set(1,.74,.7);}},
  // 🖤 Moto jacket: shiny black, a white tee inside and a silver zip
  moto(k,c){const m=k.mat(c,'shiny');k.topShell(m,'long');k.P(box(.07,.2,.01),k.mat('#ffffff'),k.spine,0,.31,.1);k.P(box(.006,.22,.012),k.mat('#e8e8ff','metal'),k.spine,.042,.3,.104);k.P(sph(.008,8,6),k.mat('#ff3b6b','shiny'),k.spine,0,.32,.107);
    for(const s of [-1,1]){const l=k.P(box(.035,.09,.01),m,k.spine,s*.05,.38,.102);l.rotation.z=s*.35;}},
  // 🏈 Varsity jacket: red body, white sleeves, a gold B
  varsity(k,c){const m=k.mat(c),w=k.mat('#ffffff');k.topShell(m,'strap');for(const a of k.arms){k.P(capTop(.049,.17),w,a.sh);k.P(capTop(.043,.15),w,a.el);beltRing(k,m,a.el,.045,.011,-.16);}
    beltRing(k,w,k.spine,.064,.012,.45);buttons(k,w,k.spine,.02,[.36,.3,.24,.18],.104);frontText(k,'B','#ffd23f',.33,.07);},
  // 📣 Cheer top: a tank with a white and gold chevron
  cheertop(k,c){const m=k.mat(c);k.topShell(m,'strap');for(const [col,dy] of [['#ffffff',0],['#ffd23f',-.03]])for(const s of [-1,1]){const v=k.P(box(.012,.11,.01),k.mat(col,'shiny'),k.spine,s*.032,.3+dy,.1);v.rotation.z=s*.95;}},
  // 🧥 Turtleneck: long sleeves and a tall folded neck
  turtleneck(k,c){const m=k.mat(c);k.topShell(m,'long');k.P(cyl(.05,.054,.09,20),m,k.spine,0,.49,0);beltRing(k,m,k.spine,.054,.012,.45);},
  // 💼 Blazer: pink with a white top inside and lapels
  blazer(k,c){const m=k.mat(c);k.topShell(m,'long');k.P(box(.06,.2,.01),k.mat('#ffffff'),k.spine,0,.31,.1);for(const s of [-1,1]){const l=k.P(box(.035,.12,.012),k.mat(shadeC(c,-.12)),k.spine,s*.042,.36,.104);l.rotation.z=s*.3;}
    k.P(k.av.glam?sph(.15,24,16):sph(.15,24,16),m,k.hips,0,.07,0).scale.set(1.02,.5,.78);},
  // 🎖️ Military coat: cream, gold buttons in two rows, a belt and a short flared skirt
  military(k,c){const m=k.mat(c),g=k.mat('#e0b04a','metal');k.topShell(m,'long');for(const x of [-.035,.035])buttons(k,g,k.spine,x,[.38,.31,.24,.17],.103,.008);
    beltRing(k,k.mat(shadeC(c,-.15)),k.spine,.146,.014,.06).scale.set(1,.72,1);k.P(box(.03,.026,.01),g,k.spine,0,.06,.108);k.skirt(m,.22,.22,{curve:.9,folds:.03});beltRing(k,m,k.spine,.06,.016,.46);},
  // ☁️ Fur shrug top: a striped top with big fluffy shoulders
  furshrug(k,c){const m=printMat(k,'#f4f6fb','stripes'),f=k.mat(c,'fur');k.topShell(m,'strap');for(const a of k.arms)k.P(fuzz(new THREE.SphereGeometry(.07,32,24),.01,90),f,a.sh,0,-.02,0);},
  // 🐱 Graphic crop tee: a short tee with a kitty
  graphiccrop(k,c){const m=k.mat(c);k.topShell(m,'short');k.decal('🐱');beltRing(k,k.mat('#ffffff'),k.spine,.145,.012,.1).scale.set(1,.72,1);},
  // ✨ Silver corset with pink lacing
  corset(k,c){const m=k.mat(c,'shiny');m.metalness=.6;m.roughness=.25;k.topShell(m,'strap');const l=k.mat('#ffb3d1','shiny');
    for(let i=0;i<5;i++)for(const s of [-1,1]){const b=k.P(box(.05,.005,.006),l,k.spine,0,.36-i*.05,.104);b.rotation.z=s*.45;}},

  /* ---- bottoms ---- */
  // 🏃 Sport shorts with pink side stripes
  athshorts(k,c){const m=k.mat(c);k.waist(m);k.legsShell(m,.073,false);sideStripes(k,k.mat('#ff6fae','shiny'),false);},
  // 🎾 Pleated skirt
  tennisskirt(k,c){const m=k.mat(c);k.waist(m);k.skirt(m,.26,.25,{curve:.6,folds:.1,k:24});},
  // 🌼 Flare jeans with a little flower
  flares(k,c){const m=k.mat(c,'denim'),X=k.av.legX;k.waist(m);k.legsShell(m,.07,true);for(const l of k.legs)k.P(new THREE.CylinderGeometry(.07,.1,.18,24,1,true),m,l.kn,0,-.3-X,0).material.side=THREE.DoubleSide;
    k.P(sph(.012,8,6),k.mat('#ffffff','shiny'),k.legs[0].kn,-.06,-.2,.04);},
  // 🏃‍♀️ Joggers with white side stripes and cuffs
  joggers(k,c){const m=k.mat(c),X=k.av.legX;k.waist(m);k.legsShell(m,.072,true);sideStripes(k,k.mat('#ffffff'),true);for(const l of k.legs)beltRing(k,m,l.kn,.062,.014,-.35-X);},
  // 🤎 Suede skirt with gold buttons
  suede(k,c){const m=k.mat(c);m.sheenRoughness=.9;k.waist(m);k.skirt(m,.3,.2,{curve:1,folds:.02,k:8});buttons(k,k.mat('#e0b04a','metal'),k.hips,0,[.04,-.04,-.12],.15,.006);},
  // 🤍 White jeans, slim
  skinny(k,c){const m=k.mat(c,'denim');k.waist(m);k.legsShell(m,.066,true);},
  // 🪩 Metallic mini with two ruffled tiers
  silvermini(k,c){const m=k.mat(c,'shiny');m.metalness=.7;m.roughness=.25;k.waist(m);k.skirt(m,.2,.22,{curve:.7,folds:.12,k:16});k.P(skirtGeo(.15,.24,-.05,-.14,{curve:.6,folds:.14,k:16}),m,k.hips);},
  // 🧁 Fluffy skirt with a dark hem
  furskirt(k,c){const m=k.mat(c,'fur');k.waist(m);k.P(fuzz(skirtGeo(.14,.24,.1,-.18,{curve:.8,folds:.05,k:12,seg:48}),.012,80),m,k.hips);beltRing(k,k.mat('#2d2d3a','shiny'),k.hips,.24,.008,-.18);},
  // ⛓️ Chain cargo pants: pockets on the legs and a gold chain
  cargo(k,c){const m=k.mat(c),g=k.mat('#e0b04a','metal');k.waist(m);k.legsShell(m,.074,true);for(const l of k.legs)k.P(box(.012,.07,.06),m,l.hp,l.sx*.075,-.2,0);
    for(let i=0;i<9;i++){const a=-.9+i*.225;k.P(sph(.006,6,5),g,k.hips,Math.sin(a)*.14,.04-Math.cos(a*1.2)*.03,Math.cos(a)*.115);}},

  /* ---- shoes ---- */
  // 👟 High-tops: up over the ankle with white soles and laces
  hightops(k,c){const m=k.mat(c),w=k.mat('#ffffff','shiny');shoeShell(k,m);solePad(k,w);bootLeg(k,m,.058,.09);k.legs.forEach(l=>{for(let i=0;i<3;i++)k.P(box(.04,.005,.006),w,l.an,0,.0+i*.018,.1-i*.012);});},
  // ⚽ Soccer cleats: bright with little studs and a white stripe
  cleats(k,c){const m=k.mat(c,'shiny'),w=k.mat('#ffffff');shoeShell(k,m,.75);k.legs.forEach(l=>{k.P(box(.01,.03,.12),w,l.an,l.sx*.06,-.02,.05);for(const z of [-.02,.04,.1,.14])for(const x of [-.03,.03])k.P(cyl(.007,.005,.02,6),k.mat('#2d2d3a'),l.an,x,-.07,z);});},
  // 🎀 Mary Janes: round toes with a strap and a button
  maryjanes(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.72);k.legs.forEach(l=>{const t=k.P(new THREE.TorusGeometry(.045,.007,8,24,Math.PI),m,l.an,0,.0,.035);t.rotation.y=Math.PI/2;k.P(sph(.008,8,6),k.mat('#ffd23f','shiny'),l.an,l.sx*.045,.0,.035);});},
  // 🩰 Ballet slippers with ribbons around the ankles
  pointe(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.6);k.legs.forEach(l=>{for(let i=0;i<3;i++){const t=k.P(new THREE.TorusGeometry(.052-i*.002,.004,6,24),m,l.kn,0,-.33-k.av.legX+i*.035,0);t.rotation.x=Math.PI/2+(i%2?.25:-.25);}});},
  // 👢 Tall boots up to the knee
  kneeboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m);bootLeg(k,m,.064,.34);k.legs.forEach(l=>k.P(box(.03,.07,.01),m,l.an,0,-.04,-.05));},
  // ❄️ Snow boots: puffy with a fluffy white cuff
  snowboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.95,1.12);solePad(k,k.mat('#3a3035','shiny'),.035,.12,.24);bootLeg(k,m,.072,.18);
    k.legs.forEach(l=>{const t=k.P(fuzz(new THREE.TorusGeometry(.074,.022,16,40),.008,90),k.mat('#ffffff','fur'),l.kn,0,-.2-k.av.legX,0);t.rotation.x=Math.PI/2;});},
  // 🧙 Witch boots: pointy toes that curl up, with a buckle
  witchboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.75);bootLeg(k,m,.062,.2);k.legs.forEach(l=>{const t=k.P(new THREE.ConeGeometry(.03,.09,12),m,l.an,0,-.025,.16);t.rotation.x=Math.PI/2-.35;k.P(box(.03,.025,.008),k.mat('#d4af37','metal'),l.an,0,.0,.1);});},
  // 🐾 Monster paws: big furry feet with claws
  paws(k,c){const m=k.mat(c,'fur');k.legs.forEach(l=>{k.P(fuzz(new THREE.SphereGeometry(.07,32,20),.012,90),m,l.an,0,-.015,.05).scale.set(1.15,.8,1.7);for(const x of [-.035,0,.035])k.P(new THREE.ConeGeometry(.009,.03,8),k.mat('#f4ecd8','shiny'),l.an,x,-.03,.165).rotation.x=Math.PI/2;});bootLeg(k,m,.068,.12,.01);},
  // ☁️ Fluffy leg warmers over sneakers
  furwarmers(k,c){shoeShell(k,k.mat('#ffffff'));solePad(k,k.mat('#ff6fae','shiny'));bootLeg(k,k.mat(c,'fur'),.078,.22,.016);},
  // 💗 Chunky boots: a thick tread sole
  chunkyboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.9);bootLeg(k,m,.066,.16);solePad(k,k.mat('#2d2d3a','shiny'),.06,.12,.23);k.av.lift=.04;},
  // 👡 Lace-up heels: ribbons criss-crossing up the leg
  laceheels(k,c){const m=k.mat(c,'shiny');m.metalness=.5;shoeShell(k,m,.7);k.legs.forEach(l=>{k.P(cyl(.012,.008,.05,8),m,l.an,0,-.04,-.03);for(let i=0;i<5;i++){const t=k.P(new THREE.TorusGeometry(.05,.004,6,24),m,l.kn,0,-.36-k.av.legX+i*.045,0);t.rotation.x=Math.PI/2+(i%2?.3:-.3);}});},

  /* ---- hats ---- */
  // 👰 Bridal veil: a sheer veil falling down the back from a little comb
  veil(k,c){const m=k.mat(c,'tulle'),g=new THREE.CylinderGeometry(.13,.26,.62,32,6,true,Math.PI*.55,Math.PI*.9);k.P(g,m,k.head,0,-.2,-.05);k.P(new THREE.TorusGeometry(.1,.008,8,24,Math.PI),k.mat('#ffffff','gem'),k.head,0,.1,-.04).rotation.x=-.4;},
  // 🧶 Beanie with a pom-pom
  beanie(k,c){const m=k.mat(c);k.P(new THREE.SphereGeometry(.15,28,14,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.03,-.01).scale.set(1.02,1,1.04);beltRing(k,k.mat(shadeC(c,-.12)),k.head,.148,.02,.035);k.P(fuzz(sph(.04,20,14),.008,90),k.mat('#ffffff','fur'),k.head,0,.19,-.01);},
  // 👒 Sun hat: a wide straw brim with a ribbon
  sunhat(k,c){const m=k.mat(c);k.P(cyl(.28,.28,.01,40),m,k.head,0,.1,-.01);k.P(new THREE.SphereGeometry(.13,28,14,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.1,-.01).scale.set(1,.7,1);beltRing(k,k.mat('#ff6fae','shiny'),k.head,.13,.012,.115);},
  // 🎨 Beret: a soft tilted round hat
  beret(k,c){const b=k.P(sph(.15,28,16),k.mat(c),k.head,.03,.13,-.02);b.scale.set(1.1,.35,1.05);b.rotation.z=-.2;k.P(sph(.012,8,6),k.mat(c),k.head,.04,.19,-.02);},
  // 🏃 Sweatband around the forehead
  sweatband(k,c){const t=beltRing(k,k.mat(c),k.head,.142,.016,.06);t.scale.set(1,1.06,1);},
  // 🎀 Headband with a little knot on top
  headband(k,c){const m=k.mat(c,'shiny'),t=k.P(new THREE.TorusGeometry(.142,.011,8,40,Math.PI),m,k.head,0,.03,.0);t.rotation.y=Math.PI/2;t.rotation.z=0;k.P(sph(.02,10,8),m,k.head,0,.16,.03);},
  // 🐶 Space pup ears: floppy ears on a band
  pupears(k,c){const m=k.mat(c);for(const s of [-1,1]){const e=k.P(sph(.06,14,10),m,k.head,s*.13,.04,-.01);e.scale.set(.4,1.2,.8);e.rotation.z=s*.35;}k.P(new THREE.TorusGeometry(.142,.008,6,32,Math.PI),m,k.head,0,.03,0).rotation.y=Math.PI/2;},
  // 🐺 Wolf ears: tall and furry
  wolfears(k,c){const m=k.mat(c,'fur'),inn=k.mat(shadeC(c,.5));for(const s of [-1,1]){const e=k.P(new THREE.ConeGeometry(.045,.1,12),m,k.head,s*.08,.16,-.02);e.rotation.z=-s*.3;e.scale.z=.5;const i=k.P(new THREE.ConeGeometry(.026,.065,12),inn,k.head,s*.078,.155,-.006);i.rotation.z=-s*.3;i.scale.z=.3;}},
  // 🧻 Mummy wrap around the head
  mummywrap(k,c){const m=printMat(k,c,'wraps',{rep:2});for(let i=0;i<3;i++){const t=beltRing(k,m,k.head,.142-i*.004,.016,.1-i*.035);t.rotation.z=(i-1)*.15;}},
  // 🌺 Hibiscus flower behind the ear
  hibiscus(k,c){const m=k.mat(c,'shiny');for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const p=k.P(sph(.024,10,8),m,k.head,.13+Math.cos(a)*.022,.06+Math.sin(a)*.022,.04);p.scale.set(1,1,.4);}k.P(sph(.01,8,6),k.mat('#ffd23f','shiny'),k.head,.142,.06,.05);},
  // 🐱 Fluffy kitty ears
  fluffyears(k,c){const m=k.mat(c,'fur'),inn=k.mat('#ffb3d1');for(const s of [-1,1]){const e=k.P(fuzz(new THREE.ConeGeometry(.05,.085,16,6),.006,90),m,k.head,s*.08,.15,-.01);e.rotation.z=-s*.35;e.scale.z=.6;const i=k.P(new THREE.ConeGeometry(.028,.055,12),inn,k.head,s*.078,.147,.008);i.rotation.z=-s*.35;i.scale.z=.3;}},
  // 😈 Little golden horn clips
  horns(k,c){const m=k.mat(c,'metal');m.roughness=.3;for(const s of [-1,1]){const h=k.P(new THREE.ConeGeometry(.02,.06,12),m,k.head,s*.07,.15,.02);h.rotation.z=-s*.35;}},

  /* ---- extras ---- */
  // 💖 Heart necklace
  heartneck(k,c){const g=k.mat('#e0b04a','metal');const t=k.P(new THREE.TorusGeometry(.06,.003,6,32),g,k.spine,0,.45,.0);t.rotation.x=Math.PI/2+.5;
    const hs=new THREE.Shape();hs.moveTo(0,-.012);hs.bezierCurveTo(-.03,.008,-.012,.024,0,.01);hs.bezierCurveTo(.012,.024,.03,.008,0,-.012);k.P(new THREE.ExtrudeGeometry(hs,{depth:.006,bevelEnabled:false}),k.mat(c,'gem'),k.spine,0,.4,.098);},
  // ✨ Earrings: little drops
  earrings(k,c){const m=k.mat(c,'metal');for(const s of [-1,1]){k.P(sph(.007,8,6),m,k.head,s*.118,-.035,0);k.P(sph(.011,10,8),k.mat(c,'gem'),k.head,s*.12,-.055,0);}},
  // 😎 Heart shades
  heartglasses(k,c){const m=k.mat(c,'shiny');const hs=new THREE.Shape();hs.moveTo(0,-.022);hs.bezierCurveTo(-.05,.012,-.02,.04,0,.018);hs.bezierCurveTo(.02,.04,.05,.012,0,-.022);
    for(const s of [-1,1])k.P(new THREE.ExtrudeGeometry(hs,{depth:.006,bevelEnabled:false}),m,k.head,s*.046,-.004,.132);k.P(box(.03,.005,.005),m,k.head,0,.012,.136);for(const s of [-1,1])k.P(box(.005,.005,.13),m,k.head,s*.08,.01,.07);},
  // 💐 Bouquet of flowers to hold
  bouquet(k,c){const a=k.arms[0],g=k.mat('#3f8f3a');k.P(cyl(.012,.006,.12,8),g,a.hand,0,-.06,.03);const fc=[c,'#ffffff','#ffd23f',c,'#b388ff',c];fc.forEach((f,i)=>{const t=i/6*Math.PI*2;k.P(sph(.022,10,8),k.mat(f,'shiny'),a.hand,Math.cos(t)*.025,.02+(i%2)*.01,.03+Math.sin(t)*.025);});},
  // 🎁 Gift box with a bow
  present(k,c){const a=k.arms[1],m=k.mat(c,'shiny'),r=k.mat('#ff3b6b','shiny');k.P(box(.1,.08,.1),m,a.hand,0,-.11,.03);k.P(box(.104,.084,.018),r,a.hand,0,-.11,.03);k.P(box(.018,.084,.104),r,a.hand,0,-.11,.03);for(const s of [-1,1])k.P(sph(.016,8,6),r,a.hand,s*.014,-.065,.03).scale.set(1.3,.7,.7);},
  // 📣 Pom-poms in both hands
  pompoms(k,c){const m=k.mat(c,'tulle');m.opacity=.95;for(const a of k.arms)k.P(fuzz(new THREE.IcosahedronGeometry(.07,3),.02,60),m,a.hand,0,-.06,.02);},
  // 🎾 Tennis racket
  racket(k,c){const a=k.arms[1],m=k.mat(c,'shiny'),g=new THREE.Group();g.position.set(0,-.06,.03);g.rotation.x=.3;a.hand.add(g);k.av.parts.push(g);g.geometry={dispose(){}};
    k.P(cyl(.008,.008,.12,8),k.mat('#ffffff'),g,0,-.0,0);const r=k.P(new THREE.TorusGeometry(.065,.008,8,28),m,g,0,-.12,0);r.scale.set(.8,1,1);r.rotation.y=Math.PI/2;const net=k.P(new THREE.CircleGeometry(.062,20),k.mat('#ffffff','tulle'),g,0,-.12,0);net.scale.set(.8,1,1);net.rotation.y=Math.PI/2;},
  // ⚽ Soccer ball held in one hand
  ball(k,c){const t=printMat(k,c,'spots');const b=k.P(sph(.08,24,16),t,k.arms[1].hand,0,-.11,.05);},
  // 🥇 Gold medal on a ribbon
  medal(k,c){const r=k.mat('#3a5bd9');for(const s of [-1,1]){const b=k.P(box(.014,.14,.004),r,k.spine,s*.03,.4,.1);b.rotation.z=s*.35;}const m=k.P(cyl(.024,.024,.006,20),k.mat(c,'metal'),k.spine,0,.32,.106);m.rotation.x=Math.PI/2;},
  // 🧛 Vampire cape with a tall red collar
  vampcape(k,c){const m=k.mat(c),red=k.mat('#b3001b','shiny');m.side=THREE.DoubleSide;const g=new THREE.PlaneGeometry(.5,1.1,6,10),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-Math.abs(x)*x*1.2);p.setX(i,x*(1+(.55-y)*.5));}g.translate(0,-.55,0);g.computeVertexNormals();
    const cg=new THREE.Group();cg.position.set(0,.47,-.11);k.spine.add(cg);k.av.parts.push(cg);cg.geometry={dispose(){}};k.P(g,m,cg).rotation.y=Math.PI;k.av.cape=cg;
    for(const s of [-1,1]){const col=k.P(new THREE.PlaneGeometry(.12,.14),red,k.spine,s*.08,.53,-.03);col.rotation.y=s*.6;col.rotation.x=-.2;col.material.side=THREE.DoubleSide;}},
  // 🌺 Flower lei
  lei(k,c){const fc=[c,'#ffffff','#ffd23f',c,'#b388ff'];for(let i=0;i<18;i++){const a=i/18*Math.PI*2;k.P(sph(.02,8,6),k.mat(fc[i%5],'shiny'),k.spine,Math.sin(a)*.1,.45-Math.max(0,Math.cos(a))*.07,Math.cos(a)*.105);}},
  // 🐈 Kitty tail
  tail(k,c){const m=k.mat(c,'fur'),cv=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.0,-.11),new THREE.Vector3(0,-.1,-.2),new THREE.Vector3(.05,-.05,-.3),new THREE.Vector3(.08,.12,-.33),new THREE.Vector3(.06,.2,-.3)]);
    const g=new THREE.TubeGeometry(cv,24,.02,10,false);k.P(fuzz(g,.004,90),m,k.hips);k.P(sph(.02,10,8),m,k.hips,.06,.2,-.3);},
  // 🐱 Kitty face paint: whiskers and a pink nose
  whiskers(k,c){const m=k.mat('#2d2d3a');for(const s of [-1,1])for(const dy of [-.006,.006]){const w=k.P(box(.04,.0025,.002),m,k.head,s*.06,-.035+dy,.118);w.rotation.z=s*dy*12;w.rotation.y=-s*.5;}k.P(sph(.008,8,6),k.mat('#ff6fae','shiny'),k.head,0,-.032,.142);},
  // 🟡 Gold bangles on both wrists
  bangles(k,c){const m=k.mat(c,'metal');m.roughness=.25;for(const a of k.arms)for(let i=0;i<3;i++)beltRing(k,m,a.el,.04,.005,-.14-i*.014);},
};
