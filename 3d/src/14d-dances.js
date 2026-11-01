/* ================= DANCES AND GUY MOVES ================= */
// Tap Dance in the action buttons to pick a dance from the list (19c-dance-picker.js). Each dance here moves the
// avatar's joints over time: go(k,tgt,av) gets the seconds since the dance started (k) and sets the targets the
// avatar eases toward (tgt, see Avatar.update in 14-avatar.js), and t is how long it lasts. Walking stops a dance.
// Joints: l0/l1 legs forward(-)/back(+), k0/k1 knees, l0z/l1z legs out to the side, an ankles,
// a0x/a1x arms forward(-)/back(+), a0z/a1z arms out and up (arm 0 goes negative, arm 1 positive), e0/e1 elbows bend,
// a0y/a1y elbows bend sideways, bob hips up/down, hx hips side to side, sy turn the body, st twist the shoulders,
// lean bend forward, sz bend sideways, hr tilt the hips, hd tilt the head, hy turn the head, spin whole turns
// (end on a full turn), tilt the whole body forward.
// The same dances work for girls and guys.
const DANCES=[['dance','💃','Party'],['floss','🧵','The floss'],['twostep','🤠','Two step'],['breakdance','🔄','Breakdance'],['robot','🤖','Robot'],
  ['runningman','🏃','Running man'],['disco','🪩','Disco'],['sprinkler','💦','Sprinkler'],['macarena','🎶','Macarena'],['dab','😎','Dab'],['ballet','🩰','Ballet']];
const DANCE_IDS=new Set(DANCES.map(d=>d[0]));
const dEase=x=>x<=0?0:x>=1?1:x*x*(3-2*x),dPos=x=>Math.max(0,x);
// one arm in a named spot; side 0 is arm 0, side 1 mirrors it
const ARM_AT={down:[0,-.08,-.1,0],out:[-1.5,0,0,0],shoulder:[-.95,.75,-1.3,0],head:[-.2,-2.5,0,-1.5],hip:[-.55,.55,-.6,0],pocket:[.15,-.55,-.2,1.5]};
function armAt(tgt,side,spot){const [x,z,e,y]=ARM_AT[spot],m=side?-1:1;tgt['a'+side+'x']=x;tgt['a'+side+'z']=z*m;tgt['e'+side]=e;tgt['a'+side+'y']=y*m;}

