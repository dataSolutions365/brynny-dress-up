/* ===== 🦖 Dinosaurs: real-looking dinosaurs for 🦕 Dino Valley (26y-dino-valley.js), built like the zoo animals (ZOO_BUILD) =====
   - ZOO_BUILD.trexR (Tyrannosaurus rex), raptorR (a feathered raptor, Deinonychus), trikeR (Triceratops), longneckR (Brachiosaurus)
     and stegoR (Stegosaurus). They're built to look like the real animals as scientists picture them today: earthy colours,
     darker on the back and pale underneath, scaly skin (feathers on the raptor, like the real ones), no cartoon eyes or smiles.
   - Kid-safe: the T. rex has lips over its teeth (like scientists now think), and its roar is just a big rumbly head-up roar.
   - The same builders make the dinosaurs that live at Dino Valley (DINOA, 24n-dino-valley.js) and the ones you adopt or buy
     (FARM in 24d-barn.js uses them through model:, with scale: for the young ones). Rides get a saddle (dnSaddle) that keeps its
     real size however small the dinosaur is, so F.ride (where you sit) is worked out from the body: see the note on each builder.
   - Each body part is one smooth tube along a "spine" (dnTube), with its colours painted on its corners (dnPaint) so one shared
     material per kind of dinosaur is enough (dnM keeps one of each), which keeps phones light. */
