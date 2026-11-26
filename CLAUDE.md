# Survival Toolkit: working on the Mobs, Equipment, Potions, Banners, Fireworks, Decorated Pots and Armor Stands tabs

Most of this is about the Mobs tab's stage backgrounds; the rest of that tab is at the end ("The Mobs tab's controls and facts",
"Finding what's unused"). For the Equipment tab, read "The Equipment tab"; for the Potions tab, "The Potions tab"; for the Banners tab, "The Banners
tab"; for the Fireworks tab, "The Fireworks tab"; for the Decorated Pots tab, "The Decorated Pots tab"; for the Armor Stands tab, "Armor Stands, section by section".

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
6. When the user wants to see it live: preview_start `survival-toolkit` (a chat started in `~/Personal` reads that folder's
   `.claude/launch.json`, port 8770; one started here reads this folder's, 8765; another chat may hold either), open `/index.html#mobs`, then run `pickMob("<mob key>", "")` in the page to pick a
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
  textures in `art/` (the ones left from earlier drops went in the cleanup of 2026-11-24, which the user asked for). Recapture everything (numbers shift) and update the list below and the memory note.
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
- `src/backdrop-motion.js`: what moves in a background, drawn on a canvas of its own (`.stage-motion`) over the still picture.
  See "What moves in a background".
- `src/mob.css`: each stage's `--sky` and `--haze` colors, and the ground strip's brightness, by `data-biome`.
- `src/trade.css`: the stage itself. Its CSS clouds are only the armor stands' and the potions' stage's (`.prop-stage::before`); a backdrop's are `drawClouds`.
- `src/villager.js`: the ground strip's texture for each biome (`groundArt`).
- `art/`: the 16×16 textures the page embeds (a taller one is animation frames; the first frame is used). Add one by
  copying it from `../textures/blocks/` and registering it in `import_textures.py` (`FILES`) so a re-import keeps it.

The Villager Trades tab's link (`#trading`) opens the villager in the Mobs tab (`openVillagerTrades` in `src/mob-ui.js`), so its own stage
isn't seen. A `_night` biome reuses its day scene unless it has its own (the plains',
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

## What moves in a background

Every background has an animation, added one by one and approved by the user (2026-11-24 and 25):

- Air bubbles (`drawBubbles`): 14, 15, 16, 17, 26. Gas off the sulfur pools (`drawGas`, `sulfurPool`'s `gas`): 24.
- Twinkling stars (`drawStars`): 19, 21, 23, 27, 29. Falling leaves (`drawLeaves`): 7, 8, 23, 25, and a few in 1, 3, 5, 10, 19, 29; not
  from spruces or far trees.
- Snow (`drawSnow`, "not too much"): 6, 27. Powder off the peaks (`drawSpindrift`): 11. Mist among the far trees (`drawMist`): 9.
- Calm sand (`drawSand`): 4, 21, 13. The user didn't like wind and gusts ("more calm weather"). Spores (`drawSpores`): 12.
- Lava (`drawLava`): 32, 30. Fire (`drawFire`): 32. Torches (`drawTorches`): 22, 28. Spawner flames (`drawSpawners`): 20, 30. Vault
  sparks (`drawVaults`): 20. Lights that wax and wane (`drawLight`): 2, 22, 28, 30, 31, 34.
- Clouds (`drawClouds`), slowly right and back, in every outdoor scene (19 of them), in the same places everywhere; the jungle's crowns hide
  most of its own, and the user chose to leave it.
- Ores and the lantern (`drawSheets`): 2; soul lanterns too: 31. Candle (`drawCandles`): 31. Drips (`drawDrips`): 2, 22. Sculk (`drawSculk`): 31. Wheat (`drawSway`): 18.
- End crystals (`drawCrystals`): 33. End rods (`drawRods`): 34.

Left still: the End's sky, the nether's magma and light.

- `backdropView`'s `draw` ends by describing what moves (`setMotion`: plain data, in CSS pixels); `drawMotion` draws it from
  that and the seconds gone by, nothing else. A new kind of motion: a key in that description, and a line in `drawMotion`.
- `src/backdrop-motion.js` must not use anything else on the page: the gallery runs that same file over its pictures. The
  captures leave the layer out (`.stage-motion` hidden) and put the description in `index.json` (`motion`), so a new animation
  needs its backgrounds captured again and the gallery rebuilt, and then plays there as on the page.
- A block's texture that moves: name it in the scene's `moves` (`["lava", "fire"]`). `movingCells` finds its blocks and, by painting the
  scene twice with a flat stand-in for the texture (`standIns`), the haze and light over them and what stands in front, so they look
  exactly as they did still. One with see-through texels (fire) must be left out of the still picture too (`paint`'s stand-ins); so
  it's missing from the PNG captures, not from the gallery.
- Stars: `drawNight` leaves every other star that nothing covers out of the still picture and lists it (`twinkling`), so the moving
  ones need no cutting out; at 0 seconds (reduced motion) all shine in full.
- Plants that sway: their texture in `LEFT_OUT` and `SWAYS`, and in the scene's `moves`.
- Something that moves behind what stands near (mist): `front` is the near props alone, as a picture, cut out of it.
- Clouds go behind the scene: `cloudFront` is what the still picture covers of their strip, with small gaps filled in (or they'd speckle
  through leaves). An outdoor scene has `hills` and no `water`, `sky` or `ceiling`; `clouds` makes them fainter (the pale garden).
- Chrome saves power on a low battery: 30 frames a second even for a blank page. Time the drawing itself before blaming the page.
- Leaves: a scene's `leaves` is how many at most (`leavesLand`: blocks over the floor they land, the swamp's water). `leafMotion` finds the
  crowns as they're painted and picks the pack's leaf particle by block and tint (`leafSheet`); the pack has no cherry petal (`CHERRY_PETAL`).
- Blocks that simply play their texture's frames: an entry in `SHEETS` and its name in the scene's `moves` (`sheetMotion`, `drawSheets`); `"light"` in
  `moves` makes the scene's lights wax and wane; `drips` picks which dripstones drip (the user wanted two, not all). The pack has no lapis
  glint: `lapis_frames` in `import_textures.py` makes it.
- Light drawn at less than full strength: a frame and the next must share it out (`lighter`, 1 - fade and fade), or it pulses at every frame.
- Working out what moves takes up to 90 ms (the nether): `show` redraws only for another biome.
- A near prop is hazed less than the wall (`mist`), so it stands out lighter; where the user wanted it in the wall's tone (the cave's and the mineshaft's ore mounds), shade
  its blocks by the difference (`oreMound`'s `tone`).
- The gallery cuts the moving layer off at the ground strip (`clip-path`), which is in front of it on the page.
- Dim scenes: what glows in the game is too faint to see move under the scene's shade (the user asked for more glow on the sculk). Add its
  bright texels again over it, unshaded (`glowSheet`, `SCULK_GLOW` is how strongly; `drawInScene`'s `bare`).
- A check for movement must compare colors, not only alpha: sculk changes color in place.
- Small things (flakes, leaves) at a texel a CSS pixel were too small to see: draw them 1.5 to 2 times that.
- Whole animated textures are in `art/frames/` (`FRAMES` in `import_textures.py`, `ART_FRAMES` on the page); speeds come from the
  pack's `flipbook_textures.json` (`../textures/full-pack/subpacks/SP2/textures`). The lavafall runs at 4 texels a second, not the
  pack's 1, so it shows.
  `art/lava.png` is older than the folder's `lava_still`, which is what moves.
- After changing `backdropView`, capture all 34 into the scratchpad and compare with `out`: pixels should differ by 1 at most.
- Reduced motion: it's drawn once and stays still. It stops while the stage is hidden.
- Don't check it in the browser pane: it throttles frames, so it can look stuck. Use a headless Chrome of its own, as `capture.mjs` does.

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
- Near snow as single blocks on one-wide steps touches only at the corners and looks like it floats: make it one sheet, each column's snow
  reaching down beside the next lower one's (the peaks' crags).
- After every change, capture and look before reporting.

## The Mobs tab's controls and facts

- Name tag picker under the stage (`renderTry` in `src/mob-ui.js`): **No name** and one dropdown button per section; no names
  outside a section. `tagGroup(t, mob)` picks a name's section, by the rules in the comment above it; a mob's own sections
  (the sulfur cube's Sports and Billiards, the parrot's Birds) are in `TAG_GROUP_MOB`, the order in `TAG_GROUP_ORDER` (a new
  section must be added there). A dropdown shows one spelling per name, not "Halloween" or "Festive" where it has another
  (`groupSay`); the Name tags section below lists every spelling. Picking No name or another mob closes the open section.
- A mob's extra choices that combine with its variants go in `MOB_ROWS` (`src/mob-data.js`): `skins` there are keyed by the
  texture the variant ended up with (`pickedSkins`), and a kind's `layers` (model -> layer) are drawn over the look's own
  (`extra` in `src/mobs.js`). The bee's Nectar is one: its pollen specks come from `pollen()` in `import_bee.py`. A calm baby
  bee looks the same with nectar, because the pack draws a baby's specks inside its body.
- `VARIANT_LABELS` names a variant row something else (the bee's is "Mood").
- Overview: the last box lists the mob's dimensions, one per line (`MOB_DIMENSIONS` in `src/mob-info.js`, only for mobs in
  more than one). Anything else about dimensions goes in the mob's `about` (Good to know), never in a row of its own, and
  isn't repeated from Spawns.
- The unpacked Actions & Stuff pack is `../textures/full-pack`. `src/mob-models.js` is generated; change it through the import
  scripts (they only write with `--write`).

## The Potions tab

Was the Brewing Guide (`#brewing` still opens its Brewing section). It's laid out as the Mobs tab is and uses its styles (`src/mob.css`).

- `src/brew-data.js`: recipes and durations (`POTIONS`, also used by the trades, and `BASE_POTIONS`). `src/potion-data.js`: everything else it
  tells, from the Minecraft Wiki, by edition where they differ (`forEdition`). `src/potion-ui.js`: the tab; it loads after `mob-ui.js`, whose helpers it uses.
- The picked strength and bottle (`brew.mod`, `brew.form`) go through every section; the buttons are under the stage and again in Brewing.
- The stage is the armor stands' (`.prop-stage`: plain sky, CSS clouds, plains grass) for every potion: the user chose it over a background for each.
- `potionIcon(form, color)` finds the pack's own bottle by the potion's color, so colors must stay unique (`drink_`, `splash_`, `lingering_` and `arrow_`
  in `art/`; `POTIONS` in `import_textures.py`). Effects' icons and the swirls are in `art/effects/` (`EFFECT_ART`).
- Left out: Luck and Decay (can't be brewed) and Freezing (2026's last drop; the pack has no bottle for it yet).

## The Banners tab

A banner designer (2026-11-26), laid out as the Potions tab is, with its stage (`.prop-stage`). `src/banner-data.js`: the patterns, the banner pattern
items and the facts (`SHIELD_FACTS` for shields); `src/banner-art.js`: the banner being designed (`bnr`, saved as `banners-v1`), its names and its pictures,
as a banner and on a shield; `src/banner-ui.js`: the tab. `banner-data.js` and `banner-art.js` load before the Equipment tab, which puts the design on its
shield; `banner-ui.js` after it. All the scripts are one script: a `const` of a later file can't be read while an earlier one runs at load (the Equipment
tab draws then), not even with `typeof`.

- The pack has only the plain banner (`entity/banner/banner_base`: white cloth, pole, bar) and the ominous one (`banner_pattern_illager`, which it redraws:
  a gold cross on black). The patterns are the games' own: `import_banner_patterns.py` downloads Java's (misode/mcmeta, assets branch) and Bedrock's
  (Mojang/bedrock-samples) and keeps only their alpha, one atlas per edition (`art/banners/java.png`, `bedrock.png`, 44×42 each: the flag's box UV, front and
  back), and copies the pack's two banners. `build.py` embeds them as `BANNER_ART`.
- `bannerTexture` colors the flag: each layer's dye as solid as the pattern there, over the base's, times the pack's cloth (its weave). Java's own patterns
  have a grain in their grays; it's dropped, so both editions share the pack's cloth.
- Patterns are kept by shape under Java's ids. The editions' shapes differ a little (Bedrock's edges are sharper, the gradients differ), so each edition
  draws its own. Bedrock's four diagonal halves have each other's names and textures (its banner_diagonal_left is Java's diagonal_up_left): the importer maps
  them (`BEDROCK_SHAPES`) and `be` in `BANNER_PATTERNS` names them. Bedrock also calls stripe_bottom and stripe_top Base Fess and Chief Fess. Names come from
  both games' language files.
- The stage is the game's banner model (`BANNER_CUBES`: the flag 20×40×1 hung in front of the pole), its flag swaying as Java's does (`bannerSwing`).
- The ominous banner: in Java eight layers on white (`OMINOUS_LAYERS`); in Bedrock an item of its own, drawn as the pack's picture with no layers (`ownOminous`).
- Checked against the games' files: names, the pattern items' recipes, which patterns need an item (Java's tag `banner_pattern/no_item_required`), the
  Snout (bastion_other 9/89), Flow (ominous vault 0.75 × 2/10) and Guster (vault 0.25 × 2/12) chances, and the master cartographer's Globe (8 emeralds),
  the same in both editions. From the wiki only: Bedrock's crafting-table patterns (their recipes aren't in bedrock-samples, so the page doesn't list them),
  the layer limits, copying, washing, shields, maps and the ominous banner's rules.
- Not done, and could be offered: Bedrock's crafting-table recipes.

### On a shield (2026-11-26)

- "Show: Banner / Shield" under the stage (`bnr.view`, `onShield`). Shield: the pack's shield (`SHIELD_CUBES`, standing on its edge, `shieldModel`) turning
  as the banner does, without sway; the picker's tiles, the layers, the title and the tooltip show the shield (`designImg`, `shownSlot`), and the loom plan
  ends with crafting it onto a shield (`shieldStep`). The ominous banner too: one step, as it can't be made.
- In the Shield view, "Hold it on the Equipment tab" ("See it" once it's on) puts the shield with the banner in the off hand (`pickGear`, `banner: true`),
  keeps the rest of the set, opens that tab (`showView`, as the hash changes later) and focuses the off-hand slot (the user asked for it).
- Both games draw a shield's patterns from pictures of their own, not the banner's squeezed: Java's `entity/shield/<pattern>.png`, Bedrock's
  `entity/shield_patterns/<pattern>.png`, 10×20 on the plate's front inside its one-texel rim (`SHIELD_AREA`). Their alpha is the same in both
  editions once Bedrock's diagonal halves are mapped as `BEDROCK_SHAPES` maps its banners' (its shield files swap them the same way); their grays differ.
  The game multiplies each layer's dye by the pattern's gray, so shields keep the gray (`shield_<edition>.png` is gray and alpha), where banners use the
  pack's cloth: the pack has no cloth for a shield. The pack has only the plain shield and Bedrock's ominous one (`shield_patterns/illager`), which it
  redraws as a whole shield (opaque everywhere), so in Bedrock that's drawn alone; Java's ominous banner goes on as its 8 layers.
- Names: "<Color> Shield" from the banner's color in both languages' files; neither names an ominous shield (shown as White Shield). Java's recipe is `shield_decoration` (any banner); Bedrock's isn't in bedrock-samples.
- From the wiki's Shield page: only a shield without patterns takes one, it keeps durability and enchantments, it can't be washed, an anvil keeps the
  patterns, two crafted together lose them, a grindstone keeps the top one's. The Ominous Banner page couldn't be read (the fetch was refused):
  how each edition names and lists an ominous shield is from the files and the recipe, not checked.

## The Fireworks tab

A firework designer (2026-11-26), laid out as the Banners tab is, with its stage (`.prop-stage`). `src/firework-data.js`: the colors, shapes, words,
limits and facts; `src/firework-ui.js`: the tab (the rocket is `fw`, saved as `fireworks-v1`). It loads after the Banners tab and uses its `bnBtn`, and the
Potions tab's `countSlot`.

- A rocket is `fw.stars` (each `colors`, `fades`, `shape`, `trail`, `twinkle`), `fw.flight` (1 to 3) and `fw.pick`, the star the designer beside the stage
  edits. The grid's 9 slots are the limits: a star's dyes are 8 less its other ingredients (`fwMaxDyes`), a rocket's stars 8 less its gunpowder
  (`fwMaxStars`); fades up to 8. Two of a dye count twice, as in the game.
- A new star has no color (the user's wish): it's made once it has a dye (`fwMade`), and only then is it on the stage beside the rocket and in
  the launch; until then it's on the stage as the plain gray star, and its row says to pick a dye.
- The stage (`fireworkScene`): the rocket and every star as `itemBoxes`, in a row (`FW_APART`), each turning on its own bone; the user wanted
  them all, not only the picked one. The rocket stands apart on the left (`FW_ROCKET_GAP`), the stars on the right, one alone in the
  middle of that side; more than 2 stars go in two lines (the user's choice), the first half further back and higher (`FW_BACK`, `FW_LIFT`), with
  no shadows (they'd fall in the sky, behind the ground strip), the rocket half way up beside them. Launch it (a button
  with the stars) and it goes off instead, then they come back; changing the rocket stops it. With less motion it's drawn still, 12 ticks after it bursts. It plays on the day stage: offered a night sky,
  the user chose to keep it by day (2026-11-26).
- The show (`src/firework-show.js`): `fireworkShow` works it out tick by tick as Java's code does (FireworkRocketEntity's climb, Starter's shapes one
  star every other tick, SparkParticle's slowing, fall, fade out, fade color, trail and twinkle, the flash). Its numbers are from memory of Java's
  code, checked against the wiki's particle counts (98, 386, 121, 265, 70). It's played through once first with the same seed (`extent`, `aim`,
  `face`) to frame it: the burst true to scale (`fireworkFrame`), the climb squeezed to reach it from the ground, sideways drift as much, and the
  view turned to face the first creeper's face (its angle is random in the game). The burst is never lower than half way up: a
  burst goes on up with half the rocket's speed (about 15 blocks at flight 3), and fitting that by bursting lower left no climb to see. Sparks are drawn twice the game's size (`FW_GROW`).
- Its textures are the pack's own: `particles.png` row 12 is the spark (frame for frame Java's spark_0 to 7; Bedrock's particle files use rows 9 to
  11, not 12, so its code-driven fireworks do) and the 32×32 glow at 32,16 the flash (`import_firework_particles`, into `art/effects/`). The pack
  hides the flying rocket (its `entity/fireworks.png` is one clear texel), so only its trail shows.
- New sparks made while the others move (trails) must join after, not during the `filter`, or they're lost (they were, at first).
- A heavy rocket (five large balls with trails) is about 25,000 sparks: 23 ms to draw a frame at 1000×600, 60 ms to work out its frame at launch.
- To look at frames: in a headless Chrome, `calmMotion = () => true`, then `fireworkView.frameAt(stars, flight, seed, ticks)` and screenshot
  `#firework-stage` (its rect plus the scroll: the clip is in page coordinates).
- Icons: the pack's rocket (`items/fireworks`, `firework_rocket` in `FILES`) and star. The pack's star is one TGA, its gray ball at alpha 3 and the middle
  the game colors at alpha 255; `art/` drops texels under alpha 64, so `import_firework_star` splits it into `firework_star` and
  `firework_star_overlay`. The middle is multiplied by the colors' average (`fwTint`; Java's item model `items/firework_star.json` tints it with
  `minecraft:firework`, default -7697782 when it has none).
- From the games' files: Java's recipes (`firework_star`: its `shapes`, `trail`, `twinkle`; `firework_star_fade`; `firework_rocket`, 3 a craft), the tags
  `skulls` (any head makes a creeper) and `dyes`, both language files' words (Bedrock's shapes are "Small ball explosion" and so on, and its light gray
  key is `silver`). No loot table or trade in either game has a firework (26.3's abandoned camps had them in a snapshot, not now). Bedrock's firework
  recipes aren't in bedrock-samples.
- From the wiki only (they're in the games' code): the explosion colors (the Dye page's firework colors, one for both editions, not the dyes' own),
  the lifetime and heights, dispenser and crossbow distances, the explosion's (5 + 2 per star) and a crossbow hit's damage, elytra boosting, Bedrock's
  bone meal, lapis, cocoa and ink sac stars, Creative's rockets, raids, water, portals, pressure plates.
- Tooltips: Java's are as its code writes them (the shape, then each line; in a rocket, a star's lines set in under its shape). Not checked: the order
  of `multiple_stars`' "%s x %s" (shown as "Creeper-shaped x 2", as "%s x%s" is name then count elsewhere) and whether Java groups only stars next
  to each other (all the same ones are grouped). Bedrock's layout isn't documented: the same layout in its words, one line per star.

## The Decorated Pots tab

A pot designer (2026-11-26), laid out as the Banners tab is, with its stage (`.prop-stage`). `src/pot-data.js`: the sides, the sherds, where
they're found and the facts; `src/pot-ui.js`: the tab (the pot is `pot`, saved as `pots-v1`: each side's `brick` or a sherd's k, and the side picked).
It loads last and uses the Banners tab's `.bn-steps`, and the Potions tab's `countSlot`.

- The model is the game's (Java's DecoratedPotRenderer, and the pack's own held pot, `geometry.oreville_ans.cdgesc`: the same shape): a body
  14×16×14, a neck 6×1×6 and a lip 8×3×8 (`potBoxes`). Its textures are the pack's (`import_pots.py` into `art/pots/`, embedded as `POT_ART`, decoded
  as the banners' are): `decorated_pot_base` 32×32 (the lip at 0,0 and the neck at 0,5, both upside down as the game turns them, so the lip's top
  is its box's bottom, the dark opening at 16,0; the body's top at 0,13, its bottom at 14,13), and each side 14×16 from columns 1 to 14 of
  `decorated_pot_side` or `<k>_pottery_pattern` (their outer columns are clear). Nothing came from the games' files: the pack has it all.
- Its front faces the camera at rest (low z), its left is the camera's left (low x); each side upright and not mirrored from outside
  (`potAcross`). Checked by drawing all four sides with different sherds.
- A click (not a drag: under 4 pixels) picks the side under it: the scene is drawn again with each side a flat unshaded color (`pick`, `sideAt`).
  The buttons turn the pot to the side (`face`, eased; at once with less motion). The picked side isn't marked on the pot: a lighter edge looked
  like a flaw in the texture, so it was taken out.
- The tab's button starts with `ui:pot` (the plain side, in `icons5.js`) and gets the pot's own icon once `POT_ART` is in. Don't give it an
  ICONS key defined in `pot-ui.js`: `ui.js` fills the nav first, and `icon()` would cache the book under that name for good.
- From the games' files (Java 26.3, Bedrock 1.26.60): the names (the same in both), the recipes (`crafting_decorated_pot` names back, left,
  right, front; `decorated_pot_simple`, 4 bricks), the tags (`decorated_pot_ingredients`, `breaks_decorated_pots`: swords, axes, pickaxes,
  shovels, hoes, trident, mace; `prevents_decorated_pot_shattering`: Silk Touch), the block's loot table (`cracked` drops the sherds), every
  archaeology table (identical in both editions), the trail ruins' processors (a house has up to 6 common and 3 rare suspicious gravel; the roads
  and tower tops only common), the trial chambers' decor pool (pots 10 plain to 1 each of flow, guster, scrape: 1 in 13, the sherd on the
  back) and their pots' loot (`pots/trial_chambers/corridor`, the same in both), the components (`pot_decorations` as {back:{id}, ...}; sherds
  uncommon, `provides_pottery_pattern`), and the advancements. Java 26.3 made the patterns a registry (`decorated_pot_pattern/<k>`).
