/* ===== Safari Zoo: the okapi and the elephants =====
   These two are built to look like the real animals (true colors and shapes, no cartoon blush).
   FarmAnimal.build() in 24d-barn.js calls ZOO_BUILD[k] for them; ZOOA there has their facts and food. */
// a wavy black and white stripe pattern, painted from the top of the canvas (fr0) to (fr1) of its height
function okStripes(x,w,h,fr0,fr1,n,seed){const y0=h*fr0,y1=h*fr1,st=(y1-y0)/n;x.fillStyle='#f3eee4';x.fillRect(0,y0,w,y1-y0);x.fillStyle='#24150f';
  for(let i=0;i<n;i++){const Y=y0+i*st;x.beginPath();x.moveTo(0,Y);for(let X=0;X<=w;X+=8)x.lineTo(X,Y+Math.sin(X*.09+i*1.7+seed)*st*.18);
    for(let X=w;X>=0;X-=8)x.lineTo(X,Y+st*(.5+.12*Math.sin(i*2.3+seed))+Math.sin(X*.07+i+seed)*st*.15);x.fill();}}
let OKAPI_TEX=null;
function okapiTex(){if(OKAPI_TEX)return OKAPI_TEX;const brown='#2c1912',white='#f3eee4',dark='#24150f',T=d=>canvasTex(64,512,d);
  OKAPI_TEX={
    // the hind thighs and rump: the famous zebra stripes
    thigh:T((x,w,h)=>{x.fillStyle=brown;x.fillRect(0,0,w,h);okStripes(x,w,h,.08,1,9,1);}),
    rump:T((x,w,h)=>{x.fillStyle=brown;x.fillRect(0,0,w,h);okStripes(x,w,h,.4,.95,7,2);}),
    // the front legs: brown at the top, then stripes
    arm:T((x,w,h)=>{x.fillStyle=brown;x.fillRect(0,0,w,h);okStripes(x,w,h,.45,1,5,3);}),
    // the lower legs: more stripes, then white "socks" with a dark band at the ankle
    shinH:T((x,w,h)=>{okStripes(x,w,h,0,.35,4,5);x.fillStyle=white;x.fillRect(0,h*.35,w,h*.65);x.fillStyle=dark;x.fillRect(0,h*.35,w,h*.07);x.fillRect(0,h*.78,w,h*.07);}),
    shinF:T((x,w,h)=>{x.fillStyle=white;x.fillRect(0,0,w,h);x.fillStyle=dark;x.fillRect(0,h*.1,w,h*.12);x.fillRect(0,h*.78,w,h*.08);
      x.fillStyle='rgba(36,21,15,.6)';for(let i=0;i<3;i++)x.fillRect(0,h*(.28+i*.06),w,h*.025);}),
  };return OKAPI_TEX;}
let ELE_TEX=null;
// wrinkly gray skin: lots of fine wavy lines, used as both the color and the bumps
function eleTex(){if(ELE_TEX)return ELE_TEX;ELE_TEX=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#9a928c';x.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){x.fillStyle=Math.random()<.5?'rgba(80,70,64,.12)':'rgba(190,180,172,.12)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,4+Math.random()*16,0,7);x.fill();}
  x.lineCap='round';for(let i=0;i<260;i++){const X=Math.random()*w,Y=Math.random()*h,L=20+Math.random()*60;x.strokeStyle=`rgba(60,52,48,${.25+Math.random()*.3})`;x.lineWidth=.8+Math.random()*1.6;
    x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo(X+L*.5,Y+(Math.random()-.5)*14,X+L,Y+(Math.random()-.5)*8);x.stroke();}},2);return ELE_TEX;}
