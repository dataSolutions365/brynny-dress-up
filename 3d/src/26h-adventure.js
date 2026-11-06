/* ================= ⛰️ LOOKOUT MOUNTAIN and 🌲 TREETOP ADVENTURE, across the canal =================
   On the grassy far bank of the canal, between angles 92 and 136 (BANK_LAND in 26f-ocean.js), over a wooden footbridge at 114.
   - 🌉 The footbridge arches over the canal. Its deck only counts as ground (advGround) once you've stepped onto it from one end,
     so swimmers (and the dolphins) still go right under it.
   - ⛰️ Lookout Mountain ('mountain' zone): one height function, mtH(), shapes the rock you see AND the ground you walk on.
     The rock is too steep to walk up (advBlock), so there are two ways up:
       🥾 the hiking trail (TRAIL) that winds round the back of the mountain from the front, in two long switchbacks,
       🧗 the rock climbing wall on the steep side (WALL): the mountain is cut flat there, with colored holds and an auto-belay rope.
     From the top, 🪂 the big zip line goes all the way down over the trees to the ropes course.
   - 🌲 Treetop Adventure ('ropes' zone): four tall trees with platforms (RC), a ladder up to the first one, three rope bridges
     (RB: wobbly planks, the sky walk with a hand wire, swinging logs) and the 🪂 treetop zip line down from the last tree.
     Up there you're clipped into a harness (advBlock keeps you from stepping off an edge), like a real ropes course.
   - Raised walkways (footbridge, platforms, rope bridges) are SURF: each gives a height at (x,z) or -1. HIGH.on says you're up on one.
   - advStep() (asked by 25-game-loop.js) moves you while you climb a ladder or the rock wall or ride a zip line, and advPose()
     poses the body after Avatar.update. Friends online see the same through the 'adv' entry in SHOW.
   - Challenges: did('ropes','up'), did('ropesBridge',name), did('climb','trail'|'wall'), did('zip','mountain'|'tree').
   Static parts are merged into one shape per material (advBatch), so the whole thing is only a few draws on phones. */
var ADV=null;// set once everything below is built: groundAt() (13-park-and-stars.js) already asks advGround() while the island is being built
const ADV_LAND={a0:92,a1:136,out:BANK.out-1.4};BANK_LAND.push(ADV_LAND);
const HIGH={on:false};// you're up on a raised walkway (the footbridge, a platform or a rope bridge)
const ADS={mode:null,t:0};// what advStep is doing: 'ladder', 'wall' (climbing) or 'zip'
const SURF=[];// raised walkways: {h(x,z) -> height or -1}
function upSurf(x,z){let m=-1;for(const s of SURF){const h=s.h(x,z);if(h>m)m=h;}return m;}

/* ---------- shared materials ---------- */
const ADM={
  wood:std('#9a6a43',{roughness:.85,map:canvasTex(128,128,(x,w,h)=>{x.fillStyle='#a8774c';x.fillRect(0,0,w,h);for(let i=0;i<46;i++){x.strokeStyle=`rgba(${70+Math.random()*40|0},${45+Math.random()*25|0},25,${.25+Math.random()*.3})`;x.lineWidth=1+Math.random()*2;const y=Math.random()*h;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(w*.3,y+Math.random()*6-3,w*.7,y+Math.random()*6-3,w,y);x.stroke();}})}),
  dark:std('#6e4a2e',{roughness:.9}),
  bark:std('#ffffff',{roughness:.95,map:canvasTex(64,256,(x,w,h)=>{x.fillStyle='#5e4632';x.fillRect(0,0,w,h);for(let i=0;i<70;i++){const c=Math.random();x.fillStyle=c<.5?'rgba(40,28,18,.55)':'rgba(140,115,90,.35)';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,10+Math.random()*40);}})}),
  rope:std('#c8ad7f',{roughness:.95}),
  steel:std('#5d6268',{roughness:.35,metalness:.8}),
  green:std('#2f6b31',{roughness:.9,flatShading:true}),green2:std('#3d7f37',{roughness:.9,flatShading:true}),green3:std('#24572a',{roughness:.9,flatShading:true}),
  pine:std('#25502c',{roughness:.9,flatShading:true}),pine2:std('#2e5f33',{roughness:.9,flatShading:true}),
  rock:std('#ffffff',{vertexColors:true,roughness:.95,flatShading:true}),
  stone:std('#8c857c',{roughness:.95,flatShading:true}),
  mulch:std('#7a5a3c',{roughness:1}),
  pad:glow('#7ee0ff',1.4),
  red:std('#d8423a',{roughness:.6}),yellow:std('#f2c230',{roughness:.6}),
};
ADM.mulch.polygonOffset=true;ADM.mulch.polygonOffsetFactor=-2;ADM.mulch.polygonOffsetUnits=-2;
// put lots of little static shapes together into one shape per material (fewer draws on phones)
function advBatch(){const B=new Map(),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3();
  return {add(geo,mat,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1,order='XYZ'){let g=geo.index?geo.toNonIndexed():geo.clone();
      for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);
      e.set(rx,ry,rz,order);m4.compose(v.set(x,y,z),q.setFromEuler(e),s.set(sx,sy,sz));g.applyMatrix4(m4);if(!B.has(mat))B.set(mat,[]);B.get(mat).push(g);return g;},
    // a stick from point a to point b (a rope, a cable, a rail, a post)
    stick(a,b,r,mat,seg=6){const d=new THREE.Vector3().subVectors(b,a),L=d.length();if(L<1e-4)return;let g=new THREE.CylinderGeometry(r,r,L,seg,1,true);g=g.toNonIndexed();g.deleteAttribute('uv');g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      q.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m4.compose(v.copy(a).add(b).multiplyScalar(.5),q,s.set(1,1,1));g.applyMatrix4(m4);if(!B.has(mat))B.set(mat,[]);B.get(mat).push(g);},
    done(parent,cast=true){for(const [mat,list] of B){const g=mergeGeometries(list);list.forEach(x=>x.dispose());g.computeBoundingSphere();M(g,mat,0,0,0,parent,cast,true);}B.clear();}};}
// a rope that sags between two points, as a list of points
function sagPts(a,b,sag,n=10){const out=[];for(let i=0;i<=n;i++){const u=i/n;out.push(new THREE.Vector3().lerpVectors(a,b,u).add(new THREE.Vector3(0,-sag*4*u*(1-u),0)));}return out;}
function sagStick(B,a,b,sag,r,mat,n=10){const p=sagPts(a,b,sag,n);for(let i=0;i<n;i++)B.stick(p[i],p[i+1],r,mat,5);}