- Not in any file, and told to the user: which grid slot is which side (Java's code: top middle back, middle left left, middle right right,
  bottom middle front, left as you face the front; recalled, not read), Java's tooltip (back, left, right, front in gray after a blank line,
  bricks as Brick; nothing for an all-brick pot; recalled), Java's two wobbles (a lean when an item goes in, a shake when it can't; recalled).
  Bedrock's recipe isn't in bedrock-samples and the wiki doesn't give its slots, and Bedrock's tooltip isn't documented: both are shown as
  Java's, with no note (see "No commands, no notes on missing Bedrock info"). The wiki's Decorated Pot page has none of these either (read 2026-11-26, up to about 80k characters).
- From the wiki only: storing (one stack, hoppers, droppers, crafters in; breaking or a hopper out), comparators, the vibration (11), what
  shatters it (the projectiles, a rocket-boosted elytra), pistons and explosions (drop the pot), waterlogging, Bedrock having no `cracked` state,
  26.4's mobs breaking pots, Bedrock's achievement.
- The pack has no wobble or light for the placed pot (its MER files glow nowhere; its attachable `gll.json` only poses the held pot): the user
  chose to leave it still (2026-11-26). Don't offer the game's wobble again.
- The sherds' pictures are described by looking at them (`say`); the wiki doesn't describe them.
- New icons in `FILES` (copied alone): the 22 sherds heartbreak's didn't cover, `suspicious_sand` and `suspicious_gravel` (the pack's `_0`), and
  the trial pots' finds art/ lacked (`trial_key`, `music_disc_creator_music_box`, `emerald_block`, `diamond_block`). A prefix match on
  `suspicious_` also caught `suspicious_stew` when copying: check `git status` on `art/` after copying by a pattern.
- Eight tabs make the tab bar wrap to two rows at about 1300 pixels wide.

## No commands, no notes on missing Bedrock info

The user had the Command rows (Java's `/give` to copy, and Bedrock's "/give can't" notes) taken out of the Banners, Fireworks and Decorated
Pots tabs (2026-11-26): don't add one to a tab.

Where Bedrock's facts can't be found (not in its files, not on the wiki), show Java's text for Bedrock as it is, with no note that it's
missing or assumed ("isn't documented", "as in Java", "taken to be the same"): the user doesn't want such phrases on any tab (2026-11-26).
Say what's unchecked here, in CLAUDE.md, and to the user, not on the page.

## The Equipment tab

Was the Anvil Planner (`#anvil` still opens its Anvil plan section). It's laid out as the Potions tab is. The user chose it
to be about items (a sword, in any material), over a tab about enchantments, as the plan is made for one item. On the stage the player wears the
set (2026-11-25: not the item's icon anymore); see "The player on the stage".

- `src/solver.js`: the items (`ITEMS`: all that can be enchanted), the enchantments and the plan's search. `src/gear-data.js`: everything else, from the
  Minecraft Wiki, by edition where they differ. `src/gear-ui.js`: the tab; `src/anvil-ui.js`: its Anvil plan section. They load after the Potions tab, as they use
  `mob-ui.js`'s and `potion-ui.js`'s helpers.
- The picked item is the plan's (`state.item` in `src/ui.js`, saved with the edition under the planner's old key, so saved choices live on). Picking an item
  puts it on (`gear.set`: a slot -> an item and its own material); a slot on the stage opens what's in it, or puts on what usually goes there. It starts with nothing on, and with
  nothing on (`nothingOn`) no item is picked: what's under the stage is hidden and the panel below only says so (the user's wish). `gear.mat` is the
  material picked last, for what's put on next. Each item keeps its own plan, by edition (`gear.plans`).
