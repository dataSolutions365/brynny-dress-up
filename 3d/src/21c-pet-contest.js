/* ================= PET DRESS-UP CONTEST =================
   A fashion show for pets, run like the cake contest (21b-cake-contest.js): a theme, a countdown, three other
   kids with their own pets, three judges and ⭐ stars for the winners. You dress your pet in the normal Pet Parlor
   (20-pet-parlor.js) while the clock ticks, and the other pets get dressed on their stands at the same time.
   When time is up the judges look at every pet and hold up a score from 1 to 10.
   Your pet's own outfit is put back afterwards unless you choose to keep the contest look. */
const pc={on:false,phase:'',th:null,secs:90,pick:90,end:0,seed:'',pet:null,backup:null,keep:false,
  rv:null,rivals:[],judges:[],entries:[],jq:[],jT:0,cur:null,focus:null,hudSec:-1,warned:{},built:false,
  cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),wp:new THREE.Vector3(),wt:new THREE.Vector3(),init:false}};
const PC_TIMES=[[60,'1 min'],[90,'1½ min'],[120,'2 min']];
const PC_STARS=[3,2,1,0],PC_COINS=[20,15,10,5],PC_MEDAL=['🥇','🥈','🥉','🎀'];
const PC_RIVALS=[{n:'Zoe',pet:['cat','#ffffff','Snowflake',{light:'#ffffff'}]},{n:'Lily',pet:['dog','#c98b4b','Peanut',{light:'#f3d79e'}]},{n:'Emma',pet:['bunny','#9b8574','Hazel',{}]}];
const PC_JUDGES=[{n:'Madame Purrfect',e:'🐈',what:'the theme',w:[.6,.2,.2]},{n:'Sir Woofington',e:'🐕',what:'matching colors',w:[.2,.6,.2]},{n:'Coco Glitter',e:'💅',what:'the wow',w:[.2,.2,.6]}];
// where things stand in the Pet Parlor (local coordinates, see 10-place-pet-parlor.js); your pet uses the grooming table
const PC_SLOTS=[[-2.1,-1.9],[2.1,-1.9],[2.1,.25]],PC_OWNER=[[-2.75,-1.35],[2.75,-1.35],[2.8,.8]],PC_JSPOT=[[-1.05,1.85],[0,2.05],[1.05,1.85]];
const PC_PAD={lx:-2.1,lz:1.45,r:.6},PC_STAND_H=.36;
// fancy things the Wow judge loves
const PC_FANCY=new Set(['unicorn','halo','crown','tiara','wings','angel','sparkle','jewel','pearls','cape','dress','tux','mask','monocle']);

