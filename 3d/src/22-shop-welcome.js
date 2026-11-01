/* ================= COINS & SHOP ================= */
if(SAVE.coins==null)SAVE.coins=30;// a little welcome gift to start shopping
if(!SAVE.owned)SAVE.owned={};
const coinEl=$('#coins');
function showCoins(bump){$('#coinN').textContent=SAVE.coins;$('#shopCoins').textContent=`🪙 ${SAVE.coins}`;if(bump){coinEl.classList.remove('bump');void coinEl.offsetWidth;coinEl.classList.add('bump');}}
showCoins();
function coinSfx(){tone(1319,.08,'square',.06);tone(1976,.18,'square',.06,.07);}
function earn(n,why){n=Math.round(n);if(!(n>0))return;SAVE.coins=(SAVE.coins||0)+n;persist();showCoins(true);coinSfx();
  const r=coinEl.getBoundingClientRect(),el=document.createElement('div');el.className='coinpop';el.textContent=`+${n} 🪙 ${why||''}`;
  el.style.left=Math.min(innerWidth-90,r.left+r.width/2)+'px';el.style.top=(r.bottom+4)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),1500);
  if(shopOpen)renderShop();}
// other parts of the game (or future ones) can hand out coins with: dispatchEvent(new CustomEvent('brynny:earn',{detail:{n:5,why:'Baked a cake'}}))
addEventListener('brynny:earn',e=>{const d=e.detail||{};earn(+d.n||0,d.why);});
function lockBtn(k,ico,name){if(!locked(k))return '';const s=shopItem(k);return `<button class="item lock" data-lock="${k}"><b>${ico}</b><span>${name}</span><em>🔒 ${s.p} 🪙</em></button>`;}

// stars and quests pay out when they happen
let starSeen=STARS.filter(s=>s.got).length;
setInterval(()=>{const n=STARS.filter(s=>s.got).length;if(n>starSeen){earn((n-starSeen)*5,'Star!');if(n===STARS.length)setTimeout(()=>earn(50,'Every star!'),1400);}starSeen=n;
  const q=SAVE.townDone||0;if(SAVE.questPaid==null||q<SAVE.questPaid){SAVE.questPaid=q;persist();}else if(q>SAVE.questPaid){earn((q-SAVE.questPaid)*20,'Quest done!');SAVE.questPaid=q;persist();}},250);
let poseT=0;$('#poseBtn').addEventListener('click',()=>{did('pose');if(Date.now()-poseT>6e4){poseT=Date.now();setTimeout(()=>earn(3,'Runway star'),900);}});
const dayKey=()=>new Date().toDateString();
const giftReady=()=>SAVE.giftDay!==dayKey();
function openGift(){if(!giftReady())return;did('gift');SAVE.giftDay=dayKey();persist();earn(20,'Daily gift');banner('🎁 Daily gift!');sfx('tada');
  burst(new THREE.Vector3(player.pos.x,player.pos.y+1.4,player.pos.z),'#ffd23f',40,2.5,.16);if(shopOpen)renderShop();}
$('#play').addEventListener('click',()=>setTimeout(()=>{if(giftReady())toast('🎁 You have a daily gift! Tap 🪙 at the top to open it.');},4500));

// buying
function askBuy(k){const s=shopItem(k);if(!s)return;sfx('pop');const have=SAVE.coins||0,need=s.p-have,mine=owns(k),wear=/^(look|pet):/.test(k);
  // clothing-store things are bought at the store
  if(s.tab==='store'&&!mine&&!storeOpen){$('#buyCard').innerHTML=`<div class="bigE">${s.e}</div><h2>${s.n}</h2><p>Get it at the 👔 Clothing Store for ${s.p} 🪙! It's past the 💃 Runway.</p><button class="btn" data-b="go">🗺️ Show me the way</button><button class="btn ghost" data-b="close">OK</button>`;$('#buy').dataset.k=k;$('#buy').classList.add('show');return;}
  $('#buyCard').innerHTML=`<div class="bigE">${s.e}</div><h2>${s.n}</h2><p>${s.d}</p>`+
    (mine?(wear?`<button class="btn" data-b="wear">✨ Wear it</button>`:'')+`<button class="btn ghost" data-b="close">OK</button>`
    :need<=0?`<button class="btn" data-b="buy">Buy for ${s.p} 🪙</button><button class="btn ghost" data-b="close">Not now</button><p>You have ${have} 🪙</p>`
    :`<p class="bneed">You need <b>${need}</b> more 🪙</p><p>Find ⭐ stars, take care of your pet, and help the townspeople to earn more!</p><button class="btn ghost" data-b="close">OK</button>`);
  $('#buy').dataset.k=k;$('#buy').classList.add('show');}
