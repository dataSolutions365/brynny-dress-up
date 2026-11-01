/* ===== Safari Zoo (the savanna, fence and trees; the zebras, giraffes and rhinos live in 24d-barn.js) ===== */
// local layout: +z points back toward Halloween Hollow (the gate)
{const z=Z.zoo,g=z.g;
 const grassT=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#e3c77a';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){const c=Math.random();x.fillStyle=c<.35?'rgba(170,140,60,.4)':c<.7?'rgba(255,240,170,.55)':'rgba(140,170,70,.35)';x.save();x.translate(Math.random()*w,Math.random()*h);x.rotate(-Math.PI/2+(Math.random()-.5)*.6);x.fillRect(0,0,5+Math.random()*8,1.3);x.restore();}},4);
 patch(z.r,std('#ffffff',{map:grassT,roughness:1}),z.x,z.z);
 // a short dirt path from Halloween Hollow to the gate
 {const [px,pz]=z.toWorld(0,z.r+.6);const pm=std('#ffffff',{map:grassT,roughness:1});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
  const p=M(new THREE.PlaneGeometry(2.2,2.4),pm,px,.013,pz,scene,false,true);p.rotation.x=-Math.PI/2;p.rotation.z=z.rot;}
 const wood=std('#9a6a43',{roughness:.85}),bark=std('#7a5236',{roughness:.9}),leafM=phys('#6fa83a',{roughness:.8,sheen:.6,sheenColor:new THREE.Color('#d8ffb0')});
 z.fence=5.55;ringFence(z,z.fence,.32,std('#c8a06a',{roughness:.85}),std('#5a8a3a',{roughness:.6}),'🦒 Safari Zoo','#5a8a3a');
 // flat-topped acacia trees, the giraffes' favorite snack
 const acacia=(lx,lz,s)=>{const tg=new THREE.Group();tg.position.set(lx,0,lz);tg.scale.setScalar(s);g.add(tg);
   M(cyl(.12,.2,2.6,10),bark,0,1.3,0,tg);for(const [a,l] of [[.6,1.1],[-.7,1],[2.4,.9]]){const b=M(cyl(.05,.08,l,8),bark,Math.sin(a)*.35,2.5,Math.cos(a)*.35,tg);b.rotation.set(Math.cos(a)*.7,0,-Math.sin(a)*.7);}
   for(const [x,y,w,r] of [[0,3,0,1.4],[.8,2.85,.3,.9],[-.8,2.9,-.2,1],[.1,2.95,-.8,.9],[-.2,2.9,.8,.9]]){const c=M(sph(r,16,10),leafM,x,y,w,tg);c.scale.y=.32;}
   z.ob(lx,lz,.3*s);};
 acacia(-2.9,-2.5,1.15);acacia(3.4,-1.4,.9);
 // big smooth rocks
 const rockM=std('#b9ab9a',{roughness:.95});for(const [x,w,s] of [[1.4,-3.9,.7],[2.1,-3.5,.45],[.9,-3.4,.35]]){const r=M(new THREE.IcosahedronGeometry(s,1),rockM,x,s*.4,w,g);r.scale.y=.7;}z.ob(1.5,-3.7,.9);
 // watering hole
 {const wm=phys('#5fc6e8',{roughness:.05,clearcoat:1});patch(1.15,wm,...z.toWorld(-2.4,1.6),.03);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;M(sph(.16,8,6),rockM,-2.4+Math.sin(a)*1.3,.04,1.6+Math.cos(a)*1.3,g,false,false).scale.y=.5;}}
 // hay feeder on a post
 {const fg=new THREE.Group();fg.position.set(3,0,1.6);g.add(fg);M(cyl(.06,.06,1.4,8),wood,0,.7,0,fg);M(box(.8,.35,.5),wood,0,1.4,0,fg);
  M(box(.7,.25,.4),std('#f2cf63',{roughness:1}),0,1.6,0,fg);z.ob(3,1.6,.45);}
 // info board by the gate
 {const bg=new THREE.Group();const [x,w]=z.toWorld(-2.2,z.r-.9);bg.position.set(x,0,w);bg.rotation.y=z.rot;scene.add(bg);
  for(const s of [-1,1])M(cyl(.05,.05,1.6,8),wood,s*.6,.8,0,bg);M(box(1.45,.9,.08),wood,0,1.3,0,bg);
  const t=canvasTex(512,320,(c,W,H)=>{c.fillStyle='#fff8ec';c.fillRect(0,0,W,H);c.fillStyle='#5a8a3a';c.font='700 54px Fredoka, sans-serif';c.textAlign='center';c.fillText('Safari Zoo',W/2,70);
    c.font='600 34px Fredoka, sans-serif';c.fillStyle='#3b2357';c.fillText('🦓 Zebras  🦒 Giraffes',W/2,150);c.fillText('🦏 Rhinos',W/2,200);c.font='500 28px Fredoka, sans-serif';c.fillText('Walk up to an animal to meet it!',W/2,270);});
  for(const s of [1,-1]){const p=M(new THREE.PlaneGeometry(1.35,.82),new THREE.MeshStandardMaterial({map:t,roughness:.7}),0,1.3,s*.045,bg,false,false);if(s<0)p.rotation.y=Math.PI;}
  obs.push({x,z:w,r:.4});}
 // the animals keep away from these (trees, rocks, water, feeder)
 z.avoid=[[-2.9,-2.5,.5],[3.4,-1.4,.45],[1.5,-3.7,1],[-2.4,1.6,1.3],[3,1.6,.5]];}
