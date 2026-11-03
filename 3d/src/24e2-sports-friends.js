/* ================= 👭 SPORTS WITH FRIENDS: basketball and baseball matches online =================
   When friends are in your online room (online.js), the 🏀 court and ⚾ batting cage menus get a "Play against your friends"
   choice. Everyone who says yes plays the same game at the same time on their own phone (🎯 free throws, 🔥 shootout or
   ⚾ batting), and every phone shows everyone's score live. When the last player finishes, the standings come up:
   🥇 1st +2 ⭐ +25 🪙, 🥈 2nd +1 ⭐ +15 🪙, everyone else who finished +10 🪙, and the 🆚 star challenges (challenges.js) count it.
   Messages go through the room as {t:'sport', a, k}:
     ask {m}        "want to play?" from the one who starts the match (the leader)
     ans {y}        yes (1) or no (0), back to the leader
     go {m,list}    the leader starts it: list is [[id,name,spot]] (spot = your place on the free throw line)
     sc {s,n,x,d,q} your score: s points, n shots or pitches so far, x batting details, d finished, q left early
     cancel         the leader called it off
   The games themselves live in 24e-sports.js: it calls SP.onMenu (to add our buttons), SP.onEnd (when a game ends)
   and puts you at SP.lx on the line, so friends side by side don't stand inside each other. */
const VS={on:false,k:'',m:null,lead:'',phase:null,players:new Map(),ans:new Map(),invite:null,t:0,sendT:0,last:'',endT:0,cardSig:''};
const VS_NAME={ft:'🎯 Free throws',shoot:'🔥 Shootout',bat:'⚾ Batting'};
const VS_LANE=[0,-1.3,1.3,-2.5,2.5,-3.4];
const VS_STARS=[2,1],VS_COINS=[25,15,10],VS_MEDAL=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'];
const VS_WAIT=30,VS_FINISH=75;// seconds to answer, and the longest we wait for a slow friend to finish
const vsNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
const vsMe=()=>{const n=window.__net;return n&&n.id()||'me';};
const vsEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const vsNum=(v,a,b)=>{v=+v;return Number.isFinite(v)?Math.max(a,Math.min(b,Math.round(v))):a;};
function vsSend(d){const n=vsNet();if(n)try{n.send(Object.assign({t:'sport',k:VS.k},d));}catch(e){}}
const vsP=(id,name,lane=0)=>({id,name:String(name||'Friend').slice(0,16),lane,s:0,n:0,x:{},d:false,q:false});
function vsReset(){Object.assign(VS,{on:false,k:'',m:null,lead:'',phase:null,t:0,sendT:0,last:'',endT:0,cardSig:''});VS.players.clear();VS.ans.clear();SP.lx=0;$('#vsBoard').classList.remove('show');}

/* ---------- looks ---------- */
{const st=document.createElement('style');st.textContent=`
#vsBoard{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 156px);z-index:9;display:none;flex-wrap:wrap;justify-content:center;gap:5px;max-width:calc(100vw - 32px);pointer-events:none}
#vsBoard.show{display:flex}
#vsBoard span{background:rgba(255,255,255,.92);color:#3b2357;border-radius:999px;padding:4px 10px;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.18);white-space:nowrap}
#vsBoard span.me{background:#ffd23f}#vsBoard span.out{opacity:.55}
#vsBoard small{font-weight:600;color:#7a5a8c;margin-left:3px}
.vsBox{background:#eef6ff;border-radius:18px;padding:10px 12px;margin:10px 0 4px;text-align:center}
.vsBox>b{display:block;font-size:16px;margin-bottom:6px}.vsBox .btn{font-size:16px;padding:10px 16px;background:#3a8fe8;box-shadow:0 4px 0 #2a6cb8}
.vsList{display:flex;flex-direction:column;gap:6px;margin:10px 0;text-align:left}
.vsList div{display:flex;align-items:center;gap:10px;background:#fff7ef;border-radius:14px;padding:8px 12px;font-weight:600}
.vsList div.me{background:#fff3c4}.vsList b{font-size:22px;font-weight:400;width:30px;text-align:center}.vsList span{flex:1}.vsList em{font-style:normal;font-weight:700}
.vsList small{display:block;font-weight:500;font-size:12px;color:var(--muted)}
#vsAsk{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9998;width:min(340px,calc(100vw - 32px));background:#fff;border-radius:18px;padding:12px 14px;
  box-shadow:0 6px 24px rgba(0,0,0,.25);text-align:center;font-weight:600;color:#4a2b45;display:none}
#vsAsk.show{display:block}#vsAsk div{font-size:17px;margin-bottom:8px}
@media (max-height:520px){#vsBoard{top:calc(env(safe-area-inset-top) + 52px)}}`;document.head.appendChild(st);
 const d=document.createElement('div');d.innerHTML='<div id="vsBoard"></div><div id="vsAsk"></div>';document.body.append(...d.children);}