$('#buy').onclick=e=>{const b=e.target.closest('[data-b]'),k=$('#buy').dataset.k;if(e.target.id==='buy'||b&&b.dataset.b==='close'){$('#buy').classList.remove('show');return;}
  if(!b)return;$('#buy').classList.remove('show');if(b.dataset.b==='buy')buy(k);if(b.dataset.b==='wear')wearIt(k);if(b.dataset.b==='go'){if(closetOpen)closeCloset();setDest(Z.store);}};
function buy(k){const s=shopItem(k);if(!s||owns(k)||(SAVE.coins||0)<s.p)return;SAVE.coins-=s.p;SAVE.owned[k]=true;did('buy',k);persist();showCoins(true);sfx('tada');
  banner(`${s.e} It's yours!`);burst(new THREE.Vector3(player.pos.x,player.pos.y+1.3,player.pos.z),rnd(['#ff8fc8','#ffd23f','#8fd8ff']),50,3,.18);
  const [kind,id]=k.split(':');
  if(kind==='look'||kind==='pet')wearIt(k);
  if(kind==='move'){const A=allActs();actPage=Math.floor(A.findIndex(a=>a[0]===id)/PER);renderActions();toast(`New move! Look for ${s.e} ${s.lab} with your moves.`);}
  if(kind==='colors')toast('New colors! Look for them when you pick a color 🎨');
  if(kind==='treat')toast(`Feed the ${s.n.toLowerCase()} to your pet at the 🐾 Pet Parlor!`);
  refreshOpen();}
function wearIt(k){const [kind,id]=k.split(':');
  if(kind==='look'){const L=SAVE.look;if(applyItem(L,id)==='extras'&&(!closetOpen||ctab==='extras'))lastExtra=id;
    av.dress(L);persist();av.play('twirl');}
  if(kind==='pet'){const pt=pPet||myPet();if(!pt){toast('Adopt a pet first, then they can wear it! 🐾');return;}const c=petCare(pt),it=PHATS.find(x=>x[0]===id);c.fit.hat={id,c:it[3]};dressPet(pt);persist();pt.happy=2;pt.speak('So fancy! 💖');}
  refreshOpen();}
function refreshOpen(){if(shopOpen)renderShop();else if(parlorOpen)renderParlor();else if(closetOpen)renderCloset();}

// the shop
const STABS=[['outfits','👗','Outfits'],['pets','🐾','Pets'],['colors','🎨','Colors'],['moves','💃','Moves'],['earn','🪙','Earn']];
const SHINT={outfits:'New outfits show up in your 👗 closet once they are yours.',pets:'Pet things show up in the 🐾 Pet Parlor.',colors:'New colors show up everywhere you pick a color.',moves:'New moves show up with your other moves.'};
let stab=null;
// during a holiday the shop gets a tab of its own (window.__season comes from seasons.js)
const seasonTab=()=>{const H=window.__season&&window.__season.now();return H&&SHOP.some(s=>s.hol===H.id)?['season',H.e,H.n]:null;};
function renderShop(){showCoins();const ST=seasonTab();if(ST)SHINT.season=`${ST[1]} ${ST[2]} things! They only come in the shop during ${ST[2]}. Once you buy one, it's yours forever.`;if(stab==='season'&&!ST)stab='outfits';
  $('#stabs').innerHTML=(ST?[ST]:[]).concat(STABS).map(([id,ico,n])=>`<button class="tab${id===stab?' on':''}" data-stab="${id}"><b>${ico}</b>${n}</button>`).join('');
  let h='';
  if(stab==='earn'){const quests=!!(window.__game&&window.__game.townSave);
    h=`<button class="gift" data-gift="1"${giftReady()?'':' disabled'}>${giftReady()?'🎁 Open your daily gift! +20 🪙':'🎁 Come back tomorrow for another gift!'}</button><h3>Ways to earn coins</h3><div class="earn">`+
      [['🏆','Finish a star challenge','+5 per ⭐'],['⭐','Find a star','+5'],['🌟','Find every star','+50'],['🍖','Feed your pet','+2'],['🛁','Give your pet a bath','+10'],['💅','Paint all 4 paws','+5'],['📸','Pose on the runway','+3'],['🐾','Adopt your first pet','+10'],['🎂','Design a cake at the bakery','+8'],['🕯️','Blow out cake candles','+5']]
      .concat(quests?[['🎉',"Help a townsperson",'+20']]:[]).map(([e,t,n])=>`<div><b>${e}</b><span>${t}</span><em>${n} 🪙</em></div>`).join('')+`</div>`;}
  else h=`<div class="grid">${SHOP.filter(s=>stab==='season'?s.hol===window.__season.now().id:s.tab===stab&&!s.hol).map(s=>{const m=owns(s.k);return `<button class="item${m?' on':''}" data-buy="${s.k}"><b>${s.e}</b><span>${s.n}</span>${s.c?`<i class="dots">${s.c.slice(0,6).map(c=>`<u style="background:${c}"></u>`).join('')}</i>`:''}<em class="${m?'got':''}">${m?'✅ Yours':`🪙 ${s.p}`}</em></button>`;}).join('')}</div><p class="drawhint" style="margin-top:10px">${SHINT[stab]}</p>`;
  $('#scontent').innerHTML=h;}