- The panel under the stage is a block for each thing on, in two groups (Armor, and Weapons and tools for both hands), each the last put on first (`on` in `gear.set`, kept while only its material or costume
  changes), each with its own sections (`gear.sections`, by slot), as the user asked; Your set (`gearSet`) is over them all. Picking a block's section picks its
  item. There's one anvil plan, so only the picked item's block shows it.
- Your set (`gearSet`) adds up what's worn from `gearStats`, so a new stat there goes into it by its label.
- Every section of Equipment, Potions and Mobs keeps the same column, with the search beside it: the user didn't want the anvil plan wider than the
  others. So it's stacked: the books as cards (two columns where there's room), the options, then the plan. Make a new tool fit the column too.
- Villagers' and the wandering trader's sales in Where to find come from their trades (`gearSales`), so they aren't in `GEAR_FOUND`.
- Checked 2026-11-25 against the games' own files (Java 26.3, Bedrock 1.26.60), not only the wiki: every chest, barrel, brushing, fishing and bartering
  chance in both editions, and Java's durability, damage, speed, armor, enchantability, recipes, what each enchantment goes on, conflicts and effects.
  Files: `misode/mcmeta` on GitHub (branches `26.3-data`, and `26.3-summary` for `item_components`) and `Mojang/bedrock-samples` (`behavior_pack/loot_tables`,
  `recipes`), read raw. For a new version check there first; the wiki refuses scripted reads after a few (403), so don't loop over it.