/* ---------- 🌉 the footbridge over the canal ---------- */
const FB={a:114,t0:R-2.5,t1:BANK.in+2.8,w:2.4,top:2.3};
FB.ux=Math.sin(deg(FB.a));FB.uz=Math.cos(deg(FB.a));
const fbLoc=(x,z)=>[x*FB.ux+z*FB.uz,x*FB.uz-z*FB.ux];// [along the bridge (distance from the middle of the island), sideways]
const fbDeck=t=>FB.top*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-FB.t0)/(FB.t1-FB.t0))))+.1;
SURF.push({fb:1,h(x,z){const [t,s]=fbLoc(x,z);if(t<FB.t0||t>FB.t1||Math.abs(s)>FB.w/2-.18)return -1;return fbDeck(t);}});
BANK_BRIDGES.push({a:FB.a,w:FB.w,on:p=>HIGH.on||fbDeck(fbLoc(p.x,p.z)[0])<.5});
{const g=new THREE.Group();g.rotation.y=deg(FB.a);scene.add(g);const B=advBatch(),hw=FB.w/2,P=(s,t,dy=0)=>new THREE.Vector3(s,fbDeck(t)+dy,t);
  // the deck planks, following the arch
  for(let t=FB.t0+.15;t<FB.t1;t+=.3){const sl=Math.atan2(fbDeck(t+.1)-fbDeck(t-.1),.2);B.add(box(FB.w,.07,.27),ADM.wood,0,fbDeck(t)-.04,t,-sl,0,0);}
  for(const s of [-1,1]){
    // the beams under the planks, the posts and the handrail on each side
    for(let t=FB.t0;t<FB.t1-.4;t+=.4)B.stick(P(s*(hw-.08),t,-.12),P(s*(hw-.08),t+.4,-.12),.07,ADM.dark,6);
    for(let t=FB.t0+.3;t<FB.t1;t+=1.6){B.stick(P(s*(hw-.06),t,-.05),P(s*(hw-.06),t,1.02),.05,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,1.02),P(s*(hw-.06),Math.min(FB.t1-.3,t+1.6),1.02),.045,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,.55),P(s*(hw-.06),Math.min(FB.t1-.3,t+1.6),.55),.025,ADM.rope,5);}
    // the arch underneath, from the water up
    const arch=[];for(let i=0;i<=24;i++){const t=FB.t0+3+(FB.t1-FB.t0-6)*i/24;arch.push(P(s*(hw-.2),t,-.18-(.6*Math.sin(Math.PI*i/24))));}
    for(let i=0;i<24;i++)B.stick(arch[i],arch[i+1],.11,ADM.dark,7);}
  // stone feet on each bank
  for(const t of [FB.t0+3.4,FB.t1-3.4])B.add(new THREE.CylinderGeometry(.55,.75,2.4,10),ADM.stone,0,-.9,t,0,0,0,2.4,1,1);
  B.done(g);}
function advMap(x,w2s,k){const a=w2s(FB.ux*FB.t0,FB.uz*FB.t0),b=w2s(FB.ux*FB.t1,FB.uz*FB.t1);x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2.5,FB.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();}

/* ---------- ⛰️ Lookout Mountain ---------- */
const MZ=Z.mountain;
const MT={H:10.5,axL:9.5,axR:6,az:6.6,top:.3};
// the climbing wall: on the steep +x side the mountain is cut flat from the foot (x0, on the ground) to the top (x1, at H), hw wide
const WALL={x0:5.75,x1:2.05,hw:2.1};
const wallH=lx=>MT.H*Math.max(0,Math.min(1,(WALL.x0-lx)/(WALL.x0-WALL.x1)));
const wallX=y=>WALL.x0-(WALL.x0-WALL.x1)*y/MT.H;// how far out the wall face is at height y
// the smooth shape (no bumps): how far out you are (re, 1 at the foot) and how high
function mtBase(lx,lz){const ax=lx<0?MT.axL:MT.axR,re=Math.hypot(lx/ax,lz/MT.az);if(re>=1)return [re,0];const r=Math.max(0,re-MT.top)/(1-MT.top);return [re,MT.H*Math.pow(1-r*r,1.7)];}
// the hiking trail: from the front round the back of the mountain, a hairpin turn, and back round higher up to the top.
// It climbs evenly all the way (its own height, not the rock's): where the rock is higher it's cut into the mountain, where it's lower it's a ledge.
const TRAIL=[];
{const pt=(phi,re)=>{const ph=deg(phi),ax=Math.cos(ph)<0?MT.axL:MT.axR;return new THREE.Vector2(ax*re*Math.cos(ph),MT.az*re*Math.sin(ph));};
  const pts=[],seg=(p0,p1,r0,r1)=>{const n=Math.ceil(Math.abs(p1-p0)/2.5);for(let i=0;i<=n;i++){const u=i/n;pts.push(pt(p0+(p1-p0)*u,r0+(r1-r0)*u));}};
  seg(108,300,1.04,.72);
  // the hairpin: half a circle from the outer path round to the inner one
  {const O=pt(300,.72),I=pt(300,.42),C=O.clone().add(I).multiplyScalar(.5),r=O.distanceTo(I)/2,T=pt(303,.57).sub(pt(297,.57)).normalize(),V=O.clone().sub(C);
    for(let i=1;i<12;i++){const th=Math.PI*i/12;pts.push(C.clone().add(V.clone().multiplyScalar(Math.cos(th))).add(T.clone().multiplyScalar(r*Math.sin(th))));}}
  seg(300,120,.42,.31);pts.push(new THREE.Vector2(-1.2,.7));
  let L=0;const len=[0];for(let i=1;i<pts.length;i++){L+=pts[i].distanceTo(pts[i-1]);len.push(L);}
  // it gets all the way up just as it reaches the flat top
  let k=pts.findIndex(p=>mtBase(p.x,p.y)[0]<MT.top+.07);if(k<1)k=pts.length-1;
  pts.forEach((p,i)=>TRAIL.push({lx:p.x,lz:p.y,h:MT.H*Math.min(1,len[i]/len[k])}));}
// the closest spot on the trail: [distance, height there, how far along (0..1)]
function trailNear(lx,lz){let bd=1e9,bh=0,bu=0,bx=0,bz=0;for(let i=0;i<TRAIL.length-1;i++){const a=TRAIL[i],b=TRAIL[i+1],dx=b.lx-a.lx,dz=b.lz-a.lz,L2=dx*dx+dz*dz||1;
    const u=Math.max(0,Math.min(1,((lx-a.lx)*dx+(lz-a.lz)*dz)/L2)),px=a.lx+dx*u,pz=a.lz+dz*u,d=Math.hypot(lx-px,lz-pz);if(d<bd){bd=d;bh=a.h+(b.h-a.h)*u;bu=(i+u)/(TRAIL.length-1);bx=px;bz=pz;}}
  return [bd,bh,bu,bx,bz];}// bx,bz: that spot on the trail
const TRAIL_W=.8;// walkable this far from the middle of the trail
// how high the mountain is at a local spot (the rock you see and the ground you walk on are the same): [height, walkable, re]
function mtH(lx,lz){if(lx<-MT.axL-1.4||lx>MT.axR+1.4||Math.abs(lz)>MT.az+1.4)return [0,true,2];
  let [re,h]=mtBase(lx,lz);
  if(re<1&&re>MT.top){// rocky bumps, none on the flat top and none at the very foot
    h+=(Math.sin(lx*1.7+lz*.6)*Math.sin(lz*2.1-lx*.8)*.3+Math.sin(lx*3.9+lz*3.1)*.09)*Math.min(1,(re-MT.top)*6)*Math.min(1,(1-re)*5);
    if(lx>0){const k=Math.max(0,Math.min(1,(Math.abs(lz)-WALL.hw)/.9));if(k<1){const c=wallH(lx);h=Math.min(h,c+(Math.max(h,c)-c)*k);}}}
  if(re<MT.top+.03)return [MT.H,true,re];
  if(re<1.2){const [d,th]=trailNear(lx,lz);
    if(d<TRAIL_W)return [th,true,re];
    if(d<TRAIL_W+.45){const k=(d-TRAIL_W)/.45;h=th+(h-th)*k*k*(3-2*k);}}
  return [Math.max(0,h),re>=1,re];}
