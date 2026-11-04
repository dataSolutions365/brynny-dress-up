// Star challenges: little goals at every place in town that give you ⭐ stars (and coins).
// The game tells us what you do with  dispatchEvent(new CustomEvent('brynny:did',{detail:{k,a}}))  (see did() in index.html).
// Everything is saved in SAVE.chal so it stays after you close the game.
const G = window.__game;
const $ = s => document.querySelector(s);
const SAVE = G.SAVE;
const Z = Object.fromEntries(G.ZONES.map(z => [z.id, z]));
const persist = () => { try { localStorage.setItem('brynny3d.v1', JSON.stringify(SAVE)); } catch (e) {} };
const zoneId = () => (G.zone() || {}).id;
const MOVES = ['wave', 'dance', 'twirl', 'kiss', 'clap', 'cheer', 'flip', 'sit', 'pose', 'bow', 'magic', 'jumpjack'];

// first time: stars you already found count toward your total
if (!SAVE.chal) { const f = (SAVE.stars || []).length; SAVE.chal = { done: {}, n: {}, u: {}, found: f, stars: f, day: null }; persist(); }
const C = SAVE.chal;
C.done ||= {}; C.n ||= {}; C.u ||= {};

/* ---------- the challenges ----------
   ev: which thing you did counts (k = kind, a = test for the extra info, z = must be at this place)
   poll: a number we can just look up      goal: how many you need      u: count different ones (places, people)
   go: the place the 📍 button guides you to */
