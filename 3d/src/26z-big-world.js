/* ================= 🗺️ THE BIG WORLD: land all the way out past the canal, blocked off until we build there =================
   - The island is in the middle, the 🌊 canal goes round it, and past the canal's far bank (BANK in 26f-ocean.js) the land keeps going a
     long way out (to WORLD.out), with big mountains all round the edge. It's split into REGIONS by angle (degrees, like ZONES: 0 is +z,
     90 is +x), each with its own landscape: ❄️ snowy mountains, rolling hills, a pine forest, a lake, red canyon mesas, an orchard.
   - All of it is 🚧 blocked off for now: a wooden fence runs round it with "Coming soon" signs, and you can't walk, swim or fly in.
     Places that are open over there (Lookout Mountain, the waterpark…) push a sector into BANK_LAND as usual (26f-ocean.js); this file
     leaves their land flat, cuts holes for ones that draw their own ground (own:1), and runs the fence round their edge instead.
   - To open a new area later: build the place in its own file, push its BANK_LAND sector and footbridge (see 26h-adventure.js), and
     the hills there flatten and the fence moves round it by itself. No need to rebuild anything else.
   - The big map (26-map.js) shows every region with stripes and a 🔒 name; zoom all the way out to see the whole world.
   - Phones: the ground is ONE shape with colours painted on its corners (no pictures), and every kind of tree and rock is one instanced
     shape, so the whole thing is only a handful of draws. Fewer trees in Light mode. */
const WORLD={in:BANK.out,out:BANK.out+125};
// ang: the middle, half: how wide each side (degrees). kind picks the landscape; col is its colour on the map.
const REGIONS=[
  {id:'peaks',name:'🏔️ Snowy Peaks',ang:0,half:32,kind:'snow',col:'#dfe8f2'},
  {id:'hills',name:'🌻 Sunflower Hills',ang:63,half:31,kind:'hills',col:'#a9d97a'},
  {id:'woods',name:'🌲 Whispering Woods',ang:134,half:40,kind:'forest',col:'#6fae5c'},
  {id:'lake',name:'🏞️ Crystal Lake',ang:194,half:20,kind:'lake',col:'#9fd3a0'},
  {id:'canyon',name:'🏜️ Sunset Canyon',ang:250,half:36,kind:'canyon',col:'#e7a774'},
  {id:'orchard',name:'🍎 Apple Orchard',ang:307,half:21,kind:'orchard',col:'#b6dc8a'},
];
const angD=(a,b)=>((((a-b)%360)+540)%360)-180;// a-b in degrees, -180..180
const wSmooth=(e0,e1,v)=>{const t=Math.max(0,Math.min(1,(v-e0)/(e1-e0)));return t*t*(3-2*t);};
for(const g of REGIONS){g.mid=(WORLD.in+WORLD.out)/2-6;g.x=Math.sin(deg(g.ang))*g.mid;g.z=Math.cos(deg(g.ang))*g.mid;}
const LAKE={x:Math.sin(deg(194))*(WORLD.in+58),z:Math.cos(deg(194))*(WORLD.in+58),r:24};
// which region an angle is in
function regionAt(a){let best=REGIONS[0],bd=1e9;for(const g of REGIONS){const d=Math.abs(angD(a,g.ang))-g.half;if(d<bd){bd=d;best=g;}}return best;}
// is (x,z) on open land over there (a BANK_LAND sector), with a margin m in steps
function openLand(x,z,m=0){const d=Math.hypot(x,z),a=bankAng(x,z);
  return BANK_LAND.find(L=>d<L.out+m&&angD(a,L.a0)>-m*57.3/d&&angD(L.a1,a)>-m*57.3/d);}