- From the wiki only: mobs' 8.5% drops, the taiga village's armor stands, the ancient city's furnace, Bedrock's damage numbers and enchantment levels,
  and the mace's smash. Not checked: what a hit costs a hoe in Bedrock (left out).
- 26.4 lowers the ancient city's chances (diamond hoe and leggings 15.9%, iron leggings 23%).
- The shield has no item picture in the pack: its icon is its model (the game's: a plate and a handle) in the pack's `entity/shield`
  (`SHIELD_CUBES` in `src/icons5.js`). Don't go back to the drawn one.
- Banners (trades, Armor Stands) have no item picture either. The user chose the pack's own banner in the hand (`attachables/gvu.json`, painted per dye,
  16 pixels tall; `import_banners`) over the inventory's big model (`entity/banner/banner_base`), which is a plain plate at icon size. No trade or
  equipment icon is hand-drawn now but the arrow between slots.
- The pack has the leather tunic only in the pale tones the game colors; the other leather pieces are brown. `import_leather_tunic` gives it their browns
  (so `art/leather_chestplate.png` isn't a plain copy).
- Two functions with one name in different files don't fail the syntax check: the later one silently wins (a second `modelBoxes`, the
  mobs', broke the page). After adding any, list every top-level name in `src/` and look for doubles.
- Numbers are in the body font: the pixel font's 2 and 8, and 5 and S, look alike.
- `import_textures.py` run whole rewrites every texture: 30 of the folder's pictures differ from `art/`'s (potions, sand, dripstone, doors, TNT...). After
  running it for a new texture, put the others back with `git restore` (new files stay), unless the user wants the refresh; but not a changed file that
  isn't committed yet. Better: import it as a module and call only the function needed (`import_banners(out)`).
- To check a change here: render every item, material, section and edition (`gearSections`, `renderGear`) and look for errors, "undefined" and "NaN", and
  compare the plans (`renderPlan`) with the committed page's. Compare pages with a fresh browser profile each, as they share saved settings.
- Told to the user and left: the planner's rules still end with "Icons are original pixel art drawn for this page", the tab still says "Changes coming".

### The player on the stage

- `src/player.js` makes up a look (`playerLook`) that `mobScene` draws as it draws a mob (its key is `player:<skin>/<things>`). `src/player-models.js` and
  `art/mobs/player_*.png` are written by `import_player.py`; its header says how the game places an attachable (bound bones, parentless ones 24 down, texture
  meshes in y-down axes), worked out from Mojang's bedrock-samples (its `geometry.shield`, `geometry.humanoid.custom`) and checked by looking. Read it first.
- Skins and Morphs are two groups in the picker (the user asked for it; Rana and Lucy are in both), one list in `PLAYER_SKINS`: Steve and Alex in both editions, and only in Bedrock the pack's 11 skins (the user says so) and its 12 Morphs (the player entity, `entity/dtr.json`, its setting `pntihm`, `v.tnlxsa`). The
  pack's Steve and Alex are in both, as the user asked (the game's own were tried and the user had them removed: don't bring them back). In Java both fall back
  to Steve, and the pick is kept.
- A Morph's drawn on bones of its own (`egjh9` + a bone's name, "morph"), and what's worn on the plain skeleton, which the pack moves to fit. The pack says which armor
  each hides (`off`) and what of it a helmet or chestplate hides (`hides`). Materials by the words in its bones' names (`BONE_MATERIALS`); `entity_emissive` without
  `_alpha` ignores alpha, so clear texels shine in full (`shine`). Ash, Iris, Rusty and Echo are drawn twice, from two textures (`GLOWING`).
