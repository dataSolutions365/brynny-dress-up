/* ================= 💈 BARBER SHOP and 👔 CLOTHING STORE ================= */
// The barber chair (guys only): haircuts, facial hair and face shapes. The clothing store: try things on, buy them with coins.
// Both use the closet panel, like the glam mirror does.
const BARB=Z.barber,STOR=Z.store;
const zW=(z,lx,y,lz)=>{const [x,w]=z.toWorld(lx,lz);return new THREE.Vector3(x,y,w);};
const zFace=(z,dx,dz)=>{const c=Math.cos(z.rot),s=Math.sin(z.rot);return Math.atan2(dx*c+dz*s,-dx*s+dz*c);};
let barberOpen=false,storeOpen=false,bview=.6,onBBPad=false,onSTPad=false,storePick=null;

/* ---------- the people who work here ---------- */
const shopNPC={built:false,all:[]};
function mkNPC(z,look,name,lx,lz,face){const a=new Avatar(look,name,'#2f7be5');const o={a,g:a.g,pos:zW(z,lx,0,lz),face,home:[lx,lz,face],z,say:null,sayT:0};a.g.position.copy(o.pos);a.g.rotation.y=face;scene.add(a.g);shopNPC.all.push(o);return o;}
function buildShopNPCs(){if(shopNPC.built)return;shopNPC.built=true;
  const max=Object.assign(defaultGuyLook(),{skin:'#c8a072',eyes:'#3d2a1a',hair:{id:'fade',c:'#2b1d16'},beard:{id:'beard',c:'#2b1d16'},top:{id:'buttonup',c:'#ffffff'},bottom:{id:'khakis',c:'#2d2d3a'},shoes:{id:'oxfords',c:'#3b2416'},face:{jaw:'square',brows:'thick'}});
  shopNPC.max=mkNPC(BARB,max,'💈 Barber Max',.95,BARB.seat[1]+.45,zFace(BARB,-1,-.3));
  const jay=Object.assign(defaultGuyLook(),{skin:'#8d5a3b',eyes:'#3d2a1a',hair:{id:'cornrows',c:'#1d1410'},beard:{id:'goatee',c:'#1d1410'},top:{id:'sweatervest',c:'#1f2a44'},bottom:{id:'khakis',c:'#c8b28a'},shoes:{id:'loafers',c:'#7a4a2a'},extras:{roundspecs:'#2d2d3a'}});
  shopNPC.jay=mkNPC(STOR,jay,'👔 Jay',STOR.clerk[0],STOR.clerk[1],zFace(STOR,0,1));
  // mannequins in the windows show off store clothes (no name tag, and they stand still)
  const mq=[{top:{id:'leather',c:'#2d2d3a'},bottom:{id:'ripped',c:'#6f9be0'},shoes:{id:'goldkicks',c:'#e0b04a'},hat:{id:'fedora',c:'#3b3b46'},extras:{aviators:'#d4af37'}},
    {top:{id:'football',c:'#d62839'},bottom:{id:'camopants',c:'#6b7a3f'},shoes:{id:'runners',c:'#4fb6ff'},hat:{id:'visor',c:'#ffffff'},extras:{sportshades:'#ff3b6b',dogtags:'#c0c0c0'}}];
  STOR.manq.forEach(([lx,lz],i)=>{const l=Object.assign(defaultGuyLook(),{style:'cute',skin:'#f4f4f4',hair:{id:'bald',c:'#ffffff'}},mq[i]);const o=mkNPC(STOR,l,'',lx,lz+.0,zFace(STOR,0,1));o.a.tag.visible=false;o.still=true;o.g.position.y=.12;});}
anims.push((t,dt)=>{const here=started&&(curZone===BARB||curZone===STOR||barberOpen||storeOpen);if(!here)return;buildShopNPCs();
  for(const o of shopNPC.all){if(o.still)continue;o.g.position.copy(o.pos);o.g.rotation.y=o.face;o.a.update(dt,0,false);if(o.say){o.sayT-=dt;if(o.sayT<0){o.g.remove(o.say);o.say=null;}}}});
