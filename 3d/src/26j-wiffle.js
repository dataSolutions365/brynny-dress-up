/* ================= ⚾ BASEBALL FIELD (🏟️ Sports Park, across the canal from the Batting Cage) =================
   A real-looking little ballpark on the canal's far bank (BANK_LAND a0 194 .. a1 218), over a wooden footbridge at 202 (it lands beside the backstop, by the ⚾ pad).
   It started out as a wiffle ball field, so the ids are still 'wiffle'/'wif' (zone Z.wiffle, SP.mode 'wif', SAVE.sports.wif, did('wiffle', …)):
   keep them, saves and challenges use them.
   The ⚽ soccer and 🏈 football fields are its neighbours along the bank (168..192 and 142..166).
   Everything is in the zone's local space (Z.wiffle): +z points back at the island, -z points out to the outfield.
   Home plate is at (0, WB.HP); a spot "s steps out from home at angle th" (th 0 = straight to centre field, + = right field) is wfAt(th,s).
   - Two teams of four (WF_TEAMS): your 🦅 Eagles (you, Leo, Marcus, Nora) against the 🐻 Bears (Maya, Sam, Jake, Zara). The team in the field
     has a pitcher, a catcher (crouched behind the plate, the pitch goes into her mitt), an infielder and an outfielder (WF_POS).
     You bat every time for the Eagles: when you get on base a teammate comes in as your pinch runner and you bat again.
     The Bears bat in order, and whoever gets on base stays there as a real runner. Runners run the bases when the ball is hit (wfAdvance).
   - Hits go by where the ball is fielded: caught in the air = OUT, a ground ball stopped in the infield (inside WB.INF) = OUT,
     in the outfield = single, deep (WB.L2) = double, to the wall (WB.L3) = triple, over the fence = home run.
   - Overhand pitches like real baseball (WF_PITCH): 🔥 fastball, 🌀 curveball, ↘️ slider, 🐢 changeup. Each pitch is aimed at a spot and its break is
     worked out so it still ends there (wfPitch), so the ball visibly bends and the call is honest. The strike zone shows as a TV-style box.
   - Batting: tap SWING. Early pulls the ball to left field, late goes to right, on time goes far. Pitching: pick a pitch, then tap PITCH
     when the moving 🎯 is where you want it (corners are harder to hit but easier to miss).
   - It plugs into the sports games in 24e-sports.js through SP.ext.wif (shared HUD, big button, ✕ Leave and menu card).
     The Batting Cage's menu sends you here for a real game (24e-sports.js).
   - Challenges: did('wiffle', 'start'|'game'|'win'|'1B'|'2B'|'3B'|'HR'|'k'|'derby5'), and did('sport','wifwin') counts as a win for the 🏆 rides. */
const WB={FT:16.4,a:206,a0:194,a1:218,bridge:202,HP:10,BD:7.5,PZ:3,FR:19,INF:9,L2:13,L3:16.5,ZX:.3,ZY0:.45,ZY1:1.15,BR:.05,KD:.045,FAIR:Math.PI/4};
WB.out=BANK.out+12;
BANK_LAND.push({id:'wiffle',a0:WB.a0,a1:WB.a1,out:WB.out,ground:1});// ground: it draws its own grass, but you walk on it like any bank land
MAPC.wiffle='#9ad47e';
const wfAt=(th,s)=>[Math.sin(th)*s,WB.HP-Math.cos(th)*s];
const wfPol=(x,z)=>[Math.atan2(x,WB.HP-z),Math.hypot(x,WB.HP-z)];// [angle, distance from home]
// home, first, second, third (local x,z)
WB.base=[[0,WB.HP],wfAt(Math.PI/4,WB.BD),wfAt(0,WB.BD*Math.SQRT2),wfAt(-Math.PI/4,WB.BD)];
WB.bench={me:[-8.4,WB.HP+.6],op:[8.4,WB.HP+.6]};