// on the minimap the mountain is a grey-brown circle like any place (MAPC in 26-map.js)
// The ground you stand on is read off the very same triangles that are drawn (MTG, mtGround), so where the trail is a tall ledge
// you can't stand on air past its edge or sink into the rock.
const MTG={W:2*(MT.axL+.6),D:2*(MT.az+.6)};MTG.nx=Math.round(MTG.W*4);MTG.nz=Math.round(MTG.D*4);MTG.x0=-MTG.W/2+(MT.axR-MT.axL)/2;MTG.z0=-MT.az-.6;MTG.dx=MTG.W/MTG.nx;MTG.dz=MTG.D/MTG.nz;MTG.h=new Float32Array((MTG.nx+1)*(MTG.nz+1));
function mtGround(lx,lz){const G=MTG,fx=(lx-G.x0)/G.dx,fz=(lz-G.z0)/G.dz;if(fx<0||fz<0||fx>=G.nx||fz>=G.nz)return mtH(lx,lz)[0];
  const ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz,n=G.nx+1,H=G.h,a=H[iz*n+ix],b=H[(iz+1)*n+ix],c=H[(iz+1)*n+ix+1],d=H[iz*n+ix+1];
  return Math.max(0,u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v));}// the plane's two triangles in each square: (a,b,d) and (b,c,d)
{const W=MTG.W,D=MTG.D,geo=new THREE.PlaneGeometry(W,D,MTG.nx,MTG.nz);geo.rotateX(-Math.PI/2);geo.translate((MT.axR-MT.axL)/2,0,0);
  const p=geo.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const lx=p.getX(i),lz=p.getZ(i),[h,walk,re]=mtH(lx,lz);p.setY(i,h>.005?h:-.06);MTG.h[i]=h>.005?h:-.06;
    const n=Math.sin(lx*5.3+lz*2.1)*.5+Math.sin(lx*1.3-lz*4.7)*.5,n2=Math.sin(lx*11.7-lz*7.3)*Math.sin(lz*9.1+lx*3.3),onTrail=re<1&&re>MT.top+.03&&trailNear(lx,lz)[0]<TRAIL_W-.1;
    const band=Math.sin(h*2.3+n*.8)*.5+.5;// layers in the rock
    if(onTrail)c.setRGB(.56+n*.04,.44+n*.03,.31,THREE.SRGBColorSpace);// packed dirt
    else if(re<MT.top+.03)c.setRGB(.36+n*.05,.5+n*.05,.24,THREE.SRGBColorSpace);// grass on the top
    else if(h<.45||(re>.72&&n2>.45&&!(lx>WALL.x1-.3&&Math.abs(lz)<WALL.hw+.4)))c.setRGB(.33+n*.05,.47+n*.05,.22,THREE.SRGBColorSpace);// grass at the foot, and grassy patches
    else{const g=.42+n*.06+band*.07+n2*.03;c.setRGB(g*1.04,g*.96,g*.86,THREE.SRGBColorSpace);if(lx>WALL.x1-.2&&Math.abs(lz)<WALL.hw)c.setRGB(g*.98,g*.93,g*.86,THREE.SRGBColorSpace);}
    col.set([c.r,c.g,c.b],i*3);}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
  M(geo,ADM.rock,0,0,0,MZ.g,true,true);
  const B=advBatch();
  // log steps along the trail
  for(let i=1;i<TRAIL.length-1;i++){const a=TRAIL[i-1],b=TRAIL[i+1],ang=Math.atan2(b.lx-a.lx,b.lz-a.lz),q=TRAIL[i];
    if(i%2===0&&q.h<MT.H-.05)B.add(cyl(.09,.09,1.4,7),ADM.dark,q.lx,q.h+.02,q.lz,0,ang,Math.PI/2,1,1,1,'YXZ');}
  // boulders round the foot and small pines on the slopes (not on the trail or the wall)
  let sd=11;const rr=()=>((sd=(sd*16807)%2147483647)-1)/2147483646;
  for(let i=0;i<70;i++){const ph=rr()*Math.PI*2,re=.35+rr()*.75,ax=Math.cos(ph)<0?MT.axL:MT.axR,lx=ax*re*Math.cos(ph),lz=MT.az*re*Math.sin(ph);
    if(lx>WALL.x1-.5&&Math.abs(lz)<WALL.hw+1.4)continue;if(trailNear(lx,lz)[0]<TRAIL_W+.9)continue;const h=mtH(lx,lz)[0];
    if(re>.95||rr()<.55){const s=.25+rr()*.55;B.add(new THREE.DodecahedronGeometry(s,0),ADM.stone,lx,h+s*.2,lz,rr()*3,rr()*3,0,1,.7,1.1);}
    else if(re>.45){const s=.55+rr()*.5;B.add(cyl(.06,.09,1.2*s,6),ADM.bark,lx,h+.5*s,lz);for(let k=0;k<3;k++)B.add(new THREE.ConeGeometry((.75-k*.18)*s,1.1*s,7),k%2?ADM.pine:ADM.pine2,lx,h+(1.1+k*.55)*s,lz);}}
  // the top: a flagpole, a bench and the zip line's tall post
  B.stick(new THREE.Vector3(-1.4,MT.H,-.9),new THREE.Vector3(-1.4,MT.H+3.4,-.9),.04,ADM.steel,8);
  B.add(box(1.4,.08,.42),ADM.wood,-.2,MT.H+.45,-1.25);B.add(box(.08,.45,.36),ADM.dark,-.8,MT.H+.22,-1.25);B.add(box(.08,.45,.36),ADM.dark,.4,MT.H+.22,-1.25);
  // the climbing wall's holds (bright, like a real wall) and the bolt the auto-belay rope hangs from
  const holdM=['#ff5a5f','#ffd23f','#4fb6ff','#7ee081','#b388ff','#ff8a1f'].map(c=>std(c,{roughness:.55}));ADM.holds=holdM;
  const n=new THREE.Vector3(WALL.x0-WALL.x1,0,0).normalize();
  for(let i=0;i<70;i++){const y=.3+rr()*(MT.H-.5),lz=(rr()-.5)*2.6,lx=wallX(y)+.04,s=.07+rr()*.07;B.add(new THREE.DodecahedronGeometry(s,0),holdM[i%holdM.length],lx,y,lz,rr()*3,rr()*3,0,.7,1,1.2);}
  B.add(box(.12,.12,.4),ADM.steel,WALL.x1-.25,MT.H+.35,0);
  // the glowing spot at the foot of the wall
  {const r=M(new THREE.RingGeometry(.55,.75,32),ADM.pad,WALL.x0+.85,.03,0,MZ.g,false,false);r.rotation.x=-Math.PI/2;MZ.wallPad=r;}
  B.done(MZ.g);
  // the flag waves
  const flag=M(new THREE.PlaneGeometry(.9,.55,6,2),std('#ff6fae',{side:THREE.DoubleSide,roughness:.7}),-1.4+.45,MT.H+3.1,-.9,MZ.g,false,false);
  const fp=flag.geometry.attributes.position,fb=Float32Array.from(fp.array);
  anims.push(t=>{if(!flag.visible)return;for(let i=0;i<fp.count;i++){const x=fb[i*3];fp.array[i*3+2]=Math.sin(t*5+x*5)*.08*(x+.45);}fp.needsUpdate=true;});
  signpost(MZ);}

