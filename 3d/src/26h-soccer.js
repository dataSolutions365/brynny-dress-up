/* ================= ⚽ SOCCER FIELD (on the canal's far bank, over its own footbridge at 154) =================
   Part of the Sports Park on the far bank: ⚽ soccer here (142 to 166), 🏈 football next to it (168 to 192) and ⚾ wiffle ball (194 to 218).
   - The field ('soccer' zone) is shared with 🏈 football: the goals are combo goals with football uprights up to SOC.UH.
     It has real-looking grass with mowing stripes and all the lines, two goals with nets that bulge when you
     score, corner flags, bleachers, team benches, floodlights and a scoreboard. Everything is in the zone's own space (SOC):
     x runs along the field (the goals are at x = ±SOC.FL), +z points back toward the island.
   - Step on the ⚽ pad by the halfway line for the games (socOpenMenu):
       🥅 Penalty shootout vs Leo the goalie and Kai: SWIPE from the ball toward the goal to shoot (where the swipe points is where it goes,
          a quick swipe is a hard shot, a curved swipe bends it), then you're in goal: swipe or tap left / middle / right to dive.
       🎯 Target practice: 10 shots at the 4 targets hanging in the corners of the goal.
       🆚 1-on-1 vs Kai, first to 3: dribble with the joystick, ⚽ SHOOT, ✨ tricks that fool him (step-over, rainbow flick, nutmeg,
          spin turn, elastico) and 🛡️ TACKLE to win the ball back.
       🤹 Keepy-uppies: tap when the ball drops to your foot, knee or head, and don't let it touch the grass.
   - The ball (socBall) is its own: your Extras ⚽ ball is put away while you play (ballBusy).
   - Poses go through av.socPose (14-avatar.js asks it every frame), the camera through sportsCam (25-game-loop.js), and
     spLock (24e-sports.js) holds you still while you shoot, save or juggle.
   - Challenges: did('soccer', 'goal'|'pk'|'save'|'pkwin'|'target'|'targets'|'curl'|'top'|'juggle'(count)|'header'|'trick'|'v1goal'|'v1win'),
     in the 🏟 Sports tab of challenges.js. */
const SOC={a:154,a0:142,a1:166,bridge:154,FL:18,FW:10.5,GW:3,GH:2.1,UH:5.6,GD:1.5,PK:11.5,BOX:5,BOXW:7,GA:1.8,GAW:4.2,CC:3.2};
SOC.out=Math.min(BANK.out+28,R+63);SOC.d=R+43;// the middle of the field, from the middle of the island
BANK_LAND.push({id:'soccer',a0:SOC.a0,a1:SOC.a1,out:SOC.out,ground:1});
if(!SAVE.soccer)SAVE.soccer={};
const socBest=(k,v)=>{const S=SAVE.soccer;if(S[k]==null||v>S[k]){S[k]=v;persist();return true;}return false;};

/* ---------- the field ---------- */
{const z=Z.soccer,g=z.g,S=SOC;
  z.inside=(x,w)=>{const d=Math.hypot(x,w),a=bankAng(x,w);return d>BANK.in+1&&d<S.out+.5&&a>S.a0&&a<S.a1;};
  // the land: grass out to the edge, with the sandy edge down to the sea at the very back (Whispering Woods grows round it)
  {const th0=deg(S.a0-90),th=deg(S.a1-S.a0);const m=M(new THREE.RingGeometry(BANK.out-.4,S.out,40,1,th0,th),groundMat,0,.004,0,scene,false,true);m.rotation.x=-Math.PI/2;}
  // the grass: mowing stripes, little bits of colour, and every line of a real field
  const W=S.FL*2+5,L=S.FW*2+4,K=LITE?22:32;
  const tex=canvasTex(Math.round(W*K),Math.round(L*K),(x,w,h)=>{const px=v=>(v+W/2)*K,pz=v=>(v+L/2)*K;
    for(let i=0;i*3*K<w;i++){x.fillStyle=i%2?'#4f9a3c':'#5aa845';x.fillRect(i*3*K,0,3*K+1,h);}
    for(let i=0;i<w*h/90;i++){const c=Math.random();x.fillStyle=c<.5?'rgba(30,70,20,.22)':'rgba(170,220,120,.16)';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.5,1+Math.random()*3);}
    x.strokeStyle='rgba(255,255,255,.92)';x.fillStyle='rgba(255,255,255,.92)';x.lineWidth=.12*K;
    x.strokeRect(px(-S.FL),pz(-S.FW),S.FL*2*K,S.FW*2*K);
    x.beginPath();x.moveTo(px(0),pz(-S.FW));x.lineTo(px(0),pz(S.FW));x.stroke();
    x.beginPath();x.arc(px(0),pz(0),S.CC*K,0,Math.PI*2);x.stroke();
    const spot=(a,b)=>{x.beginPath();x.arc(px(a),pz(b),.16*K,0,Math.PI*2);x.fill();};spot(0,0);
    for(const s of [-1,1]){const gx=s*S.FL;
      x.strokeRect(px(s>0?gx-S.BOX:gx),pz(-S.BOXW),S.BOX*K,S.BOXW*2*K);
      x.strokeRect(px(s>0?gx-S.GA:gx),pz(-S.GAW),S.GA*K,S.GAW*2*K);
      spot(s*S.PK,0);
      // the arc at the top of the box
      const r=3.1,bx=s*(S.FL-S.BOX),c=Math.acos(Math.min(1,Math.abs(bx-s*S.PK)/r));x.beginPath();
      if(s>0)x.arc(px(s*S.PK),pz(0),r*K,Math.PI-c,Math.PI+c);else x.arc(px(s*S.PK),pz(0),r*K,-c,c);x.stroke();
      for(const t of [-1,1]){x.beginPath();x.arc(px(gx),pz(t*S.FW),.7*K,t>0?(s>0?Math.PI:-Math.PI/2):(s>0?Math.PI/2:0),t>0?(s>0?Math.PI*1.5:0):(s>0?Math.PI:Math.PI/2));x.stroke();}}});
  tex.anisotropy=8;
  const fm=std('#ffffff',{map:tex,roughness:.95});fm.polygonOffset=true;fm.polygonOffsetFactor=-2;fm.polygonOffsetUnits=-2;
  M(new THREE.PlaneGeometry(W,L),fm,0,.012,0,g,false,true).rotation.x=-Math.PI/2;
  const B=advBatch(),white=phys('#f7f7f4',{roughness:.35,clearcoat:.4}),alu=std('#c3c8cd',{roughness:.35,metalness:.75}),dark=std('#3c4148',{roughness:.6,metalness:.4});
  /* 🥅 the goals: white posts and crossbar, the net frame going back, and the nets (z.nets, they bulge in socNetStep) */
  const netTex=canvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=3;
    for(const o of [0,32]){x.beginPath();x.moveTo(o+16,0);x.lineTo(o+16,h);x.stroke();x.beginPath();x.moveTo(0,o+16);x.lineTo(w,o+16);x.stroke();}});
  netTex.wrapS=netTex.wrapT=THREE.RepeatWrapping;
  const netMat=(rx,ry)=>{const t=netTex.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.25,side:THREE.DoubleSide,roughness:.9,depthWrite:false});};
  z.nets=[];const BH=S.GH*.55;// the back of the net comes down to here
  for(const s of [-1,1]){const gx=s*S.FL,bx=s*(S.FL+S.GD);
    for(const t of [-1,1]){B.stick(new THREE.Vector3(gx,0,t*S.GW),new THREE.Vector3(gx,S.GH,t*S.GW),.06,white,12);
      // the frame that holds the net up at the back
      B.stick(new THREE.Vector3(gx+s*.05,S.GH,t*S.GW),new THREE.Vector3(bx,BH,t*S.GW),.025,alu,6);
      B.stick(new THREE.Vector3(bx,BH,t*S.GW),new THREE.Vector3(bx,0,t*S.GW),.025,alu,6);
      B.stick(new THREE.Vector3(gx,.02,t*S.GW),new THREE.Vector3(bx,.02,t*S.GW),.025,alu,6);
      z.ob(gx,t*S.GW,.12);z.ob(bx,t*S.GW,.1);}
    B.stick(new THREE.Vector3(gx,S.GH,-S.GW-.06),new THREE.Vector3(gx,S.GH,S.GW+.06),.06,white,12);
    // 🏈 combo goals: football uprights rise from the soccer posts, so field goals go over the crossbar and between them
    for(const t of [-1,1])B.stick(new THREE.Vector3(gx,S.GH,t*S.GW),new THREE.Vector3(gx,S.UH,t*S.GW),.045,white,10);
    B.stick(new THREE.Vector3(bx,.02,-S.GW),new THREE.Vector3(bx,.02,S.GW),.025,alu,6);
    B.stick(new THREE.Vector3(bx,BH,-S.GW),new THREE.Vector3(bx,BH,S.GW),.025,alu,6);
    // the nets: back (it bulges), roof and the two sides
    const back=new THREE.PlaneGeometry(S.GW*2,BH,14,5),bm=M(back,netMat(S.GW*2/.3,BH/.3),bx,BH/2,0,g,false,false);bm.rotation.y=Math.PI/2;
    const rl=Math.hypot(S.GD,S.GH-BH),roof=M(new THREE.PlaneGeometry(S.GW*2,rl),netMat(S.GW*2/.3,rl/.3),s*(S.FL+S.GD/2),(S.GH+BH)/2,0,g,false,false);
    {const X=new THREE.Vector3(0,0,1),Y=new THREE.Vector3(s*S.GD,BH-S.GH,0).normalize(),N=new THREE.Vector3().crossVectors(X,Y);roof.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,N));}
    for(const t of [-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(S.GD,0);sh.lineTo(S.GD,BH);sh.lineTo(0,S.GH);sh.closePath();
      const geo=new THREE.ShapeGeometry(sh);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/.3,uv.getY(i)/.3);
      const sm=M(geo,netMat(1,1),gx,0,t*S.GW,g,false,false);sm.rotation.y=s>0?0:Math.PI;}
    z.nets.push({s,m:bm,base:back.attributes.position.array.slice(),amp:0,cz:0,cy:0});}
  /* 🚩 corner flags */
  const flagM=std('#ffd23f',{roughness:.6,side:THREE.DoubleSide});
  for(const s of [-1,1])for(const t of [-1,1]){B.stick(new THREE.Vector3(s*S.FL,0,t*S.FW),new THREE.Vector3(s*S.FL,1.25,t*S.FW),.018,std('#f2f2f2',{roughness:.5}),6);
    const f=M(new THREE.PlaneGeometry(.34,.24),flagM,s*S.FL,1.12,t*S.FW+(t>0?-.17:.17),g,false,false);f.rotation.y=Math.PI/2;(z.flags||(z.flags=[])).push(f);}
  /* 🏟️ bleachers along the far side: four rows of aluminium benches on steel frames */
  {const z0=-S.FW-1.3,len=22;for(let r=0;r<4;r++){const y=.35+r*.42,zz=z0-r*.62;
      B.add(box(len,.05,.36),alu,0,y,zz);B.add(box(len,.36,.04),alu,0,y-.2,zz+.18);}
    for(let x=-len/2;x<=len/2+.01;x+=2.2){B.stick(new THREE.Vector3(x,0,z0+.1),new THREE.Vector3(x,.35,z0+.1),.04,dark,6);
      B.stick(new THREE.Vector3(x,0,z0-1.96),new THREE.Vector3(x,.35+3*.42,z0-1.96),.04,dark,6);
      B.stick(new THREE.Vector3(x,.35,z0+.1),new THREE.Vector3(x,.35+3*.42,z0-1.96),.04,dark,6);}
    B.stick(new THREE.Vector3(-len/2,1.6+3*.42-.35,z0-2.15),new THREE.Vector3(len/2,1.6+3*.42-.35,z0-2.15),.03,alu,6);
    for(let x=-len/2+1;x<len/2;x+=2.4)z.ob(x,z0-1,1.2);}
  /* 🪑 team benches with a clear roof, on the island side */
  {const glass=new THREE.MeshStandardMaterial({color:'#bfe6ff',transparent:true,opacity:.35,roughness:.1,metalness:.2,side:THREE.DoubleSide,depthWrite:false});
    for(const s of [-1,1]){const bx=s*7,bz=S.FW+1.4;B.add(box(4,.06,.4),std('#2f6fd6',{roughness:.5}),bx,.45,bz);B.add(box(4,.4,.05),std('#2f6fd6',{roughness:.5}),bx,.7,bz+.22);
      for(const t of [-1.9,1.9]){B.stick(new THREE.Vector3(bx+t,0,bz+.35),new THREE.Vector3(bx+t,1.8,bz+.35),.04,dark,6);B.stick(new THREE.Vector3(bx+t,0,bz-.3),new THREE.Vector3(bx+t,1.6,bz-.3),.04,dark,6);}
      const rf=M(new THREE.PlaneGeometry(4.2,.9),glass,bx,1.72,bz+.02,g,false,false);rf.rotation.x=-Math.PI/2+.22;
      z.ob(bx-1.2,bz,.6);z.ob(bx+1.2,bz,.6);}}
  /* 💡 floodlights at the four corners (their lamps use the street-light glow, so they light up at night) */
  for(const s of [-1,1])for(const t of [-1,1]){const lx=s*(S.FL+2.6),lz=t*(S.FW+.8);B.stick(new THREE.Vector3(lx,0,lz),new THREE.Vector3(lx,9,lz),.12,dark,8);
    B.add(box(1.6,.9,.12),dark,lx,9.3,lz,.4*t,0,0);for(let i=0;i<3;i++)for(let j=0;j<2;j++)B.add(box(.42,.3,.04),lampMat,lx-.5+i*.5,9.12+j*.38,lz-t*.09,.4*t,0,0);z.ob(lx,lz,.25);}
  /* 🔢 the scoreboard behind the island-left goal */
  {const sx=-(S.FL+3.4);B.stick(new THREE.Vector3(sx,0,-1.6),new THREE.Vector3(sx,3,-1.6),.08,dark,6);B.stick(new THREE.Vector3(sx,0,1.6),new THREE.Vector3(sx,3,1.6),.08,dark,6);
    B.add(box(.2,1.6,4.2),dark,sx,3.6,0);z.ob(sx,-1.6,.2);z.ob(sx,1.6,.2);
    let last='';const bt=canvasTex(512,192,()=>{});const bm=M(new THREE.PlaneGeometry(4,1.5),new THREE.MeshBasicMaterial({map:bt,toneMapped:false}),sx+.11,3.6,0,g,false,false);bm.rotation.y=Math.PI/2;
    z.board={draw(a,b,lab){const k=a+'|'+b+'|'+lab;if(k===last)return;last=k;const c=bt.image,x=c.getContext('2d');x.fillStyle='#101418';x.fillRect(0,0,512,192);
      x.fillStyle='#ffd23f';x.font='700 30px system-ui,-apple-system,sans-serif';x.textAlign='center';x.fillText(lab||'⚽ SOCCER FIELD',256,40);
      x.font='700 92px ui-monospace,Menlo,monospace';x.fillStyle='#ff5a4a';x.fillText(String(a),140,150);x.fillStyle='#4fb6ff';x.fillText(String(b),372,150);
      x.fillStyle='#ffffff';x.font='700 60px system-ui';x.fillText('-',256,140);bt.needsUpdate=true;}};z.board.draw(0,0,'HOME · AWAY');}
  B.done(g);
  // a gravel path from the footbridge to the field, and the ⚽ pad for the games by the halfway line
  {const pm=std('#cdbb98',{roughness:1});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
    const z1=SOC.d-(BANK.in+2.8);M(new THREE.PlaneGeometry(1.8,z1-S.FW-1),pm,0,.008,(z1+S.FW+1)/2,g,false,true).rotation.x=-Math.PI/2;}
  z.pad=spPad(z,3.2,S.FW+1.9,'#4fd16a','⚽','⚽ Play soccer!','#1f7a33');
  // the sign by the path
  {const sg=new THREE.Group();sg.position.set(-1.8,0,S.FW+5);g.add(sg);M(cyl(.06,.07,2.2,8),ADM.wood,-.9,1.1,0,sg,false,false);M(cyl(.06,.07,2.2,8),ADM.wood,.9,1.1,0,sg,false,false);
    M(new THREE.PlaneGeometry(2.4,.7),new THREE.MeshStandardMaterial({map:labelTex('⚽ Soccer Field',{bg:'#1f7a33',fg:'#ffffff',border:'#ffffff',size:64}),roughness:.6}),0,1.85,.07,sg,false,false);obs.push({x:z.toWorld(-1.8,S.FW+5)[0],z:z.toWorld(-1.8,S.FW+5)[1],r:.3});}}

