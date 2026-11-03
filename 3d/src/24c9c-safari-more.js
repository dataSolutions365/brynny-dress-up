/* ===== 🦓 More safari animals: a zebra, a giraffe and a rhino to ride, a crowned crane to fly on, and a gorilla at the zoo =====
   All real-looking (true colors and shapes, no cartoon blush). The rides you earn with 🦁 Safari challenges are listed in
   24i-earned-rides.js (model = which one of these to build); the gorilla lives at the Safari Zoo (ZOOA in 24d-barn.js).
   To keep phones light on memory, every animal of a kind shares the same few small textures and materials (SAFM below).
   Only geometries get thrown away when a picture of an animal is drawn, so sharing materials is safe. */
const SAFM={};const safM=(k,make)=>SAFM[k]||(SAFM[k]=make());
// wavy black bands across a 256 x 256 canvas (zebra stripes); vert = bands run up and down instead of across
function zebraBands(vert){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#f3f0e8';x.fillRect(0,0,w,h);x.fillStyle='#17161a';
  const n=11,st=h/n;for(let i=0;i<n;i++){const Y=i*st;x.beginPath();
    const P=(a,b)=>vert?x.lineTo(b,a):x.lineTo(a,b);vert?x.moveTo(Y,0):x.moveTo(0,Y);
    for(let X=0;X<=w;X+=8)P(X,Y+Math.sin(X*.045+i*1.3)*st*.16);
    for(let X=w;X>=0;X-=8)P(X,Y+st*(.48+.1*Math.sin(i*2.1))+Math.sin(X*.05+i*.7)*st*.14);x.fill();}});}
// a giraffe's coat: brown patches with thin cream lines between them
function giraffeTex(){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#efe0bf';x.fillRect(0,0,w,h);const n=5,cs=w/n;
  for(let i=-1;i<=n;i++)for(let j=-1;j<=n;j++){const cx=(i+.5+(j%2)*.5)*cs,cy=(j+.5)*cs;x.fillStyle=(i*7+j*3)%3?'#a4532a':'#8f4522';x.beginPath();
    for(let q=0;q<7;q++){const a=q/7*Math.PI*2+i,rr=cs*(.42+.06*Math.sin(q*2.7+i*1.3+j));const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;q?x.lineTo(px,py):x.moveTo(px,py);}x.fill();}});}
// texture coordinates from the position along the body (z), so stripes are flat bands straight across it
function bandUV(geo,k=1.15){const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,.5+Math.atan2(p.getX(i),p.getY(i))/(Math.PI*2),p.getZ(i)*k+.5);uv.needsUpdate=true;return geo;}
const sfLeg=(lg,mat,top,len,r0,r1,hoofM,hoofR)=>{// one leg, hanging down from its group: upper, knee, lower and a hoof
  M(sph(r0,12,10),mat,0,0,0,lg);M(cyl(r0,r0*.72,len*.48,12),mat,0,-len*.24,0,lg);M(sph(r0*.68,10,8),mat,0,-len*.5,.005,lg);
  M(cyl(r1,r1*.9,len*.46,12),mat,0,-len*.73,.01,lg);if(hoofM)M(cyl(hoofR*.85,hoofR,.07,12),hoofM,0,-len+.035,.015,lg);};

