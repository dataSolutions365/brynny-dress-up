# Notes for working on this repo

## 3D world (`3d/`)
- The game code lives in `3d/src/`, one file per feature (places, avatar, pets, bakery, shop, glam mirror, map, game loop).
- `3d/game.js` is GENERATED from those files. Never edit it by hand.
- After changing anything in `3d/src/`, run `node 3d/build.mjs` and commit both the src change and the rebuilt `3d/game.js`.
  A GitHub check (`node 3d/build.mjs --check`) fails if they don't match.
- The files share one set of variables (they are joined in file-name order), so a function or variable defined in one
  file can be used in any other. Number new files so they land in the right order, e.g. `21b-ice-rink.js`.
- HTML and CSS stay in `3d/index.html`. `online.js`, `challenges.js` and `seasons.js` are separate modules that talk
  to the game through `window.__game`.
- No install is needed: plain Node runs the build, and GitHub Pages serves the files as they are.
- Online play (`online.js`) shows each friend exactly as they are: their look, plus everything listed in `SHOW` in
  `3d/src/26c-friends-see.js` (their pet, barn buddy, ride, bike, skateboard, held bat/ball and what they're busy doing).
  When you add a new ride, a new pet, or something you hold, add an entry to `SHOW` so friends see it.
  Rides that are barn animals (horse, dinos, and the shop rides in `3d/src/24g-mounts.js`) are already covered by the `ride` entry.
  `3d/tests/online-see.mjs` checks it with two phones in one room:
  `npm i --no-save playwright peer && npx playwright install chromium && node 3d/tests/online-see.mjs` (takes a few minutes).
- Basketball and batting matches against friends online are in `3d/src/24e2-sports-friends.js` (it hooks into
  `3d/src/24e-sports.js` through `SP.onMenu`, `SP.onEnd` and `SP.lx`). `3d/tests/sports-friends.mjs` plays a match with two phones
  (same setup as `online-see.mjs`).
- 🏀 3-on-3 basketball (`3d/src/24e4-basketball-3v3.js`): you and two teammates from the 🧢 team picker (sport 'basketball') against
  the 🐻 Bears on the half court, first to 11. It's `SP.ext.v3` in `3d/src/24e-sports.js`, but unlike the other `SP.ext` games you run
  freely (`SP.ext.v3.lock`), and baskets come back through `SP.ext.v3.made`. `BB3.us[0]` is you; each computer player guards the one with
  the same number on the other team. 🤾 PASS / 🙋 CALL FOR IT / 🖐️ STEAL. `3d/tests/basketball-3v3.mjs` (run on every PR) plays it.
- Rides with `fly:1` in FARM (`3d/src/24d-barn.js`) can fly: `3d/src/24h-flying.js` does the take-off, flying and landing,
  and friends see it through the `ride` entry. `3d/tests/fly.mjs` (run on every PR) checks one takes off, clears the trees and lands.
- Riding the 🚲 bike (`3d/src/17d-bicycle.js`): `bikeStep()` turns the wheels, cranks and handlebars and works out the lean,
  `bikeRide()` puts the rider's hips on the saddle, hands on the grips and feet on the pedals every frame (it runs after
  `Avatar.update`, so it wins over the walking pose). Friends online use the same two functions. `3d/tests/bike.mjs`
  (run on every PR) checks the feet stay on the pedals, the hands on the grips, coasting, and a foot down when stopped.