/* ---------- 🌉 the footbridge over the canal (like the one to the airfield) ---------- */
{const F={a:SOC.bridge,t0:R-2.5,t1:BANK.in+2.8,w:2.4,top:2.3};F.ux=Math.sin(deg(F.a));F.uz=Math.cos(deg(F.a));SOC.fb=F;
  const loc=(x,z)=>[x*F.ux+z*F.uz,x*F.uz-z*F.ux],deck=t=>F.top*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-F.t0)/(F.t1-F.t0))))+.1;F.deck=deck;F.loc=loc;
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
  B.done(g);}
// on the map: the footbridge, and the field with its lines
MAP_DRAW.push((x,w2s,k)=>{const F=SOC.fb,a=w2s(F.ux*F.t0,F.uz*F.t0),b=w2s(F.ux*F.t1,F.uz*F.t1);
  x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2.5,F.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();
  const z=Z.soccer,S=SOC,c=[[-S.FL,-S.FW],[S.FL,-S.FW],[S.FL,S.FW],[-S.FL,S.FW]].map(([lx,lz])=>w2s(...z.toWorld(lx,lz)));
  x.beginPath();c.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fillStyle='#4f9a3c';x.fill();x.lineWidth=Math.max(1,.15*k);x.strokeStyle='#ffffff';x.stroke();
  const m0=w2s(...z.toWorld(0,-S.FW)),m1=w2s(...z.toWorld(0,S.FW));x.beginPath();x.moveTo(...m0);x.lineTo(...m1);x.stroke();});

/* ================= the games ================= */
const SC={mode:null,menu:false,t:0,ball:null,phase:'',pt:0,me:0,cpu:0,kicks:[],round:0,turn:'shoot',shot:null,dive:null,cpuDive:null,
  kai:null,leo:null,cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),init:false,P:null,T:null},swipe:null,n:0,best:false,
  own:null,trick:0,trickT:-1,stun:0,cool:0,hitT:0,jug:null,targets:[],msgT:0,onPad:false,lastZone:null};
const SOC_G=9.8,SOC_BR=.11;
const socZ=()=>Z.soccer;
const socW=(lx,lz)=>socZ().toWorld(lx,lz);
const socL=p=>{const [x,z]=socZ().toLocal(p.x,p.z);return new THREE.Vector3(x,p.y,z);};
const socPut=(lx,lz,face)=>{const [x,z]=socW(lx,lz);player.pos.x=x;player.pos.z=z;if(face!=null)player.face=face+socZ().rot;};
const socFace=(fx,fz,tx,tz)=>Math.atan2(tx-fx,tz-fz);// local facing from (fx,fz) toward (tx,tz)

/* ---------- on-screen bits ---------- */
{const st=document.createElement('style');st.textContent=`
#socHud{left:50%;top:calc(env(safe-area-inset-top) + 108px);transform:translateX(-50%);display:none;align-items:center;gap:8px;z-index:9}
body.sc-on #socHud{display:flex}
#scTop{display:flex;gap:10px;align-items:center;background:rgba(18,40,24,.85);color:#fff;border-radius:999px;padding:7px 14px;font-weight:600;font-size:15px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25)}
#scTop b{color:#9ff59f}#scScore{font-size:18px;font-weight:700}#scDots{letter-spacing:1px;font-size:13px}
#scLeave{background:rgba(255,255,255,.9);border-radius:999px;padding:8px 12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.socBtnSet{position:fixed;display:none;z-index:6;border-radius:50%;width:100px;height:100px;font-size:16px;font-weight:700;color:#fff;line-height:1.1;touch-action:none;
  background:radial-gradient(circle at 35% 30%,#8ff59a,#2fb84a);border:4px solid rgba(255,255,255,.85);box-shadow:0 6px 20px rgba(47,184,74,.45)}
.socBtnSet:active{transform:scale(.93)}.socBtnSet.dim{opacity:.45}
.socBtnSet.purple{background:radial-gradient(circle at 35% 30%,#c6b4ff,#7a4dff);box-shadow:0 6px 20px rgba(122,77,255,.5)}
.socBtnSet.orange{background:radial-gradient(circle at 35% 30%,#ffb067,#ff6a1f);box-shadow:0 6px 20px rgba(255,106,31,.5)}
body.sc-free #scMain{display:block;right:calc(env(safe-area-inset-right) + 20px);bottom:calc(env(safe-area-inset-bottom) + 24px)}
body.sc-free #scTrick{display:block;right:calc(env(safe-area-inset-right) + 130px);bottom:calc(env(safe-area-inset-bottom) + 38px);width:84px;height:84px;font-size:14px}
body.sc-jug #scMain{display:block;right:calc(env(safe-area-inset-right) + 24px);width:120px;height:120px;font-size:20px;bottom:calc(env(safe-area-inset-bottom) + 30px)}
#scSwipe{position:fixed;inset:0;z-index:5;display:none;touch-action:none}
body.sc-swipe #scSwipe{display:block}
#socHint{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 22px);z-index:6;display:none;background:rgba(18,40,24,.82);color:#fff;font-weight:700;font-size:15px;padding:8px 16px;border-radius:999px;white-space:nowrap;pointer-events:none}
body.sc-on #socHint.show{display:block}
body.sc-on #actions,body.sc-on #petBtn,body.sc-on #talkBtn,body.sc-on #poseBtn,body.sc-on #hint,body.sc-on #side,body.sc-on #zoomCtl,body.sc-on #mini,body.sc-on #jump,body.sc-fixed #joy{display:none!important}
@media (max-height:520px){#socHud{top:calc(env(safe-area-inset-top) + 8px)}body.sc-jug #scMain{width:100px;height:100px}}`;
  document.head.appendChild(st);
  const d=document.createElement('div');d.innerHTML=`<div class="hud" id="socHud"><div id="scTop"><b id="scTitle"></b><span id="scScore"></span><span id="scDots"></span><span id="scInfo"></span></div><button id="scLeave">✕ Leave</button></div>
<div id="scSwipe"><canvas id="scTrail" style="width:100%;height:100%;display:block"></canvas></div><button class="socBtnSet" id="scMain"></button><button class="socBtnSet purple" id="scTrick"></button><div id="socHint"></div>`;
  document.body.append(...d.children);}
const socBody=(on,kind)=>{const c=document.body.classList;c.toggle('sc-on',!!on);for(const k of ['free','fixed','jug','swipe'])c.toggle('sc-'+k,false);
  if(on){if(kind==='free')c.add('sc-free');else c.add('sc-fixed');if(kind==='jug')c.add('sc-jug');if(kind==='swipe')c.add('sc-swipe');}};
function socHud(title,score,dots,info){$('#scTitle').textContent=title;$('#scScore').textContent=score;$('#scDots').textContent=dots||'';$('#scInfo').textContent=info||'';}
function socBtnSet(id,html,cls){const b=$(id);if(b.dataset.t!==html){b.dataset.t=html;b.innerHTML=html;}const c='socBtnSet '+(cls||'');if(b.className!==c)b.className=c;}
function socHint(t){const h=$('#socHint');if(!t){h.classList.remove('show');return;}if(h.textContent!==t)h.textContent=t;h.classList.add('show');}

