/* ================= 🏰 SANDCASTLE (Beach Day) =================
   Step on the glowing bucket pad at the beach and build a sandcastle, one hands-on step at a time:
   🪣 tap the sand pile to scoop sand into your bucket, 💧 press and hold to add just enough sea water,
   🏰 tap glowing spots to flip the bucket into towers (round, square or pointy), 🧱 pat up the walls,
   🌊 drag your finger around the castle to dig a moat (the sea fills it), then ✨ stick on shells, starfish,
   sea glass, pebbles and flags, and add a crab friend. The castle stays on the beach (SAVE.sand) until you
   let a wave wash it away and build a new one. Everything lives in the beach's own local space. */
const SC_C={lx:4,lz:3.2};// the middle of the castle, in the beach's local space (+z is toward town, -z is the sea)
const SC_STEPS=[['dig','🪣','Sand'],['water','💧','Water'],['towers','🏰','Towers'],['walls','🧱','Walls'],['moat','🌊','Moat'],['deco','✨','Decorate']];
const SC_SHAPES=[['round','🪣','Round'],['square','🧊','Square'],['pointy','🍦','Pointy']];
const SC_DECO=[['shell','🐚','Shell'],['star','⭐','Starfish'],['glass','💎','Sea glass'],['pebble','🪨','Pebble'],['flag','🚩','Flag'],['crab','🦀','Crab']];
const SC_DCOL={shell:['#ffd9c9','#ffb3c7','#fff3e0','#e7c6ff'],star:['#ff8a5c','#ff6fae','#ffd23f'],glass:['#6fe3d1','#8fd8ff','#b388ff','#7ee081'],
  pebble:['#9aa0a8','#c2b8a8','#6e6a66'],flag:['#ff3b6b','#ffd23f','#4fb6ff','#7ee081','#b388ff','#ff8a1f']};
const SC_SLOTS=[[-.75,-.75],[.75,-.75],[.75,.75],[-.75,.75],[0,0]];// four corner towers and the big keep in the middle
const SC_WALLS=[[0,-.75,0],[.75,0,Math.PI/2],[0,.75,0],[-.75,0,Math.PI/2]];// x, z, turn. The one at +z (toward you) has the gate.
const SC_TOP={round:.82,square:.83,pointy:1.05};// how tall each tower is, for the flags
const SC_SEGS=16,SC_SCOOPS=6,SC_MAXDECO=80,SC_PILE=[-2.4,.2],SC_BUCKET=[-1.6,.95],SC_CAN=[-3.2,-.1],SC_STAND=[-3.25,1.35];
const scBlank=()=>({step:0,tw:[null,null,null,null,null],wl:[0,0,0,0],mo:Array(SC_SEGS).fill(0),wet:0,deco:[],crab:0,done:0});
SAVE.sand=(()=>{const b=scBlank(),s=SAVE.sand;if(!s||typeof s!=='object')return b;const v={...b,...s};
  if(!Array.isArray(v.tw)||v.tw.length!==5)v.tw=b.tw;if(!Array.isArray(v.wl)||v.wl.length!==4)v.wl=b.wl;
  if(!Array.isArray(v.mo)||v.mo.length!==SC_SEGS)v.mo=b.mo;if(!Array.isArray(v.deco))v.deco=[];v.step=Math.max(0,Math.min(5,v.step|0));return v;})();
let sandOpen=false,onSPad=false;
const SD={scoops:0,fill:0,pid:null,dig:null,busy:false,tw:[],shape:'round',deco:'shell',wave:0,flood:0,
  cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),dy:0,dp:0,id:null,x:0,y:0}};
const scStep=()=>SC_STEPS[SAVE.sand.step][0];

