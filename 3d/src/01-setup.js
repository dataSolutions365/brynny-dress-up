import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const $=s=>document.querySelector(s);
const canvas=$('#c');
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;

/* ---------- save ---------- */
const SAVE_KEY='brynny3d.v1';
let SAVE={};
try{SAVE=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{};}catch(e){SAVE={};}
const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){}};
// tell the star challenges (challenges.js) when you do something
const did=(k,a)=>{try{dispatchEvent(new CustomEvent('brynny:did',{detail:{k,a}}));}catch(e){}};

/* ---------- catalog (same ideas as the 2D studio) ---------- */
const SKIN=['#ffe3cc','#f7cfae','#e6c49a','#eab38c','#c8a072','#d49a6a','#b97a4f','#8d5a3b','#6b4128','#4a2c1c'];
const HAIRC=['#2b1d16','#4a2c1a','#7a4a2a','#a0441f','#d9a35a','#f3e2a9','#ff7eb6','#b388ff','#4fb6ff','#2ec4b6','#ff5a5a','#f4f4f4'];
const EYES=['#6b4a2b','#3d2a1a','#3f7fbf','#4f9a5a','#8a6a3a','#7a5cc8','#6a7a8a'];
const COLORS=['#ff6fae','#ff3b6b','#c2185b','#ffb3d1','#ff8a1f','#ffd23f','#7ee081','#2fd1c5','#4fb6ff','#3a5bd9','#8e6cff','#b388ff','#ffffff','#2d2d3a','#d4af37','#c0c0c0','#cfefff','#8a5a3b'];
const HAIRS=[['long','💁‍♀️','Long'],['ponytail','🎀','Ponytail'],['buns','🍡','Space buns'],['bob','👧','Bob'],['pigtails','👯','Pigtails'],['curly','🌀','Big curls'],['braids','🪢','Braids'],['afropuff','☁️','Afro puff'],['pixie','✂️','Short'],['updo','👰','Updo'],['waves','🌊','Beach waves'],['sidebraid','🧜‍♀️','Side braid'],['highpony','💫','High pony']];
const SALON=new Set(['updo','waves','sidebraid','highpony']);
const TOPS=[['tee','👕','T-shirt','#ff6fae'],['startee','⭐','Star tee','#4fb6ff'],['hearttee','💖','Heart tee','#ffffff'],['tank','🎽','Tank top','#7ee081'],['sweater','🧶','Sweater','#ffb3d1'],['hoodie','🧥','Hoodie','#8e6cff'],['jacket','🧥','Jean jacket','#5b8fd6'],['sequin','✨','Sparkle top','#d4af37'],['furcoat','🧸','Fluffy coat','#f2e6d8'],
  // from the 2D game
  ['xmas','🎄','Holiday sweater','#d62839'],['blouse','👚','Blouse','#ffffff'],['jersey','🏀','Sports jersey','#4fb6ff'],['ruffle','🎀','Ruffle top','#ff8fc8'],['moto','🖤','Moto jacket','#2d2d3a'],['varsity','🏈','Varsity jacket','#d62839'],['cheertop','📣','Cheer top','#ff4d8d'],
  ['turtleneck','🧣','Turtleneck','#2d2d3a'],['blazer','💼','Blazer','#ff6fae'],['military','🎖️','Military coat','#f5f1e6'],['furshrug','☁️','Fur shrug top','#ffffff'],['graphiccrop','🐱','Graphic crop tee','#ff9ccf'],['corset','✨','Silver corset','#d6d9e2']];
const BOTTOMS=[['jeans','👖','Jeans','#3a5bd9'],['leggings','🦵','Leggings','#2d2d3a'],['shorts','🩳','Shorts','#5b8fd6'],['skirt','🌸','Skirt','#ff6fae'],['tutu','🩰','Tutu','#ffb3d1'],['maxi','🌷','Long skirt','#b388ff'],
  // from the 2D game
  ['athshorts','🏃','Sport shorts','#2d2d3a'],['tennisskirt','🎾','Pleated skirt','#ffffff'],['flares','🌼','Flare jeans','#7aa2ff'],['joggers','👟','Joggers','#b388ff'],['suede','🤎','Suede skirt','#c68642'],['skinny','🤍','White jeans','#ffffff'],['silvermini','🪩','Metallic mini','#d6d9e2'],['furskirt','🧁','Fluffy skirt','#ffb3d1'],['cargo','⛓️','Chain cargo pants','#5b4a8a']];
