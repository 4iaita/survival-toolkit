# Survival Toolkit: working on the Mobs tab's stage backgrounds

The user reviews the mob stage backgrounds by number (`#18 · village`) from a numbered gallery, then asks for changes
one at a time. This is how to do that quickly.

## The loop

1. Find the background's scene in `src/backdrop.js` (`BACKDROPS.<biome>`) and the props it uses.
2. Edit, then rebuild the page: `python3 build.py` (writes `index.html`, the only file the page runs from).
3. Capture just the backgrounds you changed, with the mob hidden, into `tools/backdrops/out` (gitignored; the user keeps
   the gallery there open, so always capture there, never into a scratchpad):
   `node tools/backdrops/capture.mjs tools/backdrops/out <biome>[,<biome>...]`
   It names each file `NN_<biome>.png` with its gallery number. Leave out the biomes to capture all 34 (about 3 minutes;
   run it in the background). `SHOW_MOB=1` in front keeps the mob in the picture, to check the scene fits round it
   (capture those into the scratchpad, not `out`, so the gallery stays mob-free).
4. Look at the PNG (crop and enlarge with `sips` for detail), and fix it until it's right before showing the user. For
   anything that changes the middle or the scale, also capture with `SHOW_MOB=1` and look, and send that picture with
   the gallery.
5. After every change, always rebuild the gallery and send it: `python3 tools/backdrops/gallery.py tools/backdrops/out`,
   then SendUserFile `tools/backdrops/out/mob-backgrounds.html` (display `render`). The gallery needs a full capture in that
   folder first (step 3 without biomes) so every number has a picture; after that, recapture only what changes (and its
   `_night`, if it reuses the day scene).
6. When the user wants to see it live: preview_start `survival-toolkit` (from `.claude/launch.json`; the port may
   differ if another chat holds 8765), open `/index.html#mobs`, then run `pickMob("<mob key>", "")` in the page to pick a
   mob. Reload after each build.

Nothing here is committed unless the user asks.

## How the user asks, and what to do

- "#N · key: remove / move / add X": do exactly that and nothing else. Anything more you think it needs (raising the
  ground so new blocks show, moving other things, a second tweak) is the user's call: say what and why, and ask. The
  user was unhappy when a request for magma blocks also got the lava sea raised a block.