/* ---------- the things on the beach ---------- */
const SCX={};
{const z=Z.beach,g=z.g;
 const sandM=SCX.sandM=std('#e6c48c',{map:TEX.sand,roughness:1}),wetM=std('#c9a06a',{map:TEX.sand,roughness:.95});
 const root=SCX.root=new THREE.Group();root.position.set(SC_C.lx,0,SC_C.lz);g.add(root);
 // a smooth patch of packed sand to build on
 {const m=std('#e9cf9e',{map:TEX.sand,roughness:1});m.polygonOffset=true;m.polygonOffsetFactor=-3;m.polygonOffsetUnits=-3;
  M(new THREE.CircleGeometry(2.25,48),m,0,.026,0,root,false,true).rotation.x=-Math.PI/2;}
 // everything a wave can wash away goes in "castle"
 const castle=SCX.castle=new THREE.Group();root.add(castle);
 SCX.tw=[null,null,null,null,null];
 SCX.wl=SC_WALLS.map(([x,zz,r],i)=>{const w=new THREE.Group();w.position.set(x,0,zz);w.rotation.y=r;castle.add(w);
   M(box(1.2,.42,.2),sandM,0,.21,0,w);for(const cx of [-.45,-.15,.15,.45])M(box(.14,.1,.2),sandM,cx,.47,0,w);
   if(i===2){M(box(.32,.3,.03),std('#7a5a36',{roughness:1}),0,.15,.105,w,false,false);M(cyl(.16,.16,.03,16,1),std('#7a5a36',{roughness:1}),0,.3,.105,w,false,false).rotation.x=Math.PI/2;}
   w.visible=false;return w;});
 // the moat: 16 pieces of dug, wet sand around the castle, then sea water and a little bridge over it at the gate
 {const m=wetM.clone();m.polygonOffset=true;m.polygonOffsetFactor=-6;m.polygonOffsetUnits=-6;
  SCX.segs=[];for(let i=0;i<SC_SEGS;i++){const s=M(new THREE.RingGeometry(1.5,2.0,4,1,i/SC_SEGS*Math.PI*2,Math.PI*2/SC_SEGS+.01),m,0,.045,0,castle,false,true);s.rotation.x=-Math.PI/2;s.visible=false;SCX.segs.push(s);}
  const wm=SCX.waterM=phys('#4fc3f7',{roughness:.05,clearcoat:1,transparent:true,opacity:0,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8});
  SCX.water=M(new THREE.RingGeometry(1.54,1.96,64),wm,0,.06,0,castle,false,false);SCX.water.rotation.x=-Math.PI/2;SCX.water.visible=false;
  const guide=SCX.guideM=glow('#ffffff',1.1);guide.transparent=true;guide.opacity=.25;guide.depthWrite=false;
  SCX.guide=M(new THREE.RingGeometry(1.72,1.78,64),guide,0,.045,0,root,false,false);SCX.guide.rotation.x=-Math.PI/2;SCX.guide.visible=false;
  const wood=std('#a87a52',{roughness:.85});SCX.bridge=new THREE.Group();castle.add(SCX.bridge);SCX.bridge.visible=false;
  for(let k=0;k<4;k++)M(box(.5,.035,.15),wood,0,.06,1.45+k*.18,SCX.bridge);for(const s of [-1,1])M(box(.03,.03,.72),wood,s*.24,.09,1.72,SCX.bridge);}
 SCX.decoG=new THREE.Group();castle.add(SCX.decoG);
 // a sand pile, a shovel, a bucket and a watering can
 SCX.pile=M(sph(.6,28,12,0,Math.PI*2,0,Math.PI/2),sandM,SC_PILE[0],0,SC_PILE[1],root);SCX.pile.scale.set(1,.6,1);
 {const s=SCX.shovel=new THREE.Group();root.add(s);M(cyl(.022,.022,.55,8),phys('#ffd23f',{roughness:.4,clearcoat:.5}),0,.3,0,s);M(box(.16,.05,.04),phys('#ffd23f'),0,.58,0,s);
  const blade=M(new THREE.SphereGeometry(.11,14,8,0,Math.PI*2,0,Math.PI/2.4),phys('#ff3b6b',{roughness:.35,clearcoat:.6,side:THREE.DoubleSide}),0,.02,0,s);blade.scale.set(1,.5,1.2);blade.rotation.x=Math.PI;
  s.userData.home={x:SC_PILE[0]+.12,y:.28,z:SC_PILE[1]-.05,rz:.45};}
 {const b=SCX.bucket=new THREE.Group();root.add(b);
  const pts=[[0,0],[.15,0],[.2,.3],[.215,.31],[.205,.315]].map(([a,c])=>new THREE.Vector2(a,c));
  M(new THREE.LatheGeometry(pts,28),phys('#ff6fae',{roughness:.35,clearcoat:.7,side:THREE.DoubleSide}),0,0,0,b);
  const h=M(new THREE.TorusGeometry(.2,.01,6,24,Math.PI),phys('#ffd23f'),0,.3,0,b,false,false);h.rotation.y=Math.PI/2;
  SCX.fillM=std('#e6c48c',{map:TEX.sand,roughness:1});SCX.fill=M(cyl(.19,.15,1,24),SCX.fillM,0,.01,0,b,false,false);SCX.fill.geometry.translate(0,.5,0);SCX.fill.scale.y=.001;
  b.userData.home={x:SC_BUCKET[0],y:0,z:SC_BUCKET[1]};b.position.set(SC_BUCKET[0],0,SC_BUCKET[1]);}
 {const c=SCX.can=new THREE.Group();root.add(c);const cm=phys('#2fd1c5',{roughness:.3,clearcoat:.6});
  M(cyl(.12,.14,.22,20),cm,0,.11,0,c);const sp=M(cyl(.018,.03,.3,10),cm,-.17,.17,0,c);sp.rotation.z=1.0;M(cyl(.04,.025,.03,10),cm,-.29,.25,0,c).rotation.z=1.0;
  const hd=M(new THREE.TorusGeometry(.09,.015,6,16,Math.PI),cm,.06,.22,0,c,false,false);hd.rotation.z=-.4;
  c.userData.home={x:SC_CAN[0],y:0,z:SC_CAN[1]};c.position.set(SC_CAN[0],0,SC_CAN[1]);c.rotation.y=.5;
  SCX.spout=new THREE.Object3D();SCX.spout.position.set(-.3,.26,0);c.add(SCX.spout);}
 SCX.stream=M(cyl(.012,.012,1,8),phys('#7fd6ff',{roughness:.05,transparent:true,opacity:.85}),0,0,0,root,false,false);SCX.stream.visible=false;
 // glowing spots for the towers and the walls
 const spotM=SCX.spotM=glow('#ffd23f',1.5);spotM.transparent=true;spotM.depthWrite=false;
 SCX.spots=SC_SLOTS.map(([x,zz],i)=>{const r=M(new THREE.RingGeometry(i===4?.3:.2,i===4?.42:.3,32),spotM,x,.05,zz,root,false,false);r.rotation.x=-Math.PI/2;r.visible=false;return r;});
 SCX.marks=SC_WALLS.map(([x,zz])=>{const r=M(new THREE.CircleGeometry(.13,24),spotM,x,.05,zz,root,false,false);r.rotation.x=-Math.PI/2;r.visible=false;return r;});
 // a crab friend that scuttles around the castle
 {const c=SCX.crab=new THREE.Group();root.add(c);c.visible=false;const red=phys('#ff4d3a',{roughness:.35,clearcoat:.6});
  const body=M(sph(.09,16,10),red,0,.07,0,c);body.scale.set(1.3,.6,1);
  for(const s of [-1,1]){M(cyl(.008,.008,.06,6),red,s*.035,.12,.04,c);M(sph(.016,8,6),std('#ffffff'),s*.035,.155,.04,c);M(sph(.008,6,4),std('#1d1d22'),s*.035,.158,.053,c);
    const cl=M(sph(.035,10,8),red,s*.15,.07,.07,c);cl.scale.set(1,.7,1.3);for(let k=0;k<3;k++){const l=M(cyl(.007,.007,.09,5),red,s*.11,.04,-.03+k*.035,c);l.rotation.z=s*1.1;}}}
 // obstacle so you walk around the castle (and not through the moat)
 {const [ox,oz]=z.toWorld(SC_C.lx,SC_C.lz);SCX.ob={x:ox,z:oz,r:0};obs.push(SCX.ob);}
 // the glowing bucket pad: step on it to start
 const padMat=glow('#ffb347',1.4);padMat.transparent=true;const PD=SCX.pad={lx:SC_C.lx,lz:SC_C.lz+3.0,r:.6};
 M(new THREE.RingGeometry(.45,.62,40),padMat,PD.lx,.05,PD.lz,g,false,false).rotation.x=-Math.PI/2;
 M(new THREE.CircleGeometry(.45,40),phys('#fff1d6',{roughness:.3,emissive:'#ffb347',emissiveIntensity:.25}),PD.lx,.045,PD.lz,g,false,true).rotation.x=-Math.PI/2;
 const bt=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🪣',64,70);});
 M(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:bt,transparent:true,depthWrite:false}),PD.lx,.055,PD.lz,g,false,false).rotation.x=-Math.PI/2;
 const lbl=SCX.padLbl=sprite(labelTex('🏰 Build a sandcastle!',{size:50,fg:'#e07b00',border:'#ffe0b0'}),1.9,.47);lbl.position.set(PD.lx,1.05,PD.lz);g.add(lbl);
 anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});}

