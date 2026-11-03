/* ===== 🤸 Jump Park: an indoor trampoline park behind Christmas Village (the bouncing itself lives in 26e-jump-park.js) =====
   Like a real trampoline park: a grid of black trampolines with yellow pads between them, a long tumble track down the
   left wall, two slam-dunk trampolines under basketball hoops, a big padded block with a ramp, and a foam pit to jump into.
   Local space: +z points back toward Christmas Village (the open front), -z is the back wall. No roof, so the camera
   and high bounces never hit a ceiling; a steel truss with hanging lights overhead makes it feel indoors. */
const JP={W:6.2,B:-5.6,F:4.4,MAT:.22,PAD:.3,mats:[],pads:[],hoops:[],pit:null,block:null,ramp:null};
{const z=Z.jump,g=z.g,J=JP;
 // the short path in from Christmas Village is drawn by 02-island.js (p0)
 // ---- floor: speckled purple-grey carpet like the photo ----
 const carpet=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#5d5874';x.fillRect(0,0,w,h);
   for(let i=0;i<9000;i++){const c=Math.random();x.fillStyle=c<.4?'rgba(40,36,60,.35)':c<.8?'rgba(150,140,190,.3)':'rgba(190,120,255,.25)';x.fillRect(Math.random()*w,Math.random()*h,2,2);}},4);
 const fl=M(new THREE.PlaneGeometry(J.W*2,J.F-J.B),phys('#ffffff',{map:carpet,roughness:.95}),0,.02,(J.B+J.F)/2,g,false,true);fl.rotation.x=-Math.PI/2;fl.material.polygonOffset=true;fl.material.polygonOffsetFactor=-2;
 // ---- materials ----
 const wallM=std('#1d1b26',{roughness:.7}),padGrey=phys('#8d8aa0',{roughness:.55,clearcoat:.3}),yellow=phys('#ffd21f',{roughness:.45,clearcoat:.5}),
   dark=std('#24222e',{roughness:.5,metalness:.2}),steel=std('#2a2833',{metalness:.7,roughness:.35}),spring=std('#c9d3e0',{metalness:.85,roughness:.25});
 const matTex=(w,d,line)=>canvasTex(Math.round(w*90),Math.round(d*90),(x,W,H)=>{x.fillStyle='#17161c';x.fillRect(0,0,W,H);
   // woven mat: tiny cross-hatch
   x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=1;for(let i=0;i<W;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}for(let j=0;j<H;j+=4){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke();}
   x.strokeStyle=line;x.lineWidth=6;x.strokeRect(14,14,W-28,H-28);});
 // a trampoline: dark frame, a ring of springs, the black mat (dips when you land) and optional pads around it
 function tramp(cx,cz,w,d,{pad=padGrey,edge=.2,line='#ffffff',kind='mat'}={}){
   const m=M(new THREE.PlaneGeometry(w,d,1,1),phys('#ffffff',{map:matTex(w,d,line),roughness:.5,clearcoat:.2}),cx,J.MAT,cz,g,false,true);m.rotation.x=-Math.PI/2;
   // the well under the mat (seen when the mat dips) and the springs along the edges
   M(box(w,.2,d),dark,cx,.1,cz,g,false,true);
   const sp=new THREE.InstancedMesh(cyl(.018,.018,.16,6),spring,Math.ceil(w/.22)*2+Math.ceil(d/.22)*2);let n=0;const o=new THREE.Object3D();
   for(let i=0;i<Math.ceil(w/.22);i++)for(const s of [-1,1]){o.position.set(cx-w/2+.11+i*.22,J.MAT+.005,cz+s*(d/2-.06));o.rotation.set(Math.PI/2,0,0);o.updateMatrix();sp.setMatrixAt(n++,o.matrix);}
   for(let i=0;i<Math.ceil(d/.22);i++)for(const s of [-1,1]){o.position.set(cx+s*(w/2-.06),J.MAT+.005,cz-d/2+.11+i*.22);o.rotation.set(0,0,Math.PI/2);o.updateMatrix();sp.setMatrixAt(n++,o.matrix);}
   sp.count=n;g.add(sp);
   const T={x0:cx-w/2+.05,x1:cx+w/2-.05,z0:cz-d/2+.05,z1:cz+d/2-.05,cx,cz,m,dip:0,v:0,kind};J.mats.push(T);
   if(edge){const e=edge;for(const [px,pz,pw,pd] of [[cx,cz-d/2-e/2,w+e*2,e],[cx,cz+d/2+e/2,w+e*2,e],[cx-w/2-e/2,cz,e,d],[cx+w/2+e/2,cz,e,d]]){
     M(box(pw,J.PAD,pd),pad,px,J.PAD/2,pz,g,true,true);J.pads.push({x0:px-pw/2,x1:px+pw/2,z0:pz-pd/2,z1:pz+pd/2,h:J.PAD});}}
   return T;}

 // ---- the trampoline grid: 3 x 3 black mats with yellow pads between them ----
 {const C=1.35,P=.3,X0=-3.7,Z0=-2.8,n=3,S=n*C+(n+1)*P;
  for(let i=0;i<n;i++)for(let k=0;k<n;k++)tramp(X0+P+C/2+i*(C+P),Z0+P+C/2+k*(C+P),C,C,{edge:0,line:'#ffffff'});
  for(let i=0;i<=n;i++){const px=X0+P/2+i*(C+P);M(box(P,J.PAD,S),yellow,px,J.PAD/2,Z0+S/2,g,true,true);J.pads.push({x0:px-P/2,x1:px+P/2,z0:Z0,z1:Z0+S,h:J.PAD});}
  for(let k=0;k<=n;k++){const pz=Z0+P/2+k*(C+P);M(box(S,J.PAD+.002,P),yellow,X0+S/2,J.PAD/2+.001,pz,g,true,true);J.pads.push({x0:X0,x1:X0+S,z0:pz-P/2,z1:pz+P/2,h:J.PAD});}
  J.grid={x0:X0,x1:X0+S,z0:Z0,z1:Z0+S};}

 // ---- the tumble track: a long white strip down the left wall ----
 {const T=tramp(-4.95,-.6,1.1,8.2,{line:'#ffd21f'});T.kind='track';
  // a white track mat instead of a black one
  T.m.material.map=canvasTex(128,900,(x,W,H)=>{x.fillStyle='#ecebf3';x.fillRect(0,0,W,H);x.fillStyle='#1d1b26';x.fillRect(0,0,10,H);x.fillRect(W-10,0,10,H);
    x.fillStyle='rgba(120,110,160,.25)';for(let j=40;j<H;j+=110)x.fillRect(16,j,W-32,3);});}

 // ---- slam-dunk lane: two trampolines under two hoops on the back wall ----
 const RIMY=3.05,RIMZ=J.B+.75;
 for(const hx of [-2.6,-.1]){tramp(hx,-4.2,1.4,1.3,{pad:yellow,edge:.2,line:'#ff6fae',kind:'dunk'});
   const hg=new THREE.Group();hg.position.set(hx,0,0);g.add(hg);
   M(box(.12,.9,.12),steel,0,2.95,J.B+.12,hg);M(box(.1,.1,.42),steel,0,3.3,J.B+.3,hg);
   M(box(1.25,.8,.05),phys('#ffffff',{roughness:.05,transmission:.5,transparent:true,opacity:.8,clearcoat:1}),0,3.35,J.B+.5,hg,false,false);
   for(const [w,h,y,xx] of [[1.25,.05,3.73,0],[1.25,.05,2.97,0],[.05,.8,3.35,-.6],[.05,.8,3.35,.6],[.5,.04,3.4,0],[.04,.32,3.24,-.23],[.04,.32,3.24,.23]])M(box(w,h,.03),phys('#ff4d8d',{roughness:.4}),xx,y,J.B+.53,hg,false,false);
   const rim=M(new THREE.TorusGeometry(.22,.018,10,36),std('#ff6a1f',{metalness:.5,roughness:.35}),0,RIMY,RIMZ,hg);rim.rotation.x=Math.PI/2;
   M(box(.05,.03,.2),std('#ff6a1f',{metalness:.5,roughness:.35}),0,RIMY,RIMZ-.17,hg);
   const net=M(new THREE.CylinderGeometry(.22,.13,.36,12,3,true),new THREE.MeshBasicMaterial({color:'#ffffff',wireframe:true,transparent:true,opacity:.85}),0,RIMY-.18,RIMZ,hg,false,false);
   J.hoops.push({x:hx,z:RIMZ,y:RIMY,rim,net,swish:0,shake:0,cool:0});}
 anims.push((t,dt)=>{for(const h of JP.hoops){if(h.swish>0){h.swish=Math.max(0,h.swish-dt*2.2);h.net.scale.set(1-h.swish*.25,1+h.swish*.5,1-h.swish*.25);h.net.position.y=h.y-.18-h.swish*.1;}
   if(h.shake>0){h.shake=Math.max(0,h.shake-dt*3);h.rim.rotation.x=Math.PI/2+Math.sin(t*40)*h.shake*.15;}}});

 // ---- big padded block with a ramp up to it (jump off it into the foam pit or onto the trampolines) ----
 {const B={x0:2.6,x1:5.8,z0:-2.4,z1:.9,h:.95};J.block=B;
  M(box(B.x1-B.x0,B.h,B.z1-B.z0),phys('#3a3746',{roughness:.6,clearcoat:.25}),(B.x0+B.x1)/2,B.h/2,(B.z0+B.z1)/2,g,true,true);
  // yellow padded edge on top
  for(const [px,pz,pw,pd] of [[(B.x0+B.x1)/2,B.z1-.08,B.x1-B.x0,.16],[B.x0+.08,(B.z0+B.z1)/2,.16,B.z1-B.z0]])M(box(pw,.06,pd),yellow,px,B.h+.03,pz,g,false,true);
  const R={x0:3.3,x1:5.1,z0:B.z1,z1:B.z1+2.3};J.ramp=R;
  const rl=Math.hypot(R.z1-R.z0,B.h),rm=M(box(R.x1-R.x0,.06,rl),phys('#2c2a36',{roughness:.6,clearcoat:.2}),(R.x0+R.x1)/2,B.h/2,(R.z0+R.z1)/2,g,true,true);rm.rotation.x=Math.atan2(B.h,R.z1-R.z0);
  // the wedge's sides
  const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(R.z1-R.z0,0);sh.lineTo(0,B.h);sh.closePath();
  for(const sx of [R.x0,R.x1]){const w=M(new THREE.ShapeGeometry(sh),new THREE.MeshStandardMaterial({color:'#2c2a36',roughness:.6,side:THREE.DoubleSide}),sx,0,R.z0,g,false,true);w.rotation.y=Math.PI/2;}
  // stripes up the ramp so it reads as a slope
  for(let i=1;i<5;i++){const f=i/5,s=M(box(R.x1-R.x0-.2,.02,.08),yellow,(R.x0+R.x1)/2,B.h*(1-f)+.045,R.z0+(R.z1-R.z0)*f,g,false,false);s.rotation.x=rm.rotation.x;}}

 // ---- foam pit full of soft colored cubes ----
 {const P={x0:2.6,x1:5.8,z0:J.B+.35,z1:-2.4,deep:-.3,rim:.12};J.pit=P;
  M(box(P.x1-P.x0,.5,P.z1-P.z0),std('#2a2638',{roughness:.9}),(P.x0+P.x1)/2,-.26,(P.z0+P.z1)/2,g,false,true);
  for(const [px,pz,pw,pd] of [[P.x0-.15,(P.z0+P.z1)/2,.3,P.z1-P.z0+.3]])M(box(pw,P.rim+.1,pd),phys('#4fb6ff',{roughness:.5,clearcoat:.4}),px,(P.rim+.1)/2,pz,g,true,true);
  J.pads.push({x0:P.x0-.3,x1:P.x0,z0:P.z0,z1:P.z1,h:P.rim});
  const cols=['#ff6fae','#4fb6ff','#ffd21f','#ffffff','#b388ff','#7ee081'],S=.3,nx=Math.floor((P.x1-P.x0)/S),nz=Math.floor((P.z1-P.z0)/S);
  const cubes=new THREE.InstancedMesh(new THREE.BoxGeometry(S*.92,S*.92,S*.92),phys('#ffffff',{roughness:.85,sheen:.5}),nx*nz*2);
  const o=new THREE.Object3D(),col=new THREE.Color();P.cubes=[];let n=0;
  for(let layer=0;layer<2;layer++)for(let i=0;i<nx;i++)for(let k=0;k<nz;k++){
    const c={bx:P.x0+S/2+i*S+(Math.random()-.5)*.06,bz:P.z0+S/2+k*S+(Math.random()-.5)*.06,by:layer?.06+Math.random()*.06:-.16,
      rx:Math.random()*.6-.3,ry:Math.random()*3,rz:Math.random()*.6-.3,x:0,y:0,z:0,vx:0,vy:0,vz:0,live:false};
    c.x=c.bx;c.y=c.by;c.z=c.bz;o.position.set(c.x,c.y,c.z);o.rotation.set(c.rx,c.ry,c.rz);o.updateMatrix();cubes.setMatrixAt(n,o.matrix);
    cubes.setColorAt(n,col.set(cols[(i*7+k*3+layer*5)%cols.length]));P.cubes.push(c);n++;}
  cubes.castShadow=false;cubes.receiveShadow=true;g.add(cubes);P.mesh=cubes;
  // cubes that got kicked up fly, tumble and settle back into the pit
  anims.push((t,dt)=>{let any=false;for(let i=0;i<P.cubes.length;i++){const c=P.cubes[i];if(!c.live)continue;any=true;
    c.vy-=14*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.rx+=c.vx*dt*3;c.rz-=c.vz*dt*3;
    if(c.y<=c.by&&c.vy<0){c.y=c.by;c.vy=0;c.vx*=.5;c.vz*=.5;}
    c.x+=(c.bx-c.x)*Math.min(1,dt*1.5);c.z+=(c.bz-c.z)*Math.min(1,dt*1.5);
    if(c.y<=c.by+.001&&Math.abs(c.x-c.bx)+Math.abs(c.z-c.bz)<.02){c.x=c.bx;c.z=c.bz;c.live=false;}
    o.position.set(c.x,c.y,c.z);o.rotation.set(c.rx,c.ry,c.rz);o.updateMatrix();P.mesh.setMatrixAt(i,o.matrix);}
    if(any)P.mesh.instanceMatrix.needsUpdate=true;});}

 // ---- walls: black with a grey padded band, a yellow top and a glowing purple stripe ----
 const H=2.5,SZ=1.6;// side walls run from the back to SZ, the front is open
 const glowP=glow('#b388ff',1.6);
 M(box(J.W*2+.3,H,.3),wallM,0,H/2,J.B-.15,g);for(let x=-J.W;x<=J.W+.01;x+=.9)z.ob(x,J.B-.1,.45);
 M(box(J.W*2,.9,.12),padGrey,0,.45,J.B+.06,g,false,true);
 M(box(J.W*2+.3,.12,.36),yellow,0,H+.06,J.B-.15,g);M(box(J.W*2,.05,.02),glowP,0,H-.25,J.B+.01,g,false,false);
 for(const sx of [-1,1]){M(box(.3,H,SZ-J.B),wallM,sx*(J.W+.15),H/2,(J.B+SZ)/2,g);for(let k=J.B;k<=SZ+.01;k+=.9)z.ob(sx*(J.W+.1),k,.45);
   M(box(.12,.9,SZ-J.B),padGrey,sx*(J.W-.06),.45,(J.B+SZ)/2,g,false,true);
   M(box(.36,.12,SZ-J.B+.3),yellow,sx*(J.W+.15),H+.06,(J.B+SZ)/2-.15,g);M(box(.02,.05,SZ-J.B),glowP,sx*(J.W-.01),H-.25,(J.B+SZ)/2,g,false,false);
   // a yellow padded post where the wall ends
   M(cyl(.22,.22,H+.2,16),yellow,sx*(J.W+.1),(H+.2)/2,SZ,g);}
 // the big sign on the back wall over the foam pit
 {const t=canvasTex(1024,256,(x,W,Hh)=>{x.fillStyle='#14121b';x.fillRect(0,0,W,Hh);x.strokeStyle='#ffd21f';x.lineWidth=14;x.strokeRect(10,10,W-20,Hh-20);
   x.textAlign='center';x.textBaseline='middle';x.font='700 120px Fredoka, sans-serif';x.shadowColor='#b388ff';x.shadowBlur=30;x.fillStyle='#ffd21f';x.fillText('🤸 JUMP PARK',W/2,Hh/2+6);});
  M(new THREE.PlaneGeometry(3.4,.85),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),4.2,1.75,J.B+.13,g,false,false);}
 // wall art on the left: bouncing stars
 {const t=canvasTex(512,256,(x,W,Hh)=>{x.clearRect(0,0,W,Hh);x.font='120px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('⭐',90,90);x.fillText('🌟',256,150);x.fillText('⭐',420,80);});
  const p=M(new THREE.PlaneGeometry(2.4,1.2),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),-J.W+.02,1.7,-2.2,g,false,false);p.rotation.y=Math.PI/2;}

 // ---- truss overhead with hanging lights (no roof, so nothing blocks the camera or a big bounce) ----
 {const TY=7.6,tm=steel;
  for(const [px,pz] of [[-J.W-.15,J.B-.15],[J.W+.15,J.B-.15],[-J.W-.15,SZ],[J.W+.15,SZ]]){M(box(.2,TY,.2),tm,px,TY/2,pz,g);}
  for(const pz of [J.B-.15,SZ])M(box(J.W*2+.5,.22,.22),tm,0,TY,pz,g,false,false);
  for(const sx of [-1,1])M(box(.22,.22,SZ-J.B+.2),tm,sx*(J.W+.15),TY,(J.B+SZ)/2,g,false,false);
  for(const px of [-2.1,2.1]){M(box(.14,.14,SZ-J.B),tm,px,TY,(J.B+SZ)/2,g,false,false);
    for(const pz of [-4,-1.4,1]){M(cyl(.012,.012,1.1,4),tm,px,TY-.55,pz,g,false,false);M(cyl(.08,.32,.22,16,1),dark,px,TY-1.15,pz,g,false,false);
      M(new THREE.CircleGeometry(.3,20),glow('#fff1dc',1.4),px,TY-1.27,pz,g,false,false).rotation.x=Math.PI/2;}}
  const pl=new THREE.PointLight('#f1e6ff',14,16,1.6);pl.position.set(0,6,-1.6);g.add(pl);}

 // ---- the front: the name hanging from the truss, and cubbies for your shoes ----
 {const t=canvasTex(1024,200,(x,W,Hh)=>{x.fillStyle='#14121b';x.fillRect(0,0,W,Hh);x.strokeStyle='#ffd21f';x.lineWidth=12;x.strokeRect(8,8,W-16,Hh-16);x.textAlign='center';x.textBaseline='middle';x.font='700 110px Fredoka, sans-serif';x.fillStyle='#ffd21f';x.fillText('🤸 JUMP PARK',W/2,Hh/2+6);});
  for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(4.2,.82),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),0,7.05,SZ+s*.13,g,false,false);if(s<0)p.rotation.y=Math.PI;}
  M(box(4.3,.9,.2),wallM,0,7.05,SZ,g,false,false);for(const sx of [-1.8,1.8])M(cyl(.02,.02,.4,4),steel,sx,7.45,SZ,g,false,false);
  // shoe cubbies by the front right wall
  const cg=new THREE.Group();cg.position.set(J.W-.35,0,SZ+1.2);cg.rotation.y=-Math.PI/2;g.add(cg);
  M(box(1.8,1.1,.45),std('#e8e4f2',{roughness:.6}),0,.55,0,cg);
  const shoeC=['#ff6fae','#4fb6ff','#ffd21f','#7ee081','#b388ff','#ff8a1f'];
  for(let r=0;r<2;r++)for(let c=0;c<4;c++){M(box(.38,.4,.05),dark,-.66+c*.44,.3+r*.48,.2,cg,false,false);
    if((r*4+c)%3!==1)M(box(.26,.1,.14),std(shoeC[(r*4+c)%shoeC.length],{roughness:.6}),-.66+c*.44,.17+r*.48,.25,cg,false,false);}
  z.ob(J.W-.35,SZ+.6,.4);z.ob(J.W-.35,SZ+1.2,.4);z.ob(J.W-.35,SZ+1.8,.4);}
 signpost(z);}

