/* ===== talking with townspeople ===== */
let talkF=null,talkNear=null,talkMode='main';
// extra talk buttons other parts of the game can add (like trick-or-treat): {id,btn:f=>[emoji,label]|null,act:f=>{}}
const TALK_EXTRA=[];
const hearts=f=>{const h=townSave(f).h;return '💖'.repeat(h)+'🤍'.repeat(5-h);};
function addHeart(f,n=1){const s=townSave(f),was=s.h;s.h=Math.min(5,s.h+n);persist();if(s.h===was)return;if(talkF===f)renderTalk();
  floaties(f.g.position.clone().add(new THREE.Vector3(0,1.9,0)),'💖',4+n*2);
  if(s.h>=5&&was<5){did('bestie');setFriendTag(f);sfx('tada');banner(`💖 ${f.name} is your best friend!`);}else if(s.h>=3&&was<3)toast(`${f.name} likes you a lot! Ask ${f.name} to walk with you 🚶‍♀️`);}
function questOf(f){const s=townSave(f);if(!s.q)return null;const [id,arg]=s.q.id.split(':');return {s,q:s.q,id,arg,def:QUESTS[id]};}
function questReady(f){const Q=questOf(f);if(!Q)return false;if(Q.q.ok)return true;if(Q.def.check&&Q.def.check(f))return true;return false;}
function questAsk(f){const s=townSave(f),id=f.info.qs[s.qi%f.info.qs.length];s.q={id,ok:false,n:0};persist();const [k,arg]=id.split(':');const a=QUESTS[k].ask;return typeof a==='function'?a(arg):a;}
function questHint(f){const Q=questOf(f);const h=Q.def.hint;let t=typeof h==='function'?h(Q.arg):h;if(Q.id==='stars')t+=` (${Q.q.n||0} of 3 so far)`;return t;}
function finishQuest(f){did('quest');const s=townSave(f);s.q=null;s.qi++;s.done=(s.done||0)+1;SAVE.townDone=(SAVE.townDone||0)+1;persist();
  f.play('cheer');friendBubble(f,'You did it! Thank you! 🎉');sfx('tada');banner('🎉 Quest complete!');
  for(let k=0;k<3;k++)setTimeout(()=>burst(f.g.position.clone().add(new THREE.Vector3(0,1.6,0)),rnd(['#ff8fc8','#ffd23f','#8fd8ff','#c6a6ff']),40,3,.2),k*300);
  setTimeout(()=>addHeart(f,2),500);if(talkF===f){talkMode='main';tsay(f,`You did it! 🎉 You're amazing, ${SAVE.name||'friend'}!`);}}
// quest progress from things you do around town
function questEvent(kind,arg){did(kind,arg);for(const f of FRIENDS){const Q=questOf(f);if(!Q||Q.q.ok)continue;
  if(Q.id==='stars'&&kind==='star'){Q.q.n=(Q.q.n||0)+1;if(Q.q.n>=3){Q.q.ok=true;toast(`⭐ That's 3 stars! Go tell ${f.name}!`);}persist();}
  if(Q.id==='visit'&&kind==='zone'&&arg===Q.arg){Q.q.ok=true;persist();setTimeout(()=>toast(`📍 You made it! Go tell ${f.name} about it.`),1800);}
  if(Q.def.act&&kind==='act'&&arg===Q.def.act&&f.pos.distanceTo(player.pos)<6){Q.q.ok=true;setTimeout(()=>finishQuest(f),700);}}}
function tsay(f,text){$('#tsay').textContent=text;f.play(rnd(['wave','clap','pose','cheer']));renderTalk();}
function renderTalk(){const f=talkF;if(!f)return;$('#tface').textContent=f.info.em;$('#tname').textContent=f.name;$('#thearts').textContent=hearts(f);
  const b=(id,em,label,cls='')=>`<button class="${cls}" data-t="${id}">${em}<span>${label}</span></button>`;let h='';
  if(talkMode==='qa'){h=f.qa.a.map((a,i)=>b('a'+i,a[0].split(' ')[0],a[0].split(' ').slice(1).join(' '))).join('');}
  else if(talkMode==='offer'){h=b('yes','👍','Okay!','go')+b('no','🙈','Not now');}
  else{const Q=questOf(f),ready=questReady(f),s=townSave(f);
    const X=TALK_EXTRA.map(x=>{const r=x.btn(f);return r&&b(x.id,r[0],r[1],'go');}).filter(Boolean).join('');
    h=b('chat','💬','Chat')+b('nice','💖','Compliment')+b('dance','💃','Dance')+(X||b('wave','👋','Wave'))+
      (ready?b('quest','🎁','I did it!','go'):Q?b('quest','⭐','My task'):b('quest','⭐','Need help?'))+
      (s.h>=3?(f.follow?b('stay','🛑','Stop walking'):b('follow','🚶‍♀️','Walk with me')):b('bye','👋','Bye'));}
  $('#topts').innerHTML=h;}
function openTalk(f){if(closetOpen||!started)return;did('talk',f.name);if(talkF&&talkF!==f)closeTalk();talkF=f;talkMode='main';f.tgt=null;
  const s=townSave(f);let g;
  if(questReady(f))g=`Ooh! Did you do what I asked? 👀`;
  else if(Math.random()<.45){const L=SAVE.look,c=[];if(L.dress){const d=LOOK_NAME(DRESSES,L.dress.id);d&&c.push(`Wow, I love your ${d[0].toLowerCase()}! ${d[1]}`);}
    if(L.hat){const d=LOOK_NAME(HATS,L.hat.id);d&&c.push(`That ${d[0].toLowerCase()} is so cute on you! ${d[1]}`);}
    if(L.shoes){const d=LOOK_NAME(SHOES,L.shoes.id);d&&c.push(`Where did you get those ${d[0].toLowerCase()}? ${d[1]}`);}
    if(myPet()&&myPet().pos.distanceTo(f.pos)<5)c.push(`Aww, is that ${myPet().name}? So cute! 🐾`);
    g=c.length?rnd(c):rnd(f.info.hi);}
  else g=s.h>=5?`My best friend ${SAVE.name||''} is here! 💖`:rnd(f.info.hi);
  document.body.classList.add('talking');$('#talk').classList.add('show');talkBtn();sfx('pop');tsay(f,g);}