/* ---------- the land, the field, the fence, the backstop, the strike zone, benches and the scoreboard ---------- */
{const z=Z.wiffle,g=z.g,W=WB,HP=W.HP;
 // grass out to the edge of the bank, with a sandy edge down to the water (like the airfield)
 {const wg=new THREE.Group();scene.add(wg);const th0=deg(W.a0-90),th=deg(W.a1-W.a0);
  const m=M(new THREE.RingGeometry(BANK.out-.4,W.out,24,1,th0,th),groundMat,0,.004,0,wg,false,true);m.rotation.x=-Math.PI/2;
  const sand=std('#e8cf9a',{map:TEX.sand,roughness:1});
  M(new THREE.CylinderGeometry(W.out,W.out+2,3,24,1,true,deg(W.a0),deg(W.a1-W.a0)),sand,0,-1.5,0,wg,false,true);
  for(const a of [W.a0,W.a1]){const L=W.out-BANK.out+.4,w=M(new THREE.PlaneGeometry(L,3),sand,0,0,0,wg,false,true);const r=(BANK.out+W.out)/2;
    w.position.set(Math.sin(deg(a))*r,-1.5,Math.cos(deg(a))*r);w.rotation.y=deg(a)-Math.PI/2;w.material.side=THREE.DoubleSide;}}
 // the field: mown stripes, a real diamond (dirt infield, grass inside the base paths, the mound), chalk foul lines and batter's boxes
 const X0=-18,X1=18,Z0=HP-22,Z1=HP+4.5,K=22;
 const tex=canvasTex((X1-X0)*K,(Z1-Z0)*K,(x,w,h)=>{const px=v=>(v-X0)*K,pz=v=>(v-Z0)*K,hx=px(0),hz=pz(HP);
   // mown in a checkerboard, like a big league outfield
   for(let i=0;i*K*1.6<w;i++)for(let j=0;j*K*1.6<h;j++){x.fillStyle=(i+j)%2?'#5c9e3f':'#67ab47';x.fillRect(i*K*1.6,j*K*1.6,K*1.6+1,K*1.6+1);}
   for(let i=0;i<5000;i++){const c=Math.random();x.fillStyle=c<.5?'rgba(40,80,25,.18)':'rgba(150,200,110,.14)';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,2+Math.random()*4);}
   const dirt='#b98a5c',grass='#62a443';
   // the dirt infield: a wide arc behind the bases, from foul line to foul line
   const [sx,sz]=W.base[2],dR=Math.hypot(sx,sz-W.PZ)+1.9;
   x.save();x.beginPath();x.moveTo(hx,hz);x.lineTo(px(wfAt(-W.FAIR,20)[0]),pz(wfAt(-W.FAIR,20)[1]));x.lineTo(px(wfAt(W.FAIR,20)[0]),pz(wfAt(W.FAIR,20)[1]));x.closePath();x.clip();
   x.fillStyle=dirt;x.beginPath();x.arc(px(0),pz(W.PZ),dR*K,0,7);x.fill();x.restore();
   // the grass inside the base paths
   const ins=.75,q=W.base.map(([bx,bz])=>{const cx=0,cz=(W.base[0][1]+W.base[2][1])/2,d=Math.hypot(bx-cx,bz-cz);return [cx+(bx-cx)*(d-ins)/d,cz+(bz-cz)*(d-ins)/d];});
   x.fillStyle=grass;x.beginPath();q.forEach(([a,b],i)=>i?x.lineTo(px(a),pz(b)):x.moveTo(px(a),pz(b)));x.closePath();x.fill();
   x.strokeStyle='rgba(40,80,25,.35)';x.lineWidth=2;x.stroke();
   // dirt circles round home and the bases, and the pitcher's mound
   x.fillStyle=dirt;for(const [bx,bz,r] of [[...W.base[0],1.75],[...W.base[1],.8],[...W.base[2],.8],[...W.base[3],.8],[0,W.PZ,1.25]]){x.beginPath();x.arc(px(bx),pz(bz),r*K,0,7);x.fill();}
   for(let i=0;i<9000;i++){const a=Math.random()*7,r=Math.sqrt(Math.random())*dR*K;const X=px(0)+Math.cos(a)*r,Y=pz(W.PZ)+Math.sin(a)*r;x.fillStyle=Math.random()<.5?'rgba(120,80,45,.22)':'rgba(220,180,130,.18)';x.fillRect(X,Y,2,2);}
   // chalk: the foul lines (to the poles), the batter's boxes and the catcher's box
   x.strokeStyle='rgba(255,255,255,.92)';x.lineWidth=K*.1;x.lineCap='butt';
   for(const s of [-1,1]){const [ex,ez]=wfAt(s*W.FAIR,W.FR);x.beginPath();x.moveTo(hx,hz);x.lineTo(px(ex),pz(ez));x.stroke();}
   x.lineWidth=K*.07;x.strokeRect(px(-1.05),pz(HP-.62),K*.62,K*1.24);x.strokeRect(px(.43),pz(HP-.62),K*.62,K*1.24);
   x.beginPath();x.moveTo(px(-.43),pz(HP+.62));x.lineTo(px(-.43),pz(HP+1.5));x.lineTo(px(.43),pz(HP+1.5));x.lineTo(px(.43),pz(HP+.62));x.stroke();
   // the on-deck circles
   for(const s of [-1,1]){x.fillStyle='rgba(185,138,92,.9)';x.beginPath();x.arc(px(s*4.6),pz(HP+1.6),.45*K,0,7);x.fill();}
   // fade the edges into the grass round it
   x.globalCompositeOperation='destination-in';const gr=x.createRadialGradient(hx,hz,(W.FR+1)*K,hx,hz,(W.FR+3.5)*K);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
   x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over';});
 tex.anisotropy=8;
 const fm=std('#ffffff',{map:tex,roughness:.95,transparent:true,depthWrite:false});fm.polygonOffset=true;fm.polygonOffsetFactor=-2;fm.polygonOffsetUnits=-2;
 const fl=M(new THREE.PlaneGeometry(X1-X0,Z1-Z0),fm,(X0+X1)/2,.02,(Z0+Z1)/2,g,false,true);fl.rotation.x=-Math.PI/2;
 // bases (rubber throw-down bags), home plate and the pitching rubber
 const white=std('#f4f2ec',{roughness:.6});W.baseM=[];
 {const s=new THREE.Shape();s.moveTo(-.22,0);s.lineTo(.22,0);s.lineTo(.22,.2);s.lineTo(0,.36);s.lineTo(-.22,.2);s.closePath();
  const hp=M(new THREE.ExtrudeGeometry(s,{depth:.02,bevelEnabled:false}),white,0,.045,HP-.18,g,false,true);hp.rotation.x=Math.PI/2;}
 for(let i=1;i<4;i++){const [bx,bz]=W.base[i];const m=M(box(.4,.05,.4),std('#f4f2ec',{roughness:.6,emissive:'#000000'}),bx,.035,bz,g,false,true);m.rotation.y=Math.PI/4;W.baseM[i]=m;}
 {const md=M(new THREE.CylinderGeometry(.7,1.2,.12,24),std('#b98a5c',{map:TEX.sand,roughness:1}),0,.0,W.PZ,g,false,true);md.scale.y=1;}
 M(box(.5,.03,.12),white,0,.075,W.PZ,g,false,true);
 const B=advBatch();
 // the outfield fence: a green windscreen on posts with a yellow top, and yellow foul poles
 {const screen=std('#2f5d34',{roughness:.85,side:THREE.DoubleSide,map:canvasTex(64,64,(x,w,h)=>{x.fillStyle='#2f5d34';x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.25)';for(let i=0;i<w;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}})}),
    top=std('#f2c230',{roughness:.6}),post=ADM.steel,n=28;
  for(let i=0;i<n;i++){const a=-W.FAIR+(i+.5)/n*W.FAIR*2,[x,zz]=wfAt(a,W.FR),seg=2*W.FR*Math.sin(W.FAIR/n)+.03;
    B.add(new THREE.PlaneGeometry(seg,1.1),screen,x,.6,zz,0,-a,0);B.add(cyl(.05,.05,seg,6),top,x,1.17,zz,0,-a,Math.PI/2);}
  for(let i=0;i<=n;i++){const a=-W.FAIR+i/n*W.FAIR*2,[x,zz]=wfAt(a,W.FR);B.add(cyl(.035,.035,1.2,6),post,x,.6,zz);}
  for(let i=0;i<=n*2;i++){const a=-W.FAIR+i/(n*2)*W.FAIR*2,[x,zz]=wfAt(a,W.FR+.15);z.ob(x,zz,.45);}
  for(const s of [-1,1]){const [x,zz]=wfAt(s*W.FAIR,W.FR+.05);B.add(cyl(.06,.07,4.2,10),top,x,2.1,zz);B.add(box(.04,1.6,.5),top,x+s*.25,2.6,zz,0,-s*W.FAIR,0);}
  for(const [a,t] of [[-W.FAIR+.06,`${Math.round(W.FR*W.FT)}`],[0,`${Math.round(W.FR*W.FT)} FT`],[W.FAIR-.06,`${Math.round(W.FR*W.FT)}`]]){const [x,zz]=wfAt(a,W.FR-.06);const s=M(new THREE.PlaneGeometry(t.length>5?2.2:1,.36),new THREE.MeshBasicMaterial({map:labelTex(t,{size:70,bg:null,fg:'#ffffff',w:t.length>5?512:256}),transparent:true}),x,.72,zz,g,false,false);s.rotation.y=-a;}}
 // the backstop behind home: chain-link on posts, curved round the plate
 {const link=canvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(150,156,162,.95)';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(w,h);x.moveTo(w,0);x.lineTo(0,h);x.stroke();});
  link.wrapS=link.wrapT=THREE.RepeatWrapping;link.repeat.set(70,22);
  const net=new THREE.MeshStandardMaterial({map:link,transparent:true,alphaTest:.3,side:THREE.DoubleSide,metalness:.5,roughness:.5});
  const A0=-Math.PI*.42,AL=Math.PI*.84,bs=W.backstop=new THREE.Group();g.add(bs);// hidden while you bat, so the camera can look through it
  M(new THREE.CylinderGeometry(3.4,3.4,2.8,24,1,true,A0,AL),net,0,1.4,HP,bs,false,false);
  const BS=advBatch(),at=(a,y)=>new THREE.Vector3(Math.sin(a)*3.4,y,HP+Math.cos(a)*3.4);
  for(let i=0;i<=6;i++){const a=A0+i/6*AL;BS.stick(at(a,0),at(a,2.9),.04,ADM.steel,8);}
  for(let i=0;i<12;i++)BS.stick(at(A0+i/12*AL,2.85),at(A0+(i+1)/12*AL,2.85),.03,ADM.steel,6);BS.done(bs);
  for(let i=0;i<=12;i++){const a=A0+i/12*AL;z.ob(Math.sin(a)*3.4,HP+Math.cos(a)*3.4,.3);}}
 // the strike zone: a thin see-through box over the plate, like on TV (only shown while a pitch is coming)
 {const zb=W.zoneBox=new THREE.Group();zb.position.set(0,0,HP);zb.visible=false;g.add(zb);
  const lm=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.7,depthTest:false,side:THREE.DoubleSide}),y0=W.ZY0,y1=W.ZY1,t=.012;
  for(const [w,h,x,y] of [[W.ZX*2+t,t,0,y0],[W.ZX*2+t,t,0,y1],[t,y1-y0,-W.ZX,(y0+y1)/2],[t,y1-y0,W.ZX,(y0+y1)/2]]){const m=M(new THREE.PlaneGeometry(w,h),lm,x,y,0,zb,false,false);m.renderOrder=4;}
  const f=M(new THREE.PlaneGeometry(W.ZX*2,y1-y0),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.07,depthWrite:false,side:THREE.DoubleSide}),0,(y0+y1)/2,0,zb,false,false);f.renderOrder=3;}
 // team benches on both sides, a cooler and a bucket of bats and balls
 for(const k of ['me','op']){const [bx,bz]=W.bench[k],s=k==='me'?1:-1,bg=new THREE.Group();bg.position.set(bx,0,bz);bg.rotation.y=s*Math.PI/2;g.add(bg);
   const seat=std('#c9a06a',{roughness:.8}),leg=std('#6e7378',{metalness:.6,roughness:.4});
   M(box(3,.06,.42),seat,0,.46,0,bg);M(box(3,.32,.05),seat,0,.78,-.22,bg);for(const x of [-1.3,1.3]){M(box(.06,.46,.4),leg,x,.23,0,bg);M(box(.05,.8,.05),leg,x,.55,-.24,bg);}
   for(const x of [-1,0,1])z.ob(bx,bz+x,.45);}
 {const [bx,bz]=WB.bench.me;const ck=new THREE.Group();ck.position.set(bx-.2,0,bz-2.3);g.add(ck);
  M(box(.55,.38,.36),phys('#2f6fd6',{roughness:.4,clearcoat:.5}),0,.19,0,ck);M(box(.57,.06,.38),phys('#ffffff',{roughness:.4}),0,.4,0,ck);z.ob(bx-.2,bz-2.3,.4);
  const bk=new THREE.Group();bk.position.set(bx+.1,0,bz+2.2);g.add(bk);M(cyl(.2,.17,.42,16),std('#e8334a',{roughness:.5}),0,.21,0,bk);
  for(let i=0;i<3;i++){const b=M(cyl(.022,.012,.8,8),std('#c99a5e',{roughness:.5}),Math.sin(i*2.1)*.07,.55,Math.cos(i*2.1)*.07,bk);b.rotation.z=(i-1)*.12;}z.ob(bx+.1,bz+2.2,.3);}
 // the scoreboard behind centre field (wfBoard draws on it)
 {const cv=document.createElement('canvas');cv.width=768;cv.height=384;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;W.board={cv,t};
  const [bx,bz]=wfAt(0,W.FR+2.2);for(const s of [-1,1]){B.add(cyl(.08,.08,4.6,10),ADM.steel,bx+s*1.9,2.3,bz);z.ob(bx+s*1.9,bz,.25);}
  B.add(box(4.3,2.25,.12),std('#1d2a1f',{roughness:.6}),bx,3.35,bz-.08);
  M(new THREE.PlaneGeometry(4.1,2.05),new THREE.MeshBasicMaterial({map:t,toneMapped:false}),bx,3.35,bz,g,false,false);}
 B.done(g);
 W.pad=spPad(z,3.9,HP+3.5,'#4fd16a','⚾','⚾ Play baseball!','#2f8f3a');
 signpost(z);}

/* ---------- 🌉 the footbridge over the canal (like the ones to Lookout Mountain and the airfield) ---------- */
{const F={a:WB.bridge,t0:R-2.5,t1:BANK.in+2.8,w:2.4,top:2.3};F.ux=Math.sin(deg(F.a));F.uz=Math.cos(deg(F.a));WB.fb=F;
  const loc=(x,z)=>[x*F.ux+z*F.uz,x*F.uz-z*F.ux],deck=t=>F.top*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-F.t0)/(F.t1-F.t0))))+.1;
  SURF.push({h(x,z){const [t,s]=loc(x,z);if(t<F.t0||t>F.t1||Math.abs(s)>F.w/2-.18)return -1;return deck(t);}});
  BANK_BRIDGES.push({a:F.a,w:F.w,on:p=>HIGH.on||deck(loc(p.x,p.z)[0])<.5});
  const g=new THREE.Group();g.rotation.y=deg(F.a);scene.add(g);const B=advBatch(),hw=F.w/2,P=(s,t,dy=0)=>new THREE.Vector3(s,deck(t)+dy,t);
  for(let t=F.t0+.15;t<F.t1;t+=.3){const sl=Math.atan2(deck(t+.1)-deck(t-.1),.2);B.add(box(F.w,.07,.27),ADM.wood,0,deck(t)-.04,t,-sl,0,0);}
  for(const s of [-1,1]){
    for(let t=F.t0;t<F.t1-.4;t+=.4)B.stick(P(s*(hw-.08),t,-.12),P(s*(hw-.08),t+.4,-.12),.07,ADM.dark,6);
    for(let t=F.t0+.3;t<F.t1;t+=1.6){B.stick(P(s*(hw-.06),t,-.05),P(s*(hw-.06),t,1.02),.05,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,1.02),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),1.02),.045,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,.55),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),.55),.025,ADM.rope,5);}
    const arch=[];for(let i=0;i<=24;i++){const t=F.t0+3+(F.t1-F.t0-6)*i/24;arch.push(P(s*(hw-.2),t,-.18-(.6*Math.sin(Math.PI*i/24))));}
    for(let i=0;i<24;i++)B.stick(arch[i],arch[i+1],.11,ADM.dark,7);}
  for(const t of [F.t0+3.4,F.t1-3.4])B.add(new THREE.CylinderGeometry(.55,.75,2.4,10),ADM.stone,0,-.9,t,0,0,0,2.4,1,1);
  B.done(g);
  MAP_DRAW.push((x,w2s,k)=>{const a=w2s(F.ux*F.t0,F.uz*F.t0),b=w2s(F.ux*F.t1,F.uz*F.t1);x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2.5,F.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();
    // a little diamond for the field
    const z=Z.wiffle,c=W=>w2s(...z.toWorld(...W));x.fillStyle='#c79a68';x.beginPath();WB.base.forEach((p,i)=>{const q=c(p);i?x.lineTo(...q):x.moveTo(...q);});x.closePath();x.fill();});}

