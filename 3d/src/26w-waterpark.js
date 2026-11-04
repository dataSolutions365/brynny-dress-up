/* ================= 💦 SPLASH WATERPARK: tube slides, a wave pool you can surf, a lazy river and a floating playground =================
   Across the canal on the far bank, behind the Runway and the Clothing Store. Walk over the wooden footbridge (BANK_BRIDGES in
   26f-ocean.js) and you're in. The land, the bridge and the pools hook into 26f-ocean.js: BANK_LAND says where you may walk,
   BANK_POOLS how deep the water is (so swimming works just like in the canal), BANK_GROUND how high the floating playground is.
   Everything here is placed in the waterpark's own directions (WPZ.toWorld / toLocal): local x goes across, local +z points
   back toward the island, so the gate and the bridge are at the +z side and the lazy river is at the back (-z).
   - 🌀 The Twister: a big enclosed green and purple tube slide. Step on its pad and the tube conveyor carries you up the tower in a
     yellow tube, then you twist all the way down into the splash pool. 💨 The Racer: an open blue body slide; you climb the spiral
     stairs and go down lying on your back. Both end in the splash pool, where Leo the lifeguard stands in the water.
     The ride follows the slide's shape (WPS[].pts): you speed up going down, slow down on the flat bits and swing up the wall in the turns.
   - 🌊 The wave pool: the wave maker at the deep end sends a set of waves every WAVE.every seconds, rolling toward the beach end.
     Swimmers bob up and down on them. Take a board from the 🏄 rack, paddle out and when a wave reaches you, you stand up and ride it
     in toward the beach, steering left and right. Maya the lifeguard watches from her tall chair.
   - 🛟 The lazy river runs all the way round the lagoon at the back. Step on the tube pad and you float round in a tube (steer left
     and right, push forward to paddle a bit faster). A whole lap counts for the challenges.
   - 🎈 The floating playground in the lagoon: blue, green and yellow inflatables you climb onto from the water, a big slide,
     a bouncer that throws you up in the air, a climbing hump and a step tower to jump off.
   - Challenges are in the 💦 Waterpark tab of challenges.js (did('wpslide', 'twister'|'racer'), did('wpsurf', how far),
     did('wplazy'), did('wpplay', 'slide'|'bounce'|'jump'), did('wpwave') swimming in the waves).
   - Friends online see your tube, your board and how you sit, lie or stand through the 'wpark' entry in SHOW.
   Bikes, skateboards and barn rides can come over the bridge but don't go in the pools. Low-poly, a handful of shared materials. */
const WPZ=Z.water,WP_TOP=-.22;// the water line in the pools
var wpReady=false;
// where everything is, in the waterpark's own directions
const WPL={
  wave:{x0:-28,x1:-6,z0:-3,z1:12,beach:7.5},// the wave pool: deep from z0, the beach slopes up from 'beach' to z1
  splash:{x0:8,x1:22,z0:2,z1:12},// the splash pool at the bottom of the slides
  river:{cx:0,cz:-13,a:19,b:5.5,w:1.5},// the lazy river: a loop at distance b round the line from (-a,cz) to (a,cz), w each side of its middle
  tower:{x:25.5,z:-2,h:9},// the slide tower; its platform is h up
};
WPL.lagR=WPL.river.b-2;// the lagoon inside the river (a wall from lagR to b-w)
const wpIn=(r,lx,lz,m=0)=>lx>r.x0-m&&lx<r.x1+m&&lz>r.z0-m&&lz<r.z1+m;
// how far from the line in the middle of the river's loop
const wpSeg=(lx,lz)=>{const R_=WPL.river,cx=Math.max(-R_.a,Math.min(R_.a,lx));return Math.hypot(lx-cx,lz-R_.cz);};
WPZ.inside=(x,z)=>{const s=bankSector(x,z);return !!s&&s.id==='water'&&Math.hypot(x,z)>CANAL.outR+.4;};
// the 📍 map guide: from the island, head for the bridge first
const WP_FOOT=(()=>{const a=deg(240);return {x:Math.sin(a)*(R-2),z:Math.cos(a)*(R-2)};})();
WPZ.via=()=>Math.hypot(player.pos.x,player.pos.z)<R+.5&&Math.hypot(player.pos.x-WP_FOOT.x,player.pos.z-WP_FOOT.z)>3?WP_FOOT:null;

const WPM={deck:std('#ece3d3',{roughness:.92}),rim:std('#fbfaf6',{roughness:.6}),tile:std('#8fd9ea',{roughness:.4}),
  water:phys('#2fc0de',{roughness:.05,metalness:.05,clearcoat:1,clearcoatRoughness:.06}),wave:phys('#ffffff',{roughness:.05,metalness:.05,clearcoat:1,clearcoatRoughness:.06,vertexColors:true}),
  sand:std('#f1d9a6',{map:TEX.sand,roughness:1}),grass:groundMat,steel:std('#c9ced3',{roughness:.45,metalness:.55}),conc:std('#b9b4ac',{roughness:.85}),
  wood:std('#a8754a',{roughness:.8}),woodD:std('#7c5434',{roughness:.85}),
  green:phys('#2fbf71',{roughness:.25,clearcoat:.8,side:THREE.DoubleSide,transparent:true,opacity:.62,depthWrite:false}),
  purple:phys('#6a3fc4',{roughness:.25,clearcoat:.8,side:THREE.DoubleSide,transparent:true,opacity:.62,depthWrite:false}),
  blue:phys('#2d7fe0',{roughness:.2,clearcoat:1,side:THREE.DoubleSide}),belt:std('#2b3440',{roughness:.7}),beltS:std('#1f5fd6',{roughness:.5}),
  yellow:std('#ffd02a',{roughness:.45}),board:std('#ff7a3d',{roughness:.35}),red:std('#e53935',{roughness:.6}),white:std('#ffffff',{roughness:.6}),
  ib:std('#1e88e5',{roughness:.5}),ig:std('#43c463',{roughness:.5}),iy:std('#ffd23f',{roughness:.5}),
  palm:std('#9a7046',{roughness:.9}),leaf:std('#3f9a3a',{roughness:.7,side:THREE.DoubleSide}),
  ub:std('#ff6f61',{roughness:.7,side:THREE.DoubleSide}),uw:std('#fff4e0',{roughness:.7,side:THREE.DoubleSide})};
const wpM=(geo,mat,x,y,z,p=WPZ.g,cast=false,recv=false)=>M(geo,mat,x,y,z,p,cast,recv);

/* ---------- shapes in the waterpark's directions ---------- */
const wpRect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
// a loop at distance r round the river's middle line
function wpCapsule(r,n=18){const R_=WPL.river,o=[];for(let i=0;i<=n;i++){const a=-Math.PI/2+Math.PI*i/n;o.push([R_.a+Math.cos(a)*r,R_.cz+Math.sin(a)*r]);}
  for(let i=0;i<=n;i++){const a=Math.PI/2+Math.PI*i/n;o.push([-R_.a+Math.cos(a)*r,R_.cz+Math.sin(a)*r]);}return o;}
// a flat shape lying on the ground (y), from an outline and holes in [x,z]
function wpFlat(outline,holes,mat,y){const v=p=>new THREE.Vector2(p[0],-p[1]);const sh=new THREE.Shape(outline.map(v));
  for(const h of holes||[])sh.holes.push(new THREE.Path(h.map(v)));
  const m=wpM(new THREE.ShapeGeometry(sh),mat,0,y,0,WPZ.g,false,true);m.rotation.x=-Math.PI/2;return m;}