/* ---------- building the castle from SAVE.sand ---------- */
const scMats={};const scMat=(key,make)=>scMats[key]||(scMats[key]=make());// one material per look, shared by every tower and decoration
function scTower(shape,big){const t=new THREE.Group(),m=SCX.sandM,dark=scMat('door',()=>std('#8a6a44',{roughness:1}));
  if(shape==='square'){M(box(.5,.7,.5),m,0,.35,0,t);for(const [x,zz] of [[-1,-1],[1,-1],[1,1],[-1,1]])M(box(.13,.13,.13),m,x*.185,.765,zz*.185,t);M(box(.09,.13,.02),dark,0,.45,.255,t,false,false);}
  else if(shape==='pointy'){M(cyl(.24,.3,.55,18),m,0,.275,0,t);M(new THREE.ConeGeometry(.3,.5,18),m,0,.8,0,t);M(box(.08,.12,.02),dark,0,.32,.275,t,false,false);}
  else{M(cyl(.27,.3,.7,20),m,0,.35,0,t);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M(box(.11,.12,.11),m,Math.sin(a)*.21,.76,Math.cos(a)*.21,t).rotation.y=a;}M(box(.08,.12,.02),dark,0,.45,.285,t,false,false);}
  if(big)t.scale.set(1.35,1.55,1.35);return t;}
function scSetTower(i,shape){const old=SCX.tw[i];if(old){SCX.castle.remove(old);old.traverse(o=>{if(o.geometry)o.geometry.dispose();});}SCX.tw[i]=null;
  if(!shape)return null;const t=scTower(shape,i===4);t.position.set(SC_SLOTS[i][0],0,SC_SLOTS[i][1]);SCX.castle.add(t);SCX.tw[i]=t;return t;}
const scTowerTop=i=>{const s=SAVE.sand.tw[i];return s?SC_TOP[s]*(i===4?1.55:1):0;};
function scDecoMesh(d){const [k,x,y,zz,nx,ny,nz,ci]=d,cols=SC_DCOL[k]||['#ffffff'],c=cols[(ci|0)%cols.length],g=new THREE.Group();
  if(k==='shell'){const s=M(sph(.055,12,6,0,Math.PI*2,0,Math.PI/2),scMat('shell'+c,()=>phys(c,{roughness:.3,clearcoat:1})),0,0,0,g,false,false);s.scale.set(1,.55,1.25);}
  else if(k==='star'){const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.028:.07;sh[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r);}
    const geo=new THREE.ExtrudeGeometry(sh,{depth:.015,bevelEnabled:true,bevelThickness:.008,bevelSize:.006,bevelSegments:1});geo.rotateX(-Math.PI/2);M(geo,scMat('star'+c,()=>phys(c,{roughness:.6})),0,0,0,g,false,false);}
  else if(k==='glass'){M(new THREE.OctahedronGeometry(.045),scMat('glass'+c,()=>phys(c,{roughness:.05,clearcoat:1,transparent:true,opacity:.8})),0,.02,0,g,false,false);}
  else if(k==='pebble'){M(sph(.045,10,8),scMat('pebble'+c,()=>std(c,{roughness:.8})),0,0,0,g,false,false).scale.set(1.2,.6,1);}
  else if(k==='flag'){M(cyl(.007,.007,.36,6),scMat('pole',()=>std('#ffffff')),0,.18,0,g,false,false);const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.16,-.045);sh.lineTo(0,-.09);
    const f=M(new THREE.ShapeGeometry(sh),scMat('flag'+c,()=>phys(c,{side:THREE.DoubleSide,roughness:.6})),0,.36,0,g,false,false);g.userData.flag=f;}
  g.position.set(x,y,zz);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nx,ny,nz).normalize());if(k!=='flag')g.rotateY((ci|0)*1.7);
  SCX.decoG.add(g);return g;}