/* ---------- how high the ground is ---------- */
const wHash=(i,j)=>{const s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s);};
function vNoise(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  const a=wHash(i,j),b=wHash(i+1,j),c=wHash(i,j+1),d=wHash(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,z,o=4){let s=0,amp=.5,f=1,n=0;for(let i=0;i<o;i++){s+=vNoise(x*f+i*17.3,z*f-i*9.1)*amp;n+=amp;amp*=.5;f*=2.03;}return s/n;}
function kindH(kind,x,z){
  if(kind==='snow'){const r=1-Math.abs(2*fbm(x*.018,z*.018)-1);return 3+30*Math.pow(r,1.7)+4*fbm(x*.07,z*.07);}
  if(kind==='hills')return 7*fbm(x*.028,z*.028);
  if(kind==='forest')return 1+4.5*fbm(x*.035,z*.035);
  if(kind==='lake'){const h=5*fbm(x*.03,z*.03),d=Math.hypot(x-LAKE.x,z-LAKE.z);return h+(-2.6-h)*wSmooth(LAKE.r+12,LAKE.r-3,d);}
  if(kind==='canyon'){const q=Math.max(0,fbm(x*.022,z*.022)-.38)*48,step=5,t=q/step,f=t-Math.floor(t);return (Math.floor(t)+wSmooth(.7,.95,f))*step;}
  return 2.2*fbm(x*.04,z*.04);}// orchard
function worldH(x,z){const r=Math.hypot(x,z);if(r<WORLD.in)return 0;const a=bankAng(x,z);
  let h=0,wt=0;for(const g of REGIONS){const w=wSmooth(-9,9,g.half-Math.abs(angD(a,g.ang)));if(w>0){h+=kindH(g.kind,x,z)*w;wt+=w;}}
  h=wt?h/wt:0;
  h*=wSmooth(WORLD.in+1,WORLD.in+20,r);// flat by the canal's far bank
  h+=wSmooth(WORLD.out-42,WORLD.out-6,r)*(24+20*fbm(x*.045,z*.045));// big mountains all round the edge of the world
  // open places over there keep their land flat
  let F=0;for(const L of BANK_LAND){const ai=wSmooth(-5,1,Math.min(angD(a,L.a0),angD(L.a1,a))),rf=1-wSmooth(L.out,L.out+14,r);F=Math.max(F,ai*rf);}
  h*=1-F;
  return h+(-4-h)*wSmooth(WORLD.out+1,WORLD.out+5,r);}// slope down into the sea at the very edge

/* ---------- the ground: one shape for the whole world ---------- */
// the ground is a grid of rings (WG): groundH(x,z) reads how high its shape really is there, so trees, rocks and the fence sit right on it
const WG={NA:LITE?180:256,NR:LITE?34:46,r0:WORLD.in,r1:WORLD.out+5};
WG.H=new Float32Array(WG.NA*(WG.NR+1));
for(let j=0;j<=WG.NR;j++){const r=WG.r0+(WG.r1-WG.r0)*Math.pow(j/WG.NR,1.08);for(let i=0;i<WG.NA;i++){const a=i/WG.NA*Math.PI*2;WG.H[j*WG.NA+i]=j?worldH(Math.sin(a)*r,Math.cos(a)*r):0;}}
function groundH(x,z){const {NA,NR,r0,r1,H}=WG,r=Math.hypot(x,z);if(r<r0)return 0;
  const fi=(Math.atan2(x,z)/(Math.PI*2)+1)%1*NA,fj=Math.min(NR-1e-6,Math.pow(Math.min(1,(r-r0)/(r1-r0)),1/1.08)*NR),i=Math.floor(fi),j=Math.floor(fj),u=fi-i,v=fj-j,i1=(i+1)%NA;
  const h0=H[j*NA+i]+(H[j*NA+i1]-H[j*NA+i])*u,h1=H[(j+1)*NA+i]+(H[(j+1)*NA+i1]-H[(j+1)*NA+i])*u;return h0+(h1-h0)*v;}
{const {NA,NR,r0,r1,H}=WG;
  const pos=new Float32Array(NA*(NR+1)*3),col=new Float32Array(NA*(NR+1)*3);
  for(let j=0;j<=NR;j++){const r=r0+(r1-r0)*Math.pow(j/NR,1.08);for(let i=0;i<NA;i++){const a=i/NA*Math.PI*2,k=j*NA+i;
    pos[k*3]=Math.sin(a)*r;pos[k*3+1]=H[k]+.004;pos[k*3+2]=Math.cos(a)*r;}}
  const idx=[];const vert=(i,j)=>j*NA+(i%NA);
  for(let j=0;j<NR;j++)for(let i=0;i<NA;i++){const a=vert(i,j),b=vert(i+1,j),c=vert(i,j+1),d=vert(i+1,j+1);
    // a hole where an open place draws its own ground
    const mx=(pos[a*3]+pos[d*3])/2,mz=(pos[a*3+2]+pos[d*3+2])/2,L=openLand(mx,mz,-1);if(L&&L.own)continue;
    idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
  const nrm=geo.attributes.normal.array,C=new THREE.Color(),T=new THREE.Color();
  const PAL={grass:'#7cc35c',forest:'#5c9f48',hills:'#93cf63',orchard:'#86c75e',lake:'#83c463',canyon:'#d9844f',snow:'#e9f1f7',rock:'#8f8a84',sand:'#d9c590',mesa:'#b65e38'};
  for(const k in PAL)PAL[k]=new THREE.Color(PAL[k]);
  for(let k=0;k<NA*(NR+1);k++){const x=pos[k*3],z=pos[k*3+2],h=H[k],r=Math.hypot(x,z),g=regionAt(bankAng(x,z)),steep=1-nrm[k*3+1];
    C.copy(g.kind==='snow'?PAL.grass:g.kind==='canyon'?PAL.canyon:PAL[g.kind]||PAL.grass);
    if(g.kind==='canyon'){T.copy(PAL.mesa);C.lerp(T,Math.min(1,steep*3)*.8);C.offsetHSL(0,0,(Math.floor(h/2.5)%2)*.04);}
    else{C.lerp(PAL.rock,wSmooth(.12,.35,steep));C.lerp(PAL.snow,wSmooth(17,24,h)*(1-wSmooth(.3,.55,steep)*.75));}
    if(g.kind==='lake'&&Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r+3)C.lerp(PAL.sand,.8);
    if(r>WORLD.out-30&&g.kind!=='canyon'){C.lerp(PAL.rock,wSmooth(WORLD.out-30,WORLD.out-14,r)*.7);C.lerp(PAL.snow,wSmooth(24,32,h)*(1-wSmooth(.3,.55,steep)*.75));}
    C.lerp(PAL.grass,1-wSmooth(WORLD.in+1,WORLD.in+6,r));// matches the far bank's grass right by it
    const n=(wHash(Math.round(x*.7),Math.round(z*.7))-.5)*.05;col[k*3]=C.r+n;col[k*3+1]=C.g+n;col[k*3+2]=C.b+n;}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  M(geo,std('#ffffff',{vertexColors:true,roughness:.95,flatShading:true}),0,0,0,scene,false,!LITE);
  // 🏞️ the lake's water
  const lw=M(new THREE.CircleGeometry(LAKE.r+4,40),phys('#3fb6d8',{roughness:.08,clearcoat:1}),LAKE.x,-.3,LAKE.z,scene,false,false);lw.rotation.x=-Math.PI/2;}

/* ---------- trees and rocks: one instanced shape for each kind ---------- */
{let sd=11;const rr=()=>((sd=(sd*16807)%2147483647)-1)/2147483646;
  const mx=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
  const pines=[],rounds=[],rocks=[],cacti=[],L=LITE?.5:1;
  const DENS={snow:1,forest:3.5,lake:.8,hills:.12,orchard:0,canyon:0};
  for(let i=0;i<9000*L;i++){const a=rr()*Math.PI*2,r=WORLD.in+5+Math.sqrt(rr())*(WORLD.out-WORLD.in+2),x=Math.sin(a)*r,z=Math.cos(a)*r;
    if(openLand(x,z,6))continue;const g=regionAt(bankAng(x,z)),h=groundH(x,z),f=rr();
    if(g.kind==='lake'&&Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r+5)continue;
    if(r>WORLD.out-20||h>19){if(f<.012)rocks.push([x,h,z,1.5+rr()*2.5]);continue;}
    if(f<DENS[g.kind]*.09)pines.push([x,h,z,.8+rr()*.8]);
    else if(g.kind==='hills'&&f<.11)rounds.push([x,h,z,.8+rr()*.6,0]);
    else if(g.kind==='canyon'&&f<.016)cacti.push([x,h,z,.8+rr()*.6]);
    else if((g.kind==='canyon'||g.kind==='snow')&&f>.985)rocks.push([x,h,z,.6+rr()*1.4]);}
  // 🍎 the orchard's apple trees stand in rows
  {const g=REGIONS.find(o=>o.id==='orchard');for(let r=WORLD.in+14;r<WORLD.out-24;r+=7*(LITE?1.4:1))for(let a=g.ang-g.half+5;a<g.ang+g.half-5;a+=360*6.5/(2*Math.PI*r)*(LITE?1.4:1)){
    const x=Math.sin(deg(a))*r,z=Math.cos(deg(a))*r;if(openLand(x,z,6))continue;rounds.push([x,groundH(x,z),z,.9+rr()*.25,1]);}}
  const inst=(geo,mat,list,fn)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((t,i)=>{fn(t,i);m.setMatrixAt(i,mx);});
    m.instanceMatrix.needsUpdate=true;m.castShadow=m.receiveShadow=false;m.computeBoundingSphere();scene.add(m);return m;};
  // 🌲 pines: a trunk and two cones (both cones are one instanced shape, two per tree)
  inst(cyl(.22,.32,2,6),std('#7a5a3a',{roughness:.9}),pines,t=>mx.compose(v.set(t[0],t[1]+t[3],t[2]),q.identity(),sc.set(t[3],t[3],t[3])));
  {const cone=new THREE.ConeGeometry(1.7,4.2,7),list=pines.flatMap(t=>[[...t,0],[...t,1]]);
    const m=inst(cone,std('#ffffff',{roughness:.85,flatShading:true}),list,t=>{const s=t[3]*(t[4]?.72:1);mx.compose(v.set(t[0],t[1]+(t[4]?5.6:3.6)*t[3],t[2]),q.identity(),sc.set(s,s,s));});
    if(m){const c=new THREE.Color();pines.forEach((t,i)=>{if(t[1]>13){c.set('#e9f1f7');m.setColorAt(i*2+1,c);c.set('#3a7d4a');m.setColorAt(i*2,c);}else{c.set(i%3?'#2f7a3f':'#3c8a45');m.setColorAt(i*2,c);m.setColorAt(i*2+1,c);}});m.instanceColor.needsUpdate=true;}}
  // 🌳 round trees on the hills, 🍎 apple trees in the orchard (red dots for apples)
  inst(cyl(.2,.28,2.2,6),std('#80603f',{roughness:.9}),rounds,t=>mx.compose(v.set(t[0],t[1]+1.1*t[3],t[2]),q.identity(),sc.set(t[3],t[3],t[3])));
  {const m=inst(new THREE.IcosahedronGeometry(1.7,1),std('#ffffff',{roughness:.85,flatShading:true}),rounds,t=>mx.compose(v.set(t[0],t[1]+3*t[3],t[2]),q.identity(),sc.set(t[3],t[3]*.9,t[3])));
    if(m){const c=new THREE.Color();rounds.forEach((t,i)=>{c.set(t[4]?'#4f9a3e':'#66b44f');m.setColorAt(i,c);});m.instanceColor.needsUpdate=true;}}
  {const ap=rounds.filter(t=>t[4]).flatMap(t=>[0,1,2,3].map(k=>[t[0]+Math.sin(k*1.7+t[0])*1.4*t[3],t[1]+(2.6+(k%2)*.8)*t[3],t[2]+Math.cos(k*1.7+t[0])*1.4*t[3]]));
    inst(new THREE.IcosahedronGeometry(.22,0),std('#e0392e',{roughness:.5}),ap,t=>mx.compose(v.set(...t),q.identity(),sc.set(1,1,1)));}
  // 🌵 cacti in the canyon
  inst(new THREE.CapsuleGeometry(.35,2.2,3,7),std('#4f8f4a',{roughness:.8}),cacti,t=>mx.compose(v.set(t[0],t[1]+1.4*t[3],t[2]),q.identity(),sc.set(t[3],t[3],t[3])));
  // 🪨 rocks
  inst(new THREE.DodecahedronGeometry(1,0),std('#8d8781',{roughness:.95,flatShading:true}),rocks,t=>{e.set(rr()*3,rr()*3,0);q.setFromEuler(e);mx.compose(v.set(t[0],t[1]+t[3]*.3,t[2]),q,sc.set(t[3],t[3]*.7,t[3]));});}

/* ---------- 🚧 the fence round the blocked-off land, and "Coming soon" signs ---------- */
const WFENCE=[];// [x,z] of every post, for the test
{const RF=WORLD.in+1.4,posts=[],rails=[];
  const post=(x,z)=>{posts.push([x,groundH(x,z),z]);WFENCE.push([x,z]);};
  const rail=(a,b)=>rails.push([a,b]);
  // a line of fence from (x0,z0) to (x1,z1)
  const line=(x0,z0,x1,z1)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,z1-z0)/2.6));let prev=null;
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;post(x,z);const p=posts[posts.length-1];if(prev)rail(prev,p);prev=p;}};
  const arc=(r,a0,a1)=>{const n=Math.max(1,Math.round(Math.abs(deg(a1-a0))*r/2.6));let prev=null;
    for(let i=0;i<=n;i++){const a=deg(a0+(a1-a0)*i/n);post(Math.sin(a)*r,Math.cos(a)*r);const p=posts[posts.length-1];if(prev)rail(prev,p);prev=p;}};
  // round the whole world just past the far bank, except where an open place reaches out further: round its edge there instead
  const big=BANK_LAND.filter(L=>L.out>RF-1).map(L=>({...L,o:L.out+1})).sort((a,b)=>a.a0-b.a0);
  let a=big.length?big[big.length-1].a1-360:0;
  for(const L of big){if(L.a0>a)arc(RF,a,L.a0);const s0=deg(L.a0),s1=deg(L.a1);
    line(Math.sin(s0)*RF,Math.cos(s0)*RF,Math.sin(s0)*L.o,Math.cos(s0)*L.o);arc(L.o,L.a0,L.a1);line(Math.sin(s1)*L.o,Math.cos(s1)*L.o,Math.sin(s1)*RF,Math.cos(s1)*RF);a=L.a1;}
  arc(RF,a,(big.length?big[0].a0:0)+360);
  const wood=std('#9a6a43',{roughness:.85}),mx=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const pm=new THREE.InstancedMesh(box(.2,1.3,.2),wood,posts.length);posts.forEach((p,i)=>{mx.compose(v.set(p[0],p[1]+.6,p[2]),q.identity(),sc.set(1,1,1));pm.setMatrixAt(i,mx);});
  const rm=new THREE.InstancedMesh(box(1,.12,.07),wood,rails.length*2);
  rails.forEach(([a,b],i)=>{const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)+.1;q.setFromAxisAngle(up,Math.atan2(-dz,dx));
    for(const k of [0,1]){mx.compose(v.set((a[0]+b[0])/2,(a[1]+b[1])/2+(k?1.05:.55),(a[2]+b[2])/2),q,sc.set(L,1,1));rm.setMatrixAt(i*2+k,mx);}});
  for(const m of [pm,rm]){m.instanceMatrix.needsUpdate=true;m.castShadow=m.receiveShadow=false;m.computeBoundingSphere();scene.add(m);}
  // a big sign for each region, on the fence where you see it from across the canal (not where an open place is)
  const stripe=canvasTex(256,32,x=>{for(let i=-2;i<12;i++){x.fillStyle=i%2?'#222':'#ffcf3a';x.beginPath();x.moveTo(i*28,32);x.lineTo(i*28+20,0);x.lineTo(i*28+34,0);x.lineTo(i*28+14,32);x.fill();}});
  const stM=new THREE.MeshStandardMaterial({map:stripe,roughness:.6});
  for(const g of REGIONS){let sa=g.ang;for(let t=0;t<40&&openLand(Math.sin(deg(sa))*RF,Math.cos(deg(sa))*RF,8);t++)sa+=(t%2?-1:1)*t*2.5;
    const r=RF+1.2,x=Math.sin(deg(sa))*r,z=Math.cos(deg(sa))*r,s=new THREE.Group();s.position.set(x,groundH(x,z),z);s.rotation.y=deg(sa)+Math.PI;scene.add(s);
    for(const sx of [-1.6,1.6])M(cyl(.09,.11,3.6,8),wood,sx,1.8,0,s,false,false);
    M(box(4,1.7,.12),std('#fff8ef',{roughness:.6}),0,2.7,0,s,false,false);
    M(new THREE.PlaneGeometry(4,.32),stM,0,3.7,.07,s,false,false);
    // both lines on one small picture (graphics memory on phones)
    const t=canvasTex(512,216,(x,w,h)=>{x.fillStyle='#fff8ef';x.fillRect(0,0,w,h);x.textAlign='center';x.textBaseline='middle';
      x.font='700 58px system-ui,-apple-system,sans-serif';x.fillStyle='#ff4d8d';x.fillText('🔒 '+zLabel(g),w/2,62,w-16);
      x.font='700 52px system-ui,-apple-system,sans-serif';x.fillStyle='#7a4b16';x.fillText('🚧 Coming soon!',w/2,158,w-16);});
    M(new THREE.PlaneGeometry(3.9,1.65),new THREE.MeshStandardMaterial({map:t,roughness:.6}),0,2.7,.07,s,false,false);}}

