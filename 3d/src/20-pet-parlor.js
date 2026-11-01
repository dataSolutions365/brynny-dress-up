/* ================= PET PARLOR (feed, bath, nails, dress up) ================= */
const PFOOD={cat:[['🐟','Fish'],['🥛','Milk'],['🍗','Chicken']],dog:[['🦴','Bone'],['🍖','Meat'],['🥕','Carrot']],squirrel:[['🌰','Acorn'],['🥜','Peanuts'],['🍓','Berry']],monkey:[['🍌','Banana'],['🥭','Mango'],['🍇','Grapes']],hedgehog:[['🐛','Mealworm'],['🍓','Berry'],['🥚','Egg']],bunny:[['🥕','Carrot'],['🥬','Lettuce'],['🍎','Apple']]};
const PHATS=[['unicorn','🦄','Unicorn horn','#ffb3e6'],['halo','😇','Halo','#ffd23f'],['crown','👑','Crown','#ffd23f'],['party','🥳','Party hat','#4fb6ff'],['bow','🎀','Big bow','#ff6fae'],['witch','🧙','Witch hat','#5b2a86'],['santa','🎅','Santa hat','#e0263b'],['flowers','🌸','Flower crown','#ff8fc8']];
const PNECK=[['bowtie','🎀','Bow tie','#ff3b6b'],['bandana','🧣','Bandana','#4fb6ff'],['pearls','📿','Pearls','#ffffff'],['scarf','🧶','Scarf','#7ee081']];
const PBODY=[['sweater','🧶','Sweater','#ffb3d1'],['tutu','🩰','Tutu','#ff8fc8'],['cape','🦸','Cape','#e0263b'],['wings','🧚','Fairy wings','#b388ff']];
const PGLASS=[['sun','🕶️','Sunglasses','#2d2d3a'],['heart','💗','Heart glasses','#ff6fae'],['star','⭐','Star glasses','#ffd23f']];
const PSLOTS=[['hat','🎩 Hats',PHATS],['neck','🎀 Neck',PNECK],['body','👚 Outfits',PBODY],['glasses','👓 Glasses',PGLASS]];
const POLISH=['#ff3b6b','#ff6fae','#ffb3d1','#c2185b','#8e6cff','#b388ff','#4fb6ff','#2fd1c5','#7ee081','#ffd23f','#ff8a1f','#ffffff','#2d2d3a'];
const RAINBOW=['#ff3b6b','#ffd23f','#7ee081','#4fb6ff'];
const PTABS=[['feed','🍖','Feed'],['bath','🛁','Bath'],['nails','💅','Nails'],['dress','🎀','Dress up']];
const heartShape=new THREE.Shape();heartShape.moveTo(0,-.9);heartShape.bezierCurveTo(-.2,-.6,-1,-.3,-1,.25);heartShape.bezierCurveTo(-1,.8,-.3,1,0,.5);heartShape.bezierCurveTo(.3,1,1,.8,1,.25);heartShape.bezierCurveTo(1,-.3,.2,-.6,0,-.9);
const bubGeo=sph(1,12,10),bubMat=phys('#ffffff',{roughness:.05,transparent:true,opacity:.7,iridescence:1,iridescenceIOR:1.4,clearcoat:1});
function emojiTex(e){if(!heartTex[e])heartTex[e]=canvasTex(64,64,(x)=>{x.font='52px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,32,36);});return heartTex[e];}

// every pet keeps its own care: tummy, mud, nail polish, outfit
function petCare(pt){const all=SAVE.petCare||(SAVE.petCare={});const i=PETS.indexOf(pt);
  let c=all[i];if(!c)c=all[i]={food:50,dirt:[1,1,1,0,0],polish:[null,null,null,null],fit:{},t:Date.now(),cleanAt:0};
  const now=Date.now(),hrs=(now-(c.t||now))/36e5;if(hrs>.01){c.food=Math.max(0,c.food-hrs*8);c.t=now;}
  if(c.cleanAt&&now-c.cleanAt>8*36e5){c.dirt=c.dirt.map(()=>1);c.cleanAt=0;}
  return c;}
const dirtSum=c=>c.dirt.reduce((a,b)=>a+b,0);
function petNeed(pt,world){const c=petCare(pt);if(c.food<35)return "I'm hungry! 🍖";if(dirtSum(c)>=1.5)return "I'm all muddy! 🛁";if(world)return null;if(!c.polish.some(Boolean))return 'Paint my nails? 💅';return 'Spa day! 💖';}
function petTop(pt){return pt.g.position.clone().add(new THREE.Vector3(0,pt.tagH*.7,0));}

function petExtras(pt){const D=pt.D,r=D.r,L=D.len;
  pt.nailMats=[];pt.legs.forEach((l,i)=>{const m=phys('#f3ebe2',{roughness:.45,clearcoat:.4});pt.nailMats.push(m);
    for(const k of [-1,0,1]){const n=M(sph(r*.095,10,8),m,k*r*.17,-D.leg+r*.15,r*.12+r*.43,l.lg,false,false);n.scale.set(1,.75,1.3);}});
  const mud=std('#7a5232',{roughness:1});
  pt.dirtM=[[r*.93,r*.15,L*.25],[-r*.9,r*.3,-L*.2],[0,r*.98,-L*.05],[r*.55,r*.75,-L*.45],[-r*.6,-r*.55,L*.35]].map(([x,y,zz])=>M(sph(r*.27,10,8),mud,x*.97,y*.97,zz,pt.torso,false,false));
  pt.bubbles=[];pt.wet=0;pt.furBase=pt.furMats.map(m=>m.color.clone());pt.fitMeshes=[];}
function paintNails(pt){const c=petCare(pt);pt.nailMats.forEach((m,i)=>{const p=c.polish[i];
  if(p==='glitter'){m.color.set('#ffd86b');m.metalness=1;m.roughness=.15;m.emissive.set('#4a3000');}else{m.color.set(p||'#f3ebe2');m.metalness=0;m.roughness=p?.12:.45;m.emissive.set('#000000');}m.clearcoat=p?1:.4;});}
function showDirt(pt){const c=petCare(pt);pt.dirtM.forEach((s,i)=>{const h=c.dirt[i]||0;s.visible=h>.02;const k=.35+.65*h;s.scale.set(k,.8*k,1.2*k);});}
function setWet(pt,w){pt.wet=w;pt.furMats.forEach((m,i)=>{m.color.copy(pt.furBase[i]).multiplyScalar(1-.32*w);m.roughness=.95-.55*w;m.sheen=1-.8*w;m.clearcoat=.7*w;});}
function clearBubbles(pt){pt.bubbles.forEach(b=>pt.body.remove(b));pt.bubbles=[];}

function dressPet(pt){const F=petCare(pt).fit||{},D=pt.D,H=D.head,r=D.r,L=D.len,hd=pt.head,ts=pt.torso;
  pt.fitMeshes.forEach(m=>{if(m.parent)m.parent.remove(m);m.geometry.dispose();m.material.dispose();});pt.fitMeshes=[];
  const add=(geo,mat,x,y,zz,parent)=>{const m=M(geo,mat,x,y,zz,parent,true,false);pt.fitMeshes.push(m);return m;};
  const cloth=(c,o={})=>phys(c,{roughness:.8,sheen:1,sheenColor:new THREE.Color('#ffffff'),side:THREE.DoubleSide,...o});
  const shiny=c=>phys(c,{roughness:.2,clearcoat:1});
  const h=F.hat,n=F.neck,b=F.body,gl=F.glasses;
  if(h){const c=h.c;
    if(h.id==='crown'){const m=()=>std(c,{metalness:1,roughness:.22});add(cyl(H*.42,H*.46,H*.25,24,1,true),m(),0,H*.95,-H*.05,hd).material.side=THREE.DoubleSide;
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(new THREE.ConeGeometry(H*.09,H*.24,8),m(),Math.sin(a)*H*.43,H*1.18,-H*.05+Math.cos(a)*H*.43,hd);add(sph(H*.06,8,6),shiny(['#ff3b6b','#4fb6ff','#7ee081'][i%3]),Math.sin(a)*H*.46,H*.95,-H*.05+Math.cos(a)*H*.46,hd);}}
    if(h.id==='party'){const cn=add(new THREE.ConeGeometry(H*.33,H*.9,24),phys(c,{map:TEX.stripes,roughness:.5}),H*.08,H*1.32,0,hd);cn.rotation.z=-.15;add(sph(H*.12,12,10),cloth('#ffffff'),H*.15,H*1.77,0,hd);}
    if(h.id==='bow'){for(const s of [-1,1]){const w=add(new THREE.ConeGeometry(H*.22,H*.4,14),shiny(c),H*.3+s*H*.2,H*.92,H*.1,hd);w.rotation.z=s*Math.PI/2;w.scale.z=.5;}add(sph(H*.1,12,10),shiny(c),H*.3,H*.92,H*.1,hd);}
    if(h.id==='witch'){add(cyl(H*.78,H*.78,H*.04,32),cloth(c),0,H*.86,-H*.05,hd);const cn=add(new THREE.ConeGeometry(H*.42,H*1.15,24),cloth(c),-H*.05,H*1.45,-H*.1,hd);cn.rotation.z=.2;
      add(cyl(H*.43,H*.43,H*.1,24,1,true),cloth('#ffd23f'),0,H*.93,-H*.05,hd);}
    if(h.id==='santa'){const a=.35,hh=H*.95,cx=H*.05,cy=H*1.3;const cn=add(new THREE.ConeGeometry(H*.45,hh,24),cloth(c),cx,cy,-H*.05,hd);cn.rotation.z=-a;
      add(new THREE.TorusGeometry(H*.45,H*.1,10,24),cloth('#ffffff'),0,H*.86,-H*.05,hd).rotation.x=Math.PI/2;add(sph(H*.13,12,10),cloth('#ffffff'),cx+Math.sin(a)*hh/2,cy+Math.cos(a)*hh/2,-H*.05,hd);}
    if(h.id==='halo'){const t=add(new THREE.TorusGeometry(H*.42,H*.07,10,32),phys(c,{emissive:new THREE.Color(c),emissiveIntensity:.7,roughness:.2,metalness:.3}),0,H*1.3,-H*.05,hd);t.rotation.x=Math.PI/2;}
    if(h.id==='unicorn'){const cn=add(new THREE.ConeGeometry(H*.13,H*.62,18),phys(c,{map:TEX.glitter,roughness:.3,clearcoat:1,iridescence:.6}),0,H*.98,H*.8,hd);cn.rotation.x=.45;
      for(let i=0;i<3;i++){const r=add(new THREE.TorusGeometry(H*(.11-i*.03),H*.025,6,16),shiny('#ffffff'),0,H*(.98-.16+i*.16*Math.cos(.45)),H*(.8-.16*Math.sin(.45)+i*.16*Math.sin(.45)),hd);r.rotation.x=Math.PI/2+.45;}}
    if(h.id==='flowers'){for(let i=0;i<9;i++){const a=i/9*Math.PI*2;add(sph(H*.12,10,8),cloth(i%2?'#ffffff':c),Math.cos(a)*H*.6,H*.8,Math.sin(a)*H*.6,hd).scale.y=.7;add(sph(H*.05,8,6),shiny('#ffd23f'),Math.cos(a)*H*.66,H*.82,Math.sin(a)*H*.66,hd);}}}
  if(n){const c=n.c,y=-H*.72,zc=-H*.05;
    if(n.id==='bowtie'){for(const s of [-1,1]){const w=add(new THREE.ConeGeometry(H*.16,H*.3,12),shiny(c),s*H*.15,y,H*.62,hd);w.rotation.z=s*Math.PI/2;w.scale.z=.45;}add(sph(H*.08,10,8),shiny(c),0,y,H*.64,hd);}
    if(n.id==='bandana'){add(new THREE.TorusGeometry(H*.66,H*.06,8,28),cloth(c),0,y,zc,hd).rotation.x=Math.PI/2;const t=add(new THREE.ConeGeometry(H*.42,H*.55,3),cloth(c),0,y-H*.22,H*.5,hd);t.rotation.x=Math.PI;t.scale.z=.3;}
    if(n.id==='pearls'){for(let i=0;i<16;i++){const a=i/16*Math.PI*2;add(sph(H*.075,10,8),phys(c,{roughness:.15,clearcoat:1,sheen:1,iridescence:.6}),Math.sin(a)*H*.7,y-Math.max(0,Math.cos(a))*H*.12,zc+Math.cos(a)*H*.7,hd);}}
    if(n.id==='scarf'){add(new THREE.TorusGeometry(H*.66,H*.14,10,28),cloth(c,{map:TEX.stripes}),0,y,zc,hd).rotation.x=Math.PI/2;const t=add(capTop(H*.12,H*.5),cloth(c,{map:TEX.stripes}),H*.25,y-H*.05,H*.6,hd);t.scale.z=.45;t.rotation.z=.2;}}
  pt.fitNeck=!!n;pt.showCollar();
  if(b){const c=b.c;
    if(b.id==='sweater'){const s=add(cyl(r*1.08,r*1.08,L*.8,28,1,true),cloth(c,{map:TEX.stripes}),0,0,L*.05,ts);s.rotation.x=Math.PI/2;add(new THREE.TorusGeometry(r*1.06,r*.12,8,28),cloth(c),0,0,L*.45,ts);add(new THREE.TorusGeometry(r*1.06,r*.12,8,28),cloth(c),0,0,-L*.35,ts);}
    if(b.id==='tutu'){for(const [k,o] of [[0,1],[1,.85]]){const s=add(cyl(r*1.05,r*(1.6-k*.2),r*.42,36,1,true),cloth(c,{transparent:true,opacity:.85*o}),0,0,-L*.28-k*r*.15,ts);s.rotation.x=Math.PI/2;}}
    if(b.id==='cape'){const s=add(new THREE.CylinderGeometry(r*1.16,r*1.25,L*1.05,28,1,true,Math.PI*.4,Math.PI*1.2),cloth(c),0,0,-L*.08,ts);s.rotation.x=Math.PI/2;add(sph(r*.14,10,8),std('#ffd23f',{metalness:1,roughness:.2}),0,r*.85,L*.5,ts);}
    if(b.id==='wings'){const wm=()=>phys(c,{side:THREE.DoubleSide,roughness:.3,transparent:true,opacity:.8,iridescence:1,iridescenceIOR:1.6,sheen:1});
      for(const s of [-1,1])for(const [sz,zo,yo] of [[1.3,.1,.2],[.9,-.35,-.1]]){const w=add(new THREE.CircleGeometry(r*sz,24),wm(),s*r*.65,r*1.1+yo*r,-L*.05+zo*r,ts);w.scale.set(1,.6,1);w.rotation.set(0,Math.PI/2,s*.7);}}}
  if(gl){const c=gl.c,y=H*.12,zz=H*1.0;
    if(gl.id==='sun'){for(const s of [-1,1]){add(new THREE.TorusGeometry(H*.2,H*.035,8,24),shiny(c),s*H*.42,y,zz,hd);add(new THREE.CircleGeometry(H*.19,24),phys('#1a1a22',{roughness:.05,clearcoat:1,transparent:true,opacity:.85}),s*H*.42,y,zz-.001,hd);}add(box(H*.3,H*.05,H*.04),shiny(c),0,y+H*.03,zz+.002,hd);}
    if(gl.id==='heart'||gl.id==='star'){const sh=gl.id==='heart'?heartShape:starShape,k=gl.id==='heart'?H*.22:H*.85;
      for(const s of [-1,1]){const m=add(new THREE.ExtrudeGeometry(sh,{depth:.4,bevelEnabled:false}),phys(c,{roughness:.1,clearcoat:1,transparent:true,opacity:.8}),s*H*.42,y,zz-.01,hd);m.scale.set(k,k,H*.08/.4);}
      add(box(H*.28,H*.05,H*.04),shiny(c),0,y+H*.05,zz,hd);}}}
function applyPet(pt){paintNails(pt);showDirt(pt);dressPet(pt);}
PETS.forEach(pt=>{petExtras(pt);applyPet(pt);});

let parlorOpen=false,ptab='feed',ptool='soap',ppol='#ff6fae',pslot='hat',pPet=null;
const pcam={p:new THREE.Vector3(),t:new THREE.Vector3(),dy:0,dp:0,id:null,x:0,y:0},pTgt=new THREE.Vector3(),pWant=new THREE.Vector3();
const rub={id:null,last:0};
const PCAM={feed:[.55,.38,2.7,.2],bath:[.35,.6,2.6,.2],nails:[.3,.22,2.1,.12],dress:[.6,.25,2.5,.3]};
function tryParlor(){const pt=myPet();if(!pt){toast('Adopt a pet first! 🐾 Find one around the world and tap Adopt.');sfx('pop');return;}openParlor(pt);}
function openParlor(pt){if(closetOpen)return;closeTalk();const z=Z.parlor,T=z.table;pPet=pt;parlorOpen=closetOpen=true;z.padLbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  const [tx,tz]=z.toWorld(T.lx,T.lz);pt.inParlor=true;pt.pos.set(tx,0,tz);pt.face=z.rot;pt.y=.3;pt.vy=2;pt.speed=0;pt.tgt=null;pt.eatT=0;
  const [px,pz]=z.toWorld(-1.25,-.9);player.pos.set(px,0,pz);player.vy=0;player.speed=0;player.face=Math.atan2(tx-px,tz-pz);
  pcam.p.copy(camera.position);pcam.t.copy(cam.fv||player.pos);pcam.dy=pcam.dp=0;
  renderParlor();$('#parlor').classList.add('show');$('#pcontent').scrollTop=0;
  sfx('tada');pt.happy=2;setTimeout(()=>{if(parlorOpen)pt.speak(petNeed(pt));},500);}
function closeParlor(){if(!parlorOpen)return;const z=Z.parlor,pt=pPet;parlorOpen=closetOpen=false;z.padLbl.visible=true;
  document.body.classList.remove('dressing');$('#parlor').classList.remove('show');z.tub.visible=z.bowl.visible=false;
  if(pt){pt.inParlor=false;pt.eatT=0;pt.head.rotation.x=pt.headX0;if(pt.wet>.05)floaties(petTop(pt),'💧',5);clearBubbles(pt);setWet(pt,0);
    const [x,w]=z.toWorld(-.45,0);pt.pos.set(x,z.table.h,w);pt.vy=3;pt.happy=2;}
  persist();cam.yaw=cam.cy=z.rot;player.face=z.rot;pPet=null;}
$('#pdone').onclick=closeParlor;$('#pphoto').onclick=()=>{wantPhoto=true;};

function renderMeters(){if(!pPet)return;const c=petCare(pPet);const clean=Math.round((1-dirtSum(c)/c.dirt.length)*100);
  $('#pmeters').innerHTML=`<div class="meter">🍖 Tummy<i><b style="width:${Math.round(c.food)}%"></b></i></div><div class="meter">🫧 Clean<i><b style="width:${clean}%"></b></i></div>`;}
function bathHint(){const el=$('#phint');if(!el||!pPet)return;const pt=pPet,c=petCare(pt);
  el.textContent=dirtSum(c)>0?`1️⃣ Rub soap on the muddy spots 🧼`:pt.bubbles.length?`2️⃣ Now rinse off the bubbles 🚿`:pt.wet>.01?`3️⃣ Blow-dry ${pt.name} 🌬️`:`${pt.name} is squeaky clean! ✨`;}
function renderParlor(){const pt=pPet,c=petCare(pt),z=Z.parlor;$('#ptitle').textContent=`🐾 ${pt.name}'s spa`;
  $('#ptabs').innerHTML=PTABS.map(([id,ico,n])=>`<button class="tab${id===ptab?' on':''}" data-ptab="${id}"><b>${ico}</b>${n}</button>`).join('');
  const sw=(list,cur,kind)=>`<div class="swatches">${list.map(col=>`<button class="sw${col===cur?' on':''}" style="background:${col}" data-sw="${kind}" data-c="${col}" aria-label="color ${col}"></button>`).join('')}</div>`;
  let h='';
  if(ptab==='feed')h=`<h3>Snack time! What does ${pt.name} want?</h3><div class="grid">${PFOOD[pt.kind].concat([['🍪','Treat']],TREATS).map(([e,n])=>lockBtn('treat:'+e,e,n)||`<button class="item" data-food="${e}"><b>${e}</b><span>${n}</span></button>`).join('')}</div><p class="drawhint">Tap a food to put it in the bowl. Watch the tummy meter fill up!</p>`;
  else if(ptab==='bath')h=`<h3 id="phint"></h3><div class="grid">${[['soap','🧼','Soap'],['rinse','🚿','Rinse'],['dry','🌬️','Blow-dry']].map(([id,e,n])=>`<button class="item${ptool===id?' on':''}" data-tool="${id}"><b>${e}</b><span>${n}</span></button>`).join('')}</div><p class="drawhint">Pick a tool, then rub ${pt.name} with your finger. Drag next to ${pt.name} to spin around and find more mud.</p>`;
  else if(ptab==='nails')h=`<h3>💅 Pick a polish, then tap a paw</h3><div class="swatches">${POLISH.map(col=>`<button class="sw${col===ppol?' on':''}" style="background:${col}" data-pol="${col}" aria-label="polish ${col}"></button>`).join('')}<button class="sw fancy${ppol==='glitter'?' on':''}" style="background:linear-gradient(135deg,#fff3b0,#d4af37,#ffe27a)" data-pol="glitter" aria-label="glitter">✨</button><button class="sw fancy${ppol==='rainbow'?' on':''}" style="background:conic-gradient(#ff3b6b,#ffd23f,#7ee081,#4fb6ff,#ff3b6b)" data-pol="rainbow" aria-label="rainbow">🌈</button></div>
    <div style="height:12px"></div><div class="chips"><button data-paint="all">💅 Paint all paws</button><button data-paint="clear">🧽 Take off polish</button></div>`;
  else{const F=c.fit;h=PSLOTS.map(([slot,title,list])=>`<h3>${title}</h3><div class="grid"><button class="item${!F[slot]?' on':''}" data-fit="${slot}:"><b>🚫</b><span>None</span></button>${list.map(([id,e,n])=>lockBtn('pet:'+id,e,n)||`<button class="item${F[slot]&&F[slot].id===id?' on':''}" data-fit="${slot}:${id}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>${F[slot]&&pslot===slot?'<div style="height:8px"></div>'+sw(myColors(COLORS),F[slot].c,'fitc'):''}`).join('');}
  $('#pcontent').innerHTML=h;renderMeters();bathHint();
  z.tub.visible=ptab==='bath';z.bowl.visible=ptab==='feed';if(ptab!=='feed')z.bowlFood.visible=false;}
$('#ptabs').onclick=e=>{const b=e.target.closest('[data-ptab]');if(!b)return;ptab=b.dataset.ptab;pcam.dy=pcam.dp=0;sfx('pop');renderParlor();$('#pcontent').scrollTop=0;};
$('#pcontent').onclick=e=>{const b=e.target.closest('button');if(!b||!pPet)return;const pt=pPet,c=petCare(pt);
  if(b.dataset.lock){askBuy(b.dataset.lock);return;}
  if(b.dataset.food)return feedPet(b.dataset.food);
  if(b.dataset.tool){ptool=b.dataset.tool;sfx('pop');renderParlor();return;}
  if(b.dataset.pol){ppol=b.dataset.pol;sfx('pop');renderParlor();return;}
  if(b.dataset.paint){for(let i=0;i<4;i++)paintPaw(i,b.dataset.paint==='all'?ppol:null,i<3);return;}
  if(b.dataset.fit!=null){const [slot,id]=b.dataset.fit.split(':');const list=PSLOTS.find(s=>s[0]===slot)[2];const prev=c.fit[slot];
    c.fit[slot]=id?{id,c:prev&&prev.id===id?prev.c:list.find(x=>x[0]===id)[3]}:null;if(id)did('petdress');pslot=slot;dressPet(pt);persist();sfx('pop');pt.happy=1.5;burst(petTop(pt),'#ffd6f0',20,1.2,.08);
    if(id&&Math.random()<.6)pt.speak(rnd(['So fancy! 💖','I love it! ✨','Do I look cute?','Picture time! 📸']));renderParlor();return;}
  if(b.dataset.sw==='fitc'){const f=c.fit[pslot];if(f){f.c=b.dataset.c;dressPet(pt);persist();sfx('pop');renderParlor();}}};

function feedPet(e){const pt=pPet,c=petCare(pt),z=Z.parlor;if(pt.eatT>0)return;
  if(c.food>=95){pt.speak("I'm full! 😋");pt.happy=1;sfx('pop');return;}
  z.bowlFood.material.map=emojiTex(e);z.bowlFood.material.needsUpdate=true;z.bowlFood.visible=true;z.bowlFood.scale.setScalar(.16);
  pt.eatT=2.2;pt.eatMax=2.2;for(let k=0;k<4;k++)setTimeout(()=>{if(pt.eatT>0)sfx('munch');},k*500);
  setTimeout(()=>{if(!parlorOpen||pPet!==pt)return;c.food=Math.min(100,c.food+(TREAT_FOOD[e]||(e==='🍪'?12:30)));persist();renderMeters();
    if(TREAT_FOOD[e]){pt.speak(rnd(['Best treat EVER! 🎉','Wow! My favorite! 💖','Sooo yummy! ✨']));floaties(petTop(pt),'✨',6);}
    else pt.speak(c.food>=95?'Yum! All full! 💖':rnd(['Yummy! 😋','Mmm, more please!','Nom nom nom!']));pt.happy=2;pt.vy=2.5;floaties(petTop(pt),'💖',4);earn(2,'Snack time');did('feed');},2250);}

function petHit(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  return ray.intersectObject(pPet.body,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return !h.object.isSprite;})||null;}
const pw=new THREE.Vector3();
function rubAt(e){const pt=pPet,h=petHit(e);if(!h)return;const c=petCare(pt),P=h.point,now=performance.now();
  if(ptool==='soap'){
    if(pt.bubbles.length<50&&!pt.bubbles.some(b=>b.getWorldPosition(pw).distanceTo(P)<.035)){const b=M(bubGeo,bubMat,0,0,0,pt.body,false,false);b.position.copy(pt.body.worldToLocal(P.clone()));b.userData.s=(.016+Math.random()*.016)/1.3;b.scale.setScalar(b.userData.s);pt.bubbles.push(b);
      if(now-rub.last>90){sfx('bubble');rub.last=now;}}
    pt.dirtM.forEach((s,i)=>{if(c.dirt[i]>0)c.dirt[i]=Math.max(0,c.dirt[i]-(s.getWorldPosition(pw).distanceTo(P)<.1?.12:.012));});showDirt(pt);pt.washing=true;}
  else if(ptool==='rinse'){let n=0;for(let i=pt.bubbles.length-1;i>=0;i--){const b=pt.bubbles[i];if(b.getWorldPosition(pw).distanceTo(P)<.1){pt.body.remove(b);pt.bubbles.splice(i,1);n++;}}
    if(n&&Math.random()<.5)floaties(P.clone(),'🫧',1);if(Math.random()<.4)burst(P.clone(),'#8fd8ff',6,1,.06);setWet(pt,Math.min(1,pt.wet+.06));pt.washing=true;if(now-rub.last>140){sfx('splash');rub.last=now;}}
  else if(ptool==='dry'){if(pt.wet>0){setWet(pt,Math.max(0,pt.wet-.025));if(Math.random()<.35)burst(P.clone(),'#ffffff',5,1.2,.06);if(now-rub.last>160){sfx('blow');rub.last=now;}}}
  checkClean(pt);}
function checkClean(pt){const c=petCare(pt);bathHint();if(!pt.washing)return;
  if(dirtSum(c)===0&&!pt.bubbles.length&&pt.wet<=.001){pt.washing=false;c.cleanAt=Date.now();persist();renderMeters();sfx('tada');pt.happy=2.5;pt.vy=3;pt.speak('Squeaky clean! ✨');did('bath');earn(10,'Squeaky clean');
    const P=petTop(pt);for(let k=0;k<3;k++)setTimeout(()=>burst(P.clone(),rnd(['#ff8fc8','#ffd23f','#8fd8ff']),24,1.6,.1),k*250);floaties(P,'💖',6);}}
function paintPaw(i,col,quiet){const pt=pPet,c=petCare(pt);c.polish[i]=col==='rainbow'?RAINBOW[i]:col;paintNails(pt);persist();
  const P=pt.legs[i].paw.getWorldPosition(new THREE.Vector3());burst(P,col==='glitter'?'#ffd23f':col&&col!=='rainbow'?col:'#ffffff',12,.8,.07);
  if(!quiet){sfx(col?'brush':'pop');if(col&&c.polish.every(Boolean)){pt.happy=2;pt.speak(rnd(['Pretty paws! 💅','Sparkly toes! ✨','I love my nails! 💖']));did('paws');if(Date.now()-(c.nailPaid||0)>6e5){c.nailPaid=Date.now();persist();earn(5,'Pretty paws');}}}}
function nailTap(e){const pt=pPet,h=petHit(e);if(!h)return false;let best=-1,bd=.16;
  pt.legs.forEach((l,i)=>{const d=l.paw.getWorldPosition(pw).distanceTo(h.point);if(d<bd){bd=d;best=i;}});
  if(best<0){toast('Tap a paw to paint it 🐾');return true;}paintPaw(best,ppol);return true;}

function parlorDown(e){const pt=pPet;if(!pt)return;const cap=()=>{try{canvas.setPointerCapture(e.pointerId);}catch(_){}};
  if(ptab==='bath'&&rub.id===null&&petHit(e)){rub.id=e.pointerId;rub.last=0;rubAt(e);cap();return;}
  if(ptab==='nails'&&nailTap(e))return;
  if((ptab==='feed'||ptab==='dress')&&petHit(e)){pt.happy=2;pt.vy=2.5;pt.speak(rnd(PET_SAY[pt.kind]));floaties(petTop(pt),'💖',3);sfx('pop');return;}
  if(pcam.id===null){pcam.id=e.pointerId;pcam.x=e.clientX;pcam.y=e.clientY;cap();}}
function parlorMove(e){if(e.pointerId===rub.id){rubAt(e);return;}
  if(e.pointerId===pcam.id){pcam.dy-=(e.clientX-pcam.x)*.008;pcam.dp=Math.min(.8,Math.max(-.4,pcam.dp+(e.clientY-pcam.y)*.005));pcam.x=e.clientX;pcam.y=e.clientY;}}
function parlorUp(e){if(e.pointerId===rub.id){rub.id=null;persist();renderMeters();}if(e.pointerId===pcam.id)pcam.id=null;}

function parlorPet(pt,dt){const z=Z.parlor;pt.vy-=18*dt;pt.y+=pt.vy*dt;if(pt.y<0){pt.y=0;pt.vy=0;}
  pt.g.position.set(pt.pos.x,z.table.h+pt.y,pt.pos.z);pt.g.rotation.y=pt.face;pt.speed=0;pt.update(dt);
  if(pt.eatT>0){pt.eatT-=dt;pt.head.rotation.x=pt.headX0+.45+.12*Math.sin(pt.t*14);z.bowlFood.scale.setScalar(.16*Math.max(.05,pt.eatT/pt.eatMax));
    if(Math.random()<dt*4)burst(z.bowlFood.getWorldPosition(new THREE.Vector3()),'#ffe2b8',4,.6,.05);
    if(pt.eatT<=0){pt.head.rotation.x=pt.headX0;z.bowlFood.visible=false;}}
  pt.bubbles.forEach((b,i)=>b.scale.setScalar(b.userData.s*(1+.1*Math.sin(pt.t*6+i))));
  if(pt.wet>.3&&Math.random()<dt*3)burst(petTop(pt).add(new THREE.Vector3(0,-pt.tagH*.4,0)),'#8fd8ff',3,.5,.05);}
function parlorCam(dt){const z=Z.parlor,pt=pPet;if(!pt)return;const [yo,pi,di,ty]=PCAM[ptab],k=Math.min(1.1,Math.max(.7,pt.tagH));
  const yaw=z.rot+yo+pcam.dy,pitch=Math.min(1.25,Math.max(-.02,pi+pcam.dp)),d=di*k;
  pTgt.set(pt.pos.x,z.table.h+ty*k,pt.pos.z);pWant.set(pTgt.x+Math.sin(yaw)*Math.cos(pitch)*d,pTgt.y+Math.sin(pitch)*d,pTgt.z+Math.cos(yaw)*Math.cos(pitch)*d);
  const a=Math.min(1,dt*5);pcam.p.lerp(pWant,a);pcam.t.lerp(pTgt,a);camera.position.copy(pcam.p);camera.lookAt(pcam.t);}