- "Fully rebuild, do research if needed": read the biome's (and any structure's) Minecraft Wiki page with the web-fetch
  agent first, drop what doesn't belong to that biome, and build from what the page says. Keep anything the user says
  they like (the swamp's witch hut). Expect a few rounds of fixes after; take them one by one.
- "Return it / I don't like it": put back the earlier version exactly (from the diff or your own earlier edit), not a new
  take on it.
- "X replaces Y" (dropping a background): point every `biome: "Y"` in `src/mob-data.js` and `src/tag-data*.js` at X, then
  delete Y's scene and everything only it used: its helpers in `src/backdrop.js`, its colors in `src/mob.css`, its
  tints in `src/art.js` (`BIOME_TINTS`), its floor in `src/villager.js`, and mentions in header comments. Leave its
  textures in `art/`. Recapture everything (numbers shift) and update the list below and the memory note.
- "Make it symmetric": measure on the capture (pixels from each edge), don't eyeball; an odd-width prop is half a block
  off the grid, so place it at a half block (`-7.5`).
- When the user asks why something looks off, say why, and if the fix isn't obvious offer the choices instead of
  guessing.
- To show the result live: see step 6 of the loop; pick a mob whose own (default) look stands on that background.

## Gallery numbers

The order is the order the mobs, their variants, rows and name tags first show each background (`capture.mjs` writes it
to `index.json` with every mob that shows it):

1 savanna · 2 cave · 3 plains · 4 desert · 5 swamp · 6 snowy · 7 cherry_grove · 8 dappled_forest · 9 taiga · 10 jungle ·
11 peaks · 12 mushroom_fields · 13 badlands · 14 lush_pool · 15 ocean · 16 flooded_cave · 17 swamp_water · 18 village ·
19 swamp_night · 20 trial_chamber · 21 desert_night · 22 mineshaft · 23 pale_garden_night · 24 sulfur_caves ·
25 pale_garden · 26 ocean_night · 27 snowy_night · 28 mansion · 29 plains_night · 30 stronghold · 31 deep_dark ·
32 nether · 33 end_island · 34 end_city

The grove, the snowy, old growth pine and spruce taigas, the savanna plateau, the sparse and bamboo jungles, the
forest and the mangrove swamp were dropped (2026-11-21) as near copies: their mobs use snowy, taiga, savanna, jungle
and plains instead (the warm frog the jungle).
Don't bring them back without asking.

If a change moves which mob first shows a background, the numbers shift. Run the capture for the changed biomes, compare
`index.json` with the old order, and if it moved, rename the existing PNGs to their new numbers (each is
`NN_<biome>.png`) rather than recapturing all, then update the list above.

Which mob shows which background: `biome` on the mob in `src/mob-data.js` (`MOBS`), on its variants (`MOB_VARIANTS`) and
rows (`MOB_ROWS`), and on name tags in `src/tag-data*.js`.

## Where things are

- `src/backdrop.js`: every scene (`BACKDROPS`) and the drawing (`backdropView`). Read the header comments of the helpers
  you touch.
- `src/mob.css`: each stage's `--sky` and `--haze` colors, and the ground strip's brightness, by `data-biome`.
- `src/trade.css`: the clouds (`.stage::before`), shared by every stage; the jungle has its own placement.
- `src/villager.js`: the ground strip's texture for each biome (`groundArt`).
- `art/`: the 16×16 textures the page embeds (a taller one is animation frames; the first frame is used). Add one by
  copying it from `../textures/blocks/` and registering it in `import_textures.py` (`FILES`) so a re-import keeps it.

The Villager Trades tab draws the village biomes with the same scenes, so changing plains, desert, savanna, snowy, taiga,
swamp, jungle or village changes that tab too. A `_night` biome reuses its day scene unless it has its own (the plains',
the pale garden's).

## How a scene is built

- `near`: props standing on the floor, `[prop, at]`, `at` being the prop's left edge in blocks from the stage's middle.
  The stage is usually 500px wide at 16px a block, so about −15.6 to +15.6 is in view; the mob stands in the middle.
- `prop(rows, legend)`: rows top first, each letter a block from the legend, `.` empty. `block(name, rows)` only knows
  the letter `B`.
- A block: `blockTex(name, tint, more)`. Options in `more`: `rows` (a strip of the texture), `under` (a color behind see-
  through texture), `cap: false` (no snow on it in snowy scenes), `parts` (pieces of a texture placed in the block),
  `rects` (flat-colored boxes), `squash` (the whole texture squeezed into some rows), `shade` and `lintel` (shadows),
  `backing`, `glow`. `plantTex(name)` is a plant (no snow cap).
- `hills`: the far hills at half size (8px a block), with `trees` and `landmarks` placed at a fraction of the width. Trees
  stand on the ground under their trunk; the ground under a landmark is leveled. `profile` draws the hill line by hand.
  `top` may be a list (mixed along the tops); `bareBelow` leaves tops lower than that bare (the badlands' low mesas).
  `snowDepth`: the top block lies that deep on gentle slopes, thinning to one on steep faces (the jagged peaks' snow).
  `liquid: [level, block, [bed, how often]]`: columns no higher than level get that block on top (the nether's far lava
  sea), and now and then `bed` right under it (magma). `ores`: `[[names], how often]` sprinkled in the fill. `jag`: how
  many columns wide each bump on a peak's slope is (wider ones stop one-block spikes).
- `wall`: a back wall instead of hills. Either random rock (`rock`, `ores`) or a plan (`pattern`, `legend`, repeated
  across, its last row on the floor), with `dim` to shade it. `nearDim` shades the near props too.
- `ceiling`: rock along the top with things hanging (`drip`, `hang`: how often), or `blobs` placed by hand
  (`[at, rows, block]`, the nether's two glowstone blobs); `low` brings it down toward the floor.
- `sky`, `water`, `night`, `lights` (`[at, up]`) with `lightColor`, `lightSize`, `lightStrength`, `glows`.
- A full-size ground row with water cut into it (the swamp's `swampGround`): when the ground has pools, draw the land
  and the water as one near prop a block high, plants in rows over it, and lift what stands on it a block
  (`lifted`). Half-size far land next to full-size banks looks like two different blocks.
- `wall.props`: things drawn in the far wall itself, `[prop, at, up]` (`up`: blocks over the floor), hazed like the wall
  (the mineshaft's corridor, `mineCorridor`).

## Lessons learned (check these first)

- Many block textures are sheets of parts (a model's UV layout), not pictures: lantern, soul lantern, bell, candle, sea
  pickle, flower pot, end portal frame's eye, chain, decorated pot. Drawn whole they look broken. Dump the texture's
  alpha to find the parts, and draw them with `parts` (see `lanternTex`, `BELL`, `CANDLE`, `SEA_PICKLE`, `potted`).
- Keep `parts` and `rects` on whole texels; half texels blur.
- Plant textures drawn at half size (on the far hills) turn to noise; leave them off.
- Prop letters must be in its legend, or the block is silently not drawn.
- Rebuilding a structure (trial chamber, deep dark, mansion, stronghold): the user wants it to match the game. Read the
  Minecraft Wiki page first (with the web-fetch agent), then build from what it says.
- The user doesn't want far props peeking from behind near ones (trees behind trees, roofs behind roofs).
- Far trees must not sit right behind near ones, and hidden far trees are better removed than left peeking. After
  moving near props, check every far tree and landmark is still in a clear gap.
- Don't mix scales: something standing on full-size (16px) ground must be full size too; far (8px) props belong on
  far hills only.
- Dark structures far off (the nether fortress) vanish into a dark haze. The user didn't like them tinted or shaded;
  instead make the stage's `--haze` a lighter fog so they stand out as silhouettes.
- A glow in the gallery that isn't in the scene may belong to the mob (the blaze's halo, `.stage-light`); the capture
  hides it now. Check by picking another mob on the same background.
- Some pack textures are made pale to be tinted (sugar cane, `reeds`): tint them with the biome's grass color.
- Jagged far shapes: snow lying a different depth column to column, or peaks bumping one column at a time, leave lone
  one-block spikes; the user asked for them gone. Smooth over several columns (`snowDepth`, `jag`).
- After every change, capture and look before reporting.