/* ---------- the ball ---------- */
function socBallMesh(){const m=M(sph(SOC_BR,24,16),sbMat('#ffffff'),0,-5,0,socZ().g,true,false);return m;}
function socNewBall(lx,lz){if(!SC.ball)SC.ball={m:socBallMesh(),p:new THREE.Vector3(),v:new THREE.Vector3(),st:'rest',shot:null,in:false,out:false,t:0};
  const b=SC.ball;b.p.set(lx,SOC_BR,lz);b.v.set(0,0,0);b.st='rest';b.shot=null;b.in=false;b.out=false;b.t=0;b.m.visible=true;b.m.position.copy(b.p);return b;}
function socHideBall(){if(SC.ball)SC.ball.m.visible=false;}
const _sA=new THREE.Vector3(),_sB=new THREE.Vector3();
function socRoll(b,dt){const v=b.v,s=Math.hypot(v.x,v.z);if(s<.01)return;_sA.set(v.z/s,0,-v.x/s);b.m.rotateOnWorldAxis(_sA,s*dt/SOC_BR);}
// bounce off a bar from a to b (posts, crossbar)
function socBar(b,ax,ay,az,bx,by,bz,r){const p=b.p;_sA.set(bx-ax,by-ay,bz-az);const L2=_sA.lengthSq();let u=((p.x-ax)*_sA.x+(p.y-ay)*_sA.y+(p.z-az)*_sA.z)/L2;u=Math.max(0,Math.min(1,u));
  const qx=ax+_sA.x*u,qy=ay+_sA.y*u,qz=az+_sA.z*u,ex=p.x-qx,ey=p.y-qy,ez=p.z-qz,d=Math.hypot(ex,ey,ez),m=SOC_BR+r;
  if(d<m&&d>1e-5){const nx=ex/d,ny=ey/d,nz=ez/d;p.set(qx+nx*m,qy+ny*m,qz+nz*m);const vn=b.v.x*nx+b.v.y*ny+b.v.z*nz;
    if(vn<0){b.v.x-=1.7*vn*nx;b.v.y-=1.7*vn*ny;b.v.z-=1.7*vn*nz;if(vn<-2){tone(1250,.18,'triangle',.12);tone(620,.25,'sine',.08,.02);return true;}}}return false;}
// one step of the ball flying, bouncing and rolling on the field, in and out of the goals
function socPhys(b,dt){const S=SOC,n=4,h=dt/n,p=b.p,v=b.v;let ding=false;
  for(let k=0;k<n;k++){const ox=p.x,oz=p.z;v.y-=SOC_G*h;p.addScaledVector(v,h);
    if(p.y<SOC_BR){p.y=SOC_BR;if(v.y<-1){if(v.y<-2.5)tone(95,.05,'sine',.06);v.y=-v.y*.45;v.x*=.92;v.z*=.92;}else v.y=0;}
    if(p.y<=SOC_BR+.01){const f=Math.pow(.42,h);v.x*=f;v.z*=f;}
    for(const s of [-1,1]){const gx=s*S.FL;
      for(const t of [-1,1])if(socBar(b,gx,0,t*S.GW,gx,S.GH,t*S.GW,.06))ding=true;
      if(socBar(b,gx,S.GH,-S.GW,gx,S.GH,S.GW,.06))ding=true;
      // into the goal: count it once it's all the way over the line
      if(!b.in&&s*ox<S.FL+SOC_BR&&s*p.x>=S.FL+SOC_BR&&Math.abs(p.z)<S.GW-.04&&p.y<S.GH-.04){b.in=s;socNetHit(s,p.z,p.y,Math.hypot(v.x,v.y,v.z));}
      // the net catches it
      if(b.in===s){const back=S.FL+S.GD-SOC_BR-.05;if(s*p.x>back){p.x=s*back;v.x*=-.15;v.y*=.5;v.z*=.5;}
        if(Math.abs(p.z)>S.GW-SOC_BR){p.z=Math.sign(p.z)*(S.GW-SOC_BR);v.z*=-.2;}const top=S.GH-(S.GH*.45)*(s*p.x-S.FL)/S.GD-SOC_BR;if(p.y>top){p.y=top;v.y=Math.min(0,v.y);}
        v.x*=Math.pow(.2,h);v.z*=Math.pow(.2,h);}
      // the outside of the side netting keeps a ball that missed from rolling through
      else if(s*p.x>S.FL&&s*p.x<S.FL+S.GD+.1&&p.y<S.GH&&Math.abs(oz)>=S.GW&&Math.abs(p.z)<S.GW+SOC_BR+.03){p.z=Math.sign(oz)*(S.GW+SOC_BR+.03);v.z*=-.25;v.x*=.5;}
      if(!b.in&&s*p.x>S.FL+S.GD-.05&&s*p.x<S.FL+S.GD+.3&&Math.abs(p.z)<S.GW&&p.y<S.GH*.6){p.x=s*(S.FL+S.GD+.3);v.x*=-.2;}}
    // the edge of the park
    const lim=S.FL+5;if(Math.abs(p.x)>lim){p.x=Math.sign(p.x)*lim;v.x*=-.4;}if(p.z>S.FW+6){p.z=S.FW+6;v.z*=-.4;}if(p.z<-S.FW-1.2){p.z=-S.FW-1.2;v.z*=-.4;}}
  socRoll(b,dt);b.m.position.copy(p);return ding;}
// the net bulges where the ball hits it (socNetStep wobbles it back)
function socNetHit(s,z,y,sp){const n=socZ().nets.find(o=>o.s===s);if(!n)return;n.amp=Math.min(.55,.15+sp*.03);n.cz=z;n.cy=y;n.t=0;}
function socNetStep(dt){for(const n of socZ().nets){if(n.amp<=.002&&!n.dirty)continue;n.t=(n.t||0)+dt;const a=n.amp*Math.exp(-n.t*3.2)*Math.cos(n.t*12);if(n.t>2){n.amp=0;}
    const pos=n.m.geometry.attributes.position,arr=pos.array,B=n.base;
    for(let i=0;i<pos.count;i++){const px=B[i*3],py=B[i*3+1];const d2=((px+n.cz)**2+(py-(n.cy-SOC.GH*.55/2))**2);arr[i*3+2]=B[i*3+2]+n.s*a*Math.exp(-d2/1.2);}
    pos.needsUpdate=true;n.dirty=n.amp>.002;}}
/* a shot: from the ball's spot to (tz, ty) on the goal line of goal s (+1 or -1), taking T seconds, bending by curl.
   The ball follows a smooth curve to the line (so the goalie can be timed against it), then flies on with real physics. */
function socShoot(b,s,tz,ty,T,curl){const S=SOC;b.shot={s,x0:b.p.x,z0:b.p.z,y0:b.p.y,tz,ty,T,curl,t:0,gx:s*(S.FL-.02)};b.st='shot';b.in=false;
  const sh=b.shot;sh.vy=(ty-sh.y0+.5*SOC_G*T*T)/T;tone(150,.08,'sine',.16);tone(90,.06,'square',.05,.02);}
// where a shot is u (0..1) of the way to the goal line
function socShotAt(sh,u,out){const S=SOC,t=u*sh.T;out.set(sh.x0+(sh.gx-sh.x0)*u,sh.y0+sh.vy*t-.5*SOC_G*t*t,sh.z0+(sh.tz-sh.z0)*u+sh.curl*4*u*(1-u));return out;}
function socShotStep(b,dt){const sh=b.shot;sh.t+=dt;const u=Math.min(1,sh.t/sh.T);const prev=_sB.copy(b.p);socShotAt(sh,u,b.p);
  b.v.copy(b.p).sub(prev).divideScalar(Math.max(dt,1e-4));socRoll(b,dt);b.m.position.copy(b.p);b.m.rotation.y+=sh.curl*dt*6;
  if(u>=1){// it reaches the goal line: from here on the real ball takes over
    const t=sh.T,vx=(sh.gx-sh.x0)/t,vy=sh.vy-SOC_G*t,vz=(sh.tz-sh.z0)/t+sh.curl*4*(1-2)/t;b.v.set(vx,vy,vz);b.st='free';b.shot=null;return true;}
  return false;}

/* ---------- Kai and Leo ---------- */
function socKit(top,c,shorts,sc,extra){return Object.assign(defaultGuyLook(),{dress:null,top:{id:top,c},bottom:{id:'gymshorts',c:sc||'#ffffff'},shoes:{id:'cleats',c:'#ff8a1f'},hat:null,extras:{}},extra||{});}
function socKai(){if(SC.kai)return SC.kai;const L=socKit('teamtee','#2f6fd6',0,'#ffffff',{skin:'#b97a4f',eyes:'#3d2a1a',hair:{id:'crop',c:'#2b1d16'}});
  const a=new Avatar(L,'Kai','#2f7fd9');a.g.visible=false;socZ().g.add(a.g);
  return SC.kai={a,p:new THREE.Vector3(),face:0,vy:0,sp:0,stun:0,cool:0,trick:-1,boost:0,plan:null};}
function socLeo(){if(SC.leo)return SC.leo;const L=socKit('teamtee','#c6f03a',0,'#2d2d3a',{skin:'#f1c9a5',eyes:'#4a6b3a',hair:{id:'crop',c:'#8a5a2b'}});
  L.shoes={id:'cleats',c:'#2d2d3a'};const a=new Avatar(L,'Leo','#4fd16a');a.g.visible=false;socZ().g.add(a.g);
  return SC.leo={a,p:new THREE.Vector3(),face:0,dive:null};}
/* poses (14-avatar.js asks a.socPose(a,tgt,sp,air,t) every frame, after the walk, before the joints move) */
const SOC_POSE={
  keeper(a,tgt){tgt.l0=tgt.l1=-.5;tgt.k0=tgt.k1=.85;tgt.an=-.3;tgt.bob=-.12;tgt.lean=.32;tgt.a0x=tgt.a1x=-.65;tgt.a0z=-.55;tgt.a1z=.55;tgt.e0=tgt.e1=-.75;tgt.l0z=-.18;tgt.l1z=.18;},
  dive(a,tgt){const D=a.socDive||{};tgt.a0z=-2.75;tgt.a1z=2.75;tgt.a0x=tgt.a1x=-.2;tgt.e0=tgt.e1=-.1;tgt.l0=-.3;tgt.l1=.1;tgt.k0=.4;tgt.k1=.2;tgt.lean=.1;tgt.hd=-(D.side||0)*.2;tgt.l0z=(D.side||0)*-.2;tgt.l1z=(D.side||0)*.25;},
  stand(a,tgt){tgt.l0=tgt.l1=-.05;tgt.k0=tgt.k1=.1;tgt.a0z=-.15;tgt.a1z=.15;},
  tackle(a,tgt){tgt.l0=-1.05;tgt.k0=.15;tgt.l1=.35;tgt.k1=.9;tgt.bob=-.18;tgt.lean=.25;tgt.a0z=-.9;tgt.a1z=.9;},
  stumble(a,tgt,sp,air,t){tgt.lean=-.25;tgt.a0z=-1.4+Math.sin(t*14)*.4;tgt.a1z=1.4+Math.sin(t*14+1)*.4;tgt.l0=-.4;tgt.k0=.5;tgt.hd=Math.sin(t*9)*.15;},
  juggle(a,tgt){const J=a.socJ||{};const u=J.k==null?1:Math.min(1,(performance.now()/1000-J.t0)/.28),w=Math.sin(u*Math.PI);
    tgt.a0z=-.55;tgt.a1z=.55;tgt.a0x=tgt.a1x=-.25;tgt.lean=.05;tgt.k0=tgt.k1=.12;
    if(J.k==='foot'){const L=J.leg?'1':'0';tgt['l'+L]=-.85*w;tgt['k'+L]=.5*w+.1;tgt.an=.2*w;}
    else if(J.k==='knee'){const L=J.leg?'1':'0';tgt['l'+L]=-1.45*w;tgt['k'+L]=1.7*w;}
    else if(J.k==='head'){tgt.lean=-.18*w;tgt.bob=.05*w;tgt.k0=tgt.k1=.35*(1-w);}},
  // the tricks: a.socT = {id, t0}
  trick(a,tgt,sp,air,t){const T=a.socT;if(!T)return;const k=(performance.now()/1000-T.t0)/SOC_TRICKS[T.i].d,w=Math.sin(Math.min(1,k)*Math.PI);
    const id=SOC_TRICKS[T.i].id;
    if(id==='step'){const ph=Math.min(1,k)*Math.PI*2,L=k<.5?'0':'1',Z=k<.5?'l0z':'l1z';tgt['l'+L]=-.55*Math.sin(ph%Math.PI);tgt['k'+L]=.7*Math.sin(ph%Math.PI);tgt[Z]=(k<.5?-1:1)*.45*Math.sin(ph%Math.PI);tgt.sy=(k<.5?.3:-.3)*w;tgt.bob=-.06*w;}
    else if(id==='rainbow'){tgt.l0=.55*w;tgt.k0=1.9*w;tgt.l1=-.1;tgt.k1=.3*w;tgt.lean=.15*w;tgt.a0z=-1.1*w;tgt.a1z=1.1*w;tgt.bob=.04*w;}
    else if(id==='nutmeg'){tgt.l0=-.7*w;tgt.k0=.3*w;tgt.l0z=.25*w;tgt.lean=.2*w;}
    else if(id==='spin'){tgt.spin=Math.min(1,k)*Math.PI*2;tgt.l0=-.4*w;tgt.k0=.6*w;tgt.a0z=-.9*w;tgt.a1z=.9*w;}
    else if(id==='elastico'){const L=k<.5?-1:1;tgt.l0=-.45*w;tgt.k0=.25*w;tgt.l0z=L*.5*w;tgt.sy=-L*.25*w;tgt.lean=.12*w;}}};
