/* ===== Runway ===== */
{const z=Z.runway,g=z.g;patch(8.5,phys('#2a1f3d',{roughness:.25,clearcoat:.8}),z.x,z.z);
 const RW={w:1.6,z0:-5,z1:6.2,h:.35};z.rw=RW;
 M(box(RW.w*2,RW.h,RW.z1-RW.z0),phys('#ffffff',{roughness:.2,clearcoat:1}),0,RW.h/2,(RW.z0+RW.z1)/2,g);
 M(box(RW.w*2-.3,.02,RW.z1-RW.z0-.2),phys('#ff4d8d',{roughness:.9,sheen:1,sheenColor:new THREE.Color('#ffb3d1')}),0,RW.h+.01,(RW.z0+RW.z1)/2,g,false,true);
 const strips=[];for(const s of [-1,1]){for(let k=0;k<14;k++){strips.push(M(sph(.06,8,6),glow('#ffffff',2),s*(RW.w-.05),RW.h+.03,RW.z0+.4+k*.8,g,false,false));}}
 anims.push(t=>strips.forEach((b,i)=>b.scale.setScalar(.7+.5*Math.max(0,Math.sin(t*6-i*.5)))));
 // backdrop
 const bd=new THREE.Group();bd.position.set(0,0,RW.z0-.4);g.add(bd);
 M(box(6.5,4,.3),phys('#3b2357',{roughness:.4,clearcoat:.5}),0,2,0,bd);
 const sign=M(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:labelTex('RUNWAY',{bg:null,fg:'#ffffff',size:96}),transparent:true,toneMapped:false}),0,2.9,.16,bd,false,false);
 const arch=M(new THREE.TorusGeometry(1.5,.08,10,48,Math.PI),glow('#ff8fc8',2),0,.35,.17,bd,false,false);arch.scale.y=1.2;
 M(new THREE.PlaneGeometry(2.8,1.8),phys('#ff6fae',{roughness:.9,sheen:1}),0,1.25,.16,bd,false,false);
 for(let i=-2;i<=2;i++)z.ob(i*1.3,RW.z0-.4,.75);
 // spotlights
 for(const s of [-1,1]){const pg=new THREE.Group();pg.position.set(s*3.4,0,3);g.add(pg);M(cyl(.07,.1,4.5,10),std('#222',{metalness:.8,roughness:.3}),0,2.25,0,pg);
   const head=M(cyl(.18,.28,.45,16),std('#111',{metalness:.8,roughness:.3}),0,4.5,0,pg);head.rotation.z=s*.9;
   const beam=M(new THREE.ConeGeometry(1.2,5,24,1,true),new THREE.MeshBasicMaterial({color:'#ffd6f0',transparent:true,opacity:.09,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}),-s*1.7,2.4,0,pg,false,false);beam.rotation.z=-s*.6;
   const spot=new THREE.SpotLight('#ffe0f2',60,14,.45,.6,1.5);spot.position.set(s*3.4,4.5,3);spot.target.position.set(0,0,1);g.add(spot,spot.target);z.ob(s*3.4,3,.2);
   const ph=s;anims.push(t=>{spot.target.position.z=1+Math.sin(t*.7*ph)*3;});}
 // audience seats
 const seat=phys('#8e6cff',{roughness:.5,sheen:1});for(const s of [-1,1])for(let k=0;k<5;k++){const lx=s*2.6,lz=-3+k*1.6;const c=M(box(.6,.45,.55),seat,lx,.23,lz,g);M(box(.6,.6,.1),seat,lx+s*.25,.6,lz,g).rotation.y=Math.PI/2;z.ob(lx,lz,.4);}
 const cam=new THREE.Group();cam.position.set(0,0,7.5);g.add(cam);
 signpost(z);}