/* ---------- 🌲 Treetop Adventure: tall trees, platforms, rope bridges, a ladder ---------- */
const TZ=Z.ropes;
const RC=[{x:4.5,z:3.5,h:4.0,r:1.4},{x:-1,z:1,h:4.4,r:1.3},{x:-6,z:-1.5,h:4.8,r:1.3},{x:-1.5,z:-5.5,h:5.3,r:1.45}];
const RB=[{a:0,b:1,kind:'plank',name:'Wobbly Planks',hw:.5,sag:.28},{a:1,b:2,kind:'sky',name:'Sky Walk',hw:.38,sag:.2},{a:2,b:3,kind:'logs',name:'Swinging Logs',hw:.42,sag:.22}];
const RLAD={p:0,dir:Math.atan2(.8,.6)};// the ladder hangs off the first platform, toward the footbridge
for(const P of RC){[P.wx,P.wz]=TZ.toWorld(P.x,P.z);}
for(const b of RB){const A=RC[b.a],C=RC[b.b];b.len=Math.hypot(C.x-A.x,C.z-A.z);b.u0=(A.r-.15)/b.len;b.u1=1-(C.r-.15)/b.len;b.dx=(C.x-A.x)/b.len;b.dz=(C.z-A.z)/b.len;}
// the height of a rope bridge at a point along it (u 0 at the first tree, 1 at the next)
const rbH=(b,u)=>{const A=RC[b.a],C=RC[b.b],k=Math.max(0,Math.min(1,(u-b.u0)/(b.u1-b.u0)));return A.h+(C.h-A.h)*u-b.sag*Math.sin(Math.PI*k);};
function rcAt(x,z){// which platform or bridge is under a world spot: {p:index} or {b:index,u} or null
  if(Math.abs(x-TZ.x)>11||Math.abs(z-TZ.z)>11)return null;const [lx,lz]=TZ.toLocal(x,z);
  for(let i=0;i<RC.length;i++){const P=RC[i];if(Math.hypot(lx-P.x,lz-P.z)<P.r)return {p:i,h:P.h+.09};}
  for(let i=0;i<RB.length;i++){const b=RB[i],A=RC[b.a],ox=lx-A.x,oz=lz-A.z,along=ox*b.dx+oz*b.dz,side=-ox*b.dz+oz*b.dx,u=along/b.len;
    if(u>b.u0-.02&&u<b.u1+.02&&Math.abs(side)<b.hw)return {b:i,u,h:rbH(b,u)+.06};}
  return null;}
SURF.push({h(x,z){const r=rcAt(x,z);return r?r.h:-1;}});
// a tall tree: a trunk with bark, a few branches, and a big leafy top above the platforms
function advTree(B,x,z,hgt,s,rr){B.add(cyl(.24*s,.36*s,hgt,10),ADM.bark,x,hgt/2,z);
  for(let k=0;k<4;k++){const a=rr()*Math.PI*2,y=hgt*(.62+rr()*.25),L=1.2+rr()*1.2;B.stick(new THREE.Vector3(x,y,z),new THREE.Vector3(x+Math.sin(a)*L,y+.7+rr()*.6,z+Math.cos(a)*L),.07*s,ADM.bark,6);}
  const gm=[ADM.green,ADM.green2,ADM.green3];
  for(let k=0;k<9;k++){const a=rr()*Math.PI*2,d=rr()*1.7*s,y=hgt*.72+rr()*hgt*.32,r=(1.1+rr()*.8)*s;B.add(new THREE.IcosahedronGeometry(r,1),gm[k%3],x+Math.sin(a)*d,y,z+Math.cos(a)*d,rr(),rr(),0,1,.78,1);}}
// a pine (on the bank round the course)
function advPine(B,x,z,s){B.add(cyl(.12*s,.2*s,2*s,7),ADM.bark,x,s,z);for(let k=0;k<4;k++)B.add(new THREE.ConeGeometry((1.5-k*.3)*s,1.9*s,8),k%2?ADM.pine:ADM.pine2,x,(1.6+k*1.05)*s,z);}
/* ---------- 🪂 the zip lines ---------- */
// a steel cable from A to B (world spots, at cable height) that sags in the middle; you hang under it on a trolley
function zipLine(id,A,B,sag){const L={id,A,B,sag,pts:[],len:[0]};const n=48;
  for(let i=0;i<=n;i++){const u=i/n;L.pts.push(new THREE.Vector3().lerpVectors(A,B,u).add(new THREE.Vector3(0,-sag*4*u*(1-u),0)));if(i)L.len.push(L.len[i-1]+L.pts[i].distanceTo(L.pts[i-1]));}
  L.total=L.len[n];
  L.at=(s,out)=>{s=Math.max(0,Math.min(L.total,s));let i=1;while(i<n&&L.len[i]<s)i++;const a=L.pts[i-1],b=L.pts[i],k=(s-L.len[i-1])/((L.len[i]-L.len[i-1])||1);return out.lerpVectors(a,b,k);};
  return L;}
const ZIPS=[];
// the treetop zip: from the last tree down to a landing spot by the footbridge
const ZT={dir:0};
{const P=RC[3],end=[12.5,-2.6],dx=end[0]-P.x,dz=end[1]-P.z,d=Math.hypot(dx,dz);ZT.dir=Math.atan2(dx,dz);
  const sx=P.x+dx/d*.45,sz=P.z+dz/d*.45,[ax,az]=TZ.toWorld(sx,sz),[bx,bz]=TZ.toWorld(end[0],end[1]);
  const Z1=zipLine('tree',new THREE.Vector3(ax,P.h+2.35,az),new THREE.Vector3(bx,2.45,bz),.55);
  Z1.launch=TZ.toWorld(P.x+dx/d*(P.r-.5),P.z+dz/d*(P.r-.5));Z1.launchH=P.h;Z1.land=TZ.toWorld(end[0]-dx/d*.9,end[1]-dz/d*.9);ZIPS.push(Z1);}
