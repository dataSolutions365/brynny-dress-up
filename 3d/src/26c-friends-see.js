/* ================= 👭 WHAT FRIENDS SEE ONLINE =================
   When you play online with family (online.js), everyone in the room sees you on their phone exactly like you see yourself:
   your outfit and body (online.js sends your look), plus everything in this file: the pet you adopted following you
   (in its outfit, nail polish and mud), your barn buddy, the animal you're riding, your skateboard (in your hand or under
   your feet), and what you're busy doing, like baking or batting, with a little sign over your head.

   Each thing friends can see is one entry in SHOW:
     k            a short name for it
     mine()       small plain data about YOU right now, or null when you don't have it. It is sent to friends when it changes,
                  so keep it to what matters (no positions: friends already get where you are 10 times a second).
     on(f,d)      build it on friend f's screen. f.a is their Avatar, f.pos where they stand, f.cur the way they face.
                  Return anything you want to keep (it comes back as h).
     step(f,d,dt,h)  every frame while it's shown.
     off(f,h)     take it away again (they hopped off, left the room, or it changed).
   NEW RIDES (a bicycle, a horse...) or new things to hold: add one more entry here with SHOW.push({...}), and friends see it too.
   A ride that is a barn animal (riding in 24d-barn.js) already shows up through the 'ride' entry below. */
const SHOW=[];
const showEsc=s=>String(s==null?'':s).slice(0,20);
const showPetFit=F=>{const o={};if(F&&typeof F==='object')for(const [slot] of PSLOTS){const v=F[slot];if(v&&typeof v.id==='string')o[slot]={id:v.id.slice(0,20),c:typeof v.c==='string'?v.c.slice(0,30):undefined};}return o;};

// 🐾 the pet you adopted walks along beside you, dressed up just like at home
SHOW.push({k:'pet',
  mine(){const pt=myPet();if(!pt)return null;const c=petCare(pt);return {i:PETS.indexOf(pt),fit:c.fit||{},pol:c.polish,dirt:c.dirt.map(v=>Math.round(v*10)/10)};},
  on(f,d){const src=PETS[d.i|0];if(!src||!Number.isInteger(d.i))return null;
    const pt=new Pet(src.kind,src.color,src.name,src.home,src.o);pt.owned=true;petExtras(pt);
    pt.fitOver=showPetFit(d.fit);dressPet(pt);paintNails(pt,Array.isArray(d.pol)?d.pol.map(p=>typeof p==='string'?p:null):[]);
    pt.dirtM.forEach((s,i)=>{const h=Math.max(0,Math.min(1,+((d.dirt||[])[i])||0));s.visible=h>.02;const k=.35+.65*h;s.scale.set(k,.8*k,1.2*k);});
    pt.setTag();pt.showCollar();
    const P=f.pos,a=(f.cur??f.face)+2.3;pt.pos.set(P.x+Math.sin(a)*.9,P.y,P.z+Math.cos(a)*.9);scene.add(pt.g);
    // the same pet waiting for adoption in your world would be a twin, so it hides while your friend has it out
    let hid=null;if(!src.owned){src._netHide=(src._netHide||0)+1;src.g.visible=false;hid=src;}
    return {pt,hid,air:false};},
  step(f,d,dt,h){const pt=h&&h.pt;if(!pt)return;const P=f.pos,fc=f.cur??f.face,a=fc+2.3;
    const sx=P.x+Math.sin(a)*.9,sz=P.z+Math.cos(a)*.9,dx=sx-pt.pos.x,dz=sz-pt.pos.z,dd=Math.hypot(dx,dz);let spd=0;
    if(dd>20){pt.pos.x=sx;pt.pos.z=sz;}
    else if(dd>.35){spd=Math.min(7,.8+dd*2.6);const st=Math.min(dd,spd*dt);pt.pos.x+=dx/dd*st;pt.pos.z+=dz/dd*st;collide(pt.pos,.22);pt.face=angDamp(pt.face,Math.atan2(dx,dz),Math.min(1,dt*8));}
    else pt.face=angDamp(pt.face,Math.atan2(P.x-pt.pos.x,P.z-pt.pos.z),dt*4);
    // hop when your friend jumps
    if(f.air&&!h.air&&pt.y<=0&&dd<4)pt.vy=4.2;h.air=f.air;
    pt.speed+=(spd-pt.speed)*Math.min(1,dt*8);pt.vy-=18*dt;pt.y+=pt.vy*dt;if(pt.y<0){pt.y=0;pt.vy=0;}
    const gy=groundAt(pt.pos.x,pt.pos.z);pt.pos.y+=(gy-pt.pos.y)*Math.min(1,dt*12);
    pt.g.position.set(pt.pos.x,pt.pos.y+pt.y,pt.pos.z);pt.g.rotation.y=pt.face;pt.update(dt);},
  off(f,h){if(!h)return;if(h.pt)scene.remove(h.pt.g);const s=h.hid;if(s&&--s._netHide<=0){s._netHide=0;s.g.visible=true;}}});

