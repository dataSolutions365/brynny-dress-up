/* ================= MORE PET OUTFITS =================
   The newer hats, neck things, outfits, glasses, paw shoes and extras from the lists in 20-pet-parlor.js.
   dressPet() builds the first ones itself and then calls dressPetMore() for these. Sizes come from the pet:
   H is the head size, r and L the body's radius and length, so every outfit fits a chihuahua and a big dog alike.
   On the head, +y is up and +z is the face. On the body (pt.torso), +z points to the head and +y is the back. */
const batShape=(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.25,.45);s.lineTo(1,.62);s.quadraticCurveTo(.86,.42,.9,.26);s.quadraticCurveTo(.72,.2,.66,.04);
  s.quadraticCurveTo(.48,.06,.42,-.1);s.quadraticCurveTo(.22,.02,0,0);return s;})();
const PET_FLOWER_C=['#ffffff','#ffd23f'];
function dressPetMore(pt,F,add,cloth,shiny){const D=pt.D,H=D.head,r=D.r,L=D.len,hd=pt.head,ts=pt.torso;
  const metal=c=>std(c,{metalness:1,roughness:.22});
  const glass=c=>phys(c,{roughness:.05,clearcoat:1,transparent:true,opacity:.55});
  const bowAt=(c,x,y,z,k,par)=>{for(const s of [-1,1]){const w=add(new THREE.ConeGeometry(k*.5,k,12),shiny(c),x+s*k*.45,y,z,par);w.rotation.z=s*Math.PI/2;w.scale.z=.5;}add(sph(k*.24,10,8),shiny(c),x,y,z,par);};
  const lathe=(pts,mat,y,par,z=-H*.05)=>add(new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),36),mat,0,y,z,par);
  const h=F.hat,n=F.neck,b=F.body,gl=F.glasses,ft=F.feet,ex=F.extra;
  if(pt.sparkG){if(pt.sparkG.parent)pt.sparkG.parent.remove(pt.sparkG);pt.sparkG=null;}

  /* ---------- hats ---------- */
  if(h){const c=h.c,y0=H*.86,zc=-H*.05;
    if(h.id==='tiara'){const t=add(new THREE.TorusGeometry(H*.42,H*.03,8,32,Math.PI),metal(c),0,y0+H*.04,zc,hd);t.rotation.x=Math.PI/2;
      for(let i=0;i<7;i++){const a=(i+.5)/7*Math.PI,k=1-Math.abs(i-3)/4;const x=Math.cos(a)*H*.42,zz=zc+Math.sin(a)*H*.42;
        add(new THREE.ConeGeometry(H*.04,H*(.1+.16*k),6),metal(c),x,y0+H*(.1+.08*k),zz,hd);
        if(i%2===0)add(new THREE.OctahedronGeometry(H*(.04+.03*k)),shiny(['#ff6fae','#4fb6ff','#ff6fae','#8e6cff'][i/2]),x*1.03,y0+H*.06,zz+H*.02,hd);}}
    if(h.id==='tophat'){add(cyl(H*.55,H*.55,H*.04,32),cloth(c),0,y0,zc,hd);add(cyl(H*.32,H*.35,H*.6,28),cloth(c),0,y0+H*.32,zc,hd);
      add(cyl(H*.355,H*.355,H*.11,28,1,true),shiny('#ff3b6b'),0,y0+H*.09,zc,hd).material.side=THREE.DoubleSide;}
    if(h.id==='cowboy'){lathe([[0,0],[H*.5,0],[H*.7,H*.05],[H*.8,H*.17],[H*.79,H*.19]],cloth(c),y0,hd).scale.z=.8;
      add(sph(H*.38,20,14),cloth(c),0,y0+H*.12,zc,hd).scale.set(1,.85,.9);add(cyl(H*.39,H*.39,H*.07,24,1,true),cloth('#5a3a22'),0,y0+H*.06,zc,hd).material.side=THREE.DoubleSide;
      add(sph(H*.05,8,6),metal('#e8c25a'),0,y0+H*.07,zc+H*.36,hd);}
    if(h.id==='sunhat'){lathe([[0,0],[H*.6,-H*.02],[H*.9,-H*.1],[H*.98,-H*.16]],cloth(c),y0+H*.02,hd);
      add(new THREE.SphereGeometry(H*.42,24,12,0,Math.PI*2,0,Math.PI/2),cloth(c),0,y0,zc,hd);
      add(cyl(H*.425,H*.425,H*.1,28,1,true),cloth('#ff6fae'),0,y0+H*.05,zc,hd).material.side=THREE.DoubleSide;
      for(let i=0;i<5;i++){const a=-.6+i*.3;add(sph(H*.08,10,8),cloth(i%2?'#ffffff':'#ff6fae'),Math.sin(a)*H*.44,y0+H*.08,zc+Math.cos(a)*H*.44,hd);}}
    if(h.id==='cap'){add(new THREE.SphereGeometry(H*.45,24,12,0,Math.PI*2,0,Math.PI/2),cloth(c),0,y0-H*.04,zc,hd);
      add(new THREE.CylinderGeometry(H*.4,H*.4,H*.03,24,1,false,-Math.PI/2,Math.PI),cloth(c),0,y0-H*.02,zc+H*.28,hd).scale.z=1.25;
      add(sph(H*.06,8,6),cloth('#ffffff'),0,y0+H*.4,zc,hd);}
    if(h.id==='chef'){add(cyl(H*.36,H*.34,H*.32,24),cloth(c),0,y0+H*.12,zc,hd);add(sph(H*.46,20,14),cloth(c),0,y0+H*.42,zc,hd).scale.y=.65;
      for(let i=0;i<5;i++){const a=i/5*Math.PI*2;add(sph(H*.2,12,10),cloth(c),Math.sin(a)*H*.3,y0+H*.5,zc+Math.cos(a)*H*.3,hd);}}
    if(h.id==='bunny'){const band=add(new THREE.TorusGeometry(H*.62,H*.04,8,24,Math.PI),shiny(c),0,y0-H*.2,zc,hd);band.rotation.y=Math.PI/2;
      for(const s of [-1,1]){const e=add(new THREE.CapsuleGeometry(H*.12,H*.6,6,12),cloth(c),s*H*.24,y0+H*.48,zc,hd);e.rotation.z=-s*.22;e.scale.z=.55;
        const i=add(new THREE.CapsuleGeometry(H*.07,H*.48,6,10),cloth('#ff9eb5'),s*H*.24,y0+H*.48,zc+H*.06,hd);i.rotation.z=-s*.22;i.scale.z=.3;}}
    if(h.id==='pumpkin'){for(let i=0;i<4;i++){const p=add(sph(H*.42,20,14),cloth(c,{roughness:.6}),0,y0+H*.16,zc,hd);p.scale.set(.62,.72,1);p.rotation.y=i*Math.PI/4;}
      add(cyl(H*.05,H*.07,H*.2,8),cloth('#3f7a2c'),0,y0+H*.5,zc,hd);const lf=add(sph(H*.1,10,8),cloth('#5bb04a'),H*.1,y0+H*.47,zc,hd);lf.scale.set(1.4,.3,.8);}
    if(h.id==='antlers'){const m=cloth(c,{roughness:.7});
      for(const s of [-1,1]){const add2=(x,y,len,rz)=>{const p=add(cyl(H*.035,H*.05,len,8),m,s*x,y,zc,hd);p.rotation.z=-s*rz;};
        add2(H*.28,y0+H*.25,H*.55,.35);add2(H*.47,y0+H*.36,H*.3,1.05);add2(H*.38,y0+H*.62,H*.28,-.15);add2(H*.3,y0+H*.44,H*.22,-.6);}
      add(sph(H*.1,10,8),shiny('#e0263b'),0,-H*.05,H*1.05,hd);}}

  /* ---------- around the neck ---------- */
  if(n){const c=n.c,y=-H*.72,zc=-H*.05,R=H*.66;
    if(n.id==='lei'){for(let i=0;i<14;i++){const a=i/14*Math.PI*2,dip=Math.max(0,Math.cos(a))*H*.1;const x=Math.sin(a)*R,zz=zc+Math.cos(a)*R;
      add(sph(H*.13,10,8),cloth(i%2?c:PET_FLOWER_C[(i>>1)%2]),x,y-dip,zz,hd).scale.set(1,.65,1);add(sph(H*.045,8,6),shiny('#ffd23f'),x*1.08,y-dip,zc+(zz-zc)*1.08,hd);}}
    if(n.id==='tie'){add(new THREE.TorusGeometry(R,H*.05,8,28),cloth('#ffffff'),0,y,zc,hd).rotation.x=Math.PI/2;
      add(sph(H*.09,10,8),cloth(c),0,y,R+zc,hd).scale.set(1,.9,.6);const t=add(new THREE.ConeGeometry(H*.14,H*.62,4),cloth(c,{map:TEX.stripes}),0,y-H*.36,R+zc-H*.02,hd);t.rotation.x=Math.PI;t.rotation.y=Math.PI/4;t.scale.z=.35;}
    if(n.id==='medal'){for(const s of [-1,1]){const rb=add(box(H*.12,H*.5,H*.02),cloth(c),s*H*.12,y-H*.12,R+zc-H*.05,hd);rb.rotation.z=s*.35;}
      const m=add(cyl(H*.17,H*.17,H*.04,24),std('#e8c25a',{metalness:1,roughness:.2,emissive:new THREE.Color('#5a4000')}),0,y-H*.38,R+zc,hd);m.rotation.x=Math.PI/2;
      add(new THREE.ExtrudeGeometry(starShape,{depth:.3,bevelEnabled:false}),std('#fff1a8',{metalness:1,roughness:.3}),0,y-H*.38,R+zc+H*.02,hd).scale.set(H*.4,H*.4,H*.05);}
    if(n.id==='jewel'){add(new THREE.TorusGeometry(R,H*.025,6,32),metal('#e8e8f0'),0,y,zc,hd).rotation.x=Math.PI/2;
      const g=add(new THREE.OctahedronGeometry(H*.16),phys(c,{roughness:.05,clearcoat:1,iridescence:.6,transparent:true,opacity:.92}),0,y-H*.12,R+zc+H*.02,hd);g.scale.set(.9,1.25,.6);
      for(const s of [-1,1])add(new THREE.OctahedronGeometry(H*.07),shiny(c),s*H*.3,y-H*.04,zc+R*.93,hd);}
    if(n.id==='bell'){add(new THREE.TorusGeometry(R,H*.07,8,28),cloth(c),0,y,zc,hd).rotation.x=Math.PI/2;
      add(sph(H*.15,14,12),metal('#e8c25a'),0,y-H*.16,R+zc+H*.04,hd);add(box(H*.18,H*.02,H*.02),std('#4a3000'),0,y-H*.2,R+zc+H*.18,hd);}}

  /* ---------- outfits on the body ---------- */
  if(b){const c=b.c;const tube=(rad,len,mat,z)=>{const s=add(cyl(rad,rad,len,28,1,true),mat,0,0,z,ts);s.rotation.x=Math.PI/2;return s;};
    const ring=(rad,th,mat,z)=>add(new THREE.TorusGeometry(rad,th,8,28),mat,0,0,z,ts);
    if(b.id==='dress'){tube(r*1.07,L*.55,cloth(c),L*.18);const sk=add(cyl(r*1.08,r*1.6,L*.5,36,1,true),cloth(c,{transparent:true,opacity:.95}),0,0,-L*.32,ts);sk.rotation.x=Math.PI/2;
      ring(r*1.6,r*.06,cloth('#ffffff'),-L*.57);ring(r*1.08,r*.07,cloth('#ffffff'),L*.45);bowAt('#ffffff',0,r*1.08,-L*.08,r*.5,ts);}
    if(b.id==='tux'){tube(r*1.08,L*.8,cloth(c),L*.05);ring(r*1.08,r*.08,cloth(c),L*.45);
      add(sph(r*.62,16,12),cloth('#ffffff'),0,-r*.18,L*.48,ts).scale.set(1,1.15,.55);bowAt('#2d2d3a',0,r*.25,L*.5+r*.45,r*.32,ts);
      for(const k of [0,1])add(sph(r*.06,8,6),metal('#e8c25a'),0,-r*.2-k*r*.25,L*.5+r*.33,ts);
      for(const s of [-1,1]){const t=add(box(r*.3,r*.05,L*.45),cloth(c),s*r*.32,r*.75,-L*.55,ts);t.rotation.x=.55;t.rotation.z=s*.25;}}
    if(b.id==='raincoat'){const m=phys(c,{roughness:.15,clearcoat:1});tube(r*1.12,L*.9,m,L*.02);ring(r*1.12,r*.1,m,L*.47);
      for(let k=0;k<3;k++)add(sph(r*.08,8,6),shiny('#2d2d3a'),r*.55,r*.95,L*(.3-k*.25),ts);
      const hood=add(new THREE.SphereGeometry(r*.75,18,12,0,Math.PI*2,0,Math.PI/2),m,0,r*.95,L*.42,ts);hood.rotation.x=-.9;hood.scale.z=.6;}
    if(b.id==='bee'){tube(r*1.07,L*.85,cloth(c),L*.02);for(const z of [.25,0,-.25])ring(r*1.09,r*.1,cloth('#2d2d3a'),L*z);
      for(const s of [-1,1]){const w=add(new THREE.CircleGeometry(r*.7,20),phys('#ffffff',{side:THREE.DoubleSide,transparent:true,opacity:.7,iridescence:1}),s*r*.45,r*1.35,L*.05,ts);w.scale.set(1,.6,1);w.rotation.set(0,Math.PI/2,s*.55);}
      for(const s of [-1,1]){const a=add(cyl(H*.025,H*.025,H*.55,6),cloth('#2d2d3a'),s*H*.2,H*1.05,0,hd);a.rotation.z=-s*.3;add(sph(H*.08,8,6),shiny('#2d2d3a'),s*H*.28,H*1.3,0,hd);}}
    if(b.id==='dino'){const m=cloth(c,{roughness:.6});for(let i=0;i<7;i++){const t=i/6,k=Math.sin(.25+t*2.6);const s=add(new THREE.ConeGeometry(r*.22*k+r*.06,r*.55*k+r*.12,4),m,0,r*(.98+.1*k),L*(.55-t*1.2),ts);s.scale.z=.45;}
      for(let i=0;i<3;i++){const s=add(new THREE.ConeGeometry(H*.08,H*(.22-i*.04),4),m,0,H*(.92-i*.06),-H*(.1+i*.22),hd);s.scale.z=.45;s.rotation.x=-.3-i*.2;}}
    if(b.id==='angel'){const m=phys(c,{roughness:.6,sheen:1,sheenColor:new THREE.Color('#ffffff')});
      for(const s of [-1,1])for(let i=0;i<6;i++){const a=i/5;const f=add(sph(r*.32,10,8),m,s*r*(.45+a*.65),r*(1.15+a*.55),-L*.05-a*r*.25,ts);f.scale.set(.35,1.35-a*.4,.5);f.rotation.z=-s*(.3+a*.8);}}
    if(b.id==='bat'){const m=phys(c,{side:THREE.DoubleSide,roughness:.4,sheen:1,sheenColor:new THREE.Color('#8e6cff')});
      for(const s of [-1,1]){const w=add(new THREE.ShapeGeometry(batShape),m,s*r*.35,r*.85,-L*.05,ts);w.scale.set(s*r*1.9,r*1.6,1);w.rotation.y=s*.25;}}
    if(b.id==='floatie'){ring(r*1.3,r*.34,phys(c,{map:TEX.stripes,roughness:.2,clearcoat:1}),L*.05);}}

  /* ---------- glasses ---------- */
  if(gl){const c=gl.c,y=H*.12,zz=H*1.0;
    const bridge=(col)=>add(box(H*.26,H*.04,H*.04),shiny(col),0,y+H*.03,zz,hd);
    if(gl.id==='round'){for(const s of [-1,1]){add(new THREE.TorusGeometry(H*.19,H*.025,8,24),metal(c),s*H*.42,y,zz,hd);add(new THREE.CircleGeometry(H*.18,24),glass('#cfefff'),s*H*.42,y,zz-.001,hd);}bridge(c);}
    if(gl.id==='goggles'){for(const s of [-1,1]){add(new THREE.TorusGeometry(H*.19,H*.065,10,24),shiny(c),s*H*.4,y,zz,hd);add(new THREE.CircleGeometry(H*.19,24),glass('#8fd8ff'),s*H*.4,y,zz-.002,hd);}
      bridge(c);add(new THREE.TorusGeometry(H*.98,H*.04,6,32),cloth(c),0,y,0,hd).rotation.x=Math.PI/2;}
    if(gl.id==='monocle'){add(new THREE.TorusGeometry(H*.21,H*.03,8,24),metal(c),H*.42,y,zz,hd);add(new THREE.CircleGeometry(H*.2,24),glass('#e8f6ff'),H*.42,y,zz-.001,hd);
      const ch=add(cyl(H*.012,H*.012,H*.6,6),metal(c),H*.55,y-H*.42,zz-H*.08,hd);ch.rotation.z=.25;}
    if(gl.id==='flower'){for(const s of [-1,1]){for(let i=0;i<7;i++){const a=i/7*Math.PI*2;add(sph(H*.09,10,8),cloth(c),s*H*.42+Math.cos(a)*H*.2,y+Math.sin(a)*H*.2,zz,hd).scale.z=.4;}
      add(new THREE.CircleGeometry(H*.15,20),glass('#ffe6f2'),s*H*.42,y,zz,hd);}bridge('#7ee081');}
    if(gl.id==='mask'){const m=phys(c,{map:TEX.glitter,roughness:.3,clearcoat:1});for(const s of [-1,1]){const e=add(new THREE.TorusGeometry(H*.18,H*.09,10,24),m,s*H*.38,y,zz,hd);e.scale.set(1.25,.85,.45);}
      bridge(c);for(const s of [-1,1]){const f=add(sph(H*.1,10,8),cloth('#ff6fae'),s*H*.7,y+H*.28,zz-H*.05,hd);f.scale.set(.4,1.8,.3);f.rotation.z=-s*.5;}}}

  /* ---------- on the paws ---------- */
  if(ft){const c=ft.c;
    pt.legs.forEach(l=>{const pw=l.paw,par=pw.parent,R=pw.geometry.parameters.radius||r*.36,sc=pw.scale,p=pw.position,top=Math.max(R*2,Math.abs(p.y)*.55);
      const cover=(mat,k=1.08)=>{const m=add(sph(R*k,12,10),mat,p.x,p.y+R*.05,p.z,par);m.scale.copy(sc);return m;};
      const leg=(mat,hgt,rad)=>add(cyl(rad,rad,hgt,14,1,true),mat,p.x,p.y+hgt/2,p.z*.6,par);
      if(ft.id==='socks'){const m=cloth(c,{map:TEX.stripes});cover(m);leg(m,top,R*sc.x*.98);add(new THREE.TorusGeometry(R*sc.x*.98,R*.12,6,16),cloth('#ffffff'),p.x,p.y+top,p.z*.6,par).rotation.x=Math.PI/2;}
      if(ft.id==='boots'){const m=phys(c,{roughness:.15,clearcoat:1});cover(m,1.12);leg(m,top*.75,R*sc.x*1.05);const s=add(sph(R*1.14,12,8),std('#2d2d3a',{roughness:.8}),p.x,p.y-R*.3,p.z,par);s.scale.set(sc.x,.25,sc.z);}
      if(ft.id==='sneakers'){cover(cloth(c),1.1);const s=add(sph(R*1.16,12,8),cloth('#ffffff'),p.x,p.y-R*.28,p.z,par);s.scale.set(sc.x,.3,sc.z);
        for(const k of [0,1])add(box(R*.9,R*.08,R*.08),cloth('#ffffff'),p.x,p.y+R*.35,p.z+R*sc.z*(.25+k*.3),par);}
      if(ft.id==='slippers'){cover(phys(c,{roughness:1,sheen:1,sheenColor:new THREE.Color('#ffffff')}),1.14);add(sph(R*.32,10,8),cloth('#ffffff'),p.x,p.y+R*.45,p.z+R*sc.z*.7,par);}});}

  /* ---------- extras ---------- */
  if(ex){const c=ex.c;
    if(ex.id==='balloon'){const st=add(cyl(r*.012,r*.012,r*4,4),std('#ffffff'),r*.4,r*2.9,-L*.3,ts);st.rotation.z=-.12;
      const bl=add(sph(r*.75,20,14),phys(c,{roughness:.1,clearcoat:1}),r*.65,r*5.3,-L*.3,ts);bl.scale.y=1.18;add(new THREE.ConeGeometry(r*.12,r*.18,8),phys(c,{roughness:.1}),r*.62,r*4.4,-L*.3,ts).rotation.x=Math.PI;}
    if(ex.id==='backpack'){const bp=add(new THREE.CapsuleGeometry(r*.45,L*.25,6,12),cloth(c),0,r*1.25,-L*.05,ts);bp.rotation.x=Math.PI/2;bp.scale.x=1.2;
      add(new THREE.CapsuleGeometry(r*.28,L*.08,6,10),cloth('#ffd23f'),0,r*1.42,-L*.12,ts).rotation.x=Math.PI/2;
      for(const z of [.2,-.25])add(new THREE.TorusGeometry(r*1.04,r*.05,6,24),cloth(c),0,0,L*z,ts);}
    if(ex.id==='tailbow'&&pt.tail)bowAt(c,0,0,0,r*.55,pt.tail);
    if(ex.id==='sparkle'){const g=new THREE.Group();g.position.set(0,r*.2,0);ts.add(g);pt.sparkG=g;sparkPets.add(pt);const m=phys(c,{emissive:new THREE.Color(c),emissiveIntensity:.8,roughness:.2,metalness:.4});
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const s=add(new THREE.ExtrudeGeometry(starShape,{depth:.3,bevelEnabled:false}),m,Math.sin(a)*r*1.9,Math.sin(a*3)*r*.5+r*.6,Math.cos(a)*(L*.5+r*1.3),g);s.scale.setScalar(r*.9);s.rotation.y=a;}}}}
// the ✨ stars spin around their pet
const sparkPets=new Set();
anims.push((t,dt)=>{for(const pt of sparkPets){if(!pt.sparkG||!pt.sparkG.parent){sparkPets.delete(pt);continue;}pt.sparkG.rotation.y+=dt*1.2;}});