function socKick(a){a.socK=performance.now()/1000;}
// 14-avatar.js calls this when a.socPose or a.socK is set
function socPoseRun(a,tgt,sp,air,t){if(a.socPose)a.socPose(a,tgt,sp,air,t);
  if(a.socK){const k=performance.now()/1000-a.socK;if(k<.13){tgt.l0=.6;tgt.k0=1.05;tgt.a1x=.3;tgt.a0x=-.3;tgt.a0z=-.5;tgt.a1z=.5;}else if(k<.45){tgt.l0=-1.2;tgt.k0=.08;tgt.a1x=-.45;tgt.a0x=.35;tgt.lean=-.08;tgt.a0z=-.6;tgt.a1z=.6;}else a.socK=null;}}
function socPose(a,name){a.socPose=name?(SOC_POSE[name]||null):null;}
// a goalie's dive: roll the whole body over to one side and push off, hands reaching up
function socDiveStep(a,base,D,dt,rightX,rightZ){D.t+=dt;const u=Math.min(1,D.t/D.dur),e=1-Math.pow(1-u,2.2);
  const roll=D.side*e*(D.high?1.15:1.3),reach=D.side*e*D.reach;
  a.g.position.set(base.x+rightX*reach,(D.high?.55:.22)*Math.sin(Math.min(1,u*1.25)*Math.PI)*(D.side?1:0)+(D.side?0:(D.high?.45*Math.sin(u*Math.PI):0)),base.z+rightZ*reach);
  a.g.rotation.z=roll;a.socDive=D;return u;}
function socResetBody(a){a.g.rotation.z=0;a.g.rotation.x=0;a.socPose=null;a.socDive=null;a.socT=null;a.socJ=null;a.socK=null;}

/* ---------- starting and ending ---------- */
function socOpenMenu(){if(SC.mode||SC.menu||SP.mode)return;SC.menu=true;const S=SAVE.soccer,c=$('#spCard');
  c.innerHTML=`<h2>⚽ Soccer Field</h2><p>Pick a game!</p>
   <button class="spPick" data-m="pk"><b>🥅</b><span><strong>Penalty shootout</strong><small>Shoot past Leo, then dive to save Kai's kicks${S.pkw?` · Wins: ${S.pkw}`:''}</small></span></button>
   <button class="spPick" data-m="v1"><b>🆚</b><span><strong>1-on-1 vs Kai</strong><small>First to 3 goals. Use tricks to get past him${S.v1w?` · Wins: ${S.v1w}`:''}</small></span></button>
   <button class="spPick" data-m="tgt"><b>🎯</b><span><strong>Target practice</strong><small>10 shots at the targets in the goal${S.tgt!=null?` · Best: ${S.tgt}`:''}</small></span></button>
   <button class="spPick" data-m="jug"><b>🤹</b><span><strong>Keepy-uppies</strong><small>Keep the ball off the grass${S.jug!=null?` · Best: ${S.jug} in a row`:''}</small></span></button>
   <button class="btn ghost" id="scNo">Not now</button>`;
  socSuitBtn(c);
  c.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{socCloseMenu();socStart(b.dataset.m);});
  $('#scNo').onclick=socCloseMenu;$('#spMenu').classList.add('show');sfx('pop');}
function socCloseMenu(){SC.menu=false;$('#spMenu').classList.remove('show');}
$('#spMenu').addEventListener('click',e=>{if(e.target.id==='spMenu'&&SC.menu&&!SC.mode)socCloseMenu();});
// ⚽ suit up in a soccer kit: team shirt, shorts and soccer cleats (your outfit is kept, like the other sports)
const SOC_LOOK={top:{id:'tee',c:'#e8334a'},bottom:{id:'athshorts',c:'#ffffff'},shoes:{id:'cleats',c:'#ff8a1f'}},
  SOC_GUY_LOOK={top:{id:'teamtee',c:'#e8334a'},bottom:{id:'gymshorts',c:'#ffffff'},shoes:{id:'cleats',c:'#ff8a1f'}};
const socKitLook=()=>isGuy(SAVE.look)?SOC_GUY_LOOK:SOC_LOOK;
function socSuitBtn(c){const L=socKitLook(),l=SAVE.look;if(!l.dress&&l.top&&l.top.id===L.top.id&&l.shoes&&l.shoes.id==='cleats')return;
  const b=document.createElement('button');b.className='btn';b.style.cssText='display:block;width:calc(100% - 8px);margin:2px 4px 8px';b.textContent='👕 Suit up in a soccer kit';c.querySelector('p').after(b);
  b.onclick=()=>{const l=SAVE.look;spKeepOutfit(L);l.dress=null;l.top={...L.top};l.bottom={...L.bottom};l.shoes={...L.shoes};
    persist();rebuildPlayer();sfx('star');b.textContent='✅ Suited up! Pick a game';b.disabled=true;b.style.opacity=.7;did('dress','soccer');};}
function socStart(m){socCloseMenu();SC.mode=m;SC.t=0;SC.turn='shoot';SC.kaiShot=null;SC.dove=null;SC.me=0;SC.cpu=0;SC.kicks=[];SC.round=0;SC.n=0;SC.phase='';SC.pt=0;SC.dive=null;SC.swipe=null;SC.cam.init=false;SC.trick=0;SC.stun=0;SC.cool=0;SC.own=null;
  closeMap&&closeMap();joy.id=null;joy.x=joy.y=0;did('play','soc_'+m);setTrack('stadium');
  const kai=socKai(),leo=socLeo();kai.a.g.visible=false;leo.a.g.visible=false;socResetBody(kai.a);socResetBody(leo.a);
  if(m==='pk'){socBody(true,'swipe');socPkSetup();}
  else if(m==='tgt'){socBody(true,'swipe');socTargets(true);socTgtSetup();}
  else if(m==='jug'){socBody(true,'jug');socJugStart();}
  else if(m==='v1'){socBody(true,'free');kai.a.g.visible=true;socKickoff('me');toast('You attack the far goal ➡️  Dribble, SHOOT, and use ✨ tricks to beat Kai!');}
  socBoard();}
function socBoard(){const b=socZ().board;if(SC.mode==='pk'||SC.mode==='v1')b.draw(SC.me,SC.cpu,'YOU · KAI');else if(SC.mode==='tgt')b.draw(SC.me,10-SC.n,'🎯 TARGETS · BALLS');else if(SC.mode==='jug')b.draw(SC.n,SAVE.soccer.jug||0,'🤹 NOW · BEST');else b.draw(0,0,'HOME · AWAY');}
function socEnd(show=true,quit=false){const m=SC.mode;if(!m)return;SC.mode=null;socBody(false);socHint('');socTrail(null);
  for(const o of [SC.kai,SC.leo])if(o){o.a.g.visible=false;socResetBody(o.a);}socResetBody(av);av.g.rotation.z=0;socHideBall();socTargets(false);
  if(SC.jug)SC.jug=null;socBoard();if(!show)return;
  let h='',coins=0,best=false;const S=SAVE.soccer;
  if(quit){h=`<h2>👋 You left the game</h2><p>Finish a whole game to earn coins!</p>`;}
  else if(m==='pk'){const win=SC.me>SC.cpu,tie=SC.me===SC.cpu;coins=win?30:tie?15:10;if(win){S.pkw=(S.pkw||0)+1;persist();did('soccer','pkwin');}
    h=`<h2>${win?'🏆 You win the shootout!':tie?'🤝 It\'s a draw!':'😅 Kai wins this time'}</h2><div class="spBig">${SC.me} - ${SC.cpu}</div><p>${SC.kicks.map(k=>k.me==null?'':k.me?'⚽':'❌').join('')} you · Kai ${SC.kicks.map(k=>k.cpu==null?'':k.cpu?'⚽':'🧤').join('')}</p>`;}
  else if(m==='tgt'){coins=SC.me*3;best=socBest('tgt',SC.me);h=`<h2>${SC.me>=6?'🎯 Sharpshooter!':SC.me>=3?'⚽ Nice shooting!':'⚽ Good try!'}</h2><div class="spBig">${SC.me} 🎯</div><p>targets hit with 10 balls${best?' · New best! 🎉':''}</p>`;}
  else if(m==='jug'){coins=Math.min(40,SC.n);best=socBest('jug',SC.n);h=`<h2>${SC.n>=20?'🤩 Ball wizard!':SC.n>=8?'🤹 Nice touch!':'⚽ Good try!'}</h2><div class="spBig">${SC.n}</div><p>keepy-uppies in a row${best?' · New best! 🎉':''}</p>`;}
  else if(m==='v1'){const win=SC.me>SC.cpu;coins=win?30:10;if(win){S.v1w=(S.v1w||0)+1;persist();did('soccer','v1win');}h=`<h2>${win?'🏆 You beat Kai!':'😅 Kai wins this time'}</h2><div class="spBig">${SC.me} - ${SC.cpu}</div><p>${win?'What a game!':'Try a trick when Kai gets close!'}</p>`;}
  if(quit)coins=0;if(coins>0){earn(coins,'sports');h+=`<p>🪙 +${coins} coins</p>`;}
  $('#spCard').innerHTML=h+`<button class="btn" id="scAgain">🔁 Play again</button> <button class="btn ghost" id="scDone">Done</button>`+(spCanUnsuit()?`<br><button class="btn ghost" id="scUnsuit">👗 Back to my outfit</button>`:'');
  if(spCanUnsuit())$('#scUnsuit').onclick=()=>{spUnsuit();socCloseMenu();};
  $('#scAgain').onclick=()=>{socCloseMenu();socStart(m);};$('#scDone').onclick=socCloseMenu;
  SC.menu=true;$('#spMenu').classList.add('show');if(coins>=20||best)sfx('tada');}
$('#scLeave').onclick=()=>socEnd(true,true);
function socSay(t){banner(t);}