// soft round bumps for the elephant's big body (no lines, so nothing stretches on the round shape)
let ELE_BUMP=null;const eleBumpTex=()=>ELE_BUMP||(ELE_BUMP=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);
  for(let i=0;i<1400;i++){x.fillStyle=Math.random()<.5?'rgba(40,40,40,.18)':'rgba(220,220,220,.18)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*5,0,7);x.fill();}},3));
const EAR_OPEN=.32;// how far the elephant's ears stand out from its shoulders at rest
const ZOO_BUILD={
  // 🦓🦒 the okapi: a velvety dark brown forest giraffe with a pale face, big ears and zebra-striped legs
  okapi(g,body,o){const r=.27,len=.6,hip=.92,by=1.02,T=okapiTex();
    const coat=phys('#2f1a12',{roughness:.62,sheen:.45,sheenColor:new THREE.Color('#9a5634'),sheenRoughness:.5}),
      face=phys('#d8cbbb',{roughness:.7,sheen:.4,sheenColor:new THREE.Color('#ffffff')}),
      brow=phys('#5a3624',{roughness:.65}),nose=fShiny('#1d1310',{roughness:.35}),hoofM=fShiny('#1d1310',{roughness:.4}),
      tex=t=>phys('#ffffff',{map:t,roughness:.62,sheen:.45,sheenColor:new THREE.Color('#9a5634'),sheenRoughness:.5});
    body.position.y=by;
    // the back slopes down toward the rump, like a giraffe's
    const t=M(new THREE.CapsuleGeometry(r,len,10,24),coat,0,0,0,body);t.rotation.x=Math.PI/2-.1;t.scale.set(.92,1,1);
    M(sph(r*.92,18,14),coat,0,.04,len*.42,body).scale.set(.85,1.02,1.05);// deep chest and shoulders
    // the striped rump wraps around the back of the body
    const rump=M(sph(r*1.04,24,18),tex(T.rump),0,-.05,-len*.55,body);rump.scale.set(.95,.92,.92);
    // legs: the hind ones have big striped thighs
    for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.55,hip,sz*len*.48);g.add(lg);this.legs.push({g:lg,ph});
      if(sz<0){M(cyl(.13,.075,.46,16),tex(T.thigh),0,-.16,0,lg);M(sph(.13,14,10),tex(T.thigh),0,.07,0,lg);}
      else{M(cyl(.095,.065,.4,14),tex(T.arm),0,-.14,0,lg);M(sph(.095,12,10),coat,0,.06,0,lg);}
      M(sph(.066,10,8),tex(sz<0?T.shinH:T.shinF),0,-.36,0,lg);
      M(cyl(.05,.042,.54,12),tex(sz<0?T.shinH:T.shinF),0,-.62,0,lg);
      M(cyl(.045,.055,.07,12),hoofM,0,-.885,.01,lg);}
    // the long neck leans forward
    const neck=new THREE.Group();neck.position.set(0,by+r*.35,len/2+r*.35);neck.rotation.x=.62;g.add(neck);const nl=.6;
    taperTube([fV(0,-.08,-.04),fV(0,nl*.4,0),fV(0,nl*.8,.01),fV(0,nl,0)],q=>.15-.065*q,coat,neck,24,14);
    M(sph(.03,8,6),brow,0,nl*.5,-.08,neck).scale.set(.8,6,1);// a short dark mane
    const head=new THREE.Group();head.position.set(0,nl+.04,0);head.rotation.x=-.62+.42;neck.add(head);const H=.12;
    // a pale face with a brown forehead and a long dark-tipped muzzle
    M(sph(H,22,16),face,0,0,0,head).scale.set(.85,.9,1.15);
    M(sph(H*.85,18,12),brow,0,H*.35,-H*.1,head).scale.set(.9,.6,1);
    const mz=M(sph(H*.62,18,14),face,0,-H*.3,H*1.1,head);mz.scale.set(.74,.72,1.5);
    M(sph(H*.36,14,10),nose,0,-H*.34,H*1.95,head).scale.set(1,.85,.7);
    for(const sx of [-1,1]){M(sph(H*.07,8,6),std('#0d0807'),sx*H*.16,-H*.24,H*2.15,head,false,false);
      // big upright ears, dark outside and pale inside
      const eg=new THREE.Group();eg.position.set(sx*H*.55,H*.62,-H*.35);eg.rotation.set(-.25,sx*.35,-sx*.55);head.add(eg);
      M(sph(H*.5,16,12),brow,0,H*.65,0,eg).scale.set(.62,1.35,.2);M(sph(H*.4,14,10),face,0,H*.62,H*.06,eg).scale.set(.55,1.2,.12);
      M(cyl(H*.07,H*.09,H*.35,8),brow,sx*H*.18,H*.9,-H*.05,head).rotation.z=-sx*.15;}// little skin-covered ossicones
    fEyes(this,head,H,.58,.15,.5,.75,.16,'#1a0f0a');
    const tail=new THREE.Group();tail.position.set(0,by+r*.25,-(len/2+r*.85));g.add(tail);
    taperTube([fV(0,0,0),fV(0,-.12,-.05),fV(0,-.32,-.04),fV(0,-.45,-.02)],q=>.03-.012*q,coat,tail,12,8);M(sph(.045,10,8),std('#1d1310'),0,-.5,-.02,tail).scale.set(.8,2,.8);
    Object.assign(o,{neck,head,tail,nTilt:.62,size:1.2,h:by+nl*.8+.3,rad:.55,dustR:[r,r,len*.8]});},
  // 🐘 the African elephant: huge, wrinkly and gray, with fan-shaped ears, ivory tusks and a trunk that swings and curls
  elephant(g,body,o){const r=.72,len=.82,hip=1.18,by=1.46,skinT=eleTex();
    const trunkM=std('#ffffff',{map:skinT,bumpMap:skinT,bumpScale:3,roughness:.95}),skin=std('#958d87',{bumpMap:eleBumpTex(),bumpScale:2.5,roughness:.95}),dark=std('#6f6762',{map:skinT,bumpMap:skinT,bumpScale:3,roughness:.95}),
      ivory=phys('#efe6d2',{roughness:.35,clearcoat:.6}),nail=std('#d9d0c2',{roughness:.6}),earIn=std('#b49c97',{map:skinT,roughness:.95,side:THREE.DoubleSide}),
      earM=std('#958d87',{bumpMap:eleBumpTex(),bumpScale:2,roughness:.95,side:THREE.DoubleSide});
    body.position.y=by;
    const t=M(fuzz(new THREE.CapsuleGeometry(r,len,12,28),.02,6),skin,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(.9,1.02,1);
    M(sph(r*.9,22,16),skin,0,-r*.22,0,body).scale.set(.95,.85,1.25);// round belly
    M(sph(r*.75,20,14),skin,0,r*.32,len*.32,body).scale.set(1,.8,1.1);// high shoulders
    // four thick pillar legs with wide round feet and toenails
    for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.52,hip,sz*len*.52);g.add(lg);this.legs.push({g:lg,ph});
      M(sph(.3,16,12),skin,0,0,0,lg).scale.set(1,1.2,1.1);
      M(fuzz(cyl(.25,.21,hip-.12,20),.012,14),skin,0,-(hip-.12)/2,0,lg);
      M(cyl(.22,.25,.14,22),dark,0,-hip+.07,0,lg);
      for(const a of [-.6,0,.6])M(sph(.06,10,8),nail,Math.sin(a)*.23,-hip+.05,Math.cos(a)*.23,lg,false,false).scale.set(1,.7,.5);}
    // a short neck and a big head
    const neck=new THREE.Group();neck.position.set(0,by+r*.22,len/2+r*.55);neck.rotation.x=.12;g.add(neck);
    const head=new THREE.Group();head.position.set(0,.05,.18);head.rotation.x=-.12;neck.add(head);const H=.46;
    M(fuzz(sph(H,24,18),.012,10),skin,0,0,0,head).scale.set(.95,1.05,.95);
    M(sph(H*.55,16,12),skin,0,H*.55,H*.15,head).scale.set(1.3,.7,1);// the domed forehead
    M(sph(H*.6,16,12),skin,0,-H*.35,H*.55,head).scale.set(.85,.85,.9);// where the trunk starts
    // huge ears shaped a bit like Africa, which flap to keep cool
    const es=new THREE.Shape();es.moveTo(0,.42);es.bezierCurveTo(.3,.58,.78,.5,.86,.12);es.bezierCurveTo(.9,-.18,.66,-.3,.5,-.5);
    es.bezierCurveTo(.4,-.68,.26,-.86,.12,-.78);es.bezierCurveTo(.02,-.6,.08,-.3,0,-.12);es.lineTo(0,.42);
    const eg=new THREE.ExtrudeGeometry(es,{depth:.025,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:16});eg.translate(0,0,-.012);
    const ig=new THREE.ShapeGeometry(es,16);
    // both ears hang from the side of the head and sweep BACK along the shoulders (turning the flat shape by +90° points it backward on
    // either side), a little open so they sit just outside the body; the pinkish inner side faces the body
    this.ears=[];for(const sx of [-1,1]){const e=new THREE.Group();e.position.set(sx*H*.85,H*.15,-H*.1);e.rotation.y=-sx*EAR_OPEN;head.add(e);
      const m=M(eg,earM,0,0,0,e);m.rotation.y=Math.PI/2;m.scale.set(1.35,1.35,1);
      const inn=M(ig,earIn,0,0,0,e,false,false);inn.rotation.y=Math.PI/2;inn.position.x=-sx*.03;inn.scale.set(1.24,1.2,1);
      this.ears.push({e,sx});}
    fEyes(this,head,H,.52,.18,.66,.85,.075,'#2a1a10');
    for(const sx of [-1,1])M(sph(H*.12,10,8),dark,sx*H*.5,H*.23,H*.66,head,false,false).scale.set(1.4,.5,.6);// wrinkly eyelids
    // ivory tusks curving forward and up
    for(const sx of [-1,1]){const tg=new THREE.Group();tg.position.set(sx*H*.32,-H*.52,H*.62);tg.rotation.y=-sx*.15;head.add(tg);
      taperTube([fV(0,0,0),fV(0,-.18,.1),fV(sx*.04,-.27,.3),fV(sx*.06,-.22,.48)],q=>.07-.055*q,ivory,tg,18,10);}
    M(sph(H*.3,12,10),skin,0,-H*.62,H*.55,head).scale.set(1,.6,.8);// mouth
    // the trunk: a chain of short pieces so it can sway and curl
    this.trunk=[];let par=new THREE.Group();par.position.set(0,-H*.45,H*.92);par.rotation.x=-.3;head.add(par);
    const N=9,seg=.165;for(let i=0;i<N;i++){const q=i/(N-1),ra=.15-.095*q,rb=.15-.095*Math.min(1,(i+1)/(N-1));
      const p=new THREE.Group();if(i)p.position.y=-seg;par.add(p);
      M(fuzz(cyl(ra,rb,seg+.02,16),.006,30),trunkM,0,-seg/2,0,p);M(sph(rb,14,10),trunkM,0,-seg,0,p);
      for(let w=0;w<2;w++)M(new THREE.TorusGeometry(ra*.99,.005,4,16),trunkM,0,-seg*(.3+w*.4),0,p,false,false).rotation.x=Math.PI/2;
      this.trunk.push(p);par=p;}
    M(cyl(.06,.065,.05,14),dark,0,-seg-.02,0,par);// the tip
    const tail=new THREE.Group();tail.position.set(0,by+r*.35,-(len/2+r*.95));g.add(tail);
    taperTube([fV(0,0,0),fV(0,-.25,-.08),fV(0,-.6,-.05),fV(0,-.85,-.02)],q=>.045-.025*q,skin,tail,14,8);
    for(let i=0;i<6;i++)M(cyl(.008,.004,.16,4),std('#2a2420'),Math.sin(i)*.02,-.92,Math.cos(i)*.02-.02,tail,false,false).rotation.z=(i-2.5)*.08;
    this.tick=(tm,dt,run)=>{// ears flap, the trunk swings (and reaches down while eating, curls up when happy)
      const fl=this.happy>0?.5+Math.sin(tm*9)*.35:.12+Math.sin(tm*1.6)*.12;for(const {e,sx} of this.ears)e.rotation.y=-sx*(EAR_OPEN+fl);// open outward, never into the face or the body
      const curl=this.happy>0?-.32:this.graze>.3?.04:-.05-.04*Math.max(0,Math.sin(tm*.4));
      this.trunk.forEach((p,i)=>{if(!i){p.rotation.x=-.3+this.graze*.3+Math.sin(tm*1.3)*.08;return;}p.rotation.x=curl*(1+i*.15)+Math.sin(tm*1.8-i*.5)*.05;p.rotation.z=Math.sin(tm*1.1-i*.4)*.05*(1+run*2);});};
    Object.assign(o,{neck,head,tail,nTilt:.12,gz:.35,size:2,h:by+r+.45,rad:1.25,dustR:[r,r,len*.8]});},
};