/* ---------- themes: what the judges look for, and what the computer kids pick ---------- */
const pcNear=(c,list)=>{if(!c||c[0]!=='#')return false;const a=new THREE.Color(c);return list.some(p=>{const b=new THREE.Color(p);return Math.hypot(a.r-b.r,a.g-b.g,a.b-b.b)<.32;});};
const PC_THEMES=[
  {id:'party',e:'🥳',n:'Birthday Party',tip:'Party time! A party hat, a balloon, a bow and bright, happy colors.',pal:['#ff6fae','#4fb6ff','#ffd23f','#7ee081','#b388ff','#ff3b6b'],
    want:I=>[[I.has('party','crown'),'🥳','A party hat or a crown'],[I.has('balloon'),'🎈','A balloon'],[I.has('bowtie','bow','tailbow'),'🎀','A bow somewhere'],[I.count(ckBright)>=2,'🎨','Bright, happy colors'],[I.n>=4,'👗','4 things or more']],
    r:{hat:['party','crown','bow'],neck:['bowtie','medal'],body:['tutu','dress','sweater'],glasses:['star','heart'],feet:['sneakers','socks'],extra:['balloon','tailbow']}},
  {id:'spooky',e:'🎃',n:'Spooky Night',tip:'Halloween! A witch or pumpkin hat, bat wings or a cape, a mask, and black, purple or orange.',pal:['#2d2d3a','#5b2a86','#8e6cff','#ff8a1f','#e0263b'],
    want:I=>[[I.has('witch','pumpkin'),'🎃','A witch or pumpkin hat'],[I.has('bat','cape'),'🦇','Bat wings or a cape'],[I.has('mask','sun'),'🎭','A mask or dark glasses'],[I.pal>=.6,'🖤','Black, purple or orange'],[I.n>=4,'🕸️','4 things or more']],
    r:{hat:['witch','pumpkin'],neck:['bandana','bowtie'],body:['bat','cape'],glasses:['mask','sun'],feet:['boots','socks'],extra:['sparkle','tailbow']}},
  {id:'beach',e:'🏖️',n:'Beach Day',tip:'Sunny fun! A sun hat or cap, sunglasses or goggles, a swim ring and a flower lei.',pal:['#4fb6ff','#2fd1c5','#ffd23f','#ff8a1f','#ff6fae','#fff1b8'],
    want:I=>[[I.has('sunhat','cap'),'👒','A sun hat or a ball cap'],[I.has('sun','goggles'),'🕶️','Sunglasses or swim goggles'],[I.has('floatie'),'🛟','A swim ring'],[I.has('lei','bandana'),'🌺','A flower lei or a bandana'],[I.count(ckBright)>=2,'🌈','Bright summer colors']],
    r:{hat:['sunhat','cap'],neck:['lei','bandana'],body:['floatie'],glasses:['sun','goggles','heart'],feet:['sneakers'],extra:['balloon']}},
  {id:'royal',e:'👑',n:'Royal Ball',tip:'So fancy! A crown or tiara, pearls or jewels, a cape, dress or tuxedo, and gold, purple or white.',pal:['#ffd23f','#d4af37','#e8c25a','#8e6cff','#b388ff','#5b2a86','#ffffff','#c0c0c0'],
    want:I=>[[I.has('crown','tiara'),'👑','A crown or a tiara'],[I.has('pearls','jewel'),'💎','Pearls or jewels'],[I.has('cape','dress','tux'),'👗','A cape, dress or tuxedo'],[I.pal>=.6,'✨','Gold, purple or white'],[I.has('sparkle','monocle','medal'),'🌟','Something extra (sparkles, a monocle or a medal)']],
    r:{hat:['crown','tiara'],neck:['pearls','jewel'],body:['cape','dress','tux'],glasses:['monocle'],feet:['slippers'],extra:['sparkle']}},
  {id:'fairy',e:'🧚',n:'Fairy Garden',tip:'Magical! Wings, a flower crown, unicorn horn or halo, flowers and soft pastel colors.',pal:['#ffb3d1','#b388ff','#cfefff','#ffffff','#ff8fc8','#7ee081'],
    want:I=>[[I.has('wings','angel'),'🧚','Fairy or angel wings'],[I.has('flowers','unicorn','halo'),'🌸','A flower crown, unicorn horn or halo'],[I.has('lei','flower','sparkle'),'🌼','Flowers or sparkles'],[I.n>0&&I.count(ckPastel)/I.n>=.6,'🌈','Soft pastel colors'],[I.has('tutu','dress','slippers'),'🩰','A tutu, a dress or fluffy slippers']],
    r:{hat:['flowers','unicorn','halo'],neck:['lei','pearls'],body:['wings','angel','tutu'],glasses:['flower','heart'],feet:['slippers'],extra:['sparkle']}},
  {id:'snow',e:'❄️',n:'Snow Day',tip:'Brrr! A Santa hat or antlers, a scarf or bell, a warm sweater, and boots or socks.',pal:['#e0263b','#ffffff','#7ee081','#c2185b','#4fb6ff','#cfefff'],
    want:I=>[[I.has('santa','antlers'),'🎅','A Santa hat or antlers'],[I.has('scarf','bell'),'🧣','A scarf or a jingle bell'],[I.has('sweater','raincoat'),'🧶','A warm sweater or coat'],[I.slot('feet'),'🧦','Something warm on the paws'],[I.pal>=.6,'🎄','Red, white, green or icy blue']],
    r:{hat:['santa','antlers'],neck:['scarf','bell'],body:['sweater'],glasses:['round'],feet:['boots','socks','slippers'],extra:['backpack']}},
  {id:'west',e:'🤠',n:'Wild West',tip:'Yee-haw! A cowboy hat, a bandana, boots, and brown, red or orange.',pal:['#c47a3a','#8a5a3b','#e0263b','#ff8a1f','#ffd23f'],
    want:I=>[[I.has('cowboy'),'🤠','A cowboy hat'],[I.has('bandana','scarf'),'🧣','A bandana'],[I.has('boots'),'👢','Boots'],[I.pal>=.6,'🐴','Brown, red or orange'],[I.n>=4,'⭐','4 things or more']],
    r:{hat:['cowboy'],neck:['bandana','medal'],body:['cape','raincoat'],glasses:['sun'],feet:['boots'],extra:['backpack','tailbow']}},
  {id:'bugs',e:'🐝',n:'Busy Bees',tip:'Buzz buzz! A bee costume, flowers, rain boots, and yellow and black.',pal:['#ffd23f','#2d2d3a','#ff8a1f','#7ee081','#ffffff'],
    want:I=>[[I.has('bee'),'🐝','A bee costume'],[I.has('flowers','lei','flower'),'🌼','Flowers'],[I.has('boots','raincoat','cap'),'☔','Rain boots, a raincoat or a cap'],[I.pal>=.6,'💛','Yellow and black'],[I.n>=4,'🍯','4 things or more']],
    r:{hat:['flowers','cap'],neck:['lei','bowtie'],body:['bee'],glasses:['flower','round'],feet:['boots'],extra:['backpack','sparkle']}}];
