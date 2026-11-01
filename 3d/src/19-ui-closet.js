/* ================= UI ================= */
let toastT;function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2200);}
let bannerT;function banner(t){const el=$('#banner');el.textContent=t;el.classList.add('show');clearTimeout(bannerT);bannerT=setTimeout(()=>el.classList.remove('show'),1800);}
/* action buttons around the jump button */
const ACTIONS=[['wave','👋','Wave'],['dance','💃','Dance'],['twirl','🌀','Twirl'],['kiss','😘','Kiss'],['clap','👏','Clap'],['cheer','🙌','Cheer'],['flip','🤸','Flip'],['sit','🧘‍♀️','Sit'],['pose','✨','Pose'],['bow','👑','Curtsy'],['magic','🪄','Magic'],['jumpjack','⭐','Star jump']];
let actPage=0;const PER=4;
const allActs=()=>ACTIONS.concat(SHOP.filter(s=>s.tab==='moves'&&owns(s.k)).map(s=>[s.k.slice(5),s.e,s.lab]));
function renderActions(){const el=$('#actions'),A=allActs();const pages=Math.ceil(A.length/PER);if(actPage>=pages)actPage=0;const list=A.slice(actPage*PER,actPage*PER+PER);
  const R=112,cx=66,cy=72,pos=(deg,half)=>{const a=deg*Math.PI/180;return `right:calc(env(safe-area-inset-right) + ${(cx-Math.cos(a)*R-half).toFixed(0)}px);bottom:calc(env(safe-area-inset-bottom) + ${(cy+Math.sin(a)*R-half).toFixed(0)}px)`;};
  el.innerHTML=list.map((a,i)=>`<button class="act pop" data-act="${a[0]}" style="${pos([165,135,105,75][i],27)}">${a[1]}<span>${a[2]}</span></button>`).join('')+
   `<button class="act more" data-more="1" style="${pos(196,22)}" aria-label="More moves">⋯<span>${actPage+1}/${pages}</span></button>`;}
$('#actions').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.more){actPage=(actPage+1)%Math.ceil(allActs().length/PER);renderActions();sfx('pop');return;}if(owns('move:'+b.dataset.act))doMove(b.dataset.act);else doAction(b.dataset.act);});
const heartTex={};function floaties(pos,emoji,n=6){if(!heartTex[emoji])heartTex[emoji]=canvasTex(64,64,(x)=>{x.font='52px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,32,36);});
  for(let i=0;i<n;i++){const s=sprite(heartTex[emoji],.2,.2);s.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*.4,Math.random()*.2,(Math.random()-.5)*.4));scene.add(s);const v=new THREE.Vector3((Math.random()-.5)*.6,.9+Math.random()*.6,(Math.random()-.5)*.6);let life=1.4+Math.random()*.5;
    const f=(t,dt)=>{life-=dt;s.position.addScaledVector(v,dt);s.material.opacity=Math.min(1,life);s.scale.setScalar(.2+(1.6-life)*.06);if(life<=0){scene.remove(s);s.material.dispose();anims.splice(anims.indexOf(f),1);}};anims.push(f);}}
function headPos(){return av.head.getWorldPosition(new THREE.Vector3());}
function doAction(id){if(closetOpen||!started)return;const P=player.pos;questEvent('act',id);
  if(id==='flip'){if(!player.onGround)return;player.vy=7.6;player.onGround=false;sfx('jump');}
  if(id==='cheer'||id==='jumpjack'){if(player.onGround){player.vy=5;player.onGround=false;}}
  if(id==='jumpjack'){av.play('cheer');burst(new THREE.Vector3(P.x,P.y+1.2,P.z),'#ffd23f',30,2.5,.18);return;}
  av.play(id);
  if(id==='twirl')burst(new THREE.Vector3(P.x,P.y+1,P.z),'#ffb3e0',30,2,.18);
  if(id==='kiss')setTimeout(()=>floaties(headPos(),'💖',7),650);
  if(id==='clap')setTimeout(()=>floaties(headPos(),'✨',4),300);
  if(id==='magic')for(let k=0;k<4;k++)setTimeout(()=>burst(new THREE.Vector3(P.x,P.y+1.4,P.z),rnd(['#ff8fc8','#ffd23f','#8fd8ff','#c6a6ff']),36,3,.2),k*350);
  if(id==='dance'||id==='wave')for(const f of FRIENDS)if(f.pos.distanceTo(P)<6){setTimeout(()=>{f.play(id);if(id==='wave')friendBubble(f,`Hi ${SAVE.name||'friend'}! 👋`);},300+Math.random()*500);}
  if(myPet()&&myPet().pos.distanceTo(P)<5&&(id==='dance'||id==='cheer'||id==='magic'))myPet().happy=1.5;}