function scBuild(){const S=SAVE.sand;
  for(let i=0;i<5;i++)scSetTower(i,S.tw[i]);
  SCX.wl.forEach((w,i)=>{w.visible=!!S.wl[i];w.scale.y=1;});
  SCX.segs.forEach((s,i)=>s.visible=!!S.mo[i]);
  SCX.water.visible=!!S.wet;SCX.waterM.opacity=S.wet?.85:0;SCX.bridge.visible=!!S.wet;
  while(SCX.decoG.children.length){const c=SCX.decoG.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  S.deco.forEach(d=>{if(Array.isArray(d)&&d.length>=7)scDecoMesh(d);});
  SCX.crab.visible=!!S.crab;
  SCX.castle.scale.set(1,1,1);SCX.castle.position.y=0;
  const left=S.step<=0?1-SD.scoops/SC_SCOOPS*.6:.4;SCX.pile.scale.set(left,.6*left,left);
  scBucketFill();scObstacle();}
function scBucketFill(){const S=SAVE.sand,f=S.step===0?SD.scoops/SC_SCOOPS:S.step<=2?1:0;SCX.fill.scale.y=Math.max(.001,f*.27);
  const wet=S.step===1?Math.min(1,SD.fill):S.step>=2?1:0;SCX.fillM.color.set('#e6c48c').lerp(new THREE.Color('#b88d58'),wet);}
function scObstacle(){const S=SAVE.sand;SCX.ob.r=S.mo.some(Boolean)||S.wet?2.0:S.tw.some(Boolean)||S.wl.some(Boolean)?1.15:0;}
scBuild();

/* ---------- open and close ---------- */
function openSand(){if(closetOpen)return;closeTalk();const z=Z.beach;sandOpen=closetOpen=true;SCX.padLbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  if(SAVE.sand.step>0)SD.scoops=SC_SCOOPS;SD.fill=SAVE.sand.step>1?1:0;
  const [px,pz]=z.toWorld(SC_C.lx+SC_STAND[0],SC_C.lz+SC_STAND[1]),[cx,cz]=z.toWorld(SC_C.lx,SC_C.lz);player.pos.set(px,groundAt(px,pz),pz);player.vy=0;player.speed=0;player.face=Math.atan2(cx-px,cz-pz);
  SD.cam.p.copy(camera.position);SD.cam.t.copy(cam.fv||player.pos);SD.cam.dy=SD.cam.dp=0;
  scBuild();renderSand();$('#sand').classList.add('show');$('#sandBody').scrollTop=0;sfx('tada');
  if(!SAVE.sand.step&&!SD.scoops)setTimeout(()=>{if(sandOpen)toast('Let\'s build a sandcastle! 🏰');},400);
  if(scStep()==='moat'&&SAVE.sand.mo.every(Boolean)&&!SAVE.sand.wet)scFlood();// you left while the sea was still filling the moat
}
function closeSand(){if(!sandOpen)return;const z=Z.beach;sandOpen=closetOpen=false;SCX.padLbl.visible=true;SD.pid=SD.dig=SD.cam.id=null;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  document.body.classList.remove('dressing');$('#sand').classList.remove('show');persist();cam.yaw=cam.cy=z.rot;player.face=z.rot;
  SCX.stream.visible=false;scResetProps();scBuild();
  toast(SAVE.sand.done?'Your sandcastle looks amazing! 🏰✨':SAVE.sand.step||SD.scoops?'Come back to finish your sandcastle 🏖️':'See you at the beach! 🏖️');}

/* ---------- the panel ---------- */
{const st=document.createElement('style');st.textContent=`
#sand{position:fixed;z-index:8;left:0;right:0;bottom:0;height:min(40vh,380px);background:#fffaf0;border-radius:26px 26px 0 0;box-shadow:0 -8px 30px rgba(87,59,35,.25);display:flex;flex-direction:column;transform:translateY(105%);transition:transform .35s cubic-bezier(.2,.9,.3,1);padding-bottom:env(safe-area-inset-bottom)}
#sand.show{transform:none}
@media (orientation:landscape) and (min-aspect-ratio:5/4){#sand{left:auto;top:0;width:min(42vw,420px);height:auto;border-radius:26px 0 0 26px;transform:translateX(105%);padding-right:env(safe-area-inset-right)}}
#sandDone{background:#ff9f1c;color:#fff;font-weight:700;padding:9px 18px;border-radius:999px;font-size:16px;box-shadow:0 3px 0 #d97a00}
#sandPhoto{width:40px;height:40px;border-radius:50%;background:#ffecc9;font-size:20px}
#sand .gpips span.on{background:#ff9f1c}
#sandBody .btn{font-size:17px;padding:11px 20px;margin:10px 6px 2px 0;background:linear-gradient(90deg,#ff9f1c,#ffcf5c);box-shadow:0 4px 0 #d97a00}
#sandBody .btn.sea{background:linear-gradient(90deg,#2f9bd9,#6fd3ff);box-shadow:0 4px 0 #1f78ad}
#sandBody .btn.soft{background:#f3e7d3;color:#6b4a2a;box-shadow:0 4px 0 #dcc7a6}
#sand .gbar i{background:linear-gradient(90deg,#4fb6ff,#8fe0ff)}
.stray{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.stray button{background:#fff3e0;border:2px solid #f2dcb8;border-radius:16px;padding:8px 2px;font-size:24px;display:flex;flex-direction:column;align-items:center;gap:2px}
.stray button span{font-size:13px;font-weight:700}
.stray button.on{border-color:#ff9f1c;background:#ffe2b3;box-shadow:0 0 0 2px #ffcf5c inset}
.stray button:active{transform:scale(.94)}`;document.head.appendChild(st);
 document.body.insertAdjacentHTML('beforeend',`<div id="sand" aria-label="Sandcastle"><div class="chead"><h2>🏰 Sandcastle</h2><button id="sandPhoto" aria-label="Take a picture">📸</button><button id="sandDone">Done</button></div><div class="ccontent" id="sandBody"></div></div>`);}
$('#sandDone').onclick=closeSand;$('#sandPhoto').onclick=()=>{wantPhoto=true;};
function scSay(){const S=SAVE.sand,st=scStep();
  if(SD.wave)return 'Here comes a big wave! 🌊';
  if(st==='dig')return `Tap the sand pile to scoop sand into your bucket. (${SD.scoops} of ${SC_SCOOPS})`;
  if(st==='water')return 'Press and hold to pour in sea water. Let go in the green part so the sand sticks together!';
  if(st==='towers')return `Pick a shape, then tap a glowing spot to flip your bucket into a tower. (${S.tw.filter(Boolean).length} of 5)`;
  if(st==='walls')return `Tap the glowing spots between the towers to pat up the walls. (${S.wl.filter(Boolean).length} of 4)`;
  if(st==='moat')return SD.flood?'The sea is filling your moat! 💦':`Drag your finger around the castle to dig a moat. (${Math.round(S.mo.filter(Boolean).length/SC_SEGS*100)}% dug)`;
  return S.done?'Your castle is finished! Keep decorating, or let a wave wash it away and build a new one.':'Pick a decoration, then tap your castle or the sand to stick it on.';}
function renderSand(){const S=SAVE.sand,st=scStep();
  let h=`<div class="gpips">${SC_STEPS.map((_,k)=>`<span class="${k<S.step||S.done?'ok':k===S.step?'on':''}"></span>`).join('')}</div><p class="gsay">${scSay()}</p>`;
  if(SD.wave){$('#sandBody').innerHTML=h;return;}
  if(st==='water')h+=`<div class="gbar"><em></em><i id="sandBarI" style="width:${Math.min(100,SD.fill*100)}%"></i></div><p class="drawhint">Water in the sand. Stop in the green part!</p>`;
  if(st==='towers')h+=`<div class="stray">${SC_SHAPES.map(([id,e,n])=>`<button class="${SD.shape===id?'on':''}" data-shape="${id}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`;
  if(st==='deco'){h+=`<div class="stray">${SC_DECO.map(([id,e,n])=>`<button class="${id==='crab'?(S.crab?'on':''):SD.deco===id?'on':''}" data-deco="${id}"><b>${e}</b><span>${id==='crab'&&S.crab?'Bye crab':n}</span></button>`).join('')}</div>`;
    h+=S.done?`<button class="btn sea" data-wave="1">🌊 Wash it away and build a new one</button>`:`<button class="btn" data-finish="1">🏰 All done!</button>`;
    if(S.deco.length)h+=`<button class="btn soft" data-undo="1">↩️ Undo</button>`;}
  $('#sandBody').innerHTML=h;}
$('#sandBody').onclick=e=>{const b=e.target.closest('button');if(!b||SD.busy||SD.wave)return;const d=b.dataset,S=SAVE.sand;
  if(d.shape){SD.shape=d.shape;sfx('pop');renderSand();return;}
  if(d.deco){if(d.deco==='crab'){S.crab=S.crab?0:1;SCX.crab.visible=!!S.crab;persist();sfx('pop');if(S.crab){did('sandcrab');toast('A crab friend came to visit! 🦀');}renderSand();return;}
    SD.deco=d.deco;sfx('pop');renderSand();return;}
  if(d.undo){S.deco.pop();persist();scBuild();sfx('pop');renderSand();return;}
  if(d.finish){scFinish();return;}
  if(d.wave){scWave();return;}};

/* ---------- steps ---------- */
function scTw(d,f,done){SD.tw.push({t:0,d,f,done});}
const scV=new THREE.Vector3(),scV2=new THREE.Vector3(),scQ=new THREE.Quaternion();
const scWorld=(x,y,zz)=>SCX.root.localToWorld(new THREE.Vector3(x,y,zz));
const scSnd={scoop(){tone(260,.12,'triangle',.08,0,140);tone(5200,.08,'sawtooth',.012,.02,3000);},pat(){tone(120,.09,'sine',.22);tone(90,.08,'triangle',.08,.02);},
  thump(){tone(85,.18,'sine',.28);tone(160,.1,'triangle',.08);},dig(){tone(1800+Math.random()*900,.05,'sawtooth',.012,0,900);}};
function scNext(){const S=SAVE.sand;S.step=Math.min(5,S.step+1);persist();SD.cam.dy=SD.cam.dp=0;sfx('pop');
  const st=scStep();if(st==='water')toast('Now add some sea water 💧');if(st==='towers')toast('Wet sand is perfect for towers! 🏰');if(st==='walls')toast('Now the walls 🧱');
  if(st==='moat')toast('Dig a moat around it 🌊');if(st==='deco')toast('Time to decorate! ✨');scBucketFill();renderSand();}
function scScoop(){SD.busy=true;const s=SCX.shovel,h=s.userData.home,B=SC_BUCKET;scSnd.scoop();
  scTw(.25,k=>{s.position.set(h.x-.12*k,h.y-.15*k,h.z);s.rotation.z=h.rz+.4*k;},()=>{
    const p0=s.position.clone();SCX.pile.scale.multiplyScalar(.93);SCX.pile.scale.y=Math.max(.2,SCX.pile.scale.y);
    burst(scWorld(SC_PILE[0],.3,SC_PILE[1]),'#e6c48c',10,.8,.05);
    scTw(.45,k=>{s.position.set(p0.x+(B[0]+.1-p0.x)*k,p0.y+Math.sin(k*Math.PI)*.35+(.5-p0.y)*k,p0.z+(B[1]-p0.z)*k);s.rotation.z=h.rz+.4-2.3*k;},()=>{
      SD.scoops++;scBucketFill();burst(scWorld(B[0],.35,B[1]),'#e6c48c',12,.6,.05);tone(200,.08,'triangle',.08);
      const p1=s.position.clone(),r1=s.rotation.z;
      scTw(.35,k=>{s.position.lerpVectors(p1,scV.set(h.x,h.y,h.z),k);s.rotation.z=r1+(h.rz-r1)*k;},()=>{SD.busy=false;if(SD.scoops>=SC_SCOOPS)scNext();else renderSand();});});});}
function scPourDone(spill){SD.pid=null;SCX.stream.visible=false;
  if(spill){toast('Too runny! You mixed in a scoop of dry sand 😄');SD.fill=.88;}else toast('Perfect packing sand! 👍');scNext();}
function scFlip(i){SD.busy=true;const S=SAVE.sand,b=SCX.bucket,h=b.userData.home,[sx,sz]=SC_SLOTS[i],big=i===4,shape=SD.shape;sfx('pop');
  // up and over, flip upside down, then thump it down onto the sand
  scTw(.5,k=>{b.position.set(h.x+(sx-h.x)*k,Math.sin(k*Math.PI/2)*1.1,h.z+(sz-h.z)*k);b.rotation.x=Math.PI*k;b.scale.setScalar(1+(big?.7:.35)*k);},()=>{
    scTw(.18,k=>{b.position.y=1.1-(1.1-.32*(big?1.7:1.35))*k*k;},()=>{scSnd.thump();burst(scWorld(sx,.1,sz),'#e6c48c',20,1.2,.06);
      S.tw[i]=shape;persist();const t=scSetTower(i,shape);t.visible=false;
      setTimeout(()=>scSnd.pat(),120);setTimeout(()=>scSnd.pat(),260);
      scTw(.35,()=>{},()=>{t.visible=true;const ty=t.scale.y,y0=b.position.y;
        scTw(.55,k=>{b.position.y=y0+k*.9;t.scale.y=ty*(k<.7?.25+k/.7*.85:1.1-(k-.7)/.3*.1);},()=>{
          scTw(.45,k=>{b.position.set(sx+(h.x-sx)*k,1+Math.sin(k*Math.PI)*.3-k,sz+(h.z-sz)*k);b.rotation.x=Math.PI*(1-k);b.scale.setScalar(1+(big?.7:.35)*(1-k));},()=>{
            b.position.set(h.x,0,h.z);b.rotation.set(0,0,0);b.scale.setScalar(1);SD.busy=false;scObstacle();
            if(S.tw.every(Boolean))scNext();else renderSand();});});});});});}
function scWall(i){SD.busy=true;const S=SAVE.sand,w=SCX.wl[i];S.wl[i]=1;persist();w.visible=true;w.scale.y=.01;
  for(let k=0;k<3;k++)setTimeout(()=>{scSnd.pat();burst(scWorld(SC_WALLS[i][0],.3,SC_WALLS[i][1]),'#e6c48c',8,.7,.05);},k*170);
  scTw(.6,k=>{w.scale.y=Math.max(.01,k<.8?k/.8*1.06:1.06-(k-.8)/.2*.06);},()=>{w.scale.y=1;SD.busy=false;scObstacle();if(S.wl.every(Boolean))scNext();else renderSand();});}
function scDigAt(e){const S=SAVE.sand;if(scStep()!=='moat'||SD.flood)return false;const p=scGround(e);if(!p)return false;const r=Math.hypot(p.x,p.z);if(r<1.15||r>2.5)return false;
  const a=((Math.atan2(-p.z,p.x)%(Math.PI*2))+Math.PI*2)%(Math.PI*2),i=Math.floor(a/(Math.PI*2/SC_SEGS))%SC_SEGS;
  if(!S.mo[i]){S.mo[i]=1;SCX.segs[i].visible=true;scSnd.dig();burst(scWorld(Math.cos(a+Math.PI/SC_SEGS)*1.75,.1,-Math.sin(a+Math.PI/SC_SEGS)*1.75),'#c9a06a',6,.6,.04);scObstacle();
    if(S.mo.every(Boolean))scFlood();else renderSand();}
  return true;}
function scFlood(){const S=SAVE.sand;SD.flood=1;SD.dig=null;SCX.water.visible=true;SCX.waterM.opacity=0;renderSand();
  for(let k=0;k<6;k++)setTimeout(()=>sfx('splash'),k*200);
  scTw(1.6,k=>{SCX.waterM.opacity=k*.85;},()=>{S.wet=1;persist();SCX.bridge.visible=true;SD.flood=0;did('sandmoat');scNext();});}
function scFinish(){const S=SAVE.sand;if(S.done)return;S.done=1;persist();did('sandcastle');sfx('tada');banner('🏰 What a beautiful sandcastle!');
  burst(scWorld(0,1.4,0),rnd(['#ffd23f','#ff6fae','#4fb6ff','#7ee081']),40,2.2,.09);try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}if(av.play)av.play('cheer');
  if(Date.now()-(SAVE.sandPaid||0)>3e5){SAVE.sandPaid=Date.now();persist();setTimeout(()=>earn(8,'Sandcastle built!'),700);}renderSand();}