const glam = () => G.glamCheck(SAVE.look);
// guys get grooming at the glam mirror instead of makeup, nails and braids, so those challenges change for them
const guy = () => !!SAVE.look && SAVE.look.body === 'guy';
// wins, days in a row and more, from 3d/src/24i-earned-rides.js (for the 🦁 Safari challenges)
// how much you've swum, and with whom, from 3d/src/26f-ocean.js (for the 🌊 Ocean challenges)
const sea = () => (G.seaState && G.seaState()) || { swum: 0, dolphin: 0, whale: 0, turtle: 0, spouts: 0 };
const es = () => (G.earnState && G.earnState()) || { wins: 0, streak: 0, best: 0, kinds: 0, kai: 0, kn: {} };
// the foods on Rosie's menu (FOOD_MAIN and FOOD_SWEET in 3d/src/12g-place-restaurant.js)
const FOOD_MAINS = ['pizza', 'burger', 'pasta', 'pancakes', 'sushi', 'salad'], FOOD_SWEETS = ['sundae', 'cake', 'cookies'];
const LIST = [
  // ✨ Sparkle Studio
  { id: 'dress', tab: 'studio', e: '👗', t: 'Put on a dress', r: 1, go: 'studio', poll: () => SAVE.look.dress ? 1 : 0 },
  { id: 'fullLook', tab: 'studio', e: '👒', t: 'Wear a hat, shoes and an extra all at once', r: 1, go: 'studio', poll: () => SAVE.look.hat && SAVE.look.shoes && Object.keys(SAVE.look.extras || {}).length ? 1 : 0 },
  { id: 'restyle', tab: 'studio', e: '🪞', t: 'Change your outfit 3 times', r: 1, go: 'studio', goal: 3, ev: { k: 'dress' } },
  { id: 'photo', tab: 'studio', e: '📸', t: 'Take a photo', r: 1, ev: { k: 'act', a: a => a === 'photo' } },
  { id: 'buy', tab: 'studio', e: '🛍️', t: 'Buy something from the shop', r: 2, ev: { k: 'buy' } },
  // 💃 Runway
  { id: 'pose', tab: 'runway', e: '📸', t: 'Strike a pose on the runway', r: 1, go: 'runway', ev: { k: 'pose' } },
  { id: 'runTwirl', tab: 'runway', e: '🌀', t: 'Twirl on the runway', r: 1, go: 'runway', ev: { k: 'act', a: a => a === 'twirl', z: 'runway' } },
  { id: 'pose5', tab: 'runway', e: '🌟', t: 'Strike 5 poses on the runway', r: 2, go: 'runway', goal: 5, ev: { k: 'pose' } },
  // 🐾 Pet Parlor
  { id: 'adopt', tab: 'parlor', e: '🐶', t: 'Adopt a pet (pets live all around town)', r: 1, go: 'spring', poll: () => G.myPet() ? 1 : 0 },
  { id: 'feed', tab: 'parlor', e: '🍖', t: 'Feed your pet a snack', r: 1, go: 'parlor', ev: { k: 'feed' } },
  { id: 'bath', tab: 'parlor', e: '🛁', t: 'Give your pet a bubble bath', r: 2, go: 'parlor', ev: { k: 'bath' } },
  { id: 'paws', tab: 'parlor', e: '💅', t: 'Paint all 4 paws', r: 2, go: 'parlor', ev: { k: 'paws' } },
  { id: 'petDress', tab: 'parlor', e: '🎀', t: 'Dress up your pet', r: 1, go: 'parlor', ev: { k: 'petdress' } },
  { id: 'petContest', tab: 'parlor', e: '🏆', t: 'Enter a pet dress-up contest', r: 1, go: 'parlor', ev: { k: 'petct' } },
  { id: 'petWin', tab: 'parlor', e: '👑', t: 'Win a pet dress-up contest', r: 2, go: 'parlor', ev: { k: 'petct', a: p => p === 0 } },
  { id: 'farm', tab: 'parlor', e: '🐴', t: 'Adopt an animal at the Happy Barn', r: 1, go: 'barn', ev: { k: 'farm' } },
  { id: 'farmBrush', tab: 'parlor', e: '🪮', t: 'Brush a barn animal until it shines', r: 1, go: 'barn', ev: { k: 'brush' } },
  { id: 'farmRide', tab: 'parlor', e: '🏇', t: 'Go for a ride on a barn animal', r: 1, go: 'barn', ev: { k: 'ride' } },
  { id: 'farmRare', tab: 'parlor', e: '🦖', t: 'Adopt a rare animal with stars', r: 2, go: 'barn', ev: { k: 'farm', a: a => ['unicorn', 'trike', 'trex', 'longneck'].includes(a) } },
  { id: 'zooFeed', tab: 'explore', e: '🦒', t: 'Feed an animal at the Safari Zoo', r: 1, go: 'zoo', ev: { k: 'zoofeed' } },
  { id: 'zooLearn', tab: 'explore', e: '📖', t: 'Meet a zebra, a giraffe and a rhino', r: 2, goal: 3, u: true, go: 'zoo', ev: { k: 'zoolearn' } },
  // 🧁 Sweet Bakery
  { id: 'cake', tab: 'bakery', e: '🎂', t: 'Design a cake', r: 1, go: 'bakery', ev: { k: 'cake' } },
  { id: 'tallCake', tab: 'bakery', e: '🍰', t: 'Make a cake with 3 layers or more', r: 2, go: 'bakery', ev: { k: 'cake', a: n => n >= 3 } },
  { id: 'cakeContest', tab: 'bakery', e: '⏱️', t: 'Enter a cake contest', r: 1, go: 'bakery', ev: { k: 'cakect' } },
  { id: 'cakeWin', tab: 'bakery', e: '👑', t: 'Win a cake contest', r: 2, go: 'bakery', ev: { k: 'cakect', a: p => p === 0 } },
  { id: 'wish', tab: 'bakery', e: '🕯️', t: 'Blow out the candles and make a wish', r: 1, go: 'bakery', ev: { k: 'wish' } },
  // 🍝 Rosie's Restaurant (3d/src/24l-restaurant.js): sit down and eat, and the 🛵 delivery rush around town
  { id: 'eatMeal', tab: 'food', e: '🍽️', t: "Eat a meal at Rosie's Restaurant", r: 1, go: 'diner', ev: { k: 'eat' } },
  { id: 'eatDessert', tab: 'food', e: '🍨', t: 'Have dessert after your meal', r: 1, go: 'diner', ev: { k: 'eat', a: a => FOOD_SWEETS.includes(a) } },
  { id: 'eat3', tab: 'food', e: '😋', t: 'Try 3 different foods on the menu', r: 2, goal: 3, u: true, go: 'diner', ev: { k: 'eat', a: a => FOOD_MAINS.includes(a) } },
  { id: 'eatAll', tab: 'food', e: '👨‍🍳', t: 'Try every food on the menu', r: 3, goal: FOOD_MAINS.length, u: true, go: 'diner', ev: { k: 'eat', a: a => FOOD_MAINS.includes(a) } },
  { id: 'rush', tab: 'food', e: '🛵', t: 'Try a delivery rush', r: 1, go: 'diner', ev: { k: 'deliver' } },
  { id: 'rushWin', tab: 'food', e: '🏆', t: 'Deliver all 3 orders before time runs out', r: 2, go: 'diner', ev: { k: 'deliver', a: p => p === 0 } },
  { id: 'rushWin5', tab: 'food', e: '⚡', t: 'Win 5 delivery rushes', r: 3, goal: 5, go: 'diner', ev: { k: 'deliver', a: p => p === 0 } },
  // ⭐ Star Model Agency
  { id: 'glam', tab: 'agency', get e() { return guy() ? '🪞' : '💄'; }, t: 'Sit at the glam mirror', r: 1, go: 'agency', ev: { k: 'glam' } },
  { id: 'makeup', tab: 'agency', get e() { return guy() ? '🧴' : '💋'; }, get t() { return guy() ? 'Try skin care: brows, a tan or freckles' : 'Wear 3 kinds of makeup'; }, r: 1, go: 'agency', poll: () => guy() ? glam().skin : glam().mk >= 3 ? 1 : 0 },
  { id: 'nails', tab: 'agency', get e() { return guy() ? '🧔' : '💅'; }, get t() { return guy() ? 'Pick a beard, or a clean shave' : 'Get a manicure and a pedicure'; }, r: 1, go: 'agency', poll: () => guy() ? glam().beard : glam().nails && glam().toes ? 1 : 0 },
  { id: 'salon', tab: 'agency', get e() { return guy() ? '💈' : '💇'; }, get t() { return guy() ? 'Get a barber special cut' : 'Get a salon hairdo'; }, r: 1, go: 'agency', poll: () => guy() ? glam().cut : glam().hair ? 1 : 0 },
  { id: 'braid', tab: 'agency', get e() { return guy() ? '🙂' : '🪢'; }, get t() { return guy() ? 'Pick your face shape at the glam mirror' : 'Braid your own hair'; }, r: 2, go: 'agency', ev: { k: 'braid' }, get poll() { return guy() ? () => glam().face : undefined; } },
  { id: 'contest', tab: 'agency', e: '🏆', t: 'Enter the model contest', r: 1, go: 'agency', ev: { k: 'contest' } },
  { id: 'podium', tab: 'agency', e: '🥉', t: 'Finish in the top 3 of the contest', r: 2, go: 'agency', ev: { k: 'contest', a: p => p <= 2 } },
  { id: 'win', tab: 'agency', e: '👑', t: 'Win the model contest', r: 3, go: 'agency', ev: { k: 'contest', a: p => p === 0 } },
  // 💬 Friends in town
  { id: 'talk', tab: 'town', e: '💬', t: 'Say hi to someone in town', r: 1, ev: { k: 'talk' } },
  { id: 'talk5', tab: 'town', e: '👭', t: 'Talk to 5 different people', r: 2, goal: 5, u: true, ev: { k: 'talk' } },
  { id: 'quest', tab: 'town', e: '🎁', t: 'Help someone with their task', r: 2, poll: () => Math.min(1, SAVE.townDone || 0) },
  { id: 'quest5', tab: 'town', e: '🦸‍♀️', t: 'Help with 5 tasks', r: 3, goal: 5, poll: () => SAVE.townDone || 0 },
  { id: 'sportVs', tab: 'town', e: '🆚', t: 'Play basketball or baseball against a friend online', r: 1, go: 'court', ev: { k: 'sportvs' } },
  { id: 'sportVsWin', tab: 'town', e: '🏆', t: 'Beat your friends in a basketball or baseball match', r: 2, go: 'court', ev: { k: 'sportvs', a: p => p === 0 } },
  { id: 'sportVs5', tab: 'town', e: '🏅', t: 'Play 5 matches against friends', r: 2, goal: 5, go: 'court', ev: { k: 'sportvs' } },
  { id: 'bestie', tab: 'town', e: '💖', t: 'Make a best friend (5 hearts)', r: 3, poll: () => G.FRIENDS.some(f => G.townSave(f).h >= 5) ? 1 : 0 },
  // 🗺️ Explore
  { id: 'map', tab: 'explore', e: '🗺️', t: 'Use the map to walk somewhere', r: 1, ev: { k: 'arrive' } },
  { id: 'visitAll', tab: 'explore', e: '🧭', t: `Visit all ${G.ZONES.length} places`, r: 3, goal: G.ZONES.length, u: true, ev: { k: 'zone', a: a => !!Z[a] } },
  { id: 'find5', tab: 'explore', e: '⭐', t: 'Find 5 hidden stars', r: 1, goal: 5, poll: () => C.found },
  { id: 'find24', tab: 'explore', e: '🌟', t: 'Find all 24 hidden stars', r: 3, goal: 24, poll: () => C.found },
  { id: 'carTire', tab: 'explore', e: '🛞', t: 'Change a flat tire at the Car Garage', r: 1, go: 'garage', ev: { k: 'car', a: j => j === 'tire' } },
  { id: 'carOil', tab: 'explore', e: '🛢️', t: 'Change the oil in your car', r: 1, go: 'garage', ev: { k: 'car', a: j => j === 'oil' } },
  // 🛹 the Skate Park (3d/src/24k-skate-park.js): ride in on a skateboard, roller skates or a bike
  { id: 'skTrick', tab: 'explore', e: '🛹', t: 'Do a trick at the Skate Park', r: 1, go: 'skate', ev: { k: 'trick' } },
  { id: 'skTricks', tab: 'explore', e: '🌀', t: 'Land 10 tricks at the Skate Park', r: 2, goal: 10, go: 'skate', ev: { k: 'trick' } },
  { id: 'skCombo', tab: 'explore', e: '🔥', t: 'Land a combo at the Skate Park (a trick plus air or a grind)', r: 2, go: 'skate', ev: { k: 'skateCombo' } },
  { id: 'carFixed', tab: 'explore', e: '🏁', t: 'Fix up your whole car: tire, oil and engine', r: 2, go: 'garage', ev: { k: 'carfixed' } },
  { id: 'carSpin', tab: 'explore', e: '🚗', t: 'Paint your car and take it for a spin', r: 1, go: 'garage', ev: { k: 'carspin' } },
  { id: 'sandcastle', tab: 'explore', e: '🏰', t: 'Build a sandcastle at the beach', r: 2, go: 'beach', ev: { k: 'sandcastle' } },
  { id: 'sandMoat', tab: 'explore', e: '🌊', t: 'Dig a moat around your sandcastle', r: 1, go: 'beach', ev: { k: 'sandmoat' } },
  { id: 'sandWave', tab: 'explore', e: '🦀', t: 'Let a wave wash your sandcastle away', r: 1, go: 'beach', ev: { k: 'sandwave' } },
  { id: 'beachJump', tab: 'explore', e: '🏖️', t: 'Do a star jump at the beach', r: 1, go: 'beach', ev: { k: 'act', a: a => a === 'jumpjack', z: 'beach' } },
  { id: 'spookyFlip', tab: 'explore', e: '🎃', t: 'Do a flip in Halloween Hollow', r: 1, go: 'halloween', ev: { k: 'act', a: a => a === 'flip', z: 'halloween' } },
  { id: 'snowDance', tab: 'explore', e: '🎄', t: 'Dance in Christmas Village', r: 1, go: 'christmas', ev: { k: 'act', a: a => a === 'dance', z: 'christmas' } },
  { id: 'partyCheer', tab: 'explore', e: '🎂', t: 'Cheer at the Birthday Party', r: 1, go: 'birthday', ev: { k: 'act', a: a => a === 'cheer', z: 'birthday' } },
  // 🚁 the helicopter (3d/src/26h-helicopter.js): finish the 4 marked "for the helicopter" and you win it (ids in HELI_EARN there), or buy it with 🪙
  { id: 'heli_visit', tab: 'explore', e: '🚁', t: 'Visit the Helipad (1 of 4 to win the helicopter)', r: 1, go: 'heli', ev: { k: 'zone', a: a => a === 'heli' } },
  { id: 'heli_places', tab: 'explore', e: '🧭', t: 'Visit 12 different places (2 of 4 to win the helicopter)', r: 2, goal: 12, u: true, ev: { k: 'zone', a: a => !!Z[a] } },
  { id: 'heli_wins', tab: 'explore', e: '🏆', t: 'Win 5 contests or games (3 of 4 to win the helicopter)', r: 3, goal: 5, go: 'agency', poll: () => es().wins },
  { id: 'heli_stars', tab: 'explore', e: '🌟', t: 'Earn 40 ⭐ (4 of 4 to win the helicopter)', r: 3, goal: 40, poll: () => C.stars || 0 },
  { id: 'heli_fly', tab: 'explore', e: '🚁', t: 'Take off in your helicopter', r: 1, go: 'heli', ev: { k: 'heli', a: a => a === 'takeoff' } },
  { id: 'heli_pad', tab: 'explore', e: '🛬', t: 'Land your helicopter on the Helipad', r: 2, go: 'heli', ev: { k: 'heli', a: a => a === 'pad' } },
  { id: 'heli_high', tab: 'explore', e: '☁️', t: 'Fly your helicopter all the way up to the clouds', r: 2, go: 'heli', ev: { k: 'heli', a: a => a === 'high' } },
  { id: 'heli_friend', tab: 'explore', e: '👭', t: 'Fly a friend in your helicopter, or ride along in theirs', r: 2, ev: { k: 'heli', a: a => a === 'friend' || a === 'ride' } },
  // 🚨 Round-up (3d/src/26g-town-animals.js): start it at the Happy Barn, the 4 barn animals break out all over town; catch them and walk them home
  { id: 'roamFeed', tab: 'explore', e: '🌽', t: 'Give a snack to all 4 barn animals in the meadow: Waddles, Billy, Truffle and Woolly', r: 1, goal: 4, u: true, go: 'barn', ev: { k: 'roamfeed', a: n => ['Waddles', 'Billy', 'Truffle', 'Woolly'].includes(n) } },
  { id: 'roundup', tab: 'explore', e: '🚨', t: 'Finish a Round-up: catch all 4 runaways and bring them home', r: 3, go: 'barn', ev: { k: 'roundup' } },
  { id: 'safariRound', tab: 'explore', e: '🦒', t: 'Finish a Safari Round-up: bring Ziggy, Kito, Twiga and Tembo back to the Safari Zoo', r: 3, go: 'zoo', ev: { k: 'roundgrp', a: g => g === 'zoo' } },
  { id: 'roundCatch', tab: 'explore', e: '🪢', t: 'Bring 10 runaways back to the Happy Barn', r: 2, goal: 10, go: 'barn', ev: { k: 'roamhome' } },
  { id: 'roundWin', tab: 'explore', e: '🏆', t: 'Win a Round-up against friends online (bring the most home)', r: 2, go: 'barn', ev: { k: 'roundup', a: p => p === 0 } },
  { id: 'gardenBow', tab: 'explore', e: '🌷', t: 'Curtsy in the Spring Garden', r: 1, go: 'spring', ev: { k: 'act', a: a => a === 'bow', z: 'spring' } },
  // 🦁 Safari: super hard challenges. Finish all of one animal's challenges (grp) and you can ride it (3d/src/24i-earned-rides.js)
  { id: 'saf_feed5', tab: 'safari', grp: 'kivu', e: '🍃', t: 'Feed all 11 kinds of animals at the Safari Zoo', r: 3, goal: 11, u: true, go: 'zoo', ev: { k: 'zoofeed' } },
  { id: 'saf_win5', tab: 'safari', grp: 'kivu', e: '🏆', t: 'Win 5 contests or games', r: 3, goal: 5, go: 'agency', poll: () => es().wins },
  { id: 'saf_days5', tab: 'safari', grp: 'kivu', e: '🔥', t: 'Play 5 days in a row', r: 3, goal: 5, poll: () => es().best },
  { id: 'saf_stars24', tab: 'safari', grp: 'punda', e: '⭐', t: 'Find all 24 hidden stars', r: 3, goal: 24, poll: () => C.found || 0 },
  { id: 'saf_win8', tab: 'safari', grp: 'punda', e: '🏆', t: 'Win 8 contests or games', r: 3, goal: 8, poll: () => es().wins },
  { id: 'saf_days7', tab: 'safari', grp: 'punda', e: '🔥', t: 'Play 7 days in a row', r: 3, goal: 7, poll: () => es().best },
  { id: 'saf_car3', tab: 'safari', grp: 'kifaru', e: '🔧', t: 'Fix up your whole car 3 times: tire, oil and engine', r: 3, goal: 3, go: 'garage', ev: { k: 'carfixed' } },
  { id: 'saf_best3', tab: 'safari', grp: 'kifaru', e: '💖', t: 'Make 3 best friends in town (5 hearts each)', r: 3, goal: 3, poll: () => G.FRIENDS.filter(f => G.townSave(f).h >= 5).length },
  { id: 'saf_win20', tab: 'safari', grp: 'kifaru', e: '🏆', t: 'Win 20 contests or games', r: 3, goal: 20, poll: () => es().wins },
  { id: 'saf_feedG', tab: 'safari', grp: 'zuri', e: '🍌', t: 'Feed the gorilla at the Safari Zoo 10 times', r: 3, goal: 10, go: 'zoo', ev: { k: 'zoofeed', a: a => a === 'gorilla' } },
  { id: 'saf_meet8', tab: 'safari', grp: 'zuri', e: '🔎', t: 'Meet all 11 kinds of animals at the Safari Zoo', r: 3, goal: 11, go: 'zoo', poll: () => Object.keys(G.SAVE.zoo || {}).length },
  { id: 'saf_win12', tab: 'safari', grp: 'zuri', e: '🏆', t: 'Win 12 contests or games', r: 3, goal: 12, poll: () => es().wins },
  { id: 'saf_feedH', tab: 'safari', grp: 'kiboko', e: '🍉', t: 'Feed the hippo at the Safari Zoo 10 times', r: 3, goal: 10, go: 'zoo', ev: { k: 'zoofeed', a: a => a === 'hippo' } },
  { id: 'saf_hipswim', tab: 'safari', grp: 'kiboko', e: '🏊', t: 'Swim next to the hippo for 30 seconds (it lives in the water behind the zoo)', r: 3, goal: 30, go: 'zoo', poll: () => Math.floor(G.hipWith ? G.hipWith() : 0) },
  { id: 'saf_sea300', tab: 'safari', grp: 'kiboko', e: '🌊', t: 'Swim 300 steps in the water', r: 3, goal: 300, poll: () => Math.floor(sea().swum || 0) },
  { id: 'saf_feedC', tab: 'safari', grp: 'duma', e: '🍖', t: 'Feed the cheetah at the Safari Zoo 10 times', r: 3, goal: 10, go: 'zoo', ev: { k: 'zoofeed', a: a => a === 'cheetah' } },
  { id: 'saf_kai3', tab: 'safari', grp: 'duma', e: '🏀', t: 'Beat Kai 1-on-1 at basketball 3 times', r: 3, goal: 3, go: 'court', poll: () => es().kai },
  { id: 'saf_days8', tab: 'safari', grp: 'duma', e: '🔥', t: 'Play 8 days in a row', r: 3, goal: 8, poll: () => es().best },
  { id: 'saf_feedT', tab: 'safari', grp: 'raja', e: '🐟', t: 'Feed the tiger at the Safari Zoo 10 times', r: 3, goal: 10, go: 'zoo', ev: { k: 'zoofeed', a: a => a === 'tiger' } },
  { id: 'saf_win25', tab: 'safari', grp: 'raja', e: '🏆', t: 'Win 25 contests or games', r: 3, goal: 25, poll: () => es().wins },
  { id: 'saf_stars120', tab: 'safari', grp: 'raja', e: '🌟', t: 'Earn 120 ⭐', r: 3, goal: 120, poll: () => C.stars || 0 },
  { id: 'saf_feedA', tab: 'safari', grp: 'bayou', e: '🐟', t: 'Feed the alligator 10 times (it lives in the water behind the zoo)', r: 3, goal: 10, go: 'zoo', ev: { k: 'zoofeed', a: a => a === 'gator' } },
  { id: 'saf_sea600', tab: 'safari', grp: 'bayou', e: '🌊', t: 'Swim 600 steps in the water', r: 3, goal: 600, poll: () => Math.floor(sea().swum || 0) },
  { id: 'saf_win18', tab: 'safari', grp: 'bayou', e: '🏆', t: 'Win 18 contests or games', r: 3, goal: 18, poll: () => es().wins },
  { id: 'saf_triple', tab: 'safari', grp: 'tembo', e: '👑', t: 'Win all 3 contests: the model, cake and pet contest', r: 3, goal: 3, go: 'agency', poll: () => es().kinds },
  { id: 'saf_win15', tab: 'safari', grp: 'tembo', e: '🏆', t: 'Win 15 contests or games', r: 3, goal: 15, poll: () => es().wins },
  { id: 'saf_days10', tab: 'safari', grp: 'tembo', e: '🔥', t: 'Play 10 days in a row', r: 3, goal: 10, poll: () => es().best },
  { id: 'saf_model5', tab: 'safari', grp: 'neema', e: '👑', t: 'Win the model contest 5 times', r: 3, goal: 5, go: 'agency', poll: () => (es().kn || {}).contest || 0 },
  { id: 'saf_cake5', tab: 'safari', grp: 'neema', e: '🎂', t: 'Win the cake contest 5 times', r: 3, goal: 5, go: 'bakery', poll: () => (es().kn || {}).cakect || 0 },
  { id: 'saf_pet5', tab: 'safari', grp: 'neema', e: '🐾', t: 'Win the pet contest 5 times', r: 3, goal: 5, go: 'parlor', poll: () => (es().kn || {}).petct || 0 },
  { id: 'saf_kai5', tab: 'safari', grp: 'jabari', e: '🏀', t: 'Beat Kai 1-on-1 at basketball 5 times', r: 3, goal: 5, go: 'court', poll: () => es().kai },
  { id: 'saf_win30', tab: 'safari', grp: 'jabari', e: '🏆', t: 'Win 30 contests or games', r: 3, goal: 30, poll: () => es().wins },
  { id: 'saf_stars100', tab: 'safari', grp: 'jabari', e: '🌈', t: 'Earn 100 ⭐ and become a Legend', r: 3, goal: 100, poll: () => C.stars || 0 },
  { id: 'saf_days14', tab: 'safari', grp: 'jabari', e: '🔥', t: 'Play 14 days in a row', r: 3, goal: 14, poll: () => es().best },
  { id: 'saf_kai10', tab: 'safari', grp: 'twiga', e: '🏀', t: 'Beat Kai 1-on-1 at basketball 10 times', r: 3, goal: 10, go: 'court', poll: () => es().kai },
  { id: 'saf_stars150', tab: 'safari', grp: 'twiga', e: '🌟', t: 'Earn 150 ⭐', r: 3, goal: 150, poll: () => C.stars || 0 },
  { id: 'saf_days21', tab: 'safari', grp: 'twiga', e: '🔥', t: 'Play 21 days in a row', r: 3, goal: 21, poll: () => es().best },
  // 🌊 Ocean: swim in 🐬 Dolphin Bay off the Beach. Finish all of a sea animal's challenges (grp) and you can ride it in the bay (3d/src/26f-ocean.js)
  { id: 'sea_swim', tab: 'ocean', grp: 'shelly', e: '🏊', t: 'Swim 100 steps out in Dolphin Bay', r: 2, goal: 100, go: 'bay', poll: () => sea().swum },
  { id: 'sea_turtle', tab: 'ocean', grp: 'shelly', e: '🐢', t: 'Swim next to Shelly the sea turtle for 20 seconds', r: 2, goal: 20, go: 'bay', poll: () => sea().turtle },
  { id: 'sea_feedT', tab: 'ocean', grp: 'shelly', e: '🪼', t: 'Feed Shelly 3 times', r: 2, goal: 3, go: 'bay', ev: { k: 'seafeed', a: a => a === 'turtle' } },
  { id: 'sea_dolph', tab: 'ocean', grp: 'splash', e: '🐬', t: 'Swim with the dolphins for 45 seconds', r: 2, goal: 45, go: 'bay', poll: () => sea().dolphin },
  { id: 'sea_feedD', tab: 'ocean', grp: 'splash', e: '🐟', t: 'Feed the dolphins 5 times', r: 2, goal: 5, go: 'bay', ev: { k: 'seafeed', a: a => a === 'dolphin' } },
  { id: 'sea_feedAll', tab: 'ocean', grp: 'splash', e: '🦭', t: 'Feed 4 different sea animals', r: 3, goal: 4, u: true, go: 'bay', ev: { k: 'seafeed' } },
  { id: 'sea_whale', tab: 'ocean', grp: 'bigblue', e: '🐋', t: 'Swim next to Big Blue the whale for 60 seconds', r: 3, goal: 60, go: 'bay', poll: () => sea().whale },
  { id: 'sea_spout', tab: 'ocean', grp: 'bigblue', e: '💦', t: 'See Big Blue spout 10 times', r: 2, goal: 10, go: 'bay', poll: () => sea().spouts },
  { id: 'sea_swim1k', tab: 'ocean', grp: 'bigblue', e: '🌊', t: 'Swim 1000 steps in the sea', r: 3, goal: 1000, go: 'bay', poll: () => sea().swum },
  { id: 'sea_feedW', tab: 'ocean', grp: 'bigblue', e: '🦐', t: 'Feed Big Blue 5 times', r: 3, goal: 5, go: 'bay', ev: { k: 'seafeed', a: a => a === 'whale' } },
  { id: 'sea_pip', tab: 'ocean', grp: 'pip', e: '🦭', t: 'Swim next to Pip the seal for 20 seconds', r: 2, goal: 20, go: 'bay', poll: () => sea().seal },
  { id: 'sea_feedP', tab: 'ocean', grp: 'pip', e: '🐟', t: 'Feed Pip 5 times', r: 2, goal: 5, go: 'bay', ev: { k: 'seafeed', a: a => a === 'seal' } },
  { id: 'sea_meet', tab: 'ocean', grp: 'pip', e: '🌊', t: 'Swim next to 5 different sea animals', r: 3, goal: 5, go: 'bay', poll: () => sea().kinds },
  { id: 'sea_manta', tab: 'ocean', grp: 'friends', e: '🐠', t: 'Swim next to Ray the manta ray for 30 seconds', r: 2, goal: 30, go: 'bay', poll: () => sea().manta },
  { id: 'sea_otter', tab: 'ocean', grp: 'friends', e: '🦦', t: 'Feed Ollie the sea otter 3 times', r: 2, goal: 3, go: 'bay', ev: { k: 'seafeed', a: a => a === 'otter' } },
  // 🦈 Ghost the great white: really hard on purpose (you need all four other sea rides first)
  { id: 'sea_shark', tab: 'ocean', grp: 'ghost', e: '🦈', t: 'Get away from the great white 3 times', r: 3, goal: 3, go: 'bay', ev: { k: 'shark', a: a => a === 'escape' } },
  { id: 'sea_shark10', tab: 'ocean', grp: 'ghost', e: '🏊', t: 'Get away from Ghost the great white 10 times', r: 3, goal: 10, go: 'bay', ev: { k: 'shark', a: a => a === 'escape' } },
  { id: 'sea_sharkrow', tab: 'ocean', grp: 'ghost', e: '🔥', t: 'Get away from Ghost 5 times in a row without being bumped', r: 3, goal: 5, go: 'bay', poll: () => sea().sharkRow },
  { id: 'sea_rides4', tab: 'ocean', grp: 'ghost', e: '🏆', t: 'Ride all 4 sea rides: Shelly, Splash, Big Blue and Pip', r: 3, goal: 4, go: 'bay', poll: () => sea().rode },
  { id: 'sea_swim5k', tab: 'ocean', grp: 'ghost', e: '🌊', t: 'Swim 5000 steps in the sea', r: 3, goal: 5000, go: 'bay', poll: () => sea().swum },
];
// daily challenges: 3 new ones every day, and a bonus for doing all 3
const DAILY = [
  { id: 'd_feed', e: '🍖', t: 'Feed your pet 2 times', goal: 2, go: 'parlor', ev: { k: 'feed' } },
  { id: 'd_moves', e: '💃', t: 'Do 5 dance moves', goal: 5, ev: { k: 'act', a: a => MOVES.includes(a) } },
  { id: 'd_stars', e: '⭐', t: 'Find 3 hidden stars', goal: 3, ev: { k: 'star' } },
  { id: 'd_places', e: '🧭', t: 'Visit 3 different places', goal: 3, u: true, ev: { k: 'zone', a: a => !!Z[a] } },
  { id: 'd_photo', e: '📸', t: 'Take 2 photos', goal: 2, ev: { k: 'act', a: a => a === 'photo' } },
  { id: 'd_cake', e: '🎂', t: 'Bake a cake', go: 'bakery', ev: { k: 'cake' } },
  { id: 'd_talk', e: '💬', t: 'Talk to 3 different people', goal: 3, u: true, ev: { k: 'talk' } },
  { id: 'd_pose', e: '📸', t: 'Strike 3 poses on the runway', goal: 3, go: 'runway', ev: { k: 'pose' } },
  { id: 'd_contest', e: '🏆', t: 'Enter the model contest', go: 'agency', ev: { k: 'contest' } },
  { id: 'd_quest', e: '🎁', t: 'Help someone in town', ev: { k: 'quest' } },
  { id: 'd_glam', get e() { return guy() ? '🪞' : '💄'; }, t: 'Sit at the glam mirror', go: 'agency', ev: { k: 'glam' } },
  { id: 'd_bath', e: '🛁', t: 'Give your pet a bath', go: 'parlor', ev: { k: 'bath' } },
  { id: 'd_roam', e: '🪢', t: 'Bring 2 runaways home in a Round-up', goal: 2, go: 'barn', ev: { k: 'roamhome' } },
  { id: 'd_dress', e: '👗', t: 'Change your outfit 2 times', goal: 2, ev: { k: 'dress' } },
  { id: 'd_eat', e: '🍝', t: "Eat a meal at Rosie's Restaurant", go: 'diner', ev: { k: 'eat' } },
  { id: 'd_rush', e: '🛵', t: 'Do a delivery rush', go: 'diner', ev: { k: 'deliver' } },
].map(d => Object.assign({ r: 1, tab: 'today', daily: true }, d));
const TABS = [['today', '📅', 'Today'], ['safari', '🦁', 'Safari'], ['ocean', '🌊', 'Ocean'], ['places', '📍', 'Places'], ['rides', '🏆', 'Rewards'], ['studio', '✨', 'Studio'], ['runway', '💃', 'Runway'], ['parlor', '🐾', 'Pets'], ['bakery', '🧁', 'Bakery'], ['food', '🍝', 'Food'], ['agency', '⭐', 'Agency'], ['town', '💬', 'Friends'], ['explore', '🗺️', 'Explore']];
const RANKS = [[0, '🌱', 'New Star'], [10, '✨', 'Rising Star'], [25, '💫', 'Shining Star'], [45, '🌟', 'Superstar'], [70, '👑', 'Megastar'], [100, '🌈', 'Legend']];
const DAY_BONUS = 2, COINS_PER_STAR = 5;