const DNM={};const dnM=(k,make)=>DNM[k]||(DNM[k]=make());
const dnV=(x,y,z)=>new THREE.Vector3(x,y,z);
// little round scales, and fine feather streaks, as bumps
const dnBump=()=>dnM('bump',()=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);
  for(let i=0;i<700;i++){const c=70+(Math.random()*110|0);x.fillStyle=`rgb(${c},${c},${c})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1.2+Math.random()*2.6,0,7);x.fill();}},4));
const dnFeatherBump=()=>dnM('fbump',()=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);x.lineCap='round';
  for(let i=0;i<520;i++){const X=Math.random()*w,Y=Math.random()*h,c=60+(Math.random()*140|0);x.strokeStyle=`rgb(${c},${c},${c})`;x.lineWidth=1+Math.random()*1.5;
    x.beginPath();x.moveTo(X,Y);x.lineTo(X+(Math.random()-.5)*3,Y+6+Math.random()*8);x.stroke();}},4));
// the skin is white so the colours painted on each shape show through
const dnSkin=(k,feather)=>dnM('skin'+k,()=>std('#ffffff',{vertexColors:true,roughness:feather?.95:.82,bumpMap:feather?dnFeatherBump():dnBump(),bumpScale:feather?1.4:1.1}));
// countershading: `top` on the back fading to `belly` underneath; pat(x,y,z,ny) can darken a spot (0..1) for stripes and blotches
function dnPaint(geo,top,belly,pat){const p=geo.attributes.position,n=geo.attributes.normal,c=new Float32Array(p.count*3),A=new THREE.Color(top),B=new THREE.Color(belly),C=new THREE.Color();
  for(let i=0;i<p.count;i++){const ny=n.getY(i),t=Math.min(1,Math.max(0,(ny+.62)/.85));C.copy(B).lerp(A,t*t*(3-2*t));
    if(pat){const d=pat(p.getX(i),p.getY(i),p.getZ(i),ny);if(d)C.multiplyScalar(1-d);}c[i*3]=C.r;c[i*3+1]=C.g;c[i*3+2]=C.b;}
  geo.setAttribute('color',new THREE.BufferAttribute(c,3));return geo;}
// radius along a tube: a list of radii from one end to the other (smoothly blended), or a function of q (0..1)
const dnR=rs=>typeof rs==='function'?rs:q=>{const f=q*(rs.length-1),i=Math.min(rs.length-2,Math.floor(f)),t=f-i,s=t*t*(3-2*t);return rs[i]+(rs[i+1]-rs[i])*s;};
// one smooth body part along a spine (pts as [x,y,z]). sx/sy squash it (only for spines that stay in the up/forward plane, x = 0).
// col = [top, belly, pat]. Returns top(q): the point on top of the part, q of the way along (for plates, bumps and saddles).
function dnTube(pts,rs,mat,par,col,o={}){const seg=o.seg||28,rad=o.rad||14,sx=o.sx||1,sy=o.sy||1,rf=dnR(rs);
  const c=new THREE.CatmullRomCurve3(pts.map(p=>dnV(p[0],p[1],p[2]))),g=new THREE.TubeGeometry(c,seg,1,rad,false),p=g.attributes.position,P=new THREE.Vector3();
  for(let i=0;i<=seg;i++){c.getPointAt(i/seg,P);const r=rf(i/seg);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;
    p.setXYZ(k,P.x+(p.getX(k)-P.x)*r*sx,P.y+(p.getY(k)-P.y)*r*sy,P.z+(p.getZ(k)-P.z)*r*sy);}}
  g.computeVertexNormals();dnPaint(g,col[0],col[1],col[2]);M(g,mat,0,0,0,par);
  for(const q of [0,1]){const e=c.getPointAt(q),r=rf(q);if(r>.015)M(dnPaint(sph(r,12,8),col[0],col[1],col[2]),mat,e.x,e.y,e.z,par).scale.set(sx,sy,sy);}// round ends
  return {top:(q,v=new THREE.Vector3())=>{c.getPointAt(q,v);v.y+=rf(q)*sy*.96;return v;},at:(q,v=new THREE.Vector3())=>c.getPointAt(q,v),r:rf};}
// a real-looking eye (amber iris, dark round pupil) that blinks with the others (a.eyes)
function dnEye(a,par,x,y,z,r,col,ry){const e=new THREE.Group();e.position.set(x,y,z);e.rotation.y=ry;par.add(e);
  const iris=dnM('iris'+col,()=>phys(col,{roughness:.12,clearcoat:1,clearcoatRoughness:.05})),pup=dnM('pupil',()=>std('#0b0a08',{roughness:.2}));
  M(sph(r,14,10),iris,0,0,0,e,false,false);M(sph(r*.52,10,8),pup,0,0,r*.66,e,false,false).scale.set(.75,.9,.5);a.eyes.push(e);return e;}
// a leg hanging from its hip or shoulder: one smooth tube through the joints (it swings from the top in FarmAnimal.update)
function dnLeg(a,par,x,y,z,ph,joints,rads,mat,col){const lg=new THREE.Group();lg.position.set(x,y,z);par.add(lg);a.legs.push({g:lg,ph});
  dnTube(joints,rads,mat,lg,col,{seg:16,rad:10});return lg;}
// three forward toes with claws (theropods); P = the ball of the foot, toes reach len forward, r thick
function dnToes(lg,P,len,r,mat,col,claw,spread=.34,n=3){for(let i=0;i<n;i++){const s=n===3?i-1:i?.5:-.5,tg=new THREE.Group();tg.position.set(P[0],P[1],P[2]);tg.rotation.y=s*spread;lg.add(tg);const L=len*(s&&n===3?.8:1);
  dnTube([[0,0,0],[0,-r*.3,L*.5],[0,-r*.55,L]],[r,r*.72,r*.45],mat,tg,col,{seg:6,rad:8});
  const cl=M(new THREE.ConeGeometry(r*.36,r*1.1,8),claw,0,-r*.68,L+r*.32,tg,false,false);cl.rotation.x=Math.PI/2+.5;}}
// a round elephant-like foot pad with blunt nails (the big plant-eaters); y = the ground under the leg
function dnPad(lg,y,r,mat,col,nail,n=3){M(dnPaint(cyl(r*.92,r*1.06,r*.75,16),col[0],col[1]),mat,0,y+r*.37,0,lg);
  for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.5;M(sph(r*.24,8,6),nail,Math.sin(a)*r*.98,y+r*.16,Math.cos(a)*r*.98,lg,false,false).scale.set(1,.75,.7);}}
// a horn or spike from its base (x,y,z), pointing up, then tipped forward by rx and outward by rz
function dnHorn(par,mat,x,y,z,r,h,rx,rz){const g=new THREE.ConeGeometry(r,h,12);g.translate(0,h/2,0);const m=M(g,mat,x,y,z,par);m.rotation.set(rx,0,rz);return m;}
const dnClaw=()=>dnM('claw',()=>phys('#2a241c',{roughness:.35,clearcoat:.4}));
const dnHornM=()=>dnM('horn',()=>phys('#ddd2b6',{roughness:.45,clearcoat:.3}));
const dnDark=()=>dnM('dark',()=>std('#1c1814',{roughness:.6}));
// 🏇 a saddle on a blanket, for the dinosaurs you ride (any dinosaur with F.ride). The saddle keeps its real size however small the
// dinosaur is (it's scaled by 1/F.scale). y,z: the middle of the body under it, r its radius there, sx/sy the body's squash.
// You sit at about F.ride = F.scale * (body height + y + r*sy) + .06 off the ground.
function dnSaddle(a,body,y,z,r,sx,sy,col){if(!a.F.ride)return;const inv=1/(a.F.scale||1);
  const cm=dnM('blanket'+col,()=>phys(col,{roughness:.9,sheen:.8,sheenColor:new THREE.Color('#ffffff'),side:THREE.DoubleSide})),tm=dnM('btrim',()=>phys('#e8c46a',{roughness:.4,metalness:.3})),
    leather=dnM('leather',()=>phys('#6a3a1e',{roughness:.5,clearcoat:.4,clearcoatRoughness:.4})),dkL=dnM('leatherD',()=>phys('#3e2112',{roughness:.6}));
  const arc=2.2,len=.5*inv,bg=new THREE.Group();bg.position.set(0,y,z);bg.scale.set(sx,sy,1);body.add(bg);
  const cg=new THREE.CylinderGeometry(r*1.035,r*1.035,len,36,1,true,Math.PI-arc/2,arc);cg.rotateX(Math.PI/2);M(cg,cm,0,0,0,bg);
  for(const s of [-1,1]){const e=M(new THREE.TorusGeometry(r*1.035,.014*inv,6,36,arc),tm,0,0,s*len/2,bg,false,false);e.rotation.z=Math.PI/2-arc/2;}
  const sg=new THREE.Group();sg.position.set(0,y+r*sy*1.03,z);sg.scale.setScalar(inv);body.add(sg);
  M(sph(.17,20,12),leather,0,.02,0,sg).scale.set(.95,.22,1.25);M(sph(.06,12,8),leather,0,.065,.17,sg).scale.set(1.2,1.1,.8);
  M(sph(.1,14,10),leather,0,.06,-.17,sg).scale.set(1.3,.6,.45);
  for(const s of [-1,1]){const f=M(sph(.12,14,10),dkL,s*.13,-.05,0,sg);f.scale.set(.25,.7,1.1);f.rotation.z=s*.5;}}

/* ---------- 🦖 Tyrannosaurus rex: a huge head with lips over the teeth, tiny two-fingered arms, a deep chest, big legs and a long
   stiff tail held out for balance. Olive brown with faint darker bands over the back. Now and then it lifts its head and roars
   (just the head and jaw; it never chases anyone). Ride (Chomper): scale .32 => F.ride 1.15 ---------- */
ZOO_BUILD.trexR=function(g,body,o){const by=2.45,m=dnSkin('trex'),C=['#5f5838','#cdbf98',(x,y,z,ny)=>ny>0?Math.max(0,Math.sin(z*2.6+1))*.3*ny:0],
  dk=dnDark(),mouth=dnM('mouthT',()=>std('#7c4440',{roughness:.7})),tooth=dnM('toothT',()=>std('#efe6cc',{roughness:.4}));
  body.position.y=by;
  // a deep chest, a round belly and strong hips
  const T=dnTube([[0,.5,1.7],[0,.25,1.15],[0,.03,.35],[0,.1,-.45],[0,.22,-1.05]],[.42,.72,.85,.74,.6],m,body,C,{sx:.72,seg:24,rad:16});
  // a row of small bony bumps down the back
  const bm=dnM('trexBump',()=>std('#4a4430',{roughness:.8}));for(let i=0;i<9;i++){const p=T.top(.12+i*.1);M(sph(.06,8,6),bm,0,p.y,p.z,body,false,false).scale.set(1.2,.6,1.6);}
  // the tail: thick at the hips, long and stiff
  const tail=new THREE.Group();tail.position.set(0,.22,-.95);body.add(tail);
  const TL=dnTube([[0,0,.2],[0,-.05,-.9],[0,-.2,-2.1],[0,-.38,-3.3],[0,-.5,-4.3]],[.6,.5,.32,.15,.03],m,tail,C,{sx:.66,sy:1.1,seg:26,rad:12});
  for(let i=0;i<10;i++){const p=TL.top(.04+i*.075);M(sph(.05-i*.003,8,6),bm,0,p.y,p.z,tail,false,false).scale.set(1.2,.6,1.6);}
  // tiny arms with two fingers each
  for(const s of [-1,1]){const ag=new THREE.Group();ag.position.set(s*.36,-.3,1.25);body.add(ag);
    dnTube([[0,0,0],[s*.06,-.28,.1],[s*.05,-.36,.34]],[.11,.075,.055],m,ag,C,{seg:8,rad:8});
    for(const f of [-1,1]){dnTube([[s*.05,-.36,.34],[s*.05+f*.03,-.44,.43]],[.035,.022],m,ag,C,{seg:4,rad:6});
      M(new THREE.ConeGeometry(.018,.06,6),dk,s*.05+f*.03,-.47,.45,ag,false,false).rotation.x=2.3;}}
  // strong legs: a big thigh, long shin and three toes
  for(const s of [-1,1]){const H=by+.05,lg=dnLeg(this,g,s*.5,H,-.45,s<0?0:Math.PI,[[0,0,0],[0,-.95,.42],[0,-1.8,-.2],[0,-2.33,.08]],[.5,.34,.2,.15],m,C);
    M(dnPaint(sph(.55,16,12),C[0],C[1]),m,0,-.4,.12,lg).scale.set(.72,1.3,1.05);
    dnToes(lg,[0,-H+.12,.1],.55,.11,m,C,dnClaw());}
  // the neck and the big head
  const neck=new THREE.Group();neck.position.set(0,by+.5,1.6);g.add(neck);
  dnTube([[0,-.28,-.35],[0,0,.1],[0,.25,.45],[0,.38,.78]],[.5,.47,.42,.4],m,neck,C,{sx:.78,seg:12,rad:14});
  const head=new THREE.Group();head.position.set(0,.42,.84);neck.add(head);
  dnTube([[0,.06,-.22],[0,.09,.25],[0,.01,.75],[0,-.06,1.15],[0,-.11,1.38]],[.38,.4,.31,.22,.11],m,head,C,{sx:.8,seg:18,rad:14});
  // inside the mouth (only seen when it opens), and the teeth, which the lips cover when it's closed
  M(sph(.2,12,8),mouth,0,-.2,.65,head,false,false).scale.set(.95,.3,3);
  for(const s of [-1,1])for(let i=0;i<7;i++)M(new THREE.ConeGeometry(.018,.05,6),tooth,s*(.16-i*.015),-.13,.32+i*.13,head,false,false).rotation.x=Math.PI;
  const jaw=new THREE.Group();jaw.position.set(0,-.17,0);head.add(jaw);
  dnTube([[0,-.02,-.18],[0,-.1,.45],[0,-.1,.95],[0,-.06,1.24]],[.27,.22,.16,.08],m,jaw,['#6c6344','#d8cca8'],{sx:.92,sy:.62,seg:12,rad:12});
  // brow ridges with little horns over the eyes, eyes that look forward, and nostrils at the end of the snout
  for(const s of [-1,1]){M(dnPaint(sph(.11,10,8),C[0],C[1]),m,s*.24,.3,.4,head).scale.set(1,.6,1.5);M(sph(.045,8,6),bm,s*.25,.36,.33,head,false,false).scale.set(1,.8,1.4);
    dnEye(this,head,s*.27,.19,.5,.055,'#c8922c',s*.9);
    M(sph(.035,8,6),dk,s*.09,.04,1.32,head,false,false).scale.set(1,.6,1.6);}
  // breathing, and a big roar now and then (head up, jaw open, no biting)
  let rT=5+Math.random()*10,roar=0;
  this.tick=(t,dt,run)=>{body.scale.y=1+Math.sin(t*1.2)*.01;rT-=dt;
    if(rT<0&&run<.1&&!this.ridden){rT=14+Math.random()*18;roar=2.4;if(this.g.parent&&this.g.visible)this.speak('*big rumbly ROAR* 🦖');}
    if(roar>0){roar-=dt;const k=Math.sin(Math.min(1,(2.4-roar)/2.4)*Math.PI);head.rotation.x=-k*.38;jaw.rotation.x=k*.42;}
    else{head.rotation.x*=.9;jaw.rotation.x*=.9;}};
  dnSaddle(this,body,.07,.15,.84,.72,1,'#3a5a8a');
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.3,size:2.2,h:by+1.5,rad:1.3,biped:true,dustR:[.8,.8,1.2]});};

/* ---------- 🦖 Raptor (Deinonychus): a fast, feathered hunter about as long as a car, with feathered arms like little wings,
   a fan of feathers on the end of its stiff tail, and the big curved claw on each foot held up off the ground.
   Brown with pale underneath and darker bars, like a bird of prey. Quick bird-like head turns. ---------- */
ZOO_BUILD.raptorR=function(g,body,o){const by=.92,m=dnSkin('rap',true),C=['#5c3f27','#e8dcc2',(x,y,z,ny)=>ny>.15?Math.max(0,Math.sin(z*16))*.32*ny:0],
  fe=dnM('rapFe',()=>std('#3b2a1c',{roughness:.95,side:THREE.DoubleSide})),feL=dnM('rapFeL',()=>std('#efe4cf',{roughness:.95,side:THREE.DoubleSide})),claw=dnClaw();
  body.position.y=by;
  const T=dnTube([[0,.24,.55],[0,.12,.32],[0,.02,0],[0,.06,-.3],[0,.1,-.45]],[.12,.2,.25,.22,.17],m,body,C,{sx:.72,seg:18,rad:12});
  // soft feathers along the back
  for(let i=0;i<9;i++){const p=T.top(.1+i*.1),f=M(new THREE.PlaneGeometry(.07,.13),fe,0,p.y+.02,p.z-.03,body,false,false);f.rotation.x=-1.15;}
  const tail=new THREE.Group();tail.position.set(0,.1,-.42);body.add(tail);
  dnTube([[0,0,.08],[0,.02,-.4],[0,.03,-1.0],[0,0,-1.5]],[.16,.1,.05,.02],m,tail,C,{sx:.8,seg:16,rad:10});
  // a fan of long feathers on both sides of the end of the tail
  for(let i=0;i<9;i++){const z=-.6-i*.11;for(const s of [-1,1]){const f=M(new THREE.PlaneGeometry(.05,.24),i%3?fe:feL,s*.1,.02,z-.06,tail,false,false);f.rotation.set(-Math.PI/2,0,-s*(1-i*.05));}}
  // arms folded like wings, with long feathers hanging down
  for(const s of [-1,1]){const ag=new THREE.Group();ag.position.set(s*.15,-.02,.36);ag.rotation.z=s*.15;body.add(ag);
    dnTube([[0,0,0],[s*.05,-.12,-.13],[s*.05,-.2,.05],[s*.05,-.24,.2]],[.07,.045,.04,.03],m,ag,C,{seg:10,rad:8});
    for(let i=0;i<6;i++){const f=M(new THREE.PlaneGeometry(.06,.22-i*.015),i%2?fe:feL,s*.075,-.21+i*.005,-.1+i*.055,ag,false,false);f.rotation.set(-.35,s*Math.PI/2,0);}
    for(const k of [-1,1])M(new THREE.ConeGeometry(.012,.05,6),claw,s*.05,-.27,.22+k*.015,ag,false,false).rotation.x=2.4;}
  // long legs: two toes on the ground and the big curved claw held up
  for(const s of [-1,1]){const H=by+.02,lg=dnLeg(this,g,s*.15,H,-.1,s<0?0:Math.PI,[[0,0,0],[0,-.36,.16],[0,-.7,-.1],[0,-.9,.04]],[.14,.08,.05,.04],m,C);
    M(dnPaint(sph(.14,12,10),C[0],C[1]),m,0,-.14,.05,lg).scale.set(.75,1.4,1);
    dnToes(lg,[s*.01,-H+.03,.04],.14,.03,m,C,claw,.18,2);
    const sk=M(new THREE.TorusGeometry(.04,.009,6,10,Math.PI*.7),claw,-s*.03,-H+.08,.07,lg,false,false);sk.rotation.set(0,Math.PI/2,.2);}
  // an S-shaped neck, a long low snout, a feathery crest down the back of the neck
  const neck=new THREE.Group();neck.position.set(0,by+.26,.52);g.add(neck);
  dnTube([[0,-.08,-.1],[0,.1,.05],[0,.25,.06],[0,.36,.16]],[.13,.1,.085,.08],m,neck,C,{sx:.85,seg:12,rad:10});
  for(let i=0;i<6;i++){const f=M(new THREE.PlaneGeometry(.06,.11),fe,0,.0+i*.065,-.04-i*.005+(i>3?.04:0),neck,false,false);f.rotation.x=-.5;}
  const head=new THREE.Group();head.position.set(0,.38,.2);neck.add(head);
  dnTube([[0,.02,-.08],[0,.03,.08],[0,-.01,.24],[0,-.03,.36]],[.085,.08,.055,.026],m,head,['#4a3220','#dccdae'],{sx:.8,seg:12,rad:10});
  dnTube([[0,-.05,-.05],[0,-.065,.18],[0,-.055,.32]],[.05,.035,.018],m,head,['#4a3220','#e2d5b8'],{sx:.85,sy:.55,seg:8,rad:8});
  for(const s of [-1,1]){dnEye(this,head,s*.058,.045,.05,.022,'#d8a030',s*1.25);M(sph(.012,6,4),dnDark(),s*.022,.0,.33,head,false,false);}
  // quick, bird-like looks around
  let lk=0,want=0;this.tick=(t,dt,run)=>{lk-=dt;if(lk<0){lk=.5+Math.random()*1.4;want=(Math.random()*2-1)*.5;}head.rotation.y+=(want-head.rotation.y)*Math.min(1,dt*14);};
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.45,size:.8,h:1.75,rad:.45,biped:true,dustR:[.2,.2,.3]});};

/* ---------- 🦕 Triceratops: a big four-legged plant-eater with a huge head, a bony frill with a scalloped edge, two long horns over
   the eyes, a short one on the nose and a parrot-like beak. Ride (Trixie): scale .4 => F.ride 1.1 ---------- */
ZOO_BUILD.trikeR=function(g,body,o){const by=1.45,m=dnSkin('trike'),C=['#6a6446','#cfc19c',(x,y,z,ny)=>ny>.3?(Math.sin(x*9)*Math.sin(z*7)>.35?.16:0):0],
  horn=dnHornM(),beak=dnDark(),nail=dnClaw();
  body.position.y=by;
  dnTube([[0,-.05,1.35],[0,.12,.75],[0,.25,0],[0,.22,-.7],[0,.05,-1.2]],[.55,.78,.88,.8,.55],m,body,C,{sx:.88,seg:22,rad:16});
  const tail=new THREE.Group();tail.position.set(0,.05,-1.1);body.add(tail);
  dnTube([[0,0,.15],[0,-.15,-.7],[0,-.4,-1.6],[0,-.62,-2.3]],[.5,.36,.18,.04],m,tail,C,{sx:.75,sy:1.05,seg:18,rad:12});
  // four strong legs (the back ones longer), elephant-like feet
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const fr=sz>0,H=fr?by-.05:by+.05,
    lg=dnLeg(this,g,sx*(fr?.5:.48),H,fr?.95:-.62,ph,fr?[[0,0,0],[sx*.04,-.6,.06],[0,-1.05,-.02],[0,-H+.2,.03]]:[[0,0,0],[0,-.55,.18],[0,-1.1,-.1],[0,-H+.2,.02]],fr?[.3,.21,.17,.17]:[.42,.26,.19,.19],m,C);
    if(!fr)M(dnPaint(sph(.36,14,10),C[0],C[1]),m,-sx*.06,-.3,.06,lg).scale.set(.75,1.3,1.05);
    dnPad(lg,-H,fr?.19:.21,m,C,nail,fr?4:3);}
  const neck=new THREE.Group();neck.position.set(0,by,1.4);g.add(neck);
  dnTube([[0,-.05,-.3],[0,-.05,.1],[0,-.08,.35]],[.5,.46,.42],m,neck,C,{sx:.85,seg:8,rad:14});
  const head=new THREE.Group();head.position.set(0,-.05,.4);neck.add(head);
  dnTube([[0,0,-.2],[0,.05,.25],[0,-.05,.7],[0,-.2,1.05],[0,-.32,1.22]],[.42,.42,.33,.22,.12],m,head,C,{sx:.78,seg:16,rad:14});
  // the beak, the horns, and the frill with its bumpy edge
  const bk=M(new THREE.ConeGeometry(.11,.3,10),beak,0,-.4,1.3,head);bk.rotation.x=Math.PI/2+.75;
  M(new THREE.ConeGeometry(.08,.2,10),beak,0,-.5,1.12,head).rotation.x=Math.PI/2+1.1;
  dnHorn(head,horn,0,.04,.92,.07,.26,.35,0);
  for(const s of [-1,1]){dnHorn(head,horn,s*.2,.28,.42,.085,.95,1.0,-s*.14);dnHorn(head,horn,s*.33,-.18,.36,.05,.16,.3,-s*1.2);
    dnEye(this,head,s*.29,.18,.55,.045,'#7a4a1a',s*1.25);}
  const fr=new THREE.Group();fr.position.set(0,.45,-.2);fr.rotation.x=-.6;head.add(fr);
  M(dnPaint(sph(1,26,16),'#7d6e4a','#a8966c',(x,y,z,ny)=>Math.max(0,Math.sin(Math.atan2(x,y)*7))*.12),m,0,0,0,fr).scale.set(.95,.88,.1);
  for(let i=0;i<17;i++){const a=-1.75+i*3.5/16,x=Math.sin(a)*.93,y=Math.cos(a)*.84;const e=M(new THREE.ConeGeometry(.07,.16,8),horn,x,y,0,fr,false,false);e.rotation.z=-a;e.scale.z=.5;}
  this.tick=(t)=>{body.scale.y=1+Math.sin(t*1.1)*.01;};
  dnSaddle(this,body,.25,-.05,.88,.88,1,'#7a2f2f');
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.35,size:1.7,h:by+1.5,rad:1,dustR:[.7,.7,1]});};

/* ---------- 🦕 Brachiosaurus (the long-neck): front legs longer than the back ones like a giraffe, a very long neck that holds its
   small head way up high, an arched crest over the nose and a short tail. Grey brown. It nibbles the tree tops.
   Ride (Skye): scale .55 => F.ride 2.18 ---------- */
ZOO_BUILD.longneckR=function(g,body,o){const by=2.55,m=dnSkin('brachio'),C=['#655e4e','#c4b99f',(x,y,z,ny)=>ny>.35?Math.max(0,Math.sin(z*3+x*4))*.12:0],nail=dnClaw();
  body.position.y=by;
  dnTube([[0,.55,1.5],[0,.4,.85],[0,.15,0],[0,-.05,-.8],[0,-.15,-1.35]],[.72,.98,1.05,.88,.62],m,body,C,{sx:.85,seg:22,rad:18});
  const tail=new THREE.Group();tail.position.set(0,-.15,-1.25);body.add(tail);
  dnTube([[0,0,.2],[0,-.25,-.9],[0,-.6,-2.1],[0,-.85,-3.3],[0,-.9,-4.2]],[.6,.45,.24,.1,.03],m,tail,C,{sx:.8,seg:22,rad:12});
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const fr=sz>0,H=fr?by+.1:by-.25,
    lg=dnLeg(this,g,sx*(fr?.6:.58),H,fr?1.05:-.85,ph,fr?[[0,0,0],[0,-1.2,.05],[0,-2.3,-.02],[0,-H+.25,0]]:[[0,0,0],[0,-1.0,.15],[0,-1.95,-.05],[0,-H+.25,0]],fr?[.42,.3,.26,.26]:[.55,.32,.27,.27],m,C);
    if(!fr)M(dnPaint(sph(.46,14,10),C[0],C[1]),m,-sx*.08,-.4,.05,lg).scale.set(.75,1.35,1.05);
    dnPad(lg,-H,fr?.28:.3,m,C,nail,fr?1:3);}
  // the long neck, curving up, and the small head with its arched crest
  const neck=new THREE.Group();neck.position.set(0,by+.65,1.55);g.add(neck);
  dnTube([[0,-.3,-.35],[0,.6,.25],[0,1.8,.75],[0,3.0,1.1],[0,3.75,1.3]],[.62,.5,.36,.26,.22],m,neck,C,{sx:.88,seg:30,rad:14});
  const head=new THREE.Group();head.position.set(0,3.82,1.36);neck.add(head);
  dnTube([[0,0,-.14],[0,.03,.15],[0,-.03,.42],[0,-.07,.56]],[.2,.21,.15,.08],m,head,C,{sx:.85,seg:12,rad:12});
  M(dnPaint(sph(.16,14,10),C[0],C[1]),m,0,.16,.12,head).scale.set(.8,1,1.3);
  for(const s of [-1,1]){dnEye(this,head,s*.16,.08,.04,.035,'#6a4a22',s*1.3);M(sph(.03,6,4),dnDark(),s*.05,.27,.16,head,false,false).scale.set(1,.6,1.6);}
  // a slow sway of the long neck
  this.tick=(t)=>{neck.rotation.y=Math.sin(t*.35)*.14;body.scale.y=1+Math.sin(t*.9)*.008;};
  dnSaddle(this,body,.25,.3,1.02,.85,1,'#2f6a4a');
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.5,size:3,h:by+.65+4.3,rad:1.7,dustR:[1,1,1.4]});};

/* ---------- 🦕 Stegosaurus: a small low head, short front legs and tall back legs, two staggered rows of big plates down its back
   (biggest over the hips) and four spikes on the end of its tail (a "thagomizer"). ---------- */
ZOO_BUILD.stegoR=function(g,body,o){const by=1.55,m=dnSkin('stego'),C=['#6c6a3e','#d3c8a0',(x,y,z,ny)=>ny>.25?(Math.sin(z*5)*Math.sin(x*8+z)>.3?.2:0):0],
  plate=dnM('plate',()=>phys('#8f5e3a',{roughness:.6,clearcoat:.2})),horn=dnHornM(),nail=dnClaw();
  body.position.y=by;
  const T=dnTube([[0,-.45,1.45],[0,-.1,.8],[0,.2,0],[0,.15,-.7],[0,-.05,-1.15]],[.38,.62,.8,.72,.5],m,body,C,{sx:.82,seg:22,rad:16});
  const tail=new THREE.Group();tail.position.set(0,-.05,-1.05);body.add(tail);
  const TL=dnTube([[0,0,.15],[0,-.1,-.7],[0,-.25,-1.5],[0,-.32,-2.2]],[.48,.32,.15,.05],m,tail,C,{sx:.8,seg:18,rad:12});
  // the plates: a rounded diamond shape, made once and sized for each spot
  const pg=dnM('plateG',()=>{const s=new THREE.Shape();s.moveTo(-.5,0);s.quadraticCurveTo(-.62,.62,0,1);s.quadraticCurveTo(.62,.62,.5,0);s.lineTo(-.5,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2});g.translate(0,0,-.04);g.rotateY(Math.PI/2);return g;});
  const put=(par,p,h,s)=>{const pl=M(pg,plate,s*.07,p.y-.08,p.z,par,true,false);pl.scale.set(1,h,h*.85);pl.rotation.z=-s*.12;};
  for(let i=0;i<10;i++){const q=.12+i*.088,h=.28+.5*Math.sin(Math.min(1,q*1.15)*Math.PI*.9);put(body,T.top(q),h,i%2?1:-1);}
  for(let i=0;i<5;i++){const q=.05+i*.11;put(tail,TL.top(q),.5-i*.08,i%2?-1:1);}
  for(const s of [-1,1])for(const q of [.78,.9]){const p=TL.at(q);const sp=dnHorn(tail,horn,s*.06,p.y+.03,p.z,.045,.5,-1.2,-s*.9);}
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const fr=sz>0,H=fr?by-.6:by+.05,
    lg=dnLeg(this,g,sx*(fr?.36:.44),H,fr?1.0:-.55,ph,fr?[[0,0,0],[0,-.45,.04],[0,-H+.18,0]]:[[0,0,0],[0,-.65,.2],[0,-1.25,-.08],[0,-H+.18,0]],fr?[.26,.18,.16]:[.4,.24,.18,.18],m,C);
    if(!fr)M(dnPaint(sph(.34,14,10),C[0],C[1]),m,-sx*.05,-.28,.06,lg).scale.set(.75,1.3,1.05);
    dnPad(lg,-H,fr?.17:.2,m,C,nail,fr?4:3);}
  const neck=new THREE.Group();neck.position.set(0,by-.5,1.5);g.add(neck);
  dnTube([[0,.05,-.25],[0,-.08,.2],[0,-.2,.5]],[.36,.27,.2],m,neck,C,{sx:.85,seg:10,rad:12});
  const head=new THREE.Group();head.position.set(0,-.22,.55);neck.add(head);
  dnTube([[0,0,-.08],[0,0,.18],[0,-.06,.38],[0,-.1,.48]],[.17,.16,.1,.05],m,head,C,{sx:.8,seg:10,rad:10});
  M(new THREE.ConeGeometry(.05,.12,8),dnDark(),0,-.13,.5,head).rotation.x=Math.PI/2+.6;
  for(const s of [-1,1])dnEye(this,head,s*.11,.06,.1,.026,'#5a3a1a',s*1.3);
  this.tick=(t)=>{body.scale.y=1+Math.sin(t*1.1)*.01;};
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.35,size:1.6,h:by+1.65,rad:.95,dustR:[.6,.6,.9]});};

// the dinosaurs that live at 🦕 Dino Valley (24n-dino-valley.js): you can't adopt these, but you can meet them, feed them and learn about them.
// They're added to ZOOA (24d-barn.js) with dino:1, so the zoo's "meet" card shows their facts.
const DINOA=[
  {k:'trexR',e:'🦖',n:'Tyrannosaurus rex',dino:1,food:[['🍖','Meat'],['🍗','Drumstick']],say:['*big rumbly ROAR* 🦖','*stomp... stomp...*','*sniff sniff*'],
    facts:[['🥩','Diet','Carnivore (a meat-eater). It ate big plant-eating dinosaurs like Triceratops and Edmontosaurus.'],
      ['🌍','When and where','Western North America, about 68 to 66 million years ago, at the very end of the age of dinosaurs.'],
      ['📏','Size','Up to 12 m (40 ft) long and about 8 tonnes, heavier than an elephant!'],
      ['✨','Fun fact','Its arms were tiny, only about as long as a grown-up\'s arm, but very strong. Scientists now think it had lips that covered its teeth, like a lizard.']]},
  {k:'raptorR',e:'🦖',n:'Raptor (Deinonychus)',dino:1,fast:2.2,food:[['🍗','Chicken'],['🐟','Fish']],say:['*chirp chirp*','*fluffs its feathers*','*quick head tilt*'],
    facts:[['🥩','Diet','Carnivore. A fast hunter of small and medium animals, and it may have hunted in groups.'],
      ['🌍','When and where','North America (Montana, Wyoming and Oklahoma), about 115 to 108 million years ago.'],
      ['📏','Size','About 3.4 m (11 ft) from nose to tail, and about as heavy as a grown-up.'],
      ['✨','Fun fact','Real raptors had feathers, like birds! They held the big curved claw on each foot up off the ground to keep it sharp. Velociraptor was a smaller cousin, about the size of a turkey.']]},
  {k:'trikeR',e:'🦕',n:'Triceratops',dino:1,food:[['🌿','Ferns'],['🌴','Palm leaves']],say:['*low friendly snort*','*munch munch* 🌿','*shakes its frill*'],
    facts:[['🌿','Diet','Herbivore (a plant-eater). Tough low plants like ferns, cycads and palms, snipped off with its parrot-like beak.'],
      ['🌍','When and where','Western North America, about 68 to 66 million years ago, at the same time and place as T. rex.'],
      ['📏','Size','About 9 m (30 ft) long and as heavy as a big elephant. Its head was one of the biggest of any land animal ever!'],
      ['✨','Fun fact','Its name means "three-horned face". The frill and horns may have helped it show off and tell its friends apart.']]},
  {k:'longneckR',e:'🦕',n:'Brachiosaurus',dino:1,food:[['🌲','Tree tops'],['🍃','Leaves']],say:['*deep gentle hum*','*munches tree-top leaves* 🍃','*slow blink*'],
    facts:[['🌿','Diet','Herbivore. Leaves from the tops of tall trees like conifers and ginkgos, hundreds of kilos a day!'],
      ['🌍','When and where','North America (Colorado and Utah), about 154 to 150 million years ago, in the Jurassic.'],
      ['📏','Size','About 22 m (72 ft) long, and it could hold its head about 9 m (30 ft) up, as high as a three-story building.'],
      ['✨','Fun fact','Its front legs were longer than its back legs, like a giraffe. Its name means "arm lizard".']]},
  {k:'stegoR',e:'🦕',n:'Stegosaurus',dino:1,food:[['🌿','Ferns'],['🥬','Leaves']],say:['*soft huff*','*munch munch* 🌿','*plates wiggle*'],
    facts:[['🌿','Diet','Herbivore. Low plants like ferns, mosses, cycads and horsetails.'],
      ['🌍','When and where','Western North America and Portugal, about 155 to 145 million years ago, in the Jurassic.'],
      ['📏','Size','About 9 m (30 ft) long, as heavy as an elephant, with a head tiny for its body.'],
      ['✨','Fun fact','The spikes on its tail are called a "thagomizer". The plates on its back may have helped it warm up, cool down and show off.']]},
];