const say=(o,t)=>{if(o)friendBubble(o,t);};

/* ---------- walking in and stepping on the pads ---------- */
let shopZone=null;
anims.push(()=>{if(!started)return;const p=player.pos;
  if(curZone!==shopZone){shopZone=curZone;if(!closetOpen&&curZone===BARB)setTimeout(()=>toast(isGuy(SAVE.look)?'Step on the ✂️ pad to sit in the barber chair 💈':'This barber shop is for guys 💈 Try the 🪞 glam mirror at the ⭐ Star Model Agency!'),1600);
    if(!closetOpen&&curZone===STOR)setTimeout(()=>toast('Step on the 👔 pad by the mirror to try on clothes and glasses!'),1600);}
  {const [lx,lz]=BARB.toLocal(p.x,p.z),d=Math.hypot(lx-BARB.bpad.lx,lz-BARB.bpad.lz);if(d<BARB.bpad.r&&player.onGround&&!closetOpen){if(!onBBPad){onBBPad=true;openBarber();}}else if(d>1.3)onBBPad=false;}
  {const [lx,lz]=STOR.toLocal(p.x,p.z),d=Math.hypot(lx-STOR.spad.lx,lz-STOR.spad.lz);if(d<STOR.spad.r&&player.onGround&&!closetOpen){if(!onSTPad){onSTPad=true;openStore();}}else if(d>1.3)onSTPad=false;}});

/* ---------- 💈 the barber chair ---------- */
const BARBER_TABS=[['cut','✂️','Haircut'],['beard','🧔','Beard'],['bface','🙂','Face']];
let barberPrevTab='tops';
const BVIEW={cut:.45,beard:.2,bface:0};
function openBarber(){if(closetOpen)return;buildShopNPCs();const m=shopNPC.max;
  if(!isGuy(SAVE.look)){say(m,'Hi! This shop is for guys 💈');toast('💇‍♀️ For hair and makeup, try the 🪞 glam mirror at the ⭐ Star Model Agency!');return;}
  closeTalk();barberOpen=closetOpen=true;barberPrevTab=ctab;ctab='cut';bview=BVIEW.cut;czoom='body';barbCam.init=false;
  player.pos.copy(zW(BARB,BARB.seat[0],0,BARB.seat[1]));player.vy=0;player.speed=0;player.face=zFace(BARB,0,-1);cam.closetYaw=cam.cy=player.face;cam.fv=null;
  joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';document.body.classList.add('dressing');$('#ctitle').textContent='💈 Barber Shop';BARB.bpad.lbl.visible=false;
  m.pos.copy(zW(BARB,.75,0,BARB.seat[1]+.1));m.face=zFace(BARB,-1,0);say(m,rnd(['Take a seat! 💈','What can I do for you? ✂️','Looking for a fresh cut? 💈']));m.a.play('wave');
  av.play('chair');chairBack(false);renderCloset();$('#closet').classList.add('show');$('#ccontent').scrollTop=0;sfx('tada');}
// the chair's back hides while you sit, so the camera can go all the way round your head
const chairBack=v=>BARB.chairs[1].userData.back.forEach(m=>m.visible=v);
function closeBarber(){if(!barberOpen)return;barberOpen=closetOpen=false;ctab=barberPrevTab;czoom='body';document.body.classList.remove('dressing');$('#closet').classList.remove('show');$('#ctitle').textContent='👗 My closet';BARB.bpad.lbl.visible=true;chairBack(true);
  av.dress(SAVE.look);persist();const m=shopNPC.max;if(m){m.pos.copy(zW(BARB,m.home[0],0,m.home[1]));m.face=m.home[2];}
  player.pos.copy(zW(BARB,0,0,BARB.bpad.lz+.9));player.face=zFace(BARB,0,1);cam.yaw=cam.cy=player.face+Math.PI;cam.fv=null;av.play('twirl');
  did('barber');if(Date.now()-(SAVE.barberPaid||0)>6e5){SAVE.barberPaid=Date.now();persist();setTimeout(()=>earn(5,'Fresh cut!'),700);}
  toast('Looking sharp! 💈 The 👔 Clothing Store is past the Runway.');}