// the pool's side walls: a band from the deck down below the water along a closed outline
function wpWall(pts,mat,open=false,y0=.02,y1=-1.3){const n=pts.length,pos=[],idx=[],m=open?n-1:n;
  for(let i=0;i<=m;i++){const [x,z]=pts[i%n];pos.push(x,y0,z,x,y1,z);}
  for(let i=0;i<m;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const mm=mat.clone();mm.side=THREE.DoubleSide;return wpM(g,mm,0,0,0);}
const wpGrow=(pts,cx,cz,k)=>pts.map(([x,z])=>[cx+(x-cx)*k,cz+(z-cz)*k]);

/* ---------- the ground: a concrete deck with holes for the pools, a slope down to the open sea round the outside ---------- */
const WPS_LAND=BANK_LAND.find(s=>s.id==='water');
{const L=WPS_LAND,out=[],n=40;
  for(let i=0;i<=n;i++){const a=deg(L.a0+(L.a1-L.a0)*i/n);out.push(WPZ.toLocal(Math.sin(a)*BANK.in,Math.cos(a)*BANK.in));}
  for(let i=n;i>=0;i--){const a=deg(L.a0+(L.a1-L.a0)*i/n);out.push(WPZ.toLocal(Math.sin(a)*L.out,Math.cos(a)*L.out));}
  const W=WPL.wave,S=WPL.splash;
  const holes=[wpRect(W.x0,W.z0,W.x1,W.z1),wpRect(S.x0,S.z0,S.x1,S.z1),wpCapsule(WPL.river.b+WPL.river.w)];
  wpFlat(out,holes,WPM.deck,.006);
  // white coping round the pools
  const rim=(pts,k,cx,cz)=>wpFlat(wpGrow(pts,cx,cz,k),[pts],WPM.rim,.014);
  rim(wpRect(W.x0,W.z0,W.x1,W.z1-.01),1.03,(W.x0+W.x1)/2,(W.z0+W.z1)/2);rim(wpRect(S.x0,S.z0,S.x1,S.z1),1.05,(S.x0+S.x1)/2,(S.z0+S.z1)/2);
  wpFlat(wpCapsule(WPL.river.b+WPL.river.w+.4),[wpCapsule(WPL.river.b+WPL.river.w)],WPM.rim,.014);
  // the walk-on wall between the river and the lagoon
  wpFlat(wpCapsule(WPL.river.b-WPL.river.w),[wpCapsule(WPL.lagR)],WPM.rim,.01);
  // sandy beach at the shallow end of the wave pool
  {const zb=W.z1-2.6,y0=WP_TOP-.12,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([W.x0,y0,zb,W.x1,y0,zb,W.x1,.02,W.z1,W.x0,.02,W.z1],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,6,0,6,1,0,1],2));g.setIndex([0,2,1,0,3,2]);g.computeVertexNormals();wpM(g,WPM.sand,0,0,0,WPZ.g,false,true);}
  wpFlat(wpRect(W.x0-.6,W.z1,W.x1+.6,W.z1+2.4),[],WPM.sand,.016);
  // pool walls
  wpWall([[W.x0,W.z1],[W.x0,W.z0],[W.x1,W.z0],[W.x1,W.z1]],WPM.tile,true);wpWall(wpRect(S.x0,S.z0,S.x1,S.z1),WPM.tile);
  wpWall(wpCapsule(WPL.river.b+WPL.river.w),WPM.tile);wpWall(wpCapsule(WPL.river.b-WPL.river.w),WPM.tile);wpWall(wpCapsule(WPL.lagR),WPM.tile);
  // the water: the splash pool, the river and the lagoon (the wave pool's water moves, below)
  wpFlat(wpRect(S.x0,S.z0,S.x1,S.z1),[],WPM.water,WP_TOP);
  wpFlat(wpCapsule(WPL.river.b+WPL.river.w),[wpCapsule(WPL.river.b-WPL.river.w)],WPM.water,WP_TOP);
  wpFlat(wpCapsule(WPL.lagR),[],WPM.water,WP_TOP);
  // the slope down to the sea round the outside, and its two ends
  const tl=deg(L.a1-L.a0);M(new THREE.CylinderGeometry(L.out,L.out+2,3,40,1,true,deg(L.a0),tl),WPM.sand,0,-1.5,0,scene,false,true);
  for(const a of [L.a0,L.a1]){const r=deg(a),len=L.out-BANK.out+2,c=(L.out+BANK.out)/2,p=M(new THREE.PlaneGeometry(len,3),WPM.sand,Math.sin(r)*c,-1.5,Math.cos(r)*c,scene,false,false);
    p.rotation.y=r+Math.PI/2;p.material=WPM.sand.clone();p.material.side=THREE.DoubleSide;}}

/* ---------- the footbridge over the canal, and the path to it from behind the Clothing Store ---------- */
{const B=BANK_BRIDGES.find(b=>b.id==='water'),g=new THREE.Group();g.rotation.y=deg(B.a);scene.add(g);
  const z0=R+.3,z1=BANK.in+.8,N=22;
  for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,zA=z0+(z1-z0)*t0,zB=z0+(z1-z0)*t1,yA=bridgeH(t0),yB=bridgeH(t1),len=Math.hypot(zB-zA,yB-yA);
    const p=M(box(B.w,.12,len+.04),WPM.wood,0,(yA+yB)/2-.05,(zA+zB)/2,g,false,true);p.rotation.x=-Math.atan2(yB-yA,zB-zA);
    if(i%3===0)for(const s of [-1,1]){M(cyl(.05,.05,1,6),WPM.woodD,s*(B.w/2-.05),yA+.45,zA,g,false,false);}}
  // the hand rails follow the arch
  for(const s of [-1,1]){const pts=[];for(let i=0;i<=N;i++){const t=i/N;pts.push(new THREE.Vector3(s*(B.w/2-.05),bridgeH(t)+.95,z0+(z1-z0)*t));}
    M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.045,6,false),WPM.woodD,0,0,0,g,false,false);}
  // stone posts in the water under it
  for(const t of [.33,.67])for(const s of [-1,1])M(cyl(.18,.22,2.2,8),WPM.conc,s*(B.w/2-.2),bridgeH(t)-1.2,z0+(z1-z0)*t,g,false,false);
  // a short path from behind the Clothing Store to the bridge
  const path=M(new THREE.PlaneGeometry(2.6,8.9),pathMat,0,.013,R-4.15,g,false,true);// from the island path to the bridgepath.rotation.x=-Math.PI/2;
  const sg=new THREE.Group();sg.position.set(1.9,0,R-1.2);sg.rotation.y=Math.PI;g.add(sg);
  M(cyl(.07,.08,2.2,10),WPM.woodD,0,1.1,0,sg);const lt=labelTex('💦 Waterpark',{size:52});
  for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(2.45,.65),new THREE.MeshStandardMaterial({map:lt,roughness:.6}),0,2.1,s*.056,sg,false,false);if(s<0)p.rotation.y=Math.PI;}
  M(box(2.6,.8,.1),WPM.woodD,0,2.1,0,sg);{const wp=new THREE.Vector3(1.9,0,R-1.2).applyAxisAngle(new THREE.Vector3(0,1,0),g.rotation.y);obs.push({x:wp.x,z:wp.z,r:.25});}}

/* ---------- the gate, umbrellas, loungers and palms ---------- */
{const g=WPZ.g;
  for(const s of [-1,1]){wpM(cyl(.22,.26,4.2,12),WPM.white,s*3.4,2.1,13.2,g,true);WPZ.ob(s*3.4,13.2,.35);}
  const arch=wpM(new THREE.TorusGeometry(3.4,.2,8,24,Math.PI),WPM.ib,0,4.1,13.2,g,true);arch.scale.y=.45;
  const sign=wpM(new THREE.PlaneGeometry(5.6,1.1),new THREE.MeshStandardMaterial({map:labelTex('💦 Splash Waterpark',{size:54,fg:'#1e6fd9',border:'#8fd8ff'}),roughness:.6,side:THREE.DoubleSide}),0,4.7,13.25,g);
  // umbrellas and loungers along the deck
  const UMB=[[-3,8],[-2.5,2],[4.5,6.5],[3.5,0],[-24,14.5],[-16,14.6],[18,14.2],[-27.5,-6.5],[27,8],[-2,-22.5],[8,-22]];
  for(const [x,z] of UMB){wpM(cyl(.04,.04,2.3,6),WPM.steel,x,1.15,z,g);const c=wpM(new THREE.ConeGeometry(1.25,.5,10,1,true),(x+z)&1?WPM.uw:WPM.ub,x,2.35,z,g,true);
    WPZ.ob(x,z,.15);const l=wpM(box(.65,.12,1.7),WPM.white,x+.9,.32,z+.2,g,false,true);l.rotation.x=-.06;wpM(box(.65,.5,.1),WPM.white,x+.9,.55,z-.62,g).rotation.x=-.7;}
  // palm trees round the edge
  const PALM=[[-31,10],[-31,-2],[31,14],[30,3],[-6,13.6],[6,13.6],[-30,-14],[30,-16],[-12,-21.5],[16,-21.3],[0,-21.8]];
  for(const [x,z] of PALM){const s=.85+((x*7+z*3)&3)*.08,lean=((x+z)&1?.12:-.12);const tr=wpM(cyl(.13,.2,4.2*s,7),WPM.palm,x,2.1*s,z,g,true);tr.rotation.z=lean;
    const tx=x-Math.sin(lean)*2.1*s,ty=4.2*s;for(let k=0;k<6;k++){const ka=k*Math.PI/3;const lf=wpM(new THREE.ConeGeometry(.5,2.6,4,1),WPM.leaf,tx+Math.sin(ka)*1.0,ty,z+Math.cos(ka)*1.0,g,true);lf.rotation.set(Math.PI/2+.55,ka,0,'YXZ');lf.scale.set(1.3*s,s,.15*s);}
    WPZ.ob(x,z,.3);}}

