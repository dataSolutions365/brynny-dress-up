/* ===== 🍝 Rosie's Restaurant =====
   An Italian-style restaurant in the open grass between the Birthday Party and the Sweet Bakery.
   The building, the tables, the pads and the food models live here. Sitting down to eat (Rosie the server
   brings your food) and the 🛵 delivery rush around town are in 24l-restaurant.js.
   RST keeps what 24l-restaurant.js needs: the tables, the chairs, the pass where the food comes out, the pads. */
const RST={};
// food you can order, eat bite by bite, and the drinks. Each builder gives back {g, bits}: bits go away in order as you eat.
const FOOD_MAIN=[['pizza','🍕','Pizza'],['burger','🍔','Burger and fries'],['pasta','🍝','Spaghetti and meatballs'],['pancakes','🥞','Pancakes'],['sushi','🍣','Sushi'],['salad','🥗','Salad']];
const FOOD_DRINK=[['lemonade','🍋','Lemonade'],['shake','🥤','Strawberry milkshake'],['oj','🍊','Orange juice']];
const FOOD_SWEET=[['sundae','🍨','Ice cream sundae'],['cake','🍰','Chocolate cake'],['cookies','🍪','Cookies']];
const FOOD_ALL=[...FOOD_MAIN,...FOOD_DRINK,...FOOD_SWEET];
const foodName=k=>{const f=FOOD_ALL.find(f=>f[0]===k);return f?f[1]+' '+f[2]:k;};
const RFM={};// food materials, made once and shared by every plate
function rfm(k,c,o){return RFM[k]||(RFM[k]=phys(c,{roughness:.55,...o}));}
function rPlate(g,r=.16){M(cyl(r,r*.8,.018,32),rfm('plate','#fbfaf7',{roughness:.25,clearcoat:.8}),0,.009,0,g);M(new THREE.TorusGeometry(r,.009,8,40),rfm('plate'),0,.018,0,g).rotation.x=Math.PI/2;}
const FOOD_BUILD={
  pizza(g,bits){rPlate(g,.17);const crust=rfm('crust','#d9a55a',{roughness:.8}),cheese=rfm('cheese','#f6cf63',{roughness:.45,clearcoat:.3}),pep=rfm('pep','#b8322a',{roughness:.5});
    for(let i=0;i<8;i++){const s=new THREE.Group();g.add(s);const a0=i*Math.PI/4;
      M(new THREE.CylinderGeometry(.15,.15,.02,6,1,false,a0,Math.PI/4-.02),crust,0,.03,0,s);
      M(new THREE.CylinderGeometry(.13,.13,.008,6,1,false,a0+.02,Math.PI/4-.06),cheese,0,.043,0,s,false);
      const a=a0+Math.PI/8;M(cyl(.022,.022,.006,12),pep,Math.sin(a)*.085,.048,Math.cos(a)*.085,s,false);if(i%2)M(sph(.008,6,5),rfm('basil','#3f8a35'),Math.sin(a+.25)*.05,.05,Math.cos(a+.25)*.05,s,false);
      bits.push(s);}},
  burger(g,bits){rPlate(g,.17);const bun=rfm('bun','#c9883e',{roughness:.5,clearcoat:.4});const b=new THREE.Group();b.position.x=-.03;g.add(b);
    const bot=M(cyl(.07,.065,.03,24),bun,0,.033,0,b);
    const pat=M(cyl(.072,.072,.026,24),rfm('patty','#5a3420',{roughness:.9}),0,.06,0,b);
    const mid=new THREE.Group();b.add(mid);const ch=M(box(.11,.006,.11),rfm('cheese'),0,.076,0,mid,false);ch.rotation.y=.78;
    M(cyl(.08,.075,.008,10),rfm('lettuce','#7ccf4f',{roughness:.6}),0,.084,0,mid,false);M(cyl(.06,.06,.012,20),rfm('tomato','#d63a2f',{roughness:.3,clearcoat:.6}),0,.094,0,mid,false);
    const top=new THREE.Group();b.add(top);const t=M(new THREE.SphereGeometry(.072,24,12,0,Math.PI*2,0,Math.PI/2),bun,0,.1,0,top);t.scale.y=.75;
    for(let i=0;i<9;i++){const a=i*2.4,r=.02+(i%3)*.016;const s=M(sph(.005,5,4),rfm('sesame','#fbefcf'),Math.sin(a)*r,.1+Math.sqrt(Math.max(0,.072*.072-r*r))*.75,Math.cos(a)*r,top,false);s.scale.set(1,.6,1.6);}
    const fries=new THREE.Group();fries.position.set(.085,0,.02);g.add(fries);const fr=rfm('fries','#f2c14e',{roughness:.6});
    for(let i=0;i<9;i++){const f=M(box(.012,.012,.08),fr,(i%3-1)*.018,.025+Math.floor(i/3)*.012,(i%4-1.5)*.012,fries,false);f.rotation.y=i*.7;}
    bits.push(fries,top,mid,pat,bot);},
  pasta(g,bits){rPlate(g,.17);const nood=canvasTex(128,128,(x,w,h)=>{x.fillStyle='#e8c46a';x.fillRect(0,0,w,h);x.strokeStyle='#f7dc8e';x.lineWidth=4;for(let i=0;i<22;i++){x.beginPath();const y=Math.random()*h;x.moveTo(0,y);for(let k=0;k<w;k+=16)x.quadraticCurveTo(k+8,y+(Math.random()-.5)*30,k+16,y+(Math.random()-.5)*14);x.stroke();}});
    const pile=new THREE.Group();g.add(pile);const m=M(sph(.11,24,12),RFM.nood||(RFM.nood=phys('#ffffff',{map:nood,roughness:.45,clearcoat:.3})),0,.018,0,pile);m.scale.y=.38;
    const s=M(sph(.065,20,10),rfm('sauce','#b8331f',{roughness:.3,clearcoat:.7}),0,.045,0,pile,false);s.scale.y=.25;
    for(let i=0;i<3;i++){const a=i*2.1+.4,mb=M(fuzz(sph(.026,14,10),.003,120),rfm('meatball','#6b3a22',{roughness:.85}),Math.sin(a)*.045,.066,Math.cos(a)*.045,g);bits.push(mb);}
    M(sph(.012,8,6),rfm('basil'),0,.07,0,pile,false).scale.set(1.4,.4,1);bits.push(pile);},
  pancakes(g,bits){rPlate(g,.16);const pc=rfm('pancake','#d69a4c',{roughness:.6,clearcoat:.35});const syrup=rfm('syrup','#8a4a14',{roughness:.1,clearcoat:1,transparent:true,opacity:.85});
    const st=[];for(let i=0;i<3;i++){const p=M(cyl(.095,.095,.026,28),pc,0,.032+i*.027,0,g);st.push(p);}
    const top=new THREE.Group();g.add(top);M(cyl(.088,.09,.006,28),syrup,0,.103,0,top,false);M(box(.03,.018,.03),rfm('butter','#fff2a8',{roughness:.3}),0,.114,0,top,false);
    for(let i=0;i<3;i++){const a=i*2.1;M(new THREE.ConeGeometry(.016,.03,10),rfm('berry','#d6243c',{roughness:.3,clearcoat:.6}),Math.sin(a)*.13,.03,Math.cos(a)*.13,top).rotation.z=Math.PI/2+a;}
    bits.push(top,st[2],st[1],st[0]);},
  sushi(g,bits){M(box(.34,.02,.14),rfm('slate','#2b2b30',{roughness:.6}),0,.01,0,g);const rice=rfm('rice','#f6f3ea',{roughness:.8}),nori=rfm('nori','#1d2b1f',{roughness:.6}),fish=rfm('salmon','#f08a5d',{roughness:.3,clearcoat:.6}),cuc=rfm('cucumber','#7cc35a');
    for(let i=0;i<6;i++){const p=new THREE.Group();p.position.set(-.13+i*.052,.02,0);g.add(p);
      if(i<4){M(cyl(.022,.022,.032,18),nori,0,.016,0,p);M(cyl(.019,.019,.033,18),rice,0,.016,0,p,false);M(cyl(.008,.008,.034,10),i%2?fish:cuc,0,.016,0,p,false);}
      else{const r=M(new RoundedBoxGeometry(.045,.02,.026,2,.008),rice,0,.012,0,p);const f=M(new RoundedBoxGeometry(.05,.01,.03,2,.005),fish,0,.027,0,p,false);r.rotation.y=f.rotation.y=Math.PI/2;}
      bits.push(p);}},
  salad(g,bits){const bowl=M(new THREE.LatheGeometry([[0,0],[.06,0],[.11,.03],[.13,.07],[.125,.072]].map(([a,b])=>new THREE.Vector2(a,b)),28),rfm('bowl','#f6f6f2',{roughness:.25,clearcoat:.8,side:THREE.DoubleSide}),0,0,0,g);
    const lv=[rfm('lettuce'),rfm('lettuce2','#4f9a36',{roughness:.6}),rfm('lettuce3','#a8d86e',{roughness:.6})];
    for(let k=0;k<4;k++){const part=new THREE.Group();g.add(part);
      for(let i=0;i<4;i++){const a=k*1.57+i*.4,r=.03+i*.018;const l=M(sph(.035,10,6),lv[(i+k)%3],Math.sin(a)*r,.06+(3-k)*.006,Math.cos(a)*r,part,false);l.scale.set(1,.3,.7);l.rotation.set(i,a,.3);}
      M(sph(.013,10,8),rfm('tomato'),Math.sin(k*1.57+.7)*.06,.075,Math.cos(k*1.57+.7)*.06,part,false);M(box(.014,.014,.014),rfm('crouton','#d8a25a',{roughness:.9}),Math.sin(k*1.57+1.2)*.04,.078,Math.cos(k*1.57+1.2)*.04,part,false);
      bits.push(part);}},
  sundae(g,bits){const gl=RFM.glass||(RFM.glass=phys('#ffffff',{roughness:.05,transmission:0,transparent:true,opacity:.35,clearcoat:1}));
    M(new THREE.LatheGeometry([[0,0],[.04,0],[.012,.012],[.01,.06],[.05,.09],[.07,.14]].map(([a,b])=>new THREE.Vector2(a,b)),24),gl,0,0,0,g,false);
    const cols=['#fff3dc','#f7a8c4','#7a4a2a'];const sc=[];for(let i=0;i<3;i++){const a=i*2.1;sc.push(M(sph(.036,16,12),rfm('ice'+i,cols[i],{roughness:.6}),Math.sin(a)*.025,.135+(i===2?.035:0),Math.cos(a)*.025,g));}
    const top=new THREE.Group();g.add(top);M(new THREE.ConeGeometry(.03,.045,12),rfm('cream','#ffffff',{roughness:.5}),0,.19,0,top);M(sph(.013,12,10),rfm('cherry','#c3102b',{roughness:.1,clearcoat:1}),0,.22,0,top);
    bits.push(top,sc[2],sc[1],sc[0]);},
  cake(g,bits){rPlate(g,.12);const choc=rfm('choc','#4a2a1a',{roughness:.6}),fr=rfm('frost','#6b3a22',{roughness:.3,clearcoat:.5});
    for(let i=0;i<4;i++){const s=new THREE.Group();g.add(s);const a0=-Math.PI/5+i*Math.PI/10;
      M(new THREE.CylinderGeometry(.11,.11,.03,4,1,false,a0,Math.PI/10),choc,0,.035,0,s);M(new THREE.CylinderGeometry(.11,.11,.008,4,1,false,a0,Math.PI/10),fr,0,.054,0,s,false);M(new THREE.CylinderGeometry(.11,.11,.03,4,1,false,a0,Math.PI/10),choc,0,.073,0,s);M(new THREE.CylinderGeometry(.111,.111,.01,4,1,false,a0,Math.PI/10),fr,0,.093,0,s,false);
      if(i===1)M(new THREE.ConeGeometry(.016,.03,10),rfm('berry'),Math.sin(a0)*.07,.11,Math.cos(a0)*.07,s);bits.push(s);}
    g.rotation.y=Math.PI;},
  cookies(g,bits){rPlate(g,.12);const ck=rfm('cookie','#c8894a',{roughness:.85}),cp=rfm('chip','#3b2010',{roughness:.6});
    for(let i=0;i<4;i++){const c=new THREE.Group();c.position.set(i<3?(i-1)*.055:0,.024+(i===3?.016:0),i<3?0:0);c.rotation.z=i===3?.08:0;g.add(c);M(cyl(.038,.04,.014,20),ck,0,0,0,c);
      for(let k=0;k<4;k++)M(sph(.006,6,4),cp,Math.sin(k*1.7+i)*.022,.008,Math.cos(k*1.7+i)*.022,c,false);bits.unshift(c);}},
  // drinks: the juice goes down a little each sip (bits: the drink itself, which shrinks)
  lemonade(g,bits){rDrink(g,bits,'#f5e36a',{lemon:1});},
  oj(g,bits){rDrink(g,bits,'#f59a1e',{orange:1});},
  shake(g,bits){rDrink(g,bits,'#f6a6c1',{tall:1,cream:1});}};
