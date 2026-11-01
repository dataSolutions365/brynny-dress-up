/* ================= DANCE LIST ================= */
// Tapping Dance opens a list of dances to pick from (the dances themselves are in 14d-dances.js).
// Your last dance is marked so it's easy to do it again. Friends nearby join in with the same dance.
let lastDance=SAVE.lastDance||'dance';
function renderDances(){const G=isGuy(SAVE.look);$('#dancesT').textContent=(G?'🕺':'💃')+' Pick a dance';
  $('#danceList').innerHTML=DANCES.map(d=>`<button data-dance="${d[0]}" class="${d[0]===lastDance?'last':''}">${d[0]==='dance'&&G?'🕺':d[1]}<span>${d[2]}</span></button>`).join('');}
function openDances(){if(closetOpen||!started)return;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';renderDances();$('#dances').classList.add('show');sfx('pop');}
function closeDances(){$('#dances').classList.remove('show');}
$('#danceList').addEventListener('click',e=>{const b=e.target.closest('[data-dance]');if(!b)return;const id=b.dataset.dance;
  lastDance=SAVE.lastDance=id;persist();closeDances();doAction(id,true);});
$('#dancesClose').onclick=closeDances;
$('#dances').onclick=e=>{if(e.target.id==='dances')closeDances();};