/* ---------- today's 3 ---------- */
const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function today() {
  const k = dayKey();
  if (!C.day || C.day.k !== k) {
    let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pool = DAILY.slice(), ids = [];
    while (ids.length < 3) { h = (h * 1103515245 + 12345) >>> 0; ids.push(pool.splice(h % pool.length, 1)[0].id); }
    C.day = { k, ids, n: {}, u: {}, done: {}, bonus: false }; persist();
  }
  return C.day;
}
const todays = () => today().ids.map(id => DAILY.find(d => d.id === id)).filter(Boolean);

/* ---------- progress ---------- */
const store = ch => ch.daily ? today() : C;
const isDone = ch => !!store(ch).done[ch.id];
const goalOf = ch => ch.goal || 1;
function progress(ch) {
  if (isDone(ch)) return goalOf(ch);
  if (ch.poll) { try { return Math.min(goalOf(ch), ch.poll() || 0); } catch (e) { return 0; } }
  const s = store(ch);
  return Math.min(goalOf(ch), ch.u ? (s.u[ch.id] || []).length : (s.n[ch.id] || 0));
}
const allCh = () => LIST.concat(todays());
const left = zid => allCh().some(ch => !isDone(ch) && ch.go === zid);
window.__chal = { left, list: LIST, today: todays, progress, isDone };