// the big zip: from the top of Lookout Mountain, over the trees, down to the ropes course
{const [tx,tz]=TZ.toWorld(10.5,7.2),[sx,sz]=MZ.toWorld(-.2,.7),dx=tx-sx,dz=tz-sz,d=Math.hypot(dx,dz);
  const Z2=zipLine('mountain',new THREE.Vector3(sx+dx/d*.9,MT.H+2.55,sz+dz/d*.9),new THREE.Vector3(tx,2.45,tz),1.1);
  Z2.launch=[sx+dx/d*.35,sz+dz/d*.35];Z2.launchH=MT.H;Z2.land=[tx-dx/d*.9,tz-dz/d*.9];ZIPS.push(Z2);}
{const B=advBatch();let sd=5;const rr=()=>((sd=(sd*16807)%2147483647)-1)/2147483646;
  // the mulch under the course
  {const m=M(new THREE.CircleGeometry(TZ.r-1.5,48),ADM.mulch,0,.02,0,TZ.g,false,true);m.rotation.x=-Math.PI/2;}
  RC.forEach((P,i)=>{advTree(B,P.x,P.z,12,1,rr);TZ.ob(P.x,P.z,.42);
    // the deck, the beams under it and the railing (with gaps where the bridges, the ladder and the zip line leave)
    B.add(cyl(P.r,P.r,.16,28),ADM.wood,P.x,P.h,P.z);
    for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;B.stick(new THREE.Vector3(P.x,P.h-1.4,P.z),new THREE.Vector3(P.x+Math.sin(a)*(P.r-.1),P.h-.08,P.z+Math.cos(a)*(P.r-.1)),.06,ADM.dark,6);}
    const gaps=[];for(const b of RB){if(b.a===i)gaps.push(Math.atan2(b.dx,b.dz));if(b.b===i)gaps.push(Math.atan2(-b.dx,-b.dz));}
    if(i===RLAD.p)gaps.push(RLAD.dir);if(i===3)gaps.push(ZT.dir);P.gaps=gaps;
    const gapAt=a=>gaps.some(g=>Math.abs(((a-g)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI)<.48);
    const N=14,post=[];for(let k=0;k<N;k++){const a=k/N*Math.PI*2;post.push(gapAt(a)?null:a);}
    for(let k=0;k<N;k++){const a=post[k];if(a==null)continue;const px=P.x+Math.sin(a)*(P.r-.08),pz=P.z+Math.cos(a)*(P.r-.08);B.stick(new THREE.Vector3(px,P.h,pz),new THREE.Vector3(px,P.h+1.05,pz),.035,ADM.wood,6);
      const a2=post[(k+1)%N];if(a2==null)continue;const qx=P.x+Math.sin(a2)*(P.r-.08),qz=P.z+Math.cos(a2)*(P.r-.08);
      for(const y of [.5,1.02])B.stick(new THREE.Vector3(px,P.h+y,pz),new THREE.Vector3(qx,P.h+y,qz),.022,ADM.rope,5);}
    // the steel ring round the trunk that the safety cables go to
    B.add(new THREE.TorusGeometry(.4,.03,6,16),ADM.steel,P.x,P.h+2.15,P.z,Math.PI/2,0,0);});
  // the bridges
  for(const b of RB){const A=RC[b.a],C=RC[b.b],L=(u,dy=0,side=0)=>new THREE.Vector3(A.x+b.dx*b.len*u-b.dz*side,rbH(b,u)+dy,A.z+b.dz*b.len*u+b.dx*side);
    const ang=Math.atan2(b.dx,b.dz),hA=Math.max(A.h,C.h)+2.15;
    // the safety cable above, trunk to trunk
    B.stick(new THREE.Vector3(A.x,hA,A.z),new THREE.Vector3(C.x,hA,C.z),.022,ADM.steel,5);
    const n=Math.round((b.u1-b.u0)*b.len/(b.kind==='logs'?.62:b.kind==='sky'?.5:.36));
    for(let k=0;k<=n;k++){const u=b.u0+(b.u1-b.u0)*k/n,p=L(u);
      if(b.kind==='plank'){B.add(box(1.0,.06,.26),ADM.wood,p.x,p.y-.03,p.z,0,ang+(rr()-.5)*.08,0);
        if(k%2===0)for(const s of [-1,1])B.stick(L(u,0,s*.52),L(u,.95,s*.55),.014,ADM.rope,4);}
      if(b.kind==='sky')B.add(box(.62,.05,.22),ADM.wood,p.x,p.y-.03,p.z,0,ang,0);
      if(b.kind==='logs'&&k>0&&k<n){const g=new THREE.Group();g.position.set(p.x,hA-.02,p.z);g.rotation.y=ang;TZ.g.add(g);
        M(cyl(.13,.13,.85,9),ADM.bark,0,p.y-hA-.08,0,g).rotation.z=Math.PI/2;
        for(const s of [-1,1])M(cyl(.012,.012,hA-p.y,4),ADM.rope,s*.38,(p.y-hA)/2,0,g,false,false);
        const ph=k*1.3;anims.push(t=>{g.rotation.x=Math.sin(t*1.4+ph)*.035;});}}
    if(b.kind==='plank')for(const s of [-1,1]){const pts=[];for(let k=0;k<=12;k++)pts.push(L(b.u0+(b.u1-b.u0)*k/12,.95,s*.55));for(let k=0;k<12;k++)B.stick(pts[k],pts[k+1],.025,ADM.rope,5);
      const bt=[];for(let k=0;k<=12;k++)bt.push(L(b.u0+(b.u1-b.u0)*k/12,-.04,s*.5));for(let k=0;k<12;k++)B.stick(bt[k],bt[k+1],.02,ADM.rope,4);}
    if(b.kind==='sky')for(const s of [-1,1]){const bt=[];for(let k=0;k<=12;k++)bt.push(L(b.u0+(b.u1-b.u0)*k/12,-.05,s*.26));for(let k=0;k<12;k++)B.stick(bt[k],bt[k+1],.016,ADM.steel,4);}}
  // the ladder up to the first platform
  {const P=RC[RLAD.p],dx=Math.sin(RLAD.dir),dz=Math.cos(RLAD.dir),fx=P.x+dx*(P.r+.12),fz=P.z+dz*(P.r+.12),sx=dz,sz=-dx;
    for(const s of [-1,1])B.stick(new THREE.Vector3(fx+sx*s*.26,0,fz+sz*s*.26),new THREE.Vector3(fx+sx*s*.26,P.h+1.1,fz+sz*s*.26),.04,ADM.wood,6);
    for(let y=.3;y<P.h+.9;y+=.34)B.stick(new THREE.Vector3(fx-sx*.26,y,fz-sz*.26),new THREE.Vector3(fx+sx*.26,y,fz+sz*.26),.025,ADM.wood,6);
    RLAD.foot=[fx+dx*.42,fz+dz*.42];RLAD.top=[P.x+dx*(P.r-.55),P.z+dz*(P.r-.55)];RLAD.face=Math.atan2(-dx,-dz);
    const r=M(new THREE.RingGeometry(.45,.62,32),ADM.pad,RLAD.foot[0],.03,RLAD.foot[1],TZ.g,false,false);r.rotation.x=-Math.PI/2;}
  // pines round the course and the mountain (not under the zip lines, not on the trail or the footbridge)
  const nearLine=(x,z)=>ZIPS.some(L=>{const ax=L.A.x,az=L.A.z,bx=L.B.x,bz=L.B.z,dx=bx-ax,dz=bz-az,u=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-dx*u,z-az-dz*u)<2.6;});
  const PB=advBatch();let placed=0;
  for(let i=0;i<400&&placed<26;i++){const a=deg(ADV_LAND.a0+1.5+rr()*(ADV_LAND.a1-ADV_LAND.a0-3)),d=BANK.in+2.5+rr()*(ADV_LAND.out-BANK.in-3.5),x=Math.sin(a)*d,z=Math.cos(a)*d;
    if(nearLine(x,z))continue;const [t,s]=fbLoc(x,z);if(t>FB.t0-2&&Math.abs(s)<3.4)continue;
    const [mx,mz]=MZ.toLocal(x,z);if(mtBase(mx,mz)[0]<1.12)continue;if(mx>WALL.x0-1&&mx<WALL.x0+9&&Math.abs(mz)<5.5)continue;// keep the view of the climbing wall open
    const [lx,lz]=TZ.toLocal(x,z);if(RC.some(P=>Math.hypot(lx-P.x,lz-P.z)<P.r+1.6)||Math.hypot(lx-RLAD.foot[0],lz-RLAD.foot[1])<2)continue;
    if(RB.some(b=>{const A=RC[b.a],ox=lx-A.x,oz=lz-A.z,al=(ox*b.dx+oz*b.dz)/b.len;return al>0&&al<1&&Math.abs(-ox*b.dz+oz*b.dx)<1.8;}))continue;
    const s2=.7+rr()*.45;advPine(PB,x,z,s2);obs.push({x,z,r:.25*s2});placed++;}
  PB.done(scene);
  B.done(TZ.g);
  signpost(TZ);}

{const B=advBatch();
  for(const L of ZIPS){for(let i=0;i<L.pts.length-1;i++)B.stick(L.pts[i],L.pts[i+1],.022,ADM.steel,5);
    const dx=L.B.x-L.A.x,dz=L.B.z-L.A.z,d=Math.hypot(dx,dz),ux=dx/d,uz=dz/d;
    // the post at the bottom, with a big orange stopper on the cable and mulch to land on
    const ex=L.B.x+ux*.6,ez=L.B.z+uz*.6;B.add(cyl(.16,.2,3.2,10),ADM.dark,ex,1.6,ez);B.stick(new THREE.Vector3(ex,2.9,ez),L.B,.022,ADM.steel,5);
    B.add(cyl(.16,.16,.4,12),std('#ff8a1f',{roughness:.6}),L.B.x-ux*.5,L.B.y,L.B.z-uz*.5,Math.PI/2,Math.atan2(ux,uz),0,1,1,1,'YXZ');
    obs.push({x:ex,z:ez,r:.25});
    {const m=M(new THREE.CircleGeometry(1.6,24),ADM.mulch,L.land[0],.025,L.land[1],scene,false,true);m.rotation.x=-Math.PI/2;}
    // up top: the tall post on the mountain (on the tree, the cable just goes round the trunk)
    if(L.id==='mountain'){const px=L.A.x-ux*.35,pz=L.A.z-uz*.35;B.add(cyl(.13,.16,3,10),ADM.dark,px,MT.H+1.5,pz);B.stick(new THREE.Vector3(px,MT.H+2.75,pz),L.A,.03,ADM.dark,6);
      const r=M(new THREE.RingGeometry(.45,.62,32),ADM.pad,L.launch[0],MT.H+.03,L.launch[1],scene,false,false);r.rotation.x=-Math.PI/2;}
    else{const r=M(new THREE.RingGeometry(.4,.55,32),ADM.pad,L.launch[0],L.launchH+.1,L.launch[1],scene,false,false);r.rotation.x=-Math.PI/2;}
    // a trolley waiting at the top
    L.park=advTrolley();L.at(.5,L.park.position);L.park.rotation.y=Math.atan2(ux,uz);scene.add(L.park);}
  B.done(scene);}
