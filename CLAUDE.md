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
- 📍 The Places tab of ⭐ Star Challenges (`placesHTML()` in `3d/challenges.js`) is a legend of every place in town with the challenges
  you do there, grouped by each challenge's `go` place (no `go` puts it under "Anywhere in town"). Give a new challenge a `go` and it shows up
  under that place by itself. `3d/tests/challenge-places.mjs` (run on every PR) checks every challenge is listed once.
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
  `mtH()`, used for both the rock you see and the ground you walk on; `advBlock()` stops walking up the steep rock (only the `TRAIL` and the climbing
  `WALL` go up) and stops you stepping off the ropes course (the harness). `advStep()` moves you on the ladder, the wall and the `ZIPS`; friends see
  it through the 'adv' entry in `SHOW`. `3d/tests/adventure.mjs` (run on every PR) does the whole thing.
- 🗺️ The big world (`3d/src/26z-big-world.js`): past the canal's far bank the land keeps going out to `WORLD.out`, with mountains all round
  the edge, split into `REGIONS` (🏔️ Snowy Peaks, 🌻 Sunflower Hills, 🌲 Whispering Woods, 🏞️ Crystal Lake, 🏜️ Sunset Canyon, 🍎 Apple Orchard).
  It's all 🚧 blocked off (a fence with "Coming soon" signs; you can't walk, swim or fly in) until a place opens there. To open a new area,
  build the place in its own file (named to sort before `26z`), push its `BANK_LAND` sector (add `own:1` if it draws its own ground) and a
  footbridge into `BANK_BRIDGES`: the hills there flatten, the trees step aside and the fence goes round its edge by itself. Write positions
  relative to `R`, `BANK` and `WORLD`, never raw numbers, so the world can keep growing. The ground is one shape (`WG`, `groundH(x,z)` reads it)
  and every tree/rock kind is one instanced shape, to stay cheap on phones. The big map opens on the island (zoom step 1); ➖ zooms out to the
  whole world with each region striped and 🔒 named. `3d/tests/big-world.mjs` (run on every PR) checks it.
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
  🦁 A Safari Round-up starts at the Safari Zoo the same way, with the safari runaways in `SAFARI_LIST` (hidden copies until it starts,
  walked back to the zoo). Only one Round-up runs at a time (`RU.grp`).
  🌪️ The All-Animal Round-up (`RU.grp` 'all') starts by the Sparkle Studio: every runaway (barn, safari, and the polar ones in `POLAR_LIST`
  once Polar Ice is in town) bursts out in front of you, runs anywhere you could walk (mode 'loose', `looseSpot`/`looseOk`), bolts when you get
  close and then stops for a breather; you can hold 3 on ropes (`ropeMax`) and each goes to its own home.
  Keep it to a few animals so town doesn't get crowded. `3d/tests/town-animals.mjs` (run on every PR) checks it.
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