const DRESSES=[['gown','👸','Princess gown','#ff8fc8'],['party','🎉','Party dress','#4fb6ff'],['wedding','💍','Wedding gown','#ffffff'],['stargown','🌌','Starry gown','#3b2fa0'],['mermaid','🧜‍♀️','Mermaid gown','#2fd1c5'],['sundress','🌻','Sundress','#ffd23f'],['witch','🧙‍♀️','Witch dress','#5b2a86'],['santa','🎅','Santa dress','#e0263b'],['fairy','🧚','Fairy dress','#7ee081'],['ballerina','🩰','Ballerina','#ffb3d1'],
  // from the 2D game
  ['leotard','🤸','Gymnast','#8e6cff'],['cheer','📣','Cheer outfit','#ff4d8d'],['tennis','🎾','Tennis dress','#ffffff'],['swimsuit','🩱','Swimsuit','#2fd1c5'],['minidress','✨','Sequin dress','#ffd23f'],['jumpsuit','👖','Jumpsuit','#ff6f61'],
  ['pajamas','🌙','Pajamas','#b388ff'],['redcarpet','🌹','Red carpet gown','#c2185b'],['spacepup','🐶','Space pup suit','#3f7fd9'],['island','🌺','Island dress','#d62839'],['vampire','🧛','Vampire gown','#2d2d3a'],['werewolf','🐺','Werewolf','#7a5230'],
  ['mummy','🧻','Mummy wraps','#efe6cf'],['zombie','🧟','Zombie rags','#6b7d3a'],['redtulle','💃','Red tulle gown','#d7263d'],['catsuit','🦹','Denim catsuit','#2d2d3a']];
const SHOES=[['sneaker','👟','Sneakers','#ffffff'],['boots','👢','Boots','#8a5a3b'],['heels','👠','Heels','#ff3b6b'],['glass','💎','Glass slippers','#cfefff'],['rain','☔','Rain boots','#ffd23f'],['skates','🛼','Roller skates','#ff6fae'],['flats','🥿','Ballet flats','#ffb3d1'],['platforms','👡','Platform heels','#1d1a1f'],['furboots','☁️','Fluffy boots','#f4eadf'],['sandals','🩴','Sandals','#ffd23f']];
const HATS=[['tiara','💎','Tiara','#ffd23f'],['crown','👑','Crown','#d4af37'],['witchhat','🧙','Witch hat','#2d2d3a'],['catears','🐱','Cat ears','#2d2d3a'],['bunny','🐰','Bunny ears','#ffffff'],['santahat','🎅','Santa hat','#e0263b'],['party','🥳','Party hat','#4fb6ff'],['cap','🧢','Ball cap','#ff3b6b'],['flowers','🌼','Flower crown','#ff6fae'],['bow','🎀','Big bow','#ff3b6b']];
const EXTRAS=[['wings','🧚','Fairy wings','#b388ff'],['cape','🦸','Cape','#e0263b'],['purse','👛','Purse','#ff6fae'],['wand','🪄','Magic wand','#ffd23f'],['glasses','👓','Glasses','#2d2d3a'],['pearls','📿','Pearls','#ffffff'],['scarf','🧣','Scarf','#ff3b6b'],['unicorn','🦄','Unicorn horn','#ffb3e6'],['halo','😇','Halo','#ffd23f'],['balloon','🎈','Balloon','#ff3b6b']];
const CAT={tops:TOPS,bottoms:BOTTOMS,dresses:DRESSES,shoes:SHOES,hats:HATS,extras:EXTRAS};
const KEY={tops:'top',bottoms:'bottom',dresses:'dress',shoes:'shoes',hats:'hat'};
// things you can buy in the shop with coins (everything else stays free)
const SHOP=[
  {k:'look:stargown',tab:'outfits',e:'🌌',n:'Starry gown',p:120,d:'A night-sky gown that sparkles with little stars.'},
  {k:'look:unicorn',tab:'outfits',e:'🦄',n:'Unicorn horn',p:60,d:'A sparkly horn. Find it in Extras.'},
  {k:'look:halo',tab:'outfits',e:'😇',n:'Halo',p:40,d:'A glowing halo that floats over your head. Find it in Extras.'},
  {k:'look:balloon',tab:'outfits',e:'🎈',n:'Balloon',p:30,d:'A shiny balloon to carry around town. Find it in Extras.'},
  {k:'pet:unicorn',tab:'pets',e:'🦄',n:'Pet unicorn horn',p:60,d:'Turn your pet into a unicorn! Find it in the Pet Parlor hats.'},
  {k:'pet:halo',tab:'pets',e:'😇',n:'Pet halo',p:40,d:'A little glowing halo for your pet.'},
  {k:'treat:🧁',tab:'pets',e:'🧁',n:'Cupcake',p:25,d:'A super yummy treat for your pet. Buy it once, feed it forever!'},
  {k:'treat:🍦',tab:'pets',e:'🍦',n:'Ice cream',p:25,d:'A cold, sweet treat for your pet. Buy it once, feed it forever!'},
  {k:'treat:🎂',tab:'pets',e:'🎂',n:'Party cake',p:40,d:'Fills the tummy all the way! Buy it once, feed it forever.'},
  {k:'colors:pastel',tab:'colors',e:'🍬',n:'Pastel colors',p:50,d:'Soft candy colors for clothes, hair and pet outfits.',c:['#ffd1dc','#ffe5b4','#fffacd','#d4f5d4','#cdeffd','#e6d6ff','#ffd8f0']},
  {k:'colors:neon',tab:'colors',e:'⚡',n:'Neon colors',p:50,d:'Super bright colors that pop!',c:['#ff00a8','#ff5e00','#e6ff00','#39ff14','#00f0ff','#7a00ff']},
  {k:'colors:jewel',tab:'colors',e:'💎',n:'Jewel colors',p:60,d:'Deep fancy colors like gems.',c:['#9b111e','#0f52ba','#50c878','#9966cc','#e0115f','#0b6e6e','#b76e79']},
  {k:'move:fireworks',tab:'moves',e:'🎆',n:'Fireworks',lab:'Boom',p:40,d:'A new move: fireworks pop in the sky!'},
  {k:'move:hearts',tab:'moves',e:'💕',n:'Heart shower',lab:'Hearts',p:30,d:'A new move: hearts float all around you.'},
  {k:'move:rainbow',tab:'moves',e:'🌈',n:'Rainbow spin',lab:'Rainbow',p:50,d:'A new move: spin in a swirl of rainbow sparkles.'},
  {k:'move:bubbles',tab:'moves',e:'🫧',n:'Bubble dance',lab:'Bubbles',p:30,d:'A new move: dance in a cloud of bubbles.'}];