/* ---------- scores ---------- */
// your score right now (or at the end of the game) in the same shape friends send theirs
function vsMine(m){m=m||VS.m;if(m==='bat'){const B=SP.bat||{};const hits=B.hits|0,hr=B.hr|0;return {s:hits+hr*2,n:B.n|0,x:{hits,hr,far:B.far|0}};}
  if(m==='shoot')return {s:SP.score|0,n:Math.max(0,Math.ceil(SP.left||0)),x:{}};return {s:SP.score|0,n:SP.shots|0,x:{}};}
const vsScore=(p,m)=>m==='ft'?`${p.s} / 10`:`${p.s} pts`;
const vsDetail=(p,m)=>{if(p.q)return 'left the game';if(m==='bat')return `${p.x.hits|0} hits · ${p.x.hr|0} 🏠${p.d?'':` · pitch ${p.n} of 10`}`;
  if(p.d)return 'finished';return m==='ft'?`${p.n} of 10 shots`:`${p.n}s left`;};
// gone: they left the room (or we did)
const vsGone=p=>{if(p.id===vsMe())return false;const n=vsNet();return !n||!n.friends().has(p.id);};
// standings: finished players by score (ties share a place), then the ones who left
function vsRank(){const all=[...VS.players.values()],out=p=>p.q||vsGone(p);
  const fin=all.filter(p=>!out(p)).sort((a,b)=>b.s-a.s||((b.x.far|0)-(a.x.far|0))),rest=all.filter(out);
  return fin.map(p=>({p,place:fin.filter(o=>o.s>p.s).length})).concat(rest.map(p=>({p,place:-1})));}

/* ---------- the 👭 buttons in the court and batting cage menus ---------- */
SP.onMenu=(c,zid)=>{if(!vsNet()||VS.on)return;const w=(SAVE.sports.vs||{}).w;
  const box=document.createElement('div');box.className='vsBox';
  box.innerHTML=`<b>👭 Play against your friends${w?` · Wins: ${w}`:''}</b>`+(zid==='court'
    ?'<button class="btn" data-vs="ft">🎯 Free throws</button> <button class="btn" data-vs="shoot">🔥 Shootout</button>'
    :'<button class="btn" data-vs="bat">⚾ Batting match</button>');
  const no=c.querySelector('#spNo');if(no)no.before(box);else c.appendChild(box);};
$('#spCard').addEventListener('click',e=>{const b=e.target.closest('[data-vs],[data-vsb]');if(!b)return;sfx('pop');
  if(b.dataset.vs){vsChallenge(b.dataset.vs);return;}
  const k=b.dataset.vsb;
  if(k==='go')vsGo();
  else if(k==='cancel'){vsSend({a:'cancel'});vsReset();spCloseMenu();}
  else if(k==='leave'){vsSend({a:'ans',y:0});vsReset();spCloseMenu();}
  else if(k==='again'){const m=VS.m;vsReset();vsChallenge(m);}
  else if(k==='done'){vsReset();spCloseMenu();}});