- The pack's own skins are in `../textures/skins` (the user added them 2026-11-25; they aren't in the resource pack): 11 of them, only in Bedrock (`SKINS` in
  `import_player.py`). Its 22 `example_skin_N` (one purple figure with each kind of eyes) are left out. Cooper, Nugget, Gary and others from its changelog aren't there.
- Expressions: the pack draws a face over a skin's own from texels the game doesn't use (`FACE` in `import_player.py`, the layer after the skin's): eyes, brows, and lids as it
  blinks. Steve and Alex have nothing there. The eyes only wander in the idle fidgets (`bjmscc`, 12 of them, after walking and then standing 3 seconds), which aren't in.
- Costumes (`COSTUMES` in `src/gear-data.js`, `costumes()` in `import_player.py`): leather armor with one of ten trims on, in Bedrock only, piece by piece. A costume is
  the worn thing's `trim` (the same as the Trim row's; the Costume row is a second way to pick it, and its None only takes a costume's trim off). In Java that trim is
  drawn as a plain trim. The trims' textures are masks over the leather's sheet (`cdq`, alpha 127 hides), and the cubes are the leather models' own. The pack doesn't
  name the Silence one (the hazmat suit), and its list has the Host trim in the wrong place. Where its templates are is `TRIMS`' (the costumes had their own before;
  the Eye's was missing the stronghold library, where every chest has one).
- Stances: the pack's own third person controllers (njvelc for what's held, knoyhk for a spear), at a standstill: `this` is 0, `q.modified_move_speed` 0. What's keyframed
  plays once as it's taken in hand (a loop's `once` and `at`) and holds its end; armor pops on (`GEAR_POPS`). The pack's stances and armor are used in Java too.
- Tools are the game's flat pictures: the pack's 3D ones are a setting that starts off. Not done, and told to the user: the pack's armor shimmer
  and the 3D tools.
- Trims, dye and enchantment (2026-11-26) are a worn thing's `trim` (a `TRIMS` key) and `trimMat`, `dye` and `glint`, set in the rows under the stage
  (`renderLooks`) for the picked item; `wornLook` passes them to `playerLook` as `key+trim=<trim>.<palette>+dye=<color>+glint` (`wornParts`). A costume is just
  leather with that trim in Bedrock (`costumeOf`); it draws no trim or dye. In Java the same trim is drawn as a trim.