- 🦁 Safari rides (okapi, zebra, rhino, gorilla, hippo, alligator, cheetah, tiger, elephant, crowned crane, lion, giraffe) are earned rides in `3d/src/24i-earned-rides.js` with
  `earn:{by:'chal',ids:[...]}`: they come once every challenge id listed is done in the 🦁 Safari tab of `3d/challenges.js`.
  They reuse the zoo's real-looking models through `model:` (the lion and the saddles are in `3d/src/24c9b-safari-rides.js`,
  the zebra, giraffe, rhino, flying crowned crane and the zoo's gorilla in `3d/src/24c9c-safari-more.js`, which share textures and
  materials through `safM` to save memory on phones; the saddle size for each ride is in `SADDLE`);
  `seat` slides the animal back so you sit further forward, `wide` spreads the rider's legs, `boost` sets the speed.
  🐆🐅 The cheetah and tiger (zoo animals and the Duma and Raja rides) are one builder, `bigCat()` in `3d/src/24c9e-big-cats.js`.
  🐊 The alligator (zoo and the Bayou ride) is `3d/src/24c9f-alligator.js`.
  Every real animal has ONE real-looking model: the Safari Zoo's zebra, giraffe and rhino use the ride builders through `model:` in ZOOA,
  🦁 Goldie the champion lion is the zoo lion with a gold saddle, and 🐒 Coco the barn monkey is built by `Pet.buildReal` (`3d/src/16-animals-pets.js`).
  Don't add a cartoon copy of an animal that already has a real-looking one; reuse the real model.
  🦛 The hippo model is `3d/src/24c9d-hippo.js`. Animals with `swim` (the zoo hippo and alligator, and the Kiboko and Bayou rides) sink into the canal
  round the city through `swimSink()` in `3d/src/26f2-hippo-swim.js` (rideStep, the zoo and friends online all call it), and Kiboko and Bayou are the
  only barn rides `seaKeep()` lets into the water. The back of the Safari Zoo's fence is open (`ZOO_SHORE` in `3d/src/12d-place-zoo.js`):
  the animals walk out to drink at the water, and the zoo hippo and alligator live in the water there (`HIPPO_WATER` in `3d/src/24d-barn.js`).
  `3d/tests/safari-rides.mjs` (run on every PR) checks they stay locked until earned, the rider sits on the saddle, and Kiboko swims.
- 🌊 The canal and 🐬 Dolphin Bay: `3d/src/26f-ocean.js`. The coast is a ring of water all the way round the island (`CANAL.inR` to
  `CANAL.outR`) with a grassy far bank (instanced palms and bushes); the bit past the Beach is the 'bay' zone, the rest shows as 🌊 Canal.
  You wade in off any shore and swim (not on a bike, skateboard or barn ride: `collide()` asks `seaKeep()`). Swimming keeps you at ground
  height 0 and just sinks and poses the body after `Avatar.update` (`swimPose()`, also used for friends online through the 'sea' entry in `SHOW`).
  For other files that use the water (the safari hippo, animals drinking): `seaDepth(x,z)`, `inCanal(x,z)`, `canalSpot(ang,t)`, `CANAL`, `WATER_Y`.
  Three dolphins and Big Blue the whale swim round the whole canal, Shelly the sea turtle near the Beach, Pip the seal sits on her rock; they never
  follow you (only adopted pets do): you swim up next to them, and that counts for the challenges. A barn ride with `swim:1` in FARM may go in the water. They show on the minimap. 🐟 Feed sends `did('seafeed', kind)`.
  🐢 Shelly, 🐬 Splash, 🐋 Big Blue and 🦭 Pip are rides you earn in the 🌊 Ocean tab of `3d/challenges.js` (ids in `SEA_RIDES`), and only work in the water
  (Pip slides off her rock when you ride her and goes back when you hop off). 🐠 Ray the manta ray and 🦦 Ollie the sea otter are for swimming with and feeding.
  🦈 Ghost the great white swims round the canal by himself (a SEAS animal, `SHARK.c`); swim near him and now and then he chases you (`sharkStep`): it's
  harmless (reach the shore to escape, `did('shark','escape')`, or he just bumps you and swims on). He's a ride too, with the hardest Ocean challenges
  (grp 'ghost': escape 10 times, 5 in a row, ride all 4 other sea rides, swim 5000 steps); once he's yours he stops chasing you.
  He looks like a real great white on purpose, not a cartoon; keep it that way.
  `3d/tests/ocean.mjs` (run on every PR) checks you swim all round, the animals keep their own way instead of following you, feeding counts, the rides stay locked until earned and you sit on their back.