/* ---------- starting a match ---------- */
function vsChallenge(m){const n=vsNet();if(!n||!n.friends().size){toast('Start or join a room with friends first 👭');return;}
  if(SP.mode)spEnd(false);vsReset();Object.assign(VS,{on:true,k:Math.random().toString(36).slice(2,10),m,lead:vsMe(),phase:'wait',t:0});
  VS.players.set(vsMe(),vsP(vsMe(),'You'));vsSend({a:'ask',m});SP.menu=true;$('#spMenu').classList.add('show');vsCard(true);sfx('star');}
// the leader: everyone answered (or time is up), so play
function vsGo(){if(VS.phase!=='wait'||VS.lead!==vsMe())return;const list=[...VS.players.values()].filter(p=>!vsGone(p)).map((p,i)=>[p.id,p.id===vsMe()?(SAVE.name||'Friend'):p.name,i]);
  if(list.length<2){vsSend({a:'cancel'});vsReset();spCloseMenu();toast('Nobody could play right now. Try again in a bit! 👭');return;}
  vsSend({a:'go',m:VS.m,list});vsBegin(list);}
function vsBegin(list){const me=vsMe();VS.players.clear();
  for(const [id,name,lane] of list){const n=vsNet(),f=n&&n.friends().get(id);VS.players.set(id,vsP(id,id===me?'You':(f&&f.name)||name,vsNum(lane,0,5)));}
  const p=VS.players.get(me);SP.lx=VS_LANE[p?p.lane:0]||0;VS.phase='play';VS.t=0;VS.last='';
  spCloseMenu();spStart(VS.m);banner(`👭 ${VS_NAME[VS.m]} vs friends!`);sfx('tada');}
// a friend asked us to play: walk over to the court (or cage) and wait for them to start
function vsAccept(){const iv=VS.invite;VS.invite=null;$('#vsAsk').classList.remove('show');if(!iv)return;
  if(Date.now()>iv.until){toast('That game already started 😢');return;}
  if(SP.mode)spEnd(false);vsReset();Object.assign(VS,{on:true,k:iv.k,m:iv.m,lead:iv.id,phase:'wait',t:0});
  VS.players.set(vsMe(),vsP(vsMe(),'You'));VS.players.set(iv.id,vsP(iv.id,iv.name));vsSend({a:'ans',y:1});
  vsGoTo(iv.m==='bat'?'batting':'court');SP.menu=true;$('#spMenu').classList.add('show');vsCard(true);}
function vsDecline(){const iv=VS.invite;VS.invite=null;$('#vsAsk').classList.remove('show');if(!iv)return;const k=VS.k;VS.k=iv.k;vsSend({a:'ans',y:0});VS.k=k;}
function vsGoTo(zid){const z=Z[zid],[lx,lz]=zid==='court'?[-1.4,3.9]:[-1.7,5.6];const [x,w]=z.toWorld(lx,lz);
  player.pos.set(x,groundAt(x,w)+.1,w);player.vy=0;player.speed=0;player.face=spFace(z,lx,lz,0,zid==='court'?SPC.HZ:SPB.PLATE);cam.yaw=cam.cy=player.face+Math.PI;
  SP.onPad[zid]=true;closeMap&&closeMap();}
$('#vsAsk').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;sfx('pop');if(b.dataset.a==='yes')vsAccept();else vsDecline();});

/* ---------- a game just ended (24e-sports.js calls this) ---------- */
SP.onEnd=(m,quit,show)=>{if(!VS.on||VS.phase!=='play'||m!==VS.m)return;const me=VS.players.get(vsMe());SP.lx=0;
  if(me)Object.assign(me,vsMine(m),{d:true,q:!!quit});vsSendScore(true);VS.phase='done';VS.endT=0;
  if(!show){vsReset();return;}// opened the closet in the middle: that counts as leaving
  SP.menu=true;$('#spMenu').classList.add('show');vsCard(true);vsCheckDone();};