/* ---------- a little note when you swim or walk up to a blocked-off bit ---------- */
let wNoteT=0;
onTick.push(()=>{if(!started||performance.now()<wNoteT)return;const p=player.pos,d=Math.hypot(p.x,p.z);if(d<CANAL.outR-3)return;
  const L=BANK_LAND.find(L=>{const a=bankAng(p.x,p.z);return a>=L.a0&&a<=L.a1;});
  // swimming up to a locked shore, or walking to the back of an open place's land
  if(L&&d<L.out-1.2)return;
  wNoteT=performance.now()+9000;toast(`🚧 ${zLabel(regionAt(bankAng(p.x,p.z)))} is blocked off for now. Coming soon!`);});

/* ---------- on the map ---------- */
MAPW=WORLD.out+4;{const t=WORLD.out+4,i=R+36;MAPZ=[1,t/i,t/i*1.6,t/i*2.4];MAPZ0=t/i;}mv.z=MAPZ[1];mapLay=null;mapZoom(1);
let wHatch=null;
// drawn under everything else (26-map.js drawWorld): each region's land with stripes over it, and the lake
function worldMap(x,w2s,k){const [cx,cy]=w2s(0,0),ang=a=>{const [px,py]=w2s(Math.sin(deg(a)),Math.cos(deg(a)));return Math.atan2(py-cy,px-cx);};
  if(!wHatch){const c=document.createElement('canvas');c.width=c.height=16;const h=c.getContext('2d');h.strokeStyle='rgba(255,255,255,.38)';h.lineWidth=3;
    for(const o of [-16,0,16]){h.beginPath();h.moveTo(o,16);h.lineTo(o+16,0);h.stroke();}wHatch=x.createPattern(c,'repeat');}
  for(const g of REGIONS){x.beginPath();x.arc(cx,cy,WORLD.out*k,ang(g.ang-g.half),ang(g.ang+g.half),true);x.arc(cx,cy,WORLD.in*k,ang(g.ang+g.half),ang(g.ang-g.half),false);x.closePath();
    x.fillStyle=g.col;x.fill();x.fillStyle=wHatch;x.fill();}
  {const [lx,ly]=w2s(LAKE.x,LAKE.z);x.beginPath();x.arc(lx,ly,LAKE.r*k,0,Math.PI*2);x.fillStyle='#5cc3e0';x.fill();}
  // the mountains round the edge
  x.beginPath();x.arc(cx,cy,(WORLD.out-8)*k,0,Math.PI*2);x.lineWidth=Math.max(2,14*k);x.strokeStyle='rgba(140,134,128,.75)';x.stroke();
  // the fence
  x.beginPath();x.arc(cx,cy,(WORLD.in+1.4)*k,0,Math.PI*2);x.lineWidth=Math.max(1,.5*k);x.setLineDash([4,3]);x.strokeStyle='#9a6a43';x.stroke();x.setLineDash([]);}