// the trolley that runs on the cable, with a handle bar to hold
function advTrolley(){const g=new THREE.Group();M(box(.1,.16,.26),std('#ff6f3c',{roughness:.5,metalness:.3}),0,-.05,0,g,false,false);
  for(const z of [-.08,.08])M(cyl(.05,.05,.06,12),ADM.steel,0,0,z,g,false,false).rotation.z=Math.PI/2;
  M(cyl(.012,.012,.32,5),ADM.steel,0,-.29,0,g,false,false);M(cyl(.022,.022,.46,8),std('#222',{roughness:.6}),0,-.46,0,g,false,false).rotation.z=Math.PI/2;return g;}
const ZTR=advTrolley();ZTR.visible=false;scene.add(ZTR);

/* ---------- the harness (you wear it on the ropes course, the rock wall and the zip lines) ---------- */
function advHarness(A){if(!A||!A.hips)return null;const g=new THREE.Group();g.name='advHarness';const m=std('#ff6f3c',{roughness:.6}),bk=std('#333',{roughness:.5,metalness:.4});
  const w=M(new THREE.TorusGeometry(.142,.018,6,24),m,0,.05,0,g,false,false);w.rotation.x=Math.PI/2;w.scale.set(1.05,.82,1);
  for(const s of [-1,1]){const l=M(new THREE.TorusGeometry(.07,.014,6,16),m,s*.075,-.1,0,g,false,false);l.rotation.x=Math.PI/2;l.rotation.y=s*.25;}
  M(new THREE.TorusGeometry(.03,.009,6,12),bk,0,.02,.13,g,false,false);
  // the lanyard up to the safety cable (only shown up on the course)
  const ly=M(cyl(.01,.01,1,5),std('#3a7bd5',{roughness:.6}),0,.5,.12,g,false,false);g.userData.lanyard=ly;
  A.hips.add(g);return g;}
function advHarnessOff(A,h){if(h&&h.parent){h.parent.remove(h);freeObj(h);}}
let advH=null,advHA=null,advHT=0;// the harness on you, the avatar it's on, how long since you needed it
function advHarnessStep(dt){const need=!!ADS.mode||(HIGH.on&&!!rcAt(player.pos.x,player.pos.z));advHT=need?0:advHT+dt;
  if(advH&&(advHA!==av||!advH.parent)){advHarnessOff(advHA,advH);advH=null;}
  if(need&&!advH){advH=advHarness(av);advHA=av;}
  if(advH&&advHT>1.2){advHarnessOff(advHA,advH);advH=null;}
  if(advH)advLanyard(advH,av,HIGH.on&&!ADS.mode?player.pos.y+2.2:null);}
// the lanyard goes from your harness straight up to the safety cable above you
function advLanyard(h,A,cableY){const ly=h.userData.lanyard;if(cableY==null){ly.visible=false;return;}A.g.updateMatrixWorld(true);const hy=h.getWorldPosition(new THREE.Vector3()).y,L=Math.max(.2,cableY-hy-.02);
  ly.visible=true;ly.scale.y=L;ly.position.y=.02+L/2;ly.rotation.x=-A.spine.rotation.x;}

/* ---------- ground, walls and the harness ---------- */
// groundAt (13-park-and-stars.js) asks: how high is the ground at (x,z), given h from everything else
function advGround(x,z,h){if(!ADV)return h;
  if(Math.hypot(x-MZ.x,z-MZ.z)<13){const [lx,lz]=MZ.toLocal(x,z),m=mtGround(lx,lz);if(m>h)h=m;}
  const s=upSurf(x,z);if(s>-1&&(HIGH.on||s<.5)&&s>h)h=s;
  return h;}
// the game loop asks before each step from old to p: true stops the step
function advBlock(old,p){if(!ADV||ADS.mode)return false;
  // up on the course or the footbridge your harness (or the railing) keeps you from stepping off the edge
  if(HIGH.on){const so=upSurf(old.x,old.z);if(so>1&&old.y>so-.7&&upSurf(p.x,p.z)<0)return true;}
  // the mountain's rock is too steep to walk up; only the trail and the climbing wall go up
  // It goes by the smooth shape (mtBase), not the little rocky bumps, so a dip between bumps can never trap you, and stepping back
  // onto the trail from just beside it is always fine (you'd get stuck by the log steps after falling off the edge).
  if(Math.hypot(p.x-MZ.x,p.z-MZ.z)<13){const [lx,lz]=MZ.toLocal(p.x,p.z),n=mtH(lx,lz);if(!n[1]){const [ox,oz]=MZ.toLocal(old.x,old.z);
    if(n[0]>mtH(ox,oz)[0]+.01&&mtSteepUp(ox,oz,lx,lz))return true;}}
  return false;}
// walking from local (ox,oz) to (lx,lz) off the trail: is it up the steep rock?
function mtSteepUp(ox,oz,lx,lz){const [t0,th0]=trailNear(ox,oz),t1=trailNear(lx,lz)[0];
  if(t1<t0&&t0<TRAIL_W+1.6&&mtGround(ox,oz)>th0-1)return false;// heading back onto the trail from just below its edge
  return mtBase(lx,lz)[1]>mtBase(ox,oz)[1]+.005;}
// 🥾 off the trail on the rock: a button pops you back onto the nearest bit of trail
function mtOffTrail(){const P=player.pos;if(Math.hypot(P.x-MZ.x,P.z-MZ.z)>13||P.y<.5)return false;const [lx,lz]=MZ.toLocal(P.x,P.z),n=mtH(lx,lz);return !n[1]&&n[2]<1&&n[2]>MT.top+.03;}
function backToTrail(){const P=player.pos,[lx,lz]=MZ.toLocal(P.x,P.z),[,th,,bx,bz]=trailNear(lx,lz),[x,z]=MZ.toWorld(bx,bz);
  P.set(x,th+.05,z);player.vy=0;player.speed=0;sfx('pop');toast('🥾 Back on the trail!');}

/* ---------- climbing (the ladder and the rock wall) and zip lining ---------- */
const advBusy=()=>!!(barnRide||BIKE.on||SK.on||FLY.on||closetOpen||!started);
// keyframes: [{x,z,y,d,face,pose}] d = seconds to get there from the one before; pose 'climb' or '' (just walking)
function advGo(mode,keys,done){ADS.mode=mode;ADS.keys=keys;ADS.k=1;ADS.t=0;ADS.done=done;ADS.ph=0;ADS.tilt=0;player.speed=0;
  const P=player.pos;keys[0]={x:P.x,z:P.z,y:P.y,d:0,face:keys[1].face};}