// how high the floor is at a world spot inside the Jump Park, or h if it isn't in there (13-park-and-stars.js groundAt)
function jpGround(x,z,h){const J=Z.jump;if(!J||!JP.block||Math.abs(x-J.x)>9||Math.abs(z-J.z)>9)return h;const [lx,lz]=J.toLocal(x,z);
  if(lx<-JP.W||lx>JP.W||lz<JP.B||lz>JP.F)return h;
  if(jpMatAt(lx,lz))return JP.MAT;
  const P=JP.pit;if(lx>P.x0&&lx<P.x1&&lz>P.z0&&lz<P.z1)return P.deep;
  const B=JP.block;if(lx>B.x0&&lx<B.x1&&lz>B.z0&&lz<B.z1)return B.h;
  const R=JP.ramp;if(lx>R.x0&&lx<R.x1&&lz>=R.z0&&lz<R.z1)return B.h*(R.z1-lz)/(R.z1-R.z0);
  let m=h;for(const p of JP.pads)if(lx>p.x0&&lx<p.x1&&lz>p.z0&&lz<p.z1)m=Math.max(m,p.h);return m;}
// the trampoline under a local spot, or null
function jpMatAt(lx,lz){for(const T of JP.mats)if(lx>T.x0&&lx<T.x1&&lz>T.z0&&lz<T.z1)return T;return null;}
