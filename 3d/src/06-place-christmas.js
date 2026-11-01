/* ===== Christmas ===== */
{const z=Z.christmas,g=z.g;patch(8.5,std('#ffffff',{map:TEX.snow,roughness:.75}),z.x,z.z);
 const tg=new THREE.Group();tg.position.set(0,0,-1.5);g.add(tg);M(cyl(.3,.4,1.2,12),std('#6b4226'),0,.6,0,tg);
 const pine=phys('#1f6b3a',{roughness:.7,sheen:.5,sheenColor:new THREE.Color('#bfffd0')});
 [[2.4,2.2,1.4],[1.9,2,2.6],[1.4,1.8,3.7],[.9,1.5,4.7]].forEach(([r,h,y])=>{M(new THREE.ConeGeometry(r,h,32),pine,0,y,0,tg);});
 const lights=[];const lc=['#ff3b3b','#ffd23f','#4fb6ff','#7ee081','#ff6fae'];
 for(let i=0;i<60;i++){const t=rand(),y=1.2+t*4.1,r=2.4*(1-t)*.98+.15,a=rand()*Math.PI*2;lights.push(M(sph(.07,8,6),glow(lc[i%5],2.5),Math.sin(a)*r,y,Math.cos(a)*r,tg,false,false));}
 anims.push(t=>lights.forEach((l,i)=>l.visible=Math.sin(t*2+i*1.7)>-.6));
 const st=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.18:.42;i?st.lineTo(Math.sin(a)*r,Math.cos(a)*r):st.moveTo(0,r);}
 const star=M(new THREE.ExtrudeGeometry(st,{depth:.1,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2}),new THREE.MeshStandardMaterial({color:'#ffd23f',metalness:.8,roughness:.2,emissive:'#ffb000',emissiveIntensity:1.2}),0,5.7,-.05,tg);
 anims.push(t=>star.rotation.y=t);z.ob(0,-1.5,2.2);
 const tl=new THREE.PointLight('#ffd9a0',25,12,2);tl.position.set(0,3,1.5);tg.add(tl);
 for(let i=0;i<6;i++){const a=deg(150+i*12),r=2.6,s=.5+rand()*.3;const c=pick(['#e0263b','#ffffff','#1f8a4a','#ffd23f']);const pm=M(box(s,s,s),phys(c,{roughness:.35,clearcoat:.6}),Math.sin(a)*r,s/2,-1.5+Math.cos(a)*r*-1,g);pm.rotation.y=rand();pushable(z,pm,s*.62,s);}
 // snowman
 const sg=new THREE.Group();sg.position.set(4,0,1.5);sg.rotation.y=-.6;g.add(sg);const sn=phys('#ffffff',{roughness:.8,sheen:1,sheenColor:new THREE.Color('#dfe9ff')});
 M(sph(.75,24,18),sn,0,.7,0,sg);M(sph(.55,24,18),sn,0,1.75,0,sg);M(sph(.4,24,18),sn,0,2.5,0,sg);
 M(new THREE.ConeGeometry(.07,.4,10),std('#ff7a1a'),0,2.5,.5,sg).rotation.x=Math.PI/2;for(const s of [-1,1])M(sph(.05,8,6),std('#111'),s*.14,2.62,.35,sg);
 const scarf=M(new THREE.TorusGeometry(.38,.09,10,24),phys('#e0263b',{roughness:.9,sheen:1}),0,2.15,0,sg);scarf.rotation.x=Math.PI/2;
 M(cyl(.3,.3,.45,20),std('#1a1a22',{roughness:.5}),0,2.98,0,sg);M(cyl(.45,.45,.04,20),std('#1a1a22'),0,2.76,0,sg);z.ob(4,1.5,.8);
 // cabin
 const cg=new THREE.Group();cg.position.set(-4.5,0,-3);cg.rotation.y=.5;g.add(cg);
 M(box(3,2.2,2.6),phys('#8a5233',{roughness:.85}),0,1.1,0,cg);const rf=M(new THREE.CylinderGeometry(.01,2.1,1.4,4,1),std('#ffffff',{map:TEX.snow}),0,2.9,0,cg);rf.rotation.y=Math.PI/4;rf.scale.set(1.15,1,.95);
 M(new THREE.PlaneGeometry(.6,.6),glow('#ffcf6a',1.3),.7,1.3,1.31,cg,false,false);M(box(.7,1.4,.05),std('#5a3420'),-.6,.7,1.31,cg,false,false);z.ob(-4.5,-3,1.9);
 // candy canes by the entrance
 const cane=phys('#ffffff',{map:TEX.stripes,roughness:.3,clearcoat:1,color:'#ff9aa0'});
 for(const s of [-1,1])for(const lz of [5,7]){const cc=new THREE.Group();cc.position.set(s*1.9,0,lz);g.add(cc);M(cyl(.08,.08,1.6,12),cane,0,.8,0,cc);const hk=M(new THREE.TorusGeometry(.22,.08,10,20,Math.PI),cane,-.22*s,1.6,0,cc);if(s>0)hk.rotation.y=Math.PI;z.ob(s*1.9,lz,.15);}
 // falling snow
 const N=500,sp=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*9;sp[i*3]=Math.sin(a)*r;sp[i*3+1]=Math.random()*9;sp[i*3+2]=Math.cos(a)*r;}
 const sgeo=new THREE.BufferGeometry();sgeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
 const snow=new THREE.Points(sgeo,new THREE.PointsMaterial({color:'#ffffff',size:.09,transparent:true,opacity:.9,depthWrite:false}));g.add(snow);
 anims.push((t,dt)=>{for(let i=0;i<N;i++){sp[i*3+1]-=dt*(.8+(i%5)*.1);sp[i*3]+=Math.sin(t+i)*dt*.2;if(sp[i*3+1]<0)sp[i*3+1]=9;}sgeo.attributes.position.needsUpdate=true;});
 signpost(z);}

