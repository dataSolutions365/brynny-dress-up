/* ================= 🛼 ROLLER SKATES =================
   Two kinds of real skates you can wear from the Shoes tab (same ids in the 2D studio):
   - skates:  four-wheel quad skates, a laced high-top boot on a metal plate, two wheels front and back, and a toe stop
   - inlines: inline skates, a tall hard cuff with a buckle strap, four wheels in a row on a frame, and a heel brake
   The boot takes the shoe color. The wheels have their own color (look.shoes.w), picked in the closet under "Wheels".
   Wearing either one makes you roll: a bit faster than walking, wheels spinning, and a skating stride where
   the legs push out to the side and the arms swing (rollerPose, called from Avatar.update in 14-avatar.js). */
const ROLLERS={skates:{w:'#ffd23f',lift:.077},inlines:{w:'#4fb6ff',lift:.092}};
const isRoller=s=>!!(s&&ROLLERS[s.id]);
// rolling speed while wearing skates (off while riding, on a board, or in games that need your hands)
const rollerBoost=()=>av&&av.rollers&&!SK.on&&!boardBusy()?1.35:1;

// a wheel that can spin: a group at the axle, so turning group.rotation.x rolls it forward
function rollerWheel(k,an,x,y,z,r,w,wm,hub,stripe){const g=new THREE.Group();g.position.set(x,y,z);an.add(g);k.av.parts.push(g);g.geometry={dispose(){}};
  k.P(cyl(r,r,w,22),wm,g).rotation.z=Math.PI/2;
  k.P(cyl(r*.48,r*.48,w+.003,14),hub,g).rotation.z=Math.PI/2;
  // light stripes on both faces of the wheel so you can see it turning
  for(const s of [-1,1])for(const a of [0,Math.PI/2]){const b=k.P(box(.002,r*1.5,r*.22),stripe,g,s*(w/2+.001),0,0);b.rotation.x=a;}
  k.av.wheels.push({g,r});}

function rollerBoot(k,l,m,dk,tall){const an=l.an,X=k.av.legX;
  k.P(sph(.06,20,14),m,an,0,-.006,.045).scale.set(1.2,.95,2.05);// around the foot
  k.P(sph(.067,18,14),m,an,0,.004,-.004);// round over the ankle
  k.P(cyl(.064,.068,tall,26),m,l.kn,0,-.37-X+tall/2,0);// up the shin
  k.P(new THREE.TorusGeometry(.064,.015,10,26),dk,l.kn,0,-.37-X+tall,0).rotation.x=Math.PI/2;// padded collar
  k.P(new RoundedBoxGeometry(.118,.026,.235,2,.01),dk,an,0,-.064,.045);}// sole