/* ---------- 🌀 the slides ---------- */
const T_=WPL.tower,TP=new THREE.Vector3(T_.x,T_.h,T_.z);
// each slide's path (in the waterpark's directions, y up); the ride and the tube both follow it
const WPS=[
  {id:'twister',n:'🌀 Twister',r:1.05,closed:true,lift:'belt',
    pts:[[24.6,9.05,-1.3],[22.8,9,-2.8],[20,8.7,-4.6],[15.2,7.9,-3.8],[12.8,7.1,-.4],[15,6.3,3],[19.4,5.6,2.4],[20.6,4.9,-1.4],[17.4,4.1,-4.3],[13.2,3.4,-2.4],[12.1,2.6,1.2],[13.4,1.6,4.6],[14.2,.6,7.6],[14.6,.05,9.6]]},
  {id:'racer',n:'💨 Racer',r:.8,closed:false,lift:'stairs',
    pts:[[26.6,9.05,-1.4],[28.4,8.5,.4],[29,7.3,2.8],[28.4,6,5.2],[27,4.7,7.4],[25,3.5,9.2],[23,2.3,10.2],[21.2,1.1,10.5],[19.8,.05,10.1]]}];
const wpUp=new THREE.Vector3(0,1,0);
for(const S of WPS){S.curve=new THREE.CatmullRomCurve3(S.pts.map(p=>new THREE.Vector3(...p)),false,'centripetal');S.len=S.curve.getLength();
  // samples along it: middle, way forward, right, and how much it turns per step (for swinging up the wall)
  const N=Math.ceil(S.len*6);S.N=N;S.P=[];S.T=[];
  for(let i=0;i<=N;i++){S.P.push(S.curve.getPointAt(i/N));S.T.push(S.curve.getTangentAt(i/N));}
  S.turn=S.T.map((t,i)=>{const a=S.T[Math.max(0,i-2)],b=S.T[Math.min(N,i+2)];const ha=Math.atan2(a.x,a.z),hb=Math.atan2(b.x,b.z);let d=hb-ha;d=Math.atan2(Math.sin(d),Math.cos(d));return d/(4*S.len/N);});}
// the slide itself: the Twister is a closed tube in green and purple bands, the Racer an open blue half-pipe
function wpSlideMesh(S){const N=S.N,m=S.closed?16:12,arc=S.closed?Math.PI*2:Math.PI*1.15,pos=[],col=[],idx=[],gA=[],pA=[];
  const right=new THREE.Vector3(),up=new THREE.Vector3(),q=new THREE.Vector3();
  for(let i=0;i<=N;i++){const P=S.P[i],T=S.T[i];right.crossVectors(T,wpUp).normalize();up.crossVectors(right,T).normalize();
    for(let j=0;j<=m;j++){const a=-arc/2+arc*j/m;q.copy(P).addScaledVector(right,Math.sin(a)*S.r).addScaledVector(up,-Math.cos(a)*S.r);pos.push(q.x,q.y,q.z);}}
  for(let i=0;i<N;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;((Math.floor(i/(S.closed?10:999)))%2?pA:gA).push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const out=[];for(const [arr,mat] of S.closed?[[gA,WPM.green],[pA,WPM.purple]]:[[gA,WPM.blue]]){const gg=g.clone();gg.setIndex(arr);const mesh=wpM(gg,mat,0,0,0,WPZ.g,!S.closed);mesh.renderOrder=2;out.push(mesh);}
  // steel bands round the closed tube, and grey columns holding it up
  for(let i=6;i<N;i+=Math.round(N/S.len*3.2)){const P=S.P[i],T=S.T[i];
    if(S.closed){const ring=wpM(new THREE.TorusGeometry(S.r+.03,.035,5,18),WPM.steel,P.x,P.y,P.z);ring.lookAt(WPZ.g.localToWorld(P.clone().add(T)));}
    if(P.y>1.6&&i%Math.round(N/S.len*6)<Math.round(N/S.len*3.2)){const h=P.y-S.r;const c=wpM(cyl(.16,.2,h,8),WPM.conc,P.x,h/2,P.z,WPZ.g,true);
      const onPool=wpIn(WPL.splash,P.x,P.z,.3);if(!onPool)WPZ.ob(P.x,P.z,.3);}}
  return out;}
WPZ.g.updateMatrixWorld(true);for(const S of WPS)S.mesh=wpSlideMesh(S);
// the tower: four steel legs, a platform at the top with railings, spiral stairs round it and the tube conveyor up the front
{const g=WPZ.g,h=T_.h;
  for(const sx of [-1,1])for(const sz of [-1,1]){wpM(cyl(.14,.16,h+1.2,8),WPM.steel,T_.x+sx*1.6,(h+1.2)/2,T_.z+sz*1.6,g,true);WPZ.ob(T_.x+sx*1.6,T_.z+sz*1.6,.3);}
  wpM(box(3.8,.25,3.8),WPM.wood,T_.x,h-.12,T_.z,g,true,true);
  for(const [x,z,w,d] of [[0,1.85,3.8,.06],[0,-1.85,3.8,.06],[1.85,0,.06,3.8]])wpM(box(w,1,d),WPM.steel,T_.x+x,h+.5,T_.z+z,g);
  const roof=wpM(new THREE.ConeGeometry(2.9,1.3,4),WPM.ib,T_.x,h+2.5,T_.z,g,true);roof.rotation.y=Math.PI/4;
  for(const sx of [-1,1])for(const sz of [-1,1])wpM(cyl(.05,.05,1.9,6),WPM.steel,T_.x+sx*1.7,h+.95,T_.z+sz*1.7,g);
  // spiral stairs (the Racer's way up): steps round the tower
  for(let i=0;i<46;i++){const f=i/46,a=Math.PI/2+f*Math.PI*3.5,y=f*(h-.3)+.2,x=T_.x+Math.sin(a)*2.75,z=T_.z+Math.cos(a)*2.75;
    const s=wpM(box(1.1,.08,.42),WPM.wood,x,y,z,g,false,false);s.rotation.y=a;}
  for(let i=0;i<16;i++){const f=i/15,a=Math.PI/2+f*Math.PI*3.5;wpM(cyl(.05,.05,f*(h-.3)+1.1,6),WPM.steel,T_.x+Math.sin(a)*3.3,(f*(h-.3)+1.1)/2,T_.z+Math.cos(a)*3.3,g);}
  // the tube conveyor (the Twister's way up), like the real ones: a blue frame with a moving belt and tubes riding up it
  const B0=new THREE.Vector3(T_.x,.35,T_.z+9.2),B1=new THREE.Vector3(T_.x,h,T_.z+1.9),len=B0.distanceTo(B1),ang=Math.atan2(B1.y-B0.y,B0.z-B1.z),mid=B0.clone().add(B1).multiplyScalar(.5);
  WPL.belt={B0,B1,len};
  const bg=new THREE.Group();bg.position.copy(mid);bg.rotation.x=ang;g.add(bg);
  M(box(1.4,.12,len),WPM.belt,0,0,0,bg,true,false);for(const s of [-1,1])M(box(.14,.5,len),WPM.beltS,s*.78,.2,0,bg,true,false);
  WPL.beltTubes=[];for(let i=0;i<5;i++){const t=wpM(new THREE.TorusGeometry(.48,.2,8,16),WPM.yellow,0,0,0,bg);t.rotation.x=Math.PI/2;t.position.y=.25;WPL.beltTubes.push(t);}
  for(const f of [.3,.65])wpM(cyl(.12,.14,mid.y*2*f,8),WPM.steel,T_.x,mid.y*f,B0.z+(B1.z-B0.z)*f,g,true);
  WPZ.ob(T_.x,T_.z+8.2,.5);WPZ.ob(T_.x,T_.z+6.2,.6);}
// the ride pads at the foot of the conveyor and the stairs
const WP_PADS={
  twister:{lx:T_.x-1.6,lz:T_.z+10.6,e:'🌀',t:'Twister'},racer:{lx:T_.x+3.8,lz:T_.z-.6,e:'💨',t:'Racer'},
  surf:{lx:-4.6,lz:1.6,e:'🏄',t:'Surfboards'},tube:{lx:0,lz:-4.4,e:'🛟',t:'Lazy river'}};
for(const k in WP_PADS){const P=WP_PADS[k];P.r=.95;
  P.m=wpM(new THREE.CircleGeometry(.95,28),glow('#8fe3ff',1.2),P.lx,.03,P.lz);P.m.rotation.x=-Math.PI/2;P.m.material.transparent=true;P.m.material.opacity=.75;
  const s=sprite(labelTex(`${P.e} ${P.t}`,{size:52,fg:'#1e6fd9',border:'#8fd8ff'}),1.9,.48);s.position.set(P.lx,2.1,P.lz);WPZ.g.add(s);}
// a rack of surfboards and a stack of tubes beside their pads
{const g=WPZ.g,P=WP_PADS.surf,cols=[WPM.red,WPM.iy,WPM.ib,WPM.ig];
  wpM(box(.1,1.5,2.6),WPM.woodD,P.lx+1.4,.75,P.lz,g,true);
  cols.forEach((c,i)=>{const b=wpM(sph(.5,12,8),c,P.lx+1.2,.95,P.lz-1+i*.66,g,true);b.scale.set(.12,1.9,.55);b.rotation.z=.18;});WPZ.ob(P.lx+1.4,P.lz,.6);
  const Q=WP_PADS.tube;for(let i=0;i<4;i++){const t=wpM(new THREE.TorusGeometry(.5,.2,8,16),[WPM.iy,WPM.ib,WPM.red,WPM.ig][i],Q.lx+1.8,.2+i*.36,Q.lz+.4,g,true);t.rotation.x=Math.PI/2;}WPZ.ob(Q.lx+1.8,Q.lz+.4,.7);}

/* ---------- 🌊 the wave pool and its wave maker ---------- */
const WAVE={every:14,n:3,gap:2.8,spd:3.1,t:9,list:[],geo:null};
{const W=WPL.wave,w=W.x1-W.x0,d=W.z1-W.z0,geo=new THREE.PlaneGeometry(w,d,Math.round(w*2),Math.round(d*2));geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,col=new Float32Array(pos.count*3),deep=new THREE.Color('#1d9fc8'),shal=new THREE.Color('#7fe3ea'),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const lz=pos.getZ(i)+(W.z0+W.z1)/2;c.copy(deep).lerp(shal,Math.max(0,Math.min(1,(lz-W.z0-4)/(W.z1-W.z0-4))));col.set([c.r,c.g,c.b],i*3);}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  WAVE.geo=geo;WAVE.base=Float32Array.from(pos.array);WAVE.mesh=wpM(geo,WPM.wave,(W.x0+W.x1)/2,WP_TOP,(W.z0+W.z1)/2,WPZ.g,false,true);
  // the wave maker house at the deep end, with its grilles just above the water
  const g=WPZ.g;wpM(box(w+1,2.4,2.4),WPM.white,(W.x0+W.x1)/2,1.2,W.z0-1.25,g,true,true);
  for(let i=0;i<6;i++)wpM(box(2.4,.5,.06),WPM.belt,W.x0+2+i*(w-4)/5,.3,W.z0-.03,g);
  wpM(new THREE.PlaneGeometry(6,1),new THREE.MeshStandardMaterial({map:labelTex('🌊 Wave Pool',{size:58,fg:'#1e6fd9',border:'#8fd8ff'}),roughness:.6}),(W.x0+W.x1)/2,1.75,W.z0-.02,g);
  for(let x=W.x0+1;x<W.x1;x+=3)WPZ.ob(x,W.z0-1.25,1.3);}
const wpSmooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// how high one wave is at lz (crest at c): steeper in front, and it grows out of the wave maker and breaks at the beach
function waveOne(c,lz){const W=WPL.wave,A=.62*wpSmooth(W.z0,W.z0+3,c)*(1-wpSmooth(W.beach,W.z1+.5,c)),d=lz-c;return A*Math.exp(-(d*d)/(d>0?.8:3.2));}
function waveH(lz,lx){let h=0;for(const w of WAVE.list)h+=waveOne(w.c,lz);return h+Math.sin(lx*.9+WAVE.t*1.7)*.025+Math.sin(lz*1.3-WAVE.t*2.1)*.02;}
function waveStep(dt){WAVE.t+=dt;const W=WPL.wave;
  // the wave maker sends a set of waves every so often; each rolls in toward the beach
  if(WAVE.t>WAVE.every){WAVE.t=0;for(let i=0;i<WAVE.n;i++)WAVE.list.push({c:W.z0-i*WAVE.gap*WAVE.spd});
    if(started&&curZone===WPZ){tone(220,.5,'sawtooth',.03);tone(330,.5,'sawtooth',.025,.5);if(Math.hypot(...wpLocal())<40)toast('🌊 Here come the waves!');}
    if(WPL.maya)WPL.maya.a.play('wave');}
  for(const w of WAVE.list)w.c+=WAVE.spd*dt;WAVE.list=WAVE.list.filter(w=>w.c<W.z1+2);
  // move the water (only when you can see it)
  if(!WAVE.mesh.visible)return;const pos=WAVE.geo.attributes.position,b=WAVE.base,cz=(W.z0+W.z1)/2,cx=(W.x0+W.x1)/2;
  for(let i=0;i<pos.count;i++){const lz=b[i*3+2]+cz;pos.array[i*3+1]=waveH(lz,b[i*3]+cx)*(lz>W.z1-1.6?Math.max(0,(W.z1-lz)/1.6):1);}
  pos.needsUpdate=true;if((WAVE.f=(WAVE.f||0)+1)%2)WAVE.geo.computeVertexNormals();}

/* ---------- 🎈 the floating playground in the lagoon ---------- */
// k: pad and beam (flat), hump (a dome), bounce (throws you up), slide (climb up one side, slide down the other), steps (a little tower)
const WPI=[
  {k:'pad',x:-17,z:-13,w:2.4,d:2.4,h:.38,c:'ib'},{k:'beam',x:-14.6,z:-13,w:2.4,d:.9,h:.32,c:'iy'},
  {k:'hump',x:-11.8,z:-13,w:3.2,d:2.6,h:1.15,c:'ig'},{k:'beam',x:-9.4,z:-13.5,w:1.8,d:.9,h:.32,c:'ib'},
  {k:'bounce',x:-7.2,z:-13.5,w:2.6,d:2.6,h:.55,c:'iy'},{k:'pad',x:-4.3,z:-12.5,w:2.3,d:2.3,h:.38,c:'ig'},
  {k:'beam',x:-2.1,z:-12.5,w:2.1,d:.9,h:.32,c:'iy'},{k:'slide',x:2.4,z:-12.8,w:6,d:2.4,h:2.4,c:'ig'},
  {k:'pad',x:7.6,z:-13.6,w:2.4,d:2.4,h:.38,c:'ib'},{k:'beam',x:10,z:-13.6,w:2.4,d:.9,h:.32,c:'ig'},
  {k:'steps',x:12.9,z:-13.2,w:3.3,d:2.4,h:1.22,c:'iy'},{k:'pad',x:15.9,z:-12.5,w:2.3,d:2.3,h:.38,c:'ib'}];
// how high the slide is u along it (0 at the climbing end): up a ramp, a flat top, then down the slide into the water
const slideH=(I,u)=>u<2.6?.38+(I.h-.38)*u/2.6:u<3.2?I.h:I.h*Math.pow(Math.max(0,1-(u-3.2)/2.8),1.5);
function wpPieceH(I,lx,lz){const u=lx-(I.x-I.w/2),v=lz-(I.z-I.d/2);if(u<0||u>I.w||v<0||v>I.d)return -1;
  if(I.k==='hump'){const a=(u/I.w-.5)*2,b=(v/I.d-.5)*2,q=1-a*a-b*b;return q<=0?-1:I.h*Math.sqrt(q);}
  if(I.k==='slide')return slideH(I,u);
  if(I.k==='steps')return u<I.w/3?.38:u<I.w*2/3?.8:I.h;
  return I.h;}
function wpPieceAt(lx,lz){for(const I of WPI){const h=wpPieceH(I,lx,lz);if(h>=0)return {I,h};}return null;}
{const g=WPZ.g;
  for(const I of WPI){const pg=new THREE.Group();pg.position.set(I.x,0,I.z);g.add(pg);I.g=pg;const mat=WPM[I.c],edge=WPM[I.c==='ib'?'iy':'ib'];
    if(I.k==='pad'||I.k==='beam'){M(box(I.w-.3,.6,I.d-.3),mat,0,I.h-.3,0,pg,false,false);
      for(const [w,d,x,z] of [[I.w,0,0,I.d/2-.15],[I.w,0,0,-I.d/2+.15],[0,I.d,I.w/2-.15,0],[0,I.d,-I.w/2+.15,0]]){const L=Math.max(w,d)-.3,c=M(new THREE.CapsuleGeometry(.17,L,4,8),edge,x,I.h-.17,z,pg,false,false);c.rotation.set(w?0:Math.PI/2,0,w?Math.PI/2:0);}}
    if(I.k==='hump'){const s=M(sph(1,18,10,0,Math.PI*2,0,Math.PI/2),mat,0,-.05,0,pg,false,false);s.scale.set(I.w/2,I.h+.05,I.d/2);
      for(let k=0;k<4;k++){const st=M(new THREE.TorusGeometry(.32+k*.32,.05,5,20),edge,0,(I.h+.05)*Math.sqrt(1-((.32+k*.32)/1.6)**2)-.02,0,pg,false,false);st.rotation.x=Math.PI/2;st.scale.set(I.w/3.2,I.d/2.6,1);}}
    if(I.k==='bounce'){const c=M(cyl(I.w/2,I.w/2,.7,20),mat,0,I.h-.35,0,pg,false,false);c.scale.z=I.d/I.w;const t=M(new THREE.TorusGeometry(I.w/2-.08,.16,8,24),edge,0,I.h,0,pg,false,false);t.rotation.x=Math.PI/2;I.top=c;}
    if(I.k==='steps')for(let k=0;k<3;k++){const hh=[.38,.8,I.h][k];M(box(I.w/3+.02,hh+.3,I.d),k%2?edge:mat,-I.w/2+I.w/6+k*I.w/3,(hh-.3)/2,0,pg,false,false);}
    if(I.k==='slide'){const sh=new THREE.Shape();sh.moveTo(0,-.3);for(let u=0;u<=6.001;u+=.25)sh.lineTo(u,slideH(I,u));sh.lineTo(6,-.3);sh.closePath();
      const geo=new THREE.ExtrudeGeometry(sh,{depth:I.d,bevelEnabled:false});const s=M(geo,mat,-I.w/2,0,-I.d/2,pg,false,false);
      for(const z of [-I.d/2+.1,I.d/2-.1]){const pts=[];for(let u=0;u<=6.001;u+=.5)pts.push(new THREE.Vector3(u-I.w/2,slideH(I,u)+.32,z));M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),30,.13,6,false),edge,0,0,0,pg,false,false);}
      // climbing handles on the ramp
      for(let u=.5;u<2.6;u+=.5)M(box(.08,.06,I.d-.5),WPM.white,u-I.w/2,slideH(I,u)+.02,0,pg,false,false);}}
  // a big arch over the middle, like the real ones
  const ar=wpM(new THREE.TorusGeometry(1.6,.28,8,20,Math.PI),WPM.ib,-2.1,.3,-12.5,g);ar.rotation.y=Math.PI/2;
  // ropes floating on the water round the play area
  for(const z of [WPL.river.cz-WPL.lagR+.35,WPL.river.cz+WPL.lagR-.35])for(let x=-19;x<=19;x+=.9)wpM(sph(.09,6,4),WPM.red,x,WP_TOP+.03,z);}