function rDrink(g,bits,col,o){const h=o.tall?.17:.14,gl=RFM.glass||(RFM.glass=phys('#ffffff',{roughness:.05,transparent:true,opacity:.35,clearcoat:1}));
  M(cyl(.038,.03,h,24),gl,0,h/2,0,g,false);const j=M(cyl(.034,.027,1,24),rfm('juice'+col,col,{roughness:.2,clearcoat:.6,transparent:true,opacity:.92}),0,.004,0,g,false);j.geometry.translate(0,.5,0);j.scale.y=h*.86;j.userData.full=h*.86;
  const st=M(cyl(.004,.004,.2,8),rfm('straw','#ff4d6d'),.012,h*.75,0,g,false);st.rotation.z=-.18;
  if(o.lemon||o.orange){const sl=M(new THREE.CylinderGeometry(.026,.026,.006,16,1,false,0,Math.PI),rfm(o.lemon?'lemon':'orange',o.lemon?'#ffe24a':'#ff9a1e'),-.03,h-.006,0,g,false);sl.rotation.x=Math.PI/2;}
  if(o.cream){M(sph(.034,14,10),rfm('cream'),0,h+.01,0,g,false).scale.y=.7;M(sph(.011,10,8),rfm('cherry'),0,h+.037,0,g,false);}
  bits.push(j);g.userData.drink=j;}