- 🐶🏊 Pets swim (`3d/src/26f3-pet-swim.js`): your adopted pet follows you into the canal and the waterpark's pools and swims
  (body sunk to the water line, head up, doggy paddle, ripples) through `petSwim()`, called after `pt.update` in `stepPet` and for friends'
  pets in the 'pet' entry of `SHOW`. `PET_SEA.on` (set round the pet's `collide`) lets it out into the canal through `petSea()` while
  its owner is in the water. Pets never walk on top of water. `3d/tests/pet-swim.mjs` (run on every PR) checks it.
- 💦 Splash Waterpark (`3d/src/26w-waterpark.js`): on the far bank of the canal behind the Runway and the Clothing Store, over a wooden
  footbridge at 240°. The far-bank land, the bridge and the pools hook into `3d/src/26f-ocean.js`: `BANK_LAND` (where you may walk),
  `BANK_BRIDGES`, `BANK_POOLS` (how deep the water is there, so swimming just works) and `BANK_GROUND` (what you can stand on, like the
  floating playground). The layout is in `WPL` in the waterpark's own directions (local +z points back at the island): the 🌀 Twister
  (an enclosed tube slide, up the tube conveyor) and 💨 Racer (an open body slide, up the spiral stairs) follow the paths in `WPS`
  (change the points and the slide's shape and the ride both follow), the 🌊 wave pool (`WAVE`: a set of waves every few seconds;
  grab a board at the 🏄 Surf Shack on the sand (`WPL.shack`), or with the "Get a surfboard" button while swimming there, and a wave stands you up), the 🛟 lazy river round the lagoon, and the 🎈 floating playground
  (`WPI`: pads, a slide, a bouncer, a hump and a step tower). `wpStep()` takes over moving you on a slide, a tube or a wave
  (25-game-loop.js asks it), and poses go through `av.wpPose` (14-avatar.js). Bikes and barn rides can cross the bridge but stay out
  of the pools. Challenges are in the 💦 Waterpark tab of `3d/challenges.js`; friends see your tube and board through the 'wpark'
  entry in `SHOW`. `3d/tests/waterpark.mjs` (run on every PR) walks over the bridge, swims under it, rides both slides, floats the
  lazy river, surfs a wave and plays on the inflatables.
- 📍 The Places tab of ⭐ Star Challenges (`placesHTML()` in `3d/challenges.js`) is a legend of every place in town with the challenges
  you do there, grouped by each challenge's `go` place (no `go` puts it under "Anywhere in town"). Give a new challenge a `go` and it shows up
  under that place by itself. `3d/tests/challenge-places.mjs` (run on every PR) checks every challenge is listed once.
- 🎟️ Fast Pass (`3d/src/26i-fast-pass.js`): a power bought once with coins in the shop's ⚡ Powers tab (`power:fastpass`). Once owned,
  tapping a place on the map or 📍 Go in the Star Challenges asks "Zip there now" or "Show me the way" (`fastPassAsk`), and `fastTravel(z)`
  drops you at the edge of that place facing the plaza (`fpSpot`, never on a pad). It's off during a delivery rush, a Round-up and on the ropes.
  When you add a place to ZONES, `3d/tests/fast-pass.mjs` (run on every PR) checks you land in it and can walk off.
- 🤸 Jump Park (behind Christmas Village): the building is `3d/src/12e-place-jump-park.js`, the bouncing, flips, slam dunks and
  foam pit are `3d/src/26e-jump-park.js` (25-game-loop.js asks `jpLand()` on every landing; the Jump button calls `jpJump()`).
  `3d/tests/jump-park.mjs` (run on every PR) checks you bounce, go higher and flip when tapping Jump, dunk, and sink into the pit.
- 🛹 Skate Park: `3d/src/12f-place-skate-park.js` builds it and has `SKZ` (where every ramp, box and rail is, in the park's own
  directions) and `skateLH()` (how high the riding surface is anywhere in it; `groundAt` uses it, so walking works on the ramps).
  `3d/src/24k-skate-park.js` takes over moving you while you're on wheels (skateboard, roller skates or bike) inside the park:
  rolling with gravity on the ramps, air out of the half-pipe, ollies, grinds on `SKZ.rails` and the trick buttons. Change a ramp's
  numbers in `SKZ` and both the look and the riding follow. Friends see the lean and the tricks through the `park` entry in `SHOW`.
  `3d/tests/skate-park.mjs` (run on every PR) rides it on all three.
- 🍝 Rosie's Restaurant (between the Birthday Party and the Sweet Bakery): the building, tables, pads and the food models
  (`makeFood(kind)` gives `{g, bits}`; bits disappear one by one as you eat) are in `3d/src/12g-place-restaurant.js` (`RST`).
  `3d/src/24l-restaurant.js` does sitting down to eat (Rosie walks the food over from the kitchen pass on her tray, `did('eat', food)`)
  and the 🛵 delivery rush (3 customers at places around town, a time limit, the food box on your back; `did('deliver', 0)` is a win
  and counts toward the 🏆 earned rides). Everyone who sits down takes the first free chair in `RST.seats` (`pickSeat()`), friends online
  show sitting in theirs through the `dine` entry in `SHOW`, and townspeople get nudged out of the chairs. Add a food by adding it to `FOOD_MAIN`/`FOOD_SWEET` and a builder in `FOOD_BUILD`
  (and its id to `FOOD_MAINS`/`FOOD_SWEETS` in `3d/challenges.js`). `3d/tests/restaurant.mjs` (run on every PR) eats a meal and wins a rush.
- ⛰️ Lookout Mountain and 🌲 Treetop Adventure: `3d/src/26h-adventure.js`, on the canal's far bank (angles 92 to 136), over a wooden footbridge.
  Places on the far bank push their own walkable sector into `BANK_LAND` and their footbridges into `BANK_BRIDGES` (both in `3d/src/26f-ocean.js`);
  `collide()` asks `bankLand()` first. Raised walkways (the footbridge deck, platforms, rope bridges) are `SURF` entries: they only count as ground
  once you're up on them (`HIGH.on`), so swimmers go under the footbridge and people walk under the platforms. The mountain's shape is one function,
  `mtH()`, used for both the rock you see and the ground you walk on (`mtGround()` reads the height off the very same drawn triangles,
  so you never stand on air at the trail's ledge); `advBlock()` stops walking up the steep rock by its smooth shape `mtBase()` so the rocky bumps
  can't trap you, always lets you step back onto the trail from just below it, and off the trail a 🥾 Back to the trail button shows (only the `TRAIL` and the climbing
  `WALL` go up) and stops you stepping off the ropes course (the harness). `advStep()` moves you on the ladder, the wall and the `ZIPS`; friends see
  it through the 'adv' entry in `SHOW`. `3d/tests/adventure.mjs` (run on every PR) does the whole thing.
- 🗺️ The big world (`3d/src/26z-big-world.js`): past the canal's far bank the land keeps going out to `WORLD.out`, with mountains all round
  the edge, split into `REGIONS` (🏔️ Snowy Peaks, 🌻 Sunflower Hills, 🌲 Whispering Woods, 🏞️ Crystal Lake, 🏜️ Sunset Canyon, 🍎 Apple Orchard).
  It's all 🚧 blocked off (a fence with "Coming soon" signs; you can't walk, swim or fly in) until a place opens there. To open a new area,
  build the place in its own file (named to sort before `26z`), push its `BANK_LAND` sector (add `ground:1` if it draws its own ground, or `own:1` if it also does its own walking like the waterpark) and a
  footbridge into `BANK_BRIDGES`: the hills there flatten, the trees step aside and the fence goes round its edge by itself. Write positions
  relative to `R`, `BANK` and `WORLD`, never raw numbers, so the world can keep growing. The ground is one shape (`WG`, `groundH(x,z)` reads it)
  and every tree/rock kind is one instanced shape, to stay cheap on phones. The big map opens on the island (zoom step 1); ➖ zooms out to the
  whole world with each region striped and 🔒 named. `3d/tests/big-world.mjs` (run on every PR) checks it.