/* ---------- 🛟 lifeguards: Leo in the splash pool, Maya on her tall chair by the wave pool ---------- */
{const leoL=Object.assign(defaultGuyLook(),{top:{id:'gtee',c:'#ffffff'},bottom:{id:'gymshorts',c:'#e53935'},hat:null,extras:{}});
  const mayaL=Object.assign(randLook(),{dress:null,top:{id:'tank',c:'#e53935'},bottom:{id:'shorts',c:'#e53935'},hat:null,extras:{}});
  const mk=(look,name,lx,ly,lz,face)=>{let a;try{a=new Avatar(look,name,'#e53935');}catch(e){return null;}
    const [x,w]=WPZ.toWorld(lx,lz);const o={a,g:a.g,pos:new THREE.Vector3(x,ly,w),face:WPZ.rot+face,say:null,sayT:0,y:ly};a.g.position.copy(o.pos);a.g.rotation.y=o.face;scene.add(a.g);
    // a red cross on the back of the shirt
    const cr=new THREE.Mesh(new THREE.PlaneGeometry(.16,.16),new THREE.MeshBasicMaterial({map:canvasTex(64,64,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,64,64);x.fillStyle='#e53935';x.fillRect(22,6,20,52);x.fillRect(6,22,52,20);}),transparent:true}));
    cr.position.set(0,.18,-.13);cr.rotation.y=Math.PI;(a.spine||a.g).add(cr);return o;};
  WPL.leo=mk(leoL,'🛟 Leo',10.4,-.78,6.4,Math.PI*.8);
  // Maya's chair: tall white legs and a seat facing the wave pool
  const cx=-4.8,cz=6.2,g=WPZ.g;for(const sx of [-1,1])for(const sz of [-1,1]){const l=wpM(cyl(.05,.06,2.2,6),WPM.white,cx+sx*.4,1.1,cz+sz*.35,g,true);l.rotation.z=sx*.06;}
  wpM(box(.95,.1,.8),WPM.white,cx,2.1,cz,g,true);wpM(box(.1,.8,.8),WPM.white,cx+.45,2.5,cz,g);for(let i=0;i<4;i++)wpM(box(.08,.05,.7),WPM.white,cx+.6,.4+i*.45,cz,g);
  wpM(box(.5,.8,.1),WPM.red,cx,2.95,cz+.4,g);WPZ.ob(cx,cz,.6);
  WPL.maya=mk(mayaL,'🛟 Maya',cx,2.15,cz,-Math.PI/2);
  if(WPL.maya){const a=WPL.maya.a;WPL.maya.g.position.y=2.15-(.46+(a.legX||0));WPL.maya.sit=true;}}
function wpLifeguards(dt){for(const o of [WPL.leo,WPL.maya]){if(!o)continue;const near=Math.hypot(player.pos.x-o.pos.x,player.pos.z-o.pos.z)<60;o.g.visible=near;if(!near)continue;
  if(o.sit&&!o.a.emote)o.a.play('chair');
  // Leo turns to watch you while you're near the pool
  if(!o.sit){const want=Math.atan2(player.pos.x-o.pos.x,player.pos.z-o.pos.z);if(Math.hypot(player.pos.x-o.pos.x,player.pos.z-o.pos.z)<14)o.face=angDamp(o.face,want,Math.min(1,dt*2));o.g.position.y=o.y+Math.sin(performance.now()/700)*.02;}
  o.g.rotation.y=o.face;o.a.update(dt,0,false);if(o.say&&(o.sayT-=dt)<0){o.g.remove(o.say);o.say=null;}}}
const wpSay=(o,t)=>{if(o){friendBubble(o,t);o.sayT=2.6;}};

/* ---------- how deep, how high (hooked into 26f-ocean.js) ---------- */
// spots where someone sits in a tube, rides a slide or stands on a board: no swimming pose there (you, and friends online)
const WP_NOSWIM=new Set();
function wpDepth(x,z){if(!wpReady)return 0;const [lx,lz]=WPZ.toLocal(x,z);
  for(const p of WP_NOSWIM)if(Math.abs(p.x-x)<1e-4&&Math.abs(p.z-z)<1e-4)return 0;
  if(wpIn(WPL.wave,lx,lz)){const W=WPL.wave;return lz<W.beach?1:Math.max(0,Math.min(1,(W.z1-.4-lz)/(W.z1-.4-W.beach)));}
  if(wpIn(WPL.splash,lx,lz))return 1;
  const s=wpSeg(lx,lz),R_=WPL.river;
  if(Math.abs(s-R_.b)<R_.w)return 1;
  if(s<WPL.lagR)return wpPieceAt(lx,lz)?0:1;
  return 0;}
BANK_POOLS.push(wpDepth);
BANK_GROUND.push((x,z)=>{if(!wpReady)return 0;const [lx,lz]=WPZ.toLocal(x,z);if(lz>-8||lz<-18)return 0;const p=wpPieceAt(lx,lz);return p?p.h:0;});
const wpLocal=()=>WPZ.toLocal(player.pos.x,player.pos.z);
const wpWorld=(lx,lz)=>WPZ.toWorld(lx,lz);

/* ---------- riding: slides, the lazy river and surfing ---------- */
// WP.ride: what takes over moving you ({kind:'slide'|'tube'|'surf'}); WP.board: you have a surfboard
const WP={ride:null,board:false,pads:{},safe:null,coast:null,lap:0,inWaves:0,bnc:0,playUp:null};
const WP_TUBE=()=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.5,.2,10,20),WPM.yellow);t.rotation.order='YXZ';return t;};
const WP_BOARD=()=>{const g=new THREE.Group(),b=M(sph(.5,16,8),WPM.board,0,0,0,g,false,false);b.scale.set(.55,.1,2.2);M(box(.05,.012,3.4),WPM.white,0,.035,0,g,false,false);
  const fin=M(new THREE.ConeGeometry(.08,.2,4),WPM.white,0,-.1,-.8,g,false,false);fin.rotation.x=Math.PI;g.rotation.order='YXZ';return g;};
const wpSit=(a,tgt)=>{tgt.bob=-(a.hip-(.46+a.legX));tgt.l0=tgt.l1=-1.3;tgt.k0=tgt.k1=.75;tgt.an=.35;tgt.a0x=tgt.a1x=-.15;tgt.a0z=-.62;tgt.a1z=.62;tgt.e0=tgt.e1=-.55;tgt.lean=-.3;tgt.hd=0;tgt.sy=0;tgt.spin=0;};
const wpLie=(a,tgt)=>{tgt.bob=0;tgt.l0=tgt.l1=-.04;tgt.k0=tgt.k1=.05;tgt.an=.7;tgt.a0x=tgt.a1x=-.25;tgt.a0z=-.2;tgt.a1z=.2;tgt.e0=tgt.e1=-2;tgt.lean=.25;tgt.hd=0;tgt.sy=0;tgt.spin=0;};
const wpStand=(a,tgt,sp,air,t)=>{skatePose(a,tgt,0,false,t);tgt.k0=tgt.k1=.85;tgt.l0=tgt.l1=-.5;tgt.bob=-.13;tgt.a0z=-1.15+Math.sin(t*2)*.1;tgt.a1z=1.15+Math.sin(t*2+1)*.1;tgt.lean=.18;};
const WP_POSE={tube:wpSit,twister:wpSit,racer:wpLie,surf:wpStand};
function wpPoseOn(kind){av.wpPose=WP_POSE[kind]||null;av.g.rotation.order='YXZ';}
function wpEndPose(){av.wpPose=null;av.g.rotation.x=0;av.g.rotation.z=0;}
// the camera swings round behind you while you ride
const wpCamBehind=(face,dt,k=2.5)=>{cam.yaw=angDamp(cam.yaw,face+Math.PI,Math.min(1,dt*k));};

