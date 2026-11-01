/* ===== Spring garden ===== */
{const z=Z.spring,g=z.g;patch(8.5,std('#d4ffb8',{map:TEX.grass,roughness:.95}),z.x,z.z);
 // fountain
 const stoneM=phys('#f2ece6',{roughness:.35,clearcoat:.4});
 const rim=M(new THREE.TorusGeometry(2,.22,12,48),stoneM,0,.45,0,g);rim.rotation.x=Math.PI/2;M(cyl(2,2,.4,48),stoneM,0,.2,0,g);
 const wtr=M(new THREE.CircleGeometry(1.95,48),phys('#56c8f0',{roughness:.03,clearcoat:1,transparent:true,opacity:.85}),0,.42,0,g,false,true);wtr.rotation.x=-Math.PI/2;
 M(cyl(.25,.35,1.6,20),stoneM,0,1.1,0,g);M(cyl(.9,.5,.25,32),stoneM,0,1.95,0,g);M(cyl(.12,.15,.7,16),stoneM,0,2.4,0,g);
 z.ob(0,0,2.3);
 const NP=260,fp=new Float32Array(NP*3),fv=[];for(let i=0;i<NP;i++){fv.push({t:Math.random()*1.2,a:Math.random()*Math.PI*2,s:.6+Math.random()*.6});}
 const fgeo=new THREE.BufferGeometry();fgeo.setAttribute('position',new THREE.BufferAttribute(fp,3));
 g.add(new THREE.Points(fgeo,new THREE.PointsMaterial({color:'#d9f6ff',size:.07,transparent:true,opacity:.85,depthWrite:false})));
 anims.push((t,dt)=>{fv.forEach((p,i)=>{p.t+=dt;if(p.t>1.2){p.t=0;p.a=Math.random()*Math.PI*2;}const r=p.t*p.s*1.1,y=2.75+p.t*3.2-p.t*p.t*4.9;fp[i*3]=Math.sin(p.a)*r;fp[i*3+1]=Math.max(.45,y);fp[i*3+2]=Math.cos(p.a)*r;});fgeo.attributes.position.needsUpdate=true;});
 // flowers (instanced)
 const NF=520;const stem=new THREE.InstancedMesh(cyl(.012,.012,.36,5),std('#3f8a2f'),NF);const head=new THREE.InstancedMesh(sph(.06,10,8),phys('#ffffff',{roughness:.5,sheen:1}),NF);
 const mtx=new THREE.Matrix4(),col=new THREE.Color();let n=0;const fc=['#ff6fae','#ffd23f','#ffffff','#b388ff','#ff3b6b','#ff8a1f','#8fd8ff'];
 while(n<NF){const a=Math.random()*Math.PI*2,r=3.2+Math.random()*5;const lx=Math.sin(a)*r,lz=Math.cos(a)*r;if(lz>0&&Math.abs(lx)<1.7)continue;if(Math.abs(Math.abs(lx)-0)<.01)continue;
   const h=.25+Math.random()*.25;mtx.makeScale(1,h/.36,1).setPosition(lx,h/2,lz);stem.setMatrixAt(n,mtx);mtx.makeScale(1,.7,1).setPosition(lx,h,lz);head.setMatrixAt(n,mtx);head.setColorAt(n,col.set(fc[n%fc.length]));n++;}
 stem.castShadow=head.castShadow=true;g.add(stem,head);
 // hedges and benches
 const hedge=phys('#3e8e3a',{roughness:.85,sheen:.6,sheenColor:new THREE.Color('#c8ffb0')});
 for(let i=0;i<10;i++){const a=deg(18+i*36);if(Math.abs(Math.cos(a))>.94&&Math.cos(a)>0)continue;const lx=Math.sin(a)*8.6,lz=Math.cos(a)*8.6;const h=M(sph(.8,16,12),hedge,lx,.6,lz,g);h.scale.y=.8;z.ob(lx,lz,.75);}
 const wood=std('#b27b4f',{roughness:.7});for(const s of [-1,1]){const bg=new THREE.Group();bg.position.set(s*4,0,-3);bg.rotation.y=-s*2.3;g.add(bg);M(box(1.6,.08,.45),wood,0,.45,0,bg);M(box(1.6,.4,.06),wood,0,.75,-.22,bg);for(const x of [-.7,.7])M(box(.08,.45,.4),std('#555',{metalness:.7,roughness:.4}),x,.22,0,bg);z.ob(s*4,-3,.8);}
 // butterflies
 const wingM=phys('#ffffff',{side:THREE.DoubleSide,roughness:.4,iridescence:1,iridescenceIOR:1.6,sheen:1});
 for(let i=0;i<7;i++){const bg=new THREE.Group();g.add(bg);const c=pick(['#ff8fc8','#ffd23f','#8fd8ff','#b388ff','#ff8a1f']);const wm=wingM.clone();wm.color.set(c);
   const wl=[];for(const s of [-1,1]){const wg=new THREE.Group();bg.add(wg);const w=M(new THREE.CircleGeometry(.1,12),wm,s*.09,0,0,wg,false,false);w.scale.y=.75;wl.push([wg,s]);}
   const ph=rand()*6,r0=3+rand()*4;anims.push(t=>{const a=t*.35+ph;bg.position.set(Math.sin(a)*r0,.8+Math.sin(t*1.7+ph)*.4,Math.cos(a*1.3)*r0);bg.rotation.y=a+Math.PI/2;wl.forEach(([wg,s])=>wg.rotation.y=s*Math.sin(t*18+ph)*.9);});}
 signpost(z);}