/* ================= the game ================= */
const WF={on:false,kind:null,cpu:null,ball:null,cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),init:false},idleT:0};
const WF_PITCH={// spd: how fast (steps a second); ax/ay: how it breaks (sideways, up); every pitch also drops a little from gravity
  fast:{n:'🔥 Fastball',spd:11,ax:0,ay:1.4},
  curve:{n:'🌀 Curveball',spd:7.8,ax:1.6,ay:-4.2},
  slider:{n:'↘️ Slider',spd:9,ax:-3.6,ay:-1},
  change:{n:'🐢 Changeup',spd:7.4,ax:-.6,ay:-1.6}};
const WF_MINE=['fast','curve','slider','change'];
{const st=document.createElement('style');st.textContent=`
#wfDia{position:relative;width:30px;height:24px;display:none}body.wf-on #wfDia{display:inline-block}
#wfDia i{position:absolute;width:9px;height:9px;transform:rotate(45deg);border:2px solid rgba(255,255,255,.8);border-radius:2px;background:transparent}
#wfDia i.on{background:#ffd23f;border-color:#ffd23f}
#wfPitches{position:fixed;z-index:6;display:none;left:calc(env(safe-area-inset-left) + 14px);bottom:calc(env(safe-area-inset-bottom) + 22px);grid-template-columns:1fr 1fr;gap:8px}
body.wf-pick #wfPitches{display:grid}
body.wf-on #banner{left:16px;right:16px;margin:0 auto;max-width:520px;top:24%;padding:10px 18px;border-radius:22px;background:rgba(29,26,47,.82);color:#fff;text-shadow:none;font-size:clamp(22px,6.2vw,36px);line-height:1.2;box-shadow:0 6px 20px rgba(0,0,0,.25)}
#wfPitches button{background:rgba(255,255,255,.92);border-radius:16px;padding:9px 10px;font-weight:700;font-size:14px;min-width:104px;box-shadow:0 3px 0 rgba(0,0,0,.15);color:#3b2357}
#wfPitches button.sel{background:#3a5bd9;color:#fff;box-shadow:0 3px 0 #22378a}
#wfPitches button:active{transform:scale(.95)}`;
 document.head.appendChild(st);
 const d=document.createElement('div');d.id='wfPitches';d.innerHTML=WF_MINE.map(k=>`<button data-p="${k}">${WF_PITCH[k].n}</button>`).join('');document.body.appendChild(d);
 d.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();WF.my=b.dataset.p;wfPitchBtns();sfx('pop');});
 const dia=document.createElement('span');dia.id='wfDia';dia.innerHTML='<i style="left:19px;top:9px"></i><i style="left:10px;top:1px"></i><i style="left:1px;top:9px"></i>';$('#spTop').appendChild(dia);}
function wfPitchBtns(){document.querySelectorAll('#wfPitches button').forEach(b=>b.classList.toggle('sel',b.dataset.p===WF.my));}

/* ---------- the players: your 🦅 Eagles (you, Leo, Marcus, Nora) and the 🐻 Bears (Maya, Sam, Jake, Zara) ---------- */
const WF_TEAMS={me:{n:'EAGLES',e:'🦅',c:'#2f6fd6',hud:'#7fb6ff'},op:{n:'BEARS',e:'🐻',c:'#d62839',hud:'#ff8f8f'}};
// where the team in the field stands (local x,z): pitcher, catcher, infielder (up the middle) and outfielder
const WF_POS={P:[0,WB.PZ],C:[0,WB.HP+.95],IF:wfAt(-.32,9.4),OF:wfAt(.22,14.6)};
function wfUni(L,c,catcher){return Object.assign(L,{dress:null,top:{id:'baseballtop',c:'#ffffff'},bottom:{id:'baseballpants',c:'#ffffff'},shoes:{id:'ballcleats',c:'#2d2d3a'},
  hat:{id:catcher?'helmet':'cap',c},extras:{glove:'#a0622d'}});}
function wfCpu(){if(WF.cpu)return WF.cpu;const z=Z.wiffle,B=WF_TEAMS.me.c,Rd=WF_TEAMS.op.c;
  const kid=(o,guy)=>Object.assign(guy?defaultGuyLook():defaultLook(),o,guy?{}:{style:'glam',face:{eyes:'almond',nose:'petite',lips:'soft'}});
  const looks={
    leo:wfUni(kid({skin:'#e6c49a',eyes:'#4a6b8a',hair:{id:'curltop',c:'#7a4a2a'}},1),B),
    marcus:wfUni(kid({skin:'#6b4128',eyes:'#3d2a1a',hair:{id:'buzz',c:'#1d140f'}},1),B),
    nora:wfUni(kid({skin:'#eab38c',eyes:'#5a3a22',hair:{id:'braids',c:'#4a2c1a'}},0),B,1),
    maya:wfUni(kid({skin:'#f7cfae',eyes:'#6b4a2b',hair:{id:'ponytail',c:'#2b1d16'}},0),Rd),
    sam:wfUni(kid({skin:'#8d5a3b',eyes:'#3d2a1a',hair:{id:'buzz',c:'#1d1410'}},1),Rd),
    jake:wfUni(kid({skin:'#ffe3cc',eyes:'#4a6b8a',hair:{id:'flow',c:'#a0441f'}},1),Rd),
    zara:wfUni(kid({skin:'#b97a4f',eyes:'#3d2a1a',hair:{id:'bob',c:'#1d140f'}},0),Rd,1)};
  // shirts in the team colour (the uniform top is white with the colour as trim)
  for(const k of ['leo','marcus','nora'])looks[k].top.c=B;for(const k of ['maya','sam','jake','zara'])looks[k].top.c=Rd;
  const mk=(k,n,col)=>{const a=new Avatar(looks[k],n,col);z.g.add(a.g);const piv=new THREE.Group();a.g.add(piv);const bat=wfBatMesh();piv.add(bat);piv.visible=false;
    return {a,n,p:new THREE.Vector3(),face:0,spd:0,piv,swing:-1,pose:null,run:null,hold:false,sit:false,base:0,go:null};};
  const C=WF.cpu={leo:mk('leo','Leo',B),marcus:mk('marcus','Marcus',B),nora:mk('nora','Nora',B),maya:mk('maya','Maya',Rd),sam:mk('sam','Sam',Rd),jake:mk('jake','Jake',Rd),zara:mk('zara','Zara',Rd)};
  // fielding spots for each team: pitcher, catcher, infield, outfield
  WF.def={op:{P:C.maya,C:C.zara,IF:C.sam,OF:C.jake},me:{P:null,C:C.nora,IF:C.leo,OF:C.marcus}};
  WF.order=[C.maya,C.sam,C.jake,C.zara];WF.subs=[C.leo,C.marcus,C.nora];return C;}
// a real wooden bat: a knob, a thin handle and a long barrel, with black grip tape
function wfBatMesh(){const g=new THREE.Group();
  if(!WF.batGeo){const P=[[0,.0],[.004,.022],[.02,.024],[.03,.013],[.2,.013],[.36,.018],[.52,.028],[.78,.033],[.83,.032],[.84,.02],[.842,0]];WF.batGeo=new THREE.LatheGeometry(P.map(([y,r])=>new THREE.Vector2(r,y)),16);
    WF.batM=std('#c99a5e',{roughness:.42,map:canvasTex(64,256,(x,w,h)=>{x.fillStyle='#c99a5e';x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.strokeStyle=`rgba(${Math.random()<.5?'110,70,35':'230,200,150'},.25)`;x.lineWidth=1+Math.random()*2;const X=Math.random()*w;x.beginPath();x.moveTo(X,0);x.bezierCurveTo(X+6,h*.3,X-6,h*.7,X+3,h);x.stroke();}})});
    WF.tapeM=std('#1d1d22',{roughness:.9});WF.tapeG=cyl(.0155,.0155,.2,12);}
  M(WF.batGeo,WF.batM,0,0,0,g,true,false);M(WF.tapeG,WF.tapeM,0,.12,0,g,false,false);return g;}
// a real baseball: white leather with the red stitched seams
function wfBallMesh(){const t=canvasTex(256,128,(x,w,h)=>{x.fillStyle='#f5f2e8';x.fillRect(0,0,w,h);
    for(let i=0;i<600;i++){x.fillStyle='rgba(180,170,150,.08)';x.fillRect(Math.random()*w,Math.random()*h,2,2);}
    // the seam on an equirectangular map: a wave going twice round
    const Y=u=>h/2+Math.sin(u*Math.PI*4)*h*.27;x.strokeStyle='#c8202f';x.lineWidth=2.2;
    for(const d of [-3.5,3.5]){x.beginPath();for(let u=0;u<=1.001;u+=.005){const X=u*w,yy=Y(u)+d;u?x.lineTo(X,yy):x.moveTo(X,yy);}x.stroke();}
    x.lineWidth=1.6;for(let u=0;u<1;u+=.014){const X=u*w,yy=Y(u),dy=Math.cos(u*Math.PI*4)*h*.27*Math.PI*4/w;const n=Math.hypot(1,dy);x.beginPath();x.moveTo(X-dy/n*7-3,yy+1/n*7-2);x.lineTo(X+dy/n*7+3,yy-1/n*7+2);x.stroke();}});
  return M(sph(WB.BR,20,14),std('#ffffff',{map:t,roughness:.5}),0,-5,0,Z.wiffle.g,true,false);}

/* ---------- poses (drawn after the normal walking animation) ---------- */
const _wfV=new THREE.Vector3(),_wfY=new THREE.Vector3(0,1,0);
// batting: the same swing as the Batting Cage (spBatPose), for anyone. s: seconds into the swing, or -1 in the stance
function wfBatPose(a,piv,s){const A=a.arms;if(!A)return;let u=s<0?0:Math.min(1,s/.3);const ease=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const phi=-2.3+ease*4.1,elev=.95-Math.sin(Math.min(1,u*1.6)*Math.PI/2)*.95+(u>.8?(u-.8)*2:0);
  piv.quaternion.setFromUnitVectors(_wfY,_wfV.set(Math.sin(phi)*Math.cos(elev),Math.sin(elev),Math.cos(phi)*Math.cos(elev)));
  const ax=-.9-Math.sin(ease*Math.PI)*.5;A[0].sh.rotation.x=ax;A[1].sh.rotation.x=ax;A[0].sh.rotation.z=.35-ease*.5;A[1].sh.rotation.z=-.1+ease*.2-.4;A[0].el.rotation.x=-1.2+ease*.9;A[1].el.rotation.x=-1.4+ease*1;
  a.hips.rotation.y=-.35+ease*1.1;
  // the stance: feet a bit wider than the shoulders, knees bent, weight back (then a little stride into the swing)
  const L=a.legs;if(L){const st=s<0?0:Math.min(1,s/.12);for(const [i,sg] of [[0,1],[1,-1]]){L[i].hp.rotation.z=sg*.2;L[i].hp.rotation.x=-.28;L[i].kn.rotation.x=.5;}L[1].hp.rotation.x=-.28-st*.25;a.g.position.y-=.045;}
  a.g.updateMatrixWorld(true);piv.position.copy(a.g.worldToLocal(A[0].hand.getWorldPosition(_wfV))).add(_wfV.set(0,-.04,0));piv.translateY(-.06);}
