/* ================= 🛹 SKATEBOARD =================
   The skateboard is a guy's extra (14c-guy.js). It is carried in the hand while walking around, and:
   - it is put away (hidden) during sports and other hands-on games, so it's not in the way of the bat or the ball.
   - tap 🛹 Ride in the moves wheel to hop on and skate around town: faster than walking, you keep rolling when
     you let go of the joystick, you lean into turns, and JUMP does an ollie. Tap 🛹 Hop off to carry it again. */
const SK={on:false,v:0,dir:0,air:false,lean:0};
const hasBoard=()=>!!(SAVE.look&&SAVE.look.extras&&SAVE.look.extras.skateboard);
// busy with something that needs your hands (or a seat): the board goes away until you're done
const boardBusy=()=>!!SP.mode||garageOpen||sandOpen||bakeryOpen||parlorOpen||barnOpen||!!barnRide||glamOpen||barberOpen||ck.on||pc.on;
const skateBoost=()=>SK.on?1.55:1;
const skateActs=()=>hasBoard()?[['skate','🛹',SK.on?'Hop off':'Ride']]:[];
function startSkate(){if(SK.on||!hasBoard()||closetOpen||!started||boardBusy())return;SK.on=true;SK.v=0;SK.dir=player.face;av.emote=null;
  if(player.onGround){player.vy=3.2;player.onGround=false;}sfx('jump');renderActions();did('skate');
  if(!SAVE.skated){SAVE.skated=1;persist();toast('🛹 Skate anywhere in town! Tap JUMP to ollie, tap 🛹 Hop off to carry it again');}}
function stopSkate(quiet){if(!SK.on)return;SK.on=false;SK.v=0;av.skating=false;av.g.rotation.z=0;if(av.deck)av.deck.rotation.x=0;if(!quiet)sfx('pop');renderActions();}
function toggleSkate(){if(SK.on)stopSkate();else startSkate();}
// the stance: turn the hips side-on (feet across the board), turn the chest and head back toward where you're going
function skatePose(a,tgt,sp,air,t){const push=a.skating&&!air&&sp>.05&&a.skatePush;
  tgt.sy=-1.35;tgt.st=.75;tgt.hy=.55;tgt.lean=.06;tgt.hd=0;tgt.spin=0;
  tgt.l0=tgt.l1=-.32;tgt.k0=tgt.k1=.62;tgt.an=-.25;tgt.l0z=-.2;tgt.l1z=.2;tgt.bob=-.07;
  tgt.a0x=tgt.a1x=0;tgt.a0z=-.9-Math.sin(t*2.3)*.12;tgt.a1z=.9-Math.sin(t*2.3+1)*.12;tgt.e0=tgt.e1=-.35;
  // push off with the back foot now and then while speeding up
  if(push){const k=Math.max(0,Math.sin(t*5));tgt.l1=-.32+k*.6;tgt.k1=.62-k*.4;}
  if(air){tgt.k0=tgt.k1=1.1;tgt.l0=tgt.l1=-.7;tgt.bob=-.12;tgt.a0z=-1.4;tgt.a1z=1.4;}}
anims.push((t,dt)=>{if(!started||!av)return;
  // the board in the hand: hidden while riding it, and during games that need your hands
  if(SK.on&&(!hasBoard()||closetOpen||boardBusy()))stopSkate(true);
  if(av.board)av.board.visible=!SK.on&&!boardBusy();
  if(av.deck)av.deck.visible=SK.on;
  av.skating=SK.on;av.skatePush=SK.pushing;if(!SK.on){if(av.g.rotation.z)av.g.rotation.z=0;return;}
  // keep rolling after you let go of the joystick, slowing down little by little
  let ix=joy.x,iy=joy.y;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;if(keys.KeyW||keys.ArrowUp)iy-=1;if(keys.KeyS||keys.ArrowDown)iy+=1;
  const p=player.pos,pushing=Math.hypot(ix,iy)>.08;SK.pushing=pushing&&player.speed>SK.v+.05;
  const turn=((player.face-SK.dir+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  if(pushing){SK.v=player.speed;SK.dir=player.face;}
  else if(SK.v>.15){SK.v*=Math.pow(.45,dt);const old=p.clone();p.x+=Math.sin(SK.dir)*SK.v*dt;p.z+=Math.cos(SK.dir)*SK.v*dt;collide(p);
    if(groundAt(p.x,p.z)-p.y>.45||p.distanceTo(old)<SK.v*dt*.3){p.x=old.x;p.z=old.z;SK.v=0;}player.speed=SK.v;}
  else SK.v=0;
  // lean into turns, pop the nose up for an ollie, clack when you land
  SK.lean+=(Math.max(-.3,Math.min(.3,-turn/Math.max(dt,.001)*.012))-SK.lean)*Math.min(1,dt*6);
  av.g.position.copy(p);av.g.position.y+=.1;av.g.rotation.z=SK.lean;
  const air=!player.onGround;if(av.deck)av.deck.rotation.x+=((air&&player.vy>0?-.28:0)-av.deck.rotation.x)*Math.min(1,dt*14);
  if(SK.air&&!air)tone(170,.06,'square',.06);SK.air=air;});