function makeFood(k){const g=new THREE.Group(),bits=[];(FOOD_BUILD[k]||FOOD_BUILD.pizza)(g,bits);g.userData.kind=k;return {g,bits};}

// the red food box couriers carry on their back (you wear one during the 🛵 delivery rush, and the scooter has one)
const DBOX={};
function deliveryBox(){const g=new THREE.Group();
  DBOX.m||(DBOX.m=phys('#c8302e',{roughness:.45,clearcoat:.4}));DBOX.t||(DBOX.t=std('#f6f1e6',{roughness:.7}));
  DBOX.lab||(DBOX.lab=new THREE.MeshBasicMaterial({map:labelTex("🍕 Rosie's",{size:60,fg:'#c8302e',bg:'#f6f1e6',border:null}),transparent:true}));
  M(new RoundedBoxGeometry(.4,.36,.36,3,.04),DBOX.m,0,0,0,g);M(box(.41,.035,.37),DBOX.t,0,.11,0,g,false);
  for(const s of [-1,1]){const p=M(new THREE.PlaneGeometry(.34,.085),DBOX.lab,s*.203,-.03,0,g,false,false);p.rotation.y=s*Math.PI/2;}
  const b=M(new THREE.PlaneGeometry(.34,.085),DBOX.lab,0,-.03,-.183,g,false,false);b.rotation.y=Math.PI;
  return g;}