/* ---------- awarding stars (one at a time, so each gets its moment) ---------- */
const queue = []; let busy = false;
function award(ch) {
  const s = store(ch); if (s.done[ch.id]) return;
  s.done[ch.id] = true; C.fresh = true; persist();
  queue.push({ e: ch.e, t: ch.t, r: ch.r });
  if (ch.daily && todays().every(isDone) && !today().bonus) { today().bonus = true; persist(); queue.push({ e: '🎉', t: "All of today's challenges!", r: DAY_BONUS }); }
  drain();
}
function drain() {
  if (busy || !queue.length) return;
  if (!G.started()) { setTimeout(drain, 1000); return; }
  busy = true; const q = queue.shift();
  const before = rank(); C.stars = (C.stars || 0) + q.r; persist(); showStars(true);
  G.banner(q.b ? `${q.b} +${q.r} ⭐` : `🌟 Challenge done! +${q.r} ⭐`); G.toast(`${q.e} ${q.t}`); G.sfx('tada');
  try { const p = G.player.pos; for (let k = 0; k < 3; k++) setTimeout(() => G.burst(new G.THREE.Vector3(p.x + (Math.random() - .5) * 2, p.y + 2, p.z + (Math.random() - .5) * 2), ['#ffd23f', '#ff8fc8', '#8fd8ff'][k], 40, 3), k * 200); } catch (e) {}
  dispatchEvent(new CustomEvent('brynny:earn', { detail: { n: q.r * COINS_PER_STAR, why: 'Challenge!' } }));
  const after = rank(); if (after !== before) setTimeout(() => { G.banner(`${after[1]} You're a ${after[2]}!`); G.sfx('tada'); }, 1900);
  if (panelOpen) render();
  setTimeout(() => { busy = false; drain(); }, 2300);
}
const rank = () => { let r = RANKS[0]; for (const x of RANKS) if ((C.stars || 0) >= x[0]) r = x; return r; };

