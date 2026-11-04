/* ===== ❄️ Polar Ice: a snowy, icy corner of town between the Beach path and the Car Garage =====
   This file builds the place: deep snow with drifts all round the edge (the way in is at the front), a frozen pond to ice skate on,
   a frozen lake with two fishing holes, a flat spot at the back to build an igloo, blue ice rocks, snowy pine trees and falling snow.
   The polar animals that live here, ice skating, ice fishing, the igloo and the 🚨 Polar escape are in 24m-arctic.js and 24m2-arctic-escape.js.
   Local layout (z.toLocal): +z points to the plaza (the way in), the igloo spot is at the back (-z).
   ICE says where everything is (in the place's own directions), so the other files and the animals can keep clear of it. */
const ICE={
  rink:{x:-4.1,z:.9,rx:2.75,rz:2.3},// the frozen pond you skate on (an oval)
  lake:{x:4.3,z:-1.1,r:2.4,holes:[[3.55,-.25],[5.05,-1.95]]},// the frozen lake with the fishing holes
  igloo:{x:0,z:-5.3,r:1.75},// where you build the igloo
  fence:8.3,// the snow drifts go round at this distance
  avoid:[]};// [x,z,r] the animals walk round (filled in below)
{const z=Z.arctic,g=z.g;
 // deep snow, a bit sparkly, with soft blue shadows
 const snowT=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#f4f8fc';x.fillRect(0,0,w,h);
   for(let i=0;i<2600;i++){const c=Math.random();x.fillStyle=c<.45?'rgba(200,215,235,.45)':c<.85?'rgba(255,255,255,.9)':'rgba(170,195,225,.35)';const s=1+Math.random()*3;x.beginPath();x.arc(Math.random()*w,Math.random()*h,s,0,Math.PI*2);x.fill();}},4);
 const snowM=std('#ffffff',{map:snowT,roughness:.92});
 patch(z.r+.7,snowM,z.x,z.z,.024);
 // the white snow carries on a little way out into the grass in soft, uneven blobs, so it doesn't stop in a hard circle
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.2,[x,w]=z.toWorld(Math.sin(a)*(z.r+.5),Math.cos(a)*(z.r+.5));if(Math.abs(Math.sin(a/2))<.12)continue;patch(.9+((i*7)%4)*.25,snowM,x,w,.023);}
 const drift=std('#f7fafd',{roughness:.95}),driftShade=std('#e6eef7',{roughness:.95});
 // snow drifts round the edge, with a gap at the front for the way in
 {const FR=ICE.fence,N=36;for(let i=0;i<N;i++){const a=i/N*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.42)continue;
   const s=.55+((i*13)%5)*.09,x=Math.sin(a)*FR,w=Math.cos(a)*FR,m=M(sph(s,14,10),i%3?drift:driftShade,x,0,w,g);m.scale.set(1.5,.55,1.1);m.rotation.y=a+Math.PI/2;z.ob(x,w,s*.75);}}
 // ⛸️ the frozen pond: smooth, glassy pale-blue ice with a snowy bank round it (open on the side facing the middle)
 {const R0=ICE.rink,iceT=canvasTex(256,256,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);gr.addColorStop(0,'#dff3fb');gr.addColorStop(1,'#b6dcef');x.fillStyle=gr;x.fillRect(0,0,w,h);
     x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.2;for(let i=0;i<70;i++){x.beginPath();const cx=Math.random()*w,cy=Math.random()*h,r=20+Math.random()*60,a=Math.random()*6;x.arc(cx,cy,r,a,a+.6+Math.random());x.stroke();}// skate marks
     x.strokeStyle='rgba(120,170,200,.35)';x.lineWidth=.8;for(let i=0;i<10;i++){x.beginPath();let X=Math.random()*w,Y=Math.random()*h;x.moveTo(X,Y);for(let k=0;k<4;k++){X+=(Math.random()-.5)*60;Y+=(Math.random()-.5)*60;x.lineTo(X,Y);}x.stroke();}});// little cracks
   const iceM=phys('#ffffff',{map:iceT,roughness:.08,clearcoat:1,clearcoatRoughness:.05,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
   const rk=M(new THREE.CircleGeometry(1,64),iceM,R0.x,.032,R0.z,g,false,true);rk.rotation.x=-Math.PI/2;rk.scale.set(R0.rx,R0.rz,1);ICE.rinkMesh=rk;
   const N=30;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,ox=Math.sin(a),oz=Math.cos(a);if(ox>.55)continue;// the way onto the ice faces the middle (+x)
     const x=R0.x+ox*(R0.rx+.35),w=R0.z+oz*(R0.rz+.35),m=M(sph(.32+((i*5)%3)*.06,10,8),drift,x,0,w,g);m.scale.set(1.3,.6,1);m.rotation.y=Math.atan2(ox,oz)+Math.PI/2;}
   // a little wooden bench to sit and lace up, and a sign
   const wood=std('#8a5a36',{roughness:.85}),bg=new THREE.Group();bg.position.set(R0.x-.4,0,R0.z+R0.rz+.95);g.add(bg);
   M(box(1.3,.08,.38),wood,0,.45,0,bg);for(const s of [-1,1])M(box(.08,.45,.34),wood,s*.55,.22,0,bg);M(box(1.3,.3,.06),wood,0,.72,-.17,bg);
   M(box(1.25,.06,.3),std('#ffffff',{roughness:.95}),0,.52,0,bg,false,false);z.ob(R0.x-.4,R0.z+R0.rz+.95,.55);
   const sg=new THREE.Group();sg.position.set(R0.x+1.6,0,R0.z+R0.rz+.6);g.add(sg);M(cyl(.05,.05,1.5,8),wood,0,.75,0,sg);
   const t=canvasTex(256,96,(c,W,H)=>{c.fillStyle='#f4fbff';c.fillRect(0,0,W,H);c.fillStyle='#2f6a9a';c.font='700 40px Fredoka, sans-serif';c.textAlign='center';c.fillText('⛸️ Ice Rink',W/2,62);});
   M(box(1.1,.42,.05),wood,0,1.4,0,sg);for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(1,.36),new THREE.MeshStandardMaterial({map:t,roughness:.7}),0,1.4,s*.03,sg,false,false);if(s<0)p.rotation.y=Math.PI;}
   z.ob(R0.x+1.6,R0.z+R0.rz+.6,.15);}
 // 🎣 the frozen lake: darker, snow-dusted ice with two round holes cut in it, a stool and a bucket by each
 {const L=ICE.lake,lakeT=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#a9cde0';x.fillRect(0,0,w,h);
     for(let i=0;i<500;i++){x.fillStyle=`rgba(255,255,255,${.15+Math.random()*.4})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,2+Math.random()*9,0,Math.PI*2);x.fill();}
     x.strokeStyle='rgba(70,120,150,.35)';x.lineWidth=1;for(let i=0;i<12;i++){x.beginPath();let X=Math.random()*w,Y=Math.random()*h;x.moveTo(X,Y);for(let k=0;k<5;k++){X+=(Math.random()-.5)*50;Y+=(Math.random()-.5)*50;x.lineTo(X,Y);}x.stroke();}});
   const lm=phys('#ffffff',{map:lakeT,roughness:.2,clearcoat:.8,clearcoatRoughness:.2,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
   const lk=M(new THREE.CircleGeometry(L.r,48),lm,L.x,.031,L.z,g,false,true);lk.rotation.x=-Math.PI/2;
   const holeM=phys('#0d2c3e',{roughness:.05,clearcoat:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),chunk=phys('#d8eef8',{roughness:.15,clearcoat:1,transparent:true,opacity:.92});
   const wood=std('#7a4f2e',{roughness:.85}),pail=std('#5a7d96',{roughness:.5,metalness:.4});
   ICE.holeWater=[];
   L.holes.forEach(([hx,hz],i)=>{const hm=M(new THREE.CircleGeometry(.36,28),holeM,hx,.036,hz,g,false,false);hm.rotation.x=-Math.PI/2;ICE.holeWater.push(hm);
     for(let k=0;k<9;k++){const a=k/9*Math.PI*2+i,c=M(new THREE.IcosahedronGeometry(.07+((k*3)%4)*.02,0),chunk,hx+Math.sin(a)*.42,.05,hz+Math.cos(a)*.42,g,false,false);c.rotation.set(a,a*2,0);}
     // a wooden stool and a bucket for your catch, on the side away from the middle of the lake
     const ax=hx-L.x,az=hz-L.z,ad=Math.hypot(ax,az)||1,sx=hx+ax/ad*.85,sz=hz+az/ad*.85;
     const st=new THREE.Group();st.position.set(sx,0,sz);g.add(st);M(cyl(.2,.2,.06,14),wood,0,.36,0,st);for(let k=0;k<3;k++){const a=k/3*Math.PI*2,l=M(cyl(.025,.03,.36,6),wood,Math.sin(a)*.13,.18,Math.cos(a)*.13,st);l.rotation.set(Math.cos(a)*.2,0,-Math.sin(a)*.2);}
     const b=M(cyl(.14,.11,.24,14),pail,sx+(az/ad)*.45,.12,sz-(ax/ad)*.45,g);ICE.holeSeat=ICE.holeSeat||[];ICE.holeSeat.push([sx,sz]);});
   // a little rack of fishing rods by the lake
   const rg=new THREE.Group();rg.position.set(L.x+2.3,0,L.z+1.7);rg.rotation.y=-.6;g.add(rg);for(const s of [-1,1])M(cyl(.04,.04,1.1,6),wood,s*.45,.55,0,rg);M(box(1,.06,.06),wood,0,1.05,0,rg);
   for(let i=0;i<3;i++){const r=M(cyl(.012,.02,1.2,6),std('#3b3b40',{roughness:.4}),-.3+i*.3,.55,.05,rg);r.rotation.z=.12;}z.ob(L.x+2.3,L.z+1.7,.4);
   const sg=new THREE.Group();sg.position.set(L.x-.6,0,L.z+L.r+.75);g.add(sg);M(cyl(.05,.05,1.5,8),wood,0,.75,0,sg);
   const t=canvasTex(256,96,(c,W,H)=>{c.fillStyle='#f4fbff';c.fillRect(0,0,W,H);c.fillStyle='#2f6a9a';c.font='700 38px Fredoka, sans-serif';c.textAlign='center';c.fillText('🎣 Ice Fishing',W/2,62);});
   M(box(1.1,.42,.05),wood,0,1.4,0,sg);for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(1,.36),new THREE.MeshStandardMaterial({map:t,roughness:.7}),0,1.4,s*.03,sg,false,false);if(s<0)p.rotation.y=Math.PI;}
   z.ob(L.x-.6,L.z+L.r+.75,.15);}
 // 🧱 the igloo spot: a flat circle of packed snow, a pile of snow blocks and a snow saw stuck in the snow
 {const I=ICE.igloo,pm=std('#e9f1f8',{roughness:.85,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
   const c=M(new THREE.CircleGeometry(I.r+.25,40),pm,I.x,.031,I.z,g,false,true);c.rotation.x=-Math.PI/2;
   ICE.blockM=std('#f6f9fc',{roughness:.8});
   const pile=new THREE.Group();pile.position.set(I.x+I.r+1.1,0,I.z+.6);g.add(pile);ICE.pile=pile;
   for(let i=0;i<7;i++){const b=M(box(.5,.24,.3),ICE.blockM,(i%3-1)*.52,.12+Math.floor(i/3)*.25,(i%2)*.06,pile);b.rotation.y=(i%2-.5)*.15;}
   const saw=new THREE.Group();saw.position.set(I.x+I.r+1.1,0,I.z-.5);saw.rotation.set(0,.4,.25);g.add(saw);
   M(box(.06,.55,.012),std('#c9ced6',{metalness:.8,roughness:.3}),0,.3,0,saw);M(box(.08,.16,.05),std('#7a4f2e',{roughness:.8}),0,.62,0,saw);
   z.ob(I.x+I.r+1.1,I.z+.6,.75);}
 // blue ice rocks: chunky, glassy blocks with sharp edges
 {const iceRock=phys('#bfe3f2',{roughness:.12,clearcoat:1,clearcoatRoughness:.1,transmission:0,transparent:true,opacity:.93}),iceRock2=phys('#9fd0e8',{roughness:.15,clearcoat:1,transparent:true,opacity:.95});
   for(const [x,w,s] of [[-1.3,-3.4,.7],[-.6,-3.1,.42],[6.6,3.3,.75],[-6.7,-3.8,.85],[-6.1,-4.6,.5],[2.4,4.7,.45]]){const r=M(new THREE.IcosahedronGeometry(s,0),s>.6?iceRock:iceRock2,x,s*.45,w,g);r.rotation.set(s*3,s*5,s*2);r.scale.y=.85;z.ob(x,w,s*.85);ICE.avoid.push([x,w,s+.25]);}
   ICE.perch=[6.6,3.3,.75*.85*1.55];}// the top of the big ice rock by the way in (the snowy owl likes to sit up there)
 // snowy pine trees
 {const bark=std('#5a3d28',{roughness:.9}),pine=std('#2e5a3f',{roughness:.85}),cap=std('#fbfdff',{roughness:.9});
   for(const [x,w,s] of [[-7.1,3.4,1],[7.3,1,1.1],[1.9,-7.5,.95],[-3.4,-7.2,1.05],[5.2,-5.6,.9],[-7.4,-1.2,.85]]){const tg=new THREE.Group();tg.position.set(x,0,w);tg.scale.setScalar(s);g.add(tg);
     M(cyl(.12,.16,1,8),bark,0,.5,0,tg);for(let i=0;i<4;i++){const r=1.05-i*.22,y=1.05+i*.6;M(new THREE.ConeGeometry(r,1,12),pine,0,y,0,tg);M(new THREE.ConeGeometry(r*.78,.5,12),cap,0,y+.28,0,tg,false,false);}
     z.ob(x,w,.35*s);ICE.avoid.push([x,w,1.1*s]);}}
 // info board by the way in
 {const wood=std('#7a4f2e',{roughness:.85}),bg=new THREE.Group();const [x,w]=z.toWorld(-2.3,z.r-1);bg.position.set(x,0,w);bg.rotation.y=z.rot;scene.add(bg);
  for(const s of [-1,1])M(cyl(.05,.05,1.6,8),wood,s*.6,.8,0,bg);M(box(1.45,.9,.08),wood,0,1.3,0,bg);M(box(1.6,.1,.3),std('#ffffff',{roughness:.95}),0,1.8,0,bg,false,false);
  const t=canvasTex(512,320,(c,W,H)=>{c.fillStyle='#f4fbff';c.fillRect(0,0,W,H);c.fillStyle='#2f6a9a';c.font='700 54px Fredoka, sans-serif';c.textAlign='center';c.fillText('Polar Ice',W/2,70);
    c.font='600 30px Fredoka, sans-serif';c.fillStyle='#3b2357';c.fillText('🐻‍❄️ Polar bears  🦭 Walrus  🐧 Penguins',W/2,140);c.fillText('🦊 Arctic fox  🐺 Arctic wolf  🦉 Snowy owl',W/2,190);
    c.font='500 27px Fredoka, sans-serif';c.fillText('⛸️ Skate · 🎣 Fish · 🧱 Build an igloo',W/2,262);});
  for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(1.35,.82),new THREE.MeshStandardMaterial({map:t,roughness:.7}),0,1.3,s*.045,bg,false,false);if(s<0)p.rotation.y=Math.PI;}
  obs.push({x,z:w,r:.4});ICE.avoid.push([-2.3,z.r-1,.7]);}
 signpost(z);ICE.avoid.push([2.2,z.r-.6,.5]);
 // ❄️ snow falling gently over the whole place
 {const n=LITE?120:260,pos=new Float32Array(n*3),sp=new Float32Array(n);
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*(z.r+1);pos[i*3]=Math.sin(a)*r;pos[i*3+1]=Math.random()*7;pos[i*3+2]=Math.cos(a)*r;sp[i]=.5+Math.random()*.6;}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const flake=canvasTex(32,32,(x)=>{const gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);});
  const pts=new THREE.Points(gg,new THREE.PointsMaterial({map:flake,size:4,sizeAttenuation:false,transparent:true,depthWrite:false,color:'#ffffff'}));pts.frustumCulled=false;g.add(pts);
  let tk=0;anims.push((t,dt)=>{if(++tk%2)return;const P=player.pos;if((P.x-z.x)**2+(P.z-z.z)**2>40*40){pts.visible=false;return;}pts.visible=true;
    for(let i=0;i<n;i++){let y=pos[i*3+1]-sp[i]*dt*2;if(y<0)y+=7;pos[i*3+1]=y;pos[i*3]+=Math.sin(t*.7+i)*.004;}gg.attributes.position.needsUpdate=true;});}
 // the animals keep off the ice, the lake, the igloo spot and the snow-block pile
 ICE.avoid.push([ICE.rink.x,ICE.rink.z,Math.max(ICE.rink.rx,ICE.rink.rz)+.45],[ICE.lake.x,ICE.lake.z,ICE.lake.r+.35],[ICE.igloo.x,ICE.igloo.z,ICE.igloo.r+.4],[ICE.igloo.x+ICE.igloo.r+1.1,ICE.igloo.z+.6,.9]);}
// is (x,z) (world) on the skating ice? how far in: 1 at the middle, 0 at the edge, below 0 outside
function onRink(x,zz){const z=Z.arctic,[lx,lz]=z.toLocal(x,zz),R0=ICE.rink;return 1-Math.hypot((lx-R0.x)/R0.rx,(lz-R0.z)/R0.rz);}