function scWave(){if(SD.wave)return;SD.wave=.001;did('sandwave');for(let k=0;k<4;k++)setTimeout(()=>sfx('splash'),600+k*220);tone(90,1.6,'sawtooth',.03,0,50);renderSand();}
function scResetProps(){const b=SCX.bucket,h=b.userData.home;b.position.set(h.x,0,h.z);b.rotation.set(0,0,0);b.scale.setScalar(1);
  const s=SCX.shovel,sh=s.userData.home;s.position.set(sh.x,sh.y,sh.z);s.rotation.set(0,0,sh.rz);const c=SCX.can,ch=c.userData.home;c.position.set(ch.x,0,ch.z);c.rotation.set(0,.5,0);
  SD.tw.length=0;SD.busy=false;SD.flood=0;}
scResetProps();

/* ---------- tapping and dragging ---------- */
const scPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.03);
function scRay(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);}
function scGround(e){scRay(e);const w=ray.ray.intersectPlane(scPlane,new THREE.Vector3());return w?SCX.root.worldToLocal(w):null;}
function scScr(v){scV2.copy(v).project(camera);return [(scV2.x+1)/2*innerWidth,(1-scV2.y)/2*innerHeight,scV2.z];}
function scNear(e,pts,R){R*=isTouch?1.25:1;let best=-1,bd=R;pts.forEach((p,i)=>{if(!p)return;const [x,y,zz]=scScr(p);if(zz>1)return;const d=Math.hypot(x-e.clientX,y-e.clientY);if(d<bd){bd=d;best=i;}});return best;}
function scPlace(e){const S=SAVE.sand;if(S.deco.length>=SC_MAXDECO){toast('Your castle is full of treasures! ✨');return true;}
  const ci=Math.floor(Math.random()*12),k=SD.deco;
  if(k==='flag'){const tops=SC_SLOTS.map(([x,zz],i)=>S.tw[i]?scWorld(x,scTowerTop(i),zz):null);const i=scNear(e,tops,90);if(i<0){toast('Tap the top of a tower to put a flag on it 🚩');return true;}
    if(S.deco.some(d=>d[0]==='flag'&&Math.abs(d[1]-SC_SLOTS[i][0])<.01&&Math.abs(d[3]-SC_SLOTS[i][1])<.01)){toast('That tower already has a flag 🚩');return true;}
    const d=['flag',SC_SLOTS[i][0],scTowerTop(i)-(S.tw[i]==='pointy'?.03:.02),SC_SLOTS[i][1],0,1,0,ci];S.deco.push(d);const m=scDecoMesh(d);scPop(m);persist();did('sanddeco',k);renderSand();return true;}
  scRay(e);const solid=[...SCX.tw.filter(Boolean),...SCX.wl.filter(w=>w.visible)];const hit=ray.intersectObjects(solid,true)[0];let p,n;
  if(hit&&hit.face){p=SCX.castle.worldToLocal(hit.point.clone());n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld).applyQuaternion(SCX.castle.getWorldQuaternion(scQ).invert());}
  else{const g=scGround(e);if(!g)return false;const r=Math.hypot(g.x,g.z);if(r>2.3)return false;if(S.wet&&r>1.5&&r<2.0){toast('Splash! That one sank in the moat 💦');sfx('splash');return true;}p=g.setY(.035);n=new THREE.Vector3(0,1,0);}
  const r3=v=>Math.round(v*1000)/1000;const d=[k,r3(p.x),r3(p.y),r3(p.z),r3(n.x),r3(n.y),r3(n.z),ci];S.deco.push(d);const m=scDecoMesh(d);scPop(m);persist();did('sanddeco',k);
  tone(900+Math.random()*400,.07,'triangle',.08);if(S.deco.length===1)renderSand();return true;}