// names on the big map (26-map.js drawMap)
function worldMapTags(x,S,ts){ts=Math.max(1,ts);x.save();x.font=`700 ${Math.round(S*.028*ts)}px system-ui,-apple-system,sans-serif`;x.textAlign='center';x.textBaseline='middle';
  for(const g of REGIONS){const [px,py]=mapW2s(g.x,g.z,true),t='🔒 '+zLabel(g),w=x.measureText(t).width+S*.03,h=S*.044*ts;
    x.fillStyle='rgba(255,255,255,.88)';x.beginPath();x.roundRect?x.roundRect(px-w/2,py-h/2,w,h,h/2):x.rect(px-w/2,py-h/2,w,h);x.fill();
    x.fillStyle='#6b5a7a';x.fillText(t,px,py+1);x.font=`600 ${Math.round(S*.022*ts)}px system-ui,-apple-system,sans-serif`;x.fillText('Coming soon',px,py+h*.95);
    x.font=`700 ${Math.round(S*.028*ts)}px system-ui,-apple-system,sans-serif`;}
  x.restore();}
// a tap on the map that isn't on a place: is it on a blocked-off region?
function worldMapTap(sx,sy){const k=mapK(),S=mapCv.width,wx=(sx-S/2)/k,wz=(sy-S/2)/k,d=Math.hypot(wx,wz);
  if(d<WORLD.in||d>WORLD.out+4||openLand(wx,wz))return false;toast(`🚧 ${zLabel(regionAt(bankAng(wx,wz)))} is blocked off for now. Coming soon!`);return true;}
Object.assign(window.__game,{WORLD,REGIONS,worldH,groundH,WFENCE,regionAt,BANK_LAND,openLandAt:openLand});