function pcPickTheme(){const last=(SAVE.petContest||{}).last;return rnd(PC_THEMES.filter(t=>t.id!==last));}

/* ---------- judging an outfit ---------- */
function pcInfo(F,th){const items=PSLOTS.map(s=>F[s[0]]).filter(Boolean),cols=items.map(f=>f.c);
  const I={F,n:items.length,has:(...ids)=>items.some(f=>ids.includes(f.id)),slot:s=>!!F[s],count:fn=>cols.filter(fn).length,
    pal:cols.length?cols.filter(c=>pcNear(c,th.pal)).length/cols.length:0,fancy:items.filter(f=>PC_FANCY.has(f.id)).length};return I;}
// three scores from 0 to 1: theme, colors, wow. Each judge cares about one of them most.
function pcJudge(F,th,R){const I=pcInfo(F,th),want=th.want(I),T=want.filter(w=>w[0]).length/want.length;
  const S=I.n?.25+.75*I.pal:0,W=Math.min(1,I.n/5)*.7+Math.min(1,I.fancy/2)*.3;
  const cards=PC_JUDGES.map(j=>{const v=j.w[0]*T+j.w[1]*S+j.w[2]*W;return Math.max(1,Math.min(10,Math.round(1+v*9+(R()-.5)*1.6)));});
  return {T,S,W,cards,sum:cards.reduce((a,b)=>a+b,0)};}