function advStep(dt){if(!ADS.mode)return false;const P=player.pos;player.vy=0;player.onGround=true;player.speed=0;
  if(ADS.mode==='zip')return zipStep(dt);
  const K=ADS.keys;ADS.t+=dt;let k=K[ADS.k];while(k&&ADS.t>=k.d){ADS.t-=k.d;ADS.k++;k=K[ADS.k];}
  if(!k){const L=K[K.length-1];P.set(L.x,L.y,L.z);ADS.mode=null;av.g.rotation.x=0;const d=ADS.done;ADS.done=null;if(d)d();return true;}
  const a=K[ADS.k-1],u=Math.min(1,ADS.t/k.d),e=k.pose==='climb'?u:u*u*(3-2*u);
  P.set(a.x+(k.x-a.x)*e,a.y+(k.y-a.y)*e,a.z+(k.z-a.z)*e);player.face=angDamp(player.face,k.face,Math.min(1,dt*10));
  // the camera swings round behind you, so it doesn't end up inside the rock or the tree
  if(k.pose==='climb'){cam.yaw=angDamp(cam.yaw,k.face+Math.PI,Math.min(1,dt*2.5));cam.pitch+=(.18-cam.pitch)*Math.min(1,dt*2);}
  ADS.pose=k.pose;if(k.pose==='climb'){ADS.ph+=dt*(k.rate||3.2);if(Math.random()<dt*2.2)tone(240+Math.random()*80,.05,'triangle',.04);}
  ADS.tilt+=((k.pose==='climb'?k.tilt||0:0)-ADS.tilt)*Math.min(1,dt*8);
  return true;}
// up the ladder to the first platform
function ladderUp(){if(advBusy()||ADS.mode)return;const P=RC[RLAD.p],[fx,fz]=TZ.toWorld(...RLAD.foot),[tx,tz]=TZ.toWorld(...RLAD.top),f=RLAD.face+TZ.rot;
  const [bx,bz]=TZ.toWorld(RLAD.foot[0]+Math.sin(RLAD.dir)*.12,RLAD.foot[1]+Math.cos(RLAD.dir)*.12);
  toast('You clip into your harness 🦺 Up you go!');sfx('pop');
  advGo('ladder',[null,{x:fx,z:fz,y:0,d:.4,face:f},{x:bx,z:bz,y:P.h-.3,d:P.h*.8,face:f,pose:'climb',rate:4.2},{x:tx,z:tz,y:P.h+.09,d:.55,face:f}],
    ()=>{HIGH.on=true;ADV.plat=RLAD.p;did('ropes','up');toast('🌲 Walk across the bridges to the next tree. Your harness keeps you safe!');});}
function ladderDown(){if(ADS.mode)return;const P=RC[RLAD.p],[fx,fz]=TZ.toWorld(...RLAD.foot),f=RLAD.face+TZ.rot;
  const [bx,bz]=TZ.toWorld(RLAD.foot[0]+Math.sin(RLAD.dir)*.12,RLAD.foot[1]+Math.cos(RLAD.dir)*.12);sfx('pop');
  advGo('ladder',[null,{x:bx,z:bz,y:P.h-.3,d:.55,face:f},{x:bx,z:bz,y:0,d:P.h*.6,face:f,pose:'climb',rate:4.6},{x:fx,z:fz,y:0,d:.4,face:f+Math.PI}],()=>{HIGH.on=false;ADV.plat=null;});}
// up the rock wall to the top of the mountain
function wallClimb(){if(advBusy()||ADS.mode)return;const f=MZ.rot-Math.PI/2,W=(lx,lz,y)=>{const [x,z]=MZ.toWorld(lx,lz);return {x,z,y};};
  toast('🧗 You clip onto the rope. Climb to the top!');sfx('pop');ADV.trailGo=false;
  const keys=[null,{...W(wallX(0)+.62,0,0),d:.45,face:f}];
  for(let i=1;i<=6;i++){const y=MT.H*i/6-(i===6?.35:0);keys.push({...W(wallX(y)+.5,Math.sin(i*1.7)*.25,y),d:1.25,face:f,pose:'climb',rate:3.4,tilt:.32});}
  keys.push({...W(WALL.x1-.7,0,MT.H),d:.6,face:f});
  advGo('wall',keys,()=>{advSummit('wall');});}
function advSummit(how){did('climb',how);sfx('tada');banner('⛰️ You made it to the top!');const p=player.pos;burst(new THREE.Vector3(p.x,p.y+1.2,p.z),'#ffd23f',40,2.6);
  setTimeout(()=>toast('🪂 Step on the glowing spot to zip line all the way down!'),1800);}
// ride a zip line
let zipLast='';
function zipGo(L){if(advBusy()||ADS.mode)return;ADS.mode='zip';ADS.L=L;ADS.s=.4;ADS.v=1.2;ADS.ph=0;ADS.sw=0;ADS.hang=ADS.hang||1.9;ADS.end=0;L.park.visible=false;ZTR.visible=true;
  const dx=L.B.x-L.A.x,dz=L.B.z-L.A.z;ADS.face=Math.atan2(dx,dz);ZTR.rotation.y=ADS.face;HIGH.on=false;ADV.plat=null;
  tone(330,.15,'triangle',.1);tone(440,.2,'triangle',.1,.1);toast(L.id==='mountain'?'🪂 Here you go! Wheee!':'🪂 Hold on tight!');}
const zipV=new THREE.Vector3(),zipV2=new THREE.Vector3();
function zipStep(dt){const L=ADS.L,P=player.pos;
  if(ADS.end>0){// let go and drop the last little bit onto the mulch
    ADS.end+=dt;P.y=Math.max(groundAt(P.x,P.z),P.y-dt*3);if(ADS.end>.35){ADS.mode=null;ZTR.visible=false;L.park.visible=true;av.g.rotation.x=0;player.face=ADS.face;
      did('zip',L.id);const S=SAVE.adv||(SAVE.adv={zips:0});S.zips++;persist();if(L.id==='mountain')earn(5,'zip');
      burst(new THREE.Vector3(P.x,P.y+.3,P.z),'#ffffff',16,1.6);tone(523,.1,'triangle',.12);tone(784,.2,'triangle',.12,.1);toast(L.id==='mountain'?'🪂 What a ride! +5 🪙':'🪂 Awesome zip!');}
    return true;}
  L.at(ADS.s,zipV);L.at(ADS.s+.3,zipV2);const slope=(zipV.y-zipV2.y)/.3;// how steeply it goes down here
  ADS.v+=(9.8*slope*.9-.05*ADS.v*ADS.v)*dt;const left=L.total-ADS.s;if(left<6)ADS.v=Math.min(ADS.v,.9+left*1.25);ADS.v=Math.max(.8,ADS.v);
  ADS.s+=ADS.v*dt;ADS.ph+=dt;
  // swing back as you speed up, forward as you slow down
  const acc=(ADS.v-(ADS.lv??ADS.v))/Math.max(dt,1e-3);ADS.lv=ADS.v;ADS.sw+=(Math.max(-.22,Math.min(.22,-acc*.02))-ADS.sw)*Math.min(1,dt*3);
  L.at(ADS.s,zipV);ZTR.position.copy(zipV);
  P.set(zipV.x,zipV.y-.53-ADS.hang,zipV.z);player.face=ADS.face;
  // the whirr of the trolley
  if((ADS.wt=(ADS.wt||0)-dt)<0){ADS.wt=.12;tone(180+ADS.v*40,.13,'sawtooth',.018+Math.min(.03,ADS.v*.003));}
  if(ADS.s>=L.total-.05){ADS.end=.001;}
  return true;}

/* ---------- poses: climbing hand over hand, hanging from the zip line ---------- */
function advPose(A,mode,ph,tilt){if(!A||!A.arms)return;const R=A.arms,Lg=A.legs;
  if(mode==='climb'){for(let i=0;i<2;i++){const o=ph*Math.PI+i*Math.PI,up=(Math.sin(o)+1)/2;
      R[i].sh.rotation.x=-2.35-up*.55;R[i].sh.rotation.z=R[i].sx*(.18+up*.1);R[i].el.rotation.x=-.25-(1-up)*.55;
      Lg[i].hp.rotation.x=-.25-(1-up)*.75;Lg[i].kn.rotation.x=.35+(1-up)*1.0;}
    A.spine.rotation.x=.1;A.head.rotation.x=-.35;A.g.rotation.order='YXZ';A.g.rotation.x=tilt||0;}
  if(mode==='zip'){for(let i=0;i<2;i++){R[i].sh.rotation.x=-.12;R[i].sh.rotation.z=R[i].sx*2.92;R[i].el.rotation.x=-.08;
      const o=ph*2.2+i*1.3;Lg[i].hp.rotation.x=-.45+Math.sin(o)*.18;Lg[i].kn.rotation.x=.55+Math.sin(o+1)*.2;}
    A.spine.rotation.x=0;A.head.rotation.x=-.12;A.g.rotation.order='YXZ';A.g.rotation.x=tilt||0;}}