// pitching: a real overhand windup. Leg kick, the arm goes down and back, up behind the head, then over the top and down across the body.
// u: 0..1 through the motion (the ball leaves at WF_REL). The throwing shoulder only ever turns one way (back, up, over), so the arm circles like a real throw.
const WF_THROW=1,WF_REL=.6;
const WF_TK=[// u, right shoulder x, right shoulder z, right elbow, left shoulder x, left leg hip, left knee, lean, hips turn, right leg hip
  [0,-.55,.12,-1.35,-.75,0,0,0,0,0],
  [.3,-.35,.1,-1.5,-.8,-1.45,1.5,-.08,.75,.05],
  [.42,.85,.55,-.4,-1.35,-.95,.8,-.05,.7,.1],
  [.52,2.75,.75,-1.55,-1.5,-.7,.35,.05,.45,.25],
  [.6,4.2,.35,-.2,.15,-.75,.3,.45,-.35,.45],
  [1,6.5,-.3,-.35,.45,-.35,.2,.4,-.5,.15]];
function wfThrowPose(a,u){const A=a.arms,L=a.legs;if(!A||!L)return;let i=0;while(i<WF_TK.length-2&&u>WF_TK[i+1][0])i++;
  const P=WF_TK[i],Q=WF_TK[i+1],k=Math.max(0,Math.min(1,(u-P[0])/(Q[0]-P[0]))),e=k*k*(3-2*k),f=j=>P[j]+(Q[j]-P[j])*e;
  A[0].sh.rotation.x=f(1);A[0].sh.rotation.z=f(2);A[0].el.rotation.x=f(3);A[1].sh.rotation.x=f(4);A[1].sh.rotation.z=-.25;A[1].el.rotation.x=-.5;
  L[1].hp.rotation.x=f(5);L[1].kn.rotation.x=f(6);L[0].hp.rotation.x=f(9);L[0].kn.rotation.x=f(9)*.8;a.spine.rotation.x=f(7);a.hips.rotation.y=f(8);}
// the catcher: down in a crouch behind the plate, mitt up as a target
function wfCrouch(a){const A=a.arms,L=a.legs;if(!A||!L)return;for(const l of L){l.hp.rotation.x=-1.75;l.kn.rotation.x=2.35;}for(const [i,s] of [[0,1],[1,-1]])L[i].hp.rotation.z=s*.32;
  a.g.position.y-=.33;a.spine.rotation.x=.28;A[1].sh.rotation.x=-1.25;A[1].sh.rotation.z=-.15;A[1].el.rotation.x=-.55;A[0].sh.rotation.x=-.55;A[0].sh.rotation.z=.25;A[0].el.rotation.x=-1.1;}
function wfReach(a,up,t){const A=a.arms;if(!A)return;if(up){for(const [i,s] of [[0,1],[1,-1]]){A[i].sh.rotation.x=-2.6;A[i].sh.rotation.z=s*.15;A[i].el.rotation.x=-.4;}}
  else{for(const i of [0,1]){A[i].sh.rotation.x=-.9;A[i].el.rotation.x=-.2;}a.spine.rotation.x=.55;}}
const wfHand=(a,out,glove)=>{a.g.updateMatrixWorld(true);a.arms[glove?1:0].hand.localToWorld(out.set(0,-.06,glove?.06:.03));return Z.wiffle.g.worldToLocal(out);};

/* ---------- who is where ---------- */
const wfMe=()=>WF.meC||(WF.meC={me:1,a:av,n:'you',get piv(){return WF.myPiv;},get p(){return WF.myP;}});
function wfSpot(c,x,zz,face){c.p.set(x,0,zz);c.face=face;c.run=null;c.go=null;c.sit=false;c.spd=0;if(c.a&&!c.me&&c.a.emote&&c.a.emote.id==='chair')c.a.emote=null;}
const wfBaseAt=i=>{const [x,zz]=WB.base[i],[nx,nz]=WB.base[(i+1)%4],d=Math.hypot(nx-x,nz-zz),l=i?.55:0;return [x+(nx-x)/d*l,zz+(nz-zz)/d*l];};// a runner takes a little lead off the bag
// set everybody up for the next pitch
// full: a new half-inning (everybody to their spot); otherwise just the next pitch or the next batter (fielders walk back by themselves)
function wfLineUp(full){const C=wfCpu(),W=WB,bat=WF.half==='top';for(const c of Object.values(C)){c.piv.visible=false;c.chase=false;c.reach=null;c.swing=-1;c.crouch=false;}
  if(full){WF.ob=[null,null,null,null];for(const c of Object.values(C)){c.base=0;c.run=null;c.go=null;}}
  const D=bat?WF.def.op:{...WF.def.me,P:wfMe()};WF.pitcher=D.P;WF.catcher=D.C;WF.fielders=[D.P,D.IF,D.OF];D.C.crouch=true;
  for(const k of ['P','C','IF','OF']){const c=D[k];c.home=WF_POS[k];if((full||k==='C')&&!c.me)wfSpot(c,...WF_POS[k],k==='C'?Math.PI:0);}
  if(bat){WF.batter=wfMe();if(full)for(const c of WF.subs)wfBench(c,'me');}
  else{// the Bears bat in order; anybody already on base is skipped
    if(!WF.batter||WF.batter.me||WF.newAB){let n=0,b;do{b=WF.order[WF.nextOp%4];WF.nextOp++;}while(b.base&&++n<4);WF.batter=b;}
    const b=WF.batter;wfSpot(b,-.62,W.HP,Math.PI/2);b.base=0;b.piv.visible=true;
    if(full)for(const c of WF.order)if(c!==b)wfBench(c,'op');}
  WF.newAB=false;
  if(bat||full){WF.myP.set(...(bat?[-.62,0,W.HP]:[0,0,W.PZ]));WF.myFace=bat?Math.PI/2:0;}
  WF.myPiv.visible=bat;SP.wifBat=bat;WF.ball.m.visible=true;WF.ball.st='hand';WF.ball.by=null;wfRunnersShow();}
function wfBench(c,side){const L=side==='me'?WF.subs:WF.order,i=L.indexOf(c),[bx,bz]=WB.bench[side];c.run=null;c.go=null;c.base=0;
  c.p.set(bx+(side==='me'?.12:-.12),0,bz+(i-1.5)*.7);c.face=side==='me'?Math.PI/2:-Math.PI/2;c.sit=true;c.spd=0;if(!c.a.emote||c.a.emote.id!=='chair')c.a.play('chair');}
// walk (or jog) somewhere, then maybe sit down on the bench
function wfGo(c,x,zz,spd,then){c.sit=false;if(c.a.emote&&c.a.emote.id==='chair')c.a.emote=null;c.go={x,z:zz,spd,then};}
function wfToBench(c,side){const L=side==='me'?WF.subs:WF.order,i=Math.max(0,L.indexOf(c)),[bx,bz]=WB.bench[side];c.base=0;wfGo(c,bx+(side==='me'?.12:-.12),bz+(i-1.5)*.7,3.2,()=>wfBench(c,side));}
// whoever got on base: a Bears batter stays on as the runner; for you, a teammate from the bench comes in to run (a pinch runner)
function wfPutOn(i){const ob=WF.ob;if(WF.half==='top'){const c=WF.subs.find(c=>!c.base&&!c.run)||WF.subs.find(c=>!c.base);if(!c)return;
    if(c.a.emote&&c.a.emote.id==='chair')c.a.emote=null;c.sit=false;c.run=null;c.go=null;c.base=i;ob[i]=c;const [x,zz]=wfBaseAt(i);c.p.set(x,0,zz);}
  else{const b=WF.batter;if(!b||b.me)return;ob[i]=b;b.base=i;b.piv.visible=false;}}
// ball four: the batter takes first (the runners already moved up in wfAdvance)
function wfWalkOn(){if(WF.half==='top')wfPutOn(1);else{const b=WF.batter;wfPutOn(1);b.run={s:0,goal:WB.BD,spd:4};}}
function wfGoStep(c,dt){const g=c.go;if(!g)return;const dx=g.x-c.p.x,dz=g.z-c.p.z,d=Math.hypot(dx,dz);if(d<.08){c.go=null;c.spd=0;if(g.then)g.then();return;}
  const k=Math.min(d,g.spd*dt)/d;c.p.x+=dx*k;c.p.z+=dz*k;c.face=Math.atan2(dx,dz);c.spd=g.spd;}
function wfRunnersShow(){const d=document.querySelectorAll('#wfDia i');for(let i=0;i<3;i++)d[i]&&d[i].classList.toggle('on',!!WF.bases[i+1]);}
// the runners on base move up n bases (n 4: everybody scores); force: a walk, only the ones who have to
function wfAdvance(n,force){const ob=WF.ob,side=WF.half==='top'?'me':'op';
  const move=[];if(force){if(ob[1]){if(ob[2]){if(ob[3])move.push([3,4]);move.push([2,3]);}move.push([1,2]);}}
  else for(let i=3;i>=1;i--)if(ob[i])move.push([i,Math.min(4,i+n)]);
  for(const [i,j] of move){const c=ob[i];ob[i]=null;c.go=null;c.run={s:i*WB.BD,goal:j*WB.BD,spd:5.6,home:j>=4,side};if(j<4){ob[j]=c;c.base=j;}else c.base=0;}}
function wfRunnersStep(dt){for(const c of Object.values(WF.cpu)){if(c===WF.batter&&WF.phase==='play')continue;
    if(c.run&&(c!==WF.batter||c.base||c.run.home)){const going=wfRunner(c,dt);if(!going){const r=c.run;c.run=null;if(r.home)wfToBench(c,r.side);}}
    else if(c.base&&!c.run&&!c.go){const [x,zz]=wfBaseAt(c.base);c.p.set(x,0,zz);c.face=angDamp(c.face,Math.atan2(-x,WB.HP-zz)+.6,Math.min(1,dt*5));c.spd=0;}}}