// 🌀💨 start a slide: up the conveyor (Twister) or the stairs (Racer), then down
function wpSlideStart(id){if(WP.ride||!started)return;const S=WPS.find(s=>s.id===id);if(!S)return;
  if(BIKE.on)toggleBike();if(SK.on)toggleSkate();if(barnRide)stopRide();WP.board=false;wpBoardShow();
  WP.ride={kind:'slide',S,phase:'up',t:0,s:0,v:2.2,roll:0,tube:null};
  if(S.closed){WP.ride.tube=WP_TUBE();scene.add(WP.ride.tube);}
  toast(S.closed?'🌀 Hop in your tube! Up the conveyor you go…':'💨 Up the stairs to the Racer!');
  // pull the camera back a bit so you can see the slide around you
  WP.camSave={d:cam.dist,p:cam.pitch};cam.dist=Math.max(cam.dist,6.8);cam.pitch=Math.max(cam.pitch,.42);}
// where the slide's middle is, s along it: [point, way forward]
function wpSlideAt(S,s){const f=Math.max(0,Math.min(S.N,s/S.len*S.N)),i=Math.min(S.N-1,Math.floor(f)),k=f-i;
  return [S.P[i].clone().lerp(S.P[i+1],k),S.T[i].clone().lerp(S.T[i+1],k).normalize(),S.turn[i]*(1-k)+S.turn[i+1]*k];}
const WPV={a:new THREE.Vector3(),b:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3()};
function wpSlideStep(dt){const R_=WP.ride,S=R_.S,p=player.pos;R_.t+=dt;let lp,fwd,lie=0;
  if(R_.phase==='up'){// carried up the conveyor, or climbing the spiral stairs
    const dur=S.closed?4.2:5,f=Math.min(1,R_.t/dur);
    if(S.closed){const B=WPL.belt;lp=B.B0.clone().lerp(B.B1,f);lp.y+=.25;fwd=B.B1.clone().sub(B.B0).normalize();}
    else{const a=Math.PI/2+f*Math.PI*3.5;lp=new THREE.Vector3(T_.x+Math.sin(a)*2.75,f*(T_.h-.3)+.25,T_.z+Math.cos(a)*2.75);fwd=new THREE.Vector3(Math.cos(a),0,-Math.sin(a));player.speed=2.2;}
    if(f>=1){R_.phase='down';R_.s=0;R_.v=2.4;sfx('jump');if(!S.closed)toast('💨 Ready… go!');}}
  if(R_.phase==='down'){// gravity pulls you down the slide; friction and the air slow you a little
    let [P,T,turn]=wpSlideAt(S,R_.s);const slope=-T.y;
    R_.v+=(9.8*slope*(S.closed?.78:.85)-.035*R_.v*R_.v)*dt;R_.v=Math.max(2.4,Math.min(12,R_.v));R_.s+=R_.v*dt;
    [P,T,turn]=wpSlideAt(S,R_.s);
    // swing up the wall in the turns
    const want=Math.max(-1.1,Math.min(1.1,Math.atan(R_.v*R_.v*turn/9.8)*.9));R_.roll+=(want-R_.roll)*Math.min(1,dt*5);
    const right=WPV.r.crossVectors(T,wpUp).normalize(),up=WPV.u.crossVectors(right,T).normalize(),off=S.r-(S.closed?.36:.16);
    lp=P.clone().addScaledVector(right,-Math.sin(R_.roll)*off).addScaledVector(up,-Math.cos(R_.roll)*off);fwd=T;lie=1;
    if(R_.s>=S.len-.05){wpSlideEnd();return;}}
  const [x,w]=wpWorld(lp.x,lp.z);p.set(x,lp.y,w);player.vy=0;player.onGround=true;if(R_.phase==='down')player.speed=0;
  const wf=WPV.a.set(fwd.x,0,fwd.z).applyAxisAngle(wpUp,WPZ.rot);player.face=Math.atan2(wf.x,wf.z);
  R_.pitch=Math.atan2(-fwd.y,Math.hypot(fwd.x,fwd.z));
  if(R_.phase==='down'||S.closed)wpCamBehind(player.face,dt,R_.phase==='down'?3:1.5);}
function wpSlideEnd(){const R_=WP.ride,S=R_.S,p=player.pos;const [P,T]=wpSlideAt(S,S.len);const [x,w]=wpWorld(P.x,P.z);p.set(x,0,w);
  const wf=WPV.a.set(T.x,0,T.z).normalize().applyAxisAngle(wpUp,WPZ.rot);WP.coast={vx:wf.x*R_.v*.6,vz:wf.z*R_.v*.6};
  if(R_.tube){scene.remove(R_.tube);freeObj(R_.tube);}WP.ride=null;wpEndPose();
  if(WP.camSave){cam.dist=WP.camSave.d;cam.pitch=WP.camSave.p;WP.camSave=null;}
  burst(new THREE.Vector3(x,WP_TOP+.15,w),'#ffffff',40,3.4,.32);sfx('splash');tone(260,.25,'sine',.06,0,90);
  did('wpslide',S.id);WP.slides=(WP.slides||0)+1;
  wpSay(WPL.leo,rnd(['Nice splash! 💦','Woohoo! 🌊','What a ride! 🎉','Again? 😄']));if(WPL.leo)WPL.leo.a.play('cheer');}

// 🛟 the lazy river: s round its middle line (length WP_RIV), side = how far out from the middle (-w..w)
const WP_RIV=4*WPL.river.a+2*Math.PI*WPL.river.b;
function wpRiverAt(s,side=0){const R_=WPL.river,a=R_.a,b=R_.b+side,L1=2*a,L2=Math.PI*R_.b;s=((s%WP_RIV)+WP_RIV)%WP_RIV;
  // the straight near the gate runs -x, round the left end, the straight at the back runs +x, round the right end
  if(s<L1)return [a-s,R_.cz+b,-1,0];s-=L1;
  if(s<L2){const t=Math.PI/2+s/R_.b;return [-a+Math.cos(t)*b,R_.cz+Math.sin(t)*b,-Math.sin(t),Math.cos(t)];}s-=L2;
  if(s<L1)return [-a+s,R_.cz-b,1,0];s-=L1;
  const t=-Math.PI/2+s/R_.b;return [a+Math.cos(t)*b,R_.cz+Math.sin(t)*b,-Math.sin(t),Math.cos(t)];}
function wpTubeStart(){if(WP.ride||!started)return;if(BIKE.on)toggleBike();if(SK.on)toggleSkate();if(barnRide)stopRide();WP.board=false;wpBoardShow();
  WP.ride={kind:'tube',s:2*WPL.river.a-WPL.river.a,side:0,v:1.6,went:0,tube:WP_TUBE(),t:0};scene.add(WP.ride.tube);
  toast('🛟 Relax and float! Steer left and right, push forward to paddle');wpBtns();}
function wpTubeStep(dt,ix,iy,mag){const R_=WP.ride,p=player.pos;R_.t+=dt;
  // the stick steers you across the river and paddles you along
  let fwd=0,lat=0;if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1,mx=(fx*-iy+rx*ix)/n*mag,mz=(fz*-iy+rz*ix)/n*mag;
    const [x,z,tx,tz]=wpRiverAt(R_.s),wd=WPV.a.set(tx,0,tz).applyAxisAngle(wpUp,WPZ.rot),out=WPV.b.set(tz,0,-tx).applyAxisAngle(wpUp,WPZ.rot);
    fwd=mx*wd.x+mz*wd.z;lat=mx*out.x+mz*out.z;}
  const want=1.6+Math.max(0,fwd)*1.4-Math.max(0,-fwd)*1;R_.v+=(want-R_.v)*Math.min(1,dt*1.5);
  R_.s+=R_.v*dt;R_.went+=R_.v*dt;R_.side=Math.max(-.9,Math.min(.9,R_.side+lat*1.6*dt+Math.sin(R_.t*.6)*.05*dt));
  const [lx,lz,tx,tz]=wpRiverAt(R_.s,R_.side),[x,w]=wpWorld(lx,lz);p.set(x,0,w);player.vy=0;player.onGround=true;player.speed=0;
  const wf=WPV.a.set(tx,0,tz).applyAxisAngle(wpUp,WPZ.rot);R_.face=Math.atan2(wf.x,wf.z);player.face=angDamp(player.face,R_.face+Math.sin(R_.t*.4)*.5,Math.min(1,dt*2));
  if(R_.went>=WP_RIV){R_.went-=WP_RIV;did('wplazy',1);sfx('tada');banner('🛟 You floated all the way round!');}}
function wpTubeEnd(){const R_=WP.ride;if(!R_||R_.kind!=='tube')return;const [lx,lz,tx,tz]=wpRiverAt(R_.s,0);
  // climb out on the outside bank
  const out=[tz,-tx],[x,w]=wpWorld(lx+out[0]*(WPL.river.w+1),lz+out[1]*(WPL.river.w+1));player.pos.set(x,0,w);
  scene.remove(R_.tube);freeObj(R_.tube);WP.ride=null;wpEndPose();sfx('splash');wpBtns();}