// barn animals made just for a friend: they never bump into you and never join your own barn
function showFarm(k,n){if(!FK[k])return null;const a=new FarmAnimal(k);const i=obs.indexOf(a.ob);if(i>=0)obs.splice(i,1);a.ob.r=0;a.setTag(showEsc(n)||FK[k].nm||'');scene.add(a.g);return a;}
const showFarmOff=h=>{if(h&&h.a)scene.remove(h.a.g);};

// 🐣 the little barn buddy (or flying baby dragon) that follows you around town
SHOW.push({k:'pal',
  mine(){const k=BS.pal;return k&&BS.own[k]?{k,n:BS.own[k].n}:null;},
  on(f,d){const a=showFarm(d.k,d.n);if(!a)return null;const P=f.pos;a.pos.set(P.x,P.y,P.z);return {a};},
  step(f,d,dt,h){const a=h&&h.a;if(!a)return;const P=f.pos,fc=f.cur??f.face,fly=a.F.pal==='fly',back=fc+Math.PI+(fly?.5:.75),r=(fly?.75:.95)+a.rad;
    const tx=P.x+Math.sin(back)*r,ty=fly?P.y+1.45+Math.sin(a.t*2.2)*.12:P.y,tz=P.z+Math.cos(back)*r,dx=tx-a.pos.x,dz=tz-a.pos.z,dd=Math.hypot(dx,dz);let sp=0;
    if(dd>14)a.pos.set(tx,ty,tz);
    else{sp=dd>.15?Math.min(9,1.5+dd*3):0;if(sp){a.pos.x+=dx/dd*Math.min(dd,sp*dt);a.pos.z+=dz/dd*Math.min(dd,sp*dt);a.face=angDamp(a.face,Math.atan2(dx,dz),Math.min(1,dt*8));}
      else a.face=angDamp(a.face,fc,Math.min(1,dt*3));a.pos.y+=(ty-a.pos.y)*Math.min(1,dt*(fly?4:12));}
    if(!fly){const gy=groundAt(a.pos.x,a.pos.z);if(a.pos.y<gy)a.pos.y=gy;}
    a.flying=fly;a.graze=0;a.g.position.copy(a.pos);a.g.rotation.y=a.face;a.update(dt,fly?0:sp);},
  off:(f,h)=>showFarmOff(h)});

// 🏇 riding a barn animal (horse, pony, unicorn, cow...): your friend sits up on its back
SHOW.push({k:'ride',
  mine(){const a=barnRide;return a&&BS.own[a.k]?{k:a.k,n:BS.own[a.k].n}:null;},
  on(f,d){const a=showFarm(d.k,d.n);return a?{a}:null;},
  step(f,d,dt,h){const a=h&&h.a;if(!a)return;const A=f.a;
    if(!A.emote||A.emote.id!=='ride')A.play('ride');
    a.pos.copy(f.pos);a.g.position.copy(a.pos);a.g.rotation.y=f.cur??f.face;a.update(dt,(f.sp||0)*.55);
    A.g.position.y=f.pos.y+a.F.ride-.42;},
  off(f,h){showFarmOff(h);const A=f.a;if(A&&A.emote&&A.emote.id==='ride')A.emote=null;}});

