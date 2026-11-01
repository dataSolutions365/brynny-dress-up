# Brynny's Dress-Up Studio 👗

A birthday dress-up game that runs in any web browser (phone, tablet, or computer). No install, no game engine, and free to host on GitHub Pages.

## What's in it
- Live camera: snap a selfie, record short videos (saved in the Gallery), and record your voice into My songs
- Selfie face: take a picture, fit it in the oval, and put your real face on the doll, as a photo or a cartoon (stays on the device)
- Cartoon or fashion-doll look, skin tones, eye colors
- 3D-style doll: lighting and rounded shading on body, hair, and clothes, with blinking eyes
- Hair salon: cut, grow, braid it yourself (a strand-crossing mini-game), twirl to curl, comb out, bangs, color spray, and clips, done right on the picture; plus 10 quick styles in 12 colors (including rainbow)
- My Art: take a picture of a drawing on white paper; the paper is removed and the drawing becomes clothes, a dress, a hat, shoes, something to hold, or a background
- Makeup: paint it on with a finger or mouse (lipstick, blush, eyeshadow, eyeliner, face paint, glitter), plus quick-pick makeup and lashes
- Tops, bottoms, dresses, shoes, hats, and extras, each in any color
- Places: Sparkle studio, My room, Birthday party, Halloween, Christmas, Wedding, Beach, Runway
- Add friends and family by name and dress them up too
- 3D world: day and night (the sky gets dark, stars and the moon come out, street lights glow), with a choice in Settings
- Holidays that turn on by the date: Halloween (Oct 1 to Nov 2) with jack-o'-lanterns, bats, costumes, trick-or-treating and a costume contest; Thanksgiving (Nov 3 to 30); Christmas (December) with snow; plus New Year's, Valentine's Day, St. Patrick's Day, Easter and the Fourth of July. Add more in `3d/seasons.js`
- Save looks to a gallery and download them as pictures
- Music: Brynny's Song (plays at the birthday party), 7 built-in songs (Sparkle Pop, Dreamy Studio, Happy Birthday, Spooky Night, Jingle Bells, Here Comes the Bride, Runway Beat), a "Match the place" mode, tap sounds, and her own songs added from the device

Everything saves on the device that's playing it (browser storage).

## 3D world (new)
A 3D version lives in the `3d/` folder (open `3d/index.html`, or `/3d/` on the website). Walk around an island with a Sparkle Studio, Birthday Party, Halloween Hollow, Christmas Village, Beach, Runway, and Spring Garden; change clothes in the closet; meet friends; and collect 24 stars. On a phone, drag on the left side of the screen to walk and on the right side to look around. It uses the same music files as the 2D studio.

In the 3D world you can also:
- Do moves from the buttons around Jump: wave, dance, twirl, kiss, clap, cheer, flip, sit, pose, curtsy, magic, and star jump. Tap ⋯ for more.
- Do close-up makeup in the closet's 💄 Makeup tab: zoom to the eyes or lips, draw on the face with your finger, and pick eyeshadow, eyeliner, lashes, face gems, lipstick, lip liner, gloss, and blush.
- Pick your look: a glam fashion-doll girl (the default) or a cute cartoon, on the welcome screen or in the closet's Face tab.
- Adopt a pet. Walk up to a kitty, puppy, squirrel, or bunny and tap Adopt, and it follows you everywhere.
- Visit the Star Model Agency. Sit at the glam mirror in the dressing room for makeup, salon hair (updo, beach waves, side braid, high pony, glossy blow-dry), a manicure, and a pedicure; then enter the model contest: 3 themed rounds, a runway walk with a pose mini-game, 3 judges, 3 rival models, and coin prizes.

### Working on the 3D code
The 3D game is split into small files in `3d/src/`, one per feature (each place, the avatar, pets, the bakery, the shop, the glam mirror, the map). After changing one, run `node 3d/build.mjs` to rebuild `3d/game.js`, which is what the page loads. Don't edit `3d/game.js` directly.

## Play it
Open `index.html` in a browser, or visit the GitHub Pages link for this repository.

## Ideas for later
- Cloud saving with Firebase so looks follow her across devices
- More events and outfits
- Upload your own drawings as clothes or backgrounds
- Boy characters
