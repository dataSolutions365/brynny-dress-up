# Making your own changes to Brynny's Dress-Up

This is a plain-English map of the game's code: what each part does, where to find it, and how to make the
easy changes yourself (prices, coin rewards, challenges, outfits, townspeople, holidays, the secret Daddy powers).
You don't need to be a programmer for most of these. You only need to change numbers and words.

If something looks scary, you can always ask Claude in the project to make the change for you instead.

---

## 1. The big picture

There are really two games in this repo that share music, your picture and the family online code:

| What | Where | Notes |
|---|---|---|
| **2D Dress-Up Studio** (the first game) | `index.html` | One big file: the doll, the salon, makeup, the closet, places, music. |
| **Pet page** | `pets.html` | One file. |
| **3D world** (the island) | `3d/` folder | Split into many small files. See below. |
| Offline / "Add to Home Screen" | `sw.js` | The list of files the phone saves so it works with no internet. |
| Family-only online play | `family.js`, `3d/online.js` | The secret family word and rooms. Leave these alone unless something breaks. |
| Your picture in the corner | `pics.js` | Shared by both games. |

### The 3D world, and the one rule you must know

The 3D game's code lives in **`3d/src/`**, one small file per feature. A little script joins them all into one file,
**`3d/game.js`**, which is what the web page actually loads.

> **Never edit `3d/game.js` by hand.** Edit the file in `3d/src/`, then run `node 3d/build.mjs` to rebuild it.
> Commit both. If you forget, the GitHub check on your pull request turns red and says
> "3d/game.js is out of date". That's your reminder, nothing is broken.

Three files in `3d/` are **not** part of the build, so you can edit them directly with no rebuild step:

