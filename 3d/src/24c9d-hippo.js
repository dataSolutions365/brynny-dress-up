/* ===== 🦛 Hippos, and swimming with them =====
   - ZOO_BUILD.hippo: a real-looking common hippo (a huge barrel body on short legs, a giant square muzzle, eyes, ears and nostrils
     on top of the head so they stay above the water). Now and then it opens its mouth in a big hippo yawn.
     It lives in the hippo pool at the Safari Zoo (12d-place-zoo.js, ZOOA in 24d-barn.js), and Kiboko is the one you ride (24i-earned-rides.js).
   - Swimming with hippos (in the hippo pool and in 🐬 Dolphin Bay) is in 26f2-hippo-swim.js.
   One shared set of materials for every hippo, and no textures (iPhone memory). */
const HIPM=()=>safM('hippo',()=>({skin:phys('#7f6d70',{roughness:.45,clearcoat:.35,clearcoatRoughness:.5}),// wet, shiny gray-purple skin
  pink:phys('#c98e88',{roughness:.5,clearcoat:.3}),mouth:std('#b5545e',{roughness:.6}),tusk:std('#efe6d2',{roughness:.4}),
  dk:std('#2a2022',{roughness:.5}),nail:std('#4e4446',{roughness:.6}),
  rip:new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide})}));

ZOO_BUILD.hippo=function(g,body,o){const r=.5,len=.86,hip=.36,by=.68,m=HIPM();
  body.position.y=by;
  // the barrel: wide and deep, with a round belly that hangs low and a big rump
  const t=M(new THREE.CapsuleGeometry(r,len,12,24),m.skin,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(1.12,.92,1);
  M(sph(r*.92,18,12),m.skin,0,-r*.18,0,body).scale.set(1.15,.85,1.25);// belly
  M(sph(r*.95,18,12),m.skin,0,.04,-len*.42,body).scale.set(1.05,.95,.95);// rump
  M(sph(r*.85,18,12),m.skin,0,.06,len*.4,body).scale.set(1.1,.98,.9);// shoulders
  M(sph(r*.7,14,10),m.pink,0,-r*.5,len*.05,body,false,false).scale.set(1.15,.55,1.5);// pinker underneath
  // four short, thick legs with four toes each
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.68,hip,sz*len*.44);g.add(lg);this.legs.push({g:lg,ph});
    M(sph(.19,14,10),m.skin,0,.12,0,lg).scale.set(.95,1.3,1.05);M(cyl(.19,.17,hip-.06,14),m.skin,0,-(hip-.06)/2,0,lg);
    M(cyl(.17,.19,.07,16),m.skin,0,-hip+.035,0,lg);
    for(const a of [-.75,-.25,.25,.75])M(sph(.045,8,6),m.nail,Math.sin(a)*.16,-hip+.035,Math.cos(a)*.15,lg,false,false).scale.set(1,.7,.7);}
  // a short, thick neck and a huge head
  const neck=new THREE.Group();neck.position.set(0,by+.1,len/2+r*.6);neck.rotation.x=.12;g.add(neck);
  M(sph(.42,18,12),m.skin,0,0,0,neck).scale.set(1.05,.95,1);
  const head=new THREE.Group();head.position.set(0,.08,.32);head.rotation.x=-.12+.06;neck.add(head);const H=.34;
  M(sph(H,20,14),m.skin,0,H*.1,0,head).scale.set(1.15,.95,1.25);// skull
  // the giant muzzle: two big round whisker pads side by side, wider than the head
  const up=new THREE.Group();up.position.set(0,0,0);head.add(up);
  M(sph(H*.75,18,12),m.skin,0,-H*.05,H*.9,up).scale.set(1.3,.85,1);
  for(const sx of [-1,1]){M(sph(H*.6,16,12),m.skin,sx*H*.5,-H*.15,H*1.25,up).scale.set(1,.9,1);
    // nostrils on bumps on top, and the eyes on top bumps too (so they stay above the water)
    M(sph(H*.17,10,8),m.skin,sx*H*.32,H*.32,H*1.55,up).scale.set(1,.6,1.1);M(sph(H*.07,8,6),m.dk,sx*H*.32,H*.4,H*1.6,up,false,false).scale.set(1.2,.4,1.6);
    M(sph(H*.28,12,10),m.skin,sx*H*.48,H*.72,H*.3,head).scale.set(1,.9,1);// the eyes sit up on bumps
    M(sph(H*.17,10,8),m.pink,sx*H*.56,H*.8,H*.46,head,false,false).scale.set(1,.75,.6);// pink rims round the eyes
    const e=M(sph(H*.16,10,8),m.skin,sx*H*.5,H*1.02,-H*.18,head);e.scale.set(.75,1.3,.5);e.rotation.z=-sx*.35;// little round ears
    M(sph(H*.1,8,6),m.pink,sx*H*.52,H*1.04,-H*.12,head,false,false).scale.set(.6,1.1,.3);}
  fEyes(this,head,H,.56,.82,.52,.55,.15,'#2a1a10');
  M(sph(H*.55,14,10),m.mouth,0,-H*.55,H*1.2,up,false,false).scale.set(1.5,.25,1.1);// inside of the top of the mouth (seen when it yawns)
  // the lower jaw hinges at the back, so it can open wide
  const jaw=new THREE.Group();jaw.position.set(0,-H*.42,H*.25);head.add(jaw);
  M(sph(H*.7,16,12),m.skin,0,-H*.08,H*.85,jaw).scale.set(1.45,.55,1.2);
  M(sph(H*.55,14,10),m.pink,0,-H*.18,H*.95,jaw,false,false).scale.set(1.5,.4,1.1);
  M(sph(H*.5,14,10),m.mouth,0,H*.02,H*.9,jaw,false,false).scale.set(1.4,.2,1.1);// tongue and inside of the bottom jaw
  for(const sx of [-1,1]){const tk=M(new THREE.ConeGeometry(H*.08,H*.42,8),m.tusk,sx*H*.62,H*.12,H*1.35,jaw,false,false);tk.rotation.x=-.25;}// big bottom tusks
  // a short, flat tail with a little tuft
  const tail=new THREE.Group();tail.position.set(0,by+r*.25,-(len/2+r*.95));g.add(tail);
  taperTube([fV(0,0,0),fV(0,-.1,-.08),fV(0,-.22,-.08)],q=>.05-.02*q,m.skin,tail,8,8);M(sph(.04,8,6),m.dk,0,-.25,-.08,tail).scale.set(1.4,1.2,.6);
  // a big hippo yawn every now and then
  this.yawn=0;this.yawnT=6+Math.random()*8;
  this.tick=(tt,dt,run)=>{this.yawnT-=dt;if(this.yawnT<0&&!run&&!this.ridden){this.yawn=2.6;this.yawnT=10+Math.random()*14;}
    const op=this.yawn>0?Math.sin(Math.min(1,(2.6-this.yawn)/2.6)*Math.PI):0;this.yawn=Math.max(0,this.yawn-dt);
    jaw.rotation.x=op*.95;head.rotation.x=-.25+.12-op*.55;};
  Object.assign(o,{neck,head,tail,nTilt:.25,gz:.3,size:1.4,h:by+r+.55,rad:.9,dustR:[r,r,len*.8]});};

