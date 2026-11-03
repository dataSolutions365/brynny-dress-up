/* ================= 🦖 RIDES FROM THE SHOP: a dino, a winged unicorn, a big fluffy cat and a prize dragon =================
   - Buy them with ⭐ stars in the shop's 🦖 Rides tab (the animals themselves are at the end of FARM in 24d-barn.js, with
     mount = price). The ⭐ are spent like the barn's rare animals and the 🚲 bike.
   - 🐉 Nova the starlight dragon can't be bought: she comes by herself once you've earned 50 ⭐ (prize = how many).
   - Once you have one, tap the ride button in the moves wheel and it pops out right where you are (17d-bicycle.js).
     With more than one ride the button says 🏇 Rides and opens a list to pick from.
   - They live at the 🐴 Happy Barn when you're not riding, so you can feed, brush and rename them there.
   - Friends online see you riding them through the 'ride' entry in 26c-friends-see.js (any barn animal you ride). */
const MOUNTS=FARM.filter(f=>f.mount||f.prize||f.earn);// earn = 🏆 rides you earn by winning or playing days in a row (24i-earned-rides.js)
STABS.splice(1,0,['rides','🦖','Rides']);
SHINT.rides='Your rides pop out wherever you are! Tap 🏇 with your moves to hop on. They live at the 🐴 Happy Barn, and the dinosaurs and unicorn there can be ridden too.';
for(const f of MOUNTS)SHOP.push({k:'mount:'+f.k,tab:'rides',e:f.e,fk:f.k,n:f.n,stars:f.mount,prize:f.prize||(f.earn&&f.earn.goal),earn:f.earn,
  d:f.prize||f.earn?f.about:`${f.about} Once you have ${f.nm}, tap 🏇 with your moves and ${f.nm} pops out wherever you are!`});

// it's yours: it moves into the barn, and the ride button calls it
function getMount(k,won){const F=FK[k];if(!F||BS.own[k])return;
  BS.own[k]={n:F.nm,food:80,shine:80,love:70,t:Date.now()};BS.steed=k;SAVE.owned['mount:'+k]=true;persist();
  const a=farmAnimal(k);a.setTag(F.nm);a.showDust(80);renderActions();
  setTimeout(()=>{banner(won?`🏆 You won ${F.e} ${F.nm}!`:`${F.e} Meet ${F.nm}!`);toast(`Tap 🏇 with your moves to ride ${F.nm} anywhere in town!`);},won?0:1900);}

// 🏆 the prize dragon comes once you've earned enough stars (your star rank never goes down, so she stays)
function askPrize(s){const st=starsEarned();
  if(s.earn){const f={earn:s.earn},ride=s.k.startsWith('mount:');$('#buyCard').innerHTML=`<div class="bigE">${s.e}</div><h2>${s.n}</h2><p>${s.d}</p><p class="bneed">🏆 ${erWhat(f)}: <b>${Math.min(s.earn.goal,erHave(f))}</b> of ${s.earn.goal}</p><p>${s.earn.by==='wins'?'Win the model, cake or pet contest, or beat Kai 1-on-1 at basketball.':'Come back and play tomorrow! A day counts as soon as you start playing.'} ${ride?`This ride can't be bought. ${FK[s.k.slice(6)].nm} comes to you by herself!`:`This can't be bought. It shows up in your closet once you earn it!`}</p><button class="btn ghost" data-b="close">OK</button>`;
    $('#buy').dataset.k=s.k;$('#buy').classList.add('show');return;}
  $('#buyCard').innerHTML=`<div class="bigE">${s.e}</div><h2>${s.n}</h2><p>${s.d}</p><p class="bneed">You've earned <b>${st}</b> of ${s.prize} ⭐</p><p>Finish ⭐🏆 challenges to earn more stars. She comes to you by herself!</p><button class="btn ghost" data-b="close">OK</button>`;
  $('#buy').dataset.k=s.k;$('#buy').classList.add('show');}
function checkPrizes(){if(!started)return;for(const f of MOUNTS)if(f.prize&&!BS.own[f.k]&&starsEarned()>=f.prize){getMount(f.k,true);sfx('tada');
  burst(new THREE.Vector3(player.pos.x,player.pos.y+1.4,player.pos.z),'#ffd23f',60,3,.2);did('prize',f.k);}}
setInterval(checkPrizes,1500);
// draw the pictures of your rides soon after you start, so the ride button shows your real animal
setTimeout(function warmPics(){if(!started)return setTimeout(warmPics,2000);if(myRides().length)thumbsSoon();},4000);

/* ---------- 🏇 pick a ride: every animal you own that you can ride ---------- */
function renderRides(){const now=mySteed();
  $('#rideList').innerHTML=myRides().map(k=>`<button data-steed="${k}" class="${k===now?'last':''}">${fThumb(FK[k])}<span>${esc(BS.own[k].n)}</span></button>`).join('');}
function openRides(){if(closetOpen||!started)return;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';renderRides();$('#rides').classList.add('show');sfx('pop');thumbsSoon();}
function closeRides(){$('#rides').classList.remove('show');}
$('#rideList').addEventListener('click',e=>{const b=e.target.closest('[data-steed]');if(!b)return;closeRides();callSteed(b.dataset.steed);});
$('#ridesClose').onclick=closeRides;
$('#rides').onclick=e=>{if(e.target.id==='rides')closeRides();};