// 🦓 Plains zebra: a stocky little horse with bold black and white stripes, a stand-up mane, a black nose and big round ears
ZOO_BUILD.zebraR=function(g,body,o){const r=.29,len=.62,hip=.8,by=.93;
  const T=safM('zbT',()=>({body:zebraBands(false),neck:zebraBands(true)}));
  const coatB=safM('zbCoatB',()=>{const tx=T.body.clone();tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.needsUpdate=true;return phys('#ffffff',{map:tx,roughness:.7,sheen:.4,sheenColor:new THREE.Color('#ffffff')});});
  const coat=safM('zbCoat',()=>phys('#ffffff',{map:T.body,roughness:.7,sheen:.4,sheenColor:new THREE.Color('#ffffff')})),
    coatN=safM('zbNeck',()=>phys('#ffffff',{map:T.neck,roughness:.7,sheen:.4,sheenColor:new THREE.Color('#ffffff')})),
    blk=safM('zbBlk',()=>std('#1a181b',{roughness:.6})),wht=safM('zbWht',()=>std('#f3f0e8',{roughness:.8})),hoof=safM('zbHoof',()=>phys('#2a2422',{roughness:.4,clearcoat:.3}));
  // a short tube for the middle, with the chest and rump as balls turned on their sides, so every stripe runs up and down
  // (the round ends of a long tube would show stripes as rings, like a target)
  // the body's stripes are painted straight down the sides by position along the body (bandUV), so the round chest and rump
  // get up-and-down stripes too, instead of rings like a target
  body.position.y=by;
  const bodyG=new THREE.CapsuleGeometry(r,len*.6,10,22);bodyG.rotateX(Math.PI/2);bodyG.scale(.9,1,1);M(bandUV(bodyG),coatB,0,0,0,body);
  const chG=sph(r,18,14);chG.scale(.88,1,1.05);chG.translate(0,-.01,len*.4);M(bandUV(chG),coatB,0,0,0,body);
  const ruG=sph(r*1.02,18,14);ruG.scale(.93,.98,1.05);ruG.translate(0,.01,-len*.4);M(bandUV(ruG),coatB,0,0,0,body);
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.5,hip,sz*len*.44);g.add(lg);this.legs.push({g:lg,ph});
    sfLeg(lg,coat,hip,hip,sz<0?.085:.075,.045,hoof,.05);}
  const neck=new THREE.Group();neck.position.set(0,by+r*.3,len/2+r*.4);neck.rotation.x=.72;g.add(neck);const nl=.5;
  taperTube([fV(0,-.05,0),fV(0,nl*.5,.01),fV(0,nl,0)],q=>.15-.06*q,coatN,neck,16,12);
  // the short stand-up mane, striped like the neck
  for(let i=0;i<9;i++){const q=i/8;M(box(.03,.08,.055),i%2?blk:wht,0,q*nl*.95+.02,-.12+q*.035,neck,false,false);}
  const head=new THREE.Group();head.position.set(0,nl+.03,.0);head.rotation.x=-.72+.35;neck.add(head);const H=.14;
  M(sph(H,20,14),coat,0,0,0,head).scale.set(.85,.9,1.1);
  M(sph(H*.72,16,12),coat,0,-H*.32,H*1.1,head).scale.set(.74,.74,1.45);// the long face
  M(sph(H*.5,14,10),blk,0,-H*.42,H*1.82,head).scale.set(.9,.78,.62);// black nose
  for(const sx of [-1,1]){M(sph(H*.08,8,6),std('#050505'),sx*H*.17,-H*.35,H*2.1,head,false,false);
    const e=M(new THREE.ConeGeometry(H*.27,H*.85,12),wht,sx*H*.42,H*.92,-H*.15,head);e.rotation.z=-sx*.28;e.scale.z=.55;
    M(new THREE.ConeGeometry(H*.12,H*.28,10),blk,sx*H*.53,H*1.3,-H*.15,head,false,false).rotation.z=-sx*.28;}// black ear tips
  fEyes(this,head,H,.55,.22,.78,.6,.15,'#2a1a10');
  const tail=new THREE.Group();tail.position.set(0,by+r*.4,-(len/2+r*.85));g.add(tail);
  taperTube([fV(0,0,0),fV(0,-.12,-.08),fV(0,-.35,-.06)],q=>.03-.01*q,wht,tail,10,8);M(sph(.05,10,8),blk,0,-.44,-.05,tail).scale.set(.8,2,.8);
  Object.assign(o,{neck,head,tail,nTilt:.72,size:1.05,h:by+nl+.3,rad:.5,dustR:[r,r,len*.8]});};