- 🪂 Hang gliding and ✈️ skydiving: `3d/src/26i-sky-sports.js`. The hang glider launches off a ramp on top of Lookout Mountain (`RAMP`),
  you lie prone in the harness under a real-looking glider (`hgBuild`, `hgPlace` puts glider and pilot together), steer with the joystick,
  ride the thermals in `THERM` (a hawk circles in each) and ridge lift off the mountain (`skyLift`), and flare to land. ✈️ Sunny Skies Airfield
  (`AIRF`, zone 'airfield') sits past the canal at angle 64 (its own `BANK_LAND` sector 52 to 76, with `ground:1` because it draws its own ground but walks like normal bank land; `own:1` is only for places like the waterpark that do their own walking,
  and a footbridge at 70). The jump plane (`planeBuild`, flown by `planeStep`) takes off, climbs to `PL_ALT`, opens its door for the jump,
  then lands and taxis back. Free fall, the auto-opening square canopy (`canBuild`, `canPlace`) and the 🎯 target landing are in `skyStep()`,
  which 25-game-loop.js asks first. `skyFloor()` is what's under you (never land on a roof, a tree or steep rock: it lifts you over them) and
  `skyLandable()` where you may come down (island, walkable bank, or the canal to swim). Write positions relative to `R`, `BANK` (and `WORLD`
  when it exists), never raw numbers. Friends see it through the 'sky' entry in `SHOW`. `3d/tests/sky.mjs` (run on every PR) does a glide and a jump.
  `skyG()` is the real ground height in the air (groundAt plus the big world's hills, which groundAt doesn't know). A parachute low down for
  15 s heads for `skySafeSpot()` and is set down there after 30 s, so it never floats round and round. 🛟 `groundNet()` (called every frame
  from 25-game-loop.js) pops anyone who ends up inside the ground, a bridge or a hill back up onto a safe spot.