function vsSendScore(force){const me=VS.players.get(vsMe());if(!me)return;if(VS.phase==='play')Object.assign(me,vsMine());
  const d={a:'sc',s:me.s,n:me.n,x:me.x,d:me.d?1:0,q:me.q?1:0},j=JSON.stringify(d);if(!force&&j===VS.last)return;VS.last=j;vsSend(d);}
function vsCheckDone(){if(VS.phase!=='done')return;const all=[...VS.players.values()];
  if(all.every(p=>p.d||p.q||vsGone(p))||VS.endT>VS_FINISH)vsFinal();}
function vsFinal(){VS.phase='final';const me=VS.players.get(vsMe()),R=vsRank(),mine=R.find(r=>r.p===me);const place=mine?mine.place:-1;VS.place=place;VS.prize='';
  if(me&&!me.q&&place>=0&&VS.players.size>1){const st=VS_STARS[place]||0,co=VS_COINS[Math.min(2,place)];
    if(st)dispatchEvent(new CustomEvent('brynny:prize',{detail:{n:st,e:VS_MEDAL[place],t:`${VS_NAME[VS.m]} vs friends: ${['1st','2nd'][place]} place!`,b:place===0?'🏆 You beat your friends!':'🥈 Friends match prize!'}}));
    setTimeout(()=>earn(co,'Friends match'),600);VS.prize=`${st?`+${st} ⭐ `:''}+${co} 🪙`;
    const S=SAVE.sports.vs||(SAVE.sports.vs={w:0,p:0});S.p++;if(place===0)S.w++;persist();did('sportvs',place);if(place===0)sfx('tada');}
  if(SP.menu&&$('#spMenu').classList.contains('show'))vsCard(true);
  else{banner(place===0?'🏆 You won the match!':place>0?`${VS_MEDAL[place]} ${['','2nd','3rd','4th','5th','6th'][place]} place in the match`:'👭 Match over');vsReset();}}

/* ---------- the card in the sports menu ---------- */
function vsRows(){const m=VS.m,R=VS.phase==='wait'?[...VS.players.values()].map(p=>({p,place:-2})):vsRank();
  return `<div class="vsList">${R.map(({p,place})=>`<div class="${p.id===vsMe()?'me':''}"><b>${place>=0?VS_MEDAL[place]:place===-2?'✅':'👋'}</b><span>${vsEsc(p.name)}<small>${VS.phase==='wait'?'ready':vsDetail(p,m)}</small></span><em>${VS.phase==='wait'?'':vsScore(p,m)}</em></div>`).join('')}</div>`;}