// 🦒 Giraffe: very long legs (the front ones longer, so the back slopes), a long neck with a short mane, ossicones and patches
ZOO_BUILD.giraffeR=function(g,body,o){const r=.3,len=.6,hipF=1.32,hipB=1.18,by=1.44;
  const coat=safM('grCoat',()=>phys('#ffffff',{map:giraffeTex(),roughness:.75,sheen:.3,sheenColor:new THREE.Color('#fff2d6')})),
    pale=safM('grPale',()=>std('#e6d2a6',{roughness:.8})),dark=safM('grDark',()=>std('#3a2418',{roughness:.7})),
    hoof=safM('grHoof',()=>phys('#2e2420',{roughness:.4,clearcoat:.3})),mane=safM('grMane',()=>std('#6e3a1e',{roughness:.9}));
  body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,10,22),coat,0,0,0,body);t.rotation.x=Math.PI/2-.2;t.scale.set(.9,1,1);
  M(sph(r*1.02,16,12),coat,0,.08,len*.34,body).scale.set(.9,1.05,1);// high shoulders
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const H0=sz>0?hipF:hipB,lg=new THREE.Group();lg.position.set(sx*r*.45,H0,sz*len*.45);g.add(lg);this.legs.push({g:lg,ph});
    sfLeg(lg,coat,H0,H0,.08,.04,hoof,.048);}
  const neck=new THREE.Group();neck.position.set(0,by+r*.5,len/2+r*.2);neck.rotation.x=.42;g.add(neck);const nl=1.35;
  taperTube([fV(0,-.1,-.02),fV(0,nl*.4,.02),fV(0,nl*.8,0),fV(0,nl,-.02)],q=>.15-.07*q,coat,neck,24,12);
  taperTube([fV(0,0,-.13),fV(0,nl*.5,-.09),fV(0,nl*.95,-.07)],q=>.025,mane,neck,16,6);// short mane along the back of the neck
  const head=new THREE.Group();head.position.set(0,nl+.04,0);head.rotation.x=-.42+.95;neck.add(head);const H=.15;
  M(sph(H,20,14),coat,0,0,0,head).scale.set(.8,.85,1.25);
  M(sph(H*.7,16,12),pale,0,-H*.18,H*1.15,head).scale.set(.8,.8,1.4);// long pale muzzle
  M(sph(H*.38,12,10),dark,0,-H*.2,H*1.95,head).scale.set(.95,.7,.5);// soft dark nose
  for(const sx of [-1,1]){const oc=M(cyl(H*.09,H*.12,H*.75,10),pale,sx*H*.28,H*1.05,-H*.3,head);oc.rotation.z=-sx*.15;
    M(sph(H*.13,10,8),dark,sx*H*.34,H*1.42,-H*.3,head);// the ossicones with dark hairy tips
    const e=M(sph(H*.3,12,10),pale,sx*H*.82,H*.55,-H*.35,head);e.scale.set(1.5,.42,.6);e.rotation.z=sx*.35;}
  fEyes(this,head,H,.55,.28,.65,.65,.17,'#1e120a');
  const tail=new THREE.Group();tail.position.set(0,by+r*.1,-(len/2+r*.8));g.add(tail);
  taperTube([fV(0,0,0),fV(0,-.3,-.06),fV(0,-.65,-.05)],q=>.022,pale,tail,10,6);M(sph(.06,10,8),dark,0,-.72,-.05,tail).scale.set(.8,2,.8);
  Object.assign(o,{neck,head,tail,nTilt:.42,size:1.5,h:by+nl+.4,rad:.6,dustR:[r,r,len*.8]});};

