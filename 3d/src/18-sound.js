/* ================= SOUND ================= */
let AC=null;function ac(){if(!AC)try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}return AC;}
function tone(f,dur,type='sine',vol=.15,when=0,slide){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,a.currentTime+when);if(slide)o.frequency.exponentialRampToValueAtTime(slide,a.currentTime+when+dur);g.gain.setValueAtTime(0,a.currentTime+when);g.gain.linearRampToValueAtTime(vol,a.currentTime+when+.01);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+when+dur);o.connect(g).connect(a.destination);o.start(a.currentTime+when);o.stop(a.currentTime+when+dur+.05);}
function sfx(k){if(k==='star'){tone(988,.15,'triangle',.18);tone(1319,.25,'triangle',.18,.08);tone(1760,.3,'sine',.12,.16);}
  if(k==='jump')tone(330,.18,'sine',.1,0,660);if(k==='pop')tone(660,.08,'triangle',.12);if(k==='bubble')tone(700+Math.random()*500,.07,'sine',.07,0,1500);if(k==='splash')tone(380,.14,'sine',.05,0,140);if(k==='blow')tone(200,.12,'sawtooth',.02,0,260);if(k==='munch'){tone(160,.06,'square',.05);tone(130,.06,'square',.05,.12);}if(k==='brush')tone(1300,.1,'sine',.07,0,1900);if(k==='tada'){[523,659,784,1047].forEach((f,i)=>tone(f,.4,'triangle',.15,i*.1));}}
const music=new Audio();music.loop=true;music.volume=.45;let musicOn=SAVE.music!==false,curTrack='';
const sndCam=new Audio('../audio/camera.mp3'),sndCheer=new Audio('../audio/stadium-cheer.mp3');sndCheer.volume=.5;
/* ---- your own songs: saved in this browser with IndexedDB ---- */
let myMode=SAVE.musicMode==='mine',mySongs=[],myIdx=-1,myUrl='';
const songDB=(()=>{let p;const open=()=>p||(p=new Promise((ok,no)=>{if(!window.indexedDB)return no(new Error('no idb'));const r=indexedDB.open('brynny3d-songs',1);r.onupgradeneeded=()=>r.result.createObjectStore('songs',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);}));
  const tx=(mode,fn)=>open().then(db=>new Promise((ok,no)=>{const t=db.transaction('songs',mode);const st=t.objectStore('songs');const r=fn(st);t.oncomplete=()=>ok(r&&r.result);t.onerror=t.onabort=()=>no(t.error);}));
  return{all:()=>tx('readonly',st=>st.getAll()),put:o=>tx('readwrite',st=>st.put(o)),del:id=>tx('readwrite',st=>st.delete(id))};})();
const playingMine=()=>myMode&&mySongs.length>0;
function placeSrc(t){music.loop=true;music.src=`../audio/${t}.mp3`;music.play().catch(()=>{});}
function playMine(i){if(!mySongs.length)return;myIdx=((i%mySongs.length)+mySongs.length)%mySongs.length;if(myUrl)URL.revokeObjectURL(myUrl);myUrl=URL.createObjectURL(mySongs[myIdx].blob);music.loop=mySongs.length===1;music.src=myUrl;music.volume=.45;if(musicOn)music.play().catch(()=>{});renderMusicPanel();}
music.addEventListener('ended',()=>{if(playingMine())playMine(myIdx+1);});
function setTrack(t){if(t===curTrack)return;curTrack=t;if(!musicOn||playingMine())return;const v0=music.volume;let k=0;const fade=setInterval(()=>{k++;music.volume=Math.max(0,v0*(1-k/8));if(k>=8){clearInterval(fade);if(playingMine())return;music.volume=.45;placeSrc(t);}},40);}
function startMusic(){if(!musicOn)return;if(playingMine())playMine(myIdx<0?0:myIdx);else placeSrc(curTrack||'sparkle-room');}
function renderMusicBtn(){$('#musicBtn').classList.toggle('off',!musicOn);}
const escH=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderMusicPanel(){$('#mOnOff').textContent=musicOn?'🔊 Music is on':'🔇 Music is off';$('#mOnOff').classList.toggle('on',musicOn);
  document.querySelectorAll('[data-mmode]').forEach(b=>b.classList.toggle('on',(b.dataset.mmode==='mine')===myMode));
  $('#mNow').textContent=!musicOn?'Turn music on to hear it':playingMine()&&mySongs[myIdx]?'Now playing: '+mySongs[myIdx].name:myMode?'Upload a song to play it here':'Each place plays its own song';
  $('#mList').innerHTML=mySongs.length?mySongs.map((s,i)=>`<li class="${playingMine()&&i===myIdx?'playing':''}"><button data-mplay="${i}" aria-label="Play">${playingMine()&&i===myIdx&&musicOn?'🎶':'▶'}</button><span class="mname">${escH(s.name)}</span><button data-mdel="${i}" aria-label="Delete">🗑️</button></li>`).join(''):'<li class="mempty">No songs yet. Tap ➕ to add one from your device!</li>';}