- Trims (`trims()` in `import_player.py`): the pack's grays on its big armor sheets, recolored as they're drawn (`trimTexture`) from the game's key palette
  (bedrock-samples' `trim_palette`, not in the pack) to the material's (`TRIM_COLORS`); `_darker` on armor of the trim's own material. The pack's palettes
  are at alpha 7 with an emissive material, so trims glow (`lit`); `copper_darker` isn't in the pack, so the game's is used, unlit. Each armor has its own
  trim model (`ttywjo`; leather's costumes-off one, `mocaaj`, as the other leaves the costumes' trims out). The pack's Shaper has nothing on the netherite
  chestplate. Templates' chances are from both editions' loot tables (they differ only for the vaults').
- The pack takes a mace in both hands even with a shield in the other (only the axe has a one-handed hold), so the shield's edge came out through the
  left shoulder pad. With both, the pad's outer 6-wide cube is left out (`unshelled` in `src/player.js`); the 5-wide one inside stays. The user didn't want the
  whole pad hidden, nor the stance changed.
- The empty main hand's outline is the pack's smithing table sword (`import_slot_sword`), in the empty armor slots' color: the pack has no empty hand
  slot, and the faded iron sword it had before looked wrong to the user.
- The shield's Banner row: None, or the Banners tab's banner, which it follows live (the user's choice over copying it once or saved designs). The worn
  thing has `banner: true`; `wornLook` adds `banner=<designKey>` in the edition picked, so it's drawn again when the design changes (`renderBanner` calls
  `renderGear` while it's on). `bannerShield` (`src/player.js`) makes its texture, `shieldIconOf` its icon (the plain icon's view, `shieldIcon(boxes)`),
  `wornIcon` puts it in the slots, picker and block title, and it's named as the game names it (`shieldName`). Its facts are in `lookFacts`.
- Enchant everything (every worn thing; Take every enchantment off once all are) is in the top row under the stage, beside Take everything off, as the
  user asked; shown with two or more on.
- Echo's hood (a 9-wide cube round its head) showed through every helmet's top, as the pack leaves it; under a helmet that cube is left out
  (`UNDER_HELMET`, `hooded` in `src/player.js`), as the user asked.
- Dyed leather: `dyedLeather` colors the raw sheet (`player_armor_leather_dye`) as `leather_texture` does undyed. The leather icons stay brown. How each edition
  dyes it (`DYE_HOW`) was checked on the wiki: Java in a crafting grid, Bedrock in a cauldron of dyed water; plain water washes it out.
- Textures the page makes as it draws (a trim in a material, dyed leather) go in `mobTextures` under names of their own (`madeTexture`). A trim's texels are
  at alpha 7 (lit), so `drawnModel` takes the faintest that shows (`least`), or it drops every cube.
- Saved sets from before trims: a costume's `trim` stays, and gets the usual trim material (`gear.trimMat`, the one picked last).
- The new icons (the 8 templates the costumes didn't have, the amethyst shard, the resin brick) are in `FILES` in `import_textures.py`; they were copied alone, not by
  running it whole.
- To look at the player up close: in a headless Chrome (as `capture.mjs` starts one), `playerLook(who, {slot: wornLook})`, then `lookBoxes` (with
  `moving: motionPose(look.motions, t)` for the stance) and `renderScene` at a big scale, saved as a PNG. After a change to the player, hash every
  `GEAR_WORN` thing alone on a few bodies on the new page and the committed one (`git show HEAD:index.html`): they should be the same.
- Enchanted: the page's own shimmer (`flags.glint`, the Mobs tab's) on everything of the item, not its trim. Its icons (stage slots, picker, block titles) are
  wrapped by `shimmer` in a span the shimmer fits exactly (`.icon-glint` in `src/gear.css`): a fixed 32px one was bigger than the slots' 30px icons and pushed them
  up, which the user saw; and a slot button's own `::after` is its name. The pack's own enchanted look (a colored outline and glint, its Enchantment Effect Colour
  setting) isn't drawn.
- The elytra (Java's ElytraModel) and the rod (Java's handheld_rod) aren't in the pack as models. Leather is baked in its undyed color; dyed, it's `dyedLeather`.
- The stage always frames the player the same (`PLAYER_FRAME`, a look's `framed`), whatever they wear.
- `renderScene` draws rows without glass, beams or doorways face by face (`plainRow`, `plainFace`), reading the texels itself where a box has `paint` (`modelBoxes`): 5 to 7
  times as fast as a ray for each pixel (an iron golem at 2×: 186 ms to 28), and the same to the pixel (670 looks, two views each, compared 2026-11-25). A change to
  `modelBoxes`' `color` must go in `paint` too, and the other way round.

## Finding what's unused

The cleanup of 2026-11-24 removed 43 textures from `art/` and some dead code. To check again: searching for a name isn't proof,
since many are built at run time (`egg_${k}`, `coral_${a}`, the bee's `${model}_pollen`: `new_bee_qween_pollen` was
called unused once, and is the Qween bee's nectar). Make a copy of `index.html` with `ART`, `SKINS` and `MOB_SKINS`
wrapped in a Proxy that records reads (serve it from `tools/backdrops/out`, and delete it after), then draw every background
and icon, every villager and every mob section; for mob textures and models, walk the evaluated data tables instead. Unused
JS names: TypeScript's `noUnusedLocals` over the scripts in `build.py`'s order. Compare every background and icon with the
committed page afterwards. When removing a texture, take it out of `FILES` in `import_textures.py` too.

## Armor Stands, section by section

The user reviewed the tab's sections one at a time (`PROP_GROUPS` in `src/prop-data.js`, more in `prop-data-more.js`). Done:
Plushies, Rugs and Canopies (the carpets, once "Couches"), Presents, Christmas, Halloween, Around the house, Outdoors and Tents (all 2026-11-24): every section; then the Stockings (in Christmas), a checkup of the whole pack, and
every open offer, one by one: nothing is left open. What the user chose to leave is noted below, so don't offer it again. For a new prop or section: every texture must be one from `../textures`, animations and light glow
are added where the pack has them, variants get buttons, and the held item's icon goes in the line under the stage. Show the
result, wait for approval, then update README and this file, commit and push to main. They prefer one question at a time, with a short description and the
options, and ask what something is before deciding: answer from the pack's files and show a side by side picture where it's about looks.

How to do a section (as `import_outdoors.py`, `import_house.py`, `import_christmas.py` and `import_halloween.py`, the fullest, `import_plushies.py`, `import_presents.py` and, for simpler ones, `import_couches.py`, `import_tents.py` and `import_stockings.py` do):

1. Look the props up in the pack, not in the page: `import_additions.read_props()` (the attachables that check §§),
   `im.look(d, rcs, mats, anims, "§§", held=True)` for the layers, `im.scripted(d, "§§", True)` to see which of
   `scripts.animate` are on, and the pack's `animation_controllers` for what those play. The old pack's names are all gone.
2. Old props draw the old pack's sheet (`art/mobs/prop_black_bundle.png`, not in the textures folder). The new pack has most
   props on one sheet, `textures/oreville/ans/dpg`, already in as `new_prop_bamboo`. Compare models and UVs too: many moved. When the
   last prop has left an old texture, delete it.
3. Read the pre_animation line with `v.jxykui`: `Math.mod(v.rczxgr, n)` means n versions, one for each of the stand's poses
   (`rczxgr` is the pose), picked from the render controller's arrays. They go in `PROP_LOOKS`' `variants` (each what differs:
   `layers`, `pose`) and their names in `PROP_VARIANTS`. The keys are scrambled; name them by looking at them. (Bone names aren't: see below.)
   `v.pihgwp` is the stand being hit or its pose changing.
4. A prop's `anim` names its kind in `PROP_ACTS`: `spawn` (played when it's picked), `acts` (now and then) and `turns` (how it
   changes into each variant, else it plays its first act). `spawn` in the pack can be a plain animation with keyframes, not a
   controller's. Bake with `im.baked_act`. Conditional on-the-stand poses (`PROP_LOOKS`' `pose`) must not be baked in twice.
5. Glow: materials that come down to `entity_emissive*` give a layer `lit`. The stage stays by day (the user had the night stage
   removed) and the glowing texels light what's round them (`bloomOf` in `src/mobs.js`), for props with an `anim` so far.
   Check the sheet's MER (`dpi`, green channel) for texels that glow.
6. Item icons: `PROP_ICONS` in `src/prop-data.js`, one entry per item, shown only for the items listed there. Check each one against the folder
   pixel by pixel, and copy a missing one through `import_textures.py` (`FILES`). An item that isn't drawn as a block in the game
   (carpet) needs its own drawing: `ART_TRADES` draws carpets as whole wool blocks.
7. Draw every prop large (`propPicture`) and check its description against what it really is: two plushies were described wrong,
   and the carpets weren't couches at all. The pack names every prop itself, with what it does: `texts/en_US.lang`, the lines with
   `orevilleANSFeatures.prop` (from about 769: what's 45 degrees, cycling, interactive, static). Go by it (the Lime Wool
   plushie is Rana there).
   Draw frames of its animations, and check phone width and the console.

More facts the first two sections found:

- The pack's hint 6 there: some props have another look when the stand is placed diagonally (the candy canes). "Interactive" ones
  play when punched or used, so that's an act (`PROP_ACTS`), not a variant.
- Names under `sound_effects` in an attachable or animation are sounds: the page has none. Particles are `particle_effects` (`src/particles.js`).
- An animation that only shows or hides bones by scaling them from or to nothing: hide them by name (a layer's rules, and an act's
  `show` parts) rather than baking the scale, which would grow over a frame. See `import_couches.py`.
- A variant can have an `anim` of its own (None for none), and `ownFit` to be framed at its own size. A kind without acts or turns plays its
  `spawn` when its variant is picked. A prop lower than `PROP_FLAT` lies flat: no shadow, its slot picture drawn from higher up.
- Order the variants as the user wants, not as the pack does: the carpets start with the rug, the pack's second.
- `boxModel`'s `shift` raises an icon (positive is up). The Villager Trades tab still draws carpets as whole wool blocks; changing
  that was offered, and the user chose to leave it.

What Presents found:

- Bone names are words in a shifted alphabet: read each character as base 36 and take 2 off to get the letter (`lgq` is toy,
  `3gp` box, `4g2d` coal, `gh2im6` opaque): `''.join(chr(97 + int(c, 36) - 2) ...)`. Plain words in them (head, body, hat) are
  left as they are. Geometry, texture, material and animation keys aren't decodable.
- A material with no emissive and no alpha test (`oreville_sxepuo`, `oreville_ytdhnl`) ignores alpha: clear texels are drawn,
  mostly black. `im.look` doesn't say so for props; give the layer `opaqueBones` (the sack's inside).
- `lit` is for the whole layer, so check each bone's texels: glowing ones are alpha 1 and lit in the MER. A whole face at alpha
  192 with nothing in the MER (orange's box) is left unlit, or all of it blooms. Texels lit in the MER but alpha 255 with a plain
  material (the creaking toy's eyes, the coins) only glow with Vibrant Visuals: offered twice, and the user chose to leave them.
- A hidden bone's children aren't hidden with it: rules go by name, so list every bone under it. `["*", true]` as an act's
  `show` shows everything again.
- One act can be shared by props whose animation is the same, with all their bones in it: bones a model lacks are ignored.
- An act that goes up out of the prop: the kind's `reach` (in `PROP_ACTS`) is the height the stage is framed to.

What Christmas found:

- A §§ stand scales its waist to nothing (`xyblkf`), so anything bound to its hand never shows: `im.look`'s last layer is the prop,
  and layers before it (a plain snowball, a plain shovel) are dropped.
- A kind's idle goes in its `loops` (`PROP_ACTS`; `keep`, one that goes on under its acts). What's still in a loop, and an entrance's
  last frame, go in the look's `pose`, and everything else is baked as what it adds to that (`entrance`, `beyond` in
  `import_christmas.py`): so nothing is posed twice. A long entrance is stored in `held` parts, each bone for just the seconds it moves in.
- `blend_weight` isn't baked by `im`: multiply it in yourself (`Prop.at`'s weight; Molang's ease_out_expo isn't in `molang.py`). An
  `anim_time_update` of delta_time * 0.25 is a quarter of the speed. Check how many of the model's bones an animation has: the
  tree's wiggle has none.
- `v.vipnxs` and `v.cdntav` (the side the stand is hit from) have to be given values, or the swing bakes as nothing (`HIT`).
- See-through materials (`oreville_kipfdc`, `entity_alphablend`): `glassBones`, blended by their alpha. Without `DisableCulling`
  ("onesided" in the bone's name): `culledBones`. Drawn without them a globe's far walls hid what's inside.
- `litBones` on a prop blooms too. Use it rather than `lit` where other texels of the layer are faint but not lit (a bee's wings).
- q.body_y_rotation in a controller's arrays picks a look by how the stand is placed: a variant, with its own line in `PROP_SWITCH`.
  A `time_of_day` part (the gingerbread windows) shows its lit state, and the description says when it's lit.
- The pack's list can be wrong: it swaps the two piñatas (warped fungus on a stick is the strider). Go by the model.
- Item icons: the pack's `subpacks/SP2/blocks.json` gives some blocks an inventory texture (`carried_textures`, in
  `textures/blocks/carried`). Leaves (`LEAVES`) and a layer of snow have drawings of their own.
- `renderScene` is slow on props that fill the stage: while they move they're drawn at 1× (`coarse`), at rest always sharp. Time
  them warm, in a real Chrome at scale 2 (the globes run at 20 frames a second).
- After touching the renderer, hash every prop picture and a frame of every mob on the new page and the committed one, and compare.
- Props are landed, even what the pack hangs off the ground (the piñatas, the wreath, the stockings): the user chose to keep it so.

What Halloween found:

- Read the materials off the render controller the prop uses (the one on with `v.eclqlw`), not the attachable's list: half of that list
  belongs to the plain item (the portrait's see-through ones, bone meal's that ignores alpha).
- What the game only does at night (the scarecrow awake, the tombstone's zombie): the user was offered Day / Night buttons and chose
  acts, with the night in the description. Ask again for another one.
- Glow panels (bones `8dgo*`, material nbbfor): a model and layer of their own (`panels_apart` in `import_halloween.py`, flags `glow`,
  `soft` and `eyes` or `halo`), so that an act's `show` can't bring them up as solid planes. `v.habcyx` in their scale is 1 from the
  front: give the cube that size. A prop with panels doesn't bloom as well (both at once washed the vampire's face white). A prop's
  parts in front of a panel hide it (`depth`), which a mob's don't.
- `relative_to` rotation: entity (the zombie's head, the candle in the jack o'lantern): `level()` works it out with matrices; taking
  the parents' angles off one by one is only right for small turns. The head's angles must be kept near the last frame's.
- A look's `gaze` (bone, how far for each degree round and above) follows the stage's camera, an act's `faces` turns a bone to it.
- `buried` (a layer): only what's over the ground shows (the zombie). A kind's `low`: how far under its feet an act reaches, so it isn't
  cut off by the stage's edge (the portrait's arms, the coffin's door). Measure it, don't guess: project the corners at every moment.
- `bloomOf` is brighter or fainter as small lit texels move by a pixel (it works in 16-pixel cells).
  Moving eyes would pulse; give them panels, or fix it first.
- Particles: `PARTICLES` in `src/particles.js`, written by hand from the pack's particles folder (each says which). A look's `emits` go on,
  an act's `puffs` burst; the player draws over the cached scene where only they move. Textures in `STAGE_PARTICLES`
  (`import_models.py`). A particle with a locator the model lacks comes from the stand's feet. `Math.random` in a size or an acceleration
  is taken again every frame. Follow the attachable's `particle_effects` (a name it lacks plays nothing: the Christmas tree's).
  A look's `reach` makes room for what rises (the chimney's smoke, which made it smaller).
- The jack-in-the-box is framed for the creeper at full stretch (`reach`), so it's small when shut: the user chose to leave it, and the chimney as small as it is for its smoke.

What Around the house found:

- The list in the user's prompt (from the last section's survey) can be wrong too: check each claim. The cobweb, copper bulb and copper
  lantern are the sports nets, the scoreboard and the spotlight; the globe and the lava lamp do move; the banner's layers weren't the Stockings.