- ⚽ Soccer Field (`3d/src/26h-soccer.js`, zone 'soccer'): part of the Sports Park on the canal's far bank (its own `BANK_LAND` sector 142 to 166
  and footbridge at 154), shared with 🏈 football (the goals are combo goals with football uprights up to `SOC.UH`). Everything is in the
  field's own space (`SOC`: x along the field, goals at ±`SOC.FL`, +z points back toward the island). The ⚽ pad opens the games:
  🥅 penalty shootout (swipe from the ball to shoot: where it points is where it goes, a quick swipe is hard, a bent swipe curls it;
  then dive by swiping or tapping left/middle/right), 🎯 target practice, 🤹 keepy-uppies and 🆚 1-on-1 vs Kai with ✨ tricks.
  Poses go through `av.socPose`/`av.socK` (14-avatar.js calls `socPoseRun`), the camera wraps `sportsCam`, `spLock` holds you still.
  🆚 3-on-3 with goalies is `3d/src/26h2-soccer-team.js`: you draft your 🦅 Eagles with `teamPick` (sport 'soccer'), the best catcher on each side
  keeps goal, and `socTeamStep` runs the clock, passing (PASS / PASS ME!), tackles, the bots and the keepers; `window.__soccer.team` is for tests.
  Challenges are in the 🏟 Sports tab of `3d/challenges.js`. `3d/tests/soccer.mjs` (run on every PR) plays every game, with a real swipe.
- Townspeople (Ava, Zoe, Mia… in `3d/src/15-player-friends-townspeople.js`, moved by `stepFriend` in `3d/src/25-game-loop.js`) never
  follow you or copy your moves: only the pet you adopted follows you. When you dance or wave, at most the one closest to you claps
  or waves back. `3d/tests/townspeople.mjs` (run on every PR) checks it.
- 🚁 The helicopter and the 🚁 Helipad (between the Basketball Court and the Jump Park): the pad is `3d/src/12h-place-helipad.js`
  (`HPAD`), the helicopter is `3d/src/26h-helicopter.js` (`HELI` is yours, `makeHeli()` builds the model for you and for friends).
  You get it by buying it in the shop's 🦖 Rides tab (`HELI_PRICE` 🪙) or by finishing the 4 challenges in `HELI_EARN` (Explore tab
  of `3d/challenges.js`). It flies itself, not through FLY: `heliStep()` runs in the game loop before `flyStep`, takes off straight up,
  tips its nose and banks like a real one, and uses `flyFloor` (24h-flying.js) to climb over trees and roofs; it only touches down on
  open ground (`heliOpen`). Friends see it through the 'heli' entry in `SHOW`, and a friend standing next to yours while you're in it
  on the ground can 🙋 ride along: the pilot's phone hands out seats with `{t:'heli'}` messages (online.js passes them on) and the
  'hseat' entry sits passengers in their seat on every phone. Keep it real-looking, not a cartoon.
  `3d/tests/helicopter.mjs` (run on every PR) buys and wins it, flies it and lands it on the pad; `3d/tests/heli-friends.mjs`
  flies a friend along with two phones (same setup as `online-see.mjs`).
- 🏈 Flag football is played on the ⚽ Soccer Field (`3d/src/26h-soccer.js` builds the field; the soccer goals carry football uprights, `SOC.UH`).
  `3d/src/26i-football.js` paints the football lines over the grass, adds the 🏈 pad (next to the ⚽ pad) and `FTZ`, the field's football
  directions (z along the field, you always drive toward -z, `ftZ(yard)`). `3d/src/26i2-football-games.js` has the games: 🥅 field goals
  (aim, power, wind), 🏈 a 3-on-3 pick-up game (pick a play, throw to an open receiver, pull the QB's flag to sack him; it's flag football so
  nobody gets tackled), 💥 Sack the QB and 🏃 kick returns. `ftStep()` runs first in the movement chain and `ftCam()` after `sportsCam()`.
  While football is on, it keeps the ⚽ pad quiet (`SC.onPad`). Challenges are in the 🏟️ Sports tab of `3d/challenges.js`.
  `3d/tests/football.mjs` (run on every PR) plays them all.
- 🧢 Team picker (`3d/src/24e3-team-picker.js`), shared by football and soccer: `ROSTER` is the kids you can pick, each with ⚡ speed,
  🎯 throwing, 🙌 catching and 🦵 kicking from 1 to 5. `teamPick({sport,size,title,done,cancel})` runs the draft (you pick first, the
  🐻 Bears captain takes the best one left using `TP_WANT[sport]`) and calls `done(mine, theirs)`. `rosterAvatar(r,color)` gives that
  kid's avatar in a jersey, and `rosterSpeed/rosterHands/rosterArm/rosterLeg(r)` turn stats into numbers for the games.