function vsCard(force){if(!VS.on)return;const c=$('#spCard'),m=VS.m,lead=VS.lead===vsMe();let h='';
  if(VS.phase==='wait'&&lead){const n=vsNet(),fr=n?[...n.friends()]:[],yes=VS.players.size-1;
    h=`<h2>👭 ${VS_NAME[m]} vs friends</h2><p>Asking your friends to play… Everyone plays at the same time and sees each other's score!</p>
      <div class="vsList">${fr.map(([id,o])=>{const a=VS.ans.get(id);return `<div><b>${a===1?'✅':a===0?'❌':'⏳'}</b><span>${vsEsc(o.name)}<small>${a===1?'ready to play!':a===0?'can\'t play right now':'thinking…'}</small></span></div>`;}).join('')}</div>
      <button class="btn" data-vsb="go"${yes?'':' disabled style="opacity:.5"'}>▶ Start${yes?` with ${yes} friend${yes>1?'s':''}`:''}!</button> <button class="btn ghost" data-vsb="cancel">Cancel</button>`;}
  else if(VS.phase==='wait'){const L=VS.players.get(VS.lead);
    h=`<h2>👭 ${VS_NAME[m]} vs friends</h2><p>You're in! Waiting for <b>${vsEsc(L?L.name:'your friend')}</b> to start the game…</p><div class="spBig">${m==='bat'?'⚾🏏':'🏀'}</div>
      <button class="btn ghost" data-vsb="leave">Not now</button>`;}
  else if(VS.phase==='done'){h=`<h2>⏳ Waiting for your friends to finish…</h2><p>${VS_NAME[m]}</p>${vsRows()}<button class="btn ghost" data-vsb="done">Done</button>`;}
  else if(VS.phase==='final'){const me=VS.players.get(vsMe()),pl=VS.place;
    const t=me&&me.q?'👋 You left the match':pl===0?'🏆 You won the match!':pl>0?`${VS_MEDAL[pl]} You came in ${['','2nd','3rd','4th','5th','6th'][pl]} place!`:'👭 Match over';
    h=`<h2>${t}</h2><p>${VS_NAME[m]} vs friends</p>${vsRows()}${VS.prize?`<p>${VS.prize}</p>`:me&&me.q?'<p>Finish the whole game to win prizes!</p>':''}
      <button class="btn" data-vsb="again">🔁 Rematch</button> <button class="btn ghost" data-vsb="done">Done</button>`;}
  // only redraw when something changed, so a tap on a button isn't lost
  if(!force&&h===VS.cardSig)return;VS.cardSig=h;c.innerHTML=h;}
function vsBoard(){const B=$('#vsBoard');if(VS.phase!=='play'||!SP.mode){B.classList.remove('show');return;}
  const m=VS.m,me=VS.players.get(vsMe());if(me)Object.assign(me,vsMine());
  const h=vsRank().map(({p,place})=>`<span class="${p.id===vsMe()?'me':''}${place<0?' out':''}">${place>=0?VS_MEDAL[place]:'👋'} ${vsEsc(p.name)} ${vsScore(p,m)}<small>${p.d?'✓':m==='ft'?`${p.n}/10`:m==='bat'?`${p.n}/10`:''}</small></span>`).join('');
  if(B.innerHTML!==h)B.innerHTML=h;B.classList.add('show');}

/* ---------- messages from friends ---------- */
function vsFromNet(id,name,d){if(!d||typeof d.a!=='string'||typeof d.k!=='string')return;const k=d.k.slice(0,20);
  if(d.a==='ask'){if(!VS_NAME[d.m])return;
    if(VS.on||!started){const kk=VS.k;VS.k=k;vsSend({a:'ans',y:0});VS.k=kk;return;}
    VS.invite={k,m:d.m,id,name,until:Date.now()+VS_WAIT*1000};
    $('#vsAsk').innerHTML=`<div>👭 <b>${vsEsc(name)}</b> wants to play<br>${VS_NAME[d.m]}${d.m==='bat'?'':' 🏀'} with you!</div><button class="btn" data-a="yes" style="margin:2px">✅ Let's play!</button> <button class="btn ghost" data-a="no" style="margin:2px">No thanks</button>`;
    sfx('star');return;}
  if(!VS.on||k!==VS.k)return;
  if(d.a==='ans'&&VS.lead===vsMe()&&VS.phase==='wait'){const y=d.y?1:0;VS.ans.set(id,y);if(y)VS.players.set(id,vsP(id,name));else VS.players.delete(id);
    if(y)toast(`${name} is ready to play! 🙌`);vsCard();return;}
  if(d.a==='cancel'&&id===VS.lead&&VS.phase==='wait'){vsReset();spCloseMenu();toast(`${name} called off the game`);return;}
  if(d.a==='go'&&id===VS.lead&&VS.phase==='wait'&&Array.isArray(d.list)){const list=d.list.slice(0,6).filter(r=>Array.isArray(r)&&typeof r[0]==='string').map(r=>[r[0],String(r[1]||'Friend'),r[2]]);
    if(list.some(r=>r[0]===vsMe()))vsBegin(list);else{vsReset();spCloseMenu();}return;}
  if(d.a==='sc'){const p=VS.players.get(id);if(!p||id===vsMe())return;
    const x=d.x&&typeof d.x==='object'?d.x:{};Object.assign(p,{s:vsNum(d.s,0,999),n:vsNum(d.n,0,99),x:{hits:vsNum(x.hits,0,99),hr:vsNum(x.hr,0,99),far:vsNum(x.far,0,999)},d:!!d.d,q:!!d.q});
    if(p.d&&!p.q&&VS.phase==='play')toast(`${p.name} finished with ${vsScore(p,VS.m)}!`);vsCheckDone();}}