function scPop(m){const s0=m.scale.x;scTw(.3,k=>m.scale.setScalar(s0*(k<.6?k/.6*1.3:1.3-(k-.6)/.4*.3)),null);m.scale.setScalar(.01);}
function scTap(e){if(SD.busy||SD.wave)return false;const S=SAVE.sand,st=scStep();
  if(st==='dig'){if(scNear(e,[scWorld(SC_PILE[0],.25,SC_PILE[1])],110)<0)return false;scScoop();return true;}
  if(st==='towers'){const i=scNear(e,SC_SLOTS.map(([x,zz],i)=>S.tw[i]?null:scWorld(x,.05,zz)),75);if(i<0)return false;scFlip(i);return true;}
  if(st==='walls'){const i=scNear(e,SC_WALLS.map(([x,zz],i)=>S.wl[i]?null:scWorld(x,.05,zz)),75);if(i<0)return false;scWall(i);return true;}
  if(st==='deco')return scPlace(e);
  return false;}
function sandDown(e){const cap=()=>{try{canvas.setPointerCapture(e.pointerId);}catch(_){}};const st=scStep();
  if(!SD.wave&&!SD.busy&&st==='water'){if(SD.pid===null){SD.pid=e.pointerId;cap();}return;}
  if(!SD.wave&&st==='moat'&&SD.dig===null&&scDigAt(e)){SD.dig=e.pointerId;cap();return;}
  if(scTap(e))return;
  if(SD.cam.id===null){SD.cam.id=e.pointerId;SD.cam.x=e.clientX;SD.cam.y=e.clientY;SD.cam.moved=0;cap();}}