- 🎄 Seasons: `3d/seasons.js` picks today's holiday. THE SEASON SWITCH is `TOWN_THEME` in that file: a holiday id plus the last day
  it stays on (now Christmas until Dec 30), after which the calendar takes over again; `null` always follows the calendar.
  Holiday shop things are only sold during their holiday but stay yours once bought. Halloween Hollow's pumpkins, ghosts,
  gravestones and purple glow are listed in `Z.halloween.spooky` (`3d/src/05-place-halloween.js`) and only come out for Halloween.
  `3d/christmas.js` is Christmas in town: snow on the ground, the really big tree in the middle (the 👗 dress-up pad moves in front of it:
  the game loop reads `Z.studio.pad.x/.z`), lights round the street lights and along the tops of the buildings (instanced, one draw call
  per half), 🎅 Santa walking round the plaza and out along the paths (a present once a day), ❄️ snowballs and snowball fights
  (first to 5 hits, from the talk buttons), and ⛄ snowmen you roll by walking and stack (saved in `SAVE.xmas.snowmen`).
  Its action buttons come in through `ACT_HOOKS` (`3d/src/19-ui-closet.js`). The 🎄 Christmas tab in `3d/challenges.js` uses `hol: 'christmas'`:
  a challenge with `hol` only shows and counts during that holiday. Keep the Christmas look real, not cartoony.
  `3d/tests/christmas.mjs` (run on every PR) checks the tree, the lights, Santa, a snowball hit, a whole snowman, and that Halloween brings the pumpkins back.