/* ---------- starting, the menu, and the end ---------- */
if(!SAVE.sports.wif)SAVE.sports.wif={w:0,l:0,derby:0};
function wfMenu(){if(SP.mode||SP.menu)return;SP.menu=true;const S=SAVE.sports.wif,c=$('#spCard');
  c.innerHTML=`<h2>⚾ Baseball Field</h2><p>Your 🦅 Eagles (you, Leo, Marcus and Nora) against Maya's 🐻 Bears. Play ball!</p>
   <button class="spPick" data-k="game"><b>🧢</b><span><strong>Play a game</strong><small>3 innings, 3 outs each${S.w||S.l?` · Wins: ${S.w}`:''}</small></span></button>
   <button class="spPick" data-k="quick"><b>⚡</b><span><strong>Quick game</strong><small>1 inning: bat, then pitch</small></span></button>
   <button class="spPick" data-k="derby"><b>💥</b><span><strong>Home Run Derby</strong><small>10 swings. Hit it over the fence!${S.derby?` · Best: ${S.derby} 🏠`:''}</small></span></button>
   <details style="text-align:left;margin:6px 4px 10px;font-size:14px;color:var(--muted)"><summary style="font-weight:700;color:inherit">📖 How to play</summary>
   <p style="margin:6px 0">⚾ <b>Batting:</b> tap SWING when the ball gets to the plate. Too early pulls it to the left, too late goes right. Curveballs and sliders bend, so watch them all the way in!</p>
   <p style="margin:6px 0">📏 <b>Hits:</b> caught in the air is an out, and so is a ground ball stopped in the infield. Into the outfield is a single, deep is a double, to the wall a triple, over the fence a home run.</p>
   <p style="margin:6px 0">🏃 <b>Runners:</b> you bat every time for the Eagles. When you get on base, a teammate comes in to run for you.</p>
   <p style="margin:6px 0">🎯 <b>Pitching:</b> pick a pitch, then tap PITCH when the target is where you want the ball. Corners are hard to hit, but miss the zone 4 times and they walk.</p></details>
   <button class="btn ghost" id="spNo">Not now</button>`;
  spSuitBtn(c,'batting');
  c.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>wfStart(b.dataset.k));
  $('#spNo').onclick=spCloseMenu;$('#spMenu').classList.add('show');sfx('pop');}
function wfStart(kind){spCloseMenu();const z=Z.wiffle;wfCpu();
  if(!WF.ball)WF.ball={m:wfBallMesh(),p:new THREE.Vector3(),v:new THREE.Vector3()};
  if(WF.myPiv&&WF.myPiv.parent)WF.myPiv.parent.remove(WF.myPiv);WF.myPiv=new THREE.Group();WF.myPiv.add(wfBatMesh());av.g.add(WF.myPiv);
  Object.assign(WF,{on:true,kind,inn:1,max:kind==='game'?3:1,half:'top',outs:0,balls:0,strikes:0,bases:[0,0,0,0],me:0,op:0,line:{me:[],op:[]},
    phase:'set',t:0,nextOp:0,swings:0,hr:0,far:0,hits:0,ks:0,myP:new THREE.Vector3(),myFace:0,my:WF_PITCH[WF.my]?WF.my:'fast',last:null,res:null,msg:'',ob:[null,null,null,null],batter:null,newAB:false});
  WF.cam.init=false;SP.mode='wif';WB.backstop.visible=false;SP.z=z;SP.menu=false;
  closeMap&&closeMap();joy.id=null;joy.x=joy.y=0;$('#joy').style.display='none';
  spBody(true,false);document.body.classList.add('sp-bat','wf-on');setTrack('stadium');
  wfLineUp(true);wfBoard();wfHudNow();did('wiffle','start');
  toast(kind==='derby'?'Home Run Derby! 10 swings. Tap SWING when the ball gets to you 💥':'Play ball! You\'re up first. Tap SWING when the ball gets to the plate ⚾');}
function wfStop(){WF.on=false;WB.backstop.visible=true;document.body.classList.remove('sp-bat','wf-on','wf-pick');SP.wifBat=false;if(WF.myPiv&&WF.myPiv.parent)WF.myPiv.parent.remove(WF.myPiv);
  if(WF.ball){WF.ball.m.visible=false;WF.ball.st='gone';}if(WF.ret)WF.ret.visible=false;WB.zoneBox.visible=false;WF.ob=[null,null,null,null];
  for(const a of av.arms||[])a.hand.rotation.set(0,0,0);wfIdle();wfBoard();}
function wfEnd(show,quit){const k=WF.kind;wfStop();if(!show)return;let h='',coins=0,best=false;const S=SAVE.sports.wif;
  if(quit)h=`<h2>👋 You left the game</h2><div class="spBig">${k==='derby'?`${WF.hr} 🏠`:`${WF.me} - ${WF.op}`}</div><p>Finish a whole game to earn coins!</p>`;
  else if(k==='derby'){coins=WF.hr*3+(WF.hr?2:0);if(WF.hr>(S.derby||0)){S.derby=WF.hr;best=true;persist();}if(WF.hr>=5)did('wiffle','derby5');
    h=`<h2>${WF.hr>=5?'💥 Slugger!':WF.hr?'⚾ Nice hitting!':'⚾ Good try!'}</h2><div class="spBig">${WF.hr} 🏠</div><p>${WF.far?`Longest hit: ${WF.far} ft`:'Swing when the ball gets to the plate!'}${best?' · New best! 🎉':''}</p>`;}
  else{const win=WF.me>WF.op,tie=WF.me===WF.op;coins=(win?30:tie?15:10)*(k==='game'?1:.5);did('wiffle','game');
    if(win){S.w=(S.w||0)+1;did('wiffle','win');did('sport','wifwin');}else if(!tie)S.l=(S.l||0)+1;persist();
    h=`<h2>${win?'🏆 You win!':tie?'🤝 It\'s a tie!':'😅 The Bears win this time'}</h2><div class="spBig">${WF.me} - ${WF.op}</div><p>${win?'Your Eagles beat Maya\'s Bears!':'Hit it into the outfield and try again!'}${WF.hits?` · ${WF.hits} hits`:''}${WF.ks?` · ${WF.ks} strikeouts`:''}</p>`;}
  if(quit)coins=0;coins=Math.round(coins);if(coins>0){earn(coins,'sports');h+=`<p>🪙 +${coins} coins</p>`;}
  $('#spCard').innerHTML=h+`<button class="btn" id="spAgain">🔁 Play again</button> <button class="btn ghost" id="spDone">Done</button>`+(spCanUnsuit()?`<br><button class="btn ghost" id="spUnsuit">👗 Back to my outfit</button>`:'');
  if(spCanUnsuit())$('#spUnsuit').onclick=()=>{spUnsuit();spCloseMenu();};
  $('#spAgain').onclick=()=>{spCloseMenu();wfMenu();};$('#spDone').onclick=spCloseMenu;
  SP.menu=true;$('#spMenu').classList.add('show');if(coins>=10||best)sfx('tada');}
SP.ext.wif={step:(dt,t)=>wfStep(dt,t),press:()=>wfPress(),cam:dt=>wfCam(dt),end:(s,q)=>wfEnd(s,q)};

/* ---------- the scoreboard and the HUD ---------- */
function wfBoard(){const {cv,t}=WB.board,x=cv.getContext('2d');x.fillStyle='#14211a';x.fillRect(0,0,768,384);x.strokeStyle='#f2c230';x.lineWidth=8;x.strokeRect(6,6,756,372);
  x.textBaseline='middle';x.fillStyle='#f2c230';x.font='700 44px Fredoka, sans-serif';x.textAlign='center';
  if(!WF.on){x.fillText('⚾ BASEBALL FIELD',384,120);x.fillStyle='#ffffff';x.font='600 34px Fredoka, sans-serif';x.fillText('Step on the green pad to play!',384,200);
    const S=SAVE.sports.wif||{};x.fillStyle='#8fe3a0';x.fillText(`Wins ${S.w||0} · Derby best ${S.derby||0} 🏠`,384,270);t.needsUpdate=true;return;}
  if(WF.kind==='derby'){x.fillText('💥 HOME RUN DERBY',384,70);x.font='700 120px Fredoka, sans-serif';x.fillStyle='#ffffff';x.fillText(`${WF.hr}`,240,200);x.fillText(`${Math.max(0,10-WF.swings)}`,540,200);
    x.font='600 30px Fredoka, sans-serif';x.fillStyle='#8fe3a0';x.fillText('HOMERS',240,290);x.fillText('SWINGS LEFT',540,290);t.needsUpdate=true;return;}
  const n=Math.max(WF.max,WF.inn),cw=Math.min(70,330/n),x0=300;x.font='700 30px Fredoka, sans-serif';x.fillStyle='#8fe3a0';
  for(let i=0;i<n;i++)x.fillText(String(i+1),x0+cw*(i+.5),60);x.fillText('R',x0+cw*n+50,60);
  for(const [row,k,name,col] of [[0,'me',WF_TEAMS.me.n,WF_TEAMS.me.hud],[1,'op',WF_TEAMS.op.n,WF_TEAMS.op.hud]]){const y=130+row*80;x.textAlign='left';x.fillStyle=col;x.font='700 34px Fredoka, sans-serif';x.fillText(name,30,y);x.textAlign='center';x.fillStyle='#ffffff';
    for(let i=0;i<n;i++){const v=WF.line[k][i];x.fillText(v==null?'':String(v),x0+cw*(i+.5),y);}x.fillStyle='#f2c230';x.font='700 44px Fredoka, sans-serif';x.fillText(String(WF[k]),x0+cw*n+50,y);}
  x.font='600 32px Fredoka, sans-serif';x.fillStyle='#ffffff';x.textAlign='center';
  x.fillText(`BALL ${WF.balls}   STRIKE ${WF.strikes}   OUT ${WF.outs}`,384,320);t.needsUpdate=true;}
function wfHudNow(){const sc=WF.kind==='derby'?`${WF.hr} 🏠`:`${WF.me} - ${WF.op}`,
    info=WF.kind==='derby'?`${Math.max(0,10-WF.swings)} swings left`:`${WF.half==='top'?'▲':'▼'}${WF.inn} · ${WF.balls}-${WF.strikes} · ${WF.outs} out${WF.outs===1?'':'s'}`;
  spHud(WF.kind==='derby'?'💥 Derby':WF.half==='top'?'⚾ You bat':'🎯 You pitch',sc,WF.msg||info);
  wfRunnersShow();}
const wfSay=(t,ms)=>{banner(t);WF.msg='';};

/* ---------- pitching ---------- */
// throw from `from` so the ball crosses the plate at (ax, ay): the break (ax, ay of the pitch kind) is put in, and the start speed is worked out to still end there
function wfPitch(kind,from,ax,ay){const P=WF_PITCH[kind],b=WF.ball,T=(WB.HP-from.z)/P.spd;b.kind=kind;b.p0=from.clone();b.T=T;
  b.A=new THREE.Vector3(P.ax*(WF.kind==='derby'?.3:1),-SP_G+P.ay*(WF.kind==='derby'?.3:1),0);
  b.v0=new THREE.Vector3((ax-from.x-.5*b.A.x*T*T)/T,(ay-from.y-.5*b.A.y*T*T)/T,P.spd);b.p.copy(from);b.t=0;b.st='pitch';b.cross=new THREE.Vector3(ax,ay,WB.HP);
  b.inZ=Math.abs(ax)<=WB.ZX+WB.BR*.5&&ay>=WB.ZY0-WB.BR*.5&&ay<=WB.ZY1+WB.BR*.5;
  b.off=Math.hypot(Math.max(0,Math.abs(ax)-WB.ZX),Math.max(0,WB.ZY0-ay,ay-WB.ZY1));b.swung=false;b.called=false;b.bounces=0;b.first=null;b.wall=false;b.hr=false;b.caught=false;b.fielded=null;
  tone(220,.16,'sawtooth',.05,0,110);}