function closeTalk(){if(!talkF)return;const f=talkF;talkF=null;document.body.classList.remove('talking');$('#talk').classList.remove('show');f.cool=8;f.wait=1+Math.random()*2;talkNear=null;talkBtn();}
$('#tbye').onclick=()=>{if(talkF){talkF.play('wave');friendBubble(talkF,'Bye bye! 👋');}closeTalk();};
$('#topts').addEventListener('click',e=>{const b=e.target.closest('button');const f=talkF;if(!b||!f)return;const t=b.dataset.t;sfx('pop');const s=townSave(f);
  const X=TALK_EXTRA.find(x=>x.id===t);if(X){X.act(f);return;}
  if(t==='chat'){if(Math.random()<.4){f.qa=rnd(QA);talkMode='qa';tsay(f,f.qa.q);}else tsay(f,rnd(f.info.chat));}
  else if(t[0]==='a'&&talkMode==='qa'){const a=f.qa.a[+t.slice(1)];talkMode='main';tsay(f,a[1]);if(!f.qaHeart){f.qaHeart=true;addHeart(f);}}
  else if(t==='nice'){const line=rnd(PLAYER_COMPLIMENTS(f));av.play('kiss');friendBubble(f,'💖');$('#tsay').textContent='';
    setTimeout(()=>{if(talkF!==f)return;tsay(f,`"${line}"\n\n${rnd(THANKS)}`);const now=performance.now();if(!f.niceT||now-f.niceT>60000){f.niceT=now;addHeart(f);}},500);}
  else if(t==='dance'){const dn=rnd(DANCES)[0];av.play(dn);f.play(dn);floaties(headPos(),'🎵',4);$('#tsay').textContent=rnd(['Dance party! 💃🕺','Woo! Look at us go! 🎶','You\'ve got moves! ✨']);questEvent('act','dance');
    if(!f.danced){f.danced=true;addHeart(f);}}
  else if(t==='wave'){av.play('wave');f.play('wave');$('#tsay').textContent=`Hi ${SAVE.name||'friend'}! 👋`;}
  else if(t==='quest'){const Q=questOf(f);
    if(!Q){talkMode='offer';$('#tsay').textContent=questAsk(f);f.play('pose');renderTalk();}
    else if(questReady(f))finishQuest(f);
    else tsay(f,`${(()=>{const a=Q.def.ask;return typeof a==='function'?a(Q.arg):a;})()}\n\n💡 ${questHint(f)}`);}
  else if(t==='yes'){talkMode='main';tsay(f,`Yay! Thank you! 💕\n\n💡 ${questHint(f)}`);}
  else if(t==='no'){s.q=null;persist();talkMode='main';tsay(f,'That\'s okay! Maybe later 😊');}
  else if(t==='follow'){f.follow=true;tsay(f,'Yay, let\'s go explore together! 🚶‍♀️✨');setTimeout(closeTalk,1300);}
  else if(t==='stay'){f.follow=false;f.tgt=null;tsay(f,'Okay! I\'ll hang out here. See you later! 👋');}
  else if(t==='bye'){f.play('wave');friendBubble(f,'Bye bye! 👋');closeTalk();}});
// the "Talk to …" button when you walk up to someone
function talkBtn(){const P=player.pos;let best=null,bd=2.6;if(!talkF&&started&&!closetOpen)for(const f of FRIENDS){const d=Math.hypot(P.x-f.pos.x,P.z-f.pos.z);if(d<bd){bd=d;best=f;}}
  const b=$('#talkBtn');if(best!==talkNear){talkNear=best;if(best){b.textContent=`💬 Talk to ${best.name}`;b.style.display='block';}else b.style.display='none';}
  b.classList.toggle('up',!!(petNear&&$('#petBtn').style.display!=='none'));}
$('#talkBtn').onclick=()=>{if(talkNear)openTalk(talkNear);};
// tap someone in the world to talk
const tapRay=new THREE.Raycaster(),tapNdc=new THREE.Vector2();let tap=null;
canvas.addEventListener('pointerdown',e=>{if(!tap)tap={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};});
canvas.addEventListener('pointerup',e=>{const t0=tap;if(!t0||t0.id!==e.pointerId)return;tap=null;
  if(closetOpen||!started||Math.hypot(e.clientX-t0.x,e.clientY-t0.y)>14||performance.now()-t0.t>450)return;
  tapNdc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);tapRay.setFromCamera(tapNdc,camera);
  const h=tapRay.intersectObjects(FRIENDS.map(f=>f.hb),false)[0];if(!h)return;const f=h.object.userData.f;
  if(f.pos.distanceTo(player.pos)<4.5)openTalk(f);else{f.play('wave');friendBubble(f,`Over here, ${SAVE.name||'friend'}! 👋`);f.face=Math.atan2(player.pos.x-f.pos.x,player.pos.z-f.pos.z);toast(`Walk closer to ${f.name} to talk 👣`);}});
canvas.addEventListener('pointercancel',e=>{if(tap&&tap.id===e.pointerId)tap=null;});

