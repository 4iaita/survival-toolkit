# Survival Toolkit

Planners for the fiddly parts of Minecraft survival, for Java and Bedrock:

- **Anvil Planner**: pick an item and the enchantments you want. It finds the anvil order that costs the fewest XP points (or levels), without any job hitting "Too Expensive!". It searches every possible merge order, so the plan is the true minimum, not a rule of thumb.
- **Brewing Guide**: pick a potion, how strong it should be and the bottle type. It lists every brewing step, what goes into the stand, and how many ingredients and blaze powder you need.
- **Villager Trades**: pick a villager to see everything it buys and sells at each level, or search for an item (or an enchantment like Mending) to find who trades it.
- **Mobs**: every mob and boss you can meet in survival, in 3D. Pick one to see it up close and read about it. Slimes and magma cubes come in three sizes. Every mob that has babies in the game can be shown as a baby, in the pack's baby look. The wolf comes in all nine biome variants, each shown in the biome it spawns in (pale in the taiga, ashen in the snowy taiga, striped in the wooded badlands and so on). The camel comes with or without a saddle. Mobs do things now and then, with the pack's own animations: the camel looks about or sits down, the bat blinks or hangs upside down to rest, the bee blinks, tilts or stings, the armadillo fidgets or rolls up. Some have moods to switch between (the wolf: calm, angry, or a pet with a collar in any dye color and wolf armor, dyed, cracked or enchanted, that now and then shakes itself, or sits or lies down and looks about, falling asleep with Zs floating up when it lies). Its page has one section for now: name tags, with every name that does something to it: the game's own (Dinnerbone, Grumm, jeb_, Toast, Johnny) and the Actions & Stuff pack's for Bedrock (Goldie, Dapper, Krampus, the baby and snowy names and the rest). Try them on its model, or search for a name.
- **Armor Stands**: the Actions & Stuff pack's armor stand props for Bedrock: the decoration each item becomes in the hand of an armor stand named §§. Pick an item to see its prop in 3D.

## Run it

Open `index.html` in a browser. There is no build step needed to use it.

## Edit it

The source lives in `src/`:

- `solver.js`: enchantment data and the anvil merge-order search
- `brew-data.js`: potion recipes and durations
- `trade-data.js`: villager trades by profession and level, the kinds an item can come in (colors, tipped arrows, boat woods) and the enchantments villager gear can carry
- `icons.js` … `icons4.js`: original 16×16 pixel-art icons, drawn from text templates (used where the texture pack has no match)
- `art.js`, `icons5.js`: texture pack icons and which item uses which texture, including job site blocks and village biomes
- `villager.js`: the villager scene: the pack's villager model and skins for each biome and profession, beside its job site block as a 3D block model, turned together by dragging
- `backdrop.js`: each biome's countryside behind the villager scene (hills, trees, a village building and plants), and the forest, cave, nether, End, dragon's island, underwater, lush cave and flooded cave scenes behind the mobs, and the wolf variants' wild biomes (snowy taiga, grove, old growth pine and spruce taigas, sparse jungle, savanna plateau, wooded badlands), built from block textures
- `mob-models.js`: the pack's mob and prop models and how each mob looks with each name (written by `import_models.py`, see below)
- `mobs.js`: draws those models with the villager scene's renderer, plays their animations, and the stage the Mobs and Armor Stands tabs show them on
- `mob-data.js`: the mobs and bosses: their groups (the End's mobs have their own), names and stages, which have babies and which come in variants
- `tag-data.js`: name tags: what each name does, by mob
- `prop-data.js`: the armor stand props: the decoration each item becomes
- `ui.js`, `brew-ui.js`, `trade-ui.js`, `mob-ui.js`, `prop-ui.js`: the five tools and the tool tabs
- `body.html`, `brew.html`, `trade.html`, `mob.html`, `prop.html` and the matching `.css` files: the page

After editing, rebuild the page and the site icons:

```bash
python3 build.py
```

## Credits

Item and block textures in `art/` come from my own texture pack (Bedrock layout, kept next to this project in `../textures`). Every icon uses them: items, blocks (arranged into isometric icons), enchantments, villagers (skins in `art/villager/`, drawn on the 3D villager model), the page backdrop and the site icon (the chest). The page recolors potion liquid and tipped arrow heads for each effect. Only what the pack doesn’t have (the shield, banner and the arrow between trade slots) uses original pixel art drawn from templates in `src/`.

To pick up changes to the pack, copy its textures into `art/` and rebuild:

```bash
python3 import_textures.py ../textures
python3 build.py
```

The name map from pack files to icons is in `import_textures.py`.

The Mobs tab's mobs and the Armor Stands tab's props come from the Actions & Stuff pack itself (`.mcpack`), which keeps its entities, render controllers, models and animations in packed `__brarchive` files under scrambled names. `import_models.py` reads them and runs the pack's own entity scripts and render controllers (with `molang.py`, a small Molang interpreter) once with no name and once for each name the pack checks (mobs that react to no name are listed in `NAMELESS_MOBS`; the tadpole isn't in the pack, so its small model is written out there), to find which model, textures and parts each look uses. It writes `src/mob-models.js` and copies the textures from `../textures` into `art/mobs/`, along with the wolf variants' skins (`WOLF_VARIANTS`) for the stage to swap in and the particles it draws (`STAGE_PARTICLES`: a sleeping wolf's Zs). With an unpacked pack it also takes textures from the pack's own folders. After updating the pack, run it again with the pack's path (the `.mcpack`, or the folder it was unpacked into), then rebuild:

```bash
python3 import_models.py path/to/actions_and_stuff.mcpack ../textures
python3 build.py
```