- `3d/challenges.js`: the ⭐ star challenges
- `3d/seasons.js`: holidays (Halloween, Christmas, Valentine's Day...) and their costumes
- `3d/index.html`: the buttons, menus and colors (HTML and CSS)

---

## 2. Trying it on your computer

The 3D world won't open by double-clicking the file (browsers block that for safety), so run a tiny web server:

1. Install [Node.js](https://nodejs.org) (the "LTS" version) if you don't have it. Python works too.
2. Open a terminal in the repo folder and run **one** of these:
   - `npx serve .`
   - `python3 -m http.server 8000`
3. Open the address it prints (for example `http://localhost:8000`). The 3D world is at `/3d/`.

After you change something in `3d/src/`, run `node 3d/build.mjs` and reload the page.

**Your saved game:** the game saves in the browser (`brynny3d.v1` for 3D). Testing on your computer won't touch
Brynny's saved progress on her phone.

**Editing on github.com instead:** you can click a file, press the ✏️ pencil, change it and save it to a new branch.
That's perfect for `3d/challenges.js`, `3d/seasons.js`, `index.html` and `pets.html`. For anything in `3d/src/` you
still need the rebuild step, so it's easier to do those on a computer (or ask Claude).

**When it goes live:** the website (GitHub Pages) updates a minute or two after a change is merged into `main`.

---

## 3. Where each feature lives (3D world)

Files run in name order, so the number at the front only decides the order. All files share their variables, so
something made in one file can be used in another.

**Setup and the island**

| Feature | File |
|---|---|
| Basic setup, the girls' closet lists, **the shop and its prices** | `3d/src/01-setup.js` |
| The island, and the list of places (`ZONES`) with each place's music | `3d/src/02-island.js` |
| Park, hidden stars | `3d/src/13-park-and-stars.js` |
| Map and the minimap | `3d/src/26-map.js` |
| The game loop (runs every frame: walking, jumping) | `3d/src/25-game-loop.js` |
| Touch / keyboard controls | `3d/src/17-input.js` |
| Sounds and music player | `3d/src/18-sound.js` |

**Places** (the buildings themselves): `03-place-sparkle-studio`, `04-place-birthday`, `05-place-halloween`,
`06-place-christmas`, `07-place-beach`, `08-place-runway`, `09-place-spring-garden`, `10-place-pet-parlor`,
`11-place-bakery`, `11b-place-garage`, `12-place-model-agency`, `12b-place-barber-and-store`, `12b-place-barn`,
`12c-place-sports`, `12d-place-zoo`, `12e-place-jump-park`, `12f-place-skate-park`.

**What you do in each place** (the activities):

| Activity | File |
|---|---|
| Pet Parlor (feed, bath, paws) | `20-pet-parlor.js` |
| Bakery, cake contest, pet contest | `21-bakery.js`, `21b-cake-contest.js`, `21c-pet-contest.js` |
| Coins, the shop window, the welcome screen, daily gift | `22-shop-welcome.js` |
| Talking to townspeople | `23-talk.js` |
| Model agency, glam mirror, model contest | `24-model-agency.js` |
| Nail painting, makeup studio | `24b-nail-painting.js`, `24c-makeup-studio.js` |
| Barber and clothing store, garage | `24d-barber-and-store.js`, `24d-garage.js` |
| Happy Barn animals and barn rides | `24d-barn.js` |
| Zoo and safari animals / rides | `24c9-zoo-okapi-elephant.js`, `24c9b-safari-rides.js`, `24c9c-safari-more.js` |
| Basketball and batting, matches vs friends | `24e-sports.js`, `24e2-sports-friends.js` |
| Sandcastle | `24f-sandcastle.js` |
| Shop rides, flying, earned rides | `24g-mounts.js`, `24h-flying.js`, `24i-earned-rides.js` |
| Skate park tricks, jump park, ball play | `24k-skate-park.js`, `26e-jump-park.js`, `26d-ball-play.js` |
| Dolphin Bay (swimming) | `26f-ocean.js` |
| Secret Daddy powers | `27-daddy-powers.js` |

**The character and clothes**

| Feature | File |
|---|---|
| The avatar's body, face and how clothes go on | `14-avatar.js` |
| Outfits brought over from the 2D game | `14b-outfits-2d.js`, `14e-match-2d.js` |
| **Guy closet lists** (hair, suits, tops, shoes, hats...) | `14c-guy.js` |
| Store fashion (outfits bought at the clothing store) | `14d-fashion.js`, `14d-fashion2-earned.js` |
| Sports outfits, barber looks, dances, roller skates | `14c-sports-outfits.js`, `14d-barber-looks.js`, `14d-dances.js`, `14f-roller-skates.js` |
| The closet screen | `19-ui-closet.js` |
| Pets, and pet outfits | `16-animals-pets.js`, `19b-pet-outfits.js` |
| **Townspeople and friends** (names, chat lines, little quests) | `15-player-friends-townspeople.js` |
| Skateboard, bike | `17c-skateboard.js`, `17d-bicycle.js` |
| What friends online can see of you | `26c-friends-see.js` |

---

## 4. Easy changes, step by step

Each item says which file, what to look for (use your editor's search, Ctrl+F / Cmd+F), and what to change.
After any change in `3d/src/`, run `node 3d/build.mjs`.

### 🪙 Shop prices
**File:** `3d/src/01-setup.js`, look for `const SHOP=[`.

Every line is one thing you can buy. `p:` is the price in coins, `n:` the name, `d:` the description:

```js
{k:'look:stargown',tab:'outfits',e:'🌌',n:'Starry gown',p:120,d:'A night-sky gown that sparkles with little stars.'},
```

Change `p:120` to `p:80` and the Starry gown costs 80 coins. Don't change the `k:` part, that's how the game
remembers who already bought it.

Holiday items have their prices in `3d/seasons.js` (the `p:` inside each holiday's `items`). Store fashion prices
are the last number in each line of `FASHION_GUY` / `FASHION_GIRL` in `3d/src/14d-fashion.js`.

### 🪙 How many coins things give you
- **Starting coins** (new players): `3d/src/22-shop-welcome.js`, first lines: `SAVE.coins=30`.
- **Daily gift**: same file, look for `earn(20,'Daily gift')`. Also change the `+20 🪙` text a few lines lower.
- **Stars and quests**: same file, `earn((n-starSeen)*5,'Star!')` (5 coins per star), `earn(50,'Every star!')`,
  and `*20,'Quest done!'`.
- **Contest prizes** (1st, 2nd, 3rd, 4th place):
  - Model contest: `const PRIZE=[50,30,20,10]` in `3d/src/24-model-agency.js`
  - Cake contest: `CK_COINS=[20,15,10,5]` in `3d/src/21b-cake-contest.js`
  - Pet contest: `PC_COINS=[20,15,10,5]` in `3d/src/21c-pet-contest.js`
- **Other rewards**: search `3d/src` for `earn(`. Each one looks like `earn(8,'Cake made!')`: the number is the coins,
  the words are what pops up.

### ⭐ Star challenges
**File:** `3d/challenges.js` (no rebuild needed). Look for `const LIST = [`.

```js
{ id: 'pose5', tab: 'runway', e: '🌟', t: 'Strike 5 poses on the runway', r: 2, go: 'runway', goal: 5, ev: { k: 'pose' } },
```

- `t:` the words you see. `e:` the emoji.
- `r:` how many ⭐ stars it's worth.
- `goal:` how many times you have to do it (change 5 to 3 to make it easier, and fix the words in `t:` to match).
- `tab:` which tab it shows in. The tabs are listed in `const TABS` further down the same file.
- **Don't change `id:`**. Saved progress and some rides (safari and ocean rides) look challenges up by id.

To **add** a challenge, copy a line that's similar to what you want (same kind of thing to do), give it a new
unique `id`, and change the words and numbers. The easiest ones to copy are those with `ev: { k: '...' }`:
`'pose'`, `'feed'`, `'bath'`, `'cake'`, `'talk'`, `'buy'`, `'act'` (a move), and so on.

### 👗 Outfits, colors and names
- **Girl closet lists**: `3d/src/01-setup.js`, the lists `TOPS`, `BOTTOMS`, `DRESSES`, `SHOES`, `HATS`, `EXTRAS`.
- **Guy closet lists**: `3d/src/14c-guy.js`, `GUY_TOPS`, `GUY_BOTTOMS`, `GUY_OUTFITS`, `GUY_SHOES`, `GUY_HATS`, `GUY_EXTRAS`.

Each item looks like `['cape','🦸','Cape','#e0263b']`: id, emoji, name, starting color.
**Renaming** (the third part) and changing the **starting color** (a [hex color](https://htmlcolorcodes.com)) are safe.
Don't change the id.

**Adding a brand-new outfit** is a bigger job: it has to be drawn in 3D, and it must also be added to the 2D game
(`index.html`) with the same id, or the `closets-match` check fails. That's a good one to ask Claude for.

### 💬 Townspeople
**File:** `3d/src/15-player-friends-townspeople.js`, look for `const TOWN=[`.

Each friend has `n:` (name), `home:` (which place they hang out), `hi:` (hello lines), `chat:` (things they say).
Change the words inside the quotes, or add more lines to `chat:`. If a line has an apostrophe, write it as `\'`
(like `I\'m`), or use the "curly" ’ instead.

### 🎃 Holidays
**File:** `3d/seasons.js` (no rebuild needed). Look for `const HOLIDAYS = [`.

`when:` sets the dates, using `md(month, day)`. For example Halloween is `[md(10, 1), md(11, 2)]`, October 1 to
November 2. `hello:` is the message when the game opens. `items:` are the holiday things for sale.

### 🎵 Music for each place
`3d/src/02-island.js`, `const ZONES=[`. Each place has `music:'sea-waves'`, which is a file in the `audio/` folder.
If you add a new song file, also add it to the `MUSIC` list in `sw.js`, or it won't play offline.

### 🦸 The secret Daddy powers
**File:** `3d/src/27-daddy-powers.js`. The comment at the top explains every power.

- **How it turns on:** type your name as `" Daddy"`, with a **space in front**, on the welcome screen or in Settings.
  A 🦸 Hero button appears on that phone only. Typing "Daddy" without the space is just a normal name.
- **Turning it off for a while:** just change your name in Settings to anything else (or "Daddy" with no space).
  The code stays, but nobody can find it.
- **Changing the secret word:** look for `const DAD_KEY=/^\s+daddy\s*$/i;` and `const daddyKey=` in that file.
  Change `daddy` in **both** to another word (lowercase letters only), then rebuild.
- **Removing it for good:** the "TO REMOVE" note at the top of the file lists the 4 small lines in other files to
  delete. Each is marked `DADDY POWERS` so you can search for it. Then rebuild.
- **Tuning a power:** e.g. the super jump height is `player.vy=17` in `daddyJump()`. Bigger is higher.

### ✨ The 2D studio
`index.html` is one big file. Search inside it for what you want: `const TOPS=[`, `const DRESSES=[`, `const HAIR=[`,
`const TRACKS=[` (the built-in songs), `const SKIN=[`, `const HAIRC=[` (hair colors), `const CLOTHC=[` (clothing colors).
No rebuild needed.

---

## 5. Making the change "official" (GitHub)

1. Make a branch, change the file(s), and if you touched `3d/src/` run `node 3d/build.mjs`.
2. Open a pull request. GitHub runs checks automatically: that `3d/game.js` is rebuilt, that the character can still
   walk on an iPhone-size screen, that rides, swimming, skate park, haircuts and closets still work.
3. Green ✅ means it's safe to merge. Red ❌ means look at the message: most often it's "run `node 3d/build.mjs`".
4. Merge, and the website updates in a minute or two. On Brynny's phone it updates next time the game opens online.

## 6. If something breaks

- **Blank screen or the game won't start:** usually a typo, like a missing comma, quote or bracket. In the browser,
  open the developer console (F12, or right-click → Inspect → Console) and it shows the file and line number.
- **Undo:** on GitHub you can revert a merged pull request with the "Revert" button on its page.
- **Easiest of all:** ask Claude in the project what went wrong and to fix it.

## 7. For deeper changes

`CLAUDE.md` in the main folder has detailed technical notes (graphics memory on iPhones, how friends see you
online, the automatic tests in `3d/tests/`). It's written for programmers, but it's a good next read.