/* ---------- listening to the game ---------- */
function count(ch, k, a) {
  const ev = ch.ev; if (!ev || isDone(ch) || ev.k !== k) return;
  if (ev.a && !ev.a(a)) return;
  if (ev.z && zoneId() !== ev.z) return;
  const s = store(ch);
  if (ch.u) { const key = k === 'zone' ? a : String(a); const l = s.u[ch.id] ||= []; if (l.includes(key)) return; l.push(key); }
  else s.n[ch.id] = (s.n[ch.id] || 0) + 1;
  persist();
  if (progress(ch) >= goalOf(ch)) award(ch);
  else if (panelOpen) render();
}
addEventListener('brynny:did', e => {
  const { k, a } = e.detail || {};
  if (k === 'star') { C.found = (C.found || 0) + 1; C.stars = (C.stars || 0) + 1; persist(); showStars(true); }
  if (k === 'stars') { showStars(); return; }
  if (k === 'zone' && !G.started()) return;
  for (const ch of allCh()) count(ch, k, a);
  check();
});
// prizes from contests (the bakery cake contest gives ⭐ for 1st, 2nd and 3rd place, sports matches with friends for 1st and 2nd)
addEventListener('brynny:prize', e => { const d = e.detail || {}; const n = Math.max(0, Math.min(5, Math.round(+d.n || 0))); if (!n) return; queue.push({ e: d.e || '🏆', t: String(d.t || 'Prize!'), r: n, b: d.b ? String(d.b) : '' }); drain(); });
function check() { for (const ch of allCh()) if (ch.poll && !isDone(ch) && progress(ch) >= goalOf(ch)) award(ch); }
setInterval(() => { if (G.started()) check(); }, 700);