function sandMove(e){if(e.pointerId===SD.dig){scDigAt(e);return;}
  if(e.pointerId===SD.cam.id){const dx=e.clientX-SD.cam.x,dy=e.clientY-SD.cam.y;SD.cam.dy=Math.max(-1.6,Math.min(1.6,SD.cam.dy-dx*.006));SD.cam.dp=Math.max(-.35,Math.min(.6,SD.cam.dp+dy*.004));SD.cam.x=e.clientX;SD.cam.y=e.clientY;
    // a swipe across the sand pile scoops too
    SD.cam.moved+=Math.abs(dx)+Math.abs(dy);if(scStep()==='dig'&&!SD.busy&&SD.cam.moved>30&&scNear(e,[scWorld(SC_PILE[0],.25,SC_PILE[1])],90)>=0){SD.cam.id=null;scScoop();}}}
function sandUp(e){if(e.pointerId===SD.pid){SD.pid=null;SCX.stream.visible=false;if(!sandOpen||scStep()!=='water')return;
    if(SD.fill>=.78)scPourDone();else if(SD.fill>0)toast('A little more water! Fill it up to the green 🟩');}
  if(e.pointerId===SD.dig)SD.dig=null;
  if(e.pointerId===SD.cam.id)SD.cam.id=null;}

/* ---------- camera ---------- */
const scT=new THREE.Vector3(),scWant=new THREE.Vector3(),scLook=new THREE.Vector3();
function sandCam(dt){if(!sandOpen)return;const z=Z.beach,st=scStep();let lx=0,ly=.4,lz=0,yaw=.3,pitch=.5,d=3.7;
  if(SD.wave){d=4.6;pitch=.42;}
  else if(st==="dig"){lx=-2.2;lz=.6;ly=.2;yaw=.3;pitch=.6;d=2.7;}
  else if(st==='water'){lx=SC_BUCKET[0];lz=SC_BUCKET[1];ly=.3;yaw=.2;pitch=.55;d=1.9;}
  else if(st==='moat'){pitch=.95;d=4.4;ly=.2;}
  else if(st==='deco'){d=3.1;pitch=.42;ly=.5;}
  SCX.root.localToWorld(scT.set(lx,ly,lz));
  const land=innerWidth>innerHeight*1.25,Y=yaw+z.rot+SD.cam.dy,P=Math.max(-.1,Math.min(1.3,pitch+SD.cam.dp)),D=d*(land?1:1.35)*ZOOM.k;
  scWant.set(scT.x+Math.sin(Y)*Math.cos(P)*D,scT.y+Math.sin(P)*D,scT.z+Math.cos(Y)*Math.cos(P)*D);scWant.y=Math.max(scWant.y,.3);
  scLook.copy(scT);// (the game loop already shifts the picture so it isn't hidden behind the panel)
  const a=Math.min(1,dt*5);SD.cam.p.lerp(scWant,a);SD.cam.t.lerp(scLook,a);camera.position.copy(SD.cam.p);camera.lookAt(SD.cam.t);}