- 🐾 Barn animals and the 🚨 Round-up (`3d/src/26g-town-animals.js`): four barn animals (Waddles, Billy, Truffle, Woolly, in `ROAM_LIST`)
  wander the meadow round the Happy Barn and never follow you (walking up makes one stop and look at you, then it carries on).
  "Start a Round-up" near the barn sends them out onto their own two streets each (street = the `ang` of a place with a path) until
  they're caught: 🪢 Catch puts one on a rope behind you until you reach the barn. A bar at the top lists who's still out.
  Friends online in the room join in through `{t:'roam'}` messages (online.js passes them on); whoever brings the most home wins
  (`did('roundup', 0)`, which also counts as a win for the 🏆 rides). Challenges are in the 🗺️ Explore tab of `3d/challenges.js`.
  🦁 A Safari Round-up starts at the Safari Zoo the same way, with four of the zoo's own animals (`SAFARI_LIST` wraps the real `ZA`
  animals, no copies: `penOut` sets `a.esc` so the zoo stops moving it and its pen empties, `penIn` puts it back), walked back to the zoo. Only one Round-up runs at a time (`RU.grp`).
  🌪️ The All-Animal Round-up (`RU.grp` 'all') starts by the Sparkle Studio: EVERY animal (the barn four, all of the zoo's `ZA`, and
  all of Polar Ice's `IA`, `POLAR_LIST`) bursts out in front of you, runs anywhere you could walk (mode 'loose', `looseSpot`/`looseOk`), bolts when you get
  close and then stops for a breather; you can hold 3 on ropes (`ropeMax`) and each goes to its own home.
  🏠 While you hold one on a rope, `ruGuide()` shows where to take it: a green arrow chip at the top (`#ruGuide`), a glowing beacon over
  each home (`ruBeacon`) and 🏠 on the minimap (kept on the rim when it's off the map). Every "meet/feed this animal" button (barn and runaways,
  zoo, Polar Ice, sea animals) is a round animal icon made by `aniIco()`; the barn/runaway one opens a little card (`#roamPop`) with Feed and Pet.
  Keep it to a few animals so town doesn't get crowded. `3d/tests/town-animals.mjs` (run on every PR) checks it.
- ❄️ Polar Ice (`arctic` zone): the place is `3d/src/12h-place-arctic.js` (`ICE` has where the rink, lake and its fishing holes, and the igloo spot are,
  and `onRink()`), the animals are `3d/src/24c9g-arctic-animals.js` (polar bear, walrus, penguin and chick, arctic fox and wolf, snowy owl, all built
  to look real, not cartoony; added to the zoo animals through `ZOOA` with `arctic:1`), and the 🐻‍❄️ Nanuq, 🦭 Tusk (swims), 🦉 Ukpik (flies) and
  🐺 Amaruq rides are earned like the safari rides from the ❄️ Polar tab of `3d/challenges.js` (ids starting `ice_`). `3d/src/24m-arctic.js` does
  the animals there, ⛸️ skating on the rink (`iceSkateStep`, in the movement chain in 25-game-loop.js; friends see the skates through the 'ice' entry
  in `SHOW`, `3d/src/26i-arctic-see.js`), 🎣 ice fishing and 🧊 igloo building. `3d/src/24m2-arctic-escape.js` is the 🚨 Polar escape: four of the
  animals run off into town, you catch them and walk them home on a rope (online with friends too, `{t:'icerun'}` in online.js).
  `3d/tests/arctic.mjs` (run on every PR) checks all of it.
- 🏟️ Sports Park and ⚾ the Baseball Field (`3d/src/26j-wiffle.js`, zone 'wiffle'; it began as a wiffle ball field, so the ids still say
  wiffle/wif, keep them for saves and challenges): on the far bank across from the Batting Cage (`BANK_LAND` 194 to 218, `ground:1`, footbridge at 202).
  The soccer and football fields are its neighbours along the bank. Field positions are in the zone's own directions with home plate at `(0, WB.HP)`;
  `wfAt(angle, distance)` gives a spot measured from home. It's real baseball, kept small: your 🦅 Eagles (you, Leo, Marcus, Nora) against the
  🐻 Bears (Maya, Sam, Jake, Zara), all in baseball uniforms (`WF_TEAMS`). The team in the field has a pitcher, a crouching catcher (pitches go into her mitt),
  an infielder and an outfielder (`WF_POS`). You bat every time (a teammate comes in as your pinch runner, `wfPutOn`); the Bears bat in order and stay on base
  as real runners (`WF.ob`, moved by `wfAdvance`). No ghost runners and no chalk hit lines: hits still go by where the ball is fielded (caught = out,
  grounder stopped inside `WB.INF` = out, past it single, past `WB.L2` double, past `WB.L3` triple, over `WB.FR` home run), plus a 💥 Home Run Derby.
  Pitching is overhand (`WF_TK`, the throwing shoulder only turns one way so the arm goes back, up and over the top) with real pitches in `WF_PITCH`
  (fastball, curveball, slider, changeup): `wfPitch` works the break into the throw so the ball still ends where it was aimed.
  It plugs into the sports HUD, big button and menu through `SP.ext` in `3d/src/24e-sports.js` (other sports can do the same:
  `SP.ext[mode]={step,press,release,cam,end}`). The Batting Cage's menu sends you over for a real game (its machine is just batting practice now).
  Challenges are in the 🏟 Sports tab of `3d/challenges.js` (`did('wiffle', …)`). Your skateboard isn't carried in your hand at the ball fields
  (`boardStowed()` in `3d/src/17c-skateboard.js`). `3d/tests/wiffle.mjs` (run on every PR) walks over the bridge, opens the menu, plays a quick game
  (checking the overhand throw, the catcher and the runners) and a Derby.
- 🆕 What's new (`3d/src/26k-whats-new.js`): after an update, the first time a player opens the 3D world they get a
  "What's new" card with the notes they haven't seen yet. Each note is remembered on its own by its words (`SAVE.wnSeenK`), so a
  note added later the same day still shows. Places named by a note's `go` get a red NEW tag on the map, the minimap and the
  🗺️ Map button until the player goes there (`SAVE.wnGone`) or the note is `NEW_DAYS` old.
  EVERY PR THAT CHANGES SOMETHING A PLAYER WOULD NOTICE ADDS A NOTE: one short sentence a kid can read, `{e, t, go?, hol?}`, in
  today's entry at the top of `WHATS_NEW` (start a new `{v:'YYYY-MM-DD',notes:[...]}` entry if today's isn't there).
  `go` = the place id from ZONES (adds a 🗺️ Show me button and the NEW tag), `hol` = only during that holiday. Rewording a note
  makes it show again, so don't touch old notes' words. The "What's new note" check (`3d/tests/whats-new-note.mjs`) fails a PR
  that changes 3d/ without adding a note; put `[no-whats-new]` in the PR title or description when players won't notice anything.
  It can be reopened from ⚙️ Settings. Under Playwright it only pops up by itself with `?wn=1`, so other tests aren't covered by it.
  `3d/tests/whats-new.mjs` (run on every PR) checks it.
- 🦖 Dino Valley (zone 'dino', across the canal behind the Barber Shop, footbridge at 312): the valley and `DV` (where the paddocks, pond,
  nest, hut and care pad are; `dvOk`/`dvSpot` meadow, `dvTOk` T. rex paddock, `dvROk` raptor pen) are `3d/src/12i-place-dino-valley.js`, the land
  and the footbridge `3d/src/26y-dino-valley-land.js`, its own dinosaurs (`DVA`, met through `openZoo`) `3d/src/24n-dino-valley.js`, and the
  real-looking models (`ZOO_BUILD.trexR/raptorR/trikeR/longneckR/stegoR`, facts in `DINOA`) `3d/src/24c9h-dinos.js`. Dinosaurs never go in the
  🐴 Happy Barn: FARM entries with `dino:1` live in Dino Valley (`HOMES`/`farmHome` in `3d/src/24d-barn.js`), and the barn sheet opens
  there as `openBarn('dino')` from the glowing footprint pad, showing only them. Adopted ones reuse the models through `model:` with `scale:`
  (rides get `dnSaddle`, see the note on each builder for `ride`). Kid-safe: nobody chases or bites; the T. rex just roars.
  `3d/tests/dino-valley.mjs` (run on every PR) checks it.
  🏆 Big dinosaurs: `3d/src/24c9i-dinos-more.js` has the real-looking Parasaurolophus (`parasaurR`) and Pteranodon (`pteroR`) and
  `dinoRideList()`, a big grown-up of every young dinosaur (Tank, Spike, Tuba, Dash, Rex, Atlas and Zephyr who flies, `DINO_BIG`), earned like
  the safari rides from the 🦖 Dino tab of `3d/challenges.js` (ids start `dino_`). They reuse the same models with a bigger `scale:`; you sit at
  `F.ride` = scale × (body height + saddle) + .06, worked out on each builder. 🦴 The Fossil Dig (`DV.dig`) and what the challenges count
  (`dinoState()`: fossils, days visited, riding steps, big ones ridden) are `3d/src/24n2-dino-rides.js`.
  🐉 Dragons: `ZOO_BUILD.dragonR` (`3d/src/24c9j-dragon.js`) is the one real-looking dragon; colours come from `F.dcol`, so Ember the baby dragon,
  ⭐ Nova and 🐉 Draco (the hardest Dino challenges, grp 'draco') all use it. Its wings fold on the ground and open to fly; no fire, just a puff of smoke.
  `3d/tests/dino-rides.mjs` (run on every PR) checks they stay locked until earned, the dig, the saddles, and that Zephyr and Draco fly.
- `3d/tests/walk.mjs` checks on every PR that the character actually walks on an iPhone-size screen. Run it yourself with
  `npm i --no-save playwright && npx playwright install chromium && node 3d/tests/walk.mjs`.
- The 3D world reports errors, lost graphics and "tried to walk but didn't move" to the same `dressup_errors` list as the
  2D studio (snake game's Firebase project), marked `where: 3D world …`.
- Graphics memory (`3d/src/01c-memory.js`): iPhones drop the whole 3D picture when the game uses too much of it.
  When you throw a 3D thing away for good (an old avatar, a ball, a picture's model), call `freeObj(thing)` after removing it,
  or its shapes and pictures stay on the graphics chip forever. Identical shapes are shared automatically by `shareShapes()`
  at start-up and on every `Avatar.dress`, so never change a shape's numbers (`geometry.translate`, writing to `attributes`)
  after the game has started, unless it's a plain `BufferGeometry` or `PlaneGeometry` (those are never shared).
  When the phone gives the graphics back, the game carries on by itself in Light mode.

- Guy hair (`3d/src/14e2-guy-hair-real.js`): each guy cut in `GUY_REAL` is a shell that follows the head with a natural
  hairline, plus locks of hair (strands, spikes, curls, locs, a bun) merged into one shape and cached, so friends with the same
  cut share it. A guy's hat is sized to his hair by `fitGuyHat` and the hair under it is pressed flat by `guyHatPress`.
  When you add a guy cut, give it a `thick`, `flow` and `uv` (and `locks` for texture), and keep it under 60,000 points:
  `3d/tests/guy-hair.mjs` (run on every PR) checks each cut looks like its name and hats sit on the hair.

## Outfits go in both games
- Everything you can wear in the 2D studio (`index.html`) must also be wearable in the 3D world, and the other way round,
  with the same id, for girls and for guys. Add a new outfit, costume, hair style or accessory to both in the same PR.
- 2D: guy-only items have `guy:1`, and `GUY_OK` lists what guys see. 3D: guy lists are in `3d/src/14c-guy.js`; things
  brought over from 2D are added in `3d/src/14e-match-2d.js`.
- `3d/tests/closets-match.mjs` (run on every PR) fails if an id is in one game's closet but not the other's.