/* ---------- the ⭐ button up top ---------- */
const css = document.createElement('style');
css.textContent = `
#stars{display:flex;align-items:center;gap:4px;color:var(--ink);background:linear-gradient(90deg,rgba(255,243,176,.95),rgba(232,220,255,.95));border:2px solid #fff;position:relative}
#stars span{font-size:15px;margin-left:2px}
#stars:active{transform:scale(.94)}
#stars.bump{animation:cbump .45s}
#stars .dot{position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff4d8d;border:2px solid #fff;display:none}
#stars.new .dot{display:block}
#chal .card{max-width:440px;height:min(680px,calc(100vh - 40px));height:min(680px,calc(100dvh - 40px));display:flex;flex-direction:column;padding:16px 14px 14px;text-align:left}
#chal .chead{padding:0 4px 6px}
#chal .chead h2{font-size:22px}
#chalDone{background:var(--pink);color:#fff;font-weight:700;padding:9px 18px;border-radius:999px;font-size:16px;box-shadow:0 3px 0 #e04a8d}
.crank{display:flex;align-items:center;gap:10px;background:linear-gradient(90deg,#fff3c4,#ffe6f2);border-radius:18px;padding:8px 12px;margin:0 2px 4px}
.crank>b{font-size:34px;font-weight:400;line-height:1}
.crank div{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
.crank strong{font-size:17px}.crank span{font-size:13px;color:var(--muted);font-weight:600}
.crank i{display:block;height:9px;border-radius:9px;background:rgba(255,255,255,.8);overflow:hidden}.crank i u{display:block;height:100%;background:linear-gradient(90deg,#ffd23f,#ff6fae);border-radius:9px}
.cspend{background:#efe6ff;border-radius:14px;padding:7px 12px;margin:0 2px 4px;font-size:14px;font-weight:600;color:#4a3a86}.cspend small{display:block;font-size:12px;font-weight:500;color:var(--muted)}
.crank em{font-style:normal;font-weight:700;font-size:22px;white-space:nowrap}
#chal .tabs{margin:0 -14px;padding:6px 10px}
#chal .tab{position:relative}
#chal .tab s{position:absolute;top:2px;right:4px;width:9px;height:9px;border-radius:50%;background:#ff4d8d;text-decoration:none}
#chalList{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:8px 2px 2px;display:flex;flex-direction:column;gap:7px;min-height:120px}
.cq{display:flex;align-items:center;gap:10px;background:#fff7fb;border:2px solid #f6e3ef;border-radius:16px;padding:8px 10px}
.cq>b{font-size:28px;font-weight:400;line-height:1;width:34px;text-align:center;flex:0 0 auto}
.cq div{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.cq strong{font-size:15px;font-weight:600;line-height:1.2}
.cq i{display:flex;align-items:center;gap:6px;font-style:normal;font-size:12px;font-weight:700;color:var(--muted)}
.cq i u{flex:1;height:8px;border-radius:8px;background:#f3eaf8;overflow:hidden;display:block}.cq i u q{display:block;height:100%;background:linear-gradient(90deg,#ffb347,#ff6fae);border-radius:8px}
.cq i u q::before,.cq i u q::after{content:none}
.cq em{font-style:normal;font-size:13px;white-space:nowrap;letter-spacing:-1px}
.cq button{flex:0 0 auto;background:var(--purple);color:#fff;font-weight:700;font-size:14px;padding:9px 12px;border-radius:999px;box-shadow:0 3px 0 #6a4fd0;min-height:40px}
.cq button:active{transform:translateY(2px);box-shadow:0 1px 0 #6a4fd0}
.cq.done{background:#effbf3;border-color:#c9eed6}
.cq.done strong{color:#2e9b5a}
.cq.done>b{filter:saturate(.6)}
.cnote{font-size:13px;color:var(--muted);text-align:center;margin:4px 0 2px;font-weight:600}
.crides .cq>b{font-size:30px}
.cq .own{flex:0 0 auto;font-size:13px;font-weight:700;color:#2e9b5a;white-space:nowrap}
.cq .lock{flex:0 0 auto;font-size:18px}
.cstreak{display:flex;gap:6px;margin:2px 0 2px}.cstreak span{flex:1;background:#fff3e0;border-radius:14px;padding:7px 8px;text-align:center;font-weight:700;font-size:14px;color:#a3541c}
.cstreak span small{display:block;font-size:11px;font-weight:600;color:var(--muted)}
.csaf{display:flex;align-items:center;gap:10px;background:linear-gradient(90deg,#ffe9b8,#f6d79a);border-radius:16px;padding:8px 12px;margin-top:6px;color:#5a3a12}
.csaf>b{font-size:30px;font-weight:400;line-height:1}.csaf>b img,.crides .cq>b img{width:60px;height:60px;object-fit:contain;display:block}.csaf div{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}.csaf strong{font-size:16px}.csaf span{font-size:12px;font-weight:600;color:#7a5a2a}
.csaf.sea{background:linear-gradient(90deg,#c9f0ff,#a3def5);color:#0f4a66}.csaf.sea span{color:#2b6680}
.csaf .own{font-size:13px;font-weight:700;color:#2e9b5a;white-space:nowrap}.csaf .lock{font-size:18px}.csaf.own{background:linear-gradient(90deg,#d9f5e2,#eefbe9)}
.csaf.place{background:linear-gradient(90deg,#e8dcff,#ffe1f0);color:#3d2a78}.csaf.place span{color:#6a5a9a}.csaf.place.own{background:linear-gradient(90deg,#d9f5e2,#eefbe9);color:#1f6b3d}
.csaf.place>b{font-size:32px}.csaf.place button{flex:0 0 auto;background:var(--purple);color:#fff;font-weight:700;font-size:14px;padding:9px 12px;border-radius:999px;box-shadow:0 3px 0 #6a4fd0;min-height:40px}
.csaf.place button.here{background:#2fb8a5;box-shadow:0 3px 0 #23907f}
.cbonus{background:linear-gradient(90deg,#efe3ff,#ffe6f2);border-radius:14px;padding:8px 12px;font-weight:600;font-size:14px;text-align:center}
`;
document.head.appendChild(css);
const btn = $('#stars');
btn.insertAdjacentHTML('beforeend', '<i class="dot"></i>');
function showStars(bump) {
  const n = $('#starN'); if (n) n.textContent = C.stars || 0;
  if (bump) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  btn.classList.toggle('new', !!C.fresh && !panelOpen);
}