// 🏄 surfing: with a board you paddle (swimming) in the wave pool; when a wave comes under you, you stand up and ride it in
function wpSurfStep(dt,ix,iy,mag){const R_=WP.ride,p=player.pos,[lx0,lz0]=wpLocal(),W=WPL.wave;R_.t+=dt;
  const w=WAVE.list.find(v=>v===R_.w);
  // ride ends when the wave breaks at the beach (or runs out)
  if(!w||w.c>W.beach+2.2||lz0>W.z1-1.2){wpSurfEnd(true);return;}
  let lat=0;if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1,mx=(fx*-iy+rx*ix)/n*mag,mz=(fz*-iy+rz*ix)/n*mag;
    const ax=WPV.a.set(1,0,0).applyAxisAngle(wpUp,WPZ.rot);lat=mx*ax.x+mz*ax.z;}
  R_.vx+=(lat*4.2-R_.vx)*Math.min(1,dt*3);
  const lx=Math.max(W.x0+.8,Math.min(W.x1-.8,lx0+R_.vx*dt)),lz=w.c+.55;R_.dist+=Math.max(0,lz-lz0);
  const [x,ww]=wpWorld(lx,lz);p.set(x,0,ww);player.vy=0;player.onGround=true;player.speed=0;
  const head=WPV.a.set(R_.vx*.35,0,1).normalize().applyAxisAngle(wpUp,WPZ.rot);player.face=angDamp(player.face,Math.atan2(head.x,head.z),Math.min(1,dt*6));
  wpCamBehind(player.face,dt,2);
  if((R_.sp=(R_.sp||0)-dt)<0){R_.sp=.12;burst(new THREE.Vector3(x,WP_TOP+waveH(lz,lx)+.05,ww),'#ffffff',6,1.4,.16);}}
function wpSurfStart(w){const [lx,lz]=wpLocal();WP.ride={kind:'surf',w,t:0,vx:0,dist:0,z0:lz};wpPoseOn('surf');sfx('jump');toast('🏄 You\'re up! Steer left and right');}
function wpSurfEnd(good){const R_=WP.ride;if(!R_||R_.kind!=='surf')return;WP.ride=null;wpEndPose();
  if(good&&R_.dist>2){did('wpsurf',Math.round(R_.dist));WP.surfs=(WP.surfs||0)+1;sfx('tada');banner(R_.dist>=8?'🏄 You rode it all the way in!':'🏄 Nice wave!');wpSay(WPL.maya,rnd(['Gnarly! 🤙','Great ride! 🏄','Woohoo! 🌊']));}
  WP.surfCool=1.2;}
function wpBoardShow(){if(!WP.boardM){WP.boardM=WP_BOARD();scene.add(WP.boardM);}WP.boardM.visible=WP.board;}

// the game loop asks this before moving you (25-game-loop.js): true = this file moved you this frame
function wpStep(dt,ix,iy,mag){if(!wpReady||!WP.ride)return false;
  if(closetOpen){if(WP.ride.kind==='tube')wpTubeEnd();else if(WP.ride.kind==='surf')wpSurfEnd(false);return false;}
  WP_NOSWIM.add(player.pos);
  if(WP.ride.kind==='slide')wpSlideStep(dt);else if(WP.ride.kind==='tube')wpTubeStep(dt,ix,iy,mag);else if(WP.ride.kind==='surf')wpSurfStep(dt,ix,iy,mag);
  return !!WP.ride;}

/* ---------- every frame ---------- */
function wpTick(dt){if(!wpReady)return;const p=player.pos,t=performance.now()/1000;
  waveStep(dt);wpLifeguards(dt);
  // tubes ride up the conveyor
  {const B=WPL.belt,n=WPL.beltTubes.length;WPL.beltTubes.forEach((m,i)=>{const f=((t*.22+i/n)%1);m.position.z=(.5-f)*B.len;});}
  // the bouncer wobbles, the playground bobs on the water
  for(const I of WPI){I.g.position.y=Math.sin(t*1.3+I.x*.7)*.03;}
  if(!WP.ride)WP_NOSWIM.delete(player.pos);
  if(!started||closetOpen)return;
  const [lx,lz]=wpLocal(),here=curZone===WPZ;
  // bikes, skateboards and barn rides stay out of the pools
  {const rider=(barnRide&&!barnRide.F.swim)||BIKE.on||SK.on;if(here&&rider&&wpDepth(p.x,p.z)>0&&WP.safe){p.x=WP.safe.x;p.z=WP.safe.z;if((WP.rideWarn=(WP.rideWarn||0)-dt)<0){WP.rideWarn=4;toast('Hop off to go in the water 🏊');}}
    else if(here&&wpDepth(p.x,p.z)===0)WP.safe=(WP.safe||new THREE.Vector3()).copy(p);}
  // gliding on after splashing down from a slide
  if(WP.coast){p.x+=WP.coast.vx*dt;p.z+=WP.coast.vz*dt;collide(p);WP.coast.vx*=Math.pow(.15,dt);WP.coast.vz*=Math.pow(.15,dt);if(Math.hypot(WP.coast.vx,WP.coast.vz)<.2)WP.coast=null;}
  // the ride pads
  if(here&&!WP.ride&&player.onGround){for(const k in WP_PADS){const P=WP_PADS[k],d=Math.hypot(lx-P.lx,lz-P.lz);
    if(d<P.r){if(!WP.pads[k]){WP.pads[k]=1;if(k==='twister'||k==='racer')wpSlideStart(k);else if(k==='tube')wpTubeStart();else if(k==='surf'){WP.board=!WP.board;wpBoardShow();sfx('pop');toast(WP.board?'🏄 Got a board! Paddle out and wait for a wave':'🏄 Board back on the rack');wpBtns();}}}
    else if(d>P.r+.5)WP.pads[k]=0;}}
  for(const k in WP_PADS){const P=WP_PADS[k];P.m.material.opacity=.55+Math.sin(t*3)*.2;}
  // 🏄 with a board in the wave pool: paddle, and a wave coming under you stands you up
  const inWave=wpIn(WPL.wave,lx,lz);
  if(WP.board&&!WP.ride){if(!inWave&&!wpIn(WPL.wave,lx,lz,4)){WP.board=false;wpBoardShow();toast('🏄 Board back on the rack');wpBtns();}
    else if(inWave&&SW.k>.6&&(WP.surfCool=(WP.surfCool||0)-dt)<0){const w=WAVE.list.find(v=>Math.abs(v.c-lz)<.9&&v.c<WPL.wave.beach-.5&&waveOne(v.c,lz)>.3);if(w)wpSurfStart(w);}}
  if(WP.boardM&&WP.board){const B=WP.boardM;
    if(WP.ride&&WP.ride.kind==='surf'){const y=WP_TOP+waveH(lz,lx)+.08;B.position.set(p.x,y,p.z);B.rotation.set(-.12,player.face,-(WP.ride.vx||0)*.08);}
    else if(SW.k>.4){B.position.set(p.x+Math.sin(player.face)*.25,WP_TOP+(inWave?waveH(lz,lx):0)+.02,p.z+Math.cos(player.face)*.25);B.rotation.set(0,player.face,0);}
    else{// carried under your arm
      const s=player.face+Math.PI/2;B.position.set(p.x+Math.sin(s)*.32,p.y+.85,p.z+Math.cos(s)*.32);B.rotation.set(0,player.face,Math.PI/2.2);}}
  // swimming in the waves: you bob up and down with them
  if(inWave&&(SW.k>.3||WP.ride)){const h=waveH(lz,lx);if(!WP.ride)av.g.position.y+=h*SW.k;if(h>.25&&!WP.waveDone){WP.waveDone=1;did('wpwave',1);}}
  // your body on a ride (after the swimming code has had its turn)
  const R_=WP.ride;
  if(R_){if(R_.kind==='slide'){const S=R_.S,down=R_.phase==='down';
      if(S.closed||down)wpPoseOn(S.closed?'twister':'racer');else wpEndPose();
      if(S.closed||down){const pitch=R_.pitch||0,lie=!S.closed;av.g.rotation.set(lie?-Math.PI/2+pitch+.28:pitch,player.face,-(R_.roll||0)*.8);
        const nrm=WPV.b.set(0,1,0).applyEuler(av.g.rotation);av.g.position.set(p.x,p.y,p.z).addScaledVector(nrm,lie?.14:.3-(.46+av.legX));
        if(R_.tube){R_.tube.position.set(p.x,p.y+.12,p.z).addScaledVector(nrm,.1);R_.tube.rotation.set(Math.PI/2+pitch,player.face,-(R_.roll||0)*.8,'YXZ');}}}
    if(R_.kind==='tube'){wpPoseOn('tube');const y=WP_TOP+Math.sin(t*1.7)*.03;av.g.rotation.set(Math.sin(t*1.1)*.04,player.face,Math.sin(t*.9)*.05);
      av.g.position.set(p.x,y+.12-(.46+av.legX),p.z);R_.tube.position.set(p.x,y+.02,p.z);R_.tube.rotation.set(Math.PI/2,player.face,0,'YXZ');}
    if(R_.kind==='surf'){const y=WP_TOP+waveH(lz,lx)+.13;av.g.position.set(p.x,y,p.z);av.g.rotation.set(0,player.face,-(R_.vx||0)*.06);}}
  // 🎈 the floating playground: the bouncer throws you up, the slide slides you down
  const pc=here&&lz<-8?wpPieceAt(lx,lz):null;
  if(pc&&!R_){
    if(pc.I.k==='bounce'&&player.onGround&&Math.abs(p.y-pc.h)<.06){player.vy=9.5;player.onGround=false;tone(240,.18,'sine',.08,0,520);WP.playUp='bounce';pc.I.top.scale.y=.7;setTimeout(()=>{pc.I.top.scale.y=1;},150);}
    // on the slide's steep side you slide down it, stuck to its surface, and plop into the water
    if(pc.I.k==='slide'&&lx-(pc.I.x-pc.I.w/2)>3.25&&p.y-pc.h<.7&&player.vy<=.5){const d=WPV.a.set(1,0,0).applyAxisAngle(wpUp,WPZ.rot);p.x+=d.x*6.5*dt;p.z+=d.z*6.5*dt;
      const [ux,uz]=wpLocal(),q=wpPieceAt(ux,uz);p.y=q?q.h:p.y;player.vy=0;player.onGround=true;player.face=Math.atan2(d.x,d.z);WP.playUp='slide';}
    if(pc.I.k==='steps'&&pc.h>1.1&&player.onGround)WP.playUp='jump';}
  if(WP.playUp&&SW.k>.5){did('wpplay',WP.playUp);WP.playUp=null;}
  if(WP.playUp&&player.onGround&&pc&&pc.I.k!=='bounce'&&pc.I.k!=='slide'&&pc.I.k!=='steps')WP.playUp=null;
  if(WP.ride)wpBtns();}