const shopItem=k=>SHOP.find(s=>s.k===k);
const owns=k=>!!(SAVE.owned&&SAVE.owned[k]);
const locked=k=>!!shopItem(k)&&!owns(k);
// holiday things (s.hol) only show up during their holiday, unless you already bought them
const seasonOn=h=>!!(window.__season&&window.__season.on(h));
const offSeason=k=>{const s=shopItem(k);return !!(s&&s.hol&&!owns(k)&&!seasonOn(s.hol));};
const inSeason=list=>list.filter(x=>!offSeason('look:'+x[0]));
const myColors=base=>base.concat(...SHOP.filter(s=>s.c&&owns(s.k)).map(s=>s.c));
const TREATS=[['🧁','Cupcake'],['🍦','Ice cream'],['🎂','Party cake']],TREAT_FOOD={'🧁':40,'🍦':40,'🎂':100};
let shopOpen=false;
const defaultLook=()=>({style:'glam',skin:'#f7cfae',eyes:'#6b4a2b',hair:{id:'long',c:'#7a4a2a'},top:null,bottom:null,dress:{id:'gown',c:'#ff8fc8'},shoes:{id:'glass',c:'#cfefff'},hat:{id:'tiara',c:'#ffd23f'},extras:{}});

/* ---------- seeded random ---------- */
let seed=20261031;const rand=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
const pick=a=>a[Math.floor(rand()*a.length)];
const rnd=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- renderer ---------- */
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
const PR_MAX=Math.min(devicePixelRatio,isTouch?1.75:2),PR_MIN=Math.min(PR_MAX,1);let prNow=PR_MAX,slowT=0;
renderer.setPixelRatio(PR_MAX);
// If the game keeps running slowly (an older phone, or one that has warmed up), draw the picture a little less sharp
// so it stays smooth. Short hiccups don't count, only being slow for a couple of seconds in a row.
function adaptRes(raw){if(raw>.25||prNow<=PR_MIN)return;if(raw>1/40)slowT+=raw;else slowT=Math.max(0,slowT-raw*.5);
  if(slowT>2){prNow=Math.max(PR_MIN,prNow-.25);slowT=0;renderer.setPixelRatio(prNow);renderer.setSize(innerWidth,innerHeight,false);}}
renderer.setSize(innerWidth,innerHeight,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();
const FOG=new THREE.Color('#ffe3ef');
scene.fog=new THREE.Fog(FOG,55,170);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,700);

/* sky */
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color('#3f8fe8')},mid:{value:new THREE.Color('#9fd2ff')},bot:{value:FOG.clone()}},
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=mix(mid,top,smoothstep(.0,.7,h));c=mix(bot,c,smoothstep(-.02,.22,h));gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(500,32,16),skyMat);sky.renderOrder=-1;scene.add(sky);