/* ---------- the challenges card ---------- */
document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="chal" aria-label="Star challenges"><div class="card">
  <div class="chead"><h2>🏆 Star Challenges</h2><button id="chalDone">Done</button></div>
  <div id="chalRank"></div>
  <div class="tabs" id="chalTabs"></div>
  <div id="chalList"></div>
</div></div>`);
let panelOpen = false, tab = 'today';
function render() {
  const r = rank(), nx = RANKS[RANKS.indexOf(r) + 1], s = C.stars || 0;
  $('#chalRank').innerHTML = `<div class="crank"><b>${r[1]}</b><div><strong>${r[2]}</strong>${nx ? `<i><u style="width:${Math.round((s - r[0]) / (nx[0] - r[0]) * 100)}%"></u></i><span>${nx[0] - s} more ⭐ to ${nx[2]} ${nx[1]}</span>` : '<span>You are a legend! 🌈</span>'}</div><em>⭐ ${s}</em></div><div class="cspend">🛒 <b>⭐ ${Math.max(0, s - ((SAVE.barn && SAVE.barn.spent) || 0))}</b> left to spend on rare animals at the 🐴 Happy Barn<small>⭐ ${s} is every star you ever earned (your rank). It never goes down when you spend.</small></div>`;
  $('#chalTabs').innerHTML = TABS.map(([id, e, n]) => {
    const list = id === 'today' ? todays() : LIST.filter(c => c.tab === id), open = list.filter(c => !isDone(c)).length;
    return `<button class="tab${tab === id ? ' on' : ''}" data-tab="${id}"><b>${e}</b>${n}${open && id === 'today' ? '<s></s>' : ''}</button>`;
  }).join('');
  if (tab === 'rides') { $('#chalList').innerHTML = ridesHTML(); return; }
  const list = tab === 'today' ? todays() : LIST.filter(c => c.tab === tab), here = zoneId();
  let h = '';
  if (tab === 'today') { const st = G.earnState ? G.earnState() : null; h += `<div class="cnote">${st && st.streak > 1 ? `🔥 Day ${st.streak} in a row! ` : ''}New challenges every day! Finish all 3 for +${DAY_BONUS} bonus ⭐</div>`; }
  if (tab === 'safari') { $('#chalList').innerHTML = safariHTML(list, here); return; }
  if (tab === 'ocean') { $('#chalList').innerHTML = oceanHTML(list, here); return; }
  if (tab === 'places') { $('#chalList').innerHTML = placesHTML(here); return; }
  const sorted = list.slice().sort((a, b) => isDone(a) - isDone(b));
  h += sorted.map(ch => {
    return chRow(ch, here);
  }).join('');
  if (tab === 'today' && today().bonus) h += '<div class="cbonus">🎉 You did all of today\'s challenges! Come back tomorrow for new ones.</div>';
  const left = LIST.filter(c => c.tab === tab && !isDone(c)).length;
  if (tab !== 'today' && !left) h += '<div class="cbonus">🎉 You finished every challenge here!</div>';
  $('#chalList').innerHTML = h;
}
function chRow(ch, here) {
  const d = isDone(ch), p = progress(ch), g = goalOf(ch);
  const go = !d && ch.go && Z[ch.go] ? (ch.go === here ? '<button disabled style="background:#2fb8a5;box-shadow:0 3px 0 #23907f">📍 Here!</button>' : `<button data-go="${ch.go}">📍 Go</button>`) : '';
  return `<div class="cq${d ? ' done' : ''}"><b>${d ? '✅' : ch.e}</b><div><strong>${ch.t}</strong><i>${g > 1 && !d ? `<u><q style="width:${Math.round(p / g * 100)}%"></q></u>${p} / ${g}` : d ? 'Done!' : ''}<em>${'⭐'.repeat(ch.r)}</em></i></div>${go}</div>`;
}
// 🦁 the Safari tab: each safari animal with its own super hard challenges. Finish them all to ride it.
function safariHTML(list, here) {
  const rides = G.earnedRides ? G.earnedRides() : [];
  let h = '<div class="cnote">🦁 Super hard challenges! Finish every challenge for an animal and you can ride it anywhere in town.</div>';
  for (const k of ['kivu', 'punda', 'kifaru', 'zuri', 'kiboko', 'bayou', 'duma', 'tembo', 'raja', 'neema', 'jabari', 'twiga']) {
    const r = rides.find(x => x.k === k), mine = list.filter(c => c.grp === k); if (!mine.length) continue;
    const n = mine.filter(isDone).length;
    h += `<div class="csaf${r && r.own ? ' own' : ''}"><b>${r && r.pic ? `<img src="${r.pic}" alt="">` : r ? r.e : '🦁'}</b><div><strong>${r ? `${r.nm} the ${r.n.toLowerCase()}${r.fly ? ' 🪽' : ''}` : k}</strong><span>${r && r.own ? 'Yours! Tap 🏇 with your moves to ride' : `${n} of ${mine.length} challenges done`}</span></div>${r && r.own ? '<span class="own">✅ Yours</span>' : '<span class="lock">🔒</span>'}</div>`;
    h += mine.map(ch => chRow(ch, here)).join('');
  }
  return h;
}
// 🌊 the Ocean tab: each sea animal you can ride, with its challenges. Finish them all to ride it in Dolphin Bay.
function oceanHTML(list, here) {
  const rides = G.seaRides ? G.seaRides() : [];
  let h = '<div class="cnote">🐬 Swim out from the Beach into Dolphin Bay! Finish every challenge for a sea animal and you can ride it in the bay.</div>';
  for (const r of rides) {
    const mine = list.filter(c => c.grp === r.k); if (!mine.length) continue;
    const n = mine.filter(isDone).length;
    h += `<div class="csaf sea${r.own ? ' own' : ''}"><b>${r.e}</b><div><strong>${r.nm} the ${r.n.toLowerCase()}</strong><span>${r.own ? 'Yours! Swim up to them and tap Ride' : `${n} of ${mine.length} challenges done`}</span></div>${r.own ? '<span class="own">✅ Yours</span>' : '<span class="lock">🔒</span>'}</div>`;
    h += mine.map(ch => chRow(ch, here)).join('');
  }
  // the other sea friends (no ride, just challenges)
  for (const [k, e, nm, sub] of [['friends', '🦦', 'More sea friends', 'Ray the manta ray and Ollie the sea otter']]) {
    const mine = list.filter(c => c.grp === k); if (!mine.length) continue;
    const n = mine.filter(isDone).length, fin = n === mine.length;
    h += `<div class="csaf sea${fin ? ' own' : ''}"><b>${e}</b><div><strong>${nm}</strong><span>${fin ? 'All done!' : sub}</span></div>${fin ? '<span class="own">✅ Done</span>' : ''}</div>`;
    h += mine.map(ch => chRow(ch, here)).join('');
  }
  return h;
}
// 📍 the Places tab: a legend of every place in town with the challenges you do there (like the 🦁 Safari tab does for animals).
// The place you're standing in comes first, then places with challenges left, in map order. Challenges you can do anywhere go last.
function placesHTML(here) {
  const all = allCh(), byZone = G.ZONES.map(z => ({ z, mine: all.filter(c => c.go === z.id) })).filter(g => g.mine.length);
  const openN = g => g.mine.filter(c => !isDone(c)).length;
  byZone.sort((a, b) => (b.z.id === here) - (a.z.id === here) || (openN(b) > 0) - (openN(a) > 0));
  let h = '<div class="cnote">📍 Every place in town and the challenges you can do there. Tap Go and follow the pink arrow!</div>';
  const block = (e, name, mine, zid) => {
    const n = mine.filter(isDone).length, fin = n === mine.length;
    const btn = !zid || fin ? (fin ? '<span class="own">✅ All done</span>' : '') : zid === here ? '<button disabled class="here">📍 Here!</button>' : `<button data-go="${zid}">📍 Go</button>`;
    return `<div class="csaf place${fin ? ' own' : ''}"><b>${e}</b><div><strong>${name}</strong><span>${n} of ${mine.length} challenges done</span></div>${btn}</div>`
      + mine.slice().sort((a, b) => isDone(a) - isDone(b)).map(ch => chRow(ch, here)).join('');
  };
  for (const { z, mine } of byZone) { const [e, ...rest] = z.name.split(' '); h += block(e, rest.join(' '), mine, z.id); }
  const free = all.filter(c => !c.go || !Z[c.go]);
  if (free.length) h += block('🌍', 'Anywhere in town', free, null);
  return h;
}
// 🏆 special rides and outfits you can't buy: win contests and play days in a row (the game side is 3d/src/24i-earned-rides.js)
function ridesHTML() {
  const rides = G.earnedRides ? G.earnedRides() : [], st = G.earnState ? G.earnState() : { wins: 0, streak: 0, best: 0 };
  const looks = G.earnedLooks ? G.earnedLooks() : [];
  let h = '<div class="cnote">Special rides and outfits you can\'t buy! Win contests and play days in a row to earn them.</div>';
  h += `<div class="cstreak"><span>🔥 ${st.streak} ${st.streak === 1 ? 'day' : 'days'} in a row<small>Best: ${st.best}</small></span><span>🏆 ${st.wins} ${st.wins === 1 ? 'win' : 'wins'}<small>Contests and 1-on-1</small></span></div>`;
  h += '<div class="crides" style="display:flex;flex-direction:column;gap:7px">' + rides.sort((a, b) => a.own - b.own).map(r => {
    const bar = r.own ? (r.ownTxt || 'Yours! Tap 🏇 with your moves to ride') : `<u><q style="width:${Math.round(r.have / r.goal * 100)}%"></q></u>${r.have} / ${r.goal}`;
    return `<div class="cq${r.own ? ' done' : ''}"><b>${r.pic ? `<img src="${r.pic}" alt="">` : r.e}</b><div><strong>${r.nm} the ${r.n.toLowerCase()}${r.fly ? ' 🪽' : ''}</strong><i>${r.own ? '' : r.what + ' · '}${bar}</i></div>${r.own ? '<span class="own">✅ Yours</span>' : '<span class="lock">🔒</span>'}</div>`;
  }).join('') + '</div>';
  if (looks.length) h += '<div class="cnote" style="margin-top:8px">👗 Modern outfits</div><div class="crides" style="display:flex;flex-direction:column;gap:7px">' + looks.sort((a, b) => a.own - b.own).map(r => {
    const bar = r.own ? `Yours! It's in your closet's ${r.where}` : `<u><q style="width:${Math.round(r.have / r.goal * 100)}%"></q></u>${r.have} / ${r.goal}`;
    return `<div class="cq${r.own ? ' done' : ''}"><b>${r.e}</b><div><strong>${r.n}</strong><i>${r.own ? '' : r.what + ' · '}${bar}</i></div>${r.own ? '<span class="own">✅ Yours</span>' : '<span class="lock">🔒</span>'}</div>`;
  }).join('') + '</div>';
  h += '<div class="cnote">🏆 Wins: 1st place in the model, cake or pet contest, or beating Kai 1-on-1 at basketball.<br>🦁 Safari rides: finish all of their challenges in the 🦁 Safari tab.<br>🔥 A day counts as soon as you start playing. Miss a day and the streak starts over, but what you earned stays yours.</div>';
  return h;
}
function openPanel() {
  if (!G.started() || G.busy()) return;
  try { G.closeTalk && G.closeTalk(); } catch (e) {}
  G.joy.id = null; G.joy.x = G.joy.y = 0;
  panelOpen = true; C.fresh = false; persist(); render(); $('#chal').classList.add('show'); $('#chalList').scrollTop = 0; G.sfx('pop'); showStars();
}
function closePanel() { panelOpen = false; $('#chal').classList.remove('show'); showStars(); }
btn.addEventListener('click', () => panelOpen ? closePanel() : openPanel());
$('#chalDone').onclick = closePanel;
$('#chal').addEventListener('click', e => {
  if (e.target.id === 'chal') return closePanel();
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; G.sfx('pop'); render(); $('#chalList').scrollTop = 0; return; }
  const g = e.target.closest('[data-go]');
  if (g) { const z = Z[g.dataset.go]; G.setDest(z); G.sfx('star'); closePanel(); G.toast(`Follow the pink arrow on the map to ${z.name} 💗`); }
});
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; if (e.code === 'Escape' && panelOpen) closePanel(); });

/* ---------- start ---------- */
showStars();
// once you start playing, point out the new button (only the first time)
const intro = setInterval(() => {
  if (!G.started()) return; clearInterval(intro); check();
  if (!C.intro) { C.intro = 1; persist(); setTimeout(() => G.toast('New! Tap ⭐🏆 at the top for star challenges'), 4500); }
}, 500);