// 🦏 White rhino: huge and gray with wrinkly skin, folds at the shoulders and hips, a big front horn and a wide square lip
ZOO_BUILD.rhinoR=function(g,body,o){const r=.46,len=.78,hip=.6,by=.86;
  const skin=safM('rhSkin',()=>std('#8f8a84',{bumpMap:eleBumpTex(),bumpScale:2.5,roughness:.95})),
    fold=safM('rhFold',()=>std('#77726c',{roughness:.95})),horn=safM('rhHorn',()=>phys('#a89a88',{roughness:.6,clearcoat:.2})),nail=safM('rhNail',()=>std('#5e5853',{roughness:.6}));
  body.position.y=by;const t=M(fuzz(new THREE.CapsuleGeometry(r,len,12,24),.012,8),skin,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(.92,.95,1);
  M(sph(r*.75,16,12),skin,0,r*.38,len*.25,body).scale.set(1,.7,1.1);// the hump over the shoulders
  M(sph(r*.85,16,12),skin,0,.02,-len*.42,body).scale.set(.95,1,1);
  // skin folds around the body behind the shoulders and in front of the hips (an arc over the top and down the sides)
  for(const z of [len*.12,-len*.28]){const f=M(new THREE.TorusGeometry(r*.99,.022,6,28,Math.PI*1.3),fold,0,0,z,body,false,false);f.rotation.z=Math.PI/2-Math.PI*.65;f.scale.set(.92,.95,1);}
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.55,hip,sz*len*.45);g.add(lg);this.legs.push({g:lg,ph});
    M(sph(.19,14,10),skin,0,.02,0,lg).scale.set(.9,1.2,1.05);M(cyl(.16,.13,hip-.08,14),skin,0,-(hip-.08)/2,0,lg);M(cyl(.14,.16,.08,16),fold,0,-hip+.04,0,lg);
    for(const a of [-.6,0,.6])M(sph(.045,8,6),nail,Math.sin(a)*.15,-hip+.04,Math.cos(a)*.15,lg,false,false).scale.set(1,.7,.6);}
  // the big head is carried low, with the square lip near the grass (they're grazers)
  const neck=new THREE.Group();neck.position.set(0,by+.02,len/2+r*.55);neck.rotation.x=1.05;g.add(neck);
  M(sph(.3,16,12),skin,0,.0,0,neck).scale.set(.95,1,1.1);
  const head=new THREE.Group();head.position.set(0,.2,.02);head.rotation.x=-1.05+.35;neck.add(head);const H=.27;
  M(sph(H,20,14),skin,0,0,0,head).scale.set(.85,.85,1.45);
  M(sph(H*.62,14,12),skin,0,-H*.2,H*1.35,head).scale.set(1.35,.75,.75);// wide square lip
  const h1=new THREE.Group();h1.position.set(0,H*.4,H*1.15);head.add(h1);taperTube([fV(0,0,0),fV(0,H*.55,H*.12),fV(0,H*1.15,-H*.05)],q=>H*(.24-.22*q),horn,h1,14,10);
  const h2=new THREE.Group();h2.position.set(0,H*.62,H*.62);head.add(h2);taperTube([fV(0,0,0),fV(0,H*.35,-H*.02)],q=>H*(.15-.13*q),horn,h2,8,8);
  for(const sx of [-1,1]){const e=M(new THREE.ConeGeometry(H*.18,H*.5,10),skin,sx*H*.45,H*.85,-H*.55,head);e.rotation.set(-.3,0,-sx*.25);// tube-shaped ears
    M(sph(H*.03,6,4),std('#1a1410'),sx*H*.3,-H*.25,H*1.62,head,false,false).scale.set(1,1.8,1);}// nostrils
  fEyes(this,head,H,.68,.05,.5,1.0,.08,'#2a1a10');// small eyes far back on the sides
  const tail=new THREE.Group();tail.position.set(0,by+r*.35,-(len/2+r*.95));g.add(tail);
  taperTube([fV(0,0,0),fV(0,-.15,-.06),fV(0,-.32,-.04)],q=>.03-.01*q,skin,tail,10,8);M(sph(.035,8,6),std('#2a2420'),0,-.36,-.04,tail).scale.set(.8,2,.8);
  Object.assign(o,{neck,head,tail,nTilt:1.05,gz:.3,size:1.3,h:by+r+.5,rad:.8,dustR:[r,r,len*.8]});};