// how high the hands are above the feet in the hanging pose (so you hang right under the trolley whatever your size)
function advHandH(A){A.g.updateMatrixWorld(true);const h=A.arms[0].hand.getWorldPosition(new THREE.Vector3()).y,f=A.g.position.y;return Math.max(1.4,Math.min(2.4,h-f));}

/* ---------- the button and what happens every frame ---------- */
{const st=document.createElement('style');st.textContent=`
#advBtn{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 250px);transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;background:linear-gradient(90deg,#3f9a3a,#2fb8a5);box-shadow:0 6px 18px rgba(47,140,80,.45)}
#advBtn:active{transform:translateX(-50%) scale(.94)}
body.dressing #advBtn,body.talking #advBtn,body.shopping #advBtn{display:none!important}
@media (max-height:520px){#advBtn{bottom:calc(env(safe-area-inset-bottom) + 130px)}}`;
  document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<button class="hud" id="advBtn"></button>');}
let advAct=null,advKey='';
function advButton(){const P=player.pos;let t='',f=null;
  if(!ADS.mode&&started&&!closetOpen){
    const near=(x,z,r)=>Math.hypot(P.x-x,P.z-z)<r;
    const [lfx,lfz]=TZ.toWorld(...RLAD.foot),[ltx,ltz]=TZ.toWorld(...RLAD.top),[wpx,wpz]=MZ.toWorld(WALL.x0+.85,0);
    if(!HIGH.on&&P.y<.6&&near(lfx,lfz,1.1)){t='🪜 Climb the ladder';f=ladderUp;}
    else if(HIGH.on&&ADV.plat===RLAD.p&&near(ltx,ltz,1)){t='🪜 Climb back down';f=ladderDown;}
    else if(P.y<.6&&near(wpx,wpz,1.1)){t='🧗 Climb the rock wall';f=wallClimb;}
    else if(mtOffTrail()){t='🥾 Back to the trail';f=backToTrail;}
    else for(const L of ZIPS)if(near(L.launch[0],L.launch[1],L.id==='mountain'?1:.85)&&Math.abs(P.y-L.launchH)<.5){t=L.id==='mountain'?'🪂 Zip line down the mountain!':'🪂 Zip line!';f=()=>zipGo(L);break;}
    if(f&&(barnRide||BIKE.on||SK.on)){t='Hop off first to go up 🙂';f=()=>toast('Hop off your ride first 🙂');}}
  advAct=f;if(t===advKey)return;advKey=t;const b=$('#advBtn');b.textContent=t;b.style.display=t?'block':'none';}
$('#advBtn').onclick=()=>{if(advAct)advAct();};
let advHint=0;
onTick.push(dt=>{if(!ADV)return;const P=player.pos;
  if(!ADS.mode){const s=upSurf(P.x,P.z);HIGH.on=s>-1&&P.y>s-.6;}
  // which platform you're on, and did you just cross a bridge?
  if(HIGH.on&&!ADS.mode){const r=rcAt(P.x,P.z);if(r&&r.p!=null){if(ADV.plat!=null&&ADV.plat!==r.p){const b=RB.find(b=>(b.a===ADV.plat&&b.b===r.p)||(b.b===ADV.plat&&b.a===r.p));
        if(b){did('ropesBridge',b.name);toast(`🌉 You crossed the ${b.name}!`);tone(660,.1,'triangle',.08);tone(880,.15,'triangle',.08,.08);}}ADV.plat=r.p;}}
  else if(!ADS.mode&&!HIGH.on)ADV.plat=null;
  // walked up the trail? (it counts when you start at the bottom)
  if(!ADS.mode&&Math.hypot(P.x-MZ.x,P.z-MZ.z)<13){const [lx,lz]=MZ.toLocal(P.x,P.z),[d,,u]=trailNear(lx,lz);
    if(d<TRAIL_W&&u<.08&&P.y<1.2)ADV.trailGo=true;
    const top=mtBase(lx,lz)[0]<MT.top+.03&&P.y>MT.H-.3;if(top&&!ADV.onTop){if(ADV.trailGo){ADV.trailGo=false;advSummit('trail');}}ADV.onTop=top;}
  // first time over here: how it works
  if(curZone===TZ&&!(advHint&1)&&!HIGH.on){advHint|=1;setTimeout(()=>toast('🌲 Step on the glowing spot by the ladder to climb up to the treetops!'),1200);}
  if(curZone===MZ&&!(advHint&2)){advHint|=2;setTimeout(()=>toast('⛰️ Hike the trail round the back, or climb the rock wall on the steep side!'),1200);}
  advHarnessStep(dt);
  if(ADS.mode){const climb=ADS.mode!=='zip'&&ADS.pose==='climb';
    if(ADS.mode==='zip'){advPose(av,'zip',ADS.ph,ADS.sw);const hh=advHandH(av);ADS.hang+=(hh-ADS.hang)*Math.min(1,dt*6);}
    else if(climb)advPose(av,'climb',ADS.ph,ADS.tilt);else av.g.rotation.x=0;}
  advButton();});
// 👭 friends online see you climb, wear your harness and zip
SHOW.push({k:'adv',
  mine(){if(ADS.mode==='zip')return {m:'zip'};if(ADS.mode&&ADS.pose==='climb')return {m:'climb',t:ADS.tilt>.1?1:0};return (HIGH.on&&rcAt(player.pos.x,player.pos.z))||ADS.mode?{m:'h'}:null;},
  on(f,d){const h={hn:advHarness(f.a),A:f.a,ph:0,tr:null};if(d.m==='zip'){h.tr=advTrolley();scene.add(h.tr);}return h;},
  step(f,d,dt,h){if(!h||!f.a)return;if(h.A!==f.a){advHarnessOff(h.A,h.hn);h.hn=advHarness(f.a);h.A=f.a;}h.ph+=dt;
    if(d.m==='climb')advPose(f.a,'climb',h.ph*3.4,d.t?.32:0);
    if(d.m==='zip'){advPose(f.a,'zip',h.ph,0);const hh=advHandH(f.a);if(h.tr){h.tr.position.set(f.pos.x,f.pos.y+hh+.53,f.pos.z);h.tr.rotation.y=f.cur??f.face;}}
    if(h.hn)advLanyard(h.hn,f.a,d.m==='h'?f.pos.y+2.2:null);},
  off(f,h){if(!h)return;advHarnessOff(h.A,h.hn);if(h.tr){scene.remove(h.tr);freeObj(h.tr);}if(f.a)f.a.g.rotation.x=0;}});
ADV={plat:null,trailGo:false,onTop:false};
// for the test (3d/tests/adventure.mjs)
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{adv:()=>({mode:ADS.mode,up:HIGH.on,plat:ADV.plat,s:ADS.s,btn:advKey,t:clock.elapsedTime,harness:!!(advH&&advH.parent)}),
  ADV_PARTS:{RC,RB,RLAD,ZIPS,WALL,MT,TRAIL,FB,MZ,TZ},advGo:{ladderUp,ladderDown,wallClimb,zipGo,backToTrail},advBlock,trailNear,upSurf,mtH,mtGround,fbDeck});});