/* light from the sky for realistic reflections */
{const pm=new THREE.PMREMGenerator(renderer);const env=new THREE.Scene();
 env.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),skyMat));
 const gnd=new THREE.Mesh(new THREE.CircleGeometry(48,32),new THREE.MeshBasicMaterial({color:'#b3a88f'}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-2;env.add(gnd);
 const sunBall=new THREE.Mesh(new THREE.SphereGeometry(5,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(8,7.5,6.5)}));sunBall.position.set(25,35,18);env.add(sunBall);
 scene.environment=pm.fromScene(env,.02).texture;pm.dispose();}

const hemi=new THREE.HemisphereLight('#dff0ff','#7a6a55',.55);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2e2',2.6);
sun.castShadow=true;const SM=isTouch?1024:2048;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:70});
sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
scene.add(sun,sun.target);
const SUN_OFF=new THREE.Vector3(14,26,10);

/* ---------- helpers ---------- */
const anims=[];// functions (t,dt)
const obs=[];// {x,z,r} things you bump into
const std=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...o});
const phys=(color,o={})=>new THREE.MeshPhysicalMaterial({color,roughness:.6,...o});
const glow=(color,k=2)=>new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(k),toneMapped:false});
function M(geo,mat,x=0,y=0,z=0,parent=scene,cast=true,recv=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=recv;parent.add(m);return m;}
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const cyl=(rt,rb,h,s=20)=>new THREE.CylinderGeometry(rt,rb,h,s);
const sph=(r,w=20,h=14)=>new THREE.SphereGeometry(r,w,h);
function fuzz(g,amt=.012,freq=90){g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const h=Math.sin(x*freq*1.3+Math.sin(y*freq*.7))*Math.sin(y*freq+z*freq*.9)*Math.cos(z*freq*1.1-x*freq*.5);const d=amt*(.55+.45*h);p.setXYZ(i,x+n.getX(i)*d,y+n.getY(i)*d,z+n.getZ(i)*d);}g.computeVertexNormals();return g;}
const capTop=(r,len)=>{const g=new THREE.CapsuleGeometry(r,len,6,14);g.translate(0,-(len/2+r),0);return g;};
function canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);}return t;}
function noiseTex(base,spots,n=5000,repeat=1,size=3){return canvasTex(256,256,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=spots(i);const s=1+Math.random()*size;x.fillRect(Math.random()*w,Math.random()*h,s*.7,s);}},repeat);}
function roundRect(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();}
function labelTex(text,{w=512,h=128,bg='#ffffff',fg='#ff4d8d',size=64,border='#ffd6ea'}={}){return canvasTex(w,h,(x)=>{if(bg){x.fillStyle=bg;roundRect(x,6,6,w-12,h-12,h/2.6);x.fill();if(border){x.lineWidth=8;x.strokeStyle=border;x.stroke();}}x.fillStyle=fg;x.font=`700 ${size}px Fredoka, "Trebuchet MS", sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+4);});}
function sprite(tex,w,h){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false,transparent:true}));s.scale.set(w,h,1);return s;}
const TEX={
  grass:noiseTex('#6cb84a',()=>{const g=130+Math.random()*80|0;return `rgba(${50+Math.random()*50|0},${g},${30+Math.random()*30|0},.55)`;},9000,30,4),
  sand:noiseTex('#f1d9a6',()=>Math.random()<.5?'rgba(255,240,210,.6)':'rgba(190,150,100,.35)',7000,8,2),
  stone:canvasTex(256,256,(x,w,h)=>{x.fillStyle='#b8a48e';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.fillStyle=`hsl(${25+Math.random()*12},${22+Math.random()*12}%,${66+Math.random()*8}%)`;roundRect(x,c*64+3+(r%2)*10,r*64+3,58,58,10);x.fill();}},6),
  denim:noiseTex('#d8d8d8',()=>Math.random()<.5?'rgba(255,255,255,.5)':'rgba(90,90,110,.35)',6000,3,2),
  fur:noiseTex('#d8d8d8',()=>Math.random()<.5?'rgba(255,255,255,.9)':'rgba(120,120,120,.55)',14000,3,5),
  glitter:noiseTex('#e8e8e8',()=>Math.random()<.3?'rgba(255,255,255,1)':'rgba(150,150,150,.6)',4000,4,1.5),
  snow:noiseTex('#f4f8ff',()=>Math.random()<.5?'rgba(255,255,255,.9)':'rgba(200,215,240,.5)',5000,6,2),
  party:canvasTex(256,256,(x,w,h)=>{const c=['#ffd6ea','#fff4fa'];for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=c[(i+j)%2];x.fillRect(i*32,j*32,32,32);}},10),
  stripes:canvasTex(64,64,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,64,64);x.fillStyle='#c8c8c8';for(let i=0;i<4;i++)x.fillRect(i*16,0,8,64);}),
};
const groundMat=std('#ffffff',{map:TEX.grass,roughness:.95});

