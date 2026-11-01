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
};
