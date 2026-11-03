/* ===== 🐊 American alligator: lives in the water behind the Safari Zoo with the hippo, and Bayou is one you can ride =====
   Real-looking: a long, low, dark olive body with rows of bony bumps (scutes) down the back and tail, short legs that stick out
   to the sides, a broad rounded snout (an alligator's, not a crocodile's pointy one) with teeth showing along the jaw,
   and its eyes and nostrils up on top so they stay above the water. It swims with its tail swishing side to side.
   It sinks into the canal like the hippo (swim in ZOOA and the ride, swimSink in 26f2-hippo-swim.js). One shared set of
   materials and a small bumpy skin texture for every alligator (safM). */
const gatorSkinTex=()=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);// a bump map: square scales in rows
  for(let j=0;j<10;j++)for(let i=0;i<10;i++){const c=110+((i*7+j*13)%5)*18;x.fillStyle=`rgb(${c},${c},${c})`;x.fillRect(i*12.8+1+(j%2)*6,j*12.8+1,11,11);}},3);
ZOO_BUILD.gator=function(g,body,o){const r=.24,len=.9,hip=.26,by=.3;
  const m=safM('gator',()=>{const bt=gatorSkinTex();bt.wrapS=bt.wrapT=THREE.RepeatWrapping;bt.repeat.set(3,3);
    return {skin:phys('#3d4a2e',{roughness:.6,bumpMap:bt,bumpScale:1.2,clearcoat:.25,clearcoatRoughness:.6}),// wet dark olive
      belly:std('#c9c39a',{roughness:.7}),scute:std('#2c3622',{roughness:.7}),tooth:std('#f2ecd8',{roughness:.4}),
      mouth:std('#c98a7a',{roughness:.6}),eye:phys('#c9a43a',{roughness:.15,clearcoat:1}),dk:std('#141410',{roughness:.5})};});
  body.position.y=by;
  // a long, wide, flat body
  const t=M(new THREE.CapsuleGeometry(r,len,10,22),m.skin,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(1.5,.7,1);
  M(sph(r*1.1,16,10),m.belly,0,-r*.42,0,body,false,false).scale.set(1.25,.35,3.4);// pale belly
  // rows of bony bumps down the back
  for(let i=0;i<10;i++){const z=len*.55-i*len/8.2;for(const sx of [-1,-.33,.33,1])M(sph(.04,6,4),m.scute,sx*r*.75,r*.68-Math.abs(sx)*.03,z,body,false,false).scale.set(1,1,1.5);}
  // short legs that stick out sideways, with the elbows bent and the feet flat on the ground
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*1.25,hip,sz*len*.38);g.add(lg);this.legs.push({g:lg,ph});
    const up=M(cyl(.075,.06,.22,10),m.skin,sx*.1,-.02,0,lg);up.rotation.z=sx*1.35;
    M(sph(.06,8,6),m.skin,sx*.2,-.04,0,lg);M(cyl(.055,.05,.2,10),m.skin,sx*.21,-.13,0,lg);
    const ft=M(sph(.075,10,8),m.skin,sx*.22,-hip+.03,.05,lg);ft.scale.set(1.1,.35,1.4);
    for(const a of [-.5,-.17,.17,.5])M(sph(.022,6,4),m.dk,sx*.22+Math.sin(a)*.07,-hip+.025,.05+Math.cos(a)*.1,lg,false,false).scale.set(.8,.6,1.3);}
  // the head: low and flat, a broad rounded snout, eyes and nostrils on top
  const neck=new THREE.Group();neck.position.set(0,by+.02,len/2+r*.7);neck.rotation.x=0;g.add(neck);
  M(sph(r*1.05,14,10),m.skin,0,-.01,-.05,neck).scale.set(1.3,.62,1.3);
  const head=new THREE.Group();head.position.set(0,.02,.18);neck.add(head);const H=.18;
  M(sph(H,16,12),m.skin,0,0,0,head).scale.set(1.25,.62,1.1);// back of the head
  const top=new THREE.Group();head.add(top);
  // the broad U-shaped snout: a flat rounded slab
  {const sn=M(new THREE.CapsuleGeometry(H*.8,H*2.2,8,16),m.skin,0,0,H*1.75,top);
   sn.rotation.x=Math.PI/2;sn.scale.set(1.02,1,.3);}
  for(const sx of [-1,1]){M(sph(H*.34,12,10),m.skin,sx*H*.48,H*.36,H*.15,head).scale.set(1,.85,1.1);// eye bumps
    const eg=new THREE.Group();eg.position.set(sx*H*.6,H*.48,H*.28);head.add(eg);this.eyes.push(eg);// (eyes blink by squashing this group)
    M(sph(H*.2,12,10),m.eye,0,0,0,eg,false,false).scale.set(.75,.75,1);M(sph(H*.06,8,6),m.dk,sx*H*.04,H*.02,H*.07,eg,false,false).scale.set(.4,1.2,.4);// slit pupils
    M(sph(H*.1,8,6),m.skin,sx*H*.16,H*.2,H*3.2,top).scale.set(1,.7,1);M(sph(H*.045,6,4),m.dk,sx*H*.16,H*.26,H*3.24,top,false,false);// nostrils on a bump at the tip
    for(let i=0;i<9;i++)M(new THREE.ConeGeometry(H*.05,H*.18,5),m.tooth,sx*H*.76,-H*.26,H*(.75+i*.3),top,false,false).rotation.x=Math.PI;}// top teeth along the jaw
  for(let i=0;i<4;i++)M(sph(.02,6,4),m.scute,0,H*.24,H*(-.4-i*.3),head,false,false).scale.set(1,.8,1.6);
  // the bottom jaw hinges at the back, so it can open
  const jaw=new THREE.Group();jaw.position.set(0,-H*.22,H*.1);head.add(jaw);
  {const jg=new THREE.CapsuleGeometry(H*.74,H*2.1,8,16);const jw=M(jg,m.belly,0,-H*.05,H*1.6,jaw);jw.rotation.x=Math.PI/2;jw.scale.set(1,1,.22);
   const mo=M(new THREE.CapsuleGeometry(H*.6,H*1.9,6,12),m.mouth,0,H*.06,H*1.6,jaw,false,false);mo.rotation.x=Math.PI/2;mo.scale.set(1,1,.08);}
  for(const sx of [-1,1])for(let i=0;i<8;i++)M(new THREE.ConeGeometry(H*.04,H*.12,5),m.tooth,sx*H*.74,H*.06,H*(.7+i*.3),jaw,false,false);
  // a long, thick tail that tapers flat, with two rows of bumps along the top
  const tail=new THREE.Group();tail.position.set(0,by,-(len/2+r*.6));g.add(tail);
  const tp=[fV(0,0,0),fV(0,-.04,-.4),fV(0,-.08,-.8),fV(0,-.1,-1.2)];
  const tt=taperTube(tp,q=>r*(1-q*.9),m.skin,tail,22,10);if(tt)tt.scale.set(.85,.75,1);
  const tc=new THREE.CatmullRomCurve3(tp);for(let i=1;i<12;i++){const q=i/12,p=tc.getPoint(q),w=r*(1-q*.9);
    for(const sx of (q<.55?[-1,1]:[0]))M(new THREE.ConeGeometry(.03*(1-q*.5),.06,4),m.scute,sx*w*.35,p.y+w*.72,p.z,tail,false,false);}
  // swish the tail as it swims or walks, and open the mouth wide now and then
  this.gape=0;this.gapeT=5+Math.random()*8;
  this.tick=(tt2,dt,run)=>{const sw=this.sw&&this.sw.k>.4;tail.rotation.y=Math.sin(tt2*(sw?3.2:1.6+run*4))*(sw?.38:.12+run*.2);
    this.gapeT-=dt;if(this.gapeT<0&&!run&&!this.ridden){this.gape=2.2;this.gapeT=9+Math.random()*12;}
    const op=this.gape>0?Math.sin(Math.min(1,(2.2-this.gape)/2.2)*Math.PI):0;this.gape=Math.max(0,this.gape-dt);jaw.rotation.x=op*.55;top.rotation.x=-op*.12;};
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.15,size:1.3,h:by+r+.25,rad:.75,dustR:[r,r,len*.8]});};