function setMusicMode(mine){if(mine===myMode)return;myMode=mine;SAVE.musicMode=mine?'mine':'place';persist();if(!musicOn||!started)return renderMusicPanel();if(playingMine())playMine(myIdx<0?0:myIdx);else placeSrc(curTrack||'sparkle-room');renderMusicPanel();}
songDB.all().then(a=>{mySongs=(a||[]).sort((x,y)=>x.added-y.added);if(myMode&&started&&musicOn&&mySongs.length&&!music.src.startsWith('blob:'))playMine(0);renderMusicPanel();}).catch(()=>{});
$('#musicBtn').onclick=()=>{joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';renderMusicPanel();$('#musicM').classList.add('show');};
$('#mClose').onclick=()=>$('#musicM').classList.remove('show');
$('#musicM').onclick=e=>{if(e.target.id==='musicM')$('#musicM').classList.remove('show');};
$('#mOnOff').onclick=()=>{musicOn=!musicOn;SAVE.music=musicOn;persist();renderMusicBtn();if(musicOn){if(started)startMusic();}else music.pause();renderMusicPanel();};
document.querySelectorAll('[data-mmode]').forEach(b=>b.onclick=()=>{if(b.dataset.mmode==='mine'&&!mySongs.length)toast('Upload a song first! ➕');setMusicMode(b.dataset.mmode==='mine');});
$('#mList').onclick=e=>{const p=e.target.closest('[data-mplay]'),d=e.target.closest('[data-mdel]');
  if(p){const i=+p.dataset.mplay;if(!musicOn){musicOn=true;SAVE.music=true;persist();renderMusicBtn();}if(!myMode){myMode=true;SAVE.musicMode='mine';persist();}playMine(i);}
  else if(d){const i=+d.dataset.mdel,s=mySongs[i];if(!s)return;songDB.del(s.id).catch(()=>{});mySongs.splice(i,1);
    if(myIdx===i){if(mySongs.length)playMine(i);else{myIdx=-1;if(myUrl){URL.revokeObjectURL(myUrl);myUrl='';}if(musicOn&&started)placeSrc(curTrack||'sparkle-room');}}else if(myIdx>i)myIdx--;
    toast('Song removed 🗑️');renderMusicPanel();}};
$('#mFile').onchange=async e=>{const files=[...e.target.files];e.target.value='';let added=0,first=-1;
  for(const f of files){if(f.size>40*1024*1024){toast(`"${f.name}" is too big (max 40 MB)`);continue;}
    const o={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:f.name.replace(/\.[^.]+$/,'').slice(0,60)||'My song',blob:f,added:Date.now()+added};
    try{await songDB.put(o);}catch(err){toast('Could not save that song — your device may be out of space');continue;}
    if(first<0)first=mySongs.length;mySongs.push(o);added++;}
  if(!added)return renderMusicPanel();
  toast(added>1?`Added ${added} songs! 💖`:'Song added! 💖');
  if(!musicOn){musicOn=true;SAVE.music=true;persist();renderMusicBtn();}
  if(!myMode){myMode=true;SAVE.musicMode='mine';persist();}
  if(started)playMine(first);else renderMusicPanel();};
renderMusicBtn();