// 🕊️ Grey crowned crane: a tall gray bird with a golden crown of bristly feathers, a black velvet cap, white cheeks,
// a red throat pouch, and white, gold and black wings. Big enough to ride, and it flies (24h-flying.js).
ZOO_BUILD.craneR=function(g,body,o){const r=.3,len=.44,leg=.95,by=leg+r*.5;
  const gray=safM('crGray',()=>phys('#8f959c',{roughness:.85,sheen:.6,sheenColor:new THREE.Color('#e8eef5')})),pale=safM('crPale',()=>phys('#c9ced3',{roughness:.85,sheen:.6,sheenColor:new THREE.Color('#ffffff')})),
    white=safM('crWhite',()=>phys('#f6f4ef',{roughness:.85,sheen:.5})),gold=safM('crGold',()=>phys('#c8984a',{roughness:.7,sheen:.6,sheenColor:new THREE.Color('#ffe2a0')})),
    black=safM('crBlack',()=>std('#16161a',{roughness:.7})),red=safM('crRed',()=>phys('#c8262a',{roughness:.5,clearcoat:.4})),crown=safM('crCrown',()=>phys('#e8c060',{roughness:.6,sheen:.8,sheenColor:new THREE.Color('#fff2c0')})),
    legM=safM('crLeg',()=>std('#26262a',{roughness:.55}));
  body.position.y=by;body.rotation.x=-.08;const t=M(new THREE.CapsuleGeometry(r,len,8,20),gray,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(.95,.9,1);
  M(sph(r*.8,14,10),pale,0,-r*.25,len*.38,body).scale.set(.9,.95,1.1);// pale gray breast
  // long dark legs with a backward "knee" (really the ankle) and long toes
  for(const sx of [-1,1]){const lg=new THREE.Group();lg.position.set(sx*r*.4,by-r*.3,0);g.add(lg);
    M(sph(r*.32,10,8),gray,0,0,0,lg).scale.set(.8,1.2,.9);M(cyl(.035,.03,leg*.45,8),legM,0,-leg*.26,0,lg);M(sph(.035,8,6),legM,0,-leg*.48,-.02,lg);
    M(cyl(.03,.026,leg*.5,8),legM,0,-leg*.74,-.01,lg);
    for(const a of [-.5,0,.5]){const toe=M(new THREE.CapsuleGeometry(.016,.14,4,6),legM,Math.sin(a)*.08,-leg+.02,Math.cos(a)*.08,lg);toe.rotation.x=Math.PI/2;toe.rotation.y=a;}
    this.legs.push({g:lg,ph:sx>0?Math.PI:0});}
  // the wings fold along the sides when walking and open wide to fly: white coverts, gold and chestnut secondaries, black tips
  this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.8,r*.4,len*.2);body.add(w);
    M(new THREE.CapsuleGeometry(.09,.7,6,10),white,sx*.42,0,-.04,w,true,false).rotation.z=Math.PI/2;
    for(let i=0;i<12;i++){const q=i/11,L=.5+.25*Math.sin(q*Math.PI),f=new THREE.Group();f.position.set(sx*(.1+q*.8),0,-.06);f.rotation.y=sx*(.15-q*.95);w.add(f);
      const fe=M(new THREE.CapsuleGeometry(.07,L,4,8),i<4?white:i<8?gold:black,0,0,-L/2-.04,f,true,false);fe.rotation.x=Math.PI/2;fe.scale.set(1,1,.26);}
    for(let i=0;i<3;i++){const f=new THREE.Group();f.position.set(sx*.95,0,-.02);f.rotation.y=sx*(i*.2-.1);w.add(f);
      const L=.5-i*.05,fe=M(new THREE.CapsuleGeometry(.045,L,4,8),black,sx*(L/2),0,0,f,true,false);fe.rotation.z=Math.PI/2;fe.scale.set(1,.26,1);}
    this.wings.push({w,sx,fly:0,fold:1.3});}
  // the long S-shaped neck
  const neck=new THREE.Group();neck.position.set(0,by+r*.4,len/2+r*.3);neck.rotation.x=.15;g.add(neck);const nl=.62;
  taperTube([fV(0,-.04,-.02),fV(0,nl*.35,.06),fV(0,nl*.7,-.02),fV(0,nl,.03)],q=>.095-.04*q,gray,neck,20,10);
  const head=new THREE.Group();head.position.set(0,nl+.03,.03);head.rotation.x=-.15+.1;neck.add(head);const H=.1;
  M(sph(H,16,12),gray,0,0,0,head).scale.set(.85,.95,1.15);
  M(sph(H*.62,12,10),black,0,H*.55,H*.35,head).scale.set(1,.5,1.1);// black velvet cap
  for(const sx of [-1,1])M(sph(H*.45,12,10),white,sx*H*.5,H*.12,H*.1,head,false,false).scale.set(.4,.95,1.2);// white cheeks
  M(sph(H*.28,10,8),red,0,-H*.85,H*.1,head).scale.set(.7,1.2,.8);// red throat pouch
  M(sph(H*.13,8,6),red,0,H*.5,H*.85,head,false,false);// little red spot above the beak
  const bk=M(new THREE.ConeGeometry(H*.25,H*1.2,10),black,0,-H*.1,H*1.55,head);bk.rotation.x=Math.PI/2+.2;bk.scale.set(.75,1,1);// short gray-black beak
  fEyes(this,head,H,.45,.18,.78,.55,.18,'#9ab8d8');
  // the golden crown: a puff of stiff straw-colored bristles, all in one instanced mesh
  {const n=70,geo=new THREE.CylinderGeometry(.08,.3,1,4,1);geo.translate(0,.5,0);const m=new THREE.InstancedMesh(geo,crown,n),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),d=new THREE.Vector3(),mx=new THREE.Matrix4(),s=new THREE.Vector3(),p=new THREE.Vector3();
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,e=Math.random()*1.1;d.set(Math.sin(a)*Math.sin(e),Math.cos(e),Math.cos(a)*Math.sin(e)*.6-.15).normalize();q.setFromUnitVectors(up,d);
      const L=H*(.9+Math.random()*.6);s.set(H*.05,L,H*.05);p.set(0,H*.75,-H*.1);mx.compose(p,q,s);m.setMatrixAt(i,mx);}
    m.instanceMatrix.needsUpdate=true;m.castShadow=true;head.add(m);}
  const tail=new THREE.Group();tail.position.set(0,by-.02,-(len/2+r*.7));g.add(tail);
  for(let i=0;i<5;i++){const f=new THREE.Group();f.rotation.y=(i/4-.5)*.6;tail.add(f);const fe=M(new THREE.CapsuleGeometry(.06,.28,4,8),i%2?gray:black,0,0,-.16,f);fe.rotation.x=Math.PI/2+.25;fe.scale.set(1,1,.3);}
  Object.assign(o,{neck,head,tail,nTilt:.15,size:1.1,h:by+nl+.35,rad:.6,biped:true,dustR:[r,r,len*.7]});};

