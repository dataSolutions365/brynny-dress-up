/* ---------- island ---------- */
const R=44.5;
M(new THREE.CylinderGeometry(R+1.6,R+3.2,3,96),std('#f1d9a6',{map:TEX.sand,roughness:1}),0,-1.5,0,scene,false,true);
const grass=M(new THREE.CircleGeometry(R,96),groundMat,0,.005,0,scene,false,true);grass.rotation.x=-Math.PI/2;
const waterGeo=new THREE.PlaneGeometry(420,420,100,100);waterGeo.rotateX(-Math.PI/2);
const water=M(waterGeo,phys('#2ab0d4',{roughness:.06,metalness:.05,clearcoat:1,clearcoatRoughness:.05}),0,-.35,0,scene,false,true);
const wpos=waterGeo.attributes.position;const wbase=Float32Array.from(wpos.array);let wTick=0;
anims.push(t=>{if(++wTick%2)return;for(let i=0;i<wpos.count;i++){const x=wbase[i*3],z=wbase[i*3+2];wpos.array[i*3+1]=Math.sin(x*.35+t*1.3)*.07+Math.sin(z*.27+t*1.05)*.07+Math.sin((x+z)*.8+t*2.2)*.02;}wpos.needsUpdate=true;waterGeo.computeVertexNormals();});

function patch(r,mat,x,z,y=.02){const m=M(new THREE.CircleGeometry(r,64),mat,x,y,z,scene,false,true);m.rotation.x=-Math.PI/2;mat.polygonOffset=true;mat.polygonOffsetFactor=-2;mat.polygonOffsetUnits=-2;return m;}

/* clouds */
const CLOUD_MATS=[];
for(let i=0;i<10;i++){const g=new THREE.Group();const cm=std('#ffffff',{roughness:1,emissive:'#ffffff',emissiveIntensity:.25});CLOUD_MATS.push(cm);
  for(let j=0;j<5;j++){const s=M(sph(3+rand()*3,14,10),cm,(j-2)*4+rand()*2,rand()*2,rand()*3,g,false,false);s.scale.y=.6;}
  const a=rand()*Math.PI*2,d=60+rand()*80;g.position.set(Math.sin(a)*d,34+rand()*16,Math.cos(a)*d);scene.add(g);
  const sp=.4+rand()*.5;anims.push((t,dt)=>{g.position.x+=dt*sp;if(g.position.x>160)g.position.x=-160;});}

/* ---------- zones ---------- */
const deg=d=>d*Math.PI/180;
const ZONES=[
  {id:'studio',name:'✨ Sparkle Studio',ang:0,d:0,r:6.5,music:'sparkle-room'},
  {id:'birthday',name:'🎂 Birthday Party',ang:0,d:24,r:8.5,music:'bday-ukulele'},
  {id:'halloween',name:'🎃 Halloween Hollow',ang:60,d:24,r:8.5,music:'halloween-waltz'},
  {id:'christmas',name:'🎄 Christmas Village',ang:120,d:24,r:8.5,music:'winter-days'},
  {id:'beach',name:'🏖️ Beach Day',ang:180,d:34,r:10,music:'sea-waves'},
  {id:'runway',name:'💃 Runway',ang:240,d:24,r:8.5,music:'fashion-walk'},
  {id:'spring',name:'🌷 Spring Garden',ang:300,d:24,r:8.5,music:'spring-birds'},
  {id:'parlor',name:'🐾 Pet Parlor',ang:30,d:36,r:7,music:'clouds'},
  {id:'bakery',name:'🧁 Sweet Bakery',ang:330,d:36,r:7,music:'valentine-day'},
  {id:'agency',name:'⭐ Star Model Agency',ang:270,d:36,r:7.5,music:'fashion-show'},
  {id:'court',name:'🏀 Basketball Court',ang:90,d:36,r:7.5,music:'stadium'},
  {id:'batting',name:'⚾ Batting Cage',ang:210,d:36,r:7.5,music:'stadium-cheer'},
];
const PARK={id:'park',name:'🌳 Sunny Park',music:'city-park'};
for(const z of ZONES){z.x=Math.sin(deg(z.ang))*z.d;z.z=Math.cos(deg(z.ang))*z.d;z.rot=z.d?Math.atan2(-z.x,-z.z):0;
  z.g=new THREE.Group();z.g.position.set(z.x,0,z.z);z.g.rotation.y=z.rot;scene.add(z.g);
  const c=Math.cos(z.rot),s=Math.sin(z.rot);
  z.toLocal=(x,zz)=>{const dx=x-z.x,dz=zz-z.z;return [dx*c-dz*s,dx*s+dz*c];};
  z.toWorld=(lx,lz)=>[z.x+lx*c+lz*s,z.z-lx*s+lz*c];
  z.ob=(lx,lz,r)=>{const [x,w]=z.toWorld(lx,lz);obs.push({x,z:w,r});};}
const Z=Object.fromEntries(ZONES.map(z=>[z.id,z]));
// small things on the ground (like presents) that get bumped, slide and tumble when you walk into them
const PUSH=[];function pushable(z,m,r,h){PUSH.push({z,m,r,h,y0:m.position.y,vx:0,vz:0,vy:0,spin:0,tx:0,tz:0,ry:m.rotation.y});return m;}

/* paths */
const LAMPS=[],lampMat=glow('#fff1c4',1.6);// street lights (seasons.js turns them up at night)
const pathMat=std('#ffffff',{map:TEX.stone,roughness:.85});pathMat.polygonOffset=true;pathMat.polygonOffsetFactor=-1;pathMat.polygonOffsetUnits=-1;
{const ring=M(new THREE.RingGeometry(6.4,7.9,72),pathMat,0,.012,0,scene,false,true);ring.rotation.x=-Math.PI/2;
 for(const z of ZONES){if(!z.d)continue;const g=new THREE.Group();g.rotation.y=Math.atan2(z.x,z.z);scene.add(g);
  const len=z.d-z.r*.5-7;const p=M(new THREE.PlaneGeometry(2.6,len),pathMat,0,.012,7+len/2,g,false,true);p.rotation.x=-Math.PI/2;
  for(const s of [-1,1]){const lx=s*1.9,lz=7+len*.55;const post=M(cyl(.06,.08,2.6,10),std('#3b2357',{roughness:.4,metalness:.6}),lx,1.3,lz,g);
    LAMPS.push(M(sph(.2,16,12),lampMat,lx,2.7,lz,g,false,false));const wp=new THREE.Vector3(lx,0,lz).applyAxisAngle(new THREE.Vector3(0,1,0),g.rotation.y);obs.push({x:wp.x,z:wp.z,r:.2});}}}

/* signposts */
function signpost(z){const g=new THREE.Group();const [x,w]=z.toWorld(2.2,z.r-.6);g.position.set(x,0,w);g.rotation.y=z.rot;scene.add(g);
  const wood=std('#9a6a43',{roughness:.8});M(cyl(.07,.08,2.2,10),wood,0,1.1,0,g);M(box(2.6,.8,.1),wood,0,2.1,0,g);
  const lt=labelTex(z.name.replace(/^\S+\s/,''),{size:58});
  for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(2.45,.65),new THREE.MeshStandardMaterial({map:lt,roughness:.6}),0,2.1,s*.056,g,false,false);if(s<0)p.rotation.y=Math.PI;}
  obs.push({x,z:w,r:.25});}