{const z=Z.diner,g=z.g;RST.z=z;
 // warm terracotta floor tiles
 const tile=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#e9dccb';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const l=58+Math.random()*8;x.fillStyle=`hsl(${18+Math.random()*6},${48+Math.random()*10}%,${l}%)`;x.fillRect(i*64+2,j*64+2,60,60);}},6);
 patch(7,std('#ffffff',{map:tile,roughness:.8}),z.x,z.z);
 const plaster=phys('#efe2c8',{roughness:.85}),brick=std('#a8553a',{roughness:.9}),wood=std('#6b4128',{roughness:.6}),darkW=std('#3b2618',{roughness:.55}),
   iron=std('#2d2a28',{metalness:.7,roughness:.45}),cloth=phys('#fbf8f2',{roughness:.9,sheen:.5}),green=phys('#2f6b3a',{roughness:.6}),brass=std('#c9a24a',{metalness:1,roughness:.3}),terra=std('#b86a43',{roughness:.85});
 // the kitchen: back wall, short side walls, the pass (a counter where the food comes out) and the brick pizza oven
 M(box(10,3.6,.3),plaster,0,1.8,-4.7,g);M(box(10.04,.7,.34),brick,0,.35,-4.7,g);for(let i=-4;i<=4;i++)z.ob(i*1.1,-4.7,.65);
 for(const sx of [-1,1]){M(box(.3,3.6,2.6),plaster,sx*4.85,1.8,-3.5,g);M(box(.34,.7,2.64),brick,sx*4.85,.35,-3.5,g);for(let k=0;k<3;k++)z.ob(sx*4.85,-4.5+k*.9,.5);}
 // striped awning over the kitchen, held up by two iron posts
 {const st=canvasTex(128,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#f6f1e6':'#2f6b3a';x.fillRect(i*16,0,16,h);}});st.wrapS=THREE.RepeatWrapping;st.repeat.set(3,1);
  const aw=M(box(10.2,.06,2.6),phys('#ffffff',{map:st,roughness:.8}),0,3.15,-3.35,g);aw.rotation.x=.16;
  for(let i=-10;i<=10;i++){const v=M(new THREE.CircleGeometry(.24,12,Math.PI,Math.PI),phys(i%2?'#f6f1e6':'#2f6b3a',{roughness:.8,side:THREE.DoubleSide}),i*.485,2.94,-2.06,g,false,false);}
  for(const sx of [-1,1]){M(cyl(.05,.05,2.95,10),iron,sx*4.6,1.47,-2.1,g);z.ob(sx*4.6,-2.1,.15);}}
 // the sign
 M(box(5.6,.95,.12),darkW,0,4.05,-4.62,g);
 M(new THREE.PlaneGeometry(5.3,.8),new THREE.MeshBasicMaterial({map:labelTex("🍝 Rosie's Restaurant",{size:62,fg:'#f6e7c1',bg:'#3b2618',border:'#c9a24a'}),transparent:true}),0,4.05,-4.55,g,false,false);
 // the pass: a long counter with a marble top, and a shelf of plates behind it
 const PASS=RST.pass={lx:.6,lz:-3.15};
 {const marble=canvasTex(256,64,(x,w,h)=>{x.fillStyle='#f3f1ec';x.fillRect(0,0,w,h);x.strokeStyle='rgba(150,150,160,.35)';x.lineWidth=1.5;for(let i=0;i<9;i++){x.beginPath();x.moveTo(Math.random()*w,0);x.bezierCurveTo(Math.random()*w,h*.3,Math.random()*w,h*.7,Math.random()*w,h);x.stroke();}});
  M(box(5.2,1.0,.75),wood,.6,.5,-3.15,g);M(box(5.3,.06,.85),phys('#ffffff',{map:marble,roughness:.2,clearcoat:.8}),.6,1.03,-3.15,g);
  for(let i=0;i<6;i++)M(box(.08,.7,.02),darkW,-1.6+i*.88,.5,-2.765,g,false);
  for(let i=-2;i<=3;i++)z.ob(i*.9+.6,-3.15,.5);
  // little bell for "order up!"
  RST.bell=M(new THREE.SphereGeometry(.06,16,10,0,Math.PI*2,0,Math.PI/2),brass,2.6,1.06,-3.05,g);M(cyl(.07,.07,.01,16),darkW,2.6,1.065,-3.05,g);
  // shelves on the back wall with jars, bottles of olive oil and stacked plates
  const sh=new THREE.Group();sh.position.set(1.4,0,-4.45);g.add(sh);for(const y of [1.65,2.25])M(box(3.2,.05,.3),darkW,0,y,0,sh);
  const jars=['#c9a24a','#7a9a3a','#b8322a','#e8d9b0','#3f6b2a'];for(let i=0;i<8;i++){const x=-1.4+i*.4;if(i%3===0){for(let k=0;k<5;k++)M(cyl(.1,.09,.018,20),rfm('plate'),x,1.69+k*.02,0,sh);}
    else{M(cyl(.045,.05,.18,12),phys(jars[i%5],{roughness:.2,clearcoat:.8,transparent:true,opacity:.85}),x,1.77,0,sh);M(cyl(.02,.02,.06,8),darkW,x,1.89,0,sh);}
    if(i%2){M(cyl(.06,.06,.14,14),phys(jars[(i+2)%5],{roughness:.4}),x,2.35,0,sh);}}
  // hanging copper pans
  for(let i=0;i<4;i++){const pg=new THREE.Group();pg.position.set(-2.2+i*.45,2.75,-4.5);g.add(pg);M(cyl(.12-i*.012,.1-i*.012,.06,20),std('#b8673a',{metalness:.9,roughness:.3}),0,-.2,.08,pg).rotation.x=Math.PI/2;M(box(.025,.25,.02),std('#b8673a',{metalness:.9,roughness:.3}),0,-.02,.02,pg);}}
 // brick pizza oven in the back corner with a fire inside
 {const og=new THREE.Group();og.position.set(-3.6,0,-3.9);g.add(og);
  const bt=canvasTex(128,128,(x,w,h)=>{x.fillStyle='#c9b8a4';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<4;c++){x.fillStyle=`hsl(${12+Math.random()*10},${50+Math.random()*12}%,${34+Math.random()*10}%)`;x.fillRect(c*32+(r%2)*16-14,r*16+1,30,14);}},2);
  const bm=std('#ffffff',{map:bt,roughness:.9});M(box(1.6,.9,1.3),bm,0,.45,0,og);
  const dome=M(new THREE.SphereGeometry(.78,28,14,0,Math.PI*2,0,Math.PI/2),bm,0,.9,0,og);dome.scale.y=.85;
  M(new THREE.CircleGeometry(.32,24,0,Math.PI),std('#120804',{roughness:1}),0,.92,.66,og,false,false);
  const fire=RST.fire=M(new THREE.CircleGeometry(.24,20,0,Math.PI),glow('#ff7a1f',1.6),0,.93,.665,og,false,false);
  M(new THREE.TorusGeometry(.33,.05,8,20,Math.PI),bm,0,.92,.66,og);M(cyl(.09,.11,.9,12),bm,.2,1.75,-.25,og);
  anims.push(t=>{if(curZone!==z)return;fire.material.color.setRGB(2.4+Math.sin(t*9)*.25,.9+Math.sin(t*13)*.15,.25);});
  z.ob(-3.6,-3.9,1);z.ob(-3.2,-3.2,.5);}
 // the 🛵 Star Delivery board: who did the fastest delivery rush (24l-restaurant.js draws it)
 {const bm=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.6});RST.board=bm;
  M(box(1.5,1.1,.06),darkW,-1.9,2.15,-4.53,g);M(new THREE.PlaneGeometry(1.38,.98),bm,-1.9,2.15,-4.49,g,false,false);}

 // ---- the dining room: four round tables, each with two bistro chairs ----
 const TB=RST.tables=[{lx:-2.5,lz:-.6},{lx:2.5,lz:-.6},{lx:-2.5,lz:2.4},{lx:2.5,lz:2.4}];
 function chair(tg,side){const c=new THREE.Group();c.position.set(side*.8,0,0);c.rotation.y=-side*Math.PI/2;tg.add(c);
   M(new RoundedBoxGeometry(.44,.05,.42,2,.015),wood,0,.45,0,c);
   for(const sx of [-1,1])for(const sz of [-1,1]){const l=M(cyl(.018,.016,.45,8),darkW,sx*.18,.225,sz*.17,c);}
   for(const sx of [-1,1])M(cyl(.018,.018,.5,8),darkW,sx*.18,.7,-.19,c);M(new RoundedBoxGeometry(.4,.14,.03,2,.012),wood,0,.88,-.19,c);M(box(.36,.025,.02),darkW,0,.68,-.19,c);
   return c;}
 TB.forEach((t,i)=>{const tg=new THREE.Group();tg.position.set(t.lx,0,t.lz);g.add(tg);t.g=tg;
   M(cyl(.07,.09,.72,12),iron,0,.36,0,tg);M(cyl(.3,.34,.03,24),iron,0,.015,0,tg);
   M(cyl(.56,.56,.03,40),cloth,0,.745,0,tg);M(new THREE.CylinderGeometry(.585,.62,.28,40,1,true),RFM.skirt||(RFM.skirt=phys('#fbf8f2',{roughness:.9,sheen:.5,side:THREE.DoubleSide})),0,.62,0,tg,false);
   // a red check runner, a little candle and a sprig of flowers
   const ck=canvasTex(64,64,(x)=>{x.fillStyle='#fbf8f2';x.fillRect(0,0,64,64);x.fillStyle='rgba(184,50,42,.75)';for(let k=0;k<4;k++){x.fillRect(k*16,0,8,64);x.fillRect(0,k*16,64,8);}},0);ck.wrapS=ck.wrapT=THREE.RepeatWrapping;ck.repeat.set(2,6);
   if(i===0)RST.check=phys('#ffffff',{map:ck,roughness:.9});const run=M(new THREE.PlaneGeometry(.34,1.12),RST.check,0,.762,0,tg,false,true);run.rotation.x=-Math.PI/2;
   M(cyl(.03,.035,.07,12),phys('#ffffff',{roughness:.05,transparent:true,opacity:.45,clearcoat:1}),0,.795,0,tg,false);M(cyl(.012,.012,.05,8),std('#fff8e8'),0,.8,0,tg,false);
   const fl=M(sph(.012,6,5),glow('#ffc76a',1.8),0,.84,0,tg,false,false);fl.scale.y=1.6;t.flame=fl;
   M(cyl(.025,.03,.09,10),terra,.15,.805,.12,tg,false);for(let k=0;k<3;k++)M(sph(.022,8,6),phys(['#d8344a','#f2b8c6','#fff1f4'][k],{roughness:.5}),.15+Math.sin(k*2)*.02,.87+k*.012,.12+Math.cos(k*2)*.02,tg,false);
   t.chairs=[chair(tg,-1),chair(tg,1)];
   z.ob(t.lx,t.lz,.66);for(const s of [-1,1])z.ob(t.lx+s*.84,t.lz,.26);});
 anims.push(t=>{if(curZone!==z)return;for(const tb of TB){const k=1+Math.sin(t*11+tb.lx*3)*.15+Math.sin(t*7.3+tb.lz)*.1;tb.flame.scale.set(k,1.6*k,k);}});
 // the table you sit at is the front right one (on the outside chair, facing the kitchen side of the table)
 RST.myT=TB[3];RST.seat={lx:TB[3].lx+.8,lz:TB[3].lz};
 // every chair a diner can take, best first (the two left outside chairs belong to the people already having dinner).
 // Each person who sits down takes the first one nobody is in (24l-restaurant.js), so nobody sits on anyone.
 RST.seats=[[3,1],[1,1],[3,-1],[1,-1],[2,1],[0,1]].map(([i,side])=>({t:TB[i],side,lx:TB[i].lx+side*.8,lz:TB[i].lz}));
 RST.seats.push(...[[0,-1],[2,-1]].map(([i,side])=>({t:TB[i],side,lx:TB[i].lx+side*.8,lz:TB[i].lz,npc:1})));

 // ---- string lights over the patio, on four iron poles ----
 {const bulbM=glow('#ffd590',1.7),wire=std('#1d1d1d',{roughness:.8});const poles=[[-5.3,-1.8],[5.3,-1.8],[5.3,5.2],[-5.3,5.2]];
  for(const [x,w] of poles){M(cyl(.05,.06,3.1,10),iron,x,1.55,w,g);M(sph(.07,10,8),iron,x,3.12,w,g);z.ob(x,w,.15);}
  const bulbGeo=sph(.055,10,8);
  const strand=(a,b,sag)=>{const n=12,pts=[];for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,w=a[1]+(b[1]-a[1])*t,y=3.05-Math.sin(t*Math.PI)*sag;pts.push(new THREE.Vector3(x,y,w));if(i&&i<n)M(bulbGeo,bulbM,x,y-.07,w,g,false,false);}
    M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.008,4,false),wire,0,0,0,g,false,false);};
  strand(poles[0],poles[2],.6);strand(poles[1],poles[3],.6);strand(poles[2],poles[3],.35);strand(poles[0],poles[1],.25);}
 // potted olive trees and herb boxes around the edge
 for(const [x,w,s] of [[-5.6,1.6,1],[5.6,1.6,1],[-4.4,5.9,.8],[4.4,5.9,.8]]){const pg=new THREE.Group();pg.position.set(x,0,w);pg.scale.setScalar(s);g.add(pg);
   M(cyl(.32,.24,.55,18),terra,0,.275,0,pg);M(cyl(.3,.3,.03,18),std('#4a3326',{roughness:1}),0,.54,0,pg);M(cyl(.04,.06,1,8),darkW,0,1,0,pg);
   for(let k=0;k<5;k++){const b=M(fuzz(sph(.32,14,10),.02,30),phys(k%2?'#6f8a4a':'#87a05c',{roughness:.8,sheen:.4}),Math.sin(k*1.3)*.22,1.55+(k%3)*.12,Math.cos(k*1.3)*.22,pg);b.scale.y=.8;}
   z.ob(x,w,.4*s);}
 // a chalkboard menu by the door
 {const mg=new THREE.Group();mg.position.set(4.6,0,3.8);mg.rotation.y=-.5;g.add(mg);
  const mt=canvasTex(256,320,(x,w,h)=>{x.fillStyle='#24302a';x.fillRect(0,0,w,h);x.strokeStyle='#c9a24a';x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);
    x.fillStyle='#f6f1e6';x.textAlign='center';x.font='700 30px "Trebuchet MS",sans-serif';x.fillText('Today',w/2,46);x.font='26px serif';x.textAlign='left';
    FOOD_MAIN.forEach(([k,e,n],i)=>x.fillText(e+' '+n.split(' ')[0],22,92+i*36));});
  M(box(.7,.88,.04),new THREE.MeshStandardMaterial({map:mt,roughness:.9}),0,.95,0,mg);for(const s of [-1,1]){const l=M(box(.04,1.3,.04),wood,s*.32,.62,-.08,mg);l.rotation.x=.12;}
  z.ob(4.6,3.8,.4);}

 // ---- pads ----
 function pad(P,col,emo,txt,fg,border){const pm=glow(col,1.4);pm.transparent=true;
   const ring=M(new THREE.RingGeometry(.45,.62,40),pm,P.lx,.04,P.lz,g,false,false);ring.rotation.x=-Math.PI/2;
   const pin=M(new THREE.CircleGeometry(.45,40),phys('#fff4e6',{roughness:.3,emissive:col,emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true);pin.rotation.x=-Math.PI/2;
   const et=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emo,64,70);});
   const em=M(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:et,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false);em.rotation.x=-Math.PI/2;
   const lbl=sprite(labelTex(txt,{size:52,fg,border}),1.9,.47);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);P.lbl=lbl;P.parts=[ring,pin,em,lbl];
   anims.push(t=>{pm.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});return P;}
 // sit and eat: right in front of your chair
 RST.spad=pad({lx:RST.seat.lx+.15,lz:RST.seat.lz+1.05,r:.55},'#ff9a5a','🍽️','🍽️ Sit and eat!','#b8322a','#ffe0c8');
 // 🛵 delivery rush: by the scooter at the front left
 RST.dpad=pad({lx:-3.4,lz:4.7,r:.6},'#4fb6ff','🛵','🛵 Delivery rush!','#1f5fa8','#cfe8ff');
 z.padLbl=RST.spad.lbl;
 // a parked delivery scooter with a food box on the back
 {const sg=new THREE.Group();sg.position.set(-4.75,0,3.7);sg.rotation.y=.35;g.add(sg);RST.scooter=sg;
  const body=phys('#c8302e',{roughness:.3,clearcoat:.8}),tire=std('#1d1d22',{roughness:.85}),chrome=std('#d9d9e0',{metalness:1,roughness:.2});
  for(const zz of [-.52,.5]){const w=M(new THREE.TorusGeometry(.17,.07,10,22),tire,0,.24,zz,sg);w.rotation.y=Math.PI/2;M(cyl(.1,.1,.08,16),chrome,0,.24,zz,sg).rotation.z=Math.PI/2;}
  M(new RoundedBoxGeometry(.38,.22,.95,3,.08),body,0,.44,-.05,sg);M(new RoundedBoxGeometry(.32,.12,.5,3,.05),std('#2a1d17',{roughness:.6}),0,.6,-.22,sg);
  const fr=M(new RoundedBoxGeometry(.34,.62,.16,3,.07),body,0,.62,.45,sg);fr.rotation.x=-.25;
  M(cyl(.025,.025,.58,8),chrome,0,1.02,.46,sg).rotation.z=Math.PI/2;M(cyl(.06,.06,.04,14),glow('#fff4c8',1.2),0,.82,.55,sg,false,false).rotation.x=Math.PI/2;
  const bx=deliveryBox();bx.position.set(0,.84,-.42);sg.add(bx);
  z.ob(-4.75,3.7,.6);}
 signpost(z);}