// short coarse black hair with a few gray strands
const gorillaFur=()=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#232225';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){const c=Math.random();x.strokeStyle=c<.5?'rgba(10,10,12,.5)':c<.85?'rgba(70,68,74,.45)':'rgba(140,138,146,.35)';
  const X=Math.random()*w,Y=Math.random()*h;x.beginPath();x.moveTo(X,Y);x.lineTo(X+(Math.random()-.5)*2,Y+3+Math.random()*4);x.stroke();}},3);
// 🦍 Gorilla (at the Safari Zoo, to feed and meet): a big silverback who walks on his knuckles
ZOO_BUILD.gorilla=function(g,body,o){const by=.85;
  const fur=safM('goFur',()=>phys('#ffffff',{map:gorillaFur(),roughness:.95,sheen:.8,sheenColor:new THREE.Color('#7a7a84'),sheenRoughness:.45})),
    silver=safM('goSilver',()=>phys('#8e8c8e',{roughness:.95,sheen:.7,sheenColor:new THREE.Color('#e0e0e6')})),
    limb=safM('goLimb',()=>phys('#232225',{roughness:.95,sheen:.8,sheenColor:new THREE.Color('#7a7a84'),sheenRoughness:.45})),// arms and legs: no texture, so there's no seam line down them
    skin=safM('goSkin',()=>std('#1c1a1b',{roughness:.55})),dk=safM('goDark',()=>std('#0c0b0c',{roughness:.5}));
  body.position.y=by;
  // a huge chest and shoulders, sloping down to small hips (he leans forward on his arms)
  const t=M(fuzz(new THREE.CapsuleGeometry(.36,.32,10,20),.02,9),fur,0,0,0,body);t.rotation.x=Math.PI/2-.6;t.scale.set(1.05,1,1);
  M(fuzz(sph(.36,18,14),.02,9),fur,0,.2,.2,body).scale.set(1.25,.9,.9);// shoulders
  M(sph(.3,16,12),silver,0,.1,-.12,body).scale.set(1.1,.8,1.25);// the silver saddle on his back
  M(sph(.25,14,10),skin,0,.0,.32,body).scale.set(1.05,.9,.4);// bare chest
  // long arms in front (he walks on his knuckles) and short bent legs behind
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const front=sz>0,H0=front?1.08:.58,lg=new THREE.Group();lg.position.set(sx*(front?.42:.24),H0,front?.28:-.3);g.add(lg);this.legs.push({g:lg,ph});
    // massive furry upper arms and forearms (soft capsules, thick at the top), leathery knuckles on the ground
    if(front){M(fuzz(new THREE.CapsuleGeometry(.16,.3,8,14),.02,9),limb,0,-.22,0,lg).scale.set(1,1,.95);
      M(fuzz(new THREE.CapsuleGeometry(.13,.3,8,14),.02,9),limb,0,-.64,.03,lg).scale.set(1,1,.9);
      M(sph(.11,12,10),skin,0,-.98,.06,lg).scale.set(1.15,.55,1.25);for(const kx of [-.05,0,.05])M(sph(.035,8,6),skin,kx,-.98,.15,lg,false,false);}
    else{M(fuzz(new THREE.CapsuleGeometry(.15,.14,8,12),.02,9),limb,0,-.12,0,lg);M(fuzz(new THREE.CapsuleGeometry(.11,.18,8,12),.015,9),limb,0,-.36,.04,lg);
      M(sph(.11,10,8),skin,0,-.55,.09,lg).scale.set(1,.42,1.7);}}
  const neck=new THREE.Group();neck.position.set(0,by+.4,.42);neck.rotation.x=.2;g.add(neck);
  const head=new THREE.Group();head.position.set(0,.06,.04);head.rotation.x=-.2;neck.add(head);const H=.2;
  M(fuzz(sph(H,18,14),.012,12),fur,0,0,0,head).scale.set(1,1.05,1);
  M(sph(H*.8,14,10),fur,0,H*.75,-H*.25,head).scale.set(.8,.9,1.1);// the tall crest on top of his head
  M(sph(H*.75,16,12),skin,0,-H*.05,H*.55,head).scale.set(1.05,1.05,.75);// leathery face
  M(sph(H*.5,14,10),skin,0,H*.38,H*.78,head).scale.set(1.7,.38,.55);// heavy brow
  M(sph(H*.45,14,10),skin,0,-H*.32,H*.88,head).scale.set(1.15,.75,.8);// muzzle
  for(const sx of [-1,1]){M(sph(H*.1,8,6),dk,sx*H*.14,-H*.12,H*1.22,head,false,false).scale.set(1,.7,.6);// wide nostrils
    M(sph(H*.17,10,8),skin,sx*H*.92,H*.05,-H*.05,head).scale.set(.4,1,.8);}// small ears
  fEyes(this,head,H,.3,.18,.95,.2,.12,'#3a2010');
  M(sph(H*.25,8,6),dk,0,-H*.55,H*.98,head,false,false).scale.set(1.6,.15,.6);// mouth
  Object.assign(o,{neck,head,tail:null,nTilt:.2,gz:.5,size:1.1,h:by+.75,rad:.6,dustR:[.36,.36,.3]});};