// a computer kid's outfit: better kids (q close to 1) pick more things, and more of them match the theme
function pcRivalFit(th,q,R){const pick=a=>a[Math.floor(R()*a.length)],out=[];
  for(const [slot,,list] of PSLOTS){const want=th.r[slot];if(R()>(want?q+.12:q*.3))continue;
    const id=want&&R()<q+.15?pick(want):pick(list)[0];const def=list.find(x=>x[0]===id);if(!def)continue;
    out.push([slot,{id,c:R()<q?pick(th.pal):R()<.5?def[3]:pick(COLORS)}]);}
  // the order they put things on
  for(let i=out.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}

/* ---------- the room: contest pad, stands, kids, their pets and the judges ---------- */
const pcW=(lx,y,lz)=>{const [x,z]=Z.parlor.toWorld(lx,lz);return new THREE.Vector3(x,y,z);};
const pcFace=(dx,dz)=>{const r=Z.parlor.rot,c=Math.cos(r),s=Math.sin(r);return Math.atan2(dx*c+dz*s,-dx*s+dz*c);};
{const z=Z.parlor,g=z.g;const white=phys('#ffffff',{roughness:.3,clearcoat:.6}),pink=phys('#ff8fc8',{roughness:.3,clearcoat:1}),gold=std('#e8c25a',{metalness:1,roughness:.25});
  z.pcStands=PC_SLOTS.map(([lx,lz])=>{M(cyl(.36,.4,PC_STAND_H-.03,32),white,lx,(PC_STAND_H-.03)/2,lz,g);M(cyl(.4,.4,.03,32),pink,lx,PC_STAND_H-.015,lz,g);
    M(new THREE.TorusGeometry(.4,.016,8,40),gold,lx,PC_STAND_H,lz,g).rotation.x=Math.PI/2;z.ob(lx,lz,.45);});
  const P=PC_PAD;const pm=glow('#ffd23f',1.4);pm.transparent=true;
  M(new THREE.RingGeometry(.45,.62,40),pm,P.lx,.04,P.lz,g,false,false).rotation.x=-Math.PI/2;
  M(new THREE.CircleGeometry(.45,40),phys('#fff3c4',{roughness:.3,emissive:'#ffd23f',emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true).rotation.x=-Math.PI/2;
  const tt=canvasTex(128,128,(x)=>{x.font='92px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🏆',64,70);});
  M(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false).rotation.x=-Math.PI/2;
  const lbl=z.pcLbl=sprite(labelTex('🏆 Pet contest!',{size:50,fg:'#b8860b',border:'#ffe066'}),1.8,.45);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
  anims.push(t=>{pm.opacity=.55+.45*Math.sin(t*3+2);lbl.position.y=1+Math.sin(t*2+2)*.08;});}
function pcNPC(look,name,col,lx,lz,face){const a=new Avatar(look,name,col);const o={a,g:a.g,pos:pcW(lx,0,lz),face,name};a.g.position.copy(o.pos);a.g.rotation.y=face;a.g.visible=false;scene.add(a.g);return o;}
function pcBuild(){if(pc.built)return;pc.built=true;
  const jl=[{hair:{id:'updo',c:'#2b1d16',shine:true},dress:{id:'gown',c:'#8e6cff'},hat:null,extras:{pearls:'#ffffff'}},
    {hair:{id:'bob',c:'#d9d9d9'},dress:null,top:{id:'sweater',c:'#4fb6ff'},bottom:{id:'skirt',c:'#2d2d3a'},hat:null,extras:{glasses:'#2d2d3a'}},
    {hair:{id:'highpony',c:'#ff8fc8',shine:true},dress:{id:'party',c:'#ffd23f'},hat:null,extras:{}}];
  pc.judges=PC_JUDGES.map((j,i)=>{const l=Object.assign(randLook(),{style:'glam'},jl[i]);if(!HAIRS.some(h=>h[0]===l.hair.id))l.hair.id=HAIRS[0][0];
    const [lx,lz]=PC_JSPOT[i];return pcNPC(l,`${j.e} ${j.n}`,'#b8860b',lx,lz,pcFace(-lx*.3,-1));});
  pc.rivals=PC_RIVALS.map((r,i)=>{const l=randLook();l.hat=null;const [lx,lz]=PC_OWNER[i],[sx,sz]=PC_SLOTS[i];const o=pcNPC(l,`🐾 ${r.n}`,'#c2185b',lx,lz,pcFace(sx-lx,sz-lz));
    // their pets: real pets with their own outfit (fitOver), so they never touch your saved pets
    const [k,c,n,po]=r.pet;const pt=new Pet(k,c,n,Z.parlor,po);petExtras(pt);pt.dirtM.forEach(m=>{m.visible=false;});pt.fitOver={};
    pt.g.position.copy(pcW(sx,PC_STAND_H,sz));pt.g.rotation.y=pcFace(Math.sign(sx)*.45,1);pt.g.visible=false;scene.add(pt.g);o.pet=pt;return o;});}
function pcShowPeople(on){pc.judges.forEach(o=>{o.g.visible=on;});pc.rivals.forEach(o=>{o.g.visible=on;o.pet.g.visible=on;});
  // the parlor's other animals take a nap while the show is on, so they don't walk in front of the judges
  if(on){const z=Z.parlor;pc.napping=PETS.filter(pt=>!pt.owned&&pt.g.visible&&Math.hypot(pt.pos.x-z.x,pt.pos.z-z.z)<z.r+2);pc.napping.forEach(pt=>{pt.g.visible=false;});}
  else{(pc.napping||[]).forEach(pt=>{pt.g.visible=true;});pc.napping=null;}}
anims.push((t,dt)=>{if(!pc.on)return;for(const o of [...pc.judges,...pc.rivals]){if(!o.g.visible)continue;o.g.position.copy(o.pos);o.g.rotation.y=o.face+(o.a.spinY||0);o.a.update(dt,0,false);
    if(o.say){o.sayT-=dt;if(o.sayT<0){o.g.remove(o.say);o.say=null;}}
    const pt=o.pet;if(pt){pt.speed=0;pt.vy-=18*dt;pt.y+=pt.vy*dt;if(pt.y<0){pt.y=0;pt.vy=0;}pt.g.position.y=PC_STAND_H+pt.y;pt.update(dt);}}});

/* ---------- the contest panel ---------- */
const pcP=()=>$('#pccontent');
function pcOpen(){if(pc.on||closetOpen)return;const pt=myPet();
  if(!pt){toast('Adopt a pet first! 🐾 Then come back for the pet contest.');sfx('pop');return;}
  closeTalk();pcBuild();
  Object.assign(pc,{on:true,phase:'intro',th:pcPickTheme(),pet:pt,entries:[],focus:null,warned:{},keep:false,backup:null,rv:null});
  closetOpen=true;document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  Z.parlor.pcLbl.visible=false;Z.parlor.padLbl.visible=false;
  pcStage();pcHoldPet(true);pcShowPeople(true);pc.rivals.forEach((o,i)=>{o.pet.fitOver={};dressPet(o.pet);o.a.play('wave');});pc.cam.init=false;
  pcRender();$('#petct').classList.add('show');$('#pccontent').scrollTop=0;sfx('tada');}
// you stand beside the grooming table, your pet sits on it
function pcStage(){player.pos.copy(pcW(-.8,0,.35));player.vy=0;player.speed=0;player.face=pcFace(.6,-1);cam.yaw=cam.cy=cam.closetYaw=player.face;}
function pcHoldPet(on){const pt=pc.pet;if(!pt)return;const z=Z.parlor,T=z.table;
  if(on){const [tx,tz]=z.toWorld(T.lx,T.lz);pt.inParlor=true;pt.pos.set(tx,0,tz);pt.face=z.rot;pt.speed=0;pt.tgt=null;pt.eatT=0;}
  else{pt.inParlor=false;const [x,w]=z.toWorld(-.45,0);pt.pos.set(x,T.h,w);pt.vy=3;pt.happy=2;}}
const pcPlace=i=>['1st','2nd','3rd','4th'][i];
function pcRender(){let h='';const S=SAVE.petContest||{},th=pc.th,pt=pc.pet;$('#pcdone').textContent=pc.phase==='final'?'Done':'Leave';
  if(pc.phase==='intro'){
    h=`<div class="ctTheme"><b>${th.e}</b><div><strong>Theme: ${th.n}</strong><span>${th.tip}</span></div></div>
      <p class="cttext">Dress up <b>${ckEsc(pt.name)}</b> for the theme before the clock runs out. Then the judges look at every pet and give a score from 1 to 10.</p>
      <h3>How much time?</h3><div class="chips">${PC_TIMES.map(([s,n])=>`<button class="${s===pc.pick?'on':''}" data-pct="${s}">⏱️ ${n}</button>`).join('')}</div>
      <h3>The judges</h3><div class="ctwant">${PC_JUDGES.map(j=>`<div><b>${j.e}</b><span>${j.n} loves ${j.what}</span></div>`).join('')}</div>
      <h3>Prizes</h3><div class="earn">${PC_STARS.map((s,i)=>`<div><b>${PC_MEDAL[i]}</b><span>${pcPlace(i)} place</span><em>${s?`+${s} ⭐ `:''}+${PC_COINS[i]} 🪙</em></div>`).join('')}</div>
      <p class="cttext">You're up against ${PC_RIVALS.map(r=>`<b>${r.n}</b> and ${r.pet[2]}`).join(', ')}.${S.wins?` You have won ${S.wins} time${S.wins>1?'s':''}! 🏆`:''}</p>
      <div class="ctbtns"><button class="btn big" data-pc="start">⏱️ Start dressing!</button></div>`;}
  else if(pc.phase==='confirm'){const left=Math.max(0,Math.round((pc.end-Date.now())/1000));
    h=`<div class="ctTheme"><b>⏱️</b><div><strong id="pcLeft">${ckTime(left)} left</strong><span>Is ${ckEsc(pt.name)} ready for the judges?</span></div></div>
      <div class="ctbtns"><button class="btn ghost" data-pc="back">🎀 Keep dressing</button><button class="btn big" data-pc="finish">✅ We're ready!</button></div>`;}
  else if(pc.phase==='final'){const rows=pcRows(),place=rows.findIndex(r=>r.you),me=rows[place];
    h=`<div class="ctTheme gold"><b>${PC_MEDAL[place]}</b><div><strong>${place===0?`${ckEsc(pt.name)} won the pet contest!`:`${ckEsc(pt.name)} came in ${pcPlace(place)} place!`}</strong><span>${place===0?'Best Dressed Pet! 👑':'So cute! Try again to win!'} ${PC_STARS[place]?`+${PC_STARS[place]} ⭐ `:''}+${PC_COINS[place]} 🪙</span></div></div>
      <div class="ctwant"><div><b>${th.e}</b><span>Theme ${ckStar5(me.res.T)}</span></div><div><b>🎨</b><span>Colors ${ckStar5(me.res.S)}</span></div><div><b>✨</b><span>Wow ${ckStar5(me.res.W)}</span></div></div>
      <h3>Scores</h3><div class="board">${rows.map((r,i)=>`<div class="${r.you?'me':''}"><b>${PC_MEDAL[i]}</b><span>${r.you?'⭐ ':''}${ckEsc(r.pet)}</span><i><u style="width:${Math.round(r.res.sum/30*100)}%"></u></i><em>${r.res.sum}</em></div>`).join('')}</div>
      <p class="cttext">${th.want(pcInfo(me.fit,th)).map(([v,e,t])=>`${v?'✅':'⬜'} ${e} ${t}`).join('<br>')}</p>
      <div class="ctbtns"><button class="btn" data-pc="again">🔁 Play again</button><button class="btn ghost" data-pc="keep">💾 Keep this look</button></div>
      <p class="drawhint">Tap Done to put ${ckEsc(pt.name)}'s old outfit back on, or 💾 Keep this look.</p>`;}
  pcP().innerHTML=h;}
$('#pccontent').onclick=e=>{const t=e.target.closest('[data-pct]');if(t){pc.pick=+t.dataset.pct;sfx('pop');pcRender();return;}
  const b=e.target.closest('[data-pc]');if(!b)return;const k=b.dataset.pc;sfx('pop');
  if(k==='start')pcBegin();
  else if(k==='back'){pc.phase='dress';$('#petct').classList.remove('show');pcOpenParlor();}
  else if(k==='finish')pcTimeUp();
  else if(k==='again'){pcEnd(true);closetOpen=false;pcOpen();}
  else if(k==='keep'){pc.keep=true;toast(`${pc.pet.name} keeps the contest look 🎀`);pcEnd();}};
$('#pcdone').onclick=()=>{sfx('pop');pcEnd();};

/* ---------- dressing against the clock ---------- */
function pcOpenParlor(){closetOpen=false;ptab='dress';openParlor(pc.pet);$('#pdone').textContent='✅ Finished!';pcHud();}
function pcBegin(){const th=pc.th,pt=pc.pet,c=petCare(pt);
  Object.assign(pc,{phase:'dress',secs:pc.pick,end:Date.now()+pc.pick*1000,seed:Math.random().toString(36).slice(2,10)+th.id,hudSec:-1,warned:{},keep:false});
  // start from nothing: your pet's real outfit comes back at the end
  pc.backup=JSON.parse(JSON.stringify(c.fit||{}));c.fit={};dressPet(pt);
  pc.rv=pc.rivals.map((o,i)=>{const R=ckRng(pc.seed+'|'+PC_RIVALS[i].n),q=.25+R()*.4;return {q,fit:pcRivalFit(th,q,R),speed:.85+R()*.3,stage:0};});
  $('#petct').classList.remove('show');pcOpenParlor();
  pc.rivals.forEach((o,i)=>{o.a.play('wave');setTimeout(()=>npcSay(o,rnd(['Let’s go! 🐾','Fashion time! 💅','Good luck! 🍀'])),400+i*500);});
  banner(`${th.e} ${th.n}!`);}
// the parlor's Done button lands here (see closeParlor in 20-pet-parlor.js)
function pcParlorDone(){if(pc.end-Date.now()>15000){pc.phase='confirm';pcParlorAway();pcHud();pcRender();$('#petct').classList.add('show');return;}pcTimeUp();}
// close the parlor panel but keep the pet up on the grooming table
function pcParlorAway(){if(parlorOpen){pc.force=true;closeParlor();pc.force=false;}$('#pdone').textContent='Done';
  closetOpen=true;document.body.classList.add('dressing');pcStage();pcHoldPet(true);Z.parlor.padLbl.visible=false;pc.cam.init=false;}
function pcTimeUp(){if(pc.phase!=='dress'&&pc.phase!=='confirm')return;pcParlorAway();$('#petct').classList.remove('show');pcJudgeAll();}
function pcRivalStep(){if(!pc.rv)return;const done=pc.phase!=='dress'&&pc.phase!=='confirm',f=done?1:1-(pc.end-Date.now())/(pc.secs*1000);
  pc.rv.forEach((r,i)=>{const s=done?r.fit.length:Math.min(r.fit.length,Math.floor(f*r.speed*(r.fit.length+.6)));if(s===r.stage)return;r.stage=s;
    const o=pc.rivals[i],pt=o.pet;pt.fitOver={};r.fit.slice(0,s).forEach(([slot,v])=>{pt.fitOver[slot]=v;});dressPet(pt);
    if(!done){pt.happy=1.5;pt.vy=2;burst(petTop(pt),'#ffd6f0',12,1,.06);if(Math.random()<.4)o.a.play(rnd(['clap','magic','twirl']));if(Math.random()<.3)npcSay(o,rnd(['So cute! 💖','Almost done! ✨','Perfect! 🎀','Ooh, this one! 👀']));}});}
function pcHud(){const H=$('#pcHud'),on=pc.on&&(pc.phase==='dress'||pc.phase==='judge');H.style.display=on?'block':'none';$('#pcWant').style.display='none';$('#pcSkip').style.display=pc.phase==='judge'?'block':'none';
  if(pc.phase!=='judge')$('#pcCards').innerHTML='';if(on)pc.hudSec=-1;}
function pcWantList(){const want=pc.th.want(pcInfo(petCare(pc.pet).fit||{},pc.th));$('#pcWant').innerHTML=`<b>${pc.th.e} ${pc.th.n}</b><span>${pc.th.tip}</span>${want.map(([v,e,t])=>`<div>${v?'✅':'⬜'} ${e} ${t}</div>`).join('')}`;}
$('#pcTop').addEventListener('click',e=>{if(!e.target.closest('#pcThemeBtn'))return;const w=$('#pcWant');const on=w.style.display!=='block';w.style.display=on?'block':'none';if(on)pcWantList();sfx('pop');});
$('#pcWant').addEventListener('click',()=>{$('#pcWant').style.display='none';});
anims.push((t,dt)=>{if(!pc.on)return;
  if(pc.phase==='dress'||pc.phase==='confirm'){const left=Math.max(0,Math.ceil((pc.end-Date.now())/1000));
    if(left!==pc.hudSec){pc.hudSec=left;pcRivalStep();
      if(pc.phase==='dress'){const want=pc.th.want(pcInfo(petCare(pc.pet).fit||{},pc.th)),got=want.filter(w=>w[0]).length;
        $('#pcTop').innerHTML=`<span class="${left<=10?'hot':''}">⏱️ ${ckTime(left)}</span><button id="pcThemeBtn">${pc.th.e} ${pc.th.n} · ${got}/5 ✅</button>`;
        if($('#pcWant').style.display==='block')pcWantList();}
      // only the clock changes, so a tap on a button never lands while the panel is being redrawn
      if(pc.phase==='confirm'){const el=$('#pcLeft');if(el)el.textContent=`${ckTime(left)} left`;}
      if(left===30&&!pc.warned[30]){pc.warned[30]=1;banner('⏱️ 30 seconds!');sfx('pop');}
      if(left<=10&&left>0&&pc.phase==='dress')tone(880,.08,'square',.08);
      if(left===0){banner('⏰ Time’s up! Show time!');sfx('tada');pcTimeUp();}}}
  {const now=performance.now(),rdt=Math.min(.5,(now-(pc.lastNow||now))/1000);pc.lastNow=now;if(pc.phase==='judge')pcJudgeStep(rdt);}
  if(curZone&&curZone!==Z.parlor)pcEnd();});

/* ---------- judging ---------- */
function pcRows(){return pc.entries.slice().sort((a,b)=>b.res.sum-a.res.sum||(a.you?-1:b.you?1:0));}
function pcJudgeAll(){pc.phase='judge';const th=pc.th;pcRivalStep();
  const me={name:SAVE.name||'You',pet:pc.pet.name,you:true,fit:JSON.parse(JSON.stringify(petCare(pc.pet).fit||{})),at:'table'};
  const rivals=pc.rivals.map((o,i)=>({name:PC_RIVALS[i].n,pet:o.pet.name,rival:i,fit:o.pet.fitOver,at:i}));
  pc.rivals.forEach(o=>{o.a.play('wave');});
  pc.entries=[...rivals,me];pc.entries.forEach(e=>{e.res=pcJudge(e.fit,th,ckRng(pc.seed+'#'+e.name));});
  pc.jq=pc.entries.slice();pc.jT=.6;pc.cur=null;pcHud();pc.cam.init=false;sfx('tada');banner('📸 Fashion show!');
  $('#pcTop').innerHTML=`<span>${th.e} ${th.n}: the judges are looking…</span>`;}
function pcFocusPet(){const at=pc.focus;if(at==='table')return pc.pet;if(at==null)return null;return pc.rivals[at].pet;}
function pcFocusPos(){const pt=pcFocusPet();if(!pt)return pcW(0,.9,-1.2);return pt.g.position.clone().add(new THREE.Vector3(0,pt.tagH*.45,0));}
function pcJudgeStep(dt){pc.jT-=dt;if(pc.jT>0)return;
  if(pc.cur&&!pc.cur.shown){pc.cur.shown=true;const e=pc.cur;
    $('#pcCards').innerHTML=PC_JUDGES.map((j,i)=>`<div style="animation-delay:${i*.35}s"><b class="${e.res.cards[i]>=8?'hi':''}">${e.res.cards[i]}</b><span>${j.e} ${j.n}</span></div>`).join('')+`<div class="tot" style="animation-delay:1.05s"><b>${e.res.sum}</b><span>Total</span></div>`;
    PC_JUDGES.forEach((j,i)=>setTimeout(()=>{if(!pc.on)return;const n=e.res.cards[i];tone(500+n*60,.18,'triangle',.12);if(n>=8)pc.judges[i].a.play('clap');},i*350));
    const pt=pcFocusPet();if(pt){pt.happy=2;pt.vy=2.5;}
    if(e.you)setTimeout(()=>av.play(e.res.sum>=22?'cheer':'bow'),1200);
    pc.jT=2.6;return;}
  const e=pc.cur=pc.jq.shift();if(!e){pcFinish();return;}
  pc.focus=e.at;$('#pcCards').innerHTML='';
  $('#pcTop').innerHTML=`<span>📸 The judges look at ${e.you?'your':ckEsc(e.name)+'’s'} pet, ${ckEsc(e.pet)}…</span>`;
  const P=pcFocusPos();
  pc.judges.forEach((o,i)=>{o.face=Math.atan2(P.x-o.pos.x,P.z-o.pos.z);if(Math.random()<.6)setTimeout(()=>npcSay(o,rnd(['Adorable! 😍','So stylish! 💖','Cute!','Ooh la la!','Fabulous! ✨'])),300+i*250);});
  const pt=pcFocusPet();if(pt){pt.happy=2;pt.vy=3;pt.speak(rnd(['Ta-da! ✨','Look at me! 💖','Do I look cute?','Strike a pose! 📸']));}
  burst(P.clone().add(new THREE.Vector3(0,.3,0)),'#ffd6ea',24,1.2,.1);pc.jT=1.1;}
$('#pcSkip').onclick=()=>{sfx('pop');pc.jq=[];pc.cur=null;pcFinish();};
function pcFinish(){if(pc.phase!=='judge')return;pc.phase='final';pc.focus=null;pcHud();
  const rows=pcRows(),place=rows.findIndex(r=>r.you),me=rows[place];
  const S=SAVE.petContest=Object.assign({played:0,wins:0},SAVE.petContest);S.played++;if(place===0)S.wins++;S.best=Math.max(S.best||0,me.res.sum);S.last=pc.th.id;persist();
  did('petct',place);
  if(PC_STARS[place])dispatchEvent(new CustomEvent('brynny:prize',{detail:{n:PC_STARS[place],e:PC_MEDAL[place],t:`Pet contest: ${pcPlace(place)} place!`,b:place===0?'👑 Best Dressed Pet!':`${PC_MEDAL[place]} Pet contest prize!`}}));
  setTimeout(()=>earn(PC_COINS[place],'Pet contest'),600);
  const pt=pc.pet,P=petTop(pt);
  if(place===0){banner('👑 Best Dressed Pet! 👑');sfx('tada');try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}av.play('cheer');pt.happy=3;pt.vy=3.5;pt.speak('We won! 🏆');
    for(let k=0;k<5;k++)setTimeout(()=>burst(new THREE.Vector3(P.x+(Math.random()-.5)*2,P.y+1.2,P.z+(Math.random()-.5)*2),rnd(['#ffd23f','#ff8fc8','#8fd8ff']),50,3.5),k*220);}
  else{banner(PC_MEDAL[place]+' So stylish!');av.play('clap');}
  pc.judges.forEach(o=>{o.face=pcFace(0,-1);o.a.play('clap');});
  const win=rows[0];pc.rivals.forEach((o,i)=>{if(win.rival===i){o.a.play('cheer');o.pet.happy=3;o.pet.vy=3;}else o.a.play('clap');});
  pcRender();$('#petct').classList.add('show');$('#pccontent').scrollTop=0;}

/* ---------- ending ---------- */
function pcRestore(){const pt=pc.pet;if(pt&&pc.backup&&!pc.keep){petCare(pt).fit=pc.backup;dressPet(pt);persist();}pc.backup=null;}
function pcEnd(again){if(!pc.on)return;pcRestore();
  if(parlorOpen){pc.force=true;closeParlor();pc.force=false;}
  pc.on=false;pc.phase='';pc.focus=null;pc.rv=null;$('#pdone').textContent='Done';
  pc.rivals.forEach(o=>{o.pet.fitOver={};dressPet(o.pet);});
  pcShowPeople(false);pcHud();$('#pcHud').style.display='none';$('#petct').classList.remove('show');
  Z.parlor.pcLbl.visible=true;Z.parlor.padLbl.visible=true;
  if(!again){pcHoldPet(false);closetOpen=false;document.body.classList.remove('dressing');player.pos.copy(pcW(-1.4,0,.9));player.vy=0;player.face=Z.parlor.rot;cam.yaw=cam.cy=Z.parlor.rot;pc.pet=null;}}

/* ---------- camera while the contest panel or the fashion show is showing ---------- */
function petContestCam(dt){if(!pc.on||parlorOpen)return;const c=pc.cam;
  // a three-quarter view from the middle of the room, a little from above, so wings, spikes and backpacks show too
  if(pc.focus!=null){const P=pcFocusPos(),[lx,lz]=Z.parlor.toLocal(P.x,P.z),s=lx>.1?-1:1;c.wt.copy(P);c.wp.copy(pcW(lx+s*1.0,P.y+.6,lz+1.15));}
  else{c.wt.copy(pcW(0,.5,-1.3));c.wp.copy(pcW(0,2.5,1.4));}
  if(!c.init){c.p.copy(camera.position);c.t.copy(c.wt);c.init=true;}
  const a=Math.min(1,dt*3);c.p.lerp(c.wp,a);c.t.lerp(c.wt,a);camera.position.copy(c.p);camera.lookAt(c.t);}

/* ---------- the golden pad ---------- */
let onPcPad=false;
anims.push(()=>{if(!started)return;const z=Z.parlor,[lx,lz]=z.toLocal(player.pos.x,player.pos.z),d=Math.hypot(lx-PC_PAD.lx,lz-PC_PAD.lz);
  if(d<PC_PAD.r&&player.onGround&&!closetOpen){if(!onPcPad){onPcPad=true;pcOpen();}}else if(d>1.3)onPcPad=false;});
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{petContest:pc,openPetContest:pcOpen,petTimeUp:pcTimeUp,endPetContest:pcEnd,dressPet,PSLOTS});});