const MOVE_ANIMS={
  // the floss: straight arms swing side to side, one in front and one behind, hips swing the other way
  floss:{t:4.4,go(k,tgt){const f=Math.sin(k*7);tgt.a0z=tgt.a1z=f*.85;tgt.a0x=-.5*f;tgt.a1x=.5*f;tgt.e0=tgt.e1=-.08;
    tgt.hx=-f*.06;tgt.l0z=tgt.l1z=f*.13;tgt.sz=f*.05;tgt.bob=-Math.abs(f)*.02;tgt.hd=f*.06;tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=.05;}},
  // two step: step side to side with a bounce, elbows bent and snapping
  twostep:{t:4.8,go(k,tgt){const w=k*Math.PI*1.8,s=Math.sin(w),b=Math.abs(Math.cos(w));tgt.hx=s*.08;tgt.l0z=-dPos(-s)*.22;tgt.l1z=dPos(s)*.22;
    tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=.15+.15*b;tgt.bob=-.02-.035*b;tgt.e0=tgt.e1=-1.5;tgt.a0x=-.25+s*.25;tgt.a1x=-.25-s*.25;tgt.a0z=-.2;tgt.a1z=.2;
    tgt.sy=s*.18;tgt.hd=s*.08;tgt.sz=-s*.05;}},
  // breakdance: toprock steps, drop down, spin on the floor with the legs out, then freeze with a hand in the air
  breakdance:{t:5.6,go(k,tgt){
    if(k<1.5){const s=Math.sin(k*7);tgt.l0=-.5*dPos(s);tgt.k0=.7*dPos(s);tgt.l1=-.5*dPos(-s);tgt.k1=.7*dPos(-s);tgt.sy=s*.35;tgt.st=-s*.2;
      tgt.a0z=-.7-.3*s;tgt.a1z=.7-.3*s;tgt.a0x=tgt.a1x=-.3;tgt.e0=tgt.e1=-1.2;tgt.bob=-.05;tgt.lean=.12;return;}
    if(k<1.9){const u=dEase((k-1.5)/.4);tgt.bob=-.5*u;tgt.l0=tgt.l1=-1.3*u;tgt.k0=tgt.k1=1.9*u;tgt.lean=.4*u;tgt.a0x=tgt.a1x=-.7*u;tgt.e0=tgt.e1=-.3;return;}
    if(k<4.4){const u=k-1.9;tgt.spin=dEase(u/2.5)*Math.PI*6;tgt.bob=-.5;tgt.tilt=.25;tgt.lean=.35;
      tgt.l0=-1.1+.35*Math.sin(u*12);tgt.l1=-.5-.35*Math.sin(u*12);tgt.k0=.3;tgt.k1=.5;tgt.l0z=-.6;tgt.l1z=.6;
      tgt.a0x=-.5;tgt.a0z=-.5;tgt.e0=0;tgt.a1z=1.2;tgt.a1x=-.2;tgt.e1=-.4;tgt.hd=.1;return;}
    tgt.spin=Math.PI*6;tgt.bob=-.45;tgt.a1z=2.7;tgt.e1=0;tgt.a1x=0;tgt.a0x=-.3;tgt.a0z=-.6;tgt.e0=0;
    tgt.l0=-1.4;tgt.k0=1.8;tgt.l1=-.6;tgt.k1=.4;tgt.l1z=.5;tgt.tilt=.15;tgt.sz=-.25;tgt.hd=-.2;}},
  // robot: stiff, choppy poses with the elbows bent at right angles
  robot:{t:4.8,go(k,tgt){const q=Math.floor(k*2.5)%4;tgt.a0x=tgt.a1x=0;tgt.a0z=-.1;tgt.a1z=.1;tgt.e0=tgt.e1=-1.57;tgt.k0=tgt.k1=.08;tgt.l0=tgt.l1=0;
    if(q===0)tgt.hy=.45;
    if(q===1){tgt.a0z=-1.57;tgt.a0y=-1.57;tgt.e0=0;tgt.sy=.3;tgt.hy=-.2;}
    if(q===2){tgt.a1z=1.57;tgt.a1y=1.57;tgt.e1=0;tgt.sy=-.3;tgt.hy=.2;}
    if(q===3){tgt.hy=-.45;tgt.bob=-.06;tgt.k0=tgt.k1=.3;tgt.l0=tgt.l1=-.15;tgt.a0x=tgt.a1x=-.3;}}},
  // running man: one knee comes up while the other foot slides back, arms pumping
  runningman:{t:4.4,go(k,tgt){const s=Math.sin(k*Math.PI*2.2);tgt.l0=-.9*dPos(s)+.3*dPos(-s);tgt.k0=1.3*dPos(s)+.1;tgt.l1=-.9*dPos(-s)+.3*dPos(s);tgt.k1=1.3*dPos(-s)+.1;
    tgt.bob=.03*Math.abs(s)-.06;tgt.a0x=.55*s;tgt.a1x=-.55*s;tgt.e0=tgt.e1=-1.6;tgt.a0z=-.15;tgt.a1z=.15;tgt.lean=.1;tgt.hd=s*.05;}},
  // disco: point up to the sky, then down across the hips, the other hand on the hip
  disco:{t:4.6,go(k,tgt){const w=k*Math.PI*1.8,u=(Math.sin(w)+1)/2;tgt.a0z=.5-2.9*u;tgt.a0x=-.35;tgt.e0=0;tgt.hy=-.3*u;
    tgt.a1z=.6;tgt.a1y=-1.5;tgt.e1=-.2;tgt.a1x=0;tgt.sy=(u-.5)*.3;tgt.hx=(.5-u)*.05;tgt.k0=.25*u;tgt.l0=-.1*u;tgt.k1=.05;tgt.l1=0;
    tgt.bob=-.02-.03*Math.abs(Math.cos(w*2));tgt.hd=(u-.5)*-.15;}},
  // sprinkler: one hand behind the head, the other arm out front, click-click-click around and sweep back
  sprinkler:{t:4.8,go(k,tgt){const c=k%2.4;let r;if(c<1.6)r=-.7+Math.floor(c/.27)*.28;else r=.7-dEase((c-1.6)/.8)*1.4;
    tgt.sy=r;tgt.a1z=2.5;tgt.a1y=1.6;tgt.a1x=.2;tgt.e1=0;tgt.a0x=-1.5;tgt.a0z=-.1;tgt.e0=0;tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=.2;
    tgt.bob=-.03-(c<1.6?.02*Math.abs(Math.sin(c*Math.PI/.27)):0);tgt.hd=.1;}},
  // macarena: arms out, flip, shoulders, behind the head, hips, back pockets, wiggle and hop
  macarena:{t:6.4,go(k,tgt){const c=Math.floor(k*2.5)%16,frac=k*2.5%1;
    const R=['out','out','shoulder','head','hip','pocket'],r=Math.min(5,Math.floor(c/2)),l=Math.min(5,Math.floor((c-1)/2));
    armAt(tgt,1,R[r]);armAt(tgt,0,c<1?'down':R[l]);tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=.08;
    if(c>=12&&c<15){tgt.hr=Math.sin(k*14)*.12;tgt.sy=Math.sin(k*14)*.15;tgt.bob=-.04;}
    if(c===15){tgt.bob=Math.sin(frac*Math.PI)*.08;tgt.k0=tgt.k1=.35;}
    if(c===2||c===3)tgt.hd=.05*(c===2?1:-1);}},
  // dab: duck your head into one elbow and throw the other arm up, then switch sides
  dab:{t:4,go(k,tgt){const c=k%2,d=Math.floor(k/2)%2;tgt.l0=tgt.l1=0;
    if(c<.5){const b=Math.sin(c/.5*Math.PI);tgt.bob=-.06*b;tgt.k0=tgt.k1=.3*b;tgt.e0=tgt.e1=-.6;tgt.a0x=tgt.a1x=-.2;return;}
    const up=d?0:1,bent=d?1:0,m=up?1:-1;tgt['a'+up+'z']=2.2*m;tgt['a'+up+'x']=-.3;tgt['e'+up]=0;
    tgt['a'+bent+'x']=-1.9;tgt['a'+bent+'z']=.7*m;tgt['e'+bent]=-1.5;tgt.hd=.3*m;tgt.hy=.35*m;tgt.lean=.25;tgt.sy=-.2*m;tgt.bob=-.03;}},
  // ballet: a pirouette on your toes with arms over your head, then an arabesque
  ballet:{t:5,go(k,tgt){
    if(k<2.6){const u=dEase(k/2.4);tgt.spin=u*Math.PI*4;tgt.a0z=-2.7;tgt.a1z=2.7;tgt.a0x=tgt.a1x=-.25;tgt.e0=tgt.e1=-.5;tgt.a0y=-.6;tgt.a1y=.6;
      tgt.l0=0;tgt.k0=0;tgt.l1=-.8;tgt.k1=1.7;tgt.l1z=.45;tgt.an=.4;tgt.bob=.04;tgt.hd=0;return;}
    tgt.spin=Math.PI*4;tgt.lean=.55;tgt.l1=1.15;tgt.k1=0;tgt.l0=0;tgt.k0=.05;tgt.a0x=-1.5;tgt.a0z=-.1;tgt.e0=0;tgt.a1z=1.4;tgt.a1x=.2;tgt.e1=-.2;tgt.hd=-.1;tgt.bob=-.02;}},

  /* the guy versions of the girly moves (Avatar.play swaps them in through GUY_MOVES) */
  // cool pose: arms crossed, chin up, standing wide at an angle
  coolpose:{t:2.4,go(k,tgt){tgt.a0x=tgt.a1x=-.6;tgt.a0z=-.15;tgt.a1z=.15;tgt.e0=tgt.e1=-1.55;tgt.a0y=1.1;tgt.a1y=-1.1;tgt.lean=-.06;tgt.sy=.3;tgt.hy=-.25;tgt.hd=.08;
    tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=0;tgt.l0z=-.12;tgt.l1z=.12;tgt.bob=-.01+Math.sin(Math.min(k,.5)*Math.PI*2)*.01;}},
  // finger guns: point both hands forward and "pew pew"
  guns:{t:1.6,go(k,tgt){const r=dPos(Math.sin(k*10))*.25;tgt.a0x=tgt.a1x=-1.45+r;tgt.a0z=.15;tgt.a1z=-.15;tgt.e0=tgt.e1=-.15;tgt.sy=.25;tgt.hd=-.1;tgt.hy=-.15;tgt.lean=-.04;}},
  // bow: one hand on the chest, the other behind the back
  gbow:{t:1.8,go(k,tgt){const b=Math.sin(Math.min(1,k/1.6)*Math.PI);tgt.lean=b*.6;tgt.bob=-b*.04;tgt.a0x=-.9;tgt.a0z=.45;tgt.e0=-1.6;tgt.a1x=.5;tgt.a1z=-.1;tgt.e1=-1.2;
    tgt.l0=tgt.l1=0;tgt.k0=tgt.k1=0;}},
  // spin: a quick turn that ends pointing up
  spin:{t:1.4,go(k,tgt){const u=dEase(k/.9);tgt.spin=u*Math.PI*2;tgt.a0z=-.5;tgt.a1z=.5+(k>.9?1.9:0);tgt.a0x=tgt.a1x=0;tgt.e0=-.8;tgt.e1=k>.9?0:-.8;tgt.bob=-.03;}},
  // flex: show off both arms
  flex:{t:2,go(k,tgt){const p=Math.sin(Math.min(k,1.8)*8)*.08;tgt.a0z=-1.5;tgt.a0y=-1.7-p;tgt.a1z=1.5;tgt.a1y=1.7+p;tgt.e0=tgt.e1=0;tgt.a0x=tgt.a1x=0;
    tgt.l0z=-.12;tgt.l1z=.12;tgt.bob=-.04;tgt.lean=-.05;tgt.hd=Math.sin(k*3)*.06;}}};

// girls' move -> guys' move
const GUY_MOVES={pose:'coolpose',kiss:'guns',bow:'gbow',twirl:'spin'};

// walking the runway: girls put one foot in front of the other with swinging hips, guys stride with their shoulders
function runwayWalk(a,tgt,sp){const s=Math.sin(a.phase),k=Math.min(1,sp);
  if(a.guy){tgt.st=-s*.16*k;tgt.sy=s*.05*k;tgt.a0x*=1.35;tgt.a1x*=1.35;tgt.a0z=-.2;tgt.a1z=.2;tgt.e0=tgt.e1=-.4;tgt.lean=-.05;tgt.l0z=-.04;tgt.l1z=.04;tgt.hd=0;tgt.hy=0;return;}
  tgt.l0z=.08*k;tgt.l1z=-.08*k;tgt.hr=s*.09*k;tgt.hx=s*.025*k;tgt.sy=s*.12*k;tgt.st=-s*.06*k;tgt.a0x*=.6;tgt.a1x*=.6;tgt.a0z=-.16;tgt.a1z=.16;tgt.e0=tgt.e1=-.25;tgt.lean=-.03;tgt.hd=-s*.03;}
