/* ===== Birthday ===== */
{const z=Z.birthday,g=z.g;patch(8.5,std('#ffffff',{map:TEX.party,roughness:.6}),z.x,z.z);
 const tiers=[[2,.9,'#fff4fa'],[1.5,.8,'#ffb3d1'],[1,.7,'#fff4fa']];let y=0;
 const cake=new THREE.Group();cake.position.set(0,0,-1);g.add(cake);
 tiers.forEach(([r,h,c],i)=>{M(cyl(r,r,h,48),phys(c,{roughness:.45,clearcoat:.4}),0,y+h/2,0,cake);
   const drip=M(new THREE.TorusGeometry(r,.09,10,64),phys(i%2?'#fff4fa':'#ff8fc8',{roughness:.3,clearcoat:.8}),0,y+h,0,cake);drip.rotation.x=Math.PI/2;
   for(let k=0;k<14;k++){const a=k/14*Math.PI*2;M(sph(.1,10,8),phys(['#ff3b6b','#4fb6ff','#ffd23f','#7ee081'][k%4],{roughness:.3,clearcoat:1}),Math.sin(a)*r,y+h*.45,Math.cos(a)*r,cake,false,false);}
   y+=h;});
 const flames=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2,x=Math.sin(a)*.55,w=Math.cos(a)*.55;M(cyl(.05,.05,.45,10),phys(['#ff6fae','#4fb6ff','#ffd23f','#7ee081','#b388ff'][k],{roughness:.4}),x,y+.22,w,cake);
   const f=M(sph(.07,10,8),glow('#ffcc55',3),x,y+.52,w,cake,false,false);f.scale.y=1.7;flames.push(f);}
 const cl=new THREE.PointLight('#ffb060',25,10,2);cl.position.set(0,y+1,0);cake.add(cl);
 anims.push(t=>{flames.forEach((f,i)=>f.scale.set(1+.15*Math.sin(t*20+i),1.7+.3*Math.sin(t*15+i*2),1));cl.intensity=22+4*Math.sin(t*17);});
 z.ob(0,-1,2.2);
 // balloons
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rr=5.5+rand()*2,lx=Math.sin(a)*rr,lz=Math.cos(a)*rr;if(lz>3&&Math.abs(lx)<2.2)continue;
   const bg=new THREE.Group();bg.position.set(lx,0,lz);g.add(bg);const c=pick(['#ff3b6b','#ff6fae','#4fb6ff','#ffd23f','#7ee081','#b388ff','#ff8a1f']);
   const b=M(sph(.38,24,18),phys(c,{roughness:.15,clearcoat:1,clearcoatRoughness:.05,sheen:.3}),0,3,0,bg);b.scale.y=1.18;
   M(cyl(.004,.004,2.6,4),std('#ffffff'),0,1.4,0,bg,false,false);M(new THREE.ConeGeometry(.06,.08,8),phys(c),0,2.53,0,bg,false,false).rotation.x=Math.PI;
   const ph=rand()*6;anims.push(t=>{bg.position.y=Math.sin(t*1.2+ph)*.15;bg.rotation.z=Math.sin(t*.8+ph)*.06;});}
 // presents
 for(let i=0;i<7;i++){const a=deg(-70+i*23),lx=Math.sin(a)*3.4,lz=-1+Math.cos(a)*3.4-.2;const s=.45+rand()*.4;const c=pick(['#ff6fae','#4fb6ff','#ffd23f','#7ee081','#b388ff']),rc=pick(['#ffffff','#ff3b6b','#ffd23f']);
   const pg=new THREE.Group();pg.position.set(lx,0,lz);pg.rotation.y=rand()*3;g.add(pg);pushable(z,pg,s*.62,s+.1);
   M(box(s,s,s),phys(c,{roughness:.35,clearcoat:.6}),0,s/2,0,pg);M(box(s+.01,s+.01,s*.16),phys(rc,{roughness:.3,sheen:1}),0,s/2,0,pg);M(box(s*.16,s+.01,s+.01),phys(rc,{roughness:.3,sheen:1}),0,s/2,0,pg);
   const bw=M(new THREE.TorusKnotGeometry(s*.12,s*.03,32,6,2,3),phys(rc,{roughness:.3}),0,s+.05,0,pg);bw.scale.y=.6;}
 // bunting ring
 const flagC=['#ff6fae','#ffd23f','#4fb6ff','#7ee081','#b388ff'];
 for(let i=0;i<5;i++){const a=deg(36+i*72),lx=Math.sin(a)*8,lz=Math.cos(a)*8;M(cyl(.06,.07,3.2,10),std('#ffffff',{roughness:.4}),lx,1.6,lz,g);z.ob(lx,lz,.2);
   const a2=deg(36+(i+1)*72);if(i===4)continue;for(let k=1;k<10;k++){const t=k/10,aa=a+(a2-a)*t;const f=M(new THREE.ConeGeometry(.16,.32,3),phys(flagC[k%5],{side:THREE.DoubleSide,roughness:.7}),Math.sin(aa)*8,3.1-Math.sin(t*Math.PI)*.5,Math.cos(aa)*8,g,false,false);f.rotation.x=Math.PI;f.scale.z=.15;f.rotation.y=aa;}}
 signpost(z);}