const ROLLER_BUILD={
  // 🛼 quad skates, like a classic rink skate
  skates(k,c,wc){const m=k.mat(c,'shiny'),dk=k.mat(shadeC(c,-.35),'shiny'),met=k.mat('#c9ced6','metal'),rub=k.mat('#2a2a2e','shiny'),wm=k.mat(wc,'shiny'),lace=k.mat(shadeC(c,.75),'fabric'),X=k.av.legX;
    for(const l of k.legs){const an=l.an;rollerBoot(k,l,m,dk,.13);
      // laces criss-crossing up the front, with shiny eyelets
      for(let i=0;i<4;i++){const y=-.37-X+.022+i*.028;for(const s of [-1,1]){const b=k.P(box(.05,.007,.006),lace,l.kn,0,y+.006,.066);b.rotation.z=s*.32;}
        for(const s of [-1,1])k.P(sph(.006,8,6),met,l.kn,s*.026,y,.062);}
      for(let i=0;i<2;i++){const b=k.P(box(.052,.007,.006),lace,an,0,.03-i*.022,.098+i*.018);b.rotation.x=-.75;}
      k.P(box(.07,.012,.2),met,an,0,-.083,.045);// metal plate
      for(const z of [-.008,.1]){k.P(box(.045,.026,.032),met,an,0,-.095,z);const ax=k.P(cyl(.006,.006,.13,8),met,an,0,-.105,z);ax.rotation.z=Math.PI/2;
        for(const s of [-1,1])rollerWheel(k,an,s*.052,-.105,z,.034,.03,wm,met,lace);}
      const ts=k.P(cyl(.019,.023,.034,16),rub,an,0,-.104,.163);ts.rotation.x=.45;}// toe stop
    k.av.lift=ROLLERS.skates.lift;k.av.rollers='skates';},
  // 🛼 inline skates, like a sporty rollerblade
  inlines(k,c,wc){const m=k.mat(c,'shiny'),dk=k.mat(shadeC(c,-.45),'shiny'),met=k.mat('#c9ced6','metal'),frm=k.mat('#3a3d44','metal'),rub=k.mat('#2a2a2e','shiny'),wm=k.mat(wc,'shiny'),lite=k.mat('#ffffff','shiny'),X=k.av.legX;
    for(const l of k.legs){const an=l.an;rollerBoot(k,l,m,dk,.17);
      // the hard cuff: a wide strap with a silver buckle, and a strap over the top of the foot
      k.P(cyl(.071,.073,.026,26),dk,l.kn,0,-.37-X+.115,0);k.P(box(.03,.02,.012),met,l.kn,l.sx*.02,-.37-X+.115,.072);
      const st=k.P(new THREE.TorusGeometry(.064,.012,8,22,Math.PI),dk,an,0,-.024,.07);st.scale.set(1.05,.85,1);
      k.P(box(.024,.016,.012),met,an,l.sx*.03,.026,.072);
      // the frame under the boot, and four wheels in a row
      for(const s of [-1,1])k.P(box(.007,.042,.27),frm,an,s*.018,-.094,.048);
      for(const z of [-.06,.012,.084,.156]){rollerWheel(k,an,0,-.122,z,.032,.022,wm,met,lite);const b=k.P(cyl(.006,.006,.044,8),met,an,0,-.122,z);b.rotation.z=Math.PI/2;}
      if(l.sx>0){const br=k.P(cyl(.022,.026,.045,16),rub,an,0,-.118,-.118);br.rotation.x=-.5;}}// heel brake on one skate
    k.av.lift=ROLLERS.inlines.lift;k.av.rollers='inlines';}};
for(const id in ROLLER_BUILD)OUTFITS2D[id]=(k,c)=>{const s=k.av.look.shoes||{};ROLLER_BUILD[id](k,c,s.w||ROLLERS[id].w);};

// 🛼 the skating stride: a push out to the side and back with one leg while gliding on the other bent leg,
// the body leaning forward, and the arms swinging opposite the legs (the arm on the pushing side swings back)
function rollerPose(a,tgt,sp,dt){if(sp<.04){a.rollOn=false;return;}a.rollOn=true;
  a.rph=(a.rph||0)+dt*(3.2+sp*2.4);const s=Math.sin(a.rph),k=Math.min(1,sp*1.5),p0=Math.max(0,-s),p1=Math.max(0,s);
  tgt.l0=(-.28+p0*.8)*k;tgt.l1=(-.28+p1*.8)*k;tgt.k0=.12+(.5-p0*.38)*k;tgt.k1=.12+(.5-p1*.38)*k;
  tgt.l0z=-(.05+p0*.42)*k;tgt.l1z=(.05+p1*.42)*k;
  // sink down onto the gliding leg so the wheels stay on the ground
  const T=.38+a.legX,S=.37+a.legX,h=(l,kn,lz)=>(T*Math.cos(l)+S*Math.cos(l+kn))*Math.cos(lz);
  tgt.bob=Math.max(h(tgt.l0,tgt.k0,tgt.l0z),h(tgt.l1,tgt.k1,tgt.l1z))-(T+S);
  tgt.a0x=-s*1.15*k;tgt.a1x=s*1.15*k;
  tgt.a0z=-.18+(p1*.3-p0*.4)*k;tgt.a1z=.18+(p1*.4-p0*.3)*k;
  tgt.e0=-.35-p1*.65*k;tgt.e1=-.35-p0*.65*k;
  tgt.lean=.34*k;tgt.sy=s*.16*k;tgt.st=-s*.22*k;tgt.hx=-s*.05*k;tgt.hd=s*.04*k;tgt.hy=s*.12*k;}
// keep the skates flat on the ground while the legs bend and push out, and roll the wheels
function rollerFeet(a,dt,speed){const L=a.legs;
  if(a.rollOn)for(const l of L){l.an.rotation.x=-(l.hp.rotation.x+l.kn.rotation.x);l.an.rotation.z=-l.hp.rotation.z;}
  else if(a.wasRoll)for(const l of L)l.an.rotation.z=0;
  a.wasRoll=a.rollOn;
  if(a.wheels.length&&speed>.02)for(const w of a.wheels)w.g.rotation.x+=speed*dt/w.r;}