// Maya picks a pitch and a spot: mostly strikes, a few just off the plate; slower and fatter in the Derby
function wfCpuPitch(){const D=WF.kind==='derby',inn=WF.inn,r=Math.random();
  const kind=D?(r<.75?'fast':'change'):rnd(inn===1?['fast','fast','curve','change','slider']:['fast','curve','slider','change','fast']);
  const strike=D||Math.random()<.8;let x,y;
  if(strike){x=(Math.random()-.5)*2*WB.ZX*(D?.55:.85);y=(WB.ZY0+WB.ZY1)/2+(Math.random()-.5)*(WB.ZY1-WB.ZY0)*(D?.5:.85);}
  else{const s=Math.random()<.5?-1:1;if(Math.random()<.5){x=s*(WB.ZX+.08+Math.random()*.14);y=.8+(Math.random()-.5)*.5;}else{x=(Math.random()-.5)*.4;y=s<0?WB.ZY0-.1-Math.random()*.12:WB.ZY1+.1+Math.random()*.15;}}
  return {kind,x,y};}
// the 🎯 target you pitch at: it drifts round the strike zone (and a little outside it)
function wfReticle(t){if(!WF.ret){const m=new THREE.Mesh(new THREE.RingGeometry(.06,.085,32),new THREE.MeshBasicMaterial({color:'#ff3b6b',transparent:true,opacity:.95,depthTest:false,side:THREE.DoubleSide}));
    m.add(new THREE.Mesh(new THREE.CircleGeometry(.018,16),m.material));m.renderOrder=5;Z.wiffle.g.add(m);WF.ret=m;}
  const k=WF.retT=(WF.retT||0)+.016*(1+WF.inn*.12);WF.ret.position.set(.37*Math.sin(t*1.7+k),.8+.42*Math.sin(t*2.35+.7),WB.HP+.02);return WF.ret.position;}
// how a computer batter reacts to your pitch: swing or take, and hit it or miss
function wfCpuDecide(){const b=WF.ball,c=b.cross;const edge=b.inZ?Math.max(Math.abs(c.x)/WB.ZX,Math.abs(c.y-.8)/.35):1;
  const swing=Math.random()<(b.inZ?.74:b.off>.2?.12:.32);if(!swing)return null;
  let pc=.6-.28*edge-(b.kind==='fast'?.06:0)+(WF.last===b.kind?.16:0)-(b.inZ?0:.3)-.03*(WF.inn-1);pc=Math.max(.08,Math.min(.85,pc));
  const hit=Math.random()<pc;let e;if(hit){e=(Math.random()+Math.random()+Math.random()-1.5)*.12;e=Math.max(-.15,Math.min(.15,e));}else e=(Math.random()<.5?-1:1)*(.19+Math.random()*.1);
  return {at:b.T-.14+e,e,hit};}

/* ---------- hitting ---------- */
function wfPress(){if(!WF.on||SP.menu)return;const ph=WF.phase;
  if(ph==='run'||ph==='after'){WF.skip=true;return;}
  if(WF.half==='top'){if(WF.batter.me&&WF.mySwing==null&&(ph==='pitch'||ph==='wind'||ph==='set')){WF.mySwing=0;WF.ball.swung=WF.ball.swung||ph==='pitch';tone(260,.12,'sine',.07,0,520);}}
  else if(ph==='pick'&&WF.ret){WF.phase='wind';WF.t=0;const r=WF.ret.position;WF.aim=[r.x+(Math.random()-.5)*.05,r.y+(Math.random()-.5)*.05];WF.ret.visible=false;document.body.classList.remove('wf-pick');sfx('pop');}}
// the bat meets the ball. e: how early (-) or late (+) in seconds, q: how good the contact is (0..1)
function wfHit(e,q){const b=WF.ball;b.st='fly';b.t=0;b.swung=true;
  let ang=(e/.13)*.75+(Math.random()-.5)*.14,ex,la;
  if(q<.25&&Math.random()<.25){ex=11+Math.random()*3;la=1.05+Math.random()*.25;}// a pop-up
  else{ex=9+q*q*15+Math.random();la=q<.25?.02+Math.random()*.12:.04+q*.44+(Math.random()-.5)*.16;}
  b.v.set(Math.sin(ang)*Math.cos(la)*ex,Math.sin(la)*ex,-Math.cos(ang)*Math.cos(la)*ex);b.p.z=Math.min(b.p.z,WB.HP-.05);
  b.bounces=0;b.first=null;b.wall=false;b.hr=false;b.caught=false;b.fielded=null;b.foul=false;b.t=0;b.q=q;
  tone(q>.8?1700:1150,.05,'square',.12);tone(q>.8?900:640,.08,'triangle',.1,.01);if(q>.85){spCheer();burst(Z.wiffle.g.localToWorld(b.p.clone()),'#ffd23f',26,3);}
  WF.phase='play';WF.t=0;WF.land=wfLand();
  {const L=WF.land,d=c=>{const p=c.me?WF.myP:c.p;return Math.hypot(p.x-L.x,p.z-L.z);},by=[...WF.fielders].sort((a,b)=>d(a)-d(b));
   for(const c of WF.fielders){c.chase=c!==by[2];c.react=.35+Math.random()*.2;}}
  // the batter drops the bat and runs for first
  const B=WF.batter;if(B.piv)B.piv.visible=false;if(B.me)SP.wifBat=false;
  if(WF.kind!=='derby')wfRunStart(B);}
// where a ball in the air comes down (a quick look ahead with the same physics)
function wfLand(){const b=WF.ball,p=b.p.clone(),v=b.v.clone(),h=.02;for(let i=0;i<400;i++){wfAir(p,v,h);if(p.y<=WB.BR)break;}return p;}
function wfAir(p,v,h){const s=v.length();v.y-=SP_G*h;v.addScaledVector(v,-WB.KD*s*h);p.addScaledVector(v,h);}
function wfBallStep(dt){const b=WF.ball,W=WB,n=4,h=dt/n;b.t+=dt;
  for(let k=0;k<n;k++){const [,d0]=wfPol(b.p.x,b.p.z);wfAir(b.p,b.v,h);const [th,d]=wfPol(b.p.x,b.p.z),fair=Math.abs(th)<=W.FAIR+.01;
    // over the fence, or off it
    if(!b.hr&&!b.foul&&fair&&d0<W.FR&&d>=W.FR-W.BR&&b.bounces===0){if(b.p.y>1.22){b.hr=true;}else{const nx=b.p.x/d,nz=(b.p.z-W.HP)/d,vn=b.v.x*nx+b.v.z*nz;if(vn>0){b.v.x-=1.4*vn*nx;b.v.z-=1.4*vn*nz;b.wall=true;tone(150,.08,'square',.06);}}}
    if(!b.hr&&d>W.FR&&d0<=W.FR&&b.p.y<1.2&&fair){const nx=b.p.x/d,nz=(b.p.z-W.HP)/d;b.p.x=nx*(W.FR-W.BR);b.p.z=W.HP+nz*(W.FR-W.BR);}
    if(b.p.y<W.BR){b.p.y=W.BR;
      if(b.v.y<-.7){if(!b.bounces){b.first={th,d};if(!fair&&d<W.FR)b.foul=true;}b.bounces++;b.v.y=-b.v.y*.42;b.v.x*=.76;b.v.z*=.76;if(b.bounces<5)tone(420+Math.random()*80,.03,'sine',.05);}
      else{b.v.y=0;const f=Math.max(0,1-2.6*h);b.v.x*=f;b.v.z*=f;}
      // a grounder that rolls foul before it gets past the bases is a foul ball
      if(!b.foul&&b.bounces&&!fair&&d<W.BD+.5&&!b.fielded&&b.first&&b.first.d<W.BD)b.foul=true;}
    // the backstop behind home
    if(b.p.z>W.HP+3.2){b.p.z=W.HP+3.2;b.v.z*=-.3;}}
  b.m.position.copy(b.p);b.m.rotation.x+=dt*b.v.z*6;b.m.rotation.z-=dt*b.v.x*6;}

/* ---------- running the bases ---------- */
const wfPath=s=>{const W=WB,i=Math.min(3,Math.floor(s/W.BD)),u=s/W.BD-i,a=W.base[i],b=W.base[(i+1)%4];return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,b];};
function wfRunStart(B){B.run={s:0,goal:WB.BD,spd:B.me?6.2:5.6};}
function wfRunner(B,dt){const r=B.run;if(!r)return false;const p=B.me?WF.myP:B.p;
  if(r.s<r.goal){r.s=Math.min(r.goal,r.s+r.spd*dt);const [x,zz,nb]=wfPath(Math.min(r.s,4*WB.BD-.001));const f=Math.atan2(nb[0]-x,nb[1]-zz);p.set(x,0,zz);
    if(B.me){WF.myFace=f;player.speed=r.spd;}else{B.face=f;B.spd=r.spd;}return true;}
  if(B.me)player.speed=0;else B.spd=0;return false;}

/* ---------- fielders ---------- */
function wfFieldStep(dt){const b=WF.ball,W=WB;
  for(const c of WF.fielders){const p=c.me?WF.myP:c.p;if(!c.chase)continue;if((c.react-=dt)>0)continue;
    if(!c.chase)continue;let tx,tz;if(b.bounces===0&&!b.hr){tx=WF.land.x;tz=WF.land.z;}else{tx=b.p.x+b.v.x*.3;tz=b.p.z+b.v.z*.3;}
    // the pitcher leaves the deep ones to the outfielder
    if(c===WF.fielders[0]&&wfPol(tx,tz)[1]>11.5||c===WF.fielders[1]&&wfPol(tx,tz)[1]>14){tx=c.home[0];tz=c.home[1];}
    const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),spd=c===WF.fielders[0]?3.6:4.3;
    if(d>.12){const k=Math.min(d,spd*dt)/d;p.x+=dx*k;p.z+=dz*k;const f=Math.atan2(dx,dz);if(c.me){WF.myFace=f;player.speed=spd;}else{c.face=f;c.spd=spd;}}else if(c.me)player.speed=0;else c.spd=0;
    const bd=Math.hypot(b.p.x-p.x,b.p.z-p.z);c.reach=bd<2.2?(b.p.y>1.2?'up':'low'):null;
    if(b.hr||b.foul||b.caught||b.fielded)continue;
    if(b.bounces===0&&bd<.62&&b.p.y<1.9&&b.p.y>.15){b.caught=c;tone(300,.06,'square',.12);wfResolve();return;}
    if(b.bounces>0&&bd<.65&&b.p.y<1&&Math.hypot(b.v.x,b.v.z)<9){b.fielded={c,d:wfPol(b.p.x,b.p.z)[1]};tone(260,.05,'square',.1);wfResolve();return;}}}