// the camera circles your head; the buttons (or a drag) turn it
const barbCam={p:new THREE.Vector3(),t:new THREE.Vector3(),init:false};
function barberCam(dt){if(!barberOpen)return;const T=av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,ctab==='beard'?-.03:0,0));const k=Math.min(1,dt*5);
  // turn round the head (not through it) to the angle you picked
  const want=player.face+bview;if(!barbCam.init){barbCam.a=want;barbCam.d=.7;barbCam.t.copy(T);barbCam.init=true;}barbCam.a=angDamp(barbCam.a,want,k);barbCam.d+=((ctab==='cut'?.7:.55)-barbCam.d)*k;barbCam.t.lerp(T,k);
  const a=barbCam.a;camera.position.copy(barbCam.t).add(new THREE.Vector3(Math.sin(a)*barbCam.d,.06,Math.cos(a)*barbCam.d));camera.lookAt(barbCam.t);}
function snipFx(c){const h=av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.12,0));burst(h,c||'#3a2618',26,1.2,.05);
  tone(140,.5,'sawtooth',.03,0,170);setTimeout(()=>{tone(2400,.04,'square',.04);tone(1800,.04,'square',.04,.05);},120);
  const m=shopNPC.max;if(m){m.a.play(rnd(['magic','clap']));if(Math.random()<.6)say(m,rnd(['Fresh! 💈','Looking sharp! ✂️','Nice cut! 😎','That suits you! 👍','Clean! ✨']));}}
const viewChips=()=>`<div class="chips"><button data-bview="1.3">⬅️ Side</button><button data-bview="0">🙂 Front</button><button data-bview="-1.3">➡️ Other side</button><button data-bview="3.14">🔙 Back</button></div>`;
function barberHTML(){const L=SAVE.look,H=L.hair,Bd=L.beard||{id:'none'};const grid=(list,cur,key)=>`<div class="grid">${list.map(([id,e,n])=>`<button class="item${cur===id?' on':''}" data-${key}="${id}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`;
  const sws=(list,cur,key)=>`<div class="swatches">${list.map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-${key}="${c}" aria-label="color ${c}"></button>`).join('')}</div>`;
  if(ctab==='cut')return viewChips()+`<h3>✨ Barber specials</h3>${grid(BCUTS,H.id,'bcut')}<p class="drawhint">Get a special once and it's in your 👕 closet's Hair too.</p><h3>💇‍♂️ Classic cuts</h3>${grid(GUY_HAIRS,H.id,'bcut')}<h3>Hair color</h3>`+sws(myColors(HAIRC),H.c,'bhc');
  if(ctab==='beard')return viewChips()+`<h3>🧔 Facial hair</h3>${grid(BEARDS,Bd.id,'bbeard')}<h3>Beard color</h3><div class="chips"><button data-bbc="${H.c}">🎯 Match my hair</button></div><div style="height:8px"></div>`+sws(HAIRC,Bd.c||H.c,'bbc');
  if(ctab==='bface')return `<p class="drawhint">🙂 Design your face. Tap a shape to try it.</p>`+FACEOPT.filter(o=>o[0]!=='lips').map(([k,t,opts])=>`<h3>${t}</h3><div class="grid">${opts.map(([v,e,n])=>`<button class="item${faceVal(L,k)===v?' on':''}" data-bface="${k}:${v}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`).join('')+
    `<h3>Skin tone</h3>`+sws(SKIN,L.skin,'bskin')+`<h3>Eye color</h3>`+sws(EYES,L.eyes,'beyes');
  return '';}