$('#stabs').onclick=e=>{const b=e.target.closest('[data-stab]');if(!b)return;stab=b.dataset.stab;sfx('pop');renderShop();$('#scontent').scrollTop=0;};
$('#scontent').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.gift)return openGift();if(b.dataset.buy)askBuy(b.dataset.buy);};
function openShop(tab){if(closetOpen||!started)return;const g=window.__game;if(g&&g.closeTalk)g.closeTalk();
  shopOpen=closetOpen=true;if(tab)stab=tab;else if(giftReady())stab='earn';else if(!stab)stab=seasonTab()?'season':'outfits';document.body.classList.add('dressing','shopping');
  player.face=cam.yaw;cam.closetYaw=cam.yaw;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';renderShop();$('#shop').classList.add('show');$('#scontent').scrollTop=0;sfx('pop');}
function closeShop(){if(!shopOpen)return;shopOpen=closetOpen=false;document.body.classList.remove('dressing','shopping');$('#shop').classList.remove('show');cam.yaw=cam.closetYaw;player.face=cam.closetYaw+Math.PI;}
coinEl.onclick=()=>{if(shopOpen)closeShop();else openShop();};$('#sdone').onclick=closeShop;

// moves you can buy
function doMove(id){if(closetOpen||!started)return;const P=player.pos,at=y=>new THREE.Vector3(P.x,P.y+y,P.z);
  if(id==='fireworks'){av.play('cheer');for(let k=0;k<6;k++)setTimeout(()=>{burst(at(3+Math.random()*1.5).add(new THREE.Vector3((Math.random()-.5)*4,0,(Math.random()-.5)*4)),rnd(['#ff8fc8','#ffd23f','#8fd8ff','#c6a6ff','#7ee081']),70,4.5,.22);tone(300+Math.random()*200,.25,'triangle',.08,0,90);},k*320);}
  if(id==='hearts'){av.play('kiss');for(let k=0;k<5;k++)setTimeout(()=>floaties(at(.8+Math.random()*.8),rnd(['💕','💖','💗']),5),k*260);}
  if(id==='rainbow'){av.play('twirl');['#ff3b6b','#ff8a1f','#ffd23f','#7ee081','#4fb6ff','#3a5bd9','#8e6cff'].forEach((c,i)=>setTimeout(()=>burst(at(.3+i*.22),c,26,2.2,.15),i*110));}
  if(id==='bubbles'){av.play('dance');for(let k=0;k<6;k++)setTimeout(()=>floaties(at(.6+Math.random()*.8),'🫧',4),k*300);}
  const pt=myPet();if(pt&&pt.pos.distanceTo(P)<5)pt.happy=1.5;}
window.__shop={earn,openShop,closeShop,buy,askBuy,SHOP};

/* welcome */
$('#wname').value=SAVE.name||'';
// girl or guy, and the look style (the glam button says Glam girl or Real guy)
const wsRender=()=>{const G=isGuy(SAVE.look);document.querySelectorAll('[data-ws]').forEach(b=>b.classList.toggle('on',b.dataset.ws===(SAVE.look.style||'glam')));
  document.querySelectorAll('[data-wb]').forEach(b=>b.classList.toggle('on',b.dataset.wb===(G?'guy':'girl')));
  const gb=document.querySelector('[data-ws="glam"]');if(gb)gb.innerHTML=G?'😎<span>Real guy</span>':'💃<span>Glam girl</span>';};wsRender();
document.querySelector('.wbody').onclick=e=>{const b=e.target.closest('[data-wb]');if(!b)return;if(switchBody(b.dataset.wb)){rebuildPlayer();sfx('pop');}wsRender();};
document.querySelector('.wstyle:not(.wbody)').onclick=e=>{const b=e.target.closest('[data-ws]');if(!b)return;SAVE.look.style=b.dataset.ws;persist();wsRender();rebuildPlayer();};
$('#play').onclick=()=>{const n=$('#wname').value.trim().slice(0,16)||SAVE.name||'Brynny';if(n!==SAVE.name)setMyName(n);renderMe();
  scene.remove(av.g);av=new Avatar(SAVE.look,n,tagColor(SAVE.look),true);scene.add(av.g);loadPaint(av);
  $('#welcome').classList.remove('show');started=true;ac();if(AC&&AC.state==='suspended')AC.resume();
  curTrack='sparkle-room';startMusic();
  banner('✨ Sparkle Studio');setTimeout(()=>toast('Find all 24 stars! ⭐'),2000);};
$('#wname').addEventListener('keydown',e=>{if(e.key==='Enter')$('#play').click();});
let started=false;