// the ball is caught, stopped, over the fence or foul: work out what it was
function wfResolve(){const b=WF.ball,W=WB,B=WF.batter;let r;
  if(b.hr)r={n:4,t:'💥 HOME RUN!'};
  else if(b.foul)r={foul:1,t:'Foul ball!'};
  else if(b.caught)r={out:1,t:`🧤 Caught by ${b.caught.me?'you':b.caught.n}! Out!`};
  else{const gd=b.first?b.first.d:0,fd=b.fielded?b.fielded.d:gd;
    if(gd<W.INF&&fd<W.INF)r={out:1,t:`Grounded out to ${b.fielded&&b.fielded.c.me?'you':b.fielded?b.fielded.c.n:'the pitcher'}!`};
    else{let d=gd>=W.INF?gd:fd;if(b.wall)d=Math.max(d,W.L3);const n=d<W.L2?1:d<W.L3?2:3;r={n,t:['','⚾ Single!','⚾⚾ Double!','🔥 Triple!'][n]};}}
  WF.res=r;const ft=Math.round((b.first?b.first.d:b.fielded?b.fielded.d:W.FR+3)*W.FT);
  if(WF.kind==='derby'){WF.swings++;if(r.n===4){WF.hr++;WF.far=Math.max(WF.far,Math.max(ft,Math.round(W.FR*W.FT)+5+Math.round(Math.random()*60)));spCheer();sfx('tada');did('wiffle','HR');wfFireworks();wfSay(`💥 HOME RUN! (${WF.hr})`);}
    else wfSay(r.foul?'Foul ball!':r.out?'Out! No homer':`${ft} ft. Not quite out!`);WF.phase='after';WF.t=0;wfBoard();wfHudNow();return;}
  if(r.foul){if(WF.strikes<2)WF.strikes++;wfSay(WF.strikes<2?'Foul ball! Strike '+WF.strikes:'Foul ball!');B.run=null;WF.myRun=null;WF.phase='after';WF.t=0;wfBoard();wfHudNow();return;}
  if(r.out){WF.outs++;WF.abDone=true;wfSay(r.t);if(B.run)B.run.goal=Math.min(B.run.s,WB.BD);WF.phase='run';WF.t=0;wfNextBatterCount();wfBoard();wfHudNow();return;}
  // a hit: the batter runs to the base, the runners on base move up the same number of bases
  let runs=0;for(let i=3;i>=1;i--)if(WF.bases[i]){WF.bases[i]=0;if(i+r.n>=4)runs++;else WF.bases[i+r.n]=1;}wfAdvance(r.n);
  if(r.n===4)runs++;WF.pend=r.n<4?r.n:0;
  if(B.run){B.run.goal=r.n*WB.BD;if(r.n===4)B.run.spd=B.me?5.4:5;}
  wfScore(runs);const mine=WF.half==='top';
  wfSay(r.t+(runs?` ${runs} run${runs>1?'s':''} score${runs>1?'':'s'}!`:''));
  if(mine){WF.hits++;did('wiffle',['','1B','2B','3B','HR'][r.n]);if(r.n>=3||runs)spCheer();if(r.n===4){sfx('tada');wfFireworks();}}else if(r.n===4)tone(200,.3,'sine',.06);
  WF.abDone=true;WF.balls=0;WF.strikes=0;WF.phase='run';WF.t=0;wfBoard();wfHudNow();}
function wfScore(runs){if(!runs)return;const k=WF.half==='top'?'me':'op';WF[k]+=runs;const i=WF.inn-1;WF.line[k][i]=(WF.line[k][i]||0)+runs;}
function wfFireworks(){for(let k=0;k<4;k++)setTimeout(()=>{if(!WF.on)return;const [x,zz]=wfAt((Math.random()-.5)*1.2,WB.FR+1);burst(Z.wiffle.g.localToWorld(new THREE.Vector3(x,4+Math.random()*2,zz)),rnd(['#ffd23f','#4fb6ff','#ff6fae','#ffffff']),45,4);},k*260);}
function wfNextBatterCount(){WF.balls=0;WF.strikes=0;}
function wfCall(){const b=WF.ball;b.called=true;if(b.st==='pitch'){b.st='held';b.held=WF.catcher;}
  if(WF.kind==='derby'){if(b.inZ){WF.swings++;wfSay(WF.mySwing!=null?'Swing and a miss!':'Strike! Counts as a swing');}else wfSay('Ball. Wait for a good one!');WF.phase='after';WF.t=0;wfBoard();wfHudNow();return;}
  const sw=b.swung;if(b.inZ||sw){WF.strikes++;if(WF.strikes>=3){WF.outs++;WF.abDone=true;wfSay(sw?'Strike three! Out!':'Strike three, looking! Out!');if(WF.half==='bot'){WF.ks++;did('wiffle','k');}wfNextBatterCount();}else wfSay(sw?`Swing and a miss! Strike ${WF.strikes}`:`Strike ${WF.strikes}!`);}
  else{WF.balls++;if(WF.balls>=4){wfSay('Ball four! Walk');const B=WF.bases;// a walk pushes the runners up only if they have to move
      WF.abDone=true;wfAdvance(1,true);let runs=0;if(B[1]){if(B[2]){if(B[3])runs++;B[3]=1;}B[2]=1;}B[1]=1;wfScore(runs);wfNextBatterCount();WF.pend=0;wfWalkOn();}else wfSay(`Ball ${WF.balls}`);}
  WF.phase='after';WF.t=0;wfBoard();wfHudNow();}

/* ---------- the half-innings ---------- */
function wfNext(){const W=WF;
  if(W.kind==='derby'){if(W.swings>=10){spEnd(true,false);return;}wfLineUp(false);W.phase='set';W.t=0;wfHudNow();return;}
  const mine=W.half==='top';
  // the batter who got on base: a Bears batter stays there as the runner, for you a teammate comes in to run
  if(W.pend){W.bases[W.pend]=1;wfPutOn(W.pend);W.pend=0;}let full=false;
  if(!mine&&W.abDone&&W.batter&&!W.batter.me){const b=W.batter;b.piv.visible=false;if(!b.base){b.run=null;wfToBench(b,'op');}W.newAB=true;}
  // the home team (Maya and Sam) win as soon as they go ahead in their last turn
  if(!mine&&W.inn>=W.max&&W.op>W.me){spEnd(true,false);return;}
  if(W.outs>=3){W.outs=0;W.balls=0;W.strikes=0;W.bases=[0,0,0,0];W.line[mine?'me':'op'][W.inn-1]=W.line[mine?'me':'op'][W.inn-1]||0;
    full=true;W.abDone=false;
    if(mine){if(W.inn>=W.max&&W.op>W.me){spEnd(true,false);return;}W.half='bot';W.nextOp=W.nextOp||0;banner('🔄 3 outs! Your turn to pitch');W.my=W.my||'curve';}
    else{if(W.inn>=W.max&&W.me!==W.op){spEnd(true,false);return;}if(W.inn>=W.max+2){spEnd(true,false);return;}W.inn++;W.half='top';banner(W.inn>W.max?`⏱️ Extra innings! Inning ${W.inn}`:`⚾ Inning ${W.inn}. You're up!`);}}
  W.abDone=false;wfLineUp(full);W.phase='set';W.t=0;W.msg='';wfBoard();wfHudNow();}