renderActions();
function updateStars(){did('stars');}
(SAVE.stars||[]).forEach(i=>{if(STARS[i]){STARS[i].got=true;STARS[i].m.visible=false;}});updateStars();

/* photo */
let wantPhoto=false;$('#photoBtn').onclick=()=>{wantPhoto=true;};
function takePhoto(){questEvent('act','photo');const url=canvas.toDataURL('image/png');$('#flash').style.transition='none';$('#flash').style.opacity=.9;requestAnimationFrame(()=>{$('#flash').style.transition='opacity .5s';$('#flash').style.opacity=0;});
  try{sndCam.currentTime=0;sndCam.play().catch(()=>{});}catch(e){}$('#photoImg').src=url;$('#photoSave').href=url;setTimeout(()=>$('#photo').classList.add('show'),350);}
$('#photoClose').onclick=()=>$('#photo').classList.remove('show');
$('#setBtn').onclick=()=>{joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';$('#settings').classList.add('show');};
$('#setClose').onclick=()=>$('#settings').classList.remove('show');
$('#settings').onclick=e=>{if(e.target.id==='settings')$('#settings').classList.remove('show');};

/* runway pose */
$('#poseBtn').onclick=()=>{av.play('pose');try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}setTimeout(()=>{wantPhoto=true;},700);burst(new THREE.Vector3(player.pos.x,player.pos.y+1.2,player.pos.z),'#ffd6f0',60,3);};