addEventListener('load',()=>{if(window.__net)window.__net.on(vsFromNet);
  // after online.js has placed your friends: a friend batting at the same plate stands on deck instead, so you don't overlap
  onTick.push(()=>{if(VS.phase!=='play'||SP.mode!=='bat')return;const n=vsNet();if(!n)return;const z=Z.batting;let i=0;
    for(const p of VS.players.values()){if(p.id===vsMe())continue;const f=n.friends().get(p.id);if(!f)continue;
      const [px,pz]=z.toWorld(-.62,SPB.PLATE);if(Math.hypot(f.pos.x-px,f.pos.z-pz)>2.5){i++;continue;}
      const lx=1.7+i*.8,lz=SPB.PLATE-1.3-i*.25,[x,w]=z.toWorld(lx,lz);f.a.g.position.set(x,groundAt(x,w),w);f.a.g.rotation.y=spFace(z,lx,lz,-.62,SPB.PLATE);i++;}});});

/* ---------- every frame ---------- */
anims.push((t,dt)=>{
  // the invite waits while you're busy (dressing, baking...) and pops up when you're free
  const iv=VS.invite,ask=$('#vsAsk');
  if(iv){if(Date.now()>iv.until||!vsNet()){vsDecline();}else ask.classList.toggle('show',started&&!closetOpen&&!mapOpen);}
  if(!VS.on)return;VS.t+=dt;
  if(!vsNet()&&VS.phase==='wait'){vsReset();spCloseMenu();return;}
  if(VS.phase==='wait'){// closed the card: the leader calls it off, a friend says no after all
    if(!$('#spMenu').classList.contains('show')){if(VS.lead===vsMe())vsSend({a:'cancel'});else vsSend({a:'ans',y:0});vsReset();SP.menu=false;return;}
    if(VS.lead===vsMe()){const n=vsNet(),fr=[...n.friends().keys()],yes=VS.players.size-1;
      if(fr.length&&fr.every(id=>VS.ans.has(id))&&VS.t>.8){if(yes)vsGo();else{vsSend({a:'cancel'});vsReset();spCloseMenu();toast('Nobody can play right now. Try again in a bit! 👭');}return;}
      if(VS.t>VS_WAIT){vsGo();return;}}
    else if(vsGone(VS.players.get(VS.lead)||{id:VS.lead})){vsReset();spCloseMenu();toast('Your friend left the room 👋');return;}
    vsCard();return;}
  VS.sendT-=dt;if(VS.phase==='play'&&VS.sendT<=0){VS.sendT=.3;vsSendScore();}
  if(VS.phase==='play'){vsBoard();if(!SP.mode&&!SP.menu)vsReset();}// the game ended some other way
  if(VS.phase==='done'){VS.endT+=dt;vsCheckDone();if(VS.phase==='done')vsCard();}
  if(VS.phase==='done'&&!$('#spMenu').classList.contains('show'))SP.menu=false;
  if(VS.phase==='final'&&!$('#spMenu').classList.contains('show')){SP.menu=false;vsReset();}});
window.__sports.vs=VS;window.__sports.challenge=vsChallenge;window.__sports.accept=vsAccept;