function barberSeat(){av.g.position.copy(player.pos);av.g.rotation.y=player.face;av.play('chair');}
function barberClick(b){const L=SAVE.look,d=b.dataset;
  if(d.bview!=null){bview=+d.bview;sfx('pop');return true;}
  if(d.bcut){L.hair={id:d.bcut,c:L.hair.c};if(BCUT[d.bcut]){SAVE.cuts=SAVE.cuts||{};if(!SAVE.cuts[d.bcut]){SAVE.cuts[d.bcut]=true;setTimeout(()=>toast('✨ New cut! It\'s in your closet now too.'),600);}}
    persist();av.dress(L);barberSeat();snipFx(L.hair.c);did('barber',d.bcut);renderCloset();return true;}
  if(d.bhc){L.hair.c=d.bhc;persist();av.dress(L);barberSeat();snipFx(d.bhc);renderCloset();return true;}
  if(d.bbeard){L.beard={id:d.bbeard,c:(L.beard&&L.beard.c)||L.hair.c};persist();av.dress(L);barberSeat();snipFx(L.beard.c);renderCloset();return true;}
  if(d.bbc){L.beard=Object.assign({id:'none'},L.beard,{c:d.bbc});if(L.beard.id==='none')toast('Pick a beard first, then its color 🧔');persist();av.dress(L);barberSeat();sfx('pop');renderCloset();return true;}
  if(d.bface){const [k,v]=d.bface.split(':');L.face=Object.assign({},L.face,{[k]:v});persist();rebuildPlayer();barberSeat();sfx('pop');const m=shopNPC.max;if(m&&Math.random()<.5)say(m,rnd(['Great look! 😎','Nice! 👍']));renderCloset();return true;}
  if(d.bskin){L.skin=d.bskin;persist();av.dress(L);barberSeat();sfx('pop');renderCloset();return true;}
  if(d.beyes){L.eyes=d.beyes;persist();av.dress(L);barberSeat();sfx('pop');renderCloset();return true;}
  return false;}

/* ---------- 👔 the clothing store ---------- */
const STORE_TABS=[['glasses','🕶️','Glasses'],['tops','👕','Tops'],['bottoms','👖','Bottoms'],['shoes','👟','Shoes'],['hats','🧢','Hats'],['extras','⌚','Extras']];
const storeTabs=()=>isGuy(SAVE.look)?STORE_TABS:STORE_TABS.slice(0,1);
let storePrevTab='tops';
function openStore(){if(closetOpen)return;buildShopNPCs();closeTalk();storeOpen=closetOpen=true;storePrevTab=ctab;ctab='glasses';storePick=null;setZoom('face');
  player.pos.copy(zW(STOR,STOR.spad.lx,0,STOR.spad.lz));player.vy=0;player.speed=0;player.face=zFace(STOR,0,1);cam.closetYaw=player.face;cam.fv=null;
  joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';document.body.classList.add('dressing');$('#ctitle').textContent='👔 Clothing Store';STOR.spad.lbl.visible=false;
  const j=shopNPC.jay;if(j){say(j,isGuy(SAVE.look)?rnd(['Welcome in! 👔','Try anything on! 😎','New stuff just came in! ✨']):'Hi! Try on some glasses! 🕶️');j.a.play('wave');}
  if(!isGuy(SAVE.look))setTimeout(()=>toast('The clothes here are for guys, but anyone can try on glasses! 🕶️'),900);
  renderCloset();$('#closet').classList.add('show');$('#ccontent').scrollTop=0;sfx('tada');}
function closeStore(){if(!storeOpen)return;storeOpen=closetOpen=false;storePick=null;ctab=storePrevTab;czoom='body';document.body.classList.remove('dressing');$('#closet').classList.remove('show');$('#ctitle').textContent='👗 My closet';STOR.spad.lbl.visible=true;
  av.dress(SAVE.look);player.pos.copy(zW(STOR,STOR.spad.lx,0,STOR.spad.lz+1));player.face=zFace(STOR,0,1);cam.yaw=cam.cy=player.face+Math.PI;cam.fv=null;av.play('twirl');did('store');}
