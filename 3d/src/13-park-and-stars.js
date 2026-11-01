/* ---------- park trees ---------- */
{const trunkM=std('#7a5236',{roughness:.9});const leafs=['#3f8f3a','#4fa645','#2f7a34','#5cb04a'].map(c=>phys(c,{roughness:.8,sheen:.6,sheenColor:new THREE.Color('#d8ffb0')}));
 const trees=[];let tries=0;
 while(trees.length<120&&tries++<6000){const a=rand()*Math.PI*2,d=10+Math.sqrt(rand())*(R-11.5);const x=Math.sin(a)*d,w=Math.cos(a)*d;
   if(ZONES.some(z=>Math.hypot(x-z.x,w-z.z)<z.r+2.5))continue;
   if(ZONES.some(z=>{if(!z.d)return false;const t=(x*z.x+w*z.z)/(z.d*z.d);if(t<(z.p0||0)/z.d||t>1)return false;return Math.hypot(x-z.x*t,w-z.z*t)<3.4;}))continue;
   if(trees.some(t=>Math.hypot(t[0]-x,t[1]-w)<3.2))continue;trees.push([x,w]);}
 for(const [x,w] of trees){const s=.8+rand()*.6;const tg=new THREE.Group();tg.position.set(x,0,w);tg.scale.setScalar(s);scene.add(tg);
   M(cyl(.18,.28,2.4,10),trunkM,0,1.2,0,tg);const lm=pick(leafs);
   for(let k=0;k<4;k++){const b=M(new THREE.IcosahedronGeometry(1+rand()*.4,2),lm,(rand()-.5)*1.2,2.8+rand()*1.2,(rand()-.5)*1.2,tg);b.scale.y=.85;}
   obs.push({x,z:w,r:.45*s});}
 // bushes with little flowers on the open grass
 for(let i=0;i<90;i++){const a=rand()*Math.PI*2,d=9+Math.sqrt(rand())*(R-10);const x=Math.sin(a)*d,w=Math.cos(a)*d;if(ZONES.some(z=>Math.hypot(x-z.x,w-z.z)<z.r+1))continue;
   const b=M(sph(.4+rand()*.3,12,10),pick(leafs),x,.2,w);b.scale.y=.7;}}

/* ---------- stars to collect ---------- */
const starShape=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.12:.28;i?starShape.lineTo(Math.sin(a)*r,Math.cos(a)*r):starShape.moveTo(0,r);}
const starGeo=new THREE.ExtrudeGeometry(starShape,{depth:.06,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2});starGeo.center();
const starMat=new THREE.MeshStandardMaterial({color:'#ffd23f',metalness:.9,roughness:.15,emissive:'#ffaa00',emissiveIntensity:.9});
const STARS=[];
{let tries=0;while(STARS.length<24&&tries++<5000){const a=rand()*Math.PI*2,d=3+Math.sqrt(rand())*(R-5);const x=Math.sin(a)*d,w=Math.cos(a)*d;
  if(obs.some(o=>Math.hypot(o.x-x,o.z-w)<o.r+1))continue;if(STARS.some(s=>Math.hypot(s.x-x,s.z-w)<5))continue;
  const high=STARS.length%4===3;const m=M(starGeo,starMat,x,(high?2.3:1.1)+groundAt(x,w),w,scene,true,false);STARS.push({x,z:w,y:m.position.y,m,got:false});}}
anims.push(t=>STARS.forEach((s,i)=>{if(s.got)return;s.m.rotation.y=t*2+i;s.m.position.y=s.y+Math.sin(t*2.5+i)*.12;}));

/* sparkle bursts */
const bursts=[];const sparkTex=canvasTex(64,64,(x)=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,230,160,.9)');gr.addColorStop(1,'rgba(255,200,230,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);});
function burst(pos,color='#ffe27a',n=40,spd=3,size=.28){const p=new Float32Array(n*3),v=[];for(let i=0;i<n;i++){p[i*3]=pos.x;p[i*3+1]=pos.y;p[i*3+2]=pos.z;const d=new THREE.Vector3().randomDirection().multiplyScalar(spd*(.4+Math.random()*.6));d.y=Math.abs(d.y)+1;v.push(d);}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(p,3));const mm=new THREE.PointsMaterial({map:sparkTex,color,size,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const pts=new THREE.Points(gg,mm);scene.add(pts);bursts.push({pts,v,life:1.1});}
function tickBursts(dt){for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.life-=dt;const p=b.pts.geometry.attributes.position;for(let k=0;k<b.v.length;k++){b.v[k].y-=dt*4;p.array[k*3]+=b.v[k].x*dt;p.array[k*3+1]+=b.v[k].y*dt;p.array[k*3+2]+=b.v[k].z*dt;}p.needsUpdate=true;b.pts.material.opacity=Math.max(0,b.life);if(b.life<=0){scene.remove(b.pts);b.pts.geometry.dispose();b.pts.material.dispose();bursts.splice(i,1);}}}

/* ---------- ground height ---------- */
function groundAt(x,z){let h=0;if(x*x+z*z<6.2*6.2)h=.15;
  const r=Z.runway;if(r.rw){const [lx,lz]=r.toLocal(x,z);if(Math.abs(lx)<r.rw.w&&lz>r.rw.z0&&lz<r.rw.z1)h=r.rw.h;}
  const ag=Z.agency;if(ag.rw){const [lx,lz]=ag.toLocal(x,z);if(Math.abs(lx)<ag.rw.w&&lz>ag.rw.z0&&lz<ag.rw.z1)h=ag.rw.h;}
  const b=Z.beach;if(b.dock){const [lx,lz]=b.toLocal(x,z);if(Math.abs(lx-b.dock.lx)<1&&lz<b.dock.lz0+.2&&lz>b.dock.lz1)h=b.dock.h;}
  return h;}
function onDock(x,z){const b=Z.beach;const [lx,lz]=b.toLocal(x,z);return Math.abs(lx-b.dock.lx)<1&&lz<b.dock.lz0+.3&&lz>b.dock.lz1;}