- A banner alone shows nothing: its plain model is bound to the stand's shrunken hand. With leather boots of one of the 16 dyes it's a
  flag, four poses in 16 designs. That second choice is a row of its own, `PROP_ROWS` (`src/prop-data.js`): `PROP_LOOKS`' variants hold a
  look for each of the first kind's poses, then the second's, and so on. With anything else in the hand the boots are the Stockings.
- A pose can be read without `v.jxykui` (`v.rczxgr==n` in a pre_animation line: the scoreboard's digits, by part_visibility).
- What changes on its own by a timer in a render controller (arrays picked by life_time, part_visibility by time_stamp) goes in a look's
  `cycles`: [seconds each, bones shown one at a time]. Each moment is drawn once and kept (`drawn` in `src/mobs.js`), so it stays sharp.
  Several geometries become one model, a bone for each (`fire_model`).
- `beam` (a layer's flag): light added over what's behind it, fading along its cubes' v, going through its colors; not in the bounds. A
  negative cube (`turned_out`) is inside out: a bone of its own in `insideBones`, or its far walls are drawn in front (the fireplace was
  a flat orange sheet, the lava lamp a solid block).
- `sunk` (a look) with `buried` (its layer): how far into the ground it stands. `low` and `flat` can be a look's too. Check every prop's lowest
  point (`boxesBounds` on `lookBoxes`): landing it lifts what the pack sinks.
- A layer left unlit drops its texels under alpha 128, so a glowing one (alpha 1) becomes a hole: the skull's pupils. Scan for texels of
  alpha 1 to 127 on bones that aren't lit, glass or opaque, and give those bones `litBones`.
- A panel the pack doesn't turn to the camera (no animation on its bone) is `flat`, as well as `eyes`. A panel that's a cube round something
  (the soul lantern's) is held out past that thing's corners, or its frame hides the light.
- A flame is one particle that stays (`flame`, `candles`): starting a new one every time round left a frame without it, which the user saw.
  Check that nothing that goes round leaves a gap: count its pixels frame by frame. A particle's x is the other way round from the model's.
- im.look's `pose` is everything the name turns on, loops and entrances too: don't take it as the rest pose.
- BSD sed has no \b (use perl), and all the scripts share one scope: a new top-level name can clash (`CANDLE`). Check the whole page loads.
- The importers rewrite `particle_z.png`, `prop_lava_bucket.png`, `prop_carrot.png` and `prop_water_bucket.png` with the same pixels: `git checkout` them before committing.
- The user had the strider piñata moved from Christmas to Around the house, beside the llama (its importer is still `import_christmas.py`). The
  White Candle (the pack's "Festive candle") went to Christmas (its importer is still `import_house.py`).
- The fireplace jumps partly off the stage as it lands: framing it for that would make it a quarter smaller, and the user chose to leave it.

What Outdoors found:

- A prop can be the stand's own: the glow item frame's doorway is on `minecraft:armor_stand` (`v.wrnkzf`), the item adds only its frame and chairs.
  Where a prop makes no sense, look for its bones' words ("backrooms") and materials (`gbgjhb`, a stencil) in the entities too.
- A room behind a doorway: its layers are `room` (with `wrap`, a texture that goes on, and `bare`, unshaded), the doorway's `portal`. They're drawn in
  perspective (`doorwayRoom` in `src/villager.js`), whatever the stage's own camera. It opens by how near the camera is; here as an entrance and
  acts. "Shut" is a slit 1/32 wide in the pack. 33 ms a frame at 1×, so it's drawn coarse while it moves.
- The fishing rod isn't a prop (bound to the shrunken hand, and the scripts' animations have none of its bones): taken out. The copper torch's fire
  (`wnhqgm`) ends at once, as its expiry only knows the soul torch: the user asked, and it stays without one. The soul campfire is the campfire,
  orange fire and all: merged into one prop with both `icons` (`PROP_GROUPS`), and the importer checks they're still the same.
- A particle's `emitter_lifetime_expression` can name the item: read it before adding the particle. And its uv can be an empty corner (`vzoaiu`).
- Array indexes wrap (the windmill's two models for eight poses). Two of a prop's poses can be the same (the sticks': left out).
- A model picked by `anim_time` may only differ in how its texels glow (the brown mushroom's flash): compare the uvs' alpha, not the shapes.
- `evenBloom` (a look): the halo as strong as each texel glows, blurred finely, the same wherever it falls. The old one (`bloomOf` without it) is blotchy
  for small spots, and full strength for half lit ones. Use it for new props. The approved ones look nearly the same from one side, but the old one is off centre and changes as the prop turns:
  compare from several sides. The props with small lights were moved to it (eyes, toys, windows: 14). Kept on the old one, on purpose: the
  spider, squid and warden plushies, the fireplace, the scoreboard, the spotlight and the jack o'lantern (its light spreads better).
- `picks` (a look): bones one of which shows, picked at random as it's shown (what the enderman balloon holds). `sunk` can be negative: how far over
  the ground something that turns must be for its corners to clear it. A particle's `add` is light, `buried` is hidden by the ground.
- Particles that only come at night (the fireflies) or in water (the water wheel's splashes): the first are shown, with the night in the description;
  the second only described.
- An item's `yaw` (`src/prop-data.js`) is how its prop is turned to start with: the doorway faces the reader, so its room shows.

What Tents found:

- A survey's bounds that leave out the cubes' own rotation are wrong: measure the turned corners (`corners` in `import_tents.py`) or `boxesBounds`.
  A slanted pole's foot under the ground makes landing lift the whole prop: `sunk` and `buried`. Check a prop's near corner all the way round on
  the stage, on one that fills it: a look's `low` (its corner's radius times sin of `STAGE_PITCH`) keeps it from being cut off.
- What an item looks like where the pack doesn't say is the game's: Mojang/bedrock-samples on GitHub has `blocks.json`, `terrain_texture.json` and the
  names for each version (wool stairs are drawn in plain wool; the pack's patterned wool is the slabs'). Stairs' icon: the tall half at the back left.

What the checkup of the whole pack and the Stockings found (2026-11-24):

- Every prop in the pack is on the page. Not there, as they aren't props: the empty §§ stand's own pedestal with a floating icon (`djnwuq`, `smsggo`), and
  the `§§§§` / Item stand (`v.jvsiul`), which shows the plain item on it. `Prop` and `prop` are the same as §§, and a sulfur cube named §§ holding a block shows its
  prop too. Sulfur spike's `parent_setup` says it has a prop (`v.hfipcv`), but it has none.
- Comparing `im.look` with and without the name misses what also goes by something else (the boots' color): trace `v.eclqlw` through every script instead.
- Stockings: leather boots worn, by their exact color (16 dyes, eight mixes), not by pose. `PROP_ROWS` without `PROP_VARIANTS`: only colors to pick (`is`, the
  design's name); `worn` on an item says "wearing". Where all of a design is white and glows (the Vibe Cat), the halo hides it: it's drawn without.
- A hook or outline that's inside out: `turned_out`, and `culledBones` for the plain cubes whose material shows one side only.

Anything the pack triggers by the stand's pose is a variant with a button, never something that plays by itself (the user
asked why the reversible squid and ghast weren't). Picking another prop puts its turn and variant back to the start, as the Mobs tab does.