// try something on: it shows on you, but it's only yours once you buy it
function tryOn(id){storePick=id;const L=JSON.parse(JSON.stringify(SAVE.look));applyItem(L,id);av.dress(L);av.play('twirl');sfx('pop');renderCloset();}
function storeHTML(){const list=STORE_CAT[ctab]||[],have=SAVE.coins||0;let h=`<p class="drawhint">🪙 You have <b>${have}</b> coins. Tap something to try it on!</p>`;
  if(storePick){const s=shopItem('look:'+storePick),mine=owns(s.k),L=SAVE.look,wearing=L.extras&&L.extras[storePick]||[L.top,L.bottom,L.shoes,L.hat].some(x=>x&&x.id===storePick);
    h+=`<div class="earn"><div><b>${s.e}</b><span><b>${s.n}</b><br>${s.d}</span><em>${mine?'✅ Yours':`🪙 ${s.p}`}</em></div></div><div class="chips" style="margin:8px 0">`+
      (mine?(wearing?`<button class="on">✅ You're wearing it</button>`:`<button data-swear="${storePick}">✨ Wear it</button>`)
        :have>=s.p?`<button class="on" data-sbuy="${storePick}">🛍️ Buy for ${s.p} 🪙</button>`:`<button disabled>🪙 You need ${s.p-have} more</button>`)+`<button data-sback="1">↩️ Take it off</button></div>`;
    if(!mine&&have<s.p)h+=`<p class="drawhint">Earn coins by finding ⭐ stars, taking care of your pet and helping the townspeople. Tap 🪙 at the top to see more ways.</p>`;}
  h+=`<div class="grid">${list.map(([id,e,n])=>{const s=shopItem('look:'+id),m=owns(s.k);return `<button class="item${storePick===id?' on':''}" data-spick="${id}"><b>${e}</b><span>${n}</span><em class="${m?'got':''}">${m?'✅ Yours':`🪙 ${s.p}`}</em></button>`;}).join('')}</div>`;
  if(!isGuy(SAVE.look))h+=`<p class="drawhint">The clothes here are for guys. Girls' outfits are in the 🪙 coin shop and your 👗 closet.</p>`;
  return h;}
function storeClick(b){const d=b.dataset;
  if(d.spick){tryOn(d.spick);return true;}
  if(d.sback){storePick=null;av.dress(SAVE.look);sfx('pop');renderCloset();return true;}
  if(d.sbuy){const k='look:'+d.sbuy;buy(k);const j=shopNPC.jay;if(j&&owns(k)){say(j,rnd(['Great pick! 😎','Looks awesome on you! 👔','Enjoy! 🛍️']));j.a.play('clap');}return true;}
  if(d.swear){wearIt('look:'+d.swear);return true;}
  return false;}

// inside a shop the camera stays under the roof (like the agency's)
function shopCamClamp(z,tgt){const b=z.box;const [plx,plz]=z.toLocal(tgt.x,tgt.z);if(Math.abs(plx)>b.W-.3||plz<b.B+.3||plz>b.F-.7)return;
  const [clx,clz]=z.toLocal(camera.position.x,camera.position.z);let t=1;const lim=(c,p,lo,hi)=>{if(c>hi&&c!==p)t=Math.min(t,(hi-p)/(c-p));if(c<lo&&c!==p)t=Math.min(t,(lo-p)/(c-p));};
  lim(clx,plx,-b.W+.4,b.W-.4);lim(clz,plz,b.B+.4,b.F-.4);lim(camera.position.y,tgt.y,.3,b.H-.25);if(t<1)camera.position.lerpVectors(tgt,camera.position,Math.max(.05,t));}

/* ---------- the closet panel's buttons go here while you're at the barber or the store ---------- */
{const tabsClick=$('#tabs').onclick,contentClick=$('#ccontent').onclick;
 $('#tabs').onclick=e=>{if(!barberOpen&&!storeOpen)return tabsClick(e);const b=e.target.closest('[data-tab]');if(!b)return;ctab=b.dataset.tab;sfx('pop');
   if(barberOpen){bview=BVIEW[ctab]??0;}
   if(storeOpen){storePick=null;av.dress(SAVE.look);setZoom(ctab==='glasses'?'face':'body');}
   renderCloset();$('#ccontent').scrollTop=0;};
 $('#ccontent').onclick=e=>{if(!barberOpen&&!storeOpen)return contentClick(e);const b=e.target.closest('button');if(!b)return;if(barberOpen)barberClick(b);else storeClick(b);};}
