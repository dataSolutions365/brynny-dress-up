/* ================= 🏈 FOOTBALL on the shared ⚽🏈 field (26h-soccer.js builds the field) =================
   Football and soccer share one field in the Sports Park: the soccer goals have football uprights on top (SOC.UH), so
   field goals go over the soccer crossbar and between the uprights. This file paints the football markings on the grass
   (see-through, so the soccer lines still show), adds the wind ribbons on the uprights, the orange pylons, the chain
   crew's markers and the 🏈 pad on the island-side touchline (the ⚽ pad is its mirror image).
   - Football space (FTZ): z runs along the field (the soccer field's x), x across it, the goal posts are at z = ±FTF.HL,
     the goal lines at ±FTF.GL (3-step end zones), one yard is FTF.Y. Your team always drives toward -z.
     FTZ.toLocal/toWorld change between it and the world, FTZ.g holds the players and the ball, FTZ.rot turns its facings
     into world facings. The games are in 26i2-football-games.js. */
const FTF={HW:SOC.FW,HL:SOC.FL,EZ:3,Y:.3,PW:SOC.GW*2,BAR:SOC.GH,TOP:SOC.UH};
FTF.GL=FTF.HL-FTF.EZ;
const FTZ={zone:Z.soccer,g:new THREE.Group(),rot:Z.soccer.rot+Math.PI/2};
// football z is the soccer field's x, football x is minus the soccer field's z (so +x is the far, bleachers side)
FTZ.g.rotation.y=Math.PI/2;Z.soccer.g.add(FTZ.g);
FTZ.toLocal=(x,z)=>{const [sx,sz]=Z.soccer.toLocal(x,z);return [-sz,sx];};
FTZ.toWorld=(lx,lz)=>Z.soccer.toWorld(lz,-lx);
// the yard line (0 at your own goal line, 100 at the far one) at a spot along the field, and back
const ftYd=z=>Math.round((FTF.GL-z)/FTF.Y);
const ftZ=yd=>FTF.GL-yd*FTF.Y;
// the soccer scoreboard shows the football score while you play
FTZ.board={draw(us,them,mid,low){try{Z.soccer.board.draw(us===''?'-':us,them===''?'-':them,mid||low||'EAGLES · BEARS');}catch(e){}}};