// 🛹 the skateboard: in your hand while you walk, under your feet while you ride, put away while your hands are busy
SHOW.push({k:'skate',
  mine(){return hasBoard()?{on:SK.on?1:0,away:!SK.on&&boardBusy()?1:0}:null;},
  on(){return {lean:0,yaw:null,sp:0};},
  step(f,d,dt,h){const A=f.a,on=!!d.on;
    if(A.board)A.board.visible=!on&&!d.away;if(A.deck)A.deck.visible=on;A.skating=on;
    if(!on){if(A.g.rotation.z)A.g.rotation.z=0;h.yaw=null;return;}
    // push off when speeding up, lean into turns, and pop the nose up for an ollie
    const sp=f.sp||0;A.skatePush=sp>h.sp+.02;h.sp=sp;
    const yaw=f.cur??f.face,turn=h.yaw==null?0:((yaw-h.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;h.yaw=yaw;
    h.lean+=(Math.max(-.3,Math.min(.3,-turn/Math.max(dt,.001)*.012))-h.lean)*Math.min(1,dt*6);
    A.g.position.y+=.1;A.g.rotation.z=h.lean;
    if(A.deck)A.deck.rotation.x+=((f.air?-.28:0)-A.deck.rotation.x)*Math.min(1,dt*14);},
  off(f){const A=f.a;if(!A)return;A.skating=false;A.skatePush=false;A.g.rotation.z=0;if(A.deck){A.deck.visible=false;A.deck.rotation.x=0;}if(A.board)A.board.visible=true;}});

// 🎂 what you're busy doing, shown on a little sign over your head, plus the bat or ball in your hands at the sports park
function showDoing(){
  if(SP.mode)return {bat:'⚾ Batting practice',ft:'🏀 Free throws',shoot:'🔥 Basketball shootout',v1:'🆚 1-on-1 with Kai'}[SP.mode]||'🏀 Playing ball';
  if(ck.on)return '🏆 Cake contest';if(pc.on)return '🏆 Pet contest';if(ct.on)return '📸 Model contest';
  if(glamOpen)return '💄 Glam mirror';if(barberOpen)return '💈 At the barber';if(storeOpen)return '👕 Clothes shopping';
  if(bakeryOpen)return '🎂 Baking a cake';if(parlorOpen)return '🐾 Pet Parlor spa';if(barnOpen)return '🐴 At the barn';if(zooOpen)return '🦒 At the zoo';
  if(garageOpen)return '🔧 Fixing a car';if(sandOpen)return '🏰 Building a sandcastle';if(shopOpen)return '🪙 At the shop';if(mapOpen)return '🗺️ Looking at the map';
  if(talkF)return `💬 Talking to ${talkF.name}`;if(closetOpen)return '👗 Getting dressed';return null;}
function showHold(){if(SP.mode==='bat')return 'bat';if(SP.mode&&SP.ball&&SP.ball.st==='hold'&&SP.poss==='me')return 'ball';return null;}
const showBallMat=()=>std('#e8742a',{roughness:.6});
SHOW.push({k:'doing',
  mine(){const w=showDoing(),hold=showHold();return w||hold?{w,hold}:null;},
  on(f,d){const h={};
    if(typeof d.w==='string'&&d.w){h.sign=sprite(labelTex(showEsc(d.w.slice(0,30)),{size:44,w:512,h:100,fg:'#3b2357',bg:'rgba(255,240,248,.92)',border:null}),1.05,.2);h.sign.position.y=2.1;f.a.g.add(h.sign);h.g=f.a.g;}
    if(d.hold==='bat'||d.hold==='ball'){const hand=f.a.arms&&f.a.arms[0]&&f.a.arms[0].hand;
      if(hand){h.prop=new THREE.Group();hand.add(h.prop);h.hand=hand;
        if(d.hold==='bat'){const b=M(spBatGeo,std('#e8c99a',{roughness:.45}),0,-.02,0,h.prop,true,false);b.rotation.x=Math.PI*.55;}
        else M(sph(.12,18,14),showBallMat(),0,-.1,.06,h.prop,true,false);}}
    return h;},
  // a friend who rebuilds (new body or face) gets a new avatar: move the sign over
  step(f,d,dt,h){if(h.sign&&h.g!==f.a.g){h.g.remove(h.sign);f.a.g.add(h.sign);h.g=f.a.g;}},
  off(f,h){if(!h)return;if(h.sign&&h.g)h.g.remove(h.sign);if(h.prop&&h.hand)h.hand.remove(h.prop);}});

/* ---------- what online.js calls ---------- */
// everything about you, for friends
function myShow(){const r={};for(const s of SHOW){try{const d=s.mine();if(d!=null)r[s.k]=d;}catch(e){}}return r;}
// build, change or take away what friend f has, from what their phone sent
function friendShow(f,all){if(!f)return;const A=all&&typeof all==='object'?all:{};f.shows||(f.shows={});
  for(const s of SHOW){const d=A[s.k]==null?null:A[s.k],j=JSON.stringify(d),cur=f.shows[s.k];
    if(cur&&cur.j===j&&cur.av===f.a)continue;
    if(cur){try{s.off(f,cur.h,cur.d);}catch(e){}delete f.shows[s.k];}
    if(d!=null&&typeof d==='object'){let h=null;try{h=s.on(f,d);}catch(e){h=null;}if(h)f.shows[s.k]={j,d,h,av:f.a};}}}
function friendShowStep(f,dt){if(!f.shows)return;for(const s of SHOW){const c=f.shows[s.k];if(c&&s.step)try{s.step(f,c.d,dt,c.h);}catch(e){}}}
Object.assign(window.__game,{SHOW,myShow,friendShow,friendShowStep,friendShowClear:f=>friendShow(f,{})});