onTick.push(wpTick);

/* ---------- the hop off button ---------- */
{const st=document.createElement('style');st.textContent=`
#wpBtn{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 250px);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;background:linear-gradient(90deg,#3a7bd5,#00a6c8);box-shadow:0 6px 18px rgba(0,120,200,.4)}
#wpBtn:active{transform:translateX(-50%) scale(.94)}
body.dressing #wpBtn,body.talking #wpBtn,body.shopping #wpBtn{display:none!important}
@media (max-height:520px){#wpBtn{bottom:calc(env(safe-area-inset-bottom) + 130px)}}`;document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend','<button class="hud" id="wpBtn"></button>');}
let wpBtnKey='';
function wpBtns(){const k=WP.ride&&WP.ride.kind==='tube'?'tube':WP.board&&!WP.ride?'board':'';if(k===wpBtnKey)return;wpBtnKey=k;const b=$('#wpBtn');
  b.textContent=k==='tube'?'🛟 Hop out':k==='board'?'🏄 Put the board back':'';b.style.display=k?'block':'none';}
$('#wpBtn').onclick=()=>{if(WP.ride&&WP.ride.kind==='tube')wpTubeEnd();else if(WP.board){WP.board=false;wpBoardShow();wpBtns();}};

/* ---------- 🗺️ on the map: the deck, the pools and the bridge ---------- */
MAPC.water='rgba(143,216,255,.18)';
MAP_DRAW.push((x,w2s,k)=>{const L=WPS_LAND,pts=[];for(let i=0;i<=24;i++){const a=deg(L.a0+(L.a1-L.a0)*i/24);pts.push(w2s(Math.sin(a)*BANK.in,Math.cos(a)*BANK.in));}
  for(let i=24;i>=0;i--){const a=deg(L.a0+(L.a1-L.a0)*i/24);pts.push(w2s(Math.sin(a)*L.out,Math.cos(a)*L.out));}
  const poly=(ps,fill)=>{x.beginPath();ps.forEach((q,i)=>i?x.lineTo(...q):x.moveTo(...q));x.closePath();x.fillStyle=fill;x.fill();};
  poly(pts,'#ece3d3');const lw=pp=>pp.map(([a,b])=>w2s(...wpWorld(a,b)));const W=WPL.wave,S=WPL.splash;
  poly(lw(wpRect(W.x0,W.z0,W.x1,W.z1)),'#2fc0de');poly(lw(wpRect(S.x0,S.z0,S.x1,S.z1)),'#2fc0de');
  poly(lw(wpCapsule(WPL.river.b+WPL.river.w,8)),'#2fc0de');poly(lw(wpCapsule(WPL.river.b-WPL.river.w,8)),'#fbfaf6');poly(lw(wpCapsule(WPL.lagR,8)),'#54d0ea');
  const b=BANK_BRIDGES.find(b=>b.id==='water'),a=deg(b.a),p1=w2s(Math.sin(a)*(R-1),Math.cos(a)*(R-1)),p2=w2s(Math.sin(a)*(BANK.in+1),Math.cos(a)*(BANK.in+1));
  x.strokeStyle='#9a6a43';x.lineCap='butt';x.lineWidth=Math.max(2,b.w*k);x.beginPath();x.moveTo(...p1);x.lineTo(...p2);x.stroke();});

/* ---------- 👭 friends online see your tube, your board and how you ride ---------- */
SHOW.push({k:'wpark',
  mine(){const R_=WP.ride;if(R_)return {m:R_.kind==='slide'?(R_.phase==='down'||R_.S.closed?R_.S.id:''):R_.kind};return WP.board?{m:'board'}:null;},
  on(f,d){const m=showEsc(d.m),h={m,mesh:null};if(m==='tube'||m==='twister'){h.mesh=WP_TUBE();scene.add(h.mesh);}
    if(m==='surf'||m==='board'){h.mesh=WP_BOARD();scene.add(h.mesh);}
    if(f.a&&WP_POSE[m]){f.a.wpPose=WP_POSE[m];f.a.g.rotation.order='YXZ';}if(m&&m!=='board')WP_NOSWIM.add(f.pos);return h;},
  step(f,d,dt,h){const A=f.a,P=f.pos;if(!A||!h)return;const fc=f.cur??f.face,m=h.m,t=performance.now()/1000,[lx,lz]=WPZ.toLocal(P.x,P.z);
    if(m==='tube'){const y=WP_TOP+Math.sin(t*1.7)*.03;A.g.position.y=y+.12-(.46+A.legX);if(h.mesh){h.mesh.position.set(P.x,y+.02,P.z);h.mesh.rotation.set(Math.PI/2,fc,0,'YXZ');}}
    if(m==='twister'){A.g.position.y=P.y+.3-(.46+A.legX);if(h.mesh){h.mesh.position.set(P.x,P.y+.2,P.z);h.mesh.rotation.set(Math.PI/2,fc,0,'YXZ');}}
    if(m==='racer'){A.g.rotation.x=-Math.PI/2+.6;A.g.position.y=P.y+.14;}
    if(m==='surf'){const y=WP_TOP+(wpIn(WPL.wave,lx,lz)?waveH(lz,lx):0)+.13;A.g.position.y=y;if(h.mesh){h.mesh.position.set(P.x,y-.05,P.z);h.mesh.rotation.set(-.12,fc,0);}}
    if(m==='board'&&h.mesh){const deep=wpDepth(P.x,P.z)>.4;if(deep){h.mesh.position.set(P.x+Math.sin(fc)*.25,WP_TOP+.02,P.z+Math.cos(fc)*.25);h.mesh.rotation.set(0,fc,0);}
      else{const s=fc+Math.PI/2;h.mesh.position.set(P.x+Math.sin(s)*.32,P.y+.85,P.z+Math.cos(s)*.32);h.mesh.rotation.set(0,fc,Math.PI/2.2);}}},
  off(f,h){if(h&&h.mesh){scene.remove(h.mesh);freeObj(h.mesh);}WP_NOSWIM.delete(f.pos);if(f.a){f.a.wpPose=null;f.a.g.rotation.x=0;f.a.g.rotation.z=0;}}});

// for challenges.js and 3d/tests/waterpark.mjs
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{waterpark:{WP,WPL,WPS,WPI,WAVE,WP_PADS,WPZ,wpDepth,wpRiverAt,wpSlideStart,wpTubeStart,wpTubeEnd,
  local:wpLocal,world:wpWorld,state:()=>({ride:WP.ride?WP.ride.kind:'',phase:WP.ride&&WP.ride.phase||'',slide:WP.ride&&WP.ride.S?WP.ride.S.id:'',board:WP.board,slides:WP.slides||0,surfs:WP.surfs||0,
    waves:WAVE.list.map(w=>w.c),swim:SW.k,brg:BRG.on,zone:curZone&&curZone.id})},bankGround,onBankLand,bridgeAt,BRG});});
wpReady=true;