/* closet */
const TABS=[['hair','💇','Hair'],['skin','🙂','Face'],['makeup','💄','Makeup'],['dresses','👗','Dresses'],['tops','👕','Tops'],['bottoms','👖','Bottoms'],['shoes','👟','Shoes'],['hats','👑','Hats'],['extras','👜','Extras']];
let ctab='dresses',lastExtra=null,czoom='body';
const MK_SHADOW=['#ff6fae','#ffb3d1','#b388ff','#8e6cff','#4fb6ff','#2fd1c5','#7ee081','#ffd23f','#d4af37','#c0c0c0','#ff8a1f','#8a5a3b','#2d2d3a'];
const MK_LIPS=['#ff3b6b','#e0263b','#c2185b','#ff6fae','#ffb3d1','#e89aa0','#b5655b','#8e2b5b','#ff8a1f','#8e6cff','#4fb6ff','#2d2d3a'];
const MK_BRUSH=['#2b1d16','#000000','#ffffff','#ff3b6b','#c2185b','#ff6fae','#b388ff','#4fb6ff','#2fd1c5','#7ee081','#ffd23f','#d4af37','#c0c0c0','#8a5a3b'];
function renderCloset(){const L=SAVE.look;
  $('#tabs').innerHTML=(glamOpen?GTABS:TABS).map(([id,ico,n])=>`<button class="tab${id===ctab?' on':''}" data-tab="${id}"><b>${ico}</b>${n}</button>`).join('');
  let h='';const sw=(list,cur,kind)=>`<div class="swatches">${list.map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-sw="${kind}" data-c="${c}" aria-label="color ${c}"></button>`).join('')}</div>`;
  const gh=glamOpen&&glamHTML();if(gh)h=gh;
  else if(ctab==='hair'){h+=`<h3>Hair style</h3><div class="grid">${HAIRS.map(([id,ico,n])=>`<button class="item${L.hair.id===id?' on':''}" data-hair="${id}"><b>${ico}</b><span>${n}</span></button>`).join('')}</div><h3>Hair color</h3>`+sw(myColors(HAIRC),L.hair.c,'hair');}
  else if(ctab==='makeup'){const mk=L.makeup;const swn=(list,cur,kind)=>`<div class="swatches"><button class="sw none${!cur?' on':''}" data-sw="${kind}" data-c="" aria-label="none">🚫</button>${list.map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-sw="${kind}" data-c="${c}"></button>`).join('')}</div>`;
    const ch=(key,opts)=>`<div class="chips">${opts.map(([v,n])=>`<button class="${String(mk[key])===String(v)?'on':''}" data-mk="${key}" data-v="${v}">${n}</button>`).join('')}</div>`;
    h+=`<div class="zoomrow">${[['eyes','👁️ Eyes'],['lips','👄 Lips'],['face','🙂 Face']].map(([z,n])=>`<button class="${czoom===z?'on':''}" data-zoom="${z}">${n}</button>`).join('')}</div>
      <h3>🖌️ Draw on the face</h3><p class="drawhint">Drag your finger on the face to draw liner, lashes, freckles or face paint.</p>
      <div class="chips">${[['thin','✏️ Thin'],['medium','🖍️ Medium'],['thick','🎨 Thick']].map(([v,n])=>`<button class="${!brush.erase&&brush.size===v?'on':''}" data-brush="${v}">${n}</button>`).join('')}<button class="${brush.erase?'on':''}" data-brush="erase">🧽 Eraser</button><button data-brush="undo">↩️ Undo</button><button data-brush="clear">🗑️ Clear</button></div>
      <div style="height:8px"></div>`+sw(MK_BRUSH,brush.erase?null:brush.c,'brush')+
      `<h3>👁️ Eyeshadow</h3>`+swn(MK_SHADOW,mk.shadow,'shadow')+
      `<h3>Eyeliner</h3>`+ch('liner',[['none','None'],['thin','Thin'],['bold','Bold'],['wing','Cat eye']])+`<div style="height:8px"></div>`+sw(['#2b1d16','#000000','#6a3df0','#3a5bd9','#2fd1c5','#d4af37','#ff3b6b'],mk.linerC,'linerC')+
      `<h3>Lashes</h3>`+ch('lashes',[['natural','Natural'],['long','Long'],['bold','Dramatic']])+
      `<h3>✨ Face gems</h3>`+ch('gems',[[false,'Off'],[true,'Sparkly gems']])+
      `<h3>👄 Lipstick</h3>`+swn(MK_LIPS,mk.lips,'lips')+
      `<h3>Lip liner</h3>`+swn(MK_LIPS,mk.lipLiner,'lipLiner')+
      `<h3>Lip gloss</h3>`+ch('gloss',[[false,'Matte'],[true,'Shiny gloss']])+
      `<h3>🌸 Blush</h3>`+ch('blush',[['none','None'],['pink','Pink'],['peach','Peach'],['rose','Rose']]);}
  else if(ctab==='skin'){h+=`<h3>Look style</h3><div class="grid">${[['glam','💃','Glam girl'],['cute','🧸','Cute cartoon']].map(([v,e,n])=>`<button class="item${(L.style||'glam')===v?' on':''}" data-style="${v}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`+((L.style||'glam')!=='cute'?FACEOPT.map(([k,t,opts])=>`<h3>${t}</h3><div class="grid">${opts.map(([v,e,n])=>`<button class="item${((L.face||{})[k]||opts[0][0])===v?' on':''}" data-face="${k}:${v}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`).join(''):'')+`<h3>Skin tone</h3>`+sw(SKIN,L.skin,'skin')+`<h3>Eye color</h3>`+sw(EYES,L.eyes,'eyes');}
  else{const list=CAT[ctab],k=KEY[ctab];
    if(ctab==='extras'){h+=`<h3>Tap to add or take off</h3><div class="grid">${inSeason(list).map(([id,ico,n])=>lockBtn('look:'+id,ico,n)||`<button class="item${L.extras[id]?' on':''}" data-item="${id}"><b>${ico}</b><span>${n}</span></button>`).join('')}</div>`;
      if(lastExtra&&L.extras[lastExtra])h+=`<h3>Color</h3>`+sw(myColors(COLORS),L.extras[lastExtra],'item');}
    else{const cur=L[k];const none=ctab!=='shoes'&&ctab!=='dresses'?`<button class="item${!cur?' on':''}" data-item=""><b>🚫</b><span>None</span></button>`:'';
      h+=`<div class="grid">${none}${inSeason(list).map(([id,ico,n])=>lockBtn('look:'+id,ico,n)||`<button class="item${cur&&cur.id===id?' on':''}" data-item="${id}"><b>${ico}</b><span>${n}</span></button>`).join('')}</div>`;
      if(cur)h+=`<h3>Color</h3>`+sw(myColors(COLORS),cur.c,'item');}}
  $('#ccontent').innerHTML=h;}
function rebuildPlayer(){scene.remove(av.g);av=new Avatar(SAVE.look,SAVE.name||'Brynny','#ff4d8d',true);scene.add(av.g);loadPaint(av);av.g.position.copy(player.pos);av.g.rotation.y=player.face;}
function changed(){if(glamOpen){persist();sfx('pop');glamSeat(true);renderCloset();return;}av.dress(SAVE.look);persist();sfx('pop');if(ctab==='makeup'){renderCloset();return;}av.play('hop');burst(new THREE.Vector3(player.pos.x,player.pos.y+1.1,player.pos.z),'#ffd6f0',24,1.6,.1);renderCloset();}
function setZoom(z){czoom=z;if(z!=='body')player.face=cam.closetYaw;}
$('#tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;ctab=b.dataset.tab;setZoom(ctab==='makeup'||ctab==='skin'?'face':'body');if(glamOpen){gcam.init=false;glamSeat(false);}renderCloset();$('#ccontent').scrollTop=0;};
$('#ccontent').onclick=e=>{const L=SAVE.look;const b=e.target.closest('button');if(!b)return;if(glamOpen&&glamClick(b))return;
  if(b.dataset.lock){askBuy(b.dataset.lock);return;}
  if(b.dataset.hair){L.hair.id=b.dataset.hair;return changed();}
  if(b.dataset.face){const [k,v]=b.dataset.face.split(':');L.face=Object.assign({},L.face,{[k]:v});persist();rebuildPlayer();if(glamOpen)glamSeat(false);sfx('pop');renderCloset();return;}
  if(b.dataset.style){if(L.style!==b.dataset.style){L.style=b.dataset.style;persist();rebuildPlayer();sfx('pop');}renderCloset();return;}
  if(b.dataset.zoom){setZoom(b.dataset.zoom);if(b.dataset.zoom==='lips'){brush.c=L.makeup.lips||'#c2185b';brush.size='thin';brush.erase=false;}if(b.dataset.zoom==='eyes'){brush.c='#2b1d16';brush.size='thin';brush.erase=false;}renderCloset();return;}
  if(b.dataset.brush){const v=b.dataset.brush,x=av.paintCv.getContext('2d');
    if(v==='erase')brush.erase=!brush.erase;else if(v==='undo'){const d=undo.pop();if(d){x.putImageData(d,0,0);av.renderFace();savePaint();}else toast('Nothing to undo');}
    else if(v==='clear'){undo.push(x.getImageData(0,0,av.paintCv.width,av.paintCv.height));x.clearRect(0,0,av.paintCv.width,av.paintCv.height);av.renderFace();savePaint();}
    else{brush.size=v;brush.erase=false;}renderCloset();return;}
  if(b.dataset.mk){const v=b.dataset.v;L.makeup[b.dataset.mk]=v==='true'?true:v==='false'?false:v;return changed();}
  if(b.dataset.sw==='brush'){brush.c=b.dataset.c;brush.erase=false;renderCloset();return;}
  if(['shadow','lips','lipLiner','linerC'].includes(b.dataset.sw)){L.makeup[b.dataset.sw]=b.dataset.c||null;if(b.dataset.sw==='linerC'&&L.makeup.liner==='none')L.makeup.liner='thin';return changed();}
  if(b.dataset.sw){const c=b.dataset.c,k=b.dataset.sw;if(k==='hair')L.hair.c=c;else if(k==='skin')L.skin=c;else if(k==='eyes')L.eyes=c;
    else if(ctab==='extras'){if(lastExtra)L.extras[lastExtra]=c;}else{const cur=L[KEY[ctab]];if(cur)cur.c=c;}return changed();}
  if('item' in b.dataset){const id=b.dataset.item;const list=CAT[ctab];const it=list.find(x=>x[0]===id);
    if(ctab==='extras'){if(L.extras[id]){delete L.extras[id];lastExtra=null;}else{L.extras[id]=it[3];lastExtra=id;}return changed();}
    const k=KEY[ctab];if(!id){L[k]=null;}else{const prev=L[k];L[k]={id,c:prev&&prev.id===id?prev.c:(prev&&ctab!=='dresses'&&ctab!=='hats'?prev.c:it[3])};if(prev&&prev.id===id)L[k].c=prev.c;else L[k].c=it[3];}
    if(ctab==='dresses'&&id){L.top=null;L.bottom=null;}if((ctab==='tops'||ctab==='bottoms')&&id){if(L.dress){L.dress=null;if(ctab==='tops'&&!L.bottom)L.bottom={id:'jeans',c:'#3a5bd9'};if(ctab==='bottoms'&&!L.top)L.top={id:'tee',c:'#ff6fae'};}}
    return changed();}};
function openCloset(){if(closetOpen)return;closeTalk();closetOpen=true;Z.studio.padLbl.visible=false;setZoom(ctab==='makeup'||ctab==='skin'?'face':'body');document.body.classList.add('dressing');renderCloset();$('#closet').classList.add('show');player.face=cam.yaw;cam.closetYaw=cam.yaw;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';}
function closeCloset(){if(glamOpen){closeGlam();return;}closetOpen=false;Z.studio.padLbl.visible=true;czoom='body';document.body.classList.remove('dressing');$('#closet').classList.remove('show');cam.yaw=cam.closetYaw;player.face=cam.closetYaw+Math.PI;av.play('twirl');closeClosetHook();did('dress');}
function closeClosetHook(){if(ct.on&&ct.sub==='closet'){ct.sub=null;backToContest();}}
$('#done').onclick=closeCloset;