/* ---------- 👆 swiping (shooting) and diving (saving) ---------- */
const socTrailCv=$('#scTrail');
function socTrail(pts){const c=socTrailCv,dpr=Math.min(2,devicePixelRatio||1);if(c.width!==innerWidth*dpr){c.width=innerWidth*dpr;c.height=innerHeight*dpr;}const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
  if(!pts||pts.length<2)return;x.lineCap='round';x.lineJoin='round';for(let i=1;i<pts.length;i++){const k=i/pts.length;x.strokeStyle=`rgba(255,255,255,${.25+.6*k})`;x.lineWidth=(4+10*k)*dpr;
    x.beginPath();x.moveTo(pts[i-1][0]*dpr,pts[i-1][1]*dpr);x.lineTo(pts[i][0]*dpr,pts[i][1]*dpr);x.stroke();}}
{const el=$('#scSwipe');
  el.addEventListener('pointerdown',e=>{if(!SC.mode)return;e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(_){}SC.swipe={id:e.pointerId,pts:[[e.clientX,e.clientY]],t0:performance.now()};});
  el.addEventListener('pointermove',e=>{const s=SC.swipe;if(!s||s.id!==e.pointerId)return;s.pts.push([e.clientX,e.clientY]);if(s.pts.length>60)s.pts.splice(1,1);socTrail(s.pts);});
  const up=e=>{const s=SC.swipe;if(!s||s.id!==e.pointerId)return;SC.swipe=null;s.pts.push([e.clientX,e.clientY]);s.dur=(performance.now()-s.t0)/1000;socSwiped(s);setTimeout(()=>{if(!SC.swipe)socTrail(null);},350);};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',e=>{SC.swipe=null;socTrail(null);});}
// screen spot of a point in the field's own space
const _sP=new THREE.Vector3();
function socScreen(lx,ly,lz){camera.updateMatrixWorld();_sP.set(lx,ly,lz);socZ().g.localToWorld(_sP);_sP.project(camera);return [(_sP.x+1)/2*innerWidth,(1-_sP.y)/2*innerHeight];}
function socSwiped(s){if(SC.mode==='pk'&&SC.phase==='save'){socPlayerDive(s);return;}
  if((SC.mode==='pk'&&SC.phase==='aim')||(SC.mode==='tgt'&&SC.phase==='aim'))socSwipeShot(s);}
/* a swipe becomes a shot: where it points (drawn on from the ball) is where it goes, a quick swipe is a hard shot,
   a bent swipe bends the ball. Returns the shot so the games can judge it. */
function socSwipeShot(s){const P=s.pts,a=P[0],e=P[P.length-1],dx=e[0]-a[0],dy=e[1]-a[1],len=Math.hypot(dx,dy);
  if(len<30||dy>-12){toast('👆 Swipe UP toward the goal!');return;}
  const S=SOC,b=SC.ball,gx=S.FL;
  // the goal on the screen
  const bl=socScreen(gx,0,0),bar=socScreen(gx,S.GH,0),bs=socScreen(b.p.x,b.p.y,b.p.z),pl=socScreen(gx,0,-S.GW),pr=socScreen(gx,0,S.GW);
  const need=(bs[1]-(bar[1]+bl[1])/2)*.5,gain=-dy<need?need/Math.max(1,-dy):1;// a short swipe still gets to the goal, along the ground
  const ex=bs[0]+dx*gain,ey=bs[1]+dy*gain;
  let ty=(bl[1]-ey)/Math.max(10,bl[1]-bar[1])*S.GH;const zr=(ex-pl[0])/((pr[0]-pl[0])||1);let tz=-S.GW+zr*S.GW*2;
  // a bent swipe: how far the middle of it is off the straight line
  let dev=0;for(const p of P){const d=((p[0]-a[0])*dy-(p[1]-a[1])*dx)/len;if(Math.abs(d)>Math.abs(dev))dev=d;}
  let curl=Math.max(-1.6,Math.min(1.6,-dev/len*5))*((pr[0]-pl[0])>0?1:-1);if(Math.abs(curl)<.35)curl=0;
  const T=Math.max(.5,Math.min(1.05,.42+s.dur*1.15)),hard=1.05-T;
  // a hard shot is a little less exact
  tz+=(Math.random()-.5)*hard*.9;ty+=(Math.random()-.5)*hard*.6;ty=Math.max(.12,Math.min(4.5,ty));
  SC.shot={tz,ty,T,curl,top:ty>S.GH-.75&&Math.abs(tz)>S.GW-1.1};
  socKick(av);SC.phase='kick';SC.pt=0;return SC.shot;}

/* ---------- 🥅 penalty shootout ---------- */
function socPkSetup(){const S=SOC,kai=socKai(),leo=socLeo();socNewBall(S.PK,0);SC.shot=null;SC.dive=null;SC.judged=false;SC.lineRes=null;
  socResetBody(av);socResetBody(leo.a);socResetBody(kai.a);
  if(SC.turn==='shoot'){// you shoot at Leo
    socPut(S.PK-1.4,-.75,socFace(S.PK-1.4,-.75,S.PK,0));leo.a.g.visible=true;kai.a.g.visible=false;leo.p.set(S.FL-.35,0,0);leo.face=-Math.PI/2;leo.dive=null;
    leo.a.g.position.copy(leo.p);leo.a.g.rotation.y=leo.face;socPose(leo.a,'keeper');
    SC.phase='aim';socBody(true,'swipe');socHint('👆 Swipe from the ball toward the goal to shoot!');
    SC.cam.P=new THREE.Vector3(S.PK-4,1.95,.45);SC.cam.T=new THREE.Vector3(S.FL,.75,0);}
  else{// Kai shoots at you
    leo.a.g.visible=false;kai.a.g.visible=true;socPut(S.FL-.35,0,-Math.PI/2);kai.p.set(S.PK-2.6,0,(Math.random()<.5?-1:1)*1.1);kai.face=socFace(kai.p.x,kai.p.z,S.PK,0);
    socPose(av,'keeper');SC.phase='runup';SC.pt=0;SC.kaiShot=null;SC.dove=null;socBody(true,'swipe');socHint('🧤 Swipe or tap left, middle or right to dive!');
    SC.cam.P=new THREE.Vector3(S.FL+1.25,1.62,0);SC.cam.T=new THREE.Vector3(S.PK-1,.7,0);}
  socPkHud();}
function socPkHud(){const d=SC.kicks.map(k=>k.me==null?'·':k.me?'⚽':'❌').join(''),c=SC.kicks.map(k=>k.cpu==null?'·':k.cpu?'⚽':'🧤').join('');
  socHud('🥅 Penalties',`${SC.me} - ${SC.cpu}`,'',`${SC.turn==='shoot'?'your kick':'in goal 🧤'}${SC.round>=5?' · sudden death':''}`);$('#scDots').textContent=d+' | '+c;}
// does Leo save it? He guesses a side (and reads slow shots better); corners and hard, curling shots are hard to reach
function socLeoGuess(sh){const side=Math.abs(sh.tz)<.9?0:Math.sign(sh.tz),read=.28+.5*(sh.T-.5);let g;
  if(Math.random()<read)g=side;else g=[-1,0,1][Math.floor(Math.random()*3)];
  let save=false;const az=Math.abs(sh.tz);
  if(sh.ty<SOC.GH+.05&&az<SOC.GW+.05){if(g===0)save=az<1.15&&sh.ty<2;
    else if(g===side){let p=.95-.75*Math.max(0,Math.min(1,(az-1.5)/1.4))-(sh.top?.35:0)-(sh.T<.62?.2:0)-(sh.curl?.12:0)+(sh.T>.85?.15:0);save=Math.random()<p;}}
  return {g,save};}
function socPkStep(dt,t){const S=SOC,b=SC.ball,leo=socLeo(),kai=socKai();SC.pt+=dt;
  if(SC.turn==='shoot'){
    if(SC.phase==='aim'||SC.phase==='kick'){const k=SC.phase==='kick'?Math.min(1,SC.pt/.16):0;socPut(S.PK-1.4+k*1.05,-.75+k*.55,socFace(S.PK-1.4,-.75,S.PK,0));
      if(SC.phase==='kick'&&SC.pt>=.16){const sh=SC.shot;socShoot(b,1,sh.tz,sh.ty,sh.T,sh.curl);SC.phase='fly';SC.pt=0;socHint('');
        const G=socLeoGuess(sh);SC.leoG=G;
        // he dives a moment after the kick
        const rx=Math.cos(leo.face)*-1,rz=Math.sin(leo.face);// his right
        const lat=G.g===0?0:G.g*1;// local z of the side he goes to
        const side=G.g===0?0:(lat*rz>0?1:-1);
        leo.dive={t:-.12,dur:G.g?.5:.3,side,reach:G.save?Math.min(2.2,Math.max(.4,Math.abs(sh.tz)-.6)):1.7+Math.random()*.4,high:sh.ty>1.25,base:leo.p.clone(),rx,rz};}}
    if(leo.dive&&leo.dive.t+dt>0){const D=leo.dive;if(D.t<0)D.t=0;socPose(leo.a,'dive');socDiveStep(leo.a,D.base,D,dt,D.rx,D.rz);}else if(leo.dive){leo.dive.t+=dt;}
    if(!leo.dive){leo.a.g.position.set(leo.p.x,0,leo.p.z+Math.sin(t*2.2)*.12);}
    leo.a.g.rotation.y=leo.face;leo.a.update(dt,0,false);
    if(SC.phase==='fly'||SC.phase==='wait'){if(b.st==='shot'){if(socShotStep(b,dt))socPkLine(b);}else{socPhys(b,dt);}}}
  else{// you're in goal
    const D=SC.dive;
    if(SC.phase==='runup'){const ax=S.PK-.45,az=-.25;const dx=ax-kai.p.x,dz=az-kai.p.z,dl=Math.hypot(dx,dz);const sp=SC.pt<.6?0:3.4;
      if(dl>.05&&sp){const s=Math.min(dl,sp*dt);kai.p.x+=dx/dl*s;kai.p.z+=dz/dl*s;}kai.face=socFace(kai.p.x,kai.p.z,S.FL,0);
      kai.a.g.position.copy(kai.p);kai.a.g.rotation.y=kai.face;kai.a.update(dt,sp,false);
      if(dl<.12){// the kick
        socKick(kai.a);const sideZ=Math.random()<.18?0:(Math.random()<.5?-1:1),az2=sideZ?.9+Math.random()*1.8:(Math.random()-.5)*1.2;
        let tz=sideZ*az2,ty=Math.random()<.35?1.2+Math.random()*.7:.25+Math.random()*.7;
        // dive early and he sees you go: he puts it the other way
        if(SC.dove&&SC.dove.at<-0.05){const dz=SC.dove.z;if(dz)tz=-Math.sign(dz)*(1.2+Math.random()*1.4);else tz=(Math.random()<.5?-1:1)*(1.6+Math.random()*1);}
        const miss=Math.random()<.1;if(miss){tz=(Math.random()<.5?-1:1)*(S.GW+.4+Math.random());}
        const T=.72+Math.random()*.22;SC.kaiShot={tz,ty,T,t:0};socShoot(b,1,tz,ty,T,0);SC.phase='fly';SC.pt=0;}}
    else{kai.a.g.position.copy(kai.p);kai.a.g.rotation.y=kai.face;kai.a.update(dt,0,false);}
    if(SC.kaiShot)SC.kaiShot.t+=dt;
    if(SC.phase==='fly'||SC.phase==='wait'){if(b.st==='shot'){if(socShotStep(b,dt))socPkLine(b);}else socPhys(b,dt);}
    // your body
    const base=socL(player.pos);
    if(D){if(!D.base){D.base=new THREE.Vector3(S.FL-.35,0,0);}socPose(av,'dive');const z=socZ();
      socDiveStep(av,D.base,D,dt,D.rx,D.rz);const [wx,wz]=z.toWorld(av.g.position.x,av.g.position.z);av.g.position.x=wx;av.g.position.z=wz;}
    else{socPut(S.FL-.35,Math.sin(t*2.2)*.1,-Math.PI/2);}}
  if(SC.phase==='fly'&&SC.pt>3.5&&!SC.judged)socPkJudge();
  if(SC.phase==='wait'&&SC.pt>2.1){socPkNext();return;}
  socNetStep(dt);}
// the ball reaches the goal line: save, post, goal or miss
function socPkLine(b){const S=SOC,v=b.v;const z=b.p.z,y=b.p.y,az=Math.abs(z);
  if(SC.turn==='shoot'){const G=SC.leoG,sh=SC.shot;let res;
    if(G.save&&az<S.GW&&y<S.GH){res='save';v.set(-(2+Math.random()*3),2+Math.random()*2,(Math.random()-.5)*5+Math.sign(z)*2);tone(200,.1,'square',.1);socSay(rnd(['🧤 Saved by Leo!','🧤 What a save!','🧤 Leo gets a hand to it!']));}
    else if(az<S.GW+.2&&y<S.GH+.2&&(Math.abs(az-S.GW)<.16||Math.abs(y-S.GH)<.14)){res='post';}// physics bounces it off the frame
    else if(az<S.GW&&y<S.GH)res='goal';else res='miss';
    SC.lineRes=res;setTimeout(()=>socPkJudge(),res==='post'?260:120);}
  else{const D=SC.dive,K=SC.kaiShot;let saved=false;
    const inside=az<S.GW&&y<S.GH;
    if(inside&&D){const side=az<.9?0:Math.sign(z),dz=D.z;// what you dove for
      const okSide=(dz===0&&side===0)||(dz!==0&&dz===side)||(dz!==0&&side===0&&az<.7);const okTime=D.at>-0.35;
      const high=y>1.45&&az>2.1;saved=okSide&&okTime&&(!high||D.high||Math.random()<.45);}
    if(saved){v.set(-(2.5+Math.random()*2.5),2+Math.random()*2.5,(Math.random()-.5)*4+Math.sign(z||1)*2.5);tone(200,.1,'square',.1);SC.lineRes='save';}
    else SC.lineRes=inside?'goal':'miss';setTimeout(()=>socPkJudge(),140);}}
function socPkJudge(){if(!SC.mode||SC.mode!=='pk')return;const b=SC.ball,S=SOC;let r=SC.lineRes;if(r==='post')r=b.in?'goal':'miss';
  // a ball that came off the post and still went in is a goal
  if(r==='miss'&&b.in)r='goal';
  if(SC.round>=SC.kicks.length)SC.kicks.push({me:null,cpu:null});const k=SC.kicks[SC.round];
  if(SC.turn==='shoot'){k.me=r==='goal';if(r==='goal'){SC.me++;socSay(SC.shot.top?'🔥 TOP CORNER!':SC.shot.curl?'🌀 What a curler! GOAL!':rnd(['⚽ GOAL!','⚽ GOOOAL!','⚽ It\'s in!']));spCheer();sfx('star');did('soccer','goal');did('soccer','pk');if(SC.shot.top)did('soccer','top');if(SC.shot.curl)did('soccer','curl');
      burst(socZ().g.localToWorld(new THREE.Vector3(S.FL,1.2,b.p.z)),'#ffd23f',40,3);av.play('cheer');}
    else if(r==='miss'){socSay(SC.lineRes==='post'?'😮 Off the post!':b.p.y>S.GH?'😬 Over the bar!':'😬 Just wide!');}}
  else{k.cpu=r==='goal';if(r==='goal'){SC.cpu++;socSay('Kai scores');}else if(r==='save'){socSay(rnd(['🧤 YOU SAVED IT!','🧤 What a save!','🧤 Super save!']));spCheer();sfx('star');did('soccer','save');}
    else socSay('😅 Kai missed!');}
  socPkHud();socBoard();SC.phase='wait';SC.pt=0;SC.judged=true;}
function socPkNext(){const n=SC.kicks.length,k=SC.kicks[SC.round];
  // who has won: after 5 each, or when one can't catch up any more; then sudden death, up to 10 rounds
  const left=(who)=>{let c=0;for(let i=0;i<5;i++){const q=SC.kicks[i];if(!q||q[who]==null)c++;}return c;};
  if(SC.round<5){if(SC.me+left('me')<SC.cpu||SC.cpu+left('cpu')<SC.me){socEnd(true);return;}}
  if(SC.turn==='shoot'){SC.turn='save';}
  else{SC.turn='shoot';SC.round++;if(SC.round>=5&&SC.me!==SC.cpu){socEnd(true);return;}if(SC.round>=10){socEnd(true);return;}}
  socPkSetup();}
// you dive: a swipe or a tap on the left, middle or right
function socPlayerDive(s){if(SC.dive||SC.phase==='wait')return;const P=s.pts,a=P[0],e=P[P.length-1],dx=e[0]-a[0],dy=e[1]-a[1],len=Math.hypot(dx,dy);
  let sx,up=false;if(len>28){sx=Math.abs(dx)<len*.35?0:Math.sign(dx);up=dy<-len*.45;}else{const f=e[0]/innerWidth;sx=f<.36?-1:f>.64?1:0;up=e[1]<innerHeight*.45;}
  // which way is that on the field? (screen right is local +z or -z depending on the camera)
  const S=SOC,l=socScreen(S.FL,0,-1),r=socScreen(S.FL,0,1),zSign=r[0]>l[0]?1:-1,dz=sx*zSign;
  const K=SC.kaiShot,at=K?K.t:-Math.max(.05,1.25-SC.pt);// time since Kai kicked (negative: before)
  // your body's right, facing the kicker
  const f=-Math.PI/2,rx=-Math.cos(f),rz=Math.sin(f);const side=dz===0?0:(dz*rz>0?1:-1);
  SC.dive={z:dz,high:up,at,t:0,dur:dz?.4:.3,side,reach:dz?1.9:0,rx,rz};SC.dove=SC.dive;socHint('');tone(300,.12,'sine',.08,0,520);
  if(K&&at>K.T-.06){SC.dive.late=true;}}

/* ---------- 🎯 target practice ---------- */
function socTargets(on){const z=socZ(),S=SOC;if(!on){for(const t of SC.targets)t.m.visible=false;return;}
  if(!SC.targets.length){const tex=canvasTex(128,128,(x)=>{const r=[60,48,36,24,12];r.forEach((rr,i)=>{x.beginPath();x.arc(64,64,rr,0,7);x.fillStyle=i%2?'#ffffff':'#e8334a';x.fill();});});
    const mat=new THREE.MeshStandardMaterial({map:tex,transparent:true,roughness:.6,side:THREE.DoubleSide});
    for(const [tz,ty] of [[-(S.GW-.55),S.GH-.5],[S.GW-.55,S.GH-.5],[-(S.GW-.55),.5],[S.GW-.55,.5]]){const m=M(new THREE.CircleGeometry(.46,28),mat,S.FL+.05,ty,tz,z.g,false,false);m.rotation.y=-Math.PI/2;SC.targets.push({m,tz,ty,hit:false});}}
  for(const t of SC.targets){t.hit=false;t.m.visible=true;t.m.scale.setScalar(1);}}
const SOC_TGT_SPOTS=[[0,0],[0,-2.2],[0,2.2],[-1.5,-4],[-1.5,4],[1,0],[-2,-1.2],[-2,1.2],[0,-3],[0,3]];
function socTgtSetup(){const S=SOC,sp=SOC_TGT_SPOTS[SC.n%SOC_TGT_SPOTS.length],bx=S.PK+sp[0],bz=sp[1];socNewBall(bx,bz);SC.shot=null;
  const f=socFace(bx,bz,S.FL,0),bk=1.4;socPut(bx-Math.sin(f)*bk+Math.cos(f)*.75,bz-Math.cos(f)*bk-Math.sin(f)*.75,f);SC.phase='aim';SC.pt=0;socBody(true,'swipe');
  socHint(SC.n?`🎯 Ball ${SC.n+1} of 10`:'👆 Swipe from the ball at a target!');
  SC.cam.P=new THREE.Vector3(bx-Math.sin(f)*4-Math.cos(f)*.45,1.95,bz-Math.cos(f)*4+Math.sin(f)*.45);SC.cam.T=new THREE.Vector3(S.FL,.95,0);
  if(SC.targets.every(t=>t.hit))socTargets(true);
  socHud('🎯 Targets',`${SC.me} 🎯`,'',`ball ${SC.n+1} of 10`);}
function socTgtStep(dt,t){const S=SOC,b=SC.ball;SC.pt+=dt;
  if(SC.phase==='aim'||SC.phase==='kick'){const f=socFace(b.p.x,b.p.z,S.FL,0),k=SC.phase==='kick'?Math.min(1,SC.pt/.16):0,bk=1.4-k*1.05,sd=.75*(1-k*.7);socPut(b.p.x-Math.sin(f)*bk+Math.cos(f)*sd,b.p.z-Math.cos(f)*bk-Math.sin(f)*sd,f);
    if(SC.phase==='kick'&&SC.pt>=.16){const sh=SC.shot;socShoot(b,1,sh.tz,sh.ty,sh.T,sh.curl);SC.phase='fly';SC.pt=0;socHint('');}}
  else if(SC.phase==='fly'){if(b.st==='shot'){if(socShotStep(b,dt)){// did it hit a target?
        let hit=null;for(const tg of SC.targets)if(!tg.hit&&Math.hypot(b.p.z-tg.tz,b.p.y-tg.ty)<.46+SOC_BR*.6)hit=tg;
        if(hit){hit.hit=true;SC.me++;burst(socZ().g.localToWorld(new THREE.Vector3(S.FL,hit.ty,hit.tz)),'#ff4d6d',40,2.5);tone(880,.12,'triangle',.12);tone(1320,.16,'sine',.1,.08);
          socSay(SC.targets.every(t=>t.hit)?'🎯 All four! They\'re back!':'🎯 Target!');did('soccer','target');if(SC.targets.every(t=>t.hit))did('soccer','targets');b.v.x*=.25;}
        else if(Math.abs(b.p.z)<S.GW&&b.p.y<S.GH)socSay('⚽ Goal, but no target');else socSay(b.p.y>S.GH?'😬 Over the bar!':'😬 Wide!');
        socBoard();}}
    else socPhys(b,dt);
    for(const tg of SC.targets){const s=tg.m.scale.x,want=tg.hit?.001:1;tg.m.scale.setScalar(s+(want-s)*Math.min(1,dt*10));}
    if(SC.pt>1.9){SC.n++;if(SC.n>=10){socEnd(true);return;}socTgtSetup();}}
  socNetStep(dt);}

/* ---------- 🤹 keepy-uppies ---------- */
function socJugStart(){const S=SOC;socPut(0,2,socFace(0,2,0,-1));const b=socNewBall(0,2);SC.n=0;
  SC.jug={y:1.1,vy:2.4,x:0,vx:0,cool:0,dead:false,next:'foot',last:null};SC.cam.P=new THREE.Vector3(1.9,1.45,-1.4);SC.cam.T=new THREE.Vector3(0,.85,1.8);
  socBtnSet('#scMain','⚽<br>TAP!','');socHud('🤹 Keepy-uppies','0','','don\'t let it drop!');socHint('Tap when the ball drops to your foot, knee or head!');}
// which part of you the ball is next to (height above the grass)
const socJugZone=y=>y>1.32&&y<1.78?'head':y>.48&&y<.82?'knee':y>.08&&y<.42?'foot':null;
function socJugTap(){const J=SC.jug;if(!J||J.dead||J.cool>0)return;J.cool=.18;const k=J.vy<.8?socJugZone(J.y):null;
  if(!k){tone(180,.06,'sine',.05);return;}
  J.vy=k==='head'?3.6+Math.random()*.6:k==='knee'?3.4+Math.random()*.7:3.9+Math.random()*.9;J.vx=(Math.random()-.5)*.25-J.x*.6;
  J.leg=!J.leg;av.socJ={k,leg:J.leg?1:0,t0:performance.now()/1000};SC.n++;tone(k==='head'?320:k==='knee'?180:150,.06,'sine',.14);
  if(SC.n%10===0){socSay(`🤹 ${SC.n} in a row!`);spCheer();}if(k==='head')did('soccer','header');if(SC.n>=10)did('soccerJug',SC.n);
  socHud('🤹 Keepy-uppies',String(SC.n),'',k==='head'?'header! 🗣️':k==='knee'?'knee!':'foot!');socBoard();}
function socJugStep(dt,t){const J=SC.jug,b=SC.ball;if(!J)return;J.cool-=dt;socPose(av,'juggle');socPut(0,2,socFace(0,2,0,-1));
  if(!J.dead){J.vy-=SOC_G*.8*dt;J.y+=J.vy*dt;J.x+=J.vx*dt;
    if(J.y<SOC_BR){J.dead=true;J.vy=1.4;tone(110,.2,'sine',.1);socSay(SC.n?`😮 It dropped! ${SC.n} in a row`:'😮 It dropped!');did('soccerJug',SC.n);setTimeout(()=>{if(SC.mode==='jug')socEnd(true);},1300);}}
  else{J.vy-=SOC_G*dt;J.y+=J.vy*dt;if(J.y<SOC_BR){J.y=SOC_BR;J.vy=-J.vy*.4;}}
  // in front of you, at your feet
  const fz=2-.32;b.p.set(J.x,J.y,fz);b.m.position.copy(b.p);b.m.rotation.x+=dt*(J.vy>0?6:-4);
  const hit=!J.dead&&J.vy<.8&&socJugZone(J.y);socBtnSet('#scMain',hit?`⚽<br>${hit==='head'?'HEAD!':hit==='knee'?'KNEE!':'TAP!'}`:'⚽<br>TAP!',hit?'':'dim');}

/* ---------- 🆚 1-on-1 vs Kai ---------- */
const SOC_TRICKS=[{id:'step',e:'🦶',n:'Step-over',d:.75},{id:'rainbow',e:'🌈',n:'Rainbow flick',d:.85},{id:'nutmeg',e:'🥜',n:'Nutmeg',d:.5},{id:'spin',e:'🌀',n:'Spin turn',d:.7},{id:'elastico',e:'⚡',n:'Elastico',d:.55}];
function socKickoff(who){const S=SOC,kai=socKai(),b=socNewBall(0,0);SC.own=who;SC.phase='play';SC.pt=0;socResetBody(kai.a);socResetBody(av);SC.trickT=-1;
  if(who==='me'){socPut(-.6,0,Math.PI/2);kai.p.set(3.4,0,0);}else{socPut(-3.4,0,Math.PI/2);kai.p.set(.6,0,0);}
  kai.face=socFace(kai.p.x,kai.p.z,who==='me'?-1:0,0);kai.stun=0;kai.cool=1;kai.trick=-1;kai.boost=0;
  cam.yaw=Math.PI/2+socZ().rot+Math.PI;cam.cy=cam.yaw;socV1Hud();}
function socV1Hud(){socHud('🆚 You vs Kai',`${SC.me} - ${SC.cpu}`,'',SC.own==='me'?'your ball':SC.own==='cpu'?'Kai\'s ball':'loose ball!');}
// where the ball sits when someone dribbles it: just ahead of their feet, with little touches as they run
function socAtFeet(b,x,z,face,sp,t,dt){const k=.42+Math.abs(Math.sin(t*6))*.12*Math.min(1,sp/3);const tx=x+Math.sin(face)*k,tz=z+Math.cos(face)*k;
  const ox=b.p.x,oz=b.p.z;b.p.x+=(tx-b.p.x)*Math.min(1,dt*14);b.p.z+=(tz-b.p.z)*Math.min(1,dt*14);b.p.y=SOC_BR;b.v.set((b.p.x-ox)/Math.max(dt,1e-4),0,(b.p.z-oz)/Math.max(dt,1e-4));socRoll(b,dt);b.m.position.copy(b.p);}
function socV1Shoot(){const S=SOC,b=SC.ball,me=socL(player.pos);if(SC.own!=='me'||SC.trickT>=0)return;const f=player.face-socZ().rot,fx=Math.sin(f),fz=Math.cos(f);
  const dist=S.FL-me.x;socKick(av);SC.own=null;SC.cool=.5;
  if(fx>.25&&dist<22){// toward the goal: aim along where you face, a bit off the further you are
    const k=(S.FL-b.p.x)/fx;let tz=b.p.z+fz*k;tz=Math.max(-S.GW-1.2,Math.min(S.GW+1.2,tz))+(Math.random()-.5)*dist*.06;const ty=.25+Math.random()*Math.min(1.6,.5+dist*.08);
    socShoot(b,1,tz,ty,Math.max(.45,dist/17),0);SC.v1shot=true;}
  else{b.v.set(fx*13,2.2,fz*13);b.st='free';tone(150,.08,'sine',.16);}socV1Hud();}
function socV1Trick(){if(SC.own!=='me'||SC.trickT>=0)return;const kai=socKai(),i=SC.trick%SOC_TRICKS.length,T=SOC_TRICKS[i];SC.trick++;SC.trickT=0;SC.trickI=i;
  av.socT={i,t0:performance.now()/1000};SC.fooled=false;tone(520,.08,'triangle',.08);tone(780,.1,'triangle',.07,.06);
  const me=socL(player.pos),dx=kai.p.x-me.x,dz=kai.p.z-me.z,d=Math.hypot(dx,dz),f=player.face-socZ().rot,front=(dx*Math.sin(f)+dz*Math.cos(f))/(d||1);
  SC.trickVs=d<2.6&&front>.1;// close enough, and in front of you, to be fooled
  if(T.id==='nutmeg'&&!(d<1.8&&front>.4))SC.trickVs=false;}
function socV1Step(dt,t){const S=SOC,b=SC.ball,kai=socKai(),me=socL(player.pos),z=socZ();SC.pt+=dt;if(SC.cool>0)SC.cool-=dt;
  if(curZone!==z){socEnd(true,true);return;}
  const f=player.face-z.rot;
  // ⚽ your ball
  if(SC.own==='me'){
    if(SC.trickT>=0){const T=SOC_TRICKS[SC.trickI];SC.trickT+=dt;const u=Math.min(1,SC.trickT/T.d);
      if(T.id==='rainbow'){// over your head from behind, landing ahead of you
        const bx=me.x+Math.sin(f)*(-.2+2.4*u),bz=me.z+Math.cos(f)*(-.2+2.4*u);b.p.set(bx,SOC_BR+2.1*Math.sin(u*Math.PI),bz);b.m.position.copy(b.p);b.m.rotation.x-=dt*10;}
      else if(T.id==='nutmeg'&&SC.trickVs){// through his legs
        const bx=me.x+Math.sin(f)*(.4+3.2*u),bz=me.z+Math.cos(f)*(.4+3.2*u);b.p.set(bx,SOC_BR,bz);b.m.position.copy(b.p);b.m.rotation.x+=dt*14;}
      else if(T.id==='elastico'){const side=Math.sin(u*Math.PI*2)*.35,rx=-Math.cos(f),rz=Math.sin(f);socAtFeet(b,me.x+rx*side,me.z+rz*side,f,player.speed,t,dt);}
      else socAtFeet(b,me.x,me.z,f,player.speed,t,dt);
      SC.spinA=T.id==='spin'?u*Math.PI*2:0;
      if(!SC.fooled&&SC.trickVs&&u>.55){SC.fooled=true;kai.stun=1.4;kai.lunge=(Math.random()<.5?-1:1);socSay(`${T.e} ${T.n}! Kai's fooled!`);spCheer();did('soccer','trick');did('soccer','trick_'+T.id);}
      if(u>=1){SC.trickT=-1;av.socT=null;SC.spinA=0;if(T.id==='nutmeg'&&SC.trickVs){SC.own=null;b.st='free';b.v.set(Math.sin(f)*3,0,Math.cos(f)*3);}else if(T.id==='rainbow'){SC.own=null;b.st='free';b.v.set(Math.sin(f)*2.5,-1,Math.cos(f)*2.5);}}}
    else socAtFeet(b,me.x,me.z,f,player.speed,t,dt);}
  else if(SC.own==='cpu'){socAtFeet(b,kai.p.x,kai.p.z,kai.face,kai.sp,t,dt);}
  else{// loose: fly or roll, then whoever gets to it first
    if(b.st==='shot'){if(socShotStep(b,dt)){}}else socPhys(b,dt);
    if(SC.cool<=0&&b.p.y<.6&&b.st!=='shot'){const dm=Math.hypot(b.p.x-me.x,b.p.z-me.z),dk=Math.hypot(b.p.x-kai.p.x,b.p.z-kai.p.z),sp=Math.hypot(b.v.x,b.v.z);
      if(dm<.6&&sp<9){SC.own='me';socV1Hud();}else if(dk<.6&&sp<9&&kai.stun<=0){SC.own='cpu';kai.plan=null;socV1Hud();}}}
  // a goal?
  if(b.in&&SC.phase==='play'){SC.phase='goal';SC.pt=0;const mine=b.in>0;if(mine){SC.me++;socSay(rnd(['⚽ GOAL!','⚽ GOOOAL!','⚽ What a finish!']));spCheer();sfx('star');av.play('cheer');did('soccer','goal');did('soccer','v1goal');}
    else{SC.cpu++;socSay('Kai scores');kai.a.play('cheer');}SC.own=null;socBoard();socV1Hud();}
  if(SC.phase==='goal'){if(SC.pt>2.4){if(SC.me>=3||SC.cpu>=3){socEnd(true);return;}socKickoff(b.in>0?'cpu':'me');}}
  // out of play: over a sideline (the other player throws it in), or over the goal line (a goal kick)
  else if(SC.phase==='play'&&!SC.own&&b.st!=='shot'){const outSide=Math.abs(b.p.z)>S.FW+SOC_BR,outEnd=Math.abs(b.p.x)>S.FL+SOC_BR&&!b.in;
    if(outSide||outEnd){const last=SC.lastTouch||'me',to=last==='me'?'cpu':'me';
      if(outEnd){const s=Math.sign(b.p.x);// the side that defends this goal gets the ball
        const def=s>0?'cpu':'me';socNewBall(s*(S.FL-S.GA),0);SC.own=def;toast(def==='me'?'Goal kick: your ball':'Goal kick to Kai');}
      else{socNewBall(Math.max(-S.FL+1,Math.min(S.FL-1,b.p.x)),Math.sign(b.p.z)*(S.FW-.5));SC.own=to;toast(to==='me'?'Throw-in: your ball':'Throw-in to Kai');}
      const bb=SC.ball;if(SC.own==='me'){socPut(bb.p.x-.45,bb.p.z,Math.PI/2);}else{kai.p.set(bb.p.x+.45,0,bb.p.z);}SC.cool=.4;socV1Hud();}}
  if(SC.own)SC.lastTouch=SC.own;
  socKaiStep(dt,t,me);
  // buttons
  if(SC.own==='me'){socBtnSet('#scMain','⚽<br>SHOOT','orange'+(SC.trickT>=0?' dim':''));const T=SOC_TRICKS[SC.trick%SOC_TRICKS.length];socBtnSet('#scTrick',`${T.e}<br>${T.n}`,'purple'+(SC.trickT>=0?' dim':''));}
  else if(SC.own==='cpu'){const d=Math.hypot(kai.p.x-me.x,kai.p.z-me.z);socBtnSet('#scMain','🛡️<br>TACKLE',d<1.5&&SC.cool<=0?'':'dim');socBtnSet('#scTrick','✨<br>tricks','purple dim');}
  else{socBtnSet('#scMain','⚽<br>…','dim');socBtnSet('#scTrick','✨<br>tricks','purple dim');}
  // look toward the goal you attack when you aren't turning the camera
  if(look.id===null&&SC.own==='me'){const want=socFace(me.x,me.z,S.FL,0)+z.rot+Math.PI;cam.yaw=angDamp(cam.yaw,want,Math.min(1,dt*1.1));}
  socNetStep(dt);}
function socTackle(){const kai=socKai(),me=socL(player.pos);if(SC.own!=='cpu'||SC.cool>0)return;SC.cool=.9;socPose(av,'tackle');setTimeout(()=>{if(av.socPose===SOC_POSE.tackle)socPose(av,null);},420);
  const d=Math.hypot(kai.p.x-me.x,kai.p.z-me.z);if(d>1.5){toast('Get closer to Kai to tackle! 🛡️');return;}
  if(kai.trick>=0||Math.random()>.55){toast(kai.trick>=0?'Kai\'s too quick!':'Missed! Kai kept it');tone(200,.12,'sine',.08);return;}
  const b=SC.ball;SC.own=null;b.st='free';const dx=me.x-kai.p.x,dz=me.z-kai.p.z,dl=d||1;b.v.set(dx/dl*2.5+(Math.random()-.5),0,dz/dl*2.5+(Math.random()-.5));
  kai.stun=.7;socSay('🛡️ Great tackle!');tone(660,.1,'triangle',.12);did('soccer','tackle');SC.cool=.15;socV1Hud();}
// Kai: chases a loose ball, dribbles at your goal and shoots, sometimes with a step-over, and closes you down when you have it
function socKaiStep(dt,t,me){const S=SOC,kai=socKai(),b=SC.ball;let tx=kai.p.x,tz=kai.p.z,sp=0;
  if(kai.stun>0){kai.stun-=dt;socPose(kai.a,SC.fooled&&kai.stun>.4?'stumble':null);const rx=-Math.cos(kai.face),rz=Math.sin(kai.face);if(kai.stun>.9){kai.p.x+=rx*(kai.lunge||1)*1.6*dt;kai.p.z+=rz*(kai.lunge||1)*1.6*dt;}}
  else{if(kai.a.socPose===SOC_POSE.stumble)socPose(kai.a,null);kai.cool-=dt;
    if(SC.phase!=='play'){tx=S.FL*-.2;tz=0;sp=1.2;}
    else if(SC.own==='cpu'){// attack the goal at -x
      if(!kai.plan||kai.plan.t<=0){kai.plan={z:(Math.random()-.5)*S.FW*.9,t:1.5+Math.random()};}kai.plan.t-=dt;
      tx=-S.FL+2;tz=kai.plan.z*Math.min(1,(kai.p.x+S.FL)/14);sp=3.6+(kai.boost>0?1.6:0);if(kai.boost>0)kai.boost-=dt;
      // you're in the way: go round you, maybe with a step-over
      const dx=me.x-kai.p.x,dz=me.z-kai.p.z,d=Math.hypot(dx,dz);
      if(d<2.2&&dx<0){if(kai.trick<0&&kai.cool<=0&&Math.random()<dt*1.2){kai.trick=0;kai.a.socT={i:0,t0:performance.now()/1000};kai.cool=2.5;}
        tz=kai.p.z+(dz>0?-2:2);}
      if(kai.trick>=0){kai.trick+=dt;if(kai.trick>.75){kai.trick=-1;kai.a.socT=null;kai.boost=1.1;}sp*=.5;}
      const dist=kai.p.x+S.FL;if(dist<9.5&&Math.abs(kai.p.z)<S.FW*.7&&kai.trick<0){// shoot
        socKick(kai.a);SC.own=null;SC.cool=.5;const miss=Math.random()<.3,tzz=miss?(Math.random()<.5?-1:1)*(S.GW+.3+Math.random()):(Math.random()-.5)*2*(S.GW-.5);
        socShoot(b,-1,tzz,.25+Math.random()*1.3,Math.max(.5,dist/15),0);SC.lastTouch='cpu';socV1Hud();}
      // you stole it (tackle) or got close on your own
      if(SC.own==='cpu'&&d<.7&&kai.trick<0&&Math.random()<dt*.6){SC.own=null;b.st='free';b.v.set(dx*2,0,dz*2);socV1Hud();}}
    else if(SC.own==='me'){// mark you: stay between you and his goal (at +x, the one you attack)
      const hx=S.FL-me.x,hz=0-me.z,hl=Math.hypot(hx,hz)||1;tx=me.x+hx/hl*1.0;tz=me.z+hz/hl*1.0;sp=4.3;
      const d=Math.hypot(me.x-kai.p.x,me.z-kai.p.z);if(d<1.05&&kai.cool<=0&&SC.trickT<0){kai.cool=1.1;socPose(kai.a,'tackle');setTimeout(()=>{if(kai.a.socPose===SOC_POSE.tackle)socPose(kai.a,null);},420);
        if(Math.random()<.42){SC.own='cpu';kai.plan=null;toast('Kai took the ball! Tap 🛡️ TACKLE to win it back');tone(200,.12,'sine',.08);socV1Hud();}}}
    else{tx=b.p.x;tz=b.p.z;sp=4.4;// go get it
      if(b.st==='shot'&&b.shot&&b.shot.s>0){tx=Math.min(S.FL-1,b.p.x+1);sp=3;}}}
  const dx=tx-kai.p.x,dz=tz-kai.p.z,dl=Math.hypot(dx,dz);let moved=0;if(dl>.05&&sp>0){const s=Math.min(dl,sp*dt);kai.p.x+=dx/dl*s;kai.p.z+=dz/dl*s;moved=s/dt;kai.face=angDamp(kai.face,Math.atan2(dx,dz),Math.min(1,dt*10));}
  else if(SC.own==='me'){kai.face=angDamp(kai.face,socFace(kai.p.x,kai.p.z,me.x,me.z),Math.min(1,dt*8));}
  // don't walk through you
  {const ox=kai.p.x-me.x,oz=kai.p.z-me.z,od=Math.hypot(ox,oz);if(od<.62&&od>1e-4){kai.p.x=me.x+ox/od*.62;kai.p.z=me.z+oz/od*.62;}}
  kai.p.x=Math.max(-S.FL-1,Math.min(S.FL+1,kai.p.x));kai.p.z=Math.max(-S.FW-1,Math.min(S.FW+1,kai.p.z));kai.sp=moved;
  if(kai.trick>=0||kai.a.socT)socPose(kai.a,kai.a.socPose===SOC_POSE.tackle?'tackle':'trick');else if(kai.a.socPose===SOC_POSE.trick)socPose(kai.a,null);
  kai.a.g.position.copy(kai.p);kai.a.g.rotation.y=kai.face;kai.a.update(dt,moved,false);}

/* ---------- buttons and keys ---------- */
function socPress(){if(!SC.mode||SC.menu)return;if(SC.mode==='jug'){socJugTap();return;}if(SC.mode==='v1'){if(SC.own==='me')socV1Shoot();else if(SC.own==='cpu')socTackle();}}
{const b=$('#scMain');b.addEventListener('pointerdown',e=>{e.preventDefault();socPress();});b.addEventListener('contextmenu',e=>e.preventDefault());
  const tb=$('#scTrick');tb.addEventListener('pointerdown',e=>{e.preventDefault();if(SC.mode==='v1')socV1Trick();});
  addEventListener('keydown',e=>{if(!SC.mode||e.repeat||e.target.tagName==='INPUT')return;if(e.code==='KeyF'||e.code==='Enter'){socPress();e.preventDefault();}if(e.code==='KeyT'&&SC.mode==='v1')socV1Trick();if(e.code==='Escape')socEnd(true,true);});}

/* ---------- hooks into the rest of the game ---------- */
// hold still while you shoot, save or juggle (24e-sports.js asks spLock every frame)
{const was=spLock;spLock=()=>was()||(!!SC.mode&&SC.mode!=='v1');}
// your own Extras ⚽ ball is put away while you play (26d-ball-play.js)
{const was=ballBusy;ballBusy=()=>was()||!!SC.mode;}
// the camera (25-game-loop.js calls sportsCam after the normal follow camera)
{const was=sportsCam;sportsCam=dt=>{was(dt);socCam(dt);};}
function socCam(dt){if(!SC.mode||SC.mode==='v1'||!SC.cam.P)return;const z=socZ(),c=SC.cam;let P=c.P,T=c.T;
  // follow the ball a little once it's kicked
  if((SC.mode==='pk'||SC.mode==='tgt')&&SC.ball&&SC.phase==='fly'&&SC.turn!=='save'){T=_sB.copy(c.T).lerp(SC.ball.p,.35);}
  const wp=z.g.localToWorld(_sA.copy(P)),wt=z.g.localToWorld(new THREE.Vector3().copy(T));
  if(!c.init){c.p.copy(wp);c.t.copy(wt);c.init=true;}c.p.lerp(wp,Math.min(1,dt*5));c.t.lerp(wt,Math.min(1,dt*6));camera.position.copy(c.p);camera.lookAt(c.t);}
// the per-frame step: runs after the player moved and after the basketball games, before the camera
anims.push((t,dt)=>{const z=socZ();SC.clock=(SC.clock||0)+dt;
  if(!SC.mode&&started&&!closetOpen&&!SC.menu&&!SP.mode&&!mapOpen){const p=player.pos,[lx,lz]=z.toLocal(p.x,p.z),d=Math.hypot(lx-z.pad.lx,lz-z.pad.lz);
    if(d<z.pad.r&&player.onGround){if(!SC.onPad){SC.onPad=true;socOpenMenu();}}else if(d>1.3)SC.onPad=false;}
  if(curZone!==SC.lastZone){SC.lastZone=curZone;if(started&&!SC.mode&&curZone===z)setTimeout(()=>toast('Step on the ⚽ pad to play soccer!'),1600);}
  // the corner flags flutter
  if(z.flags&&Math.abs(player.pos.x-z.x)+Math.abs(player.pos.z-z.z)<90)for(let i=0;i<z.flags.length;i++)z.flags[i].rotation.y=Math.PI/2+Math.sin(t*3+i)*.25;
  if(!SC.mode){socNetStep(dt);return;}
  if(closetOpen){socEnd(false);return;}
  if(SC.mode==='pk')socPkStep(dt,t);else if(SC.mode==='tgt')socTgtStep(dt,t);else if(SC.mode==='jug')socJugStep(dt,t);else if(SC.mode==='v1')socV1Step(dt,t);
  if(!SC.mode)return;
  if(!SC.dive){av.g.position.copy(player.pos);av.g.rotation.z=0;}av.g.rotation.y=player.face+(av.spinY||0)+(SC.mode==='v1'?SC.spinA||0:0);
  if(SC.mode!=='pk'||SC.turn!=='save'){if(av.socPose===SOC_POSE.keeper||av.socPose===SOC_POSE.dive)socPose(av,null);}
  if(SC.mode==='v1'&&!av.socT&&av.socPose===SOC_POSE.trick)socPose(av,null);if(av.socT&&av.socPose!==SOC_POSE.trick)socPose(av,'trick');
  av.tag.visible=SC.mode==='v1';});
window.__soccer={SC,SOC,start:socStart,end:socEnd,menu:socOpenMenu,shoot:(tz,ty,T,curl)=>{SC.shot={tz,ty,T,curl:curl||0,top:ty>SOC.GH-.75&&Math.abs(tz)>SOC.GW-1.1};socKick(av);SC.phase='kick';SC.pt=0;},
  dive:(sx,up)=>socPlayerDive({pts:[[innerWidth/2,innerHeight/2],[innerWidth/2+sx*120,innerHeight/2-(up?120:0)]]}),swiped:socSwiped,press:socPress,trick:socV1Trick,screen:socScreen};