/* ---------- every frame ---------- */
function wfStep(dt,t){if(!WF.on)return;const W=WB,b=WF.ball,z=Z.wiffle;WF.t+=dt;const ph=WF.phase,bat=WF.half==='top',P=WF.pitcher,Bt=WF.batter;
  // your own swing (as the batter)
  if(WF.mySwing!=null){WF.mySwing+=dt;
    if(b.st==='pitch'&&!WF.myHitDone&&WF.mySwing>=.14){WF.myHitDone=true;b.swung=true;const e=(b.p.z-W.HP)/b.v0.z,lim=.19*Math.max(0,1-b.off*2.4);
      if(Math.abs(e)<=lim&&b.off<.3&&b.p.z>W.HP-2){const q=Math.max(0,1-Math.abs(e)/.19-b.off*1.6);wfHit(e,q);}else if(WF.kind!=='derby'||b.inZ)wfSay(e<0?'Too early!':'Too late!');}
    if(WF.mySwing>.6){WF.mySwing=null;WF.myHitDone=false;}}
  // the pitcher: set, wind up, throw
  const Pp=P.me?WF.myP:P.p,home=Math.hypot(Pp.x,Pp.z-W.PZ)<.35;
  if(ph==='set'){if(b.st!=='toss')b.st='hand';if(!home){}else if(!bat){if(WF.t>.7){WF.phase='pick';WF.t=0;document.body.classList.add('wf-pick');wfPitchBtns();if(WF.ret)WF.ret.visible=true;}}
    else if(WF.t>1.1&&b.st==='hand'){WF.phase='wind';WF.t=0;WF.cp=wfCpuPitch();}}
  if(ph==='pick'){wfReticle(t);WF.ret.visible=true;}
  const throwing=ph==='wind'||(ph==='pitch'&&b.t<.5);
  if(ph==='wind'&&WF.t>=WF_THROW*WF_REL){const from=wfHand(P.me?av:P.a,new THREE.Vector3());from.z=Math.max(from.z,W.PZ+.3);
    if(bat){wfPitch(WF.cp.kind,from,WF.cp.x,WF.cp.y);WF.msg=WF_PITCH[WF.cp.kind].n;}
    else{wfPitch(WF.my,from,WF.aim[0],WF.aim[1]);WF.cd=wfCpuDecide();WF.msg=WF_PITCH[WF.my].n;}
    WF.phase='pitch';WF.t=0;wfHudNow();}
  // the pitch flying in, with its break
  if(WF.phase==='pitch'&&b.st==='pitch'){b.t+=dt;const tt=b.t;b.p.copy(b.p0).addScaledVector(b.v0,tt).addScaledVector(b.A,.5*tt*tt);
    // the computer batter swings on time (or not)
    if(!bat&&WF.cd&&Bt.swing<0&&tt>=WF.cd.at)Bt.swing=0;
    if(!bat&&WF.cd&&Bt.swing>=.14&&!WF.cd.done){WF.cd.done=true;b.swung=true;if(WF.cd.hit)wfHit(WF.cd.e,Math.max(0,1-Math.abs(WF.cd.e)/.19-b.off*1.6-Math.random()*.2));}
    if(b.st==='pitch'&&tt>=b.T+.35&&!b.called)wfCall();
    // past the plate the pitch pops into the catcher's mitt (it's still "in the air" for a late swing until the call)
    if(b.st==='pitch'||b.st==='held'&&b.held===WF.catcher){const mitt=wfHand(WF.catcher.a,_wfV,1);
      if(b.st==='held'||b.p.z>=mitt.z-.05){b.m.position.copy(mitt);if(!b.hitNet){b.hitNet=true;tone(150,.07,'square',.12);tone(90,.05,'sine',.1,.01);}}else b.m.position.copy(b.p);}
    b.m.rotation.y+=dt*30;}
  if(b.st==='drop'){b.v.y-=SP_G*dt;b.p.addScaledVector(b.v,dt);if(b.p.y<W.BR){b.p.y=W.BR;b.v.y=0;}b.m.position.copy(b.p);if(WF.phase==='pitch'&&b.t>=b.T+.35&&!b.called)wfCall();b.t+=dt;}
  if(WF.phase==='pitch'&&b.st==='pitch'&&b.t>b.T+1)wfCall();
  // the ball in play
  if(WF.phase==='play'||(WF.phase==='run'&&b.st==='fly')||(WF.phase==='after'&&b.st==='fly')){if(b.st==='fly'){if(!b.caught&&!b.fielded)wfBallStep(dt);
      if(WF.phase==='play'){if(Bt.run)wfRunner(Bt,dt);wfFieldStep(dt);
        if(WF.phase==='play'&&(b.hr||b.foul))wfResolve();
        if(WF.phase==='play'&&WF.t>8){b.fielded={c:WF.fielders[1],d:wfPol(b.p.x,b.p.z)[1]};wfResolve();}}
      if(b.caught||b.fielded){const c=(b.caught||b.fielded.c);b.held=c;b.st='held';}
      if(b.hr&&b.t>3.5){b.st='gone';b.m.visible=false;}}}
  if(b.st==='held'){const c=b.held;wfHand(c.me?av:c.a,b.p,c===WF.catcher);b.m.position.copy(b.p);}
  // runners
  if(WF.phase==='run'){const going=Bt.run?wfRunner(Bt,dt):false;if(!going&&(WF.t>1.4||WF.skip)){WF.skip=false;WF.phase='after';WF.t=0;}
    if(WF.skip&&Bt.run){Bt.run.s=Bt.run.goal;}}
  if(WF.phase==='after'){if(Bt.run)wfRunner(Bt,dt);
    // the ball goes back to the pitcher
    if(b.st==='held'&&WF.t>.5&&b.held!==P){const c=b.held,from=wfHand(c.me?av:c.a,new THREE.Vector3(),c===WF.catcher),to=new THREE.Vector3((P.me?WF.myP:P.p).x,1.2,(P.me?WF.myP:P.p).z);
      b.st='toss';b.from=from;b.to=to;b.tt=0;b.dur=Math.min(1.4,.4+from.distanceTo(to)/14);}
    if(WF.t>(WF.skip?.2:1.5)&&b.st!=='toss'){WF.skip=false;WF.mySwing=null;WF.myHitDone=false;b.hitNet=false;WF.cd=null;wfNext();return;}}
  if(b.st==='toss'){b.tt+=dt;const u=Math.min(1,b.tt/b.dur);b.p.lerpVectors(b.from,b.to,u);b.p.y+=Math.sin(u*Math.PI)*b.dur*1.6;b.m.position.copy(b.p);if(u>=1)b.st='hand';}
  // fielders drift back to their spots between pitches
  if(WF.phase==='set'||WF.phase==='pick'||WF.phase==='after'&&b.st!=='fly'){for(const c of WF.fielders){const p=c.me?WF.myP:c.p,dx=c.home[0]-p.x,dz=c.home[1]-p.z,d=Math.hypot(dx,dz);c.chase=false;c.reach=null;
      if(d>.05){const k=Math.min(d,4.5*dt)/d;p.x+=dx*k;p.z+=dz*k;if(c.me){WF.myFace=Math.atan2(dx,dz);player.speed=4.5;}else{c.face=Math.atan2(dx,dz);c.spd=4.5;}}else{const f=Math.atan2(-p.x,W.HP-p.z);if(c.me){player.speed=0;WF.myFace=angDamp(WF.myFace,f,Math.min(1,dt*6));}else{c.spd=0;c.face=angDamp(c.face,f,Math.min(1,dt*6));}}}}
  if(b.st==='hand'){const h=wfHand(P.me?av:P.a,b.p);b.m.position.copy(h);}
  // move and pose everybody
  const C=WF.cpu;wfRunnersStep(dt);for(const c of Object.values(C))if(c.go)wfGoStep(c,dt);
  WB.zoneBox.visible=WF.kind!=='derby'&&b.st!=='fly'&&(ph==='set'||ph==='wind'||ph==='pitch'||ph==='pick');
  for(const c of Object.values(C)){const a=c.a;if(c===Bt&&!c.run||c.crouch)c.spd=0;a.g.position.copy(c.p);a.g.rotation.y=c.face;a.update(dt,c.spd||0,false);if(a.tag)a.tag.visible=!(c.crouch&&bat);
    if(c===Bt){if(c.swing>=0){c.swing+=dt;if(c.swing>.6)c.swing=-1;}if(c.piv.visible)wfBatPose(a,c.piv,c.swing);}
    else if(c===P&&(throwing||WF.phase==='set'||WF.phase==='pick')){wfThrowPose(a,ph==='wind'?WF.t/WF_THROW:ph==='pitch'?Math.min(1,(WF_THROW*WF_REL+b.t)/WF_THROW):0);}
    else if(c.crouch){wfCrouch(a);if(b.cross&&(ph==='pitch'||ph==='wind')){a.arms[1].sh.rotation.x=-1.2-(b.cross.y-.8)*1.6;a.arms[1].sh.rotation.z=-.15+b.cross.x*1.4;}}
    else if(c.reach)wfReach(a,c.reach==='up',t);}
  // you
  spSetWorld(z,WF.myP.x,WF.myP.z);player.pos.y=groundAt(player.pos.x,player.pos.z);player.face=WF.myFace+z.rot;av.g.position.copy(player.pos);av.g.rotation.y=player.face;
  if(Bt.me&&WF.myPiv.visible)wfBatPose(av,WF.myPiv,WF.mySwing==null?-1:WF.mySwing);
  else if(P.me&&(throwing||WF.phase==='set'||WF.phase==='pick'))wfThrowPose(av,ph==='wind'?WF.t/WF_THROW:ph==='pitch'?Math.min(1,(WF_THROW*WF_REL+b.t)/WF_THROW):0);
  else{const me=WF.fielders.find(c=>c.me);if(me&&me.reach)wfReach(av,me.reach==='up',t);}
  // the big button
  if(WF.phase==='run'||WF.phase==='after')spBtn('⏩<br>Next','purple');
  else if(bat)spBtn('⚾<br>SWING!','green'+(WF.mySwing!=null?' dim':''));
  else spBtn('🎯<br>PITCH!',WF.phase==='pick'?'':'dim');
  if((WF.hudT=(WF.hudT||0)+dt)>.3){WF.hudT=0;wfHudNow();}}

/* ---------- cameras ---------- */
function wfCam(dt){if(!WF.on)return;const z=Z.wiffle,W=WB,b=WF.ball,bat=WF.half==='top';let P,T;const L=(x,y,zz)=>z.g.localToWorld(new THREE.Vector3(x,y,zz));
  const live=(WF.phase==='play'||WF.phase==='run'||WF.phase==='after')&&(b.st==='fly'||b.st==='held')&&b.t>.12;
  if(live&&WF.phase!=='after'||live&&b.st==='fly'){const bp=b.p;P=L(bp.x*.35,4.3+Math.min(3,wfPol(bp.x,bp.z)[1]*.12),W.HP+5.2);T=L(bp.x,Math.max(.6,bp.y*.7),bp.z);}
  else if(WF.phase==='run'&&WF.batter.run){const r=WF.batter.me?WF.myP:WF.batter.p;P=L(r.x*.5,5.2,W.HP+6.2);T=L(r.x,.8,r.z);}
  // batting: behind the batter, pulled back and up over the catcher, so you see yourself, the pitch coming in and the field
  else if(bat){P=L(-1.35,3.35,W.HP+4.9);T=L(.1,.85,W.PZ-1.5);}
  else{P=L(.75,2.2,W.PZ-3.1);T=L(0,.85,W.HP);}
  const c=WF.cam;if(!c.init){c.p.copy(P);c.t.copy(T);c.init=true;}c.p.lerp(P,Math.min(1,dt*4));c.t.lerp(T,Math.min(1,dt*6));
  camera.position.copy(c.p);camera.lookAt(c.t);}

/* ---------- outside a game: the players hang out, the pad opens the menu ---------- */
function wfIdle(){if(!WF.cpu)return;const C=WF.cpu;for(const c of Object.values(C)){c.piv.visible=false;c.swing=-1;c.run=null;c.go=null;c.base=0;c.reach=null;c.spd=0;c.sit=false;c.crouch=false;if(c.a.tag)c.a.tag.visible=true;}
  wfSpot(C.maya,0,WB.PZ,0);wfSpot(C.sam,1.5,WB.HP-14.5,0);for(const c of WF.subs)wfBench(c,'me');wfBench(C.jake,'op');wfBench(C.zara,'op');}
WF.onPad=false;
anims.push((t,dt)=>{if(WF.on||!started)return;const z=Z.wiffle,p=player.pos,dz=Math.hypot(p.x-z.x,p.z-z.z);if(dz>45)return;
  if(!WF.cpu){wfCpu();wfIdle();}
  // Maya and Sam play catch while they wait
  const C=WF.cpu;WF.idleT+=dt;for(const c of Object.values(C)){c.a.g.position.copy(c.p);c.a.g.rotation.y=c.face;c.a.update(dt,0,false);}
  {const u=(WF.idleT%2.4)/2.4;C.maya.face=Math.atan2(C.sam.p.x-C.maya.p.x,C.sam.p.z-C.maya.p.z);C.sam.face=C.maya.face+Math.PI;
   if(u<.38)wfThrowPose(C.maya.a,u/.38);else if(u>.5&&u<.88)wfThrowPose(C.sam.a,(u-.5)/.38);}
  if(!SP.mode&&!closetOpen&&!SP.menu&&!mapOpen){const [lx,lz]=z.toLocal(p.x,p.z),d=Math.hypot(lx-WB.pad.lx,lz-WB.pad.lz);
    if(d<WB.pad.r&&player.onGround){if(!WF.onPad){WF.onPad=true;wfMenu();}}else if(d>1.3)WF.onPad=false;}
  if(curZone!==WF.lastZone){WF.lastZone=curZone;if(!SP.mode&&curZone&&curZone.id==='wiffle')setTimeout(()=>toast('Step on the green ⚾ pad to play baseball!'),1600);}});
wfBoard();
Object.assign(window.__game,{WF,WB,wfCpuPitch,wfStart,wfMenu,wfAt,wfPol,wfHit,wfPress,wfStep,wfThrowPose,wfCrouch,SP});
