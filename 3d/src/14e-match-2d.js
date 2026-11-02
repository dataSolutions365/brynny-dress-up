/* ================= MATCH THE 2D STUDIO =================
   Everything you can wear in the 2D studio (index.html) can be worn here too, with the same ids, so a look matches
   in both games. This adds the hair styles only 2D had, and gives guys the 2D things guys can wear there
   (the 2D guy list is GUY_OK in index.html). The 2D Candy bucket and Bat wings are the Treat bucket and Bat wings
   here, and 2D Face gems are the gems in the makeup studio.
   Hair builders go in GUY_HAIR because the avatar runs GUY_HAIR[id] for any hair id, girl or guy. */
Object.assign(GUY_HAIR,{
  wavy({hang,glam}){hang(glam?.5:.34,.07,glam?.185:.175,false);},
  highbun({P,m,head,cap}){cap.scale.set(1.05,1.12,1.07);const b=P(sph(.07,20,16),m,head,0,.2,-.03);b.scale.set(1,.9,1);
    const t=P(new THREE.TorusGeometry(.05,.014,8,24),m,head,0,.17,-.03);t.rotation.x=Math.PI/2;},
  superlong({hang,glam}){hang(glam?.85:.62,.02,glam?.172:.165,false);},
  hime({P,m,head,side,glam}){side(.15,.162,.34,-.1,1.05,-.012);
    const b=P(new THREE.CylinderGeometry(.152,.156,.075,32,1,true,-1.05,2.1),m,head,0,.085,-.008);b.material.side=THREE.DoubleSide;
    for(const s of [-1,1]){const l=P(capTop(.016,glam?.15:.12),m,head,s*.112,.06,.07);l.scale.set(1.3,1,.5);}},
  streaks({P,mat,head,hang,glam}){hang(glam?.6:.4,.02,glam?.172:.165,false);const pm=mat('#ff6fae','hair');
    for(const s of [-1,1])for(const dx of [.03,.07]){const t=P(capTop(.012,glam?.5:.36),pm,head,s*(.12+dx*.35),.02,.04-dx*.6);t.rotation.z=s*.05;}},
  boxbraids({P,m,head,cap,glam,HL}){cap.scale.set(1.04,1.1,1.06);const n=18,len=(glam?.62:.46)*HL;
    for(let i=0;i<n;i++){const a=1.15+i/(n-1)*(Math.PI*2-2.3);const t=P(capTop(.014,len),m,head,Math.sin(a)*.15,.03,Math.cos(a)*.15-.025);t.rotation.z=Math.sin(a)*.08;}},
  bigcurls({hang,glam}){hang(glam?.52:.36,.12,glam?.2:.19,true);},
  halfup({P,m,head,hang,glam}){hang(glam?.55:.38,.03,glam?.172:.165,false);P(sph(.038,14,12),m,head,0,.1,-.15);},
  locs({P,m,head,cap,glam,HL}){cap.scale.set(1.04,1.1,1.06);const n=22,len=(glam?.5:.38)*HL;
    for(let i=0;i<n;i++){const a=1.1+i/(n-1)*(Math.PI*2-2.2),r=.018+(i%3)*.002;const t=P(capTop(r,len*(.85+(i%4)*.06)),m,head,Math.sin(a)*.152,.04,Math.cos(a)*.152-.025);t.rotation.z=Math.sin(a)*.1;}}
});
// girls: the 2D hair styles (afro was a guy cut here; in 2D both can have it)
HAIRS.push(['wavy','🌊','Wavy'],['highbun','🩰','Ballerina bun'],['superlong','💇‍♀️','Extra long'],['hime','✂️','Blunt bangs'],['streaks','💗','Pink streaks'],
  ['boxbraids','🧶','Long braids'],['bigcurls','🌀','Big curls'],['afro','✊','Afro'],['halfup','🎀','Half-up'],['locs','🪢','Locs']);
// guys: the 2D things guys can wear there, using the girl closet's 3D pieces
{const from=(list,ids)=>ids.map(id=>list.find(x=>x[0]===id)).filter(Boolean);
  GUY_HAIRS.push(['pixie','💇','Short'],['curly','🌀','Curly'],['locs','🪢','Locs']);
  GUY_TOPS.push(...from(TOPS,['startee','sweater','xmas','moto','turtleneck','blazer','military']));
  GUY_BOTTOMS.push(...from(BOTTOMS,['jeans','shorts','athshorts','joggers','cargo','skinny']));
  GUY_OUTFITS.push(...from(DRESSES,['werewolf','mummy','zombie','spacepup','pajamas','jumpsuit']));
  GUY_SHOES.push(...from(SHOES,['sneaker','boots','rain','snowboots','skates','paws','chunkyboots','sandals']));
  GUY_HATS.push(...from(HATS,['crown','witchhat','santahat','party','sunhat','pupears','wolfears','mummywrap']));
  GUY_EXTRAS.push(...from(EXTRAS,['wand','present','ball','vampcape','lei']));}
// for 3d/tests/closets-match.mjs: every list of things to wear, read when it runs (holiday things are added by seasons.js)
addEventListener('load',()=>{if(window.__game)window.__game.closets=()=>({hairs:HAIRS.map(x=>x[0]),guyHairs:GUY_HAIRS.map(x=>x[0]),
  cat:Object.fromEntries(Object.entries(CAT).map(([k,l])=>[k,l.map(x=>x[0])])),guy:Object.fromEntries(Object.entries(GUY_CAT).map(([k,l])=>[k,l.map(x=>x[0])])),
  store:Object.fromEntries(Object.entries(STORE_CAT).map(([k,l])=>[k,l.map(x=>x[0])])),
  holiday:SHOP.filter(s=>s.hol&&s.k.startsWith('look:')).map(s=>s.k.slice(5)),girlOnly:[...GIRL_ONLY]});});