/* ---------- 🏈 the football markings: yard lines, hash marks, numbers and the end zones, painted over the soccer grass ---------- */
{const g=FTZ.g,F=FTF,AW=F.HW,AL=F.HL,K=LITE?20:28;
  const tex=canvasTex(Math.round(AW*2*K),Math.round(AL*2*K),(x,w,h)=>{const px=v=>(v+AW)*K,pz=v=>(v+AL)*K;x.clearRect(0,0,w,h);
    // a light wash of team colour in each end zone, with the team names
    const ez=(z0,z1,col,txt,flip)=>{x.fillStyle=col;x.fillRect(0,pz(Math.min(z0,z1)),w,Math.abs(z1-z0)*K);
      x.save();x.translate(px(0),pz((z0+z1)/2));x.rotate(flip?Math.PI:0);x.fillStyle='rgba(255,255,255,.5)';x.font=`700 ${K*1.5}px Fredoka, Arial, sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,0,0);x.restore();};
    ez(F.GL,F.HL,'rgba(40,96,200,.2)','EAGLES',true);ez(-F.HL,-F.GL,'rgba(214,40,56,.18)','BEARS',false);// both read the right way up from the middle
    x.strokeStyle='rgba(255,255,255,.55)';x.fillStyle='rgba(255,255,255,.55)';
    // the goal lines a bit stronger, then every 5 yards (the 50 is the soccer halfway line)
    for(let yd=0;yd<=100;yd+=5){if(yd===50)continue;x.lineWidth=K*(yd%100===0?.14:.06);x.beginPath();x.moveTo(0,pz(ftZ(yd)));x.lineTo(w,pz(ftZ(yd)));x.stroke();}
    // hash marks every yard along both touchlines and the two middle rows
    x.lineWidth=K*.04;for(let yd=1;yd<100;yd++){if(yd%5===0)continue;const zz=pz(ftZ(yd));
      for(const [a,b] of [[-F.HW+.15,-F.HW+.5],[F.HW-.5,F.HW-.15],[-1.9,-1.55],[1.55,1.9]]){x.beginPath();x.moveTo(px(a),zz);x.lineTo(px(b),zz);x.stroke();}}
    // yard numbers, upright for someone standing on that touchline
    x.font=`700 ${K*.9}px Arial, sans-serif`;x.textAlign='center';x.textBaseline='middle';
    for(let yd=10;yd<100;yd+=10){if(yd===50)continue;const n=String(yd>50?100-yd:yd),zz=pz(ftZ(yd));
      for(const s of [-1,1]){x.save();x.translate(px(s*(F.HW-2)),zz);x.rotate(s*Math.PI/2);x.fillText(n,0,0);x.restore();}}});
  tex.anisotropy=8;
  const m=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false});m.polygonOffset=true;m.polygonOffsetFactor=-3;m.polygonOffsetUnits=-3;
  M(new THREE.PlaneGeometry(AW*2,AL*2),m,0,.016,0,g,false,false).rotation.x=-Math.PI/2;}

/* ---------- pylons, wind ribbons, the chain crew's markers ---------- */
const FTM={orange:std('#ff6a1f',{roughness:.6}),dark:std('#2d3038',{roughness:.6,metalness:.3}),ribbon:std('#e8334a',{roughness:.8,side:THREE.DoubleSide})};
FTZ.ribbons=[];
{const g=FTZ.g,F=FTF;
  for(const zz of [F.GL,-F.GL])for(const sx of [-1,1])M(box(.1,.4,.1),FTM.orange,sx*(F.HW+.05),.2,zz,g);
  // wind ribbons on top of the uprights (the field goal game turns them with the wind)
  for(const s of [-1,1])for(const sx of [-1,1]){const rb=M(new THREE.PlaneGeometry(.06,.7).translate(0,-.35,0),FTM.ribbon,sx*F.PW/2,F.TOP,s*F.HL,g,false,false);rb.rotation.x=Math.PI/2;FTZ.ribbons.push(rb);}
  // the TV lines (blue: the line of scrimmage, yellow: the first down), only while you play
  const lineMat=c=>{const m=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.85,depthWrite:false});m.polygonOffset=true;m.polygonOffsetFactor=-4;m.polygonOffsetUnits=-4;return m;};
  const mk=c=>{const m=M(new THREE.PlaneGeometry(F.HW*2,.1),lineMat(c),0,.04,0,g,false,false);m.rotation.x=-Math.PI/2;m.visible=false;return m;};
  FTZ.losLine=mk('#2f8cff');FTZ.fdLine=mk('#ffe23a');
  // the down marker (a pole with a flip number) and the two chain poles, on the far touchline
  const pole=top=>{const p=new THREE.Group();M(cyl(.025,.025,1.7,8),FTM.dark,0,.85,0,p);p.add(top);g.add(p);p.position.set(F.HW+.55,0,0);p.visible=false;return p;};
  const flip=canvasTex(128,128,()=>{});FTZ.downTex=flip;
  const dn=new THREE.Group();M(box(.36,.36,.36),new THREE.MeshStandardMaterial({map:flip,roughness:.6}),0,1.85,0,dn);
  const tip=()=>{const t=new THREE.Group();M(box(.26,.12,.12),FTM.orange,0,1.72,0,t);return t;};
  FTZ.downPole=pole(dn);FTZ.chain=[pole(tip()),pole(tip())];
  FTZ.setDown=n=>{const c=flip.image.getContext('2d');c.fillStyle='#ff6a1f';c.fillRect(0,0,128,128);c.fillStyle='#ffffff';c.font='700 96px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(n),64,70);flip.needsUpdate=true;};
  FTZ.setDown(1);
  // los: line of scrimmage, fd: first-down line (null hides it), on: show or hide
  FTZ.marks=(on,los,fd)=>{FTZ.losLine.visible=FTZ.downPole.visible=!!on;FTZ.fdLine.visible=FTZ.chain[0].visible=FTZ.chain[1].visible=!!on&&fd!=null;
    if(!on)return;FTZ.losLine.position.z=los;FTZ.downPole.position.z=los;if(fd!=null){FTZ.fdLine.position.z=fd;FTZ.chain[1].position.z=fd;FTZ.chain[0].position.z=fd+(fd<los?10:-10)*F.Y;}};}

/* ---------- the 🏈 pad: on the island-side touchline, the mirror image of the ⚽ pad ---------- */
{const [x,z]=Z.soccer.toWorld(-Z.soccer.pad.lx,Z.soccer.pad.lz),[lx,lz]=FTZ.toLocal(x,z);
  FTZ.pad=spPad(FTZ,lx,lz,'#ff8a1f','🏈','🏈 Play football!','#c0450f');}