/* ---------- every frame ---------- */
const scHint=sprite(hintTex('👇'),.2,.2);scHint.visible=false;scHint.renderOrder=5;scHint.material.depthTest=false;scene.add(scHint);
const scW=new THREE.Vector3();
function scHintAt(){if(!sandOpen||SD.busy||SD.wave||SD.flood)return null;const S=SAVE.sand,st=scStep();
  if(st==='dig')return scWorld(SC_PILE[0],.55,SC_PILE[1]);
  if(st==='towers'){const i=S.tw.findIndex(t=>!t);return i<0?null:scWorld(SC_SLOTS[i][0],.25,SC_SLOTS[i][1]);}
  if(st==='walls'){const i=S.wl.findIndex(w=>!w);return i<0?null:scWorld(SC_WALLS[i][0],.25,SC_WALLS[i][1]);}
  if(st==='moat'){const i=S.mo.findIndex(m=>!m);if(i<0||SD.dig!==null)return null;const a=(i+.5)/SC_SEGS*Math.PI*2;return scWorld(Math.cos(a)*1.75,.25,-Math.sin(a)*1.75);}
  if(st==='deco'&&!S.deco.length)return scWorld(0,scTowerTop(4)+.15,0);
  return null;}
anims.push((t,dt)=>{const S=SAVE.sand;
  for(let i=SD.tw.length-1;i>=0;i--){const w=SD.tw[i];w.t+=dt;const k=Math.min(1,w.t/w.d);w.f(k*k*(3-2*k));if(k>=1){SD.tw.splice(i,1);w.done&&w.done();}}
  // step on the bucket pad to start
  if(started&&player.pos){const z=Z.beach,[lx,lz]=z.toLocal(player.pos.x,player.pos.z),d=Math.hypot(lx-SCX.pad.lx,lz-SCX.pad.lz);
    if(d<SCX.pad.r&&player.onGround&&!closetOpen){if(!onSPad){onSPad=true;openSand();}}else if(d>1.3)onSPad=false;}
  // glowing spots for the step you're on
  const st=scStep(),on=sandOpen&&!SD.wave;SCX.spotM.opacity=.55+.4*Math.sin(t*4);
  SCX.spots.forEach((s,i)=>s.visible=on&&st==='towers'&&!S.tw[i]);SCX.marks.forEach((m,i)=>m.visible=on&&st==='walls'&&!!S.tw[0]&&!S.wl[i]);
  SCX.guide.visible=on&&st==='moat'&&!SD.flood;SCX.guideM.opacity=.2+.15*Math.sin(t*4);
  // pouring sea water while you hold your finger down
  const can=SCX.can,ch=can.userData.home;
  if(sandOpen&&st==='water'&&!SD.wave){can.position.set(SC_BUCKET[0]+.32,.5+Math.sin(t*2)*.01,SC_BUCKET[1]);can.rotation.set(0,0,SD.pid!==null?.75:.15);
    SCX.stream.visible=SD.pid!==null;if(SD.pid!==null){SD.fill+=dt*.3;scBucketFill();can.updateMatrixWorld();SCX.spout.getWorldPosition(scW);SCX.root.worldToLocal(scW);
      const top=.3,len=Math.max(.02,scW.y-top);SCX.stream.position.set(scW.x,top+len/2,scW.z);SCX.stream.scale.y=len;if(Math.random()<dt*9)sfx('bubble');
      if(SD.fill>1.08){burst(scWorld(SC_BUCKET[0],.35,SC_BUCKET[1]),'#7fd6ff',20,1,.05);scPourDone(true);}}
    const bar=$('#sandBarI');if(bar)bar.style.width=Math.min(100,SD.fill*100)+'%';}
  else if(!SD.busy&&(can.position.x!==ch.x||can.rotation.z!==0)){can.position.set(ch.x,0,ch.z);can.rotation.set(0,.5,0);SCX.stream.visible=false;}
  // the moat water sparkles a little
  if(SCX.water.visible){SCX.water.position.y=.06+Math.sin(t*2)*.003;SCX.waterM.color.setHSL(.55,.85,.5+Math.sin(t*1.7)*.04);}
  // flags flutter
  for(const g of SCX.decoG.children){const f=g.userData.flag;if(f)f.rotation.y=Math.sin(t*5+g.position.x*7)*.35;}
  // the crab scuttles sideways around the castle, stopping now and then
  if(SCX.crab.visible){const c=SCX.crab,go=Math.sin(t*.7)>-.3,a=(c.userData.a||0)+(go?dt*.35:0);c.userData.a=a;const r=2.45;
    c.position.set(Math.sin(a)*r,Math.abs(Math.sin(t*14))*(go?.012:0),Math.cos(a)*r);c.rotation.y=a+(go?0:Math.sin(t*3)*.3);}
  // a big wave rolls in from the sea and washes the castle away
  if(SD.wave){SD.wave+=dt;const k=SD.wave,c=SCX.castle,f=Math.min(1,Math.max(0,(k-.7)/1.2));c.scale.y=Math.max(.001,1-f);c.position.y=-f*.05;
    if(k>.7&&k<2&&Math.random()<dt*20)burst(scWorld((Math.random()-.5)*3,.3,(Math.random()-.5)*3),Math.random()<.5?'#ffffff':'#7fd6ff',6,1.4,.06);
    SCX.pile.scale.setScalar(Math.max(.4,SCX.pile.scale.x));
    if(k>=2.4){SD.wave=0;SAVE.sand=scBlank();SD.scoops=0;SD.fill=0;persist();scBuild();SCX.pile.scale.set(1,.6,1);renderSand();toast('Splash! Ready to build a new one 🏖️');}}
  // a bouncing finger shows what to tap next
  const ht=scHintAt();scHint.visible=!!ht;if(ht){scHint.position.copy(ht).y+=Math.sin(t*6)*.04;const s=st==='dig'?.26:.2;scHint.scale.set(s,s,1);}});
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{openSand,closeSand,sand:SD,sandSave:()=>SAVE.sand,
  sandHint:()=>{const v=scHintAt();if(!v)return null;const [x,y]=scScr(v);return {x,y};},
  sandProj:(x,zz,y=.05)=>{const [sx,sy]=scScr(scWorld(x,y,zz));return {x:sx,y:sy};}});});
